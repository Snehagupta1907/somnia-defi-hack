import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";
import Landing from "@/pages/landing";
import Swap from "@/pages/swap";
import Pools from "@/pages/pools";
import Analytics from "@/pages/analytics";
import Docs from "@/pages/docs";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/swap" component={Swap} />
      <Route path="/pools" component={Pools} />
      <Route path="/analytics" component={Analytics} />
      <Route path="/docs" component={Docs} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen relative flex flex-col" style={{ backgroundColor: 'var(--color-light-gray)' }}>
          {/* Background Gradient Overlay */}
          <div className="fixed inset-0 gradient-bg opacity-3 pointer-events-none"></div>
          
          <Navigation />
          <main className="relative z-10 flex-1">
            <Router />
          </main>
          <Footer />
          <Toaster />
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
