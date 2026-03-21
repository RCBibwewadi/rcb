import { 
  MatchUpPreference, 
  MatchUpPreferenceQuestion,
  PartnerWithScore,
  MatchUpUser,
  MatchUpProfile,
  MatchUpSwipe
} from '@/lib/types';

export function getZodiacSign(date: Date): string {
  const month = date.getMonth() + 1;
  const day = date.getDate();

  if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return 'Capricorn';
  if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return 'Aquarius';
  if ((month === 2 && day >= 19) || (month === 3 && day <= 20)) return 'Pisces';
  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return 'Aries';
  if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return 'Taurus';
  if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return 'Gemini';
  if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return 'Cancer';
  if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return 'Leo';
  if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return 'Virgo';
  if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return 'Libra';
  if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return 'Scorpio';
  return 'Sagittarius';
}

export function calculateMatchScore(
  userPreferences: MatchUpPreference[],
  partnerPreferences: MatchUpPreference[],
  questions: MatchUpPreferenceQuestion[]
): number {
  const questionMap = new Map(questions.map(q => [q.id, q]));
  let totalWeight = 0;
  let weightedScore = 0;

  const userPrefMap = new Map(userPreferences.map(p => [p.question_id, p.answer_value]));
  const partnerPrefMap = new Map(partnerPreferences.map(p => [p.question_id, p.answer_value]));

  for (const [questionId, question] of questionMap) {
    const userAnswer = userPrefMap.get(questionId);
    const partnerAnswer = partnerPrefMap.get(questionId);

    if (userAnswer !== undefined && partnerAnswer !== undefined) {
      const weight = question.weight;
      totalWeight += weight;
      
      const diff = Math.abs(userAnswer - partnerAnswer);
      const maxDiff = 100;
      const similarity = ((maxDiff - diff) / maxDiff) * 100;
      
      weightedScore += similarity * weight;
    }
  }

  if (totalWeight === 0) return 0;
  return Math.round((weightedScore / totalWeight) * 100) / 100;
}

export function getOppositeGender(gender: 'male' | 'female' | 'other'): 'male' | 'female' | null {
  if (gender === 'male') return 'female';
  if (gender === 'female') return 'male';
  return null;
}

export function sortPartnersByScore(partners: PartnerWithScore[]): PartnerWithScore[] {
  return [...partners].sort((a, b) => b.match_score - a.match_score);
}

export function filterUnswipedProfiles(
  partners: PartnerWithScore[],
  swipes: MatchUpSwipe[]
): PartnerWithScore[] {
  const swipedIds = new Set(swipes.map(s => s.swiped_id));
  return partners.filter(p => !swipedIds.has(p.user.id));
}

export function hasReachedMatchLimit(acceptedMatches: number): boolean {
  return acceptedMatches >= 1;
}

export function canUserMatch(
  user: MatchUpUser,
  pendingMatchesCount: number
): { canMatch: boolean; reason?: string } {
  if (user.is_matched) {
    return { canMatch: false, reason: 'You are already matched with someone' };
  }
  
  if (pendingMatchesCount >= 3) {
    return { canMatch: false, reason: 'You have reached the maximum pending matches' };
  }

  return { canMatch: true };
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePassword(password: string): { valid: boolean; error?: string } {
  if (password.length < 6) {
    return { valid: false, error: 'Password must be at least 6 characters' };
  }
  return { valid: true };
}

export function validateRID(rid: string): boolean {
  return rid.trim().length >= 3;
}

export function validateName(name: string): boolean {
  return name.trim().length >= 2 && name.trim().length <= 100;
}

export function formatMatchScore(score: number): string {
  return `${Math.round(score)}%`;
}

export function getAgeFromDOB(dob: string): number | null {
  if (!dob) return null;
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export function generateRandomId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}
