import AuditLog from '../models/AuditLog';

export class AuditLogService {
    /**
     * Records an audit log entry to the database.
     * Errors are caught and logged to console to prevent blocking main business flows.
     */
    static async logAction(params: {
        actorId?: string;
        action: string;
        targetType: 'Workflow' | 'Assignment' | 'User' | 'VendorBill' | 'OfferLetter' | 'Integration';
        targetId: string;
        details: string;
        metadata?: Record<string, any>;
        ipAddress?: string;
    }): Promise<void> {
        try {
            await AuditLog.create({
                actor: params.actorId || undefined,
                action: params.action,
                targetType: params.targetType,
                targetId: params.targetId,
                details: params.details,
                metadata: params.metadata || {},
                ipAddress: params.ipAddress
            });
        } catch (error) {
            console.error('❌ Failed to save audit log:', error);
        }
    }
}
