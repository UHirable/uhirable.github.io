// Job applications for roles posted on behalf of a recruiting partner (see tools/confidential_jobs.py).
// Candidates' data is kept in the D1 database only. Nothing here is written to the repository.
//
//   POST /api/apply          a candidate sends the form
//   POST /api/apply/admin    the owner's review page (applications-admin.html), with the review password
//
// Uses the same settings as worker/talent.js: DB, TURNSTILE_SECRET, TALENT_ADMIN_PASSWORD, and MAIL + TALENT_NOTIFY_EMAIL for the notice.

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" } });
const line = (v, max) => String(v == null ? "" : v).replace(/[\u0000-\u001f\u007f<>]/g, " ").replace(/\s+/g, " ").trim().slice(0, max);
const text = (v, max) => String(v == null ? "" : v).replace(/\r/g, "").replace(/[\u0000-\u0009\u000b-\u001f\u007f<>]/g, " ").replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n").trim().slice(0, max);
const MAX_PER_DAY = 200; // more than this in one day means the form is being abused
const STATUSES = ["new", "contacted", "submitted", "not a fit"];

const TABLE = `CREATE TABLE IF NOT EXISTS applications (
  id TEXT PRIMARY KEY, created_at TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'new',
  job_id TEXT NOT NULL, job_title TEXT NOT NULL,
  name TEXT NOT NULL, email TEXT NOT NULL, phone TEXT NOT NULL, location TEXT NOT NULL,
  linkedin TEXT NOT NULL, cv TEXT NOT NULL, authorised TEXT NOT NULL, sponsorship TEXT NOT NULL,
  compensation TEXT NOT NULL, answers TEXT NOT NULL, consent_at TEXT NOT NULL)`;
// An uploaded CV is kept in its own table, one row per application. D1 allows 2 MB per row, so files are limited to 1.5 MB.
const FILES = `CREATE TABLE IF NOT EXISTS application_files (id TEXT PRIMARY KEY, name TEXT NOT NULL, type TEXT NOT NULL, data BLOB NOT NULL)`;
const MAX_FILE = 1500000;
const TYPES = { pdf: "application/pdf", docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", doc: "application/msword" };

// Reads the uploaded CV ({ name, data: base64 }). Returns { file } (null when none was sent) or { error }.
// The type is decided by the file's first bytes, not by its name.
function readFile(f) {
  if (!f || typeof f !== "object" || !f.data) return { file: null };
  let bytes;
  try { const bin = atob(String(f.data)); bytes = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i); }
  catch (e) { return { error: "The CV file could not be read. Please choose it again." }; }
  if (bytes.length > MAX_FILE) return { error: "The CV file is larger than 1.5 MB. Please upload a smaller file or paste a link instead." };
  const head = [...bytes.slice(0, 4)].map((x) => x.toString(16).padStart(2, "0")).join("");
  const kind = head === "25504446" ? "pdf" : head === "504b0304" ? "docx" : head === "d0cf11e0" ? "doc" : "";
  if (!kind) return { error: "Please upload your CV as a PDF or Word file." };
  const base = line(f.name, 80).replace(/\.[A-Za-z0-9]+$/, "").replace(/[^\p{L}\p{N} _-]/gu, "").trim() || "cv";
  return { file: { name: base + "." + kind, type: TYPES[kind], bytes } };
}

async function human(env, token, ip) {
  const body = new URLSearchParams({ secret: env.TURNSTILE_SECRET, response: String(token || "") });
  if (ip) body.set("remoteip", ip);
  const r = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", { method: "POST", body });
  const d = await r.json().catch(() => ({}));
  return d.success === true;
}

async function same(a, b) {
  const enc = new TextEncoder();
  const [x, y] = await Promise.all([crypto.subtle.digest("SHA-256", enc.encode(a)), crypto.subtle.digest("SHA-256", enc.encode(b))]);
  const p = new Uint8Array(x), q = new Uint8Array(y);
  let diff = 0;
  for (let i = 0; i < p.length; i++) diff |= p[i] ^ q[i];
  return diff === 0;
}

