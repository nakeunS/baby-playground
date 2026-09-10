'use client'

import { useState, useEffect } from 'react'
import { getReviewPlaceById } from '@/data/review'
import { updateReviewPlace } from '@/app/actions/review'
import Link from 'next/link'
import Image from 'next/image'
import { ChevronLeft, X, ImagePlus } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import { PlaceSearch } from '@/components/review/PlaceSearch'
import { ReactNode } from 'react'

export type SelectedPlaceData = {
  storeName: string;
  address: string;
  latitude: number;
  longitude: number;
  placeId: string;
  mapUrl: string;
  photoUrl?: string;
};

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

function FieldLabel({
  children,
  required = false,
}: {
  children: ReactNode;
  required?: boolean;
}) {
  return (
    <span className="block text-xs font-bold text-gray-700 mb-1">
      {children}
      {required ? (
        <span className="text-[#e57632]" aria-label="필수 입력">
          *
        </span>
      ) : (
        <span className="rounded bg-[#eee5dc] px-1.5 py-0.5 text-[11px] font-bold text-[#7a6f63]">
          선택
        </span>
      )}
    </span>
  );
}

export default function EditPlacePage() {
  const params = useParams()
  const router = useRouter()
  const id = params?.id as string

  const [loading, setLoading] = useState<boolean>(true)
  const [submitting, setSubmitting] = useState<boolean>(false)
  const [place, setPlace] = useState<ReviewPlace | null>(null)

  const focusInputClass = "focus:border-[#e57632]";

  const [placeData, setPlaceData] = useState<SelectedPlaceData | null>(null)

  // 기존 이미지와 새로 추가할 이미지 상태 분리 관리
  const [existingImages, setExistingImages] = useState<string[]>([])
  const [newImageFiles, setNewImageFiles] = useState<File[]>([])
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([])

  useEffect(() => {
    const script = document.createElement('script')
    script.src = '//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js'
    script.async = true
    document.body.appendChild(script)
  }, [])

  useEffect(() => {
    async function fetchPlace() {
      try {
        const data = (await getReviewPlaceById(id)) as ReviewPlace
        setPlace(data)

        setPlaceData({
          storeName: data.store_name || '',
          address: data.address || '',
          latitude: data.latitude || 0,
          longitude: data.longitude || 0,
          placeId: data.place_id || '',
          mapUrl: data.map_url || '',
          photoUrl: data.image_url || '',
        })
        
        const parsedImages = data.image_urls 
          ? data.image_urls 
          : data.image_url 
            ? data.image_url.split(',').map((url: string) => url.trim()).filter(Boolean)
            : []
            
        setExistingImages(parsedImages)
      } catch (error: unknown) {
        if (error instanceof Error) {
          alert(error.message)
        } else {
          alert('데이터를 불러오지 못했습니다.')
        }
      } finally {
        setLoading(false)
      }
    }
    if (id) {
      fetchPlace()
    }
  }, [id])

  const handleNewImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return
    const filesArray = Array.from(e.target.files)
    
    setNewImageFiles((prev: File[]) => [...prev, ...filesArray])
    const newPreviews = filesArray.map((file: File) => URL.createObjectURL(file))
    setNewImagePreviews((prev: string[]) => [...prev, ...newPreviews])
  }

  const handleRemoveExistingImage = (index: number) => {
    setExistingImages((prev: string[]) => prev.filter((_, i: number) => i !== index))
  }

  const handleRemoveNewImage = (index: number) => {
    setNewImageFiles((prev: File[]) => prev.filter((_, i: number) => i !== index))
    setNewImagePreviews((prev: string[]) => prev.filter((_, i: number) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSubmitting(true)

    const formElement = e.currentTarget
    const formData = new FormData(formElement)

    formData.append('existing_images', JSON.stringify(existingImages))

    newImageFiles.forEach((file: File) => {
      formData.append('images', file)
    })

    try {
      await updateReviewPlace(id, formData)
      router.push(`/reviews/places/${id}`)
    } catch (error: unknown) {
      if (error instanceof Error) {
        alert(error.message)
      } else {
        alert('수정 중 알 수 없는 오류가 발생했습니다.')
      }
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#FFF9F2] flex items-center justify-center">
        <p className="text-gray-500 font-medium">불러오는 중...</p>
      </main>
    )
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

        <form onSubmit={handleSubmit} className="space-y-4">
          <div> 
            <label className="block text-xs font-bold text-gray-700 mb-1">
              제목 <span className="text-[#e57632]" aria-label="필수 입력">*</span>
            </label>
            <input 
              type="text" 
              name="title"
              defaultValue={place.title}
              required
              className="w-full rounded-md border border-[#d8cfc2] bg-[#fbfaf7] px-4 py-3 text-base text-gray-700 font-normal outline-none transition focus:border-[#e57632] focus:bg-white"
            />
          </div>

          <div>
            <PlaceSearch
              onSelectPlace={(data) => setPlaceData(data as SelectedPlaceData)}
              label={"나들이 장소 검색"}
              description={"Kakao Maps에서 장소를 선택하면 상호명, 주소가 자동으로 입력됩니다."}
              placeholder={"예: 성수 키즈카페, 홍대 키즈카페"}
            />
          </div>

          <input type="hidden" name="storeName" value={placeData?.storeName ?? ""} />
          <input type="hidden" name="address" value={placeData?.address ?? ""} />
          <input type="hidden" name="latitude" value={placeData?.latitude ?? 0} />
          <input type="hidden" name="longitude" value={placeData?.longitude ?? 0} />
          <input type="hidden" name="placeId" value={placeData?.placeId ?? ""} />
          <input type="hidden" name="map_url" value={placeData?.mapUrl ?? ""} />

          <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-gray-700">장소 사진 관리 (여러 장 가능)</label>
            </div>

            <label className="flex items-center justify-center gap-2 border border-dashed border-amber-400 bg-white rounded-lg p-3 cursor-pointer hover:bg-amber-50/50 transition-colors">
              <ImagePlus className="w-5 h-5 text-amber-500" />
              <span className="text-xs text-gray-600 font-medium">새 사진 추가하기</span>
              <input type="file" accept="image/*" multiple onChange={handleNewImageChange} className="hidden" />
            </label>

            {existingImages.length > 0 && (
              <div>
                <p className="text-[11px] font-bold text-gray-500 mb-1">기존 등록된 사진</p>
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {existingImages.map((url: string, index: number) => (
                    <div key={`existing-${index}`} className="relative w-16 h-16 rounded-lg overflow-hidden border border-gray-200 shrink-0">
                      <Image src={url} alt={`기존 사진 ${index + 1}`} fill unoptimized className="object-cover" />
                      <button
                        type="button"
                        onClick={() => handleRemoveExistingImage(index)}
                        className="absolute top-1 right-1 bg-black/60 text-white rounded-lg p-0.5 hover:bg-black transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {newImagePreviews.length > 0 && (
              <div>
                <p className="text-[11px] font-bold text-amber-600 mb-1">새로 추가할 사진</p>
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {newImagePreviews.map((preview: string, index: number) => (
                    <div key={`new-${index}`} className="relative w-16 h-16 rounded-lg overflow-hidden border border-amber-300 shrink-0">
                      <Image src={preview} alt={`새 사진 ${index + 1}`} fill unoptimized className="object-cover" />
                      <button
                        type="button"
                        onClick={() => handleRemoveNewImage(index)}
                        className="absolute top-1 right-1 bg-black/60 text-white rounded-lg p-0.5 hover:bg-black transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <label className="grid gap-2 text-sm font-bold">
              <FieldLabel required>별점</FieldLabel>
              <select 
                name="rating" 
                defaultValue={place.rating ?? 5}
                className="w-full rounded-md border border-[#d8cfc2] bg-[#fbfaf7] px-4 py-3 text-base text-gray-700 font-normal outline-none transition focus:border-[#e57632] focus:bg-white"
              >
                <option value="5">★ 5</option>
                <option value="4">★ 4</option>
                <option value="3">★ 3</option>
                <option value="2">★ 2</option>
                <option value="1">★ 1</option>
              </select>
            </label>

            <label className="grid gap-2 text-sm font-bold">
              <FieldLabel required>방문일</FieldLabel>
              <input
                name="visitedAt"
                type="date"
                defaultValue={place.visited_at || ''}
                required
                className="rounded-md border border-[#d8cfc2] bg-[#fbfaf7] px-4 py-3 text-base text-gray-700 font-normal outline-none transition focus:border-[#e57632] focus:bg-white"
              />
            </label>
            
            <label className="grid gap-2 text-sm font-bold">
              <FieldLabel required>주차여부</FieldLabel>
                <select
                  name="hasParking"
                  defaultValue={place.has_parking ?? "true"}
                  required
                  className="rounded-md border border-[#d8cfc2] bg-[#fbfaf7] px-4 py-3 text-base text-gray-700 font-normal outline-none transition focus:border-[#e57632] focus:bg-white"
                >
                  <option value="true">가능</option>
                  <option value="false">불가능</option>
                </select>
            </label>
            
            <label className="grid gap-2 text-sm font-bold">
              <FieldLabel required>재방문여부</FieldLabel>
                <select
                  name="willRevisit"
                  defaultValue={place.will_revisit ?? "true"}
                  required
                  className="rounded-md border border-[#d8cfc2] bg-[#fbfaf7] px-4 py-3 text-base text-gray-700 font-normal outline-none transition focus:border-[#e57632] focus:bg-white"
                >
                  <option value="true">있음</option>
                  <option value="false">없음</option>
                </select>
            </label>
          </div>

          <label className="grid gap-2 text-sm font-bold">
            <FieldLabel required>장소명</FieldLabel>
              <input
                value={placeData?.storeName ?? ""}
                readOnly
                placeholder="위에 있는 카카오 지도 검색을 이용하면 자동 입력됩니다."
                className={`rounded-md border border-[#d8cfc2] bg-[#fbfaf7] px-4 py-3 text-base font-normal outline-none transition text-black focus:bg-white ${focusInputClass}`}
              />
          </label>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">추천 후기 및 꿀팁 <span className="text-[#e57632]" aria-label="필수 입력">*</span></label>
            <textarea 
              name="content"
              rows={5}
              defaultValue={place.content || ''}
              className="w-full rounded-md border border-[#d8cfc2] bg-[#fbfaf7] px-4 py-3 text-base text-gray-700 font-normal outline-none transition focus:border-[#e57632] focus:bg-white resize-none"
              required
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button 
              type="submit" 
              disabled={submitting}
              className="flex-1 py-3.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-lg transition-colors shadow-sm"
            >
              {submitting ? '저장 중...' : '수정저장'}
            </button>
            <Link 
              href={`/reviews/places/${id}`}
              className="px-6 py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-lg transition-colors text-center flex items-center justify-center"
            >
              취소
            </Link>
          </div>
        </form>
      </div>
    </main>
  )
}