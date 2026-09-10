'use client'

import { useState } from 'react'
import Image from 'next/image'

type LikeItemType = {
  user_id: string
  profiles: {
    display_name: string | null
    avatar_url: string | null
  } | null
}

type LikesModalProps = {
  likes: LikeItemType[]
  totalLikes: number
}

export default function LikesModal({ likes, totalLikes }: LikesModalProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <div 
        className="cursor-pointer hover:text-gray-600 font-bold text-sm text-gray-900 transition-colors mt-2" 
        onClick={() => setIsOpen(true)}
      >
        좋아요 {totalLikes}개
      </div>

      {isOpen && (
        <div 
          className="fixed z-100 inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        >
          <div 
            className="w-80 rounded-xl bg-white p-5 shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between border-b pb-3 text-base font-bold text-gray-900">
              <span>좋아요 누른 사람</span>
              <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-900">
                ✕
              </button>
            </div>
            
            <div className="flex max-h-60 flex-col gap-4 overflow-y-auto scrollbar-hide">
              {likes.length > 0 ? (
                likes.map((like) => (
                  <div key={like.user_id} className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-amber-100 rounded-full flex items-center justify-center text-sm shadow-inner overflow-hidden shrink-0">
                      {like.profiles?.avatar_url ? (
                        <Image src={like.profiles.avatar_url} alt="프로필" width={36} height={36} className="object-cover w-full h-full" />
                      ) : (
                        "😀"
                      )}
                    </div>
                    <span className="font-medium text-sm text-gray-800">
                      {like.profiles?.display_name || '알 수 없음'}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center text-sm text-gray-500 py-4">아직 좋아요가 없습니다.</div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}