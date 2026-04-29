import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseClient';
import { jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

async function getUserId(request: NextRequest): Promise<string | null> {
  const token = request.cookies.get('voting_token')?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(JWT_SECRET));
    return payload.type === 'voting' ? (payload.userId as string) : null;
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const userId = await getUserId(request);
    if (!userId) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const { data: votes, error } = await supabaseServer
      .from('voting_votes')
      .select('*')
      .eq('user_id', userId);

    if (error) throw error;

    return NextResponse.json({ votes: votes || [] });
  } catch (error) {
    console.error('Get votes error:', error);
    return NextResponse.json({ error: 'Failed to get votes' }, { status: 500 });
  }
}

// votes: [{ category_id, nominee_id }]
export async function POST(request: NextRequest) {
  try {
    const userId = await getUserId(request);
    if (!userId) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const { data: user } = await supabaseServer
      .from('voting_users')
      .select('has_voted')
      .eq('id', userId)
      .single();

    if (user?.has_voted) {
      return NextResponse.json({ error: 'You have already voted' }, { status: 409 });
    }

    const { votes } = await request.json();
    if (!Array.isArray(votes) || votes.length === 0) {
      return NextResponse.json({ error: 'Votes are required' }, { status: 400 });
    }

    // Validate each vote has category_id and nominee_id
    for (const v of votes) {
      if (!v.category_id || !v.nominee_id) {
        return NextResponse.json({ error: 'Each vote must have category_id and nominee_id' }, { status: 400 });
      }
    }

    // Get all active categories to ensure all are covered
    const { data: categories } = await supabaseServer
      .from('voting_categories')
      .select('id')
      .eq('is_active', true);

    const activeCategoryIds = new Set((categories || []).map((c) => c.id));
    const votedCategoryIds = new Set(votes.map((v) => v.category_id));

    for (const catId of activeCategoryIds) {
      if (!votedCategoryIds.has(catId)) {
        return NextResponse.json({ error: 'You must vote in all categories' }, { status: 400 });
      }
    }

    const insertData = votes.map((v) => ({
      user_id: userId,
      category_id: v.category_id,
      nominee_id: v.nominee_id
    }));

    const { error: insertError } = await supabaseServer
      .from('voting_votes')
      .insert(insertData);

    if (insertError) throw insertError;

    await supabaseServer
      .from('voting_users')
      .update({ has_voted: true, updated_at: new Date().toISOString() })
      .eq('id', userId);

    return NextResponse.json({ message: 'Votes submitted successfully' });
  } catch (error) {
    console.error('Submit votes error:', error);
    return NextResponse.json({ error: 'Failed to submit votes' }, { status: 500 });
  }
}
