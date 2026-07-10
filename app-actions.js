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
  const groupId = options.groupId || (state.groupId === "all" ? "test" : state.groupId);
  if (!canUploadToGroup(groupId)) {
    showToast("没有权限上传素材到该素材组");
    return;
  }
  
  const incomingFiles = [...fileList];
  const files = incomingFiles.filter(isAllowedUploadFile);
  const rejectedCount = incomingFiles.length - files.length;
  if (!files.length) {
    if (rejectedCount) showToast("所选文件格式暂不支持上传");
    return;
  }
  if (rejectedCount) showToast(`已跳过 ${rejectedCount} 个不支持的文件格式`);
  showToast(`正在识别并导入 ${files.length} 个文件...`);
  
  const collectTaskCode = Math.random().toString(36).slice(2, 6);
  const collectTaskId = `collect-${Date.now()}`;
  const collectLink = getCollectLink(collectTaskCode);
  const groupName = getGroupName(groupId);
  
  db.collectTasks.unshift({
    id: collectTaskId,
    theme: `${currentUser.username} 的内部上传任务`,
    desc: options.desc || "",
    group: groupName,
    status: getCollectTaskStatusConfig().completed,
    code: collectTaskCode,
    creator: currentUser.username,
    createdBy: currentUser.username,
    ownedBy: currentUser.username,
    ownedByDept: currentUser.department || "",
    createdAt: nowText(),
    updatedAt: nowText(),
    expiresAt: calculateExpireTime("永久有效"),
    requirePassword: false,
    password: "",
    types: options.types || [],
    link: collectLink,
    auditStatus: getAuditStatusConfig().humanPass,
    logs: []
  });
  logOperation('collect', collectTaskId, `${currentUser.username} 的内部上传任务`, 'collect.create', '创建了收集任务');
  
  const created = [];
  for (const file of files) {
    const auditConfig = getAuditStatusConfig();
    const assetStatusConfig = getAssetStatusConfig();
    const asset = await createAssetFromFile(file, {
      ...options,
      auditStatus: auditConfig.pendingAudit,
      assetStatus: assetStatusConfig.pending,
      asset_source: "internal",
      collect_id: collectTaskId,
      collect_link: collectLink
    });
    db.assets.unshift(asset);
    created.push(asset);
    logOperation('asset', asset.id, asset.name, 'asset.upload', '上传了素材');
  }
  saveDb();
  state.page = "pending";
  state.groupId = created[0]?.groupId || "all";
  state.selectedIds = new Set(created.map((asset) => asset.id));
  document.querySelector("#fileInput").value = "";
  document.querySelector("#folderInput").value = "";
  render();
  showToast(`已上传 ${created.length} 个素材到待审核，审核通过后将在素材库显示`);
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
  const auditConfig = getAuditStatusConfig();
  const assetStatusConfig = getAssetStatusConfig();
  const validityConfig = getValidityStatusConfig();
  const now = new Date();
  const validStartDate = toJsDate(createdTime);
  const expireDate = toJsDate(validUntilDate);
  let validityStatus = validityConfig.valid;
  if (now < validStartDate) {
    validityStatus = validityConfig.pending;
  } else if (now > expireDate && !isNaN(expireDate.getTime())) {
    validityStatus = validityConfig.expired;
  }
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
    groupId: options.groupId || state.groupId,
    owner: currentUser.username,
    department: currentUser.department,
    creator: currentUser.username,
    lastUpdate: currentUser.username,
    createdBy: currentUser.username,
    ownedBy: currentUser.username,
    ownedByDept: currentUser.department || "",
    asset_source: options.asset_source || "internal",
    collect_id: options.collect_id || "",
    collect_link: options.collect_link || "",
    permission: "企业内部 - 可下载",
    validUntil: validUntilDate,
    auditStatus: options.auditStatus || auditConfig.pendingSubmit,
    assetStatus: options.assetStatus || assetStatusConfig.pending,
    validityStatus: validityStatus,
    uploadDate,
    validStart: toISODate(createdTime),
    validUntilDate,
    share: 0,
    download: 0,
    view: 0,
    createdAt: createdTime,
    updatedAt: createdTime,
    version: `${Date.now()}`,
    logs: [],
  };
}

