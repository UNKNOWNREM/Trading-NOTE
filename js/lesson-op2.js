/* 路線 2 第 2 關（新版）：權利金＝內含價值＋時間價值，Theta */
(function () {
  const PAGES = (window.__PAGES = window.__PAGES || {});
  const { chip, lerp, ease, seg, cards } = window.KIT;
  const B = (F, K, iv, d) => window.OF.b76(F, K, iv, Math.max(d, 0.0001) / 365);
  const C = (F, K, d, iv = 0.2) => (d <= 0 ? Math.max(0, F - K) : B(F, K, iv, d).call);
  const r0 = (v) => Math.round(v);
  const V30 = r0(C(27000, 27000, 30)), V14 = r0(C(27000, 27000, 14)), V7 = r0(C(27000, 27000, 7)), V1 = r0(C(27000, 27000, 1));
  const ITM = r0(C(27000, 26700, 30));
  const TH30 = Math.abs(B(27000, 27000, 0.2, 30).theta).toFixed(0), TH7 = Math.abs(B(27000, 27000, 0.2, 7).theta).toFixed(0), TH1 = Math.abs(B(27000, 27000, 0.2, 1).theta).toFixed(0);

  function split(x, y, w, intr, time, op = 1, lab = true) {
    const sc = w / 800, wi = intr * sc, wt = time * sc;
    return `<g opacity="${op}"><rect x="${x}" y="${y}" width="${wi}" height="40" rx="5" class="f-buy"/><rect x="${x + wi}" y="${y}" width="${wt}" height="40" rx="5" class="f-gamma-soft"/>${lab ? `${wi > 40 ? `<text x="${x + wi / 2}" y="${y + 25}" text-anchor="middle" class="t-w t-b">內含 ${intr}</text>` : ""}${wt > 40 ? `<text x="${x + wi + wt / 2}" y="${y + 25}" text-anchor="middle" class="t-gamma t-b">時間 ${time}</text>` : ""}` : ""}</g>`;
  }
  function decay(upto = 30, o = {}) {
    const X = (d) => lerp(590, 90, d / 30), Y = (v) => lerp(320, 60, v / 700);
    const pts = []; for (let d = 30; d >= Math.max(0, 30 - upto); d -= 0.25) pts.push(`${X(d)},${Y(C(27000, 27000, d))}`);
    let s = `<line x1="90" x2="590" y1="320" y2="320" class="s-ink"/>${[30, 21, 14, 7, 0].map((d) => `<text x="${X(d)}" y="342" text-anchor="middle" class="t-mute">${d === 0 ? "到期" : d + " 天"}</text>`).join("")}<text x="90" y="44" class="t-mute">價平 27,000 Call 的權利金（＝全部是時間價值）</text>`;
    s += `<polyline points="${pts.join(" ")}" class="s-gamma f-none" stroke-width="3"/>`;
    if (o.marks) [[30, V30], [14, V14], [7, V7], [1, V1]].forEach(([d, v], k) => { s += `<g opacity="${seg(o.t, 0.2 + k * 0.15, 0.4 + k * 0.15)}"><circle cx="${X(d)}" cy="${Y(v)}" r="5" class="f-hl"/><text x="${X(d)}" y="${Y(v) - 12}" text-anchor="middle" class="t-ink t-b">${v}</text></g>`; });
    return { s, X, Y };
  }

  const STEPS = [
    { cap: "權利金可以拆成兩塊：<b>內含價值</b>（現在馬上履約值多少）＋ <b>時間價值</b>（剩下的部分）。",
      why: "內含價值是確定的；時間價值是「離到期還有時間，價格可能往有利方向走」的價格。時間越長、不確定性越大，時間價值越高。", stuck: "像一張還沒開獎的彩券：現在對到的號碼是內含價值，還能再等開獎的機會是時間價值。" },
    { cap: "<b>內含價值</b>：27,000 Call，現價 27,200 時，馬上履約值 200 點；現價在 27,000 以下，內含價值是 <b>0</b>（不會是負的）。",
      why: "Call 的內含價值 ＝ 現價 − 履約價（最小是 0）；Put ＝ 履約價 − 現價（最小是 0）。有內含價值的叫<b>價內</b>，沒有的叫<b>價外</b>，現價剛好在履約價附近叫<b>價平</b>。", dur: 2200 },
    { cap: "例：NQ 在 27,000，30 天後到期的 <b>26,700 Call</b> 值 " + ITM + " 點。內含價值 300（27,000 − 26,700），其餘 <b>" + (ITM - 300) + " 點是時間價值</b>。",
      why: "這些權利金是用 Black-76 模型、IV 20% 估算的，跟真實市場報價會有差距，但結構一樣。", dur: 2200 },
    { cap: "換你算：NQ 在 27,000，30 天的 <b>27,000 Call</b>（價平）值 " + V30 + " 點。",
      q: { t: "其中時間價值是多少點？", o: [
        [V30 + " 點，全部都是", true, "價平時內含價值是 0（27,000 − 27,000），所以 " + V30 + " 點全部是時間價值。"],
        ["0 點", false, "內含價值才是 0。權利金不是 0，所以時間價值就是整個權利金。"],
        [(V30 - 300) + " 點", false, "沒有 300 點的內含價值，價平的內含價值是 0。"]] } },
    { cap: "時間價值會<b>隨著到期越來越少</b>，到期那一刻歸零。價平 Call：30 天時 " + V30 + "、14 天 " + V14 + "、7 天 " + V7 + "、剩 1 天只剩 " + V1 + " 點。",
      why: "注意曲線的形狀：一開始掉得慢，越接近到期掉得越快。這是因為時間價值大約跟「剩下時間的平方根」成正比。", dur: 3000 },
    { cap: "每天流失多少叫 <b>Theta</b>。價平 Call 在 30 天時每天約掉 <b>" + TH30 + " 點</b>，7 天時約 <b>" + TH7 + " 點</b>，剩 1 天時約 <b>" + TH1 + " 點</b>。",
      why: "Theta 對買方是成本（每天少一點），對賣方是收入（每天賺一點）。這也是為什麼很多造市商、機構喜歡當賣方：時間站在他們那一邊。", dur: 2400 },
    { cap: "想一想：價格一整天都沒動。",
      q: { t: "誰會因為時間過去而賺錢？", o: [
        ["選擇權買方", false, "買方付了時間價值，時間過去，時間價值流失，買方在虧。"],
        ["選擇權賣方", true, "賣方收下的時間價值每天都在流失，價格不動時，賣方就慢慢賺到這些時間價值。"],
        ["沒有人，價格沒動就沒有損益", false, "價格沒動，選擇權的價格還是會因為時間流失而下跌。"]] } },
    { cap: "時間價值在<b>價平最大</b>，越往價內或價外越小。因為價平時「到期會不會有價值」最不確定。",
      why: "很深的價內，幾乎確定有價值，像在買期貨；很遠的價外，幾乎確定沒價值。最不確定的價平，時間價值最高。", dur: 2400 },
    { cap: "價外選擇權<b>全部都是時間價值</b>。如果到期前價格沒有走過履約價，它會<b>歸零</b>。",
      why: "很多新手喜歡買便宜的價外選擇權，覺得「賠也賠不多」。但如果價格不動或動得不夠，每天都在流失，到期就是全部虧掉。" },
    { cap: "練習一下：你買了一口價外的 27,300 Call，放到到期，NQ 最後收在 27,200。",
      q: { t: "這口 Call 到期時值多少？", o: [
        ["100 點", false, "價格還在履約價 27,300 下面，沒有內含價值。"],
        ["0，時間價值流光了、也沒有內含價值", true, "到期時時間價值歸零；27,200 低於 27,300，內含價值也是 0。整個權利金都虧掉。"],
        ["跟買的時候一樣", false, "時間價值會隨時間流失，到期時一定歸零。"]] } },
    { cap: "時間不只影響價格，也影響其他數字：越接近到期，價平附近的選擇權對價格越敏感。這會在第 3 關（Gamma）和第 8 關（到期日效應）看到。",
      why: "快到期時，價平附近的選擇權價值變化很劇烈，造市商的對沖也會跟著變大。這是 GEX 位階在到期日特別重要的原因。" },
    { cap: "整理：<b>權利金 ＝ 內含價值 ＋ 時間價值</b>。時間價值在價平最大，隨到期流失、越接近到期掉越快；Theta 是買方的成本、賣方的收入。",
      why: "下一關會看選擇權價格怎麼跟著期貨價格動：Delta 和 Gamma。" }
  ];

  function draw(svg, i, t) {
    const e = ease(t); let s = "";
    if (i === 0) {
      s += `<text x="80" y="90" class="t-ink t-b t-lg">權利金</text>` + split(80, 110, 480, 300, ITM - 300, seg(t, 0.1, 0.5));
      s += `<g opacity="${seg(t, 0.5, 1)}"><text x="80" y="200" class="t-buy t-b">內含價值：現在馬上履約值多少</text><text x="80" y="230" class="t-gamma t-b">時間價值：還有時間、可能變得更有價值的價格</text></g>`;
    } else if (i === 1) {
      const X = (p) => lerp(90, 590, (p - 26600) / 800), Y = (v) => lerp(320, 80, v / 500);
      s += `<line x1="90" x2="590" y1="320" y2="320" class="s-ink"/>${[26600, 26800, 27000, 27200, 27400].map((p) => `<text x="${X(p)}" y="342" text-anchor="middle" class="t-mute">${p.toLocaleString()}</text>`).join("")}`;
      s += `<polyline points="${X(26600)},${Y(0)} ${X(27000)},${Y(0)} ${X(27400)},${Y(400)}" class="s-buy f-none" stroke-width="3" opacity="${seg(t, 0, 0.5)}"/><text x="90" y="60" class="t-mute">27,000 Call 的內含價值</text>`;
      s += `<g opacity="${seg(t, 0.4, 0.9)}"><circle cx="${X(27200)}" cy="${Y(200)}" r="6" class="f-buy"/><text x="${X(27200)}" y="${Y(200) - 14}" text-anchor="middle" class="t-buy t-b">現價 27,200 → 200</text><circle cx="${X(26800)}" cy="${Y(0)}" r="6" class="f-inkd"/><text x="${X(26800)}" y="${Y(0) - 14}" text-anchor="middle" class="t-mute">現價 26,800 → 0</text></g>`;
      s += `<g opacity="${seg(t, 0.7, 1)}"><text x="${X(26750)}" y="110" text-anchor="middle" class="t-mute">價外</text><text x="${X(27000)}" y="110" text-anchor="middle" class="t-ink t-b">價平</text><text x="${X(27250)}" y="110" text-anchor="middle" class="t-buy">價內</text></g>`;
    } else if (i === 2 || i === 3) {
      if (i === 2) s += `<text x="80" y="90" class="t-ink t-b t-lg">26,700 Call，現價 27,000，30 天：${ITM} 點</text>` + split(80, 110, 480, 300, ITM - 300, seg(t, 0, 0.6));
      else s += `<text x="80" y="90" class="t-ink t-b t-lg">27,000 Call，現價 27,000，30 天：${V30} 點</text><rect x="80" y="110" width="${V30 * 0.6}" height="40" rx="5" class="f-none s-ink" stroke-dasharray="5 4"/><text x="90" y="135" class="t-ink t-b">內含？時間？</text>`;
      if (i === 2) s += `<text x="80" y="200" class="t-mute" opacity="${seg(t, 0.6, 1)}">27,000 − 26,700 ＝ 300 是內含價值，剩下 ${ITM - 300} 是時間價值</text>`;
    } else if (i === 4) {
      s += decay(30 * seg(t, 0, 0.85), { marks: true, t }).s;
    } else if (i === 5) {
      const g = decay(30);
      [[30, TH30], [7, TH7], [1, TH1]].forEach(([d, th], k) => { s += `<g opacity="${seg(t, k * 0.25, k * 0.25 + 0.3)}"><circle cx="${g.X(d)}" cy="${g.Y(C(27000, 27000, d))}" r="6" class="f-sell"/><text x="${g.X(d) + (d === 1 ? -10 : 10)}" y="${g.Y(C(27000, 27000, d)) + (d === 1 ? 26 : -10)}" text-anchor="${d === 1 ? "end" : "start"}" class="t-sell t-b">每天 −${th} 點</text></g>`; });
      s = g.s + s;
    } else if (i === 6) {
      s += decay(30).s + chip(340, 200, "價格一整天沒動，誰賺？", "hl");
    } else if (i === 7) {
      const X = (k) => lerp(90, 590, (k - 26200) / 1600), Y = (v) => lerp(320, 70, v / 650);
      const pts = []; for (let K = 26200; K <= 27800; K += 25) { const v = C(27000, K, 30) - Math.max(0, 27000 - K); pts.push(`${X(K)},${Y(v)}`); }
      const n = Math.max(2, Math.ceil(seg(t, 0, 0.8) * pts.length));
      s += `<line x1="90" x2="590" y1="320" y2="320" class="s-ink"/>${[26200, 26600, 27000, 27400, 27800].map((p) => `<text x="${X(p)}" y="342" text-anchor="middle" class="t-mute">${p.toLocaleString()}</text>`).join("")}<text x="90" y="50" class="t-mute">不同履約價的時間價值（現價 27,000、30 天）</text>`;
      s += `<polyline points="${pts.slice(0, n).join(" ")}" class="s-gamma f-none" stroke-width="3"/>`;
      s += `<g opacity="${seg(t, 0.7, 1)}"><text x="${X(27000)}" y="${Y(C(27000, 27000, 30)) - 12}" text-anchor="middle" class="t-gamma t-b">價平最大</text><text x="${X(26350)}" y="290" text-anchor="middle" class="t-mute">深價內：小</text><text x="${X(27650)}" y="290" text-anchor="middle" class="t-mute">遠價外：小</text></g>`;
    } else if (i === 8 || i === 9) {
      const X = (d) => lerp(590, 90, d / 30), Y = (v) => lerp(320, 80, v / 500);
      const pts = []; for (let d = 30; d >= 0; d -= 0.25) pts.push(`${X(d)},${Y(C(27000, 27300, d))}`);
      const n = i === 9 ? pts.length : Math.max(2, Math.ceil(seg(t, 0, 0.85) * pts.length));
      s += `<line x1="90" x2="590" y1="320" y2="320" class="s-ink"/>${[30, 14, 7, 0].map((d) => `<text x="${X(d)}" y="342" text-anchor="middle" class="t-mute">${d === 0 ? "到期" : d + " 天"}</text>`).join("")}<text x="90" y="50" class="t-mute">價外 27,300 Call（價格一直在 27,000）</text>`;
      s += `<polyline points="${pts.slice(0, n).join(" ")}" class="s-sell f-none" stroke-width="3"/>`;
      if (i === 8 && t > 0.85) s += `<text x="${X(0) - 6}" y="${Y(0) - 12}" text-anchor="end" class="t-sell t-b">歸零</text>`;
      if (i === 9) s += chip(340, 160, "到期收在 27,200，值多少？", "hl");
    } else if (i === 10) {
      const X = (p) => lerp(90, 590, (p - 26400) / 1200);
      [[30, "s-ink", 0.5], [7, "s-gamma", 0.8], [1, "s-sell", 1]].forEach(([d, c, op], k) => {
        const pts = []; for (let F = 26400; F <= 27600; F += 10) pts.push(`${X(F)},${lerp(320, 60, B(F, 27000, 0.2, d).gamma * 1e4 / 15)}`);
        s += `<g opacity="${seg(t, k * 0.25, k * 0.25 + 0.3)}"><polyline points="${pts.join(" ")}" class="${c} f-none" stroke-width="2.5" opacity="${op}"/><text x="${X(27000) + 8}" y="${lerp(320, 60, B(27000, 27000, 0.2, d).gamma * 1e4 / 15) - 6}" class="${c.replace("s-", "t-")} t-b">${d} 天</text></g>`;
      });
      s += `<line x1="90" x2="590" y1="320" y2="320" class="s-ink"/><text x="90" y="44" class="t-mute">對價格的敏感度（Gamma）：越接近到期，價平越尖</text>`;
    } else if (i === 11) {
      s += cards([["權利金", "內含價值 ＋ 時間價值"], ["內含價值", "Call：現價 − 履約價；Put：履約價 − 現價（最小 0）"], ["時間價值", "價平最大，隨到期流失，越接近到期掉越快"], ["Theta", "每天流失多少：買方成本、賣方收入"], ["價外", "全部是時間價值，到期沒走過去就歸零"]], t, { hl: 2 });
    }
    svg.innerHTML = s;
  }

  /* ---------- 你來操作 ---------- */
  const simHTML = `<div class="controls"><div class="ctl"><label>NQ 現價 <b class="t2-f-v"></b></label><input class="t2-f" type="range" min="26400" max="27600" step="25" value="27000"></div><div class="ctl"><label>履約價 <b class="t2-k-v"></b></label><input class="t2-k" type="range" min="26400" max="27600" step="100" value="27000"></div><div class="ctl"><label>離到期 <b class="t2-d-v"></b></label><input class="t2-d" type="range" min="0" max="30" step="0.5" value="30"></div></div>
<div class="tabs t2-type"><button class="tab" data-t="call" aria-selected="true" type="button">Call</button><button class="tab" data-t="put" aria-selected="false" type="button">Put</button></div>
<svg class="fpx t2-svg" viewBox="0 0 640 200" role="img" aria-label="權利金拆解"></svg><div class="t2-out"></div><ul class="sim-task t2-task"></ul>`;
  function simMount(box) {
    const q = (s) => box.querySelector(s); let type = "call"; const done = {};
    function paint() {
      const F = +q(".t2-f").value, K = +q(".t2-k").value, d = +q(".t2-d").value;
      q(".t2-f-v").textContent = F.toLocaleString(); q(".t2-k-v").textContent = K.toLocaleString(); q(".t2-d-v").textContent = d === 0 ? "到期" : d + " 天";
      const r = d > 0 ? B(F, K, 0.2, d) : null, p = d > 0 ? (type === "call" ? r.call : r.put) : Math.max(0, type === "call" ? F - K : K - F);
      const intr = Math.max(0, type === "call" ? F - K : K - F), tv = Math.max(0, p - intr), th = d > 0 ? Math.abs(r.theta) : 0;
      const where = Math.abs(F - K) <= 50 ? "價平" : intr > 0 ? "價內" : "價外";
      q(".t2-svg").innerHTML = `<text x="20" y="40" class="t-ink t-b t-lg">${K.toLocaleString()} ${type === "call" ? "Call" : "Put"}：${Math.round(p)} 點（$${Math.round(p * 20).toLocaleString()}）　${where}</text>` + split(20, 70, 600, Math.round(intr), Math.round(tv), 1) + `<text x="20" y="150" class="t-mute">每天時間價值流失約 ${th.toFixed(1)} 點（Theta）</text>`;
      q(".t2-out").innerHTML = `<p class="small">內含價值 ${Math.round(intr)} 點、時間價值 ${Math.round(tv)} 點。Black-76、IV 20%，只是示意。</p>`;
      if (where === "價外" && d === 0) done.a = true;
      if (where === "價平" && d <= 2 && d > 0) done.b = true;
      if (where === "價內" && tv < 30 && d > 0) done.c = true;
      q(".t2-task").innerHTML = [["a", "任務 1：把一口價外選擇權拉到到期，看權利金變成多少"], ["b", "任務 2：找一口價平、剩 2 天以內的選擇權，看 Theta 有多大"], ["c", "任務 3：找一口深價內、時間價值不到 30 點的選擇權"]].map(([k, tx]) => `<li class="${done[k] ? "ok" : ""}">${done[k] ? "✓" : "○"} ${tx}</li>`).join("");
    }
    box.addEventListener("input", paint);
    box.addEventListener("click", (e) => { const b = e.target.closest(".t2-type .tab"); if (!b) return; type = b.dataset.t; box.querySelectorAll(".t2-type .tab").forEach((x) => x.setAttribute("aria-selected", String(x === b))); paint(); });
    paint();
  }

  const QS = [
    { fig: `<p class="small q-cap">NQ 在 26,800。一口 27,000 Put 的權利金是 420 點。</p>`, q: "內含價值和時間價值各是多少？", step: 3, o: [
      ["內含 200、時間 220", true, "Put 的內含價值 ＝ 履約價 − 現價 ＝ 27,000 − 26,800 ＝ 200；剩下 220 是時間價值。"],
      ["內含 0、時間 420", false, "Put 在現價低於履約價時是價內，有內含價值。"],
      ["內含 420、時間 0", false, "還沒到期，一定還有時間價值。"]] },
    { fig: `<p class="small q-cap">兩口同樣是價平的 Call，一口剩 20 天、一口剩 2 天。</p>`, q: "哪一口每天流失的時間價值比較多？", step: 6, o: [
      ["剩 20 天的", false, "剩 20 天的時間價值比較多，但每天流失得比較慢。"],
      ["剩 2 天的", true, "越接近到期，時間價值掉得越快。剩 2 天的 Theta 比剩 20 天的大很多。"],
      ["一樣多", false, "時間價值不是平均流失的，越接近到期越快。"]] },
    { fig: `<p class="small q-cap">小明說：「價外選擇權很便宜，買了放著，最多賠一點點。」</p>`, q: "這個說法哪裡有問題？", step: 9, o: [
      ["沒問題，便宜就是風險小", false, "便宜代表需要價格動很多才會賺錢。價格不動，就會全部虧掉。"],
      ["價外全是時間價值，價格沒走過履約價，到期會全部歸零", true, "便宜不代表容易賺。價外選擇權每天都在流失時間價值，最常見的結果是全部虧掉。"],
      ["價外選擇權不會歸零", false, "到期時沒有內含價值的選擇權，一定歸零。"]] }
  ];

  PAGES["op-2"] = window.KIT.page(window.COURSE.OPC, "op-2", {
    topic: "時間價值",
    lede: "為什麼一口 27,000 Call 在現價 27,000 時還值六百多點？因為權利金除了「現在值多少」，還包含「時間」的價格。這一關把權利金拆開，看時間價值怎麼一天一天流失。",
    analogy: [
      ["還沒開獎的彩券", "現在已經對中的號碼是<b>內含價值</b>；還能等開獎、可能中更多的機會是<b>時間價值</b>。"],
      ["融化的冰塊", "冰塊放在桌上會慢慢融化，越小融得越快。時間價值也是越接近到期，流失得越快。"],
      ["保險的保費", "保障期間越長，保費越貴。選擇權離到期越久，時間價值越高。"]],
    steps: STEPS, draw, simHTML, simMount,
    simIntro: "調整現價、履約價和離到期天數，看權利金怎麼拆成內含價值和時間價值，以及每天流失多少。",
    mist: [
      ["權利金就是選擇權的內含價值", "權利金還包含時間價值。價平和價外的選擇權，權利金全部都是時間價值。"],
      ["時間價值每天流失一樣多", "越接近到期掉得越快。最後一兩天的 Theta 可能是一個月前的好幾倍。"],
      ["價外選擇權便宜，賠不了多少", "便宜是因為它很可能歸零。價格不動，整個權利金都會虧掉。"]],
    faq: [
      ["價內、價平、價外怎麼分？", "Call：現價高於履約價是價內，低於是價外；Put 相反。現價在履約價附近就是價平。"],
      ["時間價值為什麼在價平最大？", "因為價平時「到期會不會有價值」最不確定。深價內幾乎確定有價值、遠價外幾乎確定沒價值，不確定性小，時間價值就小。"],
      ["Theta 會變成正的嗎？", "對買方來說 Theta 是負的（每天少一點）；對賣方來說是正的（每天多賺一點）。同一個數字，看你站在哪一邊。"],
      ["週末時間價值也會流失嗎？", "模型上時間是連續的，週末也算。實際上市場常在週五先反映週末的流失，細節依造市商的定價方式而定。"],
      ["這裡的權利金準嗎？", "這裡用 Black-76 模型、固定 IV 20% 估算，用來看結構。真實的報價還會受偏斜、供需影響（第 5 關會講偏斜）。"],
      ["0DTE 是什麼？", "當天到期（0 Days To Expiration）的選擇權。時間價值非常少、Theta 和 Gamma 非常大，第 8 關會詳細講它對價格的影響。"]],
    qs: QS,
    gloss: [
      ["內含價值", "現在馬上履約值多少。Call：現價 − 履約價；Put：履約價 − 現價（最小 0）。"],
      ["時間價值", "權利金減掉內含價值，到期時歸零。"],
      ["價內／價平／價外", "有內含價值／現價接近履約價／沒有內含價值。"],
      ["Theta", "時間價值每天流失多少。"],
      ["Black-76", "期貨選擇權的定價模型，這套筆記用它來估算權利金。"],
      ["0DTE", "當天到期的選擇權。"]],
    remember: "<b>權利金 ＝ 內含價值 ＋ 時間價值。</b>時間價值在價平最大，越接近到期流失越快；Theta 是買方的成本、賣方的收入。"
  });
})();
