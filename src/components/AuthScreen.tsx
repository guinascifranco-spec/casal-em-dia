import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

type Mode = "signin" | "signup";

export function AuthScreen() {
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
        toast.success("Conta criada. Verifique seu e-mail se necessário.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-6">
      {/* glow ambient */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 h-[420px] w-[420px] -translate-x-1/2 rounded-full opacity-25 blur-3xl"
        style={{ background: "var(--gradient-luxe)" }}
      />

      <div className="relative z-10 w-full max-w-sm">
        <div className="mb-10 text-center">
          <p className="text-[10px] uppercase tracking-[0.4em] text-gold">caloteiros</p>
          <h1 className="font-display mt-3 text-4xl text-foreground">
            contas a dois
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Controle financeiro elegante para casais.
          </p>
        </div>

        <div className="card-luxe p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                E-mail
              </Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="password"
                className="text-xs uppercase tracking-[0.2em] text-muted-foreground"
              >
                Senha
              </Label>
              <Input
                id="password"
                type="password"
                autoComplete={mode === "signup" ? "new-password" : "current-password"}
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <Button type="submit" className="h-12 w-full" disabled={loading}>
              {loading ? "Aguarde..." : mode === "signup" ? "Criar conta" : "Entrar"}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            {mode === "signup" ? "Já tem conta?" : "Novo por aqui?"}{" "}
            <button
              type="button"
              onClick={() => setMode(mode === "signup" ? "signin" : "signup")}
              className="text-gold underline-offset-4 hover:underline"
            >
              {mode === "signup" ? "Entrar" : "Criar conta"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
