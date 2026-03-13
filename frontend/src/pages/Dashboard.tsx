import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const Dashboard = () => {
    const { user } = useAuth();
    const [assignments, setAssignments] = useState<any[]>([]);

    useEffect(() => {
        const fetchAssignments = async () => {
            try {
                const endpoint = user?.role === 'Admin' || user?.role === 'HR' // Providing the role details for Admmin Dashboard
                    ? '/assignments'
                    : '/assignments/my-assignments';

                const res = await api.get(endpoint);
                setAssignments(res.data);
            } catch (error) {
                console.error('Failed to fetch assignments', error);
            }
        }; 
        fetchAssignments();
    }, [user]);

    return (
        <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h2>

            {/* Stats Cards (Simple) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <h3 className="text-gray-500 text-sm font-medium">Active Onboardings</h3>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{assignments.filter(a => a.status !== 'completed').length}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <h3 className="text-gray-500 text-sm font-medium">Completed</h3>
                    <p className="text-3xl font-bold text-green-600 mt-2">{assignments.filter(a => a.status === 'completed').length}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <h3 className="text-gray-500 text-sm font-medium">Total Assignments</h3>
                    <p className="text-3xl font-bold text-blue-600 mt-2">{assignments.length}</p>
                </div>
            </div>

            <h3 className="text-lg font-bold text-gray-900 mb-4">Recents</h3>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Workflow</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {assignments.map((assignment) => (
                            <tr key={assignment._id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {assignment.user?.name || 'Me'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{assignment.workflow?.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                    ${assignment.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                        {assignment.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {new Date(assignment.createdAt).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            window.location.href = `/assignments/${assignment._id}`;
                                        }}
                                        className="text-indigo-600 hover:text-indigo-900"
                                    >
                                        View
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {assignments.length === 0 && (
                            <tr>
                                <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">No active assignments.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Dashboard;
