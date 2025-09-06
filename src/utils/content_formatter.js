/**
 * コンテンツフォーマッター - Markdown→WordPress変換ユーティリティ
 * 記事生成時にMarkdown記法をWordPress形式に自動変換
 */

class ContentFormatter {
  /**
   * Markdown記法をWordPressブロック形式に変換
   */
  static convertMarkdownToWordPress(content) {
    console.log('🔄 Markdown → WordPress形式変換中...');
    
    let converted = content;
    
    // 見出し変換 (## → <h2>, ### → <h3>)
    converted = converted.replace(/^### (.+)$/gm, '<!-- wp:heading {"level":3} --><h3>$1</h3><!-- /wp:heading -->');
    converted = converted.replace(/^## (.+)$/gm, '<!-- wp:heading {"level":2} --><h2>$1</h2><!-- /wp:heading -->');
    converted = converted.replace(/^# (.+)$/gm, '<!-- wp:heading {"level":1} --><h1>$1</h1><!-- /wp:heading -->');
    
    // 太字変換 (**text** → <strong>text</strong>)
    converted = converted.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    
    // リスト変換 (- item → WordPress list)
    converted = this.convertListsToWordPress(converted);
    
    // 段落のブロック化
    converted = this.wrapParagraphsInBlocks(converted);
    
    // 空行の整理
    converted = converted.replace(/\n{3,}/g, '\n\n');
    
    console.log('✅ WordPress形式変換完了');
    return converted;
  }
  
  /**
   * リストをWordPressブロック形式に変換
   */
  static convertListsToWordPress(content) {
    const lines = content.split('\n');
    const result = [];
    let currentList = [];
    let inList = false;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      if (/^[-*+]\s/.test(line)) {
        // リストアイテム
        const item = line.replace(/^[-*+]\s/, '');
        currentList.push(`<li>${item}</li>`);
        inList = true;
      } else if (/^\d+\.\s/.test(line)) {
        // 番号付きリスト
        const item = line.replace(/^\d+\.\s/, '');
        currentList.push(`<li>${item}</li>`);
        inList = true;
      } else {
        // リスト終了
        if (inList && currentList.length > 0) {
          const listType = /^\d+\.\s/.test(lines[i-1]) ? 'ol' : 'ul';
          const listClass = listType === 'ol' ? ' class="is-style-num_circle"' : '';
          
          result.push(`<!-- wp:list --><${listType}${listClass}>`);
          result.push(...currentList);
          result.push(`</${listType}><!-- /wp:list -->`);
          
          currentList = [];
          inList = false;
        }
        
        if (line.trim()) {
          result.push(line);
        }
      }
    }
    
    // 最後のリスト処理
    if (inList && currentList.length > 0) {
      result.push('<!-- wp:list --><ul>');
      result.push(...currentList);
      result.push('</ul><!-- /wp:list -->');
    }
    
    return result.join('\n');
  }
  
  /**
   * 段落をWordPressブロックで囲む
   */
  static wrapParagraphsInBlocks(content) {
    const lines = content.split('\n');
    const result = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      if (!line) {
        result.push('');
        continue;
      }
      
      // 既にWordPressブロックの場合はそのまま
      if (line.startsWith('<!-- wp:')) {
        result.push(line);
        continue;
      }
      
      // HTMLタグの場合はそのまま
      if (line.startsWith('<') && line.endsWith('>')) {
        result.push(line);
        continue;
      }
      
      // 段落として処理
      if (!line.startsWith('<h') && !line.includes('<!-- wp:')) {
        result.push(`<!-- wp:paragraph --><p>${line}</p><!-- /wp:paragraph -->`);
      } else {
        result.push(line);
      }
    }
    
    return result.join('\n');
  }
  
  /**
   * WordPress形式かどうかをチェック
   */
  static isWordPressFormat(content) {
    const hasWordPressBlocks = /<!-- wp:/.test(content);
    const hasMarkdown = /^##\s|^\*\*|^[-*+]\s/m.test(content);
    
    return {
      hasWordPressBlocks,
      hasMarkdown,
      isValidFormat: hasWordPressBlocks && !hasMarkdown
    };
  }
  
  /**
   * 吹き出し機能を正しい形式に修正
   */
  static fixSpeechBalloons(content) {
    // [speech_balloon...]が<!-- wp:html -->で囲まれていない場合の修正
    const speechBalloonRegex = /(?<!<!-- wp:html -->)\[speech_balloon[^\]]*\].*?\[\/speech_balloon\](?!<!-- \/wp:html -->)/g;
    
    return content.replace(speechBalloonRegex, (match) => {
      return `<!-- wp:html -->${match}<!-- /wp:html -->`;
    });
  }
  
  /**
   * コンテンツの品質チェック
   */
  static validateContent(content) {
    const issues = [];
    
    // Markdown記法のチェック
    if (/^##\s/m.test(content)) {
      issues.push('Markdown見出し記法が検出されました');
    }
    
    if (/\*\*.*?\*\*/.test(content)) {
      issues.push('Markdown太字記法が検出されました');
    }
    
    if (/^[-*+]\s/m.test(content)) {
      issues.push('Markdownリスト記法が検出されました');
    }
    
    // WordPressブロックの存在チェック
    if (!/<!-- wp:/.test(content)) {
      issues.push('WordPressブロック形式が不足しています');
    }
    
    // 吹き出し機能のチェック
    const speechBalloons = content.match(/\[speech_balloon[^\]]*\]/g);
    if (speechBalloons) {
      const unWrappedBalloons = content.match(/(?<!<!-- wp:html -->)\[speech_balloon[^\]]*\]/g);
      if (unWrappedBalloons) {
        issues.push('吹き出し機能が正しくwp:htmlブロックで囲まれていません');
      }
    }
    
    return {
      isValid: issues.length === 0,
      issues
    };
  }
}

module.exports = ContentFormatter;