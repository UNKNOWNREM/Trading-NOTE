/* 新版關卡組裝工具：每關固定 8 段
   比喻 → 逐步動畫 → 圖解總結 → 你來操作 → 常見錯誤 → 常見疑問 → 看圖判斷 → 名詞卡
   KIT.page(C, id, cfg) 回傳一個頁面物件，交給 PAGES[id]。 */
(function () {
  const $ = (r, s) => r.querySelector(s);
  const CO = () => window.COURSE;
  const lerp = (a, b, t) => a + (b - a) * t;
  const ease = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
  const seg = (t, a, b) => Math.max(0, Math.min(1, (t - a) / (b - a)));
  const sg = (v, d = 0) => (v > 0 ? "+" : v < 0 ? "−" : "") + Math.abs(v).toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });
  function chip(x, y, txt, kind, op = 1) {
    const w = [...txt].reduce((s, c) => s + (c.charCodeAt(0) > 255 ? 13 : 7.4), 0) + 22;
    const cls = kind === "buy" ? "f-buy" : kind === "sell" ? "f-sell" : kind === "hl" ? "f-hl" : "f-inkd";
    return `<g opacity="${op}"><rect x="${x - w / 2}" y="${y - 13}" width="${w}" height="26" rx="13" class="${cls}"/><text x="${x}" y="${y + 4.5}" text-anchor="middle" class="t-w t-b">${txt}</text></g>`;
  }
  function badge(x, y, n, op = 1) { return `<g opacity="${op}"><circle cx="${x}" cy="${y}" r="10" class="f-buy"/><text x="${x}" y="${y + 4.5}" text-anchor="middle" class="t-w t-b">${n}</text></g>`; }

  function saveSVG(svg, name) {
    const clone = svg.cloneNode(true), src = svg.querySelectorAll("*"), dst = clone.querySelectorAll("*");
    src.forEach((el, k) => { const cs = getComputedStyle(el); ["fill", "stroke", "stroke-width", "stroke-dasharray", "font-size", "font-weight", "opacity"].forEach((p) => dst[k].setAttribute(p, cs.getPropertyValue(p))); dst[k].removeAttribute("class"); });
    clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    clone.setAttribute("style", `background:${getComputedStyle(document.body).backgroundColor};font-family:sans-serif`);
    const url = URL.createObjectURL(new Blob([clone.outerHTML], { type: "image/svg+xml" }));
    const a = document.createElement("a"); a.href = url; a.download = name + ".svg"; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  }

  function page(C, id, o) {
    const { strip, foot, isDone, setDone } = CO();
    const i = C.lessons.findIndex((l) => l.id === id), L = C.lessons[i];
    const vb = o.viewBox || "0 0 640 380";
    const html = `${strip(C, i)}
<div class="prose"><h2>${o.analogyTitle || "先用生活例子想一想"}</h2></div>
<div class="analogy">${o.analogy.map((a) => `<div class="an-i"><b>${a[0]}</b>${a[1]}</div>`).join("")}</div>
${o.intro ? `<div class="prose">${o.intro}</div>` : ""}
<div class="prose"><h2>逐步動畫：${o.steps.length} 步看懂${o.topic}</h2><p class="small">用「下一步」一步一步看，或按「自動播放」。遇到小問題要先答對才能往下；「為什麼？」可以展開更詳細的說明，看不懂就按「我卡住了」。鍵盤左右鍵也可以切換。</p></div>
<div class="scene"><div class="kit-player"></div></div>
<div class="prose"><h2>圖解總結</h2><p>一張圖記住這一關，可以存成圖片放進筆記。</p></div>
<div class="scene sum-w"><svg class="fpx kit-sum" viewBox="${o.sumViewBox || vb}" role="img" aria-label="${o.topic}圖解總結"></svg>
<div class="btn-row"><button class="btn kit-dl" type="button">存成圖片（SVG）</button></div></div>
<div class="prose"><h2>你來操作</h2><p>${o.simIntro}</p></div>
<div class="scene"><div class="kit-sim">${o.simHTML || ""}</div></div>
${o.after ? `<div class="prose">${o.after}</div>` : ""}
<div class="prose"><h2>常見錯誤</h2></div>
<div class="mist">${o.mist.map((m) => `<div class="mi"><div class="mi-bad"><span class="mi-k">✗ 常見誤解</span>${m[0]}</div><div class="mi-good"><span class="mi-k">✓ 正確</span>${m[1]}</div></div>`).join("")}</div>
<div class="prose"><h2>常見疑問</h2><p class="small">沒有講師可以問，所以把初學者最常問的問題先寫好。點問題看答案。</p></div>
<div class="faq">${o.faq.map((f) => `<details><summary>${f[0]}</summary><p>${f[1]}</p></details>`).join("")}</div>
<div class="prose"><h2>看圖判斷</h2><p class="small">答錯會告訴你錯在哪，也可以直接重播對應的那一步動畫。全部答對就完成這一關。</p></div>
${o.qs.map((x, k) => `<div class="quiz fpq" data-k="${k}">${x.fig || ""}<p class="q-t"><span class="q-tag">看圖題 ${k + 1}</span>${x.q}</p><div class="q-opts">${x.o.map((y, j) => `<button class="q-opt" type="button" data-j="${j}">${y[0]}</button>`).join("")}</div><div class="q-fb" aria-live="polite"></div></div>`).join("")}
<div class="prose"><h2>名詞卡</h2></div>
<div class="gloss">${o.gloss.map((g) => `<details><summary>${g[0]}</summary><p>${g[1]}</p></details>`).join("")}</div>
<div class="remember"><b class="r-h">一句話記住</b>${o.remember}</div>
${foot(C, i)}`;
    const BANK = (window.__QBANK = window.__QBANK || {});
    BANK[id] = { title: L.title, topic: o.topic, route: C.name, qs: o.qs, steps: o.steps.map((st) => (st.q ? { t: st.q.t, o: st.q.o, cap: st.cap } : null)), gloss: o.gloss };
    return {
      title: L.title, lede: o.lede,
      chips: [[C.cls, C.name], ["", o.chipText || `第 ${i + 1} 關　約 ${L.min} 分鐘`]],
      html,
      mount(root) {
        const player = window.STEP.mount($(root, ".kit-player"), { steps: o.steps, draw: o.draw, viewBox: vb, label: o.topic + "逐步動畫", qid: id });
        $(root, ".kit-player .sp-svg").classList.add("fpx");
        const sum = $(root, ".kit-sum");
        (o.drawSum || ((s) => o.draw(s, o.sumIdx != null ? o.sumIdx : o.steps.length - 1, 1)))(sum);
        $(root, ".kit-dl").addEventListener("click", () => saveSVG(sum, o.topic + "-圖解總結"));
        if (o.simMount) o.simMount($(root, ".kit-sim"), root);
        const solved = new Set(), lf = $(root, "#lf");
        function paint() {
          const d = isDone(C, id);
          lf.classList.toggle("is-done", d);
          $(lf, ".lf-status").textContent = d ? "本關完成 ✓" : `看圖題答對 ${solved.size} / ${o.qs.length} 就算完成`;
          root.querySelectorAll(".lvl-i").forEach((a, k) => { const dn = isDone(C, C.lessons[k].id); a.classList.toggle("done", dn); $(a, ".lvl-n").textContent = dn ? "✓" : k + 1; });
        }
        root.querySelectorAll(".fpq").forEach((box) => {
          const x = o.qs[+box.dataset.k];
          box.addEventListener("click", (e) => {
            if (e.target.closest(".rp")) { player.go(x.step - 1); return; }
            const b = e.target.closest(".q-opt"); if (!b) return;
            const y = x.o[+b.dataset.j];
            box.querySelectorAll(".q-opt").forEach((z) => z.classList.remove("ok", "bad"));
            b.classList.add(y[1] ? "ok" : "bad");
            $(box, ".q-fb").innerHTML = `<b class="${y[1] ? "ok" : "bad"}">${y[1] ? "答對了。" : "再想想。"}</b>${y[2]}${y[1] || !x.step ? "" : ` <button class="btn rp" type="button">重播第 ${x.step} 步</button>`}`;
            if (window.AIDS) window.AIDS.answer(id, "q" + box.dataset.k, !!y[1], $(box, ".q-fb"));
            if (y[1]) { solved.add(+box.dataset.k); box.classList.add("solved"); if (solved.size === o.qs.length) setDone(C, id); }
            paint();
          });
        });
        $(root, "#lf-mark").addEventListener("click", () => { setDone(C, id); paint(); });
        paint();
      }
    };
  }
  const fpTable = (rows, cap, head = ["主動賣", "價格", "主動買"]) => `<table class="fp q-fp" aria-label="${cap}"><thead><tr>${head.map((h) => `<td>${h}</td>`).join("")}</tr></thead><tbody>${rows.map((r) => `<tr><td class="b hot">${r[1]}</td><td class="px">${r[0]}</td><td class="a hot">${r[2]}</td></tr>`).join("")}</tbody></table>`;
  // 總結卡片：rows = [[標題, 說明], ...]
  function cards(rows, t, o = {}) {
    const x = o.x || 90, w = o.w || 460, y0 = o.y || 36, h = o.h || 54, gap = o.gap || (h + 12), hl = o.hl == null ? -1 : o.hl;
    return rows.map((r, k) => `<g opacity="${seg(t, k * 0.14, k * 0.14 + 0.3)}"><rect x="${x}" y="${y0 + k * gap}" width="${w}" height="${h}" rx="10" class="${k === hl ? "f-gamma-soft" : "f-surface"} s-line"/><circle cx="${x + 26}" cy="${y0 + k * gap + h / 2}" r="11" class="f-buy"/><text x="${x + 26}" y="${y0 + k * gap + h / 2 + 5}" text-anchor="middle" class="t-w t-b">${k + 1}</text><text x="${x + 48}" y="${y0 + k * gap + h / 2 - 5}" class="t-ink t-b t-lg">${r[0]}</text><text x="${x + 48}" y="${y0 + k * gap + h / 2 + 16}" class="t-ink">${r[1]}</text></g>`).join("");
  }
  // 小型 Footprint：rows = [[價格, 主動賣, 主動買], ...]，x 為左邊界
  function fpMini(x, y0, rows, o = {}) {
    const rh = o.rh || 30, cw = o.cw || 62, pw = o.pw || 70, hot = o.hot || 150;
    let s = o.title ? `<text x="${x + cw + pw / 2}" y="${y0 - 12}" text-anchor="middle" class="t-ink t-b">${o.title}</text>` : "";
    rows.forEach((r, k) => {
      const y = y0 + k * rh, hl = o.hl && o.hl.includes(r[0]);
      s += `<rect x="${x}" y="${y}" width="${cw}" height="${rh - 4}" rx="4" class="${r[1] >= hot ? "f-sell" : "f-sell-soft"}"/><text x="${x + cw - 8}" y="${y + rh / 2 + 3}" text-anchor="end" class="${r[1] >= hot ? "t-w" : "t-sell"} t-b">${r[1]}</text>`;
      s += `<text x="${x + cw + pw / 2}" y="${y + rh / 2 + 3}" text-anchor="middle" class="${o.mark === r[0] ? "t-gamma t-b" : "t-mute"}">${r[0].toFixed(2)}</text>`;
      s += `<rect x="${x + cw + pw}" y="${y}" width="${cw}" height="${rh - 4}" rx="4" class="${r[2] >= hot ? "f-buy" : "f-buy-soft"}"/><text x="${x + cw + pw + 8}" y="${y + rh / 2 + 3}" class="${r[2] >= hot ? "t-w" : "t-buy"} t-b">${r[2]}</text>`;
      if (hl) s += `<rect x="${x - 3}" y="${y - 3}" width="${cw * 2 + pw + 6}" height="${rh + 2}" rx="6" class="f-none s-hl" stroke-width="2.5"/>`;
    });
    if (o.foot) s += `<text x="${x + cw + pw / 2}" y="${y0 + rows.length * rh + 18}" text-anchor="middle" class="t-ink t-b">${o.foot}</text>`;
    return s;
  }
  window.KIT = { cards, fpMini, page, chip, badge, lerp, ease, seg, sg, fpTable, saveSVG };
})();
