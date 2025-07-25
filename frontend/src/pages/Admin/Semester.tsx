import { useState, useEffect } from 'react';
import { toast } from 'sonner';

// import { useTitle } from '../../contexts/TitleContext';
import * as semesterService from '../../services/semester.service';
import SemesterFormModal from '../../components/ui/SemesterFormModal';
import Button from '../../components/ui/Button';
import { type Semester } from '../../../../sidupak-backend/src/semester/dto/semester.dto';

const AdminSemesterPage = () => {
  //   useTitle().setTitle('Manajemen Semester');
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [search, setSearch] = useState('');
  const [meta, setMeta] = useState({ total: 0, totalPages: 1 });
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSemester, setEditingSemester] = useState<Semester | null>(null);

  const fetchSemesters = async () => {
    setIsLoading(true);
    try {
      const res = await semesterService.getAllSemesters({ page, limit, search });
      setSemesters(res.data);
      setMeta(res.meta);
    } catch (error) {
      console.error("Gagal mengambil data semester:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSemesters();
  }, [page, search]);

  const handleOpenAddModal = () => {
    setEditingSemester(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (semester: Semester) => {
    setEditingSemester(semester);
    setIsModalOpen(true);
  };

  const handleSuccess = () => {
    toast.success(editingSemester ? 'Semester berhasil diperbarui!' : 'Semester berhasil ditambahkan!');

    setIsModalOpen(false);
    fetchSemesters();
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus semester ini?')) {
      try {
        await semesterService.deleteSemester(id);
        toast.success('Semester berhasil dihapus!');
        fetchSemesters();
      } catch (error) {
        console.error("Gagal menghapus semester:", error);
      }
    }
  };

  return (
    <>
      <div className="mb-6 flex justify-end">
        <Button onClick={handleOpenAddModal} variant="primary" icon="fas fa-plus-circle">
          Tambah Semester Baru
        </Button>
      </div>

      <div className="bg-white rounded-2xl shadow-xl pb-6 px-4 md:px-6">
        <div className="py-5 border-b border-gray-200 mb-4 flex justify-between items-center">
          <h3 className="text-xl font-semibold text-gray-700">Daftar Semester</h3>
        </div>
        <div className="overflow-x-auto">
          <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
            <input
              type="text"
              placeholder="Cari semester..."
              value={search}
              onChange={(e) => {
                setPage(1);
                setSearch(e.target.value);
              }}
              className="border border-gray-200 rounded-lg px-4 py-2 w-full md:w-64"
            />
          </div>
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-4 text-left text-xs font-semibold text-gray-500 uppercase">Kode</th>
                <th className="p-4 text-left text-xs font-semibold text-gray-500 uppercase">Nama Semester</th>
                <th className="p-4 text-left text-xs font-semibold text-gray-500 uppercase">Tipe</th>
                <th className="p-4 text-left text-xs font-semibold text-gray-500 uppercase">Tahun Ajaran</th>
                <th className="p-4 text-center text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="p-4 text-center text-xs font-semibold text-gray-500 uppercase">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {isLoading ? (
                <tr><td colSpan={6} className="text-center p-8 text-gray-500">Memuat data...</td></tr>
              ) : (
                semesters.map(semester => (
                  <tr key={semester.id} className="hover:bg-gray-50">
                    <td className="p-4 font-medium text-gray-600">{semester.kode}</td>
                    <td className="p-4 font-medium text-gray-800">{semester.nama}</td>
                    <td className="p-4 text-gray-700">{semester.tipe}</td>
                    <td className="p-4 text-gray-700">{semester.tahunMulai}/{semester.tahunSelesai}</td>
                    <td className="p-4 text-center">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full font-medium ${semester.status ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {semester.status ? 'Aktif' : 'Tidak Aktif'}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex justify-center items-center space-x-2">
                        <Button onClick={() => handleOpenEditModal(semester)} title="Edit Semester" variant="warning" size="icon">
                          <i className="fas fa-edit"></i>
                        </Button>
                        <Button onClick={() => handleDelete(semester.id)} title="Hapus Semester" variant="danger" size="icon">
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
        {!isLoading && (
          <div className="flex justify-between items-center mt-4 px-2 text-sm text-gray-600">
            <span>
              Menampilkan {(page - 1) * limit + 1} - {Math.min(page * limit, meta.total)} dari {meta.total} data
            </span>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                    disabled={page === 1}
                    applyDisabledStyle={true}
                    variant="secondary"
                    size="small"
                    icon="fas fa-chevron-left"
                  >
                    Sebelumnya
                  </Button>
                  <Button
                    onClick={() => setPage((prev) => Math.min(prev + 1, meta.totalPages))}
                    disabled={page === meta.totalPages}
                    applyDisabledStyle={true}
                    variant="secondary"
                    size="small"
                    icon="fas fa-chevron-right"
                  >
                    Berikutnya
                  </Button>
                </div>

              </div>
            </div>
          </div>
        )}
      </div>

      <SemesterFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleSuccess}
        initialData={editingSemester}
      />
    </>
  );
};

export default AdminSemesterPage;