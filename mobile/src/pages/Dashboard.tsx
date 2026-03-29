import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, FlatList, ActivityIndicator, SafeAreaView } from 'react-native';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

interface DashboardProps {
    onSelectAssignment: (id: string) => void;
}

const Dashboard = ({ onSelectAssignment }: DashboardProps) => {
    const { user } = useAuth();
    const [assignments, setAssignments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchAssignments = async () => {
        try {
            setLoading(true);
            const endpoint = user?.role === 'Admin' || user?.role === 'HR'
                ? '/assignments'
                : '/assignments/my-assignments';
            const res = await api.get(endpoint);
            setAssignments(res.data);
        } catch (error) {
            console.error('Fetch assignments error:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAssignments();
    }, [user]);

    const activeCount = assignments.filter(a => a.status !== 'completed').length;
    const completedCount = assignments.filter(a => a.status === 'completed').length;

    const renderItem = ({ item }: { item: any }) => (
        <TouchableOpacity 
            className="bg-white p-4 mb-3 rounded-xl border border-gray-200 shadow-sm"
            activeOpacity={0.7}
            onPress={() => onSelectAssignment(item._id)}
        >
            <View className="flex-row justify-between items-center">
                <View className="flex-1">
                    <Text className="text-gray-500 text-[10px] font-bold uppercase tracking-wider mb-1">
                        {item.user?.name || 'Me'}
                    </Text>
                    <Text className="text-lg font-bold text-gray-900 mb-2">
                        {item.workflow?.name || 'Workflow'}
                    </Text>
                    <View className="flex-row items-center">
                        <View className={`px-2 py-0.5 rounded-full ${item.status === 'completed' ? 'bg-green-100' : 'bg-yellow-100'}`}>
                            <Text className={`text-[10px] font-bold ${item.status === 'completed' ? 'text-green-800' : 'text-yellow-800'}`}>
                                {item.status}
                            </Text>
                        </View>
                        <Text className="text-gray-400 text-[10px] ml-3 font-medium">
                            {new Date(item.createdAt).toLocaleDateString()}
                        </Text>
                    </View>
                </View>
                <Text className="text-indigo-600 font-bold text-sm">View</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <FlatList
                data={assignments}
                keyExtractor={(item) => item._id}
                renderItem={renderItem}
                ListHeaderComponent={
                    <View className="px-4 pt-6 pb-4">
                        <Text className="text-2xl font-bold text-gray-900 mb-6">Dashboard</Text>
                        
                        {/* Stats Cards */}
                        <View className="flex-row gap-3 mb-8">
                            <View className="flex-1 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                                <Text className="text-gray-500 text-[10px] font-bold uppercase">Active</Text>
                                <Text className="text-2xl font-bold text-gray-900 mt-1">{activeCount}</Text>
                            </View>
                            <View className="flex-1 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                                <Text className="text-gray-500 text-[10px] font-bold uppercase">Done</Text>
                                <Text className="text-2xl font-bold text-green-600 mt-1">{completedCount}</Text>
                            </View>
                            <View className="flex-1 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                                <Text className="text-gray-500 text-[10px] font-bold uppercase">Total</Text>
                                <Text className="text-2xl font-bold text-indigo-600 mt-1">{assignments.length}</Text>
                            </View>
                        </View>

                        <Text className="text-lg font-bold text-gray-900 mb-4">Recents</Text>
                    </View>
                }
                ListEmptyComponent={
                    <View className="mx-4 p-8 bg-white rounded-xl border border-gray-100 items-center">
                        <Text className="text-gray-400 text-sm font-medium">No active assignments.</Text>
                    </View>
                }
                onRefresh={fetchAssignments}
                refreshing={loading}
                contentContainerStyle={{ paddingBottom: 100 }}
                showsVerticalScrollIndicator={false}
            />
            {loading && !assignments.length && (
                <View className="absolute inset-0 bg-gray-50 justify-center items-center">
                    <ActivityIndicator size="large" color="#4F46E5" />
                </View>
            )}
        </SafeAreaView>
    );
};

export default Dashboard;
