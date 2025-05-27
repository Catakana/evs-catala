import React from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import AppLayout from "@/components/layout/AppLayout";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AgendaPage from "./pages/AgendaPage";
import PermanencesPage from "./pages/PermanencesPage";
import TrombinoscopePage from "./pages/TrombinoscopePage";
import AnnouncementsPage from "./pages/AnnouncementsPage";
import ProjectsPage from './pages/ProjectsPage';
import MessagesPage from './pages/MessagesPage';
import InfosPage from './pages/InfosPage';
import NotesPage from './pages/NotesPage';
import { VotesPage } from './pages/VotesPage';
import { VoteDetailPage } from './pages/VoteDetailPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import ProfilePage from './pages/ProfilePage';
import EmailVerificationPage from '@/components/auth/EmailVerificationPage';
import TestPage from '@/pages/TestPage';
import ComponentsShowcasePage from '@/pages/test/ComponentsShowcasePage';
import NavTestPage from '@/pages/test/NavTestPage';
import MigrationTest from '@/pages/test/MigrationTest';
import EventsMigrationTest from '@/pages/test/EventsMigrationTest';
import ProfileMigrationTest from '@/pages/test/ProfileMigrationTest';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Dashboard from '@/pages/Dashboard';
import SupabaseDebugTest from '@/pages/test/SupabaseDebugTest';
import AuthDebugPage from '@/pages/test/AuthDebugPage';
import ServicesTestPage from '@/pages/test/ServicesTestPage';
import PublicDisplayPage from '@/pages/PublicDisplayPage';

const queryClient = new QueryClient();

// Pages qui nécessitent un layout personnalisé sans la barre de navigation
const authPages = ['/login', '/register', '/forgot-password', '/reset-password', '/verify-email'];

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Routes avec layout d'authentification (sans barre de navigation) */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route path="/verify-email" element={<EmailVerificationPage />} />
              
              {/* Page d'affichage public (plein écran, sans layout) */}
              <Route path="/public-display" element={<PublicDisplayPage />} />
              
              {/* Routes avec layout principal incluant la barre de navigation */}
              <Route
                path="/"
                element={
                  <AppLayout>
                    <Index />
                  </AppLayout>
                }
              />
              <Route
                path="/agenda"
                element={
                  <AppLayout>
                    <AgendaPage />
                  </AppLayout>
                }
              />
              <Route
                path="/permanences"
                element={
                  <AppLayout>
                    <PermanencesPage />
                  </AppLayout>
                }
              />
              <Route
                path="/trombinoscope"
                element={
                  <AppLayout>
                    <TrombinoscopePage />
                  </AppLayout>
                }
              />
              <Route
                path="/announcements"
                element={
                  <AppLayout>
                    <AnnouncementsPage />
                  </AppLayout>
                }
              />
              <Route
                path="/projects"
                element={
                  <AppLayout>
                    <ProjectsPage />
                  </AppLayout>
                }
              />
              <Route
                path="/messages"
                element={
                  <AppLayout>
                    <MessagesPage />
                  </AppLayout>
                }
              />
              <Route
                path="/notes"
                element={
                  <AppLayout>
                    <NotesPage />
                  </AppLayout>
                }
              />
              <Route
                path="/votes"
                element={
                  <AppLayout>
                    <VotesPage />
                  </AppLayout>
                }
              />
              <Route
                path="/votes/:id"
                element={
                  <AppLayout>
                    <VoteDetailPage />
                  </AppLayout>
                }
              />
              <Route
                path="/infos"
                element={
                  <AppLayout>
                    <InfosPage />
                  </AppLayout>
                }
              />
              <Route
                path="/profile"
                element={
                  <AppLayout>
                    <ProfilePage />
                  </AppLayout>
                }
              />
              <Route
                path="/test"
                element={
                  <AppLayout>
                    <TestPage />
                  </AppLayout>
                }
              />
              <Route path="/test/components" element={<ComponentsShowcasePage />} />
              <Route path="/test/nav" element={<NavTestPage />} />
              <Route path="/test/migration" element={<MigrationTest />} />
              <Route path="/test/events-migration" element={<EventsMigrationTest />} />
              <Route path="/test/profiles-migration" element={<ProfileMigrationTest />} />
              <Route path="/test/supabase" element={<SupabaseDebugTest />} />
              <Route path="/test/auth-debug" element={<AuthDebugPage />} />
              <Route path="/test/services" element={<ServicesTestPage />} />
              
              {/* Routes protégées (utilisateurs connectés) */}
              <Route element={<ProtectedRoute />}>
                <Route path="/dashboard" element={<Dashboard />} />
              </Route>
              
              {/* Page 404 - toujours avec layout */}
              <Route
                path="*"
                element={
                  <AppLayout>
                    <NotFound />
                  </AppLayout>
                }
              />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
