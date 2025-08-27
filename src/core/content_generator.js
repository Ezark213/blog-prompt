const fs = require('fs-extra');
const path = require('path');
const { OpenAI } = require('openai');
const winston = require('winston');

// ロガー設定
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ timestamp, level, message }) => {
      return `${timestamp} [${level}]: ${message}`;
    })
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/content_generator.log' })
  ]
});

class ContentGenerator {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
    
    this.inputDir = path.join(__dirname, '../../outputs/parsed_research');
    this.outputDir = path.join(__dirname, '../../outputs/generated_content');
    this.promptsDir = path.join(__dirname, '../../prompts');
    
    // WordPressガイドプロンプトを読み込み
    this.wordpressPrompt = null;
  }

  /**
   * 初期化 - プロンプトファイルの読み込み
   */
  async initialize() {
    try {
      const wordpressGuideFile = path.join(__dirname, '../../updated_wordpress_guide.md');
      this.wordpressPrompt = await fs.readFile(wordpressGuideFile, 'utf-8');
      logger.info('WordPressガイドプロンプト読み込み完了');
    } catch (error) {
      logger.error(`プロンプト読み込みエラー: ${error.message}`);
      throw error;
    }
  }

  /**
   * リサーチデータから記事を生成
   */
  async generateArticle(researchData) {
    try {
      logger.info(`記事生成開始: ${researchData.metaData.title}`);
      
      await this.initialize();
      
      // WordPress記事本文生成
      const articleContent = await this.generateWordPressContent(researchData);
      
      // SEO要素統合
      const seoOptimized = await this.applySEOOptimization(articleContent, researchData);
      
      // スキーママークアップ生成
      const schema = await this.generateSchemaMarkup(researchData);
      
      const result = {
        sourceFile: researchData.sourceFile,
        title: seoOptimized.title,
        content: seoOptimized.content,
        metaDescription: seoOptimized.metaDescription,
        slug: researchData.metaData.slug,
        categories: researchData.metaData.categories,
        tags: researchData.metaData.tags,
        focusKeyword: researchData.metaData.focusKeyword,
        schema: schema,
        wordCount: this.countWords(seoOptimized.content),
        estimatedReadTime: this.calculateReadTime(seoOptimized.content),
        generatedAt: new Date().toISOString()
      };

      // 結果を保存
      await this.saveGeneratedContent(result);
      
      logger.info(`記事生成完了: ${researchData.metaData.title}`);
      return result;

    } catch (error) {
      logger.error(`記事生成エラー: ${error.message}`);
      throw error;
    }
  }

  /**
   * WordPress形式記事コンテンツ生成
   */
  async generateWordPressContent(researchData) {
    try {
      const prompt = this.buildContentGenerationPrompt(researchData);
      
      const response = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system", 
            content: this.wordpressPrompt
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 8000,
        temperature: 0.7
      });

      return response.choices[0].message.content;

    } catch (error) {
      logger.error(`WordPress記事生成エラー: ${error.message}`);
      throw error;
    }
  }

  /**
   * コンテンツ生成プロンプト構築
   */
  buildContentGenerationPrompt(researchData) {
    return `
以下のリサーチデータに基づいて、WordPress記事を生成してください。

## リサーチデータ
**タイトル**: ${researchData.metaData.title}
**メインキーワード**: ${researchData.keywords.primary}
**サブキーワード**: ${researchData.keywords.secondary.join(', ')}
**ターゲット**: ${researchData.targetAudience}
**記事タイプ**: ${researchData.contentType}

## 記事構成要求
${researchData.structure.sections.map(section => 
  `- ${section.title}（約${section.estimatedLength}文字）`
).join('\n')}

## 特別要求事項
- 実務家「ゆーた（関西弁）」と初心者「ぜいむたん」の会話を含める
- 具体的な操作手順を図表化対象として明示
- SEO最適化された見出し構造
- モバイル読みやすさを重視

記事を生成してください。
`;
  }

  /**
   * SEO最適化適用
   */
  async applySEOOptimization(content, researchData) {
    try {
      // タイトル最適化
      const optimizedTitle = await this.optimizeTitle(researchData.metaData.title, researchData.keywords);
      
      // メタディスクリプション最適化
      const optimizedMeta = await this.optimizeMetaDescription(content, researchData.keywords);
      
      // コンテンツ内キーワード密度調整
      const optimizedContent = await this.optimizeKeywordDensity(content, researchData.keywords);
      
      return {
        title: optimizedTitle,
        content: optimizedContent,
        metaDescription: optimizedMeta
      };

    } catch (error) {
      logger.error(`SEO最適化エラー: ${error.message}`);
      return {
        title: researchData.metaData.title,
        content: content,
        metaDescription: researchData.metaData.metaDescription
      };
    }
  }

  /**
   * タイトル最適化
   */
  async optimizeTitle(originalTitle, keywords) {
    const prompt = `
以下のタイトルをSEO最適化してください：

原題: ${originalTitle}
メインキーワード: ${keywords.primary}
関連キーワード: ${keywords.secondary.join(', ')}

要求:
- 32文字以内
- メインキーワード含有
- クリック率向上
- 検索意図対応

最適化タイトル:
`;

    try {
      const response = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 100,
        temperature: 0.3
      });

      return response.choices[0].message.content.trim();
    } catch (error) {
      logger.warn(`タイトル最適化失敗、原題を使用: ${error.message}`);
      return originalTitle;
    }
  }

  /**
   * メタディスクリプション最適化
   */
  async optimizeMetaDescription(content, keywords) {
    const contentSample = content.substring(0, 500);
    const prompt = `
以下の記事内容からSEO最適化メタディスクリプションを生成：

記事抜粋: ${contentSample}
メインキーワード: ${keywords.primary}

要求:
- 120文字以内
- 検索意図に対応
- クリック促進
- キーワード自然含有

メタディスクリプション:
`;

    try {
      const response = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 150,
        temperature: 0.5
      });

      return response.choices[0].message.content.trim();
    } catch (error) {
      logger.warn(`メタディスクリプション生成失敗: ${error.message}`);
      return `${keywords.primary}について実務家が詳しく解説。初心者にもわかりやすく説明します。`;
    }
  }

  /**
   * キーワード密度最適化
   */
  async optimizeKeywordDensity(content, keywords) {
    // キーワード密度チェック
    const primaryCount = (content.match(new RegExp(keywords.primary, 'gi')) || []).length;
    const totalWords = this.countWords(content);
    const density = (primaryCount / totalWords) * 100;
    
    logger.info(`キーワード密度: ${density.toFixed(2)}% (${primaryCount}/${totalWords})`);
    
    // 密度が低すぎる場合の調整は人間が判断
    if (density < 0.5) {
      logger.warn(`キーワード密度が低すぎます: ${density.toFixed(2)}%`);
    } else if (density > 3.0) {
      logger.warn(`キーワード密度が高すぎます: ${density.toFixed(2)}%`);
    }
    
    return content;
  }

  /**
   * スキーママークアップ生成
   */
  async generateSchemaMarkup(researchData) {
    const schema = {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": researchData.metaData.title,
      "description": researchData.metaData.metaDescription,
      "author": {
        "@type": "Person",
        "name": "ゆーた",
        "description": "freee・マネーフォワード等の会計ソフト導入支援の実務家"
      },
      "publisher": {
        "@type": "Organization",
        "name": "EZARK税務・会計",
        "logo": {
          "@type": "ImageObject",
          "url": "https://ezark-tax-accounting.com/wp-content/uploads/logo.png"
        }
      },
      "datePublished": researchData.publishDate,
      "dateModified": new Date().toISOString(),
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": `https://ezark-tax-accounting.com/${researchData.metaData.slug}`
      },
      "articleSection": "税務・会計",
      "keywords": [researchData.keywords.primary, ...researchData.keywords.secondary],
      "about": researchData.keywords.related.map(keyword => ({
        "@type": "Thing",
        "name": keyword,
        "description": `${keyword}に関する情報`
      }))
    };

    return JSON.stringify(schema, null, 2);
  }

  /**
   * 生成コンテンツ保存
   */
  async saveGeneratedContent(contentData) {
    await fs.ensureDir(this.outputDir);
    const fileName = contentData.sourceFile.replace(/\.[^/.]+$/, '_content.json');
    const outputPath = path.join(this.outputDir, fileName);
    
    await fs.writeJson(outputPath, contentData, { spaces: 2 });
    logger.info(`生成コンテンツ保存完了: ${outputPath}`);
    
    return outputPath;
  }

  /**
   * 全構造化データの処理
   */
  async generateAllArticles() {
    try {
      const structuredFiles = await fs.readdir(this.inputDir);
      const results = [];
      
      for (const file of structuredFiles) {
        if (file.endsWith('_structured.json')) {
          const filePath = path.join(this.inputDir, file);
          const researchData = await fs.readJson(filePath);
          
          const article = await this.generateArticle(researchData);
          results.push(article);
        }
      }
      
      logger.info(`${results.length}個の記事を生成しました`);
      return results;
      
    } catch (error) {
      logger.error(`バッチ記事生成エラー: ${error.message}`);
      throw error;
    }
  }

  // ユーティリティメソッド
  countWords(text) {
    // HTML タグを除去して文字数カウント
    const cleanText = text.replace(/<[^>]*>/g, '');
    return cleanText.length;
  }

  calculateReadTime(text) {
    const wordsPerMinute = 400; // 日本語の平均読書速度
    const wordCount = this.countWords(text);
    return Math.ceil(wordCount / wordsPerMinute);
  }
}

// 直接実行時の処理
if (require.main === module) {
  const generator = new ContentGenerator();
  generator.generateAllArticles()
    .then(results => {
      console.log('✅ 記事生成完了:', results.length);
      console.log('生成された記事:');
      results.forEach(article => {
        console.log(`  - ${article.title} (${article.wordCount}文字)`);
      });
    })
    .catch(error => {
      console.error('❌ エラー:', error.message);
      process.exit(1);
    });
}

module.exports = ContentGenerator;