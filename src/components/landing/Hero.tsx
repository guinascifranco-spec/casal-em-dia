import { Link } from "@tanstack/react-router";
import { ArrowDown } from "lucide-react";
import { AppMockup } from "./AppMockup";
import { Reveal } from "./Reveal";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 py-16 sm:px-8 sm:py-24 md:grid-cols-2 md:gap-16 md:py-32">
        <Reveal>
          <div>
            <span className="inline-flex items-center rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground">
              Para casais com contas separadas
            </span>
            <h1 className="mt-5 text-4xl font-semibold leading-[1.05] tracking-tight text-foreground sm:text-5xl md:text-6xl">
              Finanças compartilhadas.
              <br />
              <span className="text-muted-foreground">Sem segredo, sem briga.</span>
            </h1>
            <p className="mt-6 max-w-lg text-base leading-relaxed text-muted-foreground sm:text-lg">
              Casais com contas separadas finalmente sabem quem deve o quê — em tempo real.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                to="/app"
                className="inline-flex items-center justify-center rounded-full bg-[var(--color-positive)] px-6 py-3 text-sm font-medium text-[var(--color-positive-foreground)] shadow-luxe transition-transform hover:scale-[1.02]"
              >
                Começar grátis
              </Link>
              <a
                href="#como-funciona"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground/80 transition-colors hover:text-foreground"
              >
                Ver como funciona
                <ArrowDown size={14} />
              </a>
            </div>
          </div>
        </Reveal>
        <Reveal delay={150}>
          <AppMockup />
        </Reveal>
      </div>
    </section>
  );
}
