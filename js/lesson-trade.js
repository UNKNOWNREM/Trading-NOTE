/* 路線 1 第 14 關（新版）：一筆完整交易——從盤前到出場的重播 */
(function () {
  const PAGES = (window.__PAGES = window.__PAGES || {});
  const { chip, lerp, ease, seg, cards, fpMini } = window.KIT;
  // 筆記的虛構交易：MES（每點 $5），帳戶 $10,000，單筆風險 1%
  const Y = (p) => lerp(340, 40, (p - 4984) / 26);
  const LV = { poc: 5000, vah: 5010, val: 4990 };
  const PRE = [[70, 5004], [100, 5006], [130, 5003], [160, 5001], [190, 4998], [220, 4996], [250, 4994], [280, 4992], [310, 4990.5], [335, 4989.3], [360, 4991]];
  const OUT = {
    a: [[360, 4991], [385, 4989.5], [410, 4990.5], [440, 4992], [470, 4993.2], [500, 4994]],
    b: [[360, 4991], [385, 4989.5], [410, 4989], [440, 4987.5], [470, 4986.4], [500, 4986]],
    c: [[360, 4991], [385, 4991.5], [410, 4993], [440, 4995], [470, 4997], [500, 4998]]
  };
  const B1 = [[4990.0, 40, 32], [4989.75, 55, 30], [4989.5, 70, 35], [4989.25, 80, 28]];
  const B2 = [[4991.0, 25, 60], [4990.5, 40, 75], [4990.0, 60, 88], [4989.5, 70, 110], [4989.25, 55, 120], [4989.0, 190, 210], [4988.5, 30, 95], [4988.0, 20, 15]];

  function levels(op = 1, o = {}) {
    const L = [[LV.vah, "昨日 VAH 5010", "s-sell"], [LV.poc, "昨日 POC 5000", "s-ink"], [LV.val, "昨日 VAL 4990", "s-buy"]];
    let s = `<g opacity="${op}"><rect x="60" y="${Y(LV.vah)}" width="560" height="${Y(LV.val) - Y(LV.vah)}" class="f-buy-soft" opacity="0.5"/>`;
    [5010, 5005, 5000, 4995, 4990, 4985].forEach((p) => { s += `<text x="54" y="${Y(p) + 4}" text-anchor="end" class="t-mute">${p}</text>`; });
    L.forEach(([p, l, c]) => { s += `<line x1="60" x2="620" y1="${Y(p)}" y2="${Y(p)}" class="${c}" stroke-width="2" stroke-dasharray="6 4"/><text x="616" y="${Y(p) - 6}" text-anchor="end" class="${c.replace("s-", "t-")} t-b">${l}</text>`; });
    return s + "</g>";
  }
  const line = (pts, cls = "s-ink", w = 2.5) => `<polyline points="${pts.map((q) => `${q[0]},${Y(q[1])}`).join(" ")}" class="${cls} f-none" stroke-width="${w}"/>`;
  function orders(op = 1, lab = true) {
    const O = [[4989.5, "限價買 4989.50", "s-buy"], [4987.75, "停損 4987.75", "s-sell"], [4993, "TP1 4993（2R）", "s-gamma"]];
    return `<g opacity="${op}">${O.map(([p, l, c]) => `<line x1="360" x2="620" y1="${Y(p)}" y2="${Y(p)}" class="${c}" stroke-width="2.5"/>${lab ? `<text x="616" y="${Y(p) + (p === 4993 ? -6 : 16)}" text-anchor="end" class="${c.replace("s-", "t-")} t-b">${l}</text>` : ""}`).join("")}</g>`;
  }

  const STEPS = [
    { cap: "盤前第一件事：查<b>昨天的 Volume Profile</b>。POC 5000、VAH 5010、VAL 4990，把三條線畫在圖上。這時還沒有任何交易，只是在做功課。",
      why: "這是這裡的虛構交易，用 MES（ES 的微型合約，每點 $5）。帳戶 $10,000，每筆風險 1%。", stuckHref: "#of-6", stuckLabel: "回第 7 關複習 POC、VAH、VAL →", stuck: "先畫地圖，再出門。" },
    { cap: "第二件事：檢查<b>時段和事件</b>。今天晚上沒有重要數據公布，可以照平常的流程。美股開盤後先觀察，不在開盤第一波追價。",
      why: "如果今天有 CPI 或 FOMC，就要先排好不開新倉的時段（第 11 關）。這一步很容易被忽略，但它能幫你避開最難控制的風險。", stuckHref: "#of-event", stuckLabel: "回第 11 關複習經濟事件 →" },
    { cap: "開盤在 5004，在昨天的價值區（4990～5010）<b>裡面</b>，代表平衡。策略：在價值區邊緣找反向機會，目標 POC，<b>不追突破</b>。",
      why: "平衡狀態下，價格傾向在價值區裡來回（第 7 關）。所以今天的劇本是「邊緣反向」，不是「突破追價」。" },
    { cap: "寫下劇本：<b>主劇本</b>：跌到 VAL 4990 附近，有確認就做多，目標 POC。<b>備案</b>：漲到 VAH 5010，有確認就做空。<b>不做</b>：任何一邊有量突破、站穩在外面。",
      why: "劇本要在盤前寫好，盤中只是照著做。寫下「什麼情況不做」跟寫下「什麼情況做」一樣重要。", dur: 2400 },
    { cap: "想一想：開盤在價值區裡面。",
      q: { t: "今天最合理的策略是？", o: [
        ["開盤往哪邊走就追哪邊", false, "價格在價值區裡是平衡狀態，開盤的方向常常是假的。追價很容易被來回洗掉。"],
        ["在價值區邊緣等反向訊號，目標看回 POC", true, "平衡時，價格常在價值區裡來回。在 VAH、VAL 等確認，目標 POC，是最符合今天狀態的劇本。"],
        ["今天不交易", false, "可以選擇不交易，但今天有清楚的劇本可以執行，不需要放棄。"]] } },
    { cap: "開盤後賣壓出現，價格往下走，接近 4990（昨日 VAL）。<b>這時才開始看 Footprint。</b>",
      why: "在價格到位之前，一直盯著 Footprint 只會讓你看到很多沒意義的訊號，想要提早進場。到位了才看，是這套流程最重要的紀律。", dur: 2400 },
    { cap: "第 1 根：下探 4989.25，底部主動賣很多，Delta −110，但沒有再往下破。<b>先別急</b>，等下一根。",
      why: "賣方很用力，價格卻沒有繼續跌：可能有人在接。但只憑一根還不夠，要看第 2 根怎麼走。", dur: 2000 },
    { cap: "第 2 根：低點 4988.00、收在 4991.00（陽線）。4989.00 兩邊 190 × 210（<b>吸收</b>），Delta 轉成 +85（<b>Delta 轉向</b>），4988.50～4989.25 連續 3 格買方失衡（<b>主動交易者</b>），底部追空的人被套（<b>被套交易者</b>）。",
      why: "位置正確＋4 個確認，遠超過「2～3 個就夠」。等第 2 根收盤確認之後，才開始準備下單。", stuckHref: "#of-5", stuckLabel: "回第 12 關複習五個確認 →", dur: 2600 },
    { cap: "訊號很強，可以馬上按下單嗎？",
      q: { t: "下單之前，還要先做什麼？", o: [
        ["不用了，4 個確認很強，越快越好", false, "訊號強不代表可以跳過風險計算。不知道停損放哪、下幾口，就不能下單。"],
        ["先決定停損位置，算出風險和口數，確認風報比", true, "先決定錯在哪（停損），再算下幾口（第 13 關）。這一步做完才能下單。"],
        ["再等第 3 根，確認更多", false, "已經有足夠的確認了。再等可能錯過位置，而且不能取代風險計算。"]] } },
    { cap: "下單計畫：在堆疊失衡上緣掛<b>限價買 4989.50</b>；停損放在訊號 K 棒低點外 1 tick ＝ <b>4987.75</b>（風險 1.75 點）；TP1 4993（2R）、TP2 POC 5000（6R）。",
      why: "每口風險 1.75 × $5 ＝ $8.75。預算 $100 ÷ $8.75 ＝ 11.4，無條件捨去 11 口，總風險 $96.25 ＝ 1R。下單前最後確認：風報比 ≥ 1:2 ✓、單筆風險 ≤ 1% ✓、今天還沒虧過 ✓、不是數據時段 ✓。", dur: 2600 },
    { cap: "換你算：如果進場改成 4990.00，停損不變（4987.75）。",
      q: { t: "用 MES、預算 $100，最多可以下幾口？", o: [
        ["11 口", false, "風險變成 2.25 點，每口 $11.25，11 口就是 $123.75，超過預算。"],
        ["8 口", true, "2.25 × $5 ＝ $11.25；$100 ÷ $11.25 ≈ 8.9，無條件捨去 8 口，風險 $90。"],
        ["9 口", false, "9 口的風險是 $101.25，超過 $100。口數要無條件捨去。"]] } },
    { cap: "三種結果，<b>三種都是「對的」</b>：A 回測成交後漲到 TP1，+2R；B 成交後跌破停損，−1R；C 沒碰到 4989.50 就往上走，沒成交、<b>不追</b>。",
      why: "A：3.5 點 × $5 × 11 口 ＝ +$192.50（+2R）。B：1.75 × $5 × 11 ＝ −$96.25（−1R），這是事先接受的虧損，不慌張、不加碼、不報復。C：位置用完就放棄，錯過了沒關係。", dur: 3000 },
    { cap: "整理：<b>位置 → 環境 → 劇本 → 等待 → 確認 → 先算風險 → 執行 → 記錄</b>。結果是賺是賠，不代表做得好不好；照計畫走才是。",
      why: "不管結果是哪一種，都要寫交易日誌：位置、確認、進場、停損、結果幾 R、有沒有照計畫。下一關會講為什麼「照計畫」比「賺錢」更重要。" }
  ];

  function draw(svg, i, t) {
    const e = ease(t); let s = "";
    if (i === 0) s += levels(seg(t, 0, 0.6));
    else if (i === 1) {
      s += levels(0.3);
      const C = [["今天有重要數據嗎？", "沒有"], ["現在是什麼時段？", "美股開盤後"], ["開盤第一波要追嗎？", "不追，先觀察"]];
      C.forEach((c, k) => { s += `<g opacity="${seg(t, k * 0.25, k * 0.25 + 0.3)}"><rect x="120" y="${80 + k * 76}" width="400" height="60" rx="10" class="f-surface s-line"/><circle cx="148" cy="${110 + k * 76}" r="11" class="f-hl"/><text x="148" y="${115 + k * 76}" text-anchor="middle" class="t-w t-b">✓</text><text x="170" y="${106 + k * 76}" class="t-mute">${c[0]}</text><text x="170" y="${128 + k * 76}" class="t-ink t-b">${c[1]}</text></g>`; });
    } else if (i === 2 || i === 4) {
      s += levels() + line(PRE.slice(0, 1).concat([[85, 5004]]));
      s += `<circle cx="70" cy="${Y(5004)}" r="7" class="f-buy"/><text x="84" y="${Y(5004) - 10}" class="t-ink t-b">開盤 5004：在價值區裡</text>`;
      if (i === 2) s += `<text x="300" y="${Y(5000) + 26}" class="t-ink t-b" opacity="${seg(t, 0.4, 1)}">平衡 → 邊緣反向、目標 POC、不追突破</text>`;
    } else if (i === 3) {
      s += levels(0.6);
      const R = [["主劇本", "跌到 VAL 4990，有確認就做多，目標 POC", "f-buy-soft"], ["備案", "漲到 VAH 5010，有確認就做空", "f-sell-soft"], ["不做", "任何一邊有量突破、站穩在外面", "g-cell"]];
      R.forEach((r, k) => { s += `<g opacity="${seg(t, k * 0.25, k * 0.25 + 0.3)}"><rect x="100" y="${70 + k * 84}" width="460" height="66" rx="10" class="${r[2]} s-line"/><text x="120" y="${98 + k * 84}" class="t-ink t-b t-lg">${r[0]}</text><text x="120" y="${122 + k * 84}" class="t-ink">${r[1]}</text></g>`; });
    } else if (i === 5) {
      const n = Math.max(2, Math.ceil(seg(t, 0, 0.85) * (PRE.length - 2)));
      s += levels() + line(PRE.slice(0, n));
      if (t > 0.85) s += chip(330, Y(4990) + 40, "到 VAL 了，現在才看 Footprint", "hl");
    } else if (i === 6) {
      s += levels(0.25) + line(PRE.slice(0, 10), "s-ink", 2) + fpMini(400, 80, B1, { title: "第 1 根", rh: 32, hl: [4989.25], foot: "Delta −110　下探 4989.25" });
    } else if (i === 7) {
      s += levels(0.2) + line(PRE, "s-ink", 2) + fpMini(400, 50, B2, { title: "第 2 根", rh: 32, hl: [4989.0], foot: "Delta +85　收 4991.00（陽線）" });
      s += `<g opacity="${seg(t, 0.3, 0.8)}"><rect x="597" y="${50 + 5 * 32 - 2}" width="6" height="${32 * 3}" rx="3" class="f-buy"/></g>`;
      s += `<text x="60" y="30" class="t-gamma t-b" opacity="${seg(t, 0.6, 1)}">位置＋4 個確認：吸收、Delta 轉向、主動交易者、被套交易者</text>`;
    } else if (i === 8) {
      s += levels(0.4) + line(PRE) + chip(470, 70, "4 個確認！馬上下單？", "hl");
    } else if (i === 9 || i === 10) {
      s += levels(0.35) + line(PRE) + orders(i === 9 ? seg(t, 0, 0.6) : 1);
      if (i === 9) s += `<g opacity="${seg(t, 0.5, 1)}"><rect x="80" y="40" width="250" height="110" rx="10" class="f-surface s-line"/><text x="96" y="68" class="t-ink">每口風險 1.75 × $5 ＝ $8.75</text><text x="96" y="94" class="t-ink">$100 ÷ $8.75 ＝ 11.4 → 11 口</text><text x="96" y="122" class="t-ink t-b">總風險 $96.25 ＝ 1R</text></g>`;
      else s += `<text x="90" y="80" class="t-ink t-b t-lg">進場改 4990.00，停損 4987.75</text><text x="90" y="110" class="t-ink t-b">MES、預算 $100，幾口？</text>`;
    } else if (i === 11) {
      s += levels(0.35) + line(PRE) + orders(0.5, false);
      const K = [["a", "s-buy", "A：+2R"], ["b", "s-sell", "B：−1R"], ["c", "s-gamma", "C：沒成交"]];
      K.forEach(([k, c, l], j) => { const pts = OUT[k], n = Math.max(2, Math.ceil(seg(t, j * 0.2, j * 0.2 + 0.5) * pts.length)); s += line(pts.slice(0, n), c, 3); if (n === pts.length) s += `<text x="508" y="${Y(pts[pts.length - 1][1]) + 4}" class="${c.replace("s-", "t-")} t-b">${l}</text>`; });
    } else if (i === 12) {
      s += cards([["位置與環境", "昨日 POC／VAH／VAL；時段和事件"], ["劇本", "主劇本、備案、什麼情況不做"], ["等待與確認", "到位才看 Footprint，2～3 個確認"], ["先算風險", "停損 → 每口風險 → 口數 → 風報比"], ["執行與記錄", "三種結果都在計畫裡，寫日誌"]], t, { hl: 3 });
    }
    svg.innerHTML = s;
  }

  /* ---------- 你來操作：交易日誌 ---------- */
  const RES = {
    a: { n: "結果 A：成功", r: "+2R（+$192.50）", note: "回測成交，漲到 TP1 全部出場。", plan: true },
    b: { n: "結果 B：停損", r: "−1R（−$96.25）", note: "成交後跌破停損。判斷：這次是假跌破看錯，但流程完全照做。", plan: true },
    c: { n: "結果 C：沒成交", r: "0R", note: "價格沒回到 4989.50，限價單沒成交，沒有追價。", plan: true },
    d: { n: "結果 D：追價進場", r: "+1R（+$96.25）", note: "沒等回測，在 4991.50 用市價追進去，停損沒放好，最後運氣好賺了。", plan: false }
  };
  const simHTML = `<p class="small">選一種結果，日誌會自動填好；你只要回答最下面的「流程評分」。注意結果 D：賺了錢，但沒有照計畫。</p>
<div class="btn-row tr-res">${Object.entries(RES).map(([k, r]) => `<button class="btn" data-r="${k}" type="button">${r.n}</button>`).join("")}</div>
<div class="tr-log"></div><ul class="sim-task tr-task"></ul>`;
  function simMount(box) {
    const q = (s) => box.querySelector(s); const seen = new Set(), right = new Set();
    function paint(k) {
      const r = RES[k];
      q(".tr-log").innerHTML = k ? `<table class="tr-tab"><tbody>
        <tr><th>日期</th><td>（練習）</td></tr><tr><th>位置</th><td>昨日 VAL 4990（價值區下緣）</td></tr><tr><th>環境</th><td>開在價值區內，平衡；無重要數據</td></tr>
        <tr><th>確認</th><td>吸收、Delta 轉向、主動交易者、被套交易者（4 個）</td></tr>
        <tr><th>計畫</th><td>限價買 4989.50；停損 4987.75；TP1 4993；MES 11 口；1R ＝ $96.25</td></tr>
        <tr><th>實際</th><td>${r.note}</td></tr><tr><th>結果</th><td><b>${r.r}</b></td></tr></tbody></table>
        <p class="tr-q"><b>流程評分：</b>這筆有照計畫走嗎？</p><div class="btn-row"><button class="btn" data-g="y" type="button">有，流程好</button><button class="btn" data-g="n" type="button">沒有，流程不好</button></div><p class="tr-fb" aria-live="polite"></p>` : "";
      q(".tr-log").dataset.k = k || "";
    }
    function task() {
      q(".tr-task").innerHTML = [[["a", "b", "c"].every((k) => right.has(k)), "任務 1：A、B、C 三種結果都評對分"], [right.has("d"), "任務 2：替結果 D 評分，想想為什麼賺錢也算不及格"]].map(([ok, tx]) => `<li class="${ok ? "ok" : ""}">${ok ? "✓" : "○"} ${tx}</li>`).join("");
    }
    box.addEventListener("click", (e) => {
      const b = e.target.closest("[data-r]"); if (b) { seen.add(b.dataset.r); paint(b.dataset.r); return; }
      const g = e.target.closest("[data-g]"); if (!g) return;
      const k = q(".tr-log").dataset.k, r = RES[k], ok = (g.dataset.g === "y") === r.plan;
      if (ok) right.add(k);
      q(".tr-fb").innerHTML = `<b class="${ok ? "ok" : "bad"}">${ok ? "評對了。" : "再想想。"}</b>${r.plan ? "每一步都照計畫：位置、確認、先算風險、照單執行。不管結果賺或賠，這都是一筆好交易。" : "雖然賺了錢，但沒等回測、沒照計畫放停損。這是「壞流程、好結果」，最危險，因為它會讓你以為下次也可以這樣做。"}`;
      task();
    });
    paint(null); task();
  }

  const QS = [
    { fig: `<p class="small q-cap">價格回測時沒碰到你掛的 4989.50，就直接往上漲了 8 點。</p>`, q: "正確的做法是？", step: 12, o: [
      ["用市價追進去，免得錯過", false, "追進去的價格離停損更遠，風報比變差，而且違反了計畫。"],
      ["不追，位置用完就放棄，等下一個機會", true, "原則：「只做第一次觸碰，位置用完就放棄。」這是結果 C，也是對的結果。"],
      ["把限價單往上移到現價", false, "這等於追價，只是換個方式。"]] },
    { fig: `<p class="small q-cap">結果 B：成交後跌破停損，虧了 1R。</p>`, q: "接下來最好的反應是？", step: 12, o: [
      ["馬上反手做空，把虧的賺回來", false, "這是報復性交易。沒有劇本、沒有確認，只是情緒。"],
      ["接受這個事先算好的虧損，記錄日誌，等下一個符合劇本的機會", true, "−1R 是計畫裡的一部分。照規則做了，就是好交易。寫下原因，然後照常等待。"],
      ["下一筆把口數加倍", false, "加大部位想賺回來，是爆倉最常見的原因。"]] },
    { fig: `<p class="small q-cap">開盤在昨天價值區上方 15 點，一開盤就繼續往上走，量很大。</p>`, q: "和這一關的情境相比，劇本應該怎麼調整？", step: 4, o: [
      ["一樣在 VAL 等做多", false, "價格已經離開價值區，而且有量往上，不是平衡狀態了。原本的劇本不適用。"],
      ["不是平衡日了：不在價值區邊緣做反向，改看回測 VAH 是否被接受", true, "開在價值區外、有量延伸，可能是趨勢。劇本要跟著環境改：等回測 VAH 有沒有守住，而不是逆勢做反向。"],
      ["直接追多，量很大一定會漲", false, "量大不代表可以隨便追。要有位置、有確認、先算風險。"]] }
  ];

  PAGES["of-9"] = window.KIT.page(window.COURSE.OFC, "of-9", {
    topic: "一筆完整交易",
    lede: "把前面所有關卡串起來，重播這裡那筆虛構的 MES 交易：盤前畫地圖、看環境、寫劇本、等價格到位、看確認、先算風險、執行，最後有三種結果，三種都是對的。",
    analogy: [
      ["飛行前檢查表", "機長每次起飛前都照表檢查，不管飛了幾千次。交易也有一張固定的流程表。"],
      ["登山計畫", "出發前先決定路線、天氣不好就撤退的條件。<b>寫好什麼情況不做</b>，跟寫好什麼情況做一樣重要。"],
      ["醫生看診", "病人沒好，不代表醫生判斷錯；照正確流程看診，結果還是有好有壞。"]],
    steps: STEPS, draw, simHTML, simMount,
    simIntro: "選一種結果，看完整的交易日誌，再替這筆交易的「流程」評分。",
    mist: [
      ["賺錢就是好交易，賠錢就是壞交易", "好壞看的是有沒有照計畫。照計畫的 −1R 是好交易；沒照計畫的 +1R 反而最危險。"],
      ["訊號很強就可以先下單再算風險", "一定要先決定停損、算口數、確認風報比，再下單。順序不能反。"],
      ["錯過了就把限價單往上移", "這等於追價。位置用完就放棄，等下一個位置。"]],
    faq: [
      ["為什麼用 ES／MES 的例子，不是 NQ？", "ES 的數字比較好算。流程完全一樣，換成 NQ／MNQ 只要把每點價值換掉（MNQ 每點 $2）。"],
      ["TP1 和 TP2 怎麼分配？", "常見做法是 TP1 先出一部分（例如一半），剩下的把停損移到進場價，再看能不能到 TP2。這一關為了簡單，假設在 TP1 全部出場。"],
      ["停損為什麼放在低點外 1 tick？", "訊號 K 棒的低點是「想法錯了」的地方：如果價格跌破，代表吸收失敗。多 1 tick 是避免剛好碰到低點就被掃出場。"],
      ["一天可以做幾筆？", "沒有標準答案。這套流程一天通常只有 1～3 個符合劇本的機會，再加上每天最大虧損的限制。"],
      ["交易日誌一定要寫嗎？", "要。沒有日誌，就沒辦法算期望值、檢查自己有沒有照計畫，也不知道哪裡要改。下一關會講怎麼用日誌做每週檢討。"],
      ["這筆交易是真的嗎？", "不是，是筆記裡的虛構例子，用來練習流程。真實交易的結果要靠自己的紀錄去累積。"]],
    qs: QS,
    gloss: [
      ["劇本", "盤前寫好的計畫：主劇本、備案、什麼情況不做。"],
      ["TP1／TP2", "第一、第二個目標價。"],
      ["1R", "這筆事先決定的最大虧損，這裡是 $96.25。"],
      ["流程評分", "評這筆交易有沒有照計畫，而不是看賺賠。"],
      ["交易日誌", "記錄位置、確認、計畫、實際、結果和流程評分。"],
      ["只做第一次觸碰", "位置第一次被測試時才做，錯過就放棄。"]],
    remember: "<b>位置 → 環境 → 劇本 → 等待 → 確認 → 先算風險 → 執行 → 記錄。</b>成功、停損、沒進場，三種結果都在計畫裡。"
  });
})();
