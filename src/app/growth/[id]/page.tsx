import { mockPosts } from '../page'
import MediaCarousel from '@/components/MediaCarousel'
import Link from 'next/link'

export default async function GrowthDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const post = mockPosts.find(p => p.id === id) || mockPosts[0]

  return (
    <main className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 sm:p-8 backdrop-blur-sm">
      <Link 
        href="/growth" 
        className="absolute top-4 right-4 sm:top-6 sm:right-8 text-white text-3xl font-light hover:text-gray-300 transition-colors z-50"
      >
        ✕
      </Link>

      <div className="bg-white w-full max-w-5xl max-h-[90vh] rounded-xl overflow-hidden flex flex-col md:flex-row shadow-2xl relative">
        <div className="w-full md:w-[60%] bg-black flex items-center justify-center relative min-h-[40vh] md:min-h-0">
          <MediaCarousel media={post.media} />
        </div>

        <div className="w-full md:w-[40%] flex flex-col h-full max-h-[50vh] md:max-h-[90vh] bg-white">
          <div className="flex items-center gap-3 p-4 border-b border-gray-100">
            <div className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center text-lg shadow-inner">{post.avatar}</div>
            <p className="font-bold text-sm text-gray-900">{post.author}</p>
          </div>

          <div className="p-4 flex-1 overflow-y-auto scrollbar-hide">
            <div className="text-sm text-gray-800 leading-relaxed mb-4">
              <span className="font-bold mr-2">{post.author}</span>
              {post.content}
            </div>
            <p className="text-[11px] text-gray-400 mt-1 mb-4">{post.time}</p>
            
            {/* 나중에 이곳에 댓글 목록이 추가될 수 있습니다 */}
          </div>
          
          <div className="p-4 border-t border-gray-100 bg-white">
            <div className="flex items-center gap-4 mb-3">
              <button className="text-2xl hover:scale-110 transition-transform origin-bottom-left">❤️</button>
              <button className="text-2xl hover:scale-110 transition-transform origin-bottom-left">💬</button>
            </div>
            <p className="text-sm font-bold text-gray-900 mb-3">좋아요 {post.likes}개</p>
            
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