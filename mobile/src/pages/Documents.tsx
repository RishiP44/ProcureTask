import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Linking, SafeAreaView, StatusBar } from 'react-native';
import { Feather } from '@expo/vector-icons';
import api from '../services/api';

const Documents = () => {
    const [documents, setDocuments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchDocuments = async () => {
        try {
            setLoading(true);
            const res = await api.get('/documents');
            setDocuments(Array.isArray(res.data) ? res.data : []);
        } catch (error) {
            console.error('Failed to fetch documents', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDocuments();
    }, []);

    const handleOpen = (doc: any) => {
        // Fallback to local if no production URL provided
        const url = `http://localhost:5000${doc.url}`;
        Linking.openURL(url).catch(err => console.error("Couldn't load page", err));
    };

    const renderItem = ({ item }: { item: any }) => (
        <TouchableOpacity 
            activeOpacity={0.8}
            onPress={() => handleOpen(item)}
            className="bg-white p-4 mb-3 rounded-lg border border-gray-200 shadow-sm flex-row items-center"
        >
            <View className="w-10 h-10 rounded-md bg-gray-100 items-center justify-center mr-3 border border-gray-200">
                <Feather name="file-text" size={18} color="#6b7280" />
            </View>
            <View className="flex-1 mr-4">
                <Text className="text-sm font-bold text-gray-900" numberOfLines={1}>{item.fileName}</Text>
                <Text className="text-[10px] text-gray-500 mt-0.5">
                    {item.workflowName || 'General'} • {new Date(item.date).toLocaleDateString()}
                </Text>
            </View>
            <Feather name="external-link" size={14} color="#9CA3AF" />
        </TouchableOpacity>
    );

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <StatusBar barStyle="dark-content" />
            <View className="flex-1 px-4">
                <FlatList
                    data={documents}
                    keyExtractor={(item) => item._id}
                    renderItem={renderItem}
                    contentContainerStyle={{ paddingBottom: 80 }}
                    showsVerticalScrollIndicator={false}
                    ListHeaderComponent={
                        <View className="pt-6 pb-4">
                            <Text className="text-2xl font-bold text-gray-900 mb-6">Documents</Text>
                        </View>
                    }
                    ListEmptyComponent={
                        <View className="p-10 bg-white rounded-lg items-center border border-gray-100 mt-4">
                            <Text className="text-gray-400 text-sm">No documents found.</Text>
                        </View>
                    }
                    onRefresh={fetchDocuments}
                    refreshing={loading}
                />
            </View>
        </SafeAreaView>
    );
};

export default Documents;
