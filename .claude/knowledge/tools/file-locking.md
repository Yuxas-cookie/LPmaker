## クロスプラットフォームのファイルロック: fcntl → portalocker

- **日付**: 2026-08-10
- **プロジェクト**: Merchandising-tool
- **詳細ログ**: `Merchandising-tool/logs/2026-08-10.md`
- **状況**: Mac/Linux で動いていた `fcntl.flock` を使ったロックコードを Windows に持ち込もうとした際に `ImportError: No module named 'fcntl'` が発生
- **原因**: `fcntl` は POSIX 専用モジュール。Windows の CPython には存在しない
- **解決策 / ポイント**:
  - `portalocker` ライブラリが Mac/Linux/Windows いずれでも動くクロスプラットフォーム代替
  - API は `fcntl` とほぼ対称で、最小変更で置き換えられる:
    - `import fcntl` → `import portalocker`
    - `fcntl.flock(fd, fcntl.LOCK_EX)` → `portalocker.lock(fd, portalocker.LOCK_EX)`
    - `fcntl.flock(fd, fcntl.LOCK_UN)` → `portalocker.unlock(fd)`
  - requirements.txt には `portalocker>=2.8` と指定（2系・3系・4系すべてを満たす範囲）
  - 2026-08-10 時点の最新は 4.1.0
- **タグ**: #python #windows #file-locking #portalocker #fcntl #cross-platform
