import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { parse } from 'csv-parse/sync'
import fs from 'fs'
import path from 'path'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

// Load whisky data and flavor profiles
const whiskiesPath = path.join(process.cwd(), 'data', 'whiskies.csv')
const flavorPath = path.join(process.cwd(), 'data', 'flavor_profile.json')

const whiskiesData = fs.readFileSync(whiskiesPath, 'utf-8')
const whiskies = parse(whiskiesData, { columns: true })
const flavorProfiles = JSON.parse(fs.readFileSync(flavorPath, 'utf-8'))

// Create a map for quick flavor lookup
const flavorMap = new Map(flavorProfiles.map((f: any) => [f.id, f]))

export async function POST(request: NextRequest) {
  try {
    const { answers } = await request.json()
    
    // Map answers to flavor preferences
    const userPreferences = {
      smoky: 0,
      peaty: 0,
      fruity: 0,
      sweet: 0,
      spicy: 0,
      body: 0
    }
    
    // Calculate user preferences based on answers
    // (same calculation logic as before)
    if (answers.mood === '落ち着いてゆっくりしたい') {
      userPreferences.sweet += 0.3
      userPreferences.body += 0.3
    } else if (answers.mood === 'ちょっとワクワクしたい') {
      userPreferences.spicy += 0.3
      userPreferences.fruity += 0.3
    } else if (answers.mood === '特別な気分を味わいたい') {
      userPreferences.smoky += 0.3
      userPreferences.body += 0.3
    }
    
    // Add more mappings based on other answers...
    if (answers.flavor_hint === 'フルーティーで軽やか') {
      userPreferences.fruity += 0.5
      userPreferences.body -= 0.2
    } else if (answers.flavor_hint === 'まろやかで甘め') {
      userPreferences.sweet += 0.5
      userPreferences.body += 0.2
    } else if (answers.flavor_hint === 'スパイシーで力強い') {
      userPreferences.spicy += 0.5
      userPreferences.body += 0.3
    } else if (answers.flavor_hint === 'スモーキーで大人っぽい') {
      userPreferences.smoky += 0.5
      userPreferences.peaty += 0.3
    }
    
    // Calculate similarity scores and rank whiskies
    const rankedWhiskies = whiskies.map((whisky: any) => {
      const flavor = flavorMap.get(whisky.id)
      if (!flavor) return { ...whisky, matchScore: 0 }
      
      // Calculate cosine similarity
      let dotProduct = 0
      let userMagnitude = 0
      let whiskyMagnitude = 0
      
      for (const key of Object.keys(userPreferences) as Array<keyof typeof userPreferences>) {
        dotProduct += userPreferences[key] * flavor.vector[key]
        userMagnitude += userPreferences[key] ** 2
        whiskyMagnitude += flavor.vector[key] ** 2
      }
      
      const similarity = dotProduct / (Math.sqrt(userMagnitude) * Math.sqrt(whiskyMagnitude))
      
      return {
        ...whisky,
        notes: flavor.notes,
        matchScore: similarity || 0
      }
    }).sort((a: any, b: any) => b.matchScore - a.matchScore)
    
    // Get top 3 whiskies and fetch their images
    const topWhiskies = await Promise.all(
      rankedWhiskies.slice(0, 3).map(async (whisky: any) => {
        try {
          const searchQuery = `${whisky.name} whisky bottle`
          const response = await fetch(
            `https://pixabay.com/api/?key=${process.env.PIXABAY_API_KEY}&q=${encodeURIComponent(searchQuery)}&image_type=photo&orientation=horizontal&per_page=3`
          )
          if (response.ok) {
            const data = await response.json()
            if (data.hits && data.hits.length > 0) {
              whisky.imageUrl = data.hits[0].webformatURL
            }
          }
        } catch (error) {
          console.error('Failed to fetch image:', error)
        }
        return whisky
      })
    )
    
    // Start all async operations in parallel
    const [aiComments, cocktails] = await Promise.all([
      // Generate AI comments for all 3 whiskies in parallel
      Promise.all(
        topWhiskies.map(async (whisky, i) => {
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
            
            return completion.choices[0]?.message?.content || ''
          } catch (error) {
            console.error(`OpenAI API error for whisky ${i + 1}:`, error)
            // フォールバックコメント
            if (i === 0) {
              return `${answers.mood}のあなたにぴったりのウイスキーをご用意しました。${whisky.name}は、${whisky.region}地方の名品で、${whisky.notes.slice(0, 3).join('、')}といった豊かな味わいが特徴です。${answers.style}で楽しむのがおすすめです。`
            } else if (i === 1) {
              return `${whisky.name}も素晴らしい選択肢です。${whisky.notes.slice(0, 2).join('や')}といった個性的な味わいが楽しめます。最初の選択とは異なる魅力があり、気分を変えたい時におすすめです。`
            } else {
              return `${whisky.name}は、さらに違った楽しみ方ができる一本です。${whisky.country}産ウイスキーならではの${whisky.notes[0]}の風味が特徴的で、新しい発見があるかもしれません。`
            }
          }
        })
      ),
      // Fetch cocktails data
      fetchCocktailsData(topWhiskies[0], answers)
    ])
    
    return NextResponse.json({
      whiskies: topWhiskies,
      aiComments,
      cocktails: cocktails || []
    })
  } catch (error) {
    console.error('Recommendation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate recommendations' },
      { status: 500 }
    )
  }
}

