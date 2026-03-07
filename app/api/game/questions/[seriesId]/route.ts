import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ seriesId: string }> }
) {
  try {
    const { seriesId } = await params;

    const { data: questions, error } = await supabase
      .from('questions')
      .select('id, series_id, question_text, option_a, option_b, option_c, option_d, question_order')
      .eq('series_id', seriesId)
      .order('question_order', { ascending: true });

    if (error) throw error;

    if (!questions || questions.length === 0) {
      return NextResponse.json(
        { error: 'No questions found for this series' },
        { status: 404 }
      );
    }

    return NextResponse.json({ questions }, { status: 200 });
  } catch (error) {
    console.error('Error fetching questions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch questions' },
      { status: 500 }
    );
  }
}
