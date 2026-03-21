import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseClient';
import { jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

async function getUserId(request: NextRequest): Promise<string | null> {
  const token = request.cookies.get('matchup_token')?.value;
  if (!token) return null;
  
  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(JWT_SECRET));
    return payload.type === 'matchup' ? payload.userId as string : null;
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const userId = await getUserId(request);
    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { data: preferences, error } = await supabaseServer
      .from('matchup_preferences')
      .select(`
        *,
        question:matchup_preference_questions(id, question, weight)
      `)
      .eq('user_id', userId);

    if (error) throw error;

    const { data: questions } = await supabaseServer
      .from('matchup_preference_questions')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    return NextResponse.json({ 
      preferences: preferences || [],
      questions: questions || []
    });
  } catch (error) {
    console.error('Get preferences error:', error);
    return NextResponse.json({ error: 'Failed to get preferences' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getUserId(request);
    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { answers } = await request.json();

    if (!answers || !Array.isArray(answers) || answers.length === 0) {
      return NextResponse.json({ error: 'Answers are required' }, { status: 400 });
    }

    for (const answer of answers) {
      if (!answer.question_id || typeof answer.answer_value !== 'number') {
        return NextResponse.json({ error: 'Invalid answer format' }, { status: 400 });
      }
      if (answer.answer_value < 0 || answer.answer_value > 100) {
        return NextResponse.json({ error: 'Answer value must be between 0 and 100' }, { status: 400 });
      }
    }

    const { error: deleteError } = await supabaseServer
      .from('matchup_preferences')
      .delete()
      .eq('user_id', userId);

    if (deleteError) {
      console.error('Delete error:', deleteError);
    }

    const preferencesToInsert = answers.map((a: { question_id: string; answer_value: number }) => ({
      user_id: userId,
      question_id: a.question_id,
      answer_value: a.answer_value
    }));

    const { data, error } = await supabaseServer
      .from('matchup_preferences')
      .insert(preferencesToInsert)
      .select();

    if (error) throw error;

    return NextResponse.json({ preferences: data });
  } catch (error) {
    console.error('Update preferences error:', error);
    return NextResponse.json({ error: 'Failed to update preferences' }, { status: 500 });
  }
}