// The list of roles and their questions is the site's own file, so the form and this check always agree.
async function roles(env, url) {
  const r = await env.ASSETS.fetch(new Request(new URL("/apply-jobs.json", url)));
  return r.ok ? r.json() : {};
}

const web = (v, max) => { const s = line(v, max); try { const u = new URL(s); return u.protocol === "https:" ? u.toString() : ""; } catch (e) { return ""; } };

// Reads and checks the form. Returns { row } or { error }.
function readForm(b, role, hasFile) {
  const row = {
    name: line(b.name, 80), email: line(b.email, 120).toLowerCase(), phone: line(b.phone, 30), location: line(b.location, 80),
    linkedin: web(b.linkedin, 200), cv: web(b.cv, 300),
    authorised: b.authorised === "yes" ? "yes" : b.authorised === "no" ? "no" : "",
    sponsorship: b.sponsorship === "yes" ? "yes" : b.sponsorship === "no" ? "no" : "",
    compensation: line(b.compensation, 200),
  };
  if (row.name.length < 3) return { error: "Please enter your full name." };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(row.email)) return { error: "Please enter a valid email address." };
  if (row.phone.replace(/\D/g, "").length < 7) return { error: "Please enter a phone number." };
  if (row.location.length < 2) return { error: "Please enter your city and state." };
  if (!/^https:\/\/([a-z]+\.)?linkedin\.com\//i.test(row.linkedin)) return { error: "Please paste the link to your LinkedIn profile (it starts with https://www.linkedin.com/)." };
  if (!row.cv && !hasFile) return { error: "Please upload your CV, or paste a link to it that starts with https://." };
  if (!row.authorised || !row.sponsorship) return { error: "Please answer both work eligibility questions." };
  if (!row.compensation) return { error: "Please enter your desired compensation." };
  const given = Array.isArray(b.answers) ? b.answers : [];
  const answers = [];
  for (let i = 0; i < role.questions.length; i++) {
    const q = role.questions[i];
    let a = q.type === "text" ? text(given[i], 1500) : line(given[i], 200);
    if (q.type === "yn") a = a === "yes" || a === "no" ? a : "";
    if (!a) return { error: "Please answer every question for this role." };
    answers.push({ q: q.q, a });
  }
  if (b.consent !== true) return { error: "Please tick the box to agree before sending." };
  row.answers = JSON.stringify(answers);
  return { row };
}

// Tells the owner that an application is waiting. No candidate details go into the email. A failure here never blocks the form.
async function notify(env, title) {
  try {
    if (!env.MAIL || !env.TALENT_NOTIFY_EMAIL) return;
    await env.MAIL.send({ from: "talent@uhirable.com", to: env.TALENT_NOTIFY_EMAIL, subject: "New job application: " + title,
      text: "A new application is waiting for: " + title + "\n\nOpen the review page to read it:\nhttps://uhirable.com/applications-admin.html\n" });
  } catch (e) { /* the application is already saved */ }
}

