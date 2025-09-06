#!/usr/bin/env node

/**
 * 改良版：デスクトップのマークダウンファイルを元に図表付きの詳細記事を生成
 */

const fs = require('fs').promises;
const path = require('path');

async function generateImprovedThreeArticles() {
  try {
    console.log('🚀 改良版3記事生成開始...');
    
    // デスクトップのマークダウンファイルを読み込み
    const articles = [
      {
        sourceFile: path.join(__dirname, '../記事1_インボイス制度対応会計ソフト.md'),
        outputPath: path.join(__dirname, 'outputs/improved_article1_invoice_software.json'),
        theme: 'インボイス制度対応会計ソフト'
      },
      {
        sourceFile: path.join(__dirname, '../記事2_IT導入補助金で会計ソフト導入.md'),
        outputPath: path.join(__dirname, 'outputs/improved_article2_it_subsidy.json'),
        theme: 'IT導入補助金で会計ソフト導入'
      },
      {
        sourceFile: path.join(__dirname, '../記事3_法人確定申告を自分で行う方法.md'),
        outputPath: path.join(__dirname, 'outputs/improved_article3_corporate_tax.json'),
        theme: '法人確定申告を自分で行う方法'
      }
    ];

    const results = [];

    for (let i = 0; i < articles.length; i++) {
      const article = articles[i];
      
      console.log(`\n📝 記事${i + 1}生成開始: ${article.theme}`);
      
      // マークダウンファイル読み込み
      const markdownContent = await fs.readFile(article.sourceFile, 'utf8');
      
      // 改良されたWordPress形式変換（図表付き）
      const improvedContent = generateImprovedWordPressContent(markdownContent, article.theme);
      
      // メタ情報抽出
      const title = extractTitle(markdownContent);
      const slug = generateSlug(title);
      const metaDescription = extractMetaDescription(markdownContent);
      const categories = getCategoriesForTheme(article.theme);
      const tags = getTagsForTheme(article.theme);
      
      // スキーママークアップ生成
      const schema = generateSchemaMarkup(title, markdownContent, article.theme);
      
      // 記事データ作成
      const articleData = {
        title: title,
        content: improvedContent,
        slug: slug,
        metaDescription: metaDescription,
        categories: categories,
        tags: tags,
        schema: schema,
        hasSchema: true,
        hasCharts: improvedContent.includes('<!-- wp:html -->'),
        chartCount: (improvedContent.match(/accounting-.*-chart/g) || []).length,
        actualWordCount: countJapaneseCharacters(improvedContent),
        speechBalloonCount: countSpeechBalloons(improvedContent),
        theme: article.theme,
        sourceFile: path.basename(article.sourceFile),
        generatedAt: new Date().toISOString()
      };
      
      // ファイル出力
      await fs.writeFile(article.outputPath, JSON.stringify(articleData, null, 2), 'utf8');
      
      console.log(`✅ 記事${i + 1}生成完了!`);
      console.log(`📄 タイトル: ${title}`);
      console.log(`📊 文字数: ${articleData.actualWordCount}文字`);
      console.log(`💬 吹き出し数: ${articleData.speechBalloonCount}回`);
      console.log(`📈 図表数: ${articleData.chartCount}個`);
      console.log(`✅ スキーマ: 含有`);
      
      results.push(articleData);
    }
    
    console.log('\n🎉 改良版3記事すべて生成完了！');
    return results;
    
  } catch (error) {
    console.error('❌ 記事生成エラー:', error.message);
    throw error;
  }
}

