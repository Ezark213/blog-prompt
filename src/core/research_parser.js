const fs = require('fs-extra');
const path = require('path');
const marked = require('marked');
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
    new winston.transports.File({ filename: 'logs/research_parser.log' })
  ]
});

class ResearchParser {
  constructor() {
    this.pendingDir = path.join(__dirname, '../../inputs/research_results/pending');
    this.completedDir = path.join(__dirname, '../../inputs/research_results/completed');
    this.outputDir = path.join(__dirname, '../../outputs/parsed_research');
  }

  /**
   * GPTディープリサーチ結果を解析・構造化（複数記事対応）
   */
  async parseGPTResearch(researchFile) {
    try {
      logger.info(`リサーチファイル解析開始: ${researchFile}`);
      
      const filePath = path.join(this.pendingDir, researchFile);
      const content = await fs.readFile(filePath, 'utf-8');
      
      // ファイル形式判定（JSON or Markdown）
      let parsedData;
      if (researchFile.endsWith('.json')) {
        parsedData = JSON.parse(content);
      } else if (researchFile.endsWith('.md')) {
        parsedData = await this.parseMarkdownResearch(content);
      } else {
        throw new Error('未対応のファイル形式です');
      }

      // 複数記事の場合は配列で処理
      const results = [];
      const articles = parsedData.articles || [parsedData];

      for (let i = 0; i < articles.length; i++) {
        const articleData = articles[i];
        
        // 必要な情報を抽出・構造化
        const structuredData = await this.structureResearchData(articleData);
        
        // キーワード抽出・最適化
        const optimizedKeywords = await this.extractKeywords(structuredData);
        
        // 記事構成の構造化
        const articleStructure = await this.structureArticle(structuredData);
        
        // メタデータ準備
        const metaData = await this.prepareMetaData(structuredData);

        const result = {
          sourceFile: researchFile,
          articleIndex: i + 1,
          keywords: optimizedKeywords,
          structure: articleStructure,
          competitorAnalysis: structuredData.competitors || [],
          metaData: metaData,
          seoStrategy: structuredData.seoStrategy || {},
          targetAudience: structuredData.targetAudience || '会計ソフト初心者',
          publishDate: new Date().toISOString(),
          priority: structuredData.priority || 'medium'
        };

        // 個別結果を保存
        const outputFileName = `${researchFile.replace(/\.[^/.]+$/, '')}_article_${i + 1}_structured.json`;
        await this.saveStructuredData(result, outputFileName);
        
        results.push(result);
      }
      
      logger.info(`リサーチファイル解析完了: ${researchFile} (${results.length}記事)`);
      return results;

    } catch (error) {
      logger.error(`リサーチファイル解析エラー: ${error.message}`);
      throw error;
    }
  }

  /**
   * Markdownリサーチファイルの解析（5つの記事候補対応）
   */
  async parseMarkdownResearch(content) {
    const tokens = marked.lexer(content);
    const articles = [];
    let currentArticle = null;
    let currentSection = null;

    for (const token of tokens) {
      if (token.type === 'heading') {
        if (token.depth === 1) {
          // 新しい記事候補の開始
          if (currentArticle) {
            if (currentSection) {
              currentArticle.sections.push(currentSection);
            }
            articles.push(currentArticle);
          }
          currentArticle = {
            title: token.text,
            sections: [],
            keywords: [],
            competitors: [],
            dataPoints: []
          };
          currentSection = null;
        } else if (token.depth === 2 && currentArticle) {
          // セクションの開始
          if (currentSection) {
            currentArticle.sections.push(currentSection);
          }
          currentSection = {
            title: token.text,
            level: token.depth,
            content: []
          };
        }
      } else if (currentSection && currentArticle) {
        currentSection.content.push(token);
        
        // キーワードの自動抽出
        if (token.type === 'text' && token.text.includes('キーワード')) {
          const keywords = this.extractKeywordsFromText(token.text);
          currentArticle.keywords.push(...keywords);
        }
        
        // 競合情報の抽出
        if (token.type === 'text' && token.text.includes('競合')) {
          const competitors = this.extractCompetitorsFromText(token.text);
          currentArticle.competitors.push(...competitors);
        }
        
        // データポイントの抽出
        if (token.type === 'text' && /\d+/.test(token.text)) {
          const dataPoints = this.extractDataPointsFromText(token.text);
          currentArticle.dataPoints.push(...dataPoints);
        }
      }
    }

    // 最後の記事を追加
    if (currentArticle) {
      if (currentSection) {
        currentArticle.sections.push(currentSection);
      }
      articles.push(currentArticle);
    }

    return { articles };
  }

