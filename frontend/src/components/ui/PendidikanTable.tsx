import React from 'react';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import type { PendidikanItem } from '../../services/pendidikan.service';

interface PendidikanTableProps {
  data: PendidikanItem[];
  onEdit: (row: PendidikanItem) => void;
  onDelete: (id: number) => void;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  onSort?: (sortBy: string, sortOrder: 'asc' | 'desc') => void;
}

const columnHelper = createColumnHelper<PendidikanItem>();

const PendidikanTable: React.FC<PendidikanTableProps> = ({ 
  data, 
  onEdit, 
  onDelete, 
  sortBy = 'createdAt',
  sortOrder = 'desc',
  onSort
}) => {
  // Helper function for sortable headers
  const getSortableHeader = (label: string, sortKey: string) => {
    const handleSort = () => {
      if (!onSort) return;
      const newSortOrder = sortBy === sortKey && sortOrder === 'asc' ? 'desc' : 'asc';
      onSort(sortKey, newSortOrder);
    };

    return (
      <button
        onClick={handleSort}
        className={`flex items-center justify-center w-full text-left hover:text-blue-600 focus:outline-none ${
          onSort ? 'cursor-pointer' : 'cursor-default'
        }`}
        disabled={!onSort}
      >
        <span>{label}</span>
        {onSort && sortBy === sortKey && (
          <i className={`fas ${sortOrder === 'asc' ? 'fa-sort-up' : 'fa-sort-down'} ml-1 text-blue-600`}></i>
        )}
        {onSort && sortBy !== sortKey && (
          <i className="fas fa-sort ml-1 text-gray-400 opacity-50"></i>
        )}
      </button>
    );
  };

  const columns = [
    columnHelper.display({ 
      id: 'no', 
      header: 'No', 
      cell: ({ row }) => row.index + 1,
      size: 60
    }),
    columnHelper.accessor('kategori', { 
      header: () => getSortableHeader('Jenis Kegiatan', 'kategori'),
      cell: ({ getValue }) => (
        <div className="max-w-xs">
          <div className="font-medium text-gray-800 text-sm leading-5">
            {getValue()}
          </div>
        </div>
      )
    }),
    columnHelper.accessor('jenjang', {
      header: () => getSortableHeader('Jenjang', 'jenjang'),
      cell: ({ getValue }) => {
        const value = getValue();
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            value ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-500'
          }`}>
            {value || 'Tidak ada'}
          </span>
        );
      },
      size: 120
    }),
    columnHelper.accessor('lulusTahun', {
      header: () => getSortableHeader('Tahun Lulus', 'lulusTahun'),
      cell: ({ getValue }) => (
        <span className="text-sm text-gray-600">{getValue()}</span>
      ),
      size: 100
    }),
    columnHelper.accessor('nilaiPak', {
      header: () => getSortableHeader('Nilai PAK', 'nilaiPak'),
      cell: ({ getValue }) => (
        <div className="text-center">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-semibold bg-green-100 text-green-800">
            {getValue()}
          </span>
        </div>
      ),
      size: 100
    }),
    columnHelper.accessor('file', {
      header: 'File',
      cell: ({ getValue, row }) => {
        const fileUrl = getValue();
        return fileUrl ? (
          <a
            href={`http://localhost:3000/uploads/pendidikan/${fileUrl}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 transition-colors"
            title={`Download ${fileUrl}`}
          >
            <i className="fas fa-file-pdf mr-1"></i>
            PDF
          </a>
        ) : (
          <span className="text-xs text-gray-400">Tidak ada</span>
        );
      },
      size: 80
    }),
    columnHelper.display({
      id: 'aksi',
      header: 'Aksi',
      cell: ({ row }) => (
        <div className="flex justify-center items-center space-x-1">
          <button
            onClick={() => onEdit(row.original)}
            className="w-8 h-8 flex items-center justify-center bg-amber-100 hover:bg-amber-200 text-amber-600 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-opacity-50 transition-colors"
            title="Edit"
          >
            <i className="fas fa-edit text-xs"></i>
          </button>
          <button
            onClick={() => onDelete(row.original.id)}
            className="w-8 h-8 flex items-center justify-center bg-red-100 hover:bg-red-200 text-red-600 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 transition-colors"
            title="Hapus"
          >
            <i className="fas fa-trash text-xs"></i>
          </button>
        </div>
      ),
      size: 100
    }),
  ];

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const totalNilai = data.reduce((sum, item) => sum + item.nilaiPak, 0);

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 bg-blue-100 rounded-xl flex items-center justify-center">
              <i className="fas fa-graduation-cap text-blue-600 text-xl"></i>
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-800">Data Pendidikan</h2>
              <p className="text-sm text-gray-500">
                {data.length} item ditemukan
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Total Nilai PAK</p>
            <p className="text-2xl font-bold text-blue-600">{totalNilai}</p>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        {data.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <i className="fas fa-inbox text-gray-400 text-2xl"></i>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Tidak ada data</h3>
            <p className="text-gray-500">Belum ada data pendidikan yang tersedia</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50">
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <th
                      key={header.id}
                      className="px-4 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider border-r border-gray-200 last:border-r-0"
                      style={{ width: header.getSize() }}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {table.getRowModel().rows.map((row, index) => (
                <tr 
                  key={row.id} 
                  className={`hover:bg-gray-50 transition-colors duration-150 ${
                    index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'
                  }`}
                >
                  {row.getVisibleCells().map(cell => (
                    <td
                      key={cell.id}
                      className="px-4 py-4 align-middle border-r border-gray-100 last:border-r-0"
                      style={{ width: cell.column.getSize() }}
                    >
                      <div className="flex items-center justify-center">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Footer dengan Summary */}
      {data.length > 0 && (
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              <span className="font-medium">{data.length}</span> data ditampilkan
            </div>
            <div className="flex items-center space-x-4 text-sm">
              <div className="text-gray-600">
                Total Nilai PAK:
                <span className="ml-2 px-3 py-1 bg-blue-100 text-blue-800 font-bold rounded-full">
                  {totalNilai}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PendidikanTable;