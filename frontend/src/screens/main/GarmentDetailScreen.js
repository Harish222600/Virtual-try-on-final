import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    ScrollView,
    TouchableOpacity,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const GarmentDetailScreen = ({ route, navigation }) => {
    const { garment } = route.params;

    const handleTryOn = () => {
        // Navigate to TryOn screen within the tabs, passing the selected garment
        // We navigate to the 'TryOn' tab, which is nested inside 'MainTabs'
        navigation.navigate('MainTabs', {
            screen: 'TryOn',
            params: { selectedGarment: garment },
        });
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false}>
                <Image source={{ uri: garment.imageUrl }} style={styles.image} />

                <View style={styles.content}>
                    <View style={styles.header}>
                        <Text style={styles.title}>{garment.name}</Text>
                        <View style={styles.badge}>
                            <Text style={styles.badgeText}>{garment.category}</Text>
                        </View>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Description</Text>
                        <Text style={styles.description}>
                            {garment.description || 'No description available for this garment.'}
                        </Text>
                    </View>

                    <View style={styles.detailsRow}>
                        <View style={styles.detailItem}>
                            <Text style={styles.detailLabel}>Gender</Text>
                            <Text style={styles.detailValue}>{garment.gender || 'Unisex'}</Text>
                        </View>
                        <View style={styles.detailItem}>
                            <Text style={styles.detailLabel}>Added On</Text>
                            <Text style={styles.detailValue}>
                                {new Date(garment.createdAt).toLocaleDateString()}
                            </Text>
                        </View>
                    </View>
                </View>
            </ScrollView>

            <View style={styles.footer}>
                <TouchableOpacity style={styles.tryOnButton} onPress={handleTryOn}>
                    <Text style={styles.tryOnButtonText}>✨ Try On This Garment</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0f0f23',
    },
    image: {
        width: '100%',
        height: 400,
        backgroundColor: '#2d2d44',
    },
    content: {
        padding: 20,
    },
    header: {
        marginBottom: 24,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 12,
    },
    badge: {
        alignSelf: 'flex-start',
        backgroundColor: '#1a1a2e',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#6366f1',
    },
    badgeText: {
        color: '#6366f1',
        fontSize: 14,
        fontWeight: '600',
        textTransform: 'capitalize',
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#fff',
        marginBottom: 8,
    },
    description: {
        fontSize: 16,
        color: '#ccc',
        lineHeight: 24,
    },
    detailsRow: {
        flexDirection: 'row',
        marginBottom: 24,
        backgroundColor: '#1a1a2e',
        borderRadius: 16,
        padding: 16,
    },
    detailItem: {
        flex: 1,
    },
    detailLabel: {
        fontSize: 12,
        color: '#888',
        marginBottom: 4,
    },
    detailValue: {
        fontSize: 16,
        color: '#fff',
        fontWeight: '500',
        textTransform: 'capitalize',
    },
    footer: {
        padding: 20,
        backgroundColor: '#0f0f23',
        borderTopWidth: 1,
        borderTopColor: '#1a1a2e',
    },
    tryOnButton: {
        backgroundColor: '#6366f1',
        padding: 18,
        borderRadius: 16,
        alignItems: 'center',
    },
    tryOnButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
    },
});

export default GarmentDetailScreen;
