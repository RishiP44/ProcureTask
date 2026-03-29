import Constants from 'expo-constants';
import { createApi, assignmentService, workflowService, authService } from '@procuretrack/shared';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Get the host machine's IP address for communication with the backend
const debuggerHost = Constants.expoConfig?.hostUri;
const localhost = debuggerHost?.split(':')[0] || '10.0.2.2'; // Standard for Android Emulator if host unknown
const API_URL = `http://${localhost}:5000/api`;

const getToken = async () => {
    const userStr = await AsyncStorage.getItem('user');
    const user = JSON.parse(userStr || '{}');
    return user?.token || null;
};

const api = createApi(getToken);
api.defaults.baseURL = API_URL;

export const assignmentsApi = assignmentService(api);
export const workflowsApi = workflowService(api);
export const authApi = authService(api);

export default api;