function generateImprovedWordPressContent(markdown, theme) {
  console.log(`📝 改良版WordPress形式変換中: ${theme}`);
  
  let content = [];
  
  // 目次
  content.push('<!-- wp:paragraph -->');
  content.push('<p>[swell_toc headline="目次" display_level="2-3"]</p>');
  content.push('<!-- /wp:paragraph -->');
  content.push('');
  content.push('<!-- wp:paragraph -->');
  content.push('<p><br /></p>');
  content.push('<!-- /wp:paragraph -->');
  content.push('');
  
  // マークダウンを解析してセクション別に処理
  const sections = parseMarkdownSections(markdown);
  
  for (let i = 0; i < sections.length; i++) {
    const section = sections[i];
    
    // セクション見出し
    if (section.level === 2) {
      content.push('<!-- wp:heading {"level":2} -->');
      content.push(`<h2 class="wp-block-heading">${section.title}</h2>`);
      content.push('<!-- /wp:heading -->');
      content.push('');
      content.push('<!-- wp:paragraph -->');
      content.push('<p><br /></p>');
      content.push('<!-- /wp:paragraph -->');
      content.push('');
    } else if (section.level === 3) {
      content.push('<!-- wp:heading {"level":3} -->');
      content.push(`<h3 class="wp-block-heading">${section.title}</h3>`);
      content.push('<!-- /wp:heading -->');
      content.push('');
    }
    
    // セクション内容
    for (let paragraph of section.paragraphs) {
      if (paragraph.trim()) {
        // 重要な情報はキャプションブロックに
        if (paragraph.includes('**') || paragraph.includes('重要') || paragraph.includes('注意')) {
          content.push(generateCaptionBlock(paragraph.replace(/\*\*/g, '')));
        } else {
          content.push('<!-- wp:paragraph -->');
          content.push(`<p>${paragraph.trim()}</p>`);
          content.push('<!-- /wp:paragraph -->');
        }
        content.push('');
      }
    }
    
    // テーマ特有のコンテンツを適切な位置に挿入
    if (section.level === 2 && shouldAddSpecialContent(section.title, theme)) {
      content.push(generateThemeSpecificContent(section.title, theme));
      content.push('');
    }
    
    // 図表を適切な位置に挿入
    if (section.level === 2 && i < 3) { // 最初の3セクションに図表追加
      content.push(generateChartForSection(section.title, theme, i));
      content.push('');
    }
    
    // 吹き出しを頻繁に挿入（マスターガイドの要求通り）
    if (section.level >= 2 && Math.random() < 0.6) {
      content.push(generateThemeSpecificBalloon(theme));
      content.push('');
    }
  }
  
  // 最終吹き出し（マスターガイドの要求）
  content.push('<!-- wp:html -->');
  content.push('[speech_balloon id="3"]今日の授業は終わり！また来てや！！[/speech_balloon]');
  content.push('<!-- /wp:html -->');
  
  return content.join('\n');
}

function parseMarkdownSections(markdown) {
  const lines = markdown.split('\n');
  const sections = [];
  let currentSection = null;
  
  for (let line of lines) {
    if (line.startsWith('# ')) {
      // H1はタイトルなので記録のみ
      if (currentSection) sections.push(currentSection);
      currentSection = {
        level: 1,
        title: line.replace('# ', ''),
        paragraphs: []
      };
    } else if (line.startsWith('## ')) {
      if (currentSection) sections.push(currentSection);
      currentSection = {
        level: 2,
        title: line.replace('## ', ''),
        paragraphs: []
      };
    } else if (line.startsWith('### ')) {
      if (currentSection) sections.push(currentSection);
      currentSection = {
        level: 3,
        title: line.replace('### ', ''),
        paragraphs: []
      };
    } else if (line.trim() && !line.startsWith('|') && !line.startsWith('-') && !line.startsWith('```')) {
      if (currentSection) {
        currentSection.paragraphs.push(line.trim());
      }
    }
  }
  
  if (currentSection) {
    sections.push(currentSection);
  }
  
  return sections.filter(s => s.level >= 2); // H2以下のみ返却
}

function generateCaptionBlock(content) {
  return `<!-- wp:loos/cap-block {"dataColSet":"col2","className":"is-style-onborder_ttl2"} -->
<div class="swell-block-capbox cap_box is-style-onborder_ttl2" data-colset="col2">
<div class="cap_box_ttl"><span>重要ポイント</span></div>
<div class="cap_box_content">
<!-- wp:paragraph -->
<p>${content}</p>
<!-- /wp:paragraph -->
</div></div>
<!-- /wp:loos/cap-block -->`;
}

function shouldAddSpecialContent(sectionTitle, theme) {
  return sectionTitle.includes('比較') || 
         sectionTitle.includes('選び方') || 
         sectionTitle.includes('手順') ||
         sectionTitle.includes('方法');
}

function generateThemeSpecificContent(sectionTitle, theme) {
  if (sectionTitle.includes('比較') || sectionTitle.includes('選び方')) {
    return generateComparisonTable(theme);
  } else if (sectionTitle.includes('手順') || sectionTitle.includes('方法')) {
    return generateStepBlock(theme, sectionTitle);
  }
  return '';
}

