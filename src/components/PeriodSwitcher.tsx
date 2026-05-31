import { useState } from "react";
import { Check, ChevronsUpDown, Plus } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { CreatePeriodSheet } from "@/components/CreatePeriodSheet";

type Period = { id: string; name: string };

export function PeriodSwitcher({
  coupleId,
  periods,
  activeId,
  onSelect,
}: {
  coupleId: string;
  periods: Period[];
  activeId: string | null;
  onSelect: (id: string) => void;
}) {
  const [createOpen, setCreateOpen] = useState(false);
  const activePeriod = periods.find((p) => p.id === activeId);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="h-auto w-full justify-between gap-2 rounded-xl border border-border bg-secondary/40 px-3 py-2 text-left"
          >
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-[0.25em] text-gold">Período ativo</p>
              <p className="truncate font-display text-sm text-foreground">
                {activePeriod?.name ?? "Nenhum período"}
              </p>
            </div>
            <ChevronsUpDown size={16} className="shrink-0 text-muted-foreground" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-64">
          {periods.length === 0 && (
            <div className="px-2 py-2 text-xs text-muted-foreground">Nenhum período ainda.</div>
          )}
          {periods.map((p) => (
            <DropdownMenuItem
              key={p.id}
              onSelect={() => onSelect(p.id)}
              className="flex items-center justify-between gap-2"
            >
              <span className="truncate">{p.name}</span>
              {p.id === activeId && <Check size={14} className="text-gold" />}
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={() => setCreateOpen(true)}>
            <Plus size={14} className="text-rose" /> Novo período
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <CreatePeriodSheet
        coupleId={coupleId}
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={(id) => onSelect(id)}
      />
    </>
  );
}
