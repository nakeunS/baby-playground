'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { updatePostWithMedia } from '@/app/actions/post'
import { createClient } from '@/lib/supabase/client'

interface EditPageClientProps {
  post: {
    id: string
    content: string | null
    image_url: string | null
    author_id: string
  }
}

export default function EditPostClient({ post }: EditPageClientProps) {
  const router = useRouter()
  const [content, setContent] = useState(post.content || '')
  
  const initialMedia = post.image_url ? post.image_url.split(',').filter(Boolean) : []
  const [mediaList, setMediaList] = useState<string[]>(initialMedia)
  
  const [newFiles, setNewFiles] = useState<File[]>([])
  const [newPreviews, setNewPreviews] = useState<string[]>([])
  
  const [isPending, startTransition] = useTransition()
  const supabase = createClient()

  const handleRemoveExistingMedia = (indexToRemove: number) => {
    setMediaList(mediaList.filter((_, idx) => idx !== indexToRemove))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return
    const filesArray = Array.from(e.target.files)
    setNewFiles(prev => [...prev, ...filesArray])

    const previewUrls = filesArray.map(file => URL.createObjectURL(file))
    setNewPreviews(prev => [...prev, ...previewUrls])
  }

  const handleRemoveNewMedia = (indexToRemove: number) => {
    setNewFiles(newFiles.filter((_, idx) => idx !== indexToRemove))
    setNewPreviews(newPreviews.filter((_, idx) => idx !== indexToRemove))
  }

  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)

  const handleDragStart = (index: number) => {
    setDraggedIndex(index)
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
  }

  const handleDrop = (targetIndex: number) => {
    if (draggedIndex === null || draggedIndex === targetIndex) return

    const updated = [...mediaList]
    const [movedItem] = updated.splice(draggedIndex, 1) // 기존 위치에서 빼고
    updated.splice(targetIndex, 0, movedItem) // 타겟 위치에 끼워넣기

    setMediaList(updated)
    setDraggedIndex(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    startTransition(async () => {
      try {
        const uploadedUrls: string[] = []

        for (const file of newFiles) {
          const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${file.name.split('.').pop()}`
          const { error: uploadError } = await supabase.storage
            .from('posts')
            .upload(fileName, file)

          if (uploadError) {
            alert('이미지 업로드 실패: ' + uploadError.message)
            return
          }

          const { data: { publicUrl } } = supabase.storage
            .from('posts')
            .getPublicUrl(fileName)

          uploadedUrls.push(publicUrl)
        }

        const finalMediaList = [...mediaList, ...uploadedUrls]

        const res = await updatePostWithMedia(post.id, content, finalMediaList)
        if ('error' in res && res.error) {
          alert(res.error)
          return
        }

        router.push(`/growth/${post.id}`)
        router.refresh()
      } catch (err) {
        console.error(err)
        alert('수정 중 오류가 발생했습니다.')
      }
    })
  }

  return (
    <main className="min-h-screen bg-[#FFF9F2] flex flex-col items-center justify-start p-4 pt-25 pb-28">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8">
        <div className="flex items-center justify-between mb-6 border-b border-gray-100 pb-4">
          <h1 className="text-xl font-extrabold text-gray-800">게시물 수정 (미디어 편집)</h1>
          <Link href={`/growth/${post.id}`} className="text-sm text-gray-500 hover:text-gray-700 font-medium">
            취소
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">사진 관리 및 순서</label>
            <div className="grid grid-cols-3 gap-3 mb-3">
              {mediaList.map((url, index) => (
                <div 
                    key={url}
                    draggable
                    onDragStart={() => handleDragStart(index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDrop={() => handleDrop(index)}
                    className="relative aspect-square rounded-xl overflow-hidden border border-gray-200 group bg-gray-50 cursor-grab active:cursor-grabbing transition-transform">
                  <Image src={url} alt="기존 사진" fill className="object-cover pointer-events-none" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button 
                      type="button" 
                      onClick={() => handleRemoveExistingMedia(index)}
                      className="bg-red-500 text-white p-1.5 rounded-full text-xs font-bold hover:bg-red-600"
                      title="삭제"
                    >
                      ✕
                    </button>
                  </div>
                  <span className="absolute bottom-1 left-1 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded">
                    기존 {index + 1}
                  </span>
                </div>
              ))}

              {newPreviews.map((previewUrl, index) => (
                <div key={previewUrl} className="relative aspect-square rounded-xl overflow-hidden border border-amber-300 group bg-amber-50">
                  <Image src={previewUrl} alt="새 사진" className="object-cover w-full h-full" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button 
                      type="button" 
                      onClick={() => handleRemoveNewMedia(index)}
                      className="bg-red-500 text-white p-1.5 rounded-full text-xs font-bold hover:bg-red-600"
                    >
                      ✕
                    </button>
                  </div>
                  <span className="absolute bottom-1 left-1 bg-amber-500 text-white text-[10px] px-1.5 py-0.5 rounded">
                    신규 {index + 1}
                  </span>
                </div>
              ))}
            </div>

            <label className="inline-flex items-center justify-center px-4 py-2 border border-dashed border-gray-300 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 cursor-pointer w-full transition-colors">
              ➕ 사진 추가하기
              <input type="file" accept="image/*" multiple onChange={handleFileChange} className="hidden" />
            </label>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">내용</label>
            <textarea 
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={5}
              className="w-full p-4 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-300 focus:bg-white transition-all text-gray-800 resize-none"
              placeholder="내용을 입력해주세요..."
            />
          </div>

          <div className="flex justify-end gap-2 mt-2">
            <Link 
              href={`/growth/${post.id}`}
              className="px-5 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-sm transition-colors text-center"
            >
              돌아가기
            </Link>
            <button 
              type="submit"
              disabled={isPending}
              className="px-5 py-3 rounded-xl bg-amber-400 hover:bg-amber-500 text-white font-bold text-sm transition-colors shadow-sm disabled:opacity-50"
            >
              {isPending ? '저장 중...' : '수정 완료'}
            </button>
          </div>
        </form>
      </div>
    </main>
  )
}