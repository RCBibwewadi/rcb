import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseClient';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    let query = supabaseServer
      .from('voting_users')
      .select('id, name, display_name, rid, dob, email, photo_url, plain_password, status, has_voted, has_categorized, has_messaged, created_at, updated_at')
      .order('created_at', { ascending: false });

    if (status && ['pending', 'approved', 'declined'].includes(status)) {
      query = query.eq('status', status);
    }

    const { data: users, error } = await query;
    if (error) throw error;

    return NextResponse.json({ users: users || [] });
  } catch (error) {
    console.error('Get voting users error:', error);
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
      .from('voting_users')
      .select('*')
      .eq('id', user_id)
      .single();

    if (fetchError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const newStatus = action === 'approve' ? 'approved' : 'declined';

    const { error: updateError } = await supabaseServer
      .from('voting_users')
      .update({ status: newStatus, plain_password: null, updated_at: new Date().toISOString() })
      .eq('id', user_id);

    if (updateError) throw updateError;

    return NextResponse.json({ message: `User ${action}d successfully`, status: newStatus });
  } catch (error) {
    console.error('Update voting user status error:', error);
    return NextResponse.json({ error: 'Failed to update user status' }, { status: 500 });
  }
}
