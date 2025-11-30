#!/usr/bin/env node

/**
 * library.json のタイムスタンプをISO形式に変換するスクリプト
 * タイムスタンプ（数値）→ ISO形式（YYYY-MM-DD）に変換
 */

const fs = require('fs');
const path = require('path');

// library.jsonのパス
const libraryPath = path.join(__dirname, '../data/library.json');

// タイムスタンプをISO形式に変換
function convertTimestampToISO(timestamp) {
    if (!timestamp) return null;

    // 既にISO形式の文字列の場合はそのまま返す
    if (typeof timestamp === 'string') {
        return timestamp.split('T')[0];
    }

    // タイムスタンプ（数値）の場合
    const date = new Date(timestamp);
    return date.toISOString().split('T')[0];
}

try {
    console.log('📖 library.json を読み込み中...');
    const libraryData = JSON.parse(fs.readFileSync(libraryPath, 'utf-8'));

    let convertedCount = 0;

    // 各書籍のacquiredTimeとaddedDateを変換
    if (libraryData.books) {
        Object.keys(libraryData.books).forEach(asin => {
            const book = libraryData.books[asin];

            // acquiredTimeを変換
            if (book.acquiredTime) {
                const oldValue = book.acquiredTime;
                book.acquiredTime = convertTimestampToISO(book.acquiredTime);
                if (oldValue !== book.acquiredTime) {
                    convertedCount++;
                    console.log(`  ✓ ${asin}: acquiredTime = ${book.acquiredTime}`);
                }
            }

            // addedDateを変換
            if (book.addedDate) {
                const oldValue = book.addedDate;
                book.addedDate = convertTimestampToISO(book.addedDate);
                if (oldValue !== book.addedDate) {
                    convertedCount++;
                    console.log(`  ✓ ${asin}: addedDate = ${book.addedDate}`);
                }
            }
        });
    }

    // メタデータのlastImportDateを変換
    if (libraryData.metadata && libraryData.metadata.lastImportDate) {
        const oldValue = libraryData.metadata.lastImportDate;
        libraryData.metadata.lastImportDate = convertTimestampToISO(libraryData.metadata.lastImportDate);
        if (oldValue !== libraryData.metadata.lastImportDate) {
            convertedCount++;
            console.log(`  ✓ metadata.lastImportDate = ${libraryData.metadata.lastImportDate}`);
        }
    }

    // 本棚のlastUpdatedとcreatedAtを変換
    if (libraryData.bookshelves) {
        libraryData.bookshelves.forEach(bookshelf => {
            if (bookshelf.lastUpdated) {
                const oldValue = bookshelf.lastUpdated;
                bookshelf.lastUpdated = convertTimestampToISO(bookshelf.lastUpdated);
                if (oldValue !== bookshelf.lastUpdated) {
                    convertedCount++;
                    console.log(`  ✓ 本棚 "${bookshelf.name}": lastUpdated = ${bookshelf.lastUpdated}`);
                }
            }

            if (bookshelf.createdAt) {
                const oldValue = bookshelf.createdAt;
                bookshelf.createdAt = convertTimestampToISO(bookshelf.createdAt);
                if (oldValue !== bookshelf.createdAt) {
                    convertedCount++;
                    console.log(`  ✓ 本棚 "${bookshelf.name}": createdAt = ${bookshelf.createdAt}`);
                }
            }
        });
    }

    // バックアップを作成
    const backupPath = libraryPath + '.backup';
    fs.writeFileSync(backupPath, JSON.stringify(libraryData, null, 2));
    console.log(`\n💾 バックアップを作成しました: ${backupPath}`);

    // 変換後のデータを保存
    fs.writeFileSync(libraryPath, JSON.stringify(libraryData, null, 2));
    console.log(`\n✅ 変換完了: ${convertedCount} 個の日付フィールドをISO形式に変換しました`);
    console.log(`📁 ${libraryPath} を更新しました\n`);

} catch (error) {
    console.error('❌ エラー:', error.message);
    process.exit(1);
}
