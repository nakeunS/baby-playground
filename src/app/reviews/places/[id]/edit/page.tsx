import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { getReviewPlaceById } from '@/data/review'
import EditPlaceForm from '@/components/review/EditPlaceForm'

type ReviewPlace = {
  id: string
  title: string
  store_name: string
  address: string | null
  latitude: number | null
  longitude: number | null
  place_id: string | null
  map_url: string | null
  rating: number | null
  visited_at: string | null
  has_parking: string | null
  will_revisit: string | null
  content: string | null
  image_url: string | null
  image_urls?: string[] | null
}
interface EditPlacePageProps {
  params: Promise<{ id: string }>
}

export default async function EditPlacePage({ params }: EditPlacePageProps) {
  const { id } = await params

  let place: ReviewPlace | null = null
  try {
    place = (await getReviewPlaceById(id)) as ReviewPlace
  } catch (error) {
    console.error('장소 데이터 조회 실패:', error)
  }

  if (!place) {
    return (
      <main className="min-h-screen bg-[#FFF9F2] flex flex-col items-center justify-center p-4">
        <p className="text-gray-500 font-medium mb-4">수정할 장소 정보를 찾을 수 없습니다.</p>
        <Link href="/reviews?tab=places" className="px-4 py-2 bg-amber-500 text-white rounded-lg font-bold">
          목록으로 돌아가기
        </Link>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#FFF9F2] pb-24 px-4 pt-20">
      <div className="max-w-md mx-auto bg-white rounded-lg p-5 shadow-sm border border-gray-100 relative">
        <div className="flex items-center justify-between mb-6 border-b border-gray-100 pb-3">
          <Link href={`/reviews/places/${id}`} className="flex items-center gap-1 text-xs font-bold text-gray-700 hover:text-black">
            <ChevronLeft className="w-5 h-5" /> 상세로 돌아가기
          </Link>
          <h1 className="font-extrabold text-gray-800 text-base">나들이 장소 수정하기</h1>
        </div>

        <EditPlaceForm id={id} place={place} />
      </div>
    </main>
  )
}