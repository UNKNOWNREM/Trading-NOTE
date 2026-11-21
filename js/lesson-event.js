/* 路線 1 第 11 關（新）：經濟事件日曆 */
(function () {
  const PAGES = (window.__PAGES = window.__PAGES || {});
  const { chip, lerp, ease, seg, cards } = window.KIT;
  // 資料來源：TradingView 經濟日曆，美國、重要性「高」，2026-11-19 擷取。時間已換成台灣時間（冬令）。
  const CAL = [
    { id: "pce", d: "11/25（三）", t: "21:30", n: "核心 PCE 物價、GDP 第二次估值、耐久財訂單", k: "data" },
    { id: "tg", d: "11/26（四）", t: "全天", n: "美國感恩節：股市休市，隔天提早收盤（期貨時間以 CME 公告為準）", k: "holiday" },
    { id: "ism", d: "12/01（二）", t: "23:00", n: "ISM 製造業 PMI、JOLTS 職缺", k: "data" },
    { id: "isms", d: "12/03（四）", t: "23:00", n: "ISM 服務業 PMI", k: "data" },
    { id: "nfp", d: "12/04（五）", t: "21:30", n: "非農就業、失業率", k: "big" },
    { id: "fomc", d: "12/10（四）", t: "03:00", n: "FOMC 利率決策（03:30 主席記者會）", k: "fomc" },
    { id: "cpi", d: "12/10（四）", t: "21:30", n: "CPI 消費者物價", k: "big" },
    { id: "ppi", d: "12/15（二）", t: "21:30", n: "PPI 生產者物價", k: "data" },
    { id: "rs", d: "12/16（三）", t: "21:30", n: "零售銷售", k: "data" },
    { id: "hs", d: "12/17（四）", t: "21:30", n: "新屋開工、建築許可", k: "data" }
  ];
  const WIN = { big: [15, 30], fomc: [30, 60], data: [10, 15], holiday: null };

  function spike(t, x0 = 70, x1 = 600, y0 = 200) {
    // 公布前平靜 → 公布瞬間上下亂跳 → 之後走出方向
    const P = [0, 0.4, -0.3, 0.2, 0, -0.2, 0.1, 0, 6, -7, 5, -4, -6, -8, -9, -8.5, -10, -11, -10.5, -12];
    const n = Math.max(2, Math.ceil(t * P.length));
    const X = (k) => lerp(x0, x1, k / (P.length - 1)), Y = (v) => y0 - v * 10;
    return { s: `<polyline points="${P.slice(0, n).map((v, k) => `${X(k)},${Y(v)}`).join(" ")}" class="s-ink f-none" stroke-width="2.5"/>`, X, Y, P };
  }

  const STEPS = [
    { cap: "<b>經濟日曆</b>列出接下來每一天會公布哪些經濟數據、幾點公布、有多重要，還有<b>前值</b>、<b>預期</b>和公布後的<b>實際值</b>。",
      why: "常用的免費來源有 TradingView 的經濟日曆、Investing.com、Forex Factory。記得把時區設成台灣時間，並且只看「重要性高」的美國數據就夠了。", stuck: "把它想成考試行事曆：哪天有大考，你要先知道。" },
    { cap: "最會讓 NQ 大動的幾個：<b>CPI</b>（物價）、<b>非農就業</b>、<b>FOMC</b>（聯準會利率決策）、<b>PCE</b>、<b>GDP</b>。另外，大型科技股的<b>財報</b>也會影響 NQ。",
      why: "這些數據會改變市場對利率的預期，利率又直接影響科技股的評價，所以 NQ 反應特別大。NVIDIA、微軟、蘋果這些公司在那斯達克 100 裡權重很高，它們的財報（通常在美股收盤後公布）也會讓 NQ 在盤後大動。" },
    { cap: "公布時間（冬令台灣時間）：大部分數據在<b>晚上 9:30</b>，ISM 這類在<b>晚上 11:00</b>，FOMC 在<b>凌晨 3:00</b>公布、3:30 主席記者會。",
      why: "夏令時間全部提早一小時。FOMC 一年開 8 次會，公布時間在台灣的半夜，很多人選擇那天晚上不留部位。", stuckHref: "#of-sess", stuckLabel: "回第 10 關複習時段換算 →", stuck: "冬令＝美東＋13 小時：8:30 → 21:30，10:00 → 23:00，14:00 → 03:00。" },
    { cap: "公布前幾分鐘：很多人<b>把掛單撤掉</b>，掛單簿變薄、價差變大、成交量變少。市場在「等」。",
      why: "沒人想在數據出來前被成交在錯的價格，所以限價單會先撤。掛單變少，代表一點點市價單就能讓價格跳好幾格。", dur: 2400 },
    { cap: "公布瞬間：價格常常<b>先往一邊衝、再往另一邊衝</b>，兩邊的停損都被掃掉，之後才走出方向。",
      why: "數據一出來，大量市價單同時湧進薄薄的掛單簿，價格會劇烈跳動。這種上下亂掃的走勢，常讓第一時間追進去的人兩邊都被停損。", dur: 2600 },
    { cap: "想一想：你手上有一口多單，停損設在 20 點外。再 2 分鐘 CPI 就要公布了。",
      q: { t: "比較穩健的做法是？", o: [
        ["不用管，停損會保護我", false, "公布瞬間掛單很薄，停損觸發後可能滑價好幾倍（第 1 關學過：停損單觸發後是市價單）。20 點的停損可能變成 40 點。"],
        ["公布前先平倉或減碼，等數據出來再說", true, "不把部位暴露在無法控制的跳動裡。數據出來、市場穩定後，如果還有機會，再重新進場。"],
        ["加碼，賭數據會好", false, "這是在賭數據，不是在交易你的計畫。結果是 50/50，而且可能大幅滑價。"]] } },
    { cap: "停損在事件時可能<b>嚴重滑價</b>：設 20 點，實際可能在 35、40 點外才成交。這是事件交易最大的風險。",
      why: "停損單觸發後會變成市價單，去吃當時的掛單。掛單被撤光的那幾秒，市價單只能一路往下吃。所以不是「有停損就安全」，而是「事件時停損的保護會變差」。", stuckHref: "#of-fut", stuckLabel: "回第 1 關複習停損單和滑價 →", dur: 2400 },
    { cap: "公布後：等<b>第一波亂掃結束</b>，通常至少 5～15 分鐘，看價格在哪裡站穩、有沒有形成新的價值區，再用平常的流程找機會。",
      why: "第一波常常是反應過度，之後可能反轉。等市場消化完，掛單回來，訂單流訊號才恢復參考價值。", dur: 2400 },
    { cap: "市場看的不是數據「好不好」，而是<b>跟預期差多少</b>。公布值剛好等於預期，常常沒什麼反應；比預期差很多，才會大動。",
      why: "預期值已經反映在價格裡了。真正讓價格動的是「意外」。所以同樣是好數據，如果大家預期更好，價格反而可能下跌。" },
    { cap: "練習一下：CPI 公布值剛好和預期一模一樣。",
      q: { t: "最可能發生什麼事？", o: [
        ["一定大漲，因為數據不差", false, "數據和預期一樣，代表沒有意外。價格已經反映了這個預期，通常不會有大反應。"],
        ["反應可能很小，因為沒有意外", true, "市場交易的是「實際和預期的差距」。沒有差距，常常只有短暫的波動。"],
        ["一定大跌，因為沒有驚喜", false, "沒有意外不等於壞消息。通常就是反應不大。"]] } },
    { cap: "事件也會影響選擇權：事件前 <b>IV 升高</b>，公布後 <b>IV 快速下降</b>（IV Crush）。GEX 位階隔天也可能大幅改變。",
      why: "大家在事件前買選擇權避險，把 IV 推高；事件過了，不確定性消失，IV 就掉下來。造市商的部位和對沖也會跟著變，所以事件後一定要重新讀當天的 GEX 位階，不能沿用前一天的。", stuckHref: "#op-4", stuckLabel: "到選擇權路線看 IV 和 IV Crush →", dur: 2400 },
    { cap: "給自己訂規則：<b>每週日</b>看下週日曆，標出重要事件；公布前 15 分鐘不開新倉、有部位先處理；公布後至少等 15 分鐘；FOMC 那晚不留部位。",
      why: "這些數字（15 分鐘、30 分鐘）是常見的做法，不是標準答案。重點是事先寫死，不要臨時決定。下面「你來操作」可以用真實的日曆練習排出避開的時段。" },
    { cap: "這是接下來四週真實的重要事件（TradingView 經濟日曆，2026-11-19 擷取）。注意 <b>12/10</b> 這一天。",
      q: { t: "12/10（四）為什麼要特別小心？", o: [
        ["只是普通的一天", false, "那天凌晨 3:00 有 FOMC，晚上 9:30 又有 CPI，一天裡有兩個最重要的事件。"],
        ["凌晨 3:00 有 FOMC，晚上 9:30 又有 CPI，一天兩個大事件", true, "FOMC 和 CPI 都是最會讓 NQ 大動的事件，排在同一天（台灣時間）。前一晚不留部位，當晚也要等 CPI 消化完再看。"],
        ["那天美股休市", false, "休市的是 11/26 感恩節。12/10 是正常交易日，但有兩個大事件。"]] } },
    { cap: "整理：事件前<b>不開新倉、先處理部位</b>；事件時停損可能<b>嚴重滑價</b>；事件後<b>等 15 分鐘</b>再看；市場交易的是<b>實際和預期的差距</b>。",
      why: "路線 1 的「讀環境」到這裡告一段落。下一關開始學在關鍵價位怎麼用五個確認訊號判斷要不要動手。" }
  ];

  function draw(svg, i, t) {
    const e = ease(t); let s = "";
    if (i === 0) {
      const H = ["時間", "數據", "重要性", "前值", "預期", "實際"], R = [["21:30", "CPI 月增率", "★★★", "0.4%", "0.3%", "？"], ["21:30", "核心 CPI 年增率", "★★★", "2.6%", "2.7%", "？"], ["23:00", "ISM 服務業", "★★☆", "54.5", "—", "？"]];
      const CX = [60, 140, 300, 380, 450, 520];
      s += H.map((h, k) => `<text x="${CX[k]}" y="80" class="t-mute t-b">${h}</text>`).join("");
      R.forEach((r, j) => { s += `<g opacity="${seg(t, j * 0.2, j * 0.2 + 0.3)}"><rect x="50" y="${96 + j * 50}" width="540" height="40" rx="8" class="f-surface s-line"/>${r.map((c, k) => `<text x="${CX[k]}" y="${121 + j * 50}" class="${k === 2 ? "t-sell t-b" : k === 5 ? "t-gamma t-b" : "t-ink"}">${c}</text>`).join("")}</g>`; });
      s += `<text x="50" y="300" class="t-mute" opacity="${seg(t, 0.7, 1)}">示意畫面。時區記得設成台灣時間，只看「重要性高」的美國數據就夠了。</text>`;
    } else if (i === 1) {
      const B = [["CPI", "物價"], ["非農", "就業"], ["FOMC", "利率"], ["PCE", "物價"], ["GDP", "經濟成長"], ["財報", "大型科技股"]];
      B.forEach((b, k) => { const x = 60 + (k % 3) * 185, y = 70 + Math.floor(k / 3) * 120; s += `<g opacity="${seg(t, k * 0.12, k * 0.12 + 0.25)}"><rect x="${x}" y="${y}" width="165" height="96" rx="12" class="${k < 3 ? "f-sell-soft" : "f-buy-soft"}"/><text x="${x + 18}" y="${y + 44}" class="t-ink t-b t-xl">${b[0]}</text><text x="${x + 18}" y="${y + 74}" class="t-mute">${b[1]}</text></g>`; });
      s += `<text x="60" y="330" class="t-mute" opacity="${seg(t, 0.8, 1)}">紅色三個影響通常最大</text>`;
    } else if (i === 2) {
      const T = [["21:30", "大部分數據（CPI、非農、PCE、GDP）", "t-sell"], ["23:00", "ISM、消費者信心、JOLTS", "t-buy"], ["03:00", "FOMC 利率決策（03:30 記者會）", "t-sell"]];
      T.forEach((r, k) => { s += `<g opacity="${seg(t, k * 0.25, k * 0.25 + 0.35)}"><text x="80" y="${110 + k * 70}" class="${r[2]} t-b t-xl">${r[0]}</text><text x="190" y="${108 + k * 70}" class="t-ink t-lg">${r[1]}</text></g>`; });
      s += `<text x="80" y="330" class="t-mute">冬令台灣時間；夏令全部提早一小時</text>`;
    } else if (i === 3) {
      const P = [101.0, 100.75, 100.5, 100.25, 100.0, 99.75, 99.5];
      const A = [60, 45, 30, 22], Bd = [25, 32, 48, 55], k = 1 - 0.75 * e;
      P.forEach((p, j) => {
        const y = 60 + j * 38;
        s += `<text x="300" y="${y + 5}" text-anchor="middle" class="t-mute">${p.toFixed(2)}</text>`;
        if (j < 4) { const q = Math.round(A[j] * k); s += `<rect x="340" y="${y - 14}" width="${q * 2}" height="28" rx="4" class="f-sell-soft"/><text x="${346 + q * 2}" y="${y + 5}" class="t-sell t-b">${q}</text>`; }
        else { const q = Math.round(Bd[j - 4] * k); s += `<rect x="${260 - q * 2}" y="${y - 14}" width="${q * 2}" height="28" rx="4" class="f-buy-soft"/><text x="${254 - q * 2}" y="${y + 5}" text-anchor="end" class="t-buy t-b">${q}</text>`; }
      });
      s += `<text x="50" y="340" class="t-ink t-b" opacity="${seg(t, 0.5, 1)}">掛單被撤走，簿子變薄：一點點市價單就能讓價格跳好幾格</text>`;
    } else if (i === 4 || i === 5) {
      const g = spike(i === 4 ? seg(t, 0, 0.9) : 0.4);
      s += `<line x1="${g.X(7.5)}" x2="${g.X(7.5)}" y1="40" y2="340" class="s-sell" stroke-dasharray="5 4"/><text x="${g.X(7.5)}" y="34" text-anchor="middle" class="t-sell t-b">21:30 公布</text>`;
      s += `<line x1="70" x2="600" y1="${g.Y(4)}" y2="${g.Y(4)}" class="s-sell" stroke-width="1.5" stroke-dasharray="3 4"/><text x="596" y="${g.Y(4) - 5}" text-anchor="end" class="t-sell">空單的停損</text><line x1="70" x2="600" y1="${g.Y(-4)}" y2="${g.Y(-4)}" class="s-buy" stroke-width="1.5" stroke-dasharray="3 4"/><text x="596" y="${g.Y(-4) + 15}" text-anchor="end" class="t-buy">多單的停損</text>`;
      s += g.s;
      if (i === 4 && t > 0.55) s += `<g opacity="${seg(t, 0.55, 0.75)}"><circle cx="${g.X(8)}" cy="${g.Y(6)}" r="9" class="f-none s-sell" stroke-width="2.5"/><circle cx="${g.X(9)}" cy="${g.Y(-7)}" r="9" class="f-none s-buy" stroke-width="2.5"/><text x="${g.X(9) + 14}" y="${g.Y(-7) + 26}" class="t-ink t-b">兩邊的停損都被掃掉</text></g>`;
      if (i === 5) s += chip(470, 80, "多單，停損 20 點，2 分鐘後 CPI", "buy");
    } else if (i === 6) {
      const Y = (p) => lerp(320, 60, (p - 26950) / 70);
      s += `<line x1="80" x2="600" y1="${Y(27000)}" y2="${Y(27000)}" class="s-ink"/><text x="86" y="${Y(27000) - 8}" class="t-ink t-b">進場 27,000</text>`;
      s += `<line x1="80" x2="600" y1="${Y(26980)}" y2="${Y(26980)}" class="s-sell" stroke-width="2" stroke-dasharray="6 4"/><text x="596" y="${Y(26980) - 8}" text-anchor="end" class="t-sell t-b">設定的停損 26,980（−20 點）</text>`;
      s += `<g opacity="${seg(t, 0.3, 0.8)}"><path d="M300 ${Y(26998)} L330 ${Y(26962)}" class="s-sell" stroke-width="3"/><circle cx="330" cy="${Y(26962)}" r="7" class="f-sell"/><text x="346" y="${Y(26962) + 5}" class="t-sell t-b">實際成交 26,962（−38 點）</text></g>`;
      s += `<text x="80" y="350" class="t-ink t-b" opacity="${seg(t, 0.7, 1)}">MNQ 1 口：原本最多虧 $40，實際虧 $76</text>`;
    } else if (i === 7) {
      const g = spike(1);
      s += `<line x1="${g.X(7.5)}" x2="${g.X(7.5)}" y1="40" y2="340" class="s-sell" stroke-dasharray="5 4"/><text x="${g.X(7.5)}" y="34" text-anchor="middle" class="t-sell t-b">公布</text>`;
      s += `<rect x="${g.X(7.5)}" y="44" width="${g.X(12.5) - g.X(7.5)}" height="296" class="f-sell-soft" opacity="${seg(t, 0, 0.4)}"/><text x="${(g.X(7.5) + g.X(12.5)) / 2}" y="330" text-anchor="middle" class="t-sell t-b" opacity="${seg(t, 0, 0.4)}">先等 5～15 分鐘</text>`;
      s += g.s + `<text x="596" y="${g.Y(-4)}" text-anchor="end" class="t-ink t-b" opacity="${seg(t, 0.5, 1)}">方向出來、掛單回來後</text><text x="596" y="${g.Y(-4) + 20}" text-anchor="end" class="t-ink t-b" opacity="${seg(t, 0.5, 1)}">再用平常的流程</text>`;
    } else if (i === 8 || i === 9) {
      const C = i === 8 ? [["預期 0.3%", "實際 0.3%", "沒有意外：反應小", "t-mute"], ["預期 0.3%", "實際 0.6%", "物價大超預期：大動", "t-sell"]] : [["預期 0.3%", "實際 0.3%", "？", "t-ink"]];
      C.forEach((c, k) => { s += `<g opacity="${i === 9 ? 1 : seg(t, k * 0.35, k * 0.35 + 0.35)}"><rect x="70" y="${80 + k * 120}" width="500" height="96" rx="12" class="f-surface s-line"/><text x="94" y="${118 + k * 120}" class="t-mute t-lg">${c[0]}</text><text x="254" y="${118 + k * 120}" class="t-ink t-b t-lg">${c[1]}</text><text x="94" y="${152 + k * 120}" class="${c[3]} t-b t-lg">${c[2]}</text></g>`; });
    } else if (i === 10) {
      const X = (k) => lerp(80, 580, k / 10), Y = (v) => lerp(300, 80, v / 40);
      const iv = [18, 19, 20, 22, 24, 27, 30, 16, 15, 15, 14];
      s += `<line x1="70" x2="590" y1="300" y2="300" class="s-line"/><text x="70" y="70" class="t-mute">隱含波動率 IV（示意）</text>`;
      const n = Math.max(2, Math.ceil(seg(t, 0, 0.9) * iv.length));
      s += `<polyline points="${iv.slice(0, n).map((v, k) => `${X(k)},${Y(v)}`).join(" ")}" class="s-gamma f-none" stroke-width="3"/>`;
      s += `<line x1="${X(6.5)}" x2="${X(6.5)}" y1="70" y2="300" class="s-sell" stroke-dasharray="5 4"/><text x="${X(6.5)}" y="320" text-anchor="middle" class="t-sell t-b">事件</text>`;
      s += `<g opacity="${seg(t, 0.7, 1)}"><text x="${X(3)}" y="${Y(26)}" class="t-gamma t-b">事件前升高</text><text x="${X(7.3)}" y="${Y(20)}" class="t-gamma t-b">事件後急降（IV Crush）</text></g>`;
    } else if (i === 11) {
      s += cards([["每週日", "看下週日曆，把重要事件寫進盤前筆記"], ["公布前 15 分鐘", "不開新倉，手上的部位先平倉或減碼"], ["公布後 15 分鐘", "等第一波亂掃結束、掛單回來"], ["FOMC 那晚", "不留部位，或乾脆不交易"], ["事件後", "重新讀當天的 GEX 位階，不沿用前一天"]], t, { hl: 1 });
    } else if (i === 12) {
      CAL.forEach((c, k) => {
        const y = 40 + k * 31, hot = c.d.startsWith("12/10");
        s += `<g opacity="${seg(t, k * 0.05, k * 0.05 + 0.3)}"><rect x="30" y="${y - 18}" width="590" height="27" rx="6" class="${hot ? "f-sell-soft" : c.k === "holiday" ? "f-gamma-soft" : "f-surface"}"/><text x="40" y="${y}" class="t-ink t-b">${c.d}</text><text x="140" y="${y}" class="${c.k === "big" || c.k === "fomc" ? "t-sell t-b" : "t-ink"}">${c.t}</text><text x="200" y="${y}" class="t-ink">${c.n.length > 30 ? c.n.slice(0, 30) + "…" : c.n}</text></g>`;
      });
    } else if (i === 13) {
      s += cards([["事件前", "不開新倉，先處理手上的部位"], ["事件時", "掛單變薄，停損可能嚴重滑價"], ["事件後", "至少等 15 分鐘，掛單回來再看"], ["看差距", "市場交易的是實際和預期的差距"], ["寫死規則", "每週日排好，臨場不改"]], t, { hl: 0 });
    }
    svg.innerHTML = s;
  }

  /* ---------- 你來操作：用真實日曆排出避開的時段 ---------- */
  const simHTML = `<p class="small">資料來源：TradingView 經濟日曆，美國、重要性「高」，2026-11-19 擷取，已換成台灣時間（冬令）。實際時間以官方公布為準。</p>
<div class="ev-list">${CAL.map((c) => `<label class="ev-i ${c.k}"><input type="checkbox" data-id="${c.id}"><span class="ev-d">${c.d}</span><span class="ev-t">${c.t}</span><span class="ev-n">${c.n}</span></label>`).join("")}</div>
<div class="ev-out"></div><ul class="sim-task ev-task"></ul>`;
  function simMount(box) {
    const q = (s) => box.querySelector(s);
    const add = (hm, m) => { const [h, mm] = hm.split(":").map(Number); let x = h * 60 + mm + m; x = (x + 1440) % 1440; return `${String(Math.floor(x / 60)).padStart(2, "0")}:${String(x % 60).padStart(2, "0")}`; };
    function paint() {
      const on = [...box.querySelectorAll(".ev-list input")].filter((x) => x.checked).map((x) => CAL.find((c) => c.id === x.dataset.id));
      const by = {};
      on.forEach((c) => { (by[c.d] = by[c.d] || []).push(c); });
      q(".ev-out").innerHTML = on.length ? `<p><b>你的避開清單</b>（重大數據前 15 分鐘到後 30 分鐘、FOMC 前 30 分鐘到後 60 分鐘、一般數據前 10 到後 15 分鐘）</p><ul class="ev-plan">${Object.entries(by).map(([d, cs]) => `<li><b>${d}</b>　${cs.map((c) => (WIN[c.k] ? `${add(c.t, -WIN[c.k][0])}～${add(c.t, WIN[c.k][1])} 不開新倉（${c.n.split("（")[0].split("、")[0]}）` : `${c.n.split("：")[0]}：先確認當天交易時間`)).join("；")}</li>`).join("")}</ul>` : `<p class="small">勾選你要避開的事件，下面會自動列出每天不開新倉的時段。</p>`;
      const ids = new Set(on.map((c) => c.id));
      const done = { a: ["cpi", "nfp", "fomc"].every((x) => ids.has(x)), b: ids.has("fomc") && ids.has("cpi"), c: CAL.every((c) => ids.has(c.id)) };
      q(".ev-task").innerHTML = [["a", "任務 1：把影響最大的 CPI、非農、FOMC 都加進避開清單"], ["b", "任務 2：看 12/10 那天一共有幾段要避開"], ["c", "任務 3：把四週內所有事件都排進去，看看哪幾天晚上比較乾淨"]].map(([k, tx]) => `<li class="${done[k] ? "ok" : ""}">${done[k] ? "✓" : "○"} ${tx}</li>`).join("");
    }
    box.addEventListener("change", paint); paint();
  }

  const QS = [
    { fig: `<p class="small q-cap">你在晚上 9:00 做多，打算抱到 11:00。日曆顯示 9:30 有非農就業數據。</p>`, q: "照這一關的規則，你應該？", step: 6, o: [
      ["照原計畫抱著", false, "9:30 公布非農，部位會暴露在劇烈跳動和滑價裡。"],
      ["9:15 前先平倉或減碼，等 10:00 之後再看要不要重新進場", true, "公布前 15 分鐘處理部位，公布後等至少 15～30 分鐘，市場穩定後再用平常的流程。"],
      ["把停損拉遠一點就好", false, "停損拉遠只是讓可能的虧損變大，事件時一樣可能滑價。"]] },
    { fig: `<p class="small q-cap">非農就業公布 25 萬人，比上個月好很多，但 NQ 公布後卻下跌。</p>`, q: "最可能的原因是？", step: 9, o: [
      ["數據一定是錯的", false, "數據沒有錯，是你只看了好壞，沒看預期。"],
      ["市場原本預期更好，或擔心經濟太熱會讓利率降不下來", true, "價格反應的是「和預期的差距」以及它對利率的影響。好數據也可能讓市場擔心升息，科技股反而下跌。"],
      ["好數據就一定要漲，這是被操縱", false, "沒有「好數據一定漲」這種規則。市場看的是意外和後續影響。"]] },
    { fig: `<p class="small q-cap">昨晚 FOMC 結束，今天你打開 GEX 紀錄，發現位階和昨天差很多。</p>`, q: "比較合理的做法是？", step: 11, o: [
      ["沿用昨天的位階，今天的一定是算錯了", false, "事件後 IV 下降、部位重新調整，位階本來就會變。"],
      ["用今天重新讀的位階，因為事件後 IV 和部位都變了", true, "事件會讓 IV 快速下降、造市商部位重新調整，事件後一定要用新的位階。"],
      ["今天不用看位階", false, "位階還是有參考價值，只是要用更新後的。"]] }
  ];

  PAGES["of-event"] = window.KIT.page(window.COURSE.OFC, "of-event", {
    topic: "經濟事件",
    lede: "CPI、非農、FOMC 公布的那幾分鐘，NQ 可能比平常一小時動得還多，停損也可能嚴重滑價。這一關教你怎麼看經濟日曆、事件前後市場怎麼變，最後用接下來四週真實的日曆排出你要避開的時段。",
    analogy: [
      ["颱風天", "颱風要來之前，你會先收好陽台的東西，不會等到風雨最大時才出門。事件前先處理部位，就是收陽台。"],
      ["考試放榜", "大家都在等成績公布，公布的瞬間情緒最激動。真正重要的不是考幾分，而是<b>比預期好還是差</b>。"],
      ["超市搶購", "大家一起衝進去，貨架瞬間被掃空，想買的東西可能要用更貴的價格買。這就是事件時的<b>滑價</b>。"]],
    steps: STEPS, draw, simHTML, simMount,
    simIntro: "用接下來四週真實的重要事件，勾選你要避開的，自動排出每天不開新倉的時段。",
    mist: [
      ["有停損就不怕事件", "事件時掛單變薄，停損觸發後可能滑價好幾倍。停損的保護在事件時會變差。"],
      ["好數據就會漲、壞數據就會跌", "市場看的是實際和預期的差距，以及它對利率的影響。好數據也可能讓市場下跌。"],
      ["公布後第一根 K 棒的方向最準", "第一波常常是反應過度，之後反轉很常見。至少等 5～15 分鐘，讓掛單回來再判斷。"]],
    faq: [
      ["經濟日曆要去哪裡看？", "TradingView 的經濟日曆、Investing.com、Forex Factory 都可以免費看。記得把時區設成台灣時間，篩選美國、重要性高。"],
      ["一定要避開所有數據嗎？", "不一定。CPI、非農、FOMC 這類最重要的建議避開；一般數據可以縮短避開的時間。重點是事先寫好規則，不要臨時決定。"],
      ["有人專門交易數據行情，可以嗎？", "可以，但那是另一套方法，需要處理滑價、價差和極端波動。這套課程的流程是在一般市況下用訂單流確認，所以選擇避開。"],
      ["大型科技股財報也要避開嗎？", "大型科技股（NVIDIA、微軟、蘋果等）的財報通常在美股收盤後（台灣清晨）公布，會影響 NQ 的隔夜盤。如果你會留倉到隔天，就要注意。"],
      ["FOMC 為什麼要避開整晚？", "FOMC 在台灣凌晨 3:00 公布，3:30 還有記者會，主席說的話可能讓市場再大動一次。對在台灣睡覺的人來說，最簡單的做法是那晚不留部位。"],
      ["假日要注意什麼？", "美國假日（例如感恩節、聖誕節）股市休市或提早收盤，期貨交易時間也會縮短，成交量很小。以 CME 公布的假日時間表為準。"]],
    qs: QS,
    gloss: [
      ["經濟日曆", "列出經濟數據公布時間、重要性、前值、預期、實際值的表。"],
      ["CPI", "消費者物價指數，衡量通膨，最會影響利率預期。"],
      ["非農就業", "美國每月就業數據，通常在第一個星期五公布。"],
      ["FOMC", "聯準會的利率決策會議，一年 8 次。"],
      ["預期值", "市場事先對數據的預測。價格看的是實際和預期的差距。"],
      ["IV Crush", "事件過後隱含波動率快速下降。"]],
    remember: "<b>事件前先處理部位，事件時停損會滑價，事件後等 15 分鐘。</b>市場交易的是實際和預期的差距。"
  });
})();
