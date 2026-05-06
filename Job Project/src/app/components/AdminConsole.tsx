import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router";
import { api } from "../lib/api";
import { toast } from "sonner";
import {
  ShieldCheck,
  Check,
  X,
  Activity,
  AlertTriangle,
  Building,
  GraduationCap,
  Database,
  Briefcase,
  Bot,
  UserPlus,
  ChevronRight,
  ChevronDown,
  Users,
  Lock,
  MessageCircle,
  HelpCircle,
  Pencil,
  Trash2,
  Plus,
  Save,
  Mail
} from "lucide-react";

interface Stats {
  total_students: number;
  total_employers: number;
  active_jobs: number;
  total_matches: number;
}

interface Approval {
  id: string;
  target_type: string;
  target_id: string;
  name: string;
  details: string | null;
  ai_confidence: number;
  flags: number;
  flag_reason: string | null;
  status: string;
  created_at: string;
}

interface SystemLog {
  id: string;
  action: string;
  actor_id: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

interface EmployerSummary {
  id: string;
  company_name: string;
  industry: string | null;
  is_approved: boolean;
  job_count: number;
  application_count: number;
}

interface EmployerApplication {
  application_id: string;
  job_title: string;
  student_name: string;
  student_email: string;
  university: string | null;
  status: string;
  match_score: number;
  applied_at: string;
}

interface Ticket {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: string;
  user_id: string | null;
  created_at: string;
}

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  order_index: number;
}

const TICKET_STATUS_COLORS: Record<string, string> = {
  open: "bg-rose-100 text-rose-700",
  in_progress: "bg-amber-100 text-amber-700",
  resolved: "bg-emerald-100 text-emerald-700",
};

const FAQ_CATEGORIES = ["Getting Started", "Resume & Profile", "AI Matching", "For Employers", "Account", "General"];

function logType(action: string): "info" | "success" | "warn" {
  if (action.toLowerCase().includes("approved")) return "success";
  if (action.toLowerCase().includes("rejected") || action.toLowerCase().includes("anomaly")) return "warn";
  return "info";
}

const STATUS_BADGE: Record<string, string> = {
  applied: "bg-blue-100 text-blue-700",
  pending_verification: "bg-amber-100 text-amber-700",
  shortlisted: "bg-emerald-100 text-emerald-700",
  rejected: "bg-rose-100 text-rose-700",
  hired: "bg-indigo-100 text-indigo-700",
};

