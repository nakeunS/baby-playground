'use client'

import { useTransition } from 'react'
import { Trash2 } from 'lucide-react'

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
      className="flex items-center gap-1 px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 text-xs font-bold rounded-lg transition-colors"
    >
      <Trash2 className="w-3.5 h-3.5" /> {isPending ? '삭제 중...' : '삭제'}
    </button>
  )
}