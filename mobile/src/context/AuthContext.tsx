import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Constants from 'expo-constants';

// Standalone Mobile API Instance (React 19 Optimized)
const API_URL = `http://10.0.0.237:5000/api`;

const api = axios.create({ baseURL: API_URL });

interface User {
    _id: string;
    name: string;
    email: string;
    role: string;
    token?: string;
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadStoredAuth = async () => {
            try {
                const storedUser = await AsyncStorage.getItem('user');
                if (storedUser) {
                    const parsed = JSON.parse(storedUser);
                    setUser(parsed);
                    api.defaults.headers.common['Authorization'] = `Bearer ${parsed.token}`;
                }
            } catch (e) {
                console.error('Auth load error:', e);
            } finally {
                setLoading(false);
            }
        };
        loadStoredAuth();
    }, []);

    // Dynamic token injection via interceptor (More robust than defaults.headers)
    useEffect(() => {
        const interceptor = api.interceptors.request.use(async (config) => {
            if (user?.token) {
                config.headers.Authorization = `Bearer ${user.token}`;
            }
            return config;
        });
        return () => api.interceptors.request.eject(interceptor);
    }, [user]);

    const login = async (email: string, password: string) => {
        const res = await api.post('/auth/login', { email, password });
        const userData = res.data;
        await AsyncStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
    };

    const logout = async () => {
        await AsyncStorage.removeItem('user');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, isAuthenticated: !!user, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
};

export default api;
