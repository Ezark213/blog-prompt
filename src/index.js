#!/usr/bin/env node

/**
 * EZARK税務・会計ブログ自動化システム - メインエントリーポイント
 * 
 * 使用方法:
 *   node src/index.js [command] [options]
 * 
 * Commands:
 *   full-automation  - 完全自動化実行
 *   parse-research   - リサーチ結果解析のみ
 *   generate-content - コンテンツ生成のみ
 *   publish          - WordPress投稿のみ
 *   test-connection  - WordPress接続テスト
 *   help            - ヘルプ表示
 */

const fs = require('fs-extra');
const path = require('path');
const winston = require('winston');
require('dotenv').config();

// コアモジュール
const ResearchParser = require('./core/research_parser');
const ContentGenerator = require('./core/content_generator');
const WordPressClient = require('./core/wordpress_client');

// ロガー設定
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.colorize(),
    winston.format.printf(({ timestamp, level, message }) => {
      return `${timestamp} [${level}]: ${message}`;
    })
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ 
      filename: path.join(__dirname, '../logs/system.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5
    })
  ]
});

class BlogAutomationSystem {
  constructor() {
    this.researchParser = new ResearchParser();
    this.contentGenerator = new ContentGenerator();
    this.wordpressClient = new WordPressClient();
    
    this.stats = {
      startTime: Date.now(),
      parsedFiles: 0,
      generatedArticles: 0,
      publishedArticles: 0,
      errors: 0
    };
  }

  /**
   * 完全自動化パイプライン実行
   */
  async runFullAutomation() {
    try {
      logger.info('🚀 完全自動化パイプライン開始');
      
      // 必須ディレクトリの作成
      await this.ensureDirectories();
      
      // 環境変数チェック
      await this.validateEnvironment();
      
      // ステップ1: リサーチファイル解析
      logger.info('📋 ステップ1: リサーチファイル解析');
      const parsedData = await this.researchParser.processAllPendingFiles();
      this.stats.parsedFiles = parsedData.length;
      
      if (parsedData.length === 0) {
        logger.info('ℹ️ 処理対象のリサーチファイルが見つかりませんでした');
        return this.generateReport();
      }
      
      // ステップ2: コンテンツ生成
      logger.info('📝 ステップ2: コンテンツ生成');
      const articles = await this.contentGenerator.generateAllArticles();
      this.stats.generatedArticles = articles.length;
      
      // ステップ3: WordPress投稿
      if (!process.env.DRY_RUN || process.env.DRY_RUN === 'false') {
        logger.info('📤 ステップ3: WordPress投稿');
        const publishedPosts = await this.wordpressClient.publishAllGeneratedArticles();
        this.stats.publishedArticles = publishedPosts.length;
      } else {
        logger.info('🧪 DRY_RUN モード - 実際の投稿はスキップ');
      }
      
      // 完了レポート生成
      const report = await this.generateReport();
      logger.info('✅ 完全自動化パイプライン完了');
      
      return report;
      
    } catch (error) {
      this.stats.errors++;
      logger.error(`❌ 完全自動化エラー: ${error.message}`);
      throw error;
    }
  }

  /**
   * リサーチファイル解析のみ実行
   */
  async parseResearch() {
    try {
      logger.info('📋 リサーチファイル解析開始');
      await this.ensureDirectories();
      
      const results = await this.researchParser.processAllPendingFiles();
      this.stats.parsedFiles = results.length;
      
      logger.info(`✅ リサーチファイル解析完了: ${results.length}個のファイル`);
      return results;
      
    } catch (error) {
      this.stats.errors++;
      logger.error(`❌ リサーチ解析エラー: ${error.message}`);
      throw error;
    }
  }

  /**
   * コンテンツ生成のみ実行
   */
  async generateContent() {
    try {
      logger.info('📝 コンテンツ生成開始');
      await this.ensureDirectories();
      await this.contentGenerator.initialize();
      
      const results = await this.contentGenerator.generateAllArticles();
      this.stats.generatedArticles = results.length;
      
      logger.info(`✅ コンテンツ生成完了: ${results.length}個の記事`);
      return results;
      
    } catch (error) {
      this.stats.errors++;
      logger.error(`❌ コンテンツ生成エラー: ${error.message}`);
      throw error;
    }
  }

  /**
   * WordPress投稿のみ実行
   */
  async publishToWordPress() {
    try {
      logger.info('📤 WordPress投稿開始');
      
      // 接続テスト
      const connected = await this.wordpressClient.testConnection();
      if (!connected) {
        throw new Error('WordPress接続に失敗しました');
      }
      
      const results = await this.wordpressClient.publishAllGeneratedArticles();
      this.stats.publishedArticles = results.length;
      
      logger.info(`✅ WordPress投稿完了: ${results.length}個の記事`);
      return results;
      
    } catch (error) {
      this.stats.errors++;
      logger.error(`❌ WordPress投稿エラー: ${error.message}`);
      throw error;
    }
  }

