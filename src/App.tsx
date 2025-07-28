import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ChampionsProvider } from "@/contexts/ChampionsContext";
import Layout from "@/components/Layout";
import Home from "./pages/Home";
import Groups from "./pages/Groups";
import Fixtures from "./pages/Fixtures";
import MatchHistory from "./pages/MatchHistory";
import Knockout from "./pages/Knockout";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ChampionsProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Layout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/groups" element={<Groups />} />
              <Route path="/fixtures" element={<Fixtures />} />
              <Route path="/knockout" element={<Knockout />} />
              <Route path="/history" element={<MatchHistory />} />
              <Route path="/admin" element={<Admin />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Layout>
        </BrowserRouter>
      </ChampionsProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
