import api from './api';
import type { CreatePendidikanDto } from '../../../sidupak-backend/src/pendidikan/dto/create-pendidikan.dto';
import type { UpdatePendidikanDto } from '../../../sidupak-backend/src/pendidikan/dto/update-pendidikan.dto';

// Types untuk response
export interface PendidikanItem {
  id: number;
  kategori: string;
  kegiatan: string;
  nilaiPak: number;
  lulusTahun: number;
  jenjang: string;
  dosenId: number;
  fileUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PendidikanListResponse {
  data: PendidikanItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface FindAllParams {
  page?: number;
  limit?: number;
  search?: string;
  kategori?: string;
  jenjang?: string;
  lulusTahun?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface BulkDeleteRequest {
  ids: number[];
}

export interface ExportParams {
  kategori?: string;
  jenjang?: string;
  lulusTahun?: string;
}

export const pendidikanService = {
  create: async (data: Omit<CreatePendidikanDto, 'file'>, file: File) => {
    const formData = new FormData();

    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, value as any);
      }
    });

    formData.append('file', file);

    return api.post('/pendidikan', formData);
  },

  // Update pendidikan
  async update(id: number, data: UpdatePendidikanDto, file?: File): Promise<PendidikanItem> {
    const formData = new FormData();

    // Append file if provided
    if (file) {
      formData.append('file', file);
    }

    // Append other fields
    Object.keys(data).forEach(key => {
      const value = data[key as keyof UpdatePendidikanDto];
      if (value !== undefined && value !== null) {
        formData.append(key, String(value));
      }
    });

    const response = await api.patch(`/pendidikan/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  },

  // Get all pendidikan with pagination and filters
 findAll: async (params: FindAllParams): Promise<PendidikanListResponse> => {
    const response = await api.get<PendidikanListResponse>('/pendidikan', {
      params: { ...params },
    });
    return response.data;
  },

  // Get pendidikan by dosen ID (admin only)
  async findByDosen(dosenId: number, params: FindAllParams = {}): Promise<PendidikanListResponse> {
    const queryParams = new URLSearchParams();

    // Add pagination params
    if (params.page) queryParams.append('page', String(params.page));
    if (params.limit) queryParams.append('limit', String(params.limit));

    // Add filter params
    if (params.search) queryParams.append('search', params.search);
    if (params.kategori) queryParams.append('kategori', params.kategori);
    if (params.jenjang) queryParams.append('jenjang', params.jenjang);
    if (params.lulusTahun) queryParams.append('lulusTahun', String(params.lulusTahun));

    // Add sort params
    if (params.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);

    const response = await api.get(`/pendidikan/dosen/${dosenId}?${queryParams.toString()}`);
    return response.data;
  },

  // Get single pendidikan by ID
  async findOne(id: number): Promise<PendidikanItem> {
    const response = await api.get(`/pendidikan/${id}`);
    return response.data;
  },

  // Delete pendidikan
  async remove(id: number): Promise<{ message: string }> {
    const response = await api.delete(`/pendidikan/${id}`);
    return response.data;
  },

  // Download file
  async downloadFile(id: number, download: boolean = true): Promise<Blob> {
    const response = await api.get(`/pendidikan/${id}/file?download=${download}`, {
      responseType: 'blob',
    });
    return response.data;
  },

  // Preview file (inline)
  async previewFile(id: number): Promise<Blob> {
    const response = await api.get(`/pendidikan/${id}/preview`, {
      responseType: 'blob',
    });
    return response.data;
  },

  // Get file URL for preview (alternative approach)
  getFilePreviewUrl(id: number): string {
    return `${api.defaults.baseURL}/pendidikan/${id}/preview`;
  },

  // Get file download URL
  getFileDownloadUrl(id: number): string {
    return `${api.defaults.baseURL}/pendidikan/${id}/file?download=true`;
  },

  // Admin only endpoints
  admin: {
    // Get stats
    async getStats(): Promise<{ message: string }> {
      const response = await api.get('/pendidikan/summary/stats');
      return response.data;
    },

    // Bulk delete
    async bulkDelete(data: BulkDeleteRequest): Promise<{ message: string; ids: number[] }> {
      const response = await api.post('/pendidikan/bulk/delete', data);
      return response.data;
    },

    // Export to CSV
    async exportToCsv(params: ExportParams = {}): Promise<Blob> {
      const queryParams = new URLSearchParams();

      if (params.kategori) queryParams.append('kategori', params.kategori);
      if (params.jenjang) queryParams.append('jenjang', params.jenjang);
      if (params.lulusTahun) queryParams.append('lulusTahun', params.lulusTahun);

      const response = await api.get(`/pendidikan/export/csv?${queryParams.toString()}`, {
        responseType: 'blob',
      });
      return response.data;
    },

    // Get export CSV URL
    getExportCsvUrl(params: ExportParams = {}): string {
      const queryParams = new URLSearchParams();

      if (params.kategori) queryParams.append('kategori', params.kategori);
      if (params.jenjang) queryParams.append('jenjang', params.jenjang);
      if (params.lulusTahun) queryParams.append('lulusTahun', params.lulusTahun);

      return `${api.defaults.baseURL}/pendidikan/export/csv?${queryParams.toString()}`;
    },
  },
};

// Helper functions
export const pendidikanHelpers = {
  // Create download link for blob
  downloadBlob(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },

  // Format file size
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },

  // Validate file before upload
  validateFile(file: File): { valid: boolean; error?: string } {
    // Check file type
    if (file.type !== 'application/pdf') {
      return { valid: false, error: 'Hanya file PDF yang diperbolehkan' };
    }

    // Check file size (5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return { valid: false, error: 'Ukuran file tidak boleh lebih dari 5MB' };
    }

    return { valid: true };
  },

  // Build query string for filters
  buildQueryString(params: FindAllParams): string {
    const queryParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, String(value));
      }
    });

    return queryParams.toString();
  },
};

export default pendidikanService;