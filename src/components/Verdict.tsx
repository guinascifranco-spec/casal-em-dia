import { computeVerdict, type Expense, type Member } from "@/lib/balance";
import { formatBRL } from "@/lib/format";

export function Verdict({
  members,
  expenses,
  myUserId,
}: {
  members: Member[];
  expenses: Expense[];
  myUserId: string;
}) {
  if (members.length < 2) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-card p-8 text-center">
        <p className="text-sm text-muted-foreground">
          Aguardando o parceiro entrar no casal para começar a contar.
        </p>
      </div>
    );
  }

  const v = computeVerdict(members, expenses);
  if (!v) return null;

  if (v.kind === "even") {
    return (
      <section className="rounded-2xl border border-border bg-card p-8 sm:p-10">
        <p className="text-xs uppercase tracking-widest text-muted-foreground">Veredito</p>
        <p className="mt-3 text-3xl font-medium tracking-tight sm:text-4xl">
          Vocês estão quites.
        </p>
        <p className="mt-2 text-sm text-muted-foreground">Nenhum saldo pendente entre vocês.</p>
      </section>
    );
  }

  const debtorIsMe = v.debtor.user_id === myUserId;
  return (
    <section className="rounded-2xl border border-border bg-card p-8 sm:p-10">
      <p className="text-xs uppercase tracking-widest text-muted-foreground">Veredito</p>
      <p className="mt-3 text-2xl font-medium leading-tight tracking-tight sm:text-3xl">
        <span className={debtorIsMe ? "text-negative" : "text-foreground"}>{v.debtor.display_name}</span>{" "}
        deve para{" "}
        <span className={!debtorIsMe ? "text-positive" : "text-foreground"}>{v.creditor.display_name}</span>
      </p>
      <p
        className={
          "tabular mt-4 text-5xl font-semibold tracking-tight sm:text-6xl " +
          (debtorIsMe ? "text-negative" : "text-positive")
        }
      >
        {formatBRL(v.amount)}
      </p>
    </section>
  );
}
