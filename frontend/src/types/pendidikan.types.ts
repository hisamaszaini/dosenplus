export interface Pendidikan {
  id: number;
  kategori: 'Pendidikan Formal' | 'Diklat';
  kegiatan?: string;
  file: string;
  jenjang?: string;
  prodi?: string;
  fakultas?: string;
  perguruanTinggi?: string;
  lulusTahun?: number;
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
  nilaiPak: number;
  dosen: { id: number; nama: string };
  createdAt: string;
}