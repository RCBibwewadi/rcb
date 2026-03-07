import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseClient';

export async function POST(request: NextRequest) {
  try {
    const { isVisible } = await request.json();

    const { error } = await supabaseServer
      .from('game_settings')
      .update({ setting_value: isVisible ? 'true' : 'false' })
      .eq('setting_key', 'game_page_visible');

    if (error) throw error;

    return NextResponse.json(
      { message: 'Settings updated successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    );
  }
}
