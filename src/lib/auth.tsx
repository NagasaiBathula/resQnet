import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { type Role } from "./mock-data";
import { toast } from "sonner";
import { API_URL } from "./config";

export interface User {
  id: string;
  _id?: string;
  email: string;
  name: string;
  role: Role;
  avatar: string;
  location: string;
  state?: string;
  district?: string;
  mobileNumber?: string;
  address?: string;
}

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  registerUser: (payload: any) => Promise<{ ok: boolean; error?: string; status?: string }>;
  loginAs: (role: Role) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);
const TOKEN_KEY = "resqnet.token";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch current user session from token
  const fetchMe = async (token: string) => {
    try {
      const res = await fetch(`${API_URL}/api/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error("Session invalid");
      }

      const userData = await res.json();
      setUser({
        id: userData._id || userData.id,
        email: userData.email,
        name: userData.name,
        role: userData.role,
        avatar: userData.avatar,
        location: userData.location,
      });
    } catch (error) {
      console.error("Failed to restore session:", error);
      // Clean up invalid token
      localStorage.removeItem(TOKEN_KEY);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem(TOKEN_KEY) : null;
    if (token) {
      fetchMe(token);
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        return { ok: false, error: data.message || "Login failed" };
      }

      localStorage.setItem(TOKEN_KEY, data.token);
      setUser({
        id: data.id,
        email: data.email,
        name: data.name,
        role: data.role,
        avatar: data.avatar,
        location: data.location,
      });

      return { ok: true };
    } catch (error) {
      console.error("Login API error:", error);
      return { ok: false, error: "Network error. Make sure the backend server is running." };
    }
  };

  const registerUser = async (payload: any) => {
    try {
      const res = await fetch(`${API_URL}/api/users/requests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        return { ok: false, error: data.message || "Registration failed" };
      }

      if (data.token) {
        localStorage.setItem(TOKEN_KEY, data.token);
        setUser({
          id: data.id,
          email: data.email,
          name: data.name,
          role: data.role,
          avatar: data.avatar,
          location: data.location,
        });
      }

      return { ok: true, status: data.status };
    } catch (error) {
      console.error("Registration API error:", error);
      return { ok: false, error: "Network error. Make sure the backend server is running." };
    }
  };

  const loginAs = async (role: Role) => {
    // Generate email based on plan.md specifications (.ai domains)
    const email = `${role}@resqnet.ai`;
    const password = "demo123";

    const res = await login(email, password);
    if (!res.ok) {
      toast.error(res.error || `Could not sign in as ${role}`);
    }
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
    toast.success("Successfully logged out");
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, registerUser, loginAs, logout }}>
      {!loading ? (
        children
      ) : (
        <div className="h-screen w-screen grid place-items-center bg-background text-muted-foreground">
          Loading ResQNet AI...
        </div>
      )}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export function roleHome(role: Role): string {
  switch (role) {
    case "citizen":
      return "/citizen";
    case "volunteer":
      return "/volunteer";
    case "rescue":
      return "/rescue";
    case "authority":
      return "/authority";
    case "admin":
      return "/admin";
  }
}
