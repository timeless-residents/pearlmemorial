# Soul Carrier Proposal Documents

マウイ島宗教コミュニティへの提案資料です。

## ファイル構成

```
offer/
├── README.md                        # このファイル
├── Makefile                         # PDF変換用Makefile
├── style.css                        # PDFスタイル定義
├── soul_carrier_proposal_jp.md      # 日本語版（編集用）
├── soul_carrier_proposal_en.md      # 英語版（編集用）
├── soul_carrier_proposal_jp.pdf     # 日本語版PDF（生成済み）
└── soul_carrier_proposal_en.pdf     # 英語版PDF（生成済み）
```

## ワークフロー

1. **Markdownファイルを編集** (`*_jp.md` / `*_en.md`)
2. **PDFに変換** (`make pdf`)
3. **配布**

## PDF変換方法

### 方法1: pandoc + wkhtmltopdf（推奨）

```bash
# macOS
brew install pandoc wkhtmltopdf

# Ubuntu/Debian
sudo apt install pandoc wkhtmltopdf

# 変換
make pdf
```

### 方法2: pandoc + LaTeX（高品質）

```bash
# macOS
brew install pandoc
brew install --cask mactex

# Ubuntu/Debian
sudo apt install pandoc texlive-xetex texlive-fonts-recommended

# 変換
make pdf
```

### 方法3: md-to-pdf（Node.js）

```bash
# インストール
npm install -g md-to-pdf

# 変換
make pdf
```

### 方法4: Visual Studio Code

1. [Markdown PDF](https://marketplace.visualstudio.com/items?itemName=yzane.markdown-pdf) 拡張機能をインストール
2. Markdownファイルを開く
3. `Cmd+Shift+P` → "Markdown PDF: Export (pdf)"

### 方法5: オンラインツール

- [Dillinger](https://dillinger.io/) - Export to PDF
- [StackEdit](https://stackedit.io/) - Publish to PDF

## Makeコマンド

```bash
make          # 全てのPDFを生成
make pdf      # 全てのPDFを生成
make jp       # 日本語版PDFのみ生成
make en       # 英語版PDFのみ生成
make clean    # 生成したPDFを削除
make watch    # ファイル変更を監視して自動再生成
make help     # ヘルプを表示
```

## スタイルのカスタマイズ

`style.css` を編集してPDFのスタイルを変更できます：

- フォント
- 色
- 余白
- 見出しのスタイル
- テーブルのスタイル
- 引用のスタイル

## 日本語フォント

日本語PDFを正しく生成するには、日本語フォントが必要です：

- **macOS**: デフォルトでサポート
- **Linux**: `fonts-noto-cjk` をインストール
  ```bash
  sudo apt install fonts-noto-cjk
  ```

## トラブルシューティング

### 日本語が表示されない

LaTeX使用時は `-V mainfont` オプションで日本語フォントを指定してください。
Makefileには既に設定済みです。

### PDFのレイアウトが崩れる

`style.css` の `@page` セクションで余白を調整してください。

## 変更履歴

- 2025-12-29: Markdownファイルを作成、PDF変換フローを確立
