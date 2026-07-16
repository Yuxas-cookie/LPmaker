---
name: Amazonブランド名スクレイピングパターン集
description: AmazonページからブランドをPlaywright CDPで取得する手順・パターン・ハマりポイント
type: project
---

## Amazonブランド名スクレイピングパターン集

- **日付**: 2026-07-16
- **プロジェクト**: Merchandising-tool
- **詳細ログ**: `Merchandising-tool/logs/2026-07-16.md`
- **状況**: `商店街結果`シートの268アリ行に対してブランド名を全取得する作業
- **タグ**: #Playwright #Amazon #gspread #GoogleSheets

---

## 前提・セットアップ

ChromeをCDPポート付きで起動し、Amazon.co.jpを開いておく:
```
chrome.exe --remote-debugging-port=9222 --profile-directory="Profile 2"
```

Playwright CDP接続:
```python
from playwright.sync_api import sync_playwright
pw = sync_playwright().start()
browser = pw.chromium.connect_over_cdp("http://127.0.0.1:9222")
ctx = browser.contexts[0]
# Amazonページを探す
page = next(
    (p for p in ctx.pages
     if "amazon.co.jp" in p.url and "chromewebdata" not in p.url
     and p.evaluate("document.querySelectorAll('*').length") > 50),
    None
)
```

ページ遷移はbot検知を避けるため `window.location.href` を使う:
```python
page.evaluate(f"window.location.href = 'https://www.amazon.co.jp/dp/{asin}'")
page.wait_for_load_state("domcontentloaded", timeout=15000)
page.wait_for_timeout(1200)
```

---

## ブランド抽出パターン（優先順位順）

### パターン0: JS evaluate で全aタグ走査（最重要・最初に実行）

`#bylineInfo` の外にリンクがある商品や、60件超ページにも対応。
`page.locator("a").all()[:N]` の件数制限をかけると取りこぼす → JS evaluateが確実。

```python
js = (
    "() => {"
    "  const links = Array.from(document.querySelectorAll('a'));"
    "  for (const a of links) {"
    "    const t = (a.innerText || '').trim();"
    "    if (t.includes('のストアを表示'))"
    "      return t.replace('のストアを表示', '').trim();"
    "  }"
    "  for (const a of links) {"          # Amazon直販品対応
    "    const t = (a.innerText || '').trim();"
    "    if (t.includes('ストアにアクセス'))"
    "      return t.replace('ストアにアクセス', '').trim();"
    "  }"
    "  return null;"
    "}"
)
result = page.evaluate(js)
```

対応例:
- `BANDAI SPIRITS(バンダイ スピリッツ)のストアを表示` → `BANDAI SPIRITS(バンダイ スピリッツ)`
- `Amazon Echo & Alexaストアにアクセス` → `Amazon Echo & Alexa`

### パターン1: #bylineInfo のリンク

```python
for sel in ["#bylineInfo a", "#bylineInfo_feature_div a"]:
    for link in page.locator(sel).all():
        text = link.inner_text().strip()
        if "のストアを表示" in text:
            return text.replace("のストアを表示", "").strip()
```

### パターン2: #brand / #bylineInfo span

```python
for sel in ["#brand", "#bylineInfo .a-size-base", "#bylineInfo span"]:
    for el in page.locator(sel).all():
        text = el.inner_text().strip()
        if text and "のストアを表示" not in text and len(text) < 80:
            return text
```

### パターン3: 商品詳細テーブル（techSpec）

```python
rows = page.locator(
    "#productDetails_techSpec_section_1 tr, "
    "#productDetails_detailBullets_sections1 tr"
).all()
for row in rows:
    th = row.locator("th").inner_text().strip()
    if "ブランド" in th:
        return row.locator("td").inner_text().strip()
```

### パターン4: .po-brand（電化製品系に多い）

```python
el = page.locator(".po-brand .po-break-word")  # spanまで降りない！
if el.count() > 0:
    return el.first.inner_text().strip()
```

**注意**: `.po-brand .po-break-word span` はspanが存在しない商品で空になる。`.po-break-word` で止める。

### パターン5: bylineInfo全テキスト → 「ブランド: XXX」

```python
el = page.locator("#bylineInfo")
if el.count() > 0:
    for line in el.first.inner_text().strip().splitlines():
        if line.strip().startswith("ブランド:") or line.strip().startswith("ブランド："):
            return line.split(":", 1)[-1].split("：", 1)[-1].strip()
```

### パターン6: 箇条書き詳細

```python
for item in page.locator("#detailBullets_feature_div li").all():
    text = item.inner_text().strip()
    if "ブランド" in text or "メーカー" in text:
        return text.split(":")[-1].strip().replace("\u200e", "").replace("\u200f", "").strip()
```

### パターン7: prodDetTable（BANDAIのIDなしテーブル）

```python
rows = page.locator(
    "#productDetails_techSpec_section_1 tr, "
    "#productDetails_detailBullets_sections1 tr, "
    "#prodDetails tr, "
    "table.prodDetTable tr"
).all()
for row in rows:
    th = row.locator("th").inner_text().strip()
    if "ブランド" in th or "メーカー" in th:
        return row.locator("td").inner_text().strip().replace("\u200e", "").replace("\u200f", "").strip()
```

---

## ASINが空の行への対処

AmazonリンクURLから正規表現でASINを抽出:

```python
import re
m = re.search(r'/dp/([A-Z0-9]{10})', amazon_link_url)
asin = m.group(1) if m else ""
```

---

## 取得できない場合の対処

| 状況 | 原因 | 対処 |
|------|------|------|
| 成人向け商品（iroha等） | CDPでもページが空になる（bot制限） | WebSearchで商品名+ASINを検索してブランドを特定 → 手動書き込み |
| Amazon直販品（Echo等） | 「ストアにアクセス」パターン | パターン0の2ループ目で対応済み |
| ASIN空 | データ未入力 | AmazonリンクURLから抽出 |
| 廃番・ページ消失 | 商品自体が存在しない | 諦めてよい |

---

## gspread バッチ書き込み

```python
import gspread.utils

updates = [(row_1based, col_1based, value), ...]
cell_list = [
    {"range": gspread.utils.rowcol_to_a1(r, c), "values": [[v]]}
    for r, c, v in updates
]
ws.batch_update(cell_list)
```

gspread 5.x では `ws.update(range_name=..., values=...)` の形式で名前付き引数を使うこと（位置引数は非推奨）。

---

## 最終結果

268アリ行 / 268件取得（100%）
- CDPスクレイピング: 262件
- WebSearch補完（成人向け6件・iroha）: 6件
- ASINなし行をリンクから抽出して追加: 6件
