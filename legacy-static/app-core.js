const STORAGE_KEY = "dp-material-library-state-v2";

const defaultGroups = [
  { id: "all", name: "全部素材", count: 0, depth: 0, system: true, status: "active" },
  { id: "smart", name: "杨文婷的智能内容素材", count: 0, depth: 0, status: "active" },
  { id: "redbook", name: "小红书平台素材", count: 3, depth: 0, status: "active" },
  { id: "shanghai", name: "上海车展活动素材", count: 1, depth: 0, status: "active" },
  { id: "test", name: "凡尔赛素材-测试", count: 2, depth: 0, active: true, status: "active" },
  { id: "versailles", name: "凡尔赛 618车展", count: 2, depth: 1, parentId: "test", status: "active" },
  { id: "aaa", name: "AAA", count: 0, depth: 0, status: "active" },
];

const seedNames = [
  "36a7d3e32e9b986cfcbd57615feb3581",
  "164011bfc089218e4b1198e84b7f5ac0",
  "b5705b3f21c00ce2b51156d9b77cd24d",
  "874a2397b52a68fc1aaa4ce44ca329c0",
  "07a317c06ae89c27a30fbd9b18091fd3",
  "f847ff391e646206fc197c53befa2b6b",
  "f76fcff8eb086627f74396840040aa7c",
  "ea6d963b2033f743fd877c40d80a7d3d",
  "c626bd5f118614e8f93c7238aa06342e",
  "e5966dff97c0892db999dd3e45cc4f6f",
  "c5388969f15a10e49c6e78ef2b97c077",
  "a2f6b7922b18cdcfc56152b6712deb46",
];

const VEHICLE_MODELS = ["4008", "408", "5008", "508L", "凡尔赛C5X", "天逸"];
const FILE_FORMAT_CATEGORIES = {
  图片: ["JPG", "JPEG", "PNG", "TIF", "TIFF", "WEBP", "GIF", "SVG", "BMP", "HEIC", "PIC"],
  视频: ["MP4", "MOV", "M4V", "AVI", "MKV", "RMVB", "RM", "MPG", "FLV", "TS", "AEP"],
  文档: ["PDF", "DOC", "DOCX", "PPT", "PPTX", "WPS", "PAGES", "KEY", "TXT"],
  设计源文件: ["PSD", "AI", "PSB", "SKETCH", "C4D", "PS", "CORELDRAW", "EPS"],
  纯文本: ["TEXT"],
  表格: ["XLS", "XLSX", "CSV", "NUMBERS"],
  字体文件: ["TTF", "TTC", "OTF"],
  音频: ["MP3", "M4A", "WAV"],
  压缩包: ["ZIP", "RAR", "7Z", "GZ"],
  三维模型文件: ["3DM", "3DS", "3MF", "AMF", "BIM", "BREP", "DAE", "FBX", "FCSTD", "IFC", "IGES", "STEP", "STL", "OBJ", "OFF", "PLY"],
};
const UPLOAD_FILE_FORMATS = Object.values(FILE_FORMAT_CATEGORIES).flat();
const UPLOAD_ACCEPT = UPLOAD_FILE_FORMATS.map((format) => `.${format.toLowerCase()}`).join(",");
const COLLECT_TASK_FILE_TYPES = Object.keys(FILE_FORMAT_CATEGORIES);

