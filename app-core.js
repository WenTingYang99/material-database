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

const BRANDS = ["东风标致", "东风雪铁龙", "Jeep"];
const BRAND_SERIES = {
  "东风标致": ["4008(进口）", "4008", "5008", "408", "508", "新一代408"],
  "东风雪铁龙": ["萨拉毕加索", "天逸 (C5)AIRCROSS", "经典爱丽舍", "C6", "C5", "凡尔赛C5 X"],
  "Jeep": []
};
const SERIES_MODELS = {
  "4008(进口）": [],
  "4008": [],
  "5008": [],
  "408": [],
  "508": [],
  "新一代408": [],
  "萨拉毕加索": [],
  "天逸 (C5)AIRCROSS": [],
  "经典爱丽舍": [],
  "C6": [],
  "C5": ["C5舒适型2.0L手动档", "11款C5舒适型2.0L 手动"],
  "凡尔赛C5 X": ["凡尔赛C5X 25款 N2", "凡尔赛 C5X 旅不凡 24款 N2P++"]
};
const MODEL_INTERIOR_COLORS = {
  "C5舒适型2.0L手动档": ["（V3000 XNFR）新内饰", "（V3000 6BFR）驼绒灰(天鹅绒)"],
  "11款C5舒适型2.0L 手动": ["（V8FA2 6BFR）驼绒灰(天鹅绒)"]
};
const MODEL_EXTERIOR_COLORS = {
  "C5舒适型2.0L手动档": ["（V8FA5 6BFD）浅色天鹅绒"],
  "11款C5舒适型2.0L 手动": ["（V8FA5 6BFD）浅色天鹅绒"]
};

