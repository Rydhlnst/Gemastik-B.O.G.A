"use client"

import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"

export type LogistikDelivery = {
  id: string
  vendor: string
  sekolah: string
  porsi: number
  status: "Diproses" | "Sedang Dikirim" | "Selesai" | "Kendala"
  waktu: string
}

export const columns: ColumnDef<LogistikDelivery>[] = [
  {
    accessorKey: "id",
    header: "ID Resi",
    cell: ({ row }) => <div className="font-mono text-xs text-gray-500">{row.getValue("id")}</div>,
  },
  {
    accessorKey: "vendor",
    header: "Mitra Vendor",
    cell: ({ row }) => <div className="font-semibold text-gray-800">{row.getValue("vendor")}</div>,
  },
  {
    accessorKey: "sekolah",
    header: "Tujuan (Sekolah)",
    cell: ({ row }) => <div className="text-gray-600">{row.getValue("sekolah")}</div>,
  },
  {
    accessorKey: "porsi",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="px-0 hover:bg-transparent"
        >
          Total Porsi
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("porsi"))
      // Tambahkan padding proporsional agar tidak terlalu berdekatan
      return <div className="font-medium text-indigo-600 pl-3">{amount} Porsi</div>
    },
  },
  {
    accessorKey: "waktu",
    header: "Waktu Update",
    cell: ({ row }) => <div className="text-gray-500 text-xs">{row.getValue("waktu")}</div>,
  },
  {
    accessorKey: "status",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="px-0 hover:bg-transparent"
        >
          Status Pengiriman
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      let badgeColor = "bg-gray-100 text-gray-800";
      
      if (status === "Selesai") badgeColor = "bg-green-100 text-green-800 border-green-200";
      else if (status === "Sedang Dikirim") badgeColor = "bg-blue-100 text-blue-800 border-blue-200";
      else if (status === "Kendala") badgeColor = "bg-red-100 text-red-800 border-red-200";
      else if (status === "Diproses") badgeColor = "bg-orange-100 text-orange-800 border-orange-200";

      return (
        <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${badgeColor}`}>
          {status}
        </div>
      )
    },
  },
]
