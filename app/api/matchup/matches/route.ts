import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseClient';
import { jwtVerify } from 'jose';

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

    const { data: matches, error } = await supabaseServer
      .from('matchup_matches')
      .select(`
        *,
        user1:matchup_users!matchup_matches_user1_id_fkey(id, name, gender, email),
        user2:matchup_users!matchup_matches_user2_id_fkey(id, name, gender, email)
      `)
      .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const enrichedMatches = await Promise.all((matches || []).map(async (match) => {
      const partnerId = match.user1_id === userId ? match.user2_id : match.user1_id;
      
      const { data: partnerProfile } = await supabaseServer
        .from('matchup_profiles')
        .select('*')
        .eq('user_id', partnerId)
        .maybeSingle();

      const partner = match.user1_id === userId ? match.user2 : match.user1;

      return {
        ...match,
        partner_id: partnerId,
        partner: {
          ...partner,
          profile: partnerProfile
        }
      };
    }));

    const pendingMatches = enrichedMatches.filter(m => m.status === 'pending');
    const acceptedMatch = enrichedMatches.find(m => 
      m.status === 'accepted' || m.status === 'auto_matched'
    );
    const rejectedMatches = enrichedMatches.filter(m => m.status === 'rejected');

    return NextResponse.json({
      matches: enrichedMatches,
      pending_matches: pendingMatches,
      accepted_match: acceptedMatch || null,
      rejected_matches: rejectedMatches,
      has_accepted_match: !!acceptedMatch,
      pending_count: pendingMatches.length
    });
  } catch (error) {
    console.error('Get matches error:', error);
    return NextResponse.json({ error: 'Failed to get matches' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getUserId(request);
    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { match_id, action } = await request.json();

    if (!match_id || !action) {
      return NextResponse.json({ error: 'Match ID and action are required' }, { status: 400 });
    }

    if (!['accept', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    const { data: match, error: matchError } = await supabaseServer
      .from('matchup_matches')
      .select('*')
      .eq('id', match_id)
      .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
      .single();

    if (matchError || !match) {
      return NextResponse.json({ error: 'Match not found' }, { status: 404 });
    }

    if (match.status !== 'pending') {
      return NextResponse.json({ error: 'Match is not in pending state' }, { status: 400 });
    }

    if (action === 'accept') {
      const partnerId = match.user1_id === userId ? match.user2_id : match.user1_id;

      const { error: updateError } = await supabaseServer
        .from('matchup_matches')
        .update({ status: 'accepted', updated_at: new Date().toISOString() })
        .eq('id', match_id);

      if (updateError) throw updateError;

      await supabaseServer
        .from('matchup_users')
        .update({ is_matched: true, matched_with: partnerId })
        .eq('id', userId);

      await supabaseServer
        .from('matchup_users')
        .update({ is_matched: true, matched_with: userId })
        .eq('id', partnerId);

      await supabaseServer
        .from('matchup_matches')
        .update({ status: 'rejected', updated_at: new Date().toISOString() })
        .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
        .neq('id', match_id)
        .eq('status', 'pending');

      const { data: partnerUser } = await supabaseServer
        .from('matchup_users')
        .select('name')
        .eq('id', partnerId)
        .single();

      await supabaseServer
        .from('matchup_notifications')
        .insert([
          {
            user_id: userId,
            type: 'final_partner',
            title: 'Match Confirmed!',
            message: `You are now matched with ${partnerUser?.name || 'someone'}!`,
            related_user_id: partnerId
          },
          {
            user_id: partnerId,
            type: 'final_partner',
            title: 'Match Confirmed!',
            message: `You are now matched with someone!`,
            related_user_id: userId
          }
        ]);

      return NextResponse.json({ 
        message: 'Match accepted successfully',
        status: 'accepted'
      });
    } else {
      const { error: updateError } = await supabaseServer
        .from('matchup_matches')
        .update({ status: 'rejected', updated_at: new Date().toISOString() })
        .eq('id', match_id);

      if (updateError) throw updateError;

      return NextResponse.json({ 
        message: 'Match rejected',
        status: 'rejected'
      });
    }
  } catch (error) {
    console.error('Match action error:', error);
    return NextResponse.json({ error: 'Failed to process match action' }, { status: 500 });
  }
}
