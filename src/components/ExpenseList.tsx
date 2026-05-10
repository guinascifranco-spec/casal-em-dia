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
      <div className="rounded-xl border border-dashed border-border bg-card p-10 text-center">
        <p className="text-sm text-muted-foreground">
          Nenhum lançamento ainda. Toque em <span className="font-medium text-foreground">+ Novo gasto</span>{" "}
          para começar.
        </p>
      </div>
    );
  }

  const nameOf = (uid: string) => members.find((m) => m.user_id === uid)?.display_name ?? "—";

  return (
    <ul className="divide-y divide-border rounded-xl border border-border bg-card">
      {expenses.map((e) => {
        const canDelete = e.created_by === myUserId;
        return (
          <li key={e.id} className="flex items-start gap-4 px-5 py-4">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="truncate text-sm font-medium">{e.description}</p>
                <span
                  className={
                    "rounded-md border px-1.5 py-0.5 text-[10px] uppercase tracking-wider " +
                    (e.split_type === "split"
                      ? "border-border text-muted-foreground"
                      : "border-foreground/20 bg-foreground/5 text-foreground")
                  }
                >
                  {e.split_type === "split" ? "Dividido" : "Repasse"}
                </span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {nameOf(e.paid_by)} pagou · {relativeDatePtBR(e.created_at)}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <p className="tabular text-sm font-semibold">{formatBRL(e.amount)}</p>
              {canDelete && (
                <button
                  type="button"
                  aria-label="Excluir"
                  onClick={() => del.mutate(e.id)}
                  className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
