import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator, Alert, Modal, FlatList } from 'react-native';
import { Feather } from '@expo/vector-icons';
import api from '../services/api';
import { DataBlock, WebSectionHeader, IndustrialButton } from '../components/Theme';

const categoryLabels: Record<string, string> = {
    assignment_alert: 'Assignment Alert',
    overdue_reminder: 'Overdue Reminder',
    missing_document: 'Missing Document',
    task_completed: 'Task Completed',
};

const Alerts = () => {
    const [assignments, setAssignments] = useState<any[]>([]);
    const [logs, setLogs] = useState<any[]>([]);
    const [selectedAssignment, setSelectedAssignment] = useState<any>(null);
    const [selectedScenario, setSelectedScenario] = useState('assignment_alert');
    const [logSearch, setLogSearch] = useState('');
    const [logFilter, setLogFilter] = useState('all');
    const [loading, setLoading] = useState(true);
    const [runningScan, setRunningScan] = useState(false);
    const [triggering, setTriggering] = useState(false);
    const [scanSummary, setScanSummary] = useState<any>(null);
    const [showAssignPicker, setShowAssignPicker] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [assignmentsRes, logsRes] = await Promise.all([
                api.get('/assignments'),
                api.get('/notifications/logs'),
            ]);
            setAssignments(Array.isArray(assignmentsRes.data) ? assignmentsRes.data : []);
            setLogs(Array.isArray(logsRes.data) ? logsRes.data : []);
            if (assignmentsRes.data?.length > 0 && !selectedAssignment) {
                setSelectedAssignment(assignmentsRes.data[0]);
            }
        } catch {
            Alert.alert('Error', 'Failed to load alerts control panel.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const handleRunScan = async () => {
        setRunningScan(true);
        setScanSummary(null);
        try {
            const res = await api.post('/notifications/run-reminders');
            setScanSummary(res.data.summary);
            Alert.alert('Scan complete', 'Reminder system scan finished.');
            fetchData();
        } catch (err: any) {
            Alert.alert('Scan failed', err.response?.data?.message || 'Failed to run scan');
        } finally {
            setRunningScan(false);
        }
    };

    const handleTriggerScenario = async () => {
        if (!selectedAssignment) {
            return Alert.alert('Select assignment', 'Please pick a target assignment first.');
        }
        setTriggering(true);
        try {
            await api.post('/notifications/test-scenario', {
                scenarioType: selectedScenario,
                assignmentId: selectedAssignment._id,
            });
            Alert.alert('Triggered', 'Test scenario notification sent.');
            fetchData();
        } catch (err: any) {
            Alert.alert('Failed', err.response?.data?.message || 'Could not trigger scenario');
        } finally {
            setTriggering(false);
        }
    };

    const filteredLogs = logs.filter(log => {
        const matchesSearch =
            (log.user?.name || '').toLowerCase().includes(logSearch.toLowerCase()) ||
            (log.user?.email || '').toLowerCase().includes(logSearch.toLowerCase()) ||
            (log.title || '').toLowerCase().includes(logSearch.toLowerCase()) ||
            (log.message || '').toLowerCase().includes(logSearch.toLowerCase());
        const matchesFilter = logFilter === 'all' || log.category === logFilter;
        return matchesSearch && matchesFilter;
    });

    if (loading && logs.length === 0) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color="#2563eb" />
            </View>
        );
    }

    return (
        <ScrollView style={styles.container} contentContainerStyle={{ padding: 20, paddingBottom: 60 }}>
            <View style={styles.headerRow}>
                <View style={{ flex: 1 }}>
                    <Text style={styles.title}>Alerts & Reminders</Text>
                    <Text style={styles.subtitle}>Run scans, test scenarios, and audit delivery logs</Text>
                </View>
                <TouchableOpacity style={styles.refreshBtn} onPress={fetchData}>
                    <Feather name="refresh-cw" size={16} color="#64748b" />
                </TouchableOpacity>
            </View>

            <DataBlock style={{ borderLeftWidth: 4, borderLeftColor: '#9333ea' }}>
                <Text style={styles.cardTitle}>Reminder Engine</Text>
                <Text style={styles.cardDesc}>
                    Scan all assignments for overdue dates and missing document uploads, then fire alerts.
                </Text>
                {scanSummary && (
                    <View style={styles.summaryBox}>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Checked</Text>
                            <Text style={styles.summaryValue}>{scanSummary.checkedAssignments}</Text>
                        </View>
                        <View style={styles.summaryRow}>
                            <Text style={[styles.summaryLabel, { color: '#e11d48' }]}>Overdue sent</Text>
                            <Text style={[styles.summaryValue, { color: '#e11d48' }]}>{scanSummary.overdueRemindersSent}</Text>
                        </View>
                        <View style={styles.summaryRow}>
                            <Text style={[styles.summaryLabel, { color: '#d97706' }]}>Missing docs</Text>
                            <Text style={[styles.summaryValue, { color: '#d97706' }]}>{scanSummary.missingDocumentsSent}</Text>
                        </View>
                    </View>
                )}
                <IndustrialButton
                    label={runningScan ? 'SCANNING…' : 'RUN REMINDER SCAN'}
                    onPress={handleRunScan}
                    loading={runningScan}
                    icon="play"
                    style={{ backgroundColor: '#9333ea', marginTop: 12 }}
                />
            </DataBlock>

            <DataBlock style={{ borderLeftWidth: 4, borderLeftColor: '#2563eb' }}>
                <Text style={styles.cardTitle}>Scenario Sandbox</Text>
                <Text style={styles.cardDesc}>
                    Test individual alerts immediately (bypasses 24-hour throttle).
                </Text>

                <Text style={styles.inputLabel}>Target Assignment</Text>
                <TouchableOpacity style={styles.selectBtn} onPress={() => setShowAssignPicker(true)}>
                    <Text style={[styles.selectText, !selectedAssignment && { color: '#94a3b8' }]} numberOfLines={1}>
                        {selectedAssignment
                            ? `${selectedAssignment.workflow?.name} → ${selectedAssignment.user?.name}`
                            : 'Select assignment...'}
                    </Text>
                    <Feather name="chevron-down" size={16} color="#94a3b8" />
                </TouchableOpacity>

                <Text style={[styles.inputLabel, { marginTop: 12 }]}>Scenario Type</Text>
                <View style={styles.chipRow}>
                    {Object.entries(categoryLabels).map(([key, label]) => (
                        <TouchableOpacity
                            key={key}
                            style={[styles.chip, selectedScenario === key && styles.chipActive]}
                            onPress={() => setSelectedScenario(key)}
                        >
                            <Text style={[styles.chipText, selectedScenario === key && styles.chipTextActive]}>{label}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <IndustrialButton
                    label={triggering ? 'SENDING…' : 'TRIGGER TEST ALERT'}
                    onPress={handleTriggerScenario}
                    loading={triggering}
                    icon="send"
                    style={{ marginTop: 12 }}
                />
            </DataBlock>

            <WebSectionHeader title="Delivery Logs" count={filteredLogs.length} />

            <View style={styles.searchContainer}>
                <Feather name="search" size={16} color="#94a3b8" />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search logs..."
                    value={logSearch}
                    onChangeText={setLogSearch}
                    placeholderTextColor="#94a3b8"
                />
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
                {['all', ...Object.keys(categoryLabels)].map(f => (
                    <TouchableOpacity
                        key={f}
                        style={[styles.chip, logFilter === f && styles.chipActive, { marginRight: 8 }]}
                        onPress={() => setLogFilter(f)}
                    >
                        <Text style={[styles.chipText, logFilter === f && styles.chipTextActive]}>
                            {f === 'all' ? 'All' : categoryLabels[f] || f}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {filteredLogs.length === 0 ? (
                <DataBlock style={{ alignItems: 'center', padding: 32 }}>
                    <Feather name="inbox" size={28} color="#cbd5e1" />
                    <Text style={styles.empty}>No delivery logs</Text>
                </DataBlock>
            ) : (
                filteredLogs.map(log => (
                    <DataBlock key={log._id}>
                        <View style={styles.logTop}>
                            <Text style={styles.logTitle}>{log.title}</Text>
                            <View style={styles.catBadge}>
                                <Text style={styles.catText}>{categoryLabels[log.category] || log.category}</Text>
                            </View>
                        </View>
                        <Text style={styles.logMsg}>{log.message}</Text>
                        <Text style={styles.logMeta}>
                            {log.user?.name || 'System'} · {log.createdAt ? new Date(log.createdAt).toLocaleString() : ''}
                        </Text>
                    </DataBlock>
                ))
            )}

            <Modal visible={showAssignPicker} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Select Assignment</Text>
                            <TouchableOpacity onPress={() => setShowAssignPicker(false)} style={styles.closeBtn}>
                                <Feather name="x" size={20} color="#64748b" />
                            </TouchableOpacity>
                        </View>
                        <FlatList
                            data={assignments}
                            keyExtractor={item => item._id}
                            contentContainerStyle={{ padding: 20 }}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={styles.listItem}
                                    onPress={() => {
                                        setSelectedAssignment(item);
                                        setShowAssignPicker(false);
                                    }}
                                >
                                    <Text style={styles.listName}>{item.workflow?.name}</Text>
                                    <Text style={styles.listMeta}>{item.user?.name} · {item.status}</Text>
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                </View>
            </Modal>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    headerRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 20 },
    title: { fontSize: 26, fontWeight: '800', color: '#0f172a', letterSpacing: -1 },
    subtitle: { fontSize: 13, color: '#64748b', fontWeight: '600', marginTop: 4 },
    refreshBtn: {
        width: 40, height: 40, backgroundColor: 'white', borderWidth: 1, borderColor: '#e2e8f0',
        borderRadius: 8, alignItems: 'center', justifyContent: 'center'
    },
    cardTitle: { fontSize: 13, fontWeight: '900', color: '#0f172a', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 },
    cardDesc: { fontSize: 12, color: '#64748b', lineHeight: 18, marginBottom: 8 },
    summaryBox: { backgroundColor: '#faf5ff', borderRadius: 10, padding: 12, marginTop: 8 },
    summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
    summaryLabel: { fontSize: 11, fontWeight: '700', color: '#6b21a8' },
    summaryValue: { fontSize: 11, fontWeight: '900', color: '#6b21a8' },
    inputLabel: { fontSize: 10, fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 6, marginTop: 4 },
    selectBtn: {
        backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 10,
        height: 48, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'
    },
    selectText: { flex: 1, fontSize: 13, fontWeight: '700', color: '#0f172a', marginRight: 8 },
    chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    chip: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 14, backgroundColor: '#f1f5f9', marginBottom: 4 },
    chipActive: { backgroundColor: '#0f172a' },
    chipText: { fontSize: 10, fontWeight: '700', color: '#64748b' },
    chipTextActive: { color: 'white' },
    searchContainer: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
        borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 4, paddingHorizontal: 12, height: 44, marginBottom: 12
    },
    searchInput: { flex: 1, marginLeft: 10, fontSize: 14, color: '#0f172a' },
    logTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 },
    logTitle: { flex: 1, fontSize: 13, fontWeight: '800', color: '#0f172a', marginRight: 8 },
    catBadge: { backgroundColor: '#eff6ff', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4 },
    catText: { fontSize: 9, fontWeight: '800', color: '#2563eb', textTransform: 'uppercase' },
    logMsg: { fontSize: 12, color: '#64748b', lineHeight: 18 },
    logMeta: { fontSize: 10, fontWeight: '700', color: '#94a3b8', marginTop: 8, textTransform: 'uppercase' },
    empty: { fontSize: 11, fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', marginTop: 12 },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.4)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: 'white', borderTopLeftRadius: 28, borderTopRightRadius: 28, height: '70%' },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 24, paddingBottom: 8 },
    modalTitle: { fontSize: 18, fontWeight: '800', color: '#0f172a' },
    closeBtn: { width: 40, height: 40, backgroundColor: '#f1f5f9', borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
    listItem: { padding: 16, backgroundColor: '#f8fafc', borderRadius: 12, marginBottom: 10 },
    listName: { fontSize: 14, fontWeight: '800', color: '#0f172a' },
    listMeta: { fontSize: 11, color: '#64748b', marginTop: 4, fontWeight: '600' },
});

export default Alerts;
