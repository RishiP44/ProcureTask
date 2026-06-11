import { Request, Response } from 'express';
import Workflow from '../models/Workflow';
import Assignment from '../models/Assignment';

// @desc    Create a new workflow
// @route   POST /api/workflows
// @access  Private (Admin/HR)
export const createWorkflow = async (req: Request, res: Response) => {
    try {
        const { name, description, tasks } = req.body;

        // Basic validation
        if (!tasks || tasks.length === 0) {
            return res.status(400).json({ message: 'Workflow must have at least one task' });
        }

        const workflow = await Workflow.create({
            name,
            description,
            tasks,
            createdBy: (req as any).user.id,
        });

        res.status(201).json(workflow);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
};

// @desc    Get all workflows
// @route   GET /api/workflows
// @access  Private (Admin/HR)
export const getWorkflows = async (req: Request, res: Response) => {
    try {
        // Only return the latest version of workflows that are not archived
        const workflows = await Workflow.find({ isLatest: true, isArchived: false }).sort({ createdAt: -1 });
        res.json(workflows);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
};

// @desc    Get workflow by ID
// @route   GET /api/workflows/:id
// @access  Private (Admin/HR)
export const getWorkflowById = async (req: Request, res: Response) => {
    try {
        const workflow = await Workflow.findById(req.params.id);
        if (workflow) {
            res.json(workflow);
        } else {
            res.status(404).json({ message: 'Workflow not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
};

// @desc    Update a workflow template (Creates a new version)
// @route   PUT /api/workflows/:id
// @access  Private (Admin/HR)
export const updateWorkflow = async (req: Request, res: Response) => {
    try {
        const { name, description, tasks } = req.body;
        const currentWorkflow = await Workflow.findById(req.params.id);

        if (!currentWorkflow) {
            return res.status(404).json({ message: 'Workflow not found' });
        }

        // AI Assisted: Versioning logic - Mark current version as no longer latest
        currentWorkflow.isLatest = false;
        await currentWorkflow.save();

        // AI Assisted: Versioning logic - Create a new workflow document for the updated version
        const newWorkflow = await Workflow.create({
            name: name || currentWorkflow.name,
            description: description || currentWorkflow.description,
            tasks: tasks || currentWorkflow.tasks,
            createdBy: (req as any).user.id,
            version: currentWorkflow.version + 1,
            rootId: currentWorkflow.rootId || currentWorkflow._id,
            isLatest: true,
            isArchived: false,
        });

        res.json(newWorkflow);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
};

// @desc    Delete (archive) a workflow template
// @route   DELETE /api/workflows/:id
// @access  Private (Admin/HR)
export const deleteWorkflow = async (req: Request, res: Response) => {
    try {
        const workflow = await Workflow.findById(req.params.id);
        if (!workflow) {
            return res.status(404).json({ message: 'Workflow not found' });
        }

        // AI Assisted: Soft archival logic - Set isArchived to true instead of deleting
        workflow.isArchived = true;
        await workflow.save();

        res.json({ message: 'Workflow template archived successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
};

// @desc    Check if workflow has active assignments
// @route   GET /api/workflows/:id/assignments-check
// @access  Private (Admin/HR)
export const checkWorkflowAssignments = async (req: Request, res: Response) => {
    try {
        // AI Assisted: Versioning logic - Count active assignments for this specific version
        const activeCount = await Assignment.countDocuments({
            workflow: req.params.id,
            status: { $in: ['pending', 'in_progress'] },
        });

        res.json({ activeCount });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
};

// @desc    Get version history for a workflow
// @route   GET /api/workflows/:id/history
// @access  Private (Admin/HR)
export const getWorkflowHistory = async (req: Request, res: Response) => {
    try {
        const workflow = await Workflow.findById(req.params.id);
        if (!workflow) {
            return res.status(404).json({ message: 'Workflow not found' });
        }

        // AI Assisted: Historical workflow preservation - Find all versions sharing rootId
        const history = await Workflow.find({
            rootId: workflow.rootId || workflow._id,
        }).sort({ version: -1 });

        res.json(history);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
};
