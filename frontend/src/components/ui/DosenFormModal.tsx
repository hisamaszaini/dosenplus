import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';

import * as userService from '../../services/user.service';
import Button from './Button';
import FormField from './FormField';
import { createDosenUserSchema, updateDosenProfileSchema, type CreateDosenUserDto, type UpdateDosenProfileDto, type User } from '../../../../backend/src/users/dto/user.dto';
import type { Fakultas } from '../../../../backend/src/fakultas/dto/fakultas.dto';
import type { Prodi } from '../../../../backend/src/prodi/dto/prodi.dto';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    userId: number | null;
    fakultas: Fakultas[];
    prodi: Prodi[];
}

type Mode = 'create' | 'edit';

export const DosenFormModal = ({ isOpen, onClose, onSuccess, userId, fakultas, prodi }: Props) => {
    const mode: Mode = userId ? 'edit' : 'create';
    const [apiError, setApiError] = useState('');
    const [filteredProdi, setFilteredProdi] = useState<Prodi[]>([]);

    const form = useForm<CreateDosenUserDto | UpdateDosenProfileDto>({
        resolver: zodResolver(mode === 'edit' ? updateDosenProfileSchema : createDosenUserSchema),
        defaultValues: {
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
                nuptk: '',
                jenis_kelamin: 'Laki-laki',
                no_hp: '',
                prodiId: 0,
                fakultasId: 0,
                jabatan: '',
            },
            dataKepegawaian: {
                npwp: '',
                nama_bank: '',
                no_rek: '',
                bpjs_kesehatan: '',
                bpjs_tkerja: '',
                no_kk: '',
            },
        },
    });

    const {
        register,
        handleSubmit,
        reset,
        watch,
        formState: { errors, isSubmitting },
    } = form;

    const watchedFakultasId = watch('biodata.fakultasId');

    useEffect(() => {
        if (watchedFakultasId) {
            const filtered = prodi.filter(p => p.fakultasId === Number(watchedFakultasId));
            setFilteredProdi(filtered);
        } else {
            setFilteredProdi([]);
        }
    }, [watchedFakultasId, prodi]);

    useEffect(() => {
        const subscription = watch((value, { name }) => {
            if (name === 'biodata.nama') {
                form.setValue('dataUser.name', value.biodata?.nama || '');
            }
        });
        return () => subscription.unsubscribe();
    }, [watch, form]);

    useEffect(() => {
        if (!isOpen) return;

        if (mode === 'edit' && userId) {
            userService
                .getUserById(userId)
                .then((data) => {
                    const fakultasId = data.dosen?.fakultasId || 0;
                    const prodiFiltered = prodi.filter(p => p.fakultasId === fakultasId);
                    setFilteredProdi(prodiFiltered);

                    reset({
                        dataUser: {
                            email: data.email,
                            username: data.username,
                            name: data.name,
                            status: data.status || 'ACTIVE',
                            password: '',
                            confirmPassword: '',
                        },
                        biodata: {
                            nama: data.dosen?.nama || '',
                            nip: data.dosen?.nip || '',
                            nuptk: data.dosen?.nuptk || '',
                            jenis_kelamin: data.dosen?.jenis_kelamin || 'Laki-laki',
                            no_hp: data.dosen?.no_hp || '',
                            prodiId: data.dosen?.prodiId || 0,
                            fakultasId: data.dosen?.fakultasId || 0,
                            jabatan: data.dosen?.jabatan || '',
                        },
                        dataKepegawaian: {
                            npwp: data.dosen?.dataKepegawaian?.npwp ?? null,
                            nama_bank: data.dosen?.dataKepegawaian?.nama_bank ?? null,
                            no_rek: data.dosen?.dataKepegawaian?.no_rek ?? null,
                            bpjs_kesehatan: data.dosen?.dataKepegawaian?.bpjs_kesehatan ?? null,
                            bpjs_tkerja: data.dosen?.dataKepegawaian?.bpjs_tkerja ?? null,
                            no_kk: data.dosen?.dataKepegawaian?.no_kk ?? null,
                        },
                    });
                })
                .catch((err) => {
                    console.error('Gagal memuat data dosen:', err);
                    toast.error('Gagal memuat data dosen.');
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
                    nuptk: '',
                    jenis_kelamin: 'Laki-laki',
                    no_hp: '',
                    prodiId: 0,
                    fakultasId: 0,
                    jabatan: '',
                },
                dataKepegawaian: {
                    npwp: '',
                    nama_bank: '',
                    no_rek: '',
                    bpjs_kesehatan: '',
                    bpjs_tkerja: '',
                    no_kk: '',
                },
            });
        };
    }, [isOpen, mode, userId, reset, onClose]);

    const onSubmit = async (formData: CreateDosenUserDto | UpdateDosenProfileDto) => {
        setApiError('');
        try {
            if (mode === 'edit' && userId) {
                await userService.updateDosenProfile(userId, formData);
                toast.success('Data dosen berhasil diperbarui');
            } else {
                await userService.createDosenUser(formData as CreateDosenUserDto);
                toast.success('Dosen baru berhasil ditambahkan');
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
                        {mode === 'edit' ? 'Edit Data Dosen' : 'Tambah Dosen Baru'}
                    </h3>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4 overflow-y-auto">
                    <FormField label="Nama Lengkap" error={errors.dataUser?.name?.message}>
                        <input {...register('biodata.nama')} className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-indigo-500 outline-none transition-colors" />
                    </FormField>
                    <FormField label="Username" error={errors.dataUser?.username?.message}>
                        <input {...register('dataUser.username')} className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-indigo-500 outline-none transition-colors" />
                    </FormField>
                    <FormField label="Email" error={errors.dataUser?.email?.message}>
                        <input type="email" {...register('dataUser.email')} className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-indigo-500 outline-none transition-colors" />
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
                    <FormField label="Password" error={errors.dataUser?.password?.message}>
                        <input type="password" {...register('dataUser.password')} className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-indigo-500 outline-none transition-colors" />
                    </FormField>
                    <FormField label="Konfirmasi Password" error={errors.dataUser?.confirmPassword?.message}>
                        <input type="password" {...register('dataUser.confirmPassword')} className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-indigo-500 outline-none transition-colors" />
                    </FormField>
                    <FormField label="NIP" error={errors.biodata?.nip?.message}>
                        <input {...register('biodata.nip')} className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-indigo-500 outline-none transition-colors" />
                    </FormField>
                    <FormField label="NUPTK" error={errors.biodata?.nuptk?.message}>
                        <input {...register('biodata.nuptk')} className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-indigo-500 outline-none transition-colors" />
                    </FormField>
                    <FormField label="Jenis Kelamin" error={errors.biodata?.jenis_kelamin?.message}>
                        <select {...register('biodata.jenis_kelamin')} className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-indigo-500 outline-none transition-colors">
                            <option value="Laki-laki">Laki-laki</option>
                            <option value="Perempuan">Perempuan</option>
                        </select>
                    </FormField>
                    <FormField label="No HP" error={errors.biodata?.no_hp?.message}>
                        <input {...register('biodata.no_hp')} className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-indigo-500 outline-none transition-colors" />
                    </FormField>
                    <FormField label="Jabatan" error={errors.biodata?.jabatan?.message}>
                        <select {...register('biodata.jabatan')} className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-indigo-500 outline-none transition-colors">
                            <option value="">-- Pilih Jabatan --</option>
                            <option value="Asisten Ahli">Asisten Ahli</option>
                            <option value="Lektor">Lektor</option>
                            <option value="Lektor Kepala">Lektor Kepala</option>
                            <option value="Guru Besar">Guru Besar</option>
                        </select>
                    </FormField>
                    <FormField label="Fakultas" error={errors.biodata?.fakultasId?.message}>
                        <select {...register('biodata.fakultasId', { setValueAs: v => Number(v) || 0 })} className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-indigo-500 outline-none transition-colors">
                            <option value="">-- Pilih Fakultas --</option>
                            {fakultas.map(f => (
                                <option key={f.id} value={f.id}>{f.nama}</option>
                            ))}
                        </select>
                    </FormField>
                    <FormField label="Program Studi" error={errors.biodata?.prodiId?.message}>
                        <select {...register('biodata.prodiId', { setValueAs: v => Number(v) || 0 })} className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-indigo-500 outline-none transition-colors" disabled={!watchedFakultasId}>
                            <option value="">-- Pilih Prodi --</option>
                            {filteredProdi.map(p => (
                                <option key={p.id} value={p.id}>{p.nama}</option>
                            ))}
                        </select>
                    </FormField>
                    <FormField label="NPWP" error={errors.dataKepegawaian?.npwp?.message}>
                        <input {...register('dataKepegawaian.npwp')} className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-indigo-500 outline-none transition-colors" />
                    </FormField>
                    <FormField label="Nama Bank" error={errors.dataKepegawaian?.nama_bank?.message}>
                        <input {...register('dataKepegawaian.nama_bank')} className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-indigo-500 outline-none transition-colors" />
                    </FormField>
                    <FormField label="No. Rekening" error={errors.dataKepegawaian?.no_rek?.message}>
                        <input {...register('dataKepegawaian.no_rek')} className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-indigo-500 outline-none transition-colors" />
                    </FormField>
                    <FormField label="BPJS Kesehatan" error={errors.dataKepegawaian?.bpjs_kesehatan?.message}>
                        <input {...register('dataKepegawaian.bpjs_kesehatan')} className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-indigo-500 outline-none transition-colors" />
                    </FormField>
                    <FormField label="BPJS Ketenagakerjaan" error={errors.dataKepegawaian?.bpjs_tkerja?.message}>
                        <input {...register('dataKepegawaian.bpjs_tkerja')} className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-indigo-500 outline-none transition-colors" />
                    </FormField>
                    <FormField label="No. Kartu Keluarga" error={errors.dataKepegawaian?.no_kk?.message}>
                        <input {...register('dataKepegawaian.no_kk')} className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-indigo-500 outline-none transition-colors" />
                    </FormField>

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