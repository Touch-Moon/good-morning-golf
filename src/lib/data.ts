import latest from "../../data/latest.json";

export type Slot = {
  time: string;
  price: number | null;
  is_hot_deal: boolean;
};

export type Status = "green" | "yellow" | "red" | "error";

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
  consecutive_slots: { time: string }[][];
  earliest_slot: string | null;
  earliest_2team: string | null;
};

export type CrawlRun = {
  target_date: string;
  results: CourseResult[];
};

const STATUS_ORDER: Record<Status, number> = {
  green: 0,
  yellow: 1,
  red: 2,
  error: 3,
};

export function getLatestRun(): CrawlRun {
  const run = latest as CrawlRun;
  const sorted = [...run.results].sort((a, b) => {
    const s = STATUS_ORDER[a.status] - STATUS_ORDER[b.status];
    if (s !== 0) return s;
    const ap = lowestPrice(a) ?? a.fallback_price ?? 9999;
    const bp = lowestPrice(b) ?? b.fallback_price ?? 9999;
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
