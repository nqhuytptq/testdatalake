import { createContext, useContext, useState, ReactNode } from 'react';

export type UserRole = 'admin' | 'manager' | 'viewer';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users database
const mockUsers: { [key: string]: { password: string; user: User } } = {
  'admin@ptit.edu.vn': {
    password: 'admin123',
    user: {
      id: '1',
      email: 'admin@ptit.edu.vn',
      name: 'Admin PTIT',
      role: 'admin',
    },
  },
  'manager@ptit.edu.vn': {
    password: 'manager123',
    user: {
      id: '2',
      email: 'manager@ptit.edu.vn',
      name: 'Manager',
      role: 'manager',
    },
  },
  'user@ptit.edu.vn': {
    password: 'user123',
    user: {
      id: '3',
      email: 'user@ptit.edu.vn',
      name: 'User',
      role: 'viewer',
    },
  },
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const login = async (email: string, password: string) => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));

    const userRecord = mockUsers[email];
    if (!userRecord || userRecord.password !== password) {
      throw new Error('Email hoặc mật khẩu không đúng');
    }

    setUser(userRecord.user);
    localStorage.setItem('user', JSON.stringify(userRecord.user));
  };

  const register = async (email: string, password: string, name: string) => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));

    if (mockUsers[email]) {
      throw new Error('Email đã được sử dụng');
    }

    const newUser: User = {
      id: Date.now().toString(),
      email,
      name,
      role: 'viewer',
    };

    mockUsers[email] = { password, user: newUser };
    setUser(newUser);
    localStorage.setItem('user', JSON.stringify(newUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        isAuthenticated: !!user,
      }}
    >
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
