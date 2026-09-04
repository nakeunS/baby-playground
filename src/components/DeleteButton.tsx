'use client'

import { useTransition } from 'react'

interface DeleteButtonProps {
  onDeleteAction: () => Promise<void>
}

export default function DeleteButton({ onDeleteAction }: DeleteButtonProps) {
  const [isPending, startTransition] = useTransition()

  const handleDeleteClick = () => {
    const confirmed = window.confirm('정말 이 게시물을 삭제하시겠습니까?')
    if (confirmed) {
      startTransition(async () => {
        await onDeleteAction()
      })
    }
  }

  return (
    <button 
      type="button" 
      onClick={handleDeleteClick}
      disabled={isPending}
      className="text-red-400 hover:text-red-600 transition-colors disabled:opacity-50"
    >
      {isPending ? '삭제 중...' : '삭제'}
    </button>
  )
}