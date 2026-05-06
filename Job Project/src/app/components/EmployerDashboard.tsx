import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useAuth, getAvatarUrl } from "../context/AuthContext";
import { Link } from "react-router";
import { toast } from "sonner";
import api from "../lib/api";
import {
  Building, Plus, TrendingUp, Briefcase, Bot, Filter,
  CheckCircle, XCircle, Search, Sparkles, MapPin, ChevronRight, ChevronDown, Lock
} from "lucide-react";

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  job_type: string;
  status: string;
}

interface Candidate {
  application_id: string;
  student_id: string;
  name: string;
  avatar_url: string | null;
  university: string | null;
  gpa: number | null;
  skills: string[];
  match_score: number;
  status: string;
  ai_summary: string | null;
  resume_preview: string;
}

interface EmployerProfile {
  company_name: string;
  is_approved: boolean;
}

export function EmployerDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"applicants" | "post">("applicants");
  const [candidateTab, setCandidateTab] = useState<"pending" | "shortlisted">("pending");
  const [showPostingSuccess, setShowPostingSuccess] = useState(false);
  const [expandedApplicant, setExpandedApplicant] = useState<string | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [profile, setProfile] = useState<EmployerProfile | null>(null);
  const [jobForm, setJobForm] = useState({
    title: "", location: "", job_type: "full_time",
    required_skills: "", description: ""
  });

  useEffect(() => {
    api.get<EmployerProfile>("/api/v1/users/me/profile")
      .then(setProfile)
      .catch(() => {});

    api.get<{ items: Job[] }>("/api/v1/jobs")
      .then((r) => {
        setJobs(r.items);
        if (r.items.length > 0) setSelectedJobId(r.items[0].id);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!selectedJobId) return;
    api.get<{ items: Candidate[] }>(`/api/v1/matches/candidates?job_id=${selectedJobId}`)
      .then((r) => setCandidates(r.items))
      .catch(() => {});
  }, [selectedJobId]);

  const pendingCandidates = candidates.filter(
    (c) => c.status !== "shortlisted" && c.status !== "hired" && c.status !== "rejected"
  );
  const shortlistedCandidates = candidates.filter(
    (c) => c.status === "shortlisted" || c.status === "hired"
  );

  const handleStatusUpdate = async (applicationId: string, status: string) => {
    try {
      await api.patch(`/api/v1/applications/${applicationId}/status`, { status });
      if (status === "rejected") {
        setCandidates((prev) => prev.filter((c) => c.application_id !== applicationId));
        setExpandedApplicant(null);
        toast.success("Candidate rejected and removed");
      } else {
        setCandidates((prev) =>
          prev.map((c) => c.application_id === applicationId ? { ...c, status } : c)
        );
        if (status === "shortlisted") {
          setCandidateTab("shortlisted");
          toast.success("Candidate shortlisted");
        }
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to update status");
    }
  };

  const handlePostJob = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const skills = jobForm.required_skills.split(",").map((s) => s.trim()).filter(Boolean);
      await api.post("/api/v1/jobs", {
        title: jobForm.title,
        location: jobForm.location,
        job_type: jobForm.job_type,
        description: jobForm.description,
        required_skills: skills,
      });
      setShowPostingSuccess(true);
      toast.success("Job submitted for review");
      setTimeout(() => {
        setShowPostingSuccess(false);
        setActiveTab("applicants");
        api.get<{ items: Job[] }>("/api/v1/jobs").then((r) => {
          setJobs(r.items);
          if (r.items.length > 0 && !selectedJobId) setSelectedJobId(r.items[0].id);
        }).catch(() => {});
      }, 3000);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to post job");
    }
  };

  if (!user || user.role !== "employer") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <Building size={64} className="text-slate-300 mb-6" />
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Employer Access Required</h2>
        <p className="text-slate-500 max-w-md mb-8">Please log in as an employer to access the recruitment suite.</p>
        <Link to="/login" className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold shadow-md transition-all">Go to Login</Link>
      </div>
    );
  }

  const selectedJob = jobs.find((j) => j.id === selectedJobId);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">Employer Suite</h1>
          <p className="text-slate-500 mt-2 text-lg">Manage job postings and review AI-ranked candidates instantly.</p>
        </div>
        <div className="bg-slate-100/80 p-1.5 rounded-2xl flex shadow-inner border border-slate-200/50">
          <button onClick={() => setActiveTab("applicants")}
            className={`px-6 py-2.5 text-sm font-bold rounded-xl transition-all ${activeTab === "applicants" ? "bg-white text-indigo-700 shadow-sm border border-slate-200/50" : "text-slate-500 hover:text-slate-700"}`}>
            Review Candidates
          </button>
          <button onClick={() => setActiveTab("post")}
            className={`px-6 py-2.5 text-sm font-bold rounded-xl transition-all ${activeTab === "post" ? "bg-white text-indigo-700 shadow-sm border border-slate-200/50" : "text-slate-500 hover:text-slate-700"}`}>
            Post New Role
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200/60 flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-slate-800 to-slate-900 text-white rounded-2xl flex items-center justify-center mb-5 shadow-lg shadow-slate-200">
              <Building size={36} />
            </div>
            <h2 className="text-xl font-bold text-slate-900">{profile?.company_name ?? user.name}</h2>
            <span className="mt-1 px-3 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-full uppercase tracking-wider">
              {profile?.is_approved ? "Verified" : "Pending Review"}
            </span>

            <div className="mt-8 w-full pt-6 border-t border-slate-100 grid grid-cols-2 gap-4">
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                <p className="text-3xl font-black text-slate-800 mb-1">{jobs.filter(j => j.status === "active").length}</p>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Active Jobs</p>
              </div>
              <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-100">
                <p className="text-3xl font-black text-emerald-600 mb-1">{shortlistedCandidates.length}</p>
                <p className="text-[10px] text-emerald-600/80 font-bold uppercase tracking-wider">Shortlisted</p>
              </div>
            </div>

            {jobs.length > 1 && (
              <div className="mt-4 w-full">
                <select
                  value={selectedJobId ?? ""}
                  onChange={(e) => setSelectedJobId(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {jobs.map((j) => (
                    <option key={j.id} value={j.id}>{j.title}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="bg-indigo-600 p-8 rounded-3xl shadow-lg shadow-indigo-200 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500 rounded-full blur-3xl opacity-50 -mr-10 -mt-10" />
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <TrendingUp size={24} className="text-indigo-200" />
                <h3 className="font-bold text-lg">Hiring Insights</h3>
              </div>
              <p className="text-sm text-indigo-100/90 leading-relaxed mb-6">
                Our NLP matching engine has successfully reduced your average screening time by 11.3 hours per open role this month.
              </p>
              <div className="bg-black/10 rounded-2xl p-5 border border-white/10 backdrop-blur-md">
                <div className="flex items-end gap-2">
                  <p className="text-4xl font-black text-emerald-400">57%</p>
                  <p className="text-emerald-400 mb-1">↓</p>
                </div>
                <p className="text-xs text-indigo-200 font-bold uppercase tracking-wider mt-2">Reduction in Time-to-Hire</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-8">
          {activeTab === "applicants" && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-3xl shadow-sm border border-slate-200/60 overflow-hidden min-h-[600px] flex flex-col">
              <div className="p-6 sm:p-8 border-b border-slate-100 bg-slate-50/50">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-5">
                  <div>
                    <h2 className="text-xl font-extrabold text-slate-900">{selectedJob?.title ?? "Select a job"}</h2>
                    <p className="text-sm text-slate-500 mt-1 font-medium">AI-Ranked Candidate Pipeline</p>
                  </div>
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div className="relative flex-grow sm:w-64">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input type="text" placeholder="Search skills..."
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm" />
                    </div>
                    <button className="p-2.5 border border-slate-200 rounded-xl text-slate-500 hover:bg-slate-50 bg-white shadow-sm">
                      <Filter size={20} />
                    </button>
                  </div>
                </div>
                <div className="flex gap-2 bg-slate-100 p-1 rounded-xl w-fit">
                  <button
                    onClick={() => setCandidateTab("pending")}
                    className={`px-4 py-2 text-sm font-bold rounded-lg transition-all flex items-center gap-2 ${candidateTab === "pending" ? "bg-white text-indigo-700 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                  >
                    Pending Review
                    <span className={`text-xs px-2 py-0.5 rounded-full font-black ${candidateTab === "pending" ? "bg-indigo-100 text-indigo-700" : "bg-slate-200 text-slate-500"}`}>
                      {pendingCandidates.length}
                    </span>
                  </button>
                  <button
                    onClick={() => setCandidateTab("shortlisted")}
                    className={`px-4 py-2 text-sm font-bold rounded-lg transition-all flex items-center gap-2 ${candidateTab === "shortlisted" ? "bg-white text-emerald-700 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                  >
                    Shortlisted
                    <span className={`text-xs px-2 py-0.5 rounded-full font-black ${candidateTab === "shortlisted" ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-500"}`}>
                      {shortlistedCandidates.length}
                    </span>
                  </button>
                </div>
              </div>

              <div className="divide-y divide-slate-100 flex-grow">
                {(candidateTab === "pending" ? pendingCandidates : shortlistedCandidates).length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-16 text-slate-400">
                    <Bot size={48} className="mb-4 opacity-40" />
                    <p className="font-semibold">
                      {candidateTab === "pending" ? "No pending candidates for this job" : "No shortlisted candidates yet"}
                    </p>
                  </div>
                ) : (
                  (candidateTab === "pending" ? pendingCandidates : shortlistedCandidates).map((applicant, index) => {
                    const isExpanded = expandedApplicant === applicant.application_id;
                    const avatar = applicant.avatar_url ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(applicant.name)}&background=6366f1&color=fff&size=256`;
                    return (
                      <motion.div key={applicant.application_id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: index * 0.1 }}
                        className={`transition-colors group ${isExpanded ? "bg-indigo-50/20" : "hover:bg-slate-50"}`}>
                        <div className="p-6 sm:p-8 cursor-pointer flex flex-col sm:flex-row gap-6 items-start sm:items-center justify-between"
                          onClick={() => setExpandedApplicant(isExpanded ? null : applicant.application_id)}>
                          <div className="flex items-center gap-5">
                            <img src={avatar} alt={applicant.name} className="w-16 h-16 rounded-2xl object-cover border border-slate-200 shadow-sm" />
                            <div>
                              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                {applicant.name}
                                {applicant.match_score >= 90 && (
                                  <span className="bg-emerald-100 text-emerald-700 text-[10px] uppercase font-black tracking-wider px-2 py-0.5 rounded flex items-center gap-1">
                                    <Sparkles size={10} /> Top Match
                                  </span>
                                )}
                              </h3>
                              <div className="text-sm font-medium text-slate-500 mt-1 flex items-center gap-3">
                                {applicant.university && <span>{applicant.university}</span>}
                                {applicant.gpa && <><span className="w-1.5 h-1.5 bg-slate-300 rounded-full" /><span>GPA: <strong className="text-slate-700">{applicant.gpa.toFixed(2)}</strong></span></>}
                              </div>
                              <div className="flex flex-wrap gap-1.5 mt-3">
                                {applicant.skills.slice(0, 5).map((s) => (
                                  <span key={s} className="px-2 py-1 bg-white border border-slate-200 text-slate-600 text-[11px] font-bold rounded-md shadow-sm">{s}</span>
                                ))}
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-row sm:flex-col items-center sm:items-end gap-6 sm:gap-2 w-full sm:w-auto justify-between border-t sm:border-t-0 pt-4 sm:pt-0 mt-4 sm:mt-0">
                            <div className="text-center sm:text-right">
                              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">AI Match Score</p>
                              <div className="flex items-center justify-center sm:justify-end gap-1.5">
                                <Bot className={applicant.match_score >= 90 ? "text-emerald-500" : "text-indigo-500"} size={22} />
                                <span className={`text-3xl font-black ${applicant.match_score >= 90 ? "text-emerald-500" : "text-indigo-500"}`}>
                                  {applicant.match_score.toFixed(0)}%
                                </span>
                              </div>
                            </div>
                            <div className="text-slate-400 flex items-center gap-1 text-sm font-semibold mt-2">
                              {isExpanded ? "Hide Details" : "View Full Profile"}
                              {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                            </div>
                          </div>
                        </div>

                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                              className="border-t border-slate-100 bg-white px-6 sm:px-8 pb-8 pt-4 overflow-hidden">
                              <div className="space-y-6">
                                {applicant.ai_summary && (
                                  <div className="bg-indigo-50/50 rounded-2xl p-5 border border-indigo-100/50">
                                    <h4 className="flex items-center gap-2 text-indigo-900 font-bold text-sm mb-2">
                                      <Bot size={16} className="text-indigo-500" /> AI Executive Summary
                                    </h4>
                                    <p className="text-sm text-indigo-800/80 leading-relaxed font-medium">{applicant.ai_summary}</p>
                                  </div>
                                )}
                                {applicant.resume_preview && (
                                  <div>
                                    <h4 className="font-bold text-slate-800 text-sm mb-2">Resume Snippet</h4>
                                    <p className="text-sm text-slate-600 leading-relaxed p-4 bg-slate-50 border border-slate-100 rounded-xl italic">"{applicant.resume_preview}"</p>
                                  </div>
                                )}
                                <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                                  {candidateTab === "shortlisted" && (
                                    <span className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 border border-emerald-100 text-xs font-bold px-3 py-1.5 rounded-lg">
                                      <CheckCircle size={14} /> Shortlisted
                                    </span>
                                  )}
                                  <div className="flex items-center gap-3 ml-auto">
                                    <button onClick={() => handleStatusUpdate(applicant.application_id, "rejected")}
                                      className="px-5 py-2.5 text-slate-600 hover:bg-red-50 hover:text-red-600 font-bold text-sm rounded-xl transition-colors flex items-center gap-1">
                                      <XCircle size={16} /> Reject
                                    </button>
                                    {candidateTab === "pending" && (
                                      <button onClick={() => handleStatusUpdate(applicant.application_id, "shortlisted")}
                                        className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm rounded-xl transition-colors shadow-md flex items-center gap-1">
                                        <CheckCircle size={16} /> Shortlist
                                      </button>
                                    )}
                                    {candidateTab === "shortlisted" && (
                                      <button onClick={() => handleStatusUpdate(applicant.application_id, "hired")}
                                        className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl transition-colors shadow-md flex items-center gap-1">
                                        <CheckCircle size={16} /> Mark as Hired
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    );
                  })
                )}
              </div>
            </motion.div>
          )}

          {activeTab === "post" && (
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-3xl shadow-sm border border-slate-200/60 p-8 sm:p-10">
              <div className="flex items-start gap-4 mb-10">
                <div className="bg-indigo-100 p-3 rounded-2xl text-indigo-600 shadow-inner"><Plus size={28} /></div>
                <div>
                  <h2 className="text-2xl font-black text-slate-900">Create New Requisition</h2>
                  <p className="text-slate-500 font-medium mt-1">Our NLP engine will analyse your description to find perfect matches.</p>
                </div>
              </div>

              {!profile?.is_approved ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-20 h-20 bg-amber-100 text-amber-500 rounded-full flex items-center justify-center mb-6">
                    <Lock size={36} />
                  </div>
                  <h3 className="text-xl font-extrabold text-slate-900 mb-2">Company Verification Required</h3>
                  <p className="text-slate-500 max-w-md font-medium">
                    Your company is pending admin verification. Once approved, you'll be able to post job listings and start receiving AI-matched candidates.
                  </p>
                  <div className="mt-6 px-5 py-3 bg-amber-50 border border-amber-200 rounded-2xl text-amber-700 font-bold text-sm">
                    Verification usually completes within 24 hours
                  </div>
                </div>
              ) : !showPostingSuccess ? (
                <form onSubmit={handlePostJob} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Job Title</label>
                      <input required type="text" value={jobForm.title}
                        onChange={(e) => setJobForm({ ...jobForm, title: e.target.value })}
                        placeholder="e.g. Data Scientist (Entry Level)"
                        className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all font-medium" />
                    </div>
                    <div className="space-y-2.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Location</label>
                      <div className="relative">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input required type="text" value={jobForm.location}
                          onChange={(e) => setJobForm({ ...jobForm, location: e.target.value })}
                          placeholder="e.g. Remote, Lahore"
                          className="w-full pl-11 pr-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all font-medium" />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Job Type</label>
                      <select value={jobForm.job_type} onChange={(e) => setJobForm({ ...jobForm, job_type: e.target.value })}
                        className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-700">
                        <option value="full_time">Full-time</option>
                        <option value="part_time">Part-time</option>
                        <option value="internship">Internship</option>
                        <option value="contract">Contract</option>
                      </select>
                    </div>
                    <div className="space-y-2.5 md:col-span-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Core Skills (Comma separated)</label>
                      <input required type="text" value={jobForm.required_skills}
                        onChange={(e) => setJobForm({ ...jobForm, required_skills: e.target.value })}
                        placeholder="Python, SQL, Machine Learning…"
                        className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all font-medium" />
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Detailed Description</label>
                    <textarea required rows={5} value={jobForm.description}
                      onChange={(e) => setJobForm({ ...jobForm, description: e.target.value })}
                      placeholder="Describe the role, responsibilities, and what you are looking for…"
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all resize-none font-medium" />
                  </div>

                  <div className="bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-100 rounded-2xl p-5 flex items-start gap-4">
                    <div className="bg-white p-2 rounded-xl text-indigo-600 shadow-sm mt-0.5"><Sparkles size={20} /></div>
                    <div>
                      <h4 className="text-sm font-bold text-indigo-900">AI Optimization Active</h4>
                      <p className="text-xs text-indigo-700/80 mt-1.5 font-medium leading-relaxed max-w-2xl">
                        Our Bidirectional Matching Engine will extract key terms from this description using Cosine Similarity to find the most accurate matches from our student pool.
                      </p>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-slate-100 flex justify-end">
                    <button type="submit" className="px-8 py-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-lg shadow-slate-900/20 transition-all flex items-center gap-2">
                      <Plus size={20} /> Publish & Start Matching
                    </button>
                  </div>
                </form>
              ) : (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="w-24 h-24 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mb-6 shadow-inner relative">
                    <div className="absolute inset-0 bg-emerald-400 rounded-full animate-ping opacity-20" />
                    <CheckCircle size={48} />
                  </div>
                  <h3 className="text-3xl font-black text-slate-900 mb-3">Requisition Submitted!</h3>
                  <p className="text-slate-500 max-w-md mx-auto font-medium text-lg">
                    Your job is under admin review. Once approved it will go live and matching will begin.
                  </p>
                  <div className="mt-10 flex items-center justify-center gap-3 bg-indigo-50 text-indigo-700 px-6 py-3 rounded-full border border-indigo-100 font-bold text-sm">
                    <Bot size={20} className="animate-pulse" />
                    <span>Pending admin approval…</span>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
