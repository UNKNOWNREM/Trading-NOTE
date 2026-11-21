/* 路線 2 第 5 關（新）：波動率偏斜 */
(function () {
  const PAGES = (window.__PAGES = window.__PAGES || {});
  const { chip, lerp, ease, seg, cards } = window.KIT;
  const B = (F, K, iv, d) => window.OF.b76(F, K, iv, Math.max(d, 0.0001) / 365);
  // 偏斜模型：左邊（低履約價）IV 比較高，遠價外 Call 稍微翹起
  const ivAt = (K, slope = 0.04, base = 0.2, F = 27000) => Math.max(0.05, base + slope * (F - K) / 1000 + slope * 0.5 * ((K - F) / 1000) ** 2);
  const X = (K) => lerp(90, 590, (K - 25800) / 2400);
  function smile(slope, o = {}) {
    const Y = (v) => lerp(320, 60, (v - 0.1) / 0.25), pts = [];
    for (let K = 25800; K <= 28200; K += 50) pts.push(`${X(K)},${Y(ivAt(K, slope, o.base))}`);
    const n = o.upto == null ? pts.length : Math.max(2, Math.round(o.upto * pts.length));
    return { s: `<polyline points="${pts.slice(0, n).join(" ")}" class="${o.cls || "s-gamma"} f-none" stroke-width="${o.w || 3}" opacity="${o.op == null ? 1 : o.op}"/>`, Y };
  }
  const axis = () => { const Y = (v) => lerp(320, 60, (v - 0.1) / 0.25); return `<line x1="90" x2="590" y1="320" y2="320" class="s-ink"/>${[26000, 26600, 27000, 27400, 28000].map((k) => `<text x="${X(k)}" y="342" text-anchor="middle" class="t-mute">${k.toLocaleString()}</text>`).join("")}${[0.15, 0.2, 0.25, 0.3].map((v) => `<text x="82" y="${Y(v) + 4}" text-anchor="end" class="t-mute">${Math.round(v * 100)}%</text>`).join("")}<line x1="${X(27000)}" x2="${X(27000)}" y1="60" y2="320" class="s-line" stroke-dasharray="4 4"/><text x="${X(27000)}" y="54" text-anchor="middle" class="t-mute">現價 27,000</text>`; };
  const r0 = Math.round;
  const PF = r0(B(27000, 26700, 0.2, 30).put), PS = r0(B(27000, 26700, ivAt(26700), 30).put), CF = r0(B(27000, 27300, 0.2, 30).call), CS = r0(B(27000, 27300, ivAt(27300), 30).call);

  const STEPS = [
    { cap: "前幾關都假設<b>每個履約價的 IV 一樣</b>（20%）。實際上把每個履約價的 IV 畫出來，會是一條<b>彎的線</b>，叫做波動率偏斜。",
      why: "IV 是從每一口選擇權的價格各自反推出來的。不同履約價的供需不同，反推出的 IV 就不同。", stuck: "同一家保險公司，「地震險」和「小擦撞險」的保費比例不會一樣：大家越怕的風險，越貴。" },
    { cap: "股價指數（包括 NQ）的偏斜通常是<b>左高右低</b>：越低的履約價（價外 Put）IV 越高，價外 Call 的 IV 比較低，遠一點的 Call 再稍微翹起來。",
      why: "這種形狀常被叫做「偏斜（Skew）」或「微笑偏斜（Smirk）」。左邊高，代表市場對「大跌」的保險要價比較高。", dur: 2600 },
    { cap: "為什麼左邊高？一、<b>下跌時波動通常放大</b>（跌比漲快）；二、機構持有大量股票，會長期<b>買 Put 避險</b>，推高了價外 Put 的價格。",
      why: "股市常見「慢慢漲、快快跌」。加上大量的避險需求集中在 Put，賣方要求更高的價格，反推出來的 IV 就比較高。" },
    { cap: "對價格的影響：30 天的 <b>26,700 Put</b>，用平的 IV 20% 算約 " + PF + " 點；加上偏斜（IV 約 " + (ivAt(26700) * 100).toFixed(1) + "%）變成約 <b>" + PS + "</b> 點。<b>27,300 Call</b> 則從 " + CF + " 點降到約 <b>" + CS + "</b> 點。",
      why: "兩口都離現價 300 點，價外的程度一樣，但因為偏斜，Put 比 Call 貴了不少。", dur: 2600 },
    { cap: "想一想：NQ 在 27,000，一口 26,700 Put 和一口 27,300 Call，都是 30 天、都離現價 300 點。",
      q: { t: "在正常的偏斜下，哪一口比較貴？", o: [
        ["26,700 Put", true, "指數的偏斜左高右低，價外 Put 的 IV 比較高，所以同樣距離的 Put 比 Call 貴。"],
        ["27,300 Call", false, "價外 Call 那一側的 IV 通常比較低，所以比較便宜。"],
        ["一樣貴，因為距離一樣", false, "距離一樣，但 IV 不一樣，價格就不一樣。"]] } },
    { cap: "偏斜也會變：左邊<b>變陡</b>，代表市場越來越怕跌、避險需求增加；變平，代表大家比較放心。",
      why: "很多交易者會觀察偏斜的變化，當作市場情緒的參考。這跟 IV 的高低是兩件事：IV 可能不變，但偏斜變陡。", dur: 2600 },
    { cap: "想一想：最近幾天，價外 Put 的 IV 越升越高，價外 Call 的 IV 沒什麼變。",
      q: { t: "這代表什麼？", o: [
        ["偏斜變陡，市場對下跌的避險需求增加", true, "左邊升高、右邊不變，偏斜變陡。代表大家越來越願意花錢買下跌保險。"],
        ["市場預期大漲", false, "大漲的預期通常反映在 Call 那一側。這裡是 Put 那一側變貴。"],
        ["偏斜變平", false, "左右差距變大，是變陡。"]] } },
    { cap: "對 GEX 的影響：每個履約價的 Gamma，是用<b>它自己的 IV</b> 算的。IV 比較高的 Put 那一側，Gamma 會被攤得比較平。",
      why: "不同的 GEX 網站和工具，對 IV 的假設不一樣：有的用每個履約價自己的 IV，有的簡化成一個 IV。這是為什麼不同來源算出的牆，位置和大小會有差異（第 12 關會講怎麼讀 GammaLens）。", dur: 2400 },
    { cap: "偏斜也帶出一個重要的現象：價格下跌時，Put 那一側的 IV 跟著上升，選擇權的 Delta 也會跟著改變。這叫 <b>Vanna</b>，第 9 關會講。",
      why: "因為偏斜，「價格」和「IV」常常一起動：跌的時候 IV 升，漲的時候 IV 降。造市商的對沖量會因此再多一層變化。" },
    { cap: "整理：每個履約價的 IV 不一樣，指數通常<b>左高右低</b>；同樣距離的價外 Put 比 Call 貴；偏斜<b>變陡</b>代表更怕跌；它也會影響 Gamma 和 GEX 的計算。",
      why: "到這裡選擇權的基礎告一段落。下一關開始看造市商：他們賣出選擇權之後，怎麼用期貨對沖。" }
  ];

  function draw(svg, i, t) {
    const e = ease(t); let s = axis();
    if (i === 0) {
      const flat = smile(0, { base: 0.2, cls: "s-ink", op: 0.5, w: 2 });
      s += flat.s.replace("<polyline", `<polyline stroke-dasharray="6 4"`) + `<text x="590" y="${flat.Y(0.2) - 8}" text-anchor="end" class="t-mute">前幾關的假設：全部 20%</text>`;
      s += smile(0.04, { upto: seg(t, 0.3, 0.95) }).s;
    } else if (i === 1 || i === 2) {
      const g = smile(0.04);
      s += g.s + `<g opacity="${i === 1 ? seg(t, 0.3, 0.8) : 1}"><text x="${X(26150)}" y="${g.Y(ivAt(26150)) + 30}" text-anchor="start" class="t-sell t-b">價外 Put：IV 高</text><text x="${X(27500)}" y="${g.Y(ivAt(27500)) + 26}" text-anchor="middle" class="t-buy t-b">價外 Call：IV 低</text></g>`;
      if (i === 2) s += `<g opacity="${seg(t, 0.2, 0.8)}"><rect x="320" y="70" width="270" height="80" rx="10" class="f-surface s-line"/><text x="336" y="100" class="t-ink">① 跌比漲快，下跌時波動放大</text><text x="336" y="128" class="t-ink">② 機構長期買 Put 避險</text></g>`;
    } else if (i === 3 || i === 4) {
      const g = smile(0.04);
      s += g.s;
      [[26700, "Put", PF, PS, "s-sell"], [27300, "Call", CF, CS, "s-buy"]].forEach(([K, n, f, sk, c], k) => { s += `<g opacity="${i === 4 ? 1 : seg(t, k * 0.3, k * 0.3 + 0.4)}"><circle cx="${X(K)}" cy="${g.Y(ivAt(K))}" r="7" class="${c.replace("s-", "f-")}"/>${i === 3 ? `<text x="${X(K)}" y="${g.Y(ivAt(K)) + (k ? -16 : 30)}" text-anchor="middle" class="${c.replace("s-", "t-")} t-b">${K.toLocaleString()} ${n}：${f} → ${sk}</text>` : `<text x="${X(K)}" y="${g.Y(ivAt(K)) + (k ? -16 : 30)}" text-anchor="middle" class="${c.replace("s-", "t-")} t-b">${K.toLocaleString()} ${n}</text>`}</g>`; });
      if (i === 4) s += chip(340, 300, "同樣離 300 點，誰比較貴？", "hl");
    } else if (i === 5 || i === 6) {
      const sl = i === 5 ? lerp(0.015, 0.07, Math.abs(Math.sin(t * Math.PI))) : 0.07;
      s += smile(0.04, { cls: "s-ink", op: 0.35, w: 2 }).s + smile(sl, { cls: "s-sell" }).s;
      if (i === 5) s += `<text x="${X(26000)}" y="80" class="t-sell t-b">${sl > 0.045 ? "變陡：更怕跌" : "變平：比較放心"}</text>`;
      else s += chip(430, 90, "Put 那一側越來越高", "hl");
    } else if (i === 7) {
      s = "";
      const XF = (F) => lerp(90, 590, (F - 26200) / 1600);
      [[(K) => 0.2, "s-ink", "全部用 20%"], [(K) => ivAt(K), "s-gamma", "用各自的 IV"]].forEach(([iv, c, l], k) => {
        const pts = []; for (let K = 26200; K <= 27800; K += 25) pts.push(`${XF(K)},${lerp(320, 60, B(27000, K, iv(K), 7).gamma * 1e4 / 7)}`);
        s += `<g opacity="${seg(t, k * 0.4, k * 0.4 + 0.4)}"><polyline points="${pts.join(" ")}" class="${c} f-none" stroke-width="3" ${k ? "" : 'stroke-dasharray="6 4"'}/><text x="${k ? 110 : 590}" y="${k ? 90 : 110}" text-anchor="${k ? "start" : "end"}" class="${c.replace("s-", "t-")} t-b">${l}</text></g>`;
      });
      s += `<line x1="90" x2="590" y1="320" y2="320" class="s-ink"/>${[26400, 27000, 27600].map((k) => `<text x="${XF(k)}" y="342" text-anchor="middle" class="t-mute">${k.toLocaleString()}</text>`).join("")}<text x="90" y="44" class="t-mute">不同履約價的 Gamma（現價 27,000、7 天）</text>`;
    } else if (i === 8) {
      s = "";
      const XP = (k) => lerp(90, 590, k / 10), YP = (v) => lerp(300, 80, (v - 26600) / 600), YI = (v) => lerp(300, 80, (v - 15) / 15);
      const P = [27000, 26980, 26940, 26900, 26860, 26820, 26780, 26750, 26720, 26700, 26690], I = [18, 18.3, 18.9, 19.6, 20.4, 21.3, 22.2, 23, 23.8, 24.5, 24.8];
      const n = Math.max(2, Math.ceil(seg(t, 0, 0.85) * 11));
      s += `<polyline points="${P.slice(0, n).map((v, k) => `${XP(k)},${YP(v)}`).join(" ")}" class="s-ink f-none" stroke-width="3"/><polyline points="${I.slice(0, n).map((v, k) => `${XP(k)},${YI(v)}`).join(" ")}" class="s-sell f-none" stroke-width="3" stroke-dasharray="6 4"/>`;
      s += `<text x="100" y="${YP(27000) - 10}" class="t-ink t-b">價格往下</text><text x="590" y="${YI(24.8) - 10}" text-anchor="end" class="t-sell t-b" opacity="${seg(t, 0.7, 1)}">IV 跟著往上 → Vanna（第 9 關）</text>`;
    } else if (i === 9) {
      s = cards([["偏斜", "每個履約價的 IV 不一樣"], ["指數的形狀", "左高右低：價外 Put 的 IV 比較高"], ["價格影響", "同樣距離，價外 Put 比 Call 貴"], ["變陡", "市場更怕跌、避險需求增加"], ["影響 GEX", "Gamma 用各自的 IV 算，不同工具結果不同"]], t, { hl: 1 });
    }
    svg.innerHTML = s;
  }

  const simHTML = `<div class="controls"><div class="ctl"><label>偏斜程度 <b class="sk-s-v"></b></label><input class="sk-s" type="range" min="0" max="0.09" step="0.005" value="0.04"></div><div class="ctl"><label>價平 IV <b class="sk-b-v"></b></label><input class="sk-b" type="range" min="0.12" max="0.35" step="0.01" value="0.2"></div></div>
<svg class="fpx sk-svg" viewBox="0 0 640 360" role="img" aria-label="波動率偏斜"></svg><div class="sk-out"></div><ul class="sim-task sk-task"></ul>`;
  function simMount(box) {
    const q = (s) => box.querySelector(s); const done = {};
    function paint() {
      const sl = +q(".sk-s").value, base = +q(".sk-b").value;
      q(".sk-s-v").textContent = sl === 0 ? "平的" : "每 1,000 點差 " + (sl * 100).toFixed(1) + "%"; q(".sk-b-v").textContent = Math.round(base * 100) + "%";
      q(".sk-svg").innerHTML = axis() + smile(sl, { base }).s;
      const put = B(27000, 26700, ivAt(26700, sl, base), 30).put, call = B(27000, 27300, ivAt(27300, sl, base), 30).call;
      q(".sk-out").innerHTML = `<div class="kpi-row"><div><span class="t1">26,700 Put 的 IV</span><b>${(ivAt(26700, sl, base) * 100).toFixed(1)}%</b></div><div><span class="t1">26,700 Put（30 天）</span><b>${put.toFixed(0)} 點</b></div><div><span class="t1">27,300 Call 的 IV</span><b>${(ivAt(27300, sl, base) * 100).toFixed(1)}%</b></div><div><span class="t1">27,300 Call（30 天）</span><b>${call.toFixed(0)} 點</b></div></div><p class="small">Put 比 Call 貴 ${(put - call).toFixed(0)} 點。偏斜模型只是示意。</p>`;
      if (sl === 0) done.a = true;
      if (sl >= 0.08) done.b = true;
      if (put - call > 200) done.c = true;
      q(".sk-task").innerHTML = [["a", "任務 1：把偏斜調成平的，看 Put 和 Call 是不是幾乎一樣貴"], ["b", "任務 2：把偏斜調到最陡，想想這代表市場在怕什麼"], ["c", "任務 3：讓 26,700 Put 比 27,300 Call 貴 200 點以上"]].map(([k, tx]) => `<li class="${done[k] ? "ok" : ""}">${done[k] ? "✓" : "○"} ${tx}</li>`).join("");
    }
    box.addEventListener("input", paint); paint();
  }

  const QS = [
    { fig: `<p class="small q-cap">把 NQ 各個履約價的 IV 畫出來，左邊（低履約價）明顯比右邊高。</p>`, q: "最主要的原因是？", step: 3, o: [
      ["大家預期會大漲", false, "大漲的預期會讓 Call 那一側變貴，不是 Put。"],
      ["下跌時波動放大，加上機構長期買 Put 避險", true, "股市跌比漲快，避險需求又集中在 Put，賣方要價比較高，反推的 IV 就比較高。"],
      ["計算錯誤", false, "這是指數選擇權很常見的正常形狀。"]] },
    { fig: `<p class="small q-cap">兩個 GEX 網站，同一天算出的 Put Wall 差了 100 多點。</p>`, q: "可能的原因之一是？", step: 8, o: [
      ["其中一個網站是假的", false, "不一定。不同工具的假設不同，結果就會不同。"],
      ["它們對每個履約價的 IV 假設不同，算出的 Gamma 就不同", true, "有的用各履約價自己的 IV（含偏斜），有的簡化成一個 IV。Gamma 不同，牆的位置和大小就會不同。"],
      ["偏斜跟 GEX 沒有關係", false, "Gamma 要用 IV 算，偏斜會直接影響 Gamma。"]] },
    { fig: `<p class="small q-cap">價外 Put 的 IV 最近一週持續上升，價外 Call 不變。</p>`, q: "這個訊號比較合理的解讀是？", step: 7, o: [
      ["偏斜變陡，避險需求增加，市場比較緊張", true, "Put 那一側變貴，偏斜變陡，代表大家越來越願意付錢買下跌保險。它是情緒參考，不是方向保證。"],
      ["一定會崩盤，馬上做空", false, "偏斜變陡只是避險需求增加，不代表一定會下跌。"],
      ["市場變得比較放心", false, "放心的話，偏斜會變平。"]] }
  ];

  PAGES["op-skew"] = window.KIT.page(window.COURSE.OPC, "op-skew", {
    topic: "波動率偏斜",
    lede: "前幾關假設每個履約價的 IV 都一樣，但真實市場不是這樣。這一關把 IV 按履約價畫出來，看懂指數選擇權常見的「左高右低」偏斜，以及它怎麼影響權利金和 GEX。",
    analogy: [
      ["地震險比較貴", "大家最怕的風險，保費比例最高。市場最怕大跌，所以<b>價外 Put</b> 的 IV 比較高。"],
      ["慢慢爬、快快滑", "股市常常慢慢漲、快快跌。跌的時候波動放大，所以低履約價的 IV 比較高。"],
      ["溫度計", "偏斜<b>變陡</b>，代表市場越來越緊張；變平，代表大家比較放心。"]],
    steps: STEPS, draw, simHTML, simMount,
    simIntro: "調整偏斜程度和價平 IV，看 IV 曲線怎麼變，以及同樣距離的 Put 和 Call 價格差多少。",
    mist: [
      ["所有履約價的 IV 都一樣", "每個履約價各自反推 IV，指數通常左高右低。只用一個 IV，會讓價外 Put 看起來太便宜。"],
      ["偏斜變陡就代表一定會跌", "偏斜變陡只代表避險需求增加、市場比較緊張，不是方向的保證。"],
      ["偏斜和 GEX 無關", "Gamma 要用 IV 算，不同的 IV 假設會讓 GEX 的牆位置、大小不同。"]],
    faq: [
      ["Skew、Smile、Smirk 差在哪？", "都是在描述 IV 隨履約價變化的形狀。兩邊都翹起來像微笑叫 Smile；一邊高一邊低叫 Skew 或 Smirk。指數選擇權通常是 Smirk。"],
      ["哪裡可以看偏斜？", "一些選擇權分析網站會畫 IV 對履約價的曲線；也可以從選擇權鏈裡各履約價的 IV 自己畫。"],
      ["個股的偏斜也一樣嗎？", "不一定。有些個股、商品（例如黃金）在某些時候，Call 那一側反而比較高。指數的左高右低是最常見的。"],
      ["偏斜會一直存在嗎？", "指數的左高右低很長期都存在，但陡峭程度會變，事件前後、市場恐慌時變化特別大。"],
      ["偏斜跟 Vanna 有什麼關係？", "因為偏斜，價格跌時 IV 常常跟著升。IV 一變，Delta 就變，造市商要多調整一次對沖，這就是 Vanna 的效果（第 9 關）。"],
      ["這裡的偏斜數字準嗎？", "這裡用一個簡單的公式畫出常見形狀，只是示意。真實的偏斜每天、每個到期日都不一樣。"]],
    qs: QS,
    gloss: [
      ["波動率偏斜", "不同履約價的 IV 不一樣，畫出來是一條彎的線。"],
      ["左高右低", "指數常見形狀：低履約價（價外 Put）IV 比較高。"],
      ["變陡", "兩邊 IV 差距變大，通常代表避險需求增加。"],
      ["變平", "兩邊 IV 差距變小。"],
      ["各履約價的 IV", "計算 Gamma、GEX 時，每個履約價用自己的 IV。"],
      ["Vanna", "IV 變化造成的 Delta 改變，第 9 關會講。"]],
    remember: "<b>每個履約價的 IV 都不一樣，指數通常左高右低。</b>同樣距離的價外 Put 比 Call 貴；偏斜變陡代表更怕跌，也會改變 GEX 的計算。"
  });
})();