export async function applyApi(request, env, url, ctx) {
  const path = url.pathname.replace(/\/+$/, "");
  if (!env.DB) return json({ error: "Not set up yet." }, 503);
  if (request.method !== "POST") return json({ error: "Not found." }, 404);
  // Only the site's own pages may post here.
  const origin = request.headers.get("origin");
  if (origin && new URL(origin).host !== url.host) return json({ error: "Not allowed." }, 403);
  const b = await request.json().catch(() => null);
  if (!b || typeof b !== "object") return json({ error: "Bad request." }, 400);

  if (path === "/api/apply") {
    if (!env.TURNSTILE_SECRET) return json({ error: "The form is not open yet. Please try again later." }, 503);
    if (b.website) return json({ ok: true }); // hidden field only robots fill in: pretend it worked
    const all = await roles(env, url), jobId = line(b.job, 90), role = all[jobId];
    if (!role) return json({ error: "This role is no longer open." }, 404);
    const up = readFile(b.file);
    if (up.error) return json({ error: up.error }, 400);
    const f = readForm(b, role, !!up.file);
    if (f.error) return json({ error: f.error }, 400);
    if (!(await human(env, b.token, request.headers.get("cf-connecting-ip")))) return json({ error: "The robot check did not pass. Please try it again." }, 400);
    await env.DB.prepare(TABLE).run();
    await env.DB.prepare(FILES).run();
    const now = new Date(), since = new Date(now - 864e5).toISOString();
    const recent = await env.DB.prepare("SELECT COUNT(*) AS n FROM applications WHERE created_at > ?").bind(since).first();
    if (recent && recent.n >= MAX_PER_DAY) return json({ error: "We are receiving many applications right now. Please try again tomorrow." }, 429);
    const r = f.row;
    const dup = await env.DB.prepare("SELECT id FROM applications WHERE job_id = ? AND email = ?").bind(jobId, r.email).first();
    if (dup) return json({ error: "You have already applied for this role with this email." }, 409);
    const newId = crypto.randomUUID();
    if (up.file) await env.DB.prepare("INSERT INTO application_files (id, name, type, data) VALUES (?, ?, ?, ?)").bind(newId, up.file.name, up.file.type, up.file.bytes).run();
    await env.DB.prepare("INSERT INTO applications (id, created_at, status, job_id, job_title, name, email, phone, location, linkedin, cv, authorised, sponsorship, compensation, answers, consent_at) VALUES (?, ?, 'new', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
      .bind(newId, now.toISOString(), jobId, role.title, r.name, r.email, r.phone, r.location, r.linkedin, r.cv, r.authorised, r.sponsorship, r.compensation, r.answers, now.toISOString()).run();
    if (ctx && ctx.waitUntil) ctx.waitUntil(notify(env, role.title)); else await notify(env, role.title);
    return json({ ok: true });
  }

  if (path === "/api/apply/admin") {
    if (!env.TALENT_ADMIN_PASSWORD) return json({ error: "The review page has no password yet." }, 503);
    if (!(await same(String(b.password || ""), env.TALENT_ADMIN_PASSWORD))) {
      await new Promise((ok) => setTimeout(ok, 800)); // slows down guessing
      return json({ error: "Wrong password." }, 401);
    }
    await env.DB.prepare(TABLE).run();
    await env.DB.prepare(FILES).run();
    const id = String(b.id || "");
    if (b.action === "file") {
      const f = await env.DB.prepare("SELECT name, type, data FROM application_files WHERE id = ?").bind(id).first();
      if (!f) return json({ error: "No file for this application." }, 404);
      return new Response(new Uint8Array(f.data), { headers: { "content-type": f.type, "content-disposition": 'attachment; filename="' + f.name.replace(/[^\x20-\x7e]|"/g, "_") + '"', "x-file-name": encodeURIComponent(f.name), "cache-control": "no-store" } });
    }
    if (b.action === "status" && STATUSES.includes(b.status)) await env.DB.prepare("UPDATE applications SET status = ? WHERE id = ?").bind(b.status, id).run();
    else if (b.action === "delete") { await env.DB.prepare("DELETE FROM application_files WHERE id = ?").bind(id).run(); await env.DB.prepare("DELETE FROM applications WHERE id = ?").bind(id).run(); }
    else if (b.action !== "list") return json({ error: "Unknown action." }, 400);
    const { results } = await env.DB.prepare("SELECT a.*, f.name AS file_name FROM applications a LEFT JOIN application_files f ON f.id = a.id ORDER BY a.created_at DESC LIMIT 1000").all();
    return json({ statuses: STATUSES, applications: results.map((r) => ({ ...r, answers: JSON.parse(r.answers), created: r.created_at.slice(0, 10) })) });
  }

  return json({ error: "Not found." }, 404);
}
