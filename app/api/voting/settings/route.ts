import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseClient';

export async function GET() {
  try {
    const { data, error } = await supabaseServer
      .from('voting_settings')
      .select('setting_value')
      .eq('setting_key', 'voting_enabled')
      .single();

    if (error && error.code !== 'PGRST116') throw error;

    return NextResponse.json({ voting_enabled: data?.setting_value ?? false });
  } catch (error) {
    console.error('Get voting settings error:', error);
    return NextResponse.json({ voting_enabled: false });
  }
}
