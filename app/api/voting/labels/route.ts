import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseClient';

export async function GET() {
  try {
    const { data: labels, error } = await supabaseServer
      .from('voting_label_categories')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true })
      .limit(3);

    if (error) throw error;

    return NextResponse.json({ labels: labels || [] });
  } catch (error) {
    console.error('Get labels error:', error);
    return NextResponse.json({ error: 'Failed to get labels' }, { status: 500 });
  }
}
