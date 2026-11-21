/* 路線 1 第 9 關（新版）：Market Profile（TPO）與拍賣 */
(function () {
  const PAGES = (window.__PAGES = window.__PAGES || {});
  const { chip, lerp, ease, seg, cards } = window.KIT;
  const PR = [110, 109, 108, 107, 106, 105, 104, 103, 102];   // 由上到下
  // 每 30 分鐘一個字母：[字母, 最低, 最高]
  const DAY = [["A", 103, 108], ["B", 106, 109], ["C", 105, 107], ["D", 104, 106], ["E", 104, 107], ["F", 105, 106], ["G", 105, 106]];
  const RY = (p) => 50 + PR.indexOf(p) * 34, CW = 28;

  function letters(day, upto, o = {}) {
    let s = PR.map((p) => `<text x="70" y="${RY(p) + 5}" text-anchor="end" class="t-mute">${p}</text>`).join("");
    day.slice(0, upto).forEach(([L, lo, hi], k) => {
      for (let p = lo; p <= hi; p++) {
        const x = o.collapse ? null : 96 + k * CW;
        s += `<text x="${x}" y="${RY(p) + 5}" text-anchor="middle" class="${o.hl && o.hl.includes(L) ? "t-gamma t-b" : "t-buy t-b"} t-lg">${L}</text>`;
      }
    });
    return s;
  }
  // 往左收攏：每個價格依字母順序排
  function collapsed(day, upto, t = 1, o = {}) {
    let s = PR.map((p) => `<text x="70" y="${RY(p) + 5}" text-anchor="end" class="${o.poc === p ? "t-ink t-b" : "t-mute"}">${p}</text>`).join("");
    const rowCount = {};
    day.slice(0, upto).forEach(([L, lo, hi], k) => {
      for (let p = lo; p <= hi; p++) {
        const j = rowCount[p] || 0; rowCount[p] = j + 1;
        const x = lerp(96 + k * CW, 96 + j * CW, t);
        const single = o.singles && o.singles.includes(p);
        s += `<text x="${x}" y="${RY(p) + 5}" text-anchor="middle" class="${single ? "t-sell t-b" : o.va && p <= o.va[1] && p >= o.va[0] ? "t-buy t-b" : "t-mute t-b"} t-lg">${L}</text>`;
      }
    });
    return { s, rowCount };
  }
  const count = (day) => { const c = {}; day.forEach(([, lo, hi]) => { for (let p = lo; p <= hi; p++) c[p] = (c[p] || 0) + 1; }); return c; };
  function tpoVA(day) {
    const c = count(day), ps = Object.keys(c).map(Number).sort((a, b) => b - a), tot = ps.reduce((s, p) => s + c[p], 0);
    const mx = Math.max(...ps.map((p) => c[p])), cand = ps.filter((p) => c[p] === mx);
    const mid = (Math.max(...ps) + Math.min(...ps)) / 2, poc = cand.sort((a, b) => Math.abs(a - mid) - Math.abs(b - mid))[0];
    let hi = poc, lo = poc, cum = c[poc];
    while (cum < tot * 0.7) { const up = c[hi + 1] || 0, dn = c[lo - 1] || 0; if (up === 0 && dn === 0) break; if (up >= dn) { hi++; cum += up; } else { lo--; cum += dn; } }
    return { c, poc, hi, lo, tot };
  }
  const V = tpoVA(DAY);

  const STEPS = [
    { cap: "上一關用<b>成交量</b>看大家在哪裡交易。Market Profile 改用<b>時間</b>：每 30 分鐘一個字母，那段時間價格去過哪些價位，就在那裡寫上這個字母。",
      why: "每一個字母叫一個 TPO（Time Price Opportunity，時間價格機會）。字母越多的價格，代表價格在那裡停留越久。", stuckHref: "#of-6", stuckLabel: "回第 7 關複習 Volume Profile →", stuck: "像打卡：價格每 30 分鐘到過哪些價位，就在那些價位蓋一個章。" },
    { cap: "第一個 30 分鐘叫 <b>A</b>：價格在 103～108 之間，所以 103 到 108 每一格都寫上 A。",
      why: "這是這個例子。字母通常從 A 開始，每 30 分鐘換下一個字母。" },
    { cap: "第二個 30 分鐘 <b>B</b> 在 106～109；之後 C、D、E、F、G 依序寫上去。",
      dur: 2600, why: "每段時間只要價格碰過某個價位，就算一個字母，不管停留多久、成交多少。" },
    { cap: "把每一列的字母<b>往左收攏</b>，就得到 Market Profile 的形狀。和 Volume Profile 很像，只是長度代表的是<b>時間</b>。",
      why: "收攏之後，每一列的長度＝價格在那裡停留了幾個 30 分鐘。", dur: 2200 },
    { cap: "字母最多的那一列是 <b>TPO 版的 POC</b>：價格停留最久的價位。這裡是 106，共 7 個字母。",
      why: "如果有好幾列一樣長，通常取最靠近整天中間的那一列。TPO 的 POC 和成交量的 POC 常常很接近，但不一定一樣。" },
    { cap: "A 和 B 兩個時段（開盤第一個小時）的範圍，叫<b>初始平衡（IB）</b>：103～109。",
      why: "IB 是 Initial Balance 的縮寫。開盤第一小時，買賣雙方先試出一個範圍。之後價格怎麼對待這個範圍，透露今天誰比較強。美股正規盤是台灣時間晚上 10:30 開盤（冬令），所以 IB 大約是 10:30～11:30。" },
    { cap: "練習一下：另一天 A 時段在 200～204，B 時段在 202～207。",
      q: { t: "這一天的初始平衡（IB）是多少？", o: [
        ["200～204", false, "這只是 A 時段。IB 是 A 和 B 兩個時段合起來的範圍。"],
        ["200～207", true, "A 的最低 200、B 的最高 207，合起來就是 IB：200～207。"],
        ["202～204", false, "這是 A 和 B 重疊的部分。IB 要取兩段合起來的最高和最低。"]] } },
    { cap: "價值區一樣用 70%：從 POC 往外加字母，直到包含全部字母的 70%。這裡是 <b>105～107</b>。",
      why: "這天共 24 個字母，70% 約 17 個：106（7 個）→ 加 105（6 個）累計 13 → 加 107（4 個）累計 17。算法和上一關一樣，只是把成交量換成字母數。" },
    { cap: "只有<b>一個字母</b>的價位叫<b>單一印記</b>（這裡 103、109）。代表價格在那裡只停留很短，快速經過。",
      why: "單一印記常出現在快速移動的地方。之後價格回到那裡，常會有反應（被當成支撐或阻力），或是很快又穿過去把它「補起來」。" },
    { cap: "<b>拍賣</b>的觀念：價格往新的地方試探，有人跟（停留、有量）就是<b>接受</b>；沒人跟、很快回來就是<b>拒絕</b>，又叫失敗的拍賣。",
      why: "市場像一場拍賣，價格往上試探找賣家、往下試探找買家。突破價值區或 IB 之後，能不能留在新價格，是判斷方向的關鍵。", dur: 2600 },
    { cap: "練習一下：價值區 4990～5010。價格衝到 5012，但成交量很小，很快又回到 5008。",
      q: { t: "這比較像是哪一種？", o: [
        ["成功的拍賣：接受新價格", false, "成功的拍賣會留在新價格、而且有量。這裡沒量又回來了。"],
        ["失敗的拍賣：拒絕新價格，可能回到價值區中間", true, "衝出去沒人跟、又回到價值區，是失敗的拍賣。常見的想法是價格可能回到 POC 附近。"],
        ["無法判斷，要等收盤", false, "量很小、價格回到價值區，這兩個條件已經足夠判斷是拒絕。"]] } },
    { cap: "用 IB 看今天的樣子：價格<b>一直待在 IB 裡</b>，比較像平衡日；價格<b>往一邊一再延伸</b>超出 IB，比較像趨勢日。",
      why: "IB 很窄、之後一直往同一邊延伸，代表一方很強。IB 很寬、之後都在裡面，代表雙方勢均力敵。這只是觀察的方向，不是一定的規則。", dur: 2400 },
    { cap: "整理：Market Profile 用<b>時間</b>看大家在哪裡停留。重點是 TPO 的 POC、價值區、IB 和單一印記，以及價格離開價值區之後是接受還是拒絕。",
      why: "成交量（Volume Profile）和時間（Market Profile）兩種看法互相補充。下一關會學一天之中不同時段的特性。" }
  ];

  function draw(svg, i, t) {
    const e = ease(t); let s = "";
    if (i === 0) {
      s += PR.map((p) => `<text x="70" y="${RY(p) + 5}" text-anchor="end" class="t-mute">${p}</text>`).join("");
      s += `<g opacity="${seg(t, 0.2, 0.8)}"><rect x="320" y="70" width="270" height="130" rx="12" class="f-gamma-soft"/><text x="336" y="104" class="t-ink t-b t-lg">每 30 分鐘一個字母</text><text x="336" y="134" class="t-ink">價格去過哪些價位，</text><text x="336" y="158" class="t-ink">就在那些價位寫上字母</text><text x="336" y="184" class="t-mute">A、B、C……依序</text></g>`;
    } else if (i === 1) {
      s += letters(DAY.slice(0, 1).map(([L, lo, hi]) => [L, lo, Math.round(lerp(lo, hi, e))]), 1);
      s += `<text x="140" y="${RY(108) + 5}" class="t-ink t-b" opacity="${seg(t, 0.6, 1)}">← A：103～108</text>`;
    } else if (i === 2) {
      const n = Math.max(2, Math.ceil(seg(t, 0, 0.9) * DAY.length));
      s += letters(DAY, n);
      s += `<text x="${96 + n * CW + 10}" y="${RY(DAY[n - 1][2]) + 5}" class="t-mute">${DAY[n - 1][0]}：${DAY[n - 1][1]}～${DAY[n - 1][2]}</text>`;
    } else if (i === 3) {
      s += collapsed(DAY, DAY.length, e).s;
    } else if (i === 4) {
      const r = collapsed(DAY, DAY.length, 1, { poc: V.poc });
      s += r.s + `<rect x="82" y="${RY(V.poc) - 15}" width="${r.rowCount[V.poc] * CW + 4}" height="30" rx="6" class="f-none s-hl" stroke-width="2.5" opacity="${seg(t, 0.1, 0.5)}"/><text x="${96 + r.rowCount[V.poc] * CW + 16}" y="${RY(V.poc) + 5}" class="t-ink t-b" opacity="${seg(t, 0.3, 0.8)}">← TPO 的 POC：停留最久</text>`;
    } else if (i === 5) {
      s += letters(DAY, DAY.length, { hl: ["A", "B"] });
      s += `<g opacity="${seg(t, 0.2, 0.7)}"><rect x="82" y="${RY(109) - 15}" width="${CW * 2 + 4}" height="${RY(103) - RY(109) + 30}" rx="8" class="f-none s-gamma" stroke-width="2.5"/><text x="${96 + DAY.length * CW + 20}" y="${RY(109) + 5}" class="t-gamma t-b">IB 上緣 109</text><text x="${96 + DAY.length * CW + 20}" y="${RY(103) + 5}" class="t-gamma t-b">IB 下緣 103</text><text x="${96 + DAY.length * CW + 20}" y="${RY(106) + 5}" class="t-mute">A＋B＝開盤第一小時</text></g>`;
    } else if (i === 6) {
      s += `<text x="90" y="80" class="t-buy t-b t-lg">A：200～204</text><text x="90" y="120" class="t-buy t-b t-lg">B：202～207</text><text x="90" y="180" class="t-ink t-b t-lg">IB ＝ ？</text>`;
    } else if (i === 7) {
      const r = collapsed(DAY, DAY.length, 1, { poc: V.poc, va: [V.lo, V.hi] });
      s += r.s + `<g opacity="${seg(t, 0.2, 0.7)}"><line x1="80" x2="400" y1="${RY(V.hi) - 15}" y2="${RY(V.hi) - 15}" class="s-buy" stroke-width="2" stroke-dasharray="6 4"/><line x1="80" x2="400" y1="${RY(V.lo) + 15}" y2="${RY(V.lo) + 15}" class="s-buy" stroke-width="2" stroke-dasharray="6 4"/><text x="404" y="${RY(V.hi) - 10}" class="t-buy t-b">VAH ${V.hi}</text><text x="404" y="${RY(V.lo) + 20}" class="t-buy t-b">VAL ${V.lo}</text><text x="404" y="${RY(106) + 5}" class="t-mute">共 ${V.tot} 個字母，70% 約 ${Math.ceil(V.tot * 0.7)} 個</text></g>`;
    } else if (i === 8) {
      const singles = Object.keys(V.c).map(Number).filter((p) => V.c[p] === 1);
      const r = collapsed(DAY, DAY.length, 1, { singles });
      s += r.s + `<g opacity="${seg(t, 0.2, 0.7)}">${singles.map((p) => `<text x="130" y="${RY(p) + 5}" class="t-sell t-b">← 單一印記</text>`).join("")}</g>`;
    } else if (i === 9 || i === 10) {
      const Y = (p) => lerp(320, 60, (p - 4980) / 40);
      s += `<rect x="70" y="${Y(5010)}" width="530" height="${Y(4990) - Y(5010)}" class="f-buy-soft"/><text x="76" y="${Y(5010) - 6}" class="t-buy t-b">價值區 4990～5010</text>`;
      const A = [[80, 5000], [160, 5006], [220, 5011], [280, 5016], [340, 5019], [400, 5018], [460, 5022]];
      const B = [[80, 5000], [160, 5006], [220, 5010], [280, 5012], [330, 5010], [390, 5005], [460, 5000]];
      if (i === 9) {
        const n = Math.max(2, Math.ceil(seg(t, 0, 0.8) * A.length));
        s += `<polyline points="${A.slice(0, n).map((q) => `${q[0]},${Y(q[1])}`).join(" ")}" class="s-buy f-none" stroke-width="3"/><polyline points="${B.slice(0, n).map((q) => `${q[0]},${Y(q[1])}`).join(" ")}" class="s-sell f-none" stroke-width="3" stroke-dasharray="6 4"/>`;
        s += `<g opacity="${seg(t, 0.75, 1)}"><text x="470" y="${Y(5022) + 4}" class="t-buy t-b">留下來、有量：接受</text><text x="470" y="${Y(5000) + 4}" class="t-sell t-b">沒人跟、回來：拒絕</text></g>`;
      } else {
        s += `<polyline points="${B.slice(0, 6).map((q) => `${q[0]},${Y(q[1])}`).join(" ")}" class="s-ink f-none" stroke-width="3"/><text x="280" y="${Y(5012) - 12}" text-anchor="middle" class="t-ink t-b">5012（量很小）</text><text x="400" y="${Y(5005) + 24}" class="t-ink t-b">回到 5008</text>`;
      }
    } else if (i === 11) {
      const Y = (p) => lerp(320, 50, (p - 96) / 20);
      const panel = (x0, title, pts, ib, op) => `<g opacity="${op}"><text x="${x0}" y="34" class="t-ink t-b">${title}</text><rect x="${x0}" y="${Y(ib[1])}" width="250" height="${Y(ib[0]) - Y(ib[1])}" class="f-gamma-soft"/><text x="${x0 + 4}" y="${Y(ib[1]) - 4}" class="t-gamma">IB</text><polyline points="${pts.map((q, k) => `${x0 + 10 + k * 30},${Y(q)}`).join(" ")}" class="s-ink f-none" stroke-width="2.5"/></g>`;
      s += panel(50, "平衡日：一直在 IB 裡", [104, 107, 103, 106, 104, 107, 105, 106], [102, 108], seg(t, 0, 0.4));
      s += panel(340, "趨勢日：往一邊一再延伸", [100, 103, 102, 105, 107, 109, 111, 114], [99, 104], seg(t, 0.4, 0.8));
    } else if (i === 12) {
      s += cards([["TPO", "每 30 分鐘一個字母，看價格在哪裡停留"], ["POC 與價值區", "字母最多的價位；包含 70% 字母的範圍"], ["初始平衡 IB", "開盤第一小時（A＋B）的範圍"], ["單一印記", "只有一個字母：快速經過的地方"], ["接受或拒絕", "離開價值區後，留下來是接受，回來是拒絕"]], t, { hl: 4 });
    }
    svg.innerHTML = s;
  }

  /* ---------- 你來操作：一段一段播出 TPO ---------- */
  const SIMD = {
    bal: { name: "平衡日", d: [["A", 103, 107], ["B", 104, 108], ["C", 105, 107], ["D", 103, 106], ["E", 104, 107], ["F", 105, 108], ["G", 104, 106], ["H", 105, 107]] },
    trend: { name: "趨勢日", d: [["A", 102, 104], ["B", 103, 104], ["C", 104, 105], ["D", 104, 106], ["E", 105, 107], ["F", 106, 108], ["G", 107, 109], ["H", 108, 110]] },
    fail: { name: "失敗的突破", d: [["A", 104, 107], ["B", 103, 106], ["C", 105, 107], ["D", 106, 109], ["E", 107, 110], ["F", 105, 107], ["G", 104, 106], ["H", 104, 105]] }
  };
  const simHTML = `<div class="btn-row tp-day">${Object.entries(SIMD).map(([k, d]) => `<button class="btn" data-d="${k}" type="button">${d.name}</button>`).join("")}</div>
<div class="tp-sim"><svg class="fpx tp-svg" viewBox="0 0 280 320" role="img" aria-label="TPO 練習"></svg><div class="side tp-out"></div></div>
<div class="btn-row"><button class="btn primary tp-next" type="button">下一個 30 分鐘</button><button class="btn tp-col" type="button">收攏／展開</button><button class="btn tp-reset" type="button">重來</button></div>
<ul class="sim-task tp-task"></ul>`;
  function simMount(box) {
    const q = (s) => box.querySelector(s); let key = "bal", n = 1, col = false; const done = {}, seen = {};
    function paint() {
      const d = SIMD[key].d.slice(0, n), c = count(d), ib = [Math.min(d[0][1], (d[1] || d[0])[1]), Math.max(d[0][2], (d[1] || d[0])[2])];
      let s = PR.map((p) => `<text x="40" y="${RY(p) + 5 - 20}" text-anchor="end" class="t-mute">${p}</text>`).join("");
      const rc = {};
      d.forEach(([L, lo, hi], k) => { for (let p = lo; p <= hi; p++) { const j = rc[p] || 0; rc[p] = j + 1; const x = col ? 62 + j * 24 : 62 + k * 24; s += `<text x="${x}" y="${RY(p) + 5 - 20}" text-anchor="middle" class="${k < 2 ? "t-gamma t-b" : "t-buy t-b"}">${L}</text>`; } });
      if (n >= 2) s += `<rect x="49" y="${RY(ib[1]) - 36}" width="${col ? 26 : 50}" height="${RY(ib[0]) - RY(ib[1]) + 30}" rx="6" class="f-none s-gamma" stroke-width="2" stroke-dasharray="5 4"/>`;
      q(".tp-svg").innerHTML = s;
      const ps = Object.keys(c).map(Number), mx = Math.max(...ps.map((p) => c[p])), singles = ps.filter((p) => c[p] === 1).sort((a, b) => b - a);
      const ext = n > 2 ? { up: d.slice(2).some((x) => x[2] > ib[1]), dn: d.slice(2).some((x) => x[1] < ib[0]) } : { up: false, dn: false };
      q(".tp-out").innerHTML = `<p><b>${SIMD[key].name}</b>　已播 ${n} / 8 段</p>${n >= 2 ? `<p>IB：${ib[0]}～${ib[1]}</p>` : "<p>播完 B 時段才有 IB。</p>"}<p>停留最久：${ps.filter((p) => c[p] === mx).sort((a, b) => b - a).join("、")}（${mx} 個字母）</p><p>單一印記：${singles.length ? singles.join("、") : "沒有"}</p>${n > 2 ? `<p>${ext.up && !ext.dn ? "已經往上延伸超出 IB" : ext.dn && !ext.up ? "已經往下延伸超出 IB" : ext.up && ext.dn ? "兩邊都超出過 IB" : "目前都在 IB 裡面"}</p>` : ""}`;
      seen[key] = n === 8 ? true : seen[key];
      if (key === "trend" && n === 8) done.a = true;
      if (key === "fail" && n === 8) done.b = true;
      if (seen.bal && seen.trend && seen.fail) done.c = true;
      q(".tp-task").innerHTML = [["a", "任務 1：播完「趨勢日」，看 IB 之後價格往哪邊延伸"], ["b", "任務 2：播完「失敗的突破」，找出價格衝出去又回來的那幾段"], ["c", "任務 3：三種日子都播完，比較收攏後的形狀"]].map(([k, tx]) => `<li class="${done[k] ? "ok" : ""}">${done[k] ? "✓" : "○"} ${tx}</li>`).join("");
    }
    box.addEventListener("click", (e) => {
      const d = e.target.closest("[data-d]"); if (d) { key = d.dataset.d; n = 1; paint(); return; }
      if (e.target.closest(".tp-next")) { n = Math.min(8, n + 1); paint(); }
      if (e.target.closest(".tp-col")) { col = !col; paint(); }
      if (e.target.closest(".tp-reset")) { n = 1; paint(); }
    });
    paint();
  }

  const QS = [
    { fig: `<p class="small q-cap">某個價位只有一個字母 F，上下的價位都有 4～5 個字母。</p>`, q: "這個價位叫什麼？代表什麼？", step: 9, o: [
      ["POC，價格停留最久", false, "POC 是字母最多的價位。這裡只有一個字母，是停留最短的。"],
      ["單一印記，價格只在那裡短暫經過", true, "只有一個字母的價位是單一印記，代表價格快速經過，之後回到這裡常會有反應。"],
      ["初始平衡，開盤第一小時的範圍", false, "初始平衡是 A 和 B 兩段的範圍，跟單一價位的字母數無關。"]] },
    { fig: `<p class="small q-cap">IB 在 103～109。之後的 C 到 H 每一段，都在 103～109 之間來回，沒有超出。</p>`, q: "今天比較像哪一種日子？", step: 12, o: [
      ["平衡日：雙方勢均力敵", true, "價格一直留在 IB 裡，代表沒有一方能把價格推出去，比較像平衡日。"],
      ["趨勢日：一方很強", false, "趨勢日會往一邊一再延伸，超出 IB。這裡都沒有超出。"],
      ["失敗的拍賣", false, "失敗的拍賣是衝出去又被拉回來。這裡根本沒有衝出 IB。"]] },
    { fig: `<p class="small q-cap">昨天價值區 4990～5010。今天價格突破 5010 後，在 5015～5025 之間停留了好幾個 30 分鐘，成交量也很大。</p>`, q: "這比較像哪一種情況？", step: 10, o: [
      ["失敗的拍賣，價格會回到價值區", false, "失敗的拍賣是很快被拉回來。這裡停留了很久、量也大。"],
      ["成功的拍賣：市場接受更高的價格", true, "突破後留在新價格、而且有量，是接受。新的價值區可能在更高的地方形成。"],
      ["看不出來，TPO 只能看收盤後", false, "盤中就能看到價格在新價位停留了幾個 30 分鐘。"]] }
  ];

  PAGES["of-7"] = window.KIT.page(window.COURSE.OFC, "of-7", {
    topic: " Market Profile",
    lede: "Volume Profile 用成交量看大家在哪裡交易，Market Profile 改用時間：每 30 分鐘一個字母，看價格在哪裡停留最久。這一關一步一步把字母寫上去、收攏起來，再學初始平衡、單一印記和「接受或拒絕」的拍賣觀念。",
    analogy: [
      ["打卡紀錄", "每 30 分鐘蓋一次章，記下價格到過哪些價位。蓋最多章的地方，就是價格停留最久的地方。"],
      ["拍賣會", "拍賣官往上喊價找買家、往下喊價找賣家。有人跟就成交（<b>接受</b>），沒人跟就退回來（<b>拒絕</b>）。"],
      ["開場暖身", "比賽前第一個小時雙方試探出的範圍，就是<b>初始平衡</b>。之後誰能打出這個範圍，誰就比較強。"]],
    steps: STEPS, draw, simHTML, simMount,
    simIntro: "選一種日子，按「下一個 30 分鐘」一段一段播出字母，觀察 IB、停留最久的價位和單一印記怎麼變。",
    mist: [
      ["TPO 的 POC 和成交量的 POC 一定一樣", "TPO 看停留時間，Volume Profile 看成交量。價格可能在某處停留很久但成交不多，兩者常常接近但不一定一樣。"],
      ["衝出價值區就是突破", "要看接不接受：留在新價格、有量才是接受；很快回來就是拒絕（失敗的拍賣）。"],
      ["單一印記一定會被補回來", "單一印記常常之後會有反應，但不保證會回測，更不保證在那裡反彈。它只是標出快速經過的地方。"]],
    faq: [
      ["為什麼是 30 分鐘一個字母？", "這是 Market Profile 創始時的慣例，大部分軟體都用 30 分鐘。也可以改成別的長度，但用的人少，參考價值也比較低。"],
      ["字母從什麼時候開始算？", "通常從正規交易時段開盤開始。NQ 的話，常用美股開盤（台灣冬令晚上 10:30、夏令 9:30）當 A 時段的開始。"],
      ["Market Profile 和 Volume Profile 要選哪一個？", "可以兩個都看。Volume Profile 比較直接，現在更常用；Market Profile 多了時間和 IB、單一印記這些觀念，對理解拍賣很有幫助。"],
      ["IB 有多重要？", "很多交易者會看 IB 被突破後能延伸多遠，或是否一直被困在 IB 裡，用來判斷今天是平衡還是趨勢。它是觀察工具，不是單獨的進場訊號。"],
      ["哪裡看得到 TPO？", "Sierra Chart、ATAS、NinjaTrader（外掛）都有。TradingView 也有內建的 TPO 圖表（需要付費方案）。"],
      ["這一關覺得太多怎麼辦？", "可以先記住兩件事就好：停留越久越被認同；離開價值區後，留下來是接受，回來是拒絕。其他的之後再回來看。"]],
    qs: QS,
    gloss: [
      ["TPO", "每 30 分鐘一個字母，標出價格到過的價位。"],
      ["Market Profile", "把 TPO 往左收攏後的形狀，看價格停留的時間。"],
      ["初始平衡（IB）", "開盤第一小時（A＋B 時段）的價格範圍。"],
      ["單一印記", "只有一個字母的價位，價格快速經過的地方。"],
      ["接受", "價格離開價值區後留在新價格，而且有量。"],
      ["拒絕（失敗的拍賣）", "價格衝出去沒人跟，很快回到原本的範圍。"]],
    remember: "<b>停留越久越被認同。</b>離開價值區時看量和時間：留下來是接受，很快回來是拒絕。"
  });
})();
