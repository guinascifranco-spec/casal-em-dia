import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getMyCouple, getMyInvite } from "@/lib/couple.functions";
import { listPeriods } from "@/lib/period.functions";
import { listExpenses } from "@/lib/expenses.functions";
import { Verdict } from "@/components/Verdict";
import { ExpenseList } from "@/components/ExpenseList";
import { ExpenseFormSheet } from "@/components/ExpenseFormSheet";
import { OnboardingScreen } from "@/components/OnboardingScreen";
import { PeriodSwitcher } from "@/components/PeriodSwitcher";
import { ThemeToggle } from "@/components/ThemeToggle";
import { InstallPrompt } from "@/components/InstallPrompt";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { CalendarPlus, Copy, LogOut, Plus } from "lucide-react";
import { toast } from "sonner";
import { CreatePeriodSheet } from "@/components/CreatePeriodSheet";

const ACTIVE_PERIOD_KEY = "casal-em-dia.activePeriodId";

function useActivePeriod() {
  const [activeId, setActiveIdState] = useState<string | null>(() => {
    try {
      return localStorage.getItem(ACTIVE_PERIOD_KEY);
    } catch {
      return null;
    }
  });
  const setActiveId = (id: string) => {
    setActiveIdState(id);
    try {
      localStorage.setItem(ACTIVE_PERIOD_KEY, id);
    } catch {}
  };
  return { activeId, setActiveId };
}

