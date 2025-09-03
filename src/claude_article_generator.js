#!/usr/bin/env node

/**
 * 手動リサーチ → Claude Code記事生成システム
 * 使用方法: node src/claude_article_generator.js <txtファイル名>
 * 
 * OpenAI APIは使用せず、GitHub内のプロンプトとリサーチデータをClaude Codeに渡して
 * 記事生成を依頼するシステムです。
 */

const fs = require('fs').promises;
const path = require('path');
const SimpleResearchParser = require('./core/simple_research_parser');

class ClaudeArticleGenerator {
  constructor() {
    this.parser = new SimpleResearchParser();
    this.inputDir = path.join(__dirname, '../inputs/manual_research');
    this.outputDir = path.join(__dirname, '../outputs/claude_articles');
    this.promptsDir = path.join(__dirname, '../docs/prompts');
  }

  /**
   * 手動リサーチファイルから記事生成用データを準備
   */
  async prepareArticleGeneration(txtFileName) {
    try {
      console.log('🚀 Claude Code記事生成データ準備開始...');
      console.log(`📄 対象ファイル: ${txtFileName}`);
      
      // 1. リサーチファイル解析
      console.log('\n📋 STEP 1: リサーチファイル解析');
      const researchData = await this.parser.parseManualResearch(txtFileName);
      
      // 2. GitHub内プロンプト読み込み
      console.log('\n📚 STEP 2: GitHub内プロンプト読み込み');
      const prompts = await this.loadAllPrompts();
      
      // 3. Claude Code用の統合プロンプト作成
      console.log('\n🔧 STEP 3: Claude Code用統合プロンプト作成');
      const claudePrompt = await this.buildClaudePrompt(researchData, prompts);
      
      // 4. 準備データ保存
      const preparedData = {
        sourceFile: txtFileName,
        researchData: researchData,
        prompts: prompts,
        claudePrompt: claudePrompt,
        instructions: this.getClaudeInstructions(),
        generatedAt: new Date().toISOString()
      };
      
      await this.savePreparationData(preparedData, txtFileName);
      
      // 5. Claude Codeへの指示を表示
      console.log('\n✅ 準備完了！');
      console.log('\n' + '='.repeat(80));
      console.log('📋 Claude Codeへの指示');
      console.log('='.repeat(80));
      console.log(claudePrompt);
      console.log('='.repeat(80));
      
      return preparedData;
      
    } catch (error) {
      console.error('❌ 準備エラー:', error);
      throw error;
    }
  }

  /**
   * GitHub内のプロンプトファイルを全て読み込み
   */
  async loadAllPrompts() {
    const prompts = {};
    
    try {
      // WordPress記事生成プロンプト
      const wordpressPath = path.join(this.promptsDir, 'wordpress_article_generator.md');
      prompts.wordpress = await fs.readFile(wordpressPath, 'utf8');
      console.log('✅ WordPress記事プロンプト読み込み完了');
      
      // 図表生成プロンプト
      const chartPath = path.join(this.promptsDir, 'chart_generator.md');
      prompts.charts = await fs.readFile(chartPath, 'utf8');
      console.log('✅ 図表生成プロンプト読み込み完了');
      
      // スキーマ生成プロンプト
      const schemaPath = path.join(this.promptsDir, 'schema_markup_generator.md');
      prompts.schema = await fs.readFile(schemaPath, 'utf8');
      console.log('✅ スキーマ生成プロンプト読み込み完了');
      
    } catch (error) {
      console.warn('⚠️ 一部プロンプトファイルが見つかりません:', error.message);
    }
    
    return prompts;
  }

