function openBasketDrawer() {
  renderBasketDrawer();
  document.querySelector("#basketOverlay")?.classList.remove("hidden");
  document.querySelector("#basketDrawer")?.classList.remove("hidden");
}

function closeBasketDrawer() {
  document.querySelector("#basketOverlay")?.classList.add("hidden");
  document.querySelector("#basketDrawer")?.classList.add("hidden");
}

function renderBasketDrawer() {
  const assets = getSelectedAssets();
  
  document.querySelector("#basketCountText").textContent = `已选择 ${assets.length} 项素材`;
  
  const basketList = document.querySelector("#basketList");
  basketList.innerHTML = assets.map((asset) => `
    <article class="basket-item" data-asset-id="${asset.id}">
      <div class="basket-thumb">${renderTableThumb(asset)}</div>
      <div>
        <strong title="${escapeAttr(asset.name)}">${escapeHtml(asset.name)}</strong>
        <span>${escapeHtml(asset.format || "-")} · ${formatBytes(asset.sizeBytes)}</span>
        <small>有效期：${escapeHtml(formatAssetValidUntil(asset))}</small>
      </div>
      <button data-remove-basket="${asset.id}" type="button" title="移出素材篮"><span data-icon="x"></span></button>
    </article>`).join("") || `<div class="basket-empty">${renderEmpty("暂无已选素材")}</div>`;
  
  const hasAssets = assets.length > 0;
  document.querySelector("#basketClear").disabled = !hasAssets;
  document.querySelector("#basketDelete").disabled = !hasAssets;
  document.querySelector("#basketValidity").disabled = !hasAssets;
  document.querySelector("#basketShare").disabled = !hasAssets;
  document.querySelector("#basketDownload").disabled = !hasAssets;
}

function openBasketValidityModal() {
  const assets = getSelectedAssets();
  if (!assets.length) return showToast("请先选择素材");
  
  document.querySelector("#basketValidityCount").textContent = `${assets.length} 项素材`;
  document.querySelector("#basketValidityDate").value = todayText();
  document.querySelector("#basketValidityTime").value = "23:59";
  document.querySelector("#basketValidityModal").classList.remove("hidden");
}

function closeBasketValidityModal() {
  document.querySelector("#basketValidityModal").classList.add("hidden");
}

function openBasketShareModal() {
  const assets = getSelectedAssets();
  if (!assets.length) return showToast("请先选择素材");
  if (!assets.every(asset => canCreateShare(asset, "view"))) {
    return showToast("部分素材没有分享权限");
  }
  
  document.querySelector("#basketShareCount").textContent = `${assets.length} 项素材`;
  document.querySelector("#basketShareLink").value = "";
  document.querySelector("#basketShareCopy").disabled = true;
  document.querySelector("#basketShareRequirePassword").checked = false;
  document.querySelector("#basketSharePassword").value = "";
  document.querySelector("#basketShareMaxVisits").value = "";
  
  populateShareDropdowns("basket");
  bindShareExpireButtons("basket");
  bindSharePasswordToggle("basket");
  bindShareAccessScopeChange("basket");
  
  const canDownload = assets.every(asset => canDownloadAsset(asset));
  const canManage = assets.every(asset => canManageAsset(asset));
  updateShareContentPermissionOptions("basket", canDownload);
  updateShareAccessScopeOptions("basket", canManage);
  
  document.querySelector("#basketShareModal").classList.remove("hidden");
  initProjectDatePickers(document.querySelector("#basketShareModal"));
}

function closeBasketShareModal() {
  document.querySelector("#basketShareModal").classList.add("hidden");
}

let shareGroupCreatedLink = "";

function openShareCurrentModal() {
  const hasSelected = state.selectedIds && state.selectedIds.size > 0;
  if (!hasSelected) {
    return showToast("请先选中要分享的素材");
  }
  
  const groupName = getGroupName(state.groupId);
  if (!canCreateShare({ id: state.groupId, type: "group" }, "view")) {
    return showToast("权限不足，无法分享该素材组。请联系管理员申请权限。");
  }
  shareGroupCreatedLink = "";
  
  document.querySelector("#shareGroupName").textContent = escapeHtml(groupName);
  document.querySelector("#shareGroupLink").value = "";
  document.querySelector("#shareGroupCopy").disabled = true;
  document.querySelector("#shareGroupRequirePassword").checked = false;
  document.querySelector("#shareGroupPassword").value = "";
  document.querySelector("#shareGroupMaxVisits").value = "";
  
  populateShareDropdowns("group");
  bindShareExpireButtons("group");
  bindSharePasswordToggle("group");
  bindShareAccessScopeChange("group");
  
  const canDownload = canDownloadFromGroup(state.groupId);
  const canManage = canManageGroup(state.groupId);
  updateShareContentPermissionOptions("group", canDownload);
  updateShareAccessScopeOptions("group", canManage);
  
  document.querySelector("#shareGroupModal").classList.remove("hidden");
  initProjectDatePickers(document.querySelector("#shareGroupModal"));
}

function handleShareGroupSubmit(event) {
  event.preventDefault();
  if (shareGroupCreatedLink) return;
  
  const formData = getShareFormData("group");
  if (!formData) {
    showToast("请设置访问密码");
    return;
  }
  
  const group = db.groups.find((g) => g.id === state.groupId);
  if (!group) return;
  
  if (!canCreateShare(group, formData.contentPermission)) {
    showToast("没有权限创建分享链接");
    return;
  }
  
  const code = Math.random().toString(36).slice(2, 8);
  const link = getShareLink("group", state.groupId, code);
  const groupName = getGroupName(state.groupId);
  
  db.shares.unshift({ 
    id: `share-${Date.now()}`,
    group: groupName, 
    user: currentUser.username, 
    access: formData.shareName || "分享素材组", 
    visits: 0, 
    views: 0, 
    downloads: 0, 
    sharedAt: nowText(), 
    expiresAt: formData.expiresAt, 
    targetType: "group", 
    targetId: state.groupId, 
    code, 
    link, 
    requirePassword: formData.requirePassword,
    password: formData.password,
    accessScope: formData.accessScope,
    contentPermission: formData.contentPermission,
    maxVisits: formData.maxVisits,
    status: "active",
    ownedBy: currentUser.username,
    ownedByDept: currentUser.department || "",
    createdBy: currentUser.username,
    updatedAt: nowText(),
    logs: []
  });
  logOperation('share', link, groupName, 'share.create', '创建了分享链接');
  saveDb();
  shareGroupCreatedLink = link;
  document.querySelector("#shareGroupLink").value = link;
  document.querySelector("#shareGroupPassword").value = formData.password;
  document.querySelector("#shareGroupCopy").disabled = false;
  showToast("分享记录已创建，链接已生成");
}

function closeShareGroupModal() {
  document.querySelector("#shareGroupModal").classList.add("hidden");
}

function openShareRecordConfigModal(index) {
  const share = db.shares[index];
  if (!share) return;
  if (!canManageShare(share)) {
    showToast("没有权限修改分享配置");
    return;
  }
  normalizeShareSecurity(share);
  const link = share.link || getShareLink(share.targetType || "group", share.targetId || "all", share.code || "legacy");
  const expiresAtParts = share.expiresAt === "永久有效" ? { date: "", time: "" } : splitDateTimeText(share.expiresAt);
  const html = renderHtmlTemplate("tplShareRecordConfigForm", {
    QR_URL: escapeAttr(getQrImageUrl(link)),
    GROUP: escapeHtml(share.group),
    ACCESS: escapeAttr(share.access),
    LINK: escapeAttr(link),
    EXPIRE_DATE: escapeAttr(toInputDateValue(expiresAtParts.date)),
    EXPIRE_TIME: escapeAttr(expiresAtParts.time),
    PASSWORD_CHECKED: share.requirePassword ? "checked" : "",
    PASSWORD: escapeAttr(share.password || ""),
    REQUIRED_ATTR: "",
  });
  openFormModal("分享记录操作", html, (form) => {
    const data = Object.fromEntries(new FormData(form));
    const shareStatusConfig = getShareStatusConfig();
    const newStatus = data.status || shareStatusConfig.active;
    const shareId = share.id || share.code || `share-${Date.now()}`;
    const security = buildShareSecurity(data);
    Object.assign(share, security);
    if (newStatus === shareStatusConfig.revoked || newStatus === shareStatusConfig.expired) {
      share.expiresAt = nowText();
      share.status = newStatus;
      logOperation('share', shareId, share.group || share.targetType, 'share.revoke', newStatus === shareStatusConfig.revoked ? '失效了分享链接（已撤销）' : '分享链接已过期');
    } else {
      share.expiresAt = formDateTimeValue(data, "expiresAt") || "永久有效";
      share.status = shareStatusConfig.active;
      logOperation('share', shareId, share.group || share.targetType, 'share.update', '修改了分享配置');
    }
    saveDb();
    closeFormModal();
    render();
    showToast(security.requirePassword && !String(data.password || "").trim() ? `分享记录已保存，访问密码：${security.password}` : "分享记录已保存");
  });
  // 分享状态下拉：从值列表 share_status 动态生成（含生效中/已撤销/已过期）
  const shareStatusConfig = getShareStatusConfig();
  const statusSelect = document.querySelector("#formModal")?.querySelector("[name='status']");
  if (statusSelect) {
    const statusOptions = getAllLeafValues("share_status");
    statusSelect.innerHTML = statusOptions.map((opt) => `<option value="${opt.code}">${escapeHtml(opt.name)}</option>`).join("");
    statusSelect.value = share.status || shareStatusConfig.active;
  }
  document.querySelector("#copyShareRecordLink")?.addEventListener("click", () => copyText(link));
  document.querySelector("#openShareRecordLink")?.addEventListener("click", () => window.open(link, "_blank"));
}

