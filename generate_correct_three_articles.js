#!/usr/bin/env node

/**
 * デスクトップのマークダウンファイルを元に正しい3記事を生成
 */

const fs = require('fs').promises;
const path = require('path');

async function generateCorrectThreeArticles() {
  try {
    console.log('🚀 正しい3記事生成開始...');
    
    // デスクトップのマークダウンファイルを読み込み
    const articles = [
      {
        sourceFile: path.join(__dirname, '../記事1_インボイス制度対応会計ソフト.md'),
        outputPath: path.join(__dirname, 'outputs/article1_invoice_accounting_software.json'),
        theme: 'インボイス制度対応会計ソフト'
      },
      {
        sourceFile: path.join(__dirname, '../記事2_IT導入補助金で会計ソフト導入.md'),
        outputPath: path.join(__dirname, 'outputs/article2_it_subsidy_accounting.json'),
        theme: 'IT導入補助金で会計ソフト導入'
      },
      {
        sourceFile: path.join(__dirname, '../記事3_法人確定申告を自分で行う方法.md'),
        outputPath: path.join(__dirname, 'outputs/article3_corporate_tax_diy.json'),
        theme: '法人確定申告を自分で行う方法'
      }
    ];

    const results = [];

    for (let i = 0; i < articles.length; i++) {
      const article = articles[i];
      
      console.log(`\n📝 記事${i + 1}生成開始: ${article.theme}`);
      
      // マークダウンファイル読み込み
      const markdownContent = await fs.readFile(article.sourceFile, 'utf8');
      
      // マークダウンをWordPress形式に変換（詳細構成対応）
      const wordPressContent = convertMarkdownToWordPress(markdownContent, article.theme);
      
      // 図表生成（記事内容に基づく）
      const charts = generateChartsFromContent(wordPressContent, article.theme);
      
      // 図表を記事に統合
      const contentWithCharts = integrateChartsIntoContent(wordPressContent, charts);
      
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
        content: contentWithCharts,
        slug: slug,
        metaDescription: metaDescription,
        categories: categories,
        tags: tags,
        schema: schema,
        hasSchema: true,
        hasCharts: charts.length > 0,
        chartCount: charts.length,
        actualWordCount: countJapaneseCharacters(contentWithCharts),
        speechBalloonCount: countSpeechBalloons(contentWithCharts),
        theme: article.theme,
        sourceFile: path.basename(article.sourceFile),
        generatedAt: new Date().toISOString(),
        charts: charts
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
    
    console.log('\n🎉 3記事すべて生成完了！');
    return results;
    
  } catch (error) {
    console.error('❌ 記事生成エラー:', error.message);
    throw error;
  }
}

function convertMarkdownToWordPress(markdown, theme) {
  console.log(`📝 マークダウンをWordPress形式に変換中: ${theme}`);
  
  // マスターガイドのプロンプト設定に基づく詳細な構成作成
  const detailedStructure = generateDetailedStructure(markdown, theme);
  
  // WordPressブロックエディタ形式で記事構成
  let wpContent = [];
  
  // 目次
  wpContent.push('<!-- wp:paragraph -->\n<p>[swell_toc headline="目次" display_level="2-3"]</p>\n<!-- /wp:paragraph -->');
  wpContent.push('<!-- wp:paragraph -->\n<p><br /></p>\n<!-- /wp:paragraph -->');
  
  // 詳細構成を基にコンテンツ生成
  for (let section of detailedStructure) {
    wpContent.push(generateSection(section, theme));
  }
  
  // 最終吹き出し（マスターガイドの指示通り）
  wpContent.push('<!-- wp:html -->\n[speech_balloon id="3"]今日の授業は終わり！また来てや！！[/speech_balloon]\n<!-- /wp:html -->');
  
  return wpContent.join('\n\n');
}

function generateDetailedStructure(markdown, theme) {
  const sections = [];
  const lines = markdown.split('\n');
  let currentSection = null;
  let currentSubsection = null;
  
  for (let line of lines) {
    if (line.startsWith('# ')) {
      if (currentSection) {
        sections.push(currentSection);
      }
      currentSection = {
        type: 'h1',
        title: line.replace('# ', ''),
        content: [],
        subsections: []
      };
    } else if (line.startsWith('## ')) {
      if (currentSubsection) {
        currentSection.subsections.push(currentSubsection);
      }
      currentSubsection = {
        type: 'h2',
        title: line.replace('## ', ''),
        content: [],
        subsections: []
      };
    } else if (line.startsWith('### ')) {
      if (currentSubsection) {
        currentSubsection.subsections.push({
          type: 'h3',
          title: line.replace('### ', ''),
          content: [line]
        });
      }
    } else if (line.trim()) {
      if (currentSubsection) {
        currentSubsection.content.push(line);
      } else if (currentSection) {
        currentSection.content.push(line);
      }
    }
  }
  
  if (currentSubsection) {
    currentSection.subsections.push(currentSubsection);
  }
  if (currentSection) {
    sections.push(currentSection);
  }
  
  return sections;
}

function generateSection(section, theme) {
  let sectionContent = [];
  
  // 見出し
  if (section.type === 'h1') {
    // H1は記事タイトルなので出力しない
  } else if (section.type === 'h2') {
    sectionContent.push(`<!-- wp:heading {"level":2} -->\n<h2 class="wp-block-heading">${section.title}</h2>\n<!-- /wp:heading -->`);
    sectionContent.push('<!-- wp:paragraph -->\n<p><br /></p>\n<!-- /wp:paragraph -->');
  } else if (section.type === 'h3') {
    sectionContent.push(`<!-- wp:heading {"level":3} -->\n<h3 class="wp-block-heading">${section.title}</h3>\n<!-- /wp:heading -->`);
  }
  
  // コンテンツ
  for (let content of section.content) {
    if (content.trim() && !content.startsWith('#')) {
      // 重要情報をキャプションブロックに
      if (content.includes('**') || content.includes('重要') || content.includes('注意')) {
        sectionContent.push(generateCaptionBlock(content));
      } else {
        sectionContent.push(`<!-- wp:paragraph -->\n<p>${content.trim()}</p>\n<!-- /wp:paragraph -->`);
      }
    }
  }
  
  // サブセクション
  for (let subsection of section.subsections) {
    sectionContent.push(generateSection(subsection, theme));
    
    // マスターガイドに従って吹き出しを頻繁に挿入（5セクションごと）
    if (Math.random() < 0.4) {
      sectionContent.push(generateRandomSpeechBalloon(theme));
    }
  }
  
  // テーマ特有のコンテンツ追加
  if (section.type === 'h2') {
    sectionContent.push(generateThemeSpecificContent(section, theme));
  }
  
  return sectionContent.join('\n\n');
}

function generateCaptionBlock(content) {
  // 重要情報をキャプションブロックに変換
  const cleanContent = content.replace(/\*\*/g, '');
  return `<!-- wp:loos/cap-block {"dataColSet":"col2","className":"is-style-onborder_ttl2"} -->
<div class="swell-block-capbox cap_box is-style-onborder_ttl2" data-colset="col2">
<div class="cap_box_ttl"><span>重要ポイント</span></div>
<div class="cap_box_content">
<!-- wp:paragraph -->
<p>${cleanContent}</p>
<!-- /wp:paragraph -->
</div></div>
<!-- /wp:loos/cap-block -->`;
}

function generateRandomSpeechBalloon(theme) {
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

function generateThemeSpecificContent(section, theme) {
  // テーマに応じた比較表や詳細コンテンツを生成
  if (section.title.includes('比較') || section.title.includes('選び方')) {
    return generateComparisonTable(theme);
  } else if (section.title.includes('手順') || section.title.includes('方法')) {
    return generateStepBlock(theme);
  } else if (section.title.includes('メリット') || section.title.includes('効果')) {
    return generateBenefitsBlock(theme);
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
  }
  return '';
}

function generateStepBlock(theme) {
  return `<!-- wp:loos/step {"className":"is-style-default"} -->
<div class="swell-block-step is-style-default" data-num-style="circle">
<!-- wp:loos/step-item {"stepLabel":"STEP"} -->
<div class="swell-block-step__item">
<div class="swell-block-step__number u-bg-main"><span class="__label">STEP</span><span class="__num">1</span></div>
<div class="swell-block-step__title u-fz-l">初期設定を行う</div>
<div class="swell-block-step__body">
<!-- wp:paragraph -->
<p>基本情報の登録と必要な設定を行います</p>
<!-- /wp:paragraph -->
</div></div>
<!-- /wp:loos/step-item -->
<!-- wp:loos/step-item {"stepLabel":"STEP"} -->
<div class="swell-block-step__item">
<div class="swell-block-step__number u-bg-main"><span class="__label">STEP</span><span class="__num">2</span></div>
<div class="swell-block-step__title u-fz-l">データ連携設定</div>
<div class="swell-block-step__body">
<!-- wp:paragraph -->
<p>銀行口座やクレジットカードとの連携を設定します</p>
<!-- /wp:paragraph -->
</div></div>
<!-- /wp:loos/step-item -->
</div>
<!-- /wp:loos/step -->`;
}

function generateBenefitsBlock(theme) {
  return `<!-- wp:loos/cap-block {"dataColSet":"col2","className":"is-style-onborder_ttl2"} -->
<div class="swell-block-capbox cap_box is-style-onborder_ttl2" data-colset="col2">
<div class="cap_box_ttl"><span>主な効果・メリット</span></div>
<div class="cap_box_content">
<!-- wp:list {"className":"is-style-good_list"} -->
<ul class="wp-block-list is-style-good_list">
<li>作業時間の大幅短縮</li>
<li>ヒューマンエラーの削減</li>
<li>コンプライアンス対応</li>
<li>業務効率化の実現</li>
</ul>
<!-- /wp:list -->
</div></div>
<!-- /wp:loos/cap-block -->`;

function generateChartsFromContent(content, theme) {
  const charts = [];
  
  // テーマに応じた図表を生成
  if (theme.includes('インボイス')) {
    charts.push(generateInvoiceComparisonChart());
    charts.push(generateInvoiceProcessChart());
  } else if (theme.includes('IT導入補助金')) {
    charts.push(generateSubsidyCalculationChart());
    charts.push(generateSubsidyProcessChart());
  } else if (theme.includes('法人確定申告')) {
    charts.push(generateTaxCalculationChart());
    charts.push(generateTaxProcessChart());
  }
  
  return charts;
}

function integrateChartsIntoContent(content, charts) {
  if (charts.length === 0) return content;
  
  const sections = content.split('<!-- wp:heading {"level":2} -->');
  let result = sections[0]; // 最初の部分
  
  for (let i = 1; i < sections.length && i - 1 < charts.length; i++) {
    // H2見出しの後に図表を挿入
    result += '<!-- wp:heading {"level":2} -->' + sections[i];
    
    // 適切な位置に図表を挿入
    const nextH3 = sections[i].indexOf('<!-- wp:heading {"level":3} -->');
    if (nextH3 > 0) {
      const beforeH3 = sections[i].substring(0, nextH3);
      const afterH3 = sections[i].substring(nextH3);
      result = result.replace('<!-- wp:heading {"level":2} -->' + sections[i], 
        '<!-- wp:heading {"level":2} -->' + beforeH3 + '\n\n' + charts[i - 1] + '\n\n' + afterH3);
    } else {
      result += '\n\n' + charts[i - 1] + '\n\n';
    }
  }
  
  // 残りのセクション
  for (let i = charts.length + 1; i < sections.length; i++) {
    result += '<!-- wp:heading {"level":2} -->' + sections[i];
  }
  
  return result;
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
  return generateInvoiceProcessChart().replace('インボイス制度対応', 'IT導入補助金申請');
}

function generateTaxCalculationChart() {
  return generateSubsidyCalculationChart().replace('IT導入補助金', '法人税申告');
}

function generateTaxProcessChart() {
  return generateInvoiceProcessChart().replace('インボイス制度対応', '法人確定申告');
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
  // 最初の段落から120文字程度を抽出
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
  // HTMLタグを除外してカウント
  const cleanText = text.replace(/<[^>]*>/g, '').replace(/<!--[\s\S]*?-->/g, '');
  return cleanText.length;
}

function countSpeechBalloons(content) {
  const balloonMatches = content.match(/\[speech_balloon/g);
  return balloonMatches ? balloonMatches.length : 0;
}

// 直接実行
if (require.main === module) {
  generateCorrectThreeArticles()
    .then((results) => {
      console.log('\n🎯 正しい3記事生成処理完了！');
      console.log(`📈 生成記事数: ${results.length}記事`);
      results.forEach((article, index) => {
        console.log(`  ${index + 1}. ${article.theme} (${article.actualWordCount}文字)`);
      });
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ 処理失敗:', error.message);
      process.exit(1);
    });
}

module.exports = generateCorrectThreeArticles;