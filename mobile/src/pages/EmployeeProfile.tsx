import React, { useEffect, useState } from 'react';
import { Feather } from '@expo/vector-icons';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert, StyleSheet, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../services/api';
import { DataBlock, WebSectionHeader } from '../components/Theme';

interface EmployeeProfileProps {
    employeeId: string;
    onBack: () => void;
    onSelectAssignment: (id: string) => void;
}

const EmployeeProfile: React.FC<EmployeeProfileProps> = ({ employeeId, onBack, onSelectAssignment }) => {
    const [employee, setEmployee] = useState<any>(null);
    const [assignments, setAssignments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const loadData = async () => {
        if (!employeeId) return;
        try {
            setLoading(true);
            const [empRes, assignRes] = await Promise.all([
                api.get(`/users/${employeeId}`),
                api.get(`/assignments?userId=${employeeId}`).catch(() => ({ data: [] }))
            ]);
            setEmployee(empRes.data);
            setAssignments(Array.isArray(assignRes.data) ? assignRes.data : []);
        } catch (error) {
            console.error('Load employee error:', error);
            Alert.alert('Load State Error', 'Failed to synchronize with central employee ledger.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [employeeId]);

    if (loading) {
        return (
            <View style={[styles.container, { alignItems: 'center', justifyContent: 'center' }]}>
                <ActivityIndicator size="large" color="#475569" />
                <Text style={{ fontSize: 10,  color: '#cbd5e1', fontWeight: 'bold', marginTop: 16 }}>DECRYPTING PROFILE...</Text>
            </View>
        );
    }

    if (!employee) return null;

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />
            
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={onBack} style={styles.iconBtn}>
                    <Feather name="arrow-left" size={18} color="#1e293b" />
                </TouchableOpacity>
                <Text style={styles.headerText}>Resource File</Text>
                <View style={[styles.iconBtn, { opacity: 0 }]} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 24 }}>
                {/* Identity Card */}
                <View style={styles.identityBox}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>
                            {(employee.name || 'U').split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)}
                        </Text>
                    </View>
                    <Text style={styles.name}>{employee.name}</Text>
                    <Text style={styles.role}>{(employee.role || 'MEMBER').toUpperCase()}</Text>
                    <Text style={styles.idText}>ID: {(employee._id || '').slice(-6).toUpperCase()}</Text>
                </View>

                {/* Operations Section */}
                <WebSectionHeader title="Operations Log" count={assignments.length} />
                
                {assignments.length > 0 ? (
                    assignments.map((item) => (
                        <TouchableOpacity key={item._id} onPress={() => onSelectAssignment(item._id)} activeOpacity={0.7}>
                            <DataBlock>
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <View style={{ flex: 1 }}>
                                        <Text style={{ fontSize: 14, fontWeight: '800', color: '#0f172a' }}>{item.workflow?.name}</Text>
                                        <Text style={{ fontSize: 10, color: '#64748b', marginTop: 4, fontWeight: '700', textTransform: 'uppercase' }}>
                                            Status: {item.status.replace('_', ' ')}
                                        </Text>
                                    </View>
                                    <Feather name="chevron-right" size={16} color="#cbd5e1" />
                                </View>
                            </DataBlock>
                        </TouchableOpacity>
                    ))
                ) : (
                    <DataBlock style={{ alignItems: 'center', padding: 40 }}>
                        <Feather name="layers" size={24} color="#cbd5e1" />
                        <Text style={{ fontSize: 10, fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', marginTop: 16 }}>Zero active operations</Text>
                    </DataBlock>
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    header: { paddingHorizontal: 20, paddingVertical: 14, backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#e2e8f0', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    iconBtn: { width: 36, height: 36, backgroundColor: '#f1f5f9', borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
    headerText: { fontSize: 10, fontWeight: '900', color: '#0f172a', textTransform: 'uppercase', letterSpacing: 2 },
    identityBox: { alignItems: 'center', marginBottom: 40 },
    avatar: { width: 96, height: 96, borderRadius: 48, backgroundColor: '#0f172a', alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
    avatarText: { fontSize: 36, fontWeight: '900', color: 'white', letterSpacing: 2 },
    name: { fontSize: 24, fontWeight: '800', color: '#0f172a', marginBottom: 8 },
    role: { fontSize: 10, fontWeight: '800', color: '#3b82f6', letterSpacing: 2, marginBottom: 8 },
    idText: { fontSize: 10, fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase' }
});

export default EmployeeProfile;
