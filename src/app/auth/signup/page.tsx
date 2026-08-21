import { signUp } from '@/app/actions/auth'
import Link from 'next/link'
import Image from 'next/image'

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { error } = await searchParams

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#FFF9F2] p-4">
      <div className="w-full max-w-sm bg-white p-8 rounded-lg border border-gray-200 shadow-sm">
        
        <div className="text-center mb-8 mt-2">
          <div className="flex justify-center mb-4">
            <div className="text-6xl transform -rotate-12 drop-shadow-[0_15px_15px_rgba(0,0,0,0.2)]">
              <Image 
                src={'/signup_icon.png'}
                alt='회원가입 아이콘'
                width={16} height={16} unoptimized={true} 
                className="w-16 h-16 object-contain drop-shadow-sm"
              />
            </div>
          </div>
          <h1 className="text-2xl font-extrabold text-gray-800">환영해요!</h1>
          <p className="text-sm text-gray-500 mt-2">간편하게 가입하고 바로 시작해보세요.</p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-50 text-red-500 text-sm rounded-md text-center font-medium shadow-sm border border-red-100">
            {error}
          </div>
        )}

        <form action={signUp} className="flex flex-col gap-4">
          <input
            name="email"
            type="email"
            placeholder="이메일"
            required
            className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-300 focus:bg-white transition-all text-sm text-gray-800 placeholder:text-gray-400"
          />
          <input
            name="password"
            type="password"
            placeholder="비밀번호 (6자 이상)"
            required
            minLength={6}
            className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-300 focus:bg-white transition-all text-sm text-gray-800 placeholder:text-gray-400"
          />
          <input
            name="displayName"
            type="displayName"
            placeholder="고길동"
            required
            minLength={2}
            className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-300 focus:bg-white transition-all text-sm text-gray-800 placeholder:text-gray-400"
          />
          <button
            type="submit"
            className="w-full py-4 mt-2 bg-amber-400 hover:bg-amber-500 text-white font-bold rounded-md shadow-sm transition-colors text-base"
          >
            가입하기
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            이미 계정이 있으신가요?{' '}
            <Link href="/auth/login" className="text-amber-500 font-bold hover:underline transition-all">
              로그인
            </Link>
          </p>
        </div>
      </div>
    </main>
  )
}