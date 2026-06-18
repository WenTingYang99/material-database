function handleUploadMenu(event) {
  const button = event.target.closest("[data-upload]");
  if (!button) return;
  const action = button.dataset.upload;
  document.querySelector(".upload-menu")?.classList.remove("open");
  if (action === "file") document.querySelector("#fileInput").click();
  if (action === "folder") document.querySelector("#folderInput").click();
  if (action === "cloud") openCloudImportModal();
}

function getUploadGroupOptions(selectedId = "") {
  const current = selectedId || (state.groupId === "all" ? "test" : state.groupId);
  return db.groups
    .filter((group) => !group.system)
    .map((group) => `<option value="${group.id}" ${group.id === current ? "selected" : ""}>${escapeHtml(group.name)}</option>`)
    .join("");
}

function openUploadSettingsModal(fileList, mode = "file") {
  const files = [...fileList];
  if (!files.length) return;
  const sourceLabel = mode === "folder" ? "上传文件夹" : "上传文件";
  const html = renderHtmlTemplate("tplUploadSettingsForm", {
    SOURCE_LABEL: sourceLabel,
    FILE_COUNT: String(files.length),
    GROUP_OPTIONS: getUploadGroupOptions(),
  });
  openFormModal("上传设置", html, (form) => {
    const data = Object.fromEntries(new FormData(form));
    closeFormModal();
    handleFiles(files, {
      groupId: data.groupId || "",
      customTags: splitTags(data.businessTags || ""),
      validUntilDate: formDateTimeValue(data, "validUntil") || "",
    });
  });
}

function openCloudImportModal() {
  const html = renderHtmlTemplate("tplCloudImportForm", {
    GROUP_OPTIONS: getUploadGroupOptions(),
  });
  openFormModal("百度网盘导入", html, (form) => {
    const data = Object.fromEntries(new FormData(form));
    const link = data.cloudLink.trim();
    if (!link) {
      showToast("请输入有效的分享链接");
      return;
    }
    closeFormModal();
    showToast("正在连接百度网盘...");
    setTimeout(() => {
      showToast("此功能需要后端API支持，当前为前端演示版");
    }, 1500);
  });
}

async function handleFiles(fileList, options = {}) {
  const incomingFiles = [...fileList];
  const files = incomingFiles.filter(isAllowedUploadFile);
  const rejectedCount = incomingFiles.length - files.length;
  if (!files.length) {
    if (rejectedCount) showToast("所选文件格式暂不支持上传");
    return;
  }
  if (rejectedCount) showToast(`已跳过 ${rejectedCount} 个不支持的文件格式`);
  showToast(`正在识别并导入 ${files.length} 个文件...`);
  const created = [];
  for (const file of files) {
    const asset = await createAssetFromFile(file, options);
    db.assets.unshift(asset);
    created.push(asset);
  }
  saveDb();
  state.page = "all";
  state.groupId = created[0]?.groupId || "all";
  state.selectedIds = new Set(created.map((asset) => asset.id));
  document.querySelector("#fileInput").value = "";
  document.querySelector("#folderInput").value = "";
  render();
  showToast(`已上传 ${created.length} 个素材，并自动生成内容标签`);
}

