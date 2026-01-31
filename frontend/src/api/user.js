import api from './client';

export const userAPI = {
    getProfile: async () => {
        const response = await api.get('/users/profile');
        return response.data;
    },

    updateProfile: async (data) => {
        const response = await api.put('/users/profile', data);
        return response.data;
    },

    uploadProfileImage: async (imageUri) => {
        const formData = new FormData();
        formData.append('image', {
            uri: imageUri,
            type: 'image/jpeg',
            name: 'profile.jpg',
        });

        const response = await api.put('/users/profile-image', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    changePassword: async (currentPassword, newPassword) => {
        const response = await api.put('/users/password', { currentPassword, newPassword });
        return response.data;
    },

    deleteAccount: async (password) => {
        const response = await api.delete('/users/account', { data: { password } });
        return response.data;
    },

    getFavorites: async () => {
        const response = await api.get('/users/favorites');
        return response.data;
    },

    addToFavorites: async (garmentId) => {
        const response = await api.post(`/users/favorites/${garmentId}`);
        return response.data;
    },

    removeFromFavorites: async (garmentId) => {
        const response = await api.delete(`/users/favorites/${garmentId}`);
        return response.data;
    },
};
