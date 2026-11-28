// "Post a Job" form (post-a-job.html). The form is sent to /api/jobpost (worker/jobpost.js) and waits for U Hirable's review.
// Nothing is stored in the browser.
(() => {
  const SITE_KEY = "0x4AAAAAAGIpG5SuSLHIIrse"; // Turnstile site key (public), the same widget as the other forms
  const $ = (s) => document.querySelector(s);
  const form = $("#pj-form"), msg = $("#pj-msg"), btn = $("#pj-send"), box = $("#pj-box");
  if (!form) return;
  let widget = null;
  window.pjTsReady = () => { widget = turnstile.render("#ap-ts", { sitekey: SITE_KEY }); };
  const s = document.createElement("script"); s.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit&onload=pjTsReady"; s.async = true; document.head.appendChild(s);

  // Shows the message and, when a field is named, takes the employer to that field.
  const say = (t, field) => { msg.hidden = false; msg.textContent = t;
    const el = field && form.elements[field];
    if (el && el.focus) { el.focus({ preventScroll: true }); el.scrollIntoView({ block: "center", behavior: "smooth" }); } else msg.scrollIntoView({ block: "center", behavior: "smooth" }); };
  const isEmail = (v) => /^[^\s@<>"',;]+@[^\s@<>"',;]+\.[a-z]{2,}$/i.test(v);
  const isLink = (v) => { try { const u = new URL(/^[a-z][a-z0-9+.-]*:/i.test(v) ? v : "https://" + v); return /^https?:$/.test(u.protocol) && /\.[a-z]{2,}$/i.test(u.hostname); } catch (e) { return false; } };
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const d = new FormData(form), v = (k) => String(d.get(k) || "").trim();
    const body = { company: v("company"), website: v("website"), contactEmail: v("contactEmail"), title: v("title"), country: v("country"), city: v("city"),
      workplace: v("workplace"), type: v("type"), description: v("description"), salary: v("salary"), applyUrl: v("applyUrl"), applyEmail: v("applyEmail"),
      fax: v("fax"), agree: form.agree.checked, token: window.turnstile && widget !== null ? turnstile.getResponse(widget) : "" };
    if (!body.company) return say("Please enter your company name.", "company");
    if (!body.website) return say("Please enter your company website, like https://company.com.", "website");
    if (!isLink(body.website)) return say("The company website is not a valid link. Write it like https://company.com.", "website");
    if (!isEmail(body.contactEmail)) return say("Please enter your work email, like you@company.com.", "contactEmail");
    if (!body.title) return say("Please enter the job title.", "title");
    if (!body.country) return say("Please enter the country.", "country");
    if (!body.workplace) return say("Please choose the workplace: On-site, Hybrid or Remote.");
    if (body.workplace !== "Remote" && !body.city) return say("Please enter the city, or choose Remote.", "city");
    if (body.description.length < 150) return say("Please write a job description of at least 150 characters. You have " + body.description.length + " so far.", "description");
    if (!body.applyUrl && !body.applyEmail) return say("Please add an application link or an application email.", "applyUrl");
    if (body.applyUrl && !isLink(body.applyUrl)) return say("The application link is not a valid link. Write it like https://company.com/careers, or leave it empty and use an email.", "applyUrl");
    if (body.applyEmail && !isEmail(body.applyEmail)) return say("The application email is not a valid email address. Write it like jobs@company.com, or leave it empty and use a link.", "applyEmail");
    if (!body.agree) return say("Please tick the box to agree before you post.");
    if (!body.token) return say("Please wait for the robot check above the button to finish, then press the button again.");
    btn.disabled = true; btn.textContent = "Sending…"; msg.hidden = true;
    try {
      const r = await fetch("/api/jobpost", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
      const out = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(out.error || "Something went wrong. Please try again.");
      box.innerHTML = '<div class="ap-done"><h2>Thank you. Your job is with us.</h2><p>We review every post, usually within one business day. Once approved, it appears on our Jobs page and stays live until you ask us to remove it. Email hello@uhirable.com when the role is filled.</p></div>';
      if (window.UHPJOffers) UHPJOffers(box);
      box.scrollIntoView({ block: "start", behavior: "smooth" });
    } catch (x) {
      btn.disabled = false; btn.textContent = "Send for review";
      if (window.turnstile && widget !== null) turnstile.reset(widget);
      say(x.message);
    }
  });
})();

// After a job is sent: the offers for companies (every partner on the Hiring Partners page except Manatal),
// with the discount as the biggest thing on each card.
window.UHPJOffers = function (after) {
  try {
    if (typeof PARTNERS === "undefined" || document.getElementById("pj-offers")) return;
    const esc = (s = "") => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
    const list = PARTNERS.filter(p => p.deal && p.link && p.name !== "Manatal");
    if (!list.length) return;
    const sec = document.createElement("section");
    sec.id = "pj-offers"; sec.className = "pjo";
    sec.innerHTML = '<h2>While we review your job</h2><p class="pjo-sub">Offers for your hiring, payroll and HR.</p><div class="pjo-grid">' + list.map(p =>
      '<a class="pjo-c" href="' + esc(p.link) + '"' + (/^mailto:/i.test(p.link) ? '' : ' target="_blank" rel="sponsored noopener noreferrer" referrerpolicy="no-referrer"') + ' data-n="' + esc(p.name) + '">' +
      '<span class="pjo-deal">' + esc(p.deal) + '</span>' +
      '<span class="pjo-h">' + (p.logo ? '<img src="' + esc(p.logo) + '" alt="" width="40" height="40" loading="lazy">' : '') + '<span><b>' + esc(p.name) + '</b><i>' + esc(p.tag || "") + '</i></span></span>' +
      (p.perk ? '<span class="pjo-p">' + esc(p.perk) + '</span>' : '') +
      '<span class="pjo-b">' + esc(p.cta || "Get the offer") + ' →</span></a>').join("") + '</div>';
    after.insertAdjacentElement("afterend", sec);
    sec.addEventListener("click", e => {
      const a = e.target.closest(".pjo-c"); if (!a) return;
      try { if (window.goatcounter && goatcounter.count) goatcounter.count({ path: "pj-offer/" + a.dataset.n.toLowerCase().replace(/[^a-z0-9]+/g, "-"), title: "Post a Job offer click: " + a.dataset.n, event: true }); } catch (x) {}
    });
    try { if (window.goatcounter && goatcounter.count) goatcounter.count({ path: "pj-offers-shown", title: "Post a Job offers shown", event: true }); } catch (x) {}
  } catch (x) {}
};
