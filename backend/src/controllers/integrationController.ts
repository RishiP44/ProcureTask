import { Request, Response } from 'express';
import User from '../models/User';
import Workflow from '../models/Workflow';
import Assignment from '../models/Assignment';
import IntegrationLog from '../models/IntegrationLog';
import { AuditLogService } from '../services/auditLogService';

/**
 * AI-Assisted: Enterprise Integration Controller
 * 
 * Demonstrates enterprise scalability by simulating data synchronizations
 * and real-time webhook payloads from systems like Workday, Salesforce, and BambooHR.
 */

/**
 * 1. Batch Sync Simulation
 * Route: POST /api/integrations/sync/:provider
 * 
 * Simulates fetching batch data from external systems (Workday, Salesforce, BambooHR).
 * Creates new users/vendors and auto-assigns onboarding workflows if available.
 */
export const syncProvider = async (req: Request, res: Response): Promise<void> => {
    const startTime = Date.now();
    const providerParam = req.params.provider ? String(req.params.provider).toLowerCase() : 'custom';

    try {
        let syncedRecords: any[] = [];
        let autoAssignedCount = 0;

        // Fetch an active workflow template to use for auto-assignment
        const defaultWorkflow = await Workflow.findOne({ isArchived: false }) || await Workflow.findOne({});

        // --- Workday HRIS / BambooHR Sync Logic ---
        if (providerParam === 'workday' || providerParam === 'bamboohr') {
            // Mock employee data returned from Workday / BambooHR
            const sampleEmployees = [
                {
                    name: 'Workday Sync - Morgan Reed',
                    email: `morgan.reed.${Date.now()}@enterprise.com`,
                    role: 'Employee',
                    department: 'Engineering',
                    position: 'Software Architect'
                },
                {
                    name: 'Workday Sync - Jordan Lee',
                    email: `jordan.lee.${Date.now()}@enterprise.com`,
                    role: 'Employee',
                    department: 'Operations',
                    position: 'Procurement Specialist'
                }
            ];

            // AI-Assisted: Process each employee record and auto-trigger workflow assignments
            for (const empData of sampleEmployees) {
                // Check if user already exists
                let user = await User.findOne({ email: empData.email });
                if (!user) {
                    user = await User.create({
                        name: empData.name,
                        email: empData.email,
                        role: empData.role as 'Employee',
                        department: empData.department,
                        position: empData.position,
                        status: 'Active',
                        passwordHash: 'synced_account_no_password'
                    });
                }
                syncedRecords.push(user);

                // Auto-assign onboarding workflow if a workflow template exists
                if (defaultWorkflow && user) {
                    await Assignment.create({
                        workflow: defaultWorkflow._id,
                        user: user._id,
                        status: 'pending',
                        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
                        tasks: defaultWorkflow.tasks.map((task: any) => ({
                            name: task.name,
                            description: task.description,
                            type: task.type,
                            required: task.required,
                            status: 'pending'
                        }))
                    });
                    autoAssignedCount++;
                }
            }
        } 
        // --- Salesforce CRM / SAP Vendor Sync Logic ---
        else if (providerParam === 'salesforce' || providerParam === 'sap') {
            const sampleVendors = [
                {
                    name: 'Salesforce Sync - CloudTech Solutions',
                    email: `contact.${Date.now()}@cloudtech.com`,
                    role: 'Vendor',
                    companyName: 'CloudTech Solutions Inc.',
                    vendorType: 'IT Hardware',
                    department: 'Procurement'
                }
            ];

            for (const vData of sampleVendors) {
                let user = await User.findOne({ email: vData.email });
                if (!user) {
                    user = await User.create({
                        name: vData.name,
                        email: vData.email,
                        role: 'Vendor',
                        companyName: vData.companyName,
                        vendorType: vData.vendorType,
                        department: vData.department,
                        status: 'Active',
                        passwordHash: 'synced_vendor_no_password'
                    });
                }
                syncedRecords.push(user);
            }
        } 
        else {
            // Default generic sync output for custom providers
            syncedRecords.push({ note: `Synced mock records from provider: ${providerParam}` });
        }

        const durationMs = Date.now() - startTime;

        // Log the sync execution in IntegrationLog
        const logEntry = await IntegrationLog.create({
            provider: providerParam,
            eventType: 'batch.sync',
            status: 'Success',
            recordsProcessed: syncedRecords.length,
            payload: { provider: providerParam, timestamp: new Date().toISOString() },
            details: `Successfully synced ${syncedRecords.length} record(s) from ${providerParam.toUpperCase()}`,
            durationMs
        });

        // AI-Assisted: Record audit trail for administrative tracking
        await AuditLogService.logAction({
            action: 'ENTERPRISE_SYNC',
            targetType: 'Integration',
            targetId: (logEntry._id as any).toString(),
            details: `Executed ${providerParam.toUpperCase()} batch data synchronization (${syncedRecords.length} records).`,
            metadata: { provider: providerParam, syncedCount: syncedRecords.length, autoAssignedCount }
        });

        res.status(200).json({
            success: true,
            provider: providerParam,
            message: `Successfully executed ${providerParam.toUpperCase()} enterprise sync`,
            syncedCount: syncedRecords.length,
            autoAssignedWorkflows: autoAssignedCount,
            syncedRecords,
            logId: logEntry._id
        });
    } catch (error: any) {
        console.error(`❌ Enterprise Sync Failed (${providerParam}):`, error);
        res.status(500).json({
            success: false,
            message: `Enterprise sync failed for ${providerParam}`,
            error: error.message
        });
    }
};

