// src/types/index.ts
export type Category = 'COFFEE' | 'STUDY' | 'LIBRARY' | 'GYM' | 'BAR' | 'FOOD' | 'PARK';
export type Borough = 'MANHATTAN' | 'BROOKLYN' | 'QUEENS' | 'BRONX' | 'STATEN_ISLAND';
export type TrustBadge = 'NEW_CONTRIBUTOR' | 'TRUSTED_LOCAL' | 'TOP_SPOTTER';

export type VibeTag =
  | 'quiet' | 'loud' | 'empty' | 'moderate' | 'packed'
  | 'good_for_studying' | 'good_for_remote_work' | 'social'
  | 'good_music' | 'long_line' | 'easy_seating' | 'wifi_good' | 'not_worth_it';

export interface User {
  id: string;
  email: string;
  username: string;
  createdAt: string;
  profile?: Profile;
  trustScore?: TrustScore;
}

export interface Profile {
  id: string;
  userId: string;
  avatarUrl?: string;
  bio?: string;
  borough?: Borough;
  neighborhood?: string;
  interests: string[];
}

export interface TrustScore {
  score: number;
  badge: TrustBadge;
  totalPings: number;
  upvotesReceived: number;
}

export interface Place {
  id: string;
  name: string;
  address: string;
  neighborhood: string;
  borough: Borough;
  category: Category;
  tags: string[];
  lat: number;
  lng: number;
  avgCrowdLevel?: number;
  avgNoiseLevel?: number;
  avgStudyScore?: number;
  avgWifiScore?: number;
  avgSocialScore?: number;
  vibeScore?: number;
  trendVelocity?: number;
  description?: string;
  recentPings?: Ping[];
  _count?: { pings: number };
  isSaved?: boolean;
}

export interface Ping {
  id: string;
  placeId: string;
  place?: Place;
  userId: string;
  user?: { username: string; trustScore?: TrustScore };
  vibeTags: VibeTag[];
  crowdLevel?: number;
  noiseLevel?: number;
  note?: string;
  upvotes: number;
  createdAt: string;
  expiresAt: string;
  userVote?: boolean | null;
}

export interface Notification {
  id: string;
  type: 'PLACE_TRENDING' | 'PLACE_NEW_PINGS' | 'NEIGHBORHOOD_ACTIVITY';
  placeId?: string;
  place?: Place;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface SavedPlace {
  id: string;
  placeId: string;
  place: Place;
  createdAt: string;
}

// Map filter state
export interface MapFilters {
  categories: Category[];
  vibes: VibeTag[];
  showTrending: boolean;
  showHeatmap: boolean;
}

export const VIBE_TAG_LABELS: Record<VibeTag, string> = {
  quiet: '🤫 Quiet',
  loud: '📢 Loud',
  empty: '🌿 Empty',
  moderate: '👥 Moderate',
  packed: '🔥 Packed',
  good_for_studying: '📚 Good for Studying',
  good_for_remote_work: '💻 Good for Remote Work',
  social: '🎉 Social',
  good_music: '🎵 Good Music',
  long_line: '⏳ Long Line',
  easy_seating: '🪑 Easy Seating',
  wifi_good: '📶 WiFi Good',
  not_worth_it: '👎 Not Worth It',
};

export const CATEGORY_LABELS: Record<Category, string> = {
  COFFEE: '☕ Coffee',
  STUDY: '📚 Study Spot',
  LIBRARY: '🏛️ Library',
  GYM: '💪 Gym',
  BAR: '🍻 Bar',
  FOOD: '🍜 Food',
  PARK: '🌳 Park',
};

export const CATEGORY_COLORS: Record<Category, string> = {
  COFFEE: '#F59E0B',
  STUDY: '#6366F1',
  LIBRARY: '#8B5CF6',
  GYM: '#10B981',
  BAR: '#EC4899',
  FOOD: '#F97316',
  PARK: '#22C55E',
};

export const CROWD_LABELS: Record<number, { label: string; color: string }> = {
  1: { label: 'Empty', color: '#22C55E' },
  2: { label: 'Light', color: '#86EFAC' },
  3: { label: 'Moderate', color: '#FCD34D' },
  4: { label: 'Busy', color: '#F97316' },
  5: { label: 'Packed', color: '#EF4444' },
};

export const BADGE_CONFIG: Record<TrustBadge, { label: string; color: string; icon: string }> = {
  NEW_CONTRIBUTOR: { label: 'New Contributor', color: '#6B7280', icon: '🌱' },
  TRUSTED_LOCAL: { label: 'Trusted Local', color: '#F59E0B', icon: '⭐' },
  TOP_SPOTTER: { label: 'Top Spotter', color: '#EC4899', icon: '🏆' },
};
