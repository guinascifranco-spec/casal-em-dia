import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const FREE_TIER_LIMIT = 5;

/**
 * Checks whether the couple of the current user is allowed to create a new
 * expense this calendar month.
 *
 * Logic:
 *  1. Resolve the coupleId of the requesting user.
 *  2. Look up user_plans for ANY member of that couple.
 *     If any member is "pro", the couple is Pro.
 *  3. If free tier, count ALL expenses inserted by any period that belongs
 *     to this couple whose `created_at` falls in the current UTC month.
 */
export const checkEntryLimit = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { userId, claims } = context;
    const userEmail = (claims as any)?.email;

    const EXEMPT_EMAILS = [
      "guinascifranco@gmail.com",
      "biafontesmello@gmail.com"
    ];

    if (userEmail && EXEMPT_EMAILS.includes(userEmail)) {
      return { allowed: true as const, count: 0, plan: "pro" as const };
    }

    // 1. Get the couple this user belongs to
    const { data: membership } = await supabaseAdmin
      .from("couple_members")
      .select("couple_id")
      .eq("user_id", userId)
      .maybeSingle();

    if (!membership) {
      // No couple yet → allow (they can't create expenses anyway without a couple)
      return { allowed: true as const, count: 0, plan: "free" as const };
    }

    const { couple_id: coupleId } = membership;

    // 2. Get all user_ids belonging to this couple
    const { data: members } = await supabaseAdmin
      .from("couple_members")
      .select("user_id")
      .eq("couple_id", coupleId);

    const memberIds = (members ?? []).map((m) => m.user_id);

    // 3. Check if any member of the couple has a Pro plan
    const { data: plans } = await supabaseAdmin
      .from("user_plans")
      .select("plan")
      .in("user_id", memberIds);

    const isPro = (plans ?? []).some((p) => p.plan === "pro");

    if (isPro) {
      return { allowed: true as const, count: 0, plan: "pro" as const };
    }

    // 4. Free tier: count expenses for this couple in the current calendar month
    const now = new Date();
    const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString();
    const monthEnd = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1),
    ).toISOString();

    // Get all period IDs belonging to this couple
    const { data: periods } = await supabaseAdmin
      .from("periods")
      .select("id")
      .eq("couple_id", coupleId);

    const periodIds = (periods ?? []).map((p) => p.id);

    let count = 0;

    if (periodIds.length > 0) {
      const { count: expenseCount } = await supabaseAdmin
        .from("expenses")
        .select("id", { count: "exact", head: true })
        .in("period_id", periodIds)
        .gte("created_at", monthStart)
        .lt("created_at", monthEnd);

      count = expenseCount ?? 0;
    }

    return {
      allowed: count < FREE_TIER_LIMIT,
      count,
      plan: "free" as const,
    };
  });
