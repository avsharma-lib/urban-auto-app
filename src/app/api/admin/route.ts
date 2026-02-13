import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

function getAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, userId, password } = body;

    const adminClient = getAdminClient();

    if (action === 'reset-password') {
      if (!userId || !password || password.length < 8) {
        return NextResponse.json({ error: 'User ID and password (min 8 chars) required' }, { status: 400 });
      }
      const { error } = await adminClient.auth.admin.updateUserById(userId, { password });
      if (error) return NextResponse.json({ error: error.message }, { status: 400 });
      return NextResponse.json({ success: true });
    }

    if (action === 'block-user') {
      if (!userId) return NextResponse.json({ error: 'User ID required' }, { status: 400 });
      const { error } = await adminClient.from('profiles').update({ blocked: true }).eq('id', userId);
      if (error) return NextResponse.json({ error: error.message }, { status: 400 });
      return NextResponse.json({ success: true });
    }

    if (action === 'unblock-user') {
      if (!userId) return NextResponse.json({ error: 'User ID required' }, { status: 400 });
      const { error } = await adminClient.from('profiles').update({ blocked: false }).eq('id', userId);
      if (error) return NextResponse.json({ error: error.message }, { status: 400 });
      return NextResponse.json({ success: true });
    }

    if (action === 'verify-user') {
      if (!userId) return NextResponse.json({ error: 'User ID required' }, { status: 400 });
      const { error } = await adminClient.from('profiles').update({ verified: true }).eq('id', userId);
      if (error) return NextResponse.json({ error: error.message }, { status: 400 });
      return NextResponse.json({ success: true });
    }

    if (action === 'unverify-user') {
      if (!userId) return NextResponse.json({ error: 'User ID required' }, { status: 400 });
      const { error } = await adminClient.from('profiles').update({ verified: false }).eq('id', userId);
      if (error) return NextResponse.json({ error: error.message }, { status: 400 });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
