import React, { createContext, useContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { authAPI } from '../api';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadStoredAuth();
    }, []);

    const loadStoredAuth = async () => {
        try {
            const storedToken = await SecureStore.getItemAsync('token');
            const storedUser = await SecureStore.getItemAsync('user');

            if (storedToken && storedUser) {
                setToken(storedToken);
                setUser(JSON.parse(storedUser));
            }
        } catch (error) {
            console.log('Error loading auth:', error);
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        try {
            setError(null);
            const response = await authAPI.login(email, password);

            if (response.success) {
                await SecureStore.setItemAsync('token', response.data.token);
                await SecureStore.setItemAsync('user', JSON.stringify(response.data.user));
                setToken(response.data.token);
                setUser(response.data.user);
                return { success: true };
            }
        } catch (error) {
            const message = error.response?.data?.message || 'Login failed';
            setError(message);
            return { success: false, message };
        }
    };

    const register = async (name, email, password) => {
        try {
            setError(null);
            const response = await authAPI.register(name, email, password);

            if (response.success) {
                await SecureStore.setItemAsync('token', response.data.token);
                await SecureStore.setItemAsync('user', JSON.stringify(response.data.user));
                setToken(response.data.token);
                setUser(response.data.user);
                return { success: true };
            }
        } catch (error) {
            const message = error.response?.data?.message || 'Registration failed';
            setError(message);
            return { success: false, message };
        }
    };

    const logout = async () => {
        try {
            await authAPI.logout();
        } catch (error) {
            console.log('Logout error:', error);
        } finally {
            await SecureStore.deleteItemAsync('token');
            await SecureStore.deleteItemAsync('user');
            setToken(null);
            setUser(null);
        }
    };

    const updateUser = async (updatedUser) => {
        setUser(updatedUser);
        await SecureStore.setItemAsync('user', JSON.stringify(updatedUser));
    };

    const clearError = () => setError(null);

    const value = {
        user,
        token,
        loading,
        error,
        isAuthenticated: !!token,
        isAdmin: user?.role === 'admin',
        login,
        register,
        logout,
        updateUser,
        clearError,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export default AuthContext;
