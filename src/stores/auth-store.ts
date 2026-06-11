"use client";

import { create } from "zustand";

interface User {
  id: string;
  email: string;
  name: string | null;
  role: "USER" | "ADMIN";
  avatarUrl: string | null;
  subscription?: { plan: string; status: string } | null;
}

interface AuthState {
  user: User | null;
  loading: boolean;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
  setUser: (user) => set({ user, loading: false }),
  setLoading: (loading) => set({ loading }),
  logout: async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {}
    set({ user: null });
    window.location.href = "/login";
  },
}));
