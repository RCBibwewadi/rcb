import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseClient';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const { username, name, email, phone_number, rid, password } = await request.json();

    // Validation
    if (!username || !name || !email || !phone_number || !rid || !password) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    if (username.length < 3 || username.length > 50) {
      return NextResponse.json(
        { error: 'Username must be between 3 and 50 characters' },
        { status: 400 }
      );
    }

    if (name.length < 2 || name.length > 100) {
      return NextResponse.json(
        { error: 'Name must be between 2 and 100 characters' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    const phoneRegex = /^[0-9]{10,15}$/;
    if (!phoneRegex.test(phone_number.replace(/[\s\-\(\)]/g, ''))) {
      return NextResponse.json(
        { error: 'Invalid phone number format' },
        { status: 400 }
      );
    }

    if (rid.length < 3) {
      return NextResponse.json(
        { error: 'RID must be at least 3 characters' },
        { status: 400 }
      );
    }

    // Check if username already exists
    const { data: existingUsername } = await supabaseServer
      .from('game_users')
      .select('username')
      .eq('username', username.trim())
      .maybeSingle();

    if (existingUsername) {
      return NextResponse.json(
        { error: 'Username already taken' },
        { status: 409 }
      );
    }

    // Check if email already exists
    const { data: existingEmail } = await supabaseServer
      .from('game_users')
      .select('email')
      .eq('email', email.trim())
      .maybeSingle();

    if (existingEmail) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 409 }
      );
    }

    // Check if phone number already exists
    const { data: existingPhone } = await supabaseServer
      .from('game_users')
      .select('phone_number')
      .eq('phone_number', phone_number.trim())
      .maybeSingle();

    if (existingPhone) {
      return NextResponse.json(
        { error: 'Phone number already registered' },
        { status: 409 }
      );
    }

    // Check if RID already exists
    const { data: existingRID } = await supabaseServer
      .from('game_users')
      .select('rid')
      .eq('rid', rid.trim())
      .maybeSingle();

    if (existingRID) {
      return NextResponse.json(
        { error: 'RID already registered' },
        { status: 409 }
      );
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, 10);

    // Insert user using server client (bypasses RLS)
    const { data: newUser, error } = await supabaseServer
      .from('game_users')
      .insert([{ 
        username: username.trim(), 
        name: name.trim(), 
        email: email.trim(), 
        phone_number: phone_number.trim(), 
        rid: rid.trim(), 
        password_hash 
      }])
      .select()
      .single();

    if (error) {
      console.error('Insert error:', error);
      throw error;
    }

    return NextResponse.json(
      {
        message: 'Registration successful',
        user: {
          id: newUser.id,
          username: newUser.username,
          name: newUser.name,
          email: newUser.email,
          phone_number: newUser.phone_number,
          rid: newUser.rid,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Registration failed. Please try again.' },
      { status: 500 }
    );
  }
}
