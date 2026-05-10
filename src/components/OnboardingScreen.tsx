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
      toast.success(`Casal criado. Código de convite: ${res.inviteCode}`);
      qc.invalidateQueries({ queryKey: ["couple-state"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Erro"),
  });

  const joinM = useMutation({
    mutationFn: (vars: { code: string; displayName: string }) => joinFn({ data: vars }),
    onSuccess: () => {
      toast.success("Você entrou no casal!");
      qc.invalidateQueries({ queryKey: ["couple-state"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Erro"),
  });

  return (
    <div className="min-h-screen bg-background px-6 py-12">
      <div className="mx-auto max-w-md">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-2xl font-semibold tracking-tight">caloteiros</h1>
          <Button variant="ghost" size="sm" onClick={() => supabase.auth.signOut()}>
            Sair
          </Button>
        </div>

        <h2 className="text-xl font-medium">Bem-vindo</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Crie um espaço novo para o seu casal ou entre com um código.
        </p>

        <Tabs defaultValue="create" className="mt-8">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="create">Criar casal</TabsTrigger>
            <TabsTrigger value="join">Entrar com código</TabsTrigger>
          </TabsList>

          <TabsContent value="create" className="mt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cname">Seu nome de exibição</Label>
              <Input
                id="cname"
                placeholder="Ex.: Fulano"
                value={createName}
                onChange={(e) => setCreateName(e.target.value)}
              />
            </div>
            <Button
              className="w-full h-11"
              disabled={!createName.trim() || createM.isPending}
              onClick={() => createM.mutate({ displayName: createName.trim() })}
            >
              {createM.isPending ? "Criando..." : "Criar casal"}
            </Button>
          </TabsContent>

          <TabsContent value="join" className="mt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="jname">Seu nome de exibição</Label>
              <Input
                id="jname"
                placeholder="Ex.: Ciclana"
                value={joinName}
                onChange={(e) => setJoinName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="code">Código de convite</Label>
              <Input
                id="code"
                placeholder="ABC123"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                className="uppercase tracking-widest tabular"
              />
            </div>
            <Button
              className="w-full h-11"
              disabled={!joinName.trim() || code.length < 4 || joinM.isPending}
              onClick={() => joinM.mutate({ code: code.trim(), displayName: joinName.trim() })}
            >
              {joinM.isPending ? "Entrando..." : "Entrar no casal"}
            </Button>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
