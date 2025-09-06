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
      "description": articleData.metaDescription || `${researchData.mainKeyword}について詳しく解説した実務重視の記事です。`,
      "datePublished": new Date().toISOString(),
      "dateModified": new Date().toISOString(),
      "url": `https://ezark-tax-accounting.com/${articleData.slug || 'accounting-guide'}/`,
      "image": {
        "@type": "ImageObject",
        "url": "https://ezark-tax-accounting.com/wp-content/uploads/2024/default-article-image.jpg",
        "width": 1200,
        "height": 630
      },
      "author": {
        "@type": "Person",
        "name": "ゆーた（会計士）",
        "description": "freee・マネーフォワード等のクラウド会計ソフト導入支援を専門とする実務家会計士。税務・会計の複雑な問題を初心者にもわかりやすく解説。",
        "url": "https://ezark-tax-accounting.com/author/yuta/",
        "sameAs": [
          "https://twitter.com/ezark_accounting",
          "https://linkedin.com/in/ezark-yuta"
        ]
      },
      "publisher": {
        "@type": "Organization",
        "name": "EZARK税務・会計",
        "logo": {
          "@type": "ImageObject",
          "url": "https://ezark-tax-accounting.com/wp-content/uploads/2024/logo.png",
          "width": 400,
          "height": 60
        }
      },
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": `https://ezark-tax-accounting.com/${articleData.slug || 'accounting-guide'}/`
      },
      "keywords": [researchData.mainKeyword, "会計ソフト", "税務", "経理", "確定申告"].join(", "),
      "articleSection": "税務・会計",
      "wordCount": articleData.metadata?.wordCount || researchData.targetWordCount,
      "about": {
        "@type": "Thing",
        "name": researchData.mainKeyword,
        "description": `${researchData.mainKeyword}に関する実務的な情報とノウハウ`
      }
    };

    // FAQがある場合の追加
    if (researchData.headings && researchData.headings.some(h => h.text.includes('質問'))) {
      schema.mainEntity = {
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": `${researchData.mainKeyword}の基本的な使い方は？`,
            "acceptedAnswer": {
              "@type": "Answer",
              "text": `${researchData.mainKeyword}は初心者でも使いやすいクラウド型のシステムです。基本設定から日常操作まで、段階的に学習することで効率的に活用できます。`
            }
          }
        ]
      };
    }
    
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