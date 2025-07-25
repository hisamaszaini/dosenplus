import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import type { User, PaginatedResult } from '../../../../sidupak-backend/src/users/dto/user.dto';
import type { Fakultas } from '../../../../sidupak-backend/src/fakultas/dto/fakultas.dto';
import type { Prodi } from '../../../../sidupak-backend/src/prodi/dto/prodi.dto';

import * as userService from '../../services/user.service';
import * as fakultasService from '../../services/fakultas.service';
import * as prodiService from '../../services/prodi.service';

import Button from '../../components/ui/Button';
import { DosenFormModal } from '../../components/ui/DosenFormModal';
import { useDebounce } from '../../hooks/useDebounce';
import { ValidatorFormModal } from '../../components/ui/ValidatorFormModal';
import { AdminFormModal } from '../../components/ui/AdminFormModal';

export const AdminUserPage = () => {
  const [usersData, setUsersData] = useState<PaginatedResult<User> | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [isValidatorUserModalOpen, setIsValidatorUserModalOpen] = useState(false);
  const [isDosenModalOpen, setIsDosenModalOpen] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);

  const [editingUserId, setEditingUserId] = useState<number | null>(null);
  const [fakultasList, setFakultasList] = useState<Fakultas[]>([]);
  const [prodiList, setProdiList] = useState<Prodi[]>([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({ role: '', status: '' });
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = {
        page: currentPage,
        limit: 10,
        search: debouncedSearchQuery,
        role: (filters.role || undefined) as 'ADMIN' | 'DOSEN' | 'VALIDATOR' | undefined,
        status: (filters.status || undefined) as 'ACTIVE' | 'INACTIVE' | undefined,
      };
      const data = await userService.getAllUsers(params);
      setUsersData(data);
    } catch (error) {
      console.error("Gagal mengambil data pengguna:", error);
      toast.error('Gagal memuat data pengguna.');
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, debouncedSearchQuery, filters]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    const fetchFakultasDanProdi = async () => {
      try {
        const [fakultasData, prodiData] = await Promise.all([
          fakultasService.getAllFakultas(),
          prodiService.getAllProdi()
        ]);
        setFakultasList(fakultasData);
        setProdiList(prodiData);
      } catch (error) {
        toast.error('Gagal memuat data fakultas atau prodi.');
        console.error(error);
      }
    };
    fetchFakultasDanProdi();
  }, []);

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    setCurrentPage(1);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleOpenAddValidatorModal = () => {
    setEditingUserId(null);
    setIsValidatorUserModalOpen(true);
  };

  const handleOpenAddDosenModal = () => {
    setEditingUserId(null);
    setIsDosenModalOpen(true);
  };

  const handleOpenAddAdminModal = () => {
    setEditingUserId(null);
    setIsAdminModalOpen(true);
  };

  const handleOpenEditModal = (user: User) => {
    setEditingUserId(user.id);
    switch (user.role) {
      case 'DOSEN':
        setIsDosenModalOpen(true);
        break;
      case 'VALIDATOR':
        setIsValidatorUserModalOpen(true);
        break;
      case 'ADMIN':
        setIsAdminModalOpen(true);
        break;
      default:
        toast.error('Role tidak dikenali.');
        break;
    }
  };

  const handleSuccess = () => {
    toast.success(editingUserId ? 'Data pengguna berhasil diperbarui!' : 'Pengguna baru berhasil ditambahkan!');
    setIsValidatorUserModalOpen(false);
    setIsDosenModalOpen(false);
    setIsAdminModalOpen(false);
    fetchUsers();
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus pengguna ini? Tindakan ini tidak dapat diurungkan.')) {
      try {
        await userService.deleteUser(id);
        toast.success('Pengguna berhasil dihapus!');
        if (usersData?.data.length === 1 && currentPage > 1) {
          setCurrentPage(currentPage - 1);
        } else {
          fetchUsers();
        }
      } catch (error) {
        console.error("Gagal menghapus pengguna:", error);
        toast.error('Gagal menghapus pengguna.');
      }
    }
  };

  return (
    <>
      <div className="mb-6 flex flex-wrap justify-between items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Manajemen Pengguna</h1>
        <div className="flex flex-wrap justify-end gap-3">
          <Button onClick={handleOpenAddDosenModal} variant="secondary" icon="fas fa-user-graduate">
            Tambah Dosen
          </Button>
          <Button onClick={handleOpenAddValidatorModal} variant="primary" icon="fas fa-user-shield">
            Tambah Validator
          </Button>
          <Button onClick={handleOpenAddAdminModal} variant="primary" icon="fas fa-user-cog">
            Tambah Admin
          </Button>
        </div>
      </div>

      {/* Filter dan Search */}
      <div className="bg-white rounded-2xl shadow-xl pb-6 px-4 md:px-6">
        <div className="py-5 border-b border-gray-200 mb-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Cari nama, email, NIP..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          />
          <select name="role" value={filters.role} onChange={handleFilterChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg">
            <option value="">Semua Role</option>
            <option value="ADMIN">Admin</option>
            <option value="DOSEN">Dosen</option>
            <option value="VALIDATOR">Validator</option>
          </select>
          <select name="status" value={filters.status} onChange={handleFilterChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg">
            <option value="">Semua Status</option>
            <option value="ACTIVE">Aktif</option>
            <option value="INACTIVE">Tidak Aktif</option>
          </select>
        </div>

        {/* Tabel */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-4 text-left text-xs font-semibold text-gray-500 uppercase">Nama</th>
                <th className="p-4 text-left text-xs font-semibold text-gray-500 uppercase">Email</th>
                <th className="p-4 text-center text-xs font-semibold text-gray-500 uppercase">Role</th>
                <th className="p-4 text-center text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="p-4 text-center text-xs font-semibold text-gray-500 uppercase">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {isLoading ? (
                <tr><td colSpan={5} className="text-center p-8 text-gray-500">Memuat data...</td></tr>
              ) : usersData && usersData.data.length > 0 ? (
                usersData.data.map(user => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="p-4 font-medium text-gray-800">{user.dosen?.nama ?? user.name}</td>
                    <td className="p-4 text-gray-700">{user.email}</td>
                    <td className="p-4 text-center"><span className="font-mono text-xs">{user.role}</span></td>
                    <td className="p-4 text-center">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full font-medium text-xs ${user.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {user.status === 'ACTIVE' ? 'Aktif' : 'Tidak Aktif'}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex justify-center items-center space-x-2">
                        <Button onClick={() => handleOpenEditModal(user)} title="Edit User" variant="warning" size="icon">
                          <i className="fas fa-edit"></i>
                        </Button>
                        <Button onClick={() => handleDelete(user.id)} title="Hapus User" variant="danger" size="icon">
                          <i className="fas fa-trash"></i>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={5} className="text-center p-8 text-gray-500">Data pengguna tidak ditemukan.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {usersData && usersData.meta.total > 0 && (
          <div className="mt-4 px-2 flex justify-between items-center text-sm text-gray-600">
            <span>
              Menampilkan {usersData.data.length} dari {usersData.meta.total} hasil
            </span>
            <div className="flex items-center gap-2">
              <Button
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={!usersData.meta.hasPrev}
                applyDisabledStyle={true}
                variant="secondary"
                size="small"
                icon="fas fa-chevron-left"
              >
                Sebelumnya
              </Button>
              <Button
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={!usersData.meta.hasNext}
                applyDisabledStyle={true}
                variant="secondary"
                size="small"
                icon="fas fa-chevron-right"
              >
                Selanjutnya
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Modal Section */}
      <ValidatorFormModal
        isOpen={isValidatorUserModalOpen}
        onClose={() => setIsValidatorUserModalOpen(false)}
        onSuccess={handleSuccess}
        userId={editingUserId}
      />
      <DosenFormModal
        isOpen={isDosenModalOpen}
        onClose={() => setIsDosenModalOpen(false)}
        onSuccess={handleSuccess}
        userId={editingUserId}
        fakultas={fakultasList}
        prodi={prodiList}
      />
      <AdminFormModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
        onSuccess={handleSuccess}
        userId={editingUserId}
      />
    </>
  );
};
