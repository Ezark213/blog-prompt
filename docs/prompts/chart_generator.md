# 会計・税務記事用モバイル最適化図表生成プロンプト【記事内容連動版】

## 概要

会計・税務記事の**実際の内容を詳細に分析し**、その内容に最適な図表（HTML/CSS）を**記事に応じた最適な数**自動生成するプロンプトです。推測は一切行わず、記事内の具体的な数値データ、事例、解説内容に基づいて図表を生成し、最適な埋め込み位置を提案します。既存サイトデザインに一切影響を与えず、モバイルUXを最優先とした会計・税務コンテンツ専用の視覚化システムです。

---

## ⚠️ 重要な制約事項

### 1. 記事内容分析最優先（最重要）
- **記事内の実際の記述内容のみを基にする**
- **推測・憶測・仮定は絶対に禁止**
- **記事で言及されていない数値・データは一切使用しない**
- **具体的な記事内容から直接読み取れる情報のみ活用**
- **一般的な会計知識での補完は禁止**

### 2. JavaScript・見出しタグ完全禁止
- **いかなる場合もJavaScriptコードを生成してはいけません**
- **h1〜h6タグを図表内で一切使用してはいけません**
- アニメーション効果はCSSのみで実装
- タイトル部分は全てdivタグでスタイリング

### 3. CSS完全分離・記事への影響防止
- **図表のCSSが記事全体に一切影響しないよう完全分離する**
- グローバルセレクター（*, body, html等）は絶対に使用禁止
- 全てのスタイルは図表コンテナ内でのみ有効にする
- 記事のフォント設定に影響しない

### 4. モバイルUX最優先設計
- **縦長すぎる図表は絶対に生成しない**（モバイルで3画面分を超える高さは禁止）
- 横並び要素は必ずモバイルで縦並びに変換されるレスポンシブ設計
- タップ領域は最低44px確保
- フォントサイズはモバイルで最低12px

### 5. 会計・税務コンテンツ特化
- 記事内で実際に解説されている計算手順・数値の視覚化
- 記事内で比較されている制度・方法の対比表現
- 記事内容から読み取れる節税効果を視覚的に強調
- 記事内の具体的な事例・データを図表で表現

---

## 1. 記事内容分析フロー（最優先）

### ステップ1：記事内容の徹底分析
**A. 記事内容の詳細読み取り**
```
1. 記事タイトルと本文の具体的な内容を記録
2. 言及されている数値データ・金額を抽出
3. 比較されている制度・サービス・方法を特定
4. 計算手順・プロセスの記述を分析
5. 具体的な事例・ケーススタディがあれば抽出
6. よく使われる専門用語・キーワードを特定
7. 読者への推奨事項・結論を把握
```

**B. 図表化可能な要素の特定**
```
1. 記事内の具体的な数値データ・計算結果
2. 制度・サービス間の比較・対立構造
3. 手順・プロセスの流れ
4. メリット・デメリットの対比
5. 時系列の変化（法改正、料金変更等）
6. 効果・影響の種類・程度
7. 読者の属性別の最適解
```

**C. 推測要素の完全排除**
```
✅ 記事内で明確に記述されている内容のみ使用
❌ 記事にない数値データの推測は禁止
❌ 一般的な会計・税務知識での補完は禁止
❌ 他の記事・情報を参照した内容は禁止
❌ 記事の意図を勝手に解釈した内容は禁止
❌ 市場データや統計の独自追加は禁止
```

### ステップ2：図表数の決定（記事内容・ボリュームベース）

**記事の複雑さ・長さに応じた図表数の判定**：
- **短文記事（1000文字未満）** → 1-2個の図表
- **標準記事（1000-3000文字）** → 2-4個の図表  
- **長文記事（3000-5000文字）** → 3-6個の図表
- **詳細解説記事（5000文字以上）** → 4-8個の図表

**図表化可能な要素の数による調整**：
- 数値データが豊富 → 図表数を増加
- 比較対象が多数 → 図表数を増加
- 手順・プロセスが複雑 → 図表数を増加
- 要点がシンプル → 図表数を減少

### ステップ3：図表タイプの決定（記事内容ベース）

**記事内容から以下を判定**：
- **数値・計算中心** → 計算プロセス可視化チャート
- **サービス・制度比較有り** → 比較分析カード
- **手順・プロセス説明** → ステップフローチャート
- **料金・コスト言及** → 料金比較テーブル
- **メリット・デメリット整理** → 機能比較マトリックス
- **効果・結果の提示** → 効果測定チャート
- **読者属性別推奨** → 診断・推奨チャート
- **要点・まとめ多数** → 記事要約カード

