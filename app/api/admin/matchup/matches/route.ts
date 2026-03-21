import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseClient';

export async function GET() {
  try {
    const { data: matches, error } = await supabaseServer
      .from('matchup_matches')
      .select(`
        *,
        user1:matchup_users!matchup_matches_user1_id_fkey(id, name, email, gender),
        user2:matchup_users!matchup_matches_user2_id_fkey(id, name, email, gender)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ matches: matches || [] });
  } catch (error) {
    console.error('Get admin matches error:', error);
    return NextResponse.json({ error: 'Failed to get matches' }, { status: 500 });
  }
}