function getExpireDate(daysFromNow) {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day} 23:59`;
}

const seedAssets = seedNames.map((name, index) => {
  const expireDays = [365, 30, 90, 7, 180, 365, 30, 90, 7, 180, 365, 30][index];
  const expireDate = getExpireDate(expireDays);
  return ({
    id: `seed-${index + 108}`,
    name,
    src: `assets/asset-${String(index + 1).padStart(2, "0")}.jpg`,
    format: index < 5 ? "JPEG" : "MP4",
    mime: "image/jpeg",
    type: index < 5 ? "图片" : "视频",
    sizeBytes: [485919, 160420, 101468, 99963, 98928, 1730150, 1478492, 1960837, 1290000, 1373634, 3565158, 1436549][index],
    width: index < 5 ? 3000 : 1080,
    height: index < 5 ? 2000 : 1920,
    desc: index === 0 ? "活动素材" : "",
    brand: index % 3 === 0 ? "东风标致" : "东风雪铁龙",
    model: VEHICLE_MODELS[index % VEHICLE_MODELS.length],
    customTags: [["试驾活动"], ["车展物料","618促销"], ["产品宣传","自媒体推广"], ["经销商素材"], ["KOL合作"], ["车展物料"], ["618促销","自媒体推广"], ["产品宣传"], ["KOL合作","试驾活动"], ["经销商素材","售后服务"], ["国庆活动"], ["车展物料","618促销"]][index] || [],
    aiTags: [["汽车","户外场景","城市街道","品牌Logo"], ["产品特写","外观展示","汽车"], ["汽车","高清锐利","外观展示"], ["户外场景","自然风光","汽车"], ["汽车","内饰展示","胶片颗粒感"], ["人物","活动","汽车"], ["汽车","赛道","高清锐利"], ["户外场景","城市街道","横版"], ["产品特写","灯光细节","竖版"], ["汽车","外观展示","柔光朦胧"], ["人物","品牌Logo","活动"], ["汽车","内饰展示","产品特写"]][index] || [],
    color: index < 5 ? "蓝色" : "红色",
    groupId: index < 2 ? "test" : index < 5 ? "redbook" : "all",
    owner: "Kerry",
    department: "采购",
    permission: "企业内部 - 可下载",
    validUntil: expireDate,
    validUntilDate: expireDate,
    validStart: "2026-05-26 00:00",
    status: "active",
    share: index % 2,
    download: index % 3,
    view: [0, 3, 3, 2, 0, 24, 9, 11, 8, 6, 5, 5][index],
    createdAt: "2026/05/26 17:38",
    updatedAt: "2026/05/26 17:38",
    version: `2026052${index < 5 ? 5 : 6}16${String(1783847578 + index * 913951).slice(0, 8)}`,
    logs: [
      "Kerry 上传了素材",
      "Kerry 将此素材操作入库",
      "Kerry 下载了素材",
    ],
  });
});

const seedTags = [
  // ===== 业务标签 (tagType=1, 单层扁平) =====

  { id: "tag-biz-002", tagName: "车展物料", tagCode: "motor_show", tagType: 1, parentId: 0, level: 0, aiSource: 0, aiRecognitionEnabled: 1, isVisible: 1, status: 1, sortOrder: 2, description: "各车展现场展示及宣传物料", createdBy: "杨文婷", createdAt: "2026-02-20 10:15:00", updatedAt: "2026-05-18 16:30:00" },
  { id: "tag-biz-003", tagName: "产品宣传", tagCode: "product_promo", tagType: 1, parentId: 0, level: 0, aiSource: 0, aiRecognitionEnabled: 1, isVisible: 1, status: 1, sortOrder: 3, description: "车型产品力宣传物料", createdBy: "Kerry", createdAt: "2026-04-01 08:00:00", updatedAt: "2026-05-22 11:00:00" },
  { id: "tag-biz-004", tagName: "经销商素材", tagCode: "dealer", tagType: 1, parentId: 0, level: 0, aiSource: 0, aiRecognitionEnabled: 1, isVisible: 1, status: 1, sortOrder: 4, description: "经销商渠道门店推广素材", createdBy: "杨文婷", createdAt: "2026-01-10 14:00:00", updatedAt: "2026-04-15 09:00:00" },
  { id: "tag-biz-005", tagName: "618促销", tagCode: "promo_618", tagType: 1, parentId: 0, level: 0, aiSource: 0, aiRecognitionEnabled: 1, isVisible: 1, status: 1, sortOrder: 5, description: "618电商大促相关素材", createdBy: "Kerry", createdAt: "2026-05-01 10:00:00", updatedAt: "2026-06-01 08:00:00" },
  { id: "tag-biz-006", tagName: "国庆活动", tagCode: "national_day", tagType: 1, parentId: 0, level: 0, aiSource: 0, aiRecognitionEnabled: 1, isVisible: 1, status: 1, sortOrder: 6, description: "国庆节营销活动素材", createdBy: "杨文婷", createdAt: "2026-04-20 09:00:00", updatedAt: "2026-05-10 14:00:00" },
  { id: "tag-biz-007", tagName: "自媒体推广", tagCode: "social_media", tagType: 1, parentId: 0, level: 0, aiSource: 0, aiRecognitionEnabled: 1, isVisible: 1, status: 1, sortOrder: 7, description: "微博、抖音、小红书等自媒体平台推广素材", createdBy: "Kerry", createdAt: "2026-03-01 11:00:00", updatedAt: "2026-05-25 16:00:00" },
  { id: "tag-biz-008", tagName: "KOL合作", tagCode: "kol", tagType: 1, parentId: 0, level: 0, aiSource: 0, aiRecognitionEnabled: 1, isVisible: 1, status: 1, sortOrder: 8, description: "与KOL/KOC合作产出的推广素材", createdBy: "杨文婷", createdAt: "2026-02-15 10:00:00", updatedAt: "2026-04-30 09:00:00" },
  { id: "tag-biz-009", tagName: "试驾活动", tagCode: "test_drive", tagType: 1, parentId: 0, level: 0, aiSource: 0, aiRecognitionEnabled: 1, isVisible: 1, status: 1, sortOrder: 9, description: "试驾体验活动相关素材", createdBy: "Kerry", createdAt: "2026-04-10 15:00:00", updatedAt: "2026-05-15 10:00:00" },
  { id: "tag-biz-010", tagName: "售后服务", tagCode: "after_sales", tagType: 1, parentId: 0, level: 0, aiSource: 0, aiRecognitionEnabled: 1, isVisible: 1, status: 1, sortOrder: 10, description: "售后服务、保养维修相关素材", createdBy: "杨文婷", createdAt: "2026-01-20 09:00:00", updatedAt: "2026-03-10 11:00:00" },

  // ===== AI标签 (tagType=2, 支持父级层级) =====
  // -- 顶层 AI 父标签 --
  { id: "tag-ai-001", tagName: "汽车", tagCode: "auto_car", tagType: 2, parentId: "", level: 0, aiSource: 1, aiRecognitionEnabled: 1, isVisible: 1, status: 1, sortOrder: 1, description: "汽车品类顶级标签，AI自动识别", createdBy: "系统", createdAt: "2026-01-01 00:00:00", updatedAt: "2026-01-01 00:00:00" },
  { id: "tag-ai-002", tagName: "画面质感", tagCode: "visual_texture", tagType: 2, parentId: "", level: 0, aiSource: 2, aiRecognitionEnabled: 1, isVisible: 1, status: 1, sortOrder: 2, description: "画面质感分类（业务预定义，期望AI识别）", createdBy: "Kerry", createdAt: "2026-03-10 14:00:00", updatedAt: "2026-04-01 10:00:00" },
  { id: "tag-ai-003", tagName: "户外场景", tagCode: "outdoor", tagType: 2, parentId: "", level: 0, aiSource: 1, aiRecognitionEnabled: 1, isVisible: 1, status: 1, sortOrder: 3, description: "户外场景识别分类", createdBy: "系统", createdAt: "2026-01-01 00:00:00", updatedAt: "2026-01-01 00:00:00" },
  { id: "tag-ai-004", tagName: "产品特写", tagCode: "product_closeup", tagType: 2, parentId: "", level: 0, aiSource: 2, aiRecognitionEnabled: 1, isVisible: 1, status: 1, sortOrder: 4, description: "产品局部与特写识别分类", createdBy: "Kerry", createdAt: "2026-04-05 09:00:00", updatedAt: "2026-05-01 11:00:00" },

  // -- 画面质感 子标签 --
  { id: "tag-ai-011", tagName: "胶片颗粒感", tagCode: "film_grain", tagType: 2, parentId: "画面质感", level: 1, aiSource: 1, aiRecognitionEnabled: 1, isVisible: 1, status: 1, sortOrder: 1, description: "具有胶片颗粒质感的画面风格", createdBy: "系统", createdAt: "2026-03-15 08:00:00", updatedAt: "2026-03-15 08:00:00" },
  { id: "tag-ai-012", tagName: "高清锐利", tagCode: "hd_sharp", tagType: 2, parentId: "画面质感", level: 1, aiSource: 2, aiRecognitionEnabled: 1, isVisible: 1, status: 1, sortOrder: 2, description: "高清无噪点的锐利画面", createdBy: "Kerry", createdAt: "2026-04-01 15:00:00", updatedAt: "2026-04-01 15:00:00" },
  { id: "tag-ai-013", tagName: "柔光朦胧", tagCode: "soft_dreamy", tagType: 2, parentId: "画面质感", level: 1, aiSource: 1, aiRecognitionEnabled: 1, isVisible: 1, status: 1, sortOrder: 3, description: "柔光、朦胧或雾化效果的画面", createdBy: "系统", createdAt: "2026-04-20 10:00:00", updatedAt: "2026-04-20 10:00:00" },

  // -- 户外场景 子标签 --
  { id: "tag-ai-021", tagName: "城市街道", tagCode: "city_street", tagType: 2, parentId: "户外场景", level: 1, aiSource: 1, aiRecognitionEnabled: 1, isVisible: 1, status: 1, sortOrder: 1, description: "城市道路、街景背景", createdBy: "系统", createdAt: "2026-02-01 12:00:00", updatedAt: "2026-02-01 12:00:00" },
  { id: "tag-ai-022", tagName: "自然风光", tagCode: "nature", tagType: 2, parentId: "户外场景", level: 1, aiSource: 1, aiRecognitionEnabled: 1, isVisible: 1, status: 1, sortOrder: 2, description: "山川、湖泊、森林等自然景观", createdBy: "系统", createdAt: "2026-02-01 12:00:00", updatedAt: "2026-02-01 12:00:00" },
  { id: "tag-ai-023", tagName: "赛道", tagCode: "racetrack", tagType: 2, parentId: "户外场景", level: 1, aiSource: 2, aiRecognitionEnabled: 1, isVisible: 1, status: 1, sortOrder: 3, description: "赛道或试驾场地场景", createdBy: "Kerry", createdAt: "2026-05-10 08:00:00", updatedAt: "2026-05-10 08:00:00" },

  // -- 产品特写 子标签 --
  { id: "tag-ai-031", tagName: "内饰展示", tagCode: "interior", tagType: 2, parentId: "产品特写", level: 1, aiSource: 1, aiRecognitionEnabled: 1, isVisible: 1, status: 1, sortOrder: 1, description: "车内饰细节展示", createdBy: "系统", createdAt: "2026-03-01 08:00:00", updatedAt: "2026-03-01 08:00:00" },
  { id: "tag-ai-032", tagName: "外观展示", tagCode: "exterior", tagType: 2, parentId: "产品特写", level: 1, aiSource: 1, aiRecognitionEnabled: 1, isVisible: 1, status: 1, sortOrder: 2, description: "车外观整体及局部展示", createdBy: "系统", createdAt: "2026-03-01 08:00:00", updatedAt: "2026-03-01 08:00:00" },
  { id: "tag-ai-033", tagName: "灯光细节", tagCode: "light_detail", tagType: 2, parentId: "产品特写", level: 1, aiSource: 2, aiRecognitionEnabled: 1, isVisible: 1, status: 1, sortOrder: 3, description: "车灯设计细节特写", createdBy: "Kerry", createdAt: "2026-05-12 10:00:00", updatedAt: "2026-05-12 10:00:00" },

  // -- 其他 AI 标签（无子标签的独立标签） --
  { id: "tag-ai-040", tagName: "人物", tagCode: "people", tagType: 2, parentId: "", level: 0, aiSource: 1, aiRecognitionEnabled: 1, isVisible: 1, status: 1, sortOrder: 5, description: "画面中包含人物", createdBy: "系统", createdAt: "2026-01-01 00:00:00", updatedAt: "2026-01-01 00:00:00" },
  { id: "tag-ai-041", tagName: "品牌Logo", tagCode: "brand_logo", tagType: 2, parentId: "", level: 0, aiSource: 2, aiRecognitionEnabled: 1, isVisible: 1, status: 1, sortOrder: 6, description: "包含品牌标志的画面", createdBy: "Kerry", createdAt: "2026-04-08 09:00:00", updatedAt: "2026-04-08 09:00:00" },
  { id: "tag-ai-042", tagName: "活动", tagCode: "event", tagType: 2, parentId: "", level: 0, aiSource: 1, aiRecognitionEnabled: 1, isVisible: 1, status: 1, sortOrder: 7, description: "活动现场拍摄的素材", createdBy: "系统", createdAt: "2026-02-01 00:00:00", updatedAt: "2026-02-01 00:00:00" },
  { id: "tag-ai-043", tagName: "横版", tagCode: "landscape", tagType: 2, parentId: "", level: 0, aiSource: 1, aiRecognitionEnabled: 1, isVisible: 1, status: 1, sortOrder: 8, description: "横版画幅素材", createdBy: "系统", createdAt: "2026-01-01 00:00:00", updatedAt: "2026-01-01 00:00:00" },
  { id: "tag-ai-044", tagName: "竖版", tagCode: "portrait", tagType: 2, parentId: "", level: 0, aiSource: 1, aiRecognitionEnabled: 1, isVisible: 1, status: 1, sortOrder: 9, description: "竖版画幅素材", createdBy: "系统", createdAt: "2026-01-01 00:00:00", updatedAt: "2026-01-01 00:00:00" },
];

const filterLabels = ["素材来源", "文件格式", "车型", "品牌", "权限范围", "业务标签", "AI标签", "上传时间", "素材失效日"];
const configurableFilters = [...filterLabels, "文件宽度", "文件高度", "宽高比", "文件大小"];

let db = loadDb();
const state = {
  page: "all",
  groupId: "all",
  view: "compact",
  query: "",
  sort: "素材热度",
  activeFilter: null,
  filters: {},
  visibleFilters: [...filterLabels],
  showGroupDescendants: false,
  selectedAssetId: db.assets[0]?.id || "",
  detailTab: "overview",
  similar: false,
  selectedIds: new Set(),
  collapsedGroupIds: new Set(),
  manageValidity: "全部",
  recycleSort: "deletedDesc",
  theme: localStorage.getItem("dp-material-library-theme") || "light",
  zoomLevel: 100,
  panX: 0,
  panY: 0,
  isPanning: false,
  detailPanelWidth: Number(localStorage.getItem("dp-material-library-detail-width")) || 600,
  detailPanelHeight: Number(localStorage.getItem("dp-material-library-detail-height")) || 300,
  detailPanelDock: "side",
};

const currentUser = { name: "Kerry", role: "admin", department: "采购" };

function isAdmin() {
  return currentUser.role === "admin";
}

function canManageAsset(asset) {
  return isAdmin() || asset?.owner === currentUser.name;
}

const els = {
  mainNav: document.querySelector("#mainNav"),
  groupTree: document.querySelector("#groupTree"),
  pageTitle: document.querySelector("#pageTitle"),
  breadcrumb: document.querySelector("#breadcrumb"),
  pageActions: document.querySelector("#pageActions"),
  filters: document.querySelector("#filters"),
  contentPanel: document.querySelector("#contentPanel"),
  assetToolbar: document.querySelector("#assetToolbar"),
  globalSearch: document.querySelector("#globalSearch"),
  viewSwitch: document.querySelector("#viewSwitch"),
  sizeSlider: document.querySelector("#sizeSlider"),
  sortButton: document.querySelector("#sortButton"),
  sortLabel: document.querySelector("#sortLabel"),
  sortDropdown: document.querySelector("#sortDropdown"),
  moreMenu: document.querySelector("#moreMenu"),
  assetMenu: document.querySelector("#assetMenu"),
  previewPop: document.querySelector("#previewPop"),
  filterModal: document.querySelector("#filterModal"),
  tagBank: document.querySelector("#tagBank"),
  selectedTags: document.querySelector("#selectedTags"),
  filterConfig: document.querySelector("#filterConfig"),
  similarSearch: document.querySelector("#similarSearch"),
  imageSearchButton: document.querySelector("#imageSearchButton"),
  clearSimilar: document.querySelector("#clearSimilar"),
  closeSimilar: document.querySelector("#closeSimilar"),
  viewer: document.querySelector("#viewer"),
  viewerName: document.querySelector("#viewerName"),
  viewerImage: document.querySelector("#viewerImage"),
  closeViewer: document.querySelector("#closeViewer"),
  detailTabs: document.querySelector("#detailTabs"),
  detailContent: document.querySelector("#detailContent"),
  imageCanvas: document.querySelector("#imageCanvas"),
  zoomLevel: document.querySelector("#zoomLevel"),
  sidebar: document.querySelector("#sidebar"),
  sidebarOverlay: document.querySelector("#sidebarOverlay"),
  mobileMenuToggle: document.querySelector("#mobileMenuToggle"),
  sidebarClose: document.querySelector("#sidebarClose"),
};


function bootstrap() {
  localStorage.removeItem("dp-material-library-detail-dock");
  ensureRuntimeElements();
  migrateVehicleModels();
  migrateAssetMetadata();
  migrateShareExpiresAt();
  renderShell();
  const collectCode = new URLSearchParams(window.location.search).get("collect");
  if (collectCode) {
    renderCollectorPortal(collectCode);
    return;
  }
  const shareId = new URLSearchParams(window.location.search).get("share");
  if (shareId) {
    renderSharePortal(shareId);
    return;
  }
  const pageParam = new URLSearchParams(window.location.search).get("page");
  if (pageParam) state.page = pageParam;
  applyHashState();
  normalizePageState();
  bindEvents();
  render();
  if (state.selectedAssetId && location.hash.startsWith("#asset=")) setTimeout(() => openViewer(state.selectedAssetId), 0);
}

function normalizePageState() {
  const validPages = ["all", "pending", "created", "more", "activity", "tags", "validity", "collect", "share", "recycle"];
  if (!validPages.includes(state.page)) {
    state.page = "all";
    state.groupId = "all";
  }
}

function applyHashState() {
  const hash = location.hash.slice(1);
  if (!hash) return;
  const [key, rawValue] = hash.split("=");
  const value = decodeURIComponent(rawValue || "");
  if (key === "group" && db.groups.some((group) => group.id === value)) {
    state.page = "all";
    state.groupId = value;
  }
  if (key === "asset" && findAsset(value)) {
    state.page = "all";
    state.selectedAssetId = value;
  }
}

function migrateVehicleModels() {
  let changed = false;
  db.assets.forEach((asset, index) => {
    if (!VEHICLE_MODELS.includes(asset.model)) {
      asset.model = detectVehicleModel(asset.name) || VEHICLE_MODELS[index % VEHICLE_MODELS.length];
      changed = true;
    }
  });
  if (changed) saveDb();
}

function calculateExpireTime(relativeExpires) {
  if (!relativeExpires || relativeExpires === "永久有效") {
    const date = new Date();
    date.setFullYear(date.getFullYear() + 100);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day} 23:59`;
  }
  const match = relativeExpires.match(/(\d+)/);
  if (!match) {
    const date = new Date();
    date.setFullYear(date.getFullYear() + 100);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day} 23:59`;
  }
  const days = parseInt(match[1], 10);
  const date = new Date();
  date.setDate(date.getDate() + days);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day} 23:59`;
}