async function createAssetFromFile(file, options = {}) {
  const dataUrl = await readFileAsDataUrl(file);
  const format = getFormat(file);
  const info = await getMediaInfo(file, dataUrl);
  const tags = recognizeTags(file, info);
  ensureRecognizedAiTagsInLibrary(tags);
  const uploadDate = todayText();
  const createdTime = nowText();
  const validUntilDate = options.validUntilDate || calculateExpireTime("永久有效");
  return {
    id: `asset-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    name: file.name.replace(/\.[^.]+$/, ""),
    src: dataUrl,
    format,
    mime: file.type || "application/octet-stream",
    type: getType(file),
    sizeBytes: file.size,
    width: info.width,
    height: info.height,
    desc: tags.includes("活动") ? "活动素材" : "",
    brand: tags.includes("标致") ? "东风标致" : tags.includes("雪铁龙") ? "东风雪铁龙" : "",
    model: detectVehicleModel(file.name),
    customTags: options.customTags || [],
    aiTags: tags,
    color: info.color || "未识别",
    groupId: options.groupId || (state.groupId === "all" ? "test" : state.groupId),
    owner: currentUser.name,
    department: currentUser.department,
    permission: "企业内部 - 可下载",
    validUntil: validUntilDate,
    status: "active",
    uploadDate,
    validStart: createdTime.replace(/\//g, "-"),
    validUntilDate,
    share: 0,
    download: 0,
    view: 0,
    createdAt: createdTime,
    updatedAt: createdTime,
    version: `${Date.now()}`,
    logs: [`${currentUser.name} 上传了素材`, `系统识别内容标签：${tags.join("、") || "无"}`],
  };
}

function deleteSelectedAssets() {
  if (!state.selectedIds.size) {
    showToast("请先选择需要删除的素材");
    return;
  }
  db.assets.forEach((asset) => {
    if (state.selectedIds.has(asset.id)) {
      asset.status = "deleted";
      asset.updatedAt = nowText();
      asset.deletedAt = asset.updatedAt;
      asset.logs.unshift(`${currentUser.name} 删除了素材`);
    }
  });
  const count = state.selectedIds.size;
  state.selectedIds.clear();
  saveDb();
  render();
  showToast(`已将 ${count} 个素材移入回收站`);
}

function downloadSelectedAssets() {
  if (!state.selectedIds.size) {
    showToast("请先选择需要下载的素材");
    return;
  }
  const ids = [...state.selectedIds];
  const count = ids.length;

  // 逐个下载素材（浏览器限制无法同时下载多个文件）
  ids.forEach((id, index) => {
    setTimeout(() => {
      downloadAsset(id);
    }, index * 500); // 每个文件间隔500ms下载
  });

  showToast(`正在下载 ${count} 个素材...`);
}

function approveSelectedAssets() {
  const pendingIds = db.assets
    .filter((asset) => asset.status === "pending")
    .map((asset) => asset.id);
  const targetIds = state.selectedIds.size
    ? [...state.selectedIds].filter((id) => pendingIds.includes(id))
    : pendingIds;
  if (!targetIds.length) {
    showToast("请先选择需要入库的素材");
    return;
  }
  const targetSet = new Set(targetIds);
  let count = 0;
  db.assets.forEach((asset) => {
    if (targetSet.has(asset.id)) {
      asset.status = "active";
      asset.updatedAt = nowText();
      asset.logs.unshift(`${currentUser.name} 审核入库了素材`);
      count += 1;
    }
  });
  state.selectedIds.clear();
  if (state.page === "pending") state.groupId = "all";
  saveDb();
  render();
  showToast(count ? `已入库 ${count} 个素材，已从待入库移除` : "选中的素材不在待入库中");
}

function rerunSelectedRecognition() {
  if (!state.selectedIds.size) return;
  db.assets.forEach((asset) => {
    if (state.selectedIds.has(asset.id)) {
      asset.aiTags = recognizeTags({ name: asset.name, type: asset.mime || "" }, { width: asset.width, height: asset.height, color: asset.color });
      ensureRecognizedAiTagsInLibrary(asset.aiTags);
      asset.updatedAt = nowText();
      asset.logs.unshift(`AI重新识别标签：${asset.aiTags.join("、")}`);
    }
  });
  saveDb();
  render();
  showToast(`已对 ${state.selectedIds.size} 个素材重新进行AI打标`);
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function getMediaInfo(file, src) {
  if (file.type.startsWith("image/")) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight, color: getDominantColorName(img) });
      img.onerror = () => resolve({ width: 0, height: 0, color: "未识别" });
      img.src = src;
    });
  }
  if (file.type.startsWith("video/")) {
    return new Promise((resolve) => {
      const video = document.createElement("video");
      video.onloadedmetadata = () => resolve({ width: video.videoWidth, height: video.videoHeight, color: "未识别" });
      video.onerror = () => resolve({ width: 0, height: 0, color: "未识别" });
      video.src = src;
    });
  }
  return Promise.resolve({ width: 0, height: 0, color: "未识别" });
}

function getDominantColorName(img) {
  const canvas = document.createElement("canvas");
  const size = 20;
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  ctx.drawImage(img, 0, 0, size, size);
  const data = ctx.getImageData(0, 0, size, size).data;
  let r = 0;
  let g = 0;
  let b = 0;
  let count = 0;
  for (let i = 0; i < data.length; i += 16) {
    r += data[i];
    g += data[i + 1];
    b += data[i + 2];
    count += 1;
  }
  r /= count;
  g /= count;
  b /= count;
  if (r > 170 && g > 170 && b > 170) return "浅色";
  if (r > g * 1.25 && r > b * 1.25) return "红色";
  if (b > r * 1.15 && b > g * 1.05) return "蓝色";
  if (g > r * 1.1 && g > b * 1.1) return "绿色";
  if (r > 145 && g > 120 && b < 100) return "黄色";
  return "综合色";
}

function recognizeTags(file, info) {
  const text = `${file.name} ${file.type}`.toLowerCase();
  const tags = new Set();
  if (file.type.startsWith("image/")) tags.add("图片");
  if (file.type.startsWith("video/")) tags.add("视频");
  if (text.includes("pdf")) tags.add("PDF");
  if (/(car|auto|vehicle|车|汽车|车型)/i.test(text)) tags.add("汽车");
  if (/(peugeot|标致|4008|408|5008|508l)/i.test(text)) tags.add("标致");
  if (/(citroen|雪铁龙|凡尔赛|c5x|天逸)/i.test(text)) tags.add("雪铁龙");
  const model = detectVehicleModel(file.name);
  if (model) tags.add(model);
  if (/(poster|海报|banner|kv|主视觉)/i.test(text)) tags.add("海报");
  if (/(event|campaign|活动|车展|618)/i.test(text)) tags.add("活动");
  if (info.width && info.height) tags.add(info.width > info.height ? "横版" : "竖版");
  if (info.color && info.color !== "未识别") tags.add(info.color);
  if (!tags.size) tags.add("待标注");
  return [...tags];
}

function detectVehicleModel(name = "") {
  const text = String(name).toLowerCase().replace(/\s+/g, "");
  if (text.includes("4008")) return "4008";
  if (text.includes("5008")) return "5008";
  if (text.includes("508l")) return "508L";
  if (text.includes("408")) return "408";
  if (text.includes("凡尔赛") || text.includes("c5x") || text.includes("c5-x")) return "凡尔赛C5X";
  if (text.includes("天逸")) return "天逸";
  return "";
}

function positionFloatingMenu(menu, anchorRect, options = {}) {
  const gap = options.gap ?? 8;
  const minWidth = options.minWidth ?? 220;
  const margin = options.margin ?? 10;
  menu.style.visibility = "hidden";
  menu.style.maxHeight = "";
  menu.style.overflowY = "";
  menu.classList.remove("hidden");
  const menuWidth = Math.max(menu.offsetWidth || minWidth, minWidth);
  const menuHeight = menu.offsetHeight || 200;
  const availableBelow = window.innerHeight - anchorRect.bottom - gap - margin;
  const availableAbove = anchorRect.top - gap - margin;
  const openUpward = availableBelow < menuHeight && availableAbove > availableBelow;
  const availableHeight = Math.max(120, openUpward ? availableAbove : availableBelow);
  const top = openUpward
    ? Math.max(margin, anchorRect.top - Math.min(menuHeight, availableHeight) - gap)
    : Math.min(anchorRect.bottom + gap, window.innerHeight - margin - Math.min(menuHeight, availableHeight));
  const left = Math.min(Math.max(margin, options.alignRight ? anchorRect.right - menuWidth : anchorRect.left), window.innerWidth - menuWidth - margin);
  menu.style.left = `${left}px`;
  menu.style.top = `${top}px`;
  menu.style.maxHeight = `${availableHeight}px`;
  menu.style.overflowY = menuHeight > availableHeight ? "auto" : "";
  menu.style.visibility = "visible";
}

function showFilterMenu(anchor, label) {
  if (label === "上传时间") {
    showUploadTimeFilterMenu(anchor, label);
    return;
  }
  const rect = anchor.getBoundingClientRect();
  const values = getFilterValues(label);
  const selected = new Set(getFilterSelections(label));
  els.assetMenu.innerHTML = `
    <button class="${selected.size ? "" : "active-side"}" data-filter-value="" type="button">全部</button>
    ${values.map((value) => {
      const active = selected.has(value);
      const icon = active ? `<span data-icon="check"></span>` : "";
      return `<button class="${active ? "active-side" : ""}" data-filter-value="${escapeAttr(value)}" type="button">${icon}${escapeHtml(value)}</button>`;
    }).join("")}`;
  positionFloatingMenu(els.assetMenu, rect);
  const cssEscape = (str) => str.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
  els.assetMenu.querySelectorAll("[data-filter-value]").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      const value = button.dataset.filterValue;
      if (!value) {
        delete state.filters[label];
      } else {
        const next = new Set(getFilterSelections(label));
        if (next.has(value)) next.delete(value);
        else next.add(value);
        if (next.size) state.filters[label] = [...next];
        else delete state.filters[label];
      }
      render();
      // render() 重建了 DOM，旧的 anchor 已脱离文档，需从新 DOM 中查找
      const newAnchor = els.filters.querySelector(`[data-filter="${cssEscape(label)}"]`);
      if (newAnchor) showFilterMenu(newAnchor, label);
      else hideMenus();
    });
  });
}

function showUploadTimeFilterMenu(anchor, label) {
  const rect = anchor.getBoundingClientRect();
  const selected = getFilterSelections(label)[0] || "";
  els.assetMenu.innerHTML = `
    <label class="date-dropdown-field">选择上传时间<input id="assetUploadTimeFilter" type="date" value="${escapeAttr(selected)}" readonly inputmode="none" /></label>
    <button class="${selected ? "" : "active-side"}" data-clear-upload-time type="button">全部时间</button>`;
  positionFloatingMenu(els.assetMenu, rect);
  // render() 会重建 DOM，之后需重新查找 anchor
  const input = els.assetMenu.querySelector("#assetUploadTimeFilter");
  const cssEscapeT = (str) => str.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
  const reopen = (newAnchor) => showUploadTimeFilterMenu(newAnchor, label);
  const applyValue = (value) => {
    if (value) state.filters[label] = [value];
    else delete state.filters[label];
    render();
    const newAnchor = els.filters.querySelector(`[data-filter="${cssEscapeT(label)}"]`);
    if (newAnchor) reopen(newAnchor);
  };
  window.initDatePicker(input, {
    minDate: "2020-01-01",
    maxDate: "2036-12-31",
    onChange: (dates, value) => applyValue(value),
  });
  input.addEventListener("change", (event) => applyValue(event.target.value));
  els.assetMenu.querySelector("[data-clear-upload-time]")?.addEventListener("click", (event) => {
    event.stopPropagation();
    delete state.filters[label];
    render();
    const newAnchor = els.filters.querySelector(`[data-filter="${cssEscapeT(label)}"]`);
    if (newAnchor) reopen(newAnchor);
  });
}

function getFilterValues(label) {
  const active = db.assets.filter((asset) => asset.status !== "deleted");
  const businessTags = active.flatMap((asset) => asset.customTags || []);
  const aiTags = active.flatMap((asset) => asset.aiTags || []);
  const map = {
    "创建者/创建部门": active.flatMap((asset) => [asset.owner, asset.department]),
    "素材来源": ["本地上传", "素材库", "百度网盘"],
    "文件格式": [...UPLOAD_FILE_FORMATS, ...active.map((asset) => asset.format).filter(Boolean)],
    "车型": VEHICLE_MODELS,
    "品牌": active.map((asset) => asset.brand).filter(Boolean),
    "权限范围": active.map((asset) => asset.permission),
    "业务标签": businessTags,
    "AI标签": aiTags,
    "素材失效日": ["永久有效", "30天内", "90天内"],
    "颜色": active.map((asset) => asset.color).filter(Boolean),
    "时长": ["图片", "短视频", "长视频"],
    "创建时间": ["今天", "近7天", "近30天"],
  };
  const values = [...new Set(map[label] || [])];
  return label === "文件格式" ? values : values.slice(0, 12);
}

function showMoreMenu(anchor) {
  const rect = anchor.getBoundingClientRect();
  document.querySelector("#moreMenuContent")?.classList.remove("hidden");
  document.querySelector("#appMenuContent")?.classList.add("hidden");
  document.querySelector("#topIconMenuContent")?.classList.add("hidden");
  positionFloatingMenu(els.moreMenu, rect, { alignRight: false });
}

function showAppMenu(anchor) {
  const rect = anchor.getBoundingClientRect();
  document.querySelector("#appMenuContent")?.classList.remove("hidden");
  document.querySelector("#moreMenuContent")?.classList.add("hidden");
  document.querySelector("#topIconMenuContent")?.classList.add("hidden");
  positionFloatingMenu(els.moreMenu, rect);
}

function bindSidebarResize() {
  const handle = document.querySelector(".collapse-handle");
  if (!handle) return;
  const savedWidth = Number(localStorage.getItem("dp-material-library-sidebar-width"));
  if (savedWidth) setSidebarWidth(savedWidth);
  let startX = 0;
  let moved = false;
  let startedCollapsed = false;

  handle.addEventListener("pointerdown", (event) => {
    if (event.button !== 0) return;
    startX = event.clientX;
    moved = false;
    startedCollapsed = document.body.classList.contains("sidebar-collapsed");
    if (startedCollapsed) {
      const restoreWidth = Number(localStorage.getItem("dp-material-library-sidebar-width")) || 285;
      setSidebarWidth(restoreWidth);
      setSidebarCollapsed(false);
    }
    handle.setPointerCapture?.(event.pointerId);
    document.body.classList.add("resizing-sidebar");
    event.preventDefault();
  });

  handle.addEventListener("pointermove", (event) => {
    if (!document.body.classList.contains("resizing-sidebar")) return;
    if (Math.abs(event.clientX - startX) > 4) moved = true;
    const width = Math.min(420, Math.max(220, event.clientX));
    setSidebarWidth(width);
  });

  const stopResize = (event) => {
    if (!document.body.classList.contains("resizing-sidebar")) return;
    document.body.classList.remove("resizing-sidebar");
    handle.releasePointerCapture?.(event.pointerId);
    if (moved) {
      localStorage.setItem("dp-material-library-sidebar-width", getComputedStyle(document.documentElement).getPropertyValue("--sidebar").trim().replace("px", ""));
    } else if (!startedCollapsed) {
      setSidebarCollapsed(true);
    }
    startedCollapsed = false;
  };

  handle.addEventListener("pointerup", stopResize);
  handle.addEventListener("pointercancel", stopResize);
}

function setSidebarWidth(width) {
  const value = `${Math.round(width)}px`;
  document.documentElement.style.setProperty("--sidebar", value);
}

function setSidebarCollapsed(collapsed) {
  const handle = document.querySelector(".collapse-handle");
  document.body.classList.toggle("sidebar-collapsed", collapsed);
  if (handle) {
    handle.textContent = collapsed ? "›" : "‹";
    handle.setAttribute("aria-label", collapsed ? "展开侧边栏" : "拖动调整侧边栏宽度，点击收起侧边栏");
  }
}

function showTopIconMenu(anchor, type) {
  const rect = anchor.getBoundingClientRect();
  const menus = {
    notification: `
      <button data-top-action="messages" type="button">消息中心</button>
      <button data-top-action="approval" type="button">待处理审批</button>
      <button data-top-action="notice" type="button">系统公告</button>`,
    language: `
      <button data-top-action="zh" type="button">简体中文</button>
      <button data-top-action="en" type="button">English</button>`,
    user: `
      <button data-top-action="profile" type="button">个人资料</button>
      <button data-top-action="settings" type="button">账号设置</button>
      <button data-top-action="logout" type="button">退出登录</button>`,
  };
  
  document.querySelector("#moreMenuContent")?.classList.add("hidden");
  document.querySelector("#appMenuContent")?.classList.add("hidden");
  document.querySelector("#topIconMenuContent")?.classList.remove("hidden");
  document.querySelector("#topIconMenuContent").innerHTML = menus[type] || "";
  
  positionFloatingMenu(els.moreMenu, rect, { alignRight: true });
  els.moreMenu.querySelectorAll("[data-top-action]").forEach((button) => {
    button.addEventListener("click", () => {
      handleTopIconAction(button.dataset.topAction);
      hideMenus();
    });
  });
}

function handleTopIconAction(action) {
  if (action === "messages" || action === "approval" || action === "notice") {
    openSystemPanel(action);
    return;
  }
  if (action === "zh" || action === "en") {
    document.querySelector("#languageButton").textContent = action === "zh" ? "中" : "EN";
    showToast(action === "zh" ? "已切换为简体中文" : "Switched to English");
    return;
  }
  if (action === "profile" || action === "settings") {
    openUserPanel(action);
    return;
  }
  if (action === "logout") showToast("已退出当前演示账号");
}

function openSystemPanel(type) {
  const titleMap = { messages: "消息中心", approval: "待处理审批", notice: "系统公告" };
  const rows = {
    messages: ["素材上传完成：2 个文件已入库", "素材篮分享链接已生成", "AI标签识别任务已完成"],
    approval: ["外部提交素材待审核：3 项", "编辑权限申请待审批：1 项"],
    notice: ["素材库标签体系已更新", "系统将于本周末进行例行维护"],
  }[type] || [];
  openFormModal(titleMap[type] || "消息", `
    <div class="info-list">${rows.map((item) => `<div class="info-card">${escapeHtml(item)}</div>`).join("")}</div>
    <div class="form-actions"><button class="primary" type="button" data-cancel>知道了</button></div>
  `, closeFormModal);
}

function openUserPanel(type) {
  openFormModal(type === "profile" ? "个人资料" : "账号设置", `
    <div class="info-card"><span>当前用户</span>${escapeHtml(currentUser.name)} / ${escapeHtml(currentUser.role)}</div>
    <label>显示名称<input value="${escapeAttr(currentUser.name)}" /></label>
    <label>默认语言<select><option>简体中文</option><option>English</option></select></label>
    <div class="form-actions"><button type="button" data-cancel>取消</button><button class="primary" type="submit">保存</button></div>
  `, () => {
    closeFormModal();
    showToast("账号信息已保存");
  });
}

function openFieldConfigModal() {
  const columns = ["名称", "描述", "业务标签", "AI标签", "版本", "素材组", "操作", "文件大小", "创建时间", "更新时间"];
  openFormModal("字段配置", `
    <div class="check-grid">
      ${columns.map((item, index) => `<label><input type="checkbox" ${index < 7 ? "checked" : ""} /> ${item}</label>`).join("")}
    </div>
    <div class="form-actions"><button type="button" data-cancel>取消</button><button class="primary" type="submit">确定</button></div>
  `, () => {
    closeFormModal();
    showToast("字段配置已保存");
  });
}

async function deleteGroup(groupId) {
  const group = db.groups.find((item) => item.id === groupId);
  if (!group) return;
  const childIds = db.groups.filter((item) => item.parentId === groupId).map((item) => item.id);
  const ids = [groupId, ...childIds];
  const assetCount = db.assets.filter((asset) => ids.includes(asset.groupId) && asset.status !== "deleted").length;
  const ok = await window.Modal.confirm(`确定删除素材组「${group.name}」吗？组内 ${assetCount} 个素材会移动到全部素材。`);
  if (!ok) return;
  db.assets.forEach((asset) => {
    if (ids.includes(asset.groupId)) {
      asset.groupId = "all";
      asset.updatedAt = nowText();
      asset.logs.unshift(`素材组「${group.name}」被删除，素材移到全部素材`);
    }
  });
  db.groups = db.groups.filter((item) => !ids.includes(item.id));
  if (ids.includes(state.groupId)) state.groupId = "all";
  saveDb();
  render();
  showToast("素材组已删除");
}

function showGroupMenu(anchor, groupId) {
  const group = db.groups.find((item) => item.id === groupId);
  if (!group) return;
  const rect = anchor.getBoundingClientRect();
  els.assetMenu.innerHTML = `
    <button data-group-action="open" type="button">新标签页打开</button>
    <button data-group-action="child" type="button">新建子素材组</button>
    <button data-group-action="sort" type="button">子素材组排序设置</button>
    <button class="split" data-group-action="edit" type="button">编辑信息</button>
    <button data-group-action="subscribe" type="button">${group.subscribed ? "取消订阅" : "订阅"}</button>
    <button data-group-action="favorite" type="button">${group.favorite ? "取消收藏" : "收藏"}</button>
    <button class="split" data-group-action="collect" type="button">收素材</button>
    <button data-group-action="download" type="button">下载</button>
    <button data-group-action="share" type="button">分享</button>
    <button data-group-action="shareRecord" type="button">分享记录</button>
    <button class="split" data-group-action="copy" type="button">复制素材组</button>
    <button data-group-action="move" type="button">移动素材组</button>
    <button class="danger split" data-group-action="dismiss" type="button">解散素材组</button>
    <button class="danger" data-group-action="deleteAll" type="button">删除组及素材</button>`;
  els.assetMenu.style.left = `${Math.min(rect.right + 8, window.innerWidth - 250)}px`;
  els.assetMenu.style.top = `${Math.min(rect.top, window.innerHeight - 560)}px`;
  els.assetMenu.classList.remove("hidden");
  els.assetMenu.querySelectorAll("[data-group-action]").forEach((button) => {
    button.addEventListener("click", () => {
      handleGroupAction(button.dataset.groupAction, groupId);
      hideMenus();
    });
  });
}

function handleGroupAction(action, groupId) {
  const group = db.groups.find((item) => item.id === groupId);
  if (!group) return;
  if (action === "open") {
    state.page = "all";
    state.groupId = groupId;
    render();
    window.open(`${location.href.split("#")[0]}#group=${encodeURIComponent(groupId)}`, "_blank");
  }
  if (action === "child") openGroupModal(groupId);
  if (action === "sort") sortChildGroups(groupId);
  if (action === "edit") openGroupEditModal(groupId);
  if (action === "subscribe") toggleGroupFlag(groupId, "subscribed", "订阅");
  if (action === "favorite") toggleGroupFlag(groupId, "favorite", "收藏");
  if (action === "collect") openCollectTaskModal(group.name);
  if (action === "download") downloadGroup(groupId);
  if (action === "share") createGroupShare(groupId);
  if (action === "shareRecord") {
    state.page = "share";
    render();
  }
  if (action === "copy") copyGroup(groupId);
  if (action === "move") openMoveGroupModal(groupId);
  if (action === "dismiss") dissolveGroup(groupId);
  if (action === "deleteAll") deleteGroupAndAssets(groupId);
}

