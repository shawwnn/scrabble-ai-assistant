import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import AppShell from "./components/AppShell";
import Index from "./pages/Index";
import NewGame from "./pages/NewGame";
import OngoingGames from "./pages/OngoingGames";
import Game from "./pages/Game";
import History from "./pages/History";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import AnalyzerLayout from "./components/analyzer/AnalyzerLayout";
import AnalyzerHome from "./pages/AnalyzerHome";
import AnalyzerUpload from "./pages/AnalyzerUpload";
import AnalyzerProcessing from "./pages/AnalyzerProcessing";
import AnalyzerResults from "./pages/AnalyzerResults";
import AnalyzerError from "./pages/AnalyzerError";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/analyzer" element={<AnalyzerLayout />}>
            <Route index element={<AnalyzerHome />} />
            <Route path="upload" element={<AnalyzerUpload />} />
            <Route path="processing" element={<AnalyzerProcessing />} />
            <Route path="results" element={<AnalyzerResults />} />
            <Route path="error" element={<AnalyzerError />} />
          </Route>
          <Route element={<AppShell />}>
            <Route path="/" element={<Index />} />
            <Route path="/new-game" element={<NewGame />} />
            <Route path="/games" element={<OngoingGames />} />
            <Route path="/games/:gameId" element={<Game />} />
            <Route path="/history" element={<History />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