  /**
   * Claude Code用の統合プロンプトを作成
   */
  async buildClaudePrompt(researchData, prompts) {
    return `# WordPress記事生成＆自動投稿タスク

## 概要
手動で実施したディープリサーチに基づいて、WordPress記事を生成し、GitHubから直接WordPressの下書きに保存してください。
GitHub内の専用プロンプトを使用し、以下の順序で作業を進めてください。

## リサーチデータ
**ファイル名**: ${researchData.fileName}
**タイトル**: ${researchData.title}
**メインキーワード**: ${researchData.mainKeyword}
**目標文字数**: ${researchData.targetWordCount}文字
**生成日時**: ${researchData.generatedAt}

**見出し構成**:
${researchData.headings.map((h, i) => `${i + 1}. ${h.text}`).join('\n')}

**リサーチ内容**:
\`\`\`
${researchData.rawContent.substring(0, 2000)}${researchData.rawContent.length > 2000 ? '...' : ''}
\`\`\`

## 作業手順

### 1. WordPress記事本文生成
以下のプロンプトを使用して、WordPress形式の記事を生成してください：

\`\`\`markdown
${prompts.wordpress || 'WordPressプロンプトが見つかりません'}
\`\`\`

**追加要求**:
- 上記リサーチデータの内容を反映
- ${researchData.targetWordCount}文字以上
- WordPress <!-- wp:paragraph --> ブロック形式
- 実務家「ゆーた」と初心者「ぜいむたん」の会話含む

### 2. 図表生成・埋め込み
生成した記事内容に基づいて図表を作成し、適切な位置に埋め込んでください：

\`\`\`markdown
${prompts.charts || '図表プロンプトが見つかりません'}
\`\`\`

### 3. スキーママークアップ生成
記事の構造化データを生成してください：

\`\`\`markdown
${prompts.schema || 'スキーマプロンプトが見つかりません'}
\`\`\`

**記事情報**:
- URL: https://ezark-tax-accounting.com/${this.generateSlug(researchData.mainKeyword)}/
- 著者: ゆーた（会計士）
- カテゴリ: 税務・会計

### 4. WordPressに下書きとして自動保存
記事生成完了後、以下のコマンドを使用してWordPressに下書きとして直接保存してください：

\`\`\`bash
node src/wordpress_auto_post.js
\`\`\`

このコマンドが自動的に以下を実行します：
- 複数記事構成の場合は各記事を個別に下書き保存
- 単一記事の場合は1つの下書きとして保存
- カテゴリとタグの自動作成・設定
- スキーママークアップの追加
- SEOメタデータの設定

**複数記事構成の検出パターン**：
- 「記事構成1」「記事構成2」等の表記
- 「記事案1」「記事案2」等の表記
- 「パターン1」「パターン2」等の表記
- 「提案1」「提案2」等の表記

**WordPress認証情報はGitHub Actionsのsecretsから自動取得されます**

### 5. 最終チェック
- 文字数: ${researchData.targetWordCount}文字以上
- WordPress形式: ブロックエディタ対応
- SEO最適化: 適切な見出し構造
- 図表: 記事内容に連動した適切な配置
- スキーマ: JSON-LD形式で完全
- WordPress下書き保存完了

## 出力形式
以下の形式で結果を提供してください：

1. **完成記事** (WordPress形式)
2. **生成した図表** (埋め込み済み)
3. **スキーママークアップ** (JSON-LD)
4. **SEOメタデータ** (タイトル・説明・スラッグ)
5. **WordPress下書き保存結果** (投稿URL・ID)

よろしくお願いします！`;
  }

  /**
   * Claude Codeへの使用方法指示
   */
  getClaudeInstructions() {
    return `
## Claude Code使用手順

1. **このプロンプトをClaude Codeに貼り付け**
   上記の統合プロンプトをClaude Codeに送信してください。

2. **GitHubリポジトリとの連携**
   Claude Codeがプロンプトファイルを自動読み込みします。

3. **記事生成実行**
   Claude Codeが段階的に記事を生成します。

4. **結果の確認**
   - WordPress形式の記事本文
   - 埋め込み図表
   - スキーママークアップ
   - SEOメタデータ

5. **WordPressへの投稿**
   生成された記事をWordPressに下書きとして保存。
`;
  }

