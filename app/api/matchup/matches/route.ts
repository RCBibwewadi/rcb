import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseClient';
import { jwtVerify } from 'jose';
import { UserMatchStatus } from '@/lib/types';

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

async function lockUsersAndRejectOtherMatches(
  userId: string, 
  partnerId: string, 
  confirmedMatchId: string
): Promise<void> {
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
    .update({ 
      status: 'rejected', 
      user1_status: 'rejected', 
      user2_status: 'rejected',
      updated_at: new Date().toISOString() 
    })
    .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
    .neq('id', confirmedMatchId)
    .in('status', ['pending']);
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
      const userStatus = match.user1_id === userId ? match.user1_status : match.user2_status;
      const partnerStatus = match.user1_id === userId ? match.user2_status : match.user1_status;
      
      const { data: partnerProfile } = await supabaseServer
        .from('matchup_profiles')
        .select('*')
        .eq('user_id', partnerId)
        .maybeSingle();

      const partner = match.user1_id === userId ? match.user2 : match.user1;

      return {
        ...match,
        partner_id: partnerId,
        user_status: userStatus,
        partner_status: partnerStatus,
        partner: {
          ...partner,
          profile: partnerProfile
        }
      };
    }));

    const pendingMatches = enrichedMatches.filter(m => m.status === 'pending');
    const confirmedMatch = enrichedMatches.find(m => 
      m.status === 'confirmed' || m.status === 'auto_matched'
    );
    const rejectedMatches = enrichedMatches.filter(m => m.status === 'rejected');

    return NextResponse.json({
      matches: enrichedMatches,
      pending_matches: pendingMatches,
      confirmed_match: confirmedMatch || null,
      rejected_matches: rejectedMatches,
      has_confirmed_match: !!confirmedMatch,
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

    const { data: currentUser } = await supabaseServer
      .from('matchup_users')
      .select('is_matched')
      .eq('id', userId)
      .single();

    if (currentUser?.is_matched && action === 'accept') {
      return NextResponse.json({ error: 'You are already matched with someone' }, { status: 400 });
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

    if (match.status === 'rejected') {
      return NextResponse.json({ error: 'Match has already been rejected' }, { status: 400 });
    }

    if (match.status === 'confirmed') {
      return NextResponse.json({ error: 'Match has already been confirmed' }, { status: 400 });
    }

    const isUser1 = match.user1_id === userId;
    const partnerId = isUser1 ? match.user2_id : match.user1_id;
    const userStatusField = isUser1 ? 'user1_status' : 'user2_status';
    const partnerStatusField = isUser1 ? 'user2_status' : 'user1_status';
    const currentUserStatus: UserMatchStatus = isUser1 ? match.user1_status : match.user2_status;
    const partnerStatus: UserMatchStatus = isUser1 ? match.user2_status : match.user1_status;

    if (action === 'reject') {
      const { error: updateError } = await supabaseServer
        .from('matchup_matches')
        .update({ 
          status: 'rejected', 
          [userStatusField]: 'rejected',
          updated_at: new Date().toISOString() 
        })
        .eq('id', match_id);

      if (updateError) throw updateError;

      await supabaseServer
        .from('matchup_notifications')
        .insert({
          user_id: partnerId,
          type: 'match_rejected',
          title: 'Match Declined',
          message: 'Your match has been declined by the other person.',
          related_user_id: userId
        });

      return NextResponse.json({ 
        message: 'Match rejected',
        status: 'rejected'
      });
    }

    if (currentUserStatus === 'accepted') {
      return NextResponse.json({ 
        message: 'You have already accepted this match',
        status: match.status,
        user_status: currentUserStatus,
        partner_status: partnerStatus
      });
    }

    const newMatchData: Record<string, unknown> = {
      [userStatusField]: 'accepted',
      updated_at: new Date().toISOString()
    };

    let finalStatus = match.status;
    let bothAccepted = false;

    if (partnerStatus === 'accepted') {
      newMatchData.status = 'confirmed';
      finalStatus = 'confirmed';
      bothAccepted = true;
    }

    const { error: updateError } = await supabaseServer
      .from('matchup_matches')
      .update(newMatchData)
      .eq('id', match_id);

    if (updateError) throw updateError;

    if (bothAccepted) {
      await lockUsersAndRejectOtherMatches(userId, partnerId, match_id);

      const { data: partnerUser } = await supabaseServer
        .from('matchup_users')
        .select('name')
        .eq('id', partnerId)
        .single();

      const { data: currentUserData } = await supabaseServer
        .from('matchup_users')
        .select('name')
        .eq('id', userId)
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
            message: `You are now matched with ${currentUserData?.name || 'someone'}!`,
            related_user_id: userId
          }
        ]);

      return NextResponse.json({ 
        message: 'Match confirmed! Both users accepted.',
        status: 'confirmed',
        both_accepted: true
      });
    }

    await supabaseServer
      .from('matchup_notifications')
      .insert({
        user_id: partnerId,
        type: 'match_accepted',
        title: 'Match Accepted!',
        message: 'Someone accepted your match! Check your matches to respond.',
        related_user_id: userId
      });

    return NextResponse.json({ 
      message: 'Match accepted. Waiting for the other person to respond.',
      status: 'pending',
      user_status: 'accepted',
      partner_status: partnerStatus,
      both_accepted: false
    });
  } catch (error) {
    console.error('Match action error:', error);
    return NextResponse.json({ error: 'Failed to process match action' }, { status: 500 });
  }
}
