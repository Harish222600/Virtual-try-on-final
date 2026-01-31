import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContext';
import { adminAPI } from '../../api';

const AdminDashboardScreen = ({ navigation }) => {
    const { isAdmin } = useAuth();
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [models, setModels] = useState([]);
    const [modelModalVisible, setModelModalVisible] = useState(false);
    const [changingModel, setChangingModel] = useState(false);

    useEffect(() => {
        loadAnalytics();
        loadModels();
    }, []);

    const loadAnalytics = async () => {
        try {
            const response = await adminAPI.getAnalytics();
            setAnalytics(response.data);
        } catch (error) {
            Alert.alert('Error', 'Failed to load analytics');
        } finally {
            setLoading(false);
        }
    };

    const loadModels = async () => {
        try {
            const response = await adminAPI.getModels();
            setModels(response.data);
        } catch (error) {
            console.log('Failed to load models:', error);
        }
    };

    const handleModelChange = async (modelId) => {
        setChangingModel(true);
        try {
            const response = await adminAPI.setActiveModel(modelId);
            Alert.alert('Success', response.message);
            await loadModels(); // Refresh model list
            setModelModalVisible(false);
        } catch (error) {
            Alert.alert('Error', error.response?.data?.message || 'Failed to change model');
        } finally {
            setChangingModel(false);
        }
    };

    const getActiveModel = () => {
        return models.find(m => m.isActive) || { name: 'Loading...' };
    };

    if (!isAdmin) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.accessDenied}>
                    <Text style={styles.accessDeniedIcon}>🚫</Text>
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

    const StatCard = ({ title, value, icon, color }) => (
        <View style={[styles.statCard, { borderColor: color }]}>
            <Text style={styles.statIcon}>{icon}</Text>
            <Text style={styles.statValue}>{value}</Text>
            <Text style={styles.statTitle}>{title}</Text>
        </View>
    );

    const MenuItem = ({ icon, title, subtitle, onPress, rightElement }) => (
        <TouchableOpacity style={styles.menuItem} onPress={onPress}>
            <View style={styles.menuIcon}>
                <Text style={styles.menuIconText}>{icon}</Text>
            </View>
            <View style={styles.menuContent}>
                <Text style={styles.menuTitle}>{title}</Text>
                <Text style={styles.menuSubtitle}>{subtitle}</Text>
            </View>
            {rightElement || <Text style={styles.chevron}>›</Text>}
        </TouchableOpacity>
    );

    const ModelOption = ({ model, onSelect }) => (
        <TouchableOpacity
            style={[
                styles.modelOption,
                model.isActive && styles.modelOptionActive
            ]}
            onPress={() => onSelect(model.id)}
            disabled={model.isActive || changingModel}
        >
            <View style={styles.modelInfo}>
                <Text style={[styles.modelName, model.isActive && styles.modelNameActive]}>
                    {model.name}
                </Text>
                <Text style={styles.modelDescription}>{model.description}</Text>
                <View style={styles.modelMeta}>
                    <Text style={styles.modelTime}>⏱ {model.avgProcessingTime}</Text>
                    {model.strengths?.slice(0, 2).map((s, i) => (
                        <Text key={i} style={styles.modelTag}>{s}</Text>
                    ))}
                </View>
            </View>
            {model.isActive ? (
                <View style={styles.activeIndicator}>
                    <Text style={styles.activeText}>✓ Active</Text>
                </View>
            ) : (
                <Text style={styles.selectText}>Select</Text>
            )}
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.header}>
                    <Text style={styles.title}>Admin Dashboard</Text>
                    <TouchableOpacity onPress={() => { loadAnalytics(); loadModels(); }}>
                        <Text style={styles.refreshIcon}>🔄</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.statsGrid}>
                    <StatCard
                        title="Total Users"
                        value={analytics?.users?.total || 0}
                        icon="👥"
                        color="#6366f1"
                    />
                    <StatCard
                        title="Active Garments"
                        value={analytics?.garments?.active || 0}
                        icon="👗"
                        color="#ec4899"
                    />
                    <StatCard
                        title="Total Try-Ons"
                        value={analytics?.tryOns?.total || 0}
                        icon="✨"
                        color="#10b981"
                    />
                    <StatCard
                        title="Success Rate"
                        value={`${analytics?.tryOns?.successRate || 0}%`}
                        icon="📊"
                        color="#f59e0b"
                    />
                </View>

                <View style={styles.todayStats}>
                    <Text style={styles.sectionTitle}>Today's Activity</Text>
                    <View style={styles.todayRow}>
                        <View style={styles.todayStat}>
                            <Text style={styles.todayValue}>{analytics?.users?.newToday || 0}</Text>
                            <Text style={styles.todayLabel}>New Users</Text>
                        </View>
                        <View style={styles.todayStat}>
                            <Text style={styles.todayValue}>{analytics?.tryOns?.today || 0}</Text>
                            <Text style={styles.todayLabel}>Try-Ons</Text>
                        </View>
                        <View style={styles.todayStat}>
                            <Text style={styles.todayValue}>
                                {analytics?.tryOns?.avgProcessingTime
                                    ? `${(analytics.tryOns.avgProcessingTime / 1000).toFixed(1)}s`
                                    : '-'}
                            </Text>
                            <Text style={styles.todayLabel}>Avg Time</Text>
                        </View>
                    </View>
                </View>

                {/* AI Model Settings */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>AI Model Settings</Text>
                    <MenuItem
                        icon="🤖"
                        title="Active Model"
                        subtitle={getActiveModel().name}
                        onPress={() => setModelModalVisible(true)}
                        rightElement={
                            <View style={styles.modelBadge}>
                                <Text style={styles.modelBadgeText}>{getActiveModel().name}</Text>
                            </View>
                        }
                    />
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Management</Text>
                    <MenuItem
                        icon="👥"
                        title="User Management"
                        subtitle="View and manage users"
                        onPress={() => navigation.navigate('UserManagement')}
                    />
                    <MenuItem
                        icon="👗"
                        title="Garment Management"
                        subtitle="Add and edit garments"
                        onPress={() => navigation.navigate('GarmentManagement')}
                    />
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Popular Garments</Text>
                    {analytics?.popularGarments?.map((garment, index) => (
                        <View key={garment._id} style={styles.popularItem}>
                            <Text style={styles.popularRank}>#{index + 1}</Text>
                            <View style={styles.popularContent}>
                                <Text style={styles.popularName}>{garment.name}</Text>
                                <Text style={styles.popularCategory}>{garment.category}</Text>
                            </View>
                            <Text style={styles.popularCount}>{garment.tryOnCount} try-ons</Text>
                        </View>
                    ))}
                </View>
            </ScrollView>

            {/* Model Selection Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modelModalVisible}
                onRequestClose={() => setModelModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Select AI Model</Text>
                            <TouchableOpacity onPress={() => setModelModalVisible(false)}>
                                <Text style={styles.modalClose}>✕</Text>
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.modelList}>
                            {models.map(model => (
                                <ModelOption
                                    key={model.id}
                                    model={model}
                                    onSelect={handleModelChange}
                                />
                            ))}
                        </ScrollView>

                        {changingModel && (
                            <View style={styles.changingOverlay}>
                                <ActivityIndicator size="large" color="#6366f1" />
                                <Text style={styles.changingText}>Switching model...</Text>
                            </View>
                        )}
                    </View>
                </View>
            </Modal>
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
        paddingBottom: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
    },
    refreshIcon: {
        fontSize: 24,
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
    accessDeniedIcon: {
        fontSize: 64,
        marginBottom: 16,
    },
    accessDeniedText: {
        fontSize: 18,
        color: '#888',
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: 12,
        marginBottom: 16,
    },
    statCard: {
        width: '45%',
        margin: '2.5%',
        padding: 16,
        backgroundColor: '#1a1a2e',
        borderRadius: 16,
        borderWidth: 1,
        alignItems: 'center',
    },
    statIcon: {
        fontSize: 28,
        marginBottom: 8,
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
    todayStats: {
        marginHorizontal: 20,
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#888',
        marginBottom: 12,
    },
    todayRow: {
        flexDirection: 'row',
        backgroundColor: '#1a1a2e',
        borderRadius: 16,
        padding: 16,
    },
    todayStat: {
        flex: 1,
        alignItems: 'center',
    },
    todayValue: {
        fontSize: 20,
        fontWeight: '600',
        color: '#6366f1',
    },
    todayLabel: {
        fontSize: 12,
        color: '#888',
        marginTop: 4,
    },
    section: {
        marginHorizontal: 20,
        marginBottom: 24,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1a1a2e',
        borderRadius: 12,
        padding: 16,
        marginBottom: 8,
    },
    menuIcon: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: '#2d2d44',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
    },
    menuIconText: {
        fontSize: 20,
    },
    menuContent: {
        flex: 1,
    },
    menuTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
    },
    menuSubtitle: {
        fontSize: 13,
        color: '#888',
        marginTop: 2,
    },
    chevron: {
        fontSize: 24,
        color: '#888',
    },
    modelBadge: {
        backgroundColor: '#6366f1',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    modelBadgeText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
    },
    popularItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1a1a2e',
        borderRadius: 12,
        padding: 14,
        marginBottom: 8,
    },
    popularRank: {
        fontSize: 16,
        fontWeight: '600',
        color: '#6366f1',
        width: 30,
    },
    popularContent: {
        flex: 1,
    },
    popularName: {
        fontSize: 14,
        fontWeight: '500',
        color: '#fff',
    },
    popularCategory: {
        fontSize: 12,
        color: '#888',
        textTransform: 'capitalize',
    },
    popularCount: {
        fontSize: 12,
        color: '#10b981',
        fontWeight: '600',
    },
    // Modal styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#1a1a2e',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        maxHeight: '80%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#2d2d44',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#fff',
    },
    modalClose: {
        fontSize: 24,
        color: '#888',
    },
    modelList: {
        padding: 16,
    },
    modelOption: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#2d2d44',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    modelOptionActive: {
        borderColor: '#6366f1',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
    },
    modelInfo: {
        flex: 1,
    },
    modelName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
        marginBottom: 4,
    },
    modelNameActive: {
        color: '#6366f1',
    },
    modelDescription: {
        fontSize: 13,
        color: '#888',
        marginBottom: 8,
    },
    modelMeta: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
    },
    modelTime: {
        fontSize: 11,
        color: '#888',
        marginRight: 8,
    },
    modelTag: {
        fontSize: 10,
        color: '#6366f1',
        backgroundColor: 'rgba(99, 102, 241, 0.2)',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 10,
        marginRight: 4,
    },
    activeIndicator: {
        backgroundColor: '#10b981',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    activeText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
    },
    selectText: {
        color: '#6366f1',
        fontSize: 14,
        fontWeight: '600',
    },
    changingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.8)',
        justifyContent: 'center',
        alignItems: 'center',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
    },
    changingText: {
        color: '#fff',
        marginTop: 16,
        fontSize: 16,
    },
});

export default AdminDashboardScreen;
