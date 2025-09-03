# 🚀 完整なワークフロー：GPTリサーチ → Claude Code → WordPress自動投稿

## 📋 ワークフロー概要

1. **GPTでディープリサーチ** → 詳細な調査を実施
2. **リサーチ結果をtxtで保存** → `inputs/manual_research/` に保存
3. **Claude Codeでプロンプト生成** → 3つの専用プロンプトを自動読み込み
4. **記事生成＆WordPress自動投稿** → 複数構成対応で下書き保存

---

## 🛠️ 詳細手順

### STEP 1: GPTでディープリサーチ

GPTに以下のようなプロンプトでリサーチを依頼：

```
freee会計ソフトの使い方について詳細にリサーチしてください。以下の観点から調査してください：

■ 基本概要と特徴
■ 主要機能一覧
■ 導入手順（アカウント作成〜初期設定）
■ 銀行連携・自動仕訳の設定方法
■ 確定申告機能の使い方
■ 他社ソフトとの比較
■ 実際の利用者の評判
■ よくある質問と対処法
■ 料金プラン比較
■ おすすめの活用法

目標記事文字数: 5000文字
ターゲット: 会計ソフト初心者
```

### STEP 2: リサーチ結果をtxtで保存

GPTの回答をコピーして、`inputs/manual_research/` フォルダに保存：

```
例: inputs/manual_research/freee_research_2025.txt
```

**保存形式例**：
```txt
freee会計ソフトの詳細リサーチ結果

■ 基本概要と特徴
- クラウド型会計ソフト
- 初心者向けの使いやすいインターface
- 自動仕訳機能が充実
...

■ 主要機能一覧
- 銀行口座・クレジットカード連携
- 自動仕訳・自動振分
- 請求書・見積書作成
...

目標文字数: 5000文字程度
```

### STEP 3: Claude Code用プロンプト生成

```bash
# ターミナルでblog-promptフォルダに移動
cd blog-prompt

# リサーチファイルからClaude用プロンプトを生成
npm run claude freee_research_2025.txt
```

**生成される内容**：
- ✅ WordPress記事生成プロンプト（自動読み込み）
- ✅ 図表生成プロンプト（自動読み込み） 
- ✅ スキーママークアップ生成プロンプト（自動読み込み）
- ✅ リサーチ内容の要約と指示

### STEP 4: Claude Codeで記事生成

1. **生成されたプロンプトをClaude Codeにコピペ**
   ```
   outputs/claude_articles/freee_research_2025_claude_prompt.md の内容
   ```

2. **Claude Codeが自動実行**：
   - 📝 WordPress形式の記事生成（5000文字以上）
   - 📊 記事内容に基づく図表生成・埋め込み
   - 🏷️ スキーママークアップ（JSON-LD）生成
   - 📄 SEOメタデータ生成

3. **複数記事構成の場合**：
   Claude Codeが以下の形で複数提案する場合があります：
   ```
   記事構成1: freeeの基本機能と導入方法
   記事構成2: freeeの高度な活用法と効率化テクニック
   記事構成3: freeeと他社ソフトの比較分析
   ```

### STEP 5: WordPress自動下書き保存

Claude Codeでの記事生成完了後：

```bash
# WordPress自動投稿実行
node src/wordpress_auto_post.js
```

**システムが自動実行**：
1. 🔍 複数記事構成の検出
2. 🔗 WordPress接続テスト  
3. 📤 各記事を個別に下書き保存
4. 🏷️ カテゴリ・タグ自動作成
5. 📋 スキーママークアップ追加
6. ✅ 結果レポート表示

---

## 🎯 想定される出力結果

### 単一記事の場合
```
✅ 投稿完了！
============================================================
📝 タイトル: freee会計ソフト完全ガイド：初心者向け導入方法
🆔 WordPress ID: 123
🔗 下書きURL: https://ezark-tax-accounting.com/?p=123&preview=true
📅 保存日時: 2025-09-03T10:30:00.000Z
============================================================
```

