import { createBrowserRouter } from "react-router";
import { Layout } from "./components/Layout";
import { Home } from "./components/Home";
import { StudentDashboard } from "./components/StudentDashboard";
import { EmployerDashboard } from "./components/EmployerDashboard";
import { AdminConsole } from "./components/AdminConsole";

// Extra Pages
import { Pricing } from "./components/Pricing";
import { SuccessStories } from "./components/SuccessStories";
import { PrivacyPolicy } from "./components/PrivacyPolicy";
import { TermsOfService } from "./components/TermsOfService";
import { HelpCenter } from "./components/HelpCenter";
import { ContactAdmin } from "./components/ContactAdmin";
import { Login, SignUp } from "./components/Auth";
import { Profile } from "./components/Profile";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: Home },
      { path: "student", Component: StudentDashboard },
      { path: "employer", Component: EmployerDashboard },
      { path: "admin", Component: AdminConsole },
      { path: "pricing", Component: Pricing },
      { path: "success-stories", Component: SuccessStories },
      { path: "privacy-policy", Component: PrivacyPolicy },
      { path: "terms-of-service", Component: TermsOfService },
      { path: "help-center", Component: HelpCenter },
      { path: "contact-admin", Component: ContactAdmin },
      { path: "login", Component: Login },
      { path: "signup", Component: SignUp },
      { path: "profile", Component: Profile },
    ],
  },
]);
