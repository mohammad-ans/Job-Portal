import { useState } from "react";
import { motion } from "motion/react";
import { useNavigate, Link } from "react-router";
import { useAuth } from "../context/AuthContext";
import { Briefcase, GraduationCap, ShieldCheck, Mail, Lock, User, Building, ArrowRight } from "lucide-react";

export function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleDemoLogin = (role: "student" | "employer" | "admin") => {
    login(role);
    if (role === 'student') navigate('/student');
    else if (role === 'employer') navigate('/employer');
    else navigate('/admin');
  };

  const handleFormLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Fallback to student login for generic demo purposes
    handleDemoLogin('student');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="inline-flex bg-indigo-600 p-3 rounded-2xl text-white shadow-lg shadow-indigo-200 mb-6">
            <Lock size={32} />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Welcome Back</h1>
          <p className="text-slate-500">Log in to access your personalized dashboard.</p>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xl shadow-slate-200/50"
        >
          {/* Quick Demo Logins */}
          <div className="mb-8">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 text-center">Fast Demo Logins</p>
            <div className="grid grid-cols-3 gap-3">
              <button onClick={() => handleDemoLogin('student')} className="flex flex-col items-center justify-center p-3 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-xl transition-colors border border-blue-100">
                <GraduationCap size={24} className="mb-2" />
                <span className="text-xs font-bold">Student</span>
              </button>
              <button onClick={() => handleDemoLogin('employer')} className="flex flex-col items-center justify-center p-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-xl transition-colors border border-indigo-100">
                <Building size={24} className="mb-2" />
                <span className="text-xs font-bold">Employer</span>
              </button>
              <button onClick={() => handleDemoLogin('admin')} className="flex flex-col items-center justify-center p-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded-xl transition-colors border border-emerald-100">
                <ShieldCheck size={24} className="mb-2" />
                <span className="text-xs font-bold">Admin</span>
              </button>
            </div>
          </div>

          <div className="relative flex items-center py-5">
            <div className="flex-grow border-t border-slate-200"></div>
            <span className="flex-shrink-0 mx-4 text-slate-400 text-sm font-medium">Or continue with email</span>
            <div className="flex-grow border-t border-slate-200"></div>
          </div>

          <form onSubmit={handleFormLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium" placeholder="you@example.com" />
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-bold text-slate-700">Password</label>
                <a href="#" className="text-sm text-indigo-600 hover:text-indigo-700 font-semibold">Forgot?</a>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium" placeholder="••••••••" />
              </div>
            </div>
            <button type="submit" className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-colors mt-2 shadow-md flex items-center justify-center gap-2">
              Sign In <ArrowRight size={18} />
            </button>
          </form>
          
          <p className="text-center mt-8 text-sm text-slate-500 font-medium">
            Don't have an account? <Link to="/signup" className="text-indigo-600 font-bold hover:text-indigo-700">Sign Up</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}

export function SignUp() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState<"student" | "employer">("student");

  const handleDemoSignup = (e: React.FormEvent) => {
    e.preventDefault();
    login(role);
    if (role === 'student') navigate('/student');
    else navigate('/employer');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Create an Account</h1>
          <p className="text-slate-500">Join GradMatch AI and start hiring or getting hired.</p>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xl shadow-slate-200/50"
        >
          {/* Role Selection */}
          <div className="flex p-1 bg-slate-100 rounded-xl mb-8">
            <button 
              onClick={() => setRole('student')}
              className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${role === 'student' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <GraduationCap size={18} /> I'm a Student
            </button>
            <button 
              onClick={() => setRole('employer')}
              className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${role === 'employer' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <Building size={18} /> I'm an Employer
            </button>
          </div>

          <form onSubmit={handleDemoSignup} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input required type="text" className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium" placeholder="John Doe" />
              </div>
            </div>
            
            {role === 'employer' && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                <label className="block text-sm font-bold text-slate-700 mb-2 mt-5">Company Name</label>
                <div className="relative">
                  <Building className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input required type="text" className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium" placeholder="TechFlow Solutions" />
                </div>
              </motion.div>
            )}

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 mt-5">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input required type="email" className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium" placeholder="you@example.com" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 mt-5">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input required type="password" className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium" placeholder="Create a strong password" />
              </div>
            </div>
            
            <button type="submit" className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors mt-8 shadow-md shadow-indigo-200 flex items-center justify-center gap-2">
              Create Account <ArrowRight size={18} />
            </button>
          </form>
          
          <p className="text-center mt-8 text-sm text-slate-500 font-medium">
            Already have an account? <Link to="/login" className="text-indigo-600 font-bold hover:text-indigo-700">Log In</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
