import React, { useEffect, useMemo, useState } from 'react'
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from '@tanstack/react-table'
import pendidikanService from '../../../services/pendidikan.service'
import { useAuth } from '../../../contexts/AuthContext'
import PendidikanFormModal from './PendidikanFormModal'
import { toast } from 'sonner'

interface Pendidikan {
  id: number
  kategori: string
  kegiatan: string | null
  nilaiPak: number
  jenjang: string | null
  prodi: string | null
  fakultas: string | null
  perguruanTinggi: string | null
  lulusTahun: number | null
  file: string
}

export default function PendidikanTable() {
  const { user } = useAuth()
  const [data, setData] = useState<Pendidikan[]>([])
  const [sorting, setSorting] = useState<SortingState>([])
  const [showModal, setShowModal] = useState(false)
  const [editData, setEditData] = useState<Pendidikan | null>(null)

  const [search, setSearch] = useState('')
  const [kategoriFilter, setKategoriFilter] = useState('')
  const [jenjangFilter, setJenjangFilter] = useState('')
  const [page, setPage] = useState(1)
  const [limit] = useState(10)
  const [meta, setMeta] = useState({ page: 1, totalPages: 1 })
  
  const fetchData = async () => {
    try {
      const response = await pendidikanService.findAll({
        page,
        limit,
        search,
        kategori: kategoriFilter || undefined,
        jenjang: jenjangFilter || undefined,
        sortBy: sorting[0]?.id,
        sortOrder: sorting[0]?.desc ? 'desc' : 'asc',
      })
      setData(response.data)
      setMeta(response.meta)
    } catch (error) {
      toast.error('Gagal memuat data pendidikan.')
      console.error(error)
    }
  }

  useEffect(() => {
    const handler = setTimeout(() => {
      fetchData()
    }, 500) // 500ms delay

    return () => {
      clearTimeout(handler)
    }
  }, [page, search, kategoriFilter, jenjangFilter, sorting])

  const totalNilai = useMemo(() => {
    return data.reduce((sum, item) => sum + item.nilaiPak, 0)
  }, [data])

  const handleResetFilters = () => {
    setSearch('')
    setKategoriFilter('')
    setJenjangFilter('')
    setPage(1)
  }

  const handleModalSubmit = () => {
    setShowModal(false)
    fetchData()
    toast.success('Data berhasil disimpan!')
  }

  const handleOpenModal = (initialData: Pendidikan | null = null) => {
    setEditData(initialData)
    setShowModal(true)
  }
  
  const handleDelete = (id: number) => {
    toast.info(`Fungsi hapus untuk ID ${id} belum diimplementasikan.`)
  }

  const columns = useMemo<ColumnDef<Pendidikan>[]>(() => [
    {
      header: 'No',
      size: 64,
      cell: info => (
        <div className="w-7 h-7 sm:w-8 sm:h-8 bg-indigo-100 rounded-md sm:rounded-lg flex items-center justify-center text-xs sm:text-sm font-semibold text-indigo-600 mx-auto">
          {(page - 1) * limit + info.row.index + 1}
        </div>
      ),
    },
    {
      header: 'Jenis Kegiatan',
      accessorKey: 'kegiatan',
      enableSorting: true,
      cell: info => (
        <div className="font-medium text-left text-gray-700 text-sm sm:text-base">
          {info.getValue() as string || info.row.original.kategori}
        </div>
      ),
    },
    {
      header: 'Kategori',
      accessorKey: 'jenjang',
      cell: info => (
        <span className="inline-flex items-center px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-xs sm:text-sm font-medium bg-blue-100 text-blue-800 whitespace-nowrap">
          {info.getValue() as string || '-'}
        </span>
      ),
    },
    {
      header: 'Jumlah',
      size: 96,
      cell: () => <span className="text-sm sm:text-base font-medium text-gray-700">1</span>,
    },
    {
      header: 'Nilai',
      accessorKey: 'nilaiPak',
      size: 96,
      cell: info => (
        <span className="inline-flex items-center px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-xs sm:text-sm font-medium bg-green-100 text-green-800 whitespace-nowrap">
          {info.getValue() as number}
        </span>
      ),
    },
    {
      header: 'Bukti',
      size: 128,
      cell: info => {
        const fileUrl = info.row.original.file ? `/uploads/pendidikan/${info.row.original.file}` : '#';
        return (
          <a href={fileUrl} title="Lihat Bukti PDF" target="_blank" rel="noopener noreferrer" className="inline-flex items-center px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-md text-xs sm:text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 transition-colors whitespace-nowrap">
            <i className="fas fa-file-pdf mr-1 sm:mr-1.5"></i>PDF
          </a>
        );
      },
    },
    {
      header: 'Aksi',
      id: 'actions',
      size: 128,
      cell: info => (
        <div className="flex justify-center items-center space-x-1.5 sm:space-x-2">
          <button title="Edit Data" onClick={() => handleOpenModal(info.row.original)} className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center bg-amber-100 hover:bg-amber-200 text-amber-600 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-opacity-50 transition-colors">
            <i className="fas fa-edit text-xs sm:text-sm"></i>
          </button>
          <button title="Hapus Data" onClick={() => handleDelete(info.row.original.id)} className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center bg-red-100 hover:bg-red-200 text-red-600 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 transition-colors">
            <i className="fas fa-trash text-xs sm:text-sm"></i>
          </button>
        </div>
      ),
    },
  ], [page, limit]);
  

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
    pageCount: meta.totalPages,
  })

  const SortIndicator = ({ column }) => {
    const sorted = column.getIsSorted()
    if (!sorted) {
      return <i className="fas fa-sort text-gray-300 ml-2"></i>
    }
    return sorted === 'desc' 
      ? <i className="fas fa-sort-down text-gray-600 ml-2"></i> 
      : <i className="fas fa-sort-up text-gray-600 ml-2"></i>
  }

  return (
    <>
      {/* --- Main Header Card --- */}
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-5 sm:p-6 md:p-8 mb-6 sm:mb-8 card-hover fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 flex items-center">
              <i className="fas fa-chalkboard-teacher text-blue-600 mr-2 sm:mr-3 text-lg sm:text-xl lg:text-2xl"></i>
              Penilaian Pendidikan
            </h1>
            <p className="text-gray-500 text-sm sm:text-base mt-1">
              Kelola dan pantau penilaian pendidikan dengan mudah.
            </p>
          </div>
          <div className="mt-4 sm:mt-0 flex-shrink-0">
            <button
              onClick={() => handleOpenModal()}
              className="w-full sm:w-auto bg-blue-500 text-white px-4 py-2 sm:px-5 sm:py-2.5 rounded-lg sm:rounded-xl font-semibold inline-flex items-center justify-center space-x-2 shadow-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors duration-150"
            >
              <i className="fas fa-plus text-xs sm:text-sm"></i>
              <span>Tambah Data</span>
            </button>
          </div>
        </div>
      </div>

      {/* --- Table Card with Filters --- */}
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg overflow-hidden mb-6 sm:mb-8 card-hover fade-in">
        <div className="p-5 sm:p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 sm:w-11 sm:h-11 bg-blue-100 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
              <i className="fas fa-graduation-cap text-blue-600 text-lg sm:text-xl"></i>
            </div>
            <div>
              <h2 className="text-md sm:text-lg font-bold text-gray-800">Pendidikan</h2>
              <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                Daftar kegiatan pendidikan formal dan diklat.
              </p>
            </div>
          </div>
        </div>

        {/* --- Filter & Search Panel --- */}
        <div className="p-4 sm:p-5 bg-gray-50/50 border-b border-gray-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div className="relative">
                    <i className="fas fa-search text-gray-400 absolute top-1/2 left-3 -translate-y-1/2"></i>
                    <input
                        type="text"
                        placeholder="Cari kegiatan..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    />
                </div>
                <select value={kategoriFilter} onChange={e => setKategoriFilter(e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition">
                    <option value="">Semua Tipe</option>
                    <option value="Pendidikan Formal">Pendidikan Formal</option>
                    <option value="Diklat">Diklat</option>
                </select>
                <select value={jenjangFilter} onChange={e => setJenjangFilter(e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition">
                    <option value="">Semua Jenjang</option>
                    <option value="Sarjana">Sarjana</option>
                    <option value="Magister">Magister</option>
                    <option value="Doktor">Doktor</option>
                </select>
                <button onClick={handleResetFilters} className="px-4 py-2 text-sm bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors inline-flex items-center justify-center">
                    <i className="fas fa-undo mr-2 text-xs"></i>
                    Reset
                </button>
            </div>
        </div>

        {/* --- Table --- */}
        <div className="overflow-x-auto table-responsive">
          <table className="w-full min-w-[800px]">
            <thead className="bg-gray-50">
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <th
                      key={header.id}
                      className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider"
                      style={{ width: header.getSize() }}
                    >
                      <div
                        {...{
                          className: header.column.getCanSort()
                            ? 'cursor-pointer select-none flex items-center justify-center'
                            : 'flex items-center justify-center',
                          onClick: header.column.getToggleSortingHandler(),
                        }}
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {header.column.getCanSort() && <SortIndicator column={header.column} />}
                      </div>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
            {table.getRowModel().rows.length > 0 ? (
                table.getRowModel().rows.map(row => (
                  <tr key={row.id} className="hover:bg-gray-50 transition-colors duration-150">
                    {row.getVisibleCells().map(cell => (
                      <td key={cell.id} className="px-4 py-3.5 align-middle text-center">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={columns.length} className="text-center py-16 text-gray-500">
                    <div className="flex flex-col items-center">
                        <i className="fas fa-box-open text-4xl text-gray-300 mb-3"></i>
                        <p className="font-semibold">Tidak ada data ditemukan</p>
                        <p className="text-sm">Coba ubah filter pencarian Anda.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
            <tfoot className="bg-gray-50 border-t-2 border-gray-200">
              <tr>
                <td colSpan={4} className="px-4 py-3 text-right text-xs sm:text-sm font-semibold text-gray-600">Total Nilai:</td>
                <td className="px-4 py-3 text-center">
                  <div className="inline-flex items-center px-2.5 py-1 rounded-md sm:rounded-lg bg-indigo-100">
                    <span className="text-sm sm:text-base font-bold text-indigo-600">{totalNilai}</span>
                  </div>
                </td>
                <td colSpan={3}></td>
              </tr>
            </tfoot>
          </table>
        </div>
        
        {/* --- Pagination --- */}
        <div className="p-4 sm:p-5 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-sm text-gray-600">
                Halaman <span className="font-semibold">{meta.page}</span> dari <span className="font-semibold">{meta.totalPages}</span>
            </span>
            <div className="inline-flex items-center gap-2">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1.5 inline-flex items-center gap-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition">
                    <i className="fas fa-chevron-left text-xs"></i>
                    <span>Sebelumnya</span>
                </button>
                <button onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))} disabled={page === meta.totalPages} className="px-3 py-1.5 inline-flex items-center gap-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition">
                    <span>Berikutnya</span>
                    <i className="fas fa-chevron-right text-xs"></i>
                </button>
            </div>
        </div>
      </div>

      {showModal && (
        <PendidikanFormModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          initialData={editData}
          onSubmit={handleModalSubmit}
        />
      )}
    </>
  )
}