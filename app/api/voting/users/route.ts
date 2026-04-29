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

// Returns 3 random approved users (excluding self) for the categorization step
export async function GET(request: NextRequest) {
  try {
    const userId = await getUserId(request);
    if (!userId) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    // Get users already labeled by this user
    const { data: alreadyLabeled } = await supabaseServer
      .from('voting_user_labels')
      .select('labeled_user_id')
      .eq('labeler_id', userId);

    const labeledIds = new Set((alreadyLabeled || []).map((l) => l.labeled_user_id));
    labeledIds.add(userId);

    const { data: users, error } = await supabaseServer
      .from('voting_users')
      .select('id, name, display_name, photo_url')
      .eq('status', 'approved')
      .not('id', 'in', `(${[...labeledIds].join(',')})`)
      .limit(50);

    if (error) throw error;

    const pool = users || [];
    // Shuffle and pick 3
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }

    return NextResponse.json({ users: pool.slice(0, 3) });
  } catch (error) {
    console.error('Get users error:', error);
    return NextResponse.json({ error: 'Failed to get users' }, { status: 500 });
  }
}
