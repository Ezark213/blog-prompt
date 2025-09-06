const fs = require('fs').promises;
const path = require('path');

class PromptManager {
  constructor() {
    this.prompts = new Map();
    this.promptsDir = path.join(__dirname, '../../');
  }
  
  async loadAllPrompts() {
    try {
      // 記事作成プロンプト（正しいパス）
      this.prompts.set('wordpress', 
        await fs.readFile(path.join(this.promptsDir, 'docs/prompts/wordpress_article_generator.md'), 'utf8')
      );
      
      // 図表生成プロンプト（正しいパス）
      this.prompts.set('charts',
        await fs.readFile(path.join(this.promptsDir, 'docs/prompts/chart_generator.md'), 'utf8')
      );
      
      // スキーマ生成プロンプト（正しいパス）
      this.prompts.set('schema',
        await fs.readFile(path.join(this.promptsDir, 'docs/prompts/schema_markup_generator.md'), 'utf8')
      );
      
      console.log('✅ プロンプトファイル読み込み完了');
      console.log(`📄 WordPress プロンプトサイズ: ${this.prompts.get('wordpress').length}文字`);
      console.log(`📊 図表プロンプトサイズ: ${this.prompts.get('charts').length}文字`);
      console.log(`🏷️ スキーマプロンプトサイズ: ${this.prompts.get('schema').length}文字`);
      
    } catch (error) {
      console.error('❌ プロンプト読み込みエラー:', error);
      console.error('ファイルパスを確認してください:');
      console.error('- docs/prompts/wordpress_article_generator.md');
      console.error('- docs/prompts/chart_generator.md');  
      console.error('- docs/prompts/schema_markup_generator.md');
      throw error;
    }
  }
  
  buildWordPressPrompt(researchData) {
    const basePrompt = this.prompts.get('wordpress');
    
    if (!basePrompt) {
      throw new Error('WordPressプロンプトが読み込まれていません');
    }
    
    // リサーチデータの詳細情報を含める
    const researchContent = researchData.rawContent ? researchData.rawContent.substring(0, 3000) : '詳細なリサーチ内容が提供されていません。';
    const headingsText = researchData.headings ? researchData.headings.map(h => `- ${h.text}`).join('\n') : '見出し構成が提供されていません。';
    
    return `${basePrompt}

【詳細リサーチデータ】
キーワード: ${researchData.mainKeyword || '未設定'}
想定文字数: ${researchData.targetWordCount || 5000}文字
記事タイトル: ${researchData.title || 'タイトル未設定'}

【見出し構成案】
${headingsText}

【リサーチ内容】
${researchContent}

【記事生成の厳守事項】
1. **文字数厳守**: ${researchData.targetWordCount || 5000}文字以上を必ず達成してください
2. **WordPress完全対応**: 
   - 全段落を <!-- wp:paragraph --><p>内容</p><!-- /wp:paragraph --> で囲む
   - 見出しを <!-- wp:heading {"level":2} --><h2>見出し</h2><!-- /wp:heading --> で囲む
   - リストを <!-- wp:list --><ul><li>項目</li></ul><!-- /wp:list --> で囲む
3. **豊富なコンテンツ**: 
   - 具体例を3つ以上含める
   - 実務に役立つ詳細情報を提供
   - 初心者向けの丁寧な解説を心がける
4. **キャラクター会話必須**: 
   - ゆーた（関西弁の実務家）とぜいむたんの会話を記事中に3回以上挿入
   - 会話は <!-- wp:html -->[speech_balloon id="1"]内容[/speech_balloon]<!-- /wp:html --> 形式
5. **SEO最適化**:
   - H2見出しを最低4つ以上設置
   - H3見出しでサブトピックを詳しく展開
   - キーワードを自然に織り込む

【絶対禁止事項】
- Markdown記法（##、**、-）の使用
- 薄い内容・手抜き記事
- 文字数不足
- WordPressブロック形式以外の記法

上記の全指示に従って、実務的で価値の高い完全な記事を生成してください。読者が「この記事を読んで本当に良かった」と感じる品質を目指してください。`;
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
  
  buildSchemaPrompt(researchData) {
    const basePrompt = this.prompts.get('schema');
    
    return `${basePrompt}

【スキーママークアップ生成指示】
以下の記事情報に基づき、上記プロンプトに完全準拠したSchema.org構造化データを生成してください。

【記事情報】
記事タイトル: ${researchData.title}
メインキーワード: ${researchData.mainKeyword}
想定文字数: ${researchData.targetWordCount}文字

【必須要件】
1. JSON-LD形式でのschema.org構造化データを記事の最後に含める
2. Article、FAQPage、HowTo等の適切なスキーマタイプを選択
3. 実際の記事内容と完全に連動したデータのみ使用

上記プロンプトの全指示に従い、完全なスキーママークアップを生成してください。`;
  }
}

module.exports = PromptManager;