function getGroupDescendantIds(groupId) {
  const ids = new Set([groupId]);
  let changed = true;
  while (changed) {
    changed = false;
    db.groups.forEach((group) => {
      if (group.parentId && group.status !== "deleted" && ids.has(group.parentId) && !ids.has(group.id)) {
        ids.add(group.id);
        changed = true;
      }
    });
  }
  return [...ids];
}

function sortChildGroups(groupId) {
  db.groups.sort((a, b) => {
    if (a.parentId === groupId && b.parentId !== groupId) return -1;
    if (a.parentId !== groupId && b.parentId === groupId) return 1;
    return (a.depth || 0) - (b.depth || 0) || a.name.localeCompare(b.name, "zh-CN");
  });
  saveDb();
  render();
  showToast("子素材组已按名称排序");
}

function toggleGroupFlag(groupId, key, label) {
  const group = db.groups.find((item) => item.id === groupId);
  group[key] = !group[key];
  saveDb();
  render();
  showToast(group[key] ? `已${label}素材组` : `已取消${label}`);
}

function downloadGroup(groupId) {
  const ids = getGroupDescendantIds(groupId);
  const first = db.assets.find((asset) => ids.includes(asset.groupId) && asset.status !== "deleted");
  if (first) downloadAsset(first.id);
  showToast("已创建素材组下载任务");
}

