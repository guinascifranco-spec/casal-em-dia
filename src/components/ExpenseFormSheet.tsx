import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { createExpense } from "@/lib/expenses.functions";
import type { Member } from "@/lib/balance";
import { parseBRLInput } from "@/lib/format";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function ExpenseFormSheet({
  coupleId,
  members,
  myUserId,
}: {
  coupleId: string;
  members: Member[];
  myUserId: string;
}) {
  const qc = useQueryClient();
  const createFn = useServerFn(createExpense);
  const [open, setOpen] = useState(false);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [paidBy, setPaidBy] = useState<string>(myUserId);
  const [splitType, setSplitType] = useState<"split" | "transfer">("split");

  const m = useMutation({
    mutationFn: (vars: {
      coupleId: string;
      description: string;
      amount: number;
      paidBy: string;
      splitType: "split" | "transfer";
    }) => createFn({ data: vars }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["expenses", coupleId] });
      setOpen(false);
      setDescription("");
      setAmount("");
      setSplitType("split");
      toast.success("Lançamento registrado");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Erro"),
  });

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const value = parseBRLInput(amount);
    if (!description.trim() || value <= 0) {
      toast.error("Preencha descrição e valor válidos.");
      return;
    }
    m.mutate({ coupleId, description: description.trim(), amount: value, paidBy, splitType });
  }

  const otherUserId = members.find((mb) => mb.user_id !== myUserId)?.user_id ?? myUserId;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          size="lg"
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full p-0 shadow-luxe sm:h-12 sm:w-auto sm:px-5"
        >
          <Plus size={20} className="sm:mr-1" />
          <span className="hidden sm:inline">Novo gasto</span>
        </Button>
      </SheetTrigger>
      <SheetContent
        side="bottom"
        className="rounded-t-3xl border-t border-[rgba(255,255,255,0.07)] bg-card"
      >
        <SheetHeader className="text-left">
          <SheetTitle className="font-display text-2xl">Novo lançamento</SheetTitle>
        </SheetHeader>

        <form onSubmit={submit} className="mt-6 space-y-5 px-1 pb-6">
          <div className="space-y-2">
            <Label htmlFor="desc" className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Descrição
            </Label>
            <Input
              id="desc"
              autoFocus
              placeholder="Ex.: Mercado"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="amount"
              className="text-xs uppercase tracking-[0.2em] text-muted-foreground"
            >
              Valor (R$)
            </Label>
            <Input
              id="amount"
              inputMode="decimal"
              placeholder="0,00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="font-display tabular text-2xl text-gold"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Quem pagou
            </Label>
            <div className="grid grid-cols-2 gap-2">
              {members.map((mb) => (
                <button
                  key={mb.user_id}
                  type="button"
                  onClick={() => setPaidBy(mb.user_id)}
                  className={cn(
                    "h-12 rounded-xl border text-sm font-medium transition-all",
                    paidBy === mb.user_id
                      ? "border-transparent bg-gradient-luxe text-primary-foreground shadow-luxe"
                      : "border-[rgba(255,255,255,0.08)] bg-[var(--color-input)] text-foreground hover:border-[var(--color-gold)]/40",
                  )}
                >
                  {mb.display_name}
                  {mb.user_id === myUserId ? " (você)" : ""}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Divisão
            </Label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setSplitType("split")}
                className={cn(
                  "rounded-xl border p-3 text-left transition-all",
                  splitType === "split"
                    ? "border-transparent bg-gradient-luxe text-primary-foreground shadow-luxe"
                    : "border-[rgba(255,255,255,0.08)] bg-[var(--color-input)] text-foreground hover:border-[var(--color-gold)]/40",
                )}
              >
                <div className="text-sm font-semibold">Dividir 50/50</div>
                <div className="text-xs opacity-80">Cada um deve metade</div>
              </button>
              <button
                type="button"
                onClick={() => setSplitType("transfer")}
                className={cn(
                  "rounded-xl border p-3 text-left transition-all",
                  splitType === "transfer"
                    ? "border-transparent bg-gradient-luxe text-primary-foreground shadow-luxe"
                    : "border-[rgba(255,255,255,0.08)] bg-[var(--color-input)] text-foreground hover:border-[var(--color-gold)]/40",
                )}
              >
                <div className="text-sm font-semibold">Repasse 100%</div>
                <div className="text-xs opacity-80">
                  Pertence inteiro ao{" "}
                  {members.find((mb) => mb.user_id === otherUserId)?.display_name ?? "outro"}
                </div>
              </button>
            </div>
          </div>

          <Button type="submit" className="h-12 w-full" disabled={m.isPending}>
            {m.isPending ? "Salvando..." : "Registrar"}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}
