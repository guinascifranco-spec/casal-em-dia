import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

function genCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let s = "";
  for (let i = 0; i < 6; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return s;
}

async function assertMember(userId: string, coupleId: string) {
  const { data } = await supabaseAdmin
    .from("couple_members")
    .select("user_id")
    .eq("couple_id", coupleId)
    .eq("user_id", userId)
    .maybeSingle();
  if (!data) throw new Error("Você não é membro deste grupo.");
}

export const listMyCouples = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { userId } = context;
    const { data: rows, error } = await supabaseAdmin
      .from("couple_members")
      .select("couple_id, joined_at, couples!inner(id, name, created_at)")
      .eq("user_id", userId)
      .order("joined_at", { ascending: true });
    if (error) throw new Error(error.message);
    return (rows ?? []).map((r) => {
      const c = r.couples as unknown as { id: string; name: string | null; created_at: string };
      return { id: c.id, name: c.name, created_at: c.created_at };
    });
  });

export const getMyCoupleState = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    z.object({ coupleId: z.string().uuid().optional() }).parse,
  )
  .handler(async ({ context, data }) => {
    const { userId } = context;

    // Find target couple: provided one (if member) or first one
    let coupleId = data.coupleId ?? null;
    if (coupleId) {
      const { data: m } = await supabaseAdmin
        .from("couple_members")
        .select("couple_id")
        .eq("user_id", userId)
        .eq("couple_id", coupleId)
        .maybeSingle();
      if (!m) coupleId = null;
    }
    if (!coupleId) {
      const { data: any1 } = await supabaseAdmin
        .from("couple_members")
        .select("couple_id, joined_at")
        .eq("user_id", userId)
        .order("joined_at", { ascending: true })
        .limit(1)
        .maybeSingle();
      coupleId = any1?.couple_id ?? null;
    }

    if (!coupleId) return { hasCouple: false as const };

    const { data: couple } = await supabaseAdmin
      .from("couples")
      .select("id, name")
      .eq("id", coupleId)
      .maybeSingle();

    const { data: members, error } = await supabaseAdmin
      .from("couple_members")
      .select("user_id, display_name")
      .eq("couple_id", coupleId);
    if (error) throw new Error(error.message);

    return {
      hasCouple: true as const,
      coupleId,
      coupleName: couple?.name ?? null,
      myUserId: userId,
      members: members ?? [],
    };
  });

export const createCouple = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    z.object({
      displayName: z.string().trim().min(1).max(40),
      coupleName: z.string().trim().max(60).optional(),
    }).parse,
  )
  .handler(async ({ context, data }) => {
    const { userId } = context;

    const { data: couple, error: cerr } = await supabaseAdmin
      .from("couples")
      .insert({ name: data.coupleName ?? null })
      .select("id")
      .single();
    if (cerr) throw new Error(cerr.message);

    const { error: merr } = await supabaseAdmin
      .from("couple_members")
      .insert({ couple_id: couple.id, user_id: userId, display_name: data.displayName });
    if (merr) throw new Error(merr.message);

    const code = genCode();
    await supabaseAdmin.from("couple_invites").insert({
      code,
      couple_id: couple.id,
      created_by: userId,
    });

    return { coupleId: couple.id, inviteCode: code };
  });

export const getMyInvite = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    z.object({ coupleId: z.string().uuid() }).parse,
  )
  .handler(async ({ context, data }) => {
    const { userId } = context;
    await assertMember(userId, data.coupleId);

    const { count } = await supabaseAdmin
      .from("couple_members")
      .select("*", { count: "exact", head: true })
      .eq("couple_id", data.coupleId);
    if ((count ?? 0) >= 2) return null;

    const { data: existing } = await supabaseAdmin
      .from("couple_invites")
      .select("code, expires_at")
      .eq("couple_id", data.coupleId)
      .gt("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (existing) return existing;

    const code = genCode();
    const { data: created, error } = await supabaseAdmin
      .from("couple_invites")
      .insert({ code, couple_id: data.coupleId, created_by: userId })
      .select("code, expires_at")
      .single();
    if (error) throw new Error(error.message);
    return created;
  });

export const joinCouple = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    z.object({
      code: z.string().trim().min(4).max(12),
      displayName: z.string().trim().min(1).max(40),
    }).parse,
  )
  .handler(async ({ context, data }) => {
    const { userId } = context;
    const code = data.code.trim().toUpperCase();

    const { data: invite } = await supabaseAdmin
      .from("couple_invites")
      .select("couple_id, expires_at")
      .eq("code", code)
      .maybeSingle();
    if (!invite) throw new Error("Código inválido.");
    if (new Date(invite.expires_at) < new Date()) throw new Error("Código expirado.");

    const { data: already } = await supabaseAdmin
      .from("couple_members")
      .select("user_id")
      .eq("couple_id", invite.couple_id)
      .eq("user_id", userId)
      .maybeSingle();
    if (already) throw new Error("Você já está nesse grupo.");

    const { count } = await supabaseAdmin
      .from("couple_members")
      .select("*", { count: "exact", head: true })
      .eq("couple_id", invite.couple_id);
    if ((count ?? 0) >= 2) throw new Error("Esse grupo já está completo.");

    const { error: merr } = await supabaseAdmin
      .from("couple_members")
      .insert({ couple_id: invite.couple_id, user_id: userId, display_name: data.displayName });
    if (merr) throw new Error(merr.message);

    return { coupleId: invite.couple_id };
  });
