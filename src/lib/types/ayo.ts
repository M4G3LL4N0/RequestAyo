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
