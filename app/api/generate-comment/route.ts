import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const { whisky, rank } = await request.json()
    
    const rankText = rank === 1 ? '最も適した' : rank === 2 ? '2番目に適した' : '3番目に適した'
    
    const aiPrompt = `あなたは日本語のウイスキーソムリエです。
以下の${rankText}ウイスキーについて、おすすめコメントを作成してください。

# 出力条件
1. 「なぜこのウイスキーが${rankText}選択なのか → 味わい特徴 → おすすめの飲み方」の3段落構成
2. 自然で丁寧な日本語
3. 専門用語は簡単に説明する
4. 200〜250文字程度
5. ${rank}番目の選択である理由を明確に

# 銘柄情報
名前: ${whisky.name}
蒸留所: ${whisky.distillery}
地域: ${whisky.region}（${whisky.country}）
ABV: ${whisky.abv}%
テイスティングノート: ${whisky.notes.join(', ')}
マッチ度: ${Math.round(whisky.matchScore * 100)}%`

    let comment = ''
    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [{ role: 'user', content: aiPrompt }],
        max_tokens: 500,
        temperature: 0.7,
      })
      
      comment = completion.choices[0]?.message?.content || ''
    } catch (error) {
      console.error('OpenAI API error:', error)
      // フォールバックコメント
      if (rank === 1) {
        comment = `${whisky.name}は、あなたのご希望に最も適したウイスキーです。${whisky.region}地方の特徴である${whisky.notes.slice(0, 2).join('と')}の風味が、まさにお求めの味わいプロファイルと一致しています。ABV${whisky.abv}%の適度な強さで、どんな飲み方でも楽しめる万能な一本です。`
      } else if (rank === 2) {
        comment = `${whisky.name}も素晴らしい選択肢です。${whisky.distillery}蒸留所の伝統的な製法により、${whisky.notes.slice(0, 2).join('や')}といった個性的な味わいが楽しめます。最初の選択とは異なる魅力があり、気分を変えたい時におすすめです。`
      } else {
        comment = `${whisky.name}は、さらに違った楽しみ方ができる一本です。${whisky.country}産ウイスキーならではの${whisky.notes[0]}の風味が特徴的で、新しい発見があるかもしれません。冒険心のある方にぴったりの選択です。`
      }
    }
    
    return NextResponse.json({ comment })
    
  } catch (error) {
    console.error('Generate comment error:', error)
    return NextResponse.json(
      { error: 'Failed to generate comment' },
      { status: 500 }
    )
  }
}