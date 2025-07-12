import axios, {
  AxiosInstance, InternalAxiosRequestConfig, AxiosResponse, AxiosError,
}
  from 'axios';
// eslint-disable-next-line import/extensions, import/no-unresolved
import { useAuthenticationStore } from '@/stores/AuthenticationStore';

interface RetryableAxiosRequestConfig extends InternalAxiosRequestConfig {
  retryAttempt?: boolean;
}

const ApiClient: AxiosInstance = axios.create({
  baseURL: 'http://localhost:5124/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

ApiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    const authenticationStore = useAuthenticationStore();
    const token = authenticationStore.getToken();

    if (token) {
      return {
        ...config,
        headers: {
          ...config.headers,
          Authorization: `Bearer ${token}`,
        },
      } as InternalAxiosRequestConfig;
    }

    return config;
  },
  (error: AxiosError): Promise<AxiosError> => Promise.reject(error),
);

ApiClient.interceptors.response.use(
  (response: AxiosResponse): AxiosResponse => response,
  async (error: AxiosError): Promise<AxiosResponse | AxiosError> => {
    const originalRequest = error.config as RetryableAxiosRequestConfig;

    if (error.response?.status === 401
      && !originalRequest.retryAttempt
      && !originalRequest.url?.includes('/auth/login')
      && !originalRequest.url?.includes('/auth/check-user-exists')
    ) {
      originalRequest.retryAttempt = true;

      try {
        const authenticationStore = useAuthenticationStore();
        await authenticationStore.refreshTokenUpdate();

        originalRequest.headers.Authorization = `Bearer ${authenticationStore.getToken()}`;

        return ApiClient(originalRequest);
      } catch (refreshError) {
        const authenticationStore = useAuthenticationStore();
        authenticationStore.clearAuth();

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export default ApiClient;
