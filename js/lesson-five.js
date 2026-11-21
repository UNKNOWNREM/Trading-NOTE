/* 路線 1 第 12 關（新版）：五個確認訊號 */
(function () {
  const PAGES = (window.__PAGES = window.__PAGES || {});
  const { chip, lerp, ease, seg, cards, fpMini } = window.KIT;
  // 筆記的情境：ES 來到昨日 VAH 5010（阻力），平均每個價位約 40 口
  const C1 = { rows: [[5010.25, 12, 60], [5010.0, 30, 85], [5009.75, 30, 55], [5009.5, 38, 45], [5009.25, 33, 35], [5009.0, 28, 30], [5008.75, 25, 20], [5008.5, 24, 10]], d: 120, txt: "陽線 5008.75 → 5010.00" };
  const C2 = { rows: [[5010.25, 20, 35], [5010.0, 210, 230], [5009.75, 70, 40], [5009.5, 60, 30], [5009.25, 50, 25], [5009.0, 45, 20], [5008.75, 30, 10]], d: -95, txt: "陰線 5010.00 → 5009.00" };
  const SIG = ["吸收", "大限價單", "被套交易者", "主動交易者", "Delta 轉向"];

  function two(o = {}) {
    let s = fpMini(40, 50, C1.rows, { title: "第 1 根 5 分 K", mark: 5010, rh: 32, hl: o.hl1, foot: o.f1 === false ? "" : `Delta +120　${C1.txt}` });
    if (o.show2 !== false) s += fpMini(330, 50, C2.rows, { title: "第 2 根 5 分 K", mark: 5010, rh: 32, hl: o.hl2, foot: `Delta −95　${C2.txt}` });
    return s;
  }

  const STEPS = [
    { cap: "先有<b>位置</b>，才看訊號。這個情境來自筆記：ES 往上走，來到<b>昨天的 VAH 5010</b>，這是盤前就標好的阻力。",
      why: "前面幾關學的 Volume Profile、VWAP、時段高低點，都是在畫「在哪裡等」的地圖。價格沒到這些地方，再漂亮的訊號都不看。", stuckHref: "#of-6", stuckLabel: "回第 7 關複習 VAH →", stuck: "先有犯案現場，線索才有意義。位置就是現場。" },
    { cap: "到了位置，要找的是這<b>五個確認訊號</b>。不需要全部出現，<b>2～3 個</b>就夠考慮進場。",
      why: "這五個訊號都是從 Footprint 讀出來的「買賣方在關鍵位的反應」。注意：這是推論式的解讀，不是統計驗證過的規律。" },
    { cap: "① <b>吸收</b>：同一個價位，主動買和主動賣<b>都異常大</b>，價格卻過不去。第 2 根的 5010.00 有 210 口主動賣、230 口主動買，是平均（約 40 口）的 5 倍以上。",
      why: "主動買很多，價格卻沒往上，代表上面有人用大量限價賣單接住。第 4 關的「情境 C：上面有人在擋」，在 Footprint 上就是長這樣。", stuckHref: "#of-3", stuckLabel: "回第 4 關複習「有人在擋」→", dur: 2200 },
    { cap: "② <b>大限價單</b>：某一側出現異常大量，代表那裡有一大筆限價單在等。這裡 5010.00 的主動買 230 口，就是撞上了一堵限價賣單的牆。",
      why: "主動買吃了 230 口還吃不穿，代表那裡的限價賣單至少有這麼多。它和吸收描述的是同一格、同一件事。" },
    { cap: "想一想：5010.00 這一格，同時符合「吸收」和「大限價單」。",
      q: { t: "你的確認數應該怎麼算？", o: [
        ["算 2 個", false, "它們描述的是同一格、同一件事，算兩次會高估確認的強度。"],
        ["算 1 個，重疊的訊號不重複計分", true, "筆記特別提醒：有些訊號互相重疊，不要重複計分。這裡只算「吸收」一個。"],
        ["都不算", false, "它仍然是一個有效的確認，只是不能算兩次。"]] } },
    { cap: "③ <b>被套交易者</b>：第 1 根在頂部追買的人（Ask 側量大），下一根價格就往下收。他們被套住了，認賠時的賣單會<b>加速下跌</b>。",
      why: "追高的人一旦價格回落就開始虧損，平倉只能賣出（市價賣單），這些賣單會變成往下的推力。這是推測：實際上很難知道成交的是誰、是不是真的被套。", dur: 2600 },
    { cap: "④ <b>主動交易者</b>：在阻力位，看 Bid 側（主動賣）有沒有出現特別突出的大量，代表有人主動進場做空。這個情境裡<b>沒有出現</b>。",
      why: "第 2 根除了 5010.00 那一格，其他格的主動賣只有 30～70 口，沒有特別突出的單一大量，所以這個訊號不算。" },
    { cap: "⑤ <b>Delta 轉向</b>：第 1 根 Delta +120，第 2 根變成 −95。在阻力位<b>由正轉負</b>，代表賣方接手。",
      why: "這就是第 4 關學的 Delta 和第 5 關的 CVD 概念，用在關鍵位上：主動的一方換人了。" },
    { cap: "換個方向想：如果是在<b>支撐位</b>考慮做多。",
      q: { t: "Delta 轉向應該是什麼樣子？", o: [
        ["由正轉負", false, "由正轉負是賣方接手，那是在阻力位做空時要看的。"],
        ["由負轉正", true, "支撐位做多，要看到賣方力氣用完、買方接手，也就是 Delta 由負轉正。"],
        ["Delta 一直很大就好", false, "重點是「轉向」：主動的一方換人。一直很大不一定代表換手。"]] } },
    { cap: "現在照時間重播。第 1 根：價格衝到 5010.25，頂部主動買很多，Delta +120，看起來像要突破。<b>先別急</b>，等下一根。",
      why: "一根 K 棒還看不出結果。主動買很多，可能是突破，也可能是被吸收。要等第 2 根確認價格到底過不過得去。", dur: 2000 },
    { cap: "第 2 根：5010.00 兩邊都爆量，價格卻上不去，收陰線，Delta −95。結算：<b>位置＋3 個確認</b>（吸收、被套交易者、Delta 轉向）。",
      why: "大限價單和吸收重疊不另計，主動交易者沒有出現。位置正確加 3 個確認，符合「2～3 個就夠」。接下來才是算停損和口數（第 13 關）。", dur: 2400 },
    { cap: "練習一下：價格在<b>半路上</b>（離任何關鍵價位都很遠），Footprint 卻同時出現吸收、Delta 轉向、失衡、大限價單。",
      q: { t: "照這套流程，你應該？", o: [
        ["4 個確認，馬上進場", false, "訊號再多，位置不對就不做。這套流程是先有位置，才看訊號。"],
        ["觀望，因為不在關鍵價位", true, "沒有位置，就沒有「為什麼在這裡反轉」的理由。這些訊號在半路上常常只是雜訊。"],
        ["反向操作", false, "沒有理由反向。不在位置上，就是不做。"]] } },
    { cap: "整理：<b>位置先、訊號後，2～3 個獨立的確認就夠</b>。重疊的訊號只算一次；只做第一次觸碰，錯過了不追。",
      why: "「只做第一次觸碰」是筆記裡的規則：關鍵位第一次被測試時反應最可靠，被測試越多次越容易被突破。錯過進場點，就等下一個位置。" }
  ];

  function draw(svg, i, t) {
    const e = ease(t); let s = "";
    if (i === 0) {
      const Y = (p) => lerp(320, 60, (p - 4985) / 30);
      s += `<rect x="60" y="${Y(5011)}" width="540" height="${Y(5009) - Y(5011)}" class="f-sell-soft"/><line x1="60" x2="600" y1="${Y(5010)}" y2="${Y(5010)}" class="s-sell" stroke-width="2.5" stroke-dasharray="6 4"/><text x="596" y="${Y(5010) - 14}" text-anchor="end" class="t-sell t-b">昨日 VAH 5010（阻力）</text>`;
      const P = [[70, 4992], [140, 4995], [200, 4993], [270, 4999], [340, 5003], [400, 5001], [470, 5007], [530, 5010]];
      const n = Math.max(2, Math.ceil(seg(t, 0, 0.85) * P.length));
      s += `<polyline points="${P.slice(0, n).map((q) => `${q[0]},${Y(q[1])}`).join(" ")}" class="s-ink f-none" stroke-width="2.5"/>`;
      if (t > 0.85) s += chip(450, Y(5010) + 50, "到位了，現在才看 Footprint", "hl");
    } else if (i === 1) {
      s += cards(SIG.map((n, k) => [`${"①②③④⑤"[k]} ${n}`, ["同一價位兩邊都爆量，價格不過", "某一側異常大量，有大單在等", "追錯方向的人被套，認賠加速", "反方向出現主動大量進場", "Delta 在關鍵位換方向"][k]]), t, { h: 50, gap: 60, y: 30 });
    } else if (i === 2 || i === 3) {
      s += two({ hl2: [5010], f1: i === 2 ? undefined : undefined });
      const a = seg(t, 0.2, 0.7);
      if (i === 2) s += `<g opacity="${a}"><text x="330" y="360" class="t-ink t-b">210 × 230：兩邊都是平均的 5 倍以上，價格卻收在下面</text></g>`;
      else s += `<g opacity="${a}"><text x="330" y="360" class="t-ink t-b">主動買 230 口吃不穿 → 那裡有一堵限價賣單的牆</text></g>`;
    } else if (i === 4) {
      s += two({ hl2: [5010] }) + chip(470, 26, "吸收？大限價單？算幾個？", "hl");
    } else if (i === 5) {
      s += two({ hl1: [5010.25, 5010] });
      const dots = Array.from({ length: 8 }, (_, k) => [250 + (k % 4) * 12, 60 + Math.floor(k / 4) * 12]);
      const ph = t < 0.4 ? 0 : t < 0.7 ? 1 : 2;
      s += dots.map(([x, y]) => `<circle cx="${x}" cy="${y + (ph === 2 ? seg(t, 0.7, 1) * 120 : 0)}" r="5" class="${ph === 0 ? "f-buy" : "f-sell"}" opacity="${ph === 2 ? 0.6 : 1}"/>`).join("");
      s += `<text x="250" y="40" class="${ph === 0 ? "t-buy" : "t-sell"} t-b">${["追高買進", "被套住", "認賠賣出 ↓"][ph]}</text>`;
    } else if (i === 6) {
      s += two({});
      s += `<g opacity="${seg(t, 0.2, 0.6)}">${C2.rows.map((r, k) => r[0] !== 5010 ? `<rect x="327" y="${47 + k * 32}" width="68" height="${32}" rx="5" class="f-none s-ink" stroke-width="1.5" stroke-dasharray="3 3"/>` : "").join("")}<text x="330" y="360" class="t-mute">其他格主動賣只有 30～70 口：沒有突出的大量</text></g>`;
    } else if (i === 7 || i === 8) {
      s += two({});
      s += `<g opacity="${i === 8 ? 1 : seg(t, 0.2, 0.7)}"><rect x="40" y="306" width="204" height="28" rx="6" class="f-none s-buy" stroke-width="2.5"/><rect x="330" y="274" width="204" height="28" rx="6" class="f-none s-sell" stroke-width="2.5"/><path d="M250 336 Q300 352 340 316" class="s-gamma f-none" stroke-width="3"/><text x="290" y="370" text-anchor="middle" class="t-gamma t-b">+120 → −95：賣方接手</text></g>`;
      if (i === 8) s += chip(500, 26, "支撐位做多呢？", "hl");
    } else if (i === 9) {
      s += fpMini(40, 50, C1.rows, { title: "第 1 根 5 分 K", mark: 5010, rh: 32, foot: `Delta +120　${C1.txt}` });
      s += `<g opacity="${seg(t, 0.3, 0.8)}"><rect x="330" y="60" width="260" height="120" rx="12" class="f-gamma-soft"/><text x="346" y="92" class="t-ink t-b t-lg">看起來像要突破</text><text x="346" y="122" class="t-ink">頂部主動買很多</text><text x="346" y="148" class="t-ink t-b">先別急，等第 2 根</text></g>`;
    } else if (i === 10) {
      s += fpMini(40, 50, C2.rows, { title: "第 2 根 5 分 K", mark: 5010, rh: 32, hl: [5010], foot: `Delta −95　${C2.txt}` });
      const R = [["位置：昨日 VAH", 1], ["吸收", 1], ["大限價單（和吸收重疊，不另計）", 0], ["被套交易者", 1], ["主動交易者（沒有出現）", -1], ["Delta 轉向", 1]];
      R.forEach(([n, ok], k) => { s += `<g opacity="${seg(t, k * 0.12, k * 0.12 + 0.25)}"><circle cx="352" cy="${76 + k * 40}" r="11" class="${ok === 1 ? "f-hl" : ok === 0 ? "f-inkd" : "f-sell"}"/><text x="352" y="${81 + k * 40}" text-anchor="middle" class="t-w t-b">${ok === 1 ? "✓" : ok === 0 ? "＝" : "✗"}</text><text x="372" y="${81 + k * 40}" class="t-ink${ok === 1 ? " t-b" : ""}">${n}</text></g>`; });
      s += `<text x="340" y="330" class="t-gamma t-b t-lg" opacity="${seg(t, 0.8, 1)}">位置＋3 個確認</text>`;
    } else if (i === 11) {
      const Y = (p) => lerp(320, 60, (p - 40) / 30);
      s += `<rect x="60" y="${Y(68)}" width="540" height="${Y(65) - Y(68)}" class="f-sell-soft"/><text x="66" y="${Y(68) - 6}" class="t-sell t-b">關鍵價位（很遠）</text><rect x="60" y="${Y(45)}" width="540" height="${Y(42) - Y(45)}" class="f-buy-soft"/><text x="66" y="${Y(42) + 16}" class="t-buy t-b">關鍵價位（很遠）</text>`;
      s += `<polyline points="70,${Y(50)} 160,${Y(53)} 240,${Y(51)} 320,${Y(55)}" class="s-ink f-none" stroke-width="2.5"/>` + chip(430, Y(55), "4 個確認！", "hl") + `<text x="430" y="${Y(55) + 34}" text-anchor="middle" class="t-mute">可是在半路上</text>`;
    } else if (i === 12) {
      s += cards([["位置先", "價格到盤前標好的關鍵價位，才開始看"], ["2～3 個確認", "吸收、大限價單、被套、主動交易者、Delta 轉向"], ["重疊只算一次", "同一格、同一件事，不重複計分"], ["只做第一次觸碰", "被測試越多次越容易被突破"], ["錯過不追", "等下一個位置"]], t, { hl: 0 });
    }
    svg.innerHTML = s;
  }

  /* ---------- 你來操作：四個情境，自己勾訊號、做決定 ---------- */
  const SC = [
    { t: "情境 1：ES 漲到昨日 VAH 5010（阻力）", loc: true, desc: "第 1 根頂部主動買量大、Delta +120；第 2 根 5010.00 兩邊 210 × 230，價格上不去收陰，Delta −95。其他格的主動賣只有 30～70 口。", ans: [1, 0, 1, 0, 1], dup: [1], dec: "short", why: "位置正確＋吸收、被套交易者、Delta 轉向 3 個確認（大限價單和吸收重疊不另計，主動交易者沒出現），可以考慮做空。" },
    { t: "情境 2：價格跌到昨日 VAL 4990（支撐）", loc: true, desc: "第 1 根下探 4989.25，底部主動賣很多，Delta −110；第 2 根 4989.00 兩邊 190 × 210，收陽線，Delta +85；4988.50～4989.25 連續 3 格買方失衡。", ans: [1, 0, 1, 1, 1], dup: [1], dec: "long", why: "位置正確＋吸收、被套交易者（底部追空的人）、主動交易者（連續買方失衡）、Delta 轉向，4 個確認，可以考慮做多。" },
    { t: "情境 3：價格在兩個關鍵價位正中間", loc: false, desc: "某一格兩邊都爆量、價格不動，Delta 從正轉負，旁邊還有一格大限價單。", ans: [1, 0, 0, 0, 1], dup: [1], dec: "wait", why: "訊號看起來很多，但不在任何關鍵價位上。沒有位置，就不做。" },
    { t: "情境 4：NQ 漲到前一天正規時段高點（阻力）", loc: true, desc: "到了高點後 Delta 從 +60 變成 −20，但沒有任何一格特別大的量，價格也還在高點附近。", ans: [0, 0, 0, 0, 1], dup: [], dec: "wait", why: "位置對，但只有 Delta 轉向 1 個確認，而且很弱。不夠 2～3 個，先觀望。" }
  ];
  const simHTML = `<div class="tabs fv-tabs">${SC.map((x, k) => `<button class="tab" data-k="${k}" aria-selected="${k === 0}" type="button">情境 ${k + 1}</button>`).join("")}</div>
<div class="fv-card"></div><ul class="sim-task fv-task"></ul>`;
  function simMount(box) {
    const q = (s) => box.querySelector(s); let k = 0; const done = new Set();
    function paint(res) {
      const x = SC[k];
      q(".fv-card").innerHTML = `<h4>${x.t}</h4><p>${x.desc}</p>
        <p class="small">1. 勾出<b>有出現、而且要計分</b>的訊號（重疊的不要重複勾）：</p>
        <div class="fv-sig">${SIG.map((n, j) => `<label><input type="checkbox" data-j="${j}"> ${n}</label>`).join("")}</div>
        <p class="small">2. 你的決定：</p>
        <div class="btn-row fv-dec"><button class="btn" data-d="long" type="button">考慮做多</button><button class="btn" data-d="short" type="button">考慮做空</button><button class="btn" data-d="wait" type="button">觀望</button></div>
        <div class="fv-fb" aria-live="polite">${res || ""}</div>`;
    }
    function check(dec) {
      const x = SC[k], got = [...box.querySelectorAll(".fv-sig input")].map((el) => (el.checked ? 1 : 0));
      const sigOk = got.every((v, j) => v === x.ans[j]), decOk = dec === x.dec;
      const want = SIG.filter((_, j) => x.ans[j]).join("、") || "沒有";
      const fb = `<p><b class="${sigOk ? "ok" : "bad"}">${sigOk ? "訊號勾對了。" : "訊號勾得不太對。"}</b>要計分的是：${want}。${x.dup.length ? "大限價單和吸收是同一格，不另計。" : ""}</p><p><b class="${decOk ? "ok" : "bad"}">${decOk ? "決定正確。" : "決定不對。"}</b>${x.why}</p>`;
      if (sigOk && decOk) done.add(k);
      paint(fb); got.forEach((v, j) => (box.querySelector(`.fv-sig input[data-j="${j}"]`).checked = !!v));
      q(".fv-task").innerHTML = SC.map((_, j) => `<li class="${done.has(j) ? "ok" : ""}">${done.has(j) ? "✓" : "○"} 情境 ${j + 1}：訊號和決定都答對</li>`).join("");
    }
    box.addEventListener("click", (e) => {
      const tb = e.target.closest(".fv-tabs .tab"); if (tb) { k = +tb.dataset.k; box.querySelectorAll(".fv-tabs .tab").forEach((b) => b.setAttribute("aria-selected", String(b === tb))); paint(); return; }
      const d = e.target.closest("[data-d]"); if (d) check(d.dataset.d);
    });
    paint();
    q(".fv-task").innerHTML = SC.map((_, j) => `<li>○ 情境 ${j + 1}：訊號和決定都答對</li>`).join("");
  }

  const QS = [
    { fig: `<p class="small q-cap">在阻力位，某一格主動買 193 口（平均約 40 口），主動賣只有 8 口，下一根價格就往下收。</p>`, q: "這一格最可能代表什麼？", step: 4, o: [
      ["大買家進場，接下來會突破", false, "主動買很多，價格卻沒有上去，下一根還往下收，這不是突破的樣子。"],
      ["主動買撞上了一堵限價賣單的牆（大限價單），追買的人可能被套", true, "主動買一直吃卻吃不穿，代表那裡有大量限價賣單。下一根往下，追高的人被套，可能加速下跌。"],
      ["量大本身就代表要跌", false, "量大分不出是誰贏，要看價格結果和位置。"]] },
    { fig: `<p class="small q-cap">支撐位出現：吸收、被套交易者、Delta 由負轉正。你在第二根收盤時才發現，價格已經從支撐漲了 15 點。</p>`, q: "照這一關的規則，比較合理的是？", step: 13, o: [
      ["馬上追進去，3 個確認很強", false, "確認很強，但價格已經離開位置 15 點。追進去，停損會很遠、風報比變差。"],
      ["錯過就算了，等下一個位置", true, "只做第一次觸碰、錯過不追。下一個位置一定會再出現。"],
      ["反向做空，因為已經漲很多", false, "沒有任何反向的理由。錯過不代表要反著做。"]] },
    { fig: `<p class="small q-cap">同一個阻力位今天已經被測試了第四次，這次又出現了吸收和 Delta 轉向。</p>`, q: "和第一次觸碰相比，這次的訊號？", step: 13, o: [
      ["一樣可靠", false, "被測試越多次，那裡的限價單被消耗越多，越容易被突破。"],
      ["比較不可靠，被測試越多次越容易被突破", true, "這就是「只做第一次觸碰」的原因。第四次測試的反轉，可靠度通常比較低。"],
      ["更可靠，因為大家都知道這是阻力", false, "大家都知道，也代表停損都放在那裡，反而容易被一次掃掉後突破。"]] }
  ];

  PAGES["of-5"] = window.KIT.page(window.COURSE.OFC, "of-5", {
    topic: "五個確認訊號",
    lede: "價格到了關鍵位，要找的不是一個訊號，而是幾個獨立的訊號一起出現。這一關用一個情境（ES 到昨日 VAH 5010），一個一個認識五個確認訊號，再照時間重播一次。",
    analogy: [
      ["偵探辦案", "只有一個線索不能定案，要有兩三個彼此獨立的線索互相印證。"],
      ["同一個證人", "同一個人講兩次，不能算兩份證詞。重疊的訊號也只能算一次。"],
      ["犯案現場", "線索要在現場找到才有意義。沒有到關鍵價位，訊號就沒有意義。"]],
    steps: STEPS, draw, simHTML, simMount,
    simIntro: "四個情境，自己勾出要計分的訊號，再決定做多、做空還是觀望。",
    mist: [
      ["訊號越多越好，看到 5 個才進場", "2～3 個獨立的確認就夠。等到 5 個全部出現，常常已經錯過最好的位置。"],
      ["吸收和大限價單同時出現就算 2 個", "它們描述的是同一格、同一件事，只算 1 個。"],
      ["在哪裡出現都可以進場", "位置先、訊號後。不在關鍵價位的訊號，就算再多也不做。"]],
    faq: [
      ["五個訊號一定要用 Footprint 才看得到嗎？", "是的，它們都是從每個價位的主動買賣讀出來的。沒有 Footprint，只能看到 Delta 轉向（用 Delta 柱狀圖）。"],
      ["「異常大量」要多大才算？", "這套筆記用「平均的 3～5 倍以上」當參考。平均要用同一時段、同一商品來算，美股開盤和亞洲時段的平均差很多。"],
      ["被套交易者怎麼確定真的被套？", "沒辦法確定。我們只能從「大量成交後價格往反方向走」推測。這也是為什麼要搭配其他訊號，不單獨使用。"],
      ["做多時五個訊號怎麼看？", "全部反過來：吸收出現在支撐、大限價單在 Bid 側、被套的是在底部追空的人、主動交易者是 Ask 側大量、Delta 由負轉正。"],
      ["為什麼只做第一次觸碰？", "第一次測試時，那裡的限價單最多，反應最可靠。每被測試一次，限價單就被消耗一些，越來越容易被突破。"],
      ["這五個訊號有統計證明有效嗎？", "沒有。它們是推論式的解讀，這套筆記把它們當成「確認工具」，要用自己的交易紀錄去驗證。"]],
    qs: QS,
    gloss: [
      ["吸收", "同一價位主動買賣都異常大，價格卻過不去。"],
      ["大限價單", "某一側異常大量，代表有大筆限價單在等。"],
      ["被套交易者", "追錯方向的人被套住，認賠時加速反向。"],
      ["主動交易者", "反方向出現主動的大量進場。"],
      ["Delta 轉向", "在關鍵位，Delta 由正轉負或由負轉正。"],
      ["第一次觸碰", "關鍵價位第一次被測試，反應通常最可靠。"]],
    remember: "<b>位置先、訊號後，2～3 個獨立的確認就夠。</b>重疊的訊號只算一次；只做第一次觸碰，錯過了不追。"
  });
})();
