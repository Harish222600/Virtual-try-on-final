import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    ActivityIndicator,
    TouchableOpacity,
    RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { adminAPI } from '../../api';

const SystemLogsScreen = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [filter, setFilter] = useState('all'); // all, error, warning, info

    useEffect(() => {
        loadLogs(true);
    }, [filter]);

    const loadLogs = async (reset = false) => {
        if (!reset && !hasMore) return;

        try {
            const currentPage = reset ? 1 : page;
            const params = { page: currentPage, limit: 50 };
            if (filter !== 'all') params.level = filter;

            const response = await adminAPI.getLogs(params);

            if (reset) {
                setLogs(response.data);
                setPage(2);
            } else {
                setLogs(prev => [...prev, ...response.data]);
                setPage(currentPage + 1);
            }

            setHasMore(response.data.length === 50);
        } catch (error) {
            console.error('Failed to load logs', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const getActionColor = (action) => {
        if (action.includes('error') || action.includes('fail') || action.includes('delete')) return '#ef4444'; // Red
        if (action.includes('update') || action.includes('edit')) return '#f59e0b'; // Amber
        if (action.includes('create') || action.includes('add')) return '#10b981'; // Green
        return '#6366f1'; // Indigo (Default)
    };

    const getIcon = (action) => {
        if (action.includes('error')) return 'alert-circle';
        if (action.includes('user')) return 'person';
        if (action.includes('garment')) return 'shirt';
        if (action.includes('tryon')) return 'camera';
        return 'information-circle';
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
    };

    const renderLogItem = ({ item }) => (
        <View style={styles.logItem}>
            <View style={[styles.iconContainer, { backgroundColor: `${getActionColor(item.action)}20` }]}>
                <Ionicons name={getIcon(item.action)} size={20} color={getActionColor(item.action)} />
            </View>
            <View style={styles.logContent}>
                <View style={styles.logHeader}>
                    <Text style={[styles.actionText, { color: getActionColor(item.action) }]}>
                        {item.action.replace(/_/g, ' ').toUpperCase()}
                    </Text>
                    <Text style={styles.timeText}>{formatDate(item.createdAt)}</Text>
                </View>
                <Text style={styles.userText}>
                    User: {item.userId?.email || 'System'}
                </Text>
                {item.details && (
                    <Text style={styles.detailsText} numberOfLines={2}>
                        {JSON.stringify(item.details)}
                    </Text>
                )}
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container} edges={['bottom']}>
            <LinearGradient
                colors={['#1a1a2e', '#0f0f23']}
                style={styles.header}
            >
                <View style={styles.filterContainer}>
                    {['all', 'user', 'system', 'error'].map((f) => (
                        <TouchableOpacity
                            key={f}
                            style={[styles.filterChip, filter === f && styles.filterChipActive]}
                            onPress={() => setFilter(f)}
                        >
                            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
                                {f.toUpperCase()}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </LinearGradient>

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#6366f1" />
                </View>
            ) : (
                <FlatList
                    data={logs}
                    keyExtractor={(item) => item._id}
                    renderItem={renderLogItem}
                    contentContainerStyle={styles.list}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={() => loadLogs(true)} tintColor="#6366f1" />
                    }
                    onEndReached={() => loadLogs()}
                    onEndReachedThreshold={0.5}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Ionicons name="clipboard-outline" size={64} color="#6366f1" />
                            <Text style={styles.emptyText}>No logs found</Text>
                        </View>
                    }
                />
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0f0f23',
    },
    header: {
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#2d2d44',
    },
    filterContainer: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        gap: 8,
    },
    filterChip: {
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderWidth: 1,
        borderColor: 'transparent',
    },
    filterChipActive: {
        backgroundColor: 'rgba(99, 102, 241, 0.2)',
        borderColor: '#6366f1',
    },
    filterText: {
        color: '#888',
        fontSize: 12,
        fontWeight: '600',
    },
    filterTextActive: {
        color: '#fff',
    },
    list: {
        padding: 16,
    },
    logItem: {
        flexDirection: 'row',
        backgroundColor: '#1a1a2e',
        marginBottom: 12,
        borderRadius: 12,
        padding: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    logContent: {
        flex: 1,
    },
    logHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    actionText: {
        fontSize: 12,
        fontWeight: '700',
    },
    timeText: {
        fontSize: 11,
        color: '#666',
    },
    userText: {
        fontSize: 13,
        color: '#ccc',
        marginBottom: 4,
    },
    detailsText: {
        fontSize: 12,
        color: '#888',
        fontFamily: 'monospace',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyContainer: {
        alignItems: 'center',
        marginTop: 60,
        opacity: 0.5,
    },
    emptyText: {
        marginTop: 16,
        color: '#888',
        fontSize: 16,
    },
});

export default SystemLogsScreen;
