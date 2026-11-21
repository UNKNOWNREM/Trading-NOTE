# TRADING NOTES

系統化學習交易知識，建立自己的市場認知框架。

線上版：https://unknownrem.github.io/Trading-NOTE/

## 開放中的科目

- **Price Action**：Al Brooks 逐根 K 線解讀，趨勢、區間、信號棒
- **Wyckoff**：吸籌與派發結構、彈簧與推升、量價分析
- **布林帶 (BB)**：波動收縮與擴張突破
- **RSI**：超買、超賣與背離
- **訂單流與選擇權（圖解，新增）**：三條路線，每一關都有逐步動畫、小問題和練習區
  - 路線 1　訂單流（15 關）：期貨合約、Footprint、Delta、CVD、失衡、Volume Profile、VWAP、Market Profile、五個確認訊號、風險管理
  - 路線 2　選擇權（序章＋12 關）：衍生品與對沖、Greeks、隱含波動率、市商對沖、GEX、Flip、到期日效應、DEX
  - 路線 3　整合 SOP（7 關）：淨 GEX 環境＋價值區訂單流確認的每日流程
  - 學習工具：起點測驗、錯題本、名詞表、工具箱、NinjaTrader 對照、每日紀錄表

其他科目（纏論、SMC／ICT、量化模型等）列在首頁的「籌備中」。

## 使用

純靜態網站，不需要建置。直接打開 `index.html`，或執行 `python -m http.server 8000`。

閱讀進度、錯題本和紀錄表都存在瀏覽器的 localStorage，不會上傳。右上角可以切換深色、淺色主題。

科目清單在 `js/subjects.js`；筆記內容在 `data/kb/`。

## 說明

教育用途，不構成投資建議。範例數字為虛構或改寫，GEX 與選擇權部位是依公開資料和假設推算的估計值。
