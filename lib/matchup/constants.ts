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
  'Your "this is so me" moment',
  'A Habit you\'ll probably never change',
  'Something you\'ve been meaning to do but haven\'t yet',
  'One thing you thik people should do more often',
  'Something you\'d like to get better at (just for yourself)'
] as const;

export const MATCH_LIMIT = 3;

export const GENDER_OPTIONS: { value: 'male' | 'female' | 'other'; label: string }[] = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' }
];

export const NOTIFICATION_TYPES = {
  NEW_MATCH: 'new_match',
  MATCH_ACCEPTED: 'match_accepted',
  MATCH_REJECTED: 'match_rejected',
  FINAL_PARTNER: 'final_partner',
  RECONCILIATION_MATCH: 'reconciliation_match',
  PROFILE_APPROVED: 'profile_approved',
  PROFILE_DECLINED: 'profile_declined'
} as const;
