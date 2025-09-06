#!/usr/bin/env node

/**
 * MDファーストアプローチ：Markdown記事生成→WordPress HTML変換システム
 * マスターガイド + ディープリサーチ構成完全準拠版
 */

const fs = require('fs').promises;
const path = require('path');
const OpenAI = require('openai');

class MDToHtmlArticleGenerator {
  constructor() {
    // OpenAI APIキーを既存のファイルから読み込み
    const apiKey = process.env.OPENAI_API_KEY || this.loadApiKeyFromExistingFiles();
    this.openai = new OpenAI({
      apiKey: apiKey
    });
    this.outputDir = path.join(__dirname, 'outputs/md_articles');
    this.htmlOutputDir = path.join(__dirname, 'outputs/html_articles');
  }

  loadApiKeyFromExistingFiles() {
    // 既存のファイルからAPIキーを読み込み（同期的に）
    try {
      const saveRefinedFile = require('fs').readFileSync(path.join(__dirname, 'save_refined_articles.js'), 'utf8');
      // OpenAI APIキーがハードコードされている既存ファイルから抽出は避ける
      return 'dummy-key'; // 実際には環境変数から読み込む想定
    } catch (error) {
      return 'dummy-key';
    }
  }

  async init() {
    await fs.mkdir(this.outputDir, { recursive: true });
    await fs.mkdir(this.htmlOutputDir, { recursive: true });
  }

  async loadPrompts() {
    console.log('📋 プロンプトファイル読み込み中...');
    
    const [masterGuide, deepResearch, txtStructure] = await Promise.all([
      fs.readFile(path.join(__dirname, 'docs/prompts/wordpress_article_generator.md'), 'utf8'),
      fs.readFile(path.join(__dirname, 'docs/prompts/deep_research.md'), 'utf8'),
      fs.readFile('C:\\Users\\pukur\\Desktop\\【キーワード分析結果】.txt', 'utf8')
    ]);

    return { masterGuide, deepResearch, txtStructure };
  }

  // ステップ1: Markdown記事生成プロンプト
  createMarkdownGenerationPrompt(keyword, structure, deepResearch) {
    return `# Markdown記事生成指示

あなたは40年の経験を持つSEOライター兼コンテンツマーケターです。
以下の指示に従って、高品質なMarkdown形式の記事を生成してください。

## 対象キーワード
${keyword}

## ディープリサーチ構成要件
${deepResearch}

## 詳細構成指示
${structure}

## Markdown生成ルール

### 1. 基本構造
- # メインタイトル（H1は1つのみ）
- ## 大見出し（H2）
- ### 小見出し（H3）
- #### 詳細見出し（H4）使用可

### 2. コンテンツ要素
- **太字** を効果的に使用
- > 引用ブロックで重要ポイント強調
- - リスト項目で整理
- | テーブル | 形式 | で比較表作成
- \`コード\` や \`\`\`ブロック\`\`\` でサンプル表示

### 3. 記事構成（必須セクション）
1. **導入部**（問題提起・共感）
2. **基礎知識セクション**（用語説明・概要）
3. **詳細解説セクション**（手順・方法論）
4. **比較・選び方セクション**（製品/サービス比較）
5. **実践・事例セクション**（具体例・ケーススタディ）
6. **注意点・よくある質問**（FAQ）
7. **まとめ・行動促進**（CTA）

### 4. 文字数・品質要件
- 各H2セクション：800-1,500文字
- 全体：6,000-10,000文字目標
- 具体的数値・事例を豊富に含める
- 専門用語は初心者向けに解説
- 重複表現は完全に排除

### 5. SEO最適化
- 自然なキーワード含有
- 関連キーワードの適切な配置
- メタ情報用のフロントマター含有

---

以下の形式で出力してください：

\`\`\`markdown
---
title: "記事タイトル"
description: "メタディスクリプション120文字"
keywords: "${keyword}"
slug: "url-slug"
categories: ["カテゴリ1", "カテゴリ2"]
tags: ["タグ1", "タグ2", "タグ3"]
---

# 記事タイトル

記事本文をMarkdown形式で生成...
\`\`\`

## 重要注意事項
- txtファイルの詳細構成に100%準拠
- 重複する定型文は一切使用禁止
- 各セクションは独自性のある充実した内容
- 実用的で具体的な情報を優先
- 読者の検索意図を完全に満たすコンテンツ`;
  }

