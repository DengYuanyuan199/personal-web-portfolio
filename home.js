import { el, initLangToggle, loadContent, setupTopBar, t } from "./common.js";

const POS_CLASS = {
  tl: "hub-keyword-tl",
  tr: "hub-keyword-tr",
  bl: "hub-keyword-bl",
  br: "hub-keyword-br",
};

const PARTICLE_COUNT = 14;

function createParticles(theme) {
  const wrap = el("div", { class: "hub-particles", "aria-hidden": "true" });
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const angle = (i / PARTICLE_COUNT) * 360 + (Math.random() * 20 - 10);
    const dist = 38 + Math.random() * 28;
    const delay = Math.random() * 3.5;
    const size = 2 + Math.random() * 2.5;
    wrap.append(
      el("span", {
        class: `hub-particle hub-particle--${theme}`,
        style: `--angle:${angle}deg;--dist:${dist}%;--delay:${delay}s;--size:${size}px`,
      }),
    );
  }
  return wrap;
}

function renderHub(hub, lang) {
  const keywords = (hub.keywords ?? []).map((kw) =>
    el("span", {
      class: `hub-keyword ${POS_CLASS[kw.position] ?? "hub-keyword-tl"}`,
    }, [el("span", { text: t(kw.label, lang) })]),
  );

  const visual = el("div", { class: "hub-visual" }, [
    createParticles(hub.theme ?? "blue"),
    el("div", {
      class: `hub-glow hub-glow--${hub.theme ?? "blue"}`,
      "aria-hidden": "true",
    }),
    el("span", { class: "hub-label", text: t(hub.label, lang) }),
  ]);

  const orbit = el("div", { class: "hub-orbit" }, [
    el("div", { class: "hub-ring", "aria-hidden": "true" }),
    ...keywords,
  ]);

  return el(
    "a",
    {
      class: "hub",
      href: `./category.html?c=${encodeURIComponent(hub.id)}`,
      "data-hub": hub.id,
    },
    [visual, orbit],
  );
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
    const hub = e.target.closest(".hub");
    if (!hub) return;
    if (hub.classList.contains("is-active")) return;
    e.preventDefault();
    stage.querySelectorAll(".hub").forEach((h) => h.classList.remove("is-active"));
    hub.classList.add("is-active");
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
