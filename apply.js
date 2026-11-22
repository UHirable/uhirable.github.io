// Application form for roles where the employer is confidential. The role comes from ?job=… and its questions from apply-jobs.json.
// The form is sent to /api/apply (worker/apply.js). Nothing is stored in the browser.
(() => {
  const SITE_KEY = "0x4AAAAAAGIpG5SuSLHIIrse"; // Turnstile site key (public), the same widget as the Open to Work form
  const $ = (s) => document.querySelector(s);
  const esc = (t) => String(t == null ? "" : t).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const box = $("#ap-box"), jobId = new URLSearchParams(location.search).get("job") || "";
  let widget = null;

  const yn = (name) => `<div class="ap-yn" role="radiogroup"><label><input type="radio" name="${name}" value="yes" required><span>Yes</span></label><label><input type="radio" name="${name}" value="no"><span>No</span></label></div>`;
  const field = (label, inner) => `<div class="ap-f"><label class="ap-l">${label}</label>${inner}</div>`;

  const closed = () => { box.innerHTML = '<p class="ap-note">This role is not open for applications. <a href="jobs.html">See all open jobs</a></p>'; };

  const draw = (role) => {
    document.title = "Apply: " + role.title + " | U Hirable";
    $("#ap-title").textContent = role.title;
    $("#ap-where").textContent = "Confidential employer · " + role.where;
    box.innerHTML = `<p class="ap-note"><b>Before you apply:</b> ${esc(role.note)} <a href="${esc(role.page)}">Read the full role</a></p>
      <form id="ap-form" novalidate>
        <h2>About you</h2>
        ${field("Full name", '<input name="name" autocomplete="name" maxlength="80" required>')}
        ${field("Email", '<input name="email" type="email" autocomplete="email" maxlength="120" required>')}
        ${field("Phone", '<input name="phone" type="tel" autocomplete="tel" maxlength="30" required>')}
        ${field("City and state", '<input name="location" maxlength="80" required>')}
        ${field("LinkedIn profile link", '<input name="linkedin" type="url" placeholder="https://www.linkedin.com/in/…" maxlength="200" required>')}
        ${field("Link to your CV (Google Drive, Dropbox or similar)", '<input name="cv" type="url" placeholder="https://…" maxlength="300" required><small>Make sure anyone with the link can view it.</small>')}
        <h2>Work eligibility</h2>
        ${field("Are you legally authorised to work in the US for any employer?", yn("authorised"))}
        ${field("Will you now or in the future need visa sponsorship to work in the US?", yn("sponsorship"))}
        <h2>Questions for this role</h2>
        ${role.questions.map((q, i) => field(esc(q.q), q.type === "text" ? `<textarea name="q${i}" maxlength="1500" required></textarea>` : q.type === "yn" ? yn("q" + i) : `<input name="q${i}" maxlength="200" required>`)).join("")}
        ${field("Desired total compensation (base salary and commission or bonus)", '<input name="compensation" maxlength="200" required>')}
        <input name="website" class="ap-hp" tabindex="-1" autocomplete="off" aria-hidden="true">
        <label class="ap-ck"><input type="checkbox" name="consent" required><span>I agree that U Hirable may share my application with its recruiting partner and the hiring employer for this role only. I can ask for my data to be deleted at any time at hello@uhirable.com. See the <a href="privacy.html" target="_blank" rel="noopener">privacy policy</a>.</span></label>
        <div id="ap-ts"></div>
        <p id="ap-msg" class="ap-msg" role="status" hidden></p>
        <button class="btn btn-gold btn-full" id="ap-send" type="submit">Send application</button>
        <p class="ap-fine">Free for candidates. We never ask you to pay.</p>
      </form>`;
    window.apTsReady = () => { widget = turnstile.render("#ap-ts", { sitekey: SITE_KEY }); };
    const s = document.createElement("script"); s.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit&onload=apTsReady"; s.async = true; document.head.appendChild(s);

    const form = $("#ap-form"), msg = $("#ap-msg"), btn = $("#ap-send");
    const say = (t) => { msg.hidden = false; msg.textContent = t; msg.scrollIntoView({ block: "center", behavior: "smooth" }); };
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const d = new FormData(form), v = (k) => String(d.get(k) || "").trim();
      const body = { job: jobId, name: v("name"), email: v("email"), phone: v("phone"), location: v("location"), linkedin: v("linkedin"), cv: v("cv"),
        authorised: v("authorised"), sponsorship: v("sponsorship"), compensation: v("compensation"), website: v("website"),
        answers: role.questions.map((q, i) => v("q" + i)), consent: form.consent.checked,
        token: window.turnstile && widget !== null ? turnstile.getResponse(widget) : "" };
      if (!form.checkValidity()) return say("Please fill in every field and tick the box to agree.");
      if (!body.token) return say("Please complete the robot check above the button.");
      btn.disabled = true; btn.textContent = "Sending…";
      try {
        const r = await fetch("/api/apply", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
        const out = await r.json().catch(() => ({}));
        if (r.ok && out.ok) { box.innerHTML = `<div class="ap-done"><h2>Application received</h2><p>Thank you. If your profile fits the role, we will contact you by email or phone with the next step and the employer's name.</p><p><a class="btn btn-primary" href="jobs.html">See more open jobs</a></p></div>`; box.scrollIntoView({ block: "start" }); return; }
        say(out.error || "Couldn't send the application. Please try again.");
      } catch (x) { say("Couldn't send the application. Please check your connection and try again."); }
      if (window.turnstile && widget !== null) turnstile.reset(widget);
      btn.disabled = false; btn.textContent = "Send application";
    });
  };

  fetch("apply-jobs.json").then((r) => r.json()).then((all) => (all[jobId] ? draw(all[jobId]) : closed())).catch(closed);
})();
