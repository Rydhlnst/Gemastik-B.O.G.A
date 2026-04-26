"use client"

import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/ui/status-badge"

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
    cell: ({ row }) => (
      <div className="font-mono text-xs text-muted-foreground">
        {row.getValue("id")}
      </div>
    ),
  },
  {
    accessorKey: "vendor",
    header: "Mitra Vendor",
    cell: ({ row }) => (
      <div className="font-semibold text-foreground">{row.getValue("vendor")}</div>
    ),
  },
  {
    accessorKey: "sekolah",
    header: "Tujuan (Sekolah)",
    cell: ({ row }) => (
      <div className="text-muted-foreground">{row.getValue("sekolah")}</div>
    ),
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
      return (
        <div className="font-medium pl-3 text-role-primary tabular-nums">
          {amount} Porsi
        </div>
      )
    },
  },
  {
    accessorKey: "waktu",
    header: "Waktu Update",
    cell: ({ row }) => (
      <div className="text-muted-foreground text-xs">{row.getValue("waktu")}</div>
    ),
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
      const status = row.getValue("status") as string
      return <StatusBadge status={status} />
    },
  },
]
