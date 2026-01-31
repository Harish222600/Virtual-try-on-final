import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Auto-detect the correct backend URL based on environment
const getApiBaseUrl = () => {
    // 1. Check for .env override first
    if (process.env.EXPO_PUBLIC_API_URL) {
        return process.env.EXPO_PUBLIC_API_URL;
    }

    const PORT = 5000;

    // 2. For web, use localhost
    if (Platform.OS === 'web') {
        return `http://localhost:${PORT}/api`;
    }

    // 3. For Expo Go & development builds, use the debugger host IP
    const debuggerHost = Constants.expoConfig?.hostUri || Constants.manifest?.debuggerHost;

    if (debuggerHost) {
        const hostIP = debuggerHost.split(':')[0];
        return `http://${hostIP}:${PORT}/api`;
    }

    // 4. Fallback
    return `http://localhost:${PORT}/api`;
};

const API_BASE_URL = getApiBaseUrl();

console.log('🔗 API Base URL:', API_BASE_URL);

const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add auth token
api.interceptors.request.use(
    async (config) => {
        try {
            const token = await SecureStore.getItemAsync('token');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        } catch (error) {
            console.log('Error getting token:', error);
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 401) {
            // Token expired or invalid - clear storage
            await SecureStore.deleteItemAsync('token');
            await SecureStore.deleteItemAsync('user');
        }
        return Promise.reject(error);
    }
);

export default api;
export { API_BASE_URL };
