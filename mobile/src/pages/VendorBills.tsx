import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, Alert } from 'react-native';
import api from '../services/api';

const VendorBills = () => {
    const [bills, setBills] = useState<any[]>([]);
    const [form, setForm] = useState({ invoiceNumber: '', billDate: new Date().toISOString().slice(0, 10), category: '', subtotal: '', taxAmount: '0', documentUrl: '' });

    const load = () => api.get('/vendor-bills').then(res => setBills(res.data)).catch(() => setBills([]));
    useEffect(() => { void load(); }, []);

    const submit = async () => {
        if (!form.invoiceNumber || !form.category || !form.subtotal || !form.documentUrl) {
            return Alert.alert('Missing information', 'Enter invoice details and an uploaded document URL.');
        }
        try {
            await api.post('/vendor-bills', { ...form, currency: 'CAD' });
            setForm({ invoiceNumber: '', billDate: new Date().toISOString().slice(0, 10), category: '', subtotal: '', taxAmount: '0', documentUrl: '' });
            await load();
            Alert.alert('Submitted', 'Your audited bill is ready for admin review.');
        } catch (error: any) {
            Alert.alert('Submission failed', error.response?.data?.message || 'Please try again.');
        }
    };

    return <ScrollView contentContainerStyle={styles.page}>
        <Text style={styles.eyebrow}>ACCOUNTS PAYABLE</Text>
        <Text style={styles.title}>Vendor Bills</Text>
        <Text style={styles.subtitle}>Submit audited invoices for products and services delivered.</Text>
        <View style={styles.card}>
            <Text style={styles.cardTitle}>New bill</Text>
            {[
                ['Invoice number', 'invoiceNumber'], ['Bill date (YYYY-MM-DD)', 'billDate'],
                ['Product / service category', 'category'], ['Subtotal', 'subtotal'],
                ['Tax amount', 'taxAmount'], ['Uploaded document URL', 'documentUrl']
            ].map(([label, key]) => <TextInput key={key} style={styles.input} placeholder={label} value={(form as any)[key]} onChangeText={value => setForm({...form, [key]: value})} />)}
            <TouchableOpacity style={styles.button} onPress={submit}><Text style={styles.buttonText}>SUBMIT FOR AUDIT</Text></TouchableOpacity>
        </View>
        <Text style={styles.section}>MY SUBMISSIONS</Text>
        {bills.map(b => <View key={b._id} style={styles.card}><View style={styles.row}><Text style={styles.invoice}>{b.invoiceNumber}</Text><Text style={styles.status}>{b.status}</Text></View><Text style={styles.meta}>{b.category}</Text><Text style={styles.amount}>${Number(b.totalAmount || 0).toFixed(2)} {b.currency}</Text></View>)}
    </ScrollView>;
};

const styles = StyleSheet.create({
    page: { padding: 20, gap: 14 }, eyebrow: { fontSize: 10, fontWeight: '900', color: '#10b981', letterSpacing: 2 },
    title: { fontSize: 30, fontWeight: '900', color: '#0f172a' }, subtitle: { color: '#64748b', marginBottom: 8 },
    card: { backgroundColor: 'white', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 18, padding: 18, gap: 10 },
    cardTitle: { fontSize: 16, fontWeight: '900', color: '#0f172a' }, input: { borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 10, padding: 12, backgroundColor: '#f8fafc' },
    button: { backgroundColor: '#2563eb', borderRadius: 10, padding: 14, alignItems: 'center' }, buttonText: { color: 'white', fontSize: 11, fontWeight: '900' },
    section: { marginTop: 10, fontSize: 10, fontWeight: '900', color: '#94a3b8', letterSpacing: 2 }, row: { flexDirection: 'row', justifyContent: 'space-between' },
    invoice: { fontWeight: '900', color: '#0f172a' }, status: { color: '#2563eb', fontWeight: '800', fontSize: 11 }, meta: { color: '#64748b' }, amount: { fontSize: 18, fontWeight: '900', color: '#0f172a' }
});
export default VendorBills;
