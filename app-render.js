function render() {
  updateGroupCounts();
  renderGroups();
  renderFilterChips();
  const showGroupsInput = document.querySelector("#showGroups");
  if (showGroupsInput) showGroupsInput.checked = state.showGroupDescendants;
  document.querySelectorAll(".nav-item").forEach((button) => {
    const morePage = ["activity", "loginLogs", "share", "collect", "recycle", "validity", "users", "roles", "organizations", "permissions"].includes(state.page);
    button.classList.toggle("active", button.dataset.page === state.page || (morePage && button.dataset.page === "more"));
  });
  els.assetToolbar.classList.toggle("hidden", !["all", "pending", "created"].includes(state.page));
  els.similarSearch.classList.toggle("hidden", !state.similar || state.page !== "all");
  if (state.similar && state.page === "all") {
    const similarAsset = findAsset(state.selectedAssetId);
    const similarImage = document.querySelector("#similarSearchImage");
    if (similarImage && similarAsset) similarImage.src = similarAsset.src;
  }

  const titleMap = {
    all: getGroupName(state.groupId) || "全部素材",
    pending: "待入库",
    created: "我创建的组",
    activity: "用户动态",
    loginLogs: "用户登录日志",
    tags: "标签管理",
    collect: "收集素材管理",
    share: "分享记录",
    recycle: "回收站",
    validity: "有效期管理",
    users: "用户管理",
    roles: "角色管理",
    organizations: "组织管理",
    permissions: "权限管理",
  };
  els.pageTitle.textContent = titleMap[state.page] || "全部素材";
  els.breadcrumb.textContent = getPageBreadcrumb(state.page);
  renderActions();

  if (["activity", "loginLogs", "collect", "share", "recycle", "validity", "users", "roles", "organizations", "permissions"].includes(state.page)) renderManagePageV2();
  else if (state.page === "tags") renderTagsPage();
  else renderAssets();
  initProjectDatePickers();
}

function initProjectDatePickers(root = document) {
  const scope = root instanceof Element ? root : document;
  window.initDatePicker(scope.querySelectorAll('input[type="date"]'), { minDate: "2020-01-01", maxDate: "2036-12-31" });
  window.initDatePicker(scope.querySelectorAll('input[type="time"]'), { minTime: "00:00", maxTime: "23:59" });
  window.initDatePicker(scope.querySelectorAll("#uploadDateFilter"), { minDate: "2020-01-01", maxDate: "today" });
  window.initDatePicker(scope.querySelectorAll("#basketValidityDate, #editAssetValidStartDate, #editAssetValidUntilDate, #collectTaskDeadline, #updateShareExpireDate, [name='expiresAtDate'], [name='validUntilDate'], [name='validStartDate'], .inline-date"), { minDate: "today", maxDate: "2036-12-31" });
  window.initDatePicker(scope.querySelectorAll("#basketValidityTime, #editAssetValidStartTime, #editAssetValidUntilTime, [name='validUntilTime'], [name='validStartTime'], .inline-time"), { minTime: "00:00", maxTime: "23:59" });
}

function bindViewerPan() {
  if (!els.imageCanvas) return;
  let startX = 0;
  let startY = 0;
  let originX = 0;
  let originY = 0;

  els.imageCanvas.addEventListener("pointerdown", (event) => {
    if (event.button !== 0) return;
    if (event.target.closest("button")) return;
    if (state.zoomLevel <= 100) return;
    state.isPanning = true;
    startX = event.clientX;
    startY = event.clientY;
    originX = state.panX;
    originY = state.panY;
    els.imageCanvas.setPointerCapture?.(event.pointerId);
    els.imageCanvas.classList.add("is-panning");
    event.preventDefault();
  });

  els.imageCanvas.addEventListener("pointermove", (event) => {
    if (!state.isPanning) return;
    state.panX = originX + event.clientX - startX;
    state.panY = originY + event.clientY - startY;
    updateZoomDisplay();
  });

  const stopPan = (event) => {
    if (!state.isPanning) return;
    state.isPanning = false;
    els.imageCanvas.releasePointerCapture?.(event.pointerId);
    els.imageCanvas.classList.remove("is-panning");
  };

  els.imageCanvas.addEventListener("pointerup", stopPan);
  els.imageCanvas.addEventListener("pointercancel", stopPan);
  els.imageCanvas.addEventListener("pointerleave", stopPan);
}

function bindViewerResize() {
  const resizer = document.querySelector("#viewerResizer");
  if (!resizer || !els.viewer) return;
  applyDetailPanelLayout();
  let startX = 0;
  let startY = 0;
  let startWidth = 0;
  let startHeight = 0;
  let startDock = state.detailPanelDock;

  resizer.addEventListener("pointerdown", (event) => {
    if (event.button !== 0) return;
    startX = event.clientX;
    startY = event.clientY;
    startWidth = state.detailPanelWidth;
    startHeight = state.detailPanelHeight;
    startDock = state.detailPanelDock;
    resizer.setPointerCapture?.(event.pointerId);
    document.body.classList.add("resizing-detail-panel");
    event.preventDefault();
  });

  resizer.addEventListener("pointermove", (event) => {
    if (!document.body.classList.contains("resizing-detail-panel")) return;
    if (startDock === "bottom") {
      const maxHeight = Math.min(360, Math.max(260, Math.round(window.innerHeight * 0.34)));
      state.detailPanelHeight = Math.min(maxHeight, Math.max(240, startHeight - (event.clientY - startY)));
    } else {
      const proposedWidth = startWidth - (event.clientX - startX);
      if (proposedWidth < 320) {
        state.detailPanelDock = "bottom";
        state.detailPanelHeight = Math.min(340, Math.max(260, Math.round(window.innerHeight * 0.30)));
      } else {
        const maxWidth = Math.min(820, Math.max(360, window.innerWidth - 520));
        state.detailPanelDock = "side";
        state.detailPanelWidth = Math.min(maxWidth, Math.max(360, proposedWidth));
      }
    }
    applyDetailPanelLayout();
  });

  const stopResize = (event) => {
    if (!document.body.classList.contains("resizing-detail-panel")) return;
    document.body.classList.remove("resizing-detail-panel");
    resizer.releasePointerCapture?.(event.pointerId);
    localStorage.setItem("dp-material-library-detail-width", String(state.detailPanelWidth));
    localStorage.setItem("dp-material-library-detail-height", String(state.detailPanelHeight));
  };

  resizer.addEventListener("pointerup", stopResize);
  resizer.addEventListener("pointercancel", stopResize);
  resizer.addEventListener("dblclick", () => {
    state.detailPanelDock = state.detailPanelDock === "bottom" ? "side" : "bottom";
    applyDetailPanelLayout();
  });
  window.addEventListener("resize", window.AppInfra.utils.debounce(applyDetailPanelLayout, 300));
}

function applyDetailPanelLayout() {
  const maxWidth = Math.min(820, Math.max(360, window.innerWidth - 520));
  state.detailPanelWidth = Math.min(maxWidth, Math.max(360, state.detailPanelWidth));
  const maxHeight = Math.min(360, Math.max(260, Math.round(window.innerHeight * 0.34)));
  state.detailPanelHeight = Math.min(maxHeight, Math.max(240, state.detailPanelHeight));
  els.viewer?.style.setProperty("--detail-panel-width", `${state.detailPanelWidth}px`);
  els.viewer?.style.setProperty("--detail-panel-height", `${state.detailPanelHeight}px`);
  els.viewer?.classList.toggle("detail-bottom", state.detailPanelDock === "bottom");
}

function renderGroups() {
  syncGroupDepths();
  els.groupTree.innerHTML = getOrderedGroups().filter((group) => !isGroupHiddenByCollapsedAncestor(group)).map((group) => {
    const hasChildren = hasChildGroups(group.id);
    const collapsed = state.collapsedGroupIds.has(group.id);
    const toggleTitle = collapsed ? "展开子素材组" : "收起子素材组";
    const toggleIcon = collapsed ? "›" : "⌄";
    return `
    <button class="tree-row ${state.groupId === group.id ? "active" : ""}" style="--depth:${group.depth || 0}" data-group="${group.id}" type="button">
      <span ${hasChildren ? `data-group-toggle="${group.id}" title="${toggleTitle}"` : ""}>${hasChildren ? toggleIcon : ""}</span><span data-icon="folder"></span><span>${escapeHtml(group.name)}</span><span class="count">${group.count || ""}</span><span class="group-actions"><i data-group-menu="${group.id}" title="素材组操作">...</i><i data-delete-group="${group.id}" title="删除素材组">×</i></span>
    </button>
  `;
  }).join("");
}

function openAllMaterials() {
  state.page = "all";
  state.groupId = "all";
  state.query = "";
  state.filters = {};
  state.similar = false;
  state.selectedIds.clear();
  if (els.globalSearch) els.globalSearch.value = "";
  render();
}

function hasChildGroups(groupId) {
  return db.groups.some((group) => group.parentId === groupId && group.status !== "deleted");
}

function getOrderedGroups() {
  const groups = db.groups.filter((group) => !group.system && group.status !== "deleted");
  const byParent = new Map();
  groups.forEach((group, index) => {
    group._treeIndex = index;
    const parentExists = !group.parentId || db.groups.some((item) => item.id === group.parentId && !item.system);
    const parentId = parentExists ? (group.parentId || "") : "";
    if (!byParent.has(parentId)) byParent.set(parentId, []);
    byParent.get(parentId).push(group);
  });

  const ordered = [];
  const visited = new Set();
  const visit = (parentId, depth) => {
    (byParent.get(parentId) || [])
      .sort((a, b) => a._treeIndex - b._treeIndex)
      .forEach((group) => {
        if (visited.has(group.id)) return;
        visited.add(group.id);
        group.depth = depth;
        ordered.push(group);
        visit(group.id, depth + 1);
      });
  };

  visit("", 0);
  groups.forEach((group) => {
    if (!visited.has(group.id)) {
      group.parentId = "";
      group.depth = 0;
      ordered.push(group);
    }
    delete group._treeIndex;
  });
  return ordered;
}

function syncGroupDepths() {
  getOrderedGroups();
}

function isGroupHiddenByCollapsedAncestor(group) {
  let parentId = group.parentId;
  while (parentId) {
    if (state.collapsedGroupIds.has(parentId)) return true;
    parentId = db.groups.find((item) => item.id === parentId)?.parentId || "";
  }
  return false;
}

function toggleGroupCollapse(groupId) {
  if (!hasChildGroups(groupId)) return;
  if (state.collapsedGroupIds.has(groupId)) {
    state.collapsedGroupIds.delete(groupId);
  } else {
    state.collapsedGroupIds.add(groupId);
    if (state.groupId !== groupId) {
      const selectedGroup = db.groups.find((group) => group.id === state.groupId);
      if (selectedGroup && isGroupHiddenByCollapsedAncestor(selectedGroup)) state.groupId = groupId;
    }
  }
  render();
}

function renderActions() {
  // 隐藏所有页面操作按钮区域
  document.querySelectorAll(".page-actions-inner").forEach((el) => el.classList.add("hidden"));

  if (state.page === "all") {
    document.querySelector('.page-actions-inner[data-page-type="all"]')?.classList.remove("hidden");
  } else if (state.page === "pending") {
    document.querySelector('.page-actions-inner[data-page-type="pending"]')?.classList.remove("hidden");
  } else if (state.page === "tags") {
    if (canEditMenu("tags")) document.querySelector('.page-actions-inner[data-page-type="tags"]')?.classList.remove("hidden");
  } else if (state.page === "collect") {
    document.querySelector('.page-actions-inner[data-page-type="collect"]')?.classList.remove("hidden");
  } else if (state.page === "recycle") {
    document.querySelector('.page-actions-inner[data-page-type="recycle"]')?.classList.remove("hidden");
  }
  // 其他页面不显示操作按钮
}

function renderAssets() {
  const filtered = state.page === "pending"
    ? db.assets.filter((asset) => asset.status === "pending")
    : getFilteredAssets();
  const body = state.view === "list" ? renderMetadataList(filtered) : renderCompactAssets(filtered);
  els.contentPanel.innerHTML = `<p class="count-line">共 ${filtered.length} 项</p>${body || renderEmpty("暂无素材")}`;
  els.viewSwitch.querySelectorAll("button").forEach((button) => button.classList.toggle("active", button.dataset.view === state.view));
  updateBasketCount();
  bindAssetEvents();
}

function renderCompactAssets(items) {
  if (state.sort === "上传日期") return renderDateGroupedAssets(items);
  return `<div class="asset-grid ${state.view}">${items.map(renderAssetCard).join("")}</div>`;
}

function renderDateGroupedAssets(items) {
  const buckets = items.reduce((map, asset) => {
    const date = asset.uploadDate || normalizeDateText(asset.createdAt || asset.updatedAt);
    if (!map[date]) map[date] = [];
    map[date].push(asset);
    return map;
  }, {});
  return Object.entries(buckets)
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([date, assets]) => `
      <section class="date-group">
        <h2 class="date-heading"><span>上传日期 ${escapeHtml(date)}</span><small>${assets.length} 项</small></h2>
        <div class="asset-grid ${state.view}">${assets.map(renderAssetCard).join("")}</div>
      </section>`)
    .join("");
}

function renderAssetCard(asset) {
  return `
    <article class="asset-card ${state.selectedIds.has(asset.id) ? "selected" : ""}" data-id="${asset.id}">
      <div class="thumb" data-preview="${asset.id}">
        ${renderThumb(asset)}
        <label class="select-dot"><input data-select-asset="${asset.id}" type="checkbox" ${state.selectedIds.has(asset.id) ? "checked" : ""} /></label>
        <span class="file-badge">${asset.format}</span>
        <span class="size-badge">${formatBytes(asset.sizeBytes)}</span>
        <div class="quick-actions">
          <button data-similar="${asset.id}" type="button" title="查找相似图"><span data-icon="search"></span></button>
          <button data-add-group="${asset.id}" type="button" title="添加到组"><span data-icon="briefcase"></span></button>
          <button data-more="${asset.id}" type="button" title="更多"><span data-icon="more"></span></button>
        </div>
      </div>
      <div class="asset-info">
        <p class="asset-name">${escapeHtml(asset.name)}</p>
        <div class="metrics"><span data-icon="share"></span>${asset.share}<span data-icon="download"></span>${asset.download}<span data-icon="eye"></span>${asset.view}</div>
        <div class="badges"><span>${asset.format}</span><span>${formatBytes(asset.sizeBytes)}</span><span>${asset.aiTags?.[0] || "未识别"}</span></div>
      </div>
    </article>`;
}

