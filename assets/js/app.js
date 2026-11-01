/* ==========================================================================
   HOUSE OF GINA — Core storefront app
   State, storage, overlays, routing, header/search, hero, misc UI.
   ========================================================================== */
(function () {
  "use strict";

  const HOG = (window.HOG = window.HOG || {});
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  HOG.$ = $;
  HOG.$$ = $$;

  const KEYS = {
    cart: "hog_cart_v1",
    wish: "hog_wish_v1",
    user: "hog_user_v1",
    cms: "hog_cms_v1",
    admin: "hog_admin_session_v1"
  };
  HOG.keys = KEYS;

  HOG.storage = {
    get(key, fallback) {
      try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : fallback;
      } catch (err) {
        return fallback;
      }
    },
    set(key, value) {
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch (err) {
        /* storage can be unavailable in private mode */
      }
    },
    remove(key) {
      try {
        localStorage.removeItem(key);
      } catch (err) {
        /* noop */
      }
    }
  };

  HOG.money = (value, cents = false) => {
    const n = Number(value) || 0;
    return (
      "$" +
      n.toLocaleString("en-US", {
        minimumFractionDigits: cents ? 2 : n % 1 === 0 ? 0 : 2,
        maximumFractionDigits: 2
      })
    );
  };

  HOG.escape = (value) =>
    String(value == null ? "" : value).replace(/[&<>"']/g, (ch) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    }[ch]));

  const storedCart = HOG.storage.get(KEYS.cart, []);
  const storedWish = HOG.storage.get(KEYS.wish, []);
  const storedUser = HOG.storage.get(KEYS.user, null);
  const storedCms = HOG.storage.get(KEYS.cms, {});

  const state = {
    cart: Array.isArray(storedCart) ? storedCart.filter((i) => i && i.id && i.qty > 0) : [],
    wishlist: Array.isArray(storedWish) ? storedWish.filter((id) => PRODUCTS.some((p) => p.id === id)) : [],
    user: storedUser && storedUser.email ? storedUser : null,
    cms: Object.assign({}, CMS_DEFAULTS, storedCms && typeof storedCms === "object" ? storedCms : {}),
    route: { name: "home", params: new URLSearchParams() },
    view: "home",
    heroIndex: 0,
    trendingTab: "best",
    quickView: null,
    checkoutOrder: null,
    shop: {
      categories: [],
      saleOnly: false,
      search: "",
      maxPrice: 200,
      rating: 0,
      sizes: [],
      colors: [],
      sort: "featured",
      visible: 9
    }
  };
  HOG.state = state;

  HOG.productById = (id) => PRODUCTS.find((p) => p.id === id) || null;
  HOG.categoryLabel = (cat) => CATEGORY_LABELS[cat] || cat;

  /* ---------------------------------------------------------------------- */
  /* Toasts                                                                 */
  /* ---------------------------------------------------------------------- */
  HOG.toast = (message, type = "success") => {
    const container = $("#toastContainer");
    if (!container) return;
    const icons = { success: "i-check-circle", error: "i-alert-circle", info: "i-sparkles" };
    const el = document.createElement("div");
    el.className = "toast toast-" + type;
    el.setAttribute("role", type === "error" ? "alert" : "status");
    el.innerHTML =
      '<span class="toast-icon"><svg class="h-4 w-4"><use href="#' + (icons[type] || icons.info) + '"/></svg></span>' +
      '<p class="min-w-0 flex-1 text-xs font-semibold leading-relaxed text-ink/70">' + HOG.escape(message) + "</p>" +
      '<button type="button" class="shrink-0 text-ink/30 transition hover:text-ink" data-toast-dismiss aria-label="Dismiss notification">' +
      '<svg class="h-4 w-4"><use href="#i-close"/></svg></button>';
    container.appendChild(el);
    const remove = () => {
      el.classList.add("is-out");
      setTimeout(() => el.remove(), 260);
    };
    el.querySelector("[data-toast-dismiss]").addEventListener("click", remove);
    setTimeout(remove, 4200);
  };

  /* ---------------------------------------------------------------------- */
  /* Overlays                                                               */
  /* ---------------------------------------------------------------------- */
  function syncScrollLock() {
    const open = $(".drawer.is-open, .modal.is-open, .search-overlay.is-open, .filter-panel.is-open");
    document.body.classList.toggle("no-scroll", Boolean(open));
  }
  HOG.syncScrollLock = syncScrollLock;

  let lastFocused = null;

  HOG.openLayer = (el, backdrop) => {
    if (!el) return;
    lastFocused = document.activeElement;
    el.classList.add("is-open");
    el.removeAttribute("inert");
    if (backdrop) backdrop.classList.add("is-open");
    syncScrollLock();
    setTimeout(() => {
      const focusable = el.querySelector("input:not([type=hidden]), button, a[href], select, textarea");
      if (focusable && !el.contains(document.activeElement)) focusable.focus({ preventScroll: true });
    }, 80);
  };

  HOG.closeLayer = (el, backdrop) => {
    if (!el) return;
    el.classList.remove("is-open");
    el.setAttribute("inert", "");
    if (backdrop) backdrop.classList.remove("is-open");
    syncScrollLock();
    if (lastFocused && document.contains(lastFocused)) {
      lastFocused.focus({ preventScroll: true });
      lastFocused = null;
    }
  };

  HOG.openModal = (id) => {
    const el = typeof id === "string" ? document.getElementById(id) : id;
    HOG.openLayer(el);
  };
  HOG.closeModal = (id) => {
    const el = typeof id === "string" ? document.getElementById(id) : id;
    HOG.closeLayer(el);
  };

  HOG.openCart = () => {
    if (HOG.renderCart) HOG.renderCart();
    HOG.openLayer($("#cartDrawer"), $("#cartBackdrop"));
  };
  HOG.closeCart = () => HOG.closeLayer($("#cartDrawer"), $("#cartBackdrop"));

  HOG.openWishlist = () => {
    if (HOG.renderWishlist) HOG.renderWishlist();
    HOG.openLayer($("#wishlistDrawer"), $("#wishlistBackdrop"));
  };
  HOG.closeWishlist = () => HOG.closeLayer($("#wishlistDrawer"), $("#wishlistBackdrop"));

  HOG.openMenu = () => {
    HOG.openLayer($("#mobileMenu"), $("#mobileBackdrop"));
    $("#mobileMenuBtn")?.setAttribute("aria-expanded", "true");
  };
  HOG.closeMenu = () => {
    HOG.closeLayer($("#mobileMenu"), $("#mobileBackdrop"));
    $("#mobileMenuBtn")?.setAttribute("aria-expanded", "false");
  };

  HOG.openSearch = () => {
    const overlay = $("#searchOverlay");
    if (!overlay) return;
    HOG.openLayer(overlay);
    setTimeout(() => $("#searchInput")?.focus({ preventScroll: true }), 80);
    HOG.renderSearch($("#searchInput")?.value || "");
  };
  HOG.closeSearch = () => HOG.closeLayer($("#searchOverlay"));

  HOG.closeAllOverlays = () => {
    HOG.closeCart();
    HOG.closeWishlist();
    HOG.closeMenu();
    HOG.closeSearch();
    $$(".modal.is-open").forEach((m) => HOG.closeModal(m));
    $$(".filter-panel.is-open").forEach((p) => p.classList.remove("is-open"));
    $("#filterBackdrop")?.classList.remove("is-open");
    syncScrollLock();
  };

  /* ---------------------------------------------------------------------- */
  /* Router                                                                 */
  /* ---------------------------------------------------------------------- */
  const ROUTE_META = {
    home: { view: "home", title: "House of Gina — Refresh Your Fashion Vibe" },
    shop: { view: "shop", title: "Shop All — House of Gina" },
    women: { view: "shop", title: "Women — House of Gina" },
    men: { view: "shop", title: "Men — House of Gina" },
    accessories: { view: "shop", title: "Accessories — House of Gina" },
    contact: { view: "contact", title: "Contact — House of Gina" },
    admin: { view: "admin", title: "Admin Dashboard — House of Gina" }
  };

  HOG.parseRoute = () => {
    const raw = (location.hash || "#/home").replace(/^#\/?/, "");
    const [pathPart, queryPart] = raw.split("?");
    let name = (pathPart || "home").toLowerCase().replace(/\/+$/, "");
    if (!ROUTE_META[name]) name = "home";
    return { name, params: new URLSearchParams(queryPart || "") };
  };

  HOG.navigate = (hash) => {
    if (!hash) return;
    const next = hash.startsWith("#") ? hash : "#/" + hash.replace(/^\/+/, "");
    if (location.hash === next) {
      HOG.route();
    } else {
      location.hash = next;
    }
  };

  HOG.route = () => {
    const route = HOG.parseRoute();
    state.route = route;
    state.view = ROUTE_META[route.name].view;

    $$("[data-view]").forEach((view) => {
      view.hidden = view.dataset.view !== state.view;
    });

    $$("[data-nav]").forEach((link) => {
      const nav = link.dataset.nav;
      const active =
        nav === route.name ||
        (route.name === "shop" && nav === "shop") ||
        (state.view === "shop" && ["women", "men", "accessories"].includes(nav) && nav === route.name);
      link.classList.toggle("is-active", active);
      if (active) link.setAttribute("aria-current", "page");
      else link.removeAttribute("aria-current");
    });

    document.title = ROUTE_META[route.name].title;
    document.body.classList.toggle("admin-mode", route.name === "admin");

    if (state.view === "home") {
      HOG.renderHero(state.heroIndex);
      HOG.applyCms();
    }
    if (state.view === "shop" && HOG.applyShopRoute) {
      HOG.applyShopRoute(route.name, route.params);
    }
    if (route.name === "admin") {
      document.body.classList.add("admin-mode");
    }

    HOG.closeAllOverlays();
    window.scrollTo({ top: 0, behavior: "auto" });

    window.dispatchEvent(new CustomEvent("hog:route", { detail: route }));
    if (window.HOGAdmin && typeof window.HOGAdmin.onRoute === "function") {
      window.HOGAdmin.onRoute(route);
    }
  };

  /* ---------------------------------------------------------------------- */
  /* Hero                                                                   */
  /* ---------------------------------------------------------------------- */
  function cmsSlides() {
    return HERO_SLIDES.map((slide, index) =>
      index === 0
        ? Object.assign({}, slide, {
            eyebrow: state.cms.eyebrow,
            title: state.cms.headline,
            desc: state.cms.subcopy
          })
        : slide
    );
  }
  HOG.cmsSlides = cmsSlides;

  function splitHeadline(title) {
    const words = String(title || "").trim().split(/\s+/).filter(Boolean);
    if (words.length < 3) {
      return '<span class="gradient-text font-serif italic font-semibold">' + HOG.escape(words.join(" ")) + "</span>";
    }
    const tail = words.slice(-2).join(" ");
    const head = words.slice(0, -2).join(" ");
    return HOG.escape(head) + ' <span class="gradient-text font-serif italic font-semibold">' + HOG.escape(tail) + "</span>";
  }
  HOG.splitHeadline = splitHeadline;

  function renderHeroDots() {
    const dots = $("#heroDots");
    if (!dots) return;
    dots.innerHTML = cmsSlides()
      .map(
        (slide, i) =>
          '<button type="button" class="hero-dot' + (i === state.heroIndex ? " is-active" : "") +
          '" data-hero-dot="' + i + '" role="tab" aria-label="Go to slide ' + (i + 1) + '" aria-selected="' +
          (i === state.heroIndex) + '"></button>'
      )
      .join("");
  }

  HOG.renderHero = (index) => {
    const slides = cmsSlides();
    if (!slides.length) return;
    state.heroIndex = ((index % slides.length) + slides.length) % slides.length;
    const slide = slides[state.heroIndex];

    const eyebrow = $("#heroEyebrow");
    const title = $("#heroTitle");
    const desc = $("#heroDesc");
    const image = $("#heroImage");
    const badge = $("#heroBadgeText");
    const cta = $("[data-hero-cta]");

    if (eyebrow) eyebrow.textContent = slide.eyebrow;
    if (title) title.innerHTML = splitHeadline(slide.title);
    if (desc) desc.textContent = slide.desc;
    if (image) {
      image.style.opacity = "0.35";
      image.src = slide.image;
      image.alt = slide.title + " — House of Gina new season";
      const reveal = () => { image.style.opacity = "1"; };
      if (image.complete) reveal();
      else image.addEventListener("load", reveal, { once: true });
    }
    if (badge) badge.textContent = slide.badge;
    if (cta) cta.textContent = state.cms.cta;

    const miniImg = $("#heroMiniImg");
    const miniName = $("#heroMiniName");
    const miniPrice = $("#heroMiniPrice");
    const miniAdd = $('[data-add][data-hero-mini]') || $("#heroContent")?.closest(".hero")?.querySelector(".absolute.-bottom-6 [data-add]");
    if (miniImg) miniImg.src = slide.miniImage;
    if (miniName) miniName.textContent = slide.miniName;
    if (miniPrice) {
      miniPrice.innerHTML =
        HOG.escape(slide.miniPrice) +
        ' <span class="ml-1 text-[10px] font-medium text-ink/35 line-through">' + HOG.escape(slide.miniCompare) + "</span>";
    }
    if (miniAdd) {
      miniAdd.dataset.add = slide.miniId;
      miniAdd.setAttribute("aria-label", "Add " + slide.miniName + " to bag");
    }

    renderHeroDots();
  };

  function nextHero() {
    if (state.view !== "home") return;
    HOG.renderHero(state.heroIndex + 1);
  }

  let heroTimer = null;
  function startHeroTimer() {
    clearInterval(heroTimer);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    heroTimer = setInterval(nextHero, 7000);
  }

  /* ---------------------------------------------------------------------- */
  /* Search                                                                 */
  /* ---------------------------------------------------------------------- */
  HOG.searchProducts = (term) => {
    const q = String(term || "").trim().toLowerCase();
    if (!q) return [];
    const tokens = q.split(/\s+/);
    return PRODUCTS.filter((p) => {
      const haystack = [
        p.name,
        p.category,
        HOG.categoryLabel(p.category),
        p.description,
        p.tags.join(" "),
        p.colors.map((c) => c.name).join(" ")
      ].join(" ").toLowerCase();
      return tokens.every((token) => haystack.includes(token));
    });
  };

  HOG.renderSearch = (term) => {
    const input = $("#searchInput");
    if (input && input.value !== term) input.value = term;
    const results = $("#searchResults");
    const empty = $("#searchEmpty");
    if (!results || !empty) return;
    const q = String(term || "").trim();
    if (!q) {
      results.classList.add("hidden");
      results.classList.remove("grid");
      empty.classList.add("hidden");
      empty.classList.remove("flex");
      return;
    }
    const matches = HOG.searchProducts(q).slice(0, 6);
    if (!matches.length) {
      results.innerHTML = "";
      results.classList.add("hidden");
      results.classList.remove("grid");
      empty.classList.remove("hidden");
      empty.classList.add("flex");
      return;
    }
    empty.classList.add("hidden");
    empty.classList.remove("flex");
    results.innerHTML = matches
      .map(
        (p) =>
          '<button type="button" class="search-result w-full" data-quick="' + p.id + '">' +
          '<img src="' + HOG.escape(p.image) + '" alt="" class="h-12 w-10 shrink-0 rounded-lg object-cover" loading="lazy">' +
          '<span class="min-w-0 flex-1 text-left">' +
          '<span class="block truncate text-xs font-extrabold">' + HOG.escape(p.name) + "</span>" +
          '<span class="mt-0.5 block text-[10px] text-ink/40">' + HOG.escape(HOG.categoryLabel(p.category)) +
          " · " + HOG.money(p.price) + "</span></span>" +
          '<svg class="h-4 w-4 shrink-0 text-ink/20"><use href="#i-chevron-right"/></svg></button>'
      )
      .join("");
    results.classList.remove("hidden");
    results.classList.add("grid");
  };

  /* ---------------------------------------------------------------------- */
  /* CMS                                                                    */
  /* ---------------------------------------------------------------------- */
  HOG.saveCms = (data, { quiet = false } = {}) => {
    state.cms = Object.assign({}, CMS_DEFAULTS, data);
    HOG.storage.set(KEYS.cms, state.cms);
    HOG.applyCms();
    if (!quiet) HOG.toast("Storefront content published.", "success");
  };

  HOG.resetCms = () => {
    state.cms = Object.assign({}, CMS_DEFAULTS);
    HOG.storage.set(KEYS.cms, state.cms);
    HOG.applyCms();
    HOG.toast("Content reset to defaults.", "info");
  };

  HOG.applyCms = () => {
    const cms = state.cms;
    const announcement = $("#announcementText");
    if (announcement) announcement.textContent = cms.announcement;

    if (state.view === "home") {
      /* renderHero() applies the CMS fields to slide 0 only, so the active
         carousel slide is never overwritten while it is on screen. */
      HOG.renderHero(state.heroIndex);
    }

    const preview = {
      cmsPreviewAnnouncement: cms.announcement,
      cmsPreviewEyebrow: cms.eyebrow,
      cmsPreviewSubcopy: cms.subcopy,
      cmsPreviewCta: cms.cta
    };
    Object.entries(preview).forEach(([id, value]) => {
      const el = document.getElementById(id);
      if (el) el.textContent = value;
    });
    const previewHeadline = $("#cmsPreviewHeadline");
    if (previewHeadline) previewHeadline.innerHTML = splitHeadline(cms.headline);
  };

  /* ---------------------------------------------------------------------- */
  /* Newsletter, countdown, FAQ                                             */
  /* ---------------------------------------------------------------------- */
  function bindNewsletter() {
    const form = $("#newsletterForm");
    if (!form) return;
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const email = $("#newsletterEmail");
      const msg = $("#newsletterMsg");
      const value = (email?.value || "").trim();
      const valid = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
      if (!valid) {
        if (msg) {
          msg.textContent = "Please enter a valid email address.";
          msg.classList.remove("text-sunny");
          msg.classList.add("text-rose-200");
        }
        email?.classList.add("border-rose-300");
        email?.focus();
        return;
      }
      if (msg) {
        msg.textContent = "Demo only — no signup or discount email was sent.";
        msg.classList.remove("text-rose-200");
        msg.classList.add("text-sunny");
      }
      email?.classList.remove("border-rose-300");
      form.reset();
      HOG.toast("Demo only — no newsletter signup was saved.", "info");
    });
  }

  function bindCountdown() {
    const days = $("#flashDays");
    const hours = $("#flashHours");
    const mins = $("#flashMins");
    const secs = $("#flashSecs");
    if (!days || !hours || !mins || !secs) return;

    const pad = (n) => String(Math.max(0, n)).padStart(2, "0");
    const target = () => {
      const now = new Date();
      const end = new Date(now);
      const daysUntilSunday = (7 - now.getDay()) % 7;
      end.setDate(now.getDate() + daysUntilSunday);
      end.setHours(23, 59, 59, 999);
      if (end.getTime() <= now.getTime()) end.setDate(end.getDate() + 7);
      return end;
    };
    let end = target();
    const tick = () => {
      let diff = end.getTime() - Date.now();
      if (diff <= 0) {
        end = target();
        diff = end.getTime() - Date.now();
      }
      const total = Math.floor(diff / 1000);
      days.textContent = pad(Math.floor(total / 86400));
      hours.textContent = pad(Math.floor((total % 86400) / 3600));
      mins.textContent = pad(Math.floor((total % 3600) / 60));
      secs.textContent = pad(total % 60);
    };
    tick();
    setInterval(tick, 1000);
  }

  function bindFaq() {
    $$(".faq-question").forEach((button) => {
      button.addEventListener("click", () => {
        const item = button.closest(".faq-item");
        const open = item?.classList.contains("is-open");
        $$(".faq-item.is-open").forEach((other) => {
          other.classList.remove("is-open");
          other.querySelector(".faq-question")?.setAttribute("aria-expanded", "false");
        });
        if (!open && item) {
          item.classList.add("is-open");
          button.setAttribute("aria-expanded", "true");
        }
      });
    });
  }

  /* ---------------------------------------------------------------------- */
  /* Reveal animations                                                      */
  /* ---------------------------------------------------------------------- */
  let revealObserver = null;
  HOG.observeReveals = () => {
    const nodes = $$(".reveal:not(.is-visible)");
    if (!nodes.length) return;
    if (!("IntersectionObserver" in window) || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      nodes.forEach((node) => node.classList.add("is-visible"));
      return;
    }
    if (!revealObserver) {
      revealObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              revealObserver.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.08, rootMargin: "0px 0px -40px 0px" }
      );
    }
    nodes.forEach((node) => revealObserver.observe(node));
  };

  /* ---------------------------------------------------------------------- */
  /* Global delegated events                                                */
  /* ---------------------------------------------------------------------- */
  function bindDelegates() {
    document.addEventListener("click", (event) => {
      const target = event.target.closest(
        "[data-open-cart],[data-close-cart],[data-open-wishlist],[data-close-wishlist]," +
          "[data-open-account],[data-open-search],[data-close-search],[data-close-menu],[data-menu-link]," +
          "[data-close-modal],[data-demo-toast],[data-page-toast],[data-add],[data-wish],[data-quick]," +
          "[data-trending-tab],[data-shop-cat],[data-filter-rating],[data-filter-size],[data-filter-color]," +
          "[data-remove-filter],[data-cart-qty],[data-cart-remove],[data-wish-add],[data-wish-remove]," +
          "[data-qv-color],[data-qv-size],[data-toggle-password],[data-auth-tab],[data-hero-dot]"
      );
      if (!target) return;

      if (target.matches("[data-open-cart]")) { event.preventDefault(); HOG.openCart(); return; }
      if (target.matches("[data-close-cart]")) { event.preventDefault(); HOG.closeCart(); return; }
      if (target.matches("[data-open-wishlist]")) { event.preventDefault(); HOG.openWishlist(); return; }
      if (target.matches("[data-close-wishlist]")) { event.preventDefault(); HOG.closeWishlist(); return; }
      if (target.matches("[data-open-account]")) { event.preventDefault(); HOG.openAuth ? HOG.openAuth() : HOG.openModal("authModal"); return; }
      if (target.matches("[data-open-search]")) { event.preventDefault(); HOG.openSearch(); return; }
      if (target.matches("[data-close-search]")) { event.preventDefault(); HOG.closeSearch(); return; }
      if (target.matches("[data-close-menu]")) { event.preventDefault(); HOG.closeMenu(); return; }
      if (target.matches("[data-menu-link]")) { HOG.closeMenu(); return; }
      if (target.matches("[data-close-modal]")) {
        const modal = target.closest(".modal");
        if (modal) HOG.closeModal(modal);
        return;
      }
      if (target.matches("[data-demo-toast]")) { HOG.toast(target.dataset.demoToast, "info"); return; }
      if (target.matches("[data-page-toast]")) { HOG.toast(target.dataset.pageToast, "info"); return; }
      if (target.matches("[data-add]")) { HOG.addToCart && HOG.addToCart(target.dataset.add); return; }
      if (target.matches("[data-wish]")) { HOG.toggleWishlist && HOG.toggleWishlist(target.dataset.wish); return; }
      if (target.matches("[data-quick]")) { HOG.openQuickView && HOG.openQuickView(target.dataset.quick); return; }
      if (target.matches("[data-trending-tab]")) { HOG.setTrendingTab && HOG.setTrendingTab(target.dataset.trendingTab); return; }
      if (target.matches("[data-shop-cat]")) { HOG.setShopCategory && HOG.setShopCategory(target.dataset.shopCat); return; }
      if (target.matches("[data-filter-rating]")) { HOG.toggleShopFilter && HOG.toggleShopFilter("rating", target.dataset.filterRating); return; }
      if (target.matches("[data-filter-size]")) { HOG.toggleShopFilter && HOG.toggleShopFilter("sizes", target.dataset.filterSize); return; }
      if (target.matches("[data-filter-color]")) { HOG.toggleShopFilter && HOG.toggleShopFilter("colors", target.dataset.filterColor); return; }
      if (target.matches("[data-remove-filter]")) { HOG.removeShopFilter && HOG.removeShopFilter(target.dataset.removeFilter); return; }
      if (target.matches("[data-cart-qty]")) { HOG.changeCartQty && HOG.changeCartQty(target.dataset.cartQty, target.dataset.key); return; }
      if (target.matches("[data-cart-remove]")) { HOG.removeCartItem && HOG.removeCartItem(target.dataset.cartRemove); return; }
      if (target.matches("[data-wish-add]")) { HOG.addToCart && HOG.addToCart(target.dataset.wishAdd); return; }
      if (target.matches("[data-wish-remove]")) { HOG.toggleWishlist && HOG.toggleWishlist(target.dataset.wishRemove); return; }
      if (target.matches("[data-qv-color]")) { HOG.setQuickColor && HOG.setQuickColor(target.dataset.qvColor); return; }
      if (target.matches("[data-qv-size]")) { HOG.setQuickSize && HOG.setQuickSize(target.dataset.qvSize); return; }
      if (target.matches("[data-hero-dot]")) { HOG.renderHero(Number(target.dataset.heroDot)); startHeroTimer(); return; }
      if (target.matches("[data-auth-tab]")) { HOG.setAuthTab && HOG.setAuthTab(target.dataset.authTab); return; }
      if (target.matches("[data-toggle-password]")) {
        const input = document.getElementById(target.dataset.togglePassword);
        if (input) {
          const show = input.type === "password";
          input.type = show ? "text" : "password";
          target.setAttribute("aria-label", show ? "Hide password" : "Show password");
          target.innerHTML = '<svg class="h-4 w-4"><use href="#' + (show ? "i-eye" : "i-lock") + '"/></svg>';
        }
        return;
      }
    });

    ["cartBackdrop", "wishlistBackdrop", "mobileBackdrop"].forEach((id) => {
      document.getElementById(id)?.addEventListener("click", () => {
        if (id === "cartBackdrop") HOG.closeCart();
        if (id === "wishlistBackdrop") HOG.closeWishlist();
        if (id === "mobileBackdrop") HOG.closeMenu();
      });
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        const openModal = $(".modal.is-open");
        if (openModal) { HOG.closeModal(openModal); return; }
        if ($("#searchOverlay")?.classList.contains("is-open")) { HOG.closeSearch(); return; }
        if ($("#cartDrawer")?.classList.contains("is-open")) { HOG.closeCart(); return; }
        if ($("#wishlistDrawer")?.classList.contains("is-open")) { HOG.closeWishlist(); return; }
        if ($("#mobileMenu")?.classList.contains("is-open")) HOG.closeMenu();
      }
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        HOG.openSearch();
      }
    });

    $("#mobileMenuBtn")?.addEventListener("click", HOG.openMenu);
    $("#heroPrev")?.addEventListener("click", () => { HOG.renderHero(state.heroIndex - 1); startHeroTimer(); });
    $("#heroNext")?.addEventListener("click", () => { HOG.renderHero(state.heroIndex + 1); startHeroTimer(); });

    const hero = $(".hero");
    hero?.addEventListener("mouseenter", () => clearInterval(heroTimer));
    hero?.addEventListener("mouseleave", startHeroTimer);

    const searchInput = $("#searchInput");
    searchInput?.addEventListener("input", () => HOG.renderSearch(searchInput.value));
    searchInput?.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        const first = $("#searchResults [data-quick]");
        if (first) first.click();
      }
    });
    $$("[data-search-term]").forEach((chip) => {
      chip.addEventListener("click", () => {
        const term = chip.dataset.searchTerm;
        if (searchInput) {
          searchInput.value = term;
          HOG.renderSearch(term);
          searchInput.focus();
        }
      });
    });

    const header = $("#siteHeader");
    const backTop = $("#backToTop");
    const onScroll = () => {
      const y = window.scrollY || document.documentElement.scrollTop;
      header?.classList.toggle("scrolled", y > 10);
      backTop?.classList.toggle("is-visible", y > 520);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    backTop?.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
  }

  /* ---------------------------------------------------------------------- */
  /* Boot                                                                   */
  /* ---------------------------------------------------------------------- */
  HOG.init = () => {
    const year = $("#year");
    if (year) year.textContent = String(new Date().getFullYear());

    HOG.applyCms();
    HOG.renderHero(0);
    startHeroTimer();
    bindNewsletter();
    bindCountdown();
    bindFaq();
    bindDelegates();

    if (HOG.renderTrending) HOG.renderTrending();
    if (HOG.renderShop) HOG.renderShop();
    if (HOG.renderCart) HOG.renderCart();
    if (HOG.renderWishlist) HOG.renderWishlist();
    if (HOG.renderAccount) HOG.renderAccount();
    if (window.HOGAdmin && window.HOGAdmin.init) window.HOGAdmin.init();

    HOG.route();
    HOG.observeReveals();

    window.addEventListener("hashchange", HOG.route);
    window.addEventListener("hog:route", () => HOG.observeReveals());
  };

  function boot() {
    setTimeout(() => HOG.init(), 0);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
