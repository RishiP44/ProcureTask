import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, Alert, Linking, ActivityIndicator } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { DataBlock, WebBadge, IndustrialButton } from '../components/Theme';

const BILL_STATUSES = ['Submitted', 'Under Review', 'Approved', 'Rejected', 'Paid'];
const getBaseUrl = () => String(api.defaults.baseURL || '').replace(/\/api\/?$/, '');
const money = (value: number, currency = 'CAD') =>
    new Intl.NumberFormat('en-CA', { style: 'currency', currency }).format(value || 0);

const emptyForm = {
    invoiceNumber: '',
    billDate: new Date().toISOString().slice(0, 10),
    category: '',
    description: '',
    subtotal: '',
    taxAmount: '0',
    currency: 'CAD',
};

const VendorBills = () => {
    const { user } = useAuth();
    const isVendor = user?.role === 'Vendor';
    const [bills, setBills] = useState<any[]>([]);
    const [summary, setSummary] = useState<any>(null);
    const [form, setForm] = useState(emptyForm);
    const [fileName, setFileName] = useState('');
    const [fileAsset, setFileAsset] = useState<any>(null);
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(true);

    const load = async () => {
        try {
            const billsRes = await api.get('/vendor-bills');
            setBills(Array.isArray(billsRes.data) ? billsRes.data : []);
            if (!isVendor) {
                const sumRes = await api.get('/vendor-bills/summary').catch(() => ({ data: null }));
                setSummary(sumRes.data);
            }
        } catch {
            setBills([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { void load(); }, [isVendor]);

    const pickFile = async () => {
        const result = await DocumentPicker.getDocumentAsync({
            type: ['application/pdf', 'image/*'],
            copyToCacheDirectory: true,
        });
        if (result.canceled || !result.assets?.[0]) return;
        setFileAsset(result.assets[0]);
        setFileName(result.assets[0].name);
    };

    const submit = async () => {
        if (!form.invoiceNumber || !form.category || !form.subtotal || !fileAsset) {
            return Alert.alert('Missing information', 'Fill invoice details and attach a PDF or image.');
        }
        setSaving(true);
        try {
            const data = new FormData();
            data.append('file', {
                uri: fileAsset.uri,
                name: fileAsset.name || `bill-${Date.now()}.pdf`,
                type: fileAsset.mimeType || 'application/octet-stream',
            } as any);
            const upload = await api.post('/upload', data, { headers: { 'Content-Type': 'multipart/form-data' } });
            await api.post('/vendor-bills', {
                ...form,
                documentUrl: upload.data.filePath || upload.data.url,
            });
            setForm(emptyForm);
            setFileAsset(null);
            setFileName('');
            await load();
            Alert.alert('Submitted', 'Your audited bill is ready for review.');
        } catch (error: any) {
            Alert.alert('Submission failed', error.response?.data?.message || 'Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const updateStatus = async (bill: any, status: string) => {
        try {
            await api.put(`/vendor-bills/${bill._id}/status`, { status, auditNotes: bill.auditNotes });
            await load();
        } catch (err: any) {
            Alert.alert('Update failed', err.response?.data?.message || 'Could not update status');
        }
    };

    const openDoc = (path?: string) => {
        if (!path) return;
        const url = path.startsWith('http') ? path : `${getBaseUrl()}${path}`;
        Linking.openURL(url).catch(() => Alert.alert('Error', 'Could not open document.'));
    };

    const total = useMemo(() => bills.reduce((sum, b) => sum + (b.totalAmount || 0), 0), [bills]);

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#2563eb" />
            </View>
        );
    }

    return (
        <ScrollView contentContainerStyle={styles.page}>
            <Text style={styles.title}>{isVendor ? 'My Audited Bills' : 'Vendor Bill Review'}</Text>
            <Text style={styles.subtitle}>
                {isVendor
                    ? 'Submit invoices for products and services delivered.'
                    : 'Audit vendor submissions and track payment status.'}
            </Text>

            {!isVendor && (
                <View style={styles.statsRow}>
                    <DataBlock style={styles.statBox}>
                        <Text style={styles.statLabel}>Submitted value</Text>
                        <Text style={styles.statValue}>{money(total)}</Text>
                    </DataBlock>
                    <DataBlock style={styles.statBox}>
                        <Text style={styles.statLabel}>Invoices</Text>
                        <Text style={styles.statValue}>{bills.length}</Text>
                    </DataBlock>
                    <DataBlock style={styles.statBox}>
                        <Text style={styles.statLabel}>Approved / Paid</Text>
                        <Text style={styles.statValue}>{bills.filter(b => ['Approved', 'Paid'].includes(b.status)).length}</Text>
                    </DataBlock>
                </View>
            )}

            {isVendor && (
                <DataBlock>
                    <Text style={styles.cardTitle}>Submit audited bill</Text>
                    {[
                        ['Invoice number', 'invoiceNumber'],
                        ['Bill date (YYYY-MM-DD)', 'billDate'],
                        ['Product / service category', 'category'],
                        ['Subtotal', 'subtotal'],
                        ['Tax amount', 'taxAmount'],
                    ].map(([label, key]) => (
                        <TextInput
                            key={key}
                            style={styles.input}
                            placeholder={label}
                            placeholderTextColor="#94a3b8"
                            value={(form as any)[key]}
                            onChangeText={value => setForm({ ...form, [key]: value })}
                            keyboardType={key.includes('total') || key.includes('tax') || key.includes('Amount') ? 'decimal-pad' : 'default'}
                        />
                    ))}
                    <TextInput
                        style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
                        placeholder="Description"
                        placeholderTextColor="#94a3b8"
                        multiline
                        value={form.description}
                        onChangeText={value => setForm({ ...form, description: value })}
                    />
                    <View style={styles.currencyRow}>
                        {['CAD', 'USD'].map(c => (
                            <TouchableOpacity
                                key={c}
                                style={[styles.currencyChip, form.currency === c && styles.currencyActive]}
                                onPress={() => setForm({ ...form, currency: c })}
                            >
                                <Text style={[styles.currencyText, form.currency === c && { color: 'white' }]}>{c}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                    <TouchableOpacity style={styles.fileBtn} onPress={pickFile}>
                        <Feather name="paperclip" size={16} color="#2563eb" />
                        <Text style={styles.fileBtnText}>{fileName || 'Attach PDF or image'}</Text>
                    </TouchableOpacity>
                    <IndustrialButton label={saving ? 'SUBMITTING…' : 'SUBMIT FOR AUDIT'} onPress={submit} loading={saving} style={{ marginTop: 8 }} />
                </DataBlock>
            )}

            <Text style={styles.section}>{isVendor ? 'MY SUBMISSIONS' : 'ALL BILLS'}</Text>
            {bills.map(b => (
                <DataBlock key={b._id}>
                    {!isVendor && (
                        <Text style={styles.vendorName}>{b.vendor?.companyName || b.vendor?.name || 'Vendor'}</Text>
                    )}
                    <View style={styles.row}>
                        <Text style={styles.invoice}>{b.invoiceNumber}</Text>
                        <WebBadge status={b.status} />
                    </View>
                    <Text style={styles.meta}>{b.category} · {b.billDate ? new Date(b.billDate).toLocaleDateString() : ''}</Text>
                    <Text style={styles.amount}>{money(b.totalAmount, b.currency)}</Text>
                    {b.documentUrl && (
                        <TouchableOpacity onPress={() => openDoc(b.documentUrl)} style={styles.docLink}>
                            <Feather name="external-link" size={14} color="#2563eb" />
                            <Text style={styles.docLinkText}>View bill</Text>
                        </TouchableOpacity>
                    )}
                    {!isVendor && (
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 10 }}>
                            {BILL_STATUSES.map(s => (
                                <TouchableOpacity
                                    key={s}
                                    style={[styles.statusChip, b.status === s && styles.statusActive]}
                                    onPress={() => updateStatus(b, s)}
                                >
                                    <Text style={[styles.statusText, b.status === s && { color: 'white' }]}>{s}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    )}
                </DataBlock>
            ))}
            {!bills.length && (
                <DataBlock style={{ alignItems: 'center', padding: 40 }}>
                    <Feather name="file-text" size={28} color="#cbd5e1" />
                    <Text style={styles.empty}>No vendor bills submitted</Text>
                </DataBlock>
            )}

            {!isVendor && summary?.byVendor?.length > 0 && (
                <DataBlock>
                    <Text style={styles.cardTitle}>Totals by vendor</Text>
                    {summary.byVendor.map((v: any) => (
                        <View key={v.vendorId} style={styles.summaryRow}>
                            <Text style={styles.summaryName}>
                                {v.companyName || v.contactName}
                                <Text style={styles.meta}> ({v.count} invoices)</Text>
                            </Text>
                            <Text style={styles.summaryTotal}>{money(v.total)}</Text>
                        </View>
                    ))}
                </DataBlock>
            )}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    page: { padding: 20, gap: 12, paddingBottom: 60 },
    title: { fontSize: 28, fontWeight: '900', color: '#0f172a' },
    subtitle: { color: '#64748b', marginBottom: 8, fontWeight: '600' },
    statsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    statBox: { width: '48%', marginBottom: 0 },
    statLabel: { fontSize: 10, fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase' },
    statValue: { fontSize: 20, fontWeight: '900', color: '#0f172a', marginTop: 4 },
    cardTitle: { fontSize: 15, fontWeight: '900', color: '#0f172a', marginBottom: 12 },
    input: {
        borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 10, padding: 12,
        backgroundColor: '#f8fafc', marginBottom: 10, fontSize: 14, fontWeight: '600', color: '#0f172a'
    },
    currencyRow: { flexDirection: 'row', gap: 8, marginBottom: 10 },
    currencyChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, backgroundColor: '#f1f5f9' },
    currencyActive: { backgroundColor: '#0f172a' },
    currencyText: { fontSize: 12, fontWeight: '800', color: '#64748b' },
    fileBtn: {
        flexDirection: 'row', alignItems: 'center', gap: 8, padding: 14,
        borderWidth: 1, borderColor: '#bfdbfe', borderRadius: 10, backgroundColor: '#eff6ff', marginBottom: 8
    },
    fileBtnText: { fontSize: 13, fontWeight: '700', color: '#2563eb' },
    section: { marginTop: 8, fontSize: 10, fontWeight: '900', color: '#94a3b8', letterSpacing: 2 },
    row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    vendorName: { fontSize: 12, fontWeight: '800', color: '#64748b', marginBottom: 6, textTransform: 'uppercase' },
    invoice: { fontWeight: '900', color: '#0f172a', fontSize: 15 },
    meta: { color: '#64748b', marginTop: 4, fontWeight: '600', fontSize: 12 },
    amount: { fontSize: 18, fontWeight: '900', color: '#0f172a', marginTop: 8 },
    docLink: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10 },
    docLinkText: { color: '#2563eb', fontWeight: '700', fontSize: 12 },
    statusChip: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, backgroundColor: '#f1f5f9', marginRight: 6 },
    statusActive: { backgroundColor: '#0f172a' },
    statusText: { fontSize: 10, fontWeight: '800', color: '#64748b' },
    empty: { fontSize: 11, fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', marginTop: 12 },
    summaryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
    summaryName: { fontSize: 13, fontWeight: '700', color: '#0f172a', flex: 1 },
    summaryTotal: { fontSize: 13, fontWeight: '900', color: '#0f172a' },
});

export default VendorBills;
