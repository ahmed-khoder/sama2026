'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  phone?: string;
  preferredLanguage?: string;
  theme?: string;
  permissions?: string[];
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (userData: User) => void;
  updateUser: (userData: Partial<User>) => void;
  logout: () => void;
  hasPermission: (permissionKey: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Restore user info from localStorage (UI data only — token is in HttpOnly cookie)
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        if (!parsedUser.avatar) {
          parsedUser.avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(parsedUser.name)}&background=0ea5e9&color=fff`;
        }
        setUser(parsedUser);
      } catch {
        localStorage.removeItem('currentUser');
      }
    }

    // Validate the JWT cookie is still valid server-side
    fetch('/api/auth/me', { credentials: 'same-origin' })
      .then(async (res) => {
        if (!res.ok) {
          // Token expired or invalid — clear client state
          setUser(null);
          localStorage.removeItem('currentUser');
        } else {
          // Optionally sync fresh user data from server
          const data = await res.json();
          if (data.user) {
            const freshUser = {
              ...data.user,
              avatar: data.user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(data.user.name)}&background=0ea5e9&color=fff`,
            };
            setUser(freshUser);
            localStorage.setItem('currentUser', JSON.stringify(freshUser));
          }
        }
      })
      .catch(() => {
        // Network error — keep localStorage state as fallback
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const login = (userData: User) => {
    const userWithAvatar = {
      ...userData,
      avatar: userData.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.name)}&background=0ea5e9&color=fff`
    };
    setUser(userWithAvatar);
    localStorage.setItem('currentUser', JSON.stringify(userWithAvatar));
    // Token is now set as HttpOnly cookie by the server — not stored client-side
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      if (!updatedUser.avatar) {
        updatedUser.avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(updatedUser.name)}&background=0ea5e9&color=fff`;
      }
      setUser(updatedUser);
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    }
  };

  /**
   * Check if the current user has a specific permission.
   * ADMIN always returns true. EMPLOYEE checks against their permissions array.
   */
  const hasPermission = (permissionKey: string): boolean => {
    if (!user) return false;
    if (user.role === 'ADMIN') return true;
    if (user.role === 'CLIENT') {
      const clientPerms = ['view_dashboard', 'view_shipments', 'view_quotes'];
      return clientPerms.includes(permissionKey);
    }
    // EMPLOYEE
    return (user.permissions || []).includes(permissionKey);
  };

  const logout = async () => {
    setUser(null);
    localStorage.removeItem('currentUser');
    // Clear HttpOnly cookie via server endpoint
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'same-origin' });
    } catch {
      // Best-effort logout
    }
    router.push('/');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, updateUser, logout, hasPermission }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
