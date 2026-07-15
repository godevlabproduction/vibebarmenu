import { supabase } from './supabase'

// Best-effort delete of an uploaded file given its public URL.
// Failures are ignored — a leftover file is harmless, a blocked save is not.
export async function removeStorageFile(url) {
  if (!url) return
  const marker = '/menu-images/'
  const idx = url.indexOf(marker)
  if (idx === -1) return
  const path = decodeURIComponent(url.slice(idx + marker.length))
  try {
    await supabase.storage.from('menu-images').remove([path])
  } catch {
    // ignore
  }
}