function createGroupShare(groupId) {
  const group = db.groups.find((item) => item.id === groupId);
  const code = Math.random().toString(36).slice(2, 8);
  const link = getShareLink("group", groupId, code);
  db.shares.unshift({ group: group.name, user: currentUser.name, access: "分享给互联网用户（无需登录）", visits: 0, views: 0, downloads: 0, sharedAt: nowText(), expiresAt: "永久有效", targetType: "group", targetId: groupId, code, link });
  saveDb();
  state.page = "share";
  render();
  showToast("素材组分享记录已创建");
}

function copyGroup(groupId) {
  const source = db.groups.find((item) => item.id === groupId);
  const copy = { ...source, id: `group-${Date.now()}`, name: `${source.name} 副本`, count: 0 };
  db.groups.push(copy);
  state.groupId = copy.id;
  state.page = "all";
  saveDb();
  render();
  showToast("素材组已复制");
}

async function dissolveGroup(groupId) {
  const group = db.groups.find((item) => item.id === groupId);
  const ok = await window.Modal.confirm(`确定解散素材组「${group.name}」吗？组内素材会移动到上级素材组。`);
  if (!ok) return;
  const targetId = group.parentId || "all";
  db.assets.forEach((asset) => {
    if (asset.groupId === groupId) {
      asset.groupId = targetId;
      asset.updatedAt = nowText();
      asset.logs.unshift(`${currentUser.name} 解散素材组「${group.name}」`);
    }
  });
  db.groups.forEach((item) => {
    if (item.parentId === groupId) {
      item.parentId = group.parentId || "";
      item.depth = Math.max(0, (group.depth || 0));
    }
  });
  db.groups = db.groups.filter((item) => item.id !== groupId);
  if (state.groupId === groupId) state.groupId = targetId;
  saveDb();
  render();
  showToast("素材组已解散");
}

