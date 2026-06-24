import { AppProviders } from "@/app/providers/AppProviders";
import { AppRoutes } from "@/app/router";
import { Layout } from "@/widgets/layout";
import { ErrorBoundary } from "@/components/shared/ErrorBoundary";
import { OnboardingTour } from "@/features/onboarding";
import { CopyToastProvider } from "@/features/copy-toast";
import { DailyCheckIn } from "@/features/promo";
import { CornerPromo } from "@/features/promo";
import { QueueProvider, useQueue } from "@/features/generation-queue";
import { GlobalStatusBar } from "@/features/generation-queue/ui";
import { useNavigate } from "@/shared/routing";

function AppShell() {
  const { state } = useQueue();
  const navigate = useNavigate();

  return (
    <>
      <Layout>
        <ErrorBoundary>
          <AppRoutes />
        </ErrorBoundary>
      </Layout>
      <OnboardingTour />
      <CopyToastProvider />
      <DailyCheckIn />
      <CornerPromo />
      <GlobalStatusBar tasks={state.tasks} onNavigate={() => navigate({ to: "/queue" })} />
    </>
  );
}

export default function App() {
  return (
    <AppProviders>
      <QueueProvider>
        <AppShell />
      </QueueProvider>
    </AppProviders>
  );
}
