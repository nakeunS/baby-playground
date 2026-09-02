'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import { supabaseKey, supabaseUrl } from "@/lib/supabase/config";
import Image from 'next/image'

type ProfileType = {
  display_name: string | null
  avatar_url: string | null
}

export default function UserMenu({ userName = '사용자', avatarUrl = null }: { userName?: string, avatarUrl?: string | null }) {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  
  const [displayName, setDisplayName] = useState(userName)
  const [avatar, setAvatar] = useState<string | null>(avatarUrl)

  const [profile, setprofile] = useState<ProfileType | null>(null)
  const [loading, setLoading] = useState(true)

  const supabase = createBrowserClient(
    supabaseUrl!,
    supabaseKey!
  )

  useEffect(() => {
    const fetchLatestProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase.from('profiles').select('display_name, avatar_url').eq('id', user.id).single()
        setprofile(data)
        setLoading(false)
        if (data) {
          if (data.display_name) setDisplayName(data.display_name)
          if (data.avatar_url) setAvatar(data.avatar_url)
        }
      }
    }
    fetchLatestProfile()
  }, [supabase])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/auth/login')
    router.refresh()
  }

  return (
    <div className="relative" ref={menuRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 hover:bg-gray-50 px-3 py-1.5 rounded-full transition-colors"
      >
        <div className="w-7 h-7 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center text-sm font-bold overflow-hidden border border-amber-200">
          {loading ? (
            <div className="w-full h-full bg-gray-200 animate-pulse" />
          ) : avatar ? (
            <Image 
              src={avatar} 
              alt="프로필" 
              width={28} 
              height={28} 
              className="w-full h-full object-cover"
            />
          ) : (
            displayName.charAt(0)
          )}
        </div>

        {loading ? (
          <div className="w-16 h-4 bg-gray-200 animate-pulse rounded" />
        ) : (
          <span className="text-sm font-medium text-gray-700">
            {displayName}님
          </span>
        )}
        <span className="text-xs text-gray-400">▼</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50 py-1">
          <Link 
            href="/auth/profile"
            onClick={() => setIsOpen(false)}
            className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-amber-50 hover:text-amber-600 transition-colors"
          >
            👤 내 정보 관리
          </Link>
          <Link 
            href="/auth/onboarding" 
            onClick={() => setIsOpen(false)}
            className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-amber-50 hover:text-amber-600 transition-colors"
          >
            🏠 가족 관리 (초대)
          </Link>
          
          <div className="h-px bg-gray-100 my-1" />
          
          <button 
            onClick={handleLogout}
            className="w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors font-medium"
          >
            🚪 로그아웃
          </button>
        </div>
      )}
    </div>
  )
}