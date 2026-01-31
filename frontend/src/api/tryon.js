import api from './client';

export const tryonAPI = {
    initiateTryOn: async (imageUri, garmentId) => {
        const formData = new FormData();
        formData.append('image', {
            uri: imageUri,
            type: 'image/jpeg',
            name: 'person.jpg',
        });
        formData.append('garmentId', garmentId);

        const response = await api.post('/tryon', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            timeout: 120000, // 2 minute timeout for AI processing
        });
        return response.data;
    },

    getHistory: async (page = 1, limit = 20) => {
        const response = await api.get('/tryon/history', { params: { page, limit } });
        return response.data;
    },

    getTryOnResult: async (id) => {
        const response = await api.get(`/tryon/${id}`);
        return response.data;
    },

    deleteTryOnResult: async (id) => {
        const response = await api.delete(`/tryon/${id}`);
        return response.data;
    },

    clearHistory: async () => {
        const response = await api.delete('/tryon/history');
        return response.data;
    },
};
