import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { adminAPI } from '../../api';

const AdminDashboardScreen = ({ navigation }) => {
    const { isAdmin } = useAuth();
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        loadAnalytics();
    }, []);

    const loadAnalytics = async () => {
        try {
            const response = await adminAPI.getAnalytics();
            setAnalytics(response.data);
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Failed to load analytics');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleRefresh = () => {
        setRefreshing(true);
        loadAnalytics();
    };

    if (!isAdmin) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.accessDenied}>
                    <Ionicons name="alert-circle" size={64} color="#ef4444" />
                    <Text style={styles.accessDeniedText}>Admin access required</Text>
                </View>
            </SafeAreaView>
        );
    }

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#6366f1" />
                </View>
            </SafeAreaView>
        );
    }

    const StatCard = ({ title, value, icon, color, subtitle }) => (
        <LinearGradient
            colors={['#1a1a2e', '#2d2d44']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.statCard}
        >
            <View style={[styles.iconContainer, { backgroundColor: `${color}20` }]}>
                <Ionicons name={icon} size={24} color={color} />
            </View>
            <Text style={styles.statValue}>{value}</Text>
            <Text style={styles.statTitle}>{title}</Text>
            {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
        </LinearGradient>
    );

    const MenuItem = ({ icon, title, subtitle, onPress, color = "#6366f1" }) => (
        <TouchableOpacity style={styles.menuItem} onPress={onPress}>
            <LinearGradient
                colors={['rgba(255,255,255,0.05)', 'rgba(255,255,255,0.02)']}
                style={styles.menuItemGradient}
            >
                <View style={[styles.menuIcon, { backgroundColor: `${color}20` }]}>
                    <Ionicons name={icon} size={24} color={color} />
                </View>
                <View style={styles.menuContent}>
                    <Text style={styles.menuTitle}>{title}</Text>
                    <Text style={styles.menuSubtitle}>{subtitle}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#666" />
            </LinearGradient>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container} edges={['bottom']}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#6366f1" />
                }
            >
                <View style={styles.header}>
                    <View>
                        <Text style={styles.title}>Admin Dashboard</Text>
                        <Text style={styles.subtitle}>Welcome back, Admin</Text>
                    </View>
                    <TouchableOpacity onPress={handleRefresh} style={styles.refreshButton}>
                        <Ionicons name="refresh" size={20} color="#fff" />
                    </TouchableOpacity>
                </View>

                <View style={styles.statsGrid}>
                    <View style={styles.statsRow}>
                        <StatCard
                            title="Total Users"
                            value={analytics?.users?.total || 0}
                            icon="people"
                            color="#6366f1"
                            subtitle={`+${analytics?.users?.newToday || 0} today`}
                        />
                        <StatCard
                            title="Try-Ons"
                            value={analytics?.tryOns?.total || 0}
                            icon="shirt"
                            color="#ec4899"
                            subtitle={`+${analytics?.tryOns?.today || 0} today`}
                        />
                    </View>
                    <View style={styles.statsRow}>
                        <StatCard
                            title="Active Items"
                            value={analytics?.garments?.active || 0}
                            icon="layers"
                            color="#10b981"
                        />
                        <StatCard
                            title="Success Rate"
                            value={`${analytics?.tryOns?.successRate || 0}%`}
                            icon="stats-chart"
                            color="#f59e0b"
                        />
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Management</Text>
                    <MenuItem
                        icon="people"
                        title="User Management"
                        subtitle="Manage users, roles & blocks"
                        onPress={() => navigation.navigate('UserManagement')}
                        color="#6366f1"
                    />
                    <MenuItem
                        icon="shirt"
                        title="Garment Management"
                        subtitle="Add, edit & remove items"
                        onPress={() => navigation.navigate('GarmentManagement')}
                        color="#ec4899"
                    />
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>System & Analytics</Text>
                    <MenuItem
                        icon="bar-chart"
                        title="Advanced Analytics"
                        subtitle="Detailed charts & trends"
                        onPress={() => navigation.navigate('Analytics')}
                        color="#10b981"
                    />
                    <MenuItem
                        icon="terminal"
                        title="System Logs"
                        subtitle="View system activities & errors"
                        onPress={() => navigation.navigate('SystemLogs')}
                        color="#f59e0b"
                    />
                    <MenuItem
                        icon="settings"
                        title="System Config"
                        subtitle="Detailed charts & trends"
                        onPress={() => navigation.navigate('SystemSettings')}
                        color="#6366f1"
                    />
                </View>

                {/* Quick Model Status */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>AI Model Status</Text>
                    <LinearGradient
                        colors={['#1a1a2e', '#2d2d44']}
                        style={styles.modelStatusCard}
                    >
                        <View style={styles.modelInfo}>
                            <Ionicons name="hardware-chip" size={24} color="#8b5cf6" />
                            <View style={styles.modelText}>
                                <Text style={styles.modelName}>IDM-VTON (yisol)</Text>
                                <Text style={styles.modelStatus}>Operational</Text>
                            </View>
                        </View>
                        <View style={styles.statusDot} />
                    </LinearGradient>
                </View>

                <View style={{ height: 20 }} />
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0f0f23',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#fff',
    },
    subtitle: {
        fontSize: 14,
        color: '#888',
        marginTop: 4,
    },
    refreshButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    accessDenied: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    accessDeniedText: {
        fontSize: 18,
        color: '#888',
        marginTop: 16,
    },
    statsGrid: {
        paddingHorizontal: 16,
        marginBottom: 24,
    },
    statsRow: {
        flexDirection: 'row',
        marginBottom: 12,
        gap: 12,
    },
    statCard: {
        flex: 1,
        padding: 16,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    statValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
    },
    statTitle: {
        fontSize: 12,
        color: '#888',
        marginTop: 4,
    },
    statSubtitle: {
        fontSize: 10,
        color: '#10b981',
        marginTop: 4,
        fontWeight: '600',
    },
    section: {
        paddingHorizontal: 20,
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 16,
    },
    menuItem: {
        marginBottom: 12,
        borderRadius: 16,
        overflow: 'hidden',
    },
    menuItemGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    menuIcon: {
        width: 48,
        height: 48,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    menuContent: {
        flex: 1,
    },
    menuTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
        marginBottom: 4,
    },
    menuSubtitle: {
        fontSize: 12,
        color: '#888',
    },
    modelStatusCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    modelInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    modelText: {
        marginLeft: 12,
    },
    modelName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
    },
    modelStatus: {
        fontSize: 12,
        color: '#10b981',
        marginTop: 2,
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#10b981',
        shadowColor: "#10b981",
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 10,
    },
});

export default AdminDashboardScreen;
