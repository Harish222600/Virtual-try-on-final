import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { adminAPI } from '../../api/admin';
import { LinearGradient } from 'expo-linear-gradient';

const SystemSettingsScreen = ({ navigation }) => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [config, setConfig] = useState({ activeModel: 'IDM-VTON' });

    useEffect(() => {
        loadConfig();
    }, []);

    const loadConfig = async () => {
        try {
            const response = await adminAPI.getSystemConfig();
            setConfig(response.data);
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Failed to load system configuration');
        } finally {
            setLoading(false);
        }
    };

    const handleModelChange = async (model) => {
        if (model === config.activeModel) return;

        setSaving(true);
        try {
            const response = await adminAPI.updateSystemConfig({ activeModel: model });
            setConfig(response.data);
            Alert.alert('Success', `Active model switched to ${model}`);
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Failed to update configuration');
        } finally {
            setSaving(false);
        }
    };

    const ModelOption = ({ id, name, description, isSelected }) => (
        <TouchableOpacity
            style={[styles.optionCard, isSelected && styles.optionCardSelected]}
            onPress={() => handleModelChange(id)}
            disabled={saving}
        >
            <View style={styles.optionHeader}>
                <View style={styles.optionTitleContainer}>
                    <Ionicons
                        name={isSelected ? "radio-button-on" : "radio-button-off"}
                        size={24}
                        color={isSelected ? "#6366f1" : "#888"}
                    />
                    <Text style={[styles.optionTitle, isSelected && styles.optionTitleSelected]}>
                        {name}
                    </Text>
                </View>
                {isSelected && (
                    <View style={styles.activeBadge}>
                        <Text style={styles.activeBadgeText}>Active</Text>
                    </View>
                )}
            </View>
            <Text style={styles.optionDescription}>{description}</Text>
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
        <SafeAreaView style={styles.container} edges={['bottom']}>
            <ScrollView style={styles.content}>
                <Text style={styles.sectionTitle}>AI Model Selection</Text>
                <Text style={styles.sectionSubtitle}>
                    Select the underlying AI model used for virtual try-on generation.
                </Text>

                <View style={styles.optionsContainer}>
                    <ModelOption
                        id="IDM-VTON"
                        name="IDM-VTON (yisol)"
                        description="Robust model particularly good at preserving garment details. Uses descriptive text prompts."
                        isSelected={config.activeModel === 'IDM-VTON'}
                    />

                    <ModelOption
                        id="OOTDiffusion"
                        name="OOTDiffusion (levihsu)"
                        description="Specialized diffusion model with specific handling for upper-body, lower-body, and dresses."
                        isSelected={config.activeModel === 'OOTDiffusion'}
                    />
                </View>

                {saving && (
                    <View style={styles.savingOverlay}>
                        <ActivityIndicator color="#fff" />
                        <Text style={styles.savingText}>Switching Model...</Text>
                    </View>
                )}
            </ScrollView>
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
    },
    content: {
        padding: 20,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 8,
    },
    sectionSubtitle: {
        fontSize: 14,
        color: '#888',
        marginBottom: 24,
        lineHeight: 20,
    },
    optionsContainer: {
        gap: 16,
    },
    optionCard: {
        backgroundColor: '#1a1a2e',
        borderRadius: 16,
        padding: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    optionCardSelected: {
        borderColor: '#6366f1',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
    },
    optionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    optionTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    optionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#ccc',
    },
    optionTitleSelected: {
        color: '#fff',
    },
    activeBadge: {
        backgroundColor: '#10b981',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    activeBadgeText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#000',
    },
    optionDescription: {
        fontSize: 14,
        color: '#888',
        lineHeight: 20,
        paddingLeft: 36,
    },
    savingOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 16,
        flexDirection: 'row',
        gap: 12,
    },
    savingText: {
        color: '#fff',
        fontWeight: '600',
    }
});

export default SystemSettingsScreen;
