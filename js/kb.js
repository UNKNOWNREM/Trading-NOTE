/* 知識庫：價格行為、布林通道、RSI、威科夫（舊 Trading Notes 的四科筆記，資料檔在 data/kb/） */
(function () {
  const PAGES = (window.__PAGES = window.__PAGES || {});
  const SUBJ = [
    { id: "pa", title: "價格行為（Price Action）", en: "Al Brooks — Reading Price Charts Bar by Bar", desc: "逐根 K 線解讀多空博弈：趨勢、區間、訊號 K 線的完整體系。", tags: ["趨勢", "形態", "K 線"] },
    { id: "wyckoff", title: "威科夫（Wyckoff）", en: "Wyckoff Method", desc: "吸籌與派發結構、彈簧與推升、量價分析，以及和 SMC／ICT 的對照。", tags: ["量價", "吸籌派發", "結構"] },
    { id: "bb", title: "布林通道（BB）", en: "Bollinger Bands", desc: "中軌 ± 2 倍標準差，看波動收縮（擠壓）與擴張突破。", tags: ["波動率", "標準差"] },
    { id: "rsi", title: "RSI 相對強弱指標", en: "Relative Strength Index", desc: "14 期漲跌幅比率，判斷超買、超賣與背離。", tags: ["動量", "背離"] }];
  const cache = {};
  const store = { get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } }, set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* ignore */ } } };
  const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;");

  function load(id) {
    if (cache[id]) return Promise.resolve(cache[id]);
    return new Promise((ok, bad) => {
      const old = window.CHAPTERS; window.CHAPTERS = undefined;
      const s = document.createElement("script"); s.src = `data/kb/${id}.js`;
      s.onload = () => { cache[id] = window.CHAPTERS || []; window.CHAPTERS = old; ok(cache[id]); };
      s.onerror = () => { window.CHAPTERS = old; bad(new Error("load failed")); };
      document.head.appendChild(s);
    });
  }

  PAGES["kb"] = {
    title: "知識庫",
    lede: "課程之外的四科筆記：價格行為、威科夫、布林通道、RSI。內容是文字筆記，適合查閱和複習。",
    chips: [["kb", "知識庫"]],
    html: `<div class="kb-cards">${SUBJ.map((x) => `<a class="kb-card" href="#kb-${x.id}"><span class="kb-en">${x.en}</span><b>${x.title}</b><span class="kb-d">${x.desc}</span><span class="kb-tags">${x.tags.map((t) => `<span class="chip">${t}</span>`).join("")}</span><span class="kb-prog" data-id="${x.id}"></span></a>`).join("")}</div>`,
    mount(root) {
      root.querySelectorAll(".kb-prog").forEach((el) => { const r = store.get("kb-read-" + el.dataset.id, []); el.textContent = r.length ? `已讀 ${r.length} 節` : ""; });
    }
  };

  SUBJ.forEach((S) => {
    PAGES["kb-" + S.id] = {
      title: S.title,
      lede: S.desc,
      chips: [["kb", "知識庫"], ["", S.en]],
      html: `<div class="kb-wrap"><aside class="kb-toc" aria-label="章節"><p class="small">載入中…</p></aside><article class="kb-art prose"><p class="small">載入中…</p></article></div>`,
      mount(root) {
        const toc = root.querySelector(".kb-toc"), art = root.querySelector(".kb-art"), RK = "kb-read-" + S.id, PK = "kb-pos-" + S.id;
        load(S.id).then((CH) => {
          const flat = []; CH.forEach((c, ci) => c.sections.forEach((s, si) => flat.push({ ci, si, c, s })));
          let read = store.get(RK, []), cur = Math.min(store.get(PK, 0), flat.length - 1);
          function drawToc() {
            toc.innerHTML = `<p class="kb-count small">已讀 ${read.length} / ${flat.length} 節</p>` + CH.map((c, ci) => `<details class="kb-ch"${flat[cur].ci === ci ? " open" : ""}><summary><span>${esc(c.title)}</span>${c.sub ? `<small>${esc(c.sub)}</small>` : ""}</summary>${c.sections.map((s, si) => { const k = flat.findIndex((f) => f.ci === ci && f.si === si); return `<button type="button" class="kb-sec${k === cur ? " cur" : ""}${read.includes(k) ? " done" : ""}" data-k="${k}">${esc(s.title)}</button>`; }).join("")}</details>`).join("");
          }
          function show(k) {
            cur = k; store.set(PK, k); const f = flat[k];
            art.innerHTML = `<p class="crumb">${esc(f.c.title)}</p><h2 class="kb-h">${esc(f.s.title)}</h2><div class="kb-body">${f.s.html}</div>
<div class="kb-foot"><button type="button" class="btn kb-prev"${k === 0 ? " disabled" : ""}>上一節</button><button type="button" class="btn kb-done">${read.includes(k) ? "已讀 ✓" : "標記為已讀"}</button><button type="button" class="btn primary kb-next"${k === flat.length - 1 ? " disabled" : ""}>下一節</button></div>`;
            drawToc();
            const main = document.getElementById("main"); if (main && art.getBoundingClientRect().top < 0) art.scrollIntoView({ block: "start" });
          }
          root.addEventListener("click", (e) => {
            const b = e.target.closest(".kb-sec"); if (b) { show(+b.dataset.k); return; }
            if (e.target.closest(".kb-prev")) show(Math.max(0, cur - 1));
            if (e.target.closest(".kb-next")) { if (!read.includes(cur)) { read.push(cur); store.set(RK, read); } show(Math.min(flat.length - 1, cur + 1)); }
            if (e.target.closest(".kb-done")) { read = read.includes(cur) ? read.filter((x) => x !== cur) : read.concat(cur); store.set(RK, read); show(cur); }
          });
          show(cur);
        }).catch(() => { art.innerHTML = `<p>這一科的資料檔沒有載入成功。請確認 data/kb/${S.id}.js 存在。</p>`; toc.innerHTML = ""; });
      }
    };
  });
  window.KB = { SUBJ };
})();
