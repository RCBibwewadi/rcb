import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseClient';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-this'
);

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('game_token')?.value;

    if (!token) {
      return NextResponse.json({ completedSeriesIds: [] }, { status: 200 });
    }

    // Verify JWT token
    const { payload } = await jwtVerify(token, JWT_SECRET);
    const userId = payload.userId as string;

    // Get all completed series for this user
    const { data: attempts, error } = await supabaseServer
      .from('quiz_attempts')
      .select('series_id')
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching completed attempts:', error);
      return NextResponse.json({ completedSeriesIds: [] }, { status: 200 });
    }

    // Extract unique series IDs
    const completedSeriesIds = [...new Set(attempts?.map(a => a.series_id) || [])];

    return NextResponse.json({ completedSeriesIds }, { status: 200 });
  } catch (error) {
    console.error('Error checking completed attempts:', error);
    return NextResponse.json({ completedSeriesIds: [] }, { status: 200 });
  }
}
