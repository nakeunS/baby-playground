import Link from 'next/link'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import Image from 'next/image'

export default async function HomePage() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = supabase ? await supabase.auth.getUser() : { data: { user: null } }

  const menus = [
    {
      id: 'sns',
      title: '성장기록',
      subtitle: 'Growth',
      icon: '/camera.png',
      href: user ? '/growth' : '/auth/login?error=로그인이+필요한+메뉴입니다',
      isLocked: !user,
      footerLabel: '최근 기록',
      footerText: user ? '우리아이의 오늘을 기록하세요' : '🔒 로그인이 필요해요',
    },
    {
      id: 'sound',
      title: '사운드박스',
      subtitle: '음악 & 백색소음',
      icon: '/sound.png',
      href: '/soundbox',
      isLocked: false,
      footerLabel: '추천 사운드',
      footerText: '스르륵 잠드는 백색소음',
    },
    {
      id: 'storybook',
      title: '동화책',
      subtitle: '읽어주는 이야기',
      icon: '/book.png',
      href: '/storybook',
      isLocked: false,
      footerLabel: '이어보기',
      footerText: '아기 돼지 삼형제',
    },
    {
      id: 'korean',
      title: '한글공부',
      subtitle: '가나다라 놀이',
      icon: '/hangul.png',
      href: '/korean',
      isLocked: false,
      footerLabel: '학습 진도',
      footerText: '오늘은 자음 배우는 날!',
    },
    {
      id: 'math',
      title: '숫자공부',
      subtitle: '1 2 3 숫자 놀이',
      icon: '/number.png',
      href: '/math',
      isLocked: false,
      footerLabel: '학습 진도',
      footerText: '재미있는 숫자 세기',
    },
  ]

  return (
    <main className="min-h-screen bg-[#FFF9F2] px-4 pt-15 pb-28 sm:p-8">
      <div className="max-w-md mx-auto pt-8 sm:pt-12">
        <div className="mb-10 text-center px-2">
          <p className="text-amber-600 font-bold text-sm mb-1 tracking-wider">BABY PLAYGROUND</p>
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2 tracking-tight">
            우리 아이 놀이터
          </h1>
          <p className="text-gray-500 text-sm">
            무엇을 하고 놀아볼까요?
          </p>
        </div>

        <div className="grid grid-cols-2 gap-8 px-4">
          {menus.map((menu) => (
            <Link 
              key={menu.id} 
              href={menu.href}
              className={`group flex flex-col items-center transition-all duration-200 ${menu.isLocked ? 'opacity-70' : ''}`}
            >
              <div className="relative flex items-center justify-center w-32 h-32 bg-white rounded-full border border-gray-100 shadow-[0_8px_20px_rgb(0,0,0,0.04)] group-hover:shadow-md group-hover:-translate-y-1 transition-all duration-300">
                {menu.isLocked && (
                  <div className="absolute top-0 right-1 bg-gray-800 text-white text-xs w-8 h-8 flex items-center justify-center rounded-full shadow-sm z-10">
                    <Image src="/lock.png" alt="비공개" width={16} height={16} className="w-4 h-4 object-contain"/>
                  </div>
                )}

                <div className="group-hover:scale-110 transition-transform duration-200 flex items-center justify-center w-full h-full">
                  {menu.icon.startsWith('/') ? (
                    <Image 
                      src={menu.icon} 
                      alt={`${menu.title} 아이콘`} 
                      width={16} height={16} unoptimized={true} 
                      className="w-16 h-16 object-contain drop-shadow-sm"
                    />
                  ) : (
                    <span className="text-6xl drop-shadow-sm">{menu.icon}</span>
                  )}
                </div>
                
              </div>

              <span className="mt-4 text-base font-bold text-gray-700 group-hover:text-amber-500 transition-colors">
                {menu.title}
              </span>
            </Link>
          ))}
        </div>

      </div>
    </main>
  )
}