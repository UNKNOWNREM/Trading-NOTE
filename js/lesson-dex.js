/* 路線 2 第 12 關（新）：DEX 與怎麼讀 GammaLens */
(function () {
  const PAGES = (window.__PAGES = window.__PAGES || {});
  const { lerp, ease, seg, cards, chip } = window.KIT;
  const { B, fx, sg, CHAIN, net, flip } = window.OPK;

  // DEX（等值期貨口數）：市商買 Call（+Delta）、賣 Put（−Put Delta → +）
  const dexK = (F, K, c, p) => { const r = B(F, K, 7); return c * r.callDelta - p * r.putDelta; };
  const DX = CHAIN.map(([K, c, p]) => ({ K, v: dexK(27000, K, c, p) }));
  const DEX0 = DX.reduce((s, r) => s + r.v, 0), DEX1 = CHAIN.reduce((s, [K, c, p]) => s + dexK(27270, K, c, p), 0), DEXD = CHAIN.reduce((s, [K, c, p]) => s + dexK(26730, K, c, p), 0);
  const C27 = B(27000, 27000, 7);
  const FL = flip(CHAIN);

  // GammaLens 風格的示意面板
  function panel(t, o = {}) {
    const Y = (p) => 200 - (p - 27000) * 0.42;
    const lv = [[27300, "Call Wall", "s-gamma", "t-gamma"], [Math.round(FL / 5) * 5, "HVL／Flip", "s-ink", "t-ink"], [26700, "Put Wall", "s-sell", "t-sell"]];
    let s = `<rect x="70" y="40" width="500" height="320" rx="10" class="f-surface s-line"/><text x="86" y="64" class="t-mute">NQ（示意）</text>`;
    // K 線示意
    let p = o.px || 27000; const cs = [];
    for (let k = 0; k < 26; k++) { const o2 = p, c = p + 30 * Math.sin(k * 0.9) + (k % 5 - 2) * 8; cs.push([o2, c]); p = c; }
    cs.forEach(([a, b], k) => { const x = 90 + k * 12; s += `<rect x="${x}" y="${Y(Math.max(a, b))}" width="8" height="${Math.max(2, Math.abs(Y(a) - Y(b)))}" class="${b >= a ? "f-buy" : "f-sell"}" opacity="${seg(t, 0, 0.3)}"/>`; });
    lv.forEach(([v, lab, sc, tc], k) => { const op = seg(t, 0.3 + k * 0.15, 0.5 + k * 0.15), hl = o.hl === k;
      s += `<g opacity="${op}"><line x1="80" x2="560" y1="${Y(v)}" y2="${Y(v)}" class="${sc}" stroke-width="${hl ? 3.5 : 2}" stroke-dasharray="${k === 1 ? "6 5" : ""}"/><text x="556" y="${Y(v) - 6}" text-anchor="end" class="${tc} t-b">${lab} ${fx(v)}</text></g>`; });
    if (o.net !== false) s += `<g opacity="${seg(t, 0.8, 1)}"><rect x="86" y="318" width="170" height="30" rx="6" class="f-sell-soft"/><text x="171" y="338" text-anchor="middle" class="t-sell t-b">淨 GEX ${sg(net(27000))}M</text></g>`;
    return s;
  }

  const STEPS = [
    { cap: "<b>DEX</b>（Delta 曝險）：把每個履約價的 <b>Delta × OI</b> 加起來，估算市商手上的選擇權「等於幾口期貨」。",
      why: "第 3 關：Delta 也可以想成等於幾口期貨。DEX 就是把整條選擇權鏈的這個數字加總。", stuck: "GEX 告訴你「價格動了要調整多少」，DEX 告訴你「現在已經背了多少」。" },
    { cap: "例子：27,000 的 Call OI 5,200 口，Delta " + C27.callDelta.toFixed(2) + " → 約 <b>+" + fx(5200 * C27.callDelta) + " 口</b>。Put OI 4,200 口、Delta " + C27.putDelta.toFixed(2) + "，市商賣 Put → 約 <b>+" + fx(-4200 * C27.putDelta) + " 口</b>。",
      why: "和 GEX 一樣的假設：市商買 Call、賣 Put。賣 Put 的 Delta 是正的（價格跌會虧，所以偏多）。", dur: 2600 },
    { cap: "整條鏈加起來，DEX 約 <b>" + sg(DEX0) + " 口</b>：市商的選擇權部位偏多這麼多，所以他手上大約有同樣數量的<b>期貨空單</b>在對沖。",
      why: "DEX 很大，代表市商身上背著很多避險部位；只要 Delta 變了，這些部位就得調整。" },
    { cap: "<b>GEX 和 DEX 的關係</b>：GEX 就是 DEX 隨價格的變化。價格從 27,000 跌到 26,730（約 1%），DEX 從 " + sg(DEX0) + " 變成 " + sg(DEXD) + "，多了 <b>" + fx(DEXD - DEX0) + " 口</b>。",
      why: "市商要讓總 Delta 回到 0，就得<b>多賣 " + fx(DEXD - DEX0) + " 口期貨</b>：價格跌、他也賣，這就是負 GEX。這個口數換成美元，就是 GEX 在說的事。", dur: 2600 },
    { cap: "反過來，價格從 27,000 漲到 27,270，DEX 只從 " + sg(DEX0) + " 變成 " + sg(DEX1) + "，幾乎沒變：這一段的 GEX 正負互相抵銷（剛好跨過 Flip）。",
      why: "DEX 很大不代表要調整很多。要調整多少，看的是 DEX 變了多少，也就是 GEX。" },
    { cap: "想一想：DEX 很大，但 GEX 接近 0。",
      q: { t: "價格小幅波動時，市商的對沖量大概怎樣？", o: [
        ["不大，因為 DEX 不太會隨價格變", true, "GEX 接近 0，代表價格動時 DEX 變化不大，要調整的期貨就少。DEX 大只代表已經背了很多。"],
        ["很大，因為 DEX 很大", false, "要調整多少看的是 GEX（DEX 的變化），不是 DEX 本身。"],
        ["一定是 0", false, "GEX 接近 0 不等於完全不用調整。"]] } },
    { cap: "現在看 <b>GammaLens</b> 這類工具：圖上會畫出幾條水平線。<b>Call Wall</b>、<b>Put Wall</b>，以及 <b>HVL</b>（High Vol Level，多數工具的 Flip）。",
      why: "這些就是第 7 關算出來的東西。工具只是幫你每天抓資料、算好、畫上去。", dur: 3000 },
    { cap: "左下角的<b>淨 GEX</b> 決定今天的環境：負的偏雪球、正的偏彈簧。再看價格在 HVL 的哪一邊。",
      why: "淨 GEX 為負、價格又在 HVL 下方：預期波動放大，目標可以放遠、止損要放寬。" },
    { cap: "「<b>3 exp stacked</b>」＝把最近<b>三個到期日</b>的 GEX 加在一起。好處是不會只看到明天就到期的部分；代價是最近的到期日一結算，線會跳動（第 8 關）。",
      why: "如果今天就是其中一個到期日，收盤後那部分會消失，明天的牆可能換位置。", dur: 2400 },
    { cap: "<b>QQQ → NQ 換算</b>：GammaLens 的資料來自 QQQ，再乘上比例變成 NQ 價位。比例每天微變，換算後的價位會有幾點到十幾點誤差。",
      why: "所以把線當成「區域」，不是精確的一個價。第 11 關算過：QQQ 670 × 41.24 ≈ 27,630。" },
    { cap: "同一個指數其實有<b>三個選擇權市場</b>：那斯達克 100 有 <b>QQQ</b>（ETF 選擇權）、<b>NDX／XND</b>（指數選擇權）、<b>NQ／MNQ</b>（CME 期貨選擇權）。",
      why: "三個市場的市商會互相套利、對沖，價格連在一起，但未平倉量是各自分開的。GammaLens 只算 QQQ，「NQ 原生 GEX」只算 CME 的 NQ 選擇權，NDX 兩邊都沒算進去。所以兩份紀錄的牆和 Flip 不一樣是正常的：它們看到的是不同的部位。", dur: 3600 },
    { cap: "其他常見的配對也是同一個結構：<b>標普 500</b> 有 SPY、SPX／XSP、ES／MES；<b>羅素 2000</b> 有 IWM、RUT／MRUT、RTY／M2K；<b>道瓊</b>有 DIA、DJX、YM；<b>黃金</b>有 GLD 和 GC 選擇權。",
      why: "完整對照表（含每點價值和換算方式）在這關最下面。比特幣也一樣：IBIT 選擇權、加密交易所 Deribit、CME 的比特幣期貨選擇權。", dur: 3600 },
    { cap: "想一想：你交易 ES，想看 GEX。",
      q: { t: "最常見的做法是？", o: [
        ["看 SPX（加上 SPY）的 GEX，再換算成 ES 價位", true, "標普 500 的選擇權成交量主要在 SPX 和 SPY，SPX 的 0DTE 又特別多，所以多數 GEX 工具以它們為主。換算方式和 QQQ → NQ 一樣，要用當天的比例或基差。"],
        ["看 QQQ 的 GEX", false, "QQQ 追蹤的是那斯達克 100，不是標普 500。"],
        ["只看 ES 期貨選擇權，其他都不用管", false, "可以當對照，但標普 500 選擇權的量大多不在 CME。"]] } },
    { cap: "<b>盤後價差</b>：資料是用美股收盤時的 OI 和價格算的。NQ 晚上照樣交易，等你在台灣開盤看圖時，價格可能已經離收盤好幾百點。",
      why: "線的位置不會跟著動（OI 一天只更新一次），但價格和線的相對位置已經變了：原本在 HVL 下方，現在可能已經在上方。", dur: 2600 },
    { cap: "想一想：GammaLens 昨天收盤算出 HVL 27,100，那時 NQ 在 27,000。現在夜盤 NQ 已經漲到 27,350。",
      q: { t: "怎麼看比較合理？", o: [
        ["價格已經跑到 HVL 上方，環境可能偏彈簧；線本身是昨天的，當成大概的區域", true, "線不會隨夜盤更新，但你要用現在的價格去比對它的位置。"],
        ["線會自動移到 27,350", false, "線是用 OI 算的，OI 一天只更新一次，不會跟著價格跑。"],
        ["還是雪球環境，因為收盤時在 HVL 下方", false, "環境看價格現在在哪一邊，不是收盤時在哪一邊。"]] } },
    { cap: "每天的<b>檢查清單</b>：① 淨 GEX 正還是負 ② 價格在 HVL 哪一邊 ③ 最近的牆在哪 ④ 今天有沒有到期 ⑤ 今天有沒有大事件 ⑥ 收盤後記錄結果。",
      why: "這張清單把 12 關的內容收在一起。它告訴你今天的路況，進場的時機還是要回到路線 1 的訂單流確認。" },
    { cap: "整理：<b>DEX</b>＝已經背了多少，<b>GEX</b>＝價格動了要調多少。讀 GammaLens 時記得：<b>3 exp stacked</b> 會在到期後跳動、<b>QQQ 換算</b>有誤差、<b>盤後</b>要用現在的價格去比對。",
      why: "路線 2 到這裡結束。你已經能從選擇權鏈一路理解到每天看到的那幾條線是怎麼來的。" }
  ];

  function draw0(svg, i, t) {
    let s = "";
    if (i === 0) s += cards([["Delta", "選擇權等於幾口期貨"], ["× OI", "每個履約價有幾口"], ["加總", "整條鏈加起來"], ["＝ DEX", "市商的選擇權部位等於幾口期貨"]], t, { hl: 3 });
    else if (i === 1) {
      const a = 5200 * C27.callDelta, b = -4200 * C27.putDelta, mx = 3000, h = (v) => (v / mx) * 220;
      s += `<line x1="120" x2="540" y1="310" y2="310" class="s-ink"/><text x="120" y="50" class="t-mute">27,000 履約價的 DEX（等值期貨口數）</text>`;
      s += `<rect x="170" y="${310 - h(a) * ease(seg(t, 0, 0.5))}" width="110" height="${h(a) * ease(seg(t, 0, 0.5))}" rx="6" class="f-buy-soft"/><text x="225" y="336" text-anchor="middle" class="t-ink t-b">買 Call</text><text x="225" y="${300 - h(a)}" text-anchor="middle" class="t-buy t-b" opacity="${seg(t, 0.4, 0.6)}">+${fx(a)}</text>`;
      s += `<rect x="380" y="${310 - h(b) * ease(seg(t, 0.4, 0.9))}" width="110" height="${h(b) * ease(seg(t, 0.4, 0.9))}" rx="6" class="f-buy-soft"/><text x="435" y="336" text-anchor="middle" class="t-ink t-b">賣 Put</text><text x="435" y="${300 - h(b)}" text-anchor="middle" class="t-buy t-b" opacity="${seg(t, 0.8, 1)}">+${fx(b)}</text>`;
    } else if (i === 2) {
      const mx = Math.max(...DX.map((r) => r.v)), cx = 120, sx = 380 / mx;
      s += `<text x="90" y="40" class="t-mute">每個履約價的 DEX（口）</text><line x1="${cx + 60}" x2="${cx + 60}" y1="50" y2="340" class="s-ink"/>`;
      DX.slice().reverse().forEach((r, j) => { const y = 56 + j * 31, w = r.v * sx * ease(seg(t, j * 0.05, j * 0.05 + 0.4));
        s += `<text x="${cx + 50}" y="${y + 16}" text-anchor="end" class="t-ink">${fx(r.K)}</text><rect x="${cx + 60}" y="${y}" width="${Math.max(1, w)}" height="22" rx="4" class="f-buy-soft"/><text x="${cx + 66 + w}" y="${y + 16}" class="t-mute" opacity="${seg(t, 0.6, 1)}">${fx(r.v)}</text>`; });
      s += chip(470, 355, "合計 " + sg(DEX0) + " 口", "buy", seg(t, 0.8, 1));
    } else if (i >= 3 && i <= 5) {
      const tgt = i === 3 ? DEXD : DEX1, lab2 = i === 3 ? "26,730" : "27,270", v = i === 5 ? DEX1 : lerp(DEX0, tgt, ease(seg(t, 0.2, 0.8))), mx = Math.max(DEX0, DEXD) * 1.1, h = (x) => (x / mx) * 230;
      s += `<line x1="120" x2="540" y1="310" y2="310" class="s-ink"/><rect x="170" y="${310 - h(DEX0)}" width="110" height="${h(DEX0)}" rx="6" class="f-buy-soft"/><text x="225" y="336" text-anchor="middle" class="t-ink t-b">27,000</text><text x="225" y="${300 - h(DEX0)}" text-anchor="middle" class="t-buy t-b">${sg(DEX0)}</text>`;
      s += `<rect x="380" y="${310 - h(v)}" width="110" height="${h(v)}" rx="6" class="f-buy-soft"/><text x="435" y="336" text-anchor="middle" class="t-ink t-b">${lab2}</text><text x="435" y="${300 - h(v)}" text-anchor="middle" class="t-buy t-b">${sg(v)}</text>`;
      s += i === 3 ? chip(330, 60, "多 " + fx(DEXD - DEX0) + " 口 → 多賣期貨", "sell", seg(t, 0.8, 1)) : i === 4 ? chip(330, 60, "幾乎沒變", "hl", seg(t, 0.8, 1)) : chip(330, 60, "DEX 大、GEX 接近 0？", "hl");
    } else if (i === 6) s += panel(t, { net: false });
    else if (i === 7) s += panel(1, { hl: 1 });
    else if (i === 8) {
      [[0, "週（明天到期）", "f-hl"], [1, "下週", "f-gamma-soft"], [2, "月", "f-buy-soft"]].forEach(([k, lab, cls]) => { const y = 260 - k * 60, op = seg(t, k * 0.2, k * 0.2 + 0.3);
        s += `<g opacity="${op}"><path d="M150 ${y} l60 -36 h300 l-60 36 z" class="${cls} s-line"/><text x="525" y="${y - 12}" class="t-ink t-b">${lab}</text></g>`; });
      s += `<text x="150" y="330" class="t-ink t-b" opacity="${seg(t, 0.7, 1)}">疊起來＝3 exp stacked</text><text x="150" y="60" class="t-mute">最近三個到期日</text>`;
    } else if (i === 9) {
      s += `<rect x="70" y="120" width="160" height="110" rx="12" class="f-surface s-line"/><text x="150" y="160" text-anchor="middle" class="t-mute">QQQ Call Wall</text><text x="150" y="200" text-anchor="middle" class="t-ink t-b t-lg">670</text><text x="260" y="186" class="t-ink t-xl">×</text><rect x="300" y="120" width="130" height="110" rx="12" class="f-surface s-line"/><text x="365" y="160" text-anchor="middle" class="t-mute">比例</text><text x="365" y="200" text-anchor="middle" class="t-ink t-b">41.24</text>`;
      s += `<g opacity="${seg(t, 0.4, 0.8)}"><text x="450" y="186" class="t-ink t-xl">≈</text><rect x="490" y="120" width="120" height="110" rx="12" class="f-gamma-soft"/><text x="550" y="160" text-anchor="middle" class="t-mute">NQ</text><text x="550" y="200" text-anchor="middle" class="t-ink t-b t-lg">27,630</text></g><text x="340" y="290" text-anchor="middle" class="t-mute" opacity="${seg(t, 0.7, 1)}">比例每天微變：當成 ±十幾點的區域</text>`;
    } else if (i === 10 || i === 11) {
      const X = (k) => lerp(90, 590, k), Y = (p) => 200 - (p - 27000) * 0.42;
      s += `<line x1="90" x2="590" y1="${Y(FL)}" y2="${Y(FL)}" class="s-ink" stroke-dasharray="6 5"/><text x="586" y="${Y(FL) - 6}" text-anchor="end" class="t-ink t-b">HVL ${fx(Math.round(FL / 5) * 5)}（昨天算的）</text>`;
      s += `<line x1="${X(0.3)}" x2="${X(0.3)}" y1="60" y2="330" class="s-line"/><text x="${X(0.3)}" y="350" text-anchor="middle" class="t-mute">美股收盤：資料計算</text>`;
      const pts = []; const n = i === 10 ? Math.max(2, Math.round(ease(t) * 60)) : 60;
      for (let k = 0; k < n; k++) { const u = k / 59; pts.push([X(u), Y(u < 0.3 ? 27000 + 20 * Math.sin(u * 30) : 27000 + (u - 0.3) / 0.7 * 350 + 15 * Math.sin(u * 40))]); }
      s += `<polyline points="${pts.map((p) => p.map((v) => v.toFixed(1)).join(",")).join(" ")}" class="s-buy f-none" stroke-width="2.5"/>`;
      s += `<text x="${X(0.65)}" y="350" text-anchor="middle" class="t-mute">夜盤繼續交易</text>`;
      if (i === 11) s += chip(X(0.85), Y(27350) - 30, "現在 27,350", "buy");
    } else if (i === 12) s += cards([["淨 GEX", "正：彈簧；負：雪球"], ["HVL", "價格在上方還是下方"], ["牆", "最近的 Call Wall、Put Wall"], ["到期", "今天有沒有到期"], ["事件", "今天有沒有大數據"]], t, { hl: 0, h: 48, gap: 56 });
    else s += cards([["DEX", "已經背了多少（等值期貨）"], ["GEX", "價格動了要調多少"], ["3 exp stacked", "到期後會跳動"], ["QQQ 換算", "有誤差，當成區域"], ["盤後", "用現在的價格比對線"]], t, { hl: 4 });
    svg.innerHTML = s;
  }


  const PAIRS = [["那斯達克 100", "QQQ", "NDX、XND", "NQ、MNQ"], ["標普 500", "SPY", "SPX、XSP", "ES、MES"], ["羅素 2000", "IWM", "RUT、MRUT", "RTY、M2K"], ["道瓊", "DIA", "DJX", "YM、MYM"], ["黃金", "GLD", "—", "GC、MGC"], ["比特幣", "IBIT", "—", "CME 比特幣（另有 Deribit）"], ["台股", "—", "台指選擇權 TXO", "—（台指期是期貨）"]];
  function draw(svg, i, t) {
    if (i < 10) return draw0(svg, i, t);
    if (i > 12) return draw0(svg, i - 3, t);
    let s = "";
    if (i === 10) {
      s += `<circle cx="320" cy="190" r="${lerp(0, 58, ease(seg(t, 0, 0.25)))}" class="f-surface s-line"/><text x="320" y="186" text-anchor="middle" class="t-ink t-b" opacity="${seg(t, 0.1, 0.25)}">那斯達克 100</text><text x="320" y="208" text-anchor="middle" class="t-mute" opacity="${seg(t, 0.1, 0.25)}">指數</text>`;
      [["QQQ 選擇權", "ETF 選擇權・交割 QQQ 股票", "GammaLens 用這個", 110, 80, "f-buy-soft"], ["NDX／XND", "指數選擇權・現金結算", "兩份 GEX 都沒算", 530, 80, "f-surface s-line"], ["NQ／MNQ 選擇權", "CME 期貨選擇權・交割 NQ 期貨", "NQ 原生 GEX 用這個", 320, 320, "f-gamma-soft"]].forEach(([a, b, c, x, y, cls], k) => {
        const op = seg(t, 0.25 + k * 0.2, 0.45 + k * 0.2);
        s += `<g opacity="${op}"><path d="M320 190 L${x} ${y}" class="s-line" stroke-dasharray="4 4"/><rect x="${x - 100}" y="${y - 34}" width="200" height="68" rx="12" class="${cls}"/><text x="${x}" y="${y - 10}" text-anchor="middle" class="t-ink t-b">${a}</text><text x="${x}" y="${y + 10}" text-anchor="middle" class="t-mute">${b}</text><text x="${x}" y="${y + 28}" text-anchor="middle" class="t-gamma t-b">${c}</text></g>`;
      });
      s += `<text x="320" y="370" text-anchor="middle" class="t-mute" opacity="${seg(t, 0.9, 1)}">套利讓價格連在一起，未平倉量各自分開</text>`;
    } else {
      const X = [40, 175, 300, 440], hd = ["標的", "ETF 選擇權", "指數選擇權", "期貨選擇權"];
      s += hd.map((h, k) => `<text x="${X[k]}" y="40" class="t-mute">${h}</text>`).join("") + `<line x1="34" x2="610" y1="50" y2="50" class="s-line"/>`;
      PAIRS.forEach((r, j) => { const y = 78 + j * 40, op = i === 11 ? seg(t, j * 0.1, j * 0.1 + 0.25) : 1, hl = i === 12 && j === 1;
        s += `<g opacity="${op}">${hl ? `<rect x="32" y="${y - 24}" width="580" height="34" rx="6" class="f-hl" opacity="0.3"/>` : ""}${r.map((c, k) => `<text x="${X[k]}" y="${y}" class="${k === 0 ? "t-ink t-b" : "t-ink"}">${c}</text>`).join("")}</g>`; });
      if (i === 12) s += chip(320, 360, "交易 ES，看哪個的 GEX？", "hl");
    }
    svg.innerHTML = s;
  }
  const simHTML = `<p class="small">把今天 GammaLens 上看到的數字填進來（預設是示意數字），得到今天的路況摘要。</p>
<div class="dx-form"><label>NQ 現價<input class="dx-in" data-k="px" type="number" step="5" value="27000"></label><label>HVL／Flip<input class="dx-in" data-k="fl" type="number" step="5" value="${Math.round(FL / 5) * 5}"></label><label>Call Wall<input class="dx-in" data-k="cw" type="number" step="5" value="27300"></label><label>Put Wall<input class="dx-in" data-k="pw" type="number" step="5" value="26700"></label><label>淨 GEX（百萬）<input class="dx-in" data-k="ng" type="number" step="10" value="${Math.round(net(27000))}"></label>
<label class="dx-chk"><input class="dx-c" data-k="exp" type="checkbox"> 今天有到期</label><label class="dx-chk"><input class="dx-c" data-k="ev" type="checkbox"> 今天有大事件</label></div>
<svg class="fpx dx-svg" viewBox="0 0 640 300" role="img" aria-label="今天的關鍵價位"></svg><div class="dx-out"></div><ul class="sim-task dx-task"></ul>`;
  function simMount(box) {
    const q = (s) => box.querySelector(s); const done = {};
    function paint() {
      const v = {}; box.querySelectorAll(".dx-in").forEach((x) => { v[x.dataset.k] = +x.value || 0; }); box.querySelectorAll(".dx-c").forEach((x) => { v[x.dataset.k] = x.checked; });
      const lo = Math.min(v.pw, v.px, v.fl) - 150, hi = Math.max(v.cw, v.px, v.fl) + 150, Y = (p) => lerp(270, 30, (p - lo) / (hi - lo || 1));
      let s = [[v.cw, "Call Wall", "s-gamma", "t-gamma"], [v.fl, "HVL", "s-ink", "t-ink"], [v.pw, "Put Wall", "s-sell", "t-sell"]].map(([p, lab, sc, tc]) => `<line x1="80" x2="520" y1="${Y(p)}" y2="${Y(p)}" class="${sc}" stroke-width="2"/><text x="526" y="${Y(p) + 4}" class="${tc} t-b">${lab} ${fx(p)}</text>`).join("");
      s += `<circle cx="300" cy="${Y(v.px)}" r="9" class="f-buy"/><text x="286" y="${Y(v.px) + 5}" text-anchor="end" class="t-buy t-b">現價 ${fx(v.px)}</text>`;
      q(".dx-svg").innerHTML = s;
      const above = v.px >= v.fl, env = v.ng >= 0 ? "彈簧（正 GEX）" : "雪球（負 GEX）";
      const tips = [`環境：<b>${env}</b>，價格在 HVL <b>${above ? "上方" : "下方"}</b>${(v.ng >= 0) !== above ? "（兩者不一致，訊號偏弱，保守一點）" : ""}。`,
        `離 Call Wall <b>${fx(v.cw - v.px)}</b> 點，離 Put Wall <b>${fx(v.px - v.pw)}</b> 點。`,
        v.ng >= 0 ? "預期偏震盪：目標可以近一點，靠近牆時留意停頓。" : "預期波動放大：目標可以放遠，止損要放寬、部位要縮小。",
        v.exp ? "今天有到期：牆可能很強，但收盤後部分會消失，明天要看新資料。" : "今天沒有主要到期。",
        v.ev ? "今天有大事件：事件前後 GEX 可能失效，先等數據公布再判斷。" : "今天沒有大事件。",
        "時間：GEX 可能只在紐約開盤後 1～2 小時有參考價值（台灣冬令 22:30～00:30），之後先只看訂單流（驗證中）。", "進場時機：回到路線 1，用訂單流在關鍵位確認。"];
      q(".dx-out").innerHTML = `<ol class="dx-list">${tips.map((x) => `<li>${x}</li>`).join("")}</ol>`;
      if (v.ng < 0 && !above) done.a = true; if (v.ng >= 0 && above) done.b = true; if (v.exp && v.ev) done.c = true;
      q(".dx-task").innerHTML = [["a", "任務 1：設定成「淨 GEX 負、價格在 HVL 下方」，看建議"], ["b", "任務 2：改成「淨 GEX 正、價格在 HVL 上方」，比較兩者差別"], ["c", "任務 3：勾選到期和事件，看提醒多了什麼"]].map(([k, tx]) => `<li class="${done[k] ? "ok" : ""}">${done[k] ? "✓" : "○"} ${tx}</li>`).join("");
    }
    box.addEventListener("input", paint); box.addEventListener("change", paint); paint();
  }

  const QS = [
    { fig: `<p class="small q-cap">一口 Call，Delta 0.3，OI 10,000 口（市商是買方）。</p>`, q: "這個履約價 Call 的 DEX 大約是？", step: 2, o: [
      ["+3,000 口", true, "10,000 × 0.3 ＝ 3,000 口等值期貨。"],
      ["+10,000 口", false, "要乘上 Delta。"],
      ["−3,000 口", false, "市商買 Call，Delta 是正的。"]] },
    { fig: `<p class="small q-cap">GammaLens 標示「3 exp stacked」，今天是週五，其中一個到期日今天結算。</p>`, q: "下週一看圖時要注意什麼？", step: 9, o: [
      ["今天結算的那部分不見了，牆和 HVL 可能換位置", true, "疊加的三個到期日少了一個，GEX 會重算。"],
      ["完全不會變", false, "OI 結算掉了，GEX 一定會變。"],
      ["會自動變成 4 個到期日", false, "還是最近三個，只是換了一批。"]] },
    { fig: `<p class="small q-cap">早上 8 點（台灣）打開圖，GammaLens 的線是昨天美股收盤算的，NQ 夜盤已經跌了 250 點。</p>`, q: "最重要的動作是？", step: 14, o: [
      ["用現在的價格重新判斷它在 HVL、牆的哪一邊", true, "線不會跟著夜盤更新，但相對位置已經變了。"],
      ["假設價格還在昨天收盤的位置", false, "價格已經移動 250 點，環境可能已經不同。"],
      ["把所有線往下平移 250 點", false, "線是用 OI 算的，不會因為價格移動而平移。"]] }
  ];

  PAGES["op-dex"] = window.KIT.page(window.COURSE.OPC, "op-dex", {
    topic: "DEX 與怎麼讀 GammaLens",
    lede: "最後一關：認識 DEX（市商已經背了多少），再把整個路線 2 用在你每天看的 GammaLens 上：三個到期日疊加、QQQ 換算、盤後價差，各要注意什麼。",
    analogy: [
      ["背包和腳步", "<b>DEX</b> 是背包裡已經裝了多少，<b>GEX</b> 是每走一步要加減多少。"],
      ["天氣預報", "GammaLens 的線像<b>昨晚的天氣預報</b>：有參考價值，但出門前要看看窗外。"],
      ["地圖比例尺", "QQQ 換算成 NQ 像換<b>比例尺</b>：大方向對，細節有誤差。"]],
    steps: STEPS, draw, simHTML, simMount,
    simIntro: "把今天 GammaLens 上的數字填進來，得到一份路況摘要。",
    after: `<h2>常見的「同一個標的、多個選擇權市場」對照</h2><div class="table-wrap"><table class="tbl"><thead><tr><th>標的</th><th>ETF 選擇權</th><th>指數選擇權</th><th>期貨選擇權（每點價值）</th><th>換算成期貨價位</th></tr></thead><tbody>
<tr><td><b>那斯達克 100</b></td><td>QQQ</td><td>NDX；XND（NDX 的 1/100）</td><td>NQ（$20）、MNQ（$2）</td><td>QQQ × 約 41（每天重算）</td></tr>
<tr><td><b>標普 500</b></td><td>SPY</td><td>SPX（$100）；XSP（SPX 的 1/10）</td><td>ES（$50）、MES（$5）</td><td>SPY × 約 10，再看基差</td></tr>
<tr><td><b>羅素 2000</b></td><td>IWM</td><td>RUT；MRUT（RUT 的 1/10）</td><td>RTY（$50）、M2K（$5）</td><td>IWM × 約 10</td></tr>
<tr><td><b>道瓊</b></td><td>DIA</td><td>DJX（道瓊指數的 1/100）</td><td>YM（$5）、MYM（$0.5）</td><td>DIA × 約 100</td></tr>
<tr><td><b>黃金</b></td><td>GLD</td><td>—</td><td>GC（COMEX，100 盎司）、MGC</td><td>GLD × 約 10.9（2026-11-19 實際比例 10.924）</td></tr>
<tr><td><b>原油</b></td><td>USO</td><td>—</td><td>CL（NYMEX，1,000 桶）</td><td>USO 有展期成本，和油價沒有固定比例，不建議換算</td></tr>
<tr><td><b>美國公債</b></td><td>TLT</td><td>—</td><td>ZB、ZN（CBOT）</td><td>存續期間不同，不適合直接換算</td></tr>
<tr><td><b>比特幣</b></td><td>IBIT</td><td>—</td><td>CME 比特幣期貨選擇權；另有加密交易所 Deribit</td><td>IBIT 和比特幣價格的比例會隨時間變動</td></tr>
<tr><td><b>台股</b></td><td>（ETF 選擇權量很小）</td><td>台指選擇權 TXO（每點 NT$50）</td><td>台指期 TX（每點 NT$200）是期貨，不是期貨選擇權</td><td>同一個指數，不用換算</td></tr>
</tbody></table></div>
<p class="small">換算比例都是約略值，請用同一根 K 線的收盤價重算（工具箱有計算機）。比特幣選擇權的未平倉量，2025 年 9 月時 IBIT 約占 45%、Deribit 約 41.9%、CME 約 6%（Bloomberg 報導）。XSP、MRUT、DJX 的大小依 Cboe 產品規格；XND 依 Nasdaq 產品說明；NQ 期貨選擇權依 CME 合約規格。</p>`,
    mist: [
      ["DEX 大，市商就會大量買賣", "要調整多少看 GEX（DEX 的變化）。DEX 大只代表已經背了很多。"],
      ["GammaLens 的線是即時的", "線是用收盤的 OI 算的，一天更新一次；夜盤價格移動，線不會跟著動。"],
      ["換算後的 NQ 價位是精確的", "比例每天變，當成 ±十幾點的區域比較實際。"]],
    faq: [
      ["DEX 正代表看漲嗎？", "不代表。在這個假設下 DEX 正是市商的選擇權部位偏多，他已經用期貨空單對沖了，本身不是方向訊號。"],
      ["HVL 和 Flip 一樣嗎？", "多數工具的 HVL 指的就是 GEX 由負轉正的位置，和這套課程的 Flip 同一個概念；但各工具的算法細節可能不同。"],
      ["一定要用 GammaLens 嗎？", "不一定。任何 GEX 工具都適用這關的檢查方式：看資料來源、到期日範圍、更新時間。"],
      ["NQ 有幾個選擇權市場？", "三個：QQQ（ETF 選擇權）、NDX／XND（指數選擇權）、CME 的 NQ／MNQ（期貨選擇權）。GEX 工具通常只算其中一個，所以不同來源的位階會不一樣。"], ["路線 2 學完之後呢？", "把每天的檢查清單和路線 1 的訂單流結合：GEX 決定路況和目標距離，訂單流決定進場時機。"]],
    qs: QS,
    gloss: [
      ["DEX", "Delta × OI 加總，市商的選擇權部位等於幾口期貨。"],
      ["HVL", "High Vol Level，多數工具裡的 Flip。"],
      ["3 exp stacked", "最近三個到期日的 GEX 加在一起。"],
      ["盤後價差", "資料是收盤算的，夜盤價格可能已經移動很多。"], ["ETF 選擇權", "標的是 ETF（例如 QQQ、SPY），到期交割 ETF 股份，通常是美式。"], ["指數選擇權", "標的是指數本身（例如 NDX、SPX），現金結算，通常是歐式。"], ["期貨選擇權", "標的是期貨（例如 NQ、ES），到期交割期貨部位。"]],
    remember: "<b>DEX＝已經背了多少，GEX＝價格動了要調多少。</b>讀 GammaLens：到期後會跳、換算有誤差、盤後要用現在的價格比對。"
  });
})();
