export const brl = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export function formatBRL(value: number): string {
  return brl.format(value);
}

export function parseBRLInput(input: string): number {
  // accept "12,34" or "12.34" or "1.234,56"
  const cleaned = input.replace(/\s|R\$/g, "").replace(/\./g, "").replace(",", ".");
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : 0;
}

export function relativeDatePtBR(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const min = Math.round(diffMs / 60000);
  if (min < 1) return "agora";
  if (min < 60) return `${min} min atrás`;
  const h = Math.round(min / 60);
  if (h < 24) return `${h} h atrás`;
  const days = Math.round(h / 24);
  if (days < 7) return `${days} d atrás`;
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}
