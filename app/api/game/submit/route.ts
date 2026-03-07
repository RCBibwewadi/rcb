import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseClient';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-this'
);

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('game_token')?.value;

    if (!token) {
      console.error('Submit: No token found');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify JWT
    let payload;
    try {
      const verified = await jwtVerify(token, JWT_SECRET);
      payload = verified.payload;
    } catch (jwtError) {
      console.error('Submit: JWT verification failed:', jwtError);
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    const userId = payload.userId as string;
    const { data: userExists, error: userError } = await supabaseServer
  .from("game_users")
  .select("id")
  .eq("id", userId)
  .maybeSingle();

if (!userExists) {
  return NextResponse.json(
    { error: userError || "User not found. Please login again." },
    { status: 401 }
  );
}

    const body = await request.json();
    const { seriesId, answers, timeTaken } = body;

    console.log('Submit request:', { userId, seriesId, answersCount: Object.keys(answers || {}).length, timeTaken });

    if (!seriesId || !answers || timeTaken === undefined) {
      console.error('Submit: Missing fields:', { seriesId: !!seriesId, answers: !!answers, timeTaken });
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get correct answers using server client
    const { data: questions, error: questionsError } = await supabaseServer
      .from('questions')
      .select('id, correct_answer')
      .eq('series_id', seriesId);

    if (questionsError) {
      console.error('Submit: Questions fetch error:', questionsError);
      return NextResponse.json(
        { error: 'Failed to fetch questions', details: questionsError.message },
        { status: 500 }
      );
    }

    if (!questions || questions.length === 0) {
      console.error('Submit: No questions found for series:', seriesId);
      return NextResponse.json(
        { error: 'No questions found for this series' },
        { status: 404 }
      );
    }

    // Calculate score
    let score = 0;
    questions.forEach((q) => {
      if (answers[q.id] === q.correct_answer) {
        score++;
      }
    });

    console.log('Submit: Calculated score:', score, '/', questions.length);

    // Save attempt using server client (bypasses RLS)
    const { data: attempt, error: attemptError } = await supabaseServer
      .from('quiz_attempts')
      .insert([
        {
          user_id: userId,
          series_id: seriesId,
          score,
          time_taken: timeTaken,
          answers,
        },
      ])
      .select()
      .single();

    if (attemptError) {
      console.error('Submit: Attempt insert error:', attemptError);
      return NextResponse.json(
        { error: 'Failed to save quiz attempt', details: attemptError.message },
        { status: 500 }
      );
    }

    console.log('Submit: Success, attempt ID:', attempt.id);

    return NextResponse.json(
      {
        message: 'Quiz submitted successfully',
        score,
        totalQuestions: questions.length,
        timeTaken,
        attemptId: attempt.id,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Submit: Unexpected error:', error);
    return NextResponse.json(
      { error: 'Failed to submit quiz', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
