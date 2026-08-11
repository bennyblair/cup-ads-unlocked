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
import SavingsCalculator from "./pages/SavingsCalculator";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();
const Locations = lazy(() => import("./pages/Locations"));
const AdminCafes = lazy(() => import("./pages/AdminCafes"));
const CaseStudiesIndex = lazy(() => import("./pages/CaseStudiesIndex"));
const BuyersAgentCaseStudy = lazy(() => import("./pages/CaseStudies"));
const EmetCapitalCaseStudy = lazy(() => import("./pages/EmetCapitalCaseStudy"));

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/about" element={<About />} />
          <Route path="/advertiser-form" element={<AdvertiserForm />} />
          <Route path="/cafe-form" element={<CafeForm />} />
          <Route path="/savings-calculator" element={<SavingsCalculator />} />
          <Route
            path="/case-studies"
            element={
              <Suspense
                fallback={
                  <div className="flex min-h-screen items-center justify-center text-primary">
                    Loading case studies…
                  </div>
                }
              >
                <CaseStudiesIndex />
              </Suspense>
            }
          />
          <Route
            path="/case-studies/buyers-agent"
            element={
              <Suspense
                fallback={
                  <div className="flex min-h-screen items-center justify-center text-primary">
                    Loading case study…
                  </div>
                }
              >
                <BuyersAgentCaseStudy />
              </Suspense>
            }
          />
          <Route
            path="/case-studies/emet-capital"
            element={
              <Suspense
                fallback={
                  <div className="flex min-h-screen items-center justify-center text-primary">
                    Loading case study…
                  </div>
                }
              >
                <EmetCapitalCaseStudy />
              </Suspense>
            }
          />
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
