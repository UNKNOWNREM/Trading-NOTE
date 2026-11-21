/* Some HTML viewers (e.g. Obsidian plugins) run pages under a strict CSP that ignores
   inline style="" attributes. Re-apply them through the CSSOM, which CSP allows. */
(function () {
  function apply(el) { const s = el.getAttribute("style"); if (s == null || el.__st === s) return; el.style.cssText = s; el.__st = el.getAttribute("style"); }
  function fix(n) { if (n.nodeType !== 1) return; if (n.hasAttribute("style")) apply(n); n.querySelectorAll("[style]").forEach(apply); }
  try {
    // apply right after innerHTML, before any script tweaks el.style on the new nodes
    const d = Object.getOwnPropertyDescriptor(Element.prototype, "innerHTML");
    if (d && d.set) Object.defineProperty(Element.prototype, "innerHTML", { configurable: true, get() { return d.get.call(this); }, set(v) { d.set.call(this, v); this.querySelectorAll("[style]").forEach(apply); } });
    new MutationObserver((ms) => { for (const m of ms) { if (m.type === "attributes") apply(m.target); else m.addedNodes.forEach(fix); } })
      .observe(document.documentElement, { subtree: true, childList: true, attributes: true, attributeFilter: ["style"] });
    fix(document.documentElement);
  } catch (e) { /* old browser: nothing to do */ }
})();
/* Shared math + small SVG chart helpers. No dependencies. */
(function () {
  const SQ2PI = Math.sqrt(2 * Math.PI);
  const phi = (x) => Math.exp(-0.5 * x * x) / SQ2PI;
  function Ncdf(x) {
    const t = 1 / (1 + 0.2316419 * Math.abs(x));
    const d = 0.3989423 * Math.exp((-x * x) / 2);
    const p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
    return x > 0 ? 1 - p : p;
  }
  /* Black-76 on a futures price F, zero rate. sig in decimals, T in years. */
  function b76(F, K, sig, T) {
    T = Math.max(T, 1 / (365 * 24));
    const sd = sig * Math.sqrt(T);
    const d1 = (Math.log(F / K) + 0.5 * sig * sig * T) / sd;
    const d2 = d1 - sd;
    return {
      d1, d2,
      callDelta: Ncdf(d1), putDelta: Ncdf(d1) - 1,
      gamma: phi(d1) / (F * sd),
      vega: (F * phi(d1) * Math.sqrt(T)) / 100,                 // per 1 vol point
      theta: (-F * phi(d1) * sig) / (2 * Math.sqrt(T)) / 365,   // per day, both sides when r = 0
      vanna: (-phi(d1) * d2 / sig) / 100,                       // delta change per 1 vol point
      charm: (phi(d1) * d2) / (2 * T) / 365,                    // delta change per day passing
      call: F * Ncdf(d1) - K * Ncdf(d2),
      put: K * Ncdf(-d2) - F * Ncdf(-d1)
    };
  }

  const fmt = {
    n: (v, d = 0) => (v == null || !isFinite(v) ? "—" : v.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d })),
    s: (v, d = 0) => (v == null || !isFinite(v) ? "—" : (v > 0 ? "+" : v < 0 ? "−" : "") + Math.abs(v).toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d })),
    m: (v) => { // millions -> compact
      if (v == null || !isFinite(v)) return "—";
      const a = Math.abs(v), sgn = v > 0 ? "+" : v < 0 ? "−" : "";
      return a >= 1000 ? sgn + (a / 1000).toFixed(2) + "B" : sgn + a.toFixed(1) + "M";
    }
  };

  function niceTicks(min, max, n) {
    if (min === max) { min -= 1; max += 1; }
    const span = max - min, raw = span / Math.max(n, 1);
    const mag = Math.pow(10, Math.floor(Math.log10(raw)));
    const step = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => s >= raw) || 10 * mag;
    const t0 = Math.ceil(min / step) * step, out = [];
    for (let v = t0; v <= max + step * 1e-6; v += step) out.push(+v.toFixed(10));
    return out;
  }
  const lin = (d0, d1, r0, r1) => (v) => r0 + ((v - d0) / (d1 - d0 || 1)) * (r1 - r0);

  /* tooltip */
  let tipEl;
  function tip() {
    if (!tipEl) { tipEl = document.createElement("div"); tipEl.className = "tip"; document.body.appendChild(tipEl); }
    return tipEl;
  }
  function showTip(html, ev) {
    const t = tip(); t.innerHTML = html; t.style.display = "block";
    const pad = 14, w = t.offsetWidth, h = t.offsetHeight;
    let x = ev.clientX + pad, y = ev.clientY + pad;
    if (x + w > window.innerWidth - 8) x = ev.clientX - w - pad;
    if (y + h > window.innerHeight - 8) y = ev.clientY - h - pad;
    t.style.left = Math.max(8, x) + "px"; t.style.top = Math.max(8, y) + "px";
  }
  function hideTip() { if (tipEl) tipEl.style.display = "none"; }
  function bindTips(root) {
    root.querySelectorAll("[data-tip]").forEach((n) => {
      n.addEventListener("mousemove", (e) => showTip(n.getAttribute("data-tip"), e));
      n.addEventListener("mouseleave", hideTip);
      n.addEventListener("touchstart", (e) => { const t = e.touches[0]; showTip(n.getAttribute("data-tip"), t); setTimeout(hideTip, 2200); }, { passive: true });
    });
  }
  const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");

  /* Line chart with crosshair. cfg: {w,h,m:{l,r,t,b}, xs:[...], series:[{name,color,vals}], xLabel,yLabel, vlines:[{x,label,color}], xfmt,yfmt,tipfmt} */
  function lineChart(el, cfg) {
    const W = cfg.w || 640, H = cfg.h || 260, m = Object.assign({ l: 66, r: 14, t: 14, b: 34 }, cfg.m || {});
    const xs = cfg.xs, all = cfg.series.flatMap((s) => s.vals.filter((v) => v != null && isFinite(v)));
    let y0 = cfg.y0 != null ? cfg.y0 : Math.min(...all), y1 = cfg.y1 != null ? cfg.y1 : Math.max(...all);
    if (cfg.zero) { y0 = Math.min(y0, 0); y1 = Math.max(y1, 0); }
    const pad = (y1 - y0) * 0.06 || 1; if (cfg.y0 == null) y0 -= pad; if (cfg.y1 == null) y1 += pad;
    const x0 = xs[0], x1 = xs[xs.length - 1];
    const X = lin(x0, x1, m.l, W - m.r), Y = lin(y0, y1, H - m.b, m.t);
    const yf = cfg.yfmt || ((v) => fmt.n(v)), xf = cfg.xfmt || ((v) => fmt.n(v));
    let g = "";
    niceTicks(y0, y1, 5).forEach((v) => { g += `<line class="grid" x1="${m.l}" x2="${W - m.r}" y1="${Y(v)}" y2="${Y(v)}"/><text x="${m.l - 8}" y="${Y(v) + 4}" text-anchor="end">${yf(v)}</text>`; });
    niceTicks(x0, x1, 6).forEach((v) => { g += `<text x="${X(v)}" y="${H - m.b + 18}" text-anchor="middle">${xf(v)}</text>`; });
    if (cfg.zero) g += `<line class="axis" x1="${m.l}" x2="${W - m.r}" y1="${Y(0)}" y2="${Y(0)}"/>`;
    g += `<line class="axis" x1="${m.l}" x2="${W - m.r}" y1="${H - m.b}" y2="${H - m.b}"/>`;
    (cfg.vlines || []).forEach((v) => {
      if (v.x < x0 || v.x > x1) return;
      g += `<line x1="${X(v.x)}" x2="${X(v.x)}" y1="${m.t}" y2="${H - m.b}" stroke="${v.color || "var(--ink-3)"}" stroke-width="1.5" stroke-dasharray="4 3"/>`;
      g += `<text class="lbl-strong" x="${X(v.x) + 4}" y="${m.t + 11 + (v.dy || 0)}" style="fill:${v.color || "var(--ink)"}">${esc(v.label)}</text>`;
    });
    cfg.series.forEach((s) => {
      let d = ""; s.vals.forEach((v, i) => { if (v == null || !isFinite(v)) return; d += (d ? "L" : "M") + X(xs[i]).toFixed(1) + " " + Y(v).toFixed(1); });
      g += `<path d="${d}" fill="none" stroke="${s.color}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>`;
    });
    if (cfg.marker != null) {
      cfg.series.forEach((s) => {
        const idx = xs.reduce((b, x, i) => (Math.abs(x - cfg.marker) < Math.abs(xs[b] - cfg.marker) ? i : b), 0);
        if (s.vals[idx] != null) g += `<circle cx="${X(xs[idx])}" cy="${Y(s.vals[idx])}" r="5" fill="${s.color}" stroke="var(--surface)" stroke-width="2"/>`;
      });
    }
    if (cfg.xLabel) g += `<text x="${(m.l + W - m.r) / 2}" y="${H - 2}" text-anchor="middle">${cfg.xLabel}</text>`;
    if (cfg.yLabel) g += `<text x="12" y="${(m.t + H - m.b) / 2}" text-anchor="middle" transform="rotate(-90 12 ${(m.t + H - m.b) / 2})">${cfg.yLabel}</text>`;
    el.innerHTML = `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(cfg.aria || "折線圖")}">${g}<line id="xh" y1="${m.t}" y2="${H - m.b}" stroke="var(--ink-3)" stroke-width="1" style="display:none"/><rect id="hit" x="${m.l}" y="${m.t}" width="${W - m.l - m.r}" height="${H - m.t - m.b}" fill="transparent"/></svg>`;
    const svg = el.querySelector("svg"), hit = svg.querySelector("#hit"), xh = svg.querySelector("#xh");
    const move = (ev) => {
      const pt = ev.touches ? ev.touches[0] : ev, r = svg.getBoundingClientRect();
      const px = ((pt.clientX - r.left) / r.width) * W, xv = x0 + ((px - m.l) / (W - m.l - m.r)) * (x1 - x0);
      const i = xs.reduce((b, x, k) => (Math.abs(x - xv) < Math.abs(xs[b] - xv) ? k : b), 0);
      xh.setAttribute("x1", X(xs[i])); xh.setAttribute("x2", X(xs[i])); xh.style.display = "";
      const rows = cfg.series.map((s) => `<span style="color:${s.color === "var(--ink)" ? "inherit" : "inherit"}">${esc(s.name)}：${(cfg.tipfmt || yf)(s.vals[i])}</span>`).join("<br>");
      showTip(`<b>${(cfg.tipx || xf)(xs[i])}</b><br>${rows}`, pt);
    };
    hit.addEventListener("mousemove", move); hit.addEventListener("touchmove", move, { passive: true }); hit.addEventListener("touchstart", move, { passive: true });
    hit.addEventListener("mouseleave", () => { xh.style.display = "none"; hideTip(); });
  }

  /* Diverging vertical bars: items [{x,label,v,tip}], positive = pos color, negative = neg color */
  function barChart(el, cfg) {
    const W = cfg.w || 640, H = cfg.h || 260, m = Object.assign({ l: 62, r: 14, t: 14, b: 40 }, cfg.m || {});
    const items = cfg.items, vals = items.map((i) => i.v);
    let y0 = Math.min(0, ...vals), y1 = Math.max(0, ...vals); const pad = (y1 - y0) * 0.08 || 1; y0 -= y0 < 0 ? pad : 0; y1 += y1 > 0 ? pad : 0;
    const Y = lin(y0, y1, H - m.b, m.t), bw = (W - m.l - m.r) / items.length, yf = cfg.yfmt || ((v) => fmt.n(v));
    let g = "";
    niceTicks(y0, y1, 5).forEach((v) => { g += `<line class="grid" x1="${m.l}" x2="${W - m.r}" y1="${Y(v)}" y2="${Y(v)}"/><text x="${m.l - 8}" y="${Y(v) + 4}" text-anchor="end">${yf(v)}</text>`; });
    g += `<line class="axis" x1="${m.l}" x2="${W - m.r}" y1="${Y(0)}" y2="${Y(0)}"/>`;
    const every = Math.ceil(items.length / (cfg.maxLabels || 12));
    items.forEach((it, i) => {
      const x = m.l + i * bw, top = Math.min(Y(0), Y(it.v)), h = Math.abs(Y(it.v) - Y(0));
      const col = it.v >= 0 ? cfg.pos : cfg.neg;
      g += `<rect data-tip="${esc(it.tip || it.label + "：" + yf(it.v))}" x="${x + bw * 0.14}" y="${top}" width="${Math.max(bw * 0.72, 1.5)}" height="${Math.max(h, 0.5)}" rx="${Math.min(3, bw * 0.2)}" fill="${col}"/>`;
      if (i % every === 0) g += `<text x="${x + bw / 2}" y="${H - m.b + 16}" text-anchor="middle">${esc(it.label)}</text>`;
    });
    (cfg.vlines || []).forEach((v) => {
      const idx = v.i; if (idx == null) return; const x = m.l + (idx + 0.5) * bw;
      g += `<line x1="${x}" x2="${x}" y1="${m.t}" y2="${H - m.b}" stroke="${v.color}" stroke-width="1.5" stroke-dasharray="4 3"/><text class="lbl-strong" x="${x + 4}" y="${m.t + 11 + (v.dy || 0)}" style="fill:${v.color}">${esc(v.label)}</text>`;
    });
    if (cfg.xLabel) g += `<text x="${(m.l + W - m.r) / 2}" y="${H - 2}" text-anchor="middle">${cfg.xLabel}</text>`;
    el.innerHTML = `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(cfg.aria || "長條圖")}">${g}</svg>`;
    bindTips(el);
  }

  /* Scatter: pts [{x,y,label,tip}] */
  function scatterChart(el, cfg) {
    const W = cfg.w || 560, H = cfg.h || 300, m = Object.assign({ l: 64, r: 16, t: 14, b: 42 }, cfg.m || {});
    const xs = cfg.pts.map((p) => p.x), ys = cfg.pts.map((p) => p.y);
    let x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
    const px = (x1 - x0) * 0.1 || 1, py = (y1 - y0) * 0.15 || 1; x0 -= px; x1 += px; y0 = Math.max(0, y0 - py); y1 += py;
    const X = lin(x0, x1, m.l, W - m.r), Y = lin(y0, y1, H - m.b, m.t);
    let g = "";
    niceTicks(y0, y1, 5).forEach((v) => { g += `<line class="grid" x1="${m.l}" x2="${W - m.r}" y1="${Y(v)}" y2="${Y(v)}"/><text x="${m.l - 8}" y="${Y(v) + 4}" text-anchor="end">${cfg.yfmt ? cfg.yfmt(v) : v}</text>`; });
    niceTicks(x0, x1, 6).forEach((v) => { g += `<text x="${X(v)}" y="${H - m.b + 18}" text-anchor="middle">${cfg.xfmt ? cfg.xfmt(v) : v}</text>`; });
    if (x0 < 0 && x1 > 0) g += `<line x1="${X(0)}" x2="${X(0)}" y1="${m.t}" y2="${H - m.b}" stroke="var(--ink-3)" stroke-dasharray="4 3"/>`;
    g += `<line class="axis" x1="${m.l}" x2="${W - m.r}" y1="${H - m.b}" y2="${H - m.b}"/>`;
    cfg.pts.forEach((p) => {
      g += `<circle data-tip="${esc(p.tip)}" cx="${X(p.x)}" cy="${Y(p.y)}" r="${p.r || 7}" fill="${cfg.color}" fill-opacity=".85" stroke="var(--surface)" stroke-width="2"/>`;
      g += `<text x="${X(p.x) + 10}" y="${Y(p.y) + 4}" style="font-size:11px">${esc(p.label || "")}</text>`;
    });
    g += `<text x="${(m.l + W - m.r) / 2}" y="${H - 4}" text-anchor="middle">${cfg.xLabel || ""}</text>`;
    g += `<text x="12" y="${(m.t + H - m.b) / 2}" text-anchor="middle" transform="rotate(-90 12 ${(m.t + H - m.b) / 2})">${cfg.yLabel || ""}</text>`;
    el.innerHTML = `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(cfg.aria || "散佈圖")}">${g}</svg>`;
    bindTips(el);
  }

  function spearman(a, b) {
    const rank = (arr) => { const idx = arr.map((v, i) => [v, i]).sort((p, q) => p[0] - q[0]); const r = new Array(arr.length); let i = 0;
      while (i < idx.length) { let j = i; while (j + 1 < idx.length && idx[j + 1][0] === idx[i][0]) j++; const avg = (i + j) / 2 + 1; for (let k = i; k <= j; k++) r[idx[k][1]] = avg; i = j + 1; } return r; };
    const ra = rank(a), rb = rank(b), n = a.length, ma = ra.reduce((s, v) => s + v, 0) / n, mb = rb.reduce((s, v) => s + v, 0) / n;
    let num = 0, da = 0, db = 0; for (let i = 0; i < n; i++) { num += (ra[i] - ma) * (rb[i] - mb); da += (ra[i] - ma) ** 2; db += (rb[i] - mb) ** 2; }
    return num / Math.sqrt(da * db);
  }

  window.OF = { b76, phi, Ncdf, fmt, niceTicks, lin, lineChart, barChart, scatterChart, spearman, showTip, hideTip, bindTips, esc };
})();
