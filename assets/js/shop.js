/* ==========================================================================
   HOUSE OF GINA — Catalogue rendering, trending tabs, shop filters
   ========================================================================== */
(function () {
  "use strict";

  const HOG = window.HOG;
  if (!HOG) return;
  const $ = HOG.$;
  const $$ = HOG.$$;
  const state = HOG.state;

  const CATEGORY_COPY = {
    all: {
      title: "Shop All",
      subtitle: "Every piece, every mood. Filter your way to something unmistakably you."
    },
    women: {
      title: "Women",
      subtitle: "Fluid silhouettes, bold colour and the everyday pieces that do the most."
    },
    men: {
      title: "Men",
      subtitle: "Relaxed tailoring and elevated basics — considered, never complicated."
    },
    accessories: {
      title: "Accessories",
      subtitle: "The finishing touches: shades, gold layers and pieces that start conversations."
    },
    bags: {
      title: "Bags",
      subtitle: "Sculptural shapes and hands-free favourites for every kind of day."
    },
    shoes: {
      title: "Shoes",
      subtitle: "From court sneakers to strappy heels — walk the talk."
    },
    sale: {
      title: "Sale Edit",
      subtitle: "The pieces you have been eyeing, now with a little more sparkle. Up to 50% off."
    }
  };

  function discountPercent(product) {
    if (!product.compareAt || product.compareAt <= product.price) return 0;
    return Math.round(((product.compareAt - product.price) / product.compareAt) * 100);
  }

  function starMarkup(rating) {
    let out = "";
    for (let i = 1; i <= 5; i += 1) {
      out += '<svg class="h-3 w-3' + (i <= Math.round(rating) ? "" : " opacity-25") + '"><use href="#i-star"/></svg>';
    }
    return out;
  }
  HOG.starMarkup = starMarkup;

  HOG.productCard = (product, index = 0) => {
    const off = discountPercent(product);
    const isNew = product.tags.includes("new");
    const low = product.stock <= 12;
    const wished = state.wishlist.includes(product.id);
    const badges = [];
    if (off > 0) badges.push('<span class="product-badge badge-sale">-' + off + "%</span>");
    if (isNew) badges.push('<span class="product-badge badge-new">New in</span>');
    if (low) badges.push('<span class="product-badge badge-low">Only ' + product.stock + " left</span>");

    return (
      '<article class="product-card group reveal" data-product-card="' + product.id + '">' +
        '<div class="product-media">' +
          '<img src="' + HOG.escape(product.image) + '" alt="' + HOG.escape(product.name) +
            '" loading="' + (index < 4 ? "eager" : "lazy") + '" decoding="async">' +
          '<div class="absolute left-2.5 top-2.5 z-[2] flex flex-col items-start gap-1">' + badges.join("") + "</div>" +
          '<button type="button" class="wish-btn' + (wished ? " is-wished" : "") + '" data-wish="' + product.id +
            '" aria-label="' + (wished ? "Remove from" : "Save to") + ' wishlist" aria-pressed="' + wished + '">' +
            '<svg class="h-4 w-4"><use href="#i-heart"/></svg></button>' +
          '<div class="card-actions">' +
            '<button type="button" class="card-add" data-add="' + product.id + '">' +
              '<svg class="h-3.5 w-3.5"><use href="#i-bag"/></svg>Add to bag</button>' +
            '<button type="button" class="card-quick" data-quick="' + product.id + '" aria-label="Quick view ' +
              HOG.escape(product.name) + '"><svg class="h-4 w-4"><use href="#i-eye"/></svg></button>' +
          "</div>" +
        "</div>" +
        '<div class="mt-2.5 min-w-0">' +
          '<div class="flex items-start justify-between gap-2">' +
            '<h3 class="min-w-0 truncate text-[12px] font-extrabold leading-snug sm:text-[13px]">' +
              HOG.escape(product.name) + "</h3>" +
            '<span class="stars shrink-0" title="' + product.rating + ' out of 5">' + starMarkup(product.rating) + "</span>" +
          "</div>" +
          '<p class="mt-0.5 text-[10px] text-ink/40">' + HOG.escape(HOG.categoryLabel(product.category)) +
            " · " + product.rating + " (" + product.reviews + ")</p>" +
          '<div class="mt-1.5 flex flex-wrap items-center gap-x-1.5 gap-y-0.5">' +
            '<span class="price">' + HOG.money(product.price) + "</span>" +
            (product.compareAt > product.price
              ? '<span class="price-compare">' + HOG.money(product.compareAt) + "</span>" +
                '<span class="ml-auto text-[9px] font-extrabold text-emerald-600">Save ' +
                HOG.money(product.compareAt - product.price) + "</span>"
              : "") +
          "</div>" +
          '<div class="product-swatches mt-1.5">' +
            product.colors
              .slice(0, 5)
              .map((c) => '<span class="product-swatch" style="background:' + HOG.escape(c.hex) +
                '" title="' + HOG.escape(c.name) + '"></span>')
              .join("") +
            '<span class="ml-1 text-[9px] font-semibold text-ink/30">' + product.colors.length + " colours</span>" +
          "</div>" +
        "</div>" +
      "</article>"
    );
  };

  /* ---------------------------------------------------------------------- */
  /* Trending                                                               */
  /* ---------------------------------------------------------------------- */
  HOG.renderTrending = () => {
    const grid = $("#trendingGrid");
    if (!grid) return;
    const tab = state.trendingTab;
    let list = PRODUCTS.filter((p) => p.tags.includes(tab));
    if (tab === "top") list = list.slice().sort((a, b) => b.rating - a.rating);
    if (!list.length) list = PRODUCTS.slice(0, 8);
    grid.innerHTML = list.slice(0, 8).map((p, i) => HOG.productCard(p, i)).join("");
    $$("[data-trending-tab]").forEach((button) => {
      const active = button.dataset.trendingTab === tab;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-selected", String(active));
    });
    HOG.observeReveals();
  };

  HOG.setTrendingTab = (tab) => {
    if (!["best", "new", "top"].includes(tab)) return;
    state.trendingTab = tab;
    HOG.renderTrending();
  };

  /* ---------------------------------------------------------------------- */
  /* Shop filtering                                                         */
  /* ---------------------------------------------------------------------- */
  function matchesSearch(product, term) {
    if (!term) return true;
    const tokens = term.toLowerCase().split(/\s+/).filter(Boolean);
    const haystack = [
      product.name,
      product.category,
      HOG.categoryLabel(product.category),
      product.description,
      product.colors.map((c) => c.name).join(" "),
      product.tags.join(" ")
    ].join(" ").toLowerCase();
    return tokens.every((token) => haystack.includes(token));
  }

  HOG.filteredProducts = () => {
    const shop = state.shop;
    let list = PRODUCTS.filter((p) => {
      if (shop.categories.length && !shop.categories.includes(p.category)) return false;
      if (shop.saleOnly && !(p.compareAt > p.price)) return false;
      if (p.price > shop.maxPrice) return false;
      if (shop.rating && p.rating < shop.rating) return false;
      if (shop.sizes.length && !shop.sizes.some((size) => p.sizes.includes(size))) return false;
      if (shop.colors.length && !shop.colors.some((name) => p.colors.some((c) => c.name === name))) return false;
      if (!matchesSearch(p, shop.search)) return false;
      return true;
    });

    switch (shop.sort) {
      case "newest":
        list = list.slice().sort((a, b) => Number(b.tags.includes("new")) - Number(a.tags.includes("new")));
        break;
      case "price-low":
        list = list.slice().sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        list = list.slice().sort((a, b) => b.price - a.price);
        break;
      case "rating":
        list = list.slice().sort((a, b) => b.rating - a.rating || b.reviews - a.reviews);
        break;
      case "discount":
        list = list.slice().sort((a, b) => discountPercent(b) - discountPercent(a));
        break;
      default:
        list = list.slice().sort(
          (a, b) => Number(b.tags.includes("best")) - Number(a.tags.includes("best")) || b.rating - a.rating
        );
    }
    return list;
  };

  function activeHeading() {
    if (state.shop.saleOnly) return CATEGORY_COPY.sale;
    if (state.shop.categories.length === 1) return CATEGORY_COPY[state.shop.categories[0]] || CATEGORY_COPY.all;
    return CATEGORY_COPY.all;
  }

  function updateHeading() {
    const copy = activeHeading();
    const title = $("#shopTitle");
    const crumb = $("#shopBreadcrumb");
    const subtitle = $("#shopSubtitle");
    if (title) title.textContent = copy.title;
    if (crumb) crumb.textContent = copy.title;
    if (subtitle) subtitle.textContent = copy.subtitle;
  }

  function syncPills() {
    const shop = state.shop;
    $$("[data-shop-cat]").forEach((pill) => {
      const cat = pill.dataset.shopCat;
      let active = false;
      if (cat === "all") active = !shop.saleOnly && shop.categories.length === 0;
      else if (cat === "sale") active = shop.saleOnly;
      else active = !shop.saleOnly && shop.categories.length === 1 && shop.categories[0] === cat;
      pill.classList.toggle("is-active", active);
      pill.setAttribute("aria-pressed", String(active));
    });
  }

  function syncFilterUI() {
    const shop = state.shop;
    $$("[data-filter-cat]").forEach((input) => {
      input.checked = shop.categories.includes(input.value);
    });
    $$("[data-filter-rating]").forEach((chip) => {
      chip.classList.toggle("is-active", Number(chip.dataset.filterRating) === shop.rating);
    });
    $$("[data-filter-size]").forEach((chip) => {
      chip.classList.toggle("is-active", shop.sizes.includes(chip.dataset.filterSize));
    });
    $$("[data-filter-color]").forEach((chip) => {
      chip.classList.toggle("is-active", shop.colors.includes(chip.dataset.filterColor));
    });
    const price = $("#priceRange");
    const priceLabel = $("#priceValue");
    if (price) price.value = String(shop.maxPrice);
    if (priceLabel) priceLabel.textContent = HOG.money(shop.maxPrice);
    const search = $("#shopSearchInput");
    if (search && document.activeElement !== search) search.value = shop.search;
    const sort = $("#shopSort");
    if (sort) sort.value = shop.sort;
  }

  function renderActiveFilters() {
    const wrap = $("#shopActiveFilters");
    if (!wrap) return;
    const shop = state.shop;
    const chips = [];
    const chip = (kind, value, label) =>
      '<button type="button" class="inline-flex items-center gap-1 rounded-full bg-violet-50 px-2.5 py-1 text-[10px] font-bold text-violet transition hover:bg-violet-100" data-remove-filter="' +
      HOG.escape(kind + ":" + value) + '">' + HOG.escape(label) +
      '<svg class="h-3 w-3"><use href="#i-close"/></svg></button>';

    if (shop.saleOnly) chips.push(chip("sale", "1", "On sale"));
    shop.categories.forEach((cat) => chips.push(chip("categories", cat, HOG.categoryLabel(cat))));
    if (shop.search) chips.push(chip("search", shop.search, "“" + shop.search + "”"));
    if (shop.maxPrice < 200) chips.push(chip("price", String(shop.maxPrice), "Under " + HOG.money(shop.maxPrice)));
    if (shop.rating) chips.push(chip("rating", String(shop.rating), shop.rating + "+ stars"));
    shop.sizes.forEach((size) => chips.push(chip("sizes", size, "Size " + size)));
    shop.colors.forEach((color) => chips.push(chip("colors", color, color)));

    wrap.innerHTML = chips.join("");
    wrap.classList.toggle("hidden", chips.length === 0);
    wrap.classList.toggle("flex", chips.length > 0);
  }

  HOG.renderShop = () => {
    const grid = $("#shopGrid");
    if (!grid) return;
    const list = HOG.filteredProducts();
    const shown = Math.min(state.shop.visible, list.length);

    grid.innerHTML = list.slice(0, shown).map((p, i) => HOG.productCard(p, i)).join("");

    const count = $("#shopCount");
    if (count) count.textContent = String(list.length);

    const empty = $("#shopEmpty");
    if (empty) {
      empty.classList.toggle("hidden", list.length !== 0);
      empty.classList.toggle("flex", list.length === 0);
    }

    const more = $("#shopLoadMore");
    if (more) more.classList.toggle("hidden", shown >= list.length || list.length === 0);

    const note = $("#shopLoadNote");
    if (note) {
      note.textContent = list.length
        ? "Showing " + shown + " of " + list.length + " piece" + (list.length === 1 ? "" : "s")
        : "No pieces match these filters";
    }

    renderActiveFilters();
    syncPills();
    updateHeading();
    HOG.observeReveals();
  };

  HOG.applyShopRoute = (routeName, params) => {
    const shop = state.shop;
    const catParam = params.get("cat");
    shop.categories = [];
    shop.saleOnly = false;

    if (["women", "men", "accessories"].includes(routeName)) shop.categories = [routeName];
    else if (catParam === "sale" || params.get("sale") === "1") shop.saleOnly = true;
    else if (catParam && ["women", "men", "accessories", "bags", "shoes"].includes(catParam)) shop.categories = [catParam];

    shop.search = params.get("q") || "";
    shop.sort = ["featured", "newest", "price-low", "price-high", "rating", "discount"].includes(params.get("sort"))
      ? params.get("sort")
      : "featured";
    shop.maxPrice = 200;
    shop.rating = 0;
    shop.sizes = [];
    shop.colors = [];
    shop.visible = 9;

    syncFilterUI();
    HOG.renderShop();
  };

  HOG.setShopCategory = (cat) => {
    const shop = state.shop;
    shop.visible = 9;
    if (cat === "all") {
      shop.categories = [];
      shop.saleOnly = false;
    } else if (cat === "sale") {
      shop.categories = [];
      shop.saleOnly = true;
    } else {
      shop.categories = [cat];
      shop.saleOnly = false;
    }
    syncFilterUI();
    HOG.renderShop();
    const hash = cat === "all" ? "#/shop" : cat === "sale" ? "#/shop?sale=1" : "#/shop?cat=" + cat;
    try {
      history.replaceState(null, "", hash);
    } catch (err) {
      /* noop */
    }
    $$("[data-nav]").forEach((link) => {
      const active = link.dataset.nav === "shop";
      link.classList.toggle("is-active", active);
      if (active) link.setAttribute("aria-current", "page");
      else link.removeAttribute("aria-current");
    });
  };

  HOG.toggleShopFilter = (kind, value) => {
    const shop = state.shop;
    shop.visible = 9;
    if (kind === "rating") {
      const next = Number(value);
      shop.rating = shop.rating === next ? 0 : next;
    } else if (kind === "sizes" || kind === "colors") {
      const list = shop[kind];
      const index = list.indexOf(value);
      if (index >= 0) list.splice(index, 1);
      else list.push(value);
    }
    syncFilterUI();
    HOG.renderShop();
  };

  HOG.removeShopFilter = (raw) => {
    const shop = state.shop;
    const [kind, ...rest] = String(raw || "").split(":");
    const value = rest.join(":");
    shop.visible = 9;
    if (kind === "sale") shop.saleOnly = false;
    if (kind === "categories") shop.categories = shop.categories.filter((c) => c !== value);
    if (kind === "sizes") shop.sizes = shop.sizes.filter((s) => s !== value);
    if (kind === "colors") shop.colors = shop.colors.filter((c) => c !== value);
    if (kind === "search") {
      shop.search = "";
      const input = $("#shopSearchInput");
      if (input) input.value = "";
    }
    if (kind === "price") shop.maxPrice = 200;
    if (kind === "rating") shop.rating = 0;
    syncFilterUI();
    HOG.renderShop();
  };

  HOG.clearShopFilters = () => {
    const shop = state.shop;
    shop.categories = [];
    shop.saleOnly = false;
    shop.search = "";
    shop.maxPrice = 200;
    shop.rating = 0;
    shop.sizes = [];
    shop.colors = [];
    shop.sort = "featured";
    shop.visible = 9;
    syncFilterUI();
    HOG.renderShop();
    HOG.toast("Filters cleared.", "info");
  };

  /* ---------------------------------------------------------------------- */
  /* Init                                                                   */
  /* ---------------------------------------------------------------------- */
  function debounce(fn, wait) {
    let timer = null;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), wait);
    };
  }

  function init() {
    $$("[data-filter-cat]").forEach((input) => {
      input.addEventListener("change", () => {
        state.shop.categories = $$("[data-filter-cat]:checked").map((el) => el.value);
        if (state.shop.categories.length) state.shop.saleOnly = false;
        state.shop.visible = 9;
        syncFilterUI();
        HOG.renderShop();
      });
    });

    const range = $("#priceRange");
    range?.addEventListener("input", () => {
      state.shop.maxPrice = Number(range.value);
      state.shop.visible = 9;
      const label = $("#priceValue");
      if (label) label.textContent = HOG.money(state.shop.maxPrice);
      HOG.renderShop();
    });

    const search = $("#shopSearchInput");
    search?.addEventListener(
      "input",
      debounce(() => {
        state.shop.search = search.value.trim();
        state.shop.visible = 9;
        HOG.renderShop();
      }, 160)
    );

    $("#shopSort")?.addEventListener("change", (event) => {
      state.shop.sort = event.target.value;
      state.shop.visible = 9;
      HOG.renderShop();
    });

    $("#filterClearBtn")?.addEventListener("click", HOG.clearShopFilters);
    $("#shopEmptyReset")?.addEventListener("click", HOG.clearShopFilters);
    $("#shopLoadMore")?.addEventListener("click", () => {
      state.shop.visible += 9;
      HOG.renderShop();
    });

    $("#filterOpenBtn")?.addEventListener("click", () => {
      $("#filterPanel")?.classList.add("is-open");
      $("#filterBackdrop")?.classList.add("is-open");
      HOG.syncScrollLock();
    });
    const closeFilters = () => {
      $("#filterPanel")?.classList.remove("is-open");
      $("#filterBackdrop")?.classList.remove("is-open");
      HOG.syncScrollLock();
    };
    $("#filterCloseBtn")?.addEventListener("click", closeFilters);
    $("#filterBackdrop")?.addEventListener("click", closeFilters);

    // Add numeric shoe sizes dynamically.
    const sizeWrap = $("#sizeFilters");
    if (sizeWrap) {
      ["36", "37", "38", "39", "40", "41", "42"].forEach((size) => {
        if (sizeWrap.querySelector('[data-filter-size="' + size + '"]')) return;
        const button = document.createElement("button");
        button.type = "button";
        button.className = "size-chip";
        button.dataset.filterSize = size;
        button.textContent = size;
        sizeWrap.appendChild(button);
      });
    }

    $$("[data-cat-count]").forEach((el) => {
      el.textContent = String(PRODUCTS.filter((p) => p.category === el.dataset.catCount).length);
    });

    HOG.renderShop();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