function generateComparisonTable(theme) {
  if (theme.includes('インボイス')) {
    return `<!-- wp:table {"className":"is-style-simple"} -->
<figure class="wp-block-table is-style-simple">
<table>
<thead>
<tr>
<th>機能</th>
<th>freee会計</th>
<th>マネーフォワード</th>
<th>弥生会計</th>
</tr>
</thead>
<tbody>
<tr>
<td><strong>インボイス対応</strong></td>
<td>完全対応</td>
<td>完全対応</td>
<td>完全対応</td>
</tr>
<tr>
<td><strong>月額料金</strong></td>
<td>2,680円～</td>
<td>2,980円～</td>
<td>2,160円～</td>
</tr>
<tr>
<td><strong>サポート</strong></td>
<td>チャット・電話</td>
<td>チャット・メール</td>
<td>電話・メール</td>
</tr>
</tbody>
</table>
</figure>
<!-- /wp:table -->`;
  } else if (theme.includes('IT導入補助金')) {
    return `<!-- wp:table {"className":"is-style-simple"} -->
<figure class="wp-block-table is-style-simple">
<table>
<thead>
<tr>
<th>補助枠</th>
<th>補助率</th>
<th>上限額</th>
<th>特徴</th>
</tr>
</thead>
<tbody>
<tr>
<td><strong>通常枠</strong></td>
<td>1/2以内</td>
<td>450万円</td>
<td>基本的な枠</td>
</tr>
<tr>
<td><strong>インボイス対応枠</strong></td>
<td>3/4以内</td>
<td>350万円</td>
<td>最も有利</td>
</tr>
<tr>
<td><strong>デジタル化基盤導入枠</strong></td>
<td>3/4以内</td>
<td>50万円</td>
<td>会計ソフト向け</td>
</tr>
</tbody>
</table>
</figure>
<!-- /wp:table -->`;
  }
  return '';
}

function generateStepBlock(theme, sectionTitle) {
  if (theme.includes('インボイス')) {
    return `<!-- wp:loos/step {"className":"is-style-default"} -->
<div class="swell-block-step is-style-default" data-num-style="circle">
<!-- wp:loos/step-item {"stepLabel":"STEP"} -->
<div class="swell-block-step__item">
<div class="swell-block-step__number u-bg-main"><span class="__label">STEP</span><span class="__num">1</span></div>
<div class="swell-block-step__title u-fz-l">適格請求書発行事業者の登録申請</div>
<div class="swell-block-step__body">
<!-- wp:paragraph -->
<p>国税庁のe-Taxまたは書面で申請します</p>
<!-- /wp:paragraph -->
</div></div>
<!-- /wp:loos/step-item -->
<!-- wp:loos/step-item {"stepLabel":"STEP"} -->
<div class="swell-block-step__item">
<div class="swell-block-step__number u-bg-main"><span class="__label">STEP</span><span class="__num">2</span></div>
<div class="swell-block-step__title u-fz-l">会計ソフトの設定と確認</div>
<div class="swell-block-step__body">
<!-- wp:paragraph -->
<p>インボイス対応設定を行い、適格請求書の発行準備をします</p>
<!-- /wp:paragraph -->
</div></div>
<!-- /wp:loos/step-item -->
</div>
<!-- /wp:loos/step -->`;
  } else if (theme.includes('IT導入補助金')) {
    return `<!-- wp:loos/step {"className":"is-style-default"} -->
<div class="swell-block-step is-style-default" data-num-style="circle">
<!-- wp:loos/step-item {"stepLabel":"STEP"} -->
<div class="swell-block-step__item">
<div class="swell-block-step__number u-bg-main"><span class="__label">STEP</span><span class="__num">1</span></div>
<div class="swell-block-step__title u-fz-l">IT導入支援事業者の選定</div>
<div class="swell-block-step__body">
<!-- wp:paragraph -->
<p>導入したい会計ソフトの認定事業者を選択します</p>
<!-- /wp:paragraph -->
</div></div>
<!-- /wp:loos/step-item -->
<!-- wp:loos/step-item {"stepLabel":"STEP"} -->
<div class="swell-block-step__item">
<div class="swell-block-step__number u-bg-main"><span class="__label">STEP</span><span class="__num">2</span></div>
<div class="swell-block-step__title u-fz-l">申請書類の作成と提出</div>
<div class="swell-block-step__body">
<!-- wp:paragraph -->
<p>事業計画書等の必要書類を準備して申請します</p>
<!-- /wp:paragraph -->
</div></div>
<!-- /wp:loos/step-item -->
</div>
<!-- /wp:loos/step -->`;
  } else if (theme.includes('法人確定申告')) {
    return `<!-- wp:loos/step {"className":"is-style-default"} -->
<div class="swell-block-step is-style-default" data-num-style="circle">
<!-- wp:loos/step-item {"stepLabel":"STEP"} -->
<div class="swell-block-step__item">
<div class="swell-block-step__number u-bg-main"><span class="__label">STEP</span><span class="__num">1</span></div>
<div class="swell-block-step__title u-fz-l">年間取引データの整理</div>
<div class="swell-block-step__body">
<!-- wp:paragraph -->
<p>帳簿データを整理して試算表を作成します</p>
<!-- /wp:paragraph -->
</div></div>
<!-- /wp:loos/step-item -->
<!-- wp:loos/step-item {"stepLabel":"STEP"} -->
<div class="swell-block-step__item">
<div class="swell-block-step__number u-bg-main"><span class="__label">STEP</span><span class="__num">2</span></div>
<div class="swell-block-step__title u-fz-l">決算整理と申告書作成</div>
<div class="swell-block-step__body">
<!-- wp:paragraph -->
<p>決算整理仕訳を行い、法人税申告書を作成します</p>
<!-- /wp:paragraph -->
</div></div>
<!-- /wp:loos/step-item -->
</div>
<!-- /wp:loos/step -->`;
  }
  return '';
}