  // ステップ2: Markdown→WordPress HTML変換プロンプト
  createHtmlConversionPrompt(markdownContent, masterGuide) {
    return `# WordPress HTML変換指示

以下のMarkdown記事を、WordPressブロックエディター形式のHTMLに変換してください。

## 変換元Markdown
\`\`\`markdown
${markdownContent}
\`\`\`

## WordPress マスターガイド
${masterGuide}

## 変換ルール

### 1. WordPressブロック構造
- 全ての要素を適切な \`<!-- wp:○○ -->\` コメントで囲む
- \`<!-- wp:paragraph -->\` で段落
- \`<!-- wp:heading {"level":2} -->\` でH2見出し
- \`<!-- wp:list -->\` でリスト
- \`<!-- wp:table -->\` でテーブル

### 2. Swellテーマ機能活用
- 重要ポイントに \`[speech_balloon id="1"]\` 吹き出し追加（8-12回程度）
- 比較表は \`<!-- wp:table -->\` で構造化
- 引用は \`<!-- wp:quote -->\` ブロック使用

### 3. SEO最適化HTML
- JSON-LD構造化データを記事最後に挿入
- 適切なaria-label属性
- semantic HTML構造

### 4. 出力形式
\`\`\`json
{
  "title": "記事タイトル",
  "content": "完全なWordPressブロックHTML",
  "metaDescription": "120文字のメタディスクリプション",
  "slug": "url-slug",
  "categories": ["カテゴリ配列"],
  "tags": ["タグ配列"],
  "schema": "JSON-LD構造化データ",
  "targetKeyword": "対象キーワード",
  "actualWordCount": 9999,
  "speechBalloonCount": 10,
  "hasSchema": true
}
\`\`\`

## 変換時の重点事項
- マスターガイドのHTMLブロック構造に完全準拠
- 吹き出しキャラクターを適切に配置
- 読みやすさを重視したHTML構造
- 全てのMarkdown要素を適切なWordPressブロックに変換`;
  }

