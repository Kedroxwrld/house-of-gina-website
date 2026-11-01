/* ==========================================================================
   HOUSE OF GINA — Account, contact form and checkout
   ========================================================================== */
(function () {
  "use strict";

  const HOG = window.HOG;
  if (!HOG) return;
  const $ = HOG.$;
  const state = HOG.state;

  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  function initials(name, email) {
    const source = String(name || email || "G").trim();
    const parts = source.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return source.slice(0, 2).toUpperCase();
  }

  function showError(id, message) {
    const el = document.querySelector('[data-error-for="' + id + '"]');
    if (el) el.textContent = message || "";
    const field = document.getElementById(id);
    if (field && field.type !== "checkbox") field.classList.toggle("is-invalid", Boolean(message));
  }

  function clearError(id) {
    showError(id, "");
  }

  /* ---------------------------------------------------------------------- */
  /* Account                                                                */
  /* ---------------------------------------------------------------------- */
  HOG.renderAccount = () => {
    const initialsEl = $("#accountInitials");
    const icon = $("[data-account-icon]");
    const button = $("#accountBtn");
    if (state.user) {
      if (initialsEl) {
        initialsEl.textContent = initials(state.user.name, state.user.email);
        initialsEl.classList.remove("hidden");
      }
      icon?.classList.add("hidden");
      button?.setAttribute("aria-label", "Account — " + (state.user.name || state.user.email));
    } else {
      initialsEl?.classList.add("hidden");
      icon?.classList.remove("hidden");
      button?.setAttribute("aria-label", "Account");
    }
  };

  function renderAuthState() {
    const forms = $("#authForms");
    const signed = $("#authSignedIn");
    if (!forms || !signed) return;
    if (state.user) {
      forms.classList.add("hidden");
      signed.classList.remove("hidden");
      const name = $("#authUserName");
      const email = $("#authUserEmail");
      const avatar = $("#authAvatar");
      if (name) name.textContent = state.user.name || "House of Gina member";
      if (email) email.textContent = state.user.email;
      if (avatar) avatar.textContent = initials(state.user.name, state.user.email);
    } else {
      forms.classList.remove("hidden");
      signed.classList.add("hidden");
    }
  }

  HOG.setAuthTab = (tab) => {
    const isRegister = tab === "register";
    HOG.$$("[data-auth-tab]").forEach((button) => {
      const active = button.dataset.authTab === tab;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-selected", String(active));
    });
    $("#signinForm")?.classList.toggle("hidden", isRegister);
    $("#registerForm")?.classList.toggle("hidden", !isRegister);
    const title = $("#authTitle");
    if (title) title.textContent = isRegister ? "Create your account" : "Welcome to the House";
    $("#signinError")?.classList.add("hidden");
    $("#registerError")?.classList.add("hidden");
  };

  HOG.openAuth = () => {
    renderAuthState();
    if (!state.user) HOG.setAuthTab("signin");
    HOG.openModal("authModal");
  };

  function signIn(user, message) {
    state.user = user;
    HOG.storage.set(HOG.keys.user, user);
    HOG.renderAccount();
    renderAuthState();
    HOG.toast(message, "success");
  }

  function signOut() {
    state.user = null;
    HOG.storage.remove(HOG.keys.user);
    HOG.renderAccount();
    renderAuthState();
    HOG.setAuthTab("signin");
    HOG.toast("You’ve been signed out.", "info");
  }

  function bindAuth() {
    $("#signinForm")?.addEventListener("submit", (event) => {
      event.preventDefault();
      const email = ($("#signinEmail")?.value || "").trim();
      const password = $("#signinPassword")?.value || "";
      const error = $("#signinError");
      let message = "";
      if (!EMAIL_RE.test(email)) message = "Enter a valid email address.";
      else if (password.length < 6) message = "Your password must be at least 6 characters.";
      if (message) {
        if (error) {
          error.textContent = message;
          error.classList.remove("hidden");
        }
        return;
      }
      if (error) error.classList.add("hidden");
      const name = email.split("@")[0].replace(/[._-]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
      signIn({ name, email }, "Demo sign-in complete — no account was checked.");
      event.target.reset();
    });

    $("#registerForm")?.addEventListener("submit", (event) => {
      event.preventDefault();
      const name = ($("#registerName")?.value || "").trim();
      const email = ($("#registerEmail")?.value || "").trim();
      const password = $("#registerPassword")?.value || "";
      const confirm = $("#registerConfirm")?.value || "";
      const terms = $("#registerTerms")?.checked;
      const error = $("#registerError");
      let message = "";
      if (name.length < 2) message = "Please enter your full name.";
      else if (!EMAIL_RE.test(email)) message = "Enter a valid email address.";
      else if (password.length < 6) message = "Use at least 6 characters for your password.";
      else if (password !== confirm) message = "Passwords do not match.";
      else if (!terms) message = "Please accept the Terms and Privacy Policy.";
      if (message) {
        if (error) {
          error.textContent = message;
          error.classList.remove("hidden");
        }
        return;
      }
      if (error) error.classList.add("hidden");
      signIn({ name, email }, "Demo account preview — no account was created.");
      event.target.reset();
    });

    $("#authSignOut")?.addEventListener("click", signOut);
  }

  /* ---------------------------------------------------------------------- */
  /* Contact                                                                */
  /* ---------------------------------------------------------------------- */
  function bindContact() {
    const form = $("#contactForm");
    if (!form) return;
    const message = $("#contactMessage");
    const counter = $("#contactCharCount");

    const updateCount = () => {
      if (!message || !counter) return;
      if (message.value.length > 600) message.value = message.value.slice(0, 600);
      counter.textContent = message.value.length + " / 600";
    };
    message?.addEventListener("input", updateCount);
    updateCount();

    form.addEventListener("input", (event) => {
      if (event.target.id) clearError(event.target.id);
    });

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const name = ($("#contactName")?.value || "").trim();
      const email = ($("#contactEmail")?.value || "").trim();
      const phone = ($("#contactPhone")?.value || "").trim();
      const subject = $("#contactSubject")?.value || "";
      const body = (message?.value || "").trim();
      const consent = $("#contactConsent")?.checked;

      let valid = true;
      if (name.length < 2) { showError("contactName", "Please tell us your name."); valid = false; }
      if (!EMAIL_RE.test(email)) { showError("contactEmail", "Enter a valid email address."); valid = false; }
      if (phone && phone.replace(/\D/g, "").length < 7) { showError("contactPhone", "That phone number looks too short."); valid = false; }
      if (!subject) { showError("contactSubject", "Choose a topic so we can route your message."); valid = false; }
      if (body.length < 10) { showError("contactMessage", "Add a little more detail (10+ characters)."); valid = false; }
      if (!consent) { showError("contactConsent", "Please agree to be contacted about your enquiry."); valid = false; }
      if (!valid) return;

      form.reset();
      updateCount();
      $("#contactFormWrap")?.classList.add("hidden");
      $("#contactSuccess")?.classList.remove("hidden");
      HOG.toast("Demo only — your message was not sent or saved.", "info");
    });

    $("#contactReset")?.addEventListener("click", () => {
      $("#contactSuccess")?.classList.add("hidden");
      $("#contactFormWrap")?.classList.remove("hidden");
      $("#contactName")?.focus();
    });
  }

  /* ---------------------------------------------------------------------- */
  /* Checkout                                                               */
  /* ---------------------------------------------------------------------- */
  function renderCheckoutSummary() {
    const wrap = $("#checkoutItems");
    if (!wrap) return;
    wrap.innerHTML = state.cart
      .map((item) => {
        const product = HOG.productById(item.id);
        if (!product) return "";
        return (
          '<div class="flex items-center gap-2.5">' +
            '<img src="' + HOG.escape(product.image) + '" alt="" class="h-14 w-11 shrink-0 rounded-lg object-cover">' +
            '<div class="min-w-0 flex-1">' +
              '<p class="truncate text-[11px] font-extrabold">' + HOG.escape(product.name) + "</p>" +
              '<p class="text-[9px] text-ink/40">' + (item.size ? HOG.escape(item.size) + " · " : "") +
                HOG.escape(item.color || "") + " · Qty " + item.qty + "</p>" +
            "</div>" +
            '<p class="shrink-0 text-[11px] font-extrabold">' + HOG.money(product.price * item.qty) + "</p>" +
          "</div>"
        );
      })
      .join("");

    const totals = HOG.cartTotals();
    const subtotal = $("#checkoutSubtotal");
    const shipping = $("#checkoutShipping");
    const total = $("#checkoutTotal");
    if (subtotal) subtotal.textContent = HOG.money(totals.subtotal, true);
    if (shipping) shipping.textContent = totals.shipping === 0 ? "Free" : HOG.money(totals.shipping, true);
    if (total) total.textContent = HOG.money(totals.total, true);
  }

  function setCardVisibility() {
    const method = document.querySelector('input[name="payment"]:checked')?.value || "card";
    $("#cardFields")?.classList.toggle("hidden", method !== "card");
  }

  HOG.openCheckout = () => {
    if (!state.cart.length) {
      HOG.toast("Your bag is empty — add a piece first.", "error");
      return;
    }
    $("#checkoutWrap")?.classList.remove("hidden");
    $("#checkoutSuccess")?.classList.add("hidden");
    $("#checkoutError")?.classList.add("hidden");

    if (state.user) {
      const name = $("#checkoutName");
      const email = $("#checkoutEmail");
      if (name && !name.value) name.value = state.user.name || "";
      if (email && !email.value) email.value = state.user.email || "";
    }
    setCardVisibility();
    renderCheckoutSummary();
    HOG.openModal("checkoutModal");
  };

  function bindCheckout() {
    const form = $("#checkoutForm");
    if (!form) return;

    form.addEventListener("change", (event) => {
      if (event.target.name === "payment") setCardVisibility();
    });

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const name = ($("#checkoutName")?.value || "").trim();
      const phone = ($("#checkoutPhone")?.value || "").trim();
      const email = ($("#checkoutEmail")?.value || "").trim();
      const address = ($("#checkoutAddress")?.value || "").trim();
      const city = ($("#checkoutCity")?.value || "").trim();
      const error = $("#checkoutError");

      let message = "";
      if (name.length < 2) message = "Please enter your full name.";
      else if (phone.replace(/\D/g, "").length < 7) message = "Enter a valid phone number.";
      else if (!EMAIL_RE.test(email)) message = "Enter a valid email address.";
      else if (address.length < 4) message = "Add your delivery address.";
      else if (city.length < 2) message = "Add your city.";

      if (message) {
        if (error) {
          error.textContent = message;
          error.classList.remove("hidden");
        }
        return;
      }
      if (error) error.classList.add("hidden");

      const button = $("#checkoutPlaceBtn");
      const original = button ? button.innerHTML : "";
      if (button) {
        button.disabled = true;
        button.innerHTML = '<span class="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"></span>Processing…';
      }

      setTimeout(() => {
        const orderId = "HG-" + (10483 + Math.floor(Math.random() * 400));
        const total = HOG.cartTotals().total;
        state.checkoutOrder = { id: orderId, total };
        HOG.clearCart();
        const orderEl = $("#checkoutOrderId");
        if (orderEl) orderEl.textContent = "#" + orderId;
        $("#checkoutWrap")?.classList.add("hidden");
        $("#checkoutSuccess")?.classList.remove("hidden");
        if (button) {
          button.disabled = false;
          button.innerHTML = original;
        }
        form.reset();
        HOG.toast("Demo order complete — no payment or email was processed.", "info");
      }, 1000);
    });
  }

  /* ---------------------------------------------------------------------- */
  /* Init                                                                   */
  /* ---------------------------------------------------------------------- */
  function init() {
    HOG.renderAccount();
    renderAuthState();
    bindAuth();
    bindContact();
    bindCheckout();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
