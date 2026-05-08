import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { ArrowRight, Bot, CheckCircle2, Building, GraduationCap, Briefcase, Sparkles, BarChart3, Zap, ShieldCheck } from "lucide-react";
import { Link } from "react-router";
import api from "../lib/api";

interface PublicStats {
  verified_students: number;
  verified_employers: number;
  active_jobs: number;
  total_hires: number;
}

function formatStat(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, "")}k+`;
  if (n === 0) return "—";
  return `${n}+`;
}

export function Home() {
  const [stats, setStats] = useState<PublicStats | null>(null);

  useEffect(() => {
    api.get<PublicStats>("/api/v1/content/stats").then(setStats).catch(() => {});
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
  };

  return (
    <div className="flex flex-col w-full bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-slate-900 text-white min-h-[90vh] flex items-center pt-10 pb-20 lg:pt-0">
        {/* Abstract animated background */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] rounded-full bg-indigo-600/20 blur-[120px] mix-blend-screen animate-pulse" />
          <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-emerald-600/20 blur-[100px] mix-blend-screen" style={{ animation: "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite" }} />
          
          {/* Subtle grid pattern overlay */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMSIgZmlsbD0icmdiYSgyNTUsIDI1NSwgMjU1LCAwLjA1KSIvPjwvc3ZnPg==')] opacity-50 z-0"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full flex flex-col lg:flex-row items-center gap-16">
          <motion.div 
            className="w-full lg:w-1/2 space-y-8 text-center lg:text-left"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
          >
            <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800/80 border border-slate-700/50 text-indigo-300 text-sm font-semibold backdrop-blur-md shadow-lg shadow-indigo-900/20">
              <Sparkles size={16} className="text-amber-400" />
              <span>Semantic AI Matching • Verified Profiles</span>
            </motion.div>
            
            <motion.h1 variants={itemVariants} className="text-5xl lg:text-7xl font-black tracking-tight leading-[1.1]">
              Zero Guesswork. <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-emerald-400">
                Pure Precision.
              </span>
            </motion.h1>
            
            <motion.p variants={itemVariants} className="text-lg lg:text-xl text-slate-300 max-w-xl mx-auto lg:mx-0 leading-relaxed font-light">
              The AI-powered portal exclusively for fresh graduates. We parse your resume, build a semantic profile, and bidirectionally match you with employers searching for your exact skills.
            </motion.p>
            
            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row flex-wrap gap-4 justify-center lg:justify-start pt-4">
              <Link to="/student" className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-bold rounded-2xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.25)] hover:shadow-[0_0_35px_rgba(16,185,129,0.4)] overflow-hidden">
                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-emerald-400 to-emerald-300 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <GraduationCap size={22} className="relative z-10" />
                <span className="relative z-10 text-lg">I'm a Student</span>
                <ArrowRight size={18} className="relative z-10 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/employer" className="group inline-flex items-center justify-center gap-3 px-8 py-4 bg-slate-800/80 hover:bg-slate-700 text-white font-semibold rounded-2xl border border-slate-600 backdrop-blur-sm transition-all hover:border-slate-500">
                <Building size={22} className="text-indigo-400 group-hover:text-indigo-300" />
                <span className="text-lg">Hire Talent</span>
              </Link>
            </motion.div>

            <motion.div variants={itemVariants} className="pt-8 flex items-center justify-center lg:justify-start gap-6 text-sm text-slate-400 font-medium">
              <div className="flex items-center gap-2">
                <ShieldCheck size={18} className="text-emerald-500" /> Admin Verified Profiles
              </div>
              <div className="flex items-center gap-2">
                <Bot size={18} className="text-indigo-500" /> Semantic AI Matching
              </div>
            </motion.div>
          </motion.div>

          {/* Hero Visuals */}
          <motion.div 
            className="w-full lg:w-1/2 relative hidden md:block"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
          >
            <div className="relative z-10">
              {/* Main Image */}
              <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-indigo-900/40 aspect-[4/3] border border-slate-700/50 group">
                <img 
                  src="https://images.unsplash.com/photo-1559136555-9303baea8ebd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBicmlnaHQlMjBvZmZpY2UlMjB0ZWFtJTIwd29ya2luZ3xlbnwxfHx8fDE3NzcxMDE0MzB8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral" 
                  alt="Modern tech team" 
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/20 to-transparent opacity-80"></div>
                
                {/* Floating UI Elements matching the product feel */}
                <motion.div 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.8, duration: 0.6 }}
                  className="absolute bottom-6 left-6 right-6 bg-slate-800/70 backdrop-blur-xl border border-slate-600/50 p-5 rounded-2xl shadow-xl"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                        <CheckCircle2 size={24} className="text-emerald-400" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-white font-bold text-lg">94% AI Match</p>
                          <span className="bg-indigo-500 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase">Highest</span>
                        </div>
                        <p className="text-slate-300 text-sm">Frontend Developer • Creative Designs Inc.</p>
                      </div>
                    </div>
                    <div className="hidden sm:flex flex-col items-end">
                      <p className="text-xs text-slate-400 mb-1">Keywords matched</p>
                      <div className="flex gap-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                        <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                        <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                        <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                        <span className="w-2 h-2 rounded-full bg-slate-600"></span>
                      </div>
                    </div>
                  </div>
                </motion.div>
                
                {/* Floating Badge */}
                <motion.div
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 1.2, duration: 0.5 }}
                  className="absolute top-8 right-[-20px] bg-white text-slate-900 p-3 rounded-xl shadow-2xl shadow-black/20 flex items-center gap-3 border border-slate-100 rotate-3"
                >
                  <div className="bg-indigo-100 p-2 rounded-lg text-indigo-600">
                    <Bot size={20} />
                  </div>
                  <div>
                    <p className="font-bold text-sm">Resume Parsed</p>
                    <p className="text-xs text-slate-500">24 skills extracted</p>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-white border-b border-slate-100 relative z-20 -mt-8 mx-4 sm:mx-6 lg:mx-8 rounded-3xl shadow-xl shadow-slate-200/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-slate-100 text-center">
            {[
              { label: "Verified Students", value: stats ? formatStat(stats.verified_students) : "—" },
              { label: "Verified Employers", value: stats ? formatStat(stats.verified_employers) : "—" },
              { label: "Active Jobs", value: stats ? formatStat(stats.active_jobs) : "—" },
              { label: "Successful Hires", value: stats ? formatStat(stats.total_hires) : "—" }
            ].map((stat, i) => (
              <div key={i} className="px-4">
                <p className="text-3xl font-black text-slate-900 mb-1">{stat.value}</p>
                <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-32 bg-slate-50 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-indigo-50/50 to-transparent"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-4 mb-20">
            <h2 className="text-indigo-600 font-bold tracking-wide uppercase text-sm">Bidirectional Engine</h2>
            <h3 className="text-4xl md:text-5xl font-extrabold text-slate-900">How GradMatch AI Works</h3>
            <p className="text-lg text-slate-600">Our AI engine parses resumes, builds semantic embeddings from your skills and experience, and automatically ranks candidates against job requirements using cosine similarity.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              {
                icon: <Bot size={36} />,
                title: "1. AI Resume Parser",
                description: "Upload a PDF or DOCX. Our engine extracts structured data: education, GPA, soft/hard skills, and project context instantly.",
                color: "text-blue-600",
                bg: "bg-blue-100",
                border: "border-blue-200"
              },
              {
                icon: <Zap size={36} />,
                title: "2. Semantic Vector Matching",
                description: "We use sentence-transformer embeddings and cosine similarity to compare candidate profiles against job descriptions, capturing meaning beyond keyword overlap.",
                color: "text-indigo-600",
                bg: "bg-indigo-100",
                border: "border-indigo-200"
              },
              {
                icon: <BarChart3 size={36} />,
                title: "3. Quantified Scoring",
                description: "Employers see a dashboard of candidates ranked 0-100%. Students see jobs they are statistically most likely to get hired for.",
                color: "text-emerald-600",
                bg: "bg-emerald-100",
                border: "border-emerald-200"
              }
            ].map((step, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ delay: i * 0.2, duration: 0.6 }}
                className={`bg-white p-10 rounded-3xl shadow-sm border ${step.border} hover:shadow-xl hover:-translate-y-2 transition-all duration-300 relative group`}
              >
                <div className={`w-16 h-16 rounded-2xl ${step.bg} ${step.color} flex items-center justify-center mb-6 shadow-inner`}>
                  {step.icon}
                </div>
                <h4 className="text-2xl font-bold text-slate-900 mb-4">{step.title}</h4>
                <p className="text-slate-600 leading-relaxed">{step.description}</p>
                
                <div className="mt-8 flex items-center gap-2 text-sm font-semibold text-slate-400 group-hover:text-indigo-600 transition-colors">
                  Learn more <ArrowRight size={16} />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust & Verification Section */}
      <section className="py-24 bg-white relative overflow-hidden">
        <div className="absolute inset-0 bg-slate-50/50"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="w-full lg:w-1/2 order-2 lg:order-1 relative">
              {/* Complex overlapping composition instead of a plain image */}
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-emerald-100 to-indigo-100 rounded-3xl blur-2xl opacity-50"></div>
                <div className="relative bg-white p-4 rounded-[2rem] shadow-2xl shadow-slate-200/50 border border-slate-100">
                  <img 
                    src="https://images.unsplash.com/photo-1758518729685-f88df7890776?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMHRlYW0lMjBjb2xsYWJvcmF0aW9uJTIwbW9kZXJuJTIwb2ZmaWNlfGVufDF8fHx8MTc3NzEwMjQxOHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral" 
                    alt="Team Collaboration" 
                    className="w-full h-auto aspect-square object-cover rounded-2xl" 
                  />
                  
                  {/* Overlay Verification Card */}
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="absolute -right-6 -bottom-6 bg-white p-5 rounded-2xl shadow-xl border border-slate-100 w-64"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="bg-emerald-100 p-2 rounded-full text-emerald-600">
                        <ShieldCheck size={20} />
                      </div>
                      <span className="font-bold text-slate-900 text-sm">Security Layer</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-500">Manual Vetting</span>
                        <span className="text-emerald-600 font-bold">100%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-1.5">
                        <div className="bg-emerald-500 h-1.5 rounded-full w-full"></div>
                      </div>
                      <p className="text-[10px] text-slate-400 leading-tight mt-2">
                        All employer accounts are actively monitored via the Admin Console.
                      </p>
                    </div>
                  </motion.div>
                  
                  {/* Overlay AI Badge */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 }}
                    className="absolute -left-6 top-12 bg-slate-900 text-white p-4 rounded-2xl shadow-xl border border-slate-700 flex items-center gap-3"
                  >
                    <Bot className="text-indigo-400" size={24} />
                    <div>
                      <p className="text-xs text-slate-400 uppercase tracking-widest font-bold">AI Engine</p>
                      <p className="font-bold text-sm">Semantic Matching</p>
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>
            <div className="w-full lg:w-1/2 order-1 lg:order-2 space-y-8">
              <div>
                <h2 className="text-4xl font-extrabold text-slate-900 mb-4">Built on Trust, Powered by AI.</h2>
                <p className="text-lg text-slate-600 leading-relaxed">
                  GradMatch isn't just another job board. We strictly manage the ecosystem through an active Admin Console, ensuring that only verified entities interact. Your data remains secure while our algorithms find your perfect fit.
                </p>
              </div>
              <ul className="space-y-5">
                {[
                  "Eliminate the 'spray and pray' application process.",
                  "Give fresh graduates a fair, quantified chance based on actual skills.",
                  "Reduce employer screening time from weeks to literally seconds."
                ].map((point, i) => (
                  <li key={i} className="flex items-start gap-4 bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                    <div className="bg-indigo-50 p-2 rounded-lg text-indigo-600 shrink-0">
                      <CheckCircle2 size={20} />
                    </div>
                    <span className="text-slate-700 font-medium pt-1">{point}</span>
                  </li>
                ))}
              </ul>
              <div className="pt-4">
                <Link to="/admin" className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-all shadow-md group">
                  Explore the Admin layer <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