  /**
   * リサーチデータの構造化
   */
  async structureResearchData(rawData) {
    return {
      title: rawData.title || 'タイトル未設定',
      mainTopic: rawData.mainTopic || this.extractMainTopic(rawData),
      subTopics: rawData.subTopics || this.extractSubTopics(rawData),
      targetKeywords: rawData.keywords || [],
      competitors: rawData.competitors || [],
      dataPoints: rawData.dataPoints || [],
      targetAudience: rawData.targetAudience || '会計ソフト初心者',
      contentType: rawData.contentType || 'how-to',
      difficulty: rawData.difficulty || 'beginner',
      estimatedLength: rawData.estimatedLength || '3000-4000',
      priority: rawData.priority || 'medium'
    };
  }

  /**
   * SEO最適化キーワード抽出
   */
  async extractKeywords(structuredData) {
    const keywords = {
      primary: '',
      secondary: [],
      longtail: [],
      related: []
    };

    // メインキーワード抽出
    if (structuredData.targetKeywords.length > 0) {
      keywords.primary = structuredData.targetKeywords[0];
      keywords.secondary = structuredData.targetKeywords.slice(1, 4);
    }

    // ロングテールキーワード生成
    const longtailPatterns = [
      `${keywords.primary} 使い方`,
      `${keywords.primary} 初心者`,
      `${keywords.primary} 設定方法`,
      `${keywords.primary} おすすめ`,
      `${keywords.primary} 比較`
    ];
    keywords.longtail = longtailPatterns.filter(kw => kw !== ' 使い方');

    // 関連キーワード
    const relatedTerms = [
      '会計ソフト', 'クラウド会計', '確定申告', '自動仕訳', 
      'freee', 'マネーフォワード', '経理効率化', '税務申告'
    ];
    keywords.related = relatedTerms;

    return keywords;
  }

  /**
   * 記事構成の構造化
   */
  async structureArticle(structuredData) {
    const structure = {
      title: this.generateSEOTitle(structuredData),
      introduction: this.generateIntroduction(structuredData),
      sections: this.generateSections(structuredData),
      conclusion: this.generateConclusion(structuredData),
      faq: this.generateFAQ(structuredData),
      cta: this.generateCTA(structuredData)
    };

    return structure;
  }

  /**
   * SEO最適化タイトル生成
   */
  generateSEOTitle(data) {
    const primaryKeyword = data.targetKeywords[0] || data.mainTopic;
    const titlePatterns = [
      `${primaryKeyword}の使い方完全ガイド【初心者向け】`,
      `【2024年最新】${primaryKeyword}徹底解説`,
      `${primaryKeyword}でできること・設定方法まとめ`,
      `実務家が教える${primaryKeyword}活用法`
    ];
    
    return {
      recommended: titlePatterns[0],
      alternatives: titlePatterns.slice(1)
    };
  }

  /**
   * メタデータ準備
   */
  async prepareMetaData(structuredData) {
    const primaryKeyword = structuredData.targetKeywords[0] || structuredData.mainTopic;
    
    return {
      title: this.generateSEOTitle(structuredData).recommended,
      metaDescription: `${primaryKeyword}の使い方を実務家が詳しく解説。初期設定から実践的な活用法まで、初心者にもわかりやすく説明します。`,
      slug: this.generateSlug(primaryKeyword),
      categories: ['税務・会計', 'クラウド会計'],
      tags: structuredData.targetKeywords.slice(0, 5),
      focusKeyword: primaryKeyword,
      author: 'ゆーた',
      publishDate: new Date().toISOString()
    };
  }