let shareAssetCreatedLink = "";
let shareAssetId = "";

function openShareAssetModal(id) {
  const asset = findAsset(id);
  if (!asset) return;
  if (!canCreateShare(asset, "view")) {
    showToast("没有权限创建分享链接");
    return;
  }
  shareAssetCreatedLink = "";
  shareAssetId = id;
  
  document.querySelector("#shareAssetName").textContent = escapeHtml(asset.name);
  document.querySelector("#shareAssetLink").value = "";
  document.querySelector("#shareAssetCopy").disabled = true;
  document.querySelector("#shareAssetRequirePassword").checked = false;
  document.querySelector("#shareAssetPassword").value = "";
  document.querySelector("#shareAssetMaxVisits").value = "";
  
  populateShareDropdowns("asset");
  bindShareExpireButtons("asset");
  bindSharePasswordToggle("asset");
  bindShareAccessScopeChange("asset");
  
  const canDownload = canDownloadAsset(asset);
  const canManage = canManageAsset(asset);
  updateShareContentPermissionOptions("asset", canDownload);
  updateShareAccessScopeOptions("asset", canManage);
  
  document.querySelector("#shareAssetModal").classList.remove("hidden");
  initProjectDatePickers(document.querySelector("#shareAssetModal"));
}

function populateShareDropdowns(prefix) {
  const accessScopeOptions = getTreeChildren("vl_dim_share_scope").map((node) => `<option value="${node.code}">${escapeHtml(node.name)}</option>`).join("");
  document.querySelector(`#${prefix}ShareAccessScope`).innerHTML = accessScopeOptions;
  
  const contentPermissionOptions = getTreeChildren("vl_dim_share_perm").map((node) => `<option value="${node.code}">${escapeHtml(node.name)}</option>`).join("");
  document.querySelector(`#${prefix}ShareContentPermission`).innerHTML = contentPermissionOptions;
}

function bindShareExpireButtons(prefix) {
  const buttons = document.querySelectorAll(`#${prefix}ShareForm .expire-btn`);
  buttons.forEach((btn) => {
    const newBtn = btn.cloneNode(true);
    btn.parentNode.replaceChild(newBtn, btn);
    newBtn.addEventListener("click", (event) => {
      event.preventDefault();
      const type = newBtn.dataset.expire;
      document.querySelectorAll(`#${prefix}ShareForm .expire-btn`).forEach((b) => b.classList.remove("active"));
      newBtn.classList.add("active");
      
      if (type === "forever") {
        document.querySelector(`#${prefix}ShareExpireDate`).value = "";
        document.querySelector(`#${prefix}ShareExpireTime`).value = "";
      } else {
        const days = parseInt(type);
        const expireDate = new Date();
        expireDate.setDate(expireDate.getDate() + days);
        document.querySelector(`#${prefix}ShareExpireDate`).value = expireDate.toISOString().split("T")[0];
        document.querySelector(`#${prefix}ShareExpireTime`).value = "23:59";
      }
    });
  });
  
  document.querySelector(`#${prefix}ShareForm .expire-btn[data-expire="7"]`)?.click();
}

function bindSharePasswordToggle(prefix) {
  const checkbox = document.querySelector(`#${prefix}ShareRequirePassword`);
  const passwordField = document.querySelector(`#${prefix}SharePasswordField`);
  
  const newCheckbox = checkbox.cloneNode(true);
  checkbox.parentNode.replaceChild(newCheckbox, checkbox);
  newCheckbox.addEventListener("change", () => {
    passwordField.classList.toggle("hidden", !newCheckbox.checked);
  });
}

function bindShareAccessScopeChange(prefix) {
  const select = document.querySelector(`#${prefix}ShareAccessScope`);
  const notice = document.querySelector(`#${prefix}SharePublicNotice`);
  
  const newSelect = select.cloneNode(true);
  select.parentNode.replaceChild(newSelect, select);
  newSelect.addEventListener("change", () => {
    notice.classList.toggle("hidden", newSelect.value !== "public");
  });
}

function updateShareContentPermissionOptions(prefix, canDownload) {
  document.querySelectorAll(`#${prefix}ShareContentPermission option`).forEach((option) => {
    if (option.value === "download") {
      option.disabled = !canDownload;
    }
  });
}

function updateShareAccessScopeOptions(prefix, canManage) {
  document.querySelectorAll(`#${prefix}ShareAccessScope option`).forEach((option) => {
    if (option.value === "public") {
      option.disabled = !canManage;
    }
  });
}

function getShareFormData(prefix) {
  const form = document.querySelector(`#${prefix}ShareForm`);
  const data = Object.fromEntries(new FormData(form));
  
  const expireDate = document.querySelector(`#${prefix}ShareExpireDate`).value;
  const expireTime = document.querySelector(`#${prefix}ShareExpireTime`).value;
  const expiresAt = expireDate ? joinDateTime(expireDate, expireTime || "23:59") : "永久有效";
  
  const requirePassword = data.requirePassword === "on";
  const password = requirePassword ? data.password : "";
  if (requirePassword && !password) {
    return null;
  }
  
  const maxVisits = data.maxVisits ? parseInt(data.maxVisits) : null;
  
  return {
    accessScope: data.accessScope,
    contentPermission: data.contentPermission,
    expiresAt,
    requirePassword,
    password,
    maxVisits,
    shareName: data.shareName,
  };
}

function handleShareAssetSubmit(event) {
  event.preventDefault();
  if (shareAssetCreatedLink) return;
  
  const formData = getShareFormData("asset");
  if (!formData) {
    showToast("请设置访问密码");
    return;
  }
  
  const asset = findAsset(shareAssetId);
  if (!asset) return;
  
  if (!canCreateShare(asset, formData.contentPermission)) {
    showToast("没有权限创建分享链接");
    return;
  }
  
  const code = Math.random().toString(36).slice(2, 8);
  const link = getShareLink("asset", shareAssetId, code);
  
  db.shares.unshift({ 
    id: `share-${Date.now()}`,
    group: asset.name, 
    user: currentUser.username, 
    access: formData.shareName || "分享素材", 
    visits: 0, 
    views: 0, 
    downloads: 0, 
    sharedAt: nowText(), 
    expiresAt: formData.expiresAt, 
    targetType: "asset", 
    targetId: shareAssetId, 
    code, 
    link, 
    requirePassword: formData.requirePassword,
    password: formData.password,
    accessScope: formData.accessScope,
    contentPermission: formData.contentPermission,
    maxVisits: formData.maxVisits,
    status: "active",
    ownedBy: currentUser.username,
    ownedByDept: currentUser.department || "",
    createdBy: currentUser.username,
    updatedAt: nowText(),
    logs: []
  });
  asset.share += 1;
  logOperation('share', link, asset.name, 'share.create', '创建了分享链接');
  logOperation('asset', asset.id, asset.name, 'asset.edit', '分享了素材');
  saveDb();
  render();
  if (!els.viewer.classList.contains("hidden")) renderViewer();
  shareAssetCreatedLink = link;
  document.querySelector("#shareAssetLink").value = link;
  document.querySelector("#shareAssetPassword").value = formData.password;
  document.querySelector("#shareAssetCopy").disabled = false;
  showToast("分享链接已生成");
}

