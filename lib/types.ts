/* eslint-disable @typescript-eslint/no-explicit-any */
export interface HeroContent {
  backgroundImage: string;
  title: string;
  subtitle: string;
  description: string;
  ctaText: string;
}

export interface AboutContent {
  title: string;
  mainTitle: string;
  description1: string;
  description2: string;
  description3: string;
}

export interface BoardMember {
  id: number;
  name: string;
  position: string;
  description: string;
  image: string;
  gradient: string;
  initial: string;
}

export interface Project {
  title: string;
  description: string;
  image: string;
}

export interface ContentData {
  hero: HeroContent;
  about: AboutContent;
  boardMembers: BoardMember[];
  projects: Project[];
  events: any[];   // you’ll define event structure later
  contact: any;    // same for contact
  siteConfig: {
    siteName: string;
    tagline: string;
    clubLogo: string;
    adminPassword: string;
  };
}


export type MatchUpUserStatus = 'pending' | 'approved' | 'declined';
export type MatchUpGender = 'male' | 'female' | 'other';
export type SwipeDirection = 'left' | 'right';
export type MatchStatus = 'pending' | 'accepted' | 'rejected' | 'auto_matched';

export interface MatchUpUser {
  id: string;
  name: string;
  gender: MatchUpGender;
  rid: string;
  email: string;
  status: MatchUpUserStatus;
  is_matched: boolean;
  matched_with?: string;
  created_at: string;
  updated_at: string;
}

export interface MatchUpProfile {
  id: string;
  user_id: string;
  username?: string;
  dob?: string;
  zodiac_sign?: string;
  photo1_url?: string;
  photo2_url?: string;
  photo3_url?: string;
  prompt1?: string;
  prompt2?: string;
  prompt3?: string;
  created_at: string;
  updated_at: string;
}

export interface MatchUpPreferenceQuestion {
  id: string;
  question: string;
  weight: number;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface MatchUpPreference {
  id: string;
  user_id: string;
  question_id: string;
  answer_value: number;
  created_at: string;
  updated_at: string;
}

export interface MatchUpSwipe {
  id: string;
  swiper_id: string;
  swiped_id: string;
  direction: SwipeDirection;
  created_at: string;
}

export interface MatchUpMatch {
  id: string;
  user1_id: string;
  user2_id: string;
  status: MatchStatus;
  match_score?: number;
  created_at: string;
  updated_at: string;
  partner?: {
    id: string;
    name: string;
    gender: string;
    rid: string;
    email: string;
    status: string;
    is_matched: boolean;
    matched_with?: string;
    created_at: string;
    updated_at: string;
    profile?: MatchUpProfile;
  };
}

export interface MatchUpNotification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  related_user_id?: string;
  is_read: boolean;
  created_at: string;
}

export interface MatchUpSettings {
  id: string;
  setting_key: string;
  setting_value: boolean;
  updated_at: string;
}

export interface PartnerWithScore {
  user: MatchUpUser;
  profile?: MatchUpProfile;
  preferences: MatchUpPreference[];
  match_score: number;
  already_swiped: boolean;
  swipe_direction?: SwipeDirection;
}

export interface MatchUpSession {
  user: MatchUpUser;
  profile?: MatchUpProfile;
  has_completed_profile: boolean;
  has_completed_preferences: boolean;
}
