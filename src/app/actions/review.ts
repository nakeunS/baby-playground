'use server'

import { createSupabaseServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

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
  id: string
  title: string
  address: string | null
  image_url: string | null
  map_url: string | null
  created_at: string | null
  profiles: { display_name: string | null; avatar_url: string | null } | null
}

async function getSupabase() {
  const supabase = await createSupabaseServerClient()
  if (!supabase) {
    redirect(`/auth/login?error=${encodeURIComponent('서버 연결 오류가 발생했습니다.')}`)
  }
  return supabase
}

export async function createReviewItem(formData: FormData) {
  const supabase = await getSupabase()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('로그인이 필요합니다.')
  }

  const title = formData.get('title') as string
  const category = formData.get('category') as string
  const price = formData.get('price') as string
  const productLink = formData.get('productLink') as string
  const content = formData.get('content') as string
  const rating = Number(formData.get('rating') || 5)
  const purchaseDate = formData.get('purchaseDate') as string

  const imageFiles = formData.getAll('images') as File[]
  const uploadedImageUrls: string[] = []

  for (const file of imageFiles) {
    if (file.size > 0) {
      const fileName = `${user.id}-${Date.now()}-${file.name}`
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('review-images')
        .upload(fileName, file)

      if (uploadError) {
        throw new Error('이미지 업로드 실패: ' + uploadError.message)
      }

      const { data: { publicUrl } } = supabase.storage
        .from('review-images')
        .getPublicUrl(uploadData.path)
      
      uploadedImageUrls.push(publicUrl)
    }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('family_id')
    .eq('id', user.id)
    .single()

  const { error } = await supabase.from('recommended_items').insert({
    user_id: user.id,
    family_id: profile?.family_id || user.id,
    title,
    category,
    price,
    product_link: productLink,
    rating,
    purchase_date: purchaseDate || null,
    content,
    image_url: uploadedImageUrls[0] || '',
    image_urls: uploadedImageUrls,
  })

  if (error) {
    throw new Error('데이터베이스 저장 실패: ' + error.message)
  }

  revalidatePath('/reviews')
  redirect('/reviews')
}

export async function updateReviewItem(id: string, formData: FormData) {
  const supabase = await getSupabase()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('로그인이 필요합니다.')
  }

  const title = formData.get('title') as string
  const category = formData.get('category') as string
  const price = formData.get('price') as string
  const rating = Number(formData.get('rating')) || 5
  const purchase_date = formData.get('purchase_date') as string
  const product_link = formData.get('product_link') as string
  const content = formData.get('content') as string
  
  const existingImagesJson = formData.get('existing_images') as string
  const existingImages: string[] = existingImagesJson ? JSON.parse(existingImagesJson) : []

  const newImageFiles = formData.getAll('images') as File[]
  const newImageUrls: string[] = []

  for (const file of newImageFiles) {
    if (file && file.size > 0) {
      const fileName = `${user.id}-${Date.now()}-${file.name}`
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('review-images')
        .upload(fileName, file)

      if (uploadError) {
        throw new Error('이미지 업로드 실패: ' + uploadError.message)
      }

      const { data: { publicUrl } } = supabase.storage
        .from('review-images')
        .getPublicUrl(uploadData.path)

      newImageUrls.push(publicUrl)
    }
  }

  const finalImageUrls = [...existingImages, ...newImageUrls]

  const { error } = await supabase
    .from('recommended_items')
    .update({
      title,
      category,
      price,
      rating,
      purchase_date,
      product_link,
      content,
      image_url: finalImageUrls[0] || '',
      image_urls: finalImageUrls,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    throw new Error('수정 실패: ' + error.message)
  }

  revalidatePath(`/reviews/items/${id}`)
  revalidatePath('/reviews')
}

export async function deleteReviewItem(id: string, imageUrlsParam?: string | string[] | null) {
  const supabase = await getSupabase()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('로그인이 필요합니다.')
  }

  let imagesToDelete: string[] = []
  
  const { data: item, error: fetchError } = await supabase
    .from('recommended_items')
    .select('image_url, image_urls, user_id')
    .eq('id', id)
    .single()

  if (!fetchError && item) {
    if (item.user_id !== user.id) {
      throw new Error('삭제 권한이 없습니다.')
    }

    if (item.image_urls && Array.isArray(item.image_urls)) {
      imagesToDelete = item.image_urls
    } else if (item.image_url) {
      imagesToDelete = item.image_url.split(',').map((url: string) => url.trim()).filter(Boolean)
    }
  }

  for (const url of imagesToDelete) {
    try {
      const urlObj = new URL(url)
      const pathParts = urlObj.pathname.split('/review-images/')
      if (pathParts.length > 1) {
        const filePath = decodeURIComponent(pathParts[1])
        await supabase.storage.from('review-images').remove([filePath])
      }
    } catch {

    }
  }

  const { error } = await supabase
    .from('recommended_items')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    throw new Error('삭제 실패: ' + error.message)
  }

  revalidatePath('/reviews')
  redirect('/reviews')
}

