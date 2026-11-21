/* 路線 3 共用：K 線圖、單根 K 線的 footprint 解剖 */
(function () {
  const { lerp, seg } = window.KIT;
  const fx = (v) => Math.round(v).toLocaleString();
  const sg = (v) => (v >= 0 ? "+" : "−") + Math.abs(Math.round(v)).toLocaleString();

  // SC = { lo, hi, bars:[{o,h,l,c,d,v}], lv:[[價, 名稱, cls]] }
  function chart(SC, upto, o = {}) {
    const x0 = o.x0 || 76, slot = o.slot || 40, x1 = o.x1 || x0 + slot * SC.bars.length + 10;
    const Y = (p) => lerp(o.y1 || 320, o.y0 || 56, (p - SC.lo) / (SC.hi - SC.lo));
    const X = (i) => x0 + 14 + i * slot;
    let s = "";
    (SC.lv || []).forEach(([p, lab, cls], k) => {
      const op = o.lvOp == null ? 1 : o.lvOp;
      s += `<g opacity="${op}"><line x1="${x0 - 6}" x2="${x1}" y1="${Y(p)}" y2="${Y(p)}" class="${cls}" stroke-width="1.5" stroke-dasharray="${cls === "s-line" ? "" : "5 4"}"/><text x="${x0 - 10}" y="${Y(p) + 4}" text-anchor="end" class="${cls.replace("s-", "t-").replace("t-line", "t-mute")} t-b">${lab}</text></g>`;
    });
    if (o.band) s += `<rect x="${x0 - 6}" y="${Y(o.band[1])}" width="${x1 - x0 + 6}" height="${Y(o.band[0]) - Y(o.band[1])}" class="f-gamma-soft" opacity="0.35"/>`;
    SC.bars.slice(0, upto + 1).forEach((b, i) => {
      const op = i === upto && o.lastOp != null ? o.lastOp : (o.dim && o.dim.includes(i) ? 0.35 : 1), up = b.c >= b.o, x = X(i);
      s += `<g opacity="${op}"><line x1="${x}" x2="${x}" y1="${Y(b.h)}" y2="${Y(b.l)}" class="s-ink" stroke-width="1.6"/><rect x="${x - 9}" y="${Y(Math.max(b.o, b.c))}" width="18" height="${Math.max(2, Math.abs(Y(b.o) - Y(b.c)))}" rx="2" class="${up ? "f-buy" : "f-sell"}"/>`;
      if (o.delta !== false) s += `<text x="${x}" y="${(o.y1 || 320) + 22}" text-anchor="middle" class="${b.d >= 0 ? "t-buy" : "t-sell"}">${sg(b.d)}</text>`;
      s += `</g>`;
      if (o.focus === i) s += `<rect x="${x - 16}" y="${Y(b.h) - 8}" width="32" height="${Y(b.l) - Y(b.h) + 16}" rx="6" class="f-none s-hl" stroke-width="2.5"/>`;
    });
    if (o.delta !== false) s += `<text x="${x0 - 10}" y="${(o.y1 || 320) + 22}" text-anchor="end" class="t-mute">Delta</text>`;
    if (o.trade) {
      const T = o.trade, xa = X(T.at) - 12;
      [[T.e, "進場 " + fx(T.e), "s-ink", "t-ink"], [T.s, "停損 " + fx(T.s), "s-sell", "t-sell"], [T.t1, "TP1 " + fx(T.t1), "s-gamma", "t-gamma"], T.t2 ? [T.t2, "TP2 " + fx(T.t2), "s-gamma", "t-gamma"] : null].filter(Boolean).forEach(([p, lab, sc, tc], k) => {
        const op = T.op ? T.op[k] : 1;
        s += `<g opacity="${op}"><line x1="${xa}" x2="${x1}" y1="${Y(p)}" y2="${Y(p)}" class="${sc}" stroke-width="2"/><text x="${x1 + 4}" y="${Y(p) + 4}" class="${tc} t-b">${lab}</text></g>`;
      });
    }
    return { s, X, Y, x0, x1 };
  }

  // 單根 K 的 footprint：rows=[[價, 主動賣, 主動買], ...] 由高到低
  function ladder(rows, x, y0, o = {}) {
    const rh = o.rh || 30, cw = 58, pw = 66, hot = o.hot || 400;
    let s = `<text x="${x + cw / 2}" y="${y0 - 10}" text-anchor="middle" class="t-sell t-b">主動賣</text><text x="${x + cw + pw + cw / 2}" y="${y0 - 10}" text-anchor="middle" class="t-buy t-b">主動買</text>`;
    let poc = rows.reduce((a, r) => (r[1] + r[2] > a[1] + a[2] ? r : a));
    rows.forEach((r, k) => {
      const y = y0 + k * rh, hl = o.hl && o.hl.includes(r[0]), isPoc = o.poc && r === poc;
      const sellHot = r[1] >= hot || (o.imb && rows[k + 1] && r[1] >= 3 * rows[k + 1][2]), buyHot = r[2] >= hot;
      s += `<rect x="${x}" y="${y}" width="${cw}" height="${rh - 4}" rx="4" class="${sellHot ? "f-sell" : "f-sell-soft"}"/><text x="${x + cw - 6}" y="${y + rh / 2 + 3}" text-anchor="end" class="${sellHot ? "t-w" : "t-sell"} t-b">${r[1]}</text>`;
      s += `<text x="${x + cw + pw / 2}" y="${y + rh / 2 + 3}" text-anchor="middle" class="${isPoc ? "t-gamma t-b" : "t-mute"}">${fx(r[0])}${isPoc ? " ●" : ""}</text>`;
      s += `<rect x="${x + cw + pw}" y="${y}" width="${cw}" height="${rh - 4}" rx="4" class="${buyHot ? "f-buy" : "f-buy-soft"}"/><text x="${x + cw + pw + 6}" y="${y + rh / 2 + 3}" class="${buyHot ? "t-w" : "t-buy"} t-b">${r[2]}</text>`;
      if (hl) s += `<rect x="${x - 3}" y="${y - 3}" width="${cw * 2 + pw + 6}" height="${rh + 2}" rx="6" class="f-none s-hl" stroke-width="2.5"/>`;
    });
    const tb = rows.reduce((a, r) => a + r[2], 0), ts = rows.reduce((a, r) => a + r[1], 0);
    if (o.foot !== false) s += `<text x="${x + cw + pw / 2}" y="${y0 + rows.length * rh + 18}" text-anchor="middle" class="t-ink t-b">Delta ${sg(tb - ts)}　量 ${fx(tb + ts)}</text>`;
    return s;
  }
  // 小標籤：指向某個位置
  const tag = (x, y, txt, cls = "t-ink", anchor = "start") => `<text x="${x}" y="${y}" text-anchor="${anchor}" class="${cls} t-b">${txt}</text>`;

  // 沒有逐格資料的 K 線：依 Delta 方向估一份示意 footprint
  function synth(b) {
    const top = Math.floor(b.h / 5) * 5, bot = Math.ceil(b.l / 5) * 5, rows = [];
    for (let p = top; p >= bot; p -= 5) rows.push(p);
    const n = rows.length, v = Math.max(b.v || 300 * n, Math.abs(b.d) * 2.2);
    const w = rows.map((p, k) => 0.6 + 1 - Math.abs(k - (n - 1) / 2) / n), ws = w.reduce((x, y) => x + y, 0);
    const out = rows.map((p, k) => { const tot = Math.round((v * w[k]) / ws), dr = Math.round((b.d * w[k]) / ws), buy = Math.round((tot + dr) / 2); return [p, tot - buy, buy]; });
    const err = b.d - out.reduce((x, r) => x + r[2] - r[1], 0), m = Math.floor(n / 2); out[m][2] += Math.round(err / 2); out[m][1] -= err - Math.round(err / 2);
    return out;
  }
  // 逐根回放練習：cfg.ask[i] = {t, o:[[文字, 對錯, 解說]]}；cfg.trade 在 cfg.trade.at 之後顯示
  function replay(box, SC, cfg) {
    box.innerHTML = `<div class="rp-grid"><svg class="fpx rp-chart" viewBox="0 0 640 380" role="img" aria-label="K 線回放"></svg><svg class="fpx rp-lad" viewBox="0 0 220 380" role="img" aria-label="這根 K 線的 footprint"></svg></div>
<div class="btn-row"><button class="btn rp-prev" type="button">上一根</button><button class="btn primary rp-next" type="button">下一根</button><span class="small rp-n"></span></div><div class="rp-q" aria-live="polite"></div><ul class="sim-task rp-task"></ul>`;
    const q = (x) => box.querySelector(x); let i = cfg.start || 0; const ok = {}, keys = Object.keys(cfg.ask).map(Number);
    function paint() {
      const C = chart(SC, i, { focus: i, trade: cfg.trade && i >= cfg.trade.at && ok[cfg.trade.at] !== false ? cfg.trade : null, x1: 76 + 40 * SC.bars.length + 10 });
      q(".rp-chart").innerHTML = C.s;
      const b = SC.bars[i], rows = b.rows || synth(b), rh = Math.min(30, 300 / rows.length);
      q(".rp-lad").innerHTML = `<text x="110" y="22" text-anchor="middle" class="t-ink t-b">第 ${i + 1} 根${b.rows ? "" : "（示意）"}</text>` + ladder(rows, 18, 56, { rh, poc: true, hot: cfg.hot || 400 });
      q(".rp-n").textContent = `第 ${i + 1} / ${SC.bars.length} 根`;
      const a = cfg.ask[i];
      q(".rp-q").innerHTML = a ? `<p class="small"><b>${a.t}</b></p><div class="q-opts">${a.o.map((o, k) => `<button class="q-opt" type="button" data-k="${k}">${o[0]}</button>`).join("")}</div><div class="rp-fb"></div>` : `<p class="small">${b.note || "看看這根 K 線的 footprint，再按「下一根」。"}</p>`;
      q(".rp-next").disabled = !!a && ok[i] !== true;
      q(".rp-task").innerHTML = keys.map((k) => `<li class="${ok[k] ? "ok" : ""}">${ok[k] ? "✓" : "○"} 第 ${k + 1} 根：${cfg.ask[k].task}</li>`).join("");
    }
    box.addEventListener("click", (e) => {
      const o = e.target.closest(".rp-q .q-opt");
      if (o) { const a = cfg.ask[i], r = a.o[+o.dataset.k]; box.querySelectorAll(".rp-q .q-opt").forEach((x) => x.classList.remove("ok", "bad")); o.classList.add(r[1] ? "ok" : "bad"); q(".rp-fb").innerHTML = `<p><b class="${r[1] ? "ok" : "bad"}">${r[1] ? "對。" : "再想想。"}</b>${r[2]}</p>`; if (r[1]) { ok[i] = true; q(".rp-next").disabled = false; q(".rp-task").innerHTML = keys.map((k) => `<li class="${ok[k] ? "ok" : ""}">${ok[k] ? "✓" : "○"} 第 ${k + 1} 根：${cfg.ask[k].task}</li>`).join(""); } return; }
      if (e.target.closest(".rp-next")) { i = Math.min(SC.bars.length - 1, i + 1); paint(); }
      if (e.target.closest(".rp-prev")) { i = Math.max(0, i - 1); paint(); }
    });
    paint();
  }
  window.SOPK = { fx, sg, chart, ladder, tag, synth, replay };
})();
