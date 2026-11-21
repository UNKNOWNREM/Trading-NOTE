/* 路線 2 第 8 關（新版）：到期日效應——0DTE、釘住、牆消失 */
(function () {
  const PAGES = (window.__PAGES = window.__PAGES || {});
  const { lerp, ease, seg, cards, chip } = window.KIT;
  const { B, fx, sg, gexK, frame } = window.OPK;

  const DAYS = [[30, "30 天", "s-line"], [7, "7 天", "s-gamma"], [1, "1 天", "s-buy"], [0.25, "6 小時", "s-sell"]];
  const G = (F, d) => B(F, 27000, d).gamma * 1e4;
  const r7 = G(27000, 1) / G(27000, 7), r6h = G(27000, 0.25) / G(27000, 7);
  // 週選擇權（剩 1 天）＋月選擇權（剩 21 天）
  const WEEK = [[26800, 300, 2600], [26900, 600, 2000], [27000, 9000, 1500], [27100, 1200, 500], [27200, 1000, 300]];
  const MONTH = [[26800, 900, 4200], [26900, 1400, 2600], [27000, 2600, 2200], [27100, 3000, 1300], [27200, 3400, 900]];
  const KS = [26800, 26900, 27000, 27100, 27200];
  const gw = (K, d = 1) => { const r = WEEK.find((x) => x[0] === K); return gexK(27000, K, r[1], r[2], d); };
  const gm = (K, d = 21) => { const r = MONTH.find((x) => x[0] === K); return gexK(27000, K, r[1], r[2], d); };

  const FG = frame({ lo: 26400, hi: 27600, ymin: 0, ymax: 30, y0: 70, y1: 320 });
  function gammaPic(n, t, o = {}) {
    let s = FG.axis("27,000 履約價的 Gamma（萬分之）", [26600, 27000, 27400]);
    DAYS.slice(0, n).forEach(([d, lab, cls], k) => {
      const up = k === n - 1 ? seg(t, 0, 0.7) : 1;
      s += FG.fn((F) => Math.min(30, G(F, d)), cls, 3, up, 5);
      const lx = [27450, 27250, 27000, 27000][k], yy = FG.Y(Math.min(30, G(lx, d)));
      s += `<text x="${FG.X(lx) + (k < 2 ? 0 : 12)}" y="${Math.max(80, yy) - (k < 2 ? 8 : -4)}" class="${cls.replace("s-", "t-").replace("t-line", "t-mute")} t-b" opacity="${k === n - 1 ? seg(t, 0.6, 1) : 1}">${lab}</text>`;
    });
    if (o.chipT) s += chip(470, 110, o.chipT, "hl");
    return s;
  }
  // 結算前後長條
  function expBars(after, t) {
    const vals = KS.map((K) => ({ K, w: after ? 0 : gw(K), m: gm(K) }));
    const mx = Math.max(...KS.map((K) => Math.abs(gw(K) + gm(K)))), cx = 340, sx = 220 / mx;
    let s = `<line x1="${cx}" x2="${cx}" y1="60" y2="340" class="s-ink"/><text x="90" y="44" class="t-mute">${after ? "週選擇權結算後：只剩月選擇權" : "結算前：週選擇權＋月選擇權"}</text>`;
    vals.slice().reverse().forEach((v, j) => {
      const y = 70 + j * 52, gm2 = v.m * sx, gw2 = v.w * sx * (after ? 1 : ease(seg(t, 0.1, 0.6)));
      s += `<text x="90" y="${y + 20}" class="t-ink t-b">${fx(v.K)}</text>`;
      s += `<rect x="${gm2 >= 0 ? cx : cx + gm2}" y="${y}" width="${Math.max(1, Math.abs(gm2))}" height="30" rx="4" class="${gm2 >= 0 ? "f-gamma-soft" : "f-sell-soft"}"/>`;
      if (!after) { const st = gm2 >= 0 === gw2 >= 0 ? gm2 : 0; s += `<rect x="${gw2 >= 0 ? cx + Math.max(0, st) : cx + Math.min(0, st) + gw2}" y="${y}" width="${Math.max(1, Math.abs(gw2))}" height="30" rx="4" class="${gw2 >= 0 ? "f-hl" : "f-sell"}"/>`; }
    });
    s += `<rect x="440" y="320" width="14" height="14" rx="3" class="f-gamma-soft"/><text x="460" y="332" class="t-mute">月</text>${after ? "" : `<rect x="500" y="320" width="14" height="14" rx="3" class="f-hl"/><text x="520" y="332" class="t-mute">週</text>`}`;
    return s;
  }
  // 釘住：價格在 27,000 附近被拉回
  function pinPic(t) {
    const X = (k) => lerp(80, 600, k), Y = (p) => 200 - (p - 27000) * 0.9;
    let s = `<line x1="80" x2="600" y1="${Y(27000)}" y2="${Y(27000)}" class="s-hl" stroke-width="3"/><text x="600" y="${Y(27000) - 10}" text-anchor="end" class="t-gamma t-b">27,000：大量 OI、快到期</text>`;
    [27100, 26900].forEach((p) => { s += `<line x1="80" x2="600" y1="${Y(p)}" y2="${Y(p)}" class="s-line"/><text x="74" y="${Y(p) + 4}" text-anchor="end" class="t-mute">${fx(p)}</text>`; });
    const pts = []; const n = Math.max(2, Math.round(ease(t) * 120));
    for (let k = 0; k < n; k++) { const u = k / 119, amp = 110 * Math.exp(-3.2 * u); pts.push([X(u), Y(27000 + amp * Math.sin(u * 26) + 6 * Math.sin(u * 91))]); }
    s += `<polyline points="${pts.map((p) => p.map((v) => v.toFixed(1)).join(",")).join(" ")}" class="s-ink f-none" stroke-width="2.5"/>`;
    s += `<text x="80" y="340" class="t-mute">開盤</text><text x="600" y="340" text-anchor="end" class="t-mute">收盤（到期）</text>`;
    return s;
  }

  const STEPS = [
    { cap: "第 3 關學過：Gamma 越接近到期越尖。同一個 27,000 履約價，剩 30 天時 Gamma 平平的；剩 1 天時變成一根<b>尖刺</b>。",
      why: "時間越少，價格只要在履約價附近晃一下，選擇權就在「有價值」和「歸零」之間跳，Delta 變化非常劇烈。", dur: 3200 },
    { cap: "同樣的 OI，剩 1 天的價平 Gamma 大約是剩 7 天的 <b>" + r7.toFixed(1) + " 倍</b>，剩 6 小時更是 <b>" + r6h.toFixed(1) + " 倍</b>。GEX ＝ Gamma × OI…，所以快到期的履約價，GEX 也被放大了。",
      why: "這就是為什麼到期日當天，大 OI 的履約價對價格的影響特別明顯。" },
    { cap: "想一想：27,000 有大量 OI，價格就在附近。",
      q: { t: "哪一天，27,000 對價格的影響最可能最強？", o: [
        ["還有 30 天的時候", false, "時間很長，Gamma 平緩，對沖量分散。"],
        ["到期日當天", true, "價平、快到期，Gamma 最尖，市商的對沖量最集中在這個價位附近。"],
        ["到期後隔天", false, "到期一過，那批選擇權就不存在了，Gamma 歸零。"]] } },
    { cap: "<b>釘住（Pinning）</b>：如果 27,000 是大量<b>正 GEX</b>，到期日市商的對沖會在上方賣、下方買，價格常被拉回這個整數附近，一整天越晃越小。",
      why: "這是彈簧效果被到期放大。不是每次都會發生：如果是負 GEX，或有大消息，價格反而可能從這裡被推開。", dur: 3600 },
    { cap: "<b>0DTE</b>（0 Days To Expiry）＝當天到期的選擇權。QQQ 和 NQ 幾乎每個交易日都有到期，0DTE 的 Gamma 非常大，但<b>收盤就消失</b>。",
      why: "所以 0DTE 造成的牆，常常只在當天有效。隔天要看新的資料。" },
    { cap: "市場上同時有<b>週選擇權</b>和<b>月選擇權</b>。結算前，27,000 的長條很大，大部分來自明天就到期的週選擇權。",
      why: "週選擇權剩 1 天，Gamma 尖；月選擇權還有 21 天，Gamma 比較平。兩個加在一起才是你看到的 GEX。", dur: 2600 },
    { cap: "週選擇權<b>結算後</b>，它的 OI 就不存在了。只剩月選擇權，27,000 的長條一下子縮小，<b>牆消失了</b>。",
      why: "這就是為什麼結算後隔天，價格常常突然「放開」：之前把價格黏住的對沖量不見了。", dur: 2400 },
    { cap: "想一想：週五週選擇權結算。週四看到 27,000 有一面很大的牆，而且大部分是週五到期的 OI。",
      q: { t: "下週一，這面牆最可能怎樣？", o: [
        ["變小甚至消失", true, "週五到期的 OI 結算後就不存在了，牆主要靠它撐的話，下週就沒了。"],
        ["一樣大，牆不會變", false, "GEX 是用 OI 算的，OI 結算掉了，牆就會縮。"],
        ["變得更大", false, "除非有新的大量 OI 進來，否則不會變大。"]] } },
    { cap: "每月第三個週五是<b>月結算（OPEX）</b>，每季的那一次（3、6、9、12 月）量更大。結算前後，整個 GEX 地形常常大幅重畫。",
      why: "很多大型部位集中在月和季到期，結算會一次清掉大量 OI。結算後幾天，市場常常換一個節奏。" },
    { cap: "實務上：每天看 GEX 時，先確認<b>今天有沒有到期</b>、牆是由哪個到期日撐的。GammaLens 的「3 exp stacked」就是把最近三個到期日加在一起（第 12 關）。",
      why: "如果今天就是主要到期日，今天的牆可能很強，但收盤後就失效。" },
    { cap: "整理：越接近到期，<b>Gamma 越尖、牆越強</b>；大正 GEX 的履約價可能<b>釘住</b>價格；到期一過，那批 OI 歸零，<b>牆會消失、地形重畫</b>。",
      why: "下一關看 Delta 的另外兩種變化：IV 變了（Vanna）、時間過了（Charm），也會讓市商被迫買賣。" }
  ];

  function draw(svg, i, t) {
    let s = "";
    if (i === 0) s += gammaPic(Math.min(4, 1 + Math.floor(t * 3.99)), (t * 3.99) % 1);
    else if (i === 1) {
      const vals = DAYS.map(([d, lab]) => ({ lab, v: G(27000, d) })), mx = vals[3].v;
      vals.forEach((v, k) => { const h = (v.v / mx) * 220 * ease(seg(t, k * 0.15, k * 0.15 + 0.4)), x = 110 + k * 120;
        s += `<rect x="${x}" y="${310 - h}" width="80" height="${h}" rx="6" class="${k === 3 ? "f-sell" : k === 2 ? "f-buy" : "f-gamma-soft"}"/><text x="${x + 40}" y="335" text-anchor="middle" class="t-ink t-b">${v.lab}</text><text x="${x + 40}" y="${300 - h}" text-anchor="middle" class="t-ink" opacity="${seg(t, k * 0.15 + 0.3, k * 0.15 + 0.5)}">${(v.v / vals[1].v).toFixed(1)}×</text>`; });
      s += `<line x1="90" x2="590" y1="310" y2="310" class="s-ink"/><text x="90" y="50" class="t-mute">價平 Gamma，以剩 7 天為 1 倍</text>`;
    } else if (i === 2) s += gammaPic(4, 1, { chipT: "哪一天影響最強？" });
    else if (i === 3) s += pinPic(t);
    else if (i === 4) {
      const X = (k) => lerp(90, 590, k);
      s += `<text x="90" y="50" class="t-mute">0DTE：一天之內的 Gamma（價平）</text><line x1="90" x2="590" y1="300" y2="300" class="s-ink"/>`;
      const pts = []; for (let k = 0; k <= 58; k++) { const u = k / 60, d = (1 - u) * 0.3 + 0.006; pts.push([X(u), 300 - Math.min(220, G(27000, d) * 2.2)]); } pts.push([X(1), 300]);
      const n = Math.max(2, Math.round(ease(seg(t, 0, 0.8)) * pts.length));
      s += `<polyline points="${pts.slice(0, n).map((p) => p.map((v) => v.toFixed(1)).join(",")).join(" ")}" class="s-sell f-none" stroke-width="3"/>`;
      s += `<g opacity="${seg(t, 0.8, 1)}"><line x1="${X(1)}" x2="${X(1)}" y1="60" y2="300" class="s-ink" stroke-dasharray="4 4"/><text x="${X(1) - 8}" y="80" text-anchor="end" class="t-sell t-b">收盤：歸零</text></g><text x="90" y="325" class="t-mute">開盤</text><text x="590" y="325" text-anchor="end" class="t-mute">收盤</text>`;
    } else if (i === 5) s += expBars(false, t);
    else if (i === 6) s += t < 0.35 ? expBars(false, 1) : expBars(true, 1);
    else if (i === 7) s += expBars(false, 1) + chip(470, 300, "週一會怎樣？", "hl");
    else if (i === 8) {
      const X = (k) => 90 + k * 40;
      s += `<text x="90" y="60" class="t-mute">一年 12 個月結算：每季那一次更大</text>`;
      for (let k = 0; k < 12; k++) { const q = (k + 1) % 3 === 0, h = (q ? 200 : 110) * ease(seg(t, k * 0.05, k * 0.05 + 0.3));
        s += `<rect x="${X(k)}" y="${300 - h}" width="28" height="${h}" rx="4" class="${q ? "f-sell" : "f-gamma-soft"}"/><text x="${X(k) + 14}" y="322" text-anchor="middle" class="t-mute">${k + 1}</text>`; }
      s += `<text x="90" y="350" class="t-sell t-b" opacity="${seg(t, 0.7, 1)}">3、6、9、12 月：季結算</text>`;
    } else if (i === 9) s += cards([["今天有到期嗎？", "有：今天的牆可能很強，收盤失效"], ["牆是誰撐的？", "週選擇權撐的，結算後就沒了"], ["月、季結算前後", "地形常大幅重畫"], ["工具", "GammaLens 3 exp stacked（第 12 關）"]], t, { hl: 0 });
    else s += cards([["越接近到期", "Gamma 越尖，牆越強"], ["釘住", "大正 GEX 的履約價可能把價格拉住"], ["0DTE", "當天到期，收盤就消失"], ["結算後", "OI 歸零，牆消失、地形重畫"]], t, { hl: 3 });
    svg.innerHTML = s;
  }

  const simHTML = `<div class="controls"><div class="ctl"><label>週選擇權離到期 <b class="ex-d-v"></b></label><input class="ex-d" type="range" min="0" max="7" step="0.25" value="7"></div></div>
<div class="tabs ex-tabs"><button class="tab" data-k="0" aria-selected="true" type="button">結算前（週＋月）</button><button class="tab" data-k="1" aria-selected="false" type="button">週選擇權已結算（只剩月）</button></div>
<svg class="fpx ex-svg" viewBox="0 0 640 380" role="img" aria-label="各履約價 GEX"></svg><div class="ex-out kpi-row"></div><ul class="sim-task ex-task"></ul>`;
  function simMount(box) {
    const q = (s) => box.querySelector(s); let after = false; const done = {};
    function paint() {
      const d = +q(".ex-d").value, dd = Math.max(0.05, d);
      q(".ex-d-v").textContent = d === 0 ? "收盤前 1 小時" : d < 1 ? Math.round(d * 24) + " 小時" : d + " 天";
      const vals = KS.map((K) => ({ K, w: after ? 0 : gw(K, dd), m: gm(K, 21 - (7 - d)) }));
      const mx = Math.max(400, ...vals.map((v) => Math.abs(v.w) + Math.abs(v.m))), cx = 330, sx = 230 / mx;
      let s = `<line x1="${cx}" x2="${cx}" y1="40" y2="330" class="s-ink"/><text x="90" y="30" class="t-mute">27,000 附近各履約價的淨 GEX（百萬美元）</text>`;
      vals.slice().reverse().forEach((v, j) => {
        const y = 52 + j * 54, tot = v.w + v.m, w = tot * sx;
        s += `<text x="90" y="${y + 21}" class="t-ink t-b">${fx(v.K)}</text><rect x="${w >= 0 ? cx : cx + w}" y="${y}" width="${Math.max(1, Math.abs(w))}" height="32" rx="4" class="${w >= 0 ? (after ? "f-gamma-soft" : "f-hl") : (after ? "f-sell-soft" : "f-sell")}"/><text x="${w >= 0 ? cx + w + 8 : cx + w - 8}" y="${y + 21}" text-anchor="${w >= 0 ? "start" : "end"}" class="t-ink">${sg(tot)}</text>`;
      });
      q(".ex-svg").innerHTML = s;
      const v0 = vals.find((v) => v.K === 27000), tot0 = v0.w + v0.m;
      q(".ex-out").innerHTML = `<div><span class="t1">27,000 淨 GEX</span><b>${sg(tot0)}M</b></div><div><span class="t1">其中週選擇權</span><b>${sg(v0.w)}M</b></div><div><span class="t1">其中月選擇權</span><b>${sg(v0.m)}M</b></div><div><span class="t1">週選擇權占比</span><b>${tot0 ? Math.round((v0.w / tot0) * 100) : 0}%</b></div>`;
      if (!after && d <= 0.5) done.a = true; if (after) done.b = true; if (!after && d >= 6) done.c = true;
      q(".ex-task").innerHTML = [["a", "任務 1：把週選擇權拉到快到期，看 27,000 的長條變多大"], ["b", "任務 2：切到「已結算」，看牆剩下多少"], ["c", "任務 3：拉回 7 天，比較週選擇權的占比"]].map(([k, tx]) => `<li class="${done[k] ? "ok" : ""}">${done[k] ? "✓" : "○"} ${tx}</li>`).join("");
    }
    box.addEventListener("input", paint);
    q(".ex-tabs").addEventListener("click", (e) => { const b = e.target.closest(".tab"); if (!b) return; after = b.dataset.k === "1"; box.querySelectorAll(".ex-tabs .tab").forEach((x) => x.setAttribute("aria-selected", String(x === b))); paint(); });
    paint();
  }

  const QS = [
    { fig: `<p class="small q-cap">兩口一樣的價平選擇權，一口剩 14 天，一口剩 1 天。</p>`, q: "哪一口的 Gamma 比較大？", step: 2, o: [
      ["剩 1 天的", true, "越接近到期，價平 Gamma 越尖越大。"],
      ["剩 14 天的", false, "時間越長，Gamma 越平緩。"],
      ["一樣大", false, "Gamma 會隨剩餘時間改變。"]] },
    { fig: `<p class="small q-cap">到期日當天，27,000 是全市場最大的正 GEX，價格在 26,980 附近。沒有重大消息。</p>`, q: "最可能看到什麼？", step: 4, o: [
      ["價格在 27,000 附近來回、越晃越小", true, "大正 GEX 加上快到期，市商在上方賣、下方買，容易出現釘住。"],
      ["價格一定大漲突破", false, "正 GEX 的對沖會壓低波動，不是推動突破。"],
      ["跟 27,000 完全無關", false, "到期日大 OI 的履約價影響最明顯。"]] },
    { fig: `<p class="small q-cap">週四晚上看到 27,200 有一面大牆，九成來自週五到期的選擇權。</p>`, q: "下週要怎麼看這面牆？", step: 7, o: [
      ["結算後它多半會消失，要看新的資料", true, "週五到期的 OI 結算後就歸零了，牆不會延續到下週。"],
      ["它會一直在，可以長期當阻力", false, "牆是 OI 撐的，OI 沒了牆就沒了。"],
      ["它會變成 Put Wall", false, "結算不會讓 Call 變成 Put，只是 OI 消失。"]] }
  ];

  PAGES["op-7"] = window.KIT.page(window.COURSE.OPC, "op-7", {
    topic: "到期日效應",
    lede: "GEX 不是固定的。越接近到期，價平附近的 Gamma 越集中、牆越強；到期一過，那批選擇權的 Gamma 直接歸零，關鍵區也跟著重畫。",
    analogy: [
      ["倒數計時", "越接近到期，<b>Gamma 越尖</b>，像倒數最後幾秒的心跳越來越快。"],
      ["磁鐵", "大正 GEX 的履約價，到期日會像磁鐵一樣把價格<b>釘住</b>。"],
      ["拆掉的牆", "到期一過，那批 OI 不見了，<b>牆就被拆掉</b>。"]],
    steps: STEPS, draw, simHTML, simMount,
    simIntro: "拉動週選擇權離到期的時間，看 27,000 的牆怎麼變；再切到「已結算」，看牆剩多少。",
    mist: [
      ["牆會一直存在", "牆是 OI 撐的。撐住它的選擇權一到期，牆就消失。"],
      ["到期日一定會釘住", "只有大正 GEX、沒有大消息時比較常見。負 GEX 或重大事件時，價格反而可能被推開。"],
      ["0DTE 的牆隔天還有效", "0DTE 收盤就到期，隔天要看新的資料。"]],
    faq: [
      ["NQ 的選擇權什麼時候到期？", "幾乎每個交易日都有到期；週五是週選擇權，每月第三個週五是月選擇權，季月那次量最大。"],
      ["為什麼結算後價格常常變得比較會跑？", "之前把價格黏住的正 GEX 被清掉了，對沖的「彈簧」變弱。"],
      ["我怎麼知道牆是哪個到期日撐的？", "有些工具可以分開看每個到期日。GammaLens 是把最近三個到期日加在一起（第 12 關）。"],
      ["釘住跟 Max Pain 一樣嗎？", "不一樣。Max Pain 是「讓選擇權買方損失最大的價格」，是另一套說法；這裡講的是市商對沖造成的效果。"]],
    qs: QS,
    gloss: [
      ["到期日", "選擇權最後一天，之後就結算、不存在了。"],
      ["0DTE", "當天到期的選擇權，Gamma 很大，收盤就消失。"],
      ["釘住（Pinning）", "到期日價格被拉在大正 GEX 的履約價附近。"],
      ["OPEX", "月結算日，每月第三個週五。"],
      ["季結算", "3、6、9、12 月的月結算，量最大。"]],
    remember: "<b>越接近到期，Gamma 越尖、牆越強。</b>到期一過，那批 OI 歸零，牆會消失、地形重畫。"
  });
})();
