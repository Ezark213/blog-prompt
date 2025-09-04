#!/usr/bin/env node

/**
 * Markdown記事のWordPress自動アップロード
 * outputsディレクトリの.mdファイルをWordPressの下書きとして投稿
 */

const fs = require('fs').promises;
const path = require('path');
const WordPressClient = require('./core/wordpress_client');
const marked = require('marked');

// 環境変数を読み込み
require('dotenv').config();

class MarkdownUploader {
  constructor() {
    this.client = new WordPressClient();
    this.outputsDir = path.join(__dirname, '../outputs');
  }

  /**
   * メイン実行: .mdファイルをWordPressにアップロード
   */
  async run() {
    try {
      console.log('🚀 Markdown記事のWordPressアップロード開始...');
      
      // 1. .mdファイルを取得
      const mdFiles = await this.getMdFiles();
      if (mdFiles.length === 0) {
        console.log('❌ アップロードする.mdファイルが見つかりません');
        return;
      }

      console.log(`📚 ${mdFiles.length}個の記事を処理します`);

      // 2. WordPress接続テスト
      console.log('\n🔗 WordPress接続テスト...');
      const connectionOk = await this.client.testConnection();
      if (!connectionOk) {
        throw new Error('WordPress接続に失敗しました');
      }

      // 3. 各記事をアップロード
      const results = [];
      for (const mdFile of mdFiles) {
        try {
          console.log(`\n📤 処理中: ${path.basename(mdFile)}`);
          const result = await this.uploadMarkdownFile(mdFile);
          results.push(result);
          console.log(`✅ 完了: ${result.title}`);
        } catch (error) {
          console.error(`❌ エラー: ${path.basename(mdFile)} - ${error.message}`);
          results.push({ error: error.message, file: mdFile });
        }
      }

      // 4. 結果サマリー表示
      this.displayResults(results);

    } catch (error) {
      console.error('❌ アップロードエラー:', error.message);
      throw error;
    }
  }

  /**
   * .mdファイルを取得
   */
  async getMdFiles() {
    try {
      const files = await fs.readdir(this.outputsDir);
      const mdFiles = files
        .filter(file => file.endsWith('.md'))
        .map(file => path.join(this.outputsDir, file));
      
      return mdFiles.sort();
    } catch (error) {
      console.error('ファイル取得エラー:', error.message);
      return [];
    }
  }

  /**
   * Markdownファイルをアップロード
   */
  async uploadMarkdownFile(filePath) {
    // 1. ファイル読み込み
    const content = await fs.readFile(filePath, 'utf8');
    
    // 2. Markdownをパース
    const article = this.parseMarkdown(content, filePath);
    
    // 3. HTMLに変換
    article.content = marked.parse(article.content);
    
    // 4. WordPressに投稿
    const draftPost = await this.client.publishArticle(article);
    
    return draftPost;
  }

  /**
   * Markdownをパース
   */
  parseMarkdown(content, filePath) {
    const lines = content.split('\n');
    let title = '';
    let articleContent = '';
    let metaDescription = '';
    
    // タイトル抽出（最初の# または ## を探す）
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.startsWith('# ') || line.startsWith('## ')) {
        title = line.replace(/^#{1,2}\s*/, '');
        articleContent = lines.slice(i + 1).join('\n');
        break;
      }
    }

    // タイトルが見つからない場合はファイル名から生成
    if (!title) {
      title = path.basename(filePath, '.md').replace(/_/g, ' ');
      articleContent = content;
    }

