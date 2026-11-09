const UA_BASE = (() => { try { const p = location.pathname.replace(/^\/jobs\//, "/"); const n = p.split("/").filter(Boolean).length; return n > 1 ? "../".repeat(n - 1) : ""; } catch (e) { return ""; } })();
// ---------- Footer year (all pages) ----------
const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = new Date().getFullYear();

// ---------- 3D tilt effect (cards follow the mouse) ----------
const canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function bindTilt(root = document) {
  if (!canHover || reduceMotion) return;
  root.querySelectorAll("[data-tilt]").forEach((el) => {
    if (el.dataset.tiltBound) return;
    el.dataset.tiltBound = "1";
    const max = parseFloat(el.dataset.tiltMax || 12);

    el.addEventListener("mousemove", (e) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width;
      const y = (e.clientY - r.top) / r.height;
      el.style.transition = "transform .08s linear";
      el.style.transform =
        `perspective(1000px) rotateX(${(0.5 - y) * max}deg) rotateY(${(x - 0.5) * max}deg) translateY(-6px)`;
      el.style.setProperty("--mx", `${x * 100}%`);
      el.style.setProperty("--my", `${y * 100}%`);
    });
    el.addEventListener("mouseleave", () => {
      el.style.transition = "transform .5s ease";
      el.style.transform = "";
    });
  });
}
bindTilt();

// ---------- Hero typing bubble ----------
const typedEl = window.__cloud ? null : document.getElementById("typed");
if (typedEl) {
  const lines = [
    "Hi, I'm Amel 👋",
    "I've always believed the right job changes more than a career…",
    "…it can change the life of an entire family.",
    "As a Global Talent Acquisition Partner, I see it every day.",
    "That's why I built U Hirable…",
    "…to help job seekers get hired, companies hire great talent, and everyone grow their careers."
  ];
  if (reduceMotion) {
    typedEl.textContent = lines.join(" ");
  } else {
    let li = 0, ci = 0, deleting = false;
    const tick = () => {
      const full = lines[li];
      const chars = Array.from(full);
      ci += deleting ? -1 : 1;
      typedEl.textContent = chars.slice(0, ci).join("");
      let wait = deleting ? 28 : 55;
      if (!deleting && ci === chars.length) { deleting = true; wait = 1700; }
      else if (deleting && ci === 0) { deleting = false; li = (li + 1) % lines.length; wait = 350; }
      setTimeout(tick, wait);
    };
    typedEl.textContent = "";
    setTimeout(tick, 500);
  }
}

// ---------- Reveal on scroll ----------
const io = "IntersectionObserver" in window
  ? new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
      });
    }, { threshold: 0.12 })
  : null;
document.querySelectorAll(".reveal").forEach((el) => (io ? io.observe(el) : el.classList.add("in")));

// ---------- Employer form (employer.html) ----------
const form = document.getElementById("employer-form");
if (form) {
  const status = document.getElementById("form-status");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (form.action.includes("YOUR_FORM_ID")) {
      status.textContent = "Form isn't connected yet — add your Formspree ID in employer.html.";
      status.className = "form-status error";
      return;
    }

    const button = form.querySelector("button");
    button.disabled = true;
    button.textContent = "Sending...";

    try {
      const res = await fetch(form.action, {
        method: "POST",
        body: new FormData(form),
        headers: { Accept: "application/json" }
      });
      if (!res.ok) throw new Error();
      form.reset();
      status.textContent = "Thank you! We received your request and will contact you soon.";
      status.className = "form-status success";
    } catch {
      status.textContent = "Something went wrong. Please try again.";
      status.className = "form-status error";
    } finally {
      button.disabled = false;
      button.textContent = "Send request";
    }
  });
}

