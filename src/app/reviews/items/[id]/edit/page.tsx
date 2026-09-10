'use client'

import { useState, useEffect } from 'react'
import { getReviewItemById } from '@/data/review'
import { updateReviewItem } from '@/app/actions/review'
import Link from 'next/link'
import Image from 'next/image'
import { ChevronLeft, X, ImagePlus } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'

type ReviewItem = {
  id: string
  title: string
  category: string | null
  price: string | number | null
  rating: number | null
  purchase_date: string | null
  product_link: string | null
  content: string | null
  image_url: string | null
  image_urls?: string[] | null
}

export default function EditItemPage() {
  const params = useParams()
  const router = useRouter()
  const id = params?.id as string

  const [loading, setLoading] = useState<boolean>(true)
  const [submitting, setSubmitting] = useState<boolean>(false)
  const [item, setItem] = useState<ReviewItem | null>(null)

  // 1. 기존 이미지와 새로 추가할 이미지 상태 분리 관리
  const [existingImages, setExistingImages] = useState<string[]>([])
  const [newImageFiles, setNewImageFiles] = useState<File[]>([])
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([])

  useEffect(() => {
    async function fetchItem() {
      try {
        const data = (await getReviewItemById(id)) as ReviewItem
        setItem(data)
        
        // 기존 이미지 파싱
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
      fetchItem()
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

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/[^0-9]/g, '')
    if (!rawValue) {
      e.target.value = ''
      return
    }
    const number = parseInt(rawValue, 10)
    e.target.value = number.toLocaleString()
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSubmitting(true)

    const formElement = e.currentTarget
    const formData = new FormData(formElement)

    const rawPrice = formData.get('price') as string
    if (rawPrice) {
      const numericPrice = rawPrice.replace(/[^0-9]/g, '')
      formData.set('price', numericPrice)
    }

    formData.append('existing_images', JSON.stringify(existingImages))

    newImageFiles.forEach((file: File) => {
      formData.append('images', file)
    })

    try {
      await updateReviewItem(id, formData)
      router.push(`/reviews/items/${id}`)
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

        <form onSubmit={handleSubmit} className="space-y-4">

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">리뷰 제목<span className="text-[#e57632]" aria-label="필수 입력">*</span></label>
            <input 
              type="text" 
              name="title"
              defaultValue={item.title}
              required 
              className="w-full p-3 border text-black border-[#d8cfc2] bg-[#fbfaf7] rounded-lg text-sm focus:outline-amber-500"
            />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">카테고리<span className="text-[#e57632]" aria-label="필수 입력">*</span></label>
              <select 
                name="category"
                defaultValue={item.category || '수유/이유식'}
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
              <label className="block text-xs font-bold text-gray-700 mb-1">별점<span className="text-[#e57632]" aria-label="필수 입력">*</span></label>
              <select 
                name="rating" 
                defaultValue={item.rating ?? 5}
                className="w-full p-2.5 border text-black border-[#d8cfc2] bg-[#fbfaf7] rounded-lg text-xs focus:outline-amber-500"
              >
                <option value="5">★ 5</option>
                <option value="4">★ 4</option>
                <option value="3">★ 3</option>
                <option value="2">★ 2</option>
                <option value="1">★ 1</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">구매일<span className="text-[#e57632]" aria-label="필수 입력">*</span></label>
              <input 
                type="date" 
                name="purchase_date"
                defaultValue={item.purchase_date || ''}
                className="w-full p-2.5 border text-black border-[#d8cfc2] bg-[#fbfaf7] rounded-lg text-xs focus:outline-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">참고 가격 (원)<span className="text-[#e57632]" aria-label="필수 입력">*</span></label>
            <input 
              type="text" 
              name="price"
              defaultValue={item.price ? Number(item.price).toLocaleString() : ''}
              onChange={handlePriceChange}
              placeholder="예: 35,000" 
              className="w-full p-3 border text-black border-[#d8cfc2] bg-[#fbfaf7] rounded-lg text-sm focus:outline-amber-500"
            />
          </div>

          <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-gray-700">상품 사진 관리 (여러 장 가능)</label>
              <span className="text-[10px] font-bold text-gray-400 bg-gray-200 px-1.5 py-0.5 rounded">필수 아님</span>
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

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">추천 후기 및 팁<span className="text-[#e57632]" aria-label="필수 입력">*</span>
            </label>
            <textarea 
              name="content"
              rows={5}
              defaultValue={item.content || ''}
              placeholder="실사용 해보며 느낀 점을 자유롭게 적어주세요." 
              className="w-full p-3 border text-black border-[#d8cfc2] bg-[#fbfaf7] rounded-lg text-sm focus:outline-amber-500 resize-none"
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
              href={`/reviews/items/${id}`}
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