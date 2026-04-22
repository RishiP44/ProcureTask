import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Platform, StatusBar, Modal, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { Feather } from '@expo/vector-icons';
import api from '../services/api';

interface LayoutProps {
    children: React.ReactNode;
    currentScreen: string;
    setScreen: (screen: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, currentScreen, setScreen }) => {
    const { user, logout } = useAuth();
    const [showNotif, setShowNotif] = useState(false);
    const [notifications, setNotifications] = useState<any[]>([]);

    useEffect(() => {
        if (user) {
            api.get('/notifications')
                .then(res => setNotifications(res.data))
                .catch(() => setNotifications([]));
        }
    }, [user]);

    const menuItems = [
        { id: 'Dashboard', name: 'Dashboard', icon: 'home', roles: ['Admin', 'HR', 'Employee', 'Vendor'] },
        { id: 'Employees', name: 'Directory', icon: 'users', roles: ['Admin', 'HR'] },
        { id: 'AssignTask', name: 'Assign Task', icon: 'send', roles: ['Admin', 'HR'] },
        { id: 'OfferLetters', name: 'Offers', icon: 'mail', roles: ['Admin', 'HR'] },
        { id: 'Workflows', name: 'Workflows', icon: 'git-merge', roles: ['Admin', 'HR'] },
        { id: 'Documents', name: 'Vault', icon: 'folder', roles: ['Admin', 'HR'] },
    ];

    const filteredMenu = menuItems.filter(item => item.roles.includes(user?.role || ''));

    return (
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
            <StatusBar barStyle="dark-content" />
            
            {/* Flat Corporate Header */}
            <View style={styles.header}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <View style={styles.logoBox}>
                        <Text style={styles.logoText}>P</Text>
                    </View>
                    <View>
                        <Text style={styles.brand}>ProcureTrack</Text>
                        <Text style={styles.brandSub}>SYSTEMS v2.4</Text>
                    </View>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <TouchableOpacity onPress={() => setShowNotif(true)} style={styles.iconBtn}>
                        <Feather name="bell" size={18} color="#64748b" />
                        {notifications.length > 0 && <View style={styles.badgeDot} />}
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setScreen('Profile')} style={styles.profileBtn}>
                        <Text style={styles.profileTxt}>{(user?.name || 'U').charAt(0).toUpperCase()}</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Content Area */}
            <View style={styles.content}>
                {children}
            </View>

            {/* Flat Bottom Navigation */}
            <View style={styles.tabContainer}>
                <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                >
                    {filteredMenu.map((item) => {
                        const isActive = currentScreen === item.id;
                        return (
                            <TouchableOpacity
                                key={item.id}
                                onPress={() => setScreen(item.id)}
                                style={[styles.tabItem, isActive && styles.tabItemActive]}
                                activeOpacity={0.7}
                            >
                                <Feather 
                                    name={item.icon as any} 
                                    size={18} 
                                    color={isActive ? '#2563eb' : '#64748b'} 
                                    style={{ marginRight: 8 }}
                                />
                                <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                                    {item.name}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>
            </View>

            {/* Notifications Popup Modal */}
            <Modal visible={showNotif} animationType="fade" transparent>
                <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowNotif(false)}>
                    <View style={styles.notifPopup}>
                        <View style={styles.notifHeader}>
                            <Text style={styles.notifTitle}>System Alerts</Text>
                            <TouchableOpacity onPress={() => setShowNotif(false)}>
                                <Feather name="x" size={18} color="#94a3b8" />
                            </TouchableOpacity>
                        </View>
                        {notifications.length > 0 ? (
                            <FlatList
                                data={notifications}
                                keyExtractor={(item: any) => item._id || Math.random().toString()}
                                style={{ maxHeight: 300 }}
                                contentContainerStyle={{ padding: 16 }}
                                renderItem={({ item }) => (
                                    <View style={{ flexDirection: 'row', marginBottom: 12, borderBottomWidth: 1, borderBottomColor: '#f1f5f9', paddingBottom: 12 }}>
                                        <View style={{ width: 32, height: 32, backgroundColor: '#eff6ff', borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                                            <Feather name="bell" size={14} color="#3b82f6" />
                                        </View>
                                        <View style={{ flex: 1 }}>
                                            <Text style={{ fontSize: 13, fontWeight: '800', color: '#0f172a' }}>{item.title}</Text>
                                            <Text style={{ fontSize: 11, fontWeight: '600', color: '#64748b', marginTop: 2 }}>{item.message}</Text>
                                        </View>
                                    </View>
                                )}
                            />
                        ) : (
                            <View style={{ padding: 24, alignItems: 'center', justifyContent: 'center' }}>
                                <Feather name="bell-off" size={32} color="#cbd5e1" style={{ marginBottom: 12 }} />
                                <Text style={styles.emptyText}>Zero pending alerts</Text>
                            </View>
                        )}
                    </View>
                </TouchableOpacity>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white'
    },
    header: {
        paddingHorizontal: 20,
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: 'white',
    },
    logoBox: {
        width: 32,
        height: 32,
        backgroundColor: '#0f172a',
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12
    },
    logoText: {
        color: 'white',
        fontWeight: '900',
        fontStyle: 'italic',
        fontSize: 14
    },
    brand: {
        fontSize: 16,
        fontWeight: '800',
        color: '#0f172a',
        letterSpacing: -0.5
    },
    brandSub: {
        fontSize: 8,
        fontWeight: '900',
        color: '#3b82f6',
        letterSpacing: 1.5,
        marginTop: 2
    },
    iconBtn: {
        width: 36,
        height: 36,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f8fafc',
        borderRadius: 18,
        marginRight: 12,
        position: 'relative'
    },
    badgeDot: {
        width: 8,
        height: 8,
        backgroundColor: '#ef4444',
        borderRadius: 4,
        position: 'absolute',
        top: 8,
        right: 8,
        borderWidth: 1,
        borderColor: 'white'
    },
    profileBtn: {
        width: 36,
        height: 36,
        backgroundColor: '#0f172a',
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center'
    },
    profileTxt: {
        color: 'white',
        fontSize: 12,
        fontWeight: '800'
    },
    content: {
        flex: 1,
        backgroundColor: '#f8fafc'
    },
    tabContainer: {
        backgroundColor: 'white',
        borderTopWidth: 1,
        borderTopColor: '#e2e8f0',
        paddingBottom: Platform.OS === 'ios' ? 20 : 0
    },
    scrollContent: {
        paddingVertical: 12,
        paddingHorizontal: 16
    },
    tabItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 4,
        marginRight: 8,
        backgroundColor: 'transparent'
    },
    tabItemActive: {
        backgroundColor: '#eff6ff'
    },
    tabText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#64748b',
    },
    tabTextActive: {
        color: '#2563eb'
    },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.4)', justifyContent: 'flex-start', alignItems: 'flex-end', paddingTop: 60, paddingRight: 20 },
    notifPopup: { width: 300, backgroundColor: 'white', borderRadius: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.1, shadowRadius: 20, elevation: 10 },
    notifHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
    notifTitle: { fontSize: 14, fontWeight: '800', color: '#0f172a' },
    emptyText: { fontSize: 10, fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase' }
});

export default Layout;
