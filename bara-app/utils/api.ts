import { getAuthHeader, clearUserSession } from "./tokenManager";

interface ApiRequestOptions extends RequestInit {
  skipNgrokWarning?: boolean;
  requireAuth?: boolean;
}

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  statusCode?: number;
}

export async function apiRequest<T = any>(
  url: string,
  options: ApiRequestOptions = {}
): Promise<ApiResponse<T>> {
  const {
    skipNgrokWarning = true,
    requireAuth = false,
    headers = {},
    body,
    ...restOptions
  } = options;

  const requestHeaders: HeadersInit = {
    ...headers,
  };
  if (!(body instanceof FormData)) {
    (requestHeaders as Record<string, string>)["Content-Type"] =
      "application/json";
  }

  if (requireAuth) {
    const authHeaders = getAuthHeader();
    Object.assign(requestHeaders, authHeaders);
  }

  if (skipNgrokWarning) {
    (requestHeaders as Record<string, string>)["ngrok-skip-browser-warning"] =
      "true";
  }

  try {
    const response = await fetch(url, {
      ...restOptions,
      headers: requestHeaders,
      body,
    });

    const contentType = response.headers.get("content-type");

    let responseData;
    try {
      responseData = await response.json();
    } catch (parseError) {
      throw new Error("Invalid JSON response from server");
    }

    if (response.ok) {
      return {
        success: true,
        data: responseData,
        statusCode: response.status,
      };
    } else {
      // Handle unauthorized access
      if (response.status === 401 && requireAuth) {
        clearUserSession();
        // Redirect to login page
        if (typeof window !== "undefined") {
          window.location.href = "/auth/login";
        }
      }

      return {
        success: false,
        message:
          responseData.message ||
          `Request failed with status ${response.status}`,
        statusCode: response.status,
        data: responseData,
      };
    }
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";

    return {
      success: false,
      message: errorMessage,
      statusCode: 0,
    };
  }
}

export const api = {
  register: async (data: { Email: string; Password: string; Type: string }) => {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    const registerUrl =
      process.env.NEXT_PUBLIC_REGISTER_URL || "/api/user/register";

    return apiRequest(`${baseUrl}${registerUrl}`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  login: async (data: {
    Email: string;
    Password: string;
    LoginDevice: string;
  }) => {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    const loginUrl = process.env.NEXT_PUBLIC_LOGIN_USER || "/api/auth/login";

    return apiRequest(`${baseUrl}${loginUrl}`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  verifyLogin: async (data: {
    Email: string;
    Token: string;
    Device: string;
  }) => {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    const verifyUrl = "/api/auth/verify-login";

    return apiRequest(`${baseUrl}${verifyUrl}`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  forgotPassword: async (data: { Email: string }) => {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    const forgotUrl = "/api/auth/forgot-password";

    return apiRequest(`${baseUrl}${forgotUrl}`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  resetPassword: async (data: {
    Email: string;
    Token: string;
    NewPassword: string;
  }) => {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    const resetUrl = "/api/auth/reset-password";

    return apiRequest(`${baseUrl}${resetUrl}`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  verifyEmail: async (email: string, otp: string) => {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    const verifyUrl = process.env.NEXT_PUBLIC_VERIFY_EMAIL;

    return apiRequest(`${baseUrl}${verifyUrl}/${email}/${otp}`, {
      method: "PUT",
    });
  },

  resendVerificationToken: async (email: string) => {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    const resendUrl = process.env.NEXT_PUBLIC_RESEND_VERIFICATION_TOKEN;

    return apiRequest(`${baseUrl}${resendUrl}/${email}`, {
      method: "POST",
    });
  },

  createProducer: async (formData: FormData, userId: string) => {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    const producerUrl = `/api/producer/${userId}`;

    return apiRequest(`${baseUrl}${producerUrl}`, {
      method: "POST",
      body: formData,
      requireAuth: true,
    });
  },

  createWriter: async (formData: FormData, userId: string) => {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    const writerUrl = `/api/writer?userId=${userId}`;

    return apiRequest(`${baseUrl}${writerUrl}`, {
      method: "POST",
      body: formData,
      requireAuth: true,
    });
  },
};

export const API_ERROR_MESSAGES = {
  NETWORK_ERROR: "Network error - please check your internet connection",
  NGROK_EXPIRED:
    "Development server connection expired - please restart the backend",
  INVALID_JSON: "Server returned invalid response - please try again",
  SERVER_ERROR: "Server error - please try again later",
  UNKNOWN_ERROR: "Something went wrong - please try again",
};