function closeShareAssetModal() {
  document.querySelector("#shareAssetModal").classList.add("hidden");
}

function openCollectTaskConfigModal(taskId) {
  const task = db.collectTasks.find((t) => t.id === taskId) || db.collectTasks[taskId];
  if (!task) return;
  const link = getCollectLink(task.code);
  const expiresAtParts = splitDateTimeText(task.expiresAt);
  const auditStatusName = getTreeNodeByCode(task.auditStatus, "audit_status")?.name || task.auditStatus || "待提交";
  const html = renderHtmlTemplate("tplCollectTaskConfigForm", {
    QR_URL: escapeAttr(getQrImageUrl(link)),
    THEME: escapeHtml(task.theme),
    CODE: escapeAttr(task.code),
    LINK: escapeAttr(link),
    EXPIRE_DATE: escapeAttr(toInputDateValue(expiresAtParts.date)),
    EXPIRE_TIME: escapeAttr(expiresAtParts.time),
    REQUIRED_ATTR: task.status === getCollectTaskStatusConfig().active ? "required" : "",
    AUDIT_STATUS: escapeAttr(auditStatusName),
  });
  openFormModal("收集任务配置", html, (form) => {
    if (!canManageCollect(task)) {
      showToast("没有权限管理收集任务");
      return;
    }
    const data = Object.fromEntries(new FormData(form));
    const oldStatus = task.status;
    const taskStatusConfig = getCollectTaskStatusConfig();
    task.status = data.status || taskStatusConfig.active;
    task.updatedAt = nowText();
    if (task.status === taskStatusConfig.expired) {
      task.expiresAt = nowText();
      logOperation('collect', task.id, task.theme, 'collect.close', '关闭了收集任务');
    } else if (data.expiresAtDate && data.expiresAtTime) {
      task.expiresAt = `${data.expiresAtDate} ${data.expiresAtTime}`;
    }
    saveDb();
    closeFormModal();
    render();
    showToast("收集任务已保存");
  });
  const modalEl = document.querySelector("#formModal");
  const taskStatusConfig = getCollectTaskStatusConfig();
  const statusOptions = getAllLeafValues("collect_task_status");
  const statusSelect = modalEl?.querySelector("[name='status']");
  if (statusSelect) {
    statusSelect.innerHTML = statusOptions.map((opt) => `<option value="${opt.code}">${escapeHtml(opt.name)}</option>`).join("");
    statusSelect.value = task.status || taskStatusConfig.active;
  }
  const expiresInputs = modalEl?.querySelectorAll("[name='expiresAtDate'], [name='expiresAtTime']") || [];
  if (task.status === taskStatusConfig.active) {
    expiresInputs.forEach((input) => {
      input.required = true;
      input.removeAttribute("readonly");
    });
  } else {
    expiresInputs.forEach((input) => {
      input.required = false;
      input.setAttribute("readonly", "readonly");
    });
  }
  statusSelect?.addEventListener("change", (event) => {
    const expiresInputs = modalEl?.querySelectorAll("[name='expiresAtDate'], [name='expiresAtTime']") || [];
    if (event.target.value === taskStatusConfig.active) {
      expiresInputs.forEach((input) => {
        input.required = true;
        input.removeAttribute("readonly");
      });
    } else {
      expiresInputs.forEach((input) => {
        input.required = false;
        input.setAttribute("readonly", "readonly");
      });
    }
  });
  document.querySelector("#copyCollectLink")?.addEventListener("click", () => copyText(link));
  document.querySelector("#openCollectLink")?.addEventListener("click", () => window.open(link, "_blank"));
  document.querySelector("#simulateCollectUpload")?.addEventListener("click", () => openCollectorUploadModal(task.id));
}

function openCollectorUploadModal(taskId) {
  const task = db.collectTasks.find((t) => t.id === taskId) || db.collectTasks[taskId];
  closeFormModal();
  const html = renderHtmlTemplate("tplCollectorUploadForm", {
    GROUP_NAME: escapeHtml(task.group),
    UPLOAD_ACCEPT: getAllUploadAccept(),
  });
  openFormModal("外部提交素材", html, async (form) => {
    const data = Object.fromEntries(new FormData(form));
    const incomingFiles = [...form.querySelector("[name='files']").files];
    const files = incomingFiles.filter(isAllowedUploadFile);
    const rejectedCount = incomingFiles.length - files.length;
    if (!files.length) {
      showToast(rejectedCount ? "所选文件格式暂不支持上传" : "请选择文件后再上传");
      return;
    }
    if (rejectedCount) showToast(`已跳过 ${rejectedCount} 个不支持的文件格式`);
    for (const file of files) {
      const auditConfig = getAuditStatusConfig();
      const asset = await createAssetFromFile(file, { validUntilDate: formDateTimeValue(data, "validUntil") || "", customTags: splitTags(data.businessTags || ""), auditStatus: auditConfig.pendingAudit });
      const targetGroup = db.groups.find((group) => group.name === task.group);
      asset.groupId = targetGroup?.id || "all";
      asset.collect_id = task.id;
      asset.collect_link = task.link;
      asset.creator = task.creator;
      asset.owner = data.author || task.creator;
      asset.department = data.department || "";
      asset.contact = data.contact || "";
      asset.email = data.email || "";
      asset.desc = data.note || asset.desc;
      asset.asset_source = "external";
      db.assets.unshift(asset);
      logOperation('asset', asset.id, asset.name, 'asset.upload', `${data.author || "外部用户"} 通过收集任务上传素材`);
    }
    saveDb();
    closeFormModal();
    state.page = "pending";
    render();
    showToast(`已提交 ${files.length} 个素材到待审核`);
  });
}

function simulateMachineAudit(taskId) {
  const task = db.collectTasks.find((t) => t.id === taskId);
  if (!task) return;
  const auditConfig = getAuditStatusConfig();
  if (task.auditStatus === auditConfig.pendingSubmit) {
    showToast("还没有提交，无法发起机审");
    return;
  }
  const pendingAssets = db.assets.filter((asset) => asset.collect_id === taskId && asset.auditStatus === auditConfig.pendingAudit);
  if (pendingAssets.length === 0) {
    showToast("该任务没有待审核的素材");
    return;
  }
  task.auditStatus = auditConfig.machinePass;
  pendingAssets.forEach((asset) => {
    asset.auditStatus = auditConfig.machinePass;
    asset.logs.unshift({
      operator: "系统",
      operatorDept: "",
      action: "asset.auto_audit",
      actionName: "机审通过",
      detail: `机审通过 - ${nowText()}`,
      createdAt: nowText(),
    });
    asset.lastUpdate = currentUser.username;
  });
  saveDb();
  render();
  showToast(`已完成 ${pendingAssets.length} 个素材的机审，状态已更新为机审通过`);
}

function simulateHumanAudit(taskId) {
  const task = db.collectTasks.find((t) => t.id === taskId);
  if (!task) return;
  const auditConfig = getAuditStatusConfig();
  const assetStatusConfig = getAssetStatusConfig();
  const taskStatusConfig = getCollectTaskStatusConfig();
  if (task.auditStatus === auditConfig.pendingSubmit) {
    showToast("还没有提交，无法发起审核");
    return;
  }
  const pendingAssets = db.assets.filter((asset) => asset.collect_id === taskId && [auditConfig.machinePass, auditConfig.pendingHuman, auditConfig.humanAuditing].includes(asset.auditStatus));
  if (pendingAssets.length === 0) {
    showToast("该任务没有需要人审的素材");
    return;
  }
  pendingAssets.forEach((asset) => {
    asset.auditStatus = auditConfig.humanPass;
    asset.assetStatus = assetStatusConfig.active;
    asset.logs.unshift({
      operator: currentUser.username,
      operatorDept: currentUser.department || "",
      action: "asset.human_audit",
      actionName: "人审通过",
      detail: `人审通过 - ${nowText()}`,
      createdAt: nowText(),
    });
    asset.lastUpdate = currentUser.username;
  });
  task.auditStatus = auditConfig.humanPass;
  task.status = taskStatusConfig.completed;
  saveDb();
  render();
  showToast(`已完成 ${pendingAssets.length} 个素材的人审，状态已更新为人审通过，收集任务已完成`);
}

