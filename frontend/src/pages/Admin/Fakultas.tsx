import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

import * as fakultasService from '../../services/fakultas.service';
import type { Fakultas } from '../../../../backend/src/fakultas/dto/fakultas.dto';
import Button from '../../components/ui/Button';
import FakultasFormModal from '../../components/ui/FakultasFormModal';
import PageWrapper from '../../components/PageWrapper';

const AdminFakultasPage = () => {
  const [fakultas, setFakultas] = useState<Fakultas[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingFakultas, setEditingFakultas] = useState<Fakultas | null>(null);

  const fetchFakultas = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fakultasService.getAllFakultas();
      if (response.success) {
        setFakultas(response.data);
      } else {
        toast.error('Gagal memuat data fakultas');
      }
    } catch (error) {
      console.error('Gagal mengambil data fakultas:', error);
      toast.error('Terjadi kesalahan saat mengambil data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFakultas();
  }, [fetchFakultas]);

  const handleOpenAddModal = () => {
    setEditingFakultas(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (fakulta: Fakultas) => {
    setEditingFakultas(fakulta);
    setIsModalOpen(true);
  };

  const handleSuccess = () => {
    toast.success(editingFakultas ? 'Fakultas berhasil diperbarui!' : 'Fakultas berhasil ditambahkan!');
    setIsModalOpen(false);
    fetchFakultas();
  };

  const handleDelete = async (id: number) => {
    const confirmed = window.confirm('Apakah Anda yakin ingin menghapus fakultas ini?');
    if (!confirmed) return;

    try {
      const response = await fakultasService.deleteFakultas(id);
      if (response.success) {
        toast.success('Fakultas berhasil dihapus!');
        fetchFakultas();
      } else {
        toast.error('Gagal menghapus fakultas.');
      }
    } catch (error) {
      console.error('Gagal menghapus fakultas:', error);
      toast.error('Terjadi kesalahan saat menghapus fakultas.');
    }
  };

  return (
    <PageWrapper title="Kelola Fakultas">
      <div className="mb-6 flex justify-end">
        <Button onClick={handleOpenAddModal} variant="primary" icon="fas fa-plus-circle">
          Tambah Fakultas Baru
        </Button>
      </div>

      <div className="bg-white rounded-2xl shadow-xl pb-6 px-4 md:px-6">
        <div className="py-5 border-b border-gray-200 mb-4 flex justify-between items-center">
          <h3 className="text-xl font-semibold text-gray-700">Daftar Fakultas</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-4 text-left text-xs font-semibold text-gray-500 uppercase">Kode</th>
                <th className="p-4 text-left text-xs font-semibold text-gray-500 uppercase">Nama Fakultas</th>
                <th className="p-4 text-center text-xs font-semibold text-gray-500 uppercase">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={3} className="text-center p-8 text-gray-500">
                    Memuat data...
                  </td>
                </tr>
              ) : fakultas.length === 0 ? (
                <tr>
                  <td colSpan={3} className="text-center p-8 text-gray-400 italic">
                    Tidak ada data fakultas.
                  </td>
                </tr>
              ) : (
                fakultas.map((fakulta) => (
                  <tr key={fakulta.id} className="hover:bg-gray-50">
                    <td className="p-4 font-medium text-gray-600">{fakulta.kode}</td>
                    <td className="p-4 font-medium text-gray-800">{fakulta.nama}</td>
                    <td className="p-4">
                      <div className="flex justify-center items-center space-x-2">
                        <Button
                          onClick={() => handleOpenEditModal(fakulta)}
                          title="Edit Fakultas"
                          variant="warning"
                          size="icon"
                        >
                          <i className="fas fa-edit"></i>
                        </Button>
                        <Button
                          onClick={() => handleDelete(fakulta.id)}
                          title="Hapus Fakultas"
                          variant="danger"
                          size="icon"
                        >
                          <i className="fas fa-trash"></i>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <FakultasFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleSuccess}
        initialData={editingFakultas}
      />
    </PageWrapper>
  );
};

export default AdminFakultasPage;