async function deleteGroupAndAssets(groupId) {
  const group = db.groups.find((item) => item.id === groupId);
  const ids = getGroupDescendantIds(groupId);
  const ok = await window.Modal.confirm(`确定删除「${group.name}」及组内素材吗？组内素材会进入回收站，素材组会被移除。`);
  if (!ok) return;
  db.assets.forEach((asset) => {
    if (ids.includes(asset.groupId)) {
      asset.status = "deleted";
      asset.updatedAt = nowText();
      asset.deletedAt = asset.updatedAt;
      asset.logs.unshift(`${currentUser.name} 删除素材组「${group.name}」及素材`);
    }
  });
  db.groups = db.groups.filter((item) => !ids.includes(item.id));
  if (ids.includes(state.groupId)) state.groupId = "all";
  saveDb();
  render();
  showToast("素材已移入回收站，素材组已移除");
}

function showAssetMenu(anchor, id) {
  const rect = anchor.getBoundingClientRect();
  const asset = findAsset(id);
  const deleted = asset?.status === "deleted";
  els.assetMenu.innerHTML = deleted ? `
    <button data-restore="${id}" type="button">恢复素材</button>
    <button class="danger" data-hard-delete="${id}" type="button">彻底删除</button>` : `
    <button data-open="${id}" type="button">新标签页打开</button>
    <button data-rename="${id}" type="button">重命名</button>
    <button data-edit="${id}" type="button">编辑</button>
    <button data-download="${id}" type="button">下载</button>
    <button data-share="${id}" type="button">分享</button>
    <button data-assign="${id}" type="button">添加到组</button>
    <button class="split" data-tags="${id}" type="button">重新识别标签</button>
    <button data-owner="${id}" type="button">修改所有者</button>
    <button data-permission="${id}" type="button">修改权限类型</button>
    <button class="danger split" data-delete="${id}" type="button">删除素材</button>`;
  positionFloatingMenu(els.assetMenu, rect);
  els.assetMenu.addEventListener("click", handleAssetMenuClick, { once: true });
}

function showViewerMoreMenu(anchor) {
  const rect = anchor.getBoundingClientRect();
  const id = state.selectedAssetId;
  const asset = findAsset(id);
  const canManage = canManageAsset(asset);
  els.assetMenu.innerHTML = `
    <button data-viewer-more="download-original" type="button">下载原图</button>
    <button data-viewer-more="download-web" type="button">下载Web尺寸</button>
    <button data-viewer-more="download-preview" type="button">下载预览图</button>
    <button class="split" data-viewer-more="copy-link" type="button">复制链接</button>
    ${canManage ? `<button data-viewer-more="edit" type="button">编辑素材信息</button>` : ""}
    ${canManage ? `<button data-viewer-more="tag" type="button">AI重新打标</button>` : ""}
    ${canManage ? `<button data-viewer-more="owner" type="button">修改所有者</button>` : ""}
    ${canManage ? `<button class="danger split" data-viewer-more="delete" type="button">删除素材</button>` : ""}`;
  positionFloatingMenu(els.assetMenu, rect, { alignRight: true });
  els.assetMenu.addEventListener("click", handleViewerMoreMenuClick, { once: true });
}

function handleViewerMoreMenuClick(event) {
  const button = event.target.closest("[data-viewer-more]");
  if (!button) return;
  const action = button.dataset.viewerMore;
  const id = state.selectedAssetId;
  if (action === "download-original") downloadAsset(id);
  if (action === "download-web") downloadAsset(id, "web");
  if (action === "download-preview") downloadAsset(id, "preview");
  if (action === "copy-link") copyText(window.location.href + "#asset=" + id);
  if (action === "edit") openEditAssetModal(id);
  if (action === "request") openPermissionRequestModal(id);
  if (action === "tag") rerunRecognition(id);
  if (action === "owner") openOwnerModal(id);
  if (action === "delete") {
    softDeleteAsset(id);
    els.viewer.classList.add("hidden");
  }
  hideMenus();
}

