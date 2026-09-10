import { createSupabaseServerClient } from '@/lib/supabase/server'
import { getPost } from '@/data/post'
import { notFound, redirect } from 'next/navigation'
import EditPostClient from './EditPostClient'

export default async function EditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = supabase ? await supabase.auth.getUser() : { data: { user: null } }

  if (!user) redirect('/auth/login')

  const post = await getPost(id)

  if (!post) {
    notFound()
  }

  if (post.author_id !== user.id) {
    redirect(`/growth/${id}`)
  }

  return <EditPostClient post={post} />
}