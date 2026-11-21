/* 路線 1 第 5 關（新）：CVD 與背離 */
(function () {
  const PAGES = (window.__PAGES = window.__PAGES || {});
  const { chip, lerp, ease, seg, sg } = window.KIT;
  const cum = (a) => a.reduce((o, v) => (o.push((o.length ? o[o.length - 1] : 0) + v), o), []);

  // 上圖：價格（y 50–190），下圖：CVD（y 230–340）
  function chart(o) {
    const n = o.price.length, X = (k) => lerp(o.x0 || 90, o.x1 || 590, n === 1 ? 0 : k / (n - 1));
    const pMin = Math.min(...o.price) - 2, pMax = Math.max(...o.price) + 2, PY = (v) => lerp(190, 50, (v - pMin) / (pMax - pMin));
    const cv = o.cvd, cMin = Math.min(0, ...cv) - 10, cMax = Math.max(0, ...cv) + 10, CY = (v) => lerp(340, 232, (v - cMin) / (cMax - cMin));
    const np = o.upto == null ? n : o.upto;
    let s = `<text x="20" y="60" class="t-mute">價格</text><text x="20" y="240" class="t-mute">CVD</text><line x1="${X(0) - 10}" x2="${X(n - 1) + 10}" y1="${CY(0)}" y2="${CY(0)}" class="s-line"/><text x="${X(0) - 16}" y="${CY(0) + 4}" text-anchor="end" class="t-mute">0</text>`;
    s += `<polyline points="${o.price.slice(0, np).map((v, k) => `${X(k)},${PY(v)}`).join(" ")}" class="s-ink f-none" stroke-width="2.5"/>`;
    if (o.cvdUpto !== 0) s += `<polyline points="${cv.slice(0, o.cvdUpto == null ? np : o.cvdUpto).map((v, k) => `${X(k)},${CY(v)}`).join(" ")}" class="s-buy f-none" stroke-width="2.5"/>`;
    return { s, X, PY, CY };
  }
  function pairLines(g, i1, i2, pv, cv, cls, label, op = 1) {
    return `<g opacity="${op}"><line x1="${g.X(i1)}" x2="${g.X(i2)}" y1="${g.PY(pv[i1]) - 8}" y2="${g.PY(pv[i2]) - 8}" class="${cls}" stroke-width="2" stroke-dasharray="5 4"/><line x1="${g.X(i1)}" x2="${g.X(i2)}" y1="${g.CY(cv[i1]) - 8}" y2="${g.CY(cv[i2]) - 8}" class="${cls}" stroke-width="2" stroke-dasharray="5 4"/>${label ? `<text x="${g.X(i2) + 10}" y="${(g.PY(pv[i2]) + g.CY(cv[i2])) / 2}" class="${cls.replace("s-", "t-")} t-b">${label}</text>` : ""}</g>`;
  }

  const D5 = [50, -20, 30, -10, 40];
  const UP = { p: [100, 106, 103, 110, 107, 115, 112, 119], d: [60, 50, -20, 60, -15, 55, -10, 45] };
  const BEAR = { p: [100, 108, 103, 112, 106, 115, 109, 113], d: [70, 60, -30, 30, -40, 10, -30, -10] };
  const BULL = { p: [115, 107, 112, 103, 109, 100, 106, 102], d: [-70, -60, 30, -30, 40, -10, 30, 10] };
  const LONG = { p: [100, 108, 104, 112, 108, 116, 112, 120, 116, 124], d: [70, 50, -20, 10, -30, 10, -30, 5, -20, 0] };
  const PASSIVE = { p: [100, 103, 105, 108, 110, 113, 116, 118], d: [10, -10, 5, -15, 0, -10, -5, -10] };

  const STEPS = [
    { cap: "先回想上一關：每根 K 棒都有一個 Delta。這裡有 5 根，Delta 分別是 +50、−20、+30、−10、+40。",
      why: "單看一根的 Delta，只知道那幾分鐘誰比較急。想知道一整段時間裡誰比較急，就要把它們加起來。", stuckHref: "#of-3", stuckLabel: "回上一關複習 Delta →", stuck: "Delta 就是每根 K 棒「急著買 − 急著賣」的口數。" },
    { cap: "把 Delta <b>一根一根加起來</b>：50 → 50 − 20 ＝ 30 → 30 + 30 ＝ 60 → 50 → 90。這條累加出來的線，就叫 <b>CVD</b>（累積 Delta）。",
      why: "CVD 是 Cumulative Volume Delta 的縮寫，意思就是「累積的 Delta」。就像存款簿：每天的收入支出是 Delta，餘額就是 CVD。", stuck: "存款簿的餘額＝每一筆收支加起來。CVD＝每一根 Delta 加起來。", dur: 2600 },
    { cap: "CVD 往上走，代表這段時間<b>主動買累積得比主動賣多</b>；往下走則是主動賣比較多。它看的是<b>趨勢</b>，不是某一根。",
      why: "中間就算有幾根負的 Delta，只要整體往上，CVD 還是往上。所以 CVD 比單根 Delta 更適合看一段時間的大方向。" },
    { cap: "CVD 要有一個<b>起算點</b>。大部分軟體預設每個交易時段開始時<b>歸零</b>，所以只能比較同一段裡的高低，不能拿昨天的數字比今天。",
      why: "起算點不同，整條線的位置就不同。例如從台灣晚上 9:30 美股開盤開始算，和從前一天下午開始算，畫出來的數字完全不一樣。重點是看線的形狀和高低點，而不是絕對數字。" },
    { cap: "練習一下：四根 K 棒的 Delta 是 <b>+50、−20、+30、−10</b>。",
      q: { t: "第四根結束時，CVD 是多少？", o: [
        ["+50", true, "50 − 20 ＋ 30 − 10 ＝ +50。一根一根加起來就是 CVD。"],
        ["+80", false, "80 是只加了正的（50 ＋ 30）。負的 Delta 也要算進去。"],
        ["−10", false, "−10 只是最後一根的 Delta。CVD 是全部加起來的結果。"]] } },
    { cap: "<b>同向</b>：價格一波比一波高，CVD 也一波比一波高。上漲有主動買在支撐，這是健康的上漲。",
      why: "每一次創新高，都有更多主動買進來推。這種情況下，CVD 和價格互相確認。", dur: 2000 },
    { cap: "<b>看跌背離</b>：價格創了<b>更高的高點</b>，CVD 的高點卻<b>比上一次低</b>。第二次衝高時，主動買變少了。",
      why: "價格還在創新高，但推上去的力氣變小了：可能是買方沒那麼積極了，也可能是上面有人在用限價單賣（吸收）。這是「動能可能減弱」的警訊，不是「馬上會跌」。", stuck: "像開車：車速創新高，但油門越踩越輕。", dur: 2400 },
    { cap: "<b>看漲背離</b>：價格創了<b>更低的低點</b>，CVD 的低點卻<b>比上一次高</b>。第二次下殺時，主動賣變少了。",
      why: "跟看跌背離對稱。價格還在破低，但賣方的力氣在減弱，或下面有人在接。", dur: 2400 },
    { cap: "練習一下：價格破了前低，CVD 卻沒有破前低，反而比上次的低點高。",
      q: { t: "這是哪一種情況？", o: [
        ["看跌背離：要小心下跌", false, "看跌背離是價格創新高、CVD 沒跟上。這裡是價格破低。"],
        ["看漲背離：賣方力氣在減弱", true, "價格創新低，CVD 卻沒跟著創新低，代表這次下殺的主動賣比上次少。"],
        ["同向：賣方推得動", false, "同向的話，CVD 也會跟著創新低。這裡 CVD 沒有破低。"]] } },
    { cap: "常見誤判一：背離可以<b>持續很久</b>。這裡價格連續創了三次新高，每一次 CVD 都比上次低，價格還是一路漲。",
      why: "背離只說明「力氣在變小」，不說明「什麼時候反轉」。如果看到第一次背離就做空，會連續停損三次。背離要配合重要價位和其他確認訊號，不能單獨當成進場點。", dur: 2600 },
    { cap: "常見誤判二：價格一路漲，CVD 卻平平甚至往下。這不一定是壞事，可能是<b>限價買單一路往上掛</b>，被動地把價格墊高。",
      why: "在很強的趨勢裡，買方常常不用市價單去追，而是在下面一直掛限價買單、越掛越高。主動賣方賣給他們，Delta 是負的，價格卻往上。所以 CVD 往下、價格往上，不能直接解讀成「要跌了」。", dur: 2400 },
    { cap: "整理：<b>CVD ＝ Delta 一路加起來</b>。背離是「力氣變小」的警訊，要在重要價位、再加上其他確認，才考慮行動。",
      why: "實際用法：價格走到前高或價值區邊緣 → 出現 CVD 看跌背離 → 再看到吸收或 Delta 轉向這類確認 → 才考慮做空，停損放在高點外面。第 12 關會教這些確認訊號。" }
  ];

  function draw(svg, i, t) {
    const e = ease(t); let s = "";
    if (i <= 1) {
      const X = (k) => 130 + k * 100;
      D5.forEach((d, k) => {
        const h = Math.abs(d) * 1.1, y = d >= 0 ? 160 - h : 160;
        s += `<rect x="${X(k) - 18}" y="${y}" width="36" height="${h}" rx="4" class="${d >= 0 ? "f-buy" : "f-sell"}"/><text x="${X(k)}" y="${d >= 0 ? y - 6 : y + h + 16}" text-anchor="middle" class="${d >= 0 ? "t-buy" : "t-sell"} t-b">${sg(d)}</text>`;
      });
      s += `<line x1="90" x2="590" y1="160" y2="160" class="s-ink"/><text x="80" y="164" text-anchor="end" class="t-mute">Delta</text>`;
      if (i === 1) {
        const c = cum(D5), CY = (v) => 330 - v * 0.9, k = Math.min(4, Math.floor(e * 5));
        s += `<line x1="90" x2="590" y1="330" y2="330" class="s-line"/><text x="80" y="334" text-anchor="end" class="t-mute">CVD</text>`;
        s += `<polyline points="${c.slice(0, k + 1).map((v, j) => `${X(j)},${CY(v)}`).join(" ")}" class="s-buy f-none" stroke-width="3"/>`;
        c.slice(0, k + 1).forEach((v, j) => { s += `<circle cx="${X(j)}" cy="${CY(v)}" r="5" class="f-buy"/><text x="${X(j)}" y="${CY(v) - 12}" text-anchor="middle" class="t-ink t-b">${v}</text>`; });
        const prev = k ? c[k - 1] : 0;
        s += `<text x="350" y="214" text-anchor="middle" class="t-mute">${k ? `${prev} ${D5[k] >= 0 ? "＋" : "−"} ${Math.abs(D5[k])} ＝ ${c[k]}` : "第 1 根：從 0 開始，加 50"}</text>`;
      }
    } else if (i === 2) {
      const p = [100, 103, 101, 105, 104, 108], d = [40, 30, -20, 50, -10, 40];
      const g = chart({ price: p, cvd: cum(d), upto: Math.max(2, Math.ceil(seg(t, 0, 0.7) * p.length)) });
      s += g.s + `<text x="330" y="370" text-anchor="middle" class="t-ink t-b" opacity="${seg(t, 0.7, 1)}">中間有負 Delta，CVD 整體仍往上</text>`;
    } else if (i === 3) {
      const X = (k) => 90 + k * 55;
      const c1 = cum([30, 20, -10, 40, 10]), c2 = cum([-20, 30, 20, -10, 30]);
      const CY = (v) => 230 - v * 1.4;
      s += `<line x1="80" x2="600" y1="230" y2="230" class="s-line"/>`;
      s += `<polyline points="${c1.map((v, k) => `${X(k)},${CY(v)}`).join(" ")}" class="s-buy f-none" stroke-width="2.5"/>`;
      s += `<g opacity="${seg(t, 0.2, 0.6)}"><line x1="${X(4.5)}" x2="${X(4.5)}" y1="60" y2="300" class="s-gamma" stroke-width="2" stroke-dasharray="6 4"/><text x="${X(4.5) + 6}" y="76" class="t-gamma t-b">新的時段開始：歸零</text></g>`;
      s += `<polyline opacity="${seg(t, 0.4, 0.9)}" points="${[0, ...c2].map((v, k) => `${X(k + 4.5)},${CY(v)}`).join(" ")}" class="s-buy f-none" stroke-width="2.5"/>`;
      s += `<text x="90" y="330" class="t-mute" opacity="${seg(t, 0.6, 1)}">只比較同一段裡的高低，不要拿前一段的數字比</text>`;
    } else if (i === 4) {
      const X = (k) => 160 + k * 100, d = [50, -20, 30, -10];
      d.forEach((v, k) => { const h = Math.abs(v) * 1.4, y = v >= 0 ? 190 - h : 190; s += `<rect x="${X(k) - 20}" y="${y}" width="40" height="${h}" rx="4" class="${v >= 0 ? "f-buy" : "f-sell"}"/><text x="${X(k)}" y="${v >= 0 ? y - 6 : y + h + 16}" text-anchor="middle" class="${v >= 0 ? "t-buy" : "t-sell"} t-b">${sg(v)}</text>`; });
      s += `<line x1="110" x2="520" y1="190" y2="190" class="s-ink"/><text x="330" y="300" text-anchor="middle" class="t-ink t-b t-lg">第四根結束時，CVD ＝ ？</text>`;
    } else if (i >= 5 && i <= 8) {
      const set = [UP, BEAR, BULL, BULL][i - 5], c = cum(set.d);
      const g = chart({ price: set.p, cvd: c, upto: i === 8 ? set.p.length : Math.max(2, Math.ceil(seg(t, 0, 0.6) * set.p.length)) });
      s += g.s;
      if (i === 5) s += pairLines(g, 3, 5, set.p, c, "s-gamma", "都創新高", seg(t, 0.6, 0.9));
      if (i === 6) s += pairLines(g, 3, 5, set.p, c, "s-sell", "", seg(t, 0.6, 0.9)) + `<g opacity="${seg(t, 0.7, 1)}"><text x="${g.X(5) + 12}" y="${g.PY(set.p[5])}" class="t-ink t-b">價格：更高</text><text x="${g.X(5) + 12}" y="${g.CY(c[5])}" class="t-sell t-b">CVD：更低</text></g>`;
      if (i === 7) s += `<g opacity="${seg(t, 0.6, 0.9)}"><line x1="${g.X(3)}" x2="${g.X(5)}" y1="${g.PY(set.p[3]) + 10}" y2="${g.PY(set.p[5]) + 10}" class="s-buy" stroke-width="2" stroke-dasharray="5 4"/><line x1="${g.X(3)}" x2="${g.X(5)}" y1="${g.CY(c[3]) + 10}" y2="${g.CY(c[5]) + 10}" class="s-buy" stroke-width="2" stroke-dasharray="5 4"/><text x="${g.X(5) + 12}" y="${g.PY(set.p[5]) + 14}" class="t-ink t-b">價格：更低</text><text x="${g.X(5) + 12}" y="${g.CY(c[5]) + 14}" class="t-buy t-b">CVD：更高</text></g>`;
      if (i === 8) s += `<text x="330" y="372" text-anchor="middle" class="t-mute">價格破了前低，CVD 沒有破前低</text>`;
    } else if (i === 9) {
      const c = cum(LONG.d), g = chart({ price: LONG.p, cvd: c, upto: Math.max(2, Math.ceil(seg(t, 0, 0.8) * LONG.p.length)) });
      s += g.s;
      [[1, 3], [3, 5], [5, 7], [7, 9]].forEach(([a, b], k) => { if (seg(t, 0, 0.8) * LONG.p.length > b + 0.5) s += pairLines(g, a, b, LONG.p, c, "s-sell", "", 1) + `<text x="${g.X(b)}" y="${g.PY(LONG.p[b]) - 18}" text-anchor="middle" class="t-sell t-b">背離 ${k + 1}</text>`; });
      s += `<text x="330" y="372" text-anchor="middle" class="t-ink t-b" opacity="${seg(t, 0.85, 1)}">連續背離，價格照樣一路漲</text>`;
    } else if (i === 10) {
      const c = cum(PASSIVE.d), g = chart({ price: PASSIVE.p, cvd: c, upto: Math.max(2, Math.ceil(seg(t, 0, 0.7) * PASSIVE.p.length)) });
      s += g.s;
      s += `<g opacity="${seg(t, 0.5, 0.9)}">${[1, 3, 5].map((k) => `<rect x="${g.X(k) - 16}" y="${g.PY(PASSIVE.p[k]) + 10}" width="32" height="18" rx="4" class="f-buy-soft"/><text x="${g.X(k)}" y="${g.PY(PASSIVE.p[k]) + 23}" text-anchor="middle" class="t-buy t-b">限價買</text>`).join("")}</g>`;
      s += `<text x="330" y="372" text-anchor="middle" class="t-ink t-b" opacity="${seg(t, 0.7, 1)}">買方在下面一路掛單墊高，CVD 往下價格照漲</text>`;
    } else if (i === 11) {
      const rows = [["CVD", "每根 Delta 一路加起來，看一段時間誰比較急"], ["同向", "價格和 CVD 一起創高（或創低）：推得動"], ["看跌背離", "價格創高、CVD 沒創高：買方力氣變小"], ["看漲背離", "價格創低、CVD 沒創低：賣方力氣變小"], ["怎麼用", "重要價位 ＋ 背離 ＋ 其他確認，才考慮行動"]];
      rows.forEach((r, k) => { s += `<g opacity="${seg(t, k * 0.14, k * 0.14 + 0.3)}"><rect x="60" y="${30 + k * 64}" width="520" height="54" rx="10" class="${k === 4 ? "f-gamma-soft" : "f-surface"} s-line"/><circle cx="86" cy="${57 + k * 64}" r="11" class="f-buy"/><text x="86" y="${62 + k * 64}" text-anchor="middle" class="t-w t-b">${k + 1}</text><text x="108" y="${52 + k * 64}" class="t-ink t-b t-lg">${r[0]}</text><text x="108" y="${73 + k * 64}" class="t-ink">${r[1]}</text></g>`; });
    }
    svg.innerHTML = s;
  }

  /* ---------- 你來操作：自己調 Delta，看 CVD 和背離 ---------- */
  const SP = [100, 106, 102, 110, 105, 114, 109, 117];
  const simHTML = `<svg class="fpx cv-svg" viewBox="0 0 640 380" role="img" aria-label="價格與 CVD"></svg>
<p class="cv-msg sim-msg" aria-live="polite"></p>
<div class="cv-ctl">${SP.map((p, k) => `<label>第 ${k + 1} 根<b class="cv-v" data-k="${k}"></b><input type="range" min="-100" max="100" step="10" data-k="${k}"></label>`).join("")}</div>
<div class="btn-row"><button class="btn" data-pre="up" type="button">範例：同向上漲</button><button class="btn" data-pre="bear" type="button">範例：看跌背離</button><button class="btn" data-pre="zero" type="button">全部歸零</button></div>
<ul class="sim-task cv-task"></ul>`;
  function simMount(box) {
    const q = (s) => box.querySelector(s), ins = [...box.querySelectorAll(".cv-ctl input")];
    const PRE = { up: [60, 50, -20, 60, -10, 50, -10, 40], bear: [70, 60, -30, 30, -40, 10, -30, -10], zero: [0, 0, 0, 0, 0, 0, 0, 0] };
    const done = {};
    const set = (a) => ins.forEach((el, k) => (el.value = a[k]));
    function paint() {
      const d = ins.map((el) => +el.value), c = cum(d);
      ins.forEach((el, k) => (q(`.cv-v[data-k="${k}"]`).textContent = " " + sg(d[k])));
      const g = chart({ price: SP, cvd: c });
      let s = g.s;
      c.forEach((v, k) => { s += `<circle cx="${g.X(k)}" cy="${g.CY(v)}" r="4" class="f-buy"/><text x="${g.X(k)}" y="${g.CY(v) - 9}" text-anchor="middle" class="t-mute">${v}</text>`; });
      // 價格高點在第 2、4、6、8 根（index 1,3,5,7），比較最後兩個高點
      const hi = [1, 3, 5, 7], div = [];
      for (let j = 1; j < hi.length; j++) { const a = hi[j - 1], b = hi[j]; if (c[b] < c[a]) div.push([a, b]); }
      div.forEach(([a, b]) => { s += pairLines(g, a, b, SP, c, "s-sell", "", 1); });
      q(".cv-svg").innerHTML = s;
      const last = div.some(([a, b]) => b === 7);
      const same = hi.every((b, j) => j === 0 || c[b] > c[hi[j - 1]]);
      q(".cv-msg").innerHTML = same ? "價格每次創新高，CVD 也跟著創新高：<b>同向</b>，上漲有主動買支撐。" : div.length ? `出現 <b>${div.length} 次看跌背離</b>（紅色虛線）：價格創新高，CVD 的高點卻比上一次低。` : "調整每根 K 棒的 Delta，看 CVD 怎麼變。價格的高點在第 2、4、6、8 根。";
      if (same) done.a = true;
      if (last) done.b = true;
      if (c[7] < 0) done.c = true;
      q(".cv-task").innerHTML = [["a", "任務 1：讓價格和 CVD 每次都一起創新高（同向）"], ["b", "任務 2：做出最後一個高點的看跌背離（第 8 根）"], ["c", "任務 3：讓價格一路漲，但 CVD 最後變成負的（想想第 11 步）"]].map(([k, tx]) => `<li class="${done[k] ? "ok" : ""}">${done[k] ? "✓" : "○"} ${tx}</li>`).join("");
    }
    ins.forEach((el) => el.addEventListener("input", paint));
    box.addEventListener("click", (e) => { const b = e.target.closest("[data-pre]"); if (!b) return; set(PRE[b.dataset.pre]); paint(); });
    set(PRE.zero); paint();
  }

  const QS = [
    { fig: `<p class="small q-cap">四根 K 棒的 Delta 依序是 <b>+80、−30、+20、−50</b>。</p>`, q: "第四根結束時 CVD 是多少？", step: 2, o: [
      ["+20", true, "80 − 30 ＋ 20 − 50 ＝ +20。"],
      ["−50", false, "−50 只是最後一根的 Delta。CVD 要從第一根一路加。"],
      ["+180", false, "180 是把所有數字的大小加起來，忽略了正負號。"]] },
    { fig: `<p class="small q-cap">價格在前高上方又創了新高，但這次 CVD 的高點明顯比上次低。</p>`, q: "最合理的解讀是？", step: 7, o: [
      ["看跌背離：這次衝高的主動買變少了，要提高警覺", true, "價格更高、CVD 更低，是看跌背離。它是動能減弱的警訊，要配合位置和確認，不是自動做空的訊號。"],
      ["看漲背離：買方越來越強", false, "看漲背離是價格創低、CVD 沒創低。這裡是創高。"],
      ["一定會馬上反轉，立刻做空", false, "背離可以持續很久（第 10 步）。只憑背離就進場，常常會連續停損。"]] },
    { fig: `<p class="small q-cap">小明看到第一次看跌背離就做空，被停損；第二次背離再做空，又被停損。價格連續創了三次新高。</p>`, q: "他最主要的問題是？", step: 10, o: [
      ["背離的定義算錯了", false, "他每次都正確認出背離，問題不在定義。"],
      ["把背離當成進場訊號，沒有等重要價位和其他確認", true, "背離只說明力氣在變小，不說明什麼時候反轉。要在重要價位、再看到吸收或 Delta 轉向這類確認，才考慮進場。"],
      ["應該改看 Delta，不要看 CVD", false, "CVD 本身沒有錯，錯的是用法。單根 Delta 一樣不能單獨當進場訊號。"]] }
  ];

  PAGES["of-cvd"] = window.KIT.page(window.COURSE.OFC, "of-cvd", {
    topic: " CVD",
    lede: "單根 K 棒的 Delta 只看得到幾分鐘。把 Delta 一路加起來，就能看一整段時間誰比較急，也能發現「價格創新高、力氣卻變小」的背離。這一關也會教背離最常見的兩種誤判。",
    analogy: [
      ["存款簿的餘額", "每天的收入和支出是 Delta，一路加起來的餘額就是 <b>CVD</b>。"],
      ["越踩越輕的油門", "車速還在創新高，油門卻越踩越輕。價格創新高、CVD 沒跟上，就是<b>背離</b>。"],
      ["慢慢減速不等於馬上停車", "油門鬆了，車子還會往前滑很久。背離也一樣，<b>不代表馬上反轉</b>。"]],
    steps: STEPS, draw, simHTML, simMount,
    simIntro: "價格的路線固定（高點在第 2、4、6、8 根），你調整每根 K 棒的 Delta，看 CVD 怎麼變、什麼時候出現背離。",
    mist: [
      ["看到背離就反向進場", "背離可以連續出現好幾次，價格照樣走。要等價格到重要價位、再有其他確認訊號，才考慮行動。"],
      ["拿今天的 CVD 數字跟昨天比", "CVD 的數字取決於從哪裡開始算，通常每個時段歸零。只比較同一段裡的高低點。"],
      ["CVD 往下、價格往上，一定會跌", "強勢趨勢中，買方常在下面一路掛限價單把價格墊高，主動賣方賣給他們，CVD 往下但價格照漲。"]],
    faq: [
      ["CVD 和 Delta 差在哪？", "Delta 是一根 K 棒的主動買減主動賣；CVD 是把很多根的 Delta 一路加起來。Delta 看當下，CVD 看一段時間的趨勢。"],
      ["CVD 從哪裡開始算？", "看軟體設定，常見的是每天或每個交易時段開始時歸零，也可以從畫面最左邊開始算。起點不同，線的位置就不同，所以重點是形狀和高低點。"],
      ["一定要 Footprint 軟體才能看 CVD 嗎？", "需要有成交資料才算得出來。NinjaTrader、ATAS 等軟體有精確的 CVD；TradingView 也有 CVD 指標，但它是用比較小週期的資料估算，精細度依方案和週期而定。"],
      ["背離要差多少才算？", "沒有標準數字。比較兩個明顯的高點（或低點）：價格比上次高、CVD 比上次低，就算看跌背離。差距越明顯越值得注意。"],
      ["要在哪個時間框看背離？", "看你操作的時間框。非常小的週期上背離到處都是，大部分是雜訊；在重要價位、你操作的週期上出現的才有參考價值。"],
      ["背離成功率高嗎？", "沒有可靠的統計可以說它單獨使用就有優勢，所以這套筆記只把它當成「警訊」，搭配位置和確認訊號使用，並用自己的交易紀錄去驗證。"]],
    qs: QS,
    gloss: [
      ["CVD", "累積 Delta：把每根 K 棒的 Delta 一路加起來的線。"],
      ["起算點", "CVD 從哪裡開始加，通常每個時段歸零。"],
      ["同向", "價格和 CVD 一起創高或一起創低。"],
      ["看跌背離", "價格創新高，CVD 高點卻比上次低。"],
      ["看漲背離", "價格創新低，CVD 低點卻比上次高。"],
      ["被動墊價", "買方用限價單一路往上掛，把價格墊高，CVD 可能往下。"]],
    remember: "<b>CVD ＝ Delta 一路加起來。</b>背離是力氣變小的警訊，不是進場訊號；要在重要價位、再有其他確認才考慮行動。"
  });
})();
