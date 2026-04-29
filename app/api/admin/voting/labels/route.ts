import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseClient';

export async function GET() {
  try {
    const { data: labels, error } = await supabaseServer
      .from('voting_label_categories')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) throw error;
    return NextResponse.json({ labels: labels || [] });
  } catch (error) {
    console.error('Get labels error:', error);
    return NextResponse.json({ error: 'Failed to get labels' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, is_active } = await request.json();
    if (!name?.trim()) {
      return NextResponse.json({ error: 'Label name is required' }, { status: 400 });
    }

    const { data: maxOrder } = await supabaseServer
      .from('voting_label_categories')
      .select('display_order')
      .order('display_order', { ascending: false })
      .limit(1)
      .maybeSingle();

    const { data, error } = await supabaseServer
      .from('voting_label_categories')
      .insert([{
        name: name.trim(),
        is_active: is_active !== undefined ? is_active : true,
        display_order: (maxOrder?.display_order || 0) + 1
      }])
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ label: data }, { status: 201 });
  } catch (error) {
    console.error('Create label error:', error);
    return NextResponse.json({ error: 'Failed to create label' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, name, is_active } = await request.json();
    if (!id) return NextResponse.json({ error: 'Label ID is required' }, { status: 400 });

    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name.trim();
    if (is_active !== undefined) updateData.is_active = is_active;

    const { data, error } = await supabaseServer
      .from('voting_label_categories')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ label: data });
  } catch (error) {
    console.error('Update label error:', error);
    return NextResponse.json({ error: 'Failed to update label' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Label ID is required' }, { status: 400 });

    const { error } = await supabaseServer.from('voting_label_categories').delete().eq('id', id);
    if (error) throw error;

    return NextResponse.json({ message: 'Label deleted successfully' });
  } catch (error) {
    console.error('Delete label error:', error);
    return NextResponse.json({ error: 'Failed to delete label' }, { status: 500 });
  }
}