function deleteSelectedAssets() {
  if (!state.selectedIds.size) {
    showToast("请先选择需要删除的素材");
    return;
  }
  const canBatch = state.groupId ? canContributeToGroup(state.groupId) : canContributeToGroup(null);
  if (!canBatch) {
    return showToast("权限不足，无法删除素材。请联系管理员申请权限。");
  }
  const assets = db.assets.filter((asset) => state.selectedIds.has(asset.id));
  for (const asset of assets) {
    if (!canDeleteAsset(asset)) {
      showToast(`权限不足，无法删除素材「${asset.name}」。请联系管理员申请权限。`);
      return;
    }
  }
  const assetStatusConfig = getAssetStatusConfig();
  assets.forEach((asset) => {
    asset.assetStatus = assetStatusConfig.deleted;
    asset.updatedAt = nowText();
    asset.deletedAt = asset.updatedAt;
    logOperation('asset', asset.id, asset.name, 'asset.delete', '删除了素材（软删除）');
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
  const auditConfig = getAuditStatusConfig();
  const assetStatusConfig = getAssetStatusConfig();
  const pendingIds = db.assets
    .filter(isPendingAsset)
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
      asset.auditStatus = auditConfig.humanPass;
      asset.assetStatus = assetStatusConfig.active;
      asset.updatedAt = nowText();
      logOperation('asset', asset.id, asset.name, 'asset.edit', '审核入库了素材');
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
  const assets = db.assets.filter((asset) => state.selectedIds.has(asset.id));
  for (const asset of assets) {
    if (!canEditAsset(asset)) {
      showToast(`没有权限编辑素材「${asset.name}」`);
      return;
    }
  }
  assets.forEach((asset) => {
    const oldTags = [...(asset.aiTags || [])];
    asset.aiTags = recognizeTags({ name: asset.name, type: asset.mime || "" }, { width: asset.width, height: asset.height, interiorColors: asset.interiorColors, exteriorColors: asset.exteriorColors });
    ensureRecognizedAiTagsInLibrary(asset.aiTags);
    asset.updatedAt = nowText();
    logOperation('asset', asset.id, asset.name, 'asset.tag', `重新识别标签：${asset.aiTags.join("、")}`);
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
      img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
      img.onerror = () => resolve({ width: 0, height: 0 });
      img.src = src;
    });
  }
  if (file.type.startsWith("video/")) {
    return new Promise((resolve) => {
      const video = document.createElement("video");
      video.onloadedmetadata = () => resolve({ width: video.videoWidth, height: video.videoHeight });
      video.onerror = () => resolve({ width: 0, height: 0 });
      video.src = src;
    });
  }
  return Promise.resolve({ width: 0, height: 0 });
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
  if (info.interiorColors && info.interiorColors.length) tags.add(...info.interiorColors);
  if (info.exteriorColors && info.exteriorColors.length) tags.add(...info.exteriorColors);
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
  
  let menuHtml = `<button class="${selected.size ? "" : "active-side"}" data-filter-value="" type="button">全部</button>`;
  
  const showSearch = ["业务标签", "AI标签", "文件格式", "车系", "车型", "内饰色", "外饰色"].includes(label);
  if (showSearch) {
    menuHtml += `<div class="filter-search"><input type="text" placeholder="搜索..." class="filter-search-input" /></div>`;
  }
  menuHtml += `<div class="filter-tree-container">${renderFilterTree(values, selected)}</div>`;
  
  els.assetMenu.innerHTML = menuHtml;
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
      const newAnchor = els.filters.querySelector(`[data-filter="${cssEscape(label)}"]`);
      if (newAnchor) showFilterMenu(newAnchor, label);
      else hideMenus();
    });
  });
  
  els.assetMenu.querySelectorAll(".tree-expand-btn").forEach((btn) => {
    btn.addEventListener("click", (event) => {
      event.stopPropagation();
      const treeNode = btn.closest(".tree-node");
      const childrenContainer = treeNode.querySelector(".tree-children");
      const isExpanded = !childrenContainer.classList.contains("hidden");
      childrenContainer.classList.toggle("hidden", isExpanded);
      btn.classList.toggle("expanded", !isExpanded);
    });
  });
  
  const searchInput = els.assetMenu.querySelector(".filter-search-input");
  if (searchInput) {
    searchInput.addEventListener("input", (event) => {
      const query = event.target.value.toLowerCase();
      els.assetMenu.querySelectorAll(".tree-node").forEach((node) => {
        const text = node.querySelector(".tree-label")?.textContent.toLowerCase() || "";
        const isMatch = text.includes(query);
        node.style.display = isMatch ? "" : "none";
        if (isMatch) {
          let parent = node.parentElement;
          while (parent && parent.classList.contains("tree-children")) {
            parent.classList.remove("hidden");
            const parentNode = parent.parentElement;
            if (parentNode) parentNode.style.display = "";
            parent = parentNode.parentElement;
          }
        }
      });
    });
  }
}

function renderFilterTree(nodes, selected) {
  const renderNode = (node, depth = 0) => {
    const name = node.tagName || node.name;
    const active = selected.has(name);
    const hasChildren = node.children && node.children.length > 0;
    const selectable = node.selectable !== false;
    const indentStyle = depth > 0 ? `style="padding-left: ${depth * 24}px"` : "";
    
    let childrenHtml = "";
    if (hasChildren) {
      childrenHtml = `<div class="tree-children">${node.children.map((child) => renderNode(child, depth + 1)).join("")}</div>`;
    }
    
    const filterValueAttr = selectable ? `data-filter-value="${escapeAttr(name)}"` : "";
    const checkbox = selectable ? `<span class="tree-checkbox">${active ? "✓" : ""}</span>` : "";
    const className = `tree-item ${active ? "active-side" : ""} ${!selectable ? "tree-category" : ""}`;
    
    return `
      <div class="tree-node" ${indentStyle}>
        <button class="${className}" ${filterValueAttr} type="button">
          ${hasChildren ? `<span class="tree-expand-btn ${depth === 0 ? "expanded" : ""}">▶</span>` : `<span class="tree-expand-placeholder">·</span>`}
          ${checkbox}
          <span class="tree-label">${escapeHtml(name)}</span>
        </button>
        ${childrenHtml}
      </div>
    `;
  };
  
  return nodes.map((node) => renderNode(node)).join("");
}

