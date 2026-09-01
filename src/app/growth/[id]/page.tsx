import { createSupabaseServerClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import MediaCarousel from '@/components/MediaCarousel'
import Link from 'next/link'
import Image from 'next/image'
import LikeButton from '@/components/LikeButton'
import CommentSection from '@/components/CommentSection'

type CommentType = {
  id: string
  content: string
  created_at: string
  parent_id: string | null
  user_id: string
  profiles: {
    display_name: string | null
    avatar_url: string | null
  } | null
}

type PostDetailType = {
  id: string
  image_url: string
  content: string | null
  created_at: string
  user_id: string
  profiles: {
    display_name: string | null
    avatar_url: string | null
  } | null
  likes: { 
    user_id: string 
    profiles: {
      display_name: string | null
      avatar_url: string | null
    } | null
  }[]
  comments: CommentType[]
}

export default async function GrowthDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createSupabaseServerClient()
  if (!supabase) {
      redirect(`/auth/login?error=${encodeURIComponent('서버 연결 오류가 발생했습니다.')}`)
  }

  const { data: { user } } = await supabase.auth.getUser()

  const { data, error } = await supabase
    .from('posts')
    .select(`
      id,
      image_url,
      content,
      created_at,
      author_id,
      profiles ( display_name, avatar_url ),
      likes ( 
        user_id,
        profiles:user_id ( display_name, avatar_url )  
      ),
      comments (
        id,
        content,
        created_at,
        parent_id,
        user_id,
        profiles:user_id ( display_name, avatar_url )
      )
    `)
    .eq('id', id)
    .single()

  if (error || !data) {
    console.log("상세 페이지 조회 에러:", error)
    notFound()
  }

  const post = data as unknown as PostDetailType
  const author = post.profiles

  const dateString = new Date(post.created_at).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const mediaList = (post.image_url || '')
    .split(',')
    .map(url => url.trim())
    .filter(url => url !== '')
    .map((url) => {
      const isVideo = url.toLowerCase().match(/\.(mp4|mov|webm)$/i)
      return {
        type: isVideo ? 'video' : 'image',
        url: url
      }
    })

  const totalLikes = post.likes?.length || 0
  const hasLiked = user ? post.likes?.some(like => like.user_id === user.id) : false

  return (
    <main className="fixed inset-0 flex items-center justify-center bg-[#FFF9F2]/50 p-4 sm:p-8 backdrop-blur-sm">
      <Link href="/growth" className="fixed inset-0 -z-10" />
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
            
            {user?.id === post.user_id && (
              <Link href={`/growth/${post.id}/edit`} className="text-xs text-gray-400 hover:text-amber-500 font-medium ml-auto">
                수정
              </Link>
            )}
          </div>

          <div className="p-4 flex-1 overflow-y-auto scrollbar-hide flex flex-col gap-4">
            {post.content && (
              <div className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
                <span className="font-bold mr-2">{author?.display_name}</span>
                {post.content}
              </div>
            )}
            <p className="text-[11px] text-gray-400">{dateString}</p>

            {post.likes && post.likes.length > 0 && (
              <div className="flex flex-col gap-1.5 pt-2 border-t border-gray-100">
                <p className="text-xs font-bold text-gray-500">좋아요 {post.likes.length} 개</p>
                <div className="flex flex-col gap-1 max-h-24 overflow-y-auto scrollbar-hide">
                  {post.likes.map((like) => (
                    <div key={like.user_id} className="flex items-center gap-2 text-xs text-gray-800">
                      <div className="w-4 h-4 bg-amber-100 rounded-full overflow-hidden flex items-center justify-center shrink-0">
                        {like.profiles?.avatar_url ? (
                          <Image src={like.profiles.avatar_url} alt="프로필" width={16} height={16} className="object-cover w-full h-full" />
                        ) : (
                          "😀"
                        )}
                      </div>
                      <span className="font-semibold">{like.profiles?.display_name || '알 수 없음'}</span>님이 좋아합니다.
                    </div>
                  ))}
                </div>
              </div>
            )}

            <CommentSection postId={post.id} comments={post.comments || []} currentUserId={user?.id} />
          </div>
          
          <div className="p-4 border-t border-gray-100 bg-white">
            <div className="flex items-center gap-4 mb-2">
              <LikeButton postId={post.id} initialHasLiked={hasLiked} totalLikes={totalLikes} />
            </div>
          </div>

        </div>
      </div>
    </main>
  )
}