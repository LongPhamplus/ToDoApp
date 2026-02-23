// app/composables/useHolidays.ts

// Shape returned by Tallyfy National Holidays API
interface TallyfyHoliday {
  date: string          // "YYYY-MM-DD"
  name: string          // English name
  local_name: string    // Vietnamese name
  type: string          // "national"
  observed_date: string
  description?: string
}

interface TallyfyResponse {
  country: { code: string; name: string }
  year: number
  holidays: TallyfyHoliday[]
}

// Normalised shape used throughout the app
export interface Holiday {
  date: string        // "YYYY-MM-DD"
  localName: string   // Vietnamese name  (local_name)
  name: string        // English name
  description?: string
}

const BASE_URL = 'https://tallyfy.com/national-holidays/api/VN'

// Module-level cache shared across all composable instances
const cache = new Map<number, Holiday[]>()
const loading = ref(false)
const error = ref<string | null>(null)

export function useHolidays() {
  async function fetchYear(year: number): Promise<Holiday[]> {
    if (cache.has(year)) return cache.get(year)!

    loading.value = true
    error.value = null
    try {
      const data = await $fetch<TallyfyResponse>(`${BASE_URL}/${year}.json`)
      const normalised: Holiday[] = (data.holidays ?? []).map(h => ({
        date: h.date,
        localName: h.local_name,
        name: h.name,
        description: h.description,
      }))
      cache.set(year, normalised)
      return normalised
    } catch (e: any) {
      error.value = e?.message || 'Failed to fetch holidays'
      return []
    } finally {
      loading.value = false
    }
  }

  /** Pre-fetch multiple years in parallel */
  async function ensureYears(...years: number[]) {
    await Promise.all(years.map(fetchYear))
  }

  /** Sync lookup from cache for a specific YYYY-MM-DD string */
  function getForDate(dateStr: string): Holiday[] {
    const year = parseInt(dateStr.slice(0, 4))
    return (cache.get(year) ?? []).filter(h => h.date === dateStr)
  }

  /** Sync lookup from cache for a JS Date object */
  function getForDay(date: Date): Holiday[] {
    return getForDate(toDateStr(date))
  }

  return { loading, error, fetchYear, ensureYears, getForDate, getForDay }
}

export function toDateStr(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}
