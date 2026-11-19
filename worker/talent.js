// Open to Work: candidates add a profile card, U Hirable approves it, companies browse the approved cards.
// The profiles live in the D1 database "uhirable-talent" (binding DB), never in the site's files.
//
//   GET  /api/talent          -> approved cards (public fields only)
//   POST /api/talent          -> a candidate sends the form (checked by Turnstile); saved as "pending"
//   POST /api/talent/admin    -> the review page: list everything, approve, reject or delete (needs the admin password)
//
// Two secrets are set by the site owner in the Worker's settings, never in this repository:
//   TURNSTILE_SECRET        the secret key of the Turnstile widget on the form
//   TALENT_ADMIN_PASSWORD   the password of the review page
//   TALENT_NOTIFY_EMAIL     (optional) where "a new profile is waiting" emails go; it must be a verified
//                           destination address in the domain's Email Routing. Without it no email is sent.

import { EmailMessage } from "cloudflare:email";

const OPEN_FOR = ["Full-time", "Contract", "Remote", "Hybrid"];
const MAX_PENDING = 300; // waiting cards allowed at once; more than that means the form is being abused

const json = (body, status = 200, headers = {}) =>
  new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", ...headers } });

// One line of text: control characters and tags out, spaces collapsed.
const line = (v, max) => String(v == null ? "" : v).replace(/[\u0000-\u001f\u007f<>]/g, " ").replace(/\s+/g, " ").trim().slice(0, max);
// Several lines of text (the summary): line breaks kept, at most two in a row.
const text = (v, max) => String(v == null ? "" : v).replace(/\r/g, "").replace(/[\u0000-\u0009\u000b-\u001f\u007f<>]/g, " ").replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n").trim().slice(0, max);
const whole = (v) => (/^\d{1,2}$/.test(String(v).trim()) ? Number(v) : NaN);

// "Sara Mahmoud Ali" is shown as "Sara M."
const shortName = (name) => { const p = name.split(" ").filter(Boolean); return p.length > 1 ? p[0] + " " + p[1][0].toUpperCase() + "." : p[0] || ""; };

// What the public page gets for one card. The full name stays in the database.
const card = (r) => ({ id: r.id, name: shortName(r.name), title: r.title, linkedin: r.linkedin, industry: r.industry, yearsCorp: r.years_corp, yearsProj: r.years_proj,
  country: r.country, cc: r.cc, openFor: JSON.parse(r.open_for), skills: JSON.parse(r.skills), summary: r.summary, joined: (r.decided_at || r.created_at).slice(0, 10) });

