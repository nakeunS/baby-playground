'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { signUp, verifyOtp } from '@/app/actions/auth' 

export default function SignupPage() {
  const [step, setStep] = useState<'input' | 'verify'>('input')
  const [savedEmail, setSavedEmail] = useState('')
  const [localError, setLocalError] = useState('')
  const [isPending, setIsPending] = useState(false)

  const handleSignUp = async (formData: FormData) => {
    setIsPending(true)
    setLocalError('')
    
    const email = formData.get('email') as string
    setSavedEmail(email)

    const result = await signUp(formData)

    if (result?.error) {
      setLocalError(result.error)
      setIsPending(false)
      return
    }

    setStep('verify')
    setIsPending(false)
  }

  const handleVerify = async (formData: FormData) => {
    setIsPending(true)
    setLocalError('')
    
    formData.append('email', savedEmail) 
    
    const result = await verifyOtp(formData)

    if (result?.error) {
      setLocalError('인증번호가 일치하지 않거나 만료되었습니다.')
      setIsPending(false)
      return
    }
  }

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
          <h1 className="text-2xl font-extrabold text-gray-800">
            {step === 'input' ? '환영해요!' : '이메일 인증'}
          </h1>
          <p className="text-sm text-gray-500 mt-2">
            {step === 'input' 
              ? '간편하게 가입하고 바로 시작해보세요.' 
              : '메일로 발송된 8자리 번호를 입력해주세요.'}
          </p>
        </div>

        {localError && (
          <div className="mb-6 p-3 bg-red-50 text-red-500 text-sm rounded-md text-center font-medium shadow-sm border border-red-100">
            {localError}
          </div>
        )}

        {step === 'input' && (
          <form action={handleSignUp} className="flex flex-col gap-4">
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
              type="text"
              placeholder="OO삼촌, OO할머니, OO엄마"
              required
              minLength={2}
              className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-300 focus:bg-white transition-all text-sm text-gray-800 placeholder:text-gray-400"
            />
            <button
              type="submit"
              disabled={isPending}
              className="w-full py-4 mt-2 bg-amber-400 hover:bg-amber-500 disabled:bg-amber-200 text-white font-bold rounded-md shadow-sm transition-colors text-base"
            >
              {isPending ? '처리 중...' : '인증번호 받기'}
            </button>
          </form>
        )}

        {step === 'verify' && (
          <form action={handleVerify} className="flex flex-col gap-4">
            <input
              name="token"
              type="text"
              placeholder="인증번호 8자리"
              required
              maxLength={8}
              className="w-full px-5 py-4 text-center tracking-[0.5em] text-xl font-bold bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-300 focus:bg-white transition-all text-gray-800 placeholder:text-gray-400 placeholder:tracking-normal placeholder:font-normal placeholder:text-sm"
            />
            <button
              type="submit"
              disabled={isPending}
              className="w-full py-4 mt-2 bg-gray-800 hover:bg-gray-900 disabled:bg-gray-400 text-white font-bold rounded-md shadow-sm transition-colors text-base"
            >
              {isPending ? '확인 중...' : '가입 완료하기'}
            </button>
          </form>
        )}

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