import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { Feather } from '@expo/vector-icons';
import api from '../services/api';
import { DataBlock, WebSectionHeader } from '../components/Theme';

const Documents = () => {
    const [docs, setDocs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const res = await api.get('/documents');
                setDocs(res.data);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    return (
        <View style={styles.container}>
            <WebSectionHeader title="Security Vault" count={docs.length} />

            {loading ? (
                <ActivityIndicator color="#2563eb" size="large" style={{ marginTop: 40 }} />
            ) : (
                <FlatList 
                    data={docs}
                    keyExtractor={item => item._id}
                    renderItem={({ item }) => (
                        <DataBlock>
                            <View style={styles.row}>
                                <View style={styles.iconBox}>
                                    <Feather name="file-text" size={20} color="#64748b" />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.name}>{item.originalName}</Text>
                                    <Text style={styles.meta}>{(item.type || 'DOCUMENT').toUpperCase()} • {new Date(item.createdAt).toLocaleDateString()}</Text>
                                </View>
                                <Feather name="download" size={16} color="#94a3b8" />
                            </View>
                        </DataBlock>
                    )}
                    ListEmptyComponent={
                        <View style={{ padding: 40, alignItems: 'center' }}>
                            <Text style={{ color: '#94a3b8', fontSize: 13 }}>No documents in vault.</Text>
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
    row: { flexDirection: 'row', alignItems: 'center' },
    iconBox: {
        width: 44,
        height: 44,
        backgroundColor: '#f8fafc',
        borderRadius: 4,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
        borderWidth: 1,
        borderColor: '#e2e8f0'
    },
    name: { fontSize: 14, fontWeight: '600', color: '#0f172a' },
    meta: { fontSize: 11, color: '#94a3b8', marginTop: 2, fontWeight: '700' }
});

export default Documents;
