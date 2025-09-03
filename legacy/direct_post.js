const axios = require('axios');
require('dotenv').config();

// WordPress設定
const WORDPRESS_API_URL = process.env.WORDPRESS_API_URL;
const WORDPRESS_USERNAME = process.env.WORDPRESS_USERNAME;
const WORDPRESS_APP_PASSWORD = process.env.WORDPRESS_APP_PASSWORD;

const authHeader = {
  'Authorization': `Basic ${Buffer.from(`${WORDPRESS_USERNAME}:${WORDPRESS_APP_PASSWORD}`).toString('base64')}`,
  'Content-Type': 'application/json'
};

// 記事データ
const articles = [
  {
    title: "インボイス制度対応におすすめの会計ソフト厳選3選｜失敗しない選び方と活用ポイント",
    content: `<p>インボイス制度が始まり、中小企業や個人事業主にも対応が求められるようになりました。「請求書の様式が変わって対応に困っている」「経理負担が増えて困惑している」と感じていませんか？実は、会計ソフトを活用すれば、これらの課題は効率的に解決できます。</p>

<p>本記事では、インボイス制度の概要から対応方法、そして制度に対応したおすすめの会計ソフトまで分かりやすく解説します。</p>

<h2>インボイス制度対応の課題とは</h2>

<h3>インボイス制度の基本と中小事業者への影響</h3>

<p>インボイス制度（適格請求書等保存方式）は、2023年10月から開始された新しい消費税の仕組みです。これまでの請求書では記載が不要だった「適格請求書発行事業者の登録番号」や「適用税率」「消費税額」の明記が必要になりました。</p>

<p>中小事業者への影響は大きく、これまで免税事業者だった方も取引先との関係で課税事業者になるケースが増えています。つまり、今まで以上に正確な消費税管理が求められるようになったのです。</p>

<h3>請求書発行・消費税申告で発生する新たな業務負担</h3>

<p>インボイス制度により、以下のような新たな業務が発生します：</p>

<ul>
<li><strong>請求書様式の確認・修正</strong>: 適格請求書の記載要件を満たしているかチェック</li>
<li><strong>区分経理の徹底</strong>: 複数税率（10%・8%・免税）の正確な管理</li>
<li><strong>消費税申告書の複雑化</strong>: 仕入税額控除の計算項目が増加</li>
</ul>

<p>これらの業務は手作業で行うと時間がかかり、ミスも起こりやすくなります。</p>

<h3>手作業対応のリスク（入力ミス・管理漏れなど）</h3>

<p>エクセルや手書きでインボイス制度に対応しようとすると、以下のリスクがあります：</p>

<ul>
<li><strong>税率区分の転記ミス</strong>: 8%と10%の混同による課税額誤り</li>
<li><strong>適格請求書の要件不備</strong>: 必須項目の記載漏れ</li>
<li><strong>消費税申告の計算ミス</strong>: 複雑な計算による追徴税の可能性</li>
</ul>

<p>実際、国税庁の調査では手作業による申告ミスが年々増加しており、会計ソフトの活用が推奨されています。</p>

<h2>インボイス対応に会計ソフトを使うメリット</h2>

<h3>請求書発行から記帳まで一元管理（ミス削減）</h3>

<p>会計ソフトを使えば、インボイス発行機能で適格請求書を作成し、そのデータが自動的に帳簿に反映されます。例えば、freee会計では請求書発行画面で適格項目が自動チェックされ、発行と同時に売上データが会計帳簿に記録されます。</p>

<p>これにより、二重入力によるミスを防ぎ、作業効率も大幅に向上します。</p>

<h3>消費税区分の自動処理と申告書作成の効率化</h3>

<p>クラウド会計ソフトなら、複数税率（課税10%・軽減税率8%・免税）を自動判定し、正確に集計してくれます。年末には、ボタン一つで消費税申告書を作成可能。手作業なら数日かかる作業が、わずか数分で完了します。</p>

<h3>サポート・アップデートによる法令対応の安心感</h3>

<p>クラウド会計ソフトは、法改正に自動でアップデート対応します。インボイス制度だけでなく、電子帳簿保存法など他の制度変更にも常に最新の状態で対応できます。また、操作サポートやチャット相談があるソフトも多く、初心者でも安心して利用できます。</p>

<h2>インボイス対応会計ソフト選びのポイント</h2>

<h3>発行書類の要件対応（適格請求書の項目網羅）</h3>

<p>選ぶべき会計ソフトは、インボイス発行機能を持ち、以下の項目を確実に網羅しているものです：</p>

<ul>
<li>適格請求書発行事業者の登録番号</li>
<li>適用税率と消費税額の明記</li>
<li>取引内容の詳細記載</li>
<li>発行日と発行事業者情報</li>
</ul>

<p>freeeやマネーフォワードは完全対応済みですが、古いソフトは要確認です。</p>

<h3>消費税申告機能と電子申告連携</h3>

<p>年次の消費税確定申告書を作成でき、e-Tax連携で電子申告できるソフトを選びましょう。これがあるかないかで、年末の作業効率が大きく変わります。</p>

<h3>料金プランとサポート体制の比較</h3>

<p>コストも重要な選定ポイントです。主要ソフトの基本プランは月額1,000円～3,000円程度。無料プランもありますが、インボイス機能は有料プランに含まれることが多いので注意が必要です。</p>

<p>また、操作に不安がある場合は、電話・チャットサポートが充実しているソフトを選ぶのがおすすめです。</p>

<h2>インボイス制度対応におすすめの会計ソフト3選</h2>

<h3>freee会計 – 初心者でも簡単、インボイス対応も万全</h3>

<p><strong>概要</strong>: 国内シェアNo.1クラスのクラウド会計ソフト<br>
<strong>料金</strong>: 月額2,680円～（年払いで割引あり）<br>
<strong>特徴</strong>:</p>

<ul>
<li>適格請求書の自動作成機能</li>
<li>消費税申告書の自動生成</li>
<li>直感的な操作画面で初心者にも優しい</li>
<li>充実したサポート体制（チャット・電話対応）</li>
</ul>

<p>freee会計は特に初心者におすすめです。画面の指示に従って入力するだけで、適格請求書の作成から消費税申告まで完結できます。</p>

<h3>マネーフォワード クラウド会計 – 他サービス連携◎で効率UP</h3>

<p><strong>概要</strong>: 中小企業で高い人気を誇るクラウド会計ソフト<br>
<strong>料金</strong>: 月額2,980円～（年払いで割引あり）<br>
<strong>特徴</strong>:</p>

<ul>
<li>インボイス対応の請求書発行機能</li>
<li>経費精算や請求書管理との連携</li>
<li>銀行・クレジットカードとの自動連携が豊富</li>
<li>税理士との共有機能が充実</li>
</ul>

<p>すでに経費精算システムなどを使っている企業なら、マネーフォワードの一元管理がおすすめです。</p>

<h3>弥生会計オンライン – 老舗の安心感とインボイス機能</h3>

<p><strong>概要</strong>: 創業45年の老舗会計ソフトメーカーのクラウド版<br>
<strong>料金</strong>: 月額2,160円～（初年度半額キャンペーンあり）<br>
<strong>特徴</strong>:</p>

<ul>
<li>伝統的な操作性で経験者にも馴染みやすい</li>
<li>インボイス制度アップデート対応済み</li>
<li>会計事務所との連携に強み</li>
<li>充実したサポート体制</li>
</ul>

<p>弥生会計は、これまで弥生シリーズを使っていた方や、会計事務所と連携したい場合におすすめです。</p>

<h2>まとめ</h2>

<p>インボイス制度への対応は、早めの準備が何より重要です。会計ソフトを活用することで、複雑な制度対応も簡単に、かつ正確に行うことができます。</p>

<p>本記事で紹介したソフトは、いずれもインボイス制度に完全対応しており、どれを選んでも安心です。まずは無料体験から始めて、あなたの事業に最適なソフトを見つけてみましょう。</p>

<p><strong>今なら各ソフトとも無料体験期間中！この機会にぜひお試しください。</strong></p>`,
    slug: "invoice-kaikeisoft-osusume",
    excerpt: "インボイス制度に対応できるおすすめ会計ソフトを比較解説。対応が必要な理由からソフト選びのポイント、freeeやマネーフォワードなど厳選3製品の特徴を紹介します。",
    categories: ["税務・会計", "クラウド会計"],
    tags: ["インボイス制度", "会計ソフト", "freee", "マネーフォワード", "弥生会計"]
  },
  {
    title: "【2025年版】IT導入補助金でお得に会計ソフト導入！対象条件から申請手順・おすすめツールまで解説",
    content: `<p>会計ソフトを導入したいけれど費用が気になる…と悩んでいませんか？実は、<strong>IT導入補助金を使えば最大75%～80%の補助</strong>を受けることができます！</p>

<p>2025年現在の最新制度を活用すれば、高額な会計ソフトも実質的に大幅な費用削減で導入可能。本記事では、補助金の概要から申請方法、どんなソフトが対象かまで分かりやすく解説します。</p>

<h2>IT導入補助金とは？会計ソフトも対象になる制度概要</h2>

<h3>補助金の目的と概要（中小企業のDX支援）</h3>

<p>IT導入補助金は、中小企業のITツール導入を支援する経済産業省の制度です。「業務効率化・売上向上」を目的として、DX推進の一環で設立されました。</p>

<p><strong>基本的な補助内容</strong>：</p>
<ul>
<li>補助率：1/2～3/4（枠によって異なる）</li>
<li>補助上限額：最大450万円</li>
<li>対象：中小企業・小規模事業者</li>
</ul>

<h3>会計ソフトが補助対象に含まれる理由</h3>

<p>会計ソフトは「業務効率化ツール」として正式に補助対象になっています。特に以下の理由で国が推奨しています：</p>

<ul>
<li><strong>経理のデジタル化推進</strong>：手作業からの脱却</li>
<li><strong>インボイス制度対応支援</strong>：2023年開始の制度に対応</li>
<li><strong>生産性向上</strong>：経理業務の時間短縮と正確性向上</li>
<li><strong>税務申告の電子化促進</strong>：e-Tax利用拡大への貢献</li>
</ul>

<h3>2025年度の補助枠と条件（インボイス枠など最新情報）</h3>

<p>2025年度は以下の枠が設定されています：</p>

<table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
<thead>
<tr style="background-color: #f5f5f5;">
<th style="border: 1px solid #ddd; padding: 10px;">補助枠</th>
<th style="border: 1px solid #ddd; padding: 10px;">補助率</th>
<th style="border: 1px solid #ddd; padding: 10px;">上限額</th>
<th style="border: 1px solid #ddd; padding: 10px;">主な特徴</th>
</tr>
</thead>
<tbody>
<tr>
<td style="border: 1px solid #ddd; padding: 10px;">通常枠</td>
<td style="border: 1px solid #ddd; padding: 10px;">1/2以内</td>
<td style="border: 1px solid #ddd; padding: 10px;">150万円</td>
<td style="border: 1px solid #ddd; padding: 10px;">基本的な枠</td>
</tr>
<tr>
<td style="border: 1px solid #ddd; padding: 10px;">インボイス対応類型</td>
<td style="border: 1px solid #ddd; padding: 10px;">3/4以内</td>
<td style="border: 1px solid #ddd; padding: 10px;">350万円</td>
<td style="border: 1px solid #ddd; padding: 10px;">インボイス制度対応を重視</td>
</tr>
<tr>
<td style="border: 1px solid #ddd; padding: 10px;">セキュリティ対策推進枠</td>
<td style="border: 1px solid #ddd; padding: 10px;">1/2以内</td>
<td style="border: 1px solid #ddd; padding: 10px;">100万円</td>
<td style="border: 1px solid #ddd; padding: 10px;">セキュリティ機能重視</td>
</tr>
</tbody>
</table>

<p><strong>対象事業者の条件</strong>：</p>
<ul>
<li>中小企業基本法に定める中小企業者</li>
<li>資本金または従業員数が一定基準以下</li>
<li>税務申告を2期以上行っている</li>
</ul>

<h2>補助金を使って会計ソフトを導入するメリット</h2>

<h3>導入コストが最大80%補助される魅力</h3>

<p>最大の魅力は、やはり費用削減効果です。</p>

<p><strong>具体例</strong>：</p>
<ul>
<li>通常価格20万円の会計ソフト → インボイス対応枠利用で<strong>実質5万円</strong></li>
<li>年間利用料10万円のクラウド会計 → 通常枠でも<strong>実質5万円</strong></li>
</ul>

<p>この費用削減により、予算の都合で導入を諦めていた高機能ソフトも手の届く価格になります。</p>

<h2>まとめ</h2>

<p>IT導入補助金を使えば、費用面の心配なく最新の会計ソフトを導入できます。特に2025年度はインボイス対応枠で3/4補助が受けられるため、対象条件を満たすなら申請しない手はありません。</p>

<p><strong>今すぐ始められること</strong>：</p>
<ol>
<li>自社が対象条件を満たすか確認</li>
<li>導入したいソフトの支援事業者に相談</li>
<li>GビズIDの取得申請</li>
<li>次回公募開始に向けて準備</li>
</ol>

<p>まずは各ソフトの公式サイトで補助金案内を確認し、無料相談を活用してみてください。</p>`,
    slug: "it-hojo-kaikeisoft",
    excerpt: "IT導入補助金を活用して会計ソフトをお得に導入する方法を解説。2025年度の補助内容や対象条件、申請ステップ、対象となる会計ソフト（freee・マネーフォワードなど）と選び方のポイントを紹介します。",
    categories: ["税務・会計", "IT導入補助金"],
    tags: ["IT導入補助金", "会計ソフト", "freee", "マネーフォワード", "補助金"]
  },
  {
    title: "法人の確定申告は自分でできる！初めてでも失敗しない決算・申告の全手順【完全ガイド】",
    content: `<p>法人の確定申告を自分でやってみようと考えていませんか？「税理士に頼むと費用がかかるし、自分でできるならやってみたい」という気持ち、よく分かります。</p>

<p>実は、ポイントを押さえれば自力で申告は可能です！ただし、いくつかの注意点もありますが、本記事でわかりやすく解説していきます。手順・注意点・便利ツールまで網羅的にご紹介しますので、ぜひ最後まで読んでみてください。</p>

<h2>目次</h2>
<ol>
<li><a href="#基礎知識">法人の確定申告を自分で行うための基礎知識</a></li>
<li><a href="#具体的手順">法人決算・確定申告を自分でやる具体的手順</a></li>
<li><a href="#注意点">自力でやる際に気を付けたいポイントとリスク</a></li>
<li><a href="#便利ツール">決算・申告を楽にするための便利ツール活用</a></li>
<li><a href="#まとめ">まとめ</a></li>
</ol>

<h2 id="基礎知識">法人の確定申告を自分で行うための基礎知識</h2>

<h3>法人決算と確定申告の流れをおさらい</h3>

<p>法人の決算・申告は以下の流れで進みます：</p>

<pre><code>決算日 → 決算作業（2ヶ月以内） → 申告書作成 → 申告・納税 → 完了</code></pre>

<p><strong>重要なポイント</strong>：</p>
<ul>
<li>決算日から2ヶ月以内が申告期限（3月決算なら5月31日まで）</li>
<li>決算作業と申告書作成という2つのステップがある</li>
<li>申告書提出と税金納付をもって完了</li>
</ul>

<p>何をもって「完了」となるかを明確にしておくことで、作業の見通しが立てやすくなります。</p>

<h3>自分で行う場合に必要なもの（知識・ツール・時間）</h3>

<p>自力申告に必要な準備は以下の通りです：</p>

<p><strong>✅ 必要な知識</strong></p>
<ul>
<li>簿記3級レベルの基礎知識</li>
<li>法人税の基本的な仕組み</li>
<li>決算書（貸借対照表・損益計算書）の読み方</li>
</ul>

<p><strong>✅ 必要なツール</strong></p>
<ul>
<li>パソコン（Windows/Mac問わず）</li>
<li>プリンター（申告書印刷用）</li>
<li>電卓または表計算ソフト</li>
<li>会計ソフト（推奨）</li>
</ul>

<p><strong>✅ 必要な時間</strong></p>
<ul>
<li>初回：約5-7日程度（準備込み）</li>
<li>2回目以降：約3-5日程度</li>
</ul>

<p>これらが揃えば、自分でも申告は十分可能です。</p>

<h3>税理士に依頼する場合との違い・メリット比較</h3>

<table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
<thead>
<tr style="background-color: #f5f5f5;">
<th style="border: 1px solid #ddd; padding: 10px;">項目</th>
<th style="border: 1px solid #ddd; padding: 10px;">自分で申告</th>
<th style="border: 1px solid #ddd; padding: 10px;">税理士依頼</th>
</tr>
</thead>
<tbody>
<tr>
<td style="border: 1px solid #ddd; padding: 10px;"><strong>費用</strong></td>
<td style="border: 1px solid #ddd; padding: 10px;">無料～数万円（ソフト代）</td>
<td style="border: 1px solid #ddd; padding: 10px;">20～50万円</td>
</tr>
<tr>
<td style="border: 1px solid #ddd; padding: 10px;"><strong>時間</strong></td>
<td style="border: 1px solid #ddd; padding: 10px;">5-7日</td>
<td style="border: 1px solid #ddd; padding: 10px;">1-2日（打ち合わせのみ）</td>
</tr>
<tr>
<td style="border: 1px solid #ddd; padding: 10px;"><strong>正確性</strong></td>
<td style="border: 1px solid #ddd; padding: 10px;">△（初心者はミスリスク）</td>
<td style="border: 1px solid #ddd; padding: 10px;">◎（専門家対応）</td>
</tr>
<tr>
<td style="border: 1px solid #ddd; padding: 10px;"><strong>学習効果</strong></td>
<td style="border: 1px solid #ddd; padding: 10px;">◎（数字を理解できる）</td>
<td style="border: 1px solid #ddd; padding: 10px;">△（お任せ）</td>
</tr>
</tbody>
</table>

<p><strong>自分でやるメリット</strong>：</p>
<ul>
<li>大幅な費用節約（年間20-50万円削減）</li>
<li>経営数字への理解が深まる</li>
<li>申告スキルが身につく</li>
</ul>

<p>小規模法人であれば、コスト重視で自力申告にチャレンジする価値は十分にあります。</p>

<h2 id="まとめ">まとめ</h2>

<p>法人の確定申告も、自分で一つ一つ手順を踏めば必ずやり遂げられます。特に小規模法人であれば、コスト削減効果は絶大です。</p>

<p><strong>成功のポイント</strong>：<br>
✅ 余裕を持ったスケジュール管理<br>
✅ 会計ソフト等のツール活用<br>
✅ 分からない時は素直に相談<br>
✅ 完璧を求めすぎない</p>

<p>今回紹介した会計ソフト等もうまく活用して、ぜひ負担を減らしてください。<strong>freee会計なら決算書や申告書の自動作成機能があるので特におすすめです。</strong></p>

<p><strong>あなたのチャレンジを応援しています！</strong> まずは無料体験から始めて、自力申告の第一歩を踏み出してみましょう。</p>

<p><em>この記事は2025年現在の税制に基づいて作成しています。税制改正により内容が変更される場合がありますので、最新情報は国税庁サイト等でご確認ください。</em></p>`,
    slug: "jiriki-kessan",
    excerpt: "税理士に頼らず法人の決算・確定申告を自分で行う方法を徹底ガイド！必要な準備、具体的な手順、注意すべきポイントを初心者向けに解説します。会計ソフトなど便利な支援ツールの活用術も網羅し、初めてでも安心して法人申告に挑戦できます。",
    categories: ["税務・会計", "法人申告"],
    tags: ["法人確定申告", "自分で申告", "決算", "会計ソフト", "freee"]
  }
];

