## Jupyter Notebook + Playwright の組み合わせ

- **日付**: 2026-03-29
- **プロジェクト**: PPC
- **詳細ログ**: `PPC/logs/2026-03-29.md`
- **状況**: Jupyter NotebookでPlaywrightを使ったWebスクレイピングを実装
- **原因**: Jupyterはasyncioイベントループ内で動作するため、Playwright Sync APIが使用不可
- **解決策 / ポイント**:
  - `playwright.async_api` を使い、セル内でトップレベル `await` を使用する
  - `sync_playwright()` → `async_playwright()` に変更
  - `page.goto()` → `await page.goto()` のように全メソッドにawaitを付ける
  - Jupyter特有: セル間で `page`, `browser`, `pw` オブジェクトを共有できる
- **タグ**: #Playwright #Jupyter #Python #Scraping
