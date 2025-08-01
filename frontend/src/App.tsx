/**
 * TASKIFY MAIN APPLICATION COMPONENT
 * 
 * Root application component that configures the entire Taskify frontend application.
 * This component sets up the application architecture including routing, state management,
 * authentication, notifications, and UI provider contexts.
 * 
 * CORE ARCHITECTURE:
 * - React Router for client-side navigation and routing
 * - TanStack Query for server state management and caching
 * - Authentication context for user session management
 * - UI component providers for consistent theming and interactions
 * - Toast notification system for user feedback
 * 
 * PROVIDER HIERARCHY:
 * 1. QueryClientProvider - Server state and API caching
 * 2. AuthProvider - User authentication and session management
 * 3. TooltipProvider - UI tooltip system
 * 4. BrowserRouter - Client-side routing
 * 5. Toast/Notification providers - User feedback system
 * 
 * APPLICATION ROUTES:
 * - / - Landing page and application entry point
 * - /home - Dashboard and user home page
 * - /auth - Authentication (login/register) interface
 * - /profile - User profile management
 * - /features - Application features showcase
 * - /projects - Project management interface
 * - /projects/:projectId/tasks - Task management for specific project
 * - /reports - Analytics and reporting dashboard
 * - /* - 404 Not Found catch-all route
 * 
 * STATE MANAGEMENT:
 * - TanStack Query for server state, caching, and API management
 * - React Context for authentication and global application state
 * - Local component state for UI interactions
 * - URL state for routing and navigation
 * 
 * UI FEATURES:
 * - Dual toast notification system (UI Toaster + Sonner)
 * - Tooltip system for enhanced user experience
 * - Responsive design and mobile-friendly interface
 * - Consistent component library (shadcn/ui)
 * 
 * SECURITY:
 * - Authentication context for protected routes
 * - User session management and persistence
 * - Route protection and access control
 * 
 * PERFORMANCE:
 * - React Query caching for optimized API calls
 * - Lazy loading and code splitting support
 * - Optimized re-rendering through provider structure
 */

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Home from "./pages/Home";
import Projects from "./pages/Projects";
import ProjectTasks from "./pages/ProjectTasks";
import Reports from "./pages/Reports";
import NotFound from "./pages/NotFound";
import { Auth } from "./pages/Auth";
import { Profile } from "./pages/Profile";
import { Features } from "./pages/Features";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/home" element={<Home />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/features" element={<Features />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/projects/:projectId/tasks" element={<ProjectTasks />} />
            <Route path="/reports" element={<Reports />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
