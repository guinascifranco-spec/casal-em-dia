import { useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  getMyCoupleState,
  getMyInvite,
  listMyCouples,
} from "@/lib/couple.functions";
import { listExpenses } from "@/lib/expenses.functions";
import { Verdict } from "@/components/Verdict";
import { ExpenseList } from "@/components/ExpenseList";
import { ExpenseFormSheet } from "@/components/ExpenseFormSheet";
import { OnboardingScreen } from "@/components/OnboardingScreen";
import { GroupSwitcher } from "@/components/GroupSwitcher";
import { ThemeToggle } from "@/components/ThemeToggle";
import { InstallPrompt } from "@/components/InstallPrompt";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useActiveCouple } from "@/hooks/use-active-couple";
import { Copy, Heart, LogOut, Receipt } from "lucide-react";
import { toast } from "sonner";

export function Dashboard() {
  const { activeId, setActiveId } = useActiveCouple();
  const listFn = useServerFn(listMyCouples);
  const stateFn = useServerFn(getMyCoupleState);
  const inviteFn = useServerFn(getMyInvite);
  const expensesFn = useServerFn(listExpenses);

  const couplesQ = useQuery({
    queryKey: ["couples"],
    queryFn: () => listFn(),
  });

  // Resolve which couple to load
  const resolvedId = useMemo(() => {
    const list = couplesQ.data ?? [];
    if (list.length === 0) return null;
    if (activeId && list.some((c) => c.id === activeId)) return activeId;
    return list[0].id;
  }, [activeId, couplesQ.data]);

  // Keep storage in sync with resolved choice
  useEffect(() => {
    if (resolvedId && resolvedId !== activeId) setActiveId(resolvedId);
  }, [resolvedId, activeId, setActiveId]);

  const stateQ = useQuery({
    queryKey: ["couple-state", resolvedId],
    queryFn: () => stateFn({ data: { coupleId: resolvedId! } }),
    enabled: !!resolvedId,
  });

  const hasCouple = stateQ.data?.hasCouple === true;

  const inviteQ = useQuery({
    queryKey: ["invite", resolvedId],
    queryFn: () => inviteFn({ data: { coupleId: resolvedId! } }),
    enabled: hasCouple && !!resolvedId,
  });

  const expQ = useQuery({
    queryKey: ["expenses", resolvedId],
    queryFn: () => expensesFn({ data: { coupleId: resolvedId! } }),
    enabled: hasCouple && !!resolvedId,
  });

  if (couplesQ.isLoading || (resolvedId && stateQ.isLoading)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-sm text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  if ((couplesQ.data ?? []).length === 0 || !hasCouple) {
    return <OnboardingScreen />;
  }

  const data = stateQ.data!;
  const members = data.hasCouple ? data.members : [];
  const myUserId = data.hasCouple ? data.myUserId : "";
  const memberNames = members.map((m) => m.display_name).join(" & ");
  const groupLabel =
    (data.hasCouple && data.coupleName) || memberNames || "Grupo";

  const groups = couplesQ.data ?? [];

  return (
    <div className="min-h-screen bg-background lg:flex">
      {/* Sidebar (desktop) */}
      <aside className="sidebar-luxe hidden w-64 shrink-0 flex-col px-6 py-8 lg:flex">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-gold">caloteiros</p>
          <h2 className="font-display mt-3 text-xl text-foreground">{memberNames || "Casal"}</h2>
        </div>

        <div className="mt-6">
          <GroupSwitcher
            groups={groups}
            activeId={resolvedId}
            activeLabel={groupLabel}
            onSelect={setActiveId}
          />
        </div>

        <nav className="mt-8 flex flex-col gap-1">
          <a className="flex items-center gap-3 rounded-xl bg-secondary/60 px-3 py-2 text-sm font-medium text-foreground">
            <Heart size={18} className="text-rose" /> Painel
          </a>
          <a className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-muted-foreground hover:bg-secondary/40 hover:text-foreground">
            <Receipt size={18} className="text-rose" /> Lançamentos
          </a>
        </nav>

        <div className="mt-auto flex flex-col gap-2">
          <InstallPrompt />
          <div className="flex items-center justify-between">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => supabase.auth.signOut()}
            >
              <LogOut size={16} /> Sair
            </Button>
          </div>
        </div>
      </aside>

      <div className="flex-1">
        {/* Mobile header */}
        <header className="border-b border-[rgba(255,255,255,0.06)] lg:hidden">
          <div className="mx-auto flex max-w-2xl items-center justify-between gap-3 px-6 py-5">
            <div className="min-w-0 flex-1">
              <p className="text-[10px] uppercase tracking-[0.25em] text-gold">caloteiros</p>
              <h1 className="font-display truncate text-lg text-foreground">{groupLabel}</h1>
            </div>
            <ThemeToggle />
            <Button variant="ghost" size="sm" onClick={() => supabase.auth.signOut()}>
              <LogOut size={16} />
            </Button>
          </div>
          <div className="mx-auto max-w-2xl px-6 pb-4">
            <GroupSwitcher
              groups={groups}
              activeId={resolvedId}
              activeLabel={groupLabel}
              onSelect={setActiveId}
            />
          </div>
        </header>

        <main className="mx-auto max-w-2xl space-y-8 px-6 py-10 pb-32">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
                Bem-vindos
              </p>
              <h1 className="font-display mt-2 text-3xl text-foreground sm:text-4xl">
                Olá, {memberNames || "casal"} <span className="ml-1">👋</span>
              </h1>
            </div>
            <div className="hidden lg:block">
              <InstallPrompt />
            </div>
          </div>

          <Verdict members={members} expenses={expQ.data ?? []} myUserId={myUserId} />

          {inviteQ.data && (
            <div className="card-luxe flex items-center justify-between gap-4 px-5 py-4">
              <div className="min-w-0">
                <p className="text-[10px] uppercase tracking-[0.25em] text-gold">
                  Convite pendente
                </p>
                <p className="font-display tabular mt-1 text-2xl tracking-widest text-foreground">
                  {inviteQ.data.code}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Compartilhe esse código para o seu parceiro entrar.
                </p>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  navigator.clipboard.writeText(inviteQ.data!.code);
                  toast.success("Código copiado");
                }}
              >
                <Copy size={16} /> Copiar
              </Button>
            </div>
          )}

          <section>
            <h2 className="mb-3 text-[10px] uppercase tracking-[0.25em] text-gold">
              Lançamentos
            </h2>
            {expQ.isLoading ? (
              <p className="text-sm text-muted-foreground">Carregando...</p>
            ) : (
              <ExpenseList
                expenses={expQ.data ?? []}
                members={members}
                myUserId={myUserId}
              />
            )}
          </section>
        </main>
      </div>

      {members.length >= 2 && resolvedId && (
        <ExpenseFormSheet
          coupleId={resolvedId}
          members={members}
          myUserId={myUserId}
        />
      )}
    </div>
  );
}
