import React, { ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SharedAuthProvider, useSharedAuth, User } from '@procuretrack/shared';

const storage = {
    getItem: async (key: string) => await AsyncStorage.getItem(key),
    setItem: async (key: string, value: string) => await AsyncStorage.setItem(key, value),
    removeItem: async (key: string) => await AsyncStorage.removeItem(key)
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
