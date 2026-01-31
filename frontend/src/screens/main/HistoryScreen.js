import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Image,
    ActivityIndicator,
    RefreshControl,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { tryonAPI } from '../../api';

const HistoryScreen = ({ navigation }) => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    useEffect(() => {
        loadHistory();
    }, []);

    const loadHistory = async (reset = false) => {
        if (!reset && !hasMore) return;

        try {
            const currentPage = reset ? 1 : page;
            const response = await tryonAPI.getHistory(currentPage, 20);

            if (reset) {
                setHistory(response.data);
                setPage(2);
            } else {
                setHistory(prev => [...prev, ...response.data]);
                setPage(currentPage + 1);
            }

            setHasMore(response.data.length === 20);
        } catch (error) {
            Alert.alert('Error', 'Failed to load history');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        loadHistory(true);
    }, []);

    const deleteItem = async (id) => {
        Alert.alert(
            'Delete Try-On',
            'Are you sure you want to delete this try-on result?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await tryonAPI.deleteTryOnResult(id);
                            setHistory(prev => prev.filter(item => item._id !== id));
                        } catch (error) {
                            Alert.alert('Error', 'Failed to delete');
                        }
                    },
                },
            ]
        );
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={styles.historyCard}
            onPress={() => navigation.navigate('TryOnDetail', { tryOn: item })}
        >
            <View style={styles.imagesRow}>
                <View style={styles.imageContainer}>
                    <Image source={{ uri: item.inputImageUrl }} style={styles.smallImage} />
                    <Text style={styles.imageLabel}>Input</Text>
                </View>
                <Text style={styles.arrow}>→</Text>
                <View style={styles.imageContainer}>
                    <Image
                        source={{ uri: item.garmentId?.imageUrl }}
                        style={styles.smallImage}
                    />
                    <Text style={styles.imageLabel}>Garment</Text>
                </View>
                <Text style={styles.arrow}>→</Text>
                <View style={styles.imageContainer}>
                    <Image source={{ uri: item.outputImageUrl }} style={styles.smallImage} />
                    <Text style={styles.imageLabel}>Result</Text>
                </View>
            </View>

            <View style={styles.cardFooter}>
                <View>
                    <Text style={styles.garmentName}>{item.garmentId?.name || 'Unknown'}</Text>
                    <Text style={styles.date}>{formatDate(item.createdAt)}</Text>
                </View>
                <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => deleteItem(item._id)}
                >
                    <Text style={styles.deleteIcon}>🗑️</Text>
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#6366f1" />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Try-On History</Text>
                <Text style={styles.subtitle}>{history.length} results</Text>
            </View>

            <FlatList
                data={history}
                keyExtractor={(item) => item._id}
                renderItem={renderItem}
                contentContainerStyle={styles.list}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6366f1" />
                }
                onEndReached={() => loadHistory()}
                onEndReachedThreshold={0.5}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyIcon}>📜</Text>
                        <Text style={styles.emptyTitle}>No try-ons yet</Text>
                        <Text style={styles.emptyText}>Your virtual try-on results will appear here</Text>
                    </View>
                }
                ListFooterComponent={
                    hasMore && history.length > 0 ? (
                        <ActivityIndicator style={{ padding: 20 }} color="#6366f1" />
                    ) : null
                }
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0f0f23',
    },
    header: {
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 16,
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
    list: {
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    historyCard: {
        backgroundColor: '#1a1a2e',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
    },
    imagesRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    imageContainer: {
        alignItems: 'center',
    },
    smallImage: {
        width: 70,
        height: 90,
        borderRadius: 8,
        backgroundColor: '#2d2d44',
    },
    imageLabel: {
        fontSize: 10,
        color: '#888',
        marginTop: 4,
    },
    arrow: {
        fontSize: 20,
        color: '#6366f1',
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: '#2d2d44',
        paddingTop: 12,
    },
    garmentName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#fff',
    },
    date: {
        fontSize: 12,
        color: '#888',
        marginTop: 2,
    },
    deleteButton: {
        padding: 8,
    },
    deleteIcon: {
        fontSize: 18,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 80,
    },
    emptyIcon: {
        fontSize: 64,
        marginBottom: 16,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#fff',
        marginBottom: 8,
    },
    emptyText: {
        fontSize: 14,
        color: '#888',
    },
});

export default HistoryScreen;
