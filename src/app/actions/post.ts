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

export async function createPost(imageUrl: string, content: string) {
  const supabase = await getSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error('로그인이 필요합니다.')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('family_id')
    .eq('id', user.id)
    .single()

  if (!profile?.family_id) {
    throw new Error('소속된 가족이 없습니다.')
  }

  const { error } = await supabase
    .from('posts')
    .insert({
      family_id: profile.family_id,
      author_id: user.id,
      image_url: imageUrl,
      content: content,
    })

  if (error) {
    throw new Error(`게시글 작성 실패: ${error.message}`)
  }

  revalidatePath('/')
}