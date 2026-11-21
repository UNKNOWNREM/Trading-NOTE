/* 路線 1 第 1 關（新）：期貨合約與下單 */
(function () {
  const PAGES = (window.__PAGES = window.__PAGES || {});
  const { chip, badge, lerp, ease, seg } = window.KIT;
  const money = (v, d = 0) => (v < 0 ? "−$" : "$") + Math.abs(v).toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });
  const SPEC = { NQ: { pt: 20, tick: 5, name: "NQ（標準）" }, MNQ: { pt: 2, tick: 0.5, name: "MNQ（微型）" } };

  // 價格梯子：lo..hi 映射到 y0..y1
  const ladder = (lo, hi, y0 = 330, y1 = 50) => (p) => lerp(y0, y1, (p - lo) / (hi - lo));
  function card(x, y, w, h, title, lines, cls = "g-cell", op = 1) {
    return `<g opacity="${op}"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="12" class="${cls}"/><text x="${x + 16}" y="${y + 28}" class="t-ink t-b t-lg">${title}</text>${lines.map((l, k) => `<text x="${x + 16}" y="${y + 56 + k * 24}" class="${l[1] || "t-ink"}">${l[0]}</text>`).join("")}</g>`;
  }
  function priceAxis(Y, prices, x = 70, op = 1) {
    return `<g opacity="${op}">${prices.map((p) => `<line x1="${x + 8}" x2="600" y1="${Y(p)}" y2="${Y(p)}" class="s-line"/><text x="${x}" y="${Y(p) + 4}" text-anchor="end" class="t-mute">${p.toLocaleString("en-US", { minimumFractionDigits: 2 })}</text>`).join("")}</g>`;
  }
  function hline(Y, p, label, cls, x0 = 90, x1 = 600, op = 1, dash = false) {
    return `<g opacity="${op}"><line x1="${x0}" x2="${x1}" y1="${Y(p)}" y2="${Y(p)}" class="${cls}" stroke-width="2.5" ${dash ? 'stroke-dasharray="6 4"' : ""}/><text x="${x1 - 4}" y="${Y(p) - 7}" text-anchor="end" class="${cls.replace("s-", "t-")} t-b">${label}</text></g>`;
  }

  const STEPS = [
    { cap: "期貨是一份<b>約定買賣的合約</b>。NQ 是那斯達克 100 指數的期貨：價格每 1 點，一口合約就值 <b>$20</b>。",
      why: "期貨原本是「約好未來用今天的價格買賣」。做當沖的人不會等到交割，而是在合約上賺價格的差。所以最重要的是記住：一點值多少錢。NQ 價格 27,000 點時，一口合約代表 27,000 × $20 ＝ $540,000 的指數部位。",
      stuck: "把一口 NQ 想成「綁著指數的籌碼」：指數動 1 點，籌碼價值就動 $20。" },
    { cap: "價格不是連續滑動，而是<b>一格一格跳</b>。NQ 最小一格叫 1 個 tick ＝ 0.25 點 ＝ <b>$5</b>。4 個 tick 才是 1 點。",
      why: "交易所規定最小的價格單位。NQ 是 0.25 點，所以報價只會出現 .00、.25、.50、.75。算損益時，用 tick 或用點都可以：1 tick ＝ $5，1 點 ＝ 4 tick ＝ $20。" },
    { cap: "新手更常用的是 <b>MNQ 微型合約</b>：和 NQ 一模一樣的價格，但大小只有 <b>十分之一</b>，每點 $2、每 tick $0.50。",
      why: "MNQ 和 NQ 看的是同一個指數、同一個價格，差別只在一口的大小。用 MNQ 練習，同樣的錯誤只會虧十分之一，是新手最常建議的起點。" },
    { cap: "練習一下：你做多 1 口 NQ，價格從 27,000 漲到 27,010。",
      q: { t: "這筆交易賺多少錢（先不算手續費）？", o: [
        ["$10", false, "10 是點數，不是錢。還要乘上每點價值：10 點 × $20。"],
        ["$200", true, "10 點 × 每點 $20 × 1 口 ＝ $200。賺賠公式：點數 × 每點價值 × 口數。"],
        ["$20", false, "$20 是漲 1 點的價值。這裡漲了 10 點，所以是 10 × $20。"]] } },
    { cap: "買一口合約<b>不用付全額</b>，只要先放一筆押金在帳戶裡，叫<b>保證金</b>。它只佔合約價值的一小部分。",
      why: "保證金像租車時押的押金，不是車子的價格。保證金的金額由交易所訂、券商可以再加，而且會隨市場波動調整，實際數字要看你券商的公告。因為只押一小部分，就能控制很大的部位，這叫槓桿。",
      stuck: "租車押金 1 萬元，卻開著 100 萬的車。車子撞壞的損失，可能比押金大得多。" },
    { cap: "槓桿是雙面刃：NQ 只要動 <b>1%</b>（約 270 點），一口 NQ 就賺或賠 <b>$5,400</b>；MNQ 是 $540。",
      why: "270 點 × $20 ＝ $5,400。實際紀錄裡（2026 年 11 月），NQ 一天的振幅常在 2%～5% 之間，也就是一天可能有一萬美元以上的上下波動。虧損可能超過保證金，這就是為什麼一定要先設停損。", dur: 2000 },
    { cap: "期貨有到期日。NQ 每季一個月份：3、6、9、12 月，各用一個字母代表：<b>H、M、U、Z</b>。快到期時，大家會換到下一個月份，叫<b>換月</b>。",
      why: "合約在到期月的第三個星期五到期。到期前大約一週多，成交量會從舊月份移到新月份，這時候看盤和下單都要換成新的合約代號。例如 2026 年 12 月的合約寫成 NQZ26（或 NQZ2026），下一個是 NQH27。看盤軟體通常也有「連續合約」可以用。", dur: 2000 },
    { cap: "下單有三種基本單。<b>市價單</b>：馬上成交。<b>限價單</b>：指定價格排隊等。<b>停損單</b>：平常不動，價格碰到才觸發。",
      why: "市價單一定成交，但價格不保證；限價單價格有保障，但不一定成交；停損單是「保險」，價格走到你設定的位置才會自動送出，通常用來出場止損。", stuckHref: "#of-1", stuckLabel: "下一關會用掛單簿詳細教市價單和限價單 →", stuck: "市價單＝現在就要；限價單＝這個價才要；停損單＝跌到這裡就幫我出場。", dur: 2200 },
    { cap: "停損單怎麼運作：價格跌到 26,980，停損單被<b>觸發</b>，變成一張市價賣單，用當下能成交的價格出場。",
      why: "觸發後它就是市價單，會吃當時掛單簿上的買單。如果剛好急跌、買單很少，成交價可能比停損價再差一點，這叫<b>滑價</b>。這裡在 26,979.75 成交，比設定差了 1 個 tick。", dur: 2600 },
    { cap: "練習一下：你做多在 27,000，想要「如果跌破 26,980 就自動出場」。",
      q: { t: "應該用哪一種單？", o: [
        ["限價賣單掛在 26,980", false, "限價賣單掛在比現價低的地方，會被當成「願意用 26,980 以上賣」，通常馬上就成交了，等於直接出場。要「跌到才觸發」，要用停損單。"],
        ["停損賣單設在 26,980", true, "停損單平常不動，價格碰到 26,980 才觸發成市價賣單，正好符合「跌破就出場」。"],
        ["市價賣單", false, "市價單會立刻成交，你現在就出場了，不是等跌破才出場。"]] } },
    { cap: "<b>括號單</b>：進場時同時掛好停損和目標。哪一邊先成交，另一邊就<b>自動取消</b>（OCO：一個成交、另一個取消）。",
      why: "這樣不用盯盤也有保護：價格走到目標就獲利出場，走到停損就認賠出場，不會兩邊都成交。大部分期貨平台（例如 NinjaTrader 的 ATM 策略）都有這個功能。", dur: 2600 },
    { cap: "整理：一筆交易的賺賠＝<b>點數 × 每點價值 × 口數 − 手續費</b>。下單前先算好最多會虧多少。",
      why: "例：做多 2 口 MNQ，進場 27,000、停損 26,980、目標 27,040。最多虧 20 點 × $2 × 2 口 ＝ $80；目標賺 40 點 × $2 × 2 口 ＝ $160。報酬是風險的 2 倍（風報比 1:2）。實際還要扣手續費，金額看券商。" }
  ];

  function draw(svg, i, t) {
    const e = ease(t); let s = "";
    if (i === 0) {
      s += card(40, 70, 230, 150, "一口 NQ 合約", [["綁著那斯達克 100 指數", "t-mute"], ["指數每動 1 點", "t-ink"], ["一口就值 $20", "t-buy t-b"]]);
      s += `<g opacity="${seg(t, 0.3, 1)}"><text x="320" y="120" class="t-mute">如果價格是</text><text x="320" y="156" class="t-ink t-b t-xl">27,000 點 × $20</text><text x="320" y="200" class="t-mute">＝ 一口合約代表</text><text x="320" y="238" class="t-buy t-b t-xl">$540,000</text></g>`;
      s += `<text x="40" y="300" class="t-mute" opacity="${seg(t, 0.7, 1)}">做當沖的人不等交割，只賺「價格的差」。</text>`;
    } else if (i === 1) {
      const Y = ladder(26999.75, 27001.25, 330, 60);
      const ps = [27000, 27000.25, 27000.5, 27000.75, 27001];
      s += priceAxis(Y, ps, 120);
      const k = Math.min(4, Math.floor(e * 4.999));
      for (let j = 0; j < 4; j++) {
        const op = j < k ? 1 : j === k ? seg(t, j / 4, (j + 1) / 4) : 0;
        s += `<g opacity="${op}"><path d="M200 ${Y(ps[j]) - 4} L200 ${Y(ps[j + 1]) + 6}" class="s-buy" stroke-width="3" marker-end="url(#ar)"/><text x="214" y="${(Y(ps[j]) + Y(ps[j + 1])) / 2 + 4}" class="t-buy t-b">+1 tick ＝ +$5</text></g>`;
      }
      s += `<defs><marker id="ar" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" class="f-buy"/></marker></defs>`;
      s += `<g opacity="${seg(t, 0.85, 1)}"><path d="M380 ${Y(27000)} L380 ${Y(27001)}" class="s-ink" stroke-width="2"/><text x="396" y="${(Y(27000) + Y(27001)) / 2 - 6}" class="t-ink t-b t-lg">4 tick ＝ 1 點</text><text x="396" y="${(Y(27000) + Y(27001)) / 2 + 18}" class="t-ink t-b t-lg">＝ $20</text></g>`;
    } else if (i === 2) {
      s += card(40, 60, 260, 170, "NQ（標準）", [["每 1 點　$20", "t-ink t-b"], ["每 1 tick　$5", "t-ink"], ["1% 波動　約 $5,400", "t-mute"], ["", ""]]);
      s += card(340, 60, 260, 170, "MNQ（微型）", [["每 1 點　$2", "t-ink t-b"], ["每 1 tick　$0.50", "t-ink"], ["1% 波動　約 $540", "t-mute"]], "f-gamma-soft", seg(t, 0.2, 0.6));
      const h = 90 * seg(t, 0.4, 1);
      s += `<rect x="120" y="${340 - h}" width="100" height="${h}" rx="6" class="f-buy"/><rect x="420" y="${340 - h / 10}" width="100" height="${h / 10}" rx="3" class="f-buy"/>`;
      s += `<text x="170" y="${334 - h}" text-anchor="middle" class="t-ink t-b" opacity="${seg(t, 0.8, 1)}">10 份</text><text x="470" y="${330 - h / 10}" text-anchor="middle" class="t-ink t-b" opacity="${seg(t, 0.8, 1)}">1 份</text>`;
    } else if (i === 3) {
      const Y = ladder(26995, 27015, 320, 70);
      s += priceAxis(Y, [26995, 27000, 27005, 27010, 27015], 90);
      const p = lerp(27000, 27010, e);
      s += `<line x1="110" x2="${lerp(110, 560, e)}" y1="${Y(27000)}" y2="${Y(p)}" class="s-buy" stroke-width="3"/><circle cx="${lerp(110, 560, e)}" cy="${Y(p)}" r="6" class="f-buy"/>`;
      s += chip(160, Y(27000) + 26, "做多 1 口 NQ @27,000", "buy");
      s += `<g opacity="${seg(t, 0.7, 1)}"><text x="430" y="${Y(27010) - 18}" class="t-ink t-b t-lg">+10 點</text><text x="430" y="${Y(27010) + 30}" class="t-mute t-lg">賺多少錢？</text></g>`;
    } else if (i === 4) {
      const w = 520 * seg(t, 0, 0.5);
      s += `<text x="50" y="96" class="t-ink t-b">合約價值（27,000 × $20）</text><rect x="50" y="108" width="${w}" height="44" rx="8" class="f-buy-soft"/><text x="${50 + w - 10}" y="137" text-anchor="end" class="t-buy t-b t-lg" opacity="${seg(t, 0.4, 0.6)}">$540,000</text>`;
      s += `<g opacity="${seg(t, 0.5, 0.9)}"><text x="50" y="206" class="t-ink t-b">你要放的保證金（押金）</text><rect x="50" y="218" width="44" height="44" rx="8" class="f-buy"/><text x="108" y="247" class="t-ink">只佔一小部分，金額看券商公告，會隨市場調整</text></g>`;
      s += `<text x="50" y="320" class="t-mute" opacity="${seg(t, 0.85, 1)}">用小錢控制大部位＝槓桿。賺賠都按整口合約計算，不是按押金。</text>`;
    } else if (i === 5) {
      const h = 220 * seg(t, 0.1, 0.8);
      s += `<line x1="60" x2="600" y1="320" y2="320" class="s-line"/>`;
      s += `<rect x="130" y="${320 - h}" width="120" height="${h}" rx="8" class="f-sell"/><text x="190" y="${310 - h}" text-anchor="middle" class="t-sell t-b t-lg" opacity="${seg(t, 0.6, 1)}">$5,400</text><text x="190" y="344" text-anchor="middle" class="t-ink t-b">1 口 NQ</text>`;
      s += `<rect x="390" y="${320 - h / 10}" width="120" height="${h / 10}" rx="4" class="f-sell"/><text x="450" y="${310 - h / 10}" text-anchor="middle" class="t-sell t-b t-lg" opacity="${seg(t, 0.6, 1)}">$540</text><text x="450" y="344" text-anchor="middle" class="t-ink t-b">1 口 MNQ</text>`;
      s += `<text x="60" y="50" class="t-ink t-b">價格只動 1%（約 270 點）時的賺賠</text><text x="60" y="74" class="t-mute" opacity="${seg(t, 0.8, 1)}">實際紀錄：NQ 一天振幅常在 2%～5%</text>`;
    } else if (i === 6) {
      const M = [["3 月", "H"], ["6 月", "M"], ["9 月", "U"], ["12 月", "Z"], ["隔年 3 月", "H"]];
      s += `<line x1="60" x2="600" y1="190" y2="190" class="s-ink" stroke-width="2"/>`;
      M.forEach((m, k) => {
        const x = 80 + k * 125, op = seg(t, k * 0.12, k * 0.12 + 0.2);
        s += `<g opacity="${op}"><circle cx="${x}" cy="190" r="8" class="${k === 3 ? "f-buy" : "f-inkd"}"/><text x="${x}" y="160" text-anchor="middle" class="t-ink t-b t-xl">${m[1]}</text><text x="${x}" y="222" text-anchor="middle" class="t-mute">${m[0]}</text></g>`;
      });
      s += `<g opacity="${seg(t, 0.6, 1)}"><text x="455" y="256" text-anchor="middle" class="t-buy t-b">NQZ26</text><text x="455" y="276" text-anchor="middle" class="t-mute">12/18 到期</text><path d="M470 300 Q520 330 570 300" class="s-gamma" stroke-width="2.5" fill="none"/><text x="520" y="350" text-anchor="middle" class="t-gamma t-b">到期前約一週多換月 → NQH27</text></g>`;
      s += `<text x="60" y="70" class="t-mute">每季一個月份，各用一個字母</text>`;
    } else if (i === 7 || i === 9) {
      const Y = ladder(26970, 27010, 330, 60);
      s += priceAxis(Y, [26970, 26980, 26990, 27000, 27010], 90);
      s += `<line x1="100" x2="600" y1="${Y(27000)}" y2="${Y(27000)}" class="s-ink" stroke-width="2"/><text x="110" y="${Y(27000) - 8}" class="t-ink t-b">現在價格 27,000</text>`;
      if (i === 7) {
        s += `<g opacity="${seg(t, 0.05, 0.3)}">${chip(330, Y(27000), "市價買：馬上成交", "buy")}</g>`;
        s += `<g opacity="${seg(t, 0.35, 0.6)}"><line x1="250" x2="600" y1="${Y(26990)}" y2="${Y(26990)}" class="s-buy" stroke-width="2" stroke-dasharray="6 4"/>${chip(460, Y(26990), "限價買 26,990：排隊等", "buy")}</g>`;
        s += `<g opacity="${seg(t, 0.65, 0.9)}"><line x1="250" x2="600" y1="${Y(26980)}" y2="${Y(26980)}" class="s-sell" stroke-width="2" stroke-dasharray="6 4"/>${chip(460, Y(26980), "停損賣 26,980：碰到才觸發", "sell")}</g>`;
      } else {
        s += `<line x1="250" x2="600" y1="${Y(26980)}" y2="${Y(26980)}" class="s-sell" stroke-width="2" stroke-dasharray="6 4"/><text x="596" y="${Y(26980) + 18}" text-anchor="end" class="t-sell t-b">跌破就出場？</text>`;
        s += chip(200, Y(27000) + 26, "多單 @27,000", "buy");
      }
    } else if (i === 8) {
      const Y = ladder(26970, 27010, 330, 60);
      s += priceAxis(Y, [26970, 26980, 26990, 27000, 27010], 90);
      s += `<line x1="100" x2="600" y1="${Y(26980)}" y2="${Y(26980)}" class="s-sell" stroke-width="2" stroke-dasharray="6 4"/><text x="596" y="${Y(26980) - 8}" text-anchor="end" class="t-sell t-b">停損 26,980</text>`;
      const pts = [[110, 27000], [200, 26996], [270, 26992], [330, 26988], [390, 26984], [440, 26980]];
      const n = Math.max(1, Math.min(pts.length, Math.ceil(seg(t, 0, 0.55) * pts.length)));
      s += `<polyline points="${pts.slice(0, n).map((q) => `${q[0]},${Y(q[1])}`).join(" ")}" class="s-ink f-none" stroke-width="2.5"/>`;
      if (t > 0.55) {
        s += `<circle cx="440" cy="${Y(26980)}" r="9" class="f-sell" opacity="${seg(t, 0.55, 0.65)}"/>`;
        s += `<g opacity="${seg(t, 0.6, 0.75)}">${chip(440, Y(26980) - 40, "觸發 → 變成市價賣單", "sell")}</g>`;
        s += `<g opacity="${seg(t, 0.8, 1)}"><circle cx="470" cy="${Y(26979.75)}" r="6" class="f-sell"/><text x="486" y="${Y(26979.75) + 30}" class="t-ink t-b">在 26,979.75 成交</text><text x="486" y="${Y(26979.75) + 52}" class="t-mute">比設定差 1 tick＝滑價</text></g>`;
      }
    } else if (i === 10) {
      const Y = ladder(26970, 27050, 330, 50);
      s += priceAxis(Y, [26970, 26990, 27010, 27030, 27050], 90);
      const tgtHit = t > 0.75;
      s += hline(Y, 27040, "目標 27,040（限價賣）", "s-buy", 100, 600, 1, true);
      s += hline(Y, 26980, tgtHit ? "停損：自動取消" : "停損 26,980（停損賣）", "s-sell", 100, 600, tgtHit ? 0.3 : 1, true);
      s += `<line x1="100" x2="600" y1="${Y(27000)}" y2="${Y(27000)}" class="s-ink"/><text x="110" y="${Y(27000) - 8}" class="t-ink t-b">進場 27,000</text>`;
      const pts = [[120, 27000], [200, 26992], [260, 27006], [330, 27014], [390, 27010], [450, 27026], [520, 27040]];
      const n = Math.max(1, Math.min(pts.length, Math.ceil(seg(t, 0, 0.75) * pts.length)));
      s += `<polyline points="${pts.slice(0, n).map((q) => `${q[0]},${Y(q[1])}`).join(" ")}" class="s-ink f-none" stroke-width="2.5"/>`;
      if (tgtHit) s += `<circle cx="520" cy="${Y(27040)}" r="8" class="f-buy"/>` + chip(430, Y(27040) + 34, "目標成交，獲利出場", "buy", seg(t, 0.78, 0.9));
    } else if (i === 11) {
      const Y = ladder(26970, 27050, 330, 50);
      s += priceAxis(Y, [26970, 26990, 27010, 27030, 27050], 90);
      s += `<rect x="100" y="${Y(27040)}" width="220" height="${Y(27000) - Y(27040)}" class="f-buy-soft"/><rect x="100" y="${Y(27000)}" width="220" height="${Y(26980) - Y(27000)}" class="f-sell-soft"/>`;
      s += hline(Y, 27040, "目標 27,040", "s-buy", 100, 320) + hline(Y, 26980, "停損 26,980", "s-sell", 100, 320);
      s += `<line x1="100" x2="320" y1="${Y(27000)}" y2="${Y(27000)}" class="s-ink" stroke-width="2"/><text x="108" y="${Y(27000) - 8}" class="t-ink t-b">做多 2 口 MNQ @27,000</text>`;
      const rows = [["最多虧", "20 點 × $2 × 2 口 ＝ $80", "t-sell"], ["目標賺", "40 點 × $2 × 2 口 ＝ $160", "t-buy"], ["風報比", "1 : 2", "t-ink"]];
      rows.forEach((r, k) => { s += `<g opacity="${seg(t, k * 0.2, k * 0.2 + 0.3)}"><text x="350" y="${110 + k * 50}" class="t-mute">${r[0]}</text><text x="350" y="${132 + k * 50}" class="${r[2]} t-b t-lg">${r[1]}</text></g>`; });
      s += `<g opacity="${seg(t, 0.6, 1)}"><rect x="340" y="268" width="270" height="62" rx="10" class="f-gamma-soft"/><text x="356" y="294" class="t-ink t-b">賺賠 ＝ 點數 × 每點價值 × 口數</text><text x="356" y="316" class="t-ink t-b">　　　 − 手續費</text></g>`;
    }
    svg.innerHTML = s;
  }

  /* ---------- 你來操作：下單前試算 ---------- */
  const simHTML = `
<div class="calc">
  <div class="calc-in">
    <label>合約 <select class="c-k"><option value="MNQ">MNQ 微型（每點 $2）</option><option value="NQ">NQ 標準（每點 $20）</option></select></label>
    <label>方向 <select class="c-dir"><option value="1">做多（先買後賣）</option><option value="-1">做空（先賣後買）</option></select></label>
    <label>口數 <b class="c-q-v"></b><input type="range" class="c-q" min="1" max="10" value="2"></label>
    <label>停損距離（點）<b class="c-sl-v"></b><input type="range" class="c-sl" min="5" max="100" step="5" value="20"></label>
    <label>目標距離（點）<b class="c-tp-v"></b><input type="range" class="c-tp" min="5" max="200" step="5" value="40"></label>
    <label>來回手續費（每口，美元）<input type="number" class="c-fee" min="0" step="0.1" value="0"></label>
    <p class="small">手續費依券商不同，自行填入；預設 0。進場價固定用 27,000 方便看。</p>
  </div>
  <div class="calc-out"><svg class="fpx c-svg" viewBox="0 0 300 300" role="img" aria-label="停損與目標示意"></svg><div class="c-res"></div></div>
</div>
<ul class="sim-task c-task"></ul>`;
  function simMount(box) {
    const q = (s) => box.querySelector(s);
    const ins = ["c-k", "c-dir", "c-q", "c-sl", "c-tp", "c-fee"].map((c) => q("." + c));
    const done = {};
    function paint() {
      const k = q(".c-k").value, dir = +q(".c-dir").value, n = +q(".c-q").value, sl = +q(".c-sl").value, tp = +q(".c-tp").value, fee = Math.max(0, +q(".c-fee").value || 0);
      q(".c-q-v").textContent = n + " 口"; q(".c-sl-v").textContent = sl + " 點"; q(".c-tp-v").textContent = tp + " 點";
      const pt = SPEC[k].pt, risk = sl * pt * n + fee * n, rew = tp * pt * n - fee * n, rr = rew / risk;
      const entry = 27000, slP = entry - dir * sl, tpP = entry + dir * tp;
      q(".c-res").innerHTML = `<p><span class="t1">最多虧</span><b class="neg">${money(-risk, fee ? 2 : 0)}</b><span class="small">${sl} 點 × $${pt} × ${n} 口${fee ? ` ＋ 手續費 $${(fee * n).toFixed(2)}` : ""}</span></p>
        <p><span class="t1">目標賺</span><b class="pos">${money(rew, fee ? 2 : 0)}</b><span class="small">${tp} 點 × $${pt} × ${n} 口${fee ? ` − 手續費 $${(fee * n).toFixed(2)}` : ""}</span></p>
        <p><span class="t1">風報比</span><b>1 : ${rr > 0 ? rr.toFixed(1) : "—"}</b>${rr < 2 ? `<span class="small warn">低於 1:2，要特別小心</span>` : ""}</p>
        <p><span class="t1">停損單</span>${dir > 0 ? "停損賣" : "停損買"} ${slP.toLocaleString()}　<span class="t1">目標</span>${dir > 0 ? "限價賣" : "限價買"} ${tpP.toLocaleString()}</p>`;
      const span = Math.max(sl, tp) * 1.15, Y = (p) => 150 - ((p - entry) / span) * 125;
      const s = q(".c-svg");
      s.innerHTML = `<rect x="40" y="${Math.min(Y(tpP), Y(entry))}" width="140" height="${Math.abs(Y(tpP) - Y(entry))}" class="f-buy-soft"/><rect x="40" y="${Math.min(Y(slP), Y(entry))}" width="140" height="${Math.abs(Y(slP) - Y(entry))}" class="f-sell-soft"/>
        <line x1="40" x2="260" y1="${Y(entry)}" y2="${Y(entry)}" class="s-ink" stroke-width="2"/><text x="186" y="${Y(entry) + 4}" class="t-ink t-b">進場</text>
        <line x1="40" x2="260" y1="${Y(tpP)}" y2="${Y(tpP)}" class="s-buy" stroke-width="2"/><text x="186" y="${Y(tpP) + (dir > 0 ? -6 : 14)}" class="t-buy t-b">目標</text>
        <line x1="40" x2="260" y1="${Y(slP)}" y2="${Y(slP)}" class="s-sell" stroke-width="2"/><text x="186" y="${Y(slP) + (dir > 0 ? 14 : -6)}" class="t-sell t-b">停損</text>`;
      if (k === "MNQ" && risk <= 50) done.a = true;
      if (dir < 0 && rr >= 2) done.b = true;
      if (k === "NQ" && n === 1 && sl === 20) done.c = true;
      q(".c-task").innerHTML = [["a", "任務 1：用 MNQ 設一筆最多只虧 $50 以內的交易"], ["b", "任務 2：設一筆做空、風報比至少 1:2 的交易，看停損和目標換到哪一邊"], ["c", "任務 3：把合約換成 NQ、1 口、停損 20 點，比較虧損變成幾倍"]]
        .map(([key, txt]) => `<li class="${done[key] ? "ok" : ""}">${done[key] ? "✓" : "○"} ${txt}</li>`).join("");
    }
    ins.forEach((el) => el.addEventListener("input", paint));
    paint();
  }

  const QS = [
    { fig: `<p class="small q-cap">你做空 3 口 MNQ，價格從 27,050 跌到 27,035。</p>`, q: "這筆交易賺還是賠？多少錢（不算手續費）？", step: 4, o: [
      ["賺 $90", true, "做空時價格下跌就是賺。15 點 × $2 × 3 口 ＝ $90。"],
      ["賠 $90", false, "做空是先賣後買回，價格下跌代表你用更低的價格買回，所以是賺。"],
      ["賺 $900", false, "$900 是用 NQ 的每點 $20 算的。MNQ 每點只有 $2。"]] },
    { fig: `<p class="small q-cap">現在價格 27,000。你掛了一張<b>限價買單在 26,990</b>，之後價格一路漲到 27,030，沒有回來。</p>`, q: "這張限價買單的結果是？", step: 8, o: [
      ["在 27,000 成交了", false, "限價買單只會在 26,990 或更低的價格成交。價格沒跌到 26,990，就不會成交。"],
      ["沒有成交，還在排隊", true, "限價單價格有保障、但不保證成交。價格沒回到 26,990，它就一直掛著等。"],
      ["自動改成市價單追上去", false, "限價單不會自己改成市價單。要追價，得自己改單。"]] },
    { fig: `<p class="small q-cap">做多 1 口 NQ，停損單設在 26,980。急跌時停損被觸發，實際在 <b>26,978.50</b> 成交。</p>`, q: "因為滑價，比原本設定多虧了多少錢？", step: 9, o: [
      ["$1.50", false, "1.5 是點數。還要乘上 NQ 每點 $20。"],
      ["$30", true, "滑了 1.5 點（6 個 tick），1.5 × $20 ＝ $30。停損觸發後是市價單，急跌時可能滑得更多。"],
      ["$6", false, "6 是 tick 數。NQ 每 tick $5，6 × $5 ＝ $30。"]] }
  ];

  PAGES["of-fut"] = window.KIT.page(window.COURSE.OFC, "of-fut", {
    topic: "期貨與下單",
    lede: "還沒開始看訂單流之前，先把最基本的事弄清楚：你交易的東西是什麼、價格動一點值多少錢、單要怎麼下。這些不懂，後面算部位大小、放停損都會出錯。",
    analogy: [
      ["米店和農夫的約定", "農夫和米店約好三個月後，用今天講好的價錢買賣一批米。這種「先約好價格」的合約，就是<b>期貨</b>的由來。"],
      ["秤上的刻度", "電子秤一格一格跳，不會出現半格。期貨價格也一樣，最小的一格叫 <b>tick</b>。"],
      ["租車的押金", "押 1 萬元就能開 100 萬的車，但撞壞的損失可能比押金大。這就是<b>保證金</b>和<b>槓桿</b>。"]],
    steps: STEPS, draw, simHTML, simMount,
    simIntro: "下單前先試算：選合約、方向、口數、停損和目標，看最多虧多少、風報比多少。",
    mist: [
      ["NQ 和 MNQ 只是名字不同，賺賠一樣", "價格一樣，但大小差 10 倍：NQ 每點 $20，MNQ 每點 $2。下錯合約，虧損就是 10 倍。"],
      ["保證金就是最多會虧的錢", "保證金只是押金。急跌或跳空時，虧損可能超過保證金，甚至倒欠券商。所以一定要先設停損、控制口數。"],
      ["停損單一定會在停損價成交", "停損單被觸發後會變成市價單，急跌時可能在更差的價格成交（滑價）。停損保護的是「一定會出場」，不是「一定在那個價格出場」。"]],
    faq: [
      ["期貨一定要等到期才能賣嗎？", "不用。隨時都可以反向下單平倉，買進的賣掉、賣出的買回。做當沖的人通常當天就平倉，不會留到隔天。"],
      ["做空是怎麼做到的？我手上沒有東西也能賣？", "期貨是合約，可以先賣後買。先賣一口、之後用更低的價格買回，就是賺價差。做空和做多一樣簡單，只是方向相反。"],
      ["為什麼新手常被建議先用 MNQ？", "MNQ 和 NQ 看的是同一個價格，但每點只有 $2。同樣的錯誤只虧十分之一，可以用比較低的成本練習流程和停損。"],
      ["保證金要準備多少？", "由交易所訂一個基本金額，券商可以再加，而且會隨市場波動調整。實際數字請看你券商的公告，不要用網路上的舊數字。"],
      ["NQ 什麼時間可以交易？", "CME 的電子盤從週日晚上到週五下午，幾乎 23 小時都能交易，每天有一小時休息。換算台灣時間，冬令約早上 6～7 點休息、夏令約 5～6 點。成交量最大的是美股開盤時段（台灣晚上）。"],
      ["換月要做什麼？", "到期前約一週多，把看盤和下單的合約換成下一個月份。手上如果還有部位，通常先平倉再在新月份重新建立。很多看盤軟體有「連續合約」，圖表會自動接起來。"],
      ["手續費大概多少？", "看券商和合約，每口來回從不到 $1 到幾美元都有。小停損、口數多時，手續費佔的比例會很明顯，所以試算時一定要算進去。"]],
    qs: QS,
    gloss: [
      ["期貨", "約定買賣某個標的的合約。NQ 的標的是那斯達克 100 指數。"],
      ["口", "期貨的交易單位，一口＝一張合約。"],
      ["點", "價格的單位。NQ 從 27,000 到 27,001 就是漲 1 點。"],
      ["tick", "最小的價格跳動。NQ、MNQ 都是 0.25 點。"],
      ["每點價值", "價格動 1 點，一口合約賺賠多少。NQ $20、MNQ $2。"],
      ["保證金", "買賣一口合約要先放在帳戶的押金，不是合約的全額。"],
      ["槓桿", "用少量保證金控制大部位。賺賠都按整口合約計算。"],
      ["換月", "快到期時，改用下一個月份的合約。"],
      ["停損單", "價格碰到設定價才觸發，變成市價單出場。"],
      ["括號單／OCO", "同時掛停損和目標，一邊成交、另一邊自動取消。"],
      ["滑價", "實際成交價比預期差。市價單和觸發後的停損單都可能發生。"],
      ["平倉", "反向下單把手上的部位結束掉。"]],
    remember: "<b>賺賠 ＝ 點數 × 每點價值 × 口數 − 手續費。</b>NQ 每點 $20、MNQ 每點 $2。下單前先算好停損會虧多少。"
  });
})();
