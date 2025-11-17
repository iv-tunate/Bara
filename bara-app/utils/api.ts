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
    console.log("authHeaders", authHeaders);
    console.log("requestHeaders", requestHeaders);
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

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const API_ENDPOINTS = {
  REGISTER: "/api/user/register",
  LOGIN: "/api/auth/login",
  VERIFY_LOGIN: "/api/auth/verify-login",
  FORGOT_PASSWORD: "/api/auth/forgot-password",
  RESET_PASSWORD: "/api/auth/reset-password",
  VERIFY_EMAIL: (email: string, otp: string) =>
    `/api/auth/verify-email/${email}/${otp}`,
  RESEND_VERIFICATION_TOKEN: (email: string) =>
    `/api/auth/resend-verification-token/${email}`,
  CREATE_PRODUCER: (userId: string) => `/api/producer/${userId}`,
  CREATE_WRITER: (userId: string) => `/api/writer/create-profile/${userId}`,
  SCRIPTS: (pageNumber: number, pageSize: number) =>
    `/api/scripts/${pageNumber}/${pageSize}`,
  GENRES: "/api/genres",
  SCRIPTS_BY_GENRE: (genre: string, pageNumber: number, pageSize: number) =>
    `/api/scripts/genre/${encodeURIComponent(genre)}/${pageNumber}/${pageSize}`,
  SEARCH_SCRIPTS: (searchTerm: string, pageNumber: number, pageSize: number) =>
    `/api/scripts/search/${encodeURIComponent(
      searchTerm
    )}/${pageNumber}/${pageSize}`,
  PRODUCER_PROFILE: (producerId: string) =>
    `/api/producer/profile/${producerId}`,
  WRITER_PROFILE: (writerId: string) => `/api/writer/profile/${writerId}`,
  USER_TRANSACTIONS: (userId: string, pageNumber: number, pageSize: number) =>
    `/api/transaction/users/${userId}/transactions/${pageNumber}/${pageSize}`,
  ADD_SCRIPT: (writerId: string) => `/api/script/${writerId}`,
  WALLET_BALANCE: (userId: string) => `/api/wallet/balance/${userId}`,
  INITIATE_FUND_WALLET: (userId: string) =>
    `/api/transaction/initiate/${userId}`,
  VERIFY_PAYMENT: (reference: string) =>
    `/api/transaction/verify-payment/${reference}`,
  BANK_DETAILS: (userId: string) => `/api/user/bank-details/${userId}`,
  BANKS: "/api/utility/banks",
  SCRIPT_BY_ID: (scriptId: string) => `/api/script/${scriptId}`,
  INITIATE_SCRIPT_TRANSACTION: (producerId: string) =>
    `/api/producers/${producerId}/scripts/transactions:initiate`,
};

