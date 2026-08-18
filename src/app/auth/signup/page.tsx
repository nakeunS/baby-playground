import { signUp } from '@/app/actions/auth'
import Link from 'next/link'

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { error } = await searchParams

  return (
    // 로그인 페이지와 동일한 따뜻한 아이보리 배경
    <main className="min-h-screen flex items-center justify-center bg-[#FFF9F2] p-4">
      
      {/* 부드러운 둥근 모서리 카드 */}
      <div className="w-full max-w-sm bg-white p-8 rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        
        {/* 헤더 영역: 귀여운 병아리 이모지와 환영 문구 */}
        <div className="text-center mb-8">
          <div className="text-4xl mb-2">🐣</div>
          <h1 className="text-2xl font-extrabold text-gray-800">환영해요!</h1>
          <p className="text-sm text-gray-500 mt-1">간편하게 가입하고 바로 시작해보세요.</p>
        </div>

        {/* 에러 메시지: 분홍빛 부드러운 박스 */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-500 text-sm rounded-xl text-center font-medium shadow-sm">
            {error}
          </div>
        )}

        <form action={signUp} className="flex flex-col gap-4">
          {/* 이메일 입력창 */}
          <input
            name="email"
            type="email"
            placeholder="이메일"
            required
            className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-300 focus:bg-white transition-all text-sm text-gray-800 placeholder:text-gray-400"
          />
          {/* 비밀번호 입력창 */}
          <input
            name="password"
            type="password"
            placeholder="비밀번호 (6자 이상)"
            required
            minLength={6}
            className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-300 focus:bg-white transition-all text-sm text-gray-800 placeholder:text-gray-400"
          />
          
          {/* 가입하기 버튼: 따뜻한 앰버 색상 */}
          <button
            type="submit"
            className="w-full py-4 mt-2 bg-amber-400 hover:bg-amber-500 text-white font-bold rounded-2xl shadow-sm transition-colors text-base"
          >
            가입하기
          </button>
        </form>

        {/* 하단 링크 영역: Next.js 최적화 Link 태그 사용 */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            이미 계정이 있으신가요?{' '}
            <Link href="/auth/login" className="text-amber-500 font-bold hover:underline">
              로그인
            </Link>
          </p>
        </div>
      </div>
    </main>
  )
}