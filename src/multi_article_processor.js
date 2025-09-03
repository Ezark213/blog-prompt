#!/usr/bin/env node

/**
 * 複数記事構成処理システム
 * Claude Codeで生成された複数の記事構成を個別に下書き保存
 */

const fs = require('fs').promises;
const path = require('path');
const WordPressClient = require('./core/wordpress_client');

class MultiArticleProcessor {
  constructor() {
    this.client = new WordPressClient();
    this.outputDir = path.join(__dirname, '../outputs/generated_articles');
  }

  /**
   * 複数記事を一括処理してWordPressに保存
   */
  async processMultipleArticles(articles) {
    const results = [];
    
    console.log(`📝 ${articles.length}個の記事構成を順次処理開始...`);
    
    for (let i = 0; i < articles.length; i++) {
      const article = articles[i];
      console.log(`\n📄 記事 ${i + 1}/${articles.length} 処理中: ${article.title}`);
      
      try {
        // WordPress接続テスト（初回のみ）
        if (i === 0) {
          console.log('🔗 WordPress接続テスト...');
          const connectionOk = await this.client.testConnection();
          if (!connectionOk) {
            throw new Error('WordPress接続に失敗しました');
          }
          console.log('✅ WordPress接続成功');
        }

        // 記事を下書きとして保存
        console.log('📤 WordPress下書き保存中...');
        const draftPost = await this.client.publishArticle(article);
        
        // 結果記録
        results.push({
          index: i + 1,
          title: draftPost.title,
          wordpressId: draftPost.wordpressId,
          draftUrl: draftPost.draftUrl,
          savedAt: draftPost.savedAt,
          status: 'success'
        });

        console.log(`✅ 記事 ${i + 1} 保存完了 (ID: ${draftPost.wordpressId})`);
        
        // API制限対策（最後の記事以外）
        if (i < articles.length - 1) {
          console.log('⏳ API制限対策で3秒待機...');
          await this.delay(3000);
        }

      } catch (error) {
        console.error(`❌ 記事 ${i + 1} 保存エラー:`, error.message);
        results.push({
          index: i + 1,
          title: article.title,
          error: error.message,
          status: 'error'
        });
      }
    }

    // 全体結果表示
    await this.displayResults(results);
    
    return results;
  }

  /**
   * Claude Code生成データを複数記事に変換
   */
  parseClaudeGeneratedContent(generatedContent) {
    const articles = [];
    
    // 記事構成が複数提案されている場合を検出
    if (this.hasMultipleArticleStructures(generatedContent)) {
      console.log('🔍 複数記事構成を検出しました');
      articles.push(...this.extractMultipleArticles(generatedContent));
    } else {
      console.log('📄 単一記事として処理します');
      articles.push(this.extractSingleArticle(generatedContent));
    }
    
    return articles;
  }

  /**
   * 複数記事構成があるかチェック
   */
  hasMultipleArticleStructures(content) {
    const indicators = [
      /記事構成\s*[1-9]/gi,
      /記事案\s*[1-9]/gi,
      /パターン\s*[1-9]/gi,
      /案\s*[1-9][\s:：]/gi,
      /提案\s*[1-9]/gi,
      /構成\s*[1-9]/gi
    ];
    
    return indicators.some(regex => regex.test(content));
  }

  /**
   * 複数記事を抽出
   */
  extractMultipleArticles(content) {
    const articles = [];
    
    // 記事区切りパターン
    const separators = [
      /記事構成\s*([1-9])/gi,
      /記事案\s*([1-9])/gi,
      /パターン\s*([1-9])/gi,
      /案\s*([1-9])[\s:：]/gi,
      /提案\s*([1-9])/gi,
      /構成\s*([1-9])/gi
    ];
    
    let articleSections = [content]; // デフォルトは全体
    
    // 最適な区切りパターンを見つける
    for (const separator of separators) {
      const matches = [...content.matchAll(separator)];
      if (matches.length >= 2) { // 2つ以上見つかった場合
        articleSections = content.split(separator).filter(section => section.trim());
        break;
      }
    }
    
    // 各セクションを記事データに変換
    articleSections.forEach((section, index) => {
      if (section.trim()) {
        const article = this.parseArticleSection(section, index + 1);
        if (article) {
          articles.push(article);
        }
      }
    });
    
    return articles.length > 0 ? articles : [this.extractSingleArticle(content)];
  }

  /**
   * 記事セクションをパース
   */
  parseArticleSection(section, index) {
    try {
      // タイトル抽出
      const titleMatch = section.match(/タイトル[:：]\s*([^\n\r]+)/i) || 
                        section.match(/見出し[:：]\s*([^\n\r]+)/i) ||
                        section.match(/^([^\n\r]+)/);
      
      const title = titleMatch ? titleMatch[1].trim() : `記事構成 ${index}`;
      
      // コンテンツ抽出（HTMLコンテンツがある場合）
      const htmlMatch = section.match(/<!-- wp:[\s\S]*?<!-- \/wp:/);
      const content = htmlMatch ? htmlMatch[0] : this.generateBasicContent(section);
      
      // メタデータ抽出
      const metaDescription = this.extractMetaDescription(section) || 
                             this.generateMetaDescription(content);
      
      const keywords = this.extractKeywords(section);
      const categories = this.extractCategories(section);
      const tags = this.extractTags(section);

      return {
        title: title,
        content: content,
        slug: this.generateSlug(title),
        metaDescription: metaDescription,
        categories: categories.length > 0 ? categories : ['税務・会計'],
        tags: tags.length > 0 ? tags : keywords.slice(0, 3),
        focusKeyword: keywords[0] || 'freee',
        schema: this.extractSchema(section) || '',
        sourceFile: `multi_article_${index}`,
        articleIndex: index
      };
    } catch (error) {
      console.warn(`記事 ${index} のパースエラー:`, error.message);
      return null;
    }
  }