function renderThumb(asset) {
  if (asset.mime?.startsWith("image/") || /\.(jpg|jpeg|png|webp|gif)$/i.test(asset.src)) return `<img src="${asset.src}" alt="${escapeHtml(asset.name)}" />`;
  if (asset.mime?.startsWith("video/")) return `<video src="${asset.src}" muted preload="metadata"></video>`;
  return `<div class="file-tile"><b>${asset.format}</b><span>${escapeHtml(asset.name)}</span></div>`;
}

function renderMetadataList(items) {
  return `
    <div class="table-scroll metadata-scroll">
      <table class="list-table metadata-table">
        <colgroup>
        <col style="width:52px"><col style="width:280px"><col style="width:100px"><col style="width:130px">
        <col style="width:100px"><col style="width:90px"><col style="width:150px"><col style="width:150px">
        <col style="width:80px"><col style="width:100px"><col style="width:150px"><col style="width:130px"><col style="width:70px">
      </colgroup>
        <thead>
          <tr>
            <th><input data-select-all type="checkbox" ${items.length && items.every((asset) => state.selectedIds.has(asset.id)) ? "checked" : ""} /></th>
            <th>名称</th><th>创建者</th><th>上传时间</th><th>文件大小</th><th>文件格式</th>
            <th>素材生效时间</th><th>素材失效时间</th><th>状态</th><th>图片尺寸</th><th>AI标签</th><th>素材组</th><th>操作</th>
          </tr>
        </thead>
        <tbody>${items.map((asset) => {
          const dimension = asset.width && asset.height ? `${asset.width}×${asset.height}` : "-";
          const aiTags = (asset.aiTags || []).join("、") || "-";
          const validStartParts = splitDateTimeText(asset.validStart || asset.uploadDate || "");
          const validUntilParts = splitDateTimeText(asset.validUntilDate || asset.validUntil || "");
          const status = getValidityStatus(asset);
          const statusClass = getValidityStatusClass(status);
          return `
            <tr data-id="${asset.id}">
              <td><input data-select-asset="${asset.id}" type="checkbox" ${state.selectedIds.has(asset.id) ? "checked" : ""} /></td>
              <td><div class="table-name" data-preview="${asset.id}">${renderTableThumb(asset)}<span class="cell-ellipsis" title="${escapeAttr(asset.name)}">${escapeHtml(asset.name)}</span></div></td>
              <td>${escapeHtml(asset.owner || "-")}</td>
              <td>${escapeHtml(asset.uploadDate || normalizeDateText(asset.createdAt))}</td>
              <td>${formatBytes(asset.sizeBytes)}</td>
              <td>${escapeHtml(asset.format || "-")}</td>
              <td><div class="date-time-row"><input class="inline-date" data-valid-start-date="${asset.id}" type="date" value="${escapeAttr(validStartParts.date)}" readonly inputmode="none" /><input class="inline-time" data-valid-start-time="${asset.id}" type="time" value="${escapeAttr(validStartParts.time)}" readonly inputmode="none" /></div></td>
              <td><div class="date-time-row"><input class="inline-date" data-valid-until-date="${asset.id}" type="date" value="${escapeAttr(validUntilParts.date)}" readonly inputmode="none" /><input class="inline-time" data-valid-until-time="${asset.id}" type="time" value="${escapeAttr(validUntilParts.time || "23:59")}" readonly inputmode="none" /></div></td>
              <td><span class="status-dot ${statusClass}"></span>${status}</td>
              <td>${dimension}</td>
              <td><span class="cell-ellipsis" title="${escapeAttr(aiTags)}">${escapeHtml(aiTags)}</span></td>
              <td><span class="cell-ellipsis" title="${escapeAttr(getAssetGroupName(asset.groupId))}">${escapeHtml(getAssetGroupName(asset.groupId))}</span></td>
              <td><button class="op-button" data-more="${asset.id}" type="button"><span data-icon="more"></span></button></td>
            </tr>`;
        }).join("")}</tbody>
      </table>
    </div>`;
}

function renderTableThumb(asset) {
  if (asset.mime?.startsWith("image/") || /\.(jpg|jpeg|png|webp|gif)$/i.test(asset.src)) {
    return `<img src="${asset.src}" alt="" />`;
  }
  return `<span class="mini-file">${escapeHtml(asset.format || "FILE")}</span>`;
}

function formatAssetValidUntil(asset) {
  if (asset.validUntilDate) return formatDateTimeDisplay(asset.validUntilDate);
  return asset.validUntil || "永久有效";
}

function getValidityStatus(asset) {
  const now = new Date();
  const expireDate = new Date((asset.validUntilDate || asset.validUntil || "").replace(/-/g, "/"));
  if (isNaN(expireDate.getTime())) return "生效中";
  if (now > expireDate) return "已过期";
  const diffDays = Math.ceil((expireDate - now) / (1000 * 60 * 60 * 24));
  if (diffDays <= 7) return "即将过期";
  return "生效中";
}

function getValidityStatusClass(status) {
  switch (status) {
    case "已过期": return "off";
    case "即将过期": return "warn";
    case "生效中": return "ok";
    default: return "ok";
  }
}

function renderList(items) {
  return `
    <table class="list-table">
      <thead><tr><th style="width:44px"><input data-select-all type="checkbox" /></th><th>名称</th><th>描述</th><th>业务标签</th><th>AI标签</th><th>版本</th><th>素材组</th><th>操作</th></tr></thead>
      <tbody>${items.map((asset) => `
        <tr data-id="${asset.id}">
          <td><input data-select-asset="${asset.id}" type="checkbox" ${state.selectedIds.has(asset.id) ? "checked" : ""} /></td>
          <td><div class="table-name" data-preview="${asset.id}">${asset.mime?.startsWith("image/") || /\.(jpg|jpeg|png|webp|gif)$/i.test(asset.src) ? `<img src="${asset.src}" alt="" />` : `<span class="mini-file">${asset.format}</span>`}${escapeHtml(asset.name)}<b>.${asset.format}</b></div></td>
          <td>${escapeHtml(asset.desc || "-")}</td><td>${escapeHtml((asset.customTags || []).join("、") || "-")}</td><td>${escapeHtml((asset.aiTags || []).join("、") || "-")}</td><td>${asset.version}</td><td>${escapeHtml(getAssetGroupName(asset.groupId))}</td>
          <td><button class="op-button" data-more="${asset.id}" type="button"><span data-icon="more"></span></button></td>
        </tr>`).join("")}</tbody>
    </table>`;
}

function bindAssetEvents() {
  els.contentPanel.querySelectorAll("[data-select-asset]").forEach((input) => {
    input.addEventListener("click", (event) => event.stopPropagation());
    input.addEventListener("change", (event) => {
      if (event.target.checked) state.selectedIds.add(event.target.dataset.selectAsset);
      else state.selectedIds.delete(event.target.dataset.selectAsset);
      render();
    });
  });
  els.contentPanel.querySelectorAll("[data-select-all]").forEach((input) => {
    input.addEventListener("change", (event) => {
      const ids = getFilteredAssets().map((asset) => asset.id);
      ids.forEach((id) => event.target.checked ? state.selectedIds.add(id) : state.selectedIds.delete(id));
      render();
    });
  });
  els.contentPanel.querySelectorAll(".inline-date, .inline-time").forEach((input) => {
    input.addEventListener("click", (event) => event.stopPropagation());
    input.addEventListener("change", (event) => {
      const startId = event.target.dataset.validStartDate || event.target.dataset.validStartTime;
      const untilId = event.target.dataset.validUntilDate || event.target.dataset.validUntilTime;
      const asset = findAsset(startId || untilId);
      if (!asset) return;
      const row = event.target.closest("tr");
      if (startId) {
        const date = row?.querySelector(`[data-valid-start-date="${startId}"]`)?.value || "";
        const time = row?.querySelector(`[data-valid-start-time="${startId}"]`)?.value || "00:00";
        asset.validStart = joinDateTime(date, time || "00:00");
      }
      if (untilId) {
        const date = row?.querySelector(`[data-valid-until-date="${untilId}"]`)?.value || "";
        const time = row?.querySelector(`[data-valid-until-time="${untilId}"]`)?.value || "23:59";
        const validUntil = date ? joinDateTime(date, time) : calculateExpireTime("永久有效");
        asset.validUntil = validUntil;
        asset.validUntilDate = validUntil;
      }
      asset.updatedAt = nowText();
      asset.logs.unshift(`${currentUser.name} 更新了素材有效期`);
      saveDb();
      showToast("日期已保存");
      render();
    });
  });
  els.contentPanel.querySelector("[data-bulk-delete]")?.addEventListener("click", deleteSelectedAssets);
  els.contentPanel.querySelector("[data-bulk-download]")?.addEventListener("click", downloadSelectedAssets);
  els.contentPanel.querySelector("[data-bulk-ai]")?.addEventListener("click", rerunSelectedRecognition);
  els.contentPanel.querySelector("[data-clear-selected]")?.addEventListener("click", () => { state.selectedIds.clear(); render(); });
  els.contentPanel.querySelector("[data-bulk-assign]")?.addEventListener("click", () => openAssignGroupModal([...state.selectedIds][0], true));
  els.contentPanel.querySelectorAll(".asset-card, .list-table tbody tr").forEach((node) => {
    node.addEventListener("dblclick", () => openViewer(node.dataset.id));
  });
  els.contentPanel.querySelectorAll(".thumb").forEach((node) => {
    node.addEventListener("click", (event) => {
      if (event.target.closest("button") || event.target.closest("input")) return;
      openViewer(node.closest(".asset-card").dataset.id);
    });
  });
  els.contentPanel.querySelectorAll("[data-more]").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      showAssetMenu(button, button.dataset.more);
    });
  });
  els.contentPanel.querySelectorAll("[data-add-group]").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      openAssignGroupModal(button.dataset.addGroup);
    });
  });
  els.contentPanel.querySelectorAll("[data-similar]").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      state.similar = true;
      state.selectedAssetId = button.dataset.similar;
      render();
    });
  });
  els.contentPanel.querySelectorAll("[data-preview]").forEach((node) => {
    node.addEventListener("mouseenter", () => showPreview(node, node.dataset.preview));
    node.addEventListener("mouseleave", () => els.previewPop.classList.add("hidden"));
  });
}