// ---------- Shared job helpers ----------
const arr = (v) => (Array.isArray(v) ? v : v ? [v] : []);
const escapeHTML = (s = "") =>
  String(s).replace(/[&<>"']/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch]));
const WORLDWIDE = "Worldwide";
const jobCountries = (j) => arr(j.countries || j.locations || j.country);
const jobId = (j) => j.id || String(j.title).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const jobPage = (j) => UA_BASE + (j.page || `job.html?id=${encodeURIComponent(jobId(j))}`);
const jobApply = (j) => {
  const link = j.applyLink || (typeof APPLY_FORM !== "undefined" ? APPLY_FORM : "");
  // Tally forms: pass the job name into the hidden "job" field
  if (/^https:\/\/tally\.so\//.test(link)) {
    return link + (link.includes("?") ? "&" : "?") + "job=" + encodeURIComponent(`${j.title} – ${j.company}`);
  }
  return link;
};
const FLAG_CODES = {
  "United States": "us", "Canada": "ca", "United Kingdom": "gb", "Germany": "de", "Egypt": "eg",
  "Saudi Arabia": "sa", "UAE": "ae", "United Arab Emirates": "ae", "Jordan": "jo", "Lebanon": "lb",
  "Qatar": "qa", "Kuwait": "kw", "Bahrain": "bh", "Oman": "om", "France": "fr", "Netherlands": "nl",
  "Spain": "es", "Portugal": "pt", "Poland": "pl", "Ireland": "ie", "India": "in", "Singapore": "sg", "Australia": "au", "Brazil": "br", "Mexico": "mx"
};
// real flag images (emoji flags don't render on Windows)
const flagOf = (c) =>
  c === WORLDWIDE ? "🌍"
  : FLAG_CODES[c] ? `<img class="flag" src="https://flagcdn.com/w40/${FLAG_CODES[c]}.png" alt="${escapeHTML(c)}" width="20" height="15" loading="lazy">`
  : "📍";
const ELIG_ICON = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M12 7v6M12 16.5v.5"/></svg>';
const eligHTML = (j) => j.eligibility ? `<p class="elig">${ELIG_ICON}<span>${escapeHTML(j.eligibility)}</span></p>` : "";
const MATCH_NOTE = "Apply through U Hirable and get matched with this role and 1,000+ top companies.";
const jobChips = (j) =>
  [
    j.location
      ? `<span class="chip gold">📍 ${escapeHTML(j.location)}</span>`
      : "",
    ...arr(j.tags).map((t) => `<span class="chip">${escapeHTML(t)}</span>`),
    ...(j.location ? [] : jobCountries(j).map((c) => `<span class="chip gold">${c === WORLDWIDE ? "🌍" : "📍"} ${escapeHTML(c)}</span>`))
  ].join("");

document.addEventListener("click", (e) => {
  const a = e.target.closest(".apply-btn");
  if (a && (!a.getAttribute("href") || a.getAttribute("href") === "#")) {
    e.preventDefault();
    alert("Applications open soon — please check back!");
  }
});

// Job icons: AI engineer → computer + AI, software/tech engineer → laptop, everything else → briefcase
const ICON_SVG = (p) => `<svg class="ji" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>`;
const JOB_ICONS = {
  ai: ICON_SVG('<rect x="2.5" y="3.5" width="19" height="13" rx="2"/><path d="M8 20.5h8M12 16.5v4"/><path d="M7.6 13l1.9-6 1.9 6M8.2 11.2h2.6M14.6 7v6" stroke-width="1.8"/>'),
  tech: ICON_SVG('<rect x="4" y="4.5" width="16" height="11" rx="1.6"/><path d="M2 19.5h20"/><path d="M10 9l-2 1.5 2 1.5M14 9l2 1.5-2 1.5" stroke-width="1.7"/>'),
  job: ICON_SVG('<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"/><path d="M3 13h18M12 12v2"/>')
};
const jobIcon = (j) => {
  const t = j.title || "";
  if (/tooling engineer/i.test(t)) return JOB_ICONS.job;
  if (/\b(AI|ML)\b|machine learning/i.test(t) && /engineer|research|technical staff|scientist/i.test(t)) return JOB_ICONS.ai;
  if (/engineer|developer|software|technical staff|programmer/i.test(t)) return JOB_ICONS.tech;
  return JOB_ICONS.job;
};

const REMOTIVE_LINK = "https://remotive.com/join?via=uhirable";
// Remotive public API (their terms: link back to the job on Remotive and credit Remotive). Fetched once per visit, cached 6h.
const RM_CACHE_KEY = "rm-jobs-v1";
function rmCard(j) {
  const loc = j.candidate_required_location || "Worldwide";
  const sal = j.salary ? `<span class="chip gold">${escapeHTML(j.salary)}</span>` : "";
  const logo = j.company_logo ? `<img src="${escapeHTML(j.company_logo)}" alt="" loading="lazy" onerror="this.style.visibility='hidden'">` : "";
  return `<a class="rm-card" href="${escapeHTML(j.url)}" target="_blank" rel="noopener nofollow">
    <div class="rm-top">${logo}<div><b>${escapeHTML(j.title)}</b><span>${escapeHTML(j.company_name || "")}</span></div></div>
    <div class="chips"><span class="chip">${escapeHTML(j.category || "Remote")}</span><span class="chip gold">🌍 ${escapeHTML(loc)}</span>${sal}</div>
    <em>View on Remotive →</em></a>`;
}
function fillRemotive() {
  const row = document.getElementById("rm-row");
  if (!row) return;
  const paint = (jobs) => { row.innerHTML = jobs.slice(0, 12).map(rmCard).join(""); };
  try {
    const c = JSON.parse(sessionStorage.getItem(RM_CACHE_KEY) || "null");
    if (c && Date.now() - c.t < 6 * 3600e3 && c.jobs.length) { paint(c.jobs); return; }
  } catch {}
  fetch("https://remotive.com/api/remote-jobs?limit=12").then((r) => r.json()).then((d) => {
    const jobs = (d && d.jobs) || [];
    if (!jobs.length) throw new Error("empty");
    paint(jobs);
    try { sessionStorage.setItem(RM_CACHE_KEY, JSON.stringify({ t: Date.now(), jobs })); } catch {}
  }).catch(() => {
    row.innerHTML = `<p class="rm-loading">Hand-picked remote jobs at tech companies, updated every day. Work from anywhere.</p>`;
  });
}
document.addEventListener("DOMContentLoaded", fillRemotive);

// ---------- Jobs list + country filter (jobs.html) ----------
const list = document.getElementById("jobs-list");
if (list && typeof JOBS !== "undefined") {
  const countrySelect = document.getElementById("country-filter");
  const searchBox = document.getElementById("search-box");
  const countEl = document.getElementById("jobs-count");

  const all = JOBS.flatMap(jobCountries);
  const opts = [...new Set(all.filter((c) => c !== WORLDWIDE))].sort();
  if (all.includes(WORLDWIDE)) opts.unshift(WORLDWIDE);
  opts.forEach((c) => {
    const opt = document.createElement("option");
    opt.value = c;
    opt.textContent = c === WORLDWIDE ? "🌍 Worldwide (remote, any country)" : c;
    countrySelect.appendChild(opt);
  });

  // Promo cards (Paraform + Remotive) shown first; Paraform only for its countries
  const PF_COUNTRIES = ["United States","United Kingdom","Canada","Austria","Belgium","Bulgaria","Croatia","Cyprus","Czech Republic","Denmark","Estonia","Finland","France","Germany","Greece","Hungary","Ireland","Italy","Latvia","Lithuania","Luxembourg","Malta","Netherlands","Norway","Poland","Portugal","Romania","Slovakia","Slovenia","Spain","Sweden","Switzerland"];
  function promoCards(country, q) {
    if (q || window.JOB_FILTER) return "";
    const pf = (country === "all" || PF_COUNTRIES.includes(country)) ? `
        <article class="job-card promo-card pf-card">
          <span class="promo-badge">Get matched</span>
          <div class="job-head">
            <img class="promo-logo pf-logo" src="logo-paraform.svg" width="52" height="52" alt="Paraform">
            <div>
              <h3>Get matched with 1,000+ top companies</h3>
              <p class="meta">Paraform · AI, Tech, Sales &amp; GTM roles</p>
            </div>
          </div>
          <div class="chips"><span class="chip pc">📍 United States</span><span class="chip pc">📍 United Kingdom</span><span class="chip pc">📍 Canada</span><span class="chip pc">📍 Europe</span><span class="chip">Remote</span><span class="chip">Hybrid</span><span class="chip">On-site</span></div>
          <p class="desc">Didn't find your role? Share your profile once and get matched with open roles at top startups and tech companies.</p>
          <div class="job-actions"><a class="btn btn-sm promo-btn" href="${PARAFORM_LINK}" target="_blank" rel="noopener">Get matched →</a></div>
        </article>` : "";
    const rm = `
        <article class="job-card promo-card rm-promo">
          <span class="promo-badge">More remote jobs</span>
          <div class="job-head">
            <img class="promo-logo" src="logo-remotive.svg" width="52" height="52" alt="Remotive">
            <div>
              <h3>Browse more remote jobs on Remotive</h3>
              <p class="meta">Remotive · Remote job board</p>
            </div>
          </div>
          <div class="chips"><span class="chip pc">🌍 Worldwide</span><span class="chip pc">100% Remote</span><span class="chip">Tech</span><span class="chip">Marketing</span><span class="chip">Sales</span><span class="chip">Customer Support</span></div>
          <p class="desc">Hand-picked remote jobs at tech companies, updated every day. Work from anywhere.</p>
          <div class="job-actions"><a class="btn btn-sm promo-btn" href="${REMOTIVE_LINK}" target="_blank" rel="noopener sponsored">Browse remote jobs →</a></div>
        </article>`;
    return pf + rm;
  }

  function render() {
    const country = countrySelect.value;
    const q = searchBox.value.trim().toLowerCase();

    const topic = window.JOB_FILTER;
    const topicOk = (j) => !topic || (topic === "visa" ? arr(j.tags).some((t) => /^(visa (sponsorship|transfer)|relocation)/i.test(t)) : arr(j.tags).some((t) => /^(fully )?remote$/i.test(t)));
    const filtered = JOBS.filter((j) => {
      if (!topicOk(j)) return false;
      const matchCountry = country === "all" || jobCountries(j).includes(country) || jobCountries(j).includes(WORLDWIDE);
      const text = [j.title, j.company, j.industry, j.brief, ...arr(j.tags), ...jobCountries(j)].join(" ").toLowerCase();
      return matchCountry && (!q || text.includes(q));
    });

    countEl.textContent = filtered.length ? `${filtered.length} open position${filtered.length === 1 ? "" : "s"}` : "";

    if (filtered.length === 0) {
      list.innerHTML = `
        <div class="empty">
          <div class="icon3d"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg></div>
          No jobs match your filters right now. Check back soon!
        </div>`;
      return;
    }

    list.innerHTML = promoCards(country, q) + filtered
      .map((j, i) => `
        <article class="job-card">
          <div class="job-head">
            ${j.logo ? `<div class="icon3d co-logo"><img src="${escapeHTML(j.logo)}" width="64" height="64" alt="${escapeHTML(j.company || "")} logo" loading="lazy"></div>` : `<div class="icon3d ${i % 2 ? "gold" : ""}">${jobIcon(j)}</div>`}
            <div>
              <h3>${escapeHTML(j.title)}</h3>
              <p class="meta">${escapeHTML(j.company || "")}${j.industry ? " · " + escapeHTML(j.industry) : ""}</p>
            </div>
          </div>
          <div class="chips">${jobChips(j)}</div>${eligHTML(j)}
          <p class="desc">${escapeHTML(j.brief || "")}</p>
          <div class="job-actions">
            <a class="btn btn-primary btn-sm apply-btn" href="${escapeHTML(jobApply(j))}" target="_blank" rel="noopener">Apply →</a>
            <a class="btn btn-sm btn-soft" href="${jobPage(j)}">More details</a>
          </div>
        </article>`)
      .join("");
  }

  countrySelect.addEventListener("change", render);
  searchBox.addEventListener("input", render);
  render();
}

// ---------- Single job page (job.html) ----------
const jobContent = document.getElementById("job-content");
if (jobContent && typeof JOBS !== "undefined") {
  const id = window.JOB_ID || new URLSearchParams(location.search).get("id");
  const j = JOBS.find((x) => jobId(x) === id);

  if (!j) {
    document.getElementById("job-title").textContent = "This position has been filled";
    document.getElementById("job-meta").textContent = "Thanks for your interest! Browse our other open roles.";
    document.getElementById("job-body").innerHTML =
      `<div class="panel" style="text-align:center"><a class="btn btn-primary" href="${UA_BASE}jobs.html">See all open jobs</a></div>`;
  } else {
    if (!window.JOB_ID) document.title = `${j.title} – U Hirable`;
    document.getElementById("job-title").textContent = j.title;
    document.getElementById("job-meta").textContent = [j.company, j.industry].filter(Boolean).join(" · ");
    document.getElementById("job-chips").innerHTML = jobChips(j);
    document.getElementById("job-apply").href = jobApply(j) || "#";

    const list = (title, items) =>
      arr(items).length ? `<h2>${title}</h2><ul>${arr(items).map((t) => `<li>${escapeHTML(t)}</li>`).join("")}</ul>` : "";
    // Share buttons
    const url = new URL(jobPage(j), location.href).href;
    const msg = `${j.title} – we're hiring! Apply here:`;
    document.getElementById("share-li").href = "https://www.linkedin.com/sharing/share-offsite/?url=" + encodeURIComponent(url);
    document.getElementById("share-wa").href = "https://wa.me/?text=" + encodeURIComponent(msg + " " + url);
    document.getElementById("share-copy").addEventListener("click", async () => {
      const status = document.getElementById("copy-status");
      try {
        await navigator.clipboard.writeText(url);
      } catch {
        const t = document.createElement("textarea");
        t.value = url; document.body.appendChild(t); t.select(); document.execCommand("copy"); t.remove();
      }
      status.textContent = "Link copied ✓";
      setTimeout(() => (status.textContent = ""), 2500);
    });

    jobContent.innerHTML =
      eligHTML(j) + `<h2>Role overview</h2><p>${escapeHTML(j.overview || j.brief || "")}</p>` +
      (j.compensation ? `<h2>Compensation</h2><p>${escapeHTML(j.compensation)}</p>` : "") +
      list("Key responsibilities", j.responsibilities) +
      (arr(j.responsibilityGroups).length
        ? `<h2>Key responsibilities</h2>` + j.responsibilityGroups.map(([g, items]) =>
            `<h3>${escapeHTML(g)}</h3><ul>${arr(items).map((t) => `<li>${escapeHTML(t)}</li>`).join("")}</ul>`).join("")
        : "") +
      list("Requirements", j.requirements) +
      list("Nice to have", j.preferred) +
      list("What to submit", j.submissions) +
      (j.matchNote ? `<p class="match-note big">✨ ${MATCH_NOTE}</p>` : "") +
      `<div class="detail-apply"><a class="btn btn-primary apply-btn" href="${escapeHTML(jobApply(j) || "#")}" target="_blank" rel="noopener">Apply →</a></div>`;
    if (j.matchNote) {
      const p = document.querySelector(".apply-card > p");
      if (p) p.textContent = MATCH_NOTE;
    }
  }
}

// Nav dropdown (For Job Seekers): click to open on touch screens
document.querySelectorAll(".dd-t").forEach((b) => {
  b.addEventListener("click", (e) => {
    e.stopPropagation();
    const d = b.parentElement;
    document.querySelectorAll(".dd.open").forEach((x) => { if (x !== d) x.classList.remove("open"); });
    d.classList.toggle("open");
    b.setAttribute("aria-expanded", d.classList.contains("open"));
  });
});
document.addEventListener("click", () => document.querySelectorAll(".dd.open").forEach((d) => d.classList.remove("open")));

// ---------- Site search (header) ----------
(function(){
  const q=document.getElementById("hs-q"),res=document.getElementById("hs-res");
  if(!q)return;
  let loading=null;
  const load=()=>loading||(loading=new Promise(r=>{if(window.SEARCH_INDEX)return r();const s=document.createElement("script");s.src=UA_BASE+"search-index.js?v=18";s.onload=r;s.onerror=r;document.head.appendChild(s);}));
  const esc=(s="")=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const norm=s=>String(s).toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g,"");
  const ORDER={"Page":0,"Job":1,"CV Tool":2,"Career Tool":3,"Hiring Partner":4,"Job Site":5,"Event":6};
  function run(){
    const v=norm(q.value.trim());
    if(v.length<2||!window.SEARCH_INDEX){res.hidden=true;return;}
    const words=v.split(/\s+/);
    const hits=window.SEARCH_INDEX.map(e=>{const t=norm(e.t),all=t+" "+norm(e.d)+" "+norm(e.k);
      if(!words.every(w=>all.includes(w)))return null;
      let s=0;if(t.startsWith(v))s+=6;if(t.includes(v))s+=3;words.forEach(w=>{if(t.includes(w))s+=2;});
      return {e,s};}).filter(Boolean).sort((a,b)=>b.s-a.s||ORDER[a.e.k]-ORDER[b.e.k]).slice(0,8);
    res.innerHTML=hits.length?hits.map(({e})=>`<a href="${esc(e.u)}"${e.x?' target="_blank" rel="noopener"':""}><span class="hs-k k-${esc(e.k.replace(/\s+/g,"-").toLowerCase())}">${esc(e.k)}</span><span class="hs-t"><b>${esc(e.t)}</b><small>${esc(e.d)}</small></span>${e.x?"<i>↗</i>":""}</a>`).join("")
      :`<div class="hs-none">No results for “${esc(q.value.trim())}”</div>`;
    res.hidden=false;
  }
  q.addEventListener("focus",()=>load().then(run));
  q.addEventListener("input",()=>load().then(run));
  q.addEventListener("keydown",e=>{
    const links=[...res.querySelectorAll("a")];const i=links.indexOf(document.activeElement);
    if(e.key==="Enter"&&links[0]){e.preventDefault();links[0].click();}
    if(e.key==="ArrowDown"&&links[0]){e.preventDefault();links[0].focus();}
    if(e.key==="Escape"){res.hidden=true;q.blur();}
  });
  res.addEventListener("keydown",e=>{const links=[...res.querySelectorAll("a")];const i=links.indexOf(document.activeElement);
    if(e.key==="ArrowDown"){e.preventDefault();(links[i+1]||links[i]).focus();}
    if(e.key==="ArrowUp"){e.preventDefault();i>0?links[i-1].focus():q.focus();}});
  document.addEventListener("click",e=>{if(!e.target.closest(".hsearch"))res.hidden=true;});
})();

// ---------- U Hirable assistant (rule-based, no AI, works offline) ----------
(function () {
  if (document.getElementById("ua-btn")) return;
  const WA = "https://wa.me/201515594609", BASE = "";
  const ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 5h16v11H8l-4 4z"/><path d="M8 9h8M8 12h5"/></svg>';
  const btn = document.createElement("button"); btn.id = "ua-btn"; btn.className = "ua-btn"; btn.type = "button"; btn.setAttribute("aria-label", "Ask Lilo"); btn.className += " img"; btn.innerHTML = "<span class=\"lilo-av\"><img src=\"" + UA_BASE + "robot-head.webp\" alt=\"\"><svg class=\"lilo-hand\" viewBox=\"0 0 40 44\" aria-hidden=\"true\"><path d=\"M10 24 V12 a3 3 0 0 1 6 0 V8 a3 3 0 0 1 6 0 v2 a3 3 0 0 1 6 0 v4 a3 3 0 0 1 6 0 v12 a12 12 0 0 1 -24 0z\" fill=\"#fff\" stroke=\"#c9cffd\" stroke-width=\"2\"/><circle cx=\"22\" cy=\"30\" r=\"4\" fill=\"#4fb6ff\"/></svg><i class=\"lilo-hi\">Hi!</i></span><span>Ask Lilo</span>";
  const panel = document.createElement("div"); panel.className = "ua-panel"; panel.setAttribute("role", "dialog"); panel.setAttribute("aria-label", "Lilo, the U Hirable assistant");
  panel.innerHTML = `<div class="ua-head">${ICON}<div><b>Lilo</b><small>Your U Hirable guide. Ask about jobs, visas, CV tools or job sites</small></div><button type="button" aria-label="Close">✕</button></div>
    <div class="ua-log" id="ua-log"></div>
    <div class="ua-chips" id="ua-chips"></div>
        <form class="ua-in" id="ua-form"><label class="ua-clip" title="Upload your CV, get matched" aria-label="Upload your CV"><input type="file" id="ua-file" accept=".pdf,.docx,.txt" hidden><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.4 11.1 12.3 20.2a6 6 0 0 1-8.5-8.5l9.2-9.2a4 4 0 0 1 5.7 5.7l-9.2 9.1a2 2 0 0 1-2.8-2.8l8.5-8.5"/></svg></label><input id="ua-q" type="text" placeholder="Ask Lilo, or 📎 upload your CV" autocomplete="off"><button type="submit">Send</button></form>`;
  document.body.append(btn, panel);
  const log = panel.querySelector("#ua-log"), chips = panel.querySelector("#ua-chips"), form = panel.querySelector("#ua-form"), q = panel.querySelector("#ua-q");
  const CHIPS = ["Remote jobs", "Visa sponsorship", "Fix my CV", "Jobs in UAE", "Job sites", "Hire talent"];
  const say = (html, me) => { const d = document.createElement("div"); d.className = "ua-m " + (me ? "me" : "bot"); d.dir = "auto"; if (me) d.textContent = html; else d.innerHTML = html; log.appendChild(d); log.scrollTop = log.scrollHeight; };
  const setChips = (list) => { chips.innerHTML = list.map((c) => `<button type="button">${escapeHTML(c)}</button>`).join(""); };
  chips.addEventListener("click", (e) => { const b = e.target.closest("button"); if (b) ask(b.textContent); });
  const L = (t, u) => `<a href="${/^https?:/.test(u) ? u : UA_BASE + u}">${t}</a>`;
  let idx = null, loading = null;
  const loadIdx = () => loading || (loading = new Promise((r) => { if (window.SEARCH_INDEX) { idx = window.SEARCH_INDEX; return r(); } const s = document.createElement("script"); s.src = UA_BASE + "search-index.js?v=18"; s.onload = () => { idx = window.SEARCH_INDEX || []; r(); }; s.onerror = r; document.head.appendChild(s); }));
  const find = (words, kinds, n) => (idx || []).filter((e) => (!kinds || kinds.includes(e.k)) && words.some((w) => (e.t + " " + e.d).toLowerCase().includes(w))).slice(0, n || 5);
  const list = (items) => items.length ? "<ul>" + items.map((e) => `<li>${L(escapeHTML(e.t), e.u)}${e.d ? " <small>· " + escapeHTML(e.d) + "</small>" : ""}</li>`).join("") + "</ul>" : "";
  const COUNTRIES = ["egypt", "uae", "dubai", "saudi", "riyadh", "qatar", "kuwait", "bahrain", "oman", "jordan", "morocco", "tunisia", "nigeria", "kenya", "south africa", "united states", "usa", "us", "canada", "uk", "united kingdom", "london", "ireland", "germany", "france", "netherlands", "spain", "portugal", "poland", "italy", "india", "pakistan", "singapore", "australia", "japan", "korea", "china", "philippines", "thailand", "indonesia", "brazil", "mexico", "europe", "gulf", "africa", "asia", "remote"];
  const ALIAS = { usa: "united states", us: "united states", uk: "united kingdom", dubai: "uae", riyadh: "saudi", london: "united kingdom" };
  const AR_COUNTRIES = { "مصر": "egypt", "الامارات": "uae", "دبي": "uae", "ابوظبي": "uae", "السعوديه": "saudi", "السعودية": "saudi", "الرياض": "saudi", "جده": "saudi", "قطر": "qatar", "الكويت": "kuwait", "البحرين": "bahrain", "عمان": "oman", "الاردن": "jordan", "المغرب": "morocco", "تونس": "tunisia", "نيجيريا": "nigeria", "كينيا": "kenya", "جنوب افريقيا": "south africa", "امريكا": "united states", "الولايات المتحده": "united states", "كندا": "canada", "بريطانيا": "united kingdom", "انجلترا": "united kingdom", "لندن": "united kingdom", "ايرلندا": "ireland", "المانيا": "germany", "فرنسا": "france", "هولندا": "netherlands", "اسبانيا": "spain", "البرتغال": "portugal", "بولندا": "poland", "ايطاليا": "italy", "الهند": "india", "باكستان": "pakistan", "سنغافوره": "singapore", "استراليا": "australia", "اليابان": "japan", "كوريا": "korea", "الصين": "china", "الفلبين": "philippines", "تايلاند": "thailand", "اندونيسيا": "indonesia", "البرازيل": "brazil", "المكسيك": "mexico", "اوروبا": "europe", "الخليج": "gulf", "افريقيا": "africa", "اسيا": "asia" };
  const norm = (x) => x.replace(/[أإآ]/g, "ا").replace(/ى/g, "ي").replace(/ة/g, "ه").replace(/ؤ/g, "و").replace(/ئ/g, "ي").replace(/[ً-ْـ]/g, "");
  function reply(text) {
    const t = norm(text.toLowerCase().trim()); const ar = /[؀-ۿ]/.test(t);
    const has = (...w) => w.some((x) => t.includes(norm(x)));
    const WAL = L(ar ? "واتساب" : "WhatsApp", WA);
    if (has("hi", "hello", "hey", "مرحبا", "اهلا", "السلام", "هاي", "ازيك") && t.length < 25) return (ar ? "أهلاً! أنا Lilo. ارفع السي في وهلاقيلك أقرب وظايف ليك في ثواني، أو اسألني عن وظايف ريموت، أو وظايف فيها فيزا، أو أدوات سي في مجانية، أو مواقع التوظيف في بلدك." : "Hi, I'm Lilo! Upload your CV and I'll find your closest roles in seconds, or ask me about remote jobs, visas, free CV tools and job sites.");
    if (has("visa", "sponsor", "h1b", "h-1b", "relocat", "فيزا", "كفاله", "اقامه", "تأشيره", "تاشيره", "سفر", "هجره")) return (ar ? "دي الوظايف اللي فيها كفالة فيزا أو بتقبل نقل فيزا: " : "These roles sponsor a work visa or accept a visa transfer: ") + L(ar ? "وظايف فيها فيزا" : "Jobs with visa sponsorship", "visa-sponsorship-jobs.html") + (ar ? "<br>اقرا سطر \"Who can apply\" في كل وظيفة قبل ما تقدّم." : "<br>Always read the \"Who can apply\" line on each job before applying.");
    if (has("remote", "work from home", "wfh", "anywhere", "ريموت", "من البيت", "عن بعد", "اونلاين", "اون لاين", "من المنزل")) return (ar ? "كل الوظايف الريموت هنا، وكل وظيفة مكتوب عليها الدول المسموح تقدّم منها: " : "All fully remote roles are here, each showing the countries you can apply from: ") + L(ar ? "وظايف ريموت" : "Remote jobs", "remote-jobs.html") + "<br>" + (ar ? "وكمان مواقع الوظايف الريموت: " : "More remote job sites: ") + L(ar ? "مواقع الوظايف الريموت" : "Job Sites → Remote", "job-sites.html");
    if (has("cv", "resume", "ats", "cover letter", "سي في", "سيره", "سيفي", "cv ", "الcv", "ريزومي")) return (ar ? "أدوات مجانية تبني بيها السي في وتتأكد إنه يعدّي الـ ATS (كل أداة مكتوب عليها إيه المجاني فيها): " : "Free tools to build your CV and check it passes ATS filters (each one shows what's free): ") + L(ar ? "أدوات السي في" : "CV Tools", "cv-tools.html") + (ar ? "<br>وعايز تعرف لو السي في مناسب لوظيفة معينة؟ " + L("CV Match Checker", "cv-match.html") + " بيقولك في 30 ثانية.<br>أو ارفع السي في هنا من 📎 وهطابقه بالوظايف المفتوحة.<br>نصيحة: خلي أول تلت في السي في مطابق لعنوان الوظيفة وكلماتها." : "<br>Checking your CV against one job ad? Use the " + L("CV Match Checker", "cv-match.html") + " (30 seconds).<br>Or upload your CV here with the 📎 clip and I'll match it to open roles.<br>Tip: match the top third of your CV to the job title and keywords.");
    if (has("linkedin", "profile", "لينكد", "بروفايل")) return (ar ? "عشان الريكروترز يلاقوك على لينكدإن: حط عنوان واضح فيه الوظيفة اللي بتدور عليها، وفعّل Open to Work، وانشر مرة في الأسبوع. وتابع " : "To get found by recruiters on LinkedIn: use a clear headline with the role you want, turn on Open to Work, and post once a week. Also follow ") + L(ar ? "U Hirable على لينكدإن" : "U Hirable on LinkedIn", "https://www.linkedin.com/company/uhirable") + (ar ? " عشان الوظايف الأسبوعية." : " for weekly roles.");
    if (has("hire", "recruit", "post a job", "employer", "candidates", "توظيف", "اوظف", "محتاج موظف", "عاوز موظف", "عايز موظف", "مرشحين")) return (ar ? "عايز توظف؟ قولنا عن الوظيفة وهنلاقيلك الناس المناسبة: " : "Hiring? Tell us about the role and we'll find the right people: ") + L(ar ? "وظّف معانا" : "Hire Talent", "employer.html") + "<br>" + (ar ? "وأدوات التوظيف والرواتب بعروض خاصة: " : "Hiring, payroll and EOR tools with exclusive perks: ") + L(ar ? "شركاء التوظيف" : "Hiring Partners", "partners.html");
    if (has("partner", "payroll", "eor", "oyster", "staffing", "ats software", "crm")) return "Hiring tools with exclusive perks (EOR, payroll, staffing, recruiting software): " + L("Hiring Partners", "partners.html");
    if (has("event", "conference", "fair", "summit", "معرض", "مؤتمر", "فعاليات", "ايفنت")) return (ar ? "فعاليات التوظيف ومعارض الوظايف ومؤتمرات الـ HR حوالين العالم: " : "Hiring events, career fairs and HR conferences around the world: ") + L(ar ? "الفعاليات" : "Events", "events.html");
    if (has("newsletter", "subscribe", "shortlist", "نشره", "نيوزليتر")) return (ar ? "نشرتنا الأسبوعية اسمها The Shortlist على لينكدإن: " : "Our weekly newsletter is The Shortlist, on LinkedIn: ") + L(ar ? "U Hirable على لينكدإن" : "U Hirable on LinkedIn", "https://www.linkedin.com/company/uhirable") + (ar ? ". كل عدد فيه أدوات مجانية ونصايح سي في ومين يقدر يقدّم فعلًا." : ". Each issue: free tools, CV tips and who can actually apply.");
    if (has("contact", "whatsapp", "email", "talk", "human", "تواصل", "واتس", "ايميل", "اكلم حد", "كلمني", "بني ادم")) return (ar ? "تقدر تكلمنا على " : "You can reach us on ") + WAL + (ar ? " أو إيميل " : " or email ") + "<a href=\"mailto:u.hirable@proton.me\">u.hirable@proton.me</a>.";
    if (has("salary", "pay", "مرتب", "راتب", "فلوس", "بيدفع", "الاجر")) return (ar ? "كل وظيفة في " : "Every role on ") + L(ar ? "الوظايف المفتوحة" : "Search Jobs", "jobs.html") + (ar ? " مكتوب على الكارت بتاعها نطاق المرتب، فتقدر تفلتر قبل ما تقدّم." : " shows the salary range on its card, so you can filter before you apply.");
    if (has("top talent", "experienced", "senior", "get matched", "paraform", "خبره كبيره", "سينيور")) return (ar ? "عندك 5 سنين خبرة أو أكتر؟ شارك بروفايلك مرة واحدة واتطابق مع شركات كبيرة: " : "5+ years of experience? Share your profile once and get matched with top companies: ") + L(ar ? "Top Talent" : "Top Talent", "talent.html");
    if (has("free", "مجاني", "ببلاش", "مجانا", "بلاش")) return (ar ? "كل حاجة على U Hirable مجانية: الوظايف، وأنا، ومطابقة السي في. وفي أدوات مجانية بالكامل أو ليها خطة مجانية هنا: " : "Everything on U Hirable is free: the jobs, me, and the CV match. Tools that are 100% free or have a free plan are here: ") + L(ar ? "أدوات السي في" : "CV Tools", "cv-tools.html") + " · " + L("Career Boost", "career-boost.html");
    let c = COUNTRIES.filter((x) => new RegExp("(^|[^a-z])" + x + "($|[^a-z])").test(t)).sort((a, b) => b.length - a.length)[0];
    if (!c) { const k = Object.keys(AR_COUNTRIES).find((x) => t.includes(norm(x))); if (k) c = AR_COUNTRIES[k]; }
    const wantsSites = has("job site", "job board", "where to search", "sites", "websites", "مواقع", "موقع", "ادور فين", "ابحث فين", "منين");
    if (c || wantsSites) {
      const key = ALIAS[c] || c; const sites = key ? find([key], ["Job Site"], 6) : [], jobs = key ? find([key], ["Job"], 4) : [];
      let out = key ? (ar ? `ده اللي لقيته لـ <b>${escapeHTML(key)}</b>:` : `Here's what I found for <b>${escapeHTML(key)}</b>:`) : (ar ? "مواقع التوظيف حسب المنطقة (100+ موقع): " : "Browse 100+ job sites by region: ") + L(ar ? "مواقع التوظيف" : "Job Sites", "job-sites.html");
      if (jobs.length) out += "<br><b>" + (ar ? "وظايف مفتوحة" : "Open roles") + "</b>" + list(jobs);
      if (sites.length) out += "<br><b>" + (ar ? "مواقع توظيف" : "Job sites") + "</b>" + list(sites);
      if (key && !jobs.length && !sites.length) out += (ar ? " مفيش حاجة محددة لسه. جرب " : " nothing specific yet. Try ") + L(ar ? "الوظايف المفتوحة" : "Search Jobs", "jobs.html") + (ar ? " أو " : " or ") + L(ar ? "مواقع التوظيف" : "Job Sites", "job-sites.html") + ".";
      else if (key) out += "<br>" + L(ar ? "كل مواقع التوظيف ←" : "All job sites →", "job-sites.html");
      return out;
    }
    if (has("job", "role", "vacanc", "hiring", "وظيف", "وظايف", "شغل", "شغلانه", "فرص", "عمل", "فرصه", "تقديم", "اقدم", "تدريب", "انترن")) {
      const r = find(t.split(/\s+/).filter((w) => w.length > 3 && !/^(وظيف|وظايف|شغل|عمل|فرص)/.test(w)), ["Job"], 5);
      return r.length ? (ar ? "وظايف قريبة من اللي بتدور عليه:" : "Roles matching your search:") + list(r) + L(ar ? "كل الوظايف المفتوحة ←" : "See all open roles →", "jobs.html") : (ar ? "كل الوظايف المفتوحة هنا: " : "Browse all open roles here: ") + L(ar ? "الوظايف المفتوحة" : "Search Jobs", "jobs.html") + (ar ? " — فلتر بالدولة أو ابحث بعنوان الوظيفة. أو ارفع السي في وهطابقه ليك." : " — filter by country or search a title. Or upload your CV and I'll match it for you.");
    }
    const r = find(t.split(/\s+/).filter((w) => w.length > 3), null, 5);
    if (r.length) return (ar ? "ده اللي لقيته:" : "Here's what I found:") + list(r);
    return (ar ? "مش فاهم السؤال ده للأسف. جرب: ريموت، فيزا، سي في، مواقع وظايف، أو اسم دولة. أو كلمنا على " : "I didn't catch that. Try: remote, visa, CV, job sites, or a country name. Or message us on ") + WAL + ".";
  }

  // ---- CV match (runs fully in the browser; the file is never uploaded) ----
  const fileIn = panel.querySelector("#ua-file");
  const STOP = new Set("the and for with that this from your you are our will have has not but can all any more than into over per via each new who their they them its was were been being also such as of to in on at by an a or is it be we us i".split(" "));
  const tokens = (t) => (t.toLowerCase().match(/[a-z][a-z0-9+#.\-]{1,}/g) || []).filter((w) => !STOP.has(w));
  const SKILLS = ["python","sql","java","javascript","typescript","react","node","aws","gcp","azure","snowflake","databricks","dbt","airflow","kafka","spark","excel","powerpoint","tableau","power bi","looker","salesforce","hubspot","figma","sketch","product","design","marketing","sales","account executive","sdr","bdr","gtm","partnerships","finance","accounting","controller","cpa","fp&a","quickbooks","netsuite","machine learning","ml","ai","llm","nlp","data engineer","data scientist","analyst","devops","kubernetes","docker","terraform","security","recruiter","talent","hr","operations","project manager","product manager","engineering manager","full stack","backend","frontend","mobile","ios","android","go","rust","c++","c#",".net","php","ruby","scala","r","matlab","statistics","real estate","private equity","investment banking","consulting","law","legal","nurse","teacher","customer support","customer success","supply chain","logistics","edi","fintech","mortgage","healthcare","saas"];
  function matchCV(text) {
    const low = text.toLowerCase(); const cvTok = new Set(tokens(text));
    const mySkills = SKILLS.filter((k) => low.includes(k));
    const years = (low.match(/(\d{1,2})\+?\s*(?:years|yrs)/) || [])[1];
    const ALL = (typeof JOBS !== "undefined" ? JOBS : (window.JOBS || []));
    const scored = ALL.map((j) => {
      const jt = `${j.title} ${j.industry || ""} ${j.brief || ""} ${j.overview || ""} ${(j.requirements || []).join(" ")} ${(j.responsibilities || []).join(" ")}`;
      const jl = jt.toLowerCase(); const jTok = [...new Set(tokens(jt))];
      const jSkills = SKILLS.filter((k) => jl.includes(k));
      const hitSkills = jSkills.filter((k) => low.includes(k));
      const titleHit = tokens(j.title).filter((w) => cvTok.has(w)).length;
      const overlap = jTok.filter((w) => cvTok.has(w)).length;
      const score = hitSkills.length * 12 + titleHit * 15 + Math.min(overlap, 40);
      const pct = Math.min(96, Math.round(score / (jSkills.length * 12 + tokens(j.title).length * 15 + 40) * 100));
      return { j, pct, missing: jSkills.filter((k) => !low.includes(k)).slice(0, 5), hit: hitSkills };
    }).filter((x) => x.pct > 12).sort((a, b) => b.pct - a.pct).slice(0, 3);
    let out = `<b>Your CV:</b> ${mySkills.length ? mySkills.slice(0, 8).map(escapeHTML).join(", ") : "I couldn't find clear skills"}${years ? ` · ${escapeHTML(years)}+ years` : ""}.<br>`;
    if (!scored.length) return out + `No close match in our open roles right now. Try the ${L("Remote jobs", "remote-jobs.html")} page, or strengthen your CV with ${L("CV Tools", "cv-tools.html")}.`;
    out += `<b>Your top matches:</b><ul>` + scored.map((x) => `<li>${L(escapeHTML(x.j.title + " · " + x.j.company), x.j.page || "jobs.html")} <span class="k">${x.pct}% match</span>${x.missing.length ? `<br><small>Missing keywords: ${x.missing.map(escapeHTML).join(", ")}</small>` : ""}</li>`).join("") + "</ul>";
    out += `Add the missing keywords with ${L("SkillSyncer", "career-boost.html")} (free), then apply.`;
    return out;
  }
  async function readDocx(f) {
    // .docx is a zip: pull word/document.xml and strip tags (no external library needed)
    const buf = new Uint8Array(await f.arrayBuffer()); const ds = new DecompressionStream("deflate-raw");
    const view = new DataView(buf.buffer); let i = 0, found = null;
    while (i < buf.length - 30) { if (view.getUint32(i, true) !== 0x04034b50) break; const comp = view.getUint16(i + 8, true), csz = view.getUint32(i + 18, true), nl = view.getUint16(i + 26, true), el = view.getUint16(i + 28, true); const name = new TextDecoder().decode(buf.subarray(i + 30, i + 30 + nl)); const data = buf.subarray(i + 30 + nl + el, i + 30 + nl + el + csz); if (name === "word/document.xml") { found = { comp, data }; break; } i += 30 + nl + el + csz; }
    if (!found) throw new Error("nodoc");
    let xml;
    if (found.comp === 0) xml = new TextDecoder().decode(found.data);
    else { const r = new Blob([found.data]).stream().pipeThrough(ds); xml = await new Response(r).text(); }
    const txt = xml.replace(/<\/w:p>/g, "\n").replace(/<[^>]+>/g, " ");
    try {
      const n = (re) => (xml.match(re) || []).length;
      const fonts = [...new Set([...xml.matchAll(/w:ascii="([^"]+)"/g)].map((m) => m[1]))];
      const words = txt.trim().split(/\s+/).length, breaks = n(/<w:br [^>]*w:type="page"/g);
      window.UA_lastMeta = { docx: true, pages: Math.max(breaks + 1, Math.ceil(words / 550)), images: n(/<w:drawing>|<w:pict>|<w:pict /g), tables: n(/<w:tbl>/g), textBoxes: n(/<w:txbxContent>/g), fonts, chars: txt.length, cols: false, sideDates: false };
    } catch (e) {}
    return txt;
  }
  async function readPdf(f) {
    if (!window.pdfjsLib) { await new Promise((r, j) => { const s = document.createElement("script"); s.type = "module"; s.textContent = 'import * as p from "./lib-pdf.mjs"; window.pdfjsLib = p; window.dispatchEvent(new Event("pdfjs-ready"));'; window.addEventListener("pdfjs-ready", r, { once: true }); s.onerror = j; document.head.appendChild(s); setTimeout(() => j(new Error("timeout")), 15000); }); }
    const pdfjs = window.pdfjsLib; pdfjs.GlobalWorkerOptions.workerSrc = "lib-pdf.worker.mjs";
    const rawBuf = await f.arrayBuffer(); const doc = await pdfjs.getDocument({ data: rawBuf.slice(0) }).promise; let t = "";
    const meta = { pages: doc.numPages, images: 0, fonts: new Set(), cols: false, textItems: 0 };
    for (let i = 1; i <= Math.min(doc.numPages, 6); i++) {
      const pg = await doc.getPage(i); const c = await pg.getTextContent(); t += c.items.map((x) => x.str).join(" ") + "\n";
      meta.textItems += c.items.filter((x) => x.str.trim()).length; meta.chars = (meta.chars || 0) + c.items.reduce((a, x) => a + x.str.length, 0);
      try { const vp = pg.getViewport({ scale: 1 }); const items = c.items.filter((x) => x.str.trim().length > 2).map((x) => ({ x0: x.transform[4], x1: x.transform[4] + (x.width || 0), y: Math.round(x.transform[5]), len: x.str.trim().length, s: x.str }));
        if (items.length > 12) { const xs = items.map((i) => i.x0).sort((a, b) => a - b); const margin = xs[Math.floor(xs.length * 0.05)];
          // a gutter: a vertical band with no text crossing it, with many rows having text on both sides
          let best = null; for (let gx = margin + vp.width * 0.12; gx < vp.width * 0.75; gx += vp.width * 0.02) { const L = items.filter((i) => i.x1 <= gx + 2), R = items.filter((i) => i.x0 >= gx - 2); if (L.length + R.length < items.length - 1) continue; if (L.length < 5 || R.length < 5) continue; const rows = L.filter((l) => R.some((r) => Math.abs(r.y - l.y) < 4)).length; if (rows >= 5 && (!best || rows > best.rows)) best = { gx, L, R, rows }; }
          if (best) { const narrow = best.L.reduce((a, i) => a + i.len, 0) / best.L.length <= best.R.reduce((a, i) => a + i.len, 0) / best.R.length ? best.L : best.R; const datey = narrow.filter((i) => /\b(19|20)\d\d\b|present|current/i.test(i.s)).length; if (datey >= narrow.length * 0.5) meta.sideDates = true; else meta.cols = true; } } } catch (e) {}
      try { const ops = await pg.getOperatorList(); const OPS = pdfjs.OPS; meta.images += ops.fnArray.filter((o) => o === OPS.paintImageXObject || o === OPS.paintJpegXObject || o === OPS.paintImageXObjectRepeat || o === OPS.paintInlineImageXObject || o === OPS.paintImageMaskXObject).length; meta.opsOk = true; } catch (e) {}
      try { c.styles && Object.values(c.styles).forEach((st) => st.fontFamily && meta.fonts.add(st.fontFamily)); } catch (e) {}
    }
    if (!meta.opsOk) { try { const raw = new TextDecoder("latin1").decode(rawBuf); meta.images = (raw.match(/\/Subtype\s*\/Image\b/g) || []).length; } catch (e) {} }
    meta.fonts = [...meta.fonts]; window.UA_lastMeta = meta;
    return t;
  }
  async function readFile(f) {
    window.UA_lastMeta = null;
    if (/\.txt$/i.test(f.name)) return f.text();
    if (/\.docx$/i.test(f.name)) return readDocx(f);
    return readPdf(f);
  }
  window.UA_readFile = readFile;
  fileIn.addEventListener("change", async () => {
    const f = fileIn.files[0]; if (!f) return; say("📄 " + f.name, true); say("Reading your CV…");
    try {
      await loadIdx();
      if (typeof JOBS === "undefined" && !window.JOBS) { const r = await fetch(UA_BASE + "jobs.js?v=41").then((x) => x.text()); window.JOBS = new Function(r + ";return JOBS;")(); }
      const text = await Promise.race([readFile(f), new Promise((_, j) => setTimeout(() => j(new Error("timeout")), 20000))]);
      if (!text || text.trim().length < 80) throw new Error("empty");
      say(matchCV(text));
    } catch (e) { say("I couldn't read that file (" + (e && e.message === "timeout" ? "it took too long" : "no readable text") + "). Try a PDF or Word (.docx) with selectable text, or type your main skills here and I'll match them."); }
    fileIn.value = "";
  });
  async function ask(text) { if (!text.trim()) return; say(text, true); q.value = ""; await loadIdx(); setTimeout(() => say(reply(text)), 250); }
  form.addEventListener("submit", (e) => { e.preventDefault(); ask(q.value); });
  let opened = false;
  const open = () => { panel.classList.add("open"); btn.setAttribute("aria-expanded", "true"); if (!opened) { opened = true; loadIdx(); say(reply("hi")); setChips(CHIPS); } q.focus(); };
  const close = () => { panel.classList.remove("open"); btn.setAttribute("aria-expanded", "false"); };
  btn.addEventListener("click", () => (panel.classList.contains("open") ? close() : open()));
  panel.querySelector(".ua-head button").addEventListener("click", close);
})();

// CV Match popup (loaded once on every page)
if (!window.UHCvPop && !document.querySelector('script[src$="cv-popup.js"]')) { const _cvs = document.createElement("script"); _cvs.src = UA_BASE + "cv-popup.js"; document.head.appendChild(_cvs); }
