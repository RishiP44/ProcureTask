import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator, Modal, FlatList, StatusBar, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import api from '../services/api';
import { DataBlock, WebSectionHeader } from '../components/Theme';

const AssignTask = () => {
    const [users, setUsers] = useState<any[]>([]);
    const [workflows, setWorkflows] = useState<any[]>([]);
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [selectedWorkflow, setSelectedWorkflow] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    
    const [showUserModal, setShowUserModal] = useState(false);
    const [showWorkflowModal, setShowWorkflowModal] = useState(false);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [usersRes, workflowsRes] = await Promise.all([
                api.get('/users'),
                api.get('/workflows')
            ]);
            setUsers(Array.isArray(usersRes.data) ? usersRes.data.filter(u => u.role !== 'Admin') : []);
            setWorkflows(Array.isArray(workflowsRes.data) ? workflowsRes.data : []);
        } catch (error) {
            Alert.alert('Data Retrieval Error', 'Synchronization failed.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleSubmit = async () => {
        if (!selectedUser || !selectedWorkflow) {
            Alert.alert('Incomplete', 'Please define both the participant and the template.');
            return;
        }

        try {
            setSubmitting(true);
            await api.post('/assignments', {
                userId: selectedUser._id,
                workflowId: selectedWorkflow._id
            });
            Alert.alert('Protocol Established', 'The workflow has been assigned successfully.');
            setSelectedUser(null);
            setSelectedWorkflow(null);
        } catch (error) {
            Alert.alert('Submission Error', 'Failed to push configuration to server.');
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
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />
            <ScrollView style={{ padding: 20 }}>
                <WebSectionHeader title="Establish Protocol" />
                
                <DataBlock style={{ padding: 24 }}>
                    <Text style={styles.label}>Participant Selection</Text>
                    <TouchableOpacity onPress={() => setShowUserModal(true)} style={styles.selectBtn}>
                        <Text style={[styles.selectBtnText, { color: selectedUser ? '#0f172a' : '#94a3b8' }]}>
                            {selectedUser ? selectedUser.name : 'Select system user...'}
                        </Text>
                        <Feather name="user" size={16} color={selectedUser ? "#0f172a" : "#94a3b8"} />
                    </TouchableOpacity>

                    <Text style={[styles.label, { marginTop: 24 }]}>Workflow Template</Text>
                    <TouchableOpacity onPress={() => setShowWorkflowModal(true)} style={styles.selectBtn}>
                        <Text style={[styles.selectBtnText, { color: selectedWorkflow ? '#0f172a' : '#94a3b8' }]}>
                            {selectedWorkflow ? selectedWorkflow.name : 'Select process map...'}
                        </Text>
                        <Feather name="layers" size={16} color={selectedWorkflow ? "#0f172a" : "#94a3b8"} />
                    </TouchableOpacity>

                    <TouchableOpacity 
                        onPress={handleSubmit} 
                        style={[styles.submitBtn, (!selectedUser || !selectedWorkflow) && { backgroundColor: '#cbd5e1' }]} 
                        disabled={!selectedUser || !selectedWorkflow || submitting}
                    >
                        <Text style={styles.submitBtnText}>{submitting ? 'INITIALIZING...' : 'ESTABLISH PROTOCOL'}</Text>
                    </TouchableOpacity>
                </DataBlock>

                {selectedUser && selectedWorkflow && (
                    <View style={styles.summaryBox}>
                        <Feather name="info" size={14} color="#3b82f6" style={{ marginRight: 8 }} />
                        <Text style={styles.summaryText}>
                            Assigning workflow "{selectedWorkflow.name}" to {selectedUser.name}.
                        </Text>
                    </View>
                )}
            </ScrollView>

            {/* User Modal */}
            <Modal visible={showUserModal} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Select Staff</Text>
                            <TouchableOpacity onPress={() => setShowUserModal(false)} style={styles.closeBtn}>
                                <Feather name="x" size={20} color="#64748b" />
                            </TouchableOpacity>
                        </View>
                        <FlatList
                            data={users}
                            keyExtractor={(item) => item._id}
                            renderItem={({ item }) => (
                                <TouchableOpacity 
                                    onPress={() => { setSelectedUser(item); setShowUserModal(false); }}
                                    style={[styles.listItem, selectedUser?._id === item._id && styles.listItemSelected]}
                                >
                                    <View style={styles.listAvatar}><Text style={styles.listAvatarText}>{item.name[0]}</Text></View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.listName}>{item.name}</Text>
                                        <Text style={styles.listRole}>{item.role}</Text>
                                    </View>
                                </TouchableOpacity>
                            )}
                            contentContainerStyle={{ padding: 20 }}
                        />
                    </View>
                </View>
            </Modal>

            {/* Workflow Modal */}
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
                            data={workflows}
                            keyExtractor={(item) => item._id}
                            renderItem={({ item }) => (
                                <TouchableOpacity 
                                    onPress={() => { setSelectedWorkflow(item); setShowWorkflowModal(false); }}
                                    style={[styles.listItem, selectedWorkflow?._id === item._id && styles.listItemSelected]}
                                >
                                    <View style={styles.listAvatar}><Feather name="layers" size={16} color="#3b82f6" /></View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.listName}>{item.name}</Text>
                                        <Text style={styles.listRole}>{item.tasks?.length || 0} Steps Map</Text>
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
    label: { fontSize: 10, fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 8 },
    selectBtn: { backgroundColor: '#f1f5f9', height: 50, borderRadius: 12, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: '#e2e8f0' },
    selectBtnText: { fontSize: 14, fontWeight: '700' },
    submitBtn: { backgroundColor: '#0f172a', height: 50, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginTop: 32 },
    submitBtnText: { color: 'white', fontSize: 11, fontWeight: '900', letterSpacing: 2 },
    summaryBox: { backgroundColor: 'white', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0', flexDirection: 'row', alignItems: 'center', marginTop: 16 },
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
    listRole: { fontSize: 10, color: '#94a3b8', fontWeight: '800', textTransform: 'uppercase', marginTop: 4 }
});

export default AssignTask;