function openValidityModal(id) {
  const asset = findAsset(id);
  if (!asset) return;
  const validUntilParts = splitDateTimeText(asset.validUntilDate || asset.validUntil || "");
  const html = renderHtmlTemplate("tplAssetValidityForm", {
    ASSET_NAME: escapeHtml(asset.name),
  });
  openFormModal("设置素材有效期", html, (form) => {
    const data = Object.fromEntries(new FormData(form));
    const validUntil = joinDateTime(data.validUntilDate, data.validUntilTime || "23:59");
    asset.validUntil = validUntil;
    asset.validUntilDate = validUntil;
    asset.updatedAt = nowText();
    logOperation('asset', asset.id, asset.name, 'asset.edit', '设置了素材有效期');
    saveDb();
    closeFormModal();
    render();
    if (!els.viewer.classList.contains("hidden")) renderViewer();
    showToast("有效期已更新");
  });
  const modalEl = document.querySelector("#formModal");
  const dateInput = modalEl?.querySelector("[name='validUntilDate']");
  const timeInput = modalEl?.querySelector("[name='validUntilTime']");
  if (dateInput) dateInput.value = toInputDateValue(asset.validUntilDate || asset.validUntil);
  if (timeInput) timeInput.value = validUntilParts.time || "23:59";
}

function openOwnerModal(id) {
  const asset = findAsset(id);
  const html = renderHtmlTemplate("tplOwnerForm", {
    OWNER: escapeAttr(asset.owner),
    DEPARTMENT: escapeAttr(asset.department),
  });
  openFormModal("修改所有者", html, (form) => {
    const data = Object.fromEntries(new FormData(form));
    asset.owner = data.owner.trim();
    asset.department = data.department.trim();
    asset.updatedAt = nowText();
    saveDb();
    closeFormModal();
    render();
  });
}

function openPermissionModal(id) {
  const asset = findAsset(id);
  if (!asset) return;
  
  document.querySelector("#permissionSelect").value = asset.permission;
  document.querySelector("#permissionModal").classList.remove("hidden");
  
  const handleSubmit = (event) => {
    event.preventDefault();
    asset.permission = document.querySelector("#permissionSelect").value;
    asset.updatedAt = nowText();
    saveDb();
    closePermissionModal();
    render();
  };
  
  const form = document.querySelector("#permissionForm");
  form.removeEventListener("submit", handleSubmit);
  form.addEventListener("submit", handleSubmit);
}

function closePermissionModal() {
  document.querySelector("#permissionModal").classList.add("hidden");
}

function openPermissionRequestModal(id, type = "asset") {
  let target, targetName;
  if (type === "asset") {
    target = findAsset(id);
    if (!target) return;
    targetName = target.name;
  } else {
    target = db.groups.find((g) => g.id === id);
    if (!target) return;
    targetName = getGroupName(id);
  }
  
  const permissionOptions = type === "asset" 
    ? getTreeChildren("vl_dim_asset_perm")
    : getTreeChildren("vl_dim_group_perm");
  
  const select = document.querySelector("#permissionRequestPermission");
  select.innerHTML = permissionOptions.map((node) => 
    `<option value="${node.code}">${escapeHtml(node.name)}</option>`
  ).join("");
  
  document.querySelector("#permissionRequestTargetName").textContent = escapeHtml(targetName);
  document.querySelector("#permissionRequestModal").classList.remove("hidden");
  
  const handleSubmit = (event) => {
    event.preventDefault();
    const form = document.querySelector("#permissionRequestForm");
    const data = Object.fromEntries(new FormData(form));
    
    const requestId = `pr-${Date.now()}`;
    db.permissionRequests = db.permissionRequests || [];
    db.permissionRequests.unshift({
      id: requestId,
      targetType: type,
      targetId: id,
      applicant: currentUser.username,
      applicantDept: currentUser.department || "",
      requestedPermission: data.permission,
      reason: data.reason.trim(),
      status: "pending",
      createdAt: nowText(),
      handledBy: "",
      handledAt: "",
    });
    logOperation('acl', requestId, targetName, 'request.submit', `申请了${data.permission}权限`);
    saveDb();
    closePermissionRequestModal();
    
    if (!els.viewer.classList.contains("hidden")) {
      state.detailTab = "log";
      renderViewer();
    }
    showToast("权限申请已提交，等待审批");
    
    form.reset();
  };
  
  const form = document.querySelector("#permissionRequestForm");
  form.removeEventListener("submit", handleSubmit);
  form.addEventListener("submit", handleSubmit);
}

function closePermissionRequestModal() {
  document.querySelector("#permissionRequestModal").classList.add("hidden");
}

function approvePermissionRequest(requestId) {
  const request = (db.permissionRequests || []).find((r) => r.id === requestId);
  if (!request) {
    showToast("权限申请不存在");
    return;
  }
  const requestStatusConfig = getPermissionRequestStatusConfig();
  if (request.status !== requestStatusConfig.pending) {
    showToast("该权限申请已处理");
    renderPermissionManagePage();
    return;
  }
  
  let canApprove = false;
  if (isAdmin()) {
    canApprove = true;
  } else if (request.targetType === "group") {
    canApprove = canManageGroup(request.targetId);
  } else if (request.targetType === "asset") {
    const asset = findAsset(request.targetId);
    canApprove = asset && canEditAsset(asset);
  }
  if (!canApprove) {
    showToast("没有权限审批该权限申请");
    return;
  }
  
  request.status = requestStatusConfig.approved;
  request.handledBy = currentUser.username;
  request.handledAt = nowText();
  
  const applicantUser = db.users.find((u) => u.username === request.applicant);
  const subjectId = applicantUser?.id || `user-${request.applicant}`;
  
  if (request.targetType === "asset") {
    db.assetAcl = db.assetAcl || [];
    const existingAcl = db.assetAcl.find((acl) => acl.assetId === request.targetId && acl.subjectType === "user" && acl.subjectId === subjectId);
    if (existingAcl) {
      existingAcl.permission = request.requestedPermission;
      existingAcl.expiresAt = null;
      existingAcl.grantedBy = currentUser.username;
      existingAcl.grantedAt = nowText();
    } else {
      db.assetAcl.push({
        id: `asset-acl-${Date.now()}`,
        assetId: request.targetId,
        subjectType: "user",
        subjectId,
        subjectName: request.applicant,
        permission: request.requestedPermission,
        expiresAt: null,
        grantedBy: currentUser.username,
        grantedAt: nowText(),
      });
    }
  } else if (request.targetType === "group") {
    db.groupAcl = db.groupAcl || [];
    const existingAcl = db.groupAcl.find((acl) => acl.groupId === request.targetId && acl.subjectType === "user" && acl.subjectId === subjectId);
    if (existingAcl) {
      existingAcl.permission = request.requestedPermission;
      existingAcl.includeSubDept = true;
      existingAcl.grantedBy = currentUser.username;
      existingAcl.grantedAt = nowText();
    } else {
      db.groupAcl.push({
        id: `group-acl-${Date.now()}`,
        groupId: request.targetId,
        subjectType: "user",
        subjectId,
        subjectName: request.applicant,
        permission: request.requestedPermission,
        includeSubDept: true,
        grantedBy: currentUser.username,
        grantedAt: nowText(),
      });
    }
    invalidateGroupPermissionCache();
  }
  
  const targetName = request.targetType === "asset" 
    ? (findAsset(request.targetId)?.name || "")
    : (db.groups.find((g) => g.id === request.targetId)?.name || "");
  
  logOperation('acl', requestId, targetName, 'request.approve', '审批通过');
  saveDb();
  renderPermissionManagePage();
  showToast("权限申请已审批通过");
}

