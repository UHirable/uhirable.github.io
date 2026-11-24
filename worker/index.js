// U Hirable: handles the addresses that match no file, plus the Open to Work page.
// Every other real file (all .html pages, CSS, JS, images, data) is served by Cloudflare directly and never reaches this script.
//
// What it does:
//   /                        -> the home page (index.html)
//   /jobs/remote-jobs.html   -> permanent redirect to /remote-jobs.html (old links from uhirable.github.io/jobs/...)
//   /jobs/                   -> permanent redirect to the home page (it was the old site's home)
//   /cv-match, /jobs         -> permanent redirect to /cv-match.html, /jobs.html when that page exists
//   /api/talent...           -> the Open to Work profiles (worker/talent.js)
//   /open-to-work.html       -> the page, with the approved profile cards written into it
//   /api/jobpost...          -> free job posts sent by employers (worker/jobpost.js)
//   /job-post-<id>.html      -> an approved job post's own page; /sitemap-jobs.xml lists them
//   removed list pages       -> permanent redirect to the nearest page that still exists (see removedPage)
//   anything else            -> the site's 404 page, with a real 404 status

import { talentApi, talentPage } from "./talent.js";
import { applyApi } from "./apply.js";
import { jobPostApi, jobPostPage, jobPostSitemap } from "./jobpost.js";

// Same address as the request, with another path and no query string.
function at(url, path) {
  const u = new URL(url);
  u.pathname = path;
  u.search = "";
  return u;
}

// True when the site has a file at this path.
async function exists(env, url, path) {
  const found = await env.ASSETS.fetch(new Request(at(url, path)));
  if (found.body) await found.body.cancel();
  return found.status === 200;
}

// Permanent redirect to another path on the site. The query string is kept.
function moved(url, path) {
  const target = at(url, path);
  target.search = url.search;
  return Response.redirect(target.toString(), 301);
}

// A path that ends in a file extension, such as ".html" or ".xml".
const hasExtension = (path) => /\.[A-Za-z0-9]+$/.test(path);

// Removed pages: returns the pages to try instead, best first, or null when the path is not one of them.
const UK_HUB = "/uk-visa-sponsors.html";
const UK_CARE = "/care-homes-with-visa-sponsorship-uk.html";
const UK_REMOVED = new Set(["care-homes", "nhs-hospitals", "universities", "schools-colleges", "technology", "hotels", "restaurants",
  "pharmacies", "dental-practices", "law-firms", "accountants", "engineering", "construction", "sports-clubs"]);
function removedPage(path) {
  // "Hire Talent" became the free "Post a Job" page.
  if (path === "/employer.html") return ["/post-a-job.html"];
  // Care home pages (the main one and one per city) go to the guide that answers the same search.
  if (/^\/uk-visa-sponsors-care-homes(-[a-z0-9-]+)?\.html$/.test(path)) return [UK_CARE, UK_HUB];
  let m = path.match(/^\/uk-visa-sponsors-([a-z0-9-]+)\.html$/);
  if (m && UK_REMOVED.has(m[1])) return [UK_HUB];
  if (/^\/netherlands-recognised-sponsors-[a-z0-9-]+\.html$/.test(path)) return ["/netherlands-recognised-sponsors.html"];
  if (/^\/ireland-work-permit-companies-[a-z0-9-]+\.html$/.test(path)) return ["/ireland-work-permit-companies.html"];
  if (/^\/denmark-fast-track-companies-[a-z0-9-]+\.html$/.test(path)) return ["/denmark-fast-track-certified-companies.html"];
  return null;
}