function isShareExpired(expiresAt) {
  if (expiresAt === "永久有效" || expiresAt === "已关闭") return false;
  const now = new Date();
  const expireDate = new Date(expiresAt.replace(/-/g, "/"));
  return now > expireDate;
}

function migrateShareExpiresAt() {
  let changed = false;
  db.shares.forEach((share) => {
    if (!share.targetType) {
      share.targetType = "group";
      share.targetId = "all";
      share.code = share.code || Math.random().toString(36).slice(2, 8);
      share.link = share.link || getShareLink(share.targetType, share.targetId, share.code);
      changed = true;
    }
    if (share.expiresAt === "已关闭") {
      share.expiresAt = "已关闭";
    } else if (!/^\d{4}-\d{2}-\d{2}/.test(share.expiresAt)) {
      share.expiresAt = calculateExpireTime(share.expiresAt);
      changed = true;
    }
  });
  if (changed) saveDb();
}

function migrateAssetMetadata() {
  let changed = false;
  db.assets.forEach((asset) => {
    const uploadDate = normalizeDateText(asset.uploadDate || asset.createdAt || asset.updatedAt);
    if (!asset.uploadDate) {
      asset.uploadDate = uploadDate;
      changed = true;
    }
    if (!asset.validStart) {
      asset.validStart = normalizeDateTimeText(asset.createdAt || asset.updatedAt || uploadDate, "00:00");
      changed = true;
    }
    if (asset.validUntil && !asset.validUntilDate) {
      if (/^\d{4}[-/]\d{2}[-/]\d{2}/.test(String(asset.validUntil))) {
        asset.validUntilDate = normalizeDateTimeText(asset.validUntil, "23:59");
      } else {
        asset.validUntilDate = calculateExpireTime(asset.validUntil);
      }
      changed = true;
    }
    if (asset.validUntilDate && asset.validUntil !== asset.validUntilDate) {
      asset.validUntil = asset.validUntilDate;
      changed = true;
    }
    if (!asset.validUntilDate && !asset.validUntil) {
      const defaultExpire = calculateExpireTime("永久有效");
      asset.validUntil = defaultExpire;
      asset.validUntilDate = defaultExpire;
      changed = true;
    }
    if (!asset.validUntil) {
      asset.validUntil = asset.validUntilDate || calculateExpireTime("永久有效");
      changed = true;
    }
    if (!asset.validUntilDate) {
      asset.validUntilDate = asset.validUntil;
      changed = true;
    }
    if (!asset.owner) {
      asset.owner = currentUser.name;
      changed = true;
    }
    if (!asset.department) {
      asset.department = currentUser.department;
      changed = true;
    }
  });
  if (changed) saveDb();
}

