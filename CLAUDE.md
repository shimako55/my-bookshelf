# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 開発環境とコマンド

### ローカル開発サーバー起動
```bash
# HTTPサーバーを起動 (CORS制約回避のため)
python -m http.server 8000
# または
npx serve .
# または
php -S localhost:8000
```

ブラウザで `http://localhost:8000` を開く

### ハイライト機能の管理
```bash
# ハイライトインデックス生成（ハイライト機能を使用する場合）
./scripts/generate-highlights-index.sh
```

## アーキテクチャ概要

### データ構造とフロー
このプロジェクトは **フロントエンドのみのWebアプリケーション** で、バックエンドサーバーは不要です。

#### 主要コンポーネント
- **VirtualBookshelf** (`js/bookshelf.js`): メインアプリケーションクラス、UI制御とビジネスロジック
- **BookManager** (`js/book-manager.js`): 蔵書のCRUD操作（作成・読み込み・更新・削除）、Google Books API連携
- **HighlightsManager** (`js/highlights.js`): Kindleハイライトの表示と管理
- **StaticBookshelfGenerator** (`js/static-bookshelf-generator.js`): 本棚の静的HTMLページ生成、SNSシェア機能

#### データ永続化戦略
1. **ブラウザのLocalStorage（プライマリ）**:
   - 蔵書データ: `virtualBookshelf_library`（BookManagerが管理）
   - ユーザーデータ: `virtualBookshelf_userData`（星評価、メモ、本棚カスタマイズ）
2. **GitHubリポジトリファイル（バックアップ・初期データ）**:
   - `data/library.json`: 統合蔵書データ（LocalStorageにない場合のフォールバック）
3. **ハイブリッド読み込み**:
   - LocalStorage優先、なければファイル読み込み
   - `autoSaveUserDataFile()`で手動エクスポート可能

#### コアデータファイル
- `data/library.json`: 統合蔵書データ（書籍情報 + ユーザーメモ・評価 + 本棚構成）
- `data/config.json`: アフィリエイトID、GitHubPagesのベースURLなどのグローバル設定
- `data/highlights-index.json`: ハイライトファイルのASINマッピング（自動生成）

#### library.jsonのデータ構造（v2.0形式）
```json
{
  "exportDate": "2024-01-01T00:00:00.000Z",
  "books": {
    "ASIN番号": {
      "title": "書籍タイトル",
      "authors": "著者名",
      "acquiredTime": 1234567890000,
      "readStatus": "UNKNOWN",
      "productImage": "https://...",
      "source": "kindle_import | manual_add",
      "addedDate": 1234567890000,
      "memo": "個人メモ",
      "rating": 5,
      "updatedAsin": "新しいASIN（オプション）"
    }
  },
  "bookshelves": [...],
  "settings": {...},
  "bookOrder": {...},
  "stats": {...},
  "version": "2.0"
}
```

### 初期化フロー
1. `VirtualBookshelf.init()` でBookManagerとStaticBookshelfGeneratorを初期化
2. `BookManager.initialize()` で蔵書データを読み込み（LocalStorage → library.json）
3. ユーザー設定データをLocalStorageから復元（なければlibrary.jsonから構築）
4. `HighlightsManager` を初期化してハイライト機能を有効化
5. `StaticBookshelfGenerator` を初期化して静的ページ生成機能を有効化

