import React from 'react';

const StatCard = ({ title, value, icon, iconBg }) => {
  return (
    <div className="bg-white rounded-2xl shadow-xl p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-3xl font-bold text-gray-800">{value}</p>
        </div>
        <div className={`p-4 rounded-2xl bg-gradient-to-r text-white ${iconBg}`}>
          <i className={`${icon} text-xl`}></i>
        </div>
      </div>
    </div>
  );
};

const AdminDashboardPage = () => {
  return (
    <div className="space-y-6">
      {/* <h1 className="text-2xl font-bold text-gray-800">Dashboard Administrator</h1> */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Dosen" value="78" icon="fas fa-users" iconBg="from-sky-400 to-sky-500" />
        <StatCard title="Dokumen Terverifikasi" value="1,204" icon="fas fa-check-double" iconBg="from-emerald-400 to-emerald-500" />
        <StatCard title="Menunggu Validasi" value="56" icon="fas fa-hourglass-half" iconBg="from-amber-400 to-amber-500" />
        <StatCard title="Total Penelitian" value="312" icon="fas fa-flask" iconBg="from-rose-400 to-rose-500" />
      </div>
      {/* Tambahkan komponen lain seperti tabel aktivitas terbaru di sini */}
    </div>
  );
};

export default AdminDashboardPage;