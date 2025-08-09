# AI ウイスキーソムリエ

あなたの気分やシーンに合わせて、AIが最適なウイスキーを提案するWebアプリケーションです。

## 機能

- 6つの質問による診断フロー
- 嗜好ベクトルによる類似度計算
- OpenAI GPT-4oによる日本語の提案文生成
- Pixabay APIによるウイスキー画像表示
- TheCocktailDB APIによるカクテル提案
- Nominatim APIによる蒸留所位置表示

## セットアップ

1. 依存関係のインストール
```bash
npm install
```

2. 環境変数の設定
`.env.local`ファイルに以下のAPIキーを設定してください：
```
OPENAI_API_KEY=your_openai_api_key_here
PIXABAY_API_KEY=your_pixabay_api_key_here
```

3. 開発サーバーの起動
```bash
npm run dev
```

4. ブラウザで http://localhost:3000 を開く

## 使用技術

- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS
- OpenAI API (GPT-4o)
- Pixabay API
- TheCocktailDB API
- Nominatim API (OpenStreetMap)