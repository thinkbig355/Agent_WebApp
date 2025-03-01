// App.tsx
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navigation from "@/components/Navigation";  // Correct casing
import Home from "./pages/Home";               // Correct casing
import BrowserUse from "./pages/BrowserUse";     // Correct casing
import NotFound from "./pages/NotFound";         // Correct casing
import RagIndex from "./pages/rag/index";      // Correct casing (lowercase 'i')
import AddFiles from "./pages/rag/AddFiles";     // Correct casing
import Chat from "./pages/rag/Chat";           // Correct casing

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Navigation />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/rag" element={<RagIndex />} />
          <Route path="/rag/add-files" element={<AddFiles />} />
          <Route path="/rag/chat" element={<Chat />} />
          <Route path="/browser-use" element={<BrowserUse />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;