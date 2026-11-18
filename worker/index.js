// U Hirable: handles only the addresses that match no file.
// Every real file (all .html pages, CSS, JS, images, data) is served by Cloudflare directly and never reaches this script.
//
// What it does:
//   /                    -> the home page (index.html)
//   /cv-match, /jobs/    -> permanent redirect to /cv-match.html, /jobs.html when that page exists
//   anything else        -> the site's 404 page, with a real 404 status

// Same address as the request, with another path and no query string.
function at(url, path) {
  const u = new URL(url);
  u.pathname = path;
  u.search = "";
  return u;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    if (path === "/") {
      return env.ASSETS.fetch(new Request(at(url, "/index.html"), request));
    }

    // Addresses typed without ".html" (GitHub Pages used to accept them).
    const bare = path.replace(/\/+$/, "");
    if (bare && !/\.[A-Za-z0-9]+$/.test(bare)) {
      const target = at(url, bare + ".html");
      const found = await env.ASSETS.fetch(new Request(target));
      if (found.status === 200) {
        if (found.body) await found.body.cancel();
        target.search = url.search;
        return Response.redirect(target.toString(), 301);
      }
    }

    const page = await env.ASSETS.fetch(new Request(at(url, "/404.html")));
    if (page.status !== 200) return new Response("Not found", { status: 404 });
    return new Response(request.method === "HEAD" ? null : page.body, { status: 404, headers: page.headers });
  },
};
