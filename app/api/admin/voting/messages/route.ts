import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseClient';

export async function GET() {
  try {
    const { data: messages, error } = await supabaseServer
      .from('voting_anonymous_messages')
      .select('id, message, created_at, user_id')
      .order('created_at', { ascending: false });

    if (error) throw error;

    const userIds = [...new Set((messages || []).map((m) => m.user_id))];

    const { data: users } = userIds.length
      ? await supabaseServer
          .from('voting_users')
          .select('id, name, display_name, photo_url')
          .in('id', userIds)
      : { data: [] };

    const userMap: Record<string, { id: string; name: string; display_name?: string; photo_url?: string }> = {};
    for (const u of users || []) {
      userMap[u.id] = u;
    }

    const result = (messages || []).map((m) => ({
      ...m,
      author: userMap[m.user_id] || null,
    }));

    return NextResponse.json({ messages: result });
  } catch (error) {
    console.error('Get messages error:', error);
    return NextResponse.json({ error: 'Failed to get messages' }, { status: 500 });
  }
}
