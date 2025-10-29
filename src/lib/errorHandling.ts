interface ApiError {
  message?: string;
  name?: string;
  stack?: string;
  status?: number;
  statusText?: string;
  code?: string;
  details?: string;
  hint?: string;
  response?: {
    data?: unknown;
  };
  config?: {
    url?: string;
    method?: string;
  };
}

// Utility function for comprehensive error logging
export const logApiError = (operation: string, error: ApiError | unknown) => {
  const err = error as ApiError;

  // Handle Supabase PostgrestError specifically
  if (err && typeof err === 'object' && 'code' in err) {
    console.error(`${operation} failed:`, {
      // Supabase PostgrestError fields
      code: err.code,
      message: err.message,
      details: err.details,
      hint: err.hint,

      // Additional context
      operation,
      timestamp: new Date().toISOString(),

      // Full error object for debugging
      fullError: err
    });
  } else {
    // Handle generic errors
    console.error(`${operation} failed:`, {
      // Basic error info
      message: err?.message || (typeof error === 'string' ? error : 'Unknown error'),
      name: err?.name,
      stack: err?.stack,

      // HTTP-specific info
      status: err?.status,
      statusText: err?.statusText,

      // Response data
      response: err?.response?.data,

      // Request info
      url: err?.config?.url,
      method: err?.config?.method,

      // Timestamp
      timestamp: new Date().toISOString(),

      // Full error object
      fullError: error
    });
  }
};

// Utility function to check if error is network-related
export const isNetworkError = (error: ApiError | unknown): boolean => {
  const err = error as ApiError;
  return Boolean(!navigator.onLine ||
         err?.code === 'NETWORK_ERROR' ||
         err?.message?.includes('network') ||
         err?.message?.includes('fetch'));
};

// Utility function for debug logging
export const debugLog = (message: string, data?: unknown) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[DEBUG] ${message}`, data);
  }
};
