'use client'

import { useState } from 'react'
import { generateInviteCodeAction } from '@/app/actions/auth'

export default function InviteGenerator() {
  const [inviteCode, setInviteCode] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleGenerate = async () => {
    setIsLoading(true)
    try {
      const result = await generateInviteCodeAction()
      if (result.success) {
        setInviteCode(result.code)
      }
    } catch (error) {
      if (error instanceof Error) {
        alert(error.message)
      } else {
        alert('알 수 없는 오류가 발생했습니다.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="mt-4">
      {inviteCode ? (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-center">
          <p className="text-sm text-gray-600 mb-2">24시간 동안 유효한 초대 코드입니다</p>
          <p className="text-3xl font-extrabold text-amber-600 tracking-widest">{inviteCode}</p>
          <button 
            onClick={() => {
              navigator.clipboard.writeText(inviteCode)
              alert('복사되었습니다!')
            }}
            className="mt-3 text-xs bg-white border border-gray-200 px-3 py-1.5 rounded hover:bg-gray-50 transition-colors text-gray-600"
          >
            복사하기
          </button>
        </div>
      ) : (
        <button 
          onClick={handleGenerate}
          disabled={isLoading}
          className="w-full py-3 bg-amber-100 text-amber-700 font-bold rounded-md hover:bg-amber-200 transition-colors text-sm disabled:opacity-50"
        >
          {isLoading ? '생성 중...' : '💌 일회성 초대 코드 생성하기'}
        </button>
      )}
    </div>
  )
}