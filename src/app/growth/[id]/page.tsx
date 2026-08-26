import { createSupabaseServerClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import MediaCarousel from '@/components/MediaCarousel'
import Link from 'next/link'
import Image from 'next/image'
import { redirect } from 'next/navigation'

type PostDetailType = {
  id: string
  image_url: string
  content: string | null
  created_at: string
  profiles: {
    display_name: string | null
    avatar_url: string | null
  } | null
}

export default async function GrowthDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createSupabaseServerClient()
  if (!supabase) {
      redirect(`/auth/login?error=${encodeURIComponent('서버 연결 오류가 발생했습니다.')}`)
  }

  const { data, error } = await supabase
    .from('posts')
    .select(`
      id,
      image_url,
      content,
      created_at,
      profiles ( display_name, avatar_url )
    `)
    .eq('id', id)
    .single()

  if (error || !data) {
    notFound()
  }

  const post = data as unknown as PostDetailType
  const author = post.profiles

  const dateString = new Date(post.created_at).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const mediaList = post.image_url
    .split(',')
    .map(url => url.trim()) // 앞뒤 공백 제거
    .filter(url => url !== '') // 빈 문자열 제거
    .map((url) => {
      const isVideo = url.toLowerCase().match(/\.(mp4|mov|webm)$/i)
      return {
        type: isVideo ? 'video' : 'image',
        url: url
      }
    })

  return (
    <main className="fixed inset-0 flex items-center justify-center bg-black/80 p-4 sm:p-8 backdrop-blur-sm">
      <Link 
        href="/growth" 
        className="absolute top-4 right-4 sm:top-6 sm:right-8 text-white text-3xl font-light hover:text-gray-300 transition-colors z-50"
      >
        ✕
      </Link>

      <div className="bg-white w-full max-w-5xl max-h-[90vh] rounded-xl overflow-hidden flex flex-col md:flex-row shadow-2xl relative">
        <div className="w-full md:w-[60%] bg-black flex items-center justify-center relative min-h-[40vh] md:min-h-0">
          <MediaCarousel media={mediaList} />
        </div>

        <div className="w-full md:w-[40%] flex flex-col h-full max-h-[50vh] md:max-h-[90vh] bg-white">
          <div className="flex items-center gap-3 p-4 border-b border-gray-100">
            <div className="w-9 h-9 bg-amber-100 rounded-full flex items-center justify-center text-lg shadow-inner overflow-hidden">
              {author?.avatar_url ? (
                <Image src={author.avatar_url} alt="프로필" width={36} height={36} className="object-cover w-full h-full" />
              ) : (
                "😀"
              )}
            </div>
            <p className="font-bold text-sm text-gray-900">{author?.display_name || '알 수 없음'}</p>
          </div>

          <div className="p-4 flex-1 overflow-y-auto scrollbar-hide">
            {post.content && (
              <div className="text-sm text-gray-800 leading-relaxed mb-4 whitespace-pre-wrap">
                <span className="font-bold mr-2">{author?.display_name}</span>
                {post.content}
              </div>
            )}
            <p className="text-[11px] text-gray-400 mt-1 mb-4">{dateString}</p>
          </div>
          
          <div className="p-4 border-t border-gray-100 bg-white">
            <div className="flex items-center gap-4 mb-3">
              <button className="text-2xl hover:scale-110 transition-transform origin-bottom-left">❤️</button>
              <button className="text-2xl hover:scale-110 transition-transform origin-bottom-left">💬</button>
            </div>
            <p className="text-sm font-bold text-gray-900 mb-3">좋아요 0개</p> 
            
            <div className="flex items-center gap-2 pt-2 border-t border-gray-50">
              <input 
                type="text" 
                placeholder="댓글 달기..." 
                className="flex-1 text-sm outline-none placeholder:text-gray-400 bg-transparent py-1" 
              />
              <button className="text-amber-500 font-bold text-sm hover:text-amber-600">게시</button>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}