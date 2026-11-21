/* 圖解課程　路線 1：訂單流（9 關）。例子都是虛構數字。 */
(function () {
  const PAGES = (window.__PAGES = window.__PAGES || {});
  const { OFC: C, T, lesson, loop, rng, nf, sgn, RM, $ } = window.COURSE;
  const f2 = (v) => nf(v, 2);
  const alive = (el) => document.body.contains(el);
  function candle(x, w, o, h, l, c, Y, extra = "") {
    const col = c >= o ? "var(--buy)" : "var(--sell)";
    return `<g ${extra}><line x1="${x + w / 2}" x2="${x + w / 2}" y1="${Y(h)}" y2="${Y(l)}" style="stroke:${col};stroke-width:2"/><rect x="${x}" width="${w}" y="${Y(Math.max(o, c))}" height="${Math.max(2, Math.abs(Y(o) - Y(c)))}" rx="2" style="fill:${col}"/></g>`;
  }

  /* ---------- 1. order book ---------- */
  const BOOK0 = { ask: [[100.25, 12], [100.5, 25], [100.75, 40], [101.0, 60]], bid: [[100.0, 18], [99.75, 30], [99.5, 55], [99.25, 70]] };
  PAGES["of-1"] = lesson(C, "of-1", {
    lede: "市場就是一個拍賣場：想買的人和想賣的人把報價排成隊伍。價格會動，是因為有人不想排隊，直接把隊伍吃掉。",
    pre: "o1-",
    body: `<div class="scene"><div class="scene-h"><h3>自己下單，看價格怎麼跳</h3><p class="small">橘色＝排隊等著賣的限價單，藍色＝排隊等著買的限價單。</p></div>
<div class="scene-grid"><svg id="o1-svg" viewBox="0 0 460 330" role="img" aria-label="掛單簿"></svg><div class="side" id="o1-side"></div></div>
<div class="controls" style="margin-top:10px"><div class="ctl"><label for="o1-q">下單口數 <b id="o1-q-v"></b></label><input id="o1-q" type="range" min="1" max="80" value="20"></div></div>
<div class="btn-row"><button class="btn primary" id="o1-buy" type="button">市價買進</button><button class="btn" id="o1-sell" type="button">市價賣出</button><button class="btn" id="o1-lim" type="button">掛限價買單（99.75）</button><button class="btn" id="o1-reset" type="button">重設</button></div></div>
<div class="duo"><div class="of"><h4>${T("限價單", "指定價格，掛在掛單簿上排隊等人成交。價格有保障，但不一定成交。")}＝「我排隊等」</h4>掛在簿子上等人來成交，是<b>被動</b>的一方。好處是價格有保障，壞處是可能等不到。</div>
<div class="neg"><h4>${T("市價單", "不指定價格，馬上用目前最好的價格成交。一定成交，但可能多付一點（滑價）。")}＝「我現在就要」</h4>直接吃掉隊伍最前面的單，是<b>主動</b>的一方。一定成交，但可能多付一點。</div></div>
<div class="prose"><p>${T("Ask", "目前最低的賣價。想馬上買，就要付這個價。")}是目前最低的賣價，想馬上買就付這個價；${T("Bid", "目前最高的買價。想馬上賣，就只能拿到這個價。")}是目前最高的買價，想馬上賣只能拿這個價。兩者的差叫${T("價差", "Spread：Ask − Bid。這裡是 0.25，等於一個 tick。")}。</p>
<p><b>訂單流的核心就一句話：</b>價格上漲，是主動買方用市價單吃光了最低的賣單；價格下跌，是主動賣方打光了最高的買單。後面每一關都是在看「主動的一方」。</p></div>`,
    quiz: [
      { q: "Ask 100.25 有 12 口賣單排隊、100.50 有 25 口。有人下市價買單 20 口，最新成交價會變成多少？", o: [
        ["100.25，價格不變", false, "100.25 只有 12 口，不夠 20 口。剩下的 8 口要去吃下一檔。"],
        ["100.50", true, "先吃光 100.25 的 12 口，剩 8 口吃 100.50，最新成交價跳到 100.50。"],
        ["100.00", false, "100.00 是 Bid（買方的價）。市價買單是去吃 Ask。"]] },
      { q: "一張限價買單掛在 99.75 等，價格一直沒跌下來。這張單是？", o: [
        ["主動的一方，正在推動價格", false, "限價單是在等，不會推動價格。"],
        ["被動的一方，還沒有成交", true, "限價單掛著排隊，要等主動賣方打下來才會成交。"],
        ["已經成交了，因為掛上去就算", false, "掛單不等於成交，要有人在那個價位跟你交易才算。"]] }],
    remember: "<b>限價單在等，市價單在推。</b>價格會跳，是因為某一檔的掛單被市價單吃光了。",
    mount(root) {
      const svg = $(root, "#o1-svg"); let B, tape, msg, flash = null, busy = false;
      const reset = () => { B = JSON.parse(JSON.stringify(BOOK0)); tape = []; msg = "選好口數，按「市價買進」或「市價賣出」。"; flash = null; draw(); };
      const last = () => (tape.length ? tape[tape.length - 1].p : null);
      function draw() {
        const prices = [...B.ask.map((a) => a[0]), ...B.bid.map((b) => b[0])].sort((a, b) => b - a);
        const all = []; for (let p = 101.0; p >= 99.25 - 1e-9; p -= 0.25) all.push(+p.toFixed(2));
        const rowH = 34, y0 = 34, cx = 230, sx = 1.9, lp = last();
        const qty = (side, p) => { const r = B[side].find((x) => Math.abs(x[0] - p) < 1e-9); return r ? r[1] : 0; };
        const bestA = B.ask.length ? B.ask[0][0] : null, bestB = B.bid.length ? B.bid[0][0] : null;
        svg.innerHTML = `<text x="${cx - 40}" y="20" text-anchor="end" style="fill:var(--buy-ink);font-weight:600">排隊的買單（Bid）</text><text x="${cx + 40}" y="20" style="fill:var(--sell-ink);font-weight:600">排隊的賣單（Ask）</text>
          ${all.map((p, r) => { const y = y0 + r * rowH, a = qty("ask", p), b = qty("bid", p), fl = flash && Math.abs(flash.p - p) < 1e-9;
            return `<rect x="${cx - 34}" y="${y}" width="68" height="${rowH - 6}" rx="4" style="fill:${fl ? "var(--ink)" : "var(--surface-2)"}"/>
              <text x="${cx}" y="${y + 19}" text-anchor="middle" style="${fl ? "fill:var(--bg);font-weight:700" : lp && Math.abs(lp - p) < 1e-9 ? "fill:var(--ink);font-weight:700" : ""}">${f2(p)}</text>
              ${b ? `<rect x="${cx - 40 - b * sx}" y="${y + 3}" width="${b * sx}" height="${rowH - 12}" rx="3" style="fill:var(--buy);opacity:.75"/><text x="${cx - 46 - b * sx}" y="${y + 19}" text-anchor="end">${b}</text>` : ""}
              ${a ? `<rect x="${cx + 40}" y="${y + 3}" width="${a * sx}" height="${rowH - 12}" rx="3" style="fill:var(--sell);opacity:.75"/><text x="${cx + 46 + a * sx}" y="${y + 19}">${a}</text>` : ""}
              ${p === bestA ? `<text x="452" y="${y + 19}" text-anchor="end" style="fill:var(--sell-ink);font-size:11px">← Ask</text>` : ""}${p === bestB ? `<text x="8" y="${y + 19}" style="fill:var(--buy-ink);font-size:11px">Bid →</text>` : ""}
              ${lp && Math.abs(lp - p) < 1e-9 ? `<path d="M${cx - 38} ${y + 14} l-8 -6 v12 z" style="fill:var(--ink)"/>` : ""}`; }).join("")}`;
        $(root, "#o1-side").innerHTML = `<div class="kpi"><div class="k-l">最新成交價</div><div class="k-v">${lp ? f2(lp) : "—"}</div></div>
          <div class="kpi" style="margin-top:6px"><div class="k-l">Bid ／ Ask ／ 價差</div><div class="k-v" style="font-size:16px">${bestB ? f2(bestB) : "—"} ／ ${bestA ? f2(bestA) : "—"} ／ ${bestA && bestB ? f2(bestA - bestB) : "—"}</div></div>
          <p style="margin:8px 0 6px">${msg}</p><div class="small">逐筆成交：${tape.slice(-6).map((t) => `${t.s === "b" ? "買" : "賣"} ${t.q}@${f2(t.p)}`).join("、") || "還沒有"}</div>`;
        $(root, "#o1-q-v").textContent = $(root, "#o1-q").value + " 口";
      }
      function market(side) {
        if (busy) return; const book = side === "b" ? B.ask : B.bid; let q = +$(root, "#o1-q").value; const fills = [];
        while (q > 0 && book.length) { const lvl = book[0], take = Math.min(q, lvl[1]); fills.push({ p: lvl[0], q: take, cleared: take === lvl[1] }); lvl[1] -= take; q -= take; if (!lvl[1]) book.shift(); }
        const levels = fills.length, moved = levels > 1 || (fills[0] && fills[0].cleared);
        const who = side === "b" ? "主動買方" : "主動賣方", what = side === "b" ? "賣單" : "買單";
        msg = !fills.length ? "對面沒有掛單了。按「重設」再試。" : levels === 1 && !fills[0].cleared ? `${who}吃掉 ${f2(fills[0].p)} 的 ${fills[0].q} 口${what}，那一檔還有剩，<b>價格沒有變</b>。` :
          `${who}依序吃了 ${fills.map((f) => `${f2(f.p)} 的 ${f.q} 口`).join("、")}。${moved ? `前面的${what}被吃光，<b>最新成交價跳到 ${f2(fills[fills.length - 1].p)}</b>。` : ""}${q > 0 ? `還有 ${q} 口沒成交。` : ""}`;
        busy = true; let k = 0;
        const step = () => { if (!alive(svg)) return; if (k < fills.length) { const f = fills[k++]; tape.push({ s: side, q: f.q, p: f.p }); flash = f; draw(); setTimeout(step, RM ? 0 : 420); } else { flash = null; busy = false; draw(); } };
        const keep = msg; msg = "成交中……"; step(); msg = keep;
      }
      $(root, "#o1-buy").addEventListener("click", () => market("b"));
      $(root, "#o1-sell").addEventListener("click", () => market("s"));
      $(root, "#o1-lim").addEventListener("click", () => { const r = B.bid.find((x) => x[0] === 99.75); if (r) r[1] += 10; else { B.bid.push([99.75, 10]); B.bid.sort((a, b) => b[0] - a[0]); } msg = "你在 99.75 掛了 10 口限價買單：它<b>排到隊伍後面等</b>，價格完全沒動。要等主動賣方打到 99.75 才會成交。"; draw(); });
      $(root, "#o1-reset").addEventListener("click", reset);
      $(root, "#o1-q").addEventListener("input", () => { $(root, "#o1-q-v").textContent = $(root, "#o1-q").value + " 口"; });
      reset();
    }
  });

  /* ---------- 2. candle -> footprint ---------- */
  const FP_NOTE = [[100.75, 4, 38], [100.5, 12, 60], [100.25, 30, 45], [100.0, 41, 20], [99.75, 33, 5]];
  const TAPE = [[10, "s"], [15, "b"], [20, "s"], [30, "b"]];
  PAGES["of-2"] = lesson(C, "of-2", {
    lede: "K 棒只告訴你開高低收。兩根長得一模一樣的 K 棒，裡面發生的事可能完全相反。Footprint 就是把 K 棒拆開，看每個價位上主動買賣各有多少。",
    pre: "o2-",
    body: `<div class="scene"><div class="scene-h"><h3>兩根一模一樣的 K 棒</h3><p class="small">按下按鈕，把它們拆開。</p></div>
<div class="duo" style="margin:4px 0 0" id="o2-twins"></div>
<div class="btn-row"><button class="btn primary" id="o2-open" type="button">拆開看</button></div></div>

<div class="scene"><div class="scene-h"><h3>從逐筆成交，做出 Footprint 的一格</h3><p class="small">價位 100.25 在這根 5 分鐘 K 棒裡發生了 4 筆成交。</p></div>
<div class="scene-grid"><div><table class="fp" id="o2-tape" aria-label="逐筆成交"></table></div><div class="side" id="o2-cell"></div></div>
<div class="btn-row"><button class="btn primary" id="o2-run" type="button">重新播放</button></div></div>

<div class="prose"><h2>一整根 Footprint</h2><p>每個價位都照這樣加總，疊起來就是一根 Footprint。同一份資料可以換不同方式看：</p></div>
<div class="panel"><div class="tabs" role="tablist" id="o2-tabs"><button class="tab" data-m="ba" aria-selected="true" type="button">賣 × 買</button><button class="tab" data-m="d" aria-selected="false" type="button">Delta</button><button class="tab" data-m="v" aria-selected="false" type="button">總量</button><button class="tab" data-m="p" aria-selected="false" type="button">橫條（Profile）</button></div>
<div id="o2-full"></div><p class="small" id="o2-mode-t" style="margin:8px 0 0"></p></div>
<div class="callout c-warning"><div class="callout-title">左右由軟體決定</div><div class="callout-body">這裡用「左賣右買」（ATAS 預設）。換軟體可能相反，第一次用請先看欄位標題。每個數字背後都有兩個人：「30」是 30 口主動賣，賣給了 30 口排隊的限價買單。</div></div>`,
    quiz: [
      { q: "價位 100.25 的逐筆成交：賣 10、買 15、賣 20、買 30（「買」＝吃 Ask 的主動買）。Footprint 這一格會寫成？", o: [
        ["30 × 45", true, "主動賣 10＋20＝30（左），主動買 15＋30＝45（右）。Delta ＝ 45 − 30 ＝ +15。"],
        ["45 × 30", false, "左右反了。這裡左邊是主動賣（Bid 成交）。"],
        ["75", false, "75 是總量，Footprint 的「賣 × 買」模式會把兩邊分開寫。"]] },
      { q: "Footprint 右邊（Ask 側）的 45，代表什麼？", o: [
        ["有 45 口限價買單在排隊", false, "Footprint 記錄的是已經成交的量，不是掛單。"],
        ["有 45 口主動買單，吃掉了 45 口排隊的限價賣單", true, "每一筆成交都有兩邊。Ask 側記的是主動買的那一方。"],
        ["價格會漲 45 點", false, "數字是成交口數，不是價格變動。"]] }],
    remember: "<b>Footprint＝把逐筆成交按價位加總。</b>左邊主動賣、右邊主動買，相減就是 Delta。",
    mount(root) {
      const TW = [
        { t: "K 棒 A：買方一路推上去", rows: [[100.75, 6, 52], [100.5, 14, 64], [100.25, 28, 40], [100.0, 35, 22], [99.75, 30, 8]], say: "上面幾格主動買遠大於主動賣：買方把價格推上去，而且推得動。" },
        { t: "K 棒 B：上面有人在擋", rows: [[100.75, 140, 150], [100.5, 60, 70], [100.25, 30, 34], [100.0, 26, 18], [99.75, 22, 6]], say: "最上面一格兩邊都異常大，價格卻沒有再上去：上面有大賣家用限價單接走了買單（第 5 關會教，這叫吸收）。" }];
      let open = false;
      function twins() {
        $(root, "#o2-twins").innerHTML = TW.map((k) => `<div class="of" style="padding:10px 12px"><h4 style="font-size:15px">${open ? k.t : "K 棒"}</h4>${open ? `<table class="fp">${k.rows.map((r) => `<tr><td class="b${r[1] >= 100 ? " hot" : ""}">${r[1]}</td><td class="px">${f2(r[0])}</td><td class="a${r[2] >= 50 ? " hot" : ""}">${r[2]}</td></tr>`).join("")}</table><p class="small" style="margin:6px 0 0">${k.say}</p>` :
          `<svg viewBox="0 0 240 150" style="width:100%;max-width:260px;display:block;margin:auto">${candle(70, 30, 99.9, 100.85, 99.7, 100.7, (p) => 10 + (100.9 - p) * 108)}<text x="112" y="40">開 99.90</text><text x="112" y="58">收 100.70</text></svg><p class="small" style="margin:0;text-align:center">開高低收完全相同</p>`}</div>`).join("");
      }
      twins(); $(root, "#o2-open").addEventListener("click", (e) => { open = !open; e.target.textContent = open ? "合起來" : "拆開看"; twins(); });

      let k = 0, tm = null;
      function tapeDraw() {
        const b = TAPE.slice(0, k).filter((t) => t[1] === "s").reduce((s, t) => s + t[0], 0), a = TAPE.slice(0, k).filter((t) => t[1] === "b").reduce((s, t) => s + t[0], 0);
        $(root, "#o2-tape").innerHTML = `<thead><tr><td>次序</td><td>數量</td><td>主動方</td></tr></thead><tbody>${TAPE.map((t, i) => `<tr style="opacity:${i < k ? 1 : 0.35}"><td class="px">${i + 1}</td><td class="${t[1] === "s" ? "b" : "a"}${i === k - 1 ? " hot" : ""}" style="text-align:center">${t[0]}</td><td class="px">${t[1] === "s" ? "賣（打 Bid）" : "買（吃 Ask）"}</td></tr>`).join("")}</tbody>`;
        $(root, "#o2-cell").innerHTML = `<span class="tagline">100.25 這一格</span><div class="cell-big" style="margin:8px 0"><span class="b">${b}</span><span class="x">×</span><span class="a">${a}</span></div>
          <div class="kpi"><div class="k-l">總量 ／ Delta</div><div class="k-v" style="font-size:17px">${a + b} ／ ${sgn(a - b)}</div></div><p class="small" style="margin:8px 0 0">${k < TAPE.length ? "每一筆成交依主動方，加到左邊或右邊。" : "完成：左邊 10＋20＝30，右邊 15＋30＝45，Delta＝+15。"}</p>`;
      }
      function run() { clearInterval(tm); k = RM ? TAPE.length : 0; tapeDraw(); if (RM) return; tm = setInterval(() => { if (!alive(root.querySelector("#o2-tape")) || k >= TAPE.length) return clearInterval(tm); k++; tapeDraw(); }, 900); }
      $(root, "#o2-run").addEventListener("click", run); run();

      const MODES = { ba: "左邊主動賣、右邊主動買。高價位右邊大，代表買方在推；低價位左邊大，代表賣方在低處比較活躍。", d: "每格只顯示「買 − 賣」。一眼看出每個價位誰贏。整根 Delta ＝ +48。", v: "只顯示總量（兩邊加起來）。用來找成交最熱的價位。", p: "把總量畫成橫條，就是這根 K 棒自己的 Volume Profile（第 6 關會用到）。" };
      function full(m) {
        const tb = FP_NOTE.reduce((s, r) => s + r[1], 0), ta = FP_NOTE.reduce((s, r) => s + r[2], 0), mv = Math.max(...FP_NOTE.map((r) => r[1] + r[2]));
        $(root, "#o2-full").innerHTML = `<table class="fp"><thead><tr><td>${m === "ba" ? "主動賣" : ""}</td><td>價格</td><td>${m === "ba" ? "主動買" : m === "d" ? "Delta" : m === "v" ? "總量" : "總量橫條"}</td></tr></thead><tbody>${FP_NOTE.map((r) => {
          const d = r[2] - r[1], v = r[1] + r[2];
          const right = m === "ba" ? `<td class="a${r[2] >= 38 ? " hot" : ""}">${r[2]}</td>` : m === "d" ? `<td class="a" style="color:${d >= 0 ? "var(--buy-ink)" : "var(--sell-ink)"};font-weight:600">${sgn(d)}</td>` : m === "v" ? `<td class="a">${v}</td>` : `<td class="a" style="background:none"><span style="display:inline-block;height:16px;border-radius:3px;background:var(--ink-3);width:${(v / mv) * 100}%;vertical-align:middle"></span> ${v}</td>`;
          return `<tr><td class="b${m === "ba" && r[1] >= 30 ? " hot" : ""}" ${m === "ba" ? "" : 'style="background:none"'}>${m === "ba" ? r[1] : ""}</td><td class="px">${f2(r[0])}</td>${right}</tr>`; }).join("")}
          <tr><td class="b" style="background:none;font-weight:700">${m === "ba" ? tb : ""}</td><td class="px">合計</td><td class="a" style="background:none;font-weight:700">${m === "ba" ? ta : m === "d" ? sgn(ta - tb) : ta + tb}</td></tr></tbody></table>`;
        $(root, "#o2-mode-t").textContent = MODES[m];
      }
      $(root, "#o2-tabs").addEventListener("click", (e) => { const b = e.target.closest(".tab"); if (!b) return; root.querySelectorAll("#o2-tabs .tab").forEach((x) => x.setAttribute("aria-selected", String(x === b))); full(b.dataset.m); });
      full("ba");
    }
  });

  /* ---------- 3. delta six scenarios ---------- */
  const SIX = [
    { k: "①", t: "正 Delta ＋ 價格上漲", d: 120, o: 100, c: 103, h: 103.4, l: 99.7, v: "買方推動，而且推得動。趨勢延續，通常順勢看多。", tag: "同向：延續" },
    { k: "②", t: "負 Delta ＋ 價格下跌", d: -150, o: 103, c: 99, h: 103.3, l: 98.8, v: "賣方推動，而且推得動。延續，通常順勢看空。", tag: "同向：延續" },
    { k: "③", t: "正 Delta ＋ 價格卻下跌", d: 200, o: 102, c: 100.5, h: 102.6, l: 100.2, v: "買了很多，價格不漲反跌：主動買單被上方的大賣家用限價單吸收。阻力，偏空。", tag: "反向：吸收" },
    { k: "④", t: "負 Delta ＋ 價格卻上漲", d: -200, o: 100.5, c: 102, h: 102.3, l: 100.1, v: "賣了很多，價格不跌反漲：主動賣單被下方的大買家吸收。支撐，偏多。", tag: "反向：吸收" },
    { k: "⑤", t: "高點大量負 Delta ＋ 長上影線", d: -160, o: 100.8, c: 101.2, h: 103.8, l: 100.6, v: "價格衝高後被大量主動賣壓回來，可能是獲利了結，上方出現新阻力。偏空。", tag: "上影線" },
    { k: "⑥", t: "掃過支撐後快速收回", d: 40, o: 101.4, c: 101.8, h: 102.0, l: 98.6, v: "短暫跌破前低把停損單掃掉，再快速拉回，叫止損獵殺（Stop Hunt）。若下影線裡有很多主動賣被吸收，可能是做多機會。", tag: "下影線", sup: 99.6 }];
  PAGES["of-3"] = lesson(C, "of-3", {
    lede: "Delta＝主動買 − 主動賣。它本身沒有意義，一定要和「價格有沒有跟著動」一起看。同向代表推得動，反向代表有人在擋。",
    pre: "o3-",
    body: `<div class="scene"><div class="scene-h"><h3>六種經典情境：點一張卡看動畫</h3><p class="small">這是常見的思考框架，不是保證會發生的規則。</p></div>
<div class="scene-grid"><svg id="o3-svg" viewBox="0 0 420 260" role="img" aria-label="K 棒與 Delta 的動畫"></svg><div class="side" id="o3-side"></div></div>
<div class="tabs" id="o3-tabs" style="margin-top:10px">${SIX.map((s, i) => `<button class="tab" data-i="${i}" aria-selected="${i === 2}" type="button">${s.k} ${s.t}</button>`).join("")}</div></div>

<div class="scene"><div class="scene-h"><h3>累積 Delta（CVD）：把每根 Delta 一路加起來</h3><p class="small">預設例子：+30、−10、+50、+20。拉動看看 CVD 怎麼變。</p></div>
<svg id="o3-cvd" viewBox="0 0 560 220" role="img" aria-label="每根 Delta 與累積 Delta"></svg>
<div class="controls" id="o3-cvd-ctl" style="margin-top:8px"></div><p id="o3-cvd-t" style="margin:4px 0 0"></p></div>

<div class="prose"><h2>使用 Delta 時的四個常見錯誤</h2><ul><li><b>只看 Delta 不看位置</b>：在空曠地帶的 Delta 反轉多半是雜訊。</li><li><b>看絕對數字</b>：「+100」大不大，要和最近的平均比。夜盤的 +100 可能很大，開盤時可能很普通。</li><li><b>把近似值當真</b>：TradingView 沒有真實 Bid/Ask 時，算出來的 Delta 只是估計。</li><li><b>顏色一轉就進場</b>：由紅轉綠只代表控制權可能改變，要有位置和下一根確認。</li></ul></div>`,
    quiz: [
      { q: "一根 K 棒主動買 340、主動賣 410，Delta 是多少？", o: [["+70", false, "Delta＝買 − 賣＝340 − 410。"], ["−70", true, "340 − 410 ＝ −70，賣方比較急。"], ["750", false, "那是總量。"]] },
      { q: "價格大漲，但這根 K 棒的 Delta 是 −180。屬於哪一種情境？", o: [
        ["① 同向延續", false, "Delta 負、價格漲，方向相反。"],
        ["④ 負 Delta ＋ 上漲：賣盤被吸收，偏多", true, "賣了很多價格卻漲，代表下面有大買家把賣單全接走了。"],
        ["② 賣方推動，偏空", false, "賣方沒有推動價格，價格反而漲了。"]] }],
    remember: "<b>Delta 和價格同向＝推得動；反向＝有人在擋。</b>永遠和位置、下一根 K 棒一起看。",
    mount(root) {
      const svg = $(root, "#o3-svg"); let sel = 2, t = 0;
      const Y = (p) => 20 + (104.2 - p) * 34, DY = (d) => 230 - d * 0.18;
      function draw() {
        const s = SIX[sel], e = Math.min(1, t), ph = Math.min(1, t * 1.25);
        // candle path: open -> extreme(s) -> close
        const path = s.k === "⑤" ? [s.o, s.h, s.c] : s.k === "⑥" ? [s.o, s.l, s.c] : s.c >= s.o ? [s.o, s.l, s.h, s.c] : [s.o, s.h, s.l, s.c];
        const seg = path.length - 1, pos = ph * seg, idx = Math.min(seg - 1, Math.floor(pos)), fr = pos - idx, cur = path[idx] + (path[idx + 1] - path[idx]) * fr;
        const seen = path.slice(0, idx + 1).concat([cur]), hi = Math.max(...seen), lo = Math.min(...seen);
        svg.innerHTML = `<text x="10" y="16">價格</text>
          ${s.sup ? `<line x1="40" x2="250" y1="${Y(s.sup)}" y2="${Y(s.sup)}" style="stroke:var(--gamma-ink);stroke-dasharray:5 4"/><text x="250" y="${Y(s.sup) - 5}" text-anchor="end" style="fill:var(--gamma-ink)">前低（支撐）</text>` : ""}
          ${candle(110, 44, s.o, hi, lo, cur, Y)}
          <text x="166" y="${Y(s.o) + 4}">開</text><text x="166" y="${Y(cur) + 4}" style="fill:var(--ink);font-weight:600">現</text>
          <line x1="280" x2="410" y1="${DY(0)}" y2="${DY(0)}" style="stroke:var(--ink-3)"/><text x="345" y="${DY(0) + 16}" text-anchor="middle">Delta</text>
          <rect x="320" width="50" y="${Math.min(DY(0), DY(s.d * e))}" height="${Math.abs(DY(s.d * e) - DY(0))}" rx="3" style="fill:${s.d >= 0 ? "var(--buy)" : "var(--sell)"}"/>
          <text x="345" y="${s.d >= 0 ? DY(s.d * e) - 6 : DY(s.d * e) + 16}" text-anchor="middle" style="fill:var(--ink);font-weight:600">${sgn(Math.round(s.d * e))}</text>`;
      }
      function side() { const s = SIX[sel]; $(root, "#o3-side").innerHTML = `<span class="tagline go">${s.tag}</span><h4>${s.k} ${s.t}</h4><p style="margin:0">${s.v}</p>`; }
      const lp = loop(svg, (dt) => { if (t < 1) { t += dt / 1600; draw(); } });
      function pick(i) { sel = i; t = RM ? 1 : 0; side(); draw(); lp.play(); root.querySelectorAll("#o3-tabs .tab").forEach((x) => x.setAttribute("aria-selected", String(+x.dataset.i === i))); }
      $(root, "#o3-tabs").addEventListener("click", (e) => { const b = e.target.closest(".tab"); if (b) pick(+b.dataset.i); });
      pick(2);

      const D = [30, -10, 50, 20];
      $(root, "#o3-cvd-ctl").innerHTML = D.map((v, i) => `<div class="ctl"><label for="o3-d${i}">第 ${i + 1} 根 Delta <b id="o3-d${i}-v"></b></label><input id="o3-d${i}" type="range" min="-100" max="100" step="5" value="${v}"></div>`).join("");
      function cvd() {
        D.forEach((_, i) => { D[i] = +$(root, "#o3-d" + i).value; $(root, `#o3-d${i}-v`).textContent = sgn(D[i]); });
        const cum = []; D.reduce((s, v, i) => (cum[i] = s + v), 0);
        const mx = Math.max(100, ...cum.map(Math.abs), ...D.map(Math.abs)), Y = (v) => 110 - (v / mx) * 90, X = (i) => 90 + i * 120;
        $(root, "#o3-cvd").innerHTML = `<line x1="40" x2="550" y1="${Y(0)}" y2="${Y(0)}" style="stroke:var(--ink-3)"/><text x="34" y="${Y(0) + 4}" text-anchor="end">0</text>
          <text x="34" y="${Y(mx) + 8}" text-anchor="end">+${mx}</text><text x="34" y="${Y(-mx)}" text-anchor="end">−${mx}</text>
          ${D.map((v, i) => `<rect x="${X(i) - 22}" width="44" y="${Math.min(Y(0), Y(v))}" height="${Math.max(1, Math.abs(Y(v) - Y(0)))}" rx="3" style="fill:${v >= 0 ? "var(--buy)" : "var(--sell)"};opacity:.55"/><text x="${X(i)}" y="214" text-anchor="middle">第 ${i + 1} 根</text>`).join("")}
          <polyline fill="none" style="stroke:var(--ink);stroke-width:2.2" points="${cum.map((v, i) => `${X(i)},${Y(v)}`).join(" ")}"/>
          ${cum.map((v, i) => `<circle cx="${X(i)}" cy="${Y(v)}" r="5" style="fill:var(--ink);stroke:var(--surface);stroke-width:2"/><text x="${X(i) + 9}" y="${Y(v) - 8}" style="fill:var(--ink);font-weight:600">${v}</text>`).join("")}`;
        const up = cum[3] > cum[0];
        $(root, "#o3-cvd-t").innerHTML = `<span class="legend" style="display:inline-flex"><span><i style="background:var(--buy);opacity:.55"></i>每根 Delta（長條）</span><span><i style="background:var(--ink)"></i>累積 Delta（線）</span></span>　CVD 依序是 ${cum.join("、")}，${up ? "一路往上＝買方力量在累積" : "沒有往上＝買方沒有累積優勢"}。`;
      }
      $(root, "#o3-cvd-ctl").addEventListener("input", cvd); cvd();
    }
  });

  /* ---------- 4. imbalance ---------- */
  const STACK = [[101.25, 20, 64], [101.0, 12, 55], [100.75, 14, 48], [100.5, 9, 30]];
  PAGES["of-4"] = lesson(C, "of-4", {
    lede: "失衡＝某個地方，買方或賣方明顯比對方用力很多。Footprint 的失衡不是橫著比左右，而是斜著比。下面用一根 Footprint 實際算一次。",
    pre: "o4-",
    body: `<div class="scene"><div class="scene-h"><h3>拉門檻，看哪些格子會被標出來</h3><p class="small">點任何一格，右邊會算給你看它和誰比。</p></div>
<div class="tabs" id="o4-tabs"><button class="tab" data-k="note" aria-selected="true" type="button">範例 Footprint</button><button class="tab" data-k="stack" aria-selected="false" type="button">堆疊範例</button></div>
<div class="fp-wrap"><table class="fp" id="o4-fp" aria-label="Footprint"></table><div class="side" id="o4-calc"></div></div>
<div class="controls" style="margin-top:10px"><div class="ctl"><label for="o4-th">失衡門檻 <b id="o4-th-v"></b></label><input id="o4-th" type="range" min="150" max="500" step="50" value="300"></div>
<div class="ctl"><label for="o4-min">最小量（太小不標） <b id="o4-min-v"></b></label><input id="o4-min" type="range" min="0" max="40" step="1" value="0"></div></div>
<p class="small" id="o4-sum" style="margin:0"></p></div>
<div class="prose"><h2>為什麼要斜著比？</h2><p>價格要往上走一格，買方必須把<b>上面那一檔</b>的賣單吃光。所以「這一格的主動買（Ask）」要和「下面一檔的主動賣（Bid）」比，看這一小段價格裡誰比較用力。賣方失衡反過來：這一格的 Bid 和上面一檔的 Ask 比。</p>
<h2>門檻怎麼選？</h2><p>沒有標準答案：ATAS 預設 150%，RAIN 用 200%，Anastasia 課程用 300%，有人說 4x（400%）。建議用 Replay 看 5～10 個熟悉的時段，調到被標出的格子約佔整根的 10～20%：太多＝太鬆，幾乎沒有＝太緊。再加上「最小量」，避免 3 口對 1 口這種沒意義的 300%。</p></div>`,
    quiz: [
      { q: "某價位 Ask＝40，下一檔的 Bid＝10。這是幾倍？算不算 4x 失衡？", o: [["4 倍，剛好 400%，算", true, "40 ÷ 10 ＝ 4。門檻 4x 時剛好達標（要看軟體是 ≥ 還是 >）。"], ["0.25 倍，不算", false, "買方失衡是 Ask ÷ 下一檔 Bid，不是反過來。"], ["要和同一價位的 Bid 比", false, "Footprint 的失衡是斜著比，不是橫著比。"]] },
      { q: "連續 3 個相鄰價位都出現買方失衡（堆疊失衡）。常見的用法是？", o: [
        ["看到就立刻追多", false, "筆記特別提醒：不是看到就追。"],
        ["當成可能的支撐區，等價格回測這一段再考慮做多，停損放在區間外側", true, "它代表買方曾強勢推過這段價格，回測時可能有支撐。"],
        ["代表馬上要反轉向下", false, "堆疊買方失衡是買方強勢的足跡，不是反轉訊號。"]] }],
    remember: "<b>失衡要斜著比</b>：這一格的買 vs 下一格的賣。門檻和最小量要用 Replay 自己調。",
    mount(root) {
      let key = "note", pick = 0;
      const data = () => (key === "note" ? FP_NOTE : STACK);
      function draw() {
        const th = +$(root, "#o4-th").value / 100, mn = +$(root, "#o4-min").value, d = data();
        $(root, "#o4-th-v").textContent = Math.round(th * 100) + "%（" + nf(th, 1) + "x）"; $(root, "#o4-min-v").textContent = mn + " 口";
        const buy = d.map((r, i) => (i + 1 < d.length ? r[2] / Math.max(1e-9, d[i + 1][1]) : null)), sell = d.map((r, i) => (i > 0 ? r[1] / Math.max(1e-9, d[i - 1][2]) : null));
        const okB = (i) => buy[i] != null && buy[i] >= th && d[i][2] >= mn, okS = (i) => sell[i] != null && sell[i] >= th && d[i][1] >= mn;
        const p = Math.min(pick, d.length - 1), cmpB = p + 1 < d.length ? p + 1 : null, cmpS = p > 0 ? p - 1 : null;
        $(root, "#o4-fp").innerHTML = `<thead><tr><td>主動賣（Bid）</td><td>價格</td><td>主動買（Ask）</td></tr></thead><tbody>${d.map((r, i) => `<tr class="${i === p ? "cur" : ""}" data-i="${i}" style="cursor:pointer"><td class="b${okS(i) ? " imb-b" : ""}" style="${i === cmpB ? "outline:2px dashed var(--buy);outline-offset:-3px" : ""}">${r[1]}</td><td class="px">${f2(r[0])}</td><td class="a${okB(i) ? " imb-a" : ""}" style="${i === cmpS ? "outline:2px dashed var(--sell);outline-offset:-3px" : ""}">${r[2]}</td></tr>`).join("")}</tbody>`;
        const r = d[p];
        $(root, "#o4-calc").innerHTML = `<span class="tagline">價位 ${f2(r[0])}</span>
          <p style="margin:6px 0"><b style="color:var(--buy-ink)">買方：</b>${buy[p] == null ? "最低一檔沒有下一檔可比。" : `Ask ${r[2]} ÷ 下一檔（${f2(d[p + 1][0])}）的 Bid ${d[p + 1][1]} ＝ <b>${Math.round(buy[p] * 100)}%</b>　${okB(p) ? "✓ 失衡" : "✗"}`}</p>
          <p style="margin:0 0 6px"><b style="color:var(--sell-ink)">賣方：</b>${sell[p] == null ? "最高一檔沒有上一檔可比。" : `Bid ${r[1]} ÷ 上一檔（${f2(d[p - 1][0])}）的 Ask ${d[p - 1][2]} ＝ <b>${Math.round(sell[p] * 100)}%</b>　${okS(p) ? "✓ 失衡" : "✗"}`}</p>
          <p class="small" style="margin:0">虛線框＝被拿來比較的那一格。</p>`;
        const nB = d.filter((_, i) => okB(i)).length, nS = d.filter((_, i) => okS(i)).length; let run = 0, best = 0; d.forEach((_, i) => { run = okB(i) ? run + 1 : 0; best = Math.max(best, run); });
        $(root, "#o4-sum").innerHTML = `標出 <b>${nB}</b> 格買方失衡（藍框）、<b>${nS}</b> 格賣方失衡（紅框），佔全部格子的 ${Math.round(((nB + nS) / (d.length * 2)) * 100)}%。${best >= 3 ? `　<b>連續 ${best} 格買方失衡＝堆疊失衡。</b>` : ""}`;
      }
      $(root, "#o4-fp").addEventListener("click", (e) => { const tr = e.target.closest("tr[data-i]"); if (tr) { pick = +tr.dataset.i; draw(); } });
      $(root, "#o4-tabs").addEventListener("click", (e) => { const b = e.target.closest(".tab"); if (!b) return; key = b.dataset.k; pick = 0; root.querySelectorAll("#o4-tabs .tab").forEach((x) => x.setAttribute("aria-selected", String(x === b))); draw(); });
      ["#o4-th", "#o4-min"].forEach((k) => $(root, k).addEventListener("input", draw));
      draw();
    }
  });

  /* ---------- 5. five confirmations ---------- */
  const C1 = { o: 5008.75, c: 5010.0, rows: [[5010.25, 12, 60], [5010.0, 30, 85], [5009.75, 30, 55], [5009.5, 38, 45], [5009.25, 33, 35], [5009.0, 28, 30], [5008.75, 25, 20], [5008.5, 24, 10]] };
  const C2 = { o: 5010.0, c: 5009.0, rows: [[5010.25, 20, 35], [5010.0, 210, 230], [5009.75, 70, 40], [5009.5, 60, 30], [5009.25, 50, 25], [5009.0, 45, 20], [5008.75, 30, 10]] };
  const SIG = [
    { n: "Absorption（吸收）", at: 2, ok: true, why: "5010.00 這一格同時有 210 口主動賣、230 口主動買，是平均（約 40 口）的 5 倍以上，價格卻沒有再上去。" },
    { n: "大限價單", at: 2, ok: null, why: "Ask 側 230 口是異常大量，但它和吸收是同一格、同一件事。提醒：重疊的訊號不要重複計分。" },
    { n: "被套交易者", at: 2, ok: true, why: "第一根在頂部追買的人（Ask 大量），下一根價格就往下收陰：他們被套住，認賠時的賣單會加速下跌。" },
    { n: "主動交易者", at: 2, ok: false, why: "第二根的 Bid 側沒有特別突出的單一大量（其他格只有 30～70 口），這個訊號沒有出現。" },
    { n: "Delta 轉向", at: 2, ok: true, why: "第一根 Delta +120，第二根 −95：在阻力位由正轉負，賣方接手。" }];
  PAGES["of-5"] = lesson(C, "of-5", {
    lede: "價格到了關鍵位，要找的不是一個訊號，而是幾個訊號一起出現。這關重播一個情境：ES 來到昨日價值區上緣 5010。",
    pre: "o5-",
    body: `<div class="scene"><div class="scene-h"><h3>情境重播：ES 在昨日 VAH 5010（阻力）</h3><p class="small">一步一步看，下面的檢查清單會跟著打勾。平均每個價位約 40 口。</p></div>
<p class="o5-say" id="o5-say" aria-live="polite"></p>
<div class="o5-fps" id="o5-fps"></div>
<div class="btn-row"><button class="btn" id="o5-prev" type="button">上一步</button><button class="btn primary" id="o5-next" type="button">下一步</button><span class="small" id="o5-step"></span></div>
<div id="o5-check"></div></div>

<div class="scene"><div class="scene-h"><h3>被套交易者：為什麼他們會加速反向？</h3><p class="small">藍點＝在高點追買的人。</p></div>
<div class="scene-grid"><svg id="o5-trap" viewBox="0 0 460 230" role="img" aria-label="被套交易者動畫"></svg><div class="side" id="o5-trap-t"></div></div></div>

<div class="prose"><h2>五個訊號總表</h2></div>
<div class="table-wrap"><table><thead><tr><th>訊號</th><th>在阻力位（做空）看什麼</th><th>在支撐位（做多）看什麼</th></tr></thead><tbody>
<tr><td>Absorption</td><td>同價位 Bid 與 Ask 都很大，價格不過</td><td>同左</td></tr><tr><td>大限價單</td><td>Ask 側異常大量</td><td>Bid 側異常大量</td></tr><tr><td>被套交易者</td><td>頂部大量後，下一根轉空</td><td>底部大量後，下一根轉多</td></tr><tr><td>主動交易者</td><td>Bid 側大量（主動賣進場）</td><td>Ask 側大量（主動買進場）</td></tr><tr><td>Delta 轉向</td><td>由正轉負</td><td>由負轉正</td></tr></tbody></table></div>
<div class="prose"><p>教學影片的用法：關鍵位出現 2～3 個就夠考慮進場；錯過也沒關係，只做第一次觸碰。這些都是推論式的解讀，不是統計驗證過的規律。</p></div>`,
    quiz: [
      { q: "在阻力位，某一格 Ask 側出現 193 口（平均約 40），Bid 只有 8 口。為什麼可能代表「大賣家」？", o: [
        ["因為 Ask 數字代表限價買單", false, "Ask 側數字是主動買方吃掉的量。"],
        ["主動買一直吃 Ask 卻吃不穿，代表那裡有一堵限價賣單的牆", true, "也可能是買方衝進來被套住，要靠位置和下一根 K 棒判斷。"],
        ["因為 193 大於 40，所以一定是賣家", false, "量大本身分不出是誰，要看價格結果。"]] },
      { q: "同一格同時符合「吸收」和「大限價單」，你的確認數該怎麼算？", o: [["算 2 個", false, "它們描述的是同一格、同一件事。"], ["算 1 個，重疊的訊號不重複計分", true, "提醒：有些訊號互相重疊，不要重複計分。"], ["都不算", false, "它還是一個有效的確認，只是不能算兩次。"]] }],
    remember: "<b>位置先、訊號後，2～3 個確認就夠。</b>重疊的訊號只算一次，錯過的位置不追。",
    mount(root) {
      let st = 0; const N = 3;
      const fp = (k, title, show) => `<div><div class="small" style="margin-bottom:4px"><b>${title}</b></div>${show ? `<table class="fp">${k.rows.map((r) => `<tr class="${r[0] === 5010 ? "zone" : ""}"><td class="b${r[1] >= 150 ? " hot" : ""}">${r[1]}</td><td class="px">${nf(r[0], 2)}${r[0] === 5010 ? "<br><small>VAH</small>" : ""}</td><td class="a${r[2] >= 60 ? " hot" : ""}">${r[2]}</td></tr>`).join("")}</table><div class="small" style="margin-top:4px">Delta <b>${sgn(k.rows.reduce((s, r) => s + r[2] - r[1], 0))}</b>　·　${k.c >= k.o ? "陽線" : "陰線"}（${nf(k.o, 2)} → ${nf(k.c, 2)}）</div>` : `<div class="note-box" style="margin:0">還沒出現</div>`}</div>`;
      const STEPS = ["價格往上走，來到昨日 VAH 5010。先確認：這是你盤前標好的位置。", "第一根 K 棒上衝到 5010.25，頂部 Ask 側量大，Delta +120，看起來像要突破。<b>先別急</b>，等下一根。", "第二根 K 棒：5010.00 兩邊都爆量（210 × 230），價格卻上不去，收陰線，Delta −95。"];
      function draw() {
        $(root, "#o5-fps").innerHTML = fp(C1, "第 1 根 5 分 K", st >= 1) + fp(C2, "第 2 根 5 分 K", st >= 2);
        const cnt = SIG.filter((s) => st >= s.at && s.ok).length;
        $(root, "#o5-say").innerHTML = STEPS[st];
        const card = (ok, n, txt, on) => `<div class="o5-c ${on ? (ok === true ? "yes" : ok === false ? "no" : "dup") : "wait"}"><span class="o5-i">${on ? (ok === true ? "✓" : ok === false ? "✗" : "＝") : "…"}</span><div><b>${n}</b>${on ? `<p>${ok === null ? "（不另計）" : ok === false ? "（沒有出現）" : ""}${txt}</p>` : `<p class="small">第 2 根出現後才判斷</p>`}</div></div>`;
        $(root, "#o5-check").innerHTML = `<div class="o5-grid">${card(true, "位置", "昨日 VAH（阻力），盤前就標好的位置。", true)}${SIG.map((x) => card(x.ok, x.n, x.why, st >= x.at)).join("")}</div>
          ${st >= 2 ? `<p class="ok-t o5-sum">位置正確＋${cnt} 個確認，符合「幾個確認就夠」。接下來才是停損與風報比（第 13 關）。</p>` : ""}`;
        $(root, "#o5-step").textContent = `第 ${st + 1} / ${N} 步`;
      }
      $(root, "#o5-next").addEventListener("click", () => { st = Math.min(N - 1, st + 1); draw(); });
      $(root, "#o5-prev").addEventListener("click", () => { st = Math.max(0, st - 1); draw(); });
      draw();

      const svg = $(root, "#o5-trap"), dots = Array.from({ length: 9 }, (_, i) => ({ x: 150 + (i % 3) * 16 + Math.floor(i / 3) * 4, y: 44 + Math.floor(i / 3) * 12 }));
      const keys = [[0, 150], [40, 60], [55, 50], [70, 70], [100, 110], [130, 190], [160, 205]], X = (i) => 20 + i * 2.6;
      const P = (i) => { for (let k = 1; k < keys.length; k++) if (i <= keys[k][0]) { const [a, b] = keys[k - 1], [c, d] = keys[k]; return b + ((d - b) * (i - a)) / (c - a); } return 205; };
      const SAY = ["<b>① 買方衝上去</b>：價格上衝，頂部出現大量主動買，很多人追進場。", "<b>② 推不上去</b>：大量買單沒有把價格推高，價格開始回落。追高的人帳上開始虧損。", "<b>③ 被套的人認賠</b>：他們平倉只能賣出（市價賣單），這些賣單變成往下的推力，跌勢加速。"];
      let t = 0, ph = -1;
      const lp = loop(svg, (dt) => { t += dt / 45; if (t > 175) t = 0; tr(); });
      function tr() {
        const i = Math.min(160, t), phase = i < 55 ? 0 : i < 100 ? 1 : 2;
        const pts = []; for (let k = 0; k <= i; k++) pts.push(`${X(k).toFixed(1)},${P(k).toFixed(1)}`);
        svg.innerHTML = `<line x1="20" x2="450" y1="50" y2="50" style="stroke:var(--sell-ink);stroke-dasharray:5 4"/><text x="446" y="44" text-anchor="end" style="fill:var(--sell-ink)">阻力</text>
          <polyline fill="none" style="stroke:var(--ink-2);stroke-width:2.2" points="${pts.join(" ")}"/>
          ${i > 35 ? dots.map((d) => `<circle cx="${d.x}" cy="${d.y}" r="5" style="fill:${phase === 0 ? "var(--buy)" : "var(--sell)"};opacity:${phase === 2 ? 0.35 : 0.9}"/>`).join("") : ""}
          ${phase === 2 ? [0, 1, 2].map((k) => `<path d="M${300 + k * 26} ${120 + ((t * 3 + k * 20) % 40)} v18 m-5 -6 l5 6 l5 -6" fill="none" style="stroke:var(--sell);stroke-width:2"/>`).join("") + `<text x="300" y="112" style="fill:var(--sell-ink);font-weight:600">認賠賣出</text>` : ""}
          ${phase >= 1 ? `<text x="150" y="30" style="fill:var(--sell-ink)">追高的人被套</text>` : ""}`;
        if (phase !== ph) { ph = phase; $(root, "#o5-trap-t").innerHTML = SAY[phase] + `<p class="small" style="margin:8px 0 0">提醒：這是推測。實際上很難知道這些成交是誰、是不是真的被套。</p>`; }
      }
      if (RM) { lp.pause(); t = 120; } tr();
    }
  });

  /* ---------- 6. volume profile ---------- */
  const VP = [[106, 40], [105, 110], [104, 280], [103, 500], [102, 300], [101, 120], [100, 50]];
  PAGES["of-6"] = lesson(C, "of-6", {
    lede: "Footprint 訊號要在「對的地方」才有用。Volume Profile 把成交量橫著放在價格旁邊，告訴你哪些價位成交最多。很多人在那裡買賣過，他們的成本就在那。",
    pre: "o6-",
    body: `<div class="scene"><div class="scene-h"><h3>看一天的成交量堆成 Profile，再找出價值區</h3><p class="small">數字是例子：一天總共 1,400 口。</p></div>
<div class="scene-grid"><svg id="o6-svg" viewBox="0 0 460 300" role="img" aria-label="Volume Profile"></svg><div class="side" id="o6-side"></div></div>
<div class="btn-row"><button class="btn" id="o6-replay" type="button">重新堆疊</button><button class="btn primary" id="o6-va" type="button">找價值區：下一步</button></div></div>
<div class="duo">
<div class="of"><h4>POC（控制點）</h4>成交量最大的價位。市場「最認同」的價格，常像磁鐵把價格吸回來。</div>
<div class="of"><h4>價值區（VA）</h4>包含約 70% 成交量的範圍。上緣 VAH、下緣 VAL。</div>
<div class="op"><h4>HVN 高量節點</h4>成交特別多的區域，價格容易在這裡打轉、停留。</div>
<div class="neg"><h4>LVN 低量節點</h4>成交特別少的區域，價格通常快速穿過，像真空。<b>不要在這裡進場。</b></div></div>
<div class="scene"><div class="scene-h"><h3>價格在哪裡，想法就不同</h3><p class="small">拖動今天的價格，對照昨天的 Profile（POC 103、VA 102～104）。</p></div>
<div class="controls"><div class="ctl"><label for="o6-p">今天價格 <b id="o6-p-v"></b></label><input id="o6-p" type="range" min="99" max="107" step="0.25" value="104.5"></div></div><p id="o6-ctx" style="margin:0"></p></div>
<div class="prose"><p>三種常見的方法：① 只用已經完成的日／週／月 POC 當水平位置；② 在價值區內做邊緣回 POC，離開後回測邊緣做順勢；③ 在 HVN 邊緣用 Footprint 觸發，停損放 HVN 外側，不在 HVN 內部交易。</p></div>`,
    quiz: [
      { q: "上面的例子，POC 是哪個價位？", o: [["103（500 口）", true, "成交量最大的價位就是 POC。"], ["106（最高價）", false, "POC 看的是成交量，不是最高價。"], ["102～104", false, "那是價值區。"]] },
      { q: "價格來到一個 LVN（低量節點），Footprint 剛好出現失衡。照這個想法？", o: [["在這裡進場，失衡＋LVN 很強", false, "LVN 是價格快速經過的地方，不適合當進場點。"], ["不在這裡進場；LVN 用來判斷價格會被拉到哪裡", true, "常見錯誤：把 LVN 當進場點。"], ["反向做，因為 LVN 一定會反轉", false, "沒有這種規則。"]] }],
    remember: "<b>POC 是磁鐵，價值區是共識，LVN 是真空。</b>在價值區邊緣找訊號，不在 LVN 進場。",
    mount(root) {
      const svg = $(root, "#o6-svg"), tot = VP.reduce((s, r) => s + r[1], 0), Y = (p) => 22 + (106 - p) * 40, sx = 0.6;
      let fill = VP.map(() => 0), vaStep = 0, t = 0; const r = rng(3);
      const cdf = []; VP.reduce((s, v, i) => (cdf[i] = s + v[1] / tot), 0);
      const va = [3, 4, 2]; // indexes: 103, then 102, then 104
      function draw() {
        const inVA = va.slice(0, vaStep);
        svg.innerHTML = `${VP.map(([p, v], i) => { const w = fill[i] * sx, isP = vaStep >= 1 && i === 3, isV = inVA.includes(i);
          return `<text x="40" y="${Y(p) + 5}" text-anchor="end">${p}</text>
            <rect x="50" y="${Y(p) - 14}" width="${Math.max(1, w)}" height="28" rx="3" style="fill:${isP ? "var(--buy)" : isV ? "color-mix(in srgb,var(--buy) 55%,var(--surface-2))" : "var(--ink-3)"};opacity:${isP || isV ? 1 : 0.45}"/>
            <text x="${56 + w}" y="${Y(p) + 5}">${Math.round(fill[i])}${isP ? "　← POC" : ""}</text>`; }).join("")}
          ${vaStep >= 3 ? `<line x1="46" x2="440" y1="${Y(104) - 18}" y2="${Y(104) - 18}" style="stroke:var(--buy-ink);stroke-dasharray:5 4"/><text x="440" y="${Y(104) - 22}" text-anchor="end" style="fill:var(--buy-ink)">VAH 104</text>
            <line x1="46" x2="440" y1="${Y(102) + 18}" y2="${Y(102) + 18}" style="stroke:var(--buy-ink);stroke-dasharray:5 4"/><text x="440" y="${Y(102) + 32}" text-anchor="end" style="fill:var(--buy-ink)">VAL 102</text>` : ""}`;
        const cum = inVA.reduce((s, i) => s + VP[i][1], 0);
        const SAY = ["先等成交量堆完，再按「找價值區」。總量 1,400 口，70% ＝ 980 口。", "從 POC 103（500 口）開始，累計 500，還不到 980。", "往兩側看，下面的 102（300）比上面的 104（280）大，先加 102：累計 800。", "再加 104（280）：累計 1,080，超過 980。完成：<b>VA ＝ 102～104</b>。"];
        $(root, "#o6-side").innerHTML = `<div class="kpi"><div class="k-l">價值區累計</div><div class="k-v">${nf(cum)} / 980</div><div class="k-n">${Math.round((cum / tot) * 100)}% 的總量</div></div><p style="margin:8px 0 0">${SAY[vaStep]}</p><p class="small" style="margin:8px 0 0">正式算法常是每次比較上下各兩檔，不同軟體結果略有差異，但概念相同。</p>`;
      }
      const lp = loop(svg, (dt) => { if (t < 1) { t = Math.min(1, t + dt / 2500); const n = 14; for (let k = 0; k < n; k++) { const u = r(), i = cdf.findIndex((c) => u <= c); fill[i] = Math.min(VP[i][1], fill[i] + tot / 600); } if (t >= 1) fill = VP.map((v) => v[1]); draw(); } });
      $(root, "#o6-replay").addEventListener("click", () => { fill = VP.map(() => 0); vaStep = 0; t = RM ? 1 : 0; if (RM) fill = VP.map((v) => v[1]); draw(); });
      $(root, "#o6-va").addEventListener("click", (e) => { fill = VP.map((v) => v[1]); t = 1; vaStep = (vaStep + 1) % 4; e.target.textContent = vaStep === 3 ? "重新開始" : "找價值區：下一步"; draw(); });
      if (RM) { t = 1; fill = VP.map((v) => v[1]); } draw();
      function ctx() {
        const p = +$(root, "#o6-p").value; $(root, "#o6-p-v").textContent = nf(p, 2);
        $(root, "#o6-ctx").innerHTML = Math.abs(p - 103) <= 0.25 ? "<b>在 POC 附近</b>：市場最認同的價格，容易來回，訊號可靠度低。通常當目標，不當進場點。" :
          p >= 102 && p <= 104 ? "<b>在價值區內</b>：平衡狀態。在 VAH／VAL 邊緣找反向訊號，以 POC 為目標。" :
          p > 104 && p <= 105.5 ? "<b>剛離開價值區上方</b>：失衡。突破有量 → 等回測 VAH 再順勢；沒量 → 可能回到價值區（失敗的拍賣，第 7 關）。" :
          p < 102 && p >= 100.5 ? "<b>剛離開價值區下方</b>：失衡。跌破有量 → 等回測 VAL 再順勢；沒量 → 可能回到價值區。" :
          "<b>在 LVN（100 或 106 附近）</b>：很少人交易的價位，價格通常很快穿過。不在這裡進場，用來判斷價格會被拉到哪。";
      }
      $(root, "#o6-p").addEventListener("input", ctx); ctx();
    }
  });

  /* ---------- 7. market profile ---------- */
  const TPO = [["A", 103, 108], ["B", 106, 109], ["C", 105, 106]];
  PAGES["of-7"] = lesson(C, "of-7", {
    lede: "Volume Profile 用成交量看「大家在哪裡交易」，Market Profile 用時間看「價格在哪裡停留最久」。這一關是進階補充，覺得太多可以先跳過。",
    pre: "o7-",
    body: `<div class="scene"><div class="scene-h"><h3>TPO：把每 30 分鐘去過的價位寫上字母</h3><p class="small">例子：A 時段 103～108，B 時段 106～109，C 時段 105～106。</p></div>
<div class="scene-grid"><svg id="o7-svg" viewBox="0 0 420 280" role="img" aria-label="TPO 字母圖"></svg><div class="side" id="o7-side"></div></div>
<div class="btn-row"><button class="btn primary" id="o7-run" type="button">重新播放</button></div></div>
<div class="scene"><div class="scene-h"><h3>成功的拍賣 vs 失敗的拍賣</h3><p class="small">價值區 4990～5010。價格向上衝出去之後，看量決定市場接不接受。</p></div>
<div class="tabs" id="o7-tabs"><button class="tab" data-k="ok" aria-selected="true" type="button">成功：放量突破</button><button class="tab" data-k="fail" aria-selected="false" type="button">失敗：沒量衝高</button></div>
<div class="scene-grid"><svg id="o7-auc" viewBox="0 0 460 240" role="img" aria-label="拍賣成功與失敗"></svg><div class="side" id="o7-auc-t"></div></div></div>
<div class="prose"><p>市場大約 80% 的時間是平衡（經驗法則，不是精確統計）：價格在一個範圍內來回。有人不同意現價時，價格離開去找新的公平價，就是趨勢。</p></div>`,
    quiz: [
      { q: "TPO 版的 POC 和 Volume Profile 版的 POC，差別是？", o: [["完全一樣", false, "兩者常常不同。"], ["TPO 看停留的時間，Volume Profile 看成交量", true, "Market Profile 的 POC 是字母最多（停留最久）的價位。"], ["TPO 看的是最高價", false, "TPO 看的是每個價位出現過幾個時段。"]] },
      { q: "價值區 4990～5010，價格衝到 5012 但量很小，隨後回到 5008。這是？", o: [["成功的拍賣，接下來續漲", false, "成功的拍賣要伴隨大量。"], ["失敗的拍賣，很可能繼續在區間內", true, "沒有量、沒有力道，市場不接受新價格。"], ["代表價值區要往上移", false, "市場沒有接受 5012，價值區不變。"]] }],
    remember: "<b>停留越久＝越被認同。</b>離開價值區時看量：有量是接受，沒量多半會回來。",
    mount(root) {
      const svg = $(root, "#o7-svg"), Y = (p) => 26 + (109 - p) * 34; let k = 0, tm;
      function draw() {
        const rows = []; for (let p = 109; p >= 103; p--) rows.push(p);
        const letters = (p) => TPO.slice(0, k).filter((t) => p >= t[1] && p <= t[2]).map((t) => t[0]);
        const max = Math.max(...rows.map((p) => letters(p).length));
        svg.innerHTML = rows.map((p) => { const L = letters(p), poc = k === 3 && L.length === max;
          return `<text x="40" y="${Y(p) + 5}" text-anchor="end">${p}</text>${L.map((c, i) => `<rect x="${56 + i * 36}" y="${Y(p) - 14}" width="30" height="28" rx="4" style="fill:${poc ? "var(--buy)" : "var(--surface-2)"};stroke:var(--line)"/><text x="${71 + i * 36}" y="${Y(p) + 5}" text-anchor="middle" style="fill:${poc ? "#fff" : "var(--ink)"};font-weight:600">${c}</text>`).join("")}${poc ? `<text x="${64 + L.length * 36}" y="${Y(p) + 5}" style="fill:var(--buy-ink);font-weight:600">← POC（停留最久）</text>` : ""}`; }).join("")
          + (k >= 2 ? `<rect x="250" y="${Y(109) - 14}" width="8" height="${Y(103) - Y(109) + 28}" rx="3" style="fill:var(--gamma);opacity:.6"/><text x="264" y="${Y(106)}" style="fill:var(--gamma-ink)">初始平衡 IB</text><text x="264" y="${Y(106) + 16}" style="fill:var(--gamma-ink)">103～109（A＋B）</text>` : "");
        const SAY = ["每 30 分鐘一個字母。價格在那段時間去過哪些價位，就在那裡寫上字母。", "<b>A 時段</b>（開盤前 30 分鐘）價格在 103～108。", "<b>B 時段</b> 在 106～109。A＋B 就是開盤第一小時，範圍叫<b>初始平衡（IB）</b>，之後價格怎麼對待它，透露誰在控制。", "<b>C 時段</b> 在 105～106。106 有 A、B、C 三個字母，停留最久，是 TPO 版的 <b>POC</b>。"];
        $(root, "#o7-side").innerHTML = `<p style="margin:0">${SAY[k]}</p>`;
      }
      function run() { clearInterval(tm); k = RM ? 3 : 0; draw(); if (!RM) tm = setInterval(() => { if (!alive(svg) || k >= 3) return clearInterval(tm); k++; draw(); }, 1400); }
      $(root, "#o7-run").addEventListener("click", run); run();

      const auc = $(root, "#o7-auc"); let mode = "ok", t = 0;
      const PATH = { ok: [[0, 5000], [20, 5004], [35, 5009], [45, 5014], [60, 5013], [70, 5011], [85, 5018], [100, 5024]], fail: [[0, 5000], [20, 5004], [35, 5009], [45, 5012], [55, 5010], [70, 5008], [85, 5003], [100, 5001]] };
      const VOL = { ok: [20, 22, 25, 28, 30, 70, 85, 80, 60, 55, 50, 58, 65, 60, 55], fail: [20, 22, 25, 28, 30, 26, 18, 15, 22, 24, 26, 25, 23, 24, 22] };
      const Y2 = (p) => 20 + (5026 - p) * 4.2, X2 = (i) => 30 + i * 4;
      const at = (i) => { const k2 = PATH[mode]; for (let j = 1; j < k2.length; j++) if (i <= k2[j][0]) { const [a, b] = k2[j - 1], [c, d] = k2[j]; return b + ((d - b) * (i - a)) / (c - a); } return k2[k2.length - 1][1]; };
      function da() {
        const i = Math.min(100, t), pts = []; for (let j = 0; j <= i; j++) pts.push(`${X2(j)},${Y2(at(j)).toFixed(1)}`);
        const nb = Math.min(15, Math.floor(i / 6.7) + 1);
        auc.innerHTML = `<rect x="30" width="400" y="${Y2(5010)}" height="${Y2(4990) - Y2(5010)}" style="fill:var(--buy);opacity:.08"/><text x="426" y="${Y2(5010) + 14}" text-anchor="end" style="fill:var(--buy-ink)">價值區 4990～5010</text>
          <line x1="30" x2="430" y1="${Y2(5010)}" y2="${Y2(5010)}" style="stroke:var(--buy-ink);stroke-dasharray:5 4"/>
          <polyline fill="none" style="stroke:var(--ink);stroke-width:2.2" points="${pts.join(" ")}"/>
          ${VOL[mode].slice(0, nb).map((v, j) => `<rect x="${30 + j * 26.6}" y="${236 - v * 0.5}" width="20" height="${v * 0.5}" rx="2" style="fill:var(--ink-3);opacity:.5"/>`).join("")}<text x="434" y="232" text-anchor="end" style="font-size:11px">成交量</text>`;
      }
      const lp = loop(auc, (dt) => { if (t < 100) { t += dt / 30; da(); } });
      function pickA(m) { mode = m; t = RM ? 100 : 0; lp.play(); da(); root.querySelectorAll("#o7-tabs .tab").forEach((x) => x.setAttribute("aria-selected", String(x.dataset.k === m)));
        $(root, "#o7-auc-t").innerHTML = m === "ok" ? "<b>成功的拍賣</b>：價格離開價值區時<b>伴隨大量</b>，市場接受新價格。之後回測價值區邊緣，通常會彈開、續行。" : "<b>失敗的拍賣</b>：價格衝出去，但<b>沒有量、沒有力道</b>。市場不接受，價格回到原區間。這也是 CRT／Failed Auction 的核心概念。"; }
      $(root, "#o7-tabs").addEventListener("click", (e) => { const b = e.target.closest(".tab"); if (b) pickA(b.dataset.k); });
      pickA("ok");
    }
  });

  /* ---------- 8. risk ---------- */
  const CONTRACTS = [["MES（每點 5 美元）", 5], ["ES（每點 50 美元）", 50], ["MNQ（每點 2 美元）", 2], ["NQ（每點 20 美元）", 20]];
  PAGES["of-8"] = lesson(C, "of-8", {
    lede: "很多新手研究了一堆訊號，卻因為倉位太大、不設停損而爆倉。這關用模擬器讓你親眼看到：勝率、風報比、成本，怎麼一起決定你最後賺不賺錢。",
    pre: "o8-",
    body: `<div class="scene"><div class="scene-h"><h3>期望值模擬器：同一套規則，交易 100 次</h3><p class="small">每條線是一個「平行世界」的你，用完全一樣的規則各交易 100 筆。單位是 R（1R＝每筆的風險金額）。</p></div>
<div class="scene-grid"><svg id="o8-mc" viewBox="0 0 460 260" role="img" aria-label="20 條模擬資金曲線"></svg><div class="side" id="o8-side"></div></div>
<div class="controls" style="margin-top:10px">
<div class="ctl"><label for="o8-w">勝率 <b id="o8-w-v"></b></label><input id="o8-w" type="range" min="20" max="80" value="40"></div>
<div class="ctl"><label for="o8-rr">風報比（賺幾 R） <b id="o8-rr-v"></b></label><input id="o8-rr" type="range" min="0.5" max="4" step="0.25" value="2"></div>
<div class="ctl"><label for="o8-c">每筆成本（手續費＋滑價） <b id="o8-c-v"></b></label><input id="o8-c" type="range" min="0" max="0.3" step="0.05" value="0"></div></div>
<div class="btn-row"><button class="btn" id="o8-again" type="button">再跑一次</button><button class="btn" id="o8-a" type="button">例子 A（40%、2R）</button><button class="btn" id="o8-b" type="button">例子 B（60%、0.5R）</button></div></div>

<div class="scene"><div class="scene-h"><h3>倉位計算：先停損，再算口數</h3><p class="small">預設例子：帳戶 10,000、單筆風險 1%、MES、停損 1.75 點。</p></div>
<div class="controls">
<div class="ctl"><label for="o8-acct">帳戶（美元）</label><input id="o8-acct" type="number" value="10000" min="500" step="500"></div>
<div class="ctl"><label for="o8-rp">單筆風險 <b id="o8-rp-v"></b></label><input id="o8-rp" type="range" min="0.25" max="3" step="0.25" value="1"></div>
<div class="ctl"><label for="o8-sl">停損距離 <b id="o8-sl-v"></b></label><input id="o8-sl" type="range" min="0.25" max="10" step="0.25" value="1.75"></div>
<div class="ctl"><label for="o8-k">商品</label><select id="o8-k">${CONTRACTS.map((c, i) => `<option value="${i}">${c[0]}</option>`).join("")}</select></div></div>
<div class="kpis" id="o8-size"></div></div>
<div class="prose"><p>筆記裡的風險上限範例：單筆 1%、單日 3%、單週 9%，連虧 3 筆就當天停止。數字要依自己的資金決定，初學者可以更保守（例如單筆 0.5%）。</p></div>`,
    quiz: [
      { q: "勝率 60%，但每次贏只賺 0.5R、輸賠 1R。期望值是？", o: [["+0.1R", false, "0.6 × 0.5 − 0.4 × 1 ＝ 0.3 − 0.4。"], ["−0.1R，勝率高也會虧", true, "這就是例子 B。勝率不是重點，期望值才是。"], ["+0.3R", false, "忘了扣掉輸的那 40%。"]] },
      { q: "帳戶 10,000、單筆 1%（100 美元），用 ES（每點 50），停損 4 點。可以下幾口？", o: [["2 口", false, "每口風險 4 × 50 ＝ 200 美元，已經超過 100。"], ["0 口：一口就超過上限，改用 MES（可下 5 口）或放棄", true, "MES 每口風險 4 × 5 ＝ 20，100 ÷ 20 ＝ 5 口。"], ["把停損縮到 2 點就能下 1 口", false, "停損要放在想法錯了的地方，不能為了口數去改。"]] }],
    remember: "<b>先決定錯在哪，再算下幾口。</b>勝率高不代表賺錢，期望值扣掉成本還是正的才有意義。",
    mount(root) {
      let seed = 11;
      function mc() {
        const w = +$(root, "#o8-w").value / 100, rr = +$(root, "#o8-rr").value, c = +$(root, "#o8-c").value;
        $(root, "#o8-w-v").textContent = Math.round(w * 100) + "%"; $(root, "#o8-rr-v").textContent = "1 : " + nf(rr, 2); $(root, "#o8-c-v").textContent = nf(c, 2) + "R";
        const r = rng(seed), paths = Array.from({ length: 20 }, () => { let eq = 0; return [0].concat(Array.from({ length: 100 }, () => (eq += (r() < w ? rr : -1) - c))); });
        const all = paths.flat(), lo = Math.min(-5, ...all), hi = Math.max(5, ...all), X = (i) => 46 + i * 4.05, Y = (v) => 14 + ((hi - v) / (hi - lo)) * 222;
        const ex = w * rr - (1 - w) - c, be = (1 + c) / (1 + rr), fin = paths.map((p) => p[100]).sort((a, b) => a - b), neg = fin.filter((v) => v < 0).length;
        const ticks = [lo, 0, hi].map((v) => Math.round(v));
        $(root, "#o8-mc").innerHTML = `${ticks.map((v) => `<line x1="46" x2="452" y1="${Y(v)}" y2="${Y(v)}" style="stroke:${v === 0 ? "var(--ink-3)" : "var(--line)"}"/><text x="40" y="${Y(v) + 4}" text-anchor="end">${v > 0 ? "+" : ""}${v}R</text>`).join("")}
          ${paths.map((p) => `<polyline fill="none" style="stroke:${p[100] >= 0 ? "var(--gamma)" : "var(--sell)"};stroke-width:1.3;opacity:.55" points="${p.map((v, i) => `${X(i).toFixed(1)},${Y(v).toFixed(1)}`).join(" ")}"/>`).join("")}
          <line x1="46" x2="${X(100)}" y1="${Y(0)}" y2="${Y(ex * 100)}" style="stroke:var(--ink);stroke-width:2;stroke-dasharray:6 4"/><text x="452" y="254" text-anchor="end">第 100 筆</text>`;
        $(root, "#o8-side").innerHTML = `<div class="kpi"><div class="k-l">期望值（每筆）</div><div class="k-v" style="color:${ex >= 0 ? "var(--gamma-ink)" : "var(--sell-ink)"}">${sgn(ex, 2)}R</div><div class="k-n">${nf(w, 2)} × ${nf(rr, 2)} − ${nf(1 - w, 2)} × 1${c ? ` − ${nf(c, 2)}` : ""}</div></div>
          <div class="kpi" style="margin-top:6px"><div class="k-l">損益兩平勝率</div><div class="k-v">${Math.round(be * 100)}%</div><div class="k-n">${c ? "(1 + 成本)" : "1"} ÷ (1 + 風報比)</div></div>
          <div class="kpi" style="margin-top:6px"><div class="k-l">20 個平行世界裡，100 筆後虧錢的</div><div class="k-v">${neg} 個</div><div class="k-n">中位數 ${sgn(fin[10], 1)}R</div></div>
          <p class="small" style="margin:8px 0 0">黑色虛線＝期望值的直線。${ex > 0 && neg > 0 ? `期望值是正的，仍有 ${neg} 個世界在 100 筆後虧錢：短期結果很可能只是運氣。` : ex > 0 ? "這次 20 個世界都賺錢，但每條線的路徑差很多，中間的連續虧損一樣會發生。按「再跑一次」看看。" : "期望值是負的：交易越多次，虧得越確定。"}這就是為什麼至少要 100 筆才能下結論。</p>`;
      }
      ["#o8-w", "#o8-rr", "#o8-c"].forEach((k) => $(root, k).addEventListener("input", mc));
      $(root, "#o8-again").addEventListener("click", () => { seed += 7; mc(); });
      const set = (w, rr) => { $(root, "#o8-w").value = w; $(root, "#o8-rr").value = rr; mc(); };
      $(root, "#o8-a").addEventListener("click", () => set(40, 2)); $(root, "#o8-b").addEventListener("click", () => set(60, 0.5));
      mc();
      function size() {
        const acct = Math.max(0, +$(root, "#o8-acct").value || 0), rp = +$(root, "#o8-rp").value, sl = +$(root, "#o8-sl").value, [nm, pv] = CONTRACTS[+$(root, "#o8-k").value];
        $(root, "#o8-rp-v").textContent = rp + "%"; $(root, "#o8-sl-v").textContent = nf(sl, 2) + " 點";
        const budget = (acct * rp) / 100, per = sl * pv, n = Math.floor(budget / per);
        $(root, "#o8-size").innerHTML = `<div class="kpi"><div class="k-l">這筆最多虧</div><div class="k-v">$${nf(budget, 2)}</div></div><div class="kpi"><div class="k-l">每口風險</div><div class="k-v">$${nf(per, 2)}</div><div class="k-n">${nf(sl, 2)} 點 × $${pv}</div></div>
          <div class="kpi"><div class="k-l">可以下</div><div class="k-v" style="color:${n ? "var(--ink)" : "var(--sell-ink)"}">${n} 口</div><div class="k-n">${n ? `實際風險 $${nf(n * per, 2)}` : "一口就超過上限：換小台或放棄"}</div></div>`;
      }
      ["#o8-acct", "#o8-rp", "#o8-sl", "#o8-k"].forEach((k) => $(root, k).addEventListener("input", size)); size();
    }
  });

  /* ---------- 9. full trade replay ---------- */
  const PRE = [5004, 5005, 5003.5, 5002, 5002.75, 5000.5, 4999, 4997.5, 4996, 4994.5, 4993, 4992.25, 4991];
  const OUT = { A: [4990.5, 4989.5, 4990.75, 4991.75, 4992.5, 4993.0], B: [4990.5, 4989.5, 4988.75, 4988.0, 4987.5, 4986.5], C: [4991.75, 4992.5, 4993.5, 4994.25, 4995.5, 4996.0] };
  const STEP9 = [
    { h: "步驟 1　盤前標位置", t: "查昨天的 Volume Profile：POC 5000、VAH 5010、VAL 4990。畫出這三條線。這時還沒有任何交易，只是在做功課。" },
    { h: "步驟 2　判斷脈絡", t: "今天開在 5004，在昨日價值區（4990～5010）內 → 平衡狀態。策略：在價值區邊緣找反向機會，目標 POC，不追突破。" },
    { h: "步驟 3　等價格來到位置", t: "開盤後賣壓出現，價格往下走，接近 4990（昨日 VAL）。<b>這時才開始看 Footprint。</b>" },
    { h: "步驟 4　看 Footprint", t: "第 1 根：下探 4989.25，Delta −110，下影線裡很多賣單成交但沒破低。第 2 根：低點 4988.00、收 4991.00 陽線；4989.00 兩邊 190 × 210（吸收）；Delta 轉 +85；4988.50～4989.25 連續 3 檔買方失衡。<b>位置＋4 個確認，等第 2 根收盤。</b>" },
    { h: "步驟 5　計畫進場", t: "回測堆疊失衡上緣 +1 tick，掛限價買 4989.50。停損：訊號 K 棒低點外 1 tick ＝ 4987.75（風險 1.75 點）。TP1 4993.00（RR 2）、TP2 POC 5000（RR 6）。MES、風險 100 美元 → 11 口，總風險 96.25 美元＝1R。" }];
  PAGES["of-9"] = lesson(C, "of-9", {
    lede: "把前八關串起來，重播這裡那筆虛構的 MES 交易。最後有三種結果，三種都是「對的」：重點不是賺賠，而是每一步都照計畫走。",
    pre: "o9-",
    body: `<div class="scene"><div class="scene-h"><h3>一筆交易，五個步驟</h3><p class="small">MES，1 點＝5 美元。帳戶 10,000，單筆風險 1%。</p></div>
<div class="scene-grid"><svg id="o9-svg" viewBox="0 0 470 330" role="img" aria-label="交易重播圖"></svg><div class="side" id="o9-side"></div></div>
<div class="btn-row"><button class="btn" id="o9-prev" type="button">上一步</button><button class="btn primary" id="o9-next" type="button">下一步</button><span class="small" id="o9-n"></span></div>
<div class="tabs" id="o9-out" style="margin-top:8px;display:none"><button class="tab" data-k="A" aria-selected="true" type="button">結果 A：成功</button><button class="tab" data-k="B" aria-selected="false" type="button">結果 B：停損</button><button class="tab" data-k="C" aria-selected="false" type="button">結果 C：沒進場</button></div></div>`,
    quiz: [
      { q: "價格回測時沒碰到 4989.50 就直接往上走，限價單沒成交。正確做法是？", o: [["追價買進，不要錯過", false, "原則：「只做第一次觸碰，位置用完就放棄。」"], ["不追。錯過就錯過，等下一個位置", true, "沒成交也是計畫裡的一種結果。"], ["把限價單往上移到現價", false, "這等於臨時改計畫去追價。"]] },
      { q: "（筆記的練習題）把進場改成 4990.00，停損不變 4987.75。用 MES、風險 100 美元，最多幾口？", o: [["11 口", false, "風險變成 2.25 點，每口 11.25 美元。"], ["8 口", true, "2.25 × 5 ＝ 11.25；100 ÷ 11.25 ≈ 8.9 → 無條件捨去 8 口。"], ["9 口", false, "要無條件捨去，9 口的風險 101.25 美元會超過上限。"]] }],
    remember: "<b>位置 → 脈絡 → 等待 → 確認 → 先算風險。</b>成功、停損、沒進場，三種結果都在計畫裡。",
    mount(root) {
      const svg = $(root, "#o9-svg"); let st = 0, out = "A", t = 0;
      const Y = (p) => 14 + (5006 - p) * 14.4, X = (i) => 40 + i * 19;
      function draw() {
        const showPre = st >= 2 ? PRE.length : st >= 1 ? 1 : 0;
        const c1 = { o: 4991, h: 4991.5, l: 4989.25, c: 4990 }, c2 = { o: 4990, h: 4991.25, l: 4988.0, c: 4991.0 };
        const o = OUT[out], shown = st >= 5 ? Math.min(o.length, Math.floor(t)) : 0;
        const line = (p, c, lab, dash, left) => `<line x1="34" x2="466" y1="${Y(p)}" y2="${Y(p)}" style="stroke:${c};${dash ? "stroke-dasharray:5 4" : "stroke-width:2"}"/><text x="${left ? 40 : 464}" y="${Y(p) + (left ? 14 : -4)}" text-anchor="${left ? "start" : "end"}" style="fill:${c};font-weight:${left ? 600 : 400}">${lab}</text>`;
        svg.innerHTML = `${[5005, 5000, 4995, 4990, 4985].map((p) => `<text x="30" y="${Y(p) + 4}" text-anchor="end">${p}</text>`).join("")}
          ${line(5000, "var(--buy-ink)", "昨日 POC 5000", true)}${line(4990, "var(--buy-ink)", "昨日 VAL 4990", true)}<text x="464" y="12" text-anchor="end" style="fill:var(--buy-ink)">↑ 昨日 VAH 5010</text>
          ${st >= 1 ? `<rect x="34" width="432" y="${Y(5006)}" height="${Y(4990) - Y(5006)}" style="fill:var(--buy);opacity:.05"/>` : ""}
          ${showPre ? `<polyline fill="none" style="stroke:var(--ink-3);stroke-width:2" points="${PRE.slice(0, showPre).map((p, i) => `${X(i)},${Y(p)}`).join(" ")}"/>` : ""}
          ${st >= 3 ? candle(X(13) - 7, 14, c1.o, c1.h, c1.l, c1.c, Y) + candle(X(14) - 7, 14, c2.o, c2.h, c2.l, c2.c, Y) + `<text x="${X(14) + 14}" y="${Y(4985.6)}" style="fill:var(--ink)">↖ 吸收＋Delta 轉正</text>` : ""}
          ${st >= 4 ? `<rect x="${X(14) - 9}" width="18" y="${Y(4989.25)}" height="${Y(4988.5) - Y(4989.25)}" style="fill:none;stroke:var(--buy);stroke-width:2"/>` + line(4989.5, "var(--buy)", "限價買 4989.50", false, true) + line(4987.75, "var(--sell)", "停損 4987.75", false, true) + line(4993, "var(--gamma)", "TP1 4993（2R）", false, true) : ""}
          ${shown ? `<polyline fill="none" style="stroke:var(--ink);stroke-width:2.2" points="${[`${X(14)},${Y(4991)}`].concat(o.slice(0, shown).map((p, i) => `${X(15 + i)},${Y(p)}`)).join(" ")}"/>` : ""}`;
        const S = st < 5 ? STEP9[st] : { h: "結果", t: { A: "價格回測到 4989.50，限價單成交，之後漲到 TP1 4993 全部出場：3.5 點 × 5 × 11 口 ＝ <b>+192.50 美元（+2R）</b>，扣手續費前。", B: "回測成交後沒有反彈，跌破 4987.75 觸發停損：1.75 × 5 × 11 ＝ <b>−96.25 美元（−1R）</b>。這是預先接受的虧損：不慌張、不加碼、不報復性再進場，日誌記下「假跌破判斷錯誤」。", C: "價格沒碰到 4989.50 就直接往上走，限價單沒成交。<b>正確做法：不追。</b>位置用完就放棄，錯過了沒關係。" }[out] };
        $(root, "#o9-side").innerHTML = `<h4>${S.h}</h4><p style="margin:0 0 8px">${S.t}</p>${st >= 4 ? `<ul class="checklist small"><li>✓ RR ≥ 1:2</li><li>✓ 單筆風險 ≤ 1%</li><li>✓ 今天還沒虧過</li><li>✓ 不是新聞時段</li></ul>` : ""}${st >= 5 ? `<p class="small" style="margin:8px 0 0">假設長期是「40% 賺 2R、60% 賠 1R」，期望值 ＝ +0.2R／筆。前提是真的能維持，而且成本不吃掉。這要用 Replay 驗證。</p>` : ""}`;
        $(root, "#o9-n").textContent = st < 5 ? `第 ${st + 1} / 5 步` : "看結果";
        $(root, "#o9-out").style.display = st >= 5 ? "flex" : "none";
      }
      const lp = loop(svg, (dt) => { if (st >= 5 && t < 6) { t += dt / 450; draw(); } });
      $(root, "#o9-next").addEventListener("click", () => { st = Math.min(5, st + 1); t = RM ? 6 : 0; draw(); });
      $(root, "#o9-prev").addEventListener("click", () => { st = Math.max(0, st - 1); draw(); });
      $(root, "#o9-out").addEventListener("click", (e) => { const b = e.target.closest(".tab"); if (!b) return; out = b.dataset.k; t = RM ? 6 : 0; root.querySelectorAll("#o9-out .tab").forEach((x) => x.setAttribute("aria-selected", String(x === b))); draw(); });
      draw(); void lp;
    }
  });
})();
