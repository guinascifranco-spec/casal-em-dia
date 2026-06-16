export function Footer() {
  return (
    <footer className="border-t border-border/60">
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-4 px-5 py-10 sm:flex-row sm:items-center sm:px-8">
        <div>
          <p className="text-base font-semibold lowercase text-foreground">caloteiros</p>
          <p className="mt-1 text-xs text-muted-foreground">
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
