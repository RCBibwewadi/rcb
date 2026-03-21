export const FORMSPREE_ENDPOINT = 'https://formspree.io/f/xreydolw';

export const ZODIAC_SIGNS = [
  'Aries',
  'Taurus', 
  'Gemini',
  'Cancer',
  'Leo',
  'Virgo',
  'Libra',
  'Scorpio',
  'Sagittarius',
  'Capricorn',
  'Aquarius',
  'Pisces'
] as const;

export const DEFAULT_PROMPTS = [
  'What is your idea of a perfect date?',
  'What is the most spontaneous thing you have done?',
  'What are you most passionate about?'
] as const;

export const MATCH_LIMIT = 3;

export const GENDER_OPTIONS: { value: 'male' | 'female' | 'other'; label: string }[] = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' }
];

export const NOTIFICATION_TYPES = {
  NEW_MATCH: 'new_match',
  FINAL_PARTNER: 'final_partner',
  RECONCILIATION_MATCH: 'reconciliation_match',
  PROFILE_APPROVED: 'profile_approved',
  PROFILE_DECLINED: 'profile_declined'
} as const;
