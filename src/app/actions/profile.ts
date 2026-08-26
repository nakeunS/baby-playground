'use server'

import { createSupabaseServerClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function updateProfile(formData: FormData) {
  const supabase = await createSupabaseServerClient()

  if (!supabase) {
      redirect(`/auth/profile?error=${encodeURIComponent('서버 연결 오류가 발생했습니다.')}`)
  }

  const { data: { user } } = await supabase.auth.getUser()
  
  if ( !user ) throw new Error('로그인이 필요합니다.')

  const displayName = formData.get('displayName') as string
  const avatarFile = formData.get('avatar') as File | null

  let avatarUrl = formData.get('currentAvatarUrl') as string

  if ( avatarFile && avatarFile.size > 0 ) {
    const fileExt = avatarFile.name.split('.').pop()
    const fileName = `${user.id}-${Math.random()}.${fileExt}`
    const filePath = `${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, avatarFile)

    if (uploadError) throw new Error(`이미지 업로드에 실패했습니다.: ${uploadError.message}`)

    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath)
      
    avatarUrl = publicUrl
  }

  const { error: updateError } = await supabase
    .from('profiles')
    .update({ 
      display_name: displayName,
      avatar_url: avatarUrl 
    })
    .eq('id', user.id)

  if (updateError) throw new Error(`업데이트 실패: ${updateError.message}`)

  revalidatePath('/', 'layout')
  
  return { success: true, avatarUrl }
}