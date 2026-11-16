// Live jobs on the Search Jobs page. Our own jobs render first (script.js); this adds live results below via our Cloudflare worker (Jooble, Lensa) and WhatJobs (wjfeed.js).
(() => {
  const uhBad = (j) => { const t = String((j && j.title) || "").trim(); return /^[\[\(]/.test(t) || /^hiring\s*(in|for|now|!|:|-|\d)/i.test(t) || /\[hiring\]/i.test(t) || (!(j && j.company) && /\b\d+\s*[x×]\s/i.test(t)); };
  const API = "https://uhirable-jobs.amel-moussa10.workers.dev/";

  const CC = { "United States": "us", "Egypt": "eg", "Bahrain": "bh", "Kuwait": "kw", "Qatar": "qa", "Saudi Arabia": "sa", "United Arab Emirates": "ae", "United Kingdom": "uk", "Canada": "ca", "Germany": "de", "India": "in", "Pakistan": "pk", "South Africa": "za", "Spain": "es", "Philippines": "ph", "Indonesia": "id", "Kenya": "ke", "Oman": "om", "Sri Lanka": "lk", "Uganda": "ug", "Nigeria": "ng", "Australia": "au", "France": "fr", "Netherlands": "nl", "Ireland": "ie", "Singapore": "sg", "Malaysia": "my", "Brazil": "br", "Belgium": "be", "Argentina": "ar", "Portugal": "pt", "Mexico": "mx", "Greece": "gr" };
  const ORDER = ["United Arab Emirates", "Saudi Arabia", "Qatar", "Kuwait", "Bahrain", "Egypt", "United Kingdom", "Canada", "Germany"];
  const $ = (s) => document.querySelector(s);
  const esc = (t) => String(t || "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const sel = $("#country-filter"), box = $("#search-box"), wrap = $("#live-wrap"), list = $("#live-list"), status = $("#live-status"), more = $("#live-more"), ownList = $("#jobs-list"), countEl = $("#jobs-count");
  if (!sel || !wrap) return;

  // add live-search countries to the dropdown (after our own countries)
  const have = new Set([...sel.options].map((o) => o.value));
  // one A-Z list: "All countries" (and "Worldwide") stay on top
  const sortOpts = () => { const v = sel.value, os = [...sel.options], top = os.filter((o) => o.value === "all" || o.value === "Worldwide"), rest = os.filter((o) => !top.includes(o)).sort((a, b) => a.textContent.localeCompare(b.textContent)); [...top, ...rest].forEach((o) => sel.appendChild(o)); sel.value = v; };
  ORDER.forEach((c) => { if (!have.has(c)) { const o = document.createElement("option"); o.value = c; o.textContent = c; sel.appendChild(o); } });
  sortOpts();

  // Country: type or pick (the <select> stays hidden and drives the results)
  const cin = $("#country-input"), cdl = $("#country-list");
  const optName = (o) => o.textContent.replace(/^[^A-Za-z]+/, "").trim();
  const fillList = () => { if (!cdl) return; cdl.innerHTML = [...sel.options].map((o) => `<option value="${esc(optName(o))}"></option>`).join(""); };
  const showSel = () => { if (cin && document.activeElement !== cin) { const o = sel.options[sel.selectedIndex]; cin.value = o && o.value !== "all" ? optName(o) : ""; } };
  if (cin) {
    fillList(); new MutationObserver(fillList).observe(sel, { childList: true });
    const pick = () => { const t = cin.value.trim().toLowerCase(); if (!t) { if (sel.value !== "all") { sel.value = "all"; sel.dispatchEvent(new Event("change")); } return; }
      const o = [...sel.options].find((x) => optName(x).toLowerCase() === t || (t === "uae" && x.value === "United Arab Emirates"));
      if (o && sel.value !== o.value) { sel.value = o.value; sel.dispatchEvent(new Event("change")); } };
    cin.addEventListener("input", pick); cin.addEventListener("change", pick);
    // clear the box on focus so the arrow always opens the full country list; the current country stays as a hint
    const PH = cin.placeholder;
    cin.addEventListener("focus", () => { if (cin.value) { cin.placeholder = cin.value; cin.value = ""; } });
    cin.addEventListener("blur", () => setTimeout(() => { cin.placeholder = PH; showSel(); }, 0));
    sel.addEventListener("change", showSel);
  }
  const vjFilter = () => { const sec = $("#tech-jobs"); if (!sec) return; const q = box.value.toLowerCase().replace(/\s+/g, " ").trim(); let n = 0;
    sec.querySelectorAll(".vj-card").forEach((c) => { const ok = !q || c.textContent.toLowerCase().replace(/\s+/g, " ").includes(q); c.classList.toggle("vj-qh", !ok); if (ok) n++; });
    // the VanHack section is only for Canada, the US and Latin America (and "All countries");
    // with one country picked it shows only that country's jobs, without the filter buttons
    const G = { "Canada": ["canada", "abroad"], "United States": ["us"], "Brazil": ["latam"], "Mexico": ["latam"], "Argentina": ["latam"] };
    const T = { "Canada": "Tech jobs in Canada", "United States": "Tech jobs in the US", "Brazil": "Tech jobs open to Latin America", "Mexico": "Tech jobs open to Latin America", "Argentina": "Tech jobs open to Latin America" };
    const all = sel.value === "all" || sel.value === "Worldwide", g = G[sel.value];
    const h2 = sec.querySelector("h2"); if (h2) { if (!h2.dataset.t) h2.dataset.t = h2.textContent; h2.textContent = g ? T[sel.value] : h2.dataset.t; }
    const fl = sec.querySelector(".vj-filters"); if (fl) fl.style.display = g ? "none" : "";
    if (g) { const ab = sec.querySelector('.vj-f[data-f="all"]'); if (ab && !ab.classList.contains("on")) ab.click(); }
    sec.querySelectorAll(".vj-card").forEach((c) => { c.style.display = g && !g.includes(c.getAttribute("data-g")) ? "none" : ""; });
    sec.style.display = q || !(all || g) ? "none" : ""; };
  box.addEventListener("input", vjFilter);
  sel.addEventListener("change", vjFilter);

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
  let page = 1, shown = 0, total = 0, seq = 0, wjPage = 1, wjDone = true;
  const clean = (h) => String(h || "").replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/\s+/g, " ").trim();
  const ago = (d) => { const t = Date.parse(d); if (!t) return ""; const days = Math.floor((Date.now() - t) / 864e5); return days <= 0 ? "Today" : days === 1 ? "Yesterday" : days < 30 ? days + " days ago" : ""; };
  if (!window.UHCvPop && !document.querySelector('script[src="cv-popup.js"]')) { const _s = document.createElement("script"); _s.src = "cv-popup.js"; document.head.appendChild(_s); }
  const card = (j, i) => { const desc = clean(j.snippet).slice(0, 170); const chips = [j.location && `<span class="chip">📍 ${esc(j.location)}</span>`, j.type && `<span class="chip pc">${esc(j.type)}</span>`, j.salary && `<span class="chip gold">${esc(j.salary)}</span>`, ago(j.updated) && `<span class="chip">${ago(j.updated)}</span>`].filter(Boolean).join("");
    return `<article class="job-card live-card"><div class="job-head"><div class="icon3d ${i % 2 ? "gold" : ""} js-ini">${esc(((String(j.company || j.title || "").trim().match(/[\p{L}\p{N}]/u) || ["•"])[0].toUpperCase()))}</div><div><h3>${esc(j.title)}</h3><p class="meta">${j.source === "whatjobs" ? "via WhatJobs" : esc(j.company || "Company not listed") + (j.source === "lensa" ? " · via Lensa" : "")}</p></div></div><div class="chips">${chips}</div><p class="desc">${esc(desc)}${desc.length >= 170 ? "…" : ""}</p><div class="job-actions"><a class="btn btn-primary btn-sm apply-btn" href="${esc(j.link)}" target="_blank" rel="noopener nofollow${j.source === "lensa" || j.source === "whatjobs" ? " sponsored" : ""}" data-src="${esc(j.source || "")}">Apply</a></div></article>`; };


  // VanHack tech jobs that match the search, shown as normal cards among the results
  const vhHits = (country, phrase) => { const sec = $("#tech-jobs"); if (!sec || !phrase) return [];
    return [...sec.querySelectorAll(".vj-card")].filter((c) => { const t = c.textContent.toLowerCase().replace(/\s+/g, " "); const m = (c.querySelector(".vj-meta") || {}).textContent || "";
      return t.includes(phrase) && (country === "all" || m.includes(country)); })
      .map((c) => { const g = (s) => ((c.querySelector(s) || {}).textContent || "").trim(), a = c.querySelector("a"); const ch = [...c.querySelectorAll(".vj-chip")].slice(0, 3).map((x) => `<span class="chip pc">${esc(x.textContent)}</span>`).join("");
        return `<article class="job-card live-card"><div class="job-head"><div class="icon3d js-ini">${esc(g("h3").charAt(0).toUpperCase())}</div><div><h3>${esc(g("h3"))}</h3><p class="meta">${esc(g(".vj-meta"))}</p></div></div><div class="chips"><span class="chip gold">${esc(g(".vj-badge"))}</span>${ch}</div><p class="desc">${esc(g(".vj-note"))}</p><div class="job-actions"><a class="btn btn-primary btn-sm apply-btn" href="${esc(a ? a.href : "")}" target="_blank" rel="noopener sponsored" data-src="vanhack">Apply</a></div></article>`; }); };
  async function live(reset, tries = 0) {
    const country = sel.value, raw = box.value.trim();
    const place = findPlace(raw), here = place && place.country === country;
    const kw = here ? place.kw : raw;          // keyword without the place name
    const city = here ? place.city : "";       // "" when only a country was typed
    const jq = city ? (kw + " " + city).trim() : kw; // Jooble: city stays in the keywords
    const liveCountry = CC[country] && country !== "United States";
    const lo = LENSA && (country === "United States" || country === "all");
    if (LENSA) { ownList.style.display = lo ? "none" : ""; if (countEl) countEl.style.display = lo ? "none" : ""; }
    const wantLive = lo || liveCountry || (raw && (country === "United States" || country === "all"));
    const vhPhrase = kw.toLowerCase().replace(/\s+/g, " ").trim();
    if (!wantLive) { const h = reset ? vhHits(country, vhPhrase) : []; if (h.length) { page = 1; shown = h.length; list.innerHTML = h.join(""); wrap.hidden = false; status.hidden = true; more.hidden = true; } else wrap.hidden = true; return; }
    const cc = CC[country] || "us";
    if (reset) { page = 1; wjPage = 1; wjDone = lo || !(window.UHWJF && UHWJF.has(cc)); total = 0; shown = 0; list.innerHTML = ""; const h = vhHits(country, vhPhrase); if (h.length) { list.innerHTML = h.join(""); shown = h.length; } }
    const my = ++seq; wrap.hidden = false; status.hidden = false; status.className = "js-bar"; status.textContent = "Loading live jobs in " + (country === "all" ? "the United States" : country) + "…"; more.hidden = true;
    if (ownList.querySelector(".empty")) { ownList.innerHTML = ""; if (countEl) countEl.textContent = ""; }
    try {
      const phrase = kw.toLowerCase().replace(/\s+/g, " ").trim();
      const exact = (j) => !phrase || clean(j.title).toLowerCase().replace(/\s+/g, " ").includes(phrase);
      // WhatJobs (paying partner) first: show all its pages, then fill with Lensa / Jooble
      let wJobs = [], jJobs = [], lJobs = [], jMore = false, failed = false;
      if (!wjDone) {
        const wjData = await UHWJF.fetch(cc, kw, city || null, wjPage);
        if (my !== seq) return;
        wJobs = (wjData.jobs || []).filter(exact); wjPage++; wjDone = !wjData.hasMore;
      }
      if (wjDone) {
        const jp = page;
        const jooblePromise = lo ? Promise.resolve({ jobs: [], totalCount: 0 }) : fetch(API + "?src=jooble&cc=" + cc + "&q=" + encodeURIComponent(jq) + "&page=" + jp).then((r) => { if (!r.ok) throw new Error("HTTP " + r.status); return r.json(); }).catch(() => ({ jobs: [], totalCount: 0, failed: true }));
        const lensaPromise = cc === "us" ? fetch(API + "?src=lensa&q=" + encodeURIComponent(kw) + (city ? "&city=" + encodeURIComponent(city) : "") + "&page=" + jp).then((r) => (r.ok ? r.json() : { jobs: [] })).catch(() => ({ jobs: [] })) : Promise.resolve({ jobs: [], totalCount: 0 });
        const [joobleData, lensaData] = await Promise.all([jooblePromise, lensaPromise]);
        if (my !== seq) return;
        page++;
        jMore = (joobleData.jobs || []).length + (lensaData.jobs || []).length >= 20;
        jJobs = (joobleData.jobs || []).filter((j) => !uhBad(j) && exact(j));
        lJobs = (lensaData.jobs || []).filter(exact);
        failed = !!joobleData.failed;
        total = Math.max(total, (joobleData.totalCount || 0) + (lensaData.totalCount || 0));
      }
      const rawMore = !wjDone || jMore;
      if (failed && !wJobs.length && !lJobs.length && !jJobs.length && !shown) throw new Error("no live jobs");
      // Lensa and Jooble take turns after the WhatJobs jobs
      const rr = (...L) => { const o = []; const n = Math.max(0, ...L.map((a) => a.length)); for (let k = 0; k < n; k++) L.forEach((a) => { if (a[k]) o.push(a[k]); }); return o; };
      const jobs = wJobs.concat(rr(lJobs, jJobs));
      total = Math.max(total, shown + jobs.length);
      const plus = rawMore ? "+" : "";

      list.insertAdjacentHTML("beforeend", jobs.map((j, i) => card(j, shown + i)).join("")); shown += jobs.length;
      // exact search: gather matches from several pages in one go (no "Load more")
      if (phrase && rawMore && tries < 6) return live(false, tries + 1);
      // a WhatJobs page with no matches: go straight on to the next one
      if (!jobs.length && rawMore && tries < 6) return live(false, tries + 1);
      const where = (city ? city + ", " : "") + (country === "all" ? "the United States" : country);
      status.innerHTML = shown ? `<b>${phrase ? shown.toLocaleString() + (rawMore ? "+" : "") : total.toLocaleString() + plus}</b> live jobs${kw ? ` for <b>${esc(kw)}</b>` : ""} in ${esc(where)} · from hundreds of job sites` : `No live jobs${kw ? ` for <b>${esc(kw)}</b>` : ""} in ${esc(where)} right now. Try a shorter keyword.`;
      if (!shown) status.className = "js-bar empty";
      more.hidden = phrase ? true : !rawMore;
      status.hidden = !!shown; /* count line only needed when nothing was found */
      try { if (window.goatcounter && goatcounter.count) goatcounter.count({ path: "live-jobs/" + cc, title: "Live jobs " + cc, event: true }); } catch (e) {}
    } catch (e) { if (my === seq) { if (shown) { status.hidden = true; more.hidden = true; } else { status.className = "js-bar empty"; status.textContent = "Couldn't load live jobs right now. Please try again in a moment."; } } }
  }
  let t; const kick = () => { clearTimeout(t); t = setTimeout(() => live(true), 450); };
  sel.addEventListener("change", () => { if (!selfChange) autoSet = false; live(true); });
  box.addEventListener("input", () => { if (!detect()) kick(); });
  $("#live-next").addEventListener("click", () => live(false));
  // Extra countries appear in the dropdown once the worker has their Jooble key (it lists them; no site change needed).
  const u0 = new URLSearchParams(location.search);
  const BASE = new Set(["us", ...ORDER.map((c) => CC[c])]);
  const addCountry = (c) => { if (hasOpt(c)) return; const o = document.createElement("option"); o.value = c; o.textContent = c; sel.appendChild(o); sortOpts(); if (u0.get("country") === c && sel.value === "all") { sel.value = c; sel.dispatchEvent(new Event("change")); } };
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
