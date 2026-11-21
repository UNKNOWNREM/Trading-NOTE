/* 新首頁：三條路線、知識庫、學習工具 */
(function () {
  const PAGES = (window.__PAGES = window.__PAGES || {});
  const C = window.COURSE;
  if (PAGES.home) PAGES["home-old"] = Object.assign({}, PAGES.home, { title: "關鍵區疊圖", hero: false });
  const ROUTES = [
    { c: C.OFC, n: "訂單流", cls: "buy", d: "從期貨合約、Footprint、Delta 到價值區和五個確認訊號：看懂誰在主動、哪裡有人在乎。" },
    { c: C.OPC, n: "選擇權", cls: "gamma", d: "從買權賣權、Greeks 到市商對沖、GEX 牆與 Flip：知道哪些價位可能有對沖流。", pre: "op-0" },
    { c: C.SOP, n: "整合 SOP", cls: "brand", d: "盤前讀環境、畫關鍵位，盤中逐根看 K 線等觸發，盤後紀錄：把前兩條路線接成每天照做的流程。" }];
  const TOOLS = [["start-quiz", "起點測驗", "10 題判斷從哪一關開始"], ["review", "錯題本", "答錯的題目隔天再考"], ["gloss-all", "全站名詞表", "搜尋所有名詞卡"], ["tools", "工具箱", "口數、R 值、換算、時間"], ["nt-map", "NinjaTrader 對照", "概念對到軟體功能"], ["journal", "每日紀錄表", "記錄並匯出 CSV"]];

  // 首頁主視覺：一段價格梯子，左邊主動賣、右邊主動買，金線是關鍵位，紫色帶是 Gamma 牆
  function ladder() {
    const rows = [[18, 4], [26, 9], [44, 16], [61, 22], [38, 71], [24, 58], [15, 46], [9, 30], [6, 19], [4, 11]];
    let s = `<rect x="150" y="96" width="320" height="58" rx="8" class="hm-wall"/><text x="480" y="130" class="hm-t-g">Gamma 牆</text>`;
    rows.forEach(([a, b], k) => {
      const y = 30 + k * 30, p = 27150 - k * 5;
      s += `<rect x="${236 - a * 1.5}" y="${y}" width="${a * 1.5}" height="22" rx="4" class="hm-sell"/><text x="${232 - a * 1.5}" y="${y + 16}" text-anchor="end" class="hm-n">${a * 10}</text>`;
      s += `<text x="270" y="${y + 16}" text-anchor="middle" class="hm-p">${p.toLocaleString()}</text>`;
      s += `<rect x="304" y="${y}" width="${b * 1.5}" height="22" rx="4" class="hm-buy"/><text x="${308 + b * 1.5}" y="${y + 16}" class="hm-n">${b * 10}</text>`;
    });
    s += `<line x1="150" x2="470" y1="${30 + 4 * 30 - 4}" y2="${30 + 4 * 30 - 4}" class="hm-key"/><text x="480" y="${30 + 4 * 30 + 2}" class="hm-t-k">前日 VAH</text>`;
    s += `<text x="168" y="342" text-anchor="middle" class="hm-cap">主動賣</text><text x="372" y="342" text-anchor="middle" class="hm-cap">主動買</text>`;
    return `<svg class="hm-svg" viewBox="100 10 470 345" role="img" aria-label="示意：關鍵位上的 footprint，賣方吸收、買方轉強">${s}</svg>`;
  }

  PAGES["home"] = {
    title: "交易研究室", lede: "", chips: [], bare: true, wide: true,
    html: `<section class="hm-hero">
  <div class="hm-copy">
    <h1 class="hm-h">交易研究室</h1>
    <p class="hm-lede">從訂單流看<b>誰在主動</b>，從選擇權看<b>哪裡有對沖流</b>，再用一套每天照做的流程把兩者接起來。三條圖解路線、四科筆記、六個學習工具，零基礎也能跟上。</p>
    <div class="hm-cta"><a class="btn primary" href="#start-quiz">先做起點測驗</a><a class="btn" href="#learn">看課程地圖</a></div>
    <p class="small hm-note">每一關都有逐步動畫、關鍵處的小問題和可以操作的練習區。</p>
  </div>
  <div class="hm-art">${ladder()}</div>
</section>
<h2 class="hm-sec">三條路線</h2>
<div class="hm-routes">${ROUTES.map((r, k) => `<a class="hm-route ${r.cls}" href="#${r.pre || r.c.lessons[0].id}" data-k="${k}"><span class="hm-num">${k + 1}</span><b>${r.n}</b><span class="hm-len">${r.c.lessons.length} 關${r.pre ? "＋序章" : ""}</span><span class="hm-d">${r.d}</span><span class="hm-bar"><i></i></span><span class="hm-prog small"></span></a>`).join("")}</div>
<h2 class="hm-sec">知識庫</h2>
<div class="hm-kb">${(window.KB ? window.KB.SUBJ : []).map((x) => `<a href="#kb-${x.id}"><b>${x.title}</b><span>${x.desc}</span></a>`).join("")}</div>
<h2 class="hm-sec">學習工具</h2>
<div class="hm-tools">${TOOLS.map(([id, t, d]) => `<a href="#${id}"><b>${t}</b><span>${d}</span></a>`).join("")}</div>
<p class="small hm-foot">教育用途，不構成投資建議。範例數字多為示意，GEX 與選擇權部位都是依公開資料和假設推算的估計值。</p>`,
    mount(root) {
      root.querySelectorAll(".hm-route").forEach((a) => {
        const r = ROUTES[+a.dataset.k], p = C.prog(r.c), n = r.c.lessons.filter((l) => p.done[l.id]).length, tot = r.c.lessons.length;
        a.querySelector(".hm-bar i").style.width = (100 * n / tot) + "%";
        a.querySelector(".hm-prog").textContent = n ? `完成 ${n} / ${tot}` : "還沒開始";
        if (n && n < tot) { const nx = r.c.lessons.find((l) => !p.done[l.id]); if (nx) a.href = "#" + nx.id; }
      });
    }
  };
})();
