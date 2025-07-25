import type { PelaksanaanKategori, JabatanFungsional, PelaksanaanPendidikanParams, FormFieldOption } from "../types/pelaksanaan-pendidikan.types";
// import { KategoriKegiatanEnum, JabatanFungsionalEnum } from  '../../../sidupak-backend/src/pelaksanaan-pendidikan/dto/create-pelaksanaan-pendidikan.dto';

export const getDefaultOption = (label: string, value: string = ''): FormFieldOption => ({
    label,
    value,
});

export const kategoriMap = {
    PERKULIAHAN: {
        label: 'Melaksanakan Perkuliahan',
        columns: ['mataKuliah', 'sks', 'jumlahKelas', 'totalSks', 'prodi', 'fakultas', 'semester', 'nilaiPak'],
        formFields: [
            {
                name: 'semesterId',
                label: 'Semester',
                type: 'select',
                options: [],
            },
            {
                name: 'prodiId',
                label: 'Prodi',
                type: 'select',
                options: [],
            },
            {
                name: 'fakultasId',
                label: 'Fakultas',
                type: 'select',
                options: [],
            },
            { name: 'mataKuliah', label: 'Mata Kuliah', type: 'text' },
            { name: 'sks', label: 'SKS', type: 'number' },
            { name: 'jumlahKelas', label: 'Jumlah Kelas', type: 'number' },
            { name: 'file', label: 'File', type: 'file' },
        ],
        hitungNilaiPak: ({ jabatanFungsional, sks, jumlahKelas }: PelaksanaanPendidikanParams) => {
            const total = (sks ?? 0) * (jumlahKelas ?? 0);
            const awal = Math.min(10, total);
            const sisa = Math.max(0, total - 10);
            if (jabatanFungsional === 'ASISTEN_AHLI') return awal * 0.5 + sisa * 0.25;
            return awal * 1 + sisa * 0.5;
        },
    },
    BIMBINGAN_SEMINAR: {
        label: 'Membimbing Seminar Mahasiswa',
        columns: ['namaKegiatan', 'semester', 'jumlahMahasiswa', 'nilaiPak'],
        formFields: [
            {
                name: 'semesterId',
                label: 'Semester',
                type: 'select',
                options: [],
            }, {
                name: 'prodiId',
                label: 'Prodi',
                type: 'select',
                options: [],
            },
            {
                name: 'fakultasId',
                label: 'Fakultas',
                type: 'select',
                options: [],
            },
            { name: 'jumlah', label: 'Jumlah Mahasiswa', type: 'number' },
            { name: 'file', label: 'File', type: 'file' },
        ],
        hitungNilaiPak: ({ jumlahMahasiswa }: PelaksanaanPendidikanParams) => (jumlahMahasiswa ?? 0) * 1,
    },
    BIMBINGAN_KKN: {
        label: 'Membimbing KKN, PKN, PKL',
        columns: ['namaKegiatan', 'semester', 'jumlahMahasiswa', 'nilaiPak'],
        formFields: ['semesterId', 'jenisKegiatan', 'prodiId', 'fakultasId', 'jumlahMahasiswa', 'file'],
        hitungNilaiPak: ({ jumlahMahasiswa }: PelaksanaanPendidikanParams) => (jumlahMahasiswa ?? 0) * 1,
    },
    BIMBINGAN_TUGAS_AKHIR: {
        label: 'Membimbing Tugas Akhir',
        columns: ['jenisTugasAkhir', 'semester', 'sebagai', 'jumlahMahasiswa', 'nilaiPak'],
        formFields: ['semesterId', 'jenisTugasAkhir', 'sebagai', 'jumlahMahasiswa', 'file'],
        hitungNilaiPak: ({ sebagai, jumlahMahasiswa }: PelaksanaanPendidikanParams) => {
            return (jumlahMahasiswa ?? 0) * (sebagai === 'PEMBIMBING_UTAMA' ? 1 : 0.5);
        },
    },
    PENGUJI_UJIAN_AKHIR: {
        label: 'Penguji Ujian Akhir',
        columns: ['semester', 'sebagai', 'jumlahMahasiswa', 'nilaiPak'],
        formFields: ['semesterId', 'sebagai', 'jumlahMahasiswa', 'file'],
        hitungNilaiPak: ({ sebagai, jumlahMahasiswa }: PelaksanaanPendidikanParams) => (jumlahMahasiswa ?? 0) * (sebagai === 'KETUA' ? 1 : 0.5),
    },
    PEMBINA_KEGIATAN_MHS: {
        label: 'Membina Kegiatan Mahasiswa',
        columns: ['namaKegiatan', 'semester', 'jumlahMahasiswa', 'nilaiPak'],
        formFields: ['semesterId', 'namaKegiatan', 'luaran', 'jumlahMahasiswa', 'file'],
        hitungNilaiPak: () => 2,
    },
    PENGEMBANGAN_PROGRAM: {
        label: 'Mengembangkan Program Kuliah',
        columns: ['namaKegiatan', 'semester', 'namaProgram', 'nilaiPak'],
        formFields: ['semesterId', 'namaProgram', 'mataKuliah', 'prodiId', 'fakultasId', 'file'],
        hitungNilaiPak: () => 2,
    },
    BAHAN_PENGAJARAN: {
        label: 'Mengembangkan Bahan Pengajaran',
        columns: ['jenisProduk', 'judul', 'semester', 'jumlahHalaman', 'nilaiPak'],
        formFields: ['semesterId', 'jenisProduk', 'judul', 'jumlahHalaman', 'isbn', 'prodiId', 'fakultasId', 'mataKuliah', 'file'],
        hitungNilaiPak: ({ jenisProduk }: PelaksanaanPendidikanParams) => jenisProduk === 'Buku Ajar' ? 20 : 5,
    },
    ORASI_ILMIAH: {
        label: 'Menyampaikan Orasi Ilmiah',
        columns: ['judul', 'semester', 'tingkat', 'penyelenggara', 'nilaiPak'],
        formFields: ['semesterId', 'judul', 'namaPertemuan', 'tingkat', 'penyelenggara', 'tanggal', 'file'],
        hitungNilaiPak: () => 5,
    },
    JABATAN_STRUKTURAL: {
        label: 'Menduduki Jabatan Struktural',
        columns: ['namaJabatan', 'semester', 'prodi', 'fakultas', 'nilaiPak'],
        formFields: ['semesterId', 'namaJabatan', 'prodiId', 'fakultasId', 'perguruanTinggi', 'file'],
        hitungNilaiPak: ({ namaJabatan }: { namaJabatan: JabatanFungsional }) => {
            const map: Record<JabatanFungsional, number> = {
                REKTOR: 6,
                WAKIL_REKTOR: 5,
                KETUA_SEKOLAH: 4,
                WAKIL_KETUA: 4,
                DIREKTUR: 4,
                WAKIL_DIREKTUR: 3,
                SEKRETARIS_JURUSAN: 3,
            };
            return map[namaJabatan];
        },
    },
    BIMBING_DOSEN: {
        label: 'Membimbing Dosen',
        columns: ['jenisBimbingan', 'semester', 'jumlahDosen', 'nilaiPak'],
        formFields: ['semesterId', 'tglMulai', 'tglSelesai', 'jenisBimbingan', 'jabatanFungsional', 'dosenPembimbing', 'bidangAhli', 'deskripsi', 'prodiId', 'file'],
        hitungNilaiPak: ({ jenisBimbingan }: PelaksanaanPendidikanParams) => jenisBimbingan === 'PENCANGKOKAN' ? 2 : 1,
    },
    DATA_SERING: {
        label: 'Melaksanakan Datasering & Pencangkokan',
        columns: ['jenisKegiatan', 'semester', 'perguruanTinggi', 'jumlah', 'nilaiPak'],
        formFields: ['semesterId', 'jenisKegiatan', 'perguruanTinggi', 'tglMulai', 'tglSelesai', 'bidangKeahlian', 'file'],
        hitungNilaiPak: ({ jenisKegiatan }: PelaksanaanPendidikanParams) => jenisKegiatan === 'DATASERING' ? 5 : 4,
    },
    PENGEMBANGAN_DIRI: {
        label: 'Melaksanakan Pengembangan Diri',
        columns: ['namaKegiatan', 'semester', 'lamaJam', 'nilaiPak'],
        formFields: ['semesterId', 'namaKegiatan', 'detailKegiatan', 'tglMulai', 'tglSelesai', 'penyelenggara', 'tempat', 'lamaJam', 'prodiId', 'fakultasId', 'file'],
        hitungNilaiPak: ({ lamaJam }: PelaksanaanPendidikanParams) => {
            if ((lamaJam ?? 0) > 960) return 15;
            if ((lamaJam ?? 0) >= 641) return 9;
            if ((lamaJam ?? 0) >= 481) return 6;
            if ((lamaJam ?? 0) >= 161) return 3;
            if ((lamaJam ?? 0) >= 81) return 2;
            if ((lamaJam ?? 0) >= 30) return 1;
            if ((lamaJam ?? 0) >= 10) return 0.5;
            return 0;
        },
    },
};
