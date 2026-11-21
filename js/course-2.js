/* 圖解第 4–7 關。共用元件在 course.js（window.COURSE）。 */
(function () {
  const PAGES = (window.__PAGES = window.__PAGES || {});
  const { SOP, LESSONS, T, strip, foot, remember, quizHTML, mountLesson, loop, interp, nf, sgn, RM, $ } = window.COURSE;

  /* ---------- lesson 4: wait for the zone ---------- */
  const L4Q = [
    { q: "你把每個關鍵區都畫成 ±200 點，結果一整天有 80% 的時間價格都「在區內」。這代表什麼？", o: [
      ["很好，機會變多了", false, "機會變多是假象。關注區的用處是篩掉大部分時間，讓你只在少數位置專心看訂單流。"],
      ["區畫太寬，失去篩選作用，要縮窄", true, "如果大部分時間都在區內，就等於沒有區。寬度要多少，沒有標準答案，要用 Replay 測：先窄一點，再看會不會錯過太多。"],
      ["代表今天是正 Gamma", false, "在區內的時間比例取決於你畫多寬，跟環境無關。"]] },
    { q: "盤中價格離最近的區還很遠，你應該把注意力放在哪裡？", o: [
      ["每一根 K 棒的 Footprint，避免錯過機會", false, "整天盯著每根 K 棒，最容易在沒有位置的地方衝動進場。"],
      ["確認區的位置和劇本，設好價格提醒，其他時間休息", true, "等待也是工作。盤前寫好劇本、設提醒，價格到了再看訂單流。"],
      ["重新畫一個離價格比較近的區", false, "盤中為了有事做而改區，是最常見的自我欺騙。"]] }
  ];
  PAGES["learn-4"] = {
    title: LESSONS[3].title,
    lede: "這一步沒有任何指標，只有紀律。關鍵區是用來篩掉大部分時間的：價格不在區內，你就不需要看 Footprint。",
    chips: [["", "第 4 關　約 5 分鐘"]],
    html: `${strip(SOP, 3)}
<div class="scene"><div class="scene-h"><h3>一整個交易時段，你真正需要專心幾次？</h3><p class="small">拖動「區的寬度」，看看畫寬一點會發生什麼事。</p></div>
<div class="scene-grid"><svg id="l4-svg" viewBox="0 0 560 270" role="img" aria-label="價格經過三個關鍵區的動畫"></svg>
<div class="side"><div class="light" id="l4-light"><i></i><span>等待中</span></div><p id="l4-say" style="margin:8px 0 10px"></p>
<div class="kpi"><div class="k-l">已經過的時間</div><div class="k-v" id="l4-min">0 分鐘</div></div>
<div class="kpi" style="margin-top:6px"><div class="k-l">整段時間裡，在區內的比例</div><div class="k-v" id="l4-pct"></div></div>
<div class="kpi" style="margin-top:6px"><div class="k-l">進區次數（需要專心看 Footprint 的次數）</div><div class="k-v" id="l4-n"></div></div></div></div>
<div class="controls" style="margin-top:10px"><div class="ctl"><label for="l4-w">區的寬度 <b id="l4-w-v"></b></label><input id="l4-w" type="range" min="10" max="200" step="5" value="20"></div></div>
<div class="btn-row"><button class="btn" id="l4-play" type="button">暫停</button></div></div>

<div class="duo">
<div class="op"><h4>盤前（10 分鐘）</h4><ul style="margin:0;padding-left:1.2em"><li>看淨 GEX 正負，決定今天是彈簧還是雪球</li><li>標出 Call Wall、Put Wall、Flip、預期波動</li><li>每個區寫一句劇本：「到這裡，看到什麼才做」</li><li>在看盤軟體設價格提醒</li></ul></div>
<div class="of"><h4>盤中</h4><ul style="margin:0;padding-left:1.2em"><li>提醒沒響：不看 Footprint，不下單</li><li>提醒響了：打開 Footprint，照劇本檢查</li><li>劇本的條件沒出現：放棄這次，等下一個區</li></ul></div></div>
${quizHTML(L4Q, "l4-")}
${remember("區的用處是<b>篩掉大部分時間</b>。如果你一整天都覺得「在區內」，代表區畫錯了，不是機會變多了。")}
${foot(SOP, 3)}`,
    mount(root) {
      const svg = $(root, "#l4-svg"), N = 400, base = 26500;
      const X = (i) => 46 + (i / N) * 500, Y = (u) => 255 - u * 2.4, U = (pts) => pts / 10;
      const keys = [[0, 60], [50, 72], [80, 79], [95, 74], [140, 62], [180, 52], [210, 46], [240, 40], [280, 28], [300, 21], [320, 24], [360, 35], [400, 55]];
      const P = Array.from({ length: N + 1 }, (_, i) => interp(keys, i) + 1.6 * Math.sin(i * 0.53) + 1.2 * Math.sin(i * 1.7 + 2) + 0.7 * Math.sin(i * 3.1));
      const Z = [{ u: 80, n: "Call Wall 27,300" }, { u: 45, n: "Flip 26,950" }, { u: 20, n: "Put Wall 26,700" }];
      let t = 0, w = 20;
      const inZ = (v) => Z.some((z) => Math.abs(v - z.u) <= U(w));
      function stats() {
        let inside = 0, n = 0, out = 99;
        // a new visit counts only after price has been outside every zone for 15 minutes
        P.forEach((v) => { const k = inZ(v); if (k) { inside++; if (out >= 15) n++; out = 0; } else out++; });
        $(root, "#l4-pct").textContent = Math.round((inside / P.length) * 100) + "%";
        $(root, "#l4-n").textContent = n + " 次";
        $(root, "#l4-w-v").textContent = "±" + w + " 點";
      }
      function draw() {
        const i = Math.round(t), k = inZ(P[i]);
        svg.innerHTML = `${[0, 25, 50, 75, 100].map((u) => `<line x1="46" x2="546" y1="${Y(u)}" y2="${Y(u)}" style="stroke:var(--line)"/><text x="40" y="${Y(u) + 4}" text-anchor="end">${nf(base + u * 10)}</text>`).join("")}
          ${Z.map((z) => `<rect x="46" width="500" y="${Y(z.u + U(w))}" height="${Y(z.u - U(w)) - Y(z.u + U(w))}" style="fill:var(--gamma);opacity:${k && Math.abs(P[i] - z.u) <= U(w) ? 0.34 : 0.14}"/><line x1="46" x2="546" y1="${Y(z.u)}" y2="${Y(z.u)}" style="stroke:var(--gamma-ink);stroke-dasharray:5 5"/><text x="542" y="${Y(z.u) - 5}" text-anchor="end" style="fill:var(--gamma-ink)">${z.n}</text>`).join("")}
          <polyline fill="none" style="stroke:var(--line);stroke-width:1.5" points="${P.map((v, j) => `${X(j).toFixed(1)},${Y(v).toFixed(1)}`).join(" ")}"/>
          <polyline fill="none" style="stroke:var(--buy);stroke-width:2.2" points="${P.slice(0, i + 1).map((v, j) => `${X(j).toFixed(1)},${Y(v).toFixed(1)}`).join(" ")}"/>
          <circle cx="${X(i)}" cy="${Y(P[i])}" r="5.5" style="fill:${k ? "var(--gamma)" : "var(--buy)"};stroke:var(--surface);stroke-width:2"/>`;
        const lt = $(root, "#l4-light"); lt.classList.toggle("on", k); $(lt, "span").textContent = k ? "進入關注區" : "等待中";
        $(root, "#l4-say").innerHTML = k ? "提醒響了。打開 Footprint，照你寫好的劇本檢查條件。" : "價格不在任何區內。<b>不看 Footprint，不下單。</b>";
        $(root, "#l4-min").textContent = i + " 分鐘";
      }
      const btn = $(root, "#l4-play");
      const lp = loop(svg, (dt) => { t += dt * 0.03; if (t > N) t = 0; draw(); });
      if (RM) { lp.pause(); t = 90; btn.textContent = "播放"; }
      $(root, "#l4-w").addEventListener("input", (e) => { w = +e.target.value; stats(); draw(); });
      btn.addEventListener("click", () => { if (lp.on) { lp.pause(); btn.textContent = "播放"; } else { lp.play(); btn.textContent = "暫停"; } });
      stats(); draw();
      mountLesson(SOP, root, 3, L4Q, "l4-");
    }
  };

  /* ---------- lesson 5: footprint confirmation ---------- */
  const FP = {
    abs: { name: "吸收（在 Put Wall）", px: [26830, 26825, 26820, 26815, 26810, 26805, 26800], zone: 6, zoneName: "Put Wall",
      bid: [40, 120, 210, 380, 520, 690, 740], ask: [85, 160, 190, 140, 160, 210, 260],
      path: [2, 3, 3, 4, 4, 5, 5, 6, 5, 6, 6, 5, 6, 5, 4, 5, 4, 3, 3, 2, 2, 1, 0, 1, 1],
      notes: ["最下面三格的主動賣（520、690、740）是整根最多的，而且出現了<b>賣方失衡</b>（紅框）。", "可是價格碰到 26,800（Put Wall）就再也沒有更低。", "收盤回到 26,825，Delta 卻是 −1,495：<b>賣的人很多，卻沒有把價格賣下去</b>。代表下面有人用限價單一直接，這就是吸收。", "劇本：這是考慮做多的線索。進場還要等下一根 K 棒不再破低（確認），停損放在牆的外側。"] },
    brk: { name: "突破（負 Gamma 節點）", px: [27035, 27030, 27025, 27020, 27015, 27010, 27005], zone: 4, zoneName: "負值節點",
      bid: [90, 110, 120, 140, 160, 180, 150], ask: [380, 420, 450, 400, 210, 170, 120],
      path: [5, 6, 5, 6, 5, 4, 4, 3, 3, 2, 2, 1, 1, 0, 1, 0, 0],
      notes: ["上面三格出現<b>連續的買方失衡</b>（藍框）：這一格的主動買，是右下那一格主動賣的 3 倍以上。連續 3 格叫「堆疊失衡」。", "價格穿過 27,015 的節點後沒有回頭，收在最高 27,035。", "Delta +1,200，和價格同方向：<b>主動買方推得動，而且有人跟</b>。", "劇本：負 Gamma 環境下，這是順勢做多的線索。常見做法是等價格回測節點附近再進場，停損放在節點下方。"] }
  };
  function imb(bid, ask) {
    // diagonal: ask at row r vs bid one row lower (r+1); bid at row r vs ask one row higher (r-1). Ratio 3x, minimum 50.
    const a = new Set(), b = new Set();
    for (let r = 0; r < bid.length; r++) {
      if (r + 1 < bid.length && ask[r] >= 50 && ask[r] >= 3 * Math.max(1, bid[r + 1])) a.add(r);
      if (r - 1 >= 0 && bid[r] >= 50 && bid[r] >= 3 * Math.max(1, ask[r - 1])) b.add(r);
    }
    return { a, b };
  }
  const L5Q = [
    { q: "Footprint 的一格寫著「賣 300 × 買 120」。這一格的 Delta 是多少？", o: [
      ["+180", false, "方向反了。Delta＝主動買 − 主動賣＝120 − 300。"],
      ["−180", true, "主動買 120 減主動賣 300＝−180。這一格是賣方比較積極。"],
      ["420", false, "那是總成交量（買＋賣），不是 Delta。"]] },
    { q: "價格到 Put Wall，最下面三格主動賣都超過 600，但價格沒有再破低，最後收在 K 棒上半部。這比較像？", o: [
      ["突破：賣方很強，應該追空", false, "賣方很強卻沒有把價格賣下去，代表他們被吃掉了。追空就是站到被吃的那一邊。"],
      ["吸收：有人在牆下被動承接，可以開始考慮做多", true, "主動賣很大＋價格不動＝被動買單在吸收。下一步是等確認（下一根不破低），再進場。"],
      ["沒有意義，Footprint 看不出東西", false, "這正是 Footprint 最有用的畫面之一：成交量和價格結果不一致。"]] },
    { q: "價格往上穿過一個節點，連續三格的主動買都是右下那一格主動賣的 3 倍以上，收在最高。這叫什麼？", o: [
      ["堆疊買方失衡，偏向突破延續", true, "連續 3 格以上的對角失衡叫堆疊失衡，代表主動買方連續推動價格。"],
      ["吸收，準備反轉向下", false, "吸收的特徵是「量很大但價格不動」。這裡價格有跟著走，而且收在最高。"],
      ["Delta 背離", false, "Delta 背離是 Delta 和價格方向相反，這裡兩者同方向。"]] }
  ];
  PAGES["learn-5"] = {
    title: LESSONS[4].title,
    lede: "價格到區之後，Footprint 要回答一個問題：有人在這裡擋住價格（吸收），還是有人推過去了（突破）？先學會讀一格，再看一整根 K 棒怎麼長出來。",
    chips: [["buy", "訂單流"], ["", "第 5 關　約 12 分鐘"]],
    html: `${strip(SOP, 4)}
<div class="prose"><h2>先學會讀一格</h2></div>
<div class="panel"><div class="cell-demo"><div class="cell-big"><span class="b">120</span><span class="x">×</span><span class="a">160</span></div>
<div style="font-size:15px;line-height:1.75">左邊 <b style="color:var(--sell-ink)">120</b>：有人急著賣，直接用${T("買價（Bid）", "市場上買方願意付的最高價。急著賣的人會直接賣在這裡。")}成交了 120 口，叫<b>主動賣</b>。<br>
右邊 <b style="color:var(--buy-ink)">160</b>：有人急著買，直接用${T("賣價（Ask）", "市場上賣方願意接受的最低價。急著買的人會直接買在這裡。")}成交了 160 口，叫<b>主動買</b>。<br>
${T("Delta", "主動買 − 主動賣。正值＝買方比較急，負值＝賣方比較急。")}＝160 − 120＝<b>+40</b>。一根 K 棒有很多格，每格代表一個價位。</div></div></div>

<div class="scene"><div class="scene-h"><h3>看一根 K 棒在關鍵區長出來</h3><p class="small">為了好讀，每一格是 5 點。數字是示意。</p></div>
<div class="tabs" role="tablist"><button class="tab" role="tab" data-k="abs" aria-selected="true" type="button">吸收（在 Put Wall）</button><button class="tab" role="tab" data-k="brk" aria-selected="false" type="button">突破（負 Gamma 節點）</button></div>
<div class="fp-wrap"><table class="fp" id="l5-fp" aria-label="Footprint K 棒"></table>
<div class="fp-side"><svg id="l5-candle" viewBox="0 0 220 120" role="img" aria-label="同一根 K 棒的蠟燭圖"></svg>
<div class="kpi"><div class="k-l">累計 Delta（主動買 − 主動賣）</div><div class="k-v" id="l5-delta"></div></div>
<div class="kpi"><div class="k-l">開盤 → 目前</div><div class="k-v" id="l5-oc" style="font-size:16px"></div></div></div></div>
<div class="legend"><span><i style="background:color-mix(in srgb,var(--sell) 40%,transparent)"></i>主動賣多的格</span><span><i style="background:color-mix(in srgb,var(--buy) 40%,transparent)"></i>主動買多的格</span><span><i style="border:2px solid var(--sell)"></i>賣方失衡</span><span><i style="border:2px solid var(--buy)"></i>買方失衡</span></div>
<div class="btn-row"><button class="btn primary" id="l5-play" type="button">重新播放</button></div>
<ol class="fp-notes" id="l5-notes"></ol></div>

<div class="prose"><h2>失衡是怎麼比的？</h2>
<p>Footprint 的「失衡」是<b>斜著比</b>：這一格的主動買，和<b>下面一格</b>的主動賣比。因為想往上買的人，要吃掉上一個價位的賣單。超過 3 倍就標成買方失衡；連續 3 格以上叫${T("堆疊失衡", "Stacked Imbalance：連續三個以上價位都出現同方向的失衡，代表一方連續推動價格。")}。賣方失衡反過來比。</p>
<h2>為什麼「賣很多但價格不跌」會發生？</h2>
<p>因為成交需要兩邊。主動賣的人賣掉多少，就有被動買的人用限價單接了多少。如果下面的限價買單夠厚，賣再多價格也不動。下面自己試試看。</p></div>

<div class="scene"><div class="scene-h"><h3>模擬器：主動賣 vs 被動買單</h3><p class="small">藍色＝每個價位上掛著等成交的限價買單；橘色＝被主動賣吃掉的部分。</p></div>
<div class="scene-grid"><svg id="l5-book" viewBox="0 0 440 250" role="img" aria-label="限價買單被主動賣吃掉的示意"></svg><div class="side" id="l5-book-side"></div></div>
<div class="controls" style="margin-top:10px">
<div class="ctl"><label for="l5-sell">主動賣出 <b id="l5-sell-v"></b></label><input id="l5-sell" type="range" min="0" max="3000" step="50" value="1500"></div>
<div class="ctl"><label for="l5-thick">每個價位的限價買單 <b id="l5-thick-v"></b></label><input id="l5-thick" type="range" min="50" max="800" step="25" value="600"></div></div></div>

<div class="callout c-warning"><div class="callout-title">Footprint 分不出是誰在接</div><div class="callout-body">它只看得到「主動買」和「主動賣」，看不出被動承接的是市商、基金還是散戶。所以吸收出現在牆上，只能說「位置和行為對得上」，不能說「就是市商在對沖」。</div></div>
${quizHTML(L5Q, "l5-")}
${remember("<b>量和價格結果不一致</b>最值得看：賣很多卻跌不下去＝吸收；連續失衡而且價格跟著走＝突破。")}
${foot(SOP, 4)}`,
    mount(root) {
      let key = "abs", step = 0, acc = 0;
      const fpEl = $(root, "#l5-fp"), cand = $(root, "#l5-candle");
      function shown(d, s) {
        const visits = d.px.map(() => 0), tot = d.px.map((_, r) => d.path.filter((x) => x === r).length);
        d.path.slice(0, s + 1).forEach((r) => visits[r]++);
        return { bid: d.bid.map((v, r) => (tot[r] ? Math.round((v * visits[r]) / tot[r]) : 0)), ask: d.ask.map((v, r) => (tot[r] ? Math.round((v * visits[r]) / tot[r]) : 0)), seen: visits.map((v) => v > 0) };
      }
      function draw() {
        const d = FP[key], s = Math.min(step, d.path.length - 1), sh = shown(d, s), im = s >= d.path.length - 1 ? imb(sh.bid, sh.ask) : { a: new Set(), b: new Set() };
        const mb = Math.max(...d.bid), ma = Math.max(...d.ask), cur = d.path[s];
        fpEl.innerHTML = `<thead><tr><td>主動賣（Bid）</td><td>價格</td><td>主動買（Ask）</td></tr></thead><tbody>${d.px.map((p, r) => !sh.seen[r] ? `<tr><td class="b" style="opacity:.3">·</td><td class="px">${nf(p)}</td><td class="a" style="opacity:.3">·</td></tr>` :
          `<tr class="${r === cur ? "cur" : ""}${r === d.zone ? " zone" : ""}"><td class="b${sh.bid[r] >= mb * 0.6 ? " hot" : ""}${im.b.has(r) ? " imb-b" : ""}">${sh.bid[r]}</td><td class="px">${nf(p)}${r === d.zone ? `<br><small>${d.zoneName}</small>` : ""}</td><td class="a${sh.ask[r] >= ma * 0.6 ? " hot" : ""}${im.a.has(r) ? " imb-a" : ""}">${sh.ask[r]}</td></tr>`).join("")}</tbody>`;
        const delta = sh.ask.reduce((a, b) => a + b, 0) - sh.bid.reduce((a, b) => a + b, 0);
        const dEl = $(root, "#l5-delta"); dEl.textContent = sgn(delta); dEl.style.color = delta >= 0 ? "var(--buy-ink)" : "var(--sell-ink)";
        const seg = d.path.slice(0, s + 1), o = d.px[d.path[0]], c = d.px[cur], hiP = d.px[Math.min(...seg)], loP = d.px[Math.max(...seg)];
        $(root, "#l5-oc").textContent = `${nf(o)} → ${nf(c)}（${sgn(c - o)}）`;
        const lo = d.px[d.px.length - 1] - 5, hi = d.px[0] + 5, Y = (p) => 8 + ((hi - p) / (hi - lo)) * 104, col = c >= o ? "var(--buy)" : "var(--sell)";
        cand.innerHTML = `<line x1="0" x2="220" y1="${Y(d.px[d.zone])}" y2="${Y(d.px[d.zone])}" style="stroke:var(--gamma-ink);stroke-dasharray:5 4"/><text x="216" y="${Y(d.px[d.zone]) - 4}" text-anchor="end" style="fill:var(--gamma-ink)">${d.zoneName}</text>
          <line x1="60" x2="60" y1="${Y(hiP)}" y2="${Y(loP)}" style="stroke:${col};stroke-width:2"/><rect x="46" width="28" y="${Y(Math.max(o, c))}" height="${Math.max(2, Math.abs(Y(o) - Y(c)))}" rx="2" style="fill:${col}"/>
          <text x="84" y="${Y(o) + 4}">開 ${nf(o)}</text><text x="84" y="${Y(c) + (Math.abs(Y(o) - Y(c)) < 14 ? 16 : 4)}" style="fill:var(--ink);font-weight:600">現 ${nf(c)}</text>`;
        $(root, "#l5-notes").innerHTML = s >= d.path.length - 1 ? d.notes.map((n) => `<li>${n}</li>`).join("") : `<li class="small" style="list-style:none;margin-left:-1.3em">K 棒還在形成中……看完再下結論。</li>`;
      }
      const lp = loop(fpEl, (dt) => { const d = FP[key]; if (step < d.path.length - 1) { acc += dt; if (acc > 190) { acc = 0; step++; draw(); } } });
      function restart() { step = RM ? FP[key].path.length - 1 : 0; acc = 0; draw(); lp.play(); }
      root.querySelectorAll(".tab").forEach((b) => b.addEventListener("click", () => { key = b.dataset.k; root.querySelectorAll(".tab").forEach((x) => x.setAttribute("aria-selected", String(x === b))); restart(); }));
      $(root, "#l5-play").addEventListener("click", restart);
      restart();

      // order book
      const book = $(root, "#l5-book"), lv = [26800, 26795, 26790, 26785, 26780, 26775];
      function drawBook() {
        const sell = +$(root, "#l5-sell").value, th = +$(root, "#l5-thick").value;
        $(root, "#l5-sell-v").textContent = nf(sell) + " 口"; $(root, "#l5-thick-v").textContent = nf(th) + " 口";
        let rem = sell, full = 0; const eaten = lv.map(() => { const e = Math.min(th, rem); rem -= e; if (e >= th) full++; return e; });
        const sx = 300 / 800, rowH = 34, y0 = 26;
        const endRow = Math.min(full, lv.length - 1);
        book.innerHTML = `<text x="8" y="16">價格</text><text x="90" y="16">掛著的限價買單</text>
          ${lv.map((p, r) => { const y = y0 + r * rowH; return `<text x="8" y="${y + 20}" style="${r === endRow && rem === 0 ? "fill:var(--ink);font-weight:700" : ""}">${nf(p)}</text>
            <rect x="90" y="${y + 4}" width="${th * sx}" height="${rowH - 10}" rx="3" style="fill:var(--buy);opacity:.35"/>
            <rect x="90" y="${y + 4}" width="${eaten[r] * sx}" height="${rowH - 10}" rx="3" style="fill:var(--sell)"/>
            ${eaten[r] ? `<text x="${94 + th * sx}" y="${y + 20}">吃掉 ${nf(eaten[r])}</text>` : ""}`; }).join("")}
          ${rem === 0 ? `<path d="M82 ${y0 + endRow * rowH + 17} l-10 -6 v12 z" style="fill:var(--ink)"/>` : `<text x="90" y="${y0 + lv.length * rowH + 6}" style="fill:var(--sell-ink);font-weight:600">還剩 ${nf(rem)} 口沒成交，價格繼續往下掉 ↓</text>`}`;
        const ticks = rem > 0 ? lv.length : full;
        const msg = sell === 0 ? "沒有人主動賣，價格不動。把「主動賣出」拉高試試。" :
          ticks === 0 ? `賣了 ${nf(sell)} 口，價格<b>一格都沒掉</b>。賣壓全被限價買單接走：<b>這就是吸收</b>。Footprint 上會看到下面的主動賣很大，價格卻不動。` :
          ticks <= 2 ? `價格只掉了 ${ticks} 格（${ticks * 5} 點）。大部分賣壓被接走，算是部分吸收。` :
          `價格掉了 ${ticks >= lv.length ? "至少 6" : ticks} 格。限價買單太薄，賣方推得動：<b>這不是吸收，比較像突破</b>。`;
        $(root, "#l5-book-side").innerHTML = `<div class="kpi"><div class="k-l">這段時間的 Delta</div><div class="k-v" style="color:var(--sell-ink)">${sgn(-sell)}</div></div>
          <div class="kpi" style="margin-top:6px"><div class="k-l">價格下跌</div><div class="k-v">${rem > 0 ? "6 格以上" : ticks + " 格"}</div></div><p style="margin:8px 0 0">${msg}</p>
          <p class="small" style="margin:8px 0 0">同樣的 Delta，結果可以完全不同。所以只看 Delta 不夠，要看<b>價格有沒有跟著動</b>。</p>`;
      }
      ["#l5-sell", "#l5-thick"].forEach((k) => $(root, k).addEventListener("input", drawBook));
      drawBook();
      mountLesson(SOP, root, 4, L5Q, "l5-");
    }
  };

  /* ---------- lesson 6: stop, target, size ---------- */
  const L6Q = [
    { q: "你在 Put Wall（26,800）看到吸收後做多。停損最合理放在哪裡？", o: [
      ["進場價下方固定 5 點", false, "固定點數跟「想法什麼時候錯」無關，在 NQ 上 5 點很容易被正常波動掃掉。"],
      ["牆的外側，例如 26,785：價格到那裡代表牆沒守住", true, "停損放在「想法錯了」的位置。牆被收盤跌破，吸收的劇本就失效了。"],
      ["先不設，等虧損變大再決定", false, "沒有停損，一次負 Gamma 的加速下跌就可能吃掉好幾週的獲利。"]] },
    { q: "停損 40 點、目標 60 點，風報比 1 : 1.5。依這套規則你該怎麼辦？", o: [
      ["低於 1 : 2，先提醒自己風險偏高；找不到合理的更遠目標就放棄", true, "不能為了湊風報比而把目標放到沒有依據的地方。目標應該是下一個區。"],
      ["把目標改成 80 點，風報比就到 1 : 2 了", false, "目標要放在下一個關鍵區，不是放在「讓數字好看」的地方。"],
      ["加大部位，把報酬賺回來", false, "風報比差的單加大部位，只會放大虧損。"]] }
  ];
  PAGES["learn-6"] = {
    title: LESSONS[5].title,
    lede: "下單前先回答三個問題：錯了在哪裡出場？對了賺到哪裡？下幾口才不會虧太多？在梯子上直接拖動三條線試試。",
    chips: [["sell", "風險"], ["", "第 6 關　約 6 分鐘"]],
    html: `${strip(SOP, 5)}
<div class="scene"><div class="scene-h"><h3>拖動三條線（也可以點一下再用方向鍵）</h3><p class="small">情境：Put Wall 出現吸收，準備做多。</p></div>
<div class="scene-grid"><svg id="l6-svg" viewBox="0 0 380 430" role="img" aria-label="可拖動的進場、停損、目標價格線"></svg><div class="side" id="l6-side"></div></div>
<div class="controls" style="margin-top:10px">
<div class="ctl"><label for="l6-acct">帳戶金額（美元）</label><input id="l6-acct" type="number" min="500" step="500" value="10000"></div>
<div class="ctl"><label for="l6-r">每筆最多虧帳戶的 <b id="l6-r-v"></b></label><input id="l6-r" type="range" min="0.25" max="3" step="0.25" value="1"></div>
<div class="ctl"><label for="l6-sym">商品</label><select id="l6-sym"><option value="2">MNQ（每點 2 美元）</option><option value="20">NQ（每點 20 美元）</option></select></div></div></div>
<div class="duo">
<div class="neg"><h4>停損放哪？</h4>放在「想法錯了」的地方：做多就在牆的外側，留一點空間給正常波動。不是放在「我能忍受虧多少」的地方。</div>
<div class="op"><h4>目標放哪？</h4>下一個關鍵區：Flip、對面的牆、POC。目標超出預期波動太多，就要懷疑自己太貪心。</div>
<div class="of"><h4>下幾口？</h4>口數＝（帳戶 × 每筆風險%）÷（停損點數 × 每點價值），無條件捨去。算出 0 口，就是這筆單對你的帳戶來說太大。</div></div>
${quizHTML(L6Q, "l6-")}
${remember("先決定<b>錯在哪</b>，再決定<b>下幾口</b>。風報比低於 1 : 2 要停下來想一想，而不是移動目標去湊數字。")}
${foot(SOP, 5)}`,
    mount(root) {
      const svg = $(root, "#l6-svg"), lo = 26740, hi = 27020, top = 16, bot = 414;
      const Y = (p) => top + ((hi - p) / (hi - lo)) * (bot - top), P = (y) => hi - ((y - top) / (bot - top)) * (hi - lo);
      const H = { e: { p: 26825, n: "進場", c: "var(--buy)" }, s: { p: 26785, n: "停損", c: "var(--sell)" }, t: { p: 26950, n: "目標", c: "var(--gamma)" } };
      function draw() {
        const ticks = []; for (let p = 26750; p <= 27000; p += 50) ticks.push(p);
        svg.innerHTML = `${ticks.map((p) => `<line x1="56" x2="372" y1="${Y(p)}" y2="${Y(p)}" style="stroke:var(--line)"/><text x="50" y="${Y(p) + 4}" text-anchor="end">${nf(p)}</text>`).join("")}
          <rect x="56" width="316" y="${Y(26810)}" height="${Y(26790) - Y(26810)}" style="fill:var(--gamma);opacity:.18"/><text x="368" y="${Y(26810) - 6}" text-anchor="end" style="fill:var(--gamma-ink)">Put Wall 區 26,790–26,810</text>
          <line x1="56" x2="372" y1="${Y(26950)}" y2="${Y(26950)}" style="stroke:var(--gamma-ink);stroke-dasharray:6 5"/><text x="368" y="${Y(26950) - 6}" text-anchor="end" style="fill:var(--gamma-ink)">Flip 26,950</text>
          <line x1="56" x2="372" y1="${Y(27000)}" y2="${Y(27000)}" style="stroke:var(--ink-3);stroke-dasharray:2 4"/><text x="368" y="${Y(27000) + 14}" text-anchor="end">POC 27,000</text>
          <rect x="150" width="70" y="${Math.min(Y(H.e.p), Y(H.t.p))}" height="${Math.abs(Y(H.e.p) - Y(H.t.p))}" style="fill:var(--gamma);opacity:.12"/>
          <rect x="150" width="70" y="${Math.min(Y(H.e.p), Y(H.s.p))}" height="${Math.abs(Y(H.e.p) - Y(H.s.p))}" style="fill:var(--sell);opacity:.14"/>
          ${Object.entries(H).map(([k, h]) => `<g class="drag" data-k="${k}" tabindex="0" role="slider" aria-label="${h.n}價格" aria-valuenow="${h.p}">
            <rect x="56" width="316" y="${Y(h.p) - 12}" height="24" style="fill:transparent"/>
            <line x1="56" x2="372" y1="${Y(h.p)}" y2="${Y(h.p)}" style="stroke:${h.c};stroke-width:2.5"/>
            <rect x="60" y="${Y(h.p) - 11}" width="86" height="22" rx="5" style="fill:${h.c}"/><text x="103" y="${Y(h.p) + 4}" text-anchor="middle" style="fill:#fff;font-weight:600">${h.n} ${nf(h.p)}</text></g>`).join("")}`;
        side();
      }
      function side() {
        const e = H.e.p, s = H.s.p, t = H.t.p, pv = +$(root, "#l6-sym").value, acct = Math.max(0, +$(root, "#l6-acct").value || 0), rp = +$(root, "#l6-r").value;
        $(root, "#l6-r-v").textContent = rp + "%";
        const el = $(root, "#l6-side");
        if ((s - e) * (t - e) >= 0 || s === e || t === e) { el.innerHTML = `<h4>線放錯邊了</h4><p class="warn-t" style="margin:0">停損和目標要在進場價的兩側。做多：停損在下、目標在上。</p>`; return; }
        const dir = t > e ? "做多" : "做空", risk = Math.abs(e - s), rew = Math.abs(t - e), rr = rew / risk;
        const per = risk * pv, budget = acct * rp / 100, n = Math.floor(budget / per);
        const inZoneStop = dir === "做多" && s >= 26790 && s <= 26810;
        el.innerHTML = `<span class="tagline">${dir}</span><h4>風報比 1 : ${nf(rr, 1)}</h4>
          <p class="${rr < 2 ? "warn-t" : "ok-t"}" style="margin:0 0 8px">${rr < 2 ? "低於 1 : 2。除非有更遠、有依據的目標，否則考慮放棄這筆。" : "達到 1 : 2 以上。"}</p>
          <div class="kpi"><div class="k-l">風險／報酬</div><div class="k-v" style="font-size:17px">${nf(risk)} 點 ／ ${nf(rew)} 點</div></div>
          <div class="kpi" style="margin-top:6px"><div class="k-l">每口最多虧</div><div class="k-v" style="font-size:17px">$${nf(per)}</div><div class="k-n">你的上限：$${nf(budget)}（帳戶 ${rp}%）</div></div>
          <div class="kpi" style="margin-top:6px"><div class="k-l">最多可以下</div><div class="k-v" style="font-size:17px">${n} 口</div><div class="k-n">${n === 0 ? "1 口就超過上限：換小台、縮短停損（要有依據），或放棄。" : `實際風險 $${nf(n * per)}`}</div></div>
          ${inZoneStop ? `<p class="warn-t" style="margin:8px 0 0">停損放在牆的裡面，很容易被正常的來回掃掉。試著放到牆的外側。</p>` : ""}`;
      }
      let drag = null;
      const toSvgY = (ev) => { const pt = svg.createSVGPoint(); pt.x = ev.clientX; pt.y = ev.clientY; return pt.matrixTransform(svg.getScreenCTM().inverse()).y; };
      const clamp = (p) => Math.max(lo + 5, Math.min(hi - 5, Math.round(p)));
      svg.addEventListener("pointerdown", (ev) => { const g = ev.target.closest(".drag"); if (!g) return; drag = g.dataset.k; svg.setPointerCapture(ev.pointerId); ev.preventDefault(); });
      svg.addEventListener("pointermove", (ev) => { if (!drag) return; H[drag].p = clamp(P(toSvgY(ev))); draw(); });
      const end = () => { if (drag) { const k = drag; drag = null; const g = svg.querySelector(`[data-k="${k}"]`); if (g) g.focus({ preventScroll: true }); } };
      svg.addEventListener("pointerup", end); svg.addEventListener("pointercancel", end);
      svg.addEventListener("keydown", (ev) => { const g = ev.target.closest(".drag"); if (!g || !/ArrowUp|ArrowDown/.test(ev.key)) return; ev.preventDefault(); const k = g.dataset.k; H[k].p = clamp(H[k].p + (ev.key === "ArrowUp" ? 1 : -1) * (ev.shiftKey ? 10 : 1)); draw(); svg.querySelector(`[data-k="${k}"]`).focus(); });
      ["#l6-acct", "#l6-r", "#l6-sym"].forEach((k) => $(root, k).addEventListener("input", side));
      draw();
      mountLesson(SOP, root, 5, L6Q, "l6-");
    }
  };

  /* ---------- lesson 7: final scenarios ---------- */
  const L7Q = [
    { tag: "情境 1", card: [["環境", "淨 GEX 大正值（彈簧）"], ["位置", "價格到 Call Wall"], ["Footprint", "上面幾格主動買很多，Delta +800，價格卻上不去，收在 K 棒下半部"], ["劇本", "你盤前寫的：「Call Wall 出現吸收 → 偏空，目標 Flip」"]], q: "你會？", o: [
      ["做多，Delta 是正的", false, "Delta 正但價格不漲，代表主動買被上面的賣單吸收了。跟著 Delta 做多，就是站到被吸收的那一邊。"],
      ["做空，停損放在 Call Wall 外側，目標 Flip", true, "環境（彈簧）、位置（牆）、訂單流（吸收）三者一致，照劇本執行。"],
      ["觀望", false, "觀望不算錯，但這是三層條件都對上的標準劇本，正是你等了一整天的那一刻。"]] },
    { tag: "情境 2", card: [["環境", "淨 GEX 為負（雪球）"], ["位置", "兩道牆中間，離最近的區 150 點"], ["Footprint", "出現一根漂亮的買方堆疊失衡"], ["劇本", "這裡沒有寫劇本"]], q: "你會？", o: [
      ["做多，堆疊失衡很強", false, "訊號強，但位置不對。不在區內的訊號不屬於這套系統。"],
      ["做空，逆勢比較便宜", false, "沒有任何依據支持逆勢。"],
      ["觀望，等價格到區", true, "第三步：不在區內就不做事。"]] },
    { tag: "情境 3", card: [["環境", "淨 GEX 為負（雪球）"], ["位置", "價格往上穿過負值節點，5 分 K 收盤站上"], ["Footprint", "連續 3 格買方失衡，Delta 和量一起放大"], ["劇本", "「負 Gamma 節點收盤穿越 → 順勢，回測進場」"]], q: "你會？", o: [
      ["做多（等回測節點附近進場），停損放在節點下方", true, "雪球環境＋穿越＋堆疊失衡同向，順勢劇本。回測進場可以把停損縮小。"],
      ["做空，突破通常會失敗", false, "負 Gamma 環境下，突破反而比較容易延續。"],
      ["觀望，因為是負 Gamma", false, "負 Gamma 不代表不能做，而是要用順勢劇本、縮小部位。"]] },
    { tag: "情境 4", card: [["環境", "淨 GEX 接近 0"], ["位置", "價格在 Flip 上下來回穿越了 4 次"], ["Footprint", "Delta 一下正一下負，K 棒影線很長"], ["劇本", "「Flip 附近反覆穿越 → 觀望」"]], q: "你會？", o: [
      ["做多，最後一次是往上穿", false, "反覆穿越時，「最後一次」沒有特別意義，下一根可能又穿回去。"],
      ["觀望，等連續收盤離開 Flip", true, "環境不明是最難做的狀態，這時候不做也是一種決定。"],
      ["做空，Delta 剛轉負", false, "Delta 來回翻轉，代表雙方都沒有主導權。"]] },
    { tag: "情境 5", card: [["環境", "淨 GEX 大正值（彈簧）"], ["位置", "價格到 Put Wall"], ["Footprint", "最下面三格主動賣都超過 600，價格沒有再破低，Delta −1,500，收在上半部"], ["劇本", "「Put Wall 出現吸收 → 偏多，目標 Flip」"]], q: "你會？", o: [
      ["做空，Delta −1,500 很弱", false, "賣這麼多卻沒有破低，弱的其實是賣方。"],
      ["等下一根 K 棒不破低就做多，停損在 Put Wall 外側", true, "這就是第 5 關的吸收畫面，再加上一根確認，降低接到刀的機率。"],
      ["觀望，因為 Delta 是負的", false, "Delta 和價格結果不一致，正是這套方法要找的訊號。"]] },
    { tag: "情境 6", card: [["環境", "淨 GEX 為負（雪球）"], ["位置", "價格跌破 Put Wall，但下一根 K 棒就快速收回牆上方"], ["Footprint", "跌破時下方的賣量突然消失，沒有堆疊賣方失衡"], ["劇本", "「Put Wall 收盤跌破且賣方失衡堆疊 → 順勢偏空」"]], q: "你會？", o: [
      ["追空，已經跌破 Put Wall 了", false, "你的劇本要求「收盤跌破＋賣方失衡堆疊」，這兩個條件都沒出現。快速收回比較像掃停損（stop hunt）。"],
      ["觀望：偏空劇本失效，等新的劇本條件出現", true, "劇本條件不成立就不做。想反手做多，也要有另一個寫好的劇本和確認，不能臨時起意。"],
      ["重倉做多，一定是假跌破", false, "「一定」不存在。就算判斷是假跌破，也要照規則等確認、算好部位。"]] }
  ];
  PAGES["learn-7"] = {
    title: LESSONS[6].title,
    lede: "把五個步驟串起來。每題都是「環境、位置、Footprint、劇本」四張卡，選出你會怎麼做。答錯可以再選，但第一次的答案才算分。",
    chips: [["", "第 7 關　約 8 分鐘"]],
    html: `${strip(SOP, 6)}
<div class="panel" style="display:flex;flex-wrap:wrap;gap:12px 24px;align-items:center"><div><div class="small">第一次就答對</div><div class="k-v" style="font-family:var(--font-display);font-size:28px;font-weight:700" id="l7-score">0 / 6</div></div><div class="small" style="flex:1;min-width:220px" id="l7-say">每題的四張卡就是你盤中要問自己的四個問題。</div></div>
${quizHTML(L7Q, "l7-")}
${remember("每次下單前問四件事：<b>環境是什麼？在不在區內？訂單流確認了嗎？劇本條件成立嗎？</b>任何一個答不出來，就是觀望。")}
<div class="prose"><h2>接下來</h2><p>到 <a href="#learn-1">路線 3 整合 SOP</a> 用進場前檢查清單和交易紀錄表，在 Replay 裡練習。一般建議每種設定至少 100 筆才有統計意義，在那之前，這裡的所有劇本都只是假設。</p></div>
${foot(SOP, 6)}`,
    mount(root) {
      const first = {};
      mountLesson(SOP, root, 6, L7Q, "l7-", (k, ok) => {
        first[k] = ok; const n = Object.values(first).filter(Boolean).length, done = Object.keys(first).length;
        $(root, "#l7-score").textContent = `${n} / ${L7Q.length}`;
        if (done === L7Q.length) $(root, "#l7-say").textContent = n >= 5 ? "很好，你已經能把五個步驟串起來。去 Replay 裡用真實走勢練習吧。" : n >= 3 ? "大方向對了。回頭看看答錯的題目屬於哪一步，重玩那一關。" : "建議從第 4、5 關重玩：多數錯誤來自「不在區內也想做」或「只看 Delta 不看價格」。";
      });
    }
  };
})();