const SEED_VALUE_LIST_TREE = [
  { id: "vl_root", code: "root", name: "值列表", type: "root", parentId: null, refId: null, description: "值列表管理根节点", attr1: "", attr2: "", status: "enabled", sortOrder: 0 },
  { id: "vl_dim_matlib", code: "material_lib", name: "素材库筛选", type: "dimension", parentId: "vl_root", refId: null, description: "素材库筛选条件集合", attr1: "", attr2: "", status: "enabled", sortOrder: 0 },
  { id: "vl_dim_brand", code: "brand", name: "品牌", type: "dimension", parentId: "vl_dim_matlib", refId: null, description: "车辆品牌列表", attr1: "", attr2: "", status: "enabled", sortOrder: 1 },
  { id: "vl_b1", code: "peugeot", name: "东风标致", type: "value", parentId: "vl_dim_brand", refId: null, description: "", attr1: "", attr2: "", status: "enabled", sortOrder: 1 },
  { id: "vl_b2", code: "citroen", name: "东风雪铁龙", type: "value", parentId: "vl_dim_brand", refId: null, description: "", attr1: "", attr2: "", status: "enabled", sortOrder: 2 },
  { id: "vl_b3", code: "jeep", name: "Jeep", type: "value", parentId: "vl_dim_brand", refId: null, description: "", attr1: "", attr2: "", status: "enabled", sortOrder: 3 },
  { id: "vl_dim_series", code: "series", name: "车系", type: "dimension", parentId: "vl_dim_matlib", refId: null, description: "车辆系列列表", attr1: "", attr2: "", status: "enabled", sortOrder: 2 },
  { id: "vl_s1", code: "4008-import", name: "4008(进口）", type: "value", parentId: "vl_dim_series", refId: "vl_b1", description: "", attr1: "", attr2: "", status: "enabled", sortOrder: 1 },
  { id: "vl_s2", code: "4008", name: "4008", type: "value", parentId: "vl_dim_series", refId: "vl_b1", description: "", attr1: "", attr2: "", status: "enabled", sortOrder: 2 },
  { id: "vl_s3", code: "5008", name: "5008", type: "value", parentId: "vl_dim_series", refId: "vl_b1", description: "", attr1: "", attr2: "", status: "enabled", sortOrder: 3 },
  { id: "vl_s4", code: "408", name: "408", type: "value", parentId: "vl_dim_series", refId: "vl_b1", description: "", attr1: "", attr2: "", status: "enabled", sortOrder: 4 },
  { id: "vl_s5", code: "508", name: "508", type: "value", parentId: "vl_dim_series", refId: "vl_b1", description: "", attr1: "", attr2: "", status: "enabled", sortOrder: 5 },
  { id: "vl_s6", code: "new-408", name: "新一代408", type: "value", parentId: "vl_dim_series", refId: "vl_b1", description: "", attr1: "", attr2: "", status: "enabled", sortOrder: 6 },
  { id: "vl_s7", code: "sarah-picasso", name: "萨拉毕加索", type: "value", parentId: "vl_dim_series", refId: "vl_b2", description: "", attr1: "", attr2: "", status: "enabled", sortOrder: 7 },
  { id: "vl_s8", code: "c5-aircross", name: "天逸 (C5)AIRCROSS", type: "value", parentId: "vl_dim_series", refId: "vl_b2", description: "", attr1: "", attr2: "", status: "enabled", sortOrder: 8 },
  { id: "vl_s9", code: "elysee", name: "经典爱丽舍", type: "value", parentId: "vl_dim_series", refId: "vl_b2", description: "", attr1: "", attr2: "", status: "enabled", sortOrder: 9 },
  { id: "vl_s10", code: "c6", name: "C6", type: "value", parentId: "vl_dim_series", refId: "vl_b2", description: "", attr1: "", attr2: "", status: "enabled", sortOrder: 10 },
  { id: "vl_s11", code: "c5", name: "C5", type: "value", parentId: "vl_dim_series", refId: "vl_b2", description: "", attr1: "", attr2: "", status: "enabled", sortOrder: 11 },
  { id: "vl_s12", code: "versailles-c5x", name: "凡尔赛C5 X", type: "value", parentId: "vl_dim_series", refId: "vl_b2", description: "", attr1: "", attr2: "", status: "enabled", sortOrder: 12 },
  { id: "vl_dim_model", code: "model", name: "车型", type: "dimension", parentId: "vl_dim_matlib", refId: null, description: "车辆型号列表", attr1: "", attr2: "", status: "enabled", sortOrder: 3 },
  { id: "vl_m1", code: "c5-2.0-manual", name: "C5舒适型2.0L手动档", type: "value", parentId: "vl_dim_model", refId: "vl_s11", description: "", attr1: "", attr2: "", status: "enabled", sortOrder: 1 },
  { id: "vl_m2", code: "c5-2011-2.0-manual", name: "11款C5舒适型2.0L 手动", type: "value", parentId: "vl_dim_model", refId: "vl_s11", description: "", attr1: "", attr2: "", status: "enabled", sortOrder: 2 },
  { id: "vl_m3", code: "versailles-25-n2", name: "凡尔赛C5X 25款 N2", type: "value", parentId: "vl_dim_model", refId: "vl_s12", description: "", attr1: "", attr2: "", status: "enabled", sortOrder: 3 },
  { id: "vl_m4", code: "versailles-24-n2p", name: "凡尔赛 C5X 旅不凡 24款 N2P++", type: "value", parentId: "vl_dim_model", refId: "vl_s12", description: "", attr1: "", attr2: "", status: "enabled", sortOrder: 4 },
  { id: "vl_dim_interior_color", code: "interior_color", name: "内饰色", type: "dimension", parentId: "vl_dim_matlib", refId: null, description: "内饰颜色列表", attr1: "", attr2: "", status: "enabled", sortOrder: 4 },
  { id: "vl_ic1", code: "interior-v3000-xnfr", name: "（V3000 XNFR）新内饰", type: "value", parentId: "vl_dim_interior_color", refId: "vl_m1", description: "", attr1: "", attr2: "", status: "enabled", sortOrder: 1 },
  { id: "vl_ic2", code: "interior-v3000-6bfr", name: "（V3000 6BFR）驼绒灰(天鹅绒)", type: "value", parentId: "vl_dim_interior_color", refId: "vl_m1", description: "", attr1: "", attr2: "", status: "enabled", sortOrder: 2 },
  { id: "vl_ic3", code: "interior-v8fa2-6bfr", name: "（V8FA2 6BFR）驼绒灰(天鹅绒)", type: "value", parentId: "vl_dim_interior_color", refId: "vl_m2", description: "", attr1: "", attr2: "", status: "enabled", sortOrder: 3 },
  { id: "vl_dim_exterior_color", code: "exterior_color", name: "外饰色", type: "dimension", parentId: "vl_dim_matlib", refId: null, description: "外饰颜色列表", attr1: "", attr2: "", status: "enabled", sortOrder: 5 },
  { id: "vl_ec1", code: "exterior-v8fa5-6bfd", name: "（V8FA5 6BFD）浅色天鹅绒", type: "value", parentId: "vl_dim_exterior_color", refId: "vl_m1", description: "", attr1: "", attr2: "", status: "enabled", sortOrder: 1 },
  { id: "vl_ec2", code: "exterior-v8fa5-6bfd-m2", name: "（V8FA5 6BFD）浅色天鹅绒", type: "value", parentId: "vl_dim_exterior_color", refId: "vl_m2", description: "", attr1: "", attr2: "", status: "enabled", sortOrder: 2 },
  { id: "vl_dim_file_format", code: "file_format", name: "文件格式", type: "dimension", parentId: "vl_dim_matlib", refId: null, description: "文件格式分类", attr1: "", attr2: "", status: "enabled", sortOrder: 6 },
  { id: "vl_ff1", code: "image", name: "图片", type: "group", parentId: "vl_dim_file_format", refId: null, description: "", attr1: "", attr2: "", status: "enabled", sortOrder: 1 },
  { id: "vl_ff11", code: "jpg", name: "JPG", type: "value", parentId: "vl_ff1", refId: null, description: "", attr1: "", attr2: "", status: "enabled", sortOrder: 1 },
  { id: "vl_ff12", code: "jpeg", name: "JPEG", type: "value", parentId: "vl_ff1", refId: null, description: "", attr1: "", attr2: "", status: "enabled", sortOrder: 2 },
  { id: "vl_ff13", code: "png", name: "PNG", type: "value", parentId: "vl_ff1", refId: null, description: "", attr1: "", attr2: "", status: "enabled", sortOrder: 3 },
  { id: "vl_ff14", code: "tif", name: "TIF", type: "value", parentId: "vl_ff1", refId: null, description: "", attr1: "", attr2: "", status: "enabled", sortOrder: 4 },
  { id: "vl_ff15", code: "tiff", name: "TIFF", type: "value", parentId: "vl_ff1", refId: null, description: "", attr1: "", attr2: "", status: "enabled", sortOrder: 5 },
  { id: "vl_ff16", code: "webp", name: "WEBP", type: "value", parentId: "vl_ff1", refId: null, description: "", attr1: "", attr2: "", status: "enabled", sortOrder: 6 },
  { id: "vl_ff17", code: "gif", name: "GIF", type: "value", parentId: "vl_ff1", refId: null, description: "", attr1: "", attr2: "", status: "enabled", sortOrder: 7 },
  { id: "vl_ff18", code: "svg", name: "SVG", type: "value", parentId: "vl_ff1", refId: null, description: "", attr1: "", attr2: "", status: "enabled", sortOrder: 8 },
  { id: "vl_ff19", code: "bmp", name: "BMP", type: "value", parentId: "vl_ff1", refId: null, description: "", attr1: "", attr2: "", status: "enabled", sortOrder: 9 },
  { id: "vl_ff20", code: "heic", name: "HEIC", type: "value", parentId: "vl_ff1", refId: null, description: "", attr1: "", attr2: "", status: "enabled", sortOrder: 10 },
  { id: "vl_ff21", code: "pic", name: "PIC", type: "value", parentId: "vl_ff1", refId: null, description: "", attr1: "", attr2: "", status: "enabled", sortOrder: 11 },
  { id: "vl_ff2", code: "video", name: "视频", type: "group", parentId: "vl_dim_file_format", refId: null, description: "", attr1: "", attr2: "", status: "enabled", sortOrder: 2 },
  { id: "vl_ff22", code: "mp4", name: "MP4", type: "value", parentId: "vl_ff2", refId: null, description: "", attr1: "", attr2: "", status: "enabled", sortOrder: 1 },
  { id: "vl_ff23", code: "mov", name: "MOV", type: "value", parentId: "vl_ff2", refId: null, description: "", attr1: "", attr2: "", status: "enabled", sortOrder: 2 },
  { id: "vl_ff24", code: "m4v", name: "M4V", type: "value", parentId: "vl_ff2", refId: null, description: "", attr1: "", attr2: "", status: "enabled", sortOrder: 3 },
  { id: "vl_ff25", code: "avi", name: "AVI", type: "value", parentId: "vl_ff2", refId: null, description: "", attr1: "", attr2: "", status: "enabled", sortOrder: 4 },
  { id: "vl_ff26", code: "mkv", name: "MKV", type: "value", parentId: "vl_ff2", refId: null, description: "", attr1: "", attr2: "", status: "enabled", sortOrder: 5 },
  { id: "vl_ff27", code: "rmvb", name: "RMVB", type: "value", parentId: "vl_ff2", refId: null, description: "", attr1: "", attr2: "", status: "enabled", sortOrder: 6 },
  { id: "vl_ff28", code: "rm", name: "RM", type: "value", parentId: "vl_ff2", refId: null, description: "", attr1: "", attr2: "", status: "enabled", sortOrder: 7 },
  { id: "vl_ff29", code: "mpg", name: "MPG", type: "value", parentId: "vl_ff2", refId: null, description: "", attr1: "", attr2: "", status: "enabled", sortOrder: 8 },
  { id: "vl_ff30", code: "flv", name: "FLV", type: "value", parentId: "vl_ff2", refId: null, description: "", attr1: "", attr2: "", status: "enabled", sortOrder: 9 },
  { id: "vl_ff31", code: "ts", name: "TS", type: "value", parentId: "vl_ff2", refId: null, description: "", attr1: "", attr2: "", status: "enabled", sortOrder: 10 },
  { id: "vl_ff32", code: "aep", name: "AEP", type: "value", parentId: "vl_ff2", refId: null, description: "", attr1: "", attr2: "", status: "enabled", sortOrder: 11 },
  { id: "vl_ff3", code: "document", name: "文档", type: "group", parentId: "vl_dim_file_format", refId: null, description: "", attr1: "", attr2: "", status: "enabled", sortOrder: 3 },
  { id: "vl_ff33", code: "pdf", name: "PDF", type: "value", parentId: "vl_ff3", refId: null, description: "", attr1: "", attr2: "", status: "enabled", sortOrder: 1 },
  { id: "vl_ff34", code: "doc", name: "DOC", type: "value", parentId: "vl_ff3", refId: null, description: "", attr1: "", attr2: "", status: "enabled", sortOrder: 2 },
  { id: "vl_ff35", code: "docx", name: "DOCX", type: "value", parentId: "vl_ff3", refId: null, description: "", attr1: "", attr2: "", status: "enabled", sortOrder: 3 },
  { id: "vl_ff36", code: "ppt", name: "PPT", type: "value", parentId: "vl_ff3", refId: null, description: "", attr1: "", attr2: "", status: "enabled", sortOrder: 4 },
  { id: "vl_ff37", code: "pptx", name: "PPTX", type: "value", parentId: "vl_ff3", refId: null, description: "", attr1: "", attr2: "", status: "enabled", sortOrder: 5 },
  { id: "vl_ff38", code: "wps", name: "WPS", type: "value", parentId: "vl_ff3", refId: null, description: "", attr1: "", attr2: "", status: "enabled", sortOrder: 6 },
  { id: "vl_ff39", code: "pages", name: "PAGES", type: "value", parentId: "vl_ff3", refId: null, description: "", attr1: "", attr2: "", status: "enabled", sortOrder: 7 },
  { id: "vl_ff40", code: "key", name: "KEY", type: "value", parentId: "vl_ff3", refId: null, description: "", attr1: "", attr2: "", status: "enabled", sortOrder: 8 },
  { id: "vl_ff41", code: "txt", name: "TXT", type: "value", parentId: "vl_ff3", refId: null, description: "", attr1: "", attr2: "", status: "enabled", sortOrder: 9 },
  { id: "vl_ff4", code: "design", name: "设计源文件", type: "group", parentId: "vl_dim_file_format", refId: null, description: "", attr1: "", attr2: "", status: "enabled", sortOrder: 4 },
  { id: "vl_ff42", code: "psd", name: "PSD", type: "value", parentId: "vl_ff4", refId: null, description: "", attr1: "", attr2: "", status: "enabled", sortOrder: 1 },
  { id: "vl_ff43", code: "ai", name: "AI", type: "value", parentId: "vl_ff4", refId: null, description: "", attr1: "", attr2: "", status: "enabled", sortOrder: 2 },
  { id: "vl_ff44", code: "psb", name: "PSB", type: "value", parentId: "vl_ff4", refId: null, description: "", attr1: "", attr2: "", status: "enabled", sortOrder: 3 },
  { id: "vl_ff45", code: "sketch", name: "SKETCH", type: "value", parentId: "vl_ff4", refId: null, description: "", attr1: "", attr2: "", status: "enabled", sortOrder: 4 },
  { id: "vl_ff46", code: "c4d", name: "C4D", type: "value", parentId: "vl_ff4", refId: null, description: "", attr1: "", attr2: "", status: "enabled", sortOrder: 5 },
  { id: "vl_ff47", code: "ps", name: "PS", type: "value", parentId: "vl_ff4", refId: null, description: "", attr1: "", attr2: "", status: "enabled", sortOrder: 6 },
  { id: "vl_ff48", code: "coreldraw", name: "CORELDRAW", type: "value", parentId: "vl_ff4", refId: null, description: "", attr1: "", attr2: "", status: "enabled", sortOrder: 7 },
  { id: "vl_ff49", code: "eps", name: "EPS", type: "value", parentId: "vl_ff4", refId: null, description: "", attr1: "", attr2: "", status: "enabled", sortOrder: 8 },
  { id: "vl_ff5", code: "text", name: "纯文本", type: "group", parentId: "vl_dim_file_format", refId: null, description: "", attr1: "", attr2: "", status: "enabled", sortOrder: 5 },
  { id: "vl_ff50", code: "text-file", name: "TEXT", type: "value", parentId: "vl_ff5", refId: null, description: "", attr1: "", attr2: "", status: "enabled", sortOrder: 1 },
  { id: "vl_ff6", code: "spreadsheet", name: "表格", type: "group", parentId: "vl_dim_file_format", refId: null, description: "", attr1: "", attr2: "", status: "enabled", sortOrder: 6 },
  { id: "vl_ff51", code: "xls", name: "XLS", type: "value", parentId: "vl_ff6", refId: null, description: "", attr1: "", attr2: "", status: "enabled", sortOrder: 1 },
  { id: "vl_ff52", code: "xlsx", name: "XLSX", type: "value", parentId: "vl_ff6", refId: null, description: "", attr1: "", attr2: "", status: "enabled", sortOrder: 2 },
  { id: "vl_ff53", code: "csv", name: "CSV", type: "value", parentId: "vl_ff6", refId: null, description: "", attr1: "", attr2: "", status: "enabled", sortOrder: 3 },
  { id: "vl_ff54", code: "numbers", name: "NUMBERS", type: "value", parentId: "vl_ff6", refId: null, description: "", attr1: "", attr2: "", status: "enabled", sortOrder: 4 },
  { id: "vl_ff7", code: "font", name: "字体文件", type: "group", parentId: "vl_dim_file_format", refId: null, description: "", attr1: "", attr2: "", status: "enabled", sortOrder: 7 },
  { id: "vl_ff55", code: "ttf", name: "TTF", type: "value", parentId: "vl_ff7", refId: null, description: "", attr1: "", attr2: "", status: "enabled", sortOrder: 1 },
  { id: "vl_ff56", code: "ttc", name: "TTC", type: "value", parentId: "vl_ff7", refId: null, description: "", attr1: "", attr2: "", status: "enabled", sortOrder: 2 },
  { id: "vl_ff57", code: "otf", name: "OTF", type: "value", parentId: "vl_ff7", refId: null, description: "", attr1: "", attr2: "", status: "enabled", sortOrder: 3 },
  { id: "vl_ff8", code: "audio", name: "音频", type: "group", parentId: "vl_dim_file_format", refId: null, description: "", attr1: "", attr2: "", status: "enabled", sortOrder: 8 },
  { id: "vl_ff58", code: "mp3", name: "MP3", type: "value", parentId: "vl_ff8", refId: null, description: "", attr1: "", attr2: "", status: "enabled", sortOrder: 1 },
  { id: "vl_ff59", code: "m4a", name: "M4A", type: "value", parentId: "vl_ff8", refId: null, description: "", attr1: "", attr2: "", status: "enabled", sortOrder: 2 },
  { id: "vl_ff60", code: "wav", name: "WAV", type: "value", parentId: "vl_ff8", refId: null, description: "", attr1: "", attr2: "", status: "enabled", sortOrder: 3 },
  { id: "vl_ff9", code: "archive", name: "压缩包", type: "group", parentId: "vl_dim_file_format", refId: null, description: "", attr1: "", attr2: "", status: "enabled", sortOrder: 9 },
  { id: "vl_ff61", code: "zip", name: "ZIP", type: "value", parentId: "vl_ff9", refId: null, description: "", attr1: "", attr2: "", status: "enabled", sortOrder: 1 },
  { id: "vl_ff62", code: "rar", name: "RAR", type: "value", parentId: "vl_ff9", refId: null, description: "", attr1: "", attr2: "", status: "enabled", sortOrder: 2 },
  { id: "vl_ff63", code: "7z", name: "7Z", type: "value", parentId: "vl_ff9", refId: null, description: "", attr1: "", attr2: "", status: "enabled", sortOrder: 3 },
  { id: "vl_ff64", code: "gz", name: "GZ", type: "value", parentId: "vl_ff9", refId: null, description: "", attr1: "", attr2: "", status: "enabled", sortOrder: 4 },
  { id: "vl_ff10", code: "3d-model", name: "三维模型文件", type: "group", parentId: "vl_dim_file_format", refId: null, description: "", attr1: "", attr2: "", status: "enabled", sortOrder: 10 },
  { id: "vl_ff65", code: "3dm", name: "3DM", type: "value", parentId: "vl_ff10", refId: null, description: "", attr1: "", attr2: "", status: "enabled", sortOrder: 1 },
  { id: "vl_ff66", code: "3ds", name: "3DS", type: "value", parentId: "vl_ff10", refId: null, description: "", attr1: "", attr2: "", status: "enabled", sortOrder: 2 },
  { id: "vl_ff67", code: "3mf", name: "3MF", type: "value", parentId: "vl_ff10", refId: null, description: "", attr1: "", attr2: "", status: "enabled", sortOrder: 3 },
  { id: "vl_ff68", code: "amf", name: "AMF", type: "value", parentId: "vl_ff10", refId: null, description: "", attr1: "", attr2: "", status: "enabled", sortOrder: 4 },
  { id: "vl_ff69", code: "bim", name: "BIM", type: "value", parentId: "vl_ff10", refId: null, description: "", attr1: "", attr2: "", status: "enabled", sortOrder: 5 },
  { id: "vl_ff70", code: "brep", name: "BREP", type: "value", parentId: "vl_ff10", refId: null, description: "", attr1: "", attr2: "", status: "enabled", sortOrder: 6 },
  { id: "vl_ff71", code: "dae", name: "DAE", type: "value", parentId: "vl_ff10", refId: null, description: "", attr1: "", attr2: "", status: "enabled", sortOrder: 7 },
  { id: "vl_ff72", code: "fbx", name: "FBX", type: "value", parentId: "vl_ff10", refId: null, description: "", attr1: "", attr2: "", status: "enabled", sortOrder: 8 },
  { id: "vl_ff73", code: "fcstd", name: "FCSTD", type: "value", parentId: "vl_ff10", refId: null, description: "", attr1: "", attr2: "", status: "enabled", sortOrder: 9 },
  { id: "vl_ff74", code: "ifc", name: "IFC", type: "value", parentId: "vl_ff10", refId: null, description: "", attr1: "", attr2: "", status: "enabled", sortOrder: 10 },
  { id: "vl_ff75", code: "iges", name: "IGES", type: "value", parentId: "vl_ff10", refId: null, description: "", attr1: "", attr2: "", status: "enabled", sortOrder: 11 },
  { id: "vl_ff76", code: "step", name: "STEP", type: "value", parentId: "vl_ff10", refId: null, description: "", attr1: "", attr2: "", status: "enabled", sortOrder: 12 },
  { id: "vl_ff77", code: "stl", name: "STL", type: "value", parentId: "vl_ff10", refId: null, description: "", attr1: "", attr2: "", status: "enabled", sortOrder: 13 },
  { id: "vl_ff78", code: "obj", name: "OBJ", type: "value", parentId: "vl_ff10", refId: null, description: "", attr1: "", attr2: "", status: "enabled", sortOrder: 14 },
  { id: "vl_ff79", code: "off", name: "OFF", type: "value", parentId: "vl_ff10", refId: null, description: "", attr1: "", attr2: "", status: "enabled", sortOrder: 15 },
  { id: "vl_ff80", code: "ply", name: "PLY", type: "value", parentId: "vl_ff10", refId: null, description: "", attr1: "", attr2: "", status: "enabled", sortOrder: 16 },
  { id: "vl_dim_source", code: "source", name: "素材来源", type: "dimension", parentId: "vl_dim_matlib", refId: null, description: "素材来源类型", attr1: "", attr2: "", status: "enabled", sortOrder: 7 },
  { id: "vl_src1", code: "internal", name: "内部上传", type: "value", parentId: "vl_dim_source", refId: null, description: "", attr1: "", attr2: "", status: "enabled", sortOrder: 1 },
  { id: "vl_src2", code: "ai-generated", name: "AI生成", type: "value", parentId: "vl_dim_source", refId: null, description: "", attr1: "", attr2: "", status: "enabled", sortOrder: 2 },
  { id: "vl_src3", code: "external", name: "外部导入", type: "value", parentId: "vl_dim_source", refId: null, description: "", attr1: "", attr2: "", status: "enabled", sortOrder: 3 },
  { id: "vl_dim_permission_scope", code: "permission_scope", name: "权限范围", type: "dimension", parentId: "vl_dim_matlib", refId: null, description: "素材权限范围", attr1: "", attr2: "", status: "enabled", sortOrder: 8 },
  { id: "vl_ps1", code: "downloadable", name: "可下载", type: "value", parentId: "vl_dim_permission_scope", refId: null, description: "", attr1: "", attr2: "", status: "enabled", sortOrder: 1 },
  { id: "vl_ps2", code: "shareable", name: "可分享", type: "value", parentId: "vl_dim_permission_scope", refId: null, description: "", attr1: "", attr2: "", status: "enabled", sortOrder: 2 },
  { id: "vl_dim_asset_status", code: "asset_status", name: "素材状态", type: "dimension", parentId: "vl_dim_matlib", refId: null, description: "素材状态筛选", attr1: "", attr2: "", status: "enabled", sortOrder: 9 },
  { id: "vl_as1", code: "valid", name: "有效", type: "value", parentId: "vl_dim_asset_status", refId: null, description: "", attr1: "", attr2: "", status: "enabled", sortOrder: 1 },
  { id: "vl_as2", code: "expired", name: "已失效", type: "value", parentId: "vl_dim_asset_status", refId: null, description: "", attr1: "", attr2: "", status: "enabled", sortOrder: 2 },
  { id: "vl_as3", code: "pending", name: "待生效", type: "value", parentId: "vl_dim_asset_status", refId: null, description: "", attr1: "", attr2: "", status: "enabled", sortOrder: 3 },
  { id: "vl_dim_aspect_ratio", code: "aspect_ratio", name: "宽高比", type: "dimension", parentId: "vl_dim_matlib", refId: null, description: "图片/视频宽高比", attr1: "", attr2: "", status: "enabled", sortOrder: 10 },
  { id: "vl_ar1", code: "1:1", name: "1:1", type: "value", parentId: "vl_dim_aspect_ratio", refId: null, description: "", attr1: "1.0", attr2: "", status: "enabled", sortOrder: 1 },
  { id: "vl_ar2", code: "3:4", name: "3:4", type: "value", parentId: "vl_dim_aspect_ratio", refId: null, description: "", attr1: "0.75", attr2: "", status: "enabled", sortOrder: 2 },
  { id: "vl_ar3", code: "9:16", name: "9:16", type: "value", parentId: "vl_dim_aspect_ratio", refId: null, description: "", attr1: "0.5625", attr2: "", status: "enabled", sortOrder: 3 },
  { id: "vl_ar4", code: "4:3", name: "4:3", type: "value", parentId: "vl_dim_aspect_ratio", refId: null, description: "", attr1: "1.333", attr2: "", status: "enabled", sortOrder: 4 },
  { id: "vl_ar5", code: "3:2", name: "3:2", type: "value", parentId: "vl_dim_aspect_ratio", refId: null, description: "", attr1: "1.5", attr2: "", status: "enabled", sortOrder: 5 },
  { id: "vl_ar6", code: "16:9", name: "16:9", type: "value", parentId: "vl_dim_aspect_ratio", refId: null, description: "", attr1: "1.778", attr2: "", status: "enabled", sortOrder: 6 },
  { id: "vl_ar7", code: "21:9", name: "21:9", type: "value", parentId: "vl_dim_aspect_ratio", refId: null, description: "", attr1: "2.333", attr2: "", status: "enabled", sortOrder: 7 },
  { id: "vl_dim_file_size", code: "file_size", name: "文件大小", type: "dimension", parentId: "vl_dim_matlib", refId: null, description: "文件大小范围", attr1: "", attr2: "", status: "enabled", sortOrder: 11 },
  { id: "vl_fs1", code: "lt5", name: "<5MB", type: "value", parentId: "vl_dim_file_size", refId: null, description: "", attr1: "0", attr2: "5242880", status: "enabled", sortOrder: 1 },
  { id: "vl_fs2", code: "5to10", name: "5MB～10MB", type: "value", parentId: "vl_dim_file_size", refId: null, description: "", attr1: "5242880", attr2: "10485760", status: "enabled", sortOrder: 2 },
  { id: "vl_fs3", code: "10to50", name: "10MB～50MB", type: "value", parentId: "vl_dim_file_size", refId: null, description: "", attr1: "10485760", attr2: "52428800", status: "enabled", sortOrder: 3 },
  { id: "vl_fs4", code: "gt50", name: ">50MB", type: "value", parentId: "vl_dim_file_size", refId: null, description: "", attr1: "52428800", attr2: "", status: "enabled", sortOrder: 4 },
];

