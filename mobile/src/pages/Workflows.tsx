import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity, Modal, TextInput, Alert, StatusBar, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import api from '../services/api';
import { DataBlock, WebBadge } from '../components/Theme';
import AssignTask from './AssignTask';

type Tab = 'templates' | 'assign';

const emptyTask = () => ({ name: '', type: 'checkbox' as string });

const Workflows = () => {
    const [tab, setTab] = useState<Tab>('templates');
    const [workflows, setWorkflows] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState<any>(null);
    const [newName, setNewName] = useState('');
    const [newDesc, setNewDesc] = useState('');
    const [audience, setAudience] = useState<'Employee' | 'Vendor'>('Employee');
    const [newTasks, setNewTasks] = useState([emptyTask()]);
    const [submitting, setSubmitting] = useState(false);
    const [historyModal, setHistoryModal] = useState<any[]>([]);
    const [showHistory, setShowHistory] = useState(false);
    const [assignWorkflowId, setAssignWorkflowId] = useState<string | undefined>();
    const [assignAudience, setAssignAudience] = useState<'Employee' | 'Vendor' | undefined>();
    const [audienceFilter, setAudienceFilter] = useState<'all' | 'Employee' | 'Vendor'>('all');

    const load = async () => {
        try {
            const res = await api.get('/workflows');
            setWorkflows(Array.isArray(res.data) ? res.data : []);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, []);

    const openCreate = () => {
        setEditing(null);
        setNewName('');
        setNewDesc('');
        setAudience('Employee');
        setNewTasks([emptyTask()]);
        setShowModal(true);
    };

    const openEdit = (item: any) => {
        setEditing(item);
        setNewName(item.name || '');
        setNewDesc(item.description || '');
        setAudience(item.audience === 'Vendor' ? 'Vendor' : 'Employee');
        setNewTasks(
            (item.tasks || []).map((t: any) => ({
                name: t.name,
                type: t.type === 'document' ? 'document' : 'checkbox',
            }))
        );
        if (!item.tasks?.length) setNewTasks([emptyTask()]);
        setShowModal(true);
    };

    const handleSave = async () => {
        if (!newName.trim()) return Alert.alert('Error', 'Template name is required.');
        setSubmitting(true);
        try {
            const validTasks = newTasks
                .filter(t => t.name.trim() !== '')
                .map(t => ({
                    name: t.name,
                    type: t.type === 'document' ? 'document' : 'checkbox',
                    required: true,
                }));

            const payload = {
                name: newName,
                description: newDesc,
                audience,
                tasks: validTasks.length > 0 ? validTasks : [{ name: 'Initial Review', type: 'checkbox', required: true }],
            };

            if (editing) {
                // Check active assignments — backend may create a new version
                try {
                    const check = await api.get(`/workflows/${editing._id}/assignments-check`);
                    if (check.data?.activeCount > 0) {
                        Alert.alert(
                            'Active assignments',
                            `${check.data.activeCount} active assignment(s) found. Saving will create a new version.`,
                            [
                                { text: 'Cancel', style: 'cancel' },
                                {
                                    text: 'Save new version',
                                    onPress: async () => {
                                        await api.put(`/workflows/${editing._id}`, payload);
                                        setShowModal(false);
                                        load();
                                    },
                                },
                            ]
                        );
                        setSubmitting(false);
                        return;
                    }
                } catch {
                    // proceed with save
                }
                await api.put(`/workflows/${editing._id}`, payload);
                setShowModal(false);
                load();
            } else {
                const res = await api.post('/workflows', payload);
                setShowModal(false);
                setAssignWorkflowId(res.data._id);
                setAssignAudience(audience);
                setTab('assign');
                load();
            }
        } catch (e: any) {
            Alert.alert('Error', e.response?.data?.message || 'Failed to save workflow.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleArchive = (item: any) => {
        Alert.alert('Archive workflow', `Archive "${item.name}"?`, [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Archive',
                style: 'destructive',
                onPress: async () => {
                    try {
                        await api.delete(`/workflows/${item._id}`);
                        load();
                    } catch (err: any) {
                        Alert.alert('Error', err.response?.data?.message || 'Failed to archive.');
                    }
                },
            },
        ]);
    };

    const showVersionHistory = async (item: any) => {
        try {
            const res = await api.get(`/workflows/${item._id}/history`);
            setHistoryModal(Array.isArray(res.data) ? res.data : []);
            setShowHistory(true);
        } catch {
            Alert.alert('Error', 'Could not load version history.');
        }
    };

    const filtered = workflows.filter(w => {
        const matchesSearch = [w.name, w.description, w.audience].join(' ').toLowerCase().includes(search.toLowerCase());
        const matchesAudience = audienceFilter === 'all' || (w.audience || 'Employee') === audienceFilter;
        return matchesSearch && matchesAudience;
    });

    return (
        <SafeAreaView style={styles.container} edges={['bottom']}>
            <StatusBar barStyle="dark-content" />

            <View style={{ paddingHorizontal: 20, paddingTop: 12 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={styles.title}>Workflows</Text>
                    {tab === 'templates' && (
                        <TouchableOpacity style={styles.addBtn} onPress={openCreate}>
                            <Feather name="plus" size={18} color="white" />
                        </TouchableOpacity>
                    )}
                </View>

                <View style={styles.tabRow}>
                    <TouchableOpacity
                        style={[styles.tab, tab === 'templates' && styles.tabActive]}
                        onPress={() => setTab('templates')}
                    >
                        <Text style={[styles.tabText, tab === 'templates' && styles.tabTextActive]}>Templates</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tab, tab === 'assign' && styles.tabActive]}
                        onPress={() => {
                            setAssignWorkflowId(undefined);
                            setAssignAudience(undefined);
                            setTab('assign');
                        }}
                    >
                        <Text style={[styles.tabText, tab === 'assign' && styles.tabTextActive]}>Assign</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {tab === 'assign' ? (
                <AssignTask
                    key={`${assignWorkflowId || 'none'}-${assignAudience || 'none'}`}
                    initialWorkflowId={assignWorkflowId}
                    initialAudience={assignAudience}
                />
            ) : (
                <View style={{ flex: 1, paddingHorizontal: 20 }}>
                    <View style={styles.searchContainer}>
                        <Feather name="search" size={16} color="#94a3b8" />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Search templates..."
                            value={search}
                            onChangeText={setSearch}
                            placeholderTextColor="#94a3b8"
                        />
                    </View>

                    <View style={{ flexDirection: 'row', gap: 8, marginBottom: 14 }}>
                        {(['all', 'Employee', 'Vendor'] as const).map(f => (
                            <TouchableOpacity
                                key={f}
                                style={[styles.filterChip, audienceFilter === f && styles.filterChipActive]}
                                onPress={() => setAudienceFilter(f)}
                            >
                                <Text style={[styles.filterChipText, audienceFilter === f && { color: 'white' }]}>
                                    {f === 'all' ? 'All' : f}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {loading ? (
                        <ActivityIndicator color="#2563eb" size="large" style={{ marginTop: 40 }} />
                    ) : (
                        <FlatList
                            data={filtered}
                            keyExtractor={item => item._id}
                            renderItem={({ item }) => (
                                <DataBlock>
                                    <View style={styles.topRow}>
                                        <Text style={styles.name}>{item.name}</Text>
                                        <WebBadge status={item.isArchived || item.status === 'archived' ? 'ARCHIVED' : 'ACTIVE'} />
                                    </View>
                                    <Text style={styles.desc} numberOfLines={2}>{item.description}</Text>
                                    <View style={styles.metaRow}>
                                        <Text style={styles.steps}>{item.tasks?.length || 0} STEPS</Text>
                                        <Text style={styles.audience}>{item.audience || 'Employee'}</Text>
                                        {item.version != null && <Text style={styles.version}>v{item.version}</Text>}
                                    </View>
                                    <View style={styles.actions}>
                                        <TouchableOpacity style={styles.actionBtn} onPress={() => openEdit(item)}>
                                            <Feather name="edit-2" size={14} color="#2563eb" />
                                            <Text style={styles.actionText}>Edit</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity style={styles.actionBtn} onPress={() => showVersionHistory(item)}>
                                            <Feather name="clock" size={14} color="#64748b" />
                                            <Text style={[styles.actionText, { color: '#64748b' }]}>History</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={styles.actionBtn}
                                            onPress={() => {
                                                setAssignWorkflowId(item._id);
                                                setAssignAudience(item.audience === 'Vendor' ? 'Vendor' : 'Employee');
                                                setTab('assign');
                                            }}
                                        >
                                            <Feather name="send" size={14} color="#059669" />
                                            <Text style={[styles.actionText, { color: '#059669' }]}>Assign</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity style={styles.actionBtn} onPress={() => handleArchive(item)}>
                                            <Feather name="archive" size={14} color="#ef4444" />
                                            <Text style={[styles.actionText, { color: '#ef4444' }]}>Archive</Text>
                                        </TouchableOpacity>
                                    </View>
                                </DataBlock>
                            )}
                            ListEmptyComponent={
                                <DataBlock style={{ alignItems: 'center', padding: 40 }}>
                                    <Text style={styles.empty}>No workflow templates</Text>
                                </DataBlock>
                            }
                            contentContainerStyle={{ paddingBottom: 100 }}
                        />
                    )}
                </View>
            )}

            <Modal visible={showModal} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>{editing ? 'Edit Template' : 'New Process Template'}</Text>
                            <TouchableOpacity onPress={() => setShowModal(false)} style={styles.closeBtn}>
                                <Feather name="x" size={20} color="#64748b" />
                            </TouchableOpacity>
                        </View>
                        <ScrollView contentContainerStyle={{ padding: 24 }} keyboardShouldPersistTaps="handled">
                            <Text style={styles.inputLabel}>Template Name</Text>
                            <TextInput style={styles.input} placeholder="e.g. Executive Onboarding" value={newName} onChangeText={setNewName} />

                            <Text style={[styles.inputLabel, { marginTop: 8 }]}>Description</Text>
                            <TextInput style={styles.input} placeholder="Describe the process..." value={newDesc} onChangeText={setNewDesc} />

                            <Text style={[styles.inputLabel, { marginTop: 8 }]}>Audience</Text>
                            <View style={styles.roleRow}>
                                {(['Employee', 'Vendor'] as const).map(a => (
                                    <TouchableOpacity
                                        key={a}
                                        style={[styles.roleChip, audience === a && styles.roleChipActive]}
                                        onPress={() => setAudience(a)}
                                    >
                                        <Text style={[styles.roleChipText, audience === a && styles.roleChipTextActive]}>{a}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, marginBottom: 8 }}>
                                <Text style={styles.inputLabel}>Process Steps</Text>
                                <TouchableOpacity onPress={() => setNewTasks([...newTasks, emptyTask()])}>
                                    <Text style={{ fontSize: 10, fontWeight: '800', color: '#3b82f6' }}>+ ADD STEP</Text>
                                </TouchableOpacity>
                            </View>

                            {newTasks.map((t, i) => (
                                <View key={i} style={{ flexDirection: 'row', marginBottom: 8, alignItems: 'center' }}>
                                    <TextInput
                                        style={[styles.input, { flex: 1, marginBottom: 0, borderTopRightRadius: 0, borderBottomRightRadius: 0 }]}
                                        placeholder="Task Name"
                                        value={t.name}
                                        onChangeText={val => {
                                            const arr = [...newTasks];
                                            arr[i].name = val;
                                            setNewTasks(arr);
                                        }}
                                    />
                                    <TouchableOpacity
                                        style={[styles.input, {
                                            width: 90, marginBottom: 0, borderTopLeftRadius: 0, borderBottomLeftRadius: 0,
                                            backgroundColor: '#f1f5f9', alignItems: 'center', justifyContent: 'center'
                                        }]}
                                        onPress={() => {
                                            const arr = [...newTasks];
                                            arr[i].type = arr[i].type === 'document' ? 'checkbox' : 'document';
                                            setNewTasks(arr);
                                        }}
                                    >
                                        <Text style={{ fontSize: 9, fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>
                                            {t.type === 'document' ? 'DOC' : 'CHECK'}
                                        </Text>
                                    </TouchableOpacity>
                                    {newTasks.length > 1 && (
                                        <TouchableOpacity
                                            onPress={() => setNewTasks(newTasks.filter((_, idx) => idx !== i))}
                                            style={{ marginLeft: 8 }}
                                        >
                                            <Feather name="trash-2" size={16} color="#ef4444" />
                                        </TouchableOpacity>
                                    )}
                                </View>
                            ))}

                            <TouchableOpacity style={styles.submitBtn} onPress={handleSave} disabled={submitting}>
                                <Text style={styles.submitBtnText}>
                                    {submitting ? 'SAVING...' : editing ? 'SAVE TEMPLATE' : 'GENERATE TEMPLATE'}
                                </Text>
                            </TouchableOpacity>
                        </ScrollView>
                    </View>
                </View>
            </Modal>

            <Modal visible={showHistory} animationType="fade" transparent>
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { maxHeight: '60%' }]}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Version History</Text>
                            <TouchableOpacity onPress={() => setShowHistory(false)} style={styles.closeBtn}>
                                <Feather name="x" size={20} color="#64748b" />
                            </TouchableOpacity>
                        </View>
                        <ScrollView contentContainerStyle={{ padding: 24 }}>
                            {historyModal.length === 0 ? (
                                <Text style={styles.empty}>No history available</Text>
                            ) : (
                                historyModal.map((h: any, i: number) => (
                                    <DataBlock key={h._id || i}>
                                        <Text style={styles.name}>{h.name} {h.version != null ? `v${h.version}` : ''}</Text>
                                        <Text style={styles.desc}>{h.description}</Text>
                                        <Text style={styles.steps}>{h.tasks?.length || 0} STEPS · {h.createdAt ? new Date(h.createdAt).toLocaleDateString() : ''}</Text>
                                    </DataBlock>
                                ))
                            )}
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    title: { fontSize: 26, fontWeight: '800', color: '#0f172a', letterSpacing: -1 },
    addBtn: { width: 40, height: 40, backgroundColor: '#0f172a', borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
    tabRow: { flexDirection: 'row', backgroundColor: '#f1f5f9', borderRadius: 10, padding: 4, marginTop: 16, marginBottom: 12 },
    tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 8 },
    tabActive: { backgroundColor: 'white' },
    tabText: { fontSize: 12, fontWeight: '800', color: '#64748b' },
    tabTextActive: { color: '#0f172a' },
    searchContainer: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
        borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 4, paddingHorizontal: 12, height: 44, marginBottom: 16
    },
    searchInput: { flex: 1, marginLeft: 10, fontSize: 14, color: '#0f172a' },
    topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    name: { fontSize: 16, fontWeight: '700', color: '#0f172a', flex: 1, marginRight: 8 },
    desc: { fontSize: 13, color: '#64748b', lineHeight: 18 },
    metaRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 10 },
    steps: { fontSize: 9, fontWeight: '900', color: '#3b82f6', letterSpacing: 1.5 },
    audience: { fontSize: 9, fontWeight: '900', color: '#d97706', letterSpacing: 1 },
    version: { fontSize: 9, fontWeight: '900', color: '#94a3b8', letterSpacing: 1 },
    actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#f1f5f9' },
    actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 6, backgroundColor: '#f8fafc', borderRadius: 6 },
    actionText: { fontSize: 10, fontWeight: '800', color: '#2563eb' },
    empty: { fontSize: 11, fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', textAlign: 'center' },
    filterChip: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 14, backgroundColor: '#f1f5f9' },
    filterChipActive: { backgroundColor: '#0f172a' },
    filterChipText: { fontSize: 11, fontWeight: '800', color: '#64748b' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.4)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: 'white', borderTopLeftRadius: 32, borderTopRightRadius: 32, maxHeight: '92%' },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 24, paddingBottom: 16 },
    modalTitle: { fontSize: 20, fontWeight: '800', color: '#0f172a' },
    closeBtn: { width: 40, height: 40, backgroundColor: '#f1f5f9', borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
    inputLabel: { fontSize: 10, fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 8 },
    input: { backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12, height: 50, paddingHorizontal: 16, marginBottom: 12, fontSize: 14, fontWeight: '600', color: '#0f172a' },
    roleRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
    roleChip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10, backgroundColor: '#f1f5f9' },
    roleChipActive: { backgroundColor: '#0f172a' },
    roleChipText: { fontSize: 12, fontWeight: '800', color: '#64748b' },
    roleChipTextActive: { color: 'white' },
    submitBtn: { backgroundColor: '#0f172a', height: 50, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginTop: 16, marginBottom: 20 },
    submitBtnText: { color: 'white', fontSize: 11, fontWeight: '900', letterSpacing: 2 },
});

export default Workflows;
