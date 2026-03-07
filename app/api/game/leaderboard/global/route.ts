import { NextResponse } from 'next/server';
import { supabaseServer  } from '@/lib/supabaseClient';

export async function GET() {
  try {
    const { data, error } = await supabaseServer .rpc('get_global_leaderboard');
    if (error) throw error;

    return NextResponse.json({ leaderboard: data || [] }, { status: 200 });
  } catch (error) {
    console.error('Error fetching global leaderboard:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leaderboard' },
      { status: 500 }
    );
  }
}
