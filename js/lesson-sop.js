/* 路線 3 第 1、2、3、6、7 關（新版） */
(function () {
  const PAGES = (window.__PAGES = window.__PAGES || {});
  const { lerp, ease, seg, cards, chip } = window.KIT;
  const { fx, sg, tag } = window.SOPK;
  const done3 = (k, d, txt) => `<li class="${d[k] ? "ok" : ""}">${d[k] ? "✓" : "○"} ${txt}</li>`;

  /* ================= 第 1 關：一天的流程 ================= */
  const STAGES = [["讀環境", "路線 2", "f-gamma-soft"], ["畫關鍵位", "路線 1", "f-buy-soft"], ["等到位", "路線 1", "f-buy-soft"], ["K 線＋觸發", "路線 1、3", "f-buy-soft"], ["執行風控", "路線 1、3", "f-sell-soft"], ["盤後紀錄", "路線 3", "f-surface"]];
  function flow(t, hl) {
    let s = "";
    STAGES.forEach(([a, b, cls], k) => { const x = 40 + (k % 3) * 200, y = k < 3 ? 90 : 220, op = seg(t, k * 0.12, k * 0.12 + 0.25);
      s += `<g opacity="${op}"><rect x="${x}" y="${y}" width="170" height="90" rx="12" class="${cls} s-line"/>${hl === k ? `<rect x="${x - 4}" y="${y - 4}" width="178" height="98" rx="14" class="f-none s-hl" stroke-width="3"/>` : ""}<text x="${x + 85}" y="${y + 40}" text-anchor="middle" class="t-ink t-b t-lg">${k + 1}. ${a}</text><text x="${x + 85}" y="${y + 66}" text-anchor="middle" class="t-mute">${b}</text></g>`;
      if (k % 3 < 2) s += `<path d="M${x + 174} ${y + 45} h20" class="s-ink" stroke-width="2" opacity="${op}"/>`; });
    s += `<path d="M590 180 v20 H125 v16" class="s-ink f-none" stroke-width="2" opacity="${seg(t, 0.35, 0.5)}"/>`;
    return s;
  }
  const TL = [[21.5, "盤前：重讀 GEX、看事件，判定劇本", "f-gamma-soft"], [22.0, "盤前：畫關鍵位", "f-buy-soft"], [22.5, "美股開盤（冬令 22:30）", "f-hl"], [23.0, "常見數據公布（美東 10:00）", "f-sell-soft"], [24.5, "主要交易時段結束", "f-surface"], [29.0, "美股收盤（05:00）", "f-surface"]];
  function timeline(t, mark) {
    const X = (h) => lerp(70, 600, (h - 21) / 9);
    let s = `<line x1="70" x2="600" y1="200" y2="200" class="s-ink" stroke-width="2"/>`;
    [21, 22, 23, 24, 25, 27, 30].forEach((h) => { s += `<line x1="${X(h)}" x2="${X(h)}" y1="194" y2="206" class="s-ink"/><text x="${X(h)}" y="226" text-anchor="middle" class="t-mute">${String(h % 24).padStart(2, "0")}:00</text>`; });
    s += `<rect x="${X(22.5)}" y="186" width="${X(24.5) - X(22.5)}" height="28" rx="4" class="f-buy-soft" opacity="${seg(t, 0.3, 0.6)}"/><text x="${(X(22.5) + X(24.5)) / 2}" y="176" text-anchor="middle" class="t-buy t-b" opacity="${seg(t, 0.3, 0.6)}">主要交易時段</text>`;
    TL.forEach(([h, lab], k) => { const op = seg(t, 0.1 + k * 0.12, 0.3 + k * 0.12), col = k % 2, row = Math.floor(k / 2);
      s += `<g opacity="${op}"><circle cx="${X(h)}" cy="200" r="11" class="${mark === k ? "f-hl" : "f-inkd"}"/><text x="${X(h)}" y="204.5" text-anchor="middle" class="t-w t-b">${k + 1}</text><text x="${70 + col * 280}" y="${262 + row * 26}" class="t-ink"><tspan class="t-b">${k + 1}</tspan>　${lab}</text></g>`; });
    s += `<text x="70" y="60" class="t-mute">台灣時間（美股冬令）；隔天早上讀前一天收盤的 GEX 紀錄</text>`;
    return s;
  }
  const S1 = [
    { cap: "路線 3 把前兩條路線接起來：<b>路線 2 告訴你今天的路況</b>（波動可能大還是小），<b>路線 1 告訴你在哪裡、什麼時候動手</b>。",
      why: "這是整套流程最重要的分工：GEX 不決定進場位置，只決定今天用哪一套打法。原因第 3 關會講。", stuck: "想成開車：天氣預報（GEX）決定你開多快、車距留多少；路口和紅綠燈（訂單流）決定你什麼時候轉彎。" },
    { cap: "一天分成六步：<b>讀環境 → 畫關鍵位 → 等到位 → K 線＋觸發 → 執行風控 → 盤後紀錄</b>。",
      why: "前兩步在盤前做完，盤中只做第 3、4、5 步，盤後做第 6 步。盤中不再重新想劇本，減少臨場亂改。", dur: 3200 },
    { cap: "用台灣時間排起來（美股冬令）：<b>21:30</b> 讀環境、<b>22:00</b> 畫位、<b>22:30</b> 美股開盤，開盤後兩小時是主要交易時段。",
      why: "美東 10:00（台灣 23:00）常有數據公布，要先知道今天有沒有。夏令時間全部提早一小時。另外，GEX 很可能只在開盤後這兩小時比較有參考價值（第 2 關，還在驗證）。", dur: 3600 },
    { cap: "<b>第 1 步 讀環境</b>：淨 GEX 正負、價格在 Flip 哪一邊、今天有沒有到期、有沒有大事件。用的是路線 2 第 7、8、12 關和路線 1 第 11 關。",
      why: "輸出只有一個：今天是劇本 A（震盪）、劇本 B（趨勢），還是要降低部位的混合日（第 2 關）。" },
    { cap: "<b>第 2 步 畫關鍵位</b>：前一天的價值區、前日高低、隔夜高低、VWAP。用的是路線 1 第 7、8、9、10 關。",
      why: "這些位置是今天唯一要盯的地方。價格不在這些位置附近，就不用看 footprint（第 3 關）。" },
    { cap: "想一想：路線 2 的 GEX 在這套流程裡負責什麼？",
      q: { t: "選最接近的答案。", o: [
        ["判斷今天波動可能大還是小，決定用哪一套打法", true, "GEX 是路況，不是進場點。進場位置來自路線 1 的關鍵位。"],
        ["告訴我在哪個價位進場", false, "一次小樣本的安慰劑測試（NQ 5 天）顯示，GEX 位階沒有比隨機更準（第 3 關）。"],
        ["告訴我今天會漲還是會跌", false, "GEX 只說明波動的敏感度，不說方向。"]] } },
    { cap: "<b>第 3、4 步 等到位、看觸發</b>：價格到關鍵位，才打開 footprint 看 K 線；出現劇本的觸發條件才進場。這是第 4、5 關的內容。",
      why: "大部分時間都在等。沒到位不看、沒觸發不做，是新手最難也最重要的紀律。" },
    { cap: "<b>第 5 步 執行風控</b>：口數由停損距離和每筆風險金額算出來，環境不同，停損和目標的距離也不同（第 6 關）。",
      why: "風控是唯一一定能控制的事。進場可以錯，部位大小不能錯。" },
    { cap: "<b>第 6 步 盤後紀錄</b>：今天的環境、劇本、實際走勢、每筆交易有沒有照做（第 7 關）。累積下來，才知道這套流程對你有沒有用。",
      why: "這也接上 GEX 觀察計畫：20 個交易日後再決定環境判斷要不要保留。" },
    { cap: "想一想：晚上 22:40，價格在兩個關鍵位中間，footprint 上出現一根很大的紅 K。",
      q: { t: "按照流程，你要做什麼？", o: [
        ["不做事，價格不在關鍵位，不看 footprint", true, "第 3 步「等到位」沒有通過，後面的步驟都不用做。"],
        ["追多，大紅 K 很強", false, "不在關鍵位的訊號，沒有地方放合理的停損和目標。"],
        ["重新判定今天的劇本", false, "劇本盤前就定好，盤中不因為一根 K 線改。"]] } },
    { cap: "整理：<b>盤前定劇本和關鍵位，盤中只等到位和觸發，盤後紀錄。</b>路線 2 是路況，路線 1 是方向盤，路線 3 是駕駛流程。",
      why: "下面的練習區拉動時間，看看每個時間點該做什麼。" }
  ];
  function d1(svg, i, t) {
    let s = "";
    if (i === 0) s += `<g opacity="${seg(t, 0, 0.4)}"><rect x="60" y="100" width="240" height="160" rx="14" class="f-gamma-soft"/><text x="180" y="150" text-anchor="middle" class="t-ink t-b t-lg">路線 2：路況</text><text x="180" y="190" text-anchor="middle" class="t-ink">波動大還是小？</text><text x="180" y="216" text-anchor="middle" class="t-mute">決定打法</text></g><g opacity="${seg(t, 0.4, 0.8)}"><rect x="340" y="100" width="240" height="160" rx="14" class="f-buy-soft"/><text x="460" y="150" text-anchor="middle" class="t-ink t-b t-lg">路線 1：方向盤</text><text x="460" y="190" text-anchor="middle" class="t-ink">在哪裡、什麼時候？</text><text x="460" y="216" text-anchor="middle" class="t-mute">決定進出場</text></g>`;
    else if (i === 1) s += flow(t);
    else if (i === 2) s += timeline(t);
    else if (i === 3 || i === 5) s += flow(1, 0) + (i === 5 ? chip(320, 340, "GEX 負責什麼？", "hl") : "");
    else if (i === 4) s += flow(1, 1);
    else if (i === 6) s += flow(1, 3);
    else if (i === 7) s += flow(1, 4);
    else if (i === 8) s += flow(1, 5);
    else if (i === 9) s += timeline(1, 2) + chip(400, 340, "22:40 不在關鍵位？", "hl");
    else s += cards([["盤前", "讀環境、畫關鍵位，定好劇本"], ["盤中", "只等到位和觸發"], ["執行", "口數由停損和風險金額算"], ["盤後", "紀錄，累積證據"]], t, { hl: 1 });
    svg.innerHTML = s;
  }
  const sim1 = `<div class="controls"><div class="ctl"><label>台灣時間 <b class="t1-v"></b></label><input class="t1" type="range" min="21" max="29.5" step="0.25" value="21.5"></div></div><svg class="fpx t1-svg" viewBox="0 0 640 380" role="img" aria-label="一天的時間軸"></svg><div class="t1-out"></div><ul class="sim-task t1-task"></ul>`;
  function mount1(box) {
    const q = (s) => box.querySelector(s), d = {};
    const SAY = [[21, 21.99, "盤前①讀環境", "打開 GEX 紀錄：淨 GEX 正負、價格在 Flip 哪一邊；查今天的經濟日曆和到期日。寫下今天是劇本 A、B 還是混合。"], [22, 22.49, "盤前②畫關鍵位", "畫前一天的 VAH、POC、VAL、前日高低、隔夜高低。合併成 3～5 個區域。"], [22.5, 24.5, "盤中：等到位 → K 線＋觸發 → 執行", "價格到關鍵位才看 footprint；出現劇本的觸發才進場。數據公布前後 15 分鐘不進場。"], [24.51, 28.99, "交易時段之後", "主要交易時段結束。已經有部位就照停損和目標管理，不再開新倉（自用規則，可以依自己作息調整）。"], [29, 30, "盤後：紀錄", "收盤後填紀錄表：環境、劇本、實際振幅、每筆交易有沒有照做。"]];
    function paint() {
      const h = +q(".t1").value, hh = Math.floor(h) % 24, mm = Math.round((h % 1) * 60);
      q(".t1-v").textContent = String(hh).padStart(2, "0") + ":" + String(mm).padStart(2, "0");
      const X = (x) => lerp(70, 600, (x - 21) / 9);
      q(".t1-svg").innerHTML = timeline(1) + `<line x1="${X(h)}" x2="${X(h)}" y1="80" y2="320" class="s-hl" stroke-width="3"/>`;
      const z = SAY.find((r) => h >= r[0] && h <= r[1]) || SAY[0];
      q(".t1-out").innerHTML = `<p><b>${z[2]}</b>：${z[3]}</p>`;
      if (h < 22) d.a = true; if (h >= 22.5 && h <= 24.5) d.b = true; if (h >= 29) d.c = true;
      q(".t1-task").innerHTML = done3("a", d, "任務 1：找出盤前讀環境的時間") + done3("b", d, "任務 2：拉到主要交易時段，看盤中只做哪三件事") + done3("c", d, "任務 3：拉到收盤後，看盤後要紀錄什麼");
    }
    box.addEventListener("input", paint); paint();
  }
  PAGES["learn-1"] = window.KIT.page(window.COURSE.SOP, "learn-1", {
    topic: "一天的流程",
    lede: "路線 3 把前兩條路線接成一套每天照做的流程：盤前定劇本和關鍵位，盤中只等到位和觸發，盤後紀錄。這關先看整張地圖。",
    analogy: [
      ["天氣和路口", "GEX 像<b>天氣預報</b>，決定開多快；關鍵位像<b>路口</b>，決定在哪裡轉彎。"],
      ["機長檢查表", "起飛前照<b>檢查表</b>做完，空中就不用臨時想。"],
      ["釣魚", "大部分時間在<b>等</b>，魚來了才拉竿。"]],
    steps: S1, draw: d1, simHTML: sim1, simMount: mount1,
    simIntro: "拉動台灣時間，看看每個時間點該做什麼。",
    mist: [["GEX 位階就是進場點", "安慰劑測試目前不支持。GEX 用來判斷環境，進場位置來自訂單流的關鍵位。"], ["盤中看到好機會可以改劇本", "劇本盤前就定好。盤中改劇本，通常是被一兩根 K 線帶著走。"], ["整晚都要盯盤", "只要盯主要交易時段和關鍵位附近。其他時間不做事也是流程的一部分。"]],
    faq: [["夏令時間怎麼算？", "美股開盤變成台灣 21:30，全部提早一小時。"], ["一定要做滿兩小時嗎？", "不用。這是建議的主要時段，依自己的作息調整，重點是事先定好、不臨時延長。"], ["亞洲時段可以交易嗎？", "可以，但選擇權不交易、GEX 影響較小，量也比較少。這套流程以美股時段為主。"], ["我需要什麼工具？", "GEX 紀錄、有 Volume Profile 和 footprint 的看盤軟體、經濟日曆、紀錄表。"]],
    qs: [
      { fig: `<p class="small q-cap">盤前你讀到淨 GEX −1.9B，價格在 Flip 下方。</p>`, q: "這個資訊在流程裡用來做什麼？", step: 4, o: [["判定今天偏趨勢日，用劇本 B 的打法", true, "環境決定打法，不決定進場價。"], ["直接在 Put Wall 掛單做多", false, "位階目前不是觸碰點。"], ["決定今天一定會跌", false, "GEX 不說方向。"]] },
      { fig: `<p class="small q-cap">價格到了前一天的 VAH。</p>`, q: "下一步做什麼？", step: 7, o: [["打開 footprint，看 K 線有沒有出現劇本的觸發", true, "到位之後才看 K 線和 footprint。"], ["馬上放空", false, "到位不等於觸發。"], ["重新判定劇本", false, "劇本盤前就定好了。"]] },
      { fig: `<p class="small q-cap">收盤後，今天賺了錢，但其中一筆沒有照劇本做。</p>`, q: "紀錄時要怎麼寫？", step: 9, o: [["照實寫「沒照做」，不管賺賠", true, "評估的是流程，不是單筆結果（第 7 關）。"], ["賺錢了就不用寫", false, "沒照做卻賺錢，最容易養成壞習慣。"], ["只寫賺錢的交易", false, "只記好的會高估自己。"]] }],
    gloss: [["劇本", "盤前根據環境決定的打法：A 震盪、B 趨勢、混合。"], ["到位", "價格來到盤前畫好的關鍵位附近。"], ["觸發", "劇本規定的進場條件出現。"], ["主要交易時段", "美股開盤後的前兩小時，台灣冬令 22:30～00:30。"]],
    remember: "<b>盤前定劇本和關鍵位，盤中只等到位和觸發，盤後紀錄。</b>"
  });

  /* ================= 第 2 關：讀環境，定劇本 ================= */
  function judge(v) {
    const pos = v.ng >= 0, above = v.px >= v.fl;
    let k = pos && above ? "A" : !pos && !above ? "B" : "M";
    const name = { A: "劇本 A：震盪日", B: "劇本 B：趨勢日", M: "混合日：兩套都準備，部位減半" }[k];
    const notes = [];
    if (v.ev) notes.push("有大事件：數據公布前後 15 分鐘不進場；事件後重新看價格在 Flip 哪一邊。");
    if (v.exp) notes.push("今天有到期：收盤前牆可能比較強，收盤後到期的部分消失，隔天一定要重讀。");
    if (Math.abs(v.ng) < 200) notes.push("淨 GEX 接近 0：環境不明顯，當成混合日處理。");
    if (Math.abs(v.ng) < 200) k = "M";
    return { k, name: Math.abs(v.ng) < 200 ? "混合日：兩套都準備，部位減半" : name, notes };
  }
  const S2 = [
    { cap: "盤前讀環境，只問<b>四個問題</b>：① 淨 GEX 正還是負？② 價格在 Flip 上方還是下方？③ 今天有沒有到期？④ 今天有沒有大事件？",
      why: "四個問題都有明確答案，不靠感覺。答案寫下來，盤中就不再改。", stuck: "像出門前看天氣：下不下雨、溫度幾度、有沒有颱風。" },
    { cap: "前兩題決定劇本：<b>正 GEX＋Flip 上方 → 劇本 A</b>（震盪）；<b>負 GEX＋Flip 下方 → 劇本 B</b>（趨勢）；兩個不一致 → <b>混合日</b>，兩套都準備、部位減半。",
      why: "混合日代表訊號互相矛盾。這時最好的做法是少做、做小，等價格自己表態。", dur: 3000 },
    { cap: "淨 GEX 很接近 0（例如 ±200M 以內）也當成<b>混合日</b>：環境不明顯，不要硬套劇本。",
      why: "接近 0 的時候，一點 OI 變化或讀取時間不同，正負號就可能翻過來（同一天不同時間讀到的數字也會不同）。" },
    { cap: "第三題：<b>到期日</b>。月結算（每月第三個週五）當天，牆在收盤前可能比較強；收盤後到期的部分消失，隔天的地形會重畫（路線 2 第 8 關）。",
      why: "到期日不改變劇本，但提醒你：明天的 GEX 一定要重讀，不能沿用。" },
    { cap: "第四題：<b>大事件</b>。CPI、FOMC、非農這類數據，公布前後 15 分鐘<b>不進場</b>；公布後重新看價格在 Flip 哪一邊（路線 1 第 11 關）。",
      why: "事件會讓 IV 大變（路線 2 第 4、9 關），GEX 的前提可能一下就變了。" },
    { cap: "用一個例子練一次（示意數字）：某天收盤的資料，淨 GEX <b>−1.94B</b>，NQ 收 24,985，Flip 換算約 <b>25,724</b>；隔天是<b>月結算日</b>，23:00 有一個中度重要的數據。",
      why: "實務上常遇到資料來源的價格和 TradingView 收盤不一致，這時位階的可信度要打折。", dur: 2600 },
    { cap: "想一想：用上面四個問題判斷隔天。",
      q: { t: "今天比較合理的劇本是？", o: [
        ["劇本 B（趨勢日），到期日＋23:00 數據前後不進場", true, "淨 GEX 負、價格在 Flip 下方 → B。月結算提醒隔天重讀，23:00 前後 15 分鐘不進場。"],
        ["劇本 A（震盪日）", false, "淨 GEX 是負的，價格又在 Flip 下方，是趨勢日的組合。"],
        ["今天一定會繼續跌，開盤就空", false, "劇本只決定打法。方向要看價格在關鍵位接受還是拒絕。"]] } },
    { cap: "要誠實：<b>環境判斷本身也還沒被證實</b>。小樣本裡，大正 GEX 的日子振幅比較小（方向吻合），但也有反例。所以環境<b>只調整目標距離、停損寬度和部位大小</b>，不決定方向。",
      why: "這樣設計的好處：就算 20 天後發現環境判斷沒用，整套流程照樣能跑，只是少了「切換劇本」這一步。" },
    { cap: "開盤後<b>重讀一次</b>：盤前讀的是前一天收盤的資料，夜盤價格可能已經移動很多。22:30 後看價格現在在 Flip 哪一邊（路線 2 第 12 關）。",
      why: "線不會跟著夜盤動，但價格和線的相對位置會變。原本在 Flip 下方，開盤時可能已經在上方。" },
    { cap: "還有<b>時間</b>：看盤的印象是，GEX 只在紐約開盤後 <b>1～2 小時</b>比較有用（台灣冬令 22:30～00:30）。之後環境判斷和 GEX 線<b>暫時不採用</b>，只看訂單流。",
      why: "可能的原因：OI 是前一天的，盤中新部位（尤其 0DTE）越來越多；市商的對沖集中在開盤；價格跑遠、IV 改變。但這還只是印象：開盤後本來就最常碰到各種價位。觀察計畫已經加了「時段測試」，用 5 分 K 把觸碰分成三個時段，各自和平移後的位階比，20 天後再決定。", dur: 3000 },
    { cap: "想一想：淨 GEX +900M，但開盤時價格在 Flip 下方 80 點。",
      q: { t: "今天怎麼處理？", o: [
        ["混合日：兩套都準備，部位減半，等價格表態", true, "兩個訊號矛盾，少做、做小。"],
        ["劇本 A，淨 GEX 是正的", false, "價格在 Flip 下方，環境不一致。"],
        ["劇本 B，價格在 Flip 下方", false, "淨 GEX 是正的，也不一致。"]] } },
    { cap: "整理：<b>四個問題 → 劇本</b>。正＋上方＝A，負＋下方＝B，不一致或接近 0＝混合。到期日提醒隔天重讀，事件前後不進場。環境只調整打法，不決定方向；開盤兩小時後先只看訂單流（驗證中）。",
      why: "下面的練習區可以載入例子，或自己填數字。" }
  ];
  function matrix(t, hl) {
    const C = (x, y, lab, sub, cls, k) => `<g opacity="${seg(t, k * 0.15, k * 0.15 + 0.3)}"><rect x="${x}" y="${y}" width="220" height="110" rx="12" class="${cls}"/>${hl === k ? `<rect x="${x - 4}" y="${y - 4}" width="228" height="118" rx="14" class="f-none s-hl" stroke-width="3"/>` : ""}<text x="${x + 110}" y="${y + 48}" text-anchor="middle" class="t-ink t-b t-lg">${lab}</text><text x="${x + 110}" y="${y + 78}" text-anchor="middle" class="t-mute">${sub}</text></g>`;
    return `<text x="220" y="70" text-anchor="middle" class="t-mute">價格在 Flip 上方</text><text x="450" y="70" text-anchor="middle" class="t-mute">價格在 Flip 下方</text><text x="90" y="145" text-anchor="end" class="t-gamma t-b">淨 GEX 正</text><text x="90" y="265" text-anchor="end" class="t-sell t-b">淨 GEX 負</text>` +
      C(110, 90, "劇本 A", "震盪：邊緣反轉", "f-gamma-soft", 0) + C(340, 90, "混合", "兩套準備、減半", "f-surface s-line", 1) + C(110, 210, "混合", "兩套準備、減半", "f-surface s-line", 2) + C(340, 210, "劇本 B", "趨勢：順勢回測", "f-sell-soft", 3);
  }
  function d2(svg, i, t) {
    let s = "";
    if (i === 0) s += cards([["淨 GEX", "正還是負？"], ["Flip", "價格在上方還是下方？"], ["到期", "今天有沒有到期？"], ["事件", "今天有沒有大數據？"]], t, { hl: 0 });
    else if (i === 1) s += matrix(t);
    else if (i === 2) s += matrix(1) + chip(320, 350, "接近 0 → 當混合", "hl", seg(t, 0.3, 0.7));
    else if (i === 3 || i === 4) s += cards(i === 3 ? [["月結算", "每月第三個週五"], ["收盤前", "牆可能比較強"], ["收盤後", "到期部分消失、地形重畫"], ["隔天", "一定要重讀 GEX"]] : [["事件", "CPI、FOMC、非農…"], ["前後 15 分", "不進場"], ["公布後", "重看價格在 Flip 哪邊"], ["原因", "IV 大變，GEX 前提可能改變"]], t, { hl: 3 });
    else if (i === 5 || i === 6) {
      const Y = (p) => lerp(320, 70, (p - 24780) / 1100);
      s += [[25724, "Flip 25,724", "s-ink"], [25271, "25,271（−330M）", "s-sell"], [24858, "24,858（−382M）", "s-sell"]].map(([p, lab, c]) => `<line x1="90" x2="430" y1="${Y(p)}" y2="${Y(p)}" class="${c}" stroke-dasharray="5 4"/><text x="436" y="${Y(p) + 4}" class="${c.replace("s-", "t-")} t-b">${lab}</text>`).join("");
      s += `<circle cx="260" cy="${Y(24985)}" r="9" class="f-buy" opacity="${seg(t, 0.2, 0.5)}"/><text x="246" y="${Y(24985) + 5}" text-anchor="end" class="t-buy t-b" opacity="${seg(t, 0.2, 0.5)}">收 24,985</text>`;
      s += `<g opacity="${seg(t, 0.5, 0.9)}">${chip(250, 50, "淨 GEX −1.94B", "sell")}${chip(430, 50, "月結算＋23:00 數據", "hl")}</g>`;
      if (i === 6) s += chip(320, 350, "今天用哪個劇本？", "hl");
    } else if (i === 7) s += cards([["證據", "大正 GEX 日振幅較小，n＝5"], ["反例", "也有不符合的日子"], ["所以", "環境只調整目標、停損、部位"], ["方向", "看價格接受或拒絕關鍵位"]], t, { hl: 2 });
    else if (i === 8) s += cards([["盤前讀的", "前一天收盤的資料"], ["夜盤", "價格可能已經移動很多"], ["22:30 後", "重看價格在 Flip 哪一邊"], ["線", "不會跟著夜盤動"]], t, { hl: 2 });
    else if (i === 9) {
      const X = (h) => lerp(80, 580, (h - 21) / 9);
      s += `<line x1="80" x2="580" y1="210" y2="210" class="s-ink" stroke-width="2"/>` + [21, 22.5, 24.5, 27, 30].map((h) => `<line x1="${X(h)}" x2="${X(h)}" y1="204" y2="216" class="s-ink"/><text x="${X(h)}" y="236" text-anchor="middle" class="t-mute">${String(Math.floor(h) % 24).padStart(2, "0")}:${h % 1 ? "30" : "00"}</text>`).join("");
      s += `<rect x="${X(22.5)}" y="150" width="${X(24.5) - X(22.5)}" height="50" rx="8" class="f-gamma-soft" opacity="${seg(t, 0, 0.4)}"/><text x="${(X(22.5) + X(24.5)) / 2}" y="181" text-anchor="middle" class="t-ink t-b" opacity="${seg(t, 0, 0.4)}">GEX＋訂單流</text>`;
      s += `<rect x="${X(24.5)}" y="150" width="${X(30) - X(24.5)}" height="50" rx="8" class="f-buy-soft" opacity="${seg(t, 0.4, 0.8)}"/><text x="${(X(24.5) + X(30)) / 2}" y="181" text-anchor="middle" class="t-ink t-b" opacity="${seg(t, 0.4, 0.8)}">只看訂單流</text>`;
      s += `<text x="320" y="100" text-anchor="middle" class="t-ink t-b">台灣時間（冬令）</text>` + chip(320, 300, "看盤印象，驗證中", "hl", seg(t, 0.7, 1));
    }
    else if (i === 10) s += matrix(1, 2) + chip(320, 350, "+900M、Flip 下方？", "hl");
    else s += matrix(1);
    svg.innerHTML = s;
  }
  const sim2 = `<div class="btn-row j2-pre"><button class="btn" data-p="real" type="button">負 GEX 例子（示意）</button><button class="btn" data-p="pos" type="button">正 GEX 例子（示意）</button><button class="btn" data-p="mix" type="button">混合例子（示意）</button></div>
<div class="dx-form"><label>淨 GEX（百萬）<input class="j2" data-k="ng" type="number" step="50" value="-1940"></label><label>NQ 現價<input class="j2" data-k="px" type="number" step="5" value="24985"></label><label>Flip<input class="j2" data-k="fl" type="number" step="5" value="25724"></label><label class="dx-chk"><input class="j2c" data-k="exp" type="checkbox" checked> 今天有到期</label><label class="dx-chk"><input class="j2c" data-k="ev" type="checkbox"> 今天有大事件</label></div>
<div class="j2-out"></div><ul class="sim-task j2-task"></ul>`;
  function mount2(box) {
    const q = (s) => box.querySelector(s), d = {};
    const P = { real: { ng: -1940, px: 24985, fl: 25724, exp: true, ev: false }, pos: { ng: 1200, px: 25630, fl: 25460, exp: false, ev: false }, mix: { ng: 900, px: 25380, fl: 25460, exp: false, ev: true } };
    function paint() {
      const v = {}; box.querySelectorAll(".j2").forEach((x) => { v[x.dataset.k] = +x.value || 0; }); box.querySelectorAll(".j2c").forEach((x) => { v[x.dataset.k] = x.checked; });
      const r = judge(v), plan = { A: ["目標：VWAP、POC（價值區中間）", "停損：較緊（例如 20～30 點）", "部位：正常"], B: ["目標：2 倍、4 倍風險，跟著移停損", "停損：放在回測高低點外（例如 30～40 點）", "部位：正常"], M: ["目標：保守，先到 TP1 就出大部分", "停損：照劇本放", "部位：減半"] }[r.k];
      q(".j2-out").innerHTML = `<div class="kpi-row"><div><span class="t1">今日劇本</span><b>${r.name}</b></div><div><span class="t1">價格 vs Flip</span><b>${v.px >= v.fl ? "上方 " : "下方 "}${fx(Math.abs(v.px - v.fl))} 點</b></div></div><ul>${plan.map((x) => `<li>${x}</li>`).join("")}${r.notes.map((x) => `<li>${x}</li>`).join("")}<li>方向：看價格在關鍵位接受還是拒絕，GEX 不決定方向。</li><li>時間：台灣 00:30（夏令 23:30）以後，這份環境判斷暫不採用，只看訂單流（驗證中）。</li></ul>`;
      if (r.k === "B") d.a = true; if (r.k === "A") d.b = true; if (r.k === "M") d.c = true;
      q(".j2-task").innerHTML = done3("a", d, "任務 1：載入負 GEX 例子，看今天的劇本") + done3("b", d, "任務 2：調出一個劇本 A 的組合") + done3("c", d, "任務 3：調出一個混合日（提示：讓兩個訊號矛盾，或淨 GEX 接近 0）");
    }
    q(".j2-pre").addEventListener("click", (e) => { const b = e.target.closest("[data-p]"); if (!b) return; const p = P[b.dataset.p]; box.querySelectorAll(".j2").forEach((x) => { x.value = p[x.dataset.k]; }); box.querySelectorAll(".j2c").forEach((x) => { x.checked = p[x.dataset.k]; }); paint(); });
    box.addEventListener("input", paint); box.addEventListener("change", paint); paint();
  }
  PAGES["learn-2"] = window.KIT.page(window.COURSE.SOP, "learn-2", {
    topic: "讀環境，定劇本",
    lede: "盤前只問四個問題：淨 GEX 正負、價格在 Flip 哪一邊、今天有沒有到期、有沒有大事件。答案決定今天用劇本 A、劇本 B，還是減半的混合日。",
    analogy: [["看天氣", "出門前看<b>下不下雨、有沒有颱風</b>，決定穿什麼，不決定去哪。"], ["兩個燈號", "淨 GEX 和 Flip 兩個燈<b>同色</b>才照劇本走；<b>不同色</b>就慢慢開。"], ["事件是紅燈", "數據公布前後 15 分鐘，<b>停下來等</b>。"]],
    steps: S2, draw: d2, simHTML: sim2, simMount: mount2,
    simIntro: "載入例子，或自己填數字，看今天的劇本和注意事項。",
    mist: [["負 GEX 就做空", "GEX 不說方向。負 GEX 只代表波動可能放大，方向要看價格接受或拒絕關鍵位。"], ["盤前讀一次就夠", "夜盤價格可能移動很多，開盤後要重看價格在 Flip 哪一邊。"], ["混合日就硬選一個劇本", "訊號矛盾時，少做、做小，等價格表態。"]],
    faq: [["Flip 用 QQQ 換算還是 NQ 原生？", "兩個可能差好幾百點（同一天 QQQ 換算和 NQ 原生算出來的 Flip 常常不一樣）。先固定用一種，長期記錄比較重要。"], ["淨 GEX 多少算「接近 0」？", "這裡用 ±200M 當示意。你可以等 20 天的資料出來，再依自己的統計調整。"], ["GammaLens 價格和 TradingView 不一致怎麼辦？", "以 TradingView 收盤重算距離，並把當天的位階可信度打折。"], ["事件很多的週要怎麼辦？", "每個事件前後都暫停。事件特別大（FOMC）的日子，可以整天當混合日。"], ["為什麼開盤兩小時後就不看 GEX？", "目前只是看盤印象，研究方向（Adams 等人：效果約一小時後消失）也支持。正在用 5 分 K 做時段測試，20 天後依結果決定要不要維持。"]],
    qs: [
      { fig: `<p class="small q-cap">淨 GEX +1.5B，價格在 Flip 上方 120 點，沒有到期、沒有事件。</p>`, q: "今天的劇本？", step: 2, o: [["劇本 A：震盪日", true, "正 GEX＋Flip 上方。"], ["劇本 B：趨勢日", false, "那是負 GEX＋Flip 下方。"], ["混合日", false, "兩個訊號一致，不是混合。"]] },
      { fig: `<p class="small q-cap">淨 GEX −80M。</p>`, q: "怎麼處理？", step: 3, o: [["接近 0，當混合日", true, "環境不明顯，不要硬套劇本。"], ["負的，用劇本 B", false, "太接近 0，正負號很容易翻。"], ["不交易", false, "可以交易，只是部位減半、兩套都準備。"]] },
      { fig: `<p class="small q-cap">今晚 21:30 公布 CPI，你判定是劇本 B。</p>`, q: "盤中要特別注意什麼？", step: 5, o: [["公布前後 15 分鐘不進場，公布後重看價格在 Flip 哪一邊", true, "事件可能改變 GEX 的前提。"], ["CPI 公布那一刻馬上順勢進場", false, "那段時間點差大、方向亂，最容易被掃。"], ["事件跟 GEX 無關，照常交易", false, "事件會讓 IV 大變，影響市商的對沖。"]] }],
    gloss: [["劇本 A", "正 GEX＋Flip 上方：震盪日，邊緣做反轉。"], ["劇本 B", "負 GEX＋Flip 下方：趨勢日，順勢做回測。"], ["混合日", "訊號矛盾或淨 GEX 接近 0：兩套準備、部位減半。"], ["重讀", "開盤後用現在的價格重新比對 Flip。"]],
    remember: "<b>四個問題 → 劇本。</b>正＋上方＝A，負＋下方＝B，不一致或接近 0＝混合。環境只調整打法，不決定方向。"
  });

  /* ================= 第 3 關：畫關鍵位 ================= */
  const LV = [["PDH", "前日高", 27240], ["VAH", "前日 VAH", 27180], ["ONH", "隔夜高", 27172], ["POC", "前日 POC", 27100], ["VAL", "前日 VAL", 27020], ["ONL", "隔夜低", 27012], ["PDL", "前日低", 26880]];
  function zonesOf(lv, th) {
    const a = lv.slice().sort((x, y) => y[2] - x[2]), Z = [];
    a.forEach((l) => { const z = Z[Z.length - 1]; if (z && z.lo - l[2] <= th) { z.lo = l[2]; z.m.push(l); } else Z.push({ hi: l[2], lo: l[2], m: [l] }); });
    return Z;
  }
  function ladderPic(lv, t, o = {}) {
    const Y = (p) => lerp(330, 50, (p - 26850) / 420);
    let s = `<line x1="300" x2="300" y1="40" y2="340" class="s-line"/>`;
    if (o.zones) zonesOf(lv, o.th || 12).forEach((z) => { const strong = z.m.length >= 2; if (strong) s += `<rect x="168" y="${Y(z.hi) - 8}" width="264" height="${Y(z.lo) - Y(z.hi) + 16}" rx="6" class="f-hl" opacity="0.3"/><text x="300" y="${Y(z.hi) - 13}" text-anchor="middle" class="t-gamma t-b">強區（${z.m.length} 條重疊）</text>`; });
    lv.forEach(([k, lab, p], j) => { const op = o.n == null ? 1 : j < o.n ? (j === o.n - 1 ? seg(t, 0, 0.6) : 1) : 0;
      const cls = k === "POC" ? "s-gamma" : k.startsWith("VA") ? "s-sell" : k.startsWith("ON") ? "s-buy" : "s-ink";
      s += `<g opacity="${op}"><line x1="170" x2="430" y1="${Y(p)}" y2="${Y(p)}" class="${cls}" stroke-width="2"/><text x="${k.startsWith("ON") ? 436 : 164}" y="${Y(p) + 4}" text-anchor="${k.startsWith("ON") ? "start" : "end"}" class="${cls.replace("s-", "t-")} t-b">${lab} ${fx(p)}</text></g>`; });
    if (o.gex) s += `<g opacity="${seg(t, 0.3, 0.8)}"><line x1="170" x2="430" y1="${Y(26960)}" y2="${Y(26960)}" class="s-line" stroke-dasharray="2 6" stroke-width="2"/><text x="436" y="${Y(26960) + 4}" class="t-mute">GEX 線（淡，只當背景）</text></g>`;
    return s;
  }
  const S3 = [
    { cap: "先說為什麼關鍵位<b>不用 GEX 牆</b>：一次 5 天的安慰劑測試裡，NQ 高低收到真實位階平均 <b>72.8 點</b>，位階隨便平移後是 <b>74.2 點</b>，8 次有 4 次平移的不輸真實的。",
      why: "也就是說，目前沒有證據顯示 GEX 位階比亂畫的線更準。樣本還小，不能說它沒用，但不能拿來當主要的觸碰點。", stuck: "如果一張地圖上的路口，跟隨便畫的線一樣準，你不會靠它轉彎。" },
    { cap: "第一組：<b>前一天的價值區</b>。VAH、POC、VAL（路線 1 第 7 關）。這是昨天 70% 成交發生的地方，今天的價格常常會回來測試它的邊緣。",
      why: "價值區邊緣是劇本 A 做反轉、劇本 B 看接受或拒絕的地方。", dur: 3000 },
    { cap: "第二組：<b>前日高、前日低</b>。很多人的停損就放在這些地方外面，價格碰到常會加速或反轉。",
      why: "前日高低是最多人看得到的位置，也是流動性集中的地方。", dur: 2000 },
    { cap: "第三組：<b>隔夜高、隔夜低</b>（亞洲加歐洲時段的高低點，路線 1 第 10 關）。美股開盤後，價格常常先去測試它們。",
      why: "隔夜時段量比較少，高低點代表那段時間的邊界。開盤後大資金進場，常會先試探這些邊界。", dur: 2400 },
    { cap: "第四個是<b>VWAP</b>（路線 1 第 8 關）：盤中才有、會一直移動。不畫在盤前的梯子上，盤中當作劇本 A 的第一個目標、劇本 B 的趨勢參考。",
      why: "VWAP 是今天大家的平均成本。價格在 VWAP 上方，買方平均是賺的；下方，平均是賠的。" },
    { cap: "把<b>靠很近的線合併成一個區域</b>：例如 VAH 27,180 和隔夜高 27,172 只差 8 點，合成一個區；重疊越多條，這個區越強。",
      why: "NQ 一根 5 分 K 常常就走 20 點，差幾點的兩條線沒有必要分開看。合併後梯子會乾淨很多。", dur: 3000 },
    { cap: "想一想：梯子上有三個區域。",
      q: { t: "哪一個區域最值得盯？", o: [
        ["VAL 27,020 和隔夜低 27,012 重疊的區域", true, "兩條不同來源的線重疊，代表很多人都在看這裡。另一個強區是 VAH＋隔夜高。"],
        ["只有 POC 27,100 一條線的地方", false, "POC 是目標，不是邊緣，而且只有一條。"],
        ["兩個區域的正中間", false, "中間沒有任何線，價格到那裡沒有理由反應。"]] } },
    { cap: "一天只留 <b>3～5 個區域</b>。線越多，就等於到處都是關鍵位，到最後什麼都不是。",
      why: "留下強區（重疊多）和最近的區。太遠的（例如離現價 500 點）今天不太可能到，先不畫。" },
    { cap: "GEX 線可以畫，但要<b>畫淡一點，只當背景</b>，而且<b>只在開盤後兩小時參考</b>：例如「這裡是大負值節點，突破後可能延伸」。等 20 天紀錄和時段測試有結論，再決定要不要升級。",
      why: "觀察計畫已經寫好規則：20 天後安慰劑測試仍沒有優勢，就不再把位階當觸碰點。" },
    { cap: "想一想：你盤前畫了 12 條線，每條都覺得重要。",
      q: { t: "應該怎麼做？", o: [
        ["合併靠近的線，只留 3～5 個區域", true, "少而清楚的區域，盤中才知道該盯哪裡。"],
        ["全部留著，多總比少好", false, "線太多，價格隨時都在某條線附近，等於沒有過濾。"],
        ["只留 GEX 牆", false, "GEX 牆目前沒有證據比隨機準。"]] } },
    { cap: "整理：關鍵位來自<b>前日價值區、前日高低、隔夜高低</b>，盤中加上 <b>VWAP</b>。合併靠近的線、留 3～5 個區域；GEX 線畫淡當背景。",
      why: "下一關開始實戰：價格到了這些區域，K 線和 footprint 要怎麼看。" }
  ];
  function d3(svg, i, t) {
    let s = "";
    if (i === 0) { const B = (x, v, lab, cls, k) => { const h = v * 2.6 * ease(seg(t, k * 0.3, k * 0.3 + 0.4)); return `<rect x="${x}" y="${310 - h}" width="120" height="${h}" rx="6" class="${cls}"/><text x="${x + 60}" y="${300 - h}" text-anchor="middle" class="t-ink t-b">${v} 點</text><text x="${x + 60}" y="336" text-anchor="middle" class="t-ink t-b">${lab}</text>`; };
      s += `<line x1="120" x2="520" y1="310" y2="310" class="s-ink"/><text x="120" y="50" class="t-mute">高低收到最近位階的平均距離（NQ，11/9 週）</text>` + B(170, 72.8, "真實位階", "f-gamma-soft", 0) + B(350, 74.2, "隨便平移後", "f-surface s-line", 1) + `<text x="320" y="90" text-anchor="middle" class="t-sell t-b" opacity="${seg(t, 0.8, 1)}">幾乎一樣</text>`; }
    else if (i === 1) s += ladderPic(LV.filter((l) => ["VAH", "POC", "VAL"].includes(l[0])), t);
    else if (i === 2) s += ladderPic(LV.filter((l) => ["VAH", "POC", "VAL", "PDH", "PDL"].includes(l[0])), t);
    else if (i === 3 || i === 4) s += ladderPic(LV, t) + (i === 4 ? `<path d="M170 ${lerp(330, 50, (27090 - 26850) / 420)} C 250 ${lerp(330, 50, (27060 - 26850) / 420)}, 330 ${lerp(330, 50, (27130 - 26850) / 420)}, 430 ${lerp(330, 50, (27110 - 26850) / 420)}" class="s-buy f-none" stroke-width="3" stroke-dasharray="6 4" opacity="${seg(t, 0.3, 0.8)}"/><text x="300" y="${lerp(330, 50, (27140 - 26850) / 420)}" text-anchor="middle" class="t-buy t-b" opacity="${seg(t, 0.5, 1)}">VWAP：盤中才有、會移動</text>` : "");
    else if (i === 5 || i === 6) s += ladderPic(LV, t, { zones: true }) + (i === 6 ? chip(300, 360, "哪一區最值得盯？", "hl") : "");
    else if (i === 7) s += ladderPic(LV, 1, { zones: true }) + `<text x="300" y="30" text-anchor="middle" class="t-ink t-b">3～5 個區域就好</text>`;
    else if (i === 8) s += ladderPic(LV, t, { zones: true, gex: true });
    else if (i === 9) { const Y = (k) => 50 + k * 24; for (let k = 0; k < 12; k++) s += `<line x1="170" x2="430" y1="${Y(k)}" y2="${Y(k)}" class="${["s-ink", "s-sell", "s-buy", "s-gamma"][k % 4]}" stroke-width="2"/>`; s += chip(300, 350, "12 條線怎麼辦？", "hl"); }
    else s += cards([["前日價值區", "VAH、POC、VAL"], ["前日高低", "流動性集中的地方"], ["隔夜高低", "開盤後常先測試"], ["VWAP", "盤中才有，當目標和參考"], ["合併", "3～5 個區域；GEX 線畫淡"]], t, { hl: 4 });
    svg.innerHTML = s;
  }
  const sim3 = `<div class="dx-form">${LV.map(([k, lab, p]) => `<label>${lab}<input class="z3" data-k="${k}" type="number" step="1" value="${p}"></label>`).join("")}</div><div class="controls"><div class="ctl"><label>多近就合併 <b class="z3-th-v"></b></label><input class="z3-th" type="range" min="0" max="40" step="2" value="12"></div></div><svg class="fpx z3-svg" viewBox="0 0 640 380" role="img" aria-label="關鍵位梯子"></svg><div class="z3-out"></div><ul class="sim-task z3-task"></ul>`;
  function mount3(box) {
    const q = (s) => box.querySelector(s), d = {};
    function paint() {
      const lv = LV.map(([k, lab]) => [k, lab, +box.querySelector(`.z3[data-k="${k}"]`).value || 0]), th = +q(".z3-th").value;
      q(".z3-th-v").textContent = th + " 點";
      q(".z3-svg").innerHTML = ladderPic(lv, 1, { zones: true, th });
      const Z = zonesOf(lv, th);
      q(".z3-out").innerHTML = `<p>合併後共 <b>${Z.length}</b> 個區域，其中重疊 2 條以上的強區 <b>${Z.filter((z) => z.m.length >= 2).length}</b> 個：${Z.filter((z) => z.m.length >= 2).map((z) => `${fx(z.lo)}～${fx(z.hi)}（${z.m.map((m) => m[1]).join("＋")}）`).join("、") || "沒有"}。</p>`;
      if (Z.length <= 5) d.a = true; if (th === 0) d.b = true; if (Z.some((z) => z.m.length >= 3)) d.c = true;
      q(".z3-task").innerHTML = done3("a", d, "任務 1：調整合併距離，讓區域剩 5 個以下") + done3("b", d, "任務 2：把合併距離拉到 0，看梯子變多亂") + done3("c", d, "任務 3：改數字，做出一個 3 條線重疊的超強區");
    }
    box.addEventListener("input", paint); paint();
  }
  PAGES["learn-3"] = window.KIT.page(window.COURSE.SOP, "learn-3", {
    topic: "畫關鍵位",
    lede: "盤中要盯的地方，盤前就畫好：前一天的價值區、前日高低、隔夜高低，盤中再加上 VWAP。靠近的線合併成區域，一天只留 3～5 個。",
    analogy: [["路口", "關鍵位是<b>路口</b>：只有在路口才需要決定轉不轉彎。"], ["重疊的路標", "兩個不同的路標指向同一個地方，<b>那裡一定很重要</b>。"], ["整理桌面", "線太多像<b>亂掉的桌面</b>，找不到真正要用的東西。"]],
    steps: S3, draw: d3, simHTML: sim3, simMount: mount3,
    simIntro: "改關鍵位的數字和合併距離，看梯子上會剩幾個區域、哪些是強區。",
    mist: [["GEX 牆是最重要的關鍵位", "安慰劑測試目前不支持。GEX 線畫淡當背景就好。"], ["線越多越保險", "線太多等於沒有過濾，價格隨時都在某條線附近。"], ["關鍵位是一條精確的線", "是一個區域。NQ 波動大，差幾點的線合併看就好。"]],
    faq: [["價值區用哪個時段算？", "常見做法是用美股正規時段（RTH）。固定一種就好，不要每天換。"], ["隔夜高低怎麼找？", "美股收盤後到隔天開盤前的最高價、最低價，多數看盤軟體可以畫時段高低。"], ["合併距離要設多少？", "示意用 12 點。波動很大的日子可以放寬，也可以用前一天振幅的某個比例。"], ["前幾天的價值區要不要畫？", "可以留一兩個離現價近、沒被測試過的，但總數還是控制在 5 個以內。"]],
    qs: [
      { fig: `<p class="small q-cap">VAH 27,180、隔夜高 27,175、前日高 27,240。</p>`, q: "合併距離 12 點時，會有幾個區域？", step: 6, o: [["2 個：27,175～27,180 一區，27,240 一區", true, "VAH 和隔夜高差 5 點，合成一區；前日高差 60 點，獨立一區。"], ["3 個，每條線一區", false, "差 5 點的兩條線應該合併。"], ["1 個，全部合成一區", false, "前日高離得太遠。"]] },
      { fig: `<p class="small q-cap">前日 POC 和 VWAP 都在 27,100 附近。</p>`, q: "在劇本 A 裡，這個位置通常用來做什麼？", step: 5, o: [["當目標：價格回到價值區中間", true, "POC、VWAP 是中間，劇本 A 的目標。"], ["當進場的邊緣", false, "邊緣是 VAH、VAL。"], ["當停損", false, "停損放在進場理由失效的地方，不是中間。"]] },
      { fig: `<p class="small q-cap">GEX 紀錄裡有一個大負值節點，剛好不在任何價值區或高低點附近。</p>`, q: "怎麼處理比較好？", step: 9, o: [["畫淡一點當背景，不當觸碰點", true, "等 20 天的統計有結論，再決定要不要升級。"], ["當成今天最重要的關鍵位", false, "目前沒有證據顯示位階比隨機準。"], ["完全不能看", false, "可以當背景參考，例如突破後是否延伸。"]] }],
    gloss: [["前日價值區", "前一天 70% 成交量所在的價格範圍：VAH 到 VAL。"], ["隔夜高低", "美股收盤後到隔天開盤前的最高價、最低價。"], ["強區", "兩條以上不同來源的關鍵位重疊的區域。"], ["安慰劑測試", "把位階隨便平移，看準確度有沒有變差，用來檢查位階是不是真的有用。"]],
    remember: "<b>前日價值區＋前日高低＋隔夜高低，盤中加 VWAP。</b>合併成 3～5 個區域；GEX 線畫淡當背景。"
  });

  /* ================= 第 6 關：風控隨環境調整 ================= */
  const RISK = 250, PV = { NQ: 20, MNQ: 2 };
  const qty = (risk, stop, pv) => Math.floor(risk / (stop * pv));
  const S6 = [
    { cap: "風控的第一條：<b>每筆固定風險金額，不是固定口數</b>。例如帳戶 5 萬美元，每筆最多虧 <b>$" + RISK + "</b>（0.5%）。",
      why: "停損寬的時候少下幾口、窄的時候多下幾口，每筆虧損都一樣大。這樣連虧幾筆也不會傷筋動骨。", stuck: "像每次出門只帶固定的零用錢，不管去哪裡，最多就花這麼多。" },
    { cap: "公式：<b>口數 ＝ 風險金額 ÷（停損點數 × 每點價值）</b>。劇本 A 的例子停損 26 點，MNQ 每點 $2：250 ÷（26 × 2）＝ <b>" + qty(RISK, 26, 2) + " 口</b>（無條件捨去）。",
      why: "NQ 每點 $20，26 點停損一口就要 $520，超過 $250，所以這個帳戶規模只能用 MNQ（微型，每點 $2）。", dur: 2600 },
    { cap: "劇本 B 的例子停損 37 點：250 ÷（37 × 2）＝ <b>" + qty(RISK, 37, 2) + " 口</b>。停損比較寬，口數就少一點，但虧損上限一樣是 $250。",
      why: "趨勢日停損通常比較寬（放在回測高低點外），但目標也遠很多，風報比反而更好。", dur: 2400 },
    { cap: "換你算：風險 $300，停損 20 點，用 MNQ。",
      q: { t: "可以下幾口？", o: [
        ["7 口", true, "300 ÷（20 × 2）＝ 7.5，無條件捨去是 7 口。"],
        ["8 口", false, "要無條件捨去，8 口會虧到 $320，超過上限。"],
        ["15 口", false, "忘了乘每點 $2。"]] } },
    { cap: "環境調整的是<b>目標和停損距離</b>：劇本 A 目標近（約 2 倍風險）、停損緊；劇本 B 目標遠（2 倍出一半、剩下跟著移停損）；混合日<b>部位減半</b>。",
      why: "每筆風險金額不變，變的是打法。這樣環境判斷就算錯了，傷害也有限。", dur: 3000 },
    { cap: "<b>事件日、到期日</b>：事件前後 15 分鐘不進場；FOMC 這種大事件的日子，或你覺得看不懂的日子，整天部位減半。",
      why: "這些時候點差變大、方向亂，停損很容易被掃到超過預期。" },
    { cap: "<b>每日最大虧損</b>：例如連虧 3 筆或虧到 $750，今天就停。連虧 2 筆先休息 30 分鐘。",
      why: "連續虧損後最容易報復性交易（路線 1 第 15 關）。規則要在冷靜的時候定好，盤中照做。" },
    { cap: "想一想：今天是混合日，原本劇本 A 算出來可以下 4 口 MNQ。",
      q: { t: "實際應該下幾口？", o: [
        ["2 口（減半）", true, "混合日訊號矛盾，部位減半。"],
        ["4 口，照公式", false, "公式是正常日的口數，混合日要再減半。"],
        ["8 口，機會難得", false, "訊號矛盾時加碼，是最危險的做法。"]] } },
    { cap: "如果你用自營商（prop）帳戶，<b>自己的每日停損要比公司的規定更嚴</b>。例如公司每日虧損上限 $1,000，自己設 $750。",
      why: "留一段緩衝，避免一筆滑價就碰到公司的線、帳戶直接失效。" },
    { cap: "整理：<b>每筆固定風險金額</b>，口數由停損距離算出來；環境調整目標和停損距離，混合日、事件日部位減半；每日虧損到上限就停。",
      why: "下面的練習區是口數計算機：輸入停損和風險金額，加上環境和事件，看可以下幾口。" }
  ];
  function d6(svg, i, t) {
    let s = "";
    if (i === 0) s += cards([["帳戶", "$50,000"], ["每筆風險", "0.5% ＝ $250"], ["停損寬", "少下幾口"], ["停損窄", "多下幾口"]], t, { hl: 1 });
    else if (i >= 1 && i <= 3) {
      const st = i === 2 ? 37 : i === 3 ? 20 : 26, rk = i === 3 ? 300 : RISK;
      const T = [["風險金額", "$" + rk], ["÷ 停損", st + " 點"], ["× 每點", "$2（MNQ）"], ["＝ 口數", i === 3 ? "？" : qty(rk, st, 2) + " 口"]];
      T.forEach(([a, b], k) => { const x = 40 + k * 145, op = i === 3 ? 1 : seg(t, k * 0.2, k * 0.2 + 0.25);
        s += `<g opacity="${op}"><rect x="${x}" y="130" width="130" height="100" rx="12" class="${k === 3 ? "f-gamma-soft" : "f-surface s-line"}"/><text x="${x + 65}" y="170" text-anchor="middle" class="t-mute">${a}</text><text x="${x + 65}" y="204" text-anchor="middle" class="t-ink t-b t-lg">${b}</text></g>`; });
      s += `<text x="40" y="100" class="t-ink t-b">${i === 1 ? "劇本 A 的例子" : i === 2 ? "劇本 B 的例子" : "換你算"}</text>`;
      if (i === 1) s += `<text x="40" y="290" class="t-mute" opacity="${seg(t, 0.8, 1)}">NQ 每點 $20：26 點一口就要 $520，超過 $250 → 用 MNQ</text>`;
    } else if (i === 4) s += cards([["劇本 A", "目標約 2 倍，停損緊"], ["劇本 B", "2 倍出一半，剩下移停損"], ["混合日", "部位減半"], ["不變的", "每筆風險金額"]], t, { hl: 3 });
    else if (i === 5) s += cards([["事件前後 15 分", "不進場"], ["FOMC 日", "整天部位減半"], ["看不懂的日子", "部位減半或不做"], ["原因", "點差大、方向亂"]], t, { hl: 0 });
    else if (i === 6) { for (let k = 0; k < 3; k++) s += `<rect x="${110 + k * 150}" y="${140}" width="120" height="90" rx="12" class="f-sell-soft" opacity="${seg(t, k * 0.25, k * 0.25 + 0.2)}"/><text x="${170 + k * 150}" y="192" text-anchor="middle" class="t-sell t-b" opacity="${seg(t, k * 0.25, k * 0.25 + 0.2)}">−$250</text>`; s += `<text x="320" y="290" text-anchor="middle" class="t-ink t-b t-lg" opacity="${seg(t, 0.8, 1)}">−$750：今天停</text>`; }
    else if (i === 7) s += cards([["混合日", "訊號矛盾"], ["正常口數", "4 口 MNQ"], ["實際", "？"]], 1, { hl: 2 });
    else if (i === 8) { const W = (x, v, lab, cls) => `<rect x="${x}" y="${310 - v / 5}" width="120" height="${v / 5}" rx="6" class="${cls}"/><text x="${x + 60}" y="${300 - v / 5}" text-anchor="middle" class="t-ink t-b">$${v}</text><text x="${x + 60}" y="336" text-anchor="middle" class="t-ink t-b">${lab}</text>`; s += `<line x1="140" x2="500" y1="310" y2="310" class="s-ink"/>` + W(180, 1000, "公司上限", "f-sell-soft") + W(360, 750, "自己的上限", "f-gamma-soft"); }
    else s += cards([["固定風險", "每筆 $ 一樣"], ["口數", "風險 ÷（停損 × 每點價值）"], ["環境", "調整目標和停損距離"], ["減半", "混合日、事件日"], ["每日上限", "到了就停"]], t, { hl: 1 });
    svg.innerHTML = s;
  }
  const sim6 = `<div class="dx-form"><label>每筆風險（美元）<input class="r6" data-k="rk" type="number" step="10" value="250"></label><label>停損（點）<input class="r6" data-k="st" type="number" step="1" value="26"></label><label>商品<select class="r6s" data-k="ins"><option value="MNQ">MNQ（每點 $2）</option><option value="NQ">NQ（每點 $20）</option></select></label><label>劇本<select class="r6s" data-k="sc"><option value="A">劇本 A</option><option value="B">劇本 B</option><option value="M">混合日</option></select></label><label class="dx-chk"><input class="r6c" data-k="ev" type="checkbox"> 事件日／看不懂的日子</label></div><div class="r6-out kpi-row"></div><div class="r6-note"></div><ul class="sim-task r6-task"></ul>`;
  function mount6(box) {
    const q = (s) => box.querySelector(s), d = {};
    function paint() {
      const v = {}; box.querySelectorAll(".r6").forEach((x) => { v[x.dataset.k] = +x.value || 0; }); box.querySelectorAll(".r6s").forEach((x) => { v[x.dataset.k] = x.value; }); v.ev = q(".r6c").checked;
      const base = qty(v.rk, Math.max(1, v.st), PV[v.ins]), half = v.sc === "M" || v.ev, n = half ? Math.floor(base / 2) : base;
      const tp = v.sc === "B" ? [2, 4] : [2, 2.4];
      q(".r6-out").innerHTML = `<div><span class="t1">公式口數</span><b>${base}</b></div><div><span class="t1">實際口數</span><b>${n}${half ? "（減半）" : ""}</b></div><div><span class="t1">實際最大虧損</span><b>$${fx(n * v.st * PV[v.ins])}</b></div><div><span class="t1">TP1／TP2 距離</span><b>${Math.round(v.st * tp[0])}／${Math.round(v.st * tp[1])} 點</b></div>`;
      q(".r6-note").innerHTML = n === 0 ? `<p><b class="bad">一口都不能下：</b>停損太寬或商品太大。換 MNQ、縮小停損，或今天不做。</p>` : "";
      if (v.ins === "NQ" && n === 0) d.a = true; if (v.sc === "B" && n > 0) d.b = true; if (half && n > 0) d.c = true;
      q(".r6-task").innerHTML = done3("a", d, "任務 1：切到 NQ，看 $250 風險能不能下") + done3("b", d, "任務 2：選劇本 B、停損改 37 點，看口數和目標") + done3("c", d, "任務 3：選混合日或勾事件日，看口數怎麼變");
    }
    box.addEventListener("input", paint); box.addEventListener("change", paint); paint();
  }
  PAGES["learn-6"] = window.KIT.page(window.COURSE.SOP, "learn-6", {
    topic: "風控隨環境調整",
    lede: "每筆交易虧多少，進場前就決定。口數由停損距離和風險金額算出來；環境只調整目標和停損的距離，混合日和事件日部位減半，每天虧到上限就停。",
    analogy: [["零用錢", "每次出門只帶<b>固定的零用錢</b>，去哪裡都一樣。"], ["換車", "路況差就<b>開小車</b>（MNQ、減半），不是把油門踩更大。"], ["保險絲", "每日上限是<b>保險絲</b>：燒了就斷電，保護整間房子。"]],
    steps: S6, draw: d6, simHTML: sim6, simMount: mount6,
    simIntro: "輸入每筆風險和停損距離，選劇本和商品，看可以下幾口、目標放多遠。",
    mist: [["每次都下固定口數", "停損寬窄不同，固定口數會讓每筆虧損大小差很多。"], ["趨勢日停損寬，所以風險比較大", "口數會跟著變少，每筆虧損一樣；目標更遠，風報比反而更好。"], ["連虧之後加碼凹回來", "這是報復性交易。到每日上限就停。"]],
    faq: [["0.5% 是固定的嗎？", "是示意。新手建議 0.25%～0.5%，穩定之後再調整，但不要超過 1%。"], ["口數算出來是小數怎麼辦？", "一律無條件捨去，寧可少一口。"], ["停損要用點數還是金額？", "先用點數決定「理由失效的位置」，再用金額算口數。不要倒過來為了口數去縮停損。"], ["分批出場要怎麼算？", "例如 4 口：TP1 出 2 口，剩 2 口停損移到進場價。最大虧損還是一開始算的那筆。"]],
    qs: [
      { fig: `<p class="small q-cap">風險 $200，停損 25 點，MNQ。</p>`, q: "可以下幾口？", step: 4, o: [["4 口", true, "200 ÷（25 × 2）＝ 4。"], ["8 口", false, "忘了乘每點 $2。"], ["0 口", false, "MNQ 可以下 4 口。"]] },
      { fig: `<p class="small q-cap">劇本 B，停損 40 點，比劇本 A 的 20 點寬一倍。</p>`, q: "每筆最大虧損會怎樣？", step: 3, o: [["一樣，因為口數會減半", true, "固定風險金額，停損寬就少下幾口。"], ["變成兩倍", false, "那是固定口數的做法。"], ["變成一半", false, "風險金額是固定的。"]] },
      { fig: `<p class="small q-cap">今天已經連虧 3 筆，共 $750，剛好看到一個很漂亮的觸發。</p>`, q: "應該？", step: 7, o: [["今天停，紀錄下來明天再說", true, "每日上限是盤前定好的規則，到了就停。"], ["做最後一筆，機會很好", false, "連虧後覺得「這筆很漂亮」，正是最容易出錯的時候。"], ["加倍口數把虧損賺回來", false, "報復性交易，可能一筆把帳戶打爆。"]] }],
    gloss: [["每筆風險金額", "這筆交易停損時最多虧多少錢，進場前決定。"], ["MNQ", "微型那斯達克期貨，每點 $2，是 NQ 的十分之一。"], ["部位減半", "混合日、事件日把口數砍一半。"], ["每日最大虧損", "當天虧到這個數字就停止交易。"]],
    remember: "<b>口數 ＝ 風險金額 ÷（停損點數 × 每點價值）。</b>環境調整目標和停損距離，混合日、事件日減半，每日上限到了就停。"
  });

  /* ================= 第 7 關：盤後復盤＋總演練 ================= */
  const S7 = [
    { cap: "盤後紀錄的目的只有一個：<b>累積證據</b>。不是寫日記，是讓 20 天後的你可以算出這套流程到底有沒有用。",
      why: "GEX 觀察計畫已經定了規則：先寫死定義，事後不改，累積 20 個交易日再下結論。路線 3 的紀錄沿用同一個精神。", stuck: "像做實驗：先寫好要量什麼，不能做完再決定。" },
    { cap: "每天固定記這些欄位：<b>環境</b>（淨 GEX、價格 vs Flip、到期、事件）、<b>劇本</b>、<b>實際振幅</b>，以及每筆交易的<b>進場時段、進出場、理由、結果（幾 R）、有沒有照做</b>。",
      why: "R 是用風險當單位：賺 2 倍風險就是 +2R，停損就是 −1R。用 R 記錄，不同口數、不同停損的交易才能比較。", dur: 3000 },
    { cap: "評估的是<b>流程</b>，不是單筆結果。四種情況：照做賺、照做賠、沒照做賺、沒照做賠。<b>最危險的是「沒照做卻賺錢」</b>。",
      why: "照做賠只是機率，正常。沒照做賺錢會讓你以為亂做也可以，下次就會用更大的部位亂做。", dur: 2800 },
    { cap: "想一想：今天唯一一筆交易賺了 +3R，但你是在價格還沒到關鍵位時就追進去的。",
      q: { t: "紀錄時要怎麼評？", o: [
        ["沒照做賺錢：要特別檢討，不能當成好交易", true, "結果好不代表做法對。這種交易最容易讓人下次犯更大的錯。"],
        ["好交易，賺了 3R", false, "沒照流程，賺錢只是運氣。"],
        ["不用記，反正賺了", false, "這正是最需要記下來的交易。"]] } },
    { cap: "用一個例子看看（示意數字）：前一天收盤淨 GEX <b>−1.35B</b> → 判定劇本 B。隔天 NQ 先漲到 26,318，美股開盤後一路跌到 24,916，振幅 <b>1,402 點</b>。",
      why: "環境判斷「波動大」對了；但方向一開始是往上。所以方向一定要看價格在關鍵位的行為，不能從 GEX 猜。", dur: 2800 },
    { cap: "對照當天的紀錄：預測寫的是「部分命中」，觸發線 25,274 跌破後續跌、備案劇本依序走完。這種「照實寫命中、部分命中、沒命中」的習慣，就是復盤的核心。",
      why: "只記準的，會高估自己；照實記，才知道哪裡有用。" },
    { cap: "每週用 <b>gex_review.py</b> 跑一次：淨 GEX 分組的振幅、Spearman 相關、安慰劑測試，以及新加的<b>時段測試</b>（開盤後 2 小時、美股其餘時段、非美股時段各自和平移位階比）。到 20 天時，依事先定好的規則決定。",
      why: "規則事先寫死，才能避免「看到想看的」。" },
    { cap: "想一想：20 天後，安慰劑測試仍然顯示 GEX 位階沒有比隨機準，但淨 GEX 和振幅的關係還不錯。",
      q: { t: "依照計畫應該怎麼做？", o: [
        ["不再把位階當觸碰點，只保留淨 GEX 的環境判斷", true, "這是觀察計畫裡事先寫好的規則，也正是路線 3 現在的設計。"],
        ["兩個都丟掉", false, "環境判斷的部分還有證據，可以保留。"],
        ["改用更多 GEX 位階", false, "位階沒有優勢，加更多只會更亂。"]] } },
    { cap: "整理：<b>每天記環境、劇本、振幅和每筆交易</b>；評估流程不評結果；每週跑統計，20 天依規則決定。路線 3 到這裡結束，下面是總演練。",
      why: "總演練有六個情境，每個都要先判斷劇本，再決定要不要進場。" }
  ];
  function d7(svg, i, t) {
    let s = "";
    if (i === 0) s += cards([["目的", "累積證據"], ["先定規則", "事後不改"], ["20 天", "再下結論"]], t, { hl: 0 });
    else if (i === 1) s += cards([["環境", "淨 GEX、Flip、到期、事件"], ["劇本", "A／B／混合"], ["實際振幅", "今天走了多少點"], ["交易", "時段、進出場、理由、幾 R"], ["照做了嗎", "是／否"]], t, { hl: 4 });
    else if (i === 2 || i === 3) {
      const Q = (x, y, a, b, cls, k) => `<g opacity="${i === 2 ? seg(t, k * 0.15, k * 0.15 + 0.3) : 1}"><rect x="${x}" y="${y}" width="220" height="110" rx="12" class="${cls}"/><text x="${x + 110}" y="${y + 48}" text-anchor="middle" class="${cls === "f-sell" ? "t-w" : "t-ink"} t-b t-lg">${a}</text><text x="${x + 110}" y="${y + 78}" text-anchor="middle" class="${cls === "f-sell" ? "t-w" : "t-mute"}">${b}</text></g>`;
      s += `<text x="220" y="70" text-anchor="middle" class="t-mute">賺錢</text><text x="450" y="70" text-anchor="middle" class="t-mute">賠錢</text><text x="96" y="145" text-anchor="end" class="t-gamma t-b">照做</text><text x="96" y="265" text-anchor="end" class="t-sell t-b">沒照做</text>` + Q(110, 90, "好", "繼續", "f-gamma-soft", 0) + Q(340, 90, "正常", "只是機率", "f-surface s-line", 1) + Q(110, 210, "最危險", "要特別檢討", "f-sell", 2) + Q(340, 210, "該改", "找出原因", "f-sell-soft", 3);
      if (i === 3) s += chip(320, 350, "+3R 但沒到位就追？", "hl");
    } else if (i === 4 || i === 5) {
      const Y = (p) => lerp(320, 60, (p - 24830) / 1550), X = (k) => lerp(90, 560, k);
      const P = [[0, 25654], [0.25, 25930], [0.4, 26318], [0.55, 25880], [0.7, 25430], [0.85, 25080], [0.95, 24916], [1, 24985]];
      const n = i === 4 ? Math.max(2, Math.round(ease(t) * P.length)) : P.length;
      s += [[25274, "觸發線 25,274", "s-sell"], [26318, "高 26,318", "s-line"], [24916, "低 24,916", "s-line"]].map(([p, lab, c]) => `<line x1="90" x2="560" y1="${Y(p)}" y2="${Y(p)}" class="${c}" stroke-dasharray="5 4"/><text x="560" y="${Y(p) - 6}" text-anchor="end" class="${c.replace("s-", "t-").replace("t-line", "t-mute")} t-b">${lab}</text>`).join("");
      s += `<polyline points="${P.slice(0, n).map(([k, p]) => X(k).toFixed(1) + "," + Y(p).toFixed(1)).join(" ")}" class="s-ink f-none" stroke-width="2.5"/><line x1="${X(0.4)}" x2="${X(0.4)}" y1="60" y2="320" class="s-line"/><text x="${X(0.4)}" y="340" text-anchor="middle" class="t-mute">美股開盤附近</text><text x="90" y="40" class="t-mute">NQ 示意走勢</text>`;
      if (i === 5) s += `<g opacity="${seg(t, 0.2, 0.6)}">${chip(250, 80, "環境：波動大 ✓", "buy")}${chip(250, 300, "方向：先上後下", "hl")}</g>`;
    } else if (i === 6 || i === 7) s += cards([["每週", "跑 gex_review.py"], ["分組", "淨 GEX vs 振幅"], ["安慰劑", "位階有沒有比隨機準"], ["時段", "開盤後 2 小時是否特別有效"], ["20 天", "依事先規則決定"]], i === 6 ? t : 1, { hl: 4 }) + (i === 7 ? chip(320, 360, "位階沒優勢、環境還不錯？", "hl") : "");
    else s += cards([["每天", "環境、劇本、振幅、交易"], ["評估", "流程，不是結果"], ["每週", "跑統計"], ["20 天", "依規則決定"]], t, { hl: 1 });
    svg.innerHTML = s;
  }
  const DRILL = [
    { t: "情境 1", d: "淨 GEX +1.3B、價格在 Flip 上方。價格碰到 VAH＋隔夜高的強區，出現長上影線、Delta +280 卻收黑；下一根跌破它的低點，Delta −900。", a: "A", why: "正 GEX＋Flip 上方是劇本 A；到位、吸收、觸發都有。目標 VWAP、POC。" },
    { t: "情境 2", d: "淨 GEX −1.6B、價格在 Flip 下方。開盤在 VAL 下方，往上碰 VAL 被打回、最高那格幾乎沒人買；之後一根大黑 K 跌破，接著出現沒量的回測，回測後又一根黑 K 收在回測 K 線中間以下。", a: "B", why: "劇本 B：拒絕 → 接受 → 沒量回測 → 觸發。目標放遠。" },
    { t: "情境 3", d: "淨 GEX −1.2B、價格在 Flip 下方。22:45 價格在 POC 和 VAL 中間，出現一根很大的黑 K。", a: "N", why: "不在關鍵位，不看 footprint，不做。" },
    { t: "情境 4", d: "淨 GEX +800M，但開盤時價格在 Flip 下方 60 點。價格碰到 VAL，出現吸收和觸發。", a: "M", why: "混合日：可以照劇本 A 做，但部位減半。" },
    { t: "情境 5", d: "淨 GEX +1.1B、Flip 上方。22:58，價格碰到 VAH，出現漂亮的吸收 K 線。23:00 要公布數據。", a: "N", why: "事件前後 15 分鐘不進場，再漂亮也等。" },
    { t: "情境 6", d: "淨 GEX −1.4B、Flip 下方。價格開在 VAL 下方，第一根就大陽線收回 VAL 上方，Delta +700，下一根也守在價值區裡。", a: "N2", why: "市場接受回到價值區，劇本 B 的「接受下方」沒有成立，不空。若要做，改用劇本 A 的思路看 POC，而且混合處理。" }];
  const sim7 = `<div class="tabs dr7-tabs">${DRILL.map((x, k) => `<button class="tab" data-k="${k}" aria-selected="${k === 0}" type="button">${x.t}</button>`).join("")}</div><div class="dr7-card"></div><ul class="sim-task dr7-task"></ul>`;
  function mount7(box) {
    const q = (s) => box.querySelector(s); let k = 0; const ok = new Set();
    const OPT = [["A", "劇本 A，正常部位進場"], ["B", "劇本 B，正常部位進場"], ["M", "照劇本進場，但部位減半"], ["N", "不做"], ["N2", "不照原劇本做（劇本失效）"]];
    function paint(fb) {
      const x = DRILL[k];
      q(".dr7-card").innerHTML = `<h4>${x.t}</h4><p>${x.d}</p><div class="q-opts">${OPT.map(([v, l]) => `<button class="q-opt" type="button" data-v="${v}">${l}</button>`).join("")}</div><div aria-live="polite">${fb || ""}</div>`;
      q(".dr7-task").innerHTML = DRILL.map((d, j) => `<li class="${ok.has(j) ? "ok" : ""}">${ok.has(j) ? "✓" : "○"} ${d.t}</li>`).join("");
    }
    box.addEventListener("click", (e) => {
      const tb = e.target.closest(".dr7-tabs .tab"); if (tb) { k = +tb.dataset.k; box.querySelectorAll(".dr7-tabs .tab").forEach((b) => b.setAttribute("aria-selected", String(b === tb))); paint(); return; }
      const o = e.target.closest(".dr7-card .q-opt"); if (!o) return;
      const x = DRILL[k], right = o.dataset.v === x.a; if (right) ok.add(k);
      paint(`<p><b class="${right ? "ok" : "bad"}">${right ? "對。" : "再想想。"}</b>${right ? x.why : ""}</p>`);
      box.querySelectorAll(".dr7-card .q-opt").forEach((b) => { if (b.dataset.v === o.dataset.v) b.classList.add(right ? "ok" : "bad"); });
    });
    paint();
  }
  PAGES["learn-7"] = window.KIT.page(window.COURSE.SOP, "learn-7", {
    topic: "盤後復盤與總演練",
    lede: "每天收盤後花十分鐘紀錄：環境、劇本、實際振幅、每筆交易有沒有照做。評估流程，不評單筆結果；累積 20 天，再依事先定好的規則決定哪些要留。最後是六個情境的總演練。",
    analogy: [["實驗紀錄", "先寫好<b>要量什麼</b>，做完照實記，不能事後改。"], ["教練看錄影", "比賽贏了也要看錄影：<b>贏的方式對不對</b>。"], ["存錢筒", "每天一筆紀錄像<b>投一枚硬幣</b>，存夠了才看得出結果。"]],
    steps: S7, draw: d7, simHTML: sim7, simMount: mount7,
    simIntro: "六個情境，每個先判斷劇本，再決定要不要進場、部位多大。",
    mist: [["賺錢的交易就是好交易", "沒照流程賺錢最危險，會讓你下次用更大的部位亂做。"], ["紀錄只記交易", "沒交易的日子也要記環境和振幅，那是驗證環境判斷的資料。"], ["看幾天覺得有效就加碼", "樣本太少很容易是巧合。照計畫累積 20 天。"]],
    faq: [["紀錄要用什麼工具？", "試算表就夠。欄位固定、每天填，比工具漂亮重要。"], ["R 怎麼算？", "賺賠點數 ÷ 停損點數。停損 26 點、賺 52 點就是 +2R。"], ["20 天後如果都沒用呢？", "那就只用路線 1 的訂單流流程，不切換劇本。路線 3 的設計本來就讓它可以這樣運作。"], ["一定要寫沒交易的日子嗎？", "要。環境判斷要看的是每天的振幅，不只有交易的日子。"]],
    qs: [
      { fig: `<p class="small q-cap">停損 30 點，結果賺了 75 點。</p>`, q: "這筆是幾 R？", step: 2, o: [["+2.5R", true, "75 ÷ 30 ＝ 2.5。"], ["+75R", false, "R 是用停損當單位。"], ["+0.4R", false, "倒過來除了。"]] },
      { fig: `<p class="small q-cap">照劇本做，停損出場 −1R。</p>`, q: "怎麼評這筆交易？", step: 3, o: [["照做賠：正常，只是機率", true, "流程對，結果交給長期的統計。"], ["壞交易，要改劇本", false, "一筆虧損不能說明劇本錯。"], ["不用記", false, "照做賠的交易也是重要的資料。"]] },
      { fig: `<p class="small q-cap">某天淨 GEX 很負、判定劇本 B，但價格一開始往反方向大漲。</p>`, q: "這說明什麼？", step: 5, o: [["GEX 說的是波動，不是方向；方向要看價格在關鍵位的行為", true, "11/19 就是這樣：振幅很大，但先上後下。"], ["GEX 完全沒用", false, "波動大的部分是對的，一天不能下結論。"], ["應該更相信 GEX 的方向", false, "GEX 本來就不說方向。"]] }],
    gloss: [["R", "用這筆交易的風險當單位：賺 2 倍風險是 +2R，停損是 −1R。"], ["復盤", "盤後回頭檢查今天的判斷和執行。"], ["流程評估", "看有沒有照規則做，而不是只看賺賠。"], ["20 天規則", "觀察計畫裡事先定好的結論門檻。"]],
    remember: "<b>每天記環境、劇本、振幅和每筆交易；評估流程不評結果；20 天依規則決定。</b>"
  });
})();
