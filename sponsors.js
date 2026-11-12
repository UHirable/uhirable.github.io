// Search over the official sponsor lists. Data lives in data/uk, data/ca and data/us and is rebuilt
// every month from GOV.UK, Open Canada and the US Department of Labor by .github/workflows/sponsor-data.yml.
(function () {
  var app = document.getElementById("sp-app");
  if (!app) return;
  var SET = app.getAttribute("data-set"), BASE = "data/" + SET + "/";
  var $ = function (id) { return document.getElementById(id); };
  var box = $("sp-q"), by = $("sp-by"), filter = $("sp-f"), list = $("sp-list"), status = $("sp-status"), more = $("sp-more"), chips = $("sp-chips");
  var esc = function (s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); };
  var count = function (path, title) { try { if (window.goatcounter && goatcounter.count) goatcounter.count({ path: path, title: title, event: true }); } catch (e) {} };
  var cur = [], cache = {}, meta = null, results = [], shown = 0, PAGE = 30, counted = false, seq = 0;
  var MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  var niceDate = function (iso) { var p = (iso || "").split("-"); return p.length === 3 ? (+p[2]) + " " + MONTHS[+p[1] - 1] + " " + p[0] : iso; };
  var niceQ = function (q) { var m = /^(\d{4})Q(\d)$/.exec(q || ""); return m ? ["January to March", "April to June", "July to September", "October to December"][m[2] - 1] + " " + m[1] : q; };
  var num = function (n) { return Number(n).toLocaleString("en-GB"); };
  var shard = function (ch) { return ch >= "a" && ch <= "z" ? ch : "0"; };
  var load = function (file) {
    if (!cache[file]) cache[file] = fetch(BASE + file).then(function (r) { if (!r.ok) throw new Error(r.status); return r.text(); }).then(function (t) {
      return t.split("\n").filter(Boolean).map(function (l) { var f = l.split("\t"); f.push((f[0] + " " + f[1]).toLowerCase()); return f; });
    }).catch(function (e) { delete cache[file]; if (String(e.message) === "404") return []; throw e; });
    return cache[file];
  };
  var jobsLink = function (country, q) { return "jobs.html?country=" + encodeURIComponent(country) + "&q=" + encodeURIComponent(q); };
  var shortName = function (n) { return n.replace(/\b(ltd|limited|plc|llp|inc|incorporated|corp|corporation|t\/a.*)\.?$/i, "").replace(/[.,\s]+$/, "").trim() || n; };

  var cardUK = function (f) {
    var routes = f[3] ? f[3].split(",").map(function (i) { return meta.routes[+i]; }) : [];
    var tags = routes.slice(0, 3).map(function (r) { return '<span class="chip">' + esc(r) + "</span>"; }).join("") + (routes.length > 3 ? '<span class="chip">+' + (routes.length - 3) + " more</span>" : "");
    var grade = f[2] === "B" ? '<span class="chip sp-b" title="On a Home Office action plan">B rating</span>' : f[2] === "P" ? '<span class="chip sp-b">Provisional</span>' : '<span class="chip gold">A rating</span>';
    return '<article class="sp-card"><h3>' + esc(f[0]) + '</h3><p class="sp-where">' + (f[1] ? "📍 " + esc(f[1]) : "Location not listed") + '</p><p class="sp-tags">' + grade + tags +
      '</p><a class="sp-jobs" data-sp="jobs" href="' + jobsLink("United Kingdom", shortName(f[0])) + '">Search live UK jobs →</a></article>';
  };
  var cardCA = function (f) {
    var occ = f[4] ? f[4].split("; ") : [];
    return '<article class="sp-card"><h3>' + esc(f[0]) + '</h3><p class="sp-where">📍 ' + esc(f[1] || "Location not listed") + (f[2] ? ", " + esc(f[2]) : "") + '</p><p class="sp-tags"><span class="chip gold">' + num(f[3]) + (f[3] === "1" ? " position" : " positions") + " approved</span></p>" +
      (occ.length ? '<p class="sp-occ">' + occ.map(esc).join(" · ") + "</p>" : "") + '<p class="sp-last">Latest approval: ' + esc(niceQ(f[5])) + '</p><a class="sp-jobs" data-sp="jobs" href="' + jobsLink("Canada", occ.length ? shortOcc(occ.filter(function (o) { return cur.length && cur.some(function (t) { return o.toLowerCase().indexOf(t) >= 0; }); })[0] || occ[0]) : shortName(f[0])) + '">Search live jobs in Canada →</a></article>';
  };
  var cardUS = function (f) {
    var occ = f[4] ? f[4].split("; ") : [], ws = f[6] ? f[6].split(",") : [];
    return '<article class="sp-card"><h3>' + esc(f[0]) + '</h3><p class="sp-where">' + (f[1] ? "📍 " + esc(f[1]) + ", " + esc(f[2]) : "Head office not listed") + '</p><p class="sp-tags"><span class="chip gold">' + num(f[3]) + (f[3] === "1" ? " application" : " applications") + " certified</span>" +
      (f[5] ? '<span class="chip">Median $' + num(f[5]) + "</span>" : "") + "</p>" + (occ.length ? '<p class="sp-occ">' + occ.map(esc).join(" · ") + "</p>" : "") +
      (ws.length ? '<p class="sp-last">Works in: ' + ws.map(function (s) { return esc((meta.state_names || {})[s] || s); }).join(", ") + "</p>" : "") +
      '<a class="sp-jobs" data-sp="jobs" href="' + jobsLink("United States", shortName(f[0])) + '">Search live US jobs →</a></article>';
  };
  var card = SET === "uk" ? cardUK : SET === "us" ? cardUS : cardCA;

  var render = function (reset) {
    if (reset) { shown = 0; list.innerHTML = ""; }
    var next = results.slice(shown, shown + PAGE);
    list.insertAdjacentHTML("beforeend", next.map(card).join(""));
    shown += next.length;
    more.hidden = shown >= results.length;
  };
  var say = function (t) { status.textContent = t; };

  var HINT = SET === "us" ? "The 30 employers with the most certified H-1B applications. Type a company name to search all of them." : SET === "uk" ? "30 London employers licensed for several visa routes, A to Z. Type a company name or a town to search all of them." : "The 30 employers with the most approved positions. Type a job, a city or an employer to search all of them.";
  var showTop = function () {
    var me = ++seq; cur = [];
    load("top.txt").then(function (rows) { if (me !== seq) return; results = rows; render(true); say(HINT); }).catch(function () { if (me === seq) say("Type at least 2 letters to search the official list."); });
  };
  var shortOcc = function (o) { return o.split(/,| in | except|\(| n\.e\.c/)[0].replace(/^Other /, "").trim(); };

  var search = function () {
    var q = box.value.toLowerCase().replace(/\s+/g, " ").trim(), mode = by ? by.value : "any", f = filter ? filter.value : "", me = ++seq;
    if (q.length < 2) { showTop(); return; }
    var tokens = q.split(" "), first = (/[a-z0-9]/.exec(q) || ["0"])[0];
    var file = SET === "ca" ? "all.txt" : (mode === "city" ? "c-" : "n-") + shard(first) + ".txt";
    cur = tokens;
    say("Searching the official list…");
    load(file).then(function (rows) {
      if (me !== seq) return;
      var out = rows.filter(function (r) {
        if (SET === "uk") {
          if (f !== "" && ("," + r[3] + ",").indexOf("," + f + ",") < 0) return false;
          var hay = mode === "city" ? r[1].toLowerCase() : r[0].toLowerCase();
          return mode === "city" ? hay.indexOf(q) === 0 : tokens.every(function (t) { return hay.indexOf(t) >= 0; });
        }
        if (f && r[2] !== f) return false;
        if (SET === "us") { var nm = r[0].toLowerCase(); return tokens.every(function (t) { return nm.indexOf(t) >= 0; }); }
        var h = (r[0] + " " + r[1] + " " + r[4]).toLowerCase();
        return tokens.every(function (t) { return h.indexOf(t) >= 0; });
      });
      var rank = function (r) { var n = r[0].toLowerCase(); return n.indexOf(q) === 0 ? 0 : n.indexOf(" " + q) >= 0 ? 1 : 2; };
      var tier = function (r) { var has = function (s) { s = s.toLowerCase(); return tokens.every(function (t) { return s.indexOf(t) >= 0; }); }; return has(r[4]) ? 0 : has(r[0]) ? 1 : 2; };
      if (SET === "ca") out.sort(function (a, b) { return tier(a) - tier(b) || b[3] - a[3] || (a[0] < b[0] ? -1 : 1); });
      else if (SET === "us") out.sort(function (a, b) { return rank(a) - rank(b) || b[3] - a[3]; });
      else if (mode !== "city") out.sort(function (a, b) { return rank(a) - rank(b) || (a[0] < b[0] ? -1 : 1); });
      results = out; render(true);
      say(out.length ? num(out.length) + (out.length === 1 ? " match" : " matches") + ' for "' + box.value.trim() + '"' + (SET === "uk" ? " on the register dated " + niceDate(meta.updated) + "." : SET === "us" ? " in the Department of Labor data." : " in the official list.")
        : 'No match for "' + box.value.trim() + '". Check the spelling, try one word of the name, or ' + (SET === "uk" && mode !== "city" ? "search by town instead." : "try a shorter search."));
      if (!counted) { counted = true; count("sponsor-search/" + SET, "Sponsor list search: " + SET); }
    }).catch(function () { if (me === seq) say("The list could not be loaded. Check your connection and try again."); });
  };

  var timer;
  var go = function () { clearTimeout(timer); timer = setTimeout(search, 220); };
  fetch(BASE + "meta.json").then(function (r) { return r.json(); }).then(function (m) {
    meta = m;
    var fill = function (cls, text) { [].forEach.call(document.querySelectorAll("." + cls), function (e) { e.textContent = text; }); };
    if (SET === "uk") {
      fill("sp-count", num(m.orgs)); fill("sp-date", niceDate(m.updated));
      filter.insertAdjacentHTML("beforeend", m.routes.map(function (r, i) { return '<option value="' + i + '">' + esc(r) + "</option>"; }).join(""));
      chips.innerHTML = m.top_cities.slice(0, 8).map(function (c) { return '<button type="button" class="sp-chip" data-city="' + esc(c) + '">' + esc(c) + "</button>"; }).join("");
    } else if (SET === "us") {
      fill("sp-count", num(m.employers));
    } else {
      fill("sp-count", num(m.employers)); fill("sp-pos", num(m.positions)); fill("sp-date", niceDate(m.published));
      fill("sp-range", niceQ(m.quarters[0]).replace(/^(\w+) to \w+ /, "$1 ") + " to " + niceQ(m.quarters[m.quarters.length - 1]).replace(/^\w+ to /, ""));
    }
    box.disabled = false; box.addEventListener("input", go);
    if (by) by.addEventListener("change", function () { box.placeholder = by.value === "city" ? "e.g. Manchester" : "e.g. Tesco, NHS, university"; go(); });
    if (filter) filter.addEventListener("change", go);
    var pre = new URLSearchParams(location.search).get("q");
    if (pre) { box.value = pre; search(); } else showTop();
  }).catch(function () { say("The list could not be loaded. Check your connection and reload the page."); });

  more.addEventListener("click", function () { render(false); });
  if (chips) chips.addEventListener("click", function (e) { var b = e.target.closest("[data-city]"); if (!b) return; by.value = "city"; box.placeholder = "e.g. Manchester"; box.value = b.getAttribute("data-city"); search(); box.scrollIntoView({ block: "center", behavior: "smooth" }); });
  list.addEventListener("click", function (e) { if (e.target.closest('[data-sp="jobs"]')) count("sponsor-jobs/" + SET, "Sponsor list: live jobs click " + SET); });
})();
