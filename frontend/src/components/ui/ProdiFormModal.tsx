import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import {
  type Prodi,
  createProdiSchema,
  type CreateProdiDto,
} from '../../../../backend/src/prodi/dto/prodi.dto';
import { type Fakultas } from '../../../../backend/src/fakultas/dto/fakultas.dto';
import { createProdi, updateProdi } from '../../services/prodi.service';

import Button from './Button';

interface ProdiFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: Prodi | null;
  fakultas: Fakultas[];
}

const FormField = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="flex flex-col md:flex-row md:items-center">
    <label className="w-full md:w-1/4 text-sm font-medium text-gray-600 mb-2 md:mb-0">{label}</label>
    <div className="w-full md:flex-1">{children}</div>
  </div>
);

const ProdiFormModal = ({ isOpen, onClose, onSuccess, initialData, fakultas }: ProdiFormModalProps) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateProdiDto>({
    resolver: zodResolver(createProdiSchema),
    defaultValues: {
      kode: '',
      nama: '',
      fakultasId: undefined,
    },
  });

  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      reset({
        kode: initialData?.kode ?? '',
        nama: initialData?.nama ?? '',
        fakultasId: initialData?.fakultasId ?? undefined,
      });
      setApiError(null);
    }
  }, [isOpen, initialData, reset]);

  const onSubmit = async (data: CreateProdiDto) => {
    setApiError(null);
    try {
      if (initialData) {
        await updateProdi(initialData.id, data);
      } else {
        await createProdi(data);
      }
      onSuccess();
    } catch (err: any) {
      setApiError(err.response?.data?.message || 'Terjadi kesalahan saat menyimpan data.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl transform transition-all">
        <div className="py-5 px-6 border-b border-gray-200 mb-4">
          <h3 className="text-xl font-semibold text-gray-700">
            {initialData ? 'Edit Prodi' : 'Tambah Prodi Baru'}
          </h3>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <FormField label="Kode Prodi">
            <input
              type="text"
              {...register('kode')}
              className="w-full px-4 py-3 rounded-xl border bg-white/80 border-gray-300 focus:border-accent focus:ring-2 focus:ring-accent/30 outline-none transition-all duration-300 text-gray-700 shadow-sm"
              placeholder="Contoh: TI"
            />
            {errors.kode && <p className="text-red-500 text-sm mt-1">{errors.kode.message}</p>}
          </FormField>

          <FormField label="Nama Prodi">
            <input
              type="text"
              {...register('nama')}
              className="w-full px-4 py-3 rounded-xl border bg-white/80 border-gray-300 focus:border-accent focus:ring-2 focus:ring-accent/30 outline-none transition-all duration-300 text-gray-700 shadow-sm"
              placeholder="Contoh: Teknik Informatika"
            />
            {errors.nama && <p className="text-red-500 text-sm mt-1">{errors.nama.message}</p>}
          </FormField>

          <FormField label="Fakultas">
            <select
              {...register('fakultasId', { valueAsNumber: true })}
              className="w-full px-4 py-3 rounded-xl border bg-white/80 border-gray-300 focus:border-accent focus:ring-2 focus:ring-accent/30 outline-none transition-all duration-300 text-gray-700 shadow-sm"
              disabled={fakultas.length === 0}
            >
              <option value="">-- Pilih Fakultas --</option>
              {fakultas.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.nama}
                </option>
              ))}
            </select>
            {errors.fakultasId && (
              <p className="text-red-500 text-sm mt-1">{errors.fakultasId.message}</p>
            )}
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

export default ProdiFormModal;
