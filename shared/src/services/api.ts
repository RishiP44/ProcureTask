import axios from 'axios';
import { User, Assignment, Workflow } from '../types';

// In a real app, this might be an environment variable
const API_URL = 'http://10.0.2.2:5000/api'; // Standard for Android Emulator to localhost

export const createApi = (getToken: () => string | null | Promise<string | null>) => {
    const api = axios.create({
        baseURL: API_URL,
        headers: {
            'Content-Type': 'application/json',
        },
    });

    api.interceptors.request.use(async (config) => {
        const token = await getToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    }, (error) => {
        return Promise.reject(error);
    });

    return api;
};

// API Resource functions
export const assignmentService = (api: any) => ({
    getAssignments: (role: string) => {
        const endpoint = role === 'Admin' || role === 'HR' 
            ? '/assignments' 
            : '/assignments/my-assignments';
        return api.get(endpoint);
    },
    getAssignmentById: (id: string) => api.get(`/assignments/${id}`),
    updateStep: (assignmentId: string, stepName: string, completed: boolean) => 
        api.patch(`/assignments/${assignmentId}/steps`, { stepName, completed })
});

export const workflowService = (api: any) => ({
    getWorkflows: () => api.get('/workflows'),
    createWorkflow: (workflowData: any) => api.post('/workflows', workflowData),
});

export const authService = (api: any) => ({
    login: (credentials: any) => api.post('/auth/login', credentials),
    getProfile: () => api.get('/auth/me'),
});
