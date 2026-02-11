import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    ActivityIndicator,
    Image,
    RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { adminAPI } from '../../api';

const GarmentUsageScreen = () => {
    const [garments, setGarments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const loadData = async () => {
        try {
            const response = await adminAPI.getGarmentUsage();
            setGarments(response.data);
        } catch (error) {
            console.error('Failed to load garment usage', error);
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
        <View style={styles.card}>
            <View style={styles.rankContainer}>
                <Text style={styles.rankText}>#{index + 1}</Text>
            </View>
            <Image
                source={{ uri: item.imageUrl }}
                style={styles.image}
                resizeMode="cover"
            />
            <View style={styles.infoContainer}>
                <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.category}>{item.category} • {item.gender}</Text>
            </View>
            <View style={styles.statsContainer}>
                <Text style={styles.statsValue}>{item.tryOnCount}</Text>
                <Text style={styles.statsLabel}>Try-Ons</Text>
            </View>
        </View>
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
                data={garments}
                renderItem={renderItem}
                keyExtractor={item => item._id}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6366f1" />
                }
                ListHeaderComponent={() => (
                    <View style={styles.header}>
                        <Text style={styles.title}>Most Popular Garments</Text>
                        <Text style={styles.subtitle}>Ranked by number of virtual try-ons</Text>
                    </View>
                )}
                ListEmptyComponent={() => (
                    <Text style={styles.emptyText}>No usage data available.</Text>
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
    image: {
        width: 50,
        height: 50,
        borderRadius: 8,
        backgroundColor: '#2d2d44',
    },
    infoContainer: {
        flex: 1,
        marginLeft: 12,
        justifyContent: 'center',
    },
    name: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    category: {
        color: '#888',
        fontSize: 12,
        textTransform: 'capitalize',
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

export default GarmentUsageScreen;
