# セットアップガイド

## 🚀 新システム（Claude Code連携）- 推奨

### 前提条件
- Node.js 18以上
- npm または yarn

### インストール手順

```bash
# 1. リポジトリクローン
git clone https://github.com/Ezark213/blog-prompt.git
cd blog-prompt

# 2. 依存関係インストール
npm install

# 3. サンプルファイル作成
npm run claude-sample

# 4. テスト実行
npm run claude sample_freee_research.txt
```

### 使用方法

1. **手動リサーチ実施** - 好きな方法でキーワードを調査
2. **txtファイル作成** - `inputs/manual_research/your_topic.txt` に保存
3. **プロンプト生成** - `npm run claude your_topic.txt`
4. **Claude Codeで生成** - 生成されたプロンプトをClaude Codeに貼り付け

### 完了！

環境変数設定やAPI キー取得は一切不要です。

---

## 🔧 旧システム（OpenAI API使用）

### 必要な環境変数

```bash
# .env ファイルを作成
cp .env.example .env

# 以下を設定
OPENAI_API_KEY=sk-your-key-here
WORDPRESS_API_URL=https://your-site.com/wp-json/wp/v2
WORDPRESS_USERNAME=your_username
WORDPRESS_APP_PASSWORD=your_app_password
```

### WordPressアプリケーションパスワード作成

1. WordPress管理画面 → ユーザー → プロフィール
2. 「アプリケーションパスワード」で新規作成
3. 生成されたパスワードを環境変数に設定

### 使用方法

```bash
# 完全自動化
npm start

# 個別実行
npm run parse-research
npm run generate-content
npm run publish
```

---

## 📁 ディレクトリ構造

```
blog-prompt/
├── docs/
│   ├── prompts/           # プロンプトファイル
│   ├── SETUP.md          # このファイル
│   └── ...
├── src/
│   ├── claude_article_generator.js  # 新システム
│   ├── index.js                     # 旧システム
│   └── core/
├── inputs/
│   └── manual_research/   # 手動リサーチファイル
├── outputs/
│   └── claude_articles/   # Claude用出力
└── legacy/               # 旧ファイル
```

## 🆘 トラブルシューティング

### 新システム

```bash
# ファイルが見つからない
npm run claude-list

# サンプル作成
npm run claude-sample

# プロンプト確認
cat outputs/claude_articles/your_file_claude_prompt.md
```

### 旧システム

```bash
# 接続テスト
npm run test-connection

# 詳細ログ
DEBUG=true npm start
```