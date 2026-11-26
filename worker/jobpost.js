// Free job posts: an employer sends a job, U Hirable reviews it, and the approved job stays listed until the employer asks for it to be removed.
// Candidates apply straight to the employer (their link or their email). No candidate data passes through here.
// The posts live in the D1 database (binding DB), never in the site's files.
//
//   GET  /api/jobpost            -> approved, live posts (public fields only)
//   POST /api/jobpost            -> an employer sends the form (checked by Turnstile); saved as "pending"
//   POST /api/jobpost/admin      -> the review page (jobs-admin.html): list, approve, reject, delete (needs the review password)
//   GET  /job-post-<id>.html     -> the job's own page, written from the database (see jobPostPage)
//   GET  /sitemap-jobs.xml       -> the live job pages, for search engines
//
// Uses the same settings as worker/talent.js: DB, TURNSTILE_SECRET, TALENT_ADMIN_PASSWORD, and MAIL + TALENT_NOTIFY_EMAIL for the notice.

const SITE = "https://uhirable.com";
const MAX_PENDING = 200; // waiting posts allowed at once; more than that means the form is being abused
const WORKPLACES = ["On-site", "Hybrid", "Remote"];
const TYPES = ["Full-time", "Part-time", "Contract", "Internship"];
const LD_TYPE = { "Full-time": "FULL_TIME", "Part-time": "PART_TIME", "Contract": "CONTRACTOR", "Internship": "INTERN" };
export const NOTE = "Posted directly by the employer. U Hirable does not take part in hiring and cannot verify every detail. Never pay to apply for a job.";

const TABLE = `CREATE TABLE IF NOT EXISTS job_posts (
  id TEXT PRIMARY KEY, created_at TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'pending', decided_at TEXT,
  company TEXT NOT NULL, website TEXT NOT NULL, contact_email TEXT NOT NULL,
  title TEXT NOT NULL, country TEXT NOT NULL, city TEXT NOT NULL, workplace TEXT NOT NULL, type TEXT NOT NULL,
  description TEXT NOT NULL, salary TEXT NOT NULL, apply_url TEXT NOT NULL, apply_email TEXT NOT NULL, agreed_at TEXT NOT NULL, website_checked INTEGER NOT NULL DEFAULT 0)`;

const json = (body, status = 200, headers = {}) =>
  new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", ...headers } });
