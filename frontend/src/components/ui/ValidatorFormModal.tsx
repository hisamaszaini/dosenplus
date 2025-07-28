import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';

import {
  createValidatorUserSchema,
  updateValidatorProfileSchema,
  type CreateValidatorUserDto,
  type UpdateValidatorProfileDto,
} from '../../../../backend/src/users/dto/user.dto';

import * as userService from '../../services/user.service';
import Button from './Button';
import FormField from './FormField';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  userId: number | null;
}

type Mode = 'create' | 'edit';

export const ValidatorFormModal = ({ isOpen, onClose, onSuccess, userId }: Props) => {
  const mode: Mode = userId ? 'edit' : 'create';
  const [apiError, setApiError] = useState('');

  const form = useForm<CreateValidatorUserDto | UpdateValidatorProfileDto>({
    resolver: zodResolver(mode === 'edit' ? updateValidatorProfileSchema : createValidatorUserSchema),
    defaultValues: {
      dataUser: {
        email: '',
        username: '',
        name: '',
        status: 'ACTIVE',
        password: '',
        confirmPassword: '',
      },
      biodata: {
        nama: '',
        nip: '',
        jenis_kelamin: 'Laki-laki',
        no_hp: '',
      },
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
    watch,
  } = form;

  // Watch nama untuk sync ke dataUser.name
  const watchedNama = watch('biodata.nama');

  useEffect(() => {
    if (watchedNama) {
      form.setValue('dataUser.name', watchedNama);
    }
  }, [watchedNama, form]);

  useEffect(() => {
    if (!isOpen) return;

    if (mode === 'edit' && userId) {
      userService
        .getUserById(userId)
        .then((data) => {
          reset({
            dataUser: {
              email: data.email || '',
              username: data.username || '',
              name: data.name || '',
              status: data.status || 'ACTIVE',
              password: '',
              confirmPassword: '',
            },
            biodata: {
              nama: data.validator?.nama || '',
              nip: data.validator?.nip || '',
              jenis_kelamin: data.validator?.jenis_kelamin || 'Laki-laki',
              no_hp: data.validator?.no_hp || '',
            },
          });
        })
        .catch((err) => {
          console.error('Gagal memuat data validator:', err);
          toast.error('Gagal memuat data validator.');
          onClose();
        });
    } else {
      reset({
        dataUser: {
          email: '',
          username: '',
          name: '',
          password: '',
          confirmPassword: '',
          status: 'ACTIVE',
        },
        biodata: {
          nama: '',
          nip: '',
          jenis_kelamin: 'Laki-laki',
          no_hp: '',
        },
      });
    }
  }, [isOpen, mode, userId, reset, onClose]);

  const onSubmit = async (formData: CreateValidatorUserDto | UpdateValidatorProfileDto) => {
    setApiError('');
    try {
      if (mode === 'edit' && userId) {
        await userService.updateValidatorProfile(userId, formData);
        toast.success('Data validator berhasil diperbarui');
      } else {
        await userService.createValidatorUser(formData);
        toast.success('Validator baru berhasil ditambahkan');
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error(err);
      setApiError(err?.response?.data?.message || 'Gagal menyimpan data.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[100vh] flex flex-col">
        {/* Header */}
        <div className="py-5 px-6 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-700">
            {mode === 'edit' ? 'Edit Data Validator' : 'Tambah Validator Baru'}
          </h3>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4 overflow-y-auto">
          <FormField
            label="Nama Lengkap"
            error={errors.biodata?.nama?.message}
          >
            <input
              {...register('biodata.nama')}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-indigo-500 outline-none transition-colors"
            />
          </FormField>

          <FormField
            label="NIP"
            error={errors.biodata?.nip?.message}
            description="Nomor Induk Pegawai (NIP) validator"
          >
            <input
              {...register('biodata.nip')}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-indigo-500 outline-none transition-colors"
              placeholder="Contoh: 197003171992031001"
            />
          </FormField>

          <FormField
            label="Jenis Kelamin"
            error={errors.biodata?.jenis_kelamin?.message}
          >
            <select
              {...register('biodata.jenis_kelamin')}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-indigo-500 outline-none transition-colors"
            >
              <option value="Laki-laki">Laki-laki</option>
              <option value="Perempuan">Perempuan</option>
            </select>
          </FormField>

          <FormField
            label="No HP"
            error={errors.biodata?.no_hp?.message}
            description="Nomor WhatsApp aktif"
          >
            <input
              {...register('biodata.no_hp')}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-indigo-500 outline-none transition-colors"
              placeholder="Contoh: 08123456789"
            />
          </FormField>

          <FormField
            label="Email"
            error={errors.dataUser?.email?.message}
          >
            <input
              type="email"
              {...register('dataUser.email')}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-indigo-500 outline-none transition-colors"
              placeholder="contoh@email.com"
            />
          </FormField>

          <FormField
            label="Username"
            error={errors.dataUser?.username?.message}
            description="Untuk login ke sistem"
          >
            <input
              {...register('dataUser.username')}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-indigo-500 outline-none transition-colors"
              placeholder="Gunakan huruf kecil tanpa spasi"
            />
          </FormField>

          {mode === 'edit' && (
            <FormField
              label="Status Pengguna"
              error={errors.dataUser?.status?.message}
            >
              <select
                {...register('dataUser.status')}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-indigo-500 outline-none transition-colors"
              >
                <option value="ACTIVE">Aktif</option>
                <option value="INACTIVE">Tidak Aktif</option>
              </select>
            </FormField>
          )}

          <FormField
            label={mode === 'edit' ? 'Ganti Password (opsional)' : 'Password'}
            error={errors.dataUser?.password?.message}
            description={mode === 'edit' ? 'Kosongkan jika tidak ingin mengubah' : 'Minimal 8 karakter'}
          >
            <input
              type="password"
              {...register('dataUser.password')}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-indigo-500 outline-none transition-colors"
            />
          </FormField>

          <FormField
            label="Konfirmasi Password"
            error={errors.dataUser?.confirmPassword?.message}
          >
            <input
              type="password"
              {...register('dataUser.confirmPassword')}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-indigo-500 outline-none transition-colors"
            />
          </FormField>

          {apiError && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3">
              <p className="text-red-600 text-sm text-center">{apiError}</p>
            </div>
          )}

          <div className="flex justify-end gap-3 border-t border-gray-200 p-6">
            <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>
              Batal
            </Button>
            <Button type="submit" variant="primary" size="normal" icon="fas fa-save" disabled={isSubmitting}>
              {isSubmitting ? 'Menyimpan...' : 'Simpan'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};