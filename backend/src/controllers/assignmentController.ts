import { Request, Response } from 'express';
import Assignment from '../models/Assignment';
import Workflow from '../models/Workflow';
import User from '../models/User';
import Notification from '../models/Notification';
import { sendTaskAssignmentEmail } from '../services/emailService';

// @desc    Assign workflow to a user
export const assignWorkflow = async (req: Request, res: Response) => {
    try {
        const { userId, workflowId } = req.body;

        const workflow = await Workflow.findById(workflowId);
        if (!workflow) return res.status(404).json({ message: 'Workflow not found' });

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const assigner = await User.findById((req as any).user.id);

        const taskInstances = workflow.tasks.map((task: any) => ({
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

        // Create in-app notification
        await Notification.create({
            user: userId,
            title: 'New Task Assigned',
            message: `${assigner?.name || 'HR'} assigned you "${workflow.name}"`,
            type: 'task_assigned',
            link: `/assignments/${assignment._id}`,
        });

        // Send email notification (non-blocking)
        sendTaskAssignmentEmail({
            to: user.email,
            employeeName: user.name,
            workflowName: workflow.name,
            assignedBy: assigner?.name || 'HR Team',
            assignmentId: assignment._id.toString(),
        }).catch((err: any) => console.error('Email error:', err));

        res.status(201).json(assignment);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
};

// @desc    Get assignments for the logged-in user
export const getMyAssignments = async (req: Request, res: Response) => {
    try {
        const assignments = await Assignment.find({ user: (req as any).user.id })
            .populate('workflow', 'name description')
            .populate('assignedBy', 'name')
            .sort({ createdAt: -1 });
        res.json(assignments);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
};

// @desc    Get all assignments (Admin/HR view)
export const getAllAssignments = async (req: Request, res: Response) => {
    try {
        const { userId } = req.query;
        const filter: any = {};
        if (userId) filter.user = userId;

        const assignments = await Assignment.find(filter)
            .populate('user', 'name email role department position avatar')
            .populate('workflow', 'name')
            .populate('assignedBy', 'name')
            .sort({ createdAt: -1 });
        res.json(assignments);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
};

// @desc    Get single assignment by ID
export const getAssignmentById = async (req: Request, res: Response) => {
    try {
        const assignment = await Assignment.findById(req.params.id)
            .populate('user', 'name email role department position avatar')
            .populate('workflow', 'name description')
            .populate('assignedBy', 'name');
        if (!assignment) return res.status(404).json({ message: 'Assignment not found' });
        res.json(assignment);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
};

// @desc    Update task status
export const updateTaskStatus = async (req: Request, res: Response) => {
    try {
        const { status, documentUrl } = req.body;
        const assignment = await Assignment.findById(req.params.id).populate('user', 'name');

        if (!assignment) return res.status(404).json({ message: 'Assignment not found' });

        if (
            assignment.user._id.toString() !== (req as any).user.id &&
            (req as any).user.role !== 'Admin' &&
            (req as any).user.role !== 'HR'
        ) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const task = (assignment.tasks as any).id(req.params.taskId);
        if (!task) return res.status(404).json({ message: 'Task not found' });

        if (status) task.status = status;
        if (documentUrl) task.documentUrl = documentUrl;
        if (status === 'completed') task.completedAt = new Date();

        const allCompleted = assignment.tasks.every((t: any) => t.status === 'completed');
        assignment.status = allCompleted ? 'completed' : 'in_progress';

        await assignment.save();

        // Notify assignedBy if all completed
        if (allCompleted && assignment.assignedBy) {
            await Notification.create({
                user: assignment.assignedBy,
                title: 'Assignment Completed',
                message: `${(assignment.user as any).name} completed all tasks in the assigned workflow.`,
                type: 'task_completed',
                link: `/assignments/${assignment._id}`,
            });
        }

        res.json(assignment);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
};
