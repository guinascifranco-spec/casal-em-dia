import { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Sparkles, X } from "lucide-react";

// ── Stripe instance (loaded once, publishable key is safe on client) ──────────
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY ?? "");

// ── Inner form (must be inside <Elements>) ────────────────────────────────────
function CheckoutForm({
  onSuccess,
  onCancel,
}: {
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [stripeError, setStripeError] = useState<string | null>(null);

  async function handlePay(e: React.FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;

    setProcessing(true);
    setStripeError(null);

    const { error } = await stripe.confirmPayment({
      elements,
      redirect: "if_required",
    });

    if (error) {
      setStripeError(error.message ?? "Erro no pagamento.");
      setProcessing(false);
      return;
    }

    // Payment succeeded — webhook will update Supabase asynchronously.
    // We optimistically update locally so the UX is immediate.
    toast.success("Bem-vindo ao Pro! 🎉 Seu lançamento foi salvo.", {
      duration: 5000,
    });
    onSuccess();
  }

  return (
    <form onSubmit={handlePay} className="space-y-5">
      <div className="rounded-xl border border-border bg-background p-4">
        <PaymentElement
          options={{
            layout: "tabs",
            fields: { billingDetails: { email: "never" } },
          }}
        />
      </div>

      {stripeError && (
        <p className="text-sm text-destructive">{stripeError}</p>
      )}

      <div className="flex flex-col gap-2">
        <Button
          id="stripe-pay-btn"
          type="submit"
          className="h-12 w-full text-base"
          disabled={!stripe || processing}
        >
          {processing ? "Processando..." : "Assinar Pro — R$ 9,99/mês"}
        </Button>
        <Button
          id="stripe-cancel-btn"
          type="button"
          variant="ghost"
          className="w-full text-muted-foreground"
          onClick={onCancel}
          disabled={processing}
        >
          Agora não
        </Button>
      </div>
    </form>
  );
}

// ── Public component ──────────────────────────────────────────────────────────
export function UpgradeModal({
  open,
  onClose,
  onSuccess,
}: {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Fetch clientSecret whenever the modal opens
  useEffect(() => {
    if (!open) {
      setClientSecret(null);
      setLoadError(null);
      return;
    }

    async function fetchSecret() {
      try {
        const { data } = await supabase.auth.getSession();
        const token = data.session?.access_token;
        if (!token) throw new Error("Sessão expirada. Faça login novamente.");

        const res = await fetch("/api/stripe/create-subscription-intent", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        });

        const body = await res.json();
        if (!res.ok) throw new Error(body.error ?? "Erro ao iniciar pagamento.");

        setClientSecret(body.clientSecret);
      } catch (err) {
        setLoadError(err instanceof Error ? err.message : "Erro ao carregar pagamento.");
      }
    }

    fetchSecret();
  }, [open]);

  function handleSuccess() {
    onClose();
    onSuccess();
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md rounded-2xl border border-border bg-card p-0 shadow-luxe">
        {/* Header */}
        <div
          className="relative rounded-t-2xl p-6 text-primary-foreground"
          style={{ background: "var(--gradient-luxe)" }}
        >
          <button
            id="upgrade-modal-close"
            onClick={onClose}
            className="absolute right-4 top-4 rounded-full p-1 opacity-70 hover:opacity-100 transition-opacity"
            aria-label="Fechar"
          >
            <X size={16} />
          </button>

          <div className="flex items-center gap-2">
            <Sparkles size={20} />
            <DialogTitle className="font-display text-xl">
              Plano Pro — Caloteiros
            </DialogTitle>
          </div>

          <p className="mt-1 text-sm opacity-80">
            Limite de 5 lançamentos gratuitos atingido neste mês.
          </p>

          <div className="mt-4 flex items-baseline gap-1">
            <span className="font-display text-4xl font-bold">R$ 9,99</span>
            <span className="text-sm opacity-80">/mês</span>
          </div>

          <ul className="mt-3 space-y-1 text-sm">
            {[
              "Lançamentos ilimitados para o casal",
              "Histórico completo por período",
              "Suporte prioritário",
            ].map((benefit) => (
              <li key={benefit} className="flex items-center gap-2 opacity-90">
                <span className="text-xs">✦</span>
                {benefit}
              </li>
            ))}
          </ul>
        </div>

        {/* Body */}
        <div className="p-6">
          {loadError && (
            <p className="mb-4 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
              {loadError}
            </p>
          )}

          {!loadError && !clientSecret && (
            <div className="flex items-center justify-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          )}

          {clientSecret && (
            <Elements
              stripe={stripePromise}
              options={{
                clientSecret,
                appearance: {
                  theme: "night",
                  variables: {
                    colorPrimary: "#C9A96E",
                    colorBackground: "#1a1a1a",
                    borderRadius: "12px",
                    fontFamily: "Inter, sans-serif",
                  },
                },
                locale: "pt-BR",
              }}
            >
              <CheckoutForm onSuccess={handleSuccess} onCancel={onClose} />
            </Elements>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