  /**
   * URLスラッグ生成
   */
  generateSlug(keyword) {
    return keyword
      .toLowerCase()
      .replace(/[^a-zA-Z0-9ひらがなカタカナ漢字]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }

  /**
   * 構造化データを保存
   */
  async saveStructuredData(data, sourceFileName) {
    await fs.ensureDir(this.outputDir);
    const outputFileName = sourceFileName.replace(/\.[^/.]+$/, '_structured.json');
    const outputPath = path.join(this.outputDir, outputFileName);
    
    await fs.writeJson(outputPath, data, { spaces: 2 });
    logger.info(`構造化データ保存完了: ${outputPath}`);
    
    return outputPath;
  }

  /**
   * バリデーション
   */
  async validateResearchData(data) {
    const requiredFields = ['keywords', 'structure', 'targetAudience', 'metaData'];
    const missingFields = requiredFields.filter(field => !data[field]);
    
    if (missingFields.length > 0) {
      throw new Error(`必須フィールドが不足しています: ${missingFields.join(', ')}`);
    }
    
    return true;
  }

  /**
   * 全てのpendingファイルを処理
   */
  async processAllPendingFiles() {
    try {
      const pendingFiles = await fs.readdir(this.pendingDir);
      const allResults = [];
      
      for (const file of pendingFiles) {
        if (file.endsWith('.json') || file.endsWith('.md')) {
          const results = await this.parseGPTResearch(file);
          // 複数記事の場合は配列、単一記事の場合は要素として追加
          if (Array.isArray(results)) {
            allResults.push(...results);
          } else {
            allResults.push(results);
          }
          
          // 処理済みディレクトリに移動
          await fs.move(
            path.join(this.pendingDir, file),
            path.join(this.completedDir, file)
          );
        }
      }
      
      logger.info(`${allResults.length}個の記事を処理しました`);
      return allResults;
      
    } catch (error) {
      logger.error(`バッチ処理エラー: ${error.message}`);
      throw error;
    }
  }

  // ヘルパーメソッド
  extractKeywordsFromText(text) {
    // テキストからキーワードを抽出するロジック
    return text.match(/「([^」]+)」/g)?.map(match => match.slice(1, -1)) || [];
  }

  extractCompetitorsFromText(text) {
    // 競合情報を抽出するロジック
    const competitors = text.match(/https?:\/\/[^\s]+/g) || [];
    return competitors;
  }

  extractDataPointsFromText(text) {
    // 数値データを抽出するロジック
    const numbers = text.match(/\d+(?:,\d{3})*(?:\.\d+)?[円%万億千]/g) || [];
    return numbers;
  }

  extractMainTopic(data) {
    return data.title || data.sections?.[0]?.title || 'メイントピック';
  }

  extractSubTopics(data) {
    return data.sections?.map(section => section.title).slice(1, 6) || [];
  }

  generateIntroduction(data) {
    return `この記事では、${data.mainTopic}について実務家の視点から詳しく解説します。`;
  }

  generateSections(data) {
    return data.subTopics?.map((topic, index) => ({
      title: topic,
      order: index + 1,
      estimatedLength: '500-800',
      includeChart: index < 3
    })) || [];
  }

  generateConclusion(data) {
    return `${data.mainTopic}について解説しました。適切に活用して業務効率化を図りましょう。`;
  }

  generateFAQ(data) {
    return [
      {
        question: `${data.mainTopic}の設定方法は？`,
        answer: `初期設定から順番に進めることで簡単に設定できます。`
      }
    ];
  }

  generateCTA(data) {
    return `${data.mainTopic}でお困りの方は、ぜひお気軽にご相談ください。`;
  }
}

// 直接実行時の処理
if (require.main === module) {
  const parser = new ResearchParser();
  parser.processAllPendingFiles()
    .then(results => {
      console.log('✅ リサーチファイル解析完了:', results.length);
    })
    .catch(error => {
      console.error('❌ エラー:', error.message);
      process.exit(1);
    });
}

function parseResearch(researchContent) {
  console.log('📋 ディープリサーチ解析中...');
  
  try {
    // マークダウンからデータ抽出
    const lines = researchContent.split('\n');
    
    // タイトル抽出
    const titleMatch = researchContent.match(/対象キーワード:\s*(.+)/);
    const title = titleMatch ? titleMatch[1] : 'デフォルトタイトル';
    
    // 文字数抽出
    const wordCountMatch = researchContent.match(/想定文字数:\s*(\d+)/);
    const targetWordCount = wordCountMatch ? parseInt(wordCountMatch[1]) : 5000;
    
    // キーワード抽出
    const keywordMatch = researchContent.match(/対象キーワード:\s*(.+)/);
    const mainKeyword = keywordMatch ? keywordMatch[1] : title;
    
    // 見出し構成抽出（簡易版）
    const headings = [];
    lines.forEach(line => {
      if (line.startsWith('H2:') || line.startsWith('## ')) {
        headings.push({
          level: 2,
          text: line.replace(/^(H2:|## )/, '').trim()
        });
      }
    });
    
    const result = {
      title: title,
      mainKeyword: mainKeyword,
      targetWordCount: targetWordCount,
      headings: headings,
      competitiveAdvantage: 'SEO最適化と実務経験重視',
      detailLevel: 'professional',
      keywords: [mainKeyword]
    };
    
    console.log('✅ リサーチ解析完了');
    console.log(`📝 タイトル: ${result.title}`);
    console.log(`🎯 目標文字数: ${result.targetWordCount}`);
    
    return result;
    
  } catch (error) {
    console.error('❌ リサーチ解析エラー:', error);
    throw error;
  }
}

module.exports = { parseResearch, ResearchParser };