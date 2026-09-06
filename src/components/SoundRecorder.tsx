'use client'

import { useState, useRef } from 'react'
import { uploadAndSaveSound } from '@/app/actions/sound'

type SoundRecorderProps = {
  familyId: string
  onSoundAdded: () => void
}

export default function SoundRecorder({ familyId, onSoundAdded }: SoundRecorderProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [emoji, setEmoji] = useState('')
  const [loading, setLoading] = useState(false)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])

  const startRecording = async () => {
    audioChunksRef.current = []
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        setAudioBlob(audioBlob)
        setAudioUrl(URL.createObjectURL(audioBlob))
      }

      mediaRecorderRef.current = mediaRecorder
      mediaRecorder.start()
      setIsRecording(true)
    } catch (err) {
      alert('마이크 권한을 허용해야 녹음할 수 있습니다.')
      console.error(err)
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop()
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop())
      setIsRecording(false)
    }
  }

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!audioBlob || !title) return

    setLoading(true)
    try {
      await uploadAndSaveSound(familyId, title, emoji, audioBlob)

      alert('새로운 사운드가 등록되었습니다!')
      setTitle('')
      setAudioBlob(null)
      setAudioUrl(null)
      onSoundAdded()
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.'
      alert(`등록 실패: ${errorMessage}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white p-6 rounded-2xl border border-amber-200 shadow-sm mb-6">
      <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
        🎙️ 우리가족 목소리 녹음하기
      </h2>

      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          {!isRecording ? (
            <button
              type="button"
              onClick={startRecording}
              className="flex-1 py-3 bg-red-400 hover:bg-red-500 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              녹음 시작
            </button>
          ) : (
            <button
              type="button"
              onClick={stopRecording}
              className="flex-1 py-3 bg-gray-800 hover:bg-gray-700 text-white font-bold rounded-xl transition-colors animate-pulse flex items-center justify-center gap-2 cursor-pointer"
            >
              녹음 중지
            </button>
          )}
        </div>

        {audioUrl && (
          <div className="flex flex-col gap-3 p-3 bg-gray-50 rounded-xl">
            <p className="text-xs text-gray-500 font-medium">미리 들어보기:</p>
            <audio src={audioUrl} controls className="w-full h-10" />

            <form onSubmit={handleUpload} className="flex flex-col gap-3 mt-2">
              <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="이름 (예: 멍멍이, 할머니)" 
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="flex-1 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-800 outline-none focus:ring-2 focus:ring-amber-300"
                />
                <input 
                  type="text" 
                  placeholder="" 
                  value={emoji} 
                  onChange={(e) => setEmoji(e.target.value)}
                  required
                  className="w-16 px-3 py-2 bg-white border border-gray-200 rounded-lg text-center text-lg outline-none focus:ring-2 focus:ring-amber-300"
                />
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-amber-400 hover:bg-amber-500 text-white font-bold rounded-xl transition-colors text-sm disabled:opacity-50 cursor-pointer"
              >
                {loading ? '저장 중...' : '사운드박스에 등록하기'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}