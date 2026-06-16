import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { Problem } from "@/components/landing/Problem";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { Features } from "@/components/landing/Features";
import { FinalCTA } from "@/components/landing/FinalCTA";
import { Footer } from "@/components/landing/Footer";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "caloteiros — finanças compartilhadas para casais" },
      {
        name: "description",
        content:
          "Casais com contas separadas finalmente sabem quem deve o quê — em tempo real. Sem segredo, sem briga.",
      },
      {
        property: "og:title",
        content: "caloteiros — finanças compartilhadas para casais",
      },
      {
        property: "og:description",
        content:
          "Casais com contas separadas finalmente sabem quem deve o quê — em tempo real.",
      },
    ],
  }),
  component: LandingPage,
});

function LandingPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <Navbar />
      <Hero />
      <Problem />
      <HowItWorks />
      <Features />
      <FinalCTA />
      <Footer />
    </main>
  );
}
