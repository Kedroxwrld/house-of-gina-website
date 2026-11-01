/* ==========================================================================
   HOUSE OF GINA — Admin dashboard (demo)
   Login gate, metrics, chart, status, tables, order modal and CMS editor.
   ========================================================================== */
(function () {
  "use strict";

  const HOG = window.HOG;
  if (!HOG) return;
  const $ = HOG.$;
  const $$ = HOG.$$;
  const state = HOG.state;

  const admin = {
    orders: ORDERS.map((order) => Object.assign({}, order)),
    orderQuery: "",
    orderStatus: "all",
    productQuery: "",
    chartPeriod: "7d",
    activeOrder: null,
    loggedIn: false
  };

  const HOGAdmin = (window.HOGAdmin = window.HOGAdmin || {});

  /* ---------------------------------------------------------------------- */
  /* Session                                                                */
  /* ---------------------------------------------------------------------- */
  function hasSession() {
    try {
      return Boolean(sessionStorage.getItem(HOG.keys.admin));
    } catch (err) {
      return false;
    }
  }
  function setSession() {
    try {
      sessionStorage.setItem(HOG.keys.admin, JSON.stringify({ email: ADMIN_DEMO.email, at: Date.now() }));
    } catch (err) {
      /* noop */
    }
  }
  function clearSession() {
    try {
      sessionStorage.removeItem(HOG.keys.admin);
    } catch (err) {
      /* noop */
    }
  }

  function showDashboard(loggedIn) {
    admin.loggedIn = loggedIn;
    const gate = $("#adminGate");
    const dashboard = $("#adminDashboard");
    if (gate) gate.hidden = loggedIn;
    if (dashboard) dashboard.hidden = !loggedIn;
    if (loggedIn) {
      renderAll();
      countUpMetrics();
    }
  }

  /* ---------------------------------------------------------------------- */
  /* Metrics                                                                */
  /* ---------------------------------------------------------------------- */
  function formatMetric(el, value) {
    const prefix = el.dataset.prefix || "";
    const suffix = el.dataset.suffix || "";
    const decimals = Number(el.dataset.decimals || 0);
    el.textContent =
      prefix +
      Number(value).toLocaleString("en-US", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
      }) +
      suffix;
  }

  function countUpMetrics() {
    $$("[data-metric]").forEach((el) => {
      const target = Number(el.dataset.target) || 0;
      const duration = 1200;
      const start = performance.now();
      const ease = (t) => 1 - Math.pow(1 - t, 3);
      const step = (now) => {
        const progress = Math.min(1, (now - start) / duration);
        formatMetric(el, target * ease(progress));
        if (progress < 1) requestAnimationFrame(step);
        else formatMetric(el, target);
      };
      requestAnimationFrame(step);
    });
  }

  /* ---------------------------------------------------------------------- */
  /* Revenue chart                                                          */
  /* ---------------------------------------------------------------------- */
  function renderChart(period) {
    const data = REVENUE_DATA[period] || REVENUE_DATA["7d"];
    admin.chartPeriod = period;
    const wrap = $("#revenueChart");
    const labels = $("#chartLabels");
    if (!wrap) return;
    const max = Math.max(...data.values, 1);
    wrap.innerHTML = data.values
      .map((value, index) => {
        const height = Math.max(5, Math.round((value / max) * 100));
        return (
          '<div class="chart-bar" title="' + data.labels[index] + ": $" + value + 'k">' +
            '<div class="chart-bar-fill" style="height:' + height + '%">' +
              '<span class="chart-bar-tip">$' + value + "k</span>" +
            "</div>" +
          "</div>"
        );
      })
      .join("");
    if (labels) labels.innerHTML = data.labels.map((label) => "<span>" + HOG.escape(label) + "</span>").join("");

    const sum = data.values.reduce((total, value) => total + value, 0);
    const totalEl = $("#chartTotal");
    const deltaEl = $("#chartDelta");
    if (totalEl) totalEl.textContent = "$" + Math.round(sum * 1000).toLocaleString("en-US");
    if (deltaEl) deltaEl.textContent = data.delta;

    $$("[data-chart-period]").forEach((button) => {
      const active = button.dataset.chartPeriod === period;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-selected", String(active));
    });
  }

  /* ---------------------------------------------------------------------- */
  /* System status                                                          */
  /* ---------------------------------------------------------------------- */
  function renderUptime() {
    const wrap = $("#uptimeBars");
    if (!wrap) return;
    wrap.innerHTML = Array.from({ length: 30 }, (_, index) => {
      const warn = index === 11 || index === 23;
      return '<span class="uptime-bar' + (warn ? " is-warn" : "") + '" title="Day ' + (30 - index) + ": " +
        (warn ? "99.2%" : "100%") + '"></span>';
    }).join("");
  }

  function runHealthCheck() {
    const button = $("#healthCheckBtn");
    if (button) {
      button.disabled = true;
      button.innerHTML = '<span class="h-3.5 w-3.5 animate-spin rounded-full border-2 border-violet/30 border-t-violet"></span>Checking…';
    }
    setTimeout(() => {
      $$(".status-latency").forEach((el) => {
        const base = { api: 42, db: 12, auth: 68, cdn: 8 }[el.dataset.service] || 30;
        const jitter = Math.round((Math.random() - 0.5) * 16);
        el.textContent = Math.max(4, base + jitter) + "ms";
      });
      const updated = $("#statusUpdated");
      if (updated) updated.textContent = "Last checked at " + new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      if (button) {
        button.disabled = false;
        button.innerHTML = '<svg class="h-3.5 w-3.5"><use href="#i-refresh"/></svg>Run health check';
      }
      HOG.toast("All systems operational — 4/4 services healthy.", "success");
    }, 900);
  }

  /* ---------------------------------------------------------------------- */
  /* Activity                                                               */
  /* ---------------------------------------------------------------------- */
  function renderActivity() {
    const wrap = $("#recentActivity");
    if (!wrap) return;
    const icons = { order: "i-bag", user: "i-users", stock: "i-alert-circle", payout: "i-dollar" };
    const colors = {
      violet: "bg-violet-50 text-violet",
      pink: "bg-pink-50 text-magenta",
      amber: "bg-amber-50 text-amber-500",
      emerald: "bg-emerald-50 text-emerald-600"
    };
    wrap.innerHTML = RECENT_ACTIVITY.map(
      (item) =>
        '<li class="flex items-start gap-2.5">' +
          '<span class="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full ' +
            (colors[item.color] || colors.violet) + '"><svg class="h-3.5 w-3.5"><use href="#' +
            (icons[item.type] || "i-sparkles") + '"/></svg></span>' +
          '<div class="min-w-0 flex-1"><p class="text-[11px] font-extrabold leading-snug">' + HOG.escape(item.title) + "</p>" +
            '<p class="mt-0.5 truncate text-[10px] text-ink/40">' + HOG.escape(item.meta) + "</p></div>" +
          '<span class="shrink-0 text-[9px] text-ink/30">' + HOG.escape(item.time) + "</span>" +
        "</li>"
    ).join("");
  }

  /* ---------------------------------------------------------------------- */
  /* Orders                                                                 */
  /* ---------------------------------------------------------------------- */
  function statusChip(status) {
    return '<span class="status-chip status-' + status.toLowerCase() + '">' + HOG.escape(status) + "</span>";
  }

  function filteredOrders() {
    const query = admin.orderQuery.trim().toLowerCase();
    return admin.orders.filter((order) => {
      if (admin.orderStatus !== "all" && order.status !== admin.orderStatus) return false;
      if (!query) return true;
      return [order.id, order.customer, order.email, order.status].join(" ").toLowerCase().includes(query);
    });
  }

  function renderOrders() {
    const body = $("#ordersTableBody");
    if (!body) return;
    const list = filteredOrders();
    body.innerHTML = list.length
      ? list
          .map(
            (order) =>
              "<tr>" +
                '<td><button type="button" class="font-mono text-[10px] font-extrabold text-violet hover:text-magenta" data-order="' +
                  order.id + '">' + HOG.escape(order.id) + "</button></td>" +
                '<td><p class="text-[11px] font-extrabold">' + HOG.escape(order.customer) + "</p>" +
                  '<p class="text-[9px] text-ink/40">' + HOG.escape(order.email) + "</p></td>" +
                '<td class="hidden md:table-cell text-[10px] text-ink/50">' + HOG.escape(order.date) + "</td>" +
                '<td class="hidden sm:table-cell text-[10px] text-ink/50">' + order.items + "</td>" +
                '<td class="text-[11px] font-extrabold">' + HOG.money(order.total, true) + "</td>" +
                "<td>" + statusChip(order.status) + "</td>" +
                '<td><button type="button" class="text-ink/30 transition hover:text-violet" data-order="' + order.id +
                  '" aria-label="View order ' + HOG.escape(order.id) + '"><svg class="h-3.5 w-3.5"><use href="#i-chevron-right"/></svg></button></td>' +
              "</tr>"
          )
          .join("")
      : '<tr><td colspan="7" class="py-8 text-center text-[11px] text-ink/40">No orders match that search.</td></tr>';

    const count = $("#ordersTableCount");
    if (count) count.textContent = "Showing " + list.length + " of " + admin.orders.length + " orders";
  }

  function openOrder(id) {
    const order = admin.orders.find((entry) => entry.id === id);
    if (!order) return;
    admin.activeOrder = order;
    const title = $("#orderModalTitle");
    const body = $("#orderModalBody");
    if (title) title.textContent = "#" + order.id;
    if (body) {
      body.innerHTML =
        '<div class="flex items-start justify-between gap-3 rounded-2xl bg-violet-50/60 p-3.5">' +
          '<div><p class="text-[9px] font-bold uppercase tracking-[.18em] text-ink/35">Customer</p>' +
            '<p class="mt-0.5 text-sm font-extrabold">' + HOG.escape(order.customer) + "</p>" +
            '<p class="text-[10px] text-ink/45">' + HOG.escape(order.email) + "</p></div>" +
          statusChip(order.status) +
        "</div>" +
        '<div class="mt-3 grid grid-cols-2 gap-2">' +
          '<div class="rounded-xl border border-ink/5 p-3"><p class="text-[9px] font-bold uppercase tracking-wider text-ink/35">Date</p>' +
            '<p class="mt-1 text-[11px] font-extrabold">' + HOG.escape(order.date) + "</p></div>" +
          '<div class="rounded-xl border border-ink/5 p-3"><p class="text-[9px] font-bold uppercase tracking-wider text-ink/35">Items</p>' +
            '<p class="mt-1 text-[11px] font-extrabold">' + order.items + " piece" + (order.items === 1 ? "" : "s") + "</p></div>" +
          '<div class="rounded-xl border border-ink/5 p-3"><p class="text-[9px] font-bold uppercase tracking-wider text-ink/35">Total</p>' +
            '<p class="mt-1 text-[11px] font-extrabold text-violet">' + HOG.money(order.total, true) + "</p></div>" +
          '<div class="rounded-xl border border-ink/5 p-3"><p class="text-[9px] font-bold uppercase tracking-wider text-ink/35">Channel</p>' +
            '<p class="mt-1 text-[11px] font-extrabold">Online store</p></div>' +
        "</div>" +
        '<div class="mt-3 rounded-2xl border border-ink/5 p-3.5">' +
          '<p class="text-[9px] font-bold uppercase tracking-[.18em] text-ink/35">Fulfilment timeline</p>' +
          '<ol class="mt-3 space-y-2.5">' +
            ["Order placed", "Payment confirmed", "Packed & shipped", "Delivered"].map((step, index) => {
              const done = ["Delivered", "Paid"].includes(order.status) || (order.status === "Shipped" && index < 3) ||
                (order.status === "Processing" && index < 2);
              return '<li class="flex items-center gap-2.5 text-[10px] ' + (done ? "font-bold text-ink/70" : "text-ink/35") + '">' +
                '<span class="grid h-4 w-4 place-items-center rounded-full ' + (done ? "bg-emerald-50 text-emerald-600" : "bg-ink/5 text-ink/30") + '">' +
                '<svg class="h-2.5 w-2.5"><use href="#i-' + (done ? "check" : "clock") + '"/></svg></span>' + step + "</li>";
            }).join("") +
          "</ol>" +
        "</div>" +
        '<p class="mt-3 text-[9px] leading-relaxed text-ink/35">Demo record — status changes update this session only.</p>';
    }
    const advance = $("#orderAdvanceBtn");
    if (advance) {
      advance.disabled = order.status === "Refunded";
      advance.dataset.orderId = order.id;
      advance.innerHTML = order.status === "Refunded"
        ? "No further action"
        : 'Advance status <svg class="h-3.5 w-3.5"><use href="#i-arrow-right"/></svg>';
    }
    HOG.openModal("orderModal");
  }

  function advanceOrder() {
    const order = admin.activeOrder;
    if (!order) return;
    const flow = { Processing: "Shipped", Shipped: "Delivered", Paid: "Delivered", Delivered: "Delivered" };
    const next = flow[order.status];
    if (!next || order.status === "Refunded") return;
    if (next === order.status) {
      HOG.toast("This order is already delivered.", "info");
      return;
    }
    order.status = next;
    renderOrders();
    openOrder(order.id);
    HOG.toast("Order " + order.id + " marked as " + next.toLowerCase() + ".", "success");
  }

  /* ---------------------------------------------------------------------- */
  /* Products                                                               */
  /* ---------------------------------------------------------------------- */
  function renderProducts() {
    const body = $("#productsTableBody");
    if (!body) return;
    const query = admin.productQuery.trim().toLowerCase();
    const list = PRODUCTS.filter((product) => {
      if (!query) return true;
      return [product.name, product.category, HOG.categoryLabel(product.category), product.id]
        .join(" ")
        .toLowerCase()
        .includes(query);
    });

    body.innerHTML = list.length
      ? list
          .map(
            (product) =>
              "<tr>" +
                '<td><div class="flex items-center gap-2"><img src="' + HOG.escape(product.image) +
                  '" alt="" class="h-9 w-7 rounded-md object-cover" loading="lazy">' +
                  '<div class="min-w-0"><p class="truncate text-[11px] font-extrabold">' + HOG.escape(product.name) + "</p>" +
                  '<p class="text-[9px] text-ink/35">' + HOG.escape(product.id.toUpperCase()) + "</p></div></div></td>" +
                '<td class="hidden sm:table-cell text-[10px] text-ink/50">' + HOG.escape(HOG.categoryLabel(product.category)) + "</td>" +
                '<td class="text-[11px] font-extrabold">' + HOG.money(product.price) + "</td>" +
                '<td><div class="flex items-center gap-1">' +
                  '<button type="button" class="grid h-5 w-5 place-items-center rounded border border-ink/10 text-ink/45 transition hover:border-violet hover:text-violet" data-stock-delta="-1" data-product-id="' +
                    product.id + '" aria-label="Decrease stock for ' + HOG.escape(product.name) + '"><svg class="h-2.5 w-2.5"><use href="#i-minus"/></svg></button>' +
                  '<span class="w-7 text-center text-[10px] font-extrabold ' + (product.stock <= 12 ? "text-amber-600" : "") + '">' +
                    product.stock + "</span>" +
                  '<button type="button" class="grid h-5 w-5 place-items-center rounded border border-ink/10 text-ink/45 transition hover:border-violet hover:text-violet" data-stock-delta="1" data-product-id="' +
                    product.id + '" aria-label="Increase stock for ' + HOG.escape(product.name) + '"><svg class="h-2.5 w-2.5"><use href="#i-plus"/></svg></button>' +
                "</div></td>" +
                '<td class="hidden md:table-cell"><span class="status-chip ' + (product.stock > 0 ? "status-active" : "status-draft") + '">' +
                  (product.stock > 0 ? "Active" : "Draft") + "</span></td>" +
                '<td><button type="button" class="text-ink/30 transition hover:text-violet" data-demo-toast="Edit ' +
                  HOG.escape(product.name) + ' (demo)" aria-label="Edit ' + HOG.escape(product.name) + '">' +
                  '<svg class="h-3.5 w-3.5"><use href="#i-edit"/></svg></button></td>' +
              "</tr>"
          )
          .join("")
      : '<tr><td colspan="6" class="py-8 text-center text-[11px] text-ink/40">No products match that search.</td></tr>';

    const count = $("#productsTableCount");
    if (count) count.textContent = "Showing " + list.length + " of " + PRODUCTS.length + " products";
    const low = $("#lowStockCount");
    if (low) low.textContent = String(PRODUCTS.filter((product) => product.stock <= 12).length);
  }

  function changeStock(id, delta) {
    const product = HOG.productById(id);
    if (!product) return;
    const next = product.stock + delta;
    if (next < 0) {
      HOG.toast("Stock cannot go below zero.", "error");
      return;
    }
    product.stock = next;
    renderProducts();
    HOG.toast(product.name + " stock updated to " + next + ".", next <= 12 ? "info" : "success");
  }

  /* ---------------------------------------------------------------------- */
  /* CSV export                                                             */
  /* ---------------------------------------------------------------------- */
  function csvEscape(value) {
    const text = String(value == null ? "" : value);
    return /[",\n]/.test(text) ? '"' + text.replace(/"/g, '""') + '"' : text;
  }

  function exportCsv() {
    const list = filteredOrders();
    const rows = [
      ["Order", "Customer", "Email", "Date", "Items", "Total", "Status"],
      ...list.map((order) => [order.id, order.customer, order.email, order.date, order.items, order.total, order.status])
    ];
    const csv = rows.map((row) => row.map(csvEscape).join(",")).join("\r\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "house-of-gina-orders.csv";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    HOG.toast("Exported " + list.length + " order" + (list.length === 1 ? "" : "s") + " to CSV.", "success");
  }

  /* ---------------------------------------------------------------------- */
  /* CMS                                                                    */
  /* ---------------------------------------------------------------------- */
  function cmsValues() {
    return {
      announcement: $("#cmsAnnouncement")?.value.trim() || "",
      eyebrow: $("#cmsEyebrow")?.value.trim() || "",
      headline: $("#cmsHeadline")?.value.trim() || "",
      subcopy: $("#cmsSubcopy")?.value.trim() || "",
      cta: $("#cmsCta")?.value.trim() || ""
    };
  }

  function updateCounts() {
    $$("[data-cms-count]").forEach((el) => {
      const input = document.getElementById(el.dataset.cmsCount);
      if (!input) return;
      el.textContent = input.value.length + "/" + input.maxLength;
    });
  }

  function updateCmsPreview() {
    const values = cmsValues();
    const set = (id, value) => {
      const el = document.getElementById(id);
      if (el) el.textContent = value;
    };
    set("cmsPreviewAnnouncement", values.announcement || CMS_DEFAULTS.announcement);
    set("cmsPreviewEyebrow", values.eyebrow || CMS_DEFAULTS.eyebrow);
    set("cmsPreviewSubcopy", values.subcopy || CMS_DEFAULTS.subcopy);
    set("cmsPreviewCta", values.cta || CMS_DEFAULTS.cta);
    const headline = $("#cmsPreviewHeadline");
    if (headline) headline.innerHTML = HOG.splitHeadline(values.headline || CMS_DEFAULTS.headline);
    updateCounts();
  }

  function fillCmsForm() {
    const cms = state.cms;
    const map = {
      cmsAnnouncement: cms.announcement,
      cmsEyebrow: cms.eyebrow,
      cmsHeadline: cms.headline,
      cmsSubcopy: cms.subcopy,
      cmsCta: cms.cta
    };
    Object.entries(map).forEach(([id, value]) => {
      const input = document.getElementById(id);
      if (input) input.value = value;
    });
    updateCmsPreview();
    const status = $("#cmsStatus");
    if (status) status.textContent = "";
  }

  /* ---------------------------------------------------------------------- */
  /* Render + bind                                                          */
  /* ---------------------------------------------------------------------- */
  function renderAll() {
    renderChart(admin.chartPeriod);
    renderUptime();
    renderActivity();
    renderOrders();
    renderProducts();
    fillCmsForm();
  }

  function bindLogin() {
    $("#adminLoginForm")?.addEventListener("submit", (event) => {
      event.preventDefault();
      const email = ($("#adminEmail")?.value || "").trim().toLowerCase();
      const password = $("#adminPassword")?.value || "";
      const error = $("#adminLoginError");
      if (email !== ADMIN_DEMO.email.toLowerCase() || password !== ADMIN_DEMO.password) {
        if (error) {
          error.textContent = "Those credentials don’t match the demo account. Try admin@houseofgina.com / gina2026.";
          error.classList.remove("hidden");
        }
        HOG.toast("Sign-in failed — check the demo credentials.", "error");
        return;
      }
      if (error) error.classList.add("hidden");
      setSession();
      showDashboard(true);
      HOG.toast("Welcome back, Gina. Dashboard unlocked.", "success");
    });

    $("#adminDemoFill")?.addEventListener("click", () => {
      const email = $("#adminEmail");
      const password = $("#adminPassword");
      if (email) email.value = ADMIN_DEMO.email;
      if (password) password.value = ADMIN_DEMO.password;
      $("#adminLoginError")?.classList.add("hidden");
      email?.focus();
      HOG.toast("Demo credentials filled.", "info");
    });

    $("#adminLogout")?.addEventListener("click", () => {
      clearSession();
      showDashboard(false);
      HOG.toast("Signed out of the admin demo.", "info");
    });
  }

  function bindDashboard() {
    $$("[data-chart-period]").forEach((button) => {
      button.addEventListener("click", () => renderChart(button.dataset.chartPeriod));
    });

    $("#adminDateRange")?.addEventListener("change", (event) => {
      const map = {
        "Last 7 days": "7d",
        "Last 30 days": "30d",
        "This quarter": "12m",
        "This year": "12m"
      };
      renderChart(map[event.target.value] || "7d");
    });

    $$("[data-admin-tab]").forEach((button) => {
      button.addEventListener("click", () => {
        const tab = button.dataset.adminTab;
        $$("[data-admin-tab]").forEach((other) => {
          const active = other.dataset.adminTab === tab;
          other.classList.toggle("is-active", active);
          other.setAttribute("aria-selected", String(active));
        });
        const orders = $("#adminPanelOrders");
        const products = $("#adminPanelProducts");
        if (orders) orders.hidden = tab !== "orders";
        if (products) products.hidden = tab !== "products";
      });
    });

    $("#adminSearchOrders")?.addEventListener("input", (event) => {
      admin.orderQuery = event.target.value;
      renderOrders();
    });
    $("#adminStatusFilter")?.addEventListener("change", (event) => {
      admin.orderStatus = event.target.value;
      renderOrders();
    });
    $("#adminSearchProducts")?.addEventListener("input", (event) => {
      admin.productQuery = event.target.value;
      renderProducts();
    });
    $("#exportCsvBtn")?.addEventListener("click", exportCsv);
    $("#healthCheckBtn")?.addEventListener("click", runHealthCheck);
    $("#orderAdvanceBtn")?.addEventListener("click", advanceOrder);

    document.addEventListener("click", (event) => {
      const orderButton = event.target.closest("[data-order]");
      if (orderButton) {
        event.preventDefault();
        openOrder(orderButton.dataset.order);
        return;
      }
      const stockButton = event.target.closest("[data-stock-delta]");
      if (stockButton) {
        event.preventDefault();
        changeStock(stockButton.dataset.productId, Number(stockButton.dataset.stockDelta));
      }
    });

    const cmsForm = $("#cmsForm");
    cmsForm?.addEventListener("input", () => {
      updateCmsPreview();
      const status = $("#cmsStatus");
      if (status) {
        status.textContent = "Draft preview — publish to go live";
        status.className = "ml-auto text-[10px] font-semibold text-amber-600";
      }
    });
    cmsForm?.addEventListener("submit", (event) => {
      event.preventDefault();
      const values = cmsValues();
      if (!values.headline || !values.announcement || !values.eyebrow || !values.subcopy || !values.cta) {
        HOG.toast("Fill in every field before publishing.", "error");
        return;
      }
      HOG.saveCms(values);
      const status = $("#cmsStatus");
      if (status) {
        status.textContent = "Published just now";
        status.className = "ml-auto text-[10px] font-semibold text-emerald-600";
      }
      fillCmsForm();
      const statusAfter = $("#cmsStatus");
      if (statusAfter) statusAfter.textContent = "Published just now";
    });

    $("#cmsReset")?.addEventListener("click", () => {
      HOG.resetCms();
      fillCmsForm();
      const status = $("#cmsStatus");
      if (status) {
        status.textContent = "Reset to defaults";
        status.className = "ml-auto text-[10px] font-semibold text-ink/40";
      }
    });
  }

  HOGAdmin.init = () => {
    bindLogin();
    bindDashboard();
    showDashboard(hasSession());
  };

  HOGAdmin.onRoute = (route) => {
    if (route && route.name === "admin") showDashboard(hasSession());
  };

  HOGAdmin.refresh = renderAll;
})();
