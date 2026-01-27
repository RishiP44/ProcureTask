import { Request, Response } from 'express';
import Assignment from '../models/Assignment';
import Workflow from '../models/Workflow';
import User from '../models/User';

// @desc    Assign workflow to a user
// @route   POST /api/assignments
// @access  Private (Admin/HR)
export const assignWorkflow = async (req: Request, res: Response) => {
    try {
        const { userId, workflowId } = req.body;

        const workflow = await Workflow.findById(workflowId);
        if (!workflow) {
            return res.status(404).json({ message: 'Workflow not found' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Create tasks instances from workflow template
        const taskInstances = workflow.tasks.map(task => ({
            name: task.name,
            description: task.description,
            type: task.type,
            required: task.required,
            status: 'pending',
        }));

        const assignment = await Assignment.create({
            user: userId,
            workflow: workflowId,
            tasks: taskInstances,
            status: 'pending',
            assignedBy: (req as any).user.id,
        });

        res.status(201).json(assignment);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
};

// @desc    Get assignments for the logged-in user
// @route   GET /api/assignments/my-assignments
// @access  Private
export const getMyAssignments = async (req: Request, res: Response) => {
    try {
        const assignments = await Assignment.find({ user: (req as any).user.id })
            .populate('workflow', 'name description')
            .populate('assignedBy', 'name');
        res.json(assignments);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
};

// @desc    Get all assignments (Admin view)
// @route   GET /api/assignments
// @access  Private (Admin/HR)
export const getAllAssignments = async (req: Request, res: Response) => {
    try {
        const assignments = await Assignment.find()
            .populate('user', 'name email role')
            .populate('workflow', 'name')
            .sort({ createdAt: -1 });
        res.json(assignments);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
};

// @desc    Update task status (Complete / Add Document)
// @route   PUT /api/assignments/:id/tasks/:taskId
// @access  Private
export const updateTaskStatus = async (req: Request, res: Response) => {
    try {
        const { status, documentUrl } = req.body;
        const assignment = await Assignment.findById(req.params.id);

        if (!assignment) {
            return res.status(404).json({ message: 'Assignment not found' });
        }

        // Verify user owns this assignment (or is Admin)
        if (assignment.user.toString() !== (req as any).user.id && (req as any).user.role !== 'Admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const task = (assignment.tasks as any).id(req.params.taskId);
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        // Update task
        if (status) task.status = status;
        if (documentUrl) task.documentUrl = documentUrl;
        if (status === 'completed') task.completedAt = new Date();

        // Check if all tasks are completed
        const allCompleted = assignment.tasks.every(t => t.status === 'completed');
        assignment.status = allCompleted ? 'completed' : 'in_progress';

        await assignment.save();
        res.json(assignment);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
};
