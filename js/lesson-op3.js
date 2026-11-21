/* 路線 2 第 3 關（新版）：Delta 與 Gamma——速度與加速度 */
(function () {
  const PAGES = (window.__PAGES = window.__PAGES || {});
  const { chip, lerp, ease, seg, cards } = window.KIT;
  const B = (F, K, d, iv = 0.2) => window.OF.b76(F, K, iv, Math.max(d, 0.0001) / 365);
  const XF = (lo = 26200, hi = 27800) => (F) => lerp(80, 600, (F - lo) / (hi - lo));
  const fx = (F) => F.toLocaleString();

  function curve(fn, o = {}) {
    const lo = o.lo || 26200, hi = o.hi || 27800, X = XF(lo, hi), ymin = o.ymin == null ? 0 : o.ymin, ymax = o.ymax == null ? 1 : o.ymax;
    const Y = (v) => lerp(o.y1 || 320, o.y0 || 60, (v - ymin) / (ymax - ymin));
    const pts = []; for (let F = lo; F <= hi; F += 10) pts.push(`${X(F).toFixed(1)},${Y(fn(F)).toFixed(1)}`);
    const n = o.upto == null ? pts.length : Math.max(2, Math.round(o.upto * pts.length));
    return { s: `<polyline points="${pts.slice(0, n).join(" ")}" class="${o.cls || "s-buy"} f-none" stroke-width="${o.w || 3}" opacity="${o.op == null ? 1 : o.op}"/>`, X, Y };
  }
  const axis = (X, Y, yl, ticks = [26400, 27000, 27600]) => `<line x1="80" x2="600" y1="${Y(0)}" y2="${Y(0)}" class="s-ink"/>${ticks.map((p) => `<text x="${X(p)}" y="342" text-anchor="middle" class="t-mute">${fx(p)}</text>`).join("")}<text x="80" y="44" class="t-mute">${yl}</text>`;

  const D35 = B(27000, 27300, 7).callDelta.toFixed(2);
  const G7 = B(27000, 27000, 7).gamma, G1 = B(27000, 27000, 1).gamma;

  const STEPS = [
    { cap: "<b>Delta</b>：期貨價格動 1 點，選擇權大約動幾點。價平的 Call，Delta 大約是 <b>0.5</b>：NQ 漲 100 點，它大約漲 50 點。",
      why: "Delta 是選擇權價格對期貨價格的敏感度。價平的時候，到期會不會有價值大約是一半一半，所以 Delta 約 0.5。", stuck: "Delta 像「跟漲的比例」：0.5 就是期貨漲 1 塊，它漲 5 毛。" },
    { cap: "Call 的 Delta 在 <b>0 到 1</b> 之間：深價內接近 1（幾乎跟期貨一樣），遠價外接近 0（幾乎不動）。Put 的 Delta 在 <b>−1 到 0</b>，價格漲時 Put 跌。",
      why: "深價內的 Call 幾乎確定會被履約，所以跟期貨一模一樣地動；遠價外幾乎確定沒價值，期貨動多少都跟它關係不大。", dur: 2600 },
    { cap: "Delta 也可以想成「<b>等於幾口期貨</b>」：10 口價平 Call，Delta 各 0.5，加起來像是 <b>5 口期貨多單</b>。",
      why: "這個換算很重要：造市商就是用它來算要買賣幾口期貨對沖（第 6 關）。" },
    { cap: "換你算：一口 27,300 Call，Delta 約 " + D35 + "。NQ 上漲 100 點。",
      q: { t: "這口 Call 大約漲多少點？", o: [
        ["100 點", false, "那是 Delta 1 的情況。這口 Call 的 Delta 只有 " + D35 + "。"],
        ["約 " + Math.round(D35 * 100) + " 點", true, "100 × " + D35 + " ≈ " + Math.round(D35 * 100) + " 點。Delta 告訴你選擇權大約跟著動多少。"],
        ["35 元", false, "單位是點，不是元。換成錢還要乘上每點 $20。"]] } },
    { cap: "Delta <b>不是固定的</b>：價格往上走，Call 的 Delta 越來越大（越來越像期貨）；往下走越來越小。",
      why: "價格從 26,600 漲到 27,400，27,000 Call 從價外變價平再變價內，Delta 從大約 0.2 一路升到 0.8。", dur: 2600 },
    { cap: "Delta 變化的速度就是 <b>Gamma</b>。如果 Delta 是速度，Gamma 就是<b>加速度</b>：Gamma 大，價格一動，Delta 就變很多。",
      why: "Gamma 在 Delta 曲線最陡的地方最大，也就是價平附近。深價內、遠價外的 Delta 幾乎不變，Gamma 很小。", dur: 2400 },
    { cap: "Gamma 在<b>價平最大</b>，而且<b>越接近到期越尖</b>：剩 1 天的價平 Gamma，大約是剩 7 天的 " + (G1 / G7).toFixed(1) + " 倍。",
      why: "快到期時，價格只要在履約價附近晃一下，選擇權就可能從「幾乎沒價值」變成「有價值」，Delta 會劇烈跳動。這是到期日價格常在大整數附近劇烈拉扯的原因之一。", dur: 2600 },
    { cap: "想一想：同一個商品，有以下幾口選擇權。",
      q: { t: "哪一口的 Gamma 最大？", o: [
        ["遠價外、還有 30 天", false, "遠價外的 Delta 幾乎不變，Gamma 很小；時間還長，也不尖。"],
        ["價平、明天到期", true, "Gamma 在價平最大，而且越接近到期越尖。價平又快到期，Gamma 最大。"],
        ["深價內、還有 30 天", false, "深價內 Delta 接近 1，幾乎不變，Gamma 很小。"]] } },
    { cap: "<b>買</b>選擇權的人是<b>正 Gamma</b>：價格漲，他的 Delta 自動變大（更偏多）；價格跌，Delta 自動變小。價格往哪邊走，部位就自動站到哪一邊。",
      why: "這對買方有利：賺的時候越賺越多，虧的時候越虧越慢。代價是要付時間價值（Theta）。", dur: 2200 },
    { cap: "<b>賣</b>選擇權的人是<b>負 Gamma</b>：價格漲，他的部位越來越偏空；價格跌，越來越偏多。價格往哪邊走，他就越站到反方向。",
      why: "負 Gamma 的人如果想保持中立，就得「追」：價格漲時買進期貨、價格跌時賣出期貨。這個追單的動作，就是後面 GEX 要講的核心。", dur: 2400 },
    { cap: "想一想：一個負 Gamma 的造市商，想維持方向中立。價格突然上漲了。",
      q: { t: "他要怎麼對沖？", o: [
        ["賣出期貨", false, "上漲後，負 Gamma 部位變得更偏空。要回到中立，得買進期貨。"],
        ["買進期貨（追著價格買）", true, "負 Gamma：價格漲，部位變得偏空，所以要買期貨補回來。他的買單會把價格推得更高，這就是負 GEX 會放大波動的原因。"],
        ["什麼都不用做", false, "Delta 已經變了，不調整就不再中立。"]] } },
    { cap: "GEX（Gamma 曝險）就是把每個履約價的 <b>Gamma × 未平倉量</b>加起來，估算造市商整體是正 Gamma 還是負 Gamma、對沖時會買多少賣多少。",
      why: "第 7 關會帶你從選擇權鏈一步一步算出 GEX。現在只要記住：Gamma 越大、未平倉量越多，那個履約價附近的對沖單就越多。" },
    { cap: "整理：<b>Delta</b>＝選擇權跟著期貨動多少，也等於幾口期貨；<b>Gamma</b>＝Delta 變多快，在價平、快到期時最大。買方正 Gamma，賣方負 Gamma。",
      why: "下一關會看選擇權價格的另一個來源：市場預期的波動率（IV）。" }
  ];

  function draw(svg, i, t) {
    const e = ease(t); let s = "";
    if (i === 0) {
      const X = (k) => lerp(120, 560, k), Yf = lerp(260, 120, seg(t, 0.1, 0.7)), Yo = lerp(260, 190, seg(t, 0.1, 0.7));
      s += `<line x1="120" x2="560" y1="260" y2="260" class="s-line"/><rect x="170" y="${Yf}" width="100" height="${260 - Yf}" rx="6" class="f-inkd"/><rect x="390" y="${Yo}" width="100" height="${260 - Yo}" rx="6" class="f-buy"/>`;
      s += `<text x="220" y="290" text-anchor="middle" class="t-ink t-b">NQ 期貨 +100</text><text x="440" y="290" text-anchor="middle" class="t-buy t-b">價平 Call 約 +50</text><text x="320" y="80" text-anchor="middle" class="t-ink t-b t-lg" opacity="${seg(t, 0.6, 1)}">Delta ≈ 0.5</text>`;
    } else if (i === 1) {
      const c = curve((F) => B(F, 27000, 7).callDelta, { ymin: -1, ymax: 1, upto: seg(t, 0, 0.5) });
      const p = curve((F) => B(F, 27000, 7).putDelta, { ymin: -1, ymax: 1, upto: seg(t, 0.4, 0.9), cls: "s-sell" });
      s += axis(c.X, c.Y, "Delta（27,000 履約價、7 天）") + c.s + p.s + `<text x="590" y="${c.Y(1) + 16}" text-anchor="end" class="t-buy t-b">Call → 1</text><text x="90" y="${c.Y(-1) - 6}" class="t-sell t-b" opacity="${seg(t, 0.7, 1)}">Put → −1</text><text x="72" y="${c.Y(0) + 4}" text-anchor="end" class="t-mute">0</text>`;
    } else if (i === 2) {
      for (let k = 0; k < 10; k++) s += `<rect x="${70 + (k % 5) * 44}" y="${110 + Math.floor(k / 5) * 60}" width="36" height="50" rx="5" class="f-buy-soft" opacity="${seg(t, k * 0.04, k * 0.04 + 0.1)}"/><text x="${88 + (k % 5) * 44}" y="${140 + Math.floor(k / 5) * 60}" text-anchor="middle" class="t-buy t-b">0.5</text>`;
      s += `<text x="70" y="90" class="t-ink t-b">10 口價平 Call</text><g opacity="${seg(t, 0.5, 1)}"><text x="300" y="175" class="t-ink t-b t-xl">＝</text>${[0, 1, 2, 3, 4].map((k) => `<rect x="${350 + k * 46}" y="140" width="38" height="56" rx="5" class="f-inkd"/>`).join("")}<text x="350" y="230" class="t-ink t-b">約等於 5 口期貨多單</text></g>`;
    } else if (i === 3) {
      const c = curve((F) => B(F, 27300, 7).callDelta, { ymin: 0, ymax: 1 });
      s += axis(c.X, c.Y, "27,300 Call 的 Delta（7 天）") + c.s + `<circle cx="${c.X(27000)}" cy="${c.Y(+D35)}" r="7" class="f-hl"/><text x="${c.X(27000) - 10}" y="${c.Y(+D35) - 12}" text-anchor="end" class="t-gamma t-b">現價 27,000：Delta ${D35}</text>`;
    } else if (i === 4) {
      const c = curve((F) => B(F, 27000, 7).callDelta, { ymin: 0, ymax: 1 });
      const F = lerp(26600, 27400, ease(seg(t, 0.1, 0.9))), dv = B(F, 27000, 7).callDelta;
      s += axis(c.X, c.Y, "27,000 Call 的 Delta（7 天）") + c.s + `<circle cx="${c.X(F)}" cy="${c.Y(dv)}" r="8" class="f-buy"/><text x="${c.X(F)}" y="${c.Y(dv) - 14}" text-anchor="middle" class="t-ink t-b">${fx(Math.round(F / 25) * 25)}：${dv.toFixed(2)}</text>`;
    } else if (i === 5) {
      const c = curve((F) => B(F, 27000, 7).callDelta, { ymin: 0, ymax: 1, op: 0.5 });
      const g = curve((F) => B(F, 27000, 7).gamma * 1e4, { ymin: 0, ymax: 16, cls: "s-gamma", upto: seg(t, 0.2, 0.9) });
      s += axis(c.X, c.Y, "藍：Delta　綠：Gamma（Delta 的變化速度）") + c.s + g.s + `<text x="${c.X(27000)}" y="${g.Y(G7 * 1e4) - 12}" text-anchor="middle" class="t-gamma t-b" opacity="${seg(t, 0.7, 1)}">Delta 最陡的地方，Gamma 最大</text>`;
    } else if (i === 6 || i === 7) {
      const D = [[30, "s-ink", 0.45], [7, "s-gamma", 0.8], [1, "s-sell", 1]];
      let X0, Y0;
      D.forEach(([d, c, op], k) => { const g = curve((F) => B(F, 27000, d).gamma * 1e4, { ymin: 0, ymax: 16, cls: c, op: i === 7 ? op : op * seg(t, k * 0.25, k * 0.25 + 0.3) }); X0 = g.X; Y0 = g.Y; s += g.s + `<text x="${g.X(27000) + 10}" y="${g.Y(B(27000, 27000, d).gamma * 1e4) - 6}" class="${c.replace("s-", "t-")} t-b" opacity="${i === 7 ? 1 : seg(t, k * 0.25, k * 0.25 + 0.3)}">${d} 天</text>`; });
      s = axis(X0, Y0, "27,000 的 Gamma：越接近到期越尖") + s;
      if (i === 7) s += chip(470, 120, "哪一口 Gamma 最大？", "hl");
    } else if (i === 8 || i === 9) {
      const buy = i === 8, X = (k) => lerp(140, 520, k / 4);
      const F = [26600, 26800, 27000, 27200, 27400], d = F.map((x) => B(x, 27000, 7).callDelta * (buy ? 1 : -1));
      s += `<line x1="100" x2="560" y1="200" y2="200" class="s-ink"/><text x="100" y="60" class="t-ink t-b">${buy ? "買 Call：正 Gamma" : "賣 Call：負 Gamma"}（部位的 Delta）</text>`;
      F.forEach((p, k) => { const h = d[k] * 120 * seg(t, k * 0.12, k * 0.12 + 0.3); s += `<rect x="${X(k) - 22}" y="${Math.min(200, 200 - h)}" width="44" height="${Math.abs(h)}" rx="4" class="${h >= 0 ? "f-buy" : "f-sell"}"/><text x="${X(k)}" y="${h >= 0 ? 194 - h : 216 - h}" text-anchor="middle" class="t-ink t-b">${d[k] > 0 ? "+" : ""}${d[k].toFixed(2)}</text><text x="${X(k)}" y="340" text-anchor="middle" class="t-mute">${fx(p)}</text>`; });
      s += `<text x="560" y="${buy ? 80 : 330}" text-anchor="end" class="${buy ? "t-buy" : "t-sell"} t-b" opacity="${seg(t, 0.7, 1)}">${buy ? "價格漲 → 越來越偏多" : "價格漲 → 越來越偏空"}</text>`;
    } else if (i === 10) {
      s += `<text x="80" y="80" class="t-ink t-b t-lg">負 Gamma 的造市商，價格突然上漲</text><text x="80" y="120" class="t-ink">他的部位變得更偏空了</text><text x="80" y="170" class="t-ink t-b t-lg">要維持中立，該怎麼做？</text>`;
      s += `<path d="M420 260 L520 160" class="s-buy" stroke-width="4"/><path d="M520 160 l-14 2 l10 10 z" class="f-buy"/><text x="430" y="290" class="t-buy t-b">價格 ↑</text>`;
    } else if (i === 11) {
      const R = [["Gamma", "每口選擇權的 Delta 變化速度"], ["× 未平倉量", "這個履約價有多少口還沒平倉"], ["× 合約大小、價格", "換算成美元"], ["＝ GEX", "這個履約價附近的對沖單有多大"]];
      R.forEach((r, k) => { s += `<g opacity="${seg(t, k * 0.2, k * 0.2 + 0.3)}"><rect x="${30 + k * 152}" y="140" width="140" height="96" rx="12" class="${k === 3 ? "f-gamma-soft" : "f-surface"} s-line"/><text x="${100 + k * 152}" y="178" text-anchor="middle" class="t-ink t-b">${r[0]}</text><text x="${100 + k * 152}" y="204" text-anchor="middle" class="t-mute">${r[1].slice(0, 8)}</text><text x="${100 + k * 152}" y="222" text-anchor="middle" class="t-mute">${r[1].slice(8)}</text></g>`; });
    } else if (i === 12) {
      s += cards([["Delta", "期貨動 1 點，選擇權動幾點；也等於幾口期貨"], ["Delta 會變", "價格往上，Call 的 Delta 變大"], ["Gamma", "Delta 變多快：價平、快到期時最大"], ["買方", "正 Gamma：價格往哪走，部位自動站哪邊"], ["賣方", "負 Gamma：要追著價格對沖"]], t, { hl: 4 });
    }
    svg.innerHTML = s;
  }

  /* ---------- 你來操作 ---------- */
  const simHTML = `<div class="controls"><div class="ctl"><label>NQ 現價 <b class="d3-f-v"></b></label><input class="d3-f" type="range" min="26400" max="27600" step="25" value="27000"></div><div class="ctl"><label>離到期 <b class="d3-d-v"></b></label><input class="d3-d" type="range" min="0.25" max="30" step="0.25" value="7"></div><div class="ctl"><label>口數（賣出為負）<b class="d3-n-v"></b></label><input class="d3-n" type="range" min="-10" max="10" step="1" value="-10"></div></div>
<svg class="fpx d3-svg" viewBox="0 0 640 380" role="img" aria-label="Delta 與 Gamma"></svg><div class="d3-out"></div><ul class="sim-task d3-task"></ul>`;
  function simMount(box) {
    const q = (s) => box.querySelector(s); const done = {};
    function paint() {
      const F = +q(".d3-f").value, d = +q(".d3-d").value, n = +q(".d3-n").value, r = B(F, 27000, d);
      q(".d3-f-v").textContent = fx(F); q(".d3-d-v").textContent = d < 1 ? Math.round(d * 24) + " 小時" : d + " 天"; q(".d3-n-v").textContent = (n > 0 ? "買 " : n < 0 ? "賣 " : "") + Math.abs(n) + " 口";
      const c = curve((x) => B(x, 27000, d).callDelta, { ymin: 0, ymax: 1 }), g = curve((x) => B(x, 27000, d).gamma * 1e4, { ymin: 0, ymax: 30, cls: "s-gamma" });
      q(".d3-svg").innerHTML = axis(c.X, c.Y, "藍：27,000 Call 的 Delta　綠：Gamma") + c.s + g.s + `<line x1="${c.X(F)}" x2="${c.X(F)}" y1="60" y2="320" class="s-ink" stroke-dasharray="4 4"/><circle cx="${c.X(F)}" cy="${c.Y(r.callDelta)}" r="7" class="f-buy"/><circle cx="${c.X(F)}" cy="${g.Y(r.gamma * 1e4)}" r="7" class="f-hl"/>`;
      const pos = n * r.callDelta, hedge = -pos;
      q(".d3-out").innerHTML = `<p>Delta <b>${r.callDelta.toFixed(2)}</b>　Gamma <b>${(r.gamma * 1e4).toFixed(2)}</b>（每 1 萬點）</p><p>你的部位：${n > 0 ? "買" : n < 0 ? "賣" : "沒有"} ${Math.abs(n)} 口 → 等於 <b>${pos > 0 ? "+" : ""}${pos.toFixed(1)} 口期貨</b>${n ? `；要中立需要${hedge > 0 ? "買進" : "賣出"} <b>${Math.abs(hedge).toFixed(1)}</b> 口期貨` : ""}。${n < 0 ? "（負 Gamma：價格漲，你需要買更多。）" : n > 0 ? "（正 Gamma）" : ""}</p>`;
      if (d <= 1 && Math.abs(F - 27000) <= 25 && r.gamma * 1e4 > 12) done.a = true;
      if (n < 0 && F >= 27300) done.b = true;
      if (r.callDelta > 0.9) done.c = true;
      q(".d3-task").innerHTML = [["a", "任務 1：讓 Gamma 超過 12（提示：價平、快到期）"], ["b", "任務 2：賣出選擇權後把價格往上拉，看要買的期貨口數怎麼變多"], ["c", "任務 3：讓 Delta 超過 0.9，這時選擇權幾乎跟期貨一樣"]].map(([k, tx]) => `<li class="${done[k] ? "ok" : ""}">${done[k] ? "✓" : "○"} ${tx}</li>`).join("");
    }
    box.addEventListener("input", paint); paint();
  }

  const QS = [
    { fig: `<p class="small q-cap">你買了 4 口 Delta 0.6 的 Call。</p>`, q: "這個部位大約等於幾口期貨？", step: 3, o: [
      ["2.4 口期貨多單", true, "4 × 0.6 ＝ 2.4，相當於 2.4 口期貨多單。"],
      ["4 口期貨多單", false, "每口 Call 的 Delta 只有 0.6，不是 1。"],
      ["0.6 口", false, "0.6 是一口的 Delta，4 口要乘上 4。"]] },
    { fig: `<p class="small q-cap">明天到期，NQ 現在就在 27,000 附近。</p>`, q: "27,000 這個履約價的選擇權有什麼特性？", step: 7, o: [
      ["Gamma 很大，價格一動，Delta 就劇烈變化", true, "價平又快到期，Gamma 最大。造市商要頻繁大量調整對沖，價格常在這附近拉扯。"],
      ["Gamma 很小，幾乎不受影響", false, "快到期的價平 Gamma 是最大的。"],
      ["Delta 一定是 1", false, "價平的 Delta 大約是 0.5，而且會隨價格劇烈變化。"]] },
    { fig: `<p class="small q-cap">一個大型造市商賣出了大量價平 Call 和 Put，整體是負 Gamma。價格開始下跌。</p>`, q: "他維持中立的對沖動作，會對價格造成什麼影響？", step: 11, o: [
      ["他會買進期貨，讓下跌減緩", false, "負 Gamma 在下跌時部位變得偏多，要賣出期貨才能回到中立。"],
      ["他會賣出期貨，讓下跌加速", true, "負 Gamma：價格跌，部位偏多，要賣期貨對沖。這些賣單會把價格推得更低，放大波動。"],
      ["沒有影響", false, "大型造市商的對沖量可能很大，會影響價格。"]] }
  ];

  PAGES["op-3"] = window.KIT.page(window.COURSE.OPC, "op-3", {
    topic: " Delta 與 Gamma",
    lede: "Delta 告訴你選擇權跟著期貨動多少，Gamma 告訴你這個比例變得多快。這兩個數字是理解造市商為什麼要追著價格對沖、GEX 從哪裡來的關鍵。",
    analogy: [
      ["跟漲的比例", "<b>Delta</b> 0.5 就像「期貨漲 1 塊，它漲 5 毛」。"],
      ["油門和加速度", "Delta 是速度，<b>Gamma</b> 是加速度：Gamma 大，一點點價格變化就讓 Delta 變很多。"],
      ["跟著人群走", "正 Gamma 的人會自動站到價格走的那一邊；負 Gamma 的人只能<b>追著價格跑</b>。"]],
    steps: STEPS, draw, simHTML, simMount,
    simIntro: "調整現價、離到期天數和口數，看 Delta、Gamma 怎麼變，以及要買賣幾口期貨才能保持中立。",
    mist: [
      ["Delta 是固定的", "Delta 會隨價格和時間改變。價格往上，Call 的 Delta 變大；越接近到期，價平附近的 Delta 變得越快。"],
      ["Gamma 越大越好", "對買方，Gamma 大代表行情來時賺得快，但時間價值也流失得快。對賣方，Gamma 大代表對沖壓力大。"],
      ["選擇權跟期貨動的點數一樣", "只有 Delta 接近 1 的深價內才差不多。價平大約只動一半，價外動得更少。"]],
    faq: [
      ["Put 的 Delta 為什麼是負的？", "價格上漲時 Put 的價值下跌，所以 Delta 是負的。買一口 Delta −0.4 的 Put，大約等於 0.4 口期貨空單。"],
      ["Gamma 的單位是什麼？", "每 1 點價格變化，Delta 會變多少。NQ 的數字很小，所以這裡乘上 1 萬方便閱讀。"],
      ["Delta 和「到期會變價內的機率」一樣嗎？", "大約接近，常被拿來當粗略的參考，但嚴格來說不一樣。這套課程只把 Delta 當成「跟著動的比例」。"],
      ["為什麼快到期時 Gamma 這麼大？", "剩下的時間很少，價格只要在履約價附近晃一下，選擇權就會在「有價值」和「沒價值」之間跳來跳去，Delta 變得很劇烈。"],
      ["造市商一定是負 Gamma 嗎？", "不一定。一般假設是大眾買選擇權、造市商賣，所以造市商偏負 Gamma；但實際部位看不到，這只是 GEX 計算的常見假設（第 7 關會說明）。"],
      ["還有其他希臘字母嗎？", "有：Theta（時間）、Vega（波動率）是前後兩關的主題；Vanna、Charm 是 Delta 隨波動率和時間的變化，第 9 關會講。"]],
    qs: QS,
    gloss: [
      ["Delta", "期貨價格動 1 點，選擇權大約動幾點；也等於幾口期貨。"],
      ["Gamma", "Delta 變化的速度，在價平、快到期時最大。"],
      ["正 Gamma", "買選擇權的一方：價格往哪走，部位自動站哪邊。"],
      ["負 Gamma", "賣選擇權的一方：要追著價格對沖。"],
      ["Delta 對沖", "買賣期貨，讓整個部位的 Delta 接近 0。"],
      ["GEX", "Gamma × 未平倉量加總，估算對沖單的大小。"]],
    remember: "<b>Delta 是速度，Gamma 是加速度。</b>Gamma 在價平、快到期時最大；賣方是負 Gamma，要追著價格對沖。"
  });
})();
