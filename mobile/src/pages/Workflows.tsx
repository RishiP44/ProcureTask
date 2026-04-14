import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, FlatList, ActivityIndicator, SafeAreaView, Modal, TextInput, Alert, KeyboardAvoidingView, Platform, StatusBar } from 'react-native';
import { Feather } from '@expo/vector-icons';
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
            setWorkflows(Array.isArray(res.data) ? res.data : []);
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
            Alert.alert('Success', 'Workflow template created!');
        } catch (error) {
            Alert.alert('Error', 'Failed to create workflow.');
        }
    };

    const renderItem = ({ item }: { item: any }) => (
        <TouchableOpacity 
            activeOpacity={0.8}
            className="bg-white p-5 mb-2 rounded-lg border border-gray-100 flex-row items-center justify-between"
        >
            <View className="flex-1">
                <Text className="text-sm font-bold text-gray-900 uppercase tracking-tight">{item.name}</Text>
                <Text className="text-[10px] text-gray-400 font-bold uppercase mt-1">
                    {item.tasks?.length || 0} Steps • {item.description ? 'Template Active' : 'No description'}
                </Text>
            </View>
            <View className="px-2 py-1 bg-gray-50 rounded">
                <Text className="text-[9px] font-bold text-gray-400 uppercase">View</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView className="flex-1 bg-white">
            <StatusBar barStyle="dark-content" />
            <View className="flex-1 px-5">
                <FlatList
                    data={workflows}
                    keyExtractor={(item) => item._id}
                    renderItem={renderItem}
                    contentContainerStyle={{ paddingBottom: 80 }}
                    showsVerticalScrollIndicator={false}
                    ListHeaderComponent={
                        <View className="pt-8 pb-4">
                            <View className="flex-row justify-between items-center mb-10">
                                <View>
                                    <Text className="text-2xl font-bold text-gray-900 tracking-tight">Workflows</Text>
                                    <Text className="text-[10px] text-gray-400 font-bold uppercase mt-1 tracking-widest">Process Templates</Text>
                                </View>
                                <TouchableOpacity 
                                    onPress={() => setShowCreateModal(true)}
                                    className="px-4 py-2 bg-gray-900 rounded"
                                >
                                    <Text className="text-white font-bold text-[10px] uppercase tracking-widest">Create</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    }
                    ListEmptyComponent={
                        <View className="p-10 bg-white rounded-lg items-center border border-gray-100 mt-4">
                            <Text className="text-gray-400 text-sm">No templates found.</Text>
                        </View>
                    }
                    onRefresh={fetchWorkflows}
                    refreshing={loading}
                />
            </View>

            {/* Create Modal */}
            <Modal visible={showCreateModal} animationType="slide">
                <SafeAreaView className="flex-1 bg-white">
                    <KeyboardAvoidingView 
                        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
                        className="flex-1 px-6"
                    >
                        <View className="pt-6 pb-6 flex-row justify-between items-center border-b border-gray-50">
                            <Text className="text-sm font-bold text-gray-900 uppercase tracking-widest">New template</Text>
                            <TouchableOpacity onPress={() => setShowCreateModal(false)}>
                                <Text className="text-gray-400 font-bold text-[10px] uppercase tracking-widest">Close</Text>
                            </TouchableOpacity>
                        </View>
                        
                        <ScrollView showsVerticalScrollIndicator={false} className="mt-8">
                            <View className="mb-6">
                                <Text className="text-gray-400 font-bold text-[10px] mb-2 uppercase tracking-widest">Template Name</Text>
                                <TextInput
                                    className="bg-gray-50 px-4 py-3 rounded border border-gray-100 text-sm font-medium text-gray-900"
                                    placeholder="e.g. Employee Offboarding"
                                    placeholderTextColor="#9CA3AF"
                                    value={newName}
                                    onChangeText={setNewName}
                                />
                            </View>

                            <View className="mb-8">
                                <Text className="text-gray-400 font-bold text-[10px] mb-2 uppercase tracking-widest">Description</Text>
                                <TextInput
                                    className="bg-gray-50 px-4 py-3 rounded border border-gray-100 text-sm font-medium text-gray-900 min-h-[80px]"
                                    placeholder="Short description..."
                                    placeholderTextColor="#9CA3AF"
                                    value={newDesc}
                                    onChangeText={setNewDesc}
                                    multiline
                                    textAlignVertical="top"
                                />
                            </View>

                            <View className="flex-row justify-between items-center mb-6">
                                <Text className="text-xs font-bold text-gray-900 uppercase tracking-widest">Tasks</Text>
                                <TouchableOpacity 
                                    onPress={() => setTasks([...tasks, { name: '', type: 'checkbox', required: true }])}
                                >
                                    <Text className="text-gray-900 font-bold text-[10px] uppercase tracking-widest">+ Add Step</Text>
                                </TouchableOpacity>
                            </View>

                            {tasks.map((task, idx) => (
                                <View key={idx} className="bg-white p-4 rounded border border-gray-100 mb-4">
                                    <View className="flex-row justify-between items-center mb-4">
                                        <Text className="text-[9px] font-bold text-gray-300 uppercase tracking-widest">Step {idx + 1}</Text>
                                        {tasks.length > 1 && (
                                            <TouchableOpacity onPress={() => {
                                                const nt = tasks.filter((_, i) => i !== idx);
                                                setTasks(nt);
                                            }}>
                                                <Text className="text-red-400 text-[9px] font-bold uppercase tracking-widest">Remove</Text>
                                            </TouchableOpacity>
                                        )}
                                    </View>
                                    <TextInput
                                        className="text-sm font-bold text-gray-900 border-b border-gray-50 pb-2 mb-4"
                                        placeholder="Task description..."
                                        value={task.name}
                                        onChangeText={(v) => {
                                            const nt = [...tasks];
                                            nt[idx].name = v;
                                            setTasks(nt);
                                        }}
                                    />
                                    <View className="flex-row gap-2">
                                        <TouchableOpacity 
                                            onPress={() => {
                                                const nt = [...tasks];
                                                nt[idx].type = 'checkbox';
                                                setTasks(nt);
                                            }}
                                            className={`px-3 py-1.5 rounded ${task.type === 'checkbox' ? 'bg-gray-900' : 'bg-gray-50'}`}
                                        >
                                            <Text className={`text-[9px] font-bold uppercase ${task.type === 'checkbox' ? 'text-white' : 'text-gray-400'}`}>Checkbox</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity 
                                            onPress={() => {
                                                const nt = [...tasks];
                                                nt[idx].type = 'document';
                                                setTasks(nt);
                                            }}
                                            className={`px-3 py-1.5 rounded ${task.type === 'document' ? 'bg-gray-900' : 'bg-gray-50'}`}
                                        >
                                            <Text className={`text-[9px] font-bold uppercase ${task.type === 'document' ? 'text-white' : 'text-gray-400'}`}>Upload</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            ))}

                            <TouchableOpacity 
                                onPress={handleCreateWorkflow}
                                className="bg-gray-900 py-4 rounded items-center mt-6 mb-10"
                            >
                                <Text className="text-white font-bold text-[10px] uppercase tracking-widest">Save template</Text>
                            </TouchableOpacity>
                        </ScrollView>
                    </KeyboardAvoidingView>
                </SafeAreaView>
            </Modal>
        </SafeAreaView>
    );
};

export default Workflows;
