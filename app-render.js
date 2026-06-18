function render() {
  updateGroupCounts();
  renderGroups();
  renderFilterChips();
  const showGroupsInput = document.querySelector("#showGroups");
  if (showGroupsInput) showGroupsInput.checked = state.showGroupDescendants;
  document.querySelectorAll(".nav-item").forEach((button) => {
    const morePage = ["activity", "share", "collect", "recycle", "validity"].includes(state.page);
    button.classList.toggle("active", button.dataset.page === state.page || (morePage && button.dataset.page === "more"));
  });
  els.assetToolbar.classList.toggle("hidden", !["all", "pending", "favorite", "created"].includes(state.page));
  els.similarSearch.classList.toggle("hidden", !state.similar || state.page !== "all");
  if (state.similar && state.page === "all") {
    const similarAsset = findAsset(state.selectedAssetId);
    const similarImage = document.querySelector("#similarSearchImage");
    if (similarImage && similarAsset) similarImage.src = similarAsset.src;
  }

  const titleMap = {
    all: getGroupName(state.groupId) || "全部素材",
    pending: "待入库",
    favorite: "我收藏的组",
    created: "我创建的组",
    activity: "用户动态",
    tags: "标签管理",
    collect: "收集素材管理",
    share: "分享记录",
    recycle: "回收站",
    validity: "有效期管理",
  };
  els.pageTitle.textContent = titleMap[state.page] || "全部素材";
  els.breadcrumb.textContent = getPageBreadcrumb(state.page);
  renderActions();

  if (["activity", "collect", "share", "recycle", "validity"].includes(state.page)) renderManagePageV2();
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
  if (state.page === "activity") {
    const rows = collectActivityRows();
    els.contentPanel.innerHTML = renderManageShell("activity", "用户动态", `共 ${rows.length} 条动态`, `
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

  if (state.page === "share") {
    els.contentPanel.innerHTML = renderManageShell("share", "分享记录", `共 ${db.shares.length} 条分享记录`, `
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
    els.contentPanel.innerHTML = renderManageShell("recycle", "回收站", `共 ${deletedAssets.length} 项`, `
      <div class="manage-list-wrap">
        ${deletedAssets.length ? renderList(deletedAssets) : renderEmpty("暂无素材")}
      </div>
    `);
    bindAssetEvents();
    return;
  }

  if (state.page === "collect") {
    els.contentPanel.innerHTML = renderManageShell("collect", "收集素材管理", `共 ${db.collectTasks.length} 条收集任务`, `
      <div class="manage-row-between">
        <div class="asset-toolbar inline-toolbar"><label>主题<input placeholder="输入收集主题" /></label><label>状态<input placeholder="生效中 / 已失效" /></label></div>
        <button id="newCollectTask" type="button">新建收集任务</button>
      </div>
      <div class="table-scroll"><table class="records-table manage-table">
        <colgroup><col style="width:180px"><col style="width:180px"><col style="width:110px"><col style="width:90px"><col style="width:150px"><col style="width:150px"><col style="width:90px"><col style="width:100px"><col style="width:110px"></colgroup>
        <thead><tr><th>主题</th><th>存放素材组</th><th>状态</th><th>访问密码</th><th>创建时间</th><th>失效时间</th><th>创建人</th><th>备注</th><th>操作</th></tr></thead>
        <tbody>${db.collectTasks.map((task, index) => `<tr><td><span class="cell-ellipsis" title="${escapeAttr(task.theme)}">${escapeHtml(task.theme)}</span></td><td><span class="cell-ellipsis" title="${escapeAttr(task.group)}">${escapeHtml(task.group)}</span></td><td><span class="status-dot ${task.status === "生效中" ? "ok" : "off"}"></span>${task.status}</td><td>${task.code}</td><td>${task.createdAt}</td><td>${task.expiresAt}</td><td>${escapeHtml(task.creator)}</td><td>-</td><td><button class="link-button" data-open-collect="${index}" type="button">${isAdmin() || task.creator === currentUser.name ? "管理邀请" : "查看"}</button></td></tr>`).join("")}</tbody>
      </table></div>
    `);
    els.contentPanel.querySelector("#newCollectTask")?.addEventListener("click", () => openCollectTaskModal());
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
  els.contentPanel.innerHTML = renderManageShell("validity", "有效期管理", `共 ${assets.length} 条有效期记录`, `
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

function renderManageShell(active, title, subtitle, body) {
  return `
    <div class="manage-layout">
      <section class="manage-main">
        <div class="manage-head"><h1>${title} <small>${subtitle}</small></h1></div>
        ${renderMoreMenuPanel(active)}
        ${body}
      </section>
    </div>`;
}

function renderMoreMenuPanel(active) {
  const items = [["activity", "用户动态"], ["tags", "标签管理"], ["validity", "有效期管理"], ["collect", "收集素材"], ["share", "分享记录"], ["recycle", "回收站"]];
  return `<div class="menu-pop side-pop">${items.map(([id, label]) => `<button class="${active === id ? "active-side" : ""}" data-panel-page="${id}" type="button">${label}</button>`).join("")}</div>`;
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

function getTagSummary() {
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
      tagCode:   tag.tagCode || "",
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

  return {
    businessTags: [...businessTags.entries()]
      .map(([name, count]) => ({ ...(tagMap.get(name) || {}), tagName: name, name, count, parentId: 0, level: 0 }))
      .sort((a, b) => b.count - a.count),
    aiTags: flatAiTree,
    aiTagTree: flatAiTree, // filtered sort
    flatAiTags: flattenAiTags(flatAiTree),
    tagMap,
  };
}

function renderTagsPage() {
  const { businessTags, aiTags } = getTagSummary();
  els.contentPanel.innerHTML = renderManageShell("tags", "标签管理", `业务标签 ${businessTags.length} 个 · AI标签 ${aiTags.length} 个`, `
    <div class="manage-row-between">
      <div class="tabs">
        <button class="active" id="tagTabBusiness" type="button">业务标签</button>
        <button id="tagTabAI" type="button">AI标签</button>
      </div>
      <div class="tag-actions">
        <button id="addTagButton" type="button"><span data-icon="plus"></span> 新增标签</button>
        <button id="mergeTagButton" type="button">标签合并</button>
      </div>
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
          <thead id="tagTableHead"></thead>
          <tbody id="tagTableBody"></tbody>
        </table>
      </div>
    </div>
  `);

  renderTagTableBody(businessTags, "business");

  document.querySelector("#tagTabBusiness")?.addEventListener("click", () => {
    setActiveTab("tagTabBusiness", ["tagTabAI"]);
    document.querySelector("#addTagButton")?.classList.remove("hidden");
    document.querySelector("#mergeTagButton")?.classList.remove("hidden");
    const { businessTags: bt } = getTagSummary();
    renderTagTableBody(bt, "business");
  });

  document.querySelector("#tagTabAI")?.addEventListener("click", () => {
    setActiveTab("tagTabAI", ["tagTabBusiness"]);
    document.querySelector("#addTagButton")?.classList.remove("hidden");
    document.querySelector("#mergeTagButton")?.classList.add("hidden");
    const { flatAiTags: at } = getTagSummary();
    renderTagTableBody(at, "ai");
  });

  function setActiveTab(activeId, inactiveIds) {
    document.getElementById(activeId)?.classList.add("active");
    inactiveIds.forEach((id) => document.getElementById(id)?.classList.remove("active"));
  }

  els.contentPanel.querySelector("#addTagButton")?.addEventListener("click", openAddTagModal);
  els.contentPanel.querySelector("#mergeTagButton")?.addEventListener("click", openMergeTagModal);
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
  if (!tbody || !thead) return;

  // --- business: flat table ---
  if (type === "business") {
    thead.innerHTML = `<tr>
      <th>#</th><th>标签名称</th><th>标签编码</th><th>标签描述</th><th>创建时间</th><th>创建人</th><th>操作</th>
    </tr>`;

    const rows = tags.map((tag, idx) => {
      const name   = tag.tagName || tag.name || "-";
      const code   = tag.tagCode || "-";
      const desc   = tag.description || "-";
      const ctime  = tag.createdAt ? tag.createdAt.split(" ")[0] : "-";
      const cby    = tag.createdBy || "-";
      const count  = tag.count || 0;
      return `<tr>
        <td class="cell-mono">${escapeHtml(String(idx + 1))}</td>
        <td>
          <div class="tag-name-cell">
            <span class="tag-type-badge" title="业务标签">B</span>
            <strong>${escapeHtml(name)}</strong>
            <span class="tag-count-badge" title="使用次数">${count} 次</span>
          </div>
        </td>
        <td class="cell-mono">${escapeHtml(code)}</td>
        <td class="cell-ellipsis">${escapeHtml(desc)}</td>
        <td>${escapeHtml(ctime)}</td>
        <td>${escapeHtml(cby)}</td>
        <td>
          <div class="tag-table-actions">
            <button class="op-button" data-edit-tag="${escapeAttr(name)}" type="button" title="编辑"><span data-icon="edit"></span></button>
            <button class="op-button" data-merge-tag="${escapeAttr(name)}" type="button" title="合并到分组"><span data-icon="merge"></span></button>
          </div>
        </td>
      </tr>`;
    });

    tbody.innerHTML = rows.length
      ? rows.join("")
      : `<tr><td colspan="7" class="empty-cell">暂无业务标签</td></tr>`;

    tbody.querySelectorAll("[data-edit-tag]").forEach((btn) => {
      btn.addEventListener("click", () => openEditTagModal(btn.dataset.editTag));
    });
    tbody.querySelectorAll("[data-merge-tag]").forEach((btn) => {
      btn.addEventListener("click", () => openMergeTagModal(btn.dataset.mergeTag));
    });
    return;
  }

  // --- AI: tree table with indent ---
  thead.innerHTML = `<tr>
    <th>#</th><th>标签名称</th><th>标签编码</th><th>父标签名称</th><th>AI来源</th><th>AI识别</th><th>创建时间</th><th>操作</th>
  </tr>`;

  const aiSourceLabel = { 1: "AI 自动识别", 2: "业务预定义" };
  const aiSourceClass = { 1: "ai-source-auto", 2: "ai-source-predef" };

  const rows = tags.map((tag, idx) => {
    const name   = tag.tagName || tag.name || "-";
    const code   = tag.tagCode || "-";
    const parent = tag.parentName || "-";
    const src    = aiSourceLabel[tag.aiSource] || "—";
    const srcCls = aiSourceClass[tag.aiSource] || "";
    const recog  = tag.aiRecognitionEnabled ? `<span class="badge-on">启用</span>` : `<span class="badge-off">未启用</span>`;
    const ctime  = tag.createdAt ? tag.createdAt.split(" ")[0] : "-";
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
      <td>${escapeHtml(parent)}</td>
      <td><span class="ai-source-tag ${srcCls}">${escapeHtml(src)}</span></td>
      <td>${recog}</td>
      <td>${escapeHtml(ctime)}</td>
      <td>
        <div class="tag-table-actions">
          <button class="op-button" data-edit-tag="${escapeAttr(name)}" type="button" title="编辑"><span data-icon="edit"></span></button>
        </div>
      </td>
    </tr>`;
  });

  tbody.innerHTML = rows.length
    ? rows.join("")
    : `<tr><td colspan="8" class="empty-cell">暂无AI标签</td></tr>`;

  tbody.querySelectorAll("[data-edit-tag]").forEach((btn) => {
    btn.addEventListener("click", () => openEditTagModal(btn.dataset.editTag));
  });
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

function openAddTagModal() {
  document.querySelector("#addTagName").value = "";
  document.querySelector("#addTagCode").value = "";
  document.querySelector("#addTagDesc").value = "";
  document.querySelector("#addTagType").value = "1"; // default business
  document.querySelector("#addTagAiSource").value = "";
  document.querySelector("#addTagAiRecognition").checked = true;
  
  // AI parent options
  const aiParentNames = (db.tags || [])
    .filter(t => typeof t === "object" && t !== null)
    .filter(t => (t.tagType ?? (t.system ? 2 : 1)) === 2) // AI tags
    .map(t => t.tagName || t.name || "").filter(Boolean);
  document.querySelector("#addTagParentId").innerHTML = `<option value="">无（顶级标签）</option>${aiParentNames.map(name => `<option value="${escapeAttr(name)}">${escapeHtml(name)}</option>`).join("")}`;
  document.querySelector("#addTagParentId").value = "";

  // Toggle AI-specific fields
  toggleAddAiFields();

  document.querySelector("#addTagModal").classList.remove("hidden");
}

function toggleAddAiFields() {
  const type = document.querySelector("#addTagType")?.value;
  const aiRow = document.querySelector("#addTagAiRow");
  const parentRow = document.querySelector("#addTagParentRow");
  if (aiRow) aiRow.style.display = type === "2" ? "" : "none";
  if (parentRow) parentRow.style.display = type === "2" ? "" : "none";
}

function handleAddTagSubmit(event) {
  event.preventDefault();
  const form = event.target;
  const data = Object.fromEntries(new FormData(form));
  const tagName = (data.tagName || "").trim();
  const tagCode = (data.tagCode || "").trim();
  const tagType = parseInt(data.tagType || "1", 10);
  const parentId = tagType === 2 ? (data.parentId || 0) : 0;
  const description = (data.tagDesc || "").trim();

  if (!tagName) { showToast("请输入标签名称"); return; }
  if (!db.tags) db.tags = [];

  const dup = db.tags.find(t => (t.tagName || t.name || "").trim() === tagName);
  if (dup) { showToast("该标签已存在"); return; }

  const newTag = {
    id: `tag-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    tagName,
    tagCode: tagCode || (tagName.toLowerCase().replace(/\s+/g, "_")),
    tagType,
    parentId: parentId,
    level: parentId ? 1 : 0,
    aiSource: tagType === 2 ? (parseInt(data.aiSource || "0", 10) || 2) : 0,
    aiRecognitionEnabled: tagType === 2 ? !!data.aiRecognition : true,
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

function openEditTagModal(oldName) {
  editTagOldName = oldName;
  const tag = (db.tags || []).find(t => (t.tagName || t.name || "") === oldName);
  if (!tag) return;

  const tagName = tag.tagName || tag.name || "";
  const tagType = tag.tagType ?? (tag.system ? 2 : 1);

  document.querySelector("#editTagOldName").textContent = escapeHtml(tagName);
  document.querySelector("#editTagNewName").value = tagName;
  document.querySelector("#editTagCode").value = tag.tagCode || "";
  document.querySelector("#editTagDesc").value = tag.description || "";
  document.querySelector("#editTagType").value = String(tagType);
  document.querySelector("#editTagAiSource").value = String(tag.aiSource || 0);
  document.querySelector("#editTagAiRecognition").checked = tag.aiRecognitionEnabled !== 0;

  // AI parent options
  const aiParentNames = (db.tags || [])
    .filter(t => typeof t === "object" && t !== null)
    .filter(t => (t.tagType ?? (t.system ? 2 : 1)) === 2)
    .map(t => t.tagName || t.name || "").filter(Boolean)
    .filter(n => n !== tagName);
  document.querySelector("#editTagParentId").innerHTML = `<option value="">无（顶级标签）</option>${aiParentNames.map(n => `<option value="${escapeAttr(n)}" ${n === tag.parentId ? "selected" : ""}>${escapeHtml(n)}</option>`).join("")}`;

  toggleEditAiFields();
  document.querySelector("#editTagModal").classList.remove("hidden");
}

function toggleEditAiFields() {
  const type = document.querySelector("#editTagType")?.value;
  const aiRow = document.querySelector("#editTagAiRow");
  const parentRow = document.querySelector("#editTagParentRow");
  if (aiRow) aiRow.style.display = type === "2" ? "" : "none";
  if (parentRow) parentRow.style.display = type === "2" ? "" : "none";
}

function handleEditTagSubmit(event) {
  event.preventDefault();
  const form = event.target;
  const data = Object.fromEntries(new FormData(form));
  const newName = (data.tagName || "").trim();
  const oldName = editTagOldName;
  if (!newName) { showToast("请输入标签名称"); return; }

  const tagIdx = (db.tags || []).findIndex(t => (t.tagName || t.name || "") === oldName);
  if (tagIdx === -1) { closeEditTagModal(); return; }

  const tag = db.tags[tagIdx];
  db.tags[tagIdx] = {
    ...tag,
    tagName: newName,
    tagCode: (data.tagCode || "").trim() || (newName.toLowerCase().replace(/\s+/g, "_")),
    tagType: parseInt(data.tagType || "1", 10),
    parentId: parseInt(data.tagType || "1", 10) === 2 ? (data.parentId || 0) : 0,
    level: (parseInt(data.tagType || "1", 10) === 2 && data.parentId) ? 1 : 0,
    aiSource: parseInt(data.tagType || "1", 10) === 2 ? (parseInt(data.aiSource || "0", 10) || 2) : 0,
    aiRecognitionEnabled: parseInt(data.tagType || "1", 10) === 2 ? !!data.aiRecognition : true,
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
  const { businessTags } = getTagSummary();
  const tagNames = businessTags.map(t => t.tagName || t.name || "").filter(Boolean);
  const tagOptions = tagNames.map((name) => `<option value="${escapeAttr(name)}">${escapeHtml(name)}</option>`).join("");

  document.querySelector("#mergeSourceTags").innerHTML = tagOptions;
  document.querySelector("#mergeTargetTag").innerHTML = tagOptions;
  if (preselectTag) {
    const sourceSelect = document.querySelector("#mergeSourceTags");
    const option = sourceSelect.querySelector(`option[value="${escapeAttr(preselectTag)}"]`);
    if (option) option.selected = true;
  }
  document.querySelector("#mergeTagModal").classList.remove("hidden");
}

function handleMergeTagSubmit(event) {
  event.preventDefault();
  const sourceSelect = document.querySelector("#mergeSourceTags");
  const targetTag = document.querySelector("#mergeTargetTag").value;
  const sourceTags = [...sourceSelect.selectedOptions].map((opt) => opt.value);

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
