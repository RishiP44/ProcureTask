import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert, SafeAreaView } from 'react-native';
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
            <View className="flex-1 justify-center items-center bg-gray-50">
                <ActivityIndicator size="large" color="#4F46E5" />
            </View>
        );
    }

    if (!assignment) {
        return (
            <View className="flex-1 justify-center items-center bg-gray-50">
                <Text className="text-gray-500 font-bold mb-4">Assignment not found.</Text>
                <TouchableOpacity onPress={onBack} className="bg-indigo-600 px-6 py-2 rounded-lg">
                    <Text className="text-white font-bold">Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <View className="px-4 py-2 border-b border-gray-200 bg-white flex-row items-center">
                <TouchableOpacity onPress={onBack} className="mr-3">
                    <Text className="text-indigo-600 font-bold text-lg">←</Text>
                </TouchableOpacity>
                <Text className="text-lg font-bold text-gray-900" numberOfLines={1}>Task Details</Text>
            </View>

            <ScrollView className="flex-1" contentContainerStyle={{ padding: 16 }}>
                <View className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden mb-6">
                    <View className="p-4 bg-gray-50 border-b border-gray-200">
                        <Text className="text-xl font-bold text-gray-900">{assignment.workflow.name}</Text>
                        <Text className="text-sm text-gray-500 mt-1">{assignment.workflow.description}</Text>
                    </View>
                    <View className="p-4">
                        <View className="flex-row items-center">
                            <Text className="text-gray-500 text-sm">Status:</Text>
                            <View className={`ml-2 px-2 py-0.5 rounded-full ${assignment.status === 'completed' ? 'bg-green-100' : 'bg-yellow-100'}`}>
                                <Text className={`text-[10px] font-bold ${assignment.status === 'completed' ? 'text-green-800' : 'text-yellow-800'}`}>
                                    {assignment.status}
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>

                <Text className="text-lg font-bold text-gray-900 mb-4">Tasks</Text>
                {assignment.tasks.map((task: any) => (
                    <View key={task._id} className="bg-white p-4 rounded-lg border border-gray-200 mb-4 flex-row items-center justify-between">
                        <View className="flex-1 mr-4">
                            <View className="flex-row items-center mb-1">
                                <Text className="text-base font-bold text-gray-900">{task.name}</Text>
                                {task.required && (
                                    <View className="ml-2 bg-red-50 px-1.5 py-0.5 rounded">
                                        <Text className="text-[8px] text-red-600 font-bold uppercase tracking-tighter">Required</Text>
                                    </View>
                                )}
                            </View>
                            <Text className="text-xs text-gray-500">
                                {task.type === 'document' ? '📄 Document Upload' : '✅ Checkbox Confirmation'}
                            </Text>
                        </View>

                        <View>
                            {task.status === 'completed' ? (
                                <View className="flex-row items-center">
                                    <Text className="text-green-600 font-bold text-sm">✓ Done</Text>
                                </View>
                            ) : (
                                <TouchableOpacity 
                                    onPress={() => handleTaskComplete(task._id)}
                                    disabled={updating === task._id}
                                    className={`bg-indigo-600 px-4 py-2 rounded-md ${updating === task._id ? 'opacity-50' : ''}`}
                                >
                                    {updating === task._id ? (
                                        <ActivityIndicator size="small" color="#FFFFFF" />
                                    ) : (
                                        <Text className="text-white text-xs font-bold">Mark Done</Text>
                                    )}
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>
                ))}
            </ScrollView>
        </SafeAreaView>
    );
};

export default AssignmentDetail;