  /**
   * WordPress接続テスト
   */
  async testConnection() {
    try {
      logger.info('🔍 WordPress接続テスト開始');
      
      const connected = await this.wordpressClient.testConnection();
      
      if (connected) {
        logger.info('✅ WordPress接続成功');
        
        // サイト情報取得
        const siteInfo = await this.wordpressClient.getSiteInfo();
        logger.info(`📊 サイト情報: ${siteInfo.name}`);
        
        return { success: true, siteInfo };
      } else {
        logger.error('❌ WordPress接続失敗');
        return { success: false };
      }
      
    } catch (error) {
      logger.error(`❌ 接続テストエラー: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  /**
   * 必要ディレクトリの作成
   */
  async ensureDirectories() {
    const dirs = [
      'logs',
      'inputs/research_results/pending',
      'inputs/research_results/completed',
      'outputs/parsed_research',
      'outputs/generated_content',
      'outputs/published_posts',
      'temp'
    ];

    for (const dir of dirs) {
      await fs.ensureDir(path.join(__dirname, '..', dir));
    }

    logger.info('📁 ディレクトリ構造確認完了');
  }

  /**
   * 環境変数バリデーション
   */
  async validateEnvironment() {
    const requiredVars = [
      'OPENAI_API_KEY',
      'WORDPRESS_API_URL', 
      'WORDPRESS_USERNAME'
    ];

    const missing = requiredVars.filter(varName => !process.env[varName]);
    
    if (missing.length > 0) {
      throw new Error(`必須環境変数が不足しています: ${missing.join(', ')}`);
    }

    logger.info('✅ 環境変数チェック完了');
  }

  /**
   * 処理レポート生成
   */
  async generateReport() {
    const endTime = Date.now();
    const duration = Math.round((endTime - this.stats.startTime) / 1000);
    
    const report = {
      timestamp: new Date().toISOString(),
      duration: duration,
      statistics: this.stats,
      summary: {
        success: this.stats.errors === 0,
        totalProcessed: this.stats.parsedFiles,
        totalGenerated: this.stats.generatedArticles,
        totalPublished: this.stats.publishedArticles,
        errors: this.stats.errors
      }
    };

    // レポートファイル保存
    const reportPath = path.join(__dirname, '../outputs/reports', `report_${Date.now()}.json`);
    await fs.ensureDir(path.dirname(reportPath));
    await fs.writeJson(reportPath, report, { spaces: 2 });
    
    logger.info(`📊 処理レポート生成: ${reportPath}`);
    return report;
  }

  /**
   * ヘルプ表示
   */
  showHelp() {
    console.log(`
🤖 EZARK税務・会計ブログ自動化システム

使用方法:
  node src/index.js [command] [options]

コマンド:
  full-automation    完全自動化パイプライン実行
  parse-research     リサーチファイル解析のみ
  generate-content   コンテンツ生成のみ  
  publish           WordPress投稿のみ
  test-connection   WordPress接続テスト
  help              このヘルプを表示

環境変数:
  DRY_RUN=true       テストモード（実際には投稿しない）
  LOG_LEVEL=debug    詳細ログ出力
  DEBUG=true         デバッグモード

例:
  npm start                    # 完全自動化実行
  npm run parse-research       # リサーチ解析のみ
  npm run generate-content     # コンテンツ生成のみ
  npm run publish             # 投稿のみ
  DRY_RUN=true npm start      # テストモード実行

詳細: https://github.com/Ezark213/blog-prompt
    `);
  }
}

/**
 * メイン実行部分
 */
async function main() {
  const system = new BlogAutomationSystem();
  const command = process.argv[2] || 'full-automation';

  try {
    switch (command) {
      case 'full-automation':
      case 'full':
        await system.runFullAutomation();
        break;
        
      case 'parse-research':
      case 'parse':
        await system.parseResearch();
        break;
        
      case 'generate-content':
      case 'generate':
        await system.generateContent();
        break;
        
      case 'publish':
        await system.publishToWordPress();
        break;
        
      case 'test-connection':
      case 'test':
        await system.testConnection();
        break;
        
      case 'help':
      case '--help':
      case '-h':
        system.showHelp();
        break;
        
      default:
        console.error(`❌ 不明なコマンド: ${command}`);
        system.showHelp();
        process.exit(1);
    }

    process.exit(0);
    
  } catch (error) {
    logger.error(`❌ システムエラー: ${error.message}`);
    console.error('\nスタックトレース:', error.stack);
    process.exit(1);
  }
}

// プロセス終了ハンドリング
process.on('SIGINT', () => {
  logger.info('🛑 システム停止要求を受信');
  process.exit(0);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('未処理のPromise拒否:', reason);
  process.exit(1);
});

// 直接実行時のみメイン関数を実行
if (require.main === module) {
  main();
}

module.exports = BlogAutomationSystem;