function renderManagePageV2() {
  if (["users", "roles", "organizations", "permissions"].includes(state.page)) {
    renderSystemManagePage();
    return;
  }

  if (state.page === "activity") {
    const rows = collectActivityRows();
    els.contentPanel.innerHTML = renderManageShell("用户动态", `共 ${rows.length} 条动态`, `
      <div class="asset-toolbar inline-toolbar">
        <label>用户<input placeholder="输入用户名搜索" /></label>
        <label>动作<input placeholder="上传 / 下载 / 分享 / 编辑" /></label>
      </div>
      <div class="table-scroll"><table class="records-table manage-table">
        <colgroup><col style="width:150px"><col style="width:90px"><col style="width:260px"><col style="width:260px"><col style="width:180px"><col style="width:96px"></colgroup>
        <thead><tr><th>时间</th><th>用户</th><th>动态内容</th><th>关联素材</th><th>素材组</th><th>操作</th></tr></thead>
        <tbody>${rows.map((row) => `<tr><td>${row.time}</td><td>${escapeHtml(currentUser.name)}</td><td><span class="cell-ellipsis" title="${escapeAttr(row.text)}">${escapeHtml(row.text)}</span></td><td><span class="cell-ellipsis mono" title="${escapeAttr(row.asset.name)}">${escapeHtml(row.asset.name)}</span></td><td><span class="cell-ellipsis" title="${escapeAttr(getAssetGroupName(row.asset.groupId))}">${escapeHtml(getAssetGroupName(row.asset.groupId))}</span></td><td><button class="link-button" data-open-activity="${row.asset.id}" type="button">查看</button></td></tr>`).join("")}</tbody>
      </table></div>
    `);
    els.contentPanel.querySelectorAll("[data-open-activity]").forEach((button) => button.addEventListener("click", () => openViewer(button.dataset.openActivity)));
    return;
  }

  if (state.page === "loginLogs") {
    renderLoginLogPage();
    return;
  }

  if (state.page === "share") {
    els.contentPanel.innerHTML = renderManageShell("分享记录", `共 ${db.shares.length} 条分享记录`, `
      <div class="asset-toolbar inline-toolbar">
        <label>素材组<input id="shareGroupQuery" placeholder="输入素材组名称搜索" /></label>
        <label>有效期<select><option>全部</option><option>永久有效</option><option>生效中</option><option>已过期</option></select></label>
      </div>
      <div class="table-scroll"><table class="records-table manage-table">
        <colgroup><col style="width:180px"><col style="width:90px"><col style="width:200px"><col style="width:78px"><col style="width:78px"><col style="width:78px"><col style="width:150px"><col style="width:120px"><col style="width:90px"><col style="width:180px"></colgroup>
        <thead><tr><th>素材组</th><th>分享人</th><th>链接权限</th><th>访问</th><th>浏览</th><th>下载</th><th>分享时间</th><th>过期时间</th><th>状态</th><th>操作</th></tr></thead>
        <tbody>${db.shares.map((item, index) => {
          const expired = isShareExpired(item.expiresAt);
          return `<tr><td><span class="cell-ellipsis" title="${escapeAttr(item.group)}">${escapeHtml(item.group)}</span></td><td>${escapeHtml(item.user)}</td><td><span class="cell-ellipsis" title="${escapeAttr(item.access)}">${escapeHtml(item.access)}</span></td><td>${item.visits}人</td><td>${item.views}次</td><td>${item.downloads}个</td><td>${item.sharedAt}</td><td>${item.expiresAt}</td><td><span class="status-dot ${expired ? "off" : "ok"}"></span>${expired ? "已过期" : "生效中"}</td><td><button class="link-button" data-copy-share="${index}" type="button">复制链接</button><button class="link-button" data-update-expire="${index}" type="button">更新时间</button></td></tr>`;
        }).join("")}</tbody>
      </table></div>
    `);
    els.contentPanel.querySelectorAll("[data-copy-share]").forEach((button) => button.addEventListener("click", () => {
      const share = db.shares[Number(button.dataset.copyShare)];
      copyText(share?.link || getShareLink(share?.targetType || "group", share?.targetId || "all", share?.code || "legacy"));
    }));
    els.contentPanel.querySelectorAll("[data-update-expire]").forEach((button) => button.addEventListener("click", () => {
      openUpdateShareExpireModal(Number(button.dataset.updateExpire));
    }));
    return;
  }

  if (state.page === "recycle") {
    const deletedAssets = sortRecycleItems(db.assets.filter((asset) => asset.status === "deleted"));
    els.contentPanel.innerHTML = renderManageShell("回收站", `共 ${deletedAssets.length} 项`, `
      <div class="manage-list-wrap">
        ${deletedAssets.length ? renderList(deletedAssets) : renderEmpty("暂无素材")}
      </div>
    `);
    bindAssetEvents();
    return;
  }

  if (state.page === "collect") {
  els.contentPanel.innerHTML = renderManageShell("收集素材管理", `共 ${db.collectTasks.length} 条收集任务`, `
      <div class="asset-toolbar inline-toolbar"><label>主题<input placeholder="输入收集主题" /></label><label>状态<input placeholder="生效中 / 已失效" /></label></div>
      <div class="table-scroll"><table class="records-table manage-table">
        <colgroup><col style="width:180px"><col style="width:180px"><col style="width:110px"><col style="width:90px"><col style="width:150px"><col style="width:150px"><col style="width:90px"><col style="width:100px"><col style="width:110px"></colgroup>
        <thead><tr><th>主题</th><th>存放素材组</th><th>状态</th><th>访问密码</th><th>创建时间</th><th>失效时间</th><th>创建人</th><th>备注</th><th>操作</th></tr></thead>
        <tbody>${db.collectTasks.map((task, index) => `<tr><td><span class="cell-ellipsis" title="${escapeAttr(task.theme)}">${escapeHtml(task.theme)}</span></td><td><span class="cell-ellipsis" title="${escapeAttr(task.group)}">${escapeHtml(task.group)}</span></td><td><span class="status-dot ${task.status === "生效中" ? "ok" : "off"}"></span>${task.status}</td><td>${task.code}</td><td>${task.createdAt}</td><td>${task.expiresAt}</td><td>${escapeHtml(task.creator)}</td><td>-</td><td><button class="link-button" data-open-collect="${index}" type="button">${isAdmin() || task.creator === currentUser.name ? "管理邀请" : "查看"}</button></td></tr>`).join("")}</tbody>
      </table></div>
    `);
    els.contentPanel.querySelectorAll("[data-open-collect]").forEach((button) => button.addEventListener("click", () => openCollectTaskConfigModal(Number(button.dataset.openCollect))));
    return;
  }

  const now = new Date();
  const assets = db.assets.filter((asset) => {
    if (asset.status === "deleted") return false;
    if (state.manageValidity === "全部") return true;
    const expireDate = new Date((asset.validUntilDate || asset.validUntil || "").replace(/-/g, "/"));
    if (isNaN(expireDate.getTime())) return false;
    const diffDays = Math.ceil((expireDate - now) / (1000 * 60 * 60 * 24));
    switch (state.manageValidity) {
      case "30天内": return diffDays > 0 && diffDays <= 30;
      case "90天内": return diffDays > 0 && diffDays <= 90;
      case "已过期": return now > expireDate;
      case "即将过期": return diffDays > 0 && diffDays <= 7;
      default: return true;
    }
  }).slice(0, 12);
  els.contentPanel.innerHTML = renderManageShell("有效期管理", `共 ${assets.length} 条有效期记录`, `
    <div class="asset-toolbar inline-toolbar">
      <label>素材名称<input placeholder="输入素材名称搜索" /></label>
      <label>有效期<select id="validityFilter"><option>全部</option><option>生效中</option><option>即将过期</option><option>30天内</option><option>90天内</option><option>已过期</option></select></label>
    </div>
    <div class="table-scroll"><table class="records-table manage-table">
      <colgroup><col style="width:420px"><col style="width:240px"><col style="width:140px"><col style="width:120px"><col style="width:150px"><col style="width:100px"></colgroup>
      <thead><tr><th>素材名称</th><th>素材组</th><th>失效日期</th><th>状态</th><th>提醒</th><th>操作</th></tr></thead>
      <tbody>${assets.map((asset) => {
        const status = getValidityStatus(asset);
        const statusClass = getValidityStatusClass(status);
        return `<tr><td><span class="cell-ellipsis mono" title="${escapeAttr(asset.name)}">${escapeHtml(asset.name)}</span></td><td><span class="cell-ellipsis" title="${escapeAttr(getAssetGroupName(asset.groupId))}">${escapeHtml(getAssetGroupName(asset.groupId))}</span></td><td>${formatAssetValidUntil(asset)}</td><td><span class="status-dot ${statusClass}"></span>${status}</td><td>提前 7 天提醒</td><td><button class="link-button" data-edit-validity="${asset.id}" type="button">${canManageAsset(asset) ? "设置" : "申请"}</button></td></tr>`;
      }).join("")}</tbody>
    </table></div>
  `);
  const validityFilter = els.contentPanel.querySelector("#validityFilter");
  validityFilter.value = state.manageValidity;
  validityFilter.addEventListener("change", (event) => {
    state.manageValidity = event.target.value;
    render();
  });
  els.contentPanel.querySelectorAll("[data-edit-validity]").forEach((button) => button.addEventListener("click", () => {
    const asset = findAsset(button.dataset.editValidity);
    if (canManageAsset(asset)) openValidityModal(asset.id);
    else openPermissionRequestModal(asset.id);
  }));
}

function renderManageShell(title, subtitle, body) {
  return `
    <div class="manage-layout">
      <section class="manage-main">
        <div class="manage-head"><h1>${title} <small>${subtitle}</small></h1></div>
        ${body}
      </section>
    </div>`;
}

function renderLoginLogPage() {
  const filters = state.loginLogFilters || { username: "", name: "", startDate: "", endDate: "" };
  const rows = getFilteredLoginLogs(filters);
  els.contentPanel.innerHTML = renderManageShell("用户登录日志", `共 ${rows.length} 条登录记录`, `
    <div class="asset-toolbar inline-toolbar login-log-toolbar">
      <label>用户名<input id="loginLogUsername" value="${escapeAttr(filters.username)}" placeholder="输入登录用户名" /></label>
      <label>姓名<input id="loginLogName" value="${escapeAttr(filters.name)}" placeholder="输入姓名" /></label>
      <label>开始时间<input id="loginLogStartDate" class="inline-date" type="date" value="${escapeAttr(filters.startDate)}" readonly inputmode="none" /></label>
      <label>结束时间<input id="loginLogEndDate" class="inline-date" type="date" value="${escapeAttr(filters.endDate)}" readonly inputmode="none" /></label>
      <button class="primary" id="loginLogSearch" type="button">查询</button>
      <button id="loginLogReset" type="button">清除</button>
    </div>
    <div class="table-scroll"><table class="records-table manage-table">
      <thead><tr><th>用户名</th><th>姓名</th><th>登录时间</th><th>IP地址</th><th>登录入口</th></tr></thead>
      <tbody>${rows.map((item) => `
        <tr>
          <td>${escapeHtml(item.username)}</td>
          <td>${escapeHtml(item.name)}</td>
          <td>${escapeHtml(item.loginAt)}</td>
          <td>${escapeHtml(item.ip)}</td>
          <td>${escapeHtml(item.entry)}</td>
        </tr>`).join("") || `<tr><td colspan="5" class="empty-cell">暂无登录记录</td></tr>`}</tbody>
    </table></div>
  `);
  initProjectDatePickers(els.contentPanel);
  bindLoginLogEvents();
}

function getFilteredLoginLogs(filters) {
  const username = String(filters.username || "").trim().toLowerCase();
  const name = String(filters.name || "").trim().toLowerCase();
  const start = filters.startDate ? dateTimeTextToTimestamp(`${filters.startDate} 00:00`) : 0;
  const end = filters.endDate ? dateTimeTextToTimestamp(`${filters.endDate} 23:59`) : Number.MAX_SAFE_INTEGER;
  return [...(db.loginLogs || [])].filter((item) => {
    const time = dateTimeTextToTimestamp(item.loginAt);
    if (username && !String(item.username || "").toLowerCase().includes(username)) return false;
    if (name && !String(item.name || "").toLowerCase().includes(name)) return false;
    return time >= start && time <= end;
  });
}

function bindLoginLogEvents() {
  const readFilters = () => ({
    username: document.querySelector("#loginLogUsername")?.value.trim() || "",
    name: document.querySelector("#loginLogName")?.value.trim() || "",
    startDate: document.querySelector("#loginLogStartDate")?.value || "",
    endDate: document.querySelector("#loginLogEndDate")?.value || "",
  });
  document.querySelector("#loginLogSearch")?.addEventListener("click", () => {
    state.loginLogFilters = readFilters();
    renderLoginLogPage();
  });
  document.querySelector("#loginLogReset")?.addEventListener("click", () => {
    state.loginLogFilters = { username: "", name: "", startDate: "", endDate: "" };
    renderLoginLogPage();
  });
  ["#loginLogUsername", "#loginLogName"].forEach((selector) => {
    document.querySelector(selector)?.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        state.loginLogFilters = readFilters();
        renderLoginLogPage();
      }
    });
  });
}

function renderSystemManagePage() {
  const renderers = {
    users: renderUserManagePage,
    roles: renderRoleManagePage,
    organizations: renderOrganizationManagePage,
    permissions: renderPermissionManagePage,
  };
  (renderers[state.page] || renderUserManagePage)();
}

function renderSystemToolbar(title, actionLabel, action) {
  return `
    <div class="system-toolbar">
      <div>
        <h2>${title}</h2>
        <p>基于用户、组织、角色和菜单授权控制系统访问范围。</p>
      </div>
      ${canEditMenu(state.page) ? `<button class="primary" data-system-action="${action}" type="button">${actionLabel}</button>` : ""}
    </div>`;
}

function getOrgName(id) {
  return (db.organizations || []).find((org) => org.id === id)?.name || "-";
}

function bindTreeToggleEvents(scope) {
  scope?.querySelectorAll("[data-toggle-tree]").forEach((toggle) => toggle.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    const collapsed = toggle.textContent.trim() !== "+";
    toggle.textContent = collapsed ? "+" : "−";
    applyTreeToggle(toggle, collapsed);
  }));
}

function applyTreeToggle(toggle, collapsed) {
  const parent = toggle.closest(".user-org-node-wrap, .permission-tree-group, .permission-edit-group");
  if (!parent) return;
  const directChildren = [...parent.children].slice(1);
  if (toggle.closest(".permission-edit-node")) {
    let next = toggle.closest(".permission-edit-node").nextElementSibling;
    while (next) {
      next.classList.toggle("hidden", collapsed);
      next = next.nextElementSibling;
    }
    return;
  }
  directChildren.forEach((child) => child.classList.toggle("hidden", collapsed));
}

function getRoleName(id) {
  return (db.roles || []).find((role) => role.id === id)?.name || "-";
}

function getRoleNames(ids) {
  const roleIds = Array.isArray(ids) ? ids : [ids].filter(Boolean);
  return roleIds.map((id) => getRoleName(id)).filter((name) => name && name !== "-").join("、") || "-";
}

function renderUserManagePage() {
  const organizations = db.organizations || [];
  if (!state.userManageOrgId && organizations.length) state.userManageOrgId = organizations[0].id;
  const filteredUsers = getUserManageFilteredUsers();
  if (state.selectedManageUserId && !filteredUsers.some((user) => user.id === state.selectedManageUserId)) {
    state.selectedManageUserId = "";
  }
  const selectedUser = (db.users || []).find((user) => user.id === state.selectedManageUserId);
  const rows = filteredUsers.map((user, index) => `
    <tr class="${state.selectedManageUserId === user.id ? "selected" : ""}" data-user-row="${escapeAttr(user.id)}">
      <td><input type="radio" name="manageUserSelect" ${state.selectedManageUserId === user.id ? "checked" : ""} /></td>
      <td>${index + 1}</td>
      <td><strong>${escapeHtml(user.username)}</strong></td>
      <td>${escapeHtml(user.name)}</td>
      <td>${escapeHtml(getOrgName(user.organizationId))}</td>
      <td>${escapeHtml(getRoleNames(getUserRoleIds(user)))}</td>
      <td><span class="status-dot ${user.status === "启用" ? "ok" : "off"}"></span>${escapeHtml(user.status)}</td>
      <td>${escapeHtml(user.lastLogin || "-")}</td>
    </tr>`).join("");
  els.contentPanel.innerHTML = renderManageShell("用户管理", `共 ${filteredUsers.length} 个用户`, `
    <div class="user-manage-layout">
      <aside class="user-org-panel">
        <div class="user-org-search">
          <input id="userOrgSearch" placeholder="搜索组织" />
        </div>
        <div class="user-org-tree">${renderUserManageOrgTree()}</div>
      </aside>
      <section class="user-list-panel">
        <div class="user-query-bar">
          <label>用户名<input id="userQueryUsername" value="${escapeAttr(state.userManageFilters.username)}" placeholder="请输入用户名" /></label>
          <label>员工姓名<input id="userQueryName" value="${escapeAttr(state.userManageFilters.name)}" placeholder="请输入姓名" /></label>
          <label class="user-check"><input id="userIncludeChildren" type="checkbox" ${state.userManageFilters.includeChildren ? "checked" : ""} /> 包含下级组织</label>
          <button id="resetUserQuery" type="button">重置</button>
          <button class="primary" id="applyUserQuery" type="button">查询</button>
        </div>
        <div class="user-action-bar">
          ${canEditMenu("users") ? `<button class="primary" data-system-action="add-user" type="button">添加</button>` : ""}
          ${canEditMenu("users") ? `<button id="editSelectedUser" type="button" ${selectedUser ? "" : "disabled"}>修改</button>` : ""}
          ${canEditMenu("permissions") ? `<button id="authorizeSelectedUser" type="button" ${selectedUser ? "" : "disabled"}>菜单授权</button>` : ""}
          <button id="viewSelectedUserPermission" type="button" ${selectedUser ? "" : "disabled"}>菜单权限查看</button>
        </div>
        <div class="table-scroll"><table class="records-table manage-table user-manage-table">
          <thead><tr><th></th><th>序号</th><th>用户名</th><th>员工姓名</th><th>所属组织</th><th>所属角色</th><th>状态</th><th>最近登录</th></tr></thead>
          <tbody>${rows || `<tr><td colspan="8" class="empty-cell">暂无用户</td></tr>`}</tbody>
        </table></div>
      </section>
    </div>`);
  bindSystemManageEvents();
}

function getOrgChildren(parentId) {
  return (db.organizations || []).filter((org) => (org.parentId || "") === (parentId || ""));
}

function getOrgDescendantIds(orgId) {
  const result = [];
  const walk = (id) => {
    getOrgChildren(id).forEach((child) => {
      result.push(child.id);
      walk(child.id);
    });
  };
  walk(orgId);
  return result;
}

