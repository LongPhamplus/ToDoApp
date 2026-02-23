// app/composables/useLunarCalendar.ts
// Wraps vietnamese-lunar-calendar package
// https://github.com/tiendat77/vietnamese-lunar-calendar

import { LunarDate, Calendar, type CalendarDay } from 'vietnamese-lunar-calendar'

export type { CalendarDay }
export { LunarDate, Calendar }

/** Tên Can (Thiên Can) */
const CAN = ['Canh', 'Tân', 'Nhâm', 'Quý', 'Giáp', 'Ất', 'Bính', 'Đinh', 'Mậu', 'Kỷ']

/** Tên Chi (Địa Chi) */
const CHI = ['Thân', 'Dậu', 'Tuất', 'Hợi', 'Tý', 'Sửu', 'Dần', 'Mão', 'Thìn', 'Tỵ', 'Ngọ', 'Mùi']

/** Tên tháng âm lịch */
export const LUNAR_MONTHS = [
  'Giêng', 'Hai', 'Ba', 'Tư', 'Năm', 'Sáu',
  'Bảy', 'Tám', 'Chín', 'Mười', 'Mười Một', 'Chạp',
]

/** Chuyển số tháng âm sang tên */
export function lunarMonthName(month: number, isLeap = false): string {
  return (isLeap ? 'Nhuận ' : '') + (LUNAR_MONTHS[month - 1] ?? `T${month}`)
}

/** Trả về LunarDate cho một ngày dương lịch */
export function toLunar(date: Date): LunarDate {
  return new LunarDate(date)
}

/** Trả về đối tượng Calendar (theo tuần) cho năm/tháng dương lịch */
export function toCalendar(year: number, month: number): Calendar {
  return new Calendar(year, month)
}

/** Format ngày âm đầy đủ: "18 tháng Giêng năm Giáp Thìn" */
export function formatLunarFull(lunar: LunarDate): string {
  const monthName = lunarMonthName(lunar.month)
  return `${lunar.date} tháng ${monthName} năm ${lunar.lunarYear}`
}

/** Format ngắn: "18/1 Giáp Thìn" */
export function formatLunarShort(lunar: LunarDate): string {
  return `${lunar.date}/${lunar.month} ${lunar.lunarYear}`
}

export function useLunarCalendar() {
  return { toLunar, toCalendar, formatLunarFull, formatLunarShort, lunarMonthName, LUNAR_MONTHS }
}
