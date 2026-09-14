import { getReviewItemById } from '@/data/review'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import EditItemForm from '@/components/review/EditItemForm'

interface EditPageProps {
  params: Promise<{ id: string }>
}

type ReviewItem = {
  id: string
  title: string
  price: string | null
  image_url: string | null
  image_urls?: string[] | null
  product_link: string | null
  category: string | null
  content: string | null
  rating: number
  created_at: string
  purchase_date: string
  profiles: { display_name: string | null; avatar_url: string | null } | null
}

export default async function EditItemPage({ params }: EditPageProps) {

  const { id } = await params

  let item: ReviewItem | null = null
  try {
    item = (await getReviewItemById(id)) as ReviewItem
  } catch (error) {
    console.error('데이터 조회 실패:', error)
  }

  if (!item) {
    return (
      <main className="min-h-screen bg-[#FFF9F2] flex flex-col items-center justify-center p-4">
        <p className="text-gray-500 font-medium mb-4">수정할 게시글을 찾을 수 없습니다.</p>
        <Link href="/reviews" className="px-4 py-2 bg-amber-500 text-white rounded-lg font-bold">
          목록으로 돌아가기
        </Link>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#FFF9F2] pb-24 px-4 pt-20">
      <div className="max-w-md mx-auto bg-white rounded-lg p-5 shadow-sm border border-gray-100 relative">
        <div className="flex items-center justify-between mb-6 border-b border-gray-100 pb-3">
          <Link href={`/reviews/items/${id}`} className="flex items-center gap-1 text-xs font-bold text-gray-700 hover:text-black">
            <ChevronLeft className="w-5 h-5" /> 상세로 돌아가기
          </Link>
          <h1 className="font-extrabold text-gray-800 text-base">육아템 수정하기</h1>
        </div>

        <EditItemForm id={id} item={item} />
      </div>
    </main>
  )
}