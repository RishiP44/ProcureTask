import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity, Modal, TextInput, Alert, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import api from '../services/api';
import { DataBlock, WebBadge, WebSectionHeader } from '../components/Theme';

const Workflows = () => {
    const [workflows, setWorkflows] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [newName, setNewName] = useState('');
    const [newDesc, setNewDesc] = useState('');
    const [newTasks, setNewTasks] = useState([{ name: '', type: 'document' }]);
    const [submitting, setSubmitting] = useState(false);

    const load = async () => {
        try {
            const res = await api.get('/workflows');
            setWorkflows(res.data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    const handleCreateWorkflow = async () => {
        if (!newName || !newDesc) return Alert.alert('Error', 'Name and description required.');
        setSubmitting(true);
        try {
            const validTasks = newTasks.filter(t => t.name.trim() !== '').map(t => ({
                name: t.name,
                type: t.type === 'task' ? 'checkbox' : 'document'
            }));
            
            await api.post('/workflows', {
                name: newName,
                description: newDesc,
                tasks: validTasks.length > 0 ? validTasks : [{ name: 'Initial Review', type: 'checkbox' }]
            });
            setShowModal(false);
            setNewName(''); setNewDesc(''); setNewTasks([{ name: '', type: 'document' }]);
            load();
        } catch(e) {
            Alert.alert('Error', 'Failed to create workflow.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />
            
            <View style={{ marginBottom: 24, marginTop: 12 }}>
                <Text style={styles.subtext}>System Architecture</Text>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={styles.title}>Process Templates</Text>
                    <TouchableOpacity style={styles.addBtn} onPress={() => setShowModal(true)}>
                        <Feather name="plus" size={18} color="white" />
                    </TouchableOpacity>
                </View>
            </View>

            {loading ? (
                <ActivityIndicator color="#2563eb" size="large" style={{ marginTop: 40 }} />
            ) : (
                <FlatList 
                    data={workflows}
                    keyExtractor={item => item._id}
                    renderItem={({ item }) => (
                        <TouchableOpacity activeOpacity={0.8} onPress={() => Alert.alert('Workflow Overview', `${item.name}\n\n${item.description}\n\nTasks: ${item.tasks?.length || 0}`)}>
                            <DataBlock>
                                <View style={styles.topRow}>
                                    <Text style={styles.name}>{item.name}</Text>
                                    <WebBadge status="ACTIVE" />
                                </View>
                                <Text style={styles.desc}>{item.description}</Text>
                                <View style={styles.footer}>
                                    <Text style={styles.steps}>{item.tasks?.length || 0} SEQUENCE STEPS</Text>
                                </View>
                            </DataBlock>
                        </TouchableOpacity>
                    )}
                    contentContainerStyle={{ paddingBottom: 100 }}
                />
            )}

            <Modal visible={showModal} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>New Process Template</Text>
                            <TouchableOpacity onPress={() => setShowModal(false)} style={styles.closeBtn}>
                                <Feather name="x" size={20} color="#64748b" />
                            </TouchableOpacity>
                        </View>
                        <View style={{ padding: 24 }}>
                            <Text style={styles.inputLabel}>Template Name</Text>
                            <TextInput style={styles.input} placeholder="e.g. Executive Onboarding" value={newName} onChangeText={setNewName} />
                            
                            <Text style={[styles.inputLabel, { marginTop: 16 }]}>Description</Text>
                            <TextInput style={styles.input} placeholder="Describe the process..." value={newDesc} onChangeText={setNewDesc} />

                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, marginBottom: 8 }}>
                                <Text style={styles.inputLabel}>Process Steps (Tasks)</Text>
                                <TouchableOpacity onPress={() => setNewTasks([...newTasks, { name: '', type: 'task' }])}>
                                    <Text style={{ fontSize: 10, fontWeight: '800', color: '#3b82f6' }}>+ ADD STEP</Text>
                                </TouchableOpacity>
                            </View>

                            {newTasks.map((t, i) => (
                                <View key={i} style={{ flexDirection: 'row', marginBottom: 8 }}>
                                    <TextInput 
                                        style={[styles.input, { flex: 1, marginBottom: 0, borderRightWidth: 0, borderTopRightRadius: 0, borderBottomRightRadius: 0 }]} 
                                        placeholder="Task Name" 
                                        value={t.name} 
                                        onChangeText={val => {
                                            const arr = [...newTasks];
                                            arr[i].name = val;
                                            setNewTasks(arr);
                                        }} 
                                    />
                                    <TouchableOpacity 
                                        style={[styles.input, { width: 100, marginBottom: 0, borderTopLeftRadius: 0, borderBottomLeftRadius: 0, backgroundColor: '#f1f5f9', alignItems: 'center', justifyContent: 'center' }]}
                                        onPress={() => {
                                            const arr = [...newTasks];
                                            arr[i].type = arr[i].type === 'document' ? 'task' : 'document';
                                            setNewTasks(arr);
                                        }}
                                    >
                                        <Text style={{ fontSize: 10, fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>{t.type}</Text>
                                    </TouchableOpacity>
                                </View>
                            ))}

                            <TouchableOpacity style={styles.submitBtn} onPress={handleCreateWorkflow} disabled={submitting}>
                                <Text style={styles.submitBtnText}>{submitting ? 'GENERATING...' : 'GENERATE TEMPLATE'}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: '#f8fafc' },
    subtext: { fontSize: 10, fontWeight: '900', color: '#3b82f6', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 4 },
    title: { fontSize: 26, fontWeight: '800', color: '#0f172a', letterSpacing: -1 },
    addBtn: { width: 40, height: 40, backgroundColor: '#0f172a', borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
    topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    name: { fontSize: 16, fontWeight: '700', color: '#0f172a' },
    desc: { fontSize: 14, color: '#64748b', lineHeight: 20 },
    footer: { marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#f1f5f9' },
    steps: { fontSize: 9, fontWeight: '900', color: '#3b82f6', letterSpacing: 1.5 },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.4)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: 'white', borderTopLeftRadius: 32, borderTopRightRadius: 32 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 24, paddingBottom: 16 },
    modalTitle: { fontSize: 20, fontWeight: '800', color: '#0f172a' },
    closeBtn: { width: 40, height: 40, backgroundColor: '#f1f5f9', borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
    inputLabel: { fontSize: 10, fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 8 },
    input: { backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12, height: 50, paddingHorizontal: 16, marginBottom: 12, fontSize: 14, fontWeight: '600', color: '#0f172a' },
    submitBtn: { backgroundColor: '#0f172a', height: 50, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginTop: 16 },
    submitBtnText: { color: 'white', fontSize: 11, fontWeight: '900', letterSpacing: 2 }
});

export default Workflows;
