// U Hirable: handles only the addresses that match no file.
// Every real file (all .html pages, CSS, JS, images, data) is served by Cloudflare directly and never reaches this script.
//
// What it does:
//   /                        -> the home page (index.html)
//   /jobs/remote-jobs.html   -> permanent redirect to /remote-jobs.html (old links from uhirable.github.io/jobs/...)
//   /jobs/                   -> permanent redirect to the home page (it was the old site's home)
//   /cv-match, /jobs         -> permanent redirect to /cv-match.html, /jobs.html when that page exists
//   anything else            -> the site's 404 page, with a real 404 status

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

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    if (path === "/") {
      return env.ASSETS.fetch(new Request(at(url, "/index.html"), request));
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
