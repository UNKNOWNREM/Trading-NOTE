/* Shell: navigation, router, search, theme. */
(function () {
  const NOTES = window.__NOTES || [], PAGES = window.__PAGES || {};
  const byId = Object.fromEntries(NOTES.map((n) => [n.id, n]));
  const SHORT = {
    "in-00": "閱讀地圖", "in-01": "01 市場基礎", "in-02": "02 買賣價與兩種下單", "in-02b": "02 補　Bid／Ask 白話版", "in-03": "03 成交量與 K 棒",
    "in-04": "04 Footprint 怎麼讀", "in-05": "05 Delta 是什麼", "in-06": "06 Imbalance 與堆疊失衡", "in-07": "07 Absorption 吸收", "in-08": "08 Volume Profile",
    "in-09": "09 Market Profile", "in-10": "10 風險管理", "in-11": "11 一筆完整交易範例", "in-gloss": "詞彙表",
    "vd-overview": "七步驟總覽", "vd-s1": "Step 1　拍賣機制與三個工具", "vd-s2": "Step 2　Delta 與價格六情境", "vd-s3": "Step 3　Vertical Volume 與 Footprint",
    "vd-s4": "Step 4　Volume Profile 三種方法", "vd-s5": "Step 5　進場訊號", "vd-s6": "Step 6　風險管理與心理", "vd-s7": "Step 7　交易系統與 30 天挑戰",
    "vd-critique": "七步驟的批判與限制", "vd-five": "五個確認訊號", "vd-rain": "RAIN 四種進場",
    "ig-cheat": "重點速查", "ig-notes": "整合學習筆記", "ig-gaps": "缺口與待驗證清單", "ig-crtfa": "CRT × Failed Auction", "ig-crt2m": "CRT 快訊兩個月回顧",
    "ig-crt1p": "CRT 快訊 Footprint 欄位（單頁）", "ig-crtreq": "CRT 指標欄位需求清單", "ig-nqof": "NQ 快訊 OF 欄位 v1.2", "ig-tvlimit": "TradingView Footprint 限制",
    "pd-atas-cluster": "ATAS Cluster Analysis 指南", "pd-atas-mp": "ATAS Market／Volume Profile", "pd-of-setups": "Order Flow Setups 逐章筆記", "pd-vp": "Volume Profile 逐章筆記",
    "rs-basic": "微觀結構基礎報告", "rs-adv": "微觀結構進階研究",
    "learn": "圖解地圖（從這裡開始）", "kb": "總覽", "kb-pa": "Price Action", "kb-wyckoff": "Wyckoff", "kb-bb": "布林帶 (BB)", "kb-rsi": "RSI", "home-old": "關鍵區疊圖", "start-quiz": "起點測驗", "review": "錯題本", "gloss-all": "全站名詞表", "tools": "工具箱", "nt-map": "NinjaTrader 對照", "journal": "每日紀錄表",
    "of-fut": "1　期貨合約與下單", "of-1": "2　價格怎麼動", "of-2": "3　Footprint", "of-3": "4　Delta", "of-cvd": "5　CVD 與背離", "of-4": "6　失衡", "of-6": "7　Volume Profile", "of-vwap": "8　VWAP", "of-7": "9　Market Profile", "of-sess": "10　交易時段", "of-event": "11　經濟事件", "of-5": "12　五個確認訊號", "of-8": "13　風險管理", "of-9": "14　一筆完整交易", "of-psy": "15　交易心理", "of-box": "16　失衡框", "of-mig": "17　價值轉換", "of-exit": "18　位置與出場",
    "op-0": "序章　衍生品與對沖", "op-1": "1　買權與賣權", "op-2": "2　時間價值", "op-3": "3　Delta 與 Gamma", "op-4": "4　隱含波動率", "op-skew": "5　波動率偏斜", "op-5": "6　市商的對沖帳本", "op-6": "7　從 OI 到 GEX", "op-7": "8　到期日效應", "op-vc": "9　Vanna 與 Charm", "op-8": "10　GEX 地形圖", "op-real": "11　真實地形", "op-dex": "12　DEX 與 GammaLens", "learn-1": "1　一天的流程", "learn-2": "2　讀環境定劇本", "learn-3": "3　畫關鍵位", "learn-4": "4　劇本 A 震盪日", "learn-5": "5　劇本 B 趨勢日", "learn-6": "6　風控隨環境", "learn-7": "7　復盤與總演練"
  };
  const OPT_ORDER = ["home-old", "ob-basics", "ob-greeks", "ob-hedge", "ob-zones", "ob-lab", "ob-evidence"];
  const NAV = [
    { part: "", cls: "kb", title: "筆記科目", groups: [{ t: null, ids: ["kb-pa", "kb-wyckoff", "kb-bb", "kb-rsi"] }] },
    { part: "", cls: "learn", title: "訂單流與選擇權（圖解）", groups: [
      { t: null, ids: ["learn"] },
      { t: "路線 1　訂單流（18 關）", ids: ["of-fut", "of-1", "of-2", "of-3", "of-cvd", "of-4", "of-6", "of-vwap", "of-7", "of-sess", "of-event", "of-5", "of-8", "of-9", "of-psy", "of-box", "of-mig", "of-exit"] },
      { t: "路線 2　選擇權（序章＋12 關）", ids: ["op-0", "op-1", "op-2", "op-3", "op-4", "op-skew", "op-5", "op-6", "op-7", "op-vc", "op-8", "op-real", "op-dex"] },
      { t: "路線 3　整合 SOP（7 關）", ids: ["learn-1", "learn-2", "learn-3", "learn-4", "learn-5", "learn-6", "learn-7"] },
      { t: "學習工具（6 個）", ids: ["start-quiz", "review", "gloss-all", "tools", "nt-map", "journal"] }] },
    { part: "A", cls: "buy", title: "訂單流", groups: [
      { t: null, ids: ["in-00", "in-01", "in-02", "in-02b", "in-03", "in-04", "in-05", "in-06", "in-07", "in-08", "in-09", "in-10", "in-11", "in-gloss"] }] },
    { part: "B", cls: "gamma", title: "選擇權", groups: [{ t: null, ids: OPT_ORDER }] },
    { part: "C", cls: "both", title: "整合", groups: [{ t: null, ids: ["cx-sop"] }] }
  ];
  // 只顯示實際存在的頁面（公開版沒有 vault 筆記），空的群組和分區整個隱藏
  NAV.forEach((p) => { p.groups.forEach((g) => { g.ids = g.ids.filter((id) => PAGES[id] || byId[id]); }); p.groups = p.groups.filter((g) => g.ids.length); });
  for (let i = NAV.length - 1; i >= 0; i--) if (!NAV[i].groups.length) NAV.splice(i, 1);
  const label = (id) => SHORT[id] || (PAGES[id] && PAGES[id].title) || (byId[id] && byId[id].t) || id;
  const $ = (s, r = document) => r.querySelector(s);
  const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;");

  /* nav */
  const rail = $("#nav");
  rail.innerHTML = `<a class="nav-item nav-flat" data-id="home" href="#home" style="margin-top:6px">首頁</a>` + NAV.map((p) => `
    <section class="part ${p.cls}"><div class="part-head"><span class="dot ${p.cls}"></span>${p.part ? p.part + "　" : ""}${p.title}</div>
    ${p.groups.map((g) => {
      const items = g.ids.map((id) => `<a class="nav-item" data-id="${id}" href="#${id}">${esc(label(id))}</a>`).join("");
      return g.t ? `<details class="grp"><summary>${g.t}</summary>${items}</details>` : items;
    }).join("")}</section>`).join("");

  /* search index */
  const strip = (h) => h.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");
  const INDEX = [
    ...NOTES.map((n) => ({ id: n.id, t: label(n.id), full: n.t, x: n.x })),
    ...Object.entries(PAGES).filter(([id]) => id !== "home").map(([id, p]) => ({ id, t: p.title, full: p.title, x: strip(p.html || "") })),
    { id: "home", t: "首頁", full: "首頁", x: strip(PAGES.home.html) }
  ];
  function search(q) {
    const toks = q.toLowerCase().split(/\s+/).filter(Boolean); if (!toks.length) return [];
    const out = [];
    INDEX.forEach((d) => {
      const hay = (d.t + " " + d.full + " " + d.x).toLowerCase(); if (!toks.every((t) => hay.includes(t))) return;
      const tl = (d.t + " " + d.full).toLowerCase(); let score = toks.reduce((s, t) => s + (tl.includes(t) ? 50 : 0) + Math.min(hay.split(t).length - 1, 20), 0);
      const lx = d.x.toLowerCase(), i = lx.indexOf(toks[0]), a = Math.max(0, i - 28), snip = i < 0 ? d.x.slice(0, 70) : (a ? "…" : "") + d.x.slice(a, i + 70) + "…";
      out.push({ d, score, snip });
    });
    return out.sort((a, b) => b.score - a.score).slice(0, 12);
  }
  const box = $("#results"), inp = $("#q");
  function mark(s, toks) { let h = esc(s); toks.forEach((t) => { if (t) h = h.replace(new RegExp("(" + t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + ")", "gi"), "<mark>$1</mark>"); }); return h; }
  let tmr;
  inp.addEventListener("input", () => { clearTimeout(tmr); tmr = setTimeout(() => {
    const q = inp.value.trim(); if (!q) { box.classList.remove("open"); return; }
    const res = search(q), toks = q.toLowerCase().split(/\s+/);
    box.innerHTML = res.length ? res.map((r) => `<a href="#${r.d.id}" data-q="${esc(q)}"><div class="r-title">${esc(r.d.t)}</div><div class="r-snip">${mark(r.snip, toks)}</div></a>`).join("") : `<div class="r-empty">找不到「${esc(q)}」。試試英文縮寫，例如 POC、Delta、Gamma。</div>`;
    box.classList.add("open"); }, 120); });
  box.addEventListener("click", () => { box.classList.remove("open"); inp.blur(); });
  document.addEventListener("click", (e) => { if (!e.target.closest(".search-wrap")) box.classList.remove("open"); });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") { box.classList.remove("open"); rail.parentElement.classList.remove("open"); }
    if (e.key === "/" && !/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)) { e.preventDefault(); inp.focus(); }
  });

  /* theme + menu */
  const root = document.documentElement;
  try { const t = localStorage.getItem("of-theme"); if (t) root.setAttribute("data-theme", t); } catch (e) { /* ignore */ }
  $("#theme").addEventListener("click", () => {
    const cur = root.getAttribute("data-theme") || "dark", nx = cur === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", nx); try { localStorage.setItem("of-theme", nx); } catch (e) { /* ignore */ }
  });
  $("#menu-btn").addEventListener("click", () => rail.parentElement.classList.toggle("open"));

  /* router */
  const view = $("#view"), main = $("#main");
  let pendingHeading = null;
  function chip(c, t) { return `<span class="chip ${c}">${t}</span>`; }
  function groupOf(id) { for (const p of NAV) for (const g of p.groups) if (g.ids.includes(id)) return { p, g }; return null; }
  function scrollHeading(txt) {
    if (!txt) return; const hs = [...view.querySelectorAll("h2,h3,h4")]; const h = hs.find((x) => x.textContent.trim() === txt) || hs.find((x) => x.textContent.includes(txt));
    if (h) h.scrollIntoView({ block: "start" });
  }
  function render() {
    let id = decodeURIComponent(location.hash.slice(1)) || "home"; if (!PAGES[id] && !byId[id]) id = "home";
    window.OF.hideTip();
    document.querySelectorAll(".nav-item").forEach((a) => a.classList.toggle("active", a.dataset.id === id));
    const loc = groupOf(id); if (loc && loc.g.t) { const d = [...document.querySelectorAll(".grp")].find((x) => x.querySelector(`[data-id="${id}"]`)); if (d) d.open = true; }
    let h = "", mountFn = null;
    if (PAGES[id]) {
      const p = PAGES[id];
      h = p.bare ? p.html : `<div class="page-head">${loc ? `<div class="crumb">${loc.p.part ? loc.p.part + "　" : ""}${loc.p.title}</div>` : ""}<h1>${p.title}</h1><p class="lede">${p.lede}</p><div class="meta-row">${(p.chips || []).map((c) => chip(c[0], c[1])).join("")}</div></div>${p.html}`;
      mountFn = p.mount;
    } else {
      const n = byId[id], hs = (n.h.match(/<h2[^>]*>/g) || []).length;
      let html = n.h, toc = "";
      if (hs >= 4) { let i = 0; const items = []; html = html.replace(/<h2([^>]*)>(.*?)<\/h2>/g, (m, a, t) => { const k = "sec" + i++; items.push(`<li><a href="#${id}" data-sec="${k}">${t.replace(/<[^>]+>/g, "")}</a></li>`); return `<h2${a} id="${k}">${t}</h2>`; }); toc = `<details class="toc"><summary>本頁目錄（${hs} 節）</summary><ol>${items.join("")}</ol></details>`; }
      const ids = loc ? loc.g.ids : [], ix = ids.indexOf(id), prev = ix > 0 ? ids[ix - 1] : null, next = ix >= 0 && ix < ids.length - 1 ? ids[ix + 1] : null;
      const pager = `<div class="pager">${prev ? `<a href="#${prev}"><small>上一篇</small>${esc(label(prev))}</a>` : "<span></span>"}${next ? `<a href="#${next}" style="text-align:right"><small>下一篇</small>${esc(label(next))}</a>` : "<span></span>"}</div>`;
      const chips = [chip("buy", "訂單流"), n.d ? chip("", "筆記日期 " + n.d) : ""].join("");
      h = `<div class="page-head"><div class="crumb">${loc ? loc.p.part + "　" + loc.p.title + (loc.g.t ? "　›　" + loc.g.t : "") : ""}</div><h1>${esc(n.t)}</h1><div class="meta-row">${chips}</div></div>${toc}<div class="prose wide-ok">${html}</div>${pager}`;
    }
    view.innerHTML = `<div class="page">${h}</div>`;
    main.scrollTo(0, 0);
    if (mountFn) mountFn(view);
    window.OF.bindTips(view);
    if (pendingHeading) { const t = pendingHeading; pendingHeading = null; requestAnimationFrame(() => scrollHeading(t)); }
    rail.parentElement.classList.remove("open");
  }
  view.addEventListener("click", (e) => {
    const s = e.target.closest("[data-sec]"); if (s) { e.preventDefault(); const t = document.getElementById(s.dataset.sec); if (t) t.scrollIntoView({ block: "start" }); return; }
    const w = e.target.closest("a.wl[data-h]"); if (w) { pendingHeading = w.dataset.h; if (location.hash.slice(1) === w.dataset.note) { e.preventDefault(); scrollHeading(pendingHeading); pendingHeading = null; } }
  });
  window.addEventListener("hashchange", render);
  render();
})();
