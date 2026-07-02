function getFilteredAssets() {
  let pool = db.assets.filter((asset) => state.page === "recycle" ? asset.status === "deleted" : asset.status !== "deleted");
  if (state.page === "pending") pool = pool.filter((asset) => asset.status === "pending");
  if (state.page === "created") pool = pool.filter((asset) => asset.owner === currentUser.name);
  if (state.groupId !== "all" && state.page === "all") {
    const groupIds = state.showGroupDescendants ? getGroupDescendantIds(state.groupId) : [state.groupId];
    pool = pool.filter((asset) => groupIds.includes(asset.groupId));
  }
  if (state.similar) {
    const base = findAsset(state.selectedAssetId) || pool[0];
    if (base) {
      const similarMode = document.querySelector("[name='similarMode']:checked")?.value || "content";
      pool = pool
        .map((asset) => ({ asset, score: calculateSimilarity(base, asset, similarMode) }))
        .filter((item) => item.score > 0 && item.asset.id !== base.id)
        .sort((a, b) => b.score - a.score)
        .map((item) => item.asset);
    }
  }
  Object.entries(state.filters).forEach(([label, value]) => {
    pool = pool.filter((asset) => matchFilter(asset, label, value));
  });
  if (state.query) {
    const query = state.query.toLowerCase();
    pool = pool.filter((asset) => `${asset.name} ${asset.format} ${asset.brand} ${asset.model} ${(asset.aiTags || []).join(" ")} ${(asset.customTags || []).join(" ")}`.toLowerCase().includes(query));
  }
  return sortAssets(pool);
}

function calculateSimilarity(base, target, mode) {
  if (!base || !target) return 0;
  let score = 0;

  if (mode === "content" || !mode) {
    // AI标签相似度
    const baseTags = base.aiTags || [];
    const targetTags = target.aiTags || [];
    const commonTags = baseTags.filter((tag) => targetTags.includes(tag));
    score += commonTags.length * 30;

    // 自定义标签相似度
    const baseCustom = base.customTags || [];
    const targetCustom = target.customTags || [];
    const commonCustom = baseCustom.filter((tag) => targetCustom.includes(tag));
    score += commonCustom.length * 20;

    // 品牌/车型相似度
    if (base.brand === target.brand) score += 15;
    if (base.model === target.model) score += 10;

    // 文件类型相似度
    if (base.format === target.format) score += 5;
    if (base.type === target.type) score += 5;
  } else if (mode === "color") {
    // 颜色相似度
    if (base.color === target.color) score += 50;

    // 尺寸比例相似度
    const baseRatio = base.width && base.height ? base.width / base.height : 0;
    const targetRatio = target.width && target.height ? target.width / target.height : 0;
    if (baseRatio && targetRatio) {
      const ratioDiff = Math.abs(baseRatio - targetRatio);
      if (ratioDiff < 0.1) score += 30;
      else if (ratioDiff < 0.3) score += 20;
      else if (ratioDiff < 0.5) score += 10;
    }

    // 文件类型相同加分
    if (base.format === target.format) score += 10;
  }

  return score;
}

function sortAssets(items) {
  return [...items].sort((a, b) => {
    if (state.sort === "素材名称") return a.name.localeCompare(b.name, "zh-CN");
    if (state.sort === "文件大小") return b.sizeBytes - a.sizeBytes;
    if (state.sort === "素材热度" || state.sort === "历史总活跃") return (b.view + b.download + b.share) - (a.view + a.download + a.share);
    if (state.sort === "创建时间") return dateTimeTextToTimestamp(b.createdAt) - dateTimeTextToTimestamp(a.createdAt);
    if (state.sort === "上传日期") return dateTimeTextToTimestamp(b.uploadDate || b.updatedAt) - dateTimeTextToTimestamp(a.uploadDate || a.updatedAt);
    return dateTimeTextToTimestamp(b.updatedAt) - dateTimeTextToTimestamp(a.updatedAt);
  });
}

function matchFilter(asset, label, value) {
  const selections = Array.isArray(value) ? value : (value ? [value] : []);
  if (!selections.length) return true;
  if (label === "上传时间") {
    const rangeStr = selections.filter(Boolean).join("~");
    return rangeStr ? matchUploadTimeFilter(asset, rangeStr) : true;
  }
  if (label === "素材失效日") return selections.some((item) => matchValidityFilter(asset, item));
  if (label === "素材状态") return selections.some((item) => matchStatusFilter(asset, item));
  if (label === "宽高比") return selections.some((item) => matchAspectRatioFilter(asset, item));
  if (label === "文件大小") return selections.some((item) => matchFileSizeFilter(asset, item));
  const haystack = {
    "创建者/创建部门": [asset.owner, asset.department],
    "素材来源": ["内部上传", "AI生成", "外部导入"],
    "文件格式": [asset.format],
    "品牌": [asset.brand],
    "车系": [asset.series || ""],
    "车型": [asset.model],
    "内饰色": asset.interiorColors || [],
    "外饰色": asset.exteriorColors || [],
    "权限范围": [asset.permission],
    "业务标签": asset.customTags || [],
    "AI标签": asset.aiTags || [],
    "颜色": [asset.color],
    "时长": [asset.type],
    "创建时间": [asset.createdAt],
  }[label] || [];
  return selections.some((selected) => haystack.some((item) => String(item).includes(selected)));
}

