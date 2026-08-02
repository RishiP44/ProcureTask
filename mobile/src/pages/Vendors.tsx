import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TextInput, StyleSheet, ActivityIndicator, TouchableOpacity, Modal, Alert, ScrollView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import api from '../services/api';
import { DataBlock, WebSectionHeader, IndustrialButton } from '../components/Theme';

const emptyForm = {
    name: '', email: '', companyName: '', vendorType: '', taxId: '', website: '', address: '', role: 'Vendor'
};

const Vendors = ({ setScreen, onSelectEmployee }: { setScreen: (s: string) => void; onSelectEmployee: (id: string) => void }) => {
    const [vendors, setVendors] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showInvite, setShowInvite] = useState(false);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState(emptyForm);

    const load = async () => {
        try {
            const res = await api.get('/users', { params: { role: 'Vendor' } });
            setVendors(Array.isArray(res.data) ? res.data : []);
        } catch (e) {
            console.error(e);
            Alert.alert('Error', 'Failed to load vendors.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, []);

    const submitInvite = async () => {
        if (!form.name || !form.email || !form.companyName || !form.vendorType || !form.taxId || !form.address) {
            return Alert.alert('Missing fields', 'Please fill all required vendor fields.');
        }
        setSaving(true);
        try {
            await api.post('/auth/invite', form);
            Alert.alert('Invite sent', `Invitation emailed to ${form.email}`);
            setShowInvite(false);
            setForm(emptyForm);
            await load();
        } catch (err: any) {
            Alert.alert('Invite failed', err.response?.data?.message || 'Could not invite vendor.');
        } finally {
            setSaving(false);
        }
    };

    const filtered = vendors.filter(v =>
        [v.companyName, v.name, v.email, v.vendorType].join(' ').toLowerCase().includes(search.toLowerCase())
    );

    return (
        <View style={styles.container}>
            <View style={styles.headerRow}>
                <View style={{ flex: 1 }}>
                    <Text style={styles.title}>Vendors</Text>
                </View>
                <TouchableOpacity style={styles.addBtn} onPress={() => setShowInvite(true)}>
                    <Feather name="plus" size={18} color="white" />
                </TouchableOpacity>
            </View>

            <View style={styles.searchContainer}>
                <Feather name="search" size={16} color="#94a3b8" />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search company, contact, category..."
                    value={search}
                    onChangeText={setSearch}
                    placeholderTextColor="#94a3b8"
                />
            </View>

            <WebSectionHeader title="Vendor Directory" count={filtered.length} />

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
                                        <Feather name="briefcase" size={18} color="#d97706" />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.name}>{item.companyName || item.name}</Text>
                                        <Text style={styles.meta}>{item.vendorType || 'Vendor partner'}</Text>
                                        <Text style={styles.contact}>Contact: {item.name} · {item.email}</Text>
                                    </View>
                                    <Feather name="chevron-right" size={16} color="#cbd5e1" />
                                </View>
                            </DataBlock>
                        </TouchableOpacity>
                    )}
                    ListEmptyComponent={
                        <DataBlock style={{ alignItems: 'center', padding: 40 }}>
                            <Feather name="briefcase" size={28} color="#cbd5e1" />
                            <Text style={styles.empty}>No vendors yet</Text>
                        </DataBlock>
                    }
                    contentContainerStyle={{ paddingBottom: 40 }}
                />
            )}

            <Modal visible={showInvite} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Invite Vendor</Text>
                            <TouchableOpacity onPress={() => setShowInvite(false)} style={styles.closeBtn}>
                                <Feather name="x" size={20} color="#64748b" />
                            </TouchableOpacity>
                        </View>
                        <ScrollView contentContainerStyle={{ padding: 24 }} keyboardShouldPersistTaps="handled">
                            {[
                                ['Company name', 'companyName'],
                                ['Vendor category', 'vendorType'],
                                ['Contact name', 'name'],
                                ['Contact email', 'email'],
                                ['Tax ID / business number', 'taxId'],
                                ['Website', 'website'],
                                ['Business address', 'address'],
                            ].map(([label, key]) => (
                                <View key={key} style={{ marginBottom: 12 }}>
                                    <Text style={styles.inputLabel}>{label}</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder={label}
                                        placeholderTextColor="#94a3b8"
                                        value={(form as any)[key]}
                                        onChangeText={v => setForm({ ...form, [key]: v })}
                                        keyboardType={key === 'email' ? 'email-address' : 'default'}
                                        autoCapitalize={key === 'email' || key === 'website' ? 'none' : 'sentences'}
                                    />
                                </View>
                            ))}
                            <IndustrialButton label={saving ? 'SENDING…' : 'SEND VENDOR INVITE'} onPress={submitInvite} loading={saving} />
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20 },
    headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
    title: { fontSize: 26, fontWeight: '800', color: '#0f172a', letterSpacing: -1 },
    addBtn: { width: 40, height: 40, backgroundColor: '#0f172a', borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
    searchContainer: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
        borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 4, paddingHorizontal: 12, height: 44, marginBottom: 20
    },
    searchInput: { flex: 1, marginLeft: 10, fontSize: 14, color: '#0f172a' },
    row: { flexDirection: 'row', alignItems: 'center' },
    avatar: {
        width: 44, height: 44, backgroundColor: '#fffbeb', borderRadius: 12,
        alignItems: 'center', justifyContent: 'center', marginRight: 14
    },
    name: { fontSize: 15, fontWeight: '800', color: '#0f172a' },
    meta: { fontSize: 12, color: '#64748b', marginTop: 2, fontWeight: '600' },
    contact: { fontSize: 10, color: '#94a3b8', marginTop: 4, fontWeight: '700', textTransform: 'uppercase' },
    empty: { fontSize: 11, fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', marginTop: 12 },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.4)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: 'white', borderTopLeftRadius: 28, borderTopRightRadius: 28, maxHeight: '90%' },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 24, paddingBottom: 8 },
    modalTitle: { fontSize: 20, fontWeight: '800', color: '#0f172a' },
    closeBtn: { width: 40, height: 40, backgroundColor: '#f1f5f9', borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
    inputLabel: { fontSize: 10, fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 6 },
    input: {
        backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12,
        height: 48, paddingHorizontal: 14, fontSize: 14, fontWeight: '600', color: '#0f172a'
    },
});

export default Vendors;
