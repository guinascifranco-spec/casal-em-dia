import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

async function assertCoupleAccess(userId: string, coupleId: string) {
  const { data } = await supabaseAdmin
    .from("couple_members")
    .select("user_id")
    .eq("couple_id", coupleId)
    .eq("user_id", userId)
    .maybeSingle();
  if (!data) throw new Error("Você não pertence a este casal.");
}

// ---------------------------------------------------------------------------
// List all periods of a couple
// ---------------------------------------------------------------------------
export const listPeriods = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ coupleId: z.string().uuid() }).parse)
  .handler(async ({ context, data }) => {
    await assertCoupleAccess(context.userId, data.coupleId);

    const { data: rows, error } = await supabaseAdmin
      .from("periods")
      .select("id, name, created_at")
      .eq("couple_id", data.coupleId)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

// ---------------------------------------------------------------------------
// Create a new period inside a couple
// ---------------------------------------------------------------------------
export const createPeriod = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    z.object({
      coupleId: z.string().uuid(),
      name: z.string().trim().min(1).max(80),
    }).parse,
  )
  .handler(async ({ context, data }) => {
    await assertCoupleAccess(context.userId, data.coupleId);

    const { data: period, error } = await supabaseAdmin
      .from("periods")
      .insert({ couple_id: data.coupleId, name: data.name })
      .select("id, name, created_at")
      .single();
    if (error) throw new Error(error.message);
    return period;
  });
