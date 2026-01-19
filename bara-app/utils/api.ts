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
    // console.log("authHeaders", authHeaders);
    // console.log("requestHeaders", requestHeaders);
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

    let responseData: any = null;

    try {
      if (contentType && contentType.includes("application/json")) {
        responseData = await response.json();
      } else if (contentType && contentType.includes("text/")) {
        responseData = await response.text();
      } else {
        responseData = null;
      }
    } catch (parseError) {
      console.warn("Failed to parse response:", parseError);
      responseData = null;
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
          responseData?.message ||
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
    `/api/transaction/user/${userId}/transactions/${pageNumber}/${pageSize}`,
  ADD_SCRIPT: (writerId: string) => `/api/script/${writerId}`,
  WALLET_BALANCE: (userId: string) => `/api/wallet/balance/${userId}`,
  INITIATE_FUND_WALLET: (userId: string) =>
    `/api/transaction/initiate/${userId}`,
  VERIFY_PAYMENT: (reference: string) =>
    `/api/transaction/verify-payment/${reference}`,
  BANK_DETAILS: (userId: string) => `/api/user/bank-details/${userId}`,
  BANKS: "/api/utility/banks",
  SCRIPT_BY_ID: (scriptId: string) => `/api/script/${scriptId}`,
  INITIATE_SCRIPT_TRANSACTION: () => `/api/script-transaction/initiate`,
  SCRIPTS_BY_WRITER: (writerId: string, pageNumber: number, pageSize: number) =>
    `/api/scripts/writer/${writerId}/${pageNumber}/${pageSize}`,
  CREATE_CHAT: "/api/v1/chats",
  GET_CHAT_HISTORY: (chatId: string) => `/api/v1/chats/${chatId}/messages`,
  GET_CHAT: (chatId: string) => `/api/v1/chats/${chatId}`,
  GET_USER_CHATS: (userId: string) => `/api/v1/chats/user/${userId}`,
  SEND_MESSAGE: (chatId: string) => `/api/v1/chats/${chatId}/messages`,
  MARK_MESSAGES_READ: (chatId: string) => `/api/v1/chats/${chatId}/read`,
  CLOSE_CHAT: (chatId: string) => `/api/v1/chats/${chatId}/close`,
  UPDATE_SCRIPT: (scriptId: string, writerId: string) =>
    `/api/script/${scriptId}/${writerId}`,
  UPDATE_SCRIPT_STATUS: (scriptId: string, writerId: string) =>
    `/api/script/${scriptId}/${writerId}/status`,
  DELETE_SCRIPT: (scriptId: string, writerId: string) =>
    `/api/script/delete/${scriptId}/${writerId}`,
  UPDATE_WRITER_PROFILE: (writerId: string) =>
    `/api/writer/profile/${writerId}`,
  UPDATE_PRODUCER_PROFILE: (producerId: string) =>
    `/api/producer/profile/${producerId}`,
  SCRIPTS_BY_PRODUCER: (
    producerId: string,
    pageNumber: number,
    pageSize: number
  ) => `/api/scripts/producer/${producerId}/${pageNumber}/${pageSize}`,
  GET_PRODUCER_SCRIPTS_BY_TRANSACTION: (
    producerId: string,
    status: string,
    pageNumber: number,
    pageSize: number
  ) =>
    `/api/scripts/producer/${producerId}/transactions/${status}/${pageNumber}/${pageSize}`,
  COMPLETE_SCRIPT_TRANSACTION: (scriptId: string, transactionId: string) =>
    `/api/script-transaction/complete/${scriptId}/${transactionId}`,
  CANCEL_SCRIPT_TRANSACTION: (scriptId: string, transactionId: string) =>
    `/api/script-transaction/cancel/${scriptId}/${transactionId}`,
  UPDATE_SCRIPT_CONTENT: (scriptId: string, writerId: string) =>
    `/api/script/${scriptId}/content/${writerId}`,
  NOTIFICATIONS: "/api/notification",
  ADMIN_ALL_USERS: (pageNumber: number, pageSize: number) =>
    `/api/user/all?pageNumber=${pageNumber}&pageSize=${pageSize}`,
  ADMIN_USER_DETAIL: (userId: string) => `/api/user/detail/${userId}`,
  ADMIN_SEARCH_USERS: (query: string) =>
    `/api/user/search?query=${encodeURIComponent(query)}`,
  ADMIN_RETRY_KYC: "/api/user/retry-kyc",
  ADMIN_GET_BACKUPS: "/api/utilities/admin/backups",
  ADMIN_TRIGGER_BACKUP: "/api/utilities/admin/backups/run",
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
    debugger;
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

  getAllScripts: async (pageNumber: number = 1, pageSize: number = 10) => {
    const response = await apiRequest(
      `${BASE_URL}${API_ENDPOINTS.SCRIPTS(
        pageNumber,
        pageSize
      )}?t=${Date.now()}`,
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
    return await apiRequest(
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
  getScriptsByWriterId: async (
    writerId: string,
    pageNumber: number,
    pageSize: number
  ) => {
    return await apiRequest(
      `${BASE_URL}${API_ENDPOINTS.SCRIPTS_BY_WRITER(
        writerId,
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
    pageSize: number = 12
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
    return apiRequest(`${BASE_URL}${API_ENDPOINTS.ADD_SCRIPT(writerId)}`, {
      method: "POST",
      body: formData,
      requireAuth: true,
    });
  },

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
      `${BASE_URL}${API_ENDPOINTS.INITIATE_SCRIPT_TRANSACTION()}`,
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

  // --- CHAT API ---
  getChats: async (userId: string, page = 1, pageSize = 20) => {
    return apiRequest(
      `${BASE_URL}/api/chat?Page=${page}&PageSize=${pageSize}`,
      {
        method: "GET",
        requireAuth: true,
      }
    );
  },

  getChatHistory: async (chatId: string, page = 1, pageSize = 20) => {
    return apiRequest(
      `${BASE_URL}/api/chat/${chatId}/messages?Page=${page}&PageSize=${pageSize}`,
      {
        method: "GET",
        requireAuth: true,
      }
    );
  },

  sendMessage: async (
    chatId: string,
    content: string,
    attachmentUrl?: string
  ) => {
    return apiRequest(`${BASE_URL}/api/chat/${chatId}/messages`, {
      method: "POST",
      requireAuth: true,
      body: JSON.stringify({ content, attachmentUrl }),
    });
  },

  markMessagesRead: async (chatId: string) => {
    return apiRequest(`${BASE_URL}/api/chat/${chatId}/messages/mark-read`, {
      method: "PATCH",
      requireAuth: true,
    });
  },

  createChat: async (data: {
    scriptId: string;
    producerId: string;
    writerId: string;
    scriptTitle: string;
    producerName: string;
    writerName: string;
  }) => {
    return apiRequest(`${BASE_URL}/api/chat`, {
      method: "POST",
      requireAuth: true,
      body: JSON.stringify(data),
    });
  },

  closeChat: async (chatId: string) => {
    return apiRequest(`${BASE_URL}/api/chat/${chatId}/close`, {
      method: "PATCH",
      requireAuth: true,
    });
  },

  updateScript: async (scriptId: string, writerId: string, scriptData: any) => {
    debugger;
    return apiRequest(
      `${BASE_URL}${API_ENDPOINTS.UPDATE_SCRIPT(scriptId, writerId)}`,
      {
        method: "PUT",
        requireAuth: true,
        body: JSON.stringify(scriptData),
      }
    );
  },

  updateScriptStatus: async (
    scriptId: string,
    writerId: string,
    status: string
  ) => {
    return apiRequest(
      `${BASE_URL}${API_ENDPOINTS.UPDATE_SCRIPT_STATUS(scriptId, writerId)}`,
      {
        method: "PUT",
        requireAuth: true,
        body: JSON.stringify({ status }),
      }
    );
  },

  deleteScript: async (scriptId: string, writerId: string) => {
    return apiRequest(
      `${BASE_URL}${API_ENDPOINTS.DELETE_SCRIPT(scriptId, writerId)}`,
      {
        method: "DELETE",
        requireAuth: true,
      }
    );
  },

  updateWriterProfile: async (writerId: string, formData: FormData) => {
    return apiRequest(
      `${BASE_URL}${API_ENDPOINTS.UPDATE_WRITER_PROFILE(writerId)}`,
      {
        method: "PUT",
        requireAuth: true,
        body: formData,
      }
    );
  },

  updateProducerProfile: async (producerId: string, formData: FormData) => {
    return apiRequest(
      `${BASE_URL}${API_ENDPOINTS.UPDATE_PRODUCER_PROFILE(producerId)}`,
      {
        method: "PUT",
        requireAuth: true,
        body: formData,
      }
    );
  },

  getProducerScripts: async (
    producerId: string,
    pageNumber: number,
    pageSize: number
  ) => {
    return apiRequest(
      `${BASE_URL}${API_ENDPOINTS.SCRIPTS_BY_PRODUCER(
        producerId,
        pageNumber,
        pageSize
      )}`,
      {
        method: "GET",
        requireAuth: true,
      }
    );
  },

  getProducerScriptsByTransaction: async (
    producerId: string,
    status: "initiated" | "completed" | "all",
    pageNumber: number,
    pageSize: number
  ) => {
    return apiRequest(
      `${BASE_URL}${API_ENDPOINTS.GET_PRODUCER_SCRIPTS_BY_TRANSACTION(
        producerId,
        status,
        pageNumber,
        pageSize
      )}`,
      {
        method: "GET",
        requireAuth: true,
      }
    );
  },

  completeScriptTransaction: async (
    producerId: string,
    scriptId: string,
    transactionId: string
  ) => {
    return apiRequest(
      `${BASE_URL}${API_ENDPOINTS.COMPLETE_SCRIPT_TRANSACTION(
        scriptId,
        transactionId
      )}`,
      {
        method: "POST",
        requireAuth: true,
      }
    );
  },

  cancelScriptTransaction: async (
    userId: string,
    scriptId: string,
    transactionId: string
  ) => {
    return apiRequest(
      `${BASE_URL}${API_ENDPOINTS.CANCEL_SCRIPT_TRANSACTION(
        scriptId,
        transactionId
      )}`,
      {
        method: "POST",
        requireAuth: true,
      }
    );
  },

  updateScriptContent: async (
    scriptId: string,
    writerId: string,
    file: File
  ) => {
    const formData = new FormData();
    formData.append("file", file);
    return apiRequest(
      `${BASE_URL}${API_ENDPOINTS.UPDATE_SCRIPT_CONTENT(scriptId, writerId)}`,
      {
        method: "PUT",
        body: formData,
        requireAuth: true,
      }
    );
  },

  getNotifications: async (page = 1, pageSize = 20) => {
    return apiRequest(
      `${BASE_URL}${API_ENDPOINTS.NOTIFICATIONS}?page=${page}&pageSize=${pageSize}`,
      {
        method: "GET",
        requireAuth: true,
      }
    );
  },

  // --- ADMIN API ---
  adminAllUsers: async (pageNumber: number = 1, pageSize: number = 50) => {
    return apiRequest(
      `${BASE_URL}${API_ENDPOINTS.ADMIN_ALL_USERS(pageNumber, pageSize)}`,
      {
        method: "GET",
        requireAuth: true,
      }
    );
  },

  adminUserDetail: async (userId: string) => {
    return apiRequest(`${BASE_URL}${API_ENDPOINTS.ADMIN_USER_DETAIL(userId)}`, {
      method: "GET",
      requireAuth: true,
    });
  },

  adminSearchUsers: async (
    query: string,
    pageNumber: number = 1,
    pageSize: number = 25
  ) => {
    return apiRequest(
      `${BASE_URL}${API_ENDPOINTS.ADMIN_SEARCH_USERS(
        query
      )}&pageNumber=${pageNumber}&pageSize=${pageSize}`,
      {
        method: "GET",
        requireAuth: true,
      }
    );
  },

  adminRetryKyc: async (data: {
    UserId: string;
    AdminId: string;
    VerificationNumber: string;
    VerificationType: string;
  }) => {
    return apiRequest(`${BASE_URL}${API_ENDPOINTS.ADMIN_RETRY_KYC}`, {
      method: "POST",
      requireAuth: true,
      body: JSON.stringify(data),
    });
  },
  adminUserTotalEarnings: async (userId: string) => {
    return apiRequest(`${BASE_URL}/api/user/earnings/${userId}`, {
      method: "GET",
      requireAuth: true,
    });
  },
  blacklistUser: async (userId: string, reason: string) => {
    return apiRequest(
      `${BASE_URL}/api/user/blacklist/${userId}?reason=${encodeURIComponent(
        reason
      )}`,
      {
        method: "POST",
        requireAuth: true,
      }
    );
  },
  removeBlacklist: async (userId: string) => {
    return apiRequest(`${BASE_URL}/api/user/remove-blacklist/${userId}`, {
      method: "POST",
      requireAuth: true,
    });
  },
  getBlacklistedUsers: async (
    pageNumber: number = 1,
    pageSize: number = 50
  ) => {
    return apiRequest(
      `${BASE_URL}/api/user/blacklisted?pageNumber=${pageNumber}&pageSize=${pageSize}`,
      {
        method: "GET",
        requireAuth: true,
      }
    );
  },
  getPlatformStats: async () => {
    return apiRequest(`${BASE_URL}/api/user/stats`, {
      method: "GET",
      requireAuth: true,
    });
  },
  getBackups: async () => {
    return apiRequest(`${BASE_URL}${API_ENDPOINTS.ADMIN_GET_BACKUPS}`, {
      method: "GET",
      requireAuth: true,
    });
  },
  triggerBackup: async () => {
    return apiRequest(`${BASE_URL}${API_ENDPOINTS.ADMIN_TRIGGER_BACKUP}`, {
      method: "POST",
      requireAuth: true,
    });
  },

  updateProfileImage: async (
    userId: string,
    data: { profileImageUrl: string; profileImagePublicId: string }
  ) => {
    return apiRequest(`${BASE_URL}/api/user/update-image/${userId}`, {
      method: "PUT",
      requireAuth: true,
      body: JSON.stringify(data),
    });
  },

  deleteFile: async (publicId: string) => {
    return apiRequest(`${BASE_URL}/api/utilities/file/${publicId}`, {
      method: "DELETE",
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
