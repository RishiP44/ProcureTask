import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

import toast from 'react-hot-toast';

const AssignWorkflow = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState<any[]>([]); // To store list of users
    const [workflows, setWorkflows] = useState<any[]>([]);
    const [selectedUser, setSelectedUser] = useState('');
    const [selectedWorkflow, setSelectedWorkflow] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [usersRes, workflowsRes] = await Promise.all([
                    api.get('/users'),
                    api.get('/workflows')
                ]);
                setUsers(usersRes.data);
                setWorkflows(workflowsRes.data);
                setLoading(false);
            } catch (error) {
                console.error(error);
                // alert('Error loading data'); // silent fail or user friendly message
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedUser || !selectedWorkflow) return;

        try {
            await api.post('/assignments', {
                userId: selectedUser,
                workflowId: selectedWorkflow
            });
            toast.success('Workflow Assigned Successfully!');
            navigate('/dashboard');
        } catch (error) {
            toast.error('Failed to assign workflow');
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="max-w-xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Assign Workflow</h2>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* User Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Select User (Employee/Vendor)</label>
                        <select
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                            value={selectedUser}
                            onChange={(e) => setSelectedUser(e.target.value)}
                            required
                        >
                            <option value="">-- Select User --</option>
                            {users.map((u) => (
                                <option key={u._id} value={u._id}>
                                    {u.name} ({u.role}) - {u.email}
                                </option>
                            ))}
                        </select>
                        <p className="text-xs text-gray-500 mt-1">Don't see the user? Make sure they are registered.</p>
                    </div>

                    {/* Workflow Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Select Workflow</label>
                        <select
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                            value={selectedWorkflow}
                            onChange={(e) => setSelectedWorkflow(e.target.value)}
                            required
                        >
                            <option value="">-- Select Workflow --</option>
                            {workflows.map((w) => (
                                <option key={w._id} value={w._id}>
                                    {w.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <button
                        type="submit"
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        Assign Workflow
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AssignWorkflow;
