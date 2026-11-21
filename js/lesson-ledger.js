/* 路線 2 第 6 關（新版）：市商的對沖帳本 */
(function () {
  const PAGES = (window.__PAGES = window.__PAGES || {});
  const { lerp, ease, seg, cards, chip } = window.KIT;
  const { B, fx, sg, arrow } = window.OPK;

  const PATH = [27000, 27200, 27350, 27100, 26800];
  function ledger(who) { // who: "short" 市商賣 Call（客戶買）, "long" 市商買 Call（客戶賣）
    const sign = who === "short" ? -1 : 1; let fut = 0;
    return PATH.map((F, i) => { const d = B(F, 27000, 7 - i * 0.5).callDelta, opt = sign * 1000 * d, need = -opt - fut; fut += need; return { i, F, d, opt: Math.round(opt), need: Math.round(need), fut: Math.round(fut) }; });
  }
  const SH = ledger("short"), LG = ledger("long");

  // 價格路徑＋對沖箭頭
  function pathPic(R, upto, t, o = {}) {
    const X = (i) => 110 + i * 110, Y = (p) => 70 + (27450 - p) * 0.36;
    let s = [27400, 27200, 27000, 26800].map((p) => `<line x1="90" x2="600" y1="${Y(p)}" y2="${Y(p)}" class="s-line"/><text x="82" y="${Y(p) + 4}" text-anchor="end" class="t-mute">${fx(p)}</text>`).join("");
    const pts = R.slice(0, upto + 1).map((r) => [X(r.i), Y(r.F)]);
    if (pts.length > 1) s += `<polyline points="${pts.map((p) => p.join(",")).join(" ")}" class="s-ink f-none" stroke-width="2.5"/>`;
    R.slice(0, upto + 1).forEach((r, k) => {
      const op = k === upto ? seg(t, 0.2, 0.7) : 1, up = r.need > 0, len = Math.min(46, 12 + Math.abs(r.need) / 12);
      s += `<circle cx="${X(r.i)}" cy="${Y(r.F)}" r="6" class="f-inkd"/><g opacity="${op}">${arrow(X(r.i) + 22, Y(r.F), up, len, up ? "s-buy" : "s-sell")}<text x="${X(r.i) + 34}" y="${Y(r.F) + 5}" class="${up ? "t-buy" : "t-sell"} t-b">${up ? "買" : "賣"} ${fx(Math.abs(r.need))}</text></g>`;
    });
    if (o.lab) s += `<text x="90" y="40" class="t-mute">${o.lab}</text>`;
    return s;
  }
  function row(r, x, y, op) {
    return `<g opacity="${op}"><text x="${x}" y="${y}" class="t-ink">${r.i === 0 ? "開始" : "第 " + r.i + " 步"}</text><text x="${x + 110}" y="${y}" text-anchor="end" class="t-ink">${fx(r.F)}</text><text x="${x + 180}" y="${y}" text-anchor="end" class="t-mute">${r.d.toFixed(2)}</text><text x="${x + 280}" y="${y}" text-anchor="end" class="t-ink">${sg(r.opt)}</text><text x="${x + 390}" y="${y}" text-anchor="end" class="${r.need > 0 ? "t-buy" : "t-sell"} t-b">${r.need > 0 ? "買" : "賣"} ${fx(Math.abs(r.need))}</text><text x="${x + 480}" y="${y}" text-anchor="end" class="t-ink t-b">${sg(r.fut)}</text></g>`;
  }
  const head = (x, y) => `<text x="${x}" y="${y}" class="t-mute">步驟</text><text x="${x + 110}" y="${y}" text-anchor="end" class="t-mute">價格</text><text x="${x + 180}" y="${y}" text-anchor="end" class="t-mute">Delta</text><text x="${x + 280}" y="${y}" text-anchor="end" class="t-mute">選擇權 Delta</text><text x="${x + 390}" y="${y}" text-anchor="end" class="t-mute">對沖</text><text x="${x + 480}" y="${y}" text-anchor="end" class="t-mute">期貨部位</text><line x1="${x}" x2="${x + 480}" y1="${y + 10}" y2="${y + 10}" class="s-line"/>`;

  const STEPS = [
    { cap: "<b>造市商</b>（市商）是隨時報價、站在你對面成交的人。客戶想買 1,000 口 27,000 Call，就是市商<b>賣</b>給他。",
      why: "市商靠買賣價差賺錢，不想賭方向。所以成交之後，他會馬上用期貨把方向風險抵銷掉。", stuck: "想成換匯櫃台：櫃台不在乎匯率漲跌，只想賺買賣之間那一點差價。" },
    { cap: "市商只有一個目標：讓整個帳本的 <b>Delta ＝ 0</b>。選擇權部位偏多多少，就用期貨偏空多少，像天秤兩邊一樣重。",
      why: "Delta ＝ 0 代表價格小幅漲跌，他的總損益幾乎不變。第 3 關學過：Delta 也可以當成「等於幾口期貨」。" },
    { cap: "開始：Call 的 Delta 是 " + SH[0].d.toFixed(2) + "。賣出 1,000 口，選擇權部位 Delta ＝ −1,000 × " + SH[0].d.toFixed(2) + " ＝ <b>" + sg(SH[0].opt) + "</b>。為了歸零，他<b>買進 " + fx(SH[0].need) + " 口期貨</b>。",
      why: "賣 Call 等於偏空（價格漲他會虧），所以要買期貨補成中立。", dur: 2400 },
    { cap: "價格漲到 27,200，Call 的 Delta 變成 " + SH[1].d.toFixed(2) + "（這就是 Gamma）。選擇權部位變成 " + sg(SH[1].opt) + "，手上已經有 +" + fx(SH[0].fut) + " 口期貨。",
      q: { t: "他還要再怎麼做？", o: [
        ["再買進約 " + fx(SH[1].need) + " 口期貨", true, "−" + fx(-SH[1].opt) + " ＋ " + fx(SH[0].fut) + " ＝ −" + fx(SH[1].need) + "，再買 " + fx(SH[1].need) + " 口就回到 0。價格漲，他也跟著買。"],
        ["賣出 " + fx(SH[1].need) + " 口期貨", false, "選擇權部位變得更偏空了，要買期貨補回來，不是賣。"],
        ["不用動", false, "Delta 從 " + SH[0].d.toFixed(2) + " 變成 " + SH[1].d.toFixed(2) + "，帳本已經不是 0 了。"]] } },
    { cap: "價格再漲到 27,350：Delta 升到 " + SH[2].d.toFixed(2) + "，他又<b>買 " + fx(SH[2].need) + " 口</b>。注意箭頭方向：<b>價格往上，他也往上買</b>。",
      why: "他的買單會把價格推得更高，價格更高又逼他再買。這就是負 Gamma 會放大波動的原因。", dur: 2600 },
    { cap: "接著價格回落到 27,100、再跌到 26,800：Delta 變小，他手上的期貨太多了，只好<b>賣 " + fx(-SH[3].need) + " 口、再賣 " + fx(-SH[4].need) + " 口</b>。價格往下，他也往下賣。",
      why: "漲了買、跌了賣，永遠和價格同方向。市場一動，他就被迫加入同一邊。", dur: 2800 },
    { cap: "這就是<b>負 Gamma 的市商</b>：他的對沖單和價格同方向，像滾雪球一樣<b>放大波動</b>。",
      why: "負 Gamma 來自「賣出選擇權」。客戶越愛買選擇權，市商就越偏負 Gamma。" },
    { cap: "反過來：如果是客戶<b>賣</b> 1,000 口 Call 給市商，市商就是正 Gamma。同一條價格路徑，他變成<b>漲了賣、跌了買</b>。",
      why: "買進的 Call 在上漲時 Delta 變大，部位變得偏多，所以要賣期貨；下跌時反過來要買。", dur: 2800 },
    { cap: "想一想：一個正 Gamma 的市商，價格突然急跌。",
      q: { t: "他的對沖會對價格造成什麼影響？", o: [
        ["他會買進期貨，像墊子一樣減緩下跌", true, "正 Gamma 逆勢對沖：跌了買、漲了賣。這些單會把價格往回推，壓低波動，像彈簧。"],
        ["他會賣出期貨，讓跌勢加速", false, "那是負 Gamma 的行為。"],
        ["沒有影響", false, "Delta 變了就得調整，大型市商的量可能很大。"]] } },
    { cap: "整個市場有很多市商、很多履約價。<b>淨 GEX</b> 就是在估計：全部加總起來，市商比較像<b>彈簧（正）</b>還是<b>雪球（負）</b>。",
      why: "下一關會用選擇權鏈的未平倉量，一步一步算出淨 GEX。", dur: 2400 },
    { cap: "實際上市商不會每動一點就對沖：通常是 Delta 偏到一個門檻才調整，也會用其他選擇權互相抵銷。這張帳本是<b>簡化模型</b>。",
      why: "所以 GEX 描述的是「傾向」，不是每一筆單。真正的對沖量和時間點，外面看不到。" },
    { cap: "整理：市商只想 <b>Delta ＝ 0</b>。賣了選擇權（負 Gamma）就得<b>追價</b>對沖，放大波動；買了選擇權（正 Gamma）就是<b>逆勢</b>對沖，壓低波動。",
      why: "記住這兩個方向，後面的牆、Flip、地形圖都是從這裡長出來的。" }
  ];

  function draw(svg, i, t) {
    const e = ease(t); let s = "";
    if (i === 0) {
      s += `<g opacity="${seg(t, 0, 0.3)}"><rect x="70" y="120" width="190" height="120" rx="14" class="f-buy-soft"/><text x="165" y="170" text-anchor="middle" class="t-ink t-b t-lg">客戶</text><text x="165" y="200" text-anchor="middle" class="t-buy">買 1,000 口 Call</text></g>`;
      s += `<g opacity="${seg(t, 0.3, 0.6)}"><rect x="380" y="120" width="190" height="120" rx="14" class="f-sell-soft"/><text x="475" y="170" text-anchor="middle" class="t-ink t-b t-lg">市商</text><text x="475" y="200" text-anchor="middle" class="t-sell">賣 1,000 口 Call</text></g>`;
      const x = lerp(270, 370, ease(seg(t, 0.5, 0.9)));
      s += `<g opacity="${seg(t, 0.5, 0.7)}"><path d="M270 180 H${x}" class="s-ink f-none" stroke-width="3"/><path d="M${x - 8} 172 l8 8 l-8 8" class="s-ink f-none" stroke-width="3"/></g><text x="320" y="290" text-anchor="middle" class="t-mute" opacity="${seg(t, 0.8, 1)}">市商站在客戶對面</text>`;
    } else if (i === 1) {
      const tilt = lerp(-14, 0, ease(seg(t, 0.3, 0.9)));
      s += `<path d="M320 300 l-40 40 h80 z" class="f-inkd"/><g transform="rotate(${tilt} 320 160)"><line x1="160" x2="480" y1="160" y2="160" class="s-ink" stroke-width="4"/><rect x="130" y="170" width="120" height="70" rx="10" class="f-sell-soft"/><text x="190" y="202" text-anchor="middle" class="t-sell t-b">選擇權</text><text x="190" y="224" text-anchor="middle" class="t-sell">Delta −506</text>`;
      s += `<rect x="390" y="170" width="120" height="70" rx="10" class="f-buy-soft" opacity="${seg(t, 0.2, 0.5)}"/><text x="450" y="202" text-anchor="middle" class="t-buy t-b" opacity="${seg(t, 0.2, 0.5)}">期貨</text><text x="450" y="224" text-anchor="middle" class="t-buy" opacity="${seg(t, 0.2, 0.5)}">+506 口</text></g><line x1="320" x2="320" y1="160" y2="300" class="s-ink" stroke-width="4"/><text x="320" y="80" text-anchor="middle" class="t-gamma t-b t-lg" opacity="${seg(t, 0.8, 1)}">總 Delta ＝ 0</text>`;
    } else if (i >= 2 && i <= 5) {
      const upto = i === 2 ? 0 : i === 3 ? 1 : i === 4 ? 2 : (t < 0.5 ? 3 : 4);
      const tt = i === 5 ? (t < 0.5 ? t * 2 : (t - 0.5) * 2) : t;
      s += pathPic(SH, upto, tt, { lab: "市商賣出 1,000 口 Call：價格路徑與對沖" });
      if (i === 3) s += chip(470, 330, "要買還是賣？", "hl");
    } else if (i === 6) {
      s += pathPic(SH, 4, 1, { lab: "負 Gamma：對沖和價格同方向" }) + `<text x="560" y="340" text-anchor="end" class="t-sell t-b" opacity="${seg(t, 0.2, 0.6)}">雪球：放大波動</text>`;
    } else if (i === 7 || i === 8) {
      s += pathPic(LG, i === 7 ? Math.min(4, Math.floor(e * 5)) : 4, 1, { lab: "市商買進 1,000 口 Call：同一條路徑" });
      if (i === 7) s += `<text x="560" y="340" text-anchor="end" class="t-gamma t-b" opacity="${seg(t, 0.8, 1)}">彈簧：壓低波動</text>`;
      else s += chip(470, 340, "急跌時他怎麼做？", "hl");
    } else if (i === 9) {
      const W = (x, lab, cls, txt) => `<rect x="${x}" y="90" width="230" height="190" rx="14" class="${cls}"/><text x="${x + 115}" y="130" text-anchor="middle" class="t-ink t-b t-lg">${lab}</text><text x="${x + 115}" y="260" text-anchor="middle" class="t-ink">${txt}</text>`;
      s += `<g opacity="${seg(t, 0, 0.4)}">${W(70, "正 GEX：彈簧", "f-gamma-soft", "漲了賣、跌了買")}<path d="M110 200 q20 -30 40 0 t40 0 t40 0 t40 0" class="s-gamma f-none" stroke-width="3"/></g>`;
      s += `<g opacity="${seg(t, 0.4, 0.8)}">${W(340, "負 GEX：雪球", "f-sell-soft", "漲了買、跌了賣")}<circle cx="${lerp(400, 500, e)}" cy="${lerp(170, 220, e)}" r="${lerp(10, 26, e)}" class="f-sell"/></g>`;
    } else if (i === 10) {
      s += cards([["理論", "每動一點就對沖，Delta 永遠是 0"], ["實際：門檻", "Delta 偏到一個範圍才調整"], ["實際：抵銷", "用其他選擇權互相抵銷，不一定動期貨"], ["結論", "GEX 描述傾向，不是每一筆單"]], t, { hl: 3 });
    } else {
      s += cards([["市商", "站在客戶對面，只想 Delta ＝ 0"], ["負 Gamma", "賣了選擇權：漲了買、跌了賣"], ["雪球", "對沖和價格同方向，放大波動"], ["正 Gamma", "買了選擇權：漲了賣、跌了買"], ["彈簧", "對沖和價格反方向，壓低波動"]], t, { hl: 1 });
    }
    svg.innerHTML = s;
  }

  const simHTML = `<div class="tabs ld-who"><button class="tab" data-k="short" aria-selected="true" type="button">客戶買 Call（市商賣，負 Gamma）</button><button class="tab" data-k="long" aria-selected="false" type="button">客戶賣 Call（市商買，正 Gamma）</button></div>
<svg class="fpx ld-svg" viewBox="0 0 640 380" role="img" aria-label="價格路徑與市商對沖"></svg>
<svg class="fpx ld-tab" viewBox="0 0 640 210" role="img" aria-label="對沖帳本"></svg>
<div class="btn-row"><button class="btn ld-prev" type="button">上一步</button><button class="btn primary ld-next" type="button">下一步</button><span class="small ld-n"></span></div><div class="ld-out"></div><ul class="sim-task ld-task"></ul>`;
  function simMount(box) {
    const q = (s) => box.querySelector(s); let who = "short", st = 0; const done = {};
    function paint() {
      const R = who === "short" ? SH : LG, cur = R[st], prev = R[st - 1];
      q(".ld-svg").innerHTML = pathPic(R, st, 1, { lab: who === "short" ? "市商賣出 1,000 口 Call" : "市商買進 1,000 口 Call" });
      q(".ld-tab").innerHTML = head(60, 30) + R.slice(0, st + 1).map((r, k) => row(r, 60, 64 + k * 30, 1)).join("");
      q(".ld-n").textContent = `第 ${st + 1} / ${PATH.length} 步`;
      const same = prev ? (cur.F > prev.F) === (cur.need > 0) : null;
      q(".ld-out").innerHTML = st === 0 ? `<p>開始：選擇權部位 Delta ${sg(cur.opt)}，市商${cur.need > 0 ? "買進" : "賣出"} <b>${fx(Math.abs(cur.need))}</b> 口期貨歸零。</p>` :
        `<p>價格${cur.F > prev.F ? "漲" : "跌"}到 ${fx(cur.F)}，Delta ${prev.d.toFixed(2)} → ${cur.d.toFixed(2)}，市商要<b>${cur.need > 0 ? "買進" : "賣出"} ${fx(Math.abs(cur.need))} 口</b>：${same ? "<b>和價格同方向（雪球）</b>" : "<b>和價格反方向（彈簧）</b>"}。</p>`;
      if (who === "short" && st === 4) done.a = true;
      if (who === "long" && st === 4) done.b = true;
      if (done.a && done.b) done.c = true;
      q(".ld-task").innerHTML = [["a", "任務 1：用「市商賣 Call」走完 5 步，數數他買了幾次、賣了幾次"], ["b", "任務 2：切到「市商買 Call」再走一次，箭頭方向有什麼不同？"], ["c", "任務 3：兩種都走完，比較最後的期貨部位"]].map(([k, tx]) => `<li class="${done[k] ? "ok" : ""}">${done[k] ? "✓" : "○"} ${tx}</li>`).join("");
    }
    q(".ld-next").addEventListener("click", () => { st = Math.min(PATH.length - 1, st + 1); paint(); });
    q(".ld-prev").addEventListener("click", () => { st = Math.max(0, st - 1); paint(); });
    q(".ld-who").addEventListener("click", (e) => { const b = e.target.closest(".tab"); if (!b) return; who = b.dataset.k; st = 0; box.querySelectorAll(".ld-who .tab").forEach((x) => x.setAttribute("aria-selected", String(x === b))); paint(); });
    paint();
  }

  const QS = [
    { fig: `<p class="small q-cap">市商賣出 2,000 口 Call，每口 Delta 0.4。</p>`, q: "他一開始要怎麼對沖？", step: 3, o: [
      ["買進 800 口期貨", true, "選擇權部位 Delta ＝ −2,000 × 0.4 ＝ −800，買 800 口期貨歸零。"],
      ["賣出 800 口期貨", false, "賣 Call 已經偏空，再賣期貨會更偏空。"],
      ["買進 2,000 口期貨", false, "要看 Delta，不是看口數。"]] },
    { fig: `<p class="small q-cap">全市場的市商整體是負 Gamma，價格開始急漲。</p>`, q: "他們的對沖最可能造成什麼？", step: 7, o: [
      ["追著買期貨，讓漲勢更猛", true, "負 Gamma 的對沖方向和價格相同：漲了買。這些買單會推高價格。"],
      ["賣期貨，把價格壓回來", false, "那是正 Gamma 的行為。"],
      ["完全沒影響", false, "對沖量可能很大，尤其在快到期、Gamma 很集中的時候。"]] },
    { fig: `<p class="small q-cap">一位交易者說：「市商的帳本可以準確告訴我他下一秒要買幾口。」</p>`, q: "這句話哪裡不對？", step: 11, o: [
      ["實際對沖有門檻、會用其他選擇權抵銷，帳本只是簡化模型", true, "GEX 描述的是傾向，不是每一筆單。真正的對沖量外面看不到。"],
      ["沒有錯，市商都是逐點對沖", false, "實務上通常是偏到一個範圍才調整。"],
      ["市商根本不對沖", false, "他們會對沖，只是方式和時間點不固定。"]] }
  ];

  PAGES["op-5"] = window.KIT.page(window.COURSE.OPC, "op-5", {
    topic: "市商的對沖帳本",
    lede: "第 3 關說賣方要「追著價格對沖」。這關跟著一本市商的帳本，一步一步算出他要買賣幾口期貨，看懂「彈簧」和「雪球」是怎麼來的。",
    analogy: [
      ["換匯櫃台", "市商像換匯櫃台：<b>不賭方向</b>，只賺買賣價差。"],
      ["天秤", "選擇權部位放一邊、期貨放另一邊，永遠要讓 <b>Delta ＝ 0</b>。"],
      ["彈簧和雪球", "正 Gamma 的對沖把價格拉回來（<b>彈簧</b>）；負 Gamma 的對沖把價格越推越遠（<b>雪球</b>）。"]],
    steps: STEPS, draw, simHTML, simMount,
    simIntro: "切換客戶是買還是賣 Call，一步一步看價格走動時，市商要買賣幾口期貨。",
    mist: [
      ["市商在賭方向", "市商只想 Delta ＝ 0，賺的是買賣價差。他的期貨單是為了避險，不是看多看空。"],
      ["市商的對沖一定會推動價格", "要看量。小部位的對沖影響很小；只有全市場加總、而且 Gamma 很集中時，才可能明顯影響價格。"],
      ["正 Gamma 一定不會大跌", "正 Gamma 只是讓對沖單站在價格的反方向。重大消息或大單都可以直接把價格推走。"]],
    faq: [
      ["為什麼客戶買選擇權，市商就是負 Gamma？", "市商站在對面，客戶買他就賣。賣出選擇權就是負 Gamma（第 3 關）。"],
      ["實際上誰是市商？", "大型券商和專門的造市公司。交易所會給他們手續費優惠，換取他們隨時報價。"],
      ["市商用什麼對沖？", "最常見是期貨，也會用其他履約價或其他到期日的選擇權互相抵銷。"],
      ["為什麼表格裡的 Delta 會變？", "價格動了，Delta 就跟著變，這是 Gamma；時間過去 Delta 也會變，這是 Charm（第 9 關）。"],
      ["這跟我交易 NQ 有什麼關係？", "如果全市場的市商偏負 Gamma，價格容易一路衝；偏正 Gamma，價格容易來回震盪。你可以依此調整目標和止損（第 7、10 關）。"]],
    qs: QS,
    gloss: [
      ["造市商（市商）", "隨時報價、站在客戶對面成交，靠價差賺錢的人。"],
      ["Delta 中立", "整個部位的 Delta 接近 0，價格小幅漲跌不影響損益。"],
      ["對沖", "用期貨（或其他工具）抵銷方向風險。"],
      ["負 Gamma 對沖", "漲了買、跌了賣，和價格同方向，放大波動。"],
      ["正 Gamma 對沖", "漲了賣、跌了買，和價格反方向，壓低波動。"]],
    remember: "<b>市商只想 Delta ＝ 0。</b>負 Gamma 追價對沖像雪球，正 Gamma 逆勢對沖像彈簧。"
  });
})();
