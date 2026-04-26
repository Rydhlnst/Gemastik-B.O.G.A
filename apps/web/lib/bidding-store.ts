"use client";

import { useEffect, useMemo, useState } from "react";

import type { Tender, TenderBid, TenderStatus, TenderWeights } from "@/lib/bidding";
import { demoBids, demoTenders } from "@/lib/bidding";

const KEY_TENDERS = "boga.bidding.tenders.v1";
const KEY_BIDS = "boga.bidding.bids.v1";
const KEY_EVALS = "boga.bidding.evals.v1";
const EVENT_NAME = "boga-bidding:update";

export type TenderBidExtras = {
  certifications?: string[];
  capacityPerDay?: number;
  leadTimeDays?: number;
};

export type TenderBidWithExtras = TenderBid & TenderBidExtras;

export type BidEvaluation = {
  bidId: string;
  qcScore?: number | null; // 0-100 (manual score by SPPG)
};

function safeParseJson<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function emitUpdate() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(EVENT_NAME));
}

function ensureSeeded() {
  if (typeof window === "undefined") return;

  const tenders = safeParseJson<Tender[]>(window.localStorage.getItem(KEY_TENDERS), []);
  const bids = safeParseJson<TenderBidWithExtras[]>(window.localStorage.getItem(KEY_BIDS), []);
  const evals = safeParseJson<Record<string, BidEvaluation>>(window.localStorage.getItem(KEY_EVALS), {});

  if (tenders.length === 0) {
    window.localStorage.setItem(KEY_TENDERS, JSON.stringify(demoTenders));
  }
  if (bids.length === 0) {
    window.localStorage.setItem(KEY_BIDS, JSON.stringify(demoBids));
  }
  if (Object.keys(evals).length === 0) {
    window.localStorage.setItem(KEY_EVALS, JSON.stringify({}));
  }
}

export function getAllTenders(): Tender[] {
  if (typeof window === "undefined") return demoTenders;
  ensureSeeded();
  return safeParseJson<Tender[]>(window.localStorage.getItem(KEY_TENDERS), demoTenders);
}

export function getAllBids(): TenderBidWithExtras[] {
  if (typeof window === "undefined") return demoBids;
  ensureSeeded();
  return safeParseJson<TenderBidWithExtras[]>(window.localStorage.getItem(KEY_BIDS), demoBids);
}

export function getAllEvaluations(): Record<string, BidEvaluation> {
  if (typeof window === "undefined") return {};
  ensureSeeded();
  return safeParseJson<Record<string, BidEvaluation>>(window.localStorage.getItem(KEY_EVALS), {});
}

function setAllTenders(tenders: Tender[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY_TENDERS, JSON.stringify(tenders));
  emitUpdate();
}

function setAllBids(bids: TenderBidWithExtras[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY_BIDS, JSON.stringify(bids));
  emitUpdate();
}

function setAllEvaluations(evals: Record<string, BidEvaluation>) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY_EVALS, JSON.stringify(evals));
  emitUpdate();
}

function makeId(prefix: string) {
  return `${prefix}-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
}

export function createTender(payload: Omit<Tender, "id" | "status"> & { status?: TenderStatus }): Tender {
  const now = new Date().toISOString().slice(0, 10);
  const tender: Tender = {
    ...payload,
    id: makeId("TND"),
    status: payload.status ?? "OPEN",
    deadline: payload.deadline || now,
  };

  const tenders = getAllTenders();
  setAllTenders([tender, ...tenders]);
  return tender;
}

export function updateTenderWeights(tenderId: string, weights: TenderWeights) {
  const tenders = getAllTenders();
  const next = tenders.map((t) => (t.id === tenderId ? { ...t, weights } : t));
  setAllTenders(next);
}

export function setTenderStatus(tenderId: string, status: TenderStatus) {
  const tenders = getAllTenders();
  const next = tenders.map((t) => (t.id === tenderId ? { ...t, status } : t));
  setAllTenders(next);
}

export function awardTender(tenderId: string, bidId: string) {
  const tenders = getAllTenders();
  const next = tenders.map((t) =>
    t.id === tenderId ? { ...t, status: "AWARDED" as const, awardedBidId: bidId } : t
  );
  setAllTenders(next);
}

export function upsertBid(
  tenderId: string,
  vendorId: number,
  bid: Omit<TenderBidWithExtras, "id" | "tenderId" | "vendorId" | "createdAt"> & { id?: string }
): TenderBidWithExtras {
  const bids = getAllBids();
  const existing = bids.find((b) => b.tenderId === tenderId && b.vendorId === vendorId);
  const now = new Date().toISOString().slice(0, 10);

  if (existing) {
    const updated: TenderBidWithExtras = {
      ...existing,
      ...bid,
      pricePerUnit: Number(bid.pricePerUnit),
      notes: bid.notes,
      certifications: bid.certifications,
      capacityPerDay: bid.capacityPerDay,
      leadTimeDays: bid.leadTimeDays,
      createdAt: existing.createdAt || now,
    };
    setAllBids(bids.map((b) => (b.id === existing.id ? updated : b)));
    return updated;
  }

  const created: TenderBidWithExtras = {
    id: makeId("BID"),
    tenderId,
    vendorId,
    pricePerUnit: Number(bid.pricePerUnit),
    notes: bid.notes,
    certifications: bid.certifications,
    capacityPerDay: bid.capacityPerDay,
    leadTimeDays: bid.leadTimeDays,
    createdAt: now,
  };
  setAllBids([created, ...bids]);
  return created;
}

export function setBidEvaluation(bidId: string, evaluation: Omit<BidEvaluation, "bidId">) {
  const evals = getAllEvaluations();
  const next = { ...evals, [bidId]: { bidId, ...evaluation } };
  setAllEvaluations(next);
}

export function useBiddingSnapshot() {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    ensureSeeded();
    const onUpdate = () => setTick((t) => t + 1);
    window.addEventListener(EVENT_NAME, onUpdate);
    window.addEventListener("storage", onUpdate);
    return () => {
      window.removeEventListener(EVENT_NAME, onUpdate);
      window.removeEventListener("storage", onUpdate);
    };
  }, []);

  return useMemo(() => {
    return {
      tenders: getAllTenders(),
      bids: getAllBids(),
      evals: getAllEvaluations(),
      tick,
    };
  }, [tick]);
}

