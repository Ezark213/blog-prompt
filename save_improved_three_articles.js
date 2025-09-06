#!/usr/bin/env node

/**
 * 改良版3記事をWordPress下書きに保存
 */

const fs = require('fs').promises;
const path = require('path');
const WordPressClient = require('./src/core/wordpress_client');

async function saveImprovedThreeArticles() {
  try {
    console.log('🚀 改良版3記事をWordPress下書き保存開始...');
    
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
    
    // 改良版3記事のファイルパス
    const articles = [
      {
        path: path.join(__dirname, 'outputs/improved_article1_invoice_software.json'),
        name: '【改良版】インボイス制度対応会計ソフト'
      },
      {
        path: path.join(__dirname, 'outputs/improved_article2_it_subsidy.json'),
        name: '【改良版】IT導入補助金で会計ソフト導入'
      },
      {
        path: path.join(__dirname, 'outputs/improved_article3_corporate_tax.json'),
        name: '【改良版】法人確定申告を自分で行う方法'
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
        
        console.log(`📄 タイトル: ${articleData.title}`);
        console.log(`📊 コンテンツ長: ${articleData.actualWordCount}文字`);
        console.log(`💬 吹き出し数: ${articleData.speechBalloonCount}回`);
        console.log(`📈 図表数: ${articleData.chartCount}個`);
        console.log(`✅ スキーマ: ${articleData.hasSchema ? '含有' : '無し'}`);
        console.log(`🎯 テーマ: ${articleData.theme}`);
        
        // WordPress投稿用データ形式に変換
        const wordpressArticle = {
          title: `【改良版】${articleData.title}`,
          content: articleData.content,
          slug: `improved-${articleData.slug}`,
          metaDescription: articleData.metaDescription,
          categories: articleData.categories,
          tags: [...articleData.tags, '改良版', '図表付き'],
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
          speechBalloonCount: articleData.speechBalloonCount,
          chartCount: articleData.chartCount,
          improvements: [
            'ディープリサーチ記事構成に完全対応',
            'マスターガイドの吹き出し頻度を実装',
            '図生成プロンプトによる図表を埋め込み',
            'WordPressブロックエディタ完全対応',
            'SEO最適化構造を実装'
          ]
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
    console.log('\n🎉 改良版3記事投稿完了！');
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
        console.log(`   📈 図表: ${result.chartCount}個`);
        console.log(`   🔗 URL: ${result.draftUrl}`);
      }
    });
    
    // 成功数の集計
    const successCount = results.filter(r => !r.error).length;
    console.log(`\n📈 投稿成功: ${successCount}/${articles.length}記事`);
    
    console.log('\n🎯 今回の改良点:');
    console.log('✅ 1. ディープリサーチの記事構成を完全反映');
    console.log('✅ 2. マスターガイドの吹き出し頻度を大幅増加');
    console.log('✅ 3. 図生成プロンプトによる図表を各記事に埋め込み');
    console.log('✅ 4. WordPressブロックエディタ完全対応');
    console.log('✅ 5. SEO最適化構造を実装');
    console.log('✅ 6. テーマ別カスタマイズコンテンツを追加');
    console.log('✅ すべて異なるテーマで詳細構成に対応して生成！');
    
    return results;
    
  } catch (error) {
    console.error('❌ 全体エラー:', error.message);
    throw error;
  }
}

// 直接実行
if (require.main === module) {
  saveImprovedThreeArticles()
    .then((results) => {
      console.log('\n🎯 改良版3記事のWordPress下書き保存処理完了！');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ 処理失敗:', error.message);
      process.exit(1);
    });
}

module.exports = saveImprovedThreeArticles;