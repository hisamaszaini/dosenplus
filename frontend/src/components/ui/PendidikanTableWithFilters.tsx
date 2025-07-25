import React, { useState, useEffect, useCallback } from 'react';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import type { PendidikanItem } from '../../services/pendidikan.service';

interface FilterState {
  search: string;
  kategori: string;
  jenjang: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface PendidikanTableWithFiltersProps {
  title: string;
  icon?: string;
  fetchData: (params: any) => Promise<{
    data: PendidikanItem[];
    pagination: PaginationMeta;
  }>;
  onEdit: (row: PendidikanItem) => void;
  onDelete: (id: number) => void;
  initialFilters?: Partial<FilterState>;
  tableId?: string;
}

const columnHelper = createColumnHelper<PendidikanItem>();

const PendidikanTableWithFilters: React.FC<PendidikanTableWithFiltersProps> = ({
  title,
  icon = 'fa-graduation-cap',
  fetchData,
  onEdit,
  onDelete,
  initialFilters = {},
  tableId = 'default'
}) => {
  const [data, setData] = useState<PendidikanItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchDebounce, setSearchDebounce] = useState('');
  
  const [meta, setMeta] = useState<PaginationMeta>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });

  const [filters, setFilters] = useState<FilterState>({
    search: '',
    kategori: '',
    jenjang: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
    ...initialFilters
  });

  const [kategoriOptions, setKategoriOptions] = useState<string[]>([]);
  const [jenjangOptions, setJenjangOptions] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters(prev => ({ ...prev, search: searchDebounce }));
      setMeta(prev => ({ ...prev, page: 1 }));
    }, 500);
    return () => clearTimeout(timer);
  }, [searchDebounce]);

  const fetchTableData = useCallback(async () => {
    setLoading(true);
    const params = {
      page: meta.page,
      limit: meta.limit,
      search: filters.search,
      kategori: filters.kategori,
      jenjang: filters.jenjang,
      sortBy: filters.sortBy,
      sortOrder: filters.sortOrder,
    };

    try {
      const response = await fetchData(params);
      setData(response.data || []);
      setMeta(response.pagination || { page: 1, limit: 10, total: 0, totalPages: 1 });

      const uniqueKategori = [...new Set(response.data?.map(item => item.kategori) || [])];
      const uniqueJenjang = [...new Set(response.data?.map(item => item.jenjang) || [])];
      setKategoriOptions(uniqueKategori);
      setJenjangOptions(uniqueJenjang);
    } catch (error) {
      console.error(`Error fetching ${tableId} data:`, error);
      setData([]);
      setMeta({ page: 1, limit: 10, total: 0, totalPages: 1 });
    } finally {
      setLoading(false);
    }
  }, [meta.page, meta.limit, filters, fetchData, tableId]);

  useEffect(() => {
    fetchTableData();
  }, [fetchTableData]);

  const getSortableHeader = (label: string, sortKey: string) => {
    const handleSort = () => {
      const newSortOrder = filters.sortBy === sortKey && filters.sortOrder === 'asc' ? 'desc' : 'asc';
      setFilters(prev => ({ ...prev, sortBy: sortKey, sortOrder: newSortOrder }));
    };

    return (
      <button
        onClick={handleSort}
        className="flex items-center justify-center w-full text-left hover:text-blue-600 focus:outline-none cursor-pointer"
      >
        <span>{label}</span>
        {filters.sortBy === sortKey && (
          <i className={`fas ${filters.sortOrder === 'asc' ? 'fa-sort-up' : 'fa-sort-down'} ml-1 text-blue-600`}></i>
        )}
        {filters.sortBy !== sortKey && (
          <i className="fas fa-sort ml-1 text-gray-400 opacity-50"></i>
        )}
      </button>
    );
  };

  const columns = [
    columnHelper.display({ 
      id: 'no', 
      header: 'No', 
      cell: ({ row }) => (meta.page - 1) * meta.limit + row.index + 1,
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
      cell: ({ getValue }) => {
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

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setMeta(prev => ({ ...prev, page: 1 }));
  };

  const resetFilters = () => {
    const resetState = {
      search: '',
      kategori: '',
      jenjang: '',
      sortBy: 'createdAt',
      sortOrder: 'desc' as 'desc'
    };
    setFilters(resetState);
    setSearchDebounce('');
    setMeta(prev => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    setMeta(prev => ({ ...prev, page }));
  };

  const handleLimitChange = (limit: number) => {
    setMeta(prev => ({ ...prev, limit, page: 1 }));
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
      {/* Header with integrated search and controls */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 bg-blue-100 rounded-xl flex items-center justify-center">
              <i className={`fas ${icon} text-blue-600 text-xl`}></i>
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-800">{title}</h2>
              <p className="text-sm text-gray-500">
                {loading ? 'Memuat...' : `${meta.total} item ditemukan`}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm text-gray-500">Total Nilai PAK</p>
              <p className="text-2xl font-bold text-blue-600">{totalNilai}</p>
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                showFilters 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <i className="fas fa-filter mr-1"></i>
              Filter
            </button>
          </div>
        </div>

        {/* Quick Search */}
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Cari kategori, kegiatan..."
              value={searchDebounce}
              onChange={(e) => setSearchDebounce(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <i className="fas fa-search text-gray-400 text-sm"></i>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <span>Per halaman:</span>
            <select
              value={meta.limit}
              onChange={(e) => handleLimitChange(Number(e.target.value))}
              className="px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kategori
                </label>
                <select
                  value={filters.kategori}
                  onChange={(e) => handleFilterChange('kategori', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Semua Kategori</option>
                  {kategoriOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Jenjang
                </label>
                <select
                  value={filters.jenjang}
                  onChange={(e) => handleFilterChange('jenjang', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Semua Jenjang</option>
                  {jenjangOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-end">
                <button
                  onClick={resetFilters}
                  className="w-full px-4 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
                >
                  <i className="fas fa-refresh mr-2"></i>
                  Reset Filter
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        {data.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <i className="fas fa-inbox text-gray-400 text-2xl"></i>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Tidak ada data</h3>
            <p className="text-gray-500">Belum ada data yang tersedia</p>
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

      {/* Footer with Pagination */}
      {data.length > 0 && (
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              Halaman {meta.page} dari {meta.totalPages} 
              ({meta.total} total data)
            </div>
            
            <div className="flex items-center gap-2">
              {/* Previous Button */}
              <button
                onClick={() => handlePageChange(meta.page - 1)}
                disabled={meta.page <= 1}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <i className="fas fa-chevron-left mr-1"></i>
                Sebelumnya
              </button>

              {/* Page Numbers */}
              <div className="flex">
                {(() => {
                  const pages = [];
                  const showPages = 5;
                  let startPage = Math.max(1, meta.page - Math.floor(showPages / 2));
                  let endPage = Math.min(meta.totalPages, startPage + showPages - 1);
                  
                  if (endPage - startPage + 1 < showPages) {
                    startPage = Math.max(1, endPage - showPages + 1);
                  }

                  for (let i = startPage; i <= endPage; i++) {
                    pages.push(
                      <button
                        key={i}
                        onClick={() => handlePageChange(i)}
                        className={`px-3 py-2 text-sm font-medium border ${
                          i === meta.page
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'text-gray-500 bg-white border-gray-300 hover:bg-gray-50'
                        } ${i === startPage ? 'rounded-l-md' : ''} ${i === endPage ? 'rounded-r-md' : ''} -ml-px`}
                      >
                        {i}
                      </button>
                    );
                  }
                  return pages;
                })()}
              </div>

              {/* Next Button */}
              <button
                onClick={() => handlePageChange(meta.page + 1)}
                disabled={meta.page >= meta.totalPages}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Selanjutnya
                <i className="fas fa-chevron-right ml-1"></i>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PendidikanTableWithFilters;