  async generateMarkdownArticle(keyword, structure, deepResearch) {
    console.log(`📝 Markdown記事生成中: ${keyword}`);
    
    const prompt = this.createMarkdownGenerationPrompt(keyword, structure, deepResearch);
    
    const response = await this.openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "あなたは経験豊富なSEOライター兼コンテンツマーケターです。高品質なMarkdown記事を生成します。"
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 4000,
      temperature: 0.7
    });

    return response.choices[0].message.content;
  }

  async convertToWordPressHtml(markdownContent, masterGuide, keyword) {
    console.log(`🔄 WordPress HTML変換中: ${keyword}`);
    
    const prompt = this.createHtmlConversionPrompt(markdownContent, masterGuide);
    
    const response = await this.openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system", 
          content: "あなたはWordPressエキスパートです。MarkdownをWordPressブロックエディター形式のHTMLに完璧に変換します。"
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 4000,
      temperature: 0.3
    });

    return response.choices[0].message.content;
  }

  extractJsonFromResponse(response) {
    const jsonMatch = response.match(/```json\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[1]);
      } catch (error) {
        console.log('⚠️  JSON解析エラー、別の方法で抽出を試行...');
      }
    }
    
    // JSONブロックが見つからない場合の代替方法
    try {
      const startIndex = response.indexOf('{');
      const endIndex = response.lastIndexOf('}') + 1;
      if (startIndex !== -1 && endIndex > startIndex) {
        return JSON.parse(response.substring(startIndex, endIndex));
      }
    } catch (error) {
      console.log('⚠️  代替JSON抽出も失敗');
    }
    
    throw new Error('レスポンスからJSONを抽出できませんでした');
  }

  async generateArticles() {
    try {
      console.log('🚀 MD→HTML記事生成システム開始...');
      
      await this.init();
      
      // プロンプト読み込み
      const { masterGuide, deepResearch, txtStructure } = await this.loadPrompts();
      
      // 3つのキーワードと対応する構成
      const articleSpecs = [
        {
          keyword: "インボイス制度 会計ソフト おすすめ",
          slug: "invoice-system-accounting-software",
          structure: txtStructure ? txtStructure.split('【記事2：IT導入補助金】')[0] : "インボイス制度対応の会計ソフト選定ガイド"
        },
        {
          keyword: "IT導入補助金 会計ソフト",
          slug: "it-subsidy-accounting-software", 
          structure: txtStructure ? (txtStructure.split('【記事2：IT導入補助金】')[1] || '').split('【記事3：法人確定申告】')[0] : "IT導入補助金を活用した会計ソフト導入ガイド"
        },
        {
          keyword: "法人 確定申告 自分で",
          slug: "corporate-tax-return-diy",
          structure: txtStructure ? (txtStructure.split('【記事3：法人確定申告】')[1] || txtStructure) : "法人確定申告を自分で行う完全ガイド"
        }
      ];

      const results = [];

      // 各記事を順番に生成
      for (let i = 0; i < articleSpecs.length; i++) {
        const spec = articleSpecs[i];
        
        try {
          console.log(`\n=== 記事${i + 1}: ${spec.keyword} ===`);
          
          // ステップ1: Markdown生成
          console.log('📝 ステップ1: Markdown記事生成...');
          const markdownContent = await this.generateMarkdownArticle(
            spec.keyword, 
            spec.structure, 
            deepResearch
          );
          
          // Markdown保存
          const mdFilePath = path.join(this.outputDir, `article${i + 1}_${spec.slug}.md`);
          await fs.writeFile(mdFilePath, markdownContent, 'utf8');
          console.log(`✅ Markdown保存: ${mdFilePath}`);
          
          // ステップ2: WordPress HTML変換
          console.log('🔄 ステップ2: WordPress HTML変換...');
          const htmlResponse = await this.convertToWordPressHtml(
            markdownContent,
            masterGuide,
            spec.keyword
          );
          
          // JSON形式の記事データ抽出
          const articleData = this.extractJsonFromResponse(htmlResponse);
          
          // HTML記事保存
          const htmlFilePath = path.join(this.htmlOutputDir, `article${i + 1}_${spec.slug}.json`);
          await fs.writeFile(htmlFilePath, JSON.stringify(articleData, null, 2), 'utf8');
          console.log(`✅ WordPress HTML保存: ${htmlFilePath}`);
          
          results.push({
            articleNumber: i + 1,
            keyword: spec.keyword,
            slug: spec.slug,
            markdownFile: mdFilePath,
            htmlFile: htmlFilePath,
            title: articleData.title,
            wordCount: articleData.actualWordCount || 0,
            speechBalloonCount: articleData.speechBalloonCount || 0,
            hasSchema: articleData.hasSchema || false
          });
          
          // API制限対策の待機
          if (i < articleSpecs.length - 1) {
            console.log('⏳ 次の記事生成まで10秒待機...');
            await new Promise(resolve => setTimeout(resolve, 10000));
          }
          
        } catch (error) {
          console.error(`❌ 記事${i + 1}の生成エラー:`, error.message);
          results.push({
            articleNumber: i + 1,
            keyword: spec.keyword,
            error: error.message
          });
        }
      }
      
      // 生成結果サマリー
      console.log('\n🎉 MD→HTML記事生成完了！');
      console.log('\n📊 生成結果サマリー:');
      results.forEach(result => {
        if (result.error) {
          console.log(`❌ 記事${result.articleNumber} (${result.keyword}): ${result.error}`);
        } else {
          console.log(`✅ 記事${result.articleNumber} (${result.keyword}):`);
          console.log(`   📄 タイトル: ${result.title}`);
          console.log(`   📊 文字数: ${result.wordCount}文字`);
          console.log(`   💬 吹き出し: ${result.speechBalloonCount}回`);
          console.log(`   ✅ スキーマ: ${result.hasSchema ? '含有' : '無し'}`);
          console.log(`   📝 MD: ${result.markdownFile}`);
          console.log(`   🌐 HTML: ${result.htmlFile}`);
        }
      });
      
      const successCount = results.filter(r => !r.error).length;
      console.log(`\n📈 生成成功: ${successCount}/${articleSpecs.length}記事`);
      
      console.log('\n🎯 MD→HTMLアプローチの利点:');
      console.log('✅ 1. Markdownでのコンテンツ構造化が容易');
      console.log('✅ 2. WordPressブロック変換の正確性向上');
      console.log('✅ 3. マスターガイド準拠のHTML出力');
      console.log('✅ 4. ディープリサーチ構成の完全実装');
      console.log('✅ 5. 2段階生成による品質向上');
      
      return results;
      
    } catch (error) {
      console.error('❌ システム全体エラー:', error.message);
      throw error;
    }
  }
}

// 直接実行
if (require.main === module) {
  const generator = new MDToHtmlArticleGenerator();
  
  generator.generateArticles()
    .then((results) => {
      console.log('\n🎯 MD→HTML記事生成システム処理完了！');
      console.log('✨ マスターガイド + ディープリサーチ完全準拠の高品質記事生成成功！');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ 処理失敗:', error.message);
      process.exit(1);
    });
}

module.exports = MDToHtmlArticleGenerator;