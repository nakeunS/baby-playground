import { signIn } from '@/app/actions/auth'
import Link from 'next/link'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { error } = await searchParams

  return (
    // 전체 배경: 따뜻한 아이보리 톤 (#FFF9F2), 화면 전체(min-h-screen)를 채우고 가운데 정렬
    <main className="min-h-screen flex items-center justify-center bg-[#FFF9F2] p-4">
      
      {/* 로그인 카드: 모바일 친화적 너비(max-w-sm), 둥근 모서리, 부드러운 그림자 */}
      <div className="w-full max-w-sm bg-white p-8 rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        
        {/* 헤더 영역: 귀여운 이모지와 환영 인사 */}
        <div className="text-center mb-8">
          <div className="text-4xl mb-2">🍼</div>
          <h1 className="text-2xl font-extrabold text-gray-800">반가워요!</h1>
          <p className="text-sm text-gray-500 mt-1">우리 아이의 첫 기록을 시작해볼까요?</p>
        </div>

        {/* 에러 메시지: 빨간 글씨 대신 부드러운 분홍빛 박스로 표시 */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-500 text-sm rounded-xl text-center font-medium">
            {error}
          </div>
        )}

        <form action={signIn} className="flex flex-col gap-4">
          {/* 입력창: 둥글고 큼직하게, 클릭 시 따뜻한 노란색 테두리 */}
          <input
            name="email"
            type="email"
            placeholder="이메일"
            required
            className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-300 focus:bg-white transition-all text-sm text-gray-800 placeholder:text-gray-400"
          />
          <input
            name="password"
            type="password"
            placeholder="비밀번호"
            required
            className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-300 focus:bg-white transition-all text-sm text-gray-800 placeholder:text-gray-400"
          />
          
          {/* 로그인 버튼: 눈에 띄는 따뜻한 포인트 컬러(amber-400) */}
          <button
            type="submit"
            className="w-full py-4 mt-2 bg-amber-400 hover:bg-amber-500 text-white font-bold rounded-2xl shadow-sm transition-colors text-base"
          >
            로그인
          </button>
        </form>

        {/* 하단 링크 영역 */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            아직 계정이 없으신가요?{' '}
            <Link href="/auth/signup" className="text-amber-500 font-bold hover:underline">
              회원가입
            </Link>
          </p>
        </div>
      </div>
    </main>
  )
}