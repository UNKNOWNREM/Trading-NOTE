/* 新版試做：Footprint 逐步圖解（0 基礎版）。照計畫文件「每關固定結構」的 8 段做。 */
(function () {
  const PAGES = (window.__PAGES = window.__PAGES || {});
  const $ = (r, s) => r.querySelector(s);
  const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;");

  /* ---------- 共用資料：一根上漲 K 棒，6 個價位，用 1–20 口的小數字 ---------- */
  const PX = [101.25, 101.0, 100.75, 100.5, 100.25, 100.0];
  const SELL = [2, 3, 3, 5, 6, 4], BUY = [1, 6, 9, 7, 4, 1];
  const DEL = BUY.map((b, r) => b - SELL[r]);
  const SUM = (a) => a.reduce((s, v) => s + v, 0);
  const OHLC = { o: 100.25, h: 101.25, l: 100.0, c: 101.0 };
  const ASK0 = { "101.25": 12, "101.00": 10, "100.75": 8 }, BID0 = { "100.50": 6, "100.25": 10, "100.00": 14 };
  const f2 = (p) => p.toFixed(2);
  const sg = (v) => (v > 0 ? "+" : v < 0 ? "−" : "") + Math.abs(v);

  /* ---------- 版面座標（viewBox 640×380） ---------- */
  const RY = (r) => 78 + r * 34;          // 第 r 列中心
  const RH = 28;
  const PY = (p) => RY(PX.indexOf(p));      // 價格 → 列中心
  const COL = { sx: 92, sw: 96, px: 192, pw: 64, bx: 260, bw: 96, dx: 368, dw: 62 };
  const BOOK = { bx: 462, bw: 52, px: 516, pw: 56, ax: 576, aw: 52 };
  const lerp = (a, b, t) => a + (b - a) * t;
  const ease = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
  const seg = (t, a, b) => Math.max(0, Math.min(1, (t - a) / (b - a)));   // t 在 [a,b] 間的進度

  function candleSVG(cx, w, op, cls = "") {
    const Y = (p) => lerp(RY(0), RY(5), (101.25 - p) / 1.25);
    return `<g opacity="${op}" class="${cls}"><line x1="${cx}" x2="${cx}" y1="${Y(OHLC.h)}" y2="${Y(OHLC.l)}" class="s-buy" stroke-width="2.5"/><rect x="${cx - w / 2}" width="${w}" y="${Y(OHLC.c)}" height="${Y(OHLC.o) - Y(OHLC.c)}" rx="3" class="f-buy"/></g>`;
  }
  function chip(x, y, txt, kind, op = 1) {
    const w = txt.length * 12 + 18;
    return `<g opacity="${op}"><rect x="${x - w / 2}" y="${y - 13}" width="${w}" height="26" rx="13" class="${kind === "buy" ? "f-buy" : "f-sell"}"/><text x="${x}" y="${y + 4.5}" text-anchor="middle" class="t-w t-b">${txt}</text></g>`;
  }
  function headers(op, withDelta) {
    return `<g opacity="${op}"><text x="${COL.sx + COL.sw / 2}" y="50" text-anchor="middle" class="t-sell t-b">主動賣（口）</text><text x="${COL.px + COL.pw / 2}" y="50" text-anchor="middle" class="t-mute">價格</text><text x="${COL.bx + COL.bw / 2}" y="50" text-anchor="middle" class="t-buy t-b">主動買（口）</text>${withDelta ? `<text x="${COL.dx + COL.dw / 2}" y="50" text-anchor="middle" class="t-ink t-b">Delta</text>` : ""}</g>`;
  }
  // 一整格 Footprint。opts: hl（要框起來的列）, q（顯示問號的列）, dShow（顯示 Delta 的列數，可小數）
  function grid(sell, buy, op, o = {}) {
    let s = `<g opacity="${op}">`;
    PX.forEach((p, r) => {
      const y = RY(r) - RH / 2, hot = o.hot === r;
      const sb = sell[r] > 0 && o.tint ? "f-sell-soft" : "g-cell", bb = buy[r] > 0 && o.tint ? "f-buy-soft" : "g-cell";
      s += `<rect x="${COL.sx}" y="${y}" width="${COL.sw}" height="${RH}" rx="5" class="${sb}"/><rect x="${COL.bx}" y="${y}" width="${COL.bw}" height="${RH}" rx="5" class="${bb}"/>`;
      s += `<text x="${COL.px + COL.pw / 2}" y="${RY(r) + 4.5}" text-anchor="middle" class="t-mute">${f2(p)}</text>`;
      if (o.q === r) {
        s += `<rect x="${COL.sx}" y="${y}" width="${COL.sw}" height="${RH}" rx="5" fill="none" class="s-hl dash" stroke-width="2"/><rect x="${COL.bx}" y="${y}" width="${COL.bw}" height="${RH}" rx="5" fill="none" class="s-hl dash" stroke-width="2"/>`;
        s += `<text x="${COL.sx + COL.sw / 2}" y="${RY(r) + 6}" text-anchor="middle" class="t-ink t-lg t-b">？</text><text x="${COL.bx + COL.bw / 2}" y="${RY(r) + 6}" text-anchor="middle" class="t-ink t-lg t-b">？</text>`;
      } else {
        if (sell[r] > 0) s += `<text x="${COL.sx + COL.sw - 12}" y="${RY(r) + 5}" text-anchor="end" class="t-sell t-b t-lg">${sell[r]}</text>`;
        if (buy[r] > 0) s += `<text x="${COL.bx + 12}" y="${RY(r) + 5}" class="t-buy t-b t-lg">${buy[r]}</text>`;
      }
      if (o.dShow != null && r < o.dShow) {
        const d = buy[r] - sell[r], a = Math.min(1, o.dShow - r);
        s += `<g opacity="${a}"><rect x="${COL.dx}" y="${y}" width="${COL.dw}" height="${RH}" rx="5" class="${d > 0 ? "f-buy-soft" : d < 0 ? "f-sell-soft" : "g-cell"}"/><text x="${COL.dx + COL.dw / 2}" y="${RY(r) + 5}" text-anchor="middle" class="${d > 0 ? "t-buy" : d < 0 ? "t-sell" : "t-mute"} t-b t-lg">${sg(d)}</text></g>`;
      }
      if (hot) s += `<rect x="${COL.sx - 4}" y="${y - 4}" width="${COL.bx + COL.bw - COL.sx + 8}" height="${RH + 8}" rx="8" fill="none" class="s-hl" stroke-width="2.5"/>`;
    });
    return s + "</g>";
  }
  function book(ask, bid, op, flash) {
    let s = `<g opacity="${op}"><text x="${BOOK.bx + 83}" y="32" text-anchor="middle" class="t-ink t-b">掛單簿（排隊中的限價單）</text><text x="${BOOK.bx + BOOK.bw / 2}" y="50" text-anchor="middle" class="t-buy">買單在等</text><text x="${BOOK.ax + BOOK.aw / 2}" y="50" text-anchor="middle" class="t-sell">賣單在等</text>`;
    PX.forEach((p, r) => {
      const y = RY(r) - RH / 2, k = f2(p);
      s += `<text x="${BOOK.px + BOOK.pw / 2}" y="${RY(r) + 4.5}" text-anchor="middle" class="t-mute">${k}</text>`;
      if (bid[k] != null) s += `<rect x="${BOOK.bx}" y="${y}" width="${BOOK.bw}" height="${RH}" rx="5" class="${flash === "b" + k ? "f-hl2" : "g-cell"}"/><text x="${BOOK.bx + BOOK.bw / 2}" y="${RY(r) + 5}" text-anchor="middle" class="t-buy t-b">${bid[k]}</text>`;
      if (ask[k] != null) s += `<rect x="${BOOK.ax}" y="${y}" width="${BOOK.aw}" height="${RH}" rx="5" class="${flash === "a" + k ? "f-hl2" : "g-cell"}"/><text x="${BOOK.ax + BOOK.aw / 2}" y="${RY(r) + 5}" text-anchor="middle" class="t-sell t-b">${ask[k]}</text>`;
    });
    return s + "</g>";
  }
  const Z = () => [0, 0, 0, 0, 0, 0];
  const at = (arr, r, v) => { const a = arr.slice(); a[r] = v; return a; };

  /* ---------- 逐步動畫：12 步 ---------- */
  const STEPS = [
    { cap: "這是一根上漲的 K 棒。它只告訴你價格<b>從哪裡開始、最高最低到哪、最後收在哪</b>，沒說是誰在買、誰在賣。",
      why: "K 棒把一段時間內的所有成交壓縮成四個價格：開盤、最高、最低、收盤。資訊很精簡，但也丟掉了「過程」：同樣一根 K 棒，裡面可能是買方一路推上去，也可能是賣方一直在賣、只是有人在下面接。",
      stuck: "把 K 棒想成一段旅程的起點、終點、最遠到過哪裡。它沒告訴你路上發生什麼事。",
      q: { t: "只看這根 K 棒，你能知道這段時間是<b>主動買多</b>還是<b>主動賣多</b>嗎？", o: [
        ["能，上漲 K 棒就是買的人比較多", false, "每一筆成交都有一個買方、一個賣方，口數一樣多。上漲只說明價格往上走，不代表急著買的人比較多。第 11 步會看到一根上漲 K 棒，裡面卻是主動賣比較多。"],
        ["不能，K 棒只記了開高低收四個價格", true, "K 棒只保留四個價格，誰主動、主動多少都看不到。這就是為什麼要把它拆開。"],
        ["能，實體越長代表買方越多", false, "實體長短只是開盤和收盤的距離，跟誰主動沒有直接關係。"]] } },
    { cap: "把 K 棒打開：這段時間裡，<b>每一個價格都有人成交過</b>。我們替每個價格開一列，左右各一格。",
      why: "期貨的價格是一格一格跳的（NQ 一跳 0.25 點）。這根 K 棒從 100.00 走到 101.25，中間經過 6 個價格，每個價格都可能有成交，所以拆成 6 列。",
      stuck: "像把一本書的每一頁攤開來看，而不是只看封面封底。" },
    { cap: "右邊是掛單簿：大家掛著排隊的單。有人<b>急著買</b>，就下「市價買單」，直接吃掉別人掛在 100.75 的賣單。",
      why: "市價單＝「我現在就要，價格隨便」。它會去吃掛單簿上最便宜的賣單（100.75 有 8 口在等）。吃掉 2 口後，那裡剩 6 口。這種主動吃單的人，叫「主動買方」。",
      stuck: "賣單像排隊等客人的攤販；市價買單是直接走到第一個攤位，用標價買下。", stuckHref: "#of-1", stuckLabel: "先回第 2 關：掛單簿與兩種下單 →", dur: 2000 },
    { cap: "這 2 口是<b>主動買</b>來的，所以記在 100.75 這一列的<b>右邊</b>。",
      why: "Footprint 只記「誰主動」。這筆成交一定有買有賣（一個人買 2 口、另一個人賣 2 口），但主動的是買方（他用市價單），所以記在右邊的主動買欄。", dur: 1800 },
    { cap: "反過來，有人<b>急著賣</b>，用市價賣單打掉 100.50 的買單。主動賣出的 1 口記在<b>左邊</b>。",
      why: "市價賣單會去吃掛單簿上最高的買單（100.50 有 6 口在等）。主動的是賣方，所以記在左邊的主動賣欄。",
      stuck: "記法只有一條：用市價單的那一方是主動方。買方主動記右邊，賣方主動記左邊。", stuckHref: "#of-1", stuckLabel: "回第 2 關複習市價單 →", dur: 2400 },
    { cap: "換你想：下一筆是<b>市價買單 3 口</b>，在 100.75 成交。",
      q: { t: "這 3 口會記在 100.75 的哪一邊？", o: [
        ["左邊（主動賣）", false, "這筆是市價<b>買</b>單，主動的是買方。左邊只記用市價單賣出的口數。"],
        ["右邊（主動買）", true, "市價買單＝主動買，記在右邊。100.75 右邊從 2 口變成 5 口。"],
        ["兩邊各記 3 口", false, "每筆成交確實有買有賣，但 Footprint 只記主動的那一方，所以只記一邊。"]] } },
    { cap: "一整根 K 棒，就是<b>很多筆這樣的成交</b>，一筆一筆加進格子裡。",
      why: "真實盤面一根 1 分鐘 K 棒可能有幾百到幾千筆成交。這裡只用 1–20 口的小數字，方便看懂；之後換成真實數字，讀法完全一樣。", dur: 2600 },
    { cap: "看 100.75 這一列：左邊 3 口、右邊 9 口。在這個價格，<b>主動買比主動賣多 6 口</b>。",
      why: "比較同一列的左右兩格，就知道在這個價格上，哪一方比較急。這是讀 Footprint 最基本的一步。" },
    { cap: "每一列都用<b>右邊減左邊</b>，得到的數字叫 <b>Delta</b>。正數＝主動買比較多，負數＝主動賣比較多。",
      why: "Delta 是英文「差額」的意思。100.75：9 − 3 ＝ +6。100.00：1 − 4 ＝ −3。顏色跟著正負走：藍色是買方多，橘色是賣方多。", dur: 2600,
      q: { t: "換一個例子：某一列<b>左邊 8 口、右邊 3 口</b>，這一列的 Delta 是多少？", o: [
        ["+5", false, "差 5 口沒錯，但正負號反了。Delta 是<b>右減左</b>：3 − 8 ＝ −5。左邊（主動賣）比較多，所以是負的。"],
        ["−5", true, "3 − 8 ＝ −5。主動賣比主動買多 5 口，Delta 是負的，畫成橘色。"],
        ["11", false, "11 是左右加起來，那是這個價格的總成交量，不是 Delta。"]] } },
    { cap: "把每一列的 Delta 加起來，就是<b>整根 K 棒的總 Delta：+5</b>。這根 K 棒裡，主動買總共比主動賣多 5 口。",
      why: "(−1) + 3 + 6 + 2 + (−2) + (−3) ＝ +5。也可以直接用總數算：主動買 28 口 − 主動賣 23 口 ＝ +5。", dur: 2200 },
    { cap: "兩根<b>長得一模一樣</b>的 K 棒，裡面的故事可以完全不同：左邊是主動買推上去的；右邊主動賣比較多，價格卻還是漲了。",
      why: "右邊這種情況，代表有人用大量限價買單在下面接住賣壓（叫「吸收」，第 12 關會教）。光看 K 棒分不出這兩種情況，打開 Footprint 才看得到。", dur: 2400,
      q: { t: "K 棒 B 的主動賣比較多（總 Delta −11），價格卻還是漲了。最可能的原因是？", o: [
        ["資料出錯了，主動賣多價格就不可能漲", false, "完全可能發生。主動賣方每賣一口，都要有人在下面接；如果接的人（限價買單）夠多、還一路把買單往上掛，價格照樣會墊高。"],
        ["有人用大量限價買單在下面接住賣壓", true, "主動賣方一直賣，卻推不動價格，代表下面有很多限價買單在接。這叫「吸收」，第 12 關會專門教。"],
        ["Delta 是負的，所以其實是下跌 K 棒", false, "K 棒漲跌看的是收盤和開盤。B 的收盤比開盤高，就是上漲 K 棒；Delta 只說明過程中誰比較主動。"]] } },
    { cap: "整理一下就是這張圖。接下來換你自己下單，看數字記在哪裡。",
      why: "左＝主動賣、右＝主動買、中間＝價格、Delta＝右−左、總 Delta＝整根加總。這五件事就是讀 Footprint 的全部基礎。" }
  ];

  function draw(svg, i, t) {
    const e = ease(t);
    let s = "";
    const ASK = Object.assign({}, ASK0), BIDB = Object.assign({}, BID0);
    if (i === 0) {
      s += candleSVG(200, 44, 1);
      const Y = (p) => lerp(RY(0), RY(5), (101.25 - p) / 1.25);
      [["最高 101.25", OHLC.h], ["收盤 101.00", OHLC.c], ["開盤 100.25", OHLC.o], ["最低 100.00", OHLC.l]].forEach(([lb, p], k) => {
        const a = seg(t, k * 0.2, k * 0.2 + 0.25);
        s += `<g opacity="${a}"><line x1="226" x2="262" y1="${Y(p)}" y2="${Y(p)}" class="s-ink" stroke-width="1.2"/><text x="268" y="${Y(p) + 4.5}" class="t-ink t-b">${lb}</text></g>`;
      });
      s += `<text x="400" y="190" class="t-mute" opacity="${seg(t, 0.8, 1)}">誰在買？誰在賣？</text><text x="400" y="212" class="t-mute" opacity="${seg(t, 0.8, 1)}">K 棒上看不到。</text>`;
    } else if (i === 1) {
      s += candleSVG(lerp(200, 44, e), lerp(44, 18, e), lerp(1, 0.55, e));
      s += headers(seg(t, 0.4, 1), false) + grid(Z(), Z(), seg(t, 0.3, 1));
      s += `<text x="${COL.bx + COL.bw + 20}" y="${RY(2)}" class="t-mute" opacity="${seg(t, 0.7, 1)}">每個價格一列</text><text x="${COL.bx + COL.bw + 20}" y="${RY(2) + 20}" class="t-mute" opacity="${seg(t, 0.7, 1)}">目前都還是空的</text>`;
    } else if (i <= 5) {
      s += candleSVG(44, 18, 0.55) + headers(1, false);
      let sell = Z(), buy = Z(), flash = null, q = null;
      if (i === 2) {
        const p = seg(t, 0.2, 0.75);
        if (t > 0.75) { ASK["100.75"] = 6; flash = "a100.75"; }
        s += book(ASK, BIDB, seg(t, 0, 0.2));
        s += grid(sell, buy, 1);
        if (t < 0.8) s += chip(lerp(560, BOOK.ax + BOOK.aw / 2, ease(p)), lerp(338, PY(100.75), ease(p)), "市價買 2 口", "buy", seg(t, 0.12, 0.22));
        else s += `<text x="${BOOK.ax + BOOK.aw / 2}" y="${PY(100.5) + 5}" text-anchor="middle" class="t-sell t-b">↑ 8→6</text>`;
        svg.innerHTML = s; return;
      }
      ASK["100.75"] = 6;
      if (i === 3) {
        const p = ease(seg(t, 0.1, 0.8));
        if (t > 0.8) buy = at(buy, 2, 2);
        s += book(ASK, BIDB, 1) + grid(sell, buy, 1, { tint: true, hot: t > 0.8 ? 2 : null });
        if (t <= 0.8) s += chip(lerp(BOOK.ax + BOOK.aw / 2, COL.bx + COL.bw / 2, p), PY(100.75), "主動買 2 口", "buy");
        else s += `<text x="${COL.bx + COL.bw + 14}" y="${PY(100.75) + 5}" class="t-buy t-b">← 記在右邊</text>`;
        svg.innerHTML = s; return;
      }
      buy = at(buy, 2, 2);
      if (i === 4) {
        const p1 = ease(seg(t, 0.05, 0.4)), p2 = ease(seg(t, 0.5, 0.88));
        if (t > 0.4) { BIDB["100.50"] = 5; flash = t < 0.6 ? "b100.50" : null; }
        if (t > 0.88) sell = at(sell, 3, 1);
        s += book(ASK, BIDB, 1, flash) + grid(sell, buy, 1, { tint: true, hot: t > 0.88 ? 3 : null });
        if (t <= 0.45) s += chip(lerp(560, BOOK.bx + BOOK.bw / 2, p1), lerp(338, PY(100.5), p1), "市價賣 1 口", "sell");
        else if (t <= 0.88) s += chip(lerp(BOOK.bx + BOOK.bw / 2, COL.sx + COL.sw / 2, p2), PY(100.5), "主動賣 1 口", "sell");
        else s += `<text x="${COL.sx - 8}" y="${PY(100.5) + 5}" text-anchor="end" class="t-sell t-b">記在左邊 →</text>`;
        svg.innerHTML = s; return;
      }
      BIDB["100.50"] = 5; sell = at(sell, 3, 1);
      s += book(ASK, BIDB, 1) + grid(sell, buy, 1, { tint: true, q: 2 });
      s += chip(520, 330, "市價買 3 口 @100.75", "buy", 0.6 + 0.4 * Math.abs(Math.sin(t * Math.PI)));
    }
    if (i === 6) {
      const base = { sell: at(Z(), 3, 1), buy: at(Z(), 2, 5) };
      const sell = SELL.map((v, r) => Math.round(lerp(base.sell[r], v, e))), buy = BUY.map((v, r) => Math.round(lerp(base.buy[r], v, e)));
      s += candleSVG(44, 18, 0.55) + headers(1, false) + book(ASK0, BID0, 1 - seg(t, 0, 0.3)) + grid(sell, buy, 1, { tint: true });
      const n = SUM(sell) + SUM(buy);
      s += `<text x="${COL.sx}" y="306" class="t-ink t-b">已記入 ${n} 口</text><text x="${COL.sx}" y="326" class="t-mute">（主動賣 ${SUM(sell)}、主動買 ${SUM(buy)}）</text>`;
      s += `<text x="${COL.bx + COL.bw + 24}" y="${RY(1)}" class="t-mute" opacity="${seg(t, 0.4, 1)}">右邊 100.75 先變成 5 口</text><text x="${COL.bx + COL.bw + 24}" y="${RY(1) + 20}" class="t-mute" opacity="${seg(t, 0.4, 1)}">（上一題的答案），</text><text x="${COL.bx + COL.bw + 24}" y="${RY(1) + 40}" class="t-mute" opacity="${seg(t, 0.4, 1)}">之後一筆一筆累加。</text>`;
    }
    if (i === 7) {
      s += candleSVG(44, 18, 0.55) + headers(1, false) + grid(SELL, BUY, 1, { tint: true, hot: 2 });
      const a = seg(t, 0.1, 0.6);
      s += `<g opacity="${a}"><path d="M${COL.bx + COL.bw + 6} ${RY(2)} L456 ${RY(2)}" class="s-hl" stroke-width="2" fill="none"/>
        <rect x="456" y="${RY(2) - 64}" width="176" height="150" rx="12" class="f-surface s-hl" stroke-width="2"/>
        <text x="544" y="${RY(2) - 40}" text-anchor="middle" class="t-mute">100.75 放大</text>
        <text x="496" y="${RY(2) - 4}" text-anchor="middle" class="t-sell t-b t-xl">3</text><text x="496" y="${RY(2) + 16}" text-anchor="middle" class="t-sell">主動賣</text>
        <text x="592" y="${RY(2) - 4}" text-anchor="middle" class="t-buy t-b t-xl">9</text><text x="592" y="${RY(2) + 16}" text-anchor="middle" class="t-buy">主動買</text>
        <text x="544" y="${RY(2) + 54}" text-anchor="middle" class="t-ink t-b" opacity="${seg(t, 0.6, 1)}">主動買多 6 口</text></g>`;
    }
    if (i === 8) {
      s += candleSVG(44, 18, 0.55) + headers(1, true) + grid(SELL, BUY, 1, { tint: true, dShow: e * 6.2 });
      const r = Math.min(5, Math.floor(e * 6));
      s += `<text x="${COL.dx + COL.dw + 16}" y="${RY(r) + 5}" class="t-ink">${BUY[r]} − ${SELL[r]} ＝ ${sg(DEL[r])}</text>`;
      s += `<text x="462" y="300" class="t-mute">藍＝買方多　橘＝賣方多</text>`;
    }
    if (i === 9 || i === 11) {
      const full = i === 11;
      s += candleSVG(44, 18, 0.55) + headers(1, true) + grid(SELL, BUY, 1, { tint: true, dShow: 6 });
      const tot = full ? 5 : Math.round(lerp(0, 5, seg(t, 0.2, 0.8)));
      s += `<rect x="${COL.dx}" y="${RY(5) + 22}" width="${COL.dw}" height="34" rx="6" class="f-buy"/><text x="${COL.dx + COL.dw / 2}" y="${RY(5) + 45}" text-anchor="middle" class="t-w t-b t-lg">${sg(tot)}</text>`;
      s += `<text x="${COL.dx + COL.dw / 2}" y="${RY(5) + 74}" text-anchor="middle" class="t-ink t-b">總 Delta</text>`;
      s += `<text x="${COL.sx + COL.sw - 12}" y="${RY(5) + 44}" text-anchor="end" class="t-sell">合計 23</text><text x="${COL.bx + 12}" y="${RY(5) + 44}" class="t-buy">合計 28</text>`;
      if (full) {
        const notes = [
          [RY(0) - 2, "左＝主動賣（市價賣的口數）"], [RY(1) + 6, "右＝主動買（市價買的口數）"],
          [RY(2) + 14, "中間＝價格，一列一個"], [RY(3) + 22, "Delta＝右 − 左（每一列）"], [RY(5) + 40, "總 Delta＝整根加總 +5"]];
        notes.forEach(([y, tx], k) => { s += `<g opacity="${seg(t, k * 0.15, k * 0.15 + 0.3)}"><circle cx="458" cy="${y - 4}" r="9" class="f-buy"/><text x="458" y="${y}" text-anchor="middle" class="t-w t-b">${k + 1}</text><text x="474" y="${y}" class="t-ink">${tx}</text></g>`; });
      } else {
        s += `<text x="462" y="${RY(2)}" class="t-ink" opacity="${seg(t, 0.5, 1)}">(−1) + 3 + 6 + 2</text><text x="462" y="${RY(2) + 22}" class="t-ink" opacity="${seg(t, 0.5, 1)}">+ (−2) + (−3) ＝ +5</text><text x="462" y="${RY(2) + 52}" class="t-mute" opacity="${seg(t, 0.7, 1)}">也等於 28 − 23</text>`;
      }
    }
    if (i === 10) {
      const R = { s: [3, 7, 8, 6, 5, 2], b: [1, 4, 5, 5, 4, 1] };
      const mini = (x0, sell, buy, op, title, note, cls) => {
        let g = `<g opacity="${op}"><text x="${x0 + 140}" y="34" text-anchor="middle" class="t-ink t-b">${title}</text>`;
        const Y = (p) => lerp(RY(0), RY(5), (101.25 - p) / 1.25);
        g += `<line x1="${x0 + 20}" x2="${x0 + 20}" y1="${Y(OHLC.h)}" y2="${Y(OHLC.l)}" class="s-buy" stroke-width="2.5"/><rect x="${x0 + 11}" width="18" y="${Y(OHLC.c)}" height="${Y(OHLC.o) - Y(OHLC.c)}" rx="3" class="f-buy"/>`;
        PX.forEach((p, r) => {
          const y = RY(r) - RH / 2, d = buy[r] - sell[r];
          g += `<rect x="${x0 + 46}" y="${y}" width="70" height="${RH}" rx="5" class="f-sell-soft"/><text x="${x0 + 106}" y="${RY(r) + 5}" text-anchor="end" class="t-sell t-b">${sell[r]}</text>`;
          g += `<text x="${x0 + 146}" y="${RY(r) + 4.5}" text-anchor="middle" class="t-mute">${f2(p)}</text>`;
          g += `<rect x="${x0 + 176}" y="${y}" width="70" height="${RH}" rx="5" class="f-buy-soft"/><text x="${x0 + 186}" y="${RY(r) + 5}" class="t-buy t-b">${buy[r]}</text>`;
        });
        const tot = SUM(buy) - SUM(sell);
        g += `<rect x="${x0 + 46}" y="${RY(5) + 24}" width="200" height="32" rx="6" class="${tot > 0 ? "f-buy" : "f-sell"}"/><text x="${x0 + 146}" y="${RY(5) + 45}" text-anchor="middle" class="t-w t-b">總 Delta ${sg(tot)}</text>`;
        g += `<text x="${x0 + 146}" y="${RY(5) + 78}" text-anchor="middle" class="${cls} t-b">${note}</text></g>`;
        return g;
      };
      s += mini(20, SELL, BUY, 1, "K 棒 A", "主動買推上去", "t-buy") + mini(340, R.s, R.b, seg(t, 0.3, 0.8), "K 棒 B（外觀一樣）", "主動賣比較多，價格卻漲？", "t-sell");
      s += `<line x1="320" x2="320" y1="24" y2="330" class="s-line"/>`;
    }
    svg.innerHTML = s;
  }

  /* ---------- 模擬器 ---------- */
  function simMount(box) {
    let ask, bid, sell, buy, tape, msg, ohlc, done;
    const reset = () => { ask = Object.assign({}, ASK0); bid = Object.assign({}, BID0); sell = Z(); buy = Z(); tape = []; ohlc = null; done = {}; msg = "按下面的按鈕下市價單。每按一次，看數字記到哪一格。"; paint(); };
    function trade(side, n) {
      let left = n; const fills = [];
      while (left > 0) {
        const book = side === "buy" ? ask : bid;
        const keys = Object.keys(book).filter((k) => book[k] > 0).sort((a, b) => (side === "buy" ? a - b : b - a));
        if (!keys.length) break;
        const k = keys[0], q = Math.min(left, book[k]);
        book[k] -= q; left -= q; fills.push([k, q]);
        const r = PX.indexOf(+k);
        if (side === "buy") buy[r] += q; else sell[r] += q;
        const p = +k; ohlc = ohlc ? { o: ohlc.o, h: Math.max(ohlc.h, p), l: Math.min(ohlc.l, p), c: p } : { o: p, h: p, l: p, c: p };
        tape.unshift({ side, p, q });
      }
      tape = tape.slice(0, 6);
      if (!fills.length) msg = side === "buy" ? "上面已經沒有賣單可以吃了。按「重設」再試一次。" : "下面已經沒有買單可以打了。按「重設」再試一次。";
      else msg = `${side === "buy" ? "市價買" : "市價賣"} ${n} 口：` + fills.map(([k, q]) => `在 ${k} 成交 ${q} 口`).join("，") + `，記在${side === "buy" ? "右邊（主動買）" : "左邊（主動賣）"}。` + (left > 0 ? `還有 ${left} 口沒成交（掛單被吃光了）。` : "") + (fills.length > 1 ? "一檔的掛單不夠，就會往下一個價格吃，價格因此跳動。" : "");
      paint();
    }
    function candle() {
      if (!ohlc) return `<svg viewBox="0 0 60 220" class="fpx sim-c" aria-hidden="true"><text x="30" y="110" text-anchor="middle" class="t-mute">K 棒</text><text x="30" y="128" text-anchor="middle" class="t-mute">會在這裡</text><text x="30" y="146" text-anchor="middle" class="t-mute">長出來</text></svg>`;
      const Y = (p) => 22 + ((101.25 - p) / 1.25) * 176, up = ohlc.c >= ohlc.o;
      return `<svg viewBox="0 0 60 220" class="fpx sim-c" role="img" aria-label="目前的 K 棒"><line x1="30" x2="30" y1="${Y(ohlc.h)}" y2="${Y(ohlc.l)}" class="${up ? "s-buy" : "s-sell"}" stroke-width="2.5"/><rect x="20" width="20" y="${Y(Math.max(ohlc.o, ohlc.c))}" height="${Math.max(3, Math.abs(Y(ohlc.o) - Y(ohlc.c)))}" rx="3" class="${up ? "f-buy" : "f-sell"}"/></svg>`;
    }
    function paint() {
      const last = tape.length ? tape[0].p : null, tot = SUM(buy) - SUM(sell);
      if (buy[2] >= 10) done.a = true;
      if (tape.length && tot < 0) done.b = true;
      if (last === 101.25) done.c = true;
      box.innerHTML = `
<div class="sim-grid">
  <div class="sim-cw">${candle()}</div>
  <table class="fp sim-fp" aria-label="你的 Footprint"><thead><tr><td>主動賣</td><td>價格</td><td>主動買</td><td>Delta</td></tr></thead><tbody>
  ${PX.map((p, r) => { const d = buy[r] - sell[r]; return `<tr class="${last === p ? "last" : ""}"><td class="b${sell[r] ? " hot" : ""}">${sell[r] || ""}</td><td class="px">${last === p ? "▶ " : ""}${f2(p)}</td><td class="a${buy[r] ? " hot" : ""}">${buy[r] || ""}</td><td class="dl ${d > 0 ? "pos" : d < 0 ? "neg" : ""}">${sell[r] || buy[r] ? sg(d) : ""}</td></tr>`; }).join("")}
  <tr class="tot"><td>${SUM(sell)}</td><td class="px">合計</td><td>${SUM(buy)}</td><td class="dl ${tot > 0 ? "pos" : tot < 0 ? "neg" : ""}">${tape.length ? sg(tot) : ""}</td></tr></tbody></table>
  <table class="fp sim-bk" aria-label="掛單簿"><thead><tr><td>買單在等</td><td>價格</td><td>賣單在等</td></tr></thead><tbody>
  ${PX.map((p) => { const k = f2(p); return `<tr><td class="bq">${bid[k] != null ? bid[k] : ""}</td><td class="px">${k}</td><td class="aq">${ask[k] != null ? ask[k] : ""}</td></tr>`; }).join("")}</tbody></table>
</div>
<p class="sim-msg" aria-live="polite">${msg}</p>
<div class="btn-row"><button class="btn primary" data-s="buy" data-n="1" type="button">市價買 1 口</button><button class="btn primary" data-s="buy" data-n="5" type="button">市價買 5 口</button><button class="btn sell" data-s="sell" data-n="1" type="button">市價賣 1 口</button><button class="btn sell" data-s="sell" data-n="5" type="button">市價賣 5 口</button><button class="btn" data-r="1" type="button">重設</button></div>
<ul class="sim-task">
  <li class="${done.a ? "ok" : ""}">${done.a ? "✓" : "○"} 任務 1：讓 100.75 的主動買累積到 10 口以上</li>
  <li class="${done.b ? "ok" : ""}">${done.b ? "✓" : "○"} 任務 2：讓總 Delta 變成負數</li>
  <li class="${done.c ? "ok" : ""}">${done.c ? "✓" : "○"} 任務 3：把最新成交價推到 101.25（想想要吃掉多少賣單）</li>
</ul>${tape.length ? `<p class="small">最近成交：${tape.map((x) => `<span class="${x.side === "buy" ? "tb" : "ts"}">${x.side === "buy" ? "買" : "賣"} ${x.q} @${f2(x.p)}</span>`).join("　")}</p>` : ""}`;
    }
    box.addEventListener("click", (e) => { const b = e.target.closest("button"); if (!b) return; if (b.dataset.r) reset(); else trade(b.dataset.s, +b.dataset.n); });
    reset();
  }

  /* ---------- 看圖判斷題（答錯會說明，並可重播對應步驟） ---------- */
  const fpTable = (rows, cap) => `<table class="fp q-fp" aria-label="${cap}"><thead><tr><td>主動賣</td><td>價格</td><td>主動買</td></tr></thead><tbody>${rows.map((r) => `<tr><td class="b hot">${r[1]}</td><td class="px">${r[0]}</td><td class="a hot">${r[2]}</td></tr>`).join("")}</tbody></table>`;
  const QS = [
    { fig: fpTable([["50.50", 4, 2], ["50.25", 5, 12], ["50.00", 9, 6], ["49.75", 7, 3]], "題目一的 Footprint"),
      q: "上面這根 K 棒裡，哪一個價格的<b>主動買</b>最多？", step: 4, o: [
      ["50.50", false, "50.50 右邊只有 2 口。主動買看的是<b>右邊</b>那一欄，找最大的數字。"],
      ["50.25", true, "右邊那欄最大的是 50.25 的 12 口，這裡主動買最多。"],
      ["50.00", false, "50.00 的 9 是<b>左邊</b>（主動賣）。左右別看反了：右邊才是主動買。"]] },
    { fig: fpTable([["20.75", 4, 11]], "題目二的一列 Footprint"),
      q: "這一列的 Delta 是多少？", step: 9, o: [
      ["+7", true, "Delta＝右 − 左＝11 − 4＝+7，主動買多 7 口。"],
      ["−7", false, "順序反了。Delta 是<b>右減左</b>（主動買 − 主動賣），所以是 11 − 4。"],
      ["15", false, "15 是兩邊加起來，那是這個價格的<b>總成交量</b>，不是 Delta。"]] },
    { fig: `<p class="small q-cap">一根上漲 K 棒，收盤比開盤高，但總 Delta 是 <b>−9</b>。</p>`,
      q: "下面哪一個說法最合理？", step: 11, o: [
      ["Delta 是負的，下一根一定會跌", false, "Footprint 描述的是<b>已經發生</b>的成交，不能保證下一根怎麼走。要配合位置一起看（後面的關卡會教）。"],
      ["主動賣比較多，但價格還是漲，可能有人用限價買單在下面接", true, "價格漲、Delta 卻是負的，代表主動賣方一直在賣，卻推不動價格，下面有限價買單吸收。"],
      ["資料一定錯了，上漲 K 棒的 Delta 不可能是負的", false, "完全可能。上漲靠的不只是主動買，也可能是主動賣被限價買單接住、價格慢慢墊高。這正是 Footprint 比 K 棒多出來的資訊。"]] }
  ];

  const MIST = [
    { bad: "左右兩欄是「掛著的買單和賣單」", good: "左右兩欄都是<b>已經成交</b>的口數，分的是誰主動：左＝用市價單賣、右＝用市價單買。掛著還沒成交的單在掛單簿，不在 Footprint。" },
    { bad: "Delta 是正的，價格就一定會漲", good: "Delta 只說誰比較急。急不代表推得動：步驟 11 的 K 棒 B 就是主動賣多、價格照漲。要配合價格和位置一起看。" },
    { bad: "看到某一格數字很大，就是大戶進場", good: "先跟同一列另一邊比，再跟上下幾列比。單一格大可能只是那個價格停留比較久，成交自然比較多。" }
  ];
  const FAQ = [
    ["每一筆成交都有一個買方和一個賣方，怎麼會「買比較多」？", "對，每筆成交的買賣口數一定相等。Footprint 分的不是「有沒有人買」，而是「誰比較急」：用市價單的那一方是主動方。所以說「主動買比較多」，意思是急著買的人比急著賣的人多。"],
    ["為什麼主動買放右邊、主動賣放左邊？", "這是大多數軟體的慣例：賣單排在 Ask（右），市價買單去右邊吃 Ask，所以記在右邊；市價賣單去左邊打 Bid，記在左邊。少數軟體可以換邊，看之前先確認欄位標題。"],
    ["格子裡的數字是筆數還是口數？", "口數（合約數）。一筆市價單買 5 口，就記 5，不是記 1。"],
    ["真實的數字也這麼小嗎？", "不是。NQ 熱門時段一格常有幾十到幾百口。這一關刻意用 1–20 口，是為了讓你一眼看懂；換成大數字，讀法完全一樣。"],
    ["Footprint 能告訴我下一根會漲還是跌嗎？", "不能。它描述的是已經發生的成交。它的用處是在你本來就關注的價位（例如前高、價值區邊緣），幫你判斷那裡是誰在主導。"],
    ["Delta 和成交量差在哪裡？", "成交量＝左 + 右（這個價格總共成交幾口）；Delta＝右 − 左（主動買比主動賣多幾口）。成交量大、Delta 接近 0，代表雙方都很積極、勢均力敵。"],
    ["要用什麼軟體才看得到 Footprint？", "需要有逐筆成交資料的看盤軟體，例如 NinjaTrader、ATAS、Sierra Chart。TradingView 也有 Footprint 功能，但有方案與資料精細度的限制。"]
  ];
  const GLOSS = [
    ["市價單", "不指定價格、馬上成交的單。用市價單的人是「主動方」。"],
    ["限價單", "指定價格、掛著排隊等人成交的單。是「被動方」。"],
    ["掛單簿", "所有排隊中的限價單列表。買單在一邊、賣單在另一邊。"],
    ["主動買", "用市價單買進的口數，記在 Footprint 右邊。"],
    ["主動賣", "用市價單賣出的口數，記在 Footprint 左邊。"],
    ["Footprint", "把一根 K 棒拆開，顯示每個價格主動買、主動賣各幾口的圖。"],
    ["Delta", "右 − 左，也就是主動買減主動賣。正＝買方急，負＝賣方急。"],
    ["總 Delta", "整根 K 棒每一列 Delta 的加總。"],
    ["口", "期貨的交易單位，一口＝一張合約。"]
  ];

  PAGES["of-2"] = window.KIT.page(window.COURSE.OFC, "of-2", {
    topic: " Footprint",
    lede: "K 棒只告訴你價格走到哪裡。Footprint 把一根 K 棒拆開，告訴你每個價格上，急著買和急著賣的人各有多少。這一關用 12 步動畫從零開始拆給你看。",
    analogyTitle: "先想像一個菜市場",
    analogy: [
      ["攤販掛價等客人", "西瓜一顆 100 元，擺著等人來買。這就是<b>限價單</b>：開好價錢，排隊等。"],
      ["趕時間的客人", "不殺價，直接照標價買走。這就是<b>市價單</b>：我現在就要。主動的人是他。"],
      ["老闆的記帳本", "每個價錢記兩欄：客人急著買的記右邊，客人急著賣給老闆的記左邊。這本帳就是 <b>Footprint</b>。"]],
    steps: STEPS, draw, sumIdx: 11,
    simIntro: "自己下市價單，看成交記到哪一格、K 棒怎麼長出來、價格為什麼會跳。",
    simMount,
    mist: MIST.map((m) => [m.bad, m.good]), faq: FAQ, qs: QS, gloss: GLOSS,
    remember: "Footprint 是每個價格的記帳本：<b>左邊記主動賣、右邊記主動買</b>，右減左就是 Delta。"
  });
})();
