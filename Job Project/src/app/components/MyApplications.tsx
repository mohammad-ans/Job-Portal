import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Link } from "react-router";
import { useAuth } from "../context/AuthContext";
import api from "../lib/api";
import {
  Briefcase, MapPin, Calendar, ChevronLeft, Bot, Clock,
  CheckCircle, XCircle, Sparkles, GraduationCap
} from "lucide-react";

interface JobOut {
  id: string;
  title: string;
  company: string;
  location: string;
  job_type: string;
  required_skills: string[];
  salary_min: number | null;
  salary_max: number | null;
}

interface ApplicationItem {
  id: string;
  job_id: string;
  student_id: string;
  match_score: number;
  ai_reason: string | null;
  status: string;
  created_at: string;
  job: JobOut;
}

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string; icon: React.ReactNode }> = {
  applied: {
    label: "Applied",
    bg: "bg-blue-50",
    text: "text-blue-700",
    icon: <Clock size={13} />,
  },
  shortlisted: {
    label: "Shortlisted",
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    icon: <CheckCircle size={13} />,
  },
  rejected: {
    label: "Not Selected",
    bg: "bg-rose-50",
    text: "text-rose-700",
    icon: <XCircle size={13} />,
  },
  hired: {
    label: "Hired!",
    bg: "bg-indigo-50",
    text: "text-indigo-700",
    icon: <Sparkles size={13} />,
  },
};

function jobTypeLabel(type: string) {
  return type.replace("_", "-").replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-PK", { year: "numeric", month: "short", day: "numeric" });
}

export function MyApplications() {
  const { user } = useAuth();
  const [applications, setApplications] = useState<ApplicationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    api.get<{ items: ApplicationItem[] }>("/api/v1/applications/me")
      .then((r) => setApplications(r.items))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (!user || user.role !== "student") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <GraduationCap size={64} className="text-slate-300 mb-6" />
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Student Access Required</h2>
        <Link to="/login" className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold shadow-md transition-all mt-4">
          Go to Login
        </Link>
      </div>
    );
  }

  const filtered = filter === "all" ? applications : applications.filter((a) => a.status === filter);

  const counts = {
    all: applications.length,
    applied: applications.filter((a) => a.status === "applied").length,
    shortlisted: applications.filter((a) => a.status === "shortlisted").length,
    hired: applications.filter((a) => a.status === "hired").length,
    rejected: applications.filter((a) => a.status === "rejected").length,
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8 flex items-center gap-4">
        <Link to="/student" className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors">
          <ChevronLeft size={22} />
        </Link>
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">My Applications</h1>
          <p className="text-slate-500 mt-1">Track all your job applications in one place.</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { key: "all", label: "Total", color: "text-slate-700", bg: "bg-white border border-slate-200" },
          { key: "shortlisted", label: "Shortlisted", color: "text-emerald-700", bg: "bg-emerald-50 border border-emerald-100" },
          { key: "hired", label: "Hired", color: "text-indigo-700", bg: "bg-indigo-50 border border-indigo-100" },
          { key: "rejected", label: "Not Selected", color: "text-rose-700", bg: "bg-rose-50 border border-rose-100" },
        ].map((s) => (
          <div key={s.key} className={`${s.bg} rounded-2xl p-4 shadow-sm`}>
            <p className={`text-3xl font-black ${s.color}`}>{counts[s.key as keyof typeof counts]}</p>
            <p className={`text-xs font-bold uppercase tracking-wider mt-1 ${s.color} opacity-70`}>{s.label}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-2 flex-wrap mb-6">
        {(["all", "applied", "shortlisted", "hired", "rejected"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 text-sm font-bold rounded-xl transition-all border ${
              filter === f
                ? "bg-slate-900 text-white border-slate-900"
                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
            }`}
          >
            {f === "all" ? "All" : STATUS_CONFIG[f]?.label ?? f}
            <span className={`ml-2 text-xs px-1.5 py-0.5 rounded-full ${filter === f ? "bg-white/20" : "bg-slate-100"}`}>
              {counts[f]}
            </span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse bg-white rounded-2xl h-32 border border-slate-200" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Briefcase size={56} className="text-slate-200 mb-4" />
          <h3 className="text-lg font-bold text-slate-700 mb-1">No applications yet</h3>
          <p className="text-slate-400 text-sm">Browse jobs on your dashboard and apply to get started.</p>
          <Link to="/student" className="mt-6 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors text-sm">
            Browse Jobs
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((app, idx) => {
            const cfg = STATUS_CONFIG[app.status] ?? STATUS_CONFIG.applied;
            return (
              <motion.div
                key={app.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.06 }}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex-grow">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-10 h-10 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Briefcase size={20} className="text-indigo-500" />
                      </div>
                      <div>
                        <h3 className="font-extrabold text-slate-900 text-lg leading-tight">{app.job.title}</h3>
                        <p className="text-sm text-slate-500 font-medium">{app.job.company}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-3 text-xs font-semibold text-slate-500 mb-3">
                      <span className="flex items-center gap-1">
                        <MapPin size={12} /> {app.job.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Briefcase size={12} /> {jobTypeLabel(app.job.job_type)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar size={12} /> Applied {formatDate(app.created_at)}
                      </span>
                    </div>

                    {app.job.required_skills.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {app.job.required_skills.slice(0, 5).map((s) => (
                          <span key={s} className="px-2 py-1 bg-slate-100 text-slate-600 text-[11px] font-bold rounded-md">
                            {s}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-row sm:flex-col items-center sm:items-end gap-4 sm:gap-2 flex-shrink-0">
                    <span className={`flex items-center gap-1.5 px-3 py-1.5 ${cfg.bg} ${cfg.text} text-xs font-bold rounded-lg border ${cfg.bg.replace("bg-", "border-").replace("50", "100")}`}>
                      {cfg.icon} {cfg.label}
                    </span>
                    {app.match_score > 0 && (
                      <div className="flex items-center gap-1 text-xs font-bold text-indigo-500">
                        <Bot size={14} />
                        <span>{app.match_score.toFixed(0)}% match</span>
                      </div>
                    )}
                  </div>
                </div>

                {app.ai_reason && (
                  <div className="mt-4 pt-4 border-t border-slate-100 flex items-start gap-2">
                    <Bot size={14} className="text-indigo-400 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-slate-500 leading-relaxed italic">{app.ai_reason}</p>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
