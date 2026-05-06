import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useAuth, getAvatarUrl } from "../context/AuthContext";
import { Link } from "react-router";
import { toast } from "sonner";
import api from "../lib/api";
import {
  UploadCloud, FileText, CheckCircle, Bot, Search, Briefcase,
  MapPin, Building, GraduationCap, Sparkles, ChevronDown, ChevronUp, Award
} from "lucide-react";

interface JobMatch {
  id: string;
  title: string;
  company: string;
  location: string;
  job_type: string;
  salary_min: number | null;
  salary_max: number | null;
  description: string;
  required_skills: string[];
  match_score: number;
  ai_reason: string | null;
  desc_snippet: string;
  status: string;
}

const JOB_TYPE_LABELS: Record<string, string> = {
  full_time: "Full-time",
  part_time: "Part-time",
  internship: "Internship",
  contract: "Contract",
};

export function StudentDashboard() {
  const { user } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [expandedJob, setExpandedJob] = useState<string | null>(null);
  const [jobs, setJobs] = useState<JobMatch[]>([]);
  const [extractedSkills, setExtractedSkills] = useState<string[]>([]);

  useEffect(() => {
    api.get<{ items: JobMatch[] }>("/api/v1/matches/jobs")
      .then((r) => {
        if (r.items.length > 0) {
          setJobs(r.items);
          setAnalysisComplete(true);
        }
      })
      .catch(() => {});
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    const f = e.target.files[0];
    setFile(f);
    setAnalyzing(true);
    setProgress(0);
    setAnalysisComplete(false);

    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 85) { clearInterval(interval); return 85; }
        return p + 5;
      });
    }, 120);

    try {
      const form = new FormData();
      form.append("resume", f);
      const result = await api.upload<{ resume_url: string; skills_extracted: string[] }>(
        "/api/v1/users/me/resume", form
      );
      clearInterval(interval);
      setProgress(100);
      setExtractedSkills(result.skills_extracted);

      const matches = await api.post<{ items: JobMatch[] }>("/api/v1/matches/recompute");
      setJobs(matches.items);
      setAnalysisComplete(true);
      toast.success("Resume analysed! Matches updated.");
    } catch (err: unknown) {
      clearInterval(interval);
      setAnalyzing(false);
      setProgress(0);
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleApply = async (jobId: string) => {
    try {
      await api.post("/api/v1/applications", { job_id: jobId });
      toast.success("Applied successfully!");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to apply");
    }
  };

  if (!user || user.role !== "student") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <GraduationCap size={64} className="text-slate-300 mb-6" />
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Student Access Required</h2>
        <p className="text-slate-500 max-w-md mb-8">Please log in as a student to access the matching engine.</p>
        <Link to="/login" className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold shadow-md transition-all">Go to Login</Link>
      </div>
    );
  }

  const salaryLabel = (job: JobMatch) => {
    if (job.salary_min && job.salary_max)
      return `$${(job.salary_min / 1000).toFixed(0)}k – $${(job.salary_max / 1000).toFixed(0)}k`;
    if (job.salary_min) return `From $${(job.salary_min / 1000).toFixed(0)}k`;
    return "Competitive";
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900">Student Hub</h1>
        <p className="text-slate-500 mt-2 text-lg">Your intelligent career launchpad. Upload, analyze, and match.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200/60">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                <img src={getAvatarUrl(user)} alt={user.name} className="w-full h-full object-cover" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">{user.name}</h2>
                <p className="text-sm text-indigo-600 font-medium flex items-center gap-1">
                  {user.is_verified ? <><CheckCircle size={14} /> Verified</> : "Pending verification"}
                </p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <GraduationCap className="text-slate-400 mt-0.5" size={18} />
                <div>
                  <p className="text-sm font-semibold text-slate-900">BS Computer Science</p>
                  <p className="text-xs text-slate-500">FAST-NU</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Award className="text-slate-400 mt-0.5" size={18} />
                <div>
                  <p className="text-sm font-semibold text-slate-900">CGPA: 3.52 / 4.0</p>
                  <p className="text-xs text-slate-500">Dean's List 2023</p>
                </div>
              </div>
            </div>
          </div>

          {/* Resume Upload */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200/60 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10"><FileText size={100} /></div>
            <div className="flex items-center gap-3 mb-6 relative z-10">
              <div className="bg-indigo-100 p-2.5 rounded-xl text-indigo-600 shadow-inner"><Bot size={22} /></div>
              <h2 className="text-lg font-bold text-slate-900">Resume Parser</h2>
            </div>

            <div className="relative z-10">
              {!file && !analyzing && !analysisComplete && (
                <motion.div whileHover={{ scale: 1.02 }}
                  className="border-2 border-dashed border-indigo-200 bg-indigo-50/30 rounded-2xl p-8 text-center hover:bg-indigo-50 transition-all cursor-pointer relative shadow-sm">
                  <input type="file" accept=".pdf,.doc,.docx"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    onChange={handleFileUpload} />
                  <UploadCloud className="mx-auto text-indigo-400 mb-3" size={36} />
                  <p className="text-indigo-900 font-semibold mb-1">Upload latest Resume</p>
                  <p className="text-indigo-600/60 text-xs">PDF, DOC, DOCX up to 5MB</p>
                </motion.div>
              )}

              {analyzing && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="bg-indigo-50 border border-indigo-100 rounded-2xl p-6 text-center space-y-4 shadow-inner">
                  <div className="relative w-16 h-16 mx-auto">
                    <div className="absolute inset-0 rounded-full border-4 border-indigo-200" />
                    <div className="absolute inset-0 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin" />
                    <Bot className="absolute inset-0 m-auto text-indigo-600" size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-indigo-900 text-sm">NLP Extraction Active</h3>
                    <p className="text-indigo-600/70 text-xs mt-1">
                      {progress < 30 ? "Reading document structure…" : progress < 70 ? "Identifying technical keywords…" : "Vectorizing skillset for matching…"}
                    </p>
                  </div>
                  <div className="w-full bg-indigo-200/50 rounded-full h-2 mt-4 overflow-hidden">
                    <motion.div className="bg-indigo-600 h-full rounded-full" style={{ width: `${progress}%` }} />
                  </div>
                  <p className="text-indigo-800 font-bold text-xs">{progress}% Complete</p>
                </motion.div>
              )}

              {analysisComplete && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  className="bg-emerald-50 border border-emerald-100 rounded-2xl p-6 space-y-4 relative overflow-hidden">
                  <div className="flex items-center justify-between border-b border-emerald-200/50 pb-4">
                    <div className="flex items-center gap-3 text-emerald-800">
                      <FileText size={20} className="text-emerald-500" />
                      <span className="font-semibold text-sm truncate max-w-[150px]">{file?.name ?? "Resume loaded"}</span>
                    </div>
                    <CheckCircle className="text-emerald-500 bg-white rounded-full" size={20} />
                  </div>
                  <div className="space-y-4 pt-2">
                    <div>
                      <h4 className="text-[10px] font-black text-emerald-800 uppercase tracking-widest mb-2 flex items-center gap-1">
                        <Sparkles size={12} /> Extracted Skills
                      </h4>
                      <div className="flex flex-wrap gap-1.5">
                        {(extractedSkills.length ? extractedSkills : jobs[0]?.required_skills ?? []).slice(0, 8).map((s) => (
                          <span key={s} className="px-2 py-1 bg-white text-emerald-700 text-xs font-bold rounded shadow-sm border border-emerald-100">{s}</span>
                        ))}
                      </div>
                    </div>
                    <button onClick={() => { setFile(null); setAnalysisComplete(false); setExtractedSkills([]); }}
                      className="w-full px-4 py-2.5 bg-white border border-emerald-200 hover:bg-emerald-600 hover:text-white hover:border-emerald-600 text-emerald-700 rounded-xl text-sm font-bold transition-all shadow-sm">
                      Update Resume
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Matches */}
        <div className="lg:col-span-8">
          <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200/60 min-h-[600px] flex flex-col">
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-4">
                <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-3 rounded-2xl text-white shadow-lg shadow-blue-200">
                  <Search size={24} />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-slate-900">Matched Opportunities</h2>
                  <p className="text-sm text-slate-500 font-medium">Ranked by AI Match Score</p>
                </div>
              </div>
              {analysisComplete && (
                <div className="hidden sm:flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-full border border-emerald-100">
                  <Sparkles size={16} className="text-emerald-500" />
                  <span className="text-sm font-bold">{jobs.length} Matches Found</span>
                </div>
              )}
            </div>

            {!analysisComplete ? (
              <div className="flex flex-col items-center justify-center flex-grow text-center space-y-5 px-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-slate-100 rounded-full blur-xl scale-150" />
                  <div className="bg-white border-2 border-slate-100 p-6 rounded-full text-slate-300 relative z-10 shadow-sm">
                    <Bot size={56} />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-800 mb-2">Awaiting Data</h3>
                  <p className="text-slate-500 max-w-sm mx-auto text-sm leading-relaxed">
                    Upload your resume to instantly parse your skills and find the most relevant opportunities.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4 flex-grow">
                <AnimatePresence mode="popLayout">
                  {jobs.map((job, index) => {
                    const isExpanded = expandedJob === job.id;
                    return (
                      <motion.div key={job.id} layout
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.08 }}
                        className={`group border rounded-2xl transition-all overflow-hidden ${isExpanded ? "border-indigo-300 shadow-md bg-indigo-50/10" : "border-slate-200 hover:border-indigo-200 hover:shadow-sm bg-white"}`}
                      >
                        <div className="p-5 sm:p-6 cursor-pointer relative" onClick={() => setExpandedJob(isExpanded ? null : job.id)}>
                          <div className="absolute top-0 right-0 h-full w-1.5 bg-gradient-to-b from-indigo-500 to-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                          <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                            <div className="flex-grow">
                              <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{job.title}</h3>
                              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2 text-sm text-slate-600 font-medium">
                                <span className="flex items-center gap-1"><Building size={16} className="text-slate-400" /> {job.company}</span>
                                <span className="flex items-center gap-1"><MapPin size={16} className="text-slate-400" /> {job.location}</span>
                                <span className="flex items-center gap-1"><Briefcase size={16} className="text-slate-400" /> {JOB_TYPE_LABELS[job.job_type] ?? job.job_type}</span>
                                <span className="hidden sm:inline-flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">{salaryLabel(job)}</span>
                              </div>
                            </div>
                            <div className="flex flex-row sm:flex-col items-center sm:items-end w-full sm:w-auto justify-between sm:justify-start pt-4 sm:pt-0 border-t sm:border-t-0 border-slate-100 mt-2 sm:mt-0">
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Match Score</span>
                                <div className={`text-2xl font-black tracking-tighter ${job.match_score >= 90 ? "text-emerald-500" : job.match_score >= 80 ? "text-indigo-500" : "text-amber-500"}`}>
                                  {job.match_score.toFixed(0)}%
                                </div>
                              </div>
                              <div className="flex items-center gap-2 mt-1 sm:mt-2 text-slate-400">
                                <span className="text-xs font-semibold">View Details</span>
                                {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                              </div>
                            </div>
                          </div>
                        </div>

                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                              className="border-t border-slate-100 bg-slate-50/50">
                              <div className="p-5 sm:p-6 space-y-6">
                                {job.ai_reason && (
                                  <div className="bg-indigo-50/80 rounded-xl p-4 border border-indigo-100 flex items-start gap-4">
                                    <div className="bg-white p-2 rounded-lg text-indigo-500 shadow-sm shrink-0 mt-1"><Sparkles size={20} /></div>
                                    <div>
                                      <h4 className="font-bold text-indigo-900 text-sm mb-1">Why you matched</h4>
                                      <p className="text-sm text-indigo-700 leading-relaxed">{job.ai_reason}</p>
                                    </div>
                                  </div>
                                )}
                                <div className="space-y-3">
                                  <h4 className="font-bold text-slate-800 text-sm">Role Description</h4>
                                  <p className="text-sm text-slate-600 leading-relaxed">{job.desc_snippet}</p>
                                </div>
                                <div className="space-y-3">
                                  <h4 className="font-bold text-slate-800 text-sm flex justify-between items-center">
                                    Required Skills <span className="text-xs font-normal text-slate-500">Green = matched</span>
                                  </h4>
                                  <div className="flex flex-wrap gap-2">
                                    {job.required_skills.map((skill, i) => (
                                      <span key={skill} className={`px-3 py-1.5 text-xs font-bold rounded-lg border ${i < 3 ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-white border-slate-200 text-slate-600"}`}>
                                        {skill} {i < 3 && <CheckCircle size={10} className="inline ml-1 mb-0.5" />}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                                <div className="pt-2">
                                  <button onClick={() => handleApply(job.id)}
                                    className="w-full sm:w-auto px-8 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-all shadow-md shadow-slate-900/20">
                                    Apply with 1-Click
                                  </button>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
