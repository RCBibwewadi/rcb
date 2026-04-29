import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseClient';
import { jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('voting_token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { payload } = await jwtVerify(token, new TextEncoder().encode(JWT_SECRET));
    if (payload.type !== 'voting') {
      return NextResponse.json({ error: 'Invalid token type' }, { status: 401 });
    }

    const { data: user, error } = await supabaseServer
      .from('voting_users')
      .select('*')
      .eq('id', payload.userId)
      .single();

    if (error || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      user: {
        id: user.id, name: user.name, display_name: user.display_name,
        email: user.email, rid: user.rid, dob: user.dob, photo_url: user.photo_url,
        status: user.status, has_voted: user.has_voted,
        has_categorized: user.has_categorized, has_messaged: user.has_messaged
      },
      has_completed_profile: !!user.photo_url,
      has_voted: user.has_voted,
      has_categorized: user.has_categorized,
      has_messaged: user.has_messaged
    });
  } catch (error) {
    console.error('Session error:', error);
    return NextResponse.json({ error: 'Invalid or expired session' }, { status: 401 });
  }
}
