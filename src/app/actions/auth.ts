'use server'

import { createSupabaseServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

async function getSupabase() {
  const supabase = await createSupabaseServerClient()
  if (!supabase) {
    redirect(`/auth/login?error=${encodeURIComponent('서버 연결 오류가 발생했습니다.')}`)
  }
  return supabase
}

export async function signUp(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const displayName = formData.get('displayName') as string
  const supabase = await getSupabase()

  const { error } = await supabase.auth.signUp({ 
    email, 
    password,
    options: {
      data: {
        display_name: displayName,
      }
    }
  })
  
  if (error) {
    return { error: error.message }
  }

  return { success: true }
}

export async function verifyOtp(formData: FormData) {
  const email = formData.get('email') as string
  const token = formData.get('token') as string
  const supabase = await getSupabase()

  const { error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: 'signup'
  })

  if (error) {
    return { error: error.message }
  }

  redirect('/auth/onboarding')
}

export async function signIn(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  
  if ( !email || !password ){
    redirect("auth/login?error=missing");
  }
  
  const supabase = await getSupabase()

  if( !supabase ){
    redirect("/auth/login?error=config");
  }

  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) redirect("/auth/login?error=invalid")

  redirect('/')
}

export async function signOut() {
  const supabase = await getSupabase()
  if (supabase) {
    await supabase.auth.signOut()
  }
  redirect('/')
}

export async function createFamily(formData: FormData) {
  
  const familyName = formData.get('familyName') as string
  const displayName = formData.get('displayName') as string
  const supabase = await getSupabase()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: family, error: familyError } = await supabase
    .from('families')
    .insert({ name: familyName })
    .select()
    .single()

  if (familyError || !family) {
    redirect(`/auth/onboarding?error=${encodeURIComponent(familyError?.message ?? '가족 생성 실패')}`)
  }

  const { error: profileError } = await supabase.from('profiles').insert({
    id: user!.id,
    family_id: family!.id,
    display_name: displayName,
    role: 'owner',
  })

  if (profileError) redirect(`/auth/onboarding?error=${encodeURIComponent(profileError.message)}`)

  redirect('/')
}

export async function generateInviteCodeAction() {
  const supabase = await getSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('로그인이 필요합니다.')

  const { data: profile } = await supabase
    .from('profiles')
    .select('family_id')
    .eq('id', user.id)
    .single()

  if (!profile?.family_id) throw new Error('소속된 가족이 없습니다.')

  const code = Math.random().toString(36).substring(2, 8).toUpperCase()
  
  const expiresAt = new Date()
  expiresAt.setHours(expiresAt.getHours() + 24)

  const { error } = await supabase.from('family_invites').insert({
    family_id: profile.family_id,
    code: code,
    expires_at: expiresAt.toISOString(),
  })

  if (error) throw new Error('초대 코드 생성에 실패했습니다.')

  return { success: true, code }
}

export async function joinFamily(formData: FormData) {
  const inviteCode = (formData.get('inviteCode') as string).toUpperCase()
  const displayName = formData.get('displayName') as string
  const supabase = await getSupabase()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: inviteData, error: inviteError } = await supabase
    .from('family_invites')
    .select('*')
    .eq('code', inviteCode)
    .eq('is_used', false)
    .single()

  if (inviteError || !inviteData) {
    redirect(`/auth/onboarding?error=${encodeURIComponent('존재하지 않거나 이미 사용된 초대코드입니다.')}`)
  }

  if (new Date(inviteData.expires_at) < new Date()) {
    redirect(`/auth/onboarding?error=${encodeURIComponent('시간이 초과되어 만료된 코드입니다.')}`)
  }

  const { error: profileError } = await supabase.from('profiles').insert({
    id: user!.id,
    family_id: inviteData.family_id,
    display_name: displayName,
    role: 'member',
  })

  if (profileError) redirect(`/auth/onboarding?error=${encodeURIComponent(profileError.message)}`)

  await supabase
    .from('family_invites')
    .update({ is_used: true })
    .eq('id', inviteData.id)

  redirect('/')
}

export async function updateFamilyName(formData: FormData) {
  const newFamilyName = formData.get('newFamilyName') as string
  const supabase = await getSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase.from('profiles').select('family_id, role').eq('id', user.id).single()
  if (profile?.role !== 'owner') throw new Error('방장만 이름을 변경할 수 있습니다.')

  const { error: updateError } = await supabase
    .from('families')
    .update({ name: newFamilyName })
    .eq('id', profile.family_id)
  
    if( updateError ){
      throw new Error(`가족 이름 변경 실패: ${updateError.message}`)
    }

  revalidatePath('/auth/onboarding')
}

export async function kickMember(formData: FormData) {
  const memberId = formData.get('memberId') as string
  const supabase = await getSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase.from('profiles').select('family_id, role').eq('id', user.id).single()
  if (profile?.role !== 'owner') throw new Error('방장만 멤버를 내보낼 수 있습니다.')

  await supabase.from('profiles').update({ family_id: null, role: 'member' }).eq('id', memberId)

  revalidatePath('/auth/onboarding')
}