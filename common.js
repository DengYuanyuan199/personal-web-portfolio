const LANG_KEY = "portfolio-lang";

export function getLang() {
  const saved = localStorage.getItem(LANG_KEY);
  return saved === "en" ? "en" : "zh";
}

export function setLang(lang) {
  localStorage.setItem(LANG_KEY, lang === "en" ? "en" : "zh");
  document.documentElement.lang = lang === "en" ? "en" : "zh-CN";
}

export function t(obj, lang) {
  if (!obj) return "";
  if (typeof obj === "string") return obj;
  return obj[lang] ?? obj.zh ?? obj.en ?? "";
}

export function el(tag, attrs = {}, children = []) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v == null) continue;
    if (k === "class") node.className = String(v);
    else if (k === "text") node.textContent = String(v);
    else if (k.startsWith("on") && typeof v === "function")
      node.addEventListener(k.slice(2), v);
    else node.setAttribute(k, String(v));
  }
  for (const child of children) {
    if (typeof child === "string") node.append(child);
    else if (child) node.append(child);
  }
  return node;
}

export async function loadContent() {
  const res = await fetch("./content.json", { cache: "no-cache" });
  if (!res.ok) throw new Error(`Failed to load content.json: ${res.status}`);
  return res.json();
}

export function initLangToggle(ui, onChange) {
  const btn = document.getElementById("langToggle");
  if (!btn) return getLang();

  let lang = getLang();
  setLang(lang);

  function render() {
    const isZh = lang === "zh";
    btn.innerHTML = "";
    btn.append(
      el("span", { class: isZh ? "lang-active" : "lang-inactive", text: ui.langZh }),
      el("span", { class: "lang-sep", text: "/" }),
      el("span", { class: !isZh ? "lang-active" : "lang-inactive", text: ui.langEn }),
    );
    btn.setAttribute("aria-label", isZh ? "Switch to English" : "切换到中文");
  }

  btn.addEventListener("click", () => {
    lang = lang === "zh" ? "en" : "zh";
    setLang(lang);
    render();
    onChange(lang);
  });

  render();
  return lang;
}

export function setupTopBar(data, lang, options = {}) {
  const site = data.site ?? {};
  document.title = `${t(site.title, lang)} — ${t(site.name, lang)}`;

  const nameEl = document.getElementById("siteName");
  if (nameEl) nameEl.textContent = t(site.name, lang);

  const backEl = document.getElementById("backHome");
  if (backEl) {
    backEl.textContent = t(data.ui?.backHome, lang);
    backEl.hidden = !options.showBack;
  }
}
