'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled ? 'bg-black/90 backdrop-blur-lg border-b border-gray-800' : 'bg-transparent'
    }`}>
      <nav className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-full flex items-center justify-center">
                <span className="text-black font-serif font-bold text-lg">N</span>
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
            </div>
            <div>
              <h1 className="text-white font-serif text-xl font-bold tracking-wide">Nostalgia & Co.</h1>
              <p className="text-yellow-500 text-[10px] font-light tracking-widest -mt-1">AI WHISKY SOMMELIER</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            <button 
              onClick={() => document.getElementById('diagnosis')?.scrollIntoView({ behavior: 'smooth' })}
              className="text-gray-300 hover:text-yellow-500 text-sm font-light tracking-wider transition-colors"
            >
              診断する
            </button>
            <button className="text-gray-300 hover:text-yellow-500 text-sm font-light tracking-wider transition-colors cursor-not-allowed opacity-50">
              ウイスキー図鑑
            </button>
            <button className="text-gray-300 hover:text-yellow-500 text-sm font-light tracking-wider transition-colors cursor-not-allowed opacity-50">
              カクテル
            </button>
            <button className="text-gray-300 hover:text-yellow-500 text-sm font-light tracking-wider transition-colors cursor-not-allowed opacity-50">
              蒸留所マップ
            </button>
            <button className="text-gray-300 hover:text-yellow-500 text-sm font-light tracking-wider transition-colors cursor-not-allowed opacity-50">
              ガイド
            </button>
          </div>

          {/* Right Section */}
          <div className="hidden lg:flex items-center space-x-6">
            {/* Premium Badge */}
            <div className="flex items-center space-x-2 px-3 py-1 bg-gradient-to-r from-yellow-600/20 to-yellow-500/20 rounded-full border border-yellow-500/30">
              <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className="text-yellow-500 text-xs font-medium">PREMIUM</span>
            </div>

            {/* CTA Button */}
            <button 
              onClick={() => {
                const element = document.getElementById('diagnosis')
                if (element) {
                  element.scrollIntoView({ behavior: 'smooth' })
                  // Trigger diagnosis start
                  setTimeout(() => {
                    const startBtn = document.querySelector('[data-start-diagnosis]') as HTMLButtonElement
                    if (startBtn) startBtn.click()
                  }, 500)
                }
              }}
              className="px-6 py-2 bg-gradient-to-r from-yellow-500 to-yellow-600 text-black font-medium text-sm rounded-full hover:from-yellow-600 hover:to-yellow-700 transition-all transform hover:scale-105"
            >
              今すぐ診断
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden text-white p-2"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-gray-800">
            <div className="flex flex-col space-y-4">
              <button 
                onClick={() => {
                  document.getElementById('diagnosis')?.scrollIntoView({ behavior: 'smooth' })
                  setIsMobileMenuOpen(false)
                }}
                className="text-gray-300 hover:text-yellow-500 text-sm font-light tracking-wider transition-colors text-left"
              >
                診断する
              </button>
              <span className="text-gray-600 text-sm font-light tracking-wider cursor-not-allowed opacity-50">
                ウイスキー図鑑
              </span>
              <span className="text-gray-600 text-sm font-light tracking-wider cursor-not-allowed opacity-50">
                カクテル
              </span>
              <span className="text-gray-600 text-sm font-light tracking-wider cursor-not-allowed opacity-50">
                蒸留所マップ
              </span>
              <span className="text-gray-600 text-sm font-light tracking-wider cursor-not-allowed opacity-50">
                ガイド
              </span>
              <button 
                onClick={() => {
                  const element = document.getElementById('diagnosis')
                  if (element) {
                    element.scrollIntoView({ behavior: 'smooth' })
                    setIsMobileMenuOpen(false)
                    setTimeout(() => {
                      const startBtn = document.querySelector('[data-start-diagnosis]') as HTMLButtonElement
                      if (startBtn) startBtn.click()
                    }, 500)
                  }
                }}
                className="mt-4 w-full px-6 py-2 bg-gradient-to-r from-yellow-500 to-yellow-600 text-black font-medium text-sm rounded-full hover:from-yellow-600 hover:to-yellow-700 transition-all"
              >
                今すぐ診断
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Premium Features Bar */}
      <div className={`bg-gradient-to-r from-yellow-600/10 via-yellow-500/5 to-yellow-600/10 border-t border-yellow-500/20 transition-all duration-300 ${
        isScrolled ? 'opacity-0 h-0 overflow-hidden' : 'opacity-100'
      }`}>
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center space-x-8 py-2">
            <div className="flex items-center space-x-2">
              <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span className="text-xs text-gray-400">AI診断無料</span>
            </div>
            <div className="flex items-center space-x-2">
              <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span className="text-xs text-gray-400">200銘柄以上</span>
            </div>
            <div className="flex items-center space-x-2">
              <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span className="text-xs text-gray-400">98%満足度</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}