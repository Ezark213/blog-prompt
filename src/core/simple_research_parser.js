const fs = require('fs').promises;
const path = require('path');

class SimpleResearchParser {
  constructor() {
    this.inputDir = path.join(__dirname, '../../inputs/manual_research');
  }

  /**
   * 手動リサーチTXTファイルを解析
   */
  async parseManualResearch(txtFileName) {
    console.log(`📋 手動リサーチファイル解析中: ${txtFileName}`);
    
    try {
      const filePath = path.join(this.inputDir, txtFileName);
      const content = await fs.readFile(filePath, 'utf8');
      
      // ファイル名からキーワードを推測
      const baseFileName = path.basename(txtFileName, '.txt');
      const mainKeyword = this.extractKeywordFromFileName(baseFileName);
      
      // コンテンツから基本情報を抽出
      const title = this.extractTitle(content, mainKeyword);
      const targetWordCount = this.extractWordCount(content);
      const headings = this.extractHeadings(content);
      
      const result = {
        fileName: txtFileName,
        title: title,
        mainKeyword: mainKeyword,
        targetWordCount: targetWordCount,
        headings: headings,
        rawContent: content,
        competitiveAdvantage: 'ディープリサーチに基づく実務重視記事',
        detailLevel: 'professional',
        keywords: [mainKeyword],
        generatedAt: new Date().toISOString()
      };
      
      console.log('✅ 手動リサーチ解析完了');
      console.log(`📝 タイトル: ${result.title}`);
      console.log(`🎯 メインキーワード: ${result.mainKeyword}`);
      console.log(`📊 目標文字数: ${result.targetWordCount}`);
      
      return result;
      
    } catch (error) {
      console.error('❌ 手動リサーチ解析エラー:', error);
      throw error;
    }
  }

  /**
   * ファイル名からキーワードを抽出
   */
  extractKeywordFromFileName(fileName) {
    // ファイル名のパターンマッチング
    const patterns = [
      /freee/i,
      /マネーフォワード/i,
      /会計ソフト/i,
      /確定申告/i,
      /インボイス/i,
      /tax/i,
      /accounting/i
    ];
    
    for (const pattern of patterns) {
      if (pattern.test(fileName)) {
        return fileName.match(pattern)[0];
      }
    }
    
    // パターンにマッチしない場合はファイル名をそのまま使用
    return fileName.replace(/[_-]/g, ' ');
  }

  /**
   * コンテンツからタイトルを抽出
   */
  extractTitle(content, keyword) {
    const lines = content.split('\n');
    
    // 最初の行がタイトルっぽい場合
    const firstLine = lines[0].trim();
    if (firstLine.length > 10 && firstLine.length < 100) {
      return firstLine;
    }
    
    // キーワードベースの自動タイトル生成
    const titlePatterns = [
      `${keyword}の使い方完全ガイド【2024年最新版】`,
      `実務家が教える${keyword}活用法`,
      `${keyword}徹底解説｜初心者から上級者まで`,
      `【完全版】${keyword}でできること・設定方法`
    ];
    
    return titlePatterns[0];
  }

  /**
   * 目標文字数を抽出（デフォルト5000文字）
   */
  extractWordCount(content) {
    const wordCountMatch = content.match(/(\d{4,5})\s*文字/);
    return wordCountMatch ? parseInt(wordCountMatch[1]) : 5000;
  }

  /**
   * 見出し構造を推測生成
   */
  extractHeadings(content) {
    const headings = [];
    
    // コンテンツから見出しらしいものを抽出
    const lines = content.split('\n');
    lines.forEach(line => {
      const trimmed = line.trim();
      
      // 見出しパターン（■、●、1.、・など）
      if (/^[■●▲◆]\s*/.test(trimmed) || /^\d+\.\s*/.test(trimmed)) {
        headings.push({
          level: 2,
          text: trimmed.replace(/^[■●▲◆\d\.・\s]+/, '').trim()
        });
      }
    });
    
    // 見出しが見つからない場合はデフォルト構造を作成
    if (headings.length === 0) {
      const defaultHeadings = [
        '基本的な概要と特徴',
        '初期設定・導入方法', 
        '具体的な使い方・操作手順',
        'よくある質問と解決方法',
        'まとめと活用のポイント'
      ];
      
      defaultHeadings.forEach(heading => {
        headings.push({
          level: 2,
          text: heading
        });
      });
    }
    
    return headings.slice(0, 6); // 最大6個まで
  }

  /**
   * 入力ディレクトリ内の全txtファイルをリスト
   */
  async listAvailableFiles() {
    try {
      await fs.mkdir(this.inputDir, { recursive: true });
      const files = await fs.readdir(this.inputDir);
      return files.filter(file => file.endsWith('.txt'));
    } catch (error) {
      console.error('❌ ファイル一覧取得エラー:', error);
      return [];
    }
  }

  /**
   * サンプルファイル作成
   */
  async createSampleFile() {
    const sampleContent = `freee会計ソフトの使い方について調査

■ freeeの基本概要
- クラウド型会計ソフト
- 自動仕訳機能が充実  
- 初心者にも使いやすいインターface

■ 主な機能
- 銀行連携による自動取込
- 請求書作成機能
- 確定申告書類の自動作成

■ 導入手順
1. アカウント作成
2. 銀行口座・クレジットカード連携
3. 初期設定（勘定科目など）

■ よくある質問
- 月額料金はいくら？
- セキュリティは大丈夫？
- サポート体制は？

目標文字数: 5000文字程度で実務重視の内容にしたい`;

    const samplePath = path.join(this.inputDir, 'sample_freee_research.txt');
    
    try {
      await fs.mkdir(this.inputDir, { recursive: true });
      await fs.writeFile(samplePath, sampleContent, 'utf8');
      console.log(`📄 サンプルファイル作成: ${samplePath}`);
      return samplePath;
    } catch (error) {
      console.error('❌ サンプルファイル作成エラー:', error);
      throw error;
    }
  }
}

module.exports = SimpleResearchParser;