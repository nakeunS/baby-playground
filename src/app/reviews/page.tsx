import { Suspense } from 'react'
import { getReview } from '@/data/review'
import ReviewClientView from '@/components/review/ReviewClientView'

export default async function ReviewsPage() {
  const { items, places } = await getReview()

  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#FFF9F2] flex items-center justify-center">
        <p className="text-gray-500 font-medium">정보를 불러오는 중...</p>
      </div>
    }>
      <ReviewClientView initialItems={items} initialPlaces={places} />
    </Suspense>
  )
}