import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import Admin from "@/pages/Admin";
import Alerts from "@/pages/Alerts";
import NotFound from "@/pages/NotFound";
import Onboarding from "@/pages/Onboarding";
import Profile from "@/pages/Profile";
import Reports from "@/pages/Reports";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Platform from "./pages/Platform";

function Router() { return <Switch><Route path="/" component={Home} /><Route path="/onboarding" component={Onboarding} /><Route path="/dashboard" component={Platform} /><Route path="/map" component={Platform} /><Route path="/reports" component={Reports} /><Route path="/alerts" component={Alerts} /><Route path="/operations" component={Platform} /><Route path="/analytics" component={Platform} /><Route path="/admin" component={Admin} /><Route path="/profile" component={Profile} /><Route path="/404" component={NotFound} /><Route component={NotFound} /></Switch>; }
export default function App() { return <ErrorBoundary><ThemeProvider defaultTheme="light"><TooltipProvider><Toaster position="top-right" richColors /><Router /></TooltipProvider></ThemeProvider></ErrorBoundary>; }