function renderUserManageOrgTree() {
  const orgs = db.organizations || [];
  const roots = orgs.filter((org) => !org.parentId || !orgs.some((item) => item.id === org.parentId));
  const renderNode = (org, depth = 0) => {
    const childOrgs = getOrgChildren(org.id);
    const children = childOrgs.map((child) => renderNode(child, depth + 1)).join("");
    return `<div class="user-org-node-wrap">
      <button class="user-org-node ${state.userManageOrgId === org.id ? "active" : ""}" data-user-org="${escapeAttr(org.id)}" type="button" style="--depth:${depth}">
        ${childOrgs.length ? `<span class="tree-toggle" data-toggle-tree>−</span>` : `<span class="tree-toggle placeholder"></span>`}
        <span class="user-org-name">${escapeHtml(org.name)}</span>
      </button>
      ${children}
    </div>`;
  };
  return roots.map((org) => renderNode(org)).join("") || `<div class="permission-tree-empty">暂无组织</div>`;
}

function getUserManageFilteredUsers() {
  const filters = state.userManageFilters;
  const selectedOrgId = state.userManageOrgId;
  const orgIds = selectedOrgId
    ? new Set([selectedOrgId, ...(filters.includeChildren ? getOrgDescendantIds(selectedOrgId) : [])])
    : null;
  return (db.users || []).filter((user) => {
    if (orgIds && !orgIds.has(user.organizationId)) return false;
    if (filters.username && !String(user.username || "").toLowerCase().includes(filters.username.toLowerCase())) return false;
    if (filters.name && !String(user.name || "").toLowerCase().includes(filters.name.toLowerCase())) return false;
    return true;
  });
}

function renderRoleManagePage() {
  const rows = (db.roles || []).map((role) => {
    const members = (db.users || []).filter((user) => getUserRoleIds(user).includes(role.id)).length;
    const visibleCount = SYSTEM_MENUS.filter((menu) => role.permissions?.[menu.id]?.visible).length;
    const editCount = SYSTEM_MENUS.filter((menu) => role.permissions?.[menu.id]?.editable).length;
    return `<tr>
      <td><strong>${escapeHtml(role.name)}</strong><small>${escapeHtml(role.description || "-")}</small></td>
      <td>${members}</td>
      <td>可见 ${visibleCount} 项 / 可编辑 ${editCount} 项</td>
      <td><span class="status-dot ${role.status === "启用" ? "ok" : "off"}"></span>${escapeHtml(role.status)}</td>
      <td class="row-actions">
        ${canEditMenu("roles") ? `<button class="link-button" data-edit-role="${escapeAttr(role.id)}" type="button">编辑</button>` : ""}
        ${canEditMenu("permissions") ? `<button class="link-button" data-role-permission="${escapeAttr(role.id)}" type="button">角色权限</button>` : ""}
        ${!canEditMenu("roles") && !canEditMenu("permissions") ? "-" : ""}
      </td>
    </tr>`;
  }).join("");
  els.contentPanel.innerHTML = renderManageShell("角色管理", `共 ${(db.roles || []).length} 个角色`, `
    ${renderSystemToolbar("角色体系", "新增角色", "add-role")}
    <div class="table-scroll"><table class="records-table manage-table">
      <thead><tr><th>角色</th><th>成员数</th><th>菜单授权</th><th>状态</th><th>操作</th></tr></thead>
      <tbody>${rows || `<tr><td colspan="5" class="empty-cell">暂无角色</td></tr>`}</tbody>
    </table></div>`);
  bindSystemManageEvents();
}

function renderOrganizationManagePage() {
  const rows = (db.organizations || []).map((org) => {
    const members = (db.users || []).filter((user) => user.organizationId === org.id).length;
    return `<tr>
      <td><strong>${escapeHtml(org.name)}</strong></td>
      <td>${escapeHtml(getOrgName(org.parentId))}</td>
      <td>${members}</td>
      <td>${escapeHtml(org.manager || "-")}</td>
      <td><span class="status-dot ${org.status === "启用" ? "ok" : "off"}"></span>${escapeHtml(org.status)}</td>
      <td>${canEditMenu("organizations") ? `<button class="link-button" data-edit-org="${escapeAttr(org.id)}" type="button">编辑</button>` : "-"}</td>
    </tr>`;
  }).join("");
  els.contentPanel.innerHTML = renderManageShell("组织管理", `共 ${(db.organizations || []).length} 个组织`, `
    ${renderSystemToolbar("组织体系", "新增组织", "add-org")}
    <div class="table-scroll"><table class="records-table manage-table">
      <thead><tr><th>组织</th><th>上级组织</th><th>成员数</th><th>负责人</th><th>状态</th><th>操作</th></tr></thead>
      <tbody>${rows || `<tr><td colspan="6" class="empty-cell">暂无组织</td></tr>`}</tbody>
    </table></div>`);
  bindSystemManageEvents();
}

function renderPermissionManagePage() {
  const view = state.permissionView || "menu";
  const selectedMenu = SYSTEM_MENUS.find((menu) => menu.id === state.permissionMenuId) || SYSTEM_MENUS[0];
  const subjectType = state.permissionSubjectType || "organization";
  const subject = getPermissionSubject(subjectType, state.permissionSubjectId);
  const body = view === "subject"
    ? renderPermissionSubjectView(subjectType, subject)
    : renderPermissionMenuView(selectedMenu);
  els.contentPanel.innerHTML = renderManageShell("权限管理", "按菜单或按组织个人配置可读、可写权限", `
    <div class="permission-view-switch">
      <button class="${view === "menu" ? "active" : ""}" data-permission-view="menu" type="button">按菜单授权</button>
      <button class="${view === "subject" ? "active" : ""}" data-permission-view="subject" type="button">按组织个人授权</button>
    </div>
    ${body}`);
  bindSystemManageEvents();
}

function getSubjectPermissions(type, id) {
  const store = type === "user" ? db.userPermissions : db.orgPermissions;
  if (!store[id]) store[id] = createMenuPermissions(false, false);
  store[id] = normalizeMenuPermissions(store[id]);
  return store[id];
}

function renderPermissionMenuView(menu) {
  const hasSelection = !!state.permissionMenuId && !!menu;
  return `
    <div class="permission-workspace">
      <aside class="permission-tree-panel">
        <div class="permission-tree-title">功能菜单</div>
        <div class="permission-tree">${renderMenuPermissionTree()}</div>
      </aside>
      <section class="permission-detail-panel">
        ${hasSelection ? renderMenuPermissionDetail(menu) : renderPermissionPlaceholder("请选择左侧功能菜单")}
      </section>
    </div>
  `;
}

function renderPermissionSubjectView(subjectType, subject) {
  return `
    <div class="permission-workspace">
      <aside class="permission-tree-panel">
        <div class="permission-tree-title">组织 / 个人</div>
        <div class="permission-tree">${renderSubjectPermissionTree()}</div>
      </aside>
      <section class="permission-detail-panel">
        ${subject ? renderSubjectPermissionDetail(subjectType, subject) : renderPermissionPlaceholder("请选择左侧组织或个人")}
      </section>
    </div>
  `;
}

function renderMenuPermissionTree() {
  const groups = [...new Set(SYSTEM_MENUS.map((menu) => menu.group))];
  return groups.map((group) => {
    const nodes = SYSTEM_MENUS.filter((menu) => menu.group === group).map((menu) => `
      <button class="permission-tree-node ${state.permissionMenuId === menu.id ? "active" : ""}" data-select-permission-menu="${escapeAttr(menu.id)}" type="button">
        <span class="tree-toggle placeholder"></span><span>${escapeHtml(menu.label)}</span>
      </button>
    `).join("");
    return `<div class="permission-tree-group">
      <button class="permission-tree-group-title as-button" data-toggle-tree type="button"><span class="tree-toggle">−</span>${escapeHtml(group)}</button>
      ${nodes}
    </div>`;
  }).join("");
}

function renderSubjectPermissionTree() {
  const orgs = db.organizations || [];
  const users = db.users || [];
  return orgs.map((org) => {
    const orgUsers = users.filter((user) => user.organizationId === org.id);
    const userNodes = orgUsers.map((user) => `
      <button class="permission-tree-node child ${state.permissionSubjectType === "user" && state.permissionSubjectId === user.id ? "active" : ""}" data-select-permission-subject="user" data-subject-id="${escapeAttr(user.id)}" type="button">
        <span class="tree-toggle placeholder"></span><span>${escapeHtml(user.username)} / ${escapeHtml(user.name)}</span>
      </button>
    `).join("");
    return `<div class="permission-tree-group">
      <button class="permission-tree-node org ${state.permissionSubjectType === "organization" && state.permissionSubjectId === org.id ? "active" : ""}" data-select-permission-subject="organization" data-subject-id="${escapeAttr(org.id)}" type="button">
        ${orgUsers.length ? `<span class="tree-toggle" data-toggle-tree>−</span>` : `<span class="tree-toggle placeholder"></span>`}<span>${escapeHtml(org.name)}</span>
      </button>
      ${userNodes || (!orgUsers.length ? `<div class="permission-tree-empty">暂无成员</div>` : "")}
    </div>`;
  }).join("") || `<div class="permission-tree-empty">暂无组织</div>`;
}

function renderPermissionPlaceholder(text) {
  return `<div class="permission-placeholder">${escapeHtml(text)}</div>`;
}

function renderMenuPermissionDetail(menu) {
  const grants = getMenuGrantSummary(menu.id);
  return `
    <div class="permission-detail-header">
      <div><h2>${escapeHtml(menu.label)}</h2><p>${escapeHtml(menu.group)} / 菜单授权</p></div>
      ${canEditMenu("permissions") ? `<button class="primary" data-edit-menu-permission="${escapeAttr(menu.id)}" type="button">编辑权限</button>` : ""}
    </div>
    <div class="permission-summary-grid">
      <div><span>可读对象</span><strong>${grants.visible.length}</strong></div>
      <div><span>可写对象</span><strong>${grants.editable.length}</strong></div>
    </div>
    <div class="table-scroll"><table class="records-table manage-table permission-matrix">
      <thead><tr><th>授权对象</th><th>类型</th><th>可读</th><th>可写</th></tr></thead>
      <tbody>${renderMenuGrantRows(menu.id) || `<tr><td colspan="4" class="empty-cell">暂无组织或个人获得该菜单权限</td></tr>`}</tbody>
    </table></div>
  `;
}

function renderMenuGrantRows(menuId) {
  const orgRows = (db.organizations || []).map((org) => renderPermissionGrantRow("organization", org, menuId)).join("");
  const userRows = (db.users || []).map((user) => renderPermissionGrantRow("user", user, menuId)).join("");
  return orgRows + userRows;
}

function renderPermissionGrantRow(type, target, menuId) {
  const permission = getSubjectPermissions(type, target.id)[menuId] || {};
  if (!permission.visible && !permission.editable) return "";
  const typeLabel = type === "user" ? "个人" : "组织";
  const name = type === "user" ? `${target.username} / ${target.name}` : target.name;
  return `<tr>
    <td><strong>${escapeHtml(name)}</strong></td>
    <td>${typeLabel}</td>
    <td>${permission.visible || permission.editable ? "是" : "否"}</td>
    <td>${permission.editable ? "是" : "否"}</td>
  </tr>`;
}

function renderSubjectPermissionDetail(subjectType, subject) {
  const permissions = getSubjectPermissions(subjectType, subject.id);
  const visibleCount = SYSTEM_MENUS.filter((menu) => permissions[menu.id]?.visible || permissions[menu.id]?.editable).length;
  const editableCount = SYSTEM_MENUS.filter((menu) => permissions[menu.id]?.editable).length;
  const subtitle = subjectType === "user" ? `${subject.username} / 个人授权` : "组织授权";
  return `
    <div class="permission-detail-header">
      <div><h2>${escapeHtml(subject.name)}</h2><p>${escapeHtml(subtitle)}</p></div>
      ${canEditMenu("permissions") ? `<button class="primary" data-edit-subject-permission="${escapeAttr(subjectType)}" data-subject-id="${escapeAttr(subject.id)}" type="button">编辑权限</button>` : ""}
    </div>
    <div class="permission-summary-grid">
      <div><span>可读菜单</span><strong>${visibleCount}</strong></div>
      <div><span>可写菜单</span><strong>${editableCount}</strong></div>
    </div>
    <div class="table-scroll"><table class="records-table manage-table permission-matrix">
      <thead><tr><th>菜单分组</th><th>菜单</th><th>可读</th><th>可写</th></tr></thead>
      <tbody>${renderSubjectGrantRows(subjectType, subject.id) || `<tr><td colspan="4" class="empty-cell">暂无菜单权限</td></tr>`}</tbody>
    </table></div>
  `;
}

function renderSubjectGrantRows(subjectType, subjectId) {
  const permissions = getSubjectPermissions(subjectType, subjectId);
  return SYSTEM_MENUS.map((menu) => {
    const permission = permissions[menu.id] || {};
    if (!permission.visible && !permission.editable) return "";
    return `<tr>
      <td>${escapeHtml(menu.group)}</td>
      <td><strong>${escapeHtml(menu.label)}</strong></td>
      <td>${permission.visible || permission.editable ? "是" : "否"}</td>
      <td>${permission.editable ? "是" : "否"}</td>
    </tr>`;
  }).join("");
}

function getUserMenuPermissionSources(user, menuId) {
  const sources = [];
  let visible = false;
  let editable = false;
  const collect = (permission, label) => {
    if (!permission?.visible && !permission?.editable) return;
    if (permission.visible || permission.editable) visible = true;
    if (permission.editable) editable = true;
    sources.push(label);
  };
  collect(db.userPermissions?.[user.id]?.[menuId], "个人授权");
  collect(db.orgPermissions?.[user.organizationId]?.[menuId], `组织权限（${getOrgName(user.organizationId)}）`);
  getUserRoleIds(user).forEach((roleId) => {
    const role = (db.roles || []).find((item) => item.id === roleId);
    collect(role?.permissions?.[menuId], `角色权限（${role?.name || roleId}）`);
  });
  return { visible, editable, sources: [...new Set(sources)] };
}

function renderUserPermissionViewTree(user) {
  const groups = [...new Set(SYSTEM_MENUS.map((menu) => menu.group))];
  return groups.map((group) => {
    const menuRows = SYSTEM_MENUS.filter((menu) => menu.group === group).map((menu) => {
      const result = getUserMenuPermissionSources(user, menu.id);
      return `<div class="permission-edit-node permission-view-node depth-1">
        <div class="permission-edit-name"><span class="tree-toggle placeholder"></span><strong>${escapeHtml(menu.label)}</strong><small>菜单</small></div>
        <span>${result.visible ? "是" : "否"}</span>
        <span>${result.editable ? "是" : "否"}</span>
        <span class="permission-source-text">${escapeHtml(result.sources.join("、") || "-")}</span>
      </div>`;
    }).join("");
    return `<div class="permission-edit-group">
      <button class="permission-edit-group-title as-button" data-toggle-tree type="button"><span class="tree-toggle">−</span>${escapeHtml(group)}</button>
      ${menuRows}
    </div>`;
  }).join("");
}

