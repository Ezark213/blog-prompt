#!/usr/bin/env node

/**
 * OpenAI APIキーを使わずにWordPress下書きを保存
 * 事前生成された完全な記事データを使用
 */

const fs = require('fs').promises;
const path = require('path');
const WordPressClient = require('./src/core/wordpress_client');

async function saveDraftWithoutAPI() {
  try {
    console.log('🚀 API不要でWordPress下書き保存開始...');
    
    // WordPress認証設定
    process.env.WORDPRESS_API_URL = "https://ezark-tax-accounting.com/wp-json/wp/v2";
    process.env.WORDPRESS_USERNAME = "izak";
    process.env.WORDPRESS_APP_PASSWORD = "uF08dt9CEKz6bnTiZlzSPU1h";
    
    // WordPressクライアント初期化
    const client = new WordPressClient();
    
    // 接続テスト
    console.log('🔗 WordPress接続テスト...');
    const connectionOk = await client.testConnection();
    if (!connectionOk) {
      throw new Error('WordPress接続に失敗しました');
    }
    console.log('✅ WordPress接続成功');
    
    // 詳細記事データを読み込み（8000文字・8セクション版）
    let articleData;
    const detailedPath = path.join(__dirname, 'outputs/complete_detailed_article_8000words.json');
    
    try {
      // 詳細版から読み込み試行
      articleData = JSON.parse(await fs.readFile(detailedPath, 'utf8'));
      console.log('📄 詳細記事データ（8セクション版）を使用');
    } catch (error) {
      // フォールバック: 完全版を使用
      const completePath = path.join(__dirname, 'outputs/complete_article_with_schema_and_charts.json');
      try {
        articleData = JSON.parse(await fs.readFile(completePath, 'utf8'));
        console.log('📄 完全版記事データを使用');
      } catch (error2) {
        // 最終フォールバック: クリーン版を使用
        const cleanPath = path.join(__dirname, 'outputs/generated_article_clean.json');
        articleData = JSON.parse(await fs.readFile(cleanPath, 'utf8'));
        console.log('📄 クリーン版記事データを使用');
        
        // コンテンツが簡素な場合は完全版を生成
        if (articleData.content.includes('既存のコンテンツ')) {
          console.log('🔧 完全なコンテンツを生成中...');
          const generateCompleteArticle = require('./generate_complete_article');
          const completeData = await generateCompleteArticle();
          articleData = completeData;
        }
      }
    }
    
    console.log(`📝 記事投稿準備: ${articleData.title}`);
    console.log(`📊 コンテンツ長: ${articleData.content.length}文字`);
    console.log(`✅ スキーマ: ${articleData.hasSchema ? '含有' : '無し'}`);
    console.log(`📈 図表: ${articleData.hasCharts ? '含有' : '無し'}`);
    
    // WordPress投稿用データ形式に変換
    const wordpressArticle = {
      title: articleData.title,
      content: articleData.content,
      slug: articleData.slug || 'it-hojo-kaikeisoft-guide-2024',
      metaDescription: articleData.metaDescription || articleData.meta_description,
      categories: articleData.categories || ['IT導入補助金', '会計ソフト'],
      tags: articleData.tags || ['IT導入補助金', '会計ソフト', 'freee'],
      status: 'draft'  // 下書きとして保存
    };
    
    // WordPress下書き保存
    const result = await client.publishArticle(wordpressArticle);
    
    console.log('✅ 下書き保存完了! (OpenAI API使用なし)');
    console.log(`📄 記事タイトル: ${result.title}`);
    console.log(`🆔 WordPress ID: ${result.wordpressId}`);
    console.log(`🔗 下書きURL: ${result.draftUrl}`);
    console.log(`⏰ 保存日時: ${result.savedAt}`);
    console.log('');
    console.log('🎯 統合機能確認:');
    console.log(`✅ WordPress形式: 適用済み`);
    console.log(`✅ スキーママークアップ: ${articleData.hasSchema ? 'JSON-LD形式で含有' : '要確認'}`);
    console.log(`✅ 図表: ${articleData.hasCharts ? '2個のチャートを埋め込み済み' : '要確認'}`);
    
    return result;
    
  } catch (error) {
    console.error('❌ 投稿エラー:', error.message);
    if (error.response && error.response.data) {
      console.error('詳細エラー:', JSON.stringify(error.response.data, null, 2));
    }
    throw error;
  }
}

// 直接実行
if (require.main === module) {
  saveDraftWithoutAPI()
    .then((result) => {
      console.log('🎉 OpenAI API不要での下書き保存完了!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ 処理失敗:', error.message);
      process.exit(1);
    });
}

module.exports = saveDraftWithoutAPI;