  /**
   * 準備データを保存
   */
  async savePreparationData(data, sourceFileName) {
    await fs.mkdir(this.outputDir, { recursive: true });
    
    const outputFileName = sourceFileName.replace('.txt', '_claude_ready.json');
    const outputPath = path.join(this.outputDir, outputFileName);
    
    await fs.writeFile(outputPath, JSON.stringify(data, null, 2), 'utf8');
    console.log(`💾 Claude用データ保存: ${outputPath}`);
    
    // プロンプトテキストファイルも個別保存
    const promptPath = path.join(this.outputDir, sourceFileName.replace('.txt', '_claude_prompt.md'));
    await fs.writeFile(promptPath, data.claudePrompt, 'utf8');
    console.log(`📄 Claudeプロンプト保存: ${promptPath}`);
  }

  /**
   * スラッグ生成
   */
  generateSlug(keyword) {
    const keywordMap = {
      'freee': 'freee-guide',
      'マネーフォワード': 'moneyforward-guide', 
      '会計ソフト': 'accounting-software',
      '確定申告': 'tax-return-guide',
      'インボイス': 'invoice-guide'
    };
    
    return keywordMap[keyword] || 'accounting-guide';
  }

  /**
   * 利用可能なファイル一覧表示
   */
  async showAvailableFiles() {
    console.log('\n📁 利用可能な手動リサーチファイル:');
    
    const files = await this.parser.listAvailableFiles();
    
    if (files.length === 0) {
      console.log('   📄 リサーチファイルが見つかりません');
      console.log('   💡 inputs/manual_research/ フォルダにtxtファイルを配置してください');
    } else {
      files.forEach((file, index) => {
        console.log(`   ${index + 1}. ${file}`);
      });
      
      console.log('\n💡 使用方法:');
      console.log('   node src/claude_article_generator.js <ファイル名>');
    }
  }

  /**
   * ヘルプ表示
   */
  showHelp() {
    console.log(`
🤖 手動リサーチ → Claude Code記事生成システム

使用方法:
  node src/claude_article_generator.js <コマンド>

コマンド:
  <txtファイル名>     指定したtxtファイルからClaude用プロンプト生成
  list               利用可能なファイル一覧表示  
  sample             サンプルファイル作成
  help               このヘルプを表示

ワークフロー:
  1. 手動でディープリサーチ実施
  2. 結果を inputs/manual_research/*.txt に保存
  3. このコマンドでClaude用プロンプト生成
  4. 生成されたプロンプトをClaude Codeに貼り付け
  5. Claude CodeがGitHub内プロンプトを使用して記事生成
  6. WordPressに投稿

利点:
  ✅ OpenAI API不要
  ✅ GitHub内プロンプト自動使用
  ✅ Claude Codeの高品質生成
  ✅ 完全無料での運用

例:
  node src/claude_article_generator.js freee_research.txt
  node src/claude_article_generator.js list
  node src/claude_article_generator.js sample
`);
  }
}

/**
 * メイン実行部分
 */
async function main() {
  const generator = new ClaudeArticleGenerator();
  const command = process.argv[2];

  try {
    if (!command || command === 'help' || command === '--help') {
      generator.showHelp();
      return;
    }

    if (command === 'list') {
      await generator.showAvailableFiles();
      return;
    }

    if (command === 'sample') {
      await generator.parser.createSampleFile();
      console.log('\n✅ サンプルファイル作成完了');
      console.log('📝 inputs/manual_research/sample_freee_research.txt を確認してください');
      return;
    }

    // txtファイル名が指定された場合
    if (command.endsWith('.txt')) {
      await generator.prepareArticleGeneration(command);
    } else {
      console.error('❌ 無効なコマンドです');
      generator.showHelp();
      process.exit(1);
    }

  } catch (error) {
    console.error('❌ システムエラー:', error.message);
    process.exit(1);
  }
}

// 直接実行時のみメイン関数を実行
if (require.main === module) {
  main();
}

module.exports = ClaudeArticleGenerator;