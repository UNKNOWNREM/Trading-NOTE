/* 路線 1 第 18 關（補充）：位置清單與出場——重疊、缺口、停損與目標。例子都是虛構數字。 */
(function () {
  const PAGES = (window.__PAGES = window.__PAGES || {});
  const { lerp, ease, seg, cards } = window.KIT;
  const LO = 28000, HI = 28240;
  const Y = (p) => lerp(350, 30, (p - LO) / (HI - LO));
  const f0 = (v) => Math.round(v).toLocaleString("en-US");
  // 位置：單一價位 p，或範圍 lo～hi
  const LV = [
    { id: "vah", n: "昨日 VAH", p: 28210, c: "sell" },
    { id: "open", n: "今日 RTH 開盤", p: 28150, c: "sell" },
    { id: "gap50", n: "缺口 50%", p: 28095, c: "hl" },
    { id: "vwap", n: "VWAP", p: 28090, c: "hl" },
    { id: "big", n: "大單堆疊", lo: 28080, hi: 28100, c: "hl" },
    { id: "imb", n: "買方失衡框", lo: 28072, hi: 28098, c: "hl" },
    { id: "close", n: "前日 RTH 收盤", p: 28040, c: "buy" },
    { id: "val", n: "昨日 VAL", p: 28020, c: "buy" }];
  const mid = (l) => (l.p != null ? l.p : (l.lo + l.hi) / 2);
  // 標籤避免互相重疊：由上往下排，至少間隔 20px
  function place() {
    const arr = [...LV].sort((a, b) => mid(b) - mid(a)); let prev = -99;
    return arr.map((l) => { const y0 = Y(mid(l)), y = Math.max(y0, prev + 20); prev = y; return { l, y0, y }; });
  }
  const PL = place();
  const clsOf = (c) => (c === "sell" ? "s-sell" : c === "buy" ? "s-buy" : "s-hl");
  function ladder(o = {}) {
    let s = "";
    for (let p = 28000; p <= 28240; p += 40) s += `<line x1="150" x2="610" y1="${Y(p)}" y2="${Y(p)}" class="s-line"/><text x="620" y="${Y(p) + 4}" class="t-mute">${f0(p)}</text>`;
    PL.forEach(({ l, y0, y }, k) => {
      const op = o.show == null ? 1 : o.show(l, k), hot = o.hot && o.hot.includes(l.id);
      if (!op) return;
      s += `<g opacity="${op}">`;
      if (l.p != null) s += `<line x1="150" x2="610" y1="${y0}" y2="${y0}" class="${clsOf(l.c)}" stroke-width="${hot ? 3.5 : 2}"/>`;
      else s += `<rect x="150" y="${Y(l.hi)}" width="460" height="${Y(l.lo) - Y(l.hi)}" class="f-hl" opacity="0.2"/><rect x="150" y="${Y(l.hi)}" width="460" height="${Y(l.lo) - Y(l.hi)}" class="f-none s-hl" stroke-width="${hot ? 3 : 1.5}"/>`;
      s += `<line x1="146" y1="${y0}" x2="136" y2="${y}" class="s-line"/><text x="130" y="${y + 4}" text-anchor="end" class="${hot ? "t-ink t-b" : "t-ink"}">${l.n} ${l.p != null ? f0(l.p) : f0(l.lo) + "–" + f0(l.hi)}</text></g>`;
    });
    return s + (o.extra || "");
  }
  const ann = (txt, y = 20) => `<text x="150" y="${y}" class="t-ink t-b">${txt}</text>`;

  const ENTRY = 28095, STOP_OUT = 28068, STOP_IN = 28085, TGT1 = 28150, TGT2 = 28210;
  const STEPS = [
    { cap: "盤前先把<b>位置</b>列出來：昨天的價值區邊緣、今天的缺口、VWAP、失衡框、大單堆疊。事先畫好，盤中就不用靠臨場判斷。",
      why: "位置告訴你「去哪裡看」。價格碰到位置不等於要進場，而是到了才開始看訂單流有沒有確認。", stuckHref: "#of-5", stuckLabel: "回第 12 關複習確認訊號 →", stuck: "位置先、訊號後。到了位置才看吸收、Delta 轉向這些確認。", dur: 3000 },
    { cap: "<b>開盤缺口</b>有三條線：前日 RTH 收盤、今日 RTH 開盤，以及兩者的<b>中點（50%）</b>。夜盤成交少，價格容易被推遠，開盤後常會回頭測試。",
      why: "向上跳空時，缺口下緣（前日收盤）常是支撐；向下跳空時，缺口上緣常是壓力。開盤後直接往跳空方向走、不回頭，代表當天偏強勢。", stuckHref: "#of-sess", stuckLabel: "回第 10 關複習 RTH 與夜盤 →", stuck: "RTH 是正規交易時段，其他時間是夜盤。缺口是前日 RTH 收盤到今日 RTH 開盤的差距。",
      dur: 3000 },
    { cap: "看這個價區：<b>失衡框、大單堆疊、VWAP、缺口 50%</b>全部擠在 28,072～28,100。<b>4 個位置重疊</b>。",
      why: "單一位置可能失效，好幾個位置落在同一個價區，代表有很多不同的參與者都在意這裡，反應通常更明顯。", dur: 2600 },
    { cap: "換你想：盤中價格回檔，來到這個重疊的價區附近。",
      q: { t: "比較合理的做法是？", o: [
        ["列為優先位置，到價後看吸收、Delta 轉向等確認，再決定", true, "4 個位置重疊，是這張圖上最值得關注的地方。但碰到不等於進場，要等訂單流確認。"],
        ["不用看，只看最遠的昨日 VAH", false, "最遠的位置離現在的價格很遠，而重疊的價區就在眼前。"],
        ["價格一碰到就直接買", false, "位置只告訴你在哪看，進場還要有確認。"]] } },
    { cap: "假設在 28,095 做多。<b>停損放在整個重疊價區的外面</b>：28,068，在 28,072 的下面；不要放在價區裡面（例如 28,085）。",
      why: "價格在價區裡晃動，不代表判斷錯；穿過整個價區才代表這個位置失守。放在裡面，容易被來回的雜訊洗掉。放在外面，被打到就是真的認錯。", dur: 3000 },
    { cap: "<b>目標看反方向最近的位置</b>：往上最近的是今日開盤 28,150。風險是 28,095 − 28,068 ＝ 27 點，報酬是 28,150 − 28,095 ＝ 55 點，風險報酬比約 <b>2.0</b>。",
      why: "R 就是「報酬 ÷ 風險」。目標選在最近的反方向位置，因為那裡最可能有人出來擋。報酬太小、R 太低的單，可以選擇不做。", dur: 3200 },
    { cap: "換你算：進場 28,095、停損 28,068，這次目標改成更遠的昨日 VAH 28,210。",
      q: { t: "風險報酬比大約是多少？", o: [
        ["約 4.3", true, "風險 27 點；報酬 28,210 − 28,095 ＝ 115 點；115 ÷ 27 ≈ 4.3。但目標越遠，中途被擋回的機會也越大。"],
        ["約 2.0", false, "2.0 是目標在 28,150 時的算法（報酬 55 點）。"],
        ["約 0.5", false, "算反了：報酬是 115 點，風險 27 點，R 是報酬 ÷ 風險。"]] } },
    { cap: "回到開盤缺口，通常有三種走法：<b>回補後守住</b>、<b>連前日收盤都守不住</b>、<b>缺口不補</b>。",
      why: "向上跳空後：回補到前日收盤並守住 → 缺口下緣有支撐；連前日收盤都破 → 跳空的上漲被否定；開盤後不回頭 → 偏強勢趨勢日，不要硬等回補。", dur: 2600 },
    { cap: "整理：<b>盤前列位置 → 數重疊 → 到價看確認 → 停損放整個區域外 → 目標看反方向最近的位置 → 先算 R 再決定做不做。</b>" }
  ];

  function draw(svg, i, t) {
    const e = ease(t); let s = "";
    if (i === 0) s = ladder({ show: (l, k) => seg(t, k * 0.1, k * 0.1 + 0.3) }) + ann("盤前的位置清單（虛構數字）");
    else if (i === 1) {
      const y1 = Y(28040), y2 = Y(28150);
      s = ladder({ show: (l) => (["close", "open", "gap50"].includes(l.id) ? 1 : 0.18), hot: ["close", "open", "gap50"] }) + `<rect x="150" y="${y2}" width="460" height="${y1 - y2}" class="f-hl" opacity="${0.12 * seg(t, 0.2, 0.8)}"/>` + ann("開盤缺口：前日收盤、今日開盤、50%");
    } else if (i === 2 || i === 3) {
      s = ladder({ show: (l) => (["imb", "big", "vwap", "gap50"].includes(l.id) ? 1 : 0.25), hot: ["imb", "big", "vwap", "gap50"], extra: `<rect x="146" y="${Y(28100) - 4}" width="468" height="${Y(28072) - Y(28100) + 8}" rx="6" class="f-none s-hl" stroke-width="3" opacity="${seg(t, 0.2, 0.7)}"/><text x="${380}" y="${Y(28100) - 12}" class="t-hl t-b" opacity="${seg(t, 0.4, 1)}">4 個位置重疊</text>` }) + ann(i === 2 ? "重疊越多，反應通常越明顯" : "價格回到重疊區，怎麼做？");
    } else if (i === 4) {
      const a = seg(t, 0.15, 0.7);
      s = ladder({ show: (l) => (["imb", "big", "vwap", "gap50"].includes(l.id) ? 1 : 0.2) }) + `<g opacity="${a}"><circle cx="570" cy="${Y(ENTRY)}" r="5" class="f-hl"/><text x="560" y="${Y(ENTRY) - 8}" text-anchor="end" class="t-ink t-b">進場 28,095</text>` +
        `<line x1="400" x2="610" y1="${Y(STOP_OUT)}" y2="${Y(STOP_OUT)}" class="s-sell" stroke-width="3"/><text x="396" y="${Y(STOP_OUT) + 14}" text-anchor="end" class="t-sell t-b">停損 28,068（區域外）</text>` +
        `<line x1="400" x2="610" y1="${Y(STOP_IN)}" y2="${Y(STOP_IN)}" class="s-line" stroke-width="2" stroke-dasharray="5 4"/><text x="396" y="${Y(STOP_IN) - 4}" text-anchor="end" class="t-mute">28,085（區域內，容易被洗掉）</text></g>` + ann("停損放整個重疊區的外面");
    } else if (i === 5 || i === 6) {
      const tg = i === 5 ? TGT1 : TGT2, a = seg(t, 0.15, 0.8), risk = ENTRY - STOP_OUT, rew = tg - ENTRY;
      s = ladder({ show: (l) => (["imb", "big", "vwap", "gap50", i === 5 ? "open" : "vah"].includes(l.id) ? 1 : 0.18), hot: [i === 5 ? "open" : "vah"] }) + `<g opacity="${a}">` +
        `<line x1="570" x2="570" y1="${Y(ENTRY)}" y2="${Y(STOP_OUT)}" class="s-sell" stroke-width="6"/><line x1="570" x2="570" y1="${Y(ENTRY)}" y2="${Y(tg)}" class="s-buy" stroke-width="6"/>` +
        `<text x="560" y="${(Y(ENTRY) + Y(STOP_OUT)) / 2 + 4}" text-anchor="end" class="t-sell t-b">風險 ${risk} 點</text><text x="560" y="${(Y(ENTRY) + Y(tg)) / 2}" text-anchor="end" class="t-buy t-b">報酬 ${rew} 點</text>` +
        `<text x="400" y="${Y(ENTRY) + 60}" text-anchor="middle" class="t-ink t-b t-lg">${i === 5 ? "R ＝ 55 ÷ 27 ≈ 2.0" : "R ＝ ？"}</text></g>` + ann(i === 5 ? "目標：反方向最近的位置（今日開盤）" : "目標改成更遠的昨日 VAH");
    } else if (i === 7) s = cards([["回補後守住", "向上跳空 → 回到前日收盤附近守住 → 缺口下緣有支撐"], ["連前日收盤都守不住", "跳空的上漲被否定，缺口下緣支撐失守"], ["缺口不補", "開盤後直接往跳空方向走 → 偏強勢趨勢日，別硬等回補"]], t, { h: 62, gap: 80, y: 40 });
    else s = cards([["盤前列位置", "價值區邊緣、缺口、VWAP、失衡框、大單堆疊"], ["數重疊", "越多個重疊，越值得優先關注"], ["到價看確認", "吸收、Delta 轉向，不是碰到就進"], ["停損與目標", "停損放整個區域外，目標看反方向最近的位置，先算 R"]], t, { h: 56, gap: 70, y: 30 });
    svg.innerHTML = s;
  }

  /* ---------- 你來操作：調整停損與目標，看 R 怎麼變 ---------- */
  const simHTML = `<div class="controls"><div class="ctl"><label>停損價 <b class="ex-sv"></b></label><input class="ex-s" type="range" min="28040" max="28092" step="1" value="28085"></div></div>
<div class="btn-row ex-tg"><button class="btn" data-t="28150" type="button" aria-pressed="true">目標：今日開盤 28,150</button><button class="btn" data-t="28210" type="button" aria-pressed="false">目標：昨日 VAH 28,210</button></div>
<svg class="fpx ex-svg" viewBox="0 0 640 380" role="img" aria-label="停損與目標"></svg><p class="sim-msg ex-msg" aria-live="polite"></p><ul class="sim-task ex-task"></ul>`;
  function simMount(box) {
    const q = (s) => box.querySelector(s); let tg = TGT1; const done = {};
    function paint() {
      const st = +q(".ex-s").value, risk = ENTRY - st, rew = tg - ENTRY, R = rew / risk, be = 1 / (1 + R), outside = st < 28072;
      q(".ex-sv").textContent = f0(st);
      box.querySelectorAll(".ex-tg .btn").forEach((b) => b.setAttribute("aria-pressed", String(+b.dataset.t === tg)));
      q(".ex-svg").innerHTML = ladder({ show: (l) => (["imb", "big", "vwap", "gap50", tg === TGT1 ? "open" : "vah"].includes(l.id) ? 1 : 0.18) }) +
        `<line x1="400" x2="610" y1="${Y(st)}" y2="${Y(st)}" class="${outside ? "s-sell" : "s-line"}" stroke-width="3" ${outside ? "" : 'stroke-dasharray="5 4"'}/><text x="396" y="${Y(st) + 14}" text-anchor="end" class="${outside ? "t-sell t-b" : "t-mute"}">停損 ${f0(st)}</text>` +
        `<circle cx="570" cy="${Y(ENTRY)}" r="5" class="f-hl"/><line x1="570" x2="570" y1="${Y(ENTRY)}" y2="${Y(tg)}" class="s-buy" stroke-width="5"/>`;
      q(".ex-msg").innerHTML = `風險 <b>${risk}</b> 點、報酬 <b>${rew}</b> 點 → R ＝ <b>${R.toFixed(1)}</b>；損益兩平勝率約 <b>${Math.round(be * 100)}%</b>。每口風險：NQ 約 $${f0(risk * 20)}、MNQ 約 $${f0(risk * 2)}。<br>${outside ? "停損在整個重疊區的外面，被打到代表位置真的失守。" : "停損還在重疊區裡面，價格晃一下就可能被洗掉，但位置其實還沒失守。"}`;
      if (outside) done.a = true;
      if (outside && R >= 2) done.b = true;
      if (outside && tg === TGT2) done.c = true;
      q(".ex-task").innerHTML = [["a", "任務 1：把停損拉到重疊區（28,072）的下面"], ["b", "任務 2：停損在區域外，同時讓 R 大於等於 2"], ["c", "任務 3：把目標改成昨日 VAH，看 R 和損益兩平勝率怎麼變"]].map(([k, tx]) => `<li class="${done[k] ? "ok" : ""}">${done[k] ? "✓" : "○"} ${tx}</li>`).join("");
    }
    q(".ex-s").addEventListener("input", paint);
    box.addEventListener("click", (e) => { const b = e.target.closest(".ex-tg .btn"); if (b) { tg = +b.dataset.t; paint(); } });
    paint();
  }

  const QS = [
    { fig: `<p class="small q-cap">盤前標出：昨日 VAL 28,020、今日開盤 28,150、昨日 VAH 28,210；另外在 28,075～28,100 同時有 VWAP、失衡框、缺口 50%。</p>`, q: "盤中價格回到 28,075～28,100，比較應該怎麼看？", step: 3, o: [
      ["3 個位置重疊，列為優先位置，到價後看訂單流確認再決定", true, "重疊越多越值得關注，但還是要等吸收、Delta 轉向之類的確認，不是碰到就進。"],
      ["只有單一位置才可靠，重疊反而雜", false, "相反，好幾個位置落在同一區，代表很多人在意這裡，通常反應更明顯。"],
      ["先不看，等價格到 28,210 再說", false, "28,210 離現價很遠，眼前的重疊價區才是優先位置。"]] },
    { fig: `<p class="small q-cap">做多，進場 28,095，停損 28,068，目標 28,140。</p>`, q: "風險報酬比大約多少？", step: 6, o: [
      ["約 1.7", true, "風險 27 點；報酬 28,140 − 28,095 ＝ 45 點；45 ÷ 27 ≈ 1.7。"],
      ["約 2.5", false, "報酬是 45 點，不是 68 點。"],
      ["約 0.6", false, "算反了：R 是報酬 ÷ 風險，不是風險 ÷ 報酬。"]] },
    { fig: `<p class="small q-cap">向上跳空 110 點。開盤後價格往下回補，跌破前日收盤 28,040，之後一直待在它的下面。</p>`, q: "這代表什麼？", step: 8, o: [
      ["跳空的上漲被否定，缺口下緣的支撐失守", true, "向上跳空後，連前日收盤都守不住，就表示夜盤的上漲沒有被日盤接受。"],
      ["缺口不補，偏強勢趨勢日", false, "缺口不補是價格開盤後直接往上走，這裡是往下破了前日收盤。"],
      ["只是雜訊，沒意義", false, "前日收盤是缺口的一端，跌破並待在下面是很重要的訊號。"]] }
  ];

  PAGES["of-exit"] = window.KIT.page(window.COURSE.OFC, "of-exit", {
    topic: "位置與出場",
    lede: "前面學了很多「位置」（價值區邊緣、VWAP、失衡框、缺口）和「確認」。這一關把它們串起來：盤前怎麼列、重疊怎麼數、停損放在哪、目標看哪裡，還有怎麼用 R 決定這筆單值不值得做。",
    analogy: [
      ["出門前看地圖", "你不會出了門才開始找路。位置要<b>盤前</b>就畫好。"],
      ["幾個朋友都推薦同一家店", "只有一個人推薦可能是口味問題；<b>好幾個人</b>都推薦同一家，才更值得去看看。這就是位置重疊。"],
      ["過河的橋", "站在橋上晃動沒關係；<b>整座橋被沖斷</b>才該離開。停損放在整個區域外面。"]],
    steps: STEPS, draw, simHTML, simMount,
    simIntro: "進場固定在 28,095。拉動停損、切換目標，看風險、報酬、R 和損益兩平勝率怎麼變。",
    mist: [
      ["位置一碰到就進場", "位置只告訴你去哪裡看。到了才看吸收、Delta 轉向等確認，沒有確認就不進。"],
      ["停損放在區域中間比較省錢", "放在區域裡面，雜訊就能把你洗掉。穿過整個區域才代表判斷錯，所以放在外面，再用口數控制風險。"],
      ["目標越遠越好", "目標越遠，R 看起來越漂亮，但中途被擋回的機會也越大。通常看反方向最近的位置。"],
      ["R 高就一定要做", "R 只是其中一個條件。要有位置、有確認，還要符合你的風險上限，才值得做。"]],
    faq: [
      ["RTH 缺口怎麼算？", "前一日 RTH 收盤價，和今日 RTH 開盤價之間的差距。美國指數期貨 RTH 是美東時間 09:30～16:00，換成台灣時間在冬令約 22:30～05:00。"],
      ["為什麼要看缺口的 50%？", "50% 是缺口的中點，是常見的反應位置之一，但不是每次都有效。要和其他位置重疊時才更值得注意。"],
      ["重疊要幾個才算強？", "沒有標準答案。一般來說 2 個算較強、3 個以上很強，但最好用你自己的紀錄檢驗：記錄每筆單的重疊數和結果。"],
      ["目標一定要選最近的位置嗎？", "不一定。最近的位置是最可能有人出來擋的地方，所以常被當作第一個目標。你也可以分批：一部分在最近位置出場，剩下的看更遠的。這需要自己用重播驗證。"],
      ["R 要大於多少才做？", "沒有固定答案，要看你的勝率。損益兩平勝率 ＝ 1 ÷ (1 ＋ R)：R ＝ 2 時約 33%，R ＝ 1 時 50%。風險管理那一關有完整的算法。"],
      ["缺口不補怎麼辦？", "開盤後直接往跳空方向走、不回頭，代表當天偏強勢。這時不要硬等回補，改看其他位置（例如 VWAP、失衡框）的回測。"]],
    qs: QS,
    gloss: [
      ["位置", "事先標在圖上、市場參與者特別在意的價格或價區。"],
      ["重疊", "好幾個位置落在同一個價區，通常反應更明顯。"],
      ["RTH 缺口", "前日 RTH 收盤到今日 RTH 開盤的差距。"],
      ["缺口 50%", "缺口的中點，常見的反應位置之一。"],
      ["R", "報酬 ÷ 風險。風險是進場到停損的距離，報酬是進場到目標的距離。"],
      ["損益兩平勝率", "1 ÷ (1 ＋ R)。勝率超過它，長期才賺錢（還要扣成本）。"]],
    remember: "<b>盤前列位置、數重疊；到價看確認；停損放整個區域外，目標看反方向最近的位置，先算 R 再決定做不做。</b>"
  });
})();
