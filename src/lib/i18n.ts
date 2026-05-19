export type Locale = "en" | "ko";

export const DEFAULT_LOCALE: Locale = "en";
export const LOCALE_COOKIE = "lang";

export const dict = {
  en: {
    site: { title: "Good Morning Golf" },
    nav: { thisWeek: "This Week", hotdeals: "Hot Deals", history: "History" },
    list: {
      filterAll: "All",
      filterAvailable: "Available",
      filterAfternoon: "Afternoon",
      sortAlpha: "A–Z",
      sortDistance: "Distance",
      sortPrice: "Price",
      viewList: "List",
      viewCard: "Card",
    },
    main: {
      courses: (n: number) => `${n} courses`,
      available: (n: number) => `${n} available`,
      footer: "Updated weekly · Golf courses near Winnipeg",
    },
    card: {
      teeTimes: "Tee times",
      priceLowest: "Lowest",
      priceRange: "Price range",
      perPerson: "/person",
      inquiry: "Inquiry",
      book: "Book",
      bookOnline: "Book online",
      cartMandatory: "Cart required",
      cartOptional: "Cart optional",
      cartIncluded: "Cart included",
    },
    status: {
      green: "Available",
      afternoon: "Afternoon only",
      yellow: "Inaccessible",
      red: "No slots",
      error: "Error",
    },
    announcement: { venue: "Venue", time: "Time", attending: "Attending" },
    hotdeals: {
      title: "Hot Deals",
      countFound: (n: number) => `Discounts found at ${n} courses`,
      noneActive: "No hot deals at the moment",
      emptyTitle: "No hot deals this week.",
      emptySub: "GolfNow specials and lowest-price slots will appear here.",
      footer: "Based on GolfNow and individual course websites · Updated weekly",
    },
    history: {
      title: "History",
      desc: "Past weekly announcements.",
      empty: "No past announcements.",
      active: "Active",
      inactive: "Inactive",
      expired: "Expired",
    },
    lang: { toggleToKorean: "한국어", toggleToEnglish: "English" },
  },
  ko: {
    site: { title: "Good Morning Golf" },
    nav: { thisWeek: "이번 주", hotdeals: "핫딜", history: "히스토리" },
    list: {
      filterAll: "전체",
      filterAvailable: "예약가능",
      filterAfternoon: "오후가능",
      sortAlpha: "알파벳순",
      sortDistance: "거리순",
      sortPrice: "가격순",
      viewList: "리스트",
      viewCard: "카드",
    },
    main: {
      courses: (n: number) => `전체 ${n}개 코스`,
      available: (n: number) => `${n}개 예약 가능`,
      footer: "매주 갱신 · Winnipeg 인근 골프 코스",
    },
    card: {
      teeTimes: "티타임",
      priceLowest: "최저가",
      priceRange: "가격대",
      perPerson: "/인",
      inquiry: "문의",
      book: "예약",
      bookOnline: "온라인 예약",
      cartMandatory: "카트 필수",
      cartOptional: "카트 선택",
      cartIncluded: "카트비 포함",
    },
    status: {
      green: "예약 가능",
      afternoon: "오후만 가능",
      yellow: "접속 불가",
      red: "슬롯 없음",
      error: "오류",
    },
    announcement: { venue: "장소", time: "시간", attending: "참가인원" },
    hotdeals: {
      title: "핫딜",
      countFound: (n: number) => `${n}개 코스에서 할인 발견`,
      noneActive: "현재 등록된 핫딜 없음",
      emptyTitle: "이번 주 핫딜이 없습니다.",
      emptySub: "GolfNow 특가 및 최저가 슬롯이 등록되면 여기에 표시됩니다.",
      footer: "GolfNow 및 개별 코스 웹사이트 기준 · 매주 갱신",
    },
    history: {
      title: "히스토리",
      desc: "지난 주간 공지사항을 모아 봅니다.",
      empty: "지난 공지사항이 없습니다.",
      active: "활성",
      inactive: "비활성",
      expired: "만료됨",
    },
    lang: { toggleToKorean: "한국어", toggleToEnglish: "English" },
  },
} as const;

export type Dict = (typeof dict)[Locale];

export function formatDateLocalized(iso: string, locale: Locale): string {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString(locale === "ko" ? "ko-KR" : "en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  });
}
