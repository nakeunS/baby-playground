"use server"

import { createSupabaseServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export type RecommendItem = {
  id: string
  title: string
  price: string | null
  image_url: string | null
  product_link: string | null
  category: string | null
  content: string | null
  rating: number | null
  created_at: string | null
  profiles: { display_name: string | null; avatar_url: string | null } | null
}

export type RecommendPlace = {
  id: string;
  title: string;
  store_name: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  place_id?: string;
  map_url?: string;
  will_revisit: string;
  has_parking?: string;
  rating: number;
  visited_at: string;
  image_url: string | null
  summary: string;
  review: string;
  profiles: { display_name: string | null; avatar_url: string | null } | null
  created_at: string;
  updated_at: string;
};

async function getSupabase() {
  const supabase = await createSupabaseServerClient()
  if (!supabase) {
    redirect(`/auth/login?error=${encodeURIComponent('서버 연결 오류가 발생했습니다.')}`)
  }
  return supabase
}

export async function getReview(): Promise<{ items: RecommendItem[]; places: RecommendPlace[] }> {
  const supabase = await getSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('로그인이 필요합니다.')
  }

  const [itemsRes, placesRes] = await Promise.all([
    supabase
      .from('recommended_items')
      .select('id, title, price, image_url, product_link, category, content, rating, created_at, profiles ( display_name, avatar_url )')
      .order('created_at', { ascending: false }),
    supabase
      .from('recommended_places')
      .select('id, title, address, image_url, map_url, rating, created_at, store_name, profiles ( display_name, avatar_url )')
      .order('created_at', { ascending: false }),
  ])

  return {
    items: (itemsRes.data as unknown as RecommendItem[]) || [],
    places: (placesRes.data as unknown as RecommendPlace[]) || [],
  }
}

export async function getReviewItemById(id: string) {
  const supabase = await getSupabase()
  const { data, error } = await supabase
    .from('recommended_items')
    .select('*, profiles ( display_name, avatar_url )')
    .eq('id', id)
    .single()

  if (error) {
    throw new Error('게시글을 불러오지 못했습니다: ' + error.message)
  }

  return data
}

export async function getReviewPlaceById(id: string) {
  const supabase = await getSupabase()
  const { data, error } = await supabase
    .from('recommended_places')
    .select('*, profiles ( display_name, avatar_url )')
    .eq('id', id)
    .single()

  if (error) {
    throw new Error('게시글을 불러오지 못했습니다: ' + error.message)
  }

  return data
}