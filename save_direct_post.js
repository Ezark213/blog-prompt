#!/usr/bin/env node

/**
 * 生成された記事を直接WordPressの下書きとして保存
 */

const fs = require('fs').promises;
const path = require('path');
const WordPressClient = require('./src/core/wordpress_client');

async function saveDirectPost() {
  try {
    console.log('🚀 WordPress下書き保存開始...');
    
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
    
    // 生成された記事データを読み込み
    const articlePath = path.join(__dirname, 'outputs/generated_article.json');
    const articleData = JSON.parse(await fs.readFile(articlePath, 'utf8'));
    
    console.log(`📝 記事投稿中: ${articleData.title}`);
    
    // 記事データをWordPress形式に変換
    const wordpressArticle = {
      title: articleData.title,
      content: articleData.content,
      slug: articleData.slug,
      meta_description: articleData.meta_description,
      categories: articleData.categories || [],
      tags: articleData.tags || [],
      schema: articleData.schema,
      status: 'draft'  // 下書きとして保存
    };
    
    // WordPress投稿
    const result = await client.publishArticle(wordpressArticle);
    
    console.log('✅ 下書き保存完了!');
    console.log(`📄 記事タイトル: ${result.title}`);
    console.log(`🆔 WordPress ID: ${result.wordpressId}`);
    console.log(`🔗 下書きURL: ${result.draftUrl}`);
    console.log(`⏰ 保存日時: ${result.savedAt}`);
    
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
  saveDirectPost()
    .then((result) => {
      console.log('🎉 処理完了!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ 処理失敗:', error.message);
      process.exit(1);
    });
}

module.exports = saveDirectPost;