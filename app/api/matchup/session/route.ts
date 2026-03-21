import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseClient';
import { jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('matchup_token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const { payload } = await jwtVerify(token, new TextEncoder().encode(JWT_SECRET));

    if (payload.type !== 'matchup') {
      return NextResponse.json(
        { error: 'Invalid token type' },
        { status: 401 }
      );
    }

    const { data: user, error } = await supabaseServer
      .from('matchup_users')
      .select('*')
      .eq('id', payload.userId)
      .single();

    if (error || !user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const { data: profile } = await supabaseServer
      .from('matchup_profiles')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    const { data: preferences } = await supabaseServer
      .from('matchup_preferences')
      .select('*')
      .eq('user_id', user.id);

    const hasCompletedProfile = !!(profile?.username && profile?.dob);
    const hasCompletedPreferences = !!(preferences && preferences.length > 0);

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        gender: user.gender,
        rid: user.rid,
        status: user.status,
        is_matched: user.is_matched,
        matched_with: user.matched_with
      },
      profile: profile || null,
      preferences: preferences || [],
      has_completed_profile: hasCompletedProfile,
      has_completed_preferences: hasCompletedPreferences
    });
  } catch (error) {
    console.error('Session error:', error);
    return NextResponse.json(
      { error: 'Invalid or expired session' },
      { status: 401 }
    );
  }
}