function handleAssetMenuClick(event) {
  const button = event.target.closest("button");
  if (!button) return;
  const id = Object.values(button.dataset)[0];
  if (button.dataset.open) window.open(`${location.href.split("#")[0]}#asset=${encodeURIComponent(id)}`, "_blank");
  if (button.dataset.rename || button.dataset.edit) openEditAssetModal(id);
  if (button.dataset.assign) openAssignGroupModal(id);
  if (button.dataset.tags) rerunRecognition(id);
  if (button.dataset.delete) softDeleteAsset(id);
  if (button.dataset.restore) restoreAsset(id);
  if (button.dataset.hardDelete) hardDeleteAsset(id);
  if (button.dataset.download) downloadAsset(id);
  if (button.dataset.share) openShareAssetModal(id);
  if (button.dataset.owner) openOwnerModal(id);
  if (button.dataset.permission) openPermissionModal(id);
  hideMenus();
}

function openViewer(id) {
  const asset = findAsset(id);
  if (!asset) return;
  state.selectedAssetId = id;
  state.detailTab = "overview";
  state.detailPanelDock = "side";
  state.zoomLevel = 100;
  resetViewerPan();
  asset.view += 1;
  asset.logs.unshift(`${currentUser.name} 浏览了素材`);
  saveDb();
  els.viewer.classList.remove("hidden");
  renderViewer();
}

function renderViewer() {
  const asset = findAsset(state.selectedAssetId) || db.assets[0];
  if (!asset) return;
  els.viewerName.textContent = asset.name;
  const shareCount = document.querySelector("#viewerShareCount");
  const downloadCount = document.querySelector("#viewerDownloadCount");
  const viewCount = document.querySelector("#viewerViewCount");
  if (shareCount) shareCount.textContent = asset.share || 0;
  if (downloadCount) downloadCount.textContent = asset.download || 0;
  if (viewCount) viewCount.textContent = asset.view || 0;
  renderViewerMedia(asset);
  updateViewerNav(asset);
  renderViewerFooter(asset);
  els.detailTabs.querySelectorAll("button").forEach((button) => button.classList.toggle("active", button.dataset.tab === state.detailTab));
  const content = {
    overview: `<div class="detail-section"><div class="field editable-field" data-overview-edit="asset"><span>素材名称</span><b>${escapeHtml(asset.name)}</b><small>点击编辑</small></div></div><div class="detail-section"><div class="section-title"><h3>AI标签</h3><button id="retagFromOverview" type="button">AI重新打标</button></div><div class="tag-list">${(asset.aiTags || []).map((tag) => `<span>${escapeHtml(tag)}</span>`).join("") || "<em>暂无AI标签</em>"}</div></div><div class="detail-section"><div class="section-title"><h3>素材信息</h3><button data-overview-edit="asset" type="button">编辑信息</button></div><div class="field-grid"><button class="field interactive" data-overview-edit="asset" type="button"><span>品牌</span>${escapeHtml(asset.brand || "-")}</button><button class="field interactive" data-overview-edit="asset" type="button"><span>车型</span>${escapeHtml(asset.model || "-")}</button><button class="field interactive" data-overview-edit="asset" type="button"><span>业务标签</span>${escapeHtml((asset.customTags || []).join("、") || "-")}</button><button class="field interactive" data-overview-edit="asset" type="button"><span>颜色</span>${escapeHtml(asset.color || "-")}</button></div></div>`,
    detail: `<button class="table-tool" id="editFromDetail" type="button"><span data-icon="edit"></span> 编辑素材信息</button><div class="detail-section"><h3>基础信息</h3><div class="field"><span>素材所有者</span>${escapeHtml(asset.owner)}<br><small>${escapeHtml(asset.department)}</small></div><div class="field"><span>更新时间</span>${asset.updatedAt}</div><div class="field"><span>创建时间</span>${asset.createdAt}</div><div class="field"><span>文件尺寸</span>${asset.width || "-"}×${asset.height || "-"}</div><div class="field"><span>素材ID</span>${asset.id}</div><div class="field"><span>文件格式</span>${asset.format}</div><div class="field"><span>文件大小</span>${formatBytes(asset.sizeBytes)}</div></div><div class="detail-section"><div class="field"><span>名称</span>${escapeHtml(asset.name)}</div><div class="field"><span>描述</span>${escapeHtml(asset.desc || "-")}</div><div class="field"><span>自定义标签</span>${escapeHtml((asset.customTags || []).join("、") || "无")}</div><div class="field"><span>素材失效日</span>${escapeHtml(formatAssetValidUntil(asset))}</div><div class="field"><span>AI标签</span>${escapeHtml((asset.aiTags || []).join("、") || "无")}</div><div class="field"><span>颜色</span>${escapeHtml(asset.color || "无")}</div></div>`,
    comment: `<div class="comment-box"><textarea id="commentText" placeholder="写一条评论"></textarea><button id="addComment" class="primary" type="button">发布</button></div>${(asset.comments || []).map((item) => `<div class="info-card"><b>${escapeHtml(item.user || currentUser.name)}</b><small>${item.time || ""}</small><p>${escapeHtml(item.text || item)}</p></div>`).join("") || renderEmpty("暂无评论")}`,
    log: `<div class="timeline">${(asset.logs || []).map((text, index) => `<div class="log-item"><span>${index ? "2026-05-26 17:4" + index : nowText()}</span><p>"${escapeHtml(text)}"</p><small>操作人: ${escapeHtml(currentUser.name)}</small></div>`).join("")}</div>`,
  }[state.detailTab];
  els.detailContent.innerHTML = content;
  const retagButton = document.querySelector("#retagFromOverview");
  if (retagButton) retagButton.addEventListener("click", () => rerunRecognition(asset.id));
  els.detailContent.querySelectorAll("[data-overview-edit]").forEach((button) => {
    button.addEventListener("click", () => {
      const action = button.dataset.overviewEdit;
      if (action === "permission") openPermissionModal(asset.id);
      if (action === "owner") openOwnerModal(asset.id);
      if (action === "asset") openEditAssetModal(asset.id);
    });
  });
  const editButton = document.querySelector("#editFromDetail");
  if (editButton) editButton.addEventListener("click", () => openEditAssetModal(asset.id));
  const commentButton = document.querySelector("#addComment");
  if (commentButton) commentButton.addEventListener("click", () => {
    const value = document.querySelector("#commentText").value.trim();
    if (!value) return;
    asset.comments = asset.comments || [];
    asset.comments.unshift({ user: currentUser.name, time: nowText(), text: value });
    asset.logs.unshift(`${currentUser.name} 评论了素材`);
    saveDb();
    renderViewer();
  });

  // Zoom controls
  updateZoomDisplay();
  document.querySelectorAll("[data-zoom]").forEach((button) => {
    button.addEventListener("click", () => {
      const action = button.dataset.zoom;
      if (action === "in") state.zoomLevel = Math.min(400, state.zoomLevel + 25);
      if (action === "out") state.zoomLevel = Math.max(25, state.zoomLevel - 25);
      if (action === "fit") {
        state.zoomLevel = calculateFitZoom(asset);
        resetViewerPan();
      }
      if (action === "reset") {
        state.zoomLevel = 100;
        resetViewerPan();
      }
      if (state.zoomLevel <= 100) resetViewerPan();
      updateZoomDisplay();
    });
  });
}

