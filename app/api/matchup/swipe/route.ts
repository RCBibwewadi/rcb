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

export async function POST(request: NextRequest) {
  try {
    const userId = await getUserId(request);
    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { swiped_id, direction } = await request.json();

    if (!swiped_id || !direction) {
      return NextResponse.json({ error: 'Swiped ID and direction are required' }, { status: 400 });
    }

    if (!['left', 'right'].includes(direction)) {
      return NextResponse.json({ error: 'Invalid direction' }, { status: 400 });
    }

    if (userId === swiped_id) {
      return NextResponse.json({ error: 'Cannot swipe on yourself' }, { status: 400 });
    }

    const { data: currentUser } = await supabaseServer
      .from('matchup_users')
      .select('*')
      .eq('id', userId)
      .single();

    if (!currentUser || currentUser.is_matched) {
      return NextResponse.json({ error: 'You are already matched' }, { status: 400 });
    }

    const { data: swipedUser } = await supabaseServer
      .from('matchup_users')
      .select('is_matched')
      .eq('id', swiped_id)
      .single();

    if (swipedUser?.is_matched) {
      return NextResponse.json({ error: 'This user is already matched' }, { status: 400 });
    }

    const { error: swipeError } = await supabaseServer
      .from('matchup_swipes')
      .upsert(
        { swiper_id: userId, swiped_id, direction },
        { onConflict: 'swiper_id,swiped_id' }
      );

    if (swipeError) {
      console.error('Swipe error:', swipeError);
      throw swipeError;
    }

    let isMatch = false;

    if (direction === 'right') {
      const { data: reverseSwipe } = await supabaseServer
        .from('matchup_swipes')
        .select('*')
        .eq('swiper_id', swiped_id)
        .eq('swiped_id', userId)
        .eq('direction', 'right')
        .maybeSingle();

      if (reverseSwipe) {
        const { data: existingMatch } = await supabaseServer
          .from('matchup_matches')
          .select('*')
          .or(`and(user1_id.eq.${userId},user2_id.eq.${swiped_id}),and(user1_id.eq.${swiped_id},user2_id.eq.${userId})`)
          .maybeSingle();

        if (!existingMatch) {
          const { error: matchError } = await supabaseServer
            .from('matchup_matches')
            .insert([{
              user1_id: userId,
              user2_id: swiped_id,
              status: 'pending',
              user1_status: 'pending',
              user2_status: 'pending'
            }]);

          if (matchError) {
            console.error('Match creation error:', matchError);
          } else {
            isMatch = true;

            await supabaseServer
              .from('matchup_notifications')
              .insert([
                {
                  user_id: userId,
                  type: 'new_match',
                  title: 'New Match!',
                  message: 'You have a new match! Check your matches to respond.',
                  related_user_id: swiped_id
                },
                {
                  user_id: swiped_id,
                  type: 'new_match',
                  title: 'New Match!',
                  message: 'You have a new match! Check your matches to respond.',
                  related_user_id: userId
                }
              ]);
          }
        }
      }
    }

    return NextResponse.json({ 
      success: true, 
      is_match: isMatch,
      message: isMatch ? "It's a match!" : 'Swipe recorded'
    });
  } catch (error) {
    console.error('Swipe error:', error);
    return NextResponse.json({ error: 'Failed to record swipe' }, { status: 500 });
  }
}
