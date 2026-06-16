import { Users, Receipt, Scale } from "lucide-react";
import { Reveal } from "./Reveal";

const steps = [
  {
    icon: Users,
    title: "Cadastrem os dois",
    desc: "Conectem suas contas no caloteiros em menos de um minuto.",
  },
  {
    icon: Receipt,
    title: "Registrem os gastos",
    desc: "Separados ou compartilhados — cada um anota o que pagou.",
  },
  {
    icon: Scale,
    title: "Vejam o saldo",
    desc: "Quem deve, quanto, para quem. Atualizado em tempo real.",
  },
];

export function HowItWorks() {
  return (
    <section id="como-funciona" className="border-t border-border/60 bg-card/40">
      <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-28">
        <Reveal>
          <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Simples assim
          </h2>
          <p className="mt-3 max-w-xl text-base text-muted-foreground">
            Três passos. Sem planilha. Sem cobrança constrangedora.
          </p>
        </Reveal>
        <div className="mt-14 grid gap-10 sm:grid-cols-3 sm:gap-8">
          {steps.map((s, i) => (
            <Reveal key={s.title} delay={i * 120}>
              <div className="flex flex-col">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--color-positive)]/15 text-[var(--color-positive)]">
                  <s.icon size={22} strokeWidth={1.8} />
                </div>
                <p className="mt-5 text-xs font-medium uppercase tracking-widest text-muted-foreground">
                  Passo {i + 1}
                </p>
                <h3 className="mt-1 text-xl font-medium text-foreground">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {s.desc}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
