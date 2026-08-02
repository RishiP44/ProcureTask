import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

// Use your computer's LAN IP so a physical device/emulator can reach the backend
const API_URL = `http://10.0.0.237:5000/api`;

const api = axios.create({
    baseURL: API_URL,
    timeout: 10000,
});

interface User {
    _id: string;
    name: string;
    email: string;
    role: string;
    token?: string;
    department?: string;
    position?: string;
    phone?: string;
    avatar?: string;
    companyName?: string;
    vendorType?: string;
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    updateUser: (partial: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const applyAuthHeader = (token?: string | null) => {
    if (token) {
        api.defaults.headers.common.Authorization = `Bearer ${token}`;
    } else {
        delete api.defaults.headers.common.Authorization;
    }
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    const logout = async () => {
        await AsyncStorage.removeItem('user');
        applyAuthHeader(null);
        setUser(null);
    };

    // Always attach the latest token (state first, AsyncStorage fallback) so early requests don't race
    useEffect(() => {
        const requestId = api.interceptors.request.use(async (config) => {
            let token = user?.token;
            if (!token) {
                try {
                    const stored = await AsyncStorage.getItem('user');
                    if (stored) {
                        const parsed = JSON.parse(stored);
                        token = parsed?.token;
                    }
                } catch {
                    // ignore storage read errors
                }
            }
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
            return config;
        });

        const responseId = api.interceptors.response.use(
            (response) => response,
            async (error) => {
                if (error.response?.status === 401) {
                    // Drop invalid/expired sessions so the app returns to Login
                    const url = String(error.config?.url || '');
                    const isLoginAttempt = url.includes('/auth/login') || url.includes('/auth/register');
                    if (!isLoginAttempt) {
                        await AsyncStorage.removeItem('user');
                        applyAuthHeader(null);
                        setUser(null);
                    }
                }
                return Promise.reject(error);
            }
        );

        return () => {
            api.interceptors.request.eject(requestId);
            api.interceptors.response.eject(responseId);
        };
    }, [user]);

    useEffect(() => {
        const restoreSession = async () => {
            try {
                const storedUser = await AsyncStorage.getItem('user');
                if (!storedUser) return;

                const parsed = JSON.parse(storedUser);
                if (!parsed?.token) {
                    await AsyncStorage.removeItem('user');
                    return;
                }

                applyAuthHeader(parsed.token);

                // Validate token against the backend before treating the user as logged in
                try {
                    const me = await api.get('/auth/me');
                    const refreshed = {
                        ...parsed,
                        ...me.data,
                        token: parsed.token,
                        _id: me.data._id || me.data.id || parsed._id,
                    };
                    await AsyncStorage.setItem('user', JSON.stringify(refreshed));
                    setUser(refreshed);
                } catch {
                    // Token rejected (401) or backend unreachable — force a clean login
                    await AsyncStorage.removeItem('user');
                    applyAuthHeader(null);
                    setUser(null);
                }
            } catch (e) {
                console.error('Auth restore error:', e);
                await AsyncStorage.removeItem('user');
                applyAuthHeader(null);
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        restoreSession();
    }, []);

    const login = async (email: string, password: string) => {
        const res = await api.post('/auth/login', { email, password });
        const userData = res.data;
        if (!userData?.token) {
            throw new Error('Login response missing token');
        }
        applyAuthHeader(userData.token);
        await AsyncStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
    };

    const updateUser = async (partial: Partial<User>) => {
        if (!user) return;
        const next = { ...user, ...partial };
        await AsyncStorage.setItem('user', JSON.stringify(next));
        setUser(next);
    };

    return (
        <AuthContext.Provider value={{ user, isAuthenticated: !!user, loading, login, logout, updateUser }}>
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
