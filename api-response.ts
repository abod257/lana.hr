import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { AuthError } from "./auth";

/**
 * Standard API response helpers
 */
export class ApiResponse {
  static success<T>(data: T, status: number = 200, meta?: Record<string, any>) {
    return NextResponse.json(
      {
        success: true,
        data,
        ...(meta && { meta }),
      },
      { status }
    );
  }

  static error(
    message: string,
    status: number = 500,
    errors?: Record<string, string[]> | any
  ) {
    return NextResponse.json(
      {
        success: false,
        message,
        ...(errors && { errors }),
      },
      { status }
    );
  }

  static created<T>(data: T, message: string = "Resource created successfully") {
    return NextResponse.json(
      {
        success: true,
        data,
        message,
      },
      { status: 201 }
    );
  }

  static noContent(message: string = "Operation completed successfully") {
    return NextResponse.json(
      {
        success: true,
        message,
      },
      { status: 200 }
    );
  }

  static paginated<T>(
    items: T[],
    total: number,
    page: number,
    pageSize: number
  ) {
    return NextResponse.json({
      success: true,
      data: items,
      meta: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
        hasNext: page * pageSize < total,
        hasPrev: page > 1,
      },
    });
  }

  static unauthorized(message: string = "Authentication required") {
    return this.error(message, 401);
  }

  static forbidden(message: string = "Insufficient permissions") {
    return this.error(message, 403);
  }

  static notFound(message: string = "Resource not found") {
    return this.error(message, 404);
  }

  static badRequest(message: string, errors?: any) {
    return this.error(message, 400, errors);
  }

  static conflict(message: string = "Resource already exists") {
    return this.error(message, 409);
  }

  static serverError(message: string = "Internal server error") {
    return this.error(message, 500);
  }
}

/**
 * Global error handler for API routes
 */
export function handleApiError(error: unknown): NextResponse {
  console.error("API Error:", error);

  // Zod validation error
  if (error instanceof ZodError) {
    const fieldErrors: Record<string, string[]> = {};
    error.issues.forEach((issue) => {
      const path = issue.path.join(".");
      if (!fieldErrors[path]) fieldErrors[path] = [];
      fieldErrors[path].push(issue.message);
    });
    return ApiResponse.badRequest("Validation failed", fieldErrors);
  }

  // Auth errors
  if (error instanceof AuthError) {
    if (error.statusCode === 401) return ApiResponse.unauthorized(error.message);
    if (error.statusCode === 403) return ApiResponse.forbidden(error.message);
    return ApiResponse.error(error.message, error.statusCode);
  }

  // Prisma errors
  if (error && typeof error === "object" && "code" in error) {
    const prismaError = error as any;
    if (prismaError.code === "P2002") {
      return ApiResponse.conflict("A record with this data already exists");
    }
    if (prismaError.code === "P2025") {
      return ApiResponse.notFound("Record not found");
    }
  }

  // Generic error
  if (error instanceof Error) {
    return ApiResponse.serverError(
      process.env.NODE_ENV === "development" ? error.message : "Internal server error"
    );
  }

  return ApiResponse.serverError();
}

/**
 * Async API handler wrapper
 */
export function asyncHandler<T extends (...args: any[]) => Promise<NextResponse>>(
  handler: T
) {
  return async (...args: Parameters<T>): Promise<NextResponse> => {
    try {
      return await handler(...args);
    } catch (error) {
      return handleApiError(error);
    }
  };
}
