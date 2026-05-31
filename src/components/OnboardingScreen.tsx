import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { createCouple, joinCouple } from "@/lib/couple.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { Heart } from "lucide-react";
import { toast } from "sonner";

export function OnboardingScreen() {
  const qc = useQueryClient();
  const createFn = useServerFn(createCouple);
  const joinFn = useServerFn(joinCouple);

  const [myName, setMyName] = useState("");
  const [coupleName, setCoupleName] = useState("");
  const [joinName, setJoinName] = useState("");
  const [code, setCode] = useState("");

  const createM = useMutation({
    mutationFn: (vars: { displayName: string; coupleName?: string }) =>
      createFn({ data: vars }),
    onSuccess: () => {
      toast.success("Casal criado! Envie o código para o seu parceiro entrar.");
      qc.invalidateQueries({ queryKey: ["couple"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Erro"),
  });

  const joinM = useMutation({
    mutationFn: (vars: { code: string; displayName: string }) =>
      joinFn({ data: vars }),
    onSuccess: () => {
      toast.success("Você entrou no casal!");
      qc.invalidateQueries({ queryKey: ["couple"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Erro"),
  });

  return (
    <div className="relative min-h-screen overflow-hidden bg-background px-6 py-12">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 right-0 h-[420px] w-[420px] rounded-full opacity-20 blur-3xl"
        style={{ background: "var(--gradient-luxe)" }}
      />

      <div className="relative z-10 mx-auto max-w-md">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-[0.4em] text-gold">casal em dia</p>
            <h1 className="font-display mt-2 text-2xl text-foreground">contas a dois</h1>
          </div>
          <Button variant="ghost" size="sm" onClick={() => supabase.auth.signOut()}>
            Sair
          </Button>
        </div>

        <div className="mb-8">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-luxe shadow-luxe">
              <Heart size={22} className="text-primary-foreground" />
            </div>
            <div>
              <h2 className="font-display text-2xl text-foreground">Bem-vindo</h2>
              <p className="text-sm text-muted-foreground">
                Crie seu casal ou entre com o código do seu parceiro.
              </p>
            </div>
          </div>
        </div>

        <div className="card-luxe p-6">
          <Tabs defaultValue="create">
            <TabsList className="grid w-full grid-cols-2 bg-[var(--color-input)]">
              <TabsTrigger value="create">Criar casal</TabsTrigger>
              <TabsTrigger value="join">Entrar com código</TabsTrigger>
            </TabsList>

            {/* ── CREATE ── */}
            <TabsContent value="create" className="mt-6 space-y-4">
              <p className="text-xs text-muted-foreground">
                Você cria o casal <strong>uma única vez</strong>. Depois disso, ambos podem criar
                novos períodos (meses) livremente.
              </p>
              <div className="space-y-2">
                <Label htmlFor="myName" className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  Seu nome de exibição
                </Label>
                <Input
                  id="myName"
                  placeholder="Ex.: João"
                  value={myName}
                  onChange={(e) => setMyName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="coupleName" className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  Nome do casal <span className="text-muted-foreground/60">(opcional)</span>
                </Label>
                <Input
                  id="coupleName"
                  placeholder="Ex.: João & Maria"
                  value={coupleName}
                  onChange={(e) => setCoupleName(e.target.value)}
                />
              </div>
              <Button
                className="h-12 w-full"
                disabled={!myName.trim() || createM.isPending}
                onClick={() =>
                  createM.mutate({
                    displayName: myName.trim(),
                    coupleName: coupleName.trim() || undefined,
                  })
                }
              >
                {createM.isPending ? "Criando..." : "Criar casal"}
              </Button>
            </TabsContent>

            {/* ── JOIN ── */}
            <TabsContent value="join" className="mt-6 space-y-4">
              <p className="text-xs text-muted-foreground">
                Use o código que seu parceiro gerou ao criar o casal.
                Você só precisa fazer isso <strong>uma vez</strong>.
              </p>
              <div className="space-y-2">
                <Label htmlFor="jname" className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  Seu nome de exibição
                </Label>
                <Input
                  id="jname"
                  placeholder="Ex.: Maria"
                  value={joinName}
                  onChange={(e) => setJoinName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="joinCode" className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  Código de convite
                </Label>
                <Input
                  id="joinCode"
                  placeholder="ABC123"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  className="font-display tabular text-xl uppercase tracking-[0.3em] text-gold"
                />
              </div>
              <Button
                className="h-12 w-full"
                disabled={!joinName.trim() || code.length < 4 || joinM.isPending}
                onClick={() => joinM.mutate({ code: code.trim(), displayName: joinName.trim() })}
              >
                {joinM.isPending ? "Entrando..." : "Entrar no casal"}
              </Button>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
