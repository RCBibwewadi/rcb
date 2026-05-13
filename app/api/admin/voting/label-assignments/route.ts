import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseClient';

export async function GET() {
  try {
    // Fetch all label categories
    const { data: labelCategories, error: labelError } = await supabaseServer
      .from('voting_label_categories')
      .select('*')
      .order('display_order', { ascending: true });

    if (labelError) throw labelError;

    const labelIds = (labelCategories || []).map((l) => l.id);

    // Fetch all peer assignments
    const { data: assignments, error: assignError } = labelIds.length
      ? await supabaseServer
          .from('voting_user_labels')
          .select('label_category_id, labeled_user_id')
          .in('label_category_id', labelIds)
      : { data: [], error: null };

    if (assignError) throw assignError;

    // Fetch ALL approved voting users
    const { data: allUsers } = await supabaseServer
      .from('voting_users')
      .select('id, name, display_name, photo_url')
      .eq('status', 'approved');

    const userMap: Record<string, { id: string; name: string; display_name?: string; photo_url?: string }> = {};
    for (const u of allUsers || []) {
      userMap[u.id] = u;
    }

    const allUserIds = Object.keys(userMap);

    // Fetch admin overrides for all users
    const { data: adminOverrides } = allUserIds.length
      ? await supabaseServer
          .from('voting_admin_label_assignments')
          .select('user_id, label_category_id')
          .in('user_id', allUserIds)
      : { data: [] };

    const adminOverrideMap: Record<string, string> = {};
    for (const o of adminOverrides || []) {
      adminOverrideMap[o.user_id] = o.label_category_id;
    }

    const labelMap: Record<string, { id: string; name: string }> = {};
    for (const l of labelCategories || []) {
      labelMap[l.id] = { id: l.id, name: l.name };
    }

    // Build per-user label counts
    const userLabelCounts: Record<string, Record<string, number>> = {};
    for (const a of assignments || []) {
      if (!userLabelCounts[a.labeled_user_id]) {
        userLabelCounts[a.labeled_user_id] = {};
      }
      userLabelCounts[a.labeled_user_id][a.label_category_id] =
        (userLabelCounts[a.labeled_user_id][a.label_category_id] || 0) + 1;
    }

    // Determine winner or tie per user (including zero-vote users)
    const userResults = allUserIds.map((uid) => {
      const counts = userLabelCounts[uid] || {};
      const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
      const hasVotes = sorted.length > 0;
      const maxCount = sorted[0]?.[1] ?? 0;
      const topLabels = sorted.filter(([, c]) => c === maxCount);
      const isTie = !hasVotes || topLabels.length > 1;
      const winner = hasVotes && !isTie ? labelMap[topLabels[0]?.[0]] ?? null : null;
      const adminAssignedId = adminOverrideMap[uid] ?? null;

      return {
        user: userMap[uid],
        label_counts: sorted.map(([lid, count]) => ({
          label_id: lid,
          label_name: labelMap[lid]?.name ?? lid,
          count,
        })),
        winner,
        is_tie: isTie,
        admin_assigned_label_id: adminAssignedId,
        admin_assigned_label_name: adminAssignedId ? (labelMap[adminAssignedId]?.name ?? null) : null,
        effective_label_id: adminAssignedId ?? winner?.id ?? null,
      };
    });

    return NextResponse.json({
      labels: labelCategories || [],
      user_results: userResults,
    });
  } catch (error) {
    console.error('Get label assignments error:', error);
    return NextResponse.json({ error: 'Failed to get label assignments' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { user_id, label_category_id } = await request.json();

    if (!user_id || !label_category_id) {
      return NextResponse.json({ error: 'user_id and label_category_id are required' }, { status: 400 });
    }

    const { error } = await supabaseServer
      .from('voting_admin_label_assignments')
      .upsert(
        { user_id, label_category_id, updated_at: new Date().toISOString() },
        { onConflict: 'user_id' }
      );

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Admin label assignment error:', error);
    return NextResponse.json({ error: 'Failed to save assignment' }, { status: 500 });
  }
}
