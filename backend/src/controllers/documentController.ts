import { Request, Response } from 'express';
import Assignment from '../models/Assignment';

// @desc    Get all uploaded documents across all assignments
// @route   GET /api/documents
// @access  Private (Admin/HR)
export const getAllDocuments = async (req: Request, res: Response) => {
    try {
        // Fetch all assignments that have at least one completed task with a documentUrl
        // Optimization: We could use aggregation, but for MVP fetching all and filtering in memory is fine.
        const assignments = await Assignment.find()
            .populate('user', 'name email')
            .populate('workflow', 'name');

        const documents: any[] = [];

        assignments.forEach((assignment: any) => {
            assignment.tasks.forEach((task: any) => {
                if (task.type === 'document' && task.documentUrl) {
                    documents.push({
                        _id: task._id,
                        fileName: task.documentUrl.split('/').pop(), // Extract filename from URL
                        url: task.documentUrl,
                        uploadedBy: assignment.user?.name || 'Unknown',
                        workflowName: assignment.workflow?.name || 'Unknown',
                        date: task.completedAt || assignment.updatedAt
                    });
                }
            });
        });

        // Sort by date desc
        documents.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        res.json(documents);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
};
