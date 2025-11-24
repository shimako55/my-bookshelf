# 書籍追加コマンド

ISBNまたは書籍名から書籍情報を検索し、`data/library.json`に追加します。

## 入力情報

```
$ARGUMENTS
```

## 実行手順

1. **入力の判定**: 入力が10桁または13桁の数字のみの場合はISBNとして扱い、それ以外は書籍名として扱う

2. **書籍情報の検索**: WebSearchツールを使用して以下の情報を取得する
   - タイトル（正式名称）
   - 著者名
   - ISBN-10（10桁のISBN、これがキーになる）
   - 商品画像URL（Amazon形式: `https://images-na.ssl-images-amazon.com/images/P/{ISBN-10}.01.L.jpg`）

3. **重複チェック**: `data/library.json`を読み込み、同じISBNの書籍が既に存在しないか確認する

4. **書籍の追加**: 以下の形式で`data/library.json`の`books`オブジェクトに追加する
   ```json
   "{ISBN-10}": {
     "title": "書籍タイトル",
     "authors": "著者名",
     "acquiredTime": {現在のタイムスタンプ（ミリ秒）},
     "readStatus": "UNKNOWN",
     "productImage": "https://images-na.ssl-images-amazon.com/images/P/{ISBN-10}.01.L.jpg",
     "source": "manual_add",
     "addedDate": {現在のタイムスタンプ（ミリ秒）},
     "memo": "",
     "rating": 0
   }
   ```

5. **統計の更新**: `stats.totalBooks`の値を1増やす

6. **結果の報告**: 追加した書籍の情報をテーブル形式で表示する
   - ISBN
   - タイトル
   - 著者
   - 更新後の総蔵書数

## 注意事項

- 書籍が見つからない場合は、ユーザーに報告して追加情報を求める
- 既に同じISBNの書籍が存在する場合は、追加せずにその旨を報告する
- タイムスタンプは`mcp__timeserver__get_current_time`で現在時刻を取得し、ミリ秒に変換して使用する
