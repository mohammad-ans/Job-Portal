import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router";
import { 
  Building, 
  Plus, 
  Users, 
  TrendingUp,
  Briefcase,
  Bot,
  Filter,
  CheckCircle,
  XCircle,
  Search,
  Sparkles,
  MapPin,
  ChevronRight,
  ChevronDown
} from "lucide-react";

const MOCK_APPLICANTS = [
  {
    id: 1,
    name: "Ali Khan",
    university: "NUST",
    gpa: "3.8",
    matchScore: 98,
    status: "Pending",
    skills: ["React", "Python", "SQL", "Docker", "AWS"],
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    aiSummary: "Exceptional match. Candidate's final year project on cloud-native applications directly aligns with our required AWS and Docker experience.",
    resumePreview: "B.S. Software Engineering • Dean's Honor Roll • Built a scalable microservices architecture for a local startup using Node and Python..."
  },
  {
    id: 2,
    name: "Sara Ahmed",
    university: "LUMS",
    gpa: "3.9",
    matchScore: 94,
    status: "Pending",
    skills: ["Python", "Data Analysis", "Machine Learning", "Pandas"],
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    aiSummary: "Strong theoretical background in ML. High GPA indicates excellent learning capacity, though lacks direct industry internship experience.",
    resumePreview: "B.S. Computer Science • Focus on Data Science • Published research paper on predictive modeling using Pandas and Scikit-learn..."
  },
  {
    id: 3,
    name: "Usman Tariq",
    university: "FAST-NU",
    gpa: "3.5",
    matchScore: 78,
    status: "Pending",
    skills: ["Java", "Spring Boot", "MySQL", "React"],
    avatar: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    aiSummary: "Partial match. Strong backend skills (Java/Spring) but the role requires more frontend-heavy (React) focus which is secondary on their profile.",
    resumePreview: "B.S. Computer Science • Developed enterprise management system in Java Spring Boot. Minor contributions to frontend in React..."
  }
];

