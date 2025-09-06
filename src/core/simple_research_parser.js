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
   * 見出し構造を詳細に抽出・生成
   */
  extractHeadings(content) {
    const headings = [];
    
    // コンテンツから見出しらしいものを抽出
    const lines = content.split('\n');
    let currentSection = null;
    
    lines.forEach((line, index) => {
      const trimmed = line.trim();
      
      // メインセクション見出しパターン（■、●、▲、◆など）
      if (/^[■●▲◆]\s*/.test(trimmed)) {
        const heading = trimmed.replace(/^[■●▲◆]\s*/, '').trim();
        if (heading) {
          currentSection = {
            level: 2,
            text: heading,
            subHeadings: []
          };
          headings.push(currentSection);
        }
      }
      // 番号付きセクション（1.、2.など）
      else if (/^\d+\.\s*/.test(trimmed)) {
        const heading = trimmed.replace(/^\d+\.\s*/, '').trim();
        if (heading) {
          currentSection = {
            level: 2,
            text: heading,
            subHeadings: []
          };
          headings.push(currentSection);
        }
      }
      // サブセクション（-, ・など）
      else if (/^[-・]\s*/.test(trimmed) && currentSection) {
        const subHeading = trimmed.replace(/^[-・]\s*/, '').trim();
        if (subHeading && subHeading.length > 5) {
          currentSection.subHeadings.push({
            level: 3,
            text: subHeading
          });
        }
      }
    });
    
    // 見出しが見つからない場合はキーワードベースでデフォルト構造を作成
    if (headings.length === 0) {
      const keyword = this.extractKeywordFromContent(content);
      const defaultHeadings = this.generateDefaultHeadingStructure(keyword);
      
      defaultHeadings.forEach(heading => {
        headings.push({
          level: 2,
          text: heading,
          subHeadings: []
        });
      });
    }
    
    // 見出し構造をフラット化（H2とH3を別々に返す）
    const flatHeadings = [];
    headings.forEach(h2 => {
      flatHeadings.push(h2);
      h2.subHeadings.forEach(h3 => {
        flatHeadings.push(h3);
      });
    });
    
    return flatHeadings.slice(0, 10); // 最大10個まで
  }

  /**
   * コンテンツからメインキーワードを抽出
   */
  extractKeywordFromContent(content) {
    const keywords = ['freee', 'マネーフォワード', '会計ソフト', '確定申告', 'インボイス', '税務', '経理'];
    
    for (const keyword of keywords) {
      if (content.includes(keyword)) {
        return keyword;
      }
    }
    
    return '会計ソフト';
  }

  /**
   * キーワードに基づくデフォルト見出し構造生成
   */
  generateDefaultHeadingStructure(keyword) {
    const structures = {
      'freee': [
        `${keyword}とは？基本機能と特徴を詳しく解説`,
        `${keyword}の導入・初期設定の完全手順`,
        '実際の操作方法と使い方のコツ',
        '料金プランと機能比較',
        'よくあるトラブルと解決方法',
        `${keyword}活用で経理効率化を実現する方法`
      ],
      'マネーフォワード': [
        `${keyword}の全機能と他社との違い`,
        '導入から運用開始までの詳細ガイド',
        '日常業務での効率的な活用法',
        '連携機能とAPI活用のメリット',
        'セキュリティと運用上の注意点',
        '成功事例と実務での活用ポイント'
      ],
      '会計ソフト': [
        `${keyword}選びの重要ポイントと比較基準`,
        '主要ソフトの機能比較と選び方',
        '導入時の注意点と準備事項',
        '運用開始後の効率的な使い方',
        'トラブル対応とメンテナンス方法',
        '将来性と拡張機能の活用法'
      ],
      default: [
        `${keyword}の基本概要と重要性`,
        '具体的な導入手順と初期設定',
        '日常的な運用方法と操作のコツ',
        'よくある問題と解決策',
        '上級者向けの活用テクニック',
        'まとめと今後の展望'
      ]
    };
    
    return structures[keyword] || structures.default;
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