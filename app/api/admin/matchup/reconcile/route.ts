import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseClient';
import { calculateMatchScore } from '@/lib/matchup/utils';
import { MatchUpPreference, MatchUpPreferenceQuestion } from '@/lib/types';

interface UserWithPrefs {
  id: string;
  name: string;
  gender: string;
  email: string;
  preferences: MatchUpPreference[];
}

interface PotentialMatch {
  user1: UserWithPrefs;
  user2: UserWithPrefs;
  score: number;
}

export async function POST(request: NextRequest) {
  try {
    const { confirm } = await request.json();
    
    const { data: users, error: usersError } = await supabaseServer
      .from('matchup_users')
      .select(`
        id,
        name,
        gender,
        email,
        is_matched,
        preferences:matchup_preferences(*)
      `)
      .eq('status', 'approved')
      .eq('is_matched', false);

    if (usersError) throw usersError;

    const { data: questions } = await supabaseServer
      .from('matchup_preference_questions')
      .select('*')
      .eq('is_active', true);

    const males: UserWithPrefs[] = [];
    const females: UserWithPrefs[] = [];

    (users || []).forEach(user => {
      const userData: UserWithPrefs = {
        id: user.id,
        name: user.name,
        gender: user.gender,
        email: user.email,
        preferences: user.preferences || []
      };

      if (user.gender === 'male') {
        males.push(userData);
      } else if (user.gender === 'female') {
        females.push(userData);
      }
    });

    const potentialMatches: PotentialMatch[] = [];

    for (const male of males) {
      for (const female of females) {
        if (male.preferences.length > 0 && female.preferences.length > 0) {
          const score = calculateMatchScore(
            male.preferences,
            female.preferences,
            questions || []
          );

          potentialMatches.push({
            user1: male,
            user2: female,
            score
          });
        }
      }
    }

    potentialMatches.sort((a, b) => b.score - a.score);

    const matchedUsers = new Set<string>();
    const finalMatches: Array<{
      user1_id: string;
      user2_id: string;
      user1_name: string;
      user2_name: string;
      score: number;
    }> = [];

    for (const match of potentialMatches) {
      if (!matchedUsers.has(match.user1.id) && !matchedUsers.has(match.user2.id)) {
        finalMatches.push({
          user1_id: match.user1.id,
          user2_id: match.user2.id,
          user1_name: match.user1.name,
          user2_name: match.user2.name,
          score: match.score
        });
        matchedUsers.add(match.user1.id);
        matchedUsers.add(match.user2.id);
      }
    }

    if (!confirm) {
      return NextResponse.json({
        preview: true,
        total_males: males.length,
        total_females: females.length,
        potential_matches: potentialMatches.length,
        final_matches: finalMatches,
        unmatched_males: males.filter(m => !matchedUsers.has(m.id)).length,
        unmatched_females: females.filter(f => !matchedUsers.has(f.id)).length
      });
    }

    const matchesToInsert = finalMatches.map(m => ({
      user1_id: m.user1_id,
      user2_id: m.user2_id,
      status: 'confirmed',
      user1_status: 'accepted',
      user2_status: 'accepted',
      match_score: m.score
    }));

    if (matchesToInsert.length > 0) {
      const { error: insertError } = await supabaseServer
        .from('matchup_matches')
        .insert(matchesToInsert);

      if (insertError) throw insertError;

      for (const match of finalMatches) {
        await supabaseServer
          .from('matchup_users')
          .update({ is_matched: true, matched_with: match.user2_id })
          .eq('id', match.user1_id);

        await supabaseServer
          .from('matchup_users')
          .update({ is_matched: true, matched_with: match.user1_id })
          .eq('id', match.user2_id);

        await supabaseServer
          .from('matchup_notifications')
          .insert([
            {
              user_id: match.user1_id,
              type: 'reconciliation_match',
              title: 'You have been matched!',
              message: `You have been matched with ${match.user2_name}!`,
              related_user_id: match.user2_id
            },
            {
              user_id: match.user2_id,
              type: 'reconciliation_match',
              title: 'You have been matched!',
              message: `You have been matched with ${match.user1_name}!`,
              related_user_id: match.user1_id
            }
          ]);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Reconciliation completed successfully',
      matches_created: finalMatches.length,
      matches: finalMatches
    });
  } catch (error) {
    console.error('Reconciliation error:', error);
    return NextResponse.json({ error: 'Failed to perform reconciliation' }, { status: 500 });
  }
}
