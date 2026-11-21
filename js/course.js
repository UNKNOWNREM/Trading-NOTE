/* 圖解：期貨 × 選擇權整合 SOP。這個檔案放共用元件、圖解地圖、第 1–3 關。 */
(function () {
  const PAGES = (window.__PAGES = window.__PAGES || {});
  const $ = (r, s) => r.querySelector(s);
  const KEY = "of-course-sop-v1";
  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* storage may be unavailable */ } }
  };
  const RM = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  const nf = (v, d = 0) => (v == null || !isFinite(v) ? "—" : Number(v).toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d }));
  const sgn = (v, d = 0) => (v > 0 ? "+" : v < 0 ? "−" : "") + nf(Math.abs(v), d);

  const SOP = { key: "of-course-sop-v2", name: "整合 SOP", cls: "both", lessons: [
    { id: "learn-1", short: "一天的流程", title: "一天的流程：盤前、盤中、盤後", min: 8, can: "說出六個步驟各用到路線 1、2 的哪些內容，以及台灣時間每個時段該做什麼。" },
    { id: "learn-2", short: "讀環境定劇本", title: "讀環境，定劇本：四個問題", min: 10, can: "用淨 GEX、Flip、到期、事件判定今天是劇本 A、B 還是混合日。" },
    { id: "learn-3", short: "畫關鍵位", title: "畫關鍵位：價值區、高低點與合併", min: 10, can: "畫出前日價值區、前日高低、隔夜高低，合併成 3～5 個區域。" },
    { id: "learn-4", short: "劇本 A 震盪日", title: "劇本 A：震盪日——逐根 K 線讀吸收與觸發", min: 15, can: "在價值區邊緣讀懂 K 線外觀和 footprint，等觸發再進場，目標回中間。" },
    { id: "learn-5", short: "劇本 B 趨勢日", title: "劇本 B：趨勢日——拒絕、接受與回測", min: 15, can: "看出價格拒絕或接受價值區，不追大 K 線，在沒量的回測後順勢進場。" },
    { id: "learn-6", short: "風控隨環境", title: "風控隨環境調整：口數、目標與每日上限", min: 10, can: "用固定風險金額算出口數，依劇本調整目標，混合日、事件日減半。" },
    { id: "learn-7", short: "復盤與總演練", title: "盤後復盤與總演練", min: 12, can: "用固定欄位紀錄每天、評估流程而不是結果，並在六個情境中做出正確決定。" }] };
  const OFC = { key: "of-course-of-v1", name: "訂單流", cls: "buy", lessons: [
    { id: "of-fut", short: "期貨與下單", title: "期貨合約與下單：每一點值多少錢", min: 15, can: "說出 NQ、MNQ 每一點的價值，分辨市價單、限價單、停損單，並算出一筆交易賺賠多少。" },
    { id: "of-1", short: "價格怎麼動", title: "價格怎麼動：掛單簿與兩種下單", min: 15, can: "說出限價單和市價單的差別，並解釋價格為什麼會跳動。" },
    { id: "of-2", short: "Footprint", title: "Footprint：把一根 K 棒拆開", min: 15, can: "把逐筆成交記進 Footprint，讀懂每一格、Delta 和總 Delta。" },
    { id: "of-3", short: "Delta", title: "Delta：誰比較急？和價格的四種關係", min: 15, can: "用「Delta ＋ 價格」判斷推得動還是有人在擋。" },
    { id: "of-cvd", short: "CVD 背離", title: "CVD 與背離：把 Delta 一路加起來", min: 15, can: "畫出 CVD，認出價格和 CVD 方向不一致的背離，並知道它常見的誤判。" },
    { id: "of-4", short: "失衡", title: "失衡與堆疊失衡：為什麼要斜著比", min: 15, can: "自己算出買方、賣方失衡，認出堆疊失衡，知道門檻怎麼影響訊號多寡。" },
    { id: "of-6", short: "Volume Profile", title: "Volume Profile：找出大家在乎的價位", min: 15, can: "算出 POC 與價值區，認出 HVN、LVN，畫出盤前要用的三條線。" },
    { id: "of-vwap", short: "VWAP", title: "VWAP：今天所有人的平均成本", min: 15, can: "算出 VWAP，用標準差通道和錨定 VWAP 判斷誰掌控今天。" },
    { id: "of-7", short: "Market Profile", title: "Market Profile：用時間看拍賣", min: 15, can: "讀懂 TPO、初始平衡、單一印記，分辨接受與拒絕。" },
    { id: "of-sess", short: "交易時段", title: "交易時段：用台灣時間看 NQ 的一天", min: 12, can: "換算冬令、夏令時間，知道哪些時段成交量大、訊號比較可靠。" },
    { id: "of-event", short: "經濟事件", title: "經濟事件日曆：CPI、非農、FOMC 怎麼處理", min: 12, can: "看懂經濟日曆，事先排出不開新倉的時段，知道事件時停損為什麼會滑價。" },
    { id: "of-5", short: "五個確認", title: "五個確認訊號：在關鍵位讀買賣方", min: 15, can: "在關鍵價位認出吸收、大限價單、被套交易者、主動交易者、Delta 轉向，算出確認數。" },
    { id: "of-8", short: "風險管理", title: "風險管理：期望值與部位大小", min: 15, can: "用 R 算期望值和損益兩平勝率，先決定停損再算口數。" },
    { id: "of-9", short: "完整交易", title: "一筆完整交易：從盤前到出場的重播", min: 15, can: "照流程走完一筆交易，接受成功、停損、沒進場三種結果，並為流程評分。" },
    { id: "of-psy", short: "交易心理", title: "交易心理與紀律：知道不等於做到", min: 12, can: "認出報復性交易、移動停損、FOMO、賭徒謬誤，用每日上限、檢查清單和日誌擋住它們。" }] };
  const OPC = { key: "of-course-op-v1", name: "選擇權", cls: "gamma", lessons: [
    { id: "op-1", short: "買權與賣權", title: "買權與賣權：到期損益與對沖", min: 15, can: "畫出四種基本部位的到期損益，用買 Put 幫期貨部位買保險。" },
    { id: "op-2", short: "時間價值", title: "權利金：內含價值、時間價值與 Theta", min: 15, can: "把權利金拆成兩部分，看懂時間價值怎麼隨到期加速流失。" },
    { id: "op-3", short: "Delta 與 Gamma", title: "Delta 與 Gamma：速度與加速度", min: 15, can: "說出 Delta、Gamma 的意思，以及負 Gamma 為什麼要追著價格對沖。" },
    { id: "op-4", short: "隱含波動率", title: "隱含波動率與 Vega：市場在定價什麼", min: 15, can: "解釋 IV 怎麼影響權利金、換算預期範圍，認出 IV Crush。" },
    { id: "op-skew", short: "波動率偏斜", title: "波動率偏斜：為什麼價外 Put 比較貴", min: 12, can: "看懂指數的左高右低偏斜，以及它對權利金和 GEX 的影響。" },
    { id: "op-5", short: "市商帳本", title: "市商的對沖帳本：彈簧和雪球從哪來", min: 15, can: "跟著帳本算出市商要買賣幾口期貨，分辨正、負 Gamma 的對沖方向。" },
    { id: "op-6", short: "從 OI 到 GEX", title: "從未平倉量到 GEX：牆與 Flip 怎麼算", min: 15, can: "從選擇權鏈的未平倉量算出 GEX 長條、Call Wall、Put Wall 與 Flip。" },
    { id: "op-7", short: "到期日效應", title: "到期日效應：0DTE、釘住與牆的消失", min: 12, can: "說出 Gamma 隨到期日怎麼變，以及結算後關鍵區為什麼會重畫。" },
    { id: "op-vc", short: "Vanna 與 Charm", title: "Vanna 與 Charm：IV 和時間也會逼市商買賣", min: 12, can: "解釋 IV 下降、時間流逝為什麼會讓市商買回期貨。" },
    { id: "op-8", short: "GEX 地形圖", title: "GEX 地形圖：山頂、谷底與橫切面", min: 12, can: "看懂 GEX 的 3D 地形和橫切面，說出價格為什麼會在谷底黏住、越過山頂會加速。" },
    { id: "op-real", short: "真實地形", title: "真實地形：用每日紀錄對照走勢", min: 12, can: "把 QQQ 的 GEX 換算成 NQ，並誠實地和隔天實際走勢對照。" },
    { id: "op-dex", short: "DEX 與 GammaLens", title: "DEX 與怎麼讀 GammaLens", min: 15, can: "說出 DEX 和 GEX 的差別，讀懂 GammaLens 的線並避開三個常見陷阱。" }] };
  const TRACKS = [OFC, OPC, SOP];
  const LESSONS = SOP.lessons;
  const prog = (C) => store.get(C.key, { done: {} });
  function setDone(C, id) { const p = prog(C); p.done[id] = true; store.set(C.key, p); }
  function isDone(C, id) { return !!prog(C).done[id]; }
  function nextAfter(C, i) {
    if (C.lessons[i + 1]) return { l: C.lessons[i + 1], label: "下一關：" + C.lessons[i + 1].short };
    const t = TRACKS[TRACKS.indexOf(C) + 1];
    return t ? { l: t.lessons[0], label: "下一條路線：" + t.name } : null;
  }

  /* ---------- shared pieces ---------- */
  const T = (word, def) => `<span class="term" tabindex="0" data-tip="${def.replace(/"/g, "&quot;")}">${word}</span>`;
  function strip(C, cur) {
    return `<nav class="lvl" aria-label="${C.name}閱讀進度">${C.lessons.map((l, i) => `<a href="#${l.id}" class="lvl-i${isDone(C, l.id) ? " done" : ""}${i === cur ? " cur" : ""}"${i === cur ? ' aria-current="page"' : ""}><span class="lvl-n">${isDone(C, l.id) ? "✓" : i + 1}</span><span class="lvl-t">${l.short}</span></a>`).join("")}</nav>`;
  }
  function foot(C, i) {
    const nx = nextAfter(C, i);
    return `<div class="lesson-foot" id="lf"><p class="lf-status"></p><div class="btn-row"><button class="btn" id="lf-mark" type="button">標記本關完成</button>${nx ? `<a class="btn primary" href="#${nx.l.id}">${nx.label}</a>` : `<a class="btn primary" href="#learn">回圖解地圖</a>`}<a class="btn" href="#learn">圖解地圖</a></div></div>`;
  }
  function remember(t) { return `<div class="remember"><b class="r-h">一句話記住</b>${t}</div>`; }
  function quizHTML(qs, pre) {
    return qs.map((q, k) => `<div class="quiz" data-q="${pre}${k}">${q.card ? `<div class="q-card">${q.card.map((c) => `<div class="qc"><b>${c[0]}</b>${c[1]}</div>`).join("")}</div>` : ""}<p class="q-t"><span class="q-tag">${q.tag || "小測驗"}</span>${q.q}</p><div class="q-opts">${q.o.map((o, j) => `<button class="q-opt" type="button" data-j="${j}">${o[0]}</button>`).join("")}</div><div class="q-fb" aria-live="polite"></div></div>`).join("");
  }
  // Wire quizzes and the footer. Lesson completes when every quiz has been answered correctly once.
  function mountLesson(C, root, i, qs, pre, onScore) {
    const id = C.lessons[i].id, solved = new Set();
    const lf = $(root, "#lf");
    function paintFoot() {
      const d = isDone(C, id);
      lf.classList.toggle("is-done", d);
      $(lf, ".lf-status").textContent = d ? "本關完成 ✓" : qs.length ? `答對本關 ${qs.length} 題小測驗就算完成（目前 ${solved.size} / ${qs.length}）` : "看完就按「標記本關完成」。";
      root.querySelectorAll(".lvl-i").forEach((a, k) => { const dn = isDone(C, C.lessons[k].id); a.classList.toggle("done", dn); $(a, ".lvl-n").textContent = dn ? "✓" : k + 1; });
    }
    root.querySelectorAll(".quiz").forEach((box) => {
      if (!box.dataset.q.startsWith(pre)) return;
      const k = +box.dataset.q.slice(pre.length), q = qs[k]; let first = true;
      box.addEventListener("click", (e) => {
        const b = e.target.closest(".q-opt"); if (!b) return;
        const o = q.o[+b.dataset.j];
        box.querySelectorAll(".q-opt").forEach((x) => x.classList.remove("ok", "bad"));
        b.classList.add(o[1] ? "ok" : "bad");
        $(box, ".q-fb").innerHTML = `<b class="${o[1] ? "ok" : "bad"}">${o[1] ? "答對了。" : "再想想。"}</b>${o[2]}`;
        if (onScore && first) onScore(k, o[1]);
        first = false;
        if (o[1]) { solved.add(k); box.classList.add("solved"); if (solved.size === qs.length) setDone(C, id); }
        paintFoot();
      });
    });
    $(root, "#lf-mark").addEventListener("click", () => { setDone(C, id); paintFoot(); });
    paintFoot();
    window.OF.bindTips(root);
  }
  // Standard lesson page: strip + body + quizzes + remember + footer.
  function lesson(C, i, o) {
    if (typeof i === "string") i = C.lessons.findIndex((x) => x.id === i);
    const l = C.lessons[i];
    return { title: l.title, lede: o.lede, chips: [[C.cls, C.name], ["", `第 ${i + 1} 關　約 ${l.min} 分鐘`]],
      html: `${strip(C, i)}${o.body}${quizHTML(o.quiz, o.pre)}${remember(o.remember)}${foot(C, i)}`,
      mount(root) { if (o.mount) o.mount(root); mountLesson(C, root, i, o.quiz, o.pre); } };
  }
  // rAF loop that stops itself once its element leaves the page.
  function loop(el, step) {
    let last = performance.now(), on = true;
    function f(now) { if (!document.body.contains(el)) return; const dt = Math.max(0, Math.min(64, now - last)); last = now; if (on) step(dt); requestAnimationFrame(f); }
    requestAnimationFrame(f);
    return { play() { on = true; }, pause() { on = false; }, get on() { return on; } };
  }
  function rng(seed) { let a = seed >>> 0; return () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  function gauss(r) { const u = Math.max(1e-9, r()), v = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); }
  function interp(keys, i) { for (let k = 1; k < keys.length; k++) if (i <= keys[k][0]) { const [x0, y0] = keys[k - 1], [x1, y1] = keys[k]; return y0 + ((y1 - y0) * (i - x0)) / (x1 - x0); } return keys[keys.length - 1][1]; }

  window.COURSE = { nextAfter, setDone, prog, SOP, OFC, OPC, TRACKS, LESSONS, T, strip, foot, remember, quizHTML, mountLesson, lesson, loop, rng, gauss, interp, nf, sgn, RM, store, isDone, $ };

  /* ---------- course map ---------- */
  PAGES.learn = {
    title: "訂單流與選擇權　圖解地圖",
    lede: "三條路線，建議依序讀：先看懂訂單流，再看選擇權和市商對沖，最後用整合 SOP 把兩邊串起來。每關一張會動的圖、一個可以自己拉的模擬器、幾題小測驗。名詞第一次出現時，把滑鼠移上去就有白話解釋。",
    chips: [["buy", `訂單流 ${OFC.lessons.length} 關`], ["gamma", `選擇權 ${OPC.lessons.length} 關`], ["sell", `整合 SOP ${SOP.lessons.length} 關`], ["", "進度存在這個瀏覽器"]],
    html: `<div class="start-cta"><div style="flex:1;min-width:220px"><div class="sc-t" id="lm-next-t"></div><div class="sc-d" id="lm-next-d"></div><div class="prog" aria-hidden="true"><i id="lm-bar" style="width:0"></i></div><div class="small" id="lm-count"></div></div><a class="btn primary" id="lm-go" href="#of-1">開始</a></div>
<div id="lm-tracks"></div>
<div class="prose"><p class="small">例子都是虛構或改寫過的數字。所有「劇本」都是待驗證的假設。</p>
<p><button class="btn" id="lm-reset" type="button">重設全部進度</button> <span class="small" id="lm-msg"></span></p></div>`,
    mount(root) {
      function paint() {
        const all = TRACKS.flatMap((C) => C.lessons.map((l) => ({ C, l })));
        const n = all.filter((x) => isDone(x.C, x.l.id)).length, nx = all.find((x) => !isDone(x.C, x.l.id));
        $(root, "#lm-bar").style.width = (n / all.length) * 100 + "%";
        $(root, "#lm-count").textContent = `已完成 ${n} / ${all.length} 關`;
        $(root, "#lm-next-t").textContent = nx ? (n ? "繼續：" : "從這裡開始：") + nx.C.name + "　" + nx.l.short : "全部完成";
        $(root, "#lm-next-d").textContent = nx ? nx.l.can : "可以回頭重玩任何一關，或到「C 整合」用檢查清單和交易紀錄練習。";
        const go = $(root, "#lm-go"); go.href = "#" + (nx ? nx.l.id : "cx-sop"); go.textContent = nx ? (n ? "繼續閱讀" : "開始第一關") : "前往整合 SOP";
        $(root, "#lm-tracks").innerHTML = TRACKS.map((C, ti) => {
          const d = C.lessons.filter((l) => isDone(C, l.id)).length, tn = C.lessons.find((l) => !isDone(C, l.id));
          return `<div class="prose"><h2>路線 ${ti + 1}　${C.name}　<span class="small" style="font-family:var(--font-body);font-weight:400">${d} / ${C.lessons.length} 關</span></h2></div>
          <ol class="cmap">${C.lessons.map((l, i) => `<li class="${isDone(C, l.id) ? "done" : l === tn && nx && nx.C === C ? "next" : ""}"><span class="lvl-n">${isDone(C, l.id) ? "✓" : i + 1}</span><a class="cm" href="#${l.id}"><div class="cm-t">${l.title}</div><div class="cm-d">讀完你能：${l.can}</div><div class="cm-m">約 ${l.min} 分鐘${isDone(C, l.id) ? "　·　已完成" : ""}</div></a></li>`).join("")}</ol>`;
        }).join("");
      }
      paint();
      $(root, "#lm-reset").addEventListener("click", () => { TRACKS.forEach((C) => store.set(C.key, { done: {} })); paint(); $(root, "#lm-msg").textContent = "已重設。"; });
    }
  };

  /* ---------- lesson 1: two layers ---------- */
  const L1Q = [
    { q: "選擇權資料（GEX、Call Wall、Put Wall）能直接告訴你「這一分鐘是誰在主動買」嗎？", o: [
      ["可以，Call Wall 附近的成交就是市商", false, "選擇權的未平倉量一天才更新一次，它只能告訴你「哪些價位可能有對沖」。此刻誰在主動，要看訂單流。"],
      ["不行，那是訂單流的工作", true, "選擇權層給你地圖（在哪裡等），訂單流層告訴你此刻誰在推（要不要動手）。"],
      ["只有開盤第一小時可以", false, "跟時段無關。選擇權資料本身就沒有逐筆成交的資訊。"]] },
    { q: "價格離最近的關鍵區還有 150 點，Footprint 卻出現一根很漂亮的買方失衡。照這套流程，你應該？", o: [
      ["立刻追多，訊號很強", false, "訊號再強，位置不對就不做。這套流程是先有位置，才看訊號。"],
      ["觀望，等價格走到關鍵區再看訂單流", true, "第三步就是「等價格到區」。不在區內的訊號，不在這套系統的範圍內。"],
      ["反向做空，因為失衡通常會失敗", false, "沒有證據支持「失衡通常會失敗」。不在區內，就是不做。"]] }
  ];
  PAGES["learn-1"] = {
    title: LESSONS[0].title,
    lede: "整套方法只有一個核心：選擇權幫你畫出「該在哪裡等」，訂單流告訴你「現在要不要動手」。下面這張圖會自己跑，你也可以拖時間軸。",
    chips: [["", "第 1 關　約 6 分鐘"]],
    html: `${strip(SOP, 0)}
<div class="scene"><div class="scene-h"><h3>一段走勢，兩層一起看</h3><p class="small">青綠色帶＝選擇權畫出的關鍵區。價格進區時，右邊換訂單流上場。</p></div>
<div class="scene-grid"><svg id="l1-svg" viewBox="0 0 560 300" role="img" aria-label="價格在兩道牆之間移動的動畫"></svg><div class="side" id="l1-side"></div></div>
<div class="ctrl-row"><button class="btn" id="l1-play" type="button">暫停</button><label class="small" for="l1-t">時間軸</label><input id="l1-t" type="range" min="0" max="300" value="0"></div></div>

<div class="prose"><h2>為什麼要看兩層？</h2>
<p>開車時你會同時看導航和擋風玻璃。導航告訴你前面哪裡可能塞車，擋風玻璃告訴你眼前的車在做什麼。只看導航，會在空蕩蕩的路上亂踩煞車；只看前車，不知道前面有收費站。</p></div>
<div class="duo">
<div class="op"><h4>選擇權層（導航）</h4>告訴你哪些價位，${T("市商", "賣選擇權給大家的造市商。他們不想賭方向，所以會用期貨對沖。")}可能因為對沖而大量買賣。
<dl><dt>回答</dt><dd>在哪裡等？今天波動大還是小？</dd><dt>更新</dt><dd>一天一次（盤前）</dd><dt>看不到</dt><dd>此刻誰在買、誰在賣</dd></dl></div>
<div class="of"><h4>訂單流層（擋風玻璃）</h4>用 ${T("Footprint", "把每根 K 棒拆開，顯示每個價位有多少主動買、多少主動賣的圖。")}看每個價位的主動買賣。
<dl><dt>回答</dt><dd>現在是誰在推？推得動嗎？</dd><dt>更新</dt><dd>即時（每根 K 棒）</dd><dt>看不到</dt><dd>成交的人是不是市商</dd></dl></div></div>

<div class="prose"><h2>整套流程只有五步</h2><p>後面每一關教一步。點下去可以直接跳過去。</p></div>
<div class="flow">
<a class="op" href="#learn-2"><span class="k">第 1 步　選擇權</span><b>看環境</b>今天是「彈簧」還是「雪球」？</a>
<a class="op" href="#learn-3"><span class="k">第 2 步　選擇權</span><b>畫關鍵區</b>盤前在梯子上標出牆和分界線。</a>
<a class="of" href="#learn-4"><span class="k">第 3 步　紀律</span><b>等價格到區</b>不在區內就不做事。</a>
<a class="of" href="#learn-5"><span class="k">第 4 步　訂單流</span><b>看確認</b>吸收還是突破？</a>
<a class="rk" href="#learn-6"><span class="k">第 5 步　風險</span><b>停損與目標</b>先算好再按下單。</a></div>

${quizHTML(L1Q, "l1-")}
${remember("選擇權告訴你<b>在哪裡等</b>，訂單流告訴你<b>要不要動手</b>。少了任何一層，都只是在猜。")}
${foot(SOP, 0)}`,
    mount(root) {
      const svg = $(root, "#l1-svg"), side = $(root, "#l1-side"), N = 300;
      const X = (i) => 40 + (i / N) * 505, Y = (p) => 285 - p * 2.7;
      const keys = [[0, 47], [70, 82], [85, 79], [100, 84], [125, 80], [190, 18], [205, 21], [220, 15], [240, 19], [300, 45]];
      const P = Array.from({ length: N + 1 }, (_, i) => interp(keys, i) + 1.5 * Math.sin(i * 0.7) + 1.1 * Math.sin(i * 1.9 + 1) + 0.7 * Math.sin(i * 3.3));
      const bands = [{ k: "cw", lo: 77, hi: 88, name: "Call Wall　上方的牆" }, { k: "pw", lo: 12, hi: 23, name: "Put Wall　下方的牆" }];
      svg.innerHTML = `
        ${[0, 25, 50, 75, 100].map((p) => `<line x1="40" x2="545" y1="${Y(p)}" y2="${Y(p)}" style="stroke:var(--line)"/>`).join("")}
        ${bands.map((b) => `<rect id="l1-${b.k}" x="40" width="505" y="${Y(b.hi)}" height="${Y(b.lo) - Y(b.hi)}" rx="4" style="fill:var(--gamma);opacity:.14"/><text x="48" y="${Y(b.hi) + 15}" style="fill:var(--gamma-ink);font-weight:600">${b.name}</text>`).join("")}
        <line x1="40" x2="545" y1="${Y(50)}" y2="${Y(50)}" style="stroke:var(--gamma-ink);stroke-dasharray:6 5"/><text x="540" y="${Y(50) - 6}" text-anchor="end" style="fill:var(--gamma-ink)">Flip　正負 Gamma 分界</text>
        <text x="8" y="${Y(100) + 4}">價格高</text><text x="8" y="${Y(0)}">價格低</text>
        <polyline id="l1-path" fill="none" style="stroke:var(--buy);stroke-width:2.2;stroke-linejoin:round"/>
        <circle id="l1-dot" r="5.5" style="fill:var(--buy);stroke:var(--surface);stroke-width:2"/>`;
      const path = $(root, "#l1-path"), dot = $(root, "#l1-dot"), rng = $(root, "#l1-t"), btn = $(root, "#l1-play");
      const fpRows = (top) => {
        const rows = top ? [["28", "310"], ["40", "420"], ["55", "260"], ["60", "140"], ["70", "90"]] : [["90", "70"], ["140", "60"], ["260", "55"], ["420", "40"], ["310", "28"]];
        return `<table class="fp" aria-label="Footprint 示意"><thead><tr><td>主動賣</td><td></td><td>主動買</td></tr></thead><tbody>${rows.map((r, j) => `<tr><td class="b${!top && j > 1 ? " hot" : ""}">${r[0]}</td><td class="px">${top ? "↑" : ""}${j === (top ? 0 : 4) ? "極點" : ""}</td><td class="a${top && j < 3 ? " hot" : ""}">${r[1]}</td></tr>`).join("")}</tbody></table>`;
      };
      const SIDES = {
        none: `<span class="tagline wait">選擇權層</span><h4>還沒到區</h4><p style="margin:0 0 8px">價格在兩道牆中間。這時候<b>什麼都不做</b>，只看它往哪道牆走。</p><p class="small" style="margin:0">中間的虛線是 Flip。價格在它上面時，市商對沖像彈簧，波動偏小；在下面時像雪球，波動偏大（第 2 關會玩到）。</p>`,
        cw: `<span class="tagline go">換訂單流上場</span><h4>到上方的牆了</h4>${fpRows(true)}<p style="margin:8px 0 0">最上面幾格<b>主動買很多，價格卻上不去</b>：有人在上面一直賣，把買單吃掉。這叫「吸收」，是考慮做空的線索。</p>`,
        pw: `<span class="tagline go">換訂單流上場</span><h4>到下方的牆了</h4>${fpRows(false)}<p style="margin:8px 0 0">最下面幾格<b>主動賣很多，價格卻跌不下去</b>：有人在下面一直接。這是考慮做多的線索。</p>`
      };
      let t = 0, mode = "";
      function draw() {
        const i = Math.round(t);
        path.setAttribute("points", P.slice(0, i + 1).map((p, k) => `${X(k).toFixed(1)},${Y(p).toFixed(1)}`).join(" "));
        dot.setAttribute("cx", X(i)); dot.setAttribute("cy", Y(P[i]));
        const m = P[i] >= 77 ? "cw" : P[i] <= 23 ? "pw" : "none";
        bands.forEach((b) => $(root, "#l1-" + b.k).style.opacity = b.k === m ? 0.32 : 0.14);
        if (m !== mode) { mode = m; side.innerHTML = SIDES[m]; }
        rng.value = i;
      }
      const lp = loop(svg, (dt) => { t += dt * 0.021; if (t > N) t = 0; draw(); });
      if (RM) { lp.pause(); t = 92; btn.textContent = "播放"; }
      draw();
      btn.addEventListener("click", () => { if (lp.on) { lp.pause(); btn.textContent = "播放"; } else { if (t >= N) t = 0; lp.play(); btn.textContent = "暫停"; } });
      rng.addEventListener("input", () => { lp.pause(); btn.textContent = "播放"; t = +rng.value; draw(); });
      mountLesson(SOP, root, 0, L1Q, "l1-");
    }
  };

  /* ---------- lesson 2: spring vs snowball ---------- */
  const L2Q = [
    { q: "淨 GEX 是很大的正值。新聞讓價格突然急漲，市商最可能怎麼對沖？", o: [
      ["追著買期貨，讓漲勢加速", false, "那是負 Gamma 的行為。正 Gamma 時，價格越漲，市商手上的多頭部位越大，要賣出才能維持中性。"],
      ["賣出期貨，把價格往回壓", true, "正 Gamma＝彈簧：漲了賣、跌了買，對沖方向和價格相反，所以波動被壓小。"],
      ["不做任何事", false, "市商要維持方向中性，價格大幅變動時一定要調整。"]] },
    { q: "今天淨 GEX 為負，價格在 Flip 下方。下面哪一個想法最合理？", o: [
      ["波動可能偏大，突破後比較容易延續，部位要縮小", true, "負 Gamma＝雪球：市商順著價格追單。這只是傾向，目前的資料還不夠證明，所以部位縮小是保守做法。"],
      ["波動一定很小，可以放大部位做區間", false, "那是正 Gamma 的假設，而且「一定」太強了。"],
      ["跟正 Gamma 沒有差別，不用看", false, "這一步就是用來決定今天要用哪一種劇本、放多大部位。"]] }
  ];
  PAGES["learn-2"] = {
    title: LESSONS[1].title,
    lede: "市商賣選擇權給大家，但他們不想賭方向，所以會用期貨對沖。對沖的方向，決定了今天的價格比較像被彈簧拉回，還是像雪球越滾越大。",
    chips: [["gamma", "選擇權"], ["", "第 2 關　約 8 分鐘"]],
    html: `${strip(SOP, 1)}
<div class="prose"><h2>先用三句話搞懂市商</h2>
<ol><li>你買 ${T("選擇權", "付一筆權利金，換到「未來可以用某個價格買或賣」的權利。看漲叫 Call，看跌叫 Put。")}時，賣給你的常常是市商。</li>
<li>市商賺的是買賣價差，不想賭漲跌，所以會買賣期貨，讓手上部位對方向保持中性。這叫${T("對沖", "用相反的部位抵銷風險。例如手上偏多，就賣出一些期貨。")}。</li>
<li>價格一動，選擇權的${T("Delta", "選擇權價格跟著期貨變動的比例，也可以看成「相當於幾口期貨」。")}就跟著變，市商就要再調整。Delta 變化的速度叫 ${T("Gamma", "價格每動一點，Delta 會變多少。Gamma 越大，市商要調整的量越大。")}。</li></ol>
<p>把所有履約價的 Gamma 加總，就是${T("淨 GEX", "Net Gamma Exposure：市商整體的 Gamma 部位，以美元表示。正值＝市商手上是正 Gamma，負值＝負 Gamma。")}。重點只有它的正負號：</p></div>
<div class="duo">
<div class="op"><h4>淨 GEX 為正：彈簧</h4><svg viewBox="0 0 300 120" role="img" aria-label="正 Gamma 時價格被拉回中間"><line x1="10" x2="290" y1="60" y2="60" style="stroke:var(--line);stroke-dasharray:4 4"/><path d="M10 60 C40 30,60 30,80 55 S120 88,140 62 S180 36,200 58 S240 78,260 62 L290 60" fill="none" style="stroke:var(--gamma);stroke-width:2.5"/><path d="M70 22 v18 m-5 -6 l5 6 l5 -6" fill="none" style="stroke:var(--sell);stroke-width:2"/><text x="78" y="20" style="font-size:12px;fill:var(--ink-2)">漲了→市商賣</text><path d="M130 100 v-18 m-5 6 l5 -6 l5 6" fill="none" style="stroke:var(--buy);stroke-width:2"/><text x="138" y="112" style="font-size:12px;fill:var(--ink-2)">跌了→市商買</text></svg>
對沖方向和價格相反，價格被拉回中間。<b>假設：波動偏小，容易在牆之間來回。</b></div>
<div class="neg"><h4>淨 GEX 為負：雪球</h4><svg viewBox="0 0 300 120" role="img" aria-label="負 Gamma 時價格越走越遠"><line x1="10" x2="290" y1="60" y2="60" style="stroke:var(--line);stroke-dasharray:4 4"/><path d="M10 62 C50 58,80 66,110 56 S170 40,200 32 S250 14,290 6" fill="none" style="stroke:var(--sell);stroke-width:2.5"/><path d="M190 54 v-18 m-5 6 l5 -6 l5 6" fill="none" style="stroke:var(--buy);stroke-width:2"/><text x="200" y="64" style="font-size:12px;fill:var(--ink-2)">漲了→市商追買</text><path d="M60 92 v18 m-5 -6 l5 6 l5 -6" fill="none" style="stroke:var(--sell);stroke-width:2"/><text x="72" y="104" style="font-size:12px;fill:var(--ink-2)">跌了→市商追賣</text></svg>
對沖方向和價格相同，越推越遠。<b>假設：波動偏大，突破後容易延續。</b></div></div>

<div class="scene"><div class="scene-h"><h3>模擬器：同一組新聞，兩種市商</h3><p class="small">兩邊用完全相同的隨機走勢和新聞衝擊，只差在市商對沖的方向。</p></div>
<div class="duo" style="margin:6px 0 0">
<div class="op" style="padding:10px 12px"><h4 style="font-size:15px">正 Gamma（彈簧）</h4><svg id="l2-pos" viewBox="0 0 320 170" role="img" aria-label="正 Gamma 模擬走勢"></svg><div class="small" id="l2-pos-t"></div></div>
<div class="neg" style="padding:10px 12px"><h4 style="font-size:15px">負 Gamma（雪球）</h4><svg id="l2-neg" viewBox="0 0 320 170" role="img" aria-label="負 Gamma 模擬走勢"></svg><div class="small" id="l2-neg-t"></div></div></div>
<div class="controls" style="margin-top:12px">
<div class="ctl"><label for="l2-s">市商對沖力道 <b id="l2-s-v"></b></label><input id="l2-s" type="range" min="0" max="10" value="6"></div>
<div class="ctl"><label for="l2-n">新聞衝擊（第 30 分鐘） <b id="l2-n-v"></b></label><input id="l2-n" type="range" min="0" max="30" value="15"></div></div>
<div class="btn-row"><button class="btn primary" id="l2-go" type="button">重新播放</button><button class="btn" id="l2-new" type="button">換一組隨機走勢</button></div>
<p class="small" style="margin:6px 0 0">把力道拉到 0，兩邊會一模一樣：沒有對沖流，就沒有彈簧或雪球。這是示意模型，不是真實市場的比例。</p></div>

<div class="honest"><b class="h-h">誠實提醒：</b>「正值波動小、負值波動大」是統計傾向，不是每天都成立。只有幾天的紀錄算不出可靠的相關性，至少累積一兩個月的每日數字再下結論。</div>
${quizHTML(L2Q, "l2-")}
${remember("淨 GEX <b>正＝彈簧</b>（市商反向對沖、波動偏小），<b>負＝雪球</b>（市商順向追單、波動偏大）。它決定今天用哪種劇本和多大部位，不決定方向。")}
${foot(SOP, 1)}`,
    mount(root) {
      const N = 100, W = 320, H = 170, padL = 34, padR = 8, padT = 10, padB = 22;
      let seed = 7, t = 0, A = null, B = null, yr = 10;
      function sim() {
        const r = rng(seed), s = +$(root, "#l2-s").value, news = +$(root, "#l2-n").value;
        const e = Array.from({ length: N }, () => gauss(r) * 1.4); e[30] += news;
        const kp = 0.02 * s, kn = 0.0028 * s; A = [0]; B = [0];
        for (let i = 1; i < N; i++) { A.push(A[i - 1] + e[i] - kp * A[i - 1]); B.push(B[i - 1] + e[i] + kn * B[i - 1]); }
        yr = Math.max(10, ...A.map(Math.abs), ...B.map(Math.abs)) * 1.1;
        $(root, "#l2-s-v").textContent = s; $(root, "#l2-n-v").textContent = "+" + news + " 點";
      }
      const X = (i) => padL + (i / (N - 1)) * (W - padL - padR), Y = (v) => padT + ((yr - v) / (2 * yr)) * (H - padT - padB);
      function frame(id, arr, col) {
        const i = Math.min(N - 1, Math.floor(t)), svg = $(root, "#" + id), seg = arr.slice(0, i + 1);
        const hi = Math.max(...seg), lo = Math.min(...seg);
        const ticks = [-yr * 0.75, 0, yr * 0.75].map((v) => Math.round(v));
        svg.innerHTML = `${ticks.map((v) => `<line x1="${padL}" x2="${W - padR}" y1="${Y(v)}" y2="${Y(v)}" style="stroke:var(--line)"/><text x="${padL - 4}" y="${Y(v) + 4}" text-anchor="end">${v > 0 ? "+" : ""}${v}</text>`).join("")}
          <line x1="${X(30)}" x2="${X(30)}" y1="${padT}" y2="${H - padB}" style="stroke:var(--ink-3);stroke-dasharray:3 4"/><text x="${X(30) + 4}" y="${H - 6}">新聞</text>
          <rect x="${padL}" width="${W - padL - padR}" y="${Y(hi)}" height="${Math.max(1, Y(lo) - Y(hi))}" style="fill:${col};opacity:.08"/>
          <polyline fill="none" style="stroke:${col};stroke-width:2.2;stroke-linejoin:round" points="${seg.map((v, k) => `${X(k).toFixed(1)},${Y(v).toFixed(1)}`).join(" ")}"/>
          <circle cx="${X(i)}" cy="${Y(arr[i])}" r="4" style="fill:${col}"/>`;
        return { i, hi, lo, v: arr[i], prev: arr[Math.max(0, i - 1)] };
      }
      function act(neg, v) { if (Math.abs(v) < 1) return "價格在起點附近，市商不太需要動作"; const up = v > 0; return neg ? (up ? "價格在上方 → 市商<b>追買</b>，推得更高" : "價格在下方 → 市商<b>追賣</b>，壓得更低") : (up ? "價格在上方 → 市商<b>賣出</b>，往回拉" : "價格在下方 → 市商<b>買進</b>，往回撐"); }
      function draw() {
        const a = frame("l2-pos", A, "var(--gamma)"), b = frame("l2-neg", B, "var(--sell)");
        $(root, "#l2-pos-t").innerHTML = `振幅（最高−最低）：<b>${nf(a.hi - a.lo, 1)}</b> 點　·　${act(false, a.v)}`;
        $(root, "#l2-neg-t").innerHTML = `振幅（最高−最低）：<b>${nf(b.hi - b.lo, 1)}</b> 點　·　${act(true, b.v)}`;
      }
      const lp = loop($(root, "#l2-pos"), (dt) => { if (t < N - 1) { t += dt * 0.03; draw(); } });
      function restart() { sim(); t = RM ? N - 1 : 0; draw(); lp.play(); }
      ["#l2-s", "#l2-n"].forEach((k) => $(root, k).addEventListener("input", () => { sim(); t = N - 1; draw(); }));
      $(root, "#l2-go").addEventListener("click", restart);
      $(root, "#l2-new").addEventListener("click", () => { seed = (seed * 9301 + 49297) % 233280; restart(); });
      restart();
      mountLesson(SOP, root, 1, L2Q, "l2-");
    }
  };

  /* ---------- lesson 3: walls, flip, expected move ---------- */
  const GEX = [[27600, 40], [27500, 90], [27400, 260], [27300, 150], [27200, 110], [27100, 60], [27000, 20], [26900, -30], [26800, -90], [26700, -240], [26600, -180]];
  const CW = 27400, PW = 26700, FLIP = 26950;
  const L3Q = [
    { q: "在 GEX 長條圖上，Call Wall 通常指哪一個價位？", o: [
      ["正 GEX 長條最長的履約價", true, "那是市商對沖量最集中的地方，價格接近時賣壓（對沖）可能最大，常被當成上方阻力。"],
      ["今天的最高價", false, "Call Wall 是盤前從選擇權資料算出來的，跟今天實際走到哪裡無關。"],
      ["負 GEX 最長的履約價", false, "那是 Put Wall 的定義（在這份資料的口徑下）。"]] },
    { q: "NQ 現在 27,000，隱含波動率 20%，只看今天（1 天）。預期波動大約是多少點？（公式：價格 × IV × √(天數÷365)）", o: [
      ["約 ±280 點", true, "27,000 × 0.20 × √(1/365) ≈ 27,000 × 0.20 × 0.052 ≈ 283 點。理論上約 68% 的日子收在這個範圍內。"],
      ["約 ±5,400 點", false, "那是忘了乘 √(1/365)，等於用了一整年的波動。"],
      ["約 ±54 點", false, "差了 5 倍左右，可能把 √(1/365) 算成 1/365 了。"]] }
  ];
  PAGES["learn-3"] = {
    title: LESSONS[2].title,
    lede: "盤前要做的事只有一件：把幾個價位標在梯子上。下面是一張示意的 GEX 長條圖，拖動價格線，看看每個位置代表什麼。",
    chips: [["gamma", "選擇權"], ["", "第 3 關　約 8 分鐘"]],
    html: `${strip(SOP, 2)}
<div class="scene"><div class="scene-h"><h3>拖動價格，看你站在哪一區</h3><p class="small">右側長條＝正 GEX，左側＝負 GEX。數字是示意，不是今天的資料。</p></div>
<div class="scene-grid"><svg id="l3-svg" viewBox="0 0 520 400" role="img" aria-label="依履約價排列的 GEX 長條圖與價格線"></svg><div class="side" id="l3-side"></div></div>
<div class="controls" style="margin-top:10px">
<div class="ctl"><label for="l3-p">目前價格 <b id="l3-p-v"></b></label><input id="l3-p" type="range" min="26560" max="27640" step="10" value="27150"></div>
<div class="ctl"><label for="l3-iv">隱含波動率 IV <b id="l3-iv-v"></b></label><input id="l3-iv" type="range" min="10" max="40" value="20"></div>
<div class="ctl"><label for="l3-d">看幾天 <b id="l3-d-v"></b></label><input id="l3-d" type="range" min="1" max="5" value="1"></div></div></div>

<div class="prose"><h2>梯子上要標的四樣東西</h2></div>
<div class="duo">
<div class="op"><h4>Call Wall（上方的牆）</h4>正 GEX 最大的履約價。價格靠近時，正 Gamma 市商賣出對沖的量最大。<br><b>劇本假設：</b>上漲容易受阻，等訂單流看有沒有吸收。</div>
<div class="neg"><h4>Put Wall（下方的牆）</h4>負 GEX 最大的履約價。可能有支撐；但一旦收盤跌破，市商可能追賣。<br><b>劇本假設：</b>守住偏多，跌破小心加速。</div>
<div class="op"><h4>Flip（分界線）</h4>淨 GEX 由負轉正的價位。上方像彈簧，下方像雪球。<br><b>劇本假設：</b>價格在 Flip 附近來回時最難做，縮小部位或觀望。</div>
<div class="of"><h4>預期波動（EM）</h4>價格 × IV × √(天數÷365)。選擇權市場「定價」的正常波動範圍。<br><b>用法：</b>目標超過 EM 太多，就要懷疑是不是太貪心。</div></div>
<div class="prose"><p class="small">這裡的 Flip 用「長條由負轉正的地方」來看，是簡化版。正式的算法是把價格假設往上下移動，重算總 GEX，找出它變號的價位，結果可能和長條圖看起來不同。</p></div>

<div class="honest"><b class="h-h">誠實提醒：</b>有人做過安慰劑測試：把位階隨機平移後，價格碰到的距離和真實位階差不多（一次 5 天的小樣本裡，NQ 平均 72.8 點 vs 平移後 74.2 點）。也就是說，<b>目前還沒有證據顯示這些牆比隨機價位更準</b>。所以第 4 步一定要用訂單流確認，不能看到牆就進場。<br>真實資料也比示意圖亂：常見的情況是淨 GEX 是負的，但同一份資料的 Flip 卻在價格下方，兩件事彼此矛盾，代表口徑不同或資料有問題。遇到這種情況，就當作「環境不明」。</div>
${quizHTML(L3Q, "l3-")}
${remember("盤前標四樣：<b>Call Wall、Put Wall、Flip、預期波動</b>。它們是「該在哪裡等」，不是「在哪裡進場」。")}
${foot(SOP, 2)}`,
    mount(root) {
      const svg = $(root, "#l3-svg"), lo = 26550, hi = 27650, top = 14, bot = 386;
      const Y = (p) => top + ((hi - p) / (hi - lo)) * (bot - top), cx = 300, sx = 0.62;
      function zone(p) {
        if (Math.abs(p - CW) <= 40) return ["在 Call Wall 附近", "正 Gamma 區的最上緣。市商賣出對沖的量在這裡最大，假設上漲容易受阻。", "等訂單流：上方有沒有「主動買很多、價格不漲」的吸收？有才考慮做空。"];
        if (p > CW + 40) return ["已站上 Call Wall", "牆被突破。若收盤守在牆外、量和 Delta 同方向，原本的阻力假設就失效。", "不要逆勢放空；等回測牆的位置，看訂單流是否變成支撐。"];
        if (Math.abs(p - FLIP) <= 40) return ["在 Flip 附近", "彈簧和雪球的交界，環境在兩者之間切換，最容易來回洗。", "縮小部位或觀望，等 5 分 K 連續收盤離開 Flip 再說。"];
        if (p > FLIP) return ["Flip 上方：正 Gamma 區", "彈簧環境，假設波動偏小，價格容易在兩道牆之間來回。", "中間地帶不做；等價格接近 Call Wall 或回到 Flip。"];
        if (Math.abs(p - PW) <= 40) return ["在 Put Wall 附近", "負 Gamma 最集中的地方。可能有支撐，但跌破後市商追賣可能讓跌勢加速。", "看訂單流：下方吸收（賣很多、跌不下去）偏多；收盤跌破且賣方失衡堆疊，就不要接。"];
        if (p < PW - 40) return ["已跌破 Put Wall", "最深的負 Gamma 區，波動可能放大。", "不要逆勢接刀；只考慮順勢，而且部位要小。"];
        return ["Flip 下方：負 Gamma 區", "雪球環境，假設波動偏大，突破後比較容易延續。", "等價格到 Put Wall 或回到 Flip；中間的突破訊號要更嚴格。"];
      }
      function draw() {
        const p = +$(root, "#l3-p").value, iv = +$(root, "#l3-iv").value / 100, d = +$(root, "#l3-d").value;
        const em = p * iv * Math.sqrt(d / 365);
        $(root, "#l3-p-v").textContent = nf(p); $(root, "#l3-iv-v").textContent = Math.round(iv * 100) + "%"; $(root, "#l3-d-v").textContent = d + " 天";
        const bh = 22;
        svg.innerHTML = `
          <rect x="58" width="452" y="${Y(Math.min(hi, p + em))}" height="${Y(Math.max(lo, p - em)) - Y(Math.min(hi, p + em))}" style="fill:var(--buy);opacity:.08"/>
          <text x="64" y="${Math.max(top + 12, Y(p + em) + 14)}" style="fill:var(--buy-ink)">預期波動上緣 +${nf(em)}</text>
          <text x="64" y="${Math.min(bot - 4, Y(p - em) - 6)}" style="fill:var(--buy-ink)">預期波動下緣 −${nf(em)}</text>
          <line x1="${cx}" x2="${cx}" y1="${top}" y2="${bot}" style="stroke:var(--ink-3)"/>
          ${GEX.map(([k, v]) => { const w = Math.abs(v) * sx, x = v >= 0 ? cx : cx - w, y = Y(k) - bh / 2, cw = k === CW || k === PW;
            return `<rect x="${x}" y="${y}" width="${Math.max(2, w)}" height="${bh}" rx="3" style="fill:${v >= 0 ? "var(--gamma)" : "var(--sell)"};opacity:${cw ? 1 : 0.55}" data-tip="履約價 ${nf(k)}<br>淨 GEX ${v > 0 ? "+" : ""}${v}M"/>
              <text x="52" y="${Y(k) + 4}" text-anchor="end">${nf(k)}</text>`; }).join("")}
          <text x="${cx + 260 * sx + 6}" y="${Y(CW) + 4}" style="fill:var(--gamma-ink);font-weight:600">Call Wall</text>
          <text x="${cx - 240 * sx - 6}" y="${Y(PW) + 4}" text-anchor="end" style="fill:var(--sell-ink);font-weight:600">Put Wall</text>
          <line x1="58" x2="510" y1="${Y(FLIP)}" y2="${Y(FLIP)}" style="stroke:var(--gamma-ink);stroke-dasharray:6 5"/>
          <text x="506" y="${Y(FLIP) - 5}" text-anchor="end" style="fill:var(--gamma-ink)">Flip ≈ ${nf(FLIP)}</text>
          <line x1="58" x2="510" y1="${Y(p)}" y2="${Y(p)}" style="stroke:var(--buy);stroke-width:2.5"/>
          <rect x="440" y="${Y(p) - 11}" width="70" height="22" rx="4" style="fill:var(--buy)"/><text x="475" y="${Y(p) + 4}" text-anchor="middle" style="fill:#fff;font-weight:600">${nf(p)}</text>`;
        window.OF.bindTips(svg);
        const z = zone(p), env = p > FLIP + 40 ? "正 Gamma（彈簧）" : p < FLIP - 40 ? "負 Gamma（雪球）" : "不明（在 Flip 附近）";
        $(root, "#l3-side").innerHTML = `<span class="tagline go">你現在在</span><h4>${z[0]}</h4><p style="margin:0 0 8px">${z[1]}</p><p style="margin:0 0 8px"><b>下一步：</b>${z[2]}</p>
          <div class="kpi"><div class="k-l">環境</div><div class="k-v" style="font-size:16px">${env}</div></div>
          <div class="kpi" style="margin-top:6px"><div class="k-l">離 Call Wall／Put Wall</div><div class="k-v" style="font-size:16px">${sgn(CW - p)}　／　${sgn(PW - p)} 點</div></div>
          <div class="kpi" style="margin-top:6px"><div class="k-l">預期波動（${d} 天）</div><div class="k-v" style="font-size:16px">±${nf(em)} 點</div><div class="k-n">${nf(p - em)} ～ ${nf(p + em)}</div></div>`;
      }
      ["#l3-p", "#l3-iv", "#l3-d"].forEach((k) => $(root, k).addEventListener("input", draw));
      draw();
      mountLesson(SOP, root, 2, L3Q, "l3-");
    }
  };
})();
