import type { Metadata } from 'next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import './globals.css'

export const metadata: Metadata = {
  title: 'AI ウイスキーソムリエ | Nostalgia & Co.',
  description: '伝統と革新を融合させた、AIによるパーソナライズドウイスキー診断サービス',
  keywords: 'ウイスキー, AI診断, ソムリエ, カクテル, 蒸留所, Nostalgia',
  authors: [{ name: 'Nostalgia & Co.' }],
  openGraph: {
    title: 'AI ウイスキーソムリエ | Nostalgia & Co.',
    description: 'あなたの気分やシーンに最適なウイスキーをAIがご提案',
    type: 'website',
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body className="min-h-screen flex flex-col bg-dark-950">
        <Header />
        <div className="flex-grow">{children}</div>
        <Footer />
      </body>
    </html>
  )
}