function rejectPermissionRequest(requestId) {
  const request = (db.permissionRequests || []).find((r) => r.id === requestId);
  if (!request) {
    showToast("权限申请不存在");
    return;
  }
  const requestStatusConfig = getPermissionRequestStatusConfig();
  if (request.status !== requestStatusConfig.pending) {
    showToast("该权限申请已处理");
    renderPermissionManagePage();
    return;
  }
  
  let canReject = false;
  if (isAdmin()) {
    canReject = true;
  } else if (request.targetType === "group") {
    canReject = canManageGroup(request.targetId);
  } else if (request.targetType === "asset") {
    const asset = findAsset(request.targetId);
    canReject = asset && canEditAsset(asset);
  }
  if (!canReject) {
    showToast("没有权限审批该权限申请");
    return;
  }
  
  request.status = requestStatusConfig.rejected;
  request.handledBy = currentUser.username;
  request.handledAt = nowText();
  
  const targetName = request.targetType === "asset" 
    ? (findAsset(request.targetId)?.name || "")
    : (db.groups.find((g) => g.id === request.targetId)?.name || "");
  
  logOperation('acl', requestId, targetName, 'request.reject', '审批拒绝');
  saveDb();
  renderPermissionManagePage();
  showToast("权限申请已审批拒绝");
}

function addGroupAcl(groupId, subjectType, subjectId, subjectName, permission) {
  const group = db.groups.find((g) => g.id === groupId);
  if (!group) {
    showToast("素材组不存在");
    return;
  }
  if (!canManageGroup(groupId)) {
    showToast("没有权限管理素材组权限");
    return;
  }
  
  db.groupAcl = db.groupAcl || [];
  const existingAcl = db.groupAcl.find((a) => a.groupId === groupId && a.subjectId === subjectId && a.subjectType === subjectType);
  if (existingAcl) {
    showToast("该主体已存在权限记录");
    return;
  }
  db.groupAcl.push({
    id: `group-acl-${Date.now()}`,
    groupId,
    subjectType,
    subjectId,
    subjectName,
    permission,
    includeSubDept: subjectType === "department",
    grantedBy: currentUser.username,
    grantedAt: nowText(),
  });
  
  logOperation('group', groupId, group.name, 'group.acl.add', `给${subjectName}授予了${permission}权限`);
  invalidateGroupPermissionCache();
  saveDb();
  showToast("组权限已添加");
}

function removeGroupAcl(aclId) {
  const acl = (db.groupAcl || []).find((a) => a.id === aclId);
  if (!acl) {
    showToast("权限记录不存在");
    return;
  }
  const group = db.groups.find((g) => g.id === acl.groupId);
  if (!canManageGroup(acl.groupId)) {
    showToast("没有权限管理素材组权限");
    return;
  }
  
  db.groupAcl = db.groupAcl.filter((a) => a.id !== aclId);
  
  logOperation('group', acl.groupId, group?.name || "", 'group.acl.remove', `移除了${acl.subjectName}的${acl.permission}权限`);
  invalidateGroupPermissionCache();
  saveDb();
  showToast("组权限已移除");
}

function updateGroupAcl(aclId, newPermission) {
  const acl = (db.groupAcl || []).find((a) => a.id === aclId);
  if (!acl) {
    showToast("权限记录不存在");
    return;
  }
  const group = db.groups.find((g) => g.id === acl.groupId);
  if (!canManageGroup(acl.groupId)) {
    showToast("没有权限管理素材组权限");
    return;
  }
  
  const oldPermission = acl.permission;
  acl.permission = newPermission;
  acl.grantedBy = currentUser.username;
  acl.grantedAt = nowText();
  
  logOperation('group', acl.groupId, group?.name || "", 'group.acl.update', `将${oldPermission}权限改为${newPermission}`);
  invalidateGroupPermissionCache();
  saveDb();
  showToast("组权限已更新");
}

function updateAssetAcl(aclId, newPermission) {
  const acl = (db.assetAcl || []).find((a) => a.id === aclId);
  if (!acl) {
    showToast("权限记录不存在");
    return;
  }
  const asset = findAsset(acl.assetId);
  if (!canEditAsset(asset) && !(asset.ownedBy === currentUser.username || isAdmin())) {
    showToast("没有权限管理素材权限");
    return;
  }
  const oldPermission = acl.permission;
  acl.permission = newPermission;
  acl.grantedBy = currentUser.username;
  acl.grantedAt = nowText();
  logOperation('asset', acl.assetId, asset?.name || "", 'asset.acl.update', `将${oldPermission}权限改为${newPermission}`);
  saveDb();
  showToast("素材权限已更新");
}

function transferGroupOwner(groupId, newOwnerUsername, newOwnerDept) {
  const group = db.groups.find((g) => g.id === groupId);
  if (!group) {
    showToast("素材组不存在");
    return;
  }
  if (!(isAdmin() || group.ownedBy === currentUser.username)) {
    showToast("只有素材组责任人或管理员可以交接权限");
    return;
  }
  
  const oldOwner = group.ownedBy;
  group.ownedBy = newOwnerUsername;
  group.ownedByDept = newOwnerDept || "";
  group.updatedAt = nowText();
  
  logOperation('group', groupId, group.name, 'group.owner.transfer', `责任人从${oldOwner}变更为${newOwnerUsername}`);
  invalidateGroupPermissionCache();
  saveDb();
  showToast("素材组责任人已变更");
}

function addAssetAcl(assetId, subjectType, subjectId, subjectName, permission) {
  const asset = findAsset(assetId);
  if (!asset) {
    showToast("素材不存在");
    return;
  }
  if (!canEditAsset(asset) && !(asset.ownedBy === currentUser.username || isAdmin())) {
    showToast("没有权限管理素材权限");
    return;
  }
  
  db.assetAcl = db.assetAcl || [];
  const existingAcl = db.assetAcl.find((a) => a.assetId === assetId && a.subjectId === subjectId && a.subjectType === subjectType);
  if (existingAcl) {
    showToast("该主体已存在权限记录");
    return;
  }
  db.assetAcl.push({
    id: `asset-acl-${Date.now()}`,
    assetId,
    subjectType,
    subjectId,
    subjectName,
    permission,
    expiresAt: null,
    grantedBy: currentUser.username,
    grantedAt: nowText(),
  });
  
  logOperation('asset', assetId, asset.name, 'asset.acl.add', `给${subjectName}授予了${permission}权限`);
  saveDb();
  showToast("素材权限已添加");
}

function removeAssetAcl(aclId) {
  const acl = (db.assetAcl || []).find((a) => a.id === aclId);
  if (!acl) {
    showToast("权限记录不存在");
    return;
  }
  const asset = findAsset(acl.assetId);
  if (!asset) {
    showToast("素材不存在");
    return;
  }
  if (!canEditAsset(asset) && !(asset.ownedBy === currentUser.username || isAdmin())) {
    showToast("没有权限管理素材权限");
    return;
  }
  
  db.assetAcl = db.assetAcl.filter((a) => a.id !== aclId);
  
  logOperation('asset', acl.assetId, asset.name, 'asset.acl.remove', `移除了${acl.subjectName}的${acl.permission}权限`);
  saveDb();
  showToast("素材权限已移除");
}

function openFormModal(title, html, onSubmit) {
  const modal = document.querySelector("#formModal");
  document.querySelector("#formTitle").textContent = title;
  const form = document.querySelector("#formBody");
  form.innerHTML = html;
  form.onsubmit = (event) => {
    event.preventDefault();
    onSubmit(form);
  };
  form.querySelectorAll("[data-cancel]").forEach((button) => button.addEventListener("click", closeFormModal));
  initProjectDatePickers(form);
  modal.classList.remove("hidden");
}

function closeFormModal() {
  document.querySelector("#formModal").classList.add("hidden");
  document.querySelector("#fileInput").value = "";
  document.querySelector("#folderInput").value = "";
}

let currentGroupPermissionId = "";

function openGroupPermissionModal(groupId) {
  const group = db.groups.find((g) => g.id === groupId);
  if (!group) return;
  if (!canManageGroup(groupId)) {
    showToast("没有权限管理组权限");
    return;
  }
  currentGroupPermissionId = groupId;
  
  const html = renderHtmlTemplate("tplGroupPermissionForm", {
    CURRENT_OWNER: escapeHtml(group.ownedBy || "-"),
    CURRENT_DEPT: escapeHtml(group.ownedByDept || "-"),
  });
  
  openFormModal(`素材组权限设置 - ${group.name}`, html);
  
  populateGroupPermissionDropdowns();
  renderGroupAclList();
  bindGroupAclToolbarEvents();
  renderGroupPermissionLogs();
  
  const canTransfer = isAdmin() || group.ownedBy === currentUser.username;
  document.querySelector('[data-tab="transfer"]')?.classList.toggle("hidden", !canTransfer);
  
  bindGroupPermissionTabEvents();
  bindGroupAclFormEvents();
  bindGroupTransferEvents();
}

