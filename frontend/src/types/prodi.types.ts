export interface responseSemester {
  id: number;
  kode: number;
  nama: string;
  tipe: string;
  tahunMulai: number;
  tahunSelesai: number;
  status: boolean;
  createdAt: string;
  updateAt: string;
}

export interface responseFakultas {
  id: number;
  kode: string;
  nama: string;
  createdAt: string;
  updateAt: string;
}

export interface responseProdi {
  id: number;
  kode: string;
  nama: string;
  fakultasId: number;
  createdAt: string;
  updateAt: string;
  fakultas: responseFakultas;
}