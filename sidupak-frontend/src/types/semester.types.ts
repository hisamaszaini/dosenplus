export const NAMA_SEMESTER = {
  GANJIL: 'GANJIL',
  GENAP: 'GENAP',
} as const;
export type NamaSemester = typeof NAMA_SEMESTER[keyof typeof NAMA_SEMESTER];

export interface Semester {
  id: number;
  tipe: NamaSemester;
  tahunMulai: number;
  tahunSelesai: number;
  status: boolean;
}

export type CreateSemesterDto = Omit<Semester, 'id'>;
export type UpdateSemesterDto = Partial<CreateSemesterDto>;