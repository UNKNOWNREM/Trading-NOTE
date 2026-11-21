/* 路線 1 第 13 關（新版）：風險管理——期望值與部位大小 */
(function () {
  const PAGES = (window.__PAGES = window.__PAGES || {});
  const { chip, lerp, ease, seg, cards, sg } = window.KIT;
  const rng = (seed) => { let a = seed >>> 0; return () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; };
  const r2 = (v) => (Math.round(v * 100) / 100).toFixed(2);
  // n 條平行世界，每條 m 筆：勝率 w、贏 rr、輸 1、每筆成本 c（單位都是 R）
  function paths(w, rr, c, n = 20, m = 100, seed = 7) {
    const R = rng(seed), out = [];
    for (let k = 0; k < n; k++) { let eq = 0; const p = [0]; for (let j = 0; j < m; j++) { eq += (R() < w ? rr : -1) - c; p.push(eq); } out.push(p); }
    return out;
  }
  function pathSVG(P, o = {}) {
    const m = P[0].length - 1, all = P.flat(), lo = Math.min(-10, ...all), hi = Math.max(10, ...all);
    const X = (j) => lerp(70, 600, j / m), Y = (v) => lerp(340, 40, (v - lo) / (hi - lo));
    let s = `<line x1="70" x2="600" y1="${Y(0)}" y2="${Y(0)}" class="s-ink"/><text x="62" y="${Y(0) + 4}" text-anchor="end" class="t-mute">0R</text><text x="62" y="${Y(hi) + 10}" text-anchor="end" class="t-mute">${Math.round(hi)}R</text><text x="62" y="${Y(lo)}" text-anchor="end" class="t-mute">${Math.round(lo)}R</text>`;
    const upto = o.upto == null ? m : o.upto;
    P.forEach((p) => { s += `<polyline points="${p.slice(0, upto + 1).map((v, j) => `${X(j).toFixed(1)},${Y(v).toFixed(1)}`).join(" ")}" class="${p[m] >= 0 ? "s-buy" : "s-sell"} f-none" stroke-width="1.4" opacity="0.6"/>`; });
    if (o.ex != null) s += `<line x1="${X(0)}" y1="${Y(0)}" x2="${X(upto)}" y2="${Y(o.ex * upto)}" class="s-ink" stroke-width="2.5" stroke-dasharray="6 4"/>`;
    s += `<text x="600" y="362" text-anchor="end" class="t-mute">第 ${upto} 筆</text>`;
    return s;
  }

  const STEPS = [
    { cap: "先學一個單位：<b>R</b>。R 是你每一筆交易<b>事先決定的最大虧損</b>。例如停損時會虧 $100，那這筆的 1R 就是 $100。",
      why: "用 R 來算，不管你交易 MNQ 還是 NQ、停損 10 點還是 30 點，都能用同一把尺比較。R 一定要在進場前就決定好。", stuck: "R 就像「一份賭注」。不管下注的是什麼，先說好一份是多少錢。" },
    { cap: "結果也用 R 表示：停損出場是 <b>−1R</b>；賺到停損距離的兩倍，就是 <b>+2R</b>。",
      why: "例如 1R ＝ $100：賺 $200 是 +2R，虧 $100 是 −1R，賺 $50 是 +0.5R。這樣記錄，才看得出一套方法長期好不好。" },
    { cap: "<b>期望值</b>＝勝率 × 平均賺幾 R − 敗率 × 平均賠幾 R。例：勝率 40%、贏 2R、輸 1R：0.4 × 2 − 0.6 × 1 ＝ <b>+0.2R</b>。",
      why: "期望值是「平均每做一筆，長期下來賺或賠多少」。+0.2R 代表每做 100 筆，平均大約賺 20R。這是例子 A：勝率不到一半，期望值卻是正的。", dur: 2200 },
    { cap: "換你算：勝率 <b>60%</b>，但每次贏只賺 <b>0.5R</b>，輸了賠 <b>1R</b>。",
      q: { t: "期望值是多少？", o: [
        ["+0.1R", false, "0.6 × 0.5 ＝ 0.3，0.4 × 1 ＝ 0.4，0.3 − 0.4 ＝ −0.1。"],
        ["−0.1R，勝率高也會虧", true, "這是例子 B。勝率 60% 看起來很好，但贏得太少、輸得太多，長期是虧的。"],
        ["+0.3R", false, "0.3 只算了贏的部分，還要扣掉輸的 40% × 1R。"]] } },
    { cap: "<b>損益兩平勝率</b>：風報比是 1:2 時，只要贏 <b>33%</b> 就不賺不賠；風報比 1:1 要贏 50%；1:0.5 要贏 67%。",
      why: "公式是 1 ÷ (1 ＋ 風報比)。風報比越高，需要的勝率越低。這也是為什麼前面一直提醒：風報比低於 1:2 要特別小心。" },
    { cap: "別忘了<b>成本</b>：手續費加上滑價，每一筆都會吃掉一點 R。例子 A 如果每筆成本 0.05R，期望值就從 +0.2R 變成 <b>+0.15R</b>。",
      why: "停損越小，成本佔 R 的比例越大。例如停損只有 4 點、來回成本 1 點，成本就吃掉 0.25R，原本 +0.2R 的方法直接變成負的。" },
    { cap: "期望值是正的，短期也可能虧錢。這是同一套規則（40% 贏 2R）在 <b>20 個平行世界</b>各交易 100 筆的結果。",
      why: "每條線都是同一套規則，只是運氣不同。有的世界大賺，有的世界 100 筆後還在虧。所以幾十筆的結果，很可能只是運氣，不能拿來判斷方法好壞。", dur: 3000 },
    { cap: "<b>連續虧損是常態</b>。勝率 40% 的方法，連輸 5 筆的機率是 0.6 的 5 次方，約 8%；做 100 筆的話，中間出現一次連輸 5 筆，幾乎是一定會遇到的事。",
      why: "很多人連輸幾筆就懷疑方法、改規則、加大部位想賺回來。先知道連虧本來就會發生，才不會在錯的時候亂改。" },
    { cap: "想一想：你的方法回測期望值 +0.2R，實際交易剛開始就<b>連輸 6 筆</b>。",
      q: { t: "比較合理的判斷是？", o: [
        ["方法壞了，馬上換一套", false, "6 筆的樣本太小。勝率 40% 的方法連輸 6 筆並不罕見。"],
        ["樣本太小，先檢查有沒有照規則做；照做的話就繼續累積樣本", true, "先分清楚是「沒照規則」還是「照規則但運氣差」。照規則的話，6 筆說明不了什麼。"],
        ["把部位加大，趕快賺回來", false, "這是報復性交易，下一關會講。連虧時加大部位，是爆倉最常見的原因。"]] } },
    { cap: "接著是<b>部位大小</b>：先決定停損放哪（想法錯了的地方）→ 算出每口的風險 → 用帳戶的固定比例當這筆的預算 → 預算 ÷ 每口風險 ＝ 口數，<b>無條件捨去</b>。",
      why: "順序很重要：停損是由「哪裡代表我錯了」決定，不能為了多下幾口去縮小停損。常見的做法是每筆風險帳戶的 0.5%～1%。", dur: 2400 },
    { cap: "例：帳戶 $10,000、每筆風險 1% ＝ $100。MNQ 停損 20 點，每口風險 20 × $2 ＝ $40，可以下 <b>2 口</b>（$80）。換成 NQ，每口 $400，<b>連 1 口都不能下</b>。",
      why: "$100 ÷ $40 ＝ 2.5，無條件捨去是 2 口。NQ 一口就超過預算 4 倍，這時應該用 MNQ，或放棄這筆，而不是硬下 NQ。", stuckHref: "#of-fut", stuckLabel: "回第 1 關複習每點價值 →", dur: 2400 },
    { cap: "換你算：帳戶 $10,000、每筆 1%（$100），交易 <b>ES（每點 $50）</b>，停損 4 點。",
      q: { t: "可以下幾口？", o: [
        ["2 口", false, "每口風險 4 × $50 ＝ $200，1 口就超過 $100 了。"],
        ["0 口：一口就超過預算，改用 MES（每點 $5，可下 5 口）或放棄", true, "ES 每口風險 $200 超過預算。MES 每口 4 × $5 ＝ $20，$100 ÷ $20 ＝ 5 口。"],
        ["把停損改成 2 點就能下 1 口", false, "停損要放在想法錯了的地方，不能為了口數去改。"]] } },
    { cap: "整理：用 <b>R</b> 記錄每一筆；看<b>期望值</b>（扣掉成本）而不是勝率；連虧是常態；<b>先決定停損，再算口數</b>，每筆只冒帳戶的一小部分。",
      why: "還要加一條：每天最多虧幾 R 就停手（例如 3R）。這條紀律在下一關「交易心理」會詳細講。" }
  ];

  function draw(svg, i, t) {
    const e = ease(t); let s = "";
    if (i === 0 || i === 1) {
      const Y = (p) => lerp(320, 60, (p - 26970) / 70);
      s += `<line x1="80" x2="440" y1="${Y(27000)}" y2="${Y(27000)}" class="s-ink" stroke-width="2"/><text x="86" y="${Y(27000) - 8}" class="t-ink t-b">進場</text>`;
      s += `<rect x="80" y="${Y(27000)}" width="360" height="${Y(26980) - Y(27000)}" class="f-sell-soft"/><line x1="80" x2="440" y1="${Y(26980)}" y2="${Y(26980)}" class="s-sell" stroke-width="2"/><text x="86" y="${Y(26980) + 18}" class="t-sell t-b">停損：虧 $100 ＝ 1R</text>`;
      if (i === 1) {
        s += `<g opacity="${seg(t, 0.1, 0.6)}"><rect x="80" y="${Y(27040)}" width="360" height="${Y(27000) - Y(27040)}" class="f-buy-soft"/><line x1="80" x2="440" y1="${Y(27040)}" y2="${Y(27040)}" class="s-buy" stroke-width="2"/><text x="86" y="${Y(27040) - 8}" class="t-buy t-b">目標：賺 $200 ＝ +2R</text></g>`;
        s += `<g opacity="${seg(t, 0.5, 1)}"><text x="470" y="120" class="t-buy t-b t-lg">+$200 → +2R</text><text x="470" y="160" class="t-ink t-b t-lg">+$50 → +0.5R</text><text x="470" y="200" class="t-sell t-b t-lg">−$100 → −1R</text></g>`;
      } else s += `<g opacity="${seg(t, 0.3, 0.9)}"><rect x="470" y="110" width="140" height="80" rx="12" class="f-gamma-soft"/><text x="540" y="145" text-anchor="middle" class="t-ink t-b t-xl">1R</text><text x="540" y="172" text-anchor="middle" class="t-mute">＝ $100</text></g>`;
    } else if (i === 2 || i === 3) {
      const [w, rr] = i === 2 ? [0.4, 2] : [0.6, 0.5];
      const ex = w * rr - (1 - w);
      const bw = 420, x0 = 110;
      s += `<text x="${x0}" y="70" class="t-ink t-b t-lg">${i === 2 ? "例子 A" : "例子 B"}：勝率 ${w * 100}%、贏 ${rr}R、輸 1R</text>`;
      s += `<rect x="${x0}" y="100" width="${bw * w * seg(t, 0, 0.5)}" height="50" rx="6" class="f-buy"/><rect x="${x0 + bw * w}" y="100" width="${bw * (1 - w) * seg(t, 0.2, 0.7)}" height="50" rx="6" class="f-sell"/>`;
      s += `<text x="${x0 + (bw * w) / 2}" y="131" text-anchor="middle" class="t-w t-b">贏 ${w * 100}%</text><text x="${x0 + bw * w + (bw * (1 - w)) / 2}" y="131" text-anchor="middle" class="t-w t-b">輸 ${Math.round((1 - w) * 100)}%</text>`;
      if (i === 2) s += `<g opacity="${seg(t, 0.5, 1)}"><text x="${x0}" y="210" class="t-ink t-lg">0.4 × 2 − 0.6 × 1</text><text x="${x0}" y="254" class="t-buy t-b t-xl">＝ +0.2R ／ 筆</text><text x="${x0}" y="290" class="t-mute">做 100 筆，平均約賺 20R</text></g>`;
      else s += `<text x="${x0}" y="220" class="t-ink t-b t-lg">期望值 ＝ ？</text>`;
    } else if (i === 4) {
      const R = [[2, 33], [1, 50], [0.5, 67]];
      R.forEach(([rr, be], k) => { const h = be * 2.6 * seg(t, k * 0.2, k * 0.2 + 0.4); s += `<rect x="${140 + k * 150}" y="${320 - h}" width="90" height="${h}" rx="6" class="${k === 0 ? "f-buy" : k === 1 ? "f-inkd" : "f-sell"}"/><text x="${185 + k * 150}" y="${312 - h}" text-anchor="middle" class="t-ink t-b t-lg">${be}%</text><text x="${185 + k * 150}" y="344" text-anchor="middle" class="t-mute">風報比 1:${rr}</text>`; });
      s += `<line x1="110" x2="580" y1="320" y2="320" class="s-ink"/><text x="110" y="50" class="t-ink t-b">需要贏幾成才不賠？　＝ 1 ÷ (1 ＋ 風報比)</text>`;
    } else if (i === 5) {
      const rows = [["期望值（沒算成本）", 0.2, "f-buy"], ["每筆成本 0.05R", -0.05, "f-sell"], ["實際期望值", 0.15, "f-buy"]];
      rows.forEach(([n, v, c], k) => { const w = Math.abs(v) * 1400 * seg(t, k * 0.25, k * 0.25 + 0.35); s += `<text x="70" y="${110 + k * 80}" class="t-ink t-b">${n}</text><rect x="70" y="${122 + k * 80}" width="${w}" height="30" rx="6" class="${c}"/><text x="${80 + w}" y="${143 + k * 80}" class="t-ink t-b">${sg(v, 2)}R</text>`; });
      s += `<text x="70" y="360" class="t-mute" opacity="${seg(t, 0.8, 1)}">停損越小，成本吃掉的比例越大</text>`;
    } else if (i === 6) {
      s += pathSVG(paths(0.4, 2, 0), { upto: Math.max(1, Math.round(seg(t, 0, 0.9) * 100)), ex: 0.2 });
      s += `<text x="80" y="30" class="t-mute">藍＝100 筆後賺錢，橘＝100 筆後還在虧，虛線＝期望值</text>`;
    } else if (i === 7) {
      const L = [1, 0, 0, 0, 0, 0, 1, 0, 1, 1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 1];
      L.forEach((v, k) => { const op = seg(t, k * 0.04, k * 0.04 + 0.1); s += `<rect x="${60 + k * 27}" y="140" width="22" height="50" rx="4" class="${v ? "f-buy" : "f-sell"}" opacity="${op}"/>`; });
      s += `<rect x="83" y="132" width="${27 * 5 + 2}" height="66" rx="8" class="f-none s-hl" stroke-width="2.5" opacity="${seg(t, 0.4, 0.6)}"/><text x="150" y="224" text-anchor="middle" class="t-ink t-b" opacity="${seg(t, 0.4, 0.6)}">連輸 5 筆</text>`;
      s += `<g opacity="${seg(t, 0.7, 1)}"><text x="60" y="290" class="t-ink t-lg">勝率 40% 的方法：連輸 5 筆 ＝ 0.6⁵ ≈ 8%</text><text x="60" y="320" class="t-mute">做 100 筆，中間遇到一次幾乎是必然</text></g>`;
      s += `<text x="60" y="110" class="t-mute">勝率 40% 的方法，20 筆的一種可能結果（藍贏、橘輸）</text>`;
    } else if (i === 8) {
      [0, 1, 2, 3, 4, 5].forEach((k) => { s += `<rect x="${120 + k * 64}" y="140" width="52" height="60" rx="6" class="f-sell"/><text x="${146 + k * 64}" y="176" text-anchor="middle" class="t-w t-b">−1R</text>`; });
      s += `<text x="120" y="110" class="t-ink t-b t-lg">期望值 +0.2R 的方法，一開始連輸 6 筆</text><text x="120" y="250" class="t-ink t-b">怎麼判斷？</text>`;
    } else if (i === 9 || i === 10 || i === 11) {
      const steps = [["停損放哪？", "想法錯了的地方"], ["每口風險", "停損點數 × 每點價值"], ["這筆預算", "帳戶 × 固定比例（0.5%～1%）"], ["口數", "預算 ÷ 每口風險，無條件捨去"]];
      if (i === 9) steps.forEach((r, k) => { s += `<g opacity="${seg(t, k * 0.2, k * 0.2 + 0.3)}"><rect x="${30 + k * 152}" y="140" width="140" height="96" rx="12" class="${k === 3 ? "f-gamma-soft" : "f-surface"} s-line"/><text x="${100 + k * 152}" y="176" text-anchor="middle" class="t-ink t-b">${r[0]}</text><text x="${100 + k * 152}" y="204" text-anchor="middle" class="t-mute">${r[1].length > 9 ? r[1].slice(0, 9) : r[1]}</text>${r[1].length > 9 ? `<text x="${100 + k * 152}" y="222" text-anchor="middle" class="t-mute">${r[1].slice(9)}</text>` : ""}${k < 3 ? `<text x="${172 + k * 152}" y="194" class="t-ink t-b">→</text>` : ""}</g>`; });
      else if (i === 10) {
        const R = [["帳戶 $10,000 × 1%", "＝ 預算 $100"], ["MNQ：20 點 × $2 ＝ $40／口", "$100 ÷ $40 ＝ 2.5 → 2 口"], ["NQ：20 點 × $20 ＝ $400／口", "超過預算 → 0 口"]];
        R.forEach((r, k) => { s += `<g opacity="${seg(t, k * 0.3, k * 0.3 + 0.35)}"><rect x="70" y="${70 + k * 90}" width="500" height="74" rx="12" class="${k === 2 ? "f-sell-soft" : k === 1 ? "f-buy-soft" : "f-surface"} s-line"/><text x="92" y="${102 + k * 90}" class="t-ink t-b t-lg">${r[0]}</text><text x="92" y="${128 + k * 90}" class="t-ink">${r[1]}</text></g>`; });
      } else s += `<text x="90" y="110" class="t-ink t-b t-lg">帳戶 $10,000，每筆 1% ＝ $100</text><text x="90" y="160" class="t-ink t-b t-lg">ES 每點 $50，停損 4 點</text><text x="90" y="220" class="t-ink t-b t-lg">可以下幾口？</text>`;
    } else if (i === 12) {
      s += cards([["R", "每筆事先決定的最大虧損，結果都用 R 記"], ["期望值", "勝率 × 贏 R − 敗率 × 輸 R − 成本"], ["連虧是常態", "幾十筆的結果可能只是運氣"], ["先停損，再口數", "口數 ＝ 預算 ÷ 每口風險，無條件捨去"], ["每天上限", "虧到設定的 R 數就停手"]], t, { hl: 3 });
    }
    svg.innerHTML = s;
  }

  /* ---------- 你來操作：期望值模擬 ＋ 口數計算 ---------- */
  const CON = [["MNQ（每點 $2）", 2], ["NQ（每點 $20）", 20], ["MES（每點 $5）", 5], ["ES（每點 $50）", 50]];
  const simHTML = `<div class="tabs rk-tabs"><button class="tab" data-k="mc" aria-selected="true" type="button">期望值模擬</button><button class="tab" data-k="ps" aria-selected="false" type="button">口數計算</button></div>
<div class="rk-mc"><div class="controls"><div class="ctl"><label>勝率 <b class="rk-w-v"></b></label><input class="rk-w" type="range" min="20" max="80" value="40"></div><div class="ctl"><label>平均贏幾 R <b class="rk-r-v"></b></label><input class="rk-r" type="range" min="0.5" max="4" step="0.25" value="2"></div><div class="ctl"><label>每筆成本（R） <b class="rk-c-v"></b></label><input class="rk-c" type="range" min="0" max="0.3" step="0.01" value="0"></div></div>
<div class="btn-row"><button class="btn rk-again" type="button">換一批運氣</button><button class="btn" data-pre="a" type="button">例子 A（40%、2R）</button><button class="btn" data-pre="b" type="button">例子 B（60%、0.5R）</button></div>
<svg class="fpx rk-svg" viewBox="0 0 640 380" role="img" aria-label="20 個平行世界"></svg><div class="rk-stat"></div></div>
<div class="rk-ps" hidden><div class="calc"><div class="calc-in"><label>帳戶（美元）<input type="number" class="ps-acc" value="10000" min="0" step="500"></label><label>每筆風險 <b class="ps-p-v"></b><input type="range" class="ps-p" min="0.25" max="3" step="0.25" value="1"></label><label>停損距離（點）<b class="ps-sl-v"></b><input type="range" class="ps-sl" min="2" max="80" step="1" value="20"></label><label>合約 <select class="ps-k">${CON.map((c, k) => `<option value="${k}">${c[0]}</option>`).join("")}</select></label></div><div class="c-res ps-res"></div></div></div>
<ul class="sim-task rk-task"></ul>`;
  function simMount(box) {
    const q = (s) => box.querySelector(s); let seed = 7; const done = {};
    function mc() {
      const w = +q(".rk-w").value / 100, rr = +q(".rk-r").value, c = +q(".rk-c").value;
      q(".rk-w-v").textContent = Math.round(w * 100) + "%"; q(".rk-r-v").textContent = rr + "R"; q(".rk-c-v").textContent = c.toFixed(2) + "R";
      const P = paths(w, rr, c, 20, 100, seed), ex = w * rr - (1 - w) - c, neg = P.filter((p) => p[100] < 0).length, be = 1 / (1 + rr);
      let maxDD = 0; P.forEach((p) => { let pk = 0; p.forEach((v) => { pk = Math.max(pk, v); maxDD = Math.max(maxDD, pk - v); }); });
      q(".rk-svg").innerHTML = pathSVG(P, { ex });
      q(".rk-stat").innerHTML = `<p>期望值 <b class="${ex >= 0 ? "pos" : "neg"}">${sg(ex, 2)}R／筆</b>　＝ ${r2(w)} × ${rr} − ${r2(1 - w)} × 1${c ? ` − ${r2(c)}` : ""}</p><p>損益兩平勝率 <b>${Math.round(be * 100)}%</b>　·　20 個世界裡 100 筆後還在虧的：<b>${neg} 個</b>　·　最大回撤 <b>${maxDD.toFixed(1)}R</b></p><p class="small">${ex > 0 && neg > 0 ? `期望值是正的，仍有 ${neg} 個世界在 100 筆後虧錢：短期結果很可能只是運氣。` : ex <= 0 ? "期望值不是正的：做越多，長期越虧。" : "這組參數下 20 個世界都賺錢，但注意最大回撤：中途可能連續虧很多 R。"}</p>`;
      if (w < 0.5 && ex > 0) done.a = true;
      if (w > 0.5 && ex < 0) done.b = true;
      paintTask();
    }
    function ps() {
      const acc = Math.max(0, +q(".ps-acc").value || 0), p = +q(".ps-p").value, sl = +q(".ps-sl").value, [nm, pv] = CON[+q(".ps-k").value];
      q(".ps-p-v").textContent = p + "%"; q(".ps-sl-v").textContent = sl + " 點";
      const budget = (acc * p) / 100, per = sl * pv, n = Math.floor(budget / per);
      q(".ps-res").innerHTML = `<p><span class="t1">這筆預算</span><b>$${budget.toFixed(2)}</b><span class="small">$${acc.toLocaleString()} × ${p}%</span></p><p><span class="t1">每口風險</span><b>$${per.toFixed(2)}</b><span class="small">${sl} 點 × $${pv}（${nm}）</span></p><p><span class="t1">可以下</span><b class="${n ? "pos" : "neg"}">${n} 口</b><span class="small">${n ? `實際風險 $${(n * per).toFixed(2)}` : "一口就超過預算：換小合約、或放棄這筆"}</span></p>`;
      if (n === 0) done.c = true;
      paintTask();
    }
    function paintTask() {
      q(".rk-task").innerHTML = [["a", "任務 1：調出一組「勝率低於 50%、期望值卻是正的」參數"], ["b", "任務 2：調出一組「勝率高於 50%、期望值卻是負的」參數"], ["c", "任務 3：在口數計算裡，找出一個「一口都不能下」的組合"]].map(([k, tx]) => `<li class="${done[k] ? "ok" : ""}">${done[k] ? "✓" : "○"} ${tx}</li>`).join("");
    }
    box.addEventListener("input", (e) => { if (e.target.closest(".rk-mc")) mc(); if (e.target.closest(".rk-ps")) ps(); });
    box.addEventListener("change", (e) => { if (e.target.closest(".rk-ps")) ps(); });
    box.addEventListener("click", (e) => {
      const tb = e.target.closest(".rk-tabs .tab"); if (tb) { const k = tb.dataset.k; box.querySelectorAll(".rk-tabs .tab").forEach((b) => b.setAttribute("aria-selected", String(b === tb))); q(".rk-mc").hidden = k !== "mc"; q(".rk-ps").hidden = k !== "ps"; return; }
      if (e.target.closest(".rk-again")) { seed++; mc(); return; }
      const pre = e.target.closest("[data-pre]"); if (pre) { const [w, r] = pre.dataset.pre === "a" ? [40, 2] : [60, 0.5]; q(".rk-w").value = w; q(".rk-r").value = r; q(".rk-c").value = 0; mc(); }
    });
    mc(); ps();
  }

  const QS = [
    { fig: `<p class="small q-cap">你的交易紀錄：100 筆，贏 35 筆、平均賺 2.5R；輸 65 筆、平均賠 1R；每筆成本約 0.1R。</p>`, q: "期望值大約是多少？", step: 6, o: [
      ["+0.225R", false, "0.225R 是還沒扣成本的期望值。每筆成本 0.1R 也要扣掉。"],
      ["+0.125R", true, "0.35 × 2.5 ＝ 0.875，0.65 × 1 ＝ 0.65，相減 0.225R，再扣成本 0.1R，得 +0.125R。成本吃掉了將近一半。"],
      ["−0.1R", false, "算一下：0.875 − 0.65 ＝ 0.225，扣掉 0.1 還是正的 0.125R。"]] },
    { fig: `<p class="small q-cap">帳戶 $5,000，每筆風險 1%。MNQ 停損 15 點。</p>`, q: "可以下幾口？", step: 11, o: [
      ["1 口", true, "預算 $50；每口風險 15 × $2 ＝ $30；$50 ÷ $30 ≈ 1.67，無條件捨去是 1 口。"],
      ["2 口", false, "2 口的風險是 $60，超過 $50 的預算。口數要無條件捨去。"],
      ["16 口", false, "這是用點數在算錢。每口風險要用「點數 × 每點價值」。"]] },
    { fig: `<p class="small q-cap">小華的方法勝率 75%，他很有信心。但他每次贏只賺 0.3R，輸的時候常常拖到虧 1.5R 才出場。</p>`, q: "他的期望值是正還是負？", step: 3, o: [
      ["正的，勝率 75% 很高", false, "0.75 × 0.3 ＝ 0.225，0.25 × 1.5 ＝ 0.375，0.225 − 0.375 ＝ −0.15R。"],
      ["負的，約 −0.15R", true, "勝率再高，贏得太少、輸得太多，長期還是虧。這也是不設停損、拖單的代價。"],
      ["剛好打平", false, "算一下：0.225 − 0.375 ＝ −0.15R，是負的。"]] }
  ];

  PAGES["of-8"] = window.KIT.page(window.COURSE.OFC, "of-8", {
    topic: "風險管理",
    lede: "很多人研究了一堆訊號，最後卻是因為部位太大、不設停損而爆倉。這一關用 R 這把尺，看懂期望值、損益兩平勝率和連續虧損，最後學會「先決定停損，再算口數」。",
    analogy: [
      ["保險公司", "保險公司不怕某一張保單賠錢，因為它算的是幾萬張保單的平均。交易也一樣，要看長期的<b>期望值</b>。"],
      ["一份賭注", "先說好每一把最多押多少（<b>1R</b>），不管牌好不好都不改。這樣再倒楣也不會一次輸光。"],
      ["擲硬幣", "一枚公平的硬幣，連續擲出 5 次反面也很正常。<b>連續虧損</b>不代表方法壞了。"]],
    steps: STEPS, draw, simHTML, simMount,
    simIntro: "左邊調勝率、風報比和成本，看 20 個平行世界交易 100 筆的結果；右邊輸入帳戶和停損，算出可以下幾口。",
    mist: [
      ["勝率高就會賺錢", "勝率 60%、贏 0.5R、輸 1R，期望值是 −0.1R。要看期望值，不是勝率。"],
      ["為了多下幾口，把停損縮小", "停損要放在想法錯了的地方。縮小停損只會讓你更容易被洗出場，而且成本佔比變大。"],
      ["連虧幾筆就換方法", "期望值是正的方法，短期連虧很正常。先檢查有沒有照規則做，照做的話就繼續累積樣本。"]],
    faq: [
      ["每筆要冒多少風險？", "常見建議是帳戶的 0.5%～1%。剛開始、還在驗證方法時，用更小的比例更安全。"],
      ["為什麼口數要無條件捨去？", "四捨五入可能讓實際風險超過預算。例如 2.6 口捨去成 2 口，風險一定在預算內。"],
      ["期望值要怎麼知道？", "只能用夠多的紀錄去估計：回測、模擬交易，或實際交易的日誌。樣本至少要幾十到上百筆，幾筆的結果說明不了什麼。"],
      ["最大回撤是什麼？", "帳戶從最高點往下跌最多的幅度。期望值是正的方法，中途也可能連虧很多 R，要確定自己的資金和心理撐得住。"],
      ["分批出場怎麼算 R？", "每一部分各自算，再依口數加權平均。例如一半在 +1R 出、一半在 +3R 出，整筆就是 +2R。"],
      ["每天最多虧多少要停手？", "常見是 2R～3R。到了就關掉平台，下一關會講為什麼這條規則這麼重要。"]],
    qs: QS,
    gloss: [
      ["R", "每筆交易事先決定的最大虧損，用來衡量所有結果。"],
      ["期望值", "勝率 × 平均賺 R − 敗率 × 平均賠 R − 成本。"],
      ["風報比", "目標距離 ÷ 停損距離。1:2 代表目標是停損的 2 倍。"],
      ["損益兩平勝率", "1 ÷ (1 ＋ 風報比)，不賺不賠需要的勝率。"],
      ["最大回撤", "帳戶從高點往下跌最多的幅度。"],
      ["部位大小", "口數 ＝ 帳戶風險預算 ÷ 每口風險，無條件捨去。"]],
    remember: "<b>先決定錯在哪，再算下幾口。</b>勝率高不代表賺錢，期望值扣掉成本還是正的，才有意義。"
  });
})();
