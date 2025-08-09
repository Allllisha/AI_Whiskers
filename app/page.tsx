'use client'

import { useState } from 'react'
import DiagnosisFlow from '@/components/DiagnosisFlow'
import ResultDisplay from '@/components/ResultDisplay'

export default function Home() {
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [recommendations, setRecommendations] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [showDiagnosis, setShowDiagnosis] = useState(false)

  const handleComplete = async (userAnswers: Record<string, string>) => {
    setAnswers(userAnswers)
    setLoading(true)
    
    try {
      const response = await fetch('/api/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers: userAnswers })
      })
      
      if (!response.ok) throw new Error('Failed to get recommendations')
      
      const data = await response.json()
      // aiCommentがある場合は配列に変換（後方互換性のため）
      if (data.aiComment && !data.aiComments) {
        data.aiComments = [data.aiComment]
      }
      setRecommendations(data)
    } catch (error) {
      console.error('Error getting recommendations:', error)
      alert('推薦の取得に失敗しました。もう一度お試しください。')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setAnswers({})
    setRecommendations(null)
    setShowDiagnosis(false)
  }

  const startDiagnosis = () => {
    setShowDiagnosis(true)
    setRecommendations(null)
    setAnswers({})
  }

  return (
    <main className="min-h-screen bg-gradient-whisky relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-black/40"></div>
      <div className="absolute inset-0">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-whisky-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-whisky-800 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>
      
      <div className="relative z-10 container mx-auto px-4 pt-48 pb-12">
        <section id="diagnosis" className="scroll-mt-24">
          {!showDiagnosis && !recommendations && (
            <div className="text-center mb-12 animate-fade-in">
              <div className="inline-block mb-4">
                <h1 className="text-5xl md:text-6xl font-serif font-bold text-white mb-2 tracking-wider">
                  <span className="block text-lg md:text-xl font-sans font-light text-yellow-500 mb-2 tracking-widest">PREMIUM</span>
                  WHISKY EXPERIENCE
                </h1>
              </div>
              <p className="text-gray-300 text-lg font-light tracking-wide mb-12">
                あなたの洗練された一杯を、AIソムリエがご提案
              </p>
              
              {/* CTA Button */}
              <button
                onClick={startDiagnosis}
                data-start-diagnosis
                className="group relative inline-block px-12 py-4 overflow-hidden border border-yellow-500/50 hover:border-yellow-500 transition-all duration-300"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-yellow-600/10 to-yellow-500/10 group-hover:from-yellow-600/20 group-hover:to-yellow-500/20 transition-all duration-300"></span>
                <span className="relative text-yellow-500 font-light text-lg tracking-widest uppercase">AI診断スタート</span>
              </button>
              
              {/* Features */}
              <div className="grid md:grid-cols-3 gap-8 mt-20 max-w-5xl mx-auto">
                <div className="group relative">
                  <div className="absolute inset-0 bg-gradient-to-b from-yellow-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="relative border border-gray-800 hover:border-yellow-500/30 transition-all duration-300 p-8">
                    <div className="mb-6">
                      <div className="w-12 h-12 mx-auto mb-4 flex items-center justify-center">
                        <svg className="w-8 h-8 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                        </svg>
                      </div>
                      <h3 className="text-white font-serif text-xl text-center">Personalized</h3>
                    </div>
                    <p className="text-gray-400 text-sm leading-relaxed text-center">気分やシーンから最適な一杯を診断</p>
                  </div>
                </div>
                <div className="group relative">
                  <div className="absolute inset-0 bg-gradient-to-b from-yellow-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="relative border border-gray-800 hover:border-yellow-500/30 transition-all duration-300 p-8">
                    <div className="mb-6">
                      <div className="w-12 h-12 mx-auto mb-4 flex items-center justify-center">
                        <svg className="w-8 h-8 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a1.5 1.5 0 00-1.006-1.006L15.75 7.5l1.035-.259a1.5 1.5 0 001.006-1.006L18 5.25l.259 1.035a1.5 1.5 0 001.006 1.006L20.25 7.5l-1.035.259a1.5 1.5 0 00-1.006 1.006zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
                        </svg>
                      </div>
                      <h3 className="text-white font-serif text-xl text-center">AI Analysis</h3>
                    </div>
                    <p className="text-gray-400 text-sm leading-relaxed text-center">あなただけの特別な提案</p>
                  </div>
                </div>
                <div className="group relative">
                  <div className="absolute inset-0 bg-gradient-to-b from-yellow-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="relative border border-gray-800 hover:border-yellow-500/30 transition-all duration-300 p-8">
                    <div className="mb-6">
                      <div className="w-12 h-12 mx-auto mb-4 flex items-center justify-center">
                        <svg className="w-8 h-8 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                      <h3 className="text-white font-serif text-xl text-center">Distillery Map</h3>
                    </div>
                    <p className="text-gray-400 text-sm leading-relaxed text-center">実際の位置情報を地図で確認</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {loading ? (
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="flex flex-col items-center">
              <div className="relative w-20 h-20">
                <div className="absolute inset-0 border-4 border-yellow-500/30 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-yellow-500 rounded-full border-t-transparent animate-spin"></div>
              </div>
              <p className="text-yellow-500 mt-6 font-light tracking-widest text-sm text-center">SELECTING YOUR PERFECT DRAM...</p>
            </div>
          </div>
        ) : recommendations ? (
          <ResultDisplay 
            recommendations={recommendations} 
            onReset={handleReset}
          />
        ) : showDiagnosis ? (
          <DiagnosisFlow onComplete={handleComplete} />
        ) : null}
        </section>
      </div>

    </main>
  )
}