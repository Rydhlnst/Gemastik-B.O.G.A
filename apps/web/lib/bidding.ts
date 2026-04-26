import { sppgList, vendorList } from "@/lib/mbgdummydata";

export type TenderStatus = "OPEN" | "CLOSED" | "AWARDED";

export type TenderWeights = {
  price: number; // lower is better
  quality: number; // higher is better
  distance: number; // lower is better
};

export type Tender = {
  id: string;
  sppgId: number;
  title: string;
  category: string;
  quantity: number;
  unit: string;
  deadline: string; // ISO date
  status: TenderStatus;
  weights: TenderWeights;
  awardedBidId?: string;
};

export type TenderBid = {
  id: string;
  tenderId: string;
  vendorId: number;
  pricePerUnit: number;
  notes?: string;
  createdAt: string; // ISO date
};

function toRad(value: number) {
  return (value * Math.PI) / 180;
}

export function haversineKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const earthRadiusKm = 6371;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);

  const h =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLng / 2) * Math.sin(dLng / 2) * Math.cos(lat1) * Math.cos(lat2);
  return 2 * earthRadiusKm * Math.asin(Math.sqrt(h));
}

function clamp01(value: number) {
  return Math.max(0, Math.min(1, value));
}

function normalizeWeights(weights: TenderWeights): TenderWeights {
  const sum = weights.price + weights.quality + weights.distance;
  if (!Number.isFinite(sum) || sum <= 0) {
    return { price: 1 / 3, quality: 1 / 3, distance: 1 / 3 };
  }
  return {
    price: weights.price / sum,
    quality: weights.quality / sum,
    distance: weights.distance / sum,
  };
}

export function getTenderSppg(tender: Tender) {
  return sppgList.find((s) => s.id === tender.sppgId) ?? null;
}

export function getBidVendor(bid: TenderBid) {
  return vendorList.find((v) => v.id === bid.vendorId) ?? null;
}

export function getBidDistanceKm(tender: Tender, bid: TenderBid) {
  const sppg = getTenderSppg(tender);
  const vendor = getBidVendor(bid);
  if (!sppg || !vendor) return null;
  return haversineKm({ lat: sppg.lat, lng: sppg.lng }, { lat: vendor.lat, lng: vendor.lng });
}

export type RankedBid = {
  bid: TenderBid;
  vendorName: string;
  vendorRating: number;
  distanceKm: number | null;
  qcScore?: number | null;
  score: number;
};

export function rankBidsForTender(
  tender: Tender,
  bids: TenderBid[],
  evals?: Record<string, { qcScore?: number | null }>
): RankedBid[] {
  const w = normalizeWeights(tender.weights);

  const expanded = bids
    .filter((b) => b.tenderId === tender.id)
    .map((bid) => {
      const vendor = getBidVendor(bid);
      return {
        bid,
        vendorName: vendor?.nama ?? `Vendor ${bid.vendorId}`,
        vendorRating: vendor?.rating ?? 0,
        distanceKm: getBidDistanceKm(tender, bid),
        qcScore: evals?.[bid.id]?.qcScore ?? null,
      };
    });

  const prices = expanded.map((x) => x.bid.pricePerUnit);
  const qualities = expanded.map((x) => {
    const qc = typeof x.qcScore === "number" ? clamp01(x.qcScore / 100) * 5 : null; // map 0-100 => 0-5
    // Combine: 65% reputation (rating), 35% manual QC (if any)
    if (qc == null) return x.vendorRating;
    return 0.65 * x.vendorRating + 0.35 * qc;
  });
  const distances = expanded.map((x) => x.distanceKm ?? 9999);

  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const minQuality = Math.min(...qualities);
  const maxQuality = Math.max(...qualities);
  const minDistance = Math.min(...distances);
  const maxDistance = Math.max(...distances);

  function norm(value: number, min: number, max: number) {
    if (!Number.isFinite(value) || !Number.isFinite(min) || !Number.isFinite(max)) return 1;
    if (max === min) return 0;
    return clamp01((value - min) / (max - min));
  }

  return expanded
    .map((x) => {
      const pricePenalty = norm(x.bid.pricePerUnit, minPrice, maxPrice); // 0 = best
      const distancePenalty = norm(x.distanceKm ?? 9999, minDistance, maxDistance); // 0 = best
      const qc = typeof x.qcScore === "number" ? clamp01(x.qcScore / 100) * 5 : null;
      const combinedQuality = qc == null ? x.vendorRating : 0.65 * x.vendorRating + 0.35 * qc;
      const qualityPenalty = 1 - norm(combinedQuality, minQuality, maxQuality); // 0 = best
      const score = w.price * pricePenalty + w.distance * distancePenalty + w.quality * qualityPenalty;

      return {
        ...x,
        score,
      };
    })
    .sort((a, b) => a.score - b.score);
}

export const demoTenders: Tender[] = [
  {
    id: "TND-0001",
    sppgId: 1,
    title: "Tender Paket Menu MBG (Nasi Box) - Mingguan",
    category: "Katering",
    quantity: 12_000,
    unit: "porsi",
    deadline: "2026-05-05",
    status: "OPEN",
    weights: { price: 0.5, quality: 0.35, distance: 0.15 },
  },
  {
    id: "TND-0002",
    sppgId: 2,
    title: "Tender Pengadaan Bahan Pokok (Beras + Protein) - Bulanan",
    category: "Supplier Bahan",
    quantity: 30_000,
    unit: "porsi-ekuivalen",
    deadline: "2026-05-12",
    status: "OPEN",
    weights: { price: 0.45, quality: 0.35, distance: 0.2 },
  },
];

export const demoBids: TenderBid[] = [
  { id: "BID-1001", tenderId: "TND-0001", vendorId: 1, pricePerUnit: 14_900, createdAt: "2026-04-18" },
  { id: "BID-1002", tenderId: "TND-0001", vendorId: 2, pricePerUnit: 14_400, createdAt: "2026-04-18" },
  { id: "BID-1003", tenderId: "TND-0002", vendorId: 4, pricePerUnit: 13_200, createdAt: "2026-04-19" },
  { id: "BID-1004", tenderId: "TND-0002", vendorId: 5, pricePerUnit: 13_800, createdAt: "2026-04-19" },
];