function getPermissionSubject(type, id) {
  if (!id) return null;
  return (type === "user" ? (db.users || []) : (db.organizations || [])).find((item) => item.id === id) || null;
}

function getMenuGrantSummary(menuId) {
  const visible = [];
  const editable = [];
  [...(db.organizations || []).map((item) => ({ type: "organization", item })), ...(db.users || []).map((item) => ({ type: "user", item }))].forEach(({ type, item }) => {
    const permission = getSubjectPermissions(type, item.id)[menuId] || {};
    if (permission.visible || permission.editable) visible.push(item.id);
    if (permission.editable) editable.push(item.id);
  });
  return { visible, editable };
}

function bindSystemManageEvents() {
  els.contentPanel.querySelector("[data-system-action='add-user']")?.addEventListener("click", () => openUserManageModal());
  els.contentPanel.querySelector("[data-system-action='add-role']")?.addEventListener("click", () => openRoleManageModal());
  els.contentPanel.querySelector("[data-system-action='add-org']")?.addEventListener("click", () => openOrganizationManageModal());
  els.contentPanel.querySelectorAll("[data-edit-user]").forEach((button) => button.addEventListener("click", () => openUserManageModal(button.dataset.editUser)));
  els.contentPanel.querySelectorAll("[data-user-org]").forEach((button) => button.addEventListener("click", () => {
    state.userManageOrgId = button.dataset.userOrg;
    state.selectedManageUserId = "";
    renderUserManagePage();
  }));
  bindTreeToggleEvents(els.contentPanel);
  els.contentPanel.querySelector("#applyUserQuery")?.addEventListener("click", () => {
    state.userManageFilters.username = els.contentPanel.querySelector("#userQueryUsername")?.value.trim() || "";
    state.userManageFilters.name = els.contentPanel.querySelector("#userQueryName")?.value.trim() || "";
    state.userManageFilters.includeChildren = !!els.contentPanel.querySelector("#userIncludeChildren")?.checked;
    renderUserManagePage();
  });
  els.contentPanel.querySelector("#resetUserQuery")?.addEventListener("click", () => {
    state.userManageFilters = { username: "", name: "", includeChildren: true };
    renderUserManagePage();
  });
  els.contentPanel.querySelector("#userOrgSearch")?.addEventListener("input", (event) => {
    const keyword = event.target.value.trim().toLowerCase();
    els.contentPanel.querySelectorAll(".user-org-node-wrap").forEach((node) => {
      const text = node.textContent.toLowerCase();
      node.classList.toggle("hidden", !!keyword && !text.includes(keyword));
    });
  });
  els.contentPanel.querySelectorAll("[data-user-row]").forEach((row) => row.addEventListener("click", () => {
    state.selectedManageUserId = row.dataset.userRow;
    renderUserManagePage();
  }));
  els.contentPanel.querySelector("#editSelectedUser")?.addEventListener("click", () => {
    if (!state.selectedManageUserId) return showToast("请先选择用户");
    openUserManageModal(state.selectedManageUserId);
  });
  els.contentPanel.querySelector("#authorizeSelectedUser")?.addEventListener("click", () => {
    if (!state.selectedManageUserId) return showToast("请先选择用户");
    openSubjectPermissionModal("user", state.selectedManageUserId);
  });
  els.contentPanel.querySelector("#viewSelectedUserPermission")?.addEventListener("click", () => {
    if (!state.selectedManageUserId) return showToast("请先选择用户");
    openUserPermissionViewModal(state.selectedManageUserId);
  });
  els.contentPanel.querySelectorAll("[data-edit-role]").forEach((button) => button.addEventListener("click", () => openRoleManageModal(button.dataset.editRole)));
  els.contentPanel.querySelectorAll("[data-edit-org]").forEach((button) => button.addEventListener("click", () => openOrganizationManageModal(button.dataset.editOrg)));
  els.contentPanel.querySelectorAll("[data-edit-permission]").forEach((button) => button.addEventListener("click", () => openPermissionManageModal(button.dataset.editPermission)));
  els.contentPanel.querySelectorAll("[data-role-permission]").forEach((button) => button.addEventListener("click", () => openPermissionManageModal(button.dataset.rolePermission)));
  els.contentPanel.querySelectorAll("[data-permission-view]").forEach((button) => button.addEventListener("click", () => {
    state.permissionView = button.dataset.permissionView;
    state.permissionMenuId = "";
    state.permissionSubjectType = "organization";
    state.permissionSubjectId = "";
    renderPermissionManagePage();
  }));
  els.contentPanel.querySelectorAll("[data-select-permission-menu]").forEach((button) => button.addEventListener("click", () => {
    state.permissionMenuId = button.dataset.selectPermissionMenu;
    renderPermissionManagePage();
  }));
  els.contentPanel.querySelectorAll("[data-select-permission-subject]").forEach((button) => button.addEventListener("click", () => {
    state.permissionSubjectType = button.dataset.selectPermissionSubject;
    state.permissionSubjectId = button.dataset.subjectId;
    renderPermissionManagePage();
  }));
  els.contentPanel.querySelectorAll("[data-permission-level='editable']").forEach((checkbox) => checkbox.addEventListener("change", () => {
    if (!checkbox.checked) return;
    const row = checkbox.closest("[data-permission-row]");
    const visible = row?.querySelector("[data-permission-level='visible']");
    if (visible) visible.checked = true;
  }));
  els.contentPanel.querySelectorAll("[data-edit-menu-permission]").forEach((button) => button.addEventListener("click", () => openMenuPermissionModal(button.dataset.editMenuPermission)));
  els.contentPanel.querySelectorAll("[data-edit-subject-permission]").forEach((button) => button.addEventListener("click", () => openSubjectPermissionModal(button.dataset.editSubjectPermission, button.dataset.subjectId)));
}

function renderPermissionEditTreeRow(type, target, menuId, depth = 0, toggleKey = "") {
  const permission = getSubjectPermissions(type, target.id)[menuId] || {};
  const name = type === "user" ? `${target.username} / ${target.name}` : target.name;
  return `<div class="permission-edit-node depth-${depth}" data-permission-row data-target-type="${type}" data-target-id="${escapeAttr(target.id)}" data-menu-id="${escapeAttr(menuId)}">
    <div class="permission-edit-name">${toggleKey ? `<span class="tree-toggle" data-toggle-tree>−</span>` : `<span class="tree-toggle placeholder"></span>`}<strong>${escapeHtml(name)}</strong><small>${type === "user" ? "个人" : "组织"}</small></div>
    <label class="permission-check"><input data-permission-level="visible" type="checkbox" ${permission.visible ? "checked" : ""} /> 可读</label>
    <label class="permission-check"><input data-permission-level="editable" type="checkbox" ${permission.editable ? "checked" : ""} /> 可写</label>
  </div>`;
}

function renderMenuPermissionEditTree(menuId) {
  return (db.organizations || []).map((org) => {
    const orgUsers = (db.users || []).filter((user) => user.organizationId === org.id);
    const key = `menu:${menuId}:org:${org.id}`;
    const userRows = orgUsers
      .map((user) => renderPermissionEditTreeRow("user", user, menuId, 1))
      .join("");
    return `<div class="permission-edit-group">
      ${renderPermissionEditTreeRow("organization", org, menuId, 0, orgUsers.length ? key : "")}
      ${userRows || (!orgUsers.length ? `<div class="permission-edit-empty">暂无成员</div>` : "")}
    </div>`;
  }).join("") || `<div class="permission-edit-empty">暂无授权对象</div>`;
}

function renderSubjectPermissionEditTree(subjectType, subjectId) {
  const permissions = getSubjectPermissions(subjectType, subjectId);
  const groups = [...new Set(SYSTEM_MENUS.map((menu) => menu.group))];
  return groups.map((group) => {
    const key = `subject:${subjectType}:${subjectId}:group:${group}`;
    const menuRows = SYSTEM_MENUS.filter((menu) => menu.group === group).map((menu) => {
      const permission = permissions[menu.id] || {};
      return `<div class="permission-edit-node depth-1" data-permission-row data-target-type="${escapeAttr(subjectType)}" data-target-id="${escapeAttr(subjectId)}" data-menu-id="${escapeAttr(menu.id)}">
        <div class="permission-edit-name"><span class="tree-toggle placeholder"></span><strong>${escapeHtml(menu.label)}</strong><small>菜单</small></div>
        <label class="permission-check"><input data-permission-level="visible" type="checkbox" ${permission.visible ? "checked" : ""} /> 可读</label>
        <label class="permission-check"><input data-permission-level="editable" type="checkbox" ${permission.editable ? "checked" : ""} /> 可写</label>
      </div>`;
    }).join("");
    return `<div class="permission-edit-group">
      <button class="permission-edit-group-title as-button" data-toggle-tree type="button"><span class="tree-toggle">−</span>${escapeHtml(group)}</button>
      ${menuRows}
    </div>`;
  }).join("");
}

function openMenuPermissionModal(menuId) {
  if (!canEditMenu("permissions")) return showToast("当前账号没有权限管理编辑权限");
  const menu = SYSTEM_MENUS.find((item) => item.id === menuId);
  if (!menu) return;
  openFormModal(`编辑权限 - ${menu.label}`, `
    <div class="permission-edit-scroll permission-edit-tree">${renderMenuPermissionEditTree(menu.id)}</div>
    <div class="form-actions"><button type="button" data-cancel>取消</button><button class="primary" type="submit">保存权限</button></div>
  `, (form) => savePermissionRows(form));
  bindPermissionModalChecks();
}

function openSubjectPermissionModal(subjectType, subjectId) {
  if (!canEditMenu("permissions")) return showToast("当前账号没有权限管理编辑权限");
  const subject = getPermissionSubject(subjectType, subjectId);
  if (!subject) return;
  openFormModal(`编辑权限 - ${subject.name}`, `
    <div class="permission-edit-scroll permission-edit-tree">${renderSubjectPermissionEditTree(subjectType, subject.id)}</div>
    <div class="form-actions"><button type="button" data-cancel>取消</button><button class="primary" type="submit">保存权限</button></div>
  `, (form) => savePermissionRows(form));
  bindPermissionModalChecks();
}

function openUserPermissionViewModal(userId) {
  const user = (db.users || []).find((item) => item.id === userId);
  if (!user) return;
  openFormModal(`菜单权限查看 - ${user.name}`, `
    <div class="permission-view-head"><span>菜单</span><span>可读</span><span>可写</span><span>权限来源</span></div>
    <div class="permission-edit-scroll permission-edit-tree permission-view-tree readonly">${renderUserPermissionViewTree(user)}</div>
    <div class="form-actions"><button class="primary" type="submit">关闭</button></div>
  `, () => closeFormModal());
  bindTreeToggleEvents(document.querySelector(".form-card"));
}

function bindPermissionModalChecks() {
  bindTreeToggleEvents(document.querySelector(".form-card"));
  document.querySelectorAll(".form-card [data-permission-level='editable']").forEach((checkbox) => checkbox.addEventListener("change", () => {
    if (!checkbox.checked) return;
    const visible = checkbox.closest("[data-permission-row]")?.querySelector("[data-permission-level='visible']");
    if (visible) visible.checked = true;
  }));
  document.querySelectorAll(".form-card [data-role-permission-level='editable']").forEach((checkbox) => checkbox.addEventListener("change", () => {
    if (!checkbox.checked) return;
    const visible = checkbox.closest("[data-role-permission-row]")?.querySelector("[data-role-permission-level='visible']");
    if (visible) visible.checked = true;
  }));
}

function savePermissionRows(form) {
  form.querySelectorAll("[data-permission-row]").forEach((row) => {
    const type = row.dataset.targetType;
    const targetId = row.dataset.targetId;
    const menuId = row.dataset.menuId;
    const visible = !!row.querySelector("[data-permission-level='visible']")?.checked;
    const editable = !!row.querySelector("[data-permission-level='editable']")?.checked;
    const permissions = getSubjectPermissions(type, targetId);
    permissions[menuId] = { visible: visible || editable, editable };
  });
  saveDb();
  currentUser = getUserSessionInfo(currentUser.id) || currentUser;
  closeFormModal();
  renderShell();
  normalizePageState();
  render();
  showToast("权限已保存");
}

function buildOptions(items, selectedId = "", emptyLabel = "") {
  const empty = emptyLabel ? `<option value="">${emptyLabel}</option>` : "";
  return empty + items.map((item) => `<option value="${escapeAttr(item.id)}" ${item.id === selectedId ? "selected" : ""}>${escapeHtml(item.name)}</option>`).join("");
}

function buildMultiOptions(items, selectedIds = []) {
  const selected = new Set(selectedIds);
  return items.map((item) => `<option value="${escapeAttr(item.id)}" ${selected.has(item.id) ? "selected" : ""}>${escapeHtml(item.name)}</option>`).join("");
}

function openUserManageModal(userId = "") {
  if (!canEditMenu("users")) return showToast("当前账号没有用户管理编辑权限");
  const user = (db.users || []).find((item) => item.id === userId) || {};
  const roleIds = getUserRoleIds(user);
  openFormModal(userId ? "编辑用户" : "新增用户", `
    <label>登录用户名<input name="username" value="${escapeAttr(user.username || "")}" ${userId ? "readonly" : ""} required /></label>
    <label>密码<input name="password" value="${escapeAttr(user.password || "")}" required /></label>
    <label>姓名<input name="name" value="${escapeAttr(user.name || "")}" required /></label>
    <label>所属组织<select name="organizationId">${buildOptions(db.organizations || [], user.organizationId || "")}</select></label>
    <label>所属角色<select name="roleIds" multiple size="4">${buildMultiOptions(db.roles || [], roleIds)}</select></label>
    <label>状态<select name="status"><option ${user.status !== "停用" ? "selected" : ""}>启用</option><option ${user.status === "停用" ? "selected" : ""}>停用</option></select></label>
    <div class="form-actions"><button type="button" data-cancel>取消</button><button class="primary" type="submit">保存</button></div>
  `, (form) => {
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);
    const username = userId ? user.username : data.username.trim();
    const nextRoleIds = formData.getAll("roleIds").filter(Boolean);
    if (!nextRoleIds.length) {
      showToast("请至少选择一个角色");
      return;
    }
    if ((db.users || []).some((item) => item.username === username && item.id !== userId)) {
      showToast("登录用户名已存在");
      return;
    }
    const next = {
      id: userId || `user-${Date.now()}`,
      username,
      password: data.password.trim(),
      name: data.name.trim(),
      organizationId: data.organizationId,
      roleId: nextRoleIds[0] || "",
      roleIds: nextRoleIds,
      status: data.status,
      lastLogin: user.lastLogin || "",
    };
    if (userId) db.users = db.users.map((item) => item.id === userId ? next : item);
    else {
      db.users.push(next);
      db.userPermissions[next.id] = createMenuPermissions(false, false);
    }
    if (currentUser.id === next.id) {
      currentUser = getUserSessionInfo(next.id) || getAnonymousUser();
      localStorage.setItem(SESSION_USER_KEY, next.id);
    }
    state.userManageOrgId = next.organizationId;
    state.selectedManageUserId = next.id;
    saveDb();
    closeFormModal();
    renderShell();
    renderSystemManagePage();
    showToast("用户已保存");
  });
}