### ステップ4：埋め込み位置の提案（記事流れ分析）

**記事の流れを分析して最適位置を提案**：
```
1. 冒頭部分：記事のテーマ・概要を要約する図表
2. 問題提起後：課題の重要性を強調する図表
3. 解説途中：複雑な計算・比較を整理する図表（複数可）
4. 具体例の後：事例を視覚化する図表
5. 比較検討部分：選択肢を整理する図表
6. 結論前：最終的な推奨・まとめを示す図表
```

**位置決定の考慮要素**：
- 記事の論理構造・流れ
- 読者の理解促進タイミング
- 情報密度の分散
- モバイルでの読みやすさ

---

## 2. 記事内容連動図表テンプレート

### A. 記事内数値データ可視化チャート

```html
<!-- wp:html -->
<div class="accounting-data-chart" style="margin: 1.5em 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-weight: normal; color: #333;">
  <style>
    .accounting-data-chart * {
      box-sizing: border-box;
    }
    .accounting-data-chart .chart-title {
      margin: 0 0 15px 0; 
      color: #1976D2; 
      font-size: 16px; 
      font-weight: bold;
      text-align: center;
    }
    .accounting-data-chart .data-item {
      display: flex; 
      align-items: center; 
      justify-content: space-between;
      padding: 12px; 
      background: white; 
      border-radius: 8px; 
      box-shadow: 0 2px 6px rgba(0,0,0,0.1); 
      margin-bottom: 10px;
    }
    @media screen and (max-width: 768px) {
      .accounting-data-chart {
        padding: 12px !important;
      }
      .accounting-data-chart .data-item {
        padding: 10px !important;
        font-size: 13px !important;
      }
    }
  </style>
  
  <div style="padding: 15px; background: linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 100%); border-radius: 12px; border-left: 4px solid #1976D2;">
    <div class="chart-title">📊 [記事内の具体的な数値テーマ]</div>
    
    <!-- 記事内の実際のデータ -->
    <div class="data-item">
      <div style="font-weight: bold; color: #1976D2; font-size: 14px;">[記事内の項目名1]</div>
      <div style="font-size: 16px; font-weight: bold; color: #1976D2;">[記事内の実際の数値]</div>
    </div>
    
    <div class="data-item">
      <div style="font-weight: bold; color: #4CAF50; font-size: 14px;">[記事内の項目名2]</div>
      <div style="font-size: 16px; font-weight: bold; color: #4CAF50;">[記事内の実際の数値]</div>
    </div>
    
    <div class="data-item">
      <div style="font-weight: bold; color: #FF9800; font-size: 14px;">[記事内の項目名3]</div>
      <div style="font-size: 16px; font-weight: bold; color: #FF9800;">[記事内の実際の数値]</div>
    </div>
    
    <!-- 記事内の重要ポイント -->
    <div style="margin-top: 15px; padding: 12px; background: rgba(25, 118, 210, 0.1); border-radius: 8px; border-left: 3px solid #1976D2;">
      <div style="font-size: 13px; color: #1976D2; font-weight: bold; margin-bottom: 4px;">💡 [記事内の重要な指摘]</div>
      <div style="font-size: 12px; color: #555; line-height: 1.4;">[記事内容の具体的な記述を引用または要約]</div>
    </div>
  </div>
</div>
<!-- /wp:html -->
```

### B. 記事内計算プロセス可視化

