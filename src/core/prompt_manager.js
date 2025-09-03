const fs = require('fs').promises;
const path = require('path');

class PromptManager {
  constructor() {
    this.prompts = new Map();
    this.promptsDir = path.join(__dirname, '../../');
  }
  
  async loadAllPrompts() {
    try {
      // 記事作成プロンプト
      this.prompts.set('wordpress', 
        await fs.readFile(path.join(this.promptsDir, 'updated_wordpress_guide.md'), 'utf8')
      );
      
      // 図表生成プロンプト  
      this.prompts.set('charts',
        await fs.readFile(path.join(this.promptsDir, '# 会計・税務記事用モバイル最適化図表生成プロンプト【記事内容連動版】.md'), 'utf8')
      );
      
      // スキーマ生成プロンプト
      this.prompts.set('schema',
        await fs.readFile(path.join(this.promptsDir, 'schema_markup_generator.md'), 'utf8')
      );
      
      console.log('✅ プロンプトファイル読み込み完了');
      
    } catch (error) {
      console.error('❌ プロンプト読み込みエラー:', error);
      throw error;
    }
  }
  
  buildWordPressPrompt(researchData) {
    const basePrompt = this.prompts.get('wordpress');
    
    return `${basePrompt}

【記事生成指示】
以下のディープリサーチ結果に基づき、上記プロンプトに完全準拠した記事を生成してください。

キーワード: ${researchData.mainKeyword}
想定文字数: ${researchData.targetWordCount}文字
タイトル: ${researchData.title}
見出し構成: ${JSON.stringify(researchData.headings, null, 2)}

【必須要件】
1. 文字数: ${researchData.targetWordCount}文字以上を厳守
2. WordPress完全対応: <!-- wp:paragraph --> 等のブロック形式必須
3. SEO最適化: H1→H2→H3構造でキーワード戦略的配置
4. キャラクター会話: ゆーた（関西弁）・ぜいむたん実装必須
5. 構造化データ: FAQ、Step等の実装必須

必ず上記プロンプトの全指示に従い、手抜き一切なしで完全な記事を生成してください。`;
  }
  
  buildChartPrompt(articleContent, researchData) {
    const basePrompt = this.prompts.get('charts');
    
    return `${basePrompt}

【図表生成指示】
以下の記事内容を詳細分析し、記事内容に完全連動した図表を適切な数生成してください。

【記事内容】
${articleContent}

【リサーチデータ】  
${JSON.stringify(researchData, null, 2)}

【厳守事項】
1. 記事内の実際のデータ・数値のみ使用（推測禁止）
2. 適切な埋め込み位置を具体的に提案
3. モバイル最適化必須
4. JavaScript完全禁止、CSS分離必須`;
  }
  
  buildSchemaPrompt(articleData, researchData) {
    const basePrompt = this.prompts.get('schema');
    
    return `${basePrompt}

【スキーママークアップ生成指示】
以下の記事情報に基づき、上記プロンプトに完全準拠したSchema.org構造化データを生成してください。

【記事情報】
ブログURL: https://ezark-tax-accounting.com/${articleData.slug || 'sample-article'}/
記事タイトル: ${researchData.title}
記事内容: ${articleData.content}
文字数: ${articleData.metadata?.wordCount || 0}

上記プロンプトの全指示に従い、完全なスキーママークアップを生成してください。`;
  }
}

module.exports = PromptManager;