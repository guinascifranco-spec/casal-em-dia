import { Logo } from "@/components/Logo";

export function Footer() {
  return (
    <footer className="border-t border-border/60">
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-4 px-5 py-10 sm:flex-row sm:items-center sm:px-8">
        <div className="flex items-center gap-3">
          <Logo size="sm" />
          <p className="text-xs text-muted-foreground">
            Finanças compartilhadas para casais adultos.
          </p>
        </div>
        <div className="flex items-center gap-5 text-xs text-muted-foreground">
          <a href="#" className="transition-colors hover:text-foreground">
            Privacidade
          </a>
          <span>© {new Date().getFullYear()} caloteiros</span>
        </div>
      </div>
    </footer>
  );
}
