// Live jobs on the Search Jobs page. Our own jobs render first (script.js); this adds live results below via our Cloudflare worker (Jooble) + WhatJobs directly from browser.
(() => {
  const API = "https://uhirable-jobs.amel-moussa10.workers.dev/";

  // WhatJobs: browser-side calls (publisher IDs are not secret)
  const WJ = {
    eg: { publisher: "7501", location: "Egypt" },
    uk: { publisher: "7502", location: "United Kingdom" },
    ca: { publisher: "7503", location: "Canada" },
    de: { publisher: "7505", location: "Germany" },
    sa: { publisher: "7506", location: "Saudi Arabia" },
    qa: { publisher: "7507", location: "Qatar" },
    kw: { publisher: "7508", location: "Kuwait" },
    bh: { publisher: "7509", location: "Bahrain" },
  };

  const CC = { "United States": "us", "Egypt": "eg", "Bahrain": "bh", "Kuwait": "kw", "Qatar": "qa", "Saudi Arabia": "sa", "United Arab Emirates": "ae", "United Kingdom": "uk", "Canada": "ca", "Germany": "de" };
  const ORDER = ["United Arab Emirates", "Saudi Arabia", "Qatar", "Kuwait", "Bahrain", "Egypt", "United Kingdom", "Canada", "Germany"];
  const $ = (s) => document.querySelector(s);
  const esc = (t) => String(t || "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const sel = $("#country-filter"), box = $("#search-box"), wrap = $("#live-wrap"), list = $("#live-list"), status = $("#live-status"), more = $("#live-more"), ownList = $("#jobs-list"), countEl = $("#jobs-count");
  if (!sel || !wrap) return;

  // add live-search countries to the dropdown (after our own countries)
  const have = new Set([...sel.options].map((o) => o.value));
  const grp = document.createElement("optgroup"); grp.label = "Live search · Gulf & Egypt";
  ORDER.forEach((c) => { if (!have.has(c)) { const o = document.createElement("option"); o.value = c; o.textContent = c; grp.appendChild(o); } });
  if (grp.children.length) sel.appendChild(grp);

  let page = 1, shown = 0, total = 0, seq = 0;
  const clean = (h) => String(h || "").replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/\s+/g, " ").trim();
  const ago = (d) => { const t = Date.parse(d); if (!t) return ""; const days = Math.floor((Date.now() - t) / 864e5); return days <= 0 ? "Today" : days === 1 ? "Yesterday" : days < 30 ? days + " days ago" : ""; };
  if (!window.UHCvPop && !document.querySelector('script[src="cv-popup.js"]')) { const _s = document.createElement("script"); _s.src = "cv-popup.js"; document.head.appendChild(_s); }
  const card = (j, i) => { const desc = clean(j.snippet).slice(0, 170); const chips = [j.location && `<span class="chip">📍 ${esc(j.location)}</span>`, j.type && `<span class="chip pc">${esc(j.type)}</span>`, j.salary && `<span class="chip gold">${esc(j.salary)}</span>`, ago(j.updated) && `<span class="chip">${ago(j.updated)}</span>`].filter(Boolean).join("");
    return `<article class="job-card live-card"><span class="promo-badge live">Live</span><div class="job-head"><div class="icon3d ${i % 2 ? "gold" : ""} js-ini">${esc((j.company || "?").trim().charAt(0).toUpperCase())}</div><div><h3>${esc(j.title)}</h3><p class="meta">${esc(j.company || "Company not listed")}${j.source === "lensa" ? " · via Lensa" : ""}</p></div></div><div class="chips">${chips}</div><p class="desc">${esc(desc)}${desc.length >= 170 ? "…" : ""}</p><div class="job-actions"><a class="btn btn-primary btn-sm apply-btn" href="${esc(j.link)}" target="_blank" rel="noopener nofollow${j.source === "lensa" ? " sponsored" : ""}" data-src="${esc(j.source || "")}">Apply</a></div></article>`; };

  async function fetchWhatJobs(cc, kw, pg) {
    const cfg = WJ[cc];
    if (!cfg) return { jobs: [], totalCount: 0 };
    try {
      const params = new URLSearchParams({
        publisher: cfg.publisher,
        keyword:   kw || "jobs",
        location:  cfg.location,
        limit:     "20",
        page:      String(pg),
      });
      const r = await fetch("https://api.whatjobs.com/api/v1/jobs.json?" + params);
      if (!r.ok) return { jobs: [], totalCount: 0 };
      const d = await r.json();
      const jobs = (d.data || []).map((j) => ({
        title:    j.title    || "",
        company:  j.company  || "",
        location: j.location || "",
        salary:   j.salary   || "",
        snippet:  j.snippet  || "",
        link:     j.url      || "",
        type:     j.job_type || "",
        updated:  j.age      || "",
        source:   "whatjobs",
      }));
      return { jobs, totalCount: d.total || jobs.length };
    } catch (e) {
      return { jobs: [], totalCount: 0 };
    }
  }

  async function live(reset) {
    const country = sel.value, kw = box.value.trim();
    const liveCountry = CC[country] && country !== "United States";
    const wantLive = liveCountry || (kw && (country === "United States" || country === "all"));
    if (!wantLive) { wrap.hidden = true; return; }
    const cc = CC[country] || "us";
    if (reset) { page = 1; shown = 0; list.innerHTML = ""; }
    const my = ++seq; wrap.hidden = false; status.className = "js-bar"; status.textContent = "Loading live jobs in " + (country === "all" ? "the United States" : country) + "…"; more.hidden = true;
    if (ownList.querySelector(".empty")) { ownList.innerHTML = ""; if (countEl) countEl.textContent = ""; }
    try {
      const hasWJ = !!WJ[cc];
      const jooblePromise = fetch(API + "?src=jooble&cc=" + cc + "&q=" + encodeURIComponent(kw) + "&page=" + page).then((r) => { if (!r.ok) throw new Error("HTTP " + r.status); return r.json(); }).catch(() => ({ jobs: [], totalCount: 0, failed: true }));
      const lensaPromise = cc === "us" ? fetch(API + "?src=lensa&q=" + encodeURIComponent(kw) + "&page=" + page).then((r) => (r.ok ? r.json() : { jobs: [] })).catch(() => ({ jobs: [] })) : Promise.resolve({ jobs: [], totalCount: 0 });
      const wjPromise = hasWJ ? fetchWhatJobs(cc, kw, page) : Promise.resolve({ jobs: [], totalCount: 0 });

      const [joobleData, wjData, lensaData] = await Promise.all([jooblePromise, wjPromise, lensaPromise]);
      if (my !== seq) return;

      const jJobs = joobleData.jobs || [];
      const wJobs = wjData.jobs || [];
      const lJobs = lensaData.jobs || [];
      if (joobleData.failed && !lJobs.length && !wJobs.length) throw new Error("no live jobs");
      const mix = (a, b) => { const o = []; for (let k = 0; k < Math.max(a.length, b.length); k++) { if (a[k]) o.push(a[k]); if (b[k]) o.push(b[k]); } return o; };
      const jobs  = [...mix(lJobs, jJobs), ...wJobs];
      total = Math.max((joobleData.totalCount || 0) + (lensaData.totalCount || 0), wjData.totalCount || 0, jobs.length);

      list.insertAdjacentHTML("beforeend", jobs.map((j, i) => card(j, shown + i)).join("")); shown += jobs.length;
      const where = country === "all" ? "the United States" : country;
      status.innerHTML = shown ? `<b>${total.toLocaleString()}</b> live jobs${kw ? ` for <b>${esc(kw)}</b>` : ""} in ${esc(where)} · from hundreds of job sites` : `No live jobs${kw ? ` for <b>${esc(kw)}</b>` : ""} in ${esc(where)} right now. Try a shorter keyword.`;
      if (!shown) status.className = "js-bar empty";
      more.hidden = !(jobs.length >= 20 && shown < total);
      try { if (window.goatcounter && goatcounter.count) goatcounter.count({ path: "live-jobs/" + cc, title: "Live jobs " + cc, event: true }); } catch (e) {}
    } catch (e) { if (my === seq) { status.className = "js-bar empty"; status.textContent = "Couldn't load live jobs right now. Please try again in a moment."; } }
  }
  let t; const kick = () => { clearTimeout(t); t = setTimeout(() => live(true), 450); };
  sel.addEventListener("change", () => live(true)); box.addEventListener("input", kick);
  $("#live-next").addEventListener("click", () => { page++; live(false); });
  const u = new URLSearchParams(location.search); if (u.get("country") && [...sel.options].some((o) => o.value === u.get("country"))) { sel.value = u.get("country"); sel.dispatchEvent(new Event("change")); }
  if (u.get("q")) { box.value = u.get("q"); box.dispatchEvent(new Event("input", { bubbles: true })); }
  document.addEventListener("click", (e) => { const a = e.target.closest && e.target.closest("a[data-src]"); if (!a || !a.dataset.src) return; try { if (window.goatcounter && goatcounter.count) goatcounter.count({ path: "out/" + a.dataset.src, title: "Job click: " + a.dataset.src, event: true }); } catch (x) {} });
})();
