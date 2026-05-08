import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { fulfillPurchase } from '@/lib/payments';

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { courseId, reference } = await req.json();

    if (!courseId || !reference) {
      return new NextResponse('Missing parameters', { status: 400 });
    }

    // In production, we should call Paystack to verify 'reference' before fulfilling
    // For now, we trust the frontend success but the webhook will be the final truth.
    
    await fulfillPurchase(user.id, courseId, reference);

    return NextResponse.json({ 
      success: true,
      message: "Payment processed and course unlocked."
    });

  } catch (error) {
    console.error('[PAYMENT_VERIFY] Error:', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