export const api = {
  register: async (data: { Email: string; Password: string; Type: string }) => {
    return apiRequest(`${BASE_URL}${API_ENDPOINTS.REGISTER}`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  login: async (data: {
    Email: string;
    Password: string;
    LoginDevice: string;
  }) => {
    return await apiRequest(`${BASE_URL}${API_ENDPOINTS.LOGIN}`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  verifyLogin: async (data: {
    Email: string;
    Token: string;
    Device: string;
  }) => {
    return await apiRequest(`${BASE_URL}${API_ENDPOINTS.VERIFY_LOGIN}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  forgotPassword: async (data: { Email: string }) => {
    return apiRequest(`${BASE_URL}${API_ENDPOINTS.FORGOT_PASSWORD}`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  resetPassword: async (data: {
    Email: string;
    Token: string;
    NewPassword: string;
  }) => {
    return apiRequest(`${BASE_URL}${API_ENDPOINTS.RESET_PASSWORD}`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  verifyEmail: async (email: string, otp: string) => {
    return apiRequest(`${BASE_URL}${API_ENDPOINTS.VERIFY_EMAIL(email, otp)}`, {
      method: "PUT",
    });
  },

  resendVerificationToken: async (email: string) => {
    return apiRequest(
      `${BASE_URL}${API_ENDPOINTS.RESEND_VERIFICATION_TOKEN(email)}`,
      {
        method: "POST",
      }
    );
  },

  createProducer: async (formData: FormData, userId: string) => {
    return apiRequest(`${BASE_URL}${API_ENDPOINTS.CREATE_PRODUCER(userId)}`, {
      method: "POST",
      body: formData,
      requireAuth: true,
    });
  },

  createWriter: async (formData: FormData, userId: string) => {
    return apiRequest(`${BASE_URL}${API_ENDPOINTS.CREATE_WRITER(userId)}`, {
      method: "POST",
      body: formData,
      requireAuth: true,
    });
  },

  // Dashboard API methods
  getAllScripts: async (pageNumber: number = 1, pageSize: number = 10) => {
    const response = await apiRequest(
      `${BASE_URL}${API_ENDPOINTS.SCRIPTS(pageNumber, pageSize)}`,
      {
        method: "GET",
        requireAuth: false,
      }
    );
    return response;
  },

  getGenres: async () => {
    return await apiRequest(`${BASE_URL}${API_ENDPOINTS.GENRES}`, {
      method: "GET",
      requireAuth: true,
    });
  },
  getScriptsByGenre: async (
    genre: string,
    pageNumber: number,
    pageSize: number
  ) => {
    return await apiRequest(
      `${BASE_URL}${API_ENDPOINTS.SCRIPTS_BY_GENRE(
        genre,
        pageNumber,
        pageSize
      )}`,
      {
        method: "GET",
        requireAuth: true,
      }
    );
  },

  searchScripts: async (
    searchTerm: string,
    pageNumber: number,
    pageSize: number
  ) => {
    return apiRequest(
      `${BASE_URL}${API_ENDPOINTS.SEARCH_SCRIPTS(
        searchTerm,
        pageNumber,
        pageSize
      )}`,
      {
        method: "GET",
        requireAuth: true,
      }
    );
  },

  getProducerProfile: async (producerId: string) => {
    return apiRequest(
      `${BASE_URL}${API_ENDPOINTS.PRODUCER_PROFILE(producerId)}`,
      {
        method: "GET",
        requireAuth: true,
      }
    );
  },

  getWriterProfile: async (writerId: string) => {
    return apiRequest(`${BASE_URL}${API_ENDPOINTS.WRITER_PROFILE(writerId)}`, {
      method: "GET",
      requireAuth: true,
    });
  },

  getUserTransactions: async (
    userId: string,
    pageNumber: number = 1,
    pageSize: number = 10
  ) => {
    return apiRequest(
      `${BASE_URL}${API_ENDPOINTS.USER_TRANSACTIONS(
        userId,
        pageNumber,
        pageSize
      )}`,
      {
        method: "GET",
        requireAuth: true,
      }
    );
  },

  addScript: async (formData: FormData, writerId: string) => {
    debugger;
    return apiRequest(`${BASE_URL}${API_ENDPOINTS.ADD_SCRIPT(writerId)}`, {
      method: "POST",
      body: formData,
      requireAuth: true,
    });
  },

  // Wallet API methods
  async getWalletBalance(userId: string) {
    return apiRequest(`${BASE_URL}${API_ENDPOINTS.WALLET_BALANCE(userId)}`, {
      method: "GET",
      requireAuth: true,
    });
  },

  async initiateFundWallet(userId: string, amount: number) {
    return apiRequest(
      `${BASE_URL}${API_ENDPOINTS.INITIATE_FUND_WALLET(userId)}`,
      {
        method: "POST",
        requireAuth: true,
        body: JSON.stringify({ amount }),
      }
    );
  },

  async verifyPayment(reference: string) {
    return apiRequest(`${BASE_URL}${API_ENDPOINTS.VERIFY_PAYMENT(reference)}`, {
      method: "POST",
      requireAuth: true,
    });
  },

  // Bank Details API methods
  async addBankDetails(userId: string, bankDetails: Record<string, unknown>) {
    return apiRequest(`${BASE_URL}${API_ENDPOINTS.BANK_DETAILS(userId)}`, {
      method: "POST",
      requireAuth: true,
      body: JSON.stringify(bankDetails),
    });
  },

  async getBankDetails(userId: string) {
    return apiRequest(`${BASE_URL}${API_ENDPOINTS.BANK_DETAILS(userId)}`, {
      method: "GET",
      requireAuth: true,
    });
  },

  async getBanks() {
    return apiRequest(`${BASE_URL}${API_ENDPOINTS.BANKS}`, {
      method: "GET",
      requireAuth: true,
    });
  },

  async getScriptById(scriptId: string) {
    return apiRequest(`${BASE_URL}${API_ENDPOINTS.SCRIPT_BY_ID(scriptId)}`, {
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
    return apiRequest(
      `${BASE_URL}${API_ENDPOINTS.INITIATE_SCRIPT_TRANSACTION(producerId)}`,
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
