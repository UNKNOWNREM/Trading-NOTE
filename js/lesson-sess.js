/* 路線 1 第 10 關（新）：交易時段（用台灣時間看 NQ 的一天） */
(function () {
  const PAGES = (window.__PAGES = window.__PAGES || {});
  const { chip, lerp, ease, seg, cards } = window.KIT;
  // 一個交易日用「美東時間」定義最穩：18:00 開盤 → 隔天 17:00 收盤，17:00～18:00 休息
  // 台灣時間 ＝ 美東 ＋ 13 小時（冬令）／＋ 12 小時（夏令）
  const SEG = [
    { a: 18, b: 27, name: "亞洲時段", cls: "f-gamma-soft", t: "t-gamma" },
    { a: 27, b: 33.5, name: "歐洲時段", cls: "f-buy-soft", t: "t-buy" },
    { a: 33.5, b: 40, name: "美股正規時段", cls: "f-sell-soft", t: "t-sell" },
    { a: 40, b: 41, name: "盤後", cls: "g-cell", t: "t-mute" }
  ];
  const twOf = (et, summer) => { const h = (et + (summer ? 12 : 13)) % 24; return h; };
  const fmt = (h) => { const hh = Math.floor(((h % 24) + 24) % 24), mm = Math.round((h - Math.floor(h)) * 60); return `${String(hh).padStart(2, "0")}:${String(mm % 60).padStart(2, "0")}`; };
  // 示意用的成交量（美東小時 18～41）
  function vol(et) {
    const x = et;
    let v = 0.12 + 0.05 * Math.sin((x - 18) * 0.7);
    if (x >= 27) v += 0.2 * seg(x, 27, 28.5);
    if (x >= 32.5) v += 0.25 * seg(x, 32.5, 33.5);
    if (x >= 33.5) v += 0.55 * Math.exp(-(x - 33.5) * 1.1);
    if (x >= 36 && x <= 37.5) v -= 0.12;
    if (x >= 38.5 && x < 40) v += 0.25 * seg(x, 38.5, 39.8);
    if (x >= 40) v = 0.08;
    return Math.max(0.05, Math.min(1, v));
  }
  const X = (et) => lerp(40, 600, (et - 18) / 24);

  function bar(summer, op = 1, o = {}) {
    let s = `<g opacity="${op}">`;
    SEG.forEach((g) => { s += `<rect x="${X(g.a)}" y="${o.y || 120}" width="${X(g.b) - X(g.a)}" height="40" class="${g.cls}"/>${X(g.b) - X(g.a) > 60 ? `<text x="${(X(g.a) + X(g.b)) / 2}" y="${(o.y || 120) + 25}" text-anchor="middle" class="${g.t} t-b">${g.name}</text>` : ""}`; });
    [18, 21, 24, 27, 30, 33.5, 36, 40].forEach((h) => { s += `<line x1="${X(h)}" x2="${X(h)}" y1="${(o.y || 120) + 40}" y2="${(o.y || 120) + 48}" class="s-ink"/><text x="${X(h)}" y="${(o.y || 120) + 64}" text-anchor="middle" class="t-mute">${fmt(twOf(h, summer))}</text>`; });
    return s + `<text x="50" y="${(o.y || 120) - 10}" class="t-mute">台灣時間（${summer ? "夏令" : "冬令"}）</text></g>`;
  }
  function curve(upto = 41, op = 1, y0 = 330, h = 120) {
    const pts = []; for (let et = 18; et <= upto; et += 0.25) pts.push(`${X(et)},${y0 - vol(et) * h}`);
    return `<g opacity="${op}"><polyline points="${pts.join(" ")}" class="s-buy f-none" stroke-width="2.5"/><line x1="50" x2="610" y1="${y0}" y2="${y0}" class="s-line"/><text x="50" y="${y0 - h - 6}" class="t-mute">成交量（示意）</text></g>`;
  }
  const mark = (et, label, summer, cls = "s-sell", y1 = 100, y2 = 340, op = 1) => `<g opacity="${op}"><line x1="${X(et)}" x2="${X(et)}" y1="${y1}" y2="${y2}" class="${cls}" stroke-width="2" stroke-dasharray="5 4"/><text x="${X(et)}" y="${y1 - 6}" text-anchor="middle" class="${cls.replace("s-", "t-")} t-b">${label} ${fmt(twOf(et, summer))}</text></g>`;

  const STEPS = [
    { cap: "NQ 幾乎 24 小時都能交易。換成台灣時間（現在是<b>冬令</b>），一個交易日從<b>早上 7:00</b> 開始，到<b>隔天早上 6:00</b> 結束，中間休息一小時。",
      why: "CME 的交易日以美東時間定義：傍晚 6:00 開盤、隔天下午 5:00 收盤。台灣比美東快 13 小時（冬令），所以是早上 7:00 開到隔天早上 6:00，6:00～7:00 休息。", stuck: "記一個數字就好：冬令時，台灣時間 ＝ 美東時間 ＋ 13 小時。" },
    { cap: "早上 7:00 到下午 4:00 是<b>亞洲時段</b>：日本、中國、台灣的人在交易，NQ 的成交量通常比較小，價格比較平靜。",
      why: "NQ 是美國的指數期貨，主要參與者在美國。亞洲時段仍然有人交易，但成交量少，價格比較容易被少量的單推動。", dur: 2200 },
    { cap: "下午 4:00 倫敦開盤，進入<b>歐洲時段</b>，成交量開始增加。晚上 9:30 有很多美國經濟數據公布。",
      why: "倫敦是全球最大的外匯和金融中心之一，開盤後全球資金開始活躍。美國大部分經濟數據（CPI、非農等）在美東早上 8:30 公布，冬令是台灣晚上 9:30。", dur: 2200 },
    { cap: "晚上 10:30 <b>美股開盤</b>，進入美股正規時段，一直到隔天早上 5:00 收盤。這是一天裡成交量最大的時段。",
      why: "美股開盤後，股票、選擇權、期貨同時活躍，機構的大單集中在這段時間。這一段又叫 RTH（正規交易時段），之前的時段叫 ETH 或隔夜盤。", dur: 2200 },
    { cap: "成交量大概長這樣（示意）：亞洲最低，倫敦開盤上來，<b>美股開盤時最高</b>，台灣凌晨 1:00～2:30 美國午餐時間變少，收盤前又增加。",
      why: "這是常見的形狀，每天會不一樣，數據公布日、FOMC 日差很多。重點是知道：成交量大的時段，訂單流訊號比較有代表性；成交量小的時段，少量的單就能讓價格亂跑。", dur: 2800 },
    { cap: "練習一下：現在是冬令。",
      q: { t: "美股開盤是台灣時間幾點？", o: [
        ["晚上 9:30", false, "9:30 是美東時間的開盤時間，也是冬令時美國經濟數據公布的台灣時間。美股開盤要再加一小時。"],
        ["晚上 10:30", true, "美東早上 9:30 開盤，冬令加 13 小時，就是台灣晚上 10:30。"],
        ["早上 7:00", false, "7:00 是 CME 每天重新開盤（亞洲時段開始），不是美股開盤。"]] } },
    { cap: "<b>夏令時間</b>：美國實施日光節約時，所有跟美國有關的時間<b>提早一小時</b>。美股改成晚上 <b>9:30</b> 開盤，數據改成 <b>8:30</b> 公布。",
      why: "美國的夏令從 3 月第二個星期日開始、11 月第一個星期日結束。英國是 3 月最後一個星期日到 10 月最後一個星期日，所以每年春秋各有幾週，美國和英國的時差不一樣，倫敦開盤的台灣時間會跟平常差一小時。台灣沒有夏令時間。", dur: 2600 },
    { cap: "為什麼時段重要？同樣一格失衡，出現在<b>成交量很小的亞洲時段</b>，和出現在<b>美股開盤後</b>，代表的意義差很多。",
      why: "成交量小的時候，一個人下幾十口就能造成失衡或大 Delta，不代表有大資金在動。另外，一般認為選擇權造市商的對沖主要發生在美股時段，所以 GEX 位階的影響多半也在那段時間比較明顯。", dur: 2400 },
    { cap: "每個時段的<b>最高點和最低點</b>，常被當成關鍵價位：亞洲高低、歐洲高低、隔夜盤高低、前一天正規時段的高低。",
      why: "很多交易者會在這些地方放停損或掛單，所以價格到這裡常有反應。盤前把它們標在圖上，和昨天的 POC、VAH、VAL 一起看。", dur: 2400 },
    { cap: "練習一下：下午 2:00（亞洲時段）出現一根 Delta 很大的 K 棒，晚上 10:40（美股開盤後）也出現一根一樣大的。",
      q: { t: "哪一根比較值得重視？", o: [
        ["下午 2:00，因為成交量小時 Delta 一樣大更難得", false, "成交量小的時候，少數人就能造成很大的 Delta 比例，不一定代表大資金。要看 Delta 的絕對數字、比例，再加上時段一起判斷。"],
        ["晚上 10:40，美股開盤後參與者多，訊號比較有代表性", true, "美股時段成交量大、機構參與多，同樣的訊號比較能代表真實的買賣力道。"],
        ["兩根一樣，時段不重要", false, "時段會影響成交量和參與者，同樣的數字在不同時段意義不同。"]] } },
    { cap: "美股開盤後的<b>前 30～60 分鐘</b>波動最大，假突破也最多。很多人會等第一根 15 分鐘或 30 分鐘 K 棒收完，或等初始平衡（IB）形成，才開始找機會。",
      why: "開盤時累積了一整晚的單一起湧進來，價格常常先往一邊衝、再反向。等一下，讓市場先表態，可以避開最混亂的那幾分鐘。", dur: 2400 },
    { cap: "練習一下：現在是<b>夏令</b>，美國 CPI 在美東早上 8:30 公布。",
      q: { t: "是台灣時間幾點？", o: [
        ["晚上 9:30", false, "9:30 是冬令的時間（加 13 小時）。夏令只差 12 小時。"],
        ["晚上 8:30", true, "夏令時台灣比美東快 12 小時，8:30 ＋ 12 ＝ 晚上 8:30。"],
        ["早上 8:30", false, "台灣和美國日夜相反，美東早上是台灣晚上。"]] } },
    { cap: "整理：記住<b>冬令＋13、夏令＋12</b>。美股時段成交量最大、訊號最有代表性；開盤前 30～60 分鐘最混亂；每個時段的高低點都是關鍵價位。",
      why: "對在台灣的人來說，最常見的作息是：晚上 9:30 前看數據和盤前計畫，10:30 美股開盤後先觀察，約 11:00～12:30 是主要的交易時段。下一關會教怎麼處理經濟數據公布。" }
  ];

  function draw(svg, i, t) {
    const e = ease(t); let s = "";
    if (i === 0) {
      s += `<g opacity="${seg(t, 0, 0.5)}"><rect x="${X(18)}" y="120" width="${X(41) - X(18)}" height="40" class="g-cell"/><rect x="${X(41)}" y="120" width="${X(42) - X(41)}" height="40" class="f-sell-soft"/></g>`;
      s += `<text x="${X(18)}" y="104" class="t-ink t-b" opacity="${seg(t, 0.2, 0.6)}">07:00 開盤</text><text x="${X(41)}" y="104" text-anchor="end" class="t-ink t-b" opacity="${seg(t, 0.4, 0.8)}">隔天 06:00 收盤</text><text x="${X(41.5)}" y="190" text-anchor="middle" class="t-sell" opacity="${seg(t, 0.6, 1)}">休息一小時</text>`;
      s += `<g opacity="${seg(t, 0.6, 1)}"><rect x="140" y="240" width="360" height="70" rx="12" class="f-gamma-soft"/><text x="160" y="270" class="t-ink t-b t-lg">冬令：台灣 ＝ 美東 ＋ 13 小時</text><text x="160" y="296" class="t-mute">夏令：台灣 ＝ 美東 ＋ 12 小時</text></g>`;
    } else if (i >= 1 && i <= 3) {
      s += `<g opacity="0.25">${bar(false)}</g>`;
      const g = SEG[i - 1];
      s += `<rect x="${X(g.a)}" y="120" width="${(X(g.b) - X(g.a)) * seg(t, 0, 0.6)}" height="40" class="${g.cls}"/><text x="${(X(g.a) + X(g.b)) / 2}" y="145" text-anchor="middle" class="${g.t} t-b" opacity="${seg(t, 0.4, 0.8)}">${g.name}</text>`;
      [18, 27, 33.5, 40].forEach((h) => { s += `<text x="${X(h)}" y="184" text-anchor="middle" class="t-mute">${fmt(twOf(h, false))}</text>`; });
      if (i === 2) s += mark(32.5, "數據", false, "s-sell", 230, 330, seg(t, 0.6, 1));
      if (i === 3) s += mark(33.5, "美股開盤", false, "s-sell", 230, 330, seg(t, 0.5, 1)) + `<text x="${X(40)}" y="250" text-anchor="middle" class="t-mute" opacity="${seg(t, 0.7, 1)}">收盤 05:00</text>`;
    } else if (i === 4) {
      s += bar(false, 1, { y: 50 }) + curve(lerp(18, 41, seg(t, 0, 0.85)), 1, 340, 150);
      s += `<g opacity="${seg(t, 0.85, 1)}"><text x="${X(33.5)}" y="${340 - vol(33.6) * 150 - 8}" text-anchor="middle" class="t-buy t-b">美股開盤最高</text><text x="${X(36.7)}" y="${340 - vol(36.7) * 150 - 10}" text-anchor="middle" class="t-mute">午餐變少</text></g>`;
    } else if (i === 5) {
      s += `<g opacity="0.6">${bar(false)}</g><text x="${X(33.5)}" y="240" text-anchor="middle" class="t-ink t-b t-lg">美股開盤 ＝ ？</text>`;
    } else if (i === 6) {
      s += `<text x="50" y="30" class="t-ink t-b">冬令</text>` + bar(false, 1, { y: 60 });
      s += `<g opacity="${seg(t, 0.2, 0.8)}"><text x="50" y="186" class="t-ink t-b">夏令（全部提早一小時）</text>${bar(true, 1, { y: 216 })}</g>`;
    } else if (i === 7) {
      s += bar(false, 1, { y: 50 }) + curve(41, 1, 340, 150);
      s += `<g opacity="${seg(t, 0.1, 0.5)}"><circle cx="${X(25)}" cy="${340 - vol(25) * 150}" r="10" class="f-none s-ink" stroke-width="2" stroke-dasharray="3 3"/><text x="${X(25)}" y="${340 - vol(25) * 150 - 18}" text-anchor="middle" class="t-mute">量小：訊號容易失真</text></g>`;
      s += `<g opacity="${seg(t, 0.5, 0.9)}"><circle cx="${X(34)}" cy="${340 - vol(34) * 150}" r="10" class="f-none s-hl" stroke-width="3"/><text x="${X(34) + 16}" y="${340 - vol(34) * 150 + 4}" class="t-ink t-b">量大：訊號較有代表性</text></g>`;
    } else if (i === 8) {
      const P = [50, 52, 49, 51, 53, 55, 54, 57, 56, 54, 52, 55, 58, 60, 57, 55, 53, 51, 54, 56];
      const XP = (k) => lerp(60, 600, k / (P.length - 1)), Y = (p) => lerp(320, 70, (p - 46) / 16);
      s += `<rect x="60" y="60" width="${XP(7) - 60}" height="270" class="f-gamma-soft"/><rect x="${XP(7)}" y="60" width="${XP(11) - XP(7)}" height="270" class="f-buy-soft"/><rect x="${XP(11)}" y="60" width="${600 - XP(11)}" height="270" class="f-sell-soft"/>`;
      s += `<text x="70" y="80" class="t-gamma t-b">亞洲</text><text x="${XP(7) + 8}" y="80" class="t-buy t-b">歐洲</text><text x="${XP(11) + 8}" y="80" class="t-sell t-b">美股</text>`;
      s += `<polyline points="${P.map((p, k) => `${XP(k)},${Y(p)}`).join(" ")}" class="s-ink f-none" stroke-width="2.5"/>`;
      const L = [[57, "亞洲高 57", "s-gamma"], [49, "亞洲低 49", "s-gamma"], [56, "歐洲高 56", "s-buy"]];
      L.forEach(([p, l, c], k) => { s += `<g opacity="${seg(t, 0.2 + k * 0.2, 0.5 + k * 0.2)}"><line x1="${XP(k === 2 ? 7 : 0)}" x2="600" y1="${Y(p)}" y2="${Y(p)}" class="${c}" stroke-width="1.5" stroke-dasharray="5 4"/><text x="${k === 2 ? XP(7) + 6 : 596}" y="${Y(p) + (k === 2 ? 16 : -5)}" text-anchor="${k === 2 ? "start" : "end"}" class="${c.replace("s-", "t-")} t-b">${l}</text></g>`; });
    } else if (i === 9) {
      s += bar(false, 1, { y: 50 }) + curve(41, 1, 340, 150);
      s += chip(X(25), 300, "下午 2:00 大 Delta", "hl") + chip(X(34.2), 160, "晚上 10:40 大 Delta", "hl");
    } else if (i === 10) {
      const P = [50, 51, 50.5, 51, 56, 52, 49, 54, 51, 55, 53, 54, 55.5, 56, 57];
      const XP = (k) => lerp(60, 600, k / (P.length - 1)), Y = (p) => lerp(320, 70, (p - 46) / 14);
      s += `<rect x="${XP(3.5)}" y="60" width="${XP(8.5) - XP(3.5)}" height="270" class="f-sell-soft"/><text x="${XP(6)}" y="80" text-anchor="middle" class="t-sell t-b">開盤前 30～60 分鐘</text>`;
      const n = Math.max(2, Math.ceil(seg(t, 0, 0.85) * P.length));
      s += `<polyline points="${P.slice(0, n).map((p, k) => `${XP(k)},${Y(p)}`).join(" ")}" class="s-ink f-none" stroke-width="2.5"/><text x="${XP(3.5)}" y="350" text-anchor="middle" class="t-mute">22:30 開盤</text>`;
      s += `<text x="${XP(11)}" y="${Y(57) - 20}" class="t-ink t-b" opacity="${seg(t, 0.85, 1)}">市場表態後再找機會</text>`;
    } else if (i === 11) {
      s += `<text x="80" y="90" class="t-ink t-b t-lg">夏令：台灣 ＝ 美東 ＋ 12 小時</text><text x="80" y="140" class="t-ink t-b t-lg">CPI：美東 08:30</text><text x="80" y="190" class="t-ink t-b t-lg">台灣 ＝ ？</text>`;
    } else if (i === 12) {
      s += cards([["換算", "冬令 ＋13 小時、夏令 ＋12 小時"], ["美股時段", "冬令台灣 22:30～05:00，成交量最大"], ["數據公布", "冬令台灣 21:30（夏令 20:30）"], ["開盤前 30～60 分鐘", "最混亂，等市場表態"], ["時段高低點", "亞洲、歐洲、隔夜、前一天的高低，都是關鍵價位"]], t, { hl: 1 });
    }
    svg.innerHTML = s;
  }

  /* ---------- 你來操作：拉時間軸 ---------- */
  const simHTML = `<div class="ss-top"><label class="sp-tts"><input type="checkbox" class="ss-sum"> 夏令時間（美國日光節約）</label></div>
<svg class="fpx ss-svg" viewBox="0 0 660 220" role="img" aria-label="時段時間軸"></svg>
<label class="ss-lab">台灣時間 <b class="ss-tw"></b><input type="range" class="ss-t" min="0" max="23" step="0.25" value="15.5"></label>
<div class="ss-out"></div><ul class="sim-task ss-task"></ul>`;
  function simMount(box) {
    const q = (s) => box.querySelector(s); const done = {};
    function paint() {
      const summer = q(".ss-sum").checked, off = summer ? 12 : 13, tw = 7 + +q(".ss-t").value; // 從台灣 07:00 起算
      let etAdj = tw - off + 24; if (etAdj >= 42) etAdj -= 24;
      const lon = (tw - (summer ? 7 : 8) + 24) % 24;
      let s = bar(summer, 1, { y: 40 }) + curve(41, 1, 210, 60);
      const xx = X(Math.min(41.99, etAdj));
      s += `<line x1="${xx}" x2="${xx}" y1="30" y2="212" class="s-ink" stroke-width="2.5"/><circle cx="${xx}" cy="${210 - vol(etAdj) * 60}" r="6" class="f-buy"/>`;
      q(".ss-svg").innerHTML = s;
      const sg = etAdj >= 41 ? { name: "CME 每日休息", note: "這一小時不能交易。" } : etAdj >= 40 ? { name: "盤後", note: "美股已收盤，期貨還能交易一小時，量很小。" } : etAdj >= 33.5 ? { name: "美股正規時段（RTH）", note: etAdj < 34.5 ? "剛開盤：波動最大、假突破最多，多數人會先觀察。" : etAdj >= 36 && etAdj <= 37.5 ? "美國午餐時間，成交量通常變少。" : "成交量大，訂單流訊號最有代表性。" } : etAdj >= 27 ? { name: "歐洲時段", note: Math.abs(etAdj - 32.5) < 0.2 ? "這是美國經濟數據最常公布的時間！" : "倫敦開盤後量慢慢變大；美東 8:30 常有數據公布。" } : { name: "亞洲時段", note: "成交量小，少量的單就能讓價格亂動。" };
      q(".ss-tw").textContent = fmt(tw);
      q(".ss-out").innerHTML = `<p><b>${sg.name}</b>　${sg.note}</p><p class="small">台灣 ${fmt(tw)}　＝　美東 ${fmt(etAdj)}　＝　倫敦 ${fmt(lon)}${summer ? "（美國夏令；英國夏令時間和美國不完全同步）" : ""}</p><p class="small">成交量（示意）：${"▮".repeat(Math.round(vol(etAdj) * 10))}${"▯".repeat(10 - Math.round(vol(etAdj) * 10))}</p>`;
      if (summer && Math.abs(etAdj - 33.5) < 0.01) done.a = true;
      if (etAdj >= 41) done.b = true;
      if (!summer && Math.abs(etAdj - 32.5) < 0.01) done.c = true;
      q(".ss-task").innerHTML = [["a", "任務 1：打開夏令，把時間拉到美股開盤那一刻"], ["b", "任務 2：找到 CME 每天休息的那一小時"], ["c", "任務 3：冬令時，找到美國經濟數據公布的時間（美東 8:30）"]].map(([k, tx]) => `<li class="${done[k] ? "ok" : ""}">${done[k] ? "✓" : "○"} ${tx}</li>`).join("");
    }
    q(".ss-t").addEventListener("input", paint); q(".ss-sum").addEventListener("change", paint);
    paint();
  }

  const QS = [
    { fig: `<p class="small q-cap">現在是 11 月（冬令）。你想在美股開盤後第一個小時的初始平衡形成後再開始找機會。</p>`, q: "大約要等到台灣時間幾點？", step: 10, o: [
      ["晚上 10:30", false, "10:30 是剛開盤。初始平衡是開盤後第一個小時，要等到 11:30。"],
      ["晚上 11:30", true, "冬令美股 22:30 開盤，第一個小時到 23:30，初始平衡才形成。"],
      ["凌晨 1:00", false, "1:00 已經是美國午餐時間附近了，等太久。"]] },
    { fig: `<p class="small q-cap">早上 9:00（亞洲時段），NQ 突然出現一格 600% 的買方失衡，但那一格只有 25 口。</p>`, q: "比較合理的看法是？", step: 8, o: [
      ["倍數這麼大，一定是大戶進場", false, "亞洲時段量小，25 口就能做出很大的倍數。不能只看倍數。"],
      ["量小的時段，訊號容易失真，參考價值低", true, "成交量小的時候，少數人就能造成失衡。這種訊號要打折看，最好等美股時段在關鍵價位的訊號。"],
      ["應該馬上反向做空", false, "訊號參考價值低，不代表要反著做。比較合理的是不理它。"]] },
    { fig: `<p class="small q-cap">盤前你標出：亞洲時段高點 27,180、低點 27,050，昨天正規時段高點 27,220。</p>`, q: "這些價位的用途是？", step: 9, o: [
      ["只是參考，跟交易無關", false, "很多人在這些價位放停損或掛單，價格到了常有反應，是盤前地圖的一部分。"],
      ["關鍵價位：價格到這裡時，看訂單流有沒有確認", true, "時段高低點和 POC、VAH、VAL 一樣，是「在哪裡等」的地圖。到了之後再看訂單流決定要不要動手。"],
      ["一定會在這裡反轉", false, "沒有價位一定會反轉。它們只是值得注意的地方。"]] }
  ];

  PAGES["of-sess"] = window.KIT.page(window.COURSE.OFC, "of-sess", {
    topic: "交易時段",
    lede: "NQ 幾乎 24 小時都能交易，但不是每個小時都一樣。這一關用台灣時間把一天拆開：哪段時間成交量大、數據幾點公布、夏令時間怎麼換算，以及為什麼同一個訊號在不同時段意義不同。",
    analogy: [
      ["夜市的人潮", "傍晚剛開始人很少，晚上八九點最擠，快收攤又變少。市場的成交量也有尖峰和離峰。"],
      ["尖峰時刻的車流", "上下班時間車最多，一台車停下來不會造成塞車；半夜路上車很少，一台車就能擋住整條路。成交量小的時段，少量的單就能讓價格亂跑。"],
      ["出國的時差", "美國夏天會把時鐘調快一小時，台灣不會，所以美國的開盤時間換成台灣時間，<b>冬天和夏天差一小時</b>。"]],
    steps: STEPS, draw, simHTML, simMount,
    simIntro: "拉動時間軸，看台灣時間對應到哪個時段、美東和倫敦是幾點、成交量大概多少。可以切換冬令和夏令。",
    mist: [
      ["NQ 24 小時都一樣，什麼時候交易都可以", "成交量差很多。亞洲時段量小，訊號容易失真；美股時段量大，訊號比較有代表性。"],
      ["美股開盤一定是晚上 9:30", "那是夏令。冬令是晚上 10:30。每年 3 月和 11 月換季時要特別注意。"],
      ["開盤第一分鐘的突破最可靠", "開盤前 30～60 分鐘波動最大、假突破最多。很多人會等市場先表態再找機會。"]],
    faq: [
      ["冬令和夏令什麼時候換？", "美國的夏令從 3 月第二個星期日開始，到 11 月第一個星期日結束。英國是 3 月最後一個星期日到 10 月最後一個星期日。台灣沒有夏令時間。"],
      ["為什麼倫敦開盤時間有時候會差一小時？", "因為美國和英國換夏令的日期不同，每年春秋各有幾週時差會改變。用看盤軟體或經濟日曆的台灣時間顯示最保險。"],
      ["亞洲時段可以交易嗎？", "可以，只是成交量小、波動通常也小，訊號比較容易失真。如果只能在白天交易，要把停損和口數調得更保守，而且對訊號打折看。"],
      ["RTH 和 ETH 是什麼？", "RTH 是正規交易時段（美股開盤到收盤），ETH 是延長時段（其他時間，也叫隔夜盤）。很多軟體可以選 Profile、VWAP 只用 RTH 算，還是全天算，結果會不同。"],
      ["為什麼說 GEX 的影響主要在美股時段？", "選擇權大部分的成交和造市商的對沖，都集中在美股正規時段。隔夜時段選擇權交易少，所以一般認為 GEX 位階的作用比較弱。這是常見的看法，還需要實際紀錄去驗證。"],
      ["一天要盯盤多久？", "不用整晚。在台灣，常見的做法是 21:30 前做好盤前計畫，22:30 開盤先觀察，約 23:00～00:30 交易，之後檢討休息。"]],
    qs: QS,
    gloss: [
      ["亞洲時段", "台灣約早上 7:00～下午 4:00（冬令），NQ 成交量較小。"],
      ["歐洲時段", "倫敦開盤後到美股開盤前，成交量逐漸增加。"],
      ["RTH", "美股正規交易時段，冬令台灣 22:30～05:00。"],
      ["ETH／隔夜盤", "正規時段以外的時間。"],
      ["夏令時間", "美國日光節約時間，美國相關時間提早一小時。"],
      ["時段高低點", "各時段的最高、最低價，常被當成關鍵價位。"]],
    remember: "<b>冬令＋13、夏令＋12。</b>美股時段量最大、訊號最有代表性；開盤前 30～60 分鐘先觀察；時段高低點是關鍵價位。"
  });
})();
