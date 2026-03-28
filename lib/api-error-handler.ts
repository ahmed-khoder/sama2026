import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';

/**
 * Custom API Error class
 */
export class APIError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public code?: string,
    public details?: any
  ) {
    super(message);
    this.name = 'APIError';
  }
}

/**
 * Error response interface
 */
interface ErrorResponse {
  success: false;
  error: {
    message: string;
    code?: string;
    statusCode: number;
    details?: any;
    timestamp: string;
  };
}

/**
 * Log error to external service (Sentry, LogRocket, etc.)
 */
function logError(error: Error, context?: any) {
  if (process.env.NODE_ENV === 'development') {
    console.error('❌ API Error:', {
      error: error.message,
      stack: error.stack,
      context,
    });
  }

  // TODO: Send to error tracking service
  // Sentry.captureException(error, { extra: context });
}

/**
 * Handle Prisma errors
 */
function handlePrismaError(error: Prisma.PrismaClientKnownRequestError): APIError {
  switch (error.code) {
    case 'P2002':
      // Unique constraint violation
      const field = (error.meta?.target as string[])?.join(', ') || 'field';
      return new APIError(
        409,
        `القيمة المدخلة موجودة بالفعل في ${field}`,
        'DUPLICATE_ENTRY',
        { field }
      );

    case 'P2025':
      // Record not found
      return new APIError(404, 'البيانات المطلوبة غير موجودة', 'NOT_FOUND');

    case 'P2003':
      // Foreign key constraint failed
      return new APIError(
        400,
        'لا يمكن حذف هذا العنصر لأنه مرتبط بعناصر أخرى',
        'FOREIGN_KEY_CONSTRAINT'
      );

    case 'P2014':
      // Relation violation
      return new APIError(
        400,
        'العلاقة بين البيانات غير صحيحة',
        'RELATION_VIOLATION'
      );

    default:
      return new APIError(500, 'خطأ في قاعدة البيانات', 'DATABASE_ERROR', {
        code: error.code,
      });
  }
}

/**
 * Handle Zod validation errors
 */
function handleZodError(error: ZodError): APIError {
  const errors = error.issues.map((err) => ({
    field: err.path.join('.'),
    message: err.message,
  }));

  return new APIError(
    400,
    'بيانات غير صحيحة',
    'VALIDATION_ERROR',
    { errors }
  );
}

/**
 * Main error handler
 */
export function handleAPIError(error: unknown): NextResponse<ErrorResponse> {
  logError(error as Error);

  let apiError: APIError;

  // Handle different error types
  if (error instanceof APIError) {
    apiError = error;
  } else if (error instanceof Prisma.PrismaClientKnownRequestError) {
    apiError = handlePrismaError(error);
  } else if (error instanceof ZodError) {
    apiError = handleZodError(error);
  } else if (error instanceof Error) {
    // Generic error
    apiError = new APIError(
      500,
      process.env.NODE_ENV === 'development'
        ? error.message
        : 'حدث خطأ غير متوقع',
      'INTERNAL_ERROR'
    );
  } else {
    // Unknown error
    apiError = new APIError(500, 'حدث خطأ غير متوقع', 'UNKNOWN_ERROR');
  }

  const response: ErrorResponse = {
    success: false,
    error: {
      message: apiError.message,
      code: apiError.code,
      statusCode: apiError.statusCode,
      details: apiError.details,
      timestamp: new Date().toISOString(),
    },
  };

  return NextResponse.json(response, { status: apiError.statusCode });
}

/**
 * Async handler wrapper to catch errors
 */
export function asyncHandler<T>(
  handler: (req: Request, context?: any) => Promise<T>
) {
  return async (req: Request, context?: any) => {
    try {
      return await handler(req, context);
    } catch (error) {
      return handleAPIError(error);
    }
  };
}

/**
 * Success response helper
 */
export function successResponse<T>(
  data: T,
  message?: string,
  statusCode: number = 200
) {
  return NextResponse.json(
    {
      success: true,
      data,
      message,
      timestamp: new Date().toISOString(),
    },
    { status: statusCode }
  );
}

/**
 * Common error shortcuts
 */
export const Errors = {
  NotFound: (message = 'البيانات غير موجودة') =>
    new APIError(404, message, 'NOT_FOUND'),

  Unauthorized: (message = 'غير مصرح لك بالوصول') =>
    new APIError(401, message, 'UNAUTHORIZED'),

  Forbidden: (message = 'ليس لديك صلاحية للقيام بهذا الإجراء') =>
    new APIError(403, message, 'FORBIDDEN'),

  BadRequest: (message = 'طلب غير صحيح') =>
    new APIError(400, message, 'BAD_REQUEST'),

  Conflict: (message = 'تعارض في البيانات') =>
    new APIError(409, message, 'CONFLICT'),

  TooManyRequests: (message = 'عدد كبير جداً من الطلبات، حاول مرة أخرى لاحقاً') =>
    new APIError(429, message, 'TOO_MANY_REQUESTS'),

  InternalError: (message = 'خطأ داخلي في الخادم') =>
    new APIError(500, message, 'INTERNAL_ERROR'),
};