function getViewerSequence() {
  const filtered = getFilteredAssets().filter((asset) => asset.status !== "deleted");
  if (filtered.some((asset) => asset.id === state.selectedAssetId)) return filtered;
  return sortAssets(db.assets.filter((asset) => asset.status !== "deleted"));
}

function updateViewerNav(asset) {
  const sequence = getViewerSequence();
  const index = sequence.findIndex((item) => item.id === asset.id);
  const prevButton = document.querySelector("[data-viewer-nav='prev']");
  const nextButton = document.querySelector("[data-viewer-nav='next']");
  if (prevButton) prevButton.disabled = index <= 0;
  if (nextButton) nextButton.disabled = index < 0 || index >= sequence.length - 1;
}

function changeViewerAsset(direction) {
  const sequence = getViewerSequence();
  const index = sequence.findIndex((asset) => asset.id === state.selectedAssetId);
  if (index < 0) return;
  const offset = direction === "prev" ? -1 : 1;
  const nextAsset = sequence[index + offset];
  if (!nextAsset) return;
  state.selectedAssetId = nextAsset.id;
  state.detailTab = "overview";
  state.zoomLevel = 100;
  resetViewerPan();
  nextAsset.view += 1;
  nextAsset.logs.unshift(`${currentUser.name} 浏览了素材`);
  saveDb();
  renderViewer();
}

function updateZoomDisplay() {
  if (els.viewerImage) {
    els.viewerImage.style.transform = `translate(${state.panX}px, ${state.panY}px) scale(${state.zoomLevel / 100})`;
    els.viewerImage.style.transformOrigin = "center center";
  }
  els.imageCanvas?.classList.toggle("can-pan", state.zoomLevel > 100);
  if (els.zoomLevel) {
    els.zoomLevel.textContent = `${state.zoomLevel}%`;
  }
}

function resetViewerPan() {
  state.panX = 0;
  state.panY = 0;
  state.isPanning = false;
  els.imageCanvas?.classList.remove("is-panning");
}

function calculateFitZoom(asset) {
  if (!els.imageCanvas || !asset) return 100;
  const canvasWidth = els.imageCanvas.clientWidth - 100;
  const canvasHeight = els.imageCanvas.clientHeight - 100;
  const assetWidth = asset.width || 1000;
  const assetHeight = asset.height || 1000;
  const scaleX = canvasWidth / assetWidth;
  const scaleY = canvasHeight / assetHeight;
  return Math.round(Math.min(scaleX, scaleY, 1) * 100);
}

function renderViewerFooter(asset) {
  const footer = document.querySelector(".detail-panel footer");
  if (!footer) return;
  const canManage = canManageAsset(asset);
  footer.innerHTML = `
    <button class="primary" data-detail-action="download" type="button">下载素材</button>
    <button data-detail-action="share" type="button">分享</button>
    ${canManage ? `<button data-detail-action="edit" type="button">编辑信息</button>` : `<button data-detail-action="permission" type="button">申请编辑权限</button>`}
    <button data-detail-action="group" type="button">添加到组</button>`;
}

function renderViewerMedia(asset) {
  const canvas = document.querySelector(".image-canvas");
  canvas.querySelectorAll(".viewer-video,.viewer-file").forEach((node) => node.remove());
  if (asset.mime?.startsWith("video/") && asset.src.startsWith("data:video")) {
    els.viewerImage.style.display = "none";
    const video = document.createElement("video");
    video.className = "viewer-video";
    video.src = asset.src;
    video.controls = true;
    canvas.insertBefore(video, canvas.querySelector(".viewer-nav-next"));
    return;
  }
  if (!asset.mime?.startsWith("image/") && !/\.(jpg|jpeg|png|webp|gif)$/i.test(asset.src)) {
    els.viewerImage.style.display = "none";
    const file = document.createElement("div");
    file.className = "viewer-file";
    file.innerHTML = `<b>${asset.format}</b><span>${escapeHtml(asset.name)}</span>`;
    canvas.insertBefore(file, canvas.querySelector(".viewer-nav-next"));
    return;
  }
  els.viewerImage.style.display = "";
  els.viewerImage.src = asset.src;
}

let editAssetId = "";

function openEditAssetModal(id) {
  const asset = findAsset(id);
  if (!asset) return;
  editAssetId = id;
  
  document.querySelector("#editAssetName").value = escapeAttr(asset.name);
  document.querySelector("#editAssetDesc").value = escapeHtml(asset.desc || "");
  document.querySelector("#editAssetCustomTags").value = escapeAttr((asset.customTags || []).join(", "));
  document.querySelector("#editAssetBrand").value = escapeAttr(asset.brand || "");
  const validStartParts = splitDateTimeText(asset.validStart || asset.uploadDate || "");
  document.querySelector("#editAssetValidStartDate").value = escapeAttr(validStartParts.date);
  document.querySelector("#editAssetValidStartTime").value = escapeAttr(validStartParts.time);
  const validUntilParts = splitDateTimeText(asset.validUntilDate || asset.validUntil || "");
  document.querySelector("#editAssetValidUntilDate").value = escapeAttr(validUntilParts.date);
  document.querySelector("#editAssetValidUntilTime").value = escapeAttr(validUntilParts.time || "23:59");
  
  document.querySelector("#editAssetModel").innerHTML = VEHICLE_MODELS.map((model) => `<option value="${model}">${model}</option>`).join("");
  document.querySelector("#editAssetModel").value = asset.model || VEHICLE_MODELS[0];
  document.querySelector("#editAssetPermission").value = asset.permission;
  
  document.querySelector("#editAssetModal").classList.remove("hidden");
}

function handleEditAssetSubmit(event) {
  event.preventDefault();
  const asset = findAsset(editAssetId);
  if (!asset) return;
  
  const form = event.target;
  const data = Object.fromEntries(new FormData(form));
  const validUntil = data.validUntilDate ? joinDateTime(data.validUntilDate, data.validUntilTime || "23:59") : calculateExpireTime("永久有效");
  Object.assign(asset, {
    name: data.name.trim(),
    desc: data.desc.trim(),
    customTags: splitTags(data.customTags),
    brand: data.brand.trim(),
    model: data.model.trim(),
    validStart: data.validStartDate ? joinDateTime(data.validStartDate, data.validStartTime || "00:00") : "",
    validUntil: validUntil,
    validUntilDate: validUntil,
    permission: data.permission,
    updatedAt: nowText(),
  });
  asset.logs.unshift(`${currentUser.name} 编辑了素材信息`);
  saveDb();
  closeEditAssetModal();
  render();
  if (!els.viewer.classList.contains("hidden")) renderViewer();
  showToast("素材信息已保存");
}

function closeEditAssetModal() {
  document.querySelector("#editAssetModal").classList.add("hidden");
}

