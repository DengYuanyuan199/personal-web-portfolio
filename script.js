function el(tag, attrs = {}, children = []) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v == null) continue;
    if (k === "class") node.className = String(v);
    else if (k === "text") node.textContent = String(v);
    else if (k === "html") node.innerHTML = String(v);
    else if (k.startsWith("on") && typeof v === "function")
      node.addEventListener(k.slice(2), v);
    else node.setAttribute(k, String(v));
  }
  for (const child of children) node.append(child);
  return node;
}

function safeUrl(href) {
  try {
    const u = new URL(href, window.location.href);
    if (u.protocol === "http:" || u.protocol === "https:" || u.protocol === "mailto:")
      return u.href;
    return "#";
  } catch {
    return "#";
  }
}

function applyTheme(theme) {
  const root = document.documentElement;
  if (theme === "light" || theme === "dark") root.dataset.theme = theme;
  else root.removeAttribute("data-theme");
}

function initThemeToggle() {
  const btn = document.getElementById("themeToggle");
  if (!btn) return;

  const saved = localStorage.getItem("theme");
  applyTheme(saved);

  btn.addEventListener("click", () => {
    const current = document.documentElement.dataset.theme;
    const next = current === "dark" ? "light" : "dark";
    localStorage.setItem("theme", next);
    applyTheme(next);
  });
}

function setText(id, value) {
  const node = document.getElementById(id);
  if (!node) return;
  node.textContent = value ?? "";
}

function setHref(id, href) {
  const node = document.getElementById(id);
  if (!node) return;
  node.setAttribute("href", safeUrl(href ?? "#"));
}

function renderQuickLinks(items) {
  const wrap = document.getElementById("quickLinks");
  if (!wrap) return;
  wrap.innerHTML = "";

  for (const item of items ?? []) {
    const chip = el(
      "a",
      { class: "chip", href: safeUrl(item.href), target: "_blank", rel: "noreferrer" },
      [el("span", { class: "dot", "aria-hidden": "true" }), el("span", { text: item.label })],
    );
    wrap.append(chip);
  }
}

function renderPills(items) {
  const ul = document.getElementById("focusPills");
  if (!ul) return;
  ul.innerHTML = "";
  for (const t of items ?? []) ul.append(el("li", { text: t }));
}

function renderProjects(projects) {
  const grid = document.getElementById("projectsGrid");
  if (!grid) return;
  grid.innerHTML = "";

  for (const p of projects ?? []) {
    const links = (p.links ?? []).slice(0, 3).map((l) =>
      el("a", { class: "link", href: safeUrl(l.href), target: "_blank", rel: "noreferrer" }, [
        el("span", { text: l.label }),
        el("span", { "aria-hidden": "true", text: "↗" }),
      ]),
    );

    const tagRow = el(
      "div",
      { class: "tag-row" },
      (p.tags ?? []).slice(0, 6).map((t) => el("span", { class: "tag", text: t })),
    );

    const card = el("article", { class: "card" }, [
      el("div", { class: "card-inner" }, [
        el("div", { class: "card-title" }, [
          el("h3", { text: p.name ?? "Untitled project" }),
          el("span", { class: "badge", text: p.status ?? "" }),
        ]),
        el("p", { text: p.description ?? "" }),
        tagRow,
      ]),
      el("div", { class: "card-actions" }, links),
    ]);

    grid.append(card);
  }
}

function renderAbout(about) {
  setText("aboutLead", about?.lead ?? "");
  const wrap = document.getElementById("aboutBody");
  if (!wrap) return;
  wrap.innerHTML = "";
  for (const para of about?.paragraphs ?? []) wrap.append(el("p", { text: para }));
}

function renderExperience(items) {
  const list = document.getElementById("experienceTimeline");
  if (!list) return;
  list.innerHTML = "";

  for (const e of items ?? []) {
    const top = el("div", { class: "timeline-top" }, [
      el("div", { class: "timeline-role", text: `${e.role ?? ""} · ${e.company ?? ""}`.trim() }),
      el(
        "div",
        { class: "timeline-meta" },
        [e.period, e.location].filter(Boolean).map((s, i) => el("span", { text: i ? ` · ${s}` : s })),
      ),
    ]);

    const item = el("li", { class: "timeline-item" }, [
      top,
      el("p", { class: "timeline-desc", text: e.description ?? "" }),
    ]);

    list.append(item);
  }
}

function renderContact(contact) {
  setText("contactBlurb", contact?.blurb ?? "");
  const wrap = document.getElementById("contactActions");
  if (!wrap) return;
  wrap.innerHTML = "";

  for (const a of contact?.actions ?? []) {
    wrap.append(
      el("a", { class: "button button-secondary", href: safeUrl(a.href), target: "_blank", rel: "noreferrer" }, [
        el("span", { text: a.label }),
      ]),
    );
  }
}

async function main() {
  initThemeToggle();
  setText("year", String(new Date().getFullYear()));

  let data;
  try {
    const res = await fetch("./content.json", { cache: "no-cache" });
    if (!res.ok) throw new Error(`Failed to load content.json: ${res.status}`);
    data = await res.json();
  } catch {
    return;
  }

  const site = data?.site ?? {};
  document.title = site.title ?? document.title;

  setText("brandName", site.name ?? "Your Name");
  setText("footerName", site.name ?? "Your Name");

  setText("heroEyebrow", site.eyebrow ?? "");
  setText("heroTitle", site.headline ?? "");
  setText("heroSubtitle", site.subtitle ?? "");
  setText("nowText", site.now ?? "");

  setText("primaryCta", site.primaryCta?.label ?? "View projects");
  setHref("primaryCta", site.primaryCta?.href ?? "#projects");
  setText("secondaryCta", site.secondaryCta?.label ?? "Get in touch");
  setHref("secondaryCta", site.secondaryCta?.href ?? "#contact");

  renderQuickLinks(site.quickLinks ?? []);
  renderPills(site.focus ?? []);
  renderProjects(data?.projects ?? []);
  renderAbout(data?.about ?? {});
  renderExperience(data?.experience ?? []);
  renderContact(data?.contact ?? {});
}

main();
