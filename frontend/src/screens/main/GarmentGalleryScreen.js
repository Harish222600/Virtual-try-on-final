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
    Dimensions,
} from 'react-native';

const { width } = Dimensions.get('window');
const CARD_MARGIN = 8;
const LIST_PADDING = 12;
// Calculate precise card width: (Screen - ListPadding*2 - CardMargins*2*NumCols) / NumCols? 
// Actually just: (Screen - ListPadding*2) / 2 - CardMargin*2 is safer?
// Let's do: (Screen - ListPadding*2 - (CARD_MARGIN * 4)) / 2
const cardWidth = (width - (LIST_PADDING * 2) - (CARD_MARGIN * 4)) / 2;
import { SafeAreaView } from 'react-native-safe-area-context';
import { garmentAPI, userAPI } from '../../api';

const GarmentGalleryScreen = ({ navigation, route }) => {
    const [garments, setGarments] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [selectedGender, setSelectedGender] = useState(null);
    const [favorites, setFavorites] = useState([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    const selectMode = route.params?.selectMode;
    const onSelect = route.params?.onSelect;

    useEffect(() => {
        loadData();
        loadFavorites();
    }, []);

    useEffect(() => {
        loadGarments(true);
    }, [selectedCategory, selectedGender, search]);

    const loadData = async () => {
        try {
            const catResponse = await garmentAPI.getCategories();
            setCategories(catResponse.data);
        } catch (error) {
            console.log('Error loading categories:', error);
        }
    };

    const loadFavorites = async () => {
        try {
            const response = await userAPI.getFavorites();
            setFavorites(response.data.map(g => g._id));
        } catch (error) {
            console.log('Error loading favorites:', error);
        }
    };

    const loadGarments = async (reset = false) => {
        if (!reset && !hasMore) return;

        try {
            const currentPage = reset ? 1 : page;
            const params = { page: currentPage, limit: 20 };

            if (selectedCategory) params.category = selectedCategory;
            if (selectedGender) params.gender = selectedGender;
            if (search.trim()) params.search = search.trim();

            const response = await garmentAPI.getGarments(params);

            if (reset) {
                setGarments(response.data);
                setPage(2);
            } else {
                setGarments(prev => [...prev, ...response.data]);
                setPage(currentPage + 1);
            }

            setHasMore(response.data.length === 20);
        } catch (error) {
            Alert.alert('Error', 'Failed to load garments');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        loadGarments(true);
    }, [selectedCategory, selectedGender, search]);

    const toggleFavorite = async (garmentId) => {
        try {
            if (favorites.includes(garmentId)) {
                await userAPI.removeFromFavorites(garmentId);
                setFavorites(prev => prev.filter(id => id !== garmentId));
            } else {
                await userAPI.addToFavorites(garmentId);
                setFavorites(prev => [...prev, garmentId]);
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to update favorites');
        }
    };

    const handleSelect = (garment) => {
        if (selectMode && onSelect) {
            onSelect(garment);
            navigation.goBack();
        }
    };

    const genderFilters = [
        { label: 'All', value: null },
        { label: 'Male', value: 'male' },
        { label: 'Female', value: 'female' },
        { label: 'Unisex', value: 'unisex' },
    ];

    const renderGarment = ({ item }) => (
        <TouchableOpacity
            style={styles.garmentCard}
            onPress={() => selectMode ? handleSelect(item) : navigation.navigate('GarmentDetail', { garment: item })}
        >
            <Image source={{ uri: item.imageUrl }} style={styles.garmentImage} />
            <View style={styles.garmentInfo}>
                <Text style={styles.garmentName} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.garmentCategory}>{item.category}</Text>
            </View>
            {!selectMode && (
                <TouchableOpacity
                    style={styles.favoriteButton}
                    onPress={() => toggleFavorite(item._id)}
                >
                    <Text style={styles.favoriteIcon}>
                        {favorites.includes(item._id) ? '❤️' : '🤍'}
                    </Text>
                </TouchableOpacity>
            )}
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            {!selectMode && (
                <View style={styles.header}>
                    <Text style={styles.title}>Garment Gallery</Text>
                </View>
            )}

            <View style={styles.searchContainer}>
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search garments..."
                    placeholderTextColor="#666"
                    value={search}
                    onChangeText={setSearch}
                />
            </View>

            <View style={styles.filtersContainer}>
                <FlatList
                    horizontal
                    data={genderFilters}
                    keyExtractor={(item) => item.label}
                    showsHorizontalScrollIndicator={false}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={[
                                styles.filterChip,
                                selectedGender === item.value && styles.filterChipActive,
                            ]}
                            onPress={() => setSelectedGender(item.value)}
                        >
                            <Text
                                style={[
                                    styles.filterChipText,
                                    selectedGender === item.value && styles.filterChipTextActive,
                                ]}
                            >
                                {item.label}
                            </Text>
                        </TouchableOpacity>
                    )}
                />
            </View>

            <View style={styles.categoriesContainer}>
                <FlatList
                    horizontal
                    data={[{ name: 'All', count: 0 }, ...categories]}
                    keyExtractor={(item) => item.name}
                    showsHorizontalScrollIndicator={false}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={[
                                styles.categoryChip,
                                (item.name === 'All' ? !selectedCategory : selectedCategory === item.name)
                                && styles.categoryChipActive,
                            ]}
                            onPress={() => setSelectedCategory(item.name === 'All' ? null : item.name)}
                        >
                            <Text
                                style={[
                                    styles.categoryChipText,
                                    (item.name === 'All' ? !selectedCategory : selectedCategory === item.name)
                                    && styles.categoryChipTextActive,
                                ]}
                            >
                                {item.name} {item.count > 0 && `(${item.count})`}
                            </Text>
                        </TouchableOpacity>
                    )}
                />
            </View>

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#6366f1" />
                </View>
            ) : (
                <FlatList
                    data={garments}
                    keyExtractor={(item) => item._id}
                    numColumns={2}
                    renderItem={renderGarment}
                    contentContainerStyle={styles.list}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6366f1" />
                    }
                    onEndReached={() => loadGarments()}
                    onEndReachedThreshold={0.5}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyIcon}>👗</Text>
                            <Text style={styles.emptyText}>No garments found</Text>
                        </View>
                    }
                    ListFooterComponent={
                        hasMore && garments.length > 0 ? (
                            <ActivityIndicator style={{ padding: 20 }} color="#6366f1" />
                        ) : null
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
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
    },
    searchContainer: {
        paddingHorizontal: 20,
        marginBottom: 12,
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
    filtersContainer: {
        paddingLeft: 20,
        marginBottom: 8,
    },
    filterChip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#1a1a2e',
        marginRight: 8,
        borderWidth: 1,
        borderColor: '#2d2d44',
    },
    filterChipActive: {
        backgroundColor: '#6366f1',
        borderColor: '#6366f1',
    },
    filterChipText: {
        color: '#888',
        fontSize: 14,
        fontWeight: '500',
    },
    filterChipTextActive: {
        color: '#fff',
    },
    categoriesContainer: {
        paddingLeft: 20,
        marginBottom: 16,
    },
    categoryChip: {
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 16,
        backgroundColor: '#1a1a2e',
        marginRight: 8,
    },
    categoryChipActive: {
        backgroundColor: '#ec4899',
    },
    categoryChipText: {
        color: '#888',
        fontSize: 13,
    },
    categoryChipTextActive: {
        color: '#fff',
        fontWeight: '600',
    },
    list: {
        paddingHorizontal: 12,
        paddingBottom: 20,
    },
    garmentCard: {
        width: cardWidth,
        margin: CARD_MARGIN,
        backgroundColor: '#1a1a2e',
        borderRadius: 16,
        overflow: 'hidden',
    },
    garmentImage: {
        width: '100%',
        aspectRatio: 0.75,
        backgroundColor: '#2d2d44',
    },
    garmentInfo: {
        padding: 12,
    },
    garmentName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#fff',
        marginBottom: 4,
    },
    garmentCategory: {
        fontSize: 12,
        color: '#888',
        textTransform: 'capitalize',
    },
    favoriteButton: {
        position: 'absolute',
        top: 8,
        right: 8,
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    favoriteIcon: {
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

export default GarmentGalleryScreen;
