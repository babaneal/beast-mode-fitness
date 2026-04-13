import { Switch, Route, Router } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/lib/theme";
import Layout from "@/components/layout";
import Dashboard from "@/pages/dashboard";
import Workouts from "@/pages/workouts";
import LogWorkout from "@/pages/log-workout";
import PRTracker from "@/pages/pr-tracker";
import Meals from "@/pages/meals";
import Grocery from "@/pages/grocery";
import NotFound from "@/pages/not-found";

function AppRouter() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/workouts" component={Workouts} />
        <Route path="/log" component={LogWorkout} />
        <Route path="/prs" component={PRTracker} />
        <Route path="/meals" component={Meals} />
        <Route path="/grocery" component={Grocery} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ThemeProvider>
          <Toaster />
          <Router hook={useHashLocation}>
            <AppRouter />
          </Router>
        </ThemeProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
