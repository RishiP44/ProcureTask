import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet, Platform, TextInput } from 'react-native';
import { Feather } from '@expo/vector-icons';

// INDUSTRIAL WEB-PARITY DESIGN SYSTEM
export const DataBlock = ({ children, style }: any) => (
    <View style={[styles.dataBlock, style]}>
        {children}
    </View>
);

export const WebBadge = ({ status }: { status: string }) => {
    const s = (status || 'pending').toLowerCase();
    let theme = { bg: '#f8fafc', text: '#64748b', border: '#e2e8f0' };
    
    if (s.includes('active') || s.includes('completed') || s.includes('approved')) 
        theme = { bg: '#f0fdf4', text: '#16a34a', border: '#bbf7d0' };
    else if (s.includes('pending') || s.includes('review') || s.includes('progress')) 
        theme = { bg: '#fffbeb', text: '#d97706', border: '#fef3c7' };

    return (
        <View style={[styles.badge, { backgroundColor: theme.bg, borderColor: theme.border }]}>
            <Text style={[styles.badgeText, { color: theme.text }]}>{(status || 'pending').toUpperCase()}</Text>
        </View>
    );
};

export const IndustrialButton = ({ label, onPress, loading, icon, disabled, style }: any) => (
    <TouchableOpacity 
        onPress={onPress}
        disabled={disabled || loading}
        activeOpacity={0.7}
        style={[styles.indButton, disabled && { opacity: 0.5 }, style]}
    >
        {loading ? (
            <ActivityIndicator color="white" size="small" />
        ) : (
            <>
                {icon && <Feather name={icon} size={16} color="white" style={{ marginRight: 8 }} />}
                <Text style={styles.indButtonText}>{label}</Text>
            </>
        )}
    </TouchableOpacity>
);

export const WebSectionHeader = ({ title, count }: { title: string, count?: number }) => (
    <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {count !== undefined && (
            <View style={styles.countBadge}>
                <Text style={styles.countText}>{count}</Text>
            </View>
        )}
    </View>
);

export const IndustrialInput = ({ label, ...props }: any) => (
    <View style={{ marginBottom: 16 }}>
        <Text style={styles.inputLabel}>{label}</Text>
        <TextInput 
            style={styles.input}
            placeholderTextColor="#94a3b8"
            {...props}
        />
    </View>
);

const styles = StyleSheet.create({
    dataBlock: {
        backgroundColor: 'white',
        borderRadius: 4,
        padding: 16,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        marginBottom: 12
    },
    badge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 2,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center'
    },
    badgeText: {
        fontSize: 10,
        fontWeight: '700',
    },
    indButton: {
        backgroundColor: '#1d4ed8',
        height: 48,
        borderRadius: 4,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 16,
    },
    indButtonText: {
        color: 'white',
        fontSize: 14,
        fontWeight: '600',
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        paddingTop: 8
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#0f172a',
        letterSpacing: -0.5
    },
    countBadge: {
        backgroundColor: '#f1f5f9',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 10,
        marginLeft: 8
    },
    countText: {
        fontSize: 11,
        fontWeight: '700',
        color: '#64748b'
    },
    inputLabel: {
        fontSize: 13,
        fontWeight: '600',
        color: '#475569',
        marginBottom: 6
    },
    input: {
        height: 44,
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: '#cbd5e1',
        borderRadius: 4,
        paddingHorizontal: 12,
        fontSize: 14,
        color: '#0f172a'
    }
});
