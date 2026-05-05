import latest from "../../data/latest.json";

export type Slot = {
  time: string;
  price: number | null;
  is_hot_deal: boolean;
};

export type Status = "green" | "afternoon" | "yellow" | "red" | "error";

export type CartPolicy = "mandatory" | "optional" | "included";

export type CourseResult = {
  name: string;
  source: string;
  status: Status;
  slots: Slot[];
  fallback_price: number | null;
  distance_km: number | null;
  phone: string | null;
  booking_url: string | null;
  cart_mandatory: boolean;
  cart_policy?: CartPolicy | null;
  consecutive_slots: { time: string }[][];
  earliest_slot: string | null;
  earliest_2team: string | null;
};

export function resolveCartPolicy(c: CourseResult): CartPolicy | null {
  return c.cart_policy ?? (c.cart_mandatory ? "mandatory" : null);
}

export const CART_POLICY_LABELS: Record<CartPolicy, string> = {
  mandatory: "카트 필수",
  optional: "카트 선택",
  included: "카트비 포함",
};

export type CrawlRun = {
  target_date: string;
  results: CourseResult[];
};

const STATUS_ORDER: Record<Status, number> = {
  green: 0,
  afternoon: 1,
  yellow: 2,
  red: 3,
  error: 4,
};

export function getLatestRun(): CrawlRun {
  const run = latest as CrawlRun;
  const sorted = [...run.results].sort((a, b) => {
    const s = STATUS_ORDER[a.status] - STATUS_ORDER[b.status];
    if (s !== 0) return s;
    const ap = lowestPrice(a) ?? 9999;
    const bp = lowestPrice(b) ?? 9999;
    return ap - bp;
  });
  return { ...run, results: sorted };
}

export function lowestPrice(c: CourseResult): number | null {
  const priceOf = (slots: Slot[]) => {
    const prices = slots.map((s) => s.price).filter((p): p is number => !!p);
    return prices.length ? Math.min(...prices) : null;
  };
  return (
    priceOf(c.slots.filter((s) => s.time < "12:00")) ??
    priceOf(c.slots.filter((s) => s.time < "16:00")) ??
    priceOf(c.slots)
  );
}

export function priceRange(c: CourseResult): { min: number; max: number } | null {
  const priceOf = (slots: Slot[]) => {
    const prices = slots.map((s) => s.price).filter((p): p is number => p !== null);
    if (prices.length === 0) return null;
    return { min: Math.min(...prices), max: Math.max(...prices) };
  };
  return (
    priceOf(c.slots.filter((s) => s.time < "12:00")) ??
    priceOf(c.slots.filter((s) => s.time < "14:00")) ??
    priceOf(c.slots)
  );
}

// 최저가가 2개 미만인 경우(단 1개) 할인 슬롯으로 간주 → 오렌지 하이라이트
export function discountTimes(slots: Slot[]): Set<string> {
  const priced = slots.filter((s): s is Slot & { price: number } => s.price !== null);
  if (priced.length === 0) return new Set();
  const minPrice = Math.min(...priced.map((s) => s.price));
  const minSlots = priced.filter((s) => s.price === minPrice);
  if (minSlots.length < 2) return new Set(minSlots.map((s) => s.time));
  return new Set();
}

export function formatTime(hhmm: string): string {
  const [h, m] = hhmm.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, "0")} ${period}`;
}

export function formatDate(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  });
}
