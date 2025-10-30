import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "@/components/Navbar";
import ChatBot from "@/components/ChatBot";
import Landing from "@/pages/Landing";
import Upload from "@/pages/Upload";
import Results from "@/pages/Results";
import Actions from "@/pages/Actions";
import Reference from "@/pages/Reference";
import About from "@/pages/About";
import NotFound from "@/pages/NotFound";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import History from '@/pages/History';
import SavedFiles from '@/pages/SavedFiles';


const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Navbar />
        <ChatBot />
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/history" element={<History />} />
          <Route path="/upload" element={<Upload />} />
          <Route path="/files" element={<SavedFiles />} />
          <Route path="/results/:jobId" element={<Results />} />
          <Route path="/actions" element={<Actions />} />
          <Route path="/reference" element={<Reference />} />
          <Route path="/about" element={<About />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
