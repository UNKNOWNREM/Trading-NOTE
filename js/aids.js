/* 學習工具：起點測驗、錯題本（間隔複習）、全站名詞表＋術語提示、工具箱、NinjaTrader 對照、每日紀錄表 */
(function () {
  const PAGES = (window.__PAGES = window.__PAGES || {});
  const BANK = () => window.__QBANK || {};
  const $ = (s, r = document) => r.querySelector(s);
  const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
  const strip = (h) => String(h).replace(/<[^>]+>/g, "");
  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } }
  };
  const DAY = 86400000, GAP = [1, 3, 7, 14];
  const tomorrow = () => { const d = new Date(); d.setHours(0, 0, 0, 0); return d.getTime() + DAY; };
  const title = (id) => (BANK()[id] && BANK()[id].title) || id;
  const head = (t, lede) => ({ title: t, lede, chips: [["learn", "學習工具"]] });

  /* ---------- 卡關導引：每一關的前置關卡 ---------- */
  const PRE = {
    "of-1": ["of-fut"], "of-2": ["of-1"], "of-3": ["of-2"], "of-cvd": ["of-3"], "of-4": ["of-2"], "of-6": ["of-2"], "of-vwap": ["of-6"], "of-7": ["of-6"],
    "of-sess": ["of-6"], "of-event": ["of-sess"], "of-5": ["of-3", "of-4"], "of-8": ["of-fut"], "of-9": ["of-5", "of-8"], "of-psy": ["of-8"],
    "op-2": ["op-1"], "op-3": ["op-2"], "op-4": ["op-3"], "op-skew": ["op-4"], "op-5": ["op-3"], "op-6": ["op-5"], "op-7": ["op-6"], "op-vc": ["op-3", "op-4"],
    "op-8": ["op-6"], "op-real": ["op-8"], "op-dex": ["op-6"],
    "learn-1": ["of-9"], "learn-2": ["op-6", "op-dex"], "learn-3": ["of-6", "of-vwap"], "learn-4": ["of-5", "of-4"], "learn-5": ["of-5", "of-6"], "learn-6": ["of-8"], "learn-7": ["learn-2"]
  };

  /* ---------- 錯題本 ---------- */
  const RK = "of-review-v1", tries = {};
  const rv = () => store.get(RK, { items: {} });
  function answer(id, k, ok, fb) {
    const key = id + "|" + k, db = rv();
    if (!ok) {
      tries[key] = (tries[key] || 0) + 1;
      const it = db.items[key] || { id, k, wrong: 0 };
      it.wrong += 1; it.box = 0; it.due = tomorrow(); it.last = Date.now();
      db.items[key] = it; store.set(RK, db);
      if (fb && !fb.querySelector(".aid-note")) fb.insertAdjacentHTML("beforeend", `<span class="aid-note small">（已放進<a href="#review">錯題本</a>，明天會再考你一次）</span>`);
      if (fb && tries[key] >= 2 && PRE[id] && !fb.querySelector(".aid-pre")) fb.insertAdjacentHTML("beforeend", `<p class="aid-pre small">這題錯兩次了，可能是前面的觀念還不穩。建議先回去看：${PRE[id].map((p) => `<a href="#${p}">${esc(title(p))}</a>`).join("、")}，再回來。</p>`);
    }
  }
  function qOf(id, k) {
    const B = BANK()[id]; if (!B) return null;
    if (k[0] === "q") { const x = B.qs[+k.slice(1)]; return x ? { fig: x.fig || "", t: x.q, o: x.o, step: x.step } : null; }
    const x = B.steps[+k.slice(1)]; return x ? { fig: `<p class="small q-cap">${x.cap}</p>`, t: x.t, o: x.o, step: +k.slice(1) + 1 } : null;
  }
  PAGES["review"] = Object.assign(head("錯題本", "在課程裡答錯的題目會自動放進來，隔 1、3、7、14 天各再考一次；連續答對四次就算真的會了。"), {
    html: `<div class="prose"><p class="small">紀錄存在這台裝置的瀏覽器裡。換電腦或清除瀏覽資料會不見。</p></div><div class="rv-sum kpi-row"></div><div class="btn-row"><button class="btn rv-all" type="button">今天沒有到期的也想練</button><button class="btn rv-clear" type="button">清空錯題本</button></div><div class="rv-list"></div>`,
    mount(root) {
      let showAll = false;
      function paint() {
        const db = rv(), all = Object.entries(db.items), now = Date.now();
        const due = all.filter(([, it]) => it.box < 4 && it.due <= now), wait = all.filter(([, it]) => it.box < 4 && it.due > now), done = all.filter(([, it]) => it.box >= 4);
        $(".rv-sum", root).innerHTML = `<div><span class="t1">今天要複習</span><b>${due.length}</b></div><div><span class="t1">之後再考</span><b>${wait.length}</b></div><div><span class="t1">已經會了</span><b>${done.length}</b></div>`;
        const list = showAll ? due.concat(wait) : due;
        if (!all.length) { $(".rv-list", root).innerHTML = `<p>還沒有錯題。去上課吧，答錯的題目會自動出現在這裡。</p>`; return; }
        if (!list.length) { $(".rv-list", root).innerHTML = `<p>今天的複習做完了。${wait.length ? `下一題要等到 ${new Date(Math.min(...wait.map(([, it]) => it.due))).toLocaleDateString()}。` : ""}</p>`; return; }
        $(".rv-list", root).innerHTML = list.map(([key, it]) => {
          const q = qOf(it.id, it.k); if (!q) return "";
          return `<div class="quiz rv-q" data-key="${esc(key)}"><p class="small aid-src">來自〈<a href="#${it.id}">${esc(title(it.id))}</a>〉　答錯 ${it.wrong} 次　複習進度 ${it.box}/4</p>${q.fig}<p class="q-t">${q.t}</p><div class="q-opts">${q.o.map((y, j) => `<button class="q-opt" type="button" data-j="${j}">${y[0]}</button>`).join("")}</div><div class="q-fb"></div></div>`;
        }).join("");
      }
      root.addEventListener("click", (e) => {
        if (e.target.closest(".rv-all")) { showAll = !showAll; e.target.textContent = showAll ? "只看今天到期的" : "今天沒有到期的也想練"; paint(); return; }
        if (e.target.closest(".rv-clear")) { if (root.querySelector(".rv-clear").dataset.sure) { store.set(RK, { items: {} }); paint(); } else { root.querySelector(".rv-clear").dataset.sure = "1"; root.querySelector(".rv-clear").textContent = "再按一次確定清空"; } return; }
        const b = e.target.closest(".rv-q .q-opt"); if (!b) return;
        const box = b.closest(".rv-q"), key = box.dataset.key, db = rv(), it = db.items[key], q = qOf(it.id, it.k), y = q.o[+b.dataset.j];
        if (box.dataset.done) return;
        box.querySelectorAll(".q-opt").forEach((z) => z.classList.remove("ok", "bad")); b.classList.add(y[1] ? "ok" : "bad");
        if (y[1]) { it.box += 1; it.due = Date.now() + GAP[Math.min(it.box, 3)] * DAY - 3600000; box.dataset.done = "1"; }
        else { it.box = 0; it.wrong += 1; it.due = tomorrow(); }
        db.items[key] = it; store.set(RK, db);
        $(".q-fb", box).innerHTML = `<b class="${y[1] ? "ok" : "bad"}">${y[1] ? "答對了。" : "再想想。"}</b>${y[2]}${y[1] ? (it.box >= 4 ? " 這題已經會了，不會再出現。" : ` 下次複習：${GAP[Math.min(it.box, 3)]} 天後。`) : ` 不確定的話，回〈<a href="#${it.id}">${esc(title(it.id))}</a>〉看第 ${q.step} 步。`}`;
        const sum = root.querySelector(".rv-sum"); if (sum && y[1]) setTimeout(() => { const all = Object.values(rv().items), now = Date.now(); sum.querySelector("div b").textContent = all.filter((x) => x.box < 4 && x.due <= now).length; }, 0);
      });
      paint();
    }
  });

  /* ---------- 全站名詞表＋術語提示 ---------- */
  let TERMS = null;
  function terms() {
    if (TERMS) return TERMS;
    const map = new Map();
    Object.entries(BANK()).forEach(([id, B]) => (B.gloss || []).forEach(([t, d]) => {
      const k = strip(t).trim(); if (!map.has(k)) map.set(k, { t: k, d: strip(d), ids: [] });
      if (!map.get(k).ids.includes(id)) map.get(k).ids.push(id);
    }));
    const alias = new Map();
    map.forEach((v) => { v.t.split(/[（）()／/、]/).map((x) => x.trim()).filter((x) => x.length >= 2).forEach((a) => { if (!alias.has(a)) alias.set(a, v); }); alias.set(v.t, v); });
    TERMS = { list: [...map.values()].sort((a, b) => a.t.localeCompare(b.t, "zh-Hant")), alias };
    return TERMS;
  }
  PAGES["gloss-all"] = Object.assign(head("全站名詞表", "所有課程名詞卡集中在這裡，可以搜尋；每個名詞都連回教它的那一關。課程動畫裡的粗體術語，滑過去或點一下也會顯示解釋。"), {
    html: `<div class="dx-form"><label>搜尋名詞<input class="gl-q" type="search" placeholder="例如 Delta、牆、價值區"></label></div><p class="small gl-n"></p><div class="gl-list"></div>`,
    mount(root) {
      const T = terms().list;
      function paint() {
        const q = $(".gl-q", root).value.trim().toLowerCase();
        const hit = T.filter((x) => !q || (x.t + " " + x.d).toLowerCase().includes(q));
        $(".gl-n", root).textContent = `共 ${T.length} 個名詞，符合 ${hit.length} 個。`;
        $(".gl-list", root).innerHTML = `<div class="gloss">${hit.map((x) => `<details><summary>${esc(x.t)}</summary><p>${esc(x.d)}</p><p class="small">出現在：${x.ids.map((id) => `<a href="#${id}">${esc(title(id))}</a>`).join("、")}</p></details>`).join("")}</div>`;
      }
      $(".gl-q", root).addEventListener("input", paint); paint();
    }
  });
  // 動畫字幕裡的粗體術語加上提示
  function decorate(rootEl) {
    const A = terms().alias;
    rootEl.querySelectorAll(".sp-cap b:not(.term-x)").forEach((b) => {
      const txt = b.textContent.trim(); b.classList.add("term-x");
      let v = A.get(txt);
      if (!v) txt.split(/[（）()：:、，＝=＋+]/).map((x) => x.trim()).some((x) => (v = A.get(x)));
      if (!v) { let best = ""; A.forEach((val, key) => { if (key.length > best.length && key.length >= 2 && !/^[\d\s.,+−-]+$/.test(key) && txt.includes(key)) best = key; }); if (best) v = A.get(best); }
      if (v) { b.classList.add("term"); b.setAttribute("data-term", v.d); b.setAttribute("tabindex", "0"); }
    });
  }
  const mo = new MutationObserver(() => { const v = document.getElementById("view"); if (v) decorate(v); });
  const v0 = document.getElementById("view");
  if (v0) mo.observe(v0, { childList: true, subtree: true }); else document.addEventListener("DOMContentLoaded", () => { const v = document.getElementById("view"); if (v) mo.observe(v, { childList: true, subtree: true }); });
  document.addEventListener("mouseover", (e) => { const t = e.target.closest(".term"); if (t && window.OF) window.OF.showTip(esc(t.getAttribute("data-term")), e); });
  document.addEventListener("mouseout", (e) => { if (e.target.closest(".term") && window.OF) window.OF.hideTip(); });
  document.addEventListener("click", (e) => { const t = e.target.closest(".term"); if (t && window.OF) { const r = t.getBoundingClientRect(); window.OF.showTip(esc(t.getAttribute("data-term")), { clientX: r.left, clientY: r.bottom }); setTimeout(window.OF.hideTip, 3000); } });

  /* ---------- 工具箱 ---------- */
  const PV = { MNQ: 2, NQ: 20, MES: 5, ES: 50, MGC: 10, GC: 100 };
  function etParts(ms) {
    const f = new Intl.DateTimeFormat("en-US", { timeZone: "America/New_York", hourCycle: "h23", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" });
    const p = Object.fromEntries(f.formatToParts(new Date(ms)).map((x) => [x.type, x.value]));
    return p;
  }
  function etToUtc(dateStr, hh, mm) { // 美東某日某時 → UTC 毫秒（自動處理夏令）
    const [y, m, d] = dateStr.split("-").map(Number);
    let g = Date.UTC(y, m - 1, d, hh + 5, mm);
    for (let i = 0; i < 2; i++) { const p = etParts(g); const shown = Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour, +p.minute); g += Date.UTC(y, m - 1, d, hh, mm) - shown; }
    return g;
  }
  const tw = (ms) => new Intl.DateTimeFormat("zh-TW", { timeZone: "Asia/Taipei", month: "numeric", day: "numeric", weekday: "short", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).format(new Date(ms));
  PAGES["tools"] = Object.assign(head("工具箱", "各關用到的計算機集中在這一頁，盤前盤中直接用。"), {
    html: `
<div class="prose"><h2>口數計算</h2><p class="small">路線 1 第 13 關、路線 3 第 6 關。</p></div>
<div class="scene tb-qty"><div class="dx-form"><label>每筆風險（美元）<input data-k="rk" type="number" value="250" step="10"></label><label>停損（點）<input data-k="st" type="number" value="26" step="1"></label><label>商品<select data-k="ins">${Object.keys(PV).map((k) => `<option value="${k}">${k}（每點 $${PV[k]}）</option>`).join("")}</select></label><label class="dx-chk"><input data-k="half" type="checkbox"> 混合日／事件日（減半）</label></div><div class="out kpi-row"></div></div>
<div class="prose"><h2>R 值</h2><p class="small">路線 3 第 7 關。R＝賺賠點數 ÷ 停損點數。</p></div>
<div class="scene tb-r"><div class="dx-form"><label>方向<select data-k="dir"><option value="1">做多</option><option value="-1" selected>做空</option></select></label><label>進場<input data-k="e" type="number" value="27164" step="0.25"></label><label>停損<input data-k="s" type="number" value="27190" step="0.25"></label><label>出場<input data-k="x" type="number" value="27112" step="0.25"></label></div><div class="out kpi-row"></div></div>
<div class="prose"><h2>QQQ 位階換算成 NQ</h2><p class="small">路線 2 第 11、12 關。比例＝同一根 K 線的 NQ 價格 ÷ QQQ 價格。</p></div>
<div class="scene tb-cv"><div class="dx-form"><label>NQ 價格<input data-k="nq" type="number" value="26588.25" step="0.25"></label><label>QQQ 價格<input data-k="qqq" type="number" value="645.09" step="0.01"></label><label>QQQ 位階（用逗號分開）<input data-k="lv" type="text" value="640, 645, 650, 660, 665"></label></div><div class="out"></div></div>
<div class="prose"><h2>預期波動範圍</h2><p class="small">路線 2 第 4 關。1 倍標準差 ≈ 價格 × IV × √(天數 ÷ 365)，大約 68% 的機率落在這個範圍內（假設常態分布）。</p></div>
<div class="scene tb-em"><div class="dx-form"><label>價格<input data-k="p" type="number" value="27000" step="5"></label><label>IV（%）<input data-k="iv" type="number" value="20" step="0.5"></label><label>天數<input data-k="d" type="number" value="1" step="1" min="0.1"></label></div><div class="out kpi-row"></div></div>
<div class="prose"><h2>美東時間 ↔ 台灣時間</h2><p class="small">自動處理夏令時間。數據公布時間通常寫美東時間。</p></div>
<div class="scene tb-tz"><div class="dx-form"><label>美東日期<input data-k="dt" type="date"></label><label>美東時間<input data-k="tm" type="time" value="09:30"></label></div><div class="out"></div></div>`,
    mount(root) {
      const val = (box, k) => { const el = box.querySelector(`[data-k="${k}"]`); return el.type === "checkbox" ? el.checked : el.type === "number" ? +el.value : el.value; };
      const fx = (v, d = 0) => (+v).toLocaleString(undefined, { minimumFractionDigits: d, maximumFractionDigits: d });
      const calc = {
        "tb-qty"(b) { const n0 = Math.floor(val(b, "rk") / (Math.max(0.25, val(b, "st")) * PV[val(b, "ins")])), n = val(b, "half") ? Math.floor(n0 / 2) : n0;
          return `<div><span class="t1">可以下</span><b>${n} 口</b></div><div><span class="t1">實際最大虧損</span><b>$${fx(n * val(b, "st") * PV[val(b, "ins")])}</b></div>${n === 0 ? `<div><span class="t1">提醒</span><b>停損太寬或商品太大，換微型合約</b></div>` : ""}`; },
        "tb-r"(b) { const d = +val(b, "dir"), risk = (val(b, "e") - val(b, "s")) * d, pnl = (val(b, "x") - val(b, "e")) * d;
          if (risk >= 0) return `<div><span class="t1">檢查</span><b>停損方向不對：做${d > 0 ? "多停損要在進場下方" : "空停損要在進場上方"}</b></div>`;
          return `<div><span class="t1">風險</span><b>${fx(-risk, 2)} 點</b></div><div><span class="t1">賺賠</span><b>${pnl >= 0 ? "+" : ""}${fx(pnl, 2)} 點</b></div><div><span class="t1">R</span><b>${pnl >= 0 ? "+" : ""}${(pnl / -risk).toFixed(2)}R</b></div>`; },
        "tb-cv"(b) { const r = val(b, "nq") / val(b, "qqq"); const lv = String(val(b, "lv")).split(/[,，\s]+/).map(Number).filter((x) => x > 0);
          return `<p>比例 <b>${isFinite(r) ? r.toFixed(4) : "—"}</b></p><table class="tbl"><thead><tr><th>QQQ</th><th>NQ</th></tr></thead><tbody>${lv.map((x) => `<tr><td>${x}</td><td><b>${fx(x * r)}</b></td></tr>`).join("")}</tbody></table><p class="small">比例每天都會變，換約時會重設；換算後的價位當成 ±十幾點的區域。</p>`; },
        "tb-em"(b) { const s = val(b, "p") * val(b, "iv") / 100 * Math.sqrt(Math.max(0.1, val(b, "d")) / 365);
          return `<div><span class="t1">1 倍標準差</span><b>±${fx(s)} 點</b></div><div><span class="t1">範圍</span><b>${fx(val(b, "p") - s)}～${fx(val(b, "p") + s)}</b></div><div><span class="t1">2 倍標準差</span><b>±${fx(2 * s)} 點</b></div>`; },
        "tb-tz"(b) { const dt = val(b, "dt"), tm = String(val(b, "tm") || "09:30").split(":").map(Number); if (!dt) return "";
          const u = etToUtc(dt, tm[0], tm[1]), p = etParts(u), off = (Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour, +p.minute) - u) / 3600000;
          return `<p>美東 ${dt} ${String(tm[0]).padStart(2, "0")}:${String(tm[1]).padStart(2, "0")}（${off === -4 ? "夏令" : "冬令"}）＝ 台灣 <b>${tw(u)}</b></p><p class="small">現在：台灣 ${tw(Date.now())}，美東 ${etParts(Date.now()).hour}:${etParts(Date.now()).minute}。</p>`; }
      };
      const p = etParts(Date.now()); root.querySelector('.tb-tz [data-k="dt"]').value = `${p.year}-${p.month}-${p.day}`;
      Object.keys(calc).forEach((c) => { const b = root.querySelector("." + c); const run = () => { b.querySelector(".out").innerHTML = calc[c](b); }; b.addEventListener("input", run); b.addEventListener("change", run); run(); });
    }
  });

  /* ---------- NinjaTrader 對照 ---------- */
  const NT = [
    ["Footprint（每個價位的主動買賣）", "Order Flow Volumetric Bars，BidAsk 模式", "3 分鐘；NQ 每格 4 tick（＝1 點），GC 每格 5 tick", "of-2"],
    ["每根 K 線的 Delta", "Volumetric 的 Bar statistics：Delta (Bar)、Delta (%)", "已開啟，另有 Min delta、Max delta", "of-3"],
    ["CVD（累積 Delta）", "Order Flow Cumulative Delta 指標", "已加在圖上", "of-cvd"],
    ["失衡、堆疊失衡", "Volumetric 的 Imbalance 設定", "比例 3、Diagonal、最小 delta 10", "of-4"],
    ["K 線 POC（這根成交最多的價位）", "Volumetric 的 Show maximum", "已開啟，黃色標示", "learn-4"],
    ["Volume Profile、價值區（VAH／POC／VAL）", "Order Flow Volume Profile 指標", "建議固定用美股正規時段、價值區 70%", "of-6"],
    ["VWAP 與標準差帶", "Order Flow VWAP 指標", "Num deviations ＝ One", "of-vwap"],
    ["大單", "Order Flow Trade Detector", "NQ 最小量 50、GC 最小量 10", "of-5"],
    ["掛單簿深度、熱力圖", "需要 Level 2 市場數據", "只有 Level 1（Top of Book）時看不到，課程內容當觀念理解即可", "of-1"],
    ["前日高低、隔夜高低", "手動畫水平線最簡單", "每天盤前畫，和價值區一起合併成區域", "learn-3"],
    ["GEX 位階", "在 TradingView 用 GEX 位階指標（例如 GammaLens Futures GEX Map）", "NinjaTrader 上需要的話手動畫，記得畫淡一點", "learn-3"],
    ["經濟日曆", "TradingView 經濟日曆", "盤前讀環境時查", "of-event"]];
  PAGES["nt-map"] = Object.assign(head("NinjaTrader 對照", "把課程裡的概念對到 NinjaTrader 8 的功能，並附一組範例設定（3 分鐘 Volumetric 足跡圖）。"), {
    html: `<div class="prose"><h2>概念 ↔ 功能 ↔ 範例設定</h2></div><div class="table-wrap"><table class="tbl"><thead><tr><th>課程概念</th><th>NinjaTrader 用什麼</th><th>範例設定</th><th>哪一關教</th></tr></thead><tbody>${NT.map((r) => `<tr><td><b>${r[0]}</b></td><td>${r[1]}</td><td>${r[2]}</td><td><a href="#${r[3]}" class="nt-l" data-id="${r[3]}">${r[3]}</a></td></tr>`).join("")}</tbody></table></div>
<div class="prose"><h2>和課程畫面不一樣的地方</h2><ul>
<li><b>時間框：</b>課程範例多用 5 分 K，範例設定是 3 分 K。讀法一樣，只是每根 K 線的量和 Delta 會比較小。</li>
<li><b>每格大小：</b>課程的 footprint 為了好讀，NQ 用 5 點一格；範例設定是 1 點一格，格子多很多、每格數字比較小。剛開始學可以另存一個「每格 20 tick（＝5 點）」的模板，對照課程比較容易，熟了再換回來。</li>
<li><b>K 線 POC 的顏色：</b>課程用 ● 標示，範例設定用黃色框。</li>
<li><b>Delta 的位置：</b>課程把 Delta 寫在 K 線下方，NinjaTrader 放在 Bar statistics 表格裡。</li>
<li><b>沒有 Level 2：</b>路線 1 第 2 關的掛單簿動畫，只有 Level 1 時看不到深度，只能看最佳買賣價。</li></ul>
<p class="small">選單名稱可能因版本不同略有差異；以實際使用的 NinjaTrader 版本為準。</p></div>`,
    mount(root) { root.querySelectorAll(".nt-l").forEach((a) => { a.textContent = title(a.dataset.id); }); }
  });

  /* ---------- 起點測驗 ---------- */
  const SQ = [
    { id: "of-1", t: "「主動買」指的是什麼？", o: [["買方直接用賣方的掛價成交", true], ["買方掛單等別人來賣", false], ["成交量很大的買單", false]] },
    { id: "of-2", t: "Footprint 某一格「主動賣 300、主動買 80」，代表？", o: [["這個價位主動賣比主動買多很多", true], ["這個價位一共成交 220 口", false], ["價格一定會跌", false]] },
    { id: "of-3", t: "一根 K 線 Delta 是正的，卻收黑。最可能代表？", o: [["主動買被上方的限價賣單吸收了", true], ["買方很強，會繼續漲", false], ["Delta 算錯了", false]] },
    { id: "of-4", t: "連續三個價位都是「主動賣是主動買的 3 倍以上」，叫做？", o: [["堆疊失衡", true], ["吸收", false], ["價值區", false]] },
    { id: "of-6", t: "前一天的 POC 是什麼？", o: [["前一天成交量最大的價位", true], ["前一天的最高價", false], ["前一天的收盤價", false]] },
    { id: "of-8", t: "每筆最多虧 $200，停損 25 點，用 MNQ（每點 $2），可以下幾口？", o: [["4 口", true], ["8 口", false], ["1 口", false]] },
    { id: "op-1", t: "買進一口買權（Call），最大損失是？", o: [["付出的權利金", true], ["沒有上限", false], ["履約價", false]] },
    { id: "op-3", t: "Gamma 描述的是什麼？", o: [["價格變動時，Delta 變化多快", true], ["每天流失多少時間價值", false], ["隱含波動率的高低", false]] },
    { id: "op-6", t: "淨 GEX 很負、價格在 Flip 下方，通常代表？", o: [["市商的對沖容易放大波動", true], ["價格一定會跌", false], ["價格會被釘住不動", false]] },
    { id: "learn-5", t: "趨勢日，一根大黑 K 剛剛跌破價值區，你還沒進場，比較好的做法是？", o: [["等回測再找進場點", true], ["馬上追空", false], ["反手做多搶反彈", false]] }];
  const ORDER = ["of-fut", "of-1", "of-2", "of-3", "of-cvd", "of-4", "of-6", "of-vwap", "of-7", "of-sess", "of-event", "of-5", "of-8", "of-9", "of-psy", "op-1", "op-2", "op-3", "op-4", "op-skew", "op-5", "op-6", "op-7", "op-vc", "op-8", "op-real", "op-dex", "learn-1", "learn-2", "learn-3", "learn-4", "learn-5", "learn-6", "learn-7"];
  PAGES["start-quiz"] = Object.assign(head("起點測驗", "10 題快速檢查，看你該從哪一關開始。不會的就選最接近的，不用查資料。"), {
    html: `<div class="sq-list">${SQ.map((x, k) => `<div class="quiz sq" data-k="${k}"><p class="q-t"><span class="q-tag">第 ${k + 1} 題</span>${x.t}</p><div class="q-opts">${x.o.map((y, j) => `<button class="q-opt" type="button" data-j="${j}">${y[0]}</button>`).join("")}</div></div>`).join("")}</div><div class="btn-row"><button class="btn primary sq-go" type="button">看結果</button></div><div class="sq-out"></div>`,
    mount(root) {
      const pick = {};
      root.addEventListener("click", (e) => {
        const b = e.target.closest(".sq .q-opt");
        if (b) { const box = b.closest(".sq"); box.querySelectorAll(".q-opt").forEach((z) => z.classList.remove("sel")); b.classList.add("sel"); pick[box.dataset.k] = +b.dataset.j; return; }
        if (!e.target.closest(".sq-go")) return;
        const n = Object.keys(pick).length; if (n < SQ.length) { $(".sq-out", root).innerHTML = `<p>還有 ${SQ.length - n} 題沒選。</p>`; return; }
        const wrong = SQ.filter((x, k) => !x.o[pick[k]][1]);
        root.querySelectorAll(".sq").forEach((box) => { const x = SQ[+box.dataset.k]; box.querySelectorAll(".q-opt").forEach((z, j) => { if (x.o[j][1]) z.classList.add("ok"); else if (pick[box.dataset.k] === j) z.classList.add("bad"); }); });
        let start, msg;
        if (!wrong.length) { start = "learn-1"; msg = "全部答對。基礎都在，可以直接從路線 3 開始，遇到不熟的再回頭查。"; }
        else {
          const first = wrong.map((x) => x.id).sort((a, b) => ORDER.indexOf(a) - ORDER.indexOf(b))[0];
          start = first.startsWith("of") ? (ORDER.indexOf(first) <= ORDER.indexOf("of-2") ? "of-fut" : first) : first.startsWith("op") ? (first === "op-1" ? "op-1" : first) : first;
          msg = `答對 ${SQ.length - wrong.length} / ${SQ.length}。建議從〈${esc(title(start))}〉開始。`;
        }
        $(".sq-out", root).innerHTML = `<div class="remember"><b class="r-h">結果</b>${msg}</div><div class="btn-row"><a class="btn primary" href="#${start}">前往〈${esc(title(start))}〉</a></div>${wrong.length ? `<p class="small">答錯的題目對應的關卡：${wrong.map((x) => `<a href="#${x.id}">${esc(title(x.id))}</a>`).join("、")}</p>` : ""}`;
      });
    }
  });

  /* ---------- 每日紀錄表 ---------- */
  const JK = "of-journal-v1";
  const JF = [["date", "日期", "date"], ["gex", "淨 GEX（M）", "number"], ["flip", "價格 vs Flip", ["上方", "下方", "沒看"]], ["exp", "到期日", ["否", "是"]], ["ev", "事件", "text"], ["sc", "劇本", ["A", "B", "混合"]], ["rng", "實際振幅（點）", "number"],
    ["win", "進場時段", ["沒交易", "開盤後2小時", "美股其餘", "非美股"]], ["dir", "方向", ["—", "多", "空"]], ["e", "進場", "number"], ["s", "停損", "number"], ["x", "出場", "number"], ["why", "理由", "text"], ["follow", "照做了嗎", ["是", "否"]], ["note", "備註", "text"]];
  const rOf = (r) => { const d = r.dir === "多" ? 1 : r.dir === "空" ? -1 : 0, risk = (r.e - r.s) * d; return d && risk > 0 && r.x ? ((r.x - r.e) * d) / risk : null; };
  PAGES["journal"] = Object.assign(head("每日紀錄表", "路線 3 第 7 關的欄位，每天收盤後填一筆。存在這台裝置的瀏覽器裡，記得定期匯出 CSV 備份。"), {
    html: `<div class="scene"><div class="dx-form jr-form">${JF.map(([k, lab, ty]) => `<label>${lab}${Array.isArray(ty) ? `<select data-k="${k}">${ty.map((o) => `<option>${o}</option>`).join("")}</select>` : `<input data-k="${k}" type="${ty}"${ty === "number" ? ' step="any"' : ""}>`}</label>`).join("")}</div><div class="btn-row"><button class="btn primary jr-add" type="button">新增這一筆</button><button class="btn jr-csv" type="button">匯出 CSV</button><span class="small jr-msg"></span></div></div>
<div class="jr-stat kpi-row"></div><div class="table-wrap"><table class="tbl jr-tab"></table></div>`,
    mount(root) {
      const rows = () => store.get(JK, []);
      const today = new Date(); $('[data-k="date"]', root).value = today.toISOString().slice(0, 10);
      function paint() {
        const R = rows(), tr = R.filter((r) => rOf(r) != null), avg = (a) => (a.length ? (a.reduce((x, y) => x + y, 0) / a.length).toFixed(2) + "R" : "—");
        const byW = (w) => avg(tr.filter((r) => r.win === w).map(rOf));
        $(".jr-stat", root).innerHTML = `<div><span class="t1">紀錄天數</span><b>${new Set(R.map((r) => r.date)).size}</b></div><div><span class="t1">交易筆數</span><b>${tr.length}</b></div><div><span class="t1">平均</span><b>${avg(tr.map(rOf))}</b></div><div><span class="t1">照做率</span><b>${R.length ? Math.round((R.filter((r) => r.follow === "是").length / R.length) * 100) + "%" : "—"}</b></div><div><span class="t1">開盤後 2 小時</span><b>${byW("開盤後2小時")}</b></div><div><span class="t1">其他時段</span><b>${avg(tr.filter((r) => r.win !== "開盤後2小時").map(rOf))}</b></div>`;
        $(".jr-tab", root).innerHTML = R.length ? `<thead><tr>${JF.map((f) => `<th>${f[1]}</th>`).join("")}<th>R</th><th></th></tr></thead><tbody>${R.map((r, i) => `<tr>${JF.map((f) => `<td>${esc(r[f[0]] == null ? "" : r[f[0]])}</td>`).join("")}<td><b>${rOf(r) == null ? "" : rOf(r).toFixed(2)}</b></td><td><button class="btn jr-del" data-i="${i}" type="button">刪除</button></td></tr>`).join("")}</tbody>` : `<tbody><tr><td>還沒有紀錄。</td></tr></tbody>`;
      }
      root.addEventListener("click", (e) => {
        if (e.target.closest(".jr-add")) {
          const r = {}; root.querySelectorAll(".jr-form [data-k]").forEach((el) => { r[el.dataset.k] = el.type === "number" ? (el.value === "" ? null : +el.value) : el.value; });
          if (!r.date) { $(".jr-msg", root).textContent = "請填日期。"; return; }
          const R = rows(); R.push(r); R.sort((a, b) => (a.date < b.date ? -1 : 1));
          $(".jr-msg", root).textContent = store.set(JK, R) ? "已存。" : "這個瀏覽器不能存，請改用匯出。"; paint(); return;
        }
        const d = e.target.closest(".jr-del"); if (d) { const R = rows(); R.splice(+d.dataset.i, 1); store.set(JK, R); paint(); return; }
        if (e.target.closest(".jr-csv")) {
          const R = rows(), cols = JF.map((f) => f[0]);
          const csv = "﻿" + [JF.map((f) => f[1]).concat("R").join(","), ...R.map((r) => cols.map((c) => `"${String(r[c] == null ? "" : r[c]).replace(/"/g, '""')}"`).concat(rOf(r) == null ? "" : rOf(r).toFixed(2)).join(","))].join("\n");
          const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" })), a = document.createElement("a"); a.href = url; a.download = "每日紀錄-" + new Date().toISOString().slice(0, 10) + ".csv"; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 2000);
        }
      });
      paint();
    }
  });

  window.AIDS = { answer, terms };
})();
