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
    Modal,
    ScrollView,
    Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { adminAPI } from '../../api';

const { width } = Dimensions.get('window');

const UserManagementScreen = ({ navigation }) => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    // Create User State
    const [createModalVisible, setCreateModalVisible] = useState(false);
    const [creating, setCreating] = useState(false);
    const [newUser, setNewUser] = useState({
        name: '',
        email: '',
        password: '',
        role: 'user'
    });

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

    const handleCreateUser = async () => {
        if (!newUser.name || !newUser.email || !newUser.password) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        setCreating(true);
        try {
            const response = await adminAPI.createUser(newUser);
            Alert.alert('Success', 'User created successfully');
            setCreateModalVisible(false);
            setNewUser({ name: '', email: '', password: '', role: 'user' });
            // Refresh list
            loadUsers(true);
        } catch (error) {
            Alert.alert('Error', error.response?.data?.message || 'Failed to create user');
        } finally {
            setCreating(false);
        }
    };

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
            activeOpacity={0.9}
            style={styles.cardContainer}
            onPress={() => navigation.navigate('UserDetail', { userId: item._id, userName: item.name })}
        >
            <LinearGradient
                colors={item.isBlocked ? ['#2d1b26', '#1f1219'] : ['#2d2d44', '#1a1a2e']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.userCard, item.isBlocked && styles.blockedCardBorder]}
            >
                <View style={styles.cardHeader}>
                    <View style={styles.userInfoLeft}>
                        {item.profileImage ? (
                            <Image source={{ uri: item.profileImage }} style={styles.avatar} />
                        ) : (
                            <LinearGradient
                                colors={['#6366f1', '#8b5cf6']}
                                style={styles.avatarPlaceholder}
                            >
                                <Text style={styles.avatarText}>{item.name?.[0]?.toUpperCase() || 'U'}</Text>
                            </LinearGradient>
                        )}
                        <View style={styles.textContainer}>
                            <Text style={styles.userName} numberOfLines={1}>{item.name}</Text>
                            <Text style={styles.userEmail} numberOfLines={1}>{item.email}</Text>
                            <View style={styles.badgesRow}>
                                {item.role === 'admin' && (
                                    <View style={styles.adminBadge}>
                                        <Ionicons name="shield-checkmark" size={10} color="#fbbf24" style={{ marginRight: 4 }} />
                                        <Text style={styles.adminBadgeText}>Admin</Text>
                                    </View>
                                )}
                                {item.isBlocked && (
                                    <View style={styles.blockedBadge}>
                                        <Ionicons name="ban" size={10} color="#ef4444" style={{ marginRight: 4 }} />
                                        <Text style={styles.blockedText}>Blocked</Text>
                                    </View>
                                )}
                            </View>
                        </View>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#666" />
                </View>

                <View style={styles.cardFooter}>
                    <Text style={styles.metaText}>Joined {formatDate(item.createdAt)}</Text>
                    <View style={styles.actionButtons}>
                        <TouchableOpacity
                            style={[styles.iconButton, { backgroundColor: item.isBlocked ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)' }]}
                            onPress={(e) => {
                                e.stopPropagation();
                                toggleBlock(item._id);
                            }}
                        >
                            <Ionicons
                                name={item.isBlocked ? "lock-open-outline" : "lock-closed-outline"}
                                size={18}
                                color={item.isBlocked ? "#10b981" : "#ef4444"}
                            />
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.iconButton, { backgroundColor: 'rgba(239,68,68,0.1)' }]}
                            onPress={(e) => {
                                e.stopPropagation();
                                deleteUser(item._id, item.email);
                            }}
                        >
                            <Ionicons name="trash-outline" size={18} color="#ef4444" />
                        </TouchableOpacity>
                    </View>
                </View>
            </LinearGradient>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container} edges={['bottom']}>
            <LinearGradient
                colors={['#1a1a2e', '#0f0f23']}
                style={styles.header}
            >
                <View style={styles.searchSection}>
                    <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search users..."
                        placeholderTextColor="#666"
                        value={search}
                        onChangeText={setSearch}
                    />
                </View>
                <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => setCreateModalVisible(true)}
                >
                    <LinearGradient
                        colors={['#6366f1', '#8b5cf6']}
                        style={styles.addButtonGradient}
                    >
                        <Ionicons name="add" size={28} color="#fff" />
                    </LinearGradient>
                </TouchableOpacity>
            </LinearGradient>

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
                            <Ionicons name="people-outline" size={64} color="#6366f1" />
                            <Text style={styles.emptyText}>No users found</Text>
                            <Text style={styles.emptySubText}>Try adjusting your search</Text>
                        </View>
                    }
                />
            )}

            {/* Create User Modal */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={createModalVisible}
                onRequestClose={() => setCreateModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <LinearGradient
                            colors={['#1a1a2e', '#2d2d44']}
                            style={styles.modalGradient}
                        >
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>Create New User</Text>
                                <TouchableOpacity
                                    onPress={() => setCreateModalVisible(false)}
                                    style={styles.closeButton}
                                >
                                    <Ionicons name="close" size={24} color="#888" />
                                </TouchableOpacity>
                            </View>

                            <ScrollView style={styles.formScroll}>
                                <View style={styles.formGroup}>
                                    <Text style={styles.label}>Full Name</Text>
                                    <View style={styles.inputContainer}>
                                        <Ionicons name="person-outline" size={20} color="#666" style={styles.inputIcon} />
                                        <TextInput
                                            style={styles.input}
                                            value={newUser.name}
                                            onChangeText={(text) => setNewUser({ ...newUser, name: text })}
                                            placeholder="John Doe"
                                            placeholderTextColor="#666"
                                        />
                                    </View>
                                </View>

                                <View style={styles.formGroup}>
                                    <Text style={styles.label}>Email Address</Text>
                                    <View style={styles.inputContainer}>
                                        <Ionicons name="mail-outline" size={20} color="#666" style={styles.inputIcon} />
                                        <TextInput
                                            style={styles.input}
                                            value={newUser.email}
                                            onChangeText={(text) => setNewUser({ ...newUser, email: text })}
                                            placeholder="john@example.com"
                                            placeholderTextColor="#666"
                                            keyboardType="email-address"
                                            autoCapitalize="none"
                                        />
                                    </View>
                                </View>

                                <View style={styles.formGroup}>
                                    <Text style={styles.label}>Password</Text>
                                    <View style={styles.inputContainer}>
                                        <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.inputIcon} />
                                        <TextInput
                                            style={styles.input}
                                            value={newUser.password}
                                            onChangeText={(text) => setNewUser({ ...newUser, password: text })}
                                            placeholder="Min. 6 characters"
                                            placeholderTextColor="#666"
                                            secureTextEntry
                                        />
                                    </View>
                                </View>

                                <View style={styles.formGroup}>
                                    <Text style={styles.label}>Role</Text>
                                    <View style={styles.roleContainer}>
                                        <TouchableOpacity
                                            activeOpacity={0.8}
                                            style={[styles.roleOption, newUser.role === 'user' && styles.roleActive]}
                                            onPress={() => setNewUser({ ...newUser, role: 'user' })}
                                        >
                                            <Ionicons
                                                name="person"
                                                size={20}
                                                color={newUser.role === 'user' ? '#fff' : '#666'}
                                            />
                                            <Text style={[styles.roleText, newUser.role === 'user' && styles.roleTextActive]}>User</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            activeOpacity={0.8}
                                            style={[styles.roleOption, newUser.role === 'admin' && styles.roleActive]}
                                            onPress={() => setNewUser({ ...newUser, role: 'admin' })}
                                        >
                                            <Ionicons
                                                name="shield-checkmark"
                                                size={20}
                                                color={newUser.role === 'admin' ? '#fff' : '#666'}
                                            />
                                            <Text style={[styles.roleText, newUser.role === 'admin' && styles.roleTextActive]}>Admin</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>

                                <TouchableOpacity
                                    activeOpacity={0.8}
                                    style={styles.submitButtonContainer}
                                    onPress={handleCreateUser}
                                    disabled={creating}
                                >
                                    <LinearGradient
                                        colors={['#6366f1', '#8b5cf6']}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 0 }}
                                        style={styles.submitButton}
                                    >
                                        {creating ? (
                                            <ActivityIndicator color="#fff" />
                                        ) : (
                                            <Text style={styles.submitButtonText}>Create Account</Text>
                                        )}
                                    </LinearGradient>
                                </TouchableOpacity>
                            </ScrollView>
                        </LinearGradient>
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
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        gap: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#2d2d44',
    },
    searchSection: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        paddingHorizontal: 12,
        height: 50,
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: '#fff',
    },
    addButton: {
        shadowColor: "#6366f1",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    addButtonGradient: {
        width: 50,
        height: 50,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    list: {
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 40,
    },
    cardContainer: {
        marginBottom: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
    },
    userCard: {
        borderRadius: 20,
        padding: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    blockedCardBorder: {
        borderColor: 'rgba(239, 68, 68, 0.3)',
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    userInfoLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    avatar: {
        width: 56,
        height: 56,
        borderRadius: 20,
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    avatarPlaceholder: {
        width: 56,
        height: 56,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    avatarText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
    },
    textContainer: {
        flex: 1,
        marginLeft: 16,
    },
    userName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 4,
    },
    userEmail: {
        fontSize: 14,
        color: '#a1a1aa',
        marginBottom: 8,
    },
    badgesRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    adminBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(251, 191, 36, 0.15)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: 'rgba(251, 191, 36, 0.3)',
    },
    adminBadgeText: {
        color: '#fbbf24',
        fontSize: 11,
        fontWeight: '700',
    },
    blockedBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(239, 68, 68, 0.15)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: 'rgba(239, 68, 68, 0.3)',
    },
    blockedText: {
        color: '#ef4444',
        fontSize: 11,
        fontWeight: '700',
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.05)',
    },
    metaText: {
        fontSize: 13,
        color: '#888',
        fontWeight: '500',
    },
    actionButtons: {
        flexDirection: 'row',
        gap: 8,
    },
    iconButton: {
        width: 36,
        height: 36,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },

    // Empty State
    emptyContainer: {
        alignItems: 'center',
        paddingTop: 80,
        opacity: 0.5,
    },
    emptyText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
        marginTop: 16,
        marginBottom: 8,
    },
    emptySubText: {
        fontSize: 14,
        color: '#888',
    },

    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.8)',
        justifyContent: 'center',
        padding: 20,
    },
    modalContent: {
        borderRadius: 24,
        overflow: 'hidden',
        width: '100%',
        maxHeight: '90%',
    },
    modalGradient: {
        padding: 24,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
    },
    closeButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(255,255,255,0.05)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    formScroll: {
        maxHeight: 500,
    },
    formGroup: {
        marginBottom: 20,
    },
    label: {
        color: '#a1a1aa',
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
        marginLeft: 4,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.2)',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        paddingHorizontal: 16,
    },
    inputIcon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        paddingVertical: 16,
        color: '#fff',
        fontSize: 16,
    },
    roleContainer: {
        flexDirection: 'row',
        gap: 16,
    },
    roleOption: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        backgroundColor: 'rgba(0,0,0,0.2)',
        gap: 8,
    },
    roleActive: {
        borderColor: '#6366f1',
        backgroundColor: 'rgba(99, 102, 241, 0.2)',
    },
    roleText: {
        color: '#666',
        fontWeight: '600',
        fontSize: 16,
    },
    roleTextActive: {
        color: '#fff',
    },
    submitButtonContainer: {
        marginTop: 12,
        shadowColor: "#6366f1",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
    },
    submitButton: {
        padding: 20,
        borderRadius: 16,
        alignItems: 'center',
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        letterSpacing: 0.5,
    },
});

export default UserManagementScreen;
