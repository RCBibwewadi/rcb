import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseClient';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ seriesId: string }> }
) {
  try {
    const { seriesId } = await params;
    const body = await request.json();

    const { data, error } = await supabaseServer
      .from('series_cards')
      .update(body)
      .eq('id', seriesId)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ series: data }, { status: 200 });
  } catch (error) {
    console.error('Error updating series:', error);
    return NextResponse.json(
      { error: 'Failed to update series' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ seriesId: string }> }
) {
  try {
    const { seriesId } = await params;

    const { error } = await supabaseServer
      .from('series_cards')
      .delete()
      .eq('id', seriesId);

    if (error) throw error;

    return NextResponse.json(
      { message: 'Series deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting series:', error);
    return NextResponse.json(
      { error: 'Failed to delete series' },
      { status: 500 }
    );
  }
}
