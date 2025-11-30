# 書籍追加コマンド

ASIN、ISBN、または書籍名から書籍情報を検索し、`data/library.json`に追加します。

## 入力情報

```
$ARGUMENTS
```

## 実行手順

1. **入力の判定**:
   - 10桁の英数字（例: `B0XXXXXXXXX`）の場合はASINとして扱う
   - 10桁または13桁の数字のみの場合はISBNとして扱う
   - それ以外は書籍名として扱う

2. **書籍情報の検索**: WebSearchツールを使用して以下の情報を取得する
   - タイトル（正式名称）
   - 著者名
   - ASIN/ISBN-10（10桁の識別子、これがキーになる）
   - 商品画像URL（Amazon形式: `https://images-na.ssl-images-amazon.com/images/P/{ASIN}.01.L.jpg`）

3. **重複チェック**: `data/library.json`を読み込み、同じASIN/ISBNの書籍が既に存在しないか確認する

4. **書籍の追加**: 以下の形式で`data/library.json`の`books`オブジェクトに追加する
   ```json
   "{ASIN/ISBN-10}": {
     "title": "書籍タイトル",
     "authors": "著者名",
     "acquiredTime": {現在のタイムスタンプ（ミリ秒）},
     "readStatus": "UNKNOWN",
     "productImage": "https://images-na.ssl-images-amazon.com/images/P/{ASIN/ISBN-10}.01.L.jpg",
     "source": "manual_add",
     "addedDate": {現在のタイムスタンプ（ミリ秒）},
     "memo": "",
     "rating": 0
   }
   ```

5. **統計の更新**: `stats.totalBooks`の値を1増やす

6. **結果の報告**: 追加した書籍の情報をテーブル形式で表示する
   - ASIN/ISBN
   - タイトル
   - 著者
   - 更新後の総蔵書数

## 使用例

### ASIN指定（Kindle本など）
```
/add-book B0CQQQQQYQ
```
→ ASIN `B0CQQQQQYQ`の書籍情報を検索して追加

### ISBN-10指定（紙書籍など）
```
/add-book 4297138433
```
→ ISBN-10 `4297138433`の書籍情報を検索して追加

### ISBN-13指定
```
/add-book 9784297138431
```
→ ISBN-13 `9784297138431`の書籍情報を検索して追加

### 書籍名指定
```
/add-book 面倒なことはChatGPTにやらせよう
```
→ 書籍名で検索し、見つかった書籍を追加

## 注意事項

- **ASIN形式**: 10桁の英数字（例: `B0CQQQQQYQ`, `B09ABC1234`）
  - 主にKindle本や電子書籍で使用される識別子
- **ISBN-10形式**: 10桁の数字のみ（例: `4297138433`）
  - 紙書籍や一部の電子書籍で使用される
- **ISBN-13形式**: 13桁の数字のみ（例: `9784297138431`）
  - 国際標準の書籍識別番号
- 書籍が見つからない場合は、ユーザーに報告して追加情報を求める
- 既に同じASIN/ISBNの書籍が存在する場合は、追加せずにその旨を報告する
- タイムスタンプは`mcp__timeserver__get_current_time`で現在時刻を取得し、ミリ秒に変換して使用する
