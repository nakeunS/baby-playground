'use client'

import { useState, useRef, useEffect } from 'react'
import { updateProfile } from '@/app/actions/profile'
import Image from 'next/image'
import { createBrowserClient } from '@supabase/ssr'
import { supabaseKey, supabaseUrl } from '@/lib/supabase/config'

export default function ProfilePage() {
  const supabase = createBrowserClient( supabaseUrl!, supabaseKey! )
  
  const [displayName, setDisplayName] = useState('')
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
        if (data) {
          setDisplayName(data.display_name || '')
          setAvatarUrl(data.avatar_url)
          setPreviewUrl(data.avatar_url)
        }
      }
      setIsLoading(false)
    }
    fetchProfile()
  }, [supabase])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setPreviewUrl(URL.createObjectURL(file))
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSaving(true)

    const formData = new FormData(e.currentTarget)
    if (avatarUrl) formData.append('currentAvatarUrl', avatarUrl)

    try {
      const result = await updateProfile(formData)
      if (result.success) {
        alert('프로필이 성공적으로 변경되었습니다!')
      }
    } catch (error) {  
    if (error instanceof Error) {
        alert(error.message)
    } else {
        alert('알 수 없는 오류가 발생했습니다.')
    }
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) return <div className="min-h-screen bg-[#FFF9F2] p-8">로딩중...</div>

  return (
    <main className="min-h-screen bg-[#FFF9F2] p-4 sm:p-8 flex justify-center">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mt-10 h-fit">
        <h1 className="text-2xl font-bold text-gray-800 mb-8 text-center">내 정보 관리</h1>

        <form onSubmit={handleSubmit} className="flex flex-col items-center gap-6">
          <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
            <div className="w-28 h-28 rounded-full bg-amber-100 border-2 border-amber-200 overflow-hidden flex items-center justify-center flex-shrink-0">
              {previewUrl ? (
                <Image src={previewUrl} alt="프로필 사진" width={112} height={112} className="w-full h-full object-cover" />
              ) : (
                <span className="text-4xl text-amber-500 font-bold">
                  {displayName ? displayName.charAt(0) : '익'}
                </span>
              )}
            </div>

            <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="text-white text-sm font-medium">사진 변경</span>
            </div>
            <input 
              type="file" 
              name="avatar" 
              accept="image/*" 
              className="hidden" 
              ref={fileInputRef} 
              onChange={handleFileChange}
            />
          </div>

          <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 mb-2">닉네임</label>
            <input
              name="displayName"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-300 transition-all text-gray-800"
            />
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="w-full py-4 mt-4 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300 text-white font-bold rounded-xl transition-colors shadow-sm"
          >
            {isSaving ? '저장 중...' : '저장하기'}
          </button>
        </form>
      </div>
    </main>
  )
}