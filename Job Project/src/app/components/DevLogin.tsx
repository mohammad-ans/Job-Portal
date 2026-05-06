import { useState } from "react";
import { motion } from "motion/react";
import { useNavigate, Link } from "react-router";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";
import { GraduationCap, Building, ShieldCheck, Terminal, Zap, Mail, KeyRound } from "lucide-react";

const TEST_USERS = [
  {
    role: "student" as const,
    label: "Test Student",
    email: "student@test.com",
    password: "Test1234!",
    description: "Usman Tariq · FAST-NU",
    detail: "Verified identity · BS Computer Science · GPA 3.52",
    icon: GraduationCap,
    gradient: "from-blue-500 to-blue-600",
    shadow: "shadow-blue-200",
    hub: "/student",
  },
  {
    role: "employer" as const,
    label: "Test Employer",
    email: "employer@test.com",
    password: "Test1234!",
    description: "Sarah Ahmed · Nexus Technologies",
    detail: "Verified company · Can post jobs",
    icon: Building,
    gradient: "from-indigo-500 to-indigo-600",
    shadow: "shadow-indigo-200",
    hub: "/employer",
  },
  {
    role: "admin" as const,
    label: "Test Admin",
    email: "admin@test.com",
    password: "Test1234!",
    description: "Test Admin",
    detail: "Full platform access · Moderation · FAQs · Tickets",
    icon: ShieldCheck,
    gradient: "from-emerald-500 to-emerald-600",
    shadow: "shadow-emerald-200",
    hub: "/admin",
  },
];

export function DevLogin() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loadingRole, setLoadingRole] = useState<string | null>(null);

  const handleLogin = async (u: (typeof TEST_USERS)[number]) => {
    setLoadingRole(u.role);
    try {
      await login(u.email, u.password);
      toast.success(`Logged in as ${u.label}`);
      navigate(u.hub);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Login failed";
      toast.error(`${msg} — did you run python dev_seed.py?`);
    } finally {
      setLoadingRole(null);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-3xl">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-amber-100 border border-amber-200 text-amber-800 px-4 py-2 rounded-full text-sm font-bold mb-6">
            <Terminal size={15} /> Development Only
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 mb-3">Test Account Quick Login</h1>
          <p className="text-slate-500 max-w-md mx-auto text-sm leading-relaxed">
            Click a card to instantly log in. First run{" "}
            <code className="bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded font-mono text-xs text-slate-700">
              python dev_seed.py
            </code>{" "}
            from the <code className="font-mono text-xs">Backend/</code> directory to create these accounts.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-5 mb-8">
          {TEST_USERS.map((u) => {
            const Icon = u.icon;
            const isLoading = loadingRole === u.role;
            return (
              <motion.button
                key={u.role}
                onClick={() => handleLogin(u)}
                disabled={loadingRole !== null}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 text-left transition-all hover:shadow-md hover:border-slate-300 disabled:opacity-60 disabled:cursor-wait w-full"
              >
                <div className={`w-12 h-12 bg-gradient-to-br ${u.gradient} rounded-2xl flex items-center justify-center mb-4 shadow-lg ${u.shadow}`}>
                  <Icon size={24} className="text-white" />
                </div>

                <h3 className="font-extrabold text-slate-900 text-base mb-0.5">{u.label}</h3>
                <p className="text-sm text-slate-600 font-medium leading-snug mb-0.5">{u.description}</p>
                <p className="text-xs text-slate-400 font-medium mb-4 leading-snug">{u.detail}</p>

                <div className="space-y-1.5 mb-4">
                  <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5">
                    <Mail size={10} className="flex-shrink-0" /> {u.email}
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5">
                    <KeyRound size={10} className="flex-shrink-0" /> {u.password}
                  </div>
                </div>

                <div className={`w-full py-2.5 bg-gradient-to-r ${u.gradient} text-white font-bold text-sm rounded-xl flex items-center justify-center gap-1.5 shadow-md ${u.shadow}`}>
                  {isLoading ? "Logging in…" : <><Zap size={14} /> Login</>}
                </div>
              </motion.button>
            );
          })}
        </div>

        <p className="text-center text-sm text-slate-400">
          <Link to="/login" className="hover:text-slate-600 font-medium">← Regular login</Link>
        </p>
      </div>
    </div>
  );
}
