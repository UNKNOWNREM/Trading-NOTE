/* 路線 2 第 10、11 關（新版）：GEX 地形圖、真實地形 */
(function () {
  const PAGES = (window.__PAGES = window.__PAGES || {});
  const { lerp, ease, seg, cards, chip } = window.KIT;
  const { fx, sg, CHAIN, net, flip, gexK, frame } = window.OPK;

  /* ---------- 第 10 關：GEX 地形圖 ---------- */
  // 地形示意用的選擇權鏈：下方 Put 堆積、上方 Call 堆積；離到期 2 天
  const TCH = [[26500, 200, 3000], [26600, 300, 7000], [26700, 400, 6000], [26800, 500, 2500], [26900, 800, 1200], [27000, 1500, 1200], [27100, 2500, 800], [27200, 4500, 500], [27300, 7000, 300], [27400, 6000, 200], [27500, 2500, 100]];
  const D0 = 2, NET = (S, d = D0) => net(S, TCH, d), FL = flip(TCH, D0, 26200, 27800);
  let hiS = 26200, loS = 26200, M2 = 1, M1 = 1;
  for (let S = 26200; S <= 27800; S += 10) { if (NET(S) < NET(hiS)) hiS = S; if (NET(S) > NET(loS)) loS = S; M2 = Math.max(M2, Math.abs(NET(S))); M1 = Math.max(M1, Math.abs(NET(S, 1))); }
  const mkF = (m) => frame({ lo: 26200, hi: 27800, ymin: -m * 1.25, ymax: m * 1.25, y0: 70, y1: 320 });
  let FR = mkF(M2);
  // 地形：高度＝−淨 GEX
  function land(morph, o = {}) {
    const d = o.d || D0, F0 = o.F || FR, lim = (F0 === FR ? M2 : M1) * 1.25, f = (S) => Math.max(-lim, Math.min(lim, lerp(NET(S, d), -NET(S, d), morph)));
    let s = `<line x1="80" x2="600" y1="${F0.Y(0)}" y2="${F0.Y(0)}" class="s-line"/>` + [26400, 26800, 27200, 27600].map((p) => `<text x="${F0.X(p)}" y="342" text-anchor="middle" class="t-mute">${fx(p)}</text>`).join("");
    if (morph > 0.5) { const pts = []; for (let S = 26200; S <= 27800; S += 10) pts.push(`${F0.X(S).toFixed(1)},${F0.Y(f(S)).toFixed(1)}`); s += `<polygon points="80,320 ${pts.join(" ")} 600,320" class="f-surface" opacity="${(morph - 0.5) * 2}"/>`; }
    s += F0.fn(f, morph > 0.5 ? "s-ink" : "s-gamma", 3, o.upto == null ? 1 : o.upto);
    if (o.lab !== false) s += `<text x="80" y="50" class="t-mute">${morph > 0.5 ? "地形高度＝淨 GEX 翻過來（越負越高）" : "假設價格在這裡的總 GEX"}</text>`;
    return { s, Yat: (S) => F0.Y(f(S)) };
  }
  const ball = (S, Yat, cls = "f-buy") => `<circle cx="${FR.X(S)}" cy="${Yat(S) - 12}" r="11" class="${cls}"/>`;

  const STEPS = [
    { cap: "第 7 關的 Flip 曲線：假設價格移到某處，總 GEX 是多少。左邊負、右邊正。現在把它<b>上下翻過來</b>，變成一片地形。",
      why: "翻過來之後：GEX 越正，地形越低（谷）；GEX 越負，地形越高（山）。這只是為了好理解的畫法，不是物理公式。", dur: 3200, stuck: "想成把一張紙翻面：原本往上凸的地方，翻過來就變成往下凹。" },
    { cap: "<b>谷底＝正 GEX</b>（約 " + fx(loS) + "）。把球往旁邊推，它會滑回來、來回晃、越晃越小。市商逆勢對沖，價格<b>黏住、走不遠</b>。",
      why: "這就是第 6 關的「彈簧」：漲了市商賣、跌了市商買，價格被拉回中間。", dur: 3400 },
    { cap: "<b>山頂＝負 GEX</b>（約 " + fx(hiS) + "）。球放在山頂，稍微一推就滾下去，<b>越滾越快</b>。市商順勢追單，價格容易一路衝。",
      why: "這是「雪球」：漲了市商買、跌了市商賣，對沖和價格同方向。", dur: 3200 },
    { cap: "想一想：價格在谷底附近，一個小消息把價格推高 60 點，之後沒有新消息。",
      q: { t: "接下來最可能怎樣？", o: [
        ["被拉回谷底附近來回震盪", true, "谷底是正 GEX，市商在上方賣、下方買，價格容易被拉回。"],
        ["越漲越快，一路衝上去", false, "那是山頂（負 GEX）的行為。"],
        ["一定會停在新的位置不動", false, "正 GEX 會把價格往回推，不是停住。"]] } },
    { cap: "<b>Flip</b>（約 " + fx(Math.round(FL / 5) * 5) + "）就是地形高度回到 0 的地方：左邊是山區（負 GEX），右邊是谷區（正 GEX）。",
      why: "價格在 Flip 哪一邊，就大致決定了今天比較像彈簧還是雪球。", dur: 2400 },
    { cap: "時間也會改變地形：同一批 OI，剩 7 天時地形平緩；剩 1 天時，谷更深、山更尖（第 8 關）。",
      why: "Gamma 越接近到期越集中在履約價附近，地形的起伏也就越劇烈。", dur: 3200 },
    { cap: "常見兩種畫法：<b>鋸齒狀</b>是價格不動、每個履約價各自的 GEX（多數網站的長條圖）；<b>平滑</b>是價格移過去時的總 GEX（Flip 用的）。",
      why: "鋸齒狀直接反映 OI 堆在哪；平滑的更接近「價格走到那裡時會感受到的力量」。兩種都有用，但不要混在一起看。", dur: 2600 },
    { cap: "想一想：你在網路上看到一張 GEX 3D 圖，上面有很高的山峰。",
      q: { t: "第一件事該確認什麼？", o: [
        ["高度軸代表什麼：正 GEX 還是負 GEX", true, "有些圖直接把 GEX 畫成高度，那樣「高峰」是正 GEX，意思剛好和這裡相反。"],
        ["山峰的顏色好不好看", false, "顏色只是輔助，重點是高度的定義。"],
        ["山越高越該做空", false, "要先知道高度代表什麼，才談得上怎麼用。"]] } },
    { cap: "要誠實：地形只是<b>市商對沖這一股力量</b>。新聞和大單都可以直接把球推過山頂；而且這片地形是用 OI 和假設估出來的。",
      why: "把它當成「今天的路況」：知道哪裡比較黏、哪裡比較滑，但開車的還是整個市場。" },
    { cap: "整理：<b>谷底＝正 GEX</b>，價格黏住；<b>山頂＝負 GEX</b>，價格容易衝；<b>Flip</b> 是山區和谷區的分界；越接近到期，地形越陡。",
      why: "下面的練習區可以旋轉 3D 地形、切一刀看橫切面、放一顆球看它往哪滾。下一關改用真實格式的每日紀錄來看。" }
  ];

  function draw(svg, i, t) {
    let s = "";
    if (i === 0) { const m = ease(seg(t, 0.35, 0.85)); s += land(m).s; if (t < 0.35) s += `<text x="${FR.X(hiS)}" y="${FR.Y(NET(hiS)) + 26}" text-anchor="middle" class="t-sell t-b">負</text><text x="${FR.X(loS)}" y="${FR.Y(NET(loS)) - 12}" text-anchor="middle" class="t-gamma t-b">正</text>`; }
    else if (i === 1 || i === 3) {
      const L = land(1), amp = i === 1 ? 220 * Math.exp(-3 * t) * Math.cos(t * 18) : 60, S = loS + amp;
      s += L.s + ball(S, L.Yat) + `<text x="${FR.X(loS)}" y="${L.Yat(loS) + 30}" text-anchor="middle" class="t-gamma t-b">谷底：正 GEX</text>`;
      if (i === 3) s += chip(Math.min(500, FR.X(loS)), 110, "被推高 60 點之後？", "hl");
    } else if (i === 2) {
      const L = land(1), S = hiS + (t < 0.25 ? 0 : 560 * Math.pow((t - 0.25) / 0.75, 2));
      s += L.s + ball(Math.min(27780, S), L.Yat, "f-sell") + `<text x="${FR.X(hiS)}" y="${L.Yat(hiS) - 34}" text-anchor="middle" class="t-sell t-b">山頂：負 GEX</text>`;
    } else if (i === 4) {
      const L = land(1); s += L.s + `<line x1="${FR.X(FL)}" x2="${FR.X(FL)}" y1="70" y2="320" class="s-gamma" stroke-dasharray="4 4" opacity="${seg(t, 0, 0.4)}"/><text x="${FR.X(FL) + 8}" y="${FR.Y(0) - 10}" class="t-gamma t-b" opacity="${seg(t, 0.2, 0.5)}">Flip</text>`;
      s += `<text x="${FR.X(hiS)}" y="300" text-anchor="middle" class="t-sell t-b" opacity="${seg(t, 0.4, 0.7)}">山區：雪球</text><text x="${FR.X(loS)}" y="110" text-anchor="middle" class="t-gamma t-b" opacity="${seg(t, 0.6, 0.9)}">谷區：彈簧</text>`;
    } else if (i === 5) {
      const d = lerp(7, 1, ease(seg(t, 0.1, 0.9))); const L = land(1, { d, lab: false, F: mkF(M1) });
      s += L.s + `<text x="80" y="50" class="t-mute">同一批 OI，剩 ${d.toFixed(1)} 天</text>`;
    } else if (i === 6) {
      // 左：鋸齒長條；右：平滑曲線
      const mx = Math.max(...TCH.map(([K, c, p]) => Math.abs(gexK(27000, K, c, p, D0)))); s += `<text x="80" y="50" class="t-mute">鋸齒：價格不動，每個履約價各自的 GEX</text><line x1="80" x2="600" y1="140" y2="140" class="s-line"/>`;
      TCH.forEach(([K, c, p], k) => { const g = gexK(27000, K, c, p, D0), h = (g / mx) * 70 * ease(seg(t, 0, 0.5)), x = FR.X(K) - 12;
        s += `<rect x="${x}" y="${h >= 0 ? 140 - h : 140}" width="24" height="${Math.max(1, Math.abs(h))}" rx="3" class="${g >= 0 ? "f-gamma-soft" : "f-sell-soft"}"/>`; });
      s += `<g opacity="${seg(t, 0.5, 1)}"><text x="80" y="226" class="t-mute">平滑：價格移過去時的總 GEX</text>`;
      const pts = []; for (let S = 26300; S <= 27700; S += 10) pts.push(`${FR.X(S).toFixed(1)},${(290 - (NET(S) / M2) * 50).toFixed(1)}`);
      s += `<line x1="80" x2="600" y1="290" y2="290" class="s-line"/><polyline points="${pts.join(" ")}" class="s-ink f-none" stroke-width="3"/></g>` + [26600, 27000, 27400].map((p) => `<text x="${FR.X(p)}" y="362" text-anchor="middle" class="t-mute">${fx(p)}</text>`).join("");
    } else if (i === 7) {
      const X = (k) => lerp(140, 500, k);
      s += `<text x="90" y="50" class="t-mute">別人的 3D 圖（示意）</text>`;
      for (let k = 0; k < 12; k++) { const h = 40 + 150 * Math.exp(-Math.pow((k - 6) / 2.2, 2)) + 20 * Math.sin(k * 1.7);
        s += `<path d="M${X(k / 12)} 300 l40 0 l25 -18 l0 ${-h} l-40 0 l-25 18 z" class="f-gamma-soft s-line"/><path d="M${X(k / 12)} ${300 - h} l40 0 l25 -18 l-40 0 z" class="f-hl"/>`; }
      s += chip(320, 340, "高峰代表什麼？", "hl");
    } else if (i === 8) s += cards([["一股力量", "地形只代表市商的對沖"], ["會被推過", "新聞、大單可以直接把球推過山頂"], ["是估計", "用 OI 和「市商買 Call、賣 Put」的假設算出來"], ["怎麼用", "當成今天的路況，不是方向訊號"]], t, { hl: 3 });
    else s += cards([["谷底", "正 GEX：價格黏住、走不遠"], ["山頂", "負 GEX：價格容易衝"], ["Flip", "山區和谷區的分界"], ["接近到期", "谷更深、山更尖"], ["看別人的圖", "先確認高度軸的定義"]], t, { hl: 0 });
    svg.innerHTML = s;
  }

  const QS = [
    { fig: `<p class="small q-cap">在這套地形圖裡，某個價位是很深的谷底。</p>`, q: "那裡的 GEX 是？", step: 2, o: [
      ["很大的正 GEX", true, "高度＝淨 GEX 翻過來，越正越低。谷底是正 GEX。"],
      ["很大的負 GEX", false, "負 GEX 在這裡畫成山頂。"],
      ["GEX 是 0", false, "0 是地形高度 0 的地方，也就是 Flip 附近。"]] },
    { fig: `<p class="small q-cap">價格剛好在山頂附近，市場出現一筆大賣單。</p>`, q: "最可能怎樣？", step: 3, o: [
      ["往下滾得很快，市商也跟著賣", true, "山頂是負 GEX，市商的對沖和價格同方向，下跌會被放大。"],
      ["很快被拉回山頂", false, "山頂不穩定，推一下就滾下去。"],
      ["完全不動", false, "大單加上負 GEX，價格很容易動。"]] },
    { fig: `<p class="small q-cap">同一批 OI，一張圖是剩 7 天、一張是剩 1 天。</p>`, q: "哪一張的地形比較陡？", step: 6, o: [
      ["剩 1 天", true, "越接近到期，Gamma 越集中，谷更深、山更尖。"],
      ["剩 7 天", false, "時間越長，地形越平緩。"],
      ["一樣陡", false, "時間會改變 Gamma，地形也會跟著變。"]] }
  ];

  PAGES["op-8"] = window.KIT.page(window.COURSE.OPC, "op-8", {
    topic: "GEX 地形圖",
    lede: "把 GEX 畫成一片地形，價格就是上面的一顆球：谷底會把球拉回來，山頂會把球推走。這關先看懂地形，再到練習區旋轉 3D 地形、放球試試看。",
    analogy: [
      ["山谷裡的球", "<b>谷底</b>（正 GEX）：推一下會滑回來，價格黏住。"],
      ["山頂上的球", "<b>山頂</b>（負 GEX）：推一下就滾下去，越滾越快。"],
      ["路況", "地形像今天的<b>路況</b>：哪裡黏、哪裡滑，但方向盤不在市商手上。"]],
    steps: STEPS, draw,
    simHTML: window.OP8.terHTML + window.OP8.notesHTML,
    simMount: (box) => window.OP8.mountTer(box),
    simIntro: "拖動 3D 地形旋轉；在 2D 橫切面上選一天、放一顆球，按「放開小球」看它往哪滾。",
    mist: [
      ["山頂一定是阻力", "山頂是負 GEX，價格一旦過去反而容易加速，不是一定會被擋住。"],
      ["谷底一定是支撐", "谷底會把價格拉回，但大消息可以直接把球推出谷外。"],
      ["每張 GEX 3D 圖的高度都一樣", "有些圖直接把 GEX 畫成高度，高峰是正 GEX，和這裡相反。"]],
    faq: [
      ["為什麼高度要把 GEX 翻過來？", "這樣「球往低處滾」剛好對上「正 GEX 把價格拉回」，比較直覺。"],
      ["3D 圖的前後軸是什麼？", "離到期的天數。越往前越接近到期，地形越陡。"],
      ["練習區的資料是真的嗎？", "不是，是模擬的選擇權鏈，形狀接近真實。下一關改用真實格式的紀錄。"],
      ["地形可以拿來決定做多做空嗎？", "比較適合拿來決定「今天預期波動大還是小」，例如目標放多遠、止損放多寬，再用訂單流確認方向。"]],
    qs: QS,
    gloss: [
      ["GEX 地形", "把總 GEX 翻過來畫成高度：正 GEX 是谷，負 GEX 是山。"],
      ["谷底", "正 GEX 區域，價格容易被拉回。"],
      ["山頂", "負 GEX 區域，價格容易加速離開。"],
      ["橫切面", "在某一天切一刀，看那天各價位的地形高度。"]],
    remember: "<b>谷底黏、山頂滑。</b>Flip 是兩區的分界；越接近到期地形越陡；地形只是市商這一股力量。"
  });

  /* ---------- 第 11 關：真實地形 ---------- */
  const R = [
    { d: "第 1 天", a: "第 2 天", ratio: 41.236, net: -310, hi: 28279.25, lo: 27234.75, big: [680, -77.6] },
    { d: "第 2 天", a: "第 3 天", ratio: 41.235, net: -1520, hi: 27498, lo: 26658.5, big: [670, -379.4] },
    { d: "第 3 天", a: "第 4 天", ratio: 41.224, net: -1060, hi: 27609.75, lo: 26921.75, big: [650, -132.5] },
    { d: "第 4 天", a: "第 5 天", ratio: 41.221, net: -1410, hi: 27838, lo: 26436, big: [650, -285.6] }];
  R.forEach((r) => { r.rg = r.hi ? r.hi - r.lo : null; r.bigP = Math.round(r.big[0] * r.ratio); });

  function netVsRange(n, t) {
    const X0 = 120; let s = `<text x="80" y="44" class="t-mute">前一天的淨 GEX　vs　隔天 NQ 實際走的範圍</text><line x1="${X0}" x2="${X0}" y1="60" y2="330" class="s-ink"/>`;
    R.slice(0, n).forEach((r, k) => {
      const y = 80 + k * 66, op = k === n - 1 ? seg(t, 0, 0.5) : 1, wn = (Math.abs(r.net) / 1600) * 190, wr = r.rg ? (r.rg / 1450) * 190 : 0;
      s += `<g opacity="${op}"><text x="${X0 - 8}" y="${y + 18}" text-anchor="end" class="t-ink t-b">${r.d}</text><rect x="${X0}" y="${y}" width="${wn}" height="22" rx="4" class="f-sell-soft"/><text x="${X0 + wn + 6}" y="${y + 16}" class="t-sell">${sg(r.net)}M</text>`;
      s += r.rg ? `<rect x="${X0 + 270}" y="${y}" width="${wr}" height="22" rx="4" class="f-buy-soft"/><text x="${X0 + 270 + wr + 6}" y="${y + 16}" class="t-buy">${fx(r.rg)} 點</text>` : `<text x="${X0 + 270}" y="${y + 16}" class="t-mute">${r.a} 是今天，還沒收盤</text>`;
      s += `</g>`;
    });
    s += `<text x="${X0}" y="360" class="t-sell t-b">淨 GEX</text><text x="${X0 + 270}" y="360" class="t-buy t-b">隔天範圍（高−低）</text>`;
    return s;
  }

  const RSTEPS = [
    { cap: "這關用<b>真實格式</b>的四天紀錄：QQQ 收盤後的 GEX 資料，三個到期日疊加，再換算成 NQ 價位。GEX 數字經過改寫，只作示範。",
      why: "練習區的 3D 地形和橫切面，都是用這四天的紀錄畫的。", stuck: "前面幾關是模擬的平滑曲線；這關的資料長得像你每天真的會讀到的樣子：不規則、只有十幾檔、還會互相矛盾。" },
    { cap: "換算：<b>NQ 價位 ≈ QQQ 價位 × 當天比例</b>。例如第 2 天比例 " + R[1].ratio + "，QQQ 670 ≈ NQ <b>" + fx(R[1].bigP) + "</b>。",
      why: "比例＝NQ 價格 ÷ QQQ 價格，每天會小幅變動。換算後的價位會有幾點到十幾點的誤差（第 12 關）。" },
    { cap: "換你算：第 4 天的比例是 " + R[3].ratio + "，最大的負 GEX 在 QQQ 650。",
      q: { t: "換成 NQ 大約是多少？", o: [
        ["約 " + fx(R[3].bigP), true, "650 × " + R[3].ratio + " ≈ " + fx(R[3].bigP) + "。"],
        ["約 " + fx(650 * 40), false, "比例不是 40，要用當天的 " + R[3].ratio + "。"],
        ["650", false, "那是 QQQ 的價位，還要乘比例才是 NQ。"]] } },
    { cap: "第 2 天收盤的資料：淨 GEX <b>" + sg(R[1].net) + " 百萬</b>，非常負；最大的負 GEX 在 QQQ 670（≈ NQ " + fx(R[1].bigP) + "）。隔天（第 3 天），NQ 走了 <b>" + fx(R[1].rg) + " 點</b>。",
      why: "淨 GEX 很負＝整體偏雪球環境，預期波動放大。那天確實走得不小。" },
    { cap: "想一想：前一天淨 GEX 是 −1,500M（很負）。",
      q: { t: "隔天比較合理的心理準備是？", o: [
        ["波動可能比較大，目標和止損都要放寬", true, "負 GEX 環境，市商追單，價格容易走得又快又遠。"],
        ["一定會大漲", false, "負 GEX 只說波動可能放大，不說方向。"],
        ["一定是小區間震盪", false, "那比較像正 GEX 環境。"]] } },
    { cap: "但看第 1 天：淨 GEX 只有 <b>" + sg(R[0].net) + "M</b>（比較不負），隔天卻走了 <b>" + fx(R[0].rg) + " 點</b>，四天裡最大。",
      why: "這就是要誠實面對的地方：淨 GEX 只是一股力量。那天可能有其他因素（消息、開盤跳空），GEX 沒有預測到。" },
    { cap: "前三天放在一起：淨 GEX 越負，隔天範圍<b>不一定</b>越大。三個樣本太少，什麼都證明不了。",
      why: "要知道 GEX 對你的交易有沒有用，需要幾十天甚至更多的紀錄，再統計（第 12 關的每日紀錄流程）。", dur: 3000 },
    { cap: "第 4 天的資料：淨 GEX " + sg(R[3].net) + "M，最大負 GEX 約 NQ " + fx(R[3].bigP) + "。隔天走了 <b>" + fx(R[3].rg) + " 點</b>（27,838 → 26,436），四天裡最大，而且是先漲後跌。",
      why: "淨 GEX 很負、隔天振幅很大，這次吻合。但四個樣本裡也有第 1 天那種反例，還是要累積下去。每天收盤後記下「前一天淨 GEX」和「隔天實際範圍」，就是在幫自己建立證據。" },
    { cap: "整理：每天的紀錄要<b>換算</b>（QQQ × 比例）、要<b>記錄</b>（前一天 GEX vs 隔天範圍），也要<b>誠實</b>：樣本少的時候，不要太快下結論。",
      why: "下面的練習區可以旋轉這四天的 3D 地形、切換每一天，看隔天價格實際走過哪裡。" }
  ];
  function rdraw(svg, i, t) {
    let s = "";
    if (i === 0) s += cards([["來源", "QQQ 收盤 GEX（數字改寫）"], ["範圍", "最近三個到期日疊加（3 exp stacked）"], ["換算", "QQQ 價位 × 當天比例 ≈ NQ"], ["日期", "連續四個交易日"]], t, { hl: 2 });
    else if (i === 1 || i === 2) {
      const r = i === 1 ? R[1] : R[3];
      s += `<rect x="70" y="120" width="160" height="110" rx="12" class="f-surface s-line"/><text x="150" y="160" text-anchor="middle" class="t-mute">QQQ</text><text x="150" y="200" text-anchor="middle" class="t-ink t-b t-lg">${r.big[0]}</text>`;
      s += `<text x="260" y="186" class="t-ink t-xl">×</text><rect x="300" y="120" width="130" height="110" rx="12" class="f-surface s-line"/><text x="365" y="160" text-anchor="middle" class="t-mute">比例</text><text x="365" y="200" text-anchor="middle" class="t-ink t-b">${r.ratio}</text>`;
      s += `<g opacity="${i === 1 ? seg(t, 0.4, 0.8) : 0}"><text x="450" y="186" class="t-ink t-xl">≈</text><rect x="490" y="120" width="120" height="110" rx="12" class="f-gamma-soft"/><text x="550" y="160" text-anchor="middle" class="t-mute">NQ</text><text x="550" y="200" text-anchor="middle" class="t-ink t-b t-lg">${fx(r.bigP)}</text></g>`;
      s += `<text x="70" y="90" class="t-ink t-b">${r.d} 的資料</text>`;
      if (i === 2) s += chip(550, 175, "≈ ？", "hl");
    } else if (i === 3 || i === 4) s += netVsRange(2, i === 3 ? t : 1).replace(/<g opacity="[^"]*">(<text[^>]*>第 1 天)/, '<g opacity="0.25">$1') + (i === 4 ? chip(470, 300, "隔天的心理準備？", "hl") : "");
    else if (i === 5) s += netVsRange(2, 1);
    else if (i === 6) s += netVsRange(3, t);
    else if (i === 7) s += netVsRange(4, t);
    else s += cards([["換算", "QQQ × 當天比例 ≈ NQ"], ["記錄", "前一天淨 GEX vs 隔天範圍"], ["誠實", "三個樣本什麼都證明不了"], ["持續", "累積幾十天再統計"]], t, { hl: 2 });
    svg.innerHTML = s;
  }

  const RQS = [
    { fig: `<p class="small q-cap">比例 41.2，QQQ 的 Put Wall 在 660。</p>`, q: "NQ 的 Put Wall 大約在？", step: 3, o: [
      ["約 27,190", true, "660 × 41.2 ≈ 27,192。"],
      ["約 26,400", false, "那是 660 × 40，比例用錯了。"],
      ["660", false, "那是 QQQ 價位。"]] },
    { fig: `<p class="small q-cap">連續三天的紀錄裡，淨 GEX 最不負的那天，隔天範圍反而最大。</p>`, q: "最合理的結論是？", step: 7, o: [
      ["樣本太少，GEX 只是其中一股力量，要繼續記錄", true, "三天不足以證明或推翻任何規律。"],
      ["GEX 完全沒用，可以丟掉", false, "三天也不足以證明它沒用。"],
      ["GEX 越負，隔天範圍越小", false, "三個樣本不能下這種結論。"]] },
    { fig: `<p class="small q-cap">你想知道 GEX 對自己的 NQ 交易有沒有幫助。</p>`, q: "最好的做法是？", step: 8, o: [
      ["每天記錄前一天的淨 GEX 和隔天實際範圍，累積夠多再統計", true, "建立自己的證據，比相信任何人的說法都可靠。"],
      ["看幾天覺得準就重倉", false, "幾天的樣本很容易是巧合。"],
      ["只記準的那幾天", false, "只記準的會讓你高估它的效果。"]] }
  ];

  PAGES["op-real"] = window.KIT.page(window.COURSE.OPC, "op-real", {
    topic: "真實地形",
    lede: "前面的地形都是模擬的。這關用真實格式的四天紀錄（數字改寫）：怎麼換算成 NQ、怎麼和隔天實際走勢對照，也誠實看看它哪裡沒說中。",
    analogy: [
      ["換匯", "QQQ 的價位要<b>乘上比例</b>才是 NQ，就像外幣要乘匯率。"],
      ["天氣日記", "每天記下<b>前一天的 GEX</b> 和<b>隔天的範圍</b>，久了才知道它準不準。"],
      ["三張照片", "<b>三天的資料</b>像三張照片，拼不出整部電影。"]],
    steps: RSTEPS, draw: rdraw,
    simHTML: window.OP8.realHTML,
    simMount: (box) => window.OP8.mountReal(box),
    simIntro: "旋轉四天的地形，切換每一天，看橫切面上的 GEX 和隔天價格實際走過的範圍。",
    mist: [
      ["換算後的價位是精確的", "比例每天變、QQQ 和 NQ 的交易時間也不同，會有幾點到十幾點的誤差。"],
      ["一兩天說中就代表有效", "樣本太少，很容易是巧合。"],
      ["說不中就代表 GEX 沒用", "GEX 本來就只是一股力量，要看長期統計。"]],
    faq: [
      ["為什麼用 QQQ 不用 NQ 選擇權？", "QQQ 選擇權的成交量和 OI 大很多，資料也比較容易取得。NQ 原生選擇權的 GEX 是另一條路。"],
      ["曲面模式裡灰色的地方是什麼？", "那天沒有紀錄的履約價，先當成 0 畫，不是真的 0。想看原始紀錄請切到柱子模式。"],
      ["每天什麼時候記錄？", "美股收盤後資料更新，記下淨 GEX、牆、Flip；隔天收盤再補上實際高低點。"]],
    qs: RQS,
    gloss: [
      ["換算比例", "NQ 價格 ÷ QQQ 價格，每天略有不同。"],
      ["3 exp stacked", "把最近三個到期日的 GEX 加在一起。"],
      ["隔天範圍", "隔天 NQ 最高價減最低價。"],
      ["樣本數", "記錄了幾天。越多，結論越可靠。"]],
    remember: "<b>每天的資料要換算、要記錄、要誠實。</b>三天什麼都證明不了，持續記錄才是你的優勢。"
  });
})();
