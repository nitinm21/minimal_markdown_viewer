import type { Tab } from '../types'

const TABS_KEY = 'mdv:tabs'
const ACTIVE_KEY = 'mdv:activeTabId'

export function loadTabs(): { tabs: Tab[]; activeId: string | null } {
  try {
    const raw = localStorage.getItem(TABS_KEY)
    const activeId = localStorage.getItem(ACTIVE_KEY)
    if (!raw) return { tabs: [], activeId: null }
    const tabs = JSON.parse(raw) as Tab[]
    if (!Array.isArray(tabs)) return { tabs: [], activeId: null }
    return { tabs, activeId }
  } catch {
    return { tabs: [], activeId: null }
  }
}

export function saveTabs(tabs: Tab[], activeId: string | null) {
  try {
    localStorage.setItem(TABS_KEY, JSON.stringify(tabs))
    if (activeId) localStorage.setItem(ACTIVE_KEY, activeId)
    else localStorage.removeItem(ACTIVE_KEY)
  } catch {
    // ignore quota / private mode errors
  }
}
