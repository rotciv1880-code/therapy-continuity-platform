import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { DemoProvider } from "./contexts/DemoContext";
import Home from "./pages/Home";
import TherapistDashboard from "./pages/TherapistDashboard";
import ClientDashboard from "./pages/ClientDashboard";
import Onboarding from "./pages/Onboarding";
import Subscription from "./pages/Subscription";
import AuditLog from "./pages/AuditLog";
import Demo from "./pages/Demo";
import DemoTherapistDashboard from "./pages/DemoTherapistDashboard";
import DemoClientDashboard from "./pages/DemoClientDashboard";

function Router() {
  return (
    <Switch>
      {/* Public landing page */}
      <Route path="/" component={Home} />

      {/* Demo routes — no auth required */}
      <Route path="/demo" component={Demo} />
      <Route path="/demo/dashboard" component={DemoTherapistDashboard} />
      <Route path="/demo/client" component={DemoClientDashboard} />

      {/* Onboarding — role selection and profile setup */}
      <Route path="/onboarding" component={Onboarding} />

      {/* Therapist dashboard */}
      <Route path="/dashboard" component={TherapistDashboard} />

      {/* Client engagement interface */}
      <Route path="/client" component={ClientDashboard} />

      {/* Subscription management */}
      <Route path="/subscription" component={Subscription} />

      {/* Audit log */}
      <Route path="/audit" component={AuditLog} />

      {/* Fallback */}
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <DemoProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </DemoProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
