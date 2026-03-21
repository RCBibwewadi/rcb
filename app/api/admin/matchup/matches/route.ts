import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseClient';

export async function GET(request: NextRequest) {
  try {
    const { data: matches, error } = await supabaseServer
      .from('matchup_matches')
      .select(`
        *,
        user1:matchup_users!matchup_matches_user1_id_fkey(id, name, email),
        user2:matchup_users!matchup_matches_user2_id_fkey(id, name, email)
      `)
      .in('status', ['confirmed', 'auto_matched'])
      .order('created_at', { ascending: false });

    if (error) throw error;

    const enrichedMatches = await Promise.all((matches || []).map(async (match) => {
      const { data: profile1 } = await supabaseServer
        .from('matchup_profiles')
        .select('username')
        .eq('user_id', match.user1_id)
        .maybeSingle();

      const { data: profile2 } = await supabaseServer
        .from('matchup_profiles')
        .select('username')
        .eq('user_id', match.user2_id)
        .maybeSingle();

      return {
        ...match,
        user1_profile: profile1,
        user2_profile: profile2
      };
    }));

    const matchedUserIds = new Set<string>();
    (matches || []).forEach(match => {
      matchedUserIds.add(match.user1_id);
      matchedUserIds.add(match.user2_id);
    });

    const { data: allUsers, error: usersError } = await supabaseServer
      .from('matchup_users')
      .select('id, name, email, status')
      .eq('status', 'approved');

    if (usersError) throw usersError;

    const unmatchedUsers = await Promise.all(
      (allUsers || [])
        .filter(user => !matchedUserIds.has(user.id))
        .map(async (user) => {
          const { data: profile } = await supabaseServer
            .from('matchup_profiles')
            .select('username')
            .eq('user_id', user.id)
            .maybeSingle();

          return {
            ...user,
            profile
          };
        })
    );

    return NextResponse.json({ matches: enrichedMatches || [], unmatchedUsers });
  } catch (error) {
    console.error('Get admin matches error:', error);
    return NextResponse.json({ error: 'Failed to get matches' }, { status: 500 });
  }
}
