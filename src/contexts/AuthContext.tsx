import { createContext, useContext, useState, ReactNode } from 'react';
import axios from 'axios';

export type UserRole = 'admin' | 'manager' | 'viewer';

export interface User {
  id: string;
  username: string;
  email: string;
  name: string;
  phone?: string;
  role: UserRole;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (
    username: string,
    password: string,
    name: string,
    email: string,
    phone?: string
  ) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

// ======================================
// ⚙️ Tạo Context
// ======================================
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  // ======================================
  // 🧩 API: Đăng ký
  // ======================================
  const register = async (
    username: string,
    password: string,
    name: string,
    email: string,
    phone?: string
  ) => {
    try {
      const res = await axios.post('http://localhost:5000/api/register', {
        username,
        password,
        name,
        email,
        phone,
      });

      if (res.data.status !== 'success') {
        throw new Error(res.data.message || 'Đăng ký thất bại.');
      }
    } catch (err: any) {
      if (axios.isAxiosError(err)) {
        const message =
          err.response?.data?.message ||
          `Lỗi máy chủ (${err.response?.status || 500})`;
        throw new Error(message);
      } else {
        throw new Error('Lỗi không xác định khi kết nối máy chủ.');
      }
    }
  };

  // ======================================
  // 🧩 API: Đăng nhập
  // ======================================
const login = async (username: string, password: string) => {
  try {
    const res = await axios.post('http://localhost:5000/api/login', {
      username,
      password,
    });

    if (res.data.status !== 'success') {
      throw new Error(res.data.message || 'Đăng nhập thất bại.');
    }

    const loggedInUser: User = res.data.user;
    setUser(loggedInUser);
    localStorage.setItem('user', JSON.stringify(loggedInUser));
  } catch (err: any) {
    if (axios.isAxiosError(err)) {
      const message =
        err.response?.data?.message ||
        `Lỗi máy chủ (${err.response?.status || 500})`;
      throw new Error(message);
    } else {
      throw new Error('Lỗi không xác định khi kết nối máy chủ.');
    }
  }
};



  // ======================================
  // 🚪 Đăng xuất
  // ======================================
  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  // ======================================
  // 🔄 Xuất Context Provider
  // ======================================
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

// ======================================
// ✅ Hook useAuth
// ======================================
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
