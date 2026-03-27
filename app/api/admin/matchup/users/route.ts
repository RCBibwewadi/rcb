import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseClient';
import { FORMSPREE_ENDPOINT } from '@/lib/matchup/constants';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    
    let query = supabaseServer
      .from('matchup_users')
      .select('*')
      .order('created_at', { ascending: false });

    if (status && ['pending', 'approved', 'declined'].includes(status)) {
      query = query.eq('status', status);
    }

    const { data: users, error } = await query;

    if (error) throw error;

    return NextResponse.json({ users: users || [] });
  } catch (error) {
    console.error('Get users error:', error);
    return NextResponse.json({ error: 'Failed to get users' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { user_id, action } = await request.json();

    if (!user_id || !action) {
      return NextResponse.json({ error: 'User ID and action are required' }, { status: 400 });
    }

    if (!['approve', 'decline'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    const { data: user, error: fetchError } = await supabaseServer
      .from('matchup_users')
      .select('*')
      .eq('id', user_id)
      .single();

    if (fetchError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const newStatus = action === 'approve' ? 'approved' : 'declined';

    const { error: updateError } = await supabaseServer
      .from('matchup_users')
      .update({ 
        status: newStatus, 
        updated_at: new Date().toISOString(),
        plain_password: null
      })
      .eq('id', user_id);

    if (updateError) throw updateError;

    if (action === 'approve') {
      try {
        const plainPassword = user.plain_password || 'Contact admin for password';
        await fetch(FORMSPREE_ENDPOINT, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            to: user.email,
            name: user.name,
            email: user.email,
            password: plainPassword,
            message: `Dear ${user.name},\n\nGreat news! Your MatchUp registration has been approved.\n\nHere are your login credentials:\nName: ${user.name}\nEmail: ${user.email}\nPassword: ${plainPassword}\n\nLogin at: ${process.env.NEXT_PUBLIC_SITE_URL || 'https://rotaractclubofbibwewadi.org'}/matchup\n\nBest regards,\nRotaract Club of Bibwewadi`
          })
        });
      } catch (emailError) {
        console.error('Failed to send email notification:', emailError);
      }

      await supabaseServer
        .from('matchup_notifications')
        .insert([{
          user_id: user_id,
          type: 'profile_approved',
          title: 'Registration Approved!',
          message: 'Your registration has been approved. You can now log in and complete your profile.'
        }]);
    } else {
      await supabaseServer
        .from('matchup_notifications')
        .insert([{
          user_id: user_id,
          type: 'profile_declined',
          title: 'Registration Declined',
          message: 'Your registration has been declined. Please contact admin for more information.'
        }]);
    }

    return NextResponse.json({ 
      message: `User ${action}d successfully`,
      status: newStatus
    });
  } catch (error) {
    console.error('Update user status error:', error);
    return NextResponse.json({ error: 'Failed to update user status' }, { status: 500 });
  }
}