function populateGroupPermissionDropdowns() {
  const subjectTypes = getTreeChildren("vl_dim_subject_type").map((node) => `<option value="${node.code}">${escapeHtml(node.name)}</option>`).join("");
  document.querySelector("#groupAclSubjectType").innerHTML = subjectTypes;
  
  const permissions = getTreeChildren("vl_dim_group_perm").map((node) => `<option value="${node.code}">${escapeHtml(node.name)}</option>`).join("");
  document.querySelector("#groupAclPermission").innerHTML = permissions;
}

function buildPermissionOptions(dimCode, currentCode) {
  return getTreeChildren(dimCode).map((node) => `<option value="${node.code}" ${node.code === currentCode ? "selected" : ""}>${escapeHtml(node.name)}</option>`).join("");
}

function renderGroupAclList() {
  const tbody = document.querySelector("#groupAclList");
  if (!tbody) return;
  const prevChecked = new Set([...tbody.querySelectorAll(".acl-check:checked")].map((c) => c.dataset.aclId));
  const aclList = (db.groupAcl || []).filter((a) => a.groupId === currentGroupPermissionId);
  tbody.innerHTML = aclList.map((acl) => {
    const subjectTypeName = getTreeNodeByCode(acl.subjectType)?.name || acl.subjectType;
    return `<tr>
      <td class="col-check"><input type="checkbox" class="acl-check" data-acl-id="${acl.id}" /></td>
      <td>${escapeHtml(acl.subjectName)}</td>
      <td><span class="tag">${escapeHtml(subjectTypeName)}</span></td>
      <td><select class="acl-permission-select" data-acl-id="${acl.id}">${buildPermissionOptions("vl_dim_group_perm", acl.permission)}</select></td>
      <td>${escapeHtml(acl.grantedBy)}</td>
      <td>${escapeHtml(formatDateTimeDisplay(acl.grantedAt))}</td>
      <td><button class="plain-icon" data-remove-group-acl="${acl.id}" type="button"><span data-icon="x"></span></button></td>
    </tr>`;
  }).join("") || `<tr><td colspan="7" class="empty">暂无授权记录</td></tr>`;

  tbody.querySelectorAll(".acl-check").forEach((c) => { if (prevChecked.has(c.dataset.aclId)) c.checked = true; });
  tbody.querySelectorAll("[data-remove-group-acl]").forEach((btn) => {
    btn.addEventListener("click", () => {
      removeGroupAcl(btn.dataset.removeGroupAcl);
      renderGroupAclList();
    });
  });
  tbody.querySelectorAll(".acl-permission-select").forEach((sel) => {
    sel.addEventListener("change", () => {
      updateGroupAcl(sel.dataset.aclId, sel.value);
    });
  });
  syncGroupAclBatchButton();
}

function syncGroupAclBatchButton() {
  const tbody = document.querySelector("#groupAclList");
  const batchBtn = document.querySelector("#groupAclBatchDelete");
  if (!batchBtn) return;
  const checked = tbody ? tbody.querySelectorAll(".acl-check:checked").length : 0;
  batchBtn.classList.toggle("hidden", checked === 0);
  batchBtn.textContent = checked > 0 ? `批量删除（${checked}）` : "批量删除";
}

function bindGroupAclToolbarEvents() {
  const addToggle = document.querySelector("#groupAclAddToggle");
  const formPanel = document.querySelector("#groupAclFormPanel");
  addToggle?.addEventListener("click", () => {
    formPanel?.classList.toggle("hidden");
  });
  const checkAll = document.querySelector("#groupAclCheckAll");
  checkAll?.addEventListener("change", () => {
    const tbody = document.querySelector("#groupAclList");
    tbody?.querySelectorAll(".acl-check").forEach((c) => { c.checked = checkAll.checked; });
    syncGroupAclBatchButton();
  });
  const batchBtn = document.querySelector("#groupAclBatchDelete");
  batchBtn?.addEventListener("click", async () => {
    const tbody = document.querySelector("#groupAclList");
    const ids = [...tbody.querySelectorAll(".acl-check:checked")].map((c) => c.dataset.aclId);
    if (!ids.length) return;
    const confirmed = await Modal.confirm(`确认删除选中的 ${ids.length} 条授权记录？`);
    if (confirmed) {
      ids.forEach((id) => removeGroupAcl(id));
      const ca = document.querySelector("#groupAclCheckAll");
      if (ca) ca.checked = false;
      renderGroupAclList();
    }
  });
}

function renderGroupPermissionLogs() {
  const logs = (db.groups.find((g) => g.id === currentGroupPermissionId)?.logs || []).reverse();
  const container = document.querySelector("#groupPermLogList");
  if (!container) return;
  
  container.innerHTML = logs.map((log) => `<div class="log-item">
    <span>${escapeHtml(formatDateTimeDisplay(log.createdAt || nowText()))}</span>
    <span class="log-action-tag">${escapeHtml(log.actionName || log.action || "-")}</span>
    <p>${escapeHtml(log.detail || "-")}</p>
    <small>操作人: ${escapeHtml(log.operator || "-")}</small>
  </div>`).join("") || renderEmpty("暂无操作日志");
}

function bindGroupPermissionTabEvents() {
  document.querySelectorAll(".permission-tabs button").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".permission-tabs button").forEach((b) => b.classList.remove("active"));
      document.querySelectorAll(".permission-tab-content").forEach((c) => c.classList.add("hidden"));
      btn.classList.add("active");
      document.querySelector(`#groupPerm${btn.dataset.tab.charAt(0).toUpperCase() + btn.dataset.tab.slice(1)}`)?.classList.remove("hidden");
    });
  });
}

function bindGroupAclFormEvents() {
  const searchInput = document.querySelector("#groupAclSubjectSearch");
  const subjectList = document.querySelector("#groupAclSubjectList");
  const subjectTypeSelect = document.querySelector("#groupAclSubjectType");
  
  function searchSubjects() {
    const keyword = searchInput.value.trim().toLowerCase();
    const type = subjectTypeSelect.value;
    
    let candidates = [];
    if (type === "user") {
      candidates = db.users.map((u) => ({ id: u.id, name: u.name, dept: u.department }));
    } else if (type === "department") {
      candidates = db.organizations.map((o) => ({ id: o.id, name: o.name, dept: o.name }));
    } else if (type === "company") {
      candidates = [{ id: "all", name: "全公司", dept: "公司级授权" }];
    }
    
    const filtered = candidates.filter((item) => item.name.toLowerCase().includes(keyword));
    subjectList.innerHTML = filtered.map((item) => `<button data-subject-id="${item.id}" data-subject-name="${escapeAttr(item.name)}" data-subject-dept="${escapeAttr(item.dept || "")}" type="button">${escapeHtml(item.name)}${item.dept ? ` <small>${escapeHtml(item.dept)}</small>` : ""}</button>`).join("");
    subjectList.classList.toggle("hidden", !filtered.length);
    
    subjectList.querySelectorAll("button").forEach((btn) => {
      btn.addEventListener("click", () => {
        searchInput.value = btn.dataset.subjectName;
        document.querySelector("#groupAclSubjectId").value = btn.dataset.subjectId;
        document.querySelector("#groupAclSubjectName").value = btn.dataset.subjectName;
        subjectList.classList.add("hidden");
      });
    });
  }
  
  searchInput.addEventListener("input", searchSubjects);
  subjectTypeSelect.addEventListener("change", () => {
    searchInput.value = "";
    document.querySelector("#groupAclSubjectId").value = "";
    document.querySelector("#groupAclSubjectName").value = "";
    searchSubjects();
  });
  
  document.querySelector("#groupAclSubmit").addEventListener("click", () => {
    const subjectType = document.querySelector("#groupAclSubjectType").value;
    const subjectId = document.querySelector("#groupAclSubjectId").value;
    const subjectName = document.querySelector("#groupAclSubjectName").value;
    const permission = document.querySelector("#groupAclPermission").value;
    
    if (!subjectId || !subjectName) {
      showToast("请选择主体");
      return;
    }
    
    addGroupAcl(currentGroupPermissionId, subjectType, subjectId, subjectName, permission);
    renderGroupAclList();
    
    searchInput.value = "";
    document.querySelector("#groupAclSubjectId").value = "";
    document.querySelector("#groupAclSubjectName").value = "";
  });
  
  document.querySelector("#groupAclCancel").addEventListener("click", () => {
    searchInput.value = "";
    document.querySelector("#groupAclSubjectId").value = "";
    document.querySelector("#groupAclSubjectName").value = "";
    subjectList.classList.add("hidden");
  });
}

