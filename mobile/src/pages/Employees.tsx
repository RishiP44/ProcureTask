import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TextInput, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import api from '../services/api';
import { DataBlock, WebSectionHeader } from '../components/Theme';

const Employees = ({ setScreen, onSelectEmployee }: { setScreen: (s:string)=>void, onSelectEmployee: (id:string)=>void }) => {
    const [employees, setEmployees] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        const load = async () => {
            try {
                const res = await api.get('/users?role=Employee');
                setEmployees(res.data);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const filtered = employees.filter(e => 
        (e.name || '').toLowerCase().includes(search.toLowerCase()) || 
        (e.email || '').toLowerCase().includes(search.toLowerCase())
    );

    return (
        <View style={styles.container}>
            <View style={styles.searchContainer}>
                <Feather name="search" size={16} color="#94a3b8" />
                <TextInput 
                    style={styles.searchInput}
                    placeholder="Search directory..."
                    value={search}
                    onChangeText={setSearch}
                />
            </View>

            <WebSectionHeader title="Corporate Directory" count={filtered.length} />

            {loading ? (
                <ActivityIndicator color="#2563eb" size="large" style={{ marginTop: 40 }} />
            ) : (
                <FlatList 
                    data={filtered}
                    keyExtractor={item => item._id}
                    renderItem={({ item }) => (
                        <TouchableOpacity 
                            activeOpacity={0.7} 
                            onPress={() => {
                                onSelectEmployee(item._id);
                                setScreen('EmployeeProfile');
                            }}
                        >
                            <DataBlock>
                                <View style={styles.row}>
                                    <View style={styles.avatar}>
                                        <Text style={styles.avatarText}>{item.name.charAt(0)}</Text>
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.name}>{item.name}</Text>
                                        <Text style={styles.role}>{(item.role || 'Employee').toUpperCase()} • {item.email}</Text>
                                    </View>
                                    <Feather name="chevron-right" size={16} color="#cbd5e1" />
                                </View>
                            </DataBlock>
                        </TouchableOpacity>
                    )}
                    contentContainerStyle={{ paddingBottom: 40 }}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20 },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 4,
        paddingHorizontal: 12,
        height: 44,
        marginBottom: 24
    },
    searchInput: { flex: 1, marginLeft: 10, fontSize: 14, color: '#0f172a' },
    row: { flexDirection: 'row', alignItems: 'center' },
    avatar: {
        width: 40,
        height: 40,
        backgroundColor: '#f1f5f9',
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16
    },
    avatarText: { fontWeight: '700', color: '#64748b' },
    name: { fontSize: 16, fontWeight: '600', color: '#0f172a' },
    role: { fontSize: 11, color: '#94a3b8', marginTop: 2, fontWeight: '700' }
});

export default Employees;
