#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// JSONファイルのエスケープ処理修正
function fixJsonEscaping(content) {
  // 文字列内のダブルクォートをエスケープ
  return content.replace(/"([^"\\]*(\\.[^"\\]*)*)"/g, (match, inner) => {
    // 既にエスケープされているクォートは保持
    const fixed = inner.replace(/(?<!\\)"/g, '\\"');
    return `"${fixed}"`;
  });
}

try {
  const filePath = path.join(__dirname, 'outputs/generated_article.json');
  console.log('📄 JSONファイル修復開始...');
  
  // ファイル読み込み
  const content = fs.readFileSync(filePath, 'utf8');
  
  // エラー位置特定
  try {
    JSON.parse(content);
    console.log('✅ JSON構文エラーなし');
  } catch (error) {
    console.log('❌ JSON構文エラー検出:', error.message);
    
    // 問題箇所の特定と修正
    const lines = content.split('\n');
    const problemLine = parseInt(error.message.match(/line (\d+)/)?.[1] || 5);
    
    console.log(`🔍 問題行: ${problemLine}`);
    console.log(`内容: ${lines[problemLine - 1]?.substring(0, 100)}...`);
    
    // contentフィールド内の不正なJSON構造を修正
    let fixedContent = content;
    
    // 問題のあるJSON-LDスクリプト内の不正なエスケープを修正
    fixedContent = fixedContent.replace(
      /"description": "freee・マネーフォワード等の会計ソフト導入支援の実務家"/g,
      '"description": "freee・マネーフォワード等の会計ソフト導入支援の実務家"'
    );
    
    // その他の一般的なJSONエラーを修正
    fixedContent = fixedContent.replace(/([^\\])"/g, '$1\\"'); // 不正なダブルクォート
    fixedContent = fixedContent.replace(/\\"/g, '\\"'); // エスケープの重複
    
    // 修正されたファイルを保存
    fs.writeFileSync(filePath, fixedContent, 'utf8');
    
    // 修正後の検証
    try {
      JSON.parse(fixedContent);
      console.log('✅ JSON構文修正完了');
    } catch (secondError) {
      console.log('❌ 修正後もエラー:', secondError.message);
      
      // 手動修正用の新しいファイル作成
      const cleanArticle = {
        title: "IT導入補助金で会計ソフトを導入する完全ガイド｜2024年最新版",
        slug: "it-hojo-kaikeisoft-guide-2024",
        meta_description: "IT導入補助金を活用して会計ソフトを導入する完全ガイド。最大75%補助、申請手順、導入事例、効果測定まで実務家が詳しく解説します。2024年最新情報対応。",
        content: `既存のコンテンツにスキーマとチャートを追加`,
        categories: ["IT導入補助金", "会計ソフト", "補助金・助成金"],
        tags: ["IT導入補助金", "会計ソフト", "freee", "マネーフォワード", "弥生会計"],
        generatedAt: new Date().toISOString()
      };
      
      fs.writeFileSync(path.join(__dirname, 'outputs/generated_article_clean.json'), JSON.stringify(cleanArticle, null, 2));
      console.log('📄 クリーンなJSONファイルを作成: outputs/generated_article_clean.json');
    }
  }
  
} catch (error) {
  console.error('❌ ファイル処理エラー:', error.message);
}