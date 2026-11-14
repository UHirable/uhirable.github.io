// "Your CV is ready" window shown in the middle of the page after a CV download.
// Suggests jobs in the visitor's country, picked from the device time zone (nothing is sent anywhere).
(() => {
  const uhBad = (j) => { const t = String((j && j.title) || "").trim(); return /^[\[\(]/.test(t) || /^hiring\s*(in|for|now|!|:|-|\d)/i.test(t) || /\[hiring\]/i.test(t) || (!(j && j.company) && /\b\d+\s*[x×]\s/i.test(t)); };
  if (window.UHNextStep) return;
  const count = (path, title) => { try { if (window.goatcounter && goatcounter.count) goatcounter.count({ path, title, event: true }); } catch (e) {} };
  let tz = ""; try { tz = Intl.DateTimeFormat().resolvedOptions().timeZone || ""; } catch (e) {}
  // Country from the device time zone -> where the "See jobs" button goes.
  const CA = /^America\/(Toronto|Vancouver|Edmonton|Winnipeg|Halifax|St_Johns|Regina|Montreal|Moncton|Glace_Bay|Goose_Bay|Iqaluit|Whitehorse|Yellowknife|Dawson|Dawson_Creek|Fort_Nelson|Swift_Current|Rankin_Inlet|Resolute|Cambridge_Bay|Inuvik|Thunder_Bay|Nipigon|Atikokan|Creston|Blanc-Sablon)$/;
  const US = /^America\/(New_York|Chicago|Denver|Los_Angeles|Phoenix|Anchorage|Detroit|Boise|Juneau|Sitka|Nome|Adak|Metlakatla|Yakutat|Menominee|Indiana\/.+|Kentucky\/.+|North_Dakota\/.+)$|^Pacific\/Honolulu$/;
  const TZ = {
    "Africa/Cairo": ["eg", "Egypt", "Egypt", "egypt.html"],
    "Asia/Riyadh": ["sa", "Saudi Arabia", "Saudi Arabia", "saudi-arabia.html"],
    "Asia/Dubai": ["ae", "United Arab Emirates", "the UAE", "uae.html"],
    "Asia/Qatar": ["qa", "Qatar", "Qatar", "qatar.html"],
    "Asia/Kuwait": ["kw", "Kuwait", "Kuwait", "kuwait.html"],
    "Asia/Bahrain": ["bh", "Bahrain", "Bahrain", "bahrain.html"],
    "Europe/London": ["uk", "United Kingdom", "the UK", ""],
    "Europe/Belfast": ["uk", "United Kingdom", "the UK", ""],
    "Europe/Berlin": ["de", "Germany", "Germany", ""],
    "Europe/Busingen": ["de", "Germany", "Germany", ""],
    "Asia/Kolkata": ["in", "India", "India", ""],
    "Asia/Calcutta": ["in", "India", "India", ""],
    "Asia/Karachi": ["pk", "Pakistan", "Pakistan", ""],
    "Africa/Johannesburg": ["za", "South Africa", "South Africa", ""],
    "Europe/Madrid": ["es", "Spain", "Spain", ""],
    "Atlantic/Canary": ["es", "Spain", "Spain", ""],
    "Asia/Manila": ["ph", "Philippines", "the Philippines", ""],
    "Asia/Jakarta": ["id", "Indonesia", "Indonesia", ""],
    "Asia/Makassar": ["id", "Indonesia", "Indonesia", ""],
    "Asia/Jayapura": ["id", "Indonesia", "Indonesia", ""],
    "Asia/Pontianak": ["id", "Indonesia", "Indonesia", ""],
    "Asia/Muscat": ["om", "Oman", "Oman", ""],
    "Africa/Kampala": ["ug", "Uganda", "Uganda", ""],
    "Europe/Athens": ["gr", "Greece", "Greece", ""],
    "Africa/Nairobi": ["ke", "Kenya", "Kenya", ""],
    "Europe/Paris": ["fr", "France", "France", ""],
    "Europe/Amsterdam": ["nl", "Netherlands", "the Netherlands", ""],
    "Europe/Brussels": ["be", "Belgium", "Belgium", ""],
    "Europe/Lisbon": ["pt", "Portugal", "Portugal", ""],
    "Atlantic/Madeira": ["pt", "Portugal", "Portugal", ""],
    "Atlantic/Azores": ["pt", "Portugal", "Portugal", ""],
    "America/Sao_Paulo": ["br", "Brazil", "Brazil", ""],
    "America/Bahia": ["br", "Brazil", "Brazil", ""],
    "America/Fortaleza": ["br", "Brazil", "Brazil", ""],
    "America/Recife": ["br", "Brazil", "Brazil", ""],
    "America/Belem": ["br", "Brazil", "Brazil", ""],
    "America/Manaus": ["br", "Brazil", "Brazil", ""],
    "America/Cuiaba": ["br", "Brazil", "Brazil", ""],
    "America/Campo_Grande": ["br", "Brazil", "Brazil", ""],
    "America/Maceio": ["br", "Brazil", "Brazil", ""],
    "America/Araguaina": ["br", "Brazil", "Brazil", ""],
    "America/Porto_Velho": ["br", "Brazil", "Brazil", ""],
    "America/Boa_Vista": ["br", "Brazil", "Brazil", ""],
    "America/Rio_Branco": ["br", "Brazil", "Brazil", ""],
    "America/Santarem": ["br", "Brazil", "Brazil", ""],
    "America/Noronha": ["br", "Brazil", "Brazil", ""],
    "America/Mexico_City": ["mx", "Mexico", "Mexico", ""],
    "America/Monterrey": ["mx", "Mexico", "Mexico", ""],
    "America/Cancun": ["mx", "Mexico", "Mexico", ""],
    "America/Merida": ["mx", "Mexico", "Mexico", ""],
    "America/Tijuana": ["mx", "Mexico", "Mexico", ""],
    "America/Chihuahua": ["mx", "Mexico", "Mexico", ""],
    "America/Hermosillo": ["mx", "Mexico", "Mexico", ""],
    "America/Mazatlan": ["mx", "Mexico", "Mexico", ""],
    "America/Matamoros": ["mx", "Mexico", "Mexico", ""],
    "America/Ciudad_Juarez": ["mx", "Mexico", "Mexico", ""],
    "America/Ojinaga": ["mx", "Mexico", "Mexico", ""],
    "America/Bahia_Banderas": ["mx", "Mexico", "Mexico", ""],
    "America/Buenos_Aires": ["ar", "Argentina", "Argentina", ""],
  };
  let g = TZ[tz] || (/^America\/Argentina\//.test(tz) ? ["ar", "Argentina", "Argentina", ""] : CA.test(tz) ? ["ca", "Canada", "Canada", ""] : US.test(tz) ? ["us", "United States", "the US", ""] : null);
  // shared with cvjobs.js: { cc, country, label } or null when the country is not one we cover
  window.UHVisitor = g ? { cc: g[0], country: g[1], label: g[2] } : null;
  let region, sub, btn, href;
  if (g) { region = g[0]; sub = `Next step: put it to work. We have live openings in ${g[2]} right now.`; btn = `See jobs in ${g[2]} →`; href = g[3] || "jobs.html?country=" + encodeURIComponent(g[1]); }
  else { region = "other"; sub = "Next step: put it to work. Browse open jobs from hundreds of job sites."; btn = "Browse open jobs →"; href = "jobs.html"; }

  let shown = false;
  function show(source) {
    if (shown) return; shown = true;
    const st = document.createElement("style");
    st.textContent = ".uhns-ov{position:fixed;inset:0;z-index:10000;background:rgba(5,11,63,.55);display:flex;align-items:center;justify-content:center;padding:16px;animation:uhnsFade .25s ease-out}" +
      ".uhns{position:relative;width:min(440px,100%);background:#fff;color:#141a52;border-radius:24px;padding:30px 26px 24px;text-align:center;box-shadow:0 30px 70px -20px rgba(5,11,63,.6);animation:uhnsPop .35s cubic-bezier(.2,.9,.3,1.2)}" +
      ".uhns-ic{width:76px;height:76px;margin:0 auto 14px;border-radius:22px;background:linear-gradient(145deg,#2a3cff,#0112ff 60%,#0a0fa0);display:grid;place-items:center;font-size:38px;box-shadow:0 8px 0 #070b7a,0 16px 30px -10px rgba(1,18,255,.6)}" +
      ".uhns h3{margin:0 0 8px;font-size:1.5rem;line-height:1.2}.uhns p{margin:0 0 20px;color:#5b6391;font-size:1rem;line-height:1.5}" +
      ".uhns a.uhns-go{display:block;background:#0112ff;color:#fff;font-weight:800;font-size:1.02rem;text-decoration:none;padding:14px 18px;border-radius:14px;box-shadow:0 5px 0 #0a0fa0}" +
      ".uhns a.uhns-aff{display:block;margin-top:12px;padding:11px 14px;border-radius:12px;background:#fff8e1;border:1.5px solid #ffe08a;color:#8a6100;font-weight:800;font-size:.92rem;text-decoration:none}.uhns a.uhns-aff:hover{background:#fff1c2}" +
      ".uhns a.uhns-go:hover{background:#0a1cff}.uhns button.uhns-later{margin-top:12px;border:0;background:none;color:#5b6391;font-weight:700;font-size:.92rem;cursor:pointer;font-family:inherit}" +
      ".uhns button.uhns-x{position:absolute;top:12px;right:12px;width:34px;height:34px;border:0;border-radius:50%;background:#eef1ff;color:#141a52;font-size:1.1rem;font-weight:800;cursor:pointer}" +
      ".uhns-jobs{margin:0 0 14px;text-align:left}.uhns-jl{margin:0 0 8px;font-size:.78rem;font-weight:800;letter-spacing:.06em;text-transform:uppercase;color:#0a8a4a;display:flex;align-items:center;gap:7px}.uhns-jl i{width:8px;height:8px;border-radius:50%;background:#12b76a;box-shadow:0 0 0 4px rgba(18,183,106,.18)}" +
      ".uhns a.uhns-job{display:flex;align-items:center;gap:10px;padding:10px 12px;margin-top:7px;border:1.5px solid #e3e7ff;border-radius:13px;text-decoration:none;color:#141a52;background:#f7f8ff}.uhns a.uhns-job:hover{border-color:#0112ff;background:#eef1ff}" +
      ".uhns-job b{display:block;font-size:.93rem;line-height:1.25;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.uhns-job small{display:block;margin-top:2px;color:#5b6391;font-size:.8rem;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.uhns-job span{min-width:0;flex:1}.uhns-job em{flex:none;font-style:normal;font-weight:800;font-size:.8rem;color:#0112ff}" +
      ".uhns-sk{height:54px;margin-top:7px;border-radius:13px;background:linear-gradient(90deg,#eef1ff,#f7f8ff,#eef1ff);background-size:200% 100%;animation:uhnsSk 1.1s linear infinite}@keyframes uhnsSk{to{background-position:-200% 0}}" +
      ".uhns.has-jobs{padding-top:24px}.uhns.has-jobs .uhns-ic{width:54px;height:54px;border-radius:16px;font-size:27px;margin-bottom:10px;box-shadow:0 5px 0 #070b7a}.uhns.has-jobs p{margin-bottom:14px;font-size:.95rem}.uhns.has-jobs a.uhns-go{background:#fff;color:#0112ff;border:1.5px solid #0112ff;box-shadow:none;padding:11px 16px;font-size:.95rem}.uhns.has-jobs a.uhns-go:hover{background:#eef1ff}.uhns{max-height:calc(100vh - 32px);overflow:auto}" +
      "@keyframes uhnsFade{from{opacity:0}to{opacity:1}}@keyframes uhnsPop{from{opacity:0;transform:scale(.92) translateY(10px)}to{opacity:1;transform:none}}" +
      "@media (prefers-reduced-motion:reduce){.uhns-ov,.uhns,.uhns-sk{animation:none}}";
    document.head.appendChild(st);
    const ov = document.createElement("div"); ov.className = "uhns-ov";
    ov.innerHTML = `<div class="uhns" role="dialog" aria-modal="true" aria-labelledby="uhns-t"><button type="button" class="uhns-x" aria-label="Close">×</button><div class="uhns-ic" aria-hidden="true">🎉</div><h3 id="uhns-t">Your CV is ready!</h3><p>${sub}</p><div class="uhns-jobs" hidden></div><a class="uhns-go" href="${href}">${btn}</a><a class="uhns-aff" href="https://skillsyncer.com/?via=uhirable" target="_blank" rel="noopener sponsored">Check it passes ATS with SkillSyncer →</a><button type="button" class="uhns-later">Maybe later</button></div>`;
    const close = () => { ov.remove(); document.removeEventListener("keydown", onKey); };
    const onKey = (e) => { if (e.key === "Escape") close(); };
    ov.addEventListener("click", (e) => { if (e.target === ov || e.target.closest(".uhns-x") || e.target.closest(".uhns-later")) close(); });
    ov.querySelector(".uhns-go").addEventListener("click", () => count("next-step/" + (source || "cv") + "-" + region, "CV ready → jobs (" + region + ")"));
    ov.querySelector(".uhns-aff").addEventListener("click", () => count("aff/skillsyncer-popup-" + (source || "cv"), "Affiliate click: SkillSyncer (CV ready window)"));
    document.addEventListener("keydown", onKey);
    document.body.appendChild(ov);
    // Three live jobs in the visitor's country, right inside the window. Each one opens the original ad.
    if (g) {
      const jb = ov.querySelector(".uhns-jobs"), dlg = ov.querySelector(".uhns");
      const esc = (t) => String(t || "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
      const kwEl = document.getElementById("f-title"); const kw = kwEl && kwEl.value ? kwEl.value.trim() : "";
      const head = `<div class="uhns-jl"><i></i>Hiring now in ${esc(g[2])}</div>`;
      jb.hidden = false; dlg.classList.add("has-jobs"); jb.innerHTML = head + '<div class="uhns-sk"></div><div class="uhns-sk"></div><div class="uhns-sk"></div>';
      const API = "https://uhirable-jobs.amel-moussa10.workers.dev/";
      const get = (u) => fetch(u).then((r) => (r.ok ? r.json() : { jobs: [] })).catch(() => ({ jobs: [] }));
      const late = new Promise((r) => setTimeout(() => r(null), 7000));
      const pull = (k) => Promise.all([
        window.UHWJF && UHWJF.has(g[0]) ? UHWJF.fetch(g[0], k, null, 1).catch(() => ({ jobs: [] })) : { jobs: [] },
        g[0] === "us" ? get(API + "?src=lensa&q=" + encodeURIComponent(k) + "&page=1") : { jobs: [] },
        get(API + "?src=jooble&cc=" + g[0] + "&q=" + encodeURIComponent(k) + "&page=1"),
      ]).then(([w, l, j]) => { const L = [l.jobs || [], w.jobs || [], (j.jobs || []).filter((x) => !uhBad(x))], o = []; for (let k2 = 0; k2 < 3; k2++) L.forEach((a) => { if (a[k2]) o.push(a[k2]); }); return o.filter((x) => x && x.title && x.link).slice(0, 3); });
      Promise.race([pull(kw).then((o) => (o.length || !kw ? o : pull(""))), late]).then((jobs) => {
        if (!ov.isConnected) return;
        if (!jobs || !jobs.length) { jb.hidden = true; dlg.classList.remove("has-jobs"); return; }
        jb.innerHTML = head + jobs.map((j) => `<a class="uhns-job" href="${esc(j.link)}" target="_blank" rel="noopener nofollow${j.source === "lensa" || j.source === "whatjobs" ? " sponsored" : ""}" data-src="${esc(j.source || "jooble")}"><span><b>${esc(j.title)}</b><small>${esc([j.source === "whatjobs" ? "" : j.company, j.location].filter(Boolean).join(" · ") || g[1])}</small></span><em>Apply →</em></a>`).join("");
        ov.querySelector(".uhns-go").textContent = "See all jobs in " + g[2] + " →";
        count("popup-jobs/" + region, "CV ready window: jobs shown (" + region + ")");
      });
      jb.addEventListener("click", (e) => { const a = e.target.closest("a[data-src]"); if (a) { count("out/" + a.dataset.src, "Job click: " + a.dataset.src); count("popup-job-click/" + region, "CV ready window: job click (" + region + ")"); } });
    }
    const go = ov.querySelector(".uhns-go"); try { go.focus({ preventScroll: true }); } catch (e) {}
  }
  window.UHNextStep = (source) => setTimeout(() => show(source), 700);
})();
