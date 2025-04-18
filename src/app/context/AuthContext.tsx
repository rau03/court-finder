"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

// Define types
type User = {
  id: string;
  email: string;
  name?: string;
};

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
};

// Create context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
});

// Hook to use the auth context
export const useAuth = () => useContext(AuthContext);

// Provider component
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on component mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        // For now, we'll check local storage for a mock session
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error("Error checking session:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();
  }, []);

  // Sign in function
  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // For now, this is a mock implementation
      // In a real app, you would call your backend API
      console.log("Sign in attempt with:", email, password);

      // Simulate a successful sign-in
      const user = { id: "123", email };
      localStorage.setItem("user", JSON.stringify(user));
      setUser(user);
      return Promise.resolve();
    } catch (error) {
      console.error("Sign in error:", error);
      return Promise.reject(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Sign up function
  const signUp = async (email: string, password: string, name: string) => {
    setIsLoading(true);
    try {
      // Mock implementation
      console.log("Sign up attempt with:", email, password, name);

      // Simulate a successful sign-up
      const user = { id: "123", email, name };
      localStorage.setItem("user", JSON.stringify(user));
      setUser(user);
      return Promise.resolve();
    } catch (error) {
      console.error("Sign up error:", error);
      return Promise.reject(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Sign out function
  const signOut = async () => {
    try {
      localStorage.removeItem("user");
      setUser(null);
      return Promise.resolve();
    } catch (error) {
      console.error("Sign out error:", error);
      return Promise.reject(error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
