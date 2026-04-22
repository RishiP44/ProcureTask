import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, StatusBar, RefreshControl, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { DataBlock, WebBadge, WebSectionHeader } from '../components/Theme';

const Dashboard = ({ onSelectAssignment, setScreen }: { onSelectAssignment: (id: string) => void, setScreen: (s: string) => void }) => {
    const { user } = useAuth();
    const [assignments, setAssignments] = useState<any[]>([]);
    const [stats, setStats] = useState({ total: 0, completed: 0, pending: 0, totalStaff: 0 });
    const [loading, setLoading] = useState(true);

    const loadData = async () => {
        try {
            setLoading(true);
            const endpoint = (user?.role === 'Admin' || user?.role === 'HR') ? '/assignments' : '/assignments/my-assignments';
            
            const [assigRes, usersRes] = await Promise.all([
                api.get(endpoint),
                (user?.role === 'Admin' || user?.role === 'HR') ? api.get('/users') : Promise.resolve({ data: [] })
            ]);

            setAssignments(Array.isArray(assigRes.data) ? assigRes.data : []);
            
            const staffData = Array.isArray(usersRes.data) ? usersRes.data.filter((u:any) => u.role !== 'Admin') : [];
            setStats({
                total: assigRes.data.length || 0,
                completed: assigRes.data.filter((a: any) => a.status === 'completed').length,
                pending: assigRes.data.filter((a: any) => a.status !== 'completed').length,
                totalStaff: staffData.length || 0
            });
        } catch (error: any) {
            console.error('Data load error:', error);
            const status = error.response?.status;
            if (status === 401) {
                // Auth failure handled by context usually, but good to log
            } else {
                import('react-native').then(({ Alert }) => {
                    Alert.alert(
                        "Connectivity Error", 
                        `System unable to reach the central ledger at ${api.defaults.baseURL}. Ensure your device is on the same WiFi as the host machine.`
                    );
                });
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const DashboardHeader = () => {
        const isHR = user?.role === 'Admin' || user?.role === 'HR';
        const total = assignments.length;
        const completionRate = total > 0 ? Math.round((stats.completed / total) * 100) : 0;
        
        // Calculate chart widths
        const pPending = total > 0 ? (stats.pending / total) * 100 : 0;
        const pActive = total > 0 ? ((stats.total - stats.completed - stats.pending) / total) * 100 : 0;
        const pCompleted = total > 0 ? (stats.completed / total) * 100 : 0;

        return (
            <View style={styles.header}>
                <Text style={styles.systemsSub}>SYSTEMS OVERVIEW</Text>
                <Text style={styles.welcome}>Performance Dashboard</Text>
                <Text style={styles.date}>Monitoring active workflows for <Text style={{ fontWeight: '800', color: '#0f172a' }}>{user?.name}</Text></Text>
                
                {/* Admin Quick Actions */}
                {isHR && (
                    <View style={styles.adminActions}>
                        <TouchableOpacity style={styles.primaryBtn} onPress={() => setScreen('Employees')}>
                            <Text style={styles.primaryBtnText}>Staff Directory</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: '#3b82f6' }]} onPress={() => setScreen('AssignTask')}>
                            <Feather name="send" size={14} color="white" style={{ marginRight: 6 }} />
                            <Text style={styles.primaryBtnText}>Initiate Flow</Text>
                        </TouchableOpacity>
                    </View>
                )}

                <View style={[styles.statsRow, { flexWrap: 'wrap' }]}>
                    {isHR && (
                        <DataBlock style={[styles.statBox, { borderLeftColor: '#0f172a', borderLeftWidth: 4, width: '48%' }]}>
                            <View style={[styles.iconWrap, { backgroundColor: '#f1f5f9' }]}><Feather name="users" size={16} color="#475569" /></View>
                            <Text style={styles.statLabel}>Total Staff</Text>
                            <Text style={styles.statValue}>{stats.totalStaff}</Text>
                        </DataBlock>
                    )}
                    <DataBlock style={[styles.statBox, { borderLeftColor: '#fbbf24', borderLeftWidth: 4, width: isHR ? '48%' : '100%' }]}>
                        <View style={[styles.iconWrap, { backgroundColor: '#fef3c7' }]}><Feather name="clock" size={16} color="#d97706" /></View>
                        <Text style={styles.statLabel}>Pending</Text>
                        <Text style={styles.statValue}>{stats.pending}</Text>
                        <Text style={styles.statHint}>Awaiting Action</Text>
                    </DataBlock>
                    <DataBlock style={[styles.statBox, { borderLeftColor: '#3b82f6', borderLeftWidth: 4, width: '48%' }]}>
                        <View style={[styles.iconWrap, { backgroundColor: '#eff6ff' }]}><Feather name="activity" size={16} color="#2563eb" /></View>
                        <Text style={styles.statLabel}>Active</Text>
                        <Text style={styles.statValue}>{stats.total - stats.completed - stats.pending}</Text>
                        <Text style={[styles.statHint, { color: '#3b82f6' }]}>In Progress</Text>
                    </DataBlock>
                    <DataBlock style={[styles.statBox, { borderLeftColor: '#10b981', borderLeftWidth: 4, width: '48%' }]}>
                        <View style={[styles.iconWrap, { backgroundColor: '#ecfdf5' }]}><Feather name="shield" size={16} color="#059669" /></View>
                        <Text style={styles.statLabel}>Reliability</Text>
                        <Text style={styles.statValue}>{completionRate}%</Text>
                        <Text style={[styles.statHint, { color: '#10b981' }]}>Completion Rate</Text>
                    </DataBlock>
                </View>

                {/* Status Distribution Chart (Web Parity) */}
                <DataBlock style={{ padding: 20, marginBottom: 32 }}>
                    <Text style={{ fontSize: 10, fontWeight: '900', color: '#0f172a', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16 }}>Status Distribution</Text>
                    <View style={{ flexDirection: 'row', height: 12, borderRadius: 6, overflow: 'hidden', marginBottom: 16 }}>
                        {pCompleted > 0 && <View style={{ width: `${pCompleted}%`, backgroundColor: '#10b981' }} />}
                        {pActive > 0 && <View style={{ width: `${pActive}%`, backgroundColor: '#3b82f6' }} />}
                        {pPending > 0 && <View style={{ width: `${pPending}%`, backgroundColor: '#fbbf24' }} />}
                        {total === 0 && <View style={{ width: '100%', backgroundColor: '#f1f5f9' }} />}
                    </View>
                    <View style={styles.chartLegend}>
                        <View style={styles.legendItem}><View style={[styles.dot, { backgroundColor: '#10b981' }]} /><Text style={styles.legendText}>Completed</Text></View>
                        <View style={styles.legendItem}><View style={[styles.dot, { backgroundColor: '#3b82f6' }]} /><Text style={styles.legendText}>Active</Text></View>
                        <View style={styles.legendItem}><View style={[styles.dot, { backgroundColor: '#fbbf24' }]} /><Text style={styles.legendText}>Pending</Text></View>
                    </View>
                </DataBlock>

                <WebSectionHeader title={isHR ? "Enterprise Activity Feed" : "My Current Obligations"} />
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container} edges={['bottom']}>
            <StatusBar barStyle="dark-content" />
            <FlatList
                data={assignments}
                keyExtractor={(item) => item._id}
                ListHeaderComponent={DashboardHeader}
                renderItem={({ item }) => {
                    const pct = Math.round(((item.tasks?.filter((t: any) => t.status === 'completed').length || 0) / (item.tasks?.length || 1)) * 100);
                    return (
                        <TouchableOpacity 
                            activeOpacity={0.7}
                            onPress={() => onSelectAssignment(item._id)}
                            style={styles.cardMargin}
                        >
                            <DataBlock style={{ padding: 0 }}>
                                <View style={{ padding: 16, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' }}>
                                    <View style={styles.topRow}>
                                        <Text style={styles.workflowName}>{item.workflow?.name}</Text>
                                        <WebBadge status={item.status} />
                                    </View>
                                    
                                    {/* Action Row matching Web */}
                                    { (user?.role === 'Admin' || user?.role === 'HR') ? (
                                        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 12 }}>
                                            <View style={{ width: 28, height: 28, backgroundColor: '#f1f5f9', borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginRight: 10 }}>
                                                <Text style={{ fontSize: 11, fontWeight: '800', color: '#64748b' }}>{(item.user?.name || 'U').charAt(0)}</Text>
                                            </View>
                                            <View>
                                                <Text style={{ fontSize: 12, fontWeight: '800', color: '#0f172a', textTransform: 'uppercase' }}>{item.user?.name || 'Unknown'}</Text>
                                                <Text style={{ fontSize: 9, fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase' }}>{item.user?.role || 'EMPLOYEE'}</Text>
                                            </View>
                                        </View>
                                    ) : (
                                        <Text style={styles.metaText}>Reference: {(item._id || '').substring(0, 8)}</Text>
                                    )}
                                </View>

                                {/* Progress Bar matching Web */}
                                <View style={{ flexDirection: 'row', alignItems: 'center', padding: 16 }}>
                                    <View style={{ flex: 1, height: 6, backgroundColor: '#f1f5f9', borderRadius: 3, overflow: 'hidden', marginRight: 12 }}>
                                        <View style={{ height: '100%', backgroundColor: '#3b82f6', borderRadius: 3, width: `${pct}%` }} />
                                    </View>
                                    <Text style={{ fontSize: 11, fontWeight: '900', color: '#64748b' }}>{pct}%</Text>
                                    <Feather name="chevron-right" size={16} color="#cbd5e1" style={{ marginLeft: 16 }} />
                                </View>
                            </DataBlock>
                        </TouchableOpacity>
                    );
                }}
                ListEmptyComponent={
                    <View style={styles.empty}>
                        <Text style={styles.emptyText}>No assignments found in your queue.</Text>
                    </View>
                }
                refreshControl={
                    <RefreshControl refreshing={loading} onRefresh={loadData} tintColor="#2563eb" />
                }
                contentContainerStyle={{ paddingBottom: 40 }}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f1f5f9'
    },
    header: {
        padding: 20
    },
    systemsSub: {
        fontSize: 10,
        fontWeight: '900',
        color: '#3b82f6',
        letterSpacing: 2,
        marginBottom: 4
    },
    welcome: {
        fontSize: 26,
        fontWeight: '800',
        color: '#0f172a',
        letterSpacing: -1
    },
    date: {
        fontSize: 13,
        fontWeight: '600',
        color: '#64748b',
        marginBottom: 24,
        marginTop: 4
    },
    statsRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 24,
        flexWrap: 'wrap'
    },
    statBox: {
        marginBottom: 8,
        backgroundColor: 'white'
    },
    iconWrap: {
        width: 32,
        height: 32,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12
    },
    statLabel: {
        fontSize: 10,
        fontWeight: '900',
        color: '#64748b',
        textTransform: 'uppercase',
        letterSpacing: 1
    },
    statValue: {
        fontSize: 28,
        fontWeight: '800',
        color: '#0f172a',
        marginTop: 4,
        letterSpacing: -1
    },
    statHint: {
        fontSize: 10,
        fontWeight: '800',
        color: '#94a3b8',
        textTransform: 'uppercase',
        marginTop: 6
    },
    adminActions: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 24,
        marginTop: -8
    },
    primaryBtn: {
        flex: 1,
        backgroundColor: '#0f172a',
        height: 40,
        borderRadius: 8,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8
    },
    primaryBtnText: {
        color: 'white',
        fontSize: 11,
        fontWeight: '900',
        textTransform: 'uppercase',
        letterSpacing: 1
    },
    chartLegend: {
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 6
    },
    legendText: {
        fontSize: 10,
        fontWeight: '700',
        color: '#64748b',
        textTransform: 'uppercase'
    },
    cardMargin: {
        paddingHorizontal: 20
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    topRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
        marginRight: 12
    },
    workflowName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#0f172a'
    },
    metaText: {
        fontSize: 12,
        color: '#94a3b8'
    },
    empty: {
        padding: 40,
        alignItems: 'center'
    },
    emptyText: {
        color: '#94a3b8',
        fontSize: 14
    }
});

export default Dashboard;
