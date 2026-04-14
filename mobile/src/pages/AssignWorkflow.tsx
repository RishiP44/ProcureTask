import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator, SafeAreaView, Modal, FlatList, StatusBar } from 'react-native';
import { Feather } from '@expo/vector-icons';
import api from '../services/api';

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
            Alert.alert('Error', 'Failed to load directory data.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleSubmit = async () => {
        if (!selectedUser || !selectedWorkflow) {
            Alert.alert('Selection Error', 'Please select both a participant and a workflow template.');
            return;
        }

        try {
            setSubmitting(true);
            await api.post('/assignments', {
                userId: selectedUser._id,
                workflowId: selectedWorkflow._id
            });
            Alert.alert('Success', 'Workflow assigned successfully!');
            setSelectedUser(null);
            setSelectedWorkflow(null);
        } catch (error) {
            Alert.alert('Submission Error', 'Failed to assign workflow.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <View className="flex-1 justify-center items-center bg-white">
                <ActivityIndicator size="large" color="#4F46E5" />
            </View>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <StatusBar barStyle="dark-content" />
            <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
                <View className="pt-6 pb-4">
                    <Text className="text-2xl font-bold text-gray-900">Assign Workflow</Text>
                    <Text className="text-sm text-gray-500 mt-1">Start a process for a team member</Text>
                </View>

                <View className="bg-white p-6 rounded-lg border border-gray-200 mt-4 shadow-sm">
                    <Text className="text-[10px] font-bold text-gray-400 uppercase mb-2">Participant</Text>
                    <TouchableOpacity 
                        onPress={() => setShowUserModal(true)}
                        activeOpacity={0.7}
                        className="bg-gray-50 p-3 rounded-md border border-gray-200 mb-6 flex-row justify-between items-center"
                    >
                        <Text className={`text-sm font-medium ${selectedUser ? 'text-gray-900' : 'text-gray-400'}`}>
                            {selectedUser ? selectedUser.name : 'Select user...'}
                        </Text>
                        <Feather name="chevron-down" size={16} color="#9CA3AF" />
                    </TouchableOpacity>

                    <Text className="text-[10px] font-bold text-gray-400 uppercase mb-2">Process Template</Text>
                    <TouchableOpacity 
                        onPress={() => setShowWorkflowModal(true)}
                        activeOpacity={0.7}
                        className="bg-gray-50 p-3 rounded-md border border-gray-200 mb-8 flex-row justify-between items-center"
                    >
                        <Text className={`text-sm font-medium ${selectedWorkflow ? 'text-gray-900' : 'text-gray-400'}`}>
                            {selectedWorkflow ? selectedWorkflow.name : 'Select workflow...'}
                        </Text>
                        <Feather name="chevron-down" size={16} color="#9CA3AF" />
                    </TouchableOpacity>

                    <TouchableOpacity 
                        onPress={handleSubmit}
                        disabled={submitting || !selectedUser || !selectedWorkflow}
                        className={`bg-blue-600 py-3.5 rounded-md items-center justify-center shadow-sm ${submitting || !selectedUser || !selectedWorkflow ? 'opacity-50' : ''}`}
                    >
                        {submitting ? (
                            <ActivityIndicator size="small" color="#FFFFFF" />
                        ) : (
                            <Text className="text-white font-bold text-sm">Assign Now</Text>
                        )}
                    </TouchableOpacity>
                </View>

                {selectedUser && selectedWorkflow && (
                    <View className="bg-blue-50 p-4 rounded-lg border border-blue-100 mt-6">
                        <Text className="text-blue-900 text-xs leading-5">
                            Assigning <Text className="font-bold">"{selectedWorkflow.name}"</Text> to <Text className="font-bold">{selectedUser.name}</Text>.
                        </Text>
                    </View>
                )}
            </ScrollView>

            {/* Selection Modals */}
            <Modal visible={showUserModal} animationType="fade" transparent={true}>
                <View className="flex-1 bg-black/50 justify-center p-6">
                    <View className="bg-white rounded-lg max-h-[80%]">
                        <View className="p-4 border-b border-gray-100 flex-row justify-between items-center">
                            <Text className="text-lg font-bold text-gray-900">Select User</Text>
                            <TouchableOpacity onPress={() => setShowUserModal(false)}>
                                <Feather name="x" size={20} color="#6b7280" />
                            </TouchableOpacity>
                        </View>
                        <FlatList
                            data={users}
                            keyExtractor={(item) => item._id}
                            renderItem={({ item }) => (
                                <TouchableOpacity 
                                    onPress={() => { setSelectedUser(item); setShowUserModal(false); }}
                                    className="p-4 flex-row items-center border-b border-gray-50"
                                >
                                    <View className="w-8 h-8 rounded-md bg-gray-100 items-center justify-center mr-3">
                                        <Text className="text-xs font-bold text-gray-400">{item.name[0]}</Text>
                                    </View>
                                    <View className="flex-1">
                                        <Text className="text-sm font-bold text-gray-900">{item.name}</Text>
                                        <Text className="text-[10px] text-gray-500 uppercase">{item.role}</Text>
                                    </View>
                                    {selectedUser?._id === item._id && <Feather name="check" size={16} color="#2563eb" />}
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                </View>
            </Modal>

            <Modal visible={showWorkflowModal} animationType="fade" transparent={true}>
                <View className="flex-1 bg-black/50 justify-center p-6">
                    <View className="bg-white rounded-lg max-h-[80%]">
                        <View className="p-4 border-b border-gray-100 flex-row justify-between items-center">
                            <Text className="text-lg font-bold text-gray-900">Select Template</Text>
                            <TouchableOpacity onPress={() => setShowWorkflowModal(false)}>
                                <Feather name="x" size={20} color="#6b7280" />
                            </TouchableOpacity>
                        </View>
                        <FlatList
                            data={workflows}
                            keyExtractor={(item) => item._id}
                            renderItem={({ item }) => (
                                <TouchableOpacity 
                                    onPress={() => { setSelectedWorkflow(item); setShowWorkflowModal(false); }}
                                    className="p-4 flex-row items-center border-b border-gray-50"
                                >
                                    <View className="w-8 h-8 rounded-md bg-blue-50 items-center justify-center mr-3">
                                        <Feather name="layers" size={14} color="#2563eb" />
                                    </View>
                                    <View className="flex-1">
                                        <Text className="text-sm font-bold text-gray-900">{item.name}</Text>
                                        <Text className="text-[10px] text-gray-500 uppercase">{item.tasks?.length || 0} Steps</Text>
                                    </View>
                                    {selectedWorkflow?._id === item._id && <Feather name="check" size={16} color="#2563eb" />}
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
