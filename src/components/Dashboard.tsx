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
import { Copy } from "lucide-react";
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
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  if (!hasCouple) return <OnboardingScreen />;

  const data = stateQ.data!;
  const members = data.hasCouple ? data.members : [];
  const myUserId = data.hasCouple ? data.myUserId : "";

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-6 py-5">
          <h1 className="text-lg font-semibold tracking-tight">caloteiros</h1>
          <Button variant="ghost" size="sm" onClick={() => supabase.auth.signOut()}>
            Sair
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-2xl space-y-8 px-6 py-10 pb-32">
        <Verdict members={members} expenses={expQ.data ?? []} myUserId={myUserId} />

        {inviteQ.data && (
          <div className="flex items-center justify-between rounded-xl border border-dashed border-border bg-card px-5 py-4">
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground">Convite pendente</p>
              <p className="tabular mt-1 text-lg font-semibold tracking-widest">{inviteQ.data.code}</p>
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
              <Copy className="mr-2 h-4 w-4" /> Copiar
            </Button>
          </div>
        )}

        <section>
          <h2 className="mb-3 text-xs uppercase tracking-widest text-muted-foreground">
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

      {members.length >= 2 && <ExpenseFormSheet members={members} myUserId={myUserId} />}
    </div>
  );
}
