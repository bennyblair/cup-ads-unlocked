import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route } from "react-router-dom";
import DocumentHead from "@/components/seo/DocumentHead";
import Index from "./pages/Index";
import About from "./pages/About";
import AdvertiserForm from "./pages/AdvertiserForm";
import CafeForm from "./pages/CafeForm";
import SavingsCalculator from "./pages/SavingsCalculator";
import NotFound from "./pages/NotFound";
import Locations from "./pages/Locations";
import AdminCafes from "./pages/AdminCafes";
import CaseStudiesIndex from "./pages/CaseStudiesIndex";
import BuyersAgentCaseStudy from "./pages/CaseStudies";
import EmetCapitalCaseStudy from "./pages/EmetCapitalCaseStudy";
import SeoGuidePage from "./pages/SeoGuidePage";
import KrakenCaseStudy from "./pages/KrakenCaseStudy";
import Contact from "./pages/Contact";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <DocumentHead />
      <Toaster />
      <Sonner />
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/about" element={<About />} />
        <Route path="/advertiser-form" element={<AdvertiserForm />} />
        <Route path="/cafe-form" element={<CafeForm />} />
        <Route path="/savings-calculator" element={<SavingsCalculator />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/case-studies/kraken" element={<KrakenCaseStudy />} />
        <Route path="/case-studies" element={<CaseStudiesIndex />} />
        <Route path="/case-studies/buyers-agent" element={<BuyersAgentCaseStudy />} />
        <Route path="/case-studies/emet-capital" element={<EmetCapitalCaseStudy />} />
        <Route path="/locations" element={<Locations />} />
        <Route path="/admin/cafes" element={<AdminCafes />} />
        <Route path="/coffee-cup-advertising-sydney" element={<SeoGuidePage slug="coffee-cup-advertising-sydney" />} />
        <Route path="/real-estate-agent-marketing-ideas" element={<SeoGuidePage slug="real-estate-agent-marketing-ideas" />} />
        <Route path="/branded-promotional-coffee-cups" element={<SeoGuidePage slug="branded-promotional-coffee-cups" />} />
        <Route path="/small-business-advertising-ideas" element={<SeoGuidePage slug="small-business-advertising-ideas" />} />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
