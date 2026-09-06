'use client'

import { useState, useEffect } from 'react'
import SoundRecorder from '@/components/SoundRecorder'
import { getSoundBoxData, SoundItem } from '@/app/actions/sound'

export default function SoundBoxPage() {
  const [sounds, setSounds] = useState<SoundItem[]>([])
  const [familyId, setFamilyId] = useState<string | null>(null)
  const [playingId, setPlayingId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    async function loadData() {
      try {
        const data = await getSoundBoxData()
        if (!isMounted) return

        setFamilyId(data.familyId)
        setSounds(data.sounds)
      } catch (err) {
        console.error('사운드 데이터를 불러오는 중 오류 발생:', err)
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    loadData()

    return () => {
      isMounted = false
    }
  }, [])

  const playSound = (id: string, soundPath: string) => {
    if( playingId ) return
    const audio = new Audio(soundPath)
    setPlayingId(id)

    audio.play().catch((err) => {
      console.log('오디오 재생 실패:', err)
      setPlayingId(null)
    })

    audio.onended = () => {
      setPlayingId(null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFF9F2] flex items-center justify-center">
        <p className="text-gray-500 font-medium">사운드박스를 불러오는 중...</p>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-[#FFF9F2] pb-32 pt-20 px-4 flex flex-col items-center">
      <div className="w-full max-w-md">
        
        <div className="text-center mb-6">
          <h1 className="text-2xl font-extrabold text-gray-800">🎵 우리 가족 사운드박스</h1>
          <p className="text-sm text-gray-500 mt-1">버튼을 톡톡 눌러서 소리를 들어보세요!</p>
        </div>

        {familyId && (
          <SoundRecorder familyId={familyId} onSoundAdded={() => {
            window.location.reload()
          }} />
        )}

        {sounds.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-amber-300 p-6 mt-4 shadow-sm">
            <span className="text-4xl mb-2 block">🧸</span>
            <p className="text-gray-600 font-bold">아직 등록된 사운드가 없어요!</p>
            <p className="text-xs text-gray-400 mt-1">가족들의 목소리를 녹음해서 첫 소리를 채워주세요.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {sounds.map((item, index) => {
              const isPlaying = playingId === item.id
              const bgColors = [
                'bg-amber-100 border-amber-200 text-amber-800',
                'bg-orange-100 border-orange-200 text-orange-800',
                'bg-sky-100 border-sky-200 text-sky-800',
                'bg-emerald-100 border-emerald-200 text-emerald-800',
                'bg-purple-100 border-purple-200 text-purple-800',
                'bg-pink-100 border-pink-200 text-pink-800',
              ]
              const colorClass = bgColors[index % bgColors.length]

              return (
                <button
                  key={item.id}
                  onClick={() => playSound(item.id, item.audio_url)}
                  className={`relative aspect-square rounded-3xl border-2 flex flex-col items-center justify-center gap-3 shadow-sm transition-all duration-200 cursor-pointer overflow-hidden bg-white ${colorClass} ${
                    isPlaying 
                      ? 'scale-95 ring-4 ring-offset-2 ring-amber-400 animate-pulse' 
                      : 'active:scale-95 hover:shadow-md'
                  }`}
                >
                  {isPlaying && (
                    <span className="absolute top-3 right-3 text-lg animate-bounce">
                      ♬
                    </span>
                  )}

                  <span className={`text-6xl transition-transform duration-200 ${isPlaying ? 'scale-125 rotate-6' : ''}`}>
                    {item.emoji}
                  </span>
                  
                  <span className="font-extrabold text-xl tracking-tight">
                    {isPlaying ? '재생 중!' : item.title}
                  </span>
                </button>
              )
            })}
          </div>
        )}

      </div>
    </main>
  )
}