function showUploadTimeFilterMenu(anchor, label) {
  const rect = anchor.getBoundingClientRect();
  const selections = getFilterSelections(label);
  const startDate = selections[0] || "";
  const endDate = selections[1] || "";
  els.assetMenu.innerHTML = `
    <div class="date-range-container">
      <label class="date-range-field">
        <span class="date-range-label">开始日期</span>
        <input id="assetUploadTimeStart" type="date" value="${escapeAttr(toInputDateValue(startDate))}" readonly inputmode="none" />
      </label>
      <label class="date-range-field">
        <span class="date-range-label">结束日期</span>
        <input id="assetUploadTimeEnd" type="date" value="${escapeAttr(toInputDateValue(endDate))}" readonly inputmode="none" />
      </label>
    </div>
    <button class="${selections.length ? "" : "active-side"}" data-clear-upload-time type="button">全部时间</button>`;
  positionFloatingMenu(els.assetMenu, rect);
  const cssEscapeT = (str) => str.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
  const reopen = (newAnchor) => showUploadTimeFilterMenu(newAnchor, label);
  const applyValue = (start, end) => {
    if (start || end) {
      state.filters[label] = [start || "", end || ""];
    } else {
      delete state.filters[label];
    }
    render();
    const newAnchor = els.filters.querySelector(`[data-filter="${cssEscapeT(label)}"]`);
    if (newAnchor) reopen(newAnchor);
  };
  const startInput = els.assetMenu.querySelector("#assetUploadTimeStart");
  const endInput = els.assetMenu.querySelector("#assetUploadTimeEnd");
  window.initDatePicker(startInput, {
    minDate: "2020-01-01",
    maxDate: endDate || "2036-12-31",
    onChange: (dates, value) => applyValue(value, endDate),
  });
  window.initDatePicker(endInput, {
    minDate: startDate || "2020-01-01",
    maxDate: "2036-12-31",
    onChange: (dates, value) => applyValue(startDate, value),
  });
  startInput.addEventListener("change", (event) => applyValue(event.target.value, endDate));
  endInput.addEventListener("change", (event) => applyValue(startDate, event.target.value));
  els.assetMenu.querySelector("[data-clear-upload-time]")?.addEventListener("click", (event) => {
    event.stopPropagation();
    delete state.filters[label];
    render();
    const newAnchor = els.filters.querySelector(`[data-filter="${cssEscapeT(label)}"]`);
    if (newAnchor) reopen(newAnchor);
  });
}

function getFilterValues(label) {
  const active = db.assets.filter((asset) => !getAssetStatusConfig().deletedCodes.includes(asset.assetStatus));
  
  const brandFilter = state.filters["品牌"] || [];
  const seriesFilter = state.filters["车系"] || [];
  const modelFilter = state.filters["车型"] || [];
  
  const buildFlatTree = (items) => {
    return [...new Set(items)].map((item) => ({ name: item, selectable: true, children: [] }));
  };
  
  // Build cascaded tree (eg. series filtered by selected brands)
  const buildCascadeTree = (dimCode, parentFilter, parentDimCode) => {
    const dim = getTreeNodeByCode(dimCode);
    if (!dim) return [];
    const allItems = getTreeChildren(dim.id);
    if (!parentFilter || !parentFilter.length) {
      return allItems.map(item => ({ name: item.name, selectable: true, children: [] }));
    }
    const parentDim = getTreeNodeByCode(parentDimCode);
    if (!parentDim) return allItems.map(item => ({ name: item.name, selectable: true, children: [] }));
    const parentItems = getTreeChildren(parentDim.id).filter(p => parentFilter.includes(p.name));
    const parentIds = parentItems.map(p => p.id);
    return allItems.filter(item => !item.refId || parentIds.includes(item.refId))
      .map(item => ({ name: item.name, selectable: true, children: [] }));
  };
  
  const map = {
    "创建者/创建部门": buildFlatTree(active.flatMap((asset) => [asset.owner, asset.department])),
    "素材来源": buildFlatTree(getAllLeafValues("source").map(n => n.name).filter(Boolean)),
    "文件格式": buildFilterTree("file_format"),
    "品牌": buildFilterTree("brand"),
    "车系": buildCascadeTree("series", brandFilter, "brand"),
    "车型": buildCascadeTree("model", seriesFilter, "series"),
    "内饰色": buildCascadeTree("interior_color", modelFilter, "model"),
    "外饰色": buildCascadeTree("exterior_color", modelFilter, "model"),
    "权限范围": buildFlatTree(getAllLeafValues("permission_scope").map(n => n.name)),
    "业务标签": getTagSummary().businessTagTree.map(t => ({ ...t, selectable: true })),
    "AI标签": getTagSummary().aiTagTree.map(t => ({ ...t, selectable: true })),
    "素材状态": buildFlatTree(getAllLeafValues("asset_status").map(n => n.name)),
    "素材失效日": buildFlatTree(["永久有效", "30天内", "90天内"]),
    "时长": buildFlatTree(["图片", "短视频", "长视频"]),
    "创建时间": buildFlatTree(["今天", "近7天", "近30天"]),
    "宽高比": buildFlatTree(getAllLeafValues("aspect_ratio").map(n => n.name)),
    "文件大小": buildFlatTree(getAllLeafValues("file_size").map(n => n.name)),
  };
  
  return map[label] || [];
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
  if (action === "logout") logoutCurrentUser();
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
  if (!canManageGroup(groupId)) {
    showToast("没有权限删除素材组");
    return;
  }
  const childIds = db.groups.filter((item) => item.parentId === groupId).map((item) => item.id);
  const ids = [groupId, ...childIds];
  const assetCount = db.assets.filter((asset) => ids.includes(asset.groupId) && !getAssetStatusConfig().deletedCodes.includes(asset.assetStatus)).length;
  const ok = await window.Modal.confirm(`确定删除素材组「${group.name}」吗？组内 ${assetCount} 个素材会移动到全部素材。`);
  if (!ok) return;
  db.assets.forEach((asset) => {
    if (ids.includes(asset.groupId)) {
      asset.groupId = "all";
      asset.updatedAt = nowText();
      logOperation('asset', asset.id, asset.name, 'asset.move', `素材组「${group.name}」被删除，素材移到全部素材`);
    }
  });
  db.groups.forEach((g) => {
    if (ids.includes(g.id)) {
      g.status = getGroupStatusConfig().deleted;
      g.deletedAt = nowText();
      g.updatedAt = nowText();
      logOperation('group', g.id, g.name, 'group.delete', '删除了素材组（软删除）');
    }
  });
  if (ids.includes(state.groupId)) state.groupId = "all";
  invalidateGroupPermissionCache();
  saveDb();
  render();
  showToast("素材组已移入回收站");
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
    <button class="split" data-group-action="collect" type="button">收素材</button>
    <button data-group-action="download" type="button">下载</button>
    <button data-group-action="share" type="button">分享</button>
    <button data-group-action="shareRecord" type="button">分享记录</button>
    <button class="split" data-group-action="copy" type="button">复制素材组</button>
    <button data-group-action="move" type="button">移动素材组</button>
    <button data-group-action="permission" type="button">权限设置</button>
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
  if (action === "collect") openCollectTaskModal(getGroupName(groupId));
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
  if (action === "permission") openGroupPermissionModal(groupId);
}