function generateChartForSection(sectionTitle, theme, index) {
  if (theme.includes('インボイス')) {
    if (index === 0) {
      return generateInvoiceComparisonChart();
    } else if (index === 1) {
      return generateInvoiceProcessChart();
    }
  } else if (theme.includes('IT導入補助金')) {
    if (index === 0) {
      return generateSubsidyCalculationChart();
    } else if (index === 1) {
      return generateSubsidyProcessChart();
    }
  } else if (theme.includes('法人確定申告')) {
    if (index === 0) {
      return generateTaxCalculationChart();
    } else if (index === 1) {
      return generateTaxProcessChart();
    }
  }
  return '';
}

function generateInvoiceComparisonChart() {
  return `<!-- wp:html -->
<div class="accounting-service-compare" style="margin: 1.5em 0;">
  <style>
    .accounting-service-compare * {
      box-sizing: border-box;
    }
    @media screen and (max-width: 768px) {
      .accounting-service-compare {
        padding: 12px !important;
      }
      .accounting-service-compare .compare-card {
        padding: 12px !important;
        font-size: 12px !important;
      }
    }
  </style>
  
  <div style="padding: 15px; background: linear-gradient(135deg, #FFF3E0 0%, #FFE0B2 100%); border-radius: 12px;">
    <div style="text-align: center; margin-bottom: 15px; color: #E65100; font-size: 16px; font-weight: bold;">⚖️ インボイス対応会計ソフト比較</div>
    
    <div style="display: flex; flex-direction: column; gap: 12px;">
      <div class="compare-card" style="border: 2px solid #4CAF50; border-radius: 12px; overflow: hidden;">
        <div style="background: #4CAF50; color: white; padding: 12px; display: flex; align-items: center; justify-content: space-between;">
          <div style="font-weight: bold; font-size: 15px;">✅ freee会計</div>
          <div style="font-size: 18px; font-weight: bold;">◎</div>
        </div>
        <div style="padding: 15px; background: #F1F8E9;">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 10px;">
            <div style="background: white; padding: 8px; border-radius: 6px;">
              <div style="font-size: 12px; color: #666; margin-bottom: 3px;">メリット</div>
              <div style="font-size: 11px; color: #2E7D32; line-height: 1.3;">操作が簡単で初心者向け</div>
            </div>
            <div style="background: white; padding: 8px; border-radius: 6px;">
              <div style="font-size: 12px; color: #666; margin-bottom: 3px;">料金</div>
              <div style="font-size: 11px; color: #2E7D32; line-height: 1.3;">月額2,680円～</div>
            </div>
          </div>
          <div style="text-align: center; background: #C8E6C9; padding: 8px; border-radius: 6px;">
            <strong style="font-size: 14px;">インボイス対応: <span style="color: #1B5E20; font-size: 15px;">完全対応</span></strong>
          </div>
        </div>
      </div>
      
      <div class="compare-card" style="border: 2px solid #FF9800; border-radius: 12px; overflow: hidden;">
        <div style="background: #FF9800; color: white; padding: 12px; display: flex; align-items: center; justify-content: space-between;">
          <div style="font-weight: bold; font-size: 15px;">⚠️ マネーフォワード</div>
          <div style="font-size: 18px; font-weight: bold;">○</div>
        </div>
        <div style="padding: 15px; background: #FFF8E1;">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 10px;">
            <div style="background: white; padding: 8px; border-radius: 6px;">
              <div style="font-size: 12px; color: #666; margin-bottom: 3px;">メリット</div>
              <div style="font-size: 11px; color: #E65100; line-height: 1.3;">連携機能が豊富</div>
            </div>
            <div style="background: white; padding: 8px; border-radius: 6px;">
              <div style="font-size: 12px; color: #666; margin-bottom: 3px;">料金</div>
              <div style="font-size: 11px; color: #E65100; line-height: 1.3;">月額2,980円～</div>
            </div>
          </div>
          <div style="text-align: center; background: #FFE0B2; padding: 8px; border-radius: 6px;">
            <strong style="font-size: 14px;">インボイス対応: <span style="color: #BF360C; font-size: 15px;">完全対応</span></strong>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
<!-- /wp:html -->`;
}

