import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { createCouple } from "@/lib/couple.functions";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export function CreateGroupSheet({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onCreated: (coupleId: string) => void;
}) {
  const qc = useQueryClient();
  const createFn = useServerFn(createCouple);
  const [coupleName, setCoupleName] = useState("");
  const [displayName, setDisplayName] = useState("");

  const m = useMutation({
    mutationFn: (vars: { coupleName?: string; displayName: string }) => createFn({ data: vars }),
    onSuccess: (res) => {
      toast.success(`Grupo criado. Código: ${res.inviteCode}`);
      qc.invalidateQueries({ queryKey: ["couples"] });
      qc.invalidateQueries({ queryKey: ["couple-state"] });
      setCoupleName("");
      setDisplayName("");
      onOpenChange(false);
      onCreated(res.coupleId);
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Erro"),
  });

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-3xl border-t border-[rgba(255,255,255,0.07)] bg-card">
        <SheetHeader className="text-left">
          <SheetTitle className="font-display text-2xl">Novo grupo</SheetTitle>
        </SheetHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!displayName.trim()) return;
            m.mutate({
              coupleName: coupleName.trim() || undefined,
              displayName: displayName.trim(),
            });
          }}
          className="mt-6 space-y-5 pb-6"
        >
          <div className="space-y-2">
            <Label htmlFor="gname" className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Nome do grupo
            </Label>
            <Input
              id="gname"
              placeholder="Ex.: Gastos Junho"
              value={coupleName}
              onChange={(e) => setCoupleName(e.target.value)}
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dname" className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Seu nome de exibição
            </Label>
            <Input
              id="dname"
              placeholder="Ex.: Fulano"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />
          </div>
          <Button type="submit" className="h-12 w-full" disabled={!displayName.trim() || m.isPending}>
            {m.isPending ? "Criando..." : "Criar grupo"}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}
