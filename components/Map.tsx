'use client'

import { useEffect } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

interface MapProps {
  lat: number
  lon: number
  name: string
}

export default function Map({ lat, lon, name }: MapProps) {
  useEffect(() => {
    // Leafletのデフォルトアイコンの問題を修正
    delete (L.Icon.Default.prototype as any)._getIconUrl
    L.Icon.Default.mergeOptions({
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    })

    // 既存のマップがあれば削除
    const container = L.DomUtil.get('map')
    if (container && (container as any)._leaflet_id) {
      (container as any)._leaflet_id = null
    }

    // マップを初期化
    const map = L.map('map').setView([lat, lon], 10)

    // ダークテーマのタイルレイヤーを追加
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
      maxZoom: 19
    }).addTo(map)

    // カスタムマーカーを追加
    const customIcon = L.divIcon({
      html: `
        <div style="
          background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
          width: 32px;
          height: 32px;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          border: 2px solid rgba(255, 255, 255, 0.3);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <div style="
            width: 8px;
            height: 8px;
            background: white;
            border-radius: 50%;
            transform: rotate(45deg);
          "></div>
        </div>
      `,
      className: 'custom-div-icon',
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      popupAnchor: [0, -32]
    })

    L.marker([lat, lon], { icon: customIcon })
      .addTo(map)
      .bindPopup(`<b>${name}</b>`)
      .openPopup()

    return () => {
      map.remove()
    }
  }, [lat, lon, name])

  return (
    <div 
      id="map" 
      className="w-full h-64 rounded-lg overflow-hidden"
      style={{ background: '#1a1b1e' }}
    />
  )
}