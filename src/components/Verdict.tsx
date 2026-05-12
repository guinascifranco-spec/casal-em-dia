import { computeVerdict, type Expense, type Member } from "@/lib/balance";
import { formatBRL } from "@/lib/format";
import { Sparkles } from "lucide-react";

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
      <div className="card-luxe p-8 text-center">
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
      <section className="card-luxe relative overflow-hidden p-8 sm:p-10">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full opacity-20 blur-3xl"
          style={{ background: "var(--gradient-luxe)" }}
        />
        <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-gold">
          <Sparkles size={14} /> Veredito
        </div>
        <p className="font-display mt-4 text-3xl font-medium tracking-tight text-foreground sm:text-4xl">
          Vocês estão quites.
        </p>
        <p className="mt-3 text-sm text-muted-foreground">
          Nenhum saldo pendente entre vocês.
        </p>
      </section>
    );
  }

  const debtorIsMe = v.debtor.user_id === myUserId;
  return (
    <section className="card-luxe relative overflow-hidden p-8 sm:p-10">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full opacity-25 blur-3xl"
        style={{ background: "var(--gradient-luxe)" }}
      />
      <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-gold">
        <Sparkles size={14} /> Veredito
      </div>
      <p className="font-display mt-4 text-2xl font-medium leading-tight tracking-tight sm:text-3xl">
        <span className={debtorIsMe ? "text-[color:var(--color-negative)]" : "text-foreground"}>
          {v.debtor.display_name}
        </span>
        <span className="text-muted-foreground"> deve para </span>
        <span className={!debtorIsMe ? "text-[color:var(--color-positive)]" : "text-foreground"}>
          {v.creditor.display_name}
        </span>
      </p>
      <p className="font-display tabular mt-6 text-5xl font-semibold tracking-tight text-gold sm:text-6xl">
        {formatBRL(v.amount)}
      </p>
    </section>
  );
}
