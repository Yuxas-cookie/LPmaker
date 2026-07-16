## Chrome 127+ App-Bound Encryption と browser_cookie3 の問題

- **日付**: 2026-07-16
- **プロジェクト**: Merchandising-tool
- **詳細ログ**: `Merchandising-tool/logs/2026-07-16.md`
- **状況**: セラーセントラルのCookieをbrowser_cookie3で読もうとしたが失敗
- **原因**: Chrome 127からApp-Bound Encryptionが導入され、Cookie暗号化鍵がChrome固有のDPAPIキーに変更された。外部プロセスからは復号不可
- **エラー**: `BrowserCookieError: Unable to get key for cookie decryption`
- **解決策 / ポイント**:
  - `browser_cookie3` は Chrome 127+ では使用不可
  - 代替: Playwright `launch_persistent_context(user_data_dir=...)` を使う
  - `user_data_dir` 指定でCookieを含むセッションをフォルダに保存・再利用
  - 初回: ヘッドレスOFF（ブラウザ表示）でユーザーがログイン → セッション保存
  - 2回目以降: `--headless` フラグでヘッドレス実行（ログイン不要）
  - セッション切れ検知: URLに `signin` が含まれたら SESSION_EXPIRED を raise
- **タグ**: #playwright #chrome #cookies #scraping

---

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
