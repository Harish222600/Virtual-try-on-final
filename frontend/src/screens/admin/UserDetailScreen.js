import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    ScrollView,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    FlatList
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { adminAPI } from '../../api';
import { Ionicons } from '@expo/vector-icons';

const UserDetailScreen = ({ route, navigation }) => {
    const { userId, userName } = route.params;
    const [user, setUser] = useState(null);
    const [activity, setActivity] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, [userId]);

    const loadData = async () => {
        try {
            const response = await adminAPI.getUserActivity(userId);
            if (response.success) {
                setUser(response.data.user);
                setActivity(response.data);
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to load user details');
            navigation.goBack();
        } finally {
            setLoading(false);
        }
    };

    const toggleBlock = async () => {
        try {
            const response = await adminAPI.toggleUserBlock(userId);
            setUser(prev => ({ ...prev, isBlocked: response.data.isBlocked }));
            Alert.alert('Success', `User ${response.data.isBlocked ? 'blocked' : 'unblocked'} successfully`);
        } catch (error) {
            Alert.alert('Error', 'Failed to update user status');
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#6366f1" />
            </View>
        );
    }

    if (!user) return null;

    return (
        <SafeAreaView style={styles.container} edges={['bottom']}>
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Header Profile Section */}
                <View style={styles.header}>
                    <View style={styles.profileHeader}>
                        {user.profileImage ? (
                            <Image source={{ uri: user.profileImage }} style={styles.avatar} />
                        ) : (
                            <View style={styles.avatarPlaceholder}>
                                <Text style={styles.avatarText}>{user.name?.[0]?.toUpperCase() || 'U'}</Text>
                            </View>
                        )}
                        <Text style={styles.name}>{user.name}</Text>
                        <Text style={styles.email}>{user.email}</Text>
                        <View style={[styles.statusBadge, user.isBlocked ? styles.blockedBadge : styles.activeBadge]}>
                            <Text style={[styles.statusText, user.isBlocked ? styles.blockedText : styles.activeText]}>
                                {user.isBlocked ? 'Blocked' : 'Active'}
                            </Text>
                        </View>
                    </View>

                    {/* Action Buttons */}
                    <View style={styles.actionButtons}>
                        <TouchableOpacity
                            style={[styles.actionButton, user.isBlocked ? styles.unblockButton : styles.blockButton]}
                            onPress={toggleBlock}
                        >
                            <Text style={[styles.actionButtonText, user.isBlocked ? styles.unblockText : styles.blockText]}>
                                {user.isBlocked ? 'Enable User' : 'Disable User'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* User Details */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Details</Text>
                    <View style={styles.card}>
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Role</Text>
                            <Text style={styles.detailValue}>{user.role}</Text>
                        </View>
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Joined</Text>
                            <Text style={styles.detailValue}>{formatDate(user.createdAt)}</Text>
                        </View>
                        {user.bodyInfo && (
                            <>
                                <View style={styles.detailRow}>
                                    <Text style={styles.detailLabel}>Gender</Text>
                                    <Text style={styles.detailValue}>{user.bodyInfo.gender || 'Not specified'}</Text>
                                </View>
                                <View style={styles.detailRow}>
                                    <Text style={styles.detailLabel}>Height</Text>
                                    <Text style={styles.detailValue}>{user.bodyInfo.height ? `${user.bodyInfo.height} cm` : 'Not specified'}</Text>
                                </View>
                                <View style={styles.detailRow}>
                                    <Text style={styles.detailLabel}>Body Type</Text>
                                    <Text style={styles.detailValue}>{user.bodyInfo.bodyType || 'Not specified'}</Text>
                                </View>
                            </>
                        )}
                    </View>
                </View>

                {/* Try-On History */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Recent Try-On History</Text>
                    {activity?.recentTryOns?.length > 0 ? (
                        activity.recentTryOns.map((item, index) => (
                            <TouchableOpacity
                                key={index}
                                style={styles.historyCard}
                                onPress={() => navigation.navigate('TryOnDetail', { tryOn: item })}
                            >
                                <View style={styles.historyImages}>
                                    <Image source={{ uri: item.outputImageUrl }} style={styles.historyImage} />
                                    {item.garmentId?.imageUrl && (
                                        <Image source={{ uri: item.garmentId.imageUrl }} style={styles.historySmallImage} />
                                    )}
                                </View>
                                <View style={styles.historyInfo}>
                                    <Text style={styles.historyGarmentName}>
                                        {item.garmentId?.name || 'Unknown Garment'}
                                    </Text>
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Text style={styles.historyDate}>{formatDate(item.createdAt)}</Text>
                                        <Ionicons name="chevron-forward" size={20} color="#666" />
                                    </View>
                                </View>
                            </TouchableOpacity>
                        ))
                    ) : (
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyText}>No try-on history found</Text>
                        </View>
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0f0f23',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#0f0f23',
    },
    header: {
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#1a1a2e',
        borderBottomWidth: 1,
        borderBottomColor: '#2d2d44',
    },
    profileHeader: {
        alignItems: 'center',
        marginBottom: 20,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        marginBottom: 16,
    },
    avatarPlaceholder: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#6366f1',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    avatarText: {
        fontSize: 40,
        fontWeight: 'bold',
        color: '#fff',
    },
    name: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 4,
    },
    email: {
        fontSize: 16,
        color: '#888',
        marginBottom: 12,
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    activeBadge: {
        backgroundColor: 'rgba(16, 185, 129, 0.2)',
    },
    blockedBadge: {
        backgroundColor: 'rgba(239, 68, 68, 0.2)',
    },
    statusText: {
        fontSize: 14,
        fontWeight: '600',
    },
    activeText: {
        color: '#10b981',
    },
    blockedText: {
        color: '#ef4444',
    },
    actionButtons: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'center',
    },
    actionButton: {
        paddingVertical: 12,
        paddingHorizontal: 32,
        borderRadius: 12,
        minWidth: 160,
        alignItems: 'center',
    },
    blockButton: {
        backgroundColor: 'rgba(245, 158, 11, 0.2)',
        borderWidth: 1,
        borderColor: '#f59e0b',
    },
    unblockButton: {
        backgroundColor: 'rgba(16, 185, 129, 0.2)',
        borderWidth: 1,
        borderColor: '#10b981',
    },
    actionButtonText: {
        fontSize: 16,
        fontWeight: '600',
    },
    blockText: {
        color: '#f59e0b',
    },
    unblockText: {
        color: '#10b981',
    },
    section: {
        padding: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 12,
    },
    card: {
        backgroundColor: '#1a1a2e',
        borderRadius: 16,
        padding: 16,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#2d2d44',
    },
    detailLabel: {
        color: '#888',
        fontSize: 14,
    },
    detailValue: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '500',
        textTransform: 'capitalize',
    },
    historyCard: {
        backgroundColor: '#1a1a2e',
        borderRadius: 16,
        padding: 12,
        marginBottom: 12,
        flexDirection: 'row',
        alignItems: 'center',
    },
    historyImages: {
        flexDirection: 'row',
        marginRight: 16,
    },
    historyImage: {
        width: 60,
        height: 80,
        borderRadius: 8,
        backgroundColor: '#2d2d44',
    },
    historySmallImage: {
        width: 40,
        height: 53,
        borderRadius: 6,
        backgroundColor: '#2d2d44',
        position: 'absolute',
        bottom: -4,
        right: -10,
        borderWidth: 2,
        borderColor: '#1a1a2e',
    },
    historyInfo: {
        flex: 1,
        marginLeft: 8,
    },
    historyGarmentName: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    historyDate: {
        color: '#888',
        fontSize: 12,
    },
    emptyState: {
        padding: 20,
        alignItems: 'center',
        backgroundColor: '#1a1a2e',
        borderRadius: 16,
    },
    emptyText: {
        color: '#888',
        fontSize: 14,
    },
});

export default UserDetailScreen;
