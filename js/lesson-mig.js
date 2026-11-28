/* 路線 1 第 17 關（補充）：價值轉換——比較連續幾天的價值區，看價值往哪邊走。例子都是虛構數字。 */
(function () {
  const PAGES = (window.__PAGES = window.__PAGES || {});
  const { lerp, ease, seg, cards } = window.KIT;
  const D = [{ val: 100, vah: 104, poc: 102 }, { val: 101, vah: 105, poc: 103 }, { val: 105.5, vah: 109, poc: 107 }, { val: 107.5, vah: 111.5, poc: 109.5 }];
  const X = (d) => lerp(100, 560, d / 3);
  const Y = (p) => lerp(340, 40, (p - 98) / (114 - 98));
  const ann = (txt, y = 26, cls = "t-ink t-b") => `<text x="90" y="${y}" class="${cls}">${txt}</text>`;
  // 兩天價值區的關係：重疊量 ÷ 較窄那一天的寬度
  function relate(y, t) {
    const ov = Math.max(0, Math.min(y.vah, t.vah) - Math.max(y.val, t.val)), w = Math.min(y.vah - y.val, t.vah - t.val), r = w ? ov / w : 0;
    const dir = (t.val + t.vah) / 2 > (y.val + y.vah) / 2 ? "往上" : (t.val + t.vah) / 2 < (y.val + y.vah) / 2 ? "往下" : "沒移動";
    if (ov === 0) return { k: "完全不重疊", dir, txt: `完全不重疊、${dir}：價值轉換很強（還要看市場有沒有接受）` };
    if (r >= 0.5) return { k: "大幅重疊", dir, txt: "大幅重疊：多空對價值還有共識，平衡／盤整" };
    return { k: "部分重疊", dir, txt: `部分重疊、${dir}：溫和轉換，可能隨時回到平衡` };
  }
  function va(d, o = {}) {
    const v = o.v || D[d], x = X(d), w = o.w || 56, c = o.cls || "buy";
    let s = `<rect x="${x - w / 2}" y="${Y(v.vah)}" width="${w}" height="${Y(v.val) - Y(v.vah)}" rx="6" class="${o.dead ? "f-surface" : c === "buy" ? "f-buy" : "f-hl"}" opacity="${o.dead ? 0.9 : 0.28}"/>`;
    s += `<rect x="${x - w / 2}" y="${Y(v.vah)}" width="${w}" height="${Y(v.val) - Y(v.vah)}" rx="6" class="f-none ${o.dead ? "s-line" : c === "buy" ? "s-buy" : "s-hl"}" stroke-width="${o.hl ? 3 : 2}" ${o.dead ? 'stroke-dasharray="5 4"' : ""}/>`;
    if (v.poc != null) s += `<line x1="${x - w / 2}" x2="${x + w / 2}" y1="${Y(v.poc)}" y2="${Y(v.poc)}" class="s-ink" stroke-width="2"/>`;
    if (!o.nolab) s += `<text x="${x + w / 2 + 8}" y="${Y(v.vah) + 4}" class="t-mute">VAH ${v.vah}</text><text x="${x + w / 2 + 8}" y="${Y(v.val) + 4}" class="t-mute">VAL ${v.val}</text>`;
    return s + `<text x="${x}" y="${Y(v.val) + 20}" text-anchor="middle" class="t-ink t-b">${o.name || "第 " + (d + 1) + " 天"}</text>`;
  }
  function axis() {
    let s = "";
    for (let p = 100; p <= 112; p += 4) s += `<line x1="60" x2="610" y1="${Y(p)}" y2="${Y(p)}" class="s-line"/><text x="54" y="${Y(p) + 4}" text-anchor="end" class="t-mute">${p}</text>`;
    return s;
  }
  const arrow = (a, b, op = 1) => `<g opacity="${op}"><line x1="${X(a) + 32}" y1="${Y((D[a].val + D[a].vah) / 2)}" x2="${X(b) - 36}" y2="${Y((D[b].val + D[b].vah) / 2)}" class="s-hl" stroke-width="3"/><circle cx="${X(b) - 36}" cy="${Y((D[b].val + D[b].vah) / 2)}" r="5" class="f-hl"/></g>`;

  const STEPS = [
    { cap: "先回想價值區：一天裡約 <b>70% 的成交</b>集中的價格範圍，上緣 VAH、下緣 VAL，中間成交最多的是 POC。",
      why: "價值區代表那一天「大家認同的合理價」。價格離開它越遠，成交越少，也越容易被拉回來。", stuckHref: "#of-6", stuckLabel: "回第 7 關複習價值區 →", stuck: "價值區＝約 70% 成交集中的範圍；POC 是其中成交最多的那一個價位。" },
    { cap: "只看一天，只知道「今天市場認同哪裡」。把<b>連續兩天</b>放在一起：第 2 天的價值區和第 1 天<b>大幅重疊</b>。",
      why: "大幅重疊代表今天大家認同的價格，跟昨天差不多。多空對價值還有共識，市場處在<b>平衡</b>，價格在價值區內來回。", dur: 2400 },
    { cap: "第 3 天的價值區<b>整個跑到第 2 天的上方</b>，一點也不重疊。價值往上搬家了，這叫<b>價值轉換</b>。",
      why: "買方願意在更高的價格成交，舊的價值區不再被接受。完全不重疊是最強的轉換訊號；但要先確認市場真的接受了新價格（第 5 步會教）。", dur: 2800 },
    { cap: "換你判斷：第 4 天的價值區是 107.5～111.5，第 3 天是 105.5～109。",
      q: { t: "第 4 天跟第 3 天比，是什麼關係？", o: [
        ["部分重疊、往上：溫和的轉換", true, "重疊的只有 107.5～109（不到較窄那天的一半），而且整體往上。是溫和轉換，可能隨時回到平衡。"],
        ["完全不重疊：強轉換", false, "兩天在 107.5～109 之間有重疊。"],
        ["大幅重疊：還是平衡", false, "重疊的部分不到較窄那天寬度的一半，不算大幅重疊。"]] } },
    { cap: "整理三種關係：<b>大幅重疊＝平衡</b>、<b>部分重疊＝溫和轉換</b>、<b>完全不重疊＝強轉換</b>。往上是上升趨勢的證據，往下是下降趨勢的證據。",
      why: "「大幅」和「部分」的分界沒有標準答案，這裡用「重疊量是否超過較窄那天的一半」當教學門檻。實務上要看商品和你自己的紀錄。" },
    { cap: "離開價值區<b>不等於</b>轉換。價格突破 VAH 之後，要看市場是<b>接受</b>還是<b>拒絕</b>：左邊很快被打回，右邊留在上面持續成交。",
      why: "被拒絕：回到舊價值區，維持平衡。被接受：新價值區在新價位形成，轉換才算完成。這和 Market Profile 那一關的接受與拒絕是同一件事。", stuckHref: "#of-7", stuckLabel: "回第 9 關複習接受與拒絕 →", stuck: "接受＝在新區域停留夠久、持續成交；拒絕＝很快被打回。", dur: 3000 },
    { cap: "換你判斷：價格突破昨天的 VAH 之後，在上面停留了好幾段時間，成交也很大。",
      q: { t: "這比較像哪一種？", o: [
        ["被接受：價值可能正在轉換", true, "停留夠久、持續成交，就是市場接受了新的價格。這時新的價值區開始在上面形成。"],
        ["被拒絕：價格會馬上回到價值區", false, "被拒絕的特徵是很快被打回來，這裡價格留在上面。"],
        ["看不出來，要等收盤", false, "盤中就可以從停留時間和成交量判斷接受或拒絕。"]] } },
    { cap: "價值轉換之後，舊價值區已經<b>不能代表現在的價格</b>。要找<b>不平衡起始點</b>（離開舊平衡、開始單邊走的位置），從那裡<b>重新錨定</b>，算出新的 VAH 和 VAL。",
      why: "舊平衡區的成交不再算進來，只看起始點之後的成交。如果還拿舊的價值區判斷貴賤，價格明明已經在新價值區裡，卻會被誤認為很貴或很便宜。",
      q: { t: "價值已經往上轉換，卻還拿舊價值區判斷貴賤，會怎樣？", o: [
        ["把新價值區裡的價格誤判成偏貴", true, "舊的 VAH 已經落在新價值區的下面，新價值裡的價格看起來都在「舊 VAH 之上」，就會被誤認為太貴。"],
        ["沒有影響，兩個價值區一樣", false, "轉換就是價值區搬了家，兩者不一樣。"],
        ["判斷會變得更準", false, "舊的價值區已經不能代表現在大家認同的價格。"]] }, dur: 3000 },
    { cap: "新的平衡出現後，要用<b>接觸點確認</b>：新區間的上緣、下緣<b>各被碰到兩次</b>，新的價值結構才算成立。",
      why: "只碰一次，可能只是走勢途中的停頓。上下各兩次，代表買方在下緣、賣方在上緣都重複出現，市場對這個範圍有了共識。", dur: 3000 },
    { cap: "確認之後，才能說誰貴誰便宜：<b>VAH 以上＝相對溢價</b>、<b>VAL 以下＝相對折價</b>、中間是合理價值。而且只相對於「新的」價值結構成立。",
      why: "折價和溢價沒有絕對的標準。價值轉換後必須重新錨定，不然用舊結構判斷，會看錯貴和便宜。" },
    { cap: "整理：<b>看連續幾天的價值區往哪走 → 離開要看接受或拒絕 → 轉換後從起始點重新錨定 → 上下各碰兩次才確認 → 溢價與折價只相對新結構。</b>" }
  ];

  function draw(svg, i, t) {
    const e = ease(t); let s = axis();
    if (i === 0) s += va(0, { hl: true }) + ann("一天的價值區：VAH、VAL、POC") + `<text x="${X(0) + 40}" y="${Y(102) - 10}" class="t-ink" opacity="${seg(t, 0.4, 1)}">POC（黑線）</text>`;
    else if (i === 1) {
      s += `<rect x="${X(0) - 28}" y="${Y(104)}" width="${X(1) - X(0) + 56}" height="${Y(101) - Y(104)}" class="f-hl" opacity="${0.18 * seg(t, 0.2, 0.8)}"/>` + va(0) + va(1) + ann("第 2 天和第 1 天大幅重疊 → 平衡");
    } else if (i === 2) s += va(0, { nolab: true }) + va(1, { nolab: true }) + va(2, { hl: true }) + arrow(1, 2, seg(t, 0.2, 0.8)) + ann("第 3 天整個在第 2 天上方 → 價值往上轉換") + `<text x="${X(2)}" y="${Y(105.25) - 6}" text-anchor="middle" class="t-hl t-b" opacity="${seg(t, 0.5, 1)}">不重疊</text>`;
    else if (i === 3) s += va(0, { nolab: true }) + va(1, { nolab: true }) + va(2) + va(3, { hl: true }) + ann("第 4 天（107.5–111.5）和第 3 天比？") + `<text x="${X(3)}" y="${Y(113.2)}" text-anchor="middle" class="t-hl t-b t-lg">?</text>`;
    else if (i === 4) s = cards([["大幅重疊 ＝ 平衡", "今天和昨天大家認同的價格差不多，價格在價值區內來回"], ["部分重疊 ＝ 溫和轉換", "價值在移動，但還有交集，可能隨時回到平衡"], ["完全不重疊 ＝ 強轉換", "今天整個價值區跑到昨天的外面"], ["往上／往下", "往上是上升趨勢的證據，往下是下降趨勢的證據"]], t, { h: 56, gap: 70, y: 30 });
    else if (i === 5 || i === 6) {
      const A = [[110, 340], [150, 300], [190, 250], [230, 208], [270, 250], [310, 300]], Bp = [[380, 300], [420, 250], [460, 208], [500, 200], [540, 205], [580, 198]];
      const line = (pts, cls) => `<polyline points="${pts.map((p) => p.join(",")).join(" ")}" class="${cls} f-none" stroke-width="3"/>`;
      s = `<rect x="70" y="${Y(109)}" width="540" height="${Y(105.5) - Y(109)}" class="f-buy" opacity="0.14"/><line x1="70" x2="610" y1="${Y(109)}" y2="${Y(109)}" class="s-hl" stroke-width="2" stroke-dasharray="6 4"/><text x="76" y="${Y(109) - 6}" class="t-ink t-b">價值區上緣 VAH</text>` +
        line(A, "s-sell") + line(Bp, "s-buy") + `<text x="190" y="${Y(98.4)}" text-anchor="middle" class="t-sell t-b">A　被拒絕：很快被打回</text><text x="480" y="${Y(98.4)}" text-anchor="middle" class="t-buy t-b">B　被接受：留在上面持續成交</text>`;
      s += `<g opacity="${seg(t, 0.3, 0.9)}"><text x="230" y="${Y(109) - 22}" text-anchor="middle" class="t-ink">衝上去又掉回來</text><text x="540" y="${Y(109) - 28}" text-anchor="middle" class="t-ink">停了好幾段</text></g>`;
      if (i === 6) s += `<text x="340" y="${Y(112.6)}" text-anchor="middle" class="t-hl t-b t-lg">哪一種？</text>`;
    } else if (i === 7) {
      s += va(1, { dead: true, nolab: true, name: "舊價值區" }) + va(3, { name: "新價值區", cls: "hl", hl: true }) +
        `<g opacity="${seg(t, 0.2, 0.7)}"><circle cx="${(X(1) + X(3)) / 2}" cy="${Y(105.6)}" r="7" class="f-hl"/><text x="${(X(1) + X(3)) / 2}" y="${Y(105.6) + 26}" text-anchor="middle" class="t-ink t-b">不平衡起始點</text><text x="${(X(1) + X(3)) / 2}" y="${Y(105.6) + 44}" text-anchor="middle" class="t-mute">從這裡重新算新的分佈</text></g>` + ann("轉換後從起始點重新錨定");
    } else if (i === 8) {
      const lo = 107.5, hi = 111.5, xs = [110, 200, 290, 380, 470, 560], ps = [109.5, 111.5, 107.5, 111.5, 107.5, 109.5];
      const pts = xs.map((x, k) => [x, Y(ps[k])]);
      const n = Math.min(pts.length, 2 + Math.floor(e * 4.99));
      s += `<rect x="70" y="${Y(hi)}" width="540" height="${Y(lo) - Y(hi)}" class="f-hl" opacity="0.14"/><line x1="70" x2="610" y1="${Y(hi)}" y2="${Y(hi)}" class="s-hl" stroke-width="2"/><line x1="70" x2="610" y1="${Y(lo)}" y2="${Y(lo)}" class="s-hl" stroke-width="2"/>` +
        `<polyline points="${pts.slice(0, n).map((p) => p.join(",")).join(" ")}" class="s-ink f-none" stroke-width="3"/>`;
      [[1, 1], [2, 1], [3, 2], [4, 2]].forEach(([k, c]) => { if (k < n) s += `<circle cx="${pts[k][0]}" cy="${pts[k][1]}" r="11" class="f-buy"/><text x="${pts[k][0]}" y="${pts[k][1] + 5}" text-anchor="middle" class="t-w t-b">${c}</text>`; });
      s += ann("上緣、下緣各碰兩次（圓圈裡是第幾次）") + `<text x="76" y="${Y(hi) - 6}" class="t-ink t-b">新 VAH</text><text x="76" y="${Y(lo) + 16}" class="t-ink t-b">新 VAL</text>`;
    } else if (i === 9) {
      const lo = 107.5, hi = 111.5;
      s += `<rect x="120" y="${Y(hi)}" width="400" height="${Y(lo) - Y(hi)}" class="f-hl" opacity="0.14"/><line x1="120" x2="520" y1="${Y(hi)}" y2="${Y(hi)}" class="s-hl" stroke-width="2"/><line x1="120" x2="520" y1="${Y(lo)}" y2="${Y(lo)}" class="s-hl" stroke-width="2"/>` +
        `<text x="320" y="${Y(hi) - 30}" text-anchor="middle" class="t-sell t-b t-lg" opacity="${seg(t, 0.1, 0.5)}">VAH 以上：相對溢價</text><text x="320" y="${Y((hi + lo) / 2) + 6}" text-anchor="middle" class="t-ink t-b t-lg" opacity="${seg(t, 0.3, 0.7)}">合理價值</text><text x="320" y="${Y(lo) + 36}" text-anchor="middle" class="t-buy t-b t-lg" opacity="${seg(t, 0.5, 0.9)}">VAL 以下：相對折價</text>` + ann("貴或便宜，只相對於「新的」價值結構");
    } else s = cards([["看連續幾天", "今天的價值區相對昨天往哪走、重疊多少"], ["接受或拒絕", "離開價值區後，看有沒有停留和持續成交"], ["重新錨定", "從不平衡起始點重算，舊平衡區的成交不再算"], ["上下各碰兩次", "新的價值結構才算成立；溢價與折價只相對新結構"]], t, { h: 56, gap: 70, y: 30 });
    svg.innerHTML = s;
  }

  /* ---------- 你來操作：調整「今天」的價值區，看和昨天的關係 ---------- */
  const Y0 = { val: 100, vah: 104 };
  const simHTML = `<div class="controls"><div class="ctl"><label>今天價值區的下緣 VAL <b class="mg-v"></b></label><input class="mg-lo" type="range" min="92" max="112" step="0.5" value="101"></div>
<div class="ctl"><label>今天價值區的寬度 <b class="mg-w"></b></label><input class="mg-wd" type="range" min="2" max="8" step="0.5" value="4"></div></div>
<svg class="fpx mg-svg" viewBox="0 0 640 380" role="img" aria-label="價值區比較"></svg><p class="sim-msg mg-msg" aria-live="polite"></p><ul class="sim-task mg-task"></ul>`;
  function simMount(box) {
    const q = (s) => box.querySelector(s); const done = {};
    function paint() {
      const lo = +q(".mg-lo").value, w = +q(".mg-wd").value, T = { val: lo, vah: lo + w }, r = relate(Y0, T);
      q(".mg-v").textContent = lo.toFixed(1); q(".mg-w").textContent = w.toFixed(1);
      const YY = (p) => lerp(340, 40, (p - 90) / (118 - 90));
      let s = ""; for (let p = 92; p <= 116; p += 4) s += `<line x1="60" x2="610" y1="${YY(p)}" y2="${YY(p)}" class="s-line"/><text x="54" y="${YY(p) + 4}" text-anchor="end" class="t-mute">${p}</text>`;
      const box1 = (x, v, cls, nm) => `<rect x="${x - 34}" y="${YY(v.vah)}" width="68" height="${YY(v.val) - YY(v.vah)}" rx="6" class="${cls === "n" ? "f-hl" : "f-buy"}" opacity="0.28"/><rect x="${x - 34}" y="${YY(v.vah)}" width="68" height="${YY(v.val) - YY(v.vah)}" rx="6" class="f-none ${cls === "n" ? "s-hl" : "s-buy"}" stroke-width="2.5"/><text x="${x + 44}" y="${YY(v.vah) + 4}" class="t-mute">${v.vah}</text><text x="${x + 44}" y="${YY(v.val) + 4}" class="t-mute">${v.val}</text><text x="${x}" y="${YY(v.val) + 22}" text-anchor="middle" class="t-ink t-b">${nm}</text>`;
      s += box1(220, Y0, "y", "昨天") + box1(420, T, "n", "今天");
      q(".mg-svg").innerHTML = s;
      q(".mg-msg").innerHTML = `<b>${r.k}</b>（${r.dir}）：${r.txt}`;
      if (r.k === "完全不重疊" && r.dir === "往上") done.a = true;
      if (r.k === "大幅重疊") done.b = true;
      if (r.k === "完全不重疊" && r.dir === "往下") done.c = true;
      q(".mg-task").innerHTML = [["a", "任務 1：做出「完全不重疊、往上」的強轉換"], ["b", "任務 2：做出「大幅重疊」的平衡"], ["c", "任務 3：做出「完全不重疊、往下」"]].map(([k, tx]) => `<li class="${done[k] ? "ok" : ""}">${done[k] ? "✓" : "○"} ${tx}</li>`).join("");
    }
    [".mg-lo", ".mg-wd"].forEach((s) => q(s).addEventListener("input", paint)); paint();
  }

  const QS = [
    { fig: `<p class="small q-cap">昨天的價值區是 4,990～5,010，今天是 5,012～5,030。</p>`, q: "這代表什麼？", step: 3, o: [
      ["完全不重疊、往上：強轉換，但還要看新價位有沒有被接受", true, "今天的 VAL（5,012）高於昨天的 VAH（5,010），完全不重疊，價值往上搬。但離開不等於成立，要確認被接受。"],
      ["大幅重疊：多空平衡", false, "兩天的價值區完全沒有交集。"],
      ["往下轉換：下降趨勢", false, "今天在昨天上方，是往上。"]] },
    { fig: `<p class="small q-cap">價格跌破昨天價值區的下緣 VAL，只停留一根 K 棒，就被買回價值區裡，之後在價值區內來回。</p>`, q: "比較像哪一種？", step: 6, o: [
      ["被拒絕：市場不接受更低的價格，維持平衡", true, "很快被打回價值區，就是拒絕。價值沒有往下搬家。"],
      ["被接受：下降趨勢開始", false, "接受要在新價位停留、持續成交，這裡只待了一根就回來。"],
      ["看不出來", false, "停留時間短、很快回到價值區內，已經足夠判斷是拒絕。"]] },
    { fig: `<p class="small q-cap">價值往下轉換之後，價格在新的區域震盪：上緣碰過一次、下緣碰過一次。</p>`, q: "新的價值結構成立了嗎？", step: 9, o: [
      ["還沒有：上下緣要各碰兩次才算確認", true, "每邊只碰一次，可能只是走勢中的停頓。上下各兩次，才代表兩邊都有人重複出現，市場對這個範圍有共識。"],
      ["已經成立，上下緣都碰過了", false, "一次還不夠，要各兩次。"],
      ["不重要，直接用舊的價值區就好", false, "價值轉換後舊的價值區不能代表現在的價格，需要重新錨定。"]] }
  ];

  PAGES["of-mig"] = window.KIT.page(window.COURSE.OFC, "of-mig", {
    topic: "價值轉換",
    lede: "單看一天的價值區，只知道今天大家認同哪裡。把連續幾天放在一起，就能看出價值往哪邊搬、搬得多強，也能知道什麼時候舊的價值區已經不能用了。",
    analogy: [
      ["搬家", "鄰居搬到隔壁棟（部分重疊）和搬到另一個城市（完全不重疊），意義完全不同。價值區也是看<b>搬了多遠</b>。"],
      ["店面行情", "一條街的租金行情變了，就要重新估價，不能還拿三年前的行情判斷現在貴不貴。這就是<b>重新錨定</b>。"],
      ["新生入學", "一個新班級要好幾次月考，才看得出誰在前段、誰在後段。新價值結構要<b>上下各碰兩次</b>才算成立。"]],
    steps: STEPS, draw, simHTML, simMount,
    simIntro: "昨天的價值區固定是 100～104。拉動下面兩個滑桿改變今天的價值區，看它和昨天是什麼關係。",
    mist: [
      ["價格一離開價值區，趨勢就開始了", "離開只是第一步。要看市場是接受（停留、持續成交）還是拒絕（很快被打回），被接受才算價值轉換。"],
      ["價值區往上，就一定繼續漲", "價值轉換是「趨勢的證據」，不是預測。部分重疊的轉換很溫和，可能隨時回到平衡。"],
      ["價值轉換後還是看舊的 VAH／VAL", "舊的價值區已經不能代表現在，要從不平衡起始點重新錨定，不然會把新價值裡的價格看成太貴或太便宜。"],
      ["折價就是便宜，一定要買", "折價與溢價只是相對於新的價值結構；而且還沒確認結構（上下各碰兩次）之前，說貴說便宜都還太早。"]],
    faq: [
      ["「大幅重疊」和「部分重疊」怎麼分？", "沒有標準答案。這一關用「重疊量是否超過較窄那天寬度的一半」當教學門檻，實務上建議用自己的歷史資料找出對你的商品合適的分界。"],
      ["怎麼找不平衡起始點？", "價格離開舊平衡區、開始單邊移動的那個位置，通常是一根大波動或失衡很明顯的 K 棒附近。找不到唯一的點是正常的，重點是從「離開平衡」那一帶開始算。"],
      ["為什麼上下各碰兩次？", "每邊只碰一次，可能是走勢中的短暫停頓。兩邊各兩次，代表買方在下緣、賣方在上緣都重複出現，才有共識。"],
      ["價值轉換和趨勢日有什麼關係？", "價值轉換是一個「比較兩天價值區」的視角，趨勢日是看當天價格結構。兩者常常一致，但哪個更準，需要用你自己的紀錄檢驗。"],
      ["可以和 GEX 的環境判斷一起用嗎？", "可以當作另一個參考：今天價值區相對昨天往哪走，和你判斷的震盪日或趨勢日是否一致。不一致時，先降低把握度。"],
      ["要看幾天的價值區？", "至少連續兩三天。天數越多，越能看出方向，但也越容易受舊資料影響，通常搭配最近幾天就夠。"]],
    qs: QS,
    gloss: [
      ["價值轉換", "價值區從一個價位移到另一個價位，是趨勢形成的證據。"],
      ["接受", "價格到新區域後停留夠久、持續成交。"],
      ["拒絕", "價格到新區域後很快被打回。"],
      ["不平衡起始點", "價格離開舊平衡、開始單邊移動的位置。"],
      ["錨定", "從起始點開始重新計算分佈，只看新走勢之後的成交。"],
      ["相對溢價／折價", "在新的價值結構裡，VAH 以上偏貴、VAL 以下偏便宜。"]],
    remember: "<b>看連續幾天的價值區往哪走；離開要看接受或拒絕；轉換後從起始點重新錨定，上下各碰兩次才確認。</b>"
  });
})();
