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

    return NextResponse.json({ 
      settings: settingsMap,
      matching_enabled: settingsMap['matching_enabled'] ?? false
    });
  } catch (error) {
    console.error('Get settings error:', error);
    return NextResponse.json({ error: 'Failed to get settings' }, { status: 500 });
  }
}
