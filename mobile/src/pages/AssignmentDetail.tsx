import React, { useEffect, useState } from 'react';
import { Feather } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert, StatusBar, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../services/api';
import { DataBlock } from '../components/Theme';

interface AssignmentDetailProps {
    assignmentId: string;
    onBack: () => void;
}

const AssignmentDetail = ({ assignmentId, onBack }: AssignmentDetailProps) => {
    const [assignment, setAssignment] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState<string | null>(null);

    const fetchDetail = async () => {
        try {
            setLoading(true);
            const res = await api.get(`/assignments/${assignmentId}`);
            setAssignment(res.data);
        } catch (error) {
            Alert.alert('System Error', 'Failed to synchronize with deployment server.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDetail();
    }, [assignmentId]);

    const handleTaskComplete = async (task: any) => {
        if (task.type === 'document') {
            try {
                const result = await DocumentPicker.getDocumentAsync({});
                if (!result.canceled && result.assets && result.assets.length > 0) {
                    const asset = result.assets[0];
                    setUpdating(task._id);
                    
                    const formData = new FormData();
                    formData.append('file', {
                        uri: asset.uri,
                        name: asset.name,
                        type: asset.mimeType || 'application/octet-stream'
                    } as any);

                    try {
                        const uploadRes = await api.post('/upload', formData, {
                            headers: { 'Content-Type': 'multipart/form-data' }
                        });
                        
                        // Send PUT request to complete task with documentUrl
                        await api.put(`/assignments/${assignmentId}/tasks/${task._id}`, {
                            status: 'completed',
                            documentUrl: uploadRes.data.filePath || uploadRes.data.url
                        });
                        
                        setAssignment((prev: any) => {
                            const newTasks = prev.tasks.map((t: any) => 
                                t._id === task._id ? { ...t, status: 'completed', documentUrl: uploadRes.data.filePath } : t
                            );
                            return { ...prev, tasks: newTasks };
                        });
                    } catch (uploadError) {
                        Alert.alert('Upload Error', 'Failed to upload document to server.');
                    } finally {
                        setUpdating(null);
                    }
                }
            } catch (err) {
                Alert.alert('Picker Error', 'Error selecting file.');
            }
        } else {
            completeTask(task._id);
        }
    };

    const completeTask = async (taskId: string) => {
        try {
            setUpdating(taskId);
            await api.put(`/assignments/${assignmentId}/tasks/${taskId}`, {
                status: 'completed'
            });
            
            setAssignment((prev: any) => {
                const newTasks = prev.tasks.map((t: any) => 
                    t._id === taskId ? { ...t, status: 'completed' } : t
                );
                return { ...prev, tasks: newTasks };
            });
        } catch (error) {
            Alert.alert('Authorization Error', 'Verification of task completion failed.');
        } finally {
            setUpdating(null);
        }
    };

    if (loading) {
        return (
            <View style={[styles.container, { alignItems: 'center', justifyContent: 'center' }]}>
                <ActivityIndicator size="large" color="#3b82f6" />
            </View>
        );
    }

    if (!assignment) {
        return (
            <View style={[styles.container, { alignItems: 'center', justifyContent: 'center', padding: 32 }]}>
                <Feather name="alert-triangle" size={48} color="#94a3b8" style={{ marginBottom: 16 }} />
                <Text style={styles.errorTitle}>Signal Lost</Text>
                <Text style={styles.errorDesc}>The requested deployment record could not be located in the central database.</Text>
                <TouchableOpacity onPress={onBack} style={styles.backBtnLarge}>
                    <Text style={styles.backBtnText}>Return to Dashboard</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const completedTasks = assignment.tasks.filter((t: any) => t.status === 'completed').length;
    const progress = (completedTasks / assignment.tasks.length) * 100;

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />
            <View style={styles.header}>
                <TouchableOpacity onPress={onBack} style={styles.backBtn}>
                    <Feather name="arrow-left" size={18} color="#1e293b" />
                </TouchableOpacity>
                <View>
                    <Text style={styles.headerSub}>Protocol View</Text>
                    <Text style={styles.headerTitle}>Assignment Detail</Text>
                </View>
            </View>

            <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
                <View style={{ marginBottom: 32 }}>
                    <Text style={styles.workflowName}>{assignment.workflow.name}</Text>
                    <Text style={styles.workflowDesc}>{assignment.workflow.description}</Text>
                </View>

                <DataBlock style={{ borderLeftWidth: 4, borderLeftColor: '#3b82f6', marginBottom: 32 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                        <Text style={styles.syncLabel}>Synchronization</Text>
                        <Text style={styles.syncValue}>{Math.round(progress)}%</Text>
                    </View>
                    <View style={styles.barBg}>
                        <View style={[styles.barFill, { width: `${progress}%` }]} />
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', mt: 16, marginTop: 12 }}>
                        <Feather name="cpu" size={12} color="#94a3b8" style={{ marginRight: 6 }} />
                        <Text style={styles.segmentsText}>
                            {completedTasks} / {assignment.tasks.length} Segments Finalized
                        </Text>
                    </View>
                </DataBlock>

                <Text style={styles.checklistTitle}>Execution Checklist</Text>
                
                {assignment.tasks.map((task: any, idx: number) => {
                    const isCompleted = task.status === 'completed';
                    const isUpdating = updating === task._id;

                    return (
                        <TouchableOpacity 
                            key={task._id} 
                            activeOpacity={0.8}
                            onPress={() => !isCompleted && handleTaskComplete(task)}
                            disabled={isCompleted || isUpdating}
                            style={{ marginBottom: 16 }}
                        >
                            <DataBlock style={[styles.taskCard, isCompleted && { opacity: 0.6, backgroundColor: '#f8fafc' }]}>
                                <View style={[styles.taskIconBox, isCompleted ? { backgroundColor: '#ecfdf5', borderColor: '#ecfdf5' } : undefined]}>
                                    {isCompleted ? (
                                        <Feather name="check" size={16} color="#10b981" />
                                    ) : (
                                        <Text style={styles.taskIdx}>{idx + 1}</Text>
                                    )}
                                </View>
                                <View style={{ flex: 1, marginRight: 16 }}>
                                    <Text style={[styles.taskName, isCompleted && { color: '#94a3b8', textDecorationLine: 'line-through' }]}>
                                        {task.name}
                                    </Text>
                                    <Text style={styles.taskType}>
                                        {task.type === 'document' ? 'File Verification' : 'Binary State Check'}
                                    </Text>
                                </View>

                                {isUpdating ? (
                                    <ActivityIndicator size="small" color="#3b82f6" />
                                ) : !isCompleted && (
                                    <Feather name="chevron-right" size={16} color="#cbd5e1" />
                                )}
                            </DataBlock>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    errorTitle: { fontSize: 24, fontWeight: '800', color: '#0f172a', marginBottom: 8 },
    errorDesc: { color: '#64748b', textAlign: 'center', marginBottom: 32, lineHeight: 22 },
    backBtnLarge: { backgroundColor: '#0f172a', paddingHorizontal: 24, paddingVertical: 14, borderRadius: 12 },
    backBtnText: { color: 'white', fontWeight: '800', fontSize: 13, textTransform: 'uppercase' },
    header: { padding: 20, backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#f1f5f9', flexDirection: 'row', alignItems: 'center' },
    backBtn: { width: 40, height: 40, backgroundColor: '#f8fafc', borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 16 },
    headerSub: { fontSize: 10, fontWeight: '900', color: '#3b82f6', textTransform: 'uppercase', letterSpacing: 2 },
    headerTitle: { fontSize: 18, fontWeight: '800', color: '#0f172a' },
    workflowName: { fontSize: 28, fontWeight: '800', color: '#0f172a', letterSpacing: -1, marginBottom: 8 },
    workflowDesc: { fontSize: 13, color: '#64748b', lineHeight: 20 },
    syncLabel: { fontSize: 10, fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1.5 },
    syncValue: { fontSize: 14, fontWeight: '900', color: '#3b82f6' },
    barBg: { height: 8, backgroundColor: '#f1f5f9', borderRadius: 4, overflow: 'hidden' },
    barFill: { height: '100%', backgroundColor: '#3b82f6', borderRadius: 4 },
    segmentsText: { fontSize: 10, fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase' },
    checklistTitle: { fontSize: 10, fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 16 },
    taskCard: { flexDirection: 'row', alignItems: 'center', padding: 16 },
    taskIconBox: { width: 40, height: 40, borderRadius: 12, backgroundColor: 'white', borderWidth: 1, borderColor: '#f1f5f9', alignItems: 'center', justifyContent: 'center', marginRight: 16 },
    taskIdx: { fontSize: 12, fontWeight: '900', color: '#64748b' },
    taskName: { fontSize: 14, fontWeight: '800', color: '#0f172a' },
    taskType: { fontSize: 10, fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', marginTop: 4 }
});

export default AssignmentDetail;
