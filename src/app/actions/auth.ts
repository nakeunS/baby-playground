'use server'

import { createSupabaseServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

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
  const supabase = await getSupabase()

  const { error } = await supabase.auth.signUp({ email, password })
  if (error) redirect(`/auth/signup?error=${encodeURIComponent(error.message)}`)

  redirect('/auth/onboarding')
}

export async function signIn(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const supabase = await getSupabase()

  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) redirect(`/auth/login?error=${encodeURIComponent(error.message)}`)

  redirect('/auth')
}

function generateInviteCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase()
}

export async function createFamily(formData: FormData) {
  
  const familyName = formData.get('familyName') as string
  const displayName = formData.get('displayName') as string
  const supabase = await getSupabase()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: family, error: familyError } = await supabase
    .from('families')
    .insert({ name: familyName, invite_code: generateInviteCode() })
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

export async function joinFamily(formData: FormData) {
  const inviteCode = (formData.get('inviteCode') as string).toUpperCase()
  const displayName = formData.get('displayName') as string
  const supabase = await getSupabase()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: family, error: findError } = await supabase
    .from('families')
    .select('id')
    .eq('invite_code', inviteCode)
    .single()

  if (findError || !family) {
    redirect(`/auth/onboarding?error=${encodeURIComponent('초대코드를 찾을 수 없어요')}`)
  }

  const { error: profileError } = await supabase.from('profiles').insert({
    id: user!.id,
    family_id: family!.id,
    display_name: displayName,
    role: 'member',
  })

  if (profileError) redirect(`/auth/onboarding?error=${encodeURIComponent(profileError.message)}`)

  redirect('/')
}