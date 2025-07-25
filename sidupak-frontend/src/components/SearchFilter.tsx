// src/components/SearchFilter.tsx
import React, { useEffect, useState } from 'react';

interface FilterState {
  search: string;
  kategori: string;
  jenjang: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

interface SearchFilterProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  kategoriOptions: string[];
  jenjangOptions: string[];
  loading?: boolean;
  totalData: number;
}

const SearchFilter: React.FC<SearchFilterProps> = ({
  filters,
  onFiltersChange,
  kategoriOptions,
  jenjangOptions,
  loading = false,
  totalData
}) => {
  const [searchDebounce, setSearchDebounce] = useState(filters.search);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      onFiltersChange({ ...filters, search: searchDebounce });
    }, 500);
    return () => clearTimeout(timer);
  }, [searchDebounce]);

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const resetFilters = () => {
    const resetState = {
      search: '',
      kategori: '',
      jenjang: '',
      sortBy: 'createdAt',
      sortOrder: 'desc' as 'desc'
    };
    onFiltersChange(resetState);
    setSearchDebounce('');
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Filter & Pencarian</h3>
        <div className="text-sm text-gray-600 flex items-center">
          {loading && (
            <div className="mr-3 flex items-center">
              <svg className="animate-spin h-4 w-4 text-blue-500 mr-1" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Memuat...
            </div>
          )}
          <span>{totalData} data ditemukan</span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Search Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Pencarian
          </label>
          <div className="relative">
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
        </div>

        {/* Kategori Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Kategori
          </label>
          <select
            value={filters.kategori}
            onChange={(e) => handleFilterChange('kategori', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Semua Kategori</option>
            {kategoriOptions.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>

        {/* Jenjang Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Jenjang
          </label>
          <select
            value={filters.jenjang}
            onChange={(e) => handleFilterChange('jenjang', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Semua Jenjang</option>
            {jenjangOptions.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>

        {/* Reset Button */}
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
  );
};

export default SearchFilter;