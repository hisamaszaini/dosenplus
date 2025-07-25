import api from './api';
import type { CreateSemesterDto, UpdateSemesterDto, Semester } from '../../../sidupak-backend/src/semester/dto/semester.dto';

interface GetAllSemestersParams {
  page?: number;
  limit?: number;
  search?: string;
}

interface SemesterPaginationResponse {
  data: Semester[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const getAllSemesters = async (
  params: GetAllSemestersParams = {}
): Promise<SemesterPaginationResponse> => {
  const query = new URLSearchParams();

  if (params.page) query.append('page', String(params.page));
  if (params.limit) query.append('limit', String(params.limit));
  if (params.search) query.append('search', params.search);

  const { data } = await api.get(`/semester?${query.toString()}`);
  return data;
};

export const createSemester = async (semesterData: CreateSemesterDto): Promise<Semester> => {
  const { data } = await api.post('/semester', semesterData);
  return data;
};

export const updateSemester = async (id: number, semesterData: UpdateSemesterDto): Promise<Semester> => {
  const { data } = await api.patch(`/semester/${id}`, semesterData);
  return data;
};

export const deleteSemester = async (id: number): Promise<void> => {
  await api.delete(`/semester/${id}`);
};