function openRoleManageModal(roleId = "") {
  if (!canEditMenu("roles")) return showToast("当前账号没有角色管理编辑权限");
  const role = (db.roles || []).find((item) => item.id === roleId) || {};
  openFormModal(roleId ? "编辑角色" : "新增角色", `
    <label>角色名称<input name="name" value="${escapeAttr(role.name || "")}" required /></label>
    <label>角色说明<textarea name="description">${escapeHtml(role.description || "")}</textarea></label>
    <label>状态<select name="status"><option ${role.status !== "停用" ? "selected" : ""}>启用</option><option ${role.status === "停用" ? "selected" : ""}>停用</option></select></label>
    <div class="form-actions"><button type="button" data-cancel>取消</button><button class="primary" type="submit">保存</button></div>
  `, (form) => {
    const data = Object.fromEntries(new FormData(form));
    const next = {
      id: roleId || `role-${Date.now()}`,
      name: data.name.trim(),
      description: data.description.trim(),
      status: data.status,
      permissions: role.permissions || createMenuPermissions(false, false),
    };
    if (roleId) db.roles = db.roles.map((item) => item.id === roleId ? next : item);
    else db.roles.push(next);
    saveDb();
    closeFormModal();
    renderSystemManagePage();
    showToast("角色已保存");
  });
}

function openOrganizationManageModal(orgId = "") {
  if (!canEditMenu("organizations")) return showToast("当前账号没有组织管理编辑权限");
  const org = (db.organizations || []).find((item) => item.id === orgId) || {};
  openFormModal(orgId ? "编辑组织" : "新增组织", `
    <label>组织名称<input name="name" value="${escapeAttr(org.name || "")}" required /></label>
    <label>上级组织<select name="parentId">${buildOptions((db.organizations || []).filter((item) => item.id !== orgId), org.parentId || "", "无")}</select></label>
    <label>负责人<input name="manager" value="${escapeAttr(org.manager || "")}" /></label>
    <label>状态<select name="status"><option ${org.status !== "停用" ? "selected" : ""}>启用</option><option ${org.status === "停用" ? "selected" : ""}>停用</option></select></label>
    <div class="form-actions"><button type="button" data-cancel>取消</button><button class="primary" type="submit">保存</button></div>
  `, (form) => {
    const data = Object.fromEntries(new FormData(form));
    const next = {
      id: orgId || `org-${Date.now()}`,
      name: data.name.trim(),
      parentId: data.parentId || "",
      manager: data.manager.trim(),
      status: data.status,
    };
    if (orgId) db.organizations = db.organizations.map((item) => item.id === orgId ? next : item);
    else {
      db.organizations.push(next);
      db.orgPermissions[next.id] = createMenuPermissions(false, false);
    }
    saveDb();
    closeFormModal();
    renderSystemManagePage();
    showToast("组织已保存");
  });
}

function openPermissionManageModal(roleId) {
  if (!canEditMenu("permissions")) return showToast("当前账号没有权限管理编辑权限");
  const role = (db.roles || []).find((item) => item.id === roleId);
  if (!role) return;
  const groups = [...new Set(SYSTEM_MENUS.map((menu) => menu.group))];
  const rows = groups.map((group) => {
    const key = `role:${role.id}:group:${group}`;
    const menuRows = SYSTEM_MENUS.filter((menu) => menu.group === group).map((menu) => {
      const permission = role.permissions?.[menu.id] || {};
      return `<div class="permission-edit-node depth-1" data-role-permission-row>
        <div class="permission-edit-name"><span class="tree-toggle placeholder"></span><strong>${escapeHtml(menu.label)}</strong><small>菜单</small></div>
        <label class="permission-check"><input data-role-permission-level="visible" type="checkbox" name="${escapeAttr(menu.id)}_visible" ${permission.visible ? "checked" : ""} /> 可读</label>
        <label class="permission-check"><input data-role-permission-level="editable" type="checkbox" name="${escapeAttr(menu.id)}_editable" ${permission.editable ? "checked" : ""} /> 可写</label>
      </div>`;
    }).join("");
    return `<div class="permission-edit-group">
      <button class="permission-edit-group-title as-button" data-toggle-tree type="button"><span class="tree-toggle">−</span>${escapeHtml(group)}</button>
      ${menuRows}
    </div>`;
  }).join("");
  openFormModal(`配置权限 - ${role.name}`, `
    <div class="permission-edit-scroll permission-edit-tree">${rows}</div>
    <div class="form-actions"><button type="button" data-cancel>取消</button><button class="primary" type="submit">保存权限</button></div>
  `, (form) => {
    const data = Object.fromEntries(new FormData(form));
    role.permissions = role.permissions || {};
    SYSTEM_MENUS.forEach((menu) => {
      role.permissions[menu.id] = {
        visible: !!data[`${menu.id}_visible`] || !!data[`${menu.id}_editable`],
        editable: !!data[`${menu.id}_editable`],
      };
    });
    saveDb();
    currentUser = getUserSessionInfo(currentUser.id) || currentUser;
    closeFormModal();
    renderShell();
    normalizePageState();
    render();
    showToast("权限已保存");
  });
  bindPermissionModalChecks();
}

function emptyRecycleBin() {
  const count = db.assets.filter((asset) => asset.status === "deleted").length + db.groups.filter((group) => group.status === "deleted").length;
  if (!count) {
    showToast("回收站暂无内容");
    return;
  }
  db.assets = db.assets.filter((asset) => asset.status !== "deleted");
  db.groups = db.groups.filter((group) => group.status !== "deleted");
  saveDb();
  render();
  showToast("回收站已清空");
}

function toggleRecycleDeletedTimeSort() {
  state.recycleSort = state.recycleSort === "deletedDesc" ? "deletedAsc" : "deletedDesc";
  render();
  showToast(state.recycleSort === "deletedDesc" ? "已按删除时间从新到旧排序" : "已按删除时间从旧到新排序");
}

function sortRecycleItems(items) {
  const direction = state.recycleSort === "deletedAsc" ? 1 : -1;
  return [...items].sort((a, b) => (getRecycleDeletedTime(a) - getRecycleDeletedTime(b)) * direction);
}

function getRecycleDeletedTime(item) {
  const text = item.deletedAt || item.updatedAt || item.createdAt || item.uploadDate || "";
  return dateTimeTextToTimestamp(text);
}

function hashTagText(text) {
  let hash = 0;
  String(text || "").split("").forEach((char) => {
    hash = ((hash << 5) - hash + char.charCodeAt(0)) >>> 0;
  });
  return hash.toString(36);
}

function isValidTagCode(code) {
  return /^[a-z][a-z0-9_]*$/.test(String(code || ""));
}

function buildTagCodeBase(tagName, tagType) {
  const prefix = Number(tagType) === 2 ? "ai" : "biz";
  const asciiName = String(tagName || "")
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
  return `${prefix}_${asciiName || `tag_${hashTagText(tagName)}`}`;
}

function generateTagCode(tagName, tagType, currentId = "") {
  const base = buildTagCodeBase(tagName, tagType);
  const currentKey = String(currentId || "");
  let code = base;
  let index = 2;
  while ((db.tags || []).some((tag) => String(tag.id || "") !== currentKey && String(tag.tagCode || "") === code)) {
    code = `${base}_${index}`;
    index += 1;
  }
  return code;
}

function getSafeTagCode(tag) {
  const tagName = tag.tagName || tag.name || tag.tag || "";
  const tagType = tag.tagType ?? (tag.system ? 2 : 1);
  return isValidTagCode(tag.tagCode) ? tag.tagCode : generateTagCode(tagName, tagType, tag.id);
}

function normalizeStoredTagCodes() {
  if (!Array.isArray(db.tags)) return;
  const usedCodes = new Set();
  let changed = false;
  db.tags.forEach((tag) => {
    if (!tag || typeof tag !== "object") return;
    const tagName = tag.tagName || tag.name || tag.tag || "";
    const tagType = tag.tagType ?? (tag.system ? 2 : 1);
    const currentCode = String(tag.tagCode || "");
    const base = isValidTagCode(currentCode) ? currentCode : buildTagCodeBase(tagName, tagType);
    let nextCode = base;
    let index = 2;
    while (usedCodes.has(nextCode)) {
      nextCode = `${base}_${index}`;
      index += 1;
    }
    usedCodes.add(nextCode);
    if (tag.tagCode !== nextCode) {
      tag.tagCode = nextCode;
      changed = true;
    }
  });
  if (changed) saveDb();
}

function getTagSummary() {
  normalizeStoredTagCodes();
  const businessTags = new Map(); // name → count
  const aiTags = new Map();       // name → count
  const tagMap = new Map();       // name → full tag info (for tag library itself)

  // Normalize legacy tag object to new schema
  const norm = (tag) => {
    if (!tag || typeof tag !== "object") return null;
    const tagName = (tag.tagName || tag.name || tag.tag || "").trim();
    if (!tagName) return null;
    return {
      id:        tag.id || tagName,
      tagName:   tagName,
      tagCode:   getSafeTagCode({ ...tag, tagName }),
      tagType:   tag.tagType ?? (tag.system ? 2 : 1),  // legacy: system→AI(2), else→business(1)
      parentId:  (tag.parentId || tag.parent_id || 0),
      level:     tag.level ?? (tag.parentId || tag.parent_id ? 1 : 0),
      aiSource:  tag.aiSource ?? (tag.ai_source ?? 0),
      aiRecognitionEnabled: tag.aiRecognitionEnabled ?? (tag.ai_recognition_enabled ?? 1),
      isVisible: tag.isVisible ?? (tag.is_visible ?? 1),
      status:    tag.status ?? 1,
      sortOrder: tag.sortOrder ?? (tag.sort_order ?? 0),
      description: tag.description || "",
      createdBy: tag.createdBy || tag.created_by || "",
      createdAt: tag.createdAt || tag.created_at || "",
      updatedAt: tag.updatedAt || tag.updated_at || "",
      // backward compat
      name: tagName,
      count: 0,
      parentName: "",
      children: [],
    };
  };

  // Build tagMap from db.tags (tag library)
  if (db.tags && Array.isArray(db.tags)) {
    db.tags.forEach((tag) => {
      const info = norm(tag);
      if (!info) return;
      tagMap.set(info.tagName, info);
      if (info.tagType === 2) {
        aiTags.set(info.tagName, (aiTags.get(info.tagName) || 0));
      } else {
        businessTags.set(info.tagName, (businessTags.get(info.tagName) || 0));
      }
    });
  }

  // Resolve parent names for AI tag hierarchy
  tagMap.forEach((info) => {
    if (info.parentId) {
      // parentId may be a number ID or a tag name (legacy)
      let parent = tagMap.get(String(info.parentId));
      if (!parent) {
        // try find by id
        for (const [, v] of tagMap) { if (v.id === info.parentId) { parent = v; break; } }
      }
      info.parentName = parent ? parent.tagName : String(info.parentId);
    }
  });

  // Count tag usage from assets
  db.assets.filter((asset) => asset.status !== "deleted").forEach((asset) => {
    (asset.customTags || []).forEach((t) => {
      const n = (typeof t === "object" ? (t.name || t.tag || "") : String(t || "")).trim();
      if (n) businessTags.set(n, (businessTags.get(n) || 0) + 1);
    });
    (asset.aiTags || []).forEach((t) => {
      const n = (typeof t === "object" ? (t.name || t.tag || "") : String(t || "")).trim();
      if (n) aiTags.set(n, (aiTags.get(n) || 0) + 1);
    });
  });

  // Build AI tag tree (business tags are flat — no hierarchy)
  const buildAiTree = (entries) => {
    const tree = [];
    const nodeMap = new Map();
    entries.forEach(([name, count]) => {
      const base = tagMap.get(name);
      nodeMap.set(name, { ...(base || {}), tagName: name, name, count, children: [], parentId: base ? base.parentId : 0 });
    });
    nodeMap.forEach((node) => {
      if (node.parentId && nodeMap.has(String(node.parentId))) {
        nodeMap.get(String(node.parentId)).children.push(node);
      } else if (node.parentId) {
        // try matching by parent name
        const parent = [...nodeMap.values()].find((v) => v.tagName === String(node.parentId) || v.id === node.parentId);
        if (parent) parent.children.push(node);
        else tree.push(node);
      } else {
        tree.push(node);
      }
    });
    return tree;
  };
  const flatAiTree = buildAiTree([...aiTags.entries()]).sort((a, b) => b.count - a.count);

  const flattenAiTags = (nodes) => {
    const result = [];
    const walk = (list, depth = 0) => {
      list.forEach((node) => {
        result.push({ ...node, _depth: depth });
        if (node.children && node.children.length) walk(node.children, depth + 1);
      });
    };
    walk(nodes);
    return result;
  };

  const buildBusinessTree = (entries) => {
    const tree = [];
    const nodeMap = new Map();
    entries.forEach(([name, count]) => {
      const base = tagMap.get(name);
      nodeMap.set(name, { ...(base || {}), tagName: name, name, count, children: [], parentId: base ? base.parentId : 0 });
    });
    nodeMap.forEach((node) => {
      if (node.parentId) {
        const parent = nodeMap.get(String(node.parentId)) || [...nodeMap.values()].find((v) => v.tagName === String(node.parentId) || v.id === node.parentId);
        if (parent) parent.children.push(node);
        else tree.push(node);
      } else {
        tree.push(node);
      }
    });
    return tree.sort((a, b) => b.count - a.count);
  };

  return {
    businessTags: [...businessTags.entries()]
      .map(([name, count]) => ({ ...(tagMap.get(name) || {}), tagName: name, name, count }))
      .sort((a, b) => b.count - a.count),
    businessTagTree: buildBusinessTree([...businessTags.entries()]),
    aiTags: flatAiTree,
    aiTagTree: flatAiTree,
    flatAiTags: flattenAiTags(flatAiTree),
    tagMap,
  };
}