function matchAspectRatioFilter(asset, value) {
  const ratio = asset.aspectRatio || (asset.width && asset.height ? asset.width / asset.height : null);
  if (!ratio) return false;
  const ratios = getAspectRatiosFromTree();
  const targetRatio = ratios.find(r => r.label === value);
  if (!targetRatio) return false;
  return Math.abs(ratio - targetRatio.value) < 0.05;
}

function matchFileSizeFilter(asset, value) {
  const size = asset.sizeBytes || 0;
  const MB = 1024 * 1024;
  switch (value) {
    case "<5MB": return size < 5 * MB;
    case "5MB～10MB": return size >= 5 * MB && size <= 10 * MB;
    case "10MB～50MB": return size > 10 * MB && size <= 50 * MB;
    case ">50MB": return size > 50 * MB;
    default: return false;
  }
}

function matchStatusFilter(asset, value) {
  const now = new Date();
  const startDate = new Date((asset.validStart || "").replace(/-/g, "/"));
  const expireDate = new Date((asset.validUntilDate || asset.validUntil || "").replace(/-/g, "/"));
  
  if (value === "有效") {
    if (isNaN(startDate.getTime())) return true;
    if (isNaN(expireDate.getTime())) return now >= startDate;
    return now >= startDate && now <= expireDate;
  }
  if (value === "已失效") {
    if (isNaN(expireDate.getTime())) return false;
    return now > expireDate;
  }
  if (value === "待生效") {
    if (isNaN(startDate.getTime())) return false;
    return now < startDate;
  }
  return false;
}

function matchUploadTimeFilter(asset, value) {
  const uploadDate = normalizeDateText(asset.uploadDate || asset.createdAt || asset.updatedAt);
  if (!uploadDate) return false;
  const [startDate, endDate] = value.split("~");
  if (!startDate && !endDate) return false;
  const uploadTimestamp = new Date(uploadDate).getTime();
  if (startDate && endDate) {
    const startTimestamp = new Date(startDate).getTime();
    const endTimestamp = new Date(endDate).getTime();
    return uploadTimestamp >= startTimestamp && uploadTimestamp <= endTimestamp;
  } else if (startDate) {
    const startTimestamp = new Date(startDate).getTime();
    return uploadTimestamp >= startTimestamp;
  } else {
    const endTimestamp = new Date(endDate).getTime();
    return uploadTimestamp <= endTimestamp;
  }
}

function getFilterSelections(label) {
  const value = state.filters[label];
  if (Array.isArray(value)) return value.filter(Boolean);
  return value ? [value] : [];
}

function formatFilterSelections(values = []) {
  if (values.length <= 2) return values.join("、");
  return `${values[0]} 等${values.length}项`;
}

function matchValidityFilter(asset, value) {
  const displayValue = formatAssetValidUntil(asset);
  if (value === "永久有效") return displayValue === "永久有效";
  if (asset.validUntil === value) return true;
  const expireDate = normalizeDateText(asset.validUntilDate || asset.validUntil);
  if (!asset.validUntilDate && !/^\d{4}[-/]\d{1,2}[-/]\d{1,2}/.test(String(asset.validUntil || ""))) return false;
  const today = new Date(`${todayText()}T00:00:00`);
  const expire = new Date(`${expireDate}T00:00:00`);
  const days = Math.ceil((expire - today) / 86400000);
  if (value === "30天内") return days >= 0 && days <= 30;
  if (value === "90天内") return days >= 0 && days <= 90;
  return displayValue.includes(value);
}

function updateGroupCounts() {
  db.groups.forEach((group) => {
    group.count = db.assets.filter((asset) => asset.status !== "deleted" && asset.groupId === group.id).length;
  });
}

function findAsset(id) {
  if (!id || typeof id !== "string") return null;
  return db.assets.find((asset) => asset.id === id);
}

function getGroupName(id) {
  return db.groups.find((group) => group.id === id)?.name || "全部素材";
}

function getAssetGroupName(groupId) {
  const group = db.groups.find((item) => item.id === groupId && !item.system && item.status !== "deleted");
  return group ? group.name : "未分组";
}

function getGroupBreadcrumb(id) {
  if (!id || id === "all") return "全部 › 全部素材";
  const names = [];
  const seen = new Set();
  let group = db.groups.find((item) => item.id === id);
  while (group && !group.system && !seen.has(group.id)) {
    seen.add(group.id);
    names.unshift(group.name);
    group = db.groups.find((item) => item.id === group.parentId);
  }
  return ["全部", ...names].join(" › ");
}