function getTreeChildren(parentId = null) {
  return (db.valueListTree || []).filter(n => n.parentId === parentId && n.status === "enabled")
    .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
}
function getTreeNodeById(id) {
  return (db.valueListTree || []).find(n => n.id === id);
}
function getTreeNodeByCode(code) {
  return (db.valueListTree || []).find(n => n.code === code);
}
function getTreeNodeByName(name) {
  return (db.valueListTree || []).find(n => n.name === name);
}
function getDimensionNodes(parentDimId) {
  const parentId = parentDimId || getTreeNodeByCode("material_lib")?.id;
  return (db.valueListTree || []).filter(n => n.parentId === parentId && n.type === "dimension" && n.status === "enabled")
    .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
}
function getCascadeChildren(dimCode, refIds) {
  const dim = getTreeNodeByCode(dimCode);
  if (!dim) return [];
  const children = (db.valueListTree || []).filter(n => n.parentId === dim.id && n.status === "enabled");
  if (!refIds || !refIds.length) return children;
  return children.filter(n => !n.refId || refIds.includes(n.refId))
    .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
}
function buildFilterTree(dimCode, parentId = null) {
  const dim = getTreeNodeByCode(dimCode);
  if (!dim) return [];
  const pid = parentId !== null ? parentId : dim.id;
  return getTreeChildren(pid).map(n => ({
    name: n.name,
    selectable: n.type === "value",
    children: buildFilterTree(dimCode, n.id)
  }));
}
function getAllLeafValues(dimCode) {
  const dim = getTreeNodeByCode(dimCode);
  if (!dim) return [];
  const result = [];
  const collect = (nodeId) => {
    const children = getTreeChildren(nodeId);
    children.forEach(c => {
      if (c.type === "value") result.push(c);
      else collect(c.id);
    });
  };
  collect(dim.id);
  return result;
}
function getAllUploadAccept() {
  const leaves = getAllLeafValues("file_format");
  return leaves.map(l => `.${l.code}`).join(",");
}
function getAllCollectTaskTypes() {
  const dim = getTreeNodeByCode("file_format");
  if (!dim) return [];
  return getTreeChildren(dim.id).filter(n => n.type === "group").map(n => n.name);
}
function getVehicleModels() {
  return getAllLeafValues("model").map(n => n.name);
}
function getFileFormatCategoriesFromTree() {
  const dim = getTreeNodeByCode("file_format");
  if (!dim) return {};
  const groups = getTreeChildren(dim.id).filter(n => n.type === "group");
  const allLeaves = getAllLeafValues("file_format");
  const result = {};
  groups.forEach(g => {
    const formats = allLeaves.filter(f => {
      let parent = getTreeNodeById(f.parentId);
      while (parent) {
        if (parent.id === g.id) return true;
        parent = getTreeNodeById(parent.parentId);
      }
      return false;
    });
    result[g.name] = formats.map(f => f.name);
  });
  return result;
}
function getAspectRatiosFromTree() {
  return getAllLeafValues("aspect_ratio").map(n => ({
    label: n.name,
    value: parseFloat(n.attr1) || 0
  }));
}
function getAllowedUploadFormats() {
  return getAllLeafValues("file_format").map(n => n.name);
}
function getFilterLabels() {
  const dims = getDimensionNodes();
  return dims.map(d => d.name);
}
function getConfigurableFilters() {
  return [...new Set([...getFilterLabels(), "宽高比", "文件大小", "上传时间", "素材失效日"])];
}

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
    model: SEED_VALUE_LIST_TREE.filter(n => n.parentId === "vl_dim_model" && n.status !== "deleted").sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))[index % 5]?.name || "",
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
  // ===== 业务标签 (tagType=1, 支持多层级) =====

  { id: "tag-biz-001", tagName: "营销活动", tagCode: "marketing", tagType: 1, parentId: 0, level: 0, aiSource: 0, aiRecognitionEnabled: 1, isVisible: 1, status: 1, sortOrder: 1, description: "各类营销活动素材", createdBy: "杨文婷", createdAt: "2026-01-01 09:00:00", updatedAt: "2026-05-01 10:00:00" },
  { id: "tag-biz-002", tagName: "车展物料", tagCode: "motor_show", tagType: 1, parentId: "营销活动", level: 1, aiSource: 0, aiRecognitionEnabled: 1, isVisible: 1, status: 1, sortOrder: 2, description: "各车展现场展示及宣传物料", createdBy: "杨文婷", createdAt: "2026-02-20 10:15:00", updatedAt: "2026-05-18 16:30:00" },
  { id: "tag-biz-003", tagName: "产品宣传", tagCode: "product_promo", tagType: 1, parentId: 0, level: 0, aiSource: 0, aiRecognitionEnabled: 1, isVisible: 1, status: 1, sortOrder: 3, description: "车型产品力宣传物料", createdBy: "Kerry", createdAt: "2026-04-01 08:00:00", updatedAt: "2026-05-22 11:00:00" },
  { id: "tag-biz-004", tagName: "经销商素材", tagCode: "dealer", tagType: 1, parentId: 0, level: 0, aiSource: 0, aiRecognitionEnabled: 1, isVisible: 1, status: 1, sortOrder: 4, description: "经销商渠道门店推广素材", createdBy: "杨文婷", createdAt: "2026-01-10 14:00:00", updatedAt: "2026-04-15 09:00:00" },
  { id: "tag-biz-005", tagName: "618促销", tagCode: "promo_618", tagType: 1, parentId: "营销活动", level: 1, aiSource: 0, aiRecognitionEnabled: 1, isVisible: 1, status: 1, sortOrder: 5, description: "618电商大促相关素材", createdBy: "Kerry", createdAt: "2026-05-01 10:00:00", updatedAt: "2026-06-01 08:00:00" },
  { id: "tag-biz-006", tagName: "国庆活动", tagCode: "national_day", tagType: 1, parentId: "营销活动", level: 1, aiSource: 0, aiRecognitionEnabled: 1, isVisible: 1, status: 1, sortOrder: 6, description: "国庆节营销活动素材", createdBy: "杨文婷", createdAt: "2026-04-20 09:00:00", updatedAt: "2026-05-10 14:00:00" },
  { id: "tag-biz-007", tagName: "自媒体推广", tagCode: "social_media", tagType: 1, parentId: "产品宣传", level: 1, aiSource: 0, aiRecognitionEnabled: 1, isVisible: 1, status: 1, sortOrder: 7, description: "微博、抖音、小红书等自媒体平台推广素材", createdBy: "Kerry", createdAt: "2026-03-01 11:00:00", updatedAt: "2026-05-25 16:00:00" },
  { id: "tag-biz-008", tagName: "KOL合作", tagCode: "kol", tagType: 1, parentId: "产品宣传", level: 1, aiSource: 0, aiRecognitionEnabled: 1, isVisible: 1, status: 1, sortOrder: 8, description: "与KOL/KOC合作产出的推广素材", createdBy: "杨文婷", createdAt: "2026-02-15 10:00:00", updatedAt: "2026-04-30 09:00:00" },
  { id: "tag-biz-009", tagName: "试驾活动", tagCode: "test_drive", tagType: 1, parentId: "营销活动", level: 1, aiSource: 0, aiRecognitionEnabled: 1, isVisible: 1, status: 1, sortOrder: 9, description: "试驾体验活动相关素材", createdBy: "Kerry", createdAt: "2026-04-10 15:00:00", updatedAt: "2026-05-15 10:00:00" },
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

