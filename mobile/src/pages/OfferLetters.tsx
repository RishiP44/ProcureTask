import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl, StatusBar, StyleSheet, Alert, Modal, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import api from '../services/api';
import { DataBlock, WebBadge, WebSectionHeader } from '../components/Theme';

const OfferLetters = () => {
    const [offers, setOffers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    
    // Add Offer State
    const [showModal, setShowModal] = useState(false);
    const [newName, setNewName] = useState('');
    const [newEmail, setNewEmail] = useState('');
    const [newPosition, setNewPosition] = useState('');
    const [newDepartment, setNewDepartment] = useState('');
    const [newSalary, setNewSalary] = useState('');
    const [newStartDate, setNewStartDate] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const fetchOffers = async () => {
        try {
            setLoading(true);
            const res = await api.get('/offer-letters');
            setOffers(Array.isArray(res.data) ? res.data : []);
        } catch (error) {
            console.error('Fetch offers error:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOffers();
    }, []);

    const handleCreateOffer = async () => {
        if (!newName || !newEmail || !newPosition || !newDepartment || !newSalary) {
            Alert.alert('Validation Error', 'Name, email, position, department, and salary are required.');
            return;
        }

        try {
            setSubmitting(true);
            await api.post('/offer-letters', {
                candidate: { name: newName, email: newEmail },
                position: newPosition,
                department: newDepartment,
                salary: Number(newSalary) || 0,
                startDate: newStartDate || undefined,
                status: 'pending'
            });
            setShowModal(false);
            setNewName(''); setNewEmail(''); setNewPosition(''); setNewDepartment('');
            setNewSalary(''); setNewStartDate('');
            fetchOffers();
        } catch (e: any) {
            Alert.alert('Dispatch Error', e.response?.data?.message || 'Failed to dispatch offer letter.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleRevoke = async (id: string) => {
        Alert.alert(
            'Revoke Offer',
            'Are you sure you want to revoke this pending offer letter?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Revoke',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await api.delete(`/offer-letters/${id}`);
                            Alert.alert('Success', 'Offer letter successfully revoked.');
                            fetchOffers();
                        } catch (err: any) {
                            Alert.alert('Error', err.response?.data?.message || 'Failed to revoke offer letter.');
                        }
                    }
                }
            ]
        );
    };

    const renderItem = ({ item }: { item: any }) => (
        <TouchableOpacity activeOpacity={0.8} style={{ marginBottom: 16 }}>
            <DataBlock>
                <View style={styles.topRow}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                        <View style={styles.avatar}>
                            <Text style={styles.avatarText}>
                                {(item.candidate?.name || 'U').charAt(0).toUpperCase()}
                            </Text>
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.name}>{item.candidate?.name}</Text>
                            <Text style={styles.email} numberOfLines={1}>{item.candidate?.email}</Text>
                        </View>
                    </View>
                    <View style={{ alignItems: 'flex-end', gap: 6, marginLeft: 8 }}>
                        <WebBadge status={item.status} />
                        {item.status === 'pending' && (
                            <TouchableOpacity 
                                onPress={() => handleRevoke(item._id)}
                                style={{ padding: 6, backgroundColor: '#fef2f2', borderRadius: 6 }}
                            >
                                <Feather name="trash-2" size={14} color="#ef4444" />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
                
                <View style={styles.footer}>
                    <View style={{ flex: 1, marginRight: 8 }}>
                        <Text style={styles.position}>{item.position}</Text>
                        <Text style={styles.department} numberOfLines={1}>{item.department}</Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                        <Text style={styles.dateLabel}>SALARY</Text>
                        <Text style={styles.date}>
                            ${Number(item.salary || 0).toLocaleString()}
                        </Text>
                    </View>
                </View>
            </DataBlock>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />
            <FlatList
                data={offers}
                keyExtractor={(item) => item._id}
                renderItem={renderItem}
                contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
                refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchOffers} tintColor="#2563eb" />}
                ListHeaderComponent={
                    <View style={{ paddingBottom: 24 }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Text style={styles.title}>Proposals</Text>
                            <TouchableOpacity style={styles.addBtn} onPress={() => setShowModal(true)}>
                                <Feather name="plus" size={18} color="white" />
                            </TouchableOpacity>
                        </View>
                    </View>
                }
                ListEmptyComponent={
                    <DataBlock style={{ padding: 40, alignItems: 'center' }}>
                        <Feather name="mail" size={32} color="#cbd5e1" />
                        <Text style={styles.emptyText}>Zero outbound engagement</Text>
                    </DataBlock>
                }
            />

            <Modal visible={showModal} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Dispatch Proposal</Text>
                            <TouchableOpacity onPress={() => setShowModal(false)} style={styles.closeBtn}>
                                <Feather name="x" size={20} color="#64748b" />
                            </TouchableOpacity>
                        </View>
                        <View style={{ padding: 24 }}>
                            <Text style={styles.inputLabel}>Candidate Details</Text>
                            <TextInput style={styles.input} placeholder="Candidate Name" value={newName} onChangeText={setNewName} />
                            <TextInput style={styles.input} placeholder="Candidate Email" value={newEmail} onChangeText={setNewEmail} keyboardType="email-address" />
                            
                            <Text style={[styles.inputLabel, { marginTop: 16 }]}>Role Definition</Text>
                            <TextInput style={styles.input} placeholder="Position Title" value={newPosition} onChangeText={setNewPosition} />
                            <TextInput style={styles.input} placeholder="Department" value={newDepartment} onChangeText={setNewDepartment} />
                            <TextInput style={styles.input} placeholder="Annual Salary" value={newSalary} onChangeText={setNewSalary} keyboardType="numeric" />
                            <TextInput style={styles.input} placeholder="Start Date (YYYY-MM-DD)" value={newStartDate} onChangeText={setNewStartDate} />

                            <TouchableOpacity style={styles.submitBtn} onPress={handleCreateOffer} disabled={submitting}>
                                <Text style={styles.submitBtnText}>{submitting ? 'DISPATCHING...' : 'DISPATCH OFFER'}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    title: { fontSize: 26, fontWeight: '800', color: '#0f172a', letterSpacing: -1 },
    addBtn: { width: 40, height: 40, backgroundColor: '#0f172a', borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
    topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
    avatar: { width: 40, height: 40, borderRadius: 8, backgroundColor: '#f1f5f9', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
    avatarText: { fontSize: 14, fontWeight: '900', color: '#64748b' },
    name: { fontSize: 14, fontWeight: '800', color: '#0f172a', textTransform: 'uppercase' },
    email: { fontSize: 10, fontWeight: '700', color: '#94a3b8' },
    footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 16, borderTopWidth: 1, borderTopColor: '#f1f5f9' },
    position: { fontSize: 12, fontWeight: '800', color: '#0f172a', textTransform: 'uppercase' },
    department: { fontSize: 9, fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1.5, marginTop: 2 },
    dateLabel: { fontSize: 9, fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', marginBottom: 2 },
    date: { fontSize: 12, fontWeight: '700', color: '#0f172a' },
    emptyText: { fontSize: 10, fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', marginTop: 16 },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.4)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: 'white', borderTopLeftRadius: 32, borderTopRightRadius: 32 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 24, paddingBottom: 16 },
    modalTitle: { fontSize: 20, fontWeight: '800', color: '#0f172a' },
    closeBtn: { width: 40, height: 40, backgroundColor: '#f1f5f9', borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
    inputLabel: { fontSize: 10, fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 8 },
    input: { backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12, height: 50, paddingHorizontal: 16, marginBottom: 12, fontSize: 14, fontWeight: '600', color: '#0f172a' },
    submitBtn: { backgroundColor: '#0f172a', height: 50, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginTop: 16 },
    submitBtnText: { color: 'white', fontSize: 11, fontWeight: '900', letterSpacing: 2 }
});

export default OfferLetters;
