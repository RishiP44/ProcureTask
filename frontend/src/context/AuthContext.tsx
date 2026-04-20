import { ReactNode } from 'react';
import { SharedAuthProvider, useSharedAuth, User } from '@procuretrack/shared';

// Platform-specific storage implementation for Web
const storage = {
    getItem: (key: string) => localStorage.getItem(key),
    setItem: (key: string, value: string) => localStorage.setItem(key, value),
    removeItem: (key: string) => localStorage.removeItem(key)
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    return (
        <SharedAuthProvider storage={storage}>
            {children}
        </SharedAuthProvider>
    );
};

export const useAuth = () => {
    const context = useSharedAuth();
    return context;
};

export type { User };
