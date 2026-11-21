/* 路線 2 第 4 關（新版）：隱含波動率（IV）與 Vega、IV Crush */
(function () {
  const PAGES = (window.__PAGES = window.__PAGES || {});
  const { chip, lerp, ease, seg, cards } = window.KIT;
  const B = (F, K, iv, d) => window.OF.b76(F, K, iv, Math.max(d, 0.0001) / 365);
  const C = (F, K, iv, d) => B(F, K, iv, d).call;
  const r0 = Math.round;
  const P15 = r0(C(27000, 27000, 0.15, 7)), P20 = r0(C(27000, 27000, 0.2, 7)), P25 = r0(C(27000, 27000, 0.25, 7));
  const VEGA = B(27000, 27000, 0.2, 7).vega.toFixed(0);
  const BEF = r0(C(27000, 27000, 0.3, 1)), AFT = r0(C(27100, 27000, 0.16, 0.9));
  const EM = (iv, F = 27000) => r0((F * iv) / Math.sqrt(252));

  const STEPS = [
    { cap: "<b>波動率</b>是價格平均擺動的幅度。<b>隱含波動率（IV）</b>是從選擇權的價格<b>反推</b>出來的：市場願意付多少錢，代表大家預期接下來會波動多大。",
      why: "前兩關的權利金都假設 IV 是 20%。實際上 IV 是由市場買賣決定的：大家搶著買選擇權避險，價格被推高，反推出來的 IV 就高。", stuck: "颱風要來時，雨傘賣得比較貴。IV 就是「選擇權的貴不貴」。" },
    { cap: "IV 越高，權利金越貴。同樣是 7 天的價平 Call：IV 15% 約 <b>" + P15 + "</b> 點，20% 約 <b>" + P20 + "</b> 點，25% 約 <b>" + P25 + "</b> 點。",
      why: "預期波動越大，選擇權「到期變得很有價值」的機會越大，時間價值就越高。IV 只影響時間價值，不影響內含價值。", dur: 2400 },
    { cap: "<b>Vega</b>：IV 每變動 1 個百分點，權利金變多少。7 天的價平 Call，Vega 約 <b>" + VEGA + " 點</b>。",
      why: "Vega 在價平、離到期越久時越大。30 天的價平 Vega 大約是 7 天的兩倍。" },
    { cap: "換你算：一口選擇權 Vega 是 " + VEGA + " 點，IV 從 20% 升到 23%。",
      q: { t: "價格不動的情況下，權利金大約變多少？", o: [
        ["+" + VEGA + " 點", false, "那是 IV 變 1 個百分點的影響。這裡變了 3 個百分點。"],
        ["+" + VEGA * 3 + " 點", true, "3 × " + VEGA + " ＝ " + VEGA * 3 + " 點。IV 上升，權利金跟著漲。"],
        ["不變，因為價格沒動", false, "IV 改變，就算價格沒動，權利金也會變。"]] } },
    { cap: "IV 也可以換成<b>預期一天的波動範圍</b>：IV 20%、NQ 27,000，一天大約 ±" + EM(0.2) + " 點（大約一個標準差）。",
      why: "算法：價格 × IV ÷ √252（一年大約 252 個交易日）。27,000 × 0.2 ÷ 15.9 ≈ " + EM(0.2) + "。意思是：市場認為今天大約有三分之二的機會，收在這個範圍內。", dur: 2400 },
    { cap: "<b>事件前 IV 會升高</b>：CPI、FOMC 前，大家買選擇權避險，IV 被推高，權利金變貴。",
      why: "路線 1 第 11 關學過：事件前不確定性最大。選擇權的價格會先把「可能的大波動」算進去。" },
    { cap: "<b>IV Crush</b>：事件一公布，不確定性消失，IV 快速下降。例：CPI 前用 IV 30% 買價平 Call 付 " + BEF + " 點；公布後 NQ 漲了 100 點，但 IV 掉到 16%，Call 只剩 <b>" + AFT + " 點</b>。",
      why: "方向猜對了，價格也漲了 100 點，結果還是虧 " + (BEF - AFT) + " 點：IV 下降吃掉的價值，比上漲帶來的還多。這就是「漲了還虧錢」。", dur: 2800 },
    { cap: "想一想：事件前買 Call，方向對了、價格也漲了，結果還是虧錢。",
      q: { t: "最可能的原因是？", o: [
        ["券商算錯了", false, "不是算錯，是 IV 下降的影響。"],
        ["IV Crush：事件後 IV 大跌，權利金的時間價值縮水", true, "事件前 IV 很高，事件後快速下降。IV 下降造成的損失，可能比價格上漲帶來的獲利還大。"],
        ["Delta 是負的", false, "買 Call 的 Delta 是正的，價格上漲對它有利。問題出在 IV。"]] } },
    { cap: "NQ 的 IV 有一個指數叫 <b>VXN</b>（那斯達克 100 波動率指數），概念和大家熟悉的 VIX 一樣。VXN 高，代表市場預期接下來波動大。",
      why: "VIX 是 S&P 500 的版本，VXN 是那斯達克 100 的版本。盤前看一下它的高低，可以知道今天的「天氣」大概如何。" },
    { cap: "IV 也會影響 Gamma 的形狀：<b>IV 低時，Gamma 集中在價平附近、又高又尖</b>；IV 高時，Gamma 被攤平到比較寬的範圍。",
      why: "這代表 IV 低的時候，GEX 的牆會比較「集中」，價格在那附近的反應可能比較明顯；IV 高的時候，影響被攤開。這是 GEX 位階會隨市況變化的原因之一。", dur: 2400 },
    { cap: "整理：<b>IV</b> 是市場預期的波動，決定權利金貴不貴；<b>Vega</b> 是 IV 變動的影響；事件前 IV 升高、事件後 <b>IV Crush</b>。",
      why: "下一關會看到：不同履約價的 IV 其實不一樣，這叫偏斜，它也會影響 GEX。" }
  ];

  function draw(svg, i, t) {
    const e = ease(t); let s = "";
    if (i === 0) {
      const X = (k) => lerp(80, 600, k / 60), Y1 = (k) => 140 + 20 * Math.sin(k * 0.5), Y2 = (k) => 260 + 55 * Math.sin(k * 0.5) * Math.cos(k * 0.17);
      const n = Math.max(2, Math.ceil(seg(t, 0, 0.8) * 60));
      s += `<polyline points="${Array.from({ length: n }, (_, k) => `${X(k)},${Y1(k)}`).join(" ")}" class="s-buy f-none" stroke-width="2.5"/><text x="80" y="100" class="t-buy t-b">波動小：IV 低，選擇權便宜</text>`;
      s += `<polyline points="${Array.from({ length: n }, (_, k) => `${X(k)},${Y2(k)}`).join(" ")}" class="s-sell f-none" stroke-width="2.5"/><text x="80" y="200" class="t-sell t-b">波動大：IV 高，選擇權貴</text>`;
    } else if (i === 1) {
      [[15, P15], [20, P20], [25, P25]].forEach(([iv, p], k) => { const h = p * 0.6 * seg(t, k * 0.2, k * 0.2 + 0.4); s += `<rect x="${140 + k * 150}" y="${320 - h}" width="90" height="${h}" rx="6" class="f-gamma-soft"/><text x="${185 + k * 150}" y="${312 - h}" text-anchor="middle" class="t-ink t-b t-lg">${p}</text><text x="${185 + k * 150}" y="344" text-anchor="middle" class="t-mute">IV ${iv}%</text>`; });
      s += `<line x1="110" x2="580" y1="320" y2="320" class="s-ink"/><text x="110" y="50" class="t-mute">7 天、價平 27,000 Call 的權利金（點）</text>`;
    } else if (i === 2 || i === 3) {
      const X = (iv) => lerp(90, 590, (iv - 10) / 25), Y = (p) => lerp(320, 60, p / 500);
      const pts = []; for (let iv = 10; iv <= 35; iv += 0.5) pts.push(`${X(iv)},${Y(C(27000, 27000, iv / 100, 7))}`);
      s += `<line x1="90" x2="590" y1="320" y2="320" class="s-ink"/>${[10, 15, 20, 25, 30, 35].map((v) => `<text x="${X(v)}" y="342" text-anchor="middle" class="t-mute">${v}%</text>`).join("")}<text x="90" y="44" class="t-mute">IV 和權利金：斜率就是 Vega</text><polyline points="${pts.join(" ")}" class="s-gamma f-none" stroke-width="3"/>`;
      if (i === 2) s += `<g opacity="${seg(t, 0.2, 0.7)}"><line x1="${X(20)}" x2="${X(21)}" y1="${Y(P20)}" y2="${Y(P20)}" class="s-ink" stroke-width="2"/><line x1="${X(21)}" x2="${X(21)}" y1="${Y(P20)}" y2="${Y(C(27000, 27000, 0.21, 7))}" class="s-sell" stroke-width="3"/><text x="${X(21) + 10}" y="${Y(P20) - 10}" class="t-sell t-b">IV +1% → 約 +${VEGA} 點</text></g>`;
      else s += chip(340, 120, "IV 20% → 23%，權利金變多少？", "hl");
    } else if (i === 4) {
      const X = (p) => lerp(90, 590, (p - 26200) / 1600), half = EM(0.2);
      s += `<line x1="90" x2="590" y1="250" y2="250" class="s-ink"/>${[26400, 26700, 27000, 27300, 27600].map((p) => `<text x="${X(p)}" y="272" text-anchor="middle" class="t-mute">${p.toLocaleString()}</text>`).join("")}`;
      const pts = []; for (let p = 26200; p <= 27800; p += 10) pts.push(`${X(p)},${250 - 150 * Math.exp(-((p - 27000) ** 2) / (2 * half * half))}`);
      s += `<polyline points="${pts.join(" ")}" class="s-gamma f-none" stroke-width="2.5" opacity="${seg(t, 0, 0.4)}"/>`;
      s += `<g opacity="${seg(t, 0.3, 0.8)}"><rect x="${X(27000 - half)}" y="90" width="${X(27000 + half) - X(27000 - half)}" height="160" class="f-gamma-soft" opacity="0.6"/><text x="${X(27000)}" y="80" text-anchor="middle" class="t-gamma t-b">一天約 ±${half} 點（IV 20%）</text></g>`;
      s += `<text x="90" y="320" class="t-mute" opacity="${seg(t, 0.7, 1)}">27,000 × 0.2 ÷ √252 ≈ ${half}　大約三分之二的機會收在範圍內</text>`;
    } else if (i === 5 || i === 6 || i === 7) {
      const X = (k) => lerp(90, 590, k / 10), Y = (v) => lerp(300, 70, (v - 10) / 25);
      const iv = [18, 19, 20, 22, 25, 28, 30, 16, 15, 15, 15], n = i === 5 ? Math.max(2, Math.ceil(seg(t, 0, 0.9) * 7)) : 11;
      s += `<line x1="90" x2="590" y1="300" y2="300" class="s-ink"/><polyline points="${iv.slice(0, n).map((v, k) => `${X(k)},${Y(v)}`).join(" ")}" class="s-gamma f-none" stroke-width="3"/><line x1="${X(6.5)}" x2="${X(6.5)}" y1="60" y2="300" class="s-sell" stroke-dasharray="5 4"/><text x="${X(6.5)}" y="322" text-anchor="middle" class="t-sell t-b">CPI 公布</text><text x="90" y="44" class="t-mute">IV（%）</text>`;
      if (i === 5) s += `<text x="${X(4)}" y="${Y(28)}" class="t-gamma t-b" opacity="${seg(t, 0.6, 1)}">事件前一路升高</text>`;
      if (i === 6) s += `<g opacity="${seg(t, 0.1, 0.9)}"><rect x="380" y="90" width="210" height="110" rx="10" class="f-surface s-line"/><text x="396" y="118" class="t-ink">買進：IV 30%、${BEF} 點</text><text x="396" y="144" class="t-ink">公布後：NQ +100、IV 16%</text><text x="396" y="176" class="t-sell t-b t-lg">剩 ${AFT} 點（−${BEF - AFT}）</text></g>`;
      if (i === 7) s += chip(470, 120, "猜對方向還虧錢？", "hl");
    } else if (i === 8) {
      s += `<g opacity="${seg(t, 0, 0.5)}"><rect x="90" y="90" width="210" height="150" rx="14" class="f-buy-soft"/><text x="195" y="140" text-anchor="middle" class="t-ink t-b t-xl">VIX</text><text x="195" y="180" text-anchor="middle" class="t-mute">S&amp;P 500 的 IV 指數</text></g><g opacity="${seg(t, 0.3, 0.8)}"><rect x="340" y="90" width="210" height="150" rx="14" class="f-gamma-soft"/><text x="445" y="140" text-anchor="middle" class="t-ink t-b t-xl">VXN</text><text x="445" y="180" text-anchor="middle" class="t-mute">那斯達克 100 的 IV 指數</text></g>`;
    } else if (i === 9) {
      const X = (F) => lerp(90, 590, (F - 26400) / 1200);
      [[0.12, "s-gamma", "IV 12%：又高又尖"], [0.3, "s-sell", "IV 30%：被攤平"]].forEach(([iv, c, l], k) => {
        const pts = []; for (let F = 26400; F <= 27600; F += 10) pts.push(`${X(F)},${lerp(320, 60, B(F, 27000, iv, 7).gamma * 1e4 / 10)}`);
        s += `<g opacity="${seg(t, k * 0.35, k * 0.35 + 0.4)}"><polyline points="${pts.join(" ")}" class="${c} f-none" stroke-width="3"/><text x="${k ? 560 : X(27000) + 10}" y="${k ? lerp(320, 60, B(26700, 27000, iv, 7).gamma * 1e4 / 10) - 10 : lerp(320, 60, B(27000, 27000, iv, 7).gamma * 1e4 / 10) + 4}" text-anchor="${k ? "end" : "start"}" class="${c.replace("s-", "t-")} t-b">${l}</text></g>`;
      });
      s += `<line x1="90" x2="590" y1="320" y2="320" class="s-ink"/><text x="90" y="44" class="t-mute">27,000 的 Gamma（7 天）</text>`;
    } else if (i === 10) {
      s += cards([["IV", "從權利金反推的預期波動，決定選擇權貴不貴"], ["Vega", "IV 變 1 個百分點，權利金變多少"], ["預期範圍", "價格 × IV ÷ √252 ≈ 一天的一個標準差"], ["IV Crush", "事件後 IV 大跌，猜對方向也可能虧"], ["影響 GEX", "IV 低時 Gamma 集中、牆比較尖"]], t, { hl: 3 });
    }
    svg.innerHTML = s;
  }

  const simHTML = `<div class="controls"><div class="ctl"><label>IV <b class="v4-iv-v"></b></label><input class="v4-iv" type="range" min="10" max="40" step="1" value="20"></div><div class="ctl"><label>離到期 <b class="v4-d-v"></b></label><input class="v4-d" type="range" min="0.5" max="30" step="0.5" value="7"></div><div class="ctl"><label>NQ 現價 <b class="v4-f-v"></b></label><input class="v4-f" type="range" min="26600" max="27400" step="25" value="27000"></div></div>
<div class="btn-row"><button class="btn v4-crush" type="button">模擬 IV Crush：IV 30% → 16%、NQ +100、過了 0.1 天</button><button class="btn v4-reset" type="button">重設</button></div>
<div class="v4-out"></div><ul class="sim-task v4-task"></ul>`;
  function simMount(box) {
    const q = (s) => box.querySelector(s); const done = {}; let seenHi = false, seenLo = false;
    function paint(msg) {
      const iv = +q(".v4-iv").value / 100, d = +q(".v4-d").value, F = +q(".v4-f").value, r = B(F, 27000, iv, d);
      q(".v4-iv-v").textContent = Math.round(iv * 100) + "%"; q(".v4-d-v").textContent = d + " 天"; q(".v4-f-v").textContent = F.toLocaleString();
      q(".v4-out").innerHTML = `<div class="kpi-row"><div><span class="t1">27,000 Call</span><b>${r.call.toFixed(0)} 點</b></div><div><span class="t1">Vega</span><b>${r.vega.toFixed(1)}</b></div><div><span class="t1">一天預期範圍</span><b>±${EM(iv, F)} 點</b></div><div><span class="t1">Theta</span><b>${r.theta.toFixed(1)}／天</b></div></div>${msg ? `<p class="sim-msg">${msg}</p>` : ""}`;
      if (iv >= 0.35) done.a = true;
      q(".v4-task").innerHTML = [["a", "任務 1：把 IV 拉到 35% 以上，看權利金和預期範圍變多大"], ["b", "任務 2：按「模擬 IV Crush」，看漲了 100 點為什麼還虧"], ["c", "任務 3：比較 30 天和 3 天的 Vega，哪個大？"]].map(([k, tx]) => `<li class="${done[k] ? "ok" : ""}">${done[k] ? "✓" : "○"} ${tx}</li>`).join("");
    }
    box.addEventListener("input", () => { const d = +q(".v4-d").value; if (d >= 25) seenHi = true; if (d <= 3) seenLo = true; if (seenHi && seenLo) done.c = true; paint(); });
    q(".v4-crush").addEventListener("click", () => { q(".v4-iv").value = 30; q(".v4-d").value = 1; q(".v4-f").value = 27000; const before = C(27000, 27000, 0.3, 1); setTimeout(() => { q(".v4-iv").value = 16; q(".v4-f").value = 27100; q(".v4-d").value = 1; const after = C(27100, 27000, 0.16, 0.9); done.b = true; paint(`買進時 ${before.toFixed(0)} 點 → 公布後 ${after.toFixed(0)} 點：NQ 漲了 100 點，Call 卻虧了 ${(before - after).toFixed(0)} 點。IV 下降吃掉的時間價值，比上漲帶來的還多。`); }, 50); paint("買進：IV 30%、剩 1 天……"); });
    q(".v4-reset").addEventListener("click", () => { q(".v4-iv").value = 20; q(".v4-d").value = 7; q(".v4-f").value = 27000; paint(); });
    paint();
  }

  const QS = [
    { fig: `<p class="small q-cap">NQ 在 27,000，IV 30%。</p>`, q: "一天的預期波動範圍（大約一個標準差）是多少？", step: 5, o: [
      ["約 ±" + EM(0.3) + " 點", true, "27,000 × 0.3 ÷ √252 ≈ " + EM(0.3) + "。IV 越高，預期範圍越大。"],
      ["約 ±8,100 點", false, "8,100 是一整年的一個標準差（27,000 × 0.3）。一天要再除以 √252。"],
      ["約 ±30 點", false, "IV 是百分比，不是點數。"]] },
    { fig: `<p class="small q-cap">FOMC 前一天，NQ 價平選擇權的 IV 明顯比平常高。</p>`, q: "如果這時買選擇權，最要小心什麼？", step: 8, o: [
      ["Theta 變成正的", false, "買方的 Theta 永遠是成本，跟 IV 高低無關。"],
      ["事件後 IV 下降（IV Crush），就算方向對也可能虧", true, "事件前 IV 被推高，權利金很貴；公布後 IV 快速下降，時間價值大幅縮水。"],
      ["Delta 會變成 0", false, "IV 改變不會讓 Delta 直接變成 0。"]] },
    { fig: `<p class="small q-cap">最近市場很平靜，IV 降到很低。</p>`, q: "這時價平附近的 Gamma 會怎麼樣？", step: 10, o: [
      ["Gamma 被攤平，影響範圍變寬", false, "那是 IV 高的時候。"],
      ["Gamma 集中在價平附近、又高又尖", true, "IV 低時，Gamma 集中在履約價附近，GEX 的牆會比較集中。"],
      ["Gamma 不受 IV 影響", false, "IV 會改變 Gamma 的形狀。"]] }
  ];

  PAGES["op-4"] = window.KIT.page(window.COURSE.OPC, "op-4", {
    topic: "隱含波動率",
    lede: "同一口選擇權，有時候貴、有時候便宜，差別在市場預期接下來會波動多大。這一關認識隱含波動率（IV）、Vega，以及事件交易最常踩的坑：IV Crush。",
    analogy: [
      ["颱風前的雨傘", "颱風要來，雨傘變貴；颱風一走，雨傘馬上便宜。選擇權在事件前變貴、事件後變便宜，就是這樣。"],
      ["天氣預報", "<b>IV</b> 像是市場的天氣預報：數字越高，代表大家預期接下來風浪越大。"],
      ["買到最貴的時候", "事件前搶著買保險，買到的是最貴的價格；事件過後保險的價值馬上縮水，這就是 <b>IV Crush</b>。"]],
    steps: STEPS, draw, simHTML, simMount,
    simIntro: "調整 IV、離到期天數和現價，看權利金、Vega 和一天的預期範圍怎麼變；也可以直接模擬一次 IV Crush。",
    mist: [
      ["IV 是過去的波動", "IV 是從現在的權利金反推出來的「預期」。過去實際發生的波動叫歷史波動率，兩者可能差很多。"],
      ["猜對方向就一定賺", "事件前買選擇權，公布後 IV 大跌，就算方向對、價格也動了，還是可能虧錢。"],
      ["IV 高就一定會大漲或大跌", "IV 高只是市場預期波動大，實際上不一定發生。IV 也可能是因為大家在避險。"]],
    faq: [
      ["IV 和歷史波動率差在哪？", "歷史波動率是過去實際的波動；IV 是現在權利金反映的預期波動。IV 常常比歷史波動率高一點，因為賣方要求風險補償。"],
      ["預期範圍怎麼用？", "盤前可以看今天 IV 換算的範圍，再和 GEX、價值區的位階比較。範圍外的位階，今天被碰到的機會比較低。"],
      ["VXN 在哪裡看？", "TradingView 等看盤軟體可以搜尋 VXN（CBOE NASDAQ-100 Volatility Index）。它和 VIX 通常同方向動。"],
      ["為什麼事件後 IV 會掉這麼快？", "事件前大家為了「不知道結果」付錢；結果一公布，那部分不確定性就消失了，IV 自然降下來。"],
      ["IV 對 GEX 有什麼影響？", "IV 會改變每個履約價的 Gamma 形狀。很多 GEX 工具用各履約價自己的 IV 計算，IV 一變，位階的大小和位置也會跟著變。"],
      ["這裡的數字準嗎？", "這裡用 Black-76 模型示意。真實市場的 IV 每個履約價都不一樣（下一關的偏斜），而且隨時在變。"]],
    qs: QS,
    gloss: [
      ["波動率", "價格平均擺動的幅度，用年化百分比表示。"],
      ["隱含波動率（IV）", "從權利金反推的市場預期波動率。"],
      ["Vega", "IV 每變動 1 個百分點，權利金變多少。"],
      ["預期範圍", "價格 × IV ÷ √252，大約是一天的一個標準差。"],
      ["IV Crush", "事件後 IV 快速下降，權利金縮水。"],
      ["VXN", "那斯達克 100 的波動率指數。"]],
    remember: "<b>IV 是市場的天氣預報，決定選擇權貴不貴。</b>事件前 IV 升高、事件後 IV Crush；IV 低時 Gamma 集中，牆比較尖。"
  });
})();
