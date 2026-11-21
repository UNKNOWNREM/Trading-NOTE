/* 路線 1 第 15 關（新）：交易心理與紀律 */
(function () {
  const PAGES = (window.__PAGES = window.__PAGES || {});
  const { chip, lerp, ease, seg, cards } = window.KIT;

  function equity(pts, o = {}) {
    const X = (k) => lerp(80, 600, k / (pts.length - 1)), lo = Math.min(...pts, -8), hi = Math.max(...pts, 6);
    const Y = (v) => lerp(330, 60, (v - lo) / (hi - lo)), n = o.upto == null ? pts.length : o.upto;
    let s = `<line x1="80" x2="600" y1="${Y(0)}" y2="${Y(0)}" class="s-ink"/><text x="72" y="${Y(0) + 4}" text-anchor="end" class="t-mute">0R</text>`;
    s += `<polyline points="${pts.slice(0, n).map((v, k) => `${X(k)},${Y(v)}`).join(" ")}" class="${o.cls || "s-ink"} f-none" stroke-width="2.5"/>`;
    return { s, X, Y };
  }

  const STEPS = [
    { cap: "前面學的都是「知道」。這一關講「<b>做到</b>」：很多人知道要設停損、知道不能追價，真的在盤中卻做不到。",
      why: "交易最難的部分常常不是看圖，而是在虧錢、錯過、連輸的時候，還照著事先寫好的規則做。這一關介紹最常見的幾個心理陷阱，以及用規則擋住它們的方法。", stuck: "就像減肥：大家都知道要少吃多動，難的是每天做到。" },
    { cap: "陷阱一：<b>報復性交易</b>。虧了一筆之後，急著想賺回來，加大口數、降低標準，結果越虧越多。",
      why: "虧損會讓人想立刻「扳回一城」。這時候下的單通常沒有劇本、沒有確認，口數還比平常大。一筆正常的 −1R，很容易變成一天 −5R 以上。", dur: 2600 },
    { cap: "陷阱二：<b>移動停損</b>。價格快碰到停損了，捨不得認賠，把停損往外拉。原本 −1R 的虧損變成 −3R。",
      why: "停損是在冷靜時、根據「想法錯了的地方」決定的。盤中把它往外拉，是在情緒最差的時候推翻冷靜時的判斷。停損只能往有利的方向移（例如移到進場價保本），不能往外拉。", dur: 2600 },
    { cap: "陷阱三：<b>錯過恐懼（FOMO）</b>。看到價格一路衝，怕錯過，沒有位置、沒有確認就追進去，常常買在短線高點。",
      why: "錯過一個機會，損失是 0；追錯一筆，損失是 −1R 以上。第 12 關的規則「錯過不追」，就是用來擋這個陷阱。", dur: 2400 },
    { cap: "陷阱四：<b>賭徒謬誤</b>。連輸了 5 筆，覺得「下一筆總該贏了吧」，於是加大口數。",
      why: "每一筆交易的結果彼此獨立，前面輸幾筆，不會讓下一筆比較容易贏。這跟擲硬幣一樣：連擲 5 次反面，下一次還是 50%。",
      q: { t: "連輸 5 筆之後，下一筆贏的機率會怎麼樣？", o: [
        ["變高，因為該輪到贏了", false, "這就是賭徒謬誤。每一筆的結果互相獨立，前面的輸贏不會改變下一筆的機率。"],
        ["跟平常一樣，前面的結果不影響下一筆", true, "勝率不會因為連輸而變高。所以連輸之後更不該加大口數。"],
        ["變低，所以應該停止交易", false, "機率不會變低。但連輸之後先停下來檢查有沒有照規則做，是好習慣。"]] } },
    { cap: "練習一下：你今天連虧 3 筆，心裡想著「下一筆口數加倍，一次賺回來」。",
      q: { t: "這是哪一種陷阱？", o: [
        ["錯過恐懼（FOMO）", false, "FOMO 是怕錯過行情而追價。這裡是虧損後想賺回來。"],
        ["報復性交易", true, "虧損後急著扳回、加大口數，就是報復性交易。這正是每日最大虧損規則要擋的情況。"],
        ["移動停損", false, "移動停損是把停損往外拉。這裡是想加大下一筆的口數。"]] } },
    { cap: "防線一：<b>每日最大虧損</b>。今天虧到事先設定的 R 數（例如 3R），就關掉平台，今天結束。",
      why: "這條規則的目的是：在你最容易做出錯誤決定的時候，直接把你移出市場。它不靠意志力，靠的是事先寫好的規則。有些平台可以設定每日虧損上限，到了自動不能下單。", dur: 2400 },
    { cap: "防線二：<b>進場前檢查清單</b>。位置、確認數、停損、口數、事件，五項都打勾才能下單，少一項就不做。",
      why: "清單把「感覺」變成「是或否」。情緒上來時，清單會幫你停下來。第 14 關下單前那四個 ✓，就是清單的一部分。" },
    { cap: "防線三：<b>交易日誌加上情緒欄</b>，每週檢討一次。除了記結果，也記下進場時的心情：無聊、急躁、想扳回、很有把握……",
      why: "一週後回頭看，常會發現虧最多的幾筆，都發生在同一種情緒下。找到規律，才知道要在什麼時候特別小心。" },
    { cap: "評一筆交易，要分開看<b>流程</b>和<b>結果</b>。最危險的是右下角：<b>壞流程、好結果</b>，它會讓你以為下次也可以這樣做。",
      why: "好流程壞結果：運氣不好，照常繼續。壞流程好結果：運氣好，但這個習慣遲早會讓你大虧。好流程好結果：繼續。壞流程壞結果：最容易學到教訓。", dur: 2600 },
    { cap: "練習一下：你這筆沒等確認就追價，也沒放停損，結果剛好賺了 2R。",
      q: { t: "這筆應該怎麼評？", o: [
        ["好交易，賺錢就是對的", false, "結果好不代表流程好。這次運氣好，下次同樣的做法可能就是大虧。"],
        ["壞流程、好結果，最危險，要在日誌裡標記出來", true, "沒等確認、沒放停損，流程不及格。賺錢反而會強化這個壞習慣，所以要特別標記、檢討。"],
        ["好流程、好結果", false, "流程有兩個大問題：沒等確認、沒放停損。"]] } },
    { cap: "最後一道關：<b>模擬交易期</b>。用模擬帳戶照流程做滿 30 筆，每筆都寫日誌、打流程分數。流程分數達標，才考慮用真錢、而且從最小的合約開始。",
      why: "這是這套流程的檢核條件。30 筆是為了累積足夠的練習，不是為了證明方法有效（要證明有效需要更多樣本）。評分看流程，不看賺賠。", dur: 2400 },
    { cap: "整理：四個陷阱（報復、移動停損、FOMO、賭徒謬誤），三道防線（每日最大虧損、檢查清單、日誌與檢討）。<b>評流程，不評結果。</b>",
      why: "路線 1 到這裡全部結束。接下來的路線 2 會學選擇權和造市商的對沖，用來畫出「在哪裡等」的另一張地圖。" }
  ];

  function draw(svg, i, t) {
    const e = ease(t); let s = "";
    if (i === 0) {
      s += `<g opacity="${seg(t, 0, 0.4)}"><rect x="80" y="100" width="210" height="160" rx="14" class="f-buy-soft"/><text x="185" y="150" text-anchor="middle" class="t-ink t-b t-xl">知道</text><text x="185" y="190" text-anchor="middle" class="t-mute">停損、位置、確認</text><text x="185" y="214" text-anchor="middle" class="t-mute">前面 14 關</text></g>`;
      s += `<g opacity="${seg(t, 0.4, 0.8)}"><path d="M300 180 L340 180" class="s-ink" stroke-width="3"/><path d="M340 180 l-10 -6 v12 z" class="f-inkd"/><rect x="350" y="100" width="210" height="160" rx="14" class="f-gamma-soft"/><text x="455" y="150" text-anchor="middle" class="t-ink t-b t-xl">做到</text><text x="455" y="190" text-anchor="middle" class="t-mute">虧錢、錯過、連輸時</text><text x="455" y="214" text-anchor="middle" class="t-mute">還照規則做</text></g>`;
    } else if (i === 1) {
      const g = equity([0, -1, -2.5, -5, -9, -14], { upto: Math.max(2, Math.ceil(seg(t, 0, 0.9) * 6)), cls: "s-sell" });
      s += g.s; const L = ["", "−1R（正常）", "口數加倍", "再加倍", "失控", ""];
      L.forEach((l, k) => { if (l && k < Math.ceil(seg(t, 0, 0.9) * 6)) s += `<text x="${g.X(k) + 8}" y="${g.Y([0, -1, -2.5, -5, -9, -14][k]) + 18}" class="t-sell t-b">${l}</text>`; });
    } else if (i === 2) {
      const Y = (p) => lerp(330, 60, (p - 26930) / 90);
      s += `<line x1="80" x2="600" y1="${Y(27000)}" y2="${Y(27000)}" class="s-ink"/><text x="86" y="${Y(27000) - 8}" class="t-ink t-b">進場 27,000</text>`;
      s += `<line x1="80" x2="600" y1="${Y(26980)}" y2="${Y(26980)}" class="s-sell" stroke-width="2" stroke-dasharray="6 4" opacity="${1 - seg(t, 0.3, 0.6) * 0.7}"/><text x="596" y="${Y(26980) - 6}" text-anchor="end" class="t-sell t-b">原本的停損（−1R）</text>`;
      const ny = lerp(26980, 26940, seg(t, 0.3, 0.6));
      s += `<line x1="80" x2="600" y1="${Y(ny)}" y2="${Y(ny)}" class="s-sell" stroke-width="2.5"/><text x="596" y="${Y(ny) + 18}" text-anchor="end" class="t-sell t-b">${t > 0.6 ? "被拉遠的停損（−3R）" : "往外拉……"}</text>`;
      const P = [[100, 27000], [180, 26992], [250, 26985], [300, 26982], [360, 26975], [430, 26962], [500, 26948], [560, 26941]];
      const n = Math.max(2, Math.ceil(seg(t, 0.2, 0.95) * P.length));
      s += `<polyline points="${P.slice(0, n).map((q) => `${q[0]},${Y(q[1])}`).join(" ")}" class="s-ink f-none" stroke-width="2.5"/>`;
    } else if (i === 3) {
      const Y = (p) => lerp(330, 60, (p - 40) / 30);
      const P = [[80, 45], [140, 47], [200, 46], [260, 52], [310, 58], [350, 64], [380, 67], [420, 62], [470, 57], [530, 55]];
      const n = Math.max(2, Math.ceil(seg(t, 0, 0.9) * P.length));
      s += `<polyline points="${P.slice(0, n).map((q) => `${q[0]},${Y(q[1])}`).join(" ")}" class="s-ink f-none" stroke-width="2.5"/>`;
      if (n > 6) s += `<circle cx="380" cy="${Y(67)}" r="9" class="f-sell"/>` + chip(380, Y(67) - 30, "怕錯過，追進去", "sell");
      if (n > 8) s += `<text x="470" y="${Y(57) + 30}" class="t-sell t-b">買在短線高點</text>`;
    } else if (i === 4) {
      [0, 1, 2, 3, 4].forEach((k) => { s += `<circle cx="${120 + k * 80}" cy="150" r="30" class="f-sell" opacity="${seg(t, k * 0.1, k * 0.1 + 0.2)}"/><text x="${120 + k * 80}" y="156" text-anchor="middle" class="t-w t-b">反</text>`; });
      s += `<g opacity="${seg(t, 0.6, 1)}"><circle cx="520" cy="150" r="30" class="f-none s-ink" stroke-width="2.5" stroke-dasharray="4 4"/><text x="520" y="157" text-anchor="middle" class="t-ink t-b t-lg">？</text><text x="320" y="240" text-anchor="middle" class="t-ink t-b t-lg">連擲 5 次反面，下一次是正面的機率？</text></g>`;
    } else if (i === 5) {
      [0, 1, 2].forEach((k) => { s += `<rect x="${130 + k * 80}" y="120" width="64" height="64" rx="8" class="f-sell"/><text x="${162 + k * 80}" y="158" text-anchor="middle" class="t-w t-b">−1R</text>`; });
      s += chip(470, 152, "下一筆口數加倍！", "sell") + `<text x="130" y="250" class="t-ink t-b t-lg">這是哪一種陷阱？</text>`;
    } else if (i === 6) {
      const pts = [0, 1.5, 0.5, -0.5, -1.5, -3];
      const g = equity(pts, { upto: Math.max(2, Math.ceil(seg(t, 0, 0.7) * pts.length)) });
      s += g.s + `<line x1="80" x2="600" y1="${g.Y(-3)}" y2="${g.Y(-3)}" class="s-sell" stroke-width="2.5" stroke-dasharray="6 4"/><text x="596" y="${g.Y(-3) + 18}" text-anchor="end" class="t-sell t-b">每日最大虧損 −3R</text>`;
      if (t > 0.75) s += `<rect x="360" y="70" width="230" height="56" rx="10" class="f-sell"/><text x="475" y="104" text-anchor="middle" class="t-w t-b t-lg">今天結束，關平台</text>`;
    } else if (i === 7) {
      const C = ["在盤前標好的關鍵價位", "至少 2～3 個確認", "停損放在想法錯了的地方", "口數已經算好（≤ 1%）", "不在事件時段"];
      C.forEach((c, k) => { const on = t > (k + 1) * 0.16; s += `<g><rect x="120" y="${50 + k * 56}" width="400" height="44" rx="8" class="f-surface s-line"/><rect x="136" y="${62 + k * 56}" width="20" height="20" rx="4" class="${on ? "f-hl" : "f-none s-ink"}"/>${on ? `<text x="146" y="${77 + k * 56}" text-anchor="middle" class="t-w t-b">✓</text>` : ""}<text x="170" y="${78 + k * 56}" class="t-ink">${c}</text></g>`; });
      s += `<text x="120" y="350" class="t-gamma t-b" opacity="${seg(t, 0.85, 1)}">五項都勾，才能下單</text>`;
    } else if (i === 8) {
      const H = ["日期", "結果", "照計畫？", "進場時的心情"], R = [["11/12", "−1R", "✓", "平靜"], ["11/13", "−2.5R", "✗", "想扳回"], ["11/14", "+2R", "✓", "平靜"], ["11/15", "−3R", "✗", "想扳回"]];
      const CX = [80, 190, 300, 420];
      s += H.map((h, k) => `<text x="${CX[k]}" y="70" class="t-mute t-b">${h}</text>`).join("");
      R.forEach((r, j) => { s += `<g opacity="${seg(t, j * 0.15, j * 0.15 + 0.25)}">${r.map((c, k) => `<text x="${CX[k]}" y="${108 + j * 40}" class="${k === 1 ? (c.startsWith("+") ? "t-buy t-b" : "t-sell t-b") : k === 3 && c === "想扳回" ? "t-sell t-b" : "t-ink"}">${c}</text>`).join("")}</g>`; });
      s += `<g opacity="${seg(t, 0.7, 1)}"><rect x="70" y="276" width="500" height="50" rx="10" class="f-gamma-soft"/><text x="88" y="306" class="t-ink t-b">檢討：虧最多的兩筆，都是「想扳回」的時候</text></g>`;
      s += `<text x="80" y="40" class="t-mute">（示意的日誌）</text>`;
    } else if (i === 9 || i === 10) {
      const Q = [["好流程、好結果", "繼續", "f-gamma-soft"], ["好流程、壞結果", "運氣不好，照常繼續", "f-gamma-soft"], ["壞流程、壞結果", "學到教訓", "f-sell-soft"], ["壞流程、好結果", "最危險！", "f-sell"]];
      Q.forEach((q, k) => { const x = 110 + (k % 2) * 220, y = 70 + Math.floor(k / 2) * 130; s += `<g opacity="${i === 10 ? 1 : seg(t, k * 0.15, k * 0.15 + 0.3)}"><rect x="${x}" y="${y}" width="200" height="110" rx="12" class="${q[2]}"/><text x="${x + 100}" y="${y + 48}" text-anchor="middle" class="${k === 3 ? "t-w" : "t-ink"} t-b t-lg">${q[0]}</text><text x="${x + 100}" y="${y + 78}" text-anchor="middle" class="${k === 3 ? "t-w t-b" : "t-mute"}">${q[1]}</text></g>`; });
      s += `<text x="100" y="50" class="t-mute">流程好不好 × 結果好不好</text>`;
      if (i === 10) s += chip(330, 340, "沒等確認、沒停損，卻賺了 2R", "hl");
    } else if (i === 11) {
      const X = (k) => lerp(80, 580, k / 30);
      for (let k = 0; k < 30; k++) { const on = k < Math.round(seg(t, 0, 0.8) * 30); s += `<rect x="${X(k)}" y="150" width="13" height="40" rx="3" class="${on ? "f-buy" : "g-cell"}"/>`; }
      s += `<text x="80" y="130" class="t-ink t-b">模擬帳戶：30 筆，每筆寫日誌、打流程分數</text><text x="80" y="240" class="t-gamma t-b t-lg" opacity="${seg(t, 0.8, 1)}">流程分數達標 → 才考慮用真錢，從最小合約開始</text>`;
    } else if (i === 12) {
      s += cards([["報復性交易", "虧損後加大口數想賺回來"], ["移動停損", "把停損往外拉，−1R 變 −3R"], ["FOMO 與賭徒謬誤", "怕錯過而追價；以為連輸後該贏了"], ["三道防線", "每日最大虧損、檢查清單、日誌與檢討"], ["評流程", "壞流程好結果最危險"]], t, { hl: 4 });
    }
    svg.innerHTML = s;
  }

  /* ---------- 你來操作：今天的紀律儀表板 ---------- */
  const CHK = ["在盤前標好的關鍵價位", "至少 2～3 個確認", "停損放在想法錯了的地方", "口數已經算好（≤ 1%）", "不在事件時段"];
  const simHTML = `<div class="ps-grid"><div><h4>進場前檢查清單</h4><div class="ps-chk">${CHK.map((c, k) => `<label><input type="checkbox" data-c="${k}"> ${c}</label>`).join("")}</div><p class="ps-go"></p></div>
<div><h4>今天的結果</h4><p class="small">每日最大虧損：<select class="ps-max"><option value="2">2R</option><option value="3" selected>3R</option></select></p><div class="ps-r"></div>
<div class="btn-row"><button class="btn primary" data-t="2" type="button">這筆 +2R</button><button class="btn sell" data-t="-1" type="button">這筆 −1R</button><button class="btn" data-t="0" type="button">重新開始一天</button></div></div></div>
<p class="sim-msg ps-msg" aria-live="polite"></p><ul class="sim-task ps-task"></ul>`;
  function simMount(box) {
    const q = (s) => box.querySelector(s); let trades = [], lock = false; const done = {};
    function paint(msg) {
      const ok = [...box.querySelectorAll(".ps-chk input")].filter((x) => x.checked).length, all = ok === CHK.length;
      q(".ps-go").innerHTML = lock ? `<b class="neg">今天已經停止交易</b>` : all ? `<b class="pos">五項都勾了：可以下單</b>` : `<b>還差 ${CHK.length - ok} 項：不能下單</b>`;
      const sum = trades.reduce((a, b) => a + b, 0), mx = +q(".ps-max").value;
      q(".ps-r").innerHTML = `<p>今天 <b class="${sum >= 0 ? "pos" : "neg"}">${sum > 0 ? "+" : ""}${sum}R</b>（${trades.length} 筆）</p><p class="ps-bar">${trades.map((v) => `<span class="${v > 0 ? "w" : "l"}">${v > 0 ? "+" + v : v}</span>`).join("")}</p>`;
      box.querySelectorAll("[data-t]").forEach((b) => { if (b.dataset.t !== "0") b.disabled = lock || !all; });
      if (msg) q(".ps-msg").innerHTML = msg;
      q(".ps-task").innerHTML = [["a", "任務 1：五項都勾，才能按下單"], ["b", "任務 2：連續虧損，碰到每日最大虧損，看平台被鎖住"], ["c", "任務 3：被鎖住之後，按「重新開始一天」，從頭再來"]].map(([k, tx]) => `<li class="${done[k] ? "ok" : ""}">${done[k] ? "✓" : "○"} ${tx}</li>`).join("");
    }
    box.addEventListener("change", () => paint());
    box.addEventListener("click", (e) => {
      const b = e.target.closest("[data-t]"); if (!b) return;
      const v = +b.dataset.t;
      if (v === 0) { if (lock) done.c = true; trades = []; lock = false; box.querySelectorAll(".ps-chk input").forEach((x) => (x.checked = false)); paint("新的一天。每一筆下單前，都要重新勾一次清單。"); return; }
      done.a = true; trades.push(v);
      const sum = trades.reduce((a, c) => a + c, 0), mx = +q(".ps-max").value;
      box.querySelectorAll(".ps-chk input").forEach((x) => (x.checked = false));
      if (sum <= -mx) { lock = true; done.b = true; paint(`今天虧到 ${sum}R，碰到每日最大虧損 −${mx}R。<b>平台鎖住，今天結束。</b>這時候最想做的，往往就是報復性交易。`); return; }
      paint(v > 0 ? "賺了一筆。下一筆一樣要重新勾清單，不要因為賺錢就放鬆。" : `虧了一筆，今天 ${sum}R。照常等待下一個符合劇本的機會，不加大口數。`);
    });
    paint("先勾檢查清單，五項都勾了才能下單。");
  }

  const QS = [
    { fig: `<p class="small q-cap">價格離你的停損只剩 2 點，你覺得「應該快反彈了」，想把停損往外移 10 點。</p>`, q: "這是哪一種陷阱？正確做法是？", step: 3, o: [
      ["移動停損；停損不能往外拉，照原計畫出場", true, "停損是冷靜時根據「想法錯了的地方」決定的。盤中往外拉，只會讓虧損變大。"],
      ["這是好的風險管理，給交易多一點空間", false, "空間應該在進場前就決定好。進場後往外拉，是在情緒最差的時候推翻計畫。"],
      ["FOMO，應該加碼", false, "這不是 FOMO，而且加碼只會讓虧損更大。"]] },
    { fig: `<p class="small q-cap">每日最大虧損設 3R。今天已經虧了 3R，但你看到一個「很漂亮」的機會。</p>`, q: "應該怎麼做？", step: 7, o: [
      ["這個機會太好了，做最後一筆", false, "規則就是為了這種時候存在的。虧了 3R 之後的判斷，往往比平常差。"],
      ["今天結束，關平台；把這個機會記在日誌裡，盤後再看", true, "碰到每日最大虧損就停止。如果那個機會真的很好，盤後回頭檢查，也是很好的學習。"],
      ["口數減半再做", false, "減半還是在違反規則。今天的上限已經到了。"]] },
    { fig: `<p class="small q-cap">這週 5 筆交易：3 筆照計畫（2 賺 1 賠），2 筆沒照計畫（都賺錢）。</p>`, q: "這週的檢討重點應該是？", step: 11, o: [
      ["沒照計畫的 2 筆都賺錢，代表規則太嚴，可以放寬", false, "這 2 筆是「壞流程、好結果」，最危險。賺錢不代表做法是對的。"],
      ["標記那 2 筆壞流程好結果，找出為什麼沒照計畫，下週避免", true, "評流程，不評結果。找出沒照計畫的原因（心情、時段、FOMO），才能改進。"],
      ["這週賺錢，不用檢討", false, "賺錢的週一樣要檢討。尤其要看有沒有靠運氣賺到的壞流程交易。"]] }
  ];

  PAGES["of-psy"] = window.KIT.page(window.COURSE.OFC, "of-psy", {
    topic: "交易心理",
    lede: "前面學的都是「知道」，這一關講「做到」。很多人知道要設停損、不能追價，真的在盤中卻做不到。這一關介紹四個最常見的心理陷阱，以及三道用規則擋住它們的防線。",
    analogy: [
      ["減肥", "大家都知道要少吃多動，難的是每天做到。交易規則也一樣，<b>知道不等於做到</b>。"],
      ["擲硬幣", "連擲 5 次反面，下一次正面的機率還是一半。以為「該輪到我贏了」，就是<b>賭徒謬誤</b>。"],
      ["開車的速限", "不是靠當下的感覺決定開多快，而是事先訂好規則。<b>每日最大虧損</b>就是交易的速限。"]],
    steps: STEPS, draw, simHTML, simMount,
    simIntro: "左邊是進場前檢查清單，五項都勾才能下單；右邊記錄今天的結果，碰到每日最大虧損就會被鎖住。",
    mist: [
      ["意志力夠強就不會犯錯", "情緒上來時，意志力常常靠不住。要靠事先寫好的規則和工具（檢查清單、每日上限、平台設定）擋住自己。"],
      ["停損快到了，往外移一點沒關係", "停損只能往有利的方向移（例如移到進場價保本），不能往外拉。"],
      ["賺錢的交易不用檢討", "壞流程、好結果最危險，因為它會強化壞習慣。賺錢的交易一樣要評流程。"]],
    faq: [
      ["每日最大虧損要設多少？", "常見是 2R～3R。重點不是數字，而是事先決定、到了一定停。有些平台可以設定每日虧損上限，到了自動不能下單，比靠自己更可靠。"],
      ["連虧之後要休息多久？", "沒有標準。常見的做法是碰到每日上限就結束當天；連續幾天都碰到上限，就停一兩天、只做檢討和模擬。"],
      ["情緒欄要怎麼寫？", "簡單就好：平靜、無聊、急躁、想扳回、很有把握、害怕錯過。寫下進場前那一刻最強的感覺，一週後再回頭找規律。"],
      ["流程分數怎麼打？", "把檢查清單當評分表：位置、確認、停損、口數、事件，加上「有沒有照計畫出場」，每項 1 分。分數高代表照流程，跟賺賠無關。"],
      ["模擬交易真的有用嗎？", "模擬沒有真錢的壓力，所以不能完全代表實盤。但它能幫你熟悉流程、累積樣本，找出規則本身的問題。轉實盤時從最小的合約開始，就是為了把壓力慢慢加上去。"],
      ["一直做不到規則怎麼辦？", "先把規則變少、變簡單，再用工具幫忙（平台的停損單、每日上限、檢查清單）。也可以減少交易時間，只在狀態最好的時段做。"]],
    qs: QS,
    gloss: [
      ["報復性交易", "虧損後急著賺回來，加大口數、降低標準。"],
      ["移動停損", "把停損往外拉，讓虧損變大。"],
      ["FOMO", "錯過恐懼：怕錯過行情而追價。"],
      ["賭徒謬誤", "以為連輸之後下一筆比較容易贏。"],
      ["每日最大虧損", "當天虧到設定的 R 數就停止交易。"],
      ["流程分數", "評一筆交易有沒有照計畫，不看賺賠。"]],
    remember: "<b>評流程，不評結果。</b>規則要事先寫好、用工具執行：每日最大虧損、檢查清單、日誌與檢討。"
  });
})();
