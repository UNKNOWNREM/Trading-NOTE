/* 路線 2 序章：衍生品是什麼、為什麼要對沖、各商品用什麼對沖、選擇權為什麼在疫情後崛起 */
(function () {
  const PAGES = (window.__PAGES = window.__PAGES || {});
  const { lerp, ease, seg, cards, chip } = window.KIT;
  const B = (F, K, d, iv = 0.2) => window.OF.b76(F, K, iv, d / 365);
  const fx = (v, d = 0) => (+v).toLocaleString(undefined, { minimumFractionDigits: d, maximumFractionDigits: d });
  const C0 = { key: "of-course-op0", name: "選擇權", cls: "gamma", lessons: [{ id: "op-0", short: "序章", title: "序章：衍生品、對沖，與選擇權為什麼越來越重要", min: 15, can: "說出衍生品是什麼、對沖的核心邏輯、各種部位用什麼對沖，以及選擇權疫情後成長的真實樣貌。" }] };

  // 資料（來源見頁尾）
  const SIZE = { eq: 157.8, bd: 160.7, otc: 846, gmv: 21.8 };
  const OTC = [["利率", 669.5, "f-gamma-soft"], ["外匯", 148.7, "f-buy-soft"], ["股權", 11.9, "f-sell-soft"], ["信用", 11.3, "f-surface"], ["商品", 2.8, "f-hl"]];
  const US = [[2020, 7.52], [2021, 9.93], [2022, 10.38], [2023, 11.15], [2024, 12.2], [2025, 15.21]];
  const R = (v, k) => k * Math.sqrt(v);

  function bubble(x, y, r, cls, lab, val, op = 1, inside = true) {
    return `<g opacity="${op}"><circle cx="${x}" cy="${y}" r="${Math.max(1, r)}" class="${cls}"/><text x="${x}" y="${inside && r > 34 ? y - 4 : y + r + 18}" text-anchor="middle" class="t-ink t-b">${lab}</text><text x="${x}" y="${inside && r > 34 ? y + 18 : y + r + 38}" text-anchor="middle" class="t-mute">${val}</text></g>`;
  }
  // 損益線：x 軸是標的價格變化
  function pnl(lines, t, o = {}) {
    const X = (v) => lerp(90, 590, (v + 10) / 20), Y = (v) => lerp(320, 70, (v + 10) / 20);
    let s = `<line x1="90" x2="590" y1="${Y(0)}" y2="${Y(0)}" class="s-ink"/><line x1="${X(0)}" x2="${X(0)}" y1="60" y2="330" class="s-line"/><text x="590" y="${Y(0) + 22}" text-anchor="end" class="t-mute">標的漲 →</text><text x="90" y="${Y(0) + 22}" class="t-mute">← 標的跌</text><text x="${X(0) + 6}" y="74" class="t-mute">賺</text><text x="${X(0) + 6}" y="326" class="t-mute">賠</text>`;
    lines.forEach(([f, cls, lab, lx], k) => {
      const up = seg(t, k * 0.3, k * 0.3 + 0.4), pts = [];
      for (let v = -10; v <= 10.001; v += 0.5) pts.push(`${X(v).toFixed(1)},${Y(Math.max(-10, Math.min(10, f(v)))).toFixed(1)}`);
      s += `<polyline points="${pts.slice(0, Math.max(2, Math.round(up * pts.length))).join(" ")}" class="${cls} f-none" stroke-width="3.5"/>`;
      s += `<text x="${X(lx)}" y="${Y(Math.max(-10, Math.min(10, f(lx)))) - 12}" text-anchor="middle" class="${cls.replace("s-", "t-")} t-b" opacity="${seg(t, k * 0.3 + 0.3, k * 0.3 + 0.5)}">${lab}</text>`;
    });
    return s;
  }
  const MAP = [["持有一籃子股票", "指數期貨（NQ、ES）、指數 Put"], ["持有單一股票", "個股選擇權（買 Put）"], ["債券、浮動利率貸款", "公債期貨、利率交換"], ["出口商的美元收入", "外匯遠期、外匯期貨"], ["農夫、礦商、航空公司", "商品期貨與選擇權（穀物、黃金、原油）"], ["持有台股", "台指期、台指選擇權"], ["持有加密貨幣", "期貨、永續合約、選擇權"]];
  function mapPic(t, hl) {
    let s = `<text x="60" y="34" class="t-mute">你怕的風險（現貨部位）</text><text x="360" y="34" class="t-mute">常用的對沖工具（衍生品）</text>`;
    MAP.forEach(([a, b], k) => {
      const y = 50 + k * 44, op = seg(t, k * 0.11, k * 0.11 + 0.25), h = hl === k;
      s += `<g opacity="${op}"><rect x="50" y="${y}" width="250" height="34" rx="8" class="${h ? "f-hl" : "f-surface"} s-line"/><text x="62" y="${y + 22}" class="t-ink t-b">${a}</text><path d="M304 ${y + 17} h44" class="s-ink" stroke-width="2"/><path d="M342 ${y + 11} l6 6 l-6 6" class="s-ink f-none" stroke-width="2"/><rect x="352" y="${y}" width="250" height="34" rx="8" class="${h ? "f-hl" : "f-gamma-soft"}"/><text x="364" y="${y + 22}" class="t-ink">${b}</text></g>`;
    });
    return s;
  }

  const STEPS = [
    { cap: "<b>衍生品</b>：價值「衍生」自別的東西（標的）的合約。標的可以是股票、指數、利率、匯率、黃金、原油。最常見四種：<b>期貨、選擇權、遠期、交換</b>。",
      why: "期貨和選擇權在交易所買賣（標準化、有結算所擔保）；遠期和交換多半是金融機構之間私下簽的（OTC，店頭市場）。你交易的 NQ 就是期貨，NQ 選擇權就是選擇權。", stuck: "衍生品像「演唱會門票的轉售合約」：它本身沒有表演，價值全看那場演唱會。" },
    { cap: "為什麼要有衍生品？市場上主要有三種人：<b>避險者</b>（怕價格變動的人）、<b>投機者</b>（想賺價格變動的人）、<b>造市商</b>（兩邊報價、賺價差的人）。",
      why: "避險者把風險「賣」出去，投機者願意「買」下來換取可能的獲利，造市商讓雙方隨時找得到對手。三者缺一，避險就很難做。", dur: 3000 },
    { cap: "<b>對沖的核心邏輯</b>：持有一個<b>反方向</b>的部位，讓兩邊的損益互相抵銷。現貨賺，衍生品就賠；現貨賠，衍生品就賺。加起來接近<b>持平</b>。",
      why: "對沖不是為了賺錢，是為了把結果變得可預期。代價是：價格往有利方向走時，你也賺不到。", dur: 3600 },
    { cap: "用<b>選擇權</b>對沖不一樣：持有股票＋買一張 <b>Put</b>，下跌有底（最多賠到某個位置），上漲照樣賺。代價是一開始付的<b>權利金</b>。",
      why: "期貨對沖像把門鎖死：風險沒了，機會也沒了。選擇權對沖像買保險：付保費，保住下限、留住上限。這就是很多人願意花錢買 Put 的原因（第 1 關會細講）。", dur: 3600 },
    { cap: "想一想：航空公司最怕油價大漲（燃料成本暴增）。",
      q: { t: "它可以用什麼對沖？", o: [
        ["買原油期貨或原油的 Call", true, "油價漲時，期貨或 Call 賺錢，剛好抵銷燃料成本增加。買 Call 還保留了油價下跌時省錢的好處。"],
        ["放空原油期貨", false, "放空是賭油價跌，油價漲時兩邊一起虧，風險更大。"],
        ["買航空公司的股票", false, "油價漲時航空股通常也跌，不是反方向的部位。"]] } },
    { cap: "規模有多大？用<b>圓的面積</b>比：全球股票市值約 <b>158 兆</b>美元、債券約 <b>161 兆</b>；店頭衍生品的<b>名目金額</b>約 <b>846 兆</b>，超過股票加債券的兩倍。",
      why: "股票和債券是 2025 年底的數字（SIFMA），店頭衍生品是 2025 年 6 月底（BIS）。圓的面積和金額成正比，所以半徑是金額的平方根。", dur: 3600 },
    { cap: "但<b>名目金額不等於真的錢</b>。名目是合約「對應」多少金額；如果今天把所有店頭衍生品結清，真正要付的市值只有約 <b>21.8 兆</b>（總市值）。",
      why: "例如一筆 1 億美元的利率交換，雙方實際交換的只是利息差額。很多合約也互相抵銷。所以「衍生品比全世界的股票大好幾倍」這種說法，要先問比的是哪個數字。", dur: 3000 },
    { cap: "店頭衍生品裡，<b>利率</b>衍生品占了大部分（約 670 兆），其次是外匯（約 149 兆）；<b>股權</b>衍生品只有約 12 兆。",
      why: "這是 2025 年底的店頭數字（ISDA 整理 BIS 資料）。股票相關的避險有很大一部分在交易所進行（指數期貨、選擇權），不在這張圖裡。", dur: 3000 },
    { cap: "想一想：新聞說「衍生品市場規模是全球股市的五倍以上」。",
      q: { t: "最需要先釐清什麼？", o: [
        ["比的是名目金額還是市值；名目只是合約對應的金額，不是真的投入或曝險的錢", true, "店頭衍生品名目約 846 兆，但總市值只有約 21.8 兆。數字相差將近 40 倍。"],
        ["這代表衍生品比股票重要五倍", false, "名目金額大，不代表影響力或風險就是那個倍數。"],
        ["這是錯的，衍生品其實很小", false, "名目金額確實很大，只是要知道它代表什麼。"]] } },
    { cap: "<b>各種部位用什麼對沖</b>：原則都一樣，找一個和你的風險<b>反方向</b>、流動性又好的衍生品。",
      why: "選工具時看三件事：跟你的部位連動程度高不高、交易成本和流動性、要不要保留上漲空間（要的話用選擇權）。", dur: 4200 },
    { cap: "<b>對沖會一層一層傳下去</b>：基金買 Put 保護股票 → 市商賣出 Put，自己變得偏多 → 市商放空期貨對沖 → 期貨市場多了賣單。",
      why: "這就是路線 2 後面要講的核心：選擇權的量越大，市商的期貨對沖量也越大，才會出現 GEX、牆、Flip 這些概念（第 6、7 關）。", dur: 3600 },
    { cap: "選擇權為什麼越來越重要？美國上市選擇權年成交量從 2020 年約 <b>75 億口</b>，成長到 2025 年約 <b>152 億口</b>，連續六年破紀錄。",
      why: "2020 年免佣金交易 App 和疫情期間的散戶熱潮帶進大量新手；之後超短天期（0DTE）爆發，2025 年 SPX 的 0DTE 已占該商品成交量約 59%（Cboe）。", dur: 3400 },
    { cap: "三個釐清：① 全球用口數算，選擇權（886.5 億口）遠多於期貨（306.4 億口），但大量來自<b>印度</b>的小型指數選擇權；② <b>口數不等於金額</b>；③ 選擇權量大，市商對沖量就大，但「選擇權主導價格」<b>還沒有定論</b>。",
      why: "印度 NSE 執行長自己說，印度選擇權合約很小；以金額算，NSE 的選擇權權利金成交不到美國股票選擇權的五分之一。學術研究對 Gamma 對沖影響多大，結果也不一致。", dur: 2600 },
    { cap: "想一想：某交易所的選擇權口數是全球第一。",
      q: { t: "這代表什麼？", o: [
        ["交易很熱絡，但不一定是金額最大；要看合約大小和權利金金額", true, "印度就是例子：合約很小，口數衝到全球第一，金額卻遠小於美國。"],
        ["它一定是全球最重要的選擇權市場", false, "口數只是其中一個標準。"],
        ["它的價格一定被選擇權主導", false, "量大和主導價格是兩件事。"]] } },
    { cap: "整理：衍生品的價值來自標的；對沖就是持有<b>反方向</b>的部位；期貨對沖鎖住結果，選擇權對沖像買保險。選擇權疫情後成長最快，但看規模要分清<b>名目、市值、口數</b>。",
      why: "下一關從最基本的開始：買權和賣權的損益長什麼樣子。" }
  ];

  function draw(svg, i, t) {
    let s = "";
    if (i === 0) s += `<circle cx="320" cy="190" r="${lerp(0, 60, ease(seg(t, 0, 0.3)))}" class="f-surface s-line"/><text x="320" y="185" text-anchor="middle" class="t-ink t-b" opacity="${seg(t, 0.1, 0.3)}">標的</text><text x="320" y="208" text-anchor="middle" class="t-mute" opacity="${seg(t, 0.1, 0.3)}">股票、指數、利率…</text>` +
      [["期貨", 150, 90], ["選擇權", 490, 90], ["遠期", 150, 300], ["交換", 490, 300]].map(([lab, x, y], k) => `<g opacity="${seg(t, 0.3 + k * 0.15, 0.45 + k * 0.15)}"><path d="M320 190 L${x} ${y}" class="s-line" stroke-dasharray="4 4"/><rect x="${x - 60}" y="${y - 24}" width="120" height="48" rx="12" class="${k < 2 ? "f-gamma-soft" : "f-buy-soft"}"/><text x="${x}" y="${y + 6}" text-anchor="middle" class="t-ink t-b">${lab}</text></g>`).join("") + `<text x="150" y="40" text-anchor="middle" class="t-mute" opacity="${seg(t, 0.8, 1)}">交易所</text><text x="490" y="355" text-anchor="middle" class="t-mute" opacity="${seg(t, 0.8, 1)}">多為店頭（OTC）</text>`;
    else if (i === 1) s += [["避險者", "怕價格變動", "f-buy-soft", 120], ["投機者", "想賺價格變動", "f-sell-soft", 320], ["造市商", "兩邊報價賺價差", "f-gamma-soft", 520]].map(([a, b, c, x], k) => `<g opacity="${seg(t, k * 0.25, k * 0.25 + 0.3)}"><circle cx="${x}" cy="160" r="70" class="${c}"/><text x="${x}" y="155" text-anchor="middle" class="t-ink t-b t-lg">${a}</text><text x="${x}" y="182" text-anchor="middle" class="t-mute">${b}</text></g>`).join("") + `<g opacity="${seg(t, 0.8, 1)}"><path d="M190 280 H450" class="s-ink" stroke-width="2"/><path d="M444 274 l6 6 l-6 6" class="s-ink f-none" stroke-width="2"/><text x="320" y="270" text-anchor="middle" class="t-ink">風險從避險者流向投機者</text></g>`;
    else if (i === 2) s += pnl([[(v) => v, "s-buy", "現貨部位", 7], [(v) => -v, "s-sell", "對沖部位", 7], [() => 0, "s-gamma", "合計：持平", -6]], t);
    else if (i === 3) { const pr = 1.5; s += pnl([[(v) => v, "s-buy", "只有股票", 7], [(v) => Math.max(-3 - v, 0) - pr, "s-sell", "買 Put", -7], [(v) => v + Math.max(-3 - v, 0) - pr, "s-gamma", "股票＋Put", 4]], t) + `<text x="120" y="300" class="t-gamma t-b" opacity="${seg(t, 0.8, 1)}">下跌有底</text>`; }
    else if (i === 4) s += cards([["航空公司", "怕油價大漲"], ["油價漲", "燃料成本增加"], ["要找", "油價漲時會賺錢的部位"]], 1, { hl: 2 }) + chip(320, 330, "用什麼對沖？", "hl");
    else if (i === 5) { const k = 4.6; s += bubble(130, 200, R(SIZE.eq, k) * ease(seg(t, 0, 0.3)), "f-buy-soft", "全球股票", "約 158 兆") + bubble(260, 200, R(SIZE.bd, k) * ease(seg(t, 0.2, 0.5)), "f-surface s-line", "全球債券", "約 161 兆") + bubble(470, 190, R(SIZE.otc, k) * ease(seg(t, 0.5, 0.9)), "f-gamma-soft", "店頭衍生品", "名目約 846 兆", seg(t, 0.5, 0.6)) + `<text x="40" y="36" class="t-mute">圓的面積＝金額（美元）</text>`; }
    else if (i === 6 || i === 8) { const k = 4.6, rr = lerp(R(SIZE.otc, k), R(SIZE.gmv, k), i === 6 ? ease(seg(t, 0.3, 0.8)) : 1);
      s += bubble(130, 200, R(SIZE.eq, k), "f-buy-soft", "全球股票", "約 158 兆") + bubble(260, 200, R(SIZE.bd, k), "f-surface s-line", "全球債券", "約 161 兆") + `<circle cx="470" cy="190" r="${R(SIZE.otc, k)}" class="f-none s-line" stroke-dasharray="6 5"/><text x="470" y="${190 - R(SIZE.otc, k) + 22}" text-anchor="middle" class="t-mute">名目 846 兆</text>` + `<circle cx="470" cy="190" r="${rr}" class="f-gamma-soft"/><text x="470" y="${190 + rr + 20}" text-anchor="middle" class="t-ink t-b" opacity="${i === 6 ? seg(t, 0.7, 1) : 1}">總市值約 21.8 兆</text>`;
      if (i === 8) s += chip(320, 360, "「五倍以上」比的是哪個數字？", "hl"); }
    else if (i === 7) { const k = 4.9, pos = [[200, 190], [430, 140], [470, 290], [545, 250], [395, 250]];
      OTC.forEach(([lab, v, cls], j) => { s += bubble(pos[j][0], pos[j][1], R(v, k) * ease(seg(t, j * 0.15, j * 0.15 + 0.35)), cls + (cls === "f-surface" ? " s-line" : ""), lab, "約 " + fx(v) + " 兆", 1, j < 2); }); s += `<text x="40" y="36" class="t-mute">店頭衍生品名目金額，依類別（2025 年底）</text>`; }
    else if (i === 9) s += mapPic(t);
    else if (i === 10) s += [["基金", "買 Put 保護股票", "f-buy-soft"], ["市商", "賣出 Put → 偏多", "f-gamma-soft"], ["市商", "放空期貨對沖", "f-sell-soft"], ["期貨市場", "多了賣單", "f-surface s-line"]].map(([a, b, c], k) => { const x = 40 + k * 150, op = seg(t, k * 0.22, k * 0.22 + 0.25); return `<g opacity="${op}"><rect x="${x}" y="140" width="130" height="100" rx="12" class="${c}"/><text x="${x + 65}" y="182" text-anchor="middle" class="t-ink t-b">${a}</text><text x="${x + 65}" y="210" text-anchor="middle" class="t-mute">${b}</text>${k < 3 ? `<path d="M${x + 132} 190 h16" class="s-ink" stroke-width="2"/>` : ""}</g>`; }).join("");
    else if (i === 11) { const mx = 16, X = (k) => 110 + k * 82, H = (v) => (v / mx) * 230;
      s += `<line x1="90" x2="600" y1="310" y2="310" class="s-ink"/><text x="90" y="44" class="t-mute">美國上市選擇權年成交量（億口，OCC）</text>`;
      US.forEach(([y, v], k) => { const h = H(v) * ease(seg(t, k * 0.12, k * 0.12 + 0.3)); s += `<rect x="${X(k)}" y="${310 - h}" width="54" height="${h}" rx="5" class="${k === 5 ? "f-gamma-soft" : "f-buy-soft"}"/><text x="${X(k) + 27}" y="332" text-anchor="middle" class="t-ink t-b">${y}</text><text x="${X(k) + 27}" y="${302 - h}" text-anchor="middle" class="t-ink" opacity="${seg(t, k * 0.12 + 0.2, k * 0.12 + 0.35)}">${fx(v * 10)}</text>`; });
      s += `<text x="${X(0) + 27}" y="356" text-anchor="middle" class="t-sell t-b" opacity="${seg(t, 0.8, 1)}">疫情、免佣金 App</text>`; }
    else if (i === 12 || i === 13) { const k = 0.9; s += bubble(200, 190, R(886.5, k * 5), "f-gamma-soft", "選擇權", "886.5 億口", i === 12 ? seg(t, 0, 0.3) : 1) + bubble(440, 210, R(306.4, k * 5), "f-buy-soft", "期貨", "306.4 億口", i === 12 ? seg(t, 0.2, 0.5) : 1) + `<text x="40" y="36" class="t-mute">2025 年全球交易所成交口數（FIA）</text>` + `<g opacity="${i === 12 ? seg(t, 0.6, 1) : 1}">${chip(200, 345, "大量是印度的小合約", "hl")}</g>`; if (i === 13) s += chip(440, 345, "口數第一代表什麼？", "hl"); }
    else s += cards([["衍生品", "價值來自標的"], ["對沖", "持有反方向的部位"], ["期貨對沖", "鎖住結果"], ["選擇權對沖", "像買保險：保下限、留上限"], ["看規模", "分清名目、市值、口數"]], t, { hl: 1 });
    svg.innerHTML = s;
  }

  // 練習：對沖實驗室
  const P0 = B(27000, 26700, 30).put;
  const SC = {
    nq: { title: "持有 1 口 NQ 多單（進場 27,000，每點 $20）", lo: 24500, hi: 29500, step: 50, v0: 27000, unit: "NQ 到期價格",
      tools: [["none", "不對沖"], ["fut", "放空 1 口 NQ"], ["put", `買 1 口 26,700 Put（30 天，權利金約 ${fx(P0)} 點）`]],
      pnl: (x, tool) => { const base = (x - 27000) * 20; if (tool === "fut") return 0; if (tool === "put") return base + (Math.max(26700 - x, 0) - P0) * 20; return base; }, fmt: (x) => fx(x) },
    ex: { title: "出口商 3 個月後收 100 萬美元（現在匯率 32.0）", lo: 29.5, hi: 34.5, step: 0.05, v0: 32, unit: "3 個月後美元兌台幣",
      tools: [["none", "不對沖"], ["fwd", "賣出 100 萬美元遠期（約定 32.0）"], ["opt", "買美元 Put（履約 31.8，權利金 0.25 元）"]],
      pnl: (x, tool) => { const base = (x - 32) * 1e6; if (tool === "fwd") return 0; if (tool === "opt") return base + (Math.max(31.8 - x, 0) - 0.25) * 1e6; return base; }, fmt: (x) => x.toFixed(2) } };
  const simHTML = `<div class="tabs hl-sc"><button class="tab" data-k="nq" aria-selected="true" type="button">NQ 多單</button><button class="tab" data-k="ex" aria-selected="false" type="button">出口商的美元</button></div>
<p class="small hl-title"></p><div class="controls"><div class="ctl"><label><span class="hl-unit"></span> <b class="hl-x-v"></b></label><input class="hl-x" type="range"></div></div>
<svg class="fpx hl-svg" viewBox="0 0 640 380" role="img" aria-label="三種做法的損益"></svg><div class="hl-out kpi-row"></div><ul class="sim-task hl-task"></ul>`;
  function simMount(box) {
    const q = (s) => box.querySelector(s); let k = "nq"; const done = {};
    function setup() { const S = SC[k], r = q(".hl-x"); r.min = S.lo; r.max = S.hi; r.step = S.step; r.value = S.v0; q(".hl-title").textContent = S.title; q(".hl-unit").textContent = S.unit; paint(); }
    function paint() {
      const S = SC[k], x = +q(".hl-x").value; q(".hl-x-v").textContent = S.fmt(x);
      const ys = []; for (let v = S.lo; v <= S.hi + 1e-9; v += (S.hi - S.lo) / 60) S.tools.forEach(([t]) => ys.push(S.pnl(v, t)));
      const mx = Math.max(...ys.map(Math.abs)), X = (v) => lerp(90, 590, (v - S.lo) / (S.hi - S.lo)), Y = (v) => lerp(320, 60, (v + mx) / (2 * mx));
      const cls = { none: "s-buy", fut: "s-sell", fwd: "s-sell", put: "s-gamma", opt: "s-gamma" };
      let s = `<line x1="90" x2="590" y1="${Y(0)}" y2="${Y(0)}" class="s-ink"/><line x1="${X(S.v0)}" x2="${X(S.v0)}" y1="60" y2="330" class="s-line"/><text x="${X(S.v0) + 4}" y="74" class="t-mute">現在</text>`;
      S.tools.forEach(([t, lab], j) => { const pts = []; for (let v = S.lo; v <= S.hi + 1e-9; v += (S.hi - S.lo) / 60) pts.push(`${X(v).toFixed(1)},${Y(S.pnl(v, t)).toFixed(1)}`); s += `<polyline points="${pts.join(" ")}" class="${cls[t]} f-none" stroke-width="3"/>`; });
      s += `<line x1="${X(x)}" x2="${X(x)}" y1="60" y2="330" class="s-hl" stroke-width="2.5"/>` + S.tools.map(([t], j) => `<circle cx="${X(x)}" cy="${Y(S.pnl(x, t))}" r="6" class="${{ "s-buy": "f-buy", "s-sell": "f-sell", "s-gamma": "f-hl" }[cls[t]]}"/>`).join("");
      s += S.tools.map(([t, lab], j) => `<text x="596" y="${Y(S.pnl(S.hi, t)) + (j === 1 ? 16 : -8)}" text-anchor="end" class="${cls[t].replace("s-", "t-")} t-b">${["不對沖", t === "fut" || t === "fwd" ? "期貨／遠期" : "", "選擇權"][j] || "期貨／遠期"}</text>`).join("");
      s += [[S.lo, S.fmt(S.lo)], [S.hi, S.fmt(S.hi)]].map(([v, l]) => `<text x="${X(v)}" y="350" text-anchor="middle" class="t-mute">${l}</text>`).join("");
      q(".hl-svg").innerHTML = s;
      const cur = k === "nq" ? "$" : "NT$";
      q(".hl-out").innerHTML = S.tools.map(([t, lab]) => { const v = S.pnl(x, t); return `<div><span class="t1">${lab}</span><b class="${v >= 0 ? "gx-pos" : "gx-neg"}">${v >= 0 ? "+" : "−"}${cur}${fx(Math.abs(v))}</b></div>`; }).join("");
      if (k === "nq" && x <= 25500) done.a = true; if (k === "nq" && x >= 28500) done.b = true; if (k === "ex") done.c = true;
      q(".hl-task").innerHTML = [["a", "任務 1：NQ 大跌到 25,500 以下，比較三種做法"], ["b", "任務 2：NQ 大漲到 28,500 以上，哪種做法最吃虧？"], ["c", "任務 3：切到出口商，看看匯率的對沖是不是同一個道理"]].map(([kk, tx]) => `<li class="${done[kk] ? "ok" : ""}">${done[kk] ? "✓" : "○"} ${tx}</li>`).join("");
    }
    box.addEventListener("input", paint);
    q(".hl-sc").addEventListener("click", (e) => { const b = e.target.closest(".tab"); if (!b) return; k = b.dataset.k; box.querySelectorAll(".hl-sc .tab").forEach((x) => x.setAttribute("aria-selected", String(x === b))); setup(); });
    setup();
  }

  const QS = [
    { fig: `<p class="small q-cap">你持有台積電股票，擔心下個月財報後大跌，但又不想錯過上漲。</p>`, q: "比較適合的對沖是？", step: 4, o: [
      ["買台積電的 Put", true, "下跌有保護，上漲照樣賺，代價是權利金。"],
      ["放空台積電期貨", false, "這樣可以鎖住，但上漲也賺不到，不符合「不想錯過上漲」。"],
      ["加碼買更多股票", false, "這是加大風險，不是對沖。"]] },
    { fig: `<p class="small q-cap">店頭衍生品名目約 846 兆美元，總市值約 21.8 兆美元。</p>`, q: "哪個數字比較接近「如果今天全部結清要付多少錢」？", step: 7, o: [
      ["總市值約 21.8 兆", true, "名目只是合約對應的金額，真正要付的是合約現在的市值。"],
      ["名目約 846 兆", false, "名目不是實際要付的錢。"],
      ["兩個都不是", false, "總市值就是這個意思。"]] },
    { fig: `<p class="small q-cap">基金大量買進指數 Put 避險，市商是賣方。</p>`, q: "市商接下來最可能怎麼做？", step: 11, o: [
      ["放空指數期貨，讓自己的部位回到中立", true, "賣出 Put 讓市商偏多，所以用期貨空單對沖。對沖就這樣傳到期貨市場。"],
      ["買進更多指數期貨", false, "那會讓市商更偏多。"],
      ["什麼都不做", false, "市商不賭方向，一定會對沖。"]] }
  ];

  PAGES["op-0"] = window.KIT.page(C0, "op-0", {
    topic: "衍生品與對沖",
    chipText: "序章　約 15 分鐘",
    lede: "開始學選擇權之前，先看全貌：衍生品是什麼、市場為什麼需要對沖、各種部位用什麼對沖，以及選擇權為什麼在疫情後變得這麼重要。最後用圓的大小，比較各個市場的規模。",
    analogy: [
      ["門票轉售合約", "衍生品本身沒有價值，<b>價值全看標的</b>，像演唱會門票的轉售合約。"],
      ["鎖門和買保險", "期貨對沖像<b>把門鎖死</b>；選擇權對沖像<b>買保險</b>，付保費、保下限、留上限。"],
      ["名目和真的錢", "一張 1 億的合約，<b>雙方真正交換的可能只有利息差額</b>。"]],
    steps: STEPS, draw, simHTML, simMount,
    simIntro: "拉動到期時的價格，比較不對沖、用期貨（或遠期）對沖、用選擇權對沖三種做法的損益。",
    after: `<p><a class="btn primary" href="#op-1">下一步：第 1 關 買權與賣權</a></p><p class="small">資料來源：美國選擇權成交量為 OCC 年度統計與 Cboe《The State of the Options Industry: 2025》；全球交易所成交口數為 FIA 2025 年 12 月報告；店頭衍生品名目與總市值為 BIS 2025 年 6 月底統計，類別拆分為 ISDA 整理的 2025 年底 BIS 資料；全球股票市值與債券餘額為 SIFMA《2026 Capital Markets Fact Book》（2025 年底）；印度合約規模說法引自 Business Standard 報導的 NSE 執行長談話。選擇權權利金以 Black-76、IV 20% 估算。</p>`,
    mist: [
      ["衍生品就是賭博", "同一個工具，避險者用來降低風險，投機者用來承擔風險。沒有投機者，避險者就找不到對手。"],
      ["對沖是為了賺錢", "對沖是為了讓結果可預期。期貨對沖連上漲的好處也一起放棄了。"],
      ["衍生品名目 846 兆＝全世界有 846 兆的錢在裡面", "名目只是合約對應的金額，總市值約 21.8 兆。"]],
    faq: [
      ["期貨和遠期差在哪？", "期貨是交易所的標準化合約，每天結算盈虧、有結算所擔保；遠期是雙方私下簽的，條件可以客製，但要承擔對方違約的風險。"],
      ["交換（swap）是什麼？", "雙方約定交換一連串的現金流，最常見的是固定利率換浮動利率，企業和銀行用來管理利率風險。"],
      ["為什麼用期貨對沖 NQ 部位，損益是 0？", "這是簡化模型：同樣口數、同樣到期的多空部位剛好抵銷。實務上還有手續費、保證金和換月的成本。"],
      ["散戶需要懂這些嗎？", "你不一定要用衍生品避險，但市場上大部分的大額交易都和避險有關。懂它們在做什麼，才看得懂後面的 GEX 和市商對沖。"]],
    qs: QS,
    gloss: [
      ["衍生品", "價值來自標的（股票、指數、利率、匯率、商品）的合約。"],
      ["標的", "衍生品價值所依據的那個東西。"],
      ["對沖（避險）", "持有反方向的部位，讓損益互相抵銷。"],
      ["店頭市場（OTC）", "不經過交易所、由雙方私下成交的市場。"],
      ["名目金額", "合約對應的標的金額，不是實際投入或要付的錢。"],
      ["總市值", "把所有合約按現在價格結清時，要付的金額。"],
      ["遠期", "雙方約定未來用某個價格買賣，私下簽訂。"],
      ["交換（swap）", "雙方約定交換一連串的現金流，例如固定利率換浮動利率。"]],
    remember: "<b>對沖＝持有反方向的部位。</b>期貨鎖住結果，選擇權像保險；看規模要分清名目、市值和口數。"
  });
})();
