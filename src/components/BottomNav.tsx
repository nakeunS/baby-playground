'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function BottomNav() {
  const pathname = usePathname()

  // 로그인/회원가입 화면에서는 하단 바를 숨깁니다 (UX 향상)
  if (pathname.startsWith('/auth') || pathname.startsWith('/onboarding')) {
    return null
  }

  // 메뉴 리스트
  const navItems = [
    { label: '홈', href: '/', icon: '🏠' },
    { label: '성장기록', href: '/sns', icon: '📸' },
    { label: '사운드', href: '/soundbox', icon: '🎵' },
    { label: '동화책', href: '/storybook', icon: '📖' },
    { label: '학습', href: '/korean', icon: '✍️' },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 pb-safe">
      <div className="flex justify-around items-center h-16 max-w-md mx-auto px-2">
        {navItems.map((item) => {
          // 현재 페이지 경로와 메뉴 경로가 일치하는지 확인
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
          
          return (
            <Link key={item.href} href={item.href} className="flex flex-col items-center justify-center w-full h-full gap-1">
              <span className={`text-xl transition-transform ${isActive ? 'scale-110 grayscale-0' : 'grayscale opacity-40'}`}>
                {item.icon}
              </span>
              <span className={`text-[10px] font-bold transition-colors ${isActive ? 'text-amber-500' : 'text-gray-400'}`}>
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}