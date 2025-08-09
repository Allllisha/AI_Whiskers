'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import dynamic from 'next/dynamic'

// Leafletは動的インポート（SSR回避）
const Map = dynamic(() => import('./Map'), { 
  ssr: false,
  loading: () => <div className="bg-gray-900 h-64 rounded-lg flex items-center justify-center">
    <p className="text-gray-500">Loading map...</p>
  </div>
})

interface Whisky {
  id: string
  name: string
  distillery: string
  country: string
  region: string
  abv: number
  notes: string[]
  matchScore: number
  imageUrl?: string
}

interface ResultDisplayProps {
  recommendations: {
    whiskies: Whisky[]
    aiComments: string[]  // 配列に変更
    cocktails?: any[]
  }
  onReset: () => void
}

export default function ResultDisplay({ recommendations, onReset }: ResultDisplayProps) {
  const [selectedWhisky, setSelectedWhisky] = useState<Whisky>(recommendations.whiskies[0])
  const [selectedIndex, setSelectedIndex] = useState<number>(0)
  const [distilleryMap, setDistilleryMap] = useState<any>(null)

  useEffect(() => {
    if (selectedWhisky) {
      fetchDistilleryLocation(selectedWhisky.distillery, selectedWhisky.region)
    }
  }, [selectedWhisky])

  const fetchDistilleryLocation = async (distillery: string, region: string) => {
    try {
      // ウイスキーIDも送信して、より正確な位置情報を取得
      const response = await fetch(
        `/api/location?id=${encodeURIComponent(selectedWhisky.id)}&distillery=${encodeURIComponent(distillery)}&region=${encodeURIComponent(region)}`
      )
      if (response.ok) {
        const data = await response.json()
        setDistilleryMap(data)
      }
    } catch (error) {
      console.error('Failed to fetch location:', error)
    }
  }

  const handleWhiskySelect = (whisky: Whisky, index: number) => {
    setSelectedWhisky(whisky)
    setSelectedIndex(index)
  }

  return (
    <div className="max-w-7xl mx-auto animate-fade-in">
      {/* AI Comment Section */}
      <div className="glass-effect rounded-2xl p-8 mb-8">
        <div className="text-center mb-6">
          <span className="text-yellow-500 text-sm font-light tracking-widest">
            AI SOMMELIER'S NOTE - {selectedIndex === 0 ? 'BEST MATCH' : selectedIndex === 1 ? 'SECOND CHOICE' : 'THIRD CHOICE'}
          </span>
        </div>
        <p className="text-gray-300 text-lg leading-relaxed font-light whitespace-pre-wrap max-w-3xl mx-auto">
          {recommendations.aiComments[selectedIndex] || ''}
        </p>
      </div>

      {/* Main Recommendation */}
      <div className="grid lg:grid-cols-2 gap-8 mb-8">
        {/* Selected Whisky Details */}
        <div className="glass-effect rounded-2xl p-8">
          <div className="mb-6">
            <span className="inline-block px-3 py-1 bg-yellow-500/20 text-yellow-500 text-sm rounded-full mb-4">
              Match Score: {Math.round(selectedWhisky.matchScore * 100)}%
            </span>
            <h2 className="text-4xl font-serif font-bold text-white mb-2">{selectedWhisky.name}</h2>
            <p className="text-gray-400 font-light">{selectedWhisky.distillery}</p>
            <p className="text-gray-500 text-sm">{selectedWhisky.region}, {selectedWhisky.country}</p>
          </div>

          <div className="border-t border-gray-800 pt-6 mb-6">
            <h3 className="text-yellow-500 text-sm font-light tracking-widest mb-3">SPECIFICATIONS</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Alcohol</span>
                <span className="text-white font-medium">{selectedWhisky.abv}% ABV</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Region</span>
                <span className="text-white font-medium">{selectedWhisky.region}</span>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-6">
            <h3 className="text-yellow-500 text-sm font-light tracking-widest mb-3">TASTING NOTES</h3>
            <div className="flex flex-wrap gap-2">
              {selectedWhisky.notes.map((note, i) => (
                <span key={i} className="px-3 py-1 bg-gray-800 text-gray-300 text-sm rounded-full">
                  {note}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Map */}
        <div className="space-y-8">
          
          {/* Distillery Location */}
          <div className="glass-effect rounded-2xl p-8">
            <h3 className="text-yellow-500 text-sm font-light tracking-widest mb-3">DISTILLERY LOCATION</h3>
            {distilleryMap ? (
              <div>
                <Map 
                  lat={distilleryMap.lat} 
                  lon={distilleryMap.lon} 
                  name={selectedWhisky.distillery}
                />
                <div className="mt-3 text-center">
                  <p className="text-gray-400 text-sm">{distilleryMap.display_name}</p>
                  <p className="text-gray-500 text-xs mt-1">
                    {distilleryMap.lat.toFixed(4)}°N, {distilleryMap.lon.toFixed(4)}°E
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-gray-900 h-64 rounded-lg flex items-center justify-center">
                <p className="text-gray-500">Loading location...</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Other Recommendations */}
      <div className="mb-8">
        <h3 className="text-yellow-500 text-sm font-light tracking-widest mb-6 text-center">OTHER RECOMMENDATIONS</h3>
        <div className="grid md:grid-cols-3 gap-4">
          {recommendations.whiskies.map((whisky, index) => (
            <button
              key={whisky.id}
              onClick={() => handleWhiskySelect(whisky, index)}
              className={`glass-effect rounded-lg p-6 text-left transition-all ${
                selectedWhisky.id === whisky.id 
                  ? 'border border-yellow-500 bg-yellow-500/10' 
                  : 'border border-transparent hover:border-gray-700'
              }`}
            >
              <div className="flex justify-between items-start mb-3">
                <span className="text-2xl font-serif text-white">#{index + 1}</span>
                <span className="text-xs text-yellow-500">
                  {Math.round(whisky.matchScore * 100)}%
                </span>
              </div>
              <h4 className="text-white font-medium mb-1">{whisky.name}</h4>
              <p className="text-gray-500 text-sm">{whisky.region}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Cocktail Suggestions */}
      {recommendations.cocktails && recommendations.cocktails.length > 0 && (
        <div className="glass-effect rounded-2xl p-8 mb-8">
          <h3 className="text-yellow-500 text-sm font-light tracking-widest mb-6 text-center">
            COCKTAIL INSPIRATIONS
          </h3>
          <div className="grid md:grid-cols-4 gap-4">
            {recommendations.cocktails.slice(0, 8).map((cocktail, index) => (
              <div key={index} className="text-center">
                {cocktail.strDrinkThumb && (
                  <div className="relative h-32 mb-2 rounded-lg overflow-hidden">
                    <Image
                      src={cocktail.strDrinkThumb}
                      alt={cocktail.strDrink}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <p className="text-gray-300 text-sm">{cocktail.strDrink}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reset Button */}
      <div className="text-center">
        <button
          onClick={onReset}
          className="px-8 py-3 border border-yellow-500 text-yellow-500 rounded-full hover:bg-yellow-500 hover:text-black transition-all font-light tracking-widest"
        >
          START NEW DIAGNOSIS
        </button>
      </div>
    </div>
  )
}