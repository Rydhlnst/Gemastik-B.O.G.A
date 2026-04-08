import { AlertCircleIcon } from "lucide-react"

import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert"

export function AlertDestructive() {
  return (
    <Alert variant="destructive" className="max-w-md">
      <AlertCircleIcon className="h-4 w-4" />
      <AlertTitle>Kesalahan Autentikasi</AlertTitle>
      <AlertDescription>
         Anda harus Login/Sign up terlebih dahulu jika ingin berkomentar di halaman ini.
      </AlertDescription>
    </Alert>
  )
}
