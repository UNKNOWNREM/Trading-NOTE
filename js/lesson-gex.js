/* 路線 2 第 7 關（新版）：從 OI 到 GEX——牆與 Flip */
(function () {
  const PAGES = (window.__PAGES = window.__PAGES || {});
  const { lerp, ease, seg, cards, chip } = window.KIT;
  const { B, fx, sg, CHAIN, gexC, gexK, net, flip, frame } = window.OPK;

  const base = CHAIN.map((r) => r.slice());
  const per = (ch) => ch.map(([K, c, p]) => ({ K, c, p, gc: gexC(27000, K, c), gp: -gexC(27000, K, p), g: gexK(27000, K, c, p) }));
  const P0 = per(base), CW = P0.reduce((a, b) => (b.g > a.g ? b : a)), PW = P0.reduce((a, b) => (b.g < a.g ? b : a));
  const FL = flip(base), N0 = net(27000, base);
  const C27 = P0.find((r) => r.K === 27000);

  // 選擇權鏈表格（SVG）
  function chainTab(t, o = {}) {
    let s = `<text x="90" y="44" class="t-mute">履約價</text><text x="260" y="44" text-anchor="end" class="t-buy t-b">Call OI</text><text x="380" y="44" text-anchor="end" class="t-sell t-b">Put OI</text>${o.gex ? `<text x="550" y="44" text-anchor="end" class="t-mute">淨 GEX（百萬）</text>` : ""}<line x1="90" x2="560" y1="54" y2="54" class="s-line"/>`;
    P0.forEach((r, k) => {
      const y = 80 + k * 31, op = seg(t, k * 0.06, k * 0.06 + 0.2), hl = o.hl && o.hl.includes(r.K);
      s += `<g opacity="${op}">${hl ? `<rect x="84" y="${y - 20}" width="480" height="28" rx="6" class="f-gamma-soft"/>` : ""}<text x="90" y="${y}" class="t-ink t-b">${fx(r.K)}</text><text x="260" y="${y}" text-anchor="end" class="t-buy">${fx(r.c)}</text><text x="380" y="${y}" text-anchor="end" class="t-sell">${fx(r.p)}</text>${o.gex ? `<text x="550" y="${y}" text-anchor="end" class="${r.g >= 0 ? "t-gamma" : "t-sell"} t-b" opacity="${seg(o.gt == null ? 1 : o.gt, k * 0.07, k * 0.07 + 0.2)}">${sg(r.g)}</text>` : ""}</g>`;
    });
    return s;
  }
  // 每個履約價的 GEX 長條（橫向）
  function bars(t, o = {}) {
    const mx = Math.max(...P0.map((r) => Math.abs(r.g))), cx = 340, sx = 210 / mx;
    let s = `<line x1="${cx}" x2="${cx}" y1="40" y2="350" class="s-ink"/><text x="${cx + 6}" y="34" class="t-gamma t-b">正 →</text><text x="${cx - 6}" y="34" text-anchor="end" class="t-sell t-b">← 負</text>`;
    P0.slice().reverse().forEach((r, j) => {
      const y = 48 + j * 33, w = Math.abs(r.g) * sx * ease(seg(t, j * 0.05, j * 0.05 + 0.4)), pos = r.g >= 0;
      const em = o.walls && (r === CW || r === PW);
      s += `<text x="90" y="${y + 17}" class="t-ink">${fx(r.K)}</text><rect x="${pos ? cx : cx - w}" y="${y}" width="${Math.max(1, w)}" height="24" rx="4" class="${pos ? "f-gamma-soft" : "f-sell-soft"}" opacity="${o.walls && !em ? 0.5 : 1}"/>`;
      if (em) s += `<rect x="${pos ? cx : cx - w}" y="${y}" width="${w}" height="24" rx="4" class="${pos ? "f-hl" : "f-sell"}"/><text x="${pos ? cx + w + 8 : cx - w + 10}" y="${y + 17}" class="${pos ? "t-gamma" : "t-w"} t-b">${pos ? "Call Wall" : "Put Wall"}</text>`;
    });
    return s;
  }
  // 總 GEX 曲線（假設價格移到 S）
  const FR = frame({ lo: 26300, hi: 27700, ymin: -1500, ymax: 1500, y0: 70, y1: 320 });
  function flipPic(upto, o = {}) {
    let s = FR.axis("假設價格在這裡，總 GEX（百萬美元）", [26400, 26800, 27200, 27600]);
    s += `<text x="74" y="${FR.Y(1000) + 4}" text-anchor="end" class="t-mute">+1,000</text><text x="74" y="${FR.Y(-1000) + 4}" text-anchor="end" class="t-mute">−1,000</text>`;
    s += FR.fn((S) => net(S, base), "s-line", 2) + FR.fn((S) => net(S, base), "s-ink", 3, upto);
    const sx = lerp(26300, 27700, upto);
    if (upto < 1) { const v = net(sx, base); s += `<line x1="${FR.X(sx)}" x2="${FR.X(sx)}" y1="70" y2="320" class="s-line"/><circle cx="${FR.X(sx)}" cy="${FR.Y(v)}" r="7" class="${v >= 0 ? "f-hl" : "f-sell"}"/>`; }
    if (o.flip && upto * 1400 + 26300 >= FL) s += `<circle cx="${FR.X(FL)}" cy="${FR.Y(0)}" r="9" class="f-none s-hl" stroke-width="3"/><text x="${FR.X(FL) + 12}" y="${FR.Y(0) + 26}" class="t-gamma t-b">Flip ≈ ${fx(Math.round(FL / 5) * 5)}</text>`;
    if (o.now) s += `<line x1="${FR.X(27000)}" x2="${FR.X(27000)}" y1="70" y2="320" class="s-buy" stroke-dasharray="4 4"/><circle cx="${FR.X(27000)}" cy="${FR.Y(N0)}" r="7" class="f-buy"/><text x="${FR.X(27000) - 10}" y="${FR.Y(0) - 14}" text-anchor="end" class="t-buy t-b">現價 27,000：${sg(N0)}M</text>`;
    return s;
  }

  const STEPS = [
    { cap: "<b>未平倉量（OI）</b>：某個履約價「還沒平倉」的合約有幾口。這是 GEX 的原料，交易所每天公布一次。",
      why: "買方和賣方各一口才算一口 OI。OI 大，代表那個履約價有很多人持有部位，市商在那裡的對沖量也可能很大。", stuck: "OI 像停車場裡現在停了幾台車，不是今天進出幾台（那是成交量）。" },
    { cap: "關鍵假設：<b>客戶多半賣 Call、買 Put</b>（Put 當保險）。所以市商是<b>買 Call（正 Gamma）、賣 Put（負 Gamma）</b>。Call 算正號，Put 算負號。",
      why: "公開的 OI 看不出誰買誰賣，只能用這個常見假設。假設錯了，GEX 的正負就會算錯（最後會講）。", dur: 2600 },
    { cap: "每個履約價：<b>GEX ＝ Gamma × OI × 20 × 價格² × 1%</b>。27,000 的 Call OI 5,200 口，算出來約 <b>" + sg(C27.gc) + " 百萬美元</b>。",
      why: "意思是：價格動 1%，市商在這個履約價大約要買賣價值 " + fx(C27.gc) + " 百萬美元的期貨。20 是 NQ 選擇權每點 $20；乘價格² × 1% 是把 Gamma 換成「動 1% 要買賣多少錢」。" },
    { cap: "換你算：27,000 的 Put OI 4,200 口，算出來約 " + fx(-C27.gp) + " 百萬。",
      q: { t: "27,000 這個履約價的淨 GEX 大約是多少？", o: [
        ["約 " + sg(C27.g) + " 百萬", true, "Call 算正、Put 算負：" + fx(C27.gc) + " − " + fx(-C27.gp) + " ≈ " + sg(C27.g) + "。"],
        ["約 +" + fx(C27.gc - C27.gp) + " 百萬", false, "Put 要算負號（市商賣 Put），不是加上去。"],
        ["約 −" + fx(-C27.gp) + " 百萬", false, "還要加上 Call 的正 GEX。"]] } },
    { cap: "每個履約價都這樣算一次，就得到一排<b>淨 GEX</b>：上面的履約價 Call 多、偏正；下面的履約價 Put 多、偏負。",
      why: "這很常見：價格上方的 Call 多半是有人賣出收權利金，下方的 Put 多半是有人買來保險。", dur: 2600 },
    { cap: "畫成長條：正的往右、負的往左。<b>Call Wall</b> ＝ 正 GEX 最大的履約價（" + fx(CW.K) + "）；<b>Put Wall</b> ＝ 負 GEX 最大的履約價（" + fx(PW.K) + "）。",
      why: "牆附近的對沖量最大，常被當成阻力和支撐參考。但它只是「量最大」，不保證價格一定在那裡轉向。", dur: 2600 },
    { cap: "想一想：交易所隔天公布，27,300 的 Call OI 從 7,400 增加到 12,000。",
      q: { t: "最可能發生什麼？", o: [
        ["Call Wall 留在 27,300，而且更明顯", true, "那個履約價的正 GEX 變大，本來就是最大的正長條，現在更突出。"],
        ["Put Wall 移到 27,300", false, "Put Wall 看的是負 GEX 最大的地方。"],
        ["什麼都不變", false, "GEX 就是用 OI 算的，OI 變了一定會變。"]] } },
    { cap: "<b>Flip</b> 怎麼找：假設價格移到某個位置，把所有履約價的 GEX 重算加總。從左掃到右，找總 GEX <b>由負轉正</b>的那個價位。",
      why: "注意這跟長條圖不同：長條圖是「價格不動，每個履約價各自多少」；這條曲線是「價格移過去，全部加起來多少」。", dur: 3600 },
    { cap: "現價 27,000 在 Flip（約 " + fx(Math.round(FL / 5) * 5) + "）<b>下方</b>，總 GEX 是 " + sg(N0) + " 百萬：市商整體偏負 Gamma，比較像<b>雪球</b>環境。",
      why: "價格在 Flip 上方，總 GEX 為正，對沖像彈簧，容易震盪；在 Flip 下方，總 GEX 為負，容易走得又快又遠。" },
    { cap: "想一想：價格從 27,000 漲到 27,250。",
      q: { t: "環境會怎麼變？", o: [
        ["跨過 Flip，總 GEX 轉正，比較像彈簧", true, "27,250 在 Flip 上方，總 GEX 變正，市商的對沖改成逆勢，波動容易變小。"],
        ["還是雪球，因為 GEX 是固定的", false, "總 GEX 會隨價格位置改變，這正是 Flip 的意思。"],
        ["Put Wall 會跟著上移到 27,250", false, "牆是用 OI 算的，價格移動不會直接改變 OI。"]] } },
    { cap: "要誠實：整套計算建立在「市商買 Call、賣 Put」的假設上。如果某段時間客戶大量<b>買</b> Call，市商其實是負 Gamma，Call 那邊的正號就錯了。OI 也一天只更新一次。",
      why: "所以 GEX 是<b>估計</b>，不是市商的真實部位。不同網站的假設和資料來源不同，算出來的牆和 Flip 也會不一樣。" },
    { cap: "整理：<b>GEX ＝ Gamma × OI × 20 × 價格² × 1%</b>，Call 正、Put 負。牆是最大的長條，Flip 是總 GEX 變號的價位。",
      why: "下一關看時間：越接近到期，這些牆會變得更尖，到期一過又會突然消失。" }
  ];

  function draw(svg, i, t) {
    const e = ease(t); let s = "";
    if (i === 0) s += chainTab(t);
    else if (i === 1) {
      s += `<g opacity="${seg(t, 0, 0.4)}"><rect x="70" y="80" width="230" height="200" rx="14" class="f-buy-soft"/><text x="185" y="120" text-anchor="middle" class="t-ink t-b t-lg">Call</text><text x="185" y="160" text-anchor="middle" class="t-ink">客戶賣 → 市商買</text><text x="185" y="200" text-anchor="middle" class="t-gamma t-b">正 Gamma（＋）</text></g>`;
      s += `<g opacity="${seg(t, 0.4, 0.8)}"><rect x="340" y="80" width="230" height="200" rx="14" class="f-sell-soft"/><text x="455" y="120" text-anchor="middle" class="t-ink t-b t-lg">Put</text><text x="455" y="160" text-anchor="middle" class="t-ink">客戶買 → 市商賣</text><text x="455" y="200" text-anchor="middle" class="t-sell t-b">負 Gamma（−）</text></g><text x="320" y="320" text-anchor="middle" class="t-mute" opacity="${seg(t, 0.8, 1)}">這是假設，不是看得到的事實</text>`;
    } else if (i === 2 || i === 3) {
      const terms = [["Gamma", (B(27000, 27000, 7).gamma * 1e4).toFixed(2) + "（萬分之）"], ["× OI", i === 2 ? "5,200 口" : "4,200 口"], ["× 20 × 價格² × 1%", "換成美元"], ["＝ GEX", i === 2 ? sg(C27.gc) + "M" : "−" + fx(-C27.gp) + "M"]];
      terms.forEach(([a, b], k) => { const x = 50 + k * 140, op = i === 2 ? seg(t, k * 0.2, k * 0.2 + 0.25) : 1, last = k === 3;
        s += `<g opacity="${op}"><rect x="${x}" y="120" width="128" height="100" rx="12" class="${last ? (i === 2 ? "f-gamma-soft" : "f-sell-soft") : "f-surface"} s-line"/><text x="${x + 64}" y="160" text-anchor="middle" class="t-ink t-b">${a}</text><text x="${x + 64}" y="190" text-anchor="middle" class="t-mute">${b}</text></g>`; });
      s += `<text x="50" y="90" class="t-ink t-b">27,000 ${i === 2 ? "Call" : "Put"}</text>`;
      if (i === 3) s += chip(320, 290, "Call ＋ Put ＝ ？", "hl");
    } else if (i === 4) s += chainTab(1, { gex: true, gt: t });
    else if (i === 5 || i === 6) { s += bars(i === 5 ? t : 1, { walls: i === 5 ? t > 0.6 : true }); if (i === 6) s += chip(470, 360, "27,300 的 OI 大增", "hl"); }
    else if (i === 7) s += flipPic(Math.max(0.02, e), { flip: true });
    else if (i === 8) s += flipPic(1, { flip: true, now: true }) + `<text x="560" y="110" text-anchor="end" class="t-gamma t-b" opacity="${seg(t, 0.3, 0.7)}">Flip 上方：彈簧</text><text x="160" y="300" class="t-sell t-b" opacity="${seg(t, 0.5, 0.9)}">Flip 下方：雪球</text>`;
    else if (i === 9) s += flipPic(1, { flip: true }) + `<line x1="${FR.X(27250)}" x2="${FR.X(27250)}" y1="70" y2="320" class="s-buy" stroke-dasharray="4 4"/>` + chip(FR.X(27250), 90, "漲到 27,250", "buy");
    else if (i === 10) s += cards([["假設", "市商買 Call、賣 Put"], ["可能錯", "客戶大量買 Call 時，Call 那邊其實是負 Gamma"], ["更新慢", "OI 一天只公布一次"], ["結論", "GEX 是估計，不是市商的真實部位"]], t, { hl: 3 });
    else s += cards([["OI", "還沒平倉的合約口數"], ["GEX 公式", "Gamma × OI × 20 × 價格² × 1%"], ["符號", "Call 正、Put 負（假設）"], ["牆", "正、負 GEX 最大的履約價"], ["Flip", "總 GEX 由負轉正的價位"]], t, { hl: 4 });
    svg.innerHTML = s;
  }

  const simHTML = `<div class="gx-grid"><div class="table-wrap"><table class="gx-tab"><thead><tr><th>履約價</th><th class="num">Call OI</th><th class="num">Put OI</th><th class="num">淨 GEX（百萬）</th></tr></thead><tbody></tbody></table></div><svg class="fpx gx-flip" viewBox="0 0 640 380" role="img" aria-label="不同價格下的總 GEX"></svg></div>
<div class="btn-row"><button class="btn gx-reset" type="button">回到原始數字</button></div><div class="gx-out kpi-row"></div><ul class="sim-task gx-task"></ul>`;
  function simMount(box) {
    const q = (s) => box.querySelector(s), ch = base.map((r) => r.slice()), done = {};
    function paint(rebuild) {
      const P = ch.map(([K, c, p]) => ({ K, c, p, g: gexK(27000, K, c, p) })), cw = P.reduce((a, b) => (b.g > a.g ? b : a)), pw = P.reduce((a, b) => (b.g < a.g ? b : a));
      const fl = flip(ch), n0 = net(27000, ch);
      if (rebuild) q(".gx-tab tbody").innerHTML = P.map((r, i) => `<tr><td>${fx(r.K)}<span class="gx-tag"></span></td><td class="num"><input class="gx-in" type="number" step="100" min="0" value="${r.c}" data-i="${i}" data-c="1" aria-label="${r.K} Call OI"></td><td class="num"><input class="gx-in" type="number" step="100" min="0" value="${r.p}" data-i="${i}" data-c="2" aria-label="${r.K} Put OI"></td><td class="num gx-g"></td></tr>`).join("");
      box.querySelectorAll(".gx-tab tbody tr").forEach((tr, i) => { const r = P[i], g = tr.querySelector(".gx-g"); g.textContent = sg(r.g); g.className = "num gx-g " + (r.g >= 0 ? "gx-pos" : "gx-neg"); tr.querySelector(".gx-tag").innerHTML = r === cw ? ' <span class="chip gamma">Call Wall</span>' : r === pw ? ' <span class="chip sell">Put Wall</span>' : ""; });
      const F2 = frame({ lo: 26300, hi: 27700, ymin: -2000, ymax: 2000, y0: 70, y1: 320 });
      let s = F2.axis("假設價格在這裡，總 GEX（百萬美元）", [26400, 26800, 27200, 27600]) + F2.fn((S) => Math.max(-2000, Math.min(2000, net(S, ch))), "s-ink", 3);
      s += `<line x1="${F2.X(27000)}" x2="${F2.X(27000)}" y1="70" y2="320" class="s-buy" stroke-dasharray="4 4"/><text x="${F2.X(27000) + 6}" y="86" class="t-buy t-b">現價</text>`;
      if (fl) s += `<circle cx="${F2.X(fl)}" cy="${F2.Y(0)}" r="9" class="f-none s-hl" stroke-width="3"/><text x="${F2.X(fl) + 12}" y="${F2.Y(0) + 26}" class="t-gamma t-b">Flip ≈ ${fx(fl)}</text>`;
      q(".gx-flip").innerHTML = s;
      q(".gx-out").innerHTML = `<div><span class="t1">Call Wall</span><b>${fx(cw.K)}</b></div><div><span class="t1">Put Wall</span><b>${fx(pw.K)}</b></div><div><span class="t1">Flip</span><b>${fl ? "≈ " + fx(fl) : "範圍內沒有"}</b></div><div><span class="t1">現價的總 GEX</span><b class="${n0 >= 0 ? "gx-pos" : "gx-neg"}">${sg(n0)}M</b></div>`;
      if (cw.K !== CW.K) done.a = true; if (n0 >= 0) done.b = true; if (fl && Math.abs(fl - FL) > 80 && fl < FL) done.c = true;
      q(".gx-task").innerHTML = [["a", "任務 1：改 OI，讓 Call Wall 搬到別的履約價"], ["b", "任務 2：讓現價 27,000 的總 GEX 變成正的（彈簧）"], ["c", "任務 3：讓 Flip 往下移超過 80 點（提示：減少下方 Put 或增加 Call）"]].map(([k, tx]) => `<li class="${done[k] ? "ok" : ""}">${done[k] ? "✓" : "○"} ${tx}</li>`).join("");
    }
    q(".gx-tab").addEventListener("change", (e) => { const t = e.target; if (!t.dataset.i) return; ch[+t.dataset.i][+t.dataset.c] = Math.max(0, +t.value || 0); paint(false); });
    q(".gx-reset").addEventListener("click", () => { base.forEach((r, i) => { ch[i] = r.slice(); }); paint(true); });
    paint(true);
  }

  const QS = [
    { fig: `<p class="small q-cap">某履約價：Call GEX +120M，Put GEX −300M。</p>`, q: "這個履約價的淨 GEX 是多少？", step: 4, o: [
      ["−180M", true, "Call 算正、Put 算負：120 − 300 ＝ −180。"],
      ["+420M", false, "Put 要算負號。"],
      ["+180M", false, "符號反了：Put 比較大，淨值是負的。"]] },
    { fig: `<p class="small q-cap">長條圖上，正 GEX 最大的是 27,500，負 GEX 最大的是 26,500。</p>`, q: "Call Wall 和 Put Wall 分別在哪？", step: 6, o: [
      ["Call Wall 27,500，Put Wall 26,500", true, "Call Wall 是正 GEX 最大，Put Wall 是負 GEX 最大。"],
      ["Call Wall 26,500，Put Wall 27,500", false, "反了。"],
      ["兩個都在 27,000", false, "牆看的是長條最大的履約價，不是現價。"]] },
    { fig: `<p class="small q-cap">網站顯示 Flip 27,150，NQ 現在 26,900。</p>`, q: "目前比較像哪一種環境？", step: 9, o: [
      ["Flip 下方，總 GEX 偏負，比較像雪球", true, "價格在 Flip 下方，市商偏負 Gamma，波動容易被放大。"],
      ["Flip 下方，總 GEX 偏正，比較像彈簧", false, "Flip 下方總 GEX 是負的。"],
      ["跟 Flip 無關", false, "Flip 就是用來判斷正負環境的分界。"]] }
  ];

  PAGES["op-6"] = window.KIT.page(window.COURSE.OPC, "op-6", {
    topic: "從 OI 到 GEX",
    lede: "Call Wall、Put Wall、Flip 不是神秘指標，是用選擇權鏈的未平倉量（OI）算出來的。這關把公式拆開，一個履約價一個履約價算給你看。",
    analogy: [
      ["停車場", "<b>OI</b> 是停車場裡現在停了幾台車，GEX 是這些車同時開走時會造成多大的車流。"],
      ["兩面牆", "<b>Call Wall</b> 和 <b>Put Wall</b> 是對沖量最大的兩個履約價。"],
      ["分水嶺", "<b>Flip</b> 是總 GEX 變號的價位：上方像彈簧，下方像雪球。"]],
    steps: STEPS, draw, simHTML, simMount,
    simIntro: "直接改表格裡的 OI，看牆和 Flip 怎麼移動。現價固定在 27,000。",
    mist: [
      ["Call Wall 一定是阻力", "它只是正 GEX 最大的履約價，對沖量大，價格常在附近停頓，但突破也很常見。"],
      ["GEX 是市商的真實部位", "GEX 是用 OI 加上「市商買 Call、賣 Put」的假設推算出來的估計值。"],
      ["長條圖和 Flip 曲線是同一件事", "長條圖是價格不動、每個履約價各自多少；Flip 曲線是假設價格移過去、全部加起來多少。"]],
    faq: [
      ["OI 去哪裡看？", "交易所每天公布。GEX 網站和 GammaLens 這類工具會幫你抓下來算好（第 12 關）。"],
      ["為什麼要乘價格²？", "Gamma 是「每 1 點 Delta 變多少」。乘上價格和每點價值，換成「價格動 1% 要買賣多少美元」，不同商品才能比較。"],
      ["為什麼不同網站的牆不一樣？", "用的到期日、IV、假設和資料時間都不同。看同一個來源、長期觀察比較重要。"],
      ["Flip 一定存在嗎？", "不一定。如果整條曲線都是正或都是負，就找不到變號的位置。"],
      ["NQ 的 GEX 是用 NQ 選擇權算的嗎？", "有的是，有的是用 QQQ 選擇權算再換算成 NQ 價位（第 11、12 關）。"]],
    qs: QS,
    gloss: [
      ["OI（未平倉量）", "還沒平倉的合約口數，交易所每天公布一次。"],
      ["GEX", "Gamma × OI × 每點價值 × 價格² × 1%，價格動 1% 時市商要對沖的金額。"],
      ["淨 GEX", "Call 的正 GEX 加上 Put 的負 GEX。"],
      ["Call Wall", "正 GEX 最大的履約價。"],
      ["Put Wall", "負 GEX 最大的履約價。"],
      ["Flip", "假設價格移動、重算總 GEX，由負轉正的價位。"]],
    remember: "<b>GEX ＝ Gamma × OI × 20 × 價格² × 1%。</b>牆是最大的長條，Flip 是總 GEX 變號的價位，全部建立在「市商買 Call、賣 Put」的假設上。"
  });
})();