const filterLabels = ["素材来源", "文件格式", "品牌", "车系", "车型", "内饰色", "外饰色", "权限范围", "业务标签", "AI标签", "素材状态", "上传时间", "素材失效日"];
const configurableFilters = [...filterLabels, "宽高比", "文件大小"];

const SESSION_USER_KEY = "dp-material-library-current-user";
const SYSTEM_MENUS = [
  { id: "activity", label: "用户动态", group: "更多功能" },
  { id: "loginLogs", label: "用户登录日志", group: "更多功能" },
  { id: "tags", label: "标签管理", group: "更多功能" },
  { id: "validity", label: "有效期管理", group: "更多功能" },
  { id: "collect", label: "收集素材", group: "更多功能" },
  { id: "share", label: "分享记录", group: "更多功能" },
  { id: "recycle", label: "回收站", group: "更多功能" },
  { id: "valueLists", label: "值列表管理", group: "更多功能" },
  { id: "users", label: "用户管理", group: "系统管理" },
  { id: "roles", label: "角色管理", group: "系统管理" },
  { id: "organizations", label: "组织管理", group: "系统管理" },
  { id: "permissions", label: "权限管理", group: "系统管理" },
];
const MANAGED_PAGES = SYSTEM_MENUS.map((menu) => menu.id);

