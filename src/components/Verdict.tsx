import { computeVerdict, type Expense, type Member } from "@/lib/balance";
import { formatBRL } from "@/lib/format";
import { ArrowRight, Check, Users } from "lucide-react";

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

function Avatar({ name, tone }: { name: string; tone: "mint" | "coral" }) {
  return (
    <span
      className={
        "grid h-11 w-11 shrink-0 place-items-center rounded-full border text-sm font-bold " +
        (tone === "mint"
          ? "border-primary/40 bg-primary/12 text-primary"
          : "border-[color:var(--color-negative)]/40 bg-[color:var(--color-negative)]/12 text-[color:var(--color-negative)]")
      }
      aria-hidden
    >
      {initials(name) || "?"}
    </span>
  );
}

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
      <section className="card-luxe flex flex-col items-center gap-3 p-10 text-center">
        <span className="grid h-12 w-12 place-items-center rounded-2xl bg-secondary text-muted-foreground">
          <Users size={20} />
        </span>
        <p className="font-display text-lg text-foreground">Falta uma pessoa</p>
        <p className="max-w-xs text-sm text-muted-foreground">
          Assim que seu parceiro entrar com o código, o saldo aparece aqui.
        </p>
      </section>
    );
  }

  const v = computeVerdict(members, expenses);
  if (!v) return null;

  if (v.kind === "even") {
    return (
      <section className="card-luxe relative overflow-hidden p-8 sm:p-10">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 -top-24 h-56 w-56 rounded-full opacity-30 blur-3xl"
          style={{ background: "var(--gradient-luxe)" }}
        />
        <p className="eyebrow">Saldo do casal</p>
        <div className="mt-5 flex items-center gap-4">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-primary/15 text-primary">
            <Check size={22} strokeWidth={2.5} />
          </span>
          <div>
            <p className="font-display text-2xl tracking-tight text-foreground sm:text-3xl">
              Vocês estão quites
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Nenhum saldo pendente entre vocês.
            </p>
          </div>
        </div>
      </section>
    );
  }

  const debtorIsMe = v.debtor.user_id === myUserId;

  return (
    <section className="relative overflow-hidden rounded-[calc(var(--radius)+6px)] border border-border bg-card shadow-lift">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-28 -top-28 h-72 w-72 rounded-full opacity-35 blur-3xl"
        style={{ background: "var(--gradient-luxe)" }}
      />
      <div className="relative p-7 sm:p-10">
        <div className="flex items-center justify-between gap-3">
          <p className="eyebrow">Saldo do casal</p>
          <span className="chip">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            atualizado
          </span>
        </div>

        <div className="mt-6 flex items-center gap-3 sm:gap-4">
          <Avatar name={v.debtor.display_name} tone="coral" />
          <ArrowRight size={18} className="shrink-0 text-muted-foreground" />
          <Avatar name={v.creditor.display_name} tone="mint" />
          <p className="min-w-0 text-sm leading-snug text-muted-foreground">
            <span className="font-semibold text-foreground">
              {debtorIsMe ? "Você" : v.debtor.display_name}
            </span>{" "}
            deve para{" "}
            <span className="font-semibold text-foreground">
              {!debtorIsMe ? "você" : v.creditor.display_name}
            </span>
          </p>
        </div>

        <p className="money mt-7 text-5xl leading-none text-foreground sm:text-7xl">
          {formatBRL(v.amount)}
        </p>

        <div className="mt-6 h-px w-full bg-border" />
        <p className="mt-4 text-xs text-muted-foreground">
          Registre um repasse para zerar o saldo entre vocês.
        </p>
      </div>
    </section>
  );
}
