import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    ScrollView,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { tryonAPI } from '../../api';
import { saveImageToGallery } from '../../utils/imageSaver';

const TryOnScreen = ({ navigation, route }) => {
    const [personImage, setPersonImage] = useState(null);
    const [selectedGarment, setSelectedGarment] = useState(null);
    const [resultImage, setResultImage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1); // 1: upload, 2: select garment, 3: processing, 4: result

    // Check for garment passed from details screen
    React.useEffect(() => {
        if (route.params?.selectedGarment) {
            setSelectedGarment(route.params.selectedGarment);
            // If we already have a person image, ensure we are on step 2
            if (personImage) {
                setStep(2);
            }
            // If we have an image already, go to step 2, otherwise stay at step 1 (or 2 if we allow garment first)
            // But since step 1 is upload photo, we should probably stay there or move to step 2 if photo exists?
            // Actually logically, if we come from details, we have a garment.
            // If we don't have a person image yet, we need one.
            // The current flow: Step 1 (Photo) -> Step 2 (Garment + Photo view).

            // If we select a garment first (from details), we still need either a photo or to prompt for one.
            // Let's check logic.
            // If personImage is null, we stay on Step 1? But user expects to see their garment selected.
            // Maybe we can update logic to show garment is pre-selected even in Step 1?
            // Or better, if we have a garment, we can just ensure that when we DO get a photo, we are good.
        }
    }, [route.params?.selectedGarment]);

    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission needed', 'Please grant photo library access');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [3, 4],
            quality: 0.8,
        });

        if (!result.canceled) {
            setPersonImage(result.assets[0].uri);
            setStep(2);
        }
    };

    const takePhoto = async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission needed', 'Please grant camera access');
            return;
        }

        const result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [3, 4],
            quality: 0.8,
        });

        if (!result.canceled) {
            setPersonImage(result.assets[0].uri);
            setStep(2);
        }
    };

    const selectGarment = () => {
        navigation.navigate('GarmentSelection', {
            selectMode: true,
            onSelect: (garment) => {
                setSelectedGarment(garment);
            },
        });
    };

    const startTryOn = async () => {
        if (!personImage || !selectedGarment) {
            Alert.alert('Error', 'Please select both your photo and a garment');
            return;
        }

        setLoading(true);
        setStep(3);

        try {
            const response = await tryonAPI.initiateTryOn(personImage, selectedGarment._id);

            if (response.success) {
                setResultImage(response.data.outputImageUrl);
                setStep(4);
            } else {
                throw new Error(response.message || 'Try-on failed');
            }
        } catch (error) {
            Alert.alert('Error', error.response?.data?.message || error.message || 'Try-on failed');
            setStep(2);
        } finally {
            setLoading(false);
        }
    };

    const resetTryOn = () => {
        setPersonImage(null);
        setSelectedGarment(null);
        setResultImage(null);
        setStep(1);
    };

    const renderStep1 = () => (
        <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Upload Your Photo</Text>
            <Text style={styles.stepDescription}>
                Take a photo or upload from gallery for best results
            </Text>

            <View style={styles.uploadContainer}>
                <TouchableOpacity style={styles.uploadButton} onPress={takePhoto}>
                    <Text style={styles.uploadIcon}>📷</Text>
                    <Text style={styles.uploadText}>Take Photo</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
                    <Text style={styles.uploadIcon}>🖼️</Text>
                    <Text style={styles.uploadText}>Choose from Gallery</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.tipsCard}>
                <Text style={styles.tipsTitle}>📌 Tips for best results:</Text>
                <Text style={styles.tipsText}>• Stand straight, facing the camera</Text>
                <Text style={styles.tipsText}>• Wear fitted clothing</Text>
                <Text style={styles.tipsText}>• Good lighting, plain background</Text>
            </View>
        </View>
    );

    const renderStep2 = () => (
        <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Select Garment</Text>

            <View style={styles.selectionRow}>
                <View style={styles.selectionCard}>
                    <Text style={styles.selectionLabel}>Your Photo</Text>
                    <Image source={{ uri: personImage }} style={styles.previewImage} />
                    <TouchableOpacity style={styles.changeButton} onPress={pickImage}>
                        <Text style={styles.changeText}>Change</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.selectionCard}>
                    <Text style={styles.selectionLabel}>Garment</Text>
                    {selectedGarment ? (
                        <>
                            <Image source={{ uri: selectedGarment.imageUrl }} style={styles.previewImage} />
                            <TouchableOpacity style={styles.changeButton} onPress={selectGarment}>
                                <Text style={styles.changeText}>Change</Text>
                            </TouchableOpacity>
                        </>
                    ) : (
                        <TouchableOpacity style={styles.selectGarmentButton} onPress={selectGarment}>
                            <Text style={styles.selectGarmentIcon}>👗</Text>
                            <Text style={styles.selectGarmentText}>Tap to select</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            <TouchableOpacity
                style={[
                    styles.tryOnButton,
                    (!personImage || !selectedGarment) && styles.tryOnButtonDisabled,
                ]}
                onPress={startTryOn}
                disabled={!personImage || !selectedGarment}
            >
                <Text style={styles.tryOnButtonText}>✨ Start Virtual Try-On</Text>
            </TouchableOpacity>
        </View>
    );

    const renderStep3 = () => (
        <View style={styles.processingContainer}>
            <ActivityIndicator size="large" color="#6366f1" />
            <Text style={styles.processingTitle}>Processing...</Text>
            <Text style={styles.processingText}>
                Our AI is generating your virtual try-on.{'\n'}This may take up to 2 minutes.
            </Text>
        </View>
    );

    const renderStep4 = () => (
        <ScrollView style={styles.stepContainer} showsVerticalScrollIndicator={false}>
            <Text style={styles.stepTitle}>Your Try-On Result</Text>

            <View style={styles.resultContainer}>
                <Image source={{ uri: resultImage }} style={styles.resultImage} />
            </View>

            <View style={styles.comparisonRow}>
                <View style={styles.comparisonItem}>
                    <Image source={{ uri: personImage }} style={styles.comparisonImage} />
                    <Text style={styles.comparisonLabel}>Original</Text>
                </View>
                <View style={styles.comparisonItem}>
                    <Image source={{ uri: selectedGarment.imageUrl }} style={styles.comparisonImage} />
                    <Text style={styles.comparisonLabel}>Garment</Text>
                </View>
            </View>

            <TouchableOpacity style={styles.newTryOnButton} onPress={resetTryOn}>
                <Text style={styles.newTryOnText}>🔄 Try Another</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.saveButton} onPress={() => saveImageToGallery(resultImage)}>
                <Text style={styles.saveButtonText}>💾 Save Image</Text>
            </TouchableOpacity>
        </ScrollView>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Virtual Try-On</Text>
                {step > 1 && step < 4 && (
                    <TouchableOpacity onPress={resetTryOn}>
                        <Text style={styles.resetText}>Reset</Text>
                    </TouchableOpacity>
                )}
            </View>

            {step !== 3 && (
                <View style={styles.progressBar}>
                    {[1, 2, 3, 4].map((s) => (
                        <View
                            key={s}
                            style={[
                                styles.progressDot,
                                s <= step && styles.progressDotActive,
                            ]}
                        />
                    ))}
                </View>
            )}

            {step === 1 && renderStep1()}
            {step === 2 && renderStep2()}
            {step === 3 && renderStep3()}
            {step === 4 && renderStep4()}
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
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
    },
    resetText: {
        color: '#6366f1',
        fontSize: 16,
        fontWeight: '600',
    },
    progressBar: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 20,
    },
    progressDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#2d2d44',
        marginHorizontal: 4,
    },
    progressDotActive: {
        backgroundColor: '#6366f1',
        width: 24,
    },
    stepContainer: {
        flex: 1,
        paddingHorizontal: 20,
    },
    stepTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#fff',
        marginBottom: 8,
        textAlign: 'center',
    },
    stepDescription: {
        fontSize: 14,
        color: '#888',
        textAlign: 'center',
        marginBottom: 24,
    },
    uploadContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 24,
    },
    uploadButton: {
        flex: 1,
        backgroundColor: '#1a1a2e',
        borderRadius: 16,
        padding: 24,
        alignItems: 'center',
        marginHorizontal: 8,
        borderWidth: 1,
        borderColor: '#2d2d44',
    },
    uploadIcon: {
        fontSize: 40,
        marginBottom: 12,
    },
    uploadText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '500',
    },
    tipsCard: {
        backgroundColor: '#1a1a2e',
        borderRadius: 16,
        padding: 20,
        borderWidth: 1,
        borderColor: '#2d2d44',
    },
    tipsTitle: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 12,
    },
    tipsText: {
        color: '#888',
        fontSize: 14,
        marginBottom: 6,
    },
    selectionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 24,
    },
    selectionCard: {
        flex: 1,
        marginHorizontal: 8,
        alignItems: 'center',
    },
    selectionLabel: {
        color: '#888',
        fontSize: 14,
        marginBottom: 12,
    },
    previewImage: {
        width: '100%',
        aspectRatio: 0.75,
        borderRadius: 16,
        backgroundColor: '#2d2d44',
    },
    changeButton: {
        marginTop: 8,
    },
    changeText: {
        color: '#6366f1',
        fontSize: 14,
        fontWeight: '600',
    },
    selectGarmentButton: {
        width: '100%',
        aspectRatio: 0.75,
        backgroundColor: '#1a1a2e',
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#6366f1',
        borderStyle: 'dashed',
    },
    selectGarmentIcon: {
        fontSize: 40,
        marginBottom: 12,
    },
    selectGarmentText: {
        color: '#6366f1',
        fontSize: 14,
        fontWeight: '600',
    },
    tryOnButton: {
        backgroundColor: '#6366f1',
        borderRadius: 12,
        padding: 18,
        alignItems: 'center',
    },
    tryOnButtonDisabled: {
        opacity: 0.5,
    },
    tryOnButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
    },
    processingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    processingTitle: {
        fontSize: 24,
        fontWeight: '600',
        color: '#fff',
        marginTop: 24,
        marginBottom: 12,
    },
    processingText: {
        fontSize: 14,
        color: '#888',
        textAlign: 'center',
        lineHeight: 22,
    },
    resultContainer: {
        alignItems: 'center',
        marginBottom: 20,
    },
    resultImage: {
        width: '100%',
        aspectRatio: 0.75,
        borderRadius: 20,
        backgroundColor: '#2d2d44',
    },
    comparisonRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 24,
    },
    comparisonItem: {
        alignItems: 'center',
        marginHorizontal: 12,
    },
    comparisonImage: {
        width: 80,
        height: 100,
        borderRadius: 8,
        backgroundColor: '#2d2d44',
    },
    comparisonLabel: {
        color: '#888',
        fontSize: 12,
        marginTop: 8,
    },
    newTryOnButton: {
        backgroundColor: '#1a1a2e',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#6366f1',
        marginBottom: 40,
    },
    newTryOnText: {
        color: '#6366f1',
        fontSize: 16,
        fontWeight: '600',
    },
    saveButton: {
        backgroundColor: '#10b981',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        marginBottom: 40,
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});

export default TryOnScreen;
