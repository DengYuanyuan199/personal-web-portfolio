import { el, initLangToggle, loadContent, setupTopBar, t } from "./common.js";

const POS_CLASS = {
  tl: "hub-keyword-tl",
  tr: "hub-keyword-tr",
  bl: "hub-keyword-bl",
  br: "hub-keyword-br",
};

function renderHub(hub, lang) {
  const keywords = (hub.keywords ?? []).map((kw) =>
    el(
      "a",
      {
        class: `hub-keyword ${POS_CLASS[kw.position] ?? "hub-keyword-tl"}`,
        href: `./category.html?c=${encodeURIComponent(kw.id)}`,
      },
      [el("span", { text: t(kw.label, lang) })],
    ),
  );

  const orbit = el("div", { class: "hub-orbit" }, [
    el("div", { class: "hub-ring", "aria-hidden": "true" }),
    ...keywords,
  ]);

  const glow = el("div", {
    class: `hub-glow hub-glow--${hub.theme ?? "blue"}`,
    "aria-hidden": "true",
  });

  const label = el("span", { class: "hub-label", text: t(hub.label, lang) });

  return el("div", { class: "hub", "data-hub": hub.id }, [glow, label, orbit]);
}

function renderHubs(hubs, lang) {
  const stage = document.getElementById("hubStage");
  if (!stage) return;
  stage.innerHTML = "";

  for (const hub of hubs) {
    stage.append(renderHub(hub, lang));
  }

  initHubInteraction(stage);
}

function initHubInteraction(stage) {
  if (stage.dataset.init) return;
  stage.dataset.init = "true";

  stage.addEventListener("mouseleave", () => {
    stage.querySelectorAll(".hub").forEach((h) => h.classList.remove("is-active"));
  });

  stage.addEventListener("mouseover", (e) => {
    const hub = e.target.closest(".hub");
    stage.querySelectorAll(".hub").forEach((h) => {
      h.classList.toggle("is-active", hub ? h === hub : false);
    });
  });

  stage.addEventListener("click", (e) => {
    if (!window.matchMedia("(hover: none)").matches) return;
    if (e.target.closest(".hub-keyword")) return;
    const hub = e.target.closest(".hub");
    if (!hub) return;
    const active = hub.classList.contains("is-active");
    stage.querySelectorAll(".hub").forEach((h) => h.classList.remove("is-active"));
    if (!active) hub.classList.add("is-active");
  });
}

async function main() {
  let data;
  try {
    data = await loadContent();
  } catch {
    return;
  }

  const ui = data.ui ?? {};

  function apply(lang) {
    setupTopBar(data, lang, { showBack: false });
    renderHubs(data.hubs ?? [], lang);
  }

  const lang = initLangToggle(ui, apply);
  apply(lang);
}

main();