export function Dashboard() {
  const { activeId, setActiveId } = useActivePeriod();

  const coupleFn = useServerFn(getMyCouple);
  const inviteFn = useServerFn(getMyInvite);
  const periodsFn = useServerFn(listPeriods);
  const expensesFn = useServerFn(listExpenses);

  const [createPeriodOpen, setCreatePeriodOpen] = useState(false);

  // ── Couple (permanent) ──────────────────────────────────────────────────
  const coupleQ = useQuery({
    queryKey: ["couple"],
    queryFn: () => coupleFn(),
  });

  const hasCouple = coupleQ.data?.hasCouple === true;
  const coupleId = hasCouple ? coupleQ.data!.coupleId : null;
  const members: Array<{ display_name: string; user_id: string }> = hasCouple ? (coupleQ.data!.members ?? []) : [];
  const myUserId: string = hasCouple ? (coupleQ.data!.myUserId ?? "") : "";
  const memberNames = members.map((m) => m.display_name).join(" & ");
  const groupLabel = (hasCouple && coupleQ.data!.coupleName) || memberNames || "Casal";

  // ── Invite (shown only while partner hasn't joined) ─────────────────────
  const inviteQ = useQuery({
    queryKey: ["invite"],
    queryFn: () => inviteFn(),
    enabled: hasCouple,
  });

  // ── Periods ─────────────────────────────────────────────────────────────
  const periodsQ = useQuery({
    queryKey: ["periods", coupleId],
    queryFn: () => periodsFn({ data: { coupleId: coupleId! } }),
    enabled: !!coupleId,
  });

  const periods = periodsQ.data ?? [];

  // Resolve active period: stored id if still valid, otherwise most recent
  const resolvedPeriodId = useMemo(() => {
    if (periods.length === 0) return null;
    if (activeId && periods.some((p) => p.id === activeId)) return activeId;
    return periods[0].id;
  }, [activeId, periods]);

  useEffect(() => {
    if (resolvedPeriodId && resolvedPeriodId !== activeId) setActiveId(resolvedPeriodId);
  }, [resolvedPeriodId, activeId, setActiveId]);

  // ── Expenses for the active period ─────────────────────────────────────
  const expQ = useQuery({
    queryKey: ["expenses", resolvedPeriodId],
    queryFn: () => expensesFn({ data: { periodId: resolvedPeriodId! } }),
    enabled: !!resolvedPeriodId,
  });

  // ── Loading / Onboarding ────────────────────────────────────────────────
  if (coupleQ.isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-sm text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  if (!hasCouple) {
    return <OnboardingScreen />;
  }

  const activePeriod = periods.find((p) => p.id === resolvedPeriodId);

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur-xl">
        <div className="mx-auto grid max-w-3xl grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-5 py-3 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <Logo size="sm" orientation="horizontal" showLabel={false} />
            <div className="min-w-0">
              <p className="truncate font-display text-sm font-semibold tracking-tight text-foreground">
                {groupLabel}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {activePeriod ? activePeriod.name : "Sem período ativo"}
              </p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <div className="hidden sm:block">
              <InstallPrompt />
            </div>
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              aria-label="Sair"
              onClick={() => supabase.auth.signOut()}
            >
              <LogOut size={16} />
            </Button>
          </div>
        </div>

        {coupleId && (
          <div className="mx-auto grid max-w-3xl grid-cols-[minmax(0,1fr)_auto] items-center gap-2 px-5 pb-3 sm:px-6">
            <PeriodSwitcher
              coupleId={coupleId}
              periods={periods}
              activeId={resolvedPeriodId}
              onSelect={setActiveId}
            />
            <Button
              variant="outline"
              size="sm"
              className="h-11 shrink-0 gap-1.5"
              onClick={() => setCreatePeriodOpen(true)}
            >
              <CalendarPlus size={15} />
              <span className="hidden sm:inline">Novo período</span>
            </Button>
          </div>
        )}
      </header>

      <main className="mx-auto max-w-3xl space-y-7 px-5 py-8 pb-32 sm:px-6 sm:py-10">
        <div>
          <p className="eyebrow">Painel do casal</p>
          <h1 className="mt-2 font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Olá, {memberNames || "casal"}
          </h1>
        </div>

        {/* Invite banner — only while partner hasn't joined */}
        {inviteQ.data && (
          <div className="card-luxe grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-5 py-4">
            <div className="min-w-0">
              <p className="eyebrow">Convite pendente</p>
              <p className="money mt-1.5 text-2xl tracking-[0.2em] text-primary">
                {inviteQ.data.code}
              </p>
              <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                Compartilhe este código <strong>uma única vez</strong> com seu parceiro. Depois
                disso, ambos criam períodos livremente.
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="shrink-0"
              onClick={() => {
                navigator.clipboard.writeText(inviteQ.data!.code);
                toast.success("Código copiado");
              }}
            >
              <Copy size={15} /> Copiar
            </Button>
          </div>
        )}

        {/* No periods yet */}
        {periods.length === 0 && !periodsQ.isLoading && (
          <div className="card-luxe flex flex-col items-center gap-4 px-6 py-14 text-center">
            <div className="relative">
              <span aria-hidden className="absolute inset-0 rounded-2xl bg-primary/20 blur-xl" />
              <span className="relative grid h-14 w-14 place-items-center rounded-2xl border border-border bg-surface text-primary">
                <CalendarPlus size={24} strokeWidth={1.6} />
              </span>
            </div>
            <div>
              <p className="font-display text-lg tracking-tight text-foreground">
                Comece pelo primeiro período
              </p>
              <p className="mx-auto mt-1.5 max-w-xs text-sm text-muted-foreground">
                Organize os gastos por mês ou por viagem — como fizer mais sentido para vocês.
              </p>
            </div>
            {coupleId && (
              <Button variant="mint" onClick={() => setCreatePeriodOpen(true)}>
                <Plus size={16} /> Criar primeiro período
              </Button>
            )}
          </div>
        )}

        {resolvedPeriodId && (
          <>
            <Verdict members={members} expenses={expQ.data ?? []} myUserId={myUserId} />

            <section>
              <div className="mb-3 flex items-center justify-between gap-3">
                <h2 className="eyebrow">Lançamentos</h2>
                {expQ.data && expQ.data.length > 0 && (
                  <span className="text-xs text-muted-foreground">
                    {expQ.data.length} {expQ.data.length === 1 ? "registro" : "registros"}
                  </span>
                )}
              </div>
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
          </>
        )}
      </main>

      {resolvedPeriodId && (
        <ExpenseFormSheet
          periodId={resolvedPeriodId}
          members={members}
          myUserId={myUserId}
        />
      )}

      {coupleId && (
        <CreatePeriodSheet
          coupleId={coupleId}
          open={createPeriodOpen}
          onOpenChange={setCreatePeriodOpen}
          onCreated={(id) => setActiveId(id)}
        />
      )}
    </div>
  );
}
