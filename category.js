import { el, initLangToggle, loadContent, setupTopBar, t } from "./common.js";

function getCategoryId() {
  return new URLSearchParams(window.location.search).get("c");
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

  const category = (data.categories ?? []).find((c) => c.id === categoryId);
  if (!category) {
    window.location.href = "./";
    return;
  }

  const ui = data.ui ?? {};
  const titleEl = document.getElementById("categoryTitle");

  function apply(lang) {
    setupTopBar(data, lang, { showBack: true });
    if (titleEl) titleEl.textContent = t(category.label, lang);
    renderProjects(category.projects ?? [], lang);
  }

  const lang = initLangToggle(ui, apply);
  apply(lang);
}

main();
