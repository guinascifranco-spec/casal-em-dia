import { Reveal } from "./Reveal";

const items = [
  "Quem pagou o aluguel esse mês?",
  "Quanto eu ainda te devo do mercado?",
  "A gente nunca sabe ao certo quem está no negativo",
];

export function Problem() {
  return (
    <section id="problema" className="border-t border-border/60">
      <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-28">
        <Reveal>
          <h2 className="max-w-2xl text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Você vive isso?
          </h2>
        </Reveal>
        <div className="mt-12 grid gap-5 sm:grid-cols-3">
          {items.map((text, i) => (
            <Reveal key={text} delay={i * 100}>
              <div className="card-luxe h-full p-7">
                <span className="text-sm font-medium tabular text-muted-foreground">
                  0{i + 1}
                </span>
                <p className="mt-4 text-lg leading-snug text-foreground">"{text}"</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