// Reads and checks the form. Returns { row } or { error }.
function readForm(b) {
  const name = line(b.name, 60), title = line(b.title, 80), industry = line(b.industry, 60), country = line(b.country, 60);
  const cc = String(b.cc || "").toLowerCase(), linkedin = String(b.linkedin || "").trim().slice(0, 200), summary = text(b.summary, 700);
  const yearsCorp = whole(b.yearsCorp), yearsProj = b.yearsProj === "" || b.yearsProj == null ? null : whole(b.yearsProj);
  const openFor = OPEN_FOR.filter((o) => Array.isArray(b.openFor) && b.openFor.includes(o));
  const skills = [...new Set((Array.isArray(b.skills) ? b.skills : []).map((s) => line(s, 25)).filter(Boolean))].slice(0, 8);
  if (name.length < 2) return { error: "Enter your name." };
  if (title.length < 2) return { error: "Enter your job title." };
  if (!/^https:\/\/([a-z]{2,3}\.)?linkedin\.com\/in\/[^\s/?#]{2,100}\/?$/i.test(linkedin)) return { error: "Enter your LinkedIn profile link, like https://www.linkedin.com/in/your-name" };
  if (industry.length < 2) return { error: "Enter your industry or domain." };
  if (Number.isNaN(yearsCorp) || yearsCorp > 60) return { error: "Enter your years of corporate experience as a number." };
  if (yearsProj !== null && (Number.isNaN(yearsProj) || yearsProj > 60)) return { error: "Enter your years of project experience as a number, or leave it empty." };
  if (!/^[a-z]{2}$/.test(cc) || country.length < 2) return { error: "Choose your country." };
  if (!openFor.length) return { error: "Choose what you are open for." };
  if (!skills.length) return { error: "Add at least one skill." };
  if (summary.length < 80) return { error: "Write a professional summary of at least 80 characters." };
  if (/(https?:\/\/|www\.)/i.test(summary)) return { error: "Links are not allowed in the summary. Your LinkedIn link has its own field." };
  if (b.consent !== true) return { error: "Tick the consent box to continue." };
  return { row: { name, title, linkedin: linkedin.replace(/\/$/, ""), industry, yearsCorp, yearsProj, country, cc, openFor, skills, summary } };
}

async function human(env, token, ip) {
  const body = new URLSearchParams({ secret: env.TURNSTILE_SECRET, response: String(token || "") });
  if (ip) body.set("remoteip", ip);
  const r = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", { method: "POST", body });
  const d = await r.json().catch(() => ({}));
  return d.success === true;
}

// Tells the owner that a profile is waiting. A failure here never blocks the candidate's form.
async function notify(env, r) {
  // How the last email went is noted in the database (no addresses, no profile data), so a silent failure can be found.
  const note = (v) => env.DB.prepare("INSERT INTO meta (k, v) VALUES ('last_notify', ?) ON CONFLICT(k) DO UPDATE SET v = excluded.v").bind(new Date().toISOString() + " " + v).run().catch(() => {});
  if (!env.MAIL || !env.TALENT_NOTIFY_EMAIL) return note("skipped: " + (!env.MAIL ? "no MAIL binding" : "no TALENT_NOTIFY_EMAIL"));
  const from = "talent@uhirable.com", to = env.TALENT_NOTIFY_EMAIL, subject = "New Open to Work profile: " + r.name + ", " + r.title;
  const text = ["A new profile is waiting for your review.", "", "Name: " + r.name, "Title: " + r.title, "Industry: " + r.industry, "Country: " + r.country,
    "Experience: " + r.yearsCorp + " years corporate" + (r.yearsProj ? ", " + r.yearsProj + " years projects" : ""), "Open for: " + r.openFor.join(", "), "Skills: " + r.skills.join(", "), "LinkedIn: " + r.linkedin,
    "", "Summary:", r.summary, "", "Approve or reject it here: https://uhirable.com/talent-admin.html"].join("\n");
  try { await env.MAIL.send({ from, to, subject, text }); await note("sent"); }
  catch (e) {
    try {
      const b64 = btoa(String.fromCharCode(...new TextEncoder().encode(text))).replace(/(.{76})/g, "$1\r\n");
      const raw = ["From: U Hirable <" + from + ">", "To: " + to, "Subject: " + subject.replace(/[^\x20-\x7e]/g, "?"), "Message-ID: <" + crypto.randomUUID() + "@uhirable.com>", "Date: " + new Date().toUTCString(),
        "MIME-Version: 1.0", "Content-Type: text/plain; charset=utf-8", "Content-Transfer-Encoding: base64", "", b64].join("\r\n");
      await env.MAIL.send(new EmailMessage(from, to, raw));
      await note("sent (raw message)");
    } catch (x) { await note("failed: " + String((e && e.message) || e).slice(0, 200) + " | raw: " + String((x && x.message) || x).slice(0, 200)); }
  }
}

// Compares two strings without stopping at the first different character.
async function same(a, b) {
  const enc = new TextEncoder();
  const [x, y] = await Promise.all([crypto.subtle.digest("SHA-256", enc.encode(a)), crypto.subtle.digest("SHA-256", enc.encode(b))]);
  const p = new Uint8Array(x), q = new Uint8Array(y);
  let diff = 0;
  for (let i = 0; i < p.length; i++) diff |= p[i] ^ q[i];
  return diff === 0;
}

export async function talentApi(request, env, url, ctx) {
  const path = url.pathname.replace(/\/+$/, "");
  if (!env.DB) return json({ error: "Not set up yet." }, 503);

  if (path === "/api/talent" && request.method === "GET") {
    const { results } = await env.DB.prepare("SELECT * FROM talent WHERE status = 'approved' ORDER BY decided_at DESC LIMIT 300").all();
    return json({ talent: results.map(card) }, 200, { "cache-control": "public, max-age=60" });
  }

  if (request.method !== "POST") return json({ error: "Not found." }, 404);
  // Only the site's own pages may post here.
  const origin = request.headers.get("origin");
  if (origin && new URL(origin).host !== url.host) return json({ error: "Not allowed." }, 403);
  const b = await request.json().catch(() => null);
  if (!b || typeof b !== "object") return json({ error: "Bad request." }, 400);

  if (path === "/api/talent") {
    if (!env.TURNSTILE_SECRET) return json({ error: "The form is not open yet. Please try again later." }, 503);
    if (b.website) return json({ ok: true }); // hidden field only robots fill in: pretend it worked
    const f = readForm(b);
    if (f.error) return json({ error: f.error }, 400);
    if (!(await human(env, b.token, request.headers.get("cf-connecting-ip")))) return json({ error: "The robot check did not pass. Please try it again." }, 400);
    const waiting = await env.DB.prepare("SELECT COUNT(*) AS n FROM talent WHERE status = 'pending'").first();
    if (waiting && waiting.n >= MAX_PENDING) return json({ error: "We are reviewing many profiles right now. Please try again tomorrow." }, 429);
    const dup = await env.DB.prepare("SELECT id FROM talent WHERE lower(linkedin) = lower(?) AND status != 'rejected'").bind(f.row.linkedin).first();
    if (dup) return json({ error: "A profile with this LinkedIn link has already been sent." }, 409);
    const r = f.row, now = new Date().toISOString();
    await env.DB.prepare("INSERT INTO talent (id, created_at, status, name, title, linkedin, industry, years_corp, years_proj, country, cc, open_for, skills, summary, consent_at) VALUES (?, ?, 'pending', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
      .bind(crypto.randomUUID(), now, r.name, r.title, r.linkedin, r.industry, r.yearsCorp, r.yearsProj, r.country, r.cc, JSON.stringify(r.openFor), JSON.stringify(r.skills), r.summary, now).run();
    if (ctx && ctx.waitUntil) ctx.waitUntil(notify(env, r)); else await notify(env, r);
    return json({ ok: true });
  }

  if (path === "/api/talent/admin") {
    if (!env.TALENT_ADMIN_PASSWORD) return json({ error: "The review page has no password yet." }, 503);
    if (!(await same(String(b.password || ""), env.TALENT_ADMIN_PASSWORD))) {
      await new Promise((ok) => setTimeout(ok, 800)); // slows down guessing
      return json({ error: "Wrong password." }, 401);
    }
    const id = String(b.id || ""), now = new Date().toISOString();
    if (b.action === "approve") await env.DB.prepare("UPDATE talent SET status = 'approved', decided_at = ? WHERE id = ?").bind(now, id).run();
    else if (b.action === "reject") await env.DB.prepare("UPDATE talent SET status = 'rejected', decided_at = ? WHERE id = ?").bind(now, id).run();
    else if (b.action === "delete") await env.DB.prepare("DELETE FROM talent WHERE id = ?").bind(id).run();
    else if (b.action !== "list") return json({ error: "Unknown action." }, 400);
    const { results } = await env.DB.prepare("SELECT * FROM talent ORDER BY created_at DESC LIMIT 1000").all();
    return json({ talent: results.map((r) => ({ ...card(r), fullName: r.name, status: r.status, created: r.created_at.slice(0, 10) })) });
  }

  return json({ error: "Not found." }, 404);
}
