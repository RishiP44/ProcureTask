import { Request, Response } from 'express';
import Workflow, { ITaskTemplate } from '../models/Workflow';

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
        const workflows = await Workflow.find().sort({ createdAt: -1 });
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
// @desc    Update a workflow template
// @route   PUT /api/workflows/:id
// @access  Private (Admin/HR)
export const updateWorkflow = async (req: Request, res: Response) => {
    try {
        const { name, description, tasks } = req.body;
        const workflow = await Workflow.findById(req.params.id);

        if (!workflow) {
            return res.status(404).json({ message: 'Workflow not found' });
        }

        workflow.name = name || workflow.name;
        workflow.description = description || workflow.description;
        if (tasks) workflow.tasks = tasks;

        await workflow.save();
        res.json(workflow);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
};

// @desc    Delete a workflow template
// @route   DELETE /api/workflows/:id
// @access  Private (Admin/HR)
export const deleteWorkflow = async (req: Request, res: Response) => {
    try {
        const workflow = await Workflow.findById(req.params.id);
        if (!workflow) {
            return res.status(404).json({ message: 'Workflow not found' });
        }

        await workflow.deleteOne();
        res.json({ message: 'Workflow template removed' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
};
