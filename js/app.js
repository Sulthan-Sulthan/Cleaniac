/* ============================================================================
   CLEANIAC — APPLICATION LOGIC
   ----------------------------------------------------------------------------
   Runs on BOTH pages:
     index.html     → header, cart, contact details, footer  (no catalogue)
     products.html  → everything above + catalogue, filters, product dialog

   Every page-specific block is guarded, so a missing section is simply skipped.

   Depends on:  js/config.js   (business details)  →  CLEANIAC_CONFIG
                js/products.js (catalogue)         →  PRODUCTS, CATEGORIES

   Nothing here needs editing to change products, prices or contact details —
   do that in the two files above.
   ========================================================================== */
(function () {
  "use strict";

  /* ==========================================================================
     1. SMALL HELPERS
     ========================================================================== */
  const CFG = typeof CLEANIAC_CONFIG !== "undefined" ? CLEANIAC_CONFIG : {};
  const SET = typeof CLEANIAC_SETTINGS !== "undefined"
    ? CLEANIAC_SETTINGS
    : { autoScroll: true, autoScrollDelay: 4200, toastDuration: 2200 };

  const CART_KEY = "cleaniac_cart_v1";
  const RECENT_KEY = "cleaniac_recent_v1";
  const THEME_KEY = "cleaniac_theme";
  const PRODUCTS_PAGE = "products.html";

  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  function el(tag, className, html) {
    const n = document.createElement(tag);
    if (className) n.className = className;
    if (html != null) n.innerHTML = html;
    return n;
  }

  function esc(str) {
    return String(str == null ? "" : str)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }

  function icon(id, size) {
    return '<svg width="' + (size || 20) + '" height="' + (size || 20) + '" aria-hidden="true"><use href="#' + id + '"/></svg>';
  }

  /* --- money — Indian Rupee, no decimals:  ₹99 · ₹1,299 --------------------- */
  function money(n) {
    if (n == null || isNaN(n)) return null;
    return (CFG.CURRENCY_SYMBOL || "₹") + Number(n).toLocaleString("en-IN", { maximumFractionDigits: 0 });
  }
  const ENQUIRY_TEXT = "Contact for price";

  /* --- product helpers ------------------------------------------------------ */
  const byId = {};
  PRODUCTS.forEach(p => { byId[p.id] = p; });

  const catName = id => (CATEGORIES.find(c => c.id === id) || {}).name || id;
  const catIcon = id => "ic-" + ((CATEGORIES.find(c => c.id === id) || {}).icon || "drop");

  function sizeOf(product, label) {
    return (product.sizes || []).find(s => s.label === label) || null;
  }
  function startingPrice(product) {
    const known = (product.sizes || []).map(s => s.price).filter(p => p != null);
    return known.length ? Math.min.apply(null, known) : null;
  }
  /* a size counts as "bulk" when it is a large commercial pack */
  function isBulkSize(label) {
    return /^(20|30|50)\s*(L|kg)$/i.test(String(label).trim());
  }

  /* --- WhatsApp ------------------------------------------------------------- */
  function waLink(message) {
    const num = String(CFG.WHATSAPP_NUMBER || "").replace(/\D/g, "");
    return "https://wa.me/" + num + "?text=" + encodeURIComponent(message);
  }
  const MSG = CFG.MESSAGES || {};

  /* --- storage (never throws, e.g. private browsing) ------------------------ */
  function readStore(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) { return fallback; }
  }
  function writeStore(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* ignore */ }
  }

  /* ==========================================================================
     2. THEME (light / dark)
     ========================================================================== */
  const themeToggle = $("#themeToggle");

  function currentTheme() {
    const forced = document.documentElement.getAttribute("data-theme");
    if (forced) return forced;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  function syncThemeButton() {
    if (!themeToggle) return;
    const dark = currentTheme() === "dark";
    themeToggle.setAttribute("aria-pressed", String(dark));
    const label = $("#themeToggleLabel");
    if (label) label.textContent = dark ? "Switch to light mode" : "Switch to dark mode";
    const meta = $('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", dark ? "#100A1B" : "#A81B7B");
  }
  if (themeToggle) {
    themeToggle.addEventListener("click", function () {
      const next = currentTheme() === "dark" ? "light" : "dark";
      const root = document.documentElement;
      root.classList.add("theme-switching");
      root.setAttribute("data-theme", next);
      setTimeout(() => root.classList.remove("theme-switching"), 80);
      /* stored as a plain string — that is what the inline <head> script reads */
      try { localStorage.setItem(THEME_KEY, next); } catch (e) {}
      syncThemeButton();
    });
  }
  window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", syncThemeButton);
  syncThemeButton();

  /* ==========================================================================
     3. HEADER + NAVIGATION
     ========================================================================== */
  const header = $("#siteHeader");
  if (header) {
    const onScroll = () => header.classList.toggle("is-scrolled", window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  const menuToggle = $("#menuToggle");
  const mobileNav = $("#mobileNav");
  if (menuToggle && mobileNav) {
    const setMenu = open => {
      mobileNav.classList.toggle("is-open", open);
      menuToggle.setAttribute("aria-expanded", String(open));
      menuToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      menuToggle.innerHTML = icon(open ? "ic-close" : "ic-menu", 22);
    };
    menuToggle.addEventListener("click", () => setMenu(!mobileNav.classList.contains("is-open")));
    mobileNav.addEventListener("click", e => { if (e.target.closest("a")) setMenu(false); });
    document.addEventListener("keydown", e => {
      if (e.key === "Escape" && mobileNav.classList.contains("is-open")) { setMenu(false); menuToggle.focus(); }
    });
  }

  /* ==========================================================================
     4. CONFIG-DRIVEN CONTENT (contact block, footer, social, year)
     ========================================================================== */
  function wireWaLinks() {
    $$("[data-wa]").forEach(a => {
      const kind = a.getAttribute("data-wa");
      a.href = waLink(kind === "bulk" ? (MSG.bulk || "") : (MSG.generic || ""));
    });
  }

  function contactRow(ic, title, value, href, sub) {
    const body = href
      ? '<a href="' + esc(href) + '"' + (/^https?:/.test(href) ? ' target="_blank" rel="noopener"' : "") + ">" + esc(value) + "</a>"
      : "<p>" + esc(value) + "</p>";
    return '<div class="contact-item"><span class="info-ico">' + icon(ic, 20) + "</span><div><h3>" +
      esc(title) + "</h3>" + body + (sub ? '<p class="sub">' + esc(sub) + "</p>" : "") + "</div></div>";
  }

  function renderConfigContent() {
    const sub = $('[data-config="parent"]');
    if (sub && CFG.BRAND_PARENT) sub.textContent = CFG.BRAND_PARENT;

    const list = $("#contactList");
    if (list) {
      const rows = [];
      if (CFG.PHONE_DISPLAY) {
        rows.push(contactRow("ic-phone", "Phone", CFG.PHONE_DISPLAY, "tel:" + (CFG.PHONE_TEL || ""), "Call for orders and pricing"));
      }
      if (CFG.EMAIL) rows.push(contactRow("ic-mail", "Email", CFG.EMAIL, "mailto:" + CFG.EMAIL));
      if (CFG.ADDRESS_LINES && CFG.ADDRESS_LINES.length) {
        rows.push(contactRow("ic-pin", "Address", CFG.ADDRESS_LINES.join(", "), CFG.MAPS_URL || null,
          CFG.MAPS_URL ? "Open in Google Maps" : ""));
      }
      if (CFG.HOURS && CFG.HOURS.length) {
        rows.push(contactRow("ic-clock", "Business hours", CFG.HOURS.map(h => h.days + ": " + h.time).join(" · ")));
      }
      list.innerHTML = rows.join("");
    }

    const fc = $("#footerContact");
    if (fc) {
      const bits = [];
      if (CFG.PHONE_DISPLAY) bits.push('<li><a href="tel:' + esc(CFG.PHONE_TEL || "") + '">' + esc(CFG.PHONE_DISPLAY) + "</a></li>");
      if (CFG.EMAIL) bits.push('<li><a href="mailto:' + esc(CFG.EMAIL) + '">' + esc(CFG.EMAIL) + "</a></li>");
      if (CFG.ADDRESS_LINES) bits.push('<li class="footer-address">' + CFG.ADDRESS_LINES.map(esc).join("<br>") + "</li>");
      fc.innerHTML = bits.join("");
    }

    /* footer category links — always go to the products page, pre-filtered */
    const fcat = $("#footerCategories");
    if (fcat) {
      fcat.innerHTML = CATEGORIES.map(c =>
        '<li><a href="' + PRODUCTS_PAGE + "?cat=" + esc(c.id) + '">' + esc(c.name) + "</a></li>"
      ).join("") + '<li><a href="' + PRODUCTS_PAGE + '?cat=bulk">Commercial &amp; Bulk</a></li>';
    }

    const social = $("#socialRow");
    if (social && CFG.SOCIAL) {
      const map = [["instagram", "ic-instagram", "Instagram"], ["facebook", "ic-facebook", "Facebook"], ["website", "ic-globe", "Website"]];
      social.innerHTML = map.filter(m => CFG.SOCIAL[m[0]]).map(m =>
        '<a class="icon-btn" href="' + esc(CFG.SOCIAL[m[0]]) + '" target="_blank" rel="noopener" aria-label="Cleaniac on ' +
        esc(m[2]) + '">' + icon(m[1], 19) + "</a>"
      ).join("");
    }

    const year = $("#year");
    if (year) year.textContent = new Date().getFullYear();
  }

  /* ==========================================================================
     5. PRODUCT CARD
     ========================================================================== */
  /* Branded fallback, used only if an image file is missing or fails to load */
  function placeholderHTML(product, small) {
    return '<div class="ph">' +
      '<span class="ph-ring">' + icon(catIcon(product.category[0]), small ? 18 : 26) + "</span>" +
      (small ? "" : '<span class="ph-name">' + esc(product.name) + "</span>") +
      "</div>";
  }

  function mediaHTML(product, small) {
    if (!product.image) return placeholderHTML(product, small);
    return '<img src="' + esc(product.image) + '" alt="' + esc(product.name) + '" loading="lazy" decoding="async" ' +
      'width="900" height="675" data-pid="' + esc(product.id) + '">';
  }

  /* "error" does not bubble → listen in the capture phase */
  document.addEventListener("error", function (e) {
    const img = e.target;
    if (!img || img.tagName !== "IMG" || !img.dataset.pid) return;
    const holder = img.closest(".product-media, .modal-media, .cart-thumb");
    const product = byId[img.dataset.pid];
    if (!holder || !product) return;
    const box = el("div");
    box.innerHTML = placeholderHTML(product, holder.classList.contains("cart-thumb"));
    img.replaceWith(box.firstElementChild);
  }, true);

  function productCard(product) {
    const card = el("article", "product-card");
    card.dataset.id = product.id;

    const from = startingPrice(product);
    const sizeCount = (product.sizes || []).length;
    const flavourCount = (product.flavours || []).length;

    /* pills sit inside the card body — never on top of the photograph */
    const pills = [];
    if (flavourCount) {
      pills.push('<span class="pill-tag">' + flavourCount + " " +
        (product.flavourLabel === "Variant" ? "variants" : "fragrances") + "</span>");
    }
    pills.push('<span class="pill-tag">' + sizeCount + " pack " + (sizeCount > 1 ? "sizes" : "size") + "</span>");
    if (product.bulkAvailable) pills.push('<span class="pill-tag pill-tag--bulk">Bulk available</span>');

    card.innerHTML =
      '<button class="product-media" type="button" data-open aria-label="View details for ' + esc(product.name) + '">' +
        mediaHTML(product) +
      "</button>" +
      '<div class="product-body">' +
        '<h3 class="product-name"><button type="button" data-open>' + esc(product.name) + "</button></h3>" +
        '<p class="product-short">' + esc(product.short) + "</p>" +
        '<p class="product-pills">' + pills.join("") + "</p>" +
        '<p class="product-price">' +
          (from != null
            ? '<span class="from">' + (sizeCount > 1 ? "From" : "Price") + "</span>" + money(from)
            : '<span class="enquiry">' + ENQUIRY_TEXT + "</span>") +
        "</p>" +
      "</div>" +
      '<div class="product-actions">' +
        '<button class="btn btn--soft btn--sm" type="button" data-open>View Details</button>' +
        '<button class="btn btn--primary btn--sm" type="button" data-quick aria-label="Add ' + esc(product.name) + ' to cart">Add to Cart</button>' +
      "</div>";

    card.addEventListener("click", function (e) {
      if (card.dataset.dragged === "1") return;
      if (e.target.closest("[data-open]")) { openProduct(product.id, e.target.closest("[data-open]")); return; }
      if (e.target.closest("[data-quick]")) quickAdd(product);
    });

    return card;
  }

  /* "Add to Cart" on a card always adds — it never opens the dialog.
     Products with options are added with their first fragrance / smallest pack,
     and the toast says exactly which one, so it can be changed in the cart.   */
  function quickAdd(product) {
    const flavour = (product.flavours && product.flavours.length) ? product.flavours[0] : null;
    const size = product.sizes[0].label;
    addToCart(product, flavour, size, 1);
    toast("Added — " + [product.name, flavour, size].filter(Boolean).join(", "));
  }

  /* ==========================================================================
     6. CATALOGUE  (products.html only)
     ========================================================================== */
  const catalogue = $("#catalogue");
  const resultLine = $("#resultLine");
  const searchInput = $("#searchInput");
  const searchClear = $("#searchClear");
  const filterRow = $("#filterRow");

  let activeFilter = "all";
  let activeQuery = "";

  const FILTERS = [{ id: "all", name: "All Products", icon: "ic-sparkle" }]
    .concat(CATEGORIES.map(c => ({ id: c.id, name: c.name, icon: "ic-" + c.icon })))
    .concat([{ id: "bulk", name: "Commercial & Bulk", icon: "ic-bulk" }]);

  /* category rail on the home page → links straight to the products page */
  function renderCategoryRail() {
    const rail = $("#catRail");
    if (!rail) return;
    const base = rail.getAttribute("data-links");
    const chip = (id, name, ico) => base
      ? '<a class="cat-card" role="listitem" href="' + base + "?cat=" + esc(id) + '"><span class="cat-ico">' + icon(ico, 18) + "</span>" + esc(name) + "</a>"
      : '<button class="cat-card" type="button" role="listitem" data-cat="' + esc(id) + '"><span class="cat-ico">' + icon(ico, 18) + "</span>" + esc(name) + "</button>";

    rail.innerHTML = CATEGORIES.map(c => chip(c.id, c.name, "ic-" + c.icon)).join("") +
      chip("bulk", "Commercial & Bulk", "ic-bulk");

    if (!base) {
      rail.addEventListener("click", e => {
        const b = e.target.closest("[data-cat]");
        if (b) setFilter(b.getAttribute("data-cat"), true);
      });
    }
  }

  function renderFilters() {
    if (!filterRow) return;
    filterRow.innerHTML = FILTERS.map(f =>
      '<button class="chip" type="button" data-filter="' + esc(f.id) + '" aria-pressed="' + (f.id === activeFilter) + '">' +
      icon(f.icon, 16) + esc(f.name) + "</button>"
    ).join("");
  }
  if (filterRow) {
    filterRow.addEventListener("click", e => {
      const b = e.target.closest("[data-filter]");
      if (b) setFilter(b.getAttribute("data-filter"), false);
    });
  }

  function setFilter(id, scroll) {
    activeFilter = id;
    if (filterRow) {
      $$("[data-filter]", filterRow).forEach(b =>
        b.setAttribute("aria-pressed", String(b.getAttribute("data-filter") === id)));
      const active = $('[data-filter="' + id + '"]', filterRow);
      if (active && active.scrollIntoView) active.scrollIntoView({ block: "nearest", inline: "center" });
    }
    renderCatalogue();
    if (scroll) {
      const target = $("#products");
      if (target) target.scrollIntoView({ behavior: reduceMotion.matches ? "auto" : "smooth", block: "start" });
    }
  }

  function matchesQuery(p, q) {
    if (!q) return true;
    const haystack = [
      p.name, p.short, p.description,
      (p.flavours || []).join(" "),
      (p.sizes || []).map(s => s.label).join(" "),
      p.category.map(catName).join(" "),
      p.bulkAvailable ? "bulk commercial wholesale large pack" : ""
    ].join(" ").toLowerCase();
    return q.toLowerCase().split(/\s+/).filter(Boolean).every(word => haystack.indexOf(word) !== -1);
  }

  function filteredProducts() {
    return PRODUCTS.filter(p => {
      if (activeFilter === "bulk" && !p.bulkAvailable) return false;
      if (activeFilter !== "all" && activeFilter !== "bulk" && p.category.indexOf(activeFilter) === -1) return false;
      return matchesQuery(p, activeQuery);
    });
  }

  function renderCatalogue() {
    if (!catalogue) return;
    stopAllAutoScroll();
    const list = filteredProducts();
    catalogue.innerHTML = "";

    if (!list.length) {
      catalogue.appendChild(emptyResult());
      if (resultLine) resultLine.textContent = "No products found.";
      return;
    }

    const browsing = activeFilter === "all" && !activeQuery;
    if (resultLine) {
      resultLine.textContent = browsing
        ? "Showing all " + list.length + " Cleaniac products"
        : list.length + (list.length === 1 ? " product" : " products") +
          (activeQuery ? " matching “" + activeQuery + "”" : "") +
          (activeFilter !== "all" ? " in " + (activeFilter === "bulk" ? "Commercial & Bulk" : catName(activeFilter)) : "");
    }

    if (browsing) {
      CATEGORIES.forEach(cat => {
        const items = list.filter(p => p.category.indexOf(cat.id) !== -1);
        if (items.length) catalogue.appendChild(carouselRow(cat.name, items));
      });
      const bulkItems = list.filter(p => p.bulkAvailable);
      if (bulkItems.length) catalogue.appendChild(carouselRow("Commercial & Bulk Packs", bulkItems));
    } else {
      const grid = el("div", "product-grid");
      list.forEach(p => grid.appendChild(productCard(p)));
      catalogue.appendChild(grid);
    }

    initCarousels(catalogue);
  }

  function carouselRow(title, items) {
    const block = el("section", "row-block");
    const head = el("div", "row-head");
    head.innerHTML = "<h2>" + esc(title) + '</h2><span class="row-count">' + items.length +
      (items.length === 1 ? " product" : " products") + "</span>" +
      '<div class="row-nav">' +
        '<button class="icon-btn" type="button" data-prev aria-label="Scroll ' + esc(title) + ' left">' + icon("ic-left", 19) + "</button>" +
        '<button class="icon-btn" type="button" data-next aria-label="Scroll ' + esc(title) + ' right">' + icon("ic-right", 19) + "</button>" +
      "</div>";
    const track = el("div", "carousel");
    track.setAttribute("data-carousel", "");
    track.setAttribute("role", "region");
    track.setAttribute("aria-label", title + " products");
    track.tabIndex = 0;
    items.forEach(p => track.appendChild(productCard(p)));
    block.appendChild(head);
    block.appendChild(track);
    return block;
  }

  function emptyResult() {
    const box = el("div", "empty-state");
    box.innerHTML = '<span class="ph-ring">' + icon("ic-search", 30) + "</span>" +
      "<h3>No products match that search</h3>" +
      "<p>Try a different word such as “floor”, “lemon”, “mop” or “bulk”.</p>";
    const btn = el("button", "btn btn--primary btn--sm", "Show all products");
    btn.type = "button";
    btn.addEventListener("click", () => {
      if (searchInput) searchInput.value = "";
      activeQuery = "";
      if (searchClear) searchClear.classList.remove("is-visible");
      setFilter("all", false);
    });
    box.appendChild(btn);
    return box;
  }

  if (searchInput) {
    let searchTimer = null;
    searchInput.addEventListener("input", function () {
      const val = this.value.trim();
      if (searchClear) searchClear.classList.toggle("is-visible", val.length > 0);
      clearTimeout(searchTimer);
      searchTimer = setTimeout(() => { activeQuery = val; renderCatalogue(); }, 140);
    });
  }
  if (searchClear) {
    searchClear.addEventListener("click", () => {
      searchInput.value = ""; activeQuery = "";
      searchClear.classList.remove("is-visible");
      renderCatalogue();
      searchInput.focus();
    });
  }

  /* ==========================================================================
     7. CAROUSELS — swipe, drag, arrows, gentle auto-movement
     ========================================================================== */
  const carousels = [];

  function stopAllAutoScroll() {
    carousels.forEach(c => { clearInterval(c.timer); clearTimeout(c.resumeTimer); });
    carousels.length = 0;
  }
  function pruneCarousels() {
    for (let i = carousels.length - 1; i >= 0; i--) {
      if (!carousels[i].track.isConnected) {
        clearInterval(carousels[i].timer);
        clearTimeout(carousels[i].resumeTimer);
        carousels.splice(i, 1);
      }
    }
  }

  document.addEventListener("visibilitychange", () => {
    carousels.forEach(c => (document.hidden ? clearInterval(c.timer) : startAuto(c)));
  });

  function initCarousels(scope) {
    pruneCarousels();
    $$("[data-carousel]", scope).forEach(track => {
      if (carousels.some(c => c.track === track)) return;      /* already wired */
      const block = track.closest(".row-block");
      const prev = block ? $("[data-prev]", block) : null;
      const next = block ? $("[data-next]", block) : null;
      const state = { track: track, timer: null, paused: false };
      carousels.push(state);

      const step = () => Math.max(track.clientWidth * 0.8, 200);
      const scrollBy = dir => track.scrollBy({ left: dir * step(), behavior: reduceMotion.matches ? "auto" : "smooth" });

      if (prev) prev.addEventListener("click", () => { pause(state, 9000); scrollBy(-1); });
      if (next) next.addEventListener("click", () => { pause(state, 9000); scrollBy(1); });

      function syncNav() {
        if (!prev || !next) return;
        const max = track.scrollWidth - track.clientWidth - 2;
        prev.disabled = track.scrollLeft <= 2;
        next.disabled = track.scrollLeft >= max;
      }
      track.addEventListener("scroll", syncNav, { passive: true });
      window.addEventListener("resize", syncNav);
      setTimeout(syncNav, 60);

      track.addEventListener("keydown", e => {
        if (e.key === "ArrowRight") { e.preventDefault(); pause(state, 9000); scrollBy(1); }
        if (e.key === "ArrowLeft") { e.preventDefault(); pause(state, 9000); scrollBy(-1); }
      });

      /* pointer drag on desktop — touch devices scroll natively */
      let down = false, startX = 0, startLeft = 0, moved = false;
      track.addEventListener("pointerdown", e => {
        if (e.pointerType === "touch") { pause(state, 9000); return; }
        down = true; moved = false;
        startX = e.clientX; startLeft = track.scrollLeft;
        pause(state, 9000);
      });
      track.addEventListener("pointermove", e => {
        if (!down) return;
        const dx = e.clientX - startX;
        if (!moved && Math.abs(dx) > 6) {
          moved = true;
          track.classList.add("is-dragging");
          $$(".product-card", track).forEach(c => (c.dataset.dragged = "1"));
          try { track.setPointerCapture(e.pointerId); } catch (err) {}
        }
        if (moved) track.scrollLeft = startLeft - dx;
      });
      const endDrag = () => {
        if (!down) return;
        down = false;
        track.classList.remove("is-dragging");
        setTimeout(() => $$(".product-card", track).forEach(c => (c.dataset.dragged = "0")), 0);
      };
      track.addEventListener("pointerup", endDrag);
      track.addEventListener("pointercancel", endDrag);
      track.addEventListener("pointerleave", endDrag);

      ["mouseenter", "focusin", "touchstart"].forEach(ev =>
        track.addEventListener(ev, () => pause(state, 9000), { passive: true }));
      track.addEventListener("mouseleave", () => resume(state));

      startAuto(state);
    });
  }

  function startAuto(state) {
    if (!SET.autoScroll || reduceMotion.matches) return;
    clearInterval(state.timer);
    state.timer = setInterval(() => {
      const t = state.track;
      if (state.paused || document.hidden || !t.isConnected) return;
      if (t.scrollWidth <= t.clientWidth + 8) return;          /* nothing to scroll */
      const max = t.scrollWidth - t.clientWidth - 4;
      const card = t.firstElementChild;
      const stepPx = card ? card.getBoundingClientRect().width + 14 : 240;
      const target = t.scrollLeft >= max ? 0 : t.scrollLeft + stepPx;
      t.scrollTo({ left: target, behavior: "smooth" });
    }, SET.autoScrollDelay);
  }
  function pause(state, ms) {
    state.paused = true;
    clearTimeout(state.resumeTimer);
    state.resumeTimer = setTimeout(() => { state.paused = false; }, ms || 8000);
  }
  function resume(state) {
    clearTimeout(state.resumeTimer);
    state.resumeTimer = setTimeout(() => { state.paused = false; }, 1200);
  }

  /* ==========================================================================
     8. PRODUCT DIALOG  (products.html only)
     ========================================================================== */
  const dlg = $("#productDialog");
  const modalTitle = $("#modalTitle");
  const modalDesc = $("#modalDesc");
  const modalMedia = $("#modalMedia");
  const modalOptions = $("#modalOptions");
  const modalPrice = $("#modalPrice");
  const modalCategory = $("#modalCategory");
  const modalQtyInput = $("#modalQtyInput");

  let current = null;          /* { product, flavour, size, qty } */
  let lastOpener = null;

  function openProduct(id, opener) {
    const p = byId[id];
    if (!p) return;
    if (!dlg) {                                     /* home page → go to the catalogue */
      location.href = PRODUCTS_PAGE + "#" + id;
      return;
    }
    lastOpener = opener || document.activeElement;

    current = {
      product: p,
      flavour: (p.flavours && p.flavours.length) ? p.flavours[0] : null,
      size: p.sizes[0].label,
      qty: 1
    };

    modalCategory.textContent = p.category.map(catName).join(" · ");
    modalTitle.textContent = p.name;
    modalDesc.textContent = p.description;
    modalMedia.innerHTML = mediaHTML(p);
    modalQtyInput.value = 1;

    let html = "";
    if (p.flavours && p.flavours.length) {
      html += '<div class="opt-group"><h3 id="flavourLabel">' + esc(p.flavourLabel === "Variant" ? "Variant" : "Fragrance") +
        '</h3><div class="opt-chips" role="group" aria-labelledby="flavourLabel">' +
        p.flavours.map((f, i) =>
          '<button class="chip" type="button" data-flavour="' + esc(f) + '" aria-pressed="' + (i === 0) + '">' + esc(f) + "</button>"
        ).join("") + "</div></div>";
    }
    html += '<div class="opt-group"><h3 id="sizeLabel">Pack size</h3><div class="opt-chips" role="group" aria-labelledby="sizeLabel">' +
      p.sizes.map((s, i) =>
        '<button class="chip" type="button" data-size="' + esc(s.label) + '" aria-pressed="' + (i === 0) + '">' +
        esc(s.label) + '<span class="chip-price">' + (s.price != null ? money(s.price) : "Enquiry") + "</span>" +
        "</button>"
      ).join("") + "</div></div>";
    modalOptions.innerHTML = html;

    syncModalPrice();
    pushRecent(p.id);

    if (!dlg.open) dlg.showModal();
    document.body.classList.add("no-scroll");
    if (location.hash.slice(1) !== p.id) history.replaceState(null, "", "#" + p.id);
  }

  function syncModalPrice() {
    const size = sizeOf(current.product, current.size);
    const price = size ? size.price : null;
    modalPrice.innerHTML = price != null
      ? '<span class="price-now">' + money(price) + "</span>"
      : '<span class="price-enq">' + ENQUIRY_TEXT + "</span>";
  }

  if (dlg) {
    modalOptions.addEventListener("click", e => {
      const f = e.target.closest("[data-flavour]");
      const s = e.target.closest("[data-size]");
      if (f) {
        current.flavour = f.getAttribute("data-flavour");
        $$("[data-flavour]", modalOptions).forEach(b => b.setAttribute("aria-pressed", String(b === f)));
      }
      if (s) {
        current.size = s.getAttribute("data-size");
        $$("[data-size]", modalOptions).forEach(b => b.setAttribute("aria-pressed", String(b === s)));
      }
      if (f || s) syncModalPrice();
    });

    $("#modalQty").addEventListener("click", e => {
      const b = e.target.closest("[data-step]");
      if (!b) return;
      const next = Math.min(999, Math.max(1, Number(modalQtyInput.value || 1) + Number(b.getAttribute("data-step"))));
      modalQtyInput.value = next;
      current.qty = next;
    });
    modalQtyInput.addEventListener("change", function () {
      const n = Math.min(999, Math.max(1, Math.round(Number(this.value) || 1)));
      this.value = n; current.qty = n;
    });

    $("#modalAdd").addEventListener("click", () => {
      addToCart(current.product, current.flavour, current.size, current.qty);
      const label = [current.flavour, current.size].filter(Boolean).join(", ");
      closeProduct();
      toast("Added — " + current.product.name + (label ? " (" + label + ")" : ""));
    });

    /* share — Web Share API with a copy-link fallback */
    $("#modalShare").addEventListener("click", async function () {
      const p = current.product;
      const url = location.origin + location.pathname + "#" + p.id;
      try {
        if (navigator.share) { await navigator.share({ title: "Cleaniac — " + p.name, text: p.short, url: url }); return; }
        await navigator.clipboard.writeText(url);
        toast("Link copied");
      } catch (err) {
        if (err && err.name === "AbortError") return;
        window.prompt("Copy this product link:", url);
      }
    });

    $("#modalClose").addEventListener("click", closeProduct);
    const footClose = $("#modalCloseFoot");
    if (footClose) footClose.addEventListener("click", closeProduct);
    dlg.addEventListener("click", e => { if (e.target === dlg) closeProduct(); });   /* backdrop */
    dlg.addEventListener("close", afterProductClose);
    dlg.addEventListener("cancel", () => setTimeout(afterProductClose, 0));          /* Escape */
    window.addEventListener("hashchange", openFromHash);
  }

  /* runs whichever way the dialog was dismissed */
  function afterProductClose() {
    if (!dlg || dlg.open) return;
    document.body.classList.remove("no-scroll");
    if (current && location.hash.slice(1) === current.product.id) {
      history.replaceState(null, "", location.pathname + location.search);
    }
    if (lastOpener && document.contains(lastOpener)) lastOpener.focus();
    renderRecent();
  }
  function closeProduct() {
    if (dlg && dlg.open) dlg.close();
    afterProductClose();
  }

  /* deep links:  products.html#floor-cleaner  opens that product.
     Any other hash change (e.g. clicking "Products" in the nav while the
     dialog is open — a same-document navigation, so the page never reloads)
     must close it instead of leaving it hanging over the page.              */
  function openFromHash() {
    const id = decodeURIComponent(location.hash.slice(1));
    if (id && byId[id]) openProduct(id, null);
    else closeProduct();
  }

  /* returning to the page via Back/Forward can restore it with the dialog
     still open — start clean every time the page is shown */
  window.addEventListener("pageshow", e => { if (e.persisted) closeProduct(); });

  /* same-page links in the header, footer and bottom bar close the dialog */
  document.addEventListener("click", e => {
    if (!dlg || !dlg.open) return;
    const link = e.target.closest("a[href]");
    if (link && !link.closest(".modal") && !byId[(link.hash || "").slice(1)]) closeProduct();
  });

  /* ==========================================================================
     9. RECENTLY VIEWED
     ========================================================================== */
  function pushRecent(id) {
    let list = readStore(RECENT_KEY, []);
    if (!Array.isArray(list)) list = [];
    list = [id].concat(list.filter(x => x !== id)).slice(0, 8);
    writeStore(RECENT_KEY, list);
  }

  function renderRecent() {
    const section = $("#recentSection");
    const row = $("#recentRow");
    if (!section || !row) return;
    const ids = (readStore(RECENT_KEY, []) || []).filter(id => byId[id]);
    if (!ids.length) { section.hidden = true; return; }
    section.hidden = false;
    /* swap in a clean track so old listeners never stack up */
    const fresh = row.cloneNode(false);
    ids.forEach(id => fresh.appendChild(productCard(byId[id])));
    row.replaceWith(fresh);
    initCarousels(section);
  }

  /* ==========================================================================
     10. CART  (present on every page)
     ========================================================================== */
  const cartDialog = $("#cartDialog");
  const cartBody = $("#cartBody");
  const cartFoot = $("#cartFoot");

  /* unique line per product + fragrance + size */
  const cartKey = (id, flavour, size) => id + "|" + (flavour || "") + "|" + size;

  function loadCart() {
    const raw = readStore(CART_KEY, []);
    if (!Array.isArray(raw)) return [];
    return raw.filter(i => i && byId[i.id] && sizeOf(byId[i.id], i.size))
      .map(i => ({
        id: i.id,
        flavour: i.flavour || null,
        size: i.size,
        qty: Math.min(999, Math.max(1, Math.round(Number(i.qty) || 1)))
      }));
  }
  let cart = loadCart();
  const saveCart = () => writeStore(CART_KEY, cart);

  function addToCart(product, flavour, size, qty) {
    const key = cartKey(product.id, flavour, size);
    const found = cart.find(i => cartKey(i.id, i.flavour, i.size) === key);
    if (found) found.qty = Math.min(999, found.qty + qty);
    else cart.push({ id: product.id, flavour: flavour || null, size: size, qty: qty });
    saveCart();
    syncCartBadge(true);
    if (cartDialog && cartDialog.open) renderCart();
  }

  function updateQty(key, delta) {
    const i = cart.find(x => cartKey(x.id, x.flavour, x.size) === key);
    if (!i) return;
    i.qty += delta;
    if (i.qty < 1) cart = cart.filter(x => x !== i);
    saveCart(); syncCartBadge(false); renderCart();
  }
  function removeItem(key) {
    cart = cart.filter(x => cartKey(x.id, x.flavour, x.size) !== key);
    saveCart(); syncCartBadge(false); renderCart();
  }

  function cartTotals() {
    let subtotal = 0, quoteItems = 0, units = 0, needsBulk = false;
    cart.forEach(i => {
      const p = byId[i.id];
      const s = sizeOf(p, i.size);
      units += i.qty;
      if (s && s.price != null) subtotal += s.price * i.qty;
      else quoteItems++;
      if (!s || s.price == null || isBulkSize(i.size)) needsBulk = true;
    });
    return { subtotal: subtotal, quoteItems: quoteItems, units: units, needsBulk: needsBulk };
  }

  function syncCartBadge(bump) {
    const units = cart.reduce((n, i) => n + i.qty, 0);
    $$("[data-cart-count]").forEach(b => {
      b.textContent = units > 99 ? "99+" : String(units);
      b.classList.toggle("is-visible", units > 0);
      if (bump && units > 0) {
        b.classList.remove("bump");
        void b.offsetWidth;
        b.classList.add("bump");
      }
    });
    const btn = $("#cartOpen");
    if (btn) btn.setAttribute("aria-label", units ? "Open cart — " + units + " item" + (units === 1 ? "" : "s") : "Open cart");
  }

  function renderCart() {
    if (!cartBody || !cartFoot) return;

    if (!cart.length) {
      cartBody.innerHTML =
        '<div class="empty-state">' +
          '<span class="ph-ring">' + icon("ic-cart", 32) + "</span>" +
          "<h3>Your cart is ready for a fresh start.</h3>" +
          "<p>Browse Cleaniac products and add what you need.</p>" +
        "</div>";
      const b = el("a", "btn btn--primary btn--block", "Explore Products");
      b.href = PRODUCTS_PAGE;
      $(".empty-state", cartBody).appendChild(b);
      cartFoot.innerHTML = "";
      return;
    }

    cartBody.innerHTML = cart.map(i => {
      const p = byId[i.id];
      const s = sizeOf(p, i.size);
      const key = cartKey(i.id, i.flavour, i.size);
      const lineTotal = s && s.price != null ? money(s.price * i.qty) : null;
      const variant = [i.flavour, i.size].filter(Boolean).join(" • ");
      return '<div class="cart-item">' +
        '<div class="cart-thumb">' + mediaHTML(p, true) + "</div>" +
        '<div class="cart-info">' +
          "<h3>" + esc(p.name) + "</h3>" +
          '<p class="cart-variant">' + esc(variant) + "</p>" +
          '<div class="cart-line">' +
            '<span class="qty">' +
              '<button type="button" data-key="' + esc(key) + '" data-delta="-1" aria-label="Decrease quantity of ' + esc(p.name) + '">' + icon("ic-minus", 14) + "</button>" +
              '<input type="text" value="' + i.qty + '" readonly aria-label="Quantity of ' + esc(p.name) + '">' +
              '<button type="button" data-key="' + esc(key) + '" data-delta="1" aria-label="Increase quantity of ' + esc(p.name) + '">' + icon("ic-plus", 14) + "</button>" +
            "</span>" +
            '<span class="cart-price">' + (lineTotal || '<span class="enquiry">Price on enquiry</span>') + "</span>" +
          "</div>" +
          '<button class="cart-remove" type="button" data-remove="' + esc(key) + '">Remove</button>' +
        "</div>" +
      "</div>";
    }).join("");

    const t = cartTotals();
    cartFoot.innerHTML =
      '<div class="cart-summary">' +
        '<div class="row"><span>Known-price subtotal</span><span class="total">' +
          (t.subtotal > 0 ? money(t.subtotal) : "On enquiry") + "</span></div>" +
        '<div class="row muted"><span>' + t.units + " item" + (t.units === 1 ? "" : "s") + " in cart</span></div>" +
      "</div>" +
      (t.quoteItems
        ? '<p class="cart-note">' + t.quoteItems + " item" + (t.quoteItems === 1 ? " requires" : "s require") +
          " a price quotation. Cleaniac will confirm pricing on WhatsApp.</p>"
        : "") +
      '<button class="btn btn--wa btn--block" type="button" id="cartCheckout">' + icon("ic-wa", 19) +
        (t.needsBulk ? "Request Order &amp; Bulk Quote" : "Send Order on WhatsApp") + "</button>" +
      '<button class="btn btn--ghost btn--block" type="button" id="cartContinue">Continue Shopping</button>' +
      '<div id="cartClearZone" style="display:grid;justify-items:center"></div>';

    $("#cartCheckout").addEventListener("click", () => {
      window.open(waLink(cartMessage()), "_blank", "noopener");
    });
    $("#cartContinue").addEventListener("click", closeCart);
    renderClearZone(false);
  }

  /* "Clear cart" asks for confirmation inside the drawer — no browser popup */
  function renderClearZone(asking) {
    const zone = $("#cartClearZone");
    if (!zone) return;

    if (!asking) {
      zone.innerHTML = '<button class="btn btn--link" type="button">Clear cart</button>';
      zone.firstElementChild.addEventListener("click", () => renderClearZone(true));
      return;
    }

    zone.innerHTML =
      '<div class="cart-note" style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;justify-content:center;width:100%">' +
        "<span>Remove all items from your cart?</span>" +
        '<span style="display:flex;gap:8px;margin-left:auto">' +
          '<button class="btn btn--sm btn--ghost" type="button" data-clear-cancel>Cancel</button>' +
          '<button class="btn btn--sm btn--soft" type="button" data-clear-yes>Yes, clear</button>' +
        "</span>" +
      "</div>";
    $("[data-clear-cancel]", zone).addEventListener("click", () => renderClearZone(false));
    $("[data-clear-yes]", zone).addEventListener("click", () => {
      cart = []; saveCart(); syncCartBadge(false); renderCart();
      toast("Cart cleared");
    });
    $("[data-clear-yes]", zone).focus();
  }

  if (cartBody) {
    cartBody.addEventListener("click", e => {
      const q = e.target.closest("[data-delta]");
      const r = e.target.closest("[data-remove]");
      if (q) updateQty(q.getAttribute("data-key"), Number(q.getAttribute("data-delta")));
      if (r) removeItem(r.getAttribute("data-remove"));
    });
  }

  function openCart() {
    if (!cartDialog) return;
    renderCart();
    cartDialog.showModal();
    document.body.classList.add("no-scroll");
  }
  function closeCart() {
    if (cartDialog && cartDialog.open) cartDialog.close();
    document.body.classList.remove("no-scroll");
  }
  const cartOpenBtn = $("#cartOpen");
  const cartOpenMobileBtn = $("#cartOpenMobile");
  if (cartOpenBtn) cartOpenBtn.addEventListener("click", openCart);
  if (cartOpenMobileBtn) cartOpenMobileBtn.addEventListener("click", openCart);
  if (cartDialog) {
    $("#cartClose").addEventListener("click", closeCart);
    cartDialog.addEventListener("click", e => { if (e.target === cartDialog) closeCart(); });
    cartDialog.addEventListener("close", () => document.body.classList.remove("no-scroll"));
    cartDialog.addEventListener("cancel", () => setTimeout(() => document.body.classList.remove("no-scroll"), 0));
  }

  /* ==========================================================================
     11. WHATSAPP ORDER MESSAGE (built from the cart)
     ========================================================================== */
  function cartMessage() {
    const t = cartTotals();
    const lines = [MSG.orderIntro || "Hello Cleaniac,\nI would like to place an order:", ""];
    cart.forEach((i, idx) => {
      const p = byId[i.id];
      const s = sizeOf(p, i.size);
      lines.push((idx + 1) + ". " + p.name);
      if (i.flavour) lines.push("   " + (p.flavourLabel === "Variant" ? "Variant" : "Fragrance") + ": " + i.flavour);
      lines.push("   Size: " + i.size);
      lines.push("   Qty: " + i.qty);
      lines.push("   Price: " + (s && s.price != null ? money(s.price) + " each" : "Please quote"));
      lines.push("");
    });
    if (t.subtotal > 0) lines.push("Known-price subtotal: " + money(t.subtotal));
    if (t.quoteItems) {
      lines.push(t.quoteItems === 1 ? "1 item requires a quotation." : t.quoteItems + " items require a quotation.");
    }
    if (t.needsBulk) lines.push("This order includes large / bulk pack sizes.");
    lines.push("");
    lines.push(MSG.closing || "Please confirm availability, final pricing and delivery details.\nThank you.");
    return lines.join("\n");
  }

  /* ==========================================================================
     12. TOASTS
     ========================================================================== */
  const toastRegion = $("#toastRegion");
  function toast(message) {
    if (!toastRegion) return;
    const t = el("div", "toast", icon("ic-check", 18) + "<span>" + esc(message) + "</span>");
    toastRegion.appendChild(t);
    setTimeout(() => {
      t.classList.add("is-leaving");
      setTimeout(() => t.remove(), 300);
    }, SET.toastDuration || 2200);
  }

  /* ==========================================================================
     13. ENQUIRY FORM (no backend — WhatsApp or the visitor's email app)
     ========================================================================== */
  const form = $("#enquiryForm");
  if (form) {
    const enquiryText = () => {
      const name = $("#enqName").value.trim();
      const type = $("#enqType").value;
      const msg = $("#enqMsg").value.trim();
      return "Hello Cleaniac,\n\n" +
        (name ? "Name: " + name + "\n" : "") +
        "Enquiry type: " + type + "\n\n" +
        (msg || "I would like to know more about your products.") +
        "\n\nThank you.";
    };
    form.addEventListener("submit", e => {
      e.preventDefault();
      if (!$("#enqMsg").value.trim()) { $("#enqMsg").focus(); toast("Please add a message"); return; }
      window.open(waLink(enquiryText()), "_blank", "noopener");
    });
    const emailBtn = $("#enqEmail");
    if (emailBtn) {
      emailBtn.addEventListener("click", () => {
        const subject = "Website enquiry — " + $("#enqType").value;
        location.href = "mailto:" + (CFG.EMAIL || "") + "?subject=" + encodeURIComponent(subject) +
          "&body=" + encodeURIComponent(enquiryText());
      });
    }
  }

  /* ==========================================================================
     14. STRUCTURED DATA (only information supplied in the config)
     ========================================================================== */
  function renderStructuredData() {
    const holder = $("#ldOrg");
    if (!holder) return;
    const base = location.origin + location.pathname.replace(/[^/]*$/, "");

    const org = {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: CFG.BRAND_NAME || "Cleaniac",
      url: (CFG.SOCIAL && CFG.SOCIAL.website) || base,
      logo: base + "assets/logo/icon-512.png",
      slogan: CFG.TAGLINE || "",
      email: CFG.EMAIL || undefined,
      telephone: CFG.PHONE_TEL || undefined,
      address: CFG.ADDRESS_LINES && CFG.ADDRESS_LINES.length ? {
        "@type": "PostalAddress",
        streetAddress: CFG.ADDRESS_LINES.slice(0, -1).join(", ") || CFG.ADDRESS_LINES[0],
        addressLocality: CFG.ADDRESS_LINES[CFG.ADDRESS_LINES.length - 1],
        addressCountry: "IN"
      } : undefined,
      sameAs: CFG.SOCIAL ? Object.keys(CFG.SOCIAL).map(k => CFG.SOCIAL[k]).filter(Boolean) : []
    };

    const items = {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: "Cleaniac products",
      itemListElement: PRODUCTS.map((p, i) => {
        const known = (p.sizes || []).map(s => s.price).filter(v => v != null);
        const product = {
          "@type": "Product",
          name: p.name,
          description: p.description,
          category: p.category.map(catName).join(", "),
          brand: { "@type": "Brand", name: "Cleaniac" },
          url: base + PRODUCTS_PAGE + "#" + p.id
        };
        if (p.image) product.image = base + p.image;
        if (known.length) {
          product.offers = {
            "@type": "AggregateOffer",
            priceCurrency: "INR",
            lowPrice: Math.min.apply(null, known),
            highPrice: Math.max.apply(null, known),
            offerCount: known.length
          };
        }
        return { "@type": "ListItem", position: i + 1, item: product };
      })
    };

    holder.textContent = JSON.stringify([org, items]);
  }

  /* ==========================================================================
     15. BOOT
     ========================================================================== */
  wireWaLinks();
  renderConfigContent();
  renderCategoryRail();

  /* products.html?cat=laundry opens the page with that filter applied */
  if (catalogue) {
    const wanted = new URLSearchParams(location.search).get("cat");
    if (wanted && FILTERS.some(f => f.id === wanted)) activeFilter = wanted;
    renderFilters();
    renderCatalogue();
    renderRecent();
    openFromHash();
  }

  syncCartBadge(false);
  renderStructuredData();

  /* keep multiple tabs in sync */
  window.addEventListener("storage", e => {
    if (e.key === CART_KEY) {
      cart = loadCart();
      syncCartBadge(false);
      if (cartDialog && cartDialog.open) renderCart();
    }
  });
})();
