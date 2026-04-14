import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, ActivityIndicator, Alert, SafeAreaView, StatusBar } from 'react-native';
import { Feather } from '@expo/vector-icons';
import api from '../services/api';

const OfferLetters = () => {
    const [offers, setOffers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    const fetchOffers = async () => {
        try {
            setLoading(true);
            const res = await api.get('/offer-letters');
            setOffers(Array.isArray(res.data) ? res.data : []);
        } catch (error) {
            console.error('Fetch offers error:', error);
            Alert.alert('Error', 'Failed to load offer letters.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOffers();
    }, []);

    const filtered = offers.filter(o => 
        o.candidate?.name?.toLowerCase().includes(search.toLowerCase()) ||
        o.position?.toLowerCase().includes(search.toLowerCase()) ||
        o.department?.toLowerCase().includes(search.toLowerCase())
    );

    const getStatusConfig = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'pending': return { bg: 'bg-yellow-50', text: 'text-yellow-600', icon: 'clock' };
            case 'accepted': return { bg: 'bg-green-50', text: 'text-green-600', icon: 'check-circle' };
            case 'declined': return { bg: 'bg-red-50', text: 'text-red-600', icon: 'x-circle' };
            default: return { bg: 'bg-gray-50', text: 'text-gray-500', icon: 'help-circle' };
        }
    };

    const renderItem = ({ item }: { item: any }) => {
        const config = getStatusConfig(item.status);
        return (
            <TouchableOpacity 
                activeOpacity={0.8}
                className="bg-white p-4 mb-3 rounded-lg border border-gray-200 shadow-sm"
            >
                <View className="flex-row items-center justify-between mb-4">
                    <View className="flex-1">
                        <Text className="text-base font-bold text-gray-900">{item.candidate?.name}</Text>
                        <Text className="text-xs text-gray-500">{item.position} • {item.department || 'General'}</Text>
                    </View>
                    <View className={`px-2 py-0.5 rounded-md ${config.bg}`}>
                        <Text className={`text-[10px] font-bold uppercase ${config.text}`}>
                            {item.status}
                        </Text>
                    </View>
                </View>
                
                <View className="flex-row items-center justify-between pt-3 border-t border-gray-100">
                    <Text className="text-[10px] text-gray-400 font-bold uppercase">
                        {new Date(item.createdAt).toLocaleDateString()}
                    </Text>
                    <TouchableOpacity className="bg-gray-100 px-3 py-1 rounded-md border border-gray-200">
                        <Text className="text-gray-700 font-bold text-[10px] uppercase">Details</Text>
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <StatusBar barStyle="dark-content" />
            <View className="flex-1 px-4">
                <View className="pt-6 pb-4">
                    <Text className="text-2xl font-bold text-gray-900 mb-6">Offer Letters</Text>
                    
                    <View className="bg-white border border-gray-200 rounded-lg flex-row items-center px-4 py-2">
                        <Feather name="search" size={18} color="#9CA3AF" />
                        <TextInput
                            className="flex-1 ml-3 h-10 text-gray-900 text-sm"
                            placeholder="Search candidates..."
                            placeholderTextColor="#9CA3AF"
                            value={search}
                            onChangeText={setSearch}
                        />
                    </View>
                </View>

                {loading && offers.length === 0 ? (
                    <View className="flex-1 items-center justify-center">
                        <ActivityIndicator size="large" color="#2563eb" />
                    </View>
                ) : (
                    <FlatList
                        data={filtered}
                        keyExtractor={(item) => item._id}
                        renderItem={renderItem}
                        ListEmptyComponent={
                            <View className="p-10 bg-white rounded-lg items-center border border-gray-100 mt-4">
                                <Text className="text-gray-400 text-sm font-bold text-center">No results found.</Text>
                            </View>
                        }
                        onRefresh={fetchOffers}
                        refreshing={loading}
                        contentContainerStyle={{ paddingBottom: 80 }}
                        showsVerticalScrollIndicator={false}
                    />
                )}
            </View>
        </SafeAreaView>
    );
};

export default OfferLetters;
