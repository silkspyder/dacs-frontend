import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, StudentDetail, DataStore } from '../data/mockData';
import { api } from '../api/apiClient';

interface AuthContextType {
  user: User | null;
  studentProfile: StudentDetail | null;  // populated after login if usertype === 'Student'
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser]                   = useState<User | null>(null);
  const [studentProfile, setStudentProfile] = useState<StudentDetail | null>(null);

  useEffect(() => {
    const savedUser = sessionStorage.getItem('lms_current_user');
    if (savedUser) {
      const parsed: User = JSON.parse(savedUser);
      setUser(parsed);
      if (parsed.usertype === 'Student') {
        fetchStudentProfile(parsed.id);
      }
    }
  }, []);

  const fetchStudentProfile = async (userId: number) => {
    const profile = await DataStore.getStudentByUserId(userId);
    setStudentProfile(profile);
    if (profile) {
      sessionStorage.setItem('lms_student_profile', JSON.stringify(profile));
    }
  };

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const loggedInUser = await api.post<User>('/auth/login', { username, password });
      setUser(loggedInUser);
      sessionStorage.setItem('lms_current_user', JSON.stringify(loggedInUser));

      // if student, fetch their linked student_details row
      if (loggedInUser.usertype === 'Student') {
        await fetchStudentProfile(loggedInUser.id);
      } else {
        setStudentProfile(null);
      }
      return true;
    } catch {
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setStudentProfile(null);
    sessionStorage.removeItem('lms_current_user');
    sessionStorage.removeItem('lms_student_profile');
  };

  const updateProfile = async (updates: Partial<User>) => {
    if (!user) return;
    try {
      const updated = await api.put<User>(`/users/${user.id}`, updates);
      const newUser = { ...user, ...updated };
      setUser(newUser);
      sessionStorage.setItem('lms_current_user', JSON.stringify(newUser));
    } catch (err) {
      console.error('Failed to update profile', err);
      throw err;
    }
  };

  return (
    <AuthContext.Provider value={{ user, studentProfile, login, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
