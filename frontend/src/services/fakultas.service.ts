import api from './api';
import type { CreateFakultasDto, Fakultas, UpdateFakultasDto } from '../../../backend/src/fakultas/dto/fakultas.dto';

type ApiResponse<T> = {
  success: boolean;
  message?: string;
  data: T;
};

export const getAllFakultas = async (): Promise<ApiResponse<Fakultas[]>> => {
  const { data } = await api.get('/fakultas');
  return data;
};

export const createFakultas = async (payload: CreateFakultasDto): Promise<ApiResponse<Fakultas>> => {
  const { data } = await api.post('/fakultas', payload);
  return data;
};

export const updateFakultas = async (id: number, payload: UpdateFakultasDto): Promise<ApiResponse<Fakultas>> => {
  const { data } = await api.patch(`/fakultas/${id}`, payload);
  return data;
};

export const deleteFakultas = async (id: number): Promise<ApiResponse<null>> => {
  const { data } = await api.delete(`/fakultas/${id}`);
  return data;
};