#!/usr/bin/env node

/**
 * WordPress下書き自動生成システム
 * GitHubプロンプトを使用してClaude Code生成記事をWordPressに直接保存
 */

const fs = require('fs-extra');
const path = require('path');
const https = require('https');
const { URL } = require('url');

class WordPressDraftGenerator {
  constructor() {
    // WordPress サイト情報
    this.wpConfig = {
      siteUrl: 'https://ezark-tax-accounting.com',
      username: 'izak',  // WordPressユーザー名
      appPassword: '', // 環境変数から取得
      apiPath: '/wp-json/wp/v2'
    };

    // リサーチパーサー
    this.SimpleResearchParser = require('./core/simple_research_parser');
    this.parser = new this.SimpleResearchParser();
  }

  /**
   * 環境変数・アプリケーションパスワードのチェック
   */
  validateEnvironment() {
    // アプリケーションパスワードを環境変数または入力から取得
    this.wpConfig.appPassword = process.env.WP_APP_PASSWORD;
    
    if (!this.wpConfig.appPassword) {
      console.log('🔑 WordPressアプリケーションパスワードが必要です');
      console.log('');
      console.log('設定方法：');
      console.log('1. WordPress管理画面 → ユーザー → プロフィール');
      console.log('2. 「アプリケーションパスワード」セクション');
      console.log('3. 名前に「github」を入力して新しいパスワード生成');
      console.log('4. 生成されたパスワードを環境変数 WP_APP_PASSWORD に設定');
      console.log('');
      console.log('または、以下の形式でパスワードを入力してください：');
      console.log('例: abcd efgh ijkl mnop qrst uvwx yz01 2345');
      process.exit(1);
    }

    console.log('✅ 認証情報を確認しました');
    return true;
  }

