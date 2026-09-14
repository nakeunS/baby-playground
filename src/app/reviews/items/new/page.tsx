'use client'

import { useState } from 'react'
import { ChevronLeft, ImagePlus, X } from 'lucide-react'
import { createReviewItem } from '@/app/actions/review'
import Image from 'next/image'
import Link from 'next/link'

export default function NewItemPage() {
  const [loading, setLoading] = useState(false)
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [imageFiles, setImageFiles] = useState<File[]>([])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return
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

    const formElement = e.currentTarget
    const formData = new FormData(formElement)

    const rawPrice = formData.get('price') as string
    if (rawPrice) {
      const numericPrice = rawPrice.replace(/[^0-9]/g, '')
      formData.set('price', numericPrice)
    }

    imageFiles.forEach((file) => {
      formData.append('images', file)
    })

    try {
      await createReviewItem(formData)
    } catch (error: unknown) {
      if (error instanceof Error) {
        alert(error.message)
      } else {
        alert('등록 중 알 수 없는 오류가 발생했습니다.')
      }
      setLoading(false)
    }
  }

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/[^0-9]/g, '') // 숫자 외 문자 제거
    if (!rawValue) {
      e.target.value = ''
      return
    }
    const number = parseInt(rawValue, 10)
    e.target.value = number.toLocaleString()
  }

  return (
    <main className="min-h-screen bg-[#FFF9F2] pb-24 px-4 pt-20">
      <div className="max-w-md mx-auto bg-white rounded-lg p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-6 border-b border-gray-100 pb-3">
          <Link href="/reviews" className="flex items-center gap-1 text-xs font-bold text-gray-700 hover:text-black">
            <ChevronLeft className="w-5 h-5" /> 목록으로
          </Link>
          <h1 className="font-extrabold text-gray-800 text-base">육아템 추천하기</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              리뷰 제목<span className="text-[#e57632]" aria-label="필수 입력">*</span></label>
            <input 
              type="text" 
              name="title"
              placeholder="예: 국민 모빌, 아기 젖병 등" 
              className="w-full p-3 border text-black border-[#d8cfc2] bg-[#fbfaf7] rounded-lg text-sm focus:outline-amber-500"
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                카테고리 <span className="text-[#e57632]" aria-label="필수 입력">*</span></label>
              <select 
                name="category"
                defaultValue="수유/이유식"
                className="w-full p-2.5 border text-black border-[#d8cfc2] bg-[#fbfaf7] rounded-lg text-xs focus:outline-amber-500"
              >
                <option value="수유/이유식">수유/이유식</option>
                <option value="아기가구">아기가구</option>
                <option value="의류">의류</option>
                <option value="외출/유모차">외출/유모차</option>
                <option value="장난감/도서">장난감/도서</option>
                <option value="위생/목욕">위생/목욕</option>
                <option value="가전/기타">가전/기타</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">만족도 별점<span className="text-[#e57632]" aria-label="필수 입력">*</span></label>
              <select 
                name="rating" 
                defaultValue="5"
                className="w-full p-2.5 border text-black border-[#d8cfc2] bg-[#fbfaf7] rounded-lg text-xs focus:outline-amber-500"
              >
                <option value="5">★ 5 (최고)</option>
                <option value="4">★ 4 (좋음)</option>
                <option value="3">★ 3 (보통)</option>
                <option value="2">★ 2 (별로)</option>
                <option value="1">★ 1 (실망)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">구매일<span className="text-[#e57632]" aria-label="필수 입력">*</span></label>
              <input 
                type="date" 
                name="purchaseDate"
                className="w-full p-2.5 border text-black border-[#d8cfc2] bg-[#fbfaf7] rounded-lg text-xs focus:outline-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">참고 가격<span className="text-[#e57632]" aria-label="필수 입력">*</span></label>
            <input 
              type="text" 
              name="price"
              placeholder="예: 35,000" 
              onChange={handlePriceChange}
              className="w-full rounded-md border border-[#d8cfc2] bg-[#fbfaf7] px-4 py-3 text-base text-gray-700 font-normal outline-none transition focus:border-[#e57632] focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">구매 링크<span className="text-[#e57632]" aria-label="필수 입력">*</span></label>
            <input 
              type="url" 
              name="productLink"
              placeholder="https://..." 
              className="w-full rounded-md border border-[#d8cfc2] bg-[#fbfaf7] px-4 py-3 text-base text-gray-700 font-normal outline-none transition focus:border-[#e57632] focus:bg-white"
            />
          </div>

          <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-gray-700">상품 사진 등록 (여러 장 가능)</label>
            </div>
            <label className="flex items-center justify-center gap-2 border border-dashed border-amber-400 bg-white rounded-lg p-3 cursor-pointer hover:bg-amber-50/50 transition-colors">
              <ImagePlus className="w-5 h-5 text-amber-500" />
              <span className="text-xs text-gray-500 font-medium">사진 추가하기</span>
              <input type="file" accept="image/*" multiple onChange={handleImageChange} className="hidden" />
            </label>

            {imagePreviews.length > 0 && (
              <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-200 shrink-0">
                    <Image src={preview} alt={`미리보기 ${index + 1}`} fill unoptimized className="object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-0.5 hover:bg-black transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">추천 후기 및 팁<span className="text-[#e57632]" aria-label="필수 입력">*</span></label>
            <textarea 
              name="content"
              rows={4}
              className="w-full rounded-md border border-[#d8cfc2] bg-[#fbfaf7] px-4 py-3 text-base text-gray-700 font-normal outline-none transition focus:border-[#e57632] focus:bg-white resize-none"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button 
              type="submit" 
              disabled={loading}
              className="flex-1 py-3.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-lg transition-colors shadow-sm"
            >
              {loading ? '업로드 및 등록 중...' : '추천 아이템 등록하기'}
            </button>
            <Link 
              href="/reviews"
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