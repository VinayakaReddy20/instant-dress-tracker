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
          err?.message?.includes('fetch') ||
          err?.message?.includes('ERR_INTERNET_DISCONNECTED') ||
          err?.message?.includes('Failed to fetch'));
};

// Utility function to check if user is online
export const isOnline = (): boolean => {
  return navigator.onLine;
};

// Utility function to detect offline state
export const isOffline = (): boolean => {
  return !navigator.onLine;
};

// Utility function for debug logging
export const debugLog = (message: string, data?: unknown) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[DEBUG] ${message}`, data);
  }
};

// Enhanced error logging with offline detection
export const logApiErrorWithOfflineCheck = (operation: string, error: ApiError | unknown) => {
  const err = error as ApiError;

  // Check if offline first
  if (isOffline()) {
    console.error(`${operation} failed:`, {
      reason: 'User is offline',
      operation,
      timestamp: new Date().toISOString(),
      navigatorOnline: navigator.onLine,
    });
    return {
      isOffline: true,
      title: "You're offline",
      description: "Please check your internet connection and try again.",
    };
  }

  // Log the error normally
  logApiError(operation, error);

  // Return error info for UI
  let title = "Failed to load data";
  let description = "Please check your connection and try again.";

  if (isNetworkError(error)) {
    title = "Connection error";
    description = "Unable to connect to the server. Please check your internet connection.";
  } else if (err && typeof err === 'object' && 'code' in err) {
    const apiErr = err as { code?: string; message?: string };
    if (apiErr.code === 'PGRST116') {
      title = "Database connection issue";
      description = "Unable to connect to the database. Please try again later.";
    } else if (apiErr.code === '42P01') {
      title = "Table not found";
      description = "The requested data is not available. Please contact support.";
    } else if (apiErr.code === '42703') {
      title = "Data error";
      description = "There's an issue with the data structure. Please contact support.";
    }
  }

  return {
    isOffline: false,
    title,
    description,
  };
};
