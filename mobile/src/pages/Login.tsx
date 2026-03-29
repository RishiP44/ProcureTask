import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();

    const handleSubmit = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Please enter both email and password.');
            return;
        }

        try {
            setLoading(true);
            const response = await api.post('/auth/login', { email, password });
            login(response.data);
            // Success alert is optional but helpful
        } catch (err: any) {
            const msg = err.response?.data?.message || 'Login failed. Please check your credentials.';
            Alert.alert('Sign in failed', msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <KeyboardAvoidingView 
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className="flex-1 px-6 justify-center"
            >
                <View className="w-full max-w-md">
                    <Text className="text-center text-3xl font-bold tracking-tight text-gray-900 mb-8">
                        Sign in to your account
                    </Text>

                    <View className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                        <View className="border-b border-gray-200">
                            <TextInput
                                className="px-4 py-3.5 text-gray-900 text-sm"
                                placeholder="Email address"
                                placeholderTextColor="#9CA3AF"
                                value={email}
                                onChangeText={setEmail}
                                autoCapitalize="none"
                                keyboardType="email-address"
                            />
                        </View>
                        <View>
                            <TextInput
                                className="px-4 py-3.5 text-gray-900 text-sm"
                                placeholder="Password"
                                placeholderTextColor="#9CA3AF"
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry
                            />
                        </View>
                    </View>

                    <TouchableOpacity 
                        className={`bg-indigo-600 py-3 rounded-lg mt-6 flex-row justify-center items-center shadow-sm ${loading ? 'opacity-70' : ''}`}
                        onPress={handleSubmit}
                        disabled={loading}
                        activeOpacity={0.8}
                    >
                        {loading && <ActivityIndicator color="#FFFFFF" size="small" className="mr-2" />}
                        <Text className="text-white text-center font-semibold text-sm">
                            {loading ? 'Signing in...' : 'Sign in'}
                        </Text>
                    </TouchableOpacity>

                    <View className="mt-6">
                        <Text className="text-center text-sm text-gray-500">
                            ProcureTask Platform
                        </Text>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default Login;
