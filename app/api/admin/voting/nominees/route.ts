import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseClient';

export async function POST(request: NextRequest) {
  try {
    const { category_id, name, photo_url } = await request.json();
    if (!category_id || !name?.trim()) {
      return NextResponse.json({ error: 'category_id and name are required' }, { status: 400 });
    }

    const { data: maxOrder } = await supabaseServer
      .from('voting_nominees')
      .select('display_order')
      .eq('category_id', category_id)
      .order('display_order', { ascending: false })
      .limit(1)
      .maybeSingle();

    const { data, error } = await supabaseServer
      .from('voting_nominees')
      .insert([{
        category_id,
        name: name.trim(),
        photo_url: photo_url || null,
        display_order: (maxOrder?.display_order || 0) + 1
      }])
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ nominee: data }, { status: 201 });
  } catch (error) {
    console.error('Create nominee error:', error);
    return NextResponse.json({ error: 'Failed to create nominee' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, name, photo_url } = await request.json();
    if (!id) return NextResponse.json({ error: 'Nominee ID is required' }, { status: 400 });

    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name.trim();
    if (photo_url !== undefined) updateData.photo_url = photo_url || null;

    const { data, error } = await supabaseServer
      .from('voting_nominees')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ nominee: data });
  } catch (error) {
    console.error('Update nominee error:', error);
    return NextResponse.json({ error: 'Failed to update nominee' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Nominee ID is required' }, { status: 400 });

    const { error } = await supabaseServer.from('voting_nominees').delete().eq('id', id);
    if (error) throw error;

    return NextResponse.json({ message: 'Nominee deleted successfully' });
  } catch (error) {
    console.error('Delete nominee error:', error);
    return NextResponse.json({ error: 'Failed to delete nominee' }, { status: 500 });
  }
}
