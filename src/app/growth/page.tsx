import Link from 'next/link'
import Image from 'next/image'

// 임시 데이터 (사진 여러 장, 동영상 포함)
export const mockPosts = [
  {
    id: '1',
    author: '튼튼이 엄마',
    avatar: '👩',
    // 💡 미디어 배열: 여러 장의 사진과 동영상을 지원합니다.
    media: [
      { type: 'image', url: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&w=500&q=80' },
      { type: 'image', url: 'https://images.unsplash.com/photo-1522771930-78848d9293e8?auto=format&fit=crop&w=500&q=80' }
    ],
    content: '오늘 처음으로 뒤집기에 성공했어요! 너무 감격스러운 순간 😭',
    time: '2시간 전',
    likes: 12,
  },
  {
    id: '2',
    author: '멋쟁이 아빠',
    avatar: '👨',
    media: [
      // 💡 동영상 테스트용 임시 URL
      { type: 'video', url: 'https://www.w3schools.com/html/mov_bbb.mp4' } 
    ],
    content: '주말엔 역시 아빠랑 촉감놀이 🎨',
    time: '어제',
    likes: 8,
  }
]

export default function GrowthGridPage() {
  return (
    <main className="min-h-screen bg-[#FFF9F2] sm:p-4">
      <div className="max-w-md mx-auto bg-white sm:rounded-xl sm:border border-gray-100 min-h-screen sm:min-h-0 sm:pb-4">
        <div className="flex items-center justify-between p-4 border-b border-gray-100 sticky top-14 bg-[#FFF9F2] z-40">
          <h1 className="font-extrabold text-gray-800 text-lg">성장기록</h1>
          <Link href="/growth/new" className="text-sm font-bold text-amber-500 bg-amber-50 px-3 py-1.5 rounded-full">
            ➕ 기록하기
          </Link>
        </div>

        {/* 📱 3열 바둑판(Grid) 영역 */}
        <div className="grid grid-cols-3 pt-13 gap-1">
          {mockPosts.map((post) => {
            const isMultiple = post.media.length > 1;
            const isVideo = post.media[0].type === 'video';

            return (
              <Link key={post.id} href={`/growth/${post.id}`} className="relative aspect-square bg-gray-100 group">
                {isVideo ? (
                  <video src={post.media[0].url} className="w-full h-full object-cover" muted playsInline />
                ) : (
                  <Image 
                    src={post.media[0].url}
                    alt="썸네일"
                    width={16} height={16} unoptimized={true} 
                    className="w-full h-full object-cover"
                  />
                )}

                <div className="absolute top-2 right-2 text-white drop-shadow-md">
                  {isMultiple && <span className="text-sm">⧉</span>}
                  {!isMultiple && isVideo && <span className="text-sm">▶️</span>}
                </div>
                
                <div className="absolute inset-0 bg-black/0 group-active:bg-black/20 transition-colors" />
              </Link>
            )
          })}
        </div>

      </div>
    </main>
  )
}