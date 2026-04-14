import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
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
        { id: 'Employees', name: 'Directory', roles: ['Admin', 'HR', 'Employee'] },
        { id: 'Workflows', name: 'Workflows', roles: ['Admin', 'HR'] },
        { id: 'Offers', name: 'Offers', roles: ['Admin', 'HR'] },
        { id: 'Assign', name: 'Assign', roles: ['Admin', 'HR'] },
        { id: 'Documents', name: 'Vault', roles: ['Admin', 'HR'] },
    ];

    const filteredMenu = menuItems.filter(item => item.roles.includes(user?.role || ''));

    return (
        <SafeAreaView className="flex-1 bg-white" edges={['top', 'left', 'right']}>
            {/* Header */}
            <View className="px-6 py-4 border-b border-gray-50 flex-row justify-between items-center">
                <View>
                    <Text className="text-xl font-bold text-gray-900 tracking-tighter">ProcureTask</Text>
                    <Text className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{user?.role}</Text>
                </View>
                <TouchableOpacity 
                    onPress={logout}
                    className="px-3 py-1.5 border border-gray-100 rounded"
                >
                    <Text className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">Exit</Text>
                </TouchableOpacity>
            </View>

            {/* Content Area */}
            <View className="flex-1">
                {children}
            </View>

            {/* Bottom Navigation */}
            <SafeAreaView edges={['bottom']} className="border-t border-gray-50">
                <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false}
                    className="flex-row py-4 px-2"
                >
                    {filteredMenu.map((item) => (
                        <TouchableOpacity
                            key={item.id}
                            onPress={() => setScreen(item.id)}
                            className="items-center px-6"
                            activeOpacity={0.7}
                        >
                            <Text className={`text-[10px] font-bold uppercase tracking-widest ${currentScreen === item.id ? 'text-gray-900 underline' : 'text-gray-300'}`}>
                                {item.name}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </SafeAreaView>
        </SafeAreaView>
    );
};

export default Layout;
