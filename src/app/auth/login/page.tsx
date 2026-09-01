import { signIn } from '@/app/actions/auth'
import Link from 'next/link'
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Image from 'next/image'

type LoginPageProps = {
  searchParams: Promise<{
    error?: string;
  }>;
};

const errorMessages = {
  missing: "이메일과 비밀번호를 모두 입력해 주세요.",
  config: "Supabase 환경변수가 설정되지 않았습니다.",
  invalid: "이메일 또는 비밀번호가 올바르지 않습니다.",
  confirm_email: "이메일 인증 후 다시 로그인해 주세요. 로그인하면 초대 코드가 사용 처리됩니다.",
};

export default async function LoginPage({searchParams}: LoginPageProps) {
  const supabase = await createSupabaseServerClient();
  const { data: { user }, } = supabase ? await supabase.auth.getUser() : { data: { user: null }};

  if( user ) {
    redirect("/");
  }
  const { error } = await searchParams;
  const message = error? errorMessages[error as keyof typeof errorMessages] ?? "로그인 중 문제가 발생했습니다." : null;

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#FFF9F2] p-4">
      <div className="w-full max-w-sm bg-white p-8 rounded-lg border border-gray-200 shadow-sm">
        
        <div className="text-center mb-8">
          <div className="flex justify-center text-4xl mb-2">
            <Image 
              src={'/login&main_icon.png'}
              alt='로그인 아이콘'
              width={16} height={16} unoptimized={true} 
              className="w-16 h-16 object-contain drop-shadow-sm"
            />
          </div>
          <h1 className="text-2xl font-extrabold text-gray-800">반가워요!</h1>
          <p className="text-sm text-gray-500 mt-1">우리 아이의 첫 기록을 시작해볼까요?</p>
        </div>

        {message ? (
          <div className="mb-4 p-3 bg-red-50 text-red-500 text-sm rounded-md text-center font-medium">
            {message}
          </div>
        ) : null}

        <form action={signIn} className="flex flex-col gap-4">
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
            placeholder="비밀번호"
            required
            className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-300 focus:bg-white transition-all text-sm text-gray-800 placeholder:text-gray-400"
          />
          
          <button
            type="submit"
            className="w-full py-4 mt-2 bg-amber-400 hover:bg-amber-500 text-white font-bold rounded-md shadow-sm transition-colors text-base"
          >
            로그인
          </button>
        </form>

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