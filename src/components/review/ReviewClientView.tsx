'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Baby, Car } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { RecommendItem, RecommendPlace } from '@/data/review'

interface ReviewClientViewProps {
  initialItems: RecommendItem[]
  initialPlaces: RecommendPlace[]
}

export default function ReviewClientView({ initialItems, initialPlaces }: ReviewClientViewProps) {
  const searchParams = useSearchParams()
  const tabParam = searchParams.get('tab')

  const [activeTab, setActiveTab] = useState<'items' | 'places'>(
    tabParam === 'places' ? 'places' : 'items'
  )
  
  const items = initialItems
  const places = initialPlaces

  return (
    <main className="min-h-screen bg-[#FFF9F2] pb-24 px-4 pt-15">
      <div className="max-w-md mx-auto">
        
        <div className="flex items-center justify-between mb-4 px-1">
          <div>
            <h1 className="font-extrabold text-gray-800 text-2xl flex items-center gap-2">
              {activeTab === 'items' ? (
                <><Baby className="w-7 h-7 text-amber-500" /> 육아템 추천</>
              ) : (
                <><Car className="w-7 h-7 text-amber-500" /> 나들이 추천</>
              )}
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              {activeTab === 'items' ? '실사용 후기와 유용한 팁을 공유해요!' : '아이와 함께 가기 좋은 장소를 공유해요!'}
            </p>
          </div>
          <Link 
            href={activeTab === 'items' ? '/reviews/items/new' : '/reviews/places/new'} 
            className="text-sm font-bold text-amber-600 bg-white border border-amber-200 py-2 px-4 rounded-lg shadow-sm hover:bg-amber-50 transition-colors shrink-0"
          >
            + 리뷰쓰기
          </Link>
        </div>

        <div className="flex bg-white p-1 rounded-lg border border-gray-100 shadow-xs mb-6">
          <button
            onClick={() => setActiveTab('items')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'items' 
                ? 'bg-amber-500 text-white shadow-sm' 
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            육아템 추천
          </button>
          <button
            onClick={() => setActiveTab('places')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'places' 
                ? 'bg-amber-500 text-white shadow-sm' 
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            나들이 추천
          </button>
        </div>

        {activeTab === 'items' && (
          items.length === 0 ? (
            <div className="flex flex-col items-center justify-center pt-20 pb-20 text-gray-400 bg-white rounded-lg border border-dashed border-amber-200 p-6">
              <span className="text-5xl mb-3">🛒</span>
              <p className="font-bold text-gray-600">아직 추천된 아기템이 없어요.</p>
              <p className="text-xs text-gray-400 mt-1">나만 알고 있는 꿀템을 소개해주세요!</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {items.map((item) => {
                const firstImage = item.image_url ? item.image_url.split(',')[0] : '/placeholder.svg'
                const formattedDate = item.created_at ? new Date(item.created_at).toLocaleDateString() : ''
                const authorName = item.profiles?.display_name || '익명'

                return (
                  <Link 
                    key={item.id} 
                    href={`/reviews/items/${item.id}`}
                    className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden flex flex-col hover:border-amber-300 transition-all"
                  >
                    <div className="relative aspect-square bg-gray-50">
                      <Image src={firstImage} alt={item.title} width={200} height={200} unoptimized={true} className="w-full h-full object-cover" />
                    </div>
                    <div className="p-3 flex flex-col flex-1 justify-between gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md">
                            {item.category || '육아템'}
                          </span>
                          <div className="flex items-center gap-0.5 text-xs font-bold text-gray-700">
                            <span className="text-amber-400">★</span> {item.rating ?? 5}
                          </div>
                        </div>
                        <h2 className="font-bold text-gray-800 text-sm line-clamp-1">{item.title}</h2>
                        {item.content && (
                          <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{item.content}</p>
                        )}
                      </div>
                      
                      <div className="pt-2 border-t border-gray-50 flex items-center justify-between text-[10px] text-gray-400">
                        <span className="font-medium text-gray-600">작성자: {authorName}</span>
                        <span>{formattedDate}</span>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          )
        )}

        {activeTab === 'places' && (
          places.length === 0 ? (
            <div className="flex flex-col items-center justify-center pt-20 pb-20 text-gray-400 bg-white rounded-lg border border-dashed border-amber-200 p-6">
              <span className="text-5xl mb-3">🎡</span>
              <p className="font-bold text-gray-600">아직 등록된 나들이 장소가 없어요.</p>
              <p className="text-xs text-gray-400 mt-1">아이와 함께 다녀온 좋은 곳을 공유해주세요!</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {places.map((place) => {
                const firstImage = place.image_url ? place.image_url.split(',')[0] : '/placeholder.svg'
                const formattedDate = place.created_at ? new Date(place.created_at).toLocaleDateString() : ''
                const authorName = place.profiles?.display_name || '익명'

                return (
                  <Link 
                    key={place.id} 
                    href={`/reviews/places/${place.id}`}
                    className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden flex flex-col hover:border-amber-300 transition-all"
                  >
                    <div className="relative aspect-square bg-gray-50">
                      <Image src={firstImage} alt={place.title} width={200} height={200} unoptimized={true} className="w-full h-full object-cover" />
                    </div>
                    <div className="p-3 flex flex-col flex-1 justify-between gap-2">
                      <div className="flex items-center justify-between">
                        <h2 className="font-bold text-gray-800 text-sm line-clamp-1">{place.title}</h2>
                        <div className="flex items-center gap-0.5 text-xs font-bold text-gray-700">
                          <span className="text-amber-400">★</span> {place.rating}
                        </div>
                      </div>
                      
                      {place.store_name && (
                        <p className="text-[11px] text-gray-400 line-clamp-1">{place.store_name}</p>
                      )}

                      <div className="pt-2 border-t border-gray-50 flex items-center justify-between text-[10px] text-gray-400">
                        <span className="font-medium text-gray-600">작성자: {authorName}</span>
                        <span>{formattedDate}</span>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          )
        )}

      </div>
    </main>
  )
}