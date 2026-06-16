import { Link } from "@tanstack/react-router";
import { Reveal } from "./Reveal";

export function FinalCTA() {
  return (
    <section className="border-t border-border/60 bg-secondary/60 dark:bg-[#252320]">
      <div className="mx-auto max-w-3xl px-5 py-24 text-center sm:px-8 sm:py-32">
        <Reveal>
          <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-5xl">
            Chega de ficar na dúvida sobre quem deve o quê.
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-base text-muted-foreground sm:text-lg">
            Comece grátis em menos de um minuto. Sem cartão, sem fricção.
          </p>
          <Link
            to="/app"
            className="mt-9 inline-flex items-center justify-center rounded-full bg-[var(--color-positive)] px-7 py-3.5 text-sm font-medium text-[var(--color-positive-foreground)] shadow-luxe transition-transform hover:scale-[1.02]"
          >
            Criar conta grátis
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
