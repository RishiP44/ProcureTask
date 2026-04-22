import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { IndustrialInput, IndustrialButton, DataBlock } from '../components/Theme';

const Login = () => {
    const [mode, setMode] = useState<'login' | 'signup'>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [role, setRole] = useState('Employee');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();

    const handleSubmit = async () => {
        if (!email || !password || (mode === 'signup' && !name)) {
            Alert.alert('Error', 'Missing required credentials.');
            return;
        }

        try {
            setLoading(true);
            if (mode === 'login') {
                await login(email, password);
            } else {
                await api.post('/auth/register', { name, email, password, role });
                await login(email, password);
            }
        } catch (err: any) {
            const msg = err.response?.data?.message || 'Authentication error.';
            Alert.alert('Error', msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView 
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 32, justifyContent: 'center' }}>
                    <View style={styles.brandContainer}>
                        <View style={styles.logoBox}>
                            <Text style={styles.logoText}>P</Text>
                        </View>
                        <Text style={styles.brand}>ProcureTrack</Text>
                        <Text style={styles.brandSubtitle}>SYSTEMS v2.4</Text>
                    </View>

                    <DataBlock style={{ padding: 24 }}>
                        <Text style={styles.formTitle}>{mode === 'login' ? 'System Authentication' : 'Corporate Account Registration'}</Text>
                        
                        {mode === 'signup' && (
                            <IndustrialInput 
                                label="Full Legal Name"
                                placeholder="Enter your full name"
                                value={name}
                                onChangeText={setName}
                            />
                        )}

                        <IndustrialInput 
                            label="Corporate Email Address"
                            placeholder="name@company.com"
                            value={email}
                            onChangeText={setEmail}
                            autoCapitalize="none"
                            keyboardType="email-address"
                        />

                        <IndustrialInput 
                            label="Access Token (Password)"
                            placeholder="Enter secure token"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                        />

                        <IndustrialButton 
                            label={loading ? 'Processing...' : (mode === 'login' ? 'Sign In' : 'Sign Up')}
                            onPress={handleSubmit}
                            loading={loading}
                            icon={mode === 'login' ? 'log-in' : 'user-plus'}
                            style={{ marginTop: 8 }}
                        />

                        <TouchableOpacity 
                            onPress={() => setMode(mode === 'login' ? 'signup' : 'login')}
                            style={styles.toggle}
                        >
                            <Text style={styles.toggleText}>
                                {mode === 'login' ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
                            </Text>
                        </TouchableOpacity>
                    </DataBlock>

                    <Text style={styles.legal}>© 2026 ProcureTask Inc. All rights reserved.</Text>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc'
    },
    brandContainer: {
        marginBottom: 40,
        alignItems: 'center'
    },
    logoBox: {
        width: 48,
        height: 48,
        backgroundColor: '#0f172a',
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16
    },
    logoText: {
        color: 'white',
        fontWeight: '900',
        fontStyle: 'italic',
        fontSize: 24
    },
    brand: {
        fontSize: 32,
        fontWeight: '800',
        color: '#0f172a',
        letterSpacing: -1
    },
    brandSubtitle: {
        fontSize: 10,
        color: '#3b82f6',
        marginTop: 4,
        fontWeight: '900',
        letterSpacing: 2
    },
    formTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#0f172a',
        marginBottom: 24
    },
    toggle: {
        marginTop: 20,
        alignItems: 'center'
    },
    toggleText: {
        fontSize: 14,
        color: '#2563eb',
        fontWeight: '500'
    },
    legal: {
        textAlign: 'center',
        color: '#94a3b8',
        fontSize: 12,
        marginTop: 40
    }
});

export default Login;
