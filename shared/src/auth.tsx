import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { User, AuthContextType } from './types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const SharedAuthProvider = ({ 
  children, 
  storage, 
  onLogin,
  onLogout
}: { 
  children: ReactNode; 
  storage: { 
    getItem: (key: string) => string | null | Promise<string | null>; 
    setItem: (key: string, value: string) => void | Promise<void>; 
    removeItem: (key: string) => void | Promise<void>; 
  };
  onLogin?: (user: User) => void;
  onLogout?: () => void;
}) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
          const storedUser = await storage.getItem('user');
          if (storedUser) {
              setUser(JSON.parse(storedUser));
          }
          setLoading(false);
        };
        checkAuth();
    }, []);

    const login = async (userData: User) => {
        await storage.setItem('user', JSON.stringify(userData));
        setUser(userData);
        if (onLogin) onLogin(userData);
    };

    const logout = async () => {
        await storage.removeItem('user');
        setUser(null);
        if (onLogout) onLogout();
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useSharedAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useSharedAuth must be used within an AuthProvider');
    }
    return context;
};
