const ArticleProcessor = require('./article_processor');
const SEOOptimizer = require('./seo_optimizer');

class ContentGenerator {
  async generateContent(researchData) {
    console.log('🚀 コンテンツ生成開始...');
    
    try {
      // 段階的記事生成
      const processor = new ArticleProcessor();
      const article = await processor.generateFullArticle(researchData);
      
      // SEOデータ生成
      const seoOptimizer = new SEOOptimizer();
      const seoData = await seoOptimizer.generateAllSEOData(
        article, 
        researchData, 
        article.promptManager
      );
      
      const result = {
        ...article,
        ...seoData,
        success: true,
        generatedAt: new Date().toISOString()
      };
      
      console.log('✅ コンテンツ生成完了');
      console.log(`📊 文字数: ${article.metadata.wordCount}文字`);
      console.log(`📊 図表数: ${article.metadata.chartCount}個`);
      console.log(`📈 SEOスコア: ${seoData.seoScore}/100`);
      
      return result;
      
    } catch (error) {
      console.error('❌ コンテンツ生成エラー:', error);
      throw error;
    }
  }
}

module.exports = ContentGenerator;