function loadDb() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    if (saved?.assets?.length && saved?.groups?.length) {
      if (!saved.tags || !saved.tags.length) { saved.tags = seedTags; localStorage.setItem(STORAGE_KEY, JSON.stringify(saved)); }
      return saved;
    }
  } catch (error) {
    console.warn("本地数据读取失败，已使用默认数据", error);
  }
  return { groups: defaultGroups, assets: seedAssets, tags: seedTags,
    collectTasks: [
      { theme: "上海车展活动素材", group: "上海车展活动素材", status: "已失效", code: "apym", creator: "杨文婷", createdAt: "2026-06-09 20:15", expiresAt: "2026-06-09 20:25" },
      { theme: "小红书", group: "小红书平台素材", status: "已失效", code: "oq9v", creator: "杨文婷", createdAt: "2026-05-25 08:58", expiresAt: "2026-06-01 08:58" },
      { theme: "凡尔赛 618车展", group: "凡尔赛 618车展", status: "生效中", code: "4vlw", creator: "Kerry", createdAt: "2026-05-22 17:15", expiresAt: "2026-08-20 17:15" },
    ],
    shares: [
      { group: "凡尔赛 618车展", user: "杨文婷", access: "分享给互联网用户（无需登录）", visits: 2, views: 2, downloads: 0, sharedAt: "2026.03.31 18:06:55", expiresAt: "2026-04-07 18:06", targetType: "group", targetId: "versailles", code: "abc123", link: "" },
    ],
  };
}

function saveDb() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  } catch (error) {
    showToast("浏览器本地存储空间不足，当前数据仅在本次页面打开期间保留");
  }
}

function getCollectLink(code) {
  const url = new URL(window.location.href);
  url.search = "";
  url.hash = "";
  url.searchParams.set("collect", code);
  return url.href;
}

function getLibraryLink(page = "all") {
  const url = new URL(window.location.href);
  url.search = "";
  url.hash = "";
  if (page) url.searchParams.set("page", page);
  return url.href;
}

function getShareLink(targetType, targetId, code) {
  const url = new URL(window.location.href);
  url.search = "";
  url.hash = "";
  url.searchParams.set("share", `${targetType}:${targetId}:${code}`);
  return url.href;
}

function getQrImageUrl(link) {
  return `https://api.qrserver.com/v1/create-qr-code/?size=180x180&margin=8&data=${encodeURIComponent(link)}`;
}

async function copyText(value) {
  try {
    await navigator.clipboard.writeText(value);
    showToast("链接已复制");
  } catch (error) {
    showToast("当前浏览器不允许自动复制，请手动复制输入框里的链接");
  }
}

function renderCollectorPortal(code) {
  const task = db.collectTasks.find((item) => item.code === code);
  document.body.className = "collector-body";
  if (!task) {
    document.body.innerHTML = `<main class="collector-page"><section class="collector-card"><div class="brand-mini"><b>DPCA</b><span>神龙汽车有限公司素材库</span></div><h1>收集链接无效</h1><p>请确认访问密码或联系素材库管理员重新发送链接。</p></section></main>`;
    return;
  }
  document.body.innerHTML = `
    <main class="collector-page">
      <section class="collector-card">
        <div class="brand-mini"><b>DPCA</b><span>神龙汽车有限公司素材库</span></div>
        <h1>${escapeHtml(task.theme)}</h1>
        <p>请上传本次收集任务需要的图片、视频或文档。提交后素材会进入「待入库」，由管理员审核入库。</p>
        <div class="collector-target"><span>存放素材组</span><strong>${escapeHtml(task.group)}</strong><span>访问密码</span><strong>${escapeHtml(task.code)}</strong></div>
        <form id="collectorForm">
          <label>提交人<input name="author" placeholder="姓名 / 部门 / 联系方式" required /></label>
          <label>素材说明<textarea name="note" placeholder="补充用途、活动、车型、版权说明等"></textarea></label>
          <label>业务标签<input name="businessTags" placeholder="例如：618活动、经销商，多个标签用逗号分隔" /></label>
          <label>选择文件<input name="files" type="file" multiple required accept="${UPLOAD_ACCEPT}" /></label>
          <label>素材失效时间
            <div class="date-time-row">
              <input name="validUntilDate" type="date" readonly inputmode="none" />
              <input name="validUntilTime" type="time" readonly inputmode="none" />
            </div>
          </label>
          <div class="collector-actions"><button type="submit">上传到待入库</button><a href="${escapeAttr(getCollectLink(code))}">刷新页面</a></div>
        </form>
        <div class="collector-result hidden" id="collectorResult"></div>
      </section>
    </main>`;
  document.querySelector("#collectorForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form));
    const files = [...form.querySelector("[name='files']").files];
    if (!files.length) return;
    for (const file of files) {
      const asset = await createAssetFromFile(file, { validUntilDate: formDateTimeValue(data, "validUntil") || "", customTags: splitTags(data.businessTags || "") });
      const targetGroup = db.groups.find((group) => group.name === task.group);
      asset.groupId = targetGroup?.id || "all";
      asset.status = "pending";
      asset.owner = data.author.trim() || "外部提交";
      asset.department = "外部收集";
      asset.desc = data.note.trim();
      asset.logs.unshift(`${asset.owner} 通过收集链接上传素材`);
      db.assets.unshift(asset);
    }
    saveDb();
    form.reset();
    const result = document.querySelector("#collectorResult");
    result.classList.remove("hidden");
    setTimeout(() => {
      result.innerHTML = `已提交 ${files.length} 个素材，管理员可在「待入库」审核。<a href="${escapeAttr(getLibraryLink("pending"))}">进入待入库</a>`;
    }, 0);
    result.textContent = `已提交 ${files.length} 个素材，管理员可在素材库「待入库」查看。`;
  });
}

