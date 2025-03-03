// App.tsx
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navigation from "@/components/Navigation";  
import Home from "./pages/Home";               
import BrowserUse from "./pages/BrowserUse";     
import NotFound from "./pages/NotFound";         
import RagIndex from "./pages/rag/index";      
import AddFiles from "./pages/rag/AddFiles";     
import Chat from "./pages/rag/Chat";           
import ScrollToTop from './components/ScrollToTop'; // Import the ScrollToTop component

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Navigation />
        <ScrollToTop> 
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/rag" element={<RagIndex />} />
            <Route path="/rag/add-files" element={<AddFiles />} />
            <Route path="/rag/chat" element={<Chat />} />
            <Route path="/browser-use" element={<BrowserUse />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </ScrollToTop>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
