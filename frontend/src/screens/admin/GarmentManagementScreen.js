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
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { adminAPI } from '../../api';

const GarmentManagementScreen = () => {
    const [garments, setGarments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [search, setSearch] = useState('');

    // Form State
    const [showModal, setShowModal] = useState(false);
    const [editingGarment, setEditingGarment] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    // Form Fields
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
    }, [search]);

    const loadGarments = async () => {
        try {
            const params = { limit: 100 };
            if (search.trim()) params.search = search.trim();

            const response = await adminAPI.getAllGarments(params);
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
    }, [search]);

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
        <View style={styles.cardContainer}>
            <LinearGradient
                colors={['#2d2d44', '#1a1a2e']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.garmentCard}
            >
                <View style={styles.cardContent}>
                    <Image source={{ uri: item.imageUrl }} style={styles.garmentImage} />
                    <View style={styles.garmentInfo}>
                        <View style={styles.headerRow}>
                            <Text style={styles.garmentName} numberOfLines={1}>{item.name}</Text>
                            {!item.isActive && (
                                <View style={styles.inactiveBadge}>
                                    <Ionicons name="eye-off" size={12} color="#f59e0b" />
                                    <Text style={styles.inactiveText}>Hidden</Text>
                                </View>
                            )}
                        </View>

                        <View style={styles.tagsRow}>
                            <View style={styles.tag}>
                                <Text style={styles.tagText}>{item.category}</Text>
                            </View>
                            <View style={styles.tag}>
                                <Text style={styles.tagText}>{item.gender}</Text>
                            </View>
                        </View>

                        {item.description ? (
                            <Text style={styles.description} numberOfLines={2}>{item.description}</Text>
                        ) : null}
                    </View>
                </View>

                <View style={styles.cardActions}>
                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => openEditModal(item)}
                    >
                        <LinearGradient
                            colors={['rgba(99, 102, 241, 0.2)', 'rgba(99, 102, 241, 0.1)']}
                            style={styles.actionGradient}
                        >
                            <Ionicons name="create-outline" size={18} color="#6366f1" />
                        </LinearGradient>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => toggleActive(item)}
                    >
                        <LinearGradient
                            colors={item.isActive
                                ? ['rgba(16, 185, 129, 0.2)', 'rgba(16, 185, 129, 0.1)']
                                : ['rgba(245, 158, 11, 0.2)', 'rgba(245, 158, 11, 0.1)']}
                            style={styles.actionGradient}
                        >
                            <Ionicons
                                name={item.isActive ? "eye-outline" : "eye-off-outline"}
                                size={18}
                                color={item.isActive ? "#10b981" : "#f59e0b"}
                            />
                        </LinearGradient>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => deleteGarment(item._id, item.name)}
                    >
                        <LinearGradient
                            colors={['rgba(239, 68, 68, 0.2)', 'rgba(239, 68, 68, 0.1)']}
                            style={styles.actionGradient}
                        >
                            <Ionicons name="trash-outline" size={18} color="#ef4444" />
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </LinearGradient>
        </View>
    );

    return (
        <SafeAreaView style={styles.container} edges={['bottom']}>
            <LinearGradient
                colors={['#1a1a2e', '#0f0f23']}
                style={styles.header}
            >
                <View style={styles.searchSection}>
                    <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search garments..."
                        placeholderTextColor="#666"
                        value={search}
                        onChangeText={setSearch}
                    />
                </View>
                <TouchableOpacity
                    style={styles.addInitButton}
                    onPress={openAddModal}
                >
                    <LinearGradient
                        colors={['#6366f1', '#8b5cf6']}
                        style={styles.addInitGradient}
                    >
                        <Ionicons name="add" size={28} color="#fff" />
                    </LinearGradient>
                </TouchableOpacity>
            </LinearGradient>

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
                            <Ionicons name="shirt-outline" size={64} color="#6366f1" />
                            <Text style={styles.emptyText}>No garments found</Text>
                            <Text style={styles.emptySubText}>Add some garments to get started</Text>
                        </View>
                    }
                />
            )}

            <Modal visible={showModal} animationType="fade" transparent>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <LinearGradient
                            colors={['#1a1a2e', '#2d2d44']}
                            style={styles.modalGradient}
                        >
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>
                                    {editingGarment ? 'Edit Garment' : 'Add New Garment'}
                                </Text>
                                <TouchableOpacity onPress={() => setShowModal(false)} style={styles.closeButton}>
                                    <Ionicons name="close" size={24} color="#888" />
                                </TouchableOpacity>
                            </View>

                            <ScrollView showsVerticalScrollIndicator={false}>
                                <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
                                    {imageUri || editingGarment?.imageUrl ? (
                                        <Image
                                            source={{ uri: imageUri || editingGarment?.imageUrl }}
                                            style={styles.pickedImage}
                                        />
                                    ) : (
                                        <View style={styles.imagePlaceholder}>
                                            <Ionicons name="camera-outline" size={40} color="#666" />
                                            <Text style={styles.imagePickerText}>Tap to upload image</Text>
                                        </View>
                                    )}
                                </TouchableOpacity>

                                <View style={styles.formGroup}>
                                    <Text style={styles.label}>Name *</Text>
                                    <TextInput
                                        style={styles.input}
                                        value={name}
                                        onChangeText={setName}
                                        placeholder="Garment name"
                                        placeholderTextColor="#666"
                                    />
                                </View>

                                <View style={styles.formGroup}>
                                    <Text style={styles.label}>Category *</Text>
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
                                </View>

                                <View style={styles.formGroup}>
                                    <Text style={styles.label}>Gender *</Text>
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
                                </View>

                                <View style={styles.row}>
                                    <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
                                        <Text style={styles.label}>Fabric</Text>
                                        <TextInput
                                            style={styles.input}
                                            value={fabric}
                                            onChangeText={setFabric}
                                            placeholder="e.g. Cotton"
                                            placeholderTextColor="#666"
                                        />
                                    </View>
                                    <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
                                        <Text style={styles.label}>Color</Text>
                                        <TextInput
                                            style={styles.input}
                                            value={color}
                                            onChangeText={setColor}
                                            placeholder="e.g. Red"
                                            placeholderTextColor="#666"
                                        />
                                    </View>
                                </View>

                                <View style={styles.formGroup}>
                                    <Text style={styles.label}>Description</Text>
                                    <TextInput
                                        style={[styles.input, styles.textArea]}
                                        value={description}
                                        onChangeText={setDescription}
                                        placeholder="Optional description"
                                        placeholderTextColor="#666"
                                        multiline
                                        numberOfLines={3}
                                    />
                                </View>

                                <TouchableOpacity
                                    style={styles.submitButtonContainer}
                                    onPress={handleSubmit}
                                    disabled={submitting}
                                >
                                    <LinearGradient
                                        colors={['#6366f1', '#8b5cf6']}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 0 }}
                                        style={styles.submitButton}
                                    >
                                        {submitting ? (
                                            <ActivityIndicator color="#fff" />
                                        ) : (
                                            <Text style={styles.submitButtonText}>
                                                {editingGarment ? 'Update Garment' : 'Create Garment'}
                                            </Text>
                                        )}
                                    </LinearGradient>
                                </TouchableOpacity>
                            </ScrollView>
                        </LinearGradient>
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
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        gap: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#2d2d44',
    },
    searchSection: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        paddingHorizontal: 12,
        height: 50,
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: '#fff',
    },
    addInitButton: {
        shadowColor: "#6366f1",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    addInitGradient: {
        width: 50,
        height: 50,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    list: {
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 40,
    },
    cardContainer: {
        marginBottom: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
    },
    garmentCard: {
        borderRadius: 16,
        padding: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    cardContent: {
        flexDirection: 'row',
        marginBottom: 12,
    },
    garmentImage: {
        width: 80,
        height: 100,
        borderRadius: 12,
        backgroundColor: '#2d2d44',
    },
    garmentInfo: {
        flex: 1,
        marginLeft: 12,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    garmentName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#fff',
        flex: 1,
        marginRight: 8,
    },
    inactiveBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(245, 158, 11, 0.15)',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 6,
        gap: 4,
    },
    inactiveText: {
        fontSize: 10,
        color: '#f59e0b',
        fontWeight: '700',
    },
    tagsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
        marginBottom: 8,
    },
    tag: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 6,
    },
    tagText: {
        fontSize: 11,
        color: '#ccc',
        textTransform: 'capitalize',
    },
    description: {
        fontSize: 12,
        color: '#888',
        lineHeight: 16,
    },
    cardActions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 8,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.05)',
    },
    actionButton: {
        borderRadius: 8,
        overflow: 'hidden',
    },
    actionGradient: {
        width: 36,
        height: 36,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyContainer: {
        alignItems: 'center',
        paddingTop: 80,
        opacity: 0.5,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
        marginTop: 16,
        marginBottom: 4,
    },
    emptySubText: {
        fontSize: 14,
        color: '#888',
    },

    // Modal
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.8)',
        justifyContent: 'center',
        padding: 20,
    },
    modalContent: {
        borderRadius: 24,
        overflow: 'hidden',
        width: '100%',
        maxHeight: '90%',
    },
    modalGradient: {
        padding: 24,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#fff',
    },
    closeButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(255,255,255,0.05)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    imagePicker: {
        width: '100%',
        aspectRatio: 1.5,
        backgroundColor: 'rgba(0,0,0,0.2)',
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        borderStyle: 'dashed',
        overflow: 'hidden',
    },
    imagePlaceholder: {
        alignItems: 'center',
    },
    pickedImage: {
        width: '100%',
        height: '100%',
    },
    imagePickerText: {
        color: '#888',
        fontSize: 14,
        marginTop: 8,
    },
    formGroup: {
        marginBottom: 16,
    },
    label: {
        color: '#a1a1aa',
        fontSize: 13,
        fontWeight: '600',
        marginBottom: 8,
        marginLeft: 4,
    },
    input: {
        backgroundColor: 'rgba(0,0,0,0.2)',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        padding: 12,
        fontSize: 16,
        color: '#fff',
    },
    textArea: {
        height: 80,
        textAlignVertical: 'top',
    },
    chips: {
        flexDirection: 'row',
        marginBottom: 4,
    },
    chip: {
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.05)',
        marginRight: 8,
        borderWidth: 1,
        borderColor: 'transparent',
    },
    chipActive: {
        backgroundColor: 'rgba(99, 102, 241, 0.15)',
        borderColor: '#6366f1',
    },
    chipText: {
        color: '#888',
        fontSize: 13,
        textTransform: 'capitalize',
    },
    chipTextActive: {
        color: '#fff',
        fontWeight: '600',
    },
    genderRow: {
        flexDirection: 'row',
        gap: 8,
    },
    genderChip: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.05)',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'transparent',
    },
    genderChipActive: {
        backgroundColor: 'rgba(236, 72, 153, 0.15)',
        borderColor: '#ec4899',
    },
    genderText: {
        color: '#888',
        fontSize: 13,
        textTransform: 'capitalize',
    },
    genderTextActive: {
        color: '#fff',
        fontWeight: '600',
    },
    row: {
        flexDirection: 'row',
    },
    submitButtonContainer: {
        marginTop: 8,
        marginBottom: 16,
        shadowColor: "#6366f1",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
    },
    submitButton: {
        padding: 16,
        borderRadius: 16,
        alignItems: 'center',
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        letterSpacing: 0.5,
    },
});

export default GarmentManagementScreen;
