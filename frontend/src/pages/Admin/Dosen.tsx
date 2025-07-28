import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { type User } from '../../../../backend/src/users/dto/user.dto';
import * as userService from '../../services/user.service';
import * as fakultasService from '../../services/fakultas.service';
import * as prodiService from '../../services/prodi.service';

import Button from '../../components/ui/Button';
import { DosenFormModal } from '../../components/ui/DosenFormModal';
import type { Fakultas } from '../../../../backend/src/fakultas/dto/fakultas.dto';
import type { Prodi } from '../../../../backend/src/prodi/dto/prodi.dto';

export const AdminDosenPage = () => {
    const [dosenList, setDosenList] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [page, setPage] = useState(1);
    const [limit] = useState(20);
    const [total, setTotal] = useState(0);

    const [isDosenModalOpen, setIsDosenModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);

    const [fakultasList, setFakultasList] = useState<Fakultas[]>([]);
    const [prodiList, setProdiList] = useState<Prodi[]>([]);

    const fetchDosen = async () => {
        setIsLoading(true);
        try {
            const response = await userService.getAllDosen(page, limit);
            setDosenList(response.data);
            setTotal(response.total);
        } catch (error) {
            toast.error('Gagal memuat data dosen.');
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchFakultasDanProdi = async () => {
        try {
            const [fakultasData, prodiData] = await Promise.all([
                fakultasService.getAllFakultas(),
                prodiService.getAllProdi()
            ]);
            setFakultasList(fakultasData);
            setProdiList(prodiData);
        } catch (error) {
            toast.error('Gagal memuat data fakultas/prodi.');
        }
    };

    useEffect(() => {
        fetchDosen();
        fetchFakultasDanProdi();
    }, [page]);

    const handleOpenAdd = () => {
        setEditingUser(null);
        setIsDosenModalOpen(true);
    };

    const handleEdit = (user: User) => {
        setEditingUser(user);
        setIsDosenModalOpen(true);
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('Hapus dosen ini? Tindakan ini tidak dapat dibatalkan.')) {
            try {
                await userService.deleteUser(id);
                toast.success('Dosen berhasil dihapus.');
                fetchDosen();
            } catch (error) {
                toast.error('Gagal menghapus dosen.');
            }
        }
    };

    const handleSuccess = () => {
        toast.success(editingUser ? 'Data dosen diperbarui.' : 'Dosen baru ditambahkan.');
        setIsDosenModalOpen(false);
        fetchDosen();
    };

    return (
        <>
            <div className="mb-6 flex justify-end">
                <Button onClick={handleOpenAdd} icon="fas fa-user-plus" variant="primary">
                    Tambah Dosen
                </Button>
            </div>

            <div className="bg-white rounded-2xl shadow-xl pb-6 px-4 md:px-6">
                <div className="py-5 border-b border-gray-200 mb-4 flex justify-between items-center">
                    <h3 className="text-xl font-semibold text-gray-700">Daftar Dosen</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="p-4 text-left text-xs font-semibold text-gray-500 uppercase">Nama</th>
                                <th className="p-4 text-left text-xs font-semibold text-gray-500 uppercase">Email</th>
                                <th className="p-4 text-center text-xs font-semibold text-gray-500 uppercase">Status</th>
                                <th className="p-4 text-center text-xs font-semibold text-gray-500 uppercase">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={4} className="text-center p-8 text-gray-500">Memuat data...</td>
                                </tr>
                            ) : dosenList.length > 0 ? (
                                dosenList.map((user) => (
                                    <tr key={user.id} className="hover:bg-gray-50">
                                        <td className="p-4 font-medium text-gray-800">{user.dosen?.nama ?? user.name}</td>
                                        <td className="p-4 text-gray-700">{user.email}</td>
                                        <td className="p-4 text-center">
                                            <span className={`inline-flex items-center px-3 py-1 rounded-full font-medium text-xs ${user.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                {user.status === 'ACTIVE' ? 'Aktif' : 'Tidak Aktif'}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex justify-center space-x-2">
                                                <Button onClick={() => handleEdit(user)} title="Edit Dosen" variant="warning" size="icon">
                                                    <i className="fas fa-edit"></i>
                                                </Button>
                                                <Button onClick={() => handleDelete(user.id)} title="Hapus Dosen" variant="danger" size="icon">
                                                    <i className="fas fa-trash"></i>
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={4} className="text-center p-8 text-gray-500">Belum ada data dosen.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                    <div className="flex justify-between items-center mt-4 px-2">
                        <div className="text-sm text-gray-600">
                            Halaman {page} dari {Math.ceil(total / limit)}
                        </div>
                        <div className="space-x-2">
                            <Button
                                variant="secondary"
                                disabled={page === 1}
                                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                            >
                                <i className="fas fa-chevron-left mr-1"></i> Sebelumnya
                            </Button>
                            <Button
                                variant="secondary"
                                disabled={page >= Math.ceil(total / limit)}
                                onClick={() => setPage((prev) => prev + 1)}
                            >
                                Berikutnya <i className="fas fa-chevron-right ml-1"></i>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <DosenFormModal
                isOpen={isDosenModalOpen}
                onClose={() => setIsDosenModalOpen(false)}
                onSuccess={handleSuccess}
                initialData={editingUser}
                fakultas={fakultasList}
                prodi={prodiList}
            />
        </>
    );
};

export default AdminDosenPage;
