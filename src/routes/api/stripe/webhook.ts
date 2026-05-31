import { createAPIFileRoute } from "@tanstack/react-start/api";
import Stripe from "stripe";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("Missing STRIPE_SECRET_KEY environment variable.");
  return new Stripe(key, { apiVersion: "2025-05-28.basil" });
}

export const APIRoute = createAPIFileRoute("/api/stripe/webhook")({
  POST: async ({ request }) => {
    const stripe = getStripe();
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      return new Response("Missing STRIPE_WEBHOOK_SECRET", { status: 500 });
    }

    const signature = request.headers.get("stripe-signature");
    if (!signature) {
      return new Response("Missing stripe-signature header", { status: 400 });
    }

    let event: Stripe.Event;
    try {
      const rawBody = await request.text();
      event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
    } catch (err) {
      console.error("[Stripe Webhook] Signature verification failed:", err);
      return new Response("Webhook signature invalid", { status: 400 });
    }

    try {
      if (event.type === "invoice.payment_succeeded") {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId =
          typeof invoice.customer === "string" ? invoice.customer : invoice.customer?.id;
        const subscriptionId =
          typeof invoice.subscription === "string"
            ? invoice.subscription
            : invoice.subscription?.id;

        if (!customerId) {
          console.warn("[Stripe Webhook] invoice.payment_succeeded missing customer id");
          return new Response("ok", { status: 200 });
        }

        // Upgrade plan to pro
        const { error } = await supabaseAdmin
          .from("user_plans")
          .update({
            plan: "pro",
            stripe_subscription_id: subscriptionId ?? null,
            updated_at: new Date().toISOString(),
          })
          .eq("stripe_customer_id", customerId);

        if (error) {
          console.error("[Stripe Webhook] Supabase update error (payment_succeeded):", error);
        } else {
          console.log(`[Stripe Webhook] Upgraded plan to PRO for customer ${customerId}`);
        }
      }

      if (event.type === "customer.subscription.deleted") {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId =
          typeof subscription.customer === "string"
            ? subscription.customer
            : subscription.customer?.id;

        if (!customerId) {
          console.warn("[Stripe Webhook] subscription.deleted missing customer id");
          return new Response("ok", { status: 200 });
        }

        // Downgrade back to free
        const { error } = await supabaseAdmin
          .from("user_plans")
          .update({
            plan: "free",
            stripe_subscription_id: null,
            updated_at: new Date().toISOString(),
          })
          .eq("stripe_customer_id", customerId);

        if (error) {
          console.error("[Stripe Webhook] Supabase update error (subscription.deleted):", error);
        } else {
          console.log(`[Stripe Webhook] Downgraded plan to FREE for customer ${customerId}`);
        }
      }

      return new Response("ok", { status: 200 });
    } catch (err) {
      console.error("[Stripe Webhook] Handler error:", err);
      return new Response("Internal error", { status: 500 });
    }
  },
});
