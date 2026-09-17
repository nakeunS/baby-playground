'use client'

import { useState, useEffect, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ImagePlus, X } from 'lucide-react'
import { createReviewPlace } from '@/app/actions/review'
import { PlaceSearch } from '@/components/review/PlaceSearch'
import type { RecommendPlace, SelectedPlaceData } from '@/data/review'

type PlaceFormProps = {
  placeReview?: RecommendPlace;
};

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
        <span className="text-[#e57632]" aria-label="필수 입력">*</span>
      ) : (
        <span className="rounded bg-[#eee5dc] px-1.5 py-0.5 text-[11px] font-bold text-[#7a6f63]">
          선택
        </span>
      )}
    </span>
  );
}

export default function PlaceForm({ placeReview }: PlaceFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const focusInputClass = "focus:border-[#e57632]";
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])

  useEffect(() => {
    const script = document.createElement('script')
    script.src = '//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js'
    script.async = true
    document.body.appendChild(script)
  }, [])

  const [placeData, setPlaceData] = useState<SelectedPlaceData | null>(
    placeReview
      ? {
          storeName: placeReview.store_name,
          address: placeReview.address ?? "",
          latitude: placeReview.latitude ?? 0,
          longitude: placeReview.longitude ?? 0,
          placeId: placeReview.place_id ?? "",
          mapUrl: placeReview.map_url ?? "",
          photoUrl: placeReview.image_url ?? "",
        }
      : null,
  )

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return
    const filesArray = Array.from(e.target.files)
    setImageFiles((prev) => [...prev, ...filesArray])
    const newPreviews = filesArray.map((file) => URL.createObjectURL(file))
    setImagePreviews((prev) => [...prev, ...newPreviews])
  }

  const handleRemoveImage = (index: number) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index))
    setImagePreviews((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    imageFiles.forEach((file) => {
      formData.append('images', file)
    })

    try {
      await createReviewPlace(formData)
      router.push('/reviews?tab=places')
      router.refresh()
    } catch (error: unknown) {
      if (error instanceof Error) {
        alert(error.message)
      } else {
        alert('등록 중 오류가 발생했습니다.')
      }
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div> 
        <label className="block text-xs font-bold text-gray-700 mb-1">
          제목 <span className="text-[#e57632]" aria-label="필수 입력">*</span>
        </label>
        <input 
          type="text" 
          name="title" 
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

      {placeData && (
        <>
          <input type="hidden" name="address" value={placeData.address} />
          <input type="hidden" name="latitude" value={placeData.latitude} />
          <input type="hidden" name="longitude" value={placeData.longitude} />
          <input type="hidden" name="placeId" value={placeData.placeId} />
          <input type="hidden" name="map_url" value={placeData.mapUrl} />
        </>
      )}

      <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg space-y-2">
        <label className="text-xs font-bold text-gray-700">장소 사진 등록 (여러 장 가능)</label>
        <label className="flex items-center justify-center gap-2 border border-dashed border-amber-400 bg-white rounded-lg p-3 cursor-pointer hover:bg-amber-50/50 transition-colors">
          <ImagePlus className="w-5 h-5 text-amber-500" />
          <span className="text-xs text-gray-600 font-medium">사진 추가하기</span>
          <input type="file" accept="image/*" multiple onChange={handleImageChange} className="hidden" />
        </label>

        {imagePreviews.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-1 pt-1">
            {imagePreviews.map((preview, index) => (
              <div key={index} className="relative w-16 h-16 rounded-lg overflow-hidden border border-amber-300 shrink-0">
                <Image src={preview} alt={`미리보기 ${index + 1}`} fill unoptimized className="object-cover" />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(index)}
                  className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-0.5 hover:bg-black transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <label className="grid gap-2 text-sm font-bold">
          <FieldLabel required>별점</FieldLabel>
          <select 
            name="rating" 
            defaultValue="5"
            className="w-full rounded-md border border-[#d8cfc2] bg-[#fbfaf7] px-4 py-3 text-base text-gray-700 font-normal outline-none transition focus:border-[#e57632] focus:bg-white"
            required
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
            defaultValue={placeReview?.visited_at}
            required
            className="rounded-md border border-[#d8cfc2] bg-[#fbfaf7] px-4 py-3 text-base text-gray-700 font-normal outline-none transition focus:border-[#e57632] focus:bg-white"
          />
        </label>
        
        <label className="grid gap-2 text-sm font-bold">
          <FieldLabel required>주차여부</FieldLabel>
          <select
            name="hasParking"
            defaultValue={placeReview?.has_parking}
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
            defaultValue={placeReview?.will_revisit}
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
          name="storeName"
          value={placeData?.storeName ?? ""}
          readOnly
          required
          placeholder="위에 있는 카카오 지도 검색을 이용하면 자동 입력됩니다."
          className={`rounded-md border border-[#d8cfc2] bg-[#fbfaf7] px-4 py-3 text-base font-normal outline-none transition text-black focus:bg-white ${focusInputClass}`}
        />
      </label>

      <div>
        <label className="block text-xs font-bold text-gray-700 mb-1">
          추천 후기 및 꿀팁 <span className="text-[#e57632]" aria-label="필수 입력">*</span>
        </label>
        <textarea 
          name="content" 
          rows={5} 
          className="w-full rounded-md border border-[#d8cfc2] bg-[#fbfaf7] px-4 py-3 text-base text-gray-700 font-normal outline-none transition focus:border-[#e57632] focus:bg-white resize-none" 
          required 
        />
      </div>

      <div className="flex gap-2 pt-2">
        <button 
          type="submit" 
          disabled={loading} 
          className="flex-1 py-3.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-lg transition-colors shadow-sm"
        >
          {loading ? '등록 중...' : '추천 장소 등록하기'}
        </button>
        <Link 
          href="/reviews" 
          className="px-6 py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-lg transition-colors text-center flex items-center justify-center"
        >
          취소
        </Link>
      </div>
    </form>
  )
}