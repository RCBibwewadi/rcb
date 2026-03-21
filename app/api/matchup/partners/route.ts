import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseClient';
import { jwtVerify } from 'jose';
import { 
  calculateMatchScore, 
  getOppositeGender, 
  sortPartnersByScore,
  filterUnswipedProfiles
} from '@/lib/matchup/utils';
import { MatchUpPreference, MatchUpSwipe } from '@/lib/types';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

async function getUserId(request: NextRequest): Promise<string | null> {
  const token = request.cookies.get('matchup_token')?.value;
  if (!token) return null;
  
  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(JWT_SECRET));
    return payload.type === 'matchup' ? payload.userId as string : null;
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const userId = await getUserId(request);
    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { data: settings } = await supabaseServer
      .from('matchup_settings')
      .select('setting_value')
      .eq('setting_key', 'matching_enabled')
      .single();

    if (!settings?.setting_value) {
      return NextResponse.json({ 
        error: 'Matching is currently disabled',
        matching_enabled: false,
        partners: [] 
      });
    }

    const { data: currentUser } = await supabaseServer
      .from('matchup_users')
      .select('*')
      .eq('id', userId)
      .single();

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (currentUser.is_matched) {
      return NextResponse.json({ 
        error: 'You are already matched',
        is_matched: true,
        partners: [] 
      });
    }

    const { data: pendingMatches } = await supabaseServer
      .from('matchup_matches')
      .select('*')
      .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
      .eq('status', 'pending');

    if (pendingMatches && pendingMatches.length >= 3) {
      return NextResponse.json({ 
        error: 'You have reached the maximum pending matches. Please accept or reject one.',
        max_pending_reached: true,
        pending_matches: pendingMatches,
        partners: [] 
      });
    }

    const oppositeGender = getOppositeGender(currentUser.gender);
    if (!oppositeGender) {
      return NextResponse.json({ 
        error: 'Matching not available for your gender preference',
        partners: [] 
      });
    }

    const { data: userPreferences } = await supabaseServer
      .from('matchup_preferences')
      .select('*')
      .eq('user_id', userId);

    const { data: questions } = await supabaseServer
      .from('matchup_preference_questions')
      .select('*')
      .eq('is_active', true);

    const { data: existingSwipes } = await supabaseServer
      .from('matchup_swipes')
      .select('*')
      .eq('swiper_id', userId);

    const swipedIds = new Set(existingSwipes?.map(s => s.swiped_id) || []);

    const { data: matchedUserIds } = await supabaseServer
      .from('matchup_matches')
      .select('user1_id, user2_id')
      .or(`user1_id.eq.${userId},user2_id.eq.${userId}`);

    const excludedFromPool = new Set<string>();
    excludedFromPool.add(userId);
    matchedUserIds?.forEach(m => {
      excludedFromPool.add(m.user1_id);
      excludedFromPool.add(m.user2_id);
    });

    const { data: potentialPartners, error } = await supabaseServer
      .from('matchup_users')
      .select(`
        *,
        profile:matchup_profiles(*),
        preferences:matchup_preferences(*)
      `)
      .eq('gender', oppositeGender)
      .eq('status', 'approved')
      .eq('is_matched', false)
      .not('id', 'in', `(${Array.from(excludedFromPool).join(',')})`);

    if (error) throw error;

    const partnersWithScores = (potentialPartners || [])
      .filter(p => !swipedIds.has(p.id))
      .map(partner => {
        const partnerPrefs: MatchUpPreference[] = partner.preferences || [];
        const matchScore = calculateMatchScore(
          userPreferences || [],
          partnerPrefs,
          questions || []
        );

        return {
          user: {
            id: partner.id,
            name: partner.name,
            gender: partner.gender,
            rid: partner.rid,
            email: partner.email,
            status: partner.status,
            is_matched: partner.is_matched,
            matched_with: partner.matched_with,
            created_at: partner.created_at,
            updated_at: partner.updated_at
          },
          profile: partner.profile?.[0] || partner.profile || null,
          preferences: partnerPrefs,
          match_score: matchScore,
          already_swiped: false
        };
      });

    const sortedPartners = sortPartnersByScore(partnersWithScores);

    return NextResponse.json({ 
      partners: sortedPartners,
      total_count: sortedPartners.length,
      viewed_count: swipedIds.size
    });
  } catch (error) {
    console.error('Get partners error:', error);
    return NextResponse.json({ error: 'Failed to get partners' }, { status: 500 });
  }
}