function generateInvoiceProcessChart() {
  return `<!-- wp:html -->
<div class="accounting-calc-process" style="margin: 1.5em 0;">
  <style>
    .accounting-calc-process * {
      box-sizing: border-box;
    }
    @media screen and (max-width: 768px) {
      .accounting-calc-process {
        padding: 12px !important;
      }
      .accounting-calc-process .calc-step {
        padding: 10px !important;
        font-size: 12px !important;
      }
    }
  </style>
  
  <div style="padding: 15px; background: #f8f9fa; border-radius: 12px; border-left: 4px solid #4CAF50;">
    <div style="text-align: center; margin-bottom: 15px; color: #2E7D32; font-size: 16px; font-weight: bold;">🧮 インボイス制度対応の流れ</div>
    
    <div style="display: flex; flex-direction: column; gap: 12px;">
      <div class="calc-step" style="display: flex; align-items: center; padding: 12px; background: white; border-radius: 8px; box-shadow: 0 2px 6px rgba(0,0,0,0.1);">
        <div style="width: 32px; height: 32px; background: #4CAF50; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; margin-right: 12px; flex-shrink: 0; font-size: 14px;">1</div>
        <div style="flex: 1;">
          <div style="font-weight: bold; margin-bottom: 4px; font-size: 14px;">適格請求書発行事業者の登録</div>
          <div style="font-size: 13px; color: #666;">国税庁のe-Taxまたは書面で申請</div>
        </div>
        <div style="font-size: 16px; font-weight: bold; color: #4CAF50; min-width: 80px; text-align: right;">必須</div>
      </div>
      
      <div class="calc-step" style="display: flex; align-items: center; padding: 12px; background: white; border-radius: 8px; box-shadow: 0 2px 6px rgba(0,0,0,0.1);">
        <div style="width: 32px; height: 32px; background: #2196F3; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; margin-right: 12px; flex-shrink: 0; font-size: 14px;">2</div>
        <div style="flex: 1;">
          <div style="font-weight: bold; margin-bottom: 4px; font-size: 14px;">会計ソフトの設定</div>
          <div style="font-size: 13px; color: #666;">適格請求書対応の設定と確認</div>
        </div>
        <div style="font-size: 16px; font-weight: bold; color: #2196F3; min-width: 80px; text-align: right;">1日</div>
      </div>
    </div>
    
    <div style="margin-top: 15px; padding: 15px; background: linear-gradient(135deg, #FF9800 0%, #FF5722 100%); color: white; border-radius: 8px; text-align: center;">
      <div style="font-size: 13px; margin-bottom: 5px;">対応完了で得られる効果</div>
      <div style="font-size: 20px; font-weight: bold;">経理業務60%削減</div>
    </div>
  </div>
</div>
<!-- /wp:html -->`;
}

