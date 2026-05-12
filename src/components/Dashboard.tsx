import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getMyCoupleState, getMyInvite } from "@/lib/couple.functions";
import { listExpenses } from "@/lib/expenses.functions";
import { Verdict } from "@/components/Verdict";
import { ExpenseList } from "@/components/ExpenseList";
import { ExpenseFormSheet } from "@/components/ExpenseFormSheet";
import { OnboardingScreen } from "@/components/OnboardingScreen";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Copy, Heart, LogOut, Receipt } from "lucide-react";
import { toast } from "sonner";

export function Dashboard() {
  const stateFn = useServerFn(getMyCoupleState);
  const inviteFn = useServerFn(getMyInvite);
  const expensesFn = useServerFn(listExpenses);

  const stateQ = useQuery({
    queryKey: ["couple-state"],
    queryFn: () => stateFn(),
  });

  const hasCouple = stateQ.data?.hasCouple === true;

  const inviteQ = useQuery({
    queryKey: ["invite"],
    queryFn: () => inviteFn(),
    enabled: hasCouple,
  });

  const expQ = useQuery({
    queryKey: ["expenses"],
    queryFn: () => expensesFn(),
    enabled: hasCouple,
  });

  if (stateQ.isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-sm text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  if (!hasCouple) return <OnboardingScreen />;

  const data = stateQ.data!;
  const members = data.hasCouple ? data.members : [];
  const myUserId = data.hasCouple ? data.myUserId : "";
  const coupleName = members.map((m) => m.display_name).join(" & ");

  return (
    <div className="min-h-screen bg-background lg:flex">
      {/* Sidebar (desktop) */}
      <aside className="sidebar-luxe hidden w-64 shrink-0 flex-col px-6 py-8 lg:flex">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-gold">caloteiros</p>
          <h2 className="font-display mt-3 text-xl text-foreground">
            {coupleName || "Casal"}
          </h2>
        </div>

        <nav className="mt-10 flex flex-col gap-1">
          <a className="flex items-center gap-3 rounded-xl bg-secondary/60 px-3 py-2 text-sm font-medium text-foreground">
            <Heart size={18} className="text-rose" /> Painel
          </a>
          <a className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-muted-foreground hover:bg-secondary/40 hover:text-foreground">
            <Receipt size={18} className="text-rose" /> Lançamentos
          </a>
        </nav>

        <div className="mt-auto">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start"
            onClick={() => supabase.auth.signOut()}
          >
            <LogOut size={16} /> Sair
          </Button>
        </div>
      </aside>

      <div className="flex-1">
        {/* Mobile header */}
        <header className="border-b border-[rgba(255,255,255,0.06)] lg:hidden">
          <div className="mx-auto flex max-w-2xl items-center justify-between px-6 py-5">
            <div>
              <p className="text-[10px] uppercase tracking-[0.25em] text-gold">caloteiros</p>
              <h1 className="font-display text-lg text-foreground">{coupleName || "Casal"}</h1>
            </div>
            <Button variant="ghost" size="sm" onClick={() => supabase.auth.signOut()}>
              <LogOut size={16} />
            </Button>
          </div>
        </header>

        <main className="mx-auto max-w-2xl space-y-8 px-6 py-10 pb-32">
          {/* Saudação */}
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
              Bem-vindos
            </p>
            <h1 className="font-display mt-2 text-3xl text-foreground sm:text-4xl">
              Olá, {coupleName || "casal"} <span className="ml-1">👋</span>
            </h1>
          </div>

          <Verdict members={members} expenses={expQ.data ?? []} myUserId={myUserId} />

          {inviteQ.data && (
            <div className="card-luxe flex items-center justify-between px-5 py-4">
              <div>
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

      {members.length >= 2 && <ExpenseFormSheet members={members} myUserId={myUserId} />}
    </div>
  );
}