let db = loadDb();
ensureSystemData();
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
  loginLogFilters: { username: "", name: "", startDate: "", endDate: "" },
  userManageFilters: { username: "", name: "", includeChildren: true },
  userManageOrgId: "",
  selectedManageUserId: "",
  permissionView: "menu",
  permissionMenuId: "",
  permissionSubjectType: "organization",
  permissionSubjectId: "",
  recycleSort: "deletedDesc",
  selectedValueListId: "",
  valueListSearch: { keyword: "" },
  valueListSelectedNodeId: "",
  valueListExpandedIds: new Set(),
  theme: localStorage.getItem("dp-material-library-theme") || "light",
  zoomLevel: 100,
  panX: 0,
  panY: 0,
  isPanning: false,
  detailPanelWidth: Number(localStorage.getItem("dp-material-library-detail-width")) || 600,
  detailPanelHeight: Number(localStorage.getItem("dp-material-library-detail-height")) || 300,
  detailPanelDock: "side",
};

let currentUser = getStoredCurrentUser() || getAnonymousUser();

function isAdmin() {
  return getUserRoleIds(currentUser).includes("admin") || currentUser.role === "admin";
}

function canManageAsset(asset) {
  return isAdmin() || asset?.owner === currentUser.name;
}

function getAnonymousUser() {
  return { id: "", username: "", name: "未登录", roleId: "", roleIds: [], role: "guest", organizationId: "", organization: "", department: "" };
}