export async function createReviewPlace(formData: FormData) {
  const supabase = await getSupabase()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('로그인이 필요합니다.')
  }

  const title = formData.get('title') as string
  const store_name = formData.get('storeName') as string
  const address = formData.get('address') as string
  const latitude = formData.get('latitude') as string
  const longitude = formData.get('longitude') as string
  const place_id = formData.get('placeId') as string
  const map_url = formData.get('map_url') as string
  const rating = formData.get('rating') as string
  const visited_at = formData.get('visitedAt') as string
  const has_parking = formData.get('hasParking') as string
  const will_revisit = formData.get('willRevisit') as string
  const content = formData.get('content') as string

  const imageFiles = formData.getAll('images') as File[]
  const uploadedImageUrls: string[] = []

  for (const file of imageFiles) {
    if (file && file.size > 0) {
      const fileName = `${user.id}-${Date.now()}-${file.name}`
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('review-images')
        .upload(fileName, file)

      if (uploadError) {
        throw new Error('이미지 업로드 실패: ' + uploadError.message)
      }

      const { data: { publicUrl } } = supabase.storage
        .from('review-images')
        .getPublicUrl(uploadData.path)
      
      uploadedImageUrls.push(publicUrl)
    }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('family_id')
    .eq('id', user.id)
    .single()

  const { error } = await supabase.from('recommended_places').insert({
    user_id: user.id,
    family_id: profile?.family_id || user.id,
    title,
    store_name,
    address,
    latitude,
    longitude,
    place_id,
    map_url,
    rating,
    visited_at,
    has_parking,
    will_revisit,
    content,
    image_url: uploadedImageUrls[0] || '',
    image_urls: uploadedImageUrls,
  })

  if (error) {
    throw new Error('데이터베이스 저장 실패: ' + error.message)
  }

  revalidatePath('/reviews')
}

export async function updateReviewPlace(id: string, formData: FormData) {
  const supabase = await getSupabase()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('로그인이 필요합니다.')
  }

  const title = formData.get('title') as string
  const store_name = formData.get('storeName') as string
  const address = formData.get('address') as string
  const latitude = formData.get('latitude') as string
  const longitude = formData.get('longitude') as string
  const place_id = formData.get('placeId') as string
  const map_url = formData.get('map_url') as string
  const rating = formData.get('rating') as string
  const visited_at = formData.get('visitedAt') as string
  const has_parking = formData.get('hasParking') as string
  const will_revisit = formData.get('willRevisit') as string
  const content = formData.get('content') as string
  
  const existingImagesJson = formData.get('existing_images') as string
  const existingImages: string[] = existingImagesJson ? JSON.parse(existingImagesJson) : []

  const newImageFiles = formData.getAll('images') as File[]
  const newImageUrls: string[] = []

  for (const file of newImageFiles) {
    if (file && file.size > 0) {
      const fileName = `${user.id}-${Date.now()}-${file.name}`
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('review-images')
        .upload(fileName, file)

      if (uploadError) {
        throw new Error('이미지 업로드 실패: ' + uploadError.message)
      }

      const { data: { publicUrl } } = supabase.storage
        .from('review-images')
        .getPublicUrl(uploadData.path)

      newImageUrls.push(publicUrl)
    }
  }

  const finalImageUrls = [...existingImages, ...newImageUrls]

  const { error } = await supabase
    .from('recommended_places')
    .update({
      title,
      address,
      store_name,
      latitude,
      longitude,
      place_id,
      map_url,
      rating,
      visited_at,
      has_parking,
      will_revisit,
      content,
      image_url: finalImageUrls[0] || '',
      image_urls: finalImageUrls,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    throw new Error('수정 실패: ' + error.message)
  }

  revalidatePath(`/reviews/places/${id}`)
  revalidatePath('/reviews')
}

export async function deleteReviewPlace(id: string) {
  const supabase = await getSupabase()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('로그인이 필요합니다.')
  }

  let imagesToDelete: string[] = []
  
  const { data: place, error: fetchError } = await supabase
    .from('recommended_places')
    .select('image_url, image_urls, user_id')
    .eq('id', id)
    .single()

  if (!fetchError && place) {
    if (place.user_id !== user.id) {
      throw new Error('삭제 권한이 없습니다.')
    }

    if (place.image_urls && Array.isArray(place.image_urls)) {
      imagesToDelete = place.image_urls
    } else if (place.image_url) {
      imagesToDelete = place.image_url.split(',').map((url: string) => url.trim()).filter(Boolean)
    }
  }

  for (const url of imagesToDelete) {
    try {
      const urlObj = new URL(url)
      const pathParts = urlObj.pathname.split('/review-images/')
      if (pathParts.length > 1) {
        const filePath = decodeURIComponent(pathParts[1])
        await supabase.storage.from('review-images').remove([filePath])
      }
    } catch {
      // 파싱 실패 시 무시
    }
  }

  const { error } = await supabase
    .from('recommended_places')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    throw new Error('삭제 실패: ' + error.message)
  }

  revalidatePath('/reviews')
  redirect('/reviews?tab=places')
}