```html
<!-- wp:html -->
<div class="accounting-calc-process" style="margin: 1.5em 0;">
  <style>
    .accounting-calc-process * {
      box-sizing: border-box;
    }
    @media screen and (max-width: 768px) {
      .accounting-calc-process {
        padding: 12px !important;
      }
      .accounting-calc-process .calc-step {
        padding: 10px !important;
        font-size: 12px !important;
      }
    }
  </style>
  
  <div style="padding: 15px; background: #f8f9fa; border-radius: 12px; border-left: 4px solid #4CAF50;">
    <div style="text-align: center; margin-bottom: 15px; color: #2E7D32; font-size: 16px; font-weight: bold;">🧮 [記事内の計算タイトル]</div>
    
    <!-- 記事内の実際の計算ステップ -->
    <div style="display: flex; flex-direction: column; gap: 12px;">
      <!-- ステップ1（記事内容から） -->
      <div class="calc-step" style="display: flex; align-items: center; padding: 12px; background: white; border-radius: 8px; box-shadow: 0 2px 6px rgba(0,0,0,0.1);">
        <div style="width: 32px; height: 32px; background: #4CAF50; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; margin-right: 12px; flex-shrink: 0; font-size: 14px;">1</div>
        <div style="flex: 1;">
          <div style="font-weight: bold; margin-bottom: 4px; font-size: 14px;">[記事内の計算ステップ1名称]</div>
          <div style="font-size: 13px; color: #666;">[記事内の具体的な計算式]</div>
        </div>
        <div style="font-size: 16px; font-weight: bold; color: #4CAF50; min-width: 80px; text-align: right;">[記事内の計算結果]</div>
      </div>
      
      <!-- ステップ2（記事内容から） -->
      <div class="calc-step" style="display: flex; align-items: center; padding: 12px; background: white; border-radius: 8px; box-shadow: 0 2px 6px rgba(0,0,0,0.1);">
        <div style="width: 32px; height: 32px; background: #2196F3; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; margin-right: 12px; flex-shrink: 0; font-size: 14px;">2</div>
        <div style="flex: 1;">
          <div style="font-weight: bold; margin-bottom: 4px; font-size: 14px;">[記事内の計算ステップ2名称]</div>
          <div style="font-size: 13px; color: #666;">[記事内の具体的な計算式]</div>
        </div>
        <div style="font-size: 16px; font-weight: bold; color: #2196F3; min-width: 80px; text-align: right;">[記事内の計算結果]</div>
      </div>
    </div>
    
    <!-- 記事内の最終結果 -->
    <div style="margin-top: 15px; padding: 15px; background: linear-gradient(135deg, #FF9800 0%, #FF5722 100%); color: white; border-radius: 8px; text-align: center;">
      <div style="font-size: 13px; margin-bottom: 5px;">[記事内の結論表現]</div>
      <div style="font-size: 20px; font-weight: bold;">[記事内の最終金額・結果]</div>
    </div>
  </div>
</div>
<!-- /wp:html -->
```

### C. 記事内サービス・制度比較

```html
<!-- wp:html -->
<div class="accounting-service-compare" style="margin: 1.5em 0;">
  <style>
    .accounting-service-compare * {
      box-sizing: border-box;
    }
    @media screen and (max-width: 768px) {
      .accounting-service-compare {
        padding: 12px !important;
      }
      .accounting-service-compare .compare-card {
        padding: 12px !important;
        font-size: 12px !important;
      }
    }
  </style>
  
  <div style="padding: 15px; background: linear-gradient(135deg, #FFF3E0 0%, #FFE0B2 100%); border-radius: 12px;">
    <div style="text-align: center; margin-bottom: 15px; color: #E65100; font-size: 16px; font-weight: bold;">⚖️ [記事内の比較テーマ]</div>
    
    <!-- 記事内で比較されているオプション -->
    <div style="display: flex; flex-direction: column; gap: 12px;">
      <!-- オプション1（記事内容から） -->
      <div class="compare-card" style="border: 2px solid #4CAF50; border-radius: 12px; overflow: hidden;">
        <div style="background: #4CAF50; color: white; padding: 12px; display: flex; align-items: center; justify-content: space-between;">
          <div style="font-weight: bold; font-size: 15px;">✅ [記事内のオプション1名]</div>
          <div style="font-size: 18px; font-weight: bold;">[記事内の評価・スコア]</div>
        </div>
        <div style="padding: 15px; background: #F1F8E9;">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 10px;">
            <div style="background: white; padding: 8px; border-radius: 6px;">
              <div style="font-size: 12px; color: #666; margin-bottom: 3px;">メリット</div>
              <div style="font-size: 11px; color: #2E7D32; line-height: 1.3;">[記事内のメリット記述]</div>
            </div>
            <div style="background: white; padding: 8px; border-radius: 6px;">
              <div style="font-size: 12px; color: #666; margin-bottom: 3px;">デメリット</div>
              <div style="font-size: 11px; color: #D32F2F; line-height: 1.3;">[記事内のデメリット記述]</div>
            </div>
          </div>
          <div style="text-align: center; background: #C8E6C9; padding: 8px; border-radius: 6px;">
            <strong style="font-size: 14px;">[記事内の具体的効果]: <span style="color: #1B5E20; font-size: 15px;">[記事内の数値]</span></strong>
          </div>
        </div>
      </div>
      
      <!-- オプション2（記事内容から） -->
      <div class="compare-card" style="border: 2px solid #FF9800; border-radius: 12px; overflow: hidden;">
        <div style="background: #FF9800; color: white; padding: 12px; display: flex; align-items: center; justify-content: space-between;">
          <div style="font-weight: bold; font-size: 15px;">⚠️ [記事内のオプション2名]</div>
          <div style="font-size: 18px; font-weight: bold;">[記事内の評価・スコア]</div>
        </div>
        <div style="padding: 15px; background: #FFF8E1;">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 10px;">
            <div style="background: white; padding: 8px; border-radius: 6px;">
              <div style="font-size: 12px; color: #666; margin-bottom: 3px;">メリット</div>
              <div style="font-size: 11px; color: #E65100; line-height: 1.3;">[記事内のメリット記述]</div>
            </div>
            <div style="background: white; padding: 8px; border-radius: 6px;">
              <div style="font-size: 12px; color: #666; margin-bottom: 3px;">デメリット</div>
              <div style="font-size: 11px; color: #D32F2F; line-height: 1.3;">[記事内のデメリット記述]</div>
            </div>
          </div>
          <div style="text-align: center; background: #FFE0B2; padding: 8px; border-radius: 6px;">
            <strong style="font-size: 14px;">[記事内の具体的効果]: <span style="color: #BF360C; font-size: 15px;">[記事内の数値]</span></strong>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
<!-- /wp:html -->
```

