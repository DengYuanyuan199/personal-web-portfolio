import { el, initLangToggle, loadContent, setupTopBar, t } from "./common.js";

function getCategoryId() {
  return new URLSearchParams(window.location.search).get("c");
}

function findKeyword(data, categoryId) {
  for (const hub of data.hubs ?? []) {
    const keyword = (hub.keywords ?? []).find((kw) => kw.id === categoryId);
    if (keyword) return { hub, keyword };
  }
  return null;
}

function renderProjects(projects, lang) {
  const list = document.getElementById("projectList");
  if (!list) return;
  list.innerHTML = "";

  for (const project of projects) {
    const kw = project.keywords;
    const keywords = Array.isArray(kw?.[lang])
      ? kw[lang].join(" · ")
      : Array.isArray(kw)
        ? kw.join(" · ")
        : String(kw?.[lang] ?? kw?.zh ?? kw?.en ?? "");

    const caption = el("div", { class: "project-caption" }, [
      el("h2", { class: "project-name", text: t(project.name, lang) }),
      el("p", { class: "project-meta", text: `${project.year ?? ""} · ${keywords}` }),
    ]);

    const block = el("article", { class: "project-block" }, [
      el("img", {
        class: "project-image",
        src: project.image,
        alt: t(project.name, lang),
        loading: "lazy",
      }),
      caption,
    ]);

    list.append(block);
  }

  initProjectExpand(list);
}

function initProjectExpand(list) {
  if (!list || list.dataset.expandInit) return;
  list.dataset.expandInit = "true";

  const blocks = () => [...list.querySelectorAll(".project-block")];

  list.addEventListener(
    "click",
    (e) => {
      const block = e.target.closest(".project-block");
      if (!block) return;

      const expanded = block.classList.contains("is-expanded");
      blocks().forEach((b) => b.classList.remove("is-expanded"));
      list.classList.toggle("is-active", !expanded);
      if (!expanded) block.classList.add("is-expanded");
    },
    { passive: true },
  );
}

async function main() {
  const categoryId = getCategoryId();
  if (!categoryId) {
    window.location.href = "./";
    return;
  }

  let data;
  try {
    data = await loadContent();
  } catch {
    return;
  }

  const found = findKeyword(data, categoryId);
  if (!found) {
    window.location.href = "./";
    return;
  }

  const { keyword } = found;
  const ui = data.ui ?? {};
  const titleEl = document.getElementById("categoryTitle");

  function apply(lang) {
    setupTopBar(data, lang, { showBack: true });
    if (titleEl) titleEl.textContent = t(keyword.label, lang);
    renderProjects(keyword.projects ?? [], lang);
  }

  const lang = initLangToggle(ui, apply);
  apply(lang);
}

main();
