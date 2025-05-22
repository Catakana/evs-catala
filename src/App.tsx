import React from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AgendaPage from "./pages/AgendaPage";
import PermanencesPage from "./pages/PermanencesPage";
import TrombinoscopePage from "./pages/TrombinoscopePage";
import AnnouncementsPage from "./pages/AnnouncementsPage";
import VotesPage from './pages/VotesPage';
import ProjectsPage from './pages/ProjectsPage';
import MessagesPage from './pages/MessagesPage';
import InfosPage from './pages/InfosPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import ProfilePage from './pages/ProfilePage';

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/agenda" element={<AgendaPage />} />
          <Route path="/permanences" element={<PermanencesPage />} />
          <Route path="/trombinoscope" element={<TrombinoscopePage />} />
          <Route path="/announcements" element={<AnnouncementsPage />} />
          <Route path="/votes" element={<VotesPage />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/messages" element={<MessagesPage />} />
          <Route path="/infos" element={<InfosPage />} />
          
          {/* Routes d'authentification */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
