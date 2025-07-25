import api from './api';

export const pelaksanaanPendidikanService = {
  async findAll(params?: any) {
    const res = await api.get('/pelaksanaan-pendidikan', { params });
    return res.data;
  },

  async findOne(id: number) {
    const res = await api.get(`/pelaksanaan-pendidikan/${id}`);
    return res.data;
  },

  async create(data: FormData) {
    const res = await api.post('/pelaksanaan-pendidikan', data);
    return res.data;
  },

  async update(id: number, data: FormData) {
    const res = await api.patch(`/pelaksanaan-pendidikan/${id}`, data);
    return res.data;
  },

  async delete(id: number) {
    const res = await api.delete(`/pelaksanaan-pendidikan/${id}`);
    return res.data;
  },
};