function generateSubsidyCalculationChart() {
  return `<!-- wp:html -->
<div class="accounting-data-chart" style="margin: 1.5em 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-weight: normal; color: #333;">
  <style>
    .accounting-data-chart * {
      box-sizing: border-box;
    }
    .accounting-data-chart .chart-title {
      margin: 0 0 15px 0; 
      color: #1976D2; 
      font-size: 16px; 
      font-weight: bold;
      text-align: center;
    }
    .accounting-data-chart .data-item {
      display: flex; 
      align-items: center; 
      justify-content: space-between;
      padding: 12px; 
      background: white; 
      border-radius: 8px; 
      box-shadow: 0 2px 6px rgba(0,0,0,0.1); 
      margin-bottom: 10px;
    }
    @media screen and (max-width: 768px) {
      .accounting-data-chart {
        padding: 12px !important;
      }
      .accounting-data-chart .data-item {
        padding: 10px !important;
        font-size: 13px !important;
      }
    }
  </style>
  
  <div style="padding: 15px; background: linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 100%); border-radius: 12px; border-left: 4px solid #1976D2;">
    <div class="chart-title">📊 IT導入補助金の補助額シミュレーション</div>
    
    <div class="data-item">
      <div style="font-weight: bold; color: #1976D2; font-size: 14px;">通常枠</div>
      <div style="font-size: 16px; font-weight: bold; color: #1976D2;">補助率1/2</div>
    </div>
    
    <div class="data-item">
      <div style="font-weight: bold; color: #4CAF50; font-size: 14px;">インボイス対応枠</div>
      <div style="font-size: 16px; font-weight: bold; color: #4CAF50;">補助率3/4</div>
    </div>
    
    <div class="data-item">
      <div style="font-weight: bold; color: #FF9800; font-size: 14px;">デジタル化基盤導入枠</div>
      <div style="font-size: 16px; font-weight: bold; color: #FF9800;">補助率3/4</div>
    </div>
    
    <div style="margin-top: 15px; padding: 12px; background: rgba(25, 118, 210, 0.1); border-radius: 8px; border-left: 3px solid #1976D2;">
      <div style="font-size: 13px; color: #1976D2; font-weight: bold; margin-bottom: 4px;">💡 実質負担額の例</div>
      <div style="font-size: 12px; color: #555; line-height: 1.4;">年額36万円の会計ソフトが、インボイス対応枠利用で実質9万円に！</div>
    </div>
  </div>
</div>
<!-- /wp:html -->`;
}

function generateSubsidyProcessChart() {
  return generateInvoiceProcessChart().replace(/インボイス制度対応/g, 'IT導入補助金申請').replace(/適格請求書発行事業者の登録/g, 'IT導入支援事業者の選定').replace(/会計ソフトの設定/g, '申請書類の作成');
}

function generateTaxCalculationChart() {
  return generateSubsidyCalculationChart().replace(/IT導入補助金/g, '法人税申告').replace(/補助率/g, '適用税率');
}

function generateTaxProcessChart() {
  return generateInvoiceProcessChart().replace(/インボイス制度対応/g, '法人確定申告').replace(/適格請求書発行事業者の登録/g, '年間取引データの整理').replace(/会計ソフトの設定/g, '決算整理と申告書作成');
}

function generateThemeSpecificBalloon(theme) {
  const balloons = getThemeSpecificBalloons(theme);
  const balloon = balloons[Math.floor(Math.random() * balloons.length)];
  return `<!-- wp:html -->
[speech_balloon id="${balloon.id}"]${balloon.message}[/speech_balloon]
<!-- /wp:html -->`;
}

