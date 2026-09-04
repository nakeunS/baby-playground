'use client'

import { useState, useTransition } from 'react'
import { toggleLike } from '@/app/actions/post'
import LikesModal from './LikesModal'

type LikeItemType = {
  user_id: string
  profiles: {
    display_name: string | null
    avatar_url: string | null
  } | null
}

type LikeButtonProps = {
  postId: string
  initialHasLiked: boolean
  totalLikes: number
  likes: LikeItemType[] // 👈 likes 배열 추가
}

export default function LikeButton({ postId, initialHasLiked, totalLikes, likes }: LikeButtonProps ) {
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
      <LikesModal likes={likes} totalLikes={likesCount} />
    </div>
  )
}