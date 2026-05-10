import { createFileRoute } from "@tanstack/react-router";
import { useSession } from "@/hooks/use-session";
import { AuthScreen } from "@/components/AuthScreen";
import { Dashboard } from "@/components/Dashboard";
import { Toaster } from "@/components/ui/sonner";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const { session, loading } = useSession();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-sm text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  return (
    <>
      {session ? <Dashboard /> : <AuthScreen />}
      <Toaster richColors position="top-center" />
    </>
  );
}
