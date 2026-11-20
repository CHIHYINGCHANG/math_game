# Math Quest 4.0｜國七數學闖關島

從 RPG 血量戰鬥改成**關卡地圖與益智解謎**。主程式：`public/index.html`。

## 新版功能
- 七上、七下 **9 個單元**，每單元 6 關，共 54 關
- 逐關解鎖、每關 1–3 顆星、章節完成解鎖下一章
- 七上第一章的 6 種關卡：
  1. 數線尋寶：點選正負數的數線位置
  2. 數字排序：按正確順序選擇數字卡片
  3. 密碼寶箱：3 道隨機數學題
  4. 等式天平：輸入等式缺失的數
  5. 冰原迷宮：4 道隨機題
  6. 章節大挑戰：5 道綜合題
- 其他八個章節先使用相同六關地圖與分級隨機題庫，尚未完成各章專屬互動謎題
- 進度、星級、錯題紀錄儲存在瀏覽器 localStorage
- 手機／平板／桌面排版

## 版本安全
- 原 RPG v3 原始頁面保存在 `archive/rpg-v3.html`。
- v4 使用新的 `math-quest-puzzle-v4` localStorage key，不會抹除 v3 進度。
- 需要回復舊版時，可將備份 HTML 放回 `public/index.html`。

## 部署
Cloudflare Workers 靜態網站已設定在 `wrangler.jsonc`：
```bash
npx wrangler login
npx wrangler deploy
```
若已將 Cloudflare Workers 與 GitHub 的 main 分支連結，請到 Cloudflare Dashboard 確認此次 commit 的 build/deployment 成功；GitHub 推送並不代表 Cloudflare 部署完成。

## 限制
- v4 是**可試玩的第一輪改版**，不是 54 種不同遊戲。章節 2–9 專屬謎題、視覺化幾何、段考完整題庫仍待擴充。
- 教材單元排列僅為相近課程架構，正式使用需核對實際學年度翰林版。
- 題目均為原創模板，不收錄教科書原題；部分應用題仍須人工審題。
