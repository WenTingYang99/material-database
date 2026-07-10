function getFilteredAssets() {
  const statusConfig = getAssetStatusConfig();
  let pool = db.assets.filter((asset) => {
    const assetStatus = asset.assetStatus || asset.status;
    if (state.page === "recycle") return statusConfig.deletedCodes.includes(assetStatus) || assetStatus === -1;
    if (state.page === "pending") return isPendingAsset(asset);
    return statusConfig.activeCodes.includes(assetStatus);
  });
  if (state.page === "created") pool = pool.filter((asset) => asset.owner === currentUser.username);
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
    const baseInterior = base.interiorColors || [];
    const targetInterior = target.interiorColors || [];
    const baseExterior = base.exteriorColors || [];
    const targetExterior = target.exteriorColors || [];
    const commonInterior = baseInterior.filter((c) => targetInterior.includes(c));
    const commonExterior = baseExterior.filter((c) => targetExterior.includes(c));
    score += (commonInterior.length + commonExterior.length) * 25;

    const baseRatio = base.width && base.height ? base.width / base.height : 0;
    const targetRatio = target.width && target.height ? target.width / target.height : 0;
    if (baseRatio && targetRatio) {
      const ratioDiff = Math.abs(baseRatio - targetRatio);
      if (ratioDiff < 0.1) score += 30;
      else if (ratioDiff < 0.3) score += 20;
      else if (ratioDiff < 0.5) score += 10;
    }

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
    "素材来源": [getTreeNodeByCode(asset.asset_source, "source")?.name || asset.asset_source || ""],
    "文件格式": [asset.format],
    "品牌": [asset.brand],
    "车系": [asset.series || ""],
    "车型": [asset.model],
    "内饰色": asset.interiorColors || [],
    "外饰色": asset.exteriorColors || [],
    "权限范围": [asset.permission],
    "业务标签": asset.customTags || [],
    "AI标签": asset.aiTags || [],
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
  const startDate = toJsDate(asset.validStart);
  const expireDate = toJsDate(asset.validUntilDate || asset.validUntil);
  const validityConfig = getValidityStatusConfig();
  const validName = getTreeNodeByCode(validityConfig.valid, "asset_validity")?.name || "有效";
  const expiredName = getTreeNodeByCode(validityConfig.expired, "asset_validity")?.name || "已失效";
  const pendingName = getTreeNodeByCode(validityConfig.pending, "asset_validity")?.name || "待生效";
  
  if (value === validName) {
    if (isNaN(startDate.getTime())) return true;
    if (isNaN(expireDate.getTime())) return now >= startDate;
    return now >= startDate && now <= expireDate;
  }
  if (value === expiredName) {
    if (isNaN(expireDate.getTime())) return false;
    return now > expireDate;
  }
  if (value === pendingName) {
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
  const uploadTimestamp = toJsDate(uploadDate).getTime();
  if (startDate && endDate) {
    const startTimestamp = toJsDate(startDate).getTime();
    const endTimestamp = toJsDate(endDate).getTime();
    return uploadTimestamp >= startTimestamp && uploadTimestamp <= endTimestamp;
  } else if (startDate) {
    const startTimestamp = toJsDate(startDate).getTime();
    return uploadTimestamp >= startTimestamp;
  } else {
    const endTimestamp = toJsDate(endDate).getTime();
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
  if (!asset.validUntilDate && !/^\d{4}[-/]\d{1,2}[-/]\d{1,2}/.test(String(asset.validUntil || ""))) return false;
  const today = toJsDate(todayText());
  const expire = toJsDate(asset.validUntilDate || asset.validUntil);
  const days = Math.ceil((expire - today) / 86400000);
  if (value === "30天内") return days >= 0 && days <= 30;
  if (value === "90天内") return days >= 0 && days <= 90;
  return displayValue.includes(value);
}

function updateGroupCounts() {
  db.groups.forEach((group) => {
    group.count = db.assets.filter((asset) => !getAssetStatusConfig().deletedCodes.includes(asset.assetStatus) && asset.groupId === group.id).length;
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
  const groupStatusConfig = getGroupStatusConfig();
  const group = db.groups.find((item) => item.id === groupId && !item.system && !groupStatusConfig.deletedCodes.includes(item.status));
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
  
  const menus = db.menus || [];
  const menu = menus.find(m => m.page === page && m.category === "page");
  if (!menu) return "全部";
  
  const path = [];
  let current = menu;
  while (current) {
    if (current.category !== "root") {
      path.unshift(current.name);
    }
    current = menus.find(m => m.id === current.parentId);
  }
  
  return "全部 › " + path.join(" › ");
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

// ===== 统一日期层：规范存储 = ISO 8601（YYYY-MM-DDTHH:mm:ss）=====
// 显示统一 YYYY-MM-DD HH:mm（与存储一致，全程短横线，禁止 / 与 - 互转）；原生 <input type="date"> 的 value 同样 YYYY-MM-DD，无需转换。
// 所有格式转换收敛到以下函数，禁止在业务代码里散写 replaceAll/replace。

function nowText() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
}

function todayText() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

// 任意输入（YYYY/MM/DD HH:mm、YYYY-MM-DD HH:mm、ISO、永久有效、null）→ ISO 或原样透传
function toISODate(value) {
  if (value == null || typeof value !== "string") return value;
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(value)) return value; // 已是 ISO
  const m = value.match(/(\d{4})[./-](\d{1,2})[./-](\d{1,2})(?:[ T](\d{1,2}):(\d{1,2})(?::(\d{1,2}))?)?/);
  if (!m) return value; // 非日期字符串（如“永久有效”）原样返回
  const [, y, mo, d, h, mi, s] = m;
  const pad = (n) => String(Number(n)).padStart(2, "0");
  return `${y}-${pad(mo)}-${pad(d)}T${pad(h || 0)}:${pad(mi || 0)}:${pad(s || 0)}`;
}

// 用于 new Date() 解析，统一走 ISO，规避浏览器对 YYYY/MM/DD 的解析差异
function toJsDate(value) {
  const iso = toISODate(value);
  return iso ? new Date(iso) : new Date(NaN);
}

// 原生 <input type="date"> 的 value（YYYY-MM-DD）
function toInputDateValue(value) {
  const iso = toISODate(value);
  return iso ? iso.slice(0, 10) : "";
}

function parseDateTimeText(value = "", defaultTime = "00:00") {
  const text = String(value || "").trim();
  const dateMatch = text.match(/(\d{4})[./-](\d{1,2})[./-](\d{1,2})/);
  if (!dateMatch) return null;
  const [, year, month, day] = dateMatch;
  const date = `${year.padStart(4, "0")}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  const timeMatch = text.match(/(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?/);
  const time = timeMatch
    ? `${String(timeMatch[1]).padStart(2, "0")}:${String(timeMatch[2]).padStart(2, "0")}`
    : defaultTime;
  return { date, time };
}

function normalizeDateText(value = "") {
  const parsed = parseDateTimeText(value);
  return parsed ? parsed.date : todayText();
}

function splitDateTimeText(value = "") {
  const parsed = parseDateTimeText(value, "23:59");
  if (!parsed) return { date: todayText(), time: "23:59" };
  return parsed;
}

// 组合为 ISO 存储串（入参 date 已是 YYYY-MM-DD，全程无转换）
function joinDateTime(date, time = "23:59") {
  if (!date) return "";
  const d = String(date);
  const t = String(time || "23:59").slice(0, 5);
  return `${d}T${t}:00`;
}

function formDateTimeValue(data, prefix, defaultTime = "23:59") {
  return joinDateTime(data[`${prefix}Date`], data[`${prefix}Time`] || defaultTime);
}

function formatDateTimeDisplay(value = "") {
  if (!value) return "";
  const parts = parseDateTimeText(value);
  if (!parts) return value; // 非日期（如“永久有效”）原样显示
  return `${parts.date} ${parts.time}`;
}

function dateTimeTextToTimestamp(value = "") {
  const iso = toISODate(value);
  if (!iso || typeof iso !== "string") return 0;
  const timestamp = new Date(iso).getTime();
  return Number.isNaN(timestamp) ? 0 : timestamp;
}

// 启动时对整库日期字段归一化为 ISO（自愈历史上误存为 YYYY-MM-DD 的数据）
function normalizeDbDates(db) {
  if (!db || typeof db !== "object") return db;
  const fix = (o, fields) => {
    if (!o) return;
    fields.forEach((f) => { if (o[f] != null) o[f] = toISODate(o[f]); });
  };
  (db.assets || []).forEach((a) => { fix(a, ["validStart", "validUntil", "validUntilDate", "createdAt", "updatedAt", "deletedAt", "uploadDate"]); (a.logs || []).forEach((l) => fix(l, ["createdAt"])); });
  (db.groups || []).forEach((g) => { fix(g, ["createdAt", "updatedAt", "deletedAt"]); (g.logs || []).forEach((l) => fix(l, ["createdAt"])); });
  (db.shares || []).forEach((s) => fix(s, ["expiresAt", "createdAt", "updatedAt"]));
  (db.assetAcl || []).forEach((a) => fix(a, ["expiresAt", "grantedAt", "createdAt", "updatedAt"]));
  (db.groupAcl || []).forEach((a) => fix(a, ["expiresAt", "grantedAt", "createdAt", "updatedAt"]));
  (db.collectTasks || []).forEach((t) => fix(t, ["expiresAt", "deadline", "createdAt", "updatedAt"]));
  (db.tags || []).forEach((t) => fix(t, ["createdAt", "updatedAt"]));
  (db.operationLogs || []).forEach((l) => fix(l, ["createdAt"]));
  return db;
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
