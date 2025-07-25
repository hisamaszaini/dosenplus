import api from './api';
import type { CreateProdiDto, Prodi, UpdateProdiDto } from '../../../sidupak-backend/src/prodi/dto/prodi.dto';

export const getAllProdi = async (): Promise<Prodi[]> => {
  const { data } = await api.get('/prodi');
  return data;
};

export const createProdi = async (prodiData: CreateProdiDto): Promise<Prodi> => {
  const { data } = await api.post('/prodi', prodiData);
  return data;
};

export const updateProdi = async (id: number, prodiData: UpdateProdiDto): Promise<Prodi> => {
  const { data } = await api.patch(`/prodi/${id}`, prodiData);
  return data;
};

export const deleteProdi = async (id: number): Promise<void> => {
  await api.delete(`/prodi/${id}`);
};