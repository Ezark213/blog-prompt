#!/usr/bin/env node

/**
 * 3つのプロンプト統合テスト
 * WordPress記事生成、スキーママークアップ、図表生成を統合
 */

const ArticleProcessor = require('./src/core/article_processor');
const SimpleResearchParser = require('./src/core/simple_research_parser');

async function testIntegratedGeneration() {
  try {
    console.log('🚀 統合記事生成テスト開始...');
    
    // 1. リサーチデータ読み込み
    const parser = new SimpleResearchParser();
    const researchData = await parser.parseManualResearch('【キーワード分析結果】.txt');
    
    console.log('✅ リサーチデータ読み込み完了');
    console.log(`📝 タイトル: ${researchData.title}`);
    console.log(`🎯 メインキーワード: ${researchData.mainKeyword}`);
    console.log(`📊 目標文字数: ${researchData.targetWordCount}`);
    
    // 2. ArticleProcessorで統合生成
    const processor = new ArticleProcessor();
    const result = await processor.generateFullArticle(researchData);
    
    // 3. 結果保存
    const outputData = {
      title: researchData.title,
      content: result.content,
      slug: generateSlug(researchData.mainKeyword),
      metaDescription: generateMetaDescription(result.content),
      categories: ['IT導入補助金', '会計ソフト', '補助金・助成金'],
      tags: ['IT導入補助金', '会計ソフト', 'freee', 'マネーフォワード', '弥生会計', '補助金申請', '業務効率化', 'デジタル化'],
      focusKeyword: 'IT導入補助金 会計ソフト',
      sourceFile: '【キーワード分析結果】.txt',
      generatedAt: new Date().toISOString(),
      metadata: result.metadata,
      charts: result.charts,
      hasSchema: /application\/ld\+json/.test(result.content)
    };
    
    const fs = require('fs').promises;
    const path = require('path');
    
    await fs.writeFile(
      path.join(__dirname, 'outputs/test_integrated_article.json'),
      JSON.stringify(outputData, null, 2),
      'utf8'
    );
    
    console.log('💾 統合記事保存完了: outputs/test_integrated_article.json');
    
    // 4. 結果検証
    console.log('\n📊 生成結果検証:');
    console.log(`✅ 記事生成: ${result.content ? '完了' : '失敗'}`);
    console.log(`✅ 文字数: ${result.metadata.wordCount}文字`);
    console.log(`✅ 見出し数: ${result.metadata.headingCount}個`);
    console.log(`✅ 図表数: ${result.metadata.chartCount}個`);
    console.log(`✅ スキーママークアップ: ${outputData.hasSchema ? '含まれています' : '含まれていません'}`);
    console.log(`✅ 吹き出し: ${result.metadata.hasDialogues ? '含まれています' : '含まれていません'}`);
    
    return outputData;
    
  } catch (error) {
    console.error('❌ 統合生成エラー:', error);
    throw error;
  }
}

function generateSlug(keyword) {
  const keywordMap = {
    'IT導入補助金 会計ソフト': 'it-subsidy-accounting-software',
    'IT導入補助金': 'it-introduction-subsidy',
    '会計ソフト': 'accounting-software',
    'freee': 'freee-guide',
    'マネーフォワード': 'moneyforward-guide'
  };
  
  return keywordMap[keyword] || 'it-subsidy-accounting-guide';
}

function generateMetaDescription(content) {
  const text = content.replace(/<[^>]*>/g, '').substring(0, 140);
  return text.trim() + '...';
}

// 直接実行
if (require.main === module) {
  testIntegratedGeneration()
    .then((result) => {
      console.log('\n🎉 統合記事生成テスト完了！');
      console.log(`📄 記事タイトル: ${result.title}`);
      console.log(`📊 最終文字数: ${result.metadata.wordCount}文字`);
    })
    .catch((error) => {
      console.error('❌ テスト失敗:', error.message);
      process.exit(1);
    });
}

module.exports = testIntegratedGeneration;