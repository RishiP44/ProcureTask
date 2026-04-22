import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { DataBlock, WebSectionHeader } from '../components/Theme';
import { Feather } from '@expo/vector-icons';
import api from '../services/api';

const Notifications = () => {
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        // Fetch or simulate notifications
        api.get('/notifications').then(res => setNotifications(res.data)).catch(() => setNotifications([]));
    }, []);

    return (
        <View style={styles.container}>
            <WebSectionHeader title="System Alerts" count={notifications.length} />
            <FlatList
                data={notifications}
                keyExtractor={(item: any) => item._id || Math.random().toString()}
                renderItem={({ item }) => (
                    <DataBlock style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <View style={styles.iconBox}>
                            <Feather name="bell" size={16} color="#3b82f6" />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.title}>{item.title}</Text>
                            <Text style={styles.message}>{item.message}</Text>
                        </View>
                    </DataBlock>
                )}
                ListEmptyComponent={
                    <DataBlock style={{ padding: 40, alignItems: 'center' }}>
                        <Feather name="bell-off" size={32} color="#cbd5e1" />
                        <Text style={styles.emptyText}>Zero pending alerts</Text>
                    </DataBlock>
                }
                contentContainerStyle={{ padding: 20 }}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    iconBox: { width: 40, height: 40, backgroundColor: '#eff6ff', borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginRight: 16 },
    title: { fontSize: 14, fontWeight: '800', color: '#0f172a' },
    message: { fontSize: 11, fontWeight: '600', color: '#64748b', marginTop: 4 },
    emptyText: { fontSize: 10, fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', marginTop: 16 }
});

export default Notifications;