    // メタディスクリプション生成（最初の段落から150文字）
    const firstParagraph = articleContent
      .replace(/^#{1,6}\s.*/gm, '') // 見出しを除去
      .replace(/^\s*$/gm, '') // 空行を除去
      .split('\n')
      .find(line => line.trim().length > 0);
    
    if (firstParagraph) {
      metaDescription = firstParagraph.substring(0, 150).replace(/[#*_\[\]]/g, '') + '...';
    }

    // スラッグ生成
    const slug = this.generateSlug(title);

    // カテゴリとタグを推定
    const categories = this.inferCategories(title, articleContent);
    const tags = this.inferTags(title, articleContent);
    const focusKeyword = this.inferFocusKeyword(title);

    return {
      title,
      content: articleContent,
      slug,
      metaDescription,
      categories,
      tags,
      focusKeyword,
      sourceFile: path.basename(filePath),
      articleIndex: 1
    };
  }

  /**
   * スラッグ生成
   */
  generateSlug(title) {
    return title
      .toLowerCase()
      .replace(/[^a-zA-Z0-9ひらがなカタカナ漢字\s]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .substring(0, 50);
  }

  /**
   * カテゴリ推定
   */
  inferCategories(title, content) {
    const categories = ['税務・会計'];
    
    if (title.includes('インボイス') || content.includes('インボイス制度')) {
      categories.push('インボイス制度');
    }
    if (title.includes('補助金') || content.includes('IT導入補助金')) {
      categories.push('補助金・助成金');
    }
    if (title.includes('確定申告') || title.includes('決算')) {
      categories.push('確定申告・決算');
    }
    if (title.includes('会計ソフト') || content.includes('freee') || content.includes('マネーフォワード')) {
      categories.push('会計ソフト');
    }
    
    return categories;
  }

  /**
   * タグ推定
   */
  inferTags(title, content) {
    const tags = [];
    
    const keywordMap = {
      'freee': 'freee',
      'マネーフォワード': 'マネーフォワード',
      '弥生': '弥生会計',
      'インボイス': 'インボイス制度',
      '会計ソフト': '会計ソフト',
      'IT導入補助金': 'IT導入補助金',
      '確定申告': '確定申告',
      '法人決算': '法人決算',
      '自分で': '自力申告',
      '2025': '2025年'
    };

    const textToCheck = title + ' ' + content;
    
    Object.entries(keywordMap).forEach(([keyword, tag]) => {
      if (textToCheck.includes(keyword)) {
        tags.push(tag);
      }
    });
    
    return tags;
  }

  /**
   * フォーカスキーワード推定
   */
  inferFocusKeyword(title) {
    if (title.includes('インボイス') && title.includes('会計ソフト')) {
      return 'インボイス制度 会計ソフト おすすめ';
    }
    if (title.includes('IT導入補助金')) {
      return 'IT導入補助金 会計ソフト';
    }
    if (title.includes('確定申告') && title.includes('自分で')) {
      return '法人 確定申告 自分で';
    }
    
    return title.split(/[　\s]+/).slice(0, 3).join(' ');
  }

  /**
   * 結果表示
   */
  displayResults(results) {
    console.log('\n' + '='.repeat(60));
    console.log('📊 アップロード結果サマリー');
    console.log('='.repeat(60));

    const successful = results.filter(r => !r.error);
    const failed = results.filter(r => r.error);

    console.log(`✅ 成功: ${successful.length}件`);
    console.log(`❌ 失敗: ${failed.length}件`);

    if (successful.length > 0) {
      console.log('\n📝 成功した記事:');
      successful.forEach(result => {
        console.log(`  - ${result.title}`);
        console.log(`    🆔 WordPress ID: ${result.wordpressId}`);
        console.log(`    🔗 下書きURL: ${result.draftUrl}`);
        console.log('');
      });
    }

    if (failed.length > 0) {
      console.log('\n❌ 失敗した記事:');
      failed.forEach(result => {
        console.log(`  - ${path.basename(result.file)}: ${result.error}`);
      });
    }

    console.log('='.repeat(60));
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
      console.error('\n.envファイルまたは環境変数に以下を設定してください:');
      console.error('  WORDPRESS_API_URL=https://your-site.com/wp-json/wp/v2');
      console.error('  WORDPRESS_USERNAME=your-username');
      console.error('  WORDPRESS_APP_PASSWORD=your-app-password');
      return false;
    }

    return true;
  }
}

/**
 * 直接実行時の処理
 */
async function main() {
  const uploader = new MarkdownUploader();
  
  try {
    // 環境変数チェック
    const envOk = await uploader.checkEnvironmentVariables();
    if (!envOk) {
      process.exit(1);
    }

    // アップロード実行
    await uploader.run();
    
    console.log('\n🎉 Markdown記事のWordPressアップロードが正常に完了しました！');
    
  } catch (error) {
    console.error('❌ 実行エラー:', error.message);
    process.exit(1);
  }
}

// 直接実行時のみメイン関数を実行
if (require.main === module) {
  main();
}

module.exports = MarkdownUploader;