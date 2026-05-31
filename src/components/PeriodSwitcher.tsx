import { useState } from "react";
import { Check, ChevronsUpDown, Plus, Trash2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { deletePeriod } from "@/lib/period.functions";
import { toast } from "sonner";
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

  const queryClient = useQueryClient();
  const deletePeriodFn = useServerFn(deletePeriod);

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await deletePeriodFn({ periodId: id });
    },
    onSuccess: (_, deletedId) => {
      toast.success("Período excluído com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["periods", coupleId] });
      queryClient.invalidateQueries({ queryKey: ["expenses", deletedId] });
      
      // If we deleted the active period, reset it to another one or empty
      if (activeId === deletedId) {
        const remaining = periods.filter((p) => p.id !== deletedId);
        if (remaining.length > 0) {
          onSelect(remaining[0].id);
        } else {
          // If no periods left, reload to trigger onboarding/creation states
          window.location.reload();
        }
      }
    },
    onError: (err: any) => {
      toast.error(err.message || "Erro ao excluir o período.");
    },
  });

  const handleDelete = (id: string, name: string) => {
    if (
      window.confirm(
        `Tem certeza que deseja excluir o período "${name}"? Todos os gastos cadastrados nele serão excluídos permanentemente.`
      )
    ) {
      deleteMutation.mutate(id);
    }
  };

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
              className="flex items-center justify-between gap-2 group/item cursor-pointer"
            >
              <span className="truncate">{p.name}</span>
              <div className="flex items-center gap-1.5 shrink-0">
                {p.id === activeId && <Check size={14} className="text-gold" />}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    handleDelete(p.id, p.name);
                  }}
                  className="p-1 rounded opacity-0 group-hover/item:opacity-100 hover:bg-destructive/15 text-muted-foreground hover:text-destructive transition-all"
                  title="Excluir período"
                >
                  <Trash2 size={13} />
                </button>
              </div>
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
