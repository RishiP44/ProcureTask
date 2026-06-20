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
    audience?: 'Employee' | 'Vendor';
    tasks?: { _id?: string; name: string; description?: string; type: 'checkbox' | 'document'; required: boolean }[];
    version?: number;
    isLatest?: boolean;
    rootId?: string;
    isArchived?: boolean;
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
