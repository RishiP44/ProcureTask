import { createApi, assignmentService, workflowService, authService } from '@procuretrack/shared';

const getToken = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user?.token || null;
};

const api = createApi(getToken);
api.defaults.baseURL = 'http://localhost:5000/api';

export const assignmentsApi = assignmentService(api);
export const workflowsApi = workflowService(api);
export const authApi = authService(api);

export default api;
