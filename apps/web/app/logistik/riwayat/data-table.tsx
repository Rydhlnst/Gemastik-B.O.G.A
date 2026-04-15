"use client"

import { useState, useRef, useEffect } from "react"
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  SortingState,
  ColumnFiltersState,
  VisibilityState,
  useReactTable,
} from "@tanstack/react-table"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
}

export function DataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  
  // State for opening our custom columns dropdown
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
    },
    initialState: {
      pagination: {
        pageSize: 5,
      },
    },
  })

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between pb-2 gap-4">
        <Input
          placeholder="Cari nama vendor..."
          value={(table.getColumn("vendor")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("vendor")?.setFilterValue(event.target.value)
          }
          className="max-w-sm bg-white/30 border-white/40 text-slate-900 placeholder:text-slate-400 focus:bg-white/50 focus:ring-emerald-500/20 transition-all rounded-xl py-4 px-5 shadow-sm"
        />

        {/* Coded custom dropdown checklist for Column Visibility */}
        <div className="relative" ref={dropdownRef}>
          <Button 
            variant="outline" 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="rounded-xl border border-white/60 border-t-white/80 bg-white/30 text-slate-600 hover:bg-white/50 hover:text-slate-900 px-5 backdrop-blur-md transition-all shadow-sm"
          >
            Filter Kolom
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-2 opacity-50"><path d="m6 9 6 6 6-6"/></svg>
          </Button>

          {isDropdownOpen && (
            <div className="absolute right-0 top-full mt-3 w-56 rounded-2xl bg-white/50 backdrop-blur-[40px] border border-white/60 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.25)] z-50 p-3 animate-in fade-in zoom-in-95">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] px-3 mb-3">Tampilkan Kolom</h4>
              <div className="space-y-1">
                {table
                  .getAllColumns()
                  .filter((column) => column.getCanHide() && column.id !== "id" && column.id !== "waktu")
                  .map((column) => {
                    let nameDisplay = column.id;
                    if (column.id === "vendor") nameDisplay = "Mitra Vendor"
                    if (column.id === "sekolah") nameDisplay = "Sekolah Tujuan"
                    if (column.id === "porsi") nameDisplay = "Total Porsi"
                    if (column.id === "status") nameDisplay = "Status Pengiriman"

                    return (
                      <label key={column.id} className="flex items-center gap-3 px-3 py-2 hover:bg-white/5 rounded-xl cursor-pointer transition-colors group">
                        <input
                          type="checkbox"
                          checked={column.getIsVisible()}
                          onChange={column.getToggleVisibilityHandler()}
                          className="rounded border-slate-300 bg-white text-emerald-600 focus:ring-emerald-500/20 transition-all"
                        />
                        <span className="text-xs font-bold text-slate-500 group-hover:text-slate-900 transition-colors capitalize">{nameDisplay}</span>
                      </label>
                    )
                  })}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="overflow-hidden rounded-[24px] border border-white/60 border-t-white/80 bg-white/45 backdrop-blur-[40px] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.25)]">
        <Table>
          <TableHeader className="bg-slate-50/50">
            {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id} className="border-slate-100 hover:bg-transparent">
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} className="font-black text-slate-400 text-[10px] uppercase tracking-[0.2em] py-2.5 px-6">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="border-slate-50 hover:bg-slate-50/80 transition-colors group"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-2.5 px-6 text-sm font-bold text-slate-600 group-hover:text-slate-900 transition-colors">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-32 text-center text-slate-300 font-bold italic">
                  Tidak ada data riwayat distribusi.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-end space-x-2 py-3">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
          className="rounded-xl border border-white/60 border-t-white/80 bg-white/30 text-slate-500 hover:bg-white/50 hover:text-slate-900 disabled:opacity-30 px-6 transition-all backdrop-blur-md shadow-sm"
        >
          Sebelumnya
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
          className="rounded-xl border border-white/60 border-t-white/80 bg-white/30 text-slate-500 hover:bg-white/50 hover:text-slate-900 disabled:opacity-30 px-6 transition-all backdrop-blur-md shadow-sm"
        >
          Berikutnya
        </Button>
      </div>
    </div>
  )
}
