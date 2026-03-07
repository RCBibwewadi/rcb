import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('game_settings')
      .select('*')
      .eq('setting_key', 'game_page_visible')
      .single();

    if (error) throw error;

    return NextResponse.json(
      { isVisible: data?.setting_value === 'true' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching game settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}