// Share previews for the Events page when it is opened for one country.
const EVENT_SHARE = {
  canada: { q: "Canada", img: "og-events-canada.png", title: "Free Job Fairs in Canada | U Hirable", desc: "Free job fairs across Canada, with dates, venues and live jobs in the same city." },
  uk: { q: "UK", img: "og-events-uk.png", title: "Free Careers Fairs in the UK | U Hirable", desc: "Free careers fairs across the UK, with dates, venues and live jobs in the same city." },
};

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    if (path === "/") {
      return env.ASSETS.fetch(new Request(at(url, "/index.html"), request));
    }

    // The Open to Work page is the one real file that passes through here (see run_worker_first in wrangler.jsonc):
    // the approved profile cards are written into it so search engines can read them.
    if (path === "/open-to-work.html") return talentPage(request, env);

    // The Events page opened with a country (events.html?country=Canada): same page, with that country's share image and title,
    // so a link shared on LinkedIn or WhatsApp shows the job fairs design for that country.
    if (path === "/events.html") {
      const page = await env.ASSETS.fetch(request);
      const share = EVENT_SHARE[(url.searchParams.get("country") || "").toLowerCase()];
      if (!share || page.status !== 200) return page;
      try {
        const set = (v) => ({ element(e) { e.setAttribute("content", v); } });
        return new HTMLRewriter()
          .on('meta[property="og:image"]', set("https://uhirable.com/" + share.img))
          .on('meta[property="og:url"]', set("https://uhirable.com/events.html?country=" + share.q))
          .on('meta[property="og:title"]', set(share.title))
          .on('meta[property="og:description"]', set(share.desc))
          .transform(page);
      } catch (e) { return page; }
    }

    if (path === "/api/apply" || path.startsWith("/api/apply/")) {
      try { return await applyApi(request, env, url, ctx); }
      catch (e) { return new Response(JSON.stringify({ error: "Something went wrong. Please try again." }), { status: 500, headers: { "content-type": "application/json" } }); }
    }

    if (path === "/api/jobpost" || path.startsWith("/api/jobpost/")) {
      try { return await jobPostApi(request, env, url, ctx); }
      catch (e) { return new Response(JSON.stringify({ error: "Something went wrong. Please try again." }), { status: 500, headers: { "content-type": "application/json" } }); }
    }
    if (path === "/sitemap-jobs.xml") return jobPostSitemap(env);
    // An approved job post's page. A job that is not live (never approved, taken down, or older than 30 days) falls through to the 404 page.
    const posted = path.match(/^\/job-post-([a-z0-9-]{3,90})\.html$/);
    if (posted) {
      const page = await jobPostPage(request, env, url, posted[1]).catch(() => null);
      if (page) return page;
    }

    if (path === "/api/talent" || path.startsWith("/api/talent/")) {
      try { return await talentApi(request, env, url, ctx); }
      catch (e) { return new Response(JSON.stringify({ error: "Something went wrong. Please try again." }), { status: 500, headers: { "content-type": "application/json" } }); }
    }

    // Old links from when the whole site lived under /jobs/ (uhirable.github.io/jobs/...):
    // the same page now sits one level up.
    if (path.startsWith("/jobs/")) {
      const rest = "/" + path.slice("/jobs/".length).replace(/^\/+/, "");
      if (rest === "/" || rest === "/index.html") return moved(url, "/");
      if (await exists(env, url, rest)) return moved(url, rest);
      const short = rest.replace(/\/+$/, "");
      if (short && !hasExtension(short) && (await exists(env, url, short + ".html"))) {
        return moved(url, short + ".html");
      }
    }

    // Pages that were removed in November 2026 (lists grouped by words in company names, which is not
    // an official classification). Old links go to the nearest page that is still there.
    const gone = removedPage(path);
    if (gone) {
      for (const target of gone) {
        if (await exists(env, url, target)) return moved(url, target);
      }
    }

    // Addresses typed without ".html" (GitHub Pages used to accept them).
    const bare = path.replace(/\/+$/, "");
    if (bare && !hasExtension(bare) && (await exists(env, url, bare + ".html"))) {
      return moved(url, bare + ".html");
    }

    const page = await env.ASSETS.fetch(new Request(at(url, "/404.html")));
    if (page.status !== 200) return new Response("Not found", { status: 404 });
    return new Response(request.method === "HEAD" ? null : page.body, { status: 404, headers: page.headers });
  },
};