function getStoredCurrentUser() {
  try {
    const userId = localStorage.getItem(SESSION_USER_KEY);
    if (!userId) return null;
    return getUserSessionInfo(userId);
  } catch (error) {
    return null;
  }
}

function isLoggedIn() {
  return !!currentUser?.id;
}

function getUserSessionInfo(userId) {
  const user = (db.users || []).find((item) => item.id === userId && item.status === "启用");
  if (!user) return null;
  const roleIds = getUserRoleIds(user);
  const roles = (db.roles || []).filter((item) => roleIds.includes(item.id));
  const organization = (db.organizations || []).find((item) => item.id === user.organizationId);
  return {
    ...user,
    roleIds,
    roleId: roleIds[0] || "",
    role: roles.map((role) => role.name).join("、") || roleIds.join("、") || "",
    organization: organization?.name || user.organizationId || "",
    department: organization?.name || "",
    permissions: mergeRolePermissions(roles),
  };
}

function getCurrentRole() {
  return (db.roles || []).find((role) => role.id === currentUser.roleId) || null;
}

function getUserRoleIds(user = {}) {
  const ids = Array.isArray(user.roleIds) ? user.roleIds : [];
  const legacy = user.roleId ? [user.roleId] : [];
  return [...new Set([...ids, ...legacy].filter(Boolean))];
}

