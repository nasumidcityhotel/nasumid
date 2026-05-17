# 那須ミッドシティホテル — 新ホームページ デモ

社長プレゼン用 トップページデモ（参考サイト：[ノーガホテル秋葉原](https://www.nohgahotel.com/akihabara/) ベース）

## 🎯 コンセプト
**「便利なビジネスホテル」から「那須を動くための拠点ホテル」へ再定義**

PDF再定義案に基づき、以下のセクション構成で実装。
1. Hero（駅徒歩3分・那須を動く）
2. Concept（再定義メッセージ）
3. Feature（選ばれる4つの理由）
4. Rooms（客室：シモンズベッド／休息）
5. Breakfast（地域を味わう朝食）
6. Onsen Guide（温泉巡りの拠点）
7. Access（駅徒歩3分／IC10分／無料駐車場）
8. News（お知らせ）
9. CTA（予約導線）
10. Footer

## 📁 ファイル構成
```
nasu-midcity-demo/
├── index.html         ← トップページ単一ファイル（全コード内包）
├── netlify.toml       ← Netlifyデプロイ設定
├── .gitignore
└── README.md
```

すべて `index.html` 1ファイルに完結（CSS・JS インライン）。画像は外部CDN参照のため、ローカルアセット不要。

---

## 🖥️ VS Code で開く
```bash
cd nasu-midcity-demo
code .
```
VS Code 拡張「Live Server」で `index.html` を右クリック→「Open with Live Server」で即プレビュー可能。

---

## 🚀 GitHub にアップロード

```bash
cd nasu-midcity-demo
git init
git add .
git commit -m "初回デモ：那須ミッドシティ新HP案"
git branch -M main
git remote add origin https://github.com/<あなたのアカウント>/nasu-midcity-demo.git
git push -u origin main
```

---

## 🌐 Netlify でデプロイ（無料・即時公開）

### 方法A：ドラッグ＆ドロップ（最速・1分）
1. https://app.netlify.com/drop を開く
2. `nasu-midcity-demo` フォルダごとブラウザにドラッグ
3. 数秒で公開URLが発行されます（例：`https://xxxx.netlify.app`）

### 方法B：GitHub連携（推奨・自動デプロイ）
1. https://app.netlify.com にログイン
2. 「Add new site」→「Import an existing project」→「GitHub」
3. 上記でpushしたリポジトリを選択
4. Build command: （空欄でOK）
5. Publish directory: `/`（ルート）
6. 「Deploy site」を押すと数十秒で公開

`netlify.toml` で設定済みのため、デフォルト設定のままで動作します。

---

## 🎨 デザインの特徴
- **配色**：那須の土を思わせるブラウン（`#6b5b3e`）×ベージュゴールド×アイボリー
- **フォント**：欧文 Cormorant Garamond（上品なセリフ）／和文 Noto Serif JP・Noto Sans JP
- **編集ルール**：PDFの「本文主義」に従い、雰囲気写真ではなく**証拠提示**として画像を使用
- **モバイル最適化**：完全レスポンシブ（960px以下でハンバーガーメニュー）
- **アニメーション**：スクロール連動フェードイン、ヒーロー画像のズームアウト演出

## 🔁 次のステップ（社長承認後）
- 実写撮影の差し替え（駅から徒歩3分の証拠写真、客室、朝食、温泉）
- 予約システム（ホテルストーリー）との接続
- 14ページ構成への展開（コンセプト／客室／朝食／温泉ガイド／FAQ など）
- 構造化データ（schema.org Hotel）の実装でAI検索対応