### D. 記事内容要約・推奨アクション

```html
<!-- wp:html -->
<div class="accounting-article-summary" style="margin: 1.5em 0;">
  <style>
    .accounting-article-summary * {
      box-sizing: border-box;
    }
    @media screen and (max-width: 768px) {
      .accounting-article-summary {
        padding: 12px !important;
      }
      .accounting-article-summary .summary-point {
        padding: 10px !important;
        font-size: 12px !important;
      }
    }
  </style>
  
  <div style="padding: 15px; background: linear-gradient(135deg, #E8F5E8 0%, #C8E6C9 100%); border-radius: 12px; border: 2px solid #4CAF50;">
    <div style="text-align: center; margin-bottom: 15px; color: #2E7D32; font-size: 16px; font-weight: bold;">📋 [記事タイトルに基づくまとめ]</div>
    
    <!-- 記事内の主要ポイント -->
    <div style="display: flex; flex-direction: column; gap: 10px;">
      <!-- ポイント1（記事内容から） -->
      <div class="summary-point" style="background: white; padding: 12px; border-radius: 8px; border-left: 4px solid #4CAF50;">
        <div style="font-weight: bold; margin-bottom: 4px; color: #2E7D32; font-size: 14px;">💡 [記事内の重要ポイント1]</div>
        <div style="font-size: 12px; color: #555; line-height: 1.4;">[記事内容の具体的な記述・結論]</div>
      </div>
      
      <!-- ポイント2（記事内容から） -->
      <div class="summary-point" style="background: white; padding: 12px; border-radius: 8px; border-left: 4px solid #FF9800;">
        <div style="font-weight: bold; margin-bottom: 4px; color: #E65100; font-size: 14px;">⚡ [記事内の重要ポイント2]</div>
        <div style="font-size: 12px; color: #555; line-height: 1.4;">[記事内容の具体的な記述・結論]</div>
      </div>
      
      <!-- ポイント3（記事内容から） -->
      <div class="summary-point" style="background: white; padding: 12px; border-radius: 8px; border-left: 4px solid #2196F3;">
        <div style="font-weight: bold; margin-bottom: 4px; color: #1976D2; font-size: 14px;">🎯 [記事内の重要ポイント3]</div>
        <div style="font-size: 12px; color: #555; line-height: 1.4;">[記事内容の具体的な記述・結論]</div>
      </div>
    </div>
    
    <!-- 記事内の最終推奨・結論 -->
    <div style="margin-top: 15px; padding: 12px; background: linear-gradient(135deg, #1976D2 0%, #42A5F5 100%); color: white; border-radius: 8px; text-align: center;">
      <div style="font-size: 14px; font-weight: bold; margin-bottom: 6px;">🚀 [記事内の最終結論・推奨]</div>
      <div style="font-size: 12px; line-height: 1.5;">[記事内容に基づく読者への具体的なアドバイス]</div>
    </div>
  </div>
</div>
<!-- /wp:html -->
```

---

## 3. 記事内容連動生成ルール

### A. 必須分析項目

