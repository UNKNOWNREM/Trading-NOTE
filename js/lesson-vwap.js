/* 路線 1 第 8 關（新）：VWAP 成交量加權平均價 */
(function () {
  const PAGES = (window.__PAGES = window.__PAGES || {});
  const { chip, lerp, ease, seg, cards } = window.KIT;

  function mk(c, v, o0) {
    return c.map((x, k) => { const o = k ? c[k - 1] : o0; return { o, c: x, h: Math.max(o, x) + 0.55, l: Math.min(o, x) - 0.55, v: v[k] }; });
  }
  const DAYS = {
    trend: { name: "趨勢日", bars: mk([100, 101.4, 102.6, 101.6, 103.0, 104.0, 102.6, 104.0, 105.0, 103.4, 104.8, 105.8, 104.0, 105.4, 106.4, 105.8], [900, 700, 800, 500, 650, 700, 450, 600, 650, 400, 500, 550, 380, 480, 420, 350], 99.6) },
    range: { name: "盤整日", bars: mk([100, 101.2, 102, 101, 100.2, 99.4, 100.3, 101.4, 102.3, 101.5, 100.4, 99.6, 100.5, 101.3, 100.8, 100.2], [800, 650, 600, 500, 550, 600, 450, 500, 600, 450, 480, 560, 420, 400, 380, 360], 100.4) },
    event: { name: "事件後反轉", bars: mk([104, 103, 101.5, 99.6, 98.4, 97.6, 98.8, 100, 99.4, 100.8, 101.9, 101.2, 102.6, 103.4, 102.9, 104], [500, 600, 900, 1400, 1200, 1500, 900, 800, 600, 700, 650, 500, 600, 550, 450, 500], 104.6) }
  };
  // 從 a 開始累計的 VWAP 與標準差
  function vwap(bars, a = 0) {
    let pv = 0, vv = 0, p2 = 0; const out = [];
    bars.forEach((b, k) => {
      if (k < a) { out.push(null); return; }
      const tp = (b.h + b.l + b.c) / 3; pv += tp * b.v; vv += b.v; p2 += tp * tp * b.v;
      const m = pv / vv, sd = Math.sqrt(Math.max(0, p2 / vv - m * m));
      out.push({ m, sd });
    });
    return out;
  }
  function chart(bars, o = {}) {
    const n = bars.length, X = (k) => lerp(80, 590, k / (n - 1));
    const lo = Math.min(...bars.map((b) => b.l)) - (o.pad || 1.5), hi = Math.max(...bars.map((b) => b.h)) + (o.pad || 1.5);
    const Y = (p) => lerp(330, 40, (p - lo) / (hi - lo));
    const np = o.upto == null ? n : o.upto;
    let s = "";
    for (let p = Math.ceil(lo); p <= hi; p += 2) s += `<line x1="70" x2="600" y1="${Y(p)}" y2="${Y(p)}" class="s-line"/><text x="62" y="${Y(p) + 4}" text-anchor="end" class="t-mute">${p}</text>`;
    bars.slice(0, np).forEach((b, k) => {
      const up = b.c >= b.o, x = X(k), act = o.click ? ` data-b="${k}" class="bar-hit"` : "";
      s += `<g${act} opacity="${o.dim ? 0.45 : 1}"><line x1="${x}" x2="${x}" y1="${Y(b.h)}" y2="${Y(b.l)}" class="${up ? "s-buy" : "s-sell"}" stroke-width="2"/><rect x="${x - 9}" y="${Y(Math.max(b.o, b.c))}" width="18" height="${Math.max(2, Math.abs(Y(b.o) - Y(b.c)))}" rx="2" class="${up ? "f-buy" : "f-sell"}"/>${o.click ? `<rect x="${x - 15}" y="36" width="30" height="300" class="f-none" pointer-events="all"/>` : ""}</g>`;
    });
    const line = (arr, key, cls, w = 2.5, dash = "") => {
      const pts = arr.slice(0, np).map((r, k) => (r ? `${X(k)},${Y(key(r))}` : null)).filter(Boolean);
      return pts.length > 1 ? `<polyline points="${pts.join(" ")}" class="${cls} f-none" stroke-width="${w}" ${dash ? `stroke-dasharray="${dash}"` : ""}/>` : "";
    };
    return { s, X, Y, line };
  }

  const STEPS = [
    { cap: "先想想買菜：你分三次買，<b>100 元買 10 斤、102 元買 30 斤、101 元買 10 斤</b>。你的平均成本是多少？",
      why: "直接把三個價格平均是 (100 ＋ 102 ＋ 101) ÷ 3 ＝ 101。但你在 102 元買得最多，真正的平均成本應該更靠近 102。", stuck: "買得多的那一次，對平均成本的影響比較大。" },
    { cap: "要用<b>數量加權</b>：(100×10 ＋ 102×30 ＋ 101×10) ÷ 50 ＝ <b>101.4</b>。這種「依成交量加權的平均價」就叫 <b>VWAP</b>。",
      why: "VWAP 是 Volume Weighted Average Price 的縮寫。公式是：每筆的（價格 × 成交量）全部加起來，再除以總成交量。成交越多的價格，佔的比重越大。", dur: 2200 },
    { cap: "放到一整天：從開盤開始，每根 K 棒的價格乘上成交量一路累加，畫出來就是一條會跟著價格慢慢移動的線。",
      why: "每根 K 棒通常用「(最高 ＋ 最低 ＋ 收盤) ÷ 3」當代表價格。越到後面累積的量越多，VWAP 就動得越慢，開盤時則變化比較快。", dur: 2600 },
    { cap: "VWAP 代表<b>今天所有成交的平均成本</b>。價格在 VWAP 上方，表示今天進場的買方平均是賺錢的；在下方，則是平均在虧。",
      why: "所以很多機構用 VWAP 衡量自己今天買得好不好；交易者則把它當成「今天的公平價格」。價格離 VWAP 太遠，常會被拉回來；站穩在一邊，代表那一方掌控今天。" },
    { cap: "換你算：今天只有兩筆成交，<b>100 元 20 口、104 元 20 口</b>。",
      q: { t: "VWAP 是多少？", o: [
        ["102", true, "(100×20 ＋ 104×20) ÷ 40 ＝ 102。兩筆的量一樣，所以剛好是兩個價格的中間。"],
        ["104", false, "104 只是其中一筆的價格。VWAP 要依量加權平均。"],
        ["4,080", false, "4,080 是 (100×20 ＋ 104×20) ÷ 1，還要除以總量 40。"]] } },
    { cap: "VWAP 上下可以再畫<b>標準差通道</b>：±1、±2 個標準差。它告訴你今天的價格通常離平均多遠。",
      why: "標準差是「分散程度」的意思。當天價格越分散，通道就越寬。價格碰到 ±2 標準差，代表已經離平均成本很遠了。", dur: 2400 },
    { cap: "<b>趨勢日</b>：價格大部分時間都在 VWAP 上方，回檔到 VWAP 附近就又被買上去。這時 VWAP 像一條移動的支撐線。",
      why: "買方掌控的日子，大家願意在平均成本附近接。跌破 VWAP 並站不回去，常是趨勢可能結束的第一個警訊。", dur: 2600 },
    { cap: "<b>盤整日</b>：價格繞著 VWAP 上下來回，碰到 ±2 標準差附近常會被拉回來。",
      why: "沒有一方掌控時，VWAP 像中線，通道邊緣像兩道牆。這跟上一關的價值區很像：邊緣找反向訊號，目標看回中間。", dur: 2600 },
    { cap: "練習一下：盤整日裡，價格突然衝到 <b>+2 標準差</b>上方，你很想追進去做多。",
      q: { t: "比較合理的想法是？", o: [
        ["趕快追，衝這麼快一定會繼續漲", false, "價格已經離今天的平均成本很遠。盤整日裡這種位置追價，很容易買在短線高點。"],
        ["離平均很遠了，追價風險高；等回到 VWAP 附近或看到確認再說", true, "+2 標準差代表偏離很大。在盤整日，價格常被拉回 VWAP；就算要做多，也等更好的位置。"],
        ["VWAP 沒用，不用管", false, "VWAP 正好告訴你：現在的價格比今天所有人的平均成本高很多。"]] } },
    { cap: "VWAP 和上一關的 POC 不一樣：POC 是<b>成交最多的那一個價格</b>，VWAP 是<b>所有成交的平均</b>。兩者常常很近，但不一定重疊。",
      why: "成交分布兩邊不對稱時，兩者會分開。例如下午價格一路往上，平均成本被拉高，VWAP 會在 POC 上面。兩條都畫出來，就知道「大家最常在哪交易」和「大家平均成本在哪」。", stuckHref: "#of-6", stuckLabel: "回第 7 關複習 POC →", dur: 2400 },
    { cap: "<b>錨定 VWAP</b>：不從開盤算，而是從一個重要的時間點開始算，例如數據公布後的最低點。它代表<b>從那時候進場的人</b>平均成本在哪。",
      why: "錨定 VWAP（Anchored VWAP）可以從任何一根 K 棒開始。常見的起點：重要數據公布、前一個高點或低點、跳空開盤。價格站上這條線，代表從那個低點之後買進的人平均是賺錢的。", dur: 2600 },
    { cap: "練習一下：CPI 公布後價格先大跌，之後在某一根 K 棒做出低點反彈。",
      q: { t: "想知道「從低點之後進場的買方」平均成本在哪，錨定 VWAP 應該從哪裡開始算？", o: [
        ["今天開盤那一根", false, "那是一般的 VWAP，包含了低點之前所有人的成本。"],
        ["做出最低點的那一根 K 棒", true, "從低點那根開始算，得到的就是低點之後所有成交的平均成本。"],
        ["最新的一根 K 棒", false, "從最新一根開始，只有一根 K 棒的資料，沒有意義。"]] } },
    { cap: "整理：VWAP 是今天的<b>平均成本</b>。站在哪一邊，代表哪一方掌控；趨勢日看回測 VWAP，盤整日看通道邊緣；錨定 VWAP 看某個事件之後的成本。",
      why: "VWAP、POC、VAH、VAL 都是盤前和盤中的關鍵價位。下一關會用時間（Market Profile）再看一次「大家在哪裡停留」。" }
  ];

  function draw(svg, i, t) {
    const e = ease(t); let s = "";
    if (i === 0 || i === 1) {
      const B = [[100, 10], [102, 30], [101, 10]];
      B.forEach((b, k) => { const x = 140 + k * 150, h = b[1] * 4 * (i === 0 ? ease(seg(t, k * 0.2, k * 0.2 + 0.4)) : 1); s += `<rect x="${x}" y="${300 - h}" width="80" height="${h}" rx="6" class="f-buy-soft"/><text x="${x + 40}" y="322" text-anchor="middle" class="t-ink t-b">${b[0]} 元</text><text x="${x + 40}" y="${292 - h}" text-anchor="middle" class="t-mute">${b[1]} 斤</text>`; });
      s += `<line x1="110" x2="590" y1="300" y2="300" class="s-ink"/>`;
      if (i === 0) s += `<text x="110" y="60" class="t-ink t-b t-lg" opacity="${seg(t, 0.6, 1)}">平均成本是 101 嗎？</text>`;
      else {
        s += `<g opacity="${seg(t, 0, 0.5)}"><text x="110" y="52" class="t-mute">直接平均：(100 ＋ 102 ＋ 101) ÷ 3 ＝ 101</text></g>`;
        s += `<g opacity="${seg(t, 0.4, 0.9)}"><text x="110" y="84" class="t-ink">加權平均：(100×10 ＋ 102×30 ＋ 101×10) ÷ 50</text><text x="110" y="118" class="t-buy t-b t-xl">＝ 101.4（VWAP）</text></g>`;
      }
    } else if (i === 2 || i === 3) {
      const b = DAYS.trend.bars, w = vwap(b), g = chart(b, { upto: i === 2 ? Math.max(2, Math.ceil(seg(t, 0, 0.85) * b.length)) : b.length });
      s += g.s + g.line(w, (r) => r.m, "s-gamma", 3);
      const np = i === 2 ? Math.max(2, Math.ceil(seg(t, 0, 0.85) * b.length)) : b.length, last = w[np - 1];
      s += `<text x="${g.X(np - 1) + 10}" y="${g.Y(last.m) + 18}" class="t-gamma t-b">VWAP</text>`;
      if (i === 3) s += `<g opacity="${seg(t, 0.2, 0.7)}"><rect x="90" y="44" width="250" height="48" rx="10" class="f-buy-soft"/><text x="104" y="74" class="t-ink t-b">價格在上方：今天的買方平均在賺</text></g>`;
    } else if (i === 4) {
      s += `<rect x="150" y="${300 - 120}" width="90" height="120" rx="6" class="f-buy-soft"/><rect x="390" y="${300 - 120}" width="90" height="120" rx="6" class="f-buy-soft"/><line x1="110" x2="560" y1="300" y2="300" class="s-ink"/>`;
      s += `<text x="195" y="322" text-anchor="middle" class="t-ink t-b">100</text><text x="435" y="322" text-anchor="middle" class="t-ink t-b">104</text><text x="195" y="170" text-anchor="middle" class="t-mute">20 口</text><text x="435" y="170" text-anchor="middle" class="t-mute">20 口</text><text x="315" y="80" text-anchor="middle" class="t-ink t-b t-lg">VWAP ＝ ？</text>`;
    } else if (i === 5) {
      const b = DAYS.range.bars, w = vwap(b), g = chart(b, { pad: 2.5 });
      s += g.s + g.line(w, (r) => r.m, "s-gamma", 3);
      const a1 = seg(t, 0.1, 0.5), a2 = seg(t, 0.5, 0.9);
      s += `<g opacity="${a1}">${g.line(w, (r) => r.m + r.sd, "s-ink", 1.5, "5 4")}${g.line(w, (r) => r.m - r.sd, "s-ink", 1.5, "5 4")}<text x="596" y="${g.Y(w[15].m + w[15].sd) - 4}" text-anchor="end" class="t-mute">+1σ</text><text x="596" y="${g.Y(w[15].m - w[15].sd) + 14}" text-anchor="end" class="t-mute">−1σ</text></g>`;
      s += `<g opacity="${a2}">${g.line(w, (r) => r.m + 2 * r.sd, "s-sell", 1.5, "3 4")}${g.line(w, (r) => r.m - 2 * r.sd, "s-sell", 1.5, "3 4")}<text x="596" y="${g.Y(w[15].m + 2 * w[15].sd) - 4}" text-anchor="end" class="t-sell">+2σ</text><text x="596" y="${g.Y(w[15].m - 2 * w[15].sd) + 14}" text-anchor="end" class="t-sell">−2σ</text></g>`;
    } else if (i === 6 || i === 7 || i === 8) {
      const d = i === 6 ? DAYS.trend : DAYS.range, b = d.bars, w = vwap(b), np = i === 8 ? b.length : Math.max(2, Math.ceil(seg(t, 0, 0.85) * b.length));
      const g = chart(b, { upto: np, pad: 2.5 });
      s += g.s + g.line(w, (r) => r.m, "s-gamma", 3);
      if (i !== 6) s += g.line(w, (r) => r.m + 2 * r.sd, "s-sell", 1.5, "3 4") + g.line(w, (r) => r.m - 2 * r.sd, "s-sell", 1.5, "3 4");
      s += `<text x="90" y="30" class="t-ink t-b">${d.name}</text>`;
      if (i === 6) [3, 6, 9, 12].forEach((k) => { if (k < np) s += `<circle cx="${g.X(k)}" cy="${g.Y(b[k].l)}" r="9" class="f-none s-buy" stroke-width="2"/>`; });
      if (i === 7) [2, 5, 8, 11].forEach((k) => { if (k < np) s += `<circle cx="${g.X(k)}" cy="${g.Y(k === 2 || k === 8 ? b[k].h : b[k].l)}" r="9" class="f-none s-sell" stroke-width="2"/>`; });
      if (i === 8) s += chip(470, 60, "衝到 +2σ 上方，要追嗎？", "buy", 0.6 + 0.4 * Math.abs(Math.sin(t * Math.PI)));
    } else if (i === 9) {
      const b = DAYS.trend.bars, w = vwap(b), g = chart(b, { dim: true });
      s += g.s + g.line(w, (r) => r.m, "s-gamma", 3);
      // 簡化的 Profile：用價格區間累計量
      const bins = {}; b.forEach((x) => { const k = Math.round((x.h + x.l) / 2); bins[k] = (bins[k] || 0) + x.v; });
      const ks = Object.keys(bins).map(Number), mx = Math.max(...Object.values(bins)), poc = ks.find((k) => bins[k] === mx);
      s += `<g opacity="${seg(t, 0.1, 0.6)}">${ks.map((k) => `<rect x="${600 - (bins[k] / mx) * 110}" y="${g.Y(k) - 7}" width="${(bins[k] / mx) * 110}" height="14" rx="3" class="${k === poc ? "f-buy" : "f-buy-soft"}"/>`).join("")}<text x="${600 - 116}" y="${g.Y(poc) + 4}" text-anchor="end" class="t-buy t-b">POC ${poc}</text></g>`;
      s += `<text x="${g.X(8)}" y="${g.Y(w[8].m) + 22}" text-anchor="middle" class="t-gamma t-b" opacity="${seg(t, 0.5, 1)}">VWAP（最後 ${w[15].m.toFixed(1)}）</text>`;
    } else if (i === 10 || i === 11) {
      const b = DAYS.event.bars, g = chart(b, { pad: 2 });
      const w = vwap(b), aw = vwap(b, 5);
      s += g.s + `<g opacity="0.5">${g.line(w, (r) => r.m, "s-gamma", 2, "6 4")}</g><text x="596" y="${g.Y(w[15].m) - 22}" text-anchor="end" class="t-gamma">一般 VWAP</text>`;
      s += `<text x="${g.X(3)}" y="40" text-anchor="middle" class="t-sell t-b">CPI 公布</text><line x1="${g.X(3)}" x2="${g.X(3)}" y1="46" y2="330" class="s-sell" stroke-dasharray="4 4"/>`;
      if (i === 10) {
        const n = Math.max(6, Math.ceil(seg(t, 0.2, 0.9) * b.length));
        const pts = aw.slice(0, n).map((r, k) => (r ? `${g.X(k)},${g.Y(r.m)}` : null)).filter(Boolean);
        s += `<circle cx="${g.X(5)}" cy="${g.Y(b[5].l)}" r="10" class="f-none s-buy" stroke-width="2.5" opacity="${seg(t, 0, 0.3)}"/><text x="${g.X(5)}" y="${g.Y(b[5].l) + 26}" text-anchor="middle" class="t-buy t-b" opacity="${seg(t, 0, 0.3)}">最低點：錨定起點</text>`;
        if (pts.length > 1) s += `<polyline points="${pts.join(" ")}" class="s-buy f-none" stroke-width="3"/>`;
        s += `<text x="596" y="${g.Y(aw[15].m) - 8}" text-anchor="end" class="t-buy t-b" opacity="${seg(t, 0.85, 1)}">錨定 VWAP</text>`;
      } else s += `<text x="${g.X(5)}" y="${g.Y(b[5].l) + 26}" text-anchor="middle" class="t-ink t-b">從哪一根開始算？</text>`;
    } else if (i === 12) {
      s += cards([["VWAP", "今天所有成交的平均成本（依量加權）"], ["站在哪一邊", "上方：買方平均在賺；下方：賣方掌控"], ["趨勢日", "回測 VWAP 被接住，跌破站不回是警訊"], ["盤整日", "繞著 VWAP 來回，±2σ 邊緣常被拉回"], ["錨定 VWAP", "從事件或高低點開始算，看那之後進場者的成本"]], t, { hl: 0 });
    }
    svg.innerHTML = s;
  }

  /* ---------- 你來操作：點一根 K 棒當錨定起點 ---------- */
  const simHTML = `<div class="btn-row vw-day">${Object.entries(DAYS).map(([k, d]) => `<button class="btn" data-d="${k}" type="button">${d.name}</button>`).join("")}<label class="sp-tts"><input type="checkbox" class="vw-band" checked> 顯示 ±2σ 通道</label></div>
<svg class="fpx vw-svg" viewBox="0 0 640 380" role="img" aria-label="VWAP 練習圖"></svg>
<p class="sim-msg vw-msg" aria-live="polite"></p><ul class="sim-task vw-task"></ul>`;
  function simMount(box) {
    const q = (s) => box.querySelector(s); let key = "trend", anchor = null; const done = {};
    function paint() {
      const b = DAYS[key].bars, w = vwap(b), g = chart(b, { click: true, pad: 2.5 });
      let s = g.s + g.line(w, (r) => r.m, "s-gamma", 3);
      if (q(".vw-band").checked) s += g.line(w, (r) => r.m + 2 * r.sd, "s-sell", 1.5, "3 4") + g.line(w, (r) => r.m - 2 * r.sd, "s-sell", 1.5, "3 4");
      let msg = `<b>${DAYS[key].name}</b>：最後 VWAP ${w[15].m.toFixed(2)}，收盤 ${b[15].c.toFixed(2)}，${b[15].c > w[15].m ? "收在 VWAP 上方（買方平均在賺）" : "收在 VWAP 下方（買方平均在虧）"}。點任何一根 K 棒，從那裡開始畫錨定 VWAP。`;
      if (anchor != null) {
        const aw = vwap(b, anchor);
        s += g.line(aw, (r) => r.m, "s-buy", 3) + `<circle cx="${g.X(anchor)}" cy="${g.Y(b[anchor].l) + 14}" r="6" class="f-buy"/>`;
        msg += `<br>錨定 VWAP 從第 ${anchor + 1} 根開始，目前在 <b>${aw[15].m.toFixed(2)}</b>：從那時候進場的人，平均成本在這裡，${b[15].c > aw[15].m ? "現在平均是賺的。" : "現在平均是虧的。"}`;
        const lowK = b.reduce((m, x, k) => (x.l < b[m].l ? k : m), 0);
        if (anchor === lowK) done.a = true;
      }
      const touched = b.some((x, k) => k > 2 && x.h >= w[k].m + 2 * w[k].sd);
      if (key === "range" && touched) done.b = true;
      if (key === "event" && anchor != null && anchor >= 4 && anchor <= 6) done.c = true;
      q(".vw-svg").innerHTML = s; q(".vw-msg").innerHTML = msg;
      q(".vw-task").innerHTML = [["a", "任務 1：在任一天，把錨定起點放在當天最低點那根 K 棒"], ["b", "任務 2：打開「盤整日」，看價格碰到 +2σ 之後去了哪裡"], ["c", "任務 3：在「事件後反轉」，從大跌後的低點附近開始錨定，比較它和一般 VWAP"]].map(([k, tx]) => `<li class="${done[k] ? "ok" : ""}">${done[k] ? "✓" : "○"} ${tx}</li>`).join("");
    }
    box.addEventListener("click", (e) => {
      const d = e.target.closest("[data-d]"); if (d) { key = d.dataset.d; anchor = null; paint(); return; }
      const g = e.target.closest("[data-b]"); if (g) { anchor = +g.dataset.b; paint(); }
    });
    q(".vw-band").addEventListener("change", paint);
    paint();
  }

  const QS = [
    { fig: `<p class="small q-cap">今天三筆成交：<b>200 元 10 口、210 元 10 口、220 元 30 口</b>。</p>`, q: "VWAP 最接近多少？", step: 2, o: [
      ["210", false, "210 是三個價格的直接平均。220 成交了 30 口，比重最大，VWAP 會被拉高。"],
      ["214", true, "(200×10 ＋ 210×10 ＋ 220×30) ÷ 50 ＝ 10,700 ÷ 50 ＝ 214。"],
      ["220", false, "220 成交最多，但還有另外兩筆比較便宜的成交，平均會低於 220。"]] },
    { fig: `<p class="small q-cap">一整個上午，價格三次回檔到 VWAP 附近都被買上去，始終站在 VWAP 上方。</p>`, q: "這比較像哪一種日子？", step: 7, o: [
      ["趨勢日，買方掌控", true, "價格持續在 VWAP 上方、回測被接住，是買方掌控的趨勢日特徵。"],
      ["盤整日，價格繞著 VWAP 來回", false, "盤整日會在 VWAP 上下穿來穿去，這裡始終在上方。"],
      ["看不出來，VWAP 只能看收盤", false, "VWAP 整天都在更新，盤中就能看出價格站在哪一邊。"]] },
    { fig: `<p class="small q-cap">非農數據公布後價格急跌，之後一路反彈。你想知道「急跌低點之後買進的人」現在是賺是賠。</p>`, q: "最適合用什麼工具？", step: 11, o: [
      ["從今天開盤算的一般 VWAP", false, "一般 VWAP 包含了數據公布前所有人的成本，不是你要的那一群人。"],
      ["從急跌低點那根 K 棒開始的錨定 VWAP", true, "錨定 VWAP 從低點開始算，正好是那之後進場者的平均成本。價格在它上方，代表他們平均是賺的。"],
      ["前一天的 POC", false, "前一天的 POC 跟今天數據公布後的這群買方沒有直接關係。"]] }
  ];

  PAGES["of-vwap"] = window.KIT.page(window.COURSE.OFC, "of-vwap", {
    topic: " VWAP",
    lede: "VWAP 是今天所有成交的平均成本。很多機構用它衡量自己買得好不好，交易者則把它當成「今天的公平價格」。這一關從買菜的平均成本開始，一路教到標準差通道和錨定 VWAP。",
    analogy: [
      ["買菜的平均成本", "分幾次買，價格和數量都不同。買得多的那一次，對平均成本影響最大。這就是<b>加權平均</b>。"],
      ["全場的平均成本", "把今天所有人的成交都算進來，得到的平均成本就是 <b>VWAP</b>。價格在它上方，今天買的人平均在賺。"],
      ["從某一天開始記帳", "如果只想看「某件事發生之後」進場的人，就從那天開始算，這就是<b>錨定 VWAP</b>。"]],
    steps: STEPS, draw, simHTML, simMount,
    simIntro: "選一種日子，點任何一根 K 棒當起點，畫出錨定 VWAP，和一般 VWAP 比較。",
    mist: [
      ["VWAP 就是收盤價的平均", "VWAP 是依成交量加權的平均，而且每根 K 棒用的是代表價格。成交量大的時段影響比較大。"],
      ["價格碰到 VWAP 一定會反彈", "趨勢日常在 VWAP 被接住，但跌破、站不回去也很常見，那往往是趨勢結束的警訊。VWAP 是參考價位，不是保證。"],
      ["+2σ 就一定會回來", "盤整日常會被拉回，但趨勢日價格可以沿著通道外緣走很久。先判斷今天是哪一種日子。"]],
    faq: [
      ["VWAP 每天都從零開始嗎？", "一般的 VWAP 是每個交易時段重新算。注意你的軟體是從哪個時間開始：有的從美股開盤（台灣晚上 9:30 或 10:30）算，有的從 CME 每天重新開盤算，數字會不一樣。"],
      ["VWAP 和移動平均線差在哪？", "移動平均線只看價格，而且只看最近幾根；VWAP 加入了成交量，從時段開始一路累計。"],
      ["標準差通道怎麼算？", "用每根 K 棒的代表價格和 VWAP 的差距，依成交量加權算出分散程度。軟體會自動算，你只要知道「通道越寬，代表今天價格越分散」。"],
      ["錨定 VWAP 要從哪裡開始？", "常見的起點：重要數據公布、明顯的高點或低點、跳空缺口、週一開盤。重點是這個起點有意義，讓你知道是「哪一群人」的成本。"],
      ["VWAP 適合用在哪些時間框？", "一般 VWAP 主要用在當沖（一天之內）。錨定 VWAP 可以跨很多天，用來看波段。"],
      ["TradingView 有 VWAP 嗎？", "有，內建 VWAP（含標準差通道設定）和錨定 VWAP 工具。用期貨的話，確認時段設定和你看的交易時段一致。"]],
    qs: QS,
    gloss: [
      ["VWAP", "成交量加權平均價：今天所有成交的平均成本。"],
      ["代表價格", "每根 K 棒常用 (最高 ＋ 最低 ＋ 收盤) ÷ 3。"],
      ["標準差通道", "VWAP 上下 ±1、±2 個標準差，表示價格離平均多遠。"],
      ["錨定 VWAP", "從指定的 K 棒開始算的 VWAP。"],
      ["趨勢日", "一方掌控，價格大多停在 VWAP 同一邊。"],
      ["盤整日", "沒有一方掌控，價格繞著 VWAP 來回。"]],
    remember: "<b>VWAP 是今天的平均成本。</b>站在哪一邊代表誰掌控；趨勢日看回測，盤整日看通道邊緣，錨定 VWAP 看事件之後的成本。"
  });
})();
