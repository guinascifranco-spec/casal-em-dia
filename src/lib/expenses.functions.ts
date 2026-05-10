import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

async function getMyCoupleId(userId: string): Promise<string | null> {
  const { data } = await supabaseAdmin
    .from("couple_members")
    .select("couple_id")
    .eq("user_id", userId)
    .maybeSingle();
  return data?.couple_id ?? null;
}

export const listExpenses = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const coupleId = await getMyCoupleId(context.userId);
    if (!coupleId) return [];
    const { data, error } = await supabaseAdmin
      .from("expenses")
      .select("id, description, amount, paid_by, split_type, created_by, created_at")
      .eq("couple_id", coupleId)
      .order("created_at", { ascending: false })
      .limit(500);
    if (error) throw new Error(error.message);
    return (data ?? []).map((e) => ({
      ...e,
      amount: Number(e.amount),
      split_type: e.split_type as "split" | "transfer",
    }));
  });

export const createExpense = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    z.object({
      description: z.string().trim().min(1).max(120),
      amount: z.number().positive().max(10_000_000),
      paidBy: z.string().uuid(),
      splitType: z.enum(["split", "transfer"]),
    }).parse,
  )
  .handler(async ({ context, data }) => {
    const coupleId = await getMyCoupleId(context.userId);
    if (!coupleId) throw new Error("Você precisa estar em um casal.");

    // verify paidBy is a member
    const { data: member } = await supabaseAdmin
      .from("couple_members")
      .select("user_id")
      .eq("couple_id", coupleId)
      .eq("user_id", data.paidBy)
      .maybeSingle();
    if (!member) throw new Error("Pagador inválido.");

    const { error } = await supabaseAdmin.from("expenses").insert({
      couple_id: coupleId,
      description: data.description,
      amount: data.amount,
      paid_by: data.paidBy,
      split_type: data.splitType,
      created_by: context.userId,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteExpense = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ id: z.string().uuid() }).parse)
  .handler(async ({ context, data }) => {
    const { error } = await supabaseAdmin
      .from("expenses")
      .delete()
      .eq("id", data.id)
      .eq("created_by", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
