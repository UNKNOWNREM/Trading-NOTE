/* 圖解　路線 2：選擇權（7 關）。價格用 NQ 附近的整數示意，Black-76、零利率。 */
(function () {
  const PAGES = (window.__PAGES = window.__PAGES || {});
  const { OPC: C, T, lesson, loop, nf, sgn, RM, $ } = window.COURSE;
  const B = (F, K, iv, days) => window.OF.b76(F, K, iv, days / 365);
  const MULT = 20; // NQ options on futures: 1 point = 20 USD

  // Small single-axis line plot. series: [{ys, col, w, dash, label}]; xs shared.
  function plot(svg, o) {
    const W = o.W || 520, H = o.H || 260, L = o.L || 54, R = 12, Tp = 14, Bt = 30;
    const all = o.series.flatMap((s) => s.ys).concat(o.yExtra || []);
    let lo = o.ylo != null ? o.ylo : Math.min(...all), hi = o.yhi != null ? o.yhi : Math.max(...all);
    if (hi - lo < 1e-9) { hi += 1; lo -= 1; } const pad = (hi - lo) * 0.06; if (o.ylo == null) lo -= pad; if (o.yhi == null) hi += pad;
    const x0 = o.xs[0], x1 = o.xs[o.xs.length - 1];
    const X = (x) => L + ((x - x0) / (x1 - x0)) * (W - L - R), Y = (y) => Tp + ((hi - y) / (hi - lo)) * (H - Tp - Bt);
    const ticks = window.OF.niceTicks(lo, hi, 4), xt = window.OF.niceTicks(x0, x1, 5);
    const fy = o.fy || ((v) => nf(v)), fx = o.fx || ((v) => nf(v));
    let h = `${ticks.map((v) => `<line x1="${L}" x2="${W - R}" y1="${Y(v)}" y2="${Y(v)}" style="stroke:${Math.abs(v) < 1e-9 ? "var(--ink-3)" : "var(--line)"}"/><text x="${L - 6}" y="${Y(v) + 4}" text-anchor="end">${fy(v)}</text>`).join("")}
      ${xt.map((v) => `<text x="${X(v)}" y="${H - 10}" text-anchor="middle">${fx(v)}</text>`).join("")}
      ${o.ylab ? `<text x="${L}" y="10" style="font-size:11px">${o.ylab}</text>` : ""}`;
    if (o.under) h += o.under(X, Y);
    h += o.series.map((s) => `<polyline fill="none" style="stroke:${s.col};stroke-width:${s.w || 2.2};${s.dash ? "stroke-dasharray:" + s.dash : ""};stroke-linejoin:round" points="${s.ys.map((y, i) => `${X(o.xs[i]).toFixed(1)},${Y(y).toFixed(1)}`).join(" ")}"/>`).join("");
    if (o.over) h += o.over(X, Y);
    svg.innerHTML = h;
    return { X, Y };
  }
  const range = (a, b, n) => Array.from({ length: n + 1 }, (_, i) => a + ((b - a) * i) / n);

  /* hedge presets for lesson 1. leg: [type, qty, strikeKey] — strikeKey "put"/"call"/"atm" */
  const HEDGES = [
    { name: "期貨多單（沒對沖）", legs: [["fut", 1]], say: "只買一口期貨：漲多少賺多少、跌多少賠多少，兩邊都沒有保護。拿來和下面幾種比較。" },
    { name: "保護性賣權", legs: [["fut", 1], ["put", 1, "put"]], say: "期貨多單＋買一口 Put。跌破 Put 履約價後虧損被鎖住，像幫多單買保險；代價是先付權利金，所以上漲時少賺一點。" },
    { name: "備兌買權", legs: [["fut", 1], ["call", -1, "call"]], say: "期貨多單＋賣一口 Call。先收權利金，小跌時有一點緩衝；但漲過 Call 履約價後獲利封頂，而且下方還是沒有保護。" },
    { name: "領口（Collar）", legs: [["fut", 1], ["put", 1, "put"], ["call", -1, "call"]], say: "期貨多單＋買 Put＋賣 Call。用賣 Call 收的錢去付 Put 的保費，虧損和獲利都被框在兩個履約價之間。" },
    { name: "市商 Delta 對沖", legs: [["call", -10, "atm"], ["fut", "delta"]], say: "賣出 10 口價平 Call，再買進「Delta × 10」口期貨。切到「看現在」：現價附近是平的，方向中性；但價格往任何一邊跑，粗線都往下彎，這就是負 Gamma。" }];

  /* ---------- 1. payoff ---------- */
  PAGES["op-1"] = lesson(C, "op-1", {
    lede: "選擇權是一張「權利」：付一筆錢（權利金），換到未來可以用某個價格（履約價）買或賣的權利。先只看到期那天，用一張圖就能看懂四種基本部位。",
    pre: "p1-",
    body: `<div class="scene"><div class="scene-h"><h3>到期損益圖：自己組一個部位</h3><p class="small">標的是 NQ 期貨，1 點＝20 美元。拖動「到期時的價格」，看你賺或賠多少。</p></div>
<div class="tabs" id="p1-type"><button class="tab" data-v="call" aria-selected="true" type="button">Call（買權）</button><button class="tab" data-v="put" aria-selected="false" type="button">Put（賣權）</button><span style="width:12px"></span><button class="tab" data-s="1" aria-selected="true" type="button">買進</button><button class="tab" data-s="-1" aria-selected="false" type="button">賣出</button></div>
<div class="scene-grid"><svg id="p1-svg" viewBox="0 0 520 280" role="img" aria-label="到期損益圖"></svg><div class="side" id="p1-side"></div></div>
<div class="controls" style="margin-top:10px">
<div class="ctl"><label for="p1-k">履約價 <b id="p1-k-v"></b></label><input id="p1-k" type="range" min="26500" max="27500" step="50" value="27000"></div>
<div class="ctl"><label for="p1-p">權利金 <b id="p1-p-v"></b></label><input id="p1-p" type="range" min="20" max="600" step="10" value="200"></div>
<div class="ctl"><label for="p1-s">到期時的價格 <b id="p1-s-v"></b></label><input id="p1-s" type="range" min="26000" max="28000" step="10" value="27400"></div></div></div>
<div class="scene" id="s-scene"><div class="scene-h"><h3>對沖＝幫部位買保險（三步驟）</h3><p class="small">按「下一步」，一次只多看一條線。</p></div>
<div class="scene-grid"><svg id="s-svg" viewBox="0 0 520 280" role="img" aria-label="期貨加 Put 的對沖示意"></svg><div class="side" id="s-side"></div></div>
<div class="btn-row"><button class="btn" id="s-prev" type="button">上一步</button><button class="btn primary" id="s-next" type="button">下一步</button><span class="small" id="s-n"></span></div>
<div class="controls"><div class="ctl"><label for="s-p">如果價格到了 <b id="s-p-v"></b></label><input id="s-p" type="range" min="25800" max="28200" step="50" value="26000"></div></div></div>
<details class="callout c-note"><summary>進階：其他對沖組合（看懂上面再打開）</summary><div class="callout-body">
<div class="scene" id="h-scene"><div class="scene-h"><h3>對沖組合：把期貨和選擇權放在一起</h3><p class="small">期貨進場價 27,000，IV 20%。細虛線是每一條腿，粗線是合起來的損益。</p></div>
<div class="tabs" id="h-pre">${HEDGES.map((h, i) => `<button class="tab" data-i="${i}" aria-selected="${i === 1}" type="button">${h.name}</button>`).join("")}</div>
<div class="scene-grid"><svg id="h-svg" viewBox="0 0 520 300" role="img" aria-label="對沖組合損益圖"></svg><div class="side" id="h-side"></div></div>
<div class="legend"><span><i style="background:var(--buy)"></i>組合（粗線）</span><span><i style="background:var(--ink-3)"></i>期貨腿</span><span><i style="background:var(--gamma)"></i>Call 腿</span><span><i style="background:var(--sell)"></i>Put 腿</span></div>
<div class="tabs" id="h-view" style="margin-top:10px"><button class="tab" data-v="exp" aria-selected="true" type="button">看到期那天</button><button class="tab" data-v="now" aria-selected="false" type="button">看現在（還沒到期）</button></div>
<div class="controls" style="margin-top:6px">
<div class="ctl" id="h-put-c"><label for="h-put">Put 履約價 <b id="h-put-v"></b></label><input id="h-put" type="range" min="26300" max="27000" step="50" value="26700"></div>
<div class="ctl" id="h-call-c"><label for="h-call">Call 履約價 <b id="h-call-v"></b></label><input id="h-call" type="range" min="27000" max="27700" step="50" value="27300"></div>
<div class="ctl" id="h-days-c"><label for="h-days">距離到期 <b id="h-days-v"></b></label><input id="h-days" type="range" min="1" max="30" value="30"></div>
<div class="ctl"><label for="h-s">價格 <b id="h-s-v"></b></label><input id="h-s" type="range" min="25800" max="28200" step="10" value="26400"></div></div></div>
<div class="prose"><p>重點看粗線的形狀：<b>保護性賣權</b>把下方的虧損砍平，代價是權利金；<b>備兌買權</b>收了權利金，但把上方的獲利封頂；<b>領口</b>兩者一起用，用賣 Call 的錢去付 Put。最後一個<b>市商 Delta 對沖</b>切到「看現在」：在現價附近幾乎是平的（方向中性），但兩邊都往下彎，這就是負 Gamma。價格一跑遠就開始虧，所以市商得一路追著調整（第 5 關）。</p></div>
</div></details>
<div class="duo">
<div class="op"><h4>買方：付錢買權利</h4>最多虧掉權利金，像買保險：沒用到就是保費沒了。${T("Call", "買權：可以用履約價「買進」標的的權利。價格漲越多越值錢。")}賭漲，${T("Put", "賣權：可以用履約價「賣出」標的的權利。價格跌越多越值錢。")}賭跌（或拿來保護多單）。</div>
<div class="neg"><h4>賣方：收錢承擔義務</h4>最多賺到權利金，但虧損可能很大（賣 Call 理論上沒有上限）。市商常常站在這一邊，所以要對沖。</div></div>
<div class="prose"><p>${T("價內", "ITM：現在履約就有價值。Call 是價格高於履約價，Put 是價格低於履約價。")}、${T("價平", "ATM：價格剛好在履約價附近。")}、${T("價外", "OTM：現在履約沒有價值。Call 是價格低於履約價，Put 是價格高於履約價。")}是用「現在的價格」和履約價比較。這三個詞在後面每一關都會用到。</p></div>`,
    quiz: [
      { q: "買進履約價 27,000 的 Call，權利金 200 點。到期時價格要到多少才不虧？", o: [["27,000", false, "到 27,000 時 Call 剛好沒有價值，你還虧了 200 點權利金。"], ["27,200", true, "履約價＋權利金＝損益兩平點。超過 27,200 才開始賺。"], ["26,800", false, "那是 Put 的算法方向。"]] },
      { q: "你有一口 NQ 期貨多單，想在不平倉的情況下限制最大虧損。最直接的做法是？", o: [["再買一口期貨", false, "這會讓虧損加倍。"], ["買進一口 Put（保護性賣權）", true, "跌破 Put 履約價後，Put 的獲利抵銷期貨的虧損，最大虧損就被鎖住了。代價是權利金。"], ["賣出一口 Call", false, "備兌買權只多了一點權利金緩衝，下方仍然沒有保護。"]] },
      { q: "下面哪個部位的虧損理論上沒有上限？", o: [["買進 Call", false, "買方最多虧權利金。"], ["賣出 Call", true, "價格可以一直漲，賣 Call 的人要一直賠。這就是市商必須對沖的原因。"], ["買進 Put", false, "買方最多虧權利金。"]] }],
    remember: "<b>買方風險有限，賣方報酬有限。</b>選擇權可以幫期貨部位「買保險」；市商常是賣方，所以他們一定要用期貨對沖。",
    mount(root) {
      let typ = "call", side = 1;
      function draw() {
        const K = +$(root, "#p1-k").value, P = +$(root, "#p1-p").value, S = +$(root, "#p1-s").value;
        $(root, "#p1-k-v").textContent = nf(K); $(root, "#p1-p-v").textContent = P + " 點"; $(root, "#p1-s-v").textContent = nf(S);
        const pay = (s) => side * ((typ === "call" ? Math.max(0, s - K) : Math.max(0, K - s)) - P);
        const xs = range(26000, 28000, 80), ys = xs.map(pay), be = typ === "call" ? K + P : K - P, v = pay(S);
        plot($(root, "#p1-svg"), { xs, series: [{ ys, col: "var(--ink)" }], ylo: -700, yhi: 1100, ylab: "損益（點）", fy: (y) => sgn(y),
          under: (X, Y) => `<rect x="${X(26000)}" y="${Y(1100)}" width="${X(28000) - X(26000)}" height="${Y(0) - Y(1100)}" style="fill:var(--gamma);opacity:.06"/><rect x="${X(26000)}" y="${Y(0)}" width="${X(28000) - X(26000)}" height="${Y(-700) - Y(0)}" style="fill:var(--sell);opacity:.06"/>
            <line x1="${X(K)}" x2="${X(K)}" y1="${Y(1100)}" y2="${Y(-700)}" style="stroke:var(--ink-3);stroke-dasharray:4 4"/><text x="${X(K) + 4}" y="${Y(1050)}">履約價</text>`,
          over: (X, Y) => `<circle cx="${X(be)}" cy="${Y(0)}" r="4" style="fill:var(--surface);stroke:var(--ink);stroke-width:2"/><text x="${X(be)}" y="${Y(0) + 18}" text-anchor="middle">損益兩平 ${nf(be)}</text>
            <line x1="${X(S)}" x2="${X(S)}" y1="${Y(1100)}" y2="${Y(-700)}" style="stroke:var(--buy);stroke-width:1.5"/><circle cx="${X(S)}" cy="${Y(Math.max(-700, Math.min(1100, v)))}" r="6" style="fill:${v >= 0 ? "var(--gamma)" : "var(--sell)"};stroke:var(--surface);stroke-width:2"/>` });
        const name = (side > 0 ? "買進 " : "賣出 ") + (typ === "call" ? "Call" : "Put");
        const maxL = side > 0 ? `${P} 點（$${nf(P * MULT)}）` : typ === "call" ? "沒有上限" : `${nf(K - P)} 點（價格跌到 0）`;
        const maxP = side > 0 ? (typ === "call" ? "沒有上限" : `${nf(K - P)} 點`) : `${P} 點（$${nf(P * MULT)}）`;
        const itm = typ === "call" ? S > K : S < K;
        $(root, "#p1-side").innerHTML = `<span class="tagline">${name}</span><h4>到期 ${nf(S)}：${sgn(v)} 點</h4><p style="margin:0 0 8px">＝ <b style="color:${v >= 0 ? "var(--gamma-ink)" : "var(--sell-ink)"}">${v >= 0 ? "+" : "−"}$${nf(Math.abs(v) * MULT)}</b>（1 口）。這時選擇權是${itm ? "價內，有履約價值" : "價外，到期沒有價值"}。</p>
          <div class="kpi"><div class="k-l">最大虧損</div><div class="k-v" style="font-size:16px">${maxL}</div></div><div class="kpi" style="margin-top:6px"><div class="k-l">最大獲利</div><div class="k-v" style="font-size:16px">${maxP}</div></div>`;
      }
      $(root, "#p1-type").addEventListener("click", (e) => { const b = e.target.closest(".tab"); if (!b) return;
        if (b.dataset.v) { typ = b.dataset.v; root.querySelectorAll("#p1-type [data-v]").forEach((x) => x.setAttribute("aria-selected", String(x === b))); }
        if (b.dataset.s) { side = +b.dataset.s; root.querySelectorAll("#p1-type [data-s]").forEach((x) => x.setAttribute("aria-selected", String(x === b))); } draw(); });
      ["#p1-k", "#p1-p", "#p1-s"].forEach((k) => $(root, k).addEventListener("input", draw)); draw();
      // simple 3-step hedge story
      let ss = 0; const SK = 26700, SP = Math.round(B(27000, SK, 0.2, 30).put);
      function sd() {
        const S = +$(root, "#s-p").value; $(root, "#s-p-v").textContent = nf(S);
        const fut = (x) => x - 27000, put = (x) => Math.max(0, SK - x) - SP, both = (x) => fut(x) + put(x);
        const xs = range(25800, 28200, 48), cl = (y) => Math.max(-1300, Math.min(1300, y));
        const ser = [{ ys: xs.map((x) => cl(fut(x))), col: "var(--ink-3)", w: ss === 2 ? 1.5 : 3, dash: ss === 2 ? "4 4" : "" }];
        if (ss >= 1) ser.push({ ys: xs.map((x) => cl(put(x))), col: "var(--sell)", w: ss === 2 ? 1.5 : 3, dash: ss === 2 ? "4 4" : "" });
        if (ss >= 2) ser.push({ ys: xs.map((x) => cl(both(x))), col: "var(--buy)", w: 3.5 });
        const pts = [["期貨", fut(S), "var(--ink-3)"]].concat(ss >= 1 ? [["Put（保險）", put(S), "var(--sell)"]] : []).concat(ss >= 2 ? [["合起來", both(S), "var(--buy)"]] : []);
        plot($(root, "#s-svg"), { xs, series: ser, ylo: -1300, yhi: 1300, ylab: "賺賠（點）", fy: (y) => sgn(y),
          under: (X, Y) => `<rect x="${X(25800)}" y="${Y(1300)}" width="${X(28200) - X(25800)}" height="${Y(0) - Y(1300)}" style="fill:var(--gamma);opacity:.05"/><rect x="${X(25800)}" y="${Y(0)}" width="${X(28200) - X(25800)}" height="${Y(-1300) - Y(0)}" style="fill:var(--sell);opacity:.05"/><text x="${X(27950)}" y="${Y(1150)}" style="fill:var(--gamma-ink)">賺</text><text x="${X(27950)}" y="${Y(-1150)}" style="fill:var(--sell-ink)">賠</text>`,
          over: (X, Y) => `<line x1="${X(S)}" x2="${X(S)}" y1="14" y2="${Y(-1300)}" style="stroke:var(--ink-2);stroke-dasharray:3 3"/>` + pts.map((p) => `<circle cx="${X(S)}" cy="${Y(cl(p[1]))}" r="6" style="fill:${p[2]};stroke:var(--surface);stroke-width:2"/>`).join("") + (ss >= 2 ? `<text x="${X(26300)}" y="${Y(-SP - 300) + 22}" style="fill:var(--buy-ink);font-weight:600">最多只虧 ${SP + 300} 點</text>` : "") });
        const SAY = [`<h4>第 1 步：你買了一口期貨</h4><p style="margin:0">在 27,000 買進。價格漲 1 點賺 1 點，跌 1 點賠 1 點。<b>跌越多賠越多，沒有底。</b></p>`,
          `<h4>第 2 步：另外買一張 Put（保險）</h4><p style="margin:0">花 ${SP} 點買一張 26,700 的 Put。價格在 26,700 以上，這張保險用不到，${SP} 點就是保費；<b>跌破 26,700 後，跌 1 點它就賠你 1 點。</b></p>`,
          `<h4>第 3 步：兩條加起來</h4><p style="margin:0">藍色粗線＝期貨＋Put。<b>不管跌到哪裡，最多只虧 ${SP + 300} 點</b>（從 27,000 跌到 26,700 的 300 點＋保費 ${SP} 點）。代價：上漲時每次都少賺 ${SP} 點保費。</p>`];
        $(root, "#s-side").innerHTML = SAY[ss] + `<div class="kpi" style="margin-top:10px"><div class="k-l">價格到 ${nf(S)} 時</div>${pts.map((p) => `<div style="display:flex;justify-content:space-between;font-size:15px"><span><i style="display:inline-block;width:10px;height:10px;border-radius:2px;background:${p[2]};margin-right:6px"></i>${p[0]}</span><b style="color:${p[1] >= 0 ? "var(--gamma-ink)" : "var(--sell-ink)"}">${sgn(p[1])} 點</b></div>`).join("")}</div>`;
        $(root, "#s-n").textContent = `第 ${ss + 1} / 3 步`;
      }
      $(root, "#s-next").addEventListener("click", () => { ss = Math.min(2, ss + 1); sd(); });
      $(root, "#s-prev").addEventListener("click", () => { ss = Math.max(0, ss - 1); sd(); });
      $(root, "#s-p").addEventListener("input", sd); sd();
      // hedge combos
      let hi = 1, view = "exp"; const F0 = 27000, iv = 0.2, D0 = 30;
      function legsOf(h) {
        const Kp = +$(root, "#h-put").value, Kc = +$(root, "#h-call").value, dealer = h.name.startsWith("市商"), dd = dealer ? 7 : D0;
        return h.legs.map(([t, q, k]) => { const K = k === "put" ? Kp : k === "call" ? Kc : F0; const prem = t === "fut" ? 0 : t === "call" ? B(F0, K, iv, dd).call : B(F0, K, iv, dd).put;
          const qty = q === "delta" ? 10 * B(F0, F0, iv, dd).callDelta : q; return { t, qty, K, prem, dd }; });
      }
      function legPnl(l, S, daysLeft) {
        if (l.t === "fut") return l.qty * (S - F0);
        const v = daysLeft <= 0 ? (l.t === "call" ? Math.max(0, S - l.K) : Math.max(0, l.K - S)) : (l.t === "call" ? B(S, l.K, iv, daysLeft).call : B(S, l.K, iv, daysLeft).put);
        return l.qty * (v - l.prem);
      }
      function hd() {
        const h = HEDGES[hi], L = legsOf(h), dealer = h.name.startsWith("市商");
        const daysMax = dealer ? 7 : D0, dEl = $(root, "#h-days"); dEl.max = daysMax; if (+dEl.value > daysMax) dEl.value = daysMax;
        const left = view === "exp" ? 0 : +dEl.value, S = +$(root, "#h-s").value;
        const uses = (k) => h.legs.some((l) => l[2] === k);
        $(root, "#h-put-c").style.display = uses("put") ? "" : "none"; $(root, "#h-call-c").style.display = uses("call") ? "" : "none"; $(root, "#h-days-c").style.display = view === "now" ? "" : "none";
        $(root, "#h-put-v").textContent = nf(+$(root, "#h-put").value); $(root, "#h-call-v").textContent = nf(+$(root, "#h-call").value); $(root, "#h-days-v").textContent = dEl.value + " 天"; $(root, "#h-s-v").textContent = nf(S);
        const xs = range(25800, 28200, 96), tot = xs.map((x) => L.reduce((a, l) => a + legPnl(l, x, left), 0));
        const lim = dealer ? Math.max(400, ...tot.map(Math.abs)) : 1300;
        const legCol = { fut: "var(--ink-3)", call: "var(--gamma)", put: "var(--sell)" };
        const clip = (y) => Math.max(-lim, Math.min(lim, y));
        const series = L.map((l) => ({ ys: xs.map((x) => clip(legPnl(l, x, left))), col: legCol[l.t], w: 1.3, dash: "4 4" })).concat([{ ys: tot.map(clip), col: "var(--buy)", w: 3 }]);
        const v = L.reduce((a, l) => a + legPnl(l, S, left), 0);
        plot($(root, "#h-svg"), { xs, series, ylo: -lim, yhi: lim, ylab: "損益（點）", fy: (y) => sgn(y),
          under: (X, Y) => `<line x1="${X(F0)}" x2="${X(F0)}" y1="14" y2="${Y(-lim)}" style="stroke:var(--ink-3);stroke-dasharray:2 4"/><text x="${X(F0) + 4}" y="26">進場 27,000</text>`,
          over: (X, Y) => `<line x1="${X(S)}" x2="${X(S)}" y1="14" y2="${Y(-lim)}" style="stroke:var(--buy);stroke-width:1.2"/><circle cx="${X(S)}" cy="${Y(Math.max(-lim, Math.min(lim, v)))}" r="6" style="fill:${v >= 0 ? "var(--gamma)" : "var(--sell)"};stroke:var(--surface);stroke-width:2"/>` });
        const inR = tot.filter((_, i) => xs[i] >= 25800 && xs[i] <= 28200), mn = Math.min(...inR), mxv = Math.max(...inR);
        const futOnly = S - F0, legName = (l) => (l.t === "fut" ? (l.qty > 0 ? "買" : "賣") + " " + nf(Math.abs(l.qty), l.qty % 1 ? 1 : 0) + " 口期貨" : (l.qty > 0 ? "買" : "賣") + " " + Math.abs(l.qty) + " 口 " + nf(l.K) + " " + (l.t === "call" ? "Call" : "Put") + `（權利金 ${nf(l.prem)}）`);
        const n = tot.length - 1, slopeL = tot[1] - tot[0], slopeR = tot[n] - tot[n - 1];
        const worst = mn === tot[0] && slopeL > 0.5 || mn === tot[n] && slopeR < -0.5 ? "沒有底（還會擴大）" : sgn(mn) + " 點";
        const best = mxv === tot[n] && slopeR > 0.5 || mxv === tot[0] && slopeL < -0.5 ? "沒有上限" : sgn(mxv) + " 點";
        $(root, "#h-side").innerHTML = `<span class="tagline">${view === "exp" ? "到期那天" : "還剩 " + left + " 天"}</span><h4>${h.name}</h4><p style="margin:0 0 8px">${h.say}</p>
          <ul class="small" style="margin:0 0 8px;padding-left:1.2em">${L.map((l) => `<li>${legName(l)}</li>`).join("")}</ul>
          <div class="kpi"><div class="k-l">價格 ${nf(S)} 時的組合損益</div><div class="k-v" style="color:${v >= 0 ? "var(--gamma-ink)" : "var(--sell-ink)"}">${sgn(v)} 點</div><div class="k-n">${dealer ? `${sgn(v * MULT)} 美元` : `只有期貨的話：${sgn(futOnly)} 點`}</div></div>
          <div class="kpi" style="margin-top:6px"><div class="k-l">最大虧損 ／ 最大獲利</div><div class="k-v" style="font-size:16px">${worst} ／ ${best}</div></div>`;
      }
      $(root, "#h-pre").addEventListener("click", (e) => { const b = e.target.closest(".tab"); if (!b) return; hi = +b.dataset.i; if (HEDGES[hi].name.startsWith("市商") && view === "exp") { view = "now"; root.querySelectorAll("#h-view .tab").forEach((x) => x.setAttribute("aria-selected", String(x.dataset.v === "now"))); $(root, "#h-days").value = 7; $(root, "#h-s").value = 27150; } root.querySelectorAll("#h-pre .tab").forEach((x) => x.setAttribute("aria-selected", String(x === b))); hd(); });
      $(root, "#h-view").addEventListener("click", (e) => { const b = e.target.closest(".tab"); if (!b) return; view = b.dataset.v; root.querySelectorAll("#h-view .tab").forEach((x) => x.setAttribute("aria-selected", String(x === b))); hd(); });
      ["#h-put", "#h-call", "#h-days", "#h-s"].forEach((k) => $(root, k).addEventListener("input", hd)); hd();
    }
  });

  /* ---------- 2. time value ---------- */
  PAGES["op-2"] = lesson(C, "op-2", {
    lede: "還沒到期的選擇權，價格比到期損益圖上的值更高。多出來的部分叫時間價值：離到期還有時間，價格還有機會跑過去。這部分每天都在流失。",
    pre: "p2-",
    body: `<div class="scene"><div class="scene-h"><h3>倒數到期：看曲線怎麼塌下來</h3><p class="small">Call，履約價 27,000，IV 20%。灰色折線是到期時的價值（內含價值）。</p></div>
<div class="scene-grid"><svg id="p2-svg" viewBox="0 0 520 280" role="img" aria-label="選擇權價值隨到期日變化"></svg><div class="side" id="p2-side"></div></div>
<div class="controls" style="margin-top:10px">
<div class="ctl"><label for="p2-d">距離到期 <b id="p2-d-v"></b></label><input id="p2-d" type="range" min="0" max="30" step="0.25" value="30"></div>
<div class="ctl"><label for="p2-f">現在價格 <b id="p2-f-v"></b></label><input id="p2-f" type="range" min="26400" max="27600" step="10" value="27000"></div></div>
<div class="btn-row"><button class="btn primary" id="p2-play" type="button">播放：從 30 天倒數到 0</button></div></div>
<div class="duo"><div class="of"><h4>內含價值</h4>現在履約能拿到多少。Call＝max(0, 價格 − 履約價)。價外選擇權的內含價值是 0。</div>
<div class="op"><h4>時間價值</h4>權利金 − 內含價值。離到期越久、波動越大，時間價值越高。</div>
<div class="neg"><h4>${T("Theta", "時間每過一天，選擇權價值減少多少。買方每天付、賣方每天收。")}</h4>每天流失的時間價值。價平的選擇權流失最多，而且越接近到期流失越快。</div></div>`,
    quiz: [
      { q: "價格 26,800，履約價 27,000 的 Call 權利金是 120 點。時間價值是多少？", o: [["120 點，全部都是時間價值", true, "這是價外 Call，內含價值是 0，所以權利金全部是時間價值。"], ["0 點", false, "內含價值才是 0。"], ["200 點", false, "200 是價格和履約價的差，Call 價外時沒有內含價值。"]] },
      { q: "同一個價平選擇權，哪一段時間的時間價值流失最快？", o: [["剛上市、離到期 30 天時", false, "那時每天流失得比較慢。"], ["最後幾天", true, "時間價值大約和 √剩餘時間 成正比，越接近 0 掉得越快。這也是 0DTE 波動劇烈的原因之一。"], ["每天都一樣", false, "不是直線，是越到後面越陡。"]] }],
    remember: "<b>權利金＝內含價值＋時間價值。</b>時間價值每天流失，最後幾天流失最快。",
    mount(root) {
      const svg = $(root, "#p2-svg"), K = 27000, iv = 0.2, xs = range(26300, 27700, 70);
      function draw() {
        const d = +$(root, "#p2-d").value, F = +$(root, "#p2-f").value;
        $(root, "#p2-d-v").textContent = d === 0 ? "到期" : nf(d, d % 1 ? 2 : 0) + " 天"; $(root, "#p2-f-v").textContent = nf(F);
        const val = (f, dd) => (dd <= 0 ? Math.max(0, f - K) : B(f, K, iv, dd).call);
        const ref30 = xs.map((f) => val(f, 30)), cur = xs.map((f) => val(f, d)), intr = xs.map((f) => Math.max(0, f - K));
        const v = val(F, d), iv0 = Math.max(0, F - K), th = d > 0 ? val(F, Math.max(0, d - 1)) - v : 0;
        plot(svg, { xs, ylo: 0, yhi: Math.max(...ref30) * 1.05, ylab: "Call 價值（點）", series: [{ ys: intr, col: "var(--ink-3)", w: 2 }, { ys: ref30, col: "var(--buy)", w: 1.4, dash: "4 4" }, { ys: cur, col: "var(--buy)", w: 2.6 }],
          over: (X, Y) => `<line x1="${X(F)}" x2="${X(F)}" y1="${Y(v)}" y2="${Y(iv0)}" style="stroke:var(--gamma);stroke-width:5;opacity:.7"/><circle cx="${X(F)}" cy="${Y(v)}" r="5" style="fill:var(--buy);stroke:var(--surface);stroke-width:2"/><text x="${X(K) + 6}" y="${Y(0) - 6}">履約價 27,000</text>` });
        $(root, "#p2-side").innerHTML = `<div class="kpi"><div class="k-l">權利金</div><div class="k-v">${nf(v, 1)} 點</div><div class="k-n">＝ $${nf(v * MULT)}／口</div></div>
          <div class="kpi" style="margin-top:6px"><div class="k-l">內含價值＋時間價值</div><div class="k-v" style="font-size:16px">${nf(iv0, 1)} ＋ <span style="color:var(--gamma-ink)">${nf(v - iv0, 1)}</span></div><div class="k-n">青綠色豎線＝時間價值；藍色虛線＝30 天時的曲線</div></div>
          <div class="kpi" style="margin-top:6px"><div class="k-l">再過一天會流失（Theta）</div><div class="k-v" style="font-size:16px">${d > 0 ? sgn(th, 1) + " 點" : "已到期"}</div></div>`;
      }
      let playing = false;
      const lp = loop(svg, (dt) => { if (!playing) return; const el = $(root, "#p2-d"); el.value = Math.max(0, +el.value - dt / 160); draw(); if (+el.value <= 0) playing = false; });
      $(root, "#p2-play").addEventListener("click", () => { $(root, "#p2-d").value = 30; playing = !RM; if (RM) $(root, "#p2-d").value = 0; draw(); });
      ["#p2-d", "#p2-f"].forEach((k) => $(root, k).addEventListener("input", () => { playing = false; draw(); }));
      draw(); void lp;
    }
  });

  /* ---------- 3. delta & gamma ---------- */
  PAGES["op-3"] = lesson(C, "op-3", {
    lede: "Delta 是選擇權的「速度」：期貨動 1 點，選擇權動幾點，也可以看成它相當於幾口期貨。Gamma 是「加速度」：期貨動 1 點，Delta 變多少。市商最在乎的就是 Gamma。",
    pre: "p3-",
    body: `<div class="scene"><div class="scene-h"><h3>拖價格、改到期天數，看 Delta 和 Gamma 怎麼變</h3><p class="small">Call，履約價 27,000，IV 20%。上圖 Delta，下圖 Gamma。</p></div>
<div class="scene-grid"><div><svg id="p3-d" viewBox="0 0 520 200" role="img" aria-label="Delta 曲線"></svg><svg id="p3-g" viewBox="0 0 520 200" role="img" aria-label="Gamma 曲線"></svg></div><div class="side" id="p3-side"></div></div>
<div class="controls" style="margin-top:10px">
<div class="ctl"><label for="p3-f">現在價格 <b id="p3-f-v"></b></label><input id="p3-f" type="range" min="26400" max="27600" step="10" value="27000"></div>
<div class="ctl"><label for="p3-t">距離到期 <b id="p3-t-v"></b></label><input id="p3-t" type="range" min="0.5" max="30" step="0.5" value="7"></div></div></div>
<div class="duo"><div class="of"><h4>Delta＝相當於幾口期貨</h4>Call 在 0～1 之間，Put 在 −1～0。價平約 0.5。深價內接近 1（幾乎就是一口期貨），深價外接近 0。</div>
<div class="op"><h4>Gamma＝Delta 變多快</h4>價平最大、深價內外很小。越接近到期，價平的 Gamma 越尖。Gamma 大，代表價格一動，市商就要大量調整對沖。</div></div>`,
    quiz: [
      { q: "一口 Call 的 Delta 是 0.4。期貨漲 100 點，這口 Call 大約漲多少？", o: [["約 40 點", true, "Delta 0.4 ≈ 期貨動 1 點，Call 動 0.4 點。（實際會因 Gamma 讓 Delta 變大，所以會稍多一點。）"], ["約 100 點", false, "那是 Delta＝1 的情況，例如期貨本身。"], ["約 4 點", false, "差了 10 倍。"]] },
      { q: "什麼情況下 Gamma 最大？", o: [["深價內、離到期很久", false, "深價內的 Delta 已經接近 1，變化很小。"], ["價平、快到期", true, "價平時 Delta 最容易被價格推動，到期前尤其劇烈。這就是到期日附近對沖流特別大的原因（第 7 關）。"], ["深價外、快到期", false, "深價外快到期時 Delta 幾乎固定在 0。"]] }],
    remember: "<b>Delta＝速度（相當於幾口期貨），Gamma＝加速度。</b>價平、快到期時 Gamma 最大，市商調整得最兇。",
    mount(root) {
      const K = 27000, iv = 0.2, xs = range(26300, 27700, 70);
      function draw() {
        const F = +$(root, "#p3-f").value, d = +$(root, "#p3-t").value; $(root, "#p3-f-v").textContent = nf(F); $(root, "#p3-t-v").textContent = nf(d, d % 1 ? 1 : 0) + " 天";
        const g = B(F, K, iv, d), mark = (val, f) => (X, Y) => `<line x1="${X(F)}" x2="${X(F)}" y1="14" y2="${Y(0)}" style="stroke:var(--ink-3);stroke-dasharray:3 4"/><circle cx="${X(F)}" cy="${Y(val)}" r="5.5" style="fill:var(--buy);stroke:var(--surface);stroke-width:2"/><text x="${X(F) + 8}" y="${Y(val) - 8}" style="fill:var(--ink);font-weight:600">${f}</text>`;
        plot($(root, "#p3-d"), { xs, H: 200, ylo: 0, yhi: 1, ylab: "Call Delta", fy: (v) => nf(v, 2), series: [{ ys: xs.map((f) => B(f, K, iv, 30).callDelta), col: "var(--ink-3)", w: 1.3, dash: "4 4" }, { ys: xs.map((f) => B(f, K, iv, d).callDelta), col: "var(--buy)" }], over: mark(g.callDelta, nf(g.callDelta, 2)) });
        const gs = xs.map((f) => B(f, K, iv, d).gamma * 1000);
        plot($(root, "#p3-g"), { xs, H: 200, ylo: 0, yhi: Math.max(1.2, ...gs) * 1.05, ylab: "Gamma（每 1,000 點）", fy: (v) => nf(v, 1), series: [{ ys: xs.map((f) => B(f, K, iv, 30).gamma * 1000), col: "var(--ink-3)", w: 1.3, dash: "4 4" }, { ys: gs, col: "var(--gamma)" }], over: mark(g.gamma * 1000, nf(g.gamma * 1000, 2)) });
        const nd = B(F + 100, K, iv, d).callDelta;
        $(root, "#p3-side").innerHTML = `<div class="kpi"><div class="k-l">Delta</div><div class="k-v">${nf(g.callDelta, 2)}</div><div class="k-n">1 口 Call ≈ ${nf(g.callDelta, 2)} 口期貨</div></div>
          <div class="kpi" style="margin-top:6px"><div class="k-l">如果期貨再漲 100 點</div><div class="k-v" style="font-size:16px">Delta → ${nf(nd, 2)}</div><div class="k-n">變化 ${sgn(nd - g.callDelta, 2)}（這就是 Gamma 的作用）</div></div>
          <p class="small" style="margin:8px 0 0">灰色虛線是 30 天到期時的樣子。把「距離到期」拉到 1 天以下，看 Gamma 變得多尖。</p>`;
      }
      ["#p3-f", "#p3-t"].forEach((k) => $(root, k).addEventListener("input", draw)); draw();
    }
  });

  /* ---------- 4. IV & vega ---------- */
  PAGES["op-4"] = lesson(C, "op-4", {
    lede: "權利金裡最看不見的一塊是隱含波動率（IV）：市場預期未來會波動多大。預期越大，權利金越貴。重大事件前 IV 被推高，事件一過就會塌下來。",
    pre: "p4-",
    body: `<div class="scene"><div class="scene-h"><h3>同一個 Call，只改 IV</h3><p class="small">價平 Call，履約價 27,000，距離到期 7 天。</p></div>
<div class="scene-grid"><svg id="p4-svg" viewBox="0 0 520 260" role="img" aria-label="權利金與 IV 的關係"></svg><div class="side" id="p4-side"></div></div>
<div class="controls" style="margin-top:10px"><div class="ctl"><label for="p4-iv">隱含波動率 IV <b id="p4-iv-v"></b></label><input id="p4-iv" type="range" min="10" max="60" value="20"></div></div></div>

<div class="scene"><div class="scene-h"><h3>IV Crush：方向猜對了，為什麼還虧錢？</h3><p class="small">財報（或 CPI、FOMC）前一天買進價平 Call。事件公布後價格上漲，但 IV 從高檔掉下來。</p></div>
<div class="controls"><div class="ctl"><label for="p4-ivb">事件前 IV <b id="p4-ivb-v"></b></label><input id="p4-ivb" type="range" min="20" max="70" value="45"></div>
<div class="ctl"><label for="p4-iva">事件後 IV <b id="p4-iva-v"></b></label><input id="p4-iva" type="range" min="10" max="40" value="22"></div>
<div class="ctl"><label for="p4-mv">事件後價格變動 <b id="p4-mv-v"></b></label><input id="p4-mv" type="range" min="-3" max="3" step="0.25" value="0.75"></div></div>
<div class="kpis" id="p4-crush"></div></div>
<div class="prose"><p>${T("Vega", "IV 每變動 1 個百分點，選擇權價值變多少。")}告訴你 IV 動 1 點，權利金動多少。IV 也是第 3 關「預期波動」公式裡的那個 IV：價格 × IV × √(天數÷365)。</p></div>`,
    quiz: [
      { q: "其他條件不變，IV 從 20% 升到 30%，價平 Call 的權利金會？", o: [["變貴", true, "市場預期波動更大，價格跑到價內的機會更高，權利金就更貴。"], ["變便宜", false, "方向反了。"], ["不變，IV 只影響 Put", false, "IV 對 Call 和 Put 的影響方向相同。"]] },
      { q: "財報前買價平 Call，公布後價格上漲 0.5%，但 Call 反而虧錢。最可能的原因？", o: [["Delta 是負的", false, "Call 的 Delta 是正的。"], ["IV Crush：事件過後 IV 大跌，時間價值縮水的幅度超過價格上漲帶來的獲利", true, "事件前的高 IV 已經把「會大漲大跌」算進權利金。漲得不夠多，就付了太貴的保費。"], ["Gamma 太小", false, "價平 Call 的 Gamma 不小，問題在 IV。"]] }],
    remember: "<b>IV＝市場預期的波動，越高權利金越貴。</b>事件前買選擇權，要漲得比市場預期還多才會賺。",
    mount(root) {
      const K = 27000, F = 27000, xs = range(10, 60, 50);
      function draw() {
        const iv = +$(root, "#p4-iv").value; $(root, "#p4-iv-v").textContent = iv + "%";
        const ys = xs.map((v) => B(F, K, v / 100, 7).call), cur = B(F, K, iv / 100, 7);
        plot($(root, "#p4-svg"), { xs, ylab: "權利金（點）", fx: (v) => v + "%", ylo: 0, series: [{ ys, col: "var(--buy)" }],
          over: (X, Y) => `<circle cx="${X(iv)}" cy="${Y(cur.call)}" r="6" style="fill:var(--buy);stroke:var(--surface);stroke-width:2"/><text x="${X(iv) + 8}" y="${Y(cur.call) - 8}" style="fill:var(--ink);font-weight:600">${nf(cur.call)} 點</text>` });
        const em = F * (iv / 100) * Math.sqrt(1 / 365);
        $(root, "#p4-side").innerHTML = `<div class="kpi"><div class="k-l">權利金</div><div class="k-v">${nf(cur.call, 1)} 點</div><div class="k-n">$${nf(cur.call * MULT)}／口</div></div>
          <div class="kpi" style="margin-top:6px"><div class="k-l">Vega（IV 每 +1 點）</div><div class="k-v" style="font-size:16px">${sgn(cur.vega, 1)} 點</div></div>
          <div class="kpi" style="margin-top:6px"><div class="k-l">這個 IV 代表的單日預期波動</div><div class="k-v" style="font-size:16px">±${nf(em)} 點</div></div>`;
        const ivb = +$(root, "#p4-ivb").value, iva = +$(root, "#p4-iva").value, mv = +$(root, "#p4-mv").value;
        $(root, "#p4-ivb-v").textContent = ivb + "%"; $(root, "#p4-iva-v").textContent = iva + "%"; $(root, "#p4-mv-v").textContent = sgn(mv, 2) + "%";
        const F2 = F * (1 + mv / 100), before = B(F, K, ivb / 100, 2).call, after = B(F2, K, iva / 100, 1).call, pnl = after - before;
        const priceOnly = B(F2, K, ivb / 100, 1).call - before;
        $(root, "#p4-crush").innerHTML = `<div class="kpi"><div class="k-l">事件前買進</div><div class="k-v">${nf(before)} 點</div><div class="k-n">IV ${ivb}%，剩 2 天</div></div>
          <div class="kpi"><div class="k-l">事件後價值</div><div class="k-v">${nf(after)} 點</div><div class="k-n">價格 ${nf(F2)}、IV ${iva}%</div></div>
          <div class="kpi"><div class="k-l">損益</div><div class="k-v" style="color:${pnl >= 0 ? "var(--gamma-ink)" : "var(--sell-ink)"}">${sgn(pnl)} 點</div><div class="k-n">${sgn(pnl * MULT)} 美元／口</div></div>
          <div class="kpi"><div class="k-l">如果 IV 沒掉</div><div class="k-v">${sgn(priceOnly)} 點</div><div class="k-n">差距就是 IV Crush 吃掉的</div></div>`;
      }
      ["#p4-iv", "#p4-ivb", "#p4-iva", "#p4-mv"].forEach((k) => $(root, k).addEventListener("input", draw)); draw();
    }
  });

  /* ---------- 5. dealer ledger ---------- */
  const LED_PATH = [27000, 27200, 27350, 27100, 26800];
  PAGES["op-5"] = lesson(C, "op-5", {
    lede: "第 2 關的「彈簧」和「雪球」，到底是怎麼來的？這一關跟著一本市商的帳本，一步一步算出他要買賣幾口期貨。",
    pre: "p5-",
    body: `<div class="scene"><div class="scene-h"><h3>市商帳本：客戶交易 1,000 口價平 Call</h3><p class="small">履約價 27,000，IV 20%，7 天到期。市商的目標只有一個：讓總 Delta 維持在 0。</p></div>
<div class="tabs" id="p5-who"><button class="tab" data-k="buy" aria-selected="true" type="button">客戶「買」Call（市商賣出，負 Gamma）</button><button class="tab" data-k="sell" aria-selected="false" type="button">客戶「賣」Call（市商買進，正 Gamma）</button></div>
<div class="scene-grid"><svg id="p5-svg" viewBox="0 0 460 250" role="img" aria-label="價格路徑與市商對沖動作"></svg><div class="side" id="p5-side"></div></div>
<div class="btn-row"><button class="btn" id="p5-prev" type="button">上一步</button><button class="btn primary" id="p5-next" type="button">下一步</button><span class="small" id="p5-n"></span></div>
<div class="table-wrap" style="margin-top:10px"><table><thead><tr><th>步驟</th><th class="num">期貨價格</th><th class="num">Call Delta</th><th class="num">選擇權部位 Delta</th><th class="num">對沖動作</th><th class="num">累計期貨部位</th></tr></thead><tbody id="p5-led"></tbody></table></div></div>
<div class="prose"><p>重點在「對沖動作」那一欄的方向：客戶買 Call 時，市商<b>漲了買、跌了賣</b>，和價格同方向，會放大波動（雪球）；客戶賣 Call 時，市商<b>漲了賣、跌了買</b>，會壓低波動（彈簧）。淨 GEX 就是在估計：全市場加總起來，市商比較像哪一種。</p></div>`,
    quiz: [
      { q: "市商賣出 1,000 口 Call，Delta 0.5。他一開始要怎麼對沖？", o: [["買進 500 口期貨", true, "賣 Call 的部位 Delta ＝ −1,000 × 0.5 ＝ −500，買 500 口期貨讓總 Delta 回到 0。"], ["賣出 500 口期貨", false, "賣 Call 已經是偏空的部位，再賣期貨會更偏空。"], ["買進 1,000 口期貨", false, "要看 Delta，不是看口數。"]] },
      { q: "市商手上是負 Gamma（賣了很多選擇權）。價格下跌時他會？", o: [["買進期貨，撐住價格", false, "那是正 Gamma 的行為。"], ["賣出期貨，讓跌勢加速", true, "負 Gamma 的對沖方向和價格同向：跌了要賣、漲了要買。"], ["什麼都不做", false, "Delta 變了就必須調整。"]] }],
    remember: "<b>市商只想 Delta＝0。</b>賣了選擇權（負 Gamma）就得追價對沖，買了選擇權（正 Gamma）就是逆勢對沖。",
    mount(root) {
      let who = "buy", st = 0; const K = 27000, N = 1000, iv = 0.2;
      function rows() {
        const sign = who === "buy" ? -1 : 1; let fut = 0;
        return LED_PATH.map((F, i) => { const d = B(F, K, iv, 7 - i * 0.5).callDelta, opt = sign * N * d, need = -opt - fut; fut += need; return { i, F, d, opt, need, fut }; });
      }
      function draw() {
        const R = rows(), cur = R[st];
        $(root, "#p5-led").innerHTML = R.slice(0, st + 1).map((r) => `<tr><td>${r.i === 0 ? "開始" : "第 " + r.i + " 步"}</td><td class="num">${nf(r.F)}</td><td class="num">${nf(r.d, 2)}</td><td class="num">${sgn(Math.round(r.opt))}</td><td class="num" style="color:${r.need > 0 ? "var(--buy-ink)" : "var(--sell-ink)"};font-weight:600">${r.need > 0 ? "買進" : "賣出"} ${nf(Math.abs(Math.round(r.need)))} 口</td><td class="num">${sgn(Math.round(r.fut))}</td></tr>`).join("");
        const X = (i) => 74 + i * 90, Y = (p) => 30 + (27450 - p) * 0.26;
        $(root, "#p5-svg").innerHTML = `${[27400, 27200, 27000, 26800].map((p) => `<line x1="56" x2="450" y1="${Y(p)}" y2="${Y(p)}" style="stroke:var(--line)"/><text x="50" y="${Y(p) + 4}" text-anchor="end">${nf(p)}</text>`).join("")}
          <polyline fill="none" style="stroke:var(--ink-2);stroke-width:2.2" points="${R.slice(0, st + 1).map((r) => `${X(r.i)},${Y(r.F)}`).join(" ")}"/>
          ${R.slice(0, st + 1).map((r) => { const up = r.need > 0, len = Math.min(40, 8 + Math.abs(r.need) / 12); return `<circle cx="${X(r.i)}" cy="${Y(r.F)}" r="5" style="fill:var(--ink)"/>
            <path d="M${X(r.i) + 14} ${Y(r.F) + (up ? len / 2 : -len / 2)} v${up ? -len : len} m-5 ${up ? 6 : -6} l5 ${up ? -6 : 6} l5 ${up ? 6 : -6}" fill="none" style="stroke:${up ? "var(--buy)" : "var(--sell)"};stroke-width:2.5"/>
            <text x="${X(r.i) + 22}" y="${Y(r.F) + 4}" style="fill:${up ? "var(--buy-ink)" : "var(--sell-ink)"};font-weight:600">${up ? "買" : "賣"} ${nf(Math.abs(Math.round(r.need)))}</text>`; }).join("")}`;
        const prev = R[st - 1], dir = prev ? (cur.F > prev.F ? "漲" : "跌") : null, same = prev ? (cur.F > prev.F) === (cur.need > 0) : null;
        $(root, "#p5-side").innerHTML = st === 0 ? `<h4>開始</h4><p style="margin:0">客戶${who === "buy" ? "買進" : "賣出"} 1,000 口 Call。市商站在對面，選擇權部位 Delta ＝ ${sgn(Math.round(cur.opt))}。為了歸零，他${cur.need > 0 ? "買進" : "賣出"} ${nf(Math.abs(Math.round(cur.need)))} 口期貨。</p>` :
          `<h4>價格${dir}到 ${nf(cur.F)}</h4><p style="margin:0 0 8px">Call Delta 從 ${nf(prev.d, 2)} 變成 ${nf(cur.d, 2)}（這就是 Gamma）。選擇權部位 Delta 變成 ${sgn(Math.round(cur.opt))}，市商要<b>${cur.need > 0 ? "買進" : "賣出"} ${nf(Math.abs(Math.round(cur.need)))} 口</b>。</p>
          <p class="${same ? "warn-t" : "ok-t"}" style="margin:0">${same ? `價格${dir}、市商也跟著${cur.need > 0 ? "買" : "賣"}：同方向，<b>放大波動（雪球）</b>。` : `價格${dir}、市商反向${cur.need > 0 ? "買" : "賣"}：<b>壓低波動（彈簧）</b>。`}</p>`;
        $(root, "#p5-n").textContent = `第 ${st + 1} / ${LED_PATH.length} 步`;
      }
      $(root, "#p5-next").addEventListener("click", () => { st = Math.min(LED_PATH.length - 1, st + 1); draw(); });
      $(root, "#p5-prev").addEventListener("click", () => { st = Math.max(0, st - 1); draw(); });
      $(root, "#p5-who").addEventListener("click", (e) => { const b = e.target.closest(".tab"); if (!b) return; who = b.dataset.k; root.querySelectorAll("#p5-who .tab").forEach((x) => x.setAttribute("aria-selected", String(x === b))); draw(); });
      draw();
    }
  });

  /* ---------- 6. OI -> GEX ---------- */
  const CHAIN = [[26600, 800, 5200], [26700, 900, 7800], [26800, 1500, 6100], [26900, 2600, 4800], [27000, 5200, 4200], [27100, 4100, 2300], [27200, 5600, 1600], [27300, 7400, 1100], [27400, 3800, 700]];
  PAGES["op-6"] = lesson(C, "op-6", {
    lede: "Call Wall、Put Wall、Flip 不是神秘指標，是用選擇權鏈的未平倉量（OI）算出來的。這關把公式拆開，你可以直接改 OI，看牆怎麼移動。",
    pre: "p6-",
    body: `<div class="scene"><div class="scene-h"><h3>選擇權鏈 → 每個履約價的 GEX</h3><p class="small">示意數字：NQ 27,000，IV 20%，7 天到期。點表格裡的數字可以直接改。</p></div>
<div class="scene-grid"><div class="table-wrap" style="margin:0"><table id="p6-tab"><thead><tr><th>履約價</th><th class="num">Call OI</th><th class="num">Put OI</th><th class="num">淨 GEX（百萬美元）</th></tr></thead><tbody></tbody></table></div><svg id="p6-bars" viewBox="0 0 300 330" role="img" aria-label="各履約價的淨 GEX"></svg></div>
<div class="note-box" style="margin-top:12px">每個履約價：<b>GEX ＝ Gamma × OI × 20（每點價值）× 價格² × 1%</b>。Call 算正、Put 算負，加總就是淨 GEX。意思是「價格動 1% 時，市商要買賣多少美元的期貨」。</div></div>

<div class="scene"><div class="scene-h"><h3>Flip 怎麼找：假設價格在不同位置，重算總 GEX</h3><p class="small">按播放，看掃描線從左掃到右，找總 GEX 由負轉正的地方。</p></div>
<div class="scene-grid"><svg id="p6-flip" viewBox="0 0 520 250" role="img" aria-label="不同價格下的總 GEX"></svg><div class="side" id="p6-side"></div></div>
<div class="btn-row"><button class="btn primary" id="p6-scan" type="button">播放掃描</button></div></div>
<div class="honest"><b class="h-h">最重要的假設：</b>這套算法假設<b>市商買 Call、賣 Put</b>（也就是客戶多半賣 Call、買 Put 當保險）。如果某段時間客戶大量買 Call，市商其實是負 Gamma，Call 那邊的正號就算錯了。公開的 OI 看不出誰買誰賣，所以 GEX 只是估計，不是市商的真實部位。</div>`,
    quiz: [
      { q: "在標準 GEX 算法裡，Put 的 Gamma 為什麼算成負的？", o: [["因為 Put 的 Gamma 本身是負數", false, "買進的 Put 和 Call 一樣，Gamma 都是正的。"], ["因為假設市商是 Put 的賣方，賣出選擇權就是負 Gamma", true, "符號來自「市商站哪一邊」的假設，不是 Put 本身的性質。"], ["因為 Put 看跌", false, "看跌是 Delta 的方向，跟 Gamma 的正負無關。"]] },
      { q: "把 27,300 的 Call OI 大幅增加，最可能發生什麼？", o: [["Call Wall 移到或留在 27,300，Flip 往下移", true, "那個履約價的正 GEX 變大。總 GEX 更偏正，變號的位置會往下。可以在上面改數字驗證。"], ["Put Wall 移到 27,300", false, "Put Wall 看的是負 GEX 最大的地方。"], ["什麼都不變", false, "GEX 就是用 OI 算的，OI 變了一定會變。"]] }],
    remember: "<b>GEX ＝ Gamma × OI × 每點價值 × 價格² × 1%。</b>牆是最大的長條，Flip 是總 GEX 變號的價位，全部建立在「市商買 Call、賣 Put」的假設上。",
    mount(root) {
      const F0 = 27000, iv = 0.2, days = 7;
      const gex = (F, K, oi, sign) => (sign * B(F, K, iv, days).gamma * oi * MULT * F * F * 0.01) / 1e6;
      const net = (F) => CHAIN.reduce((s, [K, c, p]) => s + gex(F, K, c, 1) + gex(F, K, p, -1), 0);
      let scan = 1, scanning = false;
      function draw() {
        const per = CHAIN.map(([K, c, p]) => ({ K, c, p, g: gex(F0, K, c, 1) + gex(F0, K, p, -1) }));
        const cw = per.reduce((a, b) => (b.g > a.g ? b : a)), pw = per.reduce((a, b) => (b.g < a.g ? b : a));
        $(root, "#p6-tab tbody").innerHTML = per.map((r, i) => `<tr><td>${nf(r.K)}${r === cw ? ' <span class="chip gamma">Call Wall</span>' : r === pw ? ' <span class="chip sell">Put Wall</span>' : ""}</td>
          <td class="num"><input type="number" step="100" min="0" value="${r.c}" data-i="${i}" data-c="1" aria-label="${r.K} Call OI" style="width:80px;text-align:right;padding:2px 6px;border:1px solid var(--line);border-radius:4px;background:var(--bg)"></td>
          <td class="num"><input type="number" step="100" min="0" value="${r.p}" data-i="${i}" data-c="2" aria-label="${r.K} Put OI" style="width:80px;text-align:right;padding:2px 6px;border:1px solid var(--line);border-radius:4px;background:var(--bg)"></td>
          <td class="num" style="color:${r.g >= 0 ? "var(--gamma-ink)" : "var(--sell-ink)"};font-weight:600">${sgn(r.g, 1)}</td></tr>`).join("");
        const mx = Math.max(...per.map((r) => Math.abs(r.g)), 1), cx = 176, sx = 115 / mx, Yb = (i) => 18 + i * 34;
        $(root, "#p6-bars").innerHTML = `<line x1="${cx}" x2="${cx}" y1="6" y2="324" style="stroke:var(--ink-3)"/>` + per.slice().reverse().map((r, j) => { const w = Math.abs(r.g) * sx;
          return `<text x="27" y="${Yb(j) + 15}" text-anchor="middle" style="font-size:11px">${nf(r.K)}</text><rect x="${r.g >= 0 ? cx : cx - w}" y="${Yb(j)}" width="${Math.max(1, w)}" height="22" rx="3" style="fill:${r.g >= 0 ? "var(--gamma)" : "var(--sell)"};opacity:${r === cw || r === pw ? 1 : 0.55}"/>`; }).join("")
          + `<text x="${cx + 4}" y="12" style="font-size:11px;fill:var(--gamma-ink)">正 →</text><text x="${cx - 4}" y="12" text-anchor="end" style="font-size:11px;fill:var(--sell-ink)">← 負</text>`;
        const xs = range(26300, 27700, 70), ys = xs.map(net);
        let flip = null; for (let i = 1; i < xs.length; i++) if ((ys[i - 1] < 0) !== (ys[i] < 0)) { flip = xs[i - 1] + ((xs[i] - xs[i - 1]) * -ys[i - 1]) / (ys[i] - ys[i - 1]); break; }
        const sx2 = 26300 + (27700 - 26300) * scan, nAtScan = net(sx2);
        plot($(root, "#p6-flip"), { xs, ylab: "總 GEX（百萬美元）", fy: (v) => sgn(v), series: [{ ys: ys.slice(0, Math.max(1, xs.findIndex((x) => x > sx2) < 0 ? xs.length : xs.findIndex((x) => x > sx2))), col: "var(--ink)" }],
          yExtra: ys,
          under: (X, Y) => `<polyline fill="none" style="stroke:var(--line);stroke-width:1.5" points="${ys.map((v, i) => `${X(xs[i])},${Y(v)}`).join(" ")}"/><line x1="${X(F0)}" x2="${X(F0)}" y1="14" y2="${Y(Math.min(...ys))}" style="stroke:var(--buy);stroke-dasharray:3 4"/><text x="${X(F0) + 4}" y="24" style="fill:var(--buy-ink)">現價 27,000</text>`,
          over: (X, Y) => `<line x1="${X(sx2)}" x2="${X(sx2)}" y1="14" y2="226" style="stroke:var(--ink-2)"/><circle cx="${X(sx2)}" cy="${Y(nAtScan)}" r="5" style="fill:${nAtScan >= 0 ? "var(--gamma)" : "var(--sell)"}"/>${flip && sx2 >= flip ? `<circle cx="${X(flip)}" cy="${Y(0)}" r="6" style="fill:none;stroke:var(--gamma-ink);stroke-width:2.5"/><text x="${X(flip) + 8}" y="${Y(0) + 16}" style="fill:var(--gamma-ink);font-weight:600">Flip ≈ ${nf(flip)}</text>` : ""}` });
        $(root, "#p6-side").innerHTML = `<div class="kpi"><div class="k-l">掃描到價格 ${nf(sx2)} 時的總 GEX</div><div class="k-v" style="color:${nAtScan >= 0 ? "var(--gamma-ink)" : "var(--sell-ink)"}">${sgn(nAtScan, 1)}M</div></div>
          <div class="kpi" style="margin-top:6px"><div class="k-l">Call Wall ／ Put Wall</div><div class="k-v" style="font-size:16px">${nf(cw.K)} ／ ${nf(pw.K)}</div></div>
          <div class="kpi" style="margin-top:6px"><div class="k-l">Flip</div><div class="k-v" style="font-size:16px">${flip ? "≈ " + nf(flip) : "範圍內沒有變號"}</div><div class="k-n">現價 27,000 時總 GEX ${sgn(net(F0), 1)}M：${net(F0) >= 0 ? "彈簧" : "雪球"}</div></div>`;
      }
      $(root, "#p6-tab").addEventListener("change", (e) => { const t = e.target; if (!t.dataset.i) return; CHAIN[+t.dataset.i][+t.dataset.c] = Math.max(0, +t.value || 0); draw(); });
      const lp = loop($(root, "#p6-flip"), (dt) => { if (scanning) { scan = Math.min(1, scan + dt / 4000); if (scan >= 1) scanning = false; draw(); } });
      $(root, "#p6-scan").addEventListener("click", () => { scan = RM ? 1 : 0; scanning = !RM; draw(); });
      draw(); void lp;
    }
  });

  /* ---------- 7. expiry ---------- */
  const WEEK = [[26800, 300, 2600], [26900, 600, 2000], [27000, 9000, 1500], [27100, 1200, 500], [27200, 1000, 300]];
  const MONTH = [[26600, 400, 4800], [26800, 900, 4200], [27000, 2600, 2200], [27200, 3400, 900], [27400, 4000, 400]];
  PAGES["op-7"] = lesson(C, "op-7", {
    lede: "Gamma 不是固定的。越接近到期，價平附近的 Gamma 越集中、越尖；到期一過，那批選擇權的 Gamma 直接歸零，關鍵區也跟著重畫。",
    pre: "p7-",
    body: `<div class="scene"><div class="scene-h"><h3>Gamma 隨到期日變尖</h3><p class="small">同一個履約價 27,000 的選擇權，不同剩餘天數的 Gamma。</p></div>
<svg id="p7-g" viewBox="0 0 760 260" role="img" aria-label="不同到期天數的 Gamma 曲線"></svg>
<div class="legend" id="p7-leg"></div></div>
<div class="scene"><div class="scene-h"><h3>結算之後：牆為什麼會不見？</h3><p class="small">市場上同時有週選擇權和月選擇權。週選擇權結算後，它的 OI 就不存在了。</p></div>
<div class="tabs" id="p7-tabs"><button class="tab" data-k="before" aria-selected="true" type="button">結算前（週＋月）</button><button class="tab" data-k="after" aria-selected="false" type="button">週選擇權結算後（只剩月）</button></div>
<div class="scene-grid"><svg id="p7-bars" viewBox="0 0 460 260" role="img" aria-label="結算前後的 GEX"></svg><div class="side" id="p7-side"></div></div></div>
<div class="duo">
<div class="op"><h4>0DTE</h4>當天到期的選擇權。Gamma 非常集中，價平附近的對沖流可能很大，也讓日內的關鍵區比較靠近現價。</div>
<div class="op"><h4>釘住（Pinning）<span class="ev ev-C" style="margin-left:6px">有爭議</span></h4>到期前價格被吸在大 OI 履約價附近的現象。常見的解釋是正 Gamma 對沖，但學術研究的結論不一致，不能當規則。</div>
<div class="of"><h4>${T("Charm", "時間經過時，Delta 自己會變。到期前價外選擇權的 Delta 會往 0 靠，市商因此需要調整。")}與 ${T("Vanna", "IV 變動時，Delta 會變多少。IV 大跌時（例如事件後），市商的對沖也會跟著調整。")}</h4>就算價格不動，時間流逝（Charm）和 IV 變化（Vanna）也會讓 Delta 改變，帶來對沖流。進階概念，先知道有就好。</div></div>
<div class="honest"><b class="h-h">對每天流程的意義：</b>GEX 紀錄每天更新一次。遇到週選擇權結算（尤其是每月第三個週五的大結算），前一天算出的牆可能隔天就不在了，要重新抓資料，不要沿用。</div>`,
    quiz: [
      { q: "價平選擇權的 Gamma，隨著到期日接近會怎樣？", o: [["越來越小", false, "價平的 Gamma 是越來越大。"], ["越來越大、越來越集中在履約價附近", true, "這也是為什麼到期日附近的對沖流和日內波動特別值得注意。"], ["不變", false, "Gamma 和剩餘時間有關。"]] },
      { q: "週選擇權結算後，原本最大的那面 Call Wall 消失了。最可能的原因？", o: [["市商撤單", false, "牆是用 OI 算的，跟掛單無關。"], ["那面牆主要來自剛結算的週選擇權，OI 歸零，GEX 就跟著消失", true, "所以結算日前後要重新抓資料。"], ["價格突破了牆", false, "突破不會讓 OI 消失。"]] }],
    remember: "<b>Gamma 會隨時間變尖，結算後會歸零。</b>關鍵區每天都要重算，結算日前後尤其不能沿用舊的。",
    mount(root) {
      const xs = range(26400, 27600, 80), K = 27000, iv = 0.2, D = [[30, "var(--ink-3)", "30 天"], [7, "var(--buy)", "7 天"], [1, "var(--gamma)", "1 天"], [0.25, "var(--sell)", "0DTE（剩 6 小時）"]];
      let t = RM ? 1 : 0;
      function dg() {
        const series = D.map(([d, col]) => ({ ys: xs.map((f) => B(f, K, iv, d).gamma * 1000 * Math.min(1, t * 1.2)), col, w: 2.2 }));
        plot($(root, "#p7-g"), { xs, W: 760, H: 260, ylo: 0, yhi: B(K, K, iv, 0.25).gamma * 1000 * 1.08, ylab: "Gamma（每 1,000 點）", fy: (v) => nf(v, 1), series });
      }
      $(root, "#p7-leg").innerHTML = D.map(([, col, l]) => `<span><i style="background:${col}"></i>${l}</span>`).join("");
      const lp = loop($(root, "#p7-g"), (dt) => { if (t < 1) { t = Math.min(1, t + dt / 1500); dg(); } }); dg(); void lp;
      let mode = "before";
      function db() {
        const g = (F, Kk, oi, s, d) => (s * B(F, Kk, iv, d).gamma * oi * MULT * F * F * 0.01) / 1e6;
        const strikes = [26600, 26800, 26900, 27000, 27100, 27200, 27400];
        const calc = (m) => strikes.map((Kk) => { let s = 0; MONTH.filter((r) => r[0] === Kk).forEach(([, c, p]) => (s += g(27000, Kk, c, 1, 25) + g(27000, Kk, p, -1, 25))); if (m === "before") WEEK.filter((r) => r[0] === Kk).forEach(([, c, p]) => (s += g(27000, Kk, c, 1, 1) + g(27000, Kk, p, -1, 1))); return s; });
        const val = calc(mode), mx = Math.max(...calc("before").map(Math.abs)), cx = 250, sx = 140 / mx, Y = (i) => 14 + i * 34, rev = strikes.map((k, i) => [k, val[i]]).reverse();
        const big = rev.reduce((a, b) => (b[1] > a[1] ? b : a)), low = rev.reduce((a, b) => (b[1] < a[1] ? b : a));
        $(root, "#p7-bars").innerHTML = `<line x1="${cx}" x2="${cx}" y1="6" y2="252" style="stroke:var(--ink-3)"/>` + rev.map(([k, v], j) => { const w = Math.abs(v) * sx;
          return `<text x="60" y="${Y(j) + 15}" text-anchor="end">${nf(k)}</text><rect x="${v >= 0 ? cx : cx - w}" y="${Y(j)}" width="${Math.max(1, w)}" height="22" rx="3" style="fill:${v >= 0 ? "var(--gamma)" : "var(--sell)"};opacity:${k === big[0] || k === low[0] ? 1 : 0.5}"/><text x="${v >= 0 ? cx + w + 4 : cx - w - 4}" y="${Y(j) + 15}" text-anchor="${v >= 0 ? "start" : "end"}" style="font-size:11px">${sgn(v, 0)}M</text>`; }).join("");
        $(root, "#p7-side").innerHTML = `<div class="kpi"><div class="k-l">最大正 GEX（Call Wall）</div><div class="k-v" style="font-size:17px">${nf(big[0])}</div></div><div class="kpi" style="margin-top:6px"><div class="k-l">最大負 GEX（Put Wall）</div><div class="k-v" style="font-size:17px">${nf(low[0])}</div></div>
          <p class="small" style="margin:8px 0 0">兩個分頁用同一個比例尺，長條長短可以直接比較。</p><p style="margin:8px 0 0">${mode === "before" ? "結算前，週選擇權快到期，Gamma 很尖，在 27,000 附近疊出一面很高的牆。" : "週選擇權結算後，27,000 那面主要來自週選擇權的牆大幅縮小，牆的位置換到月選擇權決定的地方。"}</p>`;
      }
      $(root, "#p7-tabs").addEventListener("click", (e) => { const b = e.target.closest(".tab"); if (!b) return; mode = b.dataset.k; root.querySelectorAll("#p7-tabs .tab").forEach((x) => x.setAttribute("aria-selected", String(x === b))); db(); });
      db();
    }
  });

  /* ---------- 8. GEX terrain (3D + cross-section) ---------- */
  // Terrain height = minus net GEX: positive GEX sits low (valley), negative GEX sits high (ridge).
  const TER = { lo: 26400, hi: 27600, nx: 160, days: [7, 5, 3, 2, 1.5, 1, 0.75, 0.5, 0.35, 0.25, 0.15, 0.1, 0.06, 0.04], S0: 27000 };
  // Realistic-looking chain: strikes every 25 pts, OI piled on round numbers, calls and puts interleaved, three expiries stacked.
  const REAL = (() => {
    const r = window.COURSE.rng(20261119), out = [];
    const boost = (K) => (K % 500 === 0 ? 7 : K % 250 === 0 ? 4 : K % 100 === 0 ? 2.4 : K % 50 === 0 ? 1.2 : 0.45);
    [[0, 1.0, 0.0035], [7, 0.7, 0.0022], [28, 1.2, 0.0014]].forEach(([extra, size, width]) => {
      for (let K = 26000; K <= 28000; K += 25) {
        const near = 0.3 + Math.exp(-Math.pow((K - 27000) * width, 2)), base = boost(K) * size * near * 1500;
        const callBias = K >= 27000 ? 1 : 0.25 + 0.5 * r(), putBias = K <= 27000 ? 1 : 0.25 + 0.5 * r();
        const c = base * callBias * (0.2 + r() * 1.6), p = base * putBias * (0.2 + r() * 1.6);
        out.push([K, Math.round(c), Math.round(p), extra]);
      }
    });
    return out;
  })();
  function terrain(days, mode) {
    let xs, g;
    if (mode === "strike") {
      // GEX of each strike on its own, at today's price: spiky, follows OI strike by strike
      xs = []; for (let K = TER.lo; K <= TER.hi; K += 25) xs.push(K);
      g = xs.map((K) => REAL.filter((l) => l[0] === K).reduce((s, [, c, p, extra]) => s + (B(TER.S0, K, 0.2, days + extra).gamma * (c - p) * MULT * TER.S0 * TER.S0 * 0.01) / 1e6, 0));
    } else {
      // total GEX if price moved to S: smooth, every strike blurred by its gamma curve
      xs = range(TER.lo, TER.hi, 160);
      g = xs.map((S) => REAL.reduce((s, [K, c, p, extra]) => s + (B(S, K, 0.2, days + extra).gamma * (c - p) * MULT * S * S * 0.01) / 1e6, 0));
    }
    const dx = xs[1] - xs[0], U = g.map((v) => -v), n = xs.length - 1;
    const slope = U.map((u, i) => (U[Math.min(n, i + 1)] - U[Math.max(0, i - 1)]) / ((Math.min(n, i + 1) - Math.max(0, i - 1)) * dx));
    return { xs, g, U, slope, n, smax: Math.max(...slope.map(Math.abs)) || 1 };
  }
  /* height colour + simple lighting for the 3D views. t in [-1,1]: -1 deepest valley, 0 flat, +1 highest mountain. */
  const RAMP = [[-1, [12, 105, 72]], [-0.45, [80, 186, 140]], [0, [222, 227, 233]], [0.45, [243, 156, 116]], [1, [176, 62, 18]]];
  function hcol(t, shade) {
    t = Math.max(-1, Math.min(1, t)); t = Math.sign(t) * Math.pow(Math.abs(t), 0.55); let k = 1; while (k < RAMP.length - 1 && t > RAMP[k][0]) k++;
    const [t0, c0] = RAMP[k - 1], [t1, c1] = RAMP[k], f = (t - t0) / (t1 - t0 || 1);
    return "rgb(" + c0.map((v, i) => Math.round((v + (c1[i] - v) * f) * shade)).join(",") + ")";
  }
  const LIGHT = (() => { const v = [-0.45, -0.55, 0.7], n = Math.hypot(...v); return v.map((x) => x / n); })();
  function lit(w0, w1, w3) { // world corners -> brightness 0.55..1
    const a = [w1[0] - w0[0], w1[1] - w0[1], w1[2] - w0[2]], b = [w3[0] - w0[0], w3[1] - w0[1], w3[2] - w0[2]];
    const n = [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]], m = Math.hypot(...n) || 1;
    return 0.74 + 0.26 * Math.abs((n[0] * LIGHT[0] + n[1] * LIGHT[1] + n[2] * LIGHT[2]) / m);
  }
  const legendH = () => `<div class="legend" style="align-items:center"><span>深谷</span>${[-1, -0.5, 0, 0.5, 1].map((t) => `<i style="background:${hcol(t, 1)};width:22px;height:12px;margin:0"></i>`).join("")}<span>高山</span><span class="small">（綠＝正 GEX，橘＝負 GEX；顏色越深越極端）</span></div>`;
  /* 3-axis camera for the terrain views. x right, y away from viewer, z up; x,y in [-1,1].
     yaw = turn around the vertical axis, pitch = camera height (0 side view, 90 top view), roll = lean. */
  function makeCam(st, cx, cy, S) {
    const a = st.yaw * Math.PI / 180, e = st.pitch * Math.PI / 180, r = st.roll * Math.PI / 180;
    const ca = Math.cos(a), sa = Math.sin(a), ce = Math.cos(e), se = Math.sin(e), cr = Math.cos(r), sr = Math.sin(r);
    return (x, y, z) => {
      const x1 = x * ca - y * sa, y1 = x * sa + y * ca, up = z * ce + y1 * se, depth = y1 * ce - z * se;
      return [cx + (x1 * cr - up * sr) * S, cy - (x1 * sr + up * cr) * S, depth];
    };
  }
  const camHTML = (id, st) => `<div class="controls" style="margin-top:6px">
<div class="ctl"><label for="${id}-yaw">水平旋轉 <b id="${id}-yaw-v"></b></label><input id="${id}-yaw" type="range" min="-180" max="180" value="${st.yaw}"></div>
<div class="ctl"><label for="${id}-pit">俯仰角（0°＝側面，90°＝正上方） <b id="${id}-pit-v"></b></label><input id="${id}-pit" type="range" min="0" max="90" value="${st.pitch}"></div>
<div class="ctl"><label for="${id}-rol">側傾 <b id="${id}-rol-v"></b></label><input id="${id}-rol" type="range" min="-45" max="45" value="${st.roll}"></div></div>`;
  function camWire(root, id, svg, st, redraw) {
    const sync = () => { ["yaw", "pit", "rol"].forEach((k) => { const v = k === "yaw" ? st.yaw : k === "pit" ? st.pitch : st.roll; $(root, `#${id}-${k}`).value = Math.round(v); $(root, `#${id}-${k}-v`).textContent = Math.round(v) + "°"; }); };
    ["yaw", "pit", "rol"].forEach((k) => $(root, `#${id}-${k}`).addEventListener("input", (e) => { const v = +e.target.value; if (k === "yaw") st.yaw = v; else if (k === "pit") st.pitch = v; else st.roll = v; sync(); redraw(); }));
    let d = null;
    svg.addEventListener("pointerdown", (e) => { d = { x: e.clientX, y: e.clientY, yaw: st.yaw, pitch: st.pitch }; svg.setPointerCapture(e.pointerId); svg.style.cursor = "grabbing"; });
    svg.addEventListener("pointermove", (e) => { if (!d) return; st.yaw = ((d.yaw + (e.clientX - d.x) * 0.4 + 540) % 360) - 180; st.pitch = Math.max(0, Math.min(90, d.pitch + (e.clientY - d.y) * 0.3)); sync(); redraw(); });
    const up = () => { d = null; svg.style.cursor = "grab"; }; svg.addEventListener("pointerup", up); svg.addEventListener("pointercancel", up);
    sync();
  }
  /* four illustrative days in the same format as an EOD QQQ GEX record (3 exp stacked, converted with that day's futures ratio); values rewritten.
     Each entry: QQQ strike -> net GEX (M). Includes the values listed under "skipped by spacing rules". */
  const RECENT = [
    { data: "第 1 天", apply: "第 2 天", ratio: 41.236, net: -310, ohlc: [28062.5, 28279.25, 27234.75, 27284.25],
      lv: { 707: 22.7, 700: 31.4, 695: 10.7, 689: 4.9, 685: -34.1, 680: -77.6, 675: -62.5, 670: -25.5, 665: -22.8 } },
    { data: "第 2 天", apply: "第 3 天", ratio: 41.235, net: -1520, ohlc: [27314.75, 27498, 26658.5, 27126],
      lv: { 700: 11.9, 690: 13.8, 681: 8.3, 675: -48.9, 672: -53.3, 671: -79.2, 670: -379.4, 669: -74.2, 668: -78.2, 665: -176.4, 662: -63.0, 660: -63.3, 654: -4.9, 650: -65.6 } },
    { data: "第 3 天", apply: "第 4 天", ratio: 41.224, net: -1060, ohlc: [27382, 27609.75, 26921.75, 27175],
      lv: { 680: -8.7, 670: 4.8, 669: 18.6, 664: -46.3, 662: 3.8, 660: -84.2, 659: -70.1, 658: -44.5, 657: -38.0, 656: -57.4, 655: -76.5, 653: -39.8, 651: -33.3, 650: -132.5, 645: -42.5, 640: -53.0, 634: -5.1 } },
    { data: "第 4 天", apply: "第 5 天", ratio: 41.221, net: -1410, ohlc: null,
      lv: { 694: 25.3, 690: -31.7, 687: 35.6, 683: 65.0, 680: -239.4, 679: 106.4, 675: -56.6, 674: 42.0, 670: -27.8, 665: 57.4, 660: -146.7, 655: -84.9, 654: 3.0, 650: -285.6, 645: -123.7, 640: -212.6, 630: -74.5, 625: -72.3 } }];
  RECENT.forEach((d) => { d.pts = Object.entries(d.lv).map(([q, g]) => ({ q: +q, p: Math.round(+q * d.ratio), g })).sort((a, b) => a.p - b.p); });
  window.OP8 = {
    terHTML: `<div class="scene"><div class="scene-h"><h3>3D 地形：價格 × 離到期天數</h3><p class="small">用滑鼠（或手指）拖動：左右＝水平旋轉，上下＝俯仰角。顏色代表高低（見下方色條）。藍線是下面選的那一天。</p></div>
<div class="tabs" id="p8-mode"><button class="tab" data-m="strike" aria-selected="true" type="button">每個履約價的 GEX（鋸齒狀）</button><button class="tab" data-m="total" aria-selected="false" type="button">價格移過去時的總 GEX（平滑）</button></div>
<svg id="p8-3d" viewBox="0 0 640 390" role="img" aria-label="GEX 3D 地形圖" style="touch-action:none;cursor:grab"></svg>
${legendH()}<p class="small" style="margin:2px 0 0">左右＝價格（26,400～27,600）；前後＝離到期天數（後方是 7 天前，越往前越接近到期）；高低＝地形高度。</p>
<div class="controls" style="margin-top:6px"><div class="ctl"><label for="p8-d">切哪一天 <b id="p8-d-v"></b></label><input id="p8-d" type="range" min="0" max="${TER.days.length - 1}" value="5"></div>
</div>${camHTML("p8c", { yaw: -35, pitch: 32, roll: 0 })}</div>

<div class="scene"><div class="scene-h"><h3>2D 橫切面：在這一天切一刀</h3><p class="small">上圖是地形（球在上面滾），下圖是同一天每個價位的淨 GEX。拖動「球放在哪裡」，按「放開小球」看它往哪滾。</p></div>
<div class="scene-grid"><div><svg id="p8-cut" viewBox="0 0 520 230" role="img" aria-label="地形橫切面與小球"></svg><svg id="p8-gex" viewBox="0 0 520 150" role="img" aria-label="同一天的淨 GEX"></svg></div><div class="side" id="p8-side"></div></div>
<div class="controls" style="margin-top:8px"><div class="ctl"><label for="p8-x">球放在哪裡 <b id="p8-x-v"></b></label><input id="p8-x" type="range" min="26500" max="27500" step="10" value="26900"></div></div>
<div class="btn-row"><button class="btn primary" id="p8-go" type="button">放開小球</button><button class="btn" id="p8-reset" type="button">放回原位</button></div></div>

`,
    realHTML: `<div class="scene" id="p8-real"><div class="scene-h"><h3>連續 4 天的 GEX 紀錄（示意）</h3><p class="small">格式和每天收盤後讀到的 QQQ GEX 紀錄相同，數字經過改寫（QQQ 換算成 NQ）。每根柱子是一個有紀錄的履約價：往上＝負 GEX（山），往下＝正 GEX（谷）。藍色帶＝隔天價格實際走過的範圍。</p></div>
<div class="tabs" id="p8-rmode"><button class="tab" data-m="surf" aria-selected="true" type="button">曲面（四天連起來）</button><button class="tab" data-m="bars" aria-selected="false" type="button">柱子（只畫有紀錄的）</button></div>
<svg id="p8-r3d" viewBox="0 0 640 420" role="img" aria-label="最近四天 GEX 柱狀地形" style="touch-action:none;cursor:grab"></svg>
${legendH()}
<div class="controls" style="margin-top:6px"><div class="ctl"><label for="p8-rd">看哪一天 <b id="p8-rd-v"></b></label><input id="p8-rd" type="range" min="0" max="3" value="1"></div>
</div>${camHTML("p8r", { yaw: -30, pitch: 35, roll: 0 })}
<div class="scene-grid" style="margin-top:8px"><svg id="p8-rcut" viewBox="0 0 520 260" role="img" aria-label="選定日的 GEX 橫切面與當天價格範圍"></svg><div class="side" id="p8-rside"></div></div>
<p class="small" style="margin:8px 0 0">每天的紀錄只保留淨 GEX 最大的十幾檔。「曲面」模式為了把四天連起來，把沒紀錄的履約價當成 0（灰色）；那些通常是比較小的值，但<b>不是真的 0</b>。想看原始紀錄請切到「柱子」。第 5 天是今天，還沒有收盤資料。</p></div>
`,
    notesHTML: `<div class="duo"><div class="op"><h4>谷底（正 GEX）</h4>市商逆著價格對沖：漲了賣、跌了買。球往哪邊推都滑回來，<b>價格黏住、走不遠</b>。</div>
<div class="neg"><h4>山丘（負 GEX）</h4>市商順著價格追單：漲了買、跌了賣。<b>爬坡時很吃力，一過頂就加速</b>滾下去。</div>
<div class="of"><h4>為什麼坑坑巴巴、越接近到期越尖？</h4>每個履約價都會在自己附近造出一個小山或小谷，整數關卡的 OI 大，坑就深。第 8 關學過：快到期時 Gamma 集中在履約價附近，所以谷更深、山更尖。把「切哪一天」拉到最左邊（7 天前）和最右邊（剩幾小時）比比看：7 天前地形很平緩，快到期時谷和山都變得很陡。</div></div>
<div class="duo"><div class="of"><h4>鋸齒狀：每個履約價的 GEX</h4>價格不動，把每一檔履約價各自的 GEX 排出來。直接反映每一檔的未平倉量，整數關卡會像尖峰一樣凸出來。多數網站和直播的長條圖、3D 圖大多是這種。</div>
<div class="op"><h4>平滑：價格移過去時的總 GEX</h4>假設價格真的走到那裡，把所有履約價的 GEX 加起來。每個履約價的影響會擴散到前後一兩百點，所以曲線是平滑的。Flip 就是在這條曲線上找的（第 7 關）。</div></div>
<div class="honest"><b class="h-h">怎麼做出來的、要注意什麼：</b>這裡的選擇權鏈是模擬出來的：每 25 點一個履約價、整數關卡的未平倉量放大、Call 和 Put 交錯、再加上隨機起伏，並疊上當週、下週、月選擇權三個到期日。<b>不是真實資料</b>，只是讓形狀接近真實的樣子。<b>高度＝淨 GEX 翻過來</b>，GEX 越正越低（谷底），越負越高（山頂）。這是為了好理解的畫法，不是物理公式。有些網站的 3D 圖也可能是直接把 GEX 畫成高度，那樣的話「高峰」代表正 GEX，意思剛好和這裡相反，看別人的圖時要先確認高度軸是什麼。另外，地形只是市商對沖這一股力量，新聞和大單都能直接把球推過山頂，目前的實際數據也還不足以證明它有效。</div>`,
    mountTer(root) {
      let mode = "strike", T3, uMin, uMax;
      let uAbs = 1;
      function build() { T3 = TER.days.map((d) => terrain(d, mode)); const all = T3.flatMap((t) => t.U); uMin = Math.min(...all); uMax = Math.max(...all); uAbs = Math.max(...all.map(Math.abs)) || 1; }
      build();
      const svg = $(root, "#p8-3d"), cam1 = { yaw: -35, pitch: 32, roll: 0 }; let di = 5, P1;
      const H = (u) => (u - uMin) / (uMax - uMin || 1);
      const proj = (ix, iy, h) => P1((ix / T3[0].n) * 2 - 1, (iy / (TER.days.length - 1)) * 2 - 1, h * 0.75 - 0.3);
      function draw3d() {
        P1 = makeCam(cam1, 320, 205, 190);
        const quads = [], rowAbs = T3.map((t, i) => Math.max(...t.U.map(Math.abs), ...(T3[i + 1] || t).U.map(Math.abs)));
        for (let iy = 0; iy < TER.days.length - 1; iy++) for (let ix = 0; ix < T3[0].n; ix++) {
          const a = T3[iy], b = T3[iy + 1], p = [proj(ix, iy, H(a.U[ix])), proj(ix + 1, iy, H(a.U[ix + 1])), proj(ix + 1, iy + 1, H(b.U[ix + 1])), proj(ix, iy + 1, H(b.U[ix]))];
          const W = (jx, jy, u) => [(jx / T3[0].n) * 2 - 1, (jy / (TER.days.length - 1)) * 2 - 1, H(u) * 0.75 - 0.3];
          const um = (a.U[ix] + a.U[ix + 1] + b.U[ix] + b.U[ix + 1]) / 4, sh = lit(W(ix, iy, a.U[ix]), W(ix + 1, iy, a.U[ix + 1]), W(ix, iy + 1, b.U[ix]));
          quads.push({ p, z: (p[0][2] + p[1][2] + p[2][2] + p[3][2]) / 4, col: hcol(um / (rowAbs[iy] || 1), sh) });
        }
        quads.sort((q1, q2) => q2.z - q1.z);
        const slice = T3[di].U.map((u, ix) => proj(ix, di, H(u)));
        svg.innerHTML = quads.map((q) => `<polygon points="${q.p.map((v) => v[0].toFixed(1) + "," + v[1].toFixed(1)).join(" ")}" style="fill:${q.col};stroke:${q.col};stroke-width:0.6"/>`).join("")
          + `<polyline fill="none" style="stroke:var(--buy);stroke-width:3" points="${slice.map((v) => v[0].toFixed(1) + "," + v[1].toFixed(1)).join(" ")}"/>`;
      }
      camWire(root, "p8c", svg, cam1, draw3d);

      // cross-section + ball
      let bx = 26900, bv = 0, rolling = false;
      const cur = () => T3[di];
      const uAt = (t, x) => { const f = ((x - TER.lo) / (TER.hi - TER.lo)) * t.n, i = Math.max(0, Math.min(t.n - 1, Math.floor(f))), r = f - i; return t.U[i] + (t.U[i + 1] - t.U[i]) * r; };
      const sAt = (t, x) => { const f = ((x - TER.lo) / (TER.hi - TER.lo)) * t.n, i = Math.max(0, Math.min(t.n - 1, Math.floor(f))), r = f - i; return t.slope[i] + (t.slope[i + 1] - t.slope[i]) * r; };
      function drawCut() {
        const t = cur(), d = TER.days[di];
        $(root, "#p8-d-v").textContent = d >= 1 ? nf(d, d % 1 ? 1 : 0) + " 天" : Math.round(d * 24) + " 小時"; $(root, "#p8-x-v").textContent = nf(bx);
        const lo = Math.min(...t.U), hi = Math.max(...t.U), pad = (hi - lo) * 0.12 || 1;
        const r = plot($(root, "#p8-cut"), { xs: t.xs, H: 230, ylo: lo - pad, yhi: hi + pad, ylab: "地形高度＝淨 GEX 翻過來", fy: () => "", L: 20, series: [{ ys: t.U, col: "var(--ink)", w: 2.5 }],
          under: (X, Y) => t.xs.slice(0, -1).map((x, i) => `<rect x="${X(x)}" y="14" width="${X(t.xs[i + 1]) - X(x) + 0.5}" height="186" style="fill:${t.g[i] >= 0 ? "var(--gamma)" : "var(--sell)"};opacity:.08"/>`).join(""),
          over: (X, Y) => `<circle cx="${X(bx)}" cy="${Y(uAt(t, bx)) - 9}" r="9" style="fill:var(--buy);stroke:var(--surface);stroke-width:2"/>` });
        void r;
        plot($(root, "#p8-gex"), { xs: t.xs, H: 150, L: 54, ylab: mode === "strike" ? "這個履約價的 GEX（百萬美元）" : "假設價格移到這裡時的總 GEX（百萬美元）", fy: (v) => sgn(v), series: [{ ys: t.g, col: "var(--ink-2)", w: 1.6 }],
          under: (X, Y) => `<polygon points="${X(t.xs[0])},${Y(0)} ${t.g.map((v, i) => `${X(t.xs[i]).toFixed(1)},${Y(Math.max(0, v)).toFixed(1)}`).join(" ")} ${X(t.xs[t.xs.length - 1])},${Y(0)}" style="fill:var(--gamma);opacity:.35"/><polygon points="${X(t.xs[0])},${Y(0)} ${t.g.map((v, i) => `${X(t.xs[i]).toFixed(1)},${Y(Math.min(0, v)).toFixed(1)}`).join(" ")} ${X(t.xs[t.xs.length - 1])},${Y(0)}" style="fill:var(--sell);opacity:.35"/>`,
          over: (X) => `<line x1="${X(bx)}" x2="${X(bx)}" y1="14" y2="120" style="stroke:var(--buy);stroke-dasharray:3 3"/>` });
        const gHere = t.g[Math.round(((bx - TER.lo) / (TER.hi - TER.lo)) * t.n)], sl = sAt(t, bx);
        $(root, "#p8-side").innerHTML = `<span class="tagline ${gHere >= 0 ? "go" : ""}">${gHere >= 0 ? "谷底區（正 GEX）" : "山丘區（負 GEX）"}</span><h4>球在 ${nf(bx)}</h4>
          <p style="margin:0 0 8px">${gHere >= 0 ? "這裡地勢低，球會往最低點聚集、被拉回來。對應市商<b>逆向對沖</b>，價格容易黏住。" : "這裡地勢高，球一偏離就往下滾走、越滾越快。對應市商<b>順向追單</b>，價格容易加速。"}</p>
          <p class="small" style="margin:0">${Math.abs(sl / t.smax) < 0.02 ? "這裡是平的，球不會自己動。" : `這裡的坡往${sl > 0 ? "左" : "右"}下傾，球會往${sl > 0 ? "價格低" : "價格高"}的方向滾。`}${rolling ? "　滾動中……" : ""}</p>`;
      }
      const lp = loop($(root, "#p8-cut"), (dt) => {
        if (!rolling) return; const t = cur(), k = dt / 16;
        for (let s = 0; s < 4; s++) { const a = -(sAt(t, bx) / t.smax) * 0.6; bv = (bv + a * k) * 0.94; bx += bv * k; }
        if (bx <= 26420 || bx >= 27580) { bx = Math.max(26420, Math.min(27580, bx)); rolling = false; }
        if (Math.abs(bv) < 0.05 && Math.abs(sAt(t, bx) / t.smax) < 0.02) rolling = false;
        $(root, "#p8-x").value = Math.round(bx); drawCut();
      });
      $(root, "#p8-go").addEventListener("click", () => { bv = 0; rolling = !RM; drawCut(); });
      $(root, "#p8-reset").addEventListener("click", () => { rolling = false; bx = +$(root, "#p8-x").value; drawCut(); });
      $(root, "#p8-x").addEventListener("input", (e) => { rolling = false; bx = +e.target.value; drawCut(); });
      $(root, "#p8-d").addEventListener("input", (e) => { di = +e.target.value; draw3d(); drawCut(); });
      $(root, "#p8-mode").addEventListener("click", (e) => { const t = e.target.closest(".tab"); if (!t) return; mode = t.dataset.m; root.querySelectorAll("#p8-mode .tab").forEach((x) => x.setAttribute("aria-selected", String(x === t))); rolling = false; build(); draw3d(); drawCut(); });
      draw3d(); drawCut(); void lp;
    },
    mountReal(root) {      // real recent days: 3D columns + cross-section
      const rsvg = $(root, "#p8-r3d"), cam2 = { yaw: -30, pitch: 35, roll: 0 }; let rdi = 1, rmode = "surf", P2;
      const allP = RECENT.flatMap((d) => d.pts.map((x) => x.p).concat(d.ohlc ? [d.ohlc[1], d.ohlc[2]] : [])), pLo = Math.floor(Math.min(...allP) / 100) * 100 - 100, pHi = Math.ceil(Math.max(...allP) / 100) * 100 + 100;
      const gMax = Math.max(...RECENT.flatMap((d) => d.pts.map((x) => Math.abs(x.g))));
      const RAT = RECENT.reduce((s2, d) => s2 + d.ratio, 0) / RECENT.length, qLo = Math.min(...RECENT.flatMap((d) => d.pts.map((x) => x.q))) - 2, qHi = Math.max(...RECENT.flatMap((d) => d.pts.map((x) => x.q))) + 2;
      const rp = (px, iy, h) => P2(((px - pLo) / (pHi - pLo)) * 2 - 1, (iy / 3) * 2 - 1, h * 0.5);
      function drawR3d() {
        P2 = makeCam(cam2, 335, 250, 185);
        const items = [];
        if (rmode === "surf") {
          const grid = RECENT.map((d) => { const m = {}; d.pts.forEach((x) => (m[x.q] = x.g)); const row = []; for (let q = qLo; q <= qHi; q++) row.push({ q, g: m[q] || 0 }); return row; });
          for (let iy = 0; iy < 3; iy++) for (let k = 0; k < grid[0].length - 1; k++) {
            const c = [[k, iy], [k + 1, iy], [k + 1, iy + 1], [k, iy + 1]].map(([kk, yy]) => rp(grid[yy][kk].q * RAT, yy, -grid[yy][kk].g / gMax));
            const gs = [grid[iy][k], grid[iy][k + 1], grid[iy + 1][k + 1], grid[iy + 1][k]].map((x) => x.g), avg = gs.reduce((a2, b2) => a2 + b2, 0) / 4;
            const Wr = (kk, yy) => [((grid[yy][kk].q * RAT - pLo) / (pHi - pLo)) * 2 - 1, (yy / 3) * 2 - 1, (-grid[yy][kk].g / gMax) * 0.5];
            const sh = lit(Wr(k, iy), Wr(k + 1, iy), Wr(k, iy + 1)), colr = hcol(-avg / gMax * 1.6, sh);
            items.push({ z: c.reduce((a2, b2) => a2 + b2[2], 0) / 4, svg: `<polygon points="${c.map((v) => v[0].toFixed(1) + "," + v[1].toFixed(1)).join(" ")}" style="fill:${colr};stroke:${colr};stroke-width:0.6"/>` });
          }
        } else {
          RECENT.forEach((d, iy) => d.pts.forEach((pt) => { const b0 = rp(pt.p, iy, 0), t0 = rp(pt.p, iy, -pt.g / gMax);
            items.push({ z: b0[2], svg: `<line x1="${b0[0]}" y1="${b0[1]}" x2="${t0[0]}" y2="${t0[1]}" style="stroke:${hcol(-pt.g / gMax * 1.6, 0.95)};stroke-width:${iy === rdi ? 6 : 4};stroke-linecap:round;stroke-opacity:${iy === rdi ? 1 : 0.7}"/>` }); }));
        }
        RECENT.forEach((d, iy) => {
          const a = rp(pLo, iy, 0), b = rp(pHi, iy, 0);
          items.push({ z: (a[2] + b[2]) / 2 + 0.001, svg: `<line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" style="stroke:var(--ink-3);stroke-width:${iy === rdi ? 1.6 : 0.6}"/>` });
        });
        items.sort((u, v) => v.z - u.z);
        let top = "";
        RECENT.forEach((d, iy) => {
          if (d.ohlc) { const lo = rp(d.ohlc[2], iy, 0), hi = rp(d.ohlc[1], iy, 0); top += `<line x1="${lo[0]}" y1="${lo[1]}" x2="${hi[0]}" y2="${hi[1]}" style="stroke:var(--buy);stroke-width:${iy === rdi ? 7 : 5};stroke-opacity:.55;stroke-linecap:round"/>`; }
          const lab = rp(pLo, iy, 0); top += `<text x="${lab[0] - 8}" y="${lab[1] + 4}" text-anchor="end" style="${iy === rdi ? "fill:var(--ink);font-weight:600" : ""}">${d.apply.slice(0, 5)}</text>`;
        });
        const e0 = rp(pLo, 0, 0), e1 = rp(pHi, 0, 0);
        rsvg.innerHTML = items.map((i) => i.svg).join("") + top + `<text x="${e0[0]}" y="${e0[1] + 20}" text-anchor="middle">${nf(pLo)}</text><text x="${e1[0]}" y="${e1[1] + 20}" text-anchor="middle">${nf(pHi)}</text>`;
      }
      function drawRcut() {
        const d = RECENT[rdi]; $(root, "#p8-rd-v").textContent = d.apply + "（資料日 " + d.data + "）";
        const W = 520, H = 260, L = 50, R = 12, T = 16, Bt = 30, X = (p) => L + ((p - pLo) / (pHi - pLo)) * (W - L - R), Y = (v) => T + ((gMax - v) / (2 * gMax)) * (H - T - Bt);
        const ticks = window.OF.niceTicks(pLo, pHi, 5);
        let h = `<line x1="${L}" x2="${W - R}" y1="${Y(0)}" y2="${Y(0)}" style="stroke:var(--ink-3)"/><text x="${L - 6}" y="${Y(0) + 4}" text-anchor="end">0</text>
          <text x="${L - 6}" y="${Y(gMax) + 8}" text-anchor="end">山</text><text x="${L - 6}" y="${Y(-gMax)}" text-anchor="end">谷</text>
          ${ticks.map((t) => `<text x="${X(t)}" y="${H - 10}" text-anchor="middle">${nf(t)}</text>`).join("")}`;
        if (d.ohlc) h += `<rect x="${X(d.ohlc[2])}" y="${T}" width="${X(d.ohlc[1]) - X(d.ohlc[2])}" height="${H - T - Bt}" style="fill:var(--buy);opacity:.1"/><line x1="${X(d.ohlc[3])}" x2="${X(d.ohlc[3])}" y1="${T}" y2="${H - Bt}" style="stroke:var(--buy);stroke-width:1.5"/><text x="${X(d.ohlc[3]) + 4}" y="${T + 10}" style="fill:var(--buy-ink)">收 ${nf(d.ohlc[3])}</text>`;
        h += d.pts.map((pt) => `<rect x="${X(pt.p) - 3}" y="${Math.min(Y(0), Y(-pt.g))}" width="6" height="${Math.max(1, Math.abs(Y(-pt.g) - Y(0)))}" rx="1.5" style="fill:${pt.g >= 0 ? "var(--gamma)" : "var(--sell)"}" data-tip="NQ ${nf(pt.p)}（QQQ ${pt.q}）<br>淨 GEX ${pt.g > 0 ? "+" : ""}${pt.g}M"/>`).join("");
        $(root, "#p8-rcut").innerHTML = h; window.OF.bindTips($(root, "#p8-rcut"));
        const mtn = d.pts.reduce((a, b) => (b.g < a.g ? b : a)), val = d.pts.reduce((a, b) => (b.g > a.g ? b : a));
        const inR = (p) => d.ohlc && p >= d.ohlc[2] && p <= d.ohlc[1];
        $(root, "#p8-rside").innerHTML = `<span class="tagline">${d.apply}</span><h4>淨 GEX ${sgn(d.net)}M</h4>
          <div class="kpi"><div class="k-l">最高的山（最負）</div><div class="k-v" style="font-size:16px">${nf(mtn.p)}（${mtn.g}M）</div><div class="k-n">${d.ohlc ? (inR(mtn.p) ? "當天價格有走到這裡" : "當天價格沒走到") : "今天還沒收盤"}</div></div>
          <div class="kpi" style="margin-top:6px"><div class="k-l">最深的谷（最正）</div><div class="k-v" style="font-size:16px">${val.g > 0 ? nf(val.p) + "（+" + val.g + "M）" : "這天沒有正值紀錄"}</div><div class="k-n">${val.g > 0 && d.ohlc ? (inR(val.p) ? "當天價格有走到這裡" : "當天價格沒走到") : ""}</div></div>
          ${d.ohlc ? `<div class="kpi" style="margin-top:6px"><div class="k-l">當天高／低／收</div><div class="k-v" style="font-size:16px">${nf(d.ohlc[1])}／${nf(d.ohlc[2])}／${nf(d.ohlc[3])}</div><div class="k-n">振幅 ${nf(d.ohlc[1] - d.ohlc[2])} 點</div></div>` : ""}
          <p class="small" style="margin:8px 0 0">滑鼠移到柱子上看數值。這只是把紀錄畫出來，4 天不足以判斷山和谷有沒有效。</p>`;
      }
      camWire(root, "p8r", rsvg, cam2, drawR3d);
      $(root, "#p8-rmode").addEventListener("click", (e) => { const t = e.target.closest(".tab"); if (!t) return; rmode = t.dataset.m; root.querySelectorAll("#p8-rmode .tab").forEach((x) => x.setAttribute("aria-selected", String(x === t))); drawR3d(); });
      $(root, "#p8-rd").addEventListener("input", (e) => { rdi = +e.target.value; drawR3d(); drawRcut(); });
      drawR3d(); drawRcut();
    }
  };
})();
