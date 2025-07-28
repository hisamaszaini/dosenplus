import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';

import {
  createAdminUserSchema,
  updateAdminProfileSchema,
  type CreateAdminUserDto,
  type UpdateAdminProfileDto,
  type User,
} from '../../../../backend/src/users/dto/user.dto';

import * as userService from '../../services/user.service';
import Button from './Button';
import FormField from './FormField';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  userId: number | null;
};

type Mode = 'create' | 'edit';

export const AdminFormModal = ({ isOpen, onClose, onSuccess, userId }: Props) => {
  const mode: Mode = userId ? 'edit' : 'create';
  const [apiError, setApiError] = useState('');
  const [userData, setUserData] = useState<User | null>(null);

  const form = useForm<CreateAdminUserDto | UpdateAdminProfileDto>({
    resolver: zodResolver(mode === 'edit' ? updateAdminProfileSchema : createAdminUserSchema),
    defaultValues: {
      dataUser: {
        name: '',
        username: '',
        email: '',
        status: 'ACTIVE',
        password: '',
        confirmPassword: '',
      }
    }
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = form;

  // Helper function untuk register field dengan struktur yang konsisten
  const registerField = (name: keyof CreateAdminUserDto['dataUser']) => {
    return register(`dataUser.${name}` as const);
  };

  useEffect(() => {
    if (!isOpen) return;

    if (mode === 'edit' && userId) {
      userService
        .getUserById(userId)
        .then((data) => {
          setUserData(data);
          reset({
            dataUser: {
              name: data.name || '',
              username: data.username || '',
              email: data.email || '',
              status: data.status || 'ACTIVE',
              password: '',
              confirmPassword: '',
            },
          });
        })
        .catch((err) => {
          console.error('Gagal memuat data admin:', err);
          toast.error('Gagal memuat data admin. Silakan coba lagi.');
          onClose();
        });
    } else {
      reset({
        dataUser: {
          name: '',
          username: '',
          email: '',
          password: '',
          confirmPassword: '',
          status: 'ACTIVE',
        }
      });
    }
  }, [isOpen, mode, userId, reset, onClose]);

  const onSubmit = async (data: CreateAdminUserDto | UpdateAdminProfileDto) => {
    setApiError('');
    try {
      if (mode === 'edit' && userId) {
        await userService.updateAdminProfile(userId, data as UpdateAdminProfileDto);
        toast.success('Admin berhasil diperbarui');
      } else {
        await userService.createAdminUser(data as CreateAdminUserDto);
        toast.success('Admin baru berhasil ditambahkan');
      }
      onSuccess();
      onClose();
    } catch (err: unknown) {
      console.error(err);
      let message = 'Terjadi kesalahan saat menyimpan.';
      if (typeof err === 'object' && err !== null && 'response' in err) {
        const response = (err as any).response;
        if (response?.data?.message) {
          message = response.data.message;
        }
      }
      setApiError(message);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[100vh] flex flex-col">
        {/* Header */}
        <div className="py-5 px-6 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-700">
            {mode === 'edit' ? 'Edit Data Admin' : 'Tambah Admin Baru'}
          </h3>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4 overflow-y-auto">
          <FormField label="Nama Lengkap" error={errors.dataUser?.name?.message}>
            <input 
              {...registerField('name')} 
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-indigo-500 outline-none transition-colors" 
            />
          </FormField>

          <FormField label="Username" error={errors.dataUser?.username?.message}>
            <input
              {...registerField('username')}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-indigo-500 outline-none transition-colors"
            />
          </FormField>

          <FormField label="Email" error={errors.dataUser?.email?.message}>
            <input
              type="email"
              {...registerField('email')}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-indigo-500 outline-none transition-colors"
            />
          </FormField>

          <FormField
            label={mode === 'edit' ? 'Ganti Password (Opsional)' : 'Password'}
            error={errors.dataUser?.password?.message}
          >
            <input 
              type="password" 
              {...registerField('password')} 
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-indigo-500 outline-none transition-colors" 
            />
          </FormField>

          <FormField
            label="Konfirmasi Password"
            error={errors.dataUser?.confirmPassword?.message}
          >
            <input
              type="password"
              {...registerField('confirmPassword')}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-indigo-500 outline-none transition-colors"
            />
          </FormField>

          {mode === 'edit' && (
            <FormField label="Status Pengguna" error={errors.dataUser?.status?.message}>
              <select 
                {...registerField('status')} 
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-indigo-500 outline-none transition-colors"
              >
                <option value="ACTIVE">Aktif</option>
                <option value="INACTIVE">Tidak Aktif</option>
              </select>
            </FormField>
          )}

          {apiError && <p className="text-red-600 text-sm text-center pt-2">{apiError}</p>}

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