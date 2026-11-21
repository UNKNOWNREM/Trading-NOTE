/* 首頁：TRADING NOTES 科目總覽。圖解課程「訂單流與選擇權」是其中一個（新的）科目。 */
(function () {
  const PAGES = (window.__PAGES = window.__PAGES || {});
  const C = window.COURSE;
  if (PAGES.home) PAGES["home-old"] = Object.assign({}, PAGES.home, { title: "關鍵區疊圖", hero: false });
  const SUBJ = window.SUBJECTS || [], CATS = window.SUBJECT_CATEGORIES || [];
  const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;");
  const read = (id) => { try { return (JSON.parse(localStorage.getItem("kb-read-" + id) || "[]") || []).length; } catch (e) { return 0; } };
  const ROUTES = [
    { c: C.OFC, n: "訂單流", cls: "buy", d: "Footprint、Delta、價值區、五個確認訊號" },
    { c: C.OPC, n: "選擇權", cls: "gamma", d: "Greeks、市商對沖、GEX 牆與 Flip", pre: "op-0" },
    { c: C.SOP, n: "整合 SOP", cls: "brand", d: "盤前讀環境、盤中等觸發、盤後紀錄" }];

  // 圖解課程的插圖：關鍵位上的 footprint，左邊主動賣、右邊主動買，金線是關鍵位，紫色帶是 Gamma 牆
  function ladder() {
    const rows = [[18, 4], [26, 9], [44, 16], [61, 22], [38, 71], [24, 58], [15, 46], [9, 30], [6, 19], [4, 11]];
    let s = `<rect x="150" y="96" width="320" height="58" rx="8" class="hm-wall"/><text x="480" y="130" class="hm-t-g">Gamma 牆</text>`;
    rows.forEach(([a, b], k) => {
      const y = 30 + k * 30, p = 27150 - k * 5;
      s += `<rect x="${236 - a * 1.5}" y="${y}" width="${a * 1.5}" height="22" rx="4" class="hm-sell"/><text x="${232 - a * 1.5}" y="${y + 16}" text-anchor="end" class="hm-n">${a * 10}</text>`;
      s += `<text x="270" y="${y + 16}" text-anchor="middle" class="hm-p">${p.toLocaleString()}</text>`;
      s += `<rect x="304" y="${y}" width="${b * 1.5}" height="22" rx="4" class="hm-buy"/><text x="${308 + b * 1.5}" y="${y + 16}" class="hm-n">${b * 10}</text>`;
    });
    s += `<line x1="150" x2="470" y1="146" y2="146" class="hm-key"/><text x="480" y="152" class="hm-t-k">前日 VAH</text>`;
    s += `<text x="168" y="342" text-anchor="middle" class="hm-cap">主動賣</text><text x="372" y="342" text-anchor="middle" class="hm-cap">主動買</text>`;
    return `<svg class="hm-svg" viewBox="100 10 470 345" role="img" aria-label="示意：關鍵位上的 footprint，賣方吸收、買方轉強">${s}</svg>`;
  }

  const course = SUBJ.find((s) => s.kind === "course");
  const notes = SUBJ.filter((s) => s.status === "active" && s.kind !== "course");

  function catBlock(cat) {
    const list = SUBJ.filter((s) => s.category === cat && s.kind !== "course"); if (!list.length) return "";
    const on = list.filter((s) => s.status === "active"), mg = list.filter((s) => s.status === "merged"), soon = list.filter((s) => s.status === "coming");
    return `<section class="hm-cat"><h3>${esc(cat)}</h3>
${on.length ? `<div class="hm-subj">${on.map((s) => `<a class="hm-s" href="${s.href}" data-id="${s.id}"><b>${esc(s.title)}</b><span class="hm-s-sub">${esc(s.subtitle)}</span><span class="hm-s-d">${esc(s.desc)}</span><span class="hm-s-p small"></span></a>`).join("")}</div>` : ""}
${mg.length ? `<ul class="hm-merged">${mg.map((s) => `<li><a href="${s.href}">${esc(s.title)}</a><span>已併入新課程（${esc(s.where)}）</span></li>`).join("")}</ul>` : ""}
${soon.length ? `<p class="hm-soon"><span>籌備中</span>${soon.map((s) => `<span class="hm-chip" title="${esc(s.desc)}">${esc(s.title)}</span>`).join("")}</p>` : ""}
</section>`;
  }

  PAGES["home"] = {
    title: "TRADING NOTES", lede: "", chips: [], bare: true,
    html: `<section class="hm-top">
  <h1 class="hm-h">TRADING NOTES</h1>
  <p class="hm-lede">系統化學習交易知識，建立自己的市場認知框架。</p>
  <p class="hm-stats"><span><b>${SUBJ.filter((s) => s.status === "active").length}</b> 個開放科目</span><span><b class="hm-done">0</b> 個已讀小節</span><span><b class="hm-lv">0</b> 關圖解課程已完成</span></p>
</section>
${course ? `<section class="hm-course">
  <div class="hm-c-copy">
    <p class="hm-new">新課程</p>
    <h2><a href="${course.href}">${esc(course.title)}</a></h2>
    <p class="hm-c-sub">${esc(course.subtitle)}</p>
    <p class="hm-c-d">${esc(course.desc)}</p>
    <ol class="hm-rt">${ROUTES.map((r, k) => `<li class="rt-${r.cls}"><a href="#${r.pre || r.c.lessons[0].id}" data-k="${k}"><b>${r.n}</b><span>${r.c.lessons.length} 關${r.pre ? "＋序章" : ""}　${r.d}</span><i class="hm-bar"><i></i></i></a></li>`).join("")}</ol>
    <div class="hm-cta"><a class="btn primary" href="#learn">進入課程</a><a class="btn" href="#start-quiz">先做起點測驗</a></div>
  </div>
  <div class="hm-art">${ladder()}</div>
</section>` : ""}
<h2 class="hm-sec">所有科目</h2>
${CATS.map(catBlock).join("")}
<p class="small hm-foot">教育用途，不構成投資建議。範例數字多為示意，GEX 與選擇權部位是依公開資料和假設推算的估計值。</p>`,
    mount(root) {
      let done = 0;
      root.querySelectorAll(".hm-s").forEach((a) => { const n = read(a.dataset.id); done += n; a.querySelector(".hm-s-p").textContent = n ? `已讀 ${n} 節` : ""; });
      root.querySelector(".hm-done").textContent = done;
      let lv = 0;
      root.querySelectorAll(".hm-rt a").forEach((a) => {
        const r = ROUTES[+a.dataset.k], p = C.prog(r.c), n = r.c.lessons.filter((l) => p.done[l.id]).length; lv += n;
        a.querySelector(".hm-bar i").style.width = (100 * n / r.c.lessons.length) + "%";
        if (n && n < r.c.lessons.length) { const nx = r.c.lessons.find((l) => !p.done[l.id]); if (nx) a.href = "#" + nx.id; }
      });
      root.querySelector(".hm-lv").textContent = lv;
    }
  };
})();
