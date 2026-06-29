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
  
  document.querySelector("#basketShareCount").textContent = `${assets.length} 项素材`;
  document.querySelector("#basketShareLink").value = "";
  document.querySelector("#basketShareCopy").disabled = true;
  document.querySelector("#basketShareModal").classList.remove("hidden");
}

function closeBasketShareModal() {
  document.querySelector("#basketShareModal").classList.add("hidden");
}

let shareGroupCreatedLink = "";
let updatingShareIndex = -1;

function openUpdateShareExpireModal(index) {
  updatingShareIndex = index;
  const share = db.shares[index];
  if (!share) return;
  
  document.querySelector("#updateShareExpireName").textContent = escapeHtml(share.group);
  document.querySelector("#updateShareExpireCurrent").textContent = share.expiresAt;
  
  const dateInput = document.querySelector("#updateShareExpireDate");
  const timeInput = document.querySelector("#updateShareExpireTime");
  const foreverCheckbox = document.querySelector("#updateShareExpireForever");
  
  if (share.expiresAt === "永久有效") {
    foreverCheckbox.checked = true;
    dateInput.disabled = true;
    timeInput.disabled = true;
    dateInput.value = "";
    timeInput.value = "";
  } else {
    foreverCheckbox.checked = false;
    dateInput.disabled = false;
    timeInput.disabled = false;
    const match = share.expiresAt.match(/(\d{4})-(\d{2})-(\d{2})\s+(\d{2}):(\d{2})/);
    if (match) {
      dateInput.value = `${match[1]}-${match[2]}-${match[3]}`;
      timeInput.value = `${match[4]}:${match[5]}`;
    } else {
      const now = new Date();
      dateInput.value = now.toISOString().split("T")[0];
      timeInput.value = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
    }
  }
  
  document.querySelector("#updateShareExpireModal").classList.remove("hidden");
}

function handleUpdateShareExpireSubmit(event) {
  event.preventDefault();
  if (updatingShareIndex < 0) return;
  
  const form = event.target;
  const data = Object.fromEntries(new FormData(form));
  const share = db.shares[updatingShareIndex];
  
  if (data.expireForever === "on") {
    share.expiresAt = "永久有效";
  } else {
    share.expiresAt = `${data.expireDate} ${data.expireTime}`;
  }
  saveDb();
  closeUpdateShareExpireModal();
  render();
  showToast("分享过期时间已更新");
}

function closeUpdateShareExpireModal() {
  document.querySelector("#updateShareExpireModal").classList.add("hidden");
  updatingShareIndex = -1;
}

function openShareCurrentModal() {
  const groupName = getGroupName(state.groupId);
  shareGroupCreatedLink = "";
  
  document.querySelector("#shareGroupName").textContent = escapeHtml(groupName);
  document.querySelector("#shareGroupLink").value = "";
  document.querySelector("#shareGroupCopy").disabled = true;
  document.querySelector("#shareGroupAccess").value = "企业内部成员可访问";
  document.querySelector("#shareGroupExpiresAt").value = "7天";
  
  document.querySelector("#shareGroupModal").classList.remove("hidden");
}

function handleShareGroupSubmit(event) {
  event.preventDefault();
  if (shareGroupCreatedLink) return;
  
  const form = event.target;
  const data = Object.fromEntries(new FormData(form));
  const code = Math.random().toString(36).slice(2, 8);
  const link = getShareLink("group", state.groupId, code);
  const groupName = getGroupName(state.groupId);
  const expiresAt = calculateExpireTime(data.expiresAt);
  
  db.shares.unshift({ group: groupName, user: currentUser.name, access: data.access, visits: 0, views: 0, downloads: 0, sharedAt: nowText(), expiresAt, targetType: "group", targetId: state.groupId, code, link });
  saveDb();
  shareGroupCreatedLink = link;
  document.querySelector("#shareGroupLink").value = link;
  document.querySelector("#shareGroupCopy").disabled = false;
  showToast("分享记录已创建，链接已生成");
}

function closeShareGroupModal() {
  document.querySelector("#shareGroupModal").classList.add("hidden");
}

let shareAssetCreatedLink = "";
let shareAssetId = "";

