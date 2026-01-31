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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { adminAPI } from '../../api';

const GarmentManagementScreen = () => {
    const [garments, setGarments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [editingGarment, setEditingGarment] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    // Form state
    const [name, setName] = useState('');
    const [category, setCategory] = useState('shirt');
    const [gender, setGender] = useState('unisex');
    const [fabric, setFabric] = useState('');
    const [color, setColor] = useState('');
    const [description, setDescription] = useState('');
    const [imageUri, setImageUri] = useState(null);

    const categories = ['shirt', 'kurti', 'saree', 'dress', 'pants', 'jacket', 't-shirt', 'blouse', 'sweater', 'other'];
    const genders = ['male', 'female', 'unisex'];

    useEffect(() => {
        loadGarments();
    }, []);

    const loadGarments = async () => {
        try {
            const response = await adminAPI.getAllGarments({ limit: 100 });
            setGarments(response.data);
        } catch (error) {
            Alert.alert('Error', 'Failed to load garments');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        loadGarments();
    }, []);

    const resetForm = () => {
        setName('');
        setCategory('shirt');
        setGender('unisex');
        setFabric('');
        setColor('');
        setDescription('');
        setImageUri(null);
        setEditingGarment(null);
    };

    const openAddModal = () => {
        resetForm();
        setShowModal(true);
    };

    const openEditModal = (garment) => {
        setEditingGarment(garment);
        setName(garment.name);
        setCategory(garment.category);
        setGender(garment.gender);
        setFabric(garment.fabric || '');
        setColor(garment.color || '');
        setDescription(garment.description || '');
        setImageUri(null);
        setShowModal(true);
    };

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [3, 4],
            quality: 0.8,
        });

        if (!result.canceled) {
            setImageUri(result.assets[0].uri);
        }
    };

    const handleSubmit = async () => {
        if (!name.trim()) {
            Alert.alert('Error', 'Name is required');
            return;
        }

        if (!editingGarment && !imageUri) {
            Alert.alert('Error', 'Please select an image');
            return;
        }

        setSubmitting(true);

        try {
            const formData = new FormData();
            formData.append('name', name);
            formData.append('category', category);
            formData.append('gender', gender);
            formData.append('fabric', fabric);
            formData.append('color', color);
            formData.append('description', description);

            if (imageUri) {
                formData.append('image', {
                    uri: imageUri,
                    type: 'image/jpeg',
                    name: 'garment.jpg',
                });
            }

            if (editingGarment) {
                await adminAPI.updateGarment(editingGarment._id, formData);
                Alert.alert('Success', 'Garment updated');
            } else {
                await adminAPI.createGarment(formData);
                Alert.alert('Success', 'Garment created');
            }

            setShowModal(false);
            resetForm();
            loadGarments();
        } catch (error) {
            Alert.alert('Error', error.response?.data?.message || 'Operation failed');
        } finally {
            setSubmitting(false);
        }
    };

    const toggleActive = async (garment) => {
        try {
            const formData = new FormData();
            formData.append('isActive', (!garment.isActive).toString());
            await adminAPI.updateGarment(garment._id, formData);
            setGarments(prev =>
                prev.map(g => g._id === garment._id ? { ...g, isActive: !g.isActive } : g)
            );
        } catch (error) {
            Alert.alert('Error', 'Failed to update garment');
        }
    };

    const deleteGarment = (garmentId, garmentName) => {
        Alert.alert(
            'Delete Garment',
            `Are you sure you want to delete "${garmentName}"?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await adminAPI.deleteGarment(garmentId);
                            setGarments(prev => prev.filter(g => g._id !== garmentId));
                        } catch (error) {
                            Alert.alert('Error', 'Failed to delete garment');
                        }
                    },
                },
            ]
        );
    };

    const renderGarment = ({ item }) => (
        <View style={styles.garmentCard}>
            <Image source={{ uri: item.imageUrl }} style={styles.garmentImage} />
            <View style={styles.garmentInfo}>
                <Text style={styles.garmentName} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.garmentMeta}>{item.category} • {item.gender}</Text>
                {!item.isActive && (
                    <View style={styles.inactiveBadge}>
                        <Text style={styles.inactiveText}>Hidden</Text>
                    </View>
                )}
            </View>
            <View style={styles.garmentActions}>
                <TouchableOpacity style={styles.editBtn} onPress={() => openEditModal(item)}>
                    <Text>✏️</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.toggleBtn} onPress={() => toggleActive(item)}>
                    <Text>{item.isActive ? '👁️' : '👁️‍🗨️'}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.deleteBtn} onPress={() => deleteGarment(item._id, item.name)}>
                    <Text>🗑️</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container} edges={['bottom']}>
            <TouchableOpacity style={styles.addButton} onPress={openAddModal}>
                <Text style={styles.addButtonText}>+ Add New Garment</Text>
            </TouchableOpacity>

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#6366f1" />
                </View>
            ) : (
                <FlatList
                    data={garments}
                    keyExtractor={(item) => item._id}
                    renderItem={renderGarment}
                    contentContainerStyle={styles.list}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6366f1" />
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyIcon}>👗</Text>
                            <Text style={styles.emptyText}>No garments yet</Text>
                        </View>
                    }
                />
            )}

            <Modal visible={showModal} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <ScrollView showsVerticalScrollIndicator={false}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>
                                    {editingGarment ? 'Edit Garment' : 'Add New Garment'}
                                </Text>
                                <TouchableOpacity onPress={() => setShowModal(false)}>
                                    <Text style={styles.closeButton}>✕</Text>
                                </TouchableOpacity>
                            </View>

                            <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
                                {imageUri || editingGarment?.imageUrl ? (
                                    <Image
                                        source={{ uri: imageUri || editingGarment?.imageUrl }}
                                        style={styles.pickedImage}
                                    />
                                ) : (
                                    <>
                                        <Text style={styles.imagePickerIcon}>📷</Text>
                                        <Text style={styles.imagePickerText}>Tap to select image</Text>
                                    </>
                                )}
                            </TouchableOpacity>

                            <Text style={styles.inputLabel}>Name *</Text>
                            <TextInput
                                style={styles.input}
                                value={name}
                                onChangeText={setName}
                                placeholder="Garment name"
                                placeholderTextColor="#666"
                            />

                            <Text style={styles.inputLabel}>Category *</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chips}>
                                {categories.map((cat) => (
                                    <TouchableOpacity
                                        key={cat}
                                        style={[styles.chip, category === cat && styles.chipActive]}
                                        onPress={() => setCategory(cat)}
                                    >
                                        <Text style={[styles.chipText, category === cat && styles.chipTextActive]}>
                                            {cat}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>

                            <Text style={styles.inputLabel}>Gender *</Text>
                            <View style={styles.genderRow}>
                                {genders.map((g) => (
                                    <TouchableOpacity
                                        key={g}
                                        style={[styles.genderChip, gender === g && styles.genderChipActive]}
                                        onPress={() => setGender(g)}
                                    >
                                        <Text style={[styles.genderText, gender === g && styles.genderTextActive]}>
                                            {g}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            <Text style={styles.inputLabel}>Fabric</Text>
                            <TextInput
                                style={styles.input}
                                value={fabric}
                                onChangeText={setFabric}
                                placeholder="e.g., Cotton, Silk"
                                placeholderTextColor="#666"
                            />

                            <Text style={styles.inputLabel}>Color</Text>
                            <TextInput
                                style={styles.input}
                                value={color}
                                onChangeText={setColor}
                                placeholder="e.g., Red, Blue"
                                placeholderTextColor="#666"
                            />

                            <Text style={styles.inputLabel}>Description</Text>
                            <TextInput
                                style={[styles.input, styles.textArea]}
                                value={description}
                                onChangeText={setDescription}
                                placeholder="Optional description"
                                placeholderTextColor="#666"
                                multiline
                                numberOfLines={3}
                            />

                            <TouchableOpacity
                                style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
                                onPress={handleSubmit}
                                disabled={submitting}
                            >
                                {submitting ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <Text style={styles.submitButtonText}>
                                        {editingGarment ? 'Update Garment' : 'Create Garment'}
                                    </Text>
                                )}
                            </TouchableOpacity>
                        </ScrollView>
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
    addButton: {
        margin: 20,
        backgroundColor: '#6366f1',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
    },
    addButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    list: {
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    garmentCard: {
        flexDirection: 'row',
        backgroundColor: '#1a1a2e',
        borderRadius: 12,
        padding: 12,
        marginBottom: 12,
        alignItems: 'center',
    },
    garmentImage: {
        width: 60,
        height: 80,
        borderRadius: 8,
        backgroundColor: '#2d2d44',
    },
    garmentInfo: {
        flex: 1,
        marginLeft: 12,
    },
    garmentName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
    },
    garmentMeta: {
        fontSize: 13,
        color: '#888',
        marginTop: 4,
        textTransform: 'capitalize',
    },
    inactiveBadge: {
        backgroundColor: '#f59e0b20',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 8,
        alignSelf: 'flex-start',
        marginTop: 6,
    },
    inactiveText: {
        color: '#f59e0b',
        fontSize: 11,
        fontWeight: '600',
    },
    garmentActions: {
        flexDirection: 'row',
    },
    editBtn: {
        padding: 8,
    },
    toggleBtn: {
        padding: 8,
    },
    deleteBtn: {
        padding: 8,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyContainer: {
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
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.8)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#1a1a2e',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        maxHeight: '90%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#fff',
    },
    closeButton: {
        fontSize: 24,
        color: '#888',
    },
    imagePicker: {
        width: '100%',
        aspectRatio: 0.75,
        backgroundColor: '#0f0f23',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        borderWidth: 2,
        borderColor: '#2d2d44',
        borderStyle: 'dashed',
    },
    pickedImage: {
        width: '100%',
        height: '100%',
        borderRadius: 12,
    },
    imagePickerIcon: {
        fontSize: 40,
        marginBottom: 8,
    },
    imagePickerText: {
        color: '#888',
        fontSize: 14,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#ccc',
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#0f0f23',
        borderRadius: 10,
        padding: 14,
        fontSize: 16,
        color: '#fff',
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#2d2d44',
    },
    textArea: {
        height: 80,
        textAlignVertical: 'top',
    },
    chips: {
        marginBottom: 16,
    },
    chip: {
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 16,
        backgroundColor: '#0f0f23',
        marginRight: 8,
        borderWidth: 1,
        borderColor: '#2d2d44',
    },
    chipActive: {
        backgroundColor: '#6366f1',
        borderColor: '#6366f1',
    },
    chipText: {
        color: '#888',
        fontSize: 13,
        textTransform: 'capitalize',
    },
    chipTextActive: {
        color: '#fff',
    },
    genderRow: {
        flexDirection: 'row',
        marginBottom: 16,
    },
    genderChip: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 10,
        backgroundColor: '#0f0f23',
        marginRight: 8,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#2d2d44',
    },
    genderChipActive: {
        backgroundColor: '#ec4899',
        borderColor: '#ec4899',
    },
    genderText: {
        color: '#888',
        fontSize: 14,
        textTransform: 'capitalize',
    },
    genderTextActive: {
        color: '#fff',
        fontWeight: '600',
    },
    submitButton: {
        backgroundColor: '#6366f1',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        marginTop: 8,
        marginBottom: 20,
    },
    submitButtonDisabled: {
        opacity: 0.7,
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});

export default GarmentManagementScreen;
