export interface Profile {
  id: string
  username: string
  display_name: string | null
  bio: string | null
  avatar_url: string | null
  tier: 'scout' | 'explorer' | 'crawler'
  finds_count: number
  drops_count: number
  ftc_count: number
  current_streak: number
  longest_streak: number
  created_at: string
}

export interface Cache {
  id: string
  url: string
  url_hash: string
  name: string
  clue: string
  message: string
  hint: string | null
  difficulty: number
  category: string | null
  owner_id: string | null
  owner_display: string | null
  trail_id: string | null
  trail_order: number | null
  is_seed: boolean
  is_active: boolean
  finds_count: number
  created_at: string
}

export interface Trail {
  id: string
  name: string
  description: string | null
  owner_id: string | null
  difficulty: number
  cache_count: number
  estimated_time: string | null
  is_seed: boolean
  is_active: boolean
  completions_count: number
  created_at: string
  caches?: Cache[]
}

export interface Find {
  id: string
  cache_id: string
  user_id: string
  is_ftc: boolean
  log_text: string | null
  found_at: string
}

export interface TrailProgress {
  id: string
  trail_id: string
  user_id: string
  caches_found: number
  completed_at: string | null
  started_at: string
}
