/* 路線 2 單元 E 共用工具：Black-76、示意選擇權鏈、GEX 計算、畫圖小工具 */
(function () {
  const { lerp } = window.KIT;
  const B = (F, K, d, iv = 0.2) => window.OF.b76(F, K, iv, Math.max(d, 0.0001) / 365);
  const fx = (v) => Math.round(v).toLocaleString();
  const sg = (v, d = 0) => (v >= 0 ? "+" : "−") + Math.abs(v).toLocaleString(undefined, { minimumFractionDigits: d, maximumFractionDigits: d });
  // 示意選擇權鏈：[履約價, Call OI, Put OI]；NQ 27,000、IV 20%、7 天
  const CHAIN = [[26600, 800, 5200], [26700, 900, 7800], [26800, 1500, 6100], [26900, 2600, 4800], [27000, 5200, 4200], [27100, 4100, 2300], [27200, 5600, 1600], [27300, 7400, 1100], [27400, 3800, 700]];
  const MULT = 20;
  // 標準假設：市商買 Call（正）、賣 Put（負）。單位：百萬美元／1%
  const gexC = (F, K, oi, d = 7, iv = 0.2) => (B(F, K, d, iv).gamma * oi * MULT * F * F * 0.01) / 1e6;
  const gexK = (F, K, c, p, d = 7, iv = 0.2) => gexC(F, K, c, d, iv) - gexC(F, K, p, d, iv);
  const net = (F, ch = CHAIN, d = 7) => ch.reduce((s, r) => s + gexK(F, r[0], r[1], r[2], r[3] == null ? d : r[3]), 0);
  function flip(ch = CHAIN, d = 7, lo = 26300, hi = 27700) {
    let pF = lo, pv = net(lo, ch, d);
    for (let F = lo + 10; F <= hi; F += 10) { const v = net(F, ch, d); if ((pv < 0) !== (v < 0)) return pF + (10 * -pv) / (v - pv); pF = F; pv = v; }
    return null;
  }
  // 折線：xs / ys 已經是座標
  const poly = (pts, cls = "s-buy", w = 3, extra = "") => `<polyline points="${pts.map((p) => p[0].toFixed(1) + "," + p[1].toFixed(1)).join(" ")}" class="${cls} f-none" stroke-width="${w}" ${extra}/>`;
  // 一般座標系：x 為價格
  function frame(o) {
    const lo = o.lo, hi = o.hi, x0 = o.x0 || 80, x1 = o.x1 || 600, y0 = o.y0 || 60, y1 = o.y1 || 320;
    const X = (v) => lerp(x0, x1, (v - lo) / (hi - lo)), Y = (v) => lerp(y1, y0, (v - o.ymin) / (o.ymax - o.ymin));
    const fn = (f, cls, w, upto = 1, step = 10, extra = "") => { const pts = []; for (let v = lo; v <= hi + 1e-9; v += step) pts.push([X(v), Y(f(v))]); return poly(pts.slice(0, Math.max(2, Math.round(upto * pts.length))), cls, w, extra); };
    const axis = (lab, ticks, zero = true) => `${zero ? `<line x1="${x0}" x2="${x1}" y1="${Y(o.base == null ? 0 : o.base)}" y2="${Y(o.base == null ? 0 : o.base)}" class="s-ink"/>` : ""}${(ticks || []).map((p) => `<text x="${X(p)}" y="${y1 + 22}" text-anchor="middle" class="t-mute">${o.tf ? o.tf(p) : fx(p)}</text>`).join("")}${lab ? `<text x="${x0}" y="${y0 - 16}" class="t-mute">${lab}</text>` : ""}`;
    return { X, Y, fn, axis, x0, x1, y0, y1 };
  }
  // 箭頭（上或下）
  const arrow = (x, y, up, len, cls) => `<path d="M${x} ${y + (up ? len / 2 : -len / 2)} v${up ? -len : len} m-6 ${up ? 7 : -7} l6 ${up ? -7 : 7} l6 ${up ? 7 : -7}" class="${cls} f-none" stroke-width="3"/>`;
  window.OPK = { B, fx, sg, CHAIN, MULT, gexC, gexK, net, flip, poly, frame, arrow };
})();
