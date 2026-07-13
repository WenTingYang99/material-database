(function () {
  const loadingState = { count: 0 };

  const AppInfra = {
    state: {},
    render: {},
    bindEvents: {},
    api: {},
    utils: {
      debounce(fn, wait = 300) {
        let timer = 0;
        return function debounced(...args) {
          window.clearTimeout(timer);
          timer = window.setTimeout(() => fn.apply(this, args), wait);
        };
      },
      nowTimestamp() {
        return Date.now();
      },
      todayText() {
        const date = new Date();
        const pad = (value) => String(value).padStart(2, "0");
        return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
      },
    },
    init() {
      ensureToastRoot();
      ensureModalRoot();
      ensureLoadingRoot();
    },
  };

  function ensureToastRoot() {
    if (document.querySelector("#dpToastRoot")) return;
    const root = document.createElement("div");
    root.id = "dpToastRoot";
    root.className = "dp-toast";
    document.body.appendChild(root);
  }

  function showToast(message, type = "info") {
    ensureToastRoot();
    const root = document.querySelector("#dpToastRoot");
    const item = document.createElement("div");
    item.className = `dp-toast__item dp-toast__item--${type}`;
    item.textContent = message;
    root.appendChild(item);
    window.setTimeout(() => item.classList.add("dp-toast__item--leaving"), 2200);
    window.setTimeout(() => item.remove(), 2600);
  }

  function ensureModalRoot() {
    if (document.querySelector("#dpModalRoot")) return;
    const root = createFromTemplate("tplConfirmModal") || document.createElement("div");
    if (!root.id) {
      root.id = "dpModalRoot";
      root.className = "dp-confirm hidden";
      root.innerHTML = `
        <div class="dp-confirm__card" role="dialog" aria-modal="true" aria-labelledby="dpConfirmTitle">
          <h2 id="dpConfirmTitle" class="dp-confirm__title">确认操作</h2>
          <p class="dp-confirm__message"></p>
          <div class="dp-confirm__actions">
            <button class="dp-confirm__cancel" type="button">取消</button>
            <button class="dp-confirm__ok" type="button">确定</button>
          </div>
        </div>`;
    }
    document.body.appendChild(root);
  }

  function confirm(message, options = {}) {
    ensureModalRoot();
    const root = document.querySelector("#dpModalRoot");
    const title = root.querySelector(".dp-confirm__title");
    const text = root.querySelector(".dp-confirm__message");
    const cancel = root.querySelector(".dp-confirm__cancel");
    const ok = root.querySelector(".dp-confirm__ok");
    title.textContent = options.title || "确认操作";
    text.textContent = message;
    cancel.textContent = options.cancelText || "取消";
    ok.textContent = options.okText || "确定";
    ok.classList.toggle("dp-confirm__ok--danger", options.danger !== false);
    root.classList.remove("hidden");

    return new Promise((resolve) => {
      const finish = (value) => {
        root.classList.add("hidden");
        ok.removeEventListener("click", onOk);
        cancel.removeEventListener("click", onCancel);
        root.removeEventListener("click", onBackdrop);
        document.removeEventListener("keydown", onKeydown);
        resolve(value);
      };
      const onOk = () => finish(true);
      const onCancel = () => finish(false);
      const onBackdrop = (event) => {
        if (event.target === root) finish(false);
      };
      const onKeydown = (event) => {
        if (event.key === "Escape") finish(false);
      };
      ok.addEventListener("click", onOk);
      cancel.addEventListener("click", onCancel);
      root.addEventListener("click", onBackdrop);
      document.addEventListener("keydown", onKeydown);
    });
  }

  function ensureLoadingRoot() {
    if (document.querySelector("#dpLoadingRoot")) return;
    const root = createFromTemplate("tplGlobalLoading") || document.createElement("div");
    if (!root.id) {
      root.id = "dpLoadingRoot";
      root.className = "dp-loading hidden";
      root.innerHTML = '<div class="dp-loading__spinner"></div><span>加载中</span>';
    }
    document.body.appendChild(root);
  }

  function createFromTemplate(id) {
    const template = document.querySelector(`#${id}`);
    return template?.content?.firstElementChild?.cloneNode(true) || null;
  }

  function setLoading(active) {
    ensureLoadingRoot();
    loadingState.count = Math.max(0, loadingState.count + (active ? 1 : -1));
    document.querySelector("#dpLoadingRoot").classList.toggle("hidden", loadingState.count === 0);
  }

  async function http(url, options = {}) {
    const token = window.localStorage.getItem("dp-material-library-token") || "";
    setLoading(true);
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          ...(options.headers || {}),
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (response.status === 401) {
        window.location.href = "login.html";
        throw new Error("UNAUTHORIZED");
      }
      if (!response.ok) throw new Error("REQUEST_FAILED");
      return await response.json();
    } catch (error) {
      window.Toast?.error("请求失败，请稍后重试");
      throw error;
    } finally {
      setLoading(false);
    }
  }

  // 日期控件统一入口：优先用 flatpickr 强制显示 YYYY-MM-DD；无库时降级原生 date/time。
  // 注意：flatpickr 接管后显示与输入均为 dateFormat("Y-m-d")，不再受浏览器区域影响（不会变 YYYY/MM/DD）。
  function initDatePicker(selector, options = {}) {
    const nodes = getPickerNodes(selector);
    nodes.forEach((node) => {
      if (!node || node.dataset.datePickerReady === "true") return;
      node.dataset.datePickerReady = "true";
      node.setAttribute("autocomplete", "off");
      node.setAttribute("inputmode", "none");
      if (window.flatpickr && node.type !== "time") {
        const fpOptions = {
          dateFormat: "Y-m-d",
          allowInput: false,
          disableMobile: true,
          ...options,
        };
        node.removeAttribute("min");
        node.removeAttribute("max");
        window.flatpickr(node, fpOptions);
        return;
      }
      // 降级：原生 date/time，锁键盘 + 点开原生选择器
      if (options.minDate && node.type === "date") node.min = options.minDate === "today" ? AppInfra.utils.todayText() : options.minDate;
      if (options.maxDate && node.type === "date") node.max = options.maxDate === "today" ? AppInfra.utils.todayText() : options.maxDate;
      if (options.minTime && node.type === "time") node.min = options.minTime;
      if (options.maxTime && node.type === "time") node.max = options.maxTime;
      node.setAttribute("readonly", "readonly");
      lockNativePicker(node);
    });
  }

  function getPickerNodes(selector) {
    if (typeof selector === "string") return [...document.querySelectorAll(selector)];
    if (!selector) return [];
    if (selector instanceof Element) return [selector];
    if (typeof selector.length === "number") return [...selector].filter(Boolean);
    return [selector].filter(Boolean);
  }

  function lockNativePicker(node) {
    const blockManualInput = (event) => {
      const allowedKeys = ["Tab", "Shift", "Escape", "Enter", "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"];
      if (!allowedKeys.includes(event.key)) event.preventDefault();
    };
    const openPicker = () => {
      if (typeof node.showPicker !== "function") return;
      try {
        node.removeAttribute("readonly");
        node.showPicker();
      } catch (error) {
        // Some browsers reject showPicker outside a direct user gesture.
      } finally {
        window.setTimeout(() => node.setAttribute("readonly", "readonly"), 0);
      }
    };
    node.addEventListener("keydown", blockManualInput);
    node.addEventListener("beforeinput", (event) => event.preventDefault());
    node.addEventListener("paste", (event) => event.preventDefault());
    node.addEventListener("drop", (event) => event.preventDefault());
    node.addEventListener("click", openPicker);
  }

  window.AppInfra = AppInfra;
  window.Toast = {
    success(message) { showToast(message, "success"); },
    error(message) { showToast(message, "error"); },
    info(message) { showToast(message, "info"); },
  };
  window.Modal = { confirm };
  window.http = http;
  window.initDatePicker = initDatePicker;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => AppInfra.init(), { once: true });
  } else {
    AppInfra.init();
  }
}());
