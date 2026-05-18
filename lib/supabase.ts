import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://figtuyydceiqcqqlyzhj.supabase.co'

const supabaseAnonKey =
  'sb_publishable_9kEjhPikMyOzdOnPcoaAWA_7WKOrkCi'

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey
)

export const BUCKET_NAME = 'fotos'
export const GUEST_FOLDER = 'invitados'
