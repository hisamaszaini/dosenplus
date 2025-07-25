import {
  createContext,
  useState,
  useEffect,
  useContext,
  type ReactNode,
} from 'react';
import { useNavigate } from 'react-router-dom';
import type { LoginDto, User } from '../types/user.types';
import api from '../services/api';

interface AuthContextType {
  user: User | null;
  login: (credentials: LoginDto) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkUserSession = async () => {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        setIsLoading(false);
        return;
      }

      try {
        const { data: profile } = await api.get<User>('/users/profile');
        setUser(profile);
      } catch (error) {
        console.error('Gagal memvalidasi sesi:', error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkUserSession();
  }, []);

  const login = async (credentials: LoginDto) => {
    try {
      const { data } = await api.post('/auth/login', credentials);

      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);

      api.defaults.headers.common['Authorization'] = `Bearer ${data.accessToken}`;

      const { data: profile } = await api.get<User>('/users/profile');
      setUser(profile);

      navigate(`/${profile.role.toLowerCase()}/dashboard`);
    } catch (error) {
      console.error('Login gagal:', error);
      throw new Error('Email atau password tidak cocok.');
    }
  };

  const logout = async() => {
    await api.post('/auth/logout');
    
    setUser(null);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    delete api.defaults.headers.common['Authorization'];
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth harus digunakan di dalam AuthProvider');
  }
  return context;
};