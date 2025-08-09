'use client'

import Link from 'next/link'

export default function Footer() {
  const currentYear = new Date().getFullYear()
  
  return (
    <footer className="relative bg-gradient-to-b from-dark-950 to-black border-t border-gray-800">
      {/* Main Footer Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Company Info */}
          <div className="md:col-span-1">
            <div className="mb-4">
              <h3 className="text-2xl font-serif text-white mb-1">Nostalgia & Co.</h3>
              <p className="text-xs text-yellow-500 font-light tracking-wider">DIGITAL WHISKY EXPERIENCES</p>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed mb-4">
              伝統と革新を融合させ、ウイスキーの新しい楽しみ方をAIテクノロジーで提案します。
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-500 hover:text-yellow-500 transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              <a href="#" className="text-gray-500 hover:text-yellow-500 transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                </svg>
              </a>
              <a href="#" className="text-gray-500 hover:text-yellow-500 transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zM5.838 12a6.162 6.162 0 1112.324 0 6.162 6.162 0 01-12.324 0zM12 16a4 4 0 110-8 4 4 0 010 8zm4.965-10.405a1.44 1.44 0 112.881.001 1.44 1.44 0 01-2.881-.001z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Product */}
          <div>
            <h4 className="text-white font-medium mb-4 text-sm tracking-wider">PRODUCT</h4>
            <ul className="space-y-2">
              <li>
                <button 
                  onClick={() => document.getElementById('diagnosis')?.scrollIntoView({ behavior: 'smooth' })}
                  className="text-gray-400 hover:text-yellow-500 text-sm transition-colors text-left"
                >
                  AI診断について
                </button>
              </li>
              <li><span className="text-gray-600 text-sm cursor-not-allowed">ウイスキーデータベース</span></li>
              <li><span className="text-gray-600 text-sm cursor-not-allowed">カクテルレシピ</span></li>
              <li><span className="text-gray-600 text-sm cursor-not-allowed">蒸留所マップ</span></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-white font-medium mb-4 text-sm tracking-wider">RESOURCES</h4>
            <ul className="space-y-2">
              <li><span className="text-gray-600 text-sm cursor-not-allowed">ウイスキー入門ガイド</span></li>
              <li><span className="text-gray-600 text-sm cursor-not-allowed">テイスティングノート</span></li>
              <li><span className="text-gray-600 text-sm cursor-not-allowed">用語集</span></li>
              <li><span className="text-gray-600 text-sm cursor-not-allowed">よくある質問</span></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-white font-medium mb-4 text-sm tracking-wider">COMPANY</h4>
            <ul className="space-y-2">
              <li><span className="text-gray-600 text-sm cursor-not-allowed">会社概要</span></li>
              <li><span className="text-gray-600 text-sm cursor-not-allowed">お問い合わせ</span></li>
              <li><span className="text-gray-600 text-sm cursor-not-allowed">プライバシーポリシー</span></li>
              <li><span className="text-gray-600 text-sm cursor-not-allowed">利用規約</span></li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <p className="text-gray-500 text-xs">
                © {currentYear} Nostalgia & Co. All rights reserved.
              </p>
              <p className="text-gray-600 text-xs mt-1">
                Tokyo, Japan
              </p>
            </div>
            
            {/* Trust Badges */}
            <div className="flex items-center space-x-6">
              <div className="text-center">
                <div className="text-yellow-500 text-2xl font-bold">98%</div>
                <div className="text-gray-600 text-xs">満足度</div>
              </div>
              <div className="text-center">
                <div className="text-yellow-500 text-2xl font-bold">50K+</div>
                <div className="text-gray-600 text-xs">診断実績</div>
              </div>
              <div className="text-center">
                <div className="text-yellow-500 text-2xl font-bold">200+</div>
                <div className="text-gray-600 text-xs">銘柄登録</div>
              </div>
            </div>
          </div>
        </div>

        {/* Legal Notice */}
        <div className="mt-8 p-4 bg-gray-900/50 rounded-lg">
          <p className="text-gray-600 text-xs leading-relaxed">
            ※ 当サービスは20歳以上の方を対象としています。お酒は20歳になってから。お酒は適量を。妊娠中や授乳期の飲酒は、胎児・乳児の発育に悪影響を与えるおそれがあります。飲酒運転は法律で禁止されています。
          </p>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-yellow-500/20 to-transparent"></div>
    </footer>
  )
}