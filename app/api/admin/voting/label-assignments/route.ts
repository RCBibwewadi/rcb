import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseClient';

export async function GET() {
  try {
    const { data: labelCategories, error: labelError } = await supabaseServer
      .from('voting_label_categories')
      .select('*')
      .order('display_order', { ascending: true });

    if (labelError) throw labelError;

    const labelIds = (labelCategories || []).map((l) => l.id);

    const { data: assignments, error: assignError } = labelIds.length
      ? await supabaseServer
          .from('voting_user_labels')
          .select('label_category_id, labeled_user_id')
          .in('label_category_id', labelIds)
      : { data: [], error: null };

    if (assignError) throw assignError;

    const userIds = [...new Set((assignments || []).map((a) => a.labeled_user_id))];

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

    const result = (labelCategories || []).map((label) => {
      const assignedUsers = (assignments || [])
        .filter((a) => a.label_category_id === label.id)
        .map((a) => userMap[a.labeled_user_id])
        .filter(Boolean);

      return { ...label, assigned_users: assignedUsers };
    });

    return NextResponse.json({ labels: result });
  } catch (error) {
    console.error('Get label assignments error:', error);
    return NextResponse.json({ error: 'Failed to get label assignments' }, { status: 500 });
  }
}
