'use client'

import { useState, useTransition } from 'react'
import Image from 'next/image'
import { addComment, updateComment, deleteComment } from '@/app/actions/post'

type CommentType = {
  id: string
  content: string
  created_at: string
  parent_id: string | null
  user_id: string
  profiles: {
    display_name: string | null
    avatar_url: string | null
  } | null
}

export default function CommentSection({ 
  postId, 
  comments, 
  currentUserId 
}: { 
  postId: string, 
  comments: CommentType[], 
  currentUserId?: string 
}) {
  const [content, setContent] = useState('')
  const [replyingTo, setReplyingTo] = useState<{ id: string; name: string } | null>(null)
  
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null)
  const [editContent, setEditContent] = useState('')

  const [isPending, startTransition] = useTransition()

  const topLevelComments = comments.filter(c => !c.parent_id)
  const repliesMap = comments.reduce((acc, comment) => {
    if (comment.parent_id) {
      if (!acc[comment.parent_id]) acc[comment.parent_id] = []
      acc[comment.parent_id].push(comment)
    }
    return acc
  }, {} as Record<string, CommentType[]>)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim()) return

    startTransition(async () => {
      const res = await addComment(postId, content, replyingTo?.id)
      if ('error' in res && res.error) {
        alert(res.error)
        return
      }
      setContent('')
      setReplyingTo(null)
    })
  }

  const handleDelete = (commentId: string) => {
    if (!confirm('정말 댓글을 삭제하시겠습니까?')) return

    startTransition(async () => {
      const res = await deleteComment(commentId, postId)
      if ('error' in res && res.error) alert(res.error)
    })
  }

  const handleUpdate = (commentId: string) => {
    if (!editContent.trim()) return

    startTransition(async () => {
      const res = await updateComment(commentId, postId, editContent)
      if ('error' in res && res.error) {
        alert(res.error)
      } else {
        setEditingCommentId(null)
        setEditContent('')
      }
    })
  }

  const renderCommentItem = (comment: CommentType, isReply = false) => {
    const isOwner = currentUserId === comment.user_id
    const isEditing = editingCommentId === comment.id

    return (
      <div key={comment.id} className={`flex items-start gap-3 text-sm ${isReply ? 'pl-8' : ''}`}>
        <div className={`${isReply ? 'w-6 h-6 text-[10px]' : 'w-7 h-7 text-xs'} bg-amber-100 rounded-full flex items-center justify-center overflow-hidden shrink-0`}>
          {comment.profiles?.avatar_url ? (
            <Image src={comment.profiles.avatar_url} alt="프로필" width={28} height={28} className="object-cover w-full h-full" />
          ) : (
            "😀"
          )}
        </div>
        <div className="flex-1">
          <span className="font-bold mr-2 text-gray-900">{comment.profiles?.display_name || '알 수 없음'}</span>
          {isEditing ? (
            <div className="mt-1 flex flex-col gap-2">
              <input 
                type="text"
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full text-sm text-black border border-gray-200 rounded px-2 py-1 outline-none focus:border-amber-400"
              />
              <div className="flex items-center gap-2 text-xs">
                <button 
                  onClick={() => handleUpdate(comment.id)} 
                  disabled={isPending}
                  className="bg-amber-500 text-white px-2 py-1 rounded font-bold hover:bg-amber-600"
                >
                  저장
                </button>
                <button 
                  onClick={() => setEditingCommentId(null)} 
                  className="text-gray-500 hover:text-gray-700 font-medium"
                >
                  취소
                </button>
              </div>
            </div>
          ) : (
            <>
              <span className="text-gray-800 whitespace-pre-wrap">{comment.content}</span>
              <div className="flex items-center gap-3 mt-1 text-[11px] text-gray-400">
                <span>{new Date(comment.created_at).toLocaleDateString()}</span>
                {!isReply && (
                  <button 
                    onClick={() => setReplyingTo({ id: comment.id, name: comment.profiles?.display_name || '사용자' })}
                    className="font-bold hover:text-gray-600"
                  >
                    답글 달기
                  </button>
                )}

                {isOwner && (
                  <>
                    <button 
                      onClick={() => {
                        setEditingCommentId(comment.id)
                        setEditContent(comment.content)
                      }}
                      className="hover:text-gray-600"
                    >
                      수정
                    </button>
                    <button 
                      onClick={() => handleDelete(comment.id)} 
                      className="hover:text-red-500"
                    >
                      삭제
                    </button>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3">
        {topLevelComments.map(comment => (
          <div key={comment.id} className="flex flex-col gap-2">
            {renderCommentItem(comment, false)}

            {repliesMap[comment.id] && repliesMap[comment.id].map(reply => (
              renderCommentItem(reply, true)
            ))}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col border-t border-gray-100 pt-3 mt-2 bg-white sticky bottom-0">
        {replyingTo && (
          <div className="flex items-center justify-between text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded mb-2">
            <span><strong>{replyingTo.name}</strong>님에게 답글 남기는 중...</span>
            <button type="button" onClick={() => setReplyingTo(null)} className="font-bold">취소</button>
          </div>
        )}
        <div className="flex items-center gap-2">
          <input 
            type="text" 
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={replyingTo ? "답글을 입력해주세요..." : "댓글 달기.."} 
            className="flex-1 text-sm outline-none placeholder:text-gray-400 bg-transparent py-1 text-gray-800" 
          />
          <button 
            type="submit" 
            disabled={isPending}
            className="text-amber-500 font-bold text-sm hover:text-amber-600 disabled:opacity-50"
          >
            {isPending ? '등록중' : '게시'}
          </button>
        </div>
      </form>
    </div>
  )
}