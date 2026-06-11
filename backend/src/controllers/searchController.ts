import { Request, Response } from 'express';
import User from '../models/User';
import Workflow from '../models/Workflow';
import OfferLetter from '../models/OfferLetter';
import Assignment from '../models/Assignment';

export const globalSearch = async (req: Request, res: Response) => {
    try {
        const q = req.query.q as string;
        if (!q || q.trim() === '') {
            return res.json({
                users: [],
                workflows: [],
                offerLetters: [],
                assignments: []
            });
        }

        const regex = new RegExp(q, 'i');
        const numVal = Number(q);
        const isNum = !isNaN(numVal);

        // 1. Search Users
        const userQuery: any = {
            $or: [
                { name: regex },
                { email: regex },
                { department: regex },
                { position: regex },
                { role: regex },
                { status: regex }
            ]
        };
        const users = await User.find(userQuery).select('-passwordHash').limit(10);

        // 2. Search Workflows
        const workflowQuery: any = {
            $or: [
                { name: regex },
                { description: regex },
                { 'tasks.name': regex },
                { 'tasks.description': regex }
            ]
        };
        const workflows = await Workflow.find(workflowQuery).limit(10);

        // 3. Search Offer Letters
        const offerLetterQuery: any = {
            $or: [
                { 'candidate.name': regex },
                { 'candidate.email': regex },
                { position: regex },
                { department: regex },
                { status: regex }
            ]
        };
        if (isNum) {
            offerLetterQuery.$or.push({ salary: numVal });
        }
        const offerLetters = await OfferLetter.find(offerLetterQuery).limit(10);

        // 4. Search Assignments (populate and match user or workflow)
        const matchedUsersForAssign = await User.find({
            $or: [{ name: regex }, { email: regex }]
        }).select('_id');
        
        const matchedWorkflowsForAssign = await Workflow.find({
            $or: [{ name: regex }]
        }).select('_id');

        const assignmentQuery: any = {
            $or: [
                { status: regex },
                { user: { $in: matchedUsersForAssign.map(u => u._id) } },
                { workflow: { $in: matchedWorkflowsForAssign.map(w => w._id) } },
                { 'tasks.name': regex }
            ]
        };
        
        const assignments = await Assignment.find(assignmentQuery)
            .populate('user', 'name email role department position avatar')
            .populate('workflow', 'name')
            .populate('assignedBy', 'name')
            .limit(10);

        res.json({
            users,
            workflows,
            offerLetters,
            assignments
        });
    } catch (error) {
        res.status(500).json({ message: 'Global search error', error });
    }
};