### 複数記事構成の場合
```
🎉 複数記事処理結果
================================================================================
✅ 成功: 3個
❌ 失敗: 0個
📊 合計: 3個

📝 詳細結果:
  1. ✅ freeeの基本機能と導入方法
      ID: 124
      URL: https://ezark-tax-accounting.com/?p=124&preview=true
  2. ✅ freeeの高度な活用法と効率化テクニック
      ID: 125
      URL: https://ezark-tax-accounting.com/?p=125&preview=true
  3. ✅ freeeと他社ソフトの比較分析
      ID: 126
      URL: https://ezark-tax-accounting.com/?p=126&preview=true
================================================================================
```

---

## 🔧 GitHub Actionsでの自動化（オプション）

### 手動実行
1. GitHubの**Actions**タブを開く
2. **WordPress Auto Post**ワークフローを選択
3. **Run workflow**をクリック
4. リサーチファイル名を入力：`freee_research_2025.txt`
5. **Run workflow**で実行

### 自動実行（ファイル変更検知）
`outputs/claude_articles/` や `outputs/generated_articles/` にファイルを追加してプッシュすると自動実行

---

## 📊 技術的特徴

### ✨ 自動検出機能
- **複数記事構成の自動判定**：「記事構成1」「記事案1」「パターン1」等を検出
- **コンテンツ形式の自動判定**：JSON・テキスト・HTMLを自動識別
- **WordPress形式の自動変換**：Claude生成内容を適切なWordPress形式に変換

### 🛡️ エラー処理・安全性
- **API制限対策**：記事間に3秒間隔を自動挿入
- **接続エラー対応**：WordPress接続失敗時の詳細エラー表示
- **部分失敗対応**：一部記事が失敗しても他の記事は正常処理
- **下書き保存**：誤公開防止のため全て下書きとして保存

### 📈 SEO最適化
- **構造化データ対応**：記事ごとにJSON-LD形式のスキーマ生成
- **メタデータ自動生成**：タイトル・説明・スラッグの最適化
- **カテゴリ・タグ自動設定**：コンテンツに基づく自動分類
- **WordPress完全対応**：ブロックエディタ形式での出力

---

## 🚀 利用開始方法

### 1. 環境設定
```bash
# リポジトリクローン
git clone https://github.com/Ezark213/blog-prompt.git
cd blog-prompt

# 依存関係インストール
npm install

# WordPress認証情報をGitHub Secretsに設定
```

### 2. テスト実行
```bash
# サンプル作成
npm run claude-sample

# サンプルでテスト
npm run claude sample_freee_research.txt

# WordPress投稿テスト
npm run wordpress-post
```

### 3. 本格運用開始
```bash
# 1. GPTでリサーチ → txtファイル保存
# 2. Claude用プロンプト生成
npm run claude your_research.txt

# 3. Claude Codeで記事生成
# 4. WordPress自動投稿
npm run wordpress-post
```

---

## 🎉 期待される効果

### 時間短縮効果
- **従来**: 1記事あたり8-10時間（リサーチ3時間＋執筆5時間＋WordPress設定2時間）
- **導入後**: 1記事あたり1-2時間（GPTリサーチ30分＋Claude生成30分＋確認30分）
- **短縮率**: 約80-85%の時間短縮

### 品質向上効果
- ✅ SEO最適化の自動化
- ✅ 構造化データの自動生成
- ✅ WordPress完全対応形式
- ✅ 一貫した記事クオリティ
- ✅ 専門プロンプトによる高品質化

### 運用効率化効果
- ✅ 複数記事の一括処理
- ✅ エラー処理の自動化
- ✅ GitHub Actionsでの完全自動化
- ✅ 安全な下書き保存

このワークフローにより、高品質な会計・税務記事を効率的かつ大量に生成し、WordPress下書きとして自動保存することが可能になります。