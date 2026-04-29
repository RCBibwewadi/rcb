import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseClient';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const { name, display_name, rid, dob, email, password } = await request.json();

    if (!name || !rid || !dob || !email || !password) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    if (name.trim().length < 2 || name.trim().length > 100) {
      return NextResponse.json({ error: 'Name must be between 2 and 100 characters' }, { status: 400 });
    }

    if (rid.trim().length < 3) {
      return NextResponse.json({ error: 'RID must be at least 3 characters' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }

    const { data: existingEmail } = await supabaseServer
      .from('voting_users')
      .select('email')
      .eq('email', email.trim().toLowerCase())
      .maybeSingle();

    if (existingEmail) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
    }

    const { data: existingRID } = await supabaseServer
      .from('voting_users')
      .select('rid')
      .eq('rid', rid.trim())
      .maybeSingle();

    if (existingRID) {
      return NextResponse.json({ error: 'RID already registered' }, { status: 409 });
    }

    const password_hash = await bcrypt.hash(password, 10);

    const { data: newUser, error } = await supabaseServer
      .from('voting_users')
      .insert([{
        name: name.trim(),
        display_name: display_name?.trim() || null,
        rid: rid.trim(),
        dob,
        email: email.trim().toLowerCase(),
        password_hash,
        plain_password: password,
        status: 'pending'
      }])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      message: 'Registration successful. You will be notified after admin approval.',
      user: { id: newUser.id, name: newUser.name, email: newUser.email, status: newUser.status }
    }, { status: 201 });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Registration failed. Please try again.' }, { status: 500 });
  }
}
