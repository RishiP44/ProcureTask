import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TextInput, StyleSheet, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { Feather } from '@expo/vector-icons';
import api from '../services/api';
import { DataBlock, WebBadge, WebSectionHeader } from '../components/Theme';

type Filter = 'all' | 'pending' | 'in_progress' | 'completed';

const MyTasks = ({ onSelectAssignment }: { onSelectAssignment: (id: string) => void }) => {
    const [assignments, setAssignments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<Filter>('all');
    const [search, setSearch] = useState('');

    const load = async () => {
        try {
            setLoading(true);
            const res = await api.get('/assignments/my-assignments');
            setAssignments(Array.isArray(res.data) ? res.data : []);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, []);

    const filtered = assignments.filter(a => {
        const matchesFilter = filter === 'all' || a.status === filter;
        const matchesSearch = (a.workflow?.name || '').toLowerCase().includes(search.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    const stats = {
        pending: assignments.filter(a => a.status === 'pending').length,
        in_progress: assignments.filter(a => a.status === 'in_progress').length,
        completed: assignments.filter(a => a.status === 'completed').length,
    };

    const totalTasks = assignments.reduce((acc, a) => acc + (a.tasks?.length || 0), 0);
    const completedTasks = assignments.reduce(
        (acc, a) => acc + (a.tasks?.filter((t: any) => t.status === 'completed').length || 0),
        0
    );
    const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    const isOverdue = (a: any) =>
        a.dueDate && a.status !== 'completed' && new Date(a.dueDate) < new Date();

    return (
        <View style={styles.container}>
            <Text style={styles.title}>My Tasks</Text>
            <Text style={styles.subtitle}>{totalTasks} tasks across your assigned workflows</Text>

            <DataBlock style={{ marginBottom: 16 }}>
                <View style={styles.progressHeader}>
                    <Text style={styles.progressLabel}>Overall Progress</Text>
                    <Text style={styles.progressPct}>{progress}%</Text>
                </View>
                <View style={styles.progressTrack}>
                    <View style={[styles.progressFill, { width: `${progress}%` }]} />
                </View>
            </DataBlock>

            <View style={styles.filterRow}>
                {([
                    ['pending', 'Pending', stats.pending, '#fbbf24'],
                    ['in_progress', 'Active', stats.in_progress, '#3b82f6'],
                    ['completed', 'Done', stats.completed, '#10b981'],
                ] as const).map(([key, label, count, color]) => (
                    <TouchableOpacity
                        key={key}
                        style={[styles.filterChip, filter === key && { borderColor: color, backgroundColor: '#fff' }]}
                        onPress={() => setFilter(key)}
                    >
                        <Text style={[styles.filterCount, { color }]}>{count}</Text>
                        <Text style={styles.filterLabel}>{label}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            <View style={styles.searchContainer}>
                <Feather name="search" size={16} color="#94a3b8" />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Filter by workflow name..."
                    value={search}
                    onChangeText={setSearch}
                    placeholderTextColor="#94a3b8"
                />
                {filter !== 'all' && (
                    <TouchableOpacity onPress={() => setFilter('all')}>
                        <Text style={styles.viewAll}>ALL</Text>
                    </TouchableOpacity>
                )}
            </View>

            <WebSectionHeader title="Assignments" count={filtered.length} />

            {loading && assignments.length === 0 ? (
                <ActivityIndicator color="#2563eb" size="large" style={{ marginTop: 40 }} />
            ) : (
                <FlatList
                    data={filtered}
                    keyExtractor={item => item._id}
                    refreshControl={<RefreshControl refreshing={loading} onRefresh={load} tintColor="#2563eb" />}
                    renderItem={({ item }) => {
                        const pct = Math.round(
                            ((item.tasks?.filter((t: any) => t.status === 'completed').length || 0) /
                                (item.tasks?.length || 1)) * 100
                        );
                        const overdue = isOverdue(item);
                        return (
                            <TouchableOpacity activeOpacity={0.7} onPress={() => onSelectAssignment(item._id)}>
                                <DataBlock>
                                    <View style={styles.cardTop}>
                                        <Text style={styles.workflowName} numberOfLines={1}>{item.workflow?.name}</Text>
                                        <WebBadge status={overdue ? 'overdue' : item.status} />
                                    </View>
                                    {item.dueDate && (
                                        <Text style={[styles.due, overdue && { color: '#ef4444' }]}>
                                            Due {new Date(item.dueDate).toLocaleDateString()}
                                            {overdue ? ' · OVERDUE' : ''}
                                        </Text>
                                    )}
                                    <View style={styles.progressRow}>
                                        <View style={styles.miniTrack}>
                                            <View style={[styles.miniFill, { width: `${pct}%` }]} />
                                        </View>
                                        <Text style={styles.miniPct}>{pct}%</Text>
                                        <Feather name="chevron-right" size={16} color="#cbd5e1" />
                                    </View>
                                </DataBlock>
                            </TouchableOpacity>
                        );
                    }}
                    ListEmptyComponent={
                        <DataBlock style={{ alignItems: 'center', padding: 40 }}>
                            <Feather name="clipboard" size={28} color="#cbd5e1" />
                            <Text style={styles.empty}>No matching tasks</Text>
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
    title: { fontSize: 26, fontWeight: '800', color: '#0f172a', letterSpacing: -1, marginTop: 2 },
    subtitle: { fontSize: 13, color: '#64748b', fontWeight: '600', marginBottom: 16, marginTop: 4 },
    progressHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    progressLabel: { fontSize: 10, fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1 },
    progressPct: { fontSize: 12, fontWeight: '900', color: '#2563eb' },
    progressTrack: { height: 8, backgroundColor: '#f1f5f9', borderRadius: 4, overflow: 'hidden' },
    progressFill: { height: '100%', backgroundColor: '#3b82f6', borderRadius: 4 },
    filterRow: { flexDirection: 'row', gap: 8, marginBottom: 14 },
    filterChip: {
        flex: 1, backgroundColor: '#fff', borderWidth: 1.5, borderColor: '#e2e8f0',
        borderRadius: 10, padding: 12, alignItems: 'center'
    },
    filterCount: { fontSize: 18, fontWeight: '900' },
    filterLabel: { fontSize: 9, fontWeight: '800', color: '#64748b', textTransform: 'uppercase', marginTop: 2 },
    searchContainer: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
        borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 4, paddingHorizontal: 12, height: 44, marginBottom: 16
    },
    searchInput: { flex: 1, marginLeft: 10, fontSize: 14, color: '#0f172a' },
    viewAll: { fontSize: 10, fontWeight: '900', color: '#2563eb', letterSpacing: 1 },
    cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    workflowName: { flex: 1, fontSize: 15, fontWeight: '700', color: '#0f172a', marginRight: 8 },
    due: { fontSize: 11, fontWeight: '700', color: '#64748b', marginBottom: 10 },
    progressRow: { flexDirection: 'row', alignItems: 'center' },
    miniTrack: { flex: 1, height: 6, backgroundColor: '#f1f5f9', borderRadius: 3, overflow: 'hidden', marginRight: 10 },
    miniFill: { height: '100%', backgroundColor: '#3b82f6' },
    miniPct: { fontSize: 11, fontWeight: '900', color: '#64748b', marginRight: 8 },
    empty: { fontSize: 11, fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', marginTop: 12 },
});

export default MyTasks;
