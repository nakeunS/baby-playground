import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import PlaceForm from '@/components/review/PlaceForm'

export const metadata = {
  title: '나들이 장소 추천하기',
}

export default async function NewPlacePage() {
  // 서버 측에서 로그인 여부 사전 검증 가능
  const supabase = await createSupabaseServerClient()
  if (!supabase) redirect('/auth/login')

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  return (
    <main className="min-h-screen bg-[#FFF9F2] pb-24 px-4 pt-20">
      <div className="max-w-md mx-auto bg-white rounded-lg p-5 shadow-sm border border-gray-100 relative">
        <div className="flex items-center justify-between mb-6 border-b border-gray-100 pb-3">
          <Link href="/reviews?tab=places" className="flex items-center gap-1 text-xs font-bold text-gray-700 hover:text-black">
            <ChevronLeft className="w-5 h-5" /> 목록으로
          </Link>
          <h1 className="font-extrabold text-gray-800 text-base">나들이 장소 추천하기</h1>
        </div>

        {/* 클라이언트 컴포넌트 호출 */}
        <PlaceForm />
      </div>
    </main>
  )
}