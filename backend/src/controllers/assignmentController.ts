import { Request, Response } from 'express';
import Assignment from '../models/Assignment';
import Workflow from '../models/Workflow';
import User from '../models/User';
import { NotificationService } from '../services/notificationService';

// @desc    Assign workflow to a user
export const assignWorkflow = async (req: Request, res: Response) => {
    try {
        const { userId, workflowId, dueDate } = req.body;

        const workflow = await Workflow.findById(workflowId);
        if (!workflow) return res.status(404).json({ message: 'Workflow not found' });

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });
        if (!['Employee', 'Vendor'].includes(user.role)) {
            return res.status(400).json({ message: 'Workflows can only be assigned to employees or vendors' });
        }
        const workflowAudience = workflow.audience || 'Employee';
        if (workflowAudience !== user.role) {
            return res.status(400).json({ message: `${workflowAudience} workflows cannot be assigned to ${user.role.toLowerCase()} accounts` });
        }

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
            dueDate: dueDate ? new Date(dueDate) : undefined,
        });

        // Create in-app notification
        NotificationService.sendNotification({
            userId: userId,
            title: 'New Task Assigned',
            message: `${assigner?.name || 'HR'} assigned you "${workflow.name}"`,
            type: 'task_assigned',
            link: `/assignments/${assignment._id}`,
            category: 'assignment_alert',
            assignmentId: assignment._id
        }).catch((err: any) => console.error('In-app notification error:', err));

        // Send email notification (non-blocking)
        NotificationService.sendEmailNotification({
            userId: userId,
            to: user.email,
            subject: `New Assignment Alert: ${workflow.name}`,
            body: `Hi ${user.name},\n\nYou have been assigned a new workflow "${workflow.name}" by ${assigner?.name || 'HR Team'}.\n\nView details: http://localhost:5173/assignments/${assignment._id}`,
            category: 'assignment_alert',
            assignmentId: assignment._id
        }).catch((err: any) => console.error('Email notification error:', err));

        res.status(201).json(assignment);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
};

// @desc    Get assignments for the logged-in user
export const getMyAssignments = async (req: Request, res: Response) => {
    try {
        const assignments = await Assignment.find({ user: (req as any).user.id })
            .populate('workflow', 'name description audience')
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
            .populate('user', 'name email role department position avatar companyName vendorType')
            .populate('workflow', 'name audience')
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
        const assignment = await Assignment.findById(req.params.id)
            .populate('user', 'name email')
            .populate('workflow', 'name');

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
            NotificationService.sendNotification({
                userId: assignment.assignedBy,
                title: 'Assignment Completed',
                message: `${(assignment.user as any).name} completed all tasks in the assigned workflow.`,
                type: 'task_completed',
                link: `/assignments/${assignment._id}`,
                category: 'task_completed',
                assignmentId: assignment._id
            }).catch((err: any) => console.error('Task completed notification error:', err));

            // Optional: send email to the assigner
            const assigner = await User.findById(assignment.assignedBy);
            if (assigner) {
                NotificationService.sendEmailNotification({
                    userId: assignment.assignedBy,
                    to: assigner.email,
                    subject: `Assignment Completed: ${((assignment as any).workflow as any).name}`,
                    body: `Hi ${assigner.name},\n\n${(assignment.user as any).name} has completed all tasks in the assigned workflow "${((assignment as any).workflow as any).name}".\n\nView details: http://localhost:5173/assignments/${assignment._id}`,
                    category: 'task_completed',
                    assignmentId: assignment._id
                }).catch((err: any) => console.error('Task completed email error:', err));
            }
        }

        res.json(assignment);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
};
