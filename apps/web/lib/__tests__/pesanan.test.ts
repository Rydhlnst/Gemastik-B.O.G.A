import { describe, it, expect } from 'vitest';
import { getPOTab, type PO } from '../pesanan';

describe('Pesanan Logic (getPOTab)', () => {
  const basePO: PO = {
    purchaseOrderId: "TEST-001",
    sppgId: "SCHOOL-01",
    orderDate: new Date().toISOString(),
    financials: {
      totalAmount: 1000,
      escrowStatus: "ESCROW_HOLD",
      signatures: { qc: "PENDING", admin: "PENDING", logistik: "PENDING" }
    },
    items: []
  };

  it('harus mengembalikan status "pending" untuk pesanan baru', () => {
    const tab = getPOTab(basePO);
    expect(tab).toBe('pending');
  });

  it('harus mengembalikan status "rejected" jika vendor menolak', () => {
    const po: PO = { ...basePO, vendor_status: "REJECTED" };
    const tab = getPOTab(po);
    expect(tab).toBe('rejected');
  });

  it('harus mengembalikan status "expired" jika escrow expired', () => {
    const po: PO = { 
      ...basePO, 
      financials: { ...basePO.financials, escrowStatus: "EXPIRED" } 
    };
    const tab = getPOTab(po);
    expect(tab).toBe('expired');
  });

  it('harus mengembalikan status "completed" jika semua tanda tangan lengkap', () => {
    const po: PO = { 
      ...basePO, 
      financials: { 
        ...basePO.financials, 
        signatures: { qc: "SIGNED", admin: "SIGNED", logistik: "SIGNED" } 
      } 
    };
    const tab = getPOTab(po);
    expect(tab).toBe('completed');
  });

  it('harus mengembalikan status "scan" jika dalam tahap READY_FOR_PICKUP', () => {
    const po: PO = { 
      ...basePO, 
      financials: { ...basePO.financials, escrowStatus: "READY_FOR_PICKUP" } 
    };
    const tab = getPOTab(po);
    expect(tab).toBe('scan');
  });

  it('harus mengembalikan status "scan" jika dalam tahap REVISION', () => {
    const po: PO = { 
      ...basePO, 
      financials: { ...basePO.financials, escrowStatus: "REVISION" } 
    };
    const tab = getPOTab(po);
    expect(tab).toBe('scan');
  });
});
