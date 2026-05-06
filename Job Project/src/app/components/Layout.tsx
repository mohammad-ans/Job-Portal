import { useState } from "react";
import { NavLink, Outlet, useLocation, Link, useNavigate } from "react-router";
import { Briefcase, UserCircle, ShieldCheck, Home, Menu, X, ChevronRight, Github, Twitter, Linkedin, LogOut, Settings, User as UserIcon } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useAuth, getAvatarUrl } from "../context/AuthContext";

export function Layout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [roleSwitchTarget, setRoleSwitchTarget] = useState<string | null>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // Close mobile menu on route change
  useState(() => {
    setIsMobileMenuOpen(false);
    setIsProfileMenuOpen(false);
  }, [location.pathname]);

  const navItems = user ? (
    user.role === 'student' ? [
      { path: "/", label: "Home", icon: Home },
      { path: "/student", label: "Student Hub", icon: UserCircle },
    ] : user.role === 'employer' ? [
      { path: "/", label: "Home", icon: Home },
      { path: "/employer", label: "Employer Suite", icon: Briefcase },
    ] : [
      { path: "/", label: "Home", icon: Home },
      { path: "/admin", label: "Admin Console", icon: ShieldCheck },
    ]
  ) : [
    { path: "/", label: "Home", icon: Home },
    { path: "/pricing", label: "Pricing", icon: Briefcase },
  ];

  const handleLogout = () => {
    logout();
    setIsProfileMenuOpen(false);
    navigate('/');
  };

  const roleForPath: Record<string, string> = { "/student": "student", "/employer": "employer" };

  const handleFooterRoleLink = (e: React.MouseEvent, path: string) => {
    const targetRole = roleForPath[path];
    if (user && targetRole && user.role !== targetRole) {
      e.preventDefault();
      setRoleSwitchTarget(path);
    }
  };

  const confirmRoleSwitch = () => {
    logout();
    setRoleSwitchTarget(null);
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col selection:bg-indigo-100 selection:text-indigo-900 overflow-x-hidden">
      <AnimatePresence>
        {roleSwitchTarget && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center px-4"
            onClick={() => setRoleSwitchTarget(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl border border-slate-100"
            >
              <h3 className="text-xl font-extrabold text-slate-900 mb-2">Switch Role?</h3>
              <p className="text-slate-500 text-sm leading-relaxed mb-6">
                You're currently signed in as <strong className="text-slate-700 capitalize">{user?.role}</strong>. To access this section you'll need to log out and sign in with a different account.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setRoleSwitchTarget(null)}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmRoleSwitch}
                  className="flex-1 py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl transition-colors text-sm flex items-center justify-center gap-2"
                >
                  <LogOut size={16} /> Log Out
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-slate-200/80 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <NavLink to="/" className="flex items-center gap-3 group">
              <motion.div 
                whileHover={{ scale: 1.05, rotate: -5 }}
                className="bg-gradient-to-br from-indigo-600 to-indigo-800 text-white p-2 rounded-xl shadow-lg shadow-indigo-200"
              >
                <Briefcase size={28} />
              </motion.div>
              <span className="font-extrabold text-2xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 group-hover:to-indigo-600 transition-colors duration-300">
                GradMatch <span className="text-indigo-600">AI</span>
              </span>
            </NavLink>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center space-x-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                      `relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 overflow-hidden group ${
                        isActive
                          ? "text-indigo-700 bg-indigo-50/80 shadow-sm border border-indigo-100/50"
                          : "text-slate-600 hover:text-indigo-700 hover:bg-slate-50"
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <Icon size={18} className={isActive ? "text-indigo-600" : "text-slate-400 group-hover:text-indigo-500 transition-colors"} />
                        <span>{item.label}</span>
                        {isActive && (
                          <motion.div
                            layoutId="activeNavIndicator"
                            className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600"
                            initial={false}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                          />
                        )}
                      </>
                    )}
                  </NavLink>
                );
              })}
            </nav>

            {/* Right side Actions */}
            <div className="hidden md:flex items-center gap-4">
              {!user ? (
                <>
                  <Link to="/login" className="text-slate-600 hover:text-indigo-600 font-bold text-sm transition-colors">Log In</Link>
                  <Link to="/signup" className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-md">Sign Up</Link>
                </>
              ) : (
                <div className="relative">
                  <button 
                    onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)} 
                    className="flex items-center gap-2 focus:outline-none"
                  >
                    <img src={getAvatarUrl(user)} alt="Profile" className="w-10 h-10 rounded-full border-2 border-indigo-100 object-cover shadow-sm" />
                  </button>

                  <AnimatePresence>
                    {isProfileMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden"
                      >
                        <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                          <p className="font-bold text-slate-900 truncate">{user.name}</p>
                          <p className="text-xs text-slate-500 truncate">{user.email}</p>
                          <span className="inline-block mt-2 px-2 py-0.5 bg-indigo-100 text-indigo-700 text-[10px] font-bold uppercase tracking-wider rounded">
                            {user.role}
                          </span>
                        </div>
                        <div className="p-2 space-y-1">
                          <Link 
                            to="/profile" 
                            onClick={() => setIsProfileMenuOpen(false)}
                            className="flex items-center gap-3 px-3 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-indigo-600 rounded-xl transition-colors"
                          >
                            <Settings size={18} /> Account Settings
                          </Link>
                          <button 
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors text-left"
                          >
                            <LogOut size={18} /> Sign Out
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <div className="flex items-center md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Nav */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="md:hidden border-t border-slate-200 bg-white"
            >
              <div className="px-4 pt-4 pb-6 space-y-1 shadow-inner">
                {user && (
                  <div className="flex items-center gap-3 p-4 mb-2 bg-slate-50 rounded-xl">
                    <img src={getAvatarUrl(user)} alt="Profile" className="w-10 h-10 rounded-full border border-slate-200 object-cover" />
                    <div>
                      <p className="font-bold text-slate-900">{user.name}</p>
                      <p className="text-xs text-slate-500 capitalize">{user.role}</p>
                    </div>
                  </div>
                )}
                
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center justify-between px-4 py-4 rounded-xl text-base font-semibold transition-colors ${
                          isActive
                            ? "text-indigo-700 bg-indigo-50 border border-indigo-100"
                            : "text-slate-600 hover:bg-slate-50"
                        }`
                      }
                    >
                      <div className="flex items-center gap-3">
                        <Icon size={20} />
                        {item.label}
                      </div>
                      <ChevronRight size={16} className="text-slate-400" />
                    </NavLink>
                  );
                })}

                {!user ? (
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100 mt-2">
                    <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="text-center py-3 bg-slate-100 text-slate-800 font-bold rounded-xl">Log In</Link>
                    <Link to="/signup" onClick={() => setIsMobileMenuOpen(false)} className="text-center py-3 bg-slate-900 text-white font-bold rounded-xl">Sign Up</Link>
                  </div>
                ) : (
                  <div className="pt-4 border-t border-slate-100 mt-2 space-y-2">
                    <Link to="/profile" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 text-slate-700 font-bold bg-slate-50 rounded-xl">
                      <Settings size={20} /> Settings
                    </Link>
                    <button onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }} className="w-full flex items-center gap-3 px-4 py-3 text-rose-600 font-bold bg-rose-50 rounded-xl text-left">
                      <LogOut size={20} /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main className="flex-grow flex flex-col">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="flex-grow flex flex-col h-full w-full"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      <footer className="bg-slate-900 text-slate-300 py-12 border-t border-slate-800 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8 border-b border-slate-800 pb-8">
            <div className="col-span-1 md:col-span-2 space-y-4">
              <div className="flex items-center gap-2 text-white">
                <div className="bg-indigo-500 text-white p-1.5 rounded-lg">
                  <Briefcase size={20} />
                </div>
                <span className="font-bold text-xl tracking-tight">GradMatch AI</span>
              </div>
              <p className="text-slate-400 text-sm max-w-sm leading-relaxed">
                Empowering fresh graduates and forward-thinking companies with AI-driven, bidirectional resume matching. Building the future of entry-level hiring.
              </p>
              <div className="flex space-x-4 pt-2">
                <a href="#" className="text-slate-500 hover:text-white transition-colors"><Twitter size={20} /></a>
                <a href="#" className="text-slate-500 hover:text-white transition-colors"><Linkedin size={20} /></a>
                <a href="#" className="text-slate-500 hover:text-white transition-colors"><Github size={20} /></a>
              </div>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Platform</h3>
              <ul className="space-y-3 text-sm">
                <li>
                  <NavLink to="/student" onClick={(e) => handleFooterRoleLink(e, "/student")} className="hover:text-indigo-400 transition-colors">
                    For Students
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/employer" onClick={(e) => handleFooterRoleLink(e, "/employer")} className="hover:text-indigo-400 transition-colors">
                    For Employers
                  </NavLink>
                </li>
                <li><NavLink to="/pricing" className="hover:text-indigo-400 transition-colors">Pricing</NavLink></li>
                <li><NavLink to="/success-stories" className="hover:text-indigo-400 transition-colors">Success Stories</NavLink></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Legal & Support</h3>
              <ul className="space-y-3 text-sm">
                <li><NavLink to="/privacy-policy" className="hover:text-indigo-400 transition-colors">Privacy Policy</NavLink></li>
                <li><NavLink to="/terms-of-service" className="hover:text-indigo-400 transition-colors">Terms of Service</NavLink></li>
                <li><NavLink to="/help-center" className="hover:text-indigo-400 transition-colors">Help Center</NavLink></li>
                <li><NavLink to="/contact-admin" className="hover:text-indigo-400 transition-colors">Contact Admin</NavLink></li>
              </ul>
            </div>
          </div>
          <div className="flex flex-col md:flex-row justify-between items-center text-xs text-slate-500">
            <p>&copy; {new Date().getFullYear()} GradMatch AI Prototype. All rights reserved.</p>
            <p className="mt-2 md:mt-0 flex items-center gap-1">
              Powered by <span className="text-indigo-400 font-medium">Advanced NLP Algorithms</span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
