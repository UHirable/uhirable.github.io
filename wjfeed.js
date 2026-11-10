/* U Hirable — WhatJobs jobs as normal job cards.
   Uses the WhatJobs job-injector endpoint (JSONP, works from the browser) with our publisher codes,
   so every click stays tracked to U Hirable.
   UHWJF.has(cc) -> bool
   UHWJF.fetch(cc, keyword, location, page) -> Promise<{ jobs: [...], hasMore: bool }> */
(function () {
  "use strict";
  var CFG = {
    eg: { pub: "7501", loc: "Egypt" },
    bh: { pub: "7509", loc: "Bahrain" },
    kw: { pub: "7508", loc: "Kuwait" },
    uk: { pub: "7502", loc: "UK" },
    ca: { pub: "7503", loc: "Canada" },
    de: { pub: "7505", loc: "Germany" }
    // sa (7506) and qa (7507): accounts return no jobs yet
  };
  var API = "https://api.whatjobs.com/api/v1/jobinjector.js";
  var pending = {};

  // The endpoint answers by calling window.pnpJobbox.jobsCallback(elementId, html).
  var prev = window.pnpJobbox && window.pnpJobbox.jobsCallback;
  window.pnpJobbox = window.pnpJobbox || {};
  window.pnpJobbox.jobsCallback = function (el, html) {
    if (pending[el]) { var f = pending[el]; delete pending[el]; f(html); }
    else if (typeof prev === "function") prev(el, html);
  };

  function parse(html, locLabel) {
    var d = document.createElement("div");
    d.innerHTML = html || "";
    var jobs = [];
    var nodes = d.querySelectorAll(".pnp-job");
    for (var i = 0; i < nodes.length; i++) {
      var a = nodes[i].querySelector("a[href]");
      if (!a) continue;
      var title = a.textContent.replace(/\s+/g, " ").trim();
      if (title.length < 3) continue;
      var span = nodes[i].querySelector("span");
      jobs.push({
        title: title.replace(/\s*\.\.\.$/, "…"),
        company: "",
        location: locLabel,
        salary: "",
        snippet: span ? span.textContent.replace(/\s+/g, " ").trim() : "",
        link: a.getAttribute("href"),
        type: "",
        updated: "",
        source: "whatjobs"
      });
    }
    return { jobs: jobs, hasMore: !!d.querySelector(".pnp-pagination .next") };
  }

  function fetchJobs(cc, kw, loc, page) {
    var c = CFG[cc];
    if (!c) return Promise.resolve({ jobs: [], hasMore: false });
    var where = loc || c.loc;
    return new Promise(function (resolve) {
      var id = "uhwj" + Math.random().toString(36).slice(2);
      var done = false, s = document.createElement("script");
      var finish = function (r) { if (done) return; done = true; delete pending[id]; if (s.parentNode) s.parentNode.removeChild(s); resolve(r); };
      pending[id] = function (html) { finish(parse(html, where === "UK" ? "United Kingdom" : where)); };
      s.async = true;
      s.src = API + "?publisher=" + encodeURIComponent(c.pub) + "&el=" + id +
        (kw ? "&keyword=" + encodeURIComponent(kw) : "") +
        "&location=" + encodeURIComponent(where) +
        "&limit=10&radius=25&size%5Btitle_chars%5D=120&size%5Bdesc_chars%5D=220" +
        (page > 1 ? "&page=" + page : "") +
        "&url=" + encodeURIComponent(location.href.split("#")[0]);
      s.onerror = function () { finish({ jobs: [], hasMore: false }); };
      setTimeout(function () { finish({ jobs: [], hasMore: false }); }, 9000);
      document.head.appendChild(s);
    });
  }

  window.UHWJF = { has: function (cc) { return !!CFG[cc]; }, fetch: fetchJobs };
})();
