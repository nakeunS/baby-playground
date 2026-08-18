import { createFamily, joinFamily } from '@/app/actions/auth'

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { error } = await searchParams

  return (
    // 배경은 로그인과 동일한 따뜻한 아이보리 톤 유지
    <main className="min-h-screen flex items-center justify-center bg-[#FFF9F2] p-4">
      {/* 두 개의 카드를 담을 넓은 컨테이너 (max-w-md) */}
      <div className="w-full max-w-md flex flex-col gap-6 py-8">
        
        {/* 상단 헤더 영역 */}
        <div className="text-center px-4 mb-2">
          <div className="text-4xl mb-2">🏠</div>
          <h1 className="text-2xl font-extrabold text-gray-800">가족 설정하기</h1>
          <p className="text-sm text-gray-500 mt-1">새로운 가족을 만들거나 기존 가족에 참여하세요!</p>
        </div>

        {/* 에러 메시지 */}
        {error && (
          <div className="mx-4 p-3 bg-red-50 text-red-500 text-sm rounded-xl text-center font-medium shadow-sm">
            {error}
          </div>
        )}

        {/* 1. 새 가족 만들기 카드 (따뜻한 앰버 톤) */}
        <section className="bg-white p-6 sm:p-8 rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <div className="flex items-center gap-2 mb-6">
            <span className="text-2xl">✨</span>
            <h2 className="text-lg font-bold text-gray-800">새 가족 만들기</h2>
          </div>
          <form action={createFamily} className="flex flex-col gap-4">
            <input 
              name="familyName" 
              placeholder="가족 이름 (예: 튼튼이네 가족)" 
              required 
              className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-300 focus:bg-white transition-all text-sm text-gray-800 placeholder:text-gray-400"
            />
            <input 
              name="displayName" 
              placeholder="내 이름 (예: 엄마, 아빠)" 
              required 
              className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-300 focus:bg-white transition-all text-sm text-gray-800 placeholder:text-gray-400"
            />
            <button 
              type="submit"
              className="w-full py-4 mt-2 bg-amber-400 hover:bg-amber-500 text-white font-bold rounded-2xl shadow-sm transition-colors text-base"
            >
              새로운 가족 만들기
            </button>
          </form>
        </section>

        {/* 2. 초대코드로 참여하기 카드 (포근한 스카이 톤) */}
        <section className="bg-white p-6 sm:p-8 rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <div className="flex items-center gap-2 mb-6">
            <span className="text-2xl">💌</span>
            <h2 className="text-lg font-bold text-gray-800">초대코드로 참여하기</h2>
          </div>
          <form action={joinFamily} className="flex flex-col gap-4">
            <input 
              name="inviteCode" 
              placeholder="초대코드 6자리 입력" 
              required 
              className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-sky-300 focus:bg-white transition-all text-sm text-gray-800 placeholder:text-gray-400 uppercase"
            />
            <input 
              name="displayName" 
              placeholder="내 이름 (예: 할머니, 삼촌)" 
              required 
              className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-sky-300 focus:bg-white transition-all text-sm text-gray-800 placeholder:text-gray-400"
            />
            <button 
              type="submit"
              className="w-full py-4 mt-2 bg-sky-400 hover:bg-sky-500 text-white font-bold rounded-2xl shadow-sm transition-colors text-base"
            >
              초대코드로 참여하기
            </button>
          </form>
        </section>

      </div>
    </main>
  )
}