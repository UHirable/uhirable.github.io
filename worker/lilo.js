// Lilo, the site's assistant, and the U Hirable connector for AI apps.
//
//   POST /api/lilo   -> Lilo's answer to a visitor, written by Workers AI (free daily allowance).
//                       When the allowance is used up or the model fails, it answers 503 and the
//                       page falls back to Lilo's built-in answers, so the chat never goes dark.
//   POST /mcp        -> the connector (Model Context Protocol) that ChatGPT, Claude and other AI apps
//                       can add: read-only tools to search the site, list job fairs, offers and
//                       jobs posted by employers. No personal data is exposed.
//
// Both read the same public files the pages use (search-index.js, careers.js, partners.js),
// so a change on the site shows up here without touching this file.

import { jobPostApi } from "./jobpost.js";

const SITE = "https://uhirable.com/";
const WHATSAPP = "https://whatsapp.com/channel/0029VbEDfrB7oQhYTHsf582Q";

// Text models that are on the free Workers plan, best first. The first one that answers is used.
const MODELS = ["@cf/zai-org/glm-4.7-flash", "@cf/google/gemma-4-26b-a4b-it", "@cf/meta/llama-3.1-8b-instruct"];

const json = (data, status = 200, headers = {}) =>
  new Response(JSON.stringify(data), { status, headers: { "content-type": "application/json; charset=utf-8", ...headers } });

// ---------- the site's public data ----------

let cache = null, cachedAt = 0;

async function asset(env, url, path) {
  const u = new URL(url); u.pathname = path; u.search = "";
  const r = await env.ASSETS.fetch(new Request(u));
  return r.status === 200 ? r.text() : "";
}

