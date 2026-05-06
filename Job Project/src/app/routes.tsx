import { createBrowserRouter, Navigate } from "react-router";
import type { ReactNode } from "react";
import { Layout } from "./components/Layout";
import { Home } from "./components/Home";
import { StudentDashboard } from "./components/StudentDashboard";
import { EmployerDashboard } from "./components/EmployerDashboard";
import { AdminConsole } from "./components/AdminConsole";
import { Pricing } from "./components/Pricing";
import { SuccessStories } from "./components/SuccessStories";
import { PrivacyPolicy } from "./components/PrivacyPolicy";
import { TermsOfService } from "./components/TermsOfService";
import { HelpCenter } from "./components/HelpCenter";
import { ContactAdmin } from "./components/ContactAdmin";
import { Login, SignUp } from "./components/Auth";
import { Profile } from "./components/Profile";
import { MyApplications } from "./components/MyApplications";
import { DevLogin } from "./components/DevLogin";
import { useAuth } from "./context/AuthContext";

function RequireAuth({ children, role }: { children: ReactNode; role?: string }) {
  const { user, isLoading } = useAuth();
  if (isLoading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to="/" replace />;
  return <>{children}</>;
}

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: Home },
      {
        path: "student",
        element: <RequireAuth role="student"><StudentDashboard /></RequireAuth>,
      },
      {
        path: "employer",
        element: <RequireAuth role="employer"><EmployerDashboard /></RequireAuth>,
      },
      {
        path: "admin",
        element: <RequireAuth role="admin"><AdminConsole /></RequireAuth>,
      },
      {
        path: "profile",
        element: <RequireAuth><Profile /></RequireAuth>,
      },
      {
        path: "applications",
        element: <RequireAuth role="student"><MyApplications /></RequireAuth>,
      },
      { path: "pricing", Component: Pricing },
      { path: "success-stories", Component: SuccessStories },
      { path: "privacy-policy", Component: PrivacyPolicy },
      { path: "terms-of-service", Component: TermsOfService },
      { path: "help-center", Component: HelpCenter },
      { path: "contact-admin", Component: ContactAdmin },
      { path: "login", Component: Login },
      { path: "signup", Component: SignUp },
      { path: "dev", Component: DevLogin },
    ],
  },
]);
