/* U Hirable — WhatJobs Jobbox (partner widget)
   Usage: <div class="wj-box" data-cc="eg" data-q="accountant"></div>
   or from JS: UHWJ.show(el, "eg", "keyword") / UHWJ.hide(el) */
(function () {
  "use strict";
  var CFG = {
    eg: { id: "565", pub: "7501", loc: "Egypt", host: "eg.whatjobs.com", name: "Egypt" },
    bh: { id: "565", pub: "7509", loc: "Bahrain", host: "bh.whatjobs.com", name: "Bahrain" },
    kw: { id: "565", pub: "7508", loc: "Kuwait", host: "kw.whatjobs.com", name: "Kuwait" },
    uk: { id: "565", pub: "7502", loc: "UK", host: "uk.whatjobs.com", name: "the UK" },
    ca: { id: "565", pub: "7503", loc: "Canada", host: "ca.whatjobs.com", name: "Canada" },
    de: { id: "565", pub: "7505", loc: "Germany", host: "de.whatjobs.com", name: "Germany" }
    // sa (7506) and qa (7507): accounts return no jobs yet (checked Nov 9, 2026)
  };
  var LOADER = "https://static.whatjobs.com/staticMin/ajCore/js/core/Jobbox/widget-loader-v1.js";
  var state = "idle"; // idle | loading | ready
  var queue = [];

  function esc(s) { return String(s || "").replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }

  function css() {
    if (document.getElementById("wj-css")) return;
    var s = document.createElement("style"); s.id = "wj-css";
    s.textContent =
      ".wj-sec{margin:28px 0 8px}" +
      ".wj-sec h2{color:#0112ff;font-size:1.35rem;margin:0 0 4px}" +
      ".wj-sec .wj-sub{color:#0b1170;opacity:.75;margin:0 0 12px;font-size:.95rem}" +
      ".wj-sec .pnp-jobswidget-wrapper{position:relative;background:#fff;border:1px solid #e3e6ff;border-radius:14px;padding:14px 16px;font:14px/1.45 inherit;color:#0b1170;text-align:left;overflow:hidden}" +
      ".wj-sec .pnp-jobs-content{min-height:120px}" +
      ".wj-sec .pnp-jobs-content:empty::before{content:'Loading jobs…';color:#0b1170;opacity:.6}" +
      ".wj-sec .pnp-job{padding:10px 0;border-bottom:1px solid #eef0ff;color:#0b1170}" +
      ".wj-sec .pnp-job:last-child{border-bottom:0}" +
      ".wj-sec .pnp-jobs-content a{color:#0112ff;font-weight:600;text-decoration:none}" +
      ".wj-sec .pnp-jobs-content a:hover{text-decoration:underline}" +
      ".wj-sec .pnp-pagination{position:absolute;right:14px;top:12px}" +
      ".wj-sec .pnp-pagination a{color:#0112ff;text-decoration:none;font-weight:700;padding:0 4px}" +
      ".wj-sec .pnp-searchbox-wrapper{margin-top:12px;padding-top:12px;border-top:1px solid #eef0ff}" +
      ".wj-sec .pnp-jobbox{display:flex;flex-wrap:wrap;gap:8px}" +
      ".wj-sec .pnp-jobbox input[type=text]{flex:1 1 160px;min-width:0;height:40px;padding:0 12px;border:1px solid #d5d9ff;border-radius:10px;font:inherit;color:#0b1170}" +
      ".wj-sec .pnp-jobbox input[type=submit]{height:40px;padding:0 18px;border:0;border-radius:10px;background:#0112ff;color:#fff;font:inherit;font-weight:700;cursor:pointer}" +
      ".wj-sec .pnp-link{margin-top:10px;font-size:12px;display:flex;justify-content:flex-end;align-items:center;gap:6px;color:#0b1170;opacity:.8}" +
      ".wj-sec .pnp-link a{color:#0b1170;text-decoration:none}" +
      ".wj-sec .pnp-link a{display:inline-flex}.wj-sec .pnp-link img{display:inline-block;width:80px;height:auto;margin:0;border:0}";
    document.head.appendChild(s);
  }

  function markup(c, q) {
    return '<h2>More jobs in ' + esc(c.name) + '</h2>' +
      '<p class="wj-sub">More openings from our partner WhatJobs. Each link opens the job on WhatJobs.</p>' +
      '<div id="pnp-' + c.id + '" class="pnp-jobswidget-wrapper" data-id="' + c.id + '">' +
        '<div id="pnp-jobs-content-' + c.id + '" class="pnp-jobs-content"></div>' +
        '<div class="pnp-searchbox-wrapper"><form method="post" action="https://' + c.host + '/searchbox" class="pnp-jobbox" target="_blank" rel="noopener">' +
          '<input type="text" placeholder="Job title or keyword" name="keyword" class="pnp-q" value="' + esc(q) + '" aria-label="Keyword">' +
          '<input type="text" placeholder="City" name="location" value="' + esc(c.loc) + '" class="pnp-l" aria-label="Location">' +
          '<input type="submit" value="Find Jobs" class="pnp-find-jobs">' +
          '<input type="hidden" name="utm_source" class="utm_source" value="' + c.pub + '">' +
        '</form></div>' +
        '<div class="pnp-link">jobs by <a href="https://' + c.host + '" title="Job Search" target="_blank" rel="nofollow noopener"><img src="https://static.whatjobs.com/static/ajSite/publisher/img/logo/default.svg" width="80" alt="WhatJobs job search"></a></div>' +
      '</div>';
  }

  function data(c, q) {
    window.pnpData = window.pnpData || {};
    window.pnpData[c.id] = {
      pnp_pub: c.pub, pnp_el: "pnp-jobs-content-" + c.id, pnp_q: q || "", pnp_l: c.loc,
      pnp_chnl: "", pnp_domain: "https://api.whatjobs.com", pnp_lmt: "", pnp_size_title: "",
      pnp_size_desc: "", pnp_radius: "25", pnp_q_variable: "", pnp_l_variable: "", pnp_alt_text: undefined
    };
  }

  function refresh(c) {
    try { if (window.pnpJobbox && typeof window.pnpJobbox.getJobs === "function") { window.pnpJobbox.getJobs(c.id); return true; } } catch (e) {}
    return false;
  }

  function load(c) {
    if (state === "ready") { refresh(c); return; }
    queue.push(c);
    if (state === "loading") return;
    state = "loading";
    var s = document.createElement("script"); s.src = LOADER; s.async = true;
    s.onload = function () {
      state = "ready";
      // the loader runs initPnp on load; refresh again only for boxes added after that
      setTimeout(function () { queue.forEach(function (x) { var el = document.getElementById("pnp-jobs-content-" + x.id); if (el && !el.children.length) refresh(x); }); queue = []; }, 400);
    };
    s.onerror = function () { state = "idle"; queue.forEach(function (x) { var w = document.getElementById("pnp-" + x.id); var sec = w && w.closest(".wj-sec"); if (sec) sec.hidden = true; }); queue = []; };
    document.body.appendChild(s);
  }

  function show(el, cc, q) {
    var c = CFG[cc]; if (!el || !c) { if (el) hide(el); return; }
    css();
    q = (q || "").trim();
    el.classList.add("wj-sec"); el.hidden = false;
    var w = document.getElementById("pnp-" + c.id);
    data(c, q);
    if (w && el.contains(w) && el.getAttribute("data-wjcc") === cc) {
      var f = w.querySelector(".pnp-q"); if (f) f.value = q;
      var content = document.getElementById("pnp-jobs-content-" + c.id); if (content) content.innerHTML = "";
      load(c);
      emptyCheck(el, c);
      return;
    }
    el.innerHTML = markup(c, q);
    el.setAttribute("data-wjcc", cc);
    load(c);
    emptyCheck(el, c);
  }

  function emptyCheck(el, c) {
    clearTimeout(el._wjT);
    el._wjT = setTimeout(function () {
      var content = document.getElementById("pnp-jobs-content-" + c.id);
      if (!content) return;
      var real = [].some.call(content.querySelectorAll(".pnp-job a"), function (a) { return a.textContent.trim().length > 3; });
      if (!real) el.hidden = true;
    }, 10000);
  }

  function hide(el) { if (el) { el.hidden = true; } }

  window.UHWJ = { show: show, hide: hide, has: function (cc) { return !!CFG[cc]; } };

  function boot() {
    var boxes = document.querySelectorAll(".wj-box[data-cc]");
    for (var i = 0; i < boxes.length; i++) show(boxes[i], boxes[i].dataset.cc, boxes[i].dataset.q || "");
    document.addEventListener("click", function (e) {
      var a = e.target.closest && e.target.closest(".wj-sec a, .wj-sec input[type=submit]");
      if (!a) return;
      try { if (window.goatcounter && goatcounter.count) goatcounter.count({ path: "out/whatjobs-box", title: "WhatJobs box click", event: true }); } catch (x) {}
    });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
})();
