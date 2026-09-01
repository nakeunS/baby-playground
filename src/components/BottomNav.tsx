'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Image from 'next/image'

export default function BottomNav() {
  const pathname = usePathname()

  if (pathname.startsWith('/auth') || pathname.startsWith('/onboarding')) {
    return null
  }

  const navItems = [
    { label: '홈', href: '/', icon: '/home.png' },
    { label: '성장기록', href: '/growth', icon: '/camera.png' },
    { label: '사운드', href: '/soundbox', icon: '/sound.png' },
    { label: '동화책', href: '/storybook', icon: '/book.png' },
    { label: '한글', href: '/korean', icon: '/hangul.png' },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 pb-safe">
      <div className="flex justify-around items-center h-16 max-w-md mx-auto px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
          
          return (
            <Link key={item.href} href={item.href} className="flex flex-col items-center justify-center w-full h-full gap-1">
              <span className={`text-xl transition-transform ${isActive ? 'scale-110 grayscale-0' : 'grayscale opacity-40'}`}>
                {item.icon.startsWith('/') ? (
                  <Image 
                    src={item.icon} 
                    alt={`${item.label} 아이콘`} 
                    width={4} height={4} unoptimized={true} 
                    className="w-7 h-7 object-contain drop-shadow-sm"
                  />
                ) : (
                  <span className="text-6xl drop-shadow-sm">{item.icon}</span>
                )}
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