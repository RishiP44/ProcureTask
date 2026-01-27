import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

import toast from 'react-hot-toast';

const AssignmentDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [assignment, setAssignment] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState<string | null>(null);

    useEffect(() => {
        const fetchAssignment = async () => {
            try {
                const res = await api.get(`/assignments/my-assignments`);
                const myAssignments = res.data;
                const found = myAssignments.find((a: any) => a._id === id);
                setAssignment(found);
                setLoading(false);
            } catch (error) {
                console.error(error);
                setLoading(false);
            }
        };
        fetchAssignment();
    }, [id]);

    const handleTaskComplete = async (taskId: string, type: string) => {
        try {
            await api.put(`/assignments/${id}/tasks/${taskId}`, { status: 'completed' });
            updateLocalTask(taskId, { status: 'completed' });
            toast.success('Task marked as done!');
        } catch (error) {
            toast.error('Failed to update task');
        }
    };

    const handleFileUpload = async (taskId: string, e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        setUploading(taskId);
        try {
            // 1. Upload File
            const uploadRes = await api.post('/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            // 2. Update Task with File URL and Complete it
            const documentUrl = uploadRes.data.filePath;
            await api.put(`/assignments/${id}/tasks/${taskId}`, {
                status: 'completed',
                documentUrl
            });

            updateLocalTask(taskId, { status: 'completed', documentUrl });
            toast.success('Document uploaded successfully!');
        } catch (error) {
            toast.error('File upload failed');
        } finally {
            setUploading(null);
        }
    };

    const updateLocalTask = (taskId: string, updates: any) => {
        setAssignment((prev: any) => {
            if (!prev) return null;
            const newTasks = prev.tasks.map((t: any) =>
                t._id === taskId ? { ...t, ...updates } : t
            );
            return { ...prev, tasks: newTasks };
        });
    }

    if (loading) return <div>Loading...</div>;
    if (!assignment) return <div>Assignment not found.</div>;

    return (
        <div className="max-w-4xl mx-auto">
            <button onClick={() => navigate('/dashboard')} className="mb-4 text-indigo-600 hover:underline">
                &larr; Back to Dashboard
            </button>

            <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden mb-6">
                <div className="px-6 py-4 border-b bg-gray-50">
                    <h2 className="text-xl font-bold text-gray-900">{assignment.workflow.name}</h2>
                    <p className="text-sm text-gray-500">{assignment.workflow.description}</p>
                </div>
                <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <span className="text-gray-500 text-sm">Status:</span>
                            <span className={`ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                ${assignment.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                {assignment.status}
                            </span>
                        </div>
                    </div>

                    <h3 className="text-lg font-medium text-gray-900 mb-4">Tasks</h3>
                    <div className="space-y-4">
                        {assignment.tasks.map((task: any) => (
                            <div key={task._id} className="flex flex-col sm:flex-row gap-4 p-4 border rounded-lg bg-gray-50">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <h4 className="text-md font-semibold text-gray-900">{task.name}</h4>
                                        {task.required && <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded">Required</span>}
                                    </div>
                                    <p className="text-sm text-gray-600 mt-1">{task.type === 'document' ? '📄 Document Upload Required' : '✅ Checkbox Confirmation'}</p>
                                    {task.documentUrl && (
                                        <a href={`http://localhost:5000${task.documentUrl}`} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline mt-2 block">
                                            View Uploaded Document
                                        </a>
                                    )}
                                </div>
                                <div className="flex items-center">
                                    {task.status === 'completed' ? (
                                        <span className="text-green-600 font-medium flex items-center">
                                            ✓ Completed
                                        </span>
                                    ) : (
                                        task.type === 'checkbox' ? (
                                            <button
                                                onClick={() => handleTaskComplete(task._id, 'checkbox')}
                                                className="bg-indigo-600 text-white px-4 py-2 rounded text-sm hover:bg-indigo-700"
                                            >
                                                Mark as Done
                                            </button>
                                        ) : (
                                            <div className="relative">
                                                <input
                                                    type="file"
                                                    id={`file-${task._id}`}
                                                    className="hidden"
                                                    onChange={(e) => handleFileUpload(task._id, e)}
                                                    accept=".pdf,.png,.jpg,.jpeg"
                                                />
                                                <label
                                                    htmlFor={`file-${task._id}`}
                                                    className={`bg-white text-indigo-600 border border-indigo-600 px-4 py-2 rounded text-sm hover:bg-indigo-50 cursor-pointer inline-block ${uploading === task._id ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                >
                                                    {uploading === task._id ? 'Uploading...' : 'Upload Document'}
                                                </label>
                                            </div>
                                        )
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AssignmentDetail;
