import api from './client';

export const garmentAPI = {
    getGarments: async (params = {}) => {
        const response = await api.get('/garments', { params });
        return response.data;
    },

    getGarment: async (id) => {
        const response = await api.get(`/garments/${id}`);
        return response.data;
    },

    getCategories: async () => {
        const response = await api.get('/garments/categories');
        return response.data;
    },

    getColors: async () => {
        const response = await api.get('/garments/colors');
        return response.data;
    },
};
