import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { createCouple, joinCouple } from "@/lib/couple.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function OnboardingScreen() {
  const qc = useQueryClient();
  const createFn = useServerFn(createCouple);
  const joinFn = useServerFn(joinCouple);

  const [createName, setCreateName] = useState("");
  const [joinName, setJoinName] = useState("");
  const [code, setCode] = useState("");

  const createM = useMutation({
    mutationFn: (vars: { displayName: string }) => createFn({ data: vars }),
    onSuccess: (res) => {
      toast.success(`Grupo criado. Código de convite: ${res.inviteCode}`);
      try {
        localStorage.setItem("caloteiros.activeCoupleId", res.coupleId);
      } catch {}
      qc.invalidateQueries({ queryKey: ["couples"] });
      qc.invalidateQueries({ queryKey: ["couple-state"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Erro"),
  });

  const joinM = useMutation({
    mutationFn: (vars: { code: string; displayName: string }) => joinFn({ data: vars }),
    onSuccess: (res) => {
      toast.success("Você entrou no grupo!");
      try {
        localStorage.setItem("caloteiros.activeCoupleId", res.coupleId);
      } catch {}
      qc.invalidateQueries({ queryKey: ["couples"] });
      qc.invalidateQueries({ queryKey: ["couple-state"] });
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
            <p className="text-[10px] uppercase tracking-[0.4em] text-gold">caloteiros</p>
            <h1 className="font-display mt-2 text-2xl text-foreground">contas a dois</h1>
          </div>
          <Button variant="ghost" size="sm" onClick={() => supabase.auth.signOut()}>
            Sair
          </Button>
        </div>

        <h2 className="font-display text-3xl text-foreground">Bem-vindo</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Crie um espaço novo para o seu casal ou entre com um código.
        </p>

        <div className="card-luxe mt-8 p-6">
          <Tabs defaultValue="create">
            <TabsList className="grid w-full grid-cols-2 bg-[var(--color-input)]">
              <TabsTrigger value="create">Criar casal</TabsTrigger>
              <TabsTrigger value="join">Entrar com código</TabsTrigger>
            </TabsList>

            <TabsContent value="create" className="mt-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cname" className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  Seu nome de exibição
                </Label>
                <Input
                  id="cname"
                  placeholder="Ex.: Fulano"
                  value={createName}
                  onChange={(e) => setCreateName(e.target.value)}
                />
              </div>
              <Button
                className="h-12 w-full"
                disabled={!createName.trim() || createM.isPending}
                onClick={() => createM.mutate({ displayName: createName.trim() })}
              >
                {createM.isPending ? "Criando..." : "Criar casal"}
              </Button>
            </TabsContent>

            <TabsContent value="join" className="mt-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="jname" className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  Seu nome de exibição
                </Label>
                <Input
                  id="jname"
                  placeholder="Ex.: Ciclana"
                  value={joinName}
                  onChange={(e) => setJoinName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="code" className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  Código de convite
                </Label>
                <Input
                  id="code"
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
