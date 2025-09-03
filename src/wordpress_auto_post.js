#!/usr/bin/env node

/**
 * WordPress自動投稿システム
 * Claude Codeで生成された記事を自動的にWordPressの下書きとして保存
 * GitHub ActionsのsecretsからWordPress認証情報を取得
 */

const fs = require('fs').promises;
const path = require('path');
const WordPressClient = require('./core/wordpress_client');
const MultiArticleProcessor = require('./multi_article_processor');

class WordPressAutoPost {
  constructor() {
    this.client = new WordPressClient();
    this.multiProcessor = new MultiArticleProcessor();
    this.outputDir = path.join(__dirname, '../outputs/generated_articles');
  }

  /**
   * メイン実行: 最新生成記事をWordPressに投稿
   */
  async run() {
    try {
      console.log('🚀 WordPress自動投稿開始...');
      
      // 1. 最新の生成記事を取得
      const latestContent = await this.getLatestGeneratedContent();
      if (!latestContent) {
        console.log('❌ 投稿する記事が見つかりません');
        return;
      }

      // 2. 複数記事構成かチェック
      const articles = this.multiProcessor.parseClaudeGeneratedContent(latestContent);
      
      if (articles.length > 1) {
        console.log(`📚 複数記事構成を検出: ${articles.length}個の記事を処理します`);
        return await this.multiProcessor.processMultipleArticles(articles);
      } else {
        console.log(`📄 単一記事として処理: ${articles[0].title}`);
        return await this.processSingleArticle(articles[0]);
      }

    } catch (error) {
      console.error('❌ 自動投稿エラー:', error.message);
      throw error;
    }
  }

  /**
   * 単一記事の処理
   */
  async processSingleArticle(article) {
    // WordPress接続テスト
    console.log('\n🔗 WordPress接続テスト...');
    const connectionOk = await this.client.testConnection();
    if (!connectionOk) {
      throw new Error('WordPress接続に失敗しました');
    }

    // 記事を下書きとして投稿
    console.log('\n📤 WordPress下書き保存中...');
    const draftPost = await this.client.publishArticle(article);

    // 結果表示
    console.log('\n✅ 投稿完了！');
    console.log('='.repeat(60));
    console.log(`📝 タイトル: ${draftPost.title}`);
    console.log(`🆔 WordPress ID: ${draftPost.wordpressId}`);
    console.log(`🔗 下書きURL: ${draftPost.draftUrl}`);
    console.log(`📅 保存日時: ${draftPost.savedAt}`);
    console.log('='.repeat(60));
    
    return draftPost;
  }

  /**
   * 最新の生成コンテンツを取得（生データ）
   */
  async getLatestGeneratedContent() {
    try {
      // outputs/generated_articles または outputs/claude_articles から最新ファイルを取得
      const searchDirs = [
        path.join(__dirname, '../outputs/generated_articles'),
        path.join(__dirname, '../outputs/claude_articles'),
        path.join(__dirname, '../outputs')
      ];

      let latestFile = null;
      let latestTime = 0;

      for (const dir of searchDirs) {
        try {
          const files = await fs.readdir(dir);
          
          for (const file of files) {
            if (file.endsWith('.json') && !file.includes('_ready') && !file.includes('_prompt')) {
              const filePath = path.join(dir, file);
              const stats = await fs.stat(filePath);
              
              if (stats.mtime.getTime() > latestTime) {
                latestTime = stats.mtime.getTime();
                latestFile = filePath;
              }
            }
          }
        } catch (err) {
          // ディレクトリが存在しない場合はスキップ
          continue;
        }
      }

      if (!latestFile) {
        return null;
      }

      // ファイル内容を生データとして読み込み
      const fileContent = await fs.readFile(latestFile, 'utf8');
      
      // JSONファイルの場合はパース、テキストファイルの場合はそのまま
      try {
        return JSON.parse(fileContent);
      } catch {
        return fileContent; // JSONでない場合は生テキスト
      }

    } catch (error) {
      console.error('記事取得エラー:', error.message);
      return null;
    }
  }

  /**
   * 記事データをWordPress形式に変換
   */
  convertToWordPressFormat(articleData) {
    // 既にWordPress形式の場合はそのまま返す
    if (articleData.title && articleData.content) {
      return {
        title: articleData.title,
        content: articleData.content || articleData.article || '',
        slug: articleData.slug || this.generateSlug(articleData.title),
        metaDescription: articleData.metaDescription || articleData.excerpt || '',
        categories: articleData.categories || ['税務・会計'],
        tags: articleData.tags || [],
        focusKeyword: articleData.focusKeyword || articleData.mainKeyword || '',
        schema: articleData.schema || '',
        sourceFile: articleData.sourceFile || 'claude_generated',
        articleIndex: 1
      };
    }

    // Claude生成形式の場合は変換
    return {
      title: articleData.researchData?.title || 'Claude生成記事',
      content: articleData.generatedContent || '',
      slug: this.generateSlug(articleData.researchData?.mainKeyword || 'article'),
      metaDescription: this.generateMetaDescription(articleData),
      categories: ['税務・会計'],
      tags: [articleData.researchData?.mainKeyword || 'Claude'],
      focusKeyword: articleData.researchData?.mainKeyword || '',
      schema: articleData.schema || '',
      sourceFile: articleData.sourceFile || 'claude_generated',
      articleIndex: 1
    };
  }

  /**
   * スラッグ生成
   */
  generateSlug(text) {
    if (!text) return 'article';
    
    return text
      .toLowerCase()
      .replace(/[^a-zA-Z0-9ひらがなカタカナ漢字\s]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .substring(0, 50);
  }

  /**
   * メタディスクリプション生成
   */
  generateMetaDescription(articleData) {
    if (articleData.metaDescription) return articleData.metaDescription;
    
    const content = articleData.generatedContent || articleData.content || '';
    const firstParagraph = content.replace(/<[^>]*>/g, '').substring(0, 150);
    
    return firstParagraph + '...';
  }

  /**
   * 環境変数設定確認
   */
  async checkEnvironmentVariables() {
    const requiredVars = [
      'WORDPRESS_API_URL',
      'WORDPRESS_USERNAME', 
      'WORDPRESS_APP_PASSWORD'
    ];

    const missing = requiredVars.filter(varName => !process.env[varName]);
    
    if (missing.length > 0) {
      console.error('❌ 必要な環境変数が設定されていません:');
      missing.forEach(varName => console.error(`  - ${varName}`));
      console.error('\nGitHub Actionsのsecretsに以下を設定してください:');
      console.error('  WORDPRESS_API_URL: https://ezark-tax-accounting.com/wp-json/wp/v2');
      console.error('  WORDPRESS_USERNAME: あなたのWordPressユーザー名');
      console.error('  WORDPRESS_APP_PASSWORD: WordPressアプリケーションパスワード');
      return false;
    }

    return true;
  }
}

/**
 * 直接実行時の処理
 */
async function main() {
  const autoPost = new WordPressAutoPost();
  
  try {
    // 環境変数チェック
    const envOk = await autoPost.checkEnvironmentVariables();
    if (!envOk) {
      process.exit(1);
    }

    // 自動投稿実行
    await autoPost.run();
    
    console.log('\n🎉 WordPress自動投稿が正常に完了しました！');
    
  } catch (error) {
    console.error('❌ 実行エラー:', error.message);
    process.exit(1);
  }
}

// 直接実行時のみメイン関数を実行
if (require.main === module) {
  main();
}

module.exports = WordPressAutoPost;