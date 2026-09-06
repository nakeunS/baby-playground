import { createClient } from '@/lib/supabase/client'

export type SoundItem = {
  id: string
  title: string
  emoji: string
  audio_url: string
}

export async function getSoundBoxData() {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { familyId: null, sounds: [] }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('family_id, role')
    .eq('id', user.id)
    .single()

  if (!profile || !profile.family_id) {
    return { familyId: null, sounds: [] }
  }

  const { data: soundList, error } = await supabase
    .from('sounds')
    .select('*')
    .eq('family_id', profile.family_id)
    .order('created_at', { ascending: false })

  if (error) {
    throw error
  }

  return {
    familyId: profile.family_id,
    sounds: (soundList || []) as SoundItem[],
  }
}

export async function uploadAndSaveSound(familyId: string, title: string, emoji: string, audioBlob: Blob) {
  const supabase = createClient()
  const fileName = `${familyId}/${Date.now()}.webm`

  const { error: uploadError } = await supabase.storage
    .from('sound-basket')
    .upload(fileName, audioBlob, { contentType: 'audio/webm' })

  if (uploadError) throw uploadError

  const { data: { publicUrl } } = supabase.storage
    .from('sound-basket')
    .getPublicUrl(fileName)

  const { error: dbError } = await supabase
    .from('sounds')
    .insert({
      family_id: familyId,
      title,
      emoji,
      audio_url: publicUrl,
    })

  if (dbError) throw dbError

  return true
}

export async function deleteSound(soundId: string, audioUrl: string) {
  const supabase = createClient()

  const urlParts = audioUrl.split('/sound-basket/')
  if (urlParts.length > 1) {
    const filePath = urlParts[1]
    
    await supabase.storage
      .from('sound-basket')
      .remove([filePath])
  }

  const { error } = await supabase
    .from('sounds')
    .delete()
    .eq('id', soundId)

  if (error) throw error

  return true
}