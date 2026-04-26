"use client";

import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Camera, XCircle, CheckCircle2 } from "lucide-react";

interface QRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (data: string) => void;
}

export function QRScannerModal({ isOpen, onClose, onScan }: QRScannerModalProps) {
  const [scannedData, setScannedData] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const regionId = "qr-reader-region";

  useEffect(() => {
    if (isOpen && !scannedData) {
      const startScanner = async () => {
        try {
          const html5QrCode = new Html5Qrcode(regionId);
          scannerRef.current = html5QrCode;

          const config = { fps: 10, qrbox: { width: 250, height: 250 } };

          await html5QrCode.start(
            { facingMode: "environment" },
            config,
            (decodedText) => {
              setScannedData(decodedText);
              onScan(decodedText);
              html5QrCode.stop();
            },
            (errorMessage) => {
              // Ignore frequent "No QR code detected" errors
            }
          );
        } catch (err) {
          console.error("Scanner Error:", err);
          setError("Gagal mengakses kamera. Pastikan izin kamera diberikan.");
        }
      };

      // Slight delay to ensure DOM is ready
      const timeout = setTimeout(startScanner, 300);
      return () => {
        clearTimeout(timeout);
        if (scannerRef.current?.isScanning) {
          scannerRef.current.stop().catch(console.error);
        }
      };
    }
  }, [isOpen, scannedData, onScan]);

  const resetScanner = () => {
    setScannedData(null);
    setError(null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md bg-[#0f2027]/95 backdrop-blur-2xl border-white/10 text-white p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-xl font-black flex items-center gap-2">
            <Camera className="w-5 h-5 text-emerald-400" />
            Scan Manifest QR
          </DialogTitle>
          <DialogDescription className="text-white/50 text-xs">
            Arahkan kamera ke kode QR pada paket atau surat jalan.
          </DialogDescription>
        </DialogHeader>

        <div className="p-6">
          {!scannedData ? (
             <div className="relative aspect-square w-full bg-black/40 rounded-2xl border-2 border-dashed border-white/10 flex items-center justify-center overflow-hidden">
                <div id={regionId} className="w-full h-full" />
                {error && (
                   <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-red-500/10 backdrop-blur-sm">
                      <XCircle className="w-8 h-8 text-red-500 mb-2" />
                      <p className="text-xs font-bold text-red-200">{error}</p>
                   </div>
                )}
             </div>
          ) : (
             <div className="aspect-square w-full bg-emerald-500/10 rounded-2xl border-2 border-emerald-500/30 flex flex-col items-center justify-center p-8 text-center animate-in zoom-in">
                <div className="w-16 h-16 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/40 mb-4">
                  <CheckCircle2 className="w-8 h-8 text-white" />
                </div>
                <h4 className="text-lg font-bold text-white mb-1">Scan Berhasil</h4>
                <p className="text-xs text-emerald-400 font-mono mb-6 truncate max-w-full italic px-4">
                  {scannedData}
                </p>
                <div className="flex gap-3 w-full">
                  <Button variant="outline" className="flex-1 bg-white/5 border-white/10 hover:bg-white/10 text-white" onClick={resetScanner}>
                    Scan Lagi
                  </Button>
                  <Button className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white" onClick={onClose}>
                    Selesai
                  </Button>
                </div>
             </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
