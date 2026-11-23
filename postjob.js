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

  const say = (t) => { msg.hidden = false; msg.textContent = t; msg.scrollIntoView({ block: "center", behavior: "smooth" }); };
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const d = new FormData(form), v = (k) => String(d.get(k) || "").trim();
    const body = { company: v("company"), website: v("website"), contactEmail: v("contactEmail"), title: v("title"), country: v("country"), city: v("city"),
      workplace: v("workplace"), type: v("type"), description: v("description"), salary: v("salary"), applyUrl: v("applyUrl"), applyEmail: v("applyEmail"),
      fax: v("fax"), agree: form.agree.checked, token: window.turnstile && widget !== null ? turnstile.getResponse(widget) : "" };
    if (!body.company || !body.contactEmail || !body.title || !body.country || !body.workplace) return say("Please fill in the company, your work email, the job title, the country and the workplace.");
    if (body.workplace !== "Remote" && !body.city) return say("Please enter the city, or choose Remote.");
    if (body.description.length < 150) return say("Please write a job description of at least 150 characters.");
    if (!body.applyUrl && !body.applyEmail) return say("Please add an application link or an application email.");
    if (!body.agree) return say("Please tick the box to agree before you post.");
    if (!body.token) return say("Please complete the robot check above the button.");
    btn.disabled = true; btn.textContent = "Sending…"; msg.hidden = true;
    try {
      const r = await fetch("/api/jobpost", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
      const out = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(out.error || "Something went wrong. Please try again.");
      box.innerHTML = '<div class="ap-done"><h2>Thank you. Your job is with us.</h2><p>We review every post, usually within one business day. Once approved, it appears on our Jobs page and stays live for 30 days.</p><p><a class="btn btn-primary" href="jobs.html">See the Jobs page</a></p></div>';
      box.scrollIntoView({ block: "start", behavior: "smooth" });
    } catch (x) {
      btn.disabled = false; btn.textContent = "Send for review";
      if (window.turnstile && widget !== null) turnstile.reset(widget);
      say(x.message);
    }
  });
})();
