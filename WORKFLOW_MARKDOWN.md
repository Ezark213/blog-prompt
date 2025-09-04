# 📝 キーワード分析からWordPress記事投稿までの完全ワークフロー

## 🎯 新しい一貫ワークフロー

キーワード分析結果から記事生成、WordPressアップロードまでを一貫して実行できるようになりました。

## 🚀 使用方法

### Step 1: キーワード分析ファイルの準備
デスクトップ等にキーワード分析結果ファイルを配置：
```
【キーワード分析結果】.txt
```

### Step 2: Claude Codeで記事生成
1. キーワード分析ファイルを読み込み
2. 分析結果を元に複数の記事を生成
3. `outputs/` フォルダに.mdファイルとして保存

### Step 3: WordPressへのアップロード

#### ローカル実行の場合：
```bash
# WordPress認証情報を.envファイルに設定
WORDPRESS_API_URL=https://your-site.com/wp-json/wp/v2
WORDPRESS_USERNAME=your_username
WORDPRESS_APP_PASSWORD=your_app_password

# Markdown記事を一括アップロード
npm run wordpress-upload-md
```

#### GitHub Actionsの場合：
1. GitHubのSecretsに以下を設定：
   - `WORDPRESS_API_URL`
   - `WORDPRESS_USERNAME` 
   - `WORDPRESS_APP_PASSWORD`

2. Actions → "WordPress Auto Post" → "Run workflow" で実行
   - Upload type: "md" を選択

または

1. Actions → "Complete Article Workflow" → "Run workflow" で実行
   - Workflow type: "markdown-to-wordpress-only" を選択

## 📋 機能一覧

### 自動化されること：
- ✅ Markdownファイルの自動検出
- ✅ HTMLへの変換
- ✅ WordPressメタデータの自動生成
  - タイトル抽出
  - スラッグ生成
  - カテゴリ自動分類
  - タグ自動付与
  - メタディスクリプション生成
- ✅ WordPressへの下書き投稿
- ✅ 結果レポート表示

### サポートしているファイル：
- `.md` (Markdown形式)
- `.json` (従来のJSON形式)

## 🛠️ トラブルシューティング

### WordPress認証エラーの場合：
1. WordPressでアプリケーションパスワードを生成
2. 正しいAPIエンドポイントを確認（通常: `https://your-site.com/wp-json/wp/v2`）
3. 環境変数が正しく設定されているか確認

### アップロード失敗の場合：
1. ネットワーク接続を確認
2. WordPress側の設定（REST API有効化）を確認
3. ファイル形式が正しいか確認

## 📊 実行結果の確認

アップロード完了後、以下の情報が表示されます：
- WordPress記事ID
- 下書きURL
- 投稿日時
- エラーがある場合の詳細

## 🔄 継続的な改善

このワークフローは継続的に改善されており、以下の機能が追加予定です：
- 画像の自動アップロード
- SEOスコアの自動チェック
- 複数サイトへの同時投稿
- 予約投稿機能

---

## 📞 サポート

問題が発生した場合は、GitHubのIssuesページでご報告ください：
https://github.com/Ezark213/blog-prompt/issues