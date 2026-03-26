import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseClient';
import { jwtVerify } from 'jose';
import { getZodiacSign } from '@/lib/matchup/utils';

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

    const { data: profile, error } = await supabaseServer
      .from('matchup_profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      throw error;
    }

    return NextResponse.json({ profile });
  } catch (error) {
    console.error('Get profile error:', error);
    return NextResponse.json({ error: 'Failed to get profile' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getUserId(request);
    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const body = await request.json();
    const { username, dob, photo1_url, photo2_url, photo3_url, prompt1, prompt2, prompt3, prompt4, prompt5 } = body;

    if (!username || username.trim().length < 2) {
      return NextResponse.json({ error: 'Username is required' }, { status: 400 });
    }

    let zodiac_sign = null;
    if (dob) {
      zodiac_sign = getZodiacSign(new Date(dob));
    }

    const { data: existing } = await supabaseServer
      .from('matchup_profiles')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();

    let result;
    if (existing) {
      const { data, error } = await supabaseServer
        .from('matchup_profiles')
        .update({
          username: username.trim(),
          dob: dob || null,
          zodiac_sign,
          photo1_url: photo1_url || null,
          photo2_url: photo2_url || null,
          photo3_url: photo3_url || null,
          prompt1: prompt1 || null,
          prompt2: prompt2 || null,
          prompt3: prompt3 || null,
          prompt4: prompt4 || null,
          prompt5: prompt5 || null
        })
        .eq('user_id', userId)
        .select()
        .single();
      
      if (error) throw error;
      result = data;
    } else {
      const { data, error } = await supabaseServer
        .from('matchup_profiles')
        .insert([{
          user_id: userId,
          username: username.trim(),
          dob: dob || null,
          zodiac_sign,
          photo1_url: photo1_url || null,
          photo2_url: photo2_url || null,
          photo3_url: photo3_url || null,
          prompt1: prompt1 || null,
          prompt2: prompt2 || null,
          prompt3: prompt3 || null,
          prompt4: prompt4 || null,
          prompt5: prompt5 || null
        }])
        .select()
        .single();
      
      if (error) throw error;
      result = data;
    }

    if (username) {
      const { error: usernameCheckError } = await supabaseServer
        .from('matchup_profiles')
        .select('id')
        .eq('username', username.trim())
        .neq('user_id', userId)
        .maybeSingle();

      if (usernameCheckError) {
        console.error('Username check error:', usernameCheckError);
      }
    }

    return NextResponse.json({ profile: result });
  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}
