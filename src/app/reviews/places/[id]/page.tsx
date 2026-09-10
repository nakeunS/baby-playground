import { getReviewPlaceById } from '@/data/review'
import { deleteReviewPlace } from '@/app/actions/review'
import Link from 'next/link'
import Image from 'next/image'
import { ChevronLeft, Edit3, MapPin, ExternalLink, Calendar, User, Store, Car, RotateCw, Star } from 'lucide-react'
import DeleteButton from '@/components/common/DeleteButton'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function PlaceDetailPage({ params }: PageProps) {
  const { id } = await params

  let place = null
  let errorMessage = ''

  try {
    place = await getReviewPlaceById(id)
  } catch (error: unknown) {
    if (error instanceof Error) {
      errorMessage = error.message
    } else {
      errorMessage = '알 수 없는 오류가 발생했습니다.'
    }
  }

  if (errorMessage || !place) {
    return (
      <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <p className="text-gray-500 font-medium mb-4">해당 추천글을 찾을 수 없습니다.</p>
        <Link href="/reviews?tab=places" className="px-4 py-2 bg-amber-500 text-white rounded-xl font-bold text-xs">
          목록으로 돌아가기
        </Link>
      </main>
    )
  }

  const images: string[] = place.image_urls 
      ? place.image_urls 
      : place.image_url 
        ? place.image_url.split(',') 
        : ['/placeholder.svg']
  
  const formattedDate = place.created_at ? new Date(place.created_at).toISOString().split('T')[0] : ''
  const visitedDate = place.visited_at ? new Date(place.visited_at).toISOString().split('T')[0] : ''
  const authorName = place.profiles?.display_name || '익명'
  const isParkingAvailable = String(place.has_parking) === "true";
  const isRevisitIntended = String(place.will_revisit) === "true";

  const handleDelete = async () => {
    'use server'
    await deleteReviewPlace(id)
  }

  return (
    <main className="min-h-screen bg-gray-50 pt-14">
      <div className="max-w-md mx-auto bg-white min-h-screen shadow-sm relative pb-20">
        <div className="sticky top-0 bg-white/90 backdrop-blur-md z-10 border-b border-gray-100 flex items-center justify-between p-4">
          <Link href="/reviews?tab=places" className="flex items-center gap-1 text-xs font-bold text-gray-700 hover:text-black">
            <ChevronLeft className="w-5 h-5" /> 리뷰 목록
          </Link>
          <div className="flex items-center gap-2">
            <Link 
              href={`/reviews/places/${id}/edit`}
              className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-lg transition-colors"
            >
              <Edit3 className="w-3.5 h-3.5" /> 수정
            </Link>
            <DeleteButton onDeleteAction={handleDelete} />
          </div>
        </div>

        {/* 이미지 스와이프 영역 */}
        <div className="relative w-full aspect-square bg-gray-100 flex overflow-x-auto snap-x snap-mandatory scrollbar-hide">
          {images.map((img: string, idx: number) => (
            <div key={idx} className="w-full h-full shrink-0 snap-center relative">
              <Image src={img} alt={`${place.title} 사진 ${idx + 1}`} fill unoptimized className="object-cover" />
            </div>
          ))}
          {images.length > 1 && (
            <div className="absolute bottom-3 right-3 bg-black/50 text-white text-[10px] px-2 py-1 rounded-full font-medium">
              여러 장 스와이프
            </div>
          )}
        </div>

        <div className="p-5 space-y-5">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-3">
              {/* <span className={`rounded-md px-3 py-1 text-sm font-bold ${badgeClass}`}>
                {badgeLabel}
              </span> */}
              <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-black text-[#17202a] border-[#eadcc7] bg-[#fffdf8]`}>
                <Star size={16} fill="#f2b84b" color="#f2b84b" />
                {place.rating}
                <span className="font-normal text-[#8c9ba5]">/ 5.0</span>
              </span>
            </div>

            <h1 className="text-xl font-extrabold text-gray-900 break-keep leading-tight pt-1">
              {place.title}
            </h1>

            {place.address && (
              <div className="flex items-center gap-1.5 text-xs text-gray-600 pt-1">
                <MapPin className="w-4 h-4 text-amber-500 shrink-0" />
                <span>{place.address}</span>
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500 border-t border-gray-100 pt-3">
            <div className="flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-gray-400" />
              <span className="font-medium text-gray-700">작성자: {authorName}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-gray-400" />
              <span>작성일 {formattedDate}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-gray-400" />
              <span>방문일 {visitedDate}</span>
            </div>
          </div>

          <section className="mt-8 rounded-lg border border-[#ddd6cc] bg-[#fbfaf7] p-6 shadow-sm sm:p-8">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#7a6f63]">
              Place Info & Tips
            </h2>
            <div className="mt-4 grid gap-4">
              <div className={`flex items-start gap-3 rounded-md border bg-white p-4 border-[#eadcc7] sm:col-span-2`}>
                <Store className={`mt-0.5 shrink-0 text-[#e57632]`} size={18} />
                <div>
                  <p className="text-xs font-bold text-[#7a6f63]">상호명</p>
                  <p className="mt-0.5 font-bold text-[#17202a]">
                    {place.store_name || "-"}
                  </p>
                </div>
              </div>              

              {place.address ? (
                <div className={`flex items-start gap-3 rounded-md border bg-white p-4 sm:col-span-2 border-[#eadcc7]`}>
                  <MapPin className={`mt-0.5 shrink-0 text-[#e57632]`} size={18} />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-[#7a6f63]">주소</p>
                    <p className="mt-0.5 wrap=break-words font-medium text-[#17202a]">
                      {place.address}
                    </p>
                  </div>
                  {place.map_url ? (
                    <a
                      href={place.map_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`inline-flex shrink-0 items-center gap-1 rounded px-2.5 py-1.5 text-xs font-bold text-white transition bg-[#e57632] hover:bg-[#a83f3d]`}
                    >
                      지도 보기
                      <ExternalLink size={12} />
                    </a>
                  ) : null}
                </div>
              ) : null}

              <div className="flex items-start gap-3 rounded-md border border-[#eadcc7] bg-white p-4 sm:col-span-2">
                <Car
                  className={`mt-0.5 shrink-0 ${
                    isParkingAvailable ? "text-blue-600" : "text-gray-400"
                  }`}
                  size={18}
                />
                <div>
                  <p className="text-xs font-bold text-[#7a6f63]">주차 여부</p>
                  <p
                    className={`mt-0.5 font-bold ${
                      isParkingAvailable ? "text-blue-600" : "text-gray-600"
                    }`}
                  >
                    {isParkingAvailable ? "주차 가능" : "주차 불가"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-md border border-[#eadcc7] bg-white p-4 sm:col-span-2">
                <RotateCw
                  className={`mt-0.5 shrink-0 ${
                    isRevisitIntended ? "text-green-600" : "text-gray-400"
                  }`}
                  size={18}
                />
                <div>
                  <p className="text-xs font-bold text-[#7a6f63]">재방문 의사</p>
                  <p
                    className={`mt-0.5 font-bold ${
                      isRevisitIntended ? "text-green-600" : "text-gray-600"
                    }`}
                  >
                    {isRevisitIntended
                      ? "무조건 또 갈 거예요"
                      : "이번 한 번으로 만족해요"}
                  </p>
                </div>
              </div>
            </div>
          </section>

          <div className="bg-amber-50/50 border border-amber-100 rounded-2xl p-4 space-y-2">
            <h2 className="text-xs font-extrabold text-amber-800 uppercase tracking-wider">💡 육아 꿀팁 및 후기</h2>
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
              {place.content || '작성된 후기 내용이 없습니다.'}
            </p>
          </div>

        </div>

      </div>
    </main>
  )
}