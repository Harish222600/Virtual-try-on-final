import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    TextInput,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../../contexts/AuthContext';
import { userAPI } from '../../api';

const ProfileScreen = ({ navigation }) => {
    const { user, updateUser, logout } = useAuth();
    const [editing, setEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [name, setName] = useState(user?.name || '');
    const [bodyInfo, setBodyInfo] = useState(user?.bodyInfo || {});

    useEffect(() => {
        if (user) {
            setName(user.name);
            setBodyInfo(user.bodyInfo || {});
        }
    }, [user]);

    const pickProfileImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled) {
            setLoading(true);
            try {
                const response = await userAPI.uploadProfileImage(result.assets[0].uri);
                if (response.success) {
                    updateUser({ ...user, profileImage: response.data.profileImage });
                    Alert.alert('Success', 'Profile image updated');
                }
            } catch (error) {
                Alert.alert('Error', 'Failed to update profile image');
            } finally {
                setLoading(false);
            }
        }
    };

    const saveProfile = async () => {
        setLoading(true);
        try {
            const response = await userAPI.updateProfile({ name, bodyInfo });
            if (response.success) {
                updateUser(response.data);
                setEditing(false);
                Alert.alert('Success', 'Profile updated');
            }
        } catch (error) {
            Alert.alert('Error', error.response?.data?.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const genderOptions = ['male', 'female', 'other'];
    const bodyTypeOptions = ['slim', 'regular', 'athletic', 'plus'];

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.header}>
                    <Text style={styles.title}>My Profile</Text>
                    <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
                        <Text style={styles.settingsIcon}>⚙️</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.profileSection}>
                    <TouchableOpacity
                        style={styles.avatarContainer}
                        onPress={pickProfileImage}
                        disabled={loading}
                    >
                        {user?.profileImage ? (
                            <Image source={{ uri: user.profileImage }} style={styles.avatar} />
                        ) : (
                            <View style={styles.avatarPlaceholder}>
                                <Text style={styles.avatarText}>{user?.name?.[0]?.toUpperCase() || 'U'}</Text>
                            </View>
                        )}
                        <View style={styles.cameraIcon}>
                            <Text>📷</Text>
                        </View>
                    </TouchableOpacity>
                    <Text style={styles.email}>{user?.email}</Text>
                    {user?.role === 'admin' && (
                        <View style={styles.adminBadge}>
                            <Text style={styles.adminBadgeText}>Admin</Text>
                        </View>
                    )}
                </View>

                <View style={styles.formSection}>
                    <View style={styles.formHeader}>
                        <Text style={styles.sectionTitle}>Personal Information</Text>
                        {!editing ? (
                            <TouchableOpacity onPress={() => setEditing(true)}>
                                <Text style={styles.editText}>Edit</Text>
                            </TouchableOpacity>
                        ) : (
                            <TouchableOpacity onPress={() => setEditing(false)}>
                                <Text style={styles.cancelText}>Cancel</Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Full Name</Text>
                        <TextInput
                            style={[styles.input, !editing && styles.inputDisabled]}
                            value={name}
                            onChangeText={setName}
                            editable={editing}
                            placeholder="Your name"
                            placeholderTextColor="#666"
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Gender</Text>
                        <View style={styles.optionsRow}>
                            {genderOptions.map((option) => (
                                <TouchableOpacity
                                    key={option}
                                    style={[
                                        styles.optionButton,
                                        bodyInfo.gender === option && styles.optionButtonActive,
                                        !editing && styles.optionButtonDisabled,
                                    ]}
                                    onPress={() => editing && setBodyInfo({ ...bodyInfo, gender: option })}
                                    disabled={!editing}
                                >
                                    <Text
                                        style={[
                                            styles.optionText,
                                            bodyInfo.gender === option && styles.optionTextActive,
                                        ]}
                                    >
                                        {option.charAt(0).toUpperCase() + option.slice(1)}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Height (cm)</Text>
                        <TextInput
                            style={[styles.input, !editing && styles.inputDisabled]}
                            value={bodyInfo.height?.toString() || ''}
                            onChangeText={(val) => setBodyInfo({ ...bodyInfo, height: parseInt(val) || null })}
                            editable={editing}
                            keyboardType="numeric"
                            placeholder="e.g., 170"
                            placeholderTextColor="#666"
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Body Type</Text>
                        <View style={styles.optionsRow}>
                            {bodyTypeOptions.map((option) => (
                                <TouchableOpacity
                                    key={option}
                                    style={[
                                        styles.optionButton,
                                        bodyInfo.bodyType === option && styles.optionButtonActive,
                                        !editing && styles.optionButtonDisabled,
                                    ]}
                                    onPress={() => editing && setBodyInfo({ ...bodyInfo, bodyType: option })}
                                    disabled={!editing}
                                >
                                    <Text
                                        style={[
                                            styles.optionText,
                                            bodyInfo.bodyType === option && styles.optionTextActive,
                                        ]}
                                    >
                                        {option.charAt(0).toUpperCase() + option.slice(1)}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {editing && (
                        <TouchableOpacity
                            style={[styles.saveButton, loading && styles.saveButtonDisabled]}
                            onPress={saveProfile}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.saveButtonText}>Save Changes</Text>
                            )}
                        </TouchableOpacity>
                    )}
                </View>

                <TouchableOpacity style={styles.logoutButton} onPress={logout}>
                    <Text style={styles.logoutText}>Logout</Text>
                </TouchableOpacity>
            </ScrollView>
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
        paddingTop: 10,
        paddingBottom: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
    },
    settingsIcon: {
        fontSize: 24,
    },
    profileSection: {
        alignItems: 'center',
        paddingBottom: 24,
        borderBottomWidth: 1,
        borderBottomColor: '#2d2d44',
        marginHorizontal: 20,
    },
    avatarContainer: {
        position: 'relative',
        marginBottom: 16,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
    },
    avatarPlaceholder: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#6366f1',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        fontSize: 40,
        fontWeight: 'bold',
        color: '#fff',
    },
    cameraIcon: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: '#1a1a2e',
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#0f0f23',
    },
    email: {
        fontSize: 16,
        color: '#888',
    },
    adminBadge: {
        marginTop: 8,
        backgroundColor: '#6366f120',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    adminBadgeText: {
        color: '#6366f1',
        fontWeight: '600',
        fontSize: 12,
    },
    formSection: {
        padding: 20,
    },
    formHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#fff',
    },
    editText: {
        color: '#6366f1',
        fontSize: 16,
        fontWeight: '600',
    },
    cancelText: {
        color: '#888',
        fontSize: 16,
    },
    inputContainer: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#ccc',
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#1a1a2e',
        borderRadius: 12,
        padding: 14,
        fontSize: 16,
        color: '#fff',
        borderWidth: 1,
        borderColor: '#2d2d44',
    },
    inputDisabled: {
        opacity: 0.6,
    },
    optionsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    optionButton: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        backgroundColor: '#1a1a2e',
        marginRight: 8,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: '#2d2d44',
    },
    optionButtonActive: {
        backgroundColor: '#6366f1',
        borderColor: '#6366f1',
    },
    optionButtonDisabled: {
        opacity: 0.6,
    },
    optionText: {
        color: '#888',
        fontSize: 14,
    },
    optionTextActive: {
        color: '#fff',
        fontWeight: '600',
    },
    saveButton: {
        backgroundColor: '#6366f1',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        marginTop: 8,
    },
    saveButtonDisabled: {
        opacity: 0.7,
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    logoutButton: {
        marginHorizontal: 20,
        marginBottom: 40,
        padding: 16,
        alignItems: 'center',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#ef4444',
    },
    logoutText: {
        color: '#ef4444',
        fontSize: 16,
        fontWeight: '600',
    },
});

export default ProfileScreen;
