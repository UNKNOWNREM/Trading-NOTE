/* 路線 1 第 6 關（新版）：失衡與堆疊失衡 */
(function () {
  const PAGES = (window.__PAGES = window.__PAGES || {});
  const { chip, lerp, ease, seg } = window.KIT;
  // [價格, 主動賣(Bid), 主動買(Ask)]
  const FP = [[101.25, 12, 40], [101.0, 10, 36], [100.75, 9, 33], [100.5, 11, 14], [100.25, 15, 8]];
  const RY = (r) => 70 + r * 46, RH = 36;
  const C = { sx: 150, sw: 100, px: 256, pw: 76, bx: 338, bw: 100 };
  const pct = (a, b) => Math.round((a / b) * 100);
  const buyImb = (rows, r) => (r + 1 < rows.length ? rows[r][2] / rows[r + 1][1] : null);
  const sellImb = (rows, r) => (r > 0 ? rows[r][1] / rows[r - 1][2] : null);

  function fp(rows, o = {}) {
    let s = `<text x="${C.sx + C.sw / 2}" y="40" text-anchor="middle" class="t-sell t-b">主動賣（Bid 側）</text><text x="${C.px + C.pw / 2}" y="40" text-anchor="middle" class="t-mute">價格</text><text x="${C.bx + C.bw / 2}" y="40" text-anchor="middle" class="t-buy t-b">主動買（Ask 側）</text>`;
    rows.forEach((r, k) => {
      const y = RY(k) - RH / 2;
      s += `<rect x="${C.sx}" y="${y}" width="${C.sw}" height="${RH}" rx="6" class="${o.hiS && o.hiS.includes(k) ? "f-hl2" : "f-sell-soft"}"/><rect x="${C.bx}" y="${y}" width="${C.bw}" height="${RH}" rx="6" class="${o.hiB && o.hiB.includes(k) ? "f-hl2" : "f-buy-soft"}"/>`;
      s += `<text x="${C.sx + C.sw - 14}" y="${RY(k) + 6}" text-anchor="end" class="t-sell t-b t-lg">${r[1]}</text><text x="${C.px + C.pw / 2}" y="${RY(k) + 5}" text-anchor="middle" class="t-mute">${r[0].toFixed(2)}</text><text x="${C.bx + 14}" y="${RY(k) + 6}" class="t-buy t-b t-lg">${r[2]}</text>`;
      if (o.okB && o.okB.includes(k)) s += `<rect x="${C.bx - 3}" y="${y - 3}" width="${C.bw + 6}" height="${RH + 6}" rx="8" class="f-none s-buy" stroke-width="3"/>`;
      if (o.okS && o.okS.includes(k)) s += `<rect x="${C.sx - 3}" y="${y - 3}" width="${C.sw + 6}" height="${RH + 6}" rx="8" class="f-none s-sell" stroke-width="3"/>`;
    });
    return s;
  }
  // 斜線：從 Ask 格（列 a）連到 Bid 格（列 b）
  function diag(a, b, op = 1, cls = "s-gamma") {
    return `<g opacity="${op}"><line x1="${C.bx + 8}" y1="${RY(a)}" x2="${C.sx + C.sw - 8}" y2="${RY(b)}" class="${cls}" stroke-width="3" stroke-dasharray="6 4"/><circle cx="${C.bx + 8}" cy="${RY(a)}" r="4" class="f-hl"/><circle cx="${C.sx + C.sw - 8}" cy="${RY(b)}" r="4" class="f-hl"/></g>`;
  }
  const note = (y, lines, op = 1, x = 456) => `<g opacity="${op}">${lines.map((l, k) => `<text x="${x}" y="${y + k * 22}" class="${l[1] || "t-ink"}">${l[0]}</text>`).join("")}</g>`;

  const STEPS = [
    { cap: "這是一根 Footprint：左邊主動賣、右邊主動買。這一關要找的是<b>失衡</b>：某個地方，一方明顯比另一方用力很多。",
      why: "失衡（Imbalance）就是「一面倒」的地方。它標出了主動方特別積極的價格，常被拿來找支撐、阻力。", stuckHref: "#of-2", stuckLabel: "回第 3 關複習 Footprint →", stuck: "左邊記急著賣的口數，右邊記急著買的口數。" },
    { cap: "直覺上會<b>橫著比</b>同一列的左右兩格（101.25：40 對 12）。但大部分軟體<b>不是這樣算</b>的。",
      why: "同一列的左右兩格，其實不是同一個時間點的兩個對手。下一步會說明為什麼要換個方向比。" },
    { cap: "要<b>斜著比</b>：這一列的主動買（101.25 的 40），和<b>下一列</b>的主動賣（101.00 的 10）比。",
      why: "當最便宜的賣價（Ask）是 101.25 時，最高的買價（Bid）剛好是低一格的 101.00。主動買在 101.25 吃賣單、主動賣在 101.00 打買單，是<b>同一時間</b>雙方各自出手的地方。所以要比的是這兩格。", stuck: "同一時間，買方在 Ask 出手、賣方在 Bid 出手，兩者剛好差一格，所以斜著比。", dur: 2200 },
    { cap: "算算看：101.25 的主動買 40 ÷ 101.00 的主動賣 10 ＝ <b>4 倍（400%）</b>。在這一小段價格裡，買方用力是賣方的 4 倍。",
      why: "失衡的大小用倍數或百分比表示。400% 代表一方是另一方的 4 倍。", dur: 2000 },
    { cap: "要多少倍才算失衡？要先訂一個<b>門檻</b>。這裡用常見的 <b>300%（3 倍）</b>：400% 超過了，101.25 標成<b>買方失衡</b>（藍框）。",
      why: "門檻沒有標準答案：ATAS 預設 150%，有人用 200%、300%，也有人用 400%。門檻越低，標出來的格子越多、越雜；越高越少、越嚴格。建議用重播看熟悉的時段，調到標出來的格子大約佔整根的 10%～20%。" },
    { cap: "換你想：接下來看 101.00 這一列，它的主動買是 36。",
      q: { t: "36 要和哪一格比？", o: [
        ["同一列的主動賣 10", false, "這是橫著比。失衡要斜著比：這一列的主動買，和下一列的主動賣。"],
        ["下一列（100.75）的主動賣 9", true, "斜著比下一列：36 ÷ 9 ＝ 400%，超過 300%，也是買方失衡。"],
        ["上一列（101.25）的主動賣 12", false, "方向反了。買方失衡是和「下一列」的主動賣比；和上一列比的是賣方失衡。"]] } },
    { cap: "把每一列都算完：101.00 是 36 ÷ 9 ＝ 400% ✓；100.75 是 33 ÷ 11 ＝ 300% ✓；100.50 是 14 ÷ 15 ＝ 93% ✗。最下面一列沒有下一列可以比。",
      why: "100.75 剛好 300%，是否算數要看軟體是用「大於等於」還是「大於」，各家不同，用之前先確認設定。", dur: 2600 },
    { cap: "賣方失衡是<b>反過來</b>：這一列的主動賣，和<b>上一列</b>的主動買比。例如 100.25 的主動賣 15 ÷ 100.50 的主動買 14 ＝ 107%，不到門檻。",
      why: "跟買方完全對稱：主動賣在 Bid 打買單時，同一時間的 Ask 在高一格。所以賣方要和上一列的主動買比。這根 K 棒沒有賣方失衡。", dur: 2200 },
    { cap: "換你算：另一根 K 棒裡，100.50 的主動賣是 30，上一列 100.75 的主動買是 8。",
      q: { t: "用 300% 門檻，100.50 算不算賣方失衡？", o: [
        ["算，30 ÷ 8 ＝ 375%", true, "賣方失衡：這一列的主動賣 ÷ 上一列的主動買 ＝ 30 ÷ 8 ＝ 375%，超過 300%。"],
        ["不算，8 ÷ 30 只有 27%", false, "算反了。賣方失衡是用主動賣當分子：30 ÷ 8。"],
        ["要和同一列的主動買比", false, "不是橫著比。賣方失衡要和上一列的主動買比。"]] } },
    { cap: "回到原本那根：101.25、101.00、100.75 <b>連續三列</b>都是買方失衡。這叫<b>堆疊失衡</b>：買方在這一段價格一路強勢地推上去。",
      why: "一格失衡可能只是偶然，連續三格以上代表買方在這整段價格都很積極。很多人把連續 3 格當成堆疊的最低標準。", dur: 2200 },
    { cap: "堆疊失衡常被當成<b>可能的支撐區</b>：之後價格回到這一段，再看有沒有買方回來的確認，才考慮做多，停損放在這一段的下方。",
      why: "筆記特別提醒：不是看到堆疊就追。它只是標出「買方曾經很積極的地方」，回測時才有意義，而且要有確認。堆疊賣方失衡則反過來，可能是阻力區。", dur: 2600 },
    { cap: "最後一個陷阱：主動買 6 口、下一列主動賣 2 口，也是 300%。可是只有幾口，<b>沒有意義</b>。所以還要設<b>最小量</b>。",
      why: "成交很少的價格（通常在 K 棒的頭尾），很容易算出很誇張的倍數。設一個最小量（例如至少 20 口），低於它就不標。",
      q: { t: "門檻 300%、最小量 20 口。主動買 6 口、下一列主動賣 2 口，會被標成失衡嗎？", o: [
        ["會，因為 6 ÷ 2 ＝ 300%", false, "倍數達標了，但主動買只有 6 口，低於最小量 20 口，不會被標。"],
        ["不會，因為量太小，被最小量濾掉", true, "倍數和量都要達標才算。6 口低於 20 口的最小量，這種「3 口對 1 口」的失衡沒有意義。"],
        ["要看價格是多少才知道", false, "失衡只看兩格的口數，和價格高低無關。"]] } },
    { cap: "整理：失衡要<b>斜著比</b>，倍數和最小量都要達標；連續 3 格以上叫<b>堆疊失衡</b>，是之後回測時可能的支撐或阻力。",
      why: "下一關會把吸收、失衡、Delta 轉向這些訊號放在一起，學在關鍵價位怎麼讀出買賣方。" }
  ];

  function draw(svg, i, t) {
    const e = ease(t); let s = "";
    if (i === 0) s += fp(FP) + note(120, [["左：主動賣", "t-sell t-b"], ["右：主動買", "t-buy t-b"], ["", ""], ["找一面倒的地方", "t-ink"]], seg(t, 0.3, 1));
    else if (i === 1) {
      s += fp(FP, { hiS: [0], hiB: [0] });
      s += `<g opacity="${seg(t, 0.2, 0.6)}"><line x1="${C.sx + C.sw - 10}" x2="${C.bx + 10}" y1="${RY(0)}" y2="${RY(0)}" class="s-ink" stroke-width="3"/><text x="456" y="${RY(0) + 5}" class="t-ink t-b">40 對 12？</text></g>`;
      s += `<g opacity="${seg(t, 0.6, 1)}"><line x1="${C.px + 10}" y1="${RY(0) - 14}" x2="${C.px + C.pw - 10}" y2="${RY(0) + 14}" class="s-sell" stroke-width="4"/><line x1="${C.px + 10}" y1="${RY(0) + 14}" x2="${C.px + C.pw - 10}" y2="${RY(0) - 14}" class="s-sell" stroke-width="4"/>${note(120, [["大部分軟體不是", "t-sell t-b"], ["這樣算的", "t-sell t-b"]], 1)}</g>`;
    } else if (i === 2) {
      s += fp(FP, { hiB: [0], hiS: [1] }) + diag(0, 1, seg(t, 0.1, 0.5));
      s += note(90, [["同一時間：", "t-ink t-b"], ["Ask 101.25 被主動買吃", "t-buy"], ["Bid 101.00 被主動賣打", "t-sell"], ["兩者差一格", "t-mute"], ["→ 斜著比", "t-gamma t-b"]], seg(t, 0.4, 1));
    } else if (i === 3) {
      s += fp(FP, { hiB: [0], hiS: [1] }) + diag(0, 1);
      s += `<g opacity="${seg(t, 0.2, 0.8)}"><text x="456" y="${RY(0) + 4}" class="t-ink t-b t-lg">40 ÷ 10</text><text x="456" y="${RY(0) + 34}" class="t-buy t-b t-xl">＝ 400%</text><text x="456" y="${RY(0) + 60}" class="t-mute">買方是賣方的 4 倍</text></g>`;
    } else if (i === 4) {
      s += fp(FP, { okB: t > 0.4 ? [0] : [] }) + diag(0, 1, 0.4);
      s += note(RY(0) + 4, [["門檻 300%", "t-ink t-b"], ["400% ≥ 300% ✓", "t-buy t-b"], ["→ 買方失衡", "t-buy t-b"]], seg(t, 0.2, 0.8));
      s += note(260, [["ATAS 預設 150%", "t-mute"], ["常見 200%～400%", "t-mute"]], seg(t, 0.6, 1));
    } else if (i === 5) {
      s += fp(FP, { okB: [0], hiB: [1] });
      s += `<text x="456" y="${RY(1) + 5}" class="t-ink t-b">36 要和誰比？</text>`;
    } else if (i === 6) {
      const k = Math.min(3, Math.floor(e * 3.999));
      const ok = [0, 1, 2].filter((r) => r <= k && r < 3);
      s += fp(FP, { okB: ok, hiB: [Math.min(k, 3)] });
      for (let r = 1; r <= Math.min(k, 3); r++) s += diag(r, r + 1, r === k ? 1 : 0.35);
      const L = [[1, "36 ÷ 9 ＝ 400% ✓", "t-buy"], [2, "33 ÷ 11 ＝ 300% ✓", "t-buy"], [3, "14 ÷ 15 ＝ 93% ✗", "t-mute"]];
      L.forEach(([r, tx, c]) => { if (r <= k) s += `<text x="456" y="${RY(r) + 5}" class="${c} t-b">${tx}</text>`; });
      s += `<text x="456" y="${RY(4) + 5}" class="t-mute" opacity="${seg(t, 0.85, 1)}">最下面：沒有下一列</text>`;
    } else if (i === 7) {
      s += fp(FP, { okB: [0, 1, 2], hiS: [4], hiB: [3] });
      s += `<g opacity="${seg(t, 0.1, 0.5)}"><line x1="${C.sx + C.sw - 8}" y1="${RY(4)}" x2="${C.bx + 8}" y2="${RY(3)}" class="s-sell" stroke-width="3" stroke-dasharray="6 4"/></g>`;
      s += note(RY(3) - 10, [["賣方：和上一列的主動買比", "t-sell t-b"], ["15 ÷ 14 ＝ 107% ✗", "t-mute"]], seg(t, 0.4, 1));
    } else if (i === 8) {
      const R = [[100.75, 4, 8], [100.5, 30, 6]];
      s += fp(R, { hiS: [1], hiB: [0] }) + `<line x1="${C.sx + C.sw - 8}" y1="${RY(1)}" x2="${C.bx + 8}" y2="${RY(0)}" class="s-sell" stroke-width="3" stroke-dasharray="6 4"/><text x="456" y="${RY(1) + 5}" class="t-ink t-b">算不算賣方失衡？</text>`;
    } else if (i === 9 || i === 10) {
      s += fp(FP, { okB: [0, 1, 2] });
      const a = i === 9 ? seg(t, 0.2, 0.7) : 1;
      s += `<g opacity="${a}"><rect x="${C.bx + C.bw + 10}" y="${RY(0) - RH / 2}" width="10" height="${RY(2) - RY(0) + RH}" rx="4" class="f-buy"/><text x="${C.bx + C.bw + 30}" y="${RY(1) - 6}" class="t-buy t-b t-lg">堆疊買方失衡</text><text x="${C.bx + C.bw + 30}" y="${RY(1) + 18}" class="t-mute">連續 3 列</text></g>`;
      if (i === 10) {
        s += `<g opacity="${seg(t, 0.1, 0.5)}"><rect x="${C.sx}" y="${RY(0) - RH / 2}" width="${C.bx + C.bw - C.sx}" height="${RY(2) - RY(0) + RH}" rx="8" class="f-none s-gamma" stroke-width="2" stroke-dasharray="6 4"/></g>`;
        s += note(RY(3) - 4, [["之後價格回到這一段 →", "t-ink t-b"], ["看買方有沒有回來", "t-ink"], ["停損放在這一段下方", "t-sell"]], seg(t, 0.4, 1), 456);
      }
    } else if (i === 11) {
      const R = [[101.75, 1, 6], [101.5, 2, 30]];
      s += fp(R, { hiB: [0], hiS: [1] }) + diag(0, 1, 1);
      s += note(RY(0) + 4, [["6 ÷ 2 ＝ 300%", "t-ink t-b"], ["倍數達標，但只有 6 口", "t-sell"], ["→ 用最小量濾掉", "t-gamma t-b"]], seg(t, 0.2, 1));
    } else if (i === 12) {
      const rows = [["斜著比", "買方：這列主動買 ÷ 下一列主動賣"], ["反過來", "賣方：這列主動賣 ÷ 上一列主動買"], ["兩個條件", "倍數超過門檻，量也超過最小量"], ["堆疊", "連續 3 列以上，之後回測可能是支撐或阻力"]];
      rows.forEach((r, k) => { s += `<g opacity="${seg(t, k * 0.18, k * 0.18 + 0.3)}"><rect x="90" y="${44 + k * 76}" width="460" height="60" rx="10" class="f-surface s-line"/><circle cx="118" cy="${74 + k * 76}" r="11" class="f-buy"/><text x="118" y="${79 + k * 76}" text-anchor="middle" class="t-w t-b">${k + 1}</text><text x="140" y="${68 + k * 76}" class="t-ink t-b t-lg">${r[0]}</text><text x="140" y="${90 + k * 76}" class="t-ink">${r[1]}</text></g>`; });
    }
    svg.innerHTML = s;
  }

  /* ---------- 你來操作：調門檻、最小量，點格子看計算 ---------- */
  const SETS = {
    a: { name: "動畫裡那根", rows: FP },
    b: { name: "有陷阱的那根", rows: [[101.75, 2, 1], [101.5, 1, 6], [101.25, 3, 24], [101.0, 5, 30], [100.75, 8, 26], [100.5, 22, 12], [100.25, 40, 9], [100.0, 35, 4]] }
  };
  const simHTML = `<div class="tabs im-tabs"><button class="tab" data-k="a" aria-selected="true" type="button">動畫裡那根</button><button class="tab" data-k="b" aria-selected="false" type="button">有陷阱的那根</button></div>
<div class="fp-wrap"><table class="fp im-fp" aria-label="Footprint"></table><div class="side im-calc"></div></div>
<div class="controls"><div class="ctl"><label>失衡門檻 <b class="im-th-v"></b></label><input class="im-th" type="range" min="150" max="500" step="50" value="300"></div>
<div class="ctl"><label>最小量（太小不標） <b class="im-mn-v"></b></label><input class="im-mn" type="range" min="0" max="30" step="1" value="0"></div></div>
<p class="small im-sum"></p><ul class="sim-task im-task"></ul>`;
  function simMount(box) {
    const q = (s) => box.querySelector(s);
    let key = "a", pick = 0; const done = {};
    function paint() {
      const rows = SETS[key].rows, th = +q(".im-th").value / 100, mn = +q(".im-mn").value;
      q(".im-th-v").textContent = Math.round(th * 100) + "%"; q(".im-mn-v").textContent = mn + " 口";
      const okB = (r) => { const v = buyImb(rows, r); return v != null && v >= th && rows[r][2] >= mn; };
      const okS = (r) => { const v = sellImb(rows, r); return v != null && v >= th && rows[r][1] >= mn; };
      const p = Math.min(pick, rows.length - 1);
      q(".im-fp").innerHTML = `<thead><tr><td>主動賣</td><td>價格</td><td>主動買</td></tr></thead><tbody>${rows.map((r, k) => `<tr class="${k === p ? "cur" : ""}" data-i="${k}"><td class="b${okS(k) ? " imb-b" : ""}${k === p - 0 + 1 ? " cmp" : ""}">${r[1]}</td><td class="px">${r[0].toFixed(2)}</td><td class="a${okB(k) ? " imb-a" : ""}${k === p - 1 ? " cmp" : ""}">${r[2]}</td></tr>`).join("")}</tbody>`;
      const r = rows[p], b = buyImb(rows, p), sv = sellImb(rows, p);
      q(".im-calc").innerHTML = `<p class="tagline">價格 ${r[0].toFixed(2)}（點表格換一列）</p>
        <p><b class="tb">買方：</b>${b == null ? "最下面一列，沒有下一列可以比。" : `主動買 ${r[2]} ÷ 下一列主動賣 ${rows[p + 1][1]} ＝ <b>${pct(r[2], rows[p + 1][1])}%</b>　${okB(p) ? "✓ 失衡" : b >= th ? "✗ 倍數夠，但量不到最小量" : "✗"}`}</p>
        <p><b class="ts">賣方：</b>${sv == null ? "最上面一列，沒有上一列可以比。" : `主動賣 ${r[1]} ÷ 上一列主動買 ${rows[p - 1][2]} ＝ <b>${pct(r[1], rows[p - 1][2])}%</b>　${okS(p) ? "✓ 失衡" : sv >= th ? "✗ 倍數夠，但量不到最小量" : "✗"}`}</p>
        <p class="small">虛線框＝被拿來比較的格子。</p>`;
      const nB = rows.filter((_, k) => okB(k)).length, nS = rows.filter((_, k) => okS(k)).length, share = (nB + nS) / (rows.length * 2);
      let run = 0, best = 0; rows.forEach((_, k) => { run = okB(k) ? run + 1 : 0; best = Math.max(best, run); });
      q(".im-sum").innerHTML = `標出 <b>${nB}</b> 格買方失衡（藍框）、<b>${nS}</b> 格賣方失衡（橘框），佔全部格子的 ${Math.round(share * 100)}%。${best >= 3 ? "　<b>連續 " + best + " 格買方失衡＝堆疊失衡。</b>" : ""}`;
      if (key === "b" && share >= 0.1 && share <= 0.2) done.a = true;
      if (best >= 3) done.b = true;
      if (key === "b" && th <= 2 && mn > 6 && !okB(1)) done.c = true;
      q(".im-task").innerHTML = [["a", "任務 1：在「有陷阱的那根」，調門檻讓標出的格子佔 10%～20%"], ["b", "任務 2：找到一組連續 3 格的堆疊買方失衡"], ["c", "任務 3：在「有陷阱的那根」把門檻調到 200% 以下，再用最小量濾掉 101.50 那格 6 口對 3 口的假失衡"]].map(([k, tx]) => `<li class="${done[k] ? "ok" : ""}">${done[k] ? "✓" : "○"} ${tx}</li>`).join("");
    }
    box.addEventListener("click", (e) => {
      const tr = e.target.closest("tr[data-i]"); if (tr) { pick = +tr.dataset.i; paint(); return; }
      const b = e.target.closest(".tab"); if (!b) return; key = b.dataset.k; pick = 0;
      box.querySelectorAll(".im-tabs .tab").forEach((x) => x.setAttribute("aria-selected", String(x === b))); paint();
    });
    [".im-th", ".im-mn"].forEach((s) => q(s).addEventListener("input", paint));
    paint();
  }

  const QS = [
    { fig: window.KIT.fpTable([["50.50", 6, 28], ["50.25", 7, 20], ["50.00", 9, 11]], "題目一的 Footprint"), q: "用 300% 門檻，50.50 這一列算不算買方失衡？", step: 4, o: [
      ["算，28 ÷ 7 ＝ 400%", true, "斜著比：50.50 的主動買 28 ÷ 下一列 50.25 的主動賣 7 ＝ 400%，超過 300%。"],
      ["算，28 ÷ 6 ＝ 467%", false, "這是橫著比同一列。要和下一列的主動賣比。"],
      ["不算，28 ÷ 9 ＝ 311%，不夠明顯", false, "比錯格子了，9 是再下一列。而且 311% 也超過 300%。"]] },
    { fig: window.KIT.fpTable([["50.50", 6, 28], ["50.25", 7, 20], ["50.00", 9, 11]], "題目二的 Footprint"), q: "同一根 K 棒，50.25 算不算買方失衡（300% 門檻）？", step: 7, o: [
      ["算，20 ÷ 9 ＝ 222%", false, "222% 沒有超過 300%，所以不算。"],
      ["不算，20 ÷ 9 ＝ 222%，沒到門檻", true, "50.25 的主動買 20 ÷ 下一列 50.00 的主動賣 9 ＝ 222%，低於 300%。所以這根只有 50.50 一格失衡，不是堆疊。"],
      ["不算，因為要和上一列比", false, "買方失衡是和下一列的主動賣比，和上一列比的是賣方失衡。"]] },
    { fig: `<p class="small q-cap">早上出現一段連續 4 格的堆疊買方失衡（100.50～101.25）。下午價格從上面跌回 100.75。</p>`, q: "照這一關教的用法，比較合理的做法是？", step: 11, o: [
      ["一回到 100.75 就馬上做多", false, "堆疊只是「可能的支撐」。要先看到買方回來的確認，不是碰到就買。"],
      ["觀察買方有沒有回來（例如出現吸收或 Delta 轉正），有確認才考慮做多，停損放在 100.50 下方", true, "回測堆疊區時，先等確認，再進場，停損放在這一段的外側。"],
      ["做空，因為價格已經跌回來了", false, "跌回來不代表要做空。堆疊買方失衡是可能的支撐，要看買方在這裡的反應。"]] }
  ];

  PAGES["of-4"] = window.KIT.page(window.COURSE.OFC, "of-4", {
    topic: "失衡",
    lede: "失衡是 Footprint 裡「一方明顯比另一方用力很多」的地方。它有一個最容易搞錯的規則：要斜著比，不是橫著比。這一關一步一步算給你看，再教你用門檻和最小量避免假訊號。",
    analogy: [
      ["上樓梯", "要往上走一階，是跟上面那一階的人較勁，不是跟站在同一階的人。失衡也是跟<b>隔壁一格</b>比。"],
      ["及格線", "考幾分才算及格要先訂好。失衡也要先訂<b>門檻</b>，例如 3 倍。"],
      ["只有兩個人的投票", "3 票對 1 票也是 3 倍，但只有 4 個人投票，沒什麼意義。所以還要有<b>最小量</b>。"]],
    steps: STEPS, draw, simHTML, simMount,
    simIntro: "調整門檻和最小量，看哪些格子會被標出來。點任何一列，右邊會算給你看它和哪一格比。",
    mist: [
      ["失衡就是同一列左右兩格比", "大部分軟體是斜著比：這一列的主動買和下一列的主動賣比，因為它們才是同一時間的兩個對手。"],
      ["倍數夠大就是失衡", "還要看量。3 口對 1 口也是 300%，卻沒有意義。要同時設最小量。"],
      ["看到堆疊失衡就追進場", "堆疊只是標出買方或賣方曾經很積極的地方。之後價格回測這一段，有確認才考慮進場。"]],
    faq: [
      ["門檻要設多少？", "沒有標準答案，150%～400% 都有人用。建議用重播看你熟悉的時段，調到標出的格子大約佔整根的 10%～20%：太多代表太鬆，幾乎沒有代表太緊。"],
      ["為什麼斜著比才對？", "同一時間，最便宜的賣價（Ask）比最高的買價（Bid）高一格。主動買在 Ask 那一格成交，主動賣在 Bid 那一格成交，所以這兩格才是同一時間互相較勁的雙方。"],
      ["剛好等於門檻算不算？", "看軟體。有的用「大於等於」，有的用「大於」。用之前先在設定裡確認。"],
      ["堆疊要幾格才算？", "常見的最低標準是連續 3 格。格數越多，代表那一方在越大一段價格都很積極。"],
      ["失衡出現在 K 棒的哪裡比較重要？", "出現在關鍵價位附近（前高、前低、價值區邊緣）的比較值得注意。K 棒最頂端或最底端成交很少的地方，常常是假失衡。"],
      ["失衡和吸收有什麼不同？", "失衡是主動方很用力；吸收是主動方很用力、價格卻推不動。兩者常一起出現，下一關會教怎麼一起看。"]],
    qs: QS,
    gloss: [
      ["失衡", "一方明顯比另一方用力很多的地方，用倍數或百分比表示。"],
      ["買方失衡", "這一列的主動買 ÷ 下一列的主動賣，超過門檻。"],
      ["賣方失衡", "這一列的主動賣 ÷ 上一列的主動買，超過門檻。"],
      ["門檻", "幾倍以上才算失衡，例如 300%。"],
      ["最小量", "口數太少的格子不標，避免 3 口對 1 口的假失衡。"],
      ["堆疊失衡", "連續 3 列以上同方向的失衡。"]],
    remember: "<b>失衡要斜著比</b>：這一列的主動買 ÷ 下一列的主動賣。倍數和量都要達標，連續 3 格以上叫堆疊。"
  });
})();
