/* 路線 2 第 1 關（新版）：買權與賣權——到期損益與對沖 */
(function () {
  const PAGES = (window.__PAGES = window.__PAGES || {});
  const { chip, lerp, ease, seg, cards } = window.KIT;
  const M = 20;                     // NQ 選擇權：1 點 ＝ $20
  const F0 = 27000;
  const prem = (type, K, days = 30, iv = 0.2) => { const r = window.OF.b76(F0, K, iv, days / 365); return Math.round(type === "call" ? r.call : r.put); };
  // 到期損益（點數）。leg: {t:"call"|"put"|"fut", s:+1/-1, K, p}
  const pay = (leg, S) => leg.t === "fut" ? leg.s * (S - leg.K) : leg.s * ((leg.t === "call" ? Math.max(0, S - leg.K) : Math.max(0, leg.K - S)) - leg.p);
  const total = (legs, S) => legs.reduce((a, l) => a + pay(l, S), 0);
  const XS = (lo = 26200, hi = 27800, n = 160) => Array.from({ length: n + 1 }, (_, k) => lo + ((hi - lo) * k) / n);

  function chart(series, o = {}) {
    const xs = o.xs || XS(), lo = o.lo != null ? o.lo : -1000, hi = o.hi != null ? o.hi : 1000;
    const X = (S) => lerp(70, 610, (S - xs[0]) / (xs[xs.length - 1] - xs[0])), Y = (v) => lerp(o.y1 || 330, o.y0 || 40, (Math.max(lo, Math.min(hi, v)) - lo) / (hi - lo));
    let s = `<line x1="70" x2="610" y1="${Y(0)}" y2="${Y(0)}" class="s-ink"/><text x="62" y="${Y(0) + 4}" text-anchor="end" class="t-mute">0</text>`;
    if (!o.noAxis) [hi * 0.8, lo * 0.8].forEach((v) => { s += `<text x="62" y="${Y(v) + 4}" text-anchor="end" class="t-mute">${v > 0 ? "+" : "−"}${Math.abs(Math.round(v))}</text>`; });
    if (!o.noX) [26400, 26700, 27000, 27300, 27600].forEach((p) => { s += `<line x1="${X(p)}" x2="${X(p)}" y1="${Y(lo)}" y2="${Y(lo) + 6}" class="s-ink"/><text x="${X(p)}" y="${Y(lo) + 22}" text-anchor="middle" class="t-mute">${p.toLocaleString()}</text>`; });
    series.forEach((se) => {
      const n = se.upto == null ? xs.length : se.upto;
      s += `<polyline points="${xs.slice(0, n).map((S) => `${X(S).toFixed(1)},${Y(se.f(S)).toFixed(1)}`).join(" ")}" class="${se.cls || "s-buy"} f-none" stroke-width="${se.w || 3}" ${se.dash ? `stroke-dasharray="${se.dash}"` : ""} opacity="${se.op == null ? 1 : se.op}"/>`;
    });
    return { s, X, Y };
  }
  const CALL = { t: "call", s: 1, K: 27000, p: 300 }, PUT = { t: "put", s: 1, K: 27000, p: 300 };
  const PP = prem("put", 26700);    // 約 476 點（30 天、IV 20%）

  const STEPS = [
    { cap: "選擇權買的是一個<b>權利</b>。<b>買權（Call）</b>：在約定價格<b>買</b>的權利；<b>賣權（Put）</b>：在約定價格<b>賣</b>的權利。買這個權利要先付錢，叫<b>權利金</b>。",
      why: "約定的價格叫履約價。權利的意思是「可以用、也可以不用」：對你有利就用，不利就放棄，最多損失付出去的權利金。NQ 期貨選擇權每 1 點 ＝ $20，和 NQ 期貨一樣。", stuck: "Call 像買房子付訂金：先鎖住價格，房價漲了你賺，跌了最多損失訂金。" },
    { cap: "先把兩件事<b>分開</b>，就不會搞混：<b>Call／Put</b> 是「種類」，決定看哪個方向；<b>買／賣</b> 是「位置」，決定你是付錢的人，還是收錢的人。兩個一組合，就是四種部位。",
      why: "很多人卡住，是因為把「買、賣」和「漲、跌」混在一起。每次看到一個部位，只要問兩個問題：①是 Call 還是 Put？②我是買方還是賣方？後面每一步，都是在把這四格一格一格填滿。", stuck: "可以這樣記：Call 是「叫價格上來」，Put 是「把價格壓下去」。先不管買賣，光看 Call 和 Put，就知道這份權利靠漲還是靠跌。", dur: 3600 },
    { cap: "例：NQ 在 27,000，你買一口 <b>27,000 Call</b>，付 <b>300 點</b>權利金（$6,000）。到期時，價格漲越多，你賺越多。",
      why: "到期時如果 NQ 在 27,500，你可以用 27,000 買進、價值 500 點，扣掉 300 點權利金，淨賺 200 點（$4,000）。這一關都只看「到期那一刻」的損益，最簡單。" },
    { cap: "把每個到期價格的損益畫出來：價格在 27,000 以下，<b>最多虧 300 點</b>（權利金）；以上，每漲 1 點就多賺 1 點。形狀像一支曲棍球桿。",
      why: "跌到 26,000 也只虧 300，因為你可以選擇不履約。這就是「買方風險有限」。", dur: 2600 },
    { cap: "<b>損益兩平</b>：價格要漲到 27,000 ＋ 300 ＝ <b>27,300</b>，才把權利金賺回來。",
      why: "在 27,000～27,300 之間，選擇權有價值，但還不夠付權利金，所以還是虧，只是虧得比較少。" },
    { cap: "換你算：到期時 NQ 在 <b>27,100</b>。",
      q: { t: "這口 27,000 Call（權利金 300）到期損益是多少點？", o: [
        ["+100", false, "價值是 100 點沒錯，但還要扣掉付出的權利金 300 點。"],
        ["−200", true, "到期價值 27,100 − 27,000 ＝ 100，扣掉權利金 300，損益 −200 點（−$4,000）。"],
        ["−300", false, "−300 是價格在 27,000 以下時的最大虧損。27,100 時選擇權還有 100 點價值。"]] } },
    { cap: "<b>買權的鏡子：買 Put</b>。買 27,000 Put 付 300 點：價格<b>跌</b>越多賺越多，漲上去最多虧 300。損益兩平在 26,700。",
      why: "Put 是「賣的權利」。價格跌到 26,500，你可以用 27,000 賣出，價值 500 點，扣掉權利金賺 200。Put 最常見的用途就是當保險。", dur: 2400 },
    { cap: "每一口選擇權都有買方和<b>賣方</b>。賣方收下權利金，損益剛好是買方的<b>鏡子</b>：賺的最多就是權利金，虧的可能很大。",
      why: "賣 Call 的人：價格不漲就賺 300 點權利金；價格大漲，虧損沒有上限。賣 Put 的人：價格大跌時虧很多。賣方就像保險公司：常常小賺，偶爾大賠。", dur: 2600 },
    { cap: "想一想：四種基本部位——買 Call、賣 Call、買 Put、賣 Put。",
      q: { t: "哪一種的潛在虧損<b>沒有上限</b>？", o: [
        ["買 Call", false, "買方最多虧權利金，風險有限。"],
        ["賣 Call", true, "賣 Call 的人要在價格大漲時用約定價賣給對方，價格可以一直漲，虧損沒有上限。"],
        ["買 Put", false, "買方最多虧權利金。"]] } },
    { cap: "四種部位的到期損益圖：買方（上排）虧損有限；賣方（下排）賺的有限、虧損可能很大。",
      why: "這四張圖是選擇權最基本的形狀，所有複雜的策略都是它們的組合。後面講造市商的時候，你會看到他們大多站在賣方。" },
    { cap: "<b>方向對照</b>：<b>買 Call</b> 和 <b>賣 Put</b> 都是偏多；<b>買 Put</b> 和 <b>賣 Call</b> 都是偏空。差別是：買方付錢、賭大方向；賣方收錢，只要價格「沒走壞」就賺。",
      why: "所以賣 Put 不是看跌。賣 Put 的人收了權利金，承諾「跌到履約價以下，我用約定價買進」，他最希望價格不要跌，是偏多的位置。同樣的，賣 Call 的人希望價格不要漲，是偏空的位置。", dur: 3800 },
    { cap: "想一想：有人<b>賣出一口 Put</b>，收了權利金。",
      q: { t: "他的看法最接近哪一個？", o: [
        ["價格不會大跌（偏多）", true, "賣 Put 的人希望價格不要跌破履約價，這樣權利金就全部賺到，所以是偏多。"],
        ["價格會大跌（偏空）", false, "看大跌的人應該是買 Put。賣 Put 在大跌時反而會虧很多。"],
        ["完全不在乎方向", false, "賣 Put 的損益和價格方向直接相關：價格跌越多，他虧越多。"]] } },
    { cap: "接著是<b>對沖</b>：幫部位買保險。先看一口<b>期貨多單</b>（27,000 進場）：漲多少賺多少，跌多少賠多少，兩邊都沒有保護。",
      why: "期貨的損益是一條斜直線，沒有上限也沒有下限。如果晚上突然跳空大跌，虧損可能遠超過預期。" },
    { cap: "期貨多單 ＋ 買一口 <b>26,700 Put</b>（30 天，約 " + PP + " 點）。跌破 26,700 之後，Put 開始賺錢，剛好抵銷期貨的虧損：<b>最大虧損被鎖住</b>。",
      why: "這叫保護性賣權。代價是先付了 " + PP + " 點保費，所以價格上漲時，賺的錢會少 " + PP + " 點。就像買保險：沒出事時保費像是白付，出事時救了你。", dur: 2800 },
    { cap: "換你算：期貨 27,000 做多，加買 26,700 Put（保費 " + PP + " 點）。",
      q: { t: "到期時，最多會虧多少點？", o: [
        [PP + " 點", false, "還要加上期貨從 27,000 跌到 26,700 的 300 點。"],
        [(300 + PP) + " 點", true, "期貨跌到 26,700 虧 300 點，再加上保費 " + PP + " 點，共 " + (300 + PP) + " 點。跌得再深，Put 會補回來，不會虧更多。"],
        ["沒有上限", false, "沒有 Put 的話才沒有上限。Put 把 26,700 以下的虧損都補回來了。"]] } },
    { cap: "整理：<b>買方</b>風險有限、付權利金；<b>賣方</b>收權利金、風險可能很大。<b>對沖</b>就是用選擇權幫部位買保險，代價是保費。",
      why: "下一關會拆開權利金：為什麼 26,700 Put 值 " + PP + " 點？其中多少是「時間」的價格？" }
  ];

  /* ---------- 新增兩幅圖：種類×位置、方向對照 ---------- */
  function drawNew(svg, k, t, quiz) {
    let s = "";
    if (k === 0) {
      const C = [["買 Call", "付錢，賭會漲"], ["買 Put", "付錢，賭會跌"], ["賣 Call", "收錢，賭不會漲"], ["賣 Put", "收錢，賭不會跌"]];
      s += `<g opacity="${seg(t, 0, 0.25)}"><text x="270" y="60" text-anchor="middle" class="t-ink t-b t-lg">Call：買漲的權利</text><text x="490" y="60" text-anchor="middle" class="t-ink t-b t-lg">Put：買跌的權利</text></g>`;
      s += [["買方", "付權利金"], ["賣方", "收權利金"]].map(([a, b], r) => `<g opacity="${seg(t, 0.15, 0.4)}"><text x="156" y="${135 + r * 120}" text-anchor="end" class="t-ink t-b t-lg">${a}</text><text x="156" y="${158 + r * 120}" text-anchor="end" class="t-mute">${b}</text></g>`).join("");
      C.forEach(([n, d], j) => {
        const c = j % 2, r = Math.floor(j / 2), x = 170 + c * 220, y = 85 + r * 120;
        s += `<g opacity="${seg(t, 0.35 + j * 0.13, 0.55 + j * 0.13)}"><rect x="${x}" y="${y}" width="200" height="100" rx="12" class="${c === 0 ? "f-buy-soft" : "f-sell-soft"}"/><text x="${x + 100}" y="${y + 44}" text-anchor="middle" class="t-ink t-b t-xl">${n}</text><text x="${x + 100}" y="${y + 74}" text-anchor="middle" class="t-ink">${d}</text></g>`;
      });
      s += `<text x="320" y="340" text-anchor="middle" class="t-ink t-b" opacity="${seg(t, 0.85, 1)}">欄＝種類（看哪個方向）　列＝位置（付錢或收錢）</text>`;
    } else {
      const D = [["買 Call", "付錢買「漲」的權利", 0, 0], ["賣 Put", "收錢，價格不跌就賺", 1, 0], ["買 Put", "付錢買「跌」的權利", 0, 1], ["賣 Call", "收錢，價格不漲就賺", 1, 1]];
      s += [["↑ 偏多", 0], ["↓ 偏空", 1]].map(([a, r]) => `<text x="80" y="${118 + r * 130}" text-anchor="middle" class="${r ? "t-sell" : "t-buy"} t-b t-xl" opacity="${seg(t, 0, 0.25)}">${a}</text>`).join("");
      s += `<g opacity="${seg(t, 0, 0.25)}"><text x="257" y="40" text-anchor="middle" class="t-mute">買方：付錢、賭大方向</text><text x="487" y="40" text-anchor="middle" class="t-mute">賣方：收錢、賺「沒走壞」</text></g>`;
      D.forEach(([n, d, c, r], j) => {
        const x = 150 + c * 230, y = 55 + r * 130, hl = quiz && j === 1;
        s += `<g opacity="${seg(t, 0.15 + j * 0.15, 0.4 + j * 0.15)}"><rect x="${x}" y="${y}" width="215" height="105" rx="12" class="${hl ? "f-gamma-soft" : r === 0 ? "f-buy-soft" : "f-sell-soft"} ${hl ? "s-line" : ""}"/><text x="${x + 107}" y="${y + 46}" text-anchor="middle" class="t-ink t-b t-xl">${n}</text><text x="${x + 107}" y="${y + 78}" text-anchor="middle" class="t-ink">${hl ? "？" : d}</text></g>`;
      });
      s += quiz ? chip(320, 335, "賣 Put 的看法是？", "hl") : chip(320, 335, "賣 Put 是偏多，不是看跌", "hl", seg(t, 0.8, 1));
    }
    svg.innerHTML = s;
  }
  // 步驟對照：0 定義｜1 新（種類×位置）｜2–9 原第 1–8 步｜10 新（方向對照）｜11 新（方向小測）｜12–15 原第 9–12 步
  function draw(svg, i, t) {
    if (i === 1) return drawNew(svg, 0, t);
    if (i === 10) return drawNew(svg, 1, t);
    if (i === 11) return drawNew(svg, 1, 1, true);
    return drawBase(svg, i === 0 ? 0 : i < 10 ? i - 1 : i - 3, t);
  }
  function drawBase(svg, i, t) {
    const e = ease(t); let s = "";
    if (i === 0) {
      s += `<g opacity="${seg(t, 0, 0.4)}"><rect x="60" y="80" width="240" height="160" rx="14" class="f-buy-soft"/><text x="180" y="124" text-anchor="middle" class="t-ink t-b t-xl">買權 Call</text><text x="180" y="160" text-anchor="middle" class="t-ink">約定價格「買」的權利</text><text x="180" y="190" text-anchor="middle" class="t-mute">看漲</text></g>`;
      s += `<g opacity="${seg(t, 0.3, 0.7)}"><rect x="340" y="80" width="240" height="160" rx="14" class="f-sell-soft"/><text x="460" y="124" text-anchor="middle" class="t-ink t-b t-xl">賣權 Put</text><text x="460" y="160" text-anchor="middle" class="t-ink">約定價格「賣」的權利</text><text x="460" y="190" text-anchor="middle" class="t-mute">看跌、當保險</text></g>`;
      s += `<text x="320" y="300" text-anchor="middle" class="t-ink t-b" opacity="${seg(t, 0.6, 1)}">買權利要付錢＝權利金；1 點 ＝ $20</text>`;
    } else if (i === 1) {
      s += `<g opacity="${seg(t, 0, 0.4)}"><rect x="80" y="70" width="230" height="110" rx="12" class="f-surface s-line"/><text x="100" y="104" class="t-ink t-b t-lg">買 27,000 Call</text><text x="100" y="134" class="t-ink">付 300 點 × $20</text><text x="100" y="160" class="t-buy t-b">＝ $6,000</text></g>`;
      s += `<g opacity="${seg(t, 0.4, 0.9)}"><text x="350" y="100" class="t-mute">到期時 NQ 在 27,500：</text><text x="350" y="130" class="t-ink">用 27,000 買 → 價值 500 點</text><text x="350" y="160" class="t-ink">− 權利金 300 點</text><text x="350" y="196" class="t-buy t-b t-lg">＝ +200 點（+$4,000）</text></g>`;
    } else if (i >= 2 && i <= 4) {
      const g = chart([{ f: (S) => pay(CALL, S), upto: i === 2 ? Math.max(2, Math.round(seg(t, 0, 0.85) * 161)) : null }]);
      s += g.s + `<text x="70" y="30" class="t-mute">到期損益（點）</text>`;
      if (i === 2 && t > 0.6) s += `<text x="${g.X(26500)}" y="${g.Y(-300) + 24}" text-anchor="middle" class="t-sell t-b">最多虧 300（權利金）</text><text x="${g.X(27550)}" y="${g.Y(550) - 10}" text-anchor="middle" class="t-buy t-b">漲越多賺越多</text>`;
      if (i === 3) s += `<g opacity="${seg(t, 0.1, 0.6)}"><circle cx="${g.X(27300)}" cy="${g.Y(0)}" r="8" class="f-hl"/><text x="${g.X(27300)}" y="${g.Y(0) + 28}" text-anchor="middle" class="t-gamma t-b">損益兩平 27,300</text></g>`;
      if (i === 4) s += `<line x1="${g.X(27100)}" x2="${g.X(27100)}" y1="40" y2="330" class="s-gamma" stroke-dasharray="5 4"/><text x="${g.X(27100)}" y="34" text-anchor="middle" class="t-gamma t-b">到期 27,100 → ？</text>`;
    } else if (i === 5) {
      const g = chart([{ f: (S) => pay(CALL, S), cls: "s-ink", op: 0.25 }, { f: (S) => pay(PUT, S), cls: "s-sell", upto: Math.max(2, Math.round(seg(t, 0, 0.85) * 161)) }]);
      s += g.s + `<text x="${g.X(26450)}" y="${g.Y(550) - 10}" text-anchor="middle" class="t-sell t-b" opacity="${seg(t, 0.7, 1)}">跌越多賺越多</text><text x="${g.X(26700)}" y="${g.Y(0) + 28}" text-anchor="middle" class="t-gamma t-b" opacity="${seg(t, 0.7, 1)}">兩平 26,700</text>`;
    } else if (i === 6) {
      const sc = { ...CALL, s: -1 };
      const g = chart([{ f: (S) => pay(CALL, S), cls: "s-buy", op: 0.35 }, { f: (S) => pay(sc, S), cls: "s-sell", upto: Math.max(2, Math.round(seg(t, 0.2, 0.9) * 161)) }]);
      s += g.s + `<text x="${g.X(26500)}" y="${g.Y(300) - 10}" text-anchor="middle" class="t-sell t-b" opacity="${seg(t, 0.7, 1)}">賣 Call：最多賺 300</text><text x="${g.X(27550)}" y="${g.Y(-560) + 24}" text-anchor="middle" class="t-sell t-b" opacity="${seg(t, 0.8, 1)}">大漲時虧損沒有上限</text><text x="${g.X(27550)}" y="${g.Y(560) - 10}" text-anchor="middle" class="t-buy" opacity="0.6">買方</text>`;
    } else if (i === 7 || i === 8) {
      const P = [["買 Call", CALL, "s-buy"], ["買 Put", PUT, "s-buy"], ["賣 Call", { ...CALL, s: -1 }, "s-sell"], ["賣 Put", { ...PUT, s: -1 }, "s-sell"]];
      P.forEach(([n, leg, c], k) => {
        const x0 = 40 + (k % 2) * 300, y0 = 30 + Math.floor(k / 2) * 175, xs = XS(26200, 27800, 80);
        const X = (S) => lerp(x0 + 20, x0 + 260, (S - 26200) / 1600), Y = (v) => lerp(y0 + 150, y0 + 30, (Math.max(-800, Math.min(800, v)) + 800) / 1600);
        s += `<g opacity="${i === 7 ? 1 : seg(t, k * 0.15, k * 0.15 + 0.3)}"><rect x="${x0}" y="${y0}" width="280" height="160" rx="10" class="f-surface s-line"/><text x="${x0 + 14}" y="${y0 + 22}" class="t-ink t-b">${n}（${["看漲", "看跌", "看不漲", "看不跌"][k]}）</text><line x1="${x0 + 20}" x2="${x0 + 260}" y1="${Y(0)}" y2="${Y(0)}" class="s-line"/><polyline points="${xs.map((S) => `${X(S).toFixed(1)},${Y(pay(leg, S)).toFixed(1)}`).join(" ")}" class="${c} f-none" stroke-width="3"/><text x="${x0 + 266}" y="${y0 + 22}" text-anchor="end" class="t-mute">${k < 2 ? "虧損有限" : k === 2 ? "虧損無上限" : "大跌虧很多"}</text></g>`;
      });
    } else if (i === 9) {
      const fut = { t: "fut", s: 1, K: 27000 };
      const g = chart([{ f: (S) => pay(fut, S), cls: "s-ink", upto: Math.max(2, Math.round(seg(t, 0, 0.8) * 161)) }]);
      s += g.s + `<text x="${g.X(26450)}" y="${g.Y(-550) + 24}" text-anchor="middle" class="t-sell t-b" opacity="${seg(t, 0.7, 1)}">跌多少賠多少</text><text x="${g.X(27550)}" y="${g.Y(550) - 10}" text-anchor="middle" class="t-buy t-b" opacity="${seg(t, 0.7, 1)}">漲多少賺多少</text>`;
    } else if (i === 10 || i === 11) {
      const fut = { t: "fut", s: 1, K: 27000 }, put = { t: "put", s: 1, K: 26700, p: PP };
      const g = chart([{ f: (S) => pay(fut, S), cls: "s-ink", op: 0.3, w: 2, dash: "6 4" }, { f: (S) => pay(put, S), cls: "s-sell", op: i === 10 ? seg(t, 0, 0.3) * 0.6 : 0.3, w: 2 }, { f: (S) => pay(fut, S) + pay(put, S), cls: "s-buy", w: 3.5, op: i === 10 ? seg(t, 0.3, 0.8) : 1 }]);
      s += g.s;
      if (i === 10) s += `<g opacity="${seg(t, 0.7, 1)}"><text x="${g.X(26400)}" y="${g.Y(-(300 + PP)) + 26}" text-anchor="middle" class="t-buy t-b">虧損鎖在 ${300 + PP} 點</text><text x="${g.X(27500)}" y="${g.Y(500 - PP) + 28}" text-anchor="middle" class="t-buy">上漲少賺保費</text><text x="${g.X(26300)}" y="${g.Y(-700) + 4}" class="t-mute">虛線：沒有保險的期貨</text></g>`;
      else s += `<text x="${g.X(26400)}" y="${g.Y(-(300 + PP)) + 26}" text-anchor="middle" class="t-ink t-b">最多虧幾點？</text>`;
    } else if (i === 12) {
      s += cards([["四種部位", "Call／Put 看方向，買／賣看付錢或收錢"], ["買方 vs 賣方", "買方付錢、虧有限；賣方收錢、賺有限虧可能很大"], ["損益兩平", "Call：履約價＋權利金；Put：履約價－權利金"], ["對沖", "期貨＋選擇權＝幫部位買保險"], ["代價", "保險要付保費，上漲時少賺"]], t, { hl: 3 });
    }
    svg.innerHTML = s;
  }

  /* ---------- 你來操作：組合自己的部位 ---------- */
  const KS = [26700, 26850, 27000, 27150, 27300];
  const PRESET = {
    pp: [{ t: "fut", s: 1, K: 27000 }, { t: "put", s: 1, K: 26700 }],
    cc: [{ t: "fut", s: 1, K: 27000 }, { t: "call", s: -1, K: 27300 }],
    col: [{ t: "fut", s: 1, K: 27000 }, { t: "put", s: 1, K: 26700 }, { t: "call", s: -1, K: 27300 }]
  };
  const simHTML = `<div class="btn-row op-pre"><button class="btn" data-p="pp" type="button">保護性賣權</button><button class="btn" data-p="cc" type="button">備兌買權</button><button class="btn" data-p="col" type="button">領口</button><button class="btn" data-p="clr" type="button">全部清除</button></div>
<div class="op-add"><select class="oa-t"><option value="call">Call</option><option value="put">Put</option><option value="fut">期貨</option></select><select class="oa-s"><option value="1">買進</option><option value="-1">賣出</option></select><select class="oa-k">${KS.map((k) => `<option value="${k}" ${k === 27000 ? "selected" : ""}>${k.toLocaleString()}</option>`).join("")}</select><button class="btn primary oa-go" type="button">加進部位</button></div>
<div class="op-legs"></div><svg class="fpx op-svg" viewBox="0 0 640 380" role="img" aria-label="到期損益圖"></svg><div class="op-out"></div><ul class="sim-task op-task"></ul>`;
  function simMount(box) {
    const q = (s) => box.querySelector(s); let legs = PRESET.pp.map((l) => ({ ...l })); const done = {};
    const withP = (l) => (l.t === "fut" ? l : { ...l, p: prem(l.t, l.K) });
    function paint() {
      const L = legs.map(withP), xs = XS(25800, 28200, 240), vals = xs.map((S) => total(L, S));
      const mn = Math.min(...vals), mx = Math.max(...vals), ends = [vals[0], vals[vals.length - 1]];
      const unlimDn = L.length && (vals[0] < vals[5] - 1e-6 && vals[0] <= mn + 1e-6) && Math.abs(vals[0] - vals[10]) > 1;
      const slopeL = vals[1] - vals[0], slopeR = vals[vals.length - 1] - vals[vals.length - 2];
      const lossCap = slopeL >= -1e-9, gainCap = slopeR <= 1e-9;
      q(".op-legs").innerHTML = L.length ? L.map((l, k) => `<span class="op-leg">${l.s > 0 ? "買" : "賣"} ${l.t === "fut" ? "期貨 @" + l.K.toLocaleString() : l.K.toLocaleString() + " " + (l.t === "call" ? "Call" : "Put") + "（" + l.p + " 點）"}<button type="button" data-x="${k}" aria-label="移除">×</button></span>`).join("") : `<span class="small">還沒有部位，從上面加入，或按一個範例。</span>`;
      const g = chart([{ f: (S) => total(L, S), cls: "s-buy", w: 3.5 }], { xs, lo: -1600, hi: 1600 });
      const be = []; for (let k = 1; k < xs.length; k++) if ((vals[k - 1] < 0 && vals[k] >= 0) || (vals[k - 1] >= 0 && vals[k] < 0)) be.push(Math.round(xs[k]));
      q(".op-svg").innerHTML = L.length ? g.s + be.map((b) => `<circle cx="${g.X(b)}" cy="${g.Y(0)}" r="6" class="f-hl"/>`).join("") : "";
      q(".op-out").innerHTML = L.length ? `<p>最大虧損：<b class="neg">${lossCap ? Math.round(mn) + " 點（$" + Math.abs(Math.round(mn) * M).toLocaleString() + "）" : "沒有上限"}</b>　最大獲利：<b class="pos">${gainCap ? Math.round(mx) + " 點（$" + Math.round(mx * M).toLocaleString() + "）" : "沒有上限"}</b></p><p class="small">損益兩平：${be.length ? be.map((b) => b.toLocaleString()).join("、") : "沒有"}　·　權利金用 Black-76、30 天、IV 20% 估算</p>` : "";
      const has = (t, s, K) => L.some((l) => l.t === t && l.s === s && (K == null || l.K === K));
      if (has("fut", 1) && has("put", 1) && lossCap) done.a = true;
      if (L.length && lossCap && gainCap) done.b = true;
      if (L.length === 1 && has("call", 1) && be.length === 1) done.c = true;
      q(".op-task").innerHTML = [["a", "任務 1：做出「期貨多單＋買 Put」，看最大虧損被鎖住"], ["b", "任務 2：做出一個最大虧損和最大獲利都有上限的部位"], ["c", "任務 3：只放一口買 Call，找出它的損益兩平"]].map(([k, tx]) => `<li class="${done[k] ? "ok" : ""}">${done[k] ? "✓" : "○"} ${tx}</li>`).join("");
    }
    box.addEventListener("click", (e) => {
      const p = e.target.closest("[data-p]"); if (p) { legs = p.dataset.p === "clr" ? [] : PRESET[p.dataset.p].map((l) => ({ ...l })); paint(); return; }
      const x = e.target.closest("[data-x]"); if (x) { legs.splice(+x.dataset.x, 1); paint(); return; }
      if (e.target.closest(".oa-go")) { if (legs.length >= 4) return; const t = q(".oa-t").value; legs.push({ t, s: +q(".oa-s").value, K: t === "fut" ? 27000 : +q(".oa-k").value }); paint(); }
    });
    paint();
  }

  const QS = [
    { fig: `<p class="small q-cap">買一口 26,800 Put，權利金 150 點。到期時 NQ 在 26,500。</p>`, q: "到期損益是多少點？", step: 7, o: [
      ["+150", true, "到期價值 26,800 − 26,500 ＝ 300，扣掉權利金 150，賺 150 點（+$3,000）。"],
      ["+300", false, "300 是到期價值，還要扣掉付出的權利金 150。"],
      ["−150", false, "價格跌到 26,500，Put 是有價值的，不會全虧。"]] },
    { fig: `<p class="small q-cap">賣出一口 27,400 Call，收權利金 120 點。</p>`, q: "這個部位的特性是？", step: 8, o: [
      ["最多賺 120 點，價格大漲時虧損沒有上限", true, "賣方最多賺權利金；價格漲超過 27,400 越多，虧得越多，沒有上限。"],
      ["最多虧 120 點", false, "最多虧權利金的是買方。賣方是最多賺權利金。"],
      ["價格下跌時虧很多", false, "賣 Call 在價格下跌時，Call 沒價值，賣方賺到全部權利金。"]] },
    { fig: `<p class="small q-cap">你有一口 NQ 期貨多單，怕明天開盤跳空大跌，又不想現在平倉。</p>`, q: "用選擇權，最直接的保護方式是？", step: 14, o: [
      ["再賣一口 Put", false, "賣 Put 在大跌時會虧更多，等於加碼看多。"],
      ["買一口價外 Put", true, "買 Put＝買保險：跌破履約價後，Put 的獲利會抵銷期貨的虧損，最大虧損被鎖住。代價是保費。"],
      ["買一口 Call", false, "買 Call 也是看漲，大跌時只是多虧權利金，不能保護期貨多單。"]] },
    { fig: `<p class="small q-cap">有人同時看到兩個部位：A 是「買一口 Call」，B 是「賣一口 Put」。</p>`, q: "A 和 B 的看法關係是？", step: 11, o: [
      ["兩個都是偏多：A 付錢賭漲，B 收錢賭不跌", true, "買 Call 和賣 Put 都希望價格往上，或至少不要跌。差別在 A 付權利金、風險有限；B 收權利金，大跌時虧很多。"],
      ["A 偏多，B 偏空", false, "賣 Put 不是看跌。B 希望價格不要跌，所以也是偏多。"],
      ["兩個都是偏空", false, "買 Call 和賣 Put 都不是偏空部位。偏空的是買 Put 和賣 Call。"]] }
  ];

  PAGES["op-1"] = window.KIT.page(window.COURSE.OPC, "op-1", {
    topic: "買權與賣權",
    lede: "選擇權是後面理解造市商、GEX 的基礎。這一關從零開始：先把「Call／Put」和「買／賣」拆開，再看什麼是買權、賣權，到期時賺賠怎麼算，買方和賣方差在哪，最後用選擇權幫期貨部位買保險。",
    analogy: [
      ["買房付訂金", "先付一筆訂金鎖住價格。房價漲了你賺，跌了最多損失訂金。這就是<b>買 Call</b>。"],
      ["汽車保險", "每年付保費，平安無事時像白付，出事時理賠救了你。這就是<b>買 Put</b> 當保險。"],
      ["保險公司", "收很多人的保費，大部分時候賺，偶爾遇到大災難要大賠。這就是<b>選擇權的賣方</b>。"]],
    steps: STEPS, draw, simHTML, simMount,
    simIntro: "自己組合期貨和選擇權，看到期損益圖、最大虧損、最大獲利和損益兩平。可以先按範例看看。",
    mist: [
      ["買選擇權一定比較安全", "買方最多虧權利金，但價格不動或動得不夠，權利金會全部虧掉。風險有限不代表容易賺。"],
      ["賣選擇權穩穩收租金", "賣方常常小賺，但遇到大行情可能一次賠掉很多次的收入，賣 Call 的虧損甚至沒有上限。"],
      ["買了 Put 保險就不會虧錢", "保險鎖住的是「最大虧損」，保費本身就是成本。價格沒跌時，保費等於白付。"],
      ["賣 Put 就是看跌", "賣 Put 是偏多。賣方收了權利金，希望價格不要跌破履約價；真正看跌的是買 Put 和賣 Call 的人。"],
      ["Call 是買、Put 是賣", "Call 和 Put 是兩種權利（買進的權利、賣出的權利）。「買」和「賣」是你站哪一邊：買方付錢取得權利，賣方收錢承擔義務。所以買 Put 是付錢取得「賣出的權利」，不是在賣東西。"]],
    faq: [
      ["NQ 選擇權一口多少錢？", "NQ 期貨選擇權每 1 點 ＝ $20，和 NQ 期貨一樣。權利金 300 點，就是 $6,000。另外也有 MNQ（微型）選擇權，每點 $2。"],
      ["履約價怎麼選？", "常見有價平（履約價接近現價）、價內、價外。價外的比較便宜，但需要價格動更多才賺錢。這一關先用價平，下一關會講差別。"],
      ["一定要放到到期嗎？", "不用。選擇權隨時可以賣掉平倉，到期前的價格還包含時間價值（下一關）。這一關只看到期，是為了先把形狀看懂。"],
      ["為什麼要學選擇權，我只做期貨？", "因為造市商賣出大量選擇權後，會用期貨對沖，這些對沖單會影響期貨價格。看懂選擇權，才看得懂 GEX 和那些關鍵價位是怎麼來的。"],
      ["美式和歐式差在哪？", "美式可以在到期前任何時候履約，歐式只能在到期日。這套筆記只看到期損益和價格變化，這個差別先不用管。"],
      ["權利金是怎麼算出來的？", "用選擇權定價模型（這裡用 Black-76），根據現價、履約價、到期時間、波動率算出來。後面幾關會一個一個拆開。"],
      ["為什麼賣 Put 是偏多？我賣東西不是看跌嗎？", "賣 Put 不是「賣出標的」，而是「收權利金，承諾如果價格跌到履約價以下，我用履約價買進」。價格漲或不動，你賺到權利金；價格大跌，你被迫用高價接貨，才會虧。所以你希望它別跌。"],
      ["買 Put 和賣 Call 都偏空，差在哪？", "買 Put：付權利金，跌越多賺越多，最多虧權利金。賣 Call：收權利金，價格不漲就賺，但大漲時虧損沒有上限。前者像買保險，後者像當保險公司。"],
      ["Call、Put 要怎麼記？", "Call 想成「叫價格上來」，Put 想成「把價格壓下去」。先靠這個分辨方向，再看你是買方還是賣方。"]],
    qs: QS,
    gloss: [
      ["買權（Call）", "在履約價買進的權利。"],
      ["賣權（Put）", "在履約價賣出的權利。"],
      ["履約價", "約定的買賣價格。"],
      ["權利金", "買選擇權要付的價格，NQ 選擇權 1 點 ＝ $20。"],
      ["損益兩平", "Call：履約價 ＋ 權利金；Put：履約價 − 權利金。"],
      ["保護性賣權", "期貨多單 ＋ 買 Put，用 Put 當保險。"],
      ["買方／賣方", "買方付權利金取得權利；賣方收權利金，承擔對方要用權利時的義務。"],
      ["偏多／偏空", "偏多：希望價格漲，或至少不要跌；偏空相反。買 Call、賣 Put 偏多；買 Put、賣 Call 偏空。"]],
    remember: "<b>Call／Put 看方向，買／賣看付錢還是收錢。</b>買 Call、賣 Put 偏多；買 Put、賣 Call 偏空。<b>買方付權利金、風險有限；賣方收權利金、風險可能很大。</b>對沖就是用選擇權幫部位買保險，代價是保費。"
  });
})();