// Reads the offers out of careers.js / partners.js (plain "key: "value"" blocks).
function offers(text, skip) {
  const out = [];
  const parts = text.split(/\n\s*\{\s*\n?\s*name:\s*"/).slice(1);
  for (const p of parts) {
    const name = p.slice(0, p.indexOf('"'));
    const get = (k) => { const m = p.match(new RegExp("\\b" + k + ':\\s*"((?:[^"\\\\]|\\\\.)*)"')); return m ? m[1].replace(/\\"/g, '"') : ""; };
    const o = { name, what: get("tag"), about: get("tagline"), offer: get("deal"), details: get("perk"), link: get("link") };
    if (o.link && !(skip || []).includes(name)) out.push(o);
  }
  return out;
}

async function data(env, url) {
  if (cache && Date.now() - cachedAt < 10 * 60 * 1000) return cache;
  const [idx, careers, partners] = await Promise.all([
    asset(env, url, "/search-index.js"), asset(env, url, "/careers.js"), asset(env, url, "/partners.js"),
  ]);
  let index = [];
  try { index = JSON.parse(idx.slice(idx.indexOf("["), idx.lastIndexOf("]") + 1)); } catch (e) {}
  cache = {
    index,
    seekers: offers(careers),
    // Manatal is left out of the company offers.
    companies: offers(partners, ["Manatal"]),
  };
  cachedAt = Date.now();
  return cache;
}

const full = (u) => (/^https?:/i.test(u) ? u : SITE + String(u).replace(/^\//, ""));

const STOP = new Set("the and for with that this from your you are our will have has not but can all any more than into what where which how who job jobs work find want need looking please about there here".split(" "));
function words(q) {
  return String(q || "").toLowerCase().split(/[^a-z0-9+#.؀-ۿ]+/).filter((w) => w.length > 2 && !STOP.has(w)).slice(0, 12);
}

// The entries that mention most of the words, best first.
function search(index, q, kinds, n) {
  const ws = words(q);
  if (!ws.length) return [];
  const scored = [];
  for (const e of index) {
    if (kinds && !kinds.includes(e.k)) continue;
    const title = (e.t || "").toLowerCase(), all = title + " " + (e.d || "").toLowerCase();
    let s = 0;
    for (const w of ws) { if (title.includes(w)) s += 3; else if (all.includes(w)) s += 1; }
    if (s) scored.push([s, e]);
  }
  scored.sort((a, b) => b[0] - a[0]);
  return scored.slice(0, n || 8).map(([, e]) => ({ title: e.t, about: e.d || "", type: e.k, url: full(e.u) }));
}

async function employerJobs(env, url, ctx) {
  try {
    const u = new URL(url); u.pathname = "/api/jobpost"; u.search = "";
    const r = await jobPostApi(new Request(u), env, u, ctx);
    const j = await r.json();
    return (j.jobs || []).map((x) => ({
      title: x.title, company: x.company, country: x.country, city: x.city || "", workplace: x.workplace, type: x.type,
      salary: x.salary || "", url: SITE + "job-post-" + x.id + ".html",
    }));
  } catch (e) { return []; }
}

// ---------- Lilo ----------

const PAGES = [
  ["Search Jobs (live jobs by country)", "jobs.html"],
  ["Remote Jobs", "remote-jobs.html"],
  ["Jobs posted directly by employers", "direct-from-employers.html"],
  ["Visa sponsorship jobs", "visa-sponsorship-jobs.html"],
  ["UK visa sponsor companies", "uk-visa-sponsors.html"],
  ["Canada LMIA employers", "canada-lmia-employers.html"],
  ["Walk-in interviews", "walk-in-interviews.html"],
  ["Job fairs and hiring events", "events.html"],
  ["Job sites by country", "job-sites.html"],
  ["Free CV templates", "cv-templates.html"],
  ["CV Builder", "cv-builder.html"],
  ["CV Match (compare your CV with open jobs)", "cv-match.html"],
  ["CV Tools", "cv-tools.html"],
  ["Career Boost (tools and offers for job seekers)", "career-boost.html"],
  ["Get paid to train AI", "get-paid-to-train-ai.html"],
  ["Open to Work (add your profile so employers can find you)", "open-to-work.html"],
  ["Post a Job for free (employers)", "post-a-job.html"],
  ["Hiring Partners (tools and offers for companies)", "partners.html"],
  ["Contact", "contact.html"],
];

function systemPrompt(d, found, jobs) {
  const line = (o) => `- ${o.name} (${o.what}): ${o.offer}${o.details ? ". " + o.details : ""}. Link: ${o.link}`;
  return [
    "You are Lilo, the assistant on U Hirable (uhirable.com), a free hiring hub: jobs, visa sponsorship lists, CV tools, job fairs, and free job posting for employers.",
    "Talk like a warm, sharp human recruiter friend: short, natural sentences, no corporate tone, no bullet walls. Two to five sentences is usually enough. Ask one short follow-up question when it helps (their country, field, or experience).",
    "Always reply in the language the visitor writes in. For Arabic, write in friendly Egyptian Arabic.",
    "If asked whether you are a human, say plainly that you are Lilo, U Hirable's AI assistant.",
    "Only state facts found below. If you do not know something, say so and point to the closest page. Never invent jobs, companies, salaries, dates, visa rules or links.",
    "Only use links that appear below, written as markdown [text](url). Never write any other link.",
    "U Hirable is not a recruitment agency: it does not screen candidates, guarantee jobs or handle applications. Never tell anyone to pay to apply for a job.",
    "Do not mention commissions, referrals or affiliates. Do not ask for a CV to be sent to you, passwords, ID numbers or payment details.",
    "",
    "MAIN PAGES:",
    ...PAGES.map(([t, u]) => `- ${t}: ${SITE}${u}`),
    `- WhatsApp channel: ${WHATSAPP}`,
    "",
    "OFFERS FOR JOB SEEKERS (suggest one only when it fits what they asked):",
    ...d.seekers.map(line),
    "",
    "OFFERS FOR COMPANIES (for employers, HR and founders):",
    ...d.companies.map(line),
    "",
    jobs.length ? "JOBS POSTED DIRECTLY BY EMPLOYERS RIGHT NOW:" : "",
    ...jobs.slice(0, 12).map((j) => `- ${j.title} at ${j.company}, ${j.workplace}, ${[j.city, j.country].filter(Boolean).join(", ")}: ${j.url}`),
    "",
    found.length ? "PAGES AND JOBS ON THE SITE THAT MATCH THE VISITOR'S LAST MESSAGE:" : "",
    ...found.map((f) => `- [${f.type}] ${f.title}${f.about ? " (" + f.about + ")" : ""}: ${f.url}`),
  ].filter((x) => x !== undefined).join("\n");
}

// Keeps only the links Lilo was given; any other address is removed from the answer.
function keepKnownLinks(text, allowed) {
  const ok = (u) => allowed.has(u.replace(/[).,;!?]+$/, ""));
  let out = text.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, (m, t, u) => (ok(u) ? m : t));
  out = out.replace(/(^|[\s(])(https?:\/\/[^\s)<]+)/g, (m, pre, u) => (ok(u) ? m : pre));
  return out;
}

const hits = new Map(); // a light per-visitor limit, per running copy of the Worker
function tooMany(ip) {
  const now = Date.now(), win = 10 * 60 * 1000;
  const list = (hits.get(ip) || []).filter((t) => now - t < win);
  list.push(now); hits.set(ip, list);
  if (hits.size > 5000) hits.clear();
  return list.length > 25;
}

export async function liloApi(request, env, url, ctx) {
  if (request.method !== "POST") return json({ error: "Not found." }, 404);
  const origin = request.headers.get("origin");
  if (origin) { try { if (new URL(origin).host !== url.host) return json({ error: "Not allowed." }, 403); } catch (e) { return json({ error: "Not allowed." }, 403); } }
  if (!env.AI) return json({ error: "unavailable" }, 503);
  if (tooMany(request.headers.get("cf-connecting-ip") || "x")) return json({ error: "busy" }, 429);

  let body; try { body = await request.json(); } catch (e) { return json({ error: "Bad request." }, 400); }
  const msgs = (Array.isArray(body && body.messages) ? body.messages : [])
    .filter((m) => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string" && m.content.trim())
    .slice(-8).map((m) => ({ role: m.role, content: m.content.slice(0, 1200) }));
  const last = msgs[msgs.length - 1];
  if (!last || last.role !== "user") return json({ error: "Bad request." }, 400);

  const d = await data(env, url);
  const found = search(d.index, last.content, null, 8);
  const jobs = await employerJobs(env, url, ctx);
  const allowed = new Set([WHATSAPP, SITE, SITE.slice(0, -1), ...PAGES.map(([, u]) => SITE + u),
    ...d.seekers.map((o) => o.link), ...d.companies.map((o) => o.link), ...found.map((f) => f.url), ...jobs.map((j) => j.url)]);
  const messages = [{ role: "system", content: systemPrompt(d, found, jobs) }, ...msgs];

  for (const model of MODELS) {
    try {
      const out = await env.AI.run(model, { messages, max_tokens: 420, temperature: 0.6 });
      let text = "";
      if (typeof out === "string") text = out;
      else if (out && typeof out.response === "string") text = out.response;
      else if (out && out.choices && out.choices[0]) text = (out.choices[0].message && out.choices[0].message.content) || out.choices[0].text || "";
      text = String(text || "").replace(/<think>[\s\S]*?<\/think>/g, "").trim();
      if (text) return json({ reply: keepKnownLinks(text, allowed).slice(0, 2500) }, 200, { "cache-control": "no-store" });
    } catch (e) { /* try the next model */ }
  }
  return json({ error: "unavailable" }, 503);
}

// ---------- the connector (MCP) ----------

const TOOLS = [
  {
    name: "search_uhirable",
    title: "Search U Hirable",
    description: "Search U Hirable (uhirable.com) for open jobs, visa sponsorship employer lists, career guides, CV tools, job sites and hiring events. Returns titles, short descriptions and links.",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "What to look for, e.g. 'care jobs UK visa sponsorship' or 'remote sales'." },
        type: { type: "string", enum: ["Job", "Page", "Job Site", "Event", "CV Tool"], description: "Optional: only this kind of result." },
      },
      required: ["query"],
    },
    annotations: { readOnlyHint: true, openWorldHint: false },
  },
  {
    name: "list_job_fairs",
    title: "Job fairs and hiring events",
    description: "Lists hiring events and job fairs listed on U Hirable, optionally for one country or city (e.g. 'UK', 'Canada', 'Manchester').",
    inputSchema: { type: "object", properties: { place: { type: "string", description: "Optional country or city." } } },
    annotations: { readOnlyHint: true, openWorldHint: false },
  },
  {
    name: "list_employer_jobs",
    title: "Jobs posted directly by employers",
    description: "Lists the jobs employers posted directly on U Hirable. Each has its own page where the candidate applies straight to the employer.",
    inputSchema: { type: "object", properties: { country: { type: "string", description: "Optional country to filter by." } } },
    annotations: { readOnlyHint: true, openWorldHint: false },
  },
  {
    name: "list_offers",
    title: "Tools and offers",
    description: "Lists the tools with offers on U Hirable: for job seekers (CV, LinkedIn and job search tools) or for companies (hiring, payroll and HR tools).",
    inputSchema: {
      type: "object",
      properties: { audience: { type: "string", enum: ["job_seekers", "companies"], description: "Who the offers are for." } },
      required: ["audience"],
    },
    annotations: { readOnlyHint: true, openWorldHint: false },
  },
];

async function callTool(name, args, env, url, ctx) {
  const d = await data(env, url);
  const a = args || {};
  if (name === "search_uhirable") {
    const r = search(d.index, a.query, a.type ? [a.type] : null, 10);
    return r.length ? r : { message: "Nothing matched. Browse all jobs at " + SITE + "jobs.html" };
  }
  if (name === "list_job_fairs") {
    const p = String(a.place || "").toLowerCase().trim();
    const ev = d.index.filter((e) => e.k === "Event" && (!p || ((e.t || "") + " " + (e.d || "")).toLowerCase().includes(p)))
      .slice(0, 40).map((e) => ({ name: e.t, details: e.d || "", url: full(e.u) }));
    return ev.length ? { events: ev, all: SITE + "events.html" } : { message: "No events listed for that place.", all: SITE + "events.html" };
  }
  if (name === "list_employer_jobs") {
    const c = String(a.country || "").toLowerCase().trim();
    const jobs = (await employerJobs(env, url, ctx)).filter((j) => !c || (j.country || "").toLowerCase().includes(c));
    return { jobs, all: SITE + "direct-from-employers.html", note: "Posted by employers. U Hirable is not a recruitment agency and does not handle applications. Never pay a fee to apply." };
  }
  if (name === "list_offers") {
    return a.audience === "companies"
      ? { offers: d.companies, all: SITE + "partners.html" }
      : { offers: d.seekers, all: SITE + "career-boost.html" };
  }
  return null;
}

const CORS = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "POST, GET, OPTIONS",
  "access-control-allow-headers": "content-type, accept, authorization, mcp-protocol-version, mcp-session-id",
};

async function rpc(m, env, url, ctx) {
  const ok = (result) => ({ jsonrpc: "2.0", id: m.id, result });
  const err = (code, message) => ({ jsonrpc: "2.0", id: m.id === undefined ? null : m.id, error: { code, message } });
  if (!m || m.jsonrpc !== "2.0" || typeof m.method !== "string") return err(-32600, "Invalid request");
  if (m.id === undefined) return null; // a notification: nothing to answer
  switch (m.method) {
    case "initialize":
      return ok({
        protocolVersion: (m.params && typeof m.params.protocolVersion === "string" && m.params.protocolVersion) || "2025-06-18",
        capabilities: { tools: {} },
        serverInfo: { name: "U Hirable", title: "U Hirable", version: "1.0.0" },
        instructions: "Read-only access to U Hirable (uhirable.com): open jobs, jobs posted directly by employers, visa sponsorship lists, job fairs, CV tools and offers. Always give the user the link of each result.",
      });
    case "ping": return ok({});
    case "tools/list": return ok({ tools: TOOLS });
    case "tools/call": {
      const p = m.params || {};
      if (!TOOLS.some((t) => t.name === p.name)) return err(-32602, "Unknown tool");
      try {
        const res = await callTool(p.name, p.arguments, env, url, ctx);
        return ok({ content: [{ type: "text", text: JSON.stringify(res, null, 1) }] });
      } catch (e) {
        return ok({ content: [{ type: "text", text: "U Hirable could not answer right now. Please try again." }], isError: true });
      }
    }
    case "resources/list": return ok({ resources: [] });
    case "prompts/list": return ok({ prompts: [] });
    default: return err(-32601, "Method not found");
  }
}

export async function mcpApi(request, env, url, ctx) {
  if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: CORS });
  if (request.method !== "POST") {
    return new Response("U Hirable connector (MCP). Add this address as a custom connector in your AI app: " + SITE + "mcp", {
      status: request.method === "GET" ? 405 : 405, headers: { ...CORS, allow: "POST, OPTIONS", "content-type": "text/plain; charset=utf-8" } });
  }
  let body; try { body = await request.json(); } catch (e) {
    return json({ jsonrpc: "2.0", id: null, error: { code: -32700, message: "Parse error" } }, 400, CORS);
  }
  if (Array.isArray(body)) {
    const out = (await Promise.all(body.slice(0, 20).map((m) => rpc(m, env, url, ctx)))).filter(Boolean);
    return out.length ? json(out, 200, CORS) : new Response(null, { status: 202, headers: CORS });
  }
  const out = await rpc(body, env, url, ctx);
  return out ? json(out, 200, CORS) : new Response(null, { status: 202, headers: CORS });
}
