import { Request, Response } from 'express';
import AuditLog from '../models/AuditLog';

// @desc    Get all audit logs
// @route   GET /api/audit-logs
// @access  Private (Admin/HR)
export const getAuditLogs = async (req: Request, res: Response) => {
    try {
        const { targetType, action, actorId, search, startDate, endDate } = req.query;
        
        const filter: any = {};

        if (targetType) {
            filter.targetType = targetType;
        }

        if (action) {
            filter.action = action;
        }

        if (actorId) {
            filter.actor = actorId;
        }

        // Date range filtering
        if (startDate || endDate) {
            filter.createdAt = {};
            if (startDate) {
                filter.createdAt.$gte = new Date(startDate as string);
            }
            if (endDate) {
                const end = new Date(endDate as string);
                end.setHours(23, 59, 59, 999);
                filter.createdAt.$lte = end;
            }
        }

        // Fetch logs and populate actor info (name, email, role, etc.)
        let logs = await AuditLog.find(filter)
            .populate('actor', 'name email role department position companyName')
            .sort({ createdAt: -1 });

        // Search filter matching actor details, action names, target types, or details
        if (search) {
            const queryStr = (search as string).toLowerCase();
            logs = logs.filter(log => {
                const actorName = log.actor && (log.actor as any).name ? (log.actor as any).name.toLowerCase() : '';
                const actorEmail = log.actor && (log.actor as any).email ? (log.actor as any).email.toLowerCase() : '';
                const actorCompanyName = log.actor && (log.actor as any).companyName ? (log.actor as any).companyName.toLowerCase() : '';
                const details = log.details ? log.details.toLowerCase() : '';
                const actionName = log.action ? log.action.toLowerCase() : '';
                const target = log.targetType ? log.targetType.toLowerCase() : '';

                return (
                    actorName.includes(queryStr) ||
                    actorEmail.includes(queryStr) ||
                    actorCompanyName.includes(queryStr) ||
                    details.includes(queryStr) ||
                    actionName.includes(queryStr) ||
                    target.includes(queryStr)
                );
            });
        }

        res.json(logs);
    } catch (error) {
        console.error('Error fetching audit logs:', error);
        res.status(500).json({ message: 'Server Error', error });
    }
};