function getGroupDescendantIds(groupId) {
  const ids = new Set([groupId]);
  let changed = true;
  while (changed) {
    changed = false;
    db.groups.forEach((group) => {
      const groupStatusConfig = getGroupStatusConfig();
      if (group.parentId && !groupStatusConfig.deletedCodes.includes(group.status) && ids.has(group.parentId) && !ids.has(group.id)) {
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

function downloadGroup(groupId) {
  const ids = getGroupDescendantIds(groupId);
  const first = db.assets.find((asset) => ids.includes(asset.groupId) && !getAssetStatusConfig().deletedCodes.includes(asset.assetStatus));
  if (first) downloadAsset(first.id);
  showToast("已创建素材组下载任务");
}

function createGroupShare(groupId) {
  const group = db.groups.find((item) => item.id === groupId);
  if (!group) return;
  if (!canCreateShare(group, "view")) {
    showToast("没有权限创建分享链接");
    return;
  }
  const code = Math.random().toString(36).slice(2, 8);
  const link = getShareLink("group", groupId, code);
  db.shares.unshift({ 
    id: `share-${Date.now()}`,
    group: group.name, 
    user: currentUser.username, 
    access: "分享给互联网用户（无需登录）", 
    visits: 0, 
    views: 0, 
    downloads: 0, 
    sharedAt: nowText(), 
    expiresAt: "永久有效", 
    targetType: "group", 
    targetId: groupId, 
    code, 
    link, 
    requirePassword: false, 
    password: "",
    accessScope: "internal",
    contentPermission: "view",
    maxVisits: null,
    status: "active",
    ownedBy: currentUser.username,
    ownedByDept: currentUser.department || "",
    createdBy: currentUser.username,
    updatedAt: nowText(),
    logs: []
  });
  logOperation('share', link, group.name, 'share.create', '创建了分享链接');
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
  if (!group) return;
  if (!canManageGroup(groupId)) {
    showToast("没有权限解散素材组");
    return;
  }
  const ok = await window.Modal.confirm(`确定解散素材组「${group.name}」吗？组内素材会移动到上级素材组。`);
  if (!ok) return;
  const targetId = group.parentId || "all";
  db.assets.forEach((asset) => {
    if (asset.groupId === groupId) {
      asset.groupId = targetId;
      asset.updatedAt = nowText();
      logOperation('asset', asset.id, asset.name, 'asset.move', `素材组「${group.name}」被解散，素材移到上级素材组`);
    }
  });
  db.groups.forEach((item) => {
    if (item.parentId === groupId) {
      item.parentId = group.parentId || "";
      item.depth = Math.max(0, (group.depth || 0));
    }
  });
  logOperation('group', groupId, group.name, 'group.delete', '解散了素材组');
  db.groups = db.groups.filter((item) => item.id !== groupId);
  if (state.groupId === groupId) state.groupId = targetId;
  invalidateGroupPermissionCache();
  saveDb();
  render();
  showToast("素材组已解散");
}

async function deleteGroupAndAssets(groupId) {
  const group = db.groups.find((item) => item.id === groupId);
  if (!group) return;
  if (!canManageGroup(groupId)) {
    showToast("没有权限删除素材组");
    return;
  }
  const ids = getGroupDescendantIds(groupId);
  const ok = await window.Modal.confirm(`确定删除「${group.name}」及组内素材吗？组内素材和素材组都会进入回收站。`);
  if (!ok) return;
  const assetStatusConfig = getAssetStatusConfig();
  db.assets.forEach((asset) => {
    if (ids.includes(asset.groupId)) {
      asset.assetStatus = assetStatusConfig.deleted;
      asset.updatedAt = nowText();
      asset.deletedAt = asset.updatedAt;
      logOperation('asset', asset.id, asset.name, 'asset.delete', '删除了素材（软删除）');
    }
  });
  db.groups.forEach((g) => {
    if (ids.includes(g.id)) {
      g.status = getGroupStatusConfig().deleted;
      g.deletedAt = nowText();
      g.updatedAt = nowText();
      logOperation('group', g.id, g.name, 'group.delete', '删除了素材组（软删除）');
    }
  });
  if (ids.includes(state.groupId)) state.groupId = "all";
  invalidateGroupPermissionCache();
  saveDb();
  render();
  showToast("素材和素材组已移入回收站");
}

function showAssetMenu(anchor, id) {
  const rect = anchor.getBoundingClientRect();
  const asset = findAsset(id);
  const assetStatusConfig = getAssetStatusConfig();
  const deleted = asset && assetStatusConfig.deletedCodes.includes(asset.assetStatus);
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
    <button data-acl="${id}" type="button">权限管理</button>
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
  if (button.dataset.acl) openAssetPermissionModal(id);
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
  logOperation('asset', asset.id, asset.name, 'asset.view', '浏览了素材');
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
  const canManage = canManageAsset(asset);
  els.detailTabs.querySelectorAll("button").forEach((button) => {
    button.classList.toggle("active", button.dataset.tab === state.detailTab);
    if (button.dataset.tab === "log") {
      button.classList.toggle("hidden", !canManage);
    }
  });
  const logContent = (asset.logs || []).map((log) => {
    const actionName = log.actionName || log.action || "-";
    return `<div class="log-item"><span>${escapeHtml(formatDateTimeDisplay(log.createdAt || nowText()))}</span><span class="log-action-tag">${escapeHtml(actionName)}</span><p>${escapeHtml(log.detail || "-")}</p><small>操作人: ${escapeHtml(log.operator || currentUser.username)}</small></div>`;
  }).join("") || renderEmpty("暂无操作日志");
  const content = {
    overview: `<div class="detail-section"><div class="field editable-field" data-overview-edit="asset"><span>素材名称</span><b>${escapeHtml(asset.name)}</b><small>点击编辑</small></div></div><div class="detail-section"><div class="section-title"><h3>AI标签</h3><button id="retagFromOverview" type="button">AI重新打标</button></div><div class="tag-list">${(asset.aiTags || []).map((tag) => `<span>${escapeHtml(tag)}</span>`).join("") || "<em>暂无AI标签</em>"}</div></div><div class="detail-section"><div class="section-title"><h3>素材信息</h3><button data-overview-edit="asset" type="button">编辑信息</button></div><div class="field-grid"><button class="field interactive" data-overview-edit="asset" type="button"><span>品牌</span>${escapeHtml(asset.brand || "-")}</button><button class="field interactive" data-overview-edit="asset" type="button"><span>车系</span>${escapeHtml(asset.series || "-")}</button><button class="field interactive" data-overview-edit="asset" type="button"><span>车型</span>${escapeHtml(asset.model || "-")}</button><button class="field interactive" data-overview-edit="asset" type="button"><span>内饰色</span>${escapeHtml((asset.interiorColors || []).join("、") || "-")}</button><button class="field interactive" data-overview-edit="asset" type="button"><span>外饰色</span>${escapeHtml((asset.exteriorColors || []).join("、") || "-")}</button><button class="field interactive" data-overview-edit="asset" type="button"><span>业务标签</span>${escapeHtml((asset.customTags || []).join("、") || "-")}</button></div></div>`,
    detail: `<button class="table-tool" id="editFromDetail" type="button"><span data-icon="edit"></span> 编辑素材信息</button><div class="detail-section"><h3>基础信息</h3><div class="field"><span>素材所有者</span>${escapeHtml(asset.owner)}<br><small>${escapeHtml(asset.department)}</small></div><div class="field"><span>更新时间</span>${formatDateTimeDisplay(asset.updatedAt)}</div><div class="field"><span>上传时间</span>${formatDateTimeDisplay(asset.createdAt)}</div><div class="field"><span>文件尺寸</span>${asset.width || "-"}×${asset.height || "-"}</div><div class="field"><span>素材ID</span>${asset.id}</div><div class="field"><span>文件格式</span>${asset.format}</div><div class="field"><span>文件大小</span>${formatBytes(asset.sizeBytes)}</div></div><div class="detail-section"><div class="field"><span>名称</span>${escapeHtml(asset.name)}</div><div class="field"><span>描述</span>${escapeHtml(asset.desc || "-")}</div><div class="field"><span>品牌</span>${escapeHtml(asset.brand || "无")}</div><div class="field"><span>车系</span>${escapeHtml(asset.series || "无")}</div><div class="field"><span>车型</span>${escapeHtml(asset.model || "无")}</div><div class="field"><span>内饰色</span>${escapeHtml((asset.interiorColors || []).join("、") || "无")}</div><div class="field"><span>外饰色</span>${escapeHtml((asset.exteriorColors || []).join("、") || "无")}</div><div class="field"><span>业务标签</span>${escapeHtml((asset.customTags || []).join("、") || "无")}</div><div class="field"><span>素材生效日期</span>${escapeHtml(asset.validStart ? formatDateTimeDisplay(asset.validStart) : "-")}</div><div class="field"><span>素材失效日期</span>${escapeHtml(formatAssetValidUntil(asset))}</div><div class="field"><span>AI标签</span>${escapeHtml((asset.aiTags || []).join("、") || "无")}</div></div>`,
    comment: `<div class="comment-box"><textarea id="commentText" placeholder="写一条评论"></textarea><button id="addComment" class="primary" type="button">发布</button></div>${(asset.comments || []).map((item) => `<div class="info-card"><b>${escapeHtml(item.user || currentUser.username)}</b><small>${item.time || ""}</small><p>${escapeHtml(item.text || item)}</p></div>`).join("") || renderEmpty("暂无评论")}`,
    log: `<div class="timeline">${logContent}</div>`,
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
    asset.comments.unshift({ user: currentUser.username, time: nowText(), text: value });
    logOperation('asset', asset.id, asset.name, 'asset.comment', `评论了素材：${value}`);
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
  const assetStatusConfig = getAssetStatusConfig();
  const filtered = getFilteredAssets().filter((asset) => !assetStatusConfig.deletedCodes.includes(asset.assetStatus));
  if (filtered.some((asset) => asset.id === state.selectedAssetId)) return filtered;
  return sortAssets(db.assets.filter((asset) => !assetStatusConfig.deletedCodes.includes(asset.assetStatus)));
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
  logOperation('asset', nextAsset.id, nextAsset.name, 'asset.view', '浏览了素材');
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
  const canDownload = canDownloadAsset(asset);
  const canShare = canCreateShare(asset, "view");
  footer.innerHTML = `
    ${canDownload ? `<button class="primary" data-detail-action="download" type="button">下载素材</button>` : ""}
    ${canShare ? `<button data-detail-action="share" type="button">分享</button>` : ""}
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
  document.querySelector("#editAssetValidStartDate").value = escapeAttr(toInputDateValue(asset.validStart || asset.uploadDate));
  document.querySelector("#editAssetValidStartTime").value = escapeAttr(validStartParts.time);
  const validUntilParts = splitDateTimeText(asset.validUntilDate || asset.validUntil || "");
  document.querySelector("#editAssetValidUntilDate").value = escapeAttr(toInputDateValue(asset.validUntilDate || asset.validUntil));
  document.querySelector("#editAssetValidUntilTime").value = escapeAttr(validUntilParts.time || "23:59");

  document.querySelector("#editAssetSeries").value = asset.series || "";
  document.querySelector("#editAssetModel").value = asset.model || "";
  document.querySelector("#editAssetInteriorColors").value = Array.isArray(asset.interiorColors) ? (asset.interiorColors[0] || "") : (asset.interiorColors || "");
  document.querySelector("#editAssetExteriorColors").value = Array.isArray(asset.exteriorColors) ? (asset.exteriorColors[0] || "") : (asset.exteriorColors || "");
  document.querySelector("#editAssetPermission").value = asset.permission;

  setupAssetEditCascades();

  document.querySelector("#editAssetModal").classList.remove("hidden");
}

function setupAssetEditCascades() {
  const brandInput = document.querySelector("#editAssetBrand");
  const seriesInput = document.querySelector("#editAssetSeries");
  const modelInput = document.querySelector("#editAssetModel");
  const allBrands = getAllLeafValues("brand");
  const allSeries = getAllLeafValues("series");
  const allModels = getAllLeafValues("model");
  const allInteriorColors = getAllLeafValues("interior_color");
  const allExteriorColors = getAllLeafValues("exterior_color");

  const renderSeriesOptions = () => {
    const brand = brandInput.value.trim();
    let filteredSeries = allSeries;
    if (brand) {
      const brandNode = allBrands.find((node) => node.name === brand);
      if (brandNode) filteredSeries = allSeries.filter((node) => node.refId === brandNode.id);
    }
    setupAssetEditDropdown("editAssetSeries", filteredSeries.map((node) => node.name), {
      onPick: renderModelOptions,
      onInput: renderModelOptions,
    });
    renderModelOptions();
  };

  const renderModelOptions = () => {
    const series = seriesInput.value.trim();
    let filteredModels = allModels;
    if (series) {
      const seriesNode = allSeries.find((node) => node.name === series);
      if (seriesNode) filteredModels = allModels.filter((node) => node.refId === seriesNode.id);
    }
    setupAssetEditDropdown("editAssetModel", filteredModels.map((node) => node.name), {
      onPick: renderColorOptions,
      onInput: renderColorOptions,
    });
    renderColorOptions();
  };

  const renderColorOptions = () => {
    const model = modelInput.value.trim();
    let filteredInterior = allInteriorColors;
    let filteredExterior = allExteriorColors;
    if (model) {
      const modelNode = allModels.find((node) => node.name === model);
      if (modelNode) {
        filteredInterior = allInteriorColors.filter((node) => node.refId === modelNode.id);
        filteredExterior = allExteriorColors.filter((node) => node.refId === modelNode.id);
      }
    }
    setupAssetEditDropdown("editAssetInteriorColors", filteredInterior.map((node) => node.name));
    setupAssetEditDropdown("editAssetExteriorColors", filteredExterior.map((node) => node.name));
  };

  setupAssetEditDropdown("editAssetCustomTags", getTagSummary().businessTags.map((tag) => tag.tagName || tag.name).filter(Boolean), { multiple: true });
  setupAssetEditDropdown("editAssetBrand", allBrands.map((node) => node.name), {
    onPick: renderSeriesOptions,
    onInput: renderSeriesOptions,
  });
  renderSeriesOptions();
}

function closeAssetEditDropdowns(exceptPanel) {
  document.querySelectorAll(".asset-edit-combo-panel").forEach((panel) => {
    if (panel !== exceptPanel) panel.classList.add("hidden");
  });
}

function getAssetEditCurrentToken(value) {
  return String(value || "").split(/[,，]/).pop().trim().toLowerCase();
}

function getSingleAssetEditValue(value) {
  return splitTags(value)[0] || "";
}

function setupAssetEditDropdown(inputId, options, config = {}) {
  const input = document.querySelector(`#${inputId}`);
  const panel = document.querySelector(`#${inputId}Panel`);
  const toggle = document.querySelector(`[data-asset-edit-toggle="${inputId}"]`);
  if (!input || !panel) return;
  const uniqueOptions = [...new Set((options || []).filter(Boolean))];
  const multiple = Boolean(config.multiple);

  const renderOptions = (query = "", forceAll = false) => {
    const normalizedQuery = query.trim().toLowerCase();
    const visibleOptions = forceAll || !normalizedQuery
      ? uniqueOptions
      : uniqueOptions.filter((option) => option.toLowerCase().includes(normalizedQuery));
    panel.innerHTML = visibleOptions.length
      ? visibleOptions.map((option) => `<button type="button" data-asset-edit-option="${escapeAttr(option)}">${escapeHtml(option)}</button>`).join("")
      : `<div class="asset-edit-combo-empty">暂无可选项</div>`;
    closeAssetEditDropdowns(panel);
    panel.classList.remove("hidden");
  };

  input.onfocus = () => renderOptions("", true);
  input.oninput = () => {
    renderOptions(multiple ? getAssetEditCurrentToken(input.value) : input.value, false);
    if (typeof config.onInput === "function") config.onInput(input.value);
  };
  if (toggle) {
    toggle.onclick = (event) => {
      event.preventDefault();
      event.stopPropagation();
      renderOptions("", true);
      input.focus();
    };
  }
  panel.onclick = (event) => {
    const optionButton = event.target.closest("[data-asset-edit-option]");
    if (!optionButton) return;
    const value = optionButton.dataset.assetEditOption || "";
    if (multiple) {
      const current = splitTags(input.value);
      if (!current.includes(value)) current.push(value);
      input.value = current.join(", ");
      renderOptions("", true);
    } else {
      input.value = value;
      panel.classList.add("hidden");
    }
    if (typeof config.onPick === "function") config.onPick(value);
    if (multiple) input.focus();
  };

  if (!setupAssetEditDropdown.boundDocumentClick) {
    document.addEventListener("click", (event) => {
      if (!event.target.closest(".asset-edit-combo")) closeAssetEditDropdowns();
    });
    setupAssetEditDropdown.boundDocumentClick = true;
  }
}

function handleEditAssetSubmit(event) {
  event.preventDefault();
  const asset = findAsset(editAssetId);
  if (!asset) return;
  if (!canEditAsset(asset)) {
    showToast("没有权限编辑素材");
    return;
  }

  const form = event.target;
  const data = Object.fromEntries(new FormData(form));
  const validUntil = data.validUntilDate ? joinDateTime(data.validUntilDate, data.validUntilTime || "23:59") : calculateExpireTime("永久有效");
  const interiorColor = getSingleAssetEditValue(data.interiorColors);
  const exteriorColor = getSingleAssetEditValue(data.exteriorColors);
  Object.assign(asset, {
    name: data.name.trim(),
    desc: data.desc.trim(),
    customTags: splitTags(data.customTags),
    brand: data.brand.trim(),
    series: data.series.trim(),
    model: data.model.trim(),
    interiorColors: interiorColor ? [interiorColor] : [],
    exteriorColors: exteriorColor ? [exteriorColor] : [],
    validStart: data.validStartDate ? joinDateTime(data.validStartDate, data.validStartTime || "00:00") : "",
    validUntil: validUntil,
    validUntilDate: validUntil,
    permission: data.permission,
    updatedAt: nowText(),
  });
  logOperation('asset', asset.id, asset.name, 'asset.edit', '修改了素材信息');
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
  const group = { 
    id: `group-${Date.now()}`, 
    name: data.name.trim(), 
    parentId: data.parentId || "", 
    depth: parent ? (parent.depth || 0) + 1 : 0, 
    count: 0, 
    status: "active",
    createdBy: currentUser.username,
    createdAt: nowText(),
    ownedBy: currentUser.username,
    ownedByDept: currentUser.department || "",
    updatedAt: nowText(),
    logs: []
  };
  db.groups.push(group);
  
  db.groupAcl = db.groupAcl || [];
  db.groupAcl.push({
    id: `acl-${Date.now()}`,
    groupId: group.id,
    subjectType: "user",
    subjectId: currentUser.id || "user-admin",
    subjectName: currentUser.username,
    permission: "manage",
    includeSubDept: true,
    grantedBy: currentUser.username,
    grantedAt: nowText()
  });
  
  if (data.parentId) state.collapsedGroupIds.delete(data.parentId);
  state.groupId = group.id;
  state.page = "all";
  logOperation('group', group.id, group.name, 'group.create', '创建了素材组');
  invalidateGroupPermissionCache();
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
  if (!canManageGroup(editGroupId)) {
    showToast("没有权限编辑素材组");
    return;
  }
  
  const form = event.target;
  const data = Object.fromEntries(new FormData(form));
  const oldName = group.name;
  group.name = data.name.trim();
  group.desc = data.desc.trim();
  group.updatedAt = nowText();
  logOperation('group', group.id, group.name, 'group.rename', `重命名为${group.name}`);
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
  
  const options = db.groups
    .filter((item) => !item.system)
    .map((item) => {
      const isDescendant = item.id === groupId || isGroupDescendant(item.id, groupId);
      return `<option value="${item.id}"${isDescendant ? ' disabled' : ''}>${escapeHtml(item.name)}</option>`;
    })
    .join("");
  
  document.querySelector("#moveGroupParentId").innerHTML = `<option value="">无上级</option>${options}`;
  document.querySelector("#moveGroupModal").classList.remove("hidden");
}

function handleMoveGroupSubmit(event) {
  event.preventDefault();
  const group = db.groups.find((item) => item.id === moveGroupId);
  if (!group) return;
  
  const parentId = new FormData(event.target).get("parentId");
  if (!canMoveGroup(moveGroupId, parentId)) {
    showToast("没有权限移动素材组，或存在循环依赖");
    return;
  }
  
  const parent = db.groups.find((item) => item.id === parentId);
  const oldParentName = db.groups.find((g) => g.id === group.parentId)?.name || "无";
  const newParentName = parent?.name || "无";
  group.parentId = parentId || "";
  group.depth = parent ? (parent.depth || 0) + 1 : 0;
  if (parentId) state.collapsedGroupIds.delete(parentId);
  syncGroupDepths();
  logOperation('group', group.id, group.name, 'group.move', `从${oldParentName}移动到${newParentName}组下`);
  invalidateGroupPermissionCache();
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
  
  const assets = db.assets.filter((asset) => ids.includes(asset.id));
  for (const asset of assets) {
    if (!canMoveAsset(asset, groupId)) {
      showToast(`没有权限移动素材「${asset.name}」`);
      return;
    }
  }
  
  const targetGroupName = getGroupName(groupId);
  assets.forEach((item) => {
    const oldGroupName = getGroupName(item.groupId);
    item.groupId = groupId;
    item.updatedAt = nowText();
    const assetStatusConfig = getAssetStatusConfig();
    if (item.assetStatus === assetStatusConfig.pending) {
      item.assetStatus = assetStatusConfig.active;
      logOperation('asset', item.id, item.name, 'asset.edit', `审核入库并添加到${targetGroupName}`);
    } else {
      logOperation('asset', item.id, item.name, 'asset.move', `从${oldGroupName}移动到${targetGroupName}`);
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
  document.querySelector("#collectTaskTypes").innerHTML = getAllCollectTaskTypes().map((type) => `<option>${escapeHtml(type)}</option>`).join("");
  document.querySelector("#collectTaskGroup").value = defaultGroupName;
  
  document.querySelector("#collectTaskModal").classList.remove("hidden");
  initProjectDatePickers(document.querySelector("#collectTaskModal"));
}

function handleCollectTaskSubmit(event) {
  event.preventDefault();
  const form = event.target;
  const data = Object.fromEntries(new FormData(form));
  
  if (!data.expiresAtDate || !data.expiresAtTime) {
    showToast("请设置截止日期");
    return;
  }
  
  const code = Math.random().toString(36).slice(2, 6);
  const id = `collect-${Date.now()}`;
  const link = getCollectLink(code);
  db.collectTasks.unshift({ 
    id,
    theme: data.name, 
    desc: data.desc,
    group: data.group || "",
    deadline: joinDateTime(data.expiresAtDate, data.expiresAtTime),
    types: [...document.querySelector("#collectTaskTypes").selectedOptions].map(opt => opt.value),
    status: getCollectTaskStatusConfig().active, 
    code,
    creator: currentUser.username, 
    createdBy: currentUser.username,
    ownedBy: currentUser.username,
    ownedByDept: currentUser.department || "",
    createdAt: nowText(), 
    updatedAt: nowText(),
    expiresAt: joinDateTime(data.expiresAtDate, data.expiresAtTime),
    requirePassword: true,
    password: code,
    link,
    auditStatus: getAuditStatusConfig().pendingSubmit,
    logs: []
  });
  logOperation('collect', id, data.name, 'collect.create', '创建了收集任务');
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
