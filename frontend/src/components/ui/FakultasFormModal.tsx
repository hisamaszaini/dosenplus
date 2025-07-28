import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import type { Fakultas } from '../../../../backend/src/fakultas/dto/fakultas.dto';
import { createFakultasSchema, type CreateFakultasDto } from '../../../../backend/src/fakultas/dto/fakultas.dto';
import { createFakultas, updateFakultas } from '../../services/fakultas.service';

import Button from './Button';

interface FakultasFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: Fakultas | null;
}

const FormField = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="flex flex-col md:flex-row md:items-center">
    <label className="w-full md:w-1/4 text-sm font-medium text-gray-600 mb-2 md:mb-0">{label}</label>
    <div className="w-full md:flex-1">{children}</div>
  </div>
);

const FakultasFormModal = ({ isOpen, onClose, onSuccess, initialData }: FakultasFormModalProps) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateFakultasDto>({
    resolver: zodResolver(createFakultasSchema),
    defaultValues: {
      kode: '',
      nama: '',
    },
  });

  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      reset({ kode: initialData.kode, nama: initialData.nama });
    } else {
      reset({ kode: '', nama: '' });
    }
  }, [initialData, reset]);

  const onSubmit = async (data: CreateFakultasDto) => {
    setApiError(null);
    try {
      if (initialData) {
        await updateFakultas(initialData.id, data);
      } else {
        await createFakultas(data);
      }
      onSuccess();
    } catch (err: any) {
      setApiError(err.response?.data?.message || 'Terjadi kesalahan');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl transform transition-all">
        <div className="py-5 px-6 border-b border-gray-200 mb-4">
          <h3 className="text-xl font-semibold text-gray-700">
            {initialData ? 'Edit Fakultas' : 'Tambah Fakultas Baru'}
          </h3>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <FormField label="Kode Fakultas">
            <input
              type="text"
              {...register('kode')}
              className="w-full md:flex-1 px-4 py-3 rounded-xl bg-white/80 border border-gray-300 focus:border-accent focus:ring-2 focus:ring-accent/30 hover:border-accent outline-none transition-all duration-300 text-gray-700 placeholder-gray-400 shadow-sm"
              placeholder="Contoh: FT"
            />
            {errors.kode && <p className="text-red-500 text-sm mt-1">{errors.kode.message}</p>}
          </FormField>

          <FormField label="Nama Fakultas">
            <input
              type="text"
              {...register('nama')}
              className="w-full md:flex-1 px-4 py-3 rounded-xl bg-white/80 border border-gray-300 focus:border-accent focus:ring-2 focus:ring-accent/30 hover:border-accent outline-none transition-all duration-300 text-gray-700 placeholder-gray-400 shadow-sm"
              placeholder="Contoh: Fakultas Teknik"
            />
            {errors.nama && <p className="text-red-500 text-sm mt-1">{errors.nama.message}</p>}
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

export default FakultasFormModal;