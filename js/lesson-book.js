/* 路線 1 第 2 關（新版）：價格怎麼動——掛單簿與兩種下單 */
(function () {
  const PAGES = (window.__PAGES = window.__PAGES || {});
  const { chip, lerp, ease, seg, fpTable } = window.KIT;
  const P = [101.0, 100.75, 100.5, 100.25, 100.0, 99.75, 99.5, 99.25];
  const k2 = (p) => p.toFixed(2);
  const ASK0 = { "100.25": 12, "100.50": 25, "100.75": 40, "101.00": 60 }, BID0 = { "100.00": 18, "99.75": 30, "99.50": 55, "99.25": 70 };
  const RY = (r) => 60 + r * 36, RH = 30;
  const PY = (p) => RY(P.indexOf(p));
  const C = { bx: 160, bw: 84, px: 252, pw: 76, ax: 336, aw: 84 };

  function ladder(ask, bid, o = {}) {
    const op = o.op == null ? 1 : o.op;
    let s = `<g opacity="${op}"><text x="${C.bx + C.bw / 2}" y="36" text-anchor="middle" class="t-buy t-b">買單在等（口）</text><text x="${C.px + C.pw / 2}" y="36" text-anchor="middle" class="t-mute">價格</text><text x="${C.ax + C.aw / 2}" y="36" text-anchor="middle" class="t-sell t-b">賣單在等（口）</text>`;
    P.forEach((p, r) => {
      const k = k2(p), y = RY(r) - RH / 2;
      s += `<rect x="${C.bx}" y="${y}" width="${C.bw}" height="${RH}" rx="5" class="${o.fb === k ? "f-hl2" : bid[k] != null && o.showB !== false ? "f-buy-soft" : "g-cell"}"/>`;
      s += `<rect x="${C.ax}" y="${y}" width="${C.aw}" height="${RH}" rx="5" class="${o.fa === k ? "f-hl2" : ask[k] != null && o.showA !== false ? "f-sell-soft" : "g-cell"}"/>`;
      s += `<text x="${C.px + C.pw / 2}" y="${RY(r) + 4.5}" text-anchor="middle" class="${o.last === p ? "t-ink t-b" : "t-mute"}">${k}</text>`;
      if (bid[k] != null && o.showB !== false) s += `<text x="${C.bx + C.bw / 2}" y="${RY(r) + 5}" text-anchor="middle" class="t-buy t-b t-lg" opacity="${o.bOp == null ? 1 : o.bOp}">${bid[k]}</text>`;
      if (ask[k] != null && o.showA !== false) s += `<text x="${C.ax + C.aw / 2}" y="${RY(r) + 5}" text-anchor="middle" class="t-sell t-b t-lg" opacity="${o.aOp == null ? 1 : o.aOp}">${ask[k]}</text>`;
    });
    if (o.last != null) s += `<g><rect x="${C.px + 4}" y="${PY(o.last) - RH / 2}" width="${C.pw - 8}" height="${RH}" rx="6" class="f-none s-hl" stroke-width="2"/><text x="${C.bx - 12}" y="${PY(o.last) + 4}" text-anchor="end" class="t-ink t-b">最新成交 ${k2(o.last)}</text></g>`;
    return s + "</g>";
  }
  const best = (book, side) => { const ks = Object.keys(book).filter((k) => book[k] > 0).map(Number).sort((a, b) => (side === "ask" ? a - b : b - a)); return ks.length ? ks[0] : null; };
  function eat(book, side, n) { const fills = []; while (n > 0) { const b = best(book, side); if (b == null) break; const k = k2(b), q = Math.min(n, book[k]); book[k] -= q; if (!book[k]) delete book[k]; n -= q; fills.push([b, q]); } return fills; }

  // 每一步結束時的掛單簿狀態
  function stateAt(i) {
    const ask = Object.assign({}, ASK0), bid = Object.assign({}, BID0); let last = null;
    if (i >= 5) bid["99.75"] = 40;
    if (i >= 6) { ask["100.25"] = 4; last = 100.25; }
    if (i >= 7) { delete ask["100.25"]; ask["100.50"] = 9; last = 100.5; }
    if (i >= 10) { delete bid["100.00"]; bid["99.75"] = 33; last = 99.75; }
    return { ask, bid, last };
  }

  const STEPS = [
    { cap: "這是<b>掛單簿</b>：中間是價格，一格一格往上往下排。左右兩邊要放的，是大家「排隊等著成交」的單。",
      why: "掛單簿也叫 DOM 或價格階梯，是交易所把所有人掛著的單整理出來的表。NQ 的價格一格是 0.25 點，所以這裡每一列差 0.25。", stuck: "想像一張排隊表：中間寫價錢，左右寫有多少人在那個價錢排隊。" },
    { cap: "右邊是<b>想賣的人</b>掛的單（橘色），價格從低往高排。100.25 有 12 口在等，100.50 有 25 口……",
      why: "這些叫限價賣單：「有人願意用 100.25 跟我買，我就賣」。想賣的人當然希望賣貴一點，所以越往上的價格，排的單通常越多。" },
    { cap: "左邊是<b>想買的人</b>掛的單（藍色），價格從高往低排。100.00 有 18 口在等，99.75 有 30 口……",
      why: "這些叫限價買單：「有人願意用 100.00 賣給我，我就買」。買方希望買便宜，所以越往下的價格，排的單通常越多。" },
    { cap: "最便宜的賣價叫 <b>Ask（100.25）</b>，最貴的買價叫 <b>Bid（100.00）</b>。兩者中間的差叫<b>價差</b>，這裡只差一格。",
      why: "想馬上買，只能去買最便宜的賣單，所以付 Ask；想馬上賣，只能賣給出價最高的買單，所以拿到 Bid。NQ 交易量很大，大家搶著掛最好的價格，價差通常只有一格（0.25 點）。", stuck: "Ask＝想馬上買要付的價；Bid＝想馬上賣能拿到的價。" },
    { cap: "想一想：你現在就想<b>馬上</b>買 1 口，不想等。",
      q: { t: "你會用什麼價格成交？", o: [
        ["100.00（Bid）", false, "100.00 是買方在排隊的價格。你想馬上買，要去吃賣方的單，最便宜的賣單在 100.25。"],
        ["100.25（Ask）", true, "馬上買＝吃掉最便宜的賣單，也就是 Ask 100.25。"],
        ["100.125（中間）", false, "NQ 的價格一格是 0.25，沒有 100.125 這個價。馬上買只能付 Ask。"]] } },
    { cap: "有人掛了一張<b>限價買單</b>：10 口、99.75。它只是去排隊，99.75 從 30 口變成 40 口。<b>沒有成交，價格不動</b>。",
      why: "限價單是被動的一方：把單放上去等人來成交。它讓排隊的單變多，但本身不會讓價格移動。", dur: 1800 },
    { cap: "有人急著買，下了<b>市價買單 8 口</b>：直接吃掉 100.25 的賣單，12 口剩 4 口。最新成交價是 100.25。",
      why: "市價單是主動的一方：不排隊，直接跟排在最前面的單成交。100.25 還剩 4 口，所以最便宜的賣價還是 100.25，價格沒有跳。", dur: 2000 },
    { cap: "又有人<b>市價買 20 口</b>：100.25 只剩 4 口，吃光後還差 16 口，只好往上吃 100.50。最新成交價跳到 <b>100.50</b>。",
      why: "這就是價格上漲的過程：最便宜那一檔的賣單被吃光，下一筆只能用更貴的價格成交。這 20 口裡，有 4 口在 100.25、16 口在 100.50 成交，這個「比畫面上的價格更差」的部分叫滑價。", dur: 2800 },
    { cap: "所以價格會<b>往上跳</b>，是因為主動買方把最便宜的賣單<b>吃光</b>了。不是因為「買的人比賣的人多」。",
      why: "每一筆成交都有一個買方和一個賣方，口數一定相等。真正決定價格方向的是：誰比較急、誰用市價單去吃對方的單。這個「誰主動」就是後面 Footprint 要記的東西。" },
    { cap: "換你想：現在有人下<b>市價賣單 25 口</b>。左邊 100.00 有 18 口、99.75 有 40 口。",
      q: { t: "這 25 口賣完後，最新成交價會是多少？", o: [
        ["100.00", false, "100.00 只有 18 口，不夠 25 口。剩下 7 口要往下賣給 99.75 的買單。"],
        ["99.75", true, "先賣給 100.00 的 18 口，再賣 7 口給 99.75。100.00 的買單被打光，最新成交價跌到 99.75。"],
        ["100.25", false, "100.25 是賣單排隊的地方。市價賣單是去打左邊的買單，價格只會往下。"]] } },
    { cap: "答案：100.00 的 18 口被打光，剩下 7 口在 99.75 成交。價格<b>往下跳</b>，因為主動賣方把最貴的買單打光了。",
      why: "跟上漲完全對稱：下跌是主動賣方用市價單把買單一檔一檔打掉。99.75 原本 40 口，被吃掉 7 口後剩 33 口。", dur: 2600 },
    { cap: "整理：<b>限價單在排隊，市價單在吃單</b>。價格移動，是某一檔的單被主動的一方吃光。",
      why: "記住這四句，下一關的 Footprint 就是把「主動買」和「主動賣」記下來的帳本。" }
  ];

  function draw(svg, i, t) {
    const e = ease(t); let s = "";
    const st = stateAt(i), prev = stateAt(i - 1);
    if (i === 0) s += ladder({}, {}, { op: seg(t, 0, 0.6), showA: false, showB: false });
    else if (i === 1) s += ladder(ASK0, {}, { aOp: seg(t, 0.1, 0.8), showB: false });
    else if (i === 2) s += ladder(ASK0, BID0, { bOp: seg(t, 0.1, 0.8) });
    else if (i === 3 || i === 4) {
      s += ladder(ASK0, BID0, {});
      const a = i === 4 ? 1 : seg(t, 0, 0.5);
      s += `<g opacity="${a}"><rect x="${C.ax - 4}" y="${PY(100.25) - RH / 2 - 4}" width="${C.aw + 8}" height="${RH + 8}" rx="8" class="f-none s-sell" stroke-width="2.5"/><rect x="${C.bx - 4}" y="${PY(100) - RH / 2 - 4}" width="${C.bw + 8}" height="${RH + 8}" rx="8" class="f-none s-buy" stroke-width="2.5"/>
        <text x="440" y="${PY(100.25) + 5}" class="t-sell t-b">← Ask 100.25（最便宜的賣價）</text><text x="${C.bx - 12}" y="${PY(100) + 5}" text-anchor="end" class="t-buy t-b">Bid 100.00 →</text></g>`;
      if (i === 3) s += `<g opacity="${seg(t, 0.5, 1)}"><path d="M${C.px + C.pw + 2} ${PY(100.25)} q14 18 0 36" class="s-gamma f-none" stroke-width="2"/><text x="440" y="${(PY(100.25) + PY(100)) / 2 + 22}" class="t-gamma t-b">價差＝0.25（一格）</text></g>`;
      else s += chip(520, 330, "我要馬上買 1 口", "buy", 0.6 + 0.4 * Math.abs(Math.sin(t * Math.PI)));
    } else if (i === 5) {
      const b = Object.assign({}, BID0); if (t > 0.65) b["99.75"] = 40;
      s += ladder(ASK0, b, { fb: t > 0.65 ? "99.75" : null });
      const p = ease(seg(t, 0.1, 0.65));
      if (t <= 0.65) s += chip(lerp(530, C.bx + C.bw / 2, p), lerp(330, PY(99.75), p), "限價買 10 口 @99.75", "buy");
      else s += `<text x="${C.bx - 12}" y="${PY(99.75) + 5}" text-anchor="end" class="t-buy t-b">30 → 40，去排隊</text><text x="440" y="300" class="t-mute">沒有成交，價格沒動</text>`;
    } else if (i === 6) {
      const a = Object.assign({}, ASK0); let last = null; if (t > 0.65) { a["100.25"] = 4; last = 100.25; }
      s += ladder(a, prev.bid, { fa: t > 0.65 ? "100.25" : null, last });
      const p = ease(seg(t, 0.1, 0.65));
      if (t <= 0.65) s += chip(lerp(530, C.ax + C.aw / 2, p), lerp(330, PY(100.25), p), "市價買 8 口", "buy");
      else s += `<text x="${C.ax + C.aw + 12}" y="${PY(100.25) + 5}" class="t-sell t-b">12 → 4</text>`;
    } else if (i === 7) {
      const a = Object.assign({}, prev.ask); let last = 100.25, fa = null;
      if (t > 0.45) { delete a["100.25"]; fa = "100.25"; }
      if (t > 0.8) { a["100.50"] = 9; last = 100.5; fa = "100.50"; }
      s += ladder(a, prev.bid, { fa, last });
      const p1 = ease(seg(t, 0.05, 0.42)), p2 = ease(seg(t, 0.5, 0.8));
      if (t <= 0.45) s += chip(lerp(530, C.ax + C.aw / 2, p1), lerp(330, PY(100.25), p1), "市價買 20 口", "buy");
      else if (t <= 0.8) s += chip(lerp(C.ax + C.aw / 2, C.ax + C.aw / 2, p2), lerp(PY(100.25), PY(100.5), p2), "還差 16 口", "buy") + `<text x="${C.ax + C.aw + 12}" y="${PY(100.25) + 5}" class="t-sell t-b">4 口吃光</text>`;
      else s += `<text x="${C.ax + C.aw + 12}" y="${PY(100.5) + 5}" class="t-sell t-b">25 → 9</text><text x="${C.ax + C.aw + 12}" y="${PY(100.25) + 5}" class="t-mute">（已空）</text><text x="440" y="320" class="t-ink t-b">價格往上跳一格</text>`;
    } else if (i === 8) {
      s += ladder(st.ask, st.bid, { last: st.last });
      s += `<g opacity="${seg(t, 0, 0.5)}"><path d="M470 ${PY(100.25) + 30} L470 ${PY(100.5) + 6}" class="s-buy" stroke-width="3"/><path d="M470 ${PY(100.5)} l-7 12 h14 z" class="f-buy"/><text x="486" y="${PY(100.25) + 10}" class="t-ink t-b">最便宜的賣單</text><text x="486" y="${PY(100.25) + 30}" class="t-ink t-b">被吃光 → 價格上漲</text></g>`;
    } else if (i === 9) {
      s += ladder(st.ask, st.bid, { last: st.last }) + chip(520, 330, "市價賣 25 口", "sell", 0.6 + 0.4 * Math.abs(Math.sin(t * Math.PI)));
    } else if (i === 10) {
      const b = Object.assign({}, prev.bid); let last = prev.last, fb = null;
      if (t > 0.45) { delete b["100.00"]; fb = "100.00"; last = 100; }
      if (t > 0.8) { b["99.75"] = 33; last = 99.75; fb = "99.75"; }
      s += ladder(prev.ask, b, { fb, last });
      const p1 = ease(seg(t, 0.05, 0.42)), p2 = ease(seg(t, 0.5, 0.8));
      if (t <= 0.45) s += chip(lerp(530, C.bx + C.bw / 2, p1), lerp(330, PY(100), p1), "市價賣 25 口", "sell");
      else if (t <= 0.8) s += chip(C.bx + C.bw / 2, lerp(PY(100), PY(99.75), p2), "還差 7 口", "sell");
      else s += `<text x="440" y="${PY(99.75) + 5}" class="t-buy t-b">40 → 33</text><text x="440" y="320" class="t-ink t-b">價格往下跳</text>`;
    } else if (i === 11) {
            const R = [["限價單", "排隊等，被動的一方，不會讓價格動"], ["市價單", "直接吃單，主動的一方"], ["價格往上", "主動買方把最便宜的賣單吃光"], ["價格往下", "主動賣方把最貴的買單打光"]];
      R.forEach((r, k) => { s += `<g opacity="${seg(t, k * 0.18, k * 0.18 + 0.3)}"><rect x="110" y="${50 + k * 72}" width="420" height="54" rx="10" class="f-surface s-line"/><circle cx="136" cy="${77 + k * 72}" r="11" class="f-buy"/><text x="136" y="${82 + k * 72}" text-anchor="middle" class="t-w t-b">${k + 1}</text><text x="158" y="${72 + k * 72}" class="t-ink t-b t-lg">${r[0]}</text><text x="158" y="${93 + k * 72}" class="t-ink">${r[1]}</text></g>`; });
    }
    svg.innerHTML = s;
  }

  /* ---------- 你來操作 ---------- */
  const simHTML = `<div class="sim-grid bk-grid"><table class="fp sim-bk bk-t" aria-label="掛單簿"></table><div class="bk-side"><div class="bk-last"></div><div class="bk-tape small"></div></div></div>
<p class="sim-msg" aria-live="polite"></p>
<div class="bk-ctl"><label>口數 <b class="bk-q-v"></b><input type="range" class="bk-q" min="1" max="60" value="10"></label>
<div class="btn-row"><button class="btn primary" data-a="mb" type="button">市價買</button><button class="btn sell" data-a="ms" type="button">市價賣</button><button class="btn" data-a="lb" type="button">掛限價買（點左邊格子選價格）</button><button class="btn" data-a="ls" type="button">掛限價賣（點右邊格子選價格）</button><button class="btn" data-a="r" type="button">重設</button></div></div>
<ul class="sim-task bk-task"></ul>`;
  function simMount(box) {
    const q = (s) => box.querySelector(s);
    let ask, bid, last, tape, msg, pickB, pickA, mine, done;
    const reset = () => { ask = Object.assign({}, ASK0); bid = Object.assign({}, BID0); last = null; tape = []; pickB = 99.75; pickA = 100.75; mine = null; done = done || {}; msg = "選口數，按「市價買」或「市價賣」。也可以點格子選價格，再按「掛限價單」。"; paint(); };
    function paint() {
      const ba = best(ask, "ask"), bb = best(bid, "bid");
      q(".bk-t").innerHTML = `<thead><tr><td>買單在等</td><td>價格</td><td>賣單在等</td></tr></thead><tbody>${P.map((p) => { const k = k2(p); return `<tr><td class="bq pick${pickB === p ? " sel" : ""}" data-b="${p}">${bid[k] || ""}</td><td class="px">${last === p ? "▶ " : ""}${k}</td><td class="aq pick${pickA === p ? " sel" : ""}" data-a="${p}">${ask[k] || ""}</td></tr>`; }).join("")}</tbody>`;
      q(".bk-last").innerHTML = `<p>最新成交 <b>${last == null ? "—" : k2(last)}</b></p><p>Ask <b class="ts">${ba == null ? "—" : k2(ba)}</b>　Bid <b class="tb">${bb == null ? "—" : k2(bb)}</b></p><p>價差 <b>${ba != null && bb != null ? (ba - bb).toFixed(2) : "—"}</b></p>`;
      q(".bk-tape").innerHTML = tape.length ? "最近成交：<br>" + tape.map((x) => `<span class="${x[0] === "b" ? "tb" : "ts"}">${x[0] === "b" ? "主動買" : "主動賣"} ${x[2]} 口 @${k2(x[1])}</span>`).join("<br>") : "";
      q(".sim-msg").innerHTML = msg;
      q(".bk-q-v").textContent = q(".bk-q").value + " 口";
      q(".bk-task").innerHTML = [["a", "任務 1：讓最新成交價漲到 100.75 以上"], ["b", "任務 2：掛一張限價單，再用反方向的市價單讓它成交"], ["c", "任務 3：讓價差變成 0.50 以上（想想要把哪一檔吃光）"]].map(([k, t]) => `<li class="${done[k] ? "ok" : ""}">${done[k] ? "✓" : "○"} ${t}</li>`).join("");
    }
    function mkt(side) {
      const n = +q(".bk-q").value, book = side === "b" ? ask : bid, fills = eat(book, side === "b" ? "ask" : "bid", n);
      if (!fills.length) { msg = "那一邊已經沒有單可以吃了，按「重設」。"; paint(); return; }
      fills.forEach(([p, qq]) => tape.unshift([side, p, qq])); tape = tape.slice(0, 6);
      const before = last; last = fills[fills.length - 1][0];
      const got = fills.reduce((s, f) => s + f[1], 0);
      msg = `${side === "b" ? "市價買" : "市價賣"} ${n} 口：` + fills.map(([p, qq]) => `${k2(p)} 成交 ${qq} 口`).join("、") + "。" + (fills.length > 1 ? `<b>一檔不夠，吃到下一檔，價格${side === "b" ? "往上" : "往下"}跳了。</b>` : before != null && before !== last ? "價格變了。" : "那一檔還有剩，價格沒有跳。") + (got < n ? ` 還有 ${n - got} 口沒成交。` : "");
      if (mine && fills.some(([p]) => k2(p) === mine.k) && ((mine.side === "b" && side === "s") || (mine.side === "s" && side === "b"))) { done.b = true; msg += " <b>你掛的限價單被成交了！</b>"; mine = null; }
      if (last >= 100.75) done.a = true;
      const ba = best(ask, "ask"), bb = best(bid, "bid"); if (ba != null && bb != null && ba - bb >= 0.5) done.c = true;
      paint();
    }
    function lim(side) {
      const n = +q(".bk-q").value;
      if (side === "b") { const ba = best(ask, "ask"); if (ba != null && pickB >= ba) { msg = `限價買要掛在 Ask（${k2(ba)}）以下才是排隊。選低一點的價格。`; paint(); return; } const k = k2(pickB); bid[k] = (bid[k] || 0) + n; mine = { side: "b", k }; msg = `掛限價買 ${n} 口在 ${k}：去排隊，沒有成交，價格不動。現在試試用「市價賣」去吃它。`; }
      else { const bb = best(bid, "bid"); if (bb != null && pickA <= bb) { msg = `限價賣要掛在 Bid（${k2(bb)}）以上才是排隊。選高一點的價格。`; paint(); return; } const k = k2(pickA); ask[k] = (ask[k] || 0) + n; mine = { side: "s", k }; msg = `掛限價賣 ${n} 口在 ${k}：去排隊，沒有成交，價格不動。現在試試用「市價買」去吃它。`; }
      paint();
    }
    box.addEventListener("click", (e) => {
      const td = e.target.closest("td.pick"); if (td) { if (td.dataset.b) pickB = +td.dataset.b; else pickA = +td.dataset.a; paint(); return; }
      const b = e.target.closest("button[data-a]"); if (!b) return;
      ({ mb: () => mkt("b"), ms: () => mkt("s"), lb: () => lim("b"), ls: () => lim("s"), r: reset })[b.dataset.a]();
    });
    q(".bk-q").addEventListener("input", paint);
    reset();
  }

  const bookFig = (rows, cap) => `<table class="fp q-fp" aria-label="${cap}"><thead><tr><td>買單在等</td><td>價格</td><td>賣單在等</td></tr></thead><tbody>${rows.map((r) => `<tr><td class="bq">${r[1] || ""}</td><td class="px">${r[0]}</td><td class="aq">${r[2] || ""}</td></tr>`).join("")}</tbody></table>`;
  const QS = [
    { fig: bookFig([["50.75", "", 15], ["50.50", "", 10], ["50.25", "", 6], ["50.00", 9, ""], ["49.75", 14, ""]], "題目一的掛單簿"),
      q: "有人下<b>市價買單 10 口</b>。成交後，最新成交價是多少？", step: 8, o: [
      ["50.25", false, "50.25 只有 6 口，不夠 10 口。吃光後剩下 4 口要往上吃 50.50。"],
      ["50.50", true, "先吃 50.25 的 6 口，再吃 50.50 的 4 口。最新成交價是 50.50。"],
      ["50.00", false, "50.00 是買單排隊的地方。市價買單去吃右邊的賣單。"]] },
    { fig: bookFig([["50.75", "", 15], ["50.50", "", 10], ["50.25", "", 6], ["50.00", 9, ""], ["49.75", 14, ""]], "題目二的掛單簿"),
      q: "同一張掛單簿，這時的 <b>Bid</b> 是多少？", step: 4, o: [
      ["50.25", false, "50.25 是最便宜的賣價，那是 Ask。"],
      ["50.00", true, "Bid 是買單裡出價最高的，就是 50.00。想馬上賣，只能拿到這個價。"],
      ["49.75", false, "49.75 也是買單，但不是最高的。Bid 是最高的那一個。"]] },
    { fig: `<p class="small q-cap">最新成交價從 100.00 跳到 99.75。</p>`, q: "最可能發生了什麼事？", step: 11, o: [
      ["有人在 99.75 掛了很多限價買單", false, "限價單只是排隊，不會讓價格移動。"],
      ["100.00 的買單被主動賣方用市價單打光了", true, "價格往下跳一格，是因為最貴那一檔的買單被吃光，下一筆只能賣到 99.75。"],
      ["賣的人比買的人多", false, "每筆成交買賣口數一定相等。價格方向看的是誰主動吃單，不是人數。"]] }
  ];

  PAGES["of-1"] = window.KIT.page(window.COURSE.OFC, "of-1", {
    topic: "掛單簿",
    lede: "市場就是一個排隊的地方：想買的、想賣的，各自把價格掛出來排隊。價格會動，是因為有人不想排隊，直接把隊伍吃掉。這一關用 12 步動畫看價格是怎麼一格一格跳的。",
    analogy: [
      ["兩排隊伍", "演唱會門票的轉賣市場：想賣的人把票價從便宜到貴排好，想買的人把出價從高到低排好。這就是<b>掛單簿</b>。"],
      ["不想等的人", "有人急著要票，直接買下最便宜的那張。這是<b>市價單</b>：主動成交。排隊等的人用的是<b>限價單</b>。"],
      ["最便宜的被買光", "最便宜那一排的票被買光了，下一個人只能買更貴的。價格就這樣<b>往上跳</b>。"]],
    steps: STEPS, draw, simHTML, simMount,
    simIntro: "自己當市場裡的人：下市價單吃單，或掛限價單排隊，看價格怎麼跳、價差怎麼變。",
    mist: [
      ["價格上漲，是因為買的人比賣的人多", "每筆成交都有一買一賣，口數相等。價格上漲是因為<b>主動買方</b>用市價單把最便宜的賣單吃光了。"],
      ["限價單掛上去就算成交", "限價單只是排隊。要有人用市價單來吃，或價格走到那裡，才會成交。"],
      ["市價單一定用畫面上看到的價格成交", "如果數量比最前面那一檔還多，會吃到下一檔，平均成交價比較差，這叫<b>滑價</b>。"]],
    faq: [
      ["掛單簿上的數字代表什麼？", "代表在那個價格排隊的總口數。可能是一個人掛的，也可能是很多人加起來的。"],
      ["掛著的單可以撤掉嗎？", "可以，隨時都能取消或改價格。所以掛單簿上看到的大單不一定會留著，有些人會故意掛大單再撤掉，這個之後在 DOM 關卡會教。"],
      ["誰在掛限價單？", "造市商、機構、一般交易者都會。造市商通常兩邊都掛，賺買賣之間的價差。"],
      ["限價單和市價單，哪個比較好？", "沒有比較好，是取捨：市價單一定成交但價格不保證；限價單價格有保障但可能等不到。急著進出場用市價，願意等用限價。"],
      ["為什麼 NQ 的價差通常只有一格？", "NQ 每天成交量很大，很多人搶著掛最好的價格，所以 Ask 和 Bid 通常只差 0.25。成交量小的商品，價差會比較大。"],
      ["要在哪裡看掛單簿？", "看盤軟體的 DOM 或價格階梯，例如 NinjaTrader 的 SuperDOM、ATAS 的 DOM。這種資料要有即時行情才看得到。"]],
    qs: QS,
    gloss: [
      ["掛單簿", "所有排隊中的限價單整理成的表，也叫 DOM 或價格階梯。"],
      ["限價單", "指定價格去排隊，被動的一方。價格有保障，但不一定成交。"],
      ["市價單", "不指定價格、直接吃單，主動的一方。一定成交，但可能滑價。"],
      ["Ask", "目前最便宜的賣價。想馬上買要付這個價。"],
      ["Bid", "目前最高的買價。想馬上賣只能拿到這個價。"],
      ["價差", "Ask 減 Bid。NQ 通常是一格 0.25。"],
      ["滑價", "成交價比預期差，常發生在一檔的單不夠吃的時候。"],
      ["主動方", "用市價單去吃別人單的一方，是推動價格的人。"]],
    remember: "<b>限價單在排隊，市價單在吃單。</b>價格會跳，是因為某一檔的單被主動的一方吃光了。"
  });
})();
