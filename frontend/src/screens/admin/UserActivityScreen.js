import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    ActivityIndicator,
    RefreshControl,
    TouchableOpacity
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { adminAPI } from '../../api';

const UserActivityScreen = ({ navigation }) => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const loadData = async () => {
        try {
            const response = await adminAPI.getUserUsage();
            setUsers(response.data);
        } catch (error) {
            console.error('Failed to load user usage', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        loadData();
    };

    const renderItem = ({ item, index }) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('UserDetail', { userId: item._id })}
        >
            <View style={styles.rankContainer}>
                <Text style={styles.rankText}>#{index + 1}</Text>
            </View>
            <View style={styles.avatarContainer}>
                <Ionicons name="person-circle" size={40} color="#6366f1" />
            </View>
            <View style={styles.infoContainer}>
                <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.email} numberOfLines={1}>{item.email}</Text>
            </View>
            <View style={styles.statsContainer}>
                <Text style={styles.statsValue}>{item.tryOnCount}</Text>
                <Text style={styles.statsLabel}>Try-Ons</Text>
            </View>
        </TouchableOpacity>
    );

    if (loading && !refreshing) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#6366f1" />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={['bottom']}>
            <FlatList
                data={users}
                renderItem={renderItem}
                keyExtractor={item => item._id}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6366f1" />
                }
                ListHeaderComponent={() => (
                    <View style={styles.header}>
                        <Text style={styles.title}>Most Active Users</Text>
                        <Text style={styles.subtitle}>Ranked by number of virtual try-ons</Text>
                    </View>
                )}
                ListEmptyComponent={() => (
                    <Text style={styles.emptyText}>No activity data available.</Text>
                )}
            />
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
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
    },
    subtitle: {
        fontSize: 14,
        color: '#888',
        marginTop: 4,
    },
    listContent: {
        paddingBottom: 20,
    },
    card: {
        backgroundColor: '#1a1a2e',
        marginHorizontal: 20,
        marginBottom: 12,
        borderRadius: 12,
        padding: 12,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    rankContainer: {
        width: 30,
        alignItems: 'center',
        marginRight: 10,
    },
    rankText: {
        color: '#888',
        fontWeight: 'bold',
        fontSize: 16,
    },
    avatarContainer: {
        marginRight: 12,
    },
    infoContainer: {
        flex: 1,
        justifyContent: 'center',
    },
    name: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    email: {
        color: '#888',
        fontSize: 12,
    },
    statsContainer: {
        alignItems: 'center',
        paddingLeft: 10,
        minWidth: 60,
    },
    statsValue: {
        color: '#6366f1',
        fontSize: 18,
        fontWeight: 'bold',
    },
    statsLabel: {
        color: '#888',
        fontSize: 10,
    },
    emptyText: {
        color: '#888',
        textAlign: 'center',
        marginTop: 40,
    },
});

export default UserActivityScreen;
