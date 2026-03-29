export interface User {
    _id: string;
    name: string;
    email: string;
    role: string;
    token: string;
}

export interface Workflow {
    _id: string;
    name: string;
    description: string;
    steps: { name: string; description: string; order: number }[];
}

export interface Assignment {
    _id: string;
    user: User;
    workflow: Workflow;
    status: 'pending' | 'in-progress' | 'completed';
    steps: { name: string; completed: boolean }[];
    createdAt: string;
}

export interface AuthContextType {
    user: User | null;
    login: (userData: User) => void;
    logout: () => void;
    isAuthenticated: boolean;
    loading: boolean;
}
