export function AppMockup() {
  return (
    <div className="relative mx-auto w-full max-w-md">
      <div className="absolute -inset-6 -z-10 rounded-[2.5rem] bg-[var(--color-positive)]/10 blur-2xl" />
      <div className="card-luxe overflow-hidden rounded-3xl p-6 sm:p-7">
        <div className="flex items-center justify-between">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">
            Junho 2026
          </p>
          <span className="inline-flex h-2 w-2 rounded-full bg-[var(--color-positive)]" />
        </div>

        <div className="mt-5 rounded-2xl bg-[var(--color-positive)]/15 p-5">
          <p className="text-xs text-muted-foreground">Ana deve a João</p>
          <p className="mt-1 text-3xl font-semibold tabular text-foreground">
            R$ 327,40
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Quitação sugerida até 30/06
          </p>
        </div>

        <ul className="mt-5 space-y-3 text-sm">
          {[
            { who: "João", what: "Aluguel", value: "R$ 1.800,00" },
            { who: "Ana", what: "Mercado", value: "R$ 412,30" },
            { who: "Ana", what: "Conta de luz", value: "R$ 187,90" },
            { who: "João", what: "Internet", value: "R$ 129,90" },
          ].map((row) => (
            <li
              key={row.what}
              className="flex items-center justify-between border-b border-border/60 pb-3 last:border-none last:pb-0"
            >
              <div className="min-w-0">
                <p className="truncate text-foreground">{row.what}</p>
                <p className="text-xs text-muted-foreground">pago por {row.who}</p>
              </div>
              <span className="shrink-0 tabular text-foreground">{row.value}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
