// Open to Work page (open-to-work.html): candidate cards, the summary window and the "Join as talent" form.
// The cards come from /api/talent (worker/talent.js). Nothing about a candidate is stored in the site's files.
(() => {
  const $ = (s) => document.querySelector(s);
  const esc = (t) => String(t == null ? "" : t).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const count = (path, title) => { try { if (window.goatcounter && goatcounter.count) goatcounter.count({ path, title, event: true }); } catch (e) {} };
  const SITE_KEY = "0x4AAAAAAGIpG5SuSLHIIrse"; // Turnstile site key (public)

  // Skills that have a well-known logo: the logo is shown next to the name. Anything else is text only.
  // Logos come from the open "devicon" set; a logo that fails to load is simply left out.
  const ICON = "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/";
  const LOGO = { "python": "python/python-original", "javascript": "javascript/javascript-original", "js": "javascript/javascript-original", "typescript": "typescript/typescript-original", "react": "react/react-original", "react native": "react/react-original",
    "node.js": "nodejs/nodejs-original", "nodejs": "nodejs/nodejs-original", "node": "nodejs/nodejs-original", "java": "java/java-original", "c#": "csharp/csharp-original", "c++": "cplusplus/cplusplus-original", "php": "php/php-original", "go": "go/go-original", "golang": "go/go-original",
    "ruby": "ruby/ruby-original", "swift": "swift/swift-original", "kotlin": "kotlin/kotlin-original", "flutter": "flutter/flutter-original", "dart": "dart/dart-original", "angular": "angular/angular-original", "vue": "vuejs/vuejs-original", "vue.js": "vuejs/vuejs-original",
    "html": "html5/html5-original", "html5": "html5/html5-original", "css": "css3/css3-original", "css3": "css3/css3-original", "docker": "docker/docker-original", "kubernetes": "kubernetes/kubernetes-original", "aws": "amazonwebservices/amazonwebservices-original",
    "azure": "azure/azure-original", "google cloud": "googlecloud/googlecloud-original", "gcp": "googlecloud/googlecloud-original", "mysql": "mysql/mysql-original", "postgresql": "postgresql/postgresql-original", "postgres": "postgresql/postgresql-original",
    "mongodb": "mongodb/mongodb-original", "redis": "redis/redis-original", "git": "git/git-original", "github": "github/github-original", "figma": "figma/figma-original", "photoshop": "photoshop/photoshop-original", "illustrator": "illustrator/illustrator-plain",
    "wordpress": "wordpress/wordpress-plain", "laravel": "laravel/laravel-original", "django": "django/django-plain", "spring": "spring/spring-original", "spring boot": "spring/spring-original", ".net": "dotnetcore/dotnetcore-original", "linux": "linux/linux-original",
    "tensorflow": "tensorflow/tensorflow-original", "pytorch": "pytorch/pytorch-original", "terraform": "terraform/terraform-original", "jenkins": "jenkins/jenkins-original", "jira": "jira/jira-original", "salesforce": "salesforce/salesforce-original",
    "unity": "unity/unity-original", "android": "android/android-original", "firebase": "firebase/firebase-original", "graphql": "graphql/graphql-plain", "next.js": "nextjs/nextjs-original", "tailwind": "tailwindcss/tailwindcss-original", "tailwind css": "tailwindcss/tailwindcss-original",
    "bootstrap": "bootstrap/bootstrap-original", "sass": "sass/sass-original", "r": "r/r-original", "matlab": "matlab/matlab-original", "kafka": "apachekafka/apachekafka-original", "sql": "azuresqldatabase/azuresqldatabase-original",
    "sql server": "microsoftsqlserver/microsoftsqlserver-original", "canva": "canva/canva-original", "adobe xd": "xd/xd-original", "after effects": "aftereffects/aftereffects-original", "premiere pro": "premierepro/premierepro-original",
    "oracle": "oracle/oracle-original", "sqlite": "sqlite/sqlite-original", "elasticsearch": "elasticsearch/elasticsearch-original", "powershell": "powershell/powershell-original", "bash": "bash/bash-original", "ansible": "ansible/ansible-original",
    "prometheus": "prometheus/prometheus-original", "grafana": "grafana/grafana-original", "rust": "rust/rust-original", "scala": "scala/scala-original", "numpy": "numpy/numpy-original", "pandas": "pandas/pandas-original", "selenium": "selenium/selenium-original",
    "postman": "postman/postman-original", "gitlab": "gitlab/gitlab-original", "vs code": "vscode/vscode-original", "blender": "blender/blender-original", "woocommerce": "woocommerce/woocommerce-original", "magento": "magento/magento-original",
    "notion": "notion/notion-original", "slack": "slack/slack-original", "trello": "trello/trello-original" };
  const skillChip = (s) => { const k = LOGO[String(s).toLowerCase().trim()];
    return `<span class="ow-chip ow-skill">${k ? `<img src="${ICON}${k}.svg" alt="" width="15" height="15" loading="lazy" onerror="this.remove()">` : ""}${esc(s)}</span>`; };
  const flag = (cc) => (/^[a-z]{2}$/.test(cc) ? `<img class="ow-flag" src="https://flagcdn.com/w20/${cc}.png" srcset="https://flagcdn.com/w40/${cc}.png 2x" alt="" width="18" height="13" loading="lazy" onerror="this.remove()">` : "");
  const LI = '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true"><path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z"/></svg>';
  const years = (t) => t.yearsCorp + (t.yearsCorp === 1 ? " year" : " years") + " corporate" + (t.yearsProj ? " · " + t.yearsProj + (t.yearsProj === 1 ? " year" : " years") + " projects" : "");
  const date = (d) => { const t = new Date(d + "T00:00:00Z"); return isNaN(t) ? "" : t.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }); };
  // No photos and no person icon: every card shows the two initials of the name in a circle, so nothing hints at who is a man or a woman.
  const initials = (n) => String(n).split(/\s+/).filter(Boolean).slice(0, 2).map((w) => (w.match(/[\p{L}\p{N}]/u) || [""])[0].toUpperCase()).join("");
  const tone = (id) => ([...String(id)].reduce((a, c) => a + c.charCodeAt(0), 0) % 2 ? " alt" : "");
  const head = (t) => `<div class="ow-head"><div class="ow-av${tone(t.id)}" aria-hidden="true">${esc(initials(t.name))}</div><div><p class="ow-name">${esc(t.name)}</p><p class="ow-title">${esc(t.title)}</p><p class="ow-exp">${esc(years(t))}</p></div></div>`;

  const list = $("#ow-list"), status = $("#ow-status"), search = $("#ow-q");
  let all = [];
  // While the page has fewer than FULL real profiles, it shows an invitation and one card clearly marked "Example",
  // so a visitor sees what a profile looks like. The example is not a real person and is never mixed in unmarked.
  const FULL = 6;
  const EXAMPLE = { id: "example", example: true, name: "Sara M.", title: "Senior Backend Engineer", linkedin: "", industry: "Fintech", yearsCorp: 7, yearsProj: 2, country: "Egypt", cc: "eg",
    openFor: ["Full-time", "Remote"], skills: ["Python", "AWS", "Docker", "PostgreSQL", "Kafka", "Java"], joined: new Date().toISOString().slice(0, 10),
    summary: "This is an example of a professional summary. Describe what you do, your strongest results and the kind of role you want, then say how companies can reach you, for example by email." };
  const cardHtml = (t) => `<article class="ow-card${t.example ? " ow-example" : ""}" data-id="${esc(t.id)}">${t.example ? '<span class="ow-tag">Example</span>' : ""}${head(t)}
    <div class="ow-chips"><span class="ow-chip ow-country">${flag(t.cc)}${esc(t.country)}</span><span class="ow-chip">${esc(t.industry)}</span>${t.openFor.map((o) => `<span class="ow-chip">${esc(o)}</span>`).join("")}</div>
    <div class="ow-chips">${t.skills.slice(0, 5).map(skillChip).join("")}${t.skills.length > 5 ? `<button type="button" class="ow-chip ow-skill ow-more" data-open="${esc(t.id)}">+${t.skills.length - 5}</button>` : ""}</div>
    <div class="ow-btns">${t.example ? `<span class="ow-btn ow-li ow-off">${LI}LinkedIn</span>` : `<a class="ow-btn ow-li" href="${esc(t.linkedin)}" target="_blank" rel="noopener nofollow ugc" data-li>${LI}LinkedIn</a>`}<button type="button" class="ow-btn ow-sum" data-open="${esc(t.id)}">View summary</button></div>
    <p class="ow-joined">${t.example ? "This is how your card will look" : "Joined " + esc(date(t.joined))}</p></article>`;
  const draw = () => {
    const q = (search.value || "").toLowerCase().replace(/\s+/g, " ").trim();
    const hit = (t) => !q || [t.name, t.title, t.industry, t.country, ...t.openFor, ...t.skills].join(" ").toLowerCase().includes(q);
    const shown = all.filter(hit), early = all.length < FULL && !q;
    list.innerHTML = shown.map(cardHtml).join("") + (early ? cardHtml(EXAMPLE) : "");
    $("#ow-first").hidden = !early;
    $("#ow-joinbtn").hidden = early; $("#ow-bar").classList.toggle("one", early); // one join button at a time: in the navy box while it shows, beside the search otherwise
    status.hidden = shown.length > 0 || early;
    status.textContent = shown.length || early ? "" : "No profiles match this search. Try another skill, job title or country.";
  };
  search.addEventListener("input", draw);
  fetch("/api/talent").then((r) => (r.ok ? r.json() : Promise.reject())).then((d) => { all = d.talent || []; draw(); })
    .catch(() => { $("#ow-first").hidden = true; $("#ow-joinbtn").hidden = false; $("#ow-bar").classList.remove("one"); status.hidden = false; status.textContent = "Couldn't load the profiles right now. Please try again in a moment."; });

  // ---- Summary window ----
  const win = $("#ow-win"), body = $("#ow-win-body");
  const closeWin = () => { win.hidden = true; document.body.style.overflow = ""; };
  const openWin = (id) => { const t = id === "example" ? EXAMPLE : all.find((x) => x.id === id); if (!t) return;
    body.innerHTML = `<p class="ow-kicker">Professional summary</p>${head(t)}<div class="ow-chips">${t.skills.map(skillChip).join("")}</div>
      <p class="ow-text">${esc(t.summary)}</p>${t.example ? "" : `<a class="ow-btn ow-li ow-wide" href="${esc(t.linkedin)}" target="_blank" rel="noopener nofollow ugc" data-li>${LI}Open LinkedIn</a>`}
      <p class="ow-red ow-red-sm">U Hirable is a free listing only. Any contact or agreement with this candidate is between you and them.</p>`;
    win.hidden = false; document.body.style.overflow = "hidden"; $("#ow-win-x").focus(); count("open-to-work/summary", "Open to Work: summary opened"); };
  document.addEventListener("click", (e) => {
    const o = e.target.closest && e.target.closest("[data-open]"); if (o) return openWin(o.dataset.open);
    if (e.target.closest && e.target.closest("[data-li]")) return count("open-to-work/linkedin", "Open to Work: LinkedIn opened");
    if (e.target === win || (e.target.closest && e.target.closest("#ow-win-x"))) closeWin();
  });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !win.hidden) closeWin(); });

  // ---- Join form ----
  const join = $("#join"), form = $("#ow-form"), msg = $("#ow-msg"), send = $("#ow-send");
  const skillsBox = $("#ow-skills"), skillIn = $("#ow-skill-in"), sumIn = $("#ow-summary"), sumCount = $("#ow-count");
  let skills = [], widget = null;
  const drawSkills = () => { skillsBox.innerHTML = skills.map((s, i) => `<span class="ow-chip ow-skill">${esc(s)}<button type="button" data-rm="${i}" aria-label="Remove ${esc(s)}">×</button></span>`).join(""); skillIn.disabled = skills.length >= 8; skillIn.placeholder = skills.length >= 8 ? "8 skills added" : "Type a skill and press Enter"; };
  const addSkill = () => { const v = skillIn.value.replace(/[<>,]/g, " ").replace(/\s+/g, " ").trim().slice(0, 25); skillIn.value = ""; if (v && skills.length < 8 && !skills.some((s) => s.toLowerCase() === v.toLowerCase())) { skills.push(v); drawSkills(); } };
  skillIn.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addSkill(); } });
  skillIn.addEventListener("blur", addSkill);
  skillsBox.addEventListener("click", (e) => { const b = e.target.closest("[data-rm]"); if (b) { skills.splice(Number(b.dataset.rm), 1); drawSkills(); } });
  sumIn.addEventListener("input", () => { sumCount.textContent = sumIn.value.length + " / 700"; });
  const cSel = $("#ow-country");
  cSel.innerHTML = '<option value="">Choose a country</option>' + (window.OW_COUNTRIES || []).map(([c, n]) => `<option value="${c}">${esc(n)}</option>`).join("");

  // The robot check (Cloudflare Turnstile) is loaded only when the form is opened.
  const loadCheck = () => { if (window.turnstile || document.getElementById("ow-ts-js")) return;
    window.owTsReady = () => { widget = turnstile.render("#ow-ts", { sitekey: SITE_KEY }); };
    const s = document.createElement("script"); s.id = "ow-ts-js"; s.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit&onload=owTsReady"; s.async = true; document.head.appendChild(s); };
  const openJoin = (scroll) => { join.hidden = false; loadCheck(); if (scroll) join.scrollIntoView({ behavior: "smooth", block: "start" }); };
  document.querySelectorAll("[data-join]").forEach((b) => b.addEventListener("click", (e) => { e.preventDefault(); openJoin(true); count("open-to-work/join-open", "Open to Work: join form opened"); }));
  if (location.hash === "#join") openJoin(true);

  const say = (t, ok) => { msg.hidden = false; msg.className = "ow-msg " + (ok ? "ok" : "bad"); msg.textContent = t; };
  form.addEventListener("submit", async (e) => {
    e.preventDefault(); addSkill();
    const f = new FormData(form), cc = cSel.value;
    const data = { name: f.get("name"), title: f.get("title"), linkedin: f.get("linkedin"), industry: f.get("industry"), yearsCorp: f.get("yearsCorp"), yearsProj: f.get("yearsProj"),
      cc, country: cc ? cSel.options[cSel.selectedIndex].textContent : "", openFor: f.getAll("openFor"), skills, summary: f.get("summary"), consent: f.get("consent") === "on", website: f.get("website"),
      token: window.turnstile && widget !== null ? turnstile.getResponse(widget) : "" };
    if (!data.openFor.length) return say("Choose what you are open for.");
    if (!skills.length) return say("Add at least one skill.");
    if (!data.token) return say("Wait for the robot check to finish, then send again.");
    send.disabled = true; send.textContent = "Sending…";
    try {
      const r = await fetch("/api/talent", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(data) });
      const d = await r.json().catch(() => ({}));
      if (r.ok && d.ok) { form.hidden = true; say("Profile sent. It will appear on this page once U Hirable has reviewed it.", true); count("open-to-work/join-sent", "Open to Work: profile sent"); }
      else { say(d.error || "Couldn't send the profile. Please try again."); if (window.turnstile && widget !== null) turnstile.reset(widget); }
    } catch (x) { say("Couldn't send the profile. Check your connection and try again."); }
    send.disabled = false; send.textContent = "Send my profile";
  });
})();
