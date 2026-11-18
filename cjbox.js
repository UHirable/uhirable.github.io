// Careerjet job box (paid per click) at the end of guide pages that fix a country. Switched on for Canada and the UK.
// Loaded by cvjobs.js. Reads the same data-cc / data-q / data-l as <section id="cv-jobs">, so each page asks for its own job and place.
// The jobs sit inside Careerjet's own frame and are drawn by Careerjet's own script; this file only builds the heading and the frame around them.
(() => {
  const host = document.getElementById("cv-jobs"); if (!host || document.getElementById("cj-jobs")) return;
  const D = host.dataset;
  // Countries switched on. name = what the heading says, where = the whole country in Careerjet's location search,
  // place = how a city or region of that country has to be written so Careerjet does not pick a namesake abroad
  // ("Birmingham" alone gives Birmingham, Alabama; "Ontario, Canada" finds nothing, "Ontario, ON" is the province).
  const COUNTRY = {
    ca: { name: "Canada", where: "Canada", place: (l) => (l === "Ontario" ? "Ontario, ON" : l + ", Canada") },
    uk: { name: "the UK", where: "United Kingdom", place: (l) => l + ", UK" },
  };
  const C = COUNTRY[D.cc]; if (!C) return;
  const BOX = "https://widget.careerjet.net/job-box/9be6c12d3940297b6d0bddce6e0c7394";
  const LOADER = "https://static.careerjet.org/js/all_widget_job_box_3rd_party.min.js";
  const FRAME_ORIGIN = "https://widget.careerjet.net";
  const q = (D.q || "").trim(), L = (D.l || "").trim();

  // Searches to try, in order: the page's own job and place first, then wider ones, so the box is never left empty.
  // Each one is [keywords, Careerjet location, place name for the heading].
  const tries = [];
  if (q && L) tries.push([q, C.place(L), L]);
  if (q) tries.push([q, C.where, C.name]);
  if (!q && L) tries.push(["", C.place(L), L]);
  tries.push(["", C.where, C.name]);

  const sec = document.createElement("section");
  sec.id = "cj-jobs"; sec.className = "cvj"; sec.setAttribute("aria-label", "More jobs from Careerjet");
  sec.innerHTML = '<div class="cvj-head"><span class="eyebrow"><span class="dot"></span> More openings · Careerjet</span><h2></h2><p>Listed by Careerjet. Every job opens the original advert.</p></div>' +
    '<div class="cj-frame" style="background:#fff;border-radius:16px;border:1.5px solid #dfe4ff;padding:4px 8px;overflow:hidden;min-height:140px"></div>';
  host.parentElement.appendChild(sec); // last thing in the article, so it never pushes the page's own content down
  const title = sec.querySelector("h2"), frame = sec.querySelector(".cj-frame");

  let n = 0;
  const show = () => {
    const [kw, where, place] = tries[n];
    title.textContent = "More " + (kw ? kw.replace(/\bit\b/g, "IT") + " " : "") + "jobs in " + place;
    // Careerjet's embed code: a div with the search in data- attributes, then their loader script, which puts the frame in it.
    frame.innerHTML = "";
    const box = document.createElement("div");
    box.className = "cj-job-box"; box.dataset.url = BOX; box.dataset.search = kw; box.dataset.location = where;
    frame.appendChild(box);
    const old = document.getElementById("cj-job-box"); if (old) old.remove();
    const js = document.createElement("script"); js.id = "cj-job-box"; js.async = true; js.src = LOADER + "?t=" + Date.now();
    document.body.appendChild(js);
  };

  // Careerjet's frame tells the page how tall it is ({h, i}); with no jobs it is about 144px. Then ask the next, wider search.
  addEventListener("message", (e) => {
    if (e.origin !== FRAME_ORIGIN) return;
    const f = frame.querySelector("iframe"); if (!f || e.source !== f.contentWindow) return;
    let d = e.data; if (typeof d === "string") { try { d = JSON.parse(d); } catch (x) { return; } }
    if (!d || typeof d.h !== "number") return;
    if (d.h < 200 && n < tries.length - 1) { n++; show(); }
  });

  // Load only when the box is close to the screen, so visitors who never scroll that far are not counted as views.
  let started = false;
  const start = () => {
    if (started) return; started = true; show();
    try { if (window.goatcounter && goatcounter.count) goatcounter.count({ path: "cj-box/" + D.cc, title: "Careerjet box shown " + D.cc, event: true }); } catch (e) {}
  };
  if ("IntersectionObserver" in window) { const io = new IntersectionObserver((en) => { if (en.some((x) => x.isIntersecting)) { io.disconnect(); start(); } }, { rootMargin: "600px 0px" }); io.observe(sec); } else start();
})();