function renderTagsPage() {
  if (!canViewMenu("tags")) {
    els.contentPanel.innerHTML = renderEmpty("当前账号无权查看标签管理");
    return;
  }
  const canEditTags = canEditMenu("tags");
  const { businessTags, aiTags } = getTagSummary();
  els.contentPanel.innerHTML = renderManageShell("标签管理", `业务标签 ${businessTags.length} 个 · AI标签 ${aiTags.length} 个`, `
    <div class="tabs">
      <button class="active" id="tagTabBusiness" type="button">业务标签</button>
      <button id="tagTabAI" type="button">AI标签</button>
    </div>
    <div class="asset-toolbar inline-toolbar">
      <label>搜索标签<input id="tagSearchInput" placeholder="输入标签名称搜索" /></label>
      <label>排序方式<select id="tagSortSelect">
        <option value="count">使用次数（降序）</option>
        <option value="name">标签名称（升序）</option>
      </select></label>
    </div>
    <div class="tag-content" id="tagContent">
      <div class="table-scroll">
        <table class="records-table tag-table" id="tagTable">
          <colgroup id="tagTableCols"></colgroup>
          <thead id="tagTableHead"></thead>
          <tbody id="tagTableBody"></tbody>
        </table>
      </div>
    </div>
  `);

  const { businessTagTree: btTree } = getTagSummary();
  const flattenTree = (nodes) => {
    let result = [];
    const flatten = (node, depth = 0) => {
      result.push({ ...node, _depth: depth });
      if (node.children) {
        node.children.forEach(child => flatten(child, depth + 1));
      }
    };
    btTree.forEach(node => flatten(node, 0));
    return result;
  };
  renderTagTableBody(flattenTree(btTree), "business");
  document.querySelector("#addTagButton")?.classList.toggle("hidden", !canEditTags);
  document.querySelector("#mergeTagButton")?.classList.toggle("hidden", !canEditTags);

  document.querySelector("#tagTabBusiness")?.addEventListener("click", () => {
    setActiveTab("tagTabBusiness", ["tagTabAI"]);
    document.querySelector("#addTagButton")?.classList.toggle("hidden", !canEditTags);
    document.querySelector("#mergeTagButton")?.classList.toggle("hidden", !canEditTags);
    const { businessTagTree: btTree } = getTagSummary();
    const flattenTree = (nodes) => {
      let result = [];
      const flatten = (node, depth = 0) => {
        result.push({ ...node, _depth: depth });
        if (node.children) {
          node.children.forEach(child => flatten(child, depth + 1));
        }
      };
      btTree.forEach(node => flatten(node, 0));
      return result;
    };
    renderTagTableBody(flattenTree(btTree), "business");
  });

  document.querySelector("#tagTabAI")?.addEventListener("click", () => {
    setActiveTab("tagTabAI", ["tagTabBusiness"]);
    document.querySelector("#addTagButton")?.classList.toggle("hidden", !canEditTags);
    document.querySelector("#mergeTagButton")?.classList.add("hidden");
    const { flatAiTags: at } = getTagSummary();
    renderTagTableBody(at, "ai");
  });

  function setActiveTab(activeId, inactiveIds) {
    document.getElementById(activeId)?.classList.add("active");
    inactiveIds.forEach((id) => document.getElementById(id)?.classList.remove("active"));
  }

  els.contentPanel.querySelector("#tagSearchInput")?.addEventListener("input", window.AppInfra.utils.debounce((event) => {
    filterTags(event.target.value.toLowerCase());
  }, 300));
  els.contentPanel.querySelector("#tagSortSelect")?.addEventListener("change", (event) => {
    sortTags(event.target.value);
  });

  bindTagEvents();
}

function renderTagTableBody(tags, type) {
  const tbody = document.querySelector("#tagTableBody");
  const thead = document.querySelector("#tagTableHead");
  const colgroup = document.querySelector("#tagTableCols");
  if (!tbody || !thead || !colgroup) return;
  const canEditTags = canEditMenu("tags");

  // --- business: tree table with indent ---
  if (type === "business") {
    colgroup.innerHTML = `
      <col style="width:64px">
      <col style="width:220px">
      <col style="width:150px">
      <col style="width:140px">
      <col style="width:220px">
      <col style="width:132px">
      <col style="width:110px">
      ${canEditTags ? `<col style="width:104px">` : ""}`;
    thead.innerHTML = `<tr>
      <th>#</th><th>标签名称</th><th>标签编码</th><th>父标签名称</th><th>标签描述</th><th>创建时间</th><th>创建人</th>${canEditTags ? "<th>操作</th>" : ""}
    </tr>`;

    const rows = tags.map((tag, idx) => {
      const name   = tag.tagName || tag.name || "-";
      const code   = tag.tagCode || "-";
      const desc   = tag.description || "-";
      const ctime  = tag.createdAt ? tag.createdAt.split(" ")[0] : "-";
      const cby    = tag.createdBy || "-";
      const count  = tag.count || 0;
      const depth  = tag.level || 0;
      const indent = depth > 0 ? `<span class="tree-indent">${"├ ".repeat(depth)}</span>` : "";
      const parentName = tag.parentId && tag.parentId !== 0 ? tag.parentId : "-";
      return `<tr>
        <td class="cell-mono">${escapeHtml(String(idx + 1))}</td>
        <td>
          <div class="tag-name-cell">
            ${indent}<span class="tag-type-badge" title="业务标签">B</span>
            <strong>${escapeHtml(name)}</strong>
            <span class="tag-count-badge" title="使用次数">${count} 次</span>
          </div>
        </td>
        <td class="cell-mono">${escapeHtml(code)}</td>
        <td>${escapeHtml(parentName)}</td>
        <td class="cell-ellipsis">${escapeHtml(desc)}</td>
        <td>${escapeHtml(ctime)}</td>
        <td>${escapeHtml(cby)}</td>
        ${canEditTags ? `<td>
          <div class="tag-table-actions">
            <button class="op-button" data-edit-tag="${escapeAttr(name)}" type="button" title="编辑"><span data-icon="edit"></span></button>
            <button class="op-button" data-merge-tag="${escapeAttr(name)}" type="button" title="合并到分组"><span data-icon="merge"></span></button>
          </div>
        </td>` : ""}
      </tr>`;
    });

    tbody.innerHTML = rows.length
      ? rows.join("")
      : `<tr><td colspan="${canEditTags ? 8 : 7}" class="empty-cell">暂无业务标签</td></tr>`;

    if (canEditTags) {
      tbody.querySelectorAll("[data-edit-tag]").forEach((btn) => {
        btn.addEventListener("click", () => openEditTagModal(btn.dataset.editTag));
      });
      tbody.querySelectorAll("[data-merge-tag]").forEach((btn) => {
        btn.addEventListener("click", () => openMergeTagModal(btn.dataset.mergeTag));
      });
    }
    return;
  }

  // --- AI: tree table with indent ---
  colgroup.innerHTML = `
    <col style="width:64px">
    <col style="width:220px">
    <col style="width:150px">
    <col style="width:220px">
    <col style="width:140px">
    <col style="width:130px">
    <col style="width:100px">
    <col style="width:132px">
    <col style="width:110px">
    ${canEditTags ? `<col style="width:86px">` : ""}`;
  thead.innerHTML = `<tr>
    <th>#</th><th>标签名称</th><th>标签编码</th><th>标签描述</th><th>父标签名称</th><th>AI来源</th><th>AI识别</th><th>创建时间</th><th>创建人</th>${canEditTags ? "<th>操作</th>" : ""}
  </tr>`;

  const aiSourceLabel = { 1: "AI 自动识别", 2: "业务预定义" };
  const aiSourceClass = { 1: "ai-source-auto", 2: "ai-source-predef" };

  const rows = tags.map((tag, idx) => {
    const name   = tag.tagName || tag.name || "-";
    const code   = tag.tagCode || "-";
    const desc   = tag.description || "-";
    const parent = tag.parentName || "-";
    const src    = aiSourceLabel[tag.aiSource] || "—";
    const srcCls = aiSourceClass[tag.aiSource] || "";
    const recog  = tag.aiRecognitionEnabled ? `<span class="badge-on">启用</span>` : `<span class="badge-off">未启用</span>`;
    const ctime  = tag.createdAt ? tag.createdAt.split(" ")[0] : "-";
    const cby    = tag.createdBy || "-";
    const depth  = tag._depth || 0;
    const indent = depth > 0 ? `<span class="tree-indent">${"├ ".repeat(depth)}</span>` : "";

    return `<tr>
      <td class="cell-mono">${escapeHtml(String(idx + 1))}</td>
      <td>
        <div class="tag-name-cell">
          ${indent}<span class="tag-type-badge ai" title="AI标签">AI</span>
          <strong>${escapeHtml(name)}</strong>
          <span class="tag-count-badge" title="使用次数">${tag.count || 0} 次</span>
        </div>
      </td>
      <td class="cell-mono">${escapeHtml(code)}</td>
      <td class="cell-ellipsis">${escapeHtml(desc)}</td>
      <td>${escapeHtml(parent)}</td>
      <td><span class="ai-source-tag ${srcCls}">${escapeHtml(src)}</span></td>
      <td>${recog}</td>
      <td>${escapeHtml(ctime)}</td>
      <td>${escapeHtml(cby)}</td>
      ${canEditTags ? `<td>
        <div class="tag-table-actions">
          <button class="op-button" data-edit-tag="${escapeAttr(name)}" type="button" title="编辑"><span data-icon="edit"></span></button>
        </div>
      </td>` : ""}
    </tr>`;
  });

  tbody.innerHTML = rows.length
    ? rows.join("")
    : `<tr><td colspan="${canEditTags ? 10 : 9}" class="empty-cell">暂无AI标签</td></tr>`;

  if (canEditTags) {
    tbody.querySelectorAll("[data-edit-tag]").forEach((btn) => {
      btn.addEventListener("click", () => openEditTagModal(btn.dataset.editTag));
    });
  }
}

function renderBusinessTagList(tags) {
  const container = document.querySelector("#tagListContainer");
  if (!container) return;

  const renderTagTree = (nodes, depth = 0) => {
    return nodes.map((tag) => `
      <div class="tag-item" data-tag="${escapeAttr(tag.name)}" style="padding-left: ${depth * 20}px;">
        ${tag.children.length > 0 ? `<span class="tag-expand" data-expand-tag="${escapeAttr(tag.name)}">▶</span>` : `<span class="tag-expand-placeholder"></span>`}
        <span class="tag-name">${escapeHtml(tag.name)}</span>
        <span class="tag-count">${tag.count} 次</span>
        <div class="tag-actions">
          <button data-edit-tag="${escapeAttr(tag.name)}" type="button" title="编辑"><span data-icon="edit"></span></button>
          <button data-delete-tag="${escapeAttr(tag.name)}" type="button" title="删除"><span data-icon="trash"></span></button>
        </div>
        ${tag.children.length > 0 ? `<div class="tag-children" data-children="${escapeAttr(tag.name)}">${renderTagTree(tag.children, depth + 1)}</div>` : ""}
      </div>
    `).join("");
  };

  container.innerHTML = `
    <h3>业务手写标签</h3>
    <p class="tag-desc">业务人员可自由创建、编辑、删除，用于筛选和归类素材</p>
    <div class="tag-grid">
      ${renderTagTree(tags) || `<div class="empty">暂无业务标签</div>`}
    </div>
  `;

  document.querySelectorAll("[data-expand-tag]").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      const tagName = button.dataset.expandTag;
      const children = document.querySelector(`[data-children="${escapeAttr(tagName)}"]`);
      if (children) {
        children.classList.toggle("hidden");
        button.textContent = children.classList.contains("hidden") ? "▶" : "▼";
      }
    });
  });
}

function renderAITagList(tags) {
  const container = document.querySelector("#tagListContainer");
  if (!container) return;
  container.innerHTML = `
    <h3>AI标签</h3>
    <p class="tag-desc">AI识别素材后自动生成的标签，不可直接编辑，可通过重新打标更新</p>
    <div class="tag-grid ai-tag-grid">
      ${tags.map((tag) => `
        <div class="tag-item" data-tag="${escapeAttr(tag.name)}">
          <span class="tag-name">${escapeHtml(tag.name)}</span>
          <span class="tag-count">${tag.count} 次</span>
          <div class="tag-actions">
            <button data-retag-tag="${escapeAttr(tag.name)}" type="button" title="查找使用此标签的素材"><span data-icon="search"></span></button>
          </div>
        </div>
      `).join("") || `<div class="empty">暂无AI标签</div>`}
    </div>
  `;
  document.querySelectorAll("[data-retag-tag]").forEach((button) => {
    button.addEventListener("click", () => {
      const tagName = button.dataset.retagTag;
      state.page = "all";
      state.filters["AI标签"] = [tagName];
      render();
    });
  });
}

function renderSystemTagList(tags) {
  const container = document.querySelector("#tagListContainer");
  if (!container) return;
  container.innerHTML = `
    <h3>系统标签</h3>
    <p class="tag-desc">系统自动生成的标签，仅做展示，不可编辑、删除或用于查询</p>
    <div class="tag-grid system-tag-grid">
      ${tags.map((tag) => `
        <div class="tag-item" data-tag="${escapeAttr(tag.name)}">
          <span class="tag-name">${escapeHtml(tag.name)}</span>
          <span class="tag-count">${tag.count} 次</span>
          <div class="tag-actions">
          </div>
        </div>
      `).join("") || `<div class="empty">暂无系统标签</div>`}
    </div>
  `;
}

function bindTagEvents() {
  els.contentPanel.removeEventListener("click", handleTagClick);
  els.contentPanel.addEventListener("click", handleTagClick);
}

function handleTagClick(event) {
  const editButton = event.target.closest("[data-edit-tag]");
  if (editButton) {
    const oldName = editButton.dataset.editTag;
    openEditTagModal(oldName);
    return;
  }

  const deleteButton = event.target.closest("[data-delete-tag]");
  if (deleteButton) {
    const tagName = deleteButton.dataset.deleteTag;
    deleteTag(tagName);
    return;
  }

  const retagButton = event.target.closest("[data-retag-tag]");
  if (retagButton) {
    const tagName = retagButton.dataset.retagTag;
    state.page = "all";
    state.filters["AI标签"] = [tagName];
    render();
    return;
  }
}

