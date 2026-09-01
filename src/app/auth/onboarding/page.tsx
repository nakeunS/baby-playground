import { createSupabaseServerClient } from '@/lib/supabase/server'
import { createFamily, joinFamily, updateFamilyName, kickMember } from '@/app/actions/auth'
import Image from 'next/image'
import { redirect } from 'next/navigation'
import InviteGenerator from './InviteGenerator'

export default async function OnboardingPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams
  const supabase = await createSupabaseServerClient()
  if (!supabase) {
      redirect(`/auth/login?error=${encodeURIComponent('서버 연결 오류가 발생했습니다.')}`)
  }
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select(`
      *,
      families ( name )
    `)
    .eq('id', user.id)
    .single()

  const hasFamily = !!profile?.family_id
  const isOwner = profile?.role === 'owner'
  const familyName = profile?.families?.name || '우리 가족'

  if (hasFamily) {
    const { data: members } = await supabase
      .from('profiles')
      .select('*')
      .eq('family_id', profile.family_id)

    return (
      <main className="min-h-screen flex items-center justify-center pt-15 pb-15 bg-[#FFF9F2] p-4">
        <div className="w-full max-w-md flex flex-col gap-6">
          <div className="text-center mb-4">
            <h1 className="text-2xl font-extrabold text-gray-800">{familyName}</h1>
            <p className="text-sm text-gray-500 mt-1">
              {isOwner ? '가족 정보를 관리하고 멤버를 초대하세요.' : '우리 가족 멤버 목록입니다.'}
            </p>
          </div>

          {isOwner && (
            <section className="bg-white p-6 rounded-xl border border-amber-200 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-amber-400" />
              <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                👑 방장 메뉴
              </h2>
              
              <form action={updateFamilyName} className="flex gap-2 mb-4">
                <input 
                  name="newFamilyName" 
                  defaultValue={familyName}
                  required
                  className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm text-gray-800 focus:ring-2 focus:ring-amber-300 outline-none"
                />
                <button className="px-4 py-2 bg-gray-800 text-white text-sm font-bold rounded-md hover:bg-gray-700">
                  이름 변경
                </button>
              </form>
              <InviteGenerator/>
            </section>
          )}

          <section className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h2 className="text-lg font-bold text-gray-800 mb-4">가족 구성원 ({members?.length}명)</h2>
            <div className="flex flex-col gap-3">
              {members?.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center font-bold overflow-hidden">
                      {member.avatar_url ? (
                        <Image src={member.avatar_url} alt="프사" width={40} height={40} className="object-cover w-full h-full" />
                      ) : (
                        member.display_name?.charAt(0) || '익'
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-gray-800 flex items-center gap-1">
                        {member.display_name}
                        {member.role === 'owner' && <span className="text-xs bg-amber-100 text-amber-600 px-2 py-0.5 rounded-full">방장</span>}
                      </p>
                    </div>
                  </div>

                  {isOwner && member.id !== user.id && (
                    <form action={kickMember}>
                      <input type="hidden" name="memberId" value={member.id}/>
                      <button type="submit" className="text-xs text-red-500 hover:bg-red-50 px-2 py-1 rounded-md transition-colors">
                        내보내기
                      </button>
                    </form>
                  )}
                </div>
              ))}
            </div>
          </section>

        </div>
      </main>
    )
  }

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