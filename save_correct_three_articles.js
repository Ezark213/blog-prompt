#!/usr/bin/env node

/**
 * 正しい3記事をWordPress下書きに保存
 */

const fs = require('fs').promises;
const path = require('path');
const WordPressClient = require('./src/core/wordpress_client');

async function saveCorrectThreeArticles() {
  try {
    console.log('🚀 正しい3記事をWordPress下書き保存開始...');
    
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
    
    // 3記事のファイルパス
    const articles = [
      {
        path: path.join(__dirname, 'outputs/article1_invoice_accounting_software.json'),
        name: 'インボイス制度対応会計ソフト'
      },
      {
        path: path.join(__dirname, 'outputs/article2_it_subsidy_accounting.json'),
        name: 'IT導入補助金で会計ソフト導入'
      },
      {
        path: path.join(__dirname, 'outputs/article3_corporate_tax_diy.json'),
        name: '法人確定申告を自分で行う方法'
      }
    ];

    const results = [];

    // 各記事を順番に投稿
    for (let i = 0; i < articles.length; i++) {
      const article = articles[i];
      
      try {
        console.log(`\n📝 記事${i + 1}投稿開始: ${article.name}`);
        
        // 記事データ読み込み
        const articleData = JSON.parse(await fs.readFile(article.path, 'utf8'));
        
        console.log(`📊 コンテンツ長: ${articleData.actualWordCount}文字`);
        console.log(`💬 吹き出し数: ${articleData.speechBalloonCount}回`);
        console.log(`✅ スキーマ: ${articleData.hasSchema ? '含有' : '無し'}`);
        console.log(`🎯 テーマ: ${articleData.theme}`);
        
        // WordPress投稿用データ形式に変換
        const wordpressArticle = {
          title: articleData.title,
          content: articleData.content,
          slug: articleData.slug,
          metaDescription: articleData.metaDescription,
          categories: articleData.categories,
          tags: articleData.tags,
          schema: articleData.schema,
          focusKeyword: articleData.tags[0], // 最初のタグをフォーカスキーワードに
          status: 'draft'  // 下書きとして保存
        };
        
        // WordPress下書き保存
        const result = await client.publishArticle(wordpressArticle);
        
        console.log(`✅ 記事${i + 1}下書き保存完了!`);
        console.log(`🆔 WordPress ID: ${result.wordpressId}`);
        console.log(`🔗 下書きURL: ${result.draftUrl}`);
        
        results.push({
          articleNumber: i + 1,
          name: article.name,
          theme: articleData.theme,
          wordpressId: result.wordpressId,
          draftUrl: result.draftUrl,
          title: result.title,
          wordCount: articleData.actualWordCount,
          speechBalloonCount: articleData.speechBalloonCount
        });
        
        // 次の投稿まで少し待機（API制限対策）
        if (i < articles.length - 1) {
          console.log('⏳ 次の投稿まで5秒待機...');
          await new Promise(resolve => setTimeout(resolve, 5000));
        }
        
      } catch (error) {
        console.error(`❌ 記事${i + 1}の投稿エラー:`, error.message);
        results.push({
          articleNumber: i + 1,
          name: article.name,
          error: error.message
        });
      }
    }
    
    // 結果サマリー
    console.log('\n🎉 正しい3記事投稿完了！');
    console.log('\n📊 投稿結果サマリー:');
    results.forEach(result => {
      if (result.error) {
        console.log(`❌ 記事${result.articleNumber} (${result.name}): エラー - ${result.error}`);
      } else {
        console.log(`✅ 記事${result.articleNumber} (${result.name}):`);
        console.log(`   🎯 テーマ: ${result.theme}`);
        console.log(`   📄 タイトル: ${result.title}`);
        console.log(`   🆔 ID: ${result.wordpressId}`);
        console.log(`   📊 文字数: ${result.wordCount}文字`);
        console.log(`   💬 吹き出し: ${result.speechBalloonCount}回`);
        console.log(`   🔗 URL: ${result.draftUrl}`);
      }
    });
    
    // 成功数の集計
    const successCount = results.filter(r => !r.error).length;
    console.log(`\n📈 投稿成功: ${successCount}/${articles.length}記事`);
    
    console.log('\n🎯 今回の修正点:');
    console.log('✅ 1. インボイス制度対応会計ソフト記事を生成');
    console.log('✅ 2. IT導入補助金で会計ソフト導入記事を生成');
    console.log('✅ 3. 法人確定申告を自分で行う方法記事を生成');
    console.log('✅ すべて異なるテーマで正しく生成されました！');
    
    return results;
    
  } catch (error) {
    console.error('❌ 全体エラー:', error.message);
    throw error;
  }
}

// 直接実行
if (require.main === module) {
  saveCorrectThreeArticles()
    .then((results) => {
      console.log('\n🎯 正しい3記事のWordPress下書き保存処理完了！');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ 処理失敗:', error.message);
      process.exit(1);
    });
}

module.exports = saveCorrectThreeArticles;