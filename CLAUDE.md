CLAUDE.md — AI ウイスキーソムリエ（日本語診断＋ Pixabay 版） 0. 概要
目的：ユーザーの気分やシーンから AI（gpt-4o）が日本語で診断し、最適なウイスキーを提案

特徴：

初心者でも答えやすいおしゃれな質問形式

回答から嗜好ベクトルを算出し、類似度で候補抽出

提案文は gpt-4o が日本語で自然に生成

画像は Pixabay API（商用可・クレジット不要）

カクテルは TheCocktailDB API から取得

蒸留所の位置は Nominatim API で取得し地図表示

ポリシー：Wiki 系データは不使用。外部 API の利用規約を遵守

1. ゴール
   日本語会話形式の診断（6 問）

回答を 0〜1 に正規化して嗜好ベクトル作成

類似度計算で上位 3 銘柄を抽出

gpt-4o API で提案文生成

結果画面に：

銘柄カード（Pixabay 画像、短評、テイスティングノート、飲み方）

AI 生成の提案コメント

関連カクテル（TheCocktailDB）

蒸留所位置マップ（Nominatim）

2. 診断フロー（日本語・おしゃれ質問）
   json
   コピーする
   編集する
   [
   {
   "id": "mood",
   "question": "今日はどんな気分ですか？",
   "options": ["落ち着いてゆっくりしたい", "ちょっとワクワクしたい", "特別な気分を味わいたい"]
   },
   {
   "id": "time",
   "question": "飲むのはどんな時間帯ですか？",
   "options": ["食前や夕方の早い時間", "食事と一緒に", "食後や夜遅く"]
   },
   {
   "id": "place",
   "question": "どこで飲む予定ですか？",
   "options": ["家でくつろぎながら", "おしゃれなバーで", "アウトドアや特別な場所で"]
   },
   {
   "id": "style",
   "question": "今日はどんな飲み方をしたいですか？",
   "options": ["ストレートでじっくり", "ハイボールで爽やかに", "カクテルで華やかに", "ロックでゆったり"]
   },
   {
   "id": "flavor_hint",
   "question": "イメージに近い言葉を選んでください",
   "options": ["フルーティーで軽やか", "まろやかで甘め", "スパイシーで力強い", "スモーキーで大人っぽい"]
   },
   {
   "id": "budget",
   "question": "今日はどのくらいの予算感ですか？",
   "options": ["〜3000 円", "3000〜6000 円", "6000 円以上"]
   }
   ]
3. ベクトル変換例（内部マッピング）
   質問 ID smoky peaty fruity sweet spicy body
   mood 落ち着き=+sweet/+body, ワクワク=+spicy/+fruity, 特別=+smoky/+body
   time 食前=+fruity, 食中=+spicy, 食後=+sweet/+body
   place 家=+sweet, バー=+smoky/+spicy, アウトドア=+peaty/+smoky
   style ストレート=+body, ハイボール=+fruity/+spicy, カクテル=+sweet/+fruity, ロック=+body/+smoky
   flavor_hint 選択肢に応じて直接マッピング
   budget 推薦候補のフィルタリングに使用

4. データモデル
   4.1 data/whiskies.csv
   bash
   コピーする
   編集する
   id,name,distillery,country,region,abv,price_hint,barrel,age,core_range,source_url,license
   GLEN-001,Glen Example 12,Example Distillery,Scotland,Highland,40,mid,ex-bourbon,12,true,https://example.com/whisky,official
   4.2 data/flavor_profile.json
   json
   コピーする
   編集する
   [
   {
   "id": "GLEN-001",
   "vector": { "smoky": 0.1, "peaty": 0.1, "fruity": 0.7, "sweet": 0.6, "spicy": 0.3, "body": 0.4 },
   "notes": ["vanilla", "pear", "honey"]
   }
   ]
5. 利用 API
   5.1 OpenAI API（gpt-4o）
   用途：日本語提案文生成

エンドポイント：POST https://api.openai.com/v1/chat/completions

モデル：gpt-4o

認証：OPENAI_API_KEY（.env.local に設定）

5.2 TheCocktailDB API
用途：ウイスキーカクテル情報取得

ベース URL：https://www.thecocktaildb.com/api/json/v1/1/

主要エンドポイント：

/filter.php?i=Whiskey

/lookup.php?i={id}

5.3 Pixabay API（クレジット不要）
用途：ウイスキー・蒸留所画像取得

URL：https://pixabay.com/api/

認証：PIXABAY_API_KEY

例：

js
コピーする
編集する
fetch(`https://pixabay.com/api/?key=${process.env.PIXABAY_API_KEY}&q=whisky+bottle&image_type=photo&orientation=horizontal&per_page=3`)
5.4 Nominatim API（OpenStreetMap）
用途：蒸留所住所から座標取得、逆ジオコーディング

URL：https://nominatim.openstreetmap.org/search または /reverse

利用条件：

ユーザーエージェント必須

商用利用や大量アクセスは要ホスティング

6. AI プロンプト（gpt-4o）
   text
   コピーする
   編集する
   あなたは日本語のウイスキーソムリエです。
   以下のユーザーの気分・シーン・嗜好と銘柄情報を基に、おすすめコメントを作成してください。

# 出力条件

1. 「導入文 → 味わい特徴 → おすすめの飲み方」の 3 段落構成
2. 自然で丁寧な日本語
3. 専門用語は簡単に説明する
4. 200〜300 文字程度

# ユーザー情報

気分: {{mood}}, 時間帯: {{time}}, 場所: {{place}}, 飲み方: {{style}}, フレーバーイメージ: {{flavor_hint}}, 予算: {{budget}}

# 銘柄情報

名前: {{name}}
地域: {{region}}（{{country}}）
ABV: {{abv}}%
テイスティングノート: {{notes}} 7. 受け入れ条件
日本語診断 6 問 →gpt-4o 提案文表示

嗜好ベクトルによる推薦

Pixabay 画像取得（クレジット不要）

TheCocktailDB からカクテル表示

Nominatim で地図表示
