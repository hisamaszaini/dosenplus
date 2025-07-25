export const PelaksanaanKategori = {
  PERKULIAHAN: 'PERKULIAHAN',
  BIMBINGAN_SEMINAR: 'BIMBINGAN_SEMINAR',
  BIMBINGAN_KKN: 'BIMBINGAN_KKN',
  BIMBINGAN_TUGAS_AKHIR: 'BIMBINGAN_TUGAS_AKHIR',
  PENGUJI_UJIAN_AKHIR: 'PENGUJI',
  PEMBINA_KEGIATAN_MHS: 'PEMBINA_MAHASISWA',
  PENGEMBANGAN_PROGRAM: 'PENGEMBANGAN_PROGRAM_KULIAH',
  BAHAN_PENGAJARAN: 'BAHAN_AJAR',
  ORASI_ILMIAH: 'ORASI_ILMIAH',
  JABATAN_STRUKTURAL: 'JABATAN_STRUKTURAL',
  BIMBING_DOSEN: 'BIMBING_DOSEN',
  DATA_SERING: 'DATA_SERING',
  PENGEMBANGAN_DIRI: 'PENGEMBANGAN_DIRI',
} as const

export type PelaksanaanKategori = keyof typeof PelaksanaanKategori

export const PangkatGolongan = {
  ASISTEN_AHLI: 'ASISTEN_AHLI',
  LEKTOR: 'LEKTOR',
  LEKTOR_KEPALA: 'LEKTOR_KEPALA',
  GURU_BESAR: 'GURU_BESAR',
} as const

export type Golongan = keyof typeof PangkatGolongan

export const JabatanFungsional = {
  REKTOR: 'REKTOR',
  WAKIL_REKTOR: 'WAKIL_REKTOR',
  KETUA_SEKOLAH: 'KETUA_SEKOLAH',
  WAKIL_KETUA: 'WAKIL_KETUA',
  DIREKTUR: 'DIREKTUR',
  WAKIL_DIREKTUR: 'WAKIL_DIREKTUR',
  SEKRETARIS_JURUSAN: 'SEKRETARIS_JURUSAN'
} as const

export type JabatanFungsional = keyof typeof JabatanFungsional

export type KategoriKegiatan =
  | 'PERKULIAHAN'
  | 'BIMBINGAN_SEMINAR'
  | 'BIMBINGAN_KKN'
  | 'BIMBINGAN_TUGAS_AKHIR'
  | 'PENGUJI'
  | 'PEMBINA_MAHASISWA'
  | 'PENGEMBANGAN_PROGRAM_KULIAH'
  | 'BAHAN_AJAR'
  | 'ORASI_ILMIAH'
  | 'JABATAN_STRUKTURAL'
  | 'BIMBING_DOSEN'
  | 'DATA_SERING'
  | 'PENGEMBANGAN_DIRI'

export type FormFieldType =
  | 'text'
  | 'number'
  | 'select'
  | 'textarea'
  | 'date'
  | 'file'
  | 'enum'

export interface FormFieldOption {
  label: string
  value: string | number
}

export interface FormFieldConfig {
  name: string
  label: string
  type: FormFieldType
  options?: FormFieldOption[] // For select/enum
  required?: boolean
  helperText?: string
  placeholder?: string
}

export interface TableColumnConfig {
  key: string
  label: string
  accessor?: string // fallback accessor if different
  isNumeric?: boolean
  isHidden?: boolean
}

export interface KategoriKonfigurasi {
  label: string
  formFields: FormFieldConfig[]
  tableColumns: TableColumnConfig[]
  hitungNilaiPak?: (formData: any) => number
}

export interface PelaksanaanPendidikanParams {
    jabatanFungsional?: string;
    sks?: number;
    jumlahKelas?: number;
    jumlahMahasiswa?: number;
    jenisProduk?: string;
    jenisBimbingan?: string;
    jenisKegiatan?: string;
    sebagai?: string;
    lamaJam?: number;
}