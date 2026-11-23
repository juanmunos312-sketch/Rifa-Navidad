(function () {
  "use strict";
  var C = typeof CONFIG === "undefined" ? null : CONFIG;
  var T = typeof TICKETS === "undefined" ? null : TICKETS;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  if (!C) { document.body.insertAdjacentHTML("afterbegin", '<p style="padding:20px;color:#b91c1c;font:16px sans-serif">No se pudo cargar config.js.</p>'); return; }

  function ic(n) { return '<svg class="i" aria-hidden="true"><use href="#i-' + n + '"/></svg>'; }
  function dots(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, "."); }
  function money(n) { return "$" + dots(n) + " " + C.currency; }
  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function openLink(url) {
    var a = document.createElement("a");
    a.href = url; a.target = "_blank"; a.rel = "noopener noreferrer";
    document.body.appendChild(a); a.click(); a.remove();
  }
  function message(numbers) {
    var list = Array.isArray(numbers) ? numbers : [numbers];
    var joined = list.join(", ");
    var template = C.messageTemplate || "Hola, estoy interesado en comprar {cantidad} {boletas} de la {rifa}: {numeros}. ¿Me puedes indicar cómo realizar el pago?";
    return template.replace("{numero}", joined).replace("{numeros}", joined)
      .replace("{cantidad}", String(list.length)).replace("{boletas}", list.length === 1 ? "boleta" : "boletas")
      .replace("{rifa}", C.name);
  }
  function waUrl(numbers) { return "https://wa.me/" + String(C.whatsapp).replace(/\D/g, "") + "?text=" + encodeURIComponent(message(numbers)); }

  var toastT;
  function toast(msg) {
    var t = $("#toast"); t.textContent = msg; t.classList.add("show");
    clearTimeout(toastT); toastT = setTimeout(function () { t.classList.remove("show"); }, 4200);
  }
  function copyText(s) {
    if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(s);
    return new Promise(function (ok, fail) {
      var ta = document.createElement("textarea"), done = false;
      ta.value = s; ta.setAttribute("readonly", ""); ta.style.cssText = "position:fixed;opacity:0";
      document.body.appendChild(ta); ta.select();
      try { done = document.execCommand("copy"); } catch (e) {}
      ta.remove(); done ? ok() : fail();
    });
  }

  /* ---------- Modal ---------- */
  var overlay = $("#modal"), dlg = $("#dialog"), lastFocus = null, onCloseCb = null;
  function setContent(node) {
    var box = $("#m-content"); box.textContent = ""; box.appendChild(node);
    var f = $("button:not([disabled]):not([data-close]),a[href]", box); (f || dlg).focus();
  }
  function openModal(node, onClose) {
    onCloseCb = onClose || null; lastFocus = document.activeElement;
    overlay.classList.add("open"); overlay.setAttribute("aria-hidden", "false");
    document.body.classList.add("lock"); setContent(node);
  }
  function closeModal() {
    if (!overlay.classList.contains("open")) return;
    overlay.classList.remove("open"); overlay.setAttribute("aria-hidden", "true");
    document.body.classList.remove("lock");
    var cb = onCloseCb; onCloseCb = null;
    if (lastFocus && lastFocus.focus) lastFocus.focus();
    if (cb) cb();
  }
  overlay.addEventListener("click", function (e) { if (e.target === overlay || e.target.closest("[data-close]")) closeModal(); });
  document.addEventListener("keydown", function (e) {
    if (!overlay.classList.contains("open")) return;
    if (e.key === "Escape") return closeModal();
    if (e.key === "Tab") {
      var f = $$("button:not([disabled]),a[href]", dlg); if (!f.length) return;
      var a = f[0], z = f[f.length - 1];
      if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus(); }
      else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); }
    }
  });

  /* ---------- Contenido general ---------- */
  var dateLong = new Date(C.drawDate + "T12:00:00Z").toLocaleDateString("es-CO", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
  var drawPending = "Método de sorteo pendiente de publicación.";
  var B = { name: C.name, prize: money(C.prize), prizeShort: "$" + dots(C.prize), price: money(C.price), date: dateLong, total: C.total, wa: C.whatsappDisplay, ig: "@" + C.instagram };
  $$("[data-bind]").forEach(function (e) { var v = B[e.dataset.bind]; if (v != null) e.textContent = v; });
  document.title = C.name + " · Participa por " + B.prizeShort;
  $("#wa-link").href = "https://wa.me/" + String(C.whatsapp).replace(/\D/g, "");
  $("#ig-link").href = C.instagramUrl;
  $("#foot").textContent = "2026 · @" + C.instagram;

  function initTheme() {
    $("#theme").addEventListener("click", function () {
      var root = document.documentElement, next = root.dataset.theme === "dark" ? "light" : "dark";
      root.classList.add("theme-anim"); root.dataset.theme = next;
      try { localStorage.setItem("rifa-theme", next); } catch (e) {}
      setTimeout(function () { root.classList.remove("theme-anim"); }, 450);
    });
  }

  /* ---------- Medios de pago ---------- */
  function openPayments() {
    var c = el("div", "m-body payment-body", '<div class="payment-heading"><div class="m-ic">' + ic("banknote") + '</div><h3 id="m-title">Medios de pago</h3><p class="m-text">Elige cómo quieres realizar el pago de tu boleta.</p></div><div class="payment-options"><button type="button" class="payment-option" data-payment="nequi"><span class="pay-brand logo-brand nequi-brand"><img src="assets/logo-nequi.png" alt="Nequi"></span><span class="pay-copy"><b>Nequi</b><small>Paga con tu QR o número</small></span><span class="pay-arrow">' + ic("chev") + '</span></button><button type="button" class="payment-option" data-payment="breb"><span class="pay-brand logo-brand breb-brand"><img src="assets/logo-breb.png" alt="Bre-B"></span><span class="pay-copy"><b>Bre-B · Llaves</b><small>Paga con tu QR o llave</small></span><span class="pay-arrow">' + ic("chev") + '</span></button><button type="button" class="payment-option" data-payment="cash"><span class="pay-brand cash-brand">' + ic("banknote") + '</span><span class="pay-copy"><b>Efectivo</b><small>Coordina la entrega con el vendedor</small></span><span class="pay-arrow">' + ic("chev") + '</span></button></div><p class="m-note">Tu boleta queda confirmada cuando el organizador verifica el pago.</p>');
    $$("[data-payment]", c).forEach(function (b) {
      b.addEventListener("click", function () { openPaymentDetail(b.dataset.payment); });
    });
    openModal(c);
  }

  function openPaymentDetail(method) {
    var data = {
      nequi: { title: "Paga con Nequi", brand: '<span class="pay-brand logo-brand nequi-brand detail-brand"><img src="assets/logo-nequi.png" alt="Nequi"></span>', qr: "assets/qr-nequi.jpg", alt: "Código QR de Nequi", label: "Número de Nequi", value: "3222713786", display: "322 271 3786" },
      breb: { title: "Paga con Bre-B", brand: '<span class="pay-brand logo-brand breb-brand detail-brand"><img src="assets/logo-breb.png" alt="Bre-B"></span>', qr: "assets/qr-breb.jpg", alt: "Código QR de Bre-B asociado a la llave", label: "Llave Bre-B", value: "1141320097", display: "1141320097" }
    };
    if (method === "cash") {
      var wa = "https://wa.me/" + String(C.whatsapp).replace(/\D/g, "") + "?text=" + encodeURIComponent("Hola, quiero pagar en efectivo una boleta de la " + C.name + ". ¿Cómo podemos coordinar?");
      var cash = el("div", "m-body payment-detail", '<div class="payment-detail-top"><div class="pay-brand cash-brand">' + ic("banknote") + '</div><h3 id="m-title">Pago en efectivo</h3><p class="m-text">¡Claro! Comunícate con el vendedor para coordinar el lugar y la entrega del dinero.</p></div><a class="btn btn-primary payment-wa" id="cash-wa" target="_blank" rel="noopener noreferrer">' + ic("whatsapp") + 'Hablar por WhatsApp</a><button type="button" class="btn btn-ghost payment-back" id="payment-back">' + ic("chev") + 'Ver otros medios de pago</button>');
      $("#cash-wa", cash).href = wa;
      $("#payment-back", cash).addEventListener("click", openPayments);
      setContent(cash); return;
    }
    var d = data[method]; if (!d) return;
    var detail = el("div", "m-body payment-detail", '<div class="payment-detail-top">' + d.brand + '<h3 id="m-title">' + d.title + '</h3><p class="m-text">Escanea este código desde la aplicación de tu entidad financiera.</p></div><img class="payment-qr" src="' + d.qr + '" alt="' + d.alt + '" loading="eager"><div class="or-divider"><span>o</span></div><div class="copy-payment"><span class="copy-label">' + d.label + '</span><button class="copy-value" id="copy-payment" type="button"><span>' + d.display + '</span>' + ic("copy") + '</button></div><p class="m-note">Verifica el nombre del destinatario y el valor antes de confirmar la transferencia.</p><button type="button" class="btn btn-ghost payment-back" id="payment-back">' + ic("chev") + 'Ver otros medios de pago</button>');
    $("#copy-payment", detail).addEventListener("click", function () {
      copyText(d.value).then(function () { toast(d.label + " copiada."); }, function () { toast("No se pudo copiar. Mantén presionado el número para copiarlo."); });
    });
    $("#payment-back", detail).addEventListener("click", openPayments);
    setContent(detail);
  }

  function initCountdown() {
    var target = new Date(C.drawDate + "T" + C.drawTime + ":00" + C.timezone).getTime();
    if (isNaN(target)) { $(".cd").hidden = true; return; }
    function p(n) { return (n < 10 ? "0" : "") + n; }
    function tick() {
      var d = target - Date.now();
      if (d <= 0) {
        $("#cd-g").hidden = true; $(".cd-t").hidden = true;
        var m = $("#cd-done"); m.hidden = false;
        m.textContent = "Llegó la fecha del sorteo (" + dateLong + "). Consulta con el organizador la hora y el método.";
        return clearInterval(iv);
      }
      var s = Math.floor(d / 1000);
      $("#cd-d").textContent = Math.floor(s / 86400); $("#cd-h").textContent = p(Math.floor(s % 86400 / 3600));
      $("#cd-m").textContent = p(Math.floor(s % 3600 / 60)); $("#cd-s").textContent = p(s % 60);
    }
    var iv = setInterval(tick, 1000); tick();
  }

  function initRules() {
    var rules = [
      ["ticket", "Cada boleta cuesta " + money(C.price) + "."],
      ["users", "Existen " + C.total + " números disponibles, desde 00 hasta " + (C.total - 1) + "."],
      ["banknote", "El premio principal es de " + money(C.prize) + " en efectivo."],
      ["calendar", "El sorteo está programado para el " + dateLong + "."],
      ["star", "Para realizar el sorteo deben venderse como mínimo " + C.minSales + " boletas."],
      ["check", "Una boleta solo se considera vendida cuando el organizador confirma el pago."],
      ["alert", "La selección de una boleta no garantiza su reserva."],
      ["whatsapp", "El comprador debe comunicarse con el organizador para confirmar disponibilidad y coordinar el pago."],
      ["shield", "El mecanismo para determinar el número ganador deberá estar publicado y ser verificable antes del sorteo."]
    ];
    var box = $("#rules");
    rules.forEach(function (r) { var d = el("div", "rule", ic(r[0])); d.appendChild(el("p")).textContent = r[1]; box.appendChild(d); });

  }

  function initReveal() {
    var items = $$(".rv");
    if (!("IntersectionObserver" in window)) { items.forEach(function (e) { e.classList.add("in"); }); return; }
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add("in"); io.unobserve(x.target); } });
    }, { threshold: .08 });
    items.forEach(function (e) { io.observe(e); });
  }

  /* ---------- Validación de tickets.js ---------- */
  function validate() {
    var errs = [], seen = {};
    if (!Array.isArray(T)) return ["tickets.js no contiene la lista TICKETS."];
    if (T.length !== C.total) errs.push("Debe haber exactamente " + C.total + " boletas y hay " + T.length + ".");
    T.forEach(function (t, i) {
      if (!t || typeof t !== "object") { errs.push("Registro " + (i + 1) + ": no es válido."); return; }
      var n = t.number;
      if (typeof n !== "string" || !/^\d{2}$/.test(n) || +n >= C.total) { errs.push("Registro " + (i + 1) + ": el número «" + n + "» está fuera del rango 00-" + (C.total - 1) + "."); return; }
      if (seen[n]) errs.push("El número " + n + " está duplicado."); seen[n] = 1;
      if (t.status !== "available" && t.status !== "sold") { errs.push("Boleta " + n + ": estado inválido (usa \"available\" o \"sold\")."); return; }
      if (t.status === "sold" && (typeof t.buyer !== "string" || !t.buyer.trim())) errs.push("Boleta " + n + ": está vendida pero no tiene nombre de comprador.");
      if (t.status === "available" && t.buyer !== null) errs.push("Boleta " + n + ": está disponible pero tiene comprador (debe ser null).");
    });
    return errs;
  }

  function showErrors(errs) {
    $("#stats").hidden = true; $("#board-wrap").hidden = true;
    var b = $("#board-error"); b.hidden = false;
    b.innerHTML = "<b>" + ic("alert") + "No se puede mostrar el tablero</b><p>Hay errores en el archivo tickets.js. Corrígelos y vuelve a publicar:</p>";
    var ul = el("ul"); errs.slice(0, 8).forEach(function (m) { ul.appendChild(el("li")).textContent = m; });
    if (errs.length > 8) ul.appendChild(el("li")).textContent = "…y " + (errs.length - 8) + " errores más.";
    b.appendChild(ul);
  }

  /* ---------- Tablero ---------- */
  function initBoard() {
    var tickets = T.slice().sort(function (a, b) { return a.number < b.number ? -1 : 1; });
    var byNum = {}, btns = {}, grid = $("#grid"), filter = "all", query = "", selected = [];
    var sold = tickets.filter(function (t) { return t.status === "sold"; }).length;

    // Estadísticas
    var pct = Math.round(sold * 100 / C.total), left = Math.max(0, C.minSales - sold);
    $("#st-total").textContent = C.total; $("#st-sold").textContent = sold;
    $("#st-avail").textContent = C.total - sold; $("#st-pct").textContent = pct + "%";
    $("#bar-label").textContent = sold + " / " + C.total + " boletas vendidas";
    $("#bar-pct").textContent = pct + "% vendido";
    $("#bar").setAttribute("aria-valuenow", pct);
    var mk = $("#bar-min"); mk.style.left = (C.minSales * 100 / C.total) + "%"; $("#bar-min-l").textContent = "Mínimo: " + C.minSales;
    requestAnimationFrame(function () { requestAnimationFrame(function () { $("#bar-f").style.width = pct + "%"; }); });
    var mm = $("#min-msg");
    if (left > 0) mm.innerHTML = ic("info") + "<span>Faltan " + left + (left === 1 ? " boleta" : " boletas") + " para alcanzar el mínimo de realización.</span>";
    else { mm.classList.add("ok"); mm.innerHTML = ic("check") + "<span>¡Ya se alcanzó el mínimo necesario para realizar la rifa!</span>"; }

    // Tarjetas
    tickets.forEach(function (t) {
      byNum[t.number] = t;
      var s = t.status === "sold", b = el("button", "tk " + (s ? "is-sold" : "is-free"));
      b.type = "button"; b.setAttribute("aria-label", "Boleta " + t.number + ", " + (s ? "vendida" : "libre"));
      b.innerHTML = '<span class="tn">' + t.number + '</span><span class="ts">' + ic(s ? "lock" : "circle") + (s ? "Vendida" : "Libre") + "</span>";
      b.addEventListener("click", function () { s ? openSold(t) : setSel(t.number); });
      grid.appendChild(b); btns[t.number] = b;
    });

    function applyFilters() {
      var counts = { all: 0, available: 0, sold: 0 }, shown = 0;
      tickets.forEach(function (t) {
        var qm = query === "" || t.number === query;
        if (qm) { counts.all++; counts[t.status]++; }
        var vis = qm && (filter === "all" || t.status === filter);
        btns[t.number].hidden = !vis; if (vis) shown++;
      });
      Object.keys(counts).forEach(function (k) { $("#c-" + k).textContent = counts[k]; });
      $("#empty").hidden = shown > 0;
      grid.classList.remove("fx"); void grid.offsetWidth; grid.classList.add("fx");
    }
    $$(".seg button").forEach(function (b) {
      b.addEventListener("click", function () {
        filter = b.dataset.f;
        $$(".seg button").forEach(function (x) { x.setAttribute("aria-pressed", x === b); });
        applyFilters();
      });
    });
    var qi = $("#q");
    qi.addEventListener("input", function () {
      var v = qi.value.replace(/\D/g, "").slice(0, 2); qi.value = v;
      query = v.length === 1 ? "0" + v : v; applyFilters();
    });

    // Selección
    var panel = $("#panel");
    function paint(n) {
      var s = selected.indexOf(n) !== -1, b = btns[n];
      b.classList.toggle("is-sel", s); b.setAttribute("aria-pressed", String(s));
      $(".ts", b).innerHTML = ic(s ? "check" : "circle") + (s ? "Elegida" : "Libre");
    }
    function updateSelectionPanel() {
      var count = selected.length;
      $("#p-num").textContent = count;
      $("#p-num2").textContent = count ? selected.join(", ") : "--";
      $("#p-price").textContent = money(C.price * count);
      $("#p-label").textContent = count === 1 ? "Boleta seleccionada" : "Boletas seleccionadas";
      $("#p-buy").textContent = count === 1 ? "Continuar" : "Continuar con " + count + " boletas";
      panel.classList.toggle("show", count > 0); panel.setAttribute("aria-hidden", count === 0);
      document.body.classList.toggle("has-panel", count > 0);
    }
    function setSel(n) {
      var at = selected.indexOf(n);
      if (at === -1) selected.push(n); else selected.splice(at, 1);
      selected.sort(); paint(n); updateSelectionPanel();
    }
    function clearSelection() {
      selected.slice().forEach(paint); selected = []; updateSelectionPanel();
    }
    $("#p-cancel").addEventListener("click", clearSelection);
    $("#p-buy").addEventListener("click", openBuy);

    function openSold(t) {
      var c = el("div", "m-body", '<div class="m-ic sold">' + ic("lock") + '</div><h3 id="m-title">Boleta <span class="num"></span></h3><p class="m-state">Estado: <b>Vendida</b></p><p class="m-text">Esta boleta pertenece a <b class="who"></b>.</p><button class="btn btn-primary" type="button" data-close>Entendido</button>');
      $(".num", c).textContent = t.number; $(".who", c).textContent = t.buyer;
      openModal(c);
    }

    function openBuy() {
      var numbers = selected.slice().sort(), valid = numbers.filter(function (n) { return byNum[n] && byNum[n].status === "available"; });
      if (!valid.length) return;
      numbers = valid;
      var choice = null;
      var c = el("div", "m-body", '<div class="m-ic">' + ic("ticket") + '</div><h3 id="m-title">¿Quieres continuar con la compra?</h3><p class="m-text">Estás interesado en ' + numbers.length + (numbers.length === 1 ? ' boleta:' : ' boletas:') + '</p><div class="selected-numbers"></div><p class="m-price">Total: <b class="pr"></b></p><p class="m-label">Elige cómo contactar al organizador</p><div class="opts"><button type="button" class="opt" data-c="wa" aria-pressed="false">' + ic("whatsapp") + '<span>WhatsApp</span></button><button type="button" class="opt" data-c="ig" aria-pressed="false">' + ic("instagram") + '<span>Instagram</span></button></div><button type="button" class="btn btn-primary" id="go" disabled>Elige una opción</button><p class="m-note">Esto no es un pago ni una reserva. Las boletas se marcan como vendidas cuando el organizador confirma el pago.</p>');
      $(".selected-numbers", c).textContent = numbers.join(" · "); $(".pr", c).textContent = money(C.price * numbers.length);
      var go = $("#go", c);
      $$(".opt", c).forEach(function (o) {
        o.addEventListener("click", function () {
          choice = o.dataset.c;
          $$(".opt", c).forEach(function (x) { x.setAttribute("aria-pressed", x === o); });
          go.disabled = false; go.textContent = "Continuar con " + (choice === "wa" ? "WhatsApp" : "Instagram");
        });
      });
      go.addEventListener("click", function () {
        if (choice === "wa") {
          openLink(waUrl(numbers)); closeModal();
          toast("Te llevamos a WhatsApp. La boleta no queda reservada hasta que el organizador confirme tu pago.");
        } else if (choice === "ig") showInstagram(numbers);
      });
      openModal(c, clearSelection);
    }

    function showInstagram(numbers) {
      var msg = message(numbers);
      var c = el("div", "m-body", '<div class="m-ic">' + ic("instagram") + '</div><h3 id="m-title">Visita el perfil de @' + C.instagram + '</h3><p class="m-text">Copia este mensaje y envíalo desde el perfil del organizador:</p><div class="msg"></div><button type="button" class="btn btn-ghost" id="cp">' + ic("copy") + 'Copiar mensaje</button><a class="btn btn-primary" id="ig-open" target="_blank" rel="noopener noreferrer">' + ic("instagram") + 'Abrir perfil de @' + C.instagram + '</a><p class="m-note">La boleta no queda reservada hasta que el organizador confirme tu pago.</p>');
      $(".msg", c).textContent = msg; $("#ig-open", c).href = C.instagramUrl;
      $("#cp", c).addEventListener("click", function () {
        copyText(msg).then(function () { toast("Mensaje copiado. Pégalo en el chat de Instagram."); },
          function () { toast("No se pudo copiar. Mantén presionado el texto para copiarlo."); });
      });
      setContent(c);
    }
  }

  initTheme(); $("#payment-trigger").addEventListener("click", openPayments); initCountdown(); initRules(); initReveal();
  var errs = validate();
  if (errs.length) showErrors(errs); else initBoard();
})();
