/* 路線 1 第 4 關（新版）：Delta——誰比較急？和價格的四種關係 */
(function () {
  const PAGES = (window.__PAGES = window.__PAGES || {});
  const { chip, lerp, ease, seg, sg } = window.KIT;

  // 上半部畫 K 棒（價格 0–100 映射到 y 200–50），下半部畫 Delta 柱（零軸 y=300）
  const PY = (v) => lerp(210, 50, v / 100);
  const DZ = 300, DY = (d, mx = 250) => DZ - (d / mx) * 50;
  function candle(x, o, h, l, c, op = 1, w = 30) {
    const up = c >= o;
    return `<g opacity="${op}"><line x1="${x}" x2="${x}" y1="${PY(h)}" y2="${PY(l)}" class="${up ? "s-buy" : "s-sell"}" stroke-width="2.5"/><rect x="${x - w / 2}" y="${PY(Math.max(o, c))}" width="${w}" height="${Math.max(3, Math.abs(PY(o) - PY(c)))}" rx="3" class="${up ? "f-buy" : "f-sell"}"/></g>`;
  }
  function dbar(x, d, op = 1, w = 30, mx = 250, label = true) {
    const y = Math.min(DY(d, mx), DZ), h = Math.max(2, Math.abs(DY(d, mx) - DZ));
    return `<g opacity="${op}"><rect x="${x - w / 2}" y="${y}" width="${w}" height="${h}" rx="3" class="${d >= 0 ? "f-buy" : "f-sell"}"/>${label ? `<text x="${x}" y="${d >= 0 ? y - 6 : y + h + 15}" text-anchor="middle" class="${d >= 0 ? "t-buy" : "t-sell"} t-b">${sg(d)}</text>` : ""}</g>`;
  }
  const axes = (x0 = 60, x1 = 600) => `<line x1="${x0}" x2="${x1}" y1="${DZ}" y2="${DZ}" class="s-ink"/><text x="${x0 - 8}" y="${DZ + 4}" text-anchor="end" class="t-mute">0</text><text x="${x0 - 8}" y="${DZ - 56}" text-anchor="end" class="t-mute">Delta</text><text x="${x0 - 8}" y="120" text-anchor="end" class="t-mute">價格</text>`;

  const CASES = [
    { k: "A", t: "正 Delta ＋ 上漲", o: 30, h: 82, l: 26, c: 78, d: 180, msg: "買方急，價格也漲上去：推得動", cls: "t-buy" },
    { k: "B", t: "負 Delta ＋ 下跌", o: 72, h: 76, l: 20, c: 26, d: -190, msg: "賣方急，價格也跌下去：推得動", cls: "t-sell" },
    { k: "C", t: "正 Delta ＋ 漲不上去", o: 52, h: 80, l: 46, c: 50, d: 200, msg: "買方很用力，價格卻沒漲：上面有人在擋", cls: "t-sell" },
    { k: "D", t: "負 Delta ＋ 跌不下去", o: 48, h: 54, l: 20, c: 52, d: -200, msg: "賣方很用力，價格卻沒跌：下面有人在接", cls: "t-buy" }
  ];
  function caseScene(cs, t, x = 200) {
    let s = axes();
    s += candle(x, cs.o, lerp(cs.o, cs.h, seg(t, 0, 0.6)), lerp(cs.o, cs.l, seg(t, 0, 0.6)), lerp(cs.o, cs.c, ease(seg(t, 0, 0.7))));
    s += dbar(x, Math.round(cs.d * ease(seg(t, 0.1, 0.7))), 1);
    s += `<g opacity="${seg(t, 0.6, 1)}"><text x="300" y="100" class="t-ink t-b t-lg">情境 ${cs.k}：${cs.t}</text><text x="300" y="130" class="${cs.cls} t-b">${cs.msg}</text></g>`;
    return s;
  }

  const STEPS = [
    { cap: "上一關學過：<b>Delta ＝ 主動買 − 主動賣</b>。整根 K 棒的總 Delta，可以畫成 K 棒下面的一根柱子：正的往上、藍色；負的往下、橘色。",
      why: "Footprint 每一列的 Delta 加起來，就是整根的總 Delta。把它單獨畫成柱狀圖，就能一眼看出每根 K 棒是誰比較急。", stuckHref: "#of-2", stuckLabel: "回上一關複習 Footprint 和 Delta →", stuck: "Delta 就是「急著買的口數 − 急著賣的口數」。" },
    { cap: "每一根 K 棒都有自己的 Delta。光看 Delta 的數字沒有意義，要<b>和價格怎麼動一起看</b>，才知道發生了什麼事。",
      why: "Delta 只告訴你誰比較急，不告訴你他們有沒有成功推動價格。把「Delta 的方向」和「價格的方向」放在一起，只會有四種組合，這一關就是學這四種。", dur: 2000 },
    { cap: "情境 A：<b>正 Delta ＋ 上漲</b>。買方很急，價格也漲上去了。兩者<b>同向</b>，代表買方推得動。",
      why: "主動買方一路吃掉賣單，賣單吃光就往上一格，所以價格上漲。這是最「正常」的情況，代表目前買方主導。" },
    { cap: "情境 B：<b>負 Delta ＋ 下跌</b>。賣方很急，價格也跌下去了。同樣是<b>同向</b>，代表賣方推得動。",
      why: "主動賣方一路打掉買單，價格往下跳。跟 A 完全對稱。" },
    { cap: "情境 C：<b>正 Delta，價格卻漲不上去</b>。買方很用力，但每次吃到上面那一檔，就有新的賣單補上來。上面有人在<b>擋</b>。",
      why: "這叫「吸收」：有人用大量限價賣單接住所有主動買單。買方力氣用完了價格還在原地，接下來常常容易回落。第 12 關會更詳細教吸收。", stuck: "像用力推一扇門，門卻不動：門後面有人頂著。", dur: 2200 },
    { cap: "情境 D：<b>負 Delta，價格卻跌不下去</b>。賣方很用力，下面卻一直有買單接住。下面有人在<b>接</b>。",
      why: "跟 C 對稱：大量限價買單吸收了主動賣單。賣方力氣用完，價格反而可能往上。", dur: 2200 },
    { cap: "整理成一張表：Delta 和價格<b>同向＝推得動</b>；<b>反向＝有人在擋</b>，而擋的那一方常常是接下來比較強的一方。",
      why: "同向的 A、B 告訴你目前誰主導；反向的 C、D 告訴你主動的一方被吸收了。反向的訊號通常比較值得注意，但一定要出現在重要的價位才有意義（第 11 步會講）。" },
    { cap: "練習一下：一根大漲的 K 棒，Delta 卻是 <b>−180</b>。",
      q: { t: "這是哪一種情境？", o: [
        ["情境 A：買方推得動", false, "A 是 Delta 為正。這裡 Delta 是負的，主動的是賣方。"],
        ["情境 D：賣方被下面的買單接住", true, "主動賣比較多，價格卻大漲，代表下面有很多限價買單把賣單全部接走，還一路往上墊。"],
        ["情境 B：賣方推得動", false, "B 是價格跟著跌。這裡價格大漲，賣方沒有推動價格。"]] } },
    { cap: "Delta 的大小要<b>和成交量比</b>。同樣是 +100，在總共 400 口的 K 棒裡很一面倒；在 5,000 口的 K 棒裡只是一點點。",
      why: "常見的做法是算 Delta 佔成交量的比例：100 ÷ 400 ＝ 25%，100 ÷ 5,000 ＝ 2%。比例越高，代表越一面倒。不同時段成交量差很多（美股開盤時大很多），所以只比 Delta 的數字容易誤判。", dur: 2200 },
    { cap: "換你算：K 棒甲成交 6,000 口、Delta +300；K 棒乙成交 400 口、Delta +120。",
      q: { t: "哪一根比較一面倒（買方比較壓倒性）？", o: [
        ["甲，因為 +300 比較大", false, "數字大不代表一面倒。300 ÷ 6,000 ＝ 5%，大部分成交是雙方都很積極、互相抵消。"],
        ["乙，120 ÷ 400 ＝ 30%", true, "乙的 Delta 佔了成交量的 30%，甲只有 5%。乙明顯更一面倒。"],
        ["一樣，因為都是正的", false, "方向一樣，但程度差很多。要用 Delta ÷ 成交量來比。"]] } },
    { cap: "最重要的一點：<b>位置</b>。同樣是情境 C，出現在前高、價值區邊緣這種重要價位才有意義；在半路上常常只是雜訊。",
      why: "訂單流訊號是用來「確認」的，不是用來「找機會」的。先有大家在乎的價位，價格走到那裡，再看 Delta 有沒有出現反向。常見的流程也是這個順序：先有位置，再看訊號。", dur: 2400 },
    { cap: "整理：<b>同向＝推得動，反向＝有人在擋</b>。Delta 要跟成交量比，而且只在重要價位上看。",
      why: "下一關把每根 K 棒的 Delta 一路加起來，變成 CVD，用來看更長一段時間誰比較急。" }
  ];

  function draw(svg, i, t) {
    const e = ease(t); let s = "";
    if (i === 0) {
      s += axes(140, 520);
      s += candle(330, 30, 82, 26, 78) + dbar(330, Math.round(5 * e), 1, 30, 10);
      s += `<g opacity="${seg(t, 0.2, 0.8)}"><text x="390" y="${DZ - 30}" class="t-ink t-b">總 Delta ＋5</text><text x="390" y="${DZ - 10}" class="t-mute">（上一關那根 K 棒）</text></g>`;
      s += `<text x="140" y="${DZ + 40}" class="t-mute" opacity="${seg(t, 0.6, 1)}">正的往上、藍色；負的往下、橘色</text>`;
    } else if (i === 1) {
      const B = [[40, 62, 36, 58, 120], [58, 66, 40, 44, -150], [44, 70, 42, 66, 90], [66, 72, 50, 54, 160], [54, 58, 30, 34, -80]];
      s += axes();
      B.forEach((b, k) => { const op = seg(t, k * 0.15, k * 0.15 + 0.25); s += candle(130 + k * 95, b[0], b[1], b[2], b[3], op) + dbar(130 + k * 95, b[4], op); });
      s += `<g opacity="${seg(t, 0.8, 1)}"><text x="60" y="36" class="t-ink t-b">第 4 根 Delta 最大（+160），價格卻收跌。為什麼？</text></g>`;
    } else if (i >= 2 && i <= 5) {
      s += caseScene(CASES[i - 2], t);
      if (i === 4 || i === 5) {
        const top = i === 4, y = top ? PY(80) : PY(20);
        const n = Math.floor(seg(t, 0.2, 0.9) * 5);
        s += `<g opacity="${seg(t, 0.2, 0.4)}"><rect x="226" y="${y - 14}" width="40" height="28" rx="5" class="${top ? "f-sell-soft" : "f-buy-soft"}"/><text x="246" y="${y + 5}" text-anchor="middle" class="${top ? "t-sell" : "t-buy"} t-b">${40 + (n % 2) * 5}</text><text x="226" y="${top ? y - 22 : y + 34}" class="t-mute">${top ? "限價賣單一直補上" : "限價買單一直接住"}</text></g>`;
        for (let j = 0; j < n; j++) s += `<circle cx="${246}" cy="${y + (top ? 1 : -1) * (24 + j * 8)}" r="3" class="${top ? "f-buy" : "f-sell"}"/>`;
      }
    } else if (i === 6) {
      const X = [110, 370], Yr = [70, 200];
      s += `<text x="${X[0] + 120}" y="54" text-anchor="middle" class="t-ink t-b">價格上漲</text><text x="${X[1] + 120}" y="54" text-anchor="middle" class="t-ink t-b">價格不漲／下跌</text>`;
      s += `<text x="96" y="${Yr[0] + 60}" text-anchor="end" class="t-buy t-b">正 Delta</text><text x="96" y="${Yr[1] + 60}" text-anchor="end" class="t-sell t-b">負 Delta</text>`;
      const cell = (x, y, cs, good, op) => `<g opacity="${op}"><rect x="${x}" y="${y}" width="240" height="110" rx="12" class="${good ? "f-gamma-soft" : "f-sell-soft"}"/><text x="${x + 16}" y="${y + 32}" class="t-ink t-b t-lg">${cs.k}　${good ? "同向：推得動" : "反向：有人在擋"}</text><text x="${x + 16}" y="${y + 62}" class="t-ink">${cs.msg.split("：")[0]}</text><text x="${x + 16}" y="${y + 86}" class="t-mute">${cs.msg.split("：")[1]}</text></g>`;
      s += cell(X[0], Yr[0], CASES[0], true, seg(t, 0, 0.3)) + cell(X[1], Yr[0], CASES[2], false, seg(t, 0.2, 0.5)) + cell(X[0], Yr[1], CASES[3], false, seg(t, 0.4, 0.7)) + cell(X[1], Yr[1], CASES[1], true, seg(t, 0.6, 0.9));
    } else if (i === 7) {
      s += axes() + candle(200, 30, 86, 26, 82) + dbar(200, -180, 1);
      s += `<text x="300" y="110" class="t-ink t-b t-lg">大漲的 K 棒，Delta −180</text><text x="300" y="140" class="t-mute">是哪一種情境？</text>`;
    } else if (i === 8 || i === 9) {
      const pair = i === 8 ? [["K 棒甲", 400, 100], ["K 棒乙", 5000, 100]] : [["K 棒甲", 6000, 300], ["K 棒乙", 400, 120]];
      pair.forEach((p, k) => {
        const x = 90 + k * 280, w = 220, vb = w, db = (p[2] / p[1]) * w;
        s += `<g opacity="${i === 9 ? 1 : seg(t, k * 0.3, k * 0.3 + 0.4)}"><text x="${x}" y="80" class="t-ink t-b t-lg">${p[0]}</text>
          <text x="${x}" y="112" class="t-mute">成交量 ${p[1].toLocaleString()} 口</text><rect x="${x}" y="122" width="${vb}" height="26" rx="5" class="g-cell"/>
          <text x="${x}" y="182" class="t-mute">Delta ${sg(p[2])}</text><rect x="${x}" y="192" width="${Math.max(3, db * (i === 9 ? 1 : ease(seg(t, k * 0.3 + 0.2, k * 0.3 + 0.6))))}" height="26" rx="5" class="f-buy"/>
          ${i === 8 ? `<text x="${x}" y="262" class="t-ink t-b t-xl" opacity="${seg(t, k * 0.3 + 0.4, k * 0.3 + 0.6)}">${Math.round((p[2] / p[1]) * 100)}%</text><text x="${x}" y="290" class="t-mute" opacity="${seg(t, k * 0.3 + 0.4, k * 0.3 + 0.6)}">${k === 0 ? "很一面倒" : "只是一點點"}</text>` : ""}</g>`;
      });
      if (i === 8) s += `<text x="90" y="40" class="t-ink t-b">同樣是 +100：Delta ÷ 成交量</text>`;
    } else if (i === 10) {
      const pts = [[70, 40], [130, 52], [180, 46], [240, 70], [300, 64], [360, 80], [420, 78], [470, 60], [540, 50], [600, 40]];
      const Y = (v) => lerp(250, 60, v / 100);
      s += `<rect x="60" y="${Y(84)}" width="540" height="${Y(74) - Y(84)}" rx="4" class="f-gamma-soft"/><text x="66" y="${Y(84) - 8}" class="t-gamma t-b">前高（大家在乎的價位）</text>`;
      const n = Math.max(2, Math.ceil(seg(t, 0, 0.6) * pts.length));
      s += `<polyline points="${pts.slice(0, n).map((p) => `${p[0]},${Y(p[1])}`).join(" ")}" class="s-ink f-none" stroke-width="2.5"/>`;
      s += `<g opacity="${seg(t, 0.3, 0.5)}"><circle cx="180" cy="${Y(46)}" r="9" class="f-none s-ink" stroke-width="2" stroke-dasharray="3 3"/><text x="180" y="${Y(46) + 30}" text-anchor="middle" class="t-mute">半路上的情境 C</text><text x="180" y="${Y(46) + 48}" text-anchor="middle" class="t-mute">常常只是雜訊</text></g>`;
      s += `<g opacity="${seg(t, 0.6, 0.8)}"><circle cx="360" cy="${Y(80)}" r="11" class="f-none s-hl" stroke-width="3"/><text x="360" y="${Y(80) - 22}" text-anchor="middle" class="t-ink t-b">前高出現情境 C → 才值得注意</text></g>`;
    } else if (i === 11) {
      s += `<rect x="40" y="40" width="270" height="130" rx="12" class="f-gamma-soft"/><text x="58" y="76" class="t-ink t-b t-lg">同向＝推得動</text><text x="58" y="104" class="t-ink">A：正 Delta ＋ 上漲</text><text x="58" y="128" class="t-ink">B：負 Delta ＋ 下跌</text><text x="58" y="152" class="t-mute">目前誰主導</text>`;
      s += `<rect x="330" y="40" width="270" height="130" rx="12" class="f-sell-soft"/><text x="348" y="76" class="t-ink t-b t-lg">反向＝有人在擋</text><text x="348" y="104" class="t-ink">C：正 Delta ＋ 漲不上去</text><text x="348" y="128" class="t-ink">D：負 Delta ＋ 跌不下去</text><text x="348" y="152" class="t-mute">主動方被吸收了</text>`;
      [["Delta 要和成交量比", "看 Delta ÷ 成交量，比例高才是一面倒"], ["只在重要價位看", "先有位置，再看訊號"]].forEach((r, k) => { s += `<g opacity="${seg(t, 0.3 + k * 0.25, 0.6 + k * 0.25)}"><circle cx="58" cy="${222 + k * 58}" r="11" class="f-buy"/><text x="58" y="${227 + k * 58}" text-anchor="middle" class="t-w t-b">${k + 1}</text><text x="80" y="${218 + k * 58}" class="t-ink t-b">${r[0]}</text><text x="80" y="${240 + k * 58}" class="t-mute">${r[1]}</text></g>`; });
    }
    svg.innerHTML = s;
  }

  /* ---------- 你來操作：情境判讀練習 ---------- */
  const simHTML = `<div class="drill"><svg class="fpx dr-svg" viewBox="0 0 360 330" role="img" aria-label="題目 K 棒"></svg>
<div class="dr-side"><p class="dr-q"></p><div class="dr-opts">${CASES.map((c) => `<button class="q-opt" type="button" data-k="${c.k}">${c.k}　${c.t}</button>`).join("")}</div><p class="dr-fb" aria-live="polite"></p>
<div class="btn-row"><button class="btn primary dr-next" type="button">下一題</button></div><p class="dr-score small"></p></div></div>
<ul class="sim-task dr-task"></ul>`;
  function simMount(box) {
    const q = (s) => box.querySelector(s);
    let cur, answered, right = 0, total = 0, streak = 0, best = 0;
    const rnd = (a, b) => a + Math.random() * (b - a);
    function make() {
      const c = CASES[Math.floor(Math.random() * 4)], vol = Math.round(rnd(300, 3000) / 10) * 10;
      const d = Math.round((c.d > 0 ? 1 : -1) * vol * rnd(0.12, 0.35) / 10) * 10;
      const o = rnd(40, 60), mv = rnd(18, 30);
      let h, l, cl;
      if (c.k === "A") { cl = o + mv; h = cl + rnd(1, 5); l = o - rnd(1, 6); }
      else if (c.k === "B") { cl = o - mv; l = cl - rnd(1, 5); h = o + rnd(1, 6); }
      else if (c.k === "C") { cl = o - rnd(0, 6); h = o + mv; l = Math.min(o, cl) - rnd(1, 5); }
      else { cl = o + rnd(0, 6); l = o - mv; h = Math.max(o, cl) + rnd(1, 5); }
      cur = { c, vol, d, o, h, l, cl }; answered = false; paint();
    }
    function paint() {
      const { vol, d, o, h, l, cl } = cur;
      const Y = (v) => lerp(200, 30, v / 100), up = cl >= o, mx = Math.max(Math.abs(d), 200);
      const dy = 280 - (d / mx) * 50;
      q(".dr-svg").innerHTML = `<line x1="110" x2="110" y1="${Y(h)}" y2="${Y(l)}" class="${up ? "s-buy" : "s-sell"}" stroke-width="3"/><rect x="88" y="${Y(Math.max(o, cl))}" width="44" height="${Math.max(3, Math.abs(Y(o) - Y(cl)))}" rx="4" class="${up ? "f-buy" : "f-sell"}"/>
        <line x1="40" x2="320" y1="280" y2="280" class="s-ink"/><rect x="88" y="${Math.min(dy, 280)}" width="44" height="${Math.max(2, Math.abs(dy - 280))}" rx="4" class="${d >= 0 ? "f-buy" : "f-sell"}"/>
        <text x="160" y="${Y(Math.max(o, cl))}" class="t-mute">開 ${o.toFixed(0)}　收 ${cl.toFixed(0)}</text><text x="160" y="${Y(Math.max(o, cl)) + 20}" class="t-mute">高 ${h.toFixed(0)}　低 ${l.toFixed(0)}</text>
        <text x="160" y="262" class="${d >= 0 ? "t-buy" : "t-sell"} t-b t-lg">Delta ${sg(d)}</text><text x="160" y="312" class="t-mute">成交量 ${vol.toLocaleString()} 口（${Math.round(Math.abs(d) / vol * 100)}%）</text>`;
      q(".dr-q").innerHTML = "這根 K 棒是哪一種情境？";
      box.querySelectorAll(".dr-opts .q-opt").forEach((b) => b.classList.remove("ok", "bad"));
      q(".dr-fb").innerHTML = ""; q(".dr-next").disabled = !answered;
      score();
    }
    function score() {
      q(".dr-score").textContent = total ? `答對 ${right} / ${total}　連續答對 ${streak} 題（最高 ${best}）` : "隨機出題，答完按「下一題」。";
      q(".dr-task").innerHTML = [[best >= 5, "任務：連續答對 5 題"], [total >= 10 && right / total >= 0.8, "任務：至少做 10 題，正確率 80% 以上"]].map(([ok, tx]) => `<li class="${ok ? "ok" : ""}">${ok ? "✓" : "○"} ${tx}</li>`).join("");
    }
    box.addEventListener("click", (e) => {
      if (e.target.closest(".dr-next")) { make(); return; }
      const b = e.target.closest(".dr-opts .q-opt"); if (!b || answered) return;
      answered = true; total++;
      const ok = b.dataset.k === cur.c.k;
      if (ok) { right++; streak++; best = Math.max(best, streak); } else streak = 0;
      b.classList.add(ok ? "ok" : "bad");
      if (!ok) box.querySelector(`.dr-opts .q-opt[data-k="${cur.c.k}"]`).classList.add("ok");
      const up = cur.cl > cur.o + 8 ? "價格明顯上漲" : cur.cl < cur.o - 8 ? "價格明顯下跌" : cur.c.k === "C" ? "價格衝上去又收回來，沒漲成" : "價格跌下去又收回來，沒跌成";
      q(".dr-fb").innerHTML = `<b class="${ok ? "ok" : "bad"}">${ok ? "答對了。" : "答案是 " + cur.c.k + "。"}</b>Delta ${cur.d > 0 ? "為正（買方急）" : "為負（賣方急）"}，${up}：${cur.c.msg}。`;
      q(".dr-next").disabled = false; score();
    });
    make();
  }

  const QS = [
    { fig: `<p class="small q-cap">一根大跌的 K 棒，收在最低點附近，Delta −200。</p>`, q: "這是哪一種情境？", step: 4, o: [
      ["情境 B：賣方推得動", true, "Delta 為負、價格也下跌，兩者同向，代表主動賣方成功把價格推下去。"],
      ["情境 D：下面有人在接", false, "D 是賣方很用力、價格卻跌不下去。這裡價格確實跌下去了。"],
      ["情境 C：上面有人在擋", false, "C 是 Delta 為正。這裡 Delta 是負的。"]] },
    { fig: `<table class="fp q-fp" aria-label="題目二的兩根 K 棒"><thead><tr><td>K 棒</td><td>成交量</td><td>Delta</td></tr></thead><tbody><tr><td class="px">甲</td><td class="px">3,000 口</td><td class="px">+150</td></tr><tr><td class="px">乙</td><td class="px">500 口</td><td class="px">+150</td></tr></tbody></table>`,
      q: "兩根 Delta 一樣是 +150，哪一根的買方比較壓倒性？", step: 9, o: [
      ["甲", false, "150 ÷ 3,000 ＝ 5%，大部分成交是雙方互相抵消。"],
      ["乙", true, "150 ÷ 500 ＝ 30%，乙的成交裡一面倒得多。"],
      ["一樣", false, "Delta 數字一樣，但佔成交量的比例差了 6 倍。"]] },
    { fig: `<p class="small q-cap">價格漲到前高，這根 K 棒 Delta <b>+400</b>，但收盤幾乎回到開盤價，留下長長的上影線。</p>`, q: "最合理的解讀是？", step: 5, o: [
      ["買方很強，接下來會突破前高", false, "買方確實很用力，但價格沒有漲上去，力氣被吸收了。這不是突破的樣子。"],
      ["買方被上面的限價賣單擋住，是情境 C", true, "正 Delta、價格卻漲不上去，而且就在前高這個重要價位：上面有人在擋。這正是值得注意的反向訊號。"],
      ["Delta 正的就是好事，可以追多", false, "Delta 一定要和價格一起看。反向的時候，代表主動的一方被吸收了。"]] }
  ];

  PAGES["of-3"] = window.KIT.page(window.COURSE.OFC, "of-3", {
    topic: " Delta",
    lede: "Delta 告訴你誰比較急，但急不代表推得動。這一關學會把 Delta 和價格放在一起看：只有四種組合，記住「同向推得動、反向有人擋」就夠了。",
    analogy: [
      ["拔河", "兩隊用力的差就是 Delta。用力的一方把繩子拉過來，就是價格往那邊走。"],
      ["推門", "很用力推，門卻不動：門後面一定有人頂著。Delta 很大、價格不動，就是這種情況。"],
      ["一直補貨的攤販", "客人一直買，攤販一直從後面補貨，貨架永遠不會空。限價單不斷補上，價格就吃不上去。"]],
    steps: STEPS, draw, simHTML, simMount,
    simIntro: "隨機出一根 K 棒和它的 Delta，你判斷是哪一種情境。連續答對 5 題就算熟練。",
    mist: [
      ["Delta 是正的就做多", "要看價格有沒有跟著漲。正 Delta 但漲不上去（情境 C），代表上面有人在擋，反而要小心。"],
      ["Delta 數字越大越重要", "要和成交量比。+300 在 6,000 口的 K 棒裡只佔 5%，+120 在 400 口裡佔 30%。"],
      ["任何地方出現反向訊號都可以進場", "反向訊號只在重要價位（前高、前低、價值區邊緣）才有意義。半路上的反向，常常只是雜訊。"]],
    faq: [
      ["這裡的 Delta 和 Footprint 的 Delta 一樣嗎？", "一樣。Footprint 每一列的 Delta 加起來，就是整根 K 棒的總 Delta，畫在 K 棒下面就是 Delta 柱狀圖。"],
      ["K 棒還沒收完時，Delta 會變嗎？", "會。K 棒形成的過程中，Delta 會一直變化，判斷時用收完那一刻的數字。有些軟體也會顯示這根 K 棒過程中的最大、最小 Delta。"],
      ["用幾分鐘的 K 棒來看比較好？", "沒有標準答案。時間越短反應越快、雜訊也越多；越長越穩、但比較慢。先用你習慣的週期，重點是固定一種，才能累積經驗。"],
      ["Delta 可以單獨拿來預測方向嗎？", "不行。它是確認用的工具：先有重要價位，價格到了，再看 Delta 和價格是同向還是反向。"],
      ["為什麼主動賣比較多，價格還能漲？", "因為下面有大量限價買單在接，而且接的人願意一路往上掛單（墊價）。主動賣方賣得再多，也推不動價格。"],
      ["外匯、差價合約（CFD）也能看 Delta 嗎？", "要小心。Delta 需要集中交易所的逐筆成交資料。期貨（像 NQ）有；外匯現貨和 CFD 沒有集中的成交量，軟體算出來的 Delta 通常只是估計，可信度低很多。"]],
    qs: QS,
    gloss: [
      ["Delta", "主動買 − 主動賣。正＝買方急，負＝賣方急。"],
      ["Delta 柱狀圖", "把每根 K 棒的總 Delta 畫成 K 棒下面的柱子。"],
      ["同向", "Delta 和價格往同一個方向：主動的一方推得動。"],
      ["反向", "Delta 和價格方向相反：主動的一方被擋住了。"],
      ["吸收", "大量限價單接住主動單，讓價格動不了。"],
      ["Delta 比例", "Delta ÷ 成交量，用來看一面倒的程度。"]],
    remember: "<b>Delta 和價格同向＝推得動；反向＝有人在擋。</b>要和成交量比，而且只在重要價位上看。"
  });
})();
