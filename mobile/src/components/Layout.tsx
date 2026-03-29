import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';

interface LayoutProps {
    children: React.ReactNode;
    currentScreen: string;
    setScreen: (screen: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, currentScreen, setScreen }) => {
    const { user, logout } = useAuth();

    const menuItems = [
        { id: 'Dashboard', name: 'Dashboard', roles: ['Admin', 'HR', 'Employee', 'Vendor'] },
        { id: 'Workflows', name: 'Workflows', roles: ['Admin', 'HR'] },
        { id: 'Assign', name: 'Assign', roles: ['Admin', 'HR'] },
        { id: 'Documents', name: 'Vault', roles: ['Admin', 'HR'] },
    ];

    const filteredMenu = menuItems.filter(item => item.roles.includes(user?.role || ''));

    return (
        <SafeAreaView className="flex-1 bg-gray-50" edges={['top', 'left', 'right']}>
            {/* Header - Simple and Professional */}
            <View className="px-5 py-4 bg-white border-b border-gray-200 flex-row justify-between items-center">
                <View>
                    <Text className="text-xl font-bold text-indigo-600">ProcureTrack</Text>
                    <Text className="text-[10px] text-gray-400 font-medium">{user?.role}</Text>
                </View>
                <TouchableOpacity 
                    onPress={logout}
                    className="px-3 py-1.5 rounded-md bg-red-50 border border-red-100"
                >
                    <Text className="text-red-600 text-xs font-bold">Sign Out</Text>
                </TouchableOpacity>
            </View>

            {/* Content Area */}
            <View className="flex-1">
                {children}
            </View>

            {/* Bottom Navigation - Standardized */}
            <SafeAreaView edges={['bottom']} className="bg-white border-t border-gray-200">
                <View className="flex-row justify-around items-center py-2">
                    {filteredMenu.map((item) => (
                        <TouchableOpacity
                            key={item.id}
                            onPress={() => setScreen(item.id)}
                            className="items-center px-4 py-2"
                            activeOpacity={0.7}
                        >
                            <Text className={`text-[11px] font-bold ${currentScreen === item.id ? 'text-indigo-600' : 'text-gray-400'}`}>
                                {item.name}
                            </Text>
                            {currentScreen === item.id && (
                                <View className="h-1 w-1 bg-indigo-600 rounded-full mt-1" />
                            )}
                        </TouchableOpacity>
                    ))}
                </View>
            </SafeAreaView>
        </SafeAreaView>
    );
};

export default Layout;
