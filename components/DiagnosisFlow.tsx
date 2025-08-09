'use client'

import { useState } from 'react'

const questions = [
  {
    id: 'mood',
    question: '今宵はどのような気分でしょうか',
    subtitle: 'Your Mood Tonight',
    options: [
      { text: '落ち着いてゆっくりしたい', icon: '🥃', subtitle: 'Relaxed & Calm' },
      { text: 'ちょっとワクワクしたい', icon: '✨', subtitle: 'Excited & Adventurous' },
      { text: '特別な気分を味わいたい', icon: '🌟', subtitle: 'Special Occasion' }
    ]
  },
  {
    id: 'time',
    question: 'お召し上がりのタイミングは',
    subtitle: 'Time of Enjoyment',
    options: [
      { text: '食前や夕方の早い時間', icon: '🌅', subtitle: 'Aperitif' },
      { text: '食事と一緒に', icon: '🍽️', subtitle: 'With Dinner' },
      { text: '食後や夜遅く', icon: '🌙', subtitle: 'After Dinner' }
    ]
  },
  {
    id: 'place',
    question: 'どちらでお楽しみになりますか',
    subtitle: 'Your Setting',
    options: [
      { text: '家でくつろぎながら', icon: '🏠', subtitle: 'At Home' },
      { text: 'おしゃれなバーで', icon: '🍸', subtitle: 'At a Bar' },
      { text: 'アウトドアや特別な場所で', icon: '🏔️', subtitle: 'Special Place' }
    ]
  },
  {
    id: 'style',
    question: '本日のお飲み方は',
    subtitle: 'How to Drink',
    options: [
      { text: 'ストレートでじっくり', icon: '🥃', subtitle: 'Neat' },
      { text: 'ハイボールで爽やかに', icon: '🥤', subtitle: 'Highball' },
      { text: 'カクテルで華やかに', icon: '🍹', subtitle: 'Cocktail' },
      { text: 'ロックでゆったり', icon: '🧊', subtitle: 'On the Rocks' }
    ]
  },
  {
    id: 'flavor_hint',
    question: 'お好みのフレーバープロファイルは',
    subtitle: 'Flavor Profile',
    options: [
      { text: 'フルーティーで軽やか', icon: '🍑', subtitle: 'Fruity & Light' },
      { text: 'まろやかで甘め', icon: '🍯', subtitle: 'Smooth & Sweet' },
      { text: 'スパイシーで力強い', icon: '🔥', subtitle: 'Spicy & Bold' },
      { text: 'スモーキーで大人っぽい', icon: '💨', subtitle: 'Smoky & Mature' }
    ]
  },
  {
    id: 'budget',
    question: 'ご予算をお聞かせください',
    subtitle: 'Your Budget',
    options: [
      { text: '〜3000円', icon: '💵', subtitle: 'Entry Level' },
      { text: '3000〜6000円', icon: '💴', subtitle: 'Premium' },
      { text: '6000円以上', icon: '💎', subtitle: 'Luxury' }
    ]
  }
]

interface DiagnosisFlowProps {
  onComplete: (answers: Record<string, string>) => void
}

export default function DiagnosisFlow({ onComplete }: DiagnosisFlowProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})

  const handleAnswer = (answer: string) => {
    const newAnswers = {
      ...answers,
      [questions[currentQuestion].id]: answer
    }
    setAnswers(newAnswers)

    if (currentQuestion < questions.length - 1) {
      setTimeout(() => setCurrentQuestion(currentQuestion + 1), 300)
    } else {
      onComplete(newAnswers)
    }
  }

  const handleBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
    }
  }

  const question = questions[currentQuestion]
  const progress = ((currentQuestion + 1) / questions.length) * 100

  return (
    <div className="max-w-4xl mx-auto">
      <div className="glass-effect rounded-2xl shadow-2xl p-8 md:p-12 animate-slide-up">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs text-gray-400 tracking-widest font-light">
              QUESTION {currentQuestion + 1} OF {questions.length}
            </span>
            <span className="text-xs text-yellow-500 font-medium">
              {Math.round(progress)}%
            </span>
          </div>
          <div className="w-full h-1 bg-gray-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-yellow-600 to-yellow-500 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Question */}
        <div className="text-center mb-10">
          <p className="text-yellow-500 text-sm font-light tracking-widest mb-3 uppercase">
            {question.subtitle}
          </p>
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-white mb-2">
            {question.question}
          </h2>
        </div>

        {/* Options */}
        <div className="grid gap-4">
          {question.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswer(option.text)}
              className="group relative overflow-hidden rounded-lg border border-gray-700 hover:border-yellow-500/50 transition-all duration-300 transform hover:scale-[1.02]"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-500/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
              <div className="relative flex items-center justify-between p-6 bg-gray-900/50 hover:bg-gray-900/70 transition-colors">
                <div className="flex items-center space-x-4">
                  <span className="text-2xl">{option.icon}</span>
                  <div className="text-left">
                    <p className="text-white font-medium text-lg">{option.text}</p>
                    <p className="text-gray-400 text-sm font-light">{option.subtitle}</p>
                  </div>
                </div>
                <svg className="w-5 h-5 text-gray-600 group-hover:text-yellow-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>
          ))}
        </div>

        {/* Back Button */}
        {currentQuestion > 0 && (
          <button
            onClick={handleBack}
            className="mt-8 text-gray-400 hover:text-yellow-500 font-light text-sm tracking-wider transition-colors flex items-center space-x-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span>PREVIOUS QUESTION</span>
          </button>
        )}
      </div>
    </div>
  )
}