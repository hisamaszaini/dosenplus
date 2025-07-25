import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: API_URL,
});

// Interceptor untuk menambahkan access token ke setiap permintaan
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor untuk menangani token kedaluwarsa dan mengulang permintaan
api.interceptors.response.use(
  (response) => response, // Jika response sukses, langsung kembalikan
  async (error) => {
    const originalRequest = error.config;

    // Jika error 401 (Unauthorized)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true; // Tandai agar tidak terjadi loop tak terbatas

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          // Jika tidak ada refresh token, paksa logout
          window.location.href = '/login';
          return Promise.reject(error);
        }

        // Minta accessToken baru menggunakan refreshToken
        const { data } = await axios.post(
          `${API_URL}/auth/refresh`,
          {},
          {
            headers: {
              Authorization: `Bearer ${refreshToken}`,
            },
          }
        );

        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);

        originalRequest.headers['Authorization'] = `Bearer ${data.accessToken}`;

        return api(originalRequest);

      } catch (refreshError) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;