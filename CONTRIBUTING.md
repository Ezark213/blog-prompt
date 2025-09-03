# コントリビューションガイド

このプロジェクトへの貢献を歓迎します！

## 🤝 貢献方法

### 1. バグレポート
- [GitHub Issues](https://github.com/Ezark213/blog-prompt/issues) でバグを報告
- 再現手順を詳しく記載
- 環境情報（OS、Node.js バージョンなど）を含める

### 2. 機能提案
- [GitHub Discussions](https://github.com/Ezark213/blog-prompt/discussions) で提案
- 具体的な使用例を含める
- 既存機能との関係を説明

### 3. プルリクエスト
- Fork → Branch → Commit → Pull Request
- 変更内容を明確に説明
- テストを含める（該当する場合）

## 🚀 開発環境セットアップ

```bash
# リポジトリクローン
git clone https://github.com/Ezark213/blog-prompt.git
cd blog-prompt

# 依存関係インストール
npm install

# テスト実行
npm test

# 開発用サーバー起動
npm run dev
```

## 📝 コーディング規約

### JavaScript
- **ES6+** を使用
- **2スペース** インデント
- **セミコロン** 必須
- **const/let** を使用（var 禁止）

### ファイル命名
- **snake_case** for ファイル名
- **camelCase** for 変数・関数名
- **PascalCase** for クラス名

### コメント
- 関数の目的を説明
- 複雑なロジックには詳細コメント
- 日本語コメント推奨（このプロジェクトの性質上）

## 🗂️ プロジェクト構造理解

```
blog-prompt/
├── docs/                  # ドキュメント
│   ├── prompts/          # AIプロンプト集
│   ├── SETUP.md          # セットアップガイド
│   └── CHANGELOG.md      # 変更履歴
├── src/                   # ソースコード
│   ├── claude_article_generator.js  # メインシステム
│   ├── index.js          # 旧システム（互換性）
│   └── core/             # コアモジュール
├── inputs/               # 入力ファイル
│   └── manual_research/  # 手動リサーチファイル
├── outputs/              # 出力ファイル
│   └── claude_articles/  # 生成結果
├── examples/             # サンプル・テンプレート
└── legacy/              # 旧システムファイル
```

## 🧪 テストガイドライン

### 新機能追加時
- 単体テスト作成
- 統合テスト確認
- 手動テスト実行

### テストコマンド
```bash
# 全テスト実行
npm test

# 特定テスト実行
npm run test:unit
npm run test:integration

# テストカバレッジ確認
npm run coverage
```

## 📄 プルリクエスト作成手順

### 1. ブランチ作成
```bash
git checkout -b feature/amazing-feature
# または
git checkout -b fix/bug-description
```

### 2. 変更実装
- 小さく、意味のある単位でコミット
- コミットメッセージは明確に記述

### 3. テスト実行
```bash
npm test
npm run lint
```

### 4. プルリクエスト作成
- 変更内容の詳細説明
- 関連するIssue番号を記載
- スクリーンショット（UI変更の場合）

## 💡 プロンプト改善への貢献

### プロンプトファイル場所
- `docs/prompts/wordpress_article_generator.md`
- `docs/prompts/chart_generator.md`  
- `docs/prompts/schema_markup_generator.md`

### 改善ポイント
- より自然な日本語表現
- 具体的な指示内容
- エラーハンドリング改善
- 出力品質向上

## 🔍 レビュープロセス

### レビュー観点
- **機能性**: 期待通りに動作するか
- **可読性**: コードが理解しやすいか  
- **保守性**: 将来の変更に対応できるか
- **パフォーマンス**: 十分な速度で動作するか
- **セキュリティ**: セキュリティ上の問題がないか

### レビュー後の対応
- フィードバックに基づく修正
- 追加テストの実装
- ドキュメント更新

## 📞 質問・サポート

### 連絡先
- **GitHub Issues**: バグ・機能要望
- **GitHub Discussions**: 一般的な質問・議論
- **Email**: [EZARK税務・会計お問い合わせ](https://ezark-tax-accounting.com/contact/)

### 質問前のチェック
- [ ] README.md を確認
- [ ] 既存のIssues を検索  
- [ ] ドキュメント（docs/）を確認
- [ ] サンプルコード試行

## 🎉 謝辞

このプロジェクトは多くの方の貢献によって成り立っています。
すべてのコントリビューターの皆様に感謝いたします！

---

**Happy Contributing! 🚀**