import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator, Modal, FlatList, StatusBar, StyleSheet, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import api from '../services/api';
import { DataBlock, WebSectionHeader } from '../components/Theme';

const AssignTask = ({
    initialAudience,
    initialWorkflowId,
}: {
    initialAudience?: 'Employee' | 'Vendor';
    initialWorkflowId?: string;
} = {}) => {
    const [users, setUsers] = useState<any[]>([]);
    const [workflows, setWorkflows] = useState<any[]>([]);
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [selectedWorkflow, setSelectedWorkflow] = useState<any>(null);
    const [audience, setAudience] = useState<'Employee' | 'Vendor'>(initialAudience || 'Employee');
    const [dueDate, setDueDate] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [showUserModal, setShowUserModal] = useState(false);
    const [showWorkflowModal, setShowWorkflowModal] = useState(false);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [usersRes, workflowsRes] = await Promise.all([
                api.get('/users'),
                api.get('/workflows'),
            ]);
            const allUsers = Array.isArray(usersRes.data) ? usersRes.data.filter((u: any) => u.role !== 'Admin') : [];
            const allWorkflows = Array.isArray(workflowsRes.data) ? workflowsRes.data : [];
            setUsers(allUsers);
            setWorkflows(allWorkflows);

            if (initialWorkflowId) {
                const wf = allWorkflows.find((w: any) => w._id === initialWorkflowId);
                if (wf) {
                    setSelectedWorkflow(wf);
                    if (wf.audience === 'Vendor') setAudience('Vendor');
                    else setAudience('Employee');
                }
            } else if (initialAudience) {
                setAudience(initialAudience);
            }
        } catch {
            Alert.alert('Error', 'Failed to load assign data.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, [initialWorkflowId, initialAudience]);

    const filteredUsers = users.filter(u =>
        audience === 'Vendor' ? u.role === 'Vendor' : u.role === 'Employee'
    );
    const filteredWorkflows = workflows.filter(w =>
        (w.audience || 'Employee') === audience && !w.isArchived
    );

    const handleSubmit = async () => {
        if (!selectedUser || !selectedWorkflow) {
            Alert.alert('Incomplete', 'Please select both a person and a workflow.');
            return;
        }
        try {
            setSubmitting(true);
            await api.post('/assignments', {
                userId: selectedUser._id,
                workflowId: selectedWorkflow._id,
                dueDate: dueDate || undefined,
            });
            Alert.alert('Assigned', 'Workflow assigned successfully. The assignee will be notified.');
            setSelectedUser(null);
            setSelectedWorkflow(null);
            setDueDate('');
        } catch (error: any) {
            Alert.alert('Error', error.response?.data?.message || 'Failed to assign workflow.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <View style={[styles.container, { alignItems: 'center', justifyContent: 'center' }]}>
                <ActivityIndicator size="large" color="#3b82f6" />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={[]}>
            <StatusBar barStyle="dark-content" />
            <ScrollView style={{ padding: 20 }} keyboardShouldPersistTaps="handled">
                <WebSectionHeader title="Assign Workflow" />

                <View style={styles.audienceRow}>
                    {(['Employee', 'Vendor'] as const).map(a => (
                        <TouchableOpacity
                            key={a}
                            style={[styles.audienceChip, audience === a && styles.audienceActive]}
                            onPress={() => {
                                setSelectedUser(null);
                                setSelectedWorkflow(null);
                                setAudience(a);
                            }}
                        >
                            <Text style={[styles.audienceText, audience === a && { color: 'white' }]}>{a}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <DataBlock style={{ padding: 24 }}>
                    <Text style={styles.label}>Select {audience}</Text>
                    <TouchableOpacity onPress={() => setShowUserModal(true)} style={styles.selectBtn}>
                        <Text style={[styles.selectBtnText, { color: selectedUser ? '#0f172a' : '#94a3b8' }]}>
                            {selectedUser
                                ? (selectedUser.companyName || selectedUser.name)
                                : `Select ${audience.toLowerCase()}...`}
                        </Text>
                        <Feather name="user" size={16} color={selectedUser ? '#0f172a' : '#94a3b8'} />
                    </TouchableOpacity>

                    <Text style={[styles.label, { marginTop: 24 }]}>Workflow Template</Text>
                    <TouchableOpacity onPress={() => setShowWorkflowModal(true)} style={styles.selectBtn}>
                        <Text style={[styles.selectBtnText, { color: selectedWorkflow ? '#0f172a' : '#94a3b8' }]}>
                            {selectedWorkflow ? selectedWorkflow.name : 'Select process template...'}
                        </Text>
                        <Feather name="layers" size={16} color={selectedWorkflow ? '#0f172a' : '#94a3b8'} />
                    </TouchableOpacity>

                    <Text style={[styles.label, { marginTop: 24 }]}>Due Date (optional)</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="YYYY-MM-DD"
                        placeholderTextColor="#94a3b8"
                        value={dueDate}
                        onChangeText={setDueDate}
                    />

                    <TouchableOpacity
                        onPress={handleSubmit}
                        style={[styles.submitBtn, (!selectedUser || !selectedWorkflow) && { backgroundColor: '#cbd5e1' }]}
                        disabled={!selectedUser || !selectedWorkflow || submitting}
                    >
                        <Text style={styles.submitBtnText}>{submitting ? 'ASSIGNING...' : 'ASSIGN WORKFLOW'}</Text>
                    </TouchableOpacity>
                </DataBlock>

                {selectedUser && selectedWorkflow && (
                    <View style={styles.summaryBox}>
                        <Feather name="info" size={14} color="#3b82f6" style={{ marginRight: 8 }} />
                        <Text style={styles.summaryText}>
                            Assigning "{selectedWorkflow.name}" to {selectedUser.companyName || selectedUser.name}
                            {dueDate ? ` (due ${dueDate})` : ''}.
                        </Text>
                    </View>
                )}
            </ScrollView>

            <Modal visible={showUserModal} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Select {audience}</Text>
                            <TouchableOpacity onPress={() => setShowUserModal(false)} style={styles.closeBtn}>
                                <Feather name="x" size={20} color="#64748b" />
                            </TouchableOpacity>
                        </View>
                        <FlatList
                            data={filteredUsers}
                            keyExtractor={item => item._id}
                            ListEmptyComponent={<Text style={styles.empty}>No matching people</Text>}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    onPress={() => { setSelectedUser(item); setShowUserModal(false); }}
                                    style={[styles.listItem, selectedUser?._id === item._id && styles.listItemSelected]}
                                >
                                    <View style={styles.listAvatar}>
                                        <Text style={styles.listAvatarText}>{(item.name || 'U')[0]}</Text>
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.listName}>{item.companyName || item.name}</Text>
                                        <Text style={styles.listRole}>{item.role} · {item.email}</Text>
                                    </View>
                                </TouchableOpacity>
                            )}
                            contentContainerStyle={{ padding: 20 }}
                        />
                    </View>
                </View>
            </Modal>

            <Modal visible={showWorkflowModal} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Select Template</Text>
                            <TouchableOpacity onPress={() => setShowWorkflowModal(false)} style={styles.closeBtn}>
                                <Feather name="x" size={20} color="#64748b" />
                            </TouchableOpacity>
                        </View>
                        <FlatList
                            data={filteredWorkflows}
                            keyExtractor={item => item._id}
                            ListEmptyComponent={<Text style={styles.empty}>No {audience} templates</Text>}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    onPress={() => { setSelectedWorkflow(item); setShowWorkflowModal(false); }}
                                    style={[styles.listItem, selectedWorkflow?._id === item._id && styles.listItemSelected]}
                                >
                                    <View style={styles.listAvatar}>
                                        <Feather name="layers" size={16} color="#3b82f6" />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.listName}>{item.name}</Text>
                                        <Text style={styles.listRole}>{item.tasks?.length || 0} Steps · {item.audience || 'Employee'}</Text>
                                    </View>
                                </TouchableOpacity>
                            )}
                            contentContainerStyle={{ padding: 20 }}
                        />
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    audienceRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
    audienceChip: { flex: 1, paddingVertical: 12, borderRadius: 10, backgroundColor: '#f1f5f9', alignItems: 'center' },
    audienceActive: { backgroundColor: '#0f172a' },
    audienceText: { fontSize: 12, fontWeight: '800', color: '#64748b' },
    label: { fontSize: 10, fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 8 },
    selectBtn: {
        backgroundColor: '#f1f5f9', height: 50, borderRadius: 12, paddingHorizontal: 16,
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: '#e2e8f0'
    },
    selectBtnText: { fontSize: 14, fontWeight: '700', flex: 1, marginRight: 8 },
    input: {
        backgroundColor: '#f1f5f9', height: 50, borderRadius: 12, paddingHorizontal: 16,
        borderWidth: 1, borderColor: '#e2e8f0', fontSize: 14, fontWeight: '600', color: '#0f172a'
    },
    submitBtn: { backgroundColor: '#0f172a', height: 50, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginTop: 32 },
    submitBtnText: { color: 'white', fontSize: 11, fontWeight: '900', letterSpacing: 2 },
    summaryBox: {
        backgroundColor: 'white', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0',
        flexDirection: 'row', alignItems: 'center', marginTop: 16, marginBottom: 40
    },
    summaryText: { fontSize: 12, color: '#64748b', fontWeight: '500', flex: 1 },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.4)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: 'white', borderTopLeftRadius: 32, borderTopRightRadius: 32, height: '80%' },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 24, paddingBottom: 16 },
    modalTitle: { fontSize: 20, fontWeight: '800', color: '#0f172a' },
    closeBtn: { width: 40, height: 40, backgroundColor: '#f1f5f9', borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
    listItem: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 16, backgroundColor: '#f8fafc', marginBottom: 12 },
    listItemSelected: { backgroundColor: '#eff6ff', borderWidth: 1, borderColor: '#bfdbfe' },
    listAvatar: { width: 40, height: 40, backgroundColor: 'white', borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 16 },
    listAvatarText: { fontSize: 14, fontWeight: '900', color: '#64748b' },
    listName: { fontSize: 14, fontWeight: '800', color: '#0f172a' },
    listRole: { fontSize: 10, color: '#94a3b8', fontWeight: '800', textTransform: 'uppercase', marginTop: 4 },
    empty: { textAlign: 'center', padding: 40, color: '#94a3b8', fontWeight: '700' },
});

export default AssignTask;