function filterTags(query) {
  const activeTab = document.querySelector("#tagTabBusiness")?.classList.contains("active") ? "business" : "ai";
  if (activeTab === "business") {
    const { businessTags } = getTagSummary();
    const filtered = businessTags.filter((tag) => (tag.tagName || tag.name || "").toLowerCase().includes(query));
    renderTagTableBody(filtered, "business");
  } else {
    const { flatAiTags } = getTagSummary();
    const filtered = flatAiTags.filter((tag) => (tag.tagName || tag.name || "").toLowerCase().includes(query));
    renderTagTableBody(filtered, "ai");
  }
}

function sortTags(sortBy) {
  const activeTab = document.querySelector("#tagTabBusiness")?.classList.contains("active") ? "business" : "ai";
  if (activeTab === "business") {
    const { businessTags } = getTagSummary();
    const sorted = [...businessTags].sort((a, b) =>
      sortBy === "name" ? (a.tagName || a.name || "").localeCompare((b.tagName || b.name || ""), "zh-CN") : (b.count || 0) - (a.count || 0)
    );
    renderTagTableBody(sorted, "business");
  } else {
    const { flatAiTags } = getTagSummary();
    const sorted = [...flatAiTags].sort((a, b) =>
      sortBy === "name" ? (a.tagName || a.name || "").localeCompare((b.tagName || b.name || ""), "zh-CN") : (b.count || 0) - (a.count || 0)
    );
    renderTagTableBody(sorted, "ai");
  }
}

function updateAddTagParentOptions() {
  const type = document.querySelector("#addTagType")?.value;
  const tagType = parseInt(type || "1");
  const parentNames = (db.tags || [])
    .filter(t => typeof t === "object" && t !== null)
    .filter(t => (t.tagType ?? (t.system ? 2 : 1)) === tagType)
    .map(t => t.tagName || t.name || "").filter(Boolean);
  document.querySelector("#addTagParentId").innerHTML = `<option value="">无（顶级标签）</option>${parentNames.map(name => `<option value="${escapeAttr(name)}">${escapeHtml(name)}</option>`).join("")}`;
}

function openAddTagModal() {
  if (!canEditMenu("tags")) {
    showToast("当前账号没有标签编辑权限");
    return;
  }
  document.querySelector("#addTagName").value = "";
  document.querySelector("#addTagDesc").value = "";
  document.querySelector("#addTagType").value = "1"; // default business
  document.querySelector("#addTagAiRecognition").checked = true;
  
  updateAddTagParentOptions();
  document.querySelector("#addTagParentId").value = "";

  toggleAddAiFields();

  document.querySelector("#addTagModal").classList.remove("hidden");
}

function toggleAddAiFields() {
  const type = document.querySelector("#addTagType")?.value;
  const parentRow = document.querySelector("#addTagParentRow");
  const aiRecogRow = document.querySelector("#addTagAiRecognitionRow");
  if (parentRow) parentRow.style.display = "";
  if (aiRecogRow) aiRecogRow.classList.toggle("hidden", type !== "2");
  updateAddTagParentOptions();
}

function handleAddTagSubmit(event) {
  event.preventDefault();
  const form = event.target;
  const data = Object.fromEntries(new FormData(form));
  const tagName = (data.tagName || "").trim();
  const tagType = parseInt(data.tagType || "1", 10);
  const parentId = data.parentId || 0;
  const description = (data.tagDesc || "").trim();

  if (!tagName) { showToast("请输入标签名称"); return; }
  if (!db.tags) db.tags = [];

  const dup = db.tags.find(t => (t.tagName || t.name || "").trim() === tagName);
  if (dup) { showToast("该标签已存在"); return; }

  const newTag = {
    id: `tag-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    tagName,
    tagCode: generateTagCode(tagName, tagType),
    tagType,
    parentId: parentId,
    level: parentId ? 1 : 0,
    aiSource: tagType === 2 ? 2 : 0,
    aiRecognitionEnabled: tagType === 2 ? !!data.aiRecognition : false,
    isVisible: 1,
    status: 1,
    sortOrder: 0,
    description,
    createdBy: currentUser.name,
    createdAt: nowText(),
    updatedAt: nowText(),
  };

  db.tags.push(newTag);
  saveDb();
  closeAddTagModal();
  showToast(`标签「${tagName}」已添加`);
  renderTagsPage();
}

function closeAddTagModal() {
  document.querySelector("#addTagModal").classList.add("hidden");
}

let editTagOldName = "";

function createTagRecordFromUsage(tagName, tagType) {
  if (!db.tags) db.tags = [];
  const existing = db.tags.find((tag) => (tag.tagName || tag.name || "") === tagName);
  if (existing) return existing;
  const normalizedType = Number(tagType) === 2 ? 2 : 1;
  const now = nowText();
  const tag = {
    id: `tag-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    tagName,
    tagCode: generateTagCode(tagName, normalizedType),
    tagType: normalizedType,
    parentId: 0,
    level: 0,
    aiSource: normalizedType === 2 ? 1 : 0,
    aiRecognitionEnabled: normalizedType === 2,
    isVisible: 1,
    status: 1,
    sortOrder: 0,
    description: "",
    createdBy: currentUser.name,
    createdAt: now,
    updatedAt: now,
  };
  db.tags.push(tag);
  saveDb();
  return tag;
}

function ensureRecognizedAiTagsInLibrary(tags = []) {
  const beforeCount = (db.tags || []).length;
  [...new Set(tags)].forEach((tagName) => {
    const name = String(tagName || "").trim();
    if (name) createTagRecordFromUsage(name, 2);
  });
  return (db.tags || []).length > beforeCount;
}

function updateEditTagParentOptions(tagName) {
  const type = document.querySelector("#editTagType")?.value;
  const tagType = parseInt(type || "1");
  const tag = (db.tags || []).find(t => (t.tagName || t.name || "") === tagName);
  const parentNames = (db.tags || [])
    .filter(t => typeof t === "object" && t !== null)
    .filter(t => (t.tagType ?? (t.system ? 2 : 1)) === tagType)
    .map(t => t.tagName || t.name || "").filter(Boolean)
    .filter(n => n !== tagName);
  const parentId = tag ? tag.parentId : "";
  document.querySelector("#editTagParentId").innerHTML = `<option value="">无（顶级标签）</option>${parentNames.map(n => `<option value="${escapeAttr(n)}" ${n === parentId ? "selected" : ""}>${escapeHtml(n)}</option>`).join("")}`;
}

function openEditTagModal(oldName) {
  if (!canEditMenu("tags")) {
    showToast("当前账号没有标签编辑权限");
    return;
  }
  editTagOldName = oldName;
  const isAiTab = document.querySelector("#tagTabAI")?.classList.contains("active");
  const tag = (db.tags || []).find(t => (t.tagName || t.name || "") === oldName) || createTagRecordFromUsage(oldName, isAiTab ? 2 : 1);

  const tagName = tag.tagName || tag.name || "";
  const tagType = tag.tagType ?? (tag.system ? 2 : 1);

  document.querySelector("#editTagOldName").textContent = escapeHtml(tagName);
  document.querySelector("#editTagNewName").value = tagName;
  document.querySelector("#editTagDesc").value = tag.description || "";
  document.querySelector("#editTagType").value = String(tagType);
  document.querySelector("#editTagAiRecognition").checked = tag.aiRecognitionEnabled !== 0;

  updateEditTagParentOptions(tagName);

  toggleEditAiFields();
  document.querySelector("#editTagModal").classList.remove("hidden");
}

function toggleEditAiFields() {
  const type = document.querySelector("#editTagType")?.value;
  const parentRow = document.querySelector("#editTagParentRow");
  const aiRecogRow = document.querySelector("#editTagAiRecognitionRow");
  if (parentRow) parentRow.style.display = "";
  if (aiRecogRow) aiRecogRow.classList.toggle("hidden", type !== "2");
  updateEditTagParentOptions(editTagOldName);
}

function handleEditTagSubmit(event) {
  event.preventDefault();
  const form = event.target;
  const data = Object.fromEntries(new FormData(form));
  const newName = (data.tagName || "").trim();
  const oldName = editTagOldName;
  if (!newName) { showToast("请输入标签名称"); return; }
  if (newName !== oldName && (db.tags || []).some(t => (t.tagName || t.name || "").trim() === newName)) {
    showToast("该标签已存在");
    return;
  }

  const tagIdx = (db.tags || []).findIndex(t => (t.tagName || t.name || "") === oldName);
  if (tagIdx === -1) { closeEditTagModal(); return; }

  const tag = db.tags[tagIdx];
  const tagType = parseInt(data.tagType || "1", 10);
  db.tags[tagIdx] = {
    ...tag,
    tagName: newName,
    tagCode: generateTagCode(newName, tagType, tag.id),
    tagType,
    parentId: data.parentId || 0,
    level: data.parentId ? 1 : 0,
    aiSource: tagType === 2 ? (tag.aiSource || 2) : 0,
    aiRecognitionEnabled: tagType === 2 ? !!data.aiRecognition : false,
    description: (data.tagDesc || "").trim(),
    updatedAt: nowText(),
  };

  // Rename tags on assets
  if (newName !== oldName) {
    db.assets.forEach((asset) => {
      if (asset.customTags && asset.customTags.includes(oldName)) {
        asset.customTags = asset.customTags.map((t) => t === oldName ? newName : t);
        asset.updatedAt = nowText();
        asset.logs.unshift(`${currentUser.name} 将标签「${oldName}」修改为「${newName}」`);
      }
      if (asset.aiTags && asset.aiTags.includes(oldName)) {
        asset.aiTags = asset.aiTags.map((t) => t === oldName ? newName : t);
        asset.updatedAt = nowText();
        asset.logs.unshift(`${currentUser.name} 将AI标签「${oldName}」修改为「${newName}」`);
      }
    });
  }

  saveDb();
  closeEditTagModal();
  showToast(`标签已保存`);
  renderTagsPage();
}

function closeEditTagModal() {
  document.querySelector("#editTagModal").classList.add("hidden");
}

async function deleteTag(tagName) {
  if (!canEditMenu("tags")) {
    showToast("当前账号没有标签编辑权限");
    return;
  }
  const count = getTagUsageCount(tagName);
  const ok = await window.Modal.confirm(`确定删除标签「${tagName}」吗？该标签当前被 ${count} 个素材使用，删除后将从所有素材中移除该标签。`);
  if (!ok) return;

  if (db.tags && Array.isArray(db.tags)) {
    db.tags = db.tags.filter((tag) => (tag.tagName || tag.name || "") !== tagName);
  }
  
  db.assets.forEach((asset) => {
    if (asset.customTags && asset.customTags.includes(tagName)) {
      asset.customTags = asset.customTags.filter((t) => t !== tagName);
      asset.updatedAt = nowText();
      asset.logs.unshift(`${currentUser.name} 删除了标签「${tagName}」`);
    }
  });
  saveDb();
  showToast(`标签「${tagName}」已删除`);
  renderTagsPage();
}

function getTagUsageCount(tagName) {
  return db.assets.filter((asset) => asset.status !== "deleted" && asset.customTags && asset.customTags.includes(tagName)).length;
}

function openMergeTagModal(preselectTag) {
  if (!canEditMenu("tags")) {
    showToast("当前账号没有标签编辑权限");
    return;
  }
  const { businessTags } = getTagSummary();
  const tagNames = businessTags.map(t => t.tagName || t.name || "").filter(Boolean);
  const selectedNames = new Set(preselectTag ? [preselectTag] : []);
  const tagOptions = tagNames.map((name) => `<option value="${escapeAttr(name)}">${escapeHtml(name)}</option>`).join("");
  const sourceItems = tagNames.map((name) => `
    <label class="merge-check-item">
      <input type="checkbox" name="mergeSourceTag" value="${escapeAttr(name)}" ${selectedNames.has(name) ? "checked" : ""} />
      <span>${escapeHtml(name)}</span>
    </label>
  `).join("");

  const sourceList = document.querySelector("#mergeSourceTags");
  sourceList.innerHTML = sourceItems || `<div class="empty">暂无可合并标签</div>`;
  sourceList.onchange = updateMergeTagSelectionCount;
  document.querySelector("#mergeTargetTag").innerHTML = tagOptions;
  updateMergeTagSelectionCount();
  document.querySelector("#mergeTagModal").classList.remove("hidden");
}

function handleMergeTagSubmit(event) {
  event.preventDefault();
  const targetTag = document.querySelector("#mergeTargetTag").value;
  const sourceTags = [...document.querySelectorAll("#mergeSourceTags input[name='mergeSourceTag']:checked")].map((input) => input.value);

  if (sourceTags.length === 0) {
    showToast("请选择至少一个要合并的标签");
    return;
  }
  if (!targetTag) {
    showToast("请选择目标标签");
    return;
  }
  if (sourceTags.includes(targetTag)) {
    showToast("目标标签不能在合并列表中");
    return;
  }

  if (db.tags && Array.isArray(db.tags)) {
    db.tags = db.tags.filter((tag) => {
      const name = typeof tag === "object" && tag !== null ? (tag.tagName || tag.name || "") : String(tag || "");
      return !sourceTags.includes(name);
    });
  }
  
  db.assets.forEach((asset) => {
    if (asset.customTags) {
      const hasSourceTag = sourceTags.some((tag) => asset.customTags.includes(tag));
      if (hasSourceTag) {
        asset.customTags = [...new Set([...asset.customTags.filter((tag) => !sourceTags.includes(tag)), targetTag])];
        asset.updatedAt = nowText();
        asset.logs.unshift(`${currentUser.name} 将标签 ${sourceTags.join("、")} 合并到 ${targetTag}`);
      }
    }
  });
  saveDb();
  closeMergeTagModal();
  showToast(`已将 ${sourceTags.join("、")} 合并到「${targetTag}」`);
  renderTagsPage();
}

function closeMergeTagModal() {
  document.querySelector("#mergeTagModal").classList.add("hidden");
}

function clearMergeTagSelection() {
  document.querySelectorAll("#mergeSourceTags input[name='mergeSourceTag']").forEach((input) => {
    input.checked = false;
  });
  updateMergeTagSelectionCount();
}

function updateMergeTagSelectionCount() {
  const count = document.querySelectorAll("#mergeSourceTags input[name='mergeSourceTag']:checked").length;
  const countText = document.querySelector("#mergeSelectedCount");
  if (countText) countText.textContent = `已勾选 ${count} 个标签`;
}

function collectActivityRows() {
  return db.assets
    .flatMap((asset) => (asset.logs || []).map((text, index) => ({
      asset,
      text,
      time: index === 0 ? asset.updatedAt : asset.createdAt,
    })))
    .sort((a, b) => String(b.time).localeCompare(String(a.time)))
    .slice(0, 50);
}