export function EmployerDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'applicants' | 'post'>('applicants');
  const [showPostingSuccess, setShowPostingSuccess] = useState(false);
  const [expandedApplicant, setExpandedApplicant] = useState<number | null>(null);

  const handlePostJob = (e: React.FormEvent) => {
    e.preventDefault();
    setShowPostingSuccess(true);
    setTimeout(() => {
      setShowPostingSuccess(false);
      setActiveTab('applicants');
    }, 3000);
  };

  if (!user || user.role !== 'employer') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
         <Building size={64} className="text-slate-300 mb-6" />
         <h2 className="text-2xl font-bold text-slate-900 mb-2">Employer Access Required</h2>
         <p className="text-slate-500 max-w-md mb-8">Please log in as an employer to access the recruitment suite and post new jobs.</p>
         <Link to="/login" className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold shadow-md transition-all">Go to Login</Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">Employer Suite</h1>
          <p className="text-slate-500 mt-2 text-lg">Manage job postings and review AI-ranked candidates instantly.</p>
        </div>
        <div className="bg-slate-100/80 p-1.5 rounded-2xl flex shadow-inner border border-slate-200/50">
          <button
            onClick={() => setActiveTab('applicants')}
            className={`px-6 py-2.5 text-sm font-bold rounded-xl transition-all ${
              activeTab === 'applicants' 
                ? 'bg-white text-indigo-700 shadow-sm border border-slate-200/50' 
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Review Candidates
          </button>
          <button
            onClick={() => setActiveTab('post')}
            className={`px-6 py-2.5 text-sm font-bold rounded-xl transition-all ${
              activeTab === 'post' 
                ? 'bg-white text-indigo-700 shadow-sm border border-slate-200/50' 
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Post New Role
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Sidebar Analytics */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200/60 flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-slate-800 to-slate-900 text-white rounded-2xl flex items-center justify-center mb-5 shadow-lg shadow-slate-200">
              <Building size={36} />
            </div>
            <h2 className="text-xl font-bold text-slate-900">TechFlow Solutions</h2>
            <span className="mt-1 px-3 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-full uppercase tracking-wider">
              Enterprise Plan
            </span>
            
            <div className="mt-8 w-full pt-6 border-t border-slate-100 grid grid-cols-2 gap-4">
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                <p className="text-3xl font-black text-slate-800 mb-1">12</p>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Active Jobs</p>
              </div>
              <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-100">
                <p className="text-3xl font-black text-emerald-600 mb-1">45</p>
                <p className="text-[10px] text-emerald-600/80 font-bold uppercase tracking-wider">High Matches</p>
              </div>
            </div>
          </div>

          <div className="bg-indigo-600 p-8 rounded-3xl shadow-lg shadow-indigo-200 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500 rounded-full blur-3xl opacity-50 -mr-10 -mt-10"></div>
            
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

        {/* Main Content Area */}
        <div className="lg:col-span-8">
          {activeTab === 'applicants' && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-3xl shadow-sm border border-slate-200/60 overflow-hidden min-h-[600px] flex flex-col"
            >
              <div className="p-6 sm:p-8 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-50/50">
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900">Junior Software Engineer</h2>
                  <p className="text-sm text-slate-500 mt-1 font-medium">Viewing Top AI-Ranked Candidates</p>
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <div className="relative flex-grow sm:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      type="text" 
                      placeholder="Search skills..." 
                      className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
                    />
                  </div>
                  <button className="p-2.5 border border-slate-200 rounded-xl text-slate-500 hover:bg-slate-50 bg-white shadow-sm">
                    <Filter size={20} />
                  </button>
                </div>
              </div>

              <div className="divide-y divide-slate-100 flex-grow">
                {MOCK_APPLICANTS.map((applicant, index) => {
                  const isExpanded = expandedApplicant === applicant.id;
                  return (
                    <motion.div 
                      key={applicant.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className={`transition-colors group ${isExpanded ? 'bg-indigo-50/20' : 'hover:bg-slate-50'}`}
                    >
                      {/* Candidate Header Summary */}
                      <div 
                        className="p-6 sm:p-8 cursor-pointer flex flex-col sm:flex-row gap-6 items-start sm:items-center justify-between"
                        onClick={() => setExpandedApplicant(isExpanded ? null : applicant.id)}
                      >
                        <div className="flex items-center gap-5">
                          <img src={applicant.avatar} alt={applicant.name} className="w-16 h-16 rounded-2xl object-cover border border-slate-200 shadow-sm" />
                          <div>
                            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                              {applicant.name}
                              {applicant.matchScore >= 90 && (
                                <span className="bg-emerald-100 text-emerald-700 text-[10px] uppercase font-black tracking-wider px-2 py-0.5 rounded flex items-center gap-1">
                                  <Sparkles size={10} /> Top Match
                                </span>
                              )}
                            </h3>
                            <div className="text-sm font-medium text-slate-500 mt-1 flex items-center gap-3">
                              <span>{applicant.university}</span>
                              <span className="w-1.5 h-1.5 bg-slate-300 rounded-full"></span>
                              <span>GPA: <strong className="text-slate-700">{applicant.gpa}</strong></span>
                            </div>
                            <div className="flex flex-wrap gap-1.5 mt-3">
                              {applicant.skills.map(skill => (
                                <span key={skill} className="px-2 py-1 bg-white border border-slate-200 text-slate-600 text-[11px] font-bold rounded-md shadow-sm">
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-row sm:flex-col items-center sm:items-end gap-6 sm:gap-2 w-full sm:w-auto justify-between border-t sm:border-t-0 pt-4 sm:pt-0 mt-4 sm:mt-0">
                          <div className="text-center sm:text-right">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">AI Match Score</p>
                            <div className="flex items-center justify-center sm:justify-end gap-1.5">
                              <Bot className={applicant.matchScore >= 90 ? 'text-emerald-500' : 'text-indigo-500'} size={22} />
                              <span className={`text-3xl font-black ${
                                applicant.matchScore >= 90 ? 'text-emerald-500' : 'text-indigo-500'
                              }`}>
                                {applicant.matchScore}%
                              </span>
                            </div>
                          </div>
                          
                          <div className="text-slate-400 flex items-center gap-1 text-sm font-semibold mt-2">
                            {isExpanded ? 'Hide Details' : 'View Full Profile'}
                            {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                          </div>
                        </div>
                      </div>

                      {/* Expanded Details Section */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="border-t border-slate-100 bg-white px-6 sm:px-8 pb-8 pt-4 overflow-hidden"
                          >
                            <div className="space-y-6">
                              
                              <div className="bg-indigo-50/50 rounded-2xl p-5 border border-indigo-100/50">
                                <h4 className="flex items-center gap-2 text-indigo-900 font-bold text-sm mb-2">
                                  <Bot size={16} className="text-indigo-500" /> AI Executive Summary
                                </h4>
                                <p className="text-sm text-indigo-800/80 leading-relaxed font-medium">
                                  {applicant.aiSummary}
                                </p>
                              </div>

                              <div>
                                <h4 className="font-bold text-slate-800 text-sm mb-2">Resume Snippet</h4>
                                <p className="text-sm text-slate-600 leading-relaxed p-4 bg-slate-50 border border-slate-100 rounded-xl italic">
                                  "{applicant.resumePreview}"
                                </p>
                              </div>

                              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                                <button className="px-5 py-2.5 text-slate-600 hover:bg-slate-100 font-bold text-sm rounded-xl transition-colors">
                                  Reject
                                </button>
                                <button className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm rounded-xl transition-colors shadow-md">
                                  Schedule Interview
                                </button>
                              </div>

                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {activeTab === 'post' && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-3xl shadow-sm border border-slate-200/60 p-8 sm:p-10"
            >
              <div className="flex items-start gap-4 mb-10">
                <div className="bg-indigo-100 p-3 rounded-2xl text-indigo-600 shadow-inner">
                  <Plus size={28} />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-slate-900">Create New Requisition</h2>
                  <p className="text-slate-500 font-medium mt-1">Our NLP engine will analyze your description to find perfect matches automatically.</p>
                </div>
              </div>

              {!showPostingSuccess ? (
                <form onSubmit={handlePostJob} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Job Title</label>
                      <input required type="text" placeholder="e.g. Data Scientist (Entry Level)" className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all font-medium" />
                    </div>
                    <div className="space-y-2.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Location</label>
                      <div className="relative">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input required type="text" placeholder="e.g. Remote, Lahore" className="w-full pl-11 pr-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all font-medium" />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Job Type</label>
                      <select className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-700">
                        <option>Full-time</option>
                        <option>Part-time</option>
                        <option>Internship</option>
                        <option>Graduate Trainee</option>
                      </select>
                    </div>
                    <div className="space-y-2.5 md:col-span-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Core Tech Stack / Skills (Comma separated)</label>
                      <input required type="text" placeholder="Python, SQL, Machine Learning..." className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all font-medium" />
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Detailed Description</label>
                    <textarea required rows={5} placeholder="Describe the role, responsibilities, and what you are looking for..." className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all resize-none font-medium"></textarea>
                  </div>

                  <div className="bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-100 rounded-2xl p-5 flex items-start gap-4">
                    <div className="bg-white p-2 rounded-xl text-indigo-600 shadow-sm mt-0.5">
                      <Sparkles size={20} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-indigo-900">AI Optimization Active</h4>
                      <p className="text-xs text-indigo-700/80 mt-1.5 font-medium leading-relaxed max-w-2xl">
                        Our Bidirectional Matching Engine will extract key terms from this description using Cosine Similarity to find the most accurate matches from our 12,000+ student pool.
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
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center py-20 text-center"
                >
                  <div className="w-24 h-24 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mb-6 shadow-inner relative">
                    <div className="absolute inset-0 bg-emerald-400 rounded-full animate-ping opacity-20"></div>
                    <CheckCircle size={48} />
                  </div>
                  <h3 className="text-3xl font-black text-slate-900 mb-3">Requisition Live!</h3>
                  <p className="text-slate-500 max-w-md mx-auto font-medium text-lg">
                    The NLP Engine has vectorized your requirements and is scanning the talent pool.
                  </p>
                  
                  <div className="mt-10 flex items-center justify-center gap-3 bg-indigo-50 text-indigo-700 px-6 py-3 rounded-full border border-indigo-100 font-bold text-sm">
                    <Bot size={20} className="animate-pulse" />
                    <span>Analyzing 12,500+ student profiles...</span>
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
