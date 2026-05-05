import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router";
import { 
  UploadCloud, 
  FileText, 
  CheckCircle, 
  Bot, 
  Search, 
  Briefcase,
  MapPin,
  Building,
  GraduationCap,
  Sparkles,
  ChevronDown,
  ChevronUp,
  UserCircle,
  Award
} from "lucide-react";

const MOCK_JOBS = [
  {
    id: 1,
    title: "Junior Software Engineer",
    company: "TechFlow Solutions",
    location: "Karachi, Pakistan",
    matchScore: 94,
    skills: ["React", "Python", "SQL", "Git", "REST APIs"],
    type: "Full-time",
    salary: "PKR 120k - 150k",
    aiReason: "Your strong academic background in React and Python matches perfectly with their core stack. Your final year project on REST APIs fills a key requirement.",
    descSnippet: "We are looking for a highly motivated fresh graduate to join our frontend team. You will be working primarily with React and Python backend services..."
  },
  {
    id: 2,
    title: "Data Analyst Trainee",
    company: "QuantCorp",
    location: "Lahore, Pakistan",
    matchScore: 82,
    skills: ["Python", "Data Viz", "Statistics", "SQL"],
    type: "Graduate Program",
    salary: "PKR 90k - 110k",
    aiReason: "Good match based on your Python and Statistics coursework, though you lack specific Data Visualization tool experience requested (Tableau/PowerBI).",
    descSnippet: "Start your career in data with our comprehensive 6-month trainee program. Focus on analyzing large datasets and generating actionable business insights..."
  },
  {
    id: 3,
    title: "Frontend Developer",
    company: "Creative Designs Inc.",
    location: "Remote",
    matchScore: 78,
    skills: ["React", "Tailwind CSS", "UX/UI", "Figma"],
    type: "Full-time",
    salary: "Competitive",
    aiReason: "Strong fit for React, but the employer heavily emphasizes UI/UX and Figma skills which are less prominent in your parsed resume.",
    descSnippet: "Join our fully remote team to build stunning web interfaces. You must have an eye for design and strong proficiency in modern CSS frameworks like Tailwind..."
  }
];

