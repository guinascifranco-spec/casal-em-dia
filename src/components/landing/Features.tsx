import { Scale, History, HeartHandshake, Wallet } from "lucide-react";
import { Reveal } from "./Reveal";

const features = [
  {
    icon: Scale,
    title: "Divisão proporcional à renda",
    desc: "Quem ganha mais, contribui mais. Você define a proporção.",
  },
  {
    icon: History,
    title: "Histórico transparente",
    desc: "Tudo registrado, datado e visível para os dois. Sempre.",
  },
  {
    icon: HeartHandshake,
    title: "Sem julgamento",
    desc: "Só números claros. A conversa fica mais leve quando ninguém precisa adivinhar.",
  },
  {
    icon: Wallet,
    title: "Qualquer modelo de conta",
    desc: "Separada, conjunta, mista — o caloteiros se adapta ao seu arranjo.",
  },
];

export function Features() {
  return (
    <section id="features" className="border-t border-border/60">
      <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-28">
        <Reveal>
          <h2 className="max-w-2xl text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Pensado pra durar mais que o boleto.
          </h2>
        </Reveal>
        <div className="mt-12 grid gap-5 sm:grid-cols-2">
          {features.map((f, i) => (
            <Reveal key={f.title} delay={i * 80}>
              <div className="card-luxe flex h-full gap-5 p-7">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--color-positive)]/15 text-[var(--color-positive)]">
                  <f.icon size={20} strokeWidth={1.8} />
                </div>
                <div className="min-w-0">
                  <h3 className="text-lg font-medium text-foreground">{f.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                    {f.desc}
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
