/* 路線 2 第 9 關（新）：Vanna 與 Charm——IV 和時間也會逼市商買賣 */
(function () {
  const PAGES = (window.__PAGES = window.__PAGES || {});
  const { lerp, ease, seg, cards, chip } = window.KIT;
  const { B, fx, sg, frame } = window.OPK;

  const N = 10000, K = 26700;
  const pd = (iv, d) => B(27000, K, d, iv).putDelta;
  const D0 = pd(0.2, 7), Div = pd(0.17, 7), Dt = pd(0.2, 6), Dup = pd(0.24, 7);
  const H0 = Math.round(-D0 * N), Hiv = Math.round(-Div * N), Ht = Math.round(-Dt * N), Hup = Math.round(-Dup * N);

  const FD = frame({ lo: 10, hi: 35, ymin: -0.5, ymax: 0, y0: 70, y1: 320, base: 0, tf: (v) => v + "%" });
  function putDeltaPic(t, o = {}) {
    let s = `<text x="80" y="54" class="t-mute">26,700 Put 的 Delta 隨 IV 變化（現價 27,000、7 天）</text>` + [10, 15, 20, 25, 30, 35].map((v) => `<text x="${FD.X(v)}" y="342" text-anchor="middle" class="t-mute">${v}%</text>`).join("");
    s += `<line x1="80" x2="600" y1="${FD.Y(0)}" y2="${FD.Y(0)}" class="s-line"/>` + [0, -0.2, -0.4].map((v) => `<text x="74" y="${FD.Y(v) + 4}" text-anchor="end" class="t-mute">${v}</text>`).join("");
    s += FD.fn((iv) => pd(iv / 100, 7), "s-sell", 3, seg(t, 0, 0.5), 0.5);
    const pt = (iv, cls, lab, dy, op) => `<g opacity="${op}"><circle cx="${FD.X(iv)}" cy="${FD.Y(pd(iv / 100, 7))}" r="7" class="${cls}"/><text x="${FD.X(iv) + (dy < 0 ? -12 : 12)}" y="${FD.Y(pd(iv / 100, 7)) + 5}" text-anchor="${dy < 0 ? "end" : "start"}" class="${cls === "f-buy" ? "t-buy" : "t-ink"} t-b">${lab}</text></g>`;
    s += pt(20, "f-inkd", "IV 20%：" + D0.toFixed(2), 1, seg(t, 0.4, 0.6)) + pt(17, "f-buy", "IV 17%：" + Div.toFixed(2), -1, seg(t, 0.6, 0.8));
    s += `<text x="${FD.X(13)}" y="${FD.Y(-0.06)}" class="t-buy t-b" opacity="${seg(t, 0.8, 1)}">IV 越低，越靠近 0</text>`;
    return s;
  }
  // 對沖口數比較
  function hedgePic(a, b, t, labA, labB, verb) {
    const mx = Math.max(a, b) * 1.15, h = (v) => (v / mx) * 220;
    const hb = lerp(h(a), h(b), ease(seg(t, 0.3, 0.8)));
    let s = `<line x1="120" x2="540" y1="310" y2="310" class="s-ink"/><rect x="170" y="${310 - h(a)}" width="110" height="${h(a)}" rx="6" class="f-sell-soft"/><text x="225" y="${300 - h(a)}" text-anchor="middle" class="t-sell t-b">空 ${fx(a)} 口</text><text x="225" y="336" text-anchor="middle" class="t-ink t-b">${labA}</text>`;
    s += `<rect x="380" y="${310 - hb}" width="110" height="${hb}" rx="6" class="f-sell-soft"/><text x="435" y="${300 - hb}" text-anchor="middle" class="t-sell t-b" opacity="${seg(t, 0.7, 1)}">空 ${fx(b)} 口</text><text x="435" y="336" text-anchor="middle" class="t-ink t-b">${labB}</text>`;
    const diff = b - a;
    s += `<g opacity="${seg(t, 0.75, 1)}">${chip(330, 70, diff < 0 ? `買回 ${fx(-diff)} 口期貨` : diff > 0 ? `再賣 ${fx(diff)} 口期貨` : "沒有變化", diff < 0 ? "buy" : diff > 0 ? "sell" : "hl")}</g>`;
    if (verb) s += `<text x="120" y="50" class="t-mute">${verb}</text>`;
    return s;
  }
  const FT = frame({ lo: 0, hi: 30, ymin: -0.5, ymax: 0, y0: 70, y1: 320, base: 0, tf: (d) => d + " 天" });
  function charmPic(t) {
    let s = `<text x="80" y="54" class="t-mute">26,700 Put 的 Delta 隨時間（價格一直在 27,000、IV 不變）</text><line x1="80" x2="600" y1="${FT.Y(0)}" y2="${FT.Y(0)}" class="s-line"/>`;
    [0, 7, 14, 21, 30].forEach((d) => { s += `<text x="${FT.X(30 - d)}" y="342" text-anchor="middle" class="t-mute">${d === 0 ? "到期" : "剩 " + d + " 天"}</text>`; });
    const pts = []; for (let u = 0; u <= 29.9; u += 0.25) pts.push([FT.X(u), FT.Y(B(27000, K, 30 - u).putDelta)]);
    s += `<polyline points="${pts.slice(0, Math.max(2, Math.round(ease(t) * pts.length))).map((p) => p.map((v) => v.toFixed(1)).join(",")).join(" ")}" class="s-sell f-none" stroke-width="3"/>`;
    [-0.4, -0.2, 0].forEach((v) => { s += `<text x="74" y="${FT.Y(v) + 4}" text-anchor="end" class="t-mute">${v}</text>`; });
    return s;
  }

  const STEPS = [
    { cap: "第 3 關：價格動，Delta 會變（Gamma）。但 Delta 還會因為另外兩件事變：<b>IV 變了</b>（Vanna）、<b>時間過了</b>（Charm）。價格完全沒動，市商也可能被迫買賣。",
      why: "市商的帳本只看 Delta。不管 Delta 為什麼變，只要變了，他就得調整期貨。", stuck: "想成溫度計和時鐘：就算你站著不動，天氣變了、時間過了，你也得換衣服。" },
    { cap: "<b>Vanna</b>：IV 變了，Delta 跟著變多少。IV 下降時，價外 Put 的 Delta 會<b>變小（靠近 0）</b>：比較不可能跌到那裡了。",
      why: "IV 低代表市場預期波動小，價格跌到遠處的機會變小，價外 Put 就更不像期貨空單。", dur: 3200 },
    { cap: "例子：客戶買了 10,000 口 26,700 Put 當保險，市商賣給他。這個 Put 的 Delta 約 " + D0.toFixed(2) + "，市商賣 Put 等於偏多 " + fx(H0) + " 口，所以<b>空 " + fx(H0) + " 口期貨</b>對沖。",
      why: "賣 Put 的人，價格跌會虧，所以部位偏多；要用期貨空單抵銷。" },
    { cap: "CPI 公布、沒有意外，IV 從 20% 掉到 17%。Put 的 Delta 變成 " + Div.toFixed(2) + "，市商只需要空 " + fx(Hiv) + " 口：<b>要買回 " + fx(H0 - Hiv) + " 口期貨</b>。價格沒動，卻多了買盤。",
      why: "這就是常聽到的「事件後 IV 下降帶動上漲」：市商回補空單，替價格加了一股向上的力量。", dur: 3000 },
    { cap: "反過來想：市場恐慌，IV 從 20% 衝到 24%。",
      q: { t: "賣出這些 Put 的市商會怎麼做？", o: [
        ["再賣出更多期貨，跌勢可能加速", true, "IV 上升，價外 Put 的 Delta 變大（約 " + Dup.toFixed(2) + "），市商要空到約 " + fx(Hup) + " 口，多賣 " + fx(Hup - H0) + " 口。下跌常伴隨 IV 上升，所以 Vanna 會放大跌勢。"],
        ["買回期貨", false, "IV 下降才是買回。IV 上升，Put 更像空單，市商要賣更多。"],
        ["不用動，價格沒變", false, "價格沒變，但 Delta 因為 IV 變了，帳本已經不是 0。"]] } },
    { cap: "<b>Charm</b>：時間過去，Delta 跟著變多少。價外選擇權隨著到期接近，Delta 會慢慢<b>流向 0</b>：剩下的時間不夠讓它變成價內了。",
      why: "到期那一刻，價外的選擇權一定歸零，Delta 也是 0。在那之前，它每天都在往 0 靠近。", dur: 3200 },
    { cap: "同一批 Put，IV 不變，只是<b>過了一天</b>：Delta 從 " + D0.toFixed(2) + " 變成 " + Dt.toFixed(2) + "，市商只需要空 " + fx(Ht) + " 口，<b>買回 " + fx(H0 - Ht) + " 口</b>。每天都有這種慢慢的買盤。",
      why: "Charm 的量通常比 Vanna 小，但每天都有，越接近到期越明顯。", dur: 2600 },
    { cap: "想一想：月結算週，客戶手上有大量價外 Put（市商是賣方），沒有重大消息。",
      q: { t: "Charm 帶來的對沖流量大概是什麼方向？", o: [
        ["每天都有買回期貨的小買盤", true, "價外 Put 的 Delta 隨時間流向 0，市商的期貨空單越來越多餘，就會慢慢買回。"],
        ["每天都有賣壓", false, "那是 Delta 變大的情況。價外 Put 隨時間 Delta 變小。"],
        ["沒有任何流量", false, "時間一過 Delta 就會變，市商必須調整。"]] } },
    { cap: "把兩個放在一起：事件後 IV 下降（Vanna）＋時間流逝（Charm），常常讓市商<b>持續買回</b>。這也是月結算前市場常常穩穩上漲的原因之一。",
      why: "結算一過，那批 Put 消失，這股支撐也跟著不見。所以結算後幾天有時會變得比較弱。" },
    { cap: "要誠實：這些都建立在「客戶買 Put、市商賣 Put」的假設上，數字是估計。Vanna 和 Charm 是<b>背景力量</b>，不是單獨的進場訊號。",
      why: "新聞、大單、Gamma 都可能蓋過它們。用它們來理解「為什麼盤勢這樣走」，比拿來預測下一根 K 線實際。" },
    { cap: "整理：<b>Vanna</b>＝IV 變了 Delta 變多少，IV 降市商買回、IV 升市商加賣；<b>Charm</b>＝時間過了 Delta 變多少，價外的 Delta 慢慢流向 0，市商慢慢買回。",
      why: "下一關把 Gamma 畫成一張地形圖，用一顆球看價格會被拉回還是推走。" }
  ];

  function draw(svg, i, t) {
    let s = "";
    if (i === 0) s += cards([["價格變了", "Delta 變 → Gamma（第 3 關）"], ["IV 變了", "Delta 變 → Vanna"], ["時間過了", "Delta 變 → Charm"], ["結果", "只要 Delta 變，市商就得買賣期貨"]], t, { hl: 3 });
    else if (i === 1) s += putDeltaPic(t);
    else if (i === 2) {
      s += `<rect x="70" y="110" width="200" height="140" rx="14" class="f-sell-soft"/><text x="170" y="150" text-anchor="middle" class="t-ink t-b">賣出 10,000 口</text><text x="170" y="176" text-anchor="middle" class="t-ink">26,700 Put</text><text x="170" y="214" text-anchor="middle" class="t-buy t-b">偏多 ${fx(H0)} 口</text>`;
      s += `<g opacity="${seg(t, 0.4, 0.8)}"><text x="320" y="186" text-anchor="middle" class="t-ink t-xl">＋</text><rect x="370" y="110" width="200" height="140" rx="14" class="f-surface s-line"/><text x="470" y="160" text-anchor="middle" class="t-ink t-b">期貨</text><text x="470" y="200" text-anchor="middle" class="t-sell t-b">空 ${fx(H0)} 口</text></g><text x="320" y="310" text-anchor="middle" class="t-gamma t-b t-lg" opacity="${seg(t, 0.8, 1)}">總 Delta ＝ 0</text>`;
    } else if (i === 3) s += hedgePic(H0, Hiv, t, "IV 20%", "IV 17%", "價格一直在 27,000，只有 IV 變了");
    else if (i === 4) s += hedgePic(H0, Hup, 0.6, "IV 20%", "IV 24%？", "恐慌：IV 上升") + chip(330, 70, "市商怎麼做？", "hl");
    else if (i === 5) s += charmPic(t);
    else if (i === 6) s += hedgePic(H0, Ht, t, "今天", "明天", "價格和 IV 都沒變，只過了一天");
    else if (i === 7) s += charmPic(1) + chip(400, 120, "流量方向？", "hl");
    else if (i === 8) {
      const X = (k) => lerp(90, 590, k);
      s += `<text x="90" y="50" class="t-mute">示意：事件後到月結算</text><line x1="90" x2="590" y1="300" y2="300" class="s-ink"/>`;
      const pts = []; for (let k = 0; k <= 80; k++) { const u = k / 80; pts.push([X(u), 250 - (u < 0.75 ? u * 160 : 120 - (u - 0.75) * 300) + 8 * Math.sin(u * 40)]); }
      s += `<polyline points="${pts.slice(0, Math.max(2, Math.round(ease(t) * pts.length))).map((p) => p.map((v) => v.toFixed(1)).join(",")).join(" ")}" class="s-ink f-none" stroke-width="2.5"/>`;
      s += `<line x1="${X(0.1)}" x2="${X(0.1)}" y1="70" y2="300" class="s-sell" stroke-dasharray="4 4"/><text x="${X(0.1) + 6}" y="86" class="t-sell t-b">事件：IV 下降</text><line x1="${X(0.75)}" x2="${X(0.75)}" y1="70" y2="300" class="s-gamma" stroke-dasharray="4 4" opacity="${seg(t, 0.6, 0.8)}"/><text x="${X(0.75) - 6}" y="86" text-anchor="end" class="t-gamma t-b" opacity="${seg(t, 0.6, 0.8)}">月結算</text>`;
      s += `<text x="${X(0.42)}" y="320" text-anchor="middle" class="t-buy t-b" opacity="${seg(t, 0.3, 0.6)}">Vanna＋Charm：市商買回</text><text x="${X(0.88)}" y="320" text-anchor="middle" class="t-mute" opacity="${seg(t, 0.85, 1)}">支撐消失</text>`;
    } else if (i === 9) s += cards([["假設", "客戶買 Put、市商賣 Put"], ["量", "估計值，看不到真實部位"], ["角色", "背景力量，不是進場訊號"], ["會被蓋過", "新聞、大單、Gamma"]], t, { hl: 2 });
    else s += cards([["Vanna", "IV 變 → Delta 變"], ["IV 下降", "價外 Put Delta 變小，市商買回"], ["IV 上升", "價外 Put Delta 變大，市商加賣"], ["Charm", "時間過 → 價外 Delta 流向 0"], ["月結算前", "常有持續的買回；結算後消失"]], t, { hl: 0 });
    svg.innerHTML = s;
  }

  const simHTML = `<div class="controls"><div class="ctl"><label>IV（原本 20%）<b class="vc-iv-v"></b></label><input class="vc-iv" type="range" min="12" max="32" step="0.5" value="20"></div><div class="ctl"><label>過了幾天（原本剩 7 天）<b class="vc-d-v"></b></label><input class="vc-d" type="range" min="0" max="6.5" step="0.5" value="0"></div><div class="ctl"><label>市商賣出的 26,700 Put <b class="vc-n-v"></b></label><input class="vc-n" type="range" min="2000" max="30000" step="1000" value="10000"></div></div>
<svg class="fpx vc-svg" viewBox="0 0 640 380" role="img" aria-label="市商期貨對沖變化"></svg><div class="vc-out kpi-row"></div><ul class="sim-task vc-task"></ul>`;
  function simMount(box) {
    const q = (s) => box.querySelector(s); const done = {};
    function paint() {
      const iv = +q(".vc-iv").value / 100, dp = +q(".vc-d").value, n = +q(".vc-n").value;
      q(".vc-iv-v").textContent = (iv * 100).toFixed(1) + "%"; q(".vc-d-v").textContent = dp + " 天"; q(".vc-n-v").textContent = fx(n) + " 口";
      const h0 = Math.round(-pd(0.2, 7) * n), h1 = Math.round(-pd(iv, 7 - dp) * n), hv = Math.round(-pd(iv, 7) * n), diff = h1 - h0;
      q(".vc-svg").innerHTML = hedgePic(h0, h1, 1, "原本", "現在", "市商的期貨空單（價格固定 27,000）");
      q(".vc-out").innerHTML = `<div><span class="t1">Put Delta</span><b>${pd(iv, 7 - dp).toFixed(3)}</b></div><div><span class="t1">IV 造成（Vanna）</span><b class="${hv - h0 > 0 ? "gx-neg" : "gx-pos"}">${hv - h0 > 0 ? "賣 " : "買 "}${fx(Math.abs(hv - h0))}</b></div><div><span class="t1">時間造成（Charm）</span><b class="${h1 - hv > 0 ? "gx-neg" : "gx-pos"}">${h1 - hv > 0 ? "賣 " : "買 "}${fx(Math.abs(h1 - hv))}</b></div><div><span class="t1">合計</span><b class="${diff > 0 ? "gx-neg" : "gx-pos"}">${diff > 0 ? "賣 " : "買 "}${fx(Math.abs(diff))} 口</b></div>`;
      if (iv <= 0.16 && dp === 0) done.a = true; if (iv >= 0.26) done.b = true; if (iv === 0.2 && dp >= 5) done.c = true;
      q(".vc-task").innerHTML = [["a", "任務 1：只把 IV 降到 16% 以下（時間不動），看市商買回多少"], ["b", "任務 2：把 IV 拉到 26% 以上，看市商要多賣多少"], ["c", "任務 3：IV 放回 20%，只讓時間過 5 天以上，看 Charm 的量"]].map(([k, tx]) => `<li class="${done[k] ? "ok" : ""}">${done[k] ? "✓" : "○"} ${tx}</li>`).join("");
    }
    box.addEventListener("input", paint); paint();
  }

  const QS = [
    { fig: `<p class="small q-cap">FOMC 結束、沒有意外，IV 大跌。市場上客戶持有大量價外 Put，市商是賣方。</p>`, q: "Vanna 帶來的對沖流量是？", step: 4, o: [
      ["市商買回期貨，形成買盤", true, "IV 下降，價外 Put 的 Delta 變小，市商的期貨空單多了，要買回。"],
      ["市商加賣期貨", false, "那是 IV 上升的情況。"],
      ["沒影響，價格沒動", false, "Delta 會因為 IV 改變，不需要價格動。"]] },
    { fig: `<p class="small q-cap">一口價外 Call，價格和 IV 都沒變，又過了 3 天。</p>`, q: "它的 Delta 會怎樣？", step: 6, o: [
      ["變小，慢慢流向 0", true, "價外選擇權的 Delta 會隨時間流向 0，這就是 Charm。"],
      ["變大，慢慢流向 1", false, "那是價內選擇權的方向。"],
      ["不變", false, "時間一過，Delta 就會變。"]] },
    { fig: `<p class="small q-cap">有人說：「Vanna 是買盤，所以 IV 一跌我就馬上做多。」</p>`, q: "這個做法哪裡有問題？", step: 10, o: [
      ["Vanna 只是背景力量，可能被新聞、大單蓋過，不能單獨當進場訊號", true, "而且它建立在部位假設上，量也只是估計。"],
      ["沒有問題，Vanna 一定會讓價格上漲", false, "沒有任何單一力量一定贏。"],
      ["Vanna 是賣壓，應該做空", false, "IV 下降時是買回，方向說反了。"]] }
  ];

  PAGES["op-vc"] = window.KIT.page(window.COURSE.OPC, "op-vc", {
    topic: "Vanna 與 Charm",
    lede: "就算價格完全沒動，IV 變了或時間過了，選擇權的 Delta 也會變，市商一樣得買賣期貨。這兩股安靜的力量，常常解釋了「事件後一路漲」和「結算後轉弱」。",
    analogy: [
      ["天氣和時鐘", "就算你站著不動，<b>天氣變了（IV）</b>、<b>時間過了</b>，你也得換衣服。"],
      ["保險變便宜", "IV 下降，價外 Put 這張保險<b>變得沒那麼像空單</b>，市商的避險空單就多了。"],
      ["沙漏", "價外選擇權的 Delta 像沙漏裡的沙，<b>每天往 0 流一點</b>。"]],
    steps: STEPS, draw, simHTML, simMount,
    simIntro: "調整 IV 和經過的天數，看市商賣出的 26,700 Put 要多空或少空幾口期貨。",
    mist: [
      ["價格沒動，市商就不用對沖", "IV 或時間變了，Delta 也會變，市商一樣得調整。"],
      ["Vanna、Charm 是進場訊號", "它們是背景力量，會被新聞、大單和 Gamma 蓋過。"],
      ["IV 下降一定上漲", "只是多了一股買回的力量，最後結果還要看其他力量。"]],
    faq: [
      ["Vanna 和 Charm 哪個比較大？", "IV 大幅變動時（事件前後）通常是 Vanna 大；平常每天慢慢累積的是 Charm，越接近到期越明顯。"],
      ["為什麼都用 Put 舉例？", "指數的選擇權市場裡，客戶買 Put 保險最常見，市商多半是 Put 的賣方，所以 Put 的 Vanna、Charm 影響最大。"],
      ["這跟 GEX 有什麼關係？", "GEX 講價格動時的對沖；Vanna、Charm 講 IV 和時間動時的對沖。三個加起來才是市商的完整流量。"],
      ["哪裡可以看到 Vanna、Charm 的數據？", "部分付費網站會提供，算法和 GEX 類似，只是把 Gamma 換成 Vanna 或 Charm。"]],
    qs: QS,
    gloss: [
      ["Vanna", "IV 變動時，Delta 變多少。"],
      ["Charm", "時間經過時，Delta 變多少。"],
      ["IV 下降回補", "IV 降，價外 Put Delta 變小，市商買回期貨空單。"],
      ["Delta 流向 0", "價外選擇權越接近到期，Delta 越接近 0。"]],
    remember: "<b>不只價格，IV 和時間也會讓 Delta 變。</b>IV 降、時間過，價外 Put 的 Delta 變小，市商買回；IV 升，市商加賣。"
  });
})();
