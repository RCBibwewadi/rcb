import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseClient';
import { jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

async function getUserId(request: NextRequest): Promise<string | null> {
  const token = request.cookies.get('voting_token')?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(JWT_SECRET));
    return payload.type === 'voting' ? (payload.userId as string) : null;
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getUserId(request);
    if (!userId) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const { data: user } = await supabaseServer
      .from('voting_users')
      .select('has_messaged')
      .eq('id', userId)
      .single();

    if (user?.has_messaged) {
      return NextResponse.json({ error: 'You have already submitted a message' }, { status: 409 });
    }

    const { message } = await request.json();
    if (!message || message.trim().length === 0) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }
    if (message.trim().length > 500) {
      return NextResponse.json({ error: 'Message must be under 500 characters' }, { status: 400 });
    }

    const { error: insertError } = await supabaseServer
      .from('voting_anonymous_messages')
      .insert([{ user_id: userId, message: message.trim() }]);

    if (insertError) throw insertError;

    await supabaseServer
      .from('voting_users')
      .update({ has_messaged: true, updated_at: new Date().toISOString() })
      .eq('id', userId);

    return NextResponse.json({ message: 'Message submitted successfully' });
  } catch (error) {
    console.error('Anonymous message error:', error);
    return NextResponse.json({ error: 'Failed to submit message' }, { status: 500 });
  }
}
