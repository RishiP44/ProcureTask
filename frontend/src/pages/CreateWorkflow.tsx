import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';

const CreateWorkflow = () => {
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [audience, setAudience] = useState<'Employee' | 'Vendor'>('Employee');
    const [tasks, setTasks] = useState<{ name: string; type: string; required: boolean }[]>([
        { name: '', type: 'checkbox', required: true },
    ]);
    const [saving, setSaving] = useState(false);

    const addTask = () => {
        setTasks([...tasks, { name: '', type: 'checkbox', required: true }]);
    };

    const removeTask = (index: number) => {
        if (tasks.length <= 1) {
            toast.error('A workflow needs at least one task');
            return;
        }
        const newTasks = [...tasks];
        newTasks.splice(index, 1);
        setTasks(newTasks);
    };

    const updateTask = (index: number, field: string, value: any) => {
        const newTasks = [...tasks];
        (newTasks[index] as any)[field] = value;
        setTasks(newTasks);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const validTasks = tasks.filter(t => t.name.trim() !== '');
        if (!name.trim()) {
            toast.error('Workflow name is required');
            return;
        }
        if (validTasks.length === 0) {
            toast.error('Add at least one task with a name before saving');
            return;
        }

        setSaving(true);
        try {
            const res = await api.post('/workflows', {
                name: name.trim(),
                description,
                audience,
                tasks: validTasks,
            });
            toast.success(`${audience} workflow created successfully`);
            // Jump straight into assign with the right audience + template selected
            navigate(`/workflows?tab=assign&workflowId=${res.data._id}&audience=${audience}`);
        } catch (error: any) {
            const msg = error.response?.data?.message || 'Failed to create workflow';
            toast.error(msg);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Create New Workflow</h2>
            <p className="text-sm text-slate-500 mb-6">
                Choose Employee or Vendor audience — this controls who the template can be assigned to.
            </p>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Workflow Name</label>
                        <input
                            type="text"
                            required
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder={audience === 'Vendor' ? 'e.g. Vendor Onboarding Pack' : 'e.g. New Hire Onboarding'}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Workflow Audience</label>
                        <div className="mt-2 grid grid-cols-2 gap-3">
                            {([
                                { value: 'Employee' as const, label: 'Employee', hint: 'Internal staff & HR onboarding' },
                                { value: 'Vendor' as const, label: 'Vendor', hint: 'Supplier delivery / procurement' },
                            ]).map(opt => (
                                <button
                                    key={opt.value}
                                    type="button"
                                    onClick={() => setAudience(opt.value)}
                                    className={`text-left p-4 rounded-xl border-2 transition-all ${
                                        audience === opt.value
                                            ? opt.value === 'Vendor'
                                                ? 'border-amber-500 bg-amber-50'
                                                : 'border-emerald-500 bg-emerald-50'
                                            : 'border-slate-200 bg-white hover:border-slate-300'
                                    }`}
                                >
                                    <div className="text-sm font-black text-slate-900">{opt.label}</div>
                                    <div className="text-xs text-slate-500 mt-1">{opt.hint}</div>
                                </button>
                            ))}
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                            This workflow can only be assigned to accounts in the selected directory.
                        </p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Description</label>
                        <textarea
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                            rows={3}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Describe what this process covers..."
                        />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-medium text-gray-900">Tasks</h3>
                        <button
                            type="button"
                            onClick={addTask}
                            className="text-sm text-indigo-600 hover:text-indigo-900 font-medium"
                        >
                            + Add Task
                        </button>
                    </div>

                    <div className="space-y-4">
                        {tasks.map((task, index) => (
                            <div key={index} className="flex gap-4 items-start bg-gray-50 p-4 rounded-md">
                                <div className="flex-1 space-y-2">
                                    <input
                                        type="text"
                                        placeholder="Task Name"
                                        required
                                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                                        value={task.name}
                                        onChange={(e) => updateTask(index, 'name', e.target.value)}
                                    />
                                    <div className="flex gap-4">
                                        <select
                                            className="block w-1/2 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                                            value={task.type}
                                            onChange={(e) => updateTask(index, 'type', e.target.value)}
                                        >
                                            <option value="checkbox">Checkbox</option>
                                            <option value="document">Document Upload</option>
                                        </select>
                                        <label className="flex items-center space-x-2 text-sm text-gray-700">
                                            <input
                                                type="checkbox"
                                                checked={task.required}
                                                onChange={(e) => updateTask(index, 'required', e.target.checked)}
                                                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                            />
                                            <span>Required</span>
                                        </label>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => removeTask(index)}
                                    className="text-red-500 hover:text-red-700"
                                >
                                    ✕
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex justify-end gap-4">
                    <button
                        type="button"
                        onClick={() => navigate('/workflows')}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={saving}
                        className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-60"
                    >
                        {saving ? 'Saving…' : `Save ${audience} Workflow`}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreateWorkflow;
