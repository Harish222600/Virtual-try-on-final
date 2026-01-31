import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    FlatList,
    Dimensions,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { garmentAPI } from '../../api';

const { width } = Dimensions.get('window');

const HomeScreen = ({ navigation }) => {
    const { user } = useAuth();
    const [trendingGarments, setTrendingGarments] = useState([]);

    useEffect(() => {
        loadTrending();
    }, []);

    const loadTrending = async () => {
        try {
            // Fetch some garments to show as "Trending" - just getting page 1
            const response = await garmentAPI.getGarments({ page: 1, limit: 5 });
            setTrendingGarments(response.data);
        } catch (error) {
            console.log('Error loading trending:', error);
        }
    };

    const features = [
        {
            id: 'tryon',
            title: 'Virtual Try-On',
            description: 'AI-powered fitting',
            icon: 'shirt',
            screen: 'TryOnStack',
            colors: ['#6366f1', '#818cf8'],
        },
        {
            id: 'gallery',
            title: 'Gallery',
            description: 'Browse collection',
            icon: 'grid',
            screen: 'Gallery',
            colors: ['#ec4899', '#f472b6'],
        },
        {
            id: 'history',
            title: 'History',
            description: 'Past results',
            icon: 'time',
            screen: 'History',
            colors: ['#10b981', '#34d399'],
        },
        {
            id: 'profile',
            title: 'Profile',
            description: 'My account',
            icon: 'person',
            screen: 'Profile',
            colors: ['#f59e0b', '#fbbf24'],
        },
    ];

    const renderTrendingItem = ({ item }) => (
        <TouchableOpacity
            style={styles.trendingCard}
            onPress={() => navigation.navigate('GarmentDetail', { garment: item })}
        >
            <Image source={{ uri: item.imageUrl }} style={styles.trendingImage} />
            <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.8)']}
                style={styles.trendingOverlay}
            >
                <Text style={styles.trendingName} numberOfLines={1}>{item.name}</Text>
            </LinearGradient>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
                {/* Header */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.greeting}>Welcome back,</Text>
                        <Text style={styles.userName}>{user?.name?.split(' ')[0] || 'User'} 👋</Text>
                    </View>
                    <TouchableOpacity
                        style={styles.profileButton}
                        onPress={() => navigation.navigate('Profile')}
                    >
                        {user?.profileImage ? (
                            <Image source={{ uri: user.profileImage }} style={styles.profileImage} />
                        ) : (
                            <View style={styles.profilePlaceholder}>
                                <Text style={styles.profileInitial}>{user?.name?.[0]?.toUpperCase() || 'U'}</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                </View>

                {/* Hero Section */}
                <View style={styles.heroContainer}>
                    <LinearGradient
                        colors={['#4f46e5', '#7c3aed']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.heroCard}
                    >
                        <View style={styles.heroContent}>
                            <View style={styles.heroBadge}>
                                <Text style={styles.heroBadgeText}>NEW AI MODEL</Text>
                            </View>
                            <Text style={styles.heroTitle}>Experience Virtual Fashion</Text>
                            <Text style={styles.heroSubtitle}>
                                Try on any outfit instantly with our advanced AI technology.
                            </Text>
                            <TouchableOpacity
                                style={styles.heroButton}
                                onPress={() => navigation.navigate('TryOnStack')}
                            >
                                <Text style={styles.heroButtonText}>Start Try-On</Text>
                                <Ionicons name="arrow-forward" size={16} color="#4f46e5" />
                            </TouchableOpacity>
                        </View>
                        <View style={styles.heroIconContainer}>
                            <Ionicons name="sparkles" size={80} color="rgba(255,255,255,0.2)" />
                        </View>
                    </LinearGradient>
                </View>

                {/* Quick Actions */}
                <Text style={styles.sectionTitle}>Quick Actions</Text>
                <View style={styles.featuresGrid}>
                    {features.map((feature) => (
                        <TouchableOpacity
                            key={feature.id}
                            style={styles.featureCard}
                            onPress={() => navigation.navigate(feature.screen)}
                        >
                            <LinearGradient
                                colors={feature.colors}
                                style={styles.featureIcon}
                            >
                                <Ionicons name={feature.icon} size={24} color="#fff" />
                            </LinearGradient>
                            <View>
                                <Text style={styles.featureTitle}>{feature.title}</Text>
                                <Text style={styles.featureDescription}>{feature.description}</Text>
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Featured / Trending */}
                <View style={styles.trendingSection}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Trending Now</Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Gallery')}>
                            <Text style={styles.seeAllText}>See All</Text>
                        </TouchableOpacity>
                    </View>

                    <FlatList
                        horizontal
                        data={trendingGarments}
                        renderItem={renderTrendingItem}
                        keyExtractor={item => item._id}
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.trendingList}
                        ListEmptyComponent={
                            <View style={[styles.trendingCard, styles.trendingPlaceholder]}>
                                <ActivityIndicator color="#6366f1" />
                            </View>
                        }
                    />
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

// Styles remain mostly similar but enhanced
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
    greeting: {
        fontSize: 14,
        color: '#9ca3af',
        marginBottom: 4,
    },
    userName: {
        fontSize: 24,
        fontWeight: '700',
        color: '#fff',
    },
    profileButton: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    profileImage: {
        width: 44,
        height: 44,
        borderRadius: 22,
        borderWidth: 2,
        borderColor: '#6366f1',
    },
    profilePlaceholder: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#1a1a2e',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#6366f1',
    },
    profileInitial: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#6366f1',
    },
    heroContainer: {
        paddingHorizontal: 20,
        marginBottom: 28,
    },
    heroCard: {
        borderRadius: 24,
        padding: 24,
        position: 'relative',
        overflow: 'hidden',
        minHeight: 180,
    },
    heroContent: {
        zIndex: 2,
        flex: 1,
    },
    heroBadge: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        alignSelf: 'flex-start',
        marginBottom: 12,
    },
    heroBadgeText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    heroTitle: {
        fontSize: 24,
        fontWeight: '800',
        color: '#fff',
        marginBottom: 8,
        lineHeight: 32,
        maxWidth: '80%',
    },
    heroSubtitle: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.8)',
        marginBottom: 20,
        maxWidth: '75%',
        lineHeight: 20,
    },
    heroButton: {
        backgroundColor: '#fff',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 14,
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
    },
    heroButtonText: {
        color: '#4f46e5',
        fontWeight: '700',
        fontSize: 14,
        marginRight: 8,
    },
    heroIconContainer: {
        position: 'absolute',
        right: -20,
        bottom: -20,
        zIndex: 1,
        transform: [{ rotate: '-15deg' }],
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#fff',
        paddingHorizontal: 20,
        marginBottom: 16,
    },
    featuresGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: 12,
        marginBottom: 28,
    },
    featureCard: {
        width: '45%',
        margin: '2.5%',
        padding: 16,
        backgroundColor: '#1a1a2e',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#2d2d44',
        flexDirection: 'column',
        alignItems: 'flex-start',
    },
    featureIcon: {
        width: 48,
        height: 48,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    featureTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#fff',
        marginBottom: 4,
    },
    featureDescription: {
        fontSize: 12,
        color: '#9ca3af',
    },
    trendingSection: {
        marginBottom: 20,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 16,
    },
    seeAllText: {
        color: '#6366f1',
        fontSize: 14,
        fontWeight: '600',
    },
    trendingList: {
        paddingHorizontal: 14,
    },
    trendingCard: {
        width: 140,
        height: 180,
        marginHorizontal: 6,
        borderRadius: 16,
        overflow: 'hidden',
        backgroundColor: '#1a1a2e',
        position: 'relative',
    },
    trendingImage: {
        width: '100%',
        height: '100%',
        backgroundColor: '#2d2d44',
    },
    trendingOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 12,
        paddingTop: 30,
    },
    trendingName: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    trendingPlaceholder: {
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default HomeScreen;
