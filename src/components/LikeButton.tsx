'use client'

import { useState, useTransition } from 'react'
import { toggleLike } from '@/app/actions/post'

export default function LikeButton({ postId, initialHasLiked, totalLikes }: { postId: string, initialHasLiked: boolean, totalLikes: number }) {
  const [hasLiked, setHasLiked] = useState(initialHasLiked)
  const [likesCount, setLikesCount] = useState(totalLikes)
  const [isPending, startTransition] = useTransition()

  const handleLikeClick = () => {
    const nextHasLiked = !hasLiked
    setHasLiked(nextHasLiked)
    setLikesCount(prev => nextHasLiked ? prev + 1 : prev - 1)

    startTransition(async () => {
      const res = await toggleLike(postId)
      if ('error' in res && res.error) {
        setHasLiked(initialHasLiked)
        setLikesCount(totalLikes)
        alert(res.error)
      }
    })
  }

  return (
    <div className="flex flex-col gap-1">
      <button 
        onClick={handleLikeClick}
        disabled={isPending}
        className="text-2xl hover:scale-110 transition-transform origin-bottom-left text-left w-fit"
      >
        {hasLiked ? '❤️' : '🤍'}
      </button>
      <p className="text-sm font-bold text-gray-900">좋아요 {likesCount}개</p>
    </div>
  )
}