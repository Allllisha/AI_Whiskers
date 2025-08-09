import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { 
  loadWhiskies, 
  loadFlavorProfiles, 
  calculateUserVector, 
  calculateSimilarity,
  filterByBudget
} from '@/lib/utils'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const { answers } = await request.json()
    
    // Load data
    const whiskies = loadWhiskies()
    const flavorProfiles = loadFlavorProfiles()
    
    // Calculate user preference vector
    const userVector = calculateUserVector(answers)
    
    // Filter by budget
    const budgetFiltered = filterByBudget(whiskies, answers.budget)
    
    // Calculate similarity scores
    const scoredWhiskies = budgetFiltered.map(whisky => {
      const profile = flavorProfiles.find(p => p.id === whisky.id)
      if (!profile) return null
      
      const score = calculateSimilarity(userVector, profile.vector)
      
      return {
        ...whisky,
        notes: profile.notes,
        matchScore: score
      }
    }).filter(Boolean)
    
    // Sort by score and take top 3
    scoredWhiskies.sort((a, b) => b!.matchScore - a!.matchScore)
    const topWhiskies = scoredWhiskies.slice(0, 3)
    
    // Fetch images from Pixabay
    const whiskiesWithImages = await Promise.all(
      topWhiskies.map(async (whisky) => {
        try {
          const query = `${whisky!.name.replace(/[0-9]/g, '')} whisky bottle`
          const pixabayUrl = `https://pixabay.com/api/?key=${process.env.PIXABAY_API_KEY}&q=${encodeURIComponent(query)}&image_type=photo&orientation=horizontal&per_page=1&safesearch=true`
          
          const response = await fetch(pixabayUrl)
          if (response.ok) {
            const data = await response.json()
            if (data.hits && data.hits.length > 0) {
              return { ...whisky, imageUrl: data.hits[0].webformatURL }
            }
          }
        } catch (error) {
          console.error('Failed to fetch image:', error)
        }
        return whisky
      })
    )
    
    // Generate AI comments for all top 3 whiskies
    const aiComments = []
    
    for (let i = 0; i < Math.min(3, topWhiskies.length); i++) {
      const whisky = topWhiskies[i]!
      const rankText = i === 0 ? '最も適した' : i === 1 ? '2番目に適した' : '3番目に適した'
      
      const aiPrompt = `あなたは日本語のウイスキーソムリエです。
以下のユーザーの気分・シーン・嗜好と、${rankText}銘柄情報を基に、おすすめコメントを作成してください。

# 出力条件
1. 「なぜこのウイスキーが${rankText}選択なのか → 味わい特徴 → おすすめの飲み方」の3段落構成
2. 自然で丁寧な日本語
3. 専門用語は簡単に説明する
4. 200〜250文字程度
5. ${i + 1}番目の選択である理由を明確に

# ユーザー情報
気分: ${answers.mood}
時間帯: ${answers.time}
場所: ${answers.place}
飲み方: ${answers.style}
フレーバーイメージ: ${answers.flavor_hint}
予算: ${answers.budget}

# 銘柄情報（第${i + 1}位）
名前: ${whisky.name}
地域: ${whisky.region}（${whisky.country}）
ABV: ${whisky.abv}%
テイスティングノート: ${whisky.notes.join(', ')}
マッチ度: ${Math.round(whisky.matchScore * 100)}%`

      try {
        const completion = await openai.chat.completions.create({
          model: 'gpt-4o',
          messages: [{ role: 'user', content: aiPrompt }],
          max_tokens: 500,
          temperature: 0.7,
        })
        
        aiComments.push(completion.choices[0]?.message?.content || '')
      } catch (error) {
        console.error(`OpenAI API error for whisky ${i + 1}:`, error)
        // フォールバックコメント
        if (i === 0) {
          aiComments.push(`${answers.mood}のあなたにぴったりのウイスキーをご用意しました。${whisky.name}は、${whisky.region}地方の名品で、${whisky.notes.slice(0, 3).join('、')}といった豊かな味わいが特徴です。${answers.style}で楽しむのがおすすめです。`)
        } else if (i === 1) {
          aiComments.push(`${whisky.name}も素晴らしい選択肢です。${whisky.notes.slice(0, 2).join('や')}といった個性的な味わいが楽しめます。最初の選択とは異なる魅力があり、気分を変えたい時におすすめです。`)
        } else {
          aiComments.push(`${whisky.name}は、さらに違った楽しみ方ができる一本です。${whisky.country}産ウイスキーならではの${whisky.notes[0]}の風味が特徴的で、新しい発見があるかもしれません。`)
        }
      }
    }
    
    // Fetch cocktails from TheCocktailDB based on selected whisky
    let cocktails: any[] = []
    try {
      // 選ばれたウイスキーの種類を判定
      const selectedWhisky = topWhiskies[0]!
      let whiskyType = 'Whiskey' // デフォルト
      
      // 国やブランドからウイスキーの種類を判定
      if (selectedWhisky.country === 'Scotland') {
        whiskyType = 'Scotch'
      } else if (selectedWhisky.country === 'USA') {
        if (selectedWhisky.region === 'Kentucky') {
          whiskyType = 'Bourbon'
        } else if (selectedWhisky.region === 'Tennessee') {
          whiskyType = 'Whiskey'
        }
      } else if (selectedWhisky.country === 'Ireland') {
        whiskyType = 'Whiskey'
      } else if (selectedWhisky.country === 'Japan') {
        whiskyType = 'Whisky'
      }
      
      // まずウイスキータイプで検索
      const searchTypes = [whiskyType]
      if (whiskyType === 'Scotch') {
        searchTypes.push('Whisky', 'Whiskey')
      } else if (whiskyType === 'Bourbon') {
        searchTypes.push('Whiskey')
      }
      
      let allCocktails: any[] = []
      
      // 各タイプで検索
      for (const type of searchTypes) {
        try {
          const response = await fetch(`https://www.thecocktaildb.com/api/json/v1/1/filter.php?i=${type}`)
          if (response.ok) {
            const data = await response.json()
            if (data.drinks) {
              allCocktails = [...allCocktails, ...data.drinks]
            }
          }
        } catch (err) {
          console.error(`Failed to fetch ${type} cocktails:`, err)
        }
      }
      
      // 重複を除去
      const uniqueCocktails = Array.from(
        new Map(allCocktails.map(c => [c.idDrink, c])).values()
      )
      
      // カクテルの詳細情報を取得して、選ばれたウイスキーに適したものを選定
      const detailedCocktails = []
      const cocktailsToCheck = uniqueCocktails.slice(0, 20) // 最初の20個をチェック
      
      for (const cocktail of cocktailsToCheck) {
        try {
          const detailResponse = await fetch(
            `https://www.thecocktaildb.com/api/json/v1/1/lookup.php?i=${cocktail.idDrink}`
          )
          if (detailResponse.ok) {
            const detailData = await detailResponse.json()
            if (detailData.drinks && detailData.drinks[0]) {
              const detail = detailData.drinks[0]
              
              // 材料にウイスキー系が含まれているか確認
              const ingredients = []
              for (let i = 1; i <= 15; i++) {
                const ingredient = detail[`strIngredient${i}`]
                if (ingredient) {
                  ingredients.push(ingredient.toLowerCase())
                }
              }
              
              // ウイスキー系の材料が含まれていれば追加
              const whiskyIngredients = ['whisky', 'whiskey', 'bourbon', 'scotch', 'rye']
              if (ingredients.some(ing => whiskyIngredients.some(w => ing.includes(w)))) {
                detailedCocktails.push({
                  ...cocktail,
                  strInstructions: detail.strInstructions,
                  ingredients: ingredients.join(', ')
                })
              }
            }
          }
        } catch (err) {
          console.error(`Failed to fetch cocktail details:`, err)
        }
      }
      
      // ユーザーの診断回答に基づいてカクテルを選定
      let preferredCocktails: string[] = []
      
      // 飲み方の好みに基づく選定
      if (answers.style === 'カクテルで華やかに') {
        // カクテル好きには多様なカクテルを
        preferredCocktails = ['Manhattan', 'Boulevardier', 'Paper Plane', 'Whiskey Sour', 'Gold Rush', 'Penicillin']
      } else if (answers.style === 'ハイボールで爽やかに') {
        // ハイボール好きには爽やかで軽いカクテルを
        preferredCocktails = ['Highball', 'Whiskey Fizz', 'John Collins', 'Mint Julep', 'Whiskey Rickey']
      } else if (answers.style === 'ロックでゆったり') {
        // ロック好きには濃厚でシンプルなカクテルを
        preferredCocktails = ['Old Fashioned', 'Sazerac', 'Godfather', 'Rusty Nail', 'Rob Roy']
      } else {
        // ストレート好きには最小限の材料のカクテルを
        preferredCocktails = ['Old Fashioned', 'Manhattan', 'Whiskey Sour', 'Hot Toddy']
      }
      
      // 時間帯による調整
      if (answers.time === '食前や夕方の早い時間') {
        // アペリティフには軽めのカクテルを追加
        preferredCocktails.push('Aperol Spritz', 'Whiskey Fizz', 'Mint Julep')
      } else if (answers.time === '食後や夜遅く') {
        // ディジェスティフには濃厚なカクテルを追加
        preferredCocktails.push('Rusty Nail', 'Blood and Sand', 'Vieux Carré')
      }
      
      // 気分による調整
      if (answers.mood === '特別な気分を味わいたい') {
        // 特別な日には複雑で洗練されたカクテルを
        preferredCocktails.push('Ramos Gin Fizz', 'Boulevardier', 'Paper Plane', 'Penicillin')
      } else if (answers.mood === 'ちょっとワクワクしたい') {
        // 冒険的な気分にはユニークなカクテルを
        preferredCocktails.push('Smoky Cokey', 'Pickleback', 'Whiskey Smash')
      }
      
      // フレーバーの好みによる調整
      if (answers.flavor_hint === 'スモーキーで大人っぽい') {
        // スモーキー好きには強いカクテルを
        preferredCocktails.push('Penicillin', 'Smoky Martini', 'Coal Miner')
      } else if (answers.flavor_hint === 'フルーティーで軽やか') {
        // フルーティー好きには爽やかなカクテルを
        preferredCocktails.push('Whiskey Smash', 'Derby', 'Brown Derby', 'Whiskey Daisy')
      } else if (answers.flavor_hint === 'まろやかで甘め') {
        // 甘め好きにはデザート系カクテルを
        preferredCocktails.push('Whiskey Cream', 'Godfather', 'Rusty Nail', 'Irish Coffee')
      } else if (answers.flavor_hint === 'スパイシーで力強い') {
        // スパイシー好きには刺激的なカクテルを
        preferredCocktails.push('Sazerac', 'Vieux Carré', 'Toronto', 'Remember the Maine')
      }
      
      // 優先カクテルリストに基づいてソート
      cocktails = detailedCocktails.sort((a, b) => {
        const aPriority = preferredCocktails.findIndex(name => 
          a.strDrink.toLowerCase().includes(name.toLowerCase())
        )
        const bPriority = preferredCocktails.findIndex(name => 
          b.strDrink.toLowerCase().includes(name.toLowerCase())
        )
        
        // 優先リストにあるものを上位に
        if (aPriority !== -1 && bPriority !== -1) {
          return aPriority - bPriority
        } else if (aPriority !== -1) {
          return -1
        } else if (bPriority !== -1) {
          return 1
        }
        
        // 選ばれたウイスキーの特徴も考慮
        if (selectedWhisky.notes.some(note => note.includes('smoke') || note.includes('peat'))) {
          const strongCocktails = ['Old Fashioned', 'Manhattan', 'Sazerac']
          const aStrong = strongCocktails.some(name => a.strDrink.includes(name))
          const bStrong = strongCocktails.some(name => b.strDrink.includes(name))
          return (bStrong ? 1 : 0) - (aStrong ? 1 : 0)
        }
        
        return 0
      }).slice(0, 12)
      
      // 不足分は一般的なウイスキーカクテルで補充
      if (cocktails.length < 8 && uniqueCocktails.length > 0) {
        const remaining = uniqueCocktails
          .filter(c => !cocktails.some(cc => cc.idDrink === c.idDrink))
          .slice(0, 8 - cocktails.length)
        cocktails = [...cocktails, ...remaining]
      }
    } catch (error) {
      console.error('Failed to fetch cocktails:', error)
    }
    
    return NextResponse.json({
      whiskies: whiskiesWithImages,
      aiComments,  // 3つすべてのコメントを送信
      cocktails
    })
    
  } catch (error) {
    console.error('Recommendation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate recommendations' },
      { status: 500 }
    )
  }
}