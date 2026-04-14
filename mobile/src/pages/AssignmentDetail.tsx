import React, { useEffect, useState } from 'react';
import { Feather } from '@expo/vector-icons';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert, SafeAreaView, StatusBar } from 'react-native';
import api from '../services/api';

interface AssignmentDetailProps {
    assignmentId: string;
    onBack: () => void;
}

const AssignmentDetail = ({ assignmentId, onBack }: AssignmentDetailProps) => {
    const [assignment, setAssignment] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState<string | null>(null);

    const fetchDetail = async () => {
        try {
            setLoading(true);
            const res = await api.get(`/assignments/my-assignments`);
            const found = res.data.find((a: any) => a._id === assignmentId);
            setAssignment(found);
        } catch (error) {
            Alert.alert('Error', 'Failed to load details.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDetail();
    }, [assignmentId]);

    const handleTaskComplete = async (taskId: string) => {
        try {
            setUpdating(taskId);
            await api.put(`/assignments/${assignmentId}/tasks/${taskId}`, {
                status: 'completed'
            });
            
            // Update local state
            setAssignment((prev: any) => {
                const newTasks = prev.tasks.map((t: any) => 
                    t._id === taskId ? { ...t, status: 'completed' } : t
                );
                return { ...prev, tasks: newTasks };
            });
        } catch (error) {
            Alert.alert('Error', 'Failed to update task.');
        } finally {
            setUpdating(null);
        }
    };

    if (loading) {
        return (
            <View className="flex-1 justify-center items-center bg-white">
                <ActivityIndicator size="large" color="#4F46E5" />
            </View>
        );
    }

    if (!assignment) {
        return (
            <View className="flex-1 justify-center items-center bg-white px-5">
                <View className="w-20 h-20 rounded-full bg-gray-50 items-center justify-center mb-6">
                    <Feather name="alert-circle" size={40} color="#D1D5DB" />
                </View>
                <Text className="text-xl font-black text-gray-900 mb-2">Assignment not found</Text>
                <Text className="text-gray-400 text-center mb-8">This task might have been deleted or moved.</Text>
                <TouchableOpacity onPress={onBack} className="bg-gray-900 px-8 py-4 rounded-[32px]">
                    <Text className="text-white font-black">Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const completedTasks = assignment.tasks.filter((t: any) => t.status === 'completed').length;
    const progress = (completedTasks / assignment.tasks.length) * 100;

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <StatusBar barStyle="dark-content" />
            
            {/* Header */}
            <View className="bg-white px-4 py-4 border-b border-gray-200 flex-row items-center">
                <TouchableOpacity onPress={onBack} className="mr-4 p-2">
                    <Feather name="arrow-left" size={20} color="#111827" />
                </TouchableOpacity>
                <Text className="text-lg font-bold text-gray-900">Task Details</Text>
            </View>

            <ScrollView className="flex-1" contentContainerStyle={{ padding: 16, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
                <View className="mb-6">
                    <Text className="text-2xl font-bold text-gray-900">{assignment.workflow.name}</Text>
                    <Text className="text-sm text-gray-500 mt-2">{assignment.workflow.description}</Text>
                </View>

                {/* Progress Bar */}
                <View className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm mb-6">
                    <View className="flex-row justify-between items-center mb-4">
                        <Text className="text-[10px] font-bold text-gray-400 uppercase">Current Progress</Text>
                        <Text className="text-sm font-bold text-blue-600">{Math.round(progress)}% Complete</Text>
                    </View>
                    <View className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <View 
                            className="h-full bg-blue-600 rounded-full" 
                            style={{ width: `${progress}%` }}
                        />
                    </View>
                    <Text className="text-[10px] text-gray-400 mt-3 font-medium">
                        {completedTasks} of {assignment.tasks.length} tasks finished
                    </Text>
                </View>

                <Text className="text-lg font-bold text-gray-900 mb-4">Checklist</Text>
                {assignment.tasks.map((task: any, idx: number) => (
                    <View key={task._id} className="bg-white p-4 rounded-lg border border-gray-200 mb-3 flex-row items-center shadow-sm">
                        <View className={`w-10 h-10 rounded-md items-center justify-center mr-3 ${task.status === 'completed' ? 'bg-green-50' : 'bg-gray-100'}`}>
                            {task.status === 'completed' ? (
                                <Feather name="check" size={18} color="#10b981" />
                            ) : (
                                <Text className="text-gray-400 font-bold text-xs">{idx + 1}</Text>
                            )}
                        </View>
                        <View className="flex-1 mr-3">
                            <Text className={`text-sm font-bold ${task.status === 'completed' ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                                {task.name}
                            </Text>
                            <Text className="text-[10px] text-gray-500 mt-0.5">
                                {task.type === 'document' ? 'Upload document' : 'Mark as done'}
                            </Text>
                        </View>

                        {task.status !== 'completed' && (
                            <TouchableOpacity 
                                onPress={() => handleTaskComplete(task._id)}
                                disabled={updating === task._id}
                                className={`bg-blue-600 px-4 py-2 rounded-md ${updating === task._id ? 'opacity-50' : ''}`}
                            >
                                {updating === task._id ? (
                                    <ActivityIndicator size="small" color="#FFFFFF" />
                                ) : (
                                    <Text className="text-white font-bold text-[10px] uppercase">Complete</Text>
                                )}
                            </TouchableOpacity>
                        )}
                    </View>
                ))}
            </ScrollView>
        </SafeAreaView>
    );
};

export default AssignmentDetail;
