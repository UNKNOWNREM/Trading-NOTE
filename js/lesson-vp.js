/* 路線 1 第 7 關（新版）：Volume Profile */
(function () {
  const PAGES = (window.__PAGES = window.__PAGES || {});
  const { chip, lerp, ease, seg, cards } = window.KIT;
  // 例子：總量 1,400 口，POC 103，VA 102～104
  const VP = [[106, 40], [105, 110], [104, 280], [103, 500], [102, 300], [101, 120], [100, 50]];
  const TOT = VP.reduce((s, v) => s + v[1], 0);
  const RY = (r) => 60 + r * 40, RH = 30, X0 = 150, SC = 0.62;   // 500 口 → 310px

  // 價值區：從 POC 開始，每次比較上下各一格，加大的那一格，直到 ≥70%
  function valueArea(rows) {
    const tot = rows.reduce((s, v) => s + v[1], 0), goal = tot * 0.7;
    let p = rows.reduce((b, v, k) => (v[1] > rows[b][1] ? k : b), 0), hi = p, lo = p, cum = rows[p][1];
    const log = [[p, cum]];
    while (cum < goal && (hi > 0 || lo < rows.length - 1)) {
      const up = hi > 0 ? rows[hi - 1][1] : -1, dn = lo < rows.length - 1 ? rows[lo + 1][1] : -1;
      if (dn > up) { lo++; cum += dn; log.push([lo, cum]); } else { hi--; cum += up; log.push([hi, cum]); }
    }
    return { poc: p, hi, lo, cum, goal, tot, log };
  }
  const VA = valueArea(VP);

  function profile(rows, o = {}) {
    let s = `<line x1="${X0}" x2="${X0}" y1="40" y2="${RY(rows.length - 1) + 24}" class="s-ink"/>`;
    rows.forEach((v, r) => {
      const w = (o.fill ? o.fill[r] : v[1]) * (o.sc || SC), inVA = o.va && r >= o.va.hi && r <= o.va.lo, isP = o.poc === r;
      s += `<text x="${X0 - 10}" y="${RY(r) + 5}" text-anchor="end" class="${isP ? "t-ink t-b" : "t-mute"}">${v[0].toFixed(2)}</text>`;
      s += `<rect x="${X0 + 2}" y="${RY(r) - RH / 2}" width="${Math.max(0, w)}" height="${RH}" rx="4" class="${isP ? "f-buy" : inVA ? "f-buy-soft" : o.lvn && o.lvn.includes(r) ? "f-sell-soft" : "g-cell"}"/>`;
      if (o.nums !== false && w > 0) s += `<text x="${X0 + 10 + w}" y="${RY(r) + 5}" class="t-mute">${Math.round(o.fill ? o.fill[r] : v[1])}</text>`;
    });
    if (o.va && o.vaLines !== false) {
      const yH = RY(o.va.hi) - RH / 2 - 4, yL = RY(o.va.lo) + RH / 2 + 4;
      s += `<line x1="${X0 - 70}" x2="560" y1="${yH}" y2="${yH}" class="s-buy" stroke-width="2" stroke-dasharray="6 4"/><text x="560" y="${yH - 6}" text-anchor="end" class="t-buy t-b">VAH</text>`;
      s += `<line x1="${X0 - 70}" x2="560" y1="${yL}" y2="${yL}" class="s-buy" stroke-width="2" stroke-dasharray="6 4"/><text x="560" y="${yL + 16}" text-anchor="end" class="t-buy t-b">VAL</text>`;
    }
    return s;
  }
  const PY = (p) => RY(VP.findIndex((v) => v[0] === p));

  const STEPS = [
    { cap: "Footprint 告訴你每根 K 棒裡、每個價格成交了多少。如果把<b>一整天</b>所有 K 棒的成交量，按價格<b>橫著堆起來</b>呢？",
      why: "每根 K 棒都在某些價格有成交。把同一個價格的成交量全部加總，就知道這一天在每個價格總共成交了多少口。", stuckHref: "#of-2", stuckLabel: "回第 3 關複習 Footprint →", stuck: "像把一整天的收據，按價錢分類加總。" },
    { cap: "堆出來的形狀就叫 <b>Volume Profile</b>（成交量分布）：每個價格一條橫的長條，越長代表那個價格成交越多。",
      why: "這裡用你例子：從 100 到 106 共 7 個價格，總共成交 1,400 口。中間的價格成交最多，上下兩端很少，是很常見的形狀。", dur: 2400 },
    { cap: "最長的那一條叫 <b>POC</b>（成交最多的價格）：103，成交 500 口。這一天大家最常在這個價格成交。",
      why: "POC 是 Point of Control 的縮寫。很多人在這裡買賣過，代表這是買賣雙方都覺得「公平」的價格。之後價格常常會被吸回這附近，所以有人把它比喻成磁鐵。" },
    { cap: "接著找<b>價值區</b>：包含全天 <b>70%</b> 成交量的那一段價格。1,400 口的 70% 是 <b>980 口</b>。",
      why: "70% 是 Market Profile 傳下來的慣例，大約對應統計上「一個標準差」的範圍。價值區代表這一天大部分人認同的價格範圍。" },
    { cap: "從 POC 開始往外擴：先放進 103（500 口）。接著比較上下兩格：下面的 102（300）比上面的 104（280）大，先加 102，累計 800 口。",
      why: "每次只比較價值區上緣再往上一格、下緣再往下一格，哪一格大就先加哪一格。這是常見的算法；有些軟體一次比較兩格，結果可能差一點點。", dur: 2400 },
    { cap: "還不到 980，繼續：現在比較 104（280）和 101（120），加 104，累計 1,080 口，超過 980。完成：<b>價值區 102～104</b>。",
      why: "價值區的上緣叫 <b>VAH</b>（104），下緣叫 <b>VAL</b>（102）。這兩條線和 POC，是 Volume Profile 最常用的三個價位。", dur: 2400 },
    { cap: "換你算：另一天的 POC 是 205（400 口），上面一格 206 有 150 口，下面一格 204 有 220 口。",
      q: { t: "照這個算法，下一個要加進價值區的是哪一格？", o: [
        ["206，因為在上面", false, "不是看上下，而是看哪一格的量比較大。150 比 220 小。"],
        ["204，因為 220 比 150 大", true, "每次比較上下兩格，量大的那一格先加。所以先加 204。"],
        ["兩格一起加", false, "這個算法每次只加一格，量大的先加。"]] } },
    { cap: "長條特別長的地方叫 <b>HVN</b>（高量節點），特別短的地方叫 <b>LVN</b>（低量節點）。這裡的 100 和 106 就是 LVN。",
      why: "HVN 是大家願意停留、成交很多的價格，價格到這裡常會慢下來。LVN 是很少人交易的價格，價格通常很快穿過去，像真空一樣。" },
    { cap: "價格<b>在價值區裡面</b>，代表市場處於平衡。常見的想法是：在 VAH、VAL 邊緣等反向的訂單流訊號，目標看回 POC。",
      why: "平衡的時候，價格傾向在價值區裡來回。走到邊緣，如果出現吸收、Delta 反向這類訊號，就可能回到中間。" },
    { cap: "練習一下：價格在價值區裡往上走到 VAH 104，Footprint 出現吸收（主動買很多，價格卻上不去）。",
      q: { t: "如果要做空，目標比較合理放在哪裡？", o: [
        ["POC 103", true, "價值區裡是平衡狀態，價格常被吸回 POC。第一個目標放在 POC 很合理。"],
        ["LVN 100", false, "100 在價值區外面，離得太遠。在平衡狀態下，先看回 POC。"],
        ["不用設目標，抱到停損", false, "進場前就要先想好目標和停損，才算得出風報比。"]] } },
    { cap: "價格<b>離開價值區</b>時看量：<b>有量</b>的突破，代表市場接受新價格；<b>沒量</b>的突破，常常又回到價值區裡。",
      why: "這是 Market Profile 的「拍賣」觀念：價格跑到新地方，如果有很多人在那裡成交（接受），新的價值區可能形成；如果沒人跟（拒絕），價格就會被拉回來。第 9 關會更詳細講。", dur: 2400 },
    { cap: "練習一下：價格衝到 LVN 100 附近，Footprint 剛好出現一格買方失衡。",
      q: { t: "照這一關的觀念，比較合理的做法是？", o: [
        ["馬上做多，因為有失衡", false, "LVN 是很少人交易的地方，價格通常很快穿過。在這裡進場，訊號容易失效。"],
        ["不在 LVN 進場，等價格到價值區邊緣或 HVN 再看訊號", true, "LVN 是真空區，主要用來判斷價格會被拉到哪裡；找訊號要在有人在乎的價位，例如 VAL、VAH。"],
        ["做空，因為 LVN 一定是阻力", false, "LVN 不是阻力或支撐，而是價格容易快速穿過的地方。"]] } },
    { cap: "最實用的是<b>前一天的 Profile</b>：昨天的 POC、VAH、VAL，就是今天盤前要標在圖上的關鍵價位。",
      why: "第 12 關的情境重播，就是 ES 走到「昨天的 VAH 5010」。盤前先把這三條線畫好，盤中只在這些地方找訊號。" }
  ];

  function draw(svg, i, t) {
    const e = ease(t); let s = "";
    if (i === 0) {
      const bars = [[3, [0, 1, 2]], [2, [1, 2, 3, 4]], [1, [2, 3, 4]], [0, [3, 4, 5, 6]], [1, [2, 3]]];
      bars.forEach((b, k) => {
        const x = 330 + k * 56, op = seg(t, k * 0.12, k * 0.12 + 0.25);
        b[1].forEach((r) => { s += `<rect x="${x}" y="${RY(r) - RH / 2}" width="40" height="${RH}" rx="4" class="f-buy-soft" opacity="${op}"/>`; });
      });
      VP.forEach((v, r) => { s += `<text x="${X0 - 10}" y="${RY(r) + 5}" text-anchor="end" class="t-mute">${v[0].toFixed(2)}</text>`; });
      s += `<text x="330" y="36" class="t-mute">一整天的 K 棒，每根在不同價格有成交</text>`;
      s += `<g opacity="${seg(t, 0.7, 1)}"><path d="M320 200 L${X0 + 40} 200" class="s-gamma" stroke-width="3"/><path d="M${X0 + 40} 200 l12 -7 v14 z" class="f-hl"/><text x="${X0 + 60}" y="190" class="t-gamma t-b">同一價格加總</text></g>`;
    } else if (i === 1) {
      s += profile(VP, { fill: VP.map((v) => v[1] * e) });
      s += `<text x="420" y="${RY(6) + 40}" class="t-mute" opacity="${seg(t, 0.8, 1)}">總共 1,400 口</text>`;
    } else if (i === 2) {
      s += profile(VP, { poc: 3 });
      s += `<g opacity="${seg(t, 0.2, 0.7)}"><text x="${X0 + 365}" y="${RY(3) - 4}" class="t-buy t-b t-lg">← POC</text><text x="${X0 + 365}" y="${RY(3) + 18}" class="t-mute">成交最多的價格</text></g>`;
    } else if (i === 3) {
      s += profile(VP, { poc: 3 });
      s += `<g opacity="${seg(t, 0.2, 0.8)}"><rect x="470" y="180" width="150" height="110" rx="12" class="f-gamma-soft"/><text x="484" y="210" class="t-ink">總量 1,400 口</text><text x="484" y="240" class="t-ink">× 70%</text><text x="484" y="274" class="t-ink t-b t-xl">＝ 980 口</text></g>`;
    } else if (i === 4 || i === 5) {
      const n = i === 4 ? 2 : 3, va = { hi: i === 4 ? 3 : 2, lo: 4 };
      s += profile(VP, { poc: 3, va, vaLines: i === 5 && t > 0.6 });
      const cum = i === 4 ? 800 : 1080;
      const cmp = i === 4 ? [[2, "104：280"], [4, "102：300 ✓"]] : [[2, "104：280 ✓"], [5, "101：120"]];
      s += `<g opacity="${seg(t, 0, 0.4)}">${cmp.map(([r, tx]) => `<text x="${X0 + 220}" y="${RY(r) + 5}" class="${tx.includes("✓") ? "t-buy t-b" : "t-mute"}">← ${tx}</text>`).join("")}</g>`;
      s += `<g opacity="${seg(t, 0.4, 0.8)}"><rect x="430" y="${RY(6) - 10}" width="170" height="56" rx="10" class="f-surface s-line"/><text x="444" y="${RY(6) + 14}" class="t-mute">累計</text><text x="444" y="${RY(6) + 36}" class="t-ink t-b t-lg">${cum.toLocaleString()} / 980</text></g>`;
    } else if (i === 6) {
      const R = [[207, 60], [206, 150], [205, 400], [204, 220], [203, 90]];
      s += profile(R, { poc: 2, sc: 0.7 });
      s += `<text x="${X0 + 330}" y="${RY(2) + 5}" class="t-ink t-b">下一格加哪一個？</text>`;
    } else if (i === 7) {
      s += profile(VP, { poc: 3, va: VA, lvn: [0, 6], vaLines: false });
      s += `<g opacity="${seg(t, 0.2, 0.6)}"><text x="${X0 + 365}" y="${RY(3) + 5}" class="t-buy t-b">← HVN</text><text x="${X0 + 365}" y="${RY(3) + 25}" class="t-mute">大家停留的地方</text></g>`;
      s += `<g opacity="${seg(t, 0.5, 0.9)}"><text x="${X0 + 60}" y="${RY(0) + 5}" class="t-sell t-b">← LVN：很快穿過</text><text x="${X0 + 60}" y="${RY(6) + 5}" class="t-sell t-b">← LVN</text></g>`;
    } else if (i === 8 || i === 9) {
      s += profile(VP, { poc: 3, va: VA, nums: false });
      const pts = [[300, 103], [340, 102.4], [380, 103.3], [420, 104], [450, 103.6], [490, 103.1], [530, 103]];
      const Y = (p) => lerp(RY(6), RY(0), (p - 100) / 6);
      const n = i === 9 ? 4 : Math.max(2, Math.ceil(seg(t, 0, 0.8) * pts.length));
      s += `<polyline points="${pts.slice(0, n).map((q) => `${q[0]},${Y(q[1])}`).join(" ")}" class="s-ink f-none" stroke-width="2.5"/>`;
      if (i === 8) s += `<text x="300" y="${RY(6) + 40}" class="t-ink t-b" opacity="${seg(t, 0.6, 1)}">價值區裡：邊緣找反向訊號，目標看 POC</text>`;
      else s += chip(470, Y(104) - 30, "VAH 出現吸收", "sell");
    } else if (i === 10) {
      s += profile(VP, { poc: 3, va: VA, nums: false });
      const Y = (p) => lerp(RY(6), RY(0), (p - 100) / 6);
      const A = [[290, 103.5], [330, 104.4], [370, 105.4], [410, 105.1], [450, 105.8], [500, 106]];
      const B = [[290, 103.5], [330, 104.4], [370, 105.2], [410, 104.6], [450, 103.8], [500, 103.2]];
      const k = seg(t, 0, 0.8);
      const n = Math.max(2, Math.ceil(k * A.length));
      s += `<polyline points="${A.slice(0, n).map((q) => `${q[0]},${Y(q[1])}`).join(" ")}" class="s-buy f-none" stroke-width="2.5"/><polyline points="${B.slice(0, n).map((q) => `${q[0]},${Y(q[1])}`).join(" ")}" class="s-sell f-none" stroke-width="2.5" stroke-dasharray="5 4"/>`;
      s += `<g opacity="${seg(t, 0.7, 1)}"><text x="506" y="${Y(106) + 4}" class="t-buy t-b">有量：接受</text><text x="506" y="${Y(103.2) + 4}" class="t-sell t-b">沒量：回來</text></g>`;
    } else if (i === 11) {
      s += profile(VP, { poc: 3, va: VA, lvn: [6], nums: false }) + chip(420, RY(6), "價格在 LVN，出現一格買方失衡", "buy");
    } else if (i === 12) {
      s += `<text x="40" y="40" class="t-mute">昨天的 Profile</text>` + profile(VP, { poc: 3, va: VA, nums: false, sc: 0.3, vaLines: false });
      const lines = [[RY(2) - RH / 2 - 4, "昨日 VAH", "s-buy"], [RY(3), "昨日 POC", "s-ink"], [RY(4) + RH / 2 + 4, "昨日 VAL", "s-buy"]];
      s += `<g opacity="${seg(t, 0.2, 0.7)}"><text x="350" y="40" class="t-ink t-b">今天的圖：盤前先畫好這三條</text>${lines.map(([y, l, c]) => `<line x1="330" x2="610" y1="${y}" y2="${y}" class="${c}" stroke-width="2" stroke-dasharray="6 4"/><text x="606" y="${y - 6}" text-anchor="end" class="${c.replace("s-", "t-")} t-b">${l}</text>`).join("")}</g>`;
      s += `<g opacity="${seg(t, 0.6, 1)}"><polyline points="340,${RY(5)} 400,${RY(4)} 460,${RY(3) + 6} 520,${RY(2) - 10} 560,${RY(2) - 2}" class="s-ink f-none" stroke-width="2"/></g>`;
    }
    svg.innerHTML = s;
  }

  /* ---------- 你來操作：自己調量，看 POC 和價值區 ---------- */
  const PRE = {
    norm: { name: "平衡日（一個山）", v: [30, 80, 180, 300, 420, 310, 170, 70, 30] },
    trend: { name: "趨勢日（拉長）", v: [120, 150, 140, 160, 150, 170, 140, 130, 110] },
    dbl: { name: "雙分布（兩個山）", v: [60, 260, 320, 150, 40, 140, 300, 240, 50] }
  };
  const SPX = [104, 103.5, 103, 102.5, 102, 101.5, 101, 100.5, 100];
  const simHTML = `<div class="btn-row vp-pre">${Object.entries(PRE).map(([k, p]) => `<button class="btn" data-p="${k}" type="button">${p.name}</button>`).join("")}</div>
<div class="vp-sim"><table class="fp vp-t" aria-label="可調整的 Volume Profile"></table><div class="side vp-out"></div></div>
<ul class="sim-task vp-task"></ul>`;
  function simMount(box) {
    const q = (s) => box.querySelector(s); let v = PRE.norm.v.slice(); const done = {};
    function paint() {
      const rows = SPX.map((p, k) => [p, v[k]]), va = valueArea(rows), mx = Math.max(...v);
      const minV = Math.min(...v.slice(1, -1));
      const lvn = v.map((x, k) => k > 0 && k < v.length - 1 && x < v[k - 1] * 0.5 && x < v[k + 1] * 0.5);
      q(".vp-t").innerHTML = `<thead><tr><td>價格</td><td>成交量</td><td></td></tr></thead><tbody>${rows.map((r, k) => `<tr><td class="px">${r[0].toFixed(1)}</td><td class="vp-bar"><span class="vp-b ${k === va.poc ? "poc" : k >= va.hi && k <= va.lo ? "va" : lvn[k] ? "lvn" : ""}" data-w="${Math.round((r[1] / mx) * 78)}"></span><em>${r[1]}</em></td><td class="vp-btn"><button class="btn" data-k="${k}" data-d="-50" type="button" aria-label="減少">−</button><button class="btn" data-k="${k}" data-d="50" type="button" aria-label="增加">＋</button></td></tr>`).join("")}</tbody>`;
      q(".vp-t").querySelectorAll(".vp-b").forEach((el) => (el.style.width = el.dataset.w + "%"));
      q(".vp-out").innerHTML = `<p><b>POC</b>　${SPX[va.poc].toFixed(1)}</p><p><b>VAH</b>　${SPX[va.hi].toFixed(1)}　<b>VAL</b>　${SPX[va.lo].toFixed(1)}</p><p class="small">總量 ${va.tot.toLocaleString()} 口，70% ＝ ${Math.round(va.goal).toLocaleString()} 口</p>
        <p class="small">算法：從 POC 開始，${va.log.slice(1).map(([r, c]) => `加 ${SPX[r].toFixed(1)}（累計 ${c}）`).join("、") || "POC 自己就超過 70%"}。</p>${lvn.some(Boolean) ? `<p class="small">粉紅色＝LVN（比上下兩格都少一半以上）。</p>` : ""}`;
      if (SPX[va.poc] === 103) done.a = true;
      if (va.lo - va.hi <= 2) done.b = true;
      if (lvn.some(Boolean) && va.lo - va.hi >= 4) done.c = true;
      q(".vp-task").innerHTML = [["a", "任務 1：調整成交量，讓 POC 移到 103.0"], ["b", "任務 2：讓價值區只有 3 個價格（POC 加上下各一格）"], ["c", "任務 3：做出中間有一個 LVN 的雙分布，看價值區怎麼橫跨過去"]].map(([k, tx]) => `<li class="${done[k] ? "ok" : ""}">${done[k] ? "✓" : "○"} ${tx}</li>`).join("");
    }
    box.addEventListener("click", (e) => {
      const p = e.target.closest("[data-p]"); if (p) { v = PRE[p.dataset.p].v.slice(); paint(); return; }
      const b = e.target.closest("[data-k]"); if (!b) return;
      const k = +b.dataset.k; v[k] = Math.max(10, Math.min(600, v[k] + +b.dataset.d)); paint();
    });
    paint();
  }

  const QS = [
    { fig: `<table class="fp q-fp" aria-label="題目一的 Profile"><thead><tr><td>價格</td><td>成交量</td></tr></thead><tbody>${[[52, 40], [51, 160], [50, 300], [49, 220], [48, 80]].map((r) => `<tr><td class="px">${r[0]}</td><td class="px">${r[1]}</td></tr>`).join("")}</tbody></table>`,
      q: "這一天的 POC 是多少？", step: 3, o: [["50", true, "成交量最多的是 50（300 口），它就是 POC。"], ["51", false, "51 有 160 口，不是最多的。"], ["52", false, "52 只有 40 口，是成交最少的地方之一。"]] },
    { fig: `<p class="small q-cap">同一天：總量 800 口。從 POC 50（300）開始，加 49（220）累計 520，再加 51（160）累計 680。</p>`,
      q: "這時價值區算完了嗎？", step: 6, o: [
      ["還沒，要再往外加一格", false, "800 × 70% ＝ 560。加完 51 後已經 680，超過 560，不用再加。"],
      ["算完了，因為 680 超過 800 的 70%（560）", true, "70% 是 560 口。680 已經超過，所以價值區是 49～51。"],
      ["還沒，要加到 800 才算完", false, "價值區只要包含 70% 的成交量，不是全部。"]] },
    { fig: `<p class="small q-cap">價格從價值區衝出 VAH，但衝上去之後成交量很小，沒多久又跌回價值區裡。</p>`, q: "這比較像是哪一種情況？", step: 11, o: [
      ["市場接受新的價格，要追多", false, "接受的特徵是有量、而且留在新價格。這裡沒量又回來了。"],
      ["沒量的突破被拒絕，價格回到價值區", true, "離開價值區時看量：沒量、又跌回來，代表新價格沒人認同，常常會回到 POC 附近。"],
      ["價值區已經失效，不用再看", false, "價格回到價值區，正好說明這個價值區還有效。"]] }
  ];

  PAGES["of-6"] = window.KIT.page(window.COURSE.OFC, "of-6", {
    topic: " Volume Profile",
    lede: "Footprint 訊號要出現在「對的地方」才有用。Volume Profile 把一整天的成交量按價格橫著堆起來，告訴你大家最常在哪裡交易。這一關一步一步算出 POC 和價值區，最後變成你盤前要畫的三條線。",
    analogy: [
      ["夜市的人潮", "整晚走下來，有些攤位前面一直擠滿人，有些攤位幾乎沒人經過。Volume Profile 就是把「每個價格有多少人交易」畫出來。"],
      ["大家都同意的價錢", "成交最多的價格（<b>POC</b>），就像大家都覺得「這個價錢合理」，價格常常會回到這裡。"],
      ["沒人逛的空巷子", "很少人交易的價格（<b>LVN</b>），價格經過時通常走很快，像穿過一條空巷子。"]],
    steps: STEPS, draw, simHTML, simMount,
    simIntro: "選一種形狀，或用「＋」「−」自己調每個價格的成交量，看 POC 和價值區怎麼跟著變。",
    mist: [
      ["POC 一定是支撐或阻力", "POC 是成交最多、大家最認同的價格，比較像「磁鐵」，價格常會被吸回來，不保證會在這裡反彈。"],
      ["價值區就是當天的最高到最低", "價值區只包含 70% 的成交量，通常比全天的高低範圍窄很多。"],
      ["在 LVN 看到訊號就進場", "LVN 是很少人交易的地方，價格通常很快穿過。找訊號要在價值區邊緣、HVN 這些有人在乎的價位。"]],
    faq: [
      ["Volume Profile 要用多長的時間來算？", "最常用的是「每天一個」（每個交易時段一個 Profile）。也有人看一週、一個月，或自己框選一段走勢。盤前最常用的是前一天的。"],
      ["為什麼是 70%？", "這是 Market Profile 傳下來的慣例，大約對應統計上一個標準差的範圍。它不是神奇數字，而是大家都這樣用，所以這些價位比較多人在看。"],
      ["不同軟體算出來的價值區不一樣？", "會有一點差異。有的一次比較一格（這一關的算法），有的一次比較兩格；交易時段的起訖時間設定也會影響。用之前確認你軟體的設定，固定用同一種。"],
      ["Volume Profile 和 Footprint 有什麼關係？", "Footprint 是一根 K 棒裡每個價格的成交；Volume Profile 是把很多根 K 棒的成交按價格加總。Profile 告訴你「在哪裡等」，Footprint 告訴你「到了之後誰在動手」。"],
      ["POC 和 VWAP 差在哪？", "POC 是成交量最多的那一個價格；VWAP 是所有成交的平均成本。兩者常常很接近，但不一定一樣。下一關會教 VWAP。"],
      ["TradingView 可以畫 Volume Profile 嗎？", "可以，TradingView 有固定範圍、時段等 Volume Profile 工具，有些功能需要付費方案。"]],
    qs: QS,
    gloss: [
      ["Volume Profile", "把一段時間的成交量，按價格橫著堆起來的圖。"],
      ["POC", "成交量最多的價格。"],
      ["價值區（VA）", "包含 70% 成交量的價格範圍。"],
      ["VAH／VAL", "價值區的上緣和下緣。"],
      ["HVN", "高量節點：成交特別多的價格，價格常會慢下來。"],
      ["LVN", "低量節點：成交特別少的價格，價格常會快速穿過。"]],
    remember: "<b>POC 是磁鐵，價值區是共識，LVN 是真空。</b>盤前畫好昨天的 POC、VAH、VAL，在價值區邊緣找訊號。"
  });
})();