function getCurrentRoles() {
  const roleIds = getUserRoleIds(currentUser);
  return (db.roles || []).filter((role) => roleIds.includes(role.id));
}

function mergeRolePermissions(roles = []) {
  const merged = createMenuPermissions(false, false);
  roles.forEach((role) => {
    SYSTEM_MENUS.forEach((menu) => {
      const permission = role.permissions?.[menu.id] || {};
      if (permission.editable) merged[menu.id].editable = true;
      if (permission.visible || permission.editable) merged[menu.id].visible = true;
    });
  });
  return merged;
}

function getMenuPermission(menuId) {
  if (isAdmin()) return { visible: true, editable: true };
  const rolePermissions = getCurrentRoles().map((role) => role.permissions?.[menuId]);
  const sources = [
    ...rolePermissions,
    db.orgPermissions?.[currentUser.organizationId]?.[menuId],
    db.userPermissions?.[currentUser.id]?.[menuId],
  ];
  const editable = sources.some((permission) => !!permission?.editable);
  const visible = editable || sources.some((permission) => !!permission?.visible);
  return { visible, editable };
}

function canViewMenu(menuId) {
  return getMenuPermission(menuId).visible;
}

function canEditMenu(menuId) {
  return getMenuPermission(menuId).editable;
}

function ensurePageAllowed() {
  if (MANAGED_PAGES.includes(state.page) && !canViewMenu(state.page)) {
    state.page = "all";
    state.groupId = "all";
    showToast("当前账号无权访问该菜单");
  }
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
  clearFilters: document.querySelector("#clearFilters"),
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

function createMenuPermissions(visible = true, editable = true) {
  return SYSTEM_MENUS.reduce((map, menu) => {
    map[menu.id] = { visible: !!visible || !!editable, editable: !!editable };
    return map;
  }, {});
}

function normalizeMenuPermissions(permissions = {}, defaultVisible = false, defaultEditable = false) {
  return SYSTEM_MENUS.reduce((map, menu) => {
    const permission = permissions?.[menu.id] || {};
    const editable = !!permission.editable || !!defaultEditable;
    map[menu.id] = {
      visible: editable || !!permission.visible || !!defaultVisible,
      editable,
    };
    return map;
  }, {});
}

function getDefaultOrganizations() {
  return [
    { id: "org-brand", name: "品牌中心", parentId: "", manager: "康明", status: "启用" },
    { id: "org-market", name: "市场部", parentId: "", manager: "陈然", status: "启用" },
    { id: "org-support", name: "经销商支持", parentId: "", manager: "李想", status: "启用" },
  ];
}

function getDefaultRoles() {
  return [
    { id: "admin", name: "超级管理员", status: "启用", description: "系统全量管理权限", permissions: createMenuPermissions(true, true) },
    { id: "tag-viewer", name: "标签只读", status: "启用", description: "仅查看标签，不允许维护", permissions: { ...createMenuPermissions(false, false), tags: { visible: true, editable: false } } },
    { id: "material-operator", name: "素材运营", status: "启用", description: "素材与标签日常维护", permissions: { ...createMenuPermissions(false, false), tags: { visible: true, editable: true }, collect: { visible: true, editable: true }, share: { visible: true, editable: true }, validity: { visible: true, editable: true } } },
  ];
}

function getDefaultUsers() {
  return [
    { id: "user-admin", username: "admin", password: "admin123", name: "系统管理员", organizationId: "org-brand", roleId: "admin", roleIds: ["admin"], status: "启用", lastLogin: "" },
    { id: "user-kerry", username: "kerry", password: "kerry123", name: "Kerry", organizationId: "org-market", roleId: "material-operator", roleIds: ["material-operator"], status: "启用", lastLogin: "" },
    { id: "user-tag-view", username: "tagview", password: "tag123", name: "标签查看员", organizationId: "org-support", roleId: "tag-viewer", roleIds: ["tag-viewer"], status: "启用", lastLogin: "" },
  ];
}

function ensureSystemData() {
  let changed = false;
  if (!Array.isArray(db.organizations) || !db.organizations.length) {
    db.organizations = getDefaultOrganizations();
    changed = true;
  }
  if (!Array.isArray(db.roles) || !db.roles.length) {
    db.roles = getDefaultRoles();
    changed = true;
  }
  if (!Array.isArray(db.users) || !db.users.length) {
    db.users = getDefaultUsers();
    changed = true;
  }
  if (!Array.isArray(db.loginLogs)) {
    db.loginLogs = [];
    changed = true;
  }
  if (!Array.isArray(db.valueListTree) || !db.valueListTree.length) {
    db.valueListTree = SEED_VALUE_LIST_TREE;
    changed = true;
  }
  if (!db.orgPermissions || typeof db.orgPermissions !== "object" || Array.isArray(db.orgPermissions)) {
    db.orgPermissions = {};
    changed = true;
  }
  if (!db.userPermissions || typeof db.userPermissions !== "object" || Array.isArray(db.userPermissions)) {
    db.userPermissions = {};
    changed = true;
  }
  (db.roles || []).forEach((role) => {
    const normalized = normalizeMenuPermissions(role.permissions, role.id === "admin", role.id === "admin");
    if (JSON.stringify(role.permissions || {}) !== JSON.stringify(normalized)) changed = true;
    role.permissions = normalized;
  });
  (db.users || []).forEach((user) => {
    if (!user.status) {
      user.status = "启用";
      changed = true;
    }
    const roleIds = getUserRoleIds(user);
    if (JSON.stringify(user.roleIds || []) !== JSON.stringify(roleIds)) {
      user.roleIds = roleIds;
      changed = true;
    }
    if (user.roleId !== (roleIds[0] || "")) {
      user.roleId = roleIds[0] || "";
      changed = true;
    }
  });
  (db.users || []).forEach((user) => {
    const normalized = normalizeMenuPermissions(db.userPermissions[user.id] || {});
    if (JSON.stringify(db.userPermissions[user.id] || {}) !== JSON.stringify(normalized)) changed = true;
    db.userPermissions[user.id] = normalized;
  });
  (db.organizations || []).forEach((org) => {
    const normalized = normalizeMenuPermissions(db.orgPermissions[org.id] || {});
    if (JSON.stringify(db.orgPermissions[org.id] || {}) !== JSON.stringify(normalized)) changed = true;
    db.orgPermissions[org.id] = normalized;
  });
  if (changed) saveDb();
}


function bootstrap() {
  localStorage.removeItem("dp-material-library-detail-dock");
  ensureRuntimeElements();
  ensureSystemData();
  currentUser = getStoredCurrentUser() || getAnonymousUser();
  migrateVehicleModels();
  migrateAssetMetadata();
  migrateShareExpiresAt();
  renderShell();
  initValueListModalEvents();
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
  if (!isLoggedIn()) showLoginPage();
  if (state.selectedAssetId && location.hash.startsWith("#asset=")) setTimeout(() => openViewer(state.selectedAssetId), 0);
}

function normalizePageState() {
  const validPages = ["all", "pending", "created", "more", "activity", "loginLogs", "tags", "validity", "valueLists", "users", "roles", "organizations", "permissions", "collect", "share", "recycle"];
  if (!validPages.includes(state.page)) {
    state.page = "all";
    state.groupId = "all";
  }
  ensurePageAllowed();
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
  const models = getVehicleModels();
  db.assets.forEach((asset, index) => {
    if (!models.includes(asset.model)) {
      asset.model = detectVehicleModel(asset.name) || models[index % models.length];
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
          <label>选择文件<input name="files" type="file" multiple required accept="${getAllUploadAccept()}" /></label>
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
  fileInput.accept = getAllUploadAccept();
  fileInput.hidden = true;

  const folderInput = document.createElement("input");
  folderInput.id = "folderInput";
  folderInput.type = "file";
  folderInput.multiple = true;
  folderInput.accept = getAllUploadAccept();
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

  const login = document.createElement("section");
  login.id = "loginPage";
  login.className = "login-page hidden";
  login.innerHTML = `
    <form class="login-card" id="loginForm">
      <div class="login-brand"><span>DPCA</span><strong>素材库</strong></div>
      <h1>账号登录</h1>
      <p>使用系统管理中的用户账号进入素材库。</p>
      <label>登录用户名<input id="loginUsername" name="username" autocomplete="username" value="admin" required /></label>
      <label>密码<input id="loginPassword" name="password" type="password" autocomplete="current-password" value="admin123" required /></label>
      <label>登录入口<select id="loginEntry" name="loginEntry"><option>网页登录</option><option>飞书登录</option><option>企微登录</option></select></label>
      <div class="login-hint">默认管理员：admin / admin123</div>
      <button class="primary" type="submit">登录</button>
    </form>`;

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

  document.body.append(fileInput, folderInput, modal, toast, login);
}

function showLoginPage() {
  document.querySelector("#loginPage")?.classList.remove("hidden");
  setTimeout(() => document.querySelector("#loginUsername")?.focus(), 0);
}

function hideLoginPage() {
  document.querySelector("#loginPage")?.classList.add("hidden");
}

function handleLoginSubmit(event) {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(event.target));
  const username = String(data.username || "").trim();
  const password = String(data.password || "");
  const user = (db.users || []).find((item) => item.username === username && item.password === password);
  if (!user) {
    showToast("用户名或密码错误");
    return;
  }
  if (user.status !== "启用") {
    showToast("该账号已停用，请联系管理员");
    return;
  }
  const loginAt = nowText();
  const loginEntry = data.loginEntry || "网页登录";
  user.lastLogin = loginAt;
  db.loginLogs = db.loginLogs || [];
  db.loginLogs.unshift({
    id: `login-${Date.now()}`,
    username: user.username,
    name: user.name,
    loginAt,
    ip: getLoginIpAddress(),
    entry: loginEntry,
  });
  db.loginLogs = db.loginLogs.slice(0, 500);
  saveDb();
  localStorage.setItem(SESSION_USER_KEY, user.id);
  currentUser = getUserSessionInfo(user.id) || getAnonymousUser();
  hideLoginPage();
  renderShell();
  normalizePageState();
  render();
  showToast(`欢迎回来，${currentUser.name}`);
}

function getLoginIpAddress() {
  return "127.0.0.1";
}

function logoutCurrentUser() {
  localStorage.removeItem(SESSION_USER_KEY);
  currentUser = getAnonymousUser();
  renderShell();
  state.page = "all";
  state.groupId = "all";
  render();
  showLoginPage();
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
  const userButton = document.querySelector("#userButton");
  if (userButton) {
    userButton.textContent = (currentUser.name || "未").slice(0, 1).toUpperCase();
    userButton.title = isLoggedIn() ? `${currentUser.name} / ${currentUser.role}` : "未登录";
  }
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
  applyMenuPermissions();

  // mainNav 和 sortDropdown 已改为 HTML 静态定义，无需动态渲染

  renderFilterChips();
  renderFilterConfig();
}

function applyMenuPermissions() {
  document.querySelectorAll("#moreMenuContent [data-go]").forEach((button) => {
    const page = button.dataset.go;
    button.classList.toggle("hidden", MANAGED_PAGES.includes(page) && !canViewMenu(page));
  });
  document.querySelectorAll("#moreMenuContent .menu-section").forEach((section) => {
    const visibleChild = [...section.querySelectorAll("[data-go]")].some((button) => !button.classList.contains("hidden"));
    section.classList.toggle("hidden", !visibleChild);
  });
}

function renderFilterChips() {
  els.filters.innerHTML = state.visibleFilters.map((item) => {
    const selections = getFilterSelections(item);
    const active = selections.length ? `<small>${escapeHtml(formatFilterSelections(selections))}</small>` : "";
    return `<button class="filter-chip ${selections.length ? "active" : ""}" data-filter="${item}" type="button">${item}${active}</button>`;
  }).join("");
}

function renderFilterConfig() {
  const allFilters = getConfigurableFilters();
  els.tagBank.innerHTML = allFilters.map((item) => {
    const selected = state.visibleFilters.includes(item);
    return `<button class="${selected ? "" : "inactive"}" data-config-filter="${item}" type="button">${item}</button>`;
  }).join("");
  els.selectedTags.innerHTML = state.visibleFilters.map((item) => `<span data-remove-config="${item}">${item} ×</span>`).join("");
}

function bindEvents() {
  document.querySelector("#loginForm")?.addEventListener("submit", handleLoginSubmit);

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
    const label = button.dataset.filter;
    if (state.activeFilter === label) {
      hideMenus();
      state.activeFilter = null;
    } else {
      showFilterMenu(button, label);
      state.activeFilter = label;
    }
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
  els.clearFilters?.addEventListener("click", () => {
    state.filters = {};
    render();
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
  document.querySelector("#mergeClearSelected")?.addEventListener("click", clearMergeTagSelection);
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
      if (MANAGED_PAGES.includes(goButton.dataset.go) && !canViewMenu(goButton.dataset.go)) {
        showToast("当前账号无权访问该菜单");
        hideMenus();
        return;
      }
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
