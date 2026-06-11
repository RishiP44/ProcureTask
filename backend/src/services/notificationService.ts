import mongoose from 'mongoose';
import Notification from '../models/Notification';
import AlertLog from '../models/AlertLog';
import Assignment from '../models/Assignment';
import User from '../models/User';

export interface NotificationParams {
    userId: string | mongoose.Types.ObjectId;
    title: string;
    message: string;
    type: string;
    link?: string;
    category: 'assignment_alert' | 'overdue_reminder' | 'missing_document' | 'task_completed';
    assignmentId?: string | mongoose.Types.ObjectId;
    taskName?: string;
}

export interface EmailParams {
    userId: string | mongoose.Types.ObjectId;
    to: string;
    subject: string;
    body: string;
    category: 'assignment_alert' | 'overdue_reminder' | 'missing_document' | 'task_completed';
    assignmentId?: string | mongoose.Types.ObjectId;
    taskName?: string;
}

export class NotificationService {
    /**
     * Send in-app notification and log it.
     */
    static async sendNotification({
        userId,
        title,
        message,
        type,
        link,
        category,
        assignmentId,
        taskName
    }: NotificationParams) {
        try {
            // Create in-app notification
            const notif = await Notification.create({
                user: userId,
                title,
                message,
                type,
                link,
                read: false
            });

            // Log to AlertLog
            await AlertLog.create({
                user: userId,
                assignment: assignmentId,
                taskName,
                type: 'in-app',
                category,
                title,
                message,
                status: 'success',
                sentAt: new Date()
            });

            return notif;
        } catch (error: any) {
            console.error('❌ Error sending in-app notification:', error);
            // Log failed alert
            await AlertLog.create({
                user: userId,
                assignment: assignmentId,
                taskName,
                type: 'in-app',
                category,
                title,
                message,
                status: 'failed',
                errorDetail: error.message,
                sentAt: new Date()
            }).catch(err => console.error('AlertLog write fail:', err));
            throw error;
        }
    }

    /**
     * Simulate sending an email and log it.
     */
    static async sendEmailNotification({
        userId,
        to,
        subject,
        body,
        category,
        assignmentId,
        taskName
    }: EmailParams) {
        try {
            console.log(`📧 Simulation: Sending email to ${to}`);
            console.log(`Subject: ${subject}`);
            console.log(`Body: ${body}`);
            console.log('----------------------------------------------------');

            // Log to AlertLog
            const log = await AlertLog.create({
                user: userId,
                assignment: assignmentId,
                taskName,
                type: 'email',
                category,
                title: subject,
                message: body,
                status: 'success',
                sentAt: new Date()
            });

            return log;
        } catch (error: any) {
            console.error('❌ Error in email notification simulation:', error);
            await AlertLog.create({
                user: userId,
                assignment: assignmentId,
                taskName,
                type: 'email',
                category,
                title: subject,
                message: body,
                status: 'failed',
                errorDetail: error.message,
                sentAt: new Date()
            }).catch(err => console.error('AlertLog write fail:', err));
            throw error;
        }
    }

    /**
     * Run reminder checks on all pending and in_progress assignments.
     */
    static async runReminderCheck() {
        const results = {
            overdueRemindersSent: 0,
            missingDocumentsSent: 0,
            checkedAssignments: 0
        };

        try {
            // Find all active assignments
            const assignments = await Assignment.find({
                status: { $in: ['pending', 'in_progress'] }
            })
            .populate('user')
            .populate('workflow');

            results.checkedAssignments = assignments.length;

            const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

            for (const assignment of assignments) {
                const user = assignment.user as any;
                const workflow = assignment.workflow as any;

                if (!user || !workflow) continue;

                // 1. Check if assignment is overdue
                if (assignment.dueDate && new Date(assignment.dueDate) < new Date()) {
                    // Check if overdue reminder was sent in the last 24 hours
                    const alreadySent = await AlertLog.findOne({
                        user: user._id,
                        assignment: assignment._id,
                        category: 'overdue_reminder',
                        sentAt: { $gt: oneDayAgo }
                    });

                    if (!alreadySent) {
                        const title = 'Workflow Overdue';
                        const message = `Your assigned workflow "${workflow.name}" is overdue since ${new Date(assignment.dueDate).toLocaleDateString()}.`;
                        const link = `/assignments/${assignment._id}`;

                        // Send in-app notification
                        await this.sendNotification({
                            userId: user._id,
                            title,
                            message,
                            type: 'overdue_reminder',
                            link,
                            category: 'overdue_reminder',
                            assignmentId: assignment._id
                        });

                        // Send simulated email notification
                        await this.sendEmailNotification({
                            userId: user._id,
                            to: user.email,
                            subject: `URGENT: Workflow Overdue - ${workflow.name}`,
                            body: `Dear ${user.name},\n\nYour workflow assignment "${workflow.name}" was due on ${new Date(assignment.dueDate).toLocaleDateString()} and is currently overdue. Please review and complete your pending tasks.\n\nView details: http://localhost:5173/assignments/${assignment._id}`,
                            category: 'overdue_reminder',
                            assignmentId: assignment._id
                        });

                        assignment.lastReminderSentAt = new Date();
                        await assignment.save();
                        results.overdueRemindersSent++;
                    }
                }

                // 2. Check for missing document tasks
                // We send a reminder if the assignment is overdue OR close to due (within 2 days)
                const isCloseOrOverdue = assignment.dueDate && 
                    (new Date(assignment.dueDate) < new Date(Date.now() + 2 * 24 * 60 * 60 * 1000));

                if (isCloseOrOverdue) {
                    for (const task of assignment.tasks) {
                        if (task.type === 'document' && task.required && task.status === 'pending') {
                            // Check if missing document alert was sent for this task in the last 24 hours
                            const alreadySentDoc = await AlertLog.findOne({
                                user: user._id,
                                assignment: assignment._id,
                                taskName: task.name,
                                category: 'missing_document',
                                sentAt: { $gt: oneDayAgo }
                            });

                            if (!alreadySentDoc) {
                                const title = 'Missing Required Document';
                                const message = `Please upload the required document for task "${task.name}" in "${workflow.name}".`;
                                const link = `/assignments/${assignment._id}`;

                                // Send in-app notification
                                await this.sendNotification({
                                    userId: user._id,
                                    title,
                                    message,
                                    type: 'missing_document',
                                    link,
                                    category: 'missing_document',
                                    assignmentId: assignment._id,
                                    taskName: task.name
                                });

                                // Send simulated email
                                await this.sendEmailNotification({
                                    userId: user._id,
                                    to: user.email,
                                    subject: `Action Required: Missing Document for ${workflow.name}`,
                                    body: `Dear ${user.name},\n\nYou have a pending required document upload for "${task.name}" in the workflow "${workflow.name}". Please upload the document to proceed.\n\nView details: http://localhost:5173/assignments/${assignment._id}`,
                                    category: 'missing_document',
                                    assignmentId: assignment._id,
                                    taskName: task.name
                                });

                                results.missingDocumentsSent++;
                            }
                        }
                    }
                }
            }

            return results;
        } catch (error) {
            console.error('❌ Error running reminder checks:', error);
            throw error;
        }
    }

