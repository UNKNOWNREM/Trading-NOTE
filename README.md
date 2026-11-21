# TRADING NOTES

訂單流、選擇權和價格行為的圖解學習網站，零基礎也能跟上。

線上版：https://unknownrem.github.io/Trading-NOTE/

## 內容

- **圖解課程**：三條路線，每一關都有逐步動畫、關鍵處的小問題和可以操作的練習區
  - 路線 1　訂單流（15 關）：期貨合約、Footprint、Delta、CVD、失衡、Volume Profile、VWAP、Market Profile、五個確認訊號、風險管理
  - 路線 2　選擇權（序章＋12 關）：衍生品與對沖、買權賣權、Greeks、隱含波動率、市商對沖、GEX、Flip、到期日效應、DEX
  - 路線 3　整合 SOP（7 關）：淨 GEX 環境＋價值區訂單流確認，盤前、盤中、盤後的每日流程
- **知識庫**：價格行為（Al Brooks）、威科夫、布林通道、RSI 四科筆記
- **學習工具**：起點測驗、錯題本、全站名詞表、工具箱、NinjaTrader 對照、每日紀錄表

## 使用

純靜態網站，不需要建置。直接打開 `index.html`，或用任何靜態伺服器：

```
python -m http.server 8000
```

學習進度、錯題本和紀錄表都存在瀏覽器的 localStorage，不會上傳。右上角可以切換深色、淺色主題。

## 說明

教育用途，不構成投資建議。範例數字為虛構或改寫，GEX 與選擇權部位是依公開資料和假設推算的估計值。
