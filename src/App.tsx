import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import Index from "./pages/Index";
import About from "./pages/About";
import AdvertiserForm from "./pages/AdvertiserForm";
import CafeForm from "./pages/CafeForm";
import Contact from "./pages/Contact";
import HowItWorks from "./pages/HowItWorks";
import SavingsCalculator from "./pages/SavingsCalculator";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();
const Locations = lazy(() => import("./pages/Locations"));
const AdminCafes = lazy(() => import("./pages/AdminCafes"));

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/about" element={<About />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/advertiser-form" element={<AdvertiserForm />} />
          <Route path="/cafe-form" element={<CafeForm />} />
          <Route path="/savings-calculator" element={<SavingsCalculator />} />
          <Route
            path="/locations"
            element={
              <Suspense
                fallback={
                  <div className="flex min-h-screen items-center justify-center text-primary">
                    Loading locations…
                  </div>
                }
              >
                <Locations />
              </Suspense>
            }
          />
          <Route
            path="/admin/cafes"
            element={
              <Suspense
                fallback={
                  <div className="flex min-h-screen items-center justify-center text-primary">
                    Loading café approvals…
                  </div>
                }
              >
                <AdminCafes />
              </Suspense>
            }
          />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
