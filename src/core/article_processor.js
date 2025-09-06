const OpenAI = require('openai');
const PromptManager = require('./prompt_manager');
const ContentFormatter = require('../utils/content_formatter');

class ArticleProcessor {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
    this.promptManager = new PromptManager();
  }
  
  async generateFullArticle(researchData) {
    console.log('🎯 段階的記事生成開始...');
    
    // プロンプト読み込み
    await this.promptManager.loadAllPrompts();
    
    // PHASE 2: 詳細コンテンツ生成（プロンプト完全適用）
    console.log('✍️ PHASE 2: 詳細コンテンツ生成...');
    const fullContent = await this.generateDetailedContent(researchData);
    
    // PHASE 3: 図表生成
    console.log('📊 PHASE 3: 図表生成...');
    const charts = await this.generateCharts(fullContent, researchData);
    
    // PHASE 4: 統合・最終調整
    console.log('🔧 PHASE 4: 統合・最終調整...');
    const finalArticle = await this.integrateArticleWithCharts(fullContent, charts);
    
    return {
      content: finalArticle,
      originalContent: fullContent,
      charts: charts,
      metadata: this.extractMetadata(finalArticle),
      promptManager: this.promptManager
    };
  }
  
  async generateDetailedContent(researchData) {
    const prompt = this.promptManager.buildWordPressPrompt(researchData);
    const schemaPrompt = this.promptManager.buildSchemaPrompt(researchData);
    
    try {
      console.log('📝 OpenAI APIで記事生成中...');
      
      const response = await this.openai.chat.completions.create({
        model: "gpt-4-turbo-preview",
        messages: [
          {
            role: "system",
            content: `あなたは40年の経験を持つ税務・会計記事の専門ライターです。指示されたプロンプトに完全に従い、読者に価値を提供する高品質な記事を生成してください。

            【重要】記事生成ルール：
            1. **Markdown記法は一切使用禁止**（##、**、-等は使わない）
            2. **見出しは必ずHTMLタグ**（<h2>、<h3>等）
            3. **WordPressブロックエディタ形式必須**：
               - 段落: <!-- wp:paragraph --><p>内容</p><!-- /wp:paragraph -->
               - 見出し: <!-- wp:heading {"level":2} --><h2>見出し</h2><!-- /wp:heading -->
               - リスト: <!-- wp:list --><ul><li>項目</li></ul><!-- /wp:list -->
               - HTML: <!-- wp:html -->カスタムHTML<!-- /wp:html -->
            4. **Swellテーマ吹き出しの正しい実装**：
               <!-- wp:html -->[speech_balloon id="1"]会話内容[/speech_balloon]<!-- /wp:html -->
            5. **スキーママークアップ必須**：
               記事の最後に構造化データ（JSON-LD）を必ず含めること
            
            手抜きは一切許されません。WordPressブロック形式を完璧に実装してください。`
          },
          {
            role: "user", 
            content: `${prompt}\n\n【追加要求：スキーママークアップ生成】\n${schemaPrompt}`
          }
        ],
        max_tokens: 4000,
        temperature: 0.7
      });
      
      let content = response.choices[0].message.content;
      
      // コンテンツ品質チェック
      const validation = ContentFormatter.validateContent(content);
      if (!validation.isValid) {
        console.warn('⚠️ コンテンツ形式の問題が検出されました:', validation.issues);
        
        // 自動修正を実行
        console.log('🔧 自動修正を実行中...');
        content = ContentFormatter.convertMarkdownToWordPress(content);
        content = ContentFormatter.fixSpeechBalloons(content);
        
        // 修正後の再チェック
        const revalidation = ContentFormatter.validateContent(content);
        if (revalidation.isValid) {
          console.log('✅ コンテンツ形式の修正完了');
        } else {
          console.warn('⚠️ 一部の問題が修正できませんでした:', revalidation.issues);
        }
      }
      
      // 最低文字数チェック
      const wordCount = this.countWords(content);
      console.log(`📊 生成された文字数: ${wordCount}文字`);
      
      if (wordCount < researchData.targetWordCount * 0.8) {
        console.warn(`⚠️ 文字数不足: ${wordCount}/${researchData.targetWordCount}`);
      }
      
      return content;
      
    } catch (error) {
      console.error('❌ 記事生成エラー:', error);
      throw error;
    }
  }
  
  async generateCharts(articleContent, researchData) {
    const prompt = this.promptManager.buildChartPrompt(articleContent, researchData);
    
    try {
      console.log('📊 図表生成中...');
      
      const response = await this.openai.chat.completions.create({
        model: "gpt-4-turbo-preview",
        messages: [
          {
            role: "system", 
            content: "あなたは記事内容分析と図表生成の専門家です。記事の実際の内容のみに基づき、推測を一切せず、適切な図表を生成してください。"
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 3000,
        temperature: 0.3
      });
      
      return this.parseChartsResponse(response.choices[0].message.content);
      
    } catch (error) {
      console.error('❌ 図表生成エラー:', error);
      return { charts: [], embedPositions: [] };
    }
  }
  
  async integrateArticleWithCharts(articleContent, chartsData) {
    if (!chartsData.charts || chartsData.charts.length === 0) {
      console.log('ℹ️ 図表なし - 記事のみ返却');
      return articleContent;
    }
    
    let finalContent = articleContent;
    
    // 各図表を適切な位置に埋め込み
    for (const chart of chartsData.charts) {
      const position = this.findOptimalPosition(finalContent, chart);
      finalContent = this.insertChartAtPosition(finalContent, chart.html, position);
      console.log(`📊 図表埋め込み完了: ${chart.id || 'chart'}`);
    }
    
    return finalContent;
  }
  
  countWords(text) {
    // 日本語文字数カウント
    return text.replace(/\s+/g, '').length;
  }
  
  parseChartsResponse(response) {
    const charts = [];
    
    // レスポンスから図表HTMLを抽出
    const chartMatches = response.match(/<!-- wp:html -->([\s\S]*?)<!-- \/wp:html -->/g);
    
    if (chartMatches) {
      chartMatches.forEach((match, index) => {
        charts.push({
          id: `chart_${index}`,
          html: match,
          embedPosition: index * 500 // 簡易位置計算
        });
      });
      
      console.log(`📊 ${charts.length}個の図表を検出`);
    }
    
    return { charts };
  }
  
  findOptimalPosition(content, chart) {
    // 簡易位置検出（H2見出しの後）
    const h2Positions = [];
    let match;
    const h2Regex = /<h2/g;
    
    while ((match = h2Regex.exec(content)) !== null) {
      h2Positions.push(match.index);
    }
    
    // 中間位置を返す
    const targetIndex = Math.floor(h2Positions.length / 2);
    return h2Positions[targetIndex] || 1000;
  }
  
  insertChartAtPosition(content, chartHtml, position) {
    const lines = content.split('\n');
    const linePosition = Math.floor(position / 100); // おおよその行数変換
    
    lines.splice(linePosition, 0, '', chartHtml, '');
    return lines.join('\n');
  }
  
  extractMetadata(content) {
    return {
      wordCount: this.countWords(content),
      headingCount: (content.match(/<h[2-6]/g) || []).length,
      chartCount: (content.match(/<!-- wp:html -->/g) || []).length,
      hasDialogues: /\[speech_balloon/.test(content),
      hasFAQ: /swell-block-faq/.test(content)
    };
  }
}

module.exports = ArticleProcessor;