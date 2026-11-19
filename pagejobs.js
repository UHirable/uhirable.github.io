// Live jobs for "X jobs in <country>" pages. Reads data-q / data-cc / data-l from #pj-list and loads Jooble (Cloudflare worker) and WhatJobs (wjfeed.js) into one list.
(() => {
  const uhBad = (j) => { const t = String((j && j.title) || "").trim(); return /^[\[\(]/.test(t) || /^hiring\s*(in|for|now|!|:|-|\d)/i.test(t) || /\[hiring\]/i.test(t) || (!(j && j.company) && /\b\d+\s*[x×]\s/i.test(t)); };
  const API = "https://uhirable-jobs.amel-moussa10.workers.dev/";
  const JOOBLE = false; // Jooble jobs are switched off until its paid programme is agreed. Set to true to bring them back: the worker and its keys are untouched.


  const list = document.getElementById("pj-list"); if (!list) return;
  const q = list.dataset.q || "", cc = list.dataset.cc || "ae", country = list.dataset.country || "", wjLoc = list.dataset.l || null;
  const status = document.getElementById("pj-status"), more = document.getElementById("pj-more"), next = document.getElementById("pj-next"), countEls = document.querySelectorAll(".pj-count");
  const esc = (t) => String(t || "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const clean = (h) => String(h || "").replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/\s+/g, " ").trim();
  const ago = (d) => { const t = Date.parse(d); if (!t) return ""; const days = Math.floor((Date.now() - t) / 864e5); return days <= 0 ? "Today" : days === 1 ? "Yesterday" : days < 30 ? days + " days ago" : ""; };
  if (!window.UHCvPop && !document.querySelector('script[src="cv-popup.js"]')) { const _s = document.createElement("script"); _s.src = "cv-popup.js"; document.head.appendChild(_s); }
  const card = (j, i) => { const desc = clean(j.snippet).slice(0, 170); const chips = [j.location && `<span class="chip">📍 ${esc(j.location)}</span>`, j.type && `<span class="chip pc">${esc(j.type)}</span>`, j.salary && `<span class="chip gold">${esc(j.salary)}</span>`, ago(j.updated) && `<span class="chip">${ago(j.updated)}</span>`].filter(Boolean).join("");
    return `<article class="job-card live-card"><span class="promo-badge live">Live</span><div class="job-head"><div class="icon3d ${i % 2 ? "gold" : ""} js-ini">${esc(((String(j.company || j.title || "").trim().match(/[\p{L}\p{N}]/u) || ["•"])[0].toUpperCase()))}</div><div><h3>${esc(j.title)}</h3><p class="meta">${j.source === "whatjobs" ? "via WhatJobs" : esc(j.company || "Company not listed")}</p></div></div><div class="chips">${chips}</div><p class="desc">${esc(desc)}${desc.length >= 170 ? "…" : ""}</p><div class="job-actions"><a class="btn btn-primary btn-sm apply-btn" href="${esc(j.link)}" target="_blank" rel="noopener nofollow${j.source === "whatjobs" ? " sponsored" : ""}" data-src="${esc(j.source || "")}">Apply</a></div></article>`; };


  let page = 1, shown = 0, total = 0;

  async function load() {
    status.className = "js-bar"; status.textContent = "Loading live " + q + " jobs in " + country + "…"; more.hidden = true;
    try {
      const jooblePromise = !JOOBLE ? Promise.resolve({ jobs: [], totalCount: 0 }) : fetch(API + "?src=jooble&cc=" + cc + "&q=" + encodeURIComponent(q) + "&page=" + page).then((r) => { if (!r.ok) throw new Error("HTTP " + r.status); return r.json(); }).catch(() => ({ jobs: [], totalCount: 0, failed: true }));
      const wjPromise = window.UHWJF && UHWJF.has(cc) ? UHWJF.fetch(cc, q, wjLoc, page) : Promise.resolve({ jobs: [], hasMore: false });

      const [joobleData, wjData] = await Promise.all([jooblePromise, wjPromise]);

      if (/unknown country/.test(joobleData.error || "") && !(wjData.jobs || []).length && page === 1) {
        status.hidden = true; const src = document.querySelector(".pj-body .js-src"); if (src) src.hidden = true;
        countEls.forEach((e) => { e.textContent = "Fresh"; }); return;
      }
      const jJobs = (joobleData.jobs || []).filter((j) => !uhBad(j));
      const wJobs = wjData.jobs || [];
      if (joobleData.failed && !wJobs.length) throw new Error("no live jobs");
      const mix = (a, b) => { const o = []; for (let k = 0; k < Math.max(a.length, b.length); k++) { if (a[k]) o.push(a[k]); if (b[k]) o.push(b[k]); } return o; };
      const jobs = wJobs.concat(jJobs); // WhatJobs (paying partner) first, then Jooble
      total = Math.max(joobleData.totalCount || 0, shown + jobs.length);
      const plus = wjData.hasMore ? "+" : "";

      list.insertAdjacentHTML("beforeend", jobs.map((j, i) => card(j, shown + i)).join("")); shown += jobs.length;
      countEls.forEach((e) => { e.textContent = shown ? total.toLocaleString() + plus : "Fresh"; });
      status.innerHTML = shown ? `<b>${total.toLocaleString()}${plus}</b> live ${esc(q)} jobs in ${esc(country)} · from hundreds of job sites · updated daily` : `No live ${esc(q)} jobs in ${esc(country)} right now. Check back tomorrow or <a href="jobs.html">search all jobs</a>.`;
      if (!shown) status.className = "js-bar empty";
      more.hidden = !((jJobs.length >= 20 && shown < total) || wjData.hasMore);
      try { if (window.goatcounter && goatcounter.count) goatcounter.count({ path: "live-pages/" + cc + "/" + q, title: "Live page " + q, event: true }); } catch (e) {}
    } catch (e) { status.className = "js-bar empty"; status.innerHTML = `Couldn't load live jobs right now. <a href="jobs.html?country=${encodeURIComponent(country)}&q=${encodeURIComponent(q)}">Open the job search</a> instead.`; if (!shown) countEls.forEach((el) => { el.textContent = "Fresh"; }); }
  }
  next.addEventListener("click", () => { page++; load(); });
  // Tell cjbox.js when the first load is over: with no cards on the page, the Careerjet box takes the list's place.
  load().finally(() => { list.dataset.loaded = "1"; document.dispatchEvent(new Event("uh:jobs")); });
  document.addEventListener("click", (e) => { const a = e.target.closest && e.target.closest("a[data-src]"); if (!a || !a.dataset.src) return; try { if (window.goatcounter && goatcounter.count) goatcounter.count({ path: "out/" + a.dataset.src, title: "Job click: " + a.dataset.src, event: true }); } catch (x) {} });

  // Careerjet job box at the end of the page. cjbox.js decides which countries it is switched on for.
  if (!document.querySelector('script[src^="cjbox.js"]')) { const s = document.createElement("script"); s.src = "cjbox.js?v=5"; document.head.appendChild(s); }
})();
