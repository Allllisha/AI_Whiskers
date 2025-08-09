import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const whiskyId = searchParams.get('id')
    const distillery = searchParams.get('distillery')
    const region = searchParams.get('region')
    
    // まず事前に保存された蒸留所の座標データを読み込む
    const locationsPath = path.join(process.cwd(), 'data', 'distillery_locations.json')
    const locationsData = fs.readFileSync(locationsPath, 'utf-8')
    const locations = JSON.parse(locationsData)
    
    // IDで検索
    if (whiskyId) {
      const location = locations.find((loc: any) => loc.id === whiskyId)
      if (location) {
        return NextResponse.json({
          lat: location.lat,
          lon: location.lon,
          display_name: location.address,
          source: 'database'
        })
      }
    }
    
    // 蒸留所名で検索（フォールバック）
    if (distillery) {
      const location = locations.find((loc: any) => 
        loc.distillery.toLowerCase() === distillery.toLowerCase()
      )
      if (location) {
        return NextResponse.json({
          lat: location.lat,
          lon: location.lon,
          display_name: location.address,
          source: 'database'
        })
      }
    }
    
    // データベースに見つからない場合はNominatim APIを使用（フォールバック）
    if (distillery && region) {
      const query = `${distillery} distillery ${region}`
      const nominatimUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`
      
      const response = await fetch(nominatimUrl, {
        headers: {
          'User-Agent': 'AI-Whisky-Sommelier/1.0'
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        if (data && data.length > 0) {
          return NextResponse.json({
            lat: parseFloat(data[0].lat),
            lon: parseFloat(data[0].lon),
            display_name: data[0].display_name,
            source: 'nominatim'
          })
        }
      }
      
      // 最終フォールバック: 地域のみで検索
      const regionUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(region)}&format=json&limit=1`
      const regionResponse = await fetch(regionUrl, {
        headers: {
          'User-Agent': 'AI-Whisky-Sommelier/1.0'
        }
      })
      
      if (regionResponse.ok) {
        const regionData = await regionResponse.json()
        if (regionData && regionData.length > 0) {
          return NextResponse.json({
            lat: parseFloat(regionData[0].lat),
            lon: parseFloat(regionData[0].lon),
            display_name: regionData[0].display_name,
            source: 'nominatim-region'
          })
        }
      }
    }
    
    return NextResponse.json(
      { error: 'Location not found' },
      { status: 404 }
    )
    
  } catch (error) {
    console.error('Location API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch location' },
      { status: 500 }
    )
  }
}