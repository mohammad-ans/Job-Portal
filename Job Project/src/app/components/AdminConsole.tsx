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
  Bot
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

function logType(action: string): "info" | "success" | "warn" {
  if (action.toLowerCase().includes("approved")) return "success";
  if (action.toLowerCase().includes("rejected") || action.toLowerCase().includes("anomaly")) return "warn";
  return "info";
}

export function AdminConsole() {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || user.role !== "admin") return;
    Promise.all([
      api.get<Stats>("/api/v1/admin/stats"),
      api.get<{ items: Approval[]; total: number }>("/api/v1/admin/approvals"),
      api.get<{ items: SystemLog[] }>("/api/v1/admin/logs"),
    ])
      .then(([s, a, l]) => {
        setStats(s);
        setApprovals(a.items);
        setLogs(l.items);
      })
      .catch(() => toast.error("Failed to load admin data"))
      .finally(() => setLoading(false));
  }, [user]);

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
      <div className="mb-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
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

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

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

      </div>
    </div>
  );
}