export function AdminConsole() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"queue" | "companies" | "create_admin" | "tickets" | "faqs">("queue");
  const [stats, setStats] = useState<Stats | null>(null);
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [loading, setLoading] = useState(true);

  // Companies tab
  const [employers, setEmployers] = useState<EmployerSummary[]>([]);
  const [expandedEmployer, setExpandedEmployer] = useState<string | null>(null);
  const [employerApps, setEmployerApps] = useState<Record<string, EmployerApplication[]>>({});

  // Create admin tab
  const [adminName, setAdminName] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [creatingAdmin, setCreatingAdmin] = useState(false);

  // Tickets tab
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [ticketsTotal, setTicketsTotal] = useState(0);
  const [ticketFilter, setTicketFilter] = useState("all");
  const [expandedTicket, setExpandedTicket] = useState<string | null>(null);
  const [ticketsLoaded, setTicketsLoaded] = useState(false);

  // FAQs tab
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [faqsLoaded, setFaqsLoaded] = useState(false);
  const [editingFaqId, setEditingFaqId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ question: "", answer: "", category: "General", order_index: 0 });
  const [showNewFaq, setShowNewFaq] = useState(false);
  const [newFaq, setNewFaq] = useState({ question: "", answer: "", category: "Getting Started", order_index: 0 });
  const [savingFaq, setSavingFaq] = useState(false);

  useEffect(() => {
    if (!user || user.role !== "admin") return;
    Promise.all([
      api.get<Stats>("/api/v1/admin/stats"),
      api.get<{ items: Approval[]; total: number }>("/api/v1/admin/approvals"),
      api.get<{ items: SystemLog[] }>("/api/v1/admin/logs"),
      api.get<{ items: EmployerSummary[] }>("/api/v1/admin/employers"),
    ])
      .then(([s, a, l, e]) => {
        setStats(s);
        setApprovals(a.items);
        setLogs(l.items);
        setEmployers(e.items);
      })
      .catch(() => toast.error("Failed to load admin data"))
      .finally(() => setLoading(false));
  }, [user]);

  const fetchTickets = async (filter = ticketFilter) => {
    const qs = filter !== "all" ? `?status=${filter}` : "";
    try {
      const data = await api.get<{ items: Ticket[]; total: number }>(`/api/v1/contact${qs}`);
      setTickets(data.items);
      setTicketsTotal(data.total);
      setTicketsLoaded(true);
    } catch {
      toast.error("Failed to load tickets");
    }
  };

  const fetchFaqs = async () => {
    try {
      const data = await api.get<{ items: FAQItem[] }>("/api/v1/faqs", false);
      setFaqs(data.items);
      setFaqsLoaded(true);
    } catch {
      toast.error("Failed to load FAQs");
    }
  };

  useEffect(() => {
    if (activeTab === "tickets" && !ticketsLoaded) fetchTickets();
    if (activeTab === "faqs" && !faqsLoaded) fetchFaqs();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const handleEmployerExpand = async (employerId: string) => {
    if (expandedEmployer === employerId) {
      setExpandedEmployer(null);
      return;
    }
    setExpandedEmployer(employerId);
    if (employerApps[employerId]) return;
    try {
      const data = await api.get<{ company_name: string; items: EmployerApplication[] }>(
        `/api/v1/admin/employers/${employerId}/applications`
      );
      setEmployerApps((prev) => ({ ...prev, [employerId]: data.items }));
    } catch {
      toast.error("Failed to load applications");
    }
  };

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingAdmin(true);
    try {
      await api.post("/api/v1/admin/users", { name: adminName, email: adminEmail, password: adminPassword });
      toast.success(`Admin account created for ${adminEmail}`);
      setAdminName("");
      setAdminEmail("");
      setAdminPassword("");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to create admin");
    } finally {
      setCreatingAdmin(false);
    }
  };

  const handleTicketStatus = async (ticketId: string, newStatus: string) => {
    try {
      const updated = await api.patch<Ticket>(`/api/v1/contact/${ticketId}/status`, { status: newStatus });
      setTickets((prev) => prev.map((t) => (t.id === ticketId ? { ...t, status: updated.status } : t)));
      toast.success("Ticket status updated");
    } catch {
      toast.error("Failed to update ticket");
    }
  };

  const handleCreateFaq = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingFaq(true);
    try {
      const created = await api.post<FAQItem>("/api/v1/faqs", newFaq);
      setFaqs((prev) => [...prev, created]);
      setNewFaq({ question: "", answer: "", category: "Getting Started", order_index: 0 });
      setShowNewFaq(false);
      toast.success("FAQ created");
    } catch {
      toast.error("Failed to create FAQ");
    } finally {
      setSavingFaq(false);
    }
  };

  const handleUpdateFaq = async (faqId: string) => {
    setSavingFaq(true);
    try {
      const updated = await api.patch<FAQItem>(`/api/v1/faqs/${faqId}`, editForm);
      setFaqs((prev) => prev.map((f) => (f.id === faqId ? updated : f)));
      setEditingFaqId(null);
      toast.success("FAQ updated");
    } catch {
      toast.error("Failed to update FAQ");
    } finally {
      setSavingFaq(false);
    }
  };

  const handleDeleteFaq = async (faqId: string) => {
    if (!confirm("Delete this FAQ?")) return;
    try {
      await api.delete(`/api/v1/faqs/${faqId}`);
      setFaqs((prev) => prev.filter((f) => f.id !== faqId));
      toast.success("FAQ deleted");
    } catch {
      toast.error("Failed to delete FAQ");
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await api.post(`/api/v1/admin/approvals/${id}/approve`);
      setApprovals((prev) => prev.filter((a) => a.id !== id));
      toast.success("Approved successfully");
    } catch {
      toast.error("Failed to approve");
    }
  };

  const handleReject = async (id: string) => {
    try {
      await api.post(`/api/v1/admin/approvals/${id}/reject`, { reason: "Rejected by admin" });
      setApprovals((prev) => prev.filter((a) => a.id !== id));
      toast.success("Rejected");
    } catch {
      toast.error("Failed to reject");
    }
  };

  if (!user || user.role !== "admin") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <ShieldCheck size={64} className="text-slate-300 mb-6" />
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Admin Access Required</h2>
        <p className="text-slate-500 max-w-md mb-8">System overview and moderation features are restricted to verified administrators.</p>
        <Link to="/login" className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-xl font-bold shadow-md transition-all">Admin Login</Link>
      </div>
    );
  }

  const statCards = stats ? [
    { label: "Verified Students", value: stats.total_students.toLocaleString(), icon: GraduationCap, color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-100" },
    { label: "Verified Employers", value: stats.total_employers.toLocaleString(), icon: Building, color: "text-indigo-600", bg: "bg-indigo-50", border: "border-indigo-100" },
    { label: "Active Job Listings", value: stats.active_jobs.toLocaleString(), icon: Briefcase, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100" },
    { label: "Total Matches Made", value: stats.total_matches.toLocaleString(), icon: Database, color: "text-purple-600", bg: "bg-purple-50", border: "border-purple-100" },
  ] : [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
      <div className="mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-5">
          <div className="bg-slate-900 p-4 rounded-2xl text-white shadow-lg shadow-slate-900/20">
            <ShieldCheck size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900">System Admin</h1>
            <p className="text-slate-500 font-medium mt-1">Platform moderation and data integrity layer</p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-100">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-sm font-bold text-emerald-700">All Systems Operational</span>
        </div>
      </div>

      <div className="flex gap-2 bg-slate-100 p-1.5 rounded-2xl w-fit mb-8 border border-slate-200/50">
        <button onClick={() => setActiveTab("queue")}
          className={`px-5 py-2.5 text-sm font-bold rounded-xl transition-all flex items-center gap-2 ${activeTab === "queue" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
          <AlertTriangle size={16} /> Moderation Queue
          {approvals.length > 0 && <span className="bg-rose-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full">{approvals.length}</span>}
        </button>
        <button onClick={() => setActiveTab("companies")}
          className={`px-5 py-2.5 text-sm font-bold rounded-xl transition-all flex items-center gap-2 ${activeTab === "companies" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
          <Users size={16} /> Companies
        </button>
        <button onClick={() => setActiveTab("create_admin")}
          className={`px-5 py-2.5 text-sm font-bold rounded-xl transition-all flex items-center gap-2 ${activeTab === "create_admin" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
          <UserPlus size={16} /> Create Admin
        </button>
        <button onClick={() => setActiveTab("tickets")}
          className={`px-5 py-2.5 text-sm font-bold rounded-xl transition-all flex items-center gap-2 ${activeTab === "tickets" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
          <MessageCircle size={16} /> Support Tickets
          {tickets.filter((t) => t.status === "open").length > 0 && (
            <span className="bg-rose-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full">
              {tickets.filter((t) => t.status === "open").length}
            </span>
          )}
        </button>
        <button onClick={() => setActiveTab("faqs")}
          className={`px-5 py-2.5 text-sm font-bold rounded-xl transition-all flex items-center gap-2 ${activeTab === "faqs" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
          <HelpCircle size={16} /> FAQ Management
        </button>
      </div>

      {/* Metrics Grid — always visible */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {loading
          ? [...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm animate-pulse h-32" />
            ))
          : statCards.map((stat, i) => (
              <div key={i} className={`bg-white rounded-3xl p-6 border ${stat.border} shadow-sm flex flex-col`}>
                <div className="flex justify-between items-start mb-4">
                  <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                    <stat.icon size={24} />
                  </div>
                </div>
                <div>
                  <p className="text-3xl font-black text-slate-900 mb-1">{stat.value}</p>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{stat.label}</p>
                </div>
              </div>
            ))}
      </div>

      {/* Moderation Queue Tab */}
      {activeTab === "queue" && <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Verification Queue */}
        <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-slate-200/60 overflow-hidden flex flex-col min-h-[500px]">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <AlertTriangle className="text-amber-500" size={20} />
              Moderation Queue
            </h2>
            <span className="bg-slate-900 text-white text-xs font-bold px-3 py-1 rounded-full">
              {approvals.length} Pending
            </span>
          </div>

          {approvals.length === 0 ? (
            <div className="flex-grow flex flex-col items-center justify-center p-12 text-center text-slate-500">
              <ShieldCheck size={64} className="mb-4 text-slate-200" />
              <p className="text-xl font-bold text-slate-700">
                {loading ? "Loading…" : "Inbox Zero!"}
              </p>
              <p className="text-sm mt-2 max-w-xs">
                {loading
                  ? "Fetching pending approvals."
                  : "All entities have been verified. The ecosystem is clean and secure."}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 flex-grow">
              <AnimatePresence>
                {approvals.map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0, padding: 0, margin: 0, overflow: "hidden" }}
                    className="p-6 flex flex-col sm:flex-row items-start justify-between hover:bg-slate-50 transition-colors gap-6"
                  >
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-2xl flex-shrink-0 ${
                        item.target_type === "company" ? "bg-blue-100 text-blue-600" :
                        item.target_type === "job" ? "bg-indigo-100 text-indigo-600" :
                        "bg-emerald-100 text-emerald-600"
                      }`}>
                        {item.target_type === "company" && <Building size={24} />}
                        {item.target_type === "job" && <Briefcase size={24} />}
                        {item.target_type === "student_verification" && <GraduationCap size={24} />}
                      </div>

                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-slate-900 text-lg">{item.name}</h3>
                          {item.flags > 0 && (
                            <span className="bg-rose-100 text-rose-700 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider">
                              Flagged
                            </span>
                          )}
                        </div>
                        {item.details && (
                          <p className="text-slate-600 text-sm font-medium">{item.details}</p>
                        )}
                        {item.flag_reason && (
                          <p className="text-xs text-rose-600 mt-2 font-medium flex items-center gap-1">
                            <AlertTriangle size={12} /> {item.flag_reason}
                          </p>
                        )}

                        <div className="flex items-center gap-3 mt-3">
                          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider bg-slate-100 px-2 py-1 rounded">
                            {new Date(item.created_at).toLocaleString()}
                          </span>
                          <span className="flex items-center gap-1 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                            <Bot size={12} /> AI Confidence:
                            <span className={item.ai_confidence > 90 ? "text-emerald-500" : "text-amber-500"}>
                              {item.ai_confidence}%
                            </span>
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                      <button
                        onClick={() => handleReject(item.id)}
                        className="flex-1 sm:flex-none flex items-center justify-center p-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors font-medium border border-transparent hover:border-rose-200"
                        title="Reject"
                      >
                        <X size={20} />
                      </button>
                      <button
                        onClick={() => handleApprove(item.id)}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl transition-all shadow-md font-bold text-sm"
                      >
                        <Check size={18} /> Approve
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* System Logs Sidebar */}
        <div className="lg:col-span-1 bg-slate-900 rounded-3xl shadow-xl p-6 text-slate-300 flex flex-col">
          <h2 className="text-white font-bold text-lg mb-6 flex items-center gap-2 border-b border-slate-800 pb-4">
            <Activity size={20} className="text-indigo-400" />
            Live System Logs
          </h2>

          <div className="space-y-4 font-mono text-xs flex-grow overflow-y-auto pr-2 custom-scrollbar">
            {loading ? (
              <p className="text-slate-500 text-center pt-8">Loading logs…</p>
            ) : logs.length === 0 ? (
              <p className="text-slate-500 text-center pt-8">No logs yet.</p>
            ) : (
              logs.map((log) => (
                <div key={log.id} className="flex gap-3 items-start border-l-2 border-slate-800 pl-3">
                  <span className="text-slate-500 shrink-0">
                    {new Date(log.created_at).toLocaleTimeString()}
                  </span>
                  <span className={
                    logType(log.action) === "success" ? "text-emerald-400" :
                    logType(log.action) === "warn" ? "text-amber-400" : "text-slate-300"
                  }>
                    {log.action}
                  </span>
                </div>
              ))
            )}
          </div>

          <div className="mt-6 pt-6 border-t border-slate-800 text-[10px] text-slate-500 text-center uppercase tracking-widest font-bold">
            End of Log
          </div>
        </div>

      </div>}

      {/* Companies Tab */}
      {activeTab === "companies" && (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200/60 overflow-hidden">
          <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Building size={20} className="text-indigo-500" /> Registered Companies
            </h2>
            <span className="text-xs font-bold text-slate-500">{employers.length} total</span>
          </div>
          {loading ? (
            <div className="p-8 space-y-4">
              {[...Array(3)].map((_, i) => <div key={i} className="animate-pulse h-16 bg-slate-100 rounded-xl" />)}
            </div>
          ) : employers.length === 0 ? (
            <div className="p-16 text-center text-slate-400">
              <Building size={48} className="mx-auto mb-3 opacity-30" />
              <p className="font-semibold">No companies registered yet</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {employers.map((emp) => {
                const isOpen = expandedEmployer === emp.id;
                const apps = employerApps[emp.id];
                return (
                  <div key={emp.id}>
                    <div
                      className="p-5 flex items-center justify-between hover:bg-slate-50 cursor-pointer transition-colors gap-4"
                      onClick={() => handleEmployerExpand(emp.id)}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0">
                          <Building size={20} className="text-indigo-500" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{emp.company_name}</p>
                          <p className="text-xs text-slate-500 font-medium">{emp.industry ?? "No industry"}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 flex-shrink-0">
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${emp.is_approved ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                          {emp.is_approved ? "Verified" : "Pending"}
                        </span>
                        <span className="text-xs font-bold text-slate-500 hidden sm:block">{emp.job_count} jobs · {emp.application_count} apps</span>
                        {isOpen ? <ChevronDown size={16} className="text-slate-400" /> : <ChevronRight size={16} className="text-slate-400" />}
                      </div>
                    </div>
                    <AnimatePresence>
                      {isOpen && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden bg-slate-50 border-t border-slate-100">
                          {!apps ? (
                            <div className="p-6 text-slate-400 text-sm text-center">Loading applications…</div>
                          ) : apps.length === 0 ? (
                            <div className="p-6 text-slate-400 text-sm text-center">No applications for this company yet.</div>
                          ) : (
                            <div className="divide-y divide-slate-200">
                              {apps.map((app) => (
                                <div key={app.application_id} className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                  <div>
                                    <p className="font-bold text-slate-800 text-sm">{app.student_name}
                                      {app.university && <span className="text-slate-400 font-normal"> · {app.university}</span>}
                                    </p>
                                    <p className="text-xs text-slate-500 mt-0.5">{app.job_title} · {app.student_email}</p>
                                  </div>
                                  <div className="flex items-center gap-3 flex-shrink-0">
                                    {app.match_score > 0 && (
                                      <span className="text-xs font-bold text-indigo-500 flex items-center gap-1">
                                        <Bot size={12} /> {app.match_score.toFixed(0)}%
                                      </span>
                                    )}
                                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${STATUS_BADGE[app.status] ?? "bg-slate-100 text-slate-600"}`}>
                                      {app.status.replace("_", " ")}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Support Tickets Tab */}
      {activeTab === "tickets" && (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200/60 overflow-hidden">
          <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <MessageCircle size={20} className="text-indigo-500" /> Support Tickets
              <span className="text-xs font-bold text-slate-400 ml-1">({ticketsTotal} total)</span>
            </h2>
            <div className="flex gap-2">
              {["all", "open", "in_progress", "resolved"].map((f) => (
                <button
                  key={f}
                  onClick={() => { setTicketFilter(f); fetchTickets(f); }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                    ticketFilter === f
                      ? "bg-slate-900 text-white border-slate-900"
                      : "bg-white text-slate-600 border-slate-200 hover:border-slate-400"
                  }`}
                >
                  {f === "all" ? "All" : f === "in_progress" ? "In Progress" : f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {!ticketsLoaded ? (
            <div className="p-8 space-y-4">
              {[...Array(4)].map((_, i) => <div key={i} className="animate-pulse h-20 bg-slate-100 rounded-xl" />)}
            </div>
          ) : tickets.length === 0 ? (
            <div className="p-16 text-center text-slate-400">
              <MessageCircle size={48} className="mx-auto mb-3 opacity-30" />
              <p className="font-semibold">No tickets {ticketFilter !== "all" ? `with status "${ticketFilter}"` : "yet"}</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {tickets.map((ticket) => {
                const isOpen = expandedTicket === ticket.id;
                return (
                  <div key={ticket.id} className="p-5 hover:bg-slate-50 transition-colors">
                    <div
                      className="flex items-start justify-between gap-4 cursor-pointer"
                      onClick={() => setExpandedTicket(isOpen ? null : ticket.id)}
                    >
                      <div className="flex items-start gap-4 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0">
                          <Mail size={16} />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-bold text-slate-900 text-sm">{ticket.name}</p>
                            <span className="text-xs text-slate-400">{ticket.email}</span>
                          </div>
                          <p className="text-sm font-semibold text-slate-700 mt-0.5">{ticket.subject}</p>
                          {!isOpen && (
                            <p className="text-xs text-slate-500 mt-1 truncate max-w-xs">{ticket.message}</p>
                          )}
                          <p className="text-[10px] text-slate-400 mt-1 font-medium">
                            {new Date(ticket.created_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${TICKET_STATUS_COLORS[ticket.status] ?? "bg-slate-100 text-slate-600"}`}>
                          {ticket.status === "in_progress" ? "In Progress" : ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
                        </span>
                        {isOpen ? <ChevronDown size={16} className="text-slate-400" /> : <ChevronRight size={16} className="text-slate-400" />}
                      </div>
                    </div>

                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="mt-4 ml-13 pl-13">
                            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm text-slate-700 font-medium leading-relaxed whitespace-pre-wrap ml-13">
                              {ticket.message}
                            </div>
                            <div className="flex items-center gap-2 mt-3">
                              <span className="text-xs font-bold text-slate-500">Update status:</span>
                              {["open", "in_progress", "resolved"].map((s) => (
                                <button
                                  key={s}
                                  disabled={ticket.status === s}
                                  onClick={() => handleTicketStatus(ticket.id, s)}
                                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                                    ticket.status === s
                                      ? `${TICKET_STATUS_COLORS[s]} border-transparent cursor-default opacity-60`
                                      : "bg-white border-slate-200 text-slate-600 hover:border-slate-400"
                                  }`}
                                >
                                  {s === "in_progress" ? "In Progress" : s.charAt(0).toUpperCase() + s.slice(1)}
                                </button>
                              ))}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* FAQ Management Tab */}
      {activeTab === "faqs" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <HelpCircle size={20} className="text-indigo-500" /> FAQ Management
              <span className="text-xs font-bold text-slate-400 ml-1">({faqs.length} entries)</span>
            </h2>
            <button
              onClick={() => { setShowNewFaq(true); setEditingFaqId(null); }}
              className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-sm transition-all shadow-sm"
            >
              <Plus size={16} /> Add FAQ
            </button>
          </div>

          {/* New FAQ Form */}
          <AnimatePresence>
            {showNewFaq && (
              <motion.form
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                onSubmit={handleCreateFaq}
                className="bg-indigo-50 border border-indigo-200 rounded-3xl p-6 space-y-4"
              >
                <h3 className="font-extrabold text-slate-900 text-sm uppercase tracking-wider flex items-center gap-2">
                  <Plus size={16} className="text-indigo-600" /> New FAQ Entry
                </h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Category</label>
                    <select
                      value={newFaq.category}
                      onChange={(e) => setNewFaq((p) => ({ ...p, category: e.target.value }))}
                      className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-sm"
                    >
                      {FAQ_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Order Index</label>
                    <input
                      type="number" min={0}
                      value={newFaq.order_index}
                      onChange={(e) => setNewFaq((p) => ({ ...p, order_index: parseInt(e.target.value) || 0 }))}
                      className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-sm"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Question</label>
                  <input
                    required type="text"
                    value={newFaq.question}
                    onChange={(e) => setNewFaq((p) => ({ ...p, question: e.target.value }))}
                    placeholder="What is…?"
                    className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Answer</label>
                  <textarea
                    required rows={4}
                    value={newFaq.answer}
                    onChange={(e) => setNewFaq((p) => ({ ...p, answer: e.target.value }))}
                    placeholder="Detailed answer…"
                    className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-sm resize-none"
                  />
                </div>
                <div className="flex gap-3">
                  <button type="submit" disabled={savingFaq}
                    className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-sm disabled:opacity-50">
                    <Save size={15} /> {savingFaq ? "Saving…" : "Save FAQ"}
                  </button>
                  <button type="button" onClick={() => setShowNewFaq(false)}
                    className="px-5 py-2.5 bg-white border border-slate-200 hover:border-slate-400 text-slate-600 font-bold rounded-xl text-sm">
                    Cancel
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

          {/* FAQ List */}
          {!faqsLoaded ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => <div key={i} className="animate-pulse h-20 bg-white border border-slate-200 rounded-2xl" />)}
            </div>
          ) : faqs.length === 0 ? (
            <div className="text-center py-16 text-slate-400 bg-white rounded-3xl border border-slate-200">
              <HelpCircle size={48} className="mx-auto mb-3 opacity-30" />
              <p className="font-semibold">No FAQs yet — add one above</p>
            </div>
          ) : (
            (() => {
              const grouped = faqs.reduce<Record<string, FAQItem[]>>((acc, f) => {
                if (!acc[f.category]) acc[f.category] = [];
                acc[f.category].push(f);
                return acc;
              }, {});
              return Object.entries(grouped).map(([category, items]) => (
                <div key={category} className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                    <h3 className="font-extrabold text-slate-700 text-sm">{category}</h3>
                  </div>
                  <div className="divide-y divide-slate-100">
                    {items.map((faq) => (
                      <div key={faq.id} className="p-5">
                        {editingFaqId === faq.id ? (
                          <div className="space-y-3">
                            <div className="grid sm:grid-cols-2 gap-3">
                              <div className="space-y-1">
                                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Category</label>
                                <select
                                  value={editForm.category}
                                  onChange={(e) => setEditForm((p) => ({ ...p, category: e.target.value }))}
                                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium"
                                >
                                  {FAQ_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                                </select>
                              </div>
                              <div className="space-y-1">
                                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Order Index</label>
                                <input
                                  type="number" min={0}
                                  value={editForm.order_index}
                                  onChange={(e) => setEditForm((p) => ({ ...p, order_index: parseInt(e.target.value) || 0 }))}
                                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium"
                                />
                              </div>
                            </div>
                            <input
                              type="text"
                              value={editForm.question}
                              onChange={(e) => setEditForm((p) => ({ ...p, question: e.target.value }))}
                              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-sm"
                              placeholder="Question"
                            />
                            <textarea
                              rows={4}
                              value={editForm.answer}
                              onChange={(e) => setEditForm((p) => ({ ...p, answer: e.target.value }))}
                              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium resize-none"
                              placeholder="Answer"
                            />
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleUpdateFaq(faq.id)}
                                disabled={savingFaq}
                                className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs disabled:opacity-50"
                              >
                                <Save size={13} /> {savingFaq ? "Saving…" : "Save"}
                              </button>
                              <button
                                onClick={() => setEditingFaqId(null)}
                                className="px-4 py-2 bg-white border border-slate-200 hover:border-slate-400 text-slate-600 font-bold rounded-xl text-xs"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-start justify-between gap-4">
                            <div className="min-w-0">
                              <p className="font-bold text-slate-900 text-sm leading-snug">{faq.question}</p>
                              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed line-clamp-2">{faq.answer}</p>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <button
                                onClick={() => {
                                  setEditingFaqId(faq.id);
                                  setShowNewFaq(false);
                                  setEditForm({ question: faq.question, answer: faq.answer, category: faq.category, order_index: faq.order_index });
                                }}
                                className="p-2 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                                title="Edit"
                              >
                                <Pencil size={15} />
                              </button>
                              <button
                                onClick={() => handleDeleteFaq(faq.id)}
                                className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                                title="Delete"
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ));
            })()
          )}
        </div>
      )}

      {/* Create Admin Tab */}
      {activeTab === "create_admin" && (
        <div className="max-w-md">
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200/60 p-8">
            <div className="flex items-center gap-4 mb-8">
              <div className="bg-slate-900 p-3 rounded-2xl text-white">
                <UserPlus size={24} />
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-slate-900">Create Admin User</h2>
                <p className="text-sm text-slate-500 font-medium mt-0.5">New admin accounts get full platform access.</p>
              </div>
            </div>
            <form onSubmit={handleCreateAdmin} className="space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Full Name</label>
                <input required type="text" value={adminName} onChange={(e) => setAdminName(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                  placeholder="Jane Smith" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Email Address</label>
                <input required type="email" value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                  placeholder="admin@gradmatch.ai" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Temporary Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input required type="password" value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)}
                    minLength={8}
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                    placeholder="Min. 8 characters" />
                </div>
              </div>
              <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 text-xs text-amber-700 font-medium">
                Share the temporary password securely. The new admin should change it after their first login.
              </div>
              <button type="submit" disabled={creatingAdmin}
                className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50">
                <UserPlus size={18} /> {creatingAdmin ? "Creating…" : "Create Admin Account"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