  /**
   * 単一記事として抽出
   */
  extractSingleArticle(content) {
    // タイトル抽出
    const titleMatch = content.match(/^#\s*([^\n\r]+)/m) || 
                      content.match(/タイトル[:：]\s*([^\n\r]+)/i);
    const title = titleMatch ? titleMatch[1].trim() : 'Claude生成記事';
    
    // HTML コンテンツ抽出
    const htmlMatch = content.match(/<!-- wp:[\s\S]*?<!-- \/wp:/);
    const articleContent = htmlMatch ? htmlMatch[0] : this.generateBasicContent(content);
    
    return {
      title: title,
      content: articleContent,
      slug: this.generateSlug(title),
      metaDescription: this.extractMetaDescription(content) || this.generateMetaDescription(articleContent),
      categories: ['税務・会計'],
      tags: this.extractKeywords(content).slice(0, 5),
      focusKeyword: this.extractKeywords(content)[0] || 'freee',
      schema: this.extractSchema(content) || '',
      sourceFile: 'claude_single_article',
      articleIndex: 1
    };
  }

  /**
   * 基本的なHTMLコンテンツ生成
   */
  generateBasicContent(rawContent) {
    const cleanContent = rawContent
      .replace(/```[\s\S]*?```/g, '') // コードブロック除去
      .replace(/^#+\s*/gm, '') // マークダウン見出し除去
      .split('\n')
      .filter(line => line.trim())
      .slice(0, 10) // 最初の10行まで
      .map(line => `<!-- wp:paragraph --><p>${line.trim()}</p><!-- /wp:paragraph -->`)
      .join('\n');
    
    return cleanContent || '<!-- wp:paragraph --><p>記事内容を入力してください。</p><!-- /wp:paragraph -->';
  }

  /**
   * メタディスクリプション抽出
   */
  extractMetaDescription(content) {
    const metaMatch = content.match(/メタディスクリプション[:：]\s*([^\n\r]+)/i) ||
                     content.match(/説明[:：]\s*([^\n\r]+)/i);
    return metaMatch ? metaMatch[1].trim().substring(0, 160) : null;
  }

  /**
   * キーワード抽出
   */
  extractKeywords(content) {
    const keywords = [];
    
    // 明示的なキーワード指定
    const keywordMatch = content.match(/キーワード[:：]\s*([^\n\r]+)/i);
    if (keywordMatch) {
      keywords.push(...keywordMatch[1].split(/[,、]\s*/));
    }
    
    // 会計ソフト関連キーワード
    const accountingKeywords = ['freee', 'マネーフォワード', '会計ソフト', '確定申告', '税務申告'];
    accountingKeywords.forEach(keyword => {
      if (content.toLowerCase().includes(keyword.toLowerCase()) && !keywords.includes(keyword)) {
        keywords.push(keyword);
      }
    });
    
    return keywords.filter(k => k.trim()).slice(0, 8);
  }

  /**
   * カテゴリ抽出
   */
  extractCategories(content) {
    const categoryMatch = content.match(/カテゴリ[:：]\s*([^\n\r]+)/i);
    if (categoryMatch) {
      return categoryMatch[1].split(/[,、]\s*/).filter(c => c.trim());
    }
    return ['税務・会計'];
  }

  /**
   * タグ抽出
   */
  extractTags(content) {
    const tagMatch = content.match(/タグ[:：]\s*([^\n\r]+)/i);
    if (tagMatch) {
      return tagMatch[1].split(/[,、]\s*/).filter(t => t.trim());
    }
    return [];
  }

  /**
   * スキーマ抽出
   */
  extractSchema(content) {
    const schemaMatch = content.match(/<script type="application\/ld\+json"[\s\S]*?<\/script>/i);
    return schemaMatch ? schemaMatch[0] : '';
  }

  /**
   * メタディスクリプション生成
   */
  generateMetaDescription(content) {
    const text = content.replace(/<[^>]*>/g, '').substring(0, 140);
    return text + '...';
  }

  /**
   * スラッグ生成
   */
  generateSlug(title) {
    return title
      .toLowerCase()
      .replace(/[^a-zA-Z0-9ひらがなカタカナ漢字\s]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .substring(0, 50);
  }

  /**
   * 結果表示
   */
  async displayResults(results) {
    console.log('\n' + '='.repeat(80));
    console.log('🎉 複数記事処理結果');
    console.log('='.repeat(80));
    
    const successCount = results.filter(r => r.status === 'success').length;
    const errorCount = results.filter(r => r.status === 'error').length;
    
    console.log(`✅ 成功: ${successCount}個`);
    console.log(`❌ 失敗: ${errorCount}個`);
    console.log(`📊 合計: ${results.length}個`);
    
    console.log('\n📝 詳細結果:');
    results.forEach(result => {
      if (result.status === 'success') {
        console.log(`  ${result.index}. ✅ ${result.title}`);
        console.log(`      ID: ${result.wordpressId}`);
        console.log(`      URL: ${result.draftUrl}`);
      } else {
        console.log(`  ${result.index}. ❌ ${result.title}`);
        console.log(`      エラー: ${result.error}`);
      }
    });
    
    console.log('='.repeat(80));
  }

  /**
   * 遅延処理
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = MultiArticleProcessor;