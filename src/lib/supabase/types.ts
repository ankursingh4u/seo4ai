export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      brands: {
        Row: {
          id: string
          user_id: string
          brand_name: string
          website: string | null
          industry: string
          competitors: string[]
          market_region: { type: string; country?: string; state?: string; city?: string } | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          brand_name: string
          website?: string | null
          industry: string
          competitors?: string[]
          market_region?: { type: string; country?: string; state?: string; city?: string } | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          brand_name?: string
          website?: string | null
          industry?: string
          competitors?: string[]
          market_region?: { type: string; country?: string; state?: string; city?: string } | null
          updated_at?: string
        }
      }
      scans: {
        Row: {
          id: string
          brand_id: string
          scan_date: string
          visibility_score: number
          mention_count: number
          competitor_mention_count: number
          status: 'pending' | 'running' | 'completed' | 'failed'
          created_at: string
        }
        Insert: {
          id?: string
          brand_id: string
          scan_date?: string
          visibility_score?: number
          mention_count?: number
          competitor_mention_count?: number
          status?: 'pending' | 'running' | 'completed' | 'failed'
          created_at?: string
        }
        Update: {
          visibility_score?: number
          mention_count?: number
          competitor_mention_count?: number
          status?: 'pending' | 'running' | 'completed' | 'failed'
        }
      }
      prompt_results: {
        Row: {
          id: string
          scan_id: string
          prompt: string
          ai_model: string
          ai_response: string | null
          brand_mentioned: boolean
          brand_sentiment: 'positive' | 'neutral' | 'negative' | null
          competitors_mentioned: string[]
          sentiment_score: number
          position: number | null
          created_at: string
        }
        Insert: {
          id?: string
          scan_id: string
          prompt: string
          ai_model?: string
          ai_response?: string | null
          brand_mentioned?: boolean
          brand_sentiment?: 'positive' | 'neutral' | 'negative' | null
          competitors_mentioned?: string[]
          sentiment_score?: number
          position?: number | null
          created_at?: string
        }
        Update: {
          ai_response?: string | null
          brand_mentioned?: boolean
          brand_sentiment?: 'positive' | 'neutral' | 'negative' | null
          competitors_mentioned?: string[]
          sentiment_score?: number
          position?: number | null
        }
      }
      competitor_analysis: {
        Row: {
          id: string
          scan_id: string
          competitor_name: string
          mention_count: number
          gap_score: number
          avg_position: number | null
          prompts_appeared: string[]
          created_at: string
        }
        Insert: {
          id?: string
          scan_id: string
          competitor_name: string
          mention_count?: number
          gap_score?: number
          avg_position?: number | null
          prompts_appeared?: string[]
          created_at?: string
        }
        Update: {
          mention_count?: number
          gap_score?: number
          avg_position?: number | null
          prompts_appeared?: string[]
        }
      }
      prompt_opportunities: {
        Row: {
          id: string
          scan_id: string
          prompt: string
          competitors_found: string[]
          opportunity_score: number
          search_intent: string | null
          created_at: string
        }
        Insert: {
          id?: string
          scan_id: string
          prompt: string
          competitors_found?: string[]
          opportunity_score?: number
          search_intent?: string | null
          created_at?: string
        }
        Update: {
          competitors_found?: string[]
          opportunity_score?: number
          search_intent?: string | null
        }
      }
      recommendations: {
        Row: {
          id: string
          scan_id: string
          task_title: string
          task_description: string | null
          category: 'content' | 'technical' | 'authority' | 'optimization'
          priority: 'high' | 'medium' | 'low'
          impact_score: number
          difficulty: 'easy' | 'medium' | 'hard'
          completed: boolean
          created_at: string
        }
        Insert: {
          id?: string
          scan_id: string
          task_title: string
          task_description?: string | null
          category?: 'content' | 'technical' | 'authority' | 'optimization'
          priority?: 'high' | 'medium' | 'low'
          impact_score?: number
          difficulty?: 'easy' | 'medium' | 'hard'
          completed?: boolean
          created_at?: string
        }
        Update: {
          task_title?: string
          task_description?: string | null
          category?: 'content' | 'technical' | 'authority' | 'optimization'
          priority?: 'high' | 'medium' | 'low'
          impact_score?: number
          difficulty?: 'easy' | 'medium' | 'hard'
          completed?: boolean
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type Brand = Database['public']['Tables']['brands']['Row']
export type Scan = Database['public']['Tables']['scans']['Row']
export type PromptResult = Database['public']['Tables']['prompt_results']['Row']
export type CompetitorAnalysis = Database['public']['Tables']['competitor_analysis']['Row']
export type PromptOpportunity = Database['public']['Tables']['prompt_opportunities']['Row']
export type Recommendation = Database['public']['Tables']['recommendations']['Row']
