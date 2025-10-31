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
  error?: string;
  totalCount?: number;
  totalPages?: number;
  pageNumber?: number;
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
      if (response.status === 401 && requireAuth) {
        clearUserSession();
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
    // console.log("Login URL:", `${baseUrl}${loginUrl}`);
    return await apiRequest(`${baseUrl}${loginUrl}`, {
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

    return await apiRequest(`${baseUrl}${verifyUrl}`, {
      method: "PUT",
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
    const writerUrl = `/api/writer/${userId}`;

    return apiRequest(`${baseUrl}${writerUrl}`, {
      method: "POST",
      body: formData,
      requireAuth: true,
    });
  },

  // Dashboard API methods
  getAllScripts: async (pageNumber: number, pageSize: number) => {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    const scriptsUrl = `/api/script/scripts/${pageNumber}/${pageSize}`;

    const response = await apiRequest(`${baseUrl}${scriptsUrl}`, {
      method: "GET",
      requireAuth: true,
    });
    return response.data;
  },

  getGenres: async () => {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    const genresUrl = "/api/script/scripts/genres";

    return await apiRequest(`${baseUrl}${genresUrl}`, {
      method: "GET",
      requireAuth: true,
    });
  },
  getScriptsByGenre: async (
    genre: string,
    pageNumber: number,
    pageSize: number
  ) => {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    const scriptsUrl = `/api/script/scripts/genre/${encodeURIComponent(
      genre
    )}/${pageNumber}/${pageSize}`;

    return await apiRequest(`${baseUrl}${scriptsUrl}`, {
      method: "GET",
      requireAuth: true,
    });
  },

  searchScripts: async (
    searchTerm: string,
    pageNumber: number,
    pageSize: number
  ) => {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    const searchUrl = `/api/script/scripts/search/${encodeURIComponent(
      searchTerm
    )}/${pageNumber}/${pageSize}`;

    return apiRequest(`${baseUrl}${searchUrl}`, {
      method: "GET",
      requireAuth: true,
    });
  },

  getProducerProfile: async (producerId: string) => {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    const profileUrl = `/api/producer/profile/${producerId}`;

    return apiRequest(`${baseUrl}${profileUrl}`, {
      method: "GET",
      requireAuth: true,
    });
  },

  getWriterProfile: async (writerId: string) => {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    const profileUrl = `/api/writer/profile/${writerId}`;

    return apiRequest(`${baseUrl}${profileUrl}`, {
      method: "GET",
      requireAuth: true,
    });
  },

  getUserTransactions: async (
    userId: string,
    pageNumber: number,
    pageSize: number
  ) => {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    const transactionsUrl = `/api/transaction/users/${userId}/transactions/${pageNumber}/${pageSize}`;

    return apiRequest(`${baseUrl}${transactionsUrl}`, {
      method: "GET",
      requireAuth: true,
    });
  },

  addScript: async (formData: FormData, writerId: string) => {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    const scriptUrl = `/api/script/${writerId}`;

    return apiRequest(`${baseUrl}${scriptUrl}`, {
      method: "POST",
      body: formData,
      requireAuth: true,
    });
  },

  // Wallet API methods
  async getWalletBalance(userId: string) {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    return apiRequest(`${baseUrl}/api/wallet/balance/${userId}`, {
      method: "GET",
      requireAuth: true,
    });
  },

  async getUserTransactions(
    userId: string,
    pageNumber: number = 1,
    pageSize: number = 10
  ) {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    return apiRequest(
      `${baseUrl}/api/transaction/users/${userId}/transactions/${pageNumber}/${pageSize}`,
      {
        method: "GET",
        requireAuth: true,
      }
    );
  },

  async initiateFundWallet(userId: string, amount: number) {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    return apiRequest(`${baseUrl}/api/transaction/initiate/${userId}`, {
      method: "POST",
      requireAuth: true,
      body: JSON.stringify({ amount }),
    });
  },

  async verifyPayment(reference: string) {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    return apiRequest(
      `${baseUrl}/api/transaction/verify-payment/${reference}`,
      {
        method: "POST",
        requireAuth: true,
      }
    );
  },

  // Bank Details API methods
  async addBankDetails(userId: string, bankDetails: Record<string, unknown>) {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    return apiRequest(`${baseUrl}/api/user/bank-details/${userId}`, {
      method: "POST",
      requireAuth: true,
      body: JSON.stringify(bankDetails),
    });
  },

  async getBankDetails(userId: string) {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    return apiRequest(`${baseUrl}/api/user/bank-details/${userId}`, {
      method: "GET",
      requireAuth: true,
    });
  },

  async getBanks() {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    return apiRequest(`${baseUrl}/api/utility/banks`, {
      method: "GET",
      requireAuth: true,
    });
  },

  // Profile API methods
  async getWriterProfile(writerId: string) {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    return apiRequest(`${baseUrl}/api/writer/profile/${writerId}`, {
      method: "GET",
      requireAuth: true,
    });
  },

  async getProducerProfile(producerId: string) {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    return apiRequest(`${baseUrl}/api/producer/profile/${producerId}`, {
      method: "GET",
      requireAuth: true,
    });
  },

  // Script API methods
  async getAllScripts(pageNumber: number = 1, pageSize: number = 10) {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    return apiRequest(
      `${baseUrl}/api/script/scripts/${pageNumber}/${pageSize}`,
      {
        method: "GET",
        requireAuth: false,
      }
    );
  },

  async getScriptById(scriptId: string) {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    return apiRequest(`${baseUrl}/api/script/${scriptId}`, {
      method: "GET",
      requireAuth: false,
    });
  },

  // Script Transaction API methods
  async initiateScriptTransaction(
    producerId: string,
    scriptId: string,
    writerId: string
  ) {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    return apiRequest(
      `${baseUrl}/api/producers/${producerId}/scripts/transactions:initiate`,
      {
        method: "POST",
        requireAuth: true,
        body: JSON.stringify({
          scriptId,
          writerId,
          idempotencyKey: `${producerId}-${scriptId}-${Date.now()}`,
        }),
      }
    );
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
