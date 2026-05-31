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
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Copy, Heart, LogOut, Receipt } from "lucide-react";
import { toast } from "sonner";

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

  // ── Couple (permanent) ──────────────────────────────────────────────────
  const coupleQ = useQuery({
    queryKey: ["couple"],
    queryFn: () => coupleFn(),
  });

  const hasCouple = coupleQ.data?.hasCouple === true;
  const coupleId = hasCouple ? coupleQ.data!.coupleId : null;
  const members = hasCouple ? coupleQ.data!.members : [];
  const myUserId = hasCouple ? coupleQ.data!.myUserId : "";
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
    <div className="min-h-screen bg-background lg:flex">
      {/* Sidebar (desktop) */}
      <aside className="sidebar-luxe hidden w-64 shrink-0 flex-col px-6 py-8 lg:flex">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-gold">casal em dia</p>
          <h2 className="font-display mt-3 text-xl text-foreground">{groupLabel}</h2>
        </div>

        <div className="mt-6">
          {coupleId && (
            <PeriodSwitcher
              coupleId={coupleId}
              periods={periods}
              activeId={resolvedPeriodId}
              onSelect={setActiveId}
            />
          )}
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
        <header className="border-b border-border lg:hidden">
          <div className="mx-auto flex max-w-2xl items-center justify-between gap-3 px-6 py-5">
            <div className="min-w-0 flex-1">
              <p className="text-[10px] uppercase tracking-[0.25em] text-gold">casal em dia</p>
              <h1 className="font-display truncate text-lg text-foreground">{groupLabel}</h1>
            </div>
            <ThemeToggle />
            <Button variant="ghost" size="sm" onClick={() => supabase.auth.signOut()}>
              <LogOut size={16} />
            </Button>
          </div>
          {coupleId && (
            <div className="mx-auto max-w-2xl px-6 pb-4">
              <PeriodSwitcher
                coupleId={coupleId}
                periods={periods}
                activeId={resolvedPeriodId}
                onSelect={setActiveId}
              />
            </div>
          )}
        </header>

        <main className="mx-auto max-w-2xl space-y-8 px-6 py-10 pb-32">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
                {activePeriod ? activePeriod.name : "Bem-vindos"}
              </p>
              <h1 className="font-display mt-2 text-3xl text-foreground sm:text-4xl">
                Olá, {memberNames || "casal"} <span className="ml-1">👋</span>
              </h1>
            </div>
            <div className="hidden lg:block">
              <InstallPrompt />
            </div>
          </div>

          {/* Invite banner — only while partner hasn't joined */}
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
                  Compartilhe este código <strong>uma única vez</strong> com seu parceiro. Depois
                  disso, ambos criam períodos livremente.
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

          {/* No periods yet */}
          {periods.length === 0 && !periodsQ.isLoading && (
            <div className="card-luxe p-8 text-center">
              <p className="text-sm text-muted-foreground">
                Nenhum período criado ainda.{" "}
                <span className="font-medium text-gold">
                  Use o seletor acima para criar o primeiro período (ex.: Junho 2026).
                </span>
              </p>
            </div>
          )}

          {resolvedPeriodId && (
            <>
              <Verdict members={members} expenses={expQ.data ?? []} myUserId={myUserId} />

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
            </>
          )}
        </main>
      </div>

      {resolvedPeriodId && (
        <ExpenseFormSheet
          periodId={resolvedPeriodId}
          members={members}
          myUserId={myUserId}
        />
      )}
    </div>
  );
}
