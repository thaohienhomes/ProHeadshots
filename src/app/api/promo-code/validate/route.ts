import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { validatePromoCode } from '@/utils/promoCodeSystem';

export async function POST(request: NextRequest) {
  try {
    const { code, userId, orderAmount } = await request.json();

    if (!code || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate the promo code server-side for security
    const result = await validatePromoCode(code, userId, orderAmount);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error validating promo code:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