/**
 * 2. Live Webhook Payload Receiver
 * Route: POST /api/integrations/webhook/:provider
 * 
 * Accepts real-time webhook payloads from external enterprise systems or Postman.
 */
export const receiveWebhook = async (req: Request, res: Response): Promise<void> => {
    const startTime = Date.now();
    const providerParam = req.params.provider ? String(req.params.provider).toLowerCase() : 'custom';
    const payload = req.body || {};

    try {
        // Simple payload parsing (supports custom JSON or standard event payloads)
        const eventType = payload.eventType || payload.event || 'employee.hired';
        const name = payload.name || payload.data?.name || `Webhook User ${Date.now().toString().slice(-4)}`;
        const email = payload.email || payload.data?.email || `webhook.${Date.now()}@enterprise.com`;
        const department = payload.department || payload.data?.department || 'General';

        // Check or create employee
        let user = await User.findOne({ email });
        if (!user) {
            user = await User.create({
                name,
                email,
                role: 'Employee',
                department,
                status: 'Active',
                passwordHash: 'webhook_invited_account'
            });
        }

        // Auto-assign default onboarding workflow
        const defaultWorkflow = await Workflow.findOne({ isArchived: false }) || await Workflow.findOne({});
        let assignmentCreated = false;
        if (defaultWorkflow && user) {
            await Assignment.create({
                workflow: defaultWorkflow._id,
                user: user._id,
                status: 'pending',
                dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                tasks: defaultWorkflow.tasks.map((task: any) => ({
                    name: task.name,
                    description: task.description,
                    type: task.type,
                    required: task.required,
                    status: 'pending'
                }))
            });
            assignmentCreated = true;
        }

        const durationMs = Date.now() - startTime;

        // Save integration log
        const logEntry = await IntegrationLog.create({
            provider: providerParam,
            eventType,
            status: 'Success',
            recordsProcessed: 1,
            payload,
            details: `Received webhook event '${eventType}' from ${providerParam.toUpperCase()} for ${name}`,
            durationMs
        });

        // AI-Assisted: Save to central audit log system
        await AuditLogService.logAction({
            action: 'WEBHOOK_RECEIVED',
            targetType: 'Integration',
            targetId: (logEntry._id as any).toString(),
            details: `Processed webhook '${eventType}' from ${providerParam.toUpperCase()} for user '${name}'`,
            metadata: { provider: providerParam, eventType, userEmail: email, assignmentCreated }
        });

        res.status(200).json({
            success: true,
            provider: providerParam,
            eventType,
            message: `Webhook successfully processed from ${providerParam.toUpperCase()}`,
            processedUser: {
                id: user._id,
                name: user.name,
                email: user.email,
                department: user.department
            },
            assignmentCreated,
            logId: logEntry._id
        });
    } catch (error: any) {
        console.error(`❌ Webhook Processing Error (${providerParam}):`, error);
        res.status(500).json({
            success: false,
            message: `Failed to process webhook from ${providerParam}`,
            error: error.message
        });
    }
};

/**
 * 3. Fetch Integration Logs
 * Route: GET /api/integrations/logs
 * 
 * Returns historical logs of batch syncs and received webhooks.
 */
export const getIntegrationLogs = async (req: Request, res: Response): Promise<void> => {
    try {
        const logs = await IntegrationLog.find().sort({ createdAt: -1 }).limit(50);
        res.status(200).json({
            success: true,
            count: logs.length,
            logs
        });
    } catch (error: any) {
        console.error('❌ Failed to fetch integration logs:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve integration logs',
            error: error.message
        });
    }
};