function openGroupModal(parentId = "") {
  if (typeof parentId !== "string") parentId = "";
  
  document.querySelector("#addGroupName").value = "";
  document.querySelector("#addGroupParentId").innerHTML = `<option value="">无</option>${db.groups.filter((group) => !group.system).map((group) => `<option value="${group.id}">${escapeHtml(group.name)}</option>`).join("")}`;
  document.querySelector("#addGroupParentId").value = parentId;
  
  document.querySelector("#addGroupModal").classList.remove("hidden");
}

function handleAddGroupSubmit(event) {
  event.preventDefault();
  const form = event.target;
  const data = Object.fromEntries(new FormData(form));
  const parent = db.groups.find((group) => group.id === data.parentId);
  const group = { id: `group-${Date.now()}`, name: data.name.trim(), parentId: data.parentId || "", depth: parent ? (parent.depth || 0) + 1 : 0, count: 0, status: "active" };
  db.groups.push(group);
  if (data.parentId) state.collapsedGroupIds.delete(data.parentId);
  state.groupId = group.id;
  state.page = "all";
  saveDb();
  closeAddGroupModal();
  render();
  showToast("素材组已创建");
}

function closeAddGroupModal() {
  document.querySelector("#addGroupModal").classList.add("hidden");
}

let editGroupId = "";

function openGroupEditModal(groupId) {
  const group = db.groups.find((item) => item.id === groupId);
  if (!group) return;
  editGroupId = groupId;
  
  document.querySelector("#editGroupName").value = escapeAttr(group.name);
  document.querySelector("#editGroupDesc").value = escapeHtml(group.desc || "");
  
  document.querySelector("#editGroupModal").classList.remove("hidden");
}

function handleEditGroupSubmit(event) {
  event.preventDefault();
  const group = db.groups.find((item) => item.id === editGroupId);
  if (!group) return;
  
  const form = event.target;
  const data = Object.fromEntries(new FormData(form));
  group.name = data.name.trim();
  group.desc = data.desc.trim();
  saveDb();
  closeEditGroupModal();
  render();
  showToast("素材组信息已保存");
}

function closeEditGroupModal() {
  document.querySelector("#editGroupModal").classList.add("hidden");
}

let moveGroupId = "";

function openMoveGroupModal(groupId) {
  const group = db.groups.find((item) => item.id === groupId);
  if (!group) return;
  moveGroupId = groupId;
  
  const blocked = new Set(getGroupDescendantIds(groupId));
  const options = db.groups
    .filter((item) => !item.system && !blocked.has(item.id))
    .map((item) => `<option value="${item.id}">${escapeHtml(item.name)}</option>`)
    .join("");
  
  document.querySelector("#moveGroupParentId").innerHTML = `<option value="">无上级</option>${options}`;
  document.querySelector("#moveGroupModal").classList.remove("hidden");
}

function handleMoveGroupSubmit(event) {
  event.preventDefault();
  const group = db.groups.find((item) => item.id === moveGroupId);
  if (!group) return;
  
  const parentId = new FormData(event.target).get("parentId");
  const parent = db.groups.find((item) => item.id === parentId);
  group.parentId = parentId || "";
  group.depth = parent ? (parent.depth || 0) + 1 : 0;
  if (parentId) state.collapsedGroupIds.delete(parentId);
  syncGroupDepths();
  saveDb();
  closeMoveGroupModal();
  render();
  showToast("素材组已移动");
}

function closeMoveGroupModal() {
  document.querySelector("#moveGroupModal").classList.add("hidden");
}

let assignGroupAssetId = "";
let assignGroupBulk = false;

function openAssignGroupModal(id, bulk = false) {
  const asset = findAsset(id);
  if (!asset && !bulk) return;
  assignGroupAssetId = id;
  assignGroupBulk = bulk;
  
  document.querySelector("#addToGroupGroupId").innerHTML = db.groups.filter((group) => !group.system).map((group) => `<option value="${group.id}">${escapeHtml(group.name)}</option>`).join("");
  document.querySelector("#addToGroupGroupId").value = asset?.groupId || state.groupId;
  
  document.querySelector("#addToGroupModal").classList.remove("hidden");
}

function handleAddToGroupSubmit(event) {
  event.preventDefault();
  const groupId = new FormData(event.target).get("groupId");
  const ids = assignGroupBulk ? [...state.selectedIds] : [assignGroupAssetId];
  db.assets.forEach((item) => {
    if (ids.includes(item.id)) {
      item.groupId = groupId;
      item.updatedAt = nowText();
      if (item.status === "pending") {
        item.status = "active";
        item.logs.unshift(`${currentUser.name} 审核入库并添加到 ${getGroupName(groupId)}`);
      } else {
        item.logs.unshift(`${currentUser.name} 添加素材到 ${getGroupName(groupId)}`);
      }
    }
  });
  state.selectedIds.clear();
  saveDb();
  closeAddToGroupModal();
  render();
  if (!els.viewer.classList.contains("hidden")) renderViewer();
  showToast(state.page === "pending" ? "素材已入库并添加到素材组" : "素材已添加到素材组");
}

function closeAddToGroupModal() {
  document.querySelector("#addToGroupModal").classList.add("hidden");
}

function openCollectTaskModal(defaultGroupName = "") {
  if (typeof defaultGroupName !== "string") defaultGroupName = "";
  
  document.querySelector("#collectTaskName").value = "";
  document.querySelector("#collectTaskDesc").value = "";
  document.querySelector("#collectTaskDeadline").value = "";
  document.querySelector("#collectTaskTypes").innerHTML = COLLECT_TASK_FILE_TYPES.map((type) => `<option>${escapeHtml(type)}</option>`).join("");
  
  document.querySelector("#collectTaskModal").classList.remove("hidden");
}

function handleCollectTaskSubmit(event) {
  event.preventDefault();
  const form = event.target;
  const data = Object.fromEntries(new FormData(form));
  
  if (!data.deadline) {
    showToast("请设置截止日期");
    return;
  }
  
  db.collectTasks.unshift({ 
    theme: data.name, 
    desc: data.desc,
    deadline: data.deadline,
    types: [...document.querySelector("#collectTaskTypes").selectedOptions].map(opt => opt.value),
    status: "生效中", 
    code: Math.random().toString(36).slice(2, 6), 
    creator: currentUser.name, 
    createdAt: nowText(), 
    expiresAt: data.deadline 
  });
  saveDb();
  closeCollectTaskModal();
  state.page = "collect";
  render();
}

function closeCollectTaskModal() {
  document.querySelector("#collectTaskModal").classList.add("hidden");
}

function getSelectedAssets() {
  return [...state.selectedIds].map(findAsset).filter(Boolean);
}

function updateBasketCount() {
  const count = state.selectedIds.size;
  const countNode = document.querySelector("#basketCount");
  if (countNode) countNode.textContent = String(count);
  document.querySelector("#basketButton")?.classList.toggle("has-items", count > 0);
  const drawer = document.querySelector("#basketDrawer");
  if (drawer && !drawer.classList.contains("hidden")) renderBasketDrawer();
}
