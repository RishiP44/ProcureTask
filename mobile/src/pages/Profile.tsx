import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert, ActivityIndicator, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as DocumentPicker from 'expo-document-picker';
import { DataBlock, WebSectionHeader } from '../components/Theme';
import { useAuth } from '../context/AuthContext';
import { Feather } from '@expo/vector-icons';
import api from '../services/api';

const Profile = () => {
    const { user, logout } = useAuth();
    const [editMode, setEditMode] = useState(false);
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [saving, setSaving] = useState(false);
    const [avatar, setAvatar] = useState('');
    const [uploadingPhoto, setUploadingPhoto] = useState(false);

    useEffect(() => {
        if (user) {
            setName(user.name || '');
            setPhone(user.phone || '');
            // Let's fetch the latest profile details from backend
            api.get('/auth/me')
                .then(res => {
                    setName(res.data.name || '');
                    setPhone(res.data.phone || '');
                    setAvatar(res.data.avatar || '');
                })
                .catch(err => console.log('Error fetching user info:', err));
        }
    }, [user]);

    const handleSave = async () => {
        if (!name.trim()) {
            Alert.alert('Validation Error', 'Name cannot be empty.');
            return;
        }

        try {
            setSaving(true);
            const res = await api.put(`/users/${user?._id}`, {
                name,
                phone,
            });

            // Update user in local storage/context if needed
            const stored = await AsyncStorage.getItem('user');
            if (stored) {
                const parsed = JSON.parse(stored);
                parsed.name = res.data.name;
                parsed.phone = res.data.phone;
                await AsyncStorage.setItem('user', JSON.stringify(parsed));
            }

            Alert.alert('Success', 'Profile updated successfully.');
            setEditMode(false);
        } catch (error: any) {
            Alert.alert('Error', error.response?.data?.message || 'Failed to update profile.');
        } finally {
            setSaving(false);
        }
    };

    const choosePhoto = async () => {
        const result = await DocumentPicker.getDocumentAsync({ type: 'image/*', copyToCacheDirectory: true });
        if (result.canceled || !result.assets[0]) return;
        const asset = result.assets[0];
        setUploadingPhoto(true);
        try {
            const data = new FormData();
            data.append('file', {
                uri: asset.uri,
                name: asset.name || `profile-${Date.now()}.jpg`,
                type: asset.mimeType || 'image/jpeg'
            } as any);
            const upload = await api.post('/upload', data, { headers: { 'Content-Type': 'multipart/form-data' } });
            const updated = await api.put(`/users/${user?._id}`, { name, phone, avatar: upload.data.filePath });
            setAvatar(updated.data.avatar || '');
            const stored = await AsyncStorage.getItem('user');
            if (stored) {
                const parsed = JSON.parse(stored);
                parsed.avatar = updated.data.avatar;
                await AsyncStorage.setItem('user', JSON.stringify(parsed));
            }
            Alert.alert('Photo updated', 'Your profile photo has been saved.');
        } catch (error: any) {
            Alert.alert('Upload failed', error.response?.data?.message || 'Could not upload the photo.');
        } finally {
            setUploadingPhoto(false);
        }
    };

    return (
        <View style={styles.container}>
            <WebSectionHeader title="My Profile" />
            <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
                <DataBlock style={styles.content}>
                    <TouchableOpacity style={styles.avatar} onPress={choosePhoto} disabled={uploadingPhoto}>
                        {avatar ? <Image source={{ uri: `${String(api.defaults.baseURL || '').replace(/\/api\/?$/, '')}${avatar}` }} style={styles.avatarImage} /> : <Text style={styles.avatarText}>{(name || 'U').charAt(0).toUpperCase()}</Text>}
                        <View style={styles.cameraBadge}>{uploadingPhoto ? <ActivityIndicator size="small" color="#0f172a" /> : <Feather name="camera" size={14} color="#0f172a" />}</View>
                    </TouchableOpacity>

                    {editMode ? (
                        <TextInput 
                            style={styles.nameInput}
                            value={name}
                            onChangeText={setName}
                            placeholder="Full Name"
                        />
                    ) : (
                        <Text style={styles.name}>{name}</Text>
                    )}
                    <Text style={styles.email}>{user?.email}</Text>
                    <Text style={styles.role}>{user?.role}</Text>

                    <View style={styles.infoBox}>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Account ID</Text>
                            <Text style={styles.infoValue}>{user?._id || 'SYS-UNDEF'}</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Role</Text>
                            <Text style={styles.infoValue}>{user?.role}</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Phone</Text>
                            {editMode ? (
                                <TextInput 
                                    style={styles.inlineInput} 
                                    value={phone} 
                                    onChangeText={setPhone} 
                                    placeholder="+1234567890" 
                                    keyboardType="phone-pad"
                                />
                            ) : (
                                <Text style={styles.infoValue}>{phone || 'Not added'}</Text>
                            )}
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Department</Text>
                            <Text style={styles.infoValue}>{user?.department || 'General Operations'}</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Status</Text>
                            <Text style={[styles.infoValue, { color: '#10b981' }]}>ACTIVE</Text>
                        </View>
                    </View>

                    <View style={{ width: '100%', gap: 12 }}>
                        {editMode ? (
                            <View style={{ flexDirection: 'row', gap: 12 }}>
                                <TouchableOpacity style={[styles.actionBtn, styles.cancelBtn]} onPress={() => { setEditMode(false); setName(user?.name || ''); setPhone(user?.phone || ''); }}>
                                    <Text style={styles.cancelBtnText}>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={[styles.actionBtn, styles.saveBtn]} onPress={handleSave} disabled={saving}>
                                    {saving ? <ActivityIndicator size="small" color="white" /> : (
                                        <>
                                            <Feather name="check" size={16} color="white" style={{ marginRight: 6 }} />
                                            <Text style={styles.actionBtnText}>Save</Text>
                                        </>
                                    )}
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <TouchableOpacity style={[styles.actionBtn, styles.editBtn]} onPress={() => setEditMode(true)}>
                                <Feather name="edit-2" size={16} color="white" style={{ marginRight: 8 }} />
                                <Text style={styles.actionBtnText}>Edit Profile</Text>
                            </TouchableOpacity>
                        )}

                        <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
                            <Feather name="log-out" size={16} color="white" style={{ marginRight: 8 }} />
                            <Text style={styles.logoutText}>Logout</Text>
                        </TouchableOpacity>
                    </View>
                </DataBlock>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    content: { padding: 30, alignItems: 'center' },
    avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#0f172a', alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
    avatarImage: { width: 80, height: 80, borderRadius: 40 },
    cameraBadge: { position: 'absolute', right: -3, bottom: -3, width: 28, height: 28, borderRadius: 14, backgroundColor: 'white', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#e2e8f0' },
    avatarText: { fontSize: 32, fontWeight: '900', color: 'white' },
    name: { fontSize: 24, fontWeight: '800', color: '#0f172a', marginBottom: 4 },
    nameInput: { fontSize: 20, fontWeight: '800', color: '#0f172a', borderBottomWidth: 1, borderBottomColor: '#cbd5e1', width: '80%', textAlign: 'center', marginBottom: 4, paddingVertical: 4 },
    email: { fontSize: 13, fontWeight: '700', color: '#64748b', marginBottom: 6 },
    role: { fontSize: 10, fontWeight: '900', color: '#3b82f6', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 32 },
    infoBox: { width: '100%', backgroundColor: '#f8fafc', borderRadius: 12, borderWidth: 1, borderColor: '#f1f5f9', padding: 16, marginBottom: 32 },
    infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
    infoLabel: { fontSize: 11, fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1 },
    infoValue: { fontSize: 12, fontWeight: '800', color: '#0f172a' },
    inlineInput: { fontSize: 12, fontWeight: '800', color: '#0f172a', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4, backgroundColor: 'white', minWidth: 130, textAlign: 'right' },
    actionBtn: { flexDirection: 'row', flex: 1, justifyContent: 'center', paddingVertical: 16, borderRadius: 12, alignItems: 'center' },
    editBtn: { backgroundColor: '#2563eb' },
    saveBtn: { backgroundColor: '#059669' },
    cancelBtn: { backgroundColor: '#64748b' },
    actionBtnText: { color: 'white', fontWeight: '800', fontSize: 12, letterSpacing: 1, textTransform: 'uppercase' },
    cancelBtnText: { color: 'white', fontWeight: '800', fontSize: 12, letterSpacing: 1, textTransform: 'uppercase' },
    logoutBtn: { flexDirection: 'row', width: '100%', justifyContent: 'center', backgroundColor: '#ef4444', paddingHorizontal: 20, paddingVertical: 16, borderRadius: 12, alignItems: 'center' },
    logoutText: { color: 'white', fontWeight: '800', fontSize: 12, letterSpacing: 1, textTransform: 'uppercase' }
});

export default Profile;
