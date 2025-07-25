import { ROLES } from '../types/user.types';

export const menuConfig = {
  [ROLES.ADMIN]: [
    { label: 'Dashboard', path: '/admin/dashboard', icon: 'fas fa-tachometer-alt' },
    {
      label: 'Master Data',
      icon: 'fas fa-file-signature',
      children: [
        { label: 'User', path: '/admin/user', icon: 'fas fa-user-cog' },
        { label: 'Semester', path: '/admin/semester', icon: 'fas fa-calendar-alt' },
        { label: 'Fakultas', path: '/admin/fakultas', icon: 'fas fa-university' },
        { label: 'Prodi', path: '/admin/prodi', icon: 'fas fa-graduation-cap' },
      ],
    },
    // { label: 'Generate Laporan', path: '/admin/laporan', icon: 'fas fa-chart-pie' },
    { label: 'Keluar', path: '/logout', icon: 'fas fa-sign-out-alt', isLogout: true }
  ],

  [ROLES.DOSEN]: [
    { label: 'Dashboard', path: '/dosen/dashboard', icon: 'fas fa-user-tie' },
    { label: 'Pendidikan', path: '/dosen/pendidikan', icon: 'fas fa-graduation-cap' },
    // { label: 'Penelitian', path: '/dosen/penelitian', icon: 'fas fa-microscope' },
    // { label: 'Pengabdian', path: '/dosen/pengabdian', icon: 'fas fa-hands-helping' },
    // { label: 'Penunjang', path: '/dosen/penunjang', icon: 'fas fa-toolbox' },
    { label: 'Keluar', path: '/logout', icon: 'fas fa-sign-out-alt', isLogout: true }
  ],

  [ROLES.VALIDATOR]: [
    { label: 'Dashboard', path: '/validator/dashboard', icon: 'fas fa-user-tie' },
    { label: 'Keluar', path: '/logout', icon: 'fas fa-sign-out-alt', isLogout: true }
  ],
};