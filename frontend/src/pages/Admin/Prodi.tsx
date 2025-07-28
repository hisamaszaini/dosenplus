import { useState, useEffect } from 'react';
import { toast } from 'sonner';

import * as prodiService from '../../services/prodi.service';
import * as fakultasService from '../../services/fakultas.service';
import { type Prodi } from '../../../../backend/src/prodi/dto/prodi.dto';
import { type Fakultas } from '../../../../backend/src/fakultas/dto/fakultas.dto';

import Button from '../../components/ui/Button';
import ProdiFormModal from '../../components/ui/ProdiFormModal';
import PageWrapper from '../../components/PageWrapper';

const AdminProdiPage = () => {
  const [prodi, setProdi] = useState<Prodi[]>([]);
  const [fakultas, setFakultas] = useState<Fakultas[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProdi, setEditingProdi] = useState<Prodi | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [prodiRes, fakultasRes] = await Promise.all([
        prodiService.getAllProdi(),
        fakultasService.getAllFakultas(),
      ]);

      if (prodiRes.success && fakultasRes.success) {
        setProdi(prodiRes.data);
        setFakultas(fakultasRes.data);
      } else {
        toast.error('Gagal memuat data dari server.');
      }
    } catch (error) {
      console.error("Gagal mengambil data:", error);
      toast.error('Gagal memuat data dari server.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenAddModal = () => {
    setEditingProdi(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (p: Prodi) => {
    setEditingProdi(p);
    setIsModalOpen(true);
  };

  const handleSuccess = () => {
    toast.success(editingProdi ? 'Prodi berhasil diperbarui!' : 'Prodi berhasil ditambahkan!');
    setIsModalOpen(false);
    fetchData();
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus prodi ini?')) {
      try {
        await prodiService.deleteProdi(id);
        toast.success('Prodi berhasil dihapus!');
        fetchData();
      } catch (error) {
        console.error("Gagal menghapus prodi:", error);
        toast.error('Gagal menghapus prodi.');
      }
    }
  };

  return (
    <>
      <PageWrapper title="Kelola Prodi">
        <div className="mb-6 flex justify-end">
          <Button onClick={handleOpenAddModal} variant="primary" icon="fas fa-plus-circle">
            Tambah Prodi Baru
          </Button>
        </div>

        <div className="bg-white rounded-2xl shadow-xl pb-6 px-4 md:px-6">
          <div className="py-5 border-b border-gray-200 mb-4 flex justify-between items-center">
            <h3 className="text-xl font-semibold text-gray-700">Daftar Program Studi</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="p-4 text-left text-xs font-semibold text-gray-500 uppercase">Kode Prodi</th>
                  <th className="p-4 text-left text-xs font-semibold text-gray-500 uppercase">Nama Prodi</th>
                  <th className="p-4 text-left text-xs font-semibold text-gray-500 uppercase">Fakultas</th>
                  <th className="p-4 text-center text-xs font-semibold text-gray-500 uppercase">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {isLoading ? (
                  <tr>
                    <td colSpan={4} className="text-center p-8 text-gray-500">
                      Memuat data...
                    </td>
                  </tr>
                ) : prodi.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center p-8 text-gray-400 italic">
                      Tidak ada data prodi.
                    </td>
                  </tr>
                ) : (
                  prodi.map((p) => {
                    const namaFakultas = fakultas.find((f) => f.id === p.fakultasId)?.nama || 'N/A';
                    return (
                      <tr key={p.id} className="hover:bg-gray-50">
                        <td className="p-4 font-medium text-gray-600">{p.kode}</td>
                        <td className="p-4 font-medium text-gray-800">{p.nama}</td>
                        <td className="p-4 text-gray-700">{namaFakultas}</td>
                        <td className="p-4">
                          <div className="flex justify-center items-center space-x-2">
                            <Button onClick={() => handleOpenEditModal(p)} title="Edit Prodi" variant="warning" size="icon">
                              <i className="fas fa-edit"></i>
                            </Button>
                            <Button onClick={() => handleDelete(p.id)} title="Hapus Prodi" variant="danger" size="icon">
                              <i className="fas fa-trash"></i>
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        <ProdiFormModal
          key={editingProdi?.id ?? 'new'}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={handleSuccess}
          initialData={editingProdi}
          fakultas={fakultas}
        />

      </PageWrapper>
    </>
  );
};

export default AdminProdiPage;