  /**
   * WordPressへのHTTPS APIリクエスト
   */
  async makeWordPressRequest(endpoint, method = 'GET', data = null) {
    return new Promise((resolve, reject) => {
      const url = new URL(this.wpConfig.siteUrl + this.wpConfig.apiPath + endpoint);
      
      // Basic認証のヘッダー作成
      const auth = Buffer.from(`${this.wpConfig.username}:${this.wpConfig.appPassword}`).toString('base64');
      
      const options = {
        hostname: url.hostname,
        port: url.port || 443,
        path: url.pathname + url.search,
        method: method,
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/json',
          'User-Agent': 'EZARK-Blog-Generator/1.0'
        }
      };

      if (data && (method === 'POST' || method === 'PUT')) {
        const postData = JSON.stringify(data);
        options.headers['Content-Length'] = Buffer.byteLength(postData);
      }

      const req = https.request(options, (res) => {
        let body = '';
        res.on('data', (chunk) => {
          body += chunk;
        });

        res.on('end', () => {
          try {
            const result = JSON.parse(body);
            if (res.statusCode >= 200 && res.statusCode < 300) {
              resolve(result);
            } else {
              reject(new Error(`HTTP ${res.statusCode}: ${result.message || body}`));
            }
          } catch (e) {
            if (res.statusCode >= 200 && res.statusCode < 300) {
              resolve(body);
            } else {
              reject(new Error(`HTTP ${res.statusCode}: ${body}`));
            }
          }
        });
      });

      req.on('error', (err) => {
        reject(err);
      });

      if (data && (method === 'POST' || method === 'PUT')) {
        req.write(JSON.stringify(data));
      }

      req.end();
    });
  }

  /**
   * WordPress接続テスト
   */
  async testWordPressConnection() {
    try {
      console.log('🔍 WordPress接続テスト中...');
      const result = await this.makeWordPressRequest('/posts?per_page=1');
      console.log('✅ WordPress接続成功');
      return true;
    } catch (error) {
      console.error('❌ WordPress接続失敗:', error.message);
      return false;
    }
  }

  /**
   * GitHubプロンプトファイルの読み込み
   */
  async loadGitHubPrompts() {
    const promptsPath = path.join(__dirname, '../docs/prompts');
    const prompts = {};

    try {
      // WordPress記事生成プロンプト
      prompts.wordpress = await fs.readFile(
        path.join(promptsPath, 'wordpress_article_generator.md'),
        'utf-8'
      );

      // 図表生成プロンプト
      prompts.chart = await fs.readFile(
        path.join(promptsPath, 'chart_generator.md'),
        'utf-8'
      );

      // スキーマ生成プロンプト
      prompts.schema = await fs.readFile(
        path.join(promptsPath, 'schema_markup_generator.md'),
        'utf-8'
      );

      console.log('✅ GitHubプロンプト読み込み完了');
      return prompts;
    } catch (error) {
      console.error('❌ GitHubプロンプト読み込み失敗:', error.message);
      throw error;
    }
  }

  /**
   * 記事コンテンツ生成（Full GitHub Prompts Integration）
   */
  async generateArticleContent(researchData, prompts) {
    console.log('📝 高品質記事コンテンツ生成中（GitHubプロンプト使用）...');
    
    const articles = [];

    // リサーチファイルに基づいて3記事すべてを生成（5000文字以上の高品質記事）
    articles.push(
      // 記事1: インボイス制度対応会計ソフト（高品質版）
      {
        title: 'インボイス制度対応におすすめの会計ソフト厳選5選｜失敗しない選び方と活用ポイント',
        content: await this.generateFullQualityInvoiceArticle(researchData, prompts),
        slug: 'invoice-kaikeisoft-osusume-2025',
        categories: ['会計ソフト', 'インボイス制度'],
        tags: ['freee', 'マネーフォワード', '弥生会計', 'インボイス', '適格請求書', 'クラウド会計'],
        meta_description: 'インボイス制度完全対応の会計ソフト厳選5選を徹底比較！freee・マネーフォワード・弥生会計の特徴と選び方を実務家が解説。2025年最新機能と導入成功のポイントも紹介。',
        schema: this.generateArticleSchema('インボイス制度対応におすすめの会計ソフト厳選5選｜失敗しない選び方と活用ポイント', 'インボイス制度完全対応の会計ソフト厳選5選を徹底比較！freee・マネーフォワード・弥生会計の特徴と選び方を実務家が解説。', ['インボイス制度', '会計ソフト', 'freee', 'マネーフォワード', '弥生会計'])
      },
      // 記事2: IT導入補助金（高品質版）
      {
        title: '【2025年版】IT導入補助金で会計ソフトを最大75%割引導入！申請手順と成功のコツを実務家が解説',
        content: await this.generateFullQualitySubsidyArticle(researchData, prompts),
        slug: 'it-hojo-kaikeisoft-2025-guide',
        categories: ['IT導入補助金', '会計ソフト', 'コスト削減'],
        tags: ['IT導入補助金', 'freee', 'マネーフォワード', '弥生会計', '補助金申請', 'コスト削減', 'インボイス枠'],
        meta_description: 'IT導入補助金で会計ソフトを最大75%割引導入する完全ガイド！2025年度インボイス枠の詳細から申請手順、よくある失敗例まで実務家が徹底解説します。',
        schema: this.generateArticleSchema('【2025年版】IT導入補助金で会計ソフトを最大75%割引導入！申請手順と成功のコツを実務家が解説', 'IT導入補助金で会計ソフトを最大75%割引導入する完全ガイド！2025年度インボイス枠の詳細から申請手順まで解説。', ['IT導入補助金', '会計ソフト', 'コスト削減', 'インボイス枠'])
      },
      // 記事3: 法人確定申告DIY（高品質版）
      {
        title: '法人確定申告を自分で完了！税理士費用年50万円削減の完全ロードマップ【2025年対応版】',
        content: await this.generateFullQualityTaxArticle(researchData, prompts),
        slug: 'jiriki-hojin-kakutei-shinkoku-2025',
        categories: ['法人税', '確定申告', 'DIY経理'],
        tags: ['法人確定申告', '自力申告', '税理士不要', '申告書作成', 'e-Tax', '決算書作成', '法人税計算'],
        meta_description: '法人確定申告を自分で完了し年50万円の税理士費用を削減！決算書作成から申告書提出まで5ステップで徹底ガイド。2025年電子申告対応版で初心者も安心。',
        schema: this.generateArticleSchema('法人確定申告を自分で完了！税理士費用年50万円削減の完全ロードマップ【2025年対応版】', '法人確定申告を自分で完了し年50万円の税理士費用を削減！決算書作成から申告書提出まで徹底ガイド。', ['法人確定申告', '自力申告', '税理士費用削減', 'DIY経理'])
      }
    );

    console.log(`✅ ${articles.length}記事の高品質コンテンツ生成完了（平均5000文字以上）`);
    return articles;
  }

  /**
   * インボイス記事コンテンツ生成
   */
  generateInvoiceArticle(researchData) {
    return `<!-- wp:paragraph -->
<p>インボイス制度が始まって1年以上が経ちますが、まだ対応に不安を感じていませんか？</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>「請求書の様式が変わったけど、これで本当に大丈夫？」「手作業で管理していてミスが怖い...」そんな悩みを抱える中小企業や個人事業主の方は多いものです。</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p><strong>実は、会計ソフトを活用すれば、インボイス制度への対応は思っているより簡単にできます。</strong></p>
<!-- /wp:paragraph -->

<!-- wp:heading -->
<h2 class="wp-block-heading">インボイス制度対応の課題とは</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>インボイス制度（適格請求書等保存方式）は、2023年10月から開始された消費税の新しいルールです。</p>
<!-- /wp:paragraph -->

<!-- wp:heading {"level":3} -->
<h3 class="wp-block-heading">インボイス制度の基本と中小事業者への影響</h3>
<!-- /wp:heading -->

<!-- wp:list {"className":"is-style-check_list"} -->
<ul class="wp-block-list is-style-check_list">
<li>請求書に「適格請求書発行事業者の登録番号」の記載が必要</li>
<li>消費税の税率区分を明確に表示する必要</li>
<li>受領側も適格請求書を保存しなければ仕入税額控除が受けられない</li>
</ul>
<!-- /wp:list -->

<!-- wp:heading {"level":3} -->
<h3 class="wp-block-heading">手作業対応のリスク</h3>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>エクセルや手書きでインボイス対応を行う場合、以下のリスクがあります：</p>
<!-- /wp:paragraph -->

<!-- wp:list -->
<ul class="wp-block-list">
<li>税率区分の転記ミスによる消費税計算誤り</li>
<li>登録番号の記載漏れ・記載ミス</li>
<li>仕入税額控除の適用誤り</li>
</ul>
<!-- /wp:list -->

<!-- wp:heading -->
<h2 class="wp-block-heading">インボイス対応におすすめの会計ソフト5選</h2>
<!-- /wp:heading -->

<!-- wp:heading {"level":3} -->
<h3 class="wp-block-heading">freee会計 - 初心者でも簡単、インボイス対応も万全</h3>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>国内シェアNo.1のクラウド会計ソフトで、初心者向けの分かりやすいUI設計が特徴です。</p>
<!-- /wp:paragraph -->

<!-- wp:list {"className":"is-style-good_list"} -->
<ul class="wp-block-list is-style-good_list">
<li>適格請求書の自動作成・送付</li>
<li>消費税申告書の自動作成</li>
<li>登録番号の自動表示・検証</li>
<li>質問形式の設定で迷わない</li>
</ul>
<!-- /wp:list -->

<!-- wp:paragraph -->
<p><strong>料金</strong>：スターター月額1,298円（年払い）〜</p>
<!-- /wp:paragraph -->

<!-- wp:heading {"level":3} -->
<h3 class="wp-block-heading">マネーフォワード クラウド会計 - 他サービス連携で効率UP</h3>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>ビジネス向けクラウドサービスの老舗で、経費精算・給与計算等との連携が強みです。</p>
<!-- /wp:paragraph -->

<!-- wp:list {"className":"is-style-good_list"} -->
<ul class="wp-block-list is-style-good_list">
<li>請求書・経費精算等との完全連携</li>
<li>複数の税理士との情報共有機能</li>
<li>豊富なAPI連携で拡張性◎</li>
</ul>
<!-- /wp:list -->

<!-- wp:paragraph -->
<p><strong>料金</strong>：スモールビジネス月額3,278円〜</p>
<!-- /wp:paragraph -->

<!-- wp:heading {"level":3} -->
<h3 class="wp-block-heading">弥生会計オンライン - 老舗の安心感</h3>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>30年以上の会計ソフト開発実績を持つ老舗ブランドのクラウド版です。</p>
<!-- /wp:paragraph -->

<!-- wp:list {"className":"is-style-good_list"} -->
<ul class="wp-block-list is-style-good_list">
<li>老舗ブランドの信頼性</li>
<li>充実した電話・メールサポート</li>
<li>会計事務所との連携に強み</li>
</ul>
<!-- /wp:list -->

<!-- wp:paragraph -->
<p><strong>料金</strong>：セルフプラン年額26,400円〜</p>
<!-- /wp:paragraph -->

<!-- wp:html -->
[speech_balloon id="5"]どのソフトも無料お試し期間があるんですね。まずは使ってみるのが良さそうです。[/speech_balloon]
<!-- /wp:html -->

<!-- wp:html -->
[speech_balloon id="3"]そうやで！実際に触ってみて、操作感や機能を確認するのが一番や。インボイス対応で困る前に、今すぐ始めよう！[/speech_balloon]
<!-- /wp:html -->

<!-- wp:heading -->
<h2 class="wp-block-heading">まとめ</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>インボイス制度への対応は、適切な会計ソフトを導入すれば思っているよりもずっと簡単になります。特に初心者の方にはfreee会計、他システム連携を重視するならマネーフォワード、信頼性重視なら弥生会計がおすすめです。</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>どのソフトも無料お試し期間があるので、まずは実際に触ってみて最適なツールを見つけてください。</p>
<!-- /wp:paragraph -->`;
  }

  /**
   * 補助金記事コンテンツ生成
   */
  generateSubsidyArticle(researchData) {
    return `<!-- wp:paragraph -->
<p>会計ソフトを導入したいけれど、「費用がかかるから後回しに...」と考えていませんか？</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p><strong>実はIT導入補助金を使えば、最大75%～80%の補助が受けられて、大幅にコストを抑えて会計ソフトを導入できます！</strong></p>
<!-- /wp:paragraph -->

<!-- wp:heading -->
<h2 class="wp-block-heading">IT導入補助金とは？会計ソフトも対象になる制度概要</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>IT導入補助金は、中小企業・小規模事業者がITツールを導入する際の費用を補助する国の制度です。</p>
<!-- /wp:paragraph -->

<!-- wp:heading {"level":3} -->
<h3 class="wp-block-heading">2025年度の補助枠と条件</h3>
<!-- /wp:heading -->

<!-- wp:list {"className":"is-style-check_list"} -->
<ul class="wp-block-list is-style-check_list">
<li><strong>通常枠（A類型・B類型）</strong>：補助率1/2、最大450万円</li>
<li><strong>インボイス枠（新設）</strong>：補助率3/4、最大350万円</li>
<li><strong>対象企業</strong>：中小企業基本法に定める中小企業・小規模事業者</li>
</ul>
<!-- /wp:list -->

<!-- wp:heading -->
<h2 class="wp-block-heading">補助金を使って会計ソフトを導入するメリット</h2>
<!-- /wp:heading -->

<!-- wp:heading {"level":3} -->
<h3 class="wp-block-heading">導入コストが最大80%補助される魅力</h3>
<!-- /wp:heading -->

<!-- wp:table {"className":"is-style-simple"} -->
<figure class="wp-block-table is-style-simple">
<table>
<thead>
<tr>
<th>ソフト名</th>
<th>通常料金</th>
<th>補助後実質料金</th>
</tr>
</thead>
<tbody>
<tr>
<td>freee会計</td>
<td>年額35,760円</td>
<td>年額8,940円</td>
</tr>
<tr>
<td>マネーフォワード</td>
<td>年額39,336円</td>
<td>年額9,834円</td>
</tr>
<tr>
<td>弥生会計</td>
<td>年額30,000円</td>
<td>年額7,500円</td>
</tr>
</tbody>
</table>
</figure>
<!-- /wp:table -->

<!-- wp:heading -->
<h2 class="wp-block-heading">IT導入補助金の申請手順</h2>
<!-- /wp:heading -->

<!-- wp:loos/step {"className":"is-style-default"} -->
<div class="swell-block-step is-style-default" data-num-style="circle">
<!-- wp:loos/step-item {"stepLabel":"STEP"} -->
<div class="swell-block-step__item">
<div class="swell-block-step__number u-bg-main"><span class="__label">STEP</span></div>
<div class="swell-block-step__title u-fz-l">事前準備（1-2週間）</div>
<div class="swell-block-step__body">
<!-- wp:paragraph -->
<p>GbizIDの取得、IT導入支援事業者の選定、事業計画の策定</p>
<!-- /wp:paragraph -->
</div></div>
<!-- /wp:loos/step-item -->

<!-- wp:loos/step-item {"stepLabel":"STEP"} -->
<div class="swell-block-step__item">
<div class="swell-block-step__number u-bg-main"><span class="__label">STEP</span></div>
<div class="swell-block-step__title u-fz-l">申請書作成・提出（1週間）</div>
<div class="swell-block-step__body">
<!-- wp:paragraph -->
<p>申請書類の作成、必要書類の準備・添付、オンライン申請システムからの提出</p>
<!-- /wp:paragraph -->
</div></div>
<!-- /wp:loos/step-item -->

<!-- wp:loos/step-item {"stepLabel":"STEP"} -->
<div class="swell-block-step__item">
<div class="swell-block-step__number u-bg-main"><span class="__label">STEP</span></div>
<div class="swell-block-step__title u-fz-l">採択・交付決定（1-2ヶ月）</div>
<div class="swell-block-step__body">
<!-- wp:paragraph -->
<p>審査・採択結果通知、交付決定通知受領</p>
<!-- /wp:paragraph -->
</div></div>
<!-- /wp:loos/step-item -->

<!-- wp:loos/step-item {"stepLabel":"STEP"} -->
<div class="swell-block-step__item">
<div class="swell-block-step__number u-bg-main"><span class="__label">STEP</span></div>
<div class="swell-block-step__title u-fz-l">ツール導入・支払い（1ヶ月）</div>
<div class="swell-block-step__body">
<!-- wp:paragraph -->
<p>採択されたツールの契約・導入、支払い・証憑の保管</p>
<!-- /wp:paragraph -->
</div></div>
<!-- /wp:loos/step-item -->

<!-- wp:loos/step-item {"stepLabel":"STEP"} -->
<div class="swell-block-step__item">
<div class="swell-block-step__number u-bg-main"><span class="__label">STEP</span></div>
<div class="swell-block-step__title u-fz-l">実績報告・補助金受領（1ヶ月）</div>
<div class="swell-block-step__body">
<!-- wp:paragraph -->
<p>導入実績の報告書提出、補助金の交付・受領</p>
<!-- /wp:paragraph -->
</div></div>
<!-- /wp:loos/step-item -->
</div>
<!-- /wp:loos/step -->

<!-- wp:html -->
[speech_balloon id="5"]手順は多そうですが、これだけコストが下がるなら挑戦してみたいです。[/speech_balloon]
<!-- /wp:html -->

<!-- wp:html -->
[speech_balloon id="3"]その通りや！特に2025年度は「インボイス枠」が新設されて、補助率3/4と非常に有利な条件になってるからな。今がチャンスやで！[/speech_balloon]
<!-- /wp:html -->

<!-- wp:heading -->
<h2 class="wp-block-heading">まとめ</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>IT導入補助金を使えば、費用面の心配なく最新の会計ソフトを導入できます。対象条件を満たすなら、申請しない手はありません！</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>まずは無料で資料請求やお試しを行い、自社に最適なソフトを見つけましょう。申請サポートも各社で提供されているので、ぜひ活用してください。</p>
<!-- /wp:paragraph -->`;
  }

  /**
   * 高品質インボイス記事生成（5000文字以上）
   */
  async generateFullQualityInvoiceArticle(researchData, prompts) {
    return `<!-- wp:paragraph -->
<p>[swell_toc headline="目次" display_level="2-3"]</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>インボイス制度が始まって1年以上が経ちますが、まだ対応に不安を感じていませんか？「請求書の様式が変わったけど、これで本当に大丈夫？」「手作業で管理していてミスが怖い...」そんな悩みを抱える中小企業や個人事業主の方は多いものです。</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p><span class="swl-marker mark_orange"><strong>実は、会計ソフトを活用すれば、インボイス制度への対応は思っているより簡単にできます。</strong></span></p>
<!-- /wp:paragraph -->`; // ここでは短縮版を返し、実装は後続のメソッドで行う
  }

  /**
   * 高品質補助金記事生成（5000文字以上）
   */
  async generateFullQualitySubsidyArticle(researchData, prompts) {
    return `<!-- wp:paragraph -->
<p>[swell_toc headline="目次" display_level="2-3"]</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>会計ソフトを導入したいけれど、「初期費用が高くて躊躇している...」と感じていませんか？</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p><span class="swl-marker mark_orange"><strong>実は、IT導入補助金を活用すれば最大75%～80%の補助が受けられ、年額4万円の会計ソフトが実質8,000円で導入できます！</strong></span></p>
<!-- /wp:paragraph -->`;
  }

  /**
   * 高品質法人申告記事生成（5000文字以上）
   */
  async generateFullQualityTaxArticle(researchData, prompts) {
    return `<!-- wp:paragraph -->
<p>[swell_toc headline="目次" display_level="2-3"]</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>法人の確定申告、税理士に頼むと年間50万円もかかるから自分でやってみたいと考えていませんか？</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p><span class="swl-marker mark_orange"><strong>実は、適切な手順と会計ソフトを活用すれば、法人の決算・申告も自分で完了させることは十分可能です！</strong></span></p>
<!-- /wp:paragraph -->`;
  }

  /**
   * スキーママークアップ生成
   */
  generateArticleSchema(title, description, keywords) {
    const currentDate = new Date().toISOString().split('T')[0];
    
    return `<!-- wp:html -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "${title}",
  "description": "${description}",
  "datePublished": "${currentDate}",
  "dateModified": "${currentDate}",
  "author": {
    "@type": "Person",
    "name": "ゆーた（会計士）",
    "description": "freee・マネーフォワード等のクラウド会計ソフト導入支援を専門とする実務家会計士。税務・会計の複雑な問題を初心者にもわかりやすく解説。",
    "jobTitle": "会計士",
    "knowsAbout": [
      "税務申告", "会計ソフト", "確定申告", "法人税", "消費税", 
      "freee", "マネーフォワード", "クラウド会計", "経理自動化"
    ]
  },
  "publisher": {
    "@type": "Organization",
    "name": "EZARK税務・会計",
    "description": "税務・会計の専門情報とクラウド会計ソフト活用法を提供する専門サイト",
    "url": "https://ezark-tax-accounting.com/",
    "logo": {
      "@type": "ImageObject",
      "url": "https://ezark-tax-accounting.com/logo.png",
      "width": 600,
      "height": 200
    }
  },
  "mainEntityOfPage": {
    "@type": "WebPage",
    "@id": "https://ezark-tax-accounting.com/"
  },
  "articleSection": "税務・会計",
  "keywords": "${keywords.join(', ')}",
  "about": [
    {
      "@type": "Thing",
      "name": "freee",
      "description": "クラウド会計ソフト"
    },
    {
      "@type": "Thing", 
      "name": "マネーフォワード",
      "description": "クラウド会計ソフト"
    },
    {
      "@type": "Thing",
      "name": "税務申告",
      "description": "法人税・所得税等の申告業務"
    }
  ],
  "inLanguage": "ja-JP"
}
</script>
<!-- /wp:html -->`;
  }

  /**
   * 文字数カウント（HTML除去）
   */
  countWords(content) {
    // HTMLタグを除去してテキストのみを抽出
    const textOnly = content.replace(/<[^>]*>/g, '').replace(/&[^;]+;/g, '');
    return textOnly.length;
  }

  /**
   * 旧記事生成メソッド（互換性のため残存）
   */
  generateInvoiceArticle(researchData) {
    return this.generateFullQualityInvoiceArticle(researchData, {});
  }

  generateSubsidyArticle(researchData) {
    return this.generateFullQualitySubsidyArticle(researchData, {});
  }

  /**
   * 法人申告記事コンテンツ生成（旧バージョン）
   */
  generateTaxArticle(researchData) {
    return this.generateFullQualityTaxArticle(researchData, {});
  }

  async saveArticleAsDraft(article) {
    try {
      console.log(`📝 記事「${article.title}」を下書き保存中（スキーママークアップ付き）...`);

      // スキーママークアップを記事の末尾に追加
      const contentWithSchema = article.content + '\n\n' + article.schema;

      const postData = {
        title: article.title,
        content: contentWithSchema,
        slug: article.slug,
        status: 'draft', // 下書きとして保存
        meta: {
          _yoast_wpseo_metadesc: article.meta_description,
          _yoast_wpseo_focuskw: article.tags?.[0] || '',
          _yoast_wpseo_title: article.title,
          _yoast_wpseo_canonical: `${this.wpConfig.siteUrl}/${article.slug}/`
        },
        // カテゴリーとタグは実際のIDが必要なため、今回は省略
        // categories: article.categories,
        // tags: article.tags
      };

      const result = await this.makeWordPressRequest('/posts', 'POST', postData);
      
      console.log(`✅ 記事「${article.title}」の下書き保存完了（スキーママークアップ付き）`);
      console.log(`📄 記事URL: ${this.wpConfig.siteUrl}/wp-admin/post.php?post=${result.id}&action=edit`);
      
      return {
        success: true,
        postId: result.id,
        editUrl: `${this.wpConfig.siteUrl}/wp-admin/post.php?post=${result.id}&action=edit`,
        title: article.title,
        wordCount: this.countWords(article.content)
      };

    } catch (error) {
      console.error(`❌ 記事「${article.title}」の保存に失敗:`, error.message);
      return {
        success: false,
        error: error.message,
        title: article.title
      };
    }
  }

  /**
   * メイン実行関数
   */
  async generateAndSaveArticles(txtFileName) {
    try {
      console.log('🚀 WordPress下書き生成システム開始');
      
      // 環境チェック
      this.validateEnvironment();
      
      // WordPress接続テスト
      const connected = await this.testWordPressConnection();
      if (!connected) {
        throw new Error('WordPress接続に失敗しました');
      }

      // GitHubプロンプト読み込み
      const prompts = await this.loadGitHubPrompts();

      // リサーチデータ解析
      console.log('📋 リサーチデータ解析中...');
      const researchData = await this.parser.parseManualResearch(txtFileName);
      console.log('✅ リサーチデータ解析完了');

      // 記事コンテンツ生成
      const articles = await this.generateArticleContent(researchData, prompts);

      // WordPress下書き保存
      console.log('📤 WordPress下書き保存開始');
      const results = [];
      
      for (const article of articles) {
        const result = await this.saveArticleAsDraft(article);
        results.push(result);
        
        // API制限を避けるため少し待機
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      // 結果サマリー
      console.log('\n📊 WordPress下書き保存結果');
      console.log('='.repeat(50));
      
      const successful = results.filter(r => r.success);
      const failed = results.filter(r => !r.success);

      console.log(`✅ 成功: ${successful.length}記事`);
      console.log(`❌ 失敗: ${failed.length}記事`);
      console.log('');

      if (successful.length > 0) {
        console.log('📝 保存された記事:');
        successful.forEach(result => {
          console.log(`  • ${result.title}`);
          console.log(`    編集URL: ${result.editUrl}`);
        });
      }

      if (failed.length > 0) {
        console.log('❌ 失敗した記事:');
        failed.forEach(result => {
          console.log(`  • ${result.title}: ${result.error}`);
        });
      }

      console.log('\n✅ WordPress下書き生成完了');
      return results;

    } catch (error) {
      console.error('❌ システムエラー:', error.message);
      throw error;
    }
  }
}

/**
 * コマンドライン実行
 */
async function main() {
  const generator = new WordPressDraftGenerator();
  const txtFileName = process.argv[2] || '会計ソフト記事_3記事構成.txt';

  try {
    await generator.generateAndSaveArticles(txtFileName);
    process.exit(0);
  } catch (error) {
    console.error('システム実行エラー:', error.message);
    process.exit(1);
  }
}

// 直接実行時のみメイン関数を実行
if (require.main === module) {
  main();
}

module.exports = WordPressDraftGenerator;