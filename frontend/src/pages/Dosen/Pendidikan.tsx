import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import pendidikanService from '../../services/pendidikan.service';
import PendidikanTable from '../../components/ui/Dosen/PendidikanTable';

interface PendidikanItem {
    id: number;
    kategori: string;
    kegiatan: string;
    nilaiPak: number;
    lulusTahun: number;
    jenjang: string;
    dosenId: number;
    fileUrl?: string;
    createdAt: string;
    updatedAt: string;
}

interface PendidikanListResponse {
    data: PendidikanItem[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export default function PendidikanPage() {
    const { user } = useAuth();
    const [list, setList] = useState<PendidikanItem[]>([]);
    const [meta, setMeta] = useState<PendidikanListResponse['pagination']>({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 1,
    });

    const handleEdit = (row: PendidikanItem) => {
        console.log('Edit', row);
        // buka modal, dll.
    };

    const handleDelete = (id: number) => {
        console.log('Delete', id);
        // panggil API delete, lalu refresh list
    };

    useEffect(() => {
        const fetchPendidikan = async () => {
            const params = {
                page: meta.page,
                limit: meta.limit,
                search: '',
                kategori: '',
                jenjang: '',
                sortBy: 'createdAt',
                sortOrder: 'desc',
            };
            try {
                const response = await pendidikanService.findAll(params, user.sub, user.role);
                setList(response.data || []);
                setMeta(response.pagination || { page: 1, limit: 10, total: 0, totalPages: 1 });
            } catch (error) {
                console.error('Error fetching data:', error);
                setList([]);
                setMeta({ page: 1, limit: 10, total: 0, totalPages: 1 });
            }
        };
        fetchPendidikan();
    }, [meta.page, meta.limit, user]);

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Data Pendidikan & Diklat</h1>
            <PendidikanTable/>
            {/* <PendidikanTable data={list} onEdit={handleEdit} onDelete={handleDelete} /> */}
            {/* <div className="flex justify-center mt-4">
                {[...Array(meta.totalPages)].map((_, p) => (
                    <button
                        key={p}
                        className={`px-3 py-1 mx-1 border ${p + 1 === meta.page ? 'bg-blue-500 text-white' : ''}`}
                        onClick={() => setMeta({ ...meta, page: p + 1 })}
                    >
                        {p + 1}
                    </button>
                ))}
            </div> */}
        </div>
    );
}