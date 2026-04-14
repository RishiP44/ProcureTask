import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Feather } from '@expo/vector-icons';

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
            Alert.alert('Error', 'Please fill in all fields.');
            return;
        }

        try {
            setLoading(true);
            const endpoint = mode === 'login' ? '/auth/login' : '/auth/register';
            const payload = mode === 'login' 
                ? { email, password } 
                : { name, email, password, role };
            
            const response = await api.post(endpoint, payload);
            login(response.data);
        } catch (err: any) {
            const msg = err.response?.data?.message || `${mode === 'login' ? 'Login' : 'Signup'} failed.`;
            Alert.alert('Error', msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            <KeyboardAvoidingView 
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className="flex-1"
            >
                <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 36 }}>
                    <View className="items-center mb-16">
                        <Text className="text-4xl font-bold text-slate-900 tracking-tighter">ProcureTask</Text>
                        <Text className="text-[11px] text-slate-400 font-bold uppercase mt-2 tracking-widest">HR Organization</Text>
                    </View>

                    <View className="bg-white p-10 rounded border border-slate-100">
                        <View className="flex-row border-b border-slate-50 mb-10">
                            <TouchableOpacity 
                                onPress={() => setMode('login')}
                                className={`flex-1 pb-4 border-b-2 ${mode === 'login' ? 'border-slate-900' : 'border-transparent'}`}
                            >
                                <Text className={`text-center font-bold text-[11px] uppercase tracking-widest ${mode === 'login' ? 'text-slate-900' : 'text-slate-300'}`}>Sign In</Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                onPress={() => setMode('signup')}
                                className={`flex-1 pb-4 border-b-2 ${mode === 'signup' ? 'border-slate-900' : 'border-transparent'}`}
                            >
                                <Text className={`text-center font-bold text-[11px] uppercase tracking-widest ${mode === 'signup' ? 'text-slate-900' : 'text-slate-300'}`}>Sign Up</Text>
                            </TouchableOpacity>
                        </View>

                        {mode === 'signup' && (
                            <View className="mb-6">
                                <Text className="text-slate-500 font-bold text-[10px] mb-2 uppercase tracking-widest">Name</Text>
                                <TextInput
                                    className="bg-white border border-slate-100 rounded px-5 py-4 text-slate-900 text-sm"
                                    placeholder="Full Name"
                                    placeholderTextColor="#e2e8f0"
                                    value={name}
                                    onChangeText={setName}
                                />
                            </View>
                        )}

                        <View className="mb-6">
                            <Text className="text-slate-500 font-bold text-[10px] mb-2 uppercase tracking-widest">Email</Text>
                            <TextInput
                                className="bg-white border border-slate-100 rounded px-5 py-4 text-slate-900 text-sm"
                                placeholder="name@email.com"
                                placeholderTextColor="#e2e8e0"
                                value={email}
                                onChangeText={setEmail}
                                autoCapitalize="none"
                                keyboardType="email-address"
                            />
                        </View>

                        <View className="mb-10">
                            <Text className="text-slate-500 font-bold text-[10px] mb-2 uppercase tracking-widest">Password</Text>
                            <TextInput
                                className="bg-white border border-slate-100 rounded px-5 py-4 text-slate-900 text-sm"
                                placeholder="••••••••"
                                placeholderTextColor="#e2e8e0"
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry
                            />
                        </View>

                        <TouchableOpacity 
                            className={`bg-slate-900 py-5 rounded flex-row justify-center items-center ${loading ? 'opacity-70' : ''}`}
                            onPress={handleSubmit}
                            disabled={loading}
                        >
                            {loading && <ActivityIndicator color="#FFFFFF" size="small" className="mr-2" />}
                            <Text className="text-white font-bold text-[11px] uppercase tracking-widest">
                                {loading ? 'Logging in...' : (mode === 'login' ? 'Sign In' : 'Sign Up')}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <Text className="text-center text-slate-200 text-[10px] font-bold uppercase mt-16 tracking-widest">
                        © 2026 ProcureTask
                    </Text>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default Login;
