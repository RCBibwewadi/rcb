import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseClient';

export async function GET() {
  try {
    const { data: categories, error } = await supabaseServer
      .from('voting_categories')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) throw error;

    const categoryIds = (categories || []).map((c) => c.id);
    const { data: nominees } = categoryIds.length
      ? await supabaseServer
          .from('voting_nominees')
          .select('*')
          .in('category_id', categoryIds)
          .order('display_order', { ascending: true })
      : { data: [] };

    const result = (categories || []).map((cat) => ({
      ...cat,
      nominees: (nominees || []).filter((n) => n.category_id === cat.id)
    }));

    return NextResponse.json({ categories: result });
  } catch (error) {
    console.error('Get categories error:', error);
    return NextResponse.json({ error: 'Failed to get categories' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, description, is_active } = await request.json();
    if (!name?.trim()) {
      return NextResponse.json({ error: 'Category name is required' }, { status: 400 });
    }

    const { data: maxOrder } = await supabaseServer
      .from('voting_categories')
      .select('display_order')
      .order('display_order', { ascending: false })
      .limit(1)
      .maybeSingle();

    const { data, error } = await supabaseServer
      .from('voting_categories')
      .insert([{
        name: name.trim(),
        description: description?.trim() || null,
        is_active: is_active !== undefined ? is_active : true,
        display_order: (maxOrder?.display_order || 0) + 1
      }])
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ category: data }, { status: 201 });
  } catch (error) {
    console.error('Create category error:', error);
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, name, description, is_active, display_order } = await request.json();
    if (!id) return NextResponse.json({ error: 'Category ID is required' }, { status: 400 });

    const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (name !== undefined) updateData.name = name.trim();
    if (description !== undefined) updateData.description = description?.trim() || null;
    if (is_active !== undefined) updateData.is_active = is_active;
    if (display_order !== undefined) updateData.display_order = display_order;

    const { data, error } = await supabaseServer
      .from('voting_categories')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ category: data });
  } catch (error) {
    console.error('Update category error:', error);
    return NextResponse.json({ error: 'Failed to update category' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Category ID is required' }, { status: 400 });

    const { error } = await supabaseServer.from('voting_categories').delete().eq('id', id);
    if (error) throw error;

    return NextResponse.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Delete category error:', error);
    return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 });
  }
}