export function StudentDashboard() {
  const { user } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [expandedJob, setExpandedJob] = useState<number | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      simulateAnalysis();
    }
  };

  const simulateAnalysis = () => {
    setAnalyzing(true);
    setProgress(0);
    setAnalysisComplete(false);

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setAnalyzing(false);
          setAnalysisComplete(true);
          return 100;
        }
        return prev + 5;
      });
    }, 120);
  };

  if (!user || user.role !== 'student') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
         <GraduationCap size={64} className="text-slate-300 mb-6" />
         <h2 className="text-2xl font-bold text-slate-900 mb-2">Student Access Required</h2>
         <p className="text-slate-500 max-w-md mb-8">Please log in as a student to access the bidirectional matching engine and personalized job board.</p>
         <Link to="/login" className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold shadow-md transition-all">Go to Login</Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900">Student Hub</h1>
        <p className="text-slate-500 mt-2 text-lg">Your intelligent career launchpad. Upload, analyze, and match.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Profile & Resume Upload */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Static Student Profile Card */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200/60">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 border border-slate-200 overflow-hidden">
                <img src="https://images.unsplash.com/photo-1599566150163-29194dcaad36?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="Student Profile" className="w-full h-full object-cover" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">Usman Tariq</h2>
                <p className="text-sm text-indigo-600 font-medium flex items-center gap-1">
                  <CheckCircle size={14} /> Admin Verified
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <GraduationCap className="text-slate-400 mt-0.5" size={18} />
                <div>
                  <p className="text-sm font-semibold text-slate-900">BS Computer Science</p>
                  <p className="text-xs text-slate-500">FAST-NU (Class of 2024)</p>
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

          {/* Resume Upload Box */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200/60 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <FileText size={100} />
            </div>
            
            <div className="flex items-center gap-3 mb-6 relative z-10">
              <div className="bg-indigo-100 p-2.5 rounded-xl text-indigo-600 shadow-inner">
                <Bot size={22} />
              </div>
              <h2 className="text-lg font-bold text-slate-900">Resume Parser</h2>
            </div>

            <div className="relative z-10">
              {!file && !analyzing && !analysisComplete && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.02 }}
                  className="border-2 border-dashed border-indigo-200 bg-indigo-50/30 rounded-2xl p-8 text-center hover:bg-indigo-50 transition-all cursor-pointer relative shadow-sm"
                >
                  <input 
                    type="file" 
                    accept=".pdf,.doc,.docx" 
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    onChange={handleFileUpload}
                  />
                  <UploadCloud className="mx-auto text-indigo-400 mb-3" size={36} />
                  <p className="text-indigo-900 font-semibold mb-1">Upload latest Resume</p>
                  <p className="text-indigo-600/60 text-xs">PDF, DOC, DOCX up to 5MB</p>
                </motion.div>
              )}

              {analyzing && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-indigo-50 border border-indigo-100 rounded-2xl p-6 text-center space-y-4 shadow-inner"
                >
                  <div className="relative w-16 h-16 mx-auto">
                    <div className="absolute inset-0 rounded-full border-4 border-indigo-200"></div>
                    <div className="absolute inset-0 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin"></div>
                    <Bot className="absolute inset-0 m-auto text-indigo-600" size={24} />
                  </div>
                  
                  <div>
                    <h3 className="font-bold text-indigo-900 text-sm">NLP Extraction Active</h3>
                    <p className="text-indigo-600/70 text-xs mt-1">
                      {progress < 30 ? "Reading document structure..." : progress < 70 ? "Identifying technical keywords..." : "Vectorizing skillset for matching..."}
                    </p>
                  </div>
                  
                  <div className="w-full bg-indigo-200/50 rounded-full h-2 mt-4 overflow-hidden">
                    <motion.div 
                      className="bg-indigo-600 h-full rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ ease: "linear" }}
                    />
                  </div>
                  <p className="text-indigo-800 font-bold text-xs">{progress}% Complete</p>
                </motion.div>
              )}

              {analysisComplete && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-emerald-50 border border-emerald-100 rounded-2xl p-6 space-y-4 relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-100 rounded-bl-full -z-10 opacity-50"></div>
                  
                  <div className="flex items-center justify-between border-b border-emerald-200/50 pb-4">
                    <div className="flex items-center gap-3 text-emerald-800">
                      <FileText size={20} className="text-emerald-500" />
                      <span className="font-semibold text-sm truncate max-w-[150px]">{file?.name}</span>
                    </div>
                    <CheckCircle className="text-emerald-500 bg-white rounded-full" size={20} />
                  </div>
                  
                  <div className="space-y-4 pt-2">
                    <div>
                      <h4 className="text-[10px] font-black text-emerald-800 uppercase tracking-widest mb-2 flex items-center gap-1">
                        <Sparkles size={12} /> Extracted Vectors
                      </h4>
                      <div className="flex flex-wrap gap-1.5">
                        {["React", "Python", "SQL", "Git", "REST APIs", "Problem Solving"].map((skill) => (
                          <span key={skill} className="px-2 py-1 bg-white text-emerald-700 text-xs font-bold rounded shadow-sm border border-emerald-100">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => { setFile(null); setAnalysisComplete(false); setExpandedJob(null); }}
                      className="w-full px-4 py-2.5 bg-white border border-emerald-200 hover:bg-emerald-600 hover:text-white hover:border-emerald-600 text-emerald-700 rounded-xl text-sm font-bold transition-all shadow-sm"
                    >
                      Update Resume
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: AI Matched Jobs */}
        <div className="lg:col-span-8">
          <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200/60 min-h-[600px] flex flex-col">
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-4">
                <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-3 rounded-2xl text-white shadow-lg shadow-blue-200">
                  <Search size={24} />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-slate-900">Matched Opportunities</h2>
                  <p className="text-sm text-slate-500 font-medium">Ranked by Cosine Similarity</p>
                </div>
              </div>
              
              {analysisComplete && (
                <div className="hidden sm:flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-full border border-emerald-100">
                  <Sparkles size={16} className="text-emerald-500" />
                  <span className="text-sm font-bold">{MOCK_JOBS.length} Matches Found</span>
                </div>
              )}
            </div>

            {!analysisComplete ? (
              <div className="flex flex-col items-center justify-center flex-grow text-center space-y-5 px-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-slate-100 rounded-full blur-xl scale-150"></div>
                  <div className="bg-white border-2 border-slate-100 p-6 rounded-full text-slate-300 relative z-10 shadow-sm">
                    <Bot size={56} />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-800 mb-2">Awaiting Data</h3>
                  <p className="text-slate-500 max-w-sm mx-auto text-sm leading-relaxed">
                    Upload your resume on the left. The Bidirectional Matching Engine will instantly parse your skills and find the most mathematically probable hires.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4 flex-grow">
                <AnimatePresence mode="popLayout">
                  {MOCK_JOBS.map((job, index) => {
                    const isExpanded = expandedJob === job.id;
                    return (
                      <motion.div
                        key={job.id}
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1, duration: 0.4 }}
                        className={`group border rounded-2xl transition-all overflow-hidden ${
                          isExpanded 
                            ? 'border-indigo-300 shadow-md bg-indigo-50/10' 
                            : 'border-slate-200 hover:border-indigo-200 hover:shadow-sm bg-white'
                        }`}
                      >
                        {/* Job Card Header / Collapsed View */}
                        <div 
                          className="p-5 sm:p-6 cursor-pointer relative"
                          onClick={() => setExpandedJob(isExpanded ? null : job.id)}
                        >
                          <div className="absolute top-0 right-0 h-full w-1.5 bg-gradient-to-b from-indigo-500 to-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                          
                          <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                            <div className="flex-grow">
                              <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{job.title}</h3>
                              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2 text-sm text-slate-600 font-medium">
                                <span className="flex items-center gap-1">
                                  <Building size={16} className="text-slate-400" /> {job.company}
                                </span>
                                <span className="flex items-center gap-1">
                                  <MapPin size={16} className="text-slate-400" /> {job.location}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Briefcase size={16} className="text-slate-400" /> {job.type}
                                </span>
                                <span className="hidden sm:inline-flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                                  {job.salary}
                                </span>
                              </div>
                            </div>

                            <div className="flex flex-row sm:flex-col items-center sm:items-end w-full sm:w-auto justify-between sm:justify-start pt-4 sm:pt-0 border-t sm:border-t-0 border-slate-100 mt-2 sm:mt-0">
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Match Score</span>
                                <div className={`text-2xl font-black tracking-tighter ${
                                  job.matchScore >= 90 ? 'text-emerald-500' : 
                                  job.matchScore >= 80 ? 'text-indigo-500' : 'text-amber-500'
                                }`}>
                                  {job.matchScore}%
                                </div>
                              </div>
                              <div className="flex items-center gap-2 mt-1 sm:mt-2 text-slate-400">
                                <span className="text-xs font-semibold">View Details</span>
                                {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Expanded Content */}
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="border-t border-slate-100 bg-slate-50/50"
                            >
                              <div className="p-5 sm:p-6 space-y-6">
                                
                                {/* AI Insights Box */}
                                <div className="bg-indigo-50/80 rounded-xl p-4 border border-indigo-100 flex items-start gap-4">
                                  <div className="bg-white p-2 rounded-lg text-indigo-500 shadow-sm shrink-0 mt-1">
                                    <Sparkles size={20} />
                                  </div>
                                  <div>
                                    <h4 className="font-bold text-indigo-900 text-sm mb-1">Why you matched</h4>
                                    <p className="text-sm text-indigo-700 leading-relaxed">{job.aiReason}</p>
                                  </div>
                                </div>

                                <div className="space-y-3">
                                  <h4 className="font-bold text-slate-800 text-sm">Role Description</h4>
                                  <p className="text-sm text-slate-600 leading-relaxed">{job.descSnippet}</p>
                                </div>

                                <div className="space-y-3">
                                  <h4 className="font-bold text-slate-800 text-sm flex justify-between items-center">
                                    Required Skills
                                    <span className="text-xs font-normal text-slate-500">Green indicates match</span>
                                  </h4>
                                  <div className="flex flex-wrap gap-2">
                                    {job.skills.map((skill, i) => (
                                      <span key={skill} className={`px-3 py-1.5 text-xs font-bold rounded-lg border ${
                                        i < 3 ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-white border-slate-200 text-slate-600'
                                      }`}>
                                        {skill} {i < 3 && <CheckCircle size={10} className="inline ml-1 mb-0.5" />}
                                      </span>
                                    ))}
                                  </div>
                                </div>

                                <div className="pt-2">
                                  <button className="w-full sm:w-auto px-8 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-all shadow-md shadow-slate-900/20">
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