async function postToWordPress() {
  try {
    console.log('WordPress接続テスト...');
    
    // 接続テスト
    const testResponse = await axios.get(`${WORDPRESS_API_URL}/posts`, {
      params: { per_page: 1 },
      headers: authHeader
    });
    
    console.log('✅ WordPress接続成功');
    
    const results = [];
    
    for (const article of articles) {
      try {
        console.log(`記事投稿中: ${article.title}`);
        
        // カテゴリの確認・作成
        const categoryIds = [];
        for (const categoryName of article.categories) {
          try {
            const existingCategory = await axios.get(`${WORDPRESS_API_URL}/categories`, {
              params: { search: categoryName },
              headers: authHeader
            });
            
            if (existingCategory.data.length > 0) {
              categoryIds.push(existingCategory.data[0].id);
            } else {
              const newCategory = await axios.post(`${WORDPRESS_API_URL}/categories`, {
                name: categoryName,
                slug: categoryName.toLowerCase().replace(/[^a-z0-9]/g, '-')
              }, { headers: authHeader });
              categoryIds.push(newCategory.data.id);
            }
          } catch (err) {
            console.warn(`カテゴリ処理エラー: ${categoryName}`);
          }
        }
        
        // タグの確認・作成
        const tagIds = [];
        for (const tagName of article.tags) {
          try {
            const existingTag = await axios.get(`${WORDPRESS_API_URL}/tags`, {
              params: { search: tagName },
              headers: authHeader
            });
            
            if (existingTag.data.length > 0) {
              tagIds.push(existingTag.data[0].id);
            } else {
              const newTag = await axios.post(`${WORDPRESS_API_URL}/tags`, {
                name: tagName,
                slug: tagName.toLowerCase().replace(/[^a-z0-9]/g, '-')
              }, { headers: authHeader });
              tagIds.push(newTag.data.id);
            }
          } catch (err) {
            console.warn(`タグ処理エラー: ${tagName}`);
          }
        }
        
        // 記事を下書きとして投稿
        const postData = {
          title: article.title,
          content: article.content,
          slug: article.slug,
          status: 'draft',
          excerpt: article.excerpt,
          categories: categoryIds,
          tags: tagIds,
          author: 1
        };
        
        const response = await axios.post(`${WORDPRESS_API_URL}/posts`, postData, {
          headers: authHeader
        });
        
        console.log(`✅ 下書き保存完了: ${article.title} (ID: ${response.data.id})`);
        console.log(`   下書きURL: ${response.data.link}`);
        
        results.push({
          title: article.title,
          id: response.data.id,
          url: response.data.link,
          status: 'draft'
        });
        
        // API制限対策で待機
        await new Promise(resolve => setTimeout(resolve, 2000));
        
      } catch (error) {
        console.error(`❌ 記事投稿エラー: ${article.title}`);
        console.error(error.response?.data || error.message);
      }
    }
    
    console.log('\n🎉 全ての記事投稿完了！');
    console.log('下書きとして保存されました：');
    results.forEach(post => {
      console.log(`- ${post.title}: ${post.url}`);
    });
    
  } catch (error) {
    console.error('❌ WordPress接続エラー:', error.message);
    if (error.response) {
      console.error('エラーレスポンス:', error.response.data);
    }
  }
}

// 実行
postToWordPress();