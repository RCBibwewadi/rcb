import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseClient';

export async function GET() {
  try {
    const { data: categories, error } = await supabaseServer
      .from('voting_categories')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (error) throw error;

    const categoryIds = (categories || []).map((c) => c.id);

    const { data: nominees } = categoryIds.length
      ? await supabaseServer
          .from('voting_nominees')
          .select('*')
          .in('category_id', categoryIds)
          .order('display_order', { ascending: true })
      : { data: [] };

    const result = (categories || []).map((cat) => ({
      ...cat,
      nominees: (nominees || []).filter((n) => n.category_id === cat.id)
    }));

    return NextResponse.json({ categories: result });
  } catch (error) {
    console.error('Get categories error:', error);
    return NextResponse.json({ error: 'Failed to get categories' }, { status: 500 });
  }
}
