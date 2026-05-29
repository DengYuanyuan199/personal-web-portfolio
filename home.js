import { el, initLangToggle, loadContent, setupTopBar, t } from "./common.js";

const SIZE_MAP = {
  xl: "bubble-xl",
  lg: "bubble-lg",
  md: "bubble-md",
  sm: "bubble-sm",
};

function renderBubbles(categories, lang) {
  const stage = document.getElementById("bubbleStage");
  if (!stage) return;
  stage.innerHTML = "";

  for (const cat of categories) {
    const pos = cat.position ?? {};
    const style = {};
    if (pos.top) style.top = pos.top;
    if (pos.left) style.left = pos.left;
    if (pos.right) style.right = pos.right;
    if (pos.bottom) style.bottom = pos.bottom;
    if (cat.delay) style.animationDelay = cat.delay;

    const bubble = el(
      "a",
      {
        class: `bubble ${SIZE_MAP[cat.size] ?? "bubble-md"}`,
        href: `./category.html?c=${encodeURIComponent(cat.id)}`,
        style: Object.entries(style)
          .map(([k, v]) => `${k}:${v}`)
          .join(";"),
      },
      [el("span", { class: "bubble-label", text: t(cat.label, lang) })],
    );

    stage.append(bubble);
  }
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
    renderBubbles(data.categories ?? [], lang);
  }

  const lang = initLangToggle(ui, apply);
  apply(lang);
}

main();
