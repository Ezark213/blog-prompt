# 変更履歴

## [2.0.0] - 2025-09-03

### ✨ 追加
- **Claude Code連携システム** - 完全無料の新システム
- `src/claude_article_generator.js` - Claude Code連携メインファイル  
- `src/core/simple_research_parser.js` - txtファイル解析
- `docs/SETUP.md` - 詳細セットアップガイド
- `docs/CHANGELOG.md` - この変更履歴
- `.gitignore` - 適切なファイル除外設定

### 🔧 変更
- **プロンプトファイル整理** - `docs/prompts/` に移動
  - `wordpress_article_generator.md` (旧: updated_wordpress_guide.md)
  - `chart_generator.md` (旧: 会計・税務記事用...md)
  - `schema_markup_generator.md`
  - `deep_research.md` (旧: ディープリサーチ用プロンプト.md)
- **README.md完全リニューアル** - 新システム重視
- **package.json更新** - Claude用コマンド追加、OpenAI依存削除
- **ディレクトリ構造整理** - docs/, legacy/, examples/ 追加

### 📱 新機能
- **完全無料運用** - OpenAI API不要
- **手動リサーチ重視** - 高品質コンテンツ指向
- **GitHub内プロンプト自動活用** - プロンプト一元管理
- **簡単設定** - 環境変数設定不要

### 🗑️ 削除
- OpenAI依存関係（package.json）
- `src/manual_article_generator.js` - 旧OpenAI依存ファイル

### 🔄 移行
- 旧システムファイルは保持（互換性維持）
- `legacy/` フォルダに旧ファイル移動

---

## [1.0.0] - 2025-08-27

### ✨ 初回リリース
- **OpenAI API自動化システム** - GPT-4連携
- **WordPress REST API対応** - 自動投稿機能
- **図表自動生成** - モバイル最適化
- **SEO最適化** - スキーママークアップ自動生成
- **GitHub Actions** - CI/CD パイプライン
- **多言語対応** - 日本語特化プロンプト

### 🚀 主要機能
- リサーチファイル自動解析
- WordPress記事自動生成
- 図表・インフォグラフィック生成
- SEOメタデータ最適化
- 下書き自動保存

---

## 📋 今後の予定

### v2.1.0 (予定)
- [ ] 複数記事同時処理対応
- [ ] WordPress直接投稿機能（Claude Code経由）
- [ ] より高度な図表テンプレート
- [ ] 自動タグ付け機能

### v2.2.0 (予定)  
- [ ] 多言語対応強化
- [ ] テーマテンプレート追加
- [ ] 画像生成AI連携
- [ ] アナリティクス連携

---

## 🔧 技術的変更点

### アーキテクチャ
- **v1.x**: OpenAI API → WordPress API
- **v2.x**: 手動リサーチ → Claude Code → WordPress

### 依存関係
- **削除**: openai, node-fetch
- **維持**: axios, express, dotenv (旧システム互換)

### ファイル構造
- **docs/**: ドキュメント一元化
- **legacy/**: 旧システム保管
- **examples/**: サンプル・テンプレート

---

## 🎯 パフォーマンス改善

### v2.0.0での改善
- **コスト**: 100% → 0% (API費用削除)
- **設定時間**: 30分 → 3分 (環境変数不要)
- **品質**: GPT-4レベル → Claude Codeレベル
- **保守性**: 複雑 → シンプル