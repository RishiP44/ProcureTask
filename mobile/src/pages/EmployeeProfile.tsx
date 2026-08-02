import React, { useEffect, useState } from 'react';
import { Feather } from '@expo/vector-icons';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert, StyleSheet, StatusBar, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../services/api';
import { DataBlock, WebBadge, WebSectionHeader } from '../components/Theme';

const BILL_STATUSES = ['Submitted', 'Under Review', 'Approved', 'Rejected', 'Paid'];

const getBaseUrl = () => String(api.defaults.baseURL || '').replace(/\/api\/?$/, '');

interface EmployeeProfileProps {
    employeeId: string;
    onBack: () => void;
    onSelectAssignment: (id: string) => void;
}

const EmployeeProfile: React.FC<EmployeeProfileProps> = ({ employeeId, onBack, onSelectAssignment }) => {
    const [employee, setEmployee] = useState<any>(null);
    const [assignments, setAssignments] = useState<any[]>([]);
    const [documents, setDocuments] = useState<any[]>([]);
    const [bills, setBills] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const loadData = async () => {
        if (!employeeId) return;
        try {
            setLoading(true);
            const empRes = await api.get(`/users/${employeeId}`);
            const emp = empRes.data;
            setEmployee(emp);

            const assignRes = await api.get(`/assignments?userId=${employeeId}`).catch(() => ({ data: [] }));
            setAssignments(Array.isArray(assignRes.data) ? assignRes.data : []);

            if (emp.role === 'Vendor') {
                const billRes = await api.get('/vendor-bills', { params: { vendorId: employeeId } }).catch(() => ({ data: [] }));
                setBills(Array.isArray(billRes.data) ? billRes.data : []);
                setDocuments([]);
            } else {
                const documentRes = await api.get('/documents', { params: { userId: employeeId } }).catch(() => ({ data: [] }));
                setDocuments(Array.isArray(documentRes.data) ? documentRes.data : []);
                setBills([]);
            }
        } catch (error) {
            console.error('Load employee error:', error);
            Alert.alert('Error', 'Failed to load profile.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadData(); }, [employeeId]);

    const updateBillStatus = async (billId: string, status: string) => {
        try {
            await api.put(`/vendor-bills/${billId}/status`, { status });
            Alert.alert('Updated', `Bill marked ${status}`);
            await loadData();
        } catch {
            Alert.alert('Error', 'Could not update bill status');
        }
    };

    const openUrl = (path?: string) => {
        if (!path) return;
        const url = path.startsWith('http') ? path : `${getBaseUrl()}${path}`;
        Linking.openURL(url).catch(() => Alert.alert('Error', 'Could not open document.'));
    };

    if (loading) {
        return (
            <View style={[styles.container, { alignItems: 'center', justifyContent: 'center' }]}>
                <ActivityIndicator size="large" color="#475569" />
                <Text style={{ fontSize: 10, color: '#cbd5e1', fontWeight: 'bold', marginTop: 16 }}>LOADING PROFILE...</Text>
            </View>
        );
    }

    if (!employee) return null;

    const isVendor = employee.role === 'Vendor';

    return (
        <SafeAreaView style={styles.container} edges={['bottom']}>
            <StatusBar barStyle="dark-content" />

            <View style={styles.header}>
                <TouchableOpacity onPress={onBack} style={styles.iconBtn}>
                    <Feather name="arrow-left" size={18} color="#1e293b" />
                </TouchableOpacity>
                <Text style={styles.headerText}>{isVendor ? 'Vendor Profile' : 'Employee Profile'}</Text>
                <View style={[styles.iconBtn, { opacity: 0 }]} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 24 }}>
                <View style={styles.identityBox}>
                    <View style={[styles.avatar, isVendor && { backgroundColor: '#d97706' }]}>
                        <Text style={styles.avatarText}>
                            {(employee.name || 'U').split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)}
                        </Text>
                    </View>
                    <Text style={styles.name}>{isVendor ? (employee.companyName || employee.name) : employee.name}</Text>
                    <Text style={styles.role}>{(employee.role || 'MEMBER').toUpperCase()}</Text>
                    {isVendor && employee.vendorType ? (
                        <Text style={styles.idText}>{employee.vendorType}</Text>
                    ) : (
                        <Text style={styles.idText}>{employee.position || employee.department || `ID: ${(employee._id || '').slice(-6).toUpperCase()}`}</Text>
                    )}
                    <Text style={[styles.idText, { marginTop: 4 }]}>{employee.email}</Text>
                    <View style={{ marginTop: 10 }}>
                        <WebBadge status={employee.status || 'Active'} />
                    </View>
                </View>

                {isVendor ? (
                    <>
                        <WebSectionHeader title="Submitted Bills" count={bills.length} />
                        {bills.length > 0 ? bills.map(bill => (
                            <DataBlock key={bill._id}>
                                <View style={styles.billTop}>
                                    <Text style={styles.billInvoice}>{bill.invoiceNumber}</Text>
                                    <Text style={styles.billAmount}>${Number(bill.totalAmount || 0).toFixed(2)} {bill.currency}</Text>
                                </View>
                                <Text style={styles.billMeta}>{bill.category} · {bill.billDate ? new Date(bill.billDate).toLocaleDateString() : ''}</Text>
                                <View style={styles.statusRow}>
                                    {BILL_STATUSES.map(s => (
                                        <TouchableOpacity
                                            key={s}
                                            style={[styles.statusChip, bill.status === s && styles.statusChipActive]}
                                            onPress={() => updateBillStatus(bill._id, s)}
                                        >
                                            <Text style={[styles.statusChipText, bill.status === s && styles.statusChipTextActive]}>{s}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                                {bill.documentUrl && (
                                    <TouchableOpacity onPress={() => openUrl(bill.documentUrl)} style={styles.docLink}>
                                        <Feather name="external-link" size={14} color="#2563eb" />
                                        <Text style={styles.docLinkText}>View bill document</Text>
                                    </TouchableOpacity>
                                )}
                            </DataBlock>
                        )) : (
                            <DataBlock style={{ alignItems: 'center', padding: 32 }}>
                                <Text style={styles.empty}>No bills submitted</Text>
                            </DataBlock>
                        )}
                    </>
                ) : (
                    <>
                        <WebSectionHeader title="Documents" count={documents.length} />
                        {documents.length > 0 ? documents.map((doc: any) => (
                            <TouchableOpacity key={doc._id || doc.url} onPress={() => openUrl(doc.url || doc.filePath || doc.path)}>
                                <DataBlock>
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        <View style={styles.docIcon}>
                                            <Feather name="file-text" size={16} color="#3b82f6" />
                                        </View>
                                        <View style={{ flex: 1 }}>
                                            <Text style={styles.docName}>{doc.fileName || doc.originalName || 'Document'}</Text>
                                            <Text style={styles.billMeta}>
                                                {doc.workflowName || doc.type || 'Document'}
                                                {doc.date || doc.createdAt ? ` · ${new Date(doc.date || doc.createdAt).toLocaleDateString()}` : ''}
                                            </Text>
                                        </View>
                                        <Feather name="external-link" size={14} color="#94a3b8" />
                                    </View>
                                </DataBlock>
                            </TouchableOpacity>
                        )) : (
                            <DataBlock style={{ alignItems: 'center', padding: 32 }}>
                                <Text style={styles.empty}>No documents uploaded</Text>
                            </DataBlock>
                        )}
                    </>
                )}

                <WebSectionHeader title="Active Workflows" count={assignments.length} />
                {assignments.length > 0 ? (
                    assignments.map((item) => {
                        const pct = Math.round(
                            ((item.tasks?.filter((t: any) => t.status === 'completed').length || 0) /
                                (item.tasks?.length || 1)) * 100
                        );
                        return (
                            <TouchableOpacity key={item._id} onPress={() => onSelectAssignment(item._id)} activeOpacity={0.7}>
                                <DataBlock>
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        <View style={{ flex: 1 }}>
                                            <Text style={{ fontSize: 14, fontWeight: '800', color: '#0f172a' }}>{item.workflow?.name}</Text>
                                            <Text style={{ fontSize: 10, color: '#64748b', marginTop: 4, fontWeight: '700', textTransform: 'uppercase' }}>
                                                {item.status?.replace('_', ' ')} · {pct}%
                                            </Text>
                                        </View>
                                        <WebBadge status={item.status} />
                                        <Feather name="chevron-right" size={16} color="#cbd5e1" style={{ marginLeft: 8 }} />
                                    </View>
                                </DataBlock>
                            </TouchableOpacity>
                        );
                    })
                ) : (
                    <DataBlock style={{ alignItems: 'center', padding: 40 }}>
                        <Feather name="layers" size={24} color="#cbd5e1" />
                        <Text style={[styles.empty, { marginTop: 16 }]}>Zero active operations</Text>
                    </DataBlock>
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    header: { paddingHorizontal: 20, paddingVertical: 14, backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#e2e8f0', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    iconBtn: { width: 36, height: 36, backgroundColor: '#f1f5f9', borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
    headerText: { fontSize: 10, fontWeight: '900', color: '#0f172a', textTransform: 'uppercase', letterSpacing: 2 },
    identityBox: { alignItems: 'center', marginBottom: 32 },
    avatar: { width: 96, height: 96, borderRadius: 48, backgroundColor: '#0f172a', alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
    avatarText: { fontSize: 36, fontWeight: '900', color: 'white', letterSpacing: 2 },
    name: { fontSize: 24, fontWeight: '800', color: '#0f172a', marginBottom: 8, textAlign: 'center' },
    role: { fontSize: 10, fontWeight: '800', color: '#3b82f6', letterSpacing: 2, marginBottom: 8 },
    idText: { fontSize: 11, fontWeight: '700', color: '#94a3b8' },
    empty: { fontSize: 10, fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase' },
    billTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
    billInvoice: { fontSize: 14, fontWeight: '800', color: '#0f172a' },
    billAmount: { fontSize: 14, fontWeight: '900', color: '#0f172a' },
    billMeta: { fontSize: 11, color: '#64748b', fontWeight: '600', marginBottom: 10 },
    statusRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
    statusChip: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, backgroundColor: '#f1f5f9' },
    statusChipActive: { backgroundColor: '#0f172a' },
    statusChipText: { fontSize: 9, fontWeight: '800', color: '#64748b' },
    statusChipTextActive: { color: 'white' },
    docLink: { flexDirection: 'row', alignItems: 'center', marginTop: 12, gap: 6 },
    docLinkText: { fontSize: 12, fontWeight: '700', color: '#2563eb' },
    docIcon: { width: 36, height: 36, borderRadius: 8, backgroundColor: '#eff6ff', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
    docName: { fontSize: 13, fontWeight: '700', color: '#0f172a' },
});

export default EmployeeProfile;
