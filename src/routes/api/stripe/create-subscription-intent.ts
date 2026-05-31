import { createAPIFileRoute } from "@tanstack/react-start/api";
import Stripe from "stripe";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { createClient } from "@supabase/supabase-js";

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("Missing STRIPE_SECRET_KEY environment variable.");
  return new Stripe(key, { apiVersion: "2025-05-28.basil" });
}

export const APIRoute = createAPIFileRoute("/api/stripe/create-subscription-intent")({
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

      // ── Create incomplete Subscription (returns PaymentIntent clientSecret) ─
      const subscription = await stripe.subscriptions.create({
        customer: customerId,
        items: [{ price: priceId }],
        payment_behavior: "default_incomplete",
        payment_settings: { save_default_payment_method: "on_subscription" },
        expand: ["latest_invoice.payment_intent"],
        currency: "brl",
      });

      const invoice = subscription.latest_invoice as Stripe.Invoice;
      const paymentIntent = invoice.payment_intent as Stripe.PaymentIntent;

      if (!paymentIntent?.client_secret) {
        throw new Error("Não foi possível criar a intenção de pagamento.");
      }

      return new Response(
        JSON.stringify({
          clientSecret: paymentIntent.client_secret,
          subscriptionId: subscription.id,
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      );
    } catch (err) {
      console.error("[Stripe] create-subscription-intent error:", err);
      const message = err instanceof Error ? err.message : "Erro interno";
      return new Response(JSON.stringify({ error: message }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  },
});
