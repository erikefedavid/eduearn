import { supabaseAdmin } from './supabase/server';

/**
 * Fulfills a course purchase by:
 * 1. Creating a student enrollment
 * 2. Crediting the instructor's balance
 * 3. Logging the transaction for auditing
 */
export async function fulfillPurchase(userId: string, courseId: string, reference: string) {
  try {
    // 1. Get Course
    const { data: course, error: courseError } = await supabaseAdmin
      .from('courses')
      .select('*')
      .eq('id', courseId)
      .single();

    if (courseError || !course) {
      console.error(`[FULFILL] Course not found: ${courseId}`);
      throw new Error(`Course not found: ${courseId}`);
    }

    // Fetch instructor profile to get balance
    let instructorProfile = null;
    if (course.instructor_id) {
      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('id, balance')
        .eq('id', course.instructor_id)
        .single();
      instructorProfile = profile;
    }

    // 2. Create Enrollment for the Student
    const { error: enrollError } = await supabaseAdmin
      .from('enrollments')
      .upsert({
        user_id: userId,
        course_id: courseId
      });

    if (enrollError) {
      console.error(`[FULFILL] Enrollment failed:`, enrollError);
      throw enrollError;
    }

    // 3. Update Instructor Balance
    if (course.instructor_id) {
      const currentBalance = Number(instructorProfile?.balance || 0);
      const newBalance = currentBalance + Number(course.price);

      const { error: balanceError } = await supabaseAdmin
        .from('profiles')
        .update({ balance: newBalance })
        .eq('id', course.instructor_id);

      if (balanceError) {
        console.error(`[FULFILL] Balance update failed:`, balanceError);
        // We log but continue, as enrollment succeeded
      }

      // 4. Record the Transaction for Auditing
      const { error: transError } = await supabaseAdmin
        .from('transactions')
        .insert({
          instructor_id: course.instructor_id,
          learner_id: userId,
          course_id: courseId,
          amount: course.price,
          instructor_share: course.price, // In future, subtract platform fee
          reference: reference
        });

      if (transError) {
        console.error(`[FULFILL] Transaction logging failed:`, transError);
      }
    }

    return { success: true };
  } catch (error) {
    console.error(`[FULFILL] Error:`, error);
    throw error;
  }
}
