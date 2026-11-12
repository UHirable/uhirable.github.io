// Live jobs on the Search Jobs page. Our own jobs render first (script.js); this adds live results below via our Cloudflare worker (Jooble, Lensa) and WhatJobs (wjfeed.js).
(() => {
  const API = "https://uhirable-jobs.amel-moussa10.workers.dev/";

  const CC = { "United States": "us", "Egypt": "eg", "Bahrain": "bh", "Kuwait": "kw", "Qatar": "qa", "Saudi Arabia": "sa", "United Arab Emirates": "ae", "United Kingdom": "uk", "Canada": "ca", "Germany": "de", "India": "in", "Pakistan": "pk", "South Africa": "za", "Spain": "es", "Philippines": "ph", "Indonesia": "id", "Kenya": "ke", "Oman": "om", "Sri Lanka": "lk", "Uganda": "ug", "Nigeria": "ng", "Australia": "au", "France": "fr", "Netherlands": "nl", "Ireland": "ie", "Singapore": "sg", "Malaysia": "my", "Brazil": "br", "Belgium": "be", "Argentina": "ar", "Portugal": "pt", "Mexico": "mx" };
  const ORDER = ["United Arab Emirates", "Saudi Arabia", "Qatar", "Kuwait", "Bahrain", "Egypt", "United Kingdom", "Canada", "Germany"];
  const $ = (s) => document.querySelector(s);
  const esc = (t) => String(t || "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const sel = $("#country-filter"), box = $("#search-box"), wrap = $("#live-wrap"), list = $("#live-list"), status = $("#live-status"), more = $("#live-more"), ownList = $("#jobs-list"), countEl = $("#jobs-count");
  if (!sel || !wrap) return;

  // add live-search countries to the dropdown (after our own countries)
  const have = new Set([...sel.options].map((o) => o.value));
  const grp = document.createElement("optgroup"); grp.label = "Live search";
  ORDER.forEach((c) => { if (!have.has(c)) { const o = document.createElement("option"); o.value = c; o.textContent = c; grp.appendChild(o); } });
  if (grp.children.length) sel.appendChild(grp);

  // Place names typed in the search box ("nurse london", "accountant dubai") pick the country automatically.
  const PLACES = {
    "United Kingdom": [["united kingdom", "uk", "england", "britain", "scotland", "wales"], ["London", "Manchester", "Birmingham", "Leeds", "Glasgow", "Edinburgh", "Liverpool", "Bristol", "Sheffield", "Nottingham", "Cardiff", "Belfast"]],
    "Canada": [["canada"], ["Toronto", "Vancouver", "Montreal", "Calgary", "Ottawa", "Edmonton", "Winnipeg", "Mississauga"]],
    "Germany": [["germany", "deutschland"], ["Berlin", "Munich", "Hamburg", "Frankfurt", "Cologne", "Stuttgart", "Dusseldorf", "Leipzig"]],
    "United Arab Emirates": [["united arab emirates", "uae", "emirates"], ["Dubai", "Abu Dhabi", "Sharjah", "Ajman", "Al Ain"]],
    "Saudi Arabia": [["saudi arabia", "saudi", "ksa"], ["Riyadh", "Jeddah", "Dammam", "Khobar", "Mecca", "Medina"]],
    "Qatar": [["qatar"], ["Doha"]],
    "Kuwait": [["kuwait"], ["Kuwait City"]],
    "Bahrain": [["bahrain"], ["Manama"]],
    "Egypt": [["egypt"], ["Cairo", "Alexandria", "Giza", "New Cairo", "Mansoura"]],
    "India": [["india"], ["Mumbai", "Delhi", "Bangalore", "Bengaluru", "Hyderabad", "Chennai", "Pune", "Kolkata", "Gurgaon", "Noida", "Ahmedabad"]],
    "Pakistan": [["pakistan"], ["Karachi", "Lahore", "Islamabad", "Rawalpindi", "Faisalabad", "Peshawar"]],
    "South Africa": [["south africa"], ["Johannesburg", "Cape Town", "Durban", "Pretoria"]],
    "Spain": [["spain", "espana", "españa"], ["Madrid", "Barcelona", "Valencia", "Seville", "Malaga"]],
    "Philippines": [["philippines"], ["Manila", "Cebu", "Davao", "Quezon City", "Makati"]],
    "Indonesia": [["indonesia"], ["Jakarta", "Surabaya", "Bandung", "Bali", "Medan"]],
    "United States": [["united states", "usa", "america"], ["New York", "San Francisco", "Los Angeles", "Chicago", "Houston", "Dallas", "Austin", "Boston", "Seattle", "Miami", "Atlanta", "Denver", "Washington"]],
  };
  const PLACE_LIST = [];
  Object.keys(PLACES).forEach((c) => { PLACES[c][0].forEach((n) => PLACE_LIST.push({ name: n, country: c, city: "" })); PLACES[c][1].forEach((n) => PLACE_LIST.push({ name: n.toLowerCase(), country: c, city: n })); });
  PLACE_LIST.sort((a, b) => b.name.length - a.name.length);
  PLACE_LIST.forEach((p) => { p.re = new RegExp("(^|[^a-z])(?:jobs?\\s+)?(?:in\\s+)?" + p.name.replace(/ /g, "\\s+") + "(?![a-z])", "i"); });
  const hasOpt = (v) => [...sel.options].some((o) => o.value === v);
  // -> { country, city, kw (text without the place) } or null
  const findPlace = (text) => { for (const p of PLACE_LIST) { if (p.re.test(text)) return { country: p.country, city: p.city, kw: text.replace(p.re, " ").replace(/\s+/g, " ").trim() }; } return null; };
  let autoSet = false, selfChange = false;
  const setCountry = (v) => { selfChange = true; sel.value = v; sel.dispatchEvent(new Event("change")); selfChange = false; };
  // returns true when it switched the country (the change event already reloads the results)
  const detect = () => {
    const m = findPlace(box.value);
    if (m && hasOpt(m.country) && (sel.value === "all" || autoSet)) { if (sel.value !== m.country) { autoSet = true; setCountry(m.country); return true; } return false; }
    if (!m && autoSet) { autoSet = false; setCountry("all"); return true; }
    return false;
  };

  // ?src=lensa (links shared in posts): show Lensa results only, hide our own jobs
  const LENSA = new URLSearchParams(location.search).get("src") === "lensa";
  let page = 1, shown = 0, total = 0, seq = 0;
  const clean = (h) => String(h || "").replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/\s+/g, " ").trim();
  const ago = (d) => { const t = Date.parse(d); if (!t) return ""; const days = Math.floor((Date.now() - t) / 864e5); return days <= 0 ? "Today" : days === 1 ? "Yesterday" : days < 30 ? days + " days ago" : ""; };
  if (!window.UHCvPop && !document.querySelector('script[src="cv-popup.js"]')) { const _s = document.createElement("script"); _s.src = "cv-popup.js"; document.head.appendChild(_s); }
  const card = (j, i) => { const desc = clean(j.snippet).slice(0, 170); const chips = [j.location && `<span class="chip">📍 ${esc(j.location)}</span>`, j.type && `<span class="chip pc">${esc(j.type)}</span>`, j.salary && `<span class="chip gold">${esc(j.salary)}</span>`, ago(j.updated) && `<span class="chip">${ago(j.updated)}</span>`].filter(Boolean).join("");
    return `<article class="job-card live-card"><span class="promo-badge live">Live</span><div class="job-head"><div class="icon3d ${i % 2 ? "gold" : ""} js-ini">${esc((j.company || j.title || "?").trim().charAt(0).toUpperCase())}</div><div><h3>${esc(j.title)}</h3><p class="meta">${j.source === "whatjobs" ? "via WhatJobs" : esc(j.company || "Company not listed") + (j.source === "lensa" ? " · via Lensa" : "")}</p></div></div><div class="chips">${chips}</div><p class="desc">${esc(desc)}${desc.length >= 170 ? "…" : ""}</p><div class="job-actions"><a class="btn btn-primary btn-sm apply-btn" href="${esc(j.link)}" target="_blank" rel="noopener nofollow${j.source === "lensa" || j.source === "whatjobs" ? " sponsored" : ""}" data-src="${esc(j.source || "")}">Apply</a></div></article>`; };


  async function live(reset) {
    const country = sel.value, raw = box.value.trim();
    const place = findPlace(raw), here = place && place.country === country;
    const kw = here ? place.kw : raw;          // keyword without the place name
    const city = here ? place.city : "";       // "" when only a country was typed
    const jq = city ? (kw + " " + city).trim() : kw; // Jooble: city stays in the keywords
    const liveCountry = CC[country] && country !== "United States";
    const lo = LENSA && (country === "United States" || country === "all");
    if (LENSA) { ownList.style.display = lo ? "none" : ""; if (countEl) countEl.style.display = lo ? "none" : ""; }
    const wantLive = lo || liveCountry || (raw && (country === "United States" || country === "all"));
    if (!wantLive) { wrap.hidden = true; return; }
    const cc = CC[country] || "us";
    if (reset) { page = 1; shown = 0; list.innerHTML = ""; }
    const my = ++seq; wrap.hidden = false; status.className = "js-bar"; status.textContent = "Loading live jobs in " + (country === "all" ? "the United States" : country) + "…"; more.hidden = true;
    if (ownList.querySelector(".empty")) { ownList.innerHTML = ""; if (countEl) countEl.textContent = ""; }
    try {
      const jooblePromise = lo ? Promise.resolve({ jobs: [], totalCount: 0 }) : fetch(API + "?src=jooble&cc=" + cc + "&q=" + encodeURIComponent(jq) + "&page=" + page).then((r) => { if (!r.ok) throw new Error("HTTP " + r.status); return r.json(); }).catch(() => ({ jobs: [], totalCount: 0, failed: true }));
      const lensaPromise = cc === "us" ? fetch(API + "?src=lensa&q=" + encodeURIComponent(kw) + (city ? "&city=" + encodeURIComponent(city) : "") + "&page=" + page).then((r) => (r.ok ? r.json() : { jobs: [] })).catch(() => ({ jobs: [] })) : Promise.resolve({ jobs: [], totalCount: 0 });
      const wjPromise = !lo && window.UHWJF && UHWJF.has(cc) ? UHWJF.fetch(cc, kw, city || null, page) : Promise.resolve({ jobs: [], hasMore: false });

      const [joobleData, wjData, lensaData] = await Promise.all([jooblePromise, wjPromise, lensaPromise]);
      if (my !== seq) return;

      const jJobs = joobleData.jobs || [];
      const wJobs = wjData.jobs || [];
      const lJobs = lensaData.jobs || [];
      if (joobleData.failed && !lJobs.length && !wJobs.length) throw new Error("no live jobs");
      // one card from each available source in turn, paying partners first: Lensa, WhatJobs, Jooble
      const rr = (...L) => { const o = []; const n = Math.max(0, ...L.map((a) => a.length)); for (let k = 0; k < n; k++) L.forEach((a) => { if (a[k]) o.push(a[k]); }); return o; };
      const jobs  = rr(lJobs, wJobs, jJobs);
      total = Math.max((joobleData.totalCount || 0) + (lensaData.totalCount || 0), shown + jobs.length);
      const plus = wjData.hasMore ? "+" : "";

      list.insertAdjacentHTML("beforeend", jobs.map((j, i) => card(j, shown + i)).join("")); shown += jobs.length;
      const where = (city ? city + ", " : "") + (country === "all" ? "the United States" : country);
      status.innerHTML = shown ? `<b>${total.toLocaleString()}${plus}</b> live jobs${kw ? ` for <b>${esc(kw)}</b>` : ""} in ${esc(where)} · from hundreds of job sites` : `No live jobs${kw ? ` for <b>${esc(kw)}</b>` : ""} in ${esc(where)} right now. Try a shorter keyword.`;
      if (!shown) status.className = "js-bar empty";
      more.hidden = !((jJobs.length + lJobs.length >= 20 && shown < total) || wjData.hasMore);
      try { if (window.goatcounter && goatcounter.count) goatcounter.count({ path: "live-jobs/" + cc, title: "Live jobs " + cc, event: true }); } catch (e) {}
    } catch (e) { if (my === seq) { status.className = "js-bar empty"; status.textContent = "Couldn't load live jobs right now. Please try again in a moment."; } }
  }
  let t; const kick = () => { clearTimeout(t); t = setTimeout(() => live(true), 450); };
  sel.addEventListener("change", () => { if (!selfChange) autoSet = false; live(true); });
  box.addEventListener("input", () => { if (!detect()) kick(); });
  $("#live-next").addEventListener("click", () => { page++; live(false); });
  // Extra countries appear in the dropdown once the worker has their Jooble key (it lists them; no site change needed).
  const u0 = new URLSearchParams(location.search);
  const BASE = new Set(["us", ...ORDER.map((c) => CC[c])]);
  const addCountry = (c) => { if (hasOpt(c)) return; const o = document.createElement("option"); o.value = c; o.textContent = c; grp.appendChild(o); if (!grp.parentNode) sel.appendChild(grp); if (u0.get("country") === c && sel.value === "all") { sel.value = c; sel.dispatchEvent(new Event("change")); } };
  const addAll = (ccs) => { Object.keys(CC).filter((c) => !BASE.has(CC[c]) && (ccs.includes(CC[c]) || (window.UHWJF && UHWJF.has(CC[c])))).sort().forEach(addCountry); };
  (() => {
    let v = null; try { v = sessionStorage.getItem("uh-live-ccs"); } catch (e) {}
    addAll([]); /* WhatJobs countries need no worker key */
    if (v) return addAll(v.split(","));
    fetch(API + "?src=countries").then((r) => r.json()).then((d) => { if (!Array.isArray(d.countries)) return addAll(["in", "pk"]); /* older worker: the two known extra countries */ try { sessionStorage.setItem("uh-live-ccs", d.countries.join(",")); } catch (e) {} addAll(d.countries); }).catch(() => {});
  })();
  const u = new URLSearchParams(location.search); if (u.get("country") && [...sel.options].some((o) => o.value === u.get("country"))) { sel.value = u.get("country"); sel.dispatchEvent(new Event("change")); }
  if (u.get("q")) { box.value = u.get("q"); box.dispatchEvent(new Event("input", { bubbles: true })); }
  document.addEventListener("click", (e) => { const a = e.target.closest && e.target.closest("a[data-src]"); if (!a || !a.dataset.src) return; try { if (window.goatcounter && goatcounter.count) goatcounter.count({ path: "out/" + a.dataset.src, title: "Job click: " + a.dataset.src, event: true }); } catch (x) {} });
})();
