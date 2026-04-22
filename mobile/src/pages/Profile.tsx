import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { DataBlock, WebSectionHeader } from '../components/Theme';
import { useAuth } from '../context/AuthContext';
import { Feather } from '@expo/vector-icons';

const Profile = () => {
    const { user, logout } = useAuth();

    return (
        <View style={styles.container}>
            <WebSectionHeader title="System Identity Profile" />
            <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
                <DataBlock style={styles.content}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>{(user?.name || 'U').charAt(0).toUpperCase()}</Text>
                    </View>
                    <Text style={styles.name}>{user?.name}</Text>
                    <Text style={styles.email}>{user?.email}</Text>
                    <Text style={styles.role}>{user?.role}</Text>

                    <View style={styles.infoBox}>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>System ID</Text>
                            <Text style={styles.infoValue}>{user?._id || 'SYS-UNDEF'}</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Access Hierarchy</Text>
                            <Text style={styles.infoValue}>{(user?.role === 'Admin' || user?.role === 'HR') ? 'Level-1 Executive' : 'Level-2 Staff'}</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Department</Text>
                            <Text style={styles.infoValue}>{user?.department || 'General Operations'}</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Status</Text>
                            <Text style={[styles.infoValue, { color: '#10b981' }]}>ACTIVE</Text>
                        </View>
                    </View>

                    <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
                        <Feather name="log-out" size={16} color="white" style={{ marginRight: 8 }} />
                        <Text style={styles.logoutText}>Terminate Session</Text>
                    </TouchableOpacity>
                </DataBlock>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20 },
    content: { padding: 40, alignItems: 'center' },
    avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#0f172a', alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
    avatarText: { fontSize: 32, fontWeight: '900', color: 'white' },
    name: { fontSize: 24, fontWeight: '800', color: '#0f172a', marginBottom: 4 },
    email: { fontSize: 13, fontWeight: '700', color: '#64748b', marginBottom: 6 },
    role: { fontSize: 10, fontWeight: '900', color: '#3b82f6', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 32 },
    infoBox: { width: '100%', backgroundColor: '#f8fafc', borderRadius: 12, borderWidth: 1, borderColor: '#f1f5f9', padding: 16, marginBottom: 32 },
    infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
    infoLabel: { fontSize: 11, fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1 },
    infoValue: { fontSize: 12, fontWeight: '800', color: '#0f172a' },
    logoutBtn: { flexDirection: 'row', width: '100%', justifyContent: 'center', backgroundColor: '#ef4444', paddingHorizontal: 20, paddingVertical: 16, borderRadius: 12, alignItems: 'center' },
    logoutText: { color: 'white', fontWeight: '800', fontSize: 12, letterSpacing: 1, textTransform: 'uppercase' }
});

export default Profile;
