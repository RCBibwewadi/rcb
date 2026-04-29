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

// labels: [{ labeled_user_id, label_category_id }]
export async function POST(request: NextRequest) {
  try {
    const userId = await getUserId(request);
    if (!userId) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const { data: user } = await supabaseServer
      .from('voting_users')
      .select('has_categorized')
      .eq('id', userId)
      .single();

    if (user?.has_categorized) {
      return NextResponse.json({ error: 'You have already completed categorization' }, { status: 409 });
    }

    const { labels } = await request.json();
    if (!Array.isArray(labels) || labels.length !== 3) {
      return NextResponse.json({ error: 'You must categorize exactly 3 users' }, { status: 400 });
    }

    for (const l of labels) {
      if (!l.labeled_user_id || !l.label_category_id) {
        return NextResponse.json({ error: 'Each label must have labeled_user_id and label_category_id' }, { status: 400 });
      }
      if (l.labeled_user_id === userId) {
        return NextResponse.json({ error: 'Cannot label yourself' }, { status: 400 });
      }
    }

    const insertData = labels.map((l) => ({
      labeler_id: userId,
      labeled_user_id: l.labeled_user_id,
      label_category_id: l.label_category_id
    }));

    const { error: insertError } = await supabaseServer
      .from('voting_user_labels')
      .insert(insertData);

    if (insertError) throw insertError;

    await supabaseServer
      .from('voting_users')
      .update({ has_categorized: true, updated_at: new Date().toISOString() })
      .eq('id', userId);

    return NextResponse.json({ message: 'Categorization submitted successfully' });
  } catch (error) {
    console.error('Categorize error:', error);
    return NextResponse.json({ error: 'Failed to submit categorization' }, { status: 500 });
  }
}
