import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { deleteExpense } from "@/lib/expenses.functions";
import type { Member } from "@/lib/balance";
import { formatBRL, relativeDatePtBR } from "@/lib/format";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

type ExpenseRow = {
  id: string;
  description: string;
  amount: number;
  paid_by: string;
  split_type: "split" | "transfer";
  created_by: string;
  created_at: string;
};

export function ExpenseList({
  expenses,
  members,
  myUserId,
}: {
  expenses: ExpenseRow[];
  members: Member[];
  myUserId: string;
}) {
  const qc = useQueryClient();
  const delFn = useServerFn(deleteExpense);
  const del = useMutation({
    mutationFn: (id: string) => delFn({ data: { id } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["expenses"] });
      toast.success("Lançamento excluído");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Erro"),
  });

  if (expenses.length === 0) {
    return (
      <div className="card-luxe p-10 text-center">
        <p className="text-sm text-muted-foreground">
          Nenhum lançamento ainda. Toque em{" "}
          <span className="font-medium text-gold">+ Novo gasto</span> para começar.
        </p>
      </div>
    );
  }

  const nameOf = (uid: string) => members.find((m) => m.user_id === uid)?.display_name ?? "—";

  return (
    <ul className="card-luxe divide-y divide-border overflow-hidden p-0">
      {expenses.map((e) => {
        const canDelete = e.created_by === myUserId;
        const isTransfer = e.split_type === "transfer";
        return (
          <li key={e.id} className="flex items-start gap-4 px-5 py-4 hover:bg-secondary/30">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="truncate text-sm font-medium text-foreground">{e.description}</p>
                <span
                  className={
                    "rounded-md border px-1.5 py-0.5 text-[10px] uppercase tracking-wider " +
                    (isTransfer
                      ? "border-[var(--color-gold)]/40 bg-[var(--color-gold)]/10 text-gold"
                      : "border-[var(--color-rose)]/40 bg-[var(--color-rose)]/10 text-rose")
                  }
                >
                  {isTransfer ? "Repasse" : "Dividido"}
                </span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {nameOf(e.paid_by)} pagou · {relativeDatePtBR(e.created_at)}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <p className="font-display tabular text-base font-semibold text-[color:var(--color-negative)]">
                −{formatBRL(e.amount)}
              </p>
              {canDelete && (
                <button
                  type="button"
                  aria-label="Excluir"
                  onClick={() => del.mutate(e.id)}
                  className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-[color:var(--color-negative)]"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
