import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator, Modal, FlatList, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import api from '../services/api';
import { GlassCard, PrimaryButton } from '../components/Theme';

const AssignWorkflow = () => {
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
            setUsers(Array.isArray(usersRes.data) ? usersRes.data : []);
            setWorkflows(Array.isArray(workflowsRes.data) ? workflowsRes.data : []);
        } catch (error) {
            Alert.alert('Data Retrieval Error', 'Synchronization with employee directory failed.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleSubmit = async () => {
        if (!selectedUser || !selectedWorkflow) {
            Alert.alert('Incomplete Parameters', 'Please define both the participant and the template.');
            return;
        }

        try {
            setSubmitting(true);
            await api.post('/assignments', {
                userId: selectedUser._id,
                workflowId: selectedWorkflow._id
            });
            Alert.alert('Protocol Established', 'The workflow has been assigned to the active user session.');
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
            <View className="flex-1 justify-center items-center bg-slate-50">
                <ActivityIndicator size="large" color="#4F46E5" />
            </View>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-slate-50">
            <StatusBar barStyle="dark-content" />
            <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
                <View className="pt-10 pb-8">
                    <Text className="text-[10px] font-black text-blue-500 uppercase tracking-[0.4em] mb-1.5">Deployment Tool</Text>
                    <Text className="text-3xl font-bold text-slate-900 tracking-tighter">Assign Protocol</Text>
                </View>

                <View className="mb-10">
                    <Text className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] mb-4">Configuration Settings</Text>
                    
                    <GlassCard className="p-6">
                        <Text className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">Participant Selection</Text>
                        <TouchableOpacity 
                            onPress={() => setShowUserModal(true)}
                            activeOpacity={0.7}
                            className="bg-slate-50 h-16 rounded-2xl px-6 flex-row justify-between items-center border border-slate-100"
                        >
                            <Text className={`text-sm font-bold tracking-tight ${selectedUser ? 'text-slate-900' : 'text-slate-300'}`}>
                                {selectedUser ? selectedUser.name : 'Select system user...'}
                            </Text>
                            <Feather name="user" size={16} color={selectedUser ? "#1e293b" : "#cbd5e1"} />
                        </TouchableOpacity>

                        <View className="h-0.5 w-full bg-slate-50 my-6" />

                        <Text className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">Workflow Template</Text>
                        <TouchableOpacity 
                            onPress={() => setShowWorkflowModal(true)}
                            activeOpacity={0.7}
                            className="bg-slate-50 h-16 rounded-2xl px-6 flex-row justify-between items-center border border-slate-100"
                        >
                            <Text className={`text-sm font-bold tracking-tight ${selectedWorkflow ? 'text-slate-900' : 'text-slate-300'}`}>
                                {selectedWorkflow ? selectedWorkflow.name : 'Select process map...'}
                            </Text>
                            <Feather name="layers" size={16} color={selectedWorkflow ? "#1e293b" : "#cbd5e1"} />
                        </TouchableOpacity>

                        <PrimaryButton 
                            onPress={handleSubmit}
                            label={submitting ? 'initializing...' : 'Establish Protocol'}
                            loading={submitting}
                            icon="plus"
                            className="mt-10"
                            disabled={!selectedUser || !selectedWorkflow}
                        />
                    </GlassCard>
                </View>

                {selectedUser && selectedWorkflow && (
                    <View className="bg-white p-6 rounded-[24px] border border-blue-50 shadow-sm">
                        <View className="flex-row items-center mb-3">
                            <Feather name="info" size={14} color="#3b82f6" style={{ marginRight: 8 }} />
                            <Text className="text-[9px] font-black text-blue-500 uppercase tracking-widest">Verification Summary</Text>
                        </View>
                        <Text className="text-slate-400 text-xs leading-5">
                            You are about to initiate <Text className="text-slate-900 font-bold">"{selectedWorkflow.name}"</Text> for <Text className="text-slate-900 font-bold">{selectedUser.name}</Text>.
                        </Text>
                    </View>
                )}
            </ScrollView>

            {/* Selection Modals */}
            <Modal visible={showUserModal} animationType="slide" transparent={true}>
                <View className="flex-1 bg-slate-900/40 justify-end">
                    <View className="bg-white rounded-t-[40px] h-[80%] pt-8">
                        <View className="px-8 pb-6 flex-row justify-between items-center">
                            <Text className="text-2xl font-bold text-slate-900 tracking-tight">Select Participant</Text>
                            <TouchableOpacity onPress={() => setShowUserModal(false)} className="w-10 h-10 bg-slate-50 rounded-full items-center justify-center">
                                <Feather name="x" size={20} color="#64748b" />
                            </TouchableOpacity>
                        </View>
                        <FlatList
                            data={users}
                            keyExtractor={(item) => item._id}
                            contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }}
                            renderItem={({ item }) => (
                                <TouchableOpacity 
                                    onPress={() => { setSelectedUser(item); setShowUserModal(false); }}
                                    className={`p-5 mb-3 rounded-2xl flex-row items-center border ${selectedUser?._id === item._id ? 'bg-blue-50 border-blue-100' : 'bg-slate-50 border-transparent'}`}
                                >
                                    <View className="w-10 h-10 rounded-xl bg-white items-center justify-center mr-4 shadow-sm">
                                        <Text className="text-xs font-black text-slate-400">{item.name[0]}</Text>
                                    </View>
                                    <View className="flex-1">
                                        <Text className="text-sm font-bold text-slate-900 tracking-tight">{item.name}</Text>
                                        <Text className="text-[9px] text-slate-400 font-black uppercase tracking-widest mt-1">{item.role}</Text>
                                    </View>
                                    {selectedUser?._id === item._id && <Feather name="check-circle" size={18} color="#2563eb" />}
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                </View>
            </Modal>

            <Modal visible={showWorkflowModal} animationType="slide" transparent={true}>
                <View className="flex-1 bg-slate-900/40 justify-end">
                    <View className="bg-white rounded-t-[40px] h-[80%] pt-8">
                        <View className="px-8 pb-6 flex-row justify-between items-center">
                            <Text className="text-2xl font-bold text-slate-900 tracking-tight">Select Template</Text>
                            <TouchableOpacity onPress={() => setShowWorkflowModal(false)} className="w-10 h-10 bg-slate-50 rounded-full items-center justify-center">
                                <Feather name="x" size={20} color="#64748b" />
                            </TouchableOpacity>
                        </View>
                        <FlatList
                            data={workflows}
                            keyExtractor={(item) => item._id}
                            contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }}
                            renderItem={({ item }) => (
                                <TouchableOpacity 
                                    onPress={() => { setSelectedWorkflow(item); setShowWorkflowModal(false); }}
                                    className={`p-5 mb-3 rounded-2xl flex-row items-center border ${selectedWorkflow?._id === item._id ? 'bg-blue-50 border-blue-100' : 'bg-slate-50 border-transparent'}`}
                                >
                                    <View className="w-10 h-10 rounded-xl bg-white items-center justify-center mr-4 shadow-sm">
                                        <Feather name="layers" size={16} color="#3b82f6" />
                                    </View>
                                    <View className="flex-1">
                                        <Text className="text-sm font-bold text-slate-900 tracking-tight">{item.name}</Text>
                                        <Text className="text-[9px] text-slate-400 font-black uppercase tracking-widest mt-1">{item.tasks?.length || 0} Steps Map</Text>
                                    </View>
                                    {selectedWorkflow?._id === item._id && <Feather name="check-circle" size={18} color="#2563eb" />}
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

export default AssignWorkflow;
