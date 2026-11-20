# Math Quest｜國七數學勇者

一個以臺灣國中七年級數學概念為基礎的原創 RPG 練習遊戲。教材知識點可以依翰林版章節對照，但本專案不收錄翰林教科書原題。

## 功能
- 數線與整數、因數倍數與分數、一元一次方程式、幾何概念等七上練習分類
- 基礎／進階／挑戰難度及模板式隨機出題
- 怪物生命值、英雄生命值、連擊、經驗值與闖關
- 錯題記錄、解題提示與錯題複習
- localStorage 儲存同一瀏覽器上的進度
- 手機及桌機排版

## 本機執行
在專案根目錄執行 `npx wrangler dev`；或者使用靜態檔案伺服器開啟 `public/index.html`。

## Cloudflare Workers 部署
1. 在本機安裝 Node.js。
2. 執行 `npx wrangler login`，用具備權限的 Cloudflare 帳號登入。
3. 執行 `npx wrangler deploy`。
4. Cloudflare 以部署回報的網址為準；本專案的 Worker 名稱設定為 `math-game`。

本 Repository 的程式碼上傳 GitHub 不等於 Cloudflare 已發布。可以在 Cloudflare Dashboard 的 Workers & Pages 中連接 GitHub Repository，並以 Workers static assets 方式部署。

## 注意
- 學習進度目前只儲存在瀏覽器，本機清除網站資料後會遺失。
- 本遊戲是學習原型，不是正式課本授權產品，章節對照需依實際學年度目錄複核。