function getPageBreadcrumb(page) {
  if (page === "all") return getGroupBreadcrumb(state.groupId);
  const breadcrumbMap = {
    pending: "全部 › 待入库",
    created: "全部 › 我创建的组",
    activity: "全部 › 更多功能 › 用户动态",
    loginLogs: "全部 › 更多功能 › 用户登录日志",
    tags: "全部 › 更多功能 › 标签管理",
    validity: "全部 › 更多功能 › 有效期管理",
    collect: "全部 › 更多功能 › 收集素材管理",
    share: "全部 › 更多功能 › 分享记录",
    recycle: "全部 › 更多功能 › 回收站",
    valueLists: "全部 › 更多功能 › 值列表管理",
    users: "全部 › 更多功能 › 系统管理 › 用户管理",
    roles: "全部 › 更多功能 › 系统管理 › 角色管理",
    organizations: "全部 › 更多功能 › 系统管理 › 组织管理",
    permissions: "全部 › 更多功能 › 系统管理 › 权限管理",
  };
  return breadcrumbMap[page] || "全部";
}

function getFormat(file) {
  const ext = file.name.split(".").pop()?.toUpperCase() || "";
  if (ext) return ext;
  return file.type.split("/").pop()?.toUpperCase() || "FILE";
}

function isAllowedUploadFile(file) {
  return getAllowedUploadFormats().includes(getFormat(file));
}

function getFormatCategory(format = "") {
  const value = String(format).toUpperCase();
  const categories = getFileFormatCategoriesFromTree();
  return Object.entries(categories).find(([, formats]) => formats.includes(value))?.[0] || "文件";
}

function getType(file) {
  const category = getFormatCategory(getFormat(file));
  if (category !== "文件") return category;
  if (file.type.startsWith("image/")) return "图片";
  if (file.type.startsWith("video/")) return "视频";
  if (file.type.startsWith("audio/")) return "音频";
  if (file.type.startsWith("text/")) return "纯文本";
  return "文件";
}

function formatBytes(bytes = 0) {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)}KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)}MB`;
}

function nowText() {
  const date = new Date();
  const pad = (value) => String(value).padStart(2, "0");
  return `${date.getFullYear()}/${pad(date.getMonth() + 1)}/${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function todayText() {
  const date = new Date();
  const pad = (value) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function normalizeDateText(value = "") {
  const text = String(value || "").trim();
  const match = text.match(/(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
  if (!match) return todayText();
  const [, year, month, day] = match;
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function normalizeDateTimeText(value = "", defaultTime = "23:59") {
  const date = normalizeDateText(value);
  const timeMatch = String(value || "").match(/(\d{1,2}):(\d{1,2})/);
  const time = timeMatch ? `${String(timeMatch[1]).padStart(2, "0")}:${String(timeMatch[2]).padStart(2, "0")}` : defaultTime;
  return joinDateTime(date, time);
}

function splitDateTimeText(value = "") {
  const text = String(value || "");
  const date = normalizeDateText(text);
  const timeMatch = text.match(/(\d{1,2}):(\d{1,2})/);
  const time = timeMatch ? `${String(timeMatch[1]).padStart(2, "0")}:${String(timeMatch[2]).padStart(2, "0")}` : "23:59";
  return { date, time };
}

function joinDateTime(date, time = "23:59") {
  if (!date) return "";
  return `${date} ${time || "23:59"}`;
}

function formDateTimeValue(data, prefix, defaultTime = "23:59") {
  return joinDateTime(data[`${prefix}Date`], data[`${prefix}Time`] || defaultTime);
}

function formatDateTimeDisplay(value = "") {
  if (!value) return "";
  const parts = splitDateTimeText(value);
  return `${parts.date.replaceAll("-", "/")} ${parts.time}`;
}

function dateTimeTextToTimestamp(value = "") {
  const normalized = String(value || "").replace(/\./g, "-").replace(/-/g, "/");
  const timestamp = Date.parse(normalized);
  return Number.isNaN(timestamp) ? 0 : timestamp;
}

function splitTags(value) {
  return value.split(/[,，、\s]+/).map((item) => item.trim()).filter(Boolean);
}

function hideMenus() {
  els.moreMenu.classList.add("hidden");
  els.assetMenu.classList.add("hidden");
  state.activeFilter = null;
}

function showToast(message) {
  const toast = document.querySelector("#toast");
  toast.textContent = message;
  toast.classList.remove("hidden");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.add("hidden"), 2600);
}

function renderEmpty(text) {
  return `<div class="empty">${text}</div>`;
}

function escapeHtml(value = "") {
  return String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
}

function escapeAttr(value = "") {
  return escapeHtml(value).replace(/`/g, "&#96;");
}
