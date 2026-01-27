import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const Workflows = () => {
    const [workflows, setWorkflows] = useState<any[]>([]);

    useEffect(() => {
        const fetchWorkflows = async () => {
            try {
                const res = await api.get('/workflows');
                setWorkflows(res.data);
            } catch (error) {
                console.error('Failed to fetch workflows', error);
            }
        };
        fetchWorkflows();
    }, []);

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Workflows</h2>
                <Link
                    to="/workflows/create"
                    className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition"
                >
                    Create Workflow
                </Link>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {workflows.map((workflow) => (
                    <div key={workflow._id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition">
                        <h3 className="text-lg font-semibold text-gray-900">{workflow.name}</h3>
                        <p className="text-gray-500 mt-2 text-sm line-clamp-2">{workflow.description}</p>
                        <div className="mt-4 pt-4 border-t flex justify-between items-center">
                            <span className="text-xs text-gray-400">{workflow.tasks.length} Tasks</span>
                            <span className="text-xs px-2 py-1 bg-gray-100 rounded-full text-gray-600">
                                Created: {new Date(workflow.createdAt).toLocaleDateString()}
                            </span>
                        </div>
                    </div>
                ))}
                {workflows.length === 0 && (
                    <div className="col-span-full text-center py-10 text-gray-500">
                        No workflows found. Create one to get started.
                    </div>
                )}
            </div>
        </div>
    );
};

export default Workflows;
