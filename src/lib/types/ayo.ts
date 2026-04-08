export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json }
  | Json[];

export type UserProfileRow = {
  id: string;
  email: string | null;
  full_name: string | null;
  home_city: string | null;
  budget_sensitivity: number;
  speed_sensitivity: number;
  trust_sensitivity: number;
  convenience_sensitivity: number;
  preferences: Json;
  disliked_providers: Json;
  preferred_categories: Json;
  created_at: string;
  updated_at: string;
};

export type AyoRequestRow = {
  id: string;
  user_profile_id: string | null;
  email: string | null;
  request_text: string;
  request_category: string | null;
  request_context: Json;
  response_summary: string | null;
  selected_option: Json | null;
  completion_status: string;
  completed_at: string | null;
  selected_provider_name: string | null;
  selected_provider_type: string | null;
  selected_score: number | null;
  explanation: Json;
  created_at: string;
};

export type ProviderRecommendationRow = {
  id: string;
  ayo_request_id: string;
  provider_type: string;
  provider_name: string;
  score: number;
  price_estimate: string | null;
  eta_estimate: string | null;
  trust_score: number | null;
  notes: string | null;
  metadata: Json;
  created_at: string;
};

export type FeedbackEventRow = {
  id: string;
  ayo_request_id: string;
  user_profile_id: string | null;
  event_type: string;
  rating: number | null;
  feedback_text: string | null;
  metadata: Json;
  created_at: string;
};

export type AyoReasoning = {
  topReason: string;
  tradeoff?: string;
  whyNow?: string;
  confidence?: number;
};

export type AyoOption = {
  providerType: string;
  providerName: string;
  baseScore: number;
  adjustedScore: number;
  priceEstimate?: string;
  etaEstimate?: string;
  trustScore?: number;
  notes?: string;
  reasoning: string[];
  flags?: string[];
  metadata?: Record<string, unknown>;
  reasoningDetails?: {
    topReason?: string;
    tradeoff?: string;
    whyNow?: string;
    confidence?: number;
  };
};

export type AyoResult = {
  category: string;
  summary: string;
  primaryRecommendation?: AyoOption;
  alternatives?: AyoOption[];
  options?: AyoOption[];
};
