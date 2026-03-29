import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Linking, SafeAreaView } from 'react-native';
import api from '../services/api';

const Documents = () => {
    const [documents, setDocuments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchDocuments = async () => {
        try {
            setLoading(true);
            const res = await api.get('/documents');
            setDocuments(res.data);
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
        const url = `http://localhost:5000${doc.url}`;
        Linking.openURL(url).catch(err => console.error("Couldn't load page", err));
    };

    const renderItem = ({ item }: { item: any }) => (
        <View className="bg-white p-4 mb-3 rounded-lg border border-gray-200 shadow-sm flex-row justify-between items-center">
            <View className="flex-1 mr-4">
                <Text className="text-sm font-bold text-gray-900 mb-1" numberOfLines={1}>📄 {item.fileName}</Text>
                <View className="flex-row items-center">
                    <Text className="text-[10px] text-gray-400 font-medium">{item.uploadedBy}</Text>
                    <View className="mx-2 w-1 h-1 bg-gray-200 rounded-full" />
                    <Text className="text-[10px] text-gray-400 font-medium">{new Date(item.date).toLocaleDateString()}</Text>
                </View>
                <Text className="text-[10px] text-indigo-500 font-bold mt-1 uppercase tracking-tight">{item.workflowName}</Text>
            </View>
            <TouchableOpacity 
                onPress={() => handleOpen(item)}
                className="bg-gray-50 px-3 py-2 rounded-md border border-gray-200"
            >
                <Text className="text-indigo-600 text-[10px] font-bold">View</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <FlatList
                data={documents}
                keyExtractor={(item) => item._id}
                renderItem={renderItem}
                ListHeaderComponent={
                    <View className="px-4 pt-6 pb-4">
                        <Text className="text-2xl font-bold text-gray-900 mb-6">Document Repository</Text>
                        
                        <View className="bg-white p-4 rounded-lg border border-gray-100 mb-4 flex-row items-center">
                            <View className="flex-1">
                                <Text className="text-gray-900 font-bold text-sm">Centralized Vault</Text>
                                <Text className="text-gray-400 text-[10px] mt-0.5">Securely access and browse all project documentation.</Text>
                            </View>
                        </View>
                    </View>
                }
                ListEmptyComponent={
                    <View className="mx-4 p-8 bg-white rounded-lg border border-gray-100 items-center">
                        <Text className="text-gray-400 text-sm font-medium">No documents uploaded yet.</Text>
                    </View>
                }
                onRefresh={fetchDocuments}
                refreshing={loading}
                contentContainerStyle={{ paddingBottom: 100 }}
                showsVerticalScrollIndicator={false}
            />
            {loading && !documents.length && (
                <View className="absolute inset-0 bg-gray-50 justify-center items-center">
                    <ActivityIndicator size="large" color="#4F46E5" />
                </View>
            )}
        </SafeAreaView>
    );
};

export default Documents;
