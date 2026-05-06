import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { useAuth, getAvatarUrl } from "../context/AuthContext";
import { Save, User, Building, MapPin, GraduationCap, Mail, Camera, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router";
import { api } from "../lib/api";
import { toast } from "sonner";

interface StudentProfile {
  university: string | null;
  degree: string | null;
  gpa: number | null;
  graduation_year: number | null;
  bio: string | null;
  skills: string[];
}

interface EmployerProfile {
  company_name: string | null;
  industry: string | null;
  location: string | null;
  company_size: string | null;
  company_website: string | null;
  bio: string | null;
}

export function Profile() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profileLoading, setProfileLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const [name, setName] = useState(user?.name ?? "");

  // Student fields
  const [university, setUniversity] = useState("");
  const [degree, setDegree] = useState("");
  const [gpa, setGpa] = useState("");
  const [graduationYear, setGraduationYear] = useState("");

  // Employer fields
  const [companyName, setCompanyName] = useState("");
  const [industry, setIndustry] = useState("");
  const [location, setLocation] = useState("");
  const [companySize, setCompanySize] = useState("51-200 employees");
  const [companyWebsite, setCompanyWebsite] = useState("");

  useEffect(() => {
    if (!user) { navigate("/login"); return; }
    api.get<StudentProfile | EmployerProfile>("/api/v1/users/me/profile")
      .then((data) => {
        if (user.role === "student") {
          const p = data as StudentProfile;
          setUniversity(p.university ?? "");
          setDegree(p.degree ?? "");
          setGpa(p.gpa != null ? String(p.gpa) : "");
          setGraduationYear(p.graduation_year != null ? String(p.graduation_year) : "");
        } else if (user.role === "employer") {
          const p = data as EmployerProfile;
          setCompanyName(p.company_name ?? "");
          setIndustry(p.industry ?? "");
          setLocation(p.location ?? "");
          setCompanySize(p.company_size ?? "51-200 employees");
          setCompanyWebsite(p.company_website ?? "");
        }
      })
      .catch(() => toast.error("Failed to load profile"))
      .finally(() => setProfileLoading(false));
  }, []);

  if (!user) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const patch =
        user.role === "student"
          ? {
              university,
              degree,
              gpa: gpa ? parseFloat(gpa) : null,
              graduation_year: graduationYear ? parseInt(graduationYear) : null,
            }
          : { company_name: companyName, industry, location, company_size: companySize, company_website: companyWebsite };
      await api.patch("/api/v1/users/me/profile", patch);
      toast.success("Settings saved");
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch {
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-10">
        <h1 className="text-3xl font-extrabold text-slate-900">Account Settings</h1>
        <p className="text-slate-500 mt-2 text-lg">Manage your personal information and preferences.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column: Avatar & Quick Info */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200/60 shadow-sm text-center">
            <div className="relative w-32 h-32 mx-auto mb-4 group cursor-pointer">
              <img src={getAvatarUrl(user)} alt="Profile" className="w-full h-full rounded-full object-cover border-4 border-white shadow-lg" />
              <div className="absolute inset-0 bg-slate-900/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="text-white" size={32} />
              </div>
            </div>
            <h3 className="font-bold text-slate-900 text-lg">{user.name}</h3>
            <p className="text-sm text-slate-500 uppercase tracking-widest font-bold mt-1">{user.role}</p>

            <div className="mt-6 pt-6 border-t border-slate-100">
              <p className="text-xs text-slate-400 font-medium text-left mb-2 flex items-center gap-2">
                <CheckCircle size={14} className="text-emerald-500" /> Account Active
              </p>
              <p className="text-xs text-slate-400 font-medium text-left flex items-center gap-2">
                <CheckCircle size={14} className="text-emerald-500" /> Identity Verified
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Forms */}
        <div className="md:col-span-2">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-3xl p-8 border border-slate-200/60 shadow-sm"
          >
            {profileLoading ? (
              <div className="animate-pulse space-y-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-12 bg-slate-100 rounded-xl" />
                ))}
              </div>
            ) : (
              <form onSubmit={handleSave} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input
                        type="email"
                        value={user.email}
                        disabled
                        className="w-full pl-11 pr-4 py-3 bg-slate-100 border border-slate-200 rounded-xl font-medium text-slate-400 cursor-not-allowed"
                      />
                    </div>
                  </div>
                </div>

                {user.role === "student" && (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6 border-t border-slate-100">
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-500">University</label>
                        <div className="relative">
                          <GraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                          <input
                            type="text"
                            value={university}
                            onChange={(e) => setUniversity(e.target.value)}
                            className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Major / Degree</label>
                        <input
                          type="text"
                          value={degree}
                          onChange={(e) => setDegree(e.target.value)}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Current CGPA</label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          max="4"
                          value={gpa}
                          onChange={(e) => setGpa(e.target.value)}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Graduation Year</label>
                        <input
                          type="number"
                          value={graduationYear}
                          onChange={(e) => setGraduationYear(e.target.value)}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                        />
                      </div>
                    </div>
                  </>
                )}

                {user.role === "employer" && (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6 border-t border-slate-100">
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Company Name</label>
                        <div className="relative">
                          <Building className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                          <input
                            type="text"
                            value={companyName}
                            onChange={(e) => setCompanyName(e.target.value)}
                            className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Industry</label>
                        <input
                          type="text"
                          value={industry}
                          onChange={(e) => setIndustry(e.target.value)}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-500">HQ Location</label>
                        <div className="relative">
                          <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                          <input
                            type="text"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Company Size</label>
                        <select
                          value={companySize}
                          onChange={(e) => setCompanySize(e.target.value)}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-700"
                        >
                          <option>1-50 employees</option>
                          <option>51-200 employees</option>
                          <option>201-1000 employees</option>
                          <option>1000+ employees</option>
                        </select>
                      </div>
                    </div>
                  </>
                )}

                <div className="pt-8 border-t border-slate-100 flex items-center justify-between">
                  {showSuccess ? (
                    <span className="text-emerald-600 font-bold flex items-center gap-2">
                      <CheckCircle size={20} /> Settings Saved
                    </span>
                  ) : (
                    <div />
                  )}
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
                  >
                    <Save size={18} /> {saving ? "Saving…" : "Save Changes"}
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
