import api from './api';
import type { CreateFakultasDto, Fakultas, UpdateFakultasDto } from '../../../sidupak-backend/src/fakultas/dto/fakultas.dto';

export const getAllFakultas = async (): Promise<Fakultas[]> => {
  const { data } = await api.get('/fakultas');
  return data;
};

export const createFakultas = async (fakultasData: CreateFakultasDto): Promise<Fakultas> => {
  const { data } = await api.post('/fakultas', fakultasData);
  return data;
};

export const updateFakultas = async (id: number, fakultasData: UpdateFakultasDto): Promise<Fakultas> => {
  const { data } = await api.patch(`/fakultas/${id}`, fakultasData);
  return data;
};

export const deleteFakultas = async (id: number): Promise<void> => {
  await api.delete(`/fakultas/${id}`);
};