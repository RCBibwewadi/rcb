import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ seriesId: string }> }
) {
  try {
    const { seriesId } = await params;

    const { data, error } = await supabase.rpc('get_series_leaderboard', {
      series_uuid: seriesId,
    });

    if (error) throw error;

    return NextResponse.json({ leaderboard: data || [] }, { status: 200 });
  } catch (error) {
    console.error('Error fetching series leaderboard:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leaderboard' },
      { status: 500 }
    );
  }
}