function openShareAssetModal(id) {
  const asset = findAsset(id);
  if (!asset) return;
  shareAssetCreatedLink = "";
  shareAssetId = id;
  
  document.querySelector("#shareAssetName").textContent = escapeHtml(asset.name);
  document.querySelector("#shareAssetLink").value = "";
  document.querySelector("#shareAssetCopy").disabled = true;
  document.querySelector("#shareAssetAccess").value = "企业内部成员可访问";
  document.querySelector("#shareAssetExpiresAt").value = "7天";
  
  document.querySelector("#shareAssetModal").classList.remove("hidden");
}

function handleShareAssetSubmit(event) {
  event.preventDefault();
  if (shareAssetCreatedLink) return;
  
  const form = event.target;
  const data = Object.fromEntries(new FormData(form));
  const code = Math.random().toString(36).slice(2, 8);
  const link = getShareLink("asset", shareAssetId, code);
  const asset = findAsset(shareAssetId);
  const expiresAt = calculateExpireTime(data.expiresAt);
  
  db.shares.unshift({ group: asset.name, user: currentUser.name, access: data.access, visits: 0, views: 0, downloads: 0, sharedAt: nowText(), expiresAt, targetType: "asset", targetId: shareAssetId, code, link });
  asset.share += 1;
  asset.logs.unshift(`${currentUser.name} 分享了素材`);
  saveDb();
  render();
  if (!els.viewer.classList.contains("hidden")) renderViewer();
  shareAssetCreatedLink = link;
  document.querySelector("#shareAssetLink").value = link;
  document.querySelector("#shareAssetCopy").disabled = false;
  showToast("分享链接已生成");
}

function closeShareAssetModal() {
  document.querySelector("#shareAssetModal").classList.add("hidden");
}

function openCollectTaskConfigModal(index) {
  const task = db.collectTasks[index];
  if (!task) return;
  const link = getCollectLink(task.code);
  const expiresAtParts = splitDateTimeText(task.expiresAt);
  const html = renderHtmlTemplate("tplCollectTaskConfigForm", {
    QR_URL: escapeAttr(getQrImageUrl(link)),
    THEME: escapeHtml(task.theme),
    CODE: escapeAttr(task.code),
    LINK: escapeAttr(link),
    EXPIRE_DATE: escapeAttr(expiresAtParts.date),
    EXPIRE_TIME: escapeAttr(expiresAtParts.time),
    REQUIRED_ATTR: task.status === "生效中" ? "required" : "",
  });
  openFormModal("收集任务邀请", html, (form) => {
    const data = Object.fromEntries(new FormData(form));
    task.status = data.status;
    if (data.status === "已失效") {
      task.expiresAt = nowText();
    } else if (data.expiresAtDate && data.expiresAtTime) {
      task.expiresAt = `${data.expiresAtDate} ${data.expiresAtTime}`;
    }
    saveDb();
    closeFormModal();
    render();
    showToast("收集任务已保存");
  });
  document.querySelector("[name='status']").value = task.status;
  document.querySelector("[name='status']")?.addEventListener("change", (event) => {
    const expiresInputs = document.querySelectorAll("[name='expiresAtDate'], [name='expiresAtTime']");
    if (event.target.value === "生效中") {
      expiresInputs.forEach((input) => input.required = true);
    } else {
      expiresInputs.forEach((input) => input.required = false);
    }
  });
  document.querySelector("#copyCollectLink")?.addEventListener("click", () => copyText(link));
  document.querySelector("#openCollectLink")?.addEventListener("click", () => window.open(link, "_blank"));
  document.querySelector("#simulateCollectUpload")?.addEventListener("click", () => openCollectorUploadModal(index));
}

function openCollectorUploadModal(index) {
  const task = db.collectTasks[index];
  closeFormModal();
  const html = renderHtmlTemplate("tplCollectorUploadForm", {
    GROUP_NAME: escapeHtml(task.group),
    UPLOAD_ACCEPT,
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
      const asset = await createAssetFromFile(file, { validUntilDate: formDateTimeValue(data, "validUntil") || "", customTags: splitTags(data.businessTags || "") });
      const targetGroup = db.groups.find((group) => group.name === task.group);
      asset.groupId = targetGroup?.id || "all";
      asset.status = "pending";
      asset.desc = data.note || asset.desc;
      asset.logs.unshift(`${data.author || "外部用户"} 通过收集任务上传素材`);
      db.assets.unshift(asset);
    }
    saveDb();
    closeFormModal();
    state.page = "pending";
    render();
    showToast(`已提交 ${files.length} 个素材到待入库`);
  });
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
    asset.logs.unshift(`${currentUser.name} 设置了素材有效期`);
    saveDb();
    closeFormModal();
    render();
    if (!els.viewer.classList.contains("hidden")) renderViewer();
    showToast("有效期已更新");
  });
  const dateInput = document.querySelector("[name='validUntilDate']");
  const timeInput = document.querySelector("[name='validUntilTime']");
  if (dateInput) dateInput.value = validUntilParts.date;
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

