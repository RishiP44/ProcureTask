import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TextInput, StyleSheet, TouchableOpacity, ActivityIndicator, Share, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { DataBlock, WebBadge, WebSectionHeader } from '../components/Theme';

const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const Reports = ({ onSelectAssignment }: { onSelectAssignment?: (id: string) => void }) => {
    const { user } = useAuth();
    const isAdminOrHR = user?.role === 'Admin' || user?.role === 'HR';
    const [assignments, setAssignments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [roleFilter, setRoleFilter] = useState('all');

    useEffect(() => {
        const load = async () => {
            try {
                const endpoint = isAdminOrHR ? '/assignments' : '/assignments/my-assignments';
                const res = await api.get(endpoint);
                setAssignments(Array.isArray(res.data) ? res.data : []);
            } catch (e) {
                console.error(e);
                Alert.alert('Error', 'Could not load report data.');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [isAdminOrHR]);

    const filtered = assignments.filter(a => {
        const matchesSearch =
            (a.workflow?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (a.user?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (a.user?.companyName || '').toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'all' || a.status === statusFilter;
        const matchesRole =
            roleFilter === 'all' ||
            (roleFilter === 'Vendor' && a.user?.role === 'Vendor') ||
            (roleFilter === 'Employee' && a.user?.role === 'Employee');
        return matchesSearch && matchesStatus && matchesRole;
    });

    const totalCount = filtered.length;
    const pendingCount = filtered.filter(a => a.status === 'pending').length;
    const inProgressCount = filtered.filter(a => a.status === 'in_progress').length;
    const completedCount = filtered.filter(a => a.status === 'completed').length;
    const completionRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    const exportCSV = async () => {
        try {
            const headers = ['User / Company', 'Role', 'Workflow Name', 'Progress', 'Due Date', 'Status'];
            const rows = filtered.map(a => {
                const displayName =
                    a.user?.role === 'Vendor' && a.user?.companyName
                        ? `"${a.user.companyName} (Contact: ${a.user.name})"`
                        : `"${a.user?.name || 'Unknown'}"`;
                const progressPct = Math.round(
                    ((a.tasks?.filter((t: any) => t.status === 'completed').length || 0) / (a.tasks?.length || 1)) * 100
                );
                return [
                    displayName,
                    a.user?.role || 'N/A',
                    `"${a.workflow?.name || 'N/A'}"`,
                    `"${progressPct}%"`,
                    formatDate(a.dueDate),
                    (a.status || '').toUpperCase(),
                ].join(',');
            });
            const csv = [headers.join(','), ...rows].join('\n');
            await Share.share({
                message: csv,
                title: `ProcureTask_Report_${new Date().toISOString().slice(0, 10)}.csv`,
            });
        } catch (e) {
            Alert.alert('Export failed', 'Could not share CSV report.');
        }
    };

    const exportSummary = async () => {
        const text = [
            'PROCURETASK COMPLIANCE REPORT',
            `Generated: ${new Date().toLocaleString()}`,
            '',
            `Total: ${totalCount}`,
            `Completed: ${completedCount}`,
            `In Progress: ${inProgressCount}`,
            `Pending: ${pendingCount}`,
            `Completion Rate: ${completionRate}%`,
            '',
            ...filtered.map(a => {
                const pct = Math.round(
                    ((a.tasks?.filter((t: any) => t.status === 'completed').length || 0) / (a.tasks?.length || 1)) * 100
                );
                return `• ${a.user?.name || 'Unknown'} | ${a.workflow?.name || 'N/A'} | ${pct}% | ${a.status}`;
            }),
        ].join('\n');
        try {
            await Share.share({ message: text, title: 'ProcureTask Report' });
        } catch {
            Alert.alert('Export failed', 'Could not share report.');
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Reports</Text>
            <Text style={styles.subtitle}>Filtered assignment analytics and exports</Text>

            <View style={styles.statsGrid}>
                {[
                    ['Total', totalCount, '#0f172a'],
                    ['Pending', pendingCount, '#d97706'],
                    ['Active', inProgressCount, '#2563eb'],
                    ['Done %', `${completionRate}%`, '#059669'],
                ].map(([label, value, color]) => (
                    <DataBlock key={String(label)} style={[styles.statBox, { borderLeftColor: color as string, borderLeftWidth: 4 }]}>
                        <Text style={styles.statLabel}>{label}</Text>
                        <Text style={styles.statValue}>{value}</Text>
                    </DataBlock>
                ))}
            </View>

            <View style={styles.exportRow}>
                <TouchableOpacity style={styles.exportBtn} onPress={exportCSV}>
                    <Feather name="download" size={14} color="white" style={{ marginRight: 6 }} />
                    <Text style={styles.exportText}>CSV</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.exportBtn, { backgroundColor: '#475569' }]} onPress={exportSummary}>
                    <Feather name="file-text" size={14} color="white" style={{ marginRight: 6 }} />
                    <Text style={styles.exportText}>SUMMARY</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.searchContainer}>
                <Feather name="search" size={16} color="#94a3b8" />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search user, company, workflow..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholderTextColor="#94a3b8"
                />
            </View>

            <View style={styles.chipRow}>
                {['all', 'pending', 'in_progress', 'completed'].map(s => (
                    <TouchableOpacity
                        key={s}
                        style={[styles.chip, statusFilter === s && styles.chipActive]}
                        onPress={() => setStatusFilter(s)}
                    >
                        <Text style={[styles.chipText, statusFilter === s && styles.chipTextActive]}>
                            {s === 'all' ? 'All' : s.replace('_', ' ')}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {isAdminOrHR && (
                <View style={styles.chipRow}>
                    {['all', 'Employee', 'Vendor'].map(r => (
                        <TouchableOpacity
                            key={r}
                            style={[styles.chip, roleFilter === r && styles.chipActive]}
                            onPress={() => setRoleFilter(r)}
                        >
                            <Text style={[styles.chipText, roleFilter === r && styles.chipTextActive]}>
                                {r === 'all' ? 'All roles' : r}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            )}

            <WebSectionHeader title="Assignment Registry" count={filtered.length} />

            {loading ? (
                <ActivityIndicator color="#2563eb" size="large" style={{ marginTop: 40 }} />
            ) : (
                <FlatList
                    data={filtered}
                    keyExtractor={item => item._id}
                    renderItem={({ item }) => {
                        const pct = Math.round(
                            ((item.tasks?.filter((t: any) => t.status === 'completed').length || 0) /
                                (item.tasks?.length || 1)) * 100
                        );
                        const displayName =
                            item.user?.role === 'Vendor' && item.user?.companyName
                                ? item.user.companyName
                                : item.user?.name || 'Unknown';
                        return (
                            <TouchableOpacity
                                activeOpacity={0.7}
                                onPress={() => onSelectAssignment?.(item._id)}
                            >
                                <DataBlock>
                                    <View style={styles.cardTop}>
                                        <View style={{ flex: 1 }}>
                                            <Text style={styles.name}>{displayName}</Text>
                                            <Text style={styles.meta}>{item.user?.role} · {item.workflow?.name}</Text>
                                        </View>
                                        <WebBadge status={item.status} />
                                    </View>
                                    <View style={styles.footer}>
                                        <Text style={styles.footerText}>{pct}% complete</Text>
                                        <Text style={styles.footerText}>Due {formatDate(item.dueDate)}</Text>
                                    </View>
                                </DataBlock>
                            </TouchableOpacity>
                        );
                    }}
                    ListEmptyComponent={
                        <DataBlock style={{ alignItems: 'center', padding: 40 }}>
                            <Feather name="bar-chart-2" size={28} color="#cbd5e1" />
                            <Text style={styles.empty}>No matching records</Text>
                        </DataBlock>
                    }
                    contentContainerStyle={{ paddingBottom: 40 }}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20 },
    title: { fontSize: 26, fontWeight: '800', color: '#0f172a', letterSpacing: -1 },
    subtitle: { fontSize: 13, color: '#64748b', fontWeight: '600', marginBottom: 16, marginTop: 4 },
    statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 12 },
    statBox: { width: '48%', marginBottom: 0 },
    statLabel: { fontSize: 10, fontWeight: '900', color: '#64748b', textTransform: 'uppercase' },
    statValue: { fontSize: 22, fontWeight: '800', color: '#0f172a', marginTop: 4 },
    exportRow: { flexDirection: 'row', gap: 10, marginBottom: 14 },
    exportBtn: {
        flex: 1, backgroundColor: '#0f172a', height: 42, borderRadius: 8,
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center'
    },
    exportText: { color: 'white', fontSize: 11, fontWeight: '900', letterSpacing: 1 },
    searchContainer: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
        borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 4, paddingHorizontal: 12, height: 44, marginBottom: 12
    },
    searchInput: { flex: 1, marginLeft: 10, fontSize: 14, color: '#0f172a' },
    chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10 },
    chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, backgroundColor: '#f1f5f9' },
    chipActive: { backgroundColor: '#0f172a' },
    chipText: { fontSize: 11, fontWeight: '700', color: '#64748b', textTransform: 'capitalize' },
    chipTextActive: { color: 'white' },
    cardTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
    name: { fontSize: 14, fontWeight: '800', color: '#0f172a' },
    meta: { fontSize: 11, color: '#64748b', marginTop: 2, fontWeight: '600' },
    footer: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: '#f1f5f9', paddingTop: 10 },
    footerText: { fontSize: 11, fontWeight: '700', color: '#94a3b8' },
    empty: { fontSize: 11, fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', marginTop: 12 },
});

export default Reports;
