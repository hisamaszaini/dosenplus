import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import type { LoginDto, User, Role } from '../types/user.types';

interface AuthContextType {
  user: User | null;
  activeRole: Role | null;
  login: (credentials: LoginDto) => Promise<void>;
  logout: () => Promise<void>;
  setActiveRole: (role: Role) => void;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  roles: Role[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [activeRole, setActiveRole] = useState<Role | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const extractRoles = (user: User): Role[] =>
    user.userRoles.map((ur) => ur.role.name);

  useEffect(() => {
    const checkSession = async () => {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        setIsLoading(false);
        return;
      }

      try {
        const { data } = await api.get<{ data: User }>('/users/profile');
        const profile = data.data;
        setUser(profile);

        const storedRole = localStorage.getItem('activeRole') as Role | null;
        const availableRoles = extractRoles(profile);

        setActiveRole(
          storedRole && availableRoles.includes(storedRole)
            ? storedRole
            : availableRoles[0]
        );
      } catch (error) {
        console.error('Sesi tidak valid:', error);
        logout();
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();
  }, []);

  const login = async (credentials: LoginDto) => {
    const { data } = await api.post('/auth/login', credentials);
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);

    const { data: profileRes } = await api.get<{ data: User }>('/users/profile');
    const profile = profileRes.data;

    setUser(profile);

    const roles = extractRoles(profile);
    const roleToUse = roles[0];
    setActiveRole(roleToUse);
    localStorage.setItem('activeRole', roleToUse);

    navigate(`/${roleToUse.toLowerCase()}/dashboard`);
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch {}
    setUser(null);
    setActiveRole(null);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('activeRole');
    navigate('/login');
  };

  const handleSetActiveRole = (role: Role) => {
    setActiveRole(role);
    localStorage.setItem('activeRole', role);
    navigate(`/${role.toLowerCase()}/dashboard`);
  };

  const roles = user ? extractRoles(user) : [];

  return (
    <AuthContext.Provider
      value={{
        user,
        activeRole,
        login,
        logout,
        setActiveRole: handleSetActiveRole,
        isLoading,
        setUser,
        roles,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth harus digunakan di dalam AuthProvider');
  return context;
};