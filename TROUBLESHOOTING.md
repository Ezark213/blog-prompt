# 🔧 トラブルシューティングガイド

記事生成で発生する問題の解決方法をまとめました。

## 記事生成の問題

### ❌ 記事の文章がうまくいかない問題

#### 症状
- 生成された記事がMarkdown記法（`##`、`**`等）のまま
- WordPressでブロックエディタエラーが発生
- Swellテーマの吹き出し機能が正しく表示されない

#### 原因
1. **Markdown記法の使用**: WordPressブロックエディタではMarkdown記法は使用できない
2. **ブロック形式の不備**: `<!-- wp:paragraph -->`等のブロックコメントが不足
3. **プロンプト指示の不徹底**: AIがWordPress形式を理解していない

#### 解決方法（v2.0.1で修正済み）

**自動修正機能**:
- `ContentFormatter`クラスが自動的にMarkdown→WordPress変換を実行
- 記事生成時に品質チェック・自動修正が動作
- 吹き出し機能の正しい実装を自動適用

**手動確認方法**:
```bash
# 記事生成実行
npm run claude research.txt

# 生成された記事の確認
cat outputs/claude_articles/research_claude_prompt.md
```

#### 修正内容

**Before（問題のある形式）**:
```markdown
## 見出し

**太字テキスト**

- リストアイテム1
- リストアイテム2

[speech_balloon id="1"]会話内容[/speech_balloon]
```

**After（修正後の形式）**:
```html
<!-- wp:heading {"level":2} --><h2>見出し</h2><!-- /wp:heading -->

<!-- wp:paragraph --><p><strong>太字テキスト</strong></p><!-- /wp:paragraph -->

<!-- wp:list --><ul>
<li>リストアイテム1</li>
<li>リストアイテム2</li>
</ul><!-- /wp:list -->

<!-- wp:html -->[speech_balloon id="1"]会話内容[/speech_balloon]<!-- /wp:html -->
```

### ✅ 確認方法

記事生成後、以下をチェックしてください：

1. **WordPress形式**: `<!-- wp:paragraph -->`等のブロックコメントが存在
2. **見出し**: `<h2>`、`<h3>`タグが使用されている
3. **リスト**: `<ul>`、`<ol>`タグでWordPressリストブロック化
4. **吹き出し**: `<!-- wp:html -->`で囲まれている

## その他の問題

### WordPress接続エラー
```
❌ WordPress接続エラー: Request failed with status code 401
```

**解決方法**:
1. `.env`ファイルのWordPress認証情報を確認
2. アプリケーションパスワードを再生成
3. 接続テストを実行: `node test_wordpress_connection.js`

### 記事アップロード失敗
```
❌ 失敗: 記事のアップロードに失敗しました
```

**解決方法**:
1. WordPressユーザーの権限確認（投稿者以上必要）
2. カテゴリ・タグの作成権限確認
3. 記事サイズの確認（大きすぎる場合は分割）

### ファイルが見つからない
```
❌ システムエラー: ファイルが見つかりません
```

**解決方法**:
```bash
# 利用可能ファイル確認
npm run claude-list

# サンプルファイル作成
npm run claude-sample

# 正しいパス確認
ls inputs/manual_research/
```

## 予防策

### 品質チェック
記事生成前に以下を確認：

1. **リサーチファイル**: `inputs/manual_research/`に正しく配置
2. **文字数**: 目標文字数を明記
3. **キーワード**: メインキーワードを含める

### 定期メンテナンス
```bash
# 依存関係の更新
npm update

# Git リポジトリの整理
git gc --prune=now

# 不要ファイルの削除
npm run clean
```

## サポート

問題が解決しない場合：

1. **GitHub Issues**: [問題報告](https://github.com/Ezark213/blog-prompt/issues)
2. **詳細ログ**: エラーメッセージをフルで記録
3. **環境情報**: Node.js バージョン、OS等を明記

## 更新情報

最新の修正内容は[CHANGELOG.md](docs/CHANGELOG.md)で確認できます。