# ChatGPT × Claude Code 記事自動化戦略

## 🎯 概要
ChatGPTのリサーチ力 × Claude Codeの自動化機能を組み合わせた、完全自動記事生成システム

---

## 🔄 自動化フロー

### Phase 1: ChatGPTでディープリサーチ
```
1. deep_research_prompt.md をChatGPTに投入
2. https://ezark-tax-accounting.com/ の既存記事調査
3. 5つのキーワード選定（重複回避）
4. 完全な記事構成を生成
5. Markdown形式で出力
```

### Phase 2: Claude Codeで自動化処理
```
1. ChatGPT出力をpending/フォルダに保存
2. npm start で全自動処理開始
3. 5記事をWordPress下書きに一括保存
4. SEO最適化・構造化データ自動追加
```

---

## 🚀 実装方法

### Step 1: ディープリサーチ実行
**ChatGPT Web版で実行（推奨）**
```bash
# 1. deep_research_prompt.md をコピー
# 2. ChatGPT-4にペーストして実行
# 3. 出力をMarkdownファイルとして保存
```

**Claude Code経由での実行（実験的）**
```bash
# プロンプトファイルからChatGPT実行（要API設定）
node src/utils/chatgpt_runner.js
```

### Step 2: 記事構成の保存
```bash
# ChatGPT出力をファイル保存
cp chatgpt_output.md inputs/research_results/pending/
```

### Step 3: 自動処理実行
```bash
cd blog-prompt

# 環境変数確認
cat .env

# 全自動実行
npm start

# または段階実行
npm run parse-research    # 解析
npm run generate-content  # 生成 
npm run publish          # 下書き保存
```

---

## 🛠️ 技術的拡張案

### 1. ChatGPT API統合
```javascript
// src/core/chatgpt_client.js（新規作成）
const openai = require('openai');

class ChatGPTClient {
  async generateResearch(prompt, siteUrl) {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: "SEOコンサルタントとして行動" },
        { role: "user", content: `${prompt}\n対象サイト: ${siteUrl}` }
      ],
      temperature: 0.3,
      max_tokens: 4000
    });
    
    return response.choices[0].message.content;
  }
}
```

### 2. 完全自動化スクリプト
```bash
#!/bin/bash
# auto_blog_generation.sh

echo "🚀 記事自動生成開始"

# ChatGPT API でリサーチ実行
node src/core/chatgpt_client.js

# 結果をpendingに移動
mv research_output.md inputs/research_results/pending/

# WordPress下書き生成
npm start

echo "✅ 5記事の下書き生成完了"
```

### 3. スケジュール実行
```javascript
// src/scheduler.js
const cron = require('node-cron');

// 毎週月曜 9:00 に実行
cron.schedule('0 9 * * 1', async () => {
  console.log('📅 週次記事生成開始');
  
  // ChatGPTリサーチ実行
  const research = await chatgptClient.generateResearch();
  
  // ファイル保存
  await fs.writeFile('inputs/research_results/pending/weekly_research.md', research);
  
  // 自動化実行
  await system.runFullAutomation();
  
  console.log('✅ 週次記事生成完了');
});
```

---

## 📊 期待効果

### 時間短縮
- **従来**: ChatGPTリサーチ（30分）+ 手動記事作成（3-4時間）= **4-5時間**
- **自動化後**: ChatGPTリサーチ（5分）+ 自動処理（5分）= **10分**
- **効率化**: **96%の時間短縮**

### 品質向上
- ✅ SEO最適化の自動適用
- ✅ 構造化データの自動生成
- ✅ WordPress最適化済みHTML
- ✅ モバイルファーストデザイン

### スケーラビリティ
- ✅ 週5記事の安定供給可能
- ✅ キーワード戦略の体系的実行
- ✅ 競合分析の継続的実施

---

## 🔧 設定・運用ガイド

### 初期設定
```bash
# 1. 環境変数設定
echo "OPENAI_API_KEY=sk-your-key" >> .env
echo "WORDPRESS_API_URL=https://ezark-tax-accounting.com/wp-json/wp/v2" >> .env
echo "WORDPRESS_USERNAME=your-username" >> .env
echo "WORDPRESS_APP_PASSWORD=your-password" >> .env

# 2. 依存関係インストール
npm install openai node-cron

# 3. テスト実行
npm run test-connection
```

### 日常運用
```bash
# 毎週の記事生成
./scripts/weekly_generation.sh

# 月次効果測定
node src/utils/seo_analytics.js

# 競合分析更新
node src/utils/competitor_analysis.js
```

### トラブルシューティング
```bash
# ログ確認
tail -f logs/system.log

# 下書き状況確認
ls -la outputs/published_posts/

# WordPress接続テスト
npm run test-connection
```

---

## 🎯 運用最適化Tips

### 1. キーワード戦略の継続改善
- 月次でキーワード調査を更新
- 競合分析結果を次回プロンプトに反映
- 検索順位データを基にキーワード調整

### 2. コンテンツ品質の向上
- 公開後のアクセス解析結果をフィードバック
- ユーザー行動データを基にCTA位置調整
- A/Bテスト結果を次回記事に活用

### 3. 自動化の段階的拡張
- Phase 1: 手動ChatGPT + 自動WordPress保存
- Phase 2: ChatGPT API統合
- Phase 3: スケジュール実行
- Phase 4: 効果測定・改善の自動化

---

## 📈 成功指標（KPI）

### 生産性指標
- 記事生成時間: 目標10分以内
- 週次記事数: 目標5記事
- エラー率: 5%以下

### SEO指標  
- 新規記事の3ヶ月後順位: 50位以内
- オーガニック流入増加: 月20%以上
- コンバージョン率: 2%以上

### 品質指標
- WordPress下書き成功率: 95%以上
- SEO要素実装率: 100%
- モバイル最適化スコア: 90点以上

---

この戦略により、ChatGPTの強力なリサーチ能力とClaude Codeの自動化機能を組み合わせて、高品質な記事を継続的に生成できるシステムが構築できます。