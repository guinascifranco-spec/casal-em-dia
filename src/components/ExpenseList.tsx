import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { deleteExpense } from "@/lib/expenses.functions";
import type { Member } from "@/lib/balance";
import { formatBRL, relativeDatePtBR } from "@/lib/format";
import { Receipt, Trash2 } from "lucide-react";
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
      <div className="card-luxe flex flex-col items-center gap-4 px-6 py-14 text-center">
        <div className="relative">
          <span aria-hidden className="absolute inset-0 rounded-2xl bg-primary/20 blur-xl" />
          <span className="relative grid h-14 w-14 place-items-center rounded-2xl border border-border bg-surface text-primary">
            <Receipt size={24} strokeWidth={1.6} />
          </span>
        </div>
        <div>
          <p className="font-display text-lg tracking-tight text-foreground">
            Nenhum lançamento ainda
          </p>
          <p className="mx-auto mt-1.5 max-w-xs text-sm text-muted-foreground">
            Toque em <span className="font-semibold text-primary">Novo gasto</span> para registrar
            a primeira despesa do casal.
          </p>
        </div>
      </div>
    );
  }

  const nameOf = (uid: string) => members.find((m) => m.user_id === uid)?.display_name ?? "—";

  return (
    <ul className="space-y-2.5">
      {expenses.map((e) => {
        const canDelete = e.created_by === myUserId;
        const isTransfer = e.split_type === "transfer";
        return (
          <li
            key={e.id}
            className="card-luxe card-hover group grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-5 py-4"
          >
            <div className="flex min-w-0 items-center gap-3.5">
              <span
                aria-hidden
                className={
                  "grid h-10 w-10 shrink-0 place-items-center rounded-xl border text-[11px] font-bold uppercase " +
                  (isTransfer
                    ? "border-[color:var(--color-negative)]/30 bg-[color:var(--color-negative)]/10 text-[color:var(--color-negative)]"
                    : "border-primary/30 bg-primary/10 text-primary")
                }
              >
                {(nameOf(e.paid_by)[0] ?? "?").toUpperCase()}
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-foreground">{e.description}</p>
                <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span className="truncate">{nameOf(e.paid_by)} pagou</span>
                  <span className="text-border">•</span>
                  <span className="shrink-0">{relativeDatePtBR(e.created_at)}</span>
                </p>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-3">
              <div className="text-right">
                <p className="money text-base text-foreground sm:text-lg">{formatBRL(e.amount)}</p>
                <span
                  className={
                    "mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider " +
                    (isTransfer
                      ? "bg-[color:var(--color-negative)]/10 text-[color:var(--color-negative)]"
                      : "bg-primary/10 text-primary")
                  }
                >
                  {isTransfer ? "Repasse" : "Dividido"}
                </span>
              </div>
              {canDelete && (
                <button
                  type="button"
                  aria-label="Excluir"
                  onClick={() => del.mutate(e.id)}
                  className="rounded-lg p-1.5 text-muted-foreground opacity-0 transition-all hover:bg-destructive/10 hover:text-destructive focus-visible:opacity-100 group-hover:opacity-100"
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
