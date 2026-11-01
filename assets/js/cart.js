/* ==========================================================================
   HOUSE OF GINA — Cart, wishlist and quick view
   ========================================================================== */
(function () {
  "use strict";

  const HOG = window.HOG;
  if (!HOG) return;
  const $ = HOG.$;
  const state = HOG.state;

  const keyFor = (item) => encodeURIComponent([item.id, item.size || "", item.color || ""].join("|"));
  const parseKey = (key) => {
    const [id, size, color] = decodeURIComponent(key).split("|");
    return { id, size, color };
  };

  function persistCart() {
    HOG.storage.set(HOG.keys.cart, state.cart);
  }
  function persistWish() {
    HOG.storage.set(HOG.keys.wish, state.wishlist);
  }

  function badgePop(el) {
    if (!el) return;
    el.classList.remove("pop");
    void el.offsetWidth;
    el.classList.add("pop");
  }

  HOG.updateBadges = () => {
    const cartCount = state.cart.reduce((sum, item) => sum + item.qty, 0);
    const cartEl = $("#cartCount");
    const wishEl = $("#wishCount");
    const drawerCart = $("#cartDrawerCount");
    const drawerWish = $("#wishDrawerCount");

    if (cartEl) {
      cartEl.textContent = String(cartCount);
      cartEl.classList.toggle("is-empty", cartCount === 0);
    }
    if (wishEl) {
      wishEl.textContent = String(state.wishlist.length);
      wishEl.classList.toggle("is-empty", state.wishlist.length === 0);
    }
    if (drawerCart) drawerCart.textContent = cartCount + (cartCount === 1 ? " item" : " items");
    if (drawerWish) drawerWish.textContent = state.wishlist.length + " saved piece" + (state.wishlist.length === 1 ? "" : "s");
  };

  HOG.cartTotals = () => {
    const subtotal = state.cart.reduce((sum, item) => {
      const product = HOG.productById(item.id);
      return product ? sum + product.price * item.qty : sum;
    }, 0);
    const shipping = subtotal === 0 || subtotal >= SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
    return {
      subtotal,
      shipping,
      total: subtotal + shipping,
      count: state.cart.reduce((sum, item) => sum + item.qty, 0)
    };
  };

  /* ---------------------------------------------------------------------- */
  /* Cart                                                                   */
  /* ---------------------------------------------------------------------- */
  HOG.renderCart = () => {
    const items = $("#cartItems");
    if (!items) return;
    const totals = HOG.cartTotals();
    const hasItems = state.cart.length > 0;

    items.innerHTML = state.cart
      .map((item) => {
        const product = HOG.productById(item.id);
        if (!product) return "";
        return (
          '<div class="flex gap-3">' +
            '<button type="button" class="shrink-0" data-quick="' + product.id + '" aria-label="View ' +
              HOG.escape(product.name) + '">' +
              '<img src="' + HOG.escape(product.image) + '" alt="" class="h-[76px] w-[60px] rounded-xl object-cover">' +
            "</button>" +
            '<div class="min-w-0 flex-1">' +
              '<div class="flex items-start justify-between gap-2">' +
                '<p class="min-w-0 truncate text-xs font-extrabold">' + HOG.escape(product.name) + "</p>" +
                '<button type="button" class="shrink-0 text-ink/25 transition hover:text-rose-500" data-cart-remove="' +
                  keyFor(item) + '" aria-label="Remove ' + HOG.escape(product.name) + ' from bag">' +
                  '<svg class="h-3.5 w-3.5"><use href="#i-trash"/></svg></button>' +
              "</div>" +
              '<p class="mt-0.5 text-[10px] text-ink/40">' +
                (item.size ? "Size " + HOG.escape(item.size) : "One size") +
                (item.color ? " · " + HOG.escape(item.color) : "") + "</p>" +
              '<div class="mt-2 flex items-center justify-between gap-2">' +
                '<div class="flex h-7 items-center rounded-full border border-ink/10">' +
                  '<button type="button" class="grid h-7 w-7 place-items-center text-ink/45 transition hover:text-violet" data-cart-qty="-1" data-key="' +
                    keyFor(item) + '" aria-label="Decrease quantity"><svg class="h-3 w-3"><use href="#i-minus"/></svg></button>' +
                  '<span class="w-5 text-center text-[11px] font-extrabold">' + item.qty + "</span>" +
                  '<button type="button" class="grid h-7 w-7 place-items-center text-ink/45 transition hover:text-violet" data-cart-qty="1" data-key="' +
                    keyFor(item) + '" aria-label="Increase quantity"><svg class="h-3 w-3"><use href="#i-plus"/></svg></button>' +
                "</div>" +
                '<p class="text-xs font-extrabold">' + HOG.money(product.price * item.qty) + "</p>" +
              "</div>" +
            "</div>" +
          "</div>"
        );
      })
      .join("");

    const empty = $("#cartEmpty");
    if (empty) {
      empty.classList.toggle("hidden", hasItems);
      empty.classList.toggle("flex", !hasItems);
    }
    const footer = $("#cartFooter");
    if (footer) footer.classList.toggle("hidden", !hasItems);
    const shippingBox = $("#cartShipping");
    if (shippingBox) shippingBox.classList.toggle("hidden", !hasItems);

    const remaining = Math.max(0, SHIPPING_THRESHOLD - totals.subtotal);
    const shippingText = $("#cartShippingText");
    if (shippingText) {
      shippingText.innerHTML =
        remaining > 0
          ? "You’re <span class=\"font-extrabold text-violet\">" + HOG.money(remaining, true) +
            "</span> away from free shipping"
          : '<span class="font-extrabold text-emerald-600">Free shipping unlocked!</span> Nice one.';
    }
    const progress = $("#cartProgress");
    if (progress) progress.style.width = Math.min(100, (totals.subtotal / SHIPPING_THRESHOLD) * 100) + "%";

    const subtotal = $("#cartSubtotal");
    const shipping = $("#cartShippingCost");
    const total = $("#cartTotal");
    if (subtotal) subtotal.textContent = HOG.money(totals.subtotal, true);
    if (shipping) shipping.textContent = totals.shipping === 0 ? "Free" : HOG.money(totals.shipping, true);
    if (total) total.textContent = HOG.money(totals.total, true);

    HOG.updateBadges();
  };

  HOG.addToCart = (id, options = {}) => {
    const product = HOG.productById(id);
    if (!product) return;
    const qty = Math.max(1, Number(options.qty) || 1);
    const size = options.size || product.sizes[0] || "One Size";
    const color = options.color || (product.colors[0] && product.colors[0].name) || "";

    const existing = state.cart.find((item) => item.id === id && item.size === size && item.color === color);
    const current = existing ? existing.qty : 0;
    if (current + qty > product.stock) {
      HOG.toast("Only " + product.stock + " of " + product.name + " left in stock.", "error");
      return;
    }
    if (existing) existing.qty += qty;
    else state.cart.push({ id, qty, size, color });

    persistCart();
    HOG.renderCart();
    HOG.updateBadges();
    badgePop($("#cartCount"));
    if (!options.silent) HOG.toast(product.name + " added to your bag.", "success");
  };

  HOG.changeCartQty = (delta, key) => {
    const target = parseKey(key);
    const item = state.cart.find(
      (entry) => entry.id === target.id && entry.size === target.size && entry.color === target.color
    );
    if (!item) return;
    const product = HOG.productById(item.id);
    const step = Number(delta) || 0;
    const next = item.qty + step;
    if (next < 1) {
      HOG.removeCartItem(key);
      return;
    }
    if (product && next > product.stock) {
      HOG.toast("Only " + product.stock + " available.", "error");
      return;
    }
    item.qty = next;
    persistCart();
    HOG.renderCart();
  };

  HOG.removeCartItem = (key) => {
    const target = parseKey(key);
    const item = state.cart.find(
      (entry) => entry.id === target.id && entry.size === target.size && entry.color === target.color
    );
    state.cart = state.cart.filter(
      (entry) => !(entry.id === target.id && entry.size === target.size && entry.color === target.color)
    );
    persistCart();
    HOG.renderCart();
    if (item) {
      const product = HOG.productById(item.id);
      HOG.toast((product ? product.name : "Item") + " removed from your bag.", "info");
    }
  };

  HOG.clearCart = () => {
    state.cart = [];
    persistCart();
    HOG.renderCart();
  };

  /* ---------------------------------------------------------------------- */
  /* Wishlist                                                               */
  /* ---------------------------------------------------------------------- */
  HOG.updateWishButtons = () => {
    HOG.$$("[data-wish]").forEach((button) => {
      const active = state.wishlist.includes(button.dataset.wish);
      button.classList.toggle("is-wished", active);
      button.setAttribute("aria-pressed", String(active));
      button.setAttribute("aria-label", (active ? "Remove from" : "Save to") + " wishlist");
    });
    const qvWish = $("#qvWish");
    if (qvWish && state.quickView) {
      const active = state.wishlist.includes(state.quickView.id);
      qvWish.classList.toggle("is-wished", active);
      qvWish.setAttribute("aria-label", active ? "Remove from wishlist" : "Add to wishlist");
    }
  };

  HOG.renderWishlist = () => {
    const items = $("#wishlistItems");
    if (!items) return;
    items.innerHTML = state.wishlist
      .map((id) => {
        const product = HOG.productById(id);
        if (!product) return "";
        return (
          '<div class="flex gap-3">' +
            '<button type="button" class="shrink-0" data-quick="' + product.id + '" aria-label="View ' +
              HOG.escape(product.name) + '">' +
              '<img src="' + HOG.escape(product.image) + '" alt="" class="h-[76px] w-[60px] rounded-xl object-cover">' +
            "</button>" +
            '<div class="min-w-0 flex-1">' +
              '<div class="flex items-start justify-between gap-2">' +
                '<p class="min-w-0 truncate text-xs font-extrabold">' + HOG.escape(product.name) + "</p>" +
                '<button type="button" class="shrink-0 text-ink/25 transition hover:text-rose-500" data-wish-remove="' +
                  product.id + '" aria-label="Remove ' + HOG.escape(product.name) + ' from wishlist">' +
                  '<svg class="h-3.5 w-3.5"><use href="#i-close"/></svg></button>' +
              "</div>" +
              '<p class="mt-0.5 text-[10px] text-ink/40">' + HOG.escape(HOG.categoryLabel(product.category)) + "</p>" +
              '<div class="mt-2 flex items-center justify-between gap-2">' +
                '<p class="text-xs font-extrabold text-violet">' + HOG.money(product.price) + "</p>" +
                '<button type="button" class="inline-flex items-center gap-1 rounded-full bg-violet-50 px-2.5 py-1 text-[10px] font-extrabold text-violet transition hover:bg-violet" ' +
                  'data-wish-add="' + product.id + '"><svg class="h-3 w-3"><use href="#i-bag"/></svg>Add to bag</button>' +
              "</div>" +
            "</div>" +
          "</div>"
        );
      })
      .join("");

    const empty = $("#wishlistEmpty");
    if (empty) {
      empty.classList.toggle("hidden", state.wishlist.length > 0);
      empty.classList.toggle("flex", state.wishlist.length === 0);
    }
    HOG.updateWishButtons();
    HOG.updateBadges();
  };

  HOG.toggleWishlist = (id) => {
    const product = HOG.productById(id);
    if (!product) return;
    const index = state.wishlist.indexOf(id);
    if (index >= 0) {
      state.wishlist.splice(index, 1);
      HOG.toast(product.name + " removed from your wishlist.", "info");
    } else {
      state.wishlist.push(id);
      HOG.toast(product.name + " saved to your wishlist.", "success");
      badgePop($("#wishCount"));
    }
    persistWish();
    HOG.renderWishlist();
  };

  /* ---------------------------------------------------------------------- */
  /* Quick view                                                             */
  /* ---------------------------------------------------------------------- */
  HOG.openQuickView = (id) => {
    const product = HOG.productById(id);
    if (!product) return;
    state.quickView = {
      id,
      qty: 1,
      size: product.sizes[0] || "One Size",
      color: (product.colors[0] && product.colors[0].name) || ""
    };
    HOG.closeSearch();
    HOG.renderQuickView();
    HOG.openModal("quickViewModal");
  };

  HOG.renderQuickView = () => {
    const qv = state.quickView;
    if (!qv) return;
    const product = HOG.productById(qv.id);
    if (!product) return;
    const off = product.compareAt > product.price
      ? Math.round(((product.compareAt - product.price) / product.compareAt) * 100)
      : 0;

    const setText = (id, value) => {
      const el = document.getElementById(id);
      if (el) el.textContent = value;
    };
    const setHtml = (id, value) => {
      const el = document.getElementById(id);
      if (el) el.innerHTML = value;
    };

    const image = $("#qvImage");
    if (image) {
      image.src = product.image;
      image.alt = product.name;
    }
    const badge = $("#qvBadge");
    if (badge) {
      badge.textContent = off > 0 ? "-" + off + "%" : "";
      badge.classList.toggle("hidden", off === 0);
    }
    const isNew = $("#qvNew");
    if (isNew) isNew.classList.toggle("hidden", !product.tags.includes("new"));

    setText("qvCategory", HOG.categoryLabel(product.category));
    setText("qvName", product.name);
    setHtml("qvStars", HOG.starMarkup(product.rating));
    setText("qvRating", String(product.rating));
    setText("qvReviews", "(" + product.reviews + " reviews)");
    setText("qvPrice", HOG.money(product.price));
    setText("qvDesc", product.description);

    const compare = $("#qvCompare");
    if (compare) {
      compare.textContent = off > 0 ? HOG.money(product.compareAt) : "";
      compare.classList.toggle("hidden", off === 0);
    }
    const save = $("#qvSave");
    if (save) {
      save.textContent = off > 0 ? "Save " + HOG.money(product.compareAt - product.price) : "";
      save.classList.toggle("hidden", off === 0);
    }

    setText("qvColorName", qv.color || "Default");
    setHtml(
      "qvColors",
      product.colors
        .map(
          (color) =>
            '<button type="button" class="color-chip' + (color.name === qv.color ? " is-active" : "") +
            '" style="--swatch:' + HOG.escape(color.hex) + '" data-qv-color="' + HOG.escape(color.name) +
            '" aria-label="' + HOG.escape(color.name) + '" title="' + HOG.escape(color.name) + '"></button>'
        )
        .join("")
    );

    setHtml(
      "qvSizes",
      product.sizes
        .map(
          (size) =>
            '<button type="button" class="size-chip' + (size === qv.size ? " is-active" : "") +
            '" data-qv-size="' + HOG.escape(size) + '">' + HOG.escape(size) + "</button>"
        )
        .join("")
    );

    setText("qvQty", String(qv.qty));
    const stock = $("#qvStock");
    if (stock) {
      const low = product.stock <= 12;
      stock.textContent = low
        ? "Only " + product.stock + " left — order soon"
        : "In stock · ready to ship in 24 hours";
      stock.className = "mt-2.5 text-[10px] font-semibold " + (low ? "text-amber-600" : "text-emerald-600");
    }

    const minus = $("#qvMinus");
    const plus = $("#qvPlus");
    if (minus) minus.disabled = qv.qty <= 1;
    if (plus) plus.disabled = qv.qty >= product.stock;

    const wish = $("#qvWish");
    if (wish) {
      const active = state.wishlist.includes(product.id);
      wish.classList.toggle("is-wished", active);
      wish.setAttribute("aria-label", active ? "Remove from wishlist" : "Add to wishlist");
    }
  };

  HOG.setQuickColor = (name) => {
    if (!state.quickView) return;
    state.quickView.color = name;
    HOG.renderQuickView();
  };

  HOG.setQuickSize = (size) => {
    if (!state.quickView) return;
    state.quickView.size = size;
    HOG.renderQuickView();
  };

  /* ---------------------------------------------------------------------- */
  /* Init                                                                   */
  /* ---------------------------------------------------------------------- */
  function init() {
    $("#qvMinus")?.addEventListener("click", () => {
      if (!state.quickView) return;
      state.quickView.qty = Math.max(1, state.quickView.qty - 1);
      HOG.renderQuickView();
    });
    $("#qvPlus")?.addEventListener("click", () => {
      if (!state.quickView) return;
      const product = HOG.productById(state.quickView.id);
      if (!product) return;
      state.quickView.qty = Math.min(product.stock, state.quickView.qty + 1);
      HOG.renderQuickView();
    });
    $("#qvAdd")?.addEventListener("click", () => {
      const qv = state.quickView;
      if (!qv) return;
      HOG.addToCart(qv.id, { qty: qv.qty, size: qv.size, color: qv.color });
      HOG.closeModal("quickViewModal");
    });
    $("#qvWish")?.addEventListener("click", () => {
      if (state.quickView) HOG.toggleWishlist(state.quickView.id);
    });
    $("#cartCheckoutBtn")?.addEventListener("click", () => {
      if (!state.cart.length) {
        HOG.toast("Your bag is empty — add a piece first.", "error");
        return;
      }
      HOG.closeCart();
      if (HOG.openCheckout) HOG.openCheckout();
      else HOG.toast("Checkout is ready in the full build.", "info");
    });

    HOG.renderCart();
    HOG.renderWishlist();
    HOG.updateWishButtons();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
