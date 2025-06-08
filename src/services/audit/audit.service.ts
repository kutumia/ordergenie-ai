export class AuditService {
  static async log(action: string, entityType: string, entityId: string, details: any) {
    // For now, just console log - implement later
    console.log('AUDIT:', { action, entityType, entityId, details })
  }
}