import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';

import Button from '../../components/ui/Button';
import FormField from '../../components/ui/FormField';
import { updateMyAdminProfile, changeMyPassword } from '../../services/user.service';
import { useAuth } from '../../contexts/AuthContext';
import { changePasswordSchema, updateAdminProfileSchema, type ChangePasswordDto, type UpdateAdminProfileDto } from '../../../../backend/src/users/dto/user.dto';

const AdminProfilePage = () => {
  const { user } = useAuth();

  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    reset: resetProfile,
    formState: { errors: profileErrors, isSubmitting: isSubmittingProfile },
  } = useForm<UpdateAdminProfileDto>({
    resolver: zodResolver(updateAdminProfileSchema),
    defaultValues: {
      name: '',
      email: '',
    },
  });

  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    reset: resetPassword,
    formState: { errors: passwordErrors, isSubmitting: isSubmittingPassword },
  } = useForm<ChangePasswordDto>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      oldPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  useEffect(() => {
    if (user) {
      resetProfile({ name: user.name || '', email: user.email || '' });
    }
  }, [user, resetProfile]);

  const onSubmitProfile = async (data: UpdateAdminProfileDto) => {
    try {
      await updateMyAdminProfile(data);
      toast.success('Profil berhasil diperbarui');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Gagal memperbarui profil');
    }
  };

  const onSubmitPassword = async (data: ChangePasswordDto) => {
    try {
      await changeMyPassword(data);
      toast.success('Password berhasil diubah');
      resetPassword();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Gagal mengubah password');
    }
  };

  return (
<div className="p-4 sm:p-6 lg:p-8">
  <h1 className="text-center text-3xl sm:text-4xl font-extrabold text-gray-800 mb-10">
    Pengaturan Akun ⚙️
  </h1>

  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
    
    {/* --- Kartu Profil Admin (Kiri) --- */}
    <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 transition-all duration-300 hover:shadow-2xl">
      <div className="flex items-center gap-3 mb-8">
        {/* Ikon menggunakan warna primer dari tema */}
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[var(--color-primary)]" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
        </svg>
        {/* Judul dengan gradien warna tema */}
        <h2 className="text-2xl font-bold bg-gradient-to-r from-[var(--color-primary-light)] to-[var(--color-primary)] bg-clip-text text-transparent">
          Profil Admin
        </h2>
      </div>

      <form onSubmit={handleSubmitProfile(onSubmitProfile)} className="space-y-6">
        <FormField label="Nama Lengkap" error={profileErrors.name?.message}>
          <input 
            {...registerProfile('name')} 
            className="input w-full border-gray-300 rounded-lg p-3 bg-gray-50 transition-all duration-200 focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent" 
          />
        </FormField>

        <FormField label="Email" error={profileErrors.email?.message}>
          <input 
            type="email" 
            {...registerProfile('email')} 
            className="input w-full border-gray-300 rounded-lg p-3 bg-gray-50 transition-all duration-200 focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent" 
          />
        </FormField>

        <div className="flex justify-end pt-4">
          <button 
            type="submit" 
            disabled={isSubmittingProfile}
            className="px-6 py-2 font-semibold text-white bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-dark)] rounded-lg shadow-md hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-primary)] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
          >
            {isSubmittingProfile ? 'Menyimpan...' : 'Simpan Perubahan'}
          </button>
        </div>
      </form>
    </div>

    {/* --- Kartu Ganti Password (Kanan) --- */}
    <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 transition-all duration-300 hover:shadow-2xl">
      <div className="flex items-center gap-3 mb-8">
        {/* Ikon menggunakan warna primer dari tema */}
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[var(--color-primary)]" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M18 8a6 6 0 01-7.743 5.743L10 14l-1 1-1 1H6v2H2v-4l4.257-4.257A6 6 0 1118 8zm-6-4a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" />
        </svg>
        {/* Judul dengan gradien warna tema */}
        <h2 className="text-2xl font-bold bg-gradient-to-r from-[var(--color-primary-light)] to-[var(--color-primary)] bg-clip-text text-transparent">
          Ganti Password
        </h2>
      </div>

      <form onSubmit={handleSubmitPassword(onSubmitPassword)} className="space-y-6">
        <FormField label="Password Lama" error={passwordErrors.oldPassword?.message}>
          <input 
            type="password" 
            {...registerPassword('oldPassword')} 
            className="input w-full border-gray-300 rounded-lg p-3 bg-gray-50 transition-all duration-200 focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent" 
          />
        </FormField>

        <FormField label="Password Baru" error={passwordErrors.newPassword?.message}>
          <input 
            type="password" 
            {...registerPassword('newPassword')} 
            className="input w-full border-gray-300 rounded-lg p-3 bg-gray-50 transition-all duration-200 focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent" 
          />
        </FormField>

        <FormField label="Konfirmasi Password Baru" error={passwordErrors.confirmPassword?.message}>
          <input 
            type="password" 
            {...registerPassword('confirmPassword')} 
            className="input w-full border-gray-300 rounded-lg p-3 bg-gray-50 transition-all duration-200 focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent" 
          />
        </FormField>

        <div className="flex justify-end pt-4">
          <button 
            type="submit" 
            disabled={isSubmittingPassword}
            className="px-6 py-2 font-semibold text-white bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-dark)] rounded-lg shadow-md hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-primary)] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
          >
            {isSubmittingPassword ? 'Menyimpan...' : 'Ubah Password'}
          </button>
        </div>
      </form>
    </div>
  </div>
</div>
  );
};

export default AdminProfilePage;