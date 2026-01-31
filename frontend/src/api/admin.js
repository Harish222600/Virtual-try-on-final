import api from './client';

export const adminAPI = {
    // Users
    getUsers: async (params = {}) => {
        const response = await api.get('/admin/users', { params });
        return response.data;
    },

    toggleUserBlock: async (userId) => {
        const response = await api.put(`/admin/users/${userId}/block`);
        return response.data;
    },

    deleteUser: async (userId) => {
        const response = await api.delete(`/admin/users/${userId}`);
        return response.data;
    },

    getUserActivity: async (userId) => {
        const response = await api.get(`/admin/users/${userId}/activity`);
        return response.data;
    },

    createUser: async (userData) => {
        const response = await api.post('/admin/users', userData);
        return response.data;
    },

    updateUserRole: async (userId, role) => {
        const response = await api.put(`/admin/users/${userId}/role`, { role });
        return response.data;
    },

    // Garments
    getAllGarments: async (params = {}) => {
        const response = await api.get('/admin/garments', { params });
        return response.data;
    },

    createGarment: async (formData) => {
        const response = await api.post('/admin/garments', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    updateGarment: async (garmentId, formData) => {
        const response = await api.put(`/admin/garments/${garmentId}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    deleteGarment: async (garmentId) => {
        const response = await api.delete(`/admin/garments/${garmentId}`);
        return response.data;
    },

    // Analytics
    getAnalytics: async () => {
        const response = await api.get('/admin/analytics');
        return response.data;
    },

    getLogs: async (params = {}) => {
        const response = await api.get('/admin/logs', { params });
        return response.data;
    },

    // AI Model management
    getModels: async () => {
        const response = await api.get('/admin/models');
        return response.data;
    },

    setActiveModel: async (modelId) => {
        const response = await api.put('/admin/models/active', { modelId });
        return response.data;
    },
};
