'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import { supabaseKey, supabaseUrl } from "@/lib/supabase/config";

export default function UserMenu({ userName }: { userName: string }) {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  
  const supabase = createBrowserClient(
    supabaseUrl!,
    supabaseKey!
  )

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
        <div className="w-7 h-7 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center text-sm font-bold">
          {userName.charAt(0)}
        </div>
        <span className="text-sm font-medium text-gray-700 hidden sm:block">
          {userName}님
        </span>
        <span className="text-xs text-gray-400">▼</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50 py-1">
          <Link 
            href="/auth/onboarding" 
            onClick={() => setIsOpen(false)}
            className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-amber-50 hover:text-amber-600 transition-colors"
          >
            👤 내 정보 관리
          </Link>
          <Link 
            href="/family" 
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