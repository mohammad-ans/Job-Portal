import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router";
import { 
  ShieldCheck, 
  Check, 
  X, 
  Activity,
  AlertTriangle,
  Building,
  GraduationCap,
  Database,
  Users,
  Briefcase,
  Bot
} from "lucide-react";

const MOCK_PENDING_APPROVALS = [
  {
    id: 1,
    type: 'company',
    name: "Quantum Analytics",
    details: "Tech Startup • Registration Doc #4421",
    date: "10 mins ago",
    aiConfidence: 98,
    flags: 0
  },
  {
    id: 2,
    type: 'job',
    name: "Data Scientist (Fresh)",
    details: "Posted by Nexus Tech • Check JD compliance",
    date: "45 mins ago",
    aiConfidence: 100,
    flags: 0
  },
  {
    id: 3,
    type: 'student_verification',
    name: "Hassan Ali - BSCS",
    details: "FAST-NU • Uploaded Academic Transcript",
    date: "2 hours ago",
    aiConfidence: 65,
    flags: 1,
    flagReason: "Transcript image blur detected"
  }
];

export function AdminConsole() {
  const { user } = useAuth();
  const [approvals, setApprovals] = useState(MOCK_PENDING_APPROVALS);

  const handleAction = (id: number) => {
    setApprovals(prev => prev.filter(item => item.id !== id));
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
         <ShieldCheck size={64} className="text-slate-300 mb-6" />
         <h2 className="text-2xl font-bold text-slate-900 mb-2">Admin Access Required</h2>
         <p className="text-slate-500 max-w-md mb-8">System overview and moderation features are restricted to verified administrators.</p>
         <Link to="/login" className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-xl font-bold shadow-md transition-all">Admin Login</Link>
      </div>
    );
  }

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
        {[
          { label: "Verified Students", value: "12,504", icon: GraduationCap, color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-100" },
          { label: "Verified Employers", value: "842", icon: Building, color: "text-indigo-600", bg: "bg-indigo-50", border: "border-indigo-100" },
          { label: "Active Job Listings", value: "3,190", icon: Briefcase, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100" },
          { label: "Total Matches Made", value: "45.2k", icon: Database, color: "text-purple-600", bg: "bg-purple-50", border: "border-purple-100" }
        ].map((stat, i) => (
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
              <p className="text-xl font-bold text-slate-700">Inbox Zero!</p>
              <p className="text-sm mt-2 max-w-xs">All entities have been verified. The ecosystem is clean and secure.</p>
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
                        item.type === 'company' ? 'bg-blue-100 text-blue-600' :
                        item.type === 'job' ? 'bg-indigo-100 text-indigo-600' :
                        'bg-emerald-100 text-emerald-600'
                      }`}>
                        {item.type === 'company' && <Building size={24} />}
                        {item.type === 'job' && <Briefcase size={24} />}
                        {item.type === 'student_verification' && <GraduationCap size={24} />}
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
                        <p className="text-slate-600 text-sm font-medium">{item.details}</p>
                        
                        {item.flagReason && (
                          <p className="text-xs text-rose-600 mt-2 font-medium flex items-center gap-1">
                            <AlertTriangle size={12} /> {item.flagReason}
                          </p>
                        )}
                        
                        <div className="flex items-center gap-3 mt-3">
                          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider bg-slate-100 px-2 py-1 rounded">
                            {item.date}
                          </span>
                          <span className="flex items-center gap-1 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                            <Bot size={12} /> AI Confidence: 
                            <span className={item.aiConfidence > 90 ? 'text-emerald-500' : 'text-amber-500'}>
                              {item.aiConfidence}%
                            </span>
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                      <button 
                        onClick={() => handleAction(item.id)}
                        className="flex-1 sm:flex-none flex items-center justify-center p-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors font-medium border border-transparent hover:border-rose-200"
                        title="Reject"
                      >
                        <X size={20} />
                      </button>
                      <button 
                        onClick={() => handleAction(item.id)}
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
            {[
              { time: "14:23:01", msg: "NLP Engine vectorized new JD (ID: #4092)", type: "info" },
              { time: "14:22:45", msg: "Cron job: Matched 42 students to Job #4091", type: "success" },
              { time: "14:20:12", msg: "Auth anomaly detected from IP 192.168.x.x", type: "warn" },
              { time: "14:15:30", msg: "User profile #9928 uploaded new resume", type: "info" },
              { time: "14:10:05", msg: "Database backup completed successfully", type: "success" },
              { time: "14:05:22", msg: "New employer registered: TechFlow Solutions", type: "info" },
              { time: "13:50:11", msg: "API Rate limit approaching for /nlp-parse", type: "warn" },
            ].map((log, i) => (
              <div key={i} className="flex gap-3 items-start border-l-2 border-slate-800 pl-3">
                <span className="text-slate-500 shrink-0">{log.time}</span>
                <span className={`${
                  log.type === 'success' ? 'text-emerald-400' :
                  log.type === 'warn' ? 'text-amber-400' : 'text-slate-300'
                }`}>
                  {log.msg}
                </span>
              </div>
            ))}
          </div>
          
          <div className="mt-6 pt-6 border-t border-slate-800 text-[10px] text-slate-500 text-center uppercase tracking-widest font-bold">
            End of Log
          </div>
        </div>

      </div>
    </div>
  );
}
