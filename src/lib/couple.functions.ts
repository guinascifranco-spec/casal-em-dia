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

// ---------------------------------------------------------------------------
// Get the couple the current user belongs to (with members)
// ---------------------------------------------------------------------------
export const getMyCouple = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { userId } = context;

    const { data: membership } = await supabaseAdmin
      .from("couple_members")
      .select("couple_id, display_name, couples!inner(id, name, created_at)")
      .eq("user_id", userId)
      .maybeSingle();

    if (!membership) return { hasCouple: false as const };

    const couple = membership.couples as unknown as {
      id: string;
      name: string | null;
      created_at: string;
    };

    const { data: members, error } = await supabaseAdmin
      .from("couple_members")
      .select("user_id, display_name")
      .eq("couple_id", couple.id);
    if (error) throw new Error(error.message);

    return {
      hasCouple: true as const,
      coupleId: couple.id,
      coupleName: couple.name ?? null,
      myUserId: userId,
      members: members ?? [],
    };
  });

// ---------------------------------------------------------------------------
// Create a new couple (the current user becomes the first member)
// ---------------------------------------------------------------------------
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

    // Check if user already has a couple
    const { data: existing } = await supabaseAdmin
      .from("couple_members")
      .select("couple_id")
      .eq("user_id", userId)
      .maybeSingle();
    if (existing) throw new Error("Você já pertence a um casal.");

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

    // Generate invite code for the partner
    const code = genCode();
    await supabaseAdmin.from("couple_invites").insert({
      code,
      couple_id: couple.id,
      created_by: userId,
    });

    return { coupleId: couple.id, inviteCode: code };
  });

// ---------------------------------------------------------------------------
// Get the current invite code (only shown while partner hasn't joined)
// ---------------------------------------------------------------------------
export const getMyInvite = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { userId } = context;

    const { data: membership } = await supabaseAdmin
      .from("couple_members")
      .select("couple_id")
      .eq("user_id", userId)
      .maybeSingle();
    if (!membership) return null;

    // If already 2 members → partner is in, no invite needed
    const { count } = await supabaseAdmin
      .from("couple_members")
      .select("*", { count: "exact", head: true })
      .eq("couple_id", membership.couple_id);
    if ((count ?? 0) >= 2) return null;

    const { data: existing } = await supabaseAdmin
      .from("couple_invites")
      .select("code, expires_at")
      .eq("couple_id", membership.couple_id)
      .gt("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (existing) return existing;

    // Create a fresh code
    const code = genCode();
    const { data: created, error } = await supabaseAdmin
      .from("couple_invites")
      .insert({ code, couple_id: membership.couple_id, created_by: userId })
      .select("code, expires_at")
      .single();
    if (error) throw new Error(error.message);
    return created;
  });

// ---------------------------------------------------------------------------
// Join a couple using an invite code (one-time action for the partner)
// ---------------------------------------------------------------------------
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

    // Ensure user doesn't already belong to a couple
    const { data: alreadyMember } = await supabaseAdmin
      .from("couple_members")
      .select("couple_id")
      .eq("user_id", userId)
      .maybeSingle();
    if (alreadyMember) throw new Error("Você já pertence a um casal.");

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
