import { createSupabaseServerClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import EditPostClient from './EditPostClient'

export default async function EditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createSupabaseServerClient()
  
  if (!supabase) redirect('/auth/login')

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: post, error } = await supabase
    .from('posts')
    .select('id, content, image_url, author_id, content')
    .eq('id', id)
    .single()

  if (error || !post) {
    notFound()
  }

  if (post.author_id !== user.id) {
    redirect(`/growth/${id}`)
  }

  return <EditPostClient post={post} />
}