import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

function genCode() {
  // 6-char uppercase alphanumeric code
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let s = "";
  for (let i = 0; i < 6; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return s;
}

export const getMyCoupleState = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { userId } = context;
    const { data: myMember } = await supabaseAdmin
      .from("couple_members")
      .select("couple_id, display_name")
      .eq("user_id", userId)
      .maybeSingle();

    if (!myMember) return { hasCouple: false as const };

    const { data: members, error } = await supabaseAdmin
      .from("couple_members")
      .select("user_id, display_name")
      .eq("couple_id", myMember.couple_id);
    if (error) throw new Error(error.message);

    return {
      hasCouple: true as const,
      coupleId: myMember.couple_id,
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
    const { data: existing } = await supabaseAdmin
      .from("couple_members")
      .select("couple_id")
      .eq("user_id", userId)
      .maybeSingle();
    if (existing) throw new Error("Você já está em um casal.");

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

    // create initial invite
    const code = genCode();
    await supabaseAdmin.from("couple_invites").insert({
      code,
      couple_id: couple.id,
      created_by: userId,
    });

    return { coupleId: couple.id, inviteCode: code };
  });

export const getMyInvite = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { userId } = context;
    const { data: m } = await supabaseAdmin
      .from("couple_members")
      .select("couple_id")
      .eq("user_id", userId)
      .maybeSingle();
    if (!m) return null;

    // count members; if already 2, no invite needed
    const { count } = await supabaseAdmin
      .from("couple_members")
      .select("*", { count: "exact", head: true })
      .eq("couple_id", m.couple_id);
    if ((count ?? 0) >= 2) return null;

    const { data: existing } = await supabaseAdmin
      .from("couple_invites")
      .select("code, expires_at")
      .eq("couple_id", m.couple_id)
      .gt("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (existing) return existing;

    const code = genCode();
    const { data: created, error } = await supabaseAdmin
      .from("couple_invites")
      .insert({ code, couple_id: m.couple_id, created_by: userId })
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
    const { data: existing } = await supabaseAdmin
      .from("couple_members")
      .select("couple_id")
      .eq("user_id", userId)
      .maybeSingle();
    if (existing) throw new Error("Você já está em um casal.");

    const code = data.code.trim().toUpperCase();
    const { data: invite } = await supabaseAdmin
      .from("couple_invites")
      .select("couple_id, expires_at")
      .eq("code", code)
      .maybeSingle();
    if (!invite) throw new Error("Código inválido.");
    if (new Date(invite.expires_at) < new Date()) throw new Error("Código expirado.");

    const { count } = await supabaseAdmin
      .from("couple_members")
      .select("*", { count: "exact", head: true })
      .eq("couple_id", invite.couple_id);
    if ((count ?? 0) >= 2) throw new Error("Esse casal já está completo.");

    const { error: merr } = await supabaseAdmin
      .from("couple_members")
      .insert({ couple_id: invite.couple_id, user_id: userId, display_name: data.displayName });
    if (merr) throw new Error(merr.message);

    return { coupleId: invite.couple_id };
  });
