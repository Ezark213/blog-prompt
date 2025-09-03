const OpenAI = require('openai');

class SEOOptimizer {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
  }
  
  async generateAllSEOData(article, researchData, promptManager) {
    console.log('🎯 SEOメタデータ自動生成...');
    
    const slug = this.generateSlug(researchData.title, researchData.mainKeyword);
    const metaDescription = this.generateMetaDescription(article.content, researchData.mainKeyword);
    
    // スキーママークアップ生成
    const schemaMarkup = await this.generateSchemaMarkupWithPrompt(
      { ...article, slug, metaDescription }, 
      researchData, 
      promptManager
    );
    
    return {
      slug: slug,
      metaDescription: metaDescription,
      schemaMarkup: schemaMarkup,
      seoScore: this.calculateSEOScore(article.content, researchData.mainKeyword)
    };
  }
  
  async generateSchemaMarkupWithPrompt(articleData, researchData, promptManager) {
    const prompt = promptManager.buildSchemaPrompt(articleData, researchData);
    
    try {
      console.log('🏷️ Schema.org構造化データ生成中...');
      
      const response = await this.openai.chat.completions.create({
        model: "gpt-4-turbo-preview",
        messages: [
          {
            role: "system",
            content: "あなたはSEOとSchema.org構造化データのエキスパートです。EZARK税務・会計専用の高品質なSchema.org構造化データ（JSON-LD形式）を生成してください。"
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 2000,
        temperature: 0.3
      });
      
      return response.choices[0].message.content;
      
    } catch (error) {
      console.error('❌ スキーマ生成エラー:', error);
      return this.generateFallbackSchema(articleData, researchData);
    }
  }
  
  generateSlug(title, keyword) {
    const keywordMap = {
      '会計ソフト': 'accounting-software',
      'インボイス': 'invoice',
      '確定申告': 'tax-return',
      'freee': 'freee',
      'マネーフォワード': 'moneyforward'
    };
    
    return keywordMap[keyword] || 'accounting-guide';
  }
  
  generateMetaDescription(articleContent, keyword) {
    // 記事の最初の部分から抽出
    const firstPart = articleContent.substring(0, 500);
    const sentences = firstPart.split(/[。！？]/).filter(s => s.length > 10);
    
    let meta = sentences[0] || `${keyword}について詳しく解説します。`;
    
    if (meta.length > 155) {
      meta = meta.substring(0, 152) + '...';
    }
    
    return meta;
  }
  
  generateFallbackSchema(articleData, researchData) {
    const schema = {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      "headline": researchData.title,
      "description": articleData.metaDescription,
      "datePublished": new Date().toISOString(),
      "author": {
        "@type": "Person",
        "name": "ゆーた（会計士）"
      }
    };
    
    return `<script type="application/ld+json">
${JSON.stringify(schema, null, 2)}
</script>`;
  }
  
  calculateSEOScore(content, keyword) {
    let score = 0;
    
    const keywordCount = (content.match(new RegExp(keyword, 'g')) || []).length;
    const totalWords = content.replace(/\s+/g, '').length;
    const density = keywordCount / totalWords * 100;
    
    if (density >= 0.5 && density <= 2.5) score += 50;
    if (content.includes('<!-- wp:paragraph -->')) score += 25;
    if (content.includes('swell-block-faq')) score += 25;
    
    return score;
  }
}

module.exports = SEOOptimizer;