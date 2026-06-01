import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Sparkles, X } from "lucide-react";

export function UpgradeModal({
  open,
  onClose,
  onSuccess, // We might not use onSuccess immediately since it redirects, but keeping for signature
}: {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [processing, setProcessing] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  async function handleCheckout() {
    setProcessing(true);
    setLoadError(null);
    try {
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      if (!token) throw new Error("Sessão expirada. Faça login novamente.");

      const res = await fetch("/api/stripe/create-checkout-session", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? "Erro ao iniciar pagamento.");

      if (body.url) {
        window.location.href = body.url;
      } else {
         throw new Error("URL de checkout não encontrada.");
      }
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Erro ao carregar pagamento.");
      setProcessing(false);
    }
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
            disabled={processing}
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

          <div className="flex flex-col gap-2">
            <Button
              id="stripe-checkout-btn"
              onClick={handleCheckout}
              className="h-12 w-full text-base"
              disabled={processing}
            >
              {processing ? "Redirecionando..." : "Assinar Pro — Checkout Seguro"}
            </Button>
            <Button
              id="stripe-cancel-btn"
              type="button"
              variant="ghost"
              className="w-full text-muted-foreground"
              onClick={onClose}
              disabled={processing}
            >
              Agora não
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
