import React, { useEffect, useState } from 'react';
import { Feather } from '@expo/vector-icons';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert, SafeAreaView, Dimensions, StatusBar } from 'react-native';
import api from '../services/api';

const { width } = Dimensions.get('window');

interface EmployeeProfileProps {
    employeeId: string;
    onBack: () => void;
}

const EmployeeProfile: React.FC<EmployeeProfileProps> = ({ employeeId, onBack }) => {
    const [employee, setEmployee] = useState<any>(null);
    const [assignments, setAssignments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const loadData = async () => {
        try {
            setLoading(true);
            const [empRes, assignRes] = await Promise.all([
                api.get(`/users/${employeeId}`),
                api.get(`/assignments?userId=${employeeId}`).catch(() => ({ data: [] }))
            ]);
            setEmployee(empRes.data);
            setAssignments(Array.isArray(assignRes.data) ? assignRes.data : []);
        } catch (error) {
            console.error('Load employee error:', error);
            Alert.alert('Error', 'Failed to load profile details.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [employeeId]);

    if (loading) {
        return (
            <View className="flex-1 items-center justify-center bg-white">
                <ActivityIndicator size="large" color="#4F46E5" />
                <Text className="mt-4 text-gray-400 font-medium">Loading profile...</Text>
            </View>
        );
    }

    if (!employee) return null;

    const completedTasks = assignments.filter(a => a.status === 'completed').length;
    const totalTasks = assignments.length;
    const progress = totalTasks > 0 ? (completedTasks / totalTasks) : 0;

    return (
        <SafeAreaView className="flex-1 bg-white">
            <StatusBar barStyle="dark-content" />
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Header Section */}
                <View className="px-6 py-6 border-b border-gray-50 flex-row items-center justify-between">
                    <TouchableOpacity onPress={onBack}>
                        <Text className="text-gray-900 font-bold text-xs uppercase tracking-widest">Back</Text>
                    </TouchableOpacity>
                    <Text className="text-sm font-bold text-gray-900 uppercase tracking-widest">Profile</Text>
                    <View style={{ width: 40 }} />
                </View>

                <View className="px-6 py-8">
                    {/* Basic Info */}
                    <View className="mb-10 items-center">
                        <View className="w-24 h-24 rounded-lg bg-gray-50 items-center justify-center mb-6">
                            <Text className="text-3xl font-bold text-gray-300">
                                {employee.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)}
                            </Text>
                        </View>
                        <Text className="text-2xl font-bold text-gray-900 tracking-tight">{employee.name}</Text>
                        <Text className="text-sm text-gray-400 font-bold uppercase mt-1 tracking-tight">{employee.position || employee.role}</Text>
                        <Text className="text-[10px] text-gray-300 font-bold uppercase mt-0.5 tracking-tight">{employee.email}</Text>
                        
                        <View className="flex-row mt-8 gap-4">
                            <TouchableOpacity className="bg-gray-900 px-8 py-2.5 rounded">
                                <Text className="text-white font-bold text-[10px] uppercase tracking-widest">Edit</Text>
                            </TouchableOpacity>
                            <TouchableOpacity className="border border-gray-200 px-8 py-2.5 rounded">
                                <Text className="text-gray-900 font-bold text-[10px] uppercase tracking-widest">Email</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Stats */}
                    <View className="flex-row gap-4 mb-10">
                        <View className="flex-1 bg-gray-50 p-4 rounded-lg">
                            <Text className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">Status</Text>
                            <Text className="text-lg font-bold text-gray-900 mt-1 uppercase">{employee.status}</Text>
                        </View>
                        <View className="flex-1 bg-gray-50 p-4 rounded-lg">
                            <Text className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">Tasks</Text>
                            <Text className="text-lg font-bold text-gray-900 mt-1">{assignments.length}</Text>
                        </View>
                    </View>

                    {/* Workflows */}
                    <Text className="text-[10px] font-bold text-gray-900 mb-4 uppercase tracking-widest">Workflows</Text>
                    {assignments.length > 0 ? (
                        assignments.map((item) => (
                            <View 
                                key={item._id} 
                                className="p-4 mb-2 rounded-lg border border-gray-100 flex-row items-center justify-between"
                            >
                                <View className="flex-1">
                                    <Text className="text-[11px] font-bold text-gray-900 uppercase tracking-tight" numberOfLines={1}>
                                        {item.workflow?.name}
                                    </Text>
                                    <Text className="text-[10px] text-gray-400 font-bold uppercase mt-1">
                                        {item.status.replace('_', ' ')}
                                    </Text>
                                </View>
                                <View className="px-2 py-1 bg-gray-50 rounded">
                                    <Text className="text-[9px] font-bold text-gray-400 uppercase">Detail</Text>
                                </View>
                            </View>
                        ))
                    ) : (
                        <View className="p-8 border-2 border-dashed border-gray-50 rounded-lg items-center">
                            <Text className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">No active tasks</Text>
                        </View>
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default EmployeeProfile;
