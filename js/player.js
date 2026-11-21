/* 逐步動畫播放器（全站共用）
   STEP.mount(host, { steps, draw, svg, viewBox, label })
   steps[i] = { cap, why, stuck, stuckHref, stuckLabel, dur, q: { t, o: [[文字, 是否正確, 解析], ...] } }
   draw(svgEl, i, t)：畫出第 i 步、進度 t（0→1）的完整畫面。每次都整張重畫，
   所以可以任意跳步、倒回，不需要從頭播放。 */
(function () {
  const RM = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;");
  const hasTTS = "speechSynthesis" in window && typeof SpeechSynthesisUtterance === "function";

  function mount(host, o) {
    const S = o.steps, N = S.length;
    host.classList.add("sp");
    host.innerHTML = `
<div class="sp-stage"><svg class="sp-svg" viewBox="${o.viewBox || "0 0 640 380"}" role="img" aria-label="${esc(o.label || "逐步動畫")}"></svg></div>
<div class="sp-cap" aria-live="polite"><span class="sp-n"></span><p class="sp-t"></p></div>
<div class="sp-q" hidden><p class="sp-qt"></p><div class="sp-qo"></div><div class="sp-qf" aria-live="polite"></div></div>
<div class="sp-more"><details class="sp-why"><summary>為什麼？</summary><div class="sp-why-b"></div></details><button class="sp-stuck-btn" type="button">我卡住了</button></div>
<div class="sp-stuck" hidden><b>換個說法：</b><span class="sp-stuck-t"></span> <a class="sp-stuck-a" href="#of-1"></a></div>
<div class="sp-ctrl">
  <button class="btn sp-prev" type="button" aria-label="上一步">上一步</button>
  <button class="btn primary sp-play" type="button">自動播放</button>
  <button class="btn sp-next" type="button" aria-label="下一步">下一步</button>
  <button class="btn sp-again" type="button">重播這一步</button>
  <label class="sp-spd">速度 <select class="sp-speed"><option value="0.5">0.5×</option><option value="1" selected>1×</option><option value="1.5">1.5×</option></select></label>
  ${hasTTS ? `<label class="sp-tts"><input type="checkbox" class="sp-say"> 朗讀字幕</label>` : ""}
</div>
<ol class="sp-dots" aria-label="步驟">${S.map((s, i) => `<li><button type="button" data-i="${i}" aria-label="第 ${i + 1} 步${s.q ? "（小問題）" : ""}">${s.q ? "?" : i + 1}</button></li>`).join("")}</ol>`;
    const q = (s) => host.querySelector(s);
    const svg = q(".sp-svg"), cap = q(".sp-t"), num = q(".sp-n"), why = q(".sp-why"), whyB = q(".sp-why-b");
    const qBox = q(".sp-q"), stuckBox = q(".sp-stuck");
    const solved = new Set();
    let i = 0, t = 1, raf = 0, timer = 0, auto = false, speed = 1, start = 0;

    function say(txt) {
      if (!hasTTS || !q(".sp-say") || !q(".sp-say").checked) return;
      try { speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(txt); u.lang = "zh-TW"; u.rate = Math.min(1.4, 0.9 * speed + 0.1); speechSynthesis.speak(u); } catch (e) { /* 朗讀失敗就靜默略過 */ }
    }
    function paintUI() {
      const s = S[i];
      num.textContent = `第 ${i + 1} / ${N} 步`;
      cap.innerHTML = s.cap;
      why.hidden = !s.why; whyB.innerHTML = s.why || ""; why.open = false;
      q(".sp-stuck-btn").hidden = !s.stuck; stuckBox.hidden = true;
      q(".sp-stuck-t").innerHTML = s.stuck || "";
      const a = q(".sp-stuck-a"); a.hidden = !s.stuckHref; a.href = s.stuckHref || "#"; a.textContent = s.stuckLabel || "";
      qBox.hidden = !s.q;
      if (s.q) {
        q(".sp-qt").innerHTML = s.q.t;
        q(".sp-qo").innerHTML = s.q.o.map((x, j) => `<button class="q-opt${solved.has(i) && x[1] ? " ok" : ""}" type="button" data-j="${j}">${x[0]}</button>`).join("");
        q(".sp-qf").innerHTML = solved.has(i) ? `<b class="ok">答對了。</b>${s.q.o.find((x) => x[1])[2]}` : "";
      }
      const locked = s.q && !solved.has(i);
      q(".sp-prev").disabled = i === 0;
      q(".sp-next").disabled = i === N - 1 || locked;
      q(".sp-next").textContent = locked ? "先回答上面的問題" : "下一步";
      host.querySelectorAll(".sp-dots button").forEach((b, k) => {
        b.classList.toggle("cur", k === i); b.classList.toggle("seen", k < i);
        b.setAttribute("aria-current", k === i ? "step" : "false");
        // 不能跳過還沒答對的小問題
        const blocker = S.findIndex((x, m) => m < k && x.q && !solved.has(m));
        b.disabled = blocker !== -1 && k > blocker;
      });
      q(".sp-play").textContent = auto ? "暫停" : i === N - 1 && t >= 1 ? "從頭播放" : "自動播放";
    }
    function frame(now) {
      const dur = (S[i].dur || 1600) / speed;
      t = RM ? 1 : Math.min(1, (now - start) / dur);
      o.draw(svg, i, t);
      if (t < 1) { raf = requestAnimationFrame(frame); return; }
      raf = 0; paintUI();
      if (auto) {
        if (S[i].q && !solved.has(i)) { auto = false; paintUI(); return; }
        if (i >= N - 1) { auto = false; paintUI(); return; }
        timer = setTimeout(() => go(i + 1), (S[i].hold || 2600) / speed);
      }
    }
    function go(k, animate = true) {
      if (!document.body.contains(host)) return;
      cancelAnimationFrame(raf); clearTimeout(timer);
      i = Math.max(0, Math.min(N - 1, k));
      paintUI(); say(cap.textContent);
      if (!animate || RM) { t = 1; o.draw(svg, i, 1); paintUI(); return; }
      start = performance.now(); t = 0; raf = requestAnimationFrame(frame);
    }
    q(".sp-prev").addEventListener("click", () => { auto = false; go(i - 1, false); });
    q(".sp-next").addEventListener("click", () => { auto = false; go(i + 1); });
    q(".sp-again").addEventListener("click", () => { auto = false; go(i); });
    q(".sp-play").addEventListener("click", () => {
      if (auto) { auto = false; clearTimeout(timer); paintUI(); return; }
      auto = true;
      if (i === N - 1 && t >= 1) go(0); else if (t >= 1) go(S[i].q && !solved.has(i) ? i : i + 1); else paintUI();
    });
    q(".sp-speed").addEventListener("change", (e) => { speed = +e.target.value; });
    q(".sp-dots").addEventListener("click", (e) => { const b = e.target.closest("button"); if (!b || b.disabled) return; auto = false; go(+b.dataset.i); });
    q(".sp-stuck-btn").addEventListener("click", () => { stuckBox.hidden = !stuckBox.hidden; });
    q(".sp-qo").addEventListener("click", (e) => {
      const b = e.target.closest(".q-opt"); if (!b) return;
      const x = S[i].q.o[+b.dataset.j];
      host.querySelectorAll(".sp-qo .q-opt").forEach((y) => y.classList.remove("ok", "bad"));
      b.classList.add(x[1] ? "ok" : "bad");
      q(".sp-qf").innerHTML = `<b class="${x[1] ? "ok" : "bad"}">${x[1] ? "答對了。" : "再想想。"}</b>${x[2]}`;
      if (window.AIDS && o.qid) window.AIDS.answer(o.qid, "s" + i, !!x[1], q(".sp-qf"));
      if (x[1]) { solved.add(i); const f = q(".sp-qf").innerHTML; paintUI(); q(".sp-qf").innerHTML = f; }
    });
    host.addEventListener("keydown", (e) => {
      if (e.target.closest("select,input")) return;
      if (e.key === "ArrowRight" && !q(".sp-next").disabled) { e.preventDefault(); auto = false; go(i + 1); }
      if (e.key === "ArrowLeft" && i > 0) { e.preventDefault(); auto = false; go(i - 1, false); }
    });
    host.tabIndex = -1;
    go(0);
    return { go: (k) => { auto = false; host.scrollIntoView({ behavior: RM ? "auto" : "smooth", block: "start" }); go(k); }, get step() { return i; } };
  }
  window.STEP = { mount };
})();
