import { NextResponse } from 'next/server';
import { createClient, supabaseAdmin } from '@/lib/supabase/server';

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // 1. Get current balance
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('balance, role')
      .eq('id', user.id)
      .single();

    if (profileError || profile.role !== 'instructor') {
      return new NextResponse('Only instructors can withdraw', { status: 403 });
    }

    const amount = profile.balance || 0;

    if (amount <= 0) {
      return new NextResponse('Insufficient balance', { status: 400 });
    }

    // 2. Start a transaction (logic-wise)
    // In a real app, this would initiate a transfer via Paystack Payouts API
    // For this MVP, we reset the balance and log a withdrawal transaction.

    // Update balance to 0
    const { error: updateError } = await supabaseAdmin
      .from('profiles')
      .update({ balance: 0 })
      .eq('id', user.id);

    if (updateError) throw updateError;

    // Log the withdrawal
    await supabaseAdmin
      .from('transactions')
      .insert({
        instructor_id: user.id,
        amount: -amount, // Negative for withdrawal
        reference: `WD-${Date.now()}`,
        status: 'pending' // Usually payouts are processed in batches
      });

    return NextResponse.json({ 
      success: true, 
      message: `Withdrawal request for ₦${amount.toLocaleString()} received and is being processed.`
    });

  } catch (error) {
    console.error('[WITHDRAWAL_ERROR]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
