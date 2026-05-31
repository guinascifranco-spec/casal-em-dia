import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { createPeriod } from "@/lib/period.functions";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

function defaultPeriodName() {
  return new Date().toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
}

export function CreatePeriodSheet({
  coupleId,
  open,
  onOpenChange,
  onCreated,
}: {
  coupleId: string;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onCreated: (periodId: string) => void;
}) {
  const qc = useQueryClient();
  const createFn = useServerFn(createPeriod);
  const [name, setName] = useState("");

  const m = useMutation({
    mutationFn: (vars: { coupleId: string; name: string }) => createFn({ data: vars }),
    onSuccess: (period) => {
      toast.success(`Período "${period.name}" criado!`);
      qc.invalidateQueries({ queryKey: ["periods", coupleId] });
      setName("");
      onOpenChange(false);
      onCreated(period.id);
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Erro"),
  });

  function handleOpen(v: boolean) {
    if (v && !name) setName(defaultPeriodName());
    onOpenChange(v);
  }

  return (
    <Sheet open={open} onOpenChange={handleOpen}>
      <SheetContent side="bottom" className="rounded-t-3xl border-t border-border bg-card">
        <SheetHeader className="text-left">
          <SheetTitle className="font-display text-2xl">Novo período</SheetTitle>
        </SheetHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!name.trim()) return;
            m.mutate({ coupleId, name: name.trim() });
          }}
          className="mt-6 space-y-5 pb-6"
        >
          <div className="space-y-2">
            <Label htmlFor="period-name" className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Nome do período
            </Label>
            <Input
              id="period-name"
              placeholder="Ex.: Junho 2026"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
            <p className="text-xs text-muted-foreground">
              Ambos do casal verão este período automaticamente — sem código.
            </p>
          </div>
          <Button type="submit" className="h-12 w-full" disabled={!name.trim() || m.isPending}>
            {m.isPending ? "Criando..." : "Criar período"}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}
