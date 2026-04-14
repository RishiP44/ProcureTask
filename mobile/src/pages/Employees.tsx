import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, ActivityIndicator, Alert, SafeAreaView, StatusBar } from 'react-native';
import { Feather } from '@expo/vector-icons';
import api from '../services/api';

interface EmployeesProps {
    onSelectEmployee: (id: string) => void;
}

const Employees = ({ onSelectEmployee }: EmployeesProps) => {
    const [employees, setEmployees] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    const fetchEmployees = async () => {
        try {
            setLoading(true);
            const res = await api.get('/users');
            setEmployees(Array.isArray(res.data) ? res.data : []);
        } catch (error) {
            console.error('Fetch employees error:', error);
            Alert.alert('Error', 'Failed to load employee directory.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEmployees();
    }, []);

    const filtered = employees.filter(emp => 
        emp.name?.toLowerCase().includes(search.toLowerCase()) ||
        emp.email?.toLowerCase().includes(search.toLowerCase()) ||
        emp.department?.toLowerCase().includes(search.toLowerCase())
    );

    const renderItem = ({ item }: { item: any }) => (
        <TouchableOpacity 
            activeOpacity={0.7}
            onPress={() => onSelectEmployee(item._id)}
            className="bg-white p-4 mb-2 rounded-lg border border-gray-100 flex-row items-center justify-between"
        >
            <View className="flex-1">
                <Text className="text-gray-900 font-bold text-sm uppercase tracking-tight">{item.name}</Text>
                <Text className="text-[10px] text-gray-400 font-bold uppercase mt-1">
                    {item.position || item.role} • {item.department || 'Staff'}
                </Text>
            </View>
            <View className="px-2 py-1 bg-gray-50 rounded">
                <Text className="text-[9px] font-bold text-gray-400 uppercase">Profile</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView className="flex-1 bg-white">
            <StatusBar barStyle="dark-content" />
            <View className="flex-1 px-5">
                <View className="pt-8 pb-4">
                    <Text className="text-2xl font-bold text-gray-900 tracking-tight">Directory</Text>
                    <Text className="text-[10px] text-gray-400 font-bold uppercase mt-1 tracking-widest">{employees.length} team members</Text>
                    
                    <View className="mt-6 bg-gray-50 rounded-lg px-4 py-3">
                        <TextInput
                            className="h-8 text-gray-900 text-sm font-medium"
                            placeholder="FIND AN EMPLOYEE..."
                            placeholderTextColor="#9CA3AF"
                            value={search}
                            onChangeText={setSearch}
                        />
                    </View>
                </View>

                {loading ? (
                    <View className="flex-1 items-center justify-center">
                        <ActivityIndicator size="small" color="#111827" />
                    </View>
                ) : (
                    <FlatList
                        data={filtered}
                        keyExtractor={(item) => item._id}
                        renderItem={renderItem}
                        ListEmptyComponent={
                            <View className="p-8 border-2 border-dashed border-gray-50 rounded-lg items-center mt-4">
                                <Text className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">No results found</Text>
                            </View>
                        }
                        onRefresh={fetchEmployees}
                        refreshing={loading}
                        contentContainerStyle={{ paddingBottom: 80 }}
                        showsVerticalScrollIndicator={false}
                    />
                )}
            </View>
        </SafeAreaView>
    );
};

export default Employees;
