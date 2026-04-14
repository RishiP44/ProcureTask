import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, FlatList, ActivityIndicator, SafeAreaView, StatusBar } from 'react-native';
import { Feather } from '@expo/vector-icons';
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
            setAssignments(Array.isArray(res.data) ? res.data : []);
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
            className="bg-white p-5 mb-3 rounded border border-blue-100 flex-row items-center justify-between"
            activeOpacity={0.7}
            onPress={() => onSelectAssignment(item._id)}
        >
            <View className="flex-1">
                <Text className="text-blue-900 font-bold text-sm" numberOfLines={1}>
                    {item.workflow?.name || 'Untitled Workflow'}
                </Text>
                <Text className="text-[10px] text-blue-400 font-bold uppercase mt-1 tracking-wider">
                    {item.user?.name || 'Self'} • {item.status.replace('_', ' ')}
                </Text>
            </View>
            <Feather name="chevron-right" size={16} color="#1e40af" />
        </TouchableOpacity>
    );

    return (
        <SafeAreaView className="flex-1 bg-white">
            <StatusBar barStyle="dark-content" />
            <FlatList
                data={assignments}
                keyExtractor={(item) => item._id}
                renderItem={renderItem}
                contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }}
                ListHeaderComponent={
                    <View className="pt-12 pb-6">
                        <View className="mb-10">
                            <Text className="font-bold text-slate-900 text-2xl tracking-tighter">ProcureTask</Text>
                            <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">HR Organization</Text>
                            <View className="mt-8">
                                <Text className="text-3xl font-bold text-slate-900 tracking-tighter">Dashboard</Text>
                                <Text className="text-[11px] text-slate-400 font-bold uppercase mt-1 tracking-widest">
                                    Welcome, {user?.name}
                                </Text>
                            </View>
                        </View>
                        
                        <View className="flex-row gap-4 mb-12">
                            <View className="flex-1 border border-slate-100 p-6 rounded bg-white">
                                <Text className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">Pending</Text>
                                <Text className="text-3xl font-bold text-slate-900 tracking-tighter">{activeCount}</Text>
                            </View>
                            <View className="flex-1 border border-slate-100 p-6 rounded bg-white">
                                <Text className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">Completed</Text>
                                <Text className="text-3xl font-bold text-slate-900 tracking-tighter">{completedCount}</Text>
                            </View>
                        </View>

                        <Text className="text-[10px] font-bold text-slate-300 mb-5 uppercase tracking-widest">Active Tasks</Text>
                    </View>
                }
                ListEmptyComponent={
                    <View className="py-12 border border-blue-50 rounded items-center">
                        <Text className="text-blue-300 text-[10px] font-bold uppercase tracking-widest">No tasks available</Text>
                    </View>
                }
                onRefresh={fetchAssignments}
                refreshing={loading}
            />
        </SafeAreaView>
    );
};

export default Dashboard;
