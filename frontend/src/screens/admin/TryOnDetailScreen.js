import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    ScrollView,
    TouchableOpacity,
    StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { saveImageToGallery } from '../../utils/imageSaver';

const TryOnDetailScreen = ({ route, navigation }) => {
    const { tryOn } = route.params;

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <SafeAreaView style={styles.container} edges={['bottom']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Try-On Details</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Status Card */}
                <View style={styles.section}>
                    <View style={styles.statusCard}>
                        <View style={[
                            styles.statusBadge,
                            tryOn.status === 'completed' ? styles.statusSuccess :
                                tryOn.status === 'failed' ? styles.statusFailed : styles.statusPending
                        ]}>
                            <Text style={[
                                styles.statusText,
                                tryOn.status === 'completed' ? styles.textSuccess :
                                    tryOn.status === 'failed' ? styles.textFailed : styles.textPending
                            ]}>
                                {tryOn.status.toUpperCase()}
                            </Text>
                        </View>
                        <Text style={styles.dateText}>{formatDate(tryOn.createdAt)}</Text>
                    </View>
                </View>

                {/* Main Result */}
                <View style={styles.resultSection}>
                    <Text style={styles.sectionTitle}>Result</Text>
                    <View style={styles.resultImageContainer}>
                        {tryOn.outputImageUrl ? (
                            <Image source={{ uri: tryOn.outputImageUrl }} style={styles.resultImage} />
                        ) : (
                            <View style={styles.errorContainer}>
                                <Ionicons name="alert-circle-outline" size={48} color="#ef4444" />
                                <Text style={styles.errorText}>
                                    {tryOn.failed ? 'Try-on Failed' : 'Image not available'}
                                </Text>
                            </View>
                        )}
                    </View>
                </View>
                {tryOn.outputImageUrl && (
                    <TouchableOpacity
                        style={styles.saveButton}
                        onPress={() => saveImageToGallery(tryOn.outputImageUrl)}
                    >
                        <Ionicons name="download-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
                        <Text style={styles.saveButtonText}>Save Output</Text>
                    </TouchableOpacity>
                )}


                {/* Inputs Comparison */}
                <View style={styles.inputsSection}>
                    <Text style={styles.sectionTitle}>Inputs</Text>
                    <View style={styles.inputsRow}>
                        <View style={styles.inputItem}>
                            <Text style={styles.inputLabel}>Original Photo</Text>
                            <Image source={{ uri: tryOn.inputImageUrl }} style={styles.inputImage} />
                        </View>

                        <View style={styles.plusIcon}>
                            <Ionicons name="add" size={24} color="#666" />
                        </View>

                        <View style={styles.inputItem}>
                            <Text style={styles.inputLabel}>Garment</Text>
                            <Image
                                source={{ uri: tryOn.garmentId?.imageUrl }}
                                style={styles.inputImage}
                            />
                            <Text style={styles.garmentName} numberOfLines={1}>
                                {tryOn.garmentId?.name || 'Unknown Garment'}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Technical Details */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Technical Details</Text>
                    <View style={styles.detailsCard}>
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Try-On ID</Text>
                            <Text style={styles.detailValue}>{tryOn._id}</Text>
                        </View>
                        {tryOn.processingTime && (
                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>Processing Time</Text>
                                <Text style={styles.detailValue}>{tryOn.processingTime}ms</Text>
                            </View>
                        )}
                        {tryOn.errorMessage && (
                            <View style={styles.errorDetail}>
                                <Text style={styles.errorLabel}>Error Log:</Text>
                                <Text style={styles.errorMessage}>{tryOn.errorMessage}</Text>
                            </View>
                        )}
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView >
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
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: '#1a1a2e',
        borderBottomWidth: 1,
        borderBottomColor: '#2d2d44',
    },
    backButton: {
        padding: 8,
        marginLeft: -8,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#fff',
    },
    section: {
        padding: 20,
        paddingBottom: 0,
    },
    statusCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#1a1a2e',
        padding: 16,
        borderRadius: 12,
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
    },
    statusSuccess: { backgroundColor: 'rgba(16, 185, 129, 0.2)' },
    statusFailed: { backgroundColor: 'rgba(239, 68, 68, 0.2)' },
    statusPending: { backgroundColor: 'rgba(245, 158, 11, 0.2)' },
    statusText: { fontSize: 12, fontWeight: '700' },
    textSuccess: { color: '#10b981' },
    textFailed: { color: '#ef4444' },
    textPending: { color: '#f59e0b' },
    dateText: {
        color: '#888',
        fontSize: 12,
    },
    resultSection: {
        padding: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#fff',
        marginBottom: 16,
    },
    resultImageContainer: {
        width: '100%',
        aspectRatio: 3 / 4,
        backgroundColor: '#1a1a2e',
        borderRadius: 16,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#2d2d44',
    },
    resultImage: {
        width: '100%',
        height: '100%',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorText: {
        color: '#ef4444',
        marginTop: 12,
        fontSize: 14,
    },
    inputsSection: {
        padding: 20,
    },
    inputsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#1a1a2e',
        padding: 16,
        borderRadius: 16,
    },
    inputItem: {
        flex: 1,
        alignItems: 'center',
    },
    inputLabel: {
        color: '#888',
        fontSize: 12,
        marginBottom: 8,
    },
    inputImage: {
        width: 80,
        height: 106, // 3:4 ratio
        borderRadius: 8,
        backgroundColor: '#2d2d44',
        marginBottom: 8,
    },
    plusIcon: {
        padding: 10,
    },
    garmentName: {
        color: '#fff',
        fontSize: 12,
        textAlign: 'center',
        maxWidth: 100,
    },
    detailsCard: {
        backgroundColor: '#1a1a2e',
        borderRadius: 16,
        padding: 16,
        marginBottom: 40,
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
        fontFamily: 'monospace',
    },
    errorDetail: {
        marginTop: 12,
        padding: 12,
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        borderRadius: 8,
    },
    errorLabel: {
        color: '#ef4444',
        fontSize: 12,
        fontWeight: '600',
        marginBottom: 4,
    },
    errorMessage: {
        color: '#ef4444',
        fontSize: 12,
    },
    saveButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#10b981',
        padding: 12,
        borderRadius: 12,
        marginTop: 16,
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});

export default TryOnDetailScreen;
