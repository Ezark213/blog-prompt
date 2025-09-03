# 手動リサーチ → Claude Code記事生成ワークフロー

## 概要

完全無料で高品質な記事を生成するシステムです：
1. **手動ディープリサーチ**実施 
2. **txtファイル**に保存
3. **Claude Code**でGitHub内プロンプトを使用して記事生成
4. **WordPress**に投稿

**特徴**：
- ✅ OpenAI API不要（完全無料）
- ✅ GitHub内プロンプト自動活用
- ✅ Claude Codeの高品質生成
- ✅ 図表・SEO・スキーマ全自動

## ワークフロー

### 1. 手動ディープリサーチ実施

自分でキーワードについて深く調査し、以下の情報を収集：

- 基本概要と特徴
- 具体的な使用方法
- よくある質問
- 競合他社の情報
- 実務での活用ポイント

### 2. リサーチ結果をtxtファイルに保存

```bash
# ディレクトリ作成
mkdir -p inputs/manual_research

# リサーチ結果をtxtファイルに保存
# 例: inputs/manual_research/freee_advanced_usage.txt
```

**ファイル内容の例：**
```txt
freee会計ソフトの高度な活用法について

■ 自動仕訳ルールの設定
- 銀行連携での自動振り分け
- 定期取引の自動化
- 仕訳辞書機能の活用

■ 効率的な経理業務
- 月次決算の自動化
- レポート作成の効率化
- 税務申告書の自動作成

■ 実務でのコツ
- 勘定科目の統一方法
- データバックアップの重要性
- ユーザー権限の適切な設定

目標文字数: 5500文字で実務重視
```

### 3. Claude Code用プロンプト生成

```bash
# 利用可能なファイル確認
npm run claude-list

# Claude用プロンプト生成
npm run claude freee_advanced_usage.txt

# または直接コマンド実行
node src/claude_article_generator.js freee_advanced_usage.txt
```

### 4. Claude Codeで記事生成

システムが生成したプロンプトを**Claude Code**に貼り付けると：

1. **GitHub内プロンプト自動読み込み** - updated_wordpress_guide.md等
2. **WordPress記事生成** - ブロックエディタ形式で高品質記事
3. **図表自動生成・埋め込み** - 記事内容連動の専門図表
4. **SEO最適化** - メタデータ、スキーママークアップ
5. **WordPress投稿** - 下書きとして保存

### 5. 出力結果

- `outputs/claude_articles/<ファイル名>_claude_ready.json` - 完全な準備データ
- `outputs/claude_articles/<ファイル名>_claude_prompt.md` - Claude用プロンプト
- Claude Codeによる高品質WordPress記事

## コマンド一覧

```bash
# ヘルプ表示
npm run claude-help

# 利用可能ファイル一覧
npm run claude-list

# サンプルファイル作成
npm run claude-sample

# Claude用プロンプト生成
npm run claude <txtファイル名>
```

## 設定

### 必要な設定

**設定不要！** OpenAI APIキーなどの環境変数は一切不要です。

### WordPress投稿用設定（オプション）

Claude Codeが記事をWordPressに直接投稿する場合のみ：

```bash
# .envファイルに設定（オプション）
WORDPRESS_API_URL=https://your-site.com/wp-json/wp/v2
WORDPRESS_USERNAME=your_username  
WORDPRESS_APP_PASSWORD=your_app_password
```

## GitHub内プロンプト使用

システムは以下のファイルを自動的に参照します：

- `updated_wordpress_guide.md` - WordPress記事生成プロンプト
- `# 会計・税務記事用モバイル最適化図表生成プロンプト【記事内容連動版】.md` - 図表生成プロンプト
- `schema_markup_generator.md` - スキーママークアップ生成プロンプト

これらのプロンプトがリポジトリ内に存在する限り、常に最新のプロンプトが使用されます。

## 利点

1. **完全無料** - OpenAI API等の有料サービス不要
2. **手動リサーチ品質** - 深い調査に基づく高品質コンテンツ  
3. **GitHub内プロンプト** - 専用プロンプトの自動活用
4. **Claude Code品質** - 最高レベルの記事生成能力
5. **完全自動化** - 図表・SEO・スキーマすべて自動
6. **柔軟性** - txtファイルの自由な形式に対応

## トラブルシューティング

```bash
# ファイルが見つからない場合
npm run claude-list

# サンプルで動作確認
npm run claude-sample
npm run claude sample_freee_research.txt

# プロンプトファイルが正しく生成されているか確認
ls outputs/claude_articles/
```

## 実際の使用例

```bash
# 1. サンプル作成
npm run claude-sample

# 2. サンプルでテスト
npm run claude sample_freee_research.txt

# 3. 生成されたプロンプトを確認
cat outputs/claude_articles/sample_freee_research_claude_prompt.md

# 4. そのプロンプトをClaude Codeにコピー＆ペースト
# 5. Claude Codeが自動的にGitHub内プロンプトを使用して記事生成！
```