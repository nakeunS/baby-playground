import Link from 'next/link'
import Image from 'next/image'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

type PostType = {
  id: string
  image_url: string
  content: string | null
  created_at: string
  profiles: {
    display_name: string | null
    avatar_url: string | null
  } | null
}

export default async function GrowthGridPage() {
  const supabase = await createSupabaseServerClient()
  if (!supabase) {
      redirect(`/auth/login?error=${encodeURIComponent('서버 연결 오류가 발생했습니다.')}`)
  }
  const { data: { user } } = await supabase.auth.getUser()

  let posts: PostType[] = []
  let isOwner = false

  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('family_id, role')
      .eq('id', user.id)
      .single()

    if( profile?.role === 'owner' ){
      isOwner = true
    }

    if (profile?.family_id) {
      const { data } = await supabase
        .from('posts')
        .select(`
          id,
          image_url,
          content,
          created_at,
          profiles ( display_name, avatar_url )
        `)
        .eq('family_id', profile.family_id)
        .order('created_at', { ascending: false })

      if (data) {
        posts = data as unknown as PostType[]
      }
    }
  }

  return (
    <main className="min-h-screen bg-[#FFF9F2] pb-24">
      <div className="max-w-md mx-auto bg-white rounded-xl border border-gray-100 min-h-[80vh] pb-4">
        
        <div className="flex items-center justify-between p-4 border-b border-gray-100 sticky top-14 bg-[#FFF9F2] z-40">
          <h1 className="font-extrabold text-gray-800 text-lg">성장기록</h1>
          {isOwner && (
            <Link href="/growth/new" className="text-sm font-bold text-amber-500 bg-amber-50 py-1.5 rounded-full transition-colors hover:bg-amber-100">
              + 기록하기
            </Link>
          )}
        </div>

        {posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center pt-32 pb-20 text-gray-400">
            <span className="text-5xl mb-4">📸</span>
            <p>아직 등록된 사진이 없어요.</p>
            <p className="text-sm">첫 번째 성장 기록을 남겨보세요!</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 pt-15 pd-15 gap-1 mt-1">
            {posts.map((post) => {
              const firstMediaUrl = post.image_url ? post.image_url.split(',')[0] : ''
              const isVideo = firstMediaUrl.toLowerCase().match(/\.(mp4|mov|webm)$/i)

              const videoSourceUrl = isVideo ? `${firstMediaUrl}#t=0.001` : firstMediaUrl
              return (
                <Link key={post.id} href={`/growth/${post.id}`} className="relative aspect-square bg-gray-100 group">
                  {isVideo ? (
                    <video 
                      src={videoSourceUrl} 
                      className="w-full h-full object-cover" muted playsInline
                      preload="metadata" />
                  ) : (
                    <Image 
                      src={firstMediaUrl}
                      alt="썸네일"
                      width={150} height={150}
                      unoptimized={true} 
                      className="w-full h-full object-cover"
                    />
                  )}

                  <div className="absolute top-2 right-2 text-white drop-shadow-md">
                    {isVideo && <span className="text-sm">▶️</span>}
                  </div>
                  
                  <div className="absolute inset-0 bg-black/0 group-active:bg-black/20 transition-colors" />
                </Link>
              )
            })}
          </div>
        )}

      </div>
    </main>
  )
}