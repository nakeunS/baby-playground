import Link from 'next/link'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import UserMenu from '@/components/UserMenu'

export default async function Header() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = supabase ? await supabase.auth.getUser() : { data: { user: null } }

  return (
    <header className="fixed top-0 left-0 right-0 h-14 bg-white/80 backdrop-blur-md border-b border-gray-100 z-50 flex items-center justify-between px-4 sm:px-8">
      <Link href="/" className="font-extrabold text-amber-500 text-lg tracking-tight">
        BABY PLAYGROUND
      </Link>
      
      <div>
        {user ? (
          <div className="flex items-center gap-3">
            <UserMenu userName={user.user_metadata?.name || user.user_metadata?.display_name || '사용자'}/>
          </div>
        ) : (
          <Link href="/auth/login" className="text-xs font-bold px-4 py-2 bg-amber-400 text-white rounded-md hover:bg-amber-500 transition shadow-sm">
            로그인
          </Link>
        )}
      </div>
    </header>
  )
}