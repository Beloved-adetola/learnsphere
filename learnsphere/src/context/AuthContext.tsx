import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Organization } from '../types';
import { Auth } from '@/config/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';

// This is a placeholder that would be replaced with Firebase Auth
interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<User>;
  signupCandidate: (email: string, password: string, organizationId: string) => Promise<User>;
  signupAdmin: (email: string, password: string, organizationName: string) => Promise<User>;
  logout: () => Promise<void>;
  organizations: Organization[];
  getOrganizationById: (id: string) => Organization | undefined;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [organizations, setOrganizations] = useState<Organization[]>([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(Auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // get the token
          const token = await firebaseUser.getIdToken();
          
          // fetch user role from our backend 
          // Note context runs early, wrap in try/catch in case backend isn't up
          const res = await fetch("http://localhost:5000/api/user/profile", {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          
          if (res.ok) {
           const userData = await res.json();
            const userObj: User = {
              id: userData.uid,
              email: userData.email,
              role: userData.role as 'admin'|'candidate',
              organizationCode: userData.organizationCode || "",
            };
           setCurrentUser(userObj);
           localStorage.setItem('learn_sphere_user', JSON.stringify(userObj));
          } else {
             console.error("Failed to load user profile");
             setCurrentUser(null);
             localStorage.removeItem('learn_sphere_user');
          }
        } catch(err) {
           console.error("Backend fetch error:", err);
           setCurrentUser(null);
           localStorage.removeItem('learn_sphere_user');
        }
      } else {
        setCurrentUser(null);
        localStorage.removeItem('learn_sphere_user');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Helper function to get organization by ID
  const getOrganizationById = (id: string) => {
    return organizations.find(org => org.id === id);
  };

  // Mock implementations for backwards compatibility
  const login = async (): Promise<User> => {
     throw new Error("Deprecated, call signInWithEmailAndPassword directly from components");
  };
  const signupAdmin = async (): Promise<User> => {
     throw new Error("Deprecated");
  }
  const signupCandidate = async (): Promise<User> => {
     throw new Error("Deprecated");
  }

  // Logout function
  const logout = async (): Promise<void> => {
    setLoading(true);
    await signOut(Auth);
    setCurrentUser(null);
    localStorage.removeItem('learn_sphere_user');
    setLoading(false);
  };

  const value = {
    currentUser,
    loading,
    error,
    login,
    signupAdmin,
    signupCandidate,
    logout,
    organizations,
    getOrganizationById
  };

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
