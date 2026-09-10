"use server"

import { createSupabaseServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

async function getSupabase() {
  const supabase = await createSupabaseServerClient()
  if (!supabase) {
    redirect(`/auth/login?error=${encodeURIComponent('서버 연결 오류가 발생했습니다.')}`)
  }
  return supabase
}

export async function getPost(id: string) {
  const supabase = await getSupabase()

  const { data, error } = await supabase
    .from('posts')
    .select(`
      id,
      image_url,
      content,
      created_at,
      author_id,
      profiles ( display_name, avatar_url ),
      likes ( 
        user_id,
        profiles:user_id ( display_name, avatar_url )  
      ),
      comments (
        id,
        content,
        created_at,
        parent_id,
        user_id,
        profiles:user_id ( display_name, avatar_url )
      )
    `)
    .eq('id', id)
    .single()

  if (error || !data) {
    console.log("상세 페이지 조회 에러:", error)
    return null
  }

  return data
}