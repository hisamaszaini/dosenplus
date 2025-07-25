import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { Semester } from '../../types/semester.types';
import { createSemesterSchema, type CreateSemesterDto } from '../../../../sidupak-backend/src/semester/dto/semester.dto';
import { createSemester, updateSemester } from '../../services/semester.service';
import Button from './Button';

interface SemesterFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: Semester | null;
}

const FormField = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="flex flex-col md:flex-row md:items-center">
    <label className="w-full md:w-1/4 text-sm font-medium text-gray-600 mb-2 md:mb-0">{label}</label>
    <div className="w-full md:flex-1">{children}</div>
  </div>
);

const SemesterFormModal = ({ isOpen, onClose, onSuccess, initialData }: SemesterFormModalProps) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    watch,
  } = useForm<CreateSemesterDto>({
    resolver: zodResolver(createSemesterSchema),
    defaultValues: {
      status: true,
    },
  });

  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      const { tipe, tahunMulai, tahunSelesai, status } = initialData;
      reset({ tipe, tahunMulai, tahunSelesai, status });
    } else {
      reset({
        tipe: 'GANJIL',
        tahunMulai: undefined,
        tahunSelesai: undefined,
        status: true
      });
    }
  }, [initialData, reset]);

  const onSubmit = async (data: CreateSemesterDto) => {
    setApiError(null);
    try {
      if (initialData) {
        await updateSemester(initialData.id, data);
      } else {
        await createSemester(data);
      }
      onSuccess();
      // onClose();
    } catch (err: any) {
      setApiError(err.response?.data?.message || 'Terjadi kesalahan');
    }
  };

  if (!isOpen) return null;

  const tipe = watch('tipe');
  const tahunMulai = watch('tahunMulai');
  const tahunSelesai = watch('tahunSelesai');
  const previewNama =
    tipe && tahunMulai && tahunSelesai
      ? `${tipe === 'GENAP' ? 'Genap' : 'Ganjil'} ${tahunMulai}/${tahunSelesai}`
      : null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl transform transition-all">
        <div className="py-5 px-6 border-b border-gray-200 mb-4">
          <h3 className="text-xl font-semibold text-gray-700">
            {initialData ? 'Edit Semester' : 'Tambah Semester Baru'}
          </h3>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <FormField label="Tipe">
            <select {...register('tipe')} className="w-full md:flex-1 px-4 py-3 rounded-xl bg-white/80 border border-gray-300 focus:border-accent focus:ring-2 focus:ring-accent/30 hover:border-accent outline-none transition-all duration-300 text-gray-700 placeholder-gray-400 shadow-sm">
              <option value="GANJIL">Ganjil</option>
              <option value="GENAP">Genap</option>
            </select>
            {errors.tipe && <p className="text-red-500 text-sm">{errors.tipe.message}</p>}
          </FormField>

          <FormField label="Tahun Ajaran">
            <div className="flex items-center gap-2">
              <input
                type="number"
                {...register('tahunMulai', { valueAsNumber: true })}
                placeholder="Tahun Mulai"
                className="w-full md:flex-1 px-4 py-3 rounded-xl bg-white/80 border border-gray-300 focus:border-accent focus:ring-2 focus:ring-accent/30 hover:border-accent outline-none transition-all duration-300 text-gray-700 placeholder-gray-400 shadow-sm"
              />
              <span>/</span>
              <input
                type="number"
                {...register('tahunSelesai', { valueAsNumber: true })}
                placeholder="Tahun Selesai"
                className="w-full md:flex-1 px-4 py-3 rounded-xl bg-white/80 border border-gray-300 focus:border-accent focus:ring-2 focus:ring-accent/30 hover:border-accent outline-none transition-all duration-300 text-gray-700 placeholder-gray-400 shadow-sm"
              />
            </div>
            {(errors.tahunMulai || errors.tahunSelesai) && (
              <p className="text-red-500 text-sm">
                {errors.tahunMulai?.message || errors.tahunSelesai?.message}
              </p>
            )}
            {previewNama && (
              <div className="mt-2 text-sm text-gray-500 italic">
                Akan disimpan sebagai: <strong>{previewNama}</strong>
              </div>
            )}
          </FormField>

          <FormField label="Status">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                {...register('status')}
                className="rounded border-gray-300 text-primary focus:ring-primary"
              />
              <span className="ml-2 text-sm text-gray-600">Aktif</span>
            </label>
          </FormField>

          {apiError && <p className="text-red-500 text-sm text-center">{apiError}</p>}

          <div className="pt-6 flex justify-end gap-3">
            <Button type="button" variant="secondary" size="normal" onClick={onClose}>
              Batal
            </Button>
            <Button type="submit" variant="primary" size="normal" icon="fas fa-save">
              Simpan
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SemesterFormModal;
