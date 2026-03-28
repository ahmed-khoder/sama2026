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
  networkError: boolean;
  login: (userData: User) => void;
  updateUser: (userData: Partial<User>) => void;
  logout: () => void;
  hasPermission: (permissionKey: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [networkError, setNetworkError] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // ── localStorage يُستخدم فقط كـ cache مؤقت لمنع الـ flicker ──
    // السيرفر هو المصدر الوحيد للحقيقة
    const cachedUser = localStorage.getItem('currentUser');
    if (cachedUser) {
      try {
        setUser(JSON.parse(cachedUser));
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
        setNetworkError(false);
      })
      .catch(() => {
        // Network error — نُبقي المستخدم لكن نُشير لفشل الشبكة
        // لا نمسح الـ user حتى لا يُطرد إذا انقطع الإنترنت مؤقتاً
        setNetworkError(true);
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
    <AuthContext.Provider value={{ user, loading, networkError, login, updateUser, logout, hasPermission }}>
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