// Helper function to fetch cocktails data
async function fetchCocktailsData(selectedWhisky: any, answers: any) {
  try {
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
    
    // 各タイプで並列検索
    const cocktailSearchPromises = searchTypes.map(async (type) => {
      try {
        const response = await fetch(`https://www.thecocktaildb.com/api/json/v1/1/filter.php?i=${type}`)
        if (response.ok) {
          const data = await response.json()
          return data.drinks || []
        }
      } catch (err) {
        console.error(`Failed to fetch ${type} cocktails:`, err)
      }
      return []
    })
    
    const cocktailResults = await Promise.all(cocktailSearchPromises)
    const allCocktails = cocktailResults.flat()
    
    // 重複を除去
    const uniqueCocktails = Array.from(
      new Map(allCocktails.map((c: any) => [c.idDrink, c])).values()
    )
    
    // カクテルの詳細情報を並列で取得
    const cocktailsToCheck = uniqueCocktails.slice(0, 10) // 最初の10個をチェック（高速化のため減らす）
    
    const detailPromises = cocktailsToCheck.map(async (cocktail: any) => {
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
            if (ingredients.some((ing: string) => whiskyIngredients.some(w => ing.includes(w)))) {
              return {
                ...cocktail,
                strInstructions: detail.strInstructions,
                ingredients: ingredients.join(', ')
              }
            }
          }
        }
      } catch (err) {
        console.error(`Failed to fetch cocktail details:`, err)
      }
      return null
    })
    
    const detailedResults = await Promise.all(detailPromises)
    const detailedCocktails = detailedResults.filter(c => c !== null)
    
    // ユーザーの診断回答に基づいてカクテルを選定
    let preferredCocktails: string[] = []
    
    // 飲み方の好みに基づく選定
    if (answers.style === 'カクテルで華やかに') {
      preferredCocktails = ['Manhattan', 'Boulevardier', 'Paper Plane', 'Whiskey Sour', 'Gold Rush', 'Penicillin']
    } else if (answers.style === 'ハイボールで爽やかに') {
      preferredCocktails = ['Highball', 'Whiskey Fizz', 'John Collins', 'Mint Julep', 'Whiskey Rickey']
    } else if (answers.style === 'ロックでゆったり') {
      preferredCocktails = ['Old Fashioned', 'Sazerac', 'Godfather', 'Rusty Nail', 'Rob Roy']
    } else {
      preferredCocktails = ['Old Fashioned', 'Manhattan', 'Whiskey Sour', 'Hot Toddy']
    }
    
    // 時間帯による調整
    if (answers.time === '食前や夕方の早い時間') {
      preferredCocktails.push('Aperol Spritz', 'Whiskey Fizz', 'Mint Julep')
    } else if (answers.time === '食後や夜遅く') {
      preferredCocktails.push('Rusty Nail', 'Blood and Sand', 'Vieux Carré')
    }
    
    // 優先カクテルリストに基づいてソート
    const sortedCocktails = detailedCocktails.sort((a: any, b: any) => {
      const aPriority = preferredCocktails.findIndex(name => 
        a.strDrink.toLowerCase().includes(name.toLowerCase())
      )
      const bPriority = preferredCocktails.findIndex(name => 
        b.strDrink.toLowerCase().includes(name.toLowerCase())
      )
      
      if (aPriority === -1 && bPriority === -1) return 0
      if (aPriority === -1) return 1
      if (bPriority === -1) return -1
      return aPriority - bPriority
    })
    
    // 上位3つのカクテルを返す
    return sortedCocktails.slice(0, 3)
    
  } catch (error) {
    console.error('Failed to fetch cocktails:', error)
    return []
  }
}