function getThemeSpecificBalloons(theme) {
  if (theme.includes('インボイス')) {
    return [
      { id: '5', message: 'あの...インボイス制度って難しそうで心配です。基本的な仕組みを教えていただけますか？' },
      { id: '3', message: 'インボイス制度の基本は実はシンプルやで。適格請求書の発行が義務になって、消費税の仕組みが変わったんや。' },
      { id: '5', message: '会計ソフトを使えば簡単に対応できますか？' },
      { id: '3', message: 'そうやで！freeeもマネーフォワードも完全対応してるから心配いらんわ。' }
    ];
  } else if (theme.includes('IT導入補助金')) {
    return [
      { id: '5', message: 'IT導入補助金って本当にお得なんですか？' },
      { id: '3', message: '最大75%も補助されるから、めちゃくちゃお得やで！申請の手間はあるけど、その価値は十分あるわ。' },
      { id: '5', message: '申請って難しくないですか？' },
      { id: '3', message: 'IT導入支援事業者がサポートしてくれるから、そんなに難しくないで。freeeとかも申請サポートしてくれるしな。' }
    ];
  } else if (theme.includes('法人確定申告')) {
    return [
      { id: '5', message: '法人の確定申告って自分でできるものなんですか？' },
      { id: '3', message: '小規模な法人なら十分可能やで！会計ソフト使えば計算も書類作成も楽になるからな。' },
      { id: '5', message: 'やっぱり税理士さんに頼んだ方が安全ですよね？' },
      { id: '3', message: '安全性を取るなら税理士やけど、コスト重視なら自分でやるのもアリやで。年間数十万円の節約になるからなあ。' }
    ];
  }
  
  return [
    { id: '5', message: 'この方法って本当に効果があるんですか？' },
    { id: '3', message: 'はい！実際に多くの企業で導入実績がありますよ。' }
  ];
}

function extractTitle(markdown) {
  const titleMatch = markdown.match(/^# (.+)$/m);
  return titleMatch ? titleMatch[1] : 'タイトルなし';
}

function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^a-zA-Z0-9ひらがなカタカナ漢字]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 50);
}

function extractMetaDescription(markdown) {
  const lines = markdown.split('\n');
  for (let line of lines) {
    if (line.trim() && !line.startsWith('#') && !line.startsWith('|')) {
      return line.trim().substring(0, 120) + '...';
    }
  }
  return '詳細な解説記事です。';
}

function getCategoriesForTheme(theme) {
  if (theme.includes('インボイス')) {
    return ['インボイス制度', '会計ソフト', '税務'];
  } else if (theme.includes('IT導入補助金')) {
    return ['IT導入補助金', '会計ソフト', '補助金・助成金'];
  } else if (theme.includes('法人確定申告')) {
    return ['法人税', '確定申告', '税務'];
  }
  return ['会計', '税務'];
}

function getTagsForTheme(theme) {
  if (theme.includes('インボイス')) {
    return ['インボイス制度', '適格請求書', '会計ソフト', 'freee', 'マネーフォワード', '弥生会計'];
  } else if (theme.includes('IT導入補助金')) {
    return ['IT導入補助金', '会計ソフト', 'freee', 'マネーフォワード', '補助金申請', '業務効率化'];
  } else if (theme.includes('法人確定申告')) {
    return ['法人税', '確定申告', '決算', '税務申告', 'e-Tax', '会計ソフト'];
  }
  return ['会計', '税務', 'DX'];
}

function generateSchemaMarkup(title, content, theme) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": title,
    "author": {
      "@type": "Person",
      "name": "イザーク会計事務所"
    },
    "publisher": {
      "@type": "Organization", 
      "name": "イザーク会計事務所",
      "logo": {
        "@type": "ImageObject",
        "url": "https://ezark-tax-accounting.com/wp-content/uploads/2024/logo.png"
      }
    },
    "datePublished": new Date().toISOString(),
    "dateModified": new Date().toISOString(),
    "description": extractMetaDescription(content),
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": "https://ezark-tax-accounting.com/"
    }
  };
  
  return JSON.stringify(schema, null, 2);
}

function countJapaneseCharacters(text) {
  const cleanText = text.replace(/<[^>]*>/g, '').replace(/<!--[\s\S]*?-->/g, '');
  return cleanText.length;
}

function countSpeechBalloons(content) {
  const balloonMatches = content.match(/\[speech_balloon/g);
  return balloonMatches ? balloonMatches.length : 0;
}

// 直接実行
if (require.main === module) {
  generateImprovedThreeArticles()
    .then((results) => {
      console.log('\n🎯 改良版3記事生成処理完了！');
      console.log(`📈 生成記事数: ${results.length}記事`);
      results.forEach((article, index) => {
        console.log(`  ${index + 1}. ${article.theme} (${article.actualWordCount}文字, 図表${article.chartCount}個)`);
      });
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ 処理失敗:', error.message);
      process.exit(1);
    });
}

module.exports = generateImprovedThreeArticles;