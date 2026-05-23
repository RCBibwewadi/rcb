import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseClient';
import { jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('voting_token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { payload } = await jwtVerify(token, new TextEncoder().encode(JWT_SECRET));
    if (payload.type !== 'voting') {
      return NextResponse.json({ error: 'Invalid token type' }, { status: 401 });
    }

    const userId = payload.userId as string;

    // Check if label notification is enabled
    const { data: notifSetting } = await supabaseServer
      .from('voting_settings')
      .select('setting_value')
      .eq('setting_key', 'label_notification_enabled')
      .single();

    const notificationEnabled = notifSetting?.setting_value ?? false;

    if (!notificationEnabled) {
      return NextResponse.json({ notification_enabled: false, label: null });
    }

    // Check admin override first
    const { data: adminOverride } = await supabaseServer
      .from('voting_admin_label_assignments')
      .select('label_category_id')
      .eq('user_id', userId)
      .single();

    if (adminOverride?.label_category_id) {
      const { data: label } = await supabaseServer
        .from('voting_label_categories')
        .select('id, name')
        .eq('id', adminOverride.label_category_id)
        .single();

      return NextResponse.json({
        notification_enabled: true,
        label: label ? { id: label.id, name: label.name } : null,
      });
    }

    // Compute from peer votes
    const { data: assignments } = await supabaseServer
      .from('voting_user_labels')
      .select('label_category_id')
      .eq('labeled_user_id', userId);

    if (!assignments || assignments.length === 0) {
      return NextResponse.json({ notification_enabled: true, label: null });
    }

    // Count votes per label
    const counts: Record<string, number> = {};
    for (const a of assignments) {
      counts[a.label_category_id] = (counts[a.label_category_id] || 0) + 1;
    }

    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    const maxCount = sorted[0][1];
    const topLabels = sorted.filter(([, c]) => c === maxCount);

    // Tie — no clear winner
    if (topLabels.length > 1) {
      return NextResponse.json({ notification_enabled: true, label: null });
    }

    const winnerLabelId = topLabels[0][0];
    const { data: label } = await supabaseServer
      .from('voting_label_categories')
      .select('id, name')
      .eq('id', winnerLabelId)
      .single();

    return NextResponse.json({
      notification_enabled: true,
      label: label ? { id: label.id, name: label.name } : null,
    });
  } catch (error) {
    console.error('My label error:', error);
    return NextResponse.json({ error: 'Failed to get label' }, { status: 500 });
  }
}
