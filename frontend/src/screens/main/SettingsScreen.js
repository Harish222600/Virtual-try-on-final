import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContext';
import { userAPI, tryonAPI } from '../../api';

const SettingsScreen = ({ navigation }) => {
    const { logout } = useAuth();
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [deletePassword, setDeletePassword] = useState('');
    const [showPasswordChange, setShowPasswordChange] = useState(false);
    const [showDeleteAccount, setShowDeleteAccount] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleChangePassword = async () => {
        if (!currentPassword || !newPassword || !confirmPassword) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }
        if (newPassword !== confirmPassword) {
            Alert.alert('Error', 'New passwords do not match');
            return;
        }
        if (newPassword.length < 6) {
            Alert.alert('Error', 'Password must be at least 6 characters');
            return;
        }

        setLoading(true);
        try {
            await userAPI.changePassword(currentPassword, newPassword);
            Alert.alert('Success', 'Password changed successfully');
            setShowPasswordChange(false);
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (error) {
            Alert.alert('Error', error.response?.data?.message || 'Failed to change password');
        } finally {
            setLoading(false);
        }
    };

    const handleClearHistory = () => {
        Alert.alert(
            'Clear History',
            'Are you sure you want to delete all your try-on history? This cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Clear',
                    style: 'destructive',
                    onPress: async () => {
                        setLoading(true);
                        try {
                            await tryonAPI.clearHistory();
                            Alert.alert('Success', 'History cleared');
                        } catch (error) {
                            Alert.alert('Error', 'Failed to clear history');
                        } finally {
                            setLoading(false);
                        }
                    },
                },
            ]
        );
    };

    const handleDeleteAccount = async () => {
        if (!deletePassword) {
            Alert.alert('Error', 'Please enter your password');
            return;
        }

        Alert.alert(
            'Delete Account',
            'Are you absolutely sure? This action cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        setLoading(true);
                        try {
                            await userAPI.deleteAccount(deletePassword);
                            await logout();
                        } catch (error) {
                            Alert.alert('Error', error.response?.data?.message || 'Failed to delete account');
                            setLoading(false);
                        }
                    },
                },
            ]
        );
    };

    const SettingItem = ({ icon, title, subtitle, onPress, danger }) => (
        <TouchableOpacity style={styles.settingItem} onPress={onPress}>
            <View style={styles.settingIconContainer}>
                <Text style={styles.settingIcon}>{icon}</Text>
            </View>
            <View style={styles.settingContent}>
                <Text style={[styles.settingTitle, danger && styles.dangerText]}>{title}</Text>
                {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
            </View>
            <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container} edges={['bottom']}>
            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Account</Text>
                    <SettingItem
                        icon="🔑"
                        title="Change Password"
                        subtitle="Update your password"
                        onPress={() => setShowPasswordChange(!showPasswordChange)}
                    />
                    {showPasswordChange && (
                        <View style={styles.expandedSection}>
                            <TextInput
                                style={styles.input}
                                placeholder="Current Password"
                                placeholderTextColor="#666"
                                value={currentPassword}
                                onChangeText={setCurrentPassword}
                                secureTextEntry
                            />
                            <TextInput
                                style={styles.input}
                                placeholder="New Password"
                                placeholderTextColor="#666"
                                value={newPassword}
                                onChangeText={setNewPassword}
                                secureTextEntry
                            />
                            <TextInput
                                style={styles.input}
                                placeholder="Confirm New Password"
                                placeholderTextColor="#666"
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                                secureTextEntry
                            />
                            <TouchableOpacity
                                style={[styles.actionButton, loading && styles.actionButtonDisabled]}
                                onPress={handleChangePassword}
                                disabled={loading}
                            >
                                {loading ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <Text style={styles.actionButtonText}>Update Password</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    )}
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Privacy & Data</Text>
                    <SettingItem
                        icon="🗑️"
                        title="Clear Try-On History"
                        subtitle="Delete all your try-on results"
                        onPress={handleClearHistory}
                    />
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>About</Text>
                    <SettingItem
                        icon="📱"
                        title="App Version"
                        subtitle="1.0.0"
                        onPress={() => { }}
                    />
                    <SettingItem
                        icon="📄"
                        title="Privacy Policy"
                        onPress={() => { }}
                    />
                    <SettingItem
                        icon="📋"
                        title="Terms of Service"
                        onPress={() => { }}
                    />
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Danger Zone</Text>
                    <SettingItem
                        icon="⚠️"
                        title="Delete Account"
                        subtitle="Permanently delete your account"
                        onPress={() => setShowDeleteAccount(!showDeleteAccount)}
                        danger
                    />
                    {showDeleteAccount && (
                        <View style={styles.expandedSection}>
                            <Text style={styles.warningText}>
                                This will permanently delete your account, all try-on history, and favorites.
                                This action cannot be undone.
                            </Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter your password to confirm"
                                placeholderTextColor="#666"
                                value={deletePassword}
                                onChangeText={setDeletePassword}
                                secureTextEntry
                            />
                            <TouchableOpacity
                                style={[styles.deleteButton, loading && styles.actionButtonDisabled]}
                                onPress={handleDeleteAccount}
                                disabled={loading}
                            >
                                {loading ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <Text style={styles.deleteButtonText}>Delete My Account</Text>
                                )}
                            </TouchableOpacity>
                        </View>
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
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#888',
        textTransform: 'uppercase',
        paddingHorizontal: 20,
        marginBottom: 8,
    },
    settingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1a1a2e',
        paddingVertical: 14,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#2d2d44',
    },
    settingIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 10,
        backgroundColor: '#2d2d44',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
    },
    settingIcon: {
        fontSize: 18,
    },
    settingContent: {
        flex: 1,
    },
    settingTitle: {
        fontSize: 16,
        color: '#fff',
        fontWeight: '500',
    },
    settingSubtitle: {
        fontSize: 13,
        color: '#888',
        marginTop: 2,
    },
    chevron: {
        fontSize: 20,
        color: '#888',
    },
    dangerText: {
        color: '#ef4444',
    },
    expandedSection: {
        backgroundColor: '#1a1a2e',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#2d2d44',
    },
    input: {
        backgroundColor: '#0f0f23',
        borderRadius: 10,
        padding: 14,
        fontSize: 16,
        color: '#fff',
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#2d2d44',
    },
    actionButton: {
        backgroundColor: '#6366f1',
        borderRadius: 10,
        padding: 14,
        alignItems: 'center',
    },
    actionButtonDisabled: {
        opacity: 0.7,
    },
    actionButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    warningText: {
        color: '#ef4444',
        fontSize: 14,
        marginBottom: 16,
        lineHeight: 20,
    },
    deleteButton: {
        backgroundColor: '#ef4444',
        borderRadius: 10,
        padding: 14,
        alignItems: 'center',
    },
    deleteButtonText: {
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
        borderColor: '#6366f1',
    },
    logoutText: {
        color: '#6366f1',
        fontSize: 16,
        fontWeight: '600',
    },
});

export default SettingsScreen;