function renderSharePortal(token) {
  const [targetType, targetId, code] = token.split(":");
  const share = db.shares.find((item) => item.code === code && item.targetId === targetId && item.targetType === targetType);
  document.body.className = "collector-body";
  if (!share) {
    document.body.innerHTML = `<main class="collector-page"><section class="collector-card"><div class="brand-mini"><b>DPCA</b><span>神龙汽车有限公司素材库</span></div><h1>分享链接无效</h1><p>请确认链接是否完整，或联系素材库管理员重新分享。</p></section></main>`;
    return;
  }
  share.visits += 1;
  saveDb();
  const assets = targetType === "asset"
    ? db.assets.filter((asset) => asset.id === targetId)
    : targetType === "basket"
      ? db.assets.filter((asset) => targetId.split(",").includes(asset.id))
    : db.assets.filter((asset) => targetId === "all" ? asset.status !== "deleted" : asset.groupId === targetId);
  document.body.innerHTML = `
    <main class="share-page">
      <header class="share-hero">
        <div class="brand-mini"><b>DPCA</b><span>神龙汽车有限公司素材库</span></div>
        <h1>${escapeHtml(share.group || "分享素材")}</h1>
        <p>${escapeHtml(share.access)} · 有效期：${escapeHtml(share.expiresAt)}</p>
      </header>
      <section class="share-grid">
        ${assets.map((asset) => `
          <article class="share-card">
            <div class="thumb">${asset.mime?.startsWith("image/") ? `<img src="${escapeAttr(asset.src)}" alt="${escapeAttr(asset.name)}" />` : `<div class="file-tile"><b>${escapeHtml(asset.format)}</b></div>`}</div>
            <h2>${escapeHtml(asset.name)}</h2>
            <p>${escapeHtml(asset.format)} · ${formatBytes(asset.sizeBytes)}</p>
            <a download="${escapeAttr(asset.name)}.${escapeAttr(asset.format.toLowerCase())}" href="${escapeAttr(asset.src)}">下载素材</a>
          </article>`).join("") || renderEmpty("暂无可分享素材")}
      </section>
    </main>`;
}

function ensureRuntimeElements() {
  const fileInput = document.createElement("input");
  fileInput.id = "fileInput";
  fileInput.type = "file";
  fileInput.multiple = true;
  fileInput.accept = UPLOAD_ACCEPT;
  fileInput.hidden = true;

  const folderInput = document.createElement("input");
  folderInput.id = "folderInput";
  folderInput.type = "file";
  folderInput.multiple = true;
  folderInput.accept = UPLOAD_ACCEPT;
  folderInput.webkitdirectory = true;
  folderInput.hidden = true;

  const modal = createTemplateNode("tplFormModal") || document.createElement("div");
  if (!modal.id) {
    modal.id = "formModal";
    modal.className = "modal hidden";
    modal.innerHTML = `<div class="modal-card form-card"><header><h2 id="formTitle"></h2><button class="plain-icon" id="formClose" type="button"><span data-icon="x"></span></button></header><form id="formBody"></form></div>`;
  }

  const toast = document.createElement("div");
  toast.id = "toast";
  toast.className = "toast hidden";

  if (!document.querySelector("#viewerResizer")) {
    const detailPanel = document.querySelector(".detail-panel");
    const resizer = document.createElement("div");
    resizer.id = "viewerResizer";
    resizer.className = "viewer-resizer";
    resizer.setAttribute("role", "separator");
    resizer.setAttribute("aria-orientation", "vertical");
    resizer.setAttribute("aria-label", "调整详情面板宽度");
    detailPanel?.before(resizer);
  }

  document.body.append(fileInput, folderInput, modal, toast);
}

function createTemplateNode(id) {
  const template = document.querySelector(`#${id}`);
  return template?.content?.firstElementChild?.cloneNode(true) || null;
}

function renderHtmlTemplate(id, values = {}) {
  const template = document.querySelector(`#${id}`);
  if (!template) return "";
  return template.innerHTML.replace(/\{\{([A-Z0-9_]+)\}\}/g, (_, key) => values[key] ?? "");
}

function renderShell() {
  document.title = "素材库";
  document.body.dataset.theme = state.theme;
  document.querySelector(".brand-mark").textContent = "DPCA";
  document.querySelector(".brand-text strong").textContent = "神龙汽车有限公司";
  document.querySelector(".brand b").textContent = "素材库";
  document.querySelector("#globalSearch").placeholder = "试试在搜索词中增加文件格式，如：手册pdf";
  if (!document.querySelector("#themeToggle")) {
    const toggle = document.createElement("button");
    toggle.id = "themeToggle";
    toggle.className = "theme-toggle";
    toggle.type = "button";
    toggle.title = "切换浅色/深色";
    document.querySelector(".top-icons").prepend(toggle);
  }
  if (!document.querySelector("#basketButton")) {
    const basketButton = document.createElement("button");
    basketButton.id = "basketButton";
    basketButton.className = "basket-button";
    basketButton.type = "button";
    basketButton.title = "素材篮";
    basketButton.setAttribute("aria-label", "打开素材篮");
    basketButton.innerHTML = `<span data-icon="basket"></span><i id="basketCount">0</i>`;
    const topIcons = document.querySelector(".top-icons");
    topIcons.insertBefore(basketButton, topIcons.querySelector("#themeToggle")?.nextSibling || topIcons.firstChild);
  }
  document.querySelector("#themeToggle").textContent = state.theme === "dark" ? "浅" : "深";
  updateBasketCount();

  // mainNav 和 sortDropdown 已改为 HTML 静态定义，无需动态渲染

  renderFilterChips();
  renderFilterConfig();
}

function renderFilterChips() {
  els.filters.innerHTML = state.visibleFilters.map((item) => {
    const selections = getFilterSelections(item);
    const active = selections.length ? `<small>${escapeHtml(formatFilterSelections(selections))}</small>` : "";
    return `<button class="filter-chip ${selections.length ? "active" : ""}" data-filter="${item}" type="button">${item}${active}</button>`;
  }).join("");
}

function renderFilterConfig() {
  els.tagBank.innerHTML = configurableFilters.map((item) => {
    const selected = state.visibleFilters.includes(item);
    return `<button class="${selected ? "" : "inactive"}" data-config-filter="${item}" type="button">${item}</button>`;
  }).join("");
  els.selectedTags.innerHTML = state.visibleFilters.map((item) => `<span data-remove-config="${item}">${item} ×</span>`).join("");
}

