// Rotating globe with a gold dot per covered country. Land data: land.json (Natural Earth, public domain).
(() => {
  const cv = document.getElementById("globe"); if (!cv || !window.UHGeo) return;
  const DOTS = window.UH_COUNTRIES || [["United States", -98, 39], ["United Arab Emirates", 54.4, 24.2], ["Saudi Arabia", 45, 24.5], ["Qatar", 51.2, 25.3], ["Kuwait", 47.6, 29.3], ["Bahrain", 50.5, 26.1], ["Egypt", 30.5, 27]];
  const n = document.getElementById("globe-n"); if (n) n.textContent = DOTS.length;
  const ctx = cv.getContext("2d"), W = cv.width, R = W / 2 - 30, C = W / 2;
  const proj = UHGeo.geoOrthographic().scale(R).translate([C, C]).clipAngle(90);
  const path = UHGeo.geoPath(proj, ctx);
  let land = null, lon = -25, t0 = performance.now(), running = true;
  fetch("land.json").then((r) => r.json()).then((g) => { land = g; });
  // land colour by latitude (screen y): greens, with a sand band around 15–35° N (Sahara / Arabia) and a lighter south
  function landFill() {
    const y = (lat) => C - R * Math.sin(lat * Math.PI / 180);
    const g = ctx.createLinearGradient(0, y(80), 0, y(-60));
    g.addColorStop(0, "#9fb77a"); g.addColorStop(0.18, "#6f9e4b"); g.addColorStop(0.3, "#8fae52"); g.addColorStop(0.36, "#d9c48b"); g.addColorStop(0.44, "#e8d7a5"); g.addColorStop(0.5, "#c9b985"); g.addColorStop(0.58, "#6f9e4b"); g.addColorStop(0.72, "#4f8a3f"); g.addColorStop(0.86, "#8fae52"); g.addColorStop(1, "#b9c79a");
    return g;
  }
  function draw(now) {
    const dt = Math.min(0.1, (now - t0) / 1000); t0 = now; if (running) lon += dt * 6; proj.rotate([lon, -12]);
    ctx.clearRect(0, 0, W, W);
    // atmosphere
    const a = ctx.createRadialGradient(C, C, R * 0.95, C, C, R + 28); a.addColorStop(0, "rgba(120,170,255,.55)"); a.addColorStop(1, "rgba(120,170,255,0)");
    ctx.beginPath(); ctx.arc(C, C, R + 28, 0, Math.PI * 2); ctx.fillStyle = a; ctx.fill();
    // ocean
    const o = ctx.createRadialGradient(C - R * 0.35, C - R * 0.4, R * 0.1, C, C, R); o.addColorStop(0, "#2f7bff"); o.addColorStop(0.6, "#0f4fd6"); o.addColorStop(1, "#062a80");
    ctx.beginPath(); ctx.arc(C, C, R, 0, Math.PI * 2); ctx.fillStyle = o; ctx.fill();
    ctx.save(); ctx.beginPath(); ctx.arc(C, C, R, 0, Math.PI * 2); ctx.clip();
    if (land) {
      ctx.beginPath(); path(land); ctx.fillStyle = landFill(); ctx.fill();
      ctx.strokeStyle = "rgba(60,90,40,.35)"; ctx.lineWidth = 1; ctx.stroke();
      // soft relief: darker inner edge
      ctx.strokeStyle = "rgba(255,255,255,.25)"; ctx.lineWidth = .6; ctx.stroke();
    }
    // light & shadow (sun top-left)
    const sh = ctx.createRadialGradient(C - R * 0.45, C - R * 0.45, R * 0.2, C, C, R * 1.05); sh.addColorStop(0, "rgba(255,255,255,.22)"); sh.addColorStop(0.45, "rgba(255,255,255,0)"); sh.addColorStop(0.85, "rgba(0,10,60,.25)"); sh.addColorStop(1, "rgba(0,10,60,.6)");
    ctx.beginPath(); ctx.arc(C, C, R, 0, Math.PI * 2); ctx.fillStyle = sh; ctx.fill();
    ctx.restore();
    // rim
    ctx.beginPath(); ctx.arc(C, C, R, 0, Math.PI * 2); ctx.strokeStyle = "rgba(200,225,255,.6)"; ctx.lineWidth = 2; ctx.stroke();
    // dots
    const pulse = (Math.sin(now / 400) + 1) / 2;
    for (const [name, lo, la] of DOTS) {
      const p = proj([lo, la]); if (!p) continue;
      const dx = p[0] - C, dy = p[1] - C; if (dx * dx + dy * dy > R * R) continue;
      ctx.beginPath(); ctx.arc(p[0], p[1], 9 + pulse * 11, 0, Math.PI * 2); ctx.fillStyle = `rgba(255,210,63,${0.4 - pulse * 0.35})`; ctx.fill();
      ctx.beginPath(); ctx.arc(p[0], p[1], 7, 0, Math.PI * 2); ctx.fillStyle = "#ffd23f"; ctx.fill(); ctx.strokeStyle = "#141a52"; ctx.lineWidth = 2; ctx.stroke();
    }
    requestAnimationFrame(draw);
  }
  requestAnimationFrame(draw);
  cv.addEventListener("mouseenter", () => { running = false; }); cv.addEventListener("mouseleave", () => { running = true; });
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) running = false;
})();
