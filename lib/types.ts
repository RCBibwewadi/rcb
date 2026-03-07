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

// Game System Types
export interface GameUser {
  id: string;
  username: string;
  name: string;
  email: string;
  phone_number: string;
  rid: string;
  created_at: string;
  last_login?: string;
  is_blocked: boolean;
}

export interface SeriesCard {
  id: string;
  name: string;
  image_url: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  display_order: number;
}

export interface Question {
  id: string;
  series_id: string;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: 'A' | 'B' | 'C' | 'D';
  question_order: number;
}

export interface QuizAttempt {
  id: string;
  user_id: string;
  series_id: string;
  score: number;
  time_taken: number;
  completed_at: string;
  answers: Record<string, string>;
}

export interface LeaderboardEntry {
  username: string;
  score: number;
  time_taken: number;
  completed_at: string;
  rank: number;
}

export interface GlobalLeaderboardEntry {
  username: string;
  total_series_attempted: number;
  total_questions_correct: number;
  avg_time_per_quiz: number;
  total_score: number;
  rank: number;
}