### データエクスポート・インポート機能
- **Kindleデータインポート**:
  - [Kindle Bookshelf Exporter](https://chromewebstore.google.com/detail/kindle-bookshelf-exporter/olimpmeljimffgjonlpmiaebaonnegdp)でエクスポートしたJSONファイルを取り込み
  - 選択的インポート機能（重複チェック、新規書籍のみ追加）
- **手動蔵書追加**:
  - ASIN、AmazonリンクからGoogle Books APIで自動取得
  - タイトル、著者を手動入力して蔵書に追加
- **ASIN更新機能**:
  - AmazonでASINが変更された場合、`updatedAsin`フィールドで新ASINを管理
  - 画像URL、購入リンクは自動的に新ASINを使用
- **設定エクスポート**: LocalStorageのデータを`library.json`としてダウンロード

### 本棚管理システム
- **本棚作成**: 複数の本棚を作成してテーマ別にキュレーション、絵文字・説明文の設定
- **公開設定**: 本棚ごとに公開・非公開を切り替え
- **静的ページ生成**: 公開本棚から静的HTMLページを生成、SNSシェア可能
- **本の管理**:
  - ドラッグ&ドロップによる本の並び替え（カスタム順序の永続化）
  - 本棚間での本の追加・削除
  - 星評価システム（0-5星）とフィルタリング
  - 個人メモ（マークダウンリンク対応）
- **本棚の並び替え**: ドラッグ&ドロップで本棚自体の順序変更可能
- **本棚プレビュー**: トップページで各本棚の最初の8冊をプレビュー表示

### ハイライト機能（オプション）
- Kindleハイライトの表示（Obsidian Kindle Pluginでエクスポート）
- ASINベースでのハイライト自動マッピング
- `generate-highlights-index.sh`でインデックス生成
- 本詳細モーダルに統合表示

### UI/UX パターン
- **2つの表示モード**: 表紙表示（カード）・リスト表示
- **カバーサイズ調整**: 小・中・大の3段階で表紙サイズ変更可能
- **ページネーション**: 1ページあたりの表示件数変更可能（10/25/50/100/全て）
- **レスポンシブデザイン**: デスクトップ・タブレット・スマートフォン対応
- **インタラクティブな要素**:
  - モーダル詳細表示（閲覧モード・編集モード切替）
  - 星評価、検索・フィルター
  - Lazy Loading（画像遅延読み込み）
- **ソート機能**: タイトル、著者、追加日、カスタム順序でソート可能

### Amazon Associates統合
- `data/config.json`のaffiliateIdでアフィリエイトリンク自動生成
- 商品画像とリンクをAmazonから動的取得
- **ASIN更新対応**: Amazonで商品ASINが変更された場合、`updatedAsin`で新ASINを管理
  - `getEffectiveASIN(book)`: 有効なASINを取得（updatedAsin優先）
  - `getProductImageUrl(book)`: 有効なASINで画像URL生成
  - `getAmazonUrl(book, affiliateId)`: 有効なASINでリンク生成

## 重要な技術的制約

### セキュリティとCORS
- **CORS制約**: `file://`プロトコルではJSONファイル読み込み不可のため、HTTPサーバーが必須
  - ローカル開発では`python -m http.server 8000`などのHTTPサーバーを起動
- **クライアントサイドのみ**: バックエンド処理なし、すべてJavaScriptで完結
- **LocalStorage依存**: ブラウザのLocalStorageにデータを保存（プライベートブラウジングでは制限あり）
- **外部API**: Google Books API使用（書籍情報自動取得）、Amazon画像URL直接参照

### ファイル構成規則
- **データファイル命名**: ASINベース（Amazon Standard Identification Number）
- **ハイライトファイル**: YAMLフロントマターにASIN情報が必要
- **自動生成ファイル**: `data/highlights-index.json`は手動編集禁止
- **静的ページ**: `static/`ディレクトリに本棚IDベースのHTMLファイルを生成

## 主要機能の実装詳細

### 書籍データの取得フロー（BookManager）
1. **ASINからの自動取得**:
   - Google Books APIでISBN検索 → 一般検索の順に試行
   - 成功: タイトル、著者、画像URLを取得
   - 失敗: 空のテンプレートを返し、ユーザーに手動入力を促す
2. **手動入力**:
   - ASIN必須、タイトル・著者は任意（後から編集可能）
   - 画像URLは自動生成（Amazon商品画像URL）

### 本棚の静的ページ生成（StaticBookshelfGenerator）
1. **生成プロセス**:
   - 本棚データから書籍リストを取得
   - カスタム順序を適用
   - `templates/bookshelf-template.html`を読み込み
   - テンプレートに値を埋め込み（本棚名、書籍一覧HTML、OGタグなど）
   - HTMLファイルをダウンロード（`static/{bookshelfId}.html`）
2. **公開URL**:
   - `config.json`の`githubPagesBaseUrl`を使用
   - 例: `https://yourusername.github.io/my-bookshelf/static/{bookshelfId}.html`
   - GitHubにpush後にアクセス可能

### 本のドラッグ&ドロップ並び替え
- **対象**: 本棚内の書籍、本棚管理画面の本棚リスト
- **実装**: HTML5 Drag and Drop API使用
- **データ保存**: `userData.bookOrder[bookshelfId]`にASIN配列として保存
- **ソート切替**: カスタム順序モードに自動切替、他のソート方法も選択可能

## 開発ワークフローとデータ管理

### データ永続化のベストプラクティス
このアプリケーションはLocalStorageをプライマリストレージとして使用しますが、データの永続化にはファイルエクスポートが必要です。

#### 推奨ワークフロー
1. **開発・カスタマイズ時**:
   - ローカルサーバーを起動（`python -m http.server 8000`）
   - ブラウザでアプリを開き、書籍追加・本棚作成などの操作
   - データはLocalStorageに自動保存される

2. **データのバックアップ・永続化**:
   - 「💾 設定をエクスポート」ボタンで`library.json`をダウンロード
   - ダウンロードしたファイルを`data/library.json`に配置
   - GitHubにコミット・プッシュ

3. **静的ページの公開**:
   - 公開本棚で「📄 静的ページ生成」をクリック
   - ダウンロードされたHTMLファイルを`static/`フォルダに配置
   - GitHubにコミット・プッシュ
   - GitHub Pages経由でアクセス可能に

#### データの読み込み優先順位
1. **LocalStorage**: ブラウザのLocalStorageに保存されたデータ（最優先）
2. **library.json**: LocalStorageが空の場合のフォールバック
3. **デフォルトデータ**: どちらもない場合は空の蔵書で初期化

#### 注意事項
- **プライベートブラウジング**: LocalStorageが制限されるため、通常モードでの使用を推奨
- **ブラウザキャッシュクリア**: LocalStorageが削除される可能性があるため、定期的にエクスポート推奨
- **クロスデバイス**: LocalStorageはブラウザ・デバイス固有なので、異なるデバイスで同じデータを使うには`library.json`経由で同期

### ハイライト機能のセットアップ手順
1. **Obsidian Kindle Pluginのインストール**:
   - Obsidianで「設定」→「コミュニティプラグイン」→「Kindle Plugin」をインストール
   - Amazon.co.jpのKindleアカウント情報を設定

2. **ハイライトのエクスポート**:
   - プラグインでハイライトをMarkdown形式でエクスポート
   - YAMLフロントマターに以下の形式でASINが含まれることを確認:
   ```yaml
   ---
   kindle-sync:
     asin: B0XXXXXXXXX
   ---
   ```

3. **ファイル配置**:
   - エクスポートしたMarkdownファイルを`data/KindleHighlights/`に配置
   - ファイル名は任意（YAMLフロントマターのASINで識別）

4. **インデックス生成**:
   - ターミナルで以下を実行:
   ```bash
   ./scripts/generate-highlights-index.sh
   ```
   - `data/highlights-index.json`が自動生成される

5. **動作確認**:
   - アプリで書籍の詳細を開き、ハイライトが表示されるか確認

### トラブルシューティング

#### LocalStorageのデータがリセットされた
- `data/library.json`が最新であれば、ページをリロードして再インポート
- なければ、Kindleデータから再インポート

#### 静的ページが表示されない
- `static/`フォルダにHTMLファイルが配置されているか確認
- GitHubにpushされているか確認
- GitHub Pagesのデプロイが完了しているか確認（数分かかる場合あり）

#### ハイライトが表示されない
- `generate-highlights-index.sh`を実行したか確認
- YAMLフロントマターにASIN情報があるか確認
- `data/highlights-index.json`にASINマッピングがあるか確認

#### Amazon画像が表示されない
- Amazon画像URLは直接参照のため、一部の画像は表示されない場合あり
- `updatedAsin`フィールドで正しいASINを設定しているか確認