const line = (v, max) => String(v == null ? "" : v).replace(/[\u0000-\u001f\u007f<>]/g, " ").replace(/\s+/g, " ").trim().slice(0, max);
const text = (v, max) => String(v == null ? "" : v).replace(/\r/g, "").replace(/[\u0000-\u0009\u000b-\u001f\u007f<>]/g, " ").replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n").trim().slice(0, max);
const esc = (t) => String(t == null ? "" : t).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const slug = (s) => String(s).toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
const isEmail = (v) => /^[^\s@<>"',;]+@[^\s@<>"',;]+\.[a-z]{2,}$/i.test(v) && v.length <= 120;
// A web link the form may store: http or https only, with a real host name. "company.com" is read as "https://company.com".
const webLink = (v) => { try { const raw = String(v).trim(), u = new URL(/^[a-z][a-z0-9+.-]*:/i.test(raw) ? raw : "https://" + raw); return /^https?:$/.test(u.protocol) && /\.[a-z]{2,}$/i.test(u.hostname) ? u.href.slice(0, 300) : ""; } catch (e) { return ""; } };
const day = (iso) => String(iso || "").slice(0, 10);

// What the public gets for one job. The employer's contact email stays in the database.
const pub = (r) => ({ id: r.id, title: r.title, company: r.company, website: r.website, country: r.country, city: r.city, workplace: r.workplace, type: r.type,
  description: r.description, salary: r.salary, applyUrl: r.apply_url, applyEmail: r.apply_email, posted: day(r.decided_at || r.created_at), websiteChecked: !!r.website_checked }); // websiteChecked: Amel opened the company website herself and ticked it on the review page

// Reads and checks the form. Returns { row } or { error }.
function readForm(b) {
  const company = line(b.company, 80), title = line(b.title, 100), country = line(b.country, 60), city = line(b.city, 60), salary = line(b.salary, 80);
  const contactEmail = String(b.contactEmail || "").trim(), applyEmail = String(b.applyEmail || "").trim();
  const workplace = WORKPLACES.includes(b.workplace) ? b.workplace : "", type = TYPES.includes(b.type) ? b.type : "";
  const description = text(b.description, 6000);
  const rawSite = String(b.website || "").trim(), rawApply = String(b.applyUrl || "").trim();
  const website = rawSite ? webLink(rawSite) : "", applyUrl = rawApply ? webLink(rawApply) : "";
  if (company.length < 2) return { error: "Enter your company name." };
  if (!rawSite) return { error: "Enter your company website." };
  if (!website) return { error: "The company website is not a valid link. Write it like https://company.com." };
  if (!isEmail(contactEmail)) return { error: "Enter your work email." };
  if (title.length < 3) return { error: "Enter the job title." };
  if (country.length < 2) return { error: "Enter the country." };
  if (!workplace) return { error: "Choose the workplace." };
  if (workplace !== "Remote" && city.length < 2) return { error: "Enter the city." };
  if (!type) return { error: "Choose the job type." };
  if (description.length < 150) return { error: "Write a job description of at least 150 characters." };
  if (rawApply && !applyUrl) return { error: "The application link is not a valid link. Write it like https://company.com/careers, or leave it empty and use an email." };
  if (applyEmail && !isEmail(applyEmail)) return { error: "The application email is not a valid email address. Write it like jobs@company.com, or leave it empty and use a link." };
  if (!applyUrl && !applyEmail) return { error: "Add an application link or an application email." };
  if (b.agree !== true) return { error: "Tick the box to agree before you post." };
  return { row: { company, website, contactEmail, title, country, city, workplace, type, description, salary, applyUrl, applyEmail } };
}

async function human(env, token, ip) {
  const body = new URLSearchParams({ secret: env.TURNSTILE_SECRET, response: String(token || "") });
  if (ip) body.set("remoteip", ip);
  const r = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", { method: "POST", body });
  const d = await r.json().catch(() => ({}));
  return d.success === true;
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

// Tells the owner that a job is waiting. A failure here never blocks the employer's form.
async function notify(env, r) {
  if (!env.MAIL || !env.TALENT_NOTIFY_EMAIL) return;
  const body = ["A new job post is waiting for your review.", "", "Job: " + r.title, "Company: " + r.company + (r.website ? " (" + r.website + ")" : ""),
    "Where: " + [r.city, r.country].filter(Boolean).join(", ") + " · " + r.workplace + " · " + r.type, r.salary ? "Salary: " + r.salary : "",
    "Candidates apply by: " + (r.applyUrl || r.applyEmail), "Sent by: " + r.contactEmail, "", "Description:", r.description, "",
    "Approve or reject it here: " + SITE + "/jobs-admin.html"].filter((l) => l !== "").join("\n");
  try { await env.MAIL.send({ from: "talent@uhirable.com", to: env.TALENT_NOTIFY_EMAIL, subject: "New job post: " + r.title + " at " + r.company, text: body }); } catch (e) {}
}

export async function jobPostApi(request, env, url, ctx) {
  const path = url.pathname.replace(/\/+$/, "");
  if (!env.DB) return json({ error: "Not set up yet." }, 503);
  await env.DB.prepare(TABLE).run();

  if (path === "/api/jobpost" && request.method === "GET") {
    const { results } = await env.DB.prepare("SELECT * FROM job_posts WHERE status = 'approved' ORDER BY decided_at DESC LIMIT 200").all();
    return json({ jobs: results.map(pub), note: NOTE }, 200, { "cache-control": "public, max-age=120" });
  }

  if (request.method !== "POST") return json({ error: "Not found." }, 404);
  // Only the site's own pages may post here.
  const origin = request.headers.get("origin");
  if (origin && new URL(origin).host !== url.host) return json({ error: "Not allowed." }, 403);
  const b = await request.json().catch(() => null);
  if (!b || typeof b !== "object") return json({ error: "Bad request." }, 400);

  if (path === "/api/jobpost") {
    if (!env.TURNSTILE_SECRET) return json({ error: "The form is not open yet. Please try again later." }, 503);
    if (b.fax) return json({ ok: true }); // hidden field only robots fill in: pretend it worked
    const f = readForm(b);
    if (f.error) return json({ error: f.error }, 400);
    if (!(await human(env, b.token, request.headers.get("cf-connecting-ip")))) return json({ error: "The robot check did not pass. Please try it again." }, 400);
    const waiting = await env.DB.prepare("SELECT COUNT(*) AS n FROM job_posts WHERE status = 'pending'").first();
    if (waiting && waiting.n >= MAX_PENDING) return json({ error: "We are reviewing many job posts right now. Please try again tomorrow." }, 429);
    const r = f.row, now = new Date().toISOString();
    const dup = await env.DB.prepare("SELECT id FROM job_posts WHERE lower(title) = lower(?) AND lower(company) = lower(?) AND status != 'rejected'").bind(r.title, r.company).first();
    if (dup) return json({ error: "This job has already been sent. We review posts within one business day." }, 409);
    const id = (slug(r.title + " " + r.company).slice(0, 70).replace(/-+$/, "") || "job") + "-" + crypto.randomUUID().slice(0, 6);
    await env.DB.prepare("INSERT INTO job_posts (id, created_at, status, company, website, contact_email, title, country, city, workplace, type, description, salary, apply_url, apply_email, agreed_at) VALUES (?, ?, 'pending', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
      .bind(id, now, r.company, r.website, r.contactEmail, r.title, r.country, r.city, r.workplace, r.type, r.description, r.salary, r.applyUrl, r.applyEmail, now).run();
    if (ctx && ctx.waitUntil) ctx.waitUntil(notify(env, r)); else await notify(env, r);
    return json({ ok: true });
  }

  if (path === "/api/jobpost/admin") {
    if (!env.TALENT_ADMIN_PASSWORD) return json({ error: "The review page has no password yet." }, 503);
    if (!(await same(String(b.password || ""), env.TALENT_ADMIN_PASSWORD))) {
      await new Promise((ok) => setTimeout(ok, 800)); // slows down guessing
      return json({ error: "Wrong password." }, 401);
    }
    const id = String(b.id || ""), now = new Date().toISOString();
    if (b.action === "approve") await env.DB.prepare("UPDATE job_posts SET status = 'approved', decided_at = ?, website_checked = 1 WHERE id = ?").bind(now, id).run();
    else if (b.action === "reject") await env.DB.prepare("UPDATE job_posts SET status = 'rejected', decided_at = ? WHERE id = ?").bind(now, id).run();
    else if (b.action === "check" || b.action === "uncheck") await env.DB.prepare("UPDATE job_posts SET website_checked = ? WHERE id = ?").bind(b.action === "check" ? 1 : 0, id).run();
    else if (b.action === "delete") await env.DB.prepare("DELETE FROM job_posts WHERE id = ?").bind(id).run();
    else if (b.action !== "list") return json({ error: "Unknown action." }, 400);
    const { results } = await env.DB.prepare("SELECT * FROM job_posts ORDER BY created_at DESC LIMIT 1000").all();
    return json({ jobs: results.map((r) => ({ ...pub(r), contactEmail: r.contact_email, created: day(r.created_at),
      status: r.status })) });
  }

  return json({ error: "Not found." }, 404);
}

// ---- The job's own page: /job-post-<id>.html ----
// The page is the site's file posted-job.html with this job written into it: the title and description for people and search engines,
// the JobPosting data for Google, and the job itself for the page's script (script.js draws it like every other job page).
const paragraphs = (t) => String(t).split(/\n{2,}/).map((p) => "<p>" + esc(p).replace(/\n/g, "<br>") + "</p>").join("");
const inScript = (v) => JSON.stringify(v).replace(/</g, "\\u003c").replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");
const place = (j) => (j.workplace === "Remote" ? "Remote, " + j.country : [j.city, j.country].filter(Boolean).join(", "));

// Reads the salary the employer wrote ("USD $15/hour", "₱32,000–₱37,000 per month", "£40k - £50k a year") into Google's baseSalary.
// Returns null when the text has no clear currency, amount and period: a guessed salary is worse than none.
const CUR = [["USD", /\bUSD\b|US\$|\$/], ["GBP", /\bGBP\b|£/], ["EUR", /\bEUR\b|€/], ["PHP", /\bPHP\b|₱/], ["CAD", /\bCAD\b|C\$/], ["AUD", /\bAUD\b|A\$/],
  ["INR", /\bINR\b|₹/], ["AED", /\bAED\b/], ["SAR", /\bSAR\b/], ["EGP", /\bEGP\b|E£/], ["NGN", /\bNGN\b|₦/], ["KES", /\bKES\b/], ["ZAR", /\bZAR\b/], ["PKR", /\bPKR\b/]];
const UNIT = [["HOUR", /hour|hr\b|\/h\b/i], ["DAY", /\bday|daily/i], ["WEEK", /week/i], ["MONTH", /month|\/mo\b/i], ["YEAR", /year|annual|annum|\/yr\b|p\.a\./i]];
function baseSalary(raw) {
  const t = String(raw || "");
  if (!t) return null;
  // Canadian, Australian and "E£" signs are checked before the plain $ and £.
  const order = ["CAD", "AUD", "EGP", "USD", "GBP", "EUR", "PHP", "INR", "AED", "SAR", "NGN", "KES", "ZAR", "PKR"];
  const cur = order.map((c) => CUR.find((x) => x[0] === c)).find((x) => x[1].test(t));
  const unit = UNIT.find((x) => x[1].test(t));
  if (!cur || !unit) return null;
  // Only the first amount or range counts; later numbers are bonuses or notes ("plus up to three $15 bonuses").
  const m = t.match(/(\d[\d,]*(?:\.\d+)?)\s*(k)?(?:[^\d]{0,12}?[-–—]|\s+to\s+)[^\d]{0,6}(\d[\d,]*(?:\.\d+)?)\s*(k)?/i) || t.match(/(\d[\d,]*(?:\.\d+)?)\s*(k)?/i);
  if (!m) return null;
  const num = (v, k) => (v ? parseFloat(v.replace(/,/g, "")) * (k ? 1000 : 1) : null);
  const lo = num(m[1], m[2]), hi = m[3] ? num(m[3], m[4] || m[2]) : null;
  if (!(lo > 0) || (hi !== null && !(hi >= lo))) return null;
  const value = { "@type": "QuantitativeValue", unitText: unit[0] };
  if (hi && hi !== lo) { value.minValue = lo; value.maxValue = hi; } else value.value = lo;
  return { "@type": "MonetaryAmount", currency: cur[0], value };
}
// Employer posts stay live until the employer asks for removal, so the end date always sits 60 days after the day the page is read.
const validThrough = () => new Date(Date.now() + 60 * 864e5).toISOString().slice(0, 10) + "T23:59";
export const _test = { baseSalary };

function jobPosting(j, pageUrl) {
  const ld = { "@context": "https://schema.org/", "@type": "JobPosting", title: j.title, description: paragraphs(j.description), datePosted: j.posted,
    validThrough: validThrough(),
    employmentType: LD_TYPE[j.type], hiringOrganization: { "@type": "Organization", name: j.company, ...(j.website ? { sameAs: j.website } : {}) }, url: pageUrl, directApply: false };
  const pay = baseSalary(j.salary);
  if (pay) ld.baseSalary = pay;
  if (j.workplace === "Remote") { ld.jobLocationType = "TELECOMMUTE"; ld.applicantLocationRequirements = { "@type": "Country", name: j.country }; }
  else ld.jobLocation = { "@type": "Place", address: { "@type": "PostalAddress", addressLocality: j.city, addressCountry: j.country } };
  return ld;
}

// Returns the page, or null when there is no live job with this id (the caller then answers 404).
export async function jobPostPage(request, env, url, id) {
  if (request.method !== "GET" && request.method !== "HEAD") return null;
  if (!env.DB) return null;
  let r;
  try { r = await env.DB.prepare("SELECT * FROM job_posts WHERE id = ? AND status = 'approved'").bind(id).first(); } catch (e) { return null; }
  if (!r) return null;
  const tpl = new URL(url); tpl.pathname = "/posted-job.html"; tpl.search = "";
  const page = await env.ASSETS.fetch(new Request(tpl));
  if (page.status !== 200) return null;
  const j = pub(r), pageUrl = SITE + "/job-post-" + j.id + ".html", where = place(j);
  const title = j.title + " at " + j.company + " – " + where, short = j.description.replace(/\s+/g, " ").slice(0, 150);
  const desc = [where, j.workplace, j.type, j.salary].filter(Boolean).join(" · ") + ". " + short;
  const attr = (name, value) => ({ element(e) { e.setAttribute(name, value); } });
  // A job with its own share design: when the file og-job-post-<id>.png is in the site's files, a shared link shows it instead of the general image.
  let ogImage = "";
  try {
    const img = new URL(url); img.pathname = "/og-job-post-" + j.id + ".png"; img.search = "";
    const found = await env.ASSETS.fetch(new Request(img, { method: "HEAD" }));
    if (found.status === 200) ogImage = SITE + "/og-job-post-" + j.id + ".png";
  } catch (e) {}
  const out = new HTMLRewriter()
    .on("title", { element(e) { e.setInnerContent(title); } })
    .on('meta[name="description"]', attr("content", desc))
    .on('meta[name="robots"]', { element(e) { e.remove(); } })
    .on('link[rel="canonical"]', attr("href", pageUrl))
    .on('meta[property="og:title"]', attr("content", "We're hiring: " + j.title + " at " + j.company))
    .on('meta[property="og:description"]', attr("content", desc))
    .on('meta[property="og:url"]', attr("content", pageUrl))
    .on('meta[property="og:image"]', { element(e) { if (ogImage) e.setAttribute("content", ogImage); } })
    .on("#pj-ld", { element(e) { e.setInnerContent(inScript(jobPosting(j, pageUrl)), { html: true }); } })
    .on("#pj-data", { element(e) { e.setInnerContent("window.POSTED_JOB=" + inScript(j) + ";window.POSTED_NOTE=" + inScript(NOTE) + ";", { html: true }); } })
    .on("#job-title", { element(e) { e.setInnerContent(j.title); } })
    .on("#job-meta", { element(e) { e.setInnerContent(j.company); } })
    .on("#job-content", { element(e) { e.setInnerContent("<h2>Role overview</h2>" + paragraphs(j.description), { html: true }); } })
    .transform(page);
  const headers = new Headers(out.headers);
  headers.set("cache-control", "public, max-age=300");
  headers.delete("etag"); headers.delete("content-length");
  return new Response(request.method === "HEAD" ? null : out.body, { status: 200, headers });
}

export async function jobPostSitemap(env) {
  let rows = [];
  try { rows = (await env.DB.prepare("SELECT id, decided_at FROM job_posts WHERE status = 'approved' ORDER BY decided_at DESC LIMIT 1000").all()).results; } catch (e) {}
  const xml = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
    + rows.map((r) => "  <url><loc>" + SITE + "/job-post-" + esc(r.id) + ".html</loc><lastmod>" + day(r.decided_at) + "</lastmod></url>\n").join("") + "</urlset>\n";
  return new Response(xml, { headers: { "content-type": "application/xml; charset=utf-8", "cache-control": "public, max-age=3600" } });
}