function bindGroupTransferEvents() {
  const searchInput = document.querySelector("#transferSearch");
  const userList = document.querySelector("#transferUserList");
  
  searchInput.addEventListener("input", () => {
    const keyword = searchInput.value.trim().toLowerCase();
    const filtered = db.users.filter((u) => u.name.toLowerCase().includes(keyword) || u.username.toLowerCase().includes(keyword));
    userList.innerHTML = filtered.map((u) => `<button data-user-id="${u.id}" data-user-username="${escapeAttr(u.username)}" data-user-name="${escapeAttr(u.name)}" data-user-dept="${escapeAttr(u.department || "")}" type="button">${escapeHtml(u.name)}${u.department ? ` <small>${escapeHtml(u.department)}</small>` : ""}</button>`).join("");
    
    userList.querySelectorAll("button").forEach((btn) => {
      btn.addEventListener("click", () => {
        searchInput.value = btn.dataset.userName;
        document.querySelector("#transferUserId").value = btn.dataset.userId;
        document.querySelector("#transferUserName").value = btn.dataset.userUsername;
        document.querySelector("#transferUserDept").value = btn.dataset.userDept;
      });
    });
  });
  
  document.querySelector("#transferSubmit").addEventListener("click", async () => {
    const userName = document.querySelector("#transferUserName").value;
    const userDept = document.querySelector("#transferUserDept").value;
    
    if (!userName) {
      showToast("请选择新责任人");
      return;
    }
    
    const confirmed = await Modal.confirm(`确认将素材组责任人变更为 ${userName}？`);
    if (confirmed) {
      transferGroupOwner(currentGroupPermissionId, userName, userDept);
      closeFormModal();
      render();
    }
  });
  
  document.querySelector("#transferCancel").addEventListener("click", () => {
    searchInput.value = "";
    document.querySelector("#transferUserId").value = "";
    document.querySelector("#transferUserName").value = "";
    document.querySelector("#transferUserDept").value = "";
  });
}

let currentAssetPermissionId = "";

function openAssetPermissionModal(assetId) {
  const asset = findAsset(assetId);
  if (!asset) return;
  if (!canEditAsset(asset) && !(asset.ownedBy === currentUser.username || isAdmin())) {
    showToast("没有权限管理素材权限");
    return;
  }
  currentAssetPermissionId = assetId;
  
  const group = db.groups.find((g) => g.id === asset.groupId);
  const inheritLevel = getEffectiveGroupPermissionLevel(asset.groupId);
  const inheritLevelName = getTreeNodeByCode(inheritLevel, "group_permission_level")?.name || inheritLevel;
  
  const html = renderHtmlTemplate("tplAssetPermissionForm", {
    GROUP_NAME: escapeHtml(group?.name || "全部素材"),
    INHERIT_LEVEL: `<span class="tag permission-tag">${escapeHtml(inheritLevelName)}</span>`,
  });
  
  openFormModal(`素材权限设置 - ${asset.name}`, html);
  
  populateAssetPermissionDropdowns();
  renderAssetAclList();
  bindAssetAclToolbarEvents();
  
  bindAssetAclFormEvents();
}

function populateAssetPermissionDropdowns() {
  const subjectTypes = getTreeChildren("vl_dim_subject_type").map((node) => `<option value="${node.code}">${escapeHtml(node.name)}</option>`).join("");
  document.querySelector("#assetAclSubjectType").innerHTML = subjectTypes;
  
  const permissions = getTreeChildren("vl_dim_asset_perm").map((node) => `<option value="${node.code}">${escapeHtml(node.name)}</option>`).join("");
  document.querySelector("#assetAclPermission").innerHTML = permissions;
  
  initProjectDatePickers(document.querySelector("#formModal"));
}

function renderAssetAclList() {
  const tbody = document.querySelector("#assetAclList");
  if (!tbody) return;
  const prevChecked = new Set([...tbody.querySelectorAll(".acl-check:checked")].map((c) => c.dataset.aclId));
  const aclList = (db.assetAcl || []).filter((a) => a.assetId === currentAssetPermissionId);
  tbody.innerHTML = aclList.map((acl) => {
    const subjectTypeName = getTreeNodeByCode(acl.subjectType)?.name || acl.subjectType;
    return `<tr>
      <td class="col-check"><input type="checkbox" class="acl-check" data-acl-id="${acl.id}" /></td>
      <td>${escapeHtml(acl.subjectName)}</td>
      <td><span class="tag">${escapeHtml(subjectTypeName)}</span></td>
      <td><select class="acl-permission-select" data-acl-id="${acl.id}">${buildPermissionOptions("vl_dim_asset_perm", acl.permission)}</select></td>
      <td>${escapeHtml(formatDateTimeDisplay(acl.expiresAt) || "永久")}</td>
      <td>${escapeHtml(acl.grantedBy)}</td>
      <td><button class="plain-icon" data-remove-asset-acl="${acl.id}" type="button"><span data-icon="x"></span></button></td>
    </tr>`;
  }).join("") || `<tr><td colspan="7" class="empty">暂无单独授权记录</td></tr>`;

  tbody.querySelectorAll(".acl-check").forEach((c) => { if (prevChecked.has(c.dataset.aclId)) c.checked = true; });
  tbody.querySelectorAll("[data-remove-asset-acl]").forEach((btn) => {
    btn.addEventListener("click", () => {
      removeAssetAcl(btn.dataset.removeAssetAcl);
      renderAssetAclList();
    });
  });
  tbody.querySelectorAll(".acl-permission-select").forEach((sel) => {
    sel.addEventListener("change", () => {
      updateAssetAcl(sel.dataset.aclId, sel.value);
    });
  });
  syncAssetAclBatchButton();
}

function syncAssetAclBatchButton() {
  const tbody = document.querySelector("#assetAclList");
  const batchBtn = document.querySelector("#assetAclBatchDelete");
  if (!batchBtn) return;
  const checked = tbody ? tbody.querySelectorAll(".acl-check:checked").length : 0;
  batchBtn.classList.toggle("hidden", checked === 0);
  batchBtn.textContent = checked > 0 ? `批量删除（${checked}）` : "批量删除";
}

function bindAssetAclToolbarEvents() {
  const addToggle = document.querySelector("#assetAclAddToggle");
  const formPanel = document.querySelector("#assetAclFormPanel");
  addToggle?.addEventListener("click", () => {
    formPanel?.classList.toggle("hidden");
  });
  const checkAll = document.querySelector("#assetAclCheckAll");
  checkAll?.addEventListener("change", () => {
    const tbody = document.querySelector("#assetAclList");
    tbody?.querySelectorAll(".acl-check").forEach((c) => { c.checked = checkAll.checked; });
    syncAssetAclBatchButton();
  });
  const batchBtn = document.querySelector("#assetAclBatchDelete");
  batchBtn?.addEventListener("click", async () => {
    const tbody = document.querySelector("#assetAclList");
    const ids = [...tbody.querySelectorAll(".acl-check:checked")].map((c) => c.dataset.aclId);
    if (!ids.length) return;
    const confirmed = await Modal.confirm(`确认删除选中的 ${ids.length} 条授权记录？`);
    if (confirmed) {
      ids.forEach((id) => removeAssetAcl(id));
      const ca = document.querySelector("#assetAclCheckAll");
      if (ca) ca.checked = false;
      renderAssetAclList();
    }
  });
}

