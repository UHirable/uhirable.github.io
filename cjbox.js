// Careerjet job box (paid per click).
// 1) Pages about one country. Loaded by cvjobs.js (guide pages, <section id="cv-jobs">) and pagejobs.js ("X jobs in <country>" pages, <div id="pj-list">).
//    Reads the same data-cc / data-q / data-l those blocks use, so each page asks for its own job and place.
//    The box sits last in the article; when the page's own live jobs come back empty it moves up into their place.
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

  // Turns `sec` into a Careerjet block and returns show(tries, lead).
  // tries: the searches to try in order, each [keywords, Careerjet location, place name for the heading]; the next, wider one is used when a search has no jobs.
  // lead: "More " when the block follows the page's own jobs, "" when it stands in for them.
  const mount = (sec) => {
    sec.classList.add("cvj"); sec.setAttribute("aria-label", "Jobs from Careerjet");
    // Heading only: Careerjet's own "Powered by Careerjet" line inside the frame is the credit.
    sec.innerHTML = '<div class="cvj-head"><h2 style="margin:0 0 14px"></h2></div>' +
      '<div class="cj-frame" style="background:#fff;border-radius:16px;border:1.5px solid #dfe4ff;padding:4px 8px;overflow:hidden;min-height:140px"></div>';
    const title = sec.querySelector("h2"), frame = sec.querySelector(".cj-frame");
    let tries = [], n = 0, widen = 0, lead = "More ";
    const draw = () => {
      clearTimeout(widen);
      const [kw, where, place] = tries[n];
      const what = (kw ? kw.replace(/\b(it|hr)\b/g, (m) => m.toUpperCase()).replace(/\benglish\b/g, "English") + " " : "") + "jobs in " + place;
      title.textContent = lead ? lead + what : what[0].toUpperCase() + what.slice(1);
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
    return (t, l) => { tries = t; n = 0; lead = l; draw(); };
  };

  // ---- Search Jobs page: one block right after `after`, redrawn only when the search changes ----
  let sBox = null, sShow = null, sKey = "", sCounted = false;
  const hide = () => { if (!sBox) return; sBox.hidden = true; sBox.style.display = "none"; sKey = ""; const f = sBox.querySelector(".cj-frame"); if (f) f.innerHTML = ""; };
  // Returns false when Careerjet is not switched on for this country.
  const search = (after, cc, kw, city) => {
    const C = COUNTRY[cc]; if (!C || !after) { hide(); return false; }
    if (!sBox) { sBox = document.createElement("section"); sBox.id = "cj-search"; sShow = mount(sBox); }
    if (sBox.previousElementSibling !== after) after.insertAdjacentElement("afterend", sBox);
    sBox.hidden = false; sBox.style.display = "";
    kw = (kw || "").trim(); city = (city || "").trim();
    const key = cc + "|" + kw.toLowerCase() + "|" + city.toLowerCase(); if (key === sKey) return true; sKey = key;
    const tries = [];
    if (city) tries.push([kw, placeOf(C, city), city]);
    if (kw) tries.push([kw, C.where, C.name]);
    tries.push(["", C.where, C.name]);
    sShow(tries, "");
    if (!sCounted) { sCounted = true; seen(cc); }
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
  const show = mount(sec);
  host.parentElement.appendChild(sec); // last thing in the article: under the live jobs and the salary note

  // Load only when the box is close to the screen, so visitors who never scroll that far are not counted as views.
  let started = false, top = false; // top: the box has taken the place of an empty live list
  const start = () => { if (started) return; started = true; show(tries, top ? "" : "More "); seen(D.cc); };
  if ("IntersectionObserver" in window) { const io = new IntersectionObserver((en) => { if (en.some((x) => x.isIntersecting)) { io.disconnect(); start(); } }, { rootMargin: "600px 0px" }); io.observe(sec); } else start();

  // When the page's own live jobs come back with no cards, the box moves into their place, so the page never shows an empty list.
  // pagejobs.js and cvjobs.js say when their first load is over (data-loaded on the host, then the "uh:jobs" event).
  const promote = () => {
    const pj = host.id === "pj-list", list = pj ? host : host.querySelector("#cvj-list");
    if (list && list.querySelector(".job-card")) return;
    if (pj) {
      const st = document.getElementById("pj-status"); if (st) st.hidden = true;
      (document.getElementById("pj-more") || host).insertAdjacentElement("afterend", sec); sec.style.marginTop = "8px";
    } else {
      host.insertAdjacentElement("afterend", sec); host.style.display = "none"; // the empty jobs block on a guide page, search form included
    }
    top = true;
    if (started) show(tries, ""); else if (pj) start(); // on guide pages the box still waits until it is close to the screen
  };
  if (host.dataset.loaded) promote(); else document.addEventListener("uh:jobs", promote, { once: true });
})();