    /**
     * Trigger a test notification scenario immediately, bypassing all checks.
     */
    static async triggerTestScenario(scenarioType: string, assignmentId: string) {
        try {
            const assignment = await Assignment.findById(assignmentId)
                .populate('user')
                .populate('workflow');

            if (!assignment) throw new Error('Assignment not found');

            const user = assignment.user as any;
            const workflow = assignment.workflow as any;

            if (!user || !workflow) throw new Error('User or workflow not populated');

            if (scenarioType === 'assignment_alert') {
                const title = 'New Task Assigned';
                const message = `HR assigned you "${workflow.name}"`;
                const link = `/assignments/${assignment._id}`;

                await this.sendNotification({
                    userId: user._id,
                    title,
                    message,
                    type: 'task_assigned',
                    link,
                    category: 'assignment_alert',
                    assignmentId: assignment._id
                });

                await this.sendEmailNotification({
                    userId: user._id,
                    to: user.email,
                    subject: `New Assignment Alert: ${workflow.name}`,
                    body: `Hi ${user.name},\n\nYou have been assigned a new workflow "${workflow.name}".\n\nView details: http://localhost:5173/assignments/${assignment._id}`,
                    category: 'assignment_alert',
                    assignmentId: assignment._id
                });
            } else if (scenarioType === 'overdue_reminder') {
                const dueDateString = assignment.dueDate ? new Date(assignment.dueDate).toLocaleDateString() : 'recently';
                const title = 'Workflow Overdue (Simulation)';
                const message = `Your assigned workflow "${workflow.name}" is overdue since ${dueDateString}.`;
                const link = `/assignments/${assignment._id}`;

                await this.sendNotification({
                    userId: user._id,
                    title,
                    message,
                    type: 'overdue_reminder',
                    link,
                    category: 'overdue_reminder',
                    assignmentId: assignment._id
                });

                await this.sendEmailNotification({
                    userId: user._id,
                    to: user.email,
                    subject: `URGENT (Simulation): Workflow Overdue - ${workflow.name}`,
                    body: `Dear ${user.name},\n\nThis is a simulation: Your workflow assignment "${workflow.name}" is overdue (due: ${dueDateString}). Please complete your tasks.\n\nView details: http://localhost:5173/assignments/${assignment._id}`,
                    category: 'overdue_reminder',
                    assignmentId: assignment._id
                });
            } else if (scenarioType === 'missing_document') {
                // Find a document task, or default to generic description
                const docTask = assignment.tasks.find(t => t.type === 'document' && t.status === 'pending') || { name: 'Required Document Upload' };
                const title = 'Missing Required Document (Simulation)';
                const message = `Please upload the required document for task "${docTask.name}" in "${workflow.name}".`;
                const link = `/assignments/${assignment._id}`;

                await this.sendNotification({
                    userId: user._id,
                    title,
                    message,
                    type: 'missing_document',
                    link,
                    category: 'missing_document',
                    assignmentId: assignment._id,
                    taskName: docTask.name
                });

                await this.sendEmailNotification({
                    userId: user._id,
                    to: user.email,
                    subject: `Action Required (Simulation): Missing Document for ${workflow.name}`,
                    body: `Dear ${user.name},\n\nThis is a simulation: You have a pending required document upload for "${docTask.name}" in the workflow "${workflow.name}".\n\nView details: http://localhost:5173/assignments/${assignment._id}`,
                    category: 'missing_document',
                    assignmentId: assignment._id,
                    taskName: docTask.name
                });
            } else {
                throw new Error('Invalid test scenario type');
            }

            return { success: true };
        } catch (error) {
            console.error('❌ Error triggering test scenario:', error);
            throw error;
        }
    }
}
