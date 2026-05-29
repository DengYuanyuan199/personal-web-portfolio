import { el, initLangToggle, loadContent, setupTopBar, t } from "./common.js";

const VISIBLE_COUNT = 4;
const SLIDE_STEP = 2;

function getCategoryId() {
  return new URLSearchParams(window.location.search).get("c");
}

function findHub(data, hubId) {
  return (data.hubs ?? []).find((h) => h.id === hubId) ?? null;
}

function buildProjectBlock(project, lang) {
  const kw = project.keywords;
  const keywords = Array.isArray(kw?.[lang])
    ? kw[lang].join(" · ")
    : Array.isArray(kw)
      ? kw.join(" · ")
      : String(kw?.[lang] ?? kw?.zh ?? kw?.en ?? "");

  return el("article", { class: "project-block" }, [
    el("img", {
      class: "project-image",
      src: project.image,
      alt: t(project.name, lang),
      loading: "lazy",
    }),
    el("div", { class: "project-caption" }, [
      el("h2", { class: "project-name", text: t(project.name, lang) }),
      el("p", { class: "project-meta", text: `${project.year ?? ""} · ${keywords}` }),
    ]),
  ]);
}

function initProjectExpand(track) {
  if (!track || track.dataset.expandInit) return;
  track.dataset.expandInit = "true";

  track.addEventListener(
    "click",
    (e) => {
      if (e.target.closest(".carousel-btn")) return;
      const block = e.target.closest(".project-block");
      if (!block) return;

      const blocks = [...track.querySelectorAll(".project-block")];
      const expanded = block.classList.contains("is-expanded");
      blocks.forEach((b) => b.classList.remove("is-expanded"));
      track.classList.toggle("is-active", !expanded);
      if (!expanded) block.classList.add("is-expanded");
    },
    { passive: true },
  );
}

function initCarousel(carousel, projectCount, ui, lang) {
  const track = carousel.querySelector(".project-track");
  const prevBtn = carousel.querySelector(".carousel-btn--prev");
  const nextBtn = carousel.querySelector(".carousel-btn--next");
  const viewport = carousel.querySelector(".project-viewport");
  if (!track || !prevBtn || !nextBtn || !viewport) return;

  const maxPage = Math.max(0, Math.ceil((projectCount - VISIBLE_COUNT) / SLIDE_STEP));

  if (!carousel._carouselState) {
    carousel._carouselState = { page: 0 };

    prevBtn.addEventListener("click", () => {
      carousel._carouselState.page = Math.max(0, carousel._carouselState.page - 1);
      carousel._carouselUpdate();
    });

    nextBtn.addEventListener("click", () => {
      carousel._carouselState.page = Math.min(maxPage, carousel._carouselState.page + 1);
      carousel._carouselUpdate();
    });

    window.addEventListener(
      "resize",
      () => {
        carousel._carouselUpdate?.();
      },
      { passive: true },
    );
  }

  carousel._carouselState.page = 0;
  carousel._carouselState.maxPage = maxPage;

  carousel._carouselUpdate = () => {
    const { page } = carousel._carouselState;
    const panel = viewport.querySelector(".project-block")?.offsetWidth ?? 0;
    const gap = 3;
    const offset = page * SLIDE_STEP * (panel + gap);
    track.style.transform = `translateX(${-offset}px)`;

    prevBtn.hidden = page <= 0;
    nextBtn.hidden = page >= carousel._carouselState.maxPage;
    carousel.classList.toggle("has-nav", carousel._carouselState.maxPage > 0);
  };

  prevBtn.setAttribute("aria-label", t(ui.prevProjects, lang));
  nextBtn.setAttribute("aria-label", t(ui.nextProjects, lang));
  carousel._carouselUpdate();
}

function renderProjects(projects, lang, ui) {
  const carousel = document.getElementById("projectCarousel");
  const track = document.getElementById("projectTrack");
  if (!carousel || !track) return;

  track.innerHTML = "";
  track.style.transform = "translateX(0)";
  track.classList.remove("is-active");
  track.dataset.expandInit = "";

  for (const project of projects) {
    track.append(buildProjectBlock(project, lang));
  }

  initProjectExpand(track);
  initCarousel(carousel, projects.length, ui, lang);
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

  const hub = findHub(data, categoryId);
  if (!hub) {
    window.location.href = "./";
    return;
  }

  const ui = data.ui ?? {};
  const titleEl = document.getElementById("categoryTitle");

  function apply(lang) {
    setupTopBar(data, lang, { showBack: true });
    if (titleEl) titleEl.textContent = t(hub.label, lang);
    renderProjects(hub.projects ?? [], lang, ui);
  }

  const lang = initLangToggle(ui, apply);
  apply(lang);
}

main();
