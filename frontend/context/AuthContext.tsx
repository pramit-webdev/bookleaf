'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';

type AuthContextType = {
  user: User | null;
  loading: boolean;
  role: 'author' | 'admin' | null;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<'author' | 'admin' | null>(null);

  useEffect(() => {
    // Check active sessions and sets the user
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        // Fetch role from authors table
        try {
          const { data: authorData } = await supabase
            .from('authors')
            .select('role')
            .eq('id', session.user.id)
            .single();
          
          setRole(authorData?.role || 'author');
        } catch (err) {
          console.error('Error fetching role:', err);
          setRole('author');
        }
      } else {
        setUser(null);
        setRole(null);
      }
      setLoading(false);
    };

    getSession();

    // Listen for changes on auth state (sign in, sign out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        setUser(session.user);
        // Fetch role from authors table
        try {
          const { data: authorData } = await supabase
            .from('authors')
            .select('role')
            .eq('id', session.user.id)
            .single();
          
          setRole(authorData?.role || 'author');
        } catch (err) {
          console.error('Error fetching role in auth change:', err);
          setRole('author');
        }
      } else {
        setUser(null);
        setRole(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, loading, role, signOut }}>
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
