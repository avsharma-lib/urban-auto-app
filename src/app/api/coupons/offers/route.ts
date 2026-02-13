import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get('userId');

    const { data: globalCoupons } = await supabase
      .from('coupons')
      .select('id, code, discount_percent, user_id')
      .is('user_id', null)
      .eq('active', true)
      .order('created_at', { ascending: false });

    let userCoupons: any[] = [];
    if (userId) {
      const { data } = await supabase
        .from('coupons')
        .select('id, code, discount_percent, user_id')
        .eq('user_id', userId)
        .eq('active', true)
        .order('created_at', { ascending: false });
      userCoupons = data || [];
    }

    const offers = [...userCoupons, ...(globalCoupons || [])];

    return NextResponse.json({ offers });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
