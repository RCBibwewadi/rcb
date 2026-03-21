import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseClient';

export async function GET() {
  try {
    const { data: questions, error } = await supabaseServer
      .from('matchup_preference_questions')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) throw error;

    return NextResponse.json({ questions: questions || [] });
  } catch (error) {
    console.error('Get questions error:', error);
    return NextResponse.json({ error: 'Failed to get questions' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { question, weight, is_active } = await request.json();

    if (!question || question.trim().length === 0) {
      return NextResponse.json({ error: 'Question is required' }, { status: 400 });
    }

    const { data: existing } = await supabaseServer
      .from('matchup_preference_questions')
      .select('id')
      .eq('question', question.trim())
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ error: 'Question already exists' }, { status: 409 });
    }

    const { data: maxOrder } = await supabaseServer
      .from('matchup_preference_questions')
      .select('display_order')
      .order('display_order', { ascending: false })
      .limit(1)
      .maybeSingle();

    const nextOrder = (maxOrder?.display_order || 0) + 1;

    const { data, error } = await supabaseServer
      .from('matchup_preference_questions')
      .insert([{
        question: question.trim(),
        weight: weight || 1.0,
        is_active: is_active !== undefined ? is_active : true,
        display_order: nextOrder
      }])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ question: data });
  } catch (error) {
    console.error('Create question error:', error);
    return NextResponse.json({ error: 'Failed to create question' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, question, weight, is_active, display_order } = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'Question ID is required' }, { status: 400 });
    }

    const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (question !== undefined) updateData.question = question.trim();
    if (weight !== undefined) updateData.weight = weight;
    if (is_active !== undefined) updateData.is_active = is_active;
    if (display_order !== undefined) updateData.display_order = display_order;

    const { data, error } = await supabaseServer
      .from('matchup_preference_questions')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ question: data });
  } catch (error) {
    console.error('Update question error:', error);
    return NextResponse.json({ error: 'Failed to update question' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Question ID is required' }, { status: 400 });
    }

    const { error } = await supabaseServer
      .from('matchup_preference_questions')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ message: 'Question deleted successfully' });
  } catch (error) {
    console.error('Delete question error:', error);
    return NextResponse.json({ error: 'Failed to delete question' }, { status: 500 });
  }
}