**記事内容の定量分析**：
- 具体的な数値データ・金額の抽出
- 各制度・サービスへの言及回数
- 計算例の数・複雑さ
- 比較対象の数・種類

**記事内容の定性分析**：
- 主要な解説テーマ
- 読者の想定属性
- 推奨されている解決策
- 注意すべきポイント

### B. 推測禁止の徹底

❌ **絶対に行ってはいけないこと**：
- 記事にない数値の推測・計算
- 一般的な会計・税務知識での補完
- 他の記事や法令の参照
- 記事内容にない制度・サービスの追加
- 記事の文脈を超えた解釈
- 市場データや統計の独自追加

✅ **必ず行うこと**：
- 記事内の実際の記述内容のみ使用
- 具体的な数値・金額をそのまま転記
- 記事内の実際の表現・用語を使用
- 記事の解説範囲内での分析

### C. 位置提案ロジック

**記事の構造分析**：
1. **タイトル直後**：記事全体の概要を示す図表
2. **問題説明後**：課題の深刻さを強調する図表
3. **解決策説明中**：複雑な計算・比較を整理する図表
4. **まとめ前**：結論・推奨事項を強調する図表

---

## 4. 出力フォーマット

### 記事内容分析結果
```
📊 記事内容分析
- 記事タイトル: [実際のタイトル]
- 記事文字数: [概算文字数]
- 推奨図表数: [1-8個の範囲で最適な数]
- 主要テーマ: [記事内で最も重要視されているテーマ]
- 数値データ: [記事内の具体的な数値・金額]
- 比較対象: [記事内で比較されている制度・サービス]
- 計算例: [記事内の計算プロセス・手順]
- 最終結論: [記事内の推奨事項・結論]
```

### 図表生成（最適な数）

**図表1**：[記事内容に基づくタイトル]
```
埋め込み位置: [記事の具体的な段落・セクション後]
選択理由: [記事内容の具体的な要素に基づく理由]

[HTMLコード]
```

**図表2**：[記事内容に基づくタイトル]
```
埋め込み位置: [記事の具体的な段落・セクション後]
選択理由: [記事内容の具体的な要素に基づく理由]

[HTMLコード]
```

**図表3**：[記事内容に基づくタイトル]（必要に応じて）
```
埋め込み位置: [記事の具体的な段落・セクション後]
選択理由: [記事内容の具体的な要素に基づく理由]

[HTMLコード]
```

**図表N**：[記事内容に基づくタイトル]（記事内容に応じて継続）
```
埋め込み位置: [記事の具体的な段落・セクション後]
選択理由: [記事内容の具体的な要素に基づく理由]

[HTMLコード]
```

---

## 5. 品質チェック項目

### A. 記事内容整合性
- [ ] 全ての数値・データが記事内に実際に存在する
- [ ] 引用・要約部分が記事内容と正確に一致する
- [ ] 推測・憶測・仮定が一切含まれていない
- [ ] 記事の解説範囲を超えていない
- [ ] 一般知識での補完が含まれていない

### B. 技術的品質
- [ ] CSS完全分離が実現されている
- [ ] モバイル最適化が適用されている
- [ ] JavaScript・見出しタグが含まれていない
- [ ] 既存サイトへの影響がない
- [ ] 縦長図表の制限を遵守している

### C. ユーザビリティ
- [ ] 記事内容の理解促進に貢献している
- [ ] 複雑な情報が分かりやすく整理されている
- [ ] 読者にとって有益な視覚化になっている
- [ ] モバイルでも快適に閲覧できる

---

## 主な特徴

### ✨ このプロンプトの利点

1. **記事内容完全連動**: 推測を一切排除し、記事の実際の内容のみに基づく図表生成
2. **柔軟な図表数**: 記事の内容・長さに応じて1-8個の最適な数を自動決定
3. **事実ベース分析**: 記事内の具体的な数値・データ・記述を忠実に反映
4. **最適位置提案**: 記事の流れを分析した埋め込み位置の具体的提案
5. **完全JavaScript不使用**: 既存サイトへの影響を最小限に抑制
6. **CSS完全分離**: 図表のスタイルが記事全体に一切影響しない
7. **モバイルファースト設計**: 縦長図表を回避し、UX最優先
8. **実装の簡単さ**: コピー&ペーストですぐに使用可能

このプロンプトを使用することで、記事の実際の内容に完全に基づいた信頼性の高い図表を記事に応じた最適な数生成し、読者の理解促進と記事の価値向上を実現できます。