function bindEvents() {
  // Mobile sidebar toggle
  if (els.mobileMenuToggle) {
    els.mobileMenuToggle.addEventListener("click", () => {
      els.sidebar.classList.add("open");
      els.sidebarOverlay.classList.remove("hidden");
    });
  }

  if (els.sidebarClose) {
    els.sidebarClose.addEventListener("click", closeMobileSidebar);
  }

  if (els.sidebarOverlay) {
    els.sidebarOverlay.addEventListener("click", closeMobileSidebar);
  }

  function closeMobileSidebar() {
    els.sidebar.classList.remove("open");
    els.sidebarOverlay.classList.add("hidden");
  }

  document.addEventListener("click", (event) => {
    if (!event.target.closest(".menu-pop") && !event.target.closest("[data-more]") && !event.target.closest("[data-filter]") && !event.target.closest("[data-page='more']") && !event.target.closest("[data-group-menu]") && !event.target.closest(".app-grid")) hideMenus();
    if (!event.target.closest(".sort-menu")) document.querySelectorAll(".sort-menu").forEach((item) => item.classList.remove("open"));
  });

  els.mainNav.addEventListener("click", (event) => {
    const button = event.target.closest("[data-page]");
    if (!button) return;
    if (button.dataset.page === "more") {
      event.stopPropagation();
      return showMoreMenu(button);
    }
    state.page = button.dataset.page;
    state.groupId = "all";
    render();
  });

  const allGroupsButton = document.querySelector(".group-head strong");
  if (allGroupsButton) {
    allGroupsButton.setAttribute("role", "button");
    allGroupsButton.setAttribute("tabindex", "0");
    allGroupsButton.setAttribute("title", "查看全部素材组中的全部素材");
    allGroupsButton.style.cursor = "pointer";
    allGroupsButton.addEventListener("click", openAllMaterials);
    allGroupsButton.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openAllMaterials();
      }
    });
  }

  els.groupTree.addEventListener("click", (event) => {
    const toggleButton = event.target.closest("[data-group-toggle]");
    if (toggleButton) {
      event.stopPropagation();
      toggleGroupCollapse(toggleButton.dataset.groupToggle);
      return;
    }
    const menuButton = event.target.closest("[data-group-menu]");
    if (menuButton) {
      event.stopPropagation();
      showGroupMenu(menuButton, menuButton.dataset.groupMenu);
      return;
    }
    const deleteButton = event.target.closest("[data-delete-group]");
    if (deleteButton) {
      event.stopPropagation();
      deleteGroup(deleteButton.dataset.deleteGroup);
      return;
    }
    const button = event.target.closest("[data-group]");
    if (!button) return;
    state.page = "all";
    state.groupId = button.dataset.group;
    render();
  });

  document.querySelector("#createGroupButton")?.addEventListener("click", (event) => {
    event.stopPropagation();
    openGroupModal();
  });
  document.querySelector("#sortGroupsButton")?.addEventListener("click", (event) => {
    event.stopPropagation();
    db.groups.sort((a, b) => (a.depth || 0) - (b.depth || 0) || a.name.localeCompare(b.name, "zh-CN"));
    saveDb();
    render();
    showToast("素材组已按名称排序");
  });
  bindSidebarResize();
  document.querySelector(".app-grid").addEventListener("click", (event) => {
    if (els.moreMenu.classList.contains("hidden")) {
      showAppMenu(event.currentTarget);
    } else {
      hideMenus();
    }
  });
  document.querySelector("#basketButton")?.addEventListener("click", () => {
    const drawer = document.querySelector("#basketDrawer");
    if (drawer?.classList.contains("hidden")) {
      openBasketDrawer();
    } else {
      closeBasketDrawer();
    }
  });
  document.querySelector("#notificationButton")?.addEventListener("click", (event) => {
    event.stopPropagation();
    const menu = document.querySelector("#moreMenu");
    if (menu?.classList.contains("hidden")) {
      showTopIconMenu(event.currentTarget, "notification");
    } else {
      hideMenus();
    }
  });
  document.querySelector("#languageButton")?.addEventListener("click", (event) => {
    event.stopPropagation();
    const menu = document.querySelector("#moreMenu");
    if (menu?.classList.contains("hidden")) {
      showTopIconMenu(event.currentTarget, "language");
    } else {
      hideMenus();
    }
  });
  document.querySelector("#userButton")?.addEventListener("click", (event) => {
    event.stopPropagation();
    const menu = document.querySelector("#moreMenu");
    if (menu?.classList.contains("hidden")) {
      showTopIconMenu(event.currentTarget, "user");
    } else {
      hideMenus();
    }
  });
  document.querySelectorAll(".top-icons button").forEach((button) => {
    if (button.id === "themeToggle" || button.id === "basketButton" || button.id === "notificationButton" || button.id === "languageButton" || button.id === "userButton") return;
    button.addEventListener("click", () => showToast(`${button.getAttribute("title") || "用户菜单"}功能入口已打开`));
  });
  document.querySelector("#basketOverlay")?.addEventListener("click", closeBasketDrawer);
  document.querySelector("#restoreSelectedRecycle")?.addEventListener("click", restoreSelectedRecycleAssets);
  document.querySelector("#emptyRecycle")?.addEventListener("click", emptyRecycleBin);
  document.querySelector("#sortRecycleByDeletedAt")?.addEventListener("click", toggleRecycleDeletedTimeSort);
  document.querySelector("#addTagButton")?.addEventListener("click", openAddTagModal);
  document.querySelector("#mergeTagButton")?.addEventListener("click", openMergeTagModal);
  document.querySelector("#newCollectTask")?.addEventListener("click", openCollectTaskModal);
  els.globalSearch.addEventListener("input", window.AppInfra.utils.debounce((event) => {
    state.query = event.target.value.trim();
    render();
  }, 300));

  els.filters.addEventListener("click", (event) => {
    const button = event.target.closest("[data-filter]");
    if (!button) return;
    showFilterMenu(button, button.dataset.filter);
  });

  els.viewSwitch.addEventListener("click", (event) => {
    const button = event.target.closest("[data-view]");
    if (!button) return;
    state.view = button.dataset.view;
    render();
  });

  els.sizeSlider.addEventListener("input", (event) => {
    document.documentElement.style.setProperty("--card-width", `${event.target.value}px`);
  });

  document.querySelector("#showGroups")?.addEventListener("change", (event) => {
    state.showGroupDescendants = event.target.checked;
    render();
  });

  els.sortButton.addEventListener("click", (event) => {
    event.stopPropagation();
    els.sortButton.closest(".sort-menu")?.classList.toggle("open");
  });
  els.sortDropdown.addEventListener("click", (event) => {
    const button = event.target.closest("[data-sort]");
    if (!button) return;
    state.sort = button.dataset.sort;
    els.sortLabel.textContent = state.sort;
    els.sortButton.closest(".sort-menu")?.classList.remove("open");
    render();
  });

  els.filterConfig?.addEventListener("click", () => {
    renderFilterConfig();
    els.filterModal.classList.remove("hidden");
  });
  document.querySelector('[title="字段配置"]')?.addEventListener("click", openFieldConfigModal);
  els.tagBank.addEventListener("click", (event) => {
    const button = event.target.closest("[data-config-filter]");
    if (!button) return;
    const label = button.dataset.configFilter;
    if (state.visibleFilters.includes(label)) state.visibleFilters = state.visibleFilters.filter((item) => item !== label);
    else state.visibleFilters.push(label);
    renderFilterConfig();
  });
  els.selectedTags.addEventListener("click", (event) => {
    const tag = event.target.closest("[data-remove-config]");
    if (!tag) return;
    state.visibleFilters = state.visibleFilters.filter((item) => item !== tag.dataset.removeConfig);
    delete state.filters[tag.dataset.removeConfig];
    renderFilterConfig();
  });
  document.querySelectorAll("[data-close-modal]").forEach((button) => button.addEventListener("click", () => {
    renderFilterChips();
    els.filterModal.classList.add("hidden");
  }));
  els.imageSearchButton.addEventListener("click", () => {
    state.similar = true;
    state.page = "all";
    render();
  });
  els.clearSimilar.addEventListener("click", () => {
    state.similar = false;
    render();
  });
  els.closeSimilar.addEventListener("click", () => {
    state.similar = false;
    render();
  });

  document.querySelector("#fileInput").addEventListener("change", (event) => openUploadSettingsModal(event.target.files, "file"));
  document.querySelector("#folderInput").addEventListener("change", (event) => openUploadSettingsModal(event.target.files, "folder"));
  document.querySelector("#themeToggle").addEventListener("click", () => {
    state.theme = state.theme === "dark" ? "light" : "dark";
    localStorage.setItem("dp-material-library-theme", state.theme);
    document.body.dataset.theme = state.theme;
    document.querySelector("#themeToggle").textContent = state.theme === "dark" ? "浅" : "深";
    document.querySelector("#themeToggle").setAttribute("aria-pressed", state.theme === "dark" ? "true" : "false");
  });
  document.querySelector("#formClose").addEventListener("click", closeFormModal);
  document.querySelector("#formModal").addEventListener("click", (event) => {
    if (event.target.id === "formModal") closeFormModal();
  });

  els.closeViewer.addEventListener("click", () => els.viewer.classList.add("hidden"));
  bindViewerPan();
  bindViewerResize();
  document.querySelector(".add-to-group").addEventListener("click", () => openAssignGroupModal(state.selectedAssetId));
  document.querySelectorAll("[data-viewer-nav]").forEach((button) => {
    button.addEventListener("click", () => changeViewerAsset(button.dataset.viewerNav));
  });
  document.querySelector(".detail-panel footer").addEventListener("click", (event) => {
    const button = event.target.closest("[data-detail-action]");
    if (!button) return;
    const action = button.dataset.detailAction;
    const asset = findAsset(state.selectedAssetId);
    if (action === "download") downloadAsset(state.selectedAssetId);
    if (action === "more") showViewerMoreMenu(button);
    if (action === "share") openShareAssetModal(state.selectedAssetId);
    if (action === "edit") openEditAssetModal(state.selectedAssetId);
    if (action === "permission") {
      if (canManageAsset(asset)) openPermissionModal(state.selectedAssetId);
      else openPermissionRequestModal(state.selectedAssetId);
    }
    if (action === "group") openAssignGroupModal(state.selectedAssetId);
  });
  els.detailTabs.addEventListener("click", (event) => {
    const button = event.target.closest("[data-tab]");
    if (!button) return;
    state.detailTab = button.dataset.tab;
    renderViewer();
  });

  // 页面操作按钮事件绑定
  document.querySelector("#uploadButton")?.addEventListener("click", (event) => {
    event.stopPropagation();
    document.querySelector(".upload-menu")?.classList.toggle("open");
  });
  document.querySelector("#uploadDropdown")?.addEventListener("click", handleUploadMenu);
  document.querySelector("#newGroupAction")?.addEventListener("click", openGroupModal);
  document.querySelector("#deleteSelectedTop")?.addEventListener("click", deleteSelectedAssets);
  document.querySelector("#deleteSelectedPending")?.addEventListener("click", deleteSelectedAssets);
  document.querySelector("#shareCurrent")?.addEventListener("click", openShareCurrentModal);
  document.querySelector("#collectCurrent")?.addEventListener("click", () => openCollectTaskModal(getGroupName(state.groupId)));
  document.querySelector("#approveSelected")?.addEventListener("click", approveSelectedAssets);

  // 权限模态框取消按钮
  document.querySelector("#permissionRequestCancel")?.addEventListener("click", closePermissionRequestModal);
  document.querySelector("#permissionRequestClose")?.addEventListener("click", closePermissionRequestModal);
  document.querySelector("#permissionRequestModal")?.addEventListener("click", (event) => {
    if (event.target.id === "permissionRequestModal") closePermissionRequestModal();
  });

  document.querySelector("#permissionCancel")?.addEventListener("click", closePermissionModal);
  document.querySelector("#permissionClose")?.addEventListener("click", closePermissionModal);
  document.querySelector("#permissionModal")?.addEventListener("click", (event) => {
    if (event.target.id === "permissionModal") closePermissionModal();
  });

  // 素材篮事件绑定
  document.querySelector("#basketClose")?.addEventListener("click", closeBasketDrawer);
  document.querySelector("#basketClear")?.addEventListener("click", () => {
    state.selectedIds.clear();
    closeBasketDrawer();
    render();
  });
  document.querySelector("#basketDelete")?.addEventListener("click", () => {
    if (!state.selectedIds.size) return;
    const count = state.selectedIds.size;
    db.assets.forEach((asset) => {
      if (state.selectedIds.has(asset.id)) {
        asset.status = "deleted";
        asset.updatedAt = nowText();
        asset.deletedAt = asset.updatedAt;
        asset.logs.unshift(`${currentUser.name} 删除了素材`);
      }
    });
    state.selectedIds.clear();
    saveDb();
    closeBasketDrawer();
    render();
    showToast(`已将 ${count} 个素材移入回收站`);
  });
  document.querySelector("#basketDownload")?.addEventListener("click", downloadSelectedAssets);
  document.querySelector("#basketValidity")?.addEventListener("click", openBasketValidityModal);
  document.querySelector("#basketShare")?.addEventListener("click", openBasketShareModal);
  
  document.querySelector("#basketList")?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-remove-basket]");
    if (button) {
      state.selectedIds.delete(button.dataset.removeBasket);
      render();
    }
  });

  // 素材篮有效期模态框事件
  document.querySelector("#basketValidityCancel")?.addEventListener("click", closeBasketValidityModal);
  document.querySelector("#basketValidityClose")?.addEventListener("click", closeBasketValidityModal);
  document.querySelector("#basketValidityModal")?.addEventListener("click", (event) => {
    if (event.target.id === "basketValidityModal") closeBasketValidityModal();
  });
  
  const basketValidityForm = document.querySelector("#basketValidityForm");
  basketValidityForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    const assets = getSelectedAssets();
    const date = document.querySelector("#basketValidityDate").value;
    const time = document.querySelector("#basketValidityTime").value || "23:59";
    const validUntil = date ? joinDateTime(date, time) : calculateExpireTime("永久有效");
    assets.forEach((asset) => {
      asset.validUntilDate = validUntil;
      asset.validUntil = validUntil;
      asset.updatedAt = nowText();
      asset.logs.unshift(`${currentUser.name} 通过素材篮批量修改了有效期`);
    });
    saveDb();
    closeBasketValidityModal();
    render();
    showToast(`已更新 ${assets.length} 个素材的有效期`);
  });

  // 素材篮分享模态框事件
  document.querySelector("#basketShareCancel")?.addEventListener("click", closeBasketShareModal);
  document.querySelector("#basketShareClose")?.addEventListener("click", closeBasketShareModal);
  document.querySelector("#basketShareModal")?.addEventListener("click", (event) => {
    if (event.target.id === "basketShareModal") closeBasketShareModal();
  });
  
  let createdBasketLink = "";
  const basketShareForm = document.querySelector("#basketShareForm");
  basketShareForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    if (createdBasketLink) return;
    
    const assets = getSelectedAssets();
    const targetId = assets.map((asset) => asset.id).join(",");
    const data = Object.fromEntries(new FormData(basketShareForm));
    const code = Math.random().toString(36).slice(2, 8);
    const link = getShareLink("basket", targetId, code);
    const shareName = data.shareName.trim() || `素材篮 ${assets.length} 项`;
    
    db.shares.unshift({ group: shareName, user: currentUser.name, access: data.access, visits: 0, views: 0, downloads: 0, sharedAt: nowText(), expiresAt: calculateExpireTime(data.expiresAt), targetType: "basket", targetId, code, link });
    assets.forEach((asset) => {
      asset.share += 1;
      asset.logs.unshift(`${currentUser.name} 通过素材篮分享了素材`);
    });
    saveDb();
    render();
    createdBasketLink = link;
    document.querySelector("#basketShareLink").value = link;
    document.querySelector("#basketShareCopy").disabled = false;
    showToast("素材篮分享记录已创建，链接已生成");
  });
  
  document.querySelector("#basketShareCopy")?.addEventListener("click", () => {
    if (createdBasketLink) copyText(createdBasketLink);
  });

  // 标签相关模态框事件
  document.querySelector("#addTagCancel")?.addEventListener("click", closeAddTagModal);
  document.querySelector("#addTagClose")?.addEventListener("click", closeAddTagModal);
  document.querySelector("#addTagModal")?.addEventListener("click", (event) => {
    if (event.target.id === "addTagModal") closeAddTagModal();
  });
  document.querySelector("#addTagForm")?.addEventListener("submit", handleAddTagSubmit);

  document.querySelector("#editTagCancel")?.addEventListener("click", closeEditTagModal);
  document.querySelector("#editTagClose")?.addEventListener("click", closeEditTagModal);
  document.querySelector("#editTagModal")?.addEventListener("click", (event) => {
    if (event.target.id === "editTagModal") closeEditTagModal();
  });
  document.querySelector("#editTagForm")?.addEventListener("submit", handleEditTagSubmit);

  document.querySelector("#mergeTagCancel")?.addEventListener("click", closeMergeTagModal);
  document.querySelector("#mergeTagClose")?.addEventListener("click", closeMergeTagModal);
  document.querySelector("#mergeTagModal")?.addEventListener("click", (event) => {
    if (event.target.id === "mergeTagModal") closeMergeTagModal();
  });
  document.querySelector("#mergeTagForm")?.addEventListener("submit", handleMergeTagSubmit);

  // 素材相关模态框事件
  document.querySelector("#editAssetCancel")?.addEventListener("click", closeEditAssetModal);
  document.querySelector("#editAssetClose")?.addEventListener("click", closeEditAssetModal);
  document.querySelector("#editAssetModal")?.addEventListener("click", (event) => {
    if (event.target.id === "editAssetModal") closeEditAssetModal();
  });
  document.querySelector("#editAssetForm")?.addEventListener("submit", handleEditAssetSubmit);

  document.querySelector("#shareAssetCancel")?.addEventListener("click", closeShareAssetModal);
  document.querySelector("#shareAssetClose")?.addEventListener("click", closeShareAssetModal);
  document.querySelector("#shareAssetModal")?.addEventListener("click", (event) => {
    if (event.target.id === "shareAssetModal") closeShareAssetModal();
  });
  document.querySelector("#shareAssetForm")?.addEventListener("submit", handleShareAssetSubmit);
  document.querySelector("#shareAssetCopy")?.addEventListener("click", () => {
    if (shareAssetCreatedLink) copyText(shareAssetCreatedLink);
  });

  // 素材组相关模态框事件
  document.querySelector("#addGroupCancel")?.addEventListener("click", closeAddGroupModal);
  document.querySelector("#addGroupClose")?.addEventListener("click", closeAddGroupModal);
  document.querySelector("#addGroupModal")?.addEventListener("click", (event) => {
    if (event.target.id === "addGroupModal") closeAddGroupModal();
  });
  document.querySelector("#addGroupForm")?.addEventListener("submit", handleAddGroupSubmit);

  document.querySelector("#editGroupCancel")?.addEventListener("click", closeEditGroupModal);
  document.querySelector("#editGroupClose")?.addEventListener("click", closeEditGroupModal);
  document.querySelector("#editGroupModal")?.addEventListener("click", (event) => {
    if (event.target.id === "editGroupModal") closeEditGroupModal();
  });
  document.querySelector("#editGroupForm")?.addEventListener("submit", handleEditGroupSubmit);

  document.querySelector("#moveGroupCancel")?.addEventListener("click", closeMoveGroupModal);
  document.querySelector("#moveGroupClose")?.addEventListener("click", closeMoveGroupModal);
  document.querySelector("#moveGroupModal")?.addEventListener("click", (event) => {
    if (event.target.id === "moveGroupModal") closeMoveGroupModal();
  });
  document.querySelector("#moveGroupForm")?.addEventListener("submit", handleMoveGroupSubmit);

  document.querySelector("#addToGroupCancel")?.addEventListener("click", closeAddToGroupModal);
  document.querySelector("#addToGroupClose")?.addEventListener("click", closeAddToGroupModal);
  document.querySelector("#addToGroupModal")?.addEventListener("click", (event) => {
    if (event.target.id === "addToGroupModal") closeAddToGroupModal();
  });
  document.querySelector("#addToGroupForm")?.addEventListener("submit", handleAddToGroupSubmit);

  // 其他模态框事件
  document.querySelector("#uploadSettingsCancel")?.addEventListener("click", () => {
    document.querySelector("#uploadSettingsModal").classList.add("hidden");
  });
  document.querySelector("#uploadSettingsClose")?.addEventListener("click", () => {
    document.querySelector("#uploadSettingsModal").classList.add("hidden");
  });

  document.querySelector("#cloudImportCancel")?.addEventListener("click", () => {
    document.querySelector("#cloudImportModal").classList.add("hidden");
  });
  document.querySelector("#cloudImportClose")?.addEventListener("click", () => {
    document.querySelector("#cloudImportModal").classList.add("hidden");
  });

  document.querySelector("#collectTaskCancel")?.addEventListener("click", closeCollectTaskModal);
  document.querySelector("#collectTaskClose")?.addEventListener("click", closeCollectTaskModal);
  document.querySelector("#collectTaskModal")?.addEventListener("click", (event) => {
    if (event.target.id === "collectTaskModal") closeCollectTaskModal();
  });
  document.querySelector("#collectTaskForm")?.addEventListener("submit", handleCollectTaskSubmit);

  document.querySelector("#permissionCancel")?.addEventListener("click", closePermissionModal);
  document.querySelector("#permissionClose")?.addEventListener("click", closePermissionModal);
  document.querySelector("#permissionModal")?.addEventListener("click", (event) => {
    if (event.target.id === "permissionModal") closePermissionModal();
  });

  document.querySelector("#shareGroupCancel")?.addEventListener("click", closeShareGroupModal);
  document.querySelector("#shareGroupClose")?.addEventListener("click", closeShareGroupModal);
  document.querySelector("#shareGroupModal")?.addEventListener("click", (event) => {
    if (event.target.id === "shareGroupModal") closeShareGroupModal();
  });
  document.querySelector("#shareGroupForm")?.addEventListener("submit", handleShareGroupSubmit);
  document.querySelector("#shareGroupCopy")?.addEventListener("click", () => {
    if (shareGroupCreatedLink) copyText(shareGroupCreatedLink);
  });

  document.querySelector("#updateShareExpireCancel")?.addEventListener("click", closeUpdateShareExpireModal);
  document.querySelector("#updateShareExpireClose")?.addEventListener("click", closeUpdateShareExpireModal);
  document.querySelector("#updateShareExpireModal")?.addEventListener("click", (event) => {
    if (event.target.id === "updateShareExpireModal") closeUpdateShareExpireModal();
  });
  document.querySelector("#updateShareExpireForm")?.addEventListener("submit", handleUpdateShareExpireSubmit);
  document.querySelector("#updateShareExpireForever")?.addEventListener("change", (event) => {
    const checked = event.target.checked;
    document.querySelector("#updateShareExpireDate").disabled = checked;
    document.querySelector("#updateShareExpireTime").disabled = checked;
  });

  document.querySelector("#inviteTaskCancel")?.addEventListener("click", () => {
    document.querySelector("#inviteTaskModal").classList.add("hidden");
  });
  document.querySelector("#inviteTaskClose")?.addEventListener("click", () => {
    document.querySelector("#inviteTaskModal").classList.add("hidden");
  });

  // moreMenu 按钮事件
  els.moreMenu?.addEventListener("click", (event) => {
    const goButton = event.target.closest("[data-go]");
    if (goButton) {
      state.page = goButton.dataset.go;
      hideMenus();
      render();
      return;
    }
    
    const actionButton = event.target.closest("[data-app-action]");
    if (actionButton) {
      const action = actionButton.dataset.appAction;
      if (action === "home") {
        state.page = "all";
        state.groupId = "all";
        render();
      }
      if (action === "upload") document.querySelector("#fileInput")?.click();
      if (action === "group") openGroupModal();
      if (action === "recycle") {
        state.page = "recycle";
        render();
      }
      hideMenus();
    }
  });
}
