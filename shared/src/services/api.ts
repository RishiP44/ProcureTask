import axios, { AxiosInstance } from 'axios';

export const createApi = (getToken: () => string | null | Promise<string | null>): AxiosInstance => {
    const api = axios.create();
    api.interceptors.request.use(async (config) => {
        try {
            const token = await getToken();
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        } catch (error) {
            console.error('Auth token retrieval failed', error);
        }
        return config;
    });
    return api;
};

export const assignmentService = (api: AxiosInstance) => ({
    getAll: () => api.get('/assignments'),
    getMy: () => api.get('/assignments/my-assignments'),
    getOne: (id: string) => api.get(`/assignments/${id}`),
    updateStatus: (id: string, status: string) => api.put(`/assignments/${id}`, { status }),
});

export const workflowService = (api: AxiosInstance) => ({
    getAll: () => api.get('/workflows'),
    create: (data: any) => api.post('/workflows', data),
    delete: (id: string) => api.delete(`/workflows/${id}`),
});

export const authService = (api: AxiosInstance) => ({
    getMe: () => api.get('/auth/me'),
    login: (data: any) => api.post('/auth/login', data),
    register: (data: any) => api.post('/auth/register', data),
});

const api = axios.create({
    baseURL: 'http://localhost:5000/api',
});

export default api;
