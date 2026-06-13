import { prisma } from "./prisma";
import type { NextRequest } from "next/server";

export interface AuditLogEntry {
  userId?: string;
  action: string;
  resource: string;
  resourceId?: string;
  description?: string;
  oldValues?: any;
  newValues?: any;
  ipAddress?: string;
  userAgent?: string;
  status?: "SUCCESS" | "FAILURE";
  errorMessage?: string;
  duration?: number;
  metadata?: any;
}

/**
 * Create an audit log entry
 */
export async function createAuditLog(entry: AuditLogEntry): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        userId: entry.userId,
        action: entry.action,
        resource: entry.resource,
        resourceId: entry.resourceId,
        description: entry.description,
        oldValues: entry.oldValues ?? undefined,
        newValues: entry.newValues ?? undefined,
        ipAddress: entry.ipAddress,
        userAgent: entry.userAgent,
        status: entry.status || "SUCCESS",
        errorMessage: entry.errorMessage,
        duration: entry.duration,
        metadata: entry.metadata ?? undefined,
      },
    });
  } catch (error) {
    // Don't throw - audit log failure shouldn't break the main operation
    console.error("Failed to create audit log:", error);
  }
}

/**
 * Extract client info from a request
 */
export function getClientInfo(request: NextRequest): {
  ipAddress: string | undefined;
  userAgent: string | undefined;
} {
  return {
    ipAddress:
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      undefined,
    userAgent: request.headers.get("user-agent") || undefined,
  };
}

/**
 * Track an API request and log it
 */
export async function trackApiRequest(
  request: NextRequest,
  options: {
    action: string;
    resource: string;
    resourceId?: string;
    userId?: string;
    description?: string;
  }
): Promise<void> {
  const { ipAddress, userAgent } = getClientInfo(request);
  await createAuditLog({
    ...options,
    ipAddress,
    userAgent,
  });
}
