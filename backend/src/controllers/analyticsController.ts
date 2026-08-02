import { Request, Response } from 'express';
import Assignment from '../models/Assignment';
import User from '../models/User';

// AI Assisted: Core controller logic to compute high-level and detailed analytics for Admin/HR dashboards.
export const getDashboardAnalytics = async (req: Request, res: Response) => {
    try {
        // 1. Calculate General KPI metrics
        const totalAssignments = await Assignment.countDocuments();
        const completedAssignments = await Assignment.countDocuments({ status: 'completed' });
        const inProgressAssignments = await Assignment.countDocuments({ status: 'in_progress' });
        const pendingAssignments = await Assignment.countDocuments({ status: 'pending' });

        const now = new Date();
        const overdueAssignments = await Assignment.countDocuments({
            status: { $ne: 'completed' },
            dueDate: { $lt: now }
        });

        const completionRate = totalAssignments > 0 
            ? Math.round((completedAssignments / totalAssignments) * 100) 
            : 0;

        // AI Assisted: Calculate average days to complete assignments
        const avgTimeRes = await Assignment.aggregate([
            { $match: { status: 'completed' } },
            {
                $project: {
                    durationDays: {
                        $divide: [
                            { $subtract: ['$updatedAt', '$createdAt'] },
                            1000 * 60 * 60 * 24
                        ]
                    }
                }
            },
            {
                $group: {
                    _id: null,
                    avgDays: { $avg: '$durationDays' }
                }
            }
        ]);
        const avgCompletionTime = avgTimeRes.length > 0 
            ? Math.round(avgTimeRes[0].avgDays * 10) / 10 
            : 0;

        // AI Assisted: Calculate SLA compliance (completed on or before due date)
        const slaRes = await Assignment.aggregate([
            { $match: { status: 'completed', dueDate: { $exists: true, $ne: null } } },
            {
                $project: {
                    isCompliant: {
                        $cond: [{ $lte: ['$updatedAt', '$dueDate'] }, 1, 0]
                    }
                }
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: 1 },
                    compliant: { $sum: '$isCompliant' }
                }
            }
        ]);
        const slaComplianceRate = slaRes.length > 0 
            ? Math.round((slaRes[0].compliant / slaRes[0].total) * 100) 
            : 100;

        // 2. Volume Trend Analysis (last 6 months)
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
        sixMonthsAgo.setDate(1);
        sixMonthsAgo.setHours(0, 0, 0, 0);

        const startsTrend = await Assignment.aggregate([
            { $match: { createdAt: { $gte: sixMonthsAgo } } },
            {
                $group: {
                    _id: {
                        year: { $year: '$createdAt' },
                        month: { $month: '$createdAt' }
                    },
                    started: { $sum: 1 }
                }
            }
        ]);

        const completionsTrend = await Assignment.aggregate([
            { $match: { status: 'completed', updatedAt: { $gte: sixMonthsAgo } } },
            {
                $group: {
                    _id: {
                        year: { $year: '$updatedAt' },
                        month: { $month: '$updatedAt' }
                    },
                    completed: { $sum: 1 }
                }
            }
        ]);

        const monthsTrend = [];
        const currentDate = new Date();
        for (let i = 5; i >= 0; i--) {
            const d = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
            const monthName = d.toLocaleString('default', { month: 'short' });
            const year = d.getFullYear();
            const monthNum = d.getMonth() + 1;

            const startData = startsTrend.find(t => t._id.year === year && t._id.month === monthNum);
            const compData = completionsTrend.find(t => t._id.year === year && t._id.month === monthNum);

            monthsTrend.push({
                month: `${monthName} ${year}`,
                started: startData ? startData.started : 0,
                completed: compData ? compData.completed : 0
            });
        }

        // 3. Workflow Template Performance
        const workflowPerformance = await Assignment.aggregate([
            {
                $group: {
                    _id: '$workflow',
                    totalCount: { $sum: 1 },
                    completedCount: {
                        $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
                    },
                    totalDurationMs: {
                        $sum: {
                            $cond: [
                                { $eq: ['$status', 'completed'] },
                                { $subtract: ['$updatedAt', '$createdAt'] },
                                0
                            ]
                        }
                    }
                }
            },
            {
                $lookup: {
                    from: 'workflows',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'workflowInfo'
                }
            },
            { $unwind: '$workflowInfo' },
            {
                $project: {
                    _id: 1,
                    name: '$workflowInfo.name',
                    audience: '$workflowInfo.audience',
                    totalCount: 1,
                    completedCount: 1,
                    avgDays: {
                        $cond: [
                            { $gt: ['$completedCount', 0] },
                            {
                                $divide: [
                                    { $divide: ['$totalDurationMs', '$completedCount'] },
                                    1000 * 60 * 60 * 24
                                ]
                            },
                            0
                        ]
                    }
                }
            },
            { $sort: { totalCount: -1 } }
        ]);

        // 4. Task Bottlenecks Analysis
        const taskBottlenecks = await Assignment.aggregate([
            { $unwind: '$tasks' },
            {
                $project: {
                    taskName: '$tasks.name',
                    status: '$tasks.status',
                    completedAt: '$tasks.completedAt',
                    createdAt: '$createdAt',
                    isPending: { $cond: [{ $eq: ['$tasks.status', 'pending'] }, 1, 0] },
                    isCompleted: { $cond: [{ $eq: ['$tasks.status', 'completed'] }, 1, 0] },
                    durationMs: {
                        $cond: [
                            { $and: [{ $eq: ['$tasks.status', 'completed'] }, { $ne: [{ $ifNull: ['$tasks.completedAt', null] }, null] }] },
                            { $subtract: ['$tasks.completedAt', '$createdAt'] },
                            null
                        ]
                    }
                }
            },
            {
                $group: {
                    _id: '$taskName',
                    pendingCount: { $sum: '$isPending' },
                    completedCount: { $sum: '$isCompleted' },
                    totalCount: { $sum: 1 },
                    avgMs: { $avg: '$durationMs' }
                }
            },
            {
                $project: {
                    name: '$_id',
                    _id: 0,
                    pendingCount: 1,
                    completedCount: 1,
                    totalCount: 1,
                    avgDays: {
                        $cond: [
                            { $eq: [{ $ifNull: ['$avgMs', null] }, null] },
                            0,
                            { $divide: ['$avgMs', 1000 * 60 * 60 * 24] }
                        ]
                    }
                }
            },
            { $sort: { avgDays: -1 } },
            { $limit: 10 }
        ]);

        // 5. Department Breakdown (Employees)
        const departmentDistribution = await User.aggregate([
            { $match: { role: 'Employee' } },
            {
                $group: {
                    _id: '$department',
                    count: { $sum: 1 }
                }
            },
            {
                $project: {
                    department: { $ifNull: ['$_id', 'Unassigned'] },
                    count: 1,
                    _id: 0
                }
            },
            { $sort: { count: -1 } }
        ]);

        // 6. Vendor Type Breakdown
        const vendorTypeDistribution = await User.aggregate([
            { $match: { role: 'Vendor' } },
            {
                $group: {
                    _id: '$vendorType',
                    count: { $sum: 1 }
                }
            },
            {
                $project: {
                    type: { $ifNull: ['$_id', 'General'] },
                    count: 1,
                    _id: 0
                }
            },
            { $sort: { count: -1 } }
        ]);

        // Return compiled analytics
        res.json({
            kpis: {
                totalAssignments,
                completedAssignments,
                inProgressAssignments,
                pendingAssignments,
                overdueAssignments,
                completionRate,
                avgCompletionTime,
                slaComplianceRate
            },
            monthsTrend,
            workflowPerformance,
            taskBottlenecks,
            departmentDistribution,
            vendorTypeDistribution
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
};
