import fs from 'fs'
import path from 'path'
import { parse } from 'csv-parse/sync'

export interface WhiskyData {
  id: string
  name: string
  distillery: string
  country: string
  region: string
  abv: number
  price_hint: string
  barrel: string
  age: string
  core_range: boolean
  source_url: string
  license: string
}

export interface FlavorProfile {
  id: string
  vector: {
    smoky: number
    peaty: number
    fruity: number
    sweet: number
    spicy: number
    body: number
  }
  notes: string[]
}

export function loadWhiskies(): WhiskyData[] {
  const csvPath = path.join(process.cwd(), 'data', 'whiskies.csv')
  const csvContent = fs.readFileSync(csvPath, 'utf-8')
  
  const records = parse(csvContent, {
    columns: true,
    skip_empty_lines: true
  })
  
  return records.map((record: any) => ({
    ...record,
    abv: parseFloat(record.abv),
    core_range: record.core_range === 'true'
  }))
}

export function loadFlavorProfiles(): FlavorProfile[] {
  const jsonPath = path.join(process.cwd(), 'data', 'flavor_profile.json')
  const jsonContent = fs.readFileSync(jsonPath, 'utf-8')
  return JSON.parse(jsonContent)
}

export function calculateUserVector(answers: Record<string, string>) {
  const vector = {
    smoky: 0,
    peaty: 0,
    fruity: 0,
    sweet: 0,
    spicy: 0,
    body: 0
  }

  // Map answers to flavor preferences
  const mappings: Record<string, Record<string, Partial<typeof vector>>> = {
    mood: {
      '落ち着いてゆっくりしたい': { sweet: 0.3, body: 0.3 },
      'ちょっとワクワクしたい': { spicy: 0.3, fruity: 0.3 },
      '特別な気分を味わいたい': { smoky: 0.3, body: 0.3 }
    },
    time: {
      '食前や夕方の早い時間': { fruity: 0.3 },
      '食事と一緒に': { spicy: 0.3 },
      '食後や夜遅く': { sweet: 0.3, body: 0.3 }
    },
    place: {
      '家でくつろぎながら': { sweet: 0.3 },
      'おしゃれなバーで': { smoky: 0.2, spicy: 0.2 },
      'アウトドアや特別な場所で': { peaty: 0.3, smoky: 0.2 }
    },
    style: {
      'ストレートでじっくり': { body: 0.3 },
      'ハイボールで爽やかに': { fruity: 0.3, spicy: 0.2 },
      'カクテルで華やかに': { sweet: 0.3, fruity: 0.2 },
      'ロックでゆったり': { body: 0.2, smoky: 0.2 }
    },
    flavor_hint: {
      'フルーティーで軽やか': { fruity: 0.5 },
      'まろやかで甘め': { sweet: 0.5 },
      'スパイシーで力強い': { spicy: 0.5 },
      'スモーキーで大人っぽい': { smoky: 0.4, peaty: 0.3 }
    }
  }

  // Apply mappings
  Object.entries(answers).forEach(([questionId, answer]) => {
    if (mappings[questionId] && mappings[questionId][answer]) {
      const updates = mappings[questionId][answer]
      Object.entries(updates).forEach(([key, value]) => {
        vector[key as keyof typeof vector] += value
      })
    }
  })

  // Normalize vector
  const magnitude = Math.sqrt(
    Object.values(vector).reduce((sum, val) => sum + val * val, 0)
  )
  if (magnitude > 0) {
    Object.keys(vector).forEach(key => {
      vector[key as keyof typeof vector] /= magnitude
    })
  }

  return vector
}

export function calculateSimilarity(v1: any, v2: any): number {
  const keys = Object.keys(v1)
  const dotProduct = keys.reduce((sum, key) => sum + v1[key] * v2[key], 0)
  const mag1 = Math.sqrt(keys.reduce((sum, key) => sum + v1[key] * v1[key], 0))
  const mag2 = Math.sqrt(keys.reduce((sum, key) => sum + v2[key] * v2[key], 0))
  return dotProduct / (mag1 * mag2)
}

export function filterByBudget(whiskies: WhiskyData[], budget: string): WhiskyData[] {
  const budgetMap: Record<string, string[]> = {
    '〜3000円': ['low'],
    '3000〜6000円': ['low', 'mid'],
    '6000円以上': ['mid', 'high']
  }
  
  const allowedPrices = budgetMap[budget] || ['low', 'mid', 'high']
  return whiskies.filter(w => allowedPrices.includes(w.price_hint))
}