function openPermissionRequestModal(id) {
  const asset = findAsset(id);
  if (!asset) return;
  
  document.querySelector("#permissionRequestAssetName").textContent = escapeHtml(asset.name);
  document.querySelector("#permissionRequestModal").classList.remove("hidden");
  
  const handleSubmit = (event) => {
    event.preventDefault();
    const form = document.querySelector("#permissionRequestForm");
    const data = Object.fromEntries(new FormData(form));
    
    asset.permissionRequests = asset.permissionRequests || [];
    asset.permissionRequests.unshift({
      permission: data.permission,
      duration: data.duration,
      reason: data.reason.trim(),
      user: currentUser.name,
      createdAt: nowText(),
      status: "待审批",
    });
    asset.logs.unshift(`${currentUser.name} 申请了${data.permission}权限`);
    saveDb();
    closePermissionRequestModal();
    
    if (!els.viewer.classList.contains("hidden")) {
      state.detailTab = "log";
      renderViewer();
    }
    showToast("编辑权限申请已提交，状态：待审批");
    
    form.reset();
  };
  
  const form = document.querySelector("#permissionRequestForm");
  form.removeEventListener("submit", handleSubmit);
  form.addEventListener("submit", handleSubmit);
}

function closePermissionRequestModal() {
  document.querySelector("#permissionRequestModal").classList.add("hidden");
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

function rerunRecognition(id) {
  const asset = findAsset(id);
  if (!asset) return;
  asset.aiTags = recognizeTags({ name: asset.name, type: asset.mime || "" }, { width: asset.width, height: asset.height, color: asset.color });
  asset.updatedAt = nowText();
  asset.logs.unshift(`系统重新识别标签：${asset.aiTags.join("、")}`);
  saveDb();
  render();
  showToast("已重新识别内容标签");
}

function softDeleteAsset(id) {
  const asset = findAsset(id);
  if (!asset) return;
  asset.status = "deleted";
  asset.updatedAt = nowText();
  asset.deletedAt = asset.updatedAt;
  asset.logs.unshift(`${currentUser.name} 删除了素材`);
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
  asset.status = "active";
  asset.deletedAt = "";
  asset.logs.unshift(`${currentUser.name} 恢复了素材`);
  saveDb();
  render();
  showToast("素材已恢复");
}

function restoreSelectedRecycleAssets() {
  const selectedDeletedAssets = db.assets.filter((asset) => asset.status === "deleted" && state.selectedIds.has(asset.id));
  if (!selectedDeletedAssets.length) {
    showToast("请先选择要恢复的素材");
    return;
  }
  selectedDeletedAssets.forEach((asset) => {
    const group = db.groups.find((item) => item.id === asset.groupId);
    asset.status = "active";
    asset.deletedAt = "";
    asset.updatedAt = nowText();
    if (!group || group.status === "deleted") asset.groupId = "all";
    asset.logs.unshift(`${currentUser.name} 批量恢复了素材`);
  });
  state.selectedIds.clear();
  saveDb();
  render();
  showToast(`已恢复 ${selectedDeletedAssets.length} 个素材`);
}

function hardDeleteAsset(id) {
  if (!id) return;
  const asset = findAsset(id);
  if (!asset) {
    showToast("素材不存在");
    return;
  }
  db.assets = db.assets.filter((a) => a.id !== id);
  saveDb();
  render();
  showToast("素材已彻底删除");
}

function downloadAsset(id, type = "original") {
  const asset = findAsset(id);
  if (!asset) return;
  const link = document.createElement("a");
  link.href = asset.src;
  let filename = asset.name;
  if (type === "web") filename += "-web";
  if (type === "preview") filename += "-preview";
  link.download = `${filename}.${asset.format.toLowerCase()}`;
  link.click();
  asset.download += 1;
  asset.logs.unshift(`${currentUser.name} 下载了素材${type !== "original" ? `(${type})` : ""}`);
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
