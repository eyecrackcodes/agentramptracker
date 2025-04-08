/**
 * Centralized error handling utility for the application
 */

// Log errors to console in development and to an external service in production
export function logError(error: unknown, context?: string) {
  // Extract useful error details
  const errorMessage = error instanceof Error ? error.message : String(error);
  const errorStack = error instanceof Error ? error.stack : "No stack trace";
  const errorName = error instanceof Error ? error.name : "Unknown Error";

  // Log to console
  console.error(
    `[ERROR]${context ? ` [${context}]` : ""} ${errorName}: ${errorMessage}`
  );
  console.error(errorStack);

  // In production, you could log to an external service like Sentry here
  // if (process.env.NODE_ENV === 'production') {
  //   // Log to external service
  // }
}

// Format standard API error responses
export function formatApiError(
  error: unknown,
  defaultMessage = "An unexpected error occurred"
) {
  if (error instanceof Error) {
    // Return a sanitized error message
    return {
      error: error.message || defaultMessage,
      status: "error",
    };
  }

  return {
    error: defaultMessage,
    status: "error",
  };
}

// Validate API inputs
export function validateApiInput(data: any, requiredFields: string[]) {
  const missingFields = requiredFields.filter((field) => {
    const value = data[field];
    return value === undefined || value === null || value === "";
  });

  if (missingFields.length > 0) {
    return {
      valid: false,
      error: `Missing required fields: ${missingFields.join(", ")}`,
    };
  }

  return { valid: true };
}

// Format validation error response
export function formatValidationError(fields: string[]) {
  return {
    error: `Missing required fields: ${fields.join(", ")}`,
    status: "error",
    validationFailed: true,
  };
}
