import React, { useEffect, useState } from 'react';
import Button from '../Button';
import { z } from 'zod';
import { useAuth } from '../../../contexts/AuthContext';

const fileSchema = z.string().refine((val) => val.endsWith('.pdf'), {
    message: 'File harus PDF',
});

interface PendidikanFormData {
    dosenId: number;
    kategori: string;
    kegiatan?: string;
    nilaiPak: number;

    // Pendidikan Formal
    jenjang?: string;
    prodi?: string;
    fakultas?: string;
    perguruanTinggi?: string;
    lulusTahun?: number;

    // Diklat
    jenisDiklat?: string;
    namaDiklat?: string;
    penyelenggara?: string;
    peran?: string;
    tingkatan?: 'LOKAL' | 'REGIONAL' | 'NASIONAL' | 'INTERNASIONAL';
    jumlahJam?: number;
    noSertifikat?: string;
    tglSertifikat?: string;
    tempat?: string;
    tanggalMulai?: string;
    tanggalSelesai?: string;

    file?: string;
}

interface PendidikanFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: Omit<PendidikanFormData, 'file'>, file?: File) => void;
    initialData?: PendidikanFormData;
    isLoading?: boolean;
}

const PendidikanFormModal = ({
    isOpen,
    onClose,
    onSubmit,
    initialData,
    isLoading = false,
}: PendidikanFormModalProps) => {
    const { user } = useAuth();
    const [fileObj, setFileObj] = useState<File | null>(null);
    const [formData, setFormData] = useState<PendidikanFormData>({
        kategori: '',
        kegiatan: '',
        file: '',
    });

    console.log(user);

    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    useEffect(() => {
        setFormData(initialData || {
            kategori: '',
            kegiatan: '',
            file: '',
        });
    }, [initialData, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;

        if (name === 'kategori') {
            setFormData((prev) => ({
                ...prev,
                kategori: value,
                ...(value === 'Pendidikan Formal'
                    ? {
                        jenisDiklat: '',
                        namaDiklat: '',
                        penyelenggara: '',
                        peran: '',
                        tingkatan: undefined,
                        jumlahJam: undefined,
                        noSertifikat: '',
                        tglSertifikat: '',
                        tempat: '',
                        tanggalMulai: '',
                        tanggalSelesai: '',
                    }
                    : {
                        jenjang: '',
                        prodi: '',
                        fakultas: '',
                        perguruanTinggi: '',
                        lulusTahun: undefined,
                    }),
            }));
        } else {
            setFormData((prev) => ({
                ...prev,
                [name]: ['lulusTahun', 'jumlahJam'].includes(name)
                    ? Number(value)
                    : value,
            }));
        }
    };

    const validateForm = () => {
        const newErrors: { [key: string]: string } = {};

        if (!formData.kategori) {
            newErrors.kategori = 'Kategori harus dipilih';
        }

        if (formData.kategori === 'Pendidikan Formal') {
            if (!formData.jenjang) newErrors.jenjang = 'Jenjang harus diisi';
            if (!formData.prodi) newErrors.prodi = 'Program Studi harus diisi';
            if (!formData.fakultas) newErrors.fakultas = 'Fakultas harus diisi';
            if (!formData.perguruanTinggi) newErrors.perguruanTinggi = 'Perguruan Tinggi harus diisi';
            if (!formData.lulusTahun) newErrors.lulusTahun = 'Tahun Lulus harus diisi';
        } else if (formData.kategori === 'Diklat') {
            if (!formData.jenisDiklat) newErrors.jenisDiklat = 'Jenis Diklat harus diisi';
            if (!formData.namaDiklat) newErrors.namaDiklat = 'Nama Diklat harus diisi';
            if (!formData.penyelenggara) newErrors.penyelenggara = 'Penyelenggara harus diisi';
            if (!formData.peran) newErrors.peran = 'Peran harus diisi';
            if (!formData.tingkatan) newErrors.tingkatan = 'Tingkatan harus diisi';
            if (!formData.noSertifikat) newErrors.peran = 'NO Sertifikat harus diisi';
            if (!formData.tglSertifikat) newErrors.peran = 'Tanggal Sertifikat harus diisi';
            if (!formData.tempat) newErrors.peran = 'Tempat harus diisi';
            if (!formData.tanggalMulai) newErrors.peran = 'Tanggal mulai harus diisi';
            if (!formData.tanggalSelesai) newErrors.peran = 'Tanggal selesai harus diisi';
            if (!formData.jumlahJam) newErrors.jumlahJam = 'Jumlah Jam harus diisi';
        }

        if (!formData.file || !fileSchema.safeParse(formData.file).success) {
            newErrors.file = 'File bukti harus diunggah dalam format PDF';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setFileObj(file);
            setFormData({ ...formData, file: file.name });
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (validateForm()) {
            if (!user?.dosen?.id) {
                alert("ID dosen tidak ditemukan.");
                return;
            }

            const finalData = {
                ...formData,
                dosenId: user.dosen.id,
            };

            console.log(finalData);
            onSubmit(finalData, fileObj);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6">
                <h2 className="text-xl font-semibold mb-4">{initialData ? 'Edit Pendidikan' : 'Tambah Pendidikan'}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Kategori */}
                    <div>
                        <label htmlFor="kategori" className="block mb-1 font-medium">Kategori <span className="text-red-600">*</span></label>
                        <select
                            id="kategori"
                            name="kategori"
                            value={formData.kategori}
                            onChange={handleChange}
                            required
                            className="w-full border px-3 py-2 rounded"
                        >
                            <option value="">-- Pilih Kategori --</option>
                            <option value="Pendidikan Formal">Pendidikan Formal</option>
                            <option value="Diklat">Diklat</option>
                        </select>
                        {errors.kategori && <p className="text-red-500 text-sm">{errors.kategori}</p>}
                    </div>

                    {/* Kegiatan */}
                    <div>
                        <label htmlFor="kegiatan" className="block mb-1 font-medium">Kegiatan</label>
                        <input
                            id="kegiatan"
                            name="kegiatan"
                            type="text"
                            value={formData.kegiatan || ''}
                            onChange={handleChange}
                            className="w-full border px-3 py-2 rounded"
                        />
                    </div>

                    {/* ==== Pendidikan Formal ==== */}
                    {formData.kategori === 'Pendidikan Formal' && (
                        <>
                            <div>
                                <label htmlFor="jenjang" className="block mb-1 font-medium">Jenjang</label>
                                <select
                                    id="jenjang"
                                    name="jenjang"
                                    value={formData.jenjang || ''}
                                    onChange={handleChange}
                                    required
                                    className="w-full border px-3 py-2 rounded"
                                >
                                    <option value="">-- Pilih Jenjang --</option>
                                    <option value="Sarjana">Sarjana</option>
                                    <option value="Magister">Magister</option>
                                    <option value="Doktor">Doktor</option>
                                </select>
                                {errors.jenjang && <p className="text-red-500 text-sm">{errors.jenjang}</p>}
                            </div>
                            <div>
                                <label htmlFor="prodi" className="block mb-1 font-medium">Program Studi</label>
                                <input
                                    id="prodi"
                                    name="prodi"
                                    type="text"
                                    value={formData.prodi || ''}
                                    onChange={handleChange}
                                    className="w-full border px-3 py-2 rounded"
                                />
                                {errors.prodi && <p className="text-red-500 text-sm">{errors.prodi}</p>}
                            </div>
                            <div>
                                <label htmlFor="fakultas" className="block mb-1 font-medium">Fakultas</label>
                                <input
                                    id="fakultas"
                                    name="fakultas"
                                    type="text"
                                    value={formData.fakultas || ''}
                                    onChange={handleChange}
                                    className="w-full border px-3 py-2 rounded"
                                />
                                {errors.fakultas && <p className="text-red-500 text-sm">{errors.fakultas}</p>}
                            </div>
                            <div>
                                <label htmlFor="perguruanTinggi" className="block mb-1 font-medium">Perguruan Tinggi</label>
                                <input
                                    id="perguruanTinggi"
                                    name="perguruanTinggi"
                                    type="text"
                                    value={formData.perguruanTinggi || ''}
                                    onChange={handleChange}
                                    className="w-full border px-3 py-2 rounded"
                                />
                                {errors.perguruanTinggi && <p className="text-red-500 text-sm">{errors.perguruanTinggi}</p>}
                            </div>
                            <div>
                                <label htmlFor="lulusTahun" className="block mb-1 font-medium">Tahun Lulus</label>
                                <input
                                    id="lulusTahun"
                                    name="lulusTahun"
                                    type="number"
                                    value={formData.lulusTahun || ''}
                                    onChange={handleChange}
                                    className="w-full border px-3 py-2 rounded"
                                />
                                {errors.lulusTahun && <p className="text-red-500 text-sm">{errors.lulusTahun}</p>}
                            </div>
                        </>
                    )}

                    {/* ==== Diklat ==== */}
                    {formData.kategori === 'Diklat' && (
                        <>
                            <div>
                                <label htmlFor="jenisDiklat" className="block mb-1 font-medium">Jenis Diklat</label>
                                <input
                                    id="jenisDiklat"
                                    name="jenisDiklat"
                                    type="text"
                                    value={formData.jenisDiklat || ''}
                                    onChange={handleChange}
                                    className="w-full border px-3 py-2 rounded"
                                />
                                {errors.jenisDiklat && <p className="text-red-500 text-sm">{errors.jenisDiklat}</p>}
                            </div>
                            <div>
                                <label htmlFor="namaDiklat" className="block mb-1 font-medium">Nama Diklat</label>
                                <input
                                    id="namaDiklat"
                                    name="namaDiklat"
                                    type="text"
                                    value={formData.namaDiklat || ''}
                                    onChange={handleChange}
                                    className="w-full border px-3 py-2 rounded"
                                />
                                {errors.namaDiklat && <p className="text-red-500 text-sm">{errors.namaDiklat}</p>}
                            </div>
                            <div>
                                <label htmlFor="penyelenggara" className="block mb-1 font-medium">Penyelenggara</label>
                                <input
                                    id="penyelenggara"
                                    name="penyelenggara"
                                    type="text"
                                    value={formData.penyelenggara || ''}
                                    onChange={handleChange}
                                    className="w-full border px-3 py-2 rounded"
                                />
                                {errors.penyelenggara && <p className="text-red-500 text-sm">{errors.penyelenggara}</p>}
                            </div>
                            <div>
                                <label htmlFor="peran" className="block mb-1 font-medium">Peran</label>
                                <input
                                    id="peran"
                                    name="peran"
                                    type="text"
                                    value={formData.peran || ''}
                                    onChange={handleChange}
                                    className="w-full border px-3 py-2 rounded"
                                />
                                {errors.peran && <p className="text-red-500 text-sm">{errors.peran}</p>}
                            </div>
                            <div>
                                <label htmlFor="tingkatan" className="block mb-1 font-medium">Tingkatan</label>
                                <select
                                    id="tingkatan"
                                    name="tingkatan"
                                    value={formData.tingkatan || ''}
                                    onChange={handleChange}
                                    className="w-full border px-3 py-2 rounded"
                                >
                                    <option value="">-- Pilih Tingkatan --</option>
                                    <option value="LOKAL">Lokal</option>
                                    <option value="REGIONAL">Regional</option>
                                    <option value="NASIONAL">Nasional</option>
                                    <option value="INTERNASIONAL">Internasional</option>
                                </select>
                                {errors.tingkatan && <p className="text-red-500 text-sm">{errors.tingkatan}</p>}
                            </div>
                            <div>
                                <label htmlFor="noSertifikat" className="block mb-1 font-medium">No Sertifikat</label>
                                <input
                                    id="noSertifikat"
                                    name="noSertifikat"
                                    type="text"
                                    value={formData.noSertifikat || ''}
                                    onChange={handleChange}
                                    className="w-full border px-3 py-2 rounded"
                                />
                                {errors.noSertifikat && <p className="text-red-500 text-sm">{errors.noSertifikat}</p>}
                            </div>
                            <div>
                                <label htmlFor="tglSertifikat" className="block mb-1 font-medium">Tanggal Sertifikat</label>
                                <input
                                    id="tglSertifikat"
                                    name="tglSertifikat"
                                    type="date"
                                    value={formData.tglSertifikat || ''}
                                    onChange={handleChange}
                                    className="w-full border px-3 py-2 rounded"
                                />
                                {errors.tglSertifikat && <p className="text-red-500 text-sm">{errors.tglSertifikat}</p>}
                            </div>
                            <div>
                                <label htmlFor="tempat" className="block mb-1 font-medium">Tempat</label>
                                <input
                                    id="tempat"
                                    name="tempat"
                                    type="text"
                                    value={formData.tempat || ''}
                                    onChange={handleChange}
                                    className="w-full border px-3 py-2 rounded"
                                />
                                {errors.tempat && <p className="text-red-500 text-sm">{errors.tempat}</p>}
                            </div>
                            <div>
                                <label htmlFor="tanggalMulai" className="block mb-1 font-medium">Tanggal Mulai</label>
                                <input
                                    id="tanggalMulai"
                                    name="tanggalMulai"
                                    type="date"
                                    value={formData.tanggalMulai || ''}
                                    onChange={handleChange}
                                    className="w-full border px-3 py-2 rounded"
                                />
                                {errors.tanggalMulai && <p className="text-red-500 text-sm">{errors.tanggalMulai}</p>}
                            </div>
                            <div>
                                <label htmlFor="tanggalSelesai" className="block mb-1 font-medium">Tanggal Selesai</label>
                                <input
                                    id="tanggalSelesai"
                                    name="tanggalSelesai"
                                    type="date"
                                    value={formData.tanggalSelesai || ''}
                                    onChange={handleChange}
                                    className="w-full border px-3 py-2 rounded"
                                />
                                {errors.tanggalSelesai && <p className="text-red-500 text-sm">{errors.tanggalSelesai}</p>}
                            </div>
                            <div>
                                <label htmlFor="jumlahJam" className="block mb-1 font-medium">Jumlah Jam</label>
                                <input
                                    id="jumlahJam"
                                    name="jumlahJam"
                                    type="number"
                                    value={formData.jumlahJam || ''}
                                    onChange={handleChange}
                                    className="w-full border px-3 py-2 rounded"
                                />
                                {errors.jumlahJam && <p className="text-red-500 text-sm">{errors.jumlahJam}</p>}
                            </div>
                        </>
                    )}

                    {/* Upload File */}
                    <div>
                        <label htmlFor="file" className="block mb-1 font-medium">File Bukti <span className="text-red-600">*</span></label>
                        <input
                            id="file"
                            name="file"
                            type="file"
                            onChange={handleFileChange}
                            accept=".pdf"
                            className="w-full border px-3 py-2 rounded"
                        />
                        {errors.file && <p className="text-red-500 text-sm">{errors.file}</p>}
                    </div>

                    {/* Tombol Aksi */}
                    <div className="flex justify-end gap-2 mt-6">
                        <Button variant="secondary" size="normal" onClick={onClose} type="button">
                            Batal
                        </Button>
                        <Button variant="primary" size="normal" type="submit" disabled={isLoading}>
                            {isLoading ? 'Menyimpan...' : initialData ? 'Update' : 'Simpan'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PendidikanFormModal;
