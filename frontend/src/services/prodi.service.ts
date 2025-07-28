import api from './api';
import type { CreateProdiDto, Prodi, UpdateProdiDto } from '../../../backend/src/prodi/dto/prodi.dto';
import type { ApiResponse } from '../types/api-response.type';

export const getAllProdi = async (): Promise<ApiResponse<Prodi[]>> => {
  const { data } = await api.get('/prodi');
  return data;
};

export const createProdi = async (prodiData: CreateProdiDto): Promise<ApiResponse<Prodi[]>> => {
  const { data } = await api.post('/prodi', prodiData);
  return data;
};

export const updateProdi = async (id: number, prodiData: UpdateProdiDto): Promise<ApiResponse<Prodi[]>> => {
  const { data } = await api.patch(`/prodi/${id}`, prodiData);
  return data;
};

export const deleteProdi = async (id: number): Promise<void> => {
  await api.delete(`/prodi/${id}`);
};