import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseClient';

export async function GET() {
  try {
    const { data: settings, error } = await supabaseServer
      .from('matchup_settings')
      .select('*');

    if (error) throw error;

    const settingsMap: Record<string, boolean> = {};
    settings?.forEach(s => {
      settingsMap[s.setting_key] = s.setting_value;
    });

    return NextResponse.json({ settings: settingsMap });
  } catch (error) {
    console.error('Get settings error:', error);
    return NextResponse.json({ error: 'Failed to get settings' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { setting_key, setting_value } = await request.json();

    if (!setting_key) {
      return NextResponse.json({ error: 'Setting key is required' }, { status: 400 });
    }

    if (typeof setting_value !== 'boolean') {
      return NextResponse.json({ error: 'Setting value must be a boolean' }, { status: 400 });
    }

    const { data, error } = await supabaseServer
      .from('matchup_settings')
      .upsert(
        { setting_key, setting_value, updated_at: new Date().toISOString() },
        { onConflict: 'setting_key' }
      )
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ setting: data });
  } catch (error) {
    console.error('Update setting error:', error);
    return NextResponse.json({ error: 'Failed to update setting' }, { status: 500 });
  }
}
