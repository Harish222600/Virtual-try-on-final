import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Image,
    TextInput,
    ActivityIndicator,
    RefreshControl,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { adminAPI } from '../../api';

const UserManagementScreen = ({ navigation }) => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    useEffect(() => {
        loadUsers(true);
    }, [search]);

    const loadUsers = async (reset = false) => {
        if (!reset && !hasMore) return;

        try {
            const currentPage = reset ? 1 : page;
            const params = { page: currentPage, limit: 20 };
            if (search.trim()) params.search = search.trim();

            const response = await adminAPI.getUsers(params);

            if (reset) {
                setUsers(response.data);
                setPage(2);
            } else {
                setUsers(prev => [...prev, ...response.data]);
                setPage(currentPage + 1);
            }

            setHasMore(response.data.length === 20);
        } catch (error) {
            Alert.alert('Error', 'Failed to load users');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        loadUsers(true);
    }, [search]);

    const toggleBlock = async (userId) => {
        try {
            const response = await adminAPI.toggleUserBlock(userId);
            setUsers(prev =>
                prev.map(user =>
                    user._id === userId ? { ...user, isBlocked: response.data.isBlocked } : user
                )
            );
        } catch (error) {
            Alert.alert('Error', 'Failed to update user');
        }
    };

    const deleteUser = (userId, email) => {
        Alert.alert(
            'Delete User',
            `Are you sure you want to delete ${email}?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await adminAPI.deleteUser(userId);
                            setUsers(prev => prev.filter(user => user._id !== userId));
                        } catch (error) {
                            Alert.alert('Error', 'Failed to delete user');
                        }
                    },
                },
            ]
        );
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    const renderUser = ({ item }) => (
        <TouchableOpacity
            style={styles.userCard}
            onPress={() => navigation.navigate('UserDetail', { userId: item._id, userName: item.name })}
        >
            <View style={styles.userHeader}>
                {item.profileImage ? (
                    <Image source={{ uri: item.profileImage }} style={styles.avatar} />
                ) : (
                    <View style={styles.avatarPlaceholder}>
                        <Text style={styles.avatarText}>{item.name?.[0]?.toUpperCase() || 'U'}</Text>
                    </View>
                )}
                <View style={styles.userInfo}>
                    <Text style={styles.userName}>{item.name}</Text>
                    <Text style={styles.userEmail}>{item.email}</Text>
                </View>
                {item.isBlocked && (
                    <View style={styles.blockedBadge}>
                        <Text style={styles.blockedText}>Blocked</Text>
                    </View>
                )}
            </View>

            <View style={styles.userMeta}>
                <Text style={styles.metaText}>Joined: {formatDate(item.createdAt)}</Text>
            </View>

            <View style={styles.userActions}>
                <TouchableOpacity
                    style={[styles.actionButton, item.isBlocked && styles.unblockButton]}
                    onPress={(e) => {
                        e.stopPropagation(); // Prevent card click
                        toggleBlock(item._id);
                    }}
                >
                    <Text style={styles.actionText}>{item.isBlocked ? 'Unblock' : 'Block'}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={(e) => {
                        e.stopPropagation(); // Prevent card click
                        deleteUser(item._id, item.email);
                    }}
                >
                    <Text style={styles.deleteText}>Delete</Text>
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container} edges={['bottom']}>
            <View style={styles.searchContainer}>
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search users..."
                    placeholderTextColor="#666"
                    value={search}
                    onChangeText={setSearch}
                />
            </View>

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#6366f1" />
                </View>
            ) : (
                <FlatList
                    data={users}
                    keyExtractor={(item) => item._id}
                    renderItem={renderUser}
                    contentContainerStyle={styles.list}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6366f1" />
                    }
                    onEndReached={() => loadUsers()}
                    onEndReachedThreshold={0.5}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyIcon}>👥</Text>
                            <Text style={styles.emptyText}>No users found</Text>
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
    searchContainer: {
        paddingHorizontal: 20,
        paddingVertical: 12,
    },
    searchInput: {
        backgroundColor: '#1a1a2e',
        borderRadius: 12,
        padding: 14,
        fontSize: 16,
        color: '#fff',
        borderWidth: 1,
        borderColor: '#2d2d44',
    },
    list: {
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    userCard: {
        backgroundColor: '#1a1a2e',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
    },
    userHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
    },
    avatarPlaceholder: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#6366f1',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
    },
    userInfo: {
        flex: 1,
        marginLeft: 12,
    },
    userName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
    },
    userEmail: {
        fontSize: 13,
        color: '#888',
        marginTop: 2,
    },
    blockedBadge: {
        backgroundColor: '#ef444420',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    blockedText: {
        color: '#ef4444',
        fontSize: 12,
        fontWeight: '600',
    },
    userMeta: {
        marginBottom: 12,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#2d2d44',
    },
    metaText: {
        fontSize: 13,
        color: '#888',
    },
    userActions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
    },
    actionButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
        backgroundColor: '#f59e0b20',
        marginRight: 8,
    },
    unblockButton: {
        backgroundColor: '#10b98120',
    },
    actionText: {
        color: '#f59e0b',
        fontSize: 14,
        fontWeight: '600',
    },
    deleteButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
        backgroundColor: '#ef444420',
    },
    deleteText: {
        color: '#ef4444',
        fontSize: 14,
        fontWeight: '600',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyContainer: {
        alignItems: 'center',
        paddingTop: 60,
    },
    emptyIcon: {
        fontSize: 64,
        marginBottom: 16,
    },
    emptyText: {
        fontSize: 16,
        color: '#888',
    },
});

export default UserManagementScreen;
