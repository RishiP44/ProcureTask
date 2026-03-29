import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator, SafeAreaView, Modal, FlatList } from 'react-native';
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
            setUsers(usersRes.data);
            setWorkflows(workflowsRes.data);
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
            Alert.alert('Selection Error', 'Please select both a participant and a workflow definition.');
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
            <View className="flex-1 justify-center items-center bg-gray-50">
                <ActivityIndicator size="large" color="#4F46E5" />
            </View>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <ScrollView className="flex-1 px-4 pt-6">
                <Text className="text-2xl font-bold text-gray-900 mb-6">Assign Workflow</Text>
                
                <View className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                    <Text className="text-sm font-medium text-gray-700 mb-2">Select User (Employee/Vendor)</Text>
                    <TouchableOpacity 
                        onPress={() => setShowUserModal(true)}
                        className="bg-gray-50 p-3 rounded-md border border-gray-200 mb-6 flex-row justify-between items-center"
                    >
                        <Text className={`text-sm ${selectedUser ? 'text-gray-900' : 'text-gray-400'}`}>
                            {selectedUser ? `${selectedUser.name} (${selectedUser.role})` : '-- Select User --'}
                        </Text>
                        <Text className="text-gray-300">▼</Text>
                    </TouchableOpacity>

                    <Text className="text-sm font-medium text-gray-700 mb-2">Select Workflow</Text>
                    <TouchableOpacity 
                        onPress={() => setShowWorkflowModal(true)}
                        className="bg-gray-50 p-3 rounded-md border border-gray-200 mb-8 flex-row justify-between items-center"
                    >
                        <Text className={`text-sm ${selectedWorkflow ? 'text-gray-900' : 'text-gray-400'}`}>
                            {selectedWorkflow ? selectedWorkflow.name : '-- Select Workflow --'}
                        </Text>
                        <Text className="text-gray-300">▼</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        onPress={handleSubmit}
                        disabled={submitting}
                        className={`bg-indigo-600 py-3 rounded-md items-center justify-center shadow-sm ${submitting ? 'opacity-70' : ''}`}
                    >
                        {submitting ? (
                            <ActivityIndicator size="small" color="#FFFFFF" />
                        ) : (
                            <Text className="text-white font-bold text-sm">Assign Workflow</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </ScrollView>

            {/* Selection Modals - Minimal Style */}
            <Modal visible={showUserModal} animationType="fade" transparent={true}>
                <View className="flex-1 bg-black/30 justify-center px-6">
                    <View className="bg-white rounded-lg shadow-xl max-h-[70%]">
                        <View className="p-4 border-b border-gray-100 flex-row justify-between items-center">
                            <Text className="text-lg font-bold">Select Participant</Text>
                            <TouchableOpacity onPress={() => setShowUserModal(false)}>
                                <Text className="text-indigo-600 font-bold">Done</Text>
                            </TouchableOpacity>
                        </View>
                        <FlatList
                            data={users}
                            keyExtractor={(item) => item._id}
                            renderItem={({ item }) => (
                                <TouchableOpacity 
                                    onPress={() => { setSelectedUser(item); setShowUserModal(false); }}
                                    className="p-4 border-b border-gray-50"
                                >
                                    <Text className="text-sm font-bold text-gray-900">{item.name}</Text>
                                    <Text className="text-[10px] text-gray-500">{item.email} ({item.role})</Text>
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                </View>
            </Modal>

            <Modal visible={showWorkflowModal} animationType="fade" transparent={true}>
                <View className="flex-1 bg-black/30 justify-center px-6">
                    <View className="bg-white rounded-lg shadow-xl max-h-[70%]">
                        <View className="p-4 border-b border-gray-100 flex-row justify-between items-center">
                            <Text className="text-lg font-bold">Select Workflow</Text>
                            <TouchableOpacity onPress={() => setShowWorkflowModal(false)}>
                                <Text className="text-indigo-600 font-bold">Done</Text>
                            </TouchableOpacity>
                        </View>
                        <FlatList
                            data={workflows}
                            keyExtractor={(item) => item._id}
                            renderItem={({ item }) => (
                                <TouchableOpacity 
                                    onPress={() => { setSelectedWorkflow(item); setShowWorkflowModal(false); }}
                                    className="p-4 border-b border-gray-50"
                                >
                                    <Text className="text-sm font-bold text-gray-900">{item.name}</Text>
                                    <Text className="text-[10px] text-gray-500">{item.tasks?.length || 0} Steps</Text>
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
