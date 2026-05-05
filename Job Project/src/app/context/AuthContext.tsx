import { createContext, useContext, useState, ReactNode } from "react";

type Role = "student" | "employer" | "admin";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar: string;
}

interface AuthContextType {
  user: User | null;
  login: (role: Role) => void;
  logout: () => void;
  updateProfile: (data: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = (role: Role) => {
    if (role === 'student') {
      setUser({ 
        id: '1', 
        name: 'Usman Tariq', 
        email: 'usman@example.com', 
        role: 'student', 
        avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80' 
      });
    } else if (role === 'employer') {
      setUser({ 
        id: '2', 
        name: 'Sarah Jenkins', 
        email: 'sarah@nexus.tech', 
        role: 'employer', 
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80' 
      });
    } else if (role === 'admin') {
      setUser({ 
        id: '3', 
        name: 'System Admin', 
        email: 'admin@gradmatch.ai', 
        role: 'admin', 
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80' 
      });
    }
  };

  const logout = () => setUser(null);

  const updateProfile = (data: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...data });
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
