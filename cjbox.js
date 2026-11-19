// Careerjet job box (paid per click).
// 1) Pages about one country. Loaded by cvjobs.js (guide pages, <section id="cv-jobs">) and pagejobs.js ("X jobs in <country>" pages, <div id="pj-list">).
//    Reads the same data-cc / data-q / data-l those blocks use, so each page asks for its own job and place.
//    The box sits last in the article; when the page's own live jobs come back empty it takes the empty list's place
//    (on guide pages inside the jobs block, whose heading, search form and button all stay).
// 2) The Search Jobs page. jobsearch.js calls UHCj.search() for a country that has no other live source.
// The jobs sit inside Careerjet's own frame and are drawn by Careerjet's own script; this file only builds the heading and the frame around them.
(() => {
  if (window.UHCj) return;
  // Countries switched on. name = what the heading says, where = the whole country in Careerjet's location search,
  // place = how a city or region of that country has to be written so Careerjet does not pick a namesake elsewhere
  // ("Birmingham" alone gives Birmingham, Alabama; "Ontario, Canada" finds nothing, "Ontario, ON" is the province).
  // Not here on purpose: India (Careerjet answers with US jobs) and Greece (no jobs).
  const COUNTRY = {
    ca: { name: "Canada", where: "Canada", place: (l) => (l === "Ontario" ? "Ontario, ON" : l + ", Canada") },
    uk: { name: "the UK", where: "United Kingdom", place: (l) => l + ", UK" },
    // US city pages end in the state code (us-h1b-sponsors-arlington-va.html); Careerjet needs it: "Arlington, VA"
    us: { name: "the United States", where: "USA", place: (l) => { const st = (location.pathname.match(/-([a-z]{2})\.html$/) || [])[1]; return st ? l + ", " + st.toUpperCase() : l; } },
    eg: { name: "Egypt", where: "Egypt" },
    ae: { name: "the UAE", where: "United Arab Emirates" },
    sa: { name: "Saudi Arabia", where: "Saudi Arabia" },
    qa: { name: "Qatar", where: "Qatar" },
    kw: { name: "Kuwait", where: "Kuwait" },
    bh: { name: "Bahrain", where: "Bahrain" },
    de: { name: "Germany", where: "Germany" },
  };
  const BOX = "https://widget.careerjet.net/job-box/9be6c12d3940297b6d0bddce6e0c7394";
  const LOADER = "https://static.careerjet.org/js/all_widget_job_box_3rd_party.min.js";
  const FRAME_ORIGIN = "https://widget.careerjet.net";
  const placeOf = (C, l) => (C.place ? C.place(l) : l + ", " + C.where);
  const seen = (cc) => { try { if (window.goatcounter && goatcounter.count) goatcounter.count({ path: "cj-box/" + cc, title: "Careerjet box shown " + cc, event: true }); } catch (e) {} };

  // Turns `sec` into a Careerjet block and returns { show(tries, lead, known), clear() }.
  // tries: the searches to try in order, each [keywords, Careerjet location, place name for the heading]; the next, wider one is used when a search has no jobs.
  // lead: "More " when the block follows the page's own jobs, "" when it stands in for them.
  // known: a heading already on the page just above the box (lower case); the box's own heading is left out when it would only repeat it.
  const mount = (sec) => {
    sec.classList.add("cvj"); sec.setAttribute("aria-label", "Jobs from Careerjet");
    // Heading only: Careerjet's own "Powered by Careerjet" line inside the frame is the credit.
    sec.innerHTML = '<div class="cvj-head"><h2 style="margin:0 0 14px"></h2></div>' +
      '<div class="cj-frame" style="background:#fff;border-radius:16px;border:1.5px solid #dfe4ff;padding:4px 8px;overflow:hidden;min-height:140px"></div>';
    const title = sec.querySelector("h2"), frame = sec.querySelector(".cj-frame");
    let tries = [], n = 0, widen = 0, lead = "More ", known = "";
    const draw = () => {
      clearTimeout(widen);
      const [kw, where, place] = tries[n];
      const what = (kw ? kw.replace(/\b(it|hr)\b/g, (m) => m.toUpperCase()).replace(/\benglish\b/g, "English") + " " : "") + "jobs in " + place;
      title.textContent = lead ? lead + what : what[0].toUpperCase() + what.slice(1);
      title.hidden = !!known && known.includes(what.toLowerCase());
      // Careerjet's embed code: a div with the search in data- attributes, then their loader script, which puts the frame in it.
      frame.innerHTML = "";
      const box = document.createElement("div");
      box.className = "cj-job-box"; box.dataset.url = BOX; box.dataset.search = kw; box.dataset.location = where;
      frame.appendChild(box);
      const old = document.getElementById("cj-job-box"); if (old) old.remove();
      const js = document.createElement("script"); js.id = "cj-job-box"; js.async = true; js.src = LOADER + "?t=" + Date.now();
      document.body.appendChild(js);
    };
    // Careerjet's frame tells the page how tall it is ({h, i}), usually twice; with no jobs it is about 144px.
    // A short frame that is not followed by a tall one within two seconds means no jobs: then ask the next, wider search.
    addEventListener("message", (e) => {
      if (e.origin !== FRAME_ORIGIN || !tries.length) return;
      const f = frame.querySelector("iframe"); if (!f || e.source !== f.contentWindow) return;
      let d = e.data; if (typeof d === "string") { try { d = JSON.parse(d); } catch (x) { return; } }
      if (!d || typeof d.h !== "number") return;
      clearTimeout(widen);
      if (d.h < 200 && n < tries.length - 1) widen = setTimeout(() => { n++; draw(); }, 2000);
    });
    return { show: (t, l, k) => { tries = t; n = 0; lead = l; known = k || ""; draw(); },
      clear: () => { clearTimeout(widen); tries = []; n = 0; frame.innerHTML = ""; title.textContent = ""; } };
  };

  // ---- Search Jobs page: one block right after `after` (the job list), redrawn only when the search changes ----
  // It is drawn when it comes close to the screen, so a box far below a long list is not counted as a view by visitors who never reach it.
  let sBox = null, sM = null, sKey = "", sCounted = false, sNear = false, sWait = null;
  const sGo = () => { if (!sWait || !sNear) return; const w = sWait; sWait = null; sM.show(w.tries, w.lead); if (!sCounted) { sCounted = true; seen(w.cc); } };
  const hide = () => { if (!sBox) return; sBox.hidden = true; sBox.style.display = "none"; sKey = ""; sWait = null; sM.clear(); };
  // lead: "More " when the list above has cards, "" when the box stands in for an empty list. Returns false when Careerjet is not switched on for this country.
  const search = (after, cc, kw, city, lead) => {
    const C = COUNTRY[cc]; if (!C || !after) { hide(); return false; }
    if (!sBox) {
      sBox = document.createElement("section"); sBox.id = "cj-search"; sM = mount(sBox);
      if ("IntersectionObserver" in window) new IntersectionObserver((en) => { sNear = en[en.length - 1].isIntersecting; sGo(); }, { rootMargin: "600px 0px" }).observe(sBox); else sNear = true;
    }
    if (sBox.previousElementSibling !== after) after.insertAdjacentElement("afterend", sBox);
    sBox.hidden = false; sBox.style.display = "";
    kw = (kw || "").trim(); city = (city || "").trim(); lead = lead || "";
    const key = cc + "|" + kw.toLowerCase() + "|" + city.toLowerCase() + "|" + lead; if (key === sKey) return true; sKey = key;
    const tries = [];
    if (city) tries.push([kw, placeOf(C, city), city]);
    if (kw) tries.push([kw, C.where, C.name]);
    tries.push(["", C.where, C.name]);
    sM.clear(); sWait = { tries, lead, cc }; sGo();
    return true;
  };
  window.UHCj = { search, hide };

  // ---- Pages about one country ----
  const host = document.getElementById("cv-jobs") || document.getElementById("pj-list"); if (!host || document.getElementById("cj-jobs")) return;
  const D = host.dataset;
  const C = COUNTRY[D.cc]; if (!C) return;
  const q = (D.q || "").trim();
  let L = (D.l || "").trim(), whereL = L ? placeOf(C, L) : "";
  // US state pages carry no data-l; the state is in the address (us-h1b-sponsors-new-york.html), and Careerjet knows states by name.
  if (!L && D.cc === "us" && D.page === "us-h1b-state") {
    const m = location.pathname.match(/us-h1b-sponsors-([a-z-]+)\.html$/);
    if (m) { L = m[1].split("-").map((w) => (w === "dc" ? "DC" : w[0].toUpperCase() + w.slice(1))).join(" "); whereL = L; }
  }
  // The page's own job and place first, then wider searches, so the box is never left empty.
  const tries = [];
  if (q && L) tries.push([q, whereL, L]);
  if (q) tries.push([q, C.where, C.name]);
  if (!q && L) tries.push(["", whereL, L]);
  tries.push(["", C.where, C.name]);

  const sec = document.createElement("section"); sec.id = "cj-jobs";
  const show = mount(sec).show, h2 = sec.querySelector("h2");
  // Last thing in the article, as a block of its own: under the live jobs and the salary note.
  const toEnd = () => { host.parentElement.appendChild(sec); sec.style.cssText = ""; h2.style.fontSize = ""; };
  toEnd();

  // What the box asks for now: the page's own search with "More " in front, until it takes an empty list's place.
  let cur = [tries, "More ", ""];
  // Load only when the box is close to the screen, so visitors who never scroll that far are not counted as views.
  let started = false;
  const start = () => { if (started) return; started = true; show(...cur); seen(D.cc); };
  if ("IntersectionObserver" in window) { const io = new IntersectionObserver((en) => { if (en.some((x) => x.isIntersecting)) { io.disconnect(); start(); } }, { rootMargin: "600px 0px" }); io.observe(sec); } else start();

  if (host.id === "pj-list") {
    // "X jobs in <country>" pages: when the live list comes back with no cards, the box moves up into its place
    // (and the "No live jobs" line is hidden). pagejobs.js says when its first load is over.
    const promote = () => {
      if (host.querySelector(".job-card")) return;
      const st = document.getElementById("pj-status"); if (st) st.hidden = true;
      (document.getElementById("pj-more") || host).insertAdjacentElement("afterend", sec); sec.style.marginTop = "8px";
      cur = [tries, "", ""];
      if (started) show(...cur); else start();
    };
    if (host.dataset.loaded) promote(); else document.addEventListener("uh:jobs", promote, { once: true });
  } else {
    // Guide pages: cvjobs.js says how each load of its jobs block ended (data-loaded / data-empty / data-kw / data-ecc, then the "uh:jobs" event).
    // No cards: the box goes inside the block, in the place of the "No live jobs" line, for the job title and country the block asked for.
    // The block's heading, search form and button stay as they are. Cards again: the box goes back to the end of the article.
    let where = "end";
    const sync = () => {
      const E = host.dataset; if (!E.loaded) return;
      const list = host.querySelector("#cvj-list"), st = host.querySelector("#cvj-status");
      const ecc = E.ecc || D.cc, C2 = COUNTRY[ecc];
      if (E.empty && C2 && list) {
        const kw = (E.kw || "").trim(), t = [];
        if (ecc === D.cc && L) t.push([kw, whereL, L]);
        if (kw) t.push([kw, C2.where, C2.name]);
        t.push(["", C2.where, C2.name]);
        if (st) st.hidden = true;
        const k = ecc + "|" + kw.toLowerCase(); if (k === where) return; where = k;
        list.insertAdjacentElement("afterend", sec); sec.style.cssText = "margin:0;padding:0;border:0;background:none"; h2.style.fontSize = "1.15rem";
        const head = host.querySelector(".cvj-head h2");
        cur = [t, "", head ? head.textContent.toLowerCase() : ""];
      } else {
        if (where === "end") return; where = "end";
        toEnd(); cur = [tries, "More ", ""];
      }
      if (started) show(...cur);
    };
    document.addEventListener("uh:jobs", sync); sync();
  }
})();
