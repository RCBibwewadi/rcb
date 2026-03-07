import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseClient';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ seriesId: string }> }
) {
  try {
    const { seriesId } = await params;

    const { data: questions, error } = await supabaseServer
      .from('questions')
      .select('*')
      .eq('series_id', seriesId)
      .order('question_order', { ascending: true });

    if (error) throw error;

    return NextResponse.json({ questions: questions || [] }, { status: 200 });
  } catch (error) {
    console.error('Error fetching questions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch questions' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ seriesId: string }> }
) {
  try {
    const { seriesId } = await params;
    const { questions } = await request.json();

    // Delete existing questions
    await supabaseServer.from('questions').delete().eq('series_id', seriesId);

    // Insert new questions
    const questionsWithSeriesId = questions.map((q: any) => ({
      ...q,
      series_id: seriesId,
    }));

    const { data, error } = await supabaseServer
      .from('questions')
      .insert(questionsWithSeriesId)
      .select();

    if (error) throw error;

    return NextResponse.json({ questions: data }, { status: 200 });
  } catch (error) {
    console.error('Error saving questions:', error);
    return NextResponse.json(
      { error: 'Failed to save questions' },
      { status: 500 }
    );
  }
}
