'use server'

import { createSupabaseServerClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

async function getSupabase() {
  const supabase = await createSupabaseServerClient()
  if (!supabase) {
    redirect(`/auth/login?error=${encodeURIComponent('서버 연결 오류가 발생했습니다.')}`)
  }
  return supabase
}

async function requireFamilyOwner() {
  const supabase = await getSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error('로그인이 필요합니다.')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('family_id, role, id')
    .eq('id', user.id)
    .single()

  if (!profile?.family_id) {
    throw new Error('소속된 가족이 없습니다.')
  }

  if (profile?.role !== 'owner') {
    throw new Error('게시물 생성 권한이 없습니다.')
  }

  return { supabase, user, profile }
}

export async function createPost(imageUrl: string, content: string) {
  const { supabase, profile } = await requireFamilyOwner()

  const { error } = await supabase
    .from('posts')
    .insert({
      family_id: profile.family_id,
      author_id: profile.id,
      image_url: imageUrl,
      content: content,
    })

  if (error) {
    throw new Error(`게시글 작성 실패: ${error.message}`)
  }

  revalidatePath('/')
}

export async function updatePostWithMedia(postId: string, newContent: string, mediaUrls: string[]) {
  const { supabase } = await requireFamilyOwner()

  const image_url = mediaUrls.join(',')

  const { error } = await supabase
    .from('posts')
    .update({ 
      content: newContent,
      image_url: image_url 
    })
    .eq('id', postId)

  if (error) return { error: error.message }
  return { success: true }
}

export async function deletePost(postId: string, imageUrls: string | null) {
  const { supabase } = await requireFamilyOwner()

  if (imageUrls) {
    try {
      const urls = imageUrls.split(',')
      const filePaths = urls.map(url => {
        const parts = url.split('/family_posts/') 
        return parts[1]
      }).filter(Boolean)

      if (filePaths.length > 0) {
        await supabase.storage.from('family_posts').remove(filePaths)
      }
    } catch (err) {
      console.error("스토리지 파일 삭제 중 에러:", err)
    }
  }

  await supabase.from('likes').delete().eq('post_id', postId)
  await supabase.from('comments').delete().eq('post_id', postId)

  const { error } = await supabase
    .from('posts')
    .delete()
    .eq('id', postId)

  if (error) {
    throw new Error(`게시물 삭제 실패: ${error.message}`)
  }

  revalidatePath('/growth')
  redirect('/growth')
}

export async function toggleLike(postId: string) {
  const supabase = await getSupabase()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: '로그인이 필요합니다.' }

  const { data: existingLike } = await supabase
    .from('likes')
    .select('id')
    .eq('post_id', postId)
    .eq('user_id', user.id)
    .single()

  if (existingLike) {
    const { error } = await supabase
      .from('likes')
      .delete()
      .eq('post_id', postId)
      .eq('user_id', user.id)

    if (error) return { error: error.message }
  } else {
    const { error } = await supabase
      .from('likes')
      .insert({ post_id: postId, user_id: user.id })

    if (error) return { error: error.message }
  }

  revalidatePath(`/growth/${postId}`)
  return { success: true }
}

export async function addComment(postId: string, content: string, parentId?: string | null) {
  const supabase = await getSupabase()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: '로그인이 필요합니다.' }

  if (!content.trim()) return { error: '댓글 내용을 입력해주세요.' }

  const { error } = await supabase
    .from('comments')
    .insert({
      post_id: postId,
      user_id: user.id,
      content: content.trim(),
      parent_id: parentId || null
    })

  if (error) return { error: error.message }

  revalidatePath(`/growth/${postId}`)
  return { success: true }
}

export async function updateComment(commentId: string, postId: string, newContent: string) {
  const supabase = await getSupabase()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: '로그인이 필요합니다.' }

  if (!newContent.trim()) return { error: '내용을 입력해주세요.' }

  const { error } = await supabase
    .from('comments')
    .update({ content: newContent.trim() })
    .eq('id', commentId)
    .eq('user_id', user.id)

  if (error) return { error: error.message }

  revalidatePath(`/growth/${postId}`)
  return { success: true }
}

export async function deleteComment(commentId: string, postId: string) {
  const supabase = await getSupabase()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: '로그인이 필요합니다.' }

  const { error } = await supabase
    .from('comments')
    .delete()
    .eq('id', commentId)
    .eq('user_id', user.id)

  if (error) return { error: error.message }

  revalidatePath(`/growth/${postId}`)
  return { success: true }
}