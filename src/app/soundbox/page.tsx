'use client'

import { useState, useEffect } from 'react'
import { Trash } from "lucide-react";
import SoundRecorder from '@/components/sound/SoundRecorder'
import { getSoundBoxData, deleteSound, SoundItem } from '@/app/actions/sound'

export default function SoundBoxPage() {
  const [sounds, setSounds] = useState<SoundItem[]>([])
  const [familyId, setFamilyId] = useState<string | null>(null)
  const [playingId, setPlayingId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const [deleteTarget, setDeleteTarget] = useState<{ id: string; audioUrl: string } | null>(null)

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
    if (playingId) return
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

  const openDeleteConfirm = (e: React.MouseEvent, id: string, audioUrl: string) => {
    e.stopPropagation()
    setDeleteTarget({ id, audioUrl })
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return

    try {
      await deleteSound(deleteTarget.id, deleteTarget.audioUrl)
      setSounds((prev) => prev.filter((item) => item.id !== deleteTarget.id))
    } catch (err) {
      console.error('사운드 삭제 실패:', err)
      alert('삭제 중 오류가 발생했습니다.')
    } finally {
      setDeleteTarget(null)
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
    <main className="min-h-screen bg-[#FFF9F2] pb-32 pt-20 px-4 flex flex-col items-center relative">
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
                <div
                    key={item.id}
                    onClick={() => playSound(item.id, item.audio_url)}
                    className={`relative aspect-square rounded-3xl border-2 flex flex-col items-center justify-center gap-3 shadow-sm transition-all duration-200 cursor-pointer overflow-hidden bg-white ${colorClass} ${
                      isPlaying 
                        ? 'scale-95 ring-4 ring-offset-2 ring-amber-400 animate-pulse' 
                        : 'active:scale-95 hover:shadow-md'
                    }`}
                  >
                  <button
                    onClick={(e) => openDeleteConfirm(e, item.id, item.audio_url)}
                    className="absolute top-3 right-3 w-7 h-7 bg-red-400 hover:bg-red-500 rounded-full flex items-center justify-center text-xs text-black hover:text-red-500 shadow-sm transition-colors z-10"
                    title="삭제"
                  >
                    <Trash size={20} />
                  </button>

                  {isPlaying && (
                    <span className="absolute top-3 left-3 text-lg animate-bounce">
                      ♬
                    </span>
                  )}

                  <span className={`text-6xl transition-transform duration-200 ${isPlaying ? 'scale-125 rotate-6' : ''}`}>
                    {item.emoji}
                  </span>
                  
                  <span className="font-extrabold text-xl tracking-tight">
                    {isPlaying ? '재생 중!' : item.title}
                  </span>
                </div>
              )
            })}
          </div>
        )}

      </div>

      {deleteTarget && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 backdrop-blur-xs">
          <div className="bg-white w-full max-w-xs rounded-2xl p-6 shadow-xl text-center flex flex-col gap-4 animate-in fade-in zoom-in duration-200">
            <div>
              <p className="font-extrabold text-gray-800 text-base">소리를 삭제하시겠어요?</p>
              <p className="text-xs text-gray-400 mt-1">삭제된 소리는 복구할 수 없어요.</p>
            </div>
            <div className="flex gap-2 mt-2">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-600 text-sm font-bold rounded-xl transition-colors"
              >
                취소
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white text-sm font-bold rounded-xl transition-colors shadow-sm"
              >
                삭제하기
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}