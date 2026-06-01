import { createAPIFileRoute } from "@tanstack/react-start/api";
import Stripe from "stripe";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { createClient } from "@supabase/supabase-js";

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("Missing STRIPE_SECRET_KEY environment variable.");
  return new Stripe(key, { apiVersion: "2025-05-28.basil" });
}

export const APIRoute = createAPIFileRoute("/api/stripe/create-checkout-session")({
  POST: async ({ request }) => {
    try {
      // ── Auth: extract user from Bearer token ──────────────────────────────
      const authHeader = request.headers.get("authorization") ?? "";
      if (!authHeader.startsWith("Bearer ")) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
          headers: { "Content-Type": "application/json" },
        });
      }
      const token = authHeader.replace("Bearer ", "");

      const supabaseUrl = process.env.SUPABASE_URL!;
      const supabaseKey = process.env.SUPABASE_PUBLISHABLE_KEY!;
      const supabaseUser = createClient(supabaseUrl, supabaseKey, {
        global: { headers: { Authorization: `Bearer ${token}` } },
        auth: { persistSession: false, autoRefreshToken: false, storage: undefined },
      });

      const { data: claimsData, error: claimsErr } = await supabaseUser.auth.getClaims(token);
      if (claimsErr || !claimsData?.claims?.sub) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
          headers: { "Content-Type": "application/json" },
        });
      }

      const userId = claimsData.claims.sub;
      const userEmail = claimsData.claims.email as string | undefined;

      // ── Ensure user_plans row exists ──────────────────────────────────────
      await supabaseAdmin.from("user_plans").upsert(
        { user_id: userId, plan: "free" },
        { onConflict: "user_id", ignoreDuplicates: true },
      );

      const { data: planRow } = await supabaseAdmin
        .from("user_plans")
        .select("stripe_customer_id, plan")
        .eq("user_id", userId)
        .maybeSingle();

      const stripe = getStripe();
      const priceId = process.env.STRIPE_PRO_PRICE_ID;
      if (!priceId) throw new Error("Missing STRIPE_PRO_PRICE_ID environment variable.");

      // ── Create or retrieve Stripe Customer ───────────────────────────────
      let customerId = planRow?.stripe_customer_id ?? null;

      if (!customerId) {
        const customer = await stripe.customers.create({
          email: userEmail,
          metadata: { supabase_user_id: userId },
        });
        customerId = customer.id;
        await supabaseAdmin
          .from("user_plans")
          .update({ stripe_customer_id: customerId })
          .eq("user_id", userId);
      }

      // ── Create Checkout Session ──────────────────────────────────────────
      // Get the origin from the request headers to use for success/cancel URLs
      const origin = request.headers.get('origin') || new URL(request.url).origin;

      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        mode: "subscription",
        success_url: `${origin}/?checkout=success`,
        cancel_url: `${origin}/?checkout=cancel`,
        payment_method_types: ["card"],
      });

      if (!session.url) {
        throw new Error("Não foi possível criar a sessão de checkout.");
      }

      return new Response(
        JSON.stringify({
          url: session.url,
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      );
    } catch (err) {
      console.error("[Stripe] create-checkout-session error:", err);
      const message = err instanceof Error ? err.message : "Erro interno";
      return new Response(JSON.stringify({ error: message }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  },
});

