import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseClient';

export async function GET() {
  try {
    const { data: categories, error: catError } = await supabaseServer
      .from('voting_categories')
      .select('*')
      .order('display_order', { ascending: true });

    if (catError) throw catError;

    const categoryIds = (categories || []).map((c) => c.id);

    const [{ data: nominees }, { data: votes }] = await Promise.all([
      categoryIds.length
        ? supabaseServer
            .from('voting_nominees')
            .select('*')
            .in('category_id', categoryIds)
            .order('display_order', { ascending: true })
        : { data: [] },
      categoryIds.length
        ? supabaseServer
            .from('voting_votes')
            .select('nominee_id, category_id')
            .in('category_id', categoryIds)
        : { data: [] },
    ]);

    const voteCounts: Record<string, number> = {};
    for (const v of votes || []) {
      voteCounts[v.nominee_id] = (voteCounts[v.nominee_id] || 0) + 1;
    }

    const result = (categories || []).map((cat) => {
      const catNominees = (nominees || [])
        .filter((n) => n.category_id === cat.id)
        .map((n) => ({ ...n, vote_count: voteCounts[n.id] || 0 }))
        .sort((a, b) => b.vote_count - a.vote_count);

      return { ...cat, nominees: catNominees };
    });

    return NextResponse.json({ categories: result });
  } catch (error) {
    console.error('Get results error:', error);
    return NextResponse.json({ error: 'Failed to get results' }, { status: 500 });
  }
}
