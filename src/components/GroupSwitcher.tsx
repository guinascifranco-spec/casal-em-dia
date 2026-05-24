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
import { CreateGroupSheet } from "@/components/CreateGroupSheet";

type Group = { id: string; name: string | null };

export function GroupSwitcher({
  groups,
  activeId,
  activeLabel,
  onSelect,
}: {
  groups: Group[];
  activeId: string | null;
  activeLabel: string;
  onSelect: (id: string) => void;
}) {
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="h-auto w-full justify-between gap-2 rounded-xl border border-[rgba(255,255,255,0.06)] bg-secondary/40 px-3 py-2 text-left"
          >
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-[0.25em] text-gold">Grupo ativo</p>
              <p className="truncate font-display text-sm text-foreground">{activeLabel}</p>
            </div>
            <ChevronsUpDown size={16} className="shrink-0 text-muted-foreground" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-64">
          {groups.length === 0 && (
            <div className="px-2 py-2 text-xs text-muted-foreground">Nenhum grupo ainda.</div>
          )}
          {groups.map((g) => (
            <DropdownMenuItem
              key={g.id}
              onSelect={() => onSelect(g.id)}
              className="flex items-center justify-between gap-2"
            >
              <span className="truncate">{g.name || "Sem nome"}</span>
              {g.id === activeId && <Check size={14} className="text-gold" />}
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={() => setCreateOpen(true)}>
            <Plus size={14} className="text-rose" /> Novo grupo
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <CreateGroupSheet
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={(id) => onSelect(id)}
      />
    </>
  );
}
