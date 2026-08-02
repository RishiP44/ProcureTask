import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity, Linking, Alert, RefreshControl } from 'react-native';
import { Feather } from '@expo/vector-icons';
import api from '../services/api';
import { DataBlock, WebSectionHeader } from '../components/Theme';

const getBaseUrl = () => String(api.defaults.baseURL || '').replace(/\/api\/?$/, '');

const Documents = () => {
    const [docs, setDocs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const load = async () => {
        try {
            setLoading(true);
            const res = await api.get('/documents');
            setDocs(Array.isArray(res.data) ? res.data : []);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, []);

    const openDoc = (item: any) => {
        const path = item.url || item.filePath || item.path;
        if (!path) {
            Alert.alert('Unavailable', 'No downloadable link for this document.');
            return;
        }
        const url = path.startsWith('http') ? path : `${getBaseUrl()}${path}`;
        Linking.openURL(url).catch(() => Alert.alert('Error', 'Could not open document.'));
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Documents</Text>
            <WebSectionHeader title="Security Vault" count={docs.length} />

            {loading && docs.length === 0 ? (
                <ActivityIndicator color="#2563eb" size="large" style={{ marginTop: 40 }} />
            ) : (
                <FlatList
                    data={docs}
                    keyExtractor={item => item._id || item.url || Math.random().toString()}
                    refreshControl={<RefreshControl refreshing={loading} onRefresh={load} tintColor="#2563eb" />}
                    renderItem={({ item }) => (
                        <TouchableOpacity activeOpacity={0.7} onPress={() => openDoc(item)}>
                            <DataBlock>
                                <View style={styles.row}>
                                    <View style={styles.iconBox}>
                                        <Feather name="file-text" size={20} color="#64748b" />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.name}>{item.originalName || item.fileName || 'Document'}</Text>
                                        <Text style={styles.meta}>
                                            {(item.type || item.workflowName || 'DOCUMENT').toString().toUpperCase()}
                                            {item.createdAt || item.date
                                                ? ` · ${new Date(item.createdAt || item.date).toLocaleDateString()}`
                                                : ''}
                                        </Text>
                                    </View>
                                    <Feather name="external-link" size={16} color="#3b82f6" />
                                </View>
                            </DataBlock>
                        </TouchableOpacity>
                    )}
                    ListEmptyComponent={
                        <View style={{ padding: 40, alignItems: 'center' }}>
                            <Feather name="folder" size={28} color="#cbd5e1" />
                            <Text style={{ color: '#94a3b8', fontSize: 13, marginTop: 12, fontWeight: '700' }}>No documents in vault.</Text>
                        </View>
                    }
                    contentContainerStyle={{ paddingBottom: 40 }}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20 },
    title: { fontSize: 26, fontWeight: '800', color: '#0f172a', letterSpacing: -1, marginBottom: 8 },
    row: { flexDirection: 'row', alignItems: 'center' },
    iconBox: {
        width: 44, height: 44, backgroundColor: '#f8fafc', borderRadius: 4,
        alignItems: 'center', justifyContent: 'center', marginRight: 16,
        borderWidth: 1, borderColor: '#e2e8f0'
    },
    name: { fontSize: 14, fontWeight: '600', color: '#0f172a' },
    meta: { fontSize: 11, color: '#94a3b8', marginTop: 2, fontWeight: '700' }
});

export default Documents;
