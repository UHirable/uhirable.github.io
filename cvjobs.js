// Live jobs block on the CV pages ("Your CV is ready. Now apply").
// Fills <section id="cv-jobs">. Country comes from the device time zone (next-step.js -> window.UHGeo); nothing is sent anywhere.
// Jobs come from the same sources as the job search: Lensa + Jooble (Cloudflare worker) and WhatJobs (wjfeed.js).
(() => {
  const box = document.getElementById("cv-jobs"); if (!box) return;
  const API = "https://uhirable-jobs.amel-moussa10.workers.dev/";
  const COUNTRIES = [["us", "United States"], ["uk", "United Kingdom"], ["ca", "Canada"], ["de", "Germany"], ["ae", "United Arab Emirates"], ["sa", "Saudi Arabia"], ["qa", "Qatar"], ["kw", "Kuwait"], ["bh", "Bahrain"], ["eg", "Egypt"], ["in", "India"], ["pk", "Pakistan"], ["za", "South Africa"], ["es", "Spain"], ["ph", "Philippines"], ["id", "Indonesia"]];
  const NAME = Object.fromEntries(COUNTRIES);
  const SHOW = 6;
  const esc = (t) => String(t || "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const clean = (h) => String(h || "").replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/\s+/g, " ").trim();
  const count = (path, title) => { try { if (window.goatcounter && goatcounter.count) goatcounter.count({ path, title, event: true }); } catch (e) {} };
  const card = (j, i) => { const desc = clean(j.snippet).slice(0, 150); const chips = [j.location && `<span class="chip">📍 ${esc(j.location)}</span>`, j.type && `<span class="chip pc">${esc(j.type)}</span>`, j.salary && `<span class="chip gold">${esc(j.salary)}</span>`].filter(Boolean).join("");
    return `<article class="job-card live-card"><span class="promo-badge live">Live</span><div class="job-head"><div class="icon3d ${i % 2 ? "gold" : ""} js-ini">${esc((j.company || j.title || "?").trim().charAt(0).toUpperCase())}</div><div><h3>${esc(j.title)}</h3><p class="meta">${j.source === "whatjobs" ? "via WhatJobs" : esc(j.company || "Company not listed") + (j.source === "lensa" ? " · via Lensa" : "")}</p></div></div><div class="chips">${chips}</div><p class="desc">${esc(desc)}${desc.length >= 150 ? "…" : ""}</p><div class="job-actions"><a class="btn btn-primary btn-sm apply-btn" href="${esc(j.link)}" target="_blank" rel="noopener nofollow${j.source === "lensa" || j.source === "whatjobs" ? " sponsored" : ""}" data-src="${esc(j.source || "")}">Apply</a></div></article>`; };

  const geo = window.UHGeo;
  let cc = geo && NAME[geo.cc] ? geo.cc : "us";
  box.classList.add("cvj");
  box.innerHTML = `<div class="cvj-head"><span class="eyebrow"><span class="dot"></span> Next step · Live openings</span><h2>Your CV is ready. Now apply.</h2><p>Live jobs from our job-search partners. Every card opens the original ad.</p></div>
    <form class="cvj-form" id="cvj-form"><label>Job title<input type="search" id="cvj-q" placeholder="e.g. Accountant, Nurse, Developer" autocomplete="off"></label><label>Country<select id="cvj-cc">${COUNTRIES.map(([c, n]) => `<option value="${c}"${c === cc ? " selected" : ""}>${n}</option>`).join("")}</select></label><button type="submit" class="btn btn-primary">Search jobs</button></form>
    <p class="js-bar" id="cvj-status">Loading live jobs…</p>
    <div class="jobs-list" id="cvj-list"></div>
    <div class="cvj-all"><a class="btn btn-soft" id="cvj-all" href="jobs.html">See all jobs →</a></div>`;
  const $ = (s) => box.querySelector(s);
  const qEl = $("#cvj-q"), ccEl = $("#cvj-cc"), status = $("#cvj-status"), list = $("#cvj-list"), all = $("#cvj-all");
  // Pre-fill the job title from the CV builder form when there is one
  const fromBuilder = () => { const t = document.getElementById("f-title"); return t && t.value ? t.value.trim() : ""; };

  const rr = (...L) => { const o = []; const n = Math.max(0, ...L.map((a) => a.length)); for (let k = 0; k < n; k++) L.forEach((a) => { if (a[k]) o.push(a[k]); }); return o; };
  let seq = 0;
  async function fetchJobs(c, kw) {
    const jooble = fetch(API + "?src=jooble&cc=" + c + "&q=" + encodeURIComponent(kw) + "&page=1").then((r) => (r.ok ? r.json() : { jobs: [] })).catch(() => ({ jobs: [] }));
    const lensa = c === "us" ? fetch(API + "?src=lensa&q=" + encodeURIComponent(kw) + "&page=1").then((r) => (r.ok ? r.json() : { jobs: [] })).catch(() => ({ jobs: [] })) : Promise.resolve({ jobs: [] });
    const wj = window.UHWJF && UHWJF.has(c) ? UHWJF.fetch(c, kw, null, 1).catch(() => ({ jobs: [] })) : Promise.resolve({ jobs: [] });
    const [j, w, l] = await Promise.all([jooble, wj, lensa]);
    // one card from each available source in turn, paying partners first: Lensa, WhatJobs, Jooble
    return { jobs: rr(l.jobs || [], w.jobs || [], j.jobs || []), total: (j.totalCount || 0) + (l.totalCount || 0) };
  }
  async function load(auto) {
    const my = ++seq; const kw = qEl.value.trim(); cc = ccEl.value;
    status.hidden = false; status.className = "js-bar"; status.textContent = "Loading live jobs in " + NAME[cc] + "…";
    let res = await fetchJobs(cc, kw);
    if (my !== seq) return;
    // First automatic load: if the visitor's country has no live source yet, show US jobs instead of an empty block
    if (auto && !res.jobs.length && cc !== "us") { cc = "us"; ccEl.value = "us"; res = await fetchJobs("us", kw); if (my !== seq) return; }
    const jobs = res.jobs.slice(0, SHOW);
    list.innerHTML = jobs.map(card).join("");
    const link = "jobs.html?country=" + encodeURIComponent(NAME[cc]) + (kw ? "&q=" + encodeURIComponent(kw) : "");
    all.href = link;
    if (jobs.length) {
      const n = Math.max(res.total, res.jobs.length);
      status.innerHTML = `<b>${n.toLocaleString()}${res.total ? "" : "+"}</b> live jobs${kw ? ` for <b>${esc(kw)}</b>` : ""} in ${esc(NAME[cc])}`;
      all.textContent = "See all " + (kw ? kw + " " : "") + "jobs in " + NAME[cc] + " →";
    } else {
      status.className = "js-bar empty"; status.innerHTML = `No live jobs${kw ? ` for <b>${esc(kw)}</b>` : ""} in ${esc(NAME[cc])} right now. Try a shorter job title or another country.`;
      all.textContent = "Open the job search →";
    }
    count((auto ? "cv-jobs/" : "cv-jobs-search/") + cc, (auto ? "CV page jobs " : "CV page job search ") + cc);
  }
  $("#cvj-form").addEventListener("submit", (e) => { e.preventDefault(); load(false); });
  ccEl.addEventListener("change", () => load(false));
  box.addEventListener("click", (e) => { const a = e.target.closest && e.target.closest("a[data-src]"); if (a && a.dataset.src) count("out/" + a.dataset.src, "Job click: " + a.dataset.src); else if (e.target.closest && e.target.closest("#cvj-all")) count("cv-jobs-all/" + cc, "CV page: see all jobs " + cc); });

  // Load only when the block is close to the screen, so visitors who never scroll down cost no requests.
  let started = false;
  const start = () => { if (started) return; started = true; if (!qEl.value) qEl.value = fromBuilder(); load(true); };
  if ("IntersectionObserver" in window) { const io = new IntersectionObserver((en) => { if (en.some((x) => x.isIntersecting)) { io.disconnect(); start(); } }, { rootMargin: "500px 0px" }); io.observe(box); } else start();
})();