function bindAssetAclFormEvents() {
  const searchInput = document.querySelector("#assetAclSubjectSearch");
  const subjectList = document.querySelector("#assetAclSubjectList");
  const subjectTypeSelect = document.querySelector("#assetAclSubjectType");
  
  function searchSubjects() {
    const keyword = searchInput.value.trim().toLowerCase();
    const type = subjectTypeSelect.value;
    
    let candidates = [];
    if (type === "user") {
      candidates = db.users.map((u) => ({ id: u.id, name: u.name, dept: u.department }));
    } else if (type === "department") {
      candidates = db.organizations.map((o) => ({ id: o.id, name: o.name, dept: o.name }));
    } else if (type === "company") {
      candidates = [{ id: "all", name: "全公司", dept: "公司级授权" }];
    }
    
    const filtered = candidates.filter((item) => item.name.toLowerCase().includes(keyword));
    subjectList.innerHTML = filtered.map((item) => `<button data-subject-id="${item.id}" data-subject-name="${escapeAttr(item.name)}" data-subject-dept="${escapeAttr(item.dept || "")}" type="button">${escapeHtml(item.name)}${item.dept ? ` <small>${escapeHtml(item.dept)}</small>` : ""}</button>`).join("");
    subjectList.classList.toggle("hidden", !filtered.length);
    
    subjectList.querySelectorAll("button").forEach((btn) => {
      btn.addEventListener("click", () => {
        searchInput.value = btn.dataset.subjectName;
        document.querySelector("#assetAclSubjectId").value = btn.dataset.subjectId;
        document.querySelector("#assetAclSubjectName").value = btn.dataset.subjectName;
        subjectList.classList.add("hidden");
      });
    });
  }
  
  searchInput.addEventListener("input", searchSubjects);
  subjectTypeSelect.addEventListener("change", () => {
    searchInput.value = "";
    document.querySelector("#assetAclSubjectId").value = "";
    document.querySelector("#assetAclSubjectName").value = "";
    searchSubjects();
  });
  
  document.querySelector("#assetAclSubmit").addEventListener("click", () => {
    const subjectType = document.querySelector("#assetAclSubjectType").value;
    const subjectId = document.querySelector("#assetAclSubjectId").value;
    const subjectName = document.querySelector("#assetAclSubjectName").value;
    const permission = document.querySelector("#assetAclPermission").value;
    const expireDate = document.querySelector("#assetAclExpireDate").value;
    const expireTime = document.querySelector("#assetAclExpireTime").value;
    
    if (!subjectId || !subjectName) {
      showToast("请选择主体");
      return;
    }
    
    const expiresAt = expireDate ? joinDateTime(expireDate, expireTime || "23:59") : null;
    
    addAssetAcl(currentAssetPermissionId, subjectType, subjectId, subjectName, permission);
    
    if (expiresAt) {
      const acl = (db.assetAcl || []).find((a) => a.assetId === currentAssetPermissionId && a.subjectId === subjectId && a.subjectType === subjectType);
      if (acl) {
        acl.expiresAt = expiresAt;
        saveDb();
      }
    }
    
    renderAssetAclList();
    
    searchInput.value = "";
    document.querySelector("#assetAclSubjectId").value = "";
    document.querySelector("#assetAclSubjectName").value = "";
    document.querySelector("#assetAclExpireDate").value = "";
    document.querySelector("#assetAclExpireTime").value = "";
  });
  
  document.querySelector("#assetAclCancel").addEventListener("click", () => {
    searchInput.value = "";
    document.querySelector("#assetAclSubjectId").value = "";
    document.querySelector("#assetAclSubjectName").value = "";
    subjectList.classList.add("hidden");
  });
}

function rerunRecognition(id) {
  const asset = findAsset(id);
  if (!asset) return;
  if (!canEditAsset(asset)) {
    showToast("没有权限编辑素材");
    return;
  }
  asset.aiTags = recognizeTags({ name: asset.name, type: asset.mime || "" }, { width: asset.width, height: asset.height, interiorColors: asset.interiorColors, exteriorColors: asset.exteriorColors });
  asset.updatedAt = nowText();
  logOperation('asset', asset.id, asset.name, 'asset.tag', `重新识别标签：${asset.aiTags.join("、")}`);
  saveDb();
  render();
  showToast("已重新识别内容标签");
}

function softDeleteAsset(id) {
  const asset = findAsset(id);
  if (!asset) return;
  if (!canDeleteAsset(asset)) {
    showToast("没有权限删除素材");
    return;
  }
  const assetStatusConfig = getAssetStatusConfig();
  asset.assetStatus = assetStatusConfig.deleted;
  asset.updatedAt = nowText();
  asset.deletedAt = asset.updatedAt;
  logOperation('asset', asset.id, asset.name, 'asset.delete', '删除了素材（软删除）');
  saveDb();
  render();
  showToast("素材已移入回收站");
}

function restoreAsset(id) {
  const asset = findAsset(id);
  if (!asset) {
    showToast("素材不存在");
    return;
  }
  if (!canRestoreAsset(asset)) {
    showToast("没有权限恢复素材");
    return;
  }
  const assetStatusConfig = getAssetStatusConfig();
  asset.assetStatus = assetStatusConfig.active;
  asset.deletedAt = "";
  asset.updatedAt = nowText();
  logOperation('asset', asset.id, asset.name, 'asset.restore', '从回收站恢复了素材');
  saveDb();
  render();
  showToast("素材已恢复");
}

function restoreGroup(id) {
  const group = db.groups.find((item) => item.id === id);
  if (!group) {
    showToast("素材组不存在");
    return;
  }
  group.status = getGroupStatusConfig().active;
  group.deletedAt = "";
  group.updatedAt = nowText();
  logOperation('group', group.id, group.name, 'group.restore', '从回收站恢复了素材组');
  saveDb();
  render();
  showToast("素材组已恢复");
}

function restoreSelectedRecycleAssets() {
  const statusConfig = getAssetStatusConfig();
  const selectedDeletedAssets = db.assets.filter((asset) => statusConfig.deletedCodes.includes(asset.assetStatus) && state.selectedIds.has(asset.id));
  if (!selectedDeletedAssets.length) {
    showToast("请先选择要恢复的素材");
    return;
  }
  for (const asset of selectedDeletedAssets) {
    if (!canRestoreAsset(asset)) {
      showToast(`没有权限恢复素材「${asset.name}」`);
      return;
    }
  }
  selectedDeletedAssets.forEach((asset) => {
    const group = db.groups.find((item) => item.id === asset.groupId);
    asset.assetStatus = statusConfig.active;
    asset.deletedAt = "";
    asset.updatedAt = nowText();
    if (!group || statusConfig.deletedCodes.includes(group.status)) asset.groupId = "all";
    logOperation('asset', asset.id, asset.name, 'asset.restore', '从回收站恢复了素材');
  });
  state.selectedIds.clear();
  saveDb();
  render();
  showToast(`已恢复 ${selectedDeletedAssets.length} 个素材`);
}

async function hardDeleteAsset(id) {
  if (!id) return;
  const asset = findAsset(id);
  if (!asset) {
    showToast("素材不存在");
    return;
  }
  if (!canPurgeAsset(asset)) {
    showToast("没有权限彻底删除素材");
    return;
  }
  const ok = await window.Modal.confirm(`确定彻底删除素材「${asset.name}」吗？此操作不可恢复。`);
  if (!ok) return;
  const assetStatusConfig = getAssetStatusConfig();
  asset.assetStatus = assetStatusConfig.disabled;
  asset.updatedAt = nowText();
  logOperation('asset', asset.id, asset.name, 'asset.delete', '彻底删除了素材（不可恢复）');
  saveDb();
  render();
  showToast("素材已彻底删除");
}

function downloadAsset(id, type = "original") {
  const asset = findAsset(id);
  if (!asset) return;
  if (!canDownloadAsset(asset)) {
    showToast("没有权限下载素材");
    return;
  }
  const link = document.createElement("a");
  link.href = asset.src;
  let filename = asset.name;
  if (type === "web") filename += "-web";
  if (type === "preview") filename += "-preview";
  link.download = `${filename}.${asset.format.toLowerCase()}`;
  link.click();
  asset.download += 1;
  logOperation('asset', asset.id, asset.name, 'asset.download', `下载了素材${type !== "original" ? `(${type})` : ""}`);
  saveDb();
  render();
}

function showPreview(anchor, id) {
  if (state.view !== "list") return;
  const asset = findAsset(id);
  if (!asset || !asset.mime?.startsWith("image/")) return;
  const rect = anchor.getBoundingClientRect();
  els.previewPop.querySelector("img").src = asset.src;
  els.previewPop.style.left = `${Math.min(rect.right + 18, window.innerWidth - 450)}px`;
  els.previewPop.style.top = `${Math.max(80, rect.top - 70)}px`;
  els.previewPop.classList.remove("hidden");
}
