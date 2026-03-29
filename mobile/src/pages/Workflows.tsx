import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, FlatList, ActivityIndicator, SafeAreaView, Modal, TextInput, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import api from '../services/api';

const Workflows = () => {
    const [workflows, setWorkflows] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    
    // Create workflow state
    const [newName, setNewName] = useState('');
    const [newDesc, setNewDesc] = useState('');
    const [tasks, setTasks] = useState<any[]>([{ name: '', type: 'checkbox', required: true }]);

    const fetchWorkflows = async () => {
        try {
            setLoading(true);
            const res = await api.get('/workflows');
            setWorkflows(res.data);
        } catch (error) {
            console.error('Failed to fetch workflows', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWorkflows();
    }, []);

    const handleCreateWorkflow = async () => {
        if (!newName || !newDesc) {
            Alert.alert('Error', 'Please enter a name and description.');
            return;
        }
        try {
            await api.post('/workflows', { name: newName, description: newDesc, tasks });
            setShowCreateModal(false);
            setNewName('');
            setNewDesc('');
            setTasks([{ name: '', type: 'checkbox', required: true }]);
            fetchWorkflows();
            Alert.alert('Success', 'Workflow created successfully.');
        } catch (error) {
            Alert.alert('Error', 'Failed to create workflow.');
        }
    };

    const renderItem = ({ item }: { item: any }) => (
        <View className="bg-white p-5 mb-4 rounded-xl border border-gray-200 shadow-sm">
            <Text className="text-lg font-bold text-gray-900 mb-1">{item.name}</Text>
            <Text className="text-gray-500 text-sm mb-4" numberOfLines={2}>{item.description}</Text>
            <View className="flex-row justify-between items-center pt-4 border-t border-gray-50">
                <Text className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">{item.tasks?.length || 0} Tasks</Text>
                <Text className="text-[10px] text-gray-400 font-medium">Created: {new Date(item.createdAt).toLocaleDateString()}</Text>
            </View>
        </View>
    );

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <FlatList
                data={workflows}
                keyExtractor={(item) => item._id}
                renderItem={renderItem}
                ListHeaderComponent={
                    <View className="px-4 pt-6 pb-4">
                        <View className="flex-row justify-between items-center mb-6">
                            <Text className="text-2xl font-bold text-gray-900">Workflows</Text>
                            <TouchableOpacity 
                                onPress={() => setShowCreateModal(true)}
                                className="bg-indigo-600 px-4 py-2 rounded-lg"
                            >
                                <Text className="text-white text-sm font-bold">New Workflow</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                }
                ListEmptyComponent={
                    <View className="mx-4 p-8 bg-white rounded-xl border border-gray-100 items-center">
                        <Text className="text-gray-400 text-sm font-medium">No workflows found.</Text>
                    </View>
                }
                onRefresh={fetchWorkflows}
                refreshing={loading}
                contentContainerStyle={{ paddingBottom: 100 }}
                showsVerticalScrollIndicator={false}
            />

            {/* Create Modal - Simple Matching */}
            <Modal visible={showCreateModal} animationType="slide">
                <SafeAreaView className="flex-1 bg-white">
                    <KeyboardAvoidingView 
                        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
                        className="flex-1 px-4"
                    >
                        <View className="py-6 flex-row justify-between items-center border-b border-gray-100">
                            <Text className="text-xl font-bold text-gray-900">Create Workflow</Text>
                            <TouchableOpacity onPress={() => setShowCreateModal(false)}>
                                <Text className="text-gray-400 font-bold">Cancel</Text>
                            </TouchableOpacity>
                        </View>
                        
                        <ScrollView className="mt-6">
                            <Text className="text-sm font-bold text-gray-700 mb-2">Workflow Name</Text>
                            <TextInput
                                className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-4 text-sm"
                                placeholder="E.g., HR Onboarding"
                                value={newName}
                                onChangeText={setNewName}
                            />

                            <Text className="text-sm font-bold text-gray-700 mb-2">Description</Text>
                            <TextInput
                                className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-4 text-sm"
                                placeholder="Workflow description..."
                                value={newDesc}
                                onChangeText={setNewDesc}
                                multiline
                            />

                            <View className="flex-row justify-between items-center mt-4 mb-4">
                                <Text className="text-lg font-bold text-gray-900">Tasks</Text>
                                <TouchableOpacity onPress={() => setTasks([...tasks, { name: '', type: 'checkbox', required: true }])}>
                                    <Text className="text-indigo-600 font-bold">+ Add Task</Text>
                                </TouchableOpacity>
                            </View>

                            {tasks.map((task, idx) => (
                                <View key={idx} className="bg-gray-50 p-4 rounded-lg border border-gray-100 mb-4">
                                    <TextInput
                                        className="text-sm font-bold text-gray-900 border-b border-gray-200 pb-2 mb-3"
                                        placeholder={`Task ${idx + 1} Name`}
                                        value={task.name}
                                        onChangeText={(v) => {
                                            const nt = [...tasks];
                                            nt[idx].name = v;
                                            setTasks(nt);
                                        }}
                                    />
                                    <View className="flex-row gap-4">
                                        <TouchableOpacity 
                                            onPress={() => {
                                                const nt = [...tasks];
                                                nt[idx].type = 'checkbox';
                                                setTasks(nt);
                                            }}
                                            className={`px-3 py-1.5 rounded-full ${task.type === 'checkbox' ? 'bg-indigo-600' : 'bg-white border border-gray-200'}`}
                                        >
                                            <Text className={`text-[10px] font-bold ${task.type === 'checkbox' ? 'text-white' : 'text-gray-500'}`}>Checkbox</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity 
                                            onPress={() => {
                                                const nt = [...tasks];
                                                nt[idx].type = 'document';
                                                setTasks(nt);
                                            }}
                                            className={`px-3 py-1.5 rounded-full ${task.type === 'document' ? 'bg-indigo-600' : 'bg-white border border-gray-200'}`}
                                        >
                                            <Text className={`text-[10px] font-bold ${task.type === 'document' ? 'text-white' : 'text-gray-500'}`}>Document</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            ))}

                            <TouchableOpacity 
                                onPress={handleCreateWorkflow}
                                className="bg-indigo-600 p-4 rounded-xl items-center mt-6 shadow-sm"
                            >
                                <Text className="text-white font-bold text-base">Save Workflow Template</Text>
                            </TouchableOpacity>
                        </ScrollView>
                    </KeyboardAvoidingView>
                </SafeAreaView>
            </Modal>
        </SafeAreaView>
    );
};

export default Workflows;
