import { createFamily, joinFamily } from '@/app/actions/auth'
import Image from 'next/image'

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { error } = await searchParams

  return (
    <main className="min-h-screen flex items-center justify-center pt-15 pb-15 bg-[#FFF9F2] p-4">
      <div className="w-full max-w-md flex flex-col gap-6 py-8">
        
        <div className="text-center px-4 mb-2">
          <div className="flex justify-center text-4xl mb-2">
            <Image 
              src={'/onboarding_icon.png'}
              alt='가족설정 아이콘'
              width={16} height={16} unoptimized={true} 
              className="w-16 h-16 object-contain drop-shadow-sm"
            />
          </div>
          <h1 className="text-2xl font-extrabold text-gray-800">가족 설정하기</h1>
          <p className="text-sm text-gray-500 mt-1">새로운 가족을 만들거나 기존 가족에 참여하세요!</p>
        </div>

        {error && (
          <div className="mx-4 p-3 bg-red-50 text-red-500 text-sm rounded-md text-center font-medium shadow-sm border border-red-100">
            {error}
          </div>
        )}

        <section className="bg-white p-6 sm:p-8 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <span className="text-2xl">✨</span>
            <h2 className="text-lg font-bold text-gray-800">새 가족 만들기</h2>
          </div>
          <form action={createFamily} className="flex flex-col gap-4">
            <input 
              name="familyName" 
              placeholder="가족 이름 (예: 튼튼이네 가족)" 
              required 
              className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-300 focus:bg-white transition-all text-sm text-gray-800 placeholder:text-gray-400"
            />
            <input 
              name="displayName" 
              placeholder="내 이름 (예: 엄마, 아빠)" 
              required 
              className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-300 focus:bg-white transition-all text-sm text-gray-800 placeholder:text-gray-400"
            />
            <button 
              type="submit"
              className="w-full py-4 mt-2 bg-amber-400 hover:bg-amber-500 text-white font-bold rounded-md shadow-sm transition-colors text-base"
            >
              새로운 가족 만들기
            </button>
          </form>
        </section>

        <section className="bg-white p-6 sm:p-8 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <span className="text-2xl">💌</span>
            <h2 className="text-lg font-bold text-gray-800">초대코드로 참여하기</h2>
          </div>
          <form action={joinFamily} className="flex flex-col gap-4">
            <input 
              name="inviteCode" 
              placeholder="초대코드 6자리 입력" 
              required 
              className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-300 focus:bg-white transition-all text-sm text-gray-800 placeholder:text-gray-400 uppercase"
            />
            <input 
              name="displayName" 
              placeholder="내 이름 (예: 할머니, 삼촌)" 
              required 
              className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-300 focus:bg-white transition-all text-sm text-gray-800 placeholder:text-gray-400"
            />
            <button 
              type="submit"
              className="w-full py-4 mt-2 bg-sky-400 hover:bg-sky-500 text-white font-bold rounded-md shadow-sm transition-colors text-base"
            >
              초대코드로 참여하기
            </button>
          </form>
        </section>

      